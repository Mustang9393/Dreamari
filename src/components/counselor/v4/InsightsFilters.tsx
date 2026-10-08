"use client";

// Persistent Insights filters (9 Oct 2026, Maisha: "Counselors should be
// able to filter the entire section without repeatedly resetting context").
// One row of the same dropdowns the rest of v4's headers use, in the page
// heading of all four Insights pages, so the scope reads the same wherever
// the counselor goes. The store and what each filter means live in
// insightsScope.tsx.
//
// My Impact hides School Year: its report already has a Reporting Period
// picker (the semester the two reports print), and two time controls on one
// page would disagree. The year stays set and returns on the next page.

import { useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { Listbox } from "./Listbox";
import { DEFAULT_FILTER, GRADES, SCHOOL_YEARS, STUDENT_GROUPS, classOf, setInsightsFilter, useInsightsFilter, type GradeKey, type GroupKey, type SchoolYearKey } from "./insightsScope";

const PANEL = { background: "var(--card)", color: "var(--foreground)" } as const;

export function InsightsFilters() {
  const view = useSearchParams().get("view");
  const f = useInsightsFilter();
  const reportPage = view === "impact" || view === "school-impact";
  const changed = f.grade !== DEFAULT_FILTER.grade || f.group !== DEFAULT_FILTER.group || (!reportPage && f.year !== DEFAULT_FILTER.year);
  return (
    <div className="v4-insights-filters" role="group" aria-label="Filter Insights">
      <Listbox ariaLabel="Grade and class year" value={f.grade} onChange={(v) => setInsightsFilter({ grade: v as GradeKey })} className="v4-grade-picker" panelStyle={PANEL}
        options={[{ value: "all", label: "All grades" }, ...GRADES.map((g) => ({ value: String(g), label: <span className="v4-filter-option">Grade {g}<small>Class of {classOf(g)}</small></span> }))]} />
      <Listbox ariaLabel="Student group" value={f.group} onChange={(v) => setInsightsFilter({ group: v as GroupKey })} className="v4-grade-picker" panelStyle={PANEL}
        options={[{ value: "all", label: "All groups" }, ...STUDENT_GROUPS.map((g) => ({ value: g, label: g }))]} />
      {!reportPage && (
        <Listbox ariaLabel="School year" value={f.year} onChange={(v) => setInsightsFilter({ year: v as SchoolYearKey })} className="v4-grade-picker" panelStyle={PANEL}
          options={SCHOOL_YEARS.map((y) => ({ value: y.key, label: y.back === 0 ? `${y.label} (now)` : y.label }))} />
      )}
      {changed && (
        <IconTip label="Clear filters">
          <button type="button" aria-label="Clear filters" onClick={() => setInsightsFilter(reportPage ? { grade: "all", group: "all" } : DEFAULT_FILTER)} className="v4-filter-reset dm-quiet">
            <RotateCcw size={15} aria-hidden />
          </button>
        </IconTip>
      )}
    </div>
  );
}
