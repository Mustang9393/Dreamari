"use client";

// DEMO-ONLY v2: the District Administrator's Overview. Two questions: which
// schools are behind, is the platform used. Lincoln is live; the other four
// schools are SEEDED, scaled from Lincoln (src/lib/counselorOrg.ts,
// `seeded: true`). Budget and color rules in ./overviewShared.tsx.

import { CHART_STATUS } from "../palette";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_TARGETS, TARGET_LABELS, districtRollup, districtSchools, schoolTargetValue, targetsMet, type TargetBand, type TargetKey } from "@/lib/counselorOrg";
import { DonutCard } from "./Overview";
import { BAND_COLORS, InitialsBadge, MetricRow, OverviewCard, SeeLink, Verdict } from "./overviewShared";

const READINESS_TARGETS: TargetKey[] = ["onTrack", "plansOnFile", "seniorPlan", "fafsa"];

function metBand(met: number, of: number): TargetBand {
  return met === of ? "met" : met >= of - 1 ? "near" : "missed";
}

export function OverviewDistrict() {
  const router = useRouter();
  const { gradeFilter } = useCounselorFilters();
  const reviewed = useReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);
  const schools = useMemo(() => districtSchools(roster), [roster]);
  const district = useMemo(() => districtRollup(schools), [schools]);
  const noSeniors = district.seniors === 0;
  const keys = noSeniors ? READINESS_TARGETS.filter((k) => k !== "seniorPlan" && k !== "fafsa") : READINESS_TARGETS;

  const ranked = schools.slice().sort((a, b) => targetsMet(a, keys) - targetsMet(b, keys) || a.onTrackPct - b.onTrackPct);
  const worst = ranked[0];
  const heroBand = metBand(targetsMet(worst, keys), keys.length);
  const behind = ranked.filter((s) => targetsMet(s, keys) < keys.length).length;

  const byUse = schools.slice().sort((a, b) => a.activePct - b.activePct);
  const reachUse = schools.filter((s) => s.activePct >= SCHOOL_TARGETS.activeStudents).length;
  const useBand = metBand(reachUse, schools.length);
  const total = district.students || 1;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-8">
          <OverviewCard title="Schools" unit="% on track" hero tint={BAND_COLORS[heroBand]} aside={<SeeLink onClick={() => router.push("/counselor?view=schools")}>All</SeeLink>}>
            <Verdict band={heroBand}>
              {behind === 0 ? `All ${schools.length} schools meet every target` : `${worst.short} needs the most support · ${behind} of ${schools.length} have a target to reach`}
            </Verdict>
            <div className="flex flex-col gap-[8px]">
              {ranked.map((s) => (
                <MetricRow key={s.id} leading={<InitialsBadge name={s.short} />} label={s.name} note={`${targetsMet(s, keys)} of ${keys.length} targets`} value={s.onTrackPct} target={SCHOOL_TARGETS.onTrack} onClick={() => router.push("/counselor?view=schools")} />
              ))}
            </div>
          </OverviewCard>
        </div>
        <div className="xl:col-span-4">
          <DonutCard
            title="Student Status"
            caption={`${district.students.toLocaleString("en-US")} students · ${schools.length} schools`}
            aside={<SeeLink onClick={() => router.push("/counselor?view=schools")}>Schools</SeeLink>}
            centerPct={(district.onTrack / total) * 100}
            centerLabel="on track"
            rows={[
              { label: "On Track", value: district.onTrack, color: CHART_STATUS["On Track"] },
              { label: "Needs Attention", value: district.needsAttention, color: CHART_STATUS["Needs Attention"] },
              { label: "At Risk", value: district.atRisk, color: CHART_STATUS["At Risk"] },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-7">
          <OverviewCard title="Platform use" unit="% active this month" aside={<SeeLink onClick={() => router.push("/counselor?view=engagement")}>Engagement</SeeLink>}>
            <Verdict band={useBand}>{reachUse} of {schools.length} schools reach {SCHOOL_TARGETS.activeStudents}%</Verdict>
            <div className="flex flex-col gap-[8px]">
              {byUse.map((s) => <MetricRow key={s.id} label={s.name} note={`${s.avgLogins.toFixed(1)} logins each`} value={s.activePct} target={SCHOOL_TARGETS.activeStudents} />)}
            </div>
          </OverviewCard>
        </div>
        <div className="xl:col-span-5">
          <OverviewCard title="District targets" aside={<SeeLink onClick={() => router.push("/counselor?view=readiness")}>Readiness</SeeLink>}>
            <div className="flex flex-col gap-[var(--space-4)]">
              {READINESS_TARGETS.map((key) => {
                const seniorsOnly = key === "seniorPlan" || key === "fafsa";
                const value = seniorsOnly && noSeniors ? null : schoolTargetValue(district, key);
                return <MetricRow key={key} label={TARGET_LABELS[key]} note={`target ${SCHOOL_TARGETS[key]}%`} value={value} target={SCHOOL_TARGETS[key]} />;
              })}
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  );
}
