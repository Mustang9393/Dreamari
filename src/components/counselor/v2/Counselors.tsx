"use client";

// DEMO-ONLY v2: Counselors (Lead Counselor and School Administrator). One
// question: which caseload needs support, and how. The seeded split lives in
// src/lib/counselorOrg.ts. Rows open Students filtered to that counselor
// (the shared counselorFilter in shell.tsx), so the two screens agree.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, SCHOOL_TARGETS, counselorFor, readinessMetrics, targetBand } from "@/lib/counselorOrg";
import { CardLink } from "../chips";
import { BAND_COLORS, InitialsBadge, MetricRow, OverviewCard, Stat, Verdict } from "./overviewShared";
import { STATUS_COLORS } from "./Overview";

export function Counselors() {
  const router = useRouter();
  const { gradeFilter, setCounselorFilter } = useCounselorFilters();
  const reviewed = useReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);
  const rows = useMemo(() => SCHOOL_COUNSELORS
    .map((c) => ({ c, m: readinessMetrics(roster.filter((s) => counselorFor(s).id === c.id)) }))
    .filter((x) => x.m.students > 0)
    .sort((a, b) => a.m.onTrackPct - b.m.onTrackPct || (b.m.overdue + b.m.changesRequested) - (a.m.overdue + a.m.changesRequested)), [roster]);
  const school = readinessMetrics(roster);
  const first = rows[0];
  const band = first ? targetBand(first.m.onTrackPct, SCHOOL_TARGETS.onTrack) : "met";
  const largest = rows.reduce((a, b) => (b.m.students > a.m.students ? b : a), rows[0]);
  const smallest = rows.reduce((a, b) => (b.m.students < a.m.students ? b : a), rows[0]);

  const open = (id: string) => {
    setCounselorFilter(id);
    router.push("/counselor?view=students");
  };

  if (rows.length === 0) {
    return <p className="py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No students under the current filters.</p>;
  }

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap gap-[var(--space-6)]">
        <Stat value={String(rows.length)} label="counselors" />
        <Stat value={String(school.students)} label="students" />
        <Stat value={`${school.onTrackPct}%`} label="on track" />
        <Stat value={String(school.pendingReviews)} label="pending reviews" />
        <Stat value={String(school.overdue)} label="overdue" color={school.overdue > 0 ? STATUS_COLORS["At Risk"] : undefined} />
      </div>

      <OverviewCard title="Caseloads" unit="% on track" hero tint={BAND_COLORS[band]} aside={<CardLink onClick={() => { setCounselorFilter("All"); router.push("/counselor?view=students"); }}>Students</CardLink>}>
        <Verdict band={band}>{band === "met" ? "Every caseload is on target" : `${first.c.name}'s caseload needs the most support`}</Verdict>
        <div className="flex flex-col gap-[10px]">
          {rows.map(({ c, m }) => (
            <MetricRow
              key={c.id}
              leading={<InitialsBadge name={c.name} />}
              label={c.name}
              note={`${c.range} · ${m.students} students · ${m.pendingReviews} pending${m.overdue ? ` · ${m.overdue} overdue` : ""}`}
              value={m.onTrackPct}
              target={SCHOOL_TARGETS.onTrack}
              onClick={() => open(c.id)}
            />
          ))}
        </div>
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
        <OverviewCard title="Plans on file" unit="% with a declared path">
          <div className="flex flex-col gap-[10px]">
            {rows.slice().sort((a, b) => a.m.withPlanPct - b.m.withPlanPct).map(({ c, m }) => (
              <MetricRow key={c.id} label={c.name} note={`${m.withPlan} of ${m.students}`} value={m.withPlanPct} target={SCHOOL_TARGETS.plansOnFile} onClick={() => open(c.id)} />
            ))}
          </div>
        </OverviewCard>
        <OverviewCard title="Caseload size">
          {largest && smallest && largest.c.id !== smallest.c.id && (
            <Verdict band={largest.m.students - smallest.m.students >= 15 ? "near" : "met"}>
              {largest.m.students - smallest.m.students >= 15 ? `${largest.c.name} carries ${largest.m.students - smallest.m.students} more students than ${smallest.c.name}` : "Caseloads are balanced"}
            </Verdict>
          )}
          <div className="flex flex-col gap-[10px]">
            {rows.slice().sort((a, b) => b.m.students - a.m.students).map(({ c, m }) => (
              <MetricRow key={c.id} label={c.name} note={c.range} value={Math.round((m.students / Math.max(1, school.students)) * 100)} target={0} onClick={() => open(c.id)} />
            ))}
          </div>
        </OverviewCard>
      </div>
    </div>
  );
}
