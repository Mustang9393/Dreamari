"use client";

// DEMO-ONLY v2: the School Administrator's Overview (24 Sept 2026). One
// question: is the school on target? Senior plan compliance, FAFSA, plans on
// file and the on-track rate against their targets in the hero; platform
// use beside it; readiness by grade and the equity cuts the data can
// honestly support underneath. Targets and the FAFSA definition live in
// src/lib/counselorOrg.ts.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/connect/ProProfile";
import { BarChart, Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { CAREER_TRACKS } from "@/lib/counselorRoster";
import { HOME_ENGAGEMENT, SCHOOL_TARGETS, TARGET_LABELS, homeSchoolSnapshot, readinessMetrics, targetBand, type TargetKey } from "@/lib/counselorOrg";
import { READINESS_SERIES, TARGET_LINE_COLOR } from "./Overview";
import { BAND_COLORS, BandChip, OverviewCard, RankBar, SeeLink, TargetRow, Verdict, worstBand } from "./overviewShared";

const GRADES = [9, 10, 11, 12];
const READINESS_TARGETS: TargetKey[] = ["seniorPlan", "fafsa", "plansOnFile", "onTrack"];
type Cut = "pathway" | "plan";

export function OverviewSchoolAdmin() {
  const router = useRouter();
  const { gradeFilter } = useCounselorFilters();
  const reviewed = useReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);
  const school = useMemo(() => homeSchoolSnapshot(roster), [roster]);
  const [cut, setCut] = useState<Cut>("pathway");

  // Each target as a row; seniors-only measures are unmeasurable when the
  // grade filter excludes seniors, and are said to be rather than shown as 0.
  const rows = READINESS_TARGETS.map((key) => {
    const seniorsOnly = key === "seniorPlan" || key === "fafsa";
    const value = seniorsOnly && school.seniors === 0 ? null : key === "seniorPlan" ? school.seniorPlanPct : key === "fafsa" ? school.fafsaPct : key === "plansOnFile" ? school.withPlanPct : school.onTrackPct;
    const detail = key === "seniorPlan" ? `${school.seniorsCompliant} of ${school.seniors} seniors with a declared plan`
      : key === "fafsa" ? `${school.fafsaDone} of ${school.seniors} seniors with financial aid approved`
      : key === "plansOnFile" ? `${school.withPlan} of ${school.students} students with a declared path`
      : `${school.onTrack} of ${school.students} students on track`;
    return { key, value, target: SCHOOL_TARGETS[key], detail, band: value === null ? null : targetBand(value, SCHOOL_TARGETS[key]) };
  });
  const measured = rows.filter((r) => r.band !== null);
  const met = measured.filter((r) => r.band === "met").length;
  const worst = measured.slice().sort((a, b) => (a.value! - a.target) - (b.value! - b.target))[0];
  const heroBand = worstBand(measured.map((r) => r.band!));
  const activeBand = targetBand(school.activePct, SCHOOL_TARGETS.activeStudents);

  // Readiness by grade for the chart: whole school, not the filtered roster,
  // since the chart's job is the comparison across grades.
  const byGrade = GRADES.map((g) => readinessMetrics(reviewed.filter((s) => s.grade === g)));
  const approvedPct = (g: number, key: "Career Report" | "Academic Plan") => {
    const students = reviewed.filter((s) => s.grade === g);
    return students.length ? (students.filter((s) => s.milestones[key] === "Approved").length / students.length) * 100 : 0;
  };

  // Equity cuts the roster can honestly support: by pathway and by
  // postsecondary plan. Demographic subgroups need SIS data (see the note
  // under the card).
  const groups = useMemo(() => {
    const keys: string[] = cut === "pathway" ? [...CAREER_TRACKS] : ["4-Year College", "2-Year College", "Trade/Technical School", "Workforce", "Military", "Undecided"];
    return keys
      .map((k) => ({ k, m: readinessMetrics(roster.filter((s) => (cut === "pathway" ? s.careerTrack : s.postsecondaryIntent) === k)) }))
      .filter((x) => x.m.students > 0)
      .sort((a, b) => a.m.onTrackPct - b.m.onTrackPct);
  }, [roster, cut]);
  const gap = groups.length > 1 ? groups[groups.length - 1].m.onTrackPct - groups[0].m.onTrackPct : 0;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-8">
          <OverviewCard title="Is the school on target" sub="Four readiness targets, current academic year" hero tint={BAND_COLORS[heroBand]} aside={<SeeLink onClick={() => router.push("/counselor?view=readiness")}>Readiness</SeeLink>}>
            {worst && (
              <Verdict band={heroBand}>
                {met} of {measured.length} targets met.{" "}
                {heroBand === "met"
                  ? `${TARGET_LABELS[worst.key]} has the least room at ${worst.value! - worst.target} pts above target.`
                  : `${TARGET_LABELS[worst.key]} is furthest behind, ${worst.target - worst.value!} pts under its ${worst.target}% target.`}
              </Verdict>
            )}
            <div className="grid grid-cols-1 gap-x-[var(--space-6)] gap-y-[var(--space-5)] sm:grid-cols-2">
              {rows.map((r) => <TargetRow key={r.key} label={TARGET_LABELS[r.key]} value={r.value} target={r.target} detail={r.detail} />)}
            </div>
          </OverviewCard>
        </div>
        <div className="lg:col-span-4">
          <OverviewCard title="Is the platform used" sub="Students active this month" tint={BAND_COLORS[activeBand]} aside={<SeeLink onClick={() => router.push("/counselor?view=engagement")}>Engagement</SeeLink>}>
            <TargetRow label={TARGET_LABELS.activeStudents} value={school.activePct} target={SCHOOL_TARGETS.activeStudents} detail={`${school.activeStudents} of ${school.students} students logged in`} />
            <div className="mt-auto grid grid-cols-2 gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
              <span className="flex flex-col gap-[2px]">
                <span className="text-[20px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{HOME_ENGAGEMENT.weeklyActive}</span>
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>active each week</span>
              </span>
              <span className="flex flex-col gap-[2px]">
                <span className="text-[20px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{school.avgLogins.toFixed(2)}</span>
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>logins per student</span>
              </span>
            </div>
          </OverviewCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <HoverBeam strength={0.6} className="h-full">
            <Panel id="readiness-by-grade" title="Readiness by grade" className="h-full">
              <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of each grade on track, with an approved career report and an approved academic plan</p>
              <BarChart
                groups={GRADES.map((g) => `Gr. ${g}`)}
                series={[
                  { label: "On track", accent: READINESS_SERIES[0], values: byGrade.map((m) => m.onTrackPct) },
                  { label: "Career Report approved", accent: READINESS_SERIES[1], values: GRADES.map((g) => approvedPct(g, "Career Report")) },
                  { label: "Academic Plan approved", accent: READINESS_SERIES[2], values: GRADES.map((g) => approvedPct(g, "Academic Plan")) },
                ]}
                targetLine={{ value: SCHOOL_TARGETS.onTrack, label: "Target", color: TARGET_LINE_COLOR }}
              />
            </Panel>
          </HoverBeam>
        </div>
        <div className="lg:col-span-5">
          <OverviewCard title="Equity cuts" sub="On-track rate by group, lowest first" tint={BAND_COLORS[gap >= 20 ? "missed" : gap >= 10 ? "near" : "met"]} aside={<Segmented ariaLabel="Cut readiness by" options={[{ key: "pathway", label: "Pathway" }, { key: "plan", label: "Plan" }]} value={cut} onChange={setCut} />}>
            {groups.length > 1 && (
              <Verdict band={gap >= 20 ? "missed" : gap >= 10 ? "near" : "met"}>
                {gap} pt gap between {groups[groups.length - 1].k} ({groups[groups.length - 1].m.onTrackPct}%) and {groups[0].k} ({groups[0].m.onTrackPct}%).
              </Verdict>
            )}
            <ul className="flex flex-col gap-[8px]">
              {groups.map(({ k, m }) => {
                const band = targetBand(m.onTrackPct, SCHOOL_TARGETS.onTrack);
                return (
                  <li key={k} className="flex flex-col gap-[4px]">
                    <span className="flex items-center justify-between gap-[8px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>
                      <span className="min-w-0">{k} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {m.students}</span></span>
                      <span className="flex flex-none items-center gap-[8px]"><span className="tabular-nums">{m.onTrackPct}%</span><BandChip band={band} /></span>
                    </span>
                    <RankBar value={m.onTrackPct} target={SCHOOL_TARGETS.onTrack} color={BAND_COLORS[band]} height={6} />
                  </li>
                );
              })}
            </ul>
            {/* Playbook tier 6: the cut that should exist but has no data yet is
               named, not silently missing. */}
            <span className="mt-auto text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Cuts by free or reduced lunch, English learner and IEP status: coming soon, with student information system data.</span>
          </OverviewCard>
        </div>
      </div>
    </div>
  );
}
