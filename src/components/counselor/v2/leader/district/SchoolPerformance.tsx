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
// - At 375px the table is stacked rows: name, status, then three measures in
//   one line (the sorted measure first, so what you sort by is visible).

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { GLASS_CARD } from "../../../surfaces";
import {
  GRADE_OPTIONS,
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
import { EYEBROW, ROWS, SchoolCell, SchoolRow, StatusChip, StatusDot, STATUS_COLOR, TableHead, pts, useOpenSchool } from "./districtKit";

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

export function SchoolPerformance() {
  const open = useOpenSchool();
  const [grade, setGrade] = useState<GradeFilter>("all");
  const [status, setStatus] = useState<SchoolStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SchoolSortKey>(SCHOOL_PERFORMANCE_COPY.defaultSort);

  const rows = useMemo(() => {
    const found = filterSchools(SCHOOLS, { status, query });
    const sorted = sortSchools(found, sort, grade);
    // The Replit sorts name Z to A; A to Z is what a person expects.
    return sort === "school" ? sorted.reverse() : sorted;
  }, [status, query, sort, grade]);
  // The status strip counts the filtered set, as the Replit's does.
  const counts = useMemo(() => statusCounts(rows), [rows]);

  const q = query.trim();
  const clear = () => { setGrade("all"); setStatus("all"); setQuery(""); };
  const gradeId = String(grade);

  // The three measures a phone row shows: the sorted measure first.
  const phoneKeys: Metric[] = useMemo(() => {
    const first = METRICS.some((m) => m.key === sort) ? [sort as Metric] : [];
    return [...first, ...(["career", "planning", "postsecondary"] as Metric[]).filter((k) => k !== first[0])].slice(0, 3);
  }, [sort]);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <section aria-label="Filter view" className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-[110px_repeat(3,minmax(0,1fr))] xl:grid-cols-[110px_repeat(3,minmax(0,1fr))_minmax(0,1.3fr)]">
          <div className="flex flex-col gap-[6px]">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Academic year</span>
            {/* One year only: a label, not a control. */}
            <span className="flex h-9 items-center rounded-[var(--radius-sm)] border px-[10px] text-[13px] font-semibold" style={FIELD_STYLE}>{SCHOOL_PERFORMANCE_COPY.academicYearOptions[0]}</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Grade</span>
            <Listbox ariaLabel="Grade" value={gradeId} onChange={(v) => setGrade(v === "all" ? "all" : (Number(v) as GradeFilter))} options={GRADE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))} className={FIELD} style={FIELD_STYLE} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>School status</span>
            <Listbox ariaLabel="School status" value={status} onChange={(v) => setStatus(v as SchoolStatus | "all")} options={SCHOOL_PERFORMANCE_COPY.statusOptions.map((o) => ({ value: o.value, label: o.label }))} className={FIELD} style={FIELD_STYLE} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Sort</span>
            <Listbox ariaLabel="Sort schools" value={sort} onChange={(v) => setSort(v as SchoolSortKey)} options={SORT_OPTIONS} className={FIELD} style={FIELD_STYLE} />
          </div>
          <div className="col-span-2 flex flex-col gap-[6px] md:col-span-4 xl:col-span-1">
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

      <section aria-label="Schools" className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={GLASS_CARD}>
        {rows.length === 0 ? (
          <div className="flex flex-col items-start gap-[var(--space-3)] p-[var(--space-2)]">
            <p className="text-[13px] leading-[19px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {q ? `No school name contains “${q}”` : `No schools are marked ${SCHOOL_STATUS_LABELS[status as SchoolStatus].filter.toLowerCase()}`}
              {q && status !== "all" ? ` among ${SCHOOL_STATUS_LABELS[status].filter.toLowerCase()} schools` : ""}. {SCHOOL_PERFORMANCE_COPY.empty.body}
            </p>
            <button type="button" onClick={clear} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-bold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{SCHOOL_PERFORMANCE_COPY.empty.clearLabel}</button>
          </div>
        ) : (
          <div className="dm-scroll overflow-x-auto">
            <div className="md:min-w-[780px]">
              <TableHead
                template={TEMPLATE}
                labels={[{ label: "School" }, { label: "Status" }, ...METRICS.map((m) => ({ label: m.short, align: "right" as const }))]}
              />
              <p className="hidden px-[10px] pb-[8px] text-[11.5px] font-semibold md:block" style={{ color: "var(--muted-foreground)" }}>
                Each measure shows the current % for {gradeLabel(grade)}, then the change vs launch baseline.
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
                        <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                          {phoneKeys.map((k, i) => (
                            <span key={k}>{i > 0 && " · "}{METRICS.find((x) => x.key === k)!.phone} <span className="font-bold" style={{ color: "var(--foreground)" }}>{m[k]}%</span></span>
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
