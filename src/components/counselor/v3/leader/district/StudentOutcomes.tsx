"use client";

// StudentOutcomes: how do the grades compare, and what are students choosing?
// DEMO-ONLY v3 (2 Oct 2026). Implements NOTES.md 3.3 (Student Outcomes).
//
// 2 Oct 2026 redundancy pass. Direct feedback: "Why is everything a bar
// chart? ... do whatever graphs are being used make sense for the metrics?"
// and "Student activity etc can be one graph with many bars with legends
// instead of each thing being a title and a graph". So each chart type now
// follows its metric, and comparable items share one chart:
// - Cut the By school comparison: every school's value per measure, ranked,
//   lives on School Performance (one tab per measure, Professional included).
// - Cut the District rollup block: district value, baseline and change per
//   measure are in Data definitions (and the District Overview cards).
// - By grade (an ordinal sequence) is ONE grouped column chart: four grade
//   groups, five measures as series, so every by-grade fact shows at once
//   instead of behind a Metric select and a toggle. Group labels carry each
//   grade's student count.
// - Milestone completion (each a share of students, progress to 100%) is
//   five rings. Participation totals (comparable counts) are one column
//   chart on a shared scale; each count's description is in a drill.
// - Career interests, postsecondary choices and intentions are part-of-whole
//   shares: donuts with a legend (intentions matches the School role's
//   SchoolPostsecondary ring).
// - Cut the explanatory lines (card subtitles that restated titles, the
//   per-metric definition footer, the closing note). "Share of responses"
//   and "no launch baseline" now sit in each card's unit; definitions and
//   the synthetic-data notice are in Data definitions.
// - Cards in a row share one height (standing rule).

import { useState } from "react";
import { BarChart, Ring } from "@/components/connect/viz";
import { BLUE_5, PRIMARY } from "../../../palette";
import { GLASS_INSET } from "../../../surfaces";
import { OverviewCard, SeeLink, Verdict } from "../../overviewShared";
import { DrillPanel, type Drill } from "../../Drill";
import { DISTRICT_GRADE_STUDENTS, DISTRICT_STUDENT_OUTCOMES, OUTCOME_METRICS } from "@/lib/leaderData";
import { ShareDonut, int } from "./districtKit";

const GRADES = [9, 10, 11, 12] as const;
// Short group labels for the participation chart; the full name and its
// description are in the drill.
const PARTICIPATION_SHORT: Record<string, string> = {
  "Professionals Engaged": "Professionals",
  "Career Conversations": "Conversations",
  "Career Events": "Events",
  "Work-Based Learning Experiences": "Work-based",
  "Career Simulations Completed": "Simulations",
};

/** The one line the grade chart says, computed from the data. */
function gradeVerdict(): string {
  const rising = OUTCOME_METRICS.every((m) => m.byGrade.every((v, i) => i === 0 || v >= m.byGrade[i - 1]));
  if (rising) return "Every measure climbs grade by grade";
  const leads = GRADES.map((_, gi) => OUTCOME_METRICS.filter((m) => m.byGrade[gi] === Math.max(...m.byGrade)).length);
  return `Grade ${GRADES[leads.indexOf(Math.max(...leads))]} leads on most measures`;
}

export function StudentOutcomes() {
  const O = DISTRICT_STUDENT_OUTCOMES;
  const [drill, setDrill] = useState<Drill | null>(null);
  const milestones = [...O.milestones.rows].sort((a, b) => b.value - a.value);
  const part = O.participation.rows;
  const partMax = Math.ceil(Math.max(...part.map((r) => r.value)) / 500) * 500;
  const partDrill = (): Drill => ({
    title: O.participation.title,
    items: part.map((r) => `${r.label}: ${r.tooltip}`),
  });

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <OverviewCard hero title="Outcomes by grade" unit="% of students · n per grade">
        <Verdict band="met">{gradeVerdict()}</Verdict>
        <BarChart
          barStyle="solid"
          height={240}
          groups={GRADES.map((g) => `Grade ${g} · ${int(DISTRICT_GRADE_STUDENTS[g])}`)}
          series={OUTCOME_METRICS.map((m, i) => ({ label: m.label, accent: BLUE_5[i], values: [...m.byGrade] }))}
          maxBarWidth={22}
        />
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <OverviewCard title={O.milestones.title} unit="% of students · no launch baseline">
          <ul className="grid flex-1 grid-cols-3 content-center gap-x-[var(--space-3)] gap-y-[var(--space-4)] sm:grid-cols-5">
            {milestones.map((r) => (
              <li key={r.label} className="flex flex-col items-center gap-[8px] text-center">
                <Ring pct={r.value} size={76} stroke={8} accent={PRIMARY}>
                  <span className="text-[17px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.value}%</span>
                </Ring>
                <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--foreground)" }}>{r.label}</span>
              </li>
            ))}
          </ul>
        </OverviewCard>
        <OverviewCard title={O.participation.title} unit="district totals" aside={<SeeLink onClick={() => setDrill(partDrill())}>Definitions</SeeLink>}>
          <BarChart
            barStyle="solid"
            height={210}
            groups={part.map((r) => PARTICIPATION_SHORT[r.label] ?? r.label)}
            series={[{ label: O.participation.title, accent: PRIMARY, values: part.map((r) => r.value) }]}
            max={partMax}
            valueSuffix=""
            maxBarWidth={30}
          />
        </OverviewCard>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <OverviewCard title={O.interests.title} unit="% of responses · no launch baseline">
          <ShareDonut rows={O.interests.rows} centerLabel={O.interests.rows[0].label} />
        </OverviewCard>
        <OverviewCard title={O.choices.title} unit="% of responses · no launch baseline">
          <ShareDonut rows={O.choices.rows} centerLabel={O.choices.rows[0].label} />
        </OverviewCard>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <OverviewCard title={O.intentions.title} unit="% of responses · no launch baseline">
          <ShareDonut rows={O.intentions.rows} centerLabel="plan 4-year" />
        </OverviewCard>
        <OverviewCard title={O.emerging.title} unit="not ranked · not a forecast">
          <ul className="flex flex-wrap gap-[8px]">
            {O.emerging.chips.map((c) => (
              <li key={c} className="rounded-full border px-[12px] py-[5px] text-[12.5px] font-bold" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>{c}</li>
            ))}
          </ul>
        </OverviewCard>
      </div>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
