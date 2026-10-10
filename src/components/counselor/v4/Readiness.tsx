"use client";

// 10 Oct 2026, new chart forms (Chandu: "try better types of graphs, more
// beautiful ones ... The graphs in the engagement tab are slightly better
// than the rest live right now. I want you to take it to the next level ...
// be creative with the graphs, don't be traditional, as long as they convey
// the information sensibly"). Same sections, same order, same drills; only
// the marks changed (charts/insightViz.tsx):
//   - Indicators: a ring each became a 40-tick dial lit to the share, the
//     share inside it. The selected dial carries the page's one glow.
//   - Gaps, bar view: a bar became one dot per student the indicator covers,
//     the students still missing it lit. A counselor reads "25 of 121" as
//     people, and the lit run still reads like a bar.
//   - Gaps, donut view: the same dots in a ring, the missing students a
//     clockwise sector, the count in the middle.
//   - Readiness by Grade: first a "readiness journey" of ribbons across
//     grade lanes; later the same day replaced by a grid of light (see
//     below), because lines between grades implied the same students
//     improving when every grade is a different cohort.
//   - Glow pass, later on 10 Oct 2026 (Chandu: "think more light, glow?
//     ... GIVE ALL GRAPHS THIS SORT OF VISUAL UPGRADE", and on the dials
//     before it: "why is everything a ring to you?", then the same day: "I
//     dont like bar graphs"): Gaps' Bar view and its toggle are gone; the
//     loved donut is the one view, exactly as it was. Readiness by Grade went through a grid of light and a strip
//     plot the same day and landed on the simplest form, after Chandu: "I
//     dont want cards for readiness by grade, i dont want so many things
//     to read for readiness. Make it simple. But no bar graphs." One
//     milestone at a time (a switch in the header, the biggest gap first),
//     one trail of light across the grades, an Orb per grade at its share,
//     the share above and the grade below, amber under 50%. The ribbons
//     drew lines between grades as if the same students improved, though
//     each grade is a different cohort; the grid and strip plot were "too
//     much and too dense". The tiles lost their dials for the same reason:
//     a tile is now its name, its share as a big number and its count.
//   - Drilldowns everywhere (the user: "everything needs drilldowns that are
//     logical. I see graphs in Readiness etc. that don't do anything when I
//     click"): a tile's "See N missing", every donut, dot row, ribbon chip,
//     ribbon name and lane header opens exactly the students it counts.
//
// Readiness: "See how prepared students are, where gaps exist, and which
// students need additional support." Rebuilt 9 Oct 2026 from Maisha's notes
// and her reference image ("Big update"): four indicator tiles, then Gaps,
// then Readiness by Grade, then the students who need support.
//
// The indicators are hers: "On Track to Graduate, Academic Plan Complete,
// Postsecondary Plan Defined, Career Pathway Identified." There is no
// combined score ("Do not combine the four indicators into one universal
// readiness score yet"). On Track to Graduate shows only while the SIS is
// connected, because it is computed from credits the school's records carry.
//
// What changed in this round (Maisha, 9 Oct 2026): "Remove the current
// 'Trend Over Time' graph from the primary view and replace it with 'Gaps',
// followed by 'Readiness by Grade' under." Gaps counts the students NOT
// meeting each indicator (her "which students need additional support"),
// as bars or donuts; Readiness by Grade compares the four measures across
// grades in one row per grade. The trend is gone from this page (the
// seeded monthly history that drew it is deleted, not hidden).
//
// Every number opens its students: a tile picks the list below, a gap row
// or donut opens the students still missing that indicator with Message
// All, and a grade row opens that grade's students, needs support first.

import { useMemo, useState } from "react";
import { ChevronRight, Info, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { milestonesForGrade, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { sisFor } from "@/lib/counselorSis";
import { IconTip } from "@/components/app/IconTip";
import { CountUp } from "./InsightCharts";
import { DotDonut, GradeTrail, useWidth } from "./charts/insightViz";
import { SegmentGauge } from "./charts/ivGauge";
import { Segmented } from "./viz";
import { InsightStudentsPanel, StudentRows, messageHref, type StudentsDrill } from "./InsightStudents";
import { GRADES, doneBy, pct, sisConnected, useInsightsScope } from "./insightsScope";
import "./insights.css";
import "./insights2.css";

type Measure = {
  key: string;
  label: string;
  /** what "met" is called in the list toggle */
  doneWord: string;
  /** the (i): one plain sentence on what counts */
  info: string;
  /** the Gaps row: what is still missing */
  gap: string;
  /** the Readiness by Grade bar colour (existing chart and world tokens) */
  color: string;
  eligible: (s: CounselorStudent) => boolean;
  met: (s: CounselorStudent) => boolean;
  /** the line under a student's name: where they stand on this measure */
  note: (s: CounselorStudent) => string;
  /** who the measure covers, when that is not everyone */
  covers?: string;
};

const finished = (s: CounselorStudent, k: MilestoneKey) => s.milestones[k] === "Approved" || s.milestones[k] === "Completed";

// Four measures, four hues (her image colours each measure: blue, purple,
// pink, green). A legitimate categorical use, so the hues come from the
// existing palette: --primary, then the world tokens the student app's
// posters already wear. Position and the printed share carry the identity
// as well, so the row still reads where blue and purple look alike.
const COLORS = {
  "on-track": "var(--primary)",
  "academic-plan": "var(--world-teaching-learning)",
  postsecondary: "var(--world-arts-media-sport)",
  "career-pathway": "var(--world-food-farming-nature)",
} as const;

function measures(): Measure[] {
  const list: Measure[] = [
    { key: "academic-plan", label: "Academic Plan Complete", doneWord: "Complete", info: "The academic plan milestone is approved or completed.", gap: "Academic plan incomplete", color: COLORS["academic-plan"], eligible: () => true, met: (s) => finished(s, "Academic Plan"), note: (s) => s.milestones["Academic Plan"] },
    { key: "postsecondary", label: "Postsecondary Plan Defined", doneWord: "Defined", info: "The student has picked a direction after high school: college, trade school, work or military.", gap: "Postsecondary plan not defined", color: COLORS.postsecondary, eligible: () => true, met: (s) => s.postsecondaryIntent !== "Undecided", note: (s) => (s.postsecondaryIntent === "Undecided" ? "No plan yet" : s.postsecondaryIntent) },
    { key: "career-pathway", label: "Career Pathway Identified", doneWord: "Identified", info: "The career pathway milestone is approved or completed. It starts in Grade 10.", gap: "Career pathway not identified", color: COLORS["career-pathway"], eligible: (s) => milestonesForGrade(s.grade).includes("Career Pathway"), met: (s) => finished(s, "Career Pathway"), note: (s) => (finished(s, "Career Pathway") ? s.careerTrack : `Exploring ${s.careerTrack}`), covers: "Grades 10 to 12" },
  ];
  // Gated on the SIS (Maisha: "Only show On Track to Graduate if the
  // necessary SIS/student data is actually available").
  if (sisConnected()) list.unshift({ key: "on-track", label: "On Track to Graduate", doneWord: "On track", info: "Credits earned so far match what the school expects for the grade, from the SIS.", gap: "Not on track to graduate", color: COLORS["on-track"], eligible: () => true, met: (s) => sisFor(s).onTrackToGraduate, note: (s) => { const c = sisFor(s).credits; return c.earned >= c.expected ? `${c.earned} credits` : `${c.expected - c.earned} credit${c.expected - c.earned === 1 ? "" : "s"} behind`; } });
  return list;
}

const n = (k: number) => `${k} ${k === 1 ? "student" : "students"}`;

/** The Readiness by Grade switch: short, so four fit on a phone. */
const SWITCH: Record<string, string> = { "on-track": "On track", "academic-plan": "Academic", postsecondary: "Postsecondary", "career-pathway": "Career" };
/** Plain words for a drill title: "25 students missing an academic plan". */
const MISSING: Record<string, string> = { "on-track": "not on track to graduate", "academic-plan": "missing an academic plan", postsecondary: "without a postsecondary plan", "career-pathway": "without a career pathway" };
/** Tip words for Readiness by Grade: "1 of 30 have a postsecondary plan.
 *  See the 29 without one." */
const HAVE: Record<string, string> = { "on-track": "are on track to graduate", "academic-plan": "have an academic plan", postsecondary: "have a postsecondary plan", "career-pathway": "have a career pathway" };
const WITHOUT: Record<string, string> = { "on-track": "who are not", "academic-plan": "without one", postsecondary: "without one", "career-pathway": "without one" };
const MET: Record<string, string> = { "on-track": "on track to graduate", "academic-plan": "with an academic plan", postsecondary: "with a postsecondary plan", "career-pathway": "with a career pathway" };

export function Readiness() {
  const router = useRouter();
  const scope = useInsightsScope();
  const { roster, back, year, scopeLabel } = scope;
  const list = useMemo(() => measures(), []);
  const [pick, setPick] = useState(0);
  const [show, setShow] = useState<"support" | "done">("support");
  const [drill, setDrill] = useState<StudentsDrill | null>(null);
  // Readiness by Grade shows one milestone at a time; null = the biggest gap
  const [gradeKey, setGradeKey] = useState<string | null>(null);
  const [donutRef, donutW] = useWidth<HTMLDivElement>();

  // Each measure over the scoped roster, as of the chosen school year.
  const rows = useMemo(() => list.map((m) => {
    const eligible = roster.filter(m.eligible);
    const met = eligible.filter((s) => m.met(s) && doneBy(s, m.key, back));
    const support = eligible.filter((s) => !met.includes(s));
    return { m, eligible, met, support, value: pct(met.length, eligible.length) };
  }), [list, roster, back]);
  const cur = rows[Math.min(pick, rows.length - 1)];
  const when = back === 0 ? "" : ` · end of ${year.label}`;
  const sub = (s: string) => [s, scopeLabel].filter(Boolean).join(" · ") + when;

  // Gaps: the three Dreamari indicators (On Track to Graduate is the
  // school's record, not a gap a counselor closes here).
  const gaps = rows.filter((r) => r.m.key !== "on-track");

  // Readiness by Grade: every measure, per grade.
  const grades = GRADES.map((g) => {
    const students = roster.filter((s) => s.grade === g);
    const cells = rows.map((r) => {
      const eligible = r.eligible.filter((s) => s.grade === g);
      const met = r.met.filter((s) => s.grade === g);
      return { r, eligible, met, value: eligible.length ? pct(met.length, eligible.length) : null };
    });
    // what each student in the grade still needs, for the row's drill
    const needs = (s: CounselorStudent) => rows.filter((r) => r.m.eligible(s) && !r.met.includes(s)).map((r) => r.m.label.replace(/ (Complete|Defined|Identified)$/, "").replace("On Track to Graduate", "Graduation credits"));
    return { g, students, cells, needs };
  }).filter((x) => x.students.length > 0);

  // Every drill lists exactly the students the clicked mark counts, titled
  // in plain words (10 Oct 2026, the user: "everything needs drilldowns that
  // are logical. I see graphs in Readiness etc. that don't do anything when
  // I click."). All from the roster; nothing is invented.
  const openMet = (r: (typeof rows)[number]) => setDrill({
    title: `${n(r.met.length)} ${MET[r.m.key]}`,
    subtitle: sub(`${r.met.length} of ${r.eligible.length}${r.m.covers ? ` in ${r.m.covers}` : ""}`),
    students: r.met.map((s) => ({ s, note: r.m.note(s) })),
  });
  const openCell = (g: number, c: (typeof grades)[number]["cells"][number]) => {
    const missing = c.eligible.filter((s) => !c.met.includes(s));
    if (!missing.length) {
      setDrill({ title: `All ${c.met.length} Grade ${g} students ${MET[c.r.m.key]}`, subtitle: sub(`${c.value}% · no one missing it`), students: c.met.map((s) => ({ s, note: c.r.m.note(s) })) });
      return;
    }
    setDrill({
      title: `${n(missing.length)} in Grade ${g} ${MISSING[c.r.m.key]}`,
      subtitle: sub(`${missing.length} of ${c.eligible.length} · ${c.value}% ${c.r.m.doneWord.toLowerCase()}`),
      students: missing.map((s) => ({ s, note: c.r.m.note(s) })),
      listLabel: `Needs Support · ${missing.length}`,
    });
  };
  const openGap = (r: (typeof rows)[number]) => r.support.length === 0 ? openMet(r) : setDrill({
    title: `${n(r.support.length)} ${MISSING[r.m.key]}`,
    subtitle: sub(`${r.support.length} of ${r.eligible.length} students${r.m.covers ? ` in ${r.m.covers}` : ""}`),
    stats: [{ value: String(r.support.length), label: "need support" }, { value: `${r.value}%`, label: r.m.doneWord.toLowerCase() }],
    students: r.support.map((s) => ({ s, note: r.m.note(s) })),
    listLabel: `Needs Support · ${r.support.length}`,
  });
  const openGrade = (x: (typeof grades)[number]) => {
    const ranked = x.students.map((s) => ({ s, missing: x.needs(s) })).sort((a, b) => b.missing.length - a.missing.length || a.s.name.localeCompare(b.s.name));
    const needing = ranked.filter((y) => y.missing.length > 0).length;
    setDrill({
      title: `Grade ${x.g}`,
      subtitle: sub(`${n(x.students.length)} · ${needing} need support`),
      stats: x.cells.filter((c) => c.value !== null).map((c) => ({ value: `${c.value}%`, label: c.r.m.label.toLowerCase() })),
      students: ranked.map(({ s, missing }) => ({ s, note: missing.length ? `Needs ${missing.join(", ").toLowerCase()}` : "Every indicator met" })),
      listLabel: `Needs support first · ${x.students.length} students`,
    });
  };

  if (roster.length === 0) {
    return <p className="v4-filter-empty">No students match {scope.who}. Try a different grade or group.</p>;
  }

  const listed = show === "support" ? cur.support : cur.met;

  const donutSize = donutW ? Math.max(84, Math.min(140, Math.floor(donutW / 3) - 16)) : 120;

  // Readiness by Grade: the one verdict, the lowest cell in the grid.
  const GAP_NOUN: Record<string, string> = { "on-track": "graduation credits", "academic-plan": "academic plans", postsecondary: "postsecondary plans", "career-pathway": "career pathways" };
  const lowest = grades.flatMap((x) => x.cells.filter((c) => c.value !== null).map((c) => ({ g: x.g, key: c.r.m.key, value: c.value as number }))).sort((a, b) => a.value - b.value)[0];
  const byGradeK = Math.max(0, rows.findIndex((r) => r.m.key === (gradeKey ?? lowest?.key ?? "postsecondary")));
  const byGrade = { r: rows[byGradeK], k: byGradeK };
  const verdict = !lowest ? "Share of each grade meeting each indicator." : lowest.value >= 90 ? "Every grade is at 90% or more on every indicator." : `Biggest gap: ${GAP_NOUN[lowest.key]} in Grade ${lowest.g}.`;

  return (
    <div className="v4-page v4-readiness flex flex-col gap-[var(--space-5)]">
      {/* Top indicators: a 40-tick dial lit to the share, the share inside
         it, the name and the count beside it, and an (i) that says what
         counts. A tile picks the list at the foot of the page; the picked
         dial is the page's one glow. */}
      <div role="group" aria-label="Readiness indicators" className={`v4-iv-tiles is-gauge ${rows.length === 3 ? "is-three" : ""}`}>
        {rows.map((r, i) => {
          const on = r === cur;
          return (
            <div key={r.m.key} className="v4-iv-cellwrap">
              <div className={`v4-iv-tile ${on ? "is-on" : ""}`}>
                {/* the tile picks the list at the foot of the page */}
                <button type="button" aria-pressed={on} onClick={() => { setPick(i); setShow("support"); }} className="v4-iv-tile-hit" aria-label={`${r.m.label}: ${r.value}%, ${r.met.length} of ${r.eligible.length}${r.m.covers ? ` in ${r.m.covers}` : ""}. Show this list below`} />
                <SegmentGauge value={r.value} active={on}><CountUp value={r.value} /><small>%</small></SegmentGauge>
                <span className="v4-iv-tile-copy">
                  <span className="v4-iv-tile-label">{r.m.label}</span>
                  <span className="v4-iv-tile-note">{r.met.length} of {r.eligible.length}{r.m.covers && <><span aria-hidden> · </span><span className="whitespace-nowrap">{r.m.covers}</span></>}</span>
                  {/* and a direct path to the students it counts */}
                  <IconTip label={r.support.length ? `See the ${n(r.support.length)} ${MISSING[r.m.key]}` : `See the ${n(r.met.length)} ${MET[r.m.key]}`} className="v4-iv-see-wrap">
                    <button type="button" onClick={() => openGap(r)} className="v4-iv-see" aria-label={r.support.length ? `See the ${n(r.support.length)} ${MISSING[r.m.key]}` : `See the ${n(r.met.length)} ${MET[r.m.key]}`}>
                      See {r.support.length || r.met.length} {r.support.length ? "missing" : "students"}<ChevronRight size={13} aria-hidden />
                    </button>
                  </IconTip>
                </span>
              </div>
              <IconTip label={r.m.info} className="v4-iv-info">
                <button type="button" aria-label={`About ${r.m.label}`} className="v4-r2-info dm-quiet"><Info size={14} aria-hidden /></button>
              </IconTip>
            </div>
          );
        })}
      </div>

      {/* Gaps: one dot per student the indicator covers, the students still
         missing it lit, in a ring (the one view since 10 Oct 2026: "I dont
         like bar graphs"). Each opens those students with Message All. */}
      <section className="v4-surface flex min-w-0 flex-col gap-[var(--space-4)] border p-[var(--space-5)]">
        <header className="v4-r2-head">
          <div className="v4-r2-lead">
            <h2 className="v4-r2-title">Gaps
              <IconTip label="Each dot is one student the indicator covers. The bright dots still miss it."><button type="button" aria-label="About Gaps" className="v4-r2-info dm-quiet"><Info size={14} aria-hidden /></button></IconTip>
            </h2>
            <span className="v4-r2-sub">Students missing each milestone.</span>
          </div>
          <span className="v4-r2-tools">
            <span className="v4-iv-legend" aria-hidden><span><i className="is-lit" />Missing</span><span><i />Met</span></span>
          </span>
        </header>
          <div className="v4-iv-donuts" ref={donutRef}>
            {gaps.map((r) => (
              <IconTip key={r.m.key} label={`See the ${n(r.support.length)} ${MISSING[r.m.key]}`} className="w-full">
              <button type="button" onClick={() => openGap(r)} className="v4-iv-donut w-full" aria-label={`${r.m.gap}: ${r.support.length} of ${r.eligible.length} students. Show them`}>
                <DotDonut total={r.eligible.length} lit={r.support.length} size={donutSize}>
                  <CountUp value={r.support.length} /><small>of {r.eligible.length}</small>
                </DotDonut>
                <span className="v4-iv-donut-label">{r.m.gap}</span>
              </button>
              </IconTip>
            ))}
          </div>
      </section>

      {/* Readiness by Grade: one milestone at a time (the switch in the
         header, the biggest gap first), one trail of light across the
         grades, an Orb per grade at its share. An Orb opens that grade's
         students missing the milestone. */}
      <section className="v4-surface flex min-w-0 flex-col gap-[var(--space-4)] border p-[var(--space-5)]">
        <header className="v4-r2-head">
          <div className="v4-r2-lead">
            <h2 className="v4-r2-title">Readiness by Grade
              <IconTip label="The share of each grade that meets the milestone. Select a point to see who is missing it."><button type="button" aria-label="About Readiness by Grade" className="v4-r2-info dm-quiet"><Info size={14} aria-hidden /></button></IconTip>
            </h2>
            <span className="v4-r2-sub">{verdict}</span>
          </div>
          <span className="v4-r2-tools">
            <Segmented ariaLabel="Milestone" value={byGrade.r.m.key} onChange={setGradeKey} options={rows.map((r) => ({ key: r.m.key, label: SWITCH[r.m.key] }))} />
          </span>
        </header>
        <GradeTrail measureKey={byGrade.r.m.key} points={grades.map((x) => {
          const c = x.cells[byGrade.k];
          const missing = c.eligible.length - c.met.length;
          const key = byGrade.r.m.key;
          return {
            key: String(x.g),
            label: `Grade ${x.g}`,
            value: c.value,
            tip: `Grade ${x.g}: ${c.met.length} of ${c.eligible.length} ${HAVE[key]}. ${missing ? `See the ${missing} ${WITHOUT[key]}.` : "No one is missing it."}`,
            aria: `Grade ${x.g}, ${byGrade.r.m.label}: ${c.value}%, ${c.met.length} of ${c.eligible.length}. Show the ${missing ? `${n(missing)} missing it` : "students"}`,
            onOpen: () => openCell(x.g, c),
            grade: { tip: `See Grade ${x.g}'s ${n(x.students.length)}, needs support first`, aria: `Grade ${x.g}: ${n(x.students.length)}. Show students, needs support first`, onOpen: () => openGrade(x) },
          };
        })} />
      </section>

      {/* The students the picked indicator counts, the part a counselor acts on. */}
      <section className="v4-surface flex flex-col gap-[var(--space-4)] border p-[var(--space-5)]">
        <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{show === "support" ? "Needs Support" : cur.m.doneWord}: {cur.m.label}</h2>
          <span className="flex flex-wrap items-center gap-[var(--space-3)]">
            <Segmented ariaLabel="Which students" value={show} onChange={setShow} options={[{ key: "support", label: "Needs Support", count: cur.support.length }, { key: "done", label: cur.m.doneWord, count: cur.met.length }]} />
            {listed.length > 0 && (
              <button type="button" onClick={() => router.push(messageHref(listed.map((s) => s.id)))} className="v4-text-action" style={{ color: "var(--primary)" }}>
                <Users size={14} aria-hidden /> Message all {listed.length}
              </button>
            )}
          </span>
        </header>
        {listed.length ? (
          <StudentRows key={`${cur.m.key}-${show}`} columns students={listed.map((s) => ({ s, note: cur.m.note(s) }))} />
        ) : (
          <p className="v4-source-note">{show === "support" ? "Everyone in this view is there." : "No one in this view yet."}</p>
        )}
      </section>

      <InsightStudentsPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
