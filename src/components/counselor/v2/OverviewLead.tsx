"use client";

// DEMO-ONLY v2: the Lead Counselor's Overview. Two questions, answered in
// one glance each: which counselor is behind, which grade is behind. Budget
// and color rules in ./overviewShared.tsx. Counselor split is seeded
// (src/lib/counselorOrg.ts).

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { StatRow } from "../chips";
import { useCounselorFilters } from "../shell";
import { useSchoolReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, SCHOOL_TARGETS, counselorFor, readinessMetrics, targetBand } from "@/lib/counselorOrg";
import { DonutCard, STATUS_COLORS } from "./Overview";
import { BAND_COLORS, InitialsBadge, MetricRow, OverviewCard, SeeLink, Stat, Verdict } from "./overviewShared";

const GRADES = [9, 10, 11, 12];

export function OverviewLead() {
  const router = useRouter();
  const { gradeFilter, setGradeFilter, setStatusFilter, setPlanFilter } = useCounselorFilters();
  const reviewed = useSchoolReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);

  const counselors = useMemo(() => SCHOOL_COUNSELORS
    .map((c) => ({ c, m: readinessMetrics(roster.filter((s) => counselorFor(s).id === c.id)) }))
    .filter((x) => x.m.students > 0)
    .sort((a, b) => a.m.onTrackPct - b.m.onTrackPct || (b.m.overdue + b.m.changesRequested) - (a.m.overdue + a.m.changesRequested)), [roster]);
  const grades = useMemo(() => GRADES
    .map((g) => ({ g, m: readinessMetrics(reviewed.filter((s) => s.grade === g)) }))
    .filter((x) => x.m.students > 0)
    .sort((a, b) => a.m.onTrackPct - b.m.onTrackPct), [reviewed]);

  const school = readinessMetrics(roster);
  const total = school.students || 1;
  const worstCounselor = counselors[0];
  const worstGrade = grades[0];
  const counselorBand = worstCounselor ? targetBand(worstCounselor.m.onTrackPct, SCHOOL_TARGETS.onTrack) : "met";
  const gradeBand = worstGrade ? targetBand(worstGrade.m.onTrackPct, SCHOOL_TARGETS.onTrack) : "met";

  const goToStudents = (status?: "On Track" | "Needs Attention" | "At Risk", plan?: "With Plan" | "Undecided") => {
    if (status) setStatusFilter(status);
    if (plan) setPlanFilter(plan);
    router.push("/counselor?view=students");
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-7">
          <OverviewCard title="Counselors" unit="% on track" hero tint={BAND_COLORS[counselorBand]} aside={<SeeLink onClick={() => router.push("/counselor?view=counselors")}>All</SeeLink>}>
            {worstCounselor && (
              <Verdict band={counselorBand}>
                {counselorBand === "met" ? "Every caseload is on target" : `${worstCounselor.c.name}'s caseload needs the most support`}
              </Verdict>
            )}
            <div className="flex flex-col gap-[8px]">
              {counselors.map(({ c, m }) => (
                <MetricRow key={c.id} leading={<InitialsBadge name={c.name} />} label={c.name} note={`${m.students} students`} value={m.onTrackPct} target={SCHOOL_TARGETS.onTrack} onClick={() => router.push("/counselor?view=counselors")} />
              ))}
            </div>
          </OverviewCard>
        </div>
        <div className="xl:col-span-5">
          <OverviewCard title="Grades" unit="% on track">
            {worstGrade && (
              <Verdict band={gradeBand}>
                {gradeBand === "met" ? "Every grade is on target" : `Grade ${worstGrade.g} needs the most support`}
              </Verdict>
            )}
            <div className="flex flex-col gap-[8px]">
              {grades.map(({ g, m }) => (
                <MetricRow key={g} label={`Grade ${g}`} note={`${m.students} students`} value={m.onTrackPct} target={SCHOOL_TARGETS.onTrack} onClick={() => { setGradeFilter(g as 9 | 10 | 11 | 12); router.push("/counselor?view=students"); }} />
              ))}
            </div>
          </OverviewCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-4">
          <DonutCard
            title="Student Status"
            caption={`${school.students} students`}
            aside={<SeeLink onClick={() => goToStudents()}>Students</SeeLink>}
            centerPct={(school.onTrack / total) * 100}
            centerLabel="on track"
            rows={[
              { label: "On Track", value: school.onTrack, color: STATUS_COLORS["On Track"], onClick: () => goToStudents("On Track") },
              { label: "Needs Attention", value: school.needsAttention, color: STATUS_COLORS["Needs Attention"], onClick: () => goToStudents("Needs Attention") },
              { label: "At Risk", value: school.atRisk, color: STATUS_COLORS["At Risk"], onClick: () => goToStudents("At Risk") },
            ]}
          />
        </div>
        <div className="xl:col-span-4">
          <OverviewCard title="Review backlog" aside={<SeeLink onClick={() => router.push("/counselor?view=review-queue")}>Queue</SeeLink>}>
            <div className="flex gap-[var(--space-6)]">
              <Stat value={String(school.pendingReviews)} label="pending" />
              <Stat value={String(school.overdue)} label="overdue" color={school.overdue > 0 ? STATUS_COLORS["At Risk"] : undefined} />
            </div>
            <div className="flex flex-col gap-[4px]">
              {counselors.slice().sort((a, b) => b.m.pendingReviews - a.m.pendingReviews).map(({ c, m }) => (
                <StatRow key={c.id} label={c.name} value={m.pendingReviews} color="#5B6CF9" onClick={() => router.push("/counselor?view=review-queue")} />
              ))}
            </div>
          </OverviewCard>
        </div>
        <div className="xl:col-span-4">
          <DonutCard
            title="Postsecondary Plans"
            caption="Students with a declared path"
            aside={<SeeLink onClick={() => goToStudents()}>Students</SeeLink>}
            centerPct={(school.withPlan / total) * 100}
            centerLabel="have a plan"
            rows={[
              { label: "With Plan", value: school.withPlan, color: "#5B6CF9", onClick: () => goToStudents(undefined, "With Plan") },
              { label: "Undecided", value: school.students - school.withPlan, color: "#5B6470", onClick: () => goToStudents(undefined, "Undecided") },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
