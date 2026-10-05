"use client";

// What this screen answers: is every student reached, is planning getting
// finished, and are flagged students being followed up, across the counseling
// team. It is deliberately not a ranking of staff.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.4 (Counseling Team) and
// 3.6 (named counselors only at Northbridge; "Counselor A..." elsewhere). The
// v2 rules still hold: the per-counselor accordion is a drill (both (i)
// texts plus the "not staff rankings" caption), counselors stay in data
// order with no sort and the same blue for everyone, every share is read
// against 100%, never against a colleague, and Counselor Efficiency is
// labelled a relative change, not points.
//
// v4 rebuild (6 Oct 2026). WHY: this was v2 (an OverviewCard hero with five
// GLASS_INSET stat tiles in extrabold, two ring tiles, a grid of counselor
// cards each with two rings). Direct instruction: make the leader roles
// "like this version" in every aspect. It is now the counselor's Today:
//   - The four team counts as Today's hairline signal strip (Counselors,
//     Students, Average caseload, Students requiring follow-up).
//   - Counselors as Today's "next conversations" sheet: one numbered
//     hairline row per counselor with two quiet lanes (planning milestones,
//     follow-up coverage), students and follow-ups as the row's small line.
//     Every row opens that counselor's drill. Same blue on both lanes for
//     everyone, data order, no rank: the "not staff rankings" sentence is
//     the sheet's foot, said once.
//   - Follow-up coverage as Today's review island beside it: the light hero
//     number, then Planning Milestone Completion, Counselor Efficiency and
//     the admin time returned as the island's stack, each opening its drill.
//   - Nothing dropped: the six summary figures, the admin-time sentence,
//     follow-up coverage and every counselor's four numbers and two (i)
//     texts are on the face or one click away.

import { useState } from "react";
import { Clock3, FileCheck2, Gauge, ShieldCheck } from "lucide-react";
import { Go } from "../../chips";
import { DrillPanel, type Drill } from "../../Drill";
import { num, schoolLine, useSchoolDetail } from "./schoolKit";
import { SignalStrip } from "../kit";
import type { CounselorRow } from "@/lib/leaderData";

function Meter({ value, label }: { value: number; label: string }) {
  return (
    <span className="v4-school-meter" aria-hidden>
      <small>{label}</small>
      <span className="v4-school-meter-track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />{[25, 50, 75].map((t) => <i key={t} style={{ left: `${t}%` }} />)}</span>
      <b>{value}%</b>
    </span>
  );
}

export function SchoolTeam() {
  const detail = useSchoolDetail();
  const t = detail.counselingTeam;
  const { school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const sub = schoolLine(detail);
  const figure = (id: string) => t.summary.stats.find((x) => x.id === id)!;
  const cov = t.summary.followUpCoverage;

  const statDrill = (id: string): Drill => {
    const s = figure(id);
    if (id === "efficiency") {
      return {
        title: s.label,
        subtitle: sub,
        lead: s.tooltip,
        stats: [
          { value: s.value, label: "Relative gain vs prior workflow" },
          { value: `${school.counselorEfficiency.hoursPerWeek} hrs`, label: "Admin time returned per counselor, per week" },
        ],
        items: [t.summary.adminTime],
      };
    }
    return { title: s.label, subtitle: sub, lead: s.tooltip, stats: [{ value: s.value, label: "Current" }, { value: num(school.enrollment), label: "Enrolled students" }] };
  };
  const followDrill: Drill = {
    title: cov.label,
    subtitle: sub,
    lead: cov.tooltip,
    stats: [
      { value: `${cov.value}%`, label: "Current" },
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

  const planning = figure("planning");
  const efficiency = figure("efficiency");

  return (
    <div className="v4-daily v4-leader-page">
      <SignalStrip
        label={`${school.name} counseling team`}
        items={[
          { label: figure("counselors").label, value: figure("counselors").value, small: "on the team" },
          { label: figure("students").label, value: figure("students").value, small: "enrolled" },
          { label: figure("caseload").label === "Average Caseload" ? "Average caseload" : figure("caseload").label, value: figure("caseload").value, small: "students per counselor" },
          { label: figure("follow-ups").label === "Students Requiring Follow-Up" ? "Students requiring follow-up" : figure("follow-ups").label, value: figure("follow-ups").value, small: `${cov.value}% have a follow-up`, onClick: () => setDrill(followDrill), aria: `${figure("follow-ups").value} students requiring follow-up. Open follow-up coverage` },
        ]}
      />

      <div className="v4-daily-grid">
        <section className="v4-focus-sheet flex flex-col">
          <header className="v4-section-head"><div><h2>Counselors</h2></div><span className="v4-pill">{t.counselors.length} {t.counselors.length === 1 ? "counselor" : "counselors"}</span></header>
          <div className="v4-school-team-head" aria-hidden><span>Counselor</span><span>Planning milestones</span><span>Follow-up coverage</span></div>
          <div className="v4-leader-rows">
            {t.counselors.map((c, i) => (
              <button key={c.name} type="button" className="v4-school-team-row" onClick={() => setDrill(counselorDrill(c))} aria-label={`${c.name}: ${num(c.students)} students, ${c.followUps} need follow-up, planning milestones ${c.planningMilestone}%, follow-up coverage ${c.followUpCoverage}%. Open details`}>
                <span className="v4-list-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="v4-school-who">
                  <span className="v4-school-monogram" aria-hidden>{c.initials}</span>
                  <span className="min-w-0"><strong>{c.name}</strong><small>{num(c.students)} students · {c.followUps} need follow-up</small></span>
                </span>
                <Meter value={c.planningMilestone} label="Planning milestones" />
                <Meter value={c.followUpCoverage} label="Follow-up coverage" />
                <Go />
              </button>
            ))}
          </div>
          <div className="v4-sheet-foot mt-auto"><span>{t.expandedCaption}</span><span>Each share is read against 100%</span></div>
        </section>

        <section className="v4-review-island">
          <header className="v4-section-head"><span className="v4-overline">{cov.label}</span><ShieldCheck size={22} aria-hidden /></header>
          <div className="v4-review-number"><strong>{cov.value}<small className="text-[30px] tracking-normal">%</small></strong><span>of {school.followUps} students requiring<br />follow-up have one recorded</span></div>
          <div className="v4-review-stack">
            <button type="button" onClick={() => setDrill(statDrill("planning"))}><span className="v4-mini-document" style={{ color: "var(--v4-chart-1)" }}><FileCheck2 size={17} aria-hidden /></span><span>{planning.label}</span><b>{planning.value}</b></button>
            <button type="button" onClick={() => setDrill(statDrill("efficiency"))}><span className="v4-mini-document" style={{ color: "var(--v4-chart-2)" }}><Gauge size={17} aria-hidden /></span><span>{efficiency.label} <small className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>relative, not points</small></span><b>{efficiency.value}</b></button>
            <button type="button" onClick={() => setDrill(statDrill("efficiency"))}><span className="v4-mini-document" style={{ color: "var(--v4-chart-3)" }}><Clock3 size={17} aria-hidden /></span><span>Admin time returned per counselor</span><b>{school.counselorEfficiency.hoursPerWeek} hrs/wk</b></button>
          </div>
          <button type="button" className="v4-island-action" onClick={() => setDrill(followDrill)}>How coverage is counted <Go /></button>
        </section>
      </div>

      <p className="v4-data-note">{school.name} · {num(school.enrollment)} students · demo data. Operational coverage, not student outcomes.</p>
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
