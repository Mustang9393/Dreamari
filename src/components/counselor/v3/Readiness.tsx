"use client";

// DEMO-ONLY v2: Readiness (School Administrator: by grade; District
// Administrator: by school). The same four readiness targets as the
// Overview, broken down one level: one card per target, rows ranked
// attention first, with the count behind each percent.

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { SCHOOL_TARGETS, TARGET_LABELS, districtRollup, districtSchools, readinessMetrics, schoolTargetValue, targetBand, type ReadinessMetrics, type TargetKey } from "@/lib/counselorOrg";
import { CardLink } from "../chips";
import { MetricRow, OverviewCard, Stat, Verdict } from "./overviewShared";

const KEYS: TargetKey[] = ["onTrack", "plansOnFile", "seniorPlan", "fafsa"];
const GRADES = [9, 10, 11, 12] as const;

function valueOf(m: ReadinessMetrics, key: TargetKey): number | null {
  if (key === "seniorPlan") return m.seniors ? m.seniorPlanPct : null;
  if (key === "fafsa") return m.seniors ? m.fafsaPct : null;
  if (key === "plansOnFile") return m.withPlanPct;
  if (key === "onTrack") return m.onTrackPct;
  return null;
}
function noteOf(m: ReadinessMetrics, key: TargetKey): string {
  if (key === "seniorPlan") return `${m.seniorsCompliant} of ${m.seniors} seniors`;
  if (key === "fafsa") return `${m.fafsaDone} of ${m.seniors} seniors`;
  if (key === "plansOnFile") return `${m.withPlan} of ${m.students}`;
  return `${m.onTrack} of ${m.students}`;
}

export function Readiness() {
  const router = useRouter();
  const { setGradeFilter } = useCounselorFilters();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const district = account.role === "District Administrator";
  const roster = useReviewedRoster();

  // Rows: grades for a school, schools for the district. Whole roster, not
  // the grade filter: the screen's job is the comparison across rows.
  const rows = useMemo(() => {
    if (district) {
      const schools = districtSchools(roster);
      return schools.map((s) => ({ id: s.id, label: s.name, m: s as ReadinessMetrics, onOpen: undefined as (() => void) | undefined }));
    }
    return GRADES.map((g) => ({ id: String(g), label: `Grade ${g}`, m: readinessMetrics(roster.filter((s) => s.grade === g)), onOpen: () => { setGradeFilter(g); router.push("/counselor?view=students"); } }));
  }, [district, roster, router, setGradeFilter]);
  const whole = useMemo(() => (district ? districtRollup(districtSchools(roster)) : readinessMetrics(roster)), [district, roster]);

  const measured = KEYS.map((key) => ({ key, value: district ? schoolTargetValue(whole as ReturnType<typeof districtRollup>, key) : valueOf(whole, key), target: SCHOOL_TARGETS[key] })).filter((r) => r.value !== null) as { key: TargetKey; value: number; target: number }[];
  const met = measured.filter((r) => targetBand(r.value, r.target) === "met").length;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex flex-wrap gap-[var(--space-6)]">
          <Stat value={`${met} of ${measured.length}`} label="targets met" />
          {measured.map((r) => <Stat key={r.key} value={`${r.value}%`} label={TARGET_LABELS[r.key]} color={targetBand(r.value, r.target) === "met" ? undefined : targetBand(r.value, r.target) === "near" ? "#F5A623" : "#E0453C"} />)}
        </div>
        {!district && <CardLink onClick={() => router.push("/counselor?view=students")}>Students</CardLink>}
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
        {KEYS.map((key) => {
          const list = rows
            .map((r) => ({ ...r, value: valueOf(r.m, key) }))
            .filter((r) => r.value !== null)
            .sort((a, b) => (a.value as number) - (b.value as number));
          if (list.length === 0) return null;
          const low = list[0];
          const band = targetBand(low.value as number, SCHOOL_TARGETS[key]);
          return (
            <OverviewCard key={key} title={TARGET_LABELS[key]} unit={`target ${SCHOOL_TARGETS[key]}%`}>
              <Verdict band={band}>{band === "met" ? `Every ${district ? "school" : "grade"} is on target` : `${low.label} has the most room to grow`}</Verdict>
              <div className="flex flex-col gap-[10px]">
                {list.map((r) => <MetricRow key={r.id} label={r.label} note={noteOf(r.m, key)} value={r.value} target={SCHOOL_TARGETS[key]} onClick={r.onOpen} />)}
              </div>
            </OverviewCard>
          );
        })}
      </div>
    </div>
  );
}
