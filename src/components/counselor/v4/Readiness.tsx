"use client";

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
import { motion, useReducedMotion } from "framer-motion";
import { milestonesForGrade, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { sisFor } from "@/lib/counselorSis";
import { IconTip } from "@/components/app/IconTip";
import { DrawRing } from "../v5/charts";
import { CountUp } from "./InsightCharts";
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

/** A donut with its count in the middle (the Gaps donut view). */
function Donut({ pct: share, count, size = 96, stroke = 9 }: { pct: number; count: number; size?: number; stroke?: number }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  return (
    <span className="v4-rd-donut-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={stroke} strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: Math.max(0.001, Math.min(1, share / 100)) }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <strong><CountUp value={count} /></strong>
    </span>
  );
}

export function Readiness() {
  const router = useRouter();
  const scope = useInsightsScope();
  const { roster, back, year, scopeLabel } = scope;
  const list = useMemo(() => measures(), []);
  const [pick, setPick] = useState(0);
  const [show, setShow] = useState<"support" | "done">("support");
  const [gapView, setGapView] = useState<"bar" | "donut">("bar");
  const [drill, setDrill] = useState<StudentsDrill | null>(null);

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

  const openGap = (r: (typeof rows)[number]) => setDrill({
    title: r.m.gap,
    subtitle: sub(`${n(r.support.length)} of ${r.eligible.length}${r.m.covers ? ` in ${r.m.covers}` : ""}`),
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
  const barsClass = `v4-rd-bars ${rows.length === 3 ? "is-three" : ""}`;

  return (
    <div className="v4-page v4-readiness flex flex-col gap-[var(--space-5)]">
      {/* Top indicators: a ring, the share, the name, the count, and an (i)
         that says what counts. A tile picks the list at the foot of the page. */}
      <div role="group" aria-label="Readiness indicators" className={`v4-rd-tiles v4-surface border ${rows.length === 3 ? "is-three" : ""}`}>
        {rows.map((r, i) => {
          const on = r === cur;
          return (
            <div key={r.m.key} className="v4-rd-cell">
              <button type="button" aria-pressed={on} onClick={() => { setPick(i); setShow("support"); }} className="v4-rd-tile dm-quiet">
                <DrawRing pct={r.value} size={52} stroke={6} color={on ? "var(--primary)" : "color-mix(in srgb, var(--primary) 45%, var(--muted-foreground))"} />
                <span>
                  <strong><CountUp value={r.value} /><small>%</small></strong>
                  <span className="v4-rd-label">{r.m.label}</span>
                  <span className="v4-rd-note">{r.met.length} of {r.eligible.length}{r.m.covers ? ` · ${r.m.covers}` : ""}</span>
                </span>
              </button>
              <IconTip label={r.m.info} className="v4-rd-cell-info">
                <button type="button" aria-label={`About ${r.m.label}`} className="v4-r2-info dm-quiet"><Info size={14} aria-hidden /></button>
              </IconTip>
            </div>
          );
        })}
      </div>

      {/* Gaps: the students still missing each indicator, as bars or donuts.
         Each opens those students with Message All. */}
      <section className="v4-surface flex min-w-0 flex-col gap-[var(--space-4)] border p-[var(--space-5)]">
        <header className="v4-r2-head">
          <div className="v4-r2-lead">
            <h2 className="v4-r2-title">Gaps
              <IconTip label="How many students still miss each indicator. The bar is their share of the students it applies to."><button type="button" aria-label="About Gaps" className="v4-r2-info dm-quiet"><Info size={14} aria-hidden /></button></IconTip>
            </h2>
            <span className="v4-r2-sub">Key areas where students still need preparation.</span>
          </div>
          <Segmented ariaLabel="Gaps view" value={gapView} onChange={setGapView} options={[{ key: "bar", label: "Bar view" }, { key: "donut", label: "Donut view" }]} />
        </header>
        {gapView === "bar" ? (
          <div className="v4-rd-gaps">
            {gaps.map((r) => (
              <button key={r.m.key} type="button" onClick={() => openGap(r)} className="v4-rd-gap dm-quiet group" aria-label={`${r.m.gap}: ${n(r.support.length)}. Show them`}>
                <span className="v4-rd-gap-label">{r.m.gap}</span>
                <span className="v4-rd-gap-track" aria-hidden><i style={{ width: `${pct(r.support.length, r.eligible.length)}%` }} /></span>
                <span className="v4-rd-gap-count"><CountUp value={r.support.length} /><small>{r.support.length === 1 ? "student" : "students"}</small></span>
                <ChevronRight size={16} aria-hidden className="transition-transform group-hover:translate-x-[3px]" />
              </button>
            ))}
          </div>
        ) : (
          <div className="v4-rd-donuts">
            {gaps.map((r) => (
              <button key={r.m.key} type="button" onClick={() => openGap(r)} className="v4-rd-donut dm-quiet" aria-label={`${r.m.gap}: ${n(r.support.length)}. Show them`}>
                <Donut pct={pct(r.support.length, r.eligible.length)} count={r.support.length} />
                <span className="v4-rd-donut-label">{r.m.gap}<small>of {r.eligible.length}{r.m.covers ? ` in ${r.m.covers}` : ""}</small></span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Readiness by Grade: one row per grade, the four measures side by
         side, the chevron opens that grade's students (needs support first). */}
      <section className="v4-surface flex min-w-0 flex-col gap-[var(--space-4)] border p-[var(--space-5)]">
        <header className="v4-r2-head">
          <div className="v4-r2-lead">
            <h2 className="v4-r2-title">Readiness by Grade
              <IconTip label="The share of each grade meeting each indicator. Select a grade to see its students, needs support first."><button type="button" aria-label="About Readiness by Grade" className="v4-r2-info dm-quiet"><Info size={14} aria-hidden /></button></IconTip>
            </h2>
            <span className="v4-r2-sub">Compare readiness across grade levels.</span>
          </div>
        </header>
        <div className="v4-rd-grades">
          {grades.map((x) => (
            <button key={x.g} type="button" onClick={() => openGrade(x)} className="v4-rd-grade dm-quiet group" aria-label={`Grade ${x.g}: ${x.cells.map((c) => `${c.r.m.label} ${c.value === null ? "not yet" : `${c.value}%`}`).join(", ")}. Show students`}>
              <span className="v4-rd-grade-name">Grade {x.g}<small>{n(x.students.length)}</small></span>
              <span className={barsClass}>
                {x.cells.map((c) => (
                  <span key={c.r.m.key} className="v4-rd-bar" style={{ ["--bar" as string]: c.r.m.color }}>
                    <b>{c.value === null ? <small>Starts in Grade 10</small> : `${c.value}%`}</b>
                    <span className="v4-rd-bar-track" aria-hidden><i style={{ width: `${c.value ?? 0}%` }} /></span>
                  </span>
                ))}
              </span>
              <ChevronRight size={16} aria-hidden className="transition-transform group-hover:translate-x-[3px]" />
            </button>
          ))}
        </div>
        <div className="v4-r2-legend" aria-hidden>
          {rows.map((r) => <span key={r.m.key}><i style={{ background: r.m.color }} />{r.m.label}</span>)}
        </div>
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
