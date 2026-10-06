"use client";

// SchoolPerformance: how does every school compare, and who needs support?
// DEMO-ONLY data (2 Oct 2026, NOTES.md 3.2).
//
// Decisions kept from the v2 build (2 Oct 2026), with the WHY:
// - Sorting is a Sort select, not sortable column headers: headers do not
//   exist on a phone, and the Replit's headers sorted one direction only.
//   School name sorts A to Z (the Replit's Z to A reads as a bug). Status
//   puts Support needed first. On a measure tab the order IS that measure,
//   high to low, so Sort shows only on All measures.
// - The TREND column is cut: it is the planning change since launch, which
//   already prints under the Planning value.
// - Per-cell (i) tooltips are cut (one definition repeated on every cell);
//   the definitions live in the frame's Data definitions panel.
// - One tab row: Career, Postsecondary, Experiential, Planning, All
//   measures. Direct feedback: "just a LOT of numbers ... more DATA VIZ ...
//   but we cannot lose content from Maisha's replit". Each measure tab ranks
//   the schools in view; All measures is the full table.
// - A bar is the current % on a 0 to 100 scale, a short tick at the launch
//   baseline (current minus the "+x pts" change, so tick to bar end IS the
//   gain) and a dashed line at the district value for the same grade. The
//   grade filter moves bars and table alike (schoolMetricsForGrade).
// - Empty state follows the playbook: one plain line naming what was
//   searched, plus the Replit's Clear filters button, on every tab.
//
// v4 rebuild (6 Oct 2026). WHY: the screen was a v2 filter card with
// uppercase field labels, a glass card of extrabold numbers and gradient
// bars. Direct instruction: make the leader roles "like this version" (the
// counselor's v4) "in every aspect... layouts, graphics, spacing, the
// premium look". It is now the counselor's Student progress:
//   - The measure tabs are v4's underline tab row at the top of the page,
//     the filters a quiet toolbar of v4 selects and the search field under
//     it, with the in-view count, data period and status groups on the
//     toolbar's right (one line, as before).
//   - A measure tab is Student progress's report canvas: the district value
//     as the hero number on the left with what it means (schools in view,
//     below the district, highest, lowest), the eleven schools as Today's
//     lanes on the right with the launch tick and the dashed district line.
//   - All measures is a glass sheet holding the table as hairline rows
//     (the roster's quiet table), Sort in the sheet header, status as a dot
//     and a word. At 375px each row stacks: name, status, then all four
//     measures with their change, the sorted measure first.
//
// Maisha's v4 review (7 Oct 2026): every school's lane on a measure is the
// ONE series colour ("so there isn't too much competing for our
// attention"), status is a dot in the status colours (above green, meeting
// blue, support amber), the district value counts up, headers and tabs are
// Title Case.

import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Segmented } from "../../viz";
import { Listbox } from "../../Listbox";
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
import { CountUp, Sheet, StatusMark, titleCase } from "../kit";
import { DistrictAxis, LaneLegend, SchoolLane, SchoolName, SchoolStatusMark, STATUS_COLOR, pts, useOpenSchool } from "./districtKit";

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

type Tab = Metric | "all";
const TAB_OPTIONS: { key: Tab; label: string }[] = [
  { key: "career", label: "Career" },
  { key: "postsecondary", label: "Postsecondary" },
  { key: "experiential", label: "Experiential" },
  { key: "planning", label: "Planning" },
  { key: "all", label: "All Measures" },
];
const MEASURE_NAME: Record<Metric, string> = { career: "career exploration", postsecondary: "postsecondary exploration", experiential: "experiential learning", planning: "planning milestones" };
const TABLE_COLS = { "--dt-cols": "minmax(0,1fr) 124px repeat(4,minmax(78px,96px)) 14px" } as React.CSSProperties;

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

  // Built only when shown: with no status filter there is no status label to name.
  const empty = () => (
    <div className="v4-clear-state flex flex-col items-start gap-[14px]">
      <p>
        {q ? `No school name contains “${q}”` : `No schools are marked ${SCHOOL_STATUS_LABELS[status as SchoolStatus].filter.toLowerCase()}`}
        {q && status !== "all" ? ` among ${SCHOOL_STATUS_LABELS[status].filter.toLowerCase()} schools` : ""}. {SCHOOL_PERFORMANCE_COPY.empty.body}
      </p>
      <button type="button" onClick={clear} className="v4-secondary-action">{SCHOOL_PERFORMANCE_COPY.empty.clearLabel}</button>
    </div>
  );

  return (
    <div className="v4-page v4-leader-page">
      <Segmented<Tab> ariaLabel="School performance view" options={TAB_OPTIONS} value={tab} onChange={setTab} />

      <div className="v4-district-toolbar" aria-label="Filter view">
        <div>
          <Listbox ariaLabel="Grade" value={gradeId} onChange={(v) => setGrade(v === "all" ? "all" : (Number(v) as GradeFilter))} options={GRADE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))} />
          <Listbox ariaLabel="School status" value={status} onChange={(v) => setStatus(v as SchoolStatus | "all")} options={SCHOOL_PERFORMANCE_COPY.statusOptions.map((o) => ({ value: o.value, label: o.label }))} />
          <label className="v4-district-search">
            <Search size={14} aria-hidden />
            <input type="search" aria-label="Search by school name" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={SCHOOL_PERFORMANCE_COPY.searchPlaceholder} />
          </label>
        </div>
        <div aria-live="polite">
          <span className="v4-district-meta"><strong>{SCHOOL_PERFORMANCE_COPY.inViewLabel(rows.length)}</strong> · Academic year {SCHOOL_PERFORMANCE_COPY.academicYearOptions[0]} · {SCHOOL_PERFORMANCE_COPY.dataPeriodLine}</span>
          <span className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px]" aria-label="Status groups">
            {(Object.keys(SCHOOL_STATUS_LABELS) as SchoolStatus[]).map((k) => (
              <StatusMark key={k} color={STATUS_COLOR[k]}><b className="font-[550] tabular-nums">{counts[k]}</b> {SCHOOL_STATUS_LABELS[k].filter}</StatusMark>
            ))}
          </span>
        </div>
      </div>

      {tab !== "all" ? (
        <section className="v4-report-canvas v4-surface" role="tabpanel" aria-label={`${TAB_OPTIONS.find((t) => t.key === tab)!.label} ranking`}>
          <MeasureExplainer metric={tab} grade={grade} ranked={ranked} />
          <div className="flex min-w-0 flex-col justify-center">
            {ranked.length === 0 ? empty() : (
              <>
                <div className="v4-lane-heading"><span>Schools in View, High to Low</span><span>Current % · Change Since Launch</span></div>
                <div className="v4-district-lanes">
                  {ranked.map((s) => {
                    const m = schoolMetricsForGrade(s, grade);
                    const cur = m[tab];
                    const delta = s[tab].delta;
                    const d = districtValue(tab, grade);
                    return (
                      <SchoolLane
                        key={s.id}
                        school={s}
                        students={m.enrollment}
                        value={cur}
                        baseline={cur - delta}
                        district={d}
                        display={`${cur}%`}
                        sub={pts(delta)}
                        onOpen={() => open(s.id)}
                        aria={`Open ${s.name}. ${SCHOOL_STATUS_LABELS[s.status].pill}. ${MEASURE_NAME[tab]} ${cur}%, ${pts(delta)} since launch, district ${d}%`}
                      />
                    );
                  })}
                  <DistrictAxis />
                </div>
                <div className="mt-[18px]"><LaneLegend district={`District, ${districtValue(tab, grade)}%`} /></div>
              </>
            )}
          </div>
        </section>
      ) : (
        <Sheet
          title="All Measures"
          unit={`for ${gradeLabel(grade)}`}
          corner="br"
          aside={rows.length > 0 ? <Listbox ariaLabel="Sort schools" value={sort} onChange={(v) => setSort(v as SchoolSortKey)} options={SORT_OPTIONS} className="max-w-[260px]" /> : undefined}
        >
          {rows.length === 0 ? empty() : (
            <div className="v4-district-table" style={TABLE_COLS} role="tabpanel" aria-label="All measures">
              <div className="v4-district-thead" aria-hidden><span>School</span><span>Status</span>{METRICS.map((m) => <span key={m.key} className="v4-district-r">{m.short}</span>)}<span /></div>
              {rows.map((s) => {
                const m = schoolMetricsForGrade(s, grade);
                return (
                  <button key={s.id} type="button" className="v4-district-row" onClick={() => open(s.id)} aria-label={`Open ${s.name}. ${SCHOOL_STATUS_LABELS[s.status].pill}. ${METRICS.map((k) => `${MEASURE_NAME[k.key]} ${m[k.key]}%, ${pts(s[k.key].delta)}`).join(". ")}`}>
                    <SchoolName school={s} students={m.enrollment} />
                    <span className="v4-district-cell"><SchoolStatusMark status={s.status} /></span>
                    {METRICS.map((k) => (
                      <span key={k.key} className="v4-district-cell v4-district-num is-right"><strong>{m[k.key]}%</strong><small>{pts(s[k.key].delta)}</small></span>
                    ))}
                    <span className="v4-district-cell"><ArrowUpRight size={14} aria-hidden className="v4-district-go" /></span>
                    <span className="v4-district-phone">
                      <SchoolStatusMark status={s.status} />
                      {phoneKeys.map((k) => <span key={k}>{METRICS.find((x) => x.key === k)!.phone} <strong>{m[k]}%</strong> +{s[k].delta.toFixed(1)}</span>)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="v4-sheet-foot mt-auto"><span>Each measure shows the current % for {gradeLabel(grade)}, then the change vs launch baseline</span></div>
        </Sheet>
      )}
    </div>
  );
}

/** The canvas's left column: the district value as the hero number, and
 *  the four facts that place the schools against it. */
function MeasureExplainer({ metric, grade, ranked }: { metric: Metric; grade: GradeFilter; ranked: typeof SCHOOLS }) {
  const d = districtValue(metric, grade);
  const vals = ranked.map((s) => ({ s, v: schoolMetricsForGrade(s, grade)[metric] }));
  const below = vals.filter((x) => x.v < d).length;
  const hi = vals[0];
  const lo = vals[vals.length - 1];
  return (
    <div className="v4-report-explainer v4-district-explainer">
      <span className="v4-overline">District · {titleCase(gradeLabel(grade))}</span>
      <h2>{titleCase(MEASURE_NAME[metric])}</h2>
      <div className="v4-report-hero-number"><CountUp value={`${d}%`} /></div>
      <p>The district value for {gradeLabel(grade)}. The dashed line on every lane marks it.</p>
      <dl>
        <div><dt>Schools in view</dt><dd>{ranked.length} of {SCHOOLS.length}</dd></div>
        <div><dt>Below the district</dt><dd>{below}</dd></div>
        {hi && <div><dt>Highest</dt><dd>{hi.v}%</dd></div>}
        {lo && <div><dt>Lowest</dt><dd>{lo.v}%</dd></div>}
      </dl>
      <p className="v4-chart-note">High to low. Select a school to open it.</p>
    </div>
  );
}
