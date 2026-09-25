"use client";

// DEMO-ONLY v2: the School Administrator's Overview. One question: is the
// school on target. Budget and color rules in ./overviewShared.tsx; targets
// and the FAFSA definition in src/lib/counselorOrg.ts.

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
import { BAND_COLORS, MetricRow, OverviewCard, SeeLink, Stat, Verdict } from "./overviewShared";
import { ShowAll } from "./Disclosure";

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
  // Lowest five open, the rest behind Show all: fifteen pathway rows was
  // the tallest card on the page and the ones below target come first.
  const [allGroups, setAllGroups] = useState(false);

  const rows = READINESS_TARGETS.map((key) => {
    const seniorsOnly = key === "seniorPlan" || key === "fafsa";
    const value = seniorsOnly && school.seniors === 0 ? null : key === "seniorPlan" ? school.seniorPlanPct : key === "fafsa" ? school.fafsaPct : key === "plansOnFile" ? school.withPlanPct : school.onTrackPct;
    return { key, value, target: SCHOOL_TARGETS[key] };
  });
  const measured = rows.filter((r) => r.value !== null) as { key: TargetKey; value: number; target: number }[];
  const met = measured.filter((r) => targetBand(r.value, r.target) === "met").length;
  const worst = measured.slice().sort((a, b) => (a.value - a.target) - (b.value - b.target))[0];
  const heroBand = worst ? targetBand(worst.value, worst.target) : "met";

  const byGrade = GRADES.map((g) => readinessMetrics(reviewed.filter((s) => s.grade === g)));
  const approvedPct = (g: number, key: "Career Report" | "Academic Plan") => {
    const students = reviewed.filter((s) => s.grade === g);
    return students.length ? (students.filter((s) => s.milestones[key] === "Approved").length / students.length) * 100 : 0;
  };

  const groups = useMemo(() => {
    const keys: string[] = cut === "pathway" ? [...CAREER_TRACKS] : ["4-Year College", "2-Year College", "Trade/Technical School", "Workforce", "Military", "Undecided"];
    return keys
      .map((k) => ({ k, m: readinessMetrics(roster.filter((s) => (cut === "pathway" ? s.careerTrack : s.postsecondaryIntent) === k)) }))
      .filter((x) => x.m.students > 0)
      .sort((a, b) => a.m.onTrackPct - b.m.onTrackPct);
  }, [roster, cut]);
  const lowest = groups[0];
  const gapBand = lowest ? targetBand(lowest.m.onTrackPct, SCHOOL_TARGETS.onTrack) : "met";

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-8">
          <OverviewCard title="Targets" hero tint={BAND_COLORS[heroBand]} aside={<SeeLink onClick={() => router.push("/counselor?view=readiness")}>Readiness</SeeLink>}>
            {worst && (
              <Verdict band={heroBand}>
                {met} of {measured.length} met{heroBand !== "met" ? ` · ${TARGET_LABELS[worst.key]} has the most room to grow` : ""}
              </Verdict>
            )}
            <div className="grid grid-cols-1 gap-x-[var(--space-6)] gap-y-[var(--space-4)] sm:grid-cols-2">
              {rows.map((r) => <MetricRow key={r.key} label={TARGET_LABELS[r.key]} note={`target ${r.target}%`} value={r.value} target={r.target} />)}
            </div>
          </OverviewCard>
        </div>
        <div className="xl:col-span-4">
          <OverviewCard title="Platform use" aside={<SeeLink onClick={() => router.push("/counselor?view=engagement")}>Engagement</SeeLink>}>
            <MetricRow label="Active this month" note={`target ${SCHOOL_TARGETS.activeStudents}%`} value={school.activePct} target={SCHOOL_TARGETS.activeStudents} />
            <div className="mt-auto flex gap-[var(--space-6)]">
              <Stat value={String(HOME_ENGAGEMENT.weeklyActive)} label="active weekly" />
              <Stat value={school.avgLogins.toFixed(1)} label="logins per student" />
            </div>
          </OverviewCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-7">
          <HoverBeam strength={0.6} className="h-full">
            <Panel id="readiness-by-grade" title="Readiness by grade" className="h-full">
              <BarChart barStyle="solid"
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
        <div className="xl:col-span-5">
          <OverviewCard title="By group" unit="% on track" aside={<Segmented ariaLabel="Cut readiness by" options={[{ key: "pathway", label: "Pathway" }, { key: "plan", label: "Plan" }]} value={cut} onChange={setCut} />}>
            {lowest && (
              <Verdict band={gapBand}>{gapBand === "met" ? "Every group is on target" : `${lowest.k} is lowest`}</Verdict>
            )}
            <div className="flex flex-col gap-[8px]">
              {(allGroups ? groups : groups.slice(0, 5)).map(({ k, m }) => <MetricRow key={k} label={k} note={String(m.students)} value={m.onTrackPct} target={SCHOOL_TARGETS.onTrack} />)}
            </div>
            <ShowAll total={groups.length} shown={5} open={allGroups} onToggle={() => setAllGroups((v) => !v)} />
          </OverviewCard>
        </div>
      </div>
    </div>
  );
}
