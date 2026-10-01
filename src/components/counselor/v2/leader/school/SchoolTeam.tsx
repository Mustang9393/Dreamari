"use client";

// What this screen answers: is every student reached, is planning getting
// finished, and are flagged students being followed up, across the counseling
// team. It is deliberately not a ranking of staff.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.4 (Counseling Team) and
// 3.6 (named counselors only at Northbridge; "Counselor A..." elsewhere).
//
// Deliberate deviations from the Replit, with why:
// - The per-counselor accordion became a drill. Opening a card only revealed
//   one number (documented follow-up coverage) and one caption; this app
//   shows "more detail" in the side panel, and a drill also holds both (i)
//   texts. Cards keep the three stats of the collapsed Replit card and stay in
//   data order with no sort, no colour coding and no bars on the page, so
//   they cannot be read as a league table.
// - "Operational signals support planning; they are not staff rankings" is
//   said once above the cards and again in each drill, not on every
//   expanded card.
// - Summary: the three stats that carry a definition (Planning Milestone
//   Completion, Counselor Efficiency, Follow-up coverage) are drill tiles in
//   place of (i) icons. Counselor Efficiency is labelled as a relative
//   change, not points. One hero: the summary card.

import { useState } from "react";
import { GLASS_INSET } from "@/components/counselor/surfaces";
import { OverviewCard, InitialsBadge } from "../../overviewShared";
import { DrillPanel, DrillTile, type Drill } from "../../Drill";
import { num, useSchoolDetail } from "./schoolKit";
import type { CounselorRow } from "@/lib/leaderData";

export function SchoolTeam() {
  const detail = useSchoolDetail();
  const t = detail.counselingTeam;
  const { school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const sub = `${school.name} · ${num(school.enrollment)} students · 2026–27`;

  const statDrill = (id: string): Drill => {
    const s = t.summary.stats.find((x) => x.id === id)!;
    if (id === "efficiency") {
      return {
        title: s.label,
        subtitle: sub,
        lead: s.tooltip,
        stats: [
          { value: s.value, label: "Relative gain vs prior workflow" },
          { value: `${school.counselorEfficiency.hoursPerWeek} hrs`, label: "Admin time returned per counselor, per week" },
        ],
      };
    }
    return { title: s.label, subtitle: sub, lead: s.tooltip, stats: [{ value: s.value, label: "Current" }] };
  };
  const followDrill: Drill = {
    title: t.summary.followUpCoverage.label,
    subtitle: sub,
    lead: t.summary.followUpCoverage.tooltip,
    stats: [
      { value: `${t.summary.followUpCoverage.value}%`, label: "Current" },
      { value: String(school.followUps), label: "Students requiring follow-up" },
    ],
  };
  const counselorDrill = (c: CounselorRow): Drill => ({
    title: c.name,
    subtitle: `${t.cardCaption} · ${sub}`,
    lead: c.milestoneTooltip,
    stats: [
      { value: num(c.students), label: "Students" },
      { value: String(c.followUps), label: "Students requiring follow-up" },
    ],
    rowsLabel: "Coverage",
    rows: [
      { label: "Planning Milestone Completion", value: `${c.planningMilestone}%`, pct: c.planningMilestone },
      { label: "Documented follow-up coverage", value: `${c.followUpCoverage}%`, pct: c.followUpCoverage },
    ],
    itemsLabel: "About this view",
    items: [c.followUpTooltip, t.expandedCaption],
  });

  const stat = "gap-[2px] rounded-[var(--radius-md)] border p-[12px]";
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <OverviewCard title={school.name} unit="counseling team" hero>
        <div className="grid grid-cols-2 gap-[8px] md:grid-cols-3 xl:grid-cols-6">
          {t.summary.stats.map((s) => {
            const body = (
              <>
                <span className="text-[24px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.value}</span>
                <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  {s.label}
                  {s.id === "efficiency" && " (relative, not points)"}
                </span>
              </>
            );
            return s.tooltip ? (
              <DrillTile key={s.id} onOpen={() => setDrill(statDrill(s.id))} label={s.label} className={stat}>{body}</DrillTile>
            ) : (
              <span key={s.id} className={`flex flex-col ${stat}`} style={GLASS_INSET}>{body}</span>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
          <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.summary.adminTime}</span>
          <span className="w-full sm:w-[240px]">
            <DrillTile onOpen={() => setDrill(followDrill)} label={t.summary.followUpCoverage.label} className="!flex-row items-baseline gap-[8px] rounded-[var(--radius-sm)] border px-[12px] py-[8px] pr-[34px]">
              <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.summary.followUpCoverage.label}</span>
              <span className="text-[16px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{t.summary.followUpCoverage.value}%</span>
            </DrillTile>
          </span>
        </div>
      </OverviewCard>

      <OverviewCard title="Counselors" unit={t.expandedCaption}>
        <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
          {t.counselors.map((c) => (
            <DrillTile key={c.name} onOpen={() => setDrill(counselorDrill(c))} label={c.name} className="gap-[var(--space-4)] rounded-[var(--radius-md)] border p-[var(--space-4)]">
              <span className="flex items-center gap-[10px]">
                <InitialsBadge name={c.name} size={36} />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.cardCaption}</span>
                </span>
              </span>
              <span className="grid grid-cols-3 gap-[8px]">
                {[
                  [num(c.students), "Students"],
                  [`${c.planningMilestone}%`, "Planning milestones"],
                  [String(c.followUps), "Need follow-up"],
                ].map(([v, l]) => (
                  <span key={l} className="flex flex-col gap-[2px]">
                    <span className="text-[20px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v}</span>
                    <span className="text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</span>
                  </span>
                ))}
              </span>
            </DrillTile>
          ))}
        </div>
      </OverviewCard>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
