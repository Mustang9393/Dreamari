"use client";

// CounselingCapacity: is every school staffed for the students it has, and
// is follow-up reaching the students who need it?
// DEMO-ONLY data (2 Oct 2026, NOTES.md 3.4).
//
// Decisions kept from the v2 build (2 Oct 2026), with the WHY:
// - The four district numbers (students per counselor, follow-up need,
//   coverage, capacity improvement) each open a drill listing every
//   school's value; the Replit's (i) tooltip is the drill's lead.
// - Capacity improvement stays a relative %, never points: said on the
//   face and again in the drill.
// - Rows and dots open that school's Counseling Team (as the Replit does).
// - One tab row on the staffing sheet: Load vs coverage (a quadrant
//   scatter: x students per counselor, y follow-up coverage, dot area
//   enrollment, the same thresholds as the table so the two can never
//   disagree) and Table (every number). Feedback: "just a LOT of numbers
//   ... more DATA VIZ ... but we cannot lose content".
// - The takeaway sentence is computed from the rows.
//
// v4 rebuild (6 Oct 2026). WHY: the hero was a v2 glow card of extrabold
// tiles and the staffing card a v2 glass card with chips, uppercase heads
// and amber/green dots. Direct instruction: make the leader roles "like
// this version" (the counselor's v4) "in every aspect... graphics,
// spacing, the premium look". So:
//   - The four numbers are Your impact's cover: the serif story carries
//     students per counselor (and the capacity improvement, with its
//     "relative, not points" caveat), the orbit ring is follow-up coverage,
//     the aside is the follow-up need. Each still opens its drill.
//   - The staffing sheet sits under Your impact's "01 / Staffing" section
//     heading; the scatter is drawn in v4's way (hairline grid, light
//     labels, green within range, amber for higher load and the attention
//     wash); the table is hairline rows with the load as a dot and a word
//     and coverage as a thin lane that turns amber below the threshold.
//   - "Capacity context" is the closing data note.
//
// Maisha's v4 review (7 Oct 2026): load is a status, so it takes the status
// colours people already read (within range green, higher load amber, the
// attention wash amber); coverage is the one series colour and turns amber
// under the threshold. The cover's numbers count up; headers, tabs and
// column heads are Title Case.

//
// Glow pass (10 Oct 2026). WHY: Chandu asked for every graph to get the
// light material ("i want all graphs to get these material updates and
// more creative visions, not just the ones in engagement"), then ruled out
// bars ("I dont like bar graphs"), rings, grids and dense marks ("that
// whole grid idea is bad") and asked for charts "made of LIGHT". So on
// this screen: the coverage orbit is a light trail ending in
// an orb (kit Orbit, now LightGauge), the scatter's dots are points of light
// sized by enrollment, and the table's coverage tracks are points of light.
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Segmented } from "../../viz";
import { DrillPanel, type Drill } from "../../Drill";
import {
  DISTRICT_CAPACITY,
  DISTRICT_CAPACITY_ROWS,
  DISTRICT_TOTALS,
  HIGHER_LOAD_THRESHOLD,
  LOW_COVERAGE_THRESHOLD,
} from "@/lib/leaderData";
import { CountUp, Key, Orbit, SectionHeading, StatusMark, TextAction, titleCase, titled } from "../kit";
import { DistrictTrack, QUADRANT_TONE, QuadrantScatter, SchoolName, int, useOpenSchool, type QuadrantPoint } from "./districtKit";

const HERO = DISTRICT_CAPACITY.hero;
const maxOf = (xs: number[]) => Math.max(...xs, 1);
const TABLE_COLS = { "--dt-cols": "minmax(0,1fr) 78px 78px 138px 104px 150px 14px" } as React.CSSProperties;

/** A load label: a dot and the words. Higher load is the amber one. */
function LoadLabel({ load }: { load: { label: string; tone: "positive" | "negative" } }) {
  return <StatusMark color={QUADRANT_TONE[load.tone]}>{load.label}</StatusMark>;
}

type Tab = "chart" | "table";
const TABS: { key: Tab; label: string }[] = [
  { key: "chart", label: "Load vs Coverage" },
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
  const [needStat, coverageStat, improvementStat] = HERO.stats;

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
        stats: [{ value: needStat.value, label: "Students flagged" }],
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
          { value: coverageStat.value, label: "District coverage" },
          { value: needStat.value, label: "Students flagged" },
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
          { value: improvementStat.value, label: "District, relative" },
          { value: "0% relative", label: "Launch baseline" },
        ],
        rowsLabel: "Counselor efficiency by school, relative % (highest first)",
        rows: rows.map((r) => ({ label: r.school.name, value: `+${r.school.counselorEfficiency.pct}% relative`, pct: (r.school.counselorEfficiency.pct / top) * 100 })),
      };
    },
  };
  const coveragePct = Number(coverageStat.value.replace("%", ""));

  return (
    <div className="v4-page v4-leader-page">
      {/* Your impact's cover, with the story's two numbers each opening its drill. */}
      <section className="v4-impact-cover v4-leader-cover">
        <div className="v4-impact-story">
          <span className="v4-overline">{titleCase(HERO.eyebrow)}</span>
          <h2><CountUp value={HERO.studentsPerCounselor} /> students<br /><em>per counselor.</em></h2>
          <p>{HERO.line} Counselor capacity improved {improvementStat.value.replace("+", "")}, a {improvementStat.caption}, not percentage points.</p>
          <span className="flex flex-wrap gap-x-[22px]">
            <TextAction onClick={() => setDrill(drills.load())}>Load by school</TextAction>
            <TextAction onClick={() => setDrill(drills.improvement())}>Capacity by school</TextAction>
          </span>
        </div>
        <Orbit value={coveragePct} figure={coveragePct} unit="%" caption="follow-up coverage" onOpen={() => setDrill(drills.coverage())} label={`${coverageStat.label}: ${coverageStat.value}, ${coverageStat.caption}. Open every school`} />
        <div className="v4-impact-priority">
          <span className="v4-overline">Needs follow-up</span>
          <strong><CountUp value={needStat.value} /></strong>
          <h3>students {needStat.caption}</h3>
          <TextAction onClick={() => setDrill(drills.need())}>See every school</TextAction>
        </div>
      </section>

      <SectionHeading index={1} label="Staffing" title={DISTRICT_CAPACITY.table.title} />

      <section className="v4-leader-sheet is-glass corner-br" aria-label={DISTRICT_CAPACITY.table.title}>
        <header className="v4-section-head flex-wrap">
          <Segmented<Tab> ariaLabel="Staffing view" options={TABS} value={tab} onChange={setTab} />
          <span className="v4-pill">{higher > 0 ? `${higher} of ${R.length} schools carry a higher load` : "Every school is within range"}</span>
        </header>
        {tab === "chart" ? (
          <div role="tabpanel" aria-label="Load vs Coverage" className="flex flex-col gap-[18px]">
            <p className="text-[15px] leading-[1.5] font-[450]" style={{ letterSpacing: "-.2px" }}>{takeaway(R)}.</p>
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
            <div className="v4-sheet-foot" style={{ paddingBottom: 0 }}>
              <Key items={[{ label: `Higher load (${higher} of ${R.length} schools)`, color: QUADRANT_TONE.negative }, { label: "Within range", color: QUADRANT_TONE.positive }]} />
              <span>Dot area = enrollment · select a dot to open its counseling team</span>
            </div>
          </div>
        ) : (
          <div role="tabpanel" aria-label="Table" className="flex flex-col">
            <div className="v4-district-table" style={TABLE_COLS}>
              <div className="v4-district-thead" aria-hidden>
                <span>School</span><span className="v4-district-r">Counselors</span><span className="v4-district-r">Students</span><span className="v4-district-r">Students / Counselor</span><span className="v4-district-r">Follow-Up Need</span><span>Coverage</span><span />
              </div>
              {R.map((r) => {
                const low = r.coverage < LOW_COVERAGE_THRESHOLD;
                return (
                  <button key={r.school.id} type="button" className="v4-district-row" onClick={() => open(r.school.id, "team")} aria-label={`Open ${r.school.name} counseling team. ${r.counselors} counselors, ${int(r.students)} students, ${r.studentsPerCounselor} per counselor, ${r.load.label}. ${r.followUpNeed} students need follow-up, ${r.coverage}% covered`}>
                    <SchoolName school={r.school} students={r.students} />
                    <span className="v4-district-cell v4-district-num is-right"><strong>{r.counselors}</strong></span>
                    <span className="v4-district-cell v4-district-num is-right"><strong>{int(r.students)}</strong></span>
                    <span className="v4-district-cell v4-district-num is-right"><strong>{r.studentsPerCounselor}</strong><LoadLabel load={r.load} /></span>
                    <span className="v4-district-cell v4-district-num is-right"><strong>{r.followUpNeed}</strong><small>{DISTRICT_CAPACITY.table.followUpUnit}</small></span>
                    <span className={`v4-district-cell v4-district-num ${low ? "is-risk" : ""}`}><strong>{r.coverage}%</strong><DistrictTrack value={r.coverage} color={low ? "var(--v4-warn)" : "var(--v4-cat-1)"} thin /></span>
                    <span className="v4-district-cell"><ArrowUpRight size={14} aria-hidden className="v4-district-go" /></span>
                    <span className="v4-district-phone">
                      <span>{r.counselors} {r.counselors === 1 ? "counselor" : "counselors"} · <strong>{r.studentsPerCounselor}</strong> per counselor</span>
                      <LoadLabel load={r.load} />
                      <span>{r.followUpNeed} need follow-up · <strong style={low ? { color: "var(--v4-caution)" } : undefined}>{r.coverage}% covered</strong></span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="v4-sheet-foot mt-[6px]" style={{ paddingBottom: 0 }}><span>Sorted by follow-up need · coverage turns amber below {LOW_COVERAGE_THRESHOLD}% · {DISTRICT_CAPACITY.table.subtitle}</span></div>
          </div>
        )}
      </section>

      <p className="v4-data-note">{DISTRICT_CAPACITY.note.title} · {DISTRICT_CAPACITY.note.body}</p>
      <DrillPanel drill={titled(drill)} onClose={() => setDrill(null)} />
    </div>
  );
}
