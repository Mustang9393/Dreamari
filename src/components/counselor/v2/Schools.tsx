"use client";

// DEMO-ONLY v2: Schools (District Administrator). Lincoln is live; the other
// four are seeded from Lincoln (src/lib/counselorOrg.ts, `seeded: true`).
// One card per target, schools ranked attention first within each, plus a
// header of district totals.

import { useMemo } from "react";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_TARGETS, TARGET_LABELS, districtRollup, districtSchools, schoolTargetValue, targetBand, targetsMet, type TargetKey } from "@/lib/counselorOrg";
import { BAND_COLORS, InitialsBadge, MetricRow, OverviewCard, Stat, Verdict } from "./overviewShared";

const KEYS: TargetKey[] = ["onTrack", "plansOnFile", "seniorPlan", "fafsa", "activeStudents"];

export function Schools() {
  const { gradeFilter } = useCounselorFilters();
  const reviewed = useReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);
  const schools = useMemo(() => districtSchools(roster), [roster]);
  const district = useMemo(() => districtRollup(schools), [schools]);
  const noSeniors = district.seniors === 0;
  const keys = noSeniors ? KEYS.filter((k) => k !== "seniorPlan" && k !== "fafsa") : KEYS;
  const ranked = schools.slice().sort((a, b) => targetsMet(a, keys) - targetsMet(b, keys) || a.onTrackPct - b.onTrackPct);
  const worst = ranked[0];
  const worstMet = targetsMet(worst, keys);
  const band = worstMet === keys.length ? "met" : worstMet >= keys.length - 1 ? "near" : "missed";

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap gap-[var(--space-6)]">
        <Stat value={String(schools.length)} label="schools" />
        <Stat value={district.students.toLocaleString("en-US")} label="students" />
        <Stat value={`${district.onTrackPct}%`} label="on track" />
        <Stat value={`${district.activePct}%`} label="active this month" />
      </div>

      <OverviewCard title="Targets met" unit={`of ${keys.length}`} hero tint={BAND_COLORS[band]}>
        <Verdict band={band}>{worstMet === keys.length ? "Every school meets every target" : `${worst.short} needs the most support · ${worstMet} of ${keys.length} targets met`}</Verdict>
        <div className="flex flex-col gap-[10px]">
          {ranked.map((s) => (
            <MetricRow key={s.id} leading={<InitialsBadge name={s.short} />} label={s.name} note={`${s.students} students`} value={Math.round((targetsMet(s, keys) / keys.length) * 100)} target={100} display={`${targetsMet(s, keys)} of ${keys.length}`} />
          ))}
        </div>
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
        {keys.map((key) => {
          const rows = schools.slice().sort((a, b) => schoolTargetValue(a, key) - schoolTargetValue(b, key));
          const low = rows[0];
          const b = targetBand(schoolTargetValue(low, key), SCHOOL_TARGETS[key]);
          return (
            <OverviewCard key={key} title={TARGET_LABELS[key]} unit={`target ${SCHOOL_TARGETS[key]}%`}>
              <Verdict band={b}>{b === "met" ? "Every school is on target" : `${low.short} has the most room to grow`}</Verdict>
              <div className="flex flex-col gap-[10px]">
                {rows.map((s) => <MetricRow key={s.id} label={s.name} value={schoolTargetValue(s, key)} target={SCHOOL_TARGETS[key]} />)}
              </div>
            </OverviewCard>
          );
        })}
      </div>
    </div>
  );
}
