"use client";

// StudentOutcomes: how are students doing across the district, by school and
// by grade, and what are they choosing?
// DEMO-ONLY data (2 Oct 2026, NOTES.md 3.3).
//
// Decisions kept from the v2 build (2 Oct 2026), with the WHY:
// - One ranked comparison driven by By school / By grade and a Metric
//   select; the district rollup is a reference line on every bar, so each
//   school reads as ahead of or behind the district at a glance.
// - School rows open the school, like every school row in the District
//   view (the Replit's bars were not clickable).
// - Outcomes first: the comparison, then milestones and participation,
//   then what students are choosing, then emerging interests.
// - Distribution and milestone rows sort high to low; milestone numerals
//   01 to 05 are the ranks.
// - The per-row (i) tooltips repeat one template ("a distribution share,
//   not a completion rate; no launch baseline"), so it is said once, in the
//   closing note. Participation counts keep their own one-line description.
// - Cards in a row share one height (standing rule, 2 Oct 2026).
//
// v4 rebuild (6 Oct 2026). WHY: the screen was v2 cards: a glowing hero
// card with a segmented toggle and an uppercase "Metric" field, extrabold
// numbers, inset count tiles, chip boxes. Direct instruction: make the
// leader roles "like this version" (the counselor's v4) "in every aspect,
// design, layout, structure everything". So:
//   - The comparison is Student progress's report canvas: By school / By
//     grade is the page's one underline tab row; the metric is the second
//     dimension, so it is a select in the toolbar, never a second tab row
//     (feedback, 2 Oct 2026). The district rollup is the hero number on
//     the left with its change, launch baseline and definition; the
//     schools (or grades) are Today's lanes on the right with the dashed
//     rollup line.
//   - The rest sits under Your impact's numbered section headings, in
//     flat sheets two to a row: milestones as lanes, participation totals
//     as Today's numbered hairline rows with each count's description, the
//     three distributions as lanes (intentions as a share bar plus its
//     key), emerging interests as quiet pills.
//
// Maisha's v4 review (7 Oct 2026): "Same note for Career Interests and
// Plans After Graduation": bars side by side (milestones, interests,
// choices) are ONE series colour, one calm blue or a Bright hue each;
// intentions, parts of one whole, step through one hue with Undecided in
// the neutral step. She loves the Explore cards art, so each career
// interest carries the student app's poster beside its name (the leader's
// version of the counselor's focus art). The rollup counts up; headers,
// tabs and section labels are Title Case.

//
// Glow pass (10 Oct 2026). WHY: Chandu asked for every graph to get the
// light material ("i want all graphs to get these material updates and
// more creative visions, not just the ones in engagement"), then ruled out
// bars ("I dont like bar graphs"), rings, grids and dense marks ("that
// whole grid idea is bad") and asked for charts "made of LIGHT". So on
// this screen: every lane is a point of light on a hairline
// scale (kit Lane, DistrictTrack), and Postsecondary Intentions is a Sankey of
// light (charts/ldViz PlanFlow): every district student flows to a plan,
// ribbon width = share. The flow labels each part, so its key list went.
import { useMemo, useState } from "react";
import { SubTabs } from "../../SubTabs";
import { Listbox } from "../../Listbox";
import {
  DISTRICT_GRADE_STUDENTS,
  DISTRICT_STUDENT_OUTCOMES,
  DISTRICT_TOTALS,
  OUTCOME_METRICS,
  outcomeComparisonFooter,
  schoolById,
  type OutcomeMetricId,
  type ShareRow,
} from "@/lib/leaderData";
import { ArtThumb, CountUp, Lane, Pill, Row, Rows, SectionHeading, Sheet, series, step, titleCase } from "../kit";
import { PlanFlow } from "../../charts/ldViz";
import { DistrictAxis, DistrictTrack, LaneLegend, SchoolLane, int, pts, useOpenSchool } from "./districtKit";

const GRADES = [9, 10, 11, 12] as const;
/** Parts of one whole: one hue stepping by rank, Undecided neutral. */
const partTone = (label: string, i: number) => (label === "Undecided" ? "var(--v4-step-6)" : step(i));
const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** A distribution as lanes. `abs`: lanes are % of all students; otherwise
 *  relative to the largest share, so the leading rows are easy to compare. */
function ShareLanes({ rows, abs = false, ranked = false, fill = false, art = false }: { rows: readonly ShareRow[]; abs?: boolean; ranked?: boolean; fill?: boolean; art?: boolean }) {
  const sorted = useMemo(() => [...rows].sort((a, b) => b.value - a.value), [rows]);
  const max = sorted[0]?.value || 1;
  return (
    <div className={`v4-leader-lanes v4-district-share ${fill ? "v4-district-fill-col" : ""}`}>
      {sorted.map((r, i) => (
        <Lane
          key={r.label}
          label={ranked ? <><span className="v4-list-index mr-[8px]">{String(i + 1).padStart(2, "0")}</span>{r.label}</> : art ? <span className="v4-leader-art-label"><ArtThumb label={r.label} />{r.label}</span> : r.label}
          color={series(i)}
          value={r.value}
          scale={abs ? 100 : max}
          display={`${r.value}%`}
          aria={`${r.label}: ${r.value}%`}
        />
      ))}
    </div>
  );
}

export function StudentOutcomes() {
  const open = useOpenSchool();
  const O = DISTRICT_STUDENT_OUTCOMES;
  const [by, setBy] = useState<"school" | "grade">("school");
  const [metricId, setMetricId] = useState<OutcomeMetricId>("career");
  const metric = OUTCOME_METRICS.find((m) => m.id === metricId) ?? OUTCOME_METRICS[0];
  const roll = metric.rollup;
  const schoolRows = metric.bySchool.flatMap((r) => { const s = schoolById(r.schoolId); return s ? [{ s, value: r.value }] : []; });
  const below = by === "school" ? schoolRows.filter((r) => r.value < roll.value).length : metric.byGrade.filter((v) => v < roll.value).length;
  const intentions = useMemo(() => [...O.intentions.rows].sort((a, b) => b.value - a.value), [O.intentions.rows]);

  return (
    <div className="v4-page v4-leader-page">
      <SubTabs ariaLabel="Compare by" value={by} onChange={setBy} options={O.comparison.toggles.map((t) => ({ key: t.id, label: titleCase(t.label) }))} />

      <div className="v4-district-toolbar">
        <div><Listbox ariaLabel="Metric" value={metricId} onChange={(v) => setMetricId(v as OutcomeMetricId)} options={OUTCOME_METRICS.map((m) => ({ value: m.id, label: m.label }))} /></div>
        <span className="v4-district-meta"><strong>{titleCase(O.comparison.title)}</strong> · {int(DISTRICT_TOTALS.enrollment)} students · 2026–27</span>
      </div>

      <section className="v4-report-canvas v4-surface" role="tabpanel" aria-label={`${metric.label} ${by === "school" ? "by school" : "by grade"}`}>
        <div className="v4-report-explainer v4-district-explainer">
          <span className="v4-overline">{titleCase(O.comparison.rollupLabel)}</span>
          <h2>{titleCase(metric.label)}</h2>
          <div className="v4-report-hero-number"><CountUp value={`${roll.value}%`} /></div>
          <p>{O.comparison.rollupCaption(roll.delta)}.</p>
          <dl>
            <div><dt>Launch baseline</dt><dd>{roll.baseline}%</dd></div>
            <div><dt>Change</dt><dd>{pts(roll.delta)}</dd></div>
            <div><dt>{by === "school" ? "Schools" : "Grades"} below the rollup</dt><dd>{below} of {by === "school" ? schoolRows.length : GRADES.length}</dd></div>
          </dl>
          <p className="v4-chart-note">{outcomeComparisonFooter(metric)}</p>
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <div className="v4-lane-heading"><span>{by === "school" ? "Schools, High to Low" : "Grades"}</span><span>Share of Students</span></div>
          <div className="v4-district-lanes">
            {by === "school"
              ? schoolRows.map(({ s, value }) => (
                  <SchoolLane
                    key={s.id}
                    school={s}
                    value={value}
                    district={roll.value}
                    display={`${value}%`}
                    sub={O.comparison.studentsCaption(s.enrollment)}
                    onOpen={() => open(s.id)}
                    aria={`Open ${s.name}. ${metric.label} ${value}%, district rollup ${roll.value}%`}
                  />
                ))
              : GRADES.map((g, i) => (
                  <div key={g} className="v4-district-lane" aria-label={`Grade ${g}: ${metric.byGrade[i]}%, district rollup ${roll.value}%`}>
                    <span className="v4-district-name"><span className="v4-person"><strong>Grade {g}</strong><small>{O.comparison.studentsCaption(DISTRICT_GRADE_STUDENTS[g])}</small></span></span>
                    <DistrictTrack value={metric.byGrade[i]} district={roll.value} />
                    <b>{metric.byGrade[i]}%</b>
                    <small />
                    <span />
                  </div>
                ))}
            <DistrictAxis />
          </div>
          <div className="mt-[18px]"><LaneLegend baseline="" district={`District rollup, ${roll.value}% · launch baseline ${roll.baseline}%`} /></div>
        </div>
      </section>

      <SectionHeading index={1} label="Planning" title="Milestones and career experiences" />
      <div className="v4-leader-grid cols-2">
        <Sheet corner="br" title={O.milestones.title} colors>
          <ShareLanes rows={O.milestones.rows} abs ranked fill />
          <div className="v4-sheet-foot mt-auto" style={{ paddingBottom: 0 }}><span>{O.milestones.subtitle}</span></div>
        </Sheet>
        <Sheet corner="bl" title={O.participation.title}>
          <Rows label={O.participation.title}>
            {O.participation.rows.map((r, i) => (
              <Row key={r.label} index={i + 1} title={r.label} sub={r.tooltip} trail={<span className="v4-leader-figure">{int(r.value)}</span>} />
            ))}
          </Rows>
          <div className="v4-sheet-foot mt-auto" style={{ paddingBottom: 0 }}><span>{sentence(O.participation.eyebrow)}, district totals for 2026–27</span></div>
        </Sheet>
      </div>

      <SectionHeading index={2} label="Choices" title="What students are choosing" />
      <div className="v4-leader-grid cols-2">
        <Sheet corner="br" title={O.interests.title} colors>
          <ShareLanes rows={O.interests.rows} art />
          <div className="v4-sheet-foot mt-auto" style={{ paddingBottom: 0 }}><span>{O.interests.subtitle} The scale runs to the largest share.</span></div>
        </Sheet>
        <Sheet corner="bl" title={O.choices.title} colors>
          <ShareLanes rows={O.choices.rows} />
          <div className="v4-sheet-foot mt-auto" style={{ paddingBottom: 0 }}><span>{O.choices.subtitle} The scale runs to the largest share.</span></div>
        </Sheet>
      </div>
      <div className="v4-leader-grid cols-2">
        <Sheet corner="tr" title={O.intentions.title} colors>
          <PlanFlow label={O.intentions.title} source={`${int(DISTRICT_TOTALS.enrollment)} students`} parts={intentions.map((r, i) => ({ label: r.label, value: r.value, color: partTone(r.label, i) }))} />
          <div className="v4-sheet-foot mt-auto" style={{ paddingBottom: 0 }}><span>{O.intentions.subtitle}</span></div>
        </Sheet>
        <Sheet corner="tl" title={O.emerging.title}>
          <div className="v4-district-pills">{O.emerging.chips.map((c) => <Pill key={c}>{c}</Pill>)}</div>
          <div className="v4-sheet-foot mt-auto" style={{ paddingBottom: 0 }}><span>{O.emerging.note}</span></div>
        </Sheet>
      </div>

      <p className="v4-data-note">These are shares of responses, not completion rates, out of {int(DISTRICT_TOTALS.enrollment)} students represented. No launch baseline is recorded for these categories or for the milestones, so no change is shown.</p>
    </div>
  );
}
