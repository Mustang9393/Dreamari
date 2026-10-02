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
//
// Data-viz pass (2 Oct 2026). Direct feedback: "just a LOT of numbers ...
// split content into tabs ... more DATA VIZ ... but we cannot lose content".
// - The staffing card has ONE tab row: Load vs coverage, Table. The table
//   (unchanged, every number) is the second tab.
// - Load vs coverage is a quadrant scatter (QuadrantScatter in districtKit,
//   plain SVG). The table's real question is "which schools are stretched AND
//   under-served", which is two columns read against each other across 11
//   rows; a scatter shows it at once. x = students per counselor, y = follow-up
//   coverage, dot area = enrollment, colour = the same load label the table
//   uses (amber higher load, green within range). Dashed lines sit at the same
//   thresholds the table uses (HIGHER_LOAD_THRESHOLD, LOW_COVERAGE_THRESHOLD),
//   so the two tabs can never disagree. The high-load / low-coverage quadrant
//   gets a 7% amber wash and the label "Needs attention": a data region, not a
//   card tint.
// - Dots are focusable buttons that open that school's Counseling Team, like
//   the table rows. Names are drawn for the attention-quadrant dots and the
//   extremes only; the rest show a card on hover or focus (first tap on touch)
//   because 11 permanent labels would collide.
// - The takeaway line above the chart is computed from the data, replacing
//   the verdict phrase on this tab, so the card still has one verdict. The
//   "N of 11 schools carry a higher load" verdict stays on the Table tab and
//   in the legend line below the chart.

import { useState } from "react";
import { Segmented } from "@/components/connect/viz";
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
import { Bar, EYEBROW, Note, QuadrantScatter, ROWS, SchoolCell, SchoolRow, StatusDot, TableHead, int, useOpenSchool, type QuadrantPoint } from "./districtKit";

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

type Tab = "chart" | "table";
const TABS: { key: Tab; label: string }[] = [
  { key: "chart", label: "Load vs coverage" },
  { key: "table", label: "Table" },
];

/** The one sentence the chart says, computed from the rows. */
function takeaway(R: typeof DISTRICT_CAPACITY_ROWS): string {
  const lowest = [...R].sort((a, b) => a.coverage - b.coverage)[0];
  const attention = R.filter((r) => r.load.id === "higher-load" && r.coverage < LOW_COVERAGE_THRESHOLD);
  if (attention.length === 1) {
    const a = attention[0];
    return a.school.id === lowest.school.id
      ? `${a.school.name} carries a higher load with the lowest coverage`
      : `${a.school.name} carries a higher load and coverage below ${LOW_COVERAGE_THRESHOLD}%`;
  }
  if (attention.length > 1) return `${attention.length} schools carry a higher load and coverage below ${LOW_COVERAGE_THRESHOLD}%`;
  return `No school pairs a higher load with low coverage. ${lowest.school.name} has the lowest coverage, ${lowest.coverage}%`;
}

export function CounselingCapacity() {
  const open = useOpenSchool();
  const [drill, setDrill] = useState<Drill | null>(null);
  const [tab, setTab] = useState<Tab>("chart");
  const R = DISTRICT_CAPACITY_ROWS;
  const higher = R.filter((r) => r.load.id === "higher-load").length;
  const points: QuadrantPoint[] = R.map((r) => ({
    id: r.school.id,
    name: r.school.name,
    x: r.studentsPerCounselor,
    y: r.coverage,
    size: r.students,
    tone: r.load.tone,
    detail: `${r.studentsPerCounselor} per counselor · ${r.coverage}% covered`,
    ariaLabel: `${r.school.name}: ${r.studentsPerCounselor} students per counselor, ${r.load.label}, ${r.coverage}% follow-up coverage, ${r.followUpNeed} students needing follow-up. Open counseling team`,
  }));
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
          <Note>{DISTRICT_CAPACITY.table.subtitle}</Note>
        </div>
        <div>
          <Segmented<Tab> ariaLabel="Staffing view" options={TABS} value={tab} onChange={setTab} />
        </div>
        {tab === "chart" ? (
          <div role="tabpanel" aria-label="Load vs coverage" className="flex flex-col gap-[var(--space-3)]">
            <Verdict band={higher > 0 ? "near" : "met"}>{takeaway(R)}</Verdict>
            <QuadrantScatter
              points={points}
              xThreshold={HIGHER_LOAD_THRESHOLD}
              yThreshold={LOW_COVERAGE_THRESHOLD}
              xTitle="Students per counselor"
              yTitle="Follow-up coverage"
              xThresholdLabel={`Higher load: over ${HIGHER_LOAD_THRESHOLD}`}
              yThresholdLabel={`Low coverage: under ${LOW_COVERAGE_THRESHOLD}%`}
              attentionLabel="Needs attention"
              yUnit="%"
              onOpen={(id) => open(id, "team")}
              ariaLabel={`Schools by students per counselor and follow-up coverage. ${takeaway(R)}. The table tab lists the same numbers.`}
            />
            <p className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-[6px]"><StatusDot color="var(--cd-amber)" />Higher load ({higher} of {R.length} schools)</span>
              <span className="flex items-center gap-[6px]"><StatusDot color="var(--cd-green)" />Within range</span>
              <span>Dot area = enrollment</span>
              <span>Select a dot to open its counseling team</span>
            </p>
          </div>
        ) : (
        <div role="tabpanel" aria-label="Table" className="flex flex-col gap-[var(--space-3)]">
        <Verdict band={higher > 0 ? "near" : "met"}>{higher > 0 ? `${higher} of ${R.length} schools carry a higher load` : "Every school is within range"}</Verdict>
        <Note>Sorted by follow-up need.</Note>
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
        </div>
        )}
        <Note><span className={EYEBROW}>{DISTRICT_CAPACITY.note.title}</span> · {DISTRICT_CAPACITY.note.body}</Note>
      </section>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
