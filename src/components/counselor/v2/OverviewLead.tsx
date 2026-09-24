"use client";

// DEMO-ONLY v2: the Lead Counselor's Overview (24 Sept 2026). Answers two
// questions before anything else: which counselor is behind, and which grade
// is behind. Same rules as the counselor Overview: one hero surface (the
// counselor comparison), sidekicks in plain glass, reserved status colors for
// state, single-hue bars for magnitude, every card opens something. The
// counselor split is seeded (src/lib/counselorOrg.ts, last-name ranges).

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { StatRow } from "../chips";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, SCHOOL_TARGETS, counselorFor, readinessMetrics, targetBand } from "@/lib/counselorOrg";
import { DonutCard, STATUS_COLORS } from "./Overview";
import { BAND_COLORS, BandChip, InitialsBadge, OverviewCard, RankBar, SeeLink, StatusBar, Verdict } from "./overviewShared";

const GRADES = [9, 10, 11, 12];

export function OverviewLead() {
  const router = useRouter();
  const { gradeFilter, setGradeFilter, setStatusFilter, setPlanFilter } = useCounselorFilters();
  const reviewed = useReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);

  // Worst first: lowest on-track rate, then the most unresolved work
  // (overdue + changes requested) as the tiebreak.
  const counselors = useMemo(() => SCHOOL_COUNSELORS
    .map((c) => ({ c, m: readinessMetrics(roster.filter((s) => counselorFor(s).id === c.id)) }))
    .filter((x) => x.m.students > 0)
    .sort((a, b) => a.m.onTrackPct - b.m.onTrackPct || (b.m.overdue + b.m.changesRequested) - (a.m.overdue + a.m.changesRequested)), [roster]);
  const grades = useMemo(() => GRADES
    .map((g) => ({ g, m: readinessMetrics(reviewed.filter((s) => s.grade === g)) }))
    .filter((x) => x.m.students > 0)
    .sort((a, b) => a.m.onTrackPct - b.m.onTrackPct || b.m.needsAttention + b.m.atRisk - (a.m.needsAttention + a.m.atRisk)), [reviewed]);

  const school = readinessMetrics(roster);
  const worstCounselor = counselors[0];
  const worstGrade = grades[0];
  const counselorBand = worstCounselor ? targetBand(worstCounselor.m.onTrackPct, SCHOOL_TARGETS.onTrack) : "met";
  const gradeBand = worstGrade ? targetBand(worstGrade.m.onTrackPct, SCHOOL_TARGETS.onTrack) : "met";
  const total = school.students || 1;

  const goToStudents = (status?: "On Track" | "Needs Attention" | "At Risk", plan?: "With Plan" | "Undecided") => {
    if (status) setStatusFilter(status);
    if (plan) setPlanFilter(plan);
    router.push("/counselor?view=students");
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <OverviewCard title="Which counselor is behind" sub="Caseloads by last name, on-track rate against the 80% target" hero tint={BAND_COLORS[counselorBand]} aside={<SeeLink onClick={() => router.push("/counselor?view=counselors")}>Counselors</SeeLink>}>
            {worstCounselor && (
              <Verdict band={counselorBand}>
                {counselorBand === "met"
                  ? `Every caseload is on target. ${worstCounselor.c.name} (${worstCounselor.c.range}) is the closest to slipping at ${worstCounselor.m.onTrackPct}% on track.`
                  : `${worstCounselor.c.name} (${worstCounselor.c.range}) is furthest behind: ${worstCounselor.m.onTrackPct}% on track, ${worstCounselor.m.withPlanPct}% with a plan.`}
              </Verdict>
            )}
            <ul className="flex flex-col gap-[6px]">
              {counselors.map(({ c, m }) => {
                const band = targetBand(m.onTrackPct, SCHOOL_TARGETS.onTrack);
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => router.push("/counselor?view=counselors")} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border p-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, #FFFFFF 4%, transparent)" }}>
                      <InitialsBadge name={c.name} size={36} />
                      <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-[8px] gap-y-[4px]">
                          <span className="flex min-w-0 flex-col leading-tight">
                            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
                            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.range} · {m.students} students · {m.pendingReviews} pending · {m.overdue} overdue</span>
                          </span>
                          <span className="flex flex-none items-center gap-[8px]">
                            <span className="text-[18px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.onTrackPct}%</span>
                            <BandChip band={band} />
                          </span>
                        </span>
                        <StatusBar onTrack={m.onTrack} needsAttention={m.needsAttention} atRisk={m.atRisk} height={7} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-x-[14px] gap-y-[4px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {(["On Track", "Needs Attention", "At Risk"] as const).map((k) => (
                <span key={k} className="flex items-center gap-[6px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: STATUS_COLORS[k] }} />{k}</span>
              ))}
            </div>
          </OverviewCard>
        </div>
        <div className="lg:col-span-5">
          <OverviewCard title="Which grade is behind" sub="On-track rate by grade, all counselors">
            {worstGrade && (
              <Verdict band={gradeBand}>
                {gradeBand === "met"
                  ? `Every grade is on target. Grade ${worstGrade.g} is the lowest at ${worstGrade.m.onTrackPct}% on track.`
                  : `Grade ${worstGrade.g} is behind: ${worstGrade.m.onTrackPct}% on track, ${worstGrade.m.needsAttention + worstGrade.m.atRisk} students need attention.`}
              </Verdict>
            )}
            <ul className="flex flex-col gap-[10px]">
              {grades.map(({ g, m }) => {
                const band = targetBand(m.onTrackPct, SCHOOL_TARGETS.onTrack);
                return (
                  <li key={g}>
                    <button type="button" onClick={() => { setGradeFilter(g as 9 | 10 | 11 | 12); router.push("/counselor?view=students"); }} className="dm-quiet flex w-full cursor-pointer flex-col gap-[5px] rounded-[var(--radius-sm)] px-[4px] py-[4px] text-left">
                      <span className="flex items-center justify-between gap-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
                        <span>Grade {g} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {m.students} students</span></span>
                        <span className="flex items-center gap-[8px]"><span className="tabular-nums">{m.onTrackPct}%</span><BandChip band={band} /></span>
                      </span>
                      <RankBar value={m.onTrackPct} target={SCHOOL_TARGETS.onTrack} color={BAND_COLORS[band]} height={7} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Tick marks the 80% target. Select a grade to open its roster.</span>
          </OverviewCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <DonutCard
            title="School student status"
            caption={`${school.students} students across ${counselors.length} caseloads`}
            centerPct={(school.onTrack / total) * 100}
            centerLabel="on track"
            rows={[
              { label: "On Track", value: school.onTrack, color: STATUS_COLORS["On Track"], onClick: () => goToStudents("On Track") },
              { label: "Needs Attention", value: school.needsAttention, color: STATUS_COLORS["Needs Attention"], onClick: () => goToStudents("Needs Attention") },
              { label: "At Risk", value: school.atRisk, color: STATUS_COLORS["At Risk"], onClick: () => goToStudents("At Risk") },
            ]}
          />
        </div>
        <div className="lg:col-span-4">
          <OverviewCard title="Review backlog" sub="Submissions waiting on a counselor" aside={<SeeLink onClick={() => router.push("/counselor?view=review-queue")}>Queue</SeeLink>}>
            <div className="flex items-baseline gap-[8px]">
              <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{school.pendingReviews}</span>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>pending · {school.overdue} overdue · {school.changesRequested} awaiting the student</span>
            </div>
            <div className="flex flex-col gap-[4px]">
              {counselors.slice().sort((a, b) => b.m.pendingReviews - a.m.pendingReviews).map(({ c, m }) => (
                <StatRow key={c.id} label={`${c.name} · ${c.range}`} value={m.pendingReviews} color="#5B6CF9" onClick={() => router.push("/counselor?view=review-queue")} />
              ))}
            </div>
          </OverviewCard>
        </div>
        <div className="lg:col-span-4">
          <DonutCard
            title="Postsecondary plans"
            caption="Students with a declared path"
            centerPct={(school.withPlan / total) * 100}
            centerLabel="have a plan"
            rows={[
              { label: "With Plan", value: school.withPlan, color: "#2F6BF2", onClick: () => goToStudents(undefined, "With Plan") },
              { label: "Undecided", value: school.students - school.withPlan, color: "#5B6470", onClick: () => goToStudents(undefined, "Undecided") },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
