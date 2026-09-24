"use client";

// DEMO-ONLY v2: the District Administrator's Overview (24 Sept 2026). Two
// questions: which schools are behind, and is the platform used. Lincoln is
// live data; the other four schools are SEEDED, scaled from Lincoln
// (src/lib/counselorOrg.ts, `seeded: true`), so they move with the grade
// filter and with review decisions the same way Lincoln does.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_TARGETS, TARGET_LABELS, districtRollup, districtSchools, schoolTargetValue, targetBand, targetsMet, type TargetBand, type TargetKey } from "@/lib/counselorOrg";
import { DonutCard, STATUS_COLORS } from "./Overview";
import { BAND_COLORS, BandChip, InitialsBadge, OverviewCard, RankBar, SeeLink, TargetRow, Verdict } from "./overviewShared";

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

  // Worst first: fewest targets met, then lowest on-track rate.
  const ranked = schools.slice().sort((a, b) => targetsMet(a, keys) - targetsMet(b, keys) || a.onTrackPct - b.onTrackPct);
  const worst = ranked[0];
  const worstMet = targetsMet(worst, keys);
  const heroBand = metBand(worstMet, keys.length);
  const behind = ranked.filter((s) => targetsMet(s, keys) < keys.length).length;

  const byUse = schools.slice().sort((a, b) => a.activePct - b.activePct);
  const reachUse = schools.filter((s) => s.activePct >= SCHOOL_TARGETS.activeStudents).length;
  const useBand = metBand(reachUse, schools.length);
  const total = district.students || 1;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-8">
          <OverviewCard title="Which schools are behind" sub={`${schools.length} schools, ranked by readiness targets met`} hero tint={BAND_COLORS[heroBand]} aside={<SeeLink onClick={() => router.push("/counselor?view=schools")}>Schools</SeeLink>}>
            <Verdict band={heroBand}>
              {behind === 0
                ? `Every school meets all ${keys.length} readiness targets. ${worst.name} has the least room at ${worst.onTrackPct}% on track.`
                : `${behind} of ${schools.length} schools miss at least one target. ${worst.name} is furthest behind: ${worstMet} of ${keys.length} targets met, ${worst.onTrackPct}% on track.`}
            </Verdict>
            <ul className="flex flex-col gap-[6px]">
              {ranked.map((s) => {
                const met = targetsMet(s, keys);
                const band = metBand(met, keys.length);
                const onTrackBand = targetBand(s.onTrackPct, SCHOOL_TARGETS.onTrack);
                return (
                  <li key={s.id}>
                    <button type="button" onClick={() => router.push("/counselor?view=schools")} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border p-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, #FFFFFF 4%, transparent)" }}>
                      <InitialsBadge name={s.short} size={36} />
                      <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-[8px] gap-y-[4px]">
                          <span className="flex min-w-0 flex-col leading-tight">
                            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                              {s.students} students · {s.withPlanPct}% with a plan{noSeniors ? "" : ` · senior plans ${s.seniorPlanPct}% · FAFSA ${s.fafsaPct}%`}
                            </span>
                          </span>
                          <span className="flex flex-none items-center gap-[8px]">
                            <span className="text-[18px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.onTrackPct}%</span>
                            <BandChip band={band} label={`${met}/${keys.length} met`} />
                          </span>
                        </span>
                        <RankBar value={s.onTrackPct} target={SCHOOL_TARGETS.onTrack} color={BAND_COLORS[onTrackBand]} height={7} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Bar is the on-track rate; tick marks the 80% target.</span>
          </OverviewCard>
        </div>
        <div className="lg:col-span-4">
          <DonutCard
            title="District student status"
            caption={`${district.students.toLocaleString("en-US")} students across ${schools.length} schools`}
            centerPct={(district.onTrack / total) * 100}
            centerLabel="on track"
            rows={[
              { label: "On Track", value: district.onTrack, color: STATUS_COLORS["On Track"] },
              { label: "Needs Attention", value: district.needsAttention, color: STATUS_COLORS["Needs Attention"] },
              { label: "At Risk", value: district.atRisk, color: STATUS_COLORS["At Risk"] },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <OverviewCard title="Is the platform used" sub={`Students active this month, against the ${SCHOOL_TARGETS.activeStudents}% target`} aside={<SeeLink onClick={() => router.push("/counselor?view=engagement")}>Engagement</SeeLink>}>
            <Verdict band={useBand}>
              {reachUse} of {schools.length} schools reach {SCHOOL_TARGETS.activeStudents}% active. {byUse[0].name} is lowest at {byUse[0].activePct}%, {byUse[byUse.length - 1].short} highest at {byUse[byUse.length - 1].activePct}%.
            </Verdict>
            <ul className="flex flex-col gap-[10px]">
              {byUse.map((s) => {
                const band = targetBand(s.activePct, SCHOOL_TARGETS.activeStudents);
                return (
                  <li key={s.id} className="flex flex-col gap-[4px]">
                    <span className="flex items-center justify-between gap-[8px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>
                      <span className="min-w-0">{s.name} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {s.activeStudents} of {s.students} · {s.avgLogins.toFixed(2)} logins each</span></span>
                      <span className="flex flex-none items-center gap-[8px]"><span className="tabular-nums">{s.activePct}%</span><BandChip band={band} /></span>
                    </span>
                    <RankBar value={s.activePct} target={SCHOOL_TARGETS.activeStudents} color={BAND_COLORS[band]} height={6} />
                  </li>
                );
              })}
            </ul>
          </OverviewCard>
        </div>
        <div className="lg:col-span-5">
          <OverviewCard title="District against targets" sub="All schools combined" aside={<SeeLink onClick={() => router.push("/counselor?view=readiness")}>Readiness</SeeLink>}>
            <div className="flex flex-col gap-[var(--space-4)]">
              {READINESS_TARGETS.map((key) => {
                const seniorsOnly = key === "seniorPlan" || key === "fafsa";
                const value = seniorsOnly && noSeniors ? null : schoolTargetValue(district, key);
                return <TargetRow key={key} label={TARGET_LABELS[key]} value={value} target={SCHOOL_TARGETS[key]} compact />;
              })}
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  );
}
