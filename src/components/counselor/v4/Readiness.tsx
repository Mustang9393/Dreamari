"use client";

// Readiness: "Are my students prepared for what comes next?" Rebuilt 9 Oct
// 2026 from Maisha's notes: "Bring 'Readiness' from v5. Use the v5 Readiness
// structure, but update the content. Keep the general structure: Top
// indicators, Trend over time, By Grade, Student drill-down." So this is
// v5 Analytics' readiness tab (v5/Analytics.tsx) in v4's surfaces: four
// indicators, the picked one's trend and grade split, and the students who
// still need it.
//
// The indicators are hers: "On Track to Graduate, Academic Plan Complete,
// Postsecondary Plan Defined, Career Pathway Identified." GPA 2.0+ and
// Attendance 90%+ are gone as headlines ("Remove GPA 2.0+ and Attendance
// 90%+ as primary headline metrics"); the SIS still shows both on each
// student's profile. There is no combined score ("Do not combine the four
// indicators into one universal readiness score yet"). On Track to Graduate
// shows only while the SIS is connected, because it is computed from credits
// the school's records carry, not from anything Dreamari tracks.
//
// "Not Yet" is now "Needs Support" ("Change 'Not Yet' to something more
// action-oriented"), and every number opens its students: a tile picks the
// list below, a grade opens that grade's students in the side panel, and
// each student has View, Message and Schedule beside them.
//
// Replaces v4's older admin Readiness page (four target cards by grade),
// which no menu opened any more; its compare-by-grade reading lives on in
// By Grade.

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { milestonesForGrade, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { sisFor } from "@/lib/counselorSis";
import { DrawRing, TrendChart } from "../v5/charts";
import { CountUp } from "./InsightCharts";
import { Segmented } from "./viz";
import { InsightStudentsPanel, StudentRows, messageHref, type StudentsDrill } from "./InsightStudents";
import { GRADES, doneBy, pct, sisConnected, useInsightsScope } from "./insightsScope";
import { seedHash } from "@/lib/localRecord";
import "./insights.css";

type Measure = {
  key: string;
  label: string;
  /** what "met" is called in the list toggle */
  doneWord: string;
  eligible: (s: CounselorStudent) => boolean;
  met: (s: CounselorStudent) => boolean;
  /** the line under a student's name: where they stand on this measure */
  note: (s: CounselorStudent) => string;
  /** who the measure covers, when that is not everyone */
  covers?: string;
};

const finished = (s: CounselorStudent, k: MilestoneKey) => s.milestones[k] === "Approved" || s.milestones[k] === "Completed";

function measures(): Measure[] {
  const list: Measure[] = [
    { key: "academic-plan", label: "Academic Plan Complete", doneWord: "Complete", eligible: () => true, met: (s) => finished(s, "Academic Plan"), note: (s) => s.milestones["Academic Plan"] },
    { key: "postsecondary", label: "Postsecondary Plan Defined", doneWord: "Defined", eligible: () => true, met: (s) => s.postsecondaryIntent !== "Undecided", note: (s) => (s.postsecondaryIntent === "Undecided" ? "No plan yet" : s.postsecondaryIntent) },
    { key: "career-pathway", label: "Career Pathway Identified", doneWord: "Identified", eligible: (s) => milestonesForGrade(s.grade).includes("Career Pathway"), met: (s) => finished(s, "Career Pathway"), note: (s) => (finished(s, "Career Pathway") ? s.careerTrack : `Exploring ${s.careerTrack}`), covers: "Grades 10 to 12" },
  ];
  // Gated on the SIS (Maisha: "Only show On Track to Graduate if the
  // necessary SIS/student data is actually available").
  if (sisConnected()) list.unshift({ key: "on-track", label: "On Track to Graduate", doneWord: "On track", eligible: () => true, met: (s) => sisFor(s).onTrackToGraduate, note: (s) => { const c = sisFor(s).credits; return c.earned >= c.expected ? `${c.earned} credits` : `${c.expected - c.earned} credit${c.expected - c.earned === 1 ? "" : "s"} behind`; } });
  return list;
}

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** DEMO-ONLY: a measure's month-by-month history until the school's
 *  snapshots are stored (v5's historyFor rule: it ends on the real value,
 *  climbs to it with small natural dips). The current year is the last
 *  eight months; an earlier school year is its own September to June. */
function trend(seed: string, now: number, back: number): { label: string; value: number }[] {
  const today = new Date();
  const labels = back === 0
    ? Array.from({ length: 8 }, (_, i) => MONTH[(today.getMonth() - 7 + i + 12) % 12])
    : ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const h = seedHash(seed);
  const start = Math.max(0, Math.round(now * 0.62));
  const n = labels.length;
  return labels.map((label, i) => {
    const wobble = i === 0 || i === n - 1 ? 0 : ((h >> i) % 7) - 3;
    const v = i === n - 1 ? now : Math.round(start + ((now - start) * i) / (n - 1) + wobble);
    return { label, value: Math.max(0, Math.min(100, v)) };
  });
}

export function Readiness() {
  const router = useRouter();
  const scope = useInsightsScope();
  const { roster, back, year, scopeLabel } = scope;
  const list = useMemo(() => measures(), []);
  const [pick, setPick] = useState(0);
  const [show, setShow] = useState<"support" | "done">("support");
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

  const grades = GRADES.map((g) => {
    const eligible = cur.eligible.filter((s) => s.grade === g);
    const met = cur.met.filter((s) => s.grade === g);
    return { g, eligible, met, support: eligible.filter((s) => !met.includes(s)), value: pct(met.length, eligible.length) };
  }).filter((r) => r.eligible.length > 0);

  const openGrade = (r: (typeof grades)[number]) => setDrill({
    title: `Grade ${r.g}: ${cur.m.label}`,
    subtitle: sub(`${r.met.length} of ${r.eligible.length} ${cur.m.doneWord.toLowerCase()}`),
    stats: [{ value: `${r.value}%`, label: cur.m.doneWord.toLowerCase() }, { value: String(r.support.length), label: "need support" }],
    students: r.support.map((s) => ({ s, note: cur.m.note(s) })),
    listLabel: `Needs Support · ${r.support.length}`,
  });

  if (roster.length === 0) {
    return <p className="v4-filter-empty">No students match {scope.who}. Try a different grade or group.</p>;
  }

  const listed = show === "support" ? cur.support : cur.met;

  return (
    <div className="v4-page v4-readiness flex flex-col gap-[var(--space-5)]">
      {/* Top indicators: each a ring, its share and the count behind it. A
         tile picks the measure the rest of the page reads. */}
      <div role="group" aria-label="Readiness indicators" className={`v4-readiness-tiles v4-surface border ${rows.length === 3 ? "is-three" : ""}`}>
        {rows.map((r, i) => {
          const on = r === cur;
          return (
            <button key={r.m.key} type="button" aria-pressed={on} onClick={() => { setPick(i); setShow("support"); }} className="v4-readiness-tile dm-quiet">
              <DrawRing pct={r.value} size={52} stroke={6} color={on ? "var(--primary)" : "color-mix(in srgb, var(--primary) 45%, var(--muted-foreground))"} />
              <span className="flex min-w-0 flex-col gap-[2px]">
                <strong><CountUp value={r.value} /><small>%</small></strong>
                <span className="v4-readiness-label">{r.m.label}</span>
                <span className="v4-readiness-note">{r.met.length} of {r.eligible.length}{r.m.covers ? ` · ${r.m.covers}` : ""}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="v4-readiness-pair">
        <section className="v4-surface flex min-w-0 flex-col gap-[var(--space-3)] border p-[var(--space-5)]">
          <header className="v4-card-head"><h2>Trend Over Time</h2><span>{cur.m.label}{back === 0 ? " · last 8 months" : ` · ${year.label}`}</span></header>
          {/* DEMO-ONLY: monthly history is seeded (trend above) until year-end
             snapshots are stored; the last point is the real value. */}
          <TrendChart key={`${cur.m.key}-${back}-${scopeLabel}`} label={`${cur.m.label} by month`} points={trend(`${cur.m.key}-${scopeLabel}-${back}`, cur.value, back)} max={100} height={250} />
        </section>
        <section className="v4-surface flex min-w-0 flex-col gap-[var(--space-3)] border p-[var(--space-5)]">
          <header className="v4-card-head"><h2>By Grade</h2><span>Select a grade to see who needs support</span></header>
          <ul className="v4-grade-bars">
            {grades.map((r) => (
              <li key={r.g}>
                <button type="button" onClick={() => openGrade(r)} className="v4-grade-bar dm-quiet group">
                  <span className="v4-grade-bar-top"><span>Grade {r.g}</span><b>{r.value}%</b></span>
                  <span className="v4-grade-bar-track" aria-hidden><i style={{ width: `${r.value}%` }} /></span>
                  <small>{r.support.length ? `${r.support.length} need support` : "Everyone is there"}</small>
                </button>
              </li>
            ))}
            {grades.length === 0 && <li className="v4-source-note">{cur.m.label} starts in Grade 10.</li>}
          </ul>
        </section>
      </div>

      {/* The students the number counts, the part a counselor acts on. */}
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
