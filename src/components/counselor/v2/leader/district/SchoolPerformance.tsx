"use client";

// SchoolPerformance: how does every school compare, and who needs support?
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 3.2 (School Performance).
//
// Deliberate deviations from the Replit, with the WHY:
// - Sorting is a "Sort" select in the filter bar, not sortable column
//   headers. Headers do not exist on a phone (rows stack), and the Replit's
//   headers only ever sorted one direction. School name sorts A to Z here
//   (the Replit ended at Z to A, which reads as a bug). Status still puts
//   Support needed first.
// - The TREND column is cut: it is the planning change since launch, which
//   already prints under the Planning value. One number, one place.
// - Per-cell (i) tooltips are cut (the same definition on every cell). The
//   measure definitions live in the shell's Data definitions panel. The
//   per-cell "+X.X pts vs launch baseline" line stays, shortened to "+X.X pts"
//   under a column note.
// - Status groups strip and "Data period" line are one line inside the filter
//   card instead of two separate panels (density first).
// - Status pills are neutral chips with a green / blue / amber dot.
// - Empty state follows the playbook (tier 5): one plain line naming what was
//   searched, plus the Replit's Clear filters button.
// - At 375px the table is stacked rows: name, status, then all four measures
//   (each with its "+x pts") in a 2 x 2 grid, the sorted measure first, so what
//   you sort by is visible. (It showed three and no deltas before the
//   data-viz pass; the checklist found experiential could be missing.)
//
// Data-viz pass (2 Oct 2026). Direct feedback: "just a LOT of numbers ... split
// content into tabs where it makes sense ... represent data with more DATA VIZ
// ... but we cannot lose content from Maisha's replit". So:
// - The results card has ONE tab row: Career, Postsecondary, Experiential,
//   Planning, All measures. The table was 11 rows x 4 big numbers; a person
//   compares ONE measure at a time, so each measure tab is a ranked bar chart
//   of the schools in view. All measures is the unchanged table, so every
//   number the Replit shows is still one tab away (nothing was dropped; the
//   before/after checklist is in the audit log).
// - A bar is the current % (0 to 100 scale, so tabs compare honestly), a short
//   tick at the launch baseline (current minus the "+x pts" delta, so the gap
//   from tick to bar end IS the improvement) and a dashed line at the district
//   value for the same grade, so "ahead of or behind the district" reads
//   without arithmetic. The status dot keeps status visible on every row.
//   The grade filter moves the bars exactly as it moves the table
//   (schoolMetricsForGrade; the district line gets the same grade offset).
// - SORT: on a measure tab the order IS that measure, high to low, so a Sort
//   control would contradict the chart. Sort therefore lives in the results
//   card header and shows only on All measures, where it still drives the
//   table. (Hiding it beats a disabled control: a greyed listbox on three of
//   five tabs would read as a bug.) It moved out of the filter card for that
//   reason; the filter card keeps year, grade, status, search, count and the
//   status groups.
// - The empty state is unchanged and shows on every tab.

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { GLASS_CARD } from "../../../surfaces";
import {
  GRADE_OFFSETS,
  GRADE_OPTIONS,
  OUTCOME_METRICS,
  SCHOOLS,
  SCHOOL_PERFORMANCE_COPY,
  SCHOOL_STATUS_LABELS,
  filterSchools,
  gradeLabel,
  schoolMetricsForGrade,
  sortSchools,
  statusCounts,
  type GradeFilter,
  type SchoolSortKey,
  type SchoolStatus,
} from "@/lib/leaderData";
import { EYEBROW, MeasureTrack, ROWS, SchoolCell, SchoolRow, StatusChip, StatusDot, STATUS_COLOR, TableHead, pts, useOpenSchool } from "./districtKit";

const FIELD = "flex h-9 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
const FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

type Metric = "career" | "postsecondary" | "experiential" | "planning";
const METRICS: { key: Metric; short: string; phone: string }[] = [
  { key: "career", short: "Career", phone: "Career" },
  { key: "postsecondary", short: "Postsecondary", phone: "Postsec." },
  { key: "experiential", short: "Experiential", phone: "Exper." },
  { key: "planning", short: "Planning", phone: "Planning" },
];

const SORT_OPTIONS: { value: SchoolSortKey; label: string }[] = [
  { value: "planning", label: "Planning, high to low" },
  { value: "career", label: "Career exploration, high to low" },
  { value: "postsecondary", label: "Postsecondary, high to low" },
  { value: "experiential", label: "Experiential, high to low" },
  { value: "status", label: "Status, support needed first" },
  { value: "school", label: "School name, A to Z" },
];

const TEMPLATE = "md:grid-cols-[minmax(0,1fr)_132px_repeat(4,108px)]";

type Tab = Metric | "all";
const TAB_OPTIONS: { key: Tab; label: string }[] = [
  { key: "career", label: "Career" },
  { key: "postsecondary", label: "Postsecondary" },
  { key: "experiential", label: "Experiential" },
  { key: "planning", label: "Planning" },
  { key: "all", label: "All measures" },
];
const MEASURE_NAME: Record<Metric, string> = { career: "career exploration", postsecondary: "postsecondary exploration", experiential: "experiential learning", planning: "planning milestones" };

/** The district rollup for a measure, moved by the same grade offset every school gets. */
function districtValue(metric: Metric, grade: GradeFilter): number {
  const base = OUTCOME_METRICS.find((o) => o.id === metric)!.rollup.value;
  if (grade === "all") return base;
  return Math.max(0, Math.min(100, base + GRADE_OFFSETS[grade][metric]));
}

export function SchoolPerformance() {
  const open = useOpenSchool();
  const [grade, setGrade] = useState<GradeFilter>("all");
  const [status, setStatus] = useState<SchoolStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SchoolSortKey>(SCHOOL_PERFORMANCE_COPY.defaultSort);
  const [tab, setTab] = useState<Tab>("career");

  // On a phone the tab row scrolls sideways: keep the chosen tab in view.
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    tabsRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [tab]);

  const found = useMemo(() => filterSchools(SCHOOLS, { status, query }), [status, query]);
  // Table order: the Sort control (All measures tab only).
  const rows = useMemo(() => {
    const sorted = sortSchools(found, sort, grade);
    // The Replit sorts name Z to A; A to Z is what a person expects.
    return sort === "school" ? sorted.reverse() : sorted;
  }, [found, sort, grade]);
  // Chart order: the tab's own measure, high to low. Sort does not apply here.
  const ranked = useMemo(() => (tab === "all" ? rows : sortSchools(found, tab, grade)), [found, tab, grade, rows]);
  // The status strip counts the filtered set, as the Replit's does.
  const counts = useMemo(() => statusCounts(rows), [rows]);

  const q = query.trim();
  const clear = () => { setGrade("all"); setStatus("all"); setQuery(""); };
  const gradeId = String(grade);

  // The four measures a phone row shows: the sorted measure first.
  const phoneKeys: Metric[] = useMemo(() => {
    const first = METRICS.some((m) => m.key === sort) ? [sort as Metric] : [];
    return [...first, ...(["career", "postsecondary", "experiential", "planning"] as Metric[]).filter((k) => k !== first[0])];
  }, [sort]);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <section aria-label="Filter view" className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="flex flex-col gap-[6px]">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Academic year</span>
            {/* One year only: a label, not a control. */}
            <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[10px] text-[13px] font-semibold" style={FIELD_STYLE}>{SCHOOL_PERFORMANCE_COPY.academicYearOptions[0]}</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Grade</span>
            <Listbox ariaLabel="Grade" value={gradeId} onChange={(v) => setGrade(v === "all" ? "all" : (Number(v) as GradeFilter))} options={GRADE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))} className={FIELD} style={FIELD_STYLE} />
          </div>
          <div className="col-span-2 flex flex-col gap-[6px] md:col-span-1">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>School status</span>
            <Listbox ariaLabel="School status" value={status} onChange={(v) => setStatus(v as SchoolStatus | "all")} options={SCHOOL_PERFORMANCE_COPY.statusOptions.map((o) => ({ value: o.value, label: o.label }))} className={FIELD} style={FIELD_STYLE} />
          </div>
          <div className="col-span-2 flex flex-col gap-[6px] md:col-span-1">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Search</span>
            <span className="relative block">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-[10px] h-[14px] w-[14px] -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
              <input type="search" aria-label="Search by school name" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={SCHOOL_PERFORMANCE_COPY.searchPlaceholder} className="h-9 w-full rounded-[var(--radius-sm)] border pr-[10px] pl-[32px] text-[13px] font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]" style={FIELD_STYLE} />
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }} aria-live="polite">
            <span className="font-bold" style={{ color: "var(--foreground)" }}>{SCHOOL_PERFORMANCE_COPY.inViewLabel(rows.length)}</span> · {SCHOOL_PERFORMANCE_COPY.dataPeriodLine}
          </p>
          <ul className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px]" aria-label="Status groups">
            {(Object.keys(SCHOOL_STATUS_LABELS) as SchoolStatus[]).map((k) => (
              <li key={k} className="flex items-center gap-[7px] text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>
                <StatusDot color={STATUS_COLOR[k]} />
                <span className="font-extrabold tabular-nums">{counts[k]}</span>
                {SCHOOL_STATUS_LABELS[k].filter}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Schools" className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={GLASS_CARD}>
        {/* One tab row. Sort belongs to the table, so it only shows on All measures. */}
        <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[var(--space-3)]">
          <div ref={tabsRef} className="max-w-full">
            <Segmented<Tab> ariaLabel="School performance view" options={TAB_OPTIONS} value={tab} onChange={setTab} />
          </div>
          {tab === "all" && rows.length > 0 && (
            <div className="flex items-center gap-[8px]">
              <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Sort</span>
              <Listbox ariaLabel="Sort schools" value={sort} onChange={(v) => setSort(v as SchoolSortKey)} options={SORT_OPTIONS} className={`${FIELD} min-w-[230px]`} style={FIELD_STYLE} />
            </div>
          )}
        </div>
        {rows.length === 0 ? (
          <div className="flex flex-col items-start gap-[var(--space-3)] p-[var(--space-2)]">
            <p className="text-[13px] leading-[19px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {q ? `No school name contains “${q}”` : `No schools are marked ${SCHOOL_STATUS_LABELS[status as SchoolStatus].filter.toLowerCase()}`}
              {q && status !== "all" ? ` among ${SCHOOL_STATUS_LABELS[status].filter.toLowerCase()} schools` : ""}. {SCHOOL_PERFORMANCE_COPY.empty.body}
            </p>
            <button type="button" onClick={clear} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-bold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{SCHOOL_PERFORMANCE_COPY.empty.clearLabel}</button>
          </div>
        ) : tab !== "all" ? (
          <div role="tabpanel" aria-label={`${TAB_OPTIONS.find((t) => t.key === tab)!.label} ranking`} className="flex flex-col gap-[var(--space-3)]">
            <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[4px] px-[10px]">
              <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <span className="font-bold" style={{ color: "var(--foreground)" }}>{MEASURE_NAME[tab].charAt(0).toUpperCase() + MEASURE_NAME[tab].slice(1)}</span> for {gradeLabel(grade)}, high to low.
              </p>
              <p className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-[6px]">
                  <span aria-hidden className="h-[12px] w-[2px] rounded-[1px]" style={{ background: "color-mix(in srgb, var(--foreground) 70%, transparent)" }} />
                  Tick = launch baseline
                </span>
                <span className="flex items-center gap-[6px]">
                  <span aria-hidden className="h-[14px] w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "color-mix(in srgb, var(--foreground) 85%, transparent)" }} />
                  Line = district ({districtValue(tab, grade)}%)
                </span>
              </p>
            </div>
            <div className={ROWS}>
              {ranked.map((s) => {
                const m = schoolMetricsForGrade(s, grade);
                const cur = m[tab];
                const delta = s[tab].delta;
                return (
                  <SchoolRow key={s.id} school={s} onOpen={open} label={`Open ${s.name}. ${SCHOOL_STATUS_LABELS[s.status].pill}. ${MEASURE_NAME[tab]} ${cur}%, ${pts(delta)} since launch, district ${districtValue(tab, grade)}%`}>
                    <span className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[12px] gap-y-[2px] md:grid-cols-[minmax(0,300px)_minmax(0,1fr)_88px] md:gap-x-[20px]">
                      <span className="flex items-start gap-[10px] md:col-start-1 md:row-start-1">
                        <span className="mt-[5px] flex flex-none"><StatusDot color={STATUS_COLOR[s.status]} /></span>
                        <SchoolCell school={s} students={m.enrollment} />
                      </span>
                      <span className="flex flex-col items-end gap-[3px] md:col-start-3 md:row-start-1">
                        <span className="text-[16px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{cur}%</span>
                        <span className="text-[11.5px] leading-[1.2] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{pts(delta)}</span>
                      </span>
                      <span className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1">
                        <MeasureTrack value={cur} baseline={cur - delta} district={districtValue(tab, grade)} />
                      </span>
                    </span>
                  </SchoolRow>
                );
              })}
            </div>
          </div>
        ) : (
          <div role="tabpanel" aria-label="All measures" className="dm-scroll overflow-x-auto">
            <div className="md:min-w-[780px]">
              <TableHead
                template={TEMPLATE}
                labels={[{ label: "School" }, { label: "Status" }, ...METRICS.map((m) => ({ label: m.short, align: "right" as const }))]}
              />
              <p className="hidden px-[10px] pb-[8px] text-[11.5px] font-semibold md:block" style={{ color: "var(--muted-foreground)" }}>
                Each measure shows the current % for {gradeLabel(grade)}, then the change vs launch baseline.
              </p>
              <p className="px-[10px] pb-[8px] text-[11.5px] font-semibold md:hidden" style={{ color: "var(--muted-foreground)" }}>
                Current % for {gradeLabel(grade)}, then <span style={{ color: "var(--primary)" }}>pts vs launch baseline</span>.
              </p>
              <div className={ROWS}>
                {rows.map((s) => {
                  const m = schoolMetricsForGrade(s, grade);
                  return (
                    <SchoolRow key={s.id} school={s} onOpen={open}>
                      <span className={`hidden items-center gap-[12px] md:grid ${TEMPLATE}`}>
                        <SchoolCell school={s} students={m.enrollment} />
                        <StatusChip status={s.status} />
                        {METRICS.map((k) => (
                          <span key={k.key} className="flex flex-col items-end gap-[3px]">
                            <span className="text-[16px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{m[k.key]}%</span>
                            <span className="text-[11.5px] leading-[1.2] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{pts(s[k.key].delta)}</span>
                          </span>
                        ))}
                      </span>
                      <span className="flex flex-col gap-[6px] md:hidden">
                        <SchoolCell school={s} students={m.enrollment} />
                        <StatusChip status={s.status} />
                        {/* All four measures with their change, sorted measure first. */}
                        <span className="grid grid-cols-2 gap-x-[12px] gap-y-[4px] text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                          {phoneKeys.map((k) => (
                            <span key={k}>{METRICS.find((x) => x.key === k)!.phone} <span className="font-bold" style={{ color: "var(--foreground)" }}>{m[k]}%</span> <span className="font-bold" style={{ color: "var(--primary)" }}>+{s[k].delta.toFixed(1)}</span></span>
                          ))}
                        </span>
                      </span>
                    </SchoolRow>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
