"use client";

// CounselingCapacity: is every school staffed for the students it has, and
// is follow-up reaching the students who need it?
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 3.4 (Counseling Capacity).
//
// Deliberate deviations from the Replit, with the WHY:
// - The hero's four numbers (students per counselor, follow-ups, coverage,
//   capacity improvement) are drill tiles; each drill lists every school's
//   value. The Replit's (i) tooltip text is the lead of the matching drill.
//   The hero card is the screen's only glow (the Replit's lavender panel).
// - Capacity improvement stays a relative %, never points: the caption says
//   so on the card, and the drill's stats say it again.
// - Rows open that school's Counseling Team (as the Replit does) and the
//   separate "Open view" link is the hover chevron, so the row is one target.
// - The per-school coverage (i) tooltip is cut: the same definition for every
//   row, already in the Coverage drill. The bar turns amber below the
//   inferred coverage threshold (the Replit's coral), the one status colour
//   here besides the "higher load" dot.
// - One verdict phrase above the table: how many schools carry a higher load.
// - At 375px rows stack: name, load, then follow-up and coverage on one line.

import { useState } from "react";
import { OverviewCard, Verdict } from "../../overviewShared";
import { DrillPanel, DrillTile, type Drill } from "../../Drill";
import { GLASS_CARD } from "../../../surfaces";
import {
  DISTRICT_CAPACITY,
  DISTRICT_CAPACITY_ROWS,
  DISTRICT_TOTALS,
  HIGHER_LOAD_THRESHOLD,
  LOW_COVERAGE_THRESHOLD,
} from "@/lib/leaderData";
import { Bar, EYEBROW, Note, ROWS, SchoolCell, SchoolRow, StatusDot, TableHead, int, useOpenSchool } from "./districtKit";

const TEMPLATE = "md:grid-cols-[minmax(0,1fr)_84px_76px_150px_108px_132px]";
const HERO = DISTRICT_CAPACITY.hero;
const maxOf = (xs: number[]) => Math.max(...xs, 1);

/** A load label: a coloured dot and the words. Higher load is the one amber. */
function LoadLabel({ load }: { load: { label: string; tone: "positive" | "negative" } }) {
  return (
    <span className="flex items-center gap-[6px] text-[11.5px] leading-[16px] font-bold" style={{ color: "var(--muted-foreground)" }}>
      <StatusDot color={load.tone === "negative" ? "var(--cd-amber)" : "var(--cd-green)"} />
      {load.label}
    </span>
  );
}

export function CounselingCapacity() {
  const open = useOpenSchool();
  const [drill, setDrill] = useState<Drill | null>(null);
  const R = DISTRICT_CAPACITY_ROWS;
  const higher = R.filter((r) => r.load.id === "higher-load").length;
  const tip = (id: string) => HERO.stats.find((s) => s.id === id)?.tooltip ?? undefined;

  const drills: Record<string, () => Drill> = {
    load: () => {
      const rows = [...R].sort((a, b) => b.studentsPerCounselor - a.studentsPerCounselor);
      const top = maxOf(rows.map((r) => r.studentsPerCounselor));
      return {
        title: "Students per counselor",
        subtitle: `${int(DISTRICT_TOTALS.enrollment)} students · ${DISTRICT_TOTALS.counselors} counselors`,
        lead: `${HERO.line} Above ${HIGHER_LOAD_THRESHOLD} students per counselor a school reads as higher load. Student-to-counselor ratios provide staffing context; they do not measure service quality.`,
        stats: [
          { value: String(HERO.studentsPerCounselor), label: "District average" },
          { value: `${higher} of ${R.length}`, label: "Schools with a higher load" },
        ],
        rowsLabel: "Every school, highest load first",
        rows: rows.map((r) => ({ label: `${r.school.name} · ${r.load.label}`, value: `${r.studentsPerCounselor} (${r.counselors} counselors)`, pct: (r.studentsPerCounselor / top) * 100 })),
      };
    },
    need: () => {
      const rows = [...R].sort((a, b) => b.followUpNeed - a.followUpNeed);
      const top = maxOf(rows.map((r) => r.followUpNeed));
      return {
        title: "Students requiring follow-up",
        subtitle: "Identified across schools · 2026–27",
        lead: "Students flagged for follow-up in every school. Coverage is the share of them with an action recorded.",
        stats: [{ value: HERO.stats[0].value, label: "Students flagged" }],
        rowsLabel: "Every school, greatest need first",
        rows: rows.map((r) => ({ label: r.school.name, value: `${r.followUpNeed} students`, pct: (r.followUpNeed / top) * 100 })),
      };
    },
    coverage: () => {
      const rows = [...R].sort((a, b) => a.coverage - b.coverage);
      return {
        title: "Follow-up coverage",
        subtitle: "District weighted coverage · 2026–27",
        lead: tip("follow-up-coverage"),
        stats: [
          { value: HERO.stats[1].value, label: "District coverage" },
          { value: HERO.stats[0].value, label: "Students flagged" },
        ],
        rowsLabel: "Every school, lowest coverage first",
        rows: rows.map((r) => ({ label: r.school.name, value: `${r.coverage}% of ${r.followUpNeed}`, pct: r.coverage })),
      };
    },
    improvement: () => {
      const rows = [...R].sort((a, b) => b.school.counselorEfficiency.pct - a.school.counselorEfficiency.pct);
      const top = maxOf(rows.map((r) => r.school.counselorEfficiency.pct));
      return {
        title: "Counselor capacity improvement",
        subtitle: "Relative change vs prior workflow · not percentage points",
        lead: tip("capacity-improvement"),
        stats: [
          { value: HERO.stats[2].value, label: "District, relative" },
          { value: "0% relative", label: "Launch baseline" },
        ],
        rowsLabel: "Counselor efficiency by school, relative % (highest first)",
        rows: rows.map((r) => ({ label: r.school.name, value: `+${r.school.counselorEfficiency.pct}% relative`, pct: (r.school.counselorEfficiency.pct / top) * 100 })),
      };
    },
  };

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <OverviewCard hero title="District coverage" tint="var(--primary)">
        <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <DrillTile onOpen={() => setDrill(drills.load())} label="Students per counselor" className="h-full justify-center gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]">
            <span className="text-[56px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{HERO.studentsPerCounselor}</span>
            <span className="text-[13px] font-bold" style={{ color: "var(--primary)" }}>{HERO.caption}</span>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{HERO.line}</span>
          </DrillTile>
          <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-3">
            {([["need", HERO.stats[0]], ["coverage", HERO.stats[1]], ["improvement", HERO.stats[2]]] as const).map(([key, s]) => (
              <DrillTile key={key} onOpen={() => setDrill(drills[key]())} label={s.label} className="h-full gap-[4px] rounded-[var(--radius-md)] border p-[var(--space-4)] pb-[var(--space-5)]">
                <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
                <span className="text-[30px] leading-[1.05] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.value}</span>
                <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  {key === "improvement" ? "relative % vs prior workflow, not points" : s.caption}
                </span>
              </DrillTile>
            ))}
          </div>
        </div>
      </OverviewCard>

      <section aria-label={DISTRICT_CAPACITY.table.title} className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <div className="flex flex-col gap-[6px]">
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{DISTRICT_CAPACITY.table.title}</h2>
          <Verdict band={higher > 0 ? "near" : "met"}>{higher > 0 ? `${higher} of ${R.length} schools carry a higher load` : "Every school is within range"}</Verdict>
          <Note>{DISTRICT_CAPACITY.table.subtitle} Sorted by follow-up need.</Note>
        </div>
        <div className="dm-scroll -mx-[10px] overflow-x-auto">
          <div className="md:min-w-[760px]">
            <TableHead
              template={TEMPLATE}
              labels={[{ label: "School" }, { label: "Counselors", align: "right" }, { label: "Students", align: "right" }, { label: "Students / counselor", align: "right" }, { label: "Follow-up need", align: "right" }, { label: "Coverage" }]}
            />
            <div className={ROWS}>
              {R.map((r) => {
                const low = r.coverage < LOW_COVERAGE_THRESHOLD;
                return (
                  <SchoolRow key={r.school.id} school={r.school} onOpen={open} view="team">
                    <span className={`hidden items-center gap-[12px] md:grid ${TEMPLATE}`}>
                      <SchoolCell school={r.school} students={r.students} />
                      <span className="text-right text-[14px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.counselors}</span>
                      <span className="text-right text-[14px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{int(r.students)}</span>
                      <span className="flex flex-col items-end gap-[3px]">
                        <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.studentsPerCounselor}</span>
                        <LoadLabel load={r.load} />
                      </span>
                      <span className="flex flex-col items-end gap-[3px]">
                        <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.followUpNeed}</span>
                        <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{DISTRICT_CAPACITY.table.followUpUnit}</span>
                      </span>
                      <span className="flex flex-col gap-[5px]">
                        <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: low ? "var(--cd-amber)" : "var(--foreground)" }}>{r.coverage}%</span>
                        <Bar value={r.coverage} color={low ? "var(--cd-amber)" : "var(--primary)"} />
                      </span>
                    </span>
                    <span className="flex flex-col gap-[6px] md:hidden">
                      <SchoolCell school={r.school} students={r.students} />
                      <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                        <span>{r.counselors} {r.counselors === 1 ? "counselor" : "counselors"} · {r.studentsPerCounselor} per counselor</span>
                        <LoadLabel load={r.load} />
                      </span>
                      <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                        {r.followUpNeed} need follow-up · <span style={{ color: low ? "var(--cd-amber)" : "var(--foreground)" }} className="font-bold">{r.coverage}% covered</span>
                      </span>
                    </span>
                  </SchoolRow>
                );
              })}
            </div>
          </div>
        </div>
        <Note><span className={EYEBROW}>{DISTRICT_CAPACITY.note.title}</span> · {DISTRICT_CAPACITY.note.body}</Note>
      </section>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
