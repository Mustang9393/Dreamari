"use client";

// What this screen answers: is every student reached, is planning getting
// finished, and are flagged students being followed up, across the counseling
// team. It is deliberately not a ranking of staff.
//
// DEMO-ONLY v3 (2 Oct 2026). Implements NOTES.md 2.4 (Counseling Team) and
// 3.6 (named counselors only at Northbridge; "Counselor A..." elsewhere).
//
// Deliberate deviations from the Replit, with why:
// - The per-counselor accordion became a drill. Opening a card only revealed
//   one number (documented follow-up coverage) and one caption; this app
//   shows "more detail" in the side panel, and a drill also holds both (i)
//   texts. Cards keep the three stats of the collapsed Replit card and stay in
//   data order with no sort, no colour coding and no bars comparing one
//   counselor with another, so they cannot be read as a league table.
// - "Not staff rankings" is said once, above the cards.
// - Summary: the three stats that carry a definition (Planning Milestone
//   Completion, Counselor Efficiency, Follow-up coverage) are drill tiles in
//   place of (i) icons. Counselor Efficiency is labelled as a relative
//   change, not points. One hero: the summary card.
// - Viz pass (2 Oct 2026). The Replit shows a row of six numbers and four
//   cards of three numbers each, which reads as "just a lot of numbers".
//   Percentages are now drawn as rings; counts stay numbers.
//   - Summary: Planning Milestone Completion and Follow-up coverage are
//     rings (they are the two shares); counselors, students, caseload,
//     students requiring follow-up and the efficiency gain stay figures. The
//     Replit's footer pill for follow-up coverage became the second ring, and
//     the admin-time sentence stays as the card's footer line.
//   - Counselor cards: each counselor's planning completion (a card stat in
//     the Replit) and documented follow-up coverage (hidden in the Replit's
//     expanded accordion) are two small rings side by side, with students and
//     follow-ups as numbers. Showing coverage on the card, not only in the
//     drill, is a deliberate gain; both rings are the same blue, so no
//     counselor is coloured as better or worse.
//   - Deliberately NOT drawn: any bar or chart that lines counselors up
//     against each other, any sort, any rank. The Replit says these are "not
//     staff rankings" and a comparison chart would be exactly that. Each ring
//     is read against 100%, never against a colleague.
//
// 2 Oct 2026 redundancy pass (repeats inside this screen only), with why:
// - Title is "Counseling team": the school name is already the page header.
// - 38 (students requiring follow-up) was a tile AND the follow-up ring's
//   caption; it stays once, in the caption. 964 was a tile AND the planning
//   ring's caption; it stays once, in the tile.
// - The admin-hours footer sentence is now the efficiency tile's second
//   line, so efficiency and the hours it returns read as one fact.
// - The follow-up drill gains the 85% launch baseline and the change, so
//   Student Progress no longer has to carry Follow-Up Coverage.
// - "Operational coverage view" was printed on every counselor card and in
//   every drill, and "not staff rankings" in the section header AND every
//   drill. One short caption for the section now says it once.

import { useState } from "react";
import { Ring } from "@/components/connect/viz";
import { GLASS_INSET } from "@/components/counselor/surfaces";
import { OverviewCard, InitialsBadge } from "../../overviewShared";
import { DrillPanel, DrillTile, type Drill } from "../../Drill";
import { num, useSchoolDetail } from "./schoolKit";
import type { CounselorRow } from "@/lib/leaderData";

export function SchoolTeam() {
  const detail = useSchoolDetail();
  const t = detail.counselingTeam;
  const { school } = detail;
  // Launch baseline and change for follow-up coverage (from the Student Progress data).
  const followKpi = detail.studentProgress.kpis.find((k) => k.id === "follow-up");
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
      ...(followKpi ? [{ value: `${followKpi.baseline}%`, label: "Launch baseline" }, { value: `${followKpi.delta >= 0 ? "+" : ""}${followKpi.delta} pts`, label: "Change since launch" }] : []),
      { value: String(school.followUps), label: "Students requiring follow-up" },
    ],
  };
  const counselorDrill = (c: CounselorRow): Drill => ({
    title: c.name,
    subtitle: sub,
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
    items: [c.followUpTooltip],
  });

  const stat = "gap-[2px] rounded-[var(--radius-md)] border p-[12px]";
  const figure = (id: string) => t.summary.stats.find((x) => x.id === id)!;
  const planning = figure("planning");
  const planningPct = Number.parseFloat(planning.value);
  const cov = t.summary.followUpCoverage;
  const ringTile = "h-full !flex-row items-center gap-[var(--space-4)] rounded-[var(--radius-md)] border p-[var(--space-4)] pr-[34px]";
  const bigNum = "text-[24px] leading-[1.1] font-extrabold tabular-nums";
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <OverviewCard title="Counseling team" hero>
        <div className="grid grid-cols-2 gap-[8px] md:grid-cols-4">
          {(["counselors", "students", "caseload", "efficiency"] as const).map((id) => {
            const s = figure(id);
            const body = (
              <>
                <span className={bigNum} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.value}</span>
                <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  {s.id === "efficiency" ? `${s.label}, vs prior workflow` : s.label}
                </span>
                {s.id === "efficiency" && <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{school.counselorEfficiency.hoursPerWeek} hrs a week back per counselor</span>}
              </>
            );
            return s.tooltip ? (
              <DrillTile key={s.id} onOpen={() => setDrill(statDrill(s.id))} label={s.label} className={stat}>{body}</DrillTile>
            ) : (
              <span key={s.id} className={`flex flex-col ${stat}`} style={GLASS_INSET}>{body}</span>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-[8px] md:grid-cols-2">
          <DrillTile onOpen={() => setDrill(statDrill("planning"))} label={planning.label} className={ringTile}>
            <Ring pct={planningPct} size={72} stroke={8} accent="var(--primary)">
              <span className="text-[16px] leading-none font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{planning.value}</span>
            </Ring>
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className="text-[14px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{planning.label}</span>
              <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of enrolled students</span>
            </span>
          </DrillTile>
          <DrillTile onOpen={() => setDrill(followDrill)} label={cov.label} className={ringTile}>
            <Ring pct={cov.value} size={72} stroke={8} accent="var(--primary)">
              <span className="text-[16px] leading-none font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{cov.value}%</span>
            </Ring>
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className="text-[14px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{cov.label}</span>
              <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of {school.followUps} students requiring follow-up</span>
            </span>
          </DrillTile>
        </div>
      </OverviewCard>

      <OverviewCard title="Counselors" unit="not a staff ranking">
        <div className={`grid grid-cols-1 gap-[var(--space-4)] ${t.counselors.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {t.counselors.map((c) => (
            <DrillTile key={c.name} onOpen={() => setDrill(counselorDrill(c))} label={c.name} className="h-full gap-[var(--space-4)] rounded-[var(--radius-md)] border p-[var(--space-4)]">
              <span className="flex items-center gap-[10px]">
                <InitialsBadge name={c.name} size={36} />
                <span className="truncate text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
              </span>
              <span className="grid grid-cols-2 gap-[var(--space-3)]">
                {[
                  [c.planningMilestone, "Planning milestones"],
                  [c.followUpCoverage, "Follow-up coverage"],
                ].map(([v, l]) => (
                  <span key={l} className="flex items-center gap-[10px]">
                    <Ring pct={Number(v)} size={60} stroke={7} accent="var(--primary)">
                      <span className="text-[14px] leading-none font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{v}%</span>
                    </Ring>
                    <span className="min-w-0 text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</span>
                  </span>
                ))}
              </span>
              <span className="mt-auto grid grid-cols-2 gap-[var(--space-3)] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
                {[
                  [num(c.students), "Students"],
                  [String(c.followUps), "Need follow-up"],
                ].map(([v, l]) => (
                  <span key={l} className="flex items-baseline gap-[6px]">
                    <span className="text-[20px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v}</span>
                    <span className="text-[12px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</span>
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
