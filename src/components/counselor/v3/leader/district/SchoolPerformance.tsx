"use client";

// SchoolPerformance: how does every school compare, and who needs support?
// DEMO-ONLY v3 (2 Oct 2026). Implements NOTES.md 3.2 (School Performance).
//
// Deliberate deviations from the Replit, with the WHY:
// - The TREND column is cut: it is the planning change since launch, which
//   already prints under the Planning value. One number, one place.
// - Per-cell (i) tooltips are cut (the same definition on every cell). The
//   measure definitions live in the shell's Data definitions panel.
// - Status pills are neutral chips with a green / blue / amber dot.
// - Empty state follows the playbook (tier 5): one plain line naming what was
//   searched, plus the Replit's Clear filters button.
// - One tab row: one tab per measure plus All measures. A measure tab is a
//   bullet chart per school (value bar, launch-baseline tick, dashed district
//   line): "ahead of or behind the district, and how far it moved" without
//   arithmetic. Sort shows only on All measures; on a measure tab the order
//   IS that measure, high to low.
//
// 2 Oct 2026 redundancy pass (this screen is the one home for "each school's
// value on each measure, ranked"):
// - Added a Professional tab: Student Outcomes' By school comparison (now
//   cut there) was the only place professional exposure showed per school.
//   Change shows only where it was observed (`deltaEstimated` is false), and
//   only for all grades: there is no grade split for this measure.
// - The status Listbox and the status count strip were one fact shown twice.
//   They are now one row of filter chips with counts (counts follow the
//   search, so they never contradict the list).
// - Cut: the single-value Academic year field and the "Data period" line (the
//   year is in the header meta and Data definitions), the "N of 11 in view"
//   line (the selected chip's count says it), the "for all grades, high to
//   low" line (the grade picker and the bars say it) and the two explanatory
//   paragraphs on All measures (what a cell holds is in Data definitions).
// - All measures is a heat-style table: each cell is shaded by its value, so
//   a school's strong and weak measures read across a row at a glance
//   (per-school comparison across measures; direct feedback "Why is
//   everything a bar chart?").

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
  schoolMetricsForGrade,
  sortSchools,
  statusCounts,
  type GradeFilter,
  type LeaderSchool,
  type SchoolSortKey,
  type SchoolStatus,
} from "@/lib/leaderData";
import { EYEBROW, MeasureTrack, ROWS, SchoolCell, SchoolRow, StatusChip, StatusDot, STATUS_COLOR, TableHead, pts, useOpenSchool } from "./districtKit";

const FIELD = "flex h-9 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
const FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

type GradedMetric = "career" | "postsecondary" | "experiential" | "planning";
type Metric = GradedMetric | "professional";
const METRICS: { key: Metric; short: string; phone: string }[] = [
  { key: "career", short: "Career", phone: "Career" },
  { key: "postsecondary", short: "Postsecondary", phone: "Postsec." },
  { key: "experiential", short: "Experiential", phone: "Exper." },
  { key: "professional", short: "Professional", phone: "Prof." },
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

const TEMPLATE = "md:grid-cols-[minmax(0,1fr)_132px_repeat(5,96px)]";

type Tab = Metric | "all";
const TAB_OPTIONS: { key: Tab; label: string }[] = [...METRICS.map((m) => ({ key: m.key as Tab, label: m.short })), { key: "all", label: "All measures" }];
const MEASURE_NAME: Record<Metric, string> = { career: "career exploration", postsecondary: "postsecondary exploration", experiential: "experiential learning", professional: "professional exposure", planning: "planning milestones" };
// Attention first: Support needed leads the chips.
const STATUS_ORDER: SchoolStatus[] = ["support", "meeting", "above"];

/** The district rollup for a measure, moved by the same grade offset every school gets. Professional has no grade split. */
function districtValue(metric: Metric, grade: GradeFilter): number {
  const base = OUTCOME_METRICS.find((o) => o.id === metric)!.rollup.value;
  if (grade === "all" || metric === "professional") return base;
  return Math.max(0, Math.min(100, base + GRADE_OFFSETS[grade][metric]));
}

/** A school's value on a measure under the grade filter (professional: all grades only). */
function valueOf(s: LeaderSchool, metric: Metric, grade: GradeFilter): number {
  return metric === "professional" ? s.professional.value : schoolMetricsForGrade(s, grade)[metric];
}

/** The change since launch, or null where it is estimated, not observed. */
function deltaOf(s: LeaderSchool, metric: Metric): number | null {
  return metric === "professional" && s.professional.deltaEstimated ? null : s[metric].delta;
}

/** Heat shade for an All measures cell: one blue, stronger with the value. */
const heat = (v: number) => `color-mix(in srgb, var(--primary) ${Math.round(4 + Math.max(0, Math.min(1, (v - 40) / 60)) * 36)}%, transparent)`;

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

  // Chip counts follow the search but not the status, so every chip keeps its number.
  const searched = useMemo(() => filterSchools(SCHOOLS, { query }), [query]);
  const counts = useMemo(() => statusCounts(searched), [searched]);
  const found = useMemo(() => filterSchools(searched, { status }), [searched, status]);
  // Table order: the Sort control (All measures tab only).
  const rows = useMemo(() => {
    const sorted = sortSchools(found, sort, grade);
    // The Replit sorts name Z to A; A to Z is what a person expects.
    return sort === "school" ? sorted.reverse() : sorted;
  }, [found, sort, grade]);
  // Chart order: the tab's own measure, high to low. Sort does not apply here.
  const ranked = useMemo(() => (tab === "all" ? rows : [...found].sort((a, b) => valueOf(b, tab, grade) - valueOf(a, tab, grade))), [found, tab, grade, rows]);

  const q = query.trim();
  const clear = () => { setGrade("all"); setStatus("all"); setQuery(""); };
  const gradeId = String(grade);

  // The five measures a phone row shows: the sorted measure first.
  const phoneKeys: Metric[] = useMemo(() => {
    const first = METRICS.some((m) => m.key === sort) ? [sort as Metric] : [];
    return [...first, ...METRICS.map((m) => m.key).filter((k) => k !== first[0])];
  }, [sort]);

  const chip = (key: SchoolStatus | "all", label: string, n: number) => {
    const on = status === key;
    return (
      <button
        key={key}
        type="button"
        aria-pressed={on}
        onClick={() => setStatus(key)}
        className="dm-quiet flex h-9 cursor-pointer items-center gap-[7px] rounded-full border px-[12px] text-[13px] font-semibold whitespace-nowrap"
        style={{ background: on ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "var(--glass-surface-1)", borderColor: on ? "color-mix(in srgb, var(--primary) 55%, var(--glass-border))" : "var(--glass-border)", color: "var(--foreground)" }}
      >
        {key !== "all" && <StatusDot color={STATUS_COLOR[key]} />}
        {label}
        <span className="font-extrabold tabular-nums">{n}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <section aria-label="Filter view" className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={GLASS_CARD}>
        <div role="group" aria-label="School status" className="flex flex-wrap items-center gap-[8px]">
          {chip("all", "All", searched.length)}
          {STATUS_ORDER.map((k) => chip(k, SCHOOL_STATUS_LABELS[k].filter, counts[k]))}
        </div>
        <p className="sr-only" aria-live="polite">{SCHOOL_PERFORMANCE_COPY.inViewLabel(rows.length)}</p>
        <div className="flex w-full flex-wrap items-center gap-[8px] sm:w-auto">
          <div className="w-[140px] flex-none">
            <Listbox ariaLabel="Grade" value={gradeId} onChange={(v) => setGrade(v === "all" ? "all" : (Number(v) as GradeFilter))} options={GRADE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))} className={FIELD} style={FIELD_STYLE} />
          </div>
          <span className="relative block min-w-[180px] flex-1 sm:w-[240px] sm:flex-none">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-[10px] h-[14px] w-[14px] -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input type="search" aria-label="Search by school name" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={SCHOOL_PERFORMANCE_COPY.searchPlaceholder} className="h-9 w-full rounded-[var(--radius-sm)] border pr-[10px] pl-[32px] text-[13px] font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]" style={FIELD_STYLE} />
          </span>
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
            {/* The legend: needed to read the marks, so it stays. */}
            <p className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] px-[10px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-[6px]">
                <span aria-hidden className="h-[12px] w-[2px] rounded-[1px]" style={{ background: "color-mix(in srgb, var(--foreground) 70%, transparent)" }} />
                Launch baseline
              </span>
              <span className="flex items-center gap-[6px]">
                <span aria-hidden className="h-[14px] w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "color-mix(in srgb, var(--foreground) 85%, transparent)" }} />
                District {districtValue(tab, grade)}%
              </span>
              {tab === "professional" && <span>All grades only · change shown where observed</span>}
            </p>
            <div className={ROWS}>
              {ranked.map((s) => {
                const enrollment = tab === "professional" ? s.enrollment : schoolMetricsForGrade(s, grade).enrollment;
                const cur = valueOf(s, tab, grade);
                const delta = deltaOf(s, tab);
                return (
                  <SchoolRow key={s.id} school={s} onOpen={open} label={`Open ${s.name}. ${SCHOOL_STATUS_LABELS[s.status].pill}. ${MEASURE_NAME[tab]} ${cur}%${delta === null ? "" : `, ${pts(delta)} since launch`}, district ${districtValue(tab, grade)}%`}>
                    <span className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[12px] gap-y-[2px] md:grid-cols-[minmax(0,300px)_minmax(0,1fr)_88px] md:gap-x-[20px]">
                      <span className="flex items-start gap-[10px] md:col-start-1 md:row-start-1">
                        <span className="mt-[5px] flex flex-none"><StatusDot color={STATUS_COLOR[s.status]} /></span>
                        <SchoolCell school={s} students={enrollment} />
                      </span>
                      <span className="flex flex-col items-end gap-[3px] md:col-start-3 md:row-start-1">
                        <span className="text-[16px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{cur}%</span>
                        {delta !== null && <span className="text-[11.5px] leading-[1.2] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{pts(delta)}</span>}
                      </span>
                      <span className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1">
                        <MeasureTrack value={cur} baseline={delta === null ? undefined : cur - delta} district={districtValue(tab, grade)} />
                      </span>
                    </span>
                  </SchoolRow>
                );
              })}
            </div>
          </div>
        ) : (
          <div role="tabpanel" aria-label="All measures" className="dm-scroll overflow-x-auto">
            <div className="md:min-w-[860px]">
              <TableHead
                template={TEMPLATE}
                labels={[{ label: "School" }, { label: "Status" }, ...METRICS.map((m) => ({ label: m.short, align: "right" as const }))]}
              />
              <div className={ROWS}>
                {rows.map((s) => {
                  const m = schoolMetricsForGrade(s, grade);
                  // Professional exposure has no grade split: shown for all grades only.
                  const cell = (k: Metric): { value: number | null; delta: number | null } =>
                    k === "professional" && grade !== "all" ? { value: null, delta: null } : { value: valueOf(s, k, grade), delta: deltaOf(s, k) };
                  return (
                    <SchoolRow key={s.id} school={s} onOpen={open}>
                      <span className={`hidden items-center gap-[12px] md:grid ${TEMPLATE}`}>
                        <SchoolCell school={s} students={m.enrollment} />
                        <StatusChip status={s.status} />
                        {METRICS.map((k) => {
                          const c = cell(k.key);
                          return (
                            <span key={k.key} className="flex h-[46px] flex-col items-end justify-center gap-[3px] rounded-[var(--radius-sm)] px-[10px]" style={{ background: c.value === null ? undefined : heat(c.value) }} title={c.value === null ? "No grade split for this measure" : undefined}>
                              <span className="text-[16px] leading-[1] font-extrabold tabular-nums" style={{ color: c.value === null ? "var(--muted-foreground)" : "var(--foreground)" }}>{c.value === null ? "n/a" : `${c.value}%`}</span>
                              {c.delta !== null && <span className="text-[11.5px] leading-[1.2] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{pts(c.delta)}</span>}
                            </span>
                          );
                        })}
                      </span>
                      <span className="flex flex-col gap-[6px] md:hidden">
                        <SchoolCell school={s} students={m.enrollment} />
                        <StatusChip status={s.status} />
                        {/* All five measures with their change, sorted measure first. */}
                        <span className="grid grid-cols-2 gap-x-[12px] gap-y-[4px] text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                          {phoneKeys.map((k) => {
                            const c = cell(k);
                            return (
                              <span key={k}>{METRICS.find((x) => x.key === k)!.phone} <span className="font-bold" style={{ color: "var(--foreground)" }}>{c.value === null ? "n/a" : `${c.value}%`}</span>{c.delta !== null && <> <span className="font-bold" style={{ color: "var(--primary)" }}>+{c.delta.toFixed(1)}</span></>}</span>
                            );
                          })}
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
