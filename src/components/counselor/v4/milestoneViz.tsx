"use client";

// The marks Students > Milestones is drawn with.
//
// WHY (Chandu, 10 Oct 2026): "Work on different styles for the graphs etc
// and everything inside milestones and insights. Don't change structure of
// the page or organisation of the pages, but please try better types of
// graphs, more beautiful ones ... be creative with the graphs, don't be
// traditional, as long as they convey the information sensibly we can use
// them." So every mark here was redrawn, and every one still counts real
// people, so nothing reads as decoration:
// - TickGauge (Charts view cards): a 270 degree gauge built from one tick
//   per student, filled clockwise Done, In Progress, Needs Attention, with
//   Not Started left as the dim track. It replaces a plain donut: the eye
//   still reads "how full", and the ticks also say "how many people", so a
//   30-student milestone and a 12-student one no longer look the same.
//   Done ticks brighten toward the leading edge, the light on the glass.
// - PillTrack (List view rows): the short meter, now a pill with a lit
//   leading edge, a 2px surface gap before the amber segment and faint
//   quarter ticks in the track, so 70% and 77% compare honestly down the
//   column. Same reading as before (green done, amber needs attention,
//   the rest is the track), so the List stays the quick compare Maisha
//   asked for.
// - CheckpointWaffle (summary, one grade picked): one dot per checkpoint,
//   grouped by state, instead of one long four-colour bar. Hovering a
//   state (dot or legend) lifts that group and dims the rest.
// - StudentDots (drawer): one dot per student, so the drawer's filter
//   chips light up the very people they list.
// - MilestoneDots (By Student): a stepped track, one pill per milestone in
//   curriculum order, so a row reads as a journey, not a string of beads.
// - HeroRing / MiniRing: the page's one glow (the Complete figure) and the
//   quiet rings beside each grade's percentage.
// Every mark drills (Chandu, 10 Oct 2026: "everything needs drilldowns
// that are logical. I see graphs ... that don't do anything when I
// click"): a segment, tick, dot or legend row is a real button with an
// aria-label and a tooltip that says what it opens ("See the 7
// students"), and its hover stays inside its own shape. The callers decide
// what opens (the milestone drawer, filtered; a student's milestone; the
// student list).
// Every animation is off under prefers-reduced-motion (milestones.css), and
// no mark uses a blur filter: light comes from gradients only, so a
// Chromebook paints it cheaply.

import { useId } from "react";
import { Tip } from "@/components/app/IconTip";
import { M_LABEL, M_STATES, pctDone, totalOf, type Counts, type Entry, type Mark, type MState } from "./milestonesModel";

const ORDER: MState[] = ["done", "in-progress", "attention", "not-started"];
export type TrackPick = MState | "open";
/** "See the 7 students" / "See 1 student" */
export const seeLine = (n: number, what = "") => `See ${n === 1 ? "the 1 student" : `the ${n} students`}${what ? ` ${what}` : ""}`;
const countsLabel = (counts: Counts) => M_STATES.map((st) => `${counts[st.key]} ${st.label}`).join(", ");

/** A short count line: "5 Done · 1 In Progress · 1 Not Started". */
export const countsLine = (counts: Counts) => M_STATES.filter((st) => counts[st.key] > 0).map((st) => `${counts[st.key]} ${st.label}`).join(" · ");

/** The states in reading order, one entry per unit, for the dot and tick
 *  marks. Past `cap` units each mark stands for an even share, so a big
 *  caseload never turns the ticks into hairlines. */
function sequence(counts: Counts, cap = Infinity): MState[] {
  const total = totalOf(counts);
  const flat: MState[] = ORDER.flatMap((k) => Array.from({ length: counts[k] }, () => k));
  if (total <= cap) return flat;
  return Array.from({ length: cap }, (_, i) => flat[Math.min(total - 1, Math.floor(((i + 0.5) * total) / cap))]);
}

/** The List view meter. Green done with a lit leading edge, a thin amber
 *  segment for who needs attention, quarter ticks in the track. Each part
 *  is a button: the green part opens the drawer on Done, the amber part on
 *  Needs Attention, the rest of the track on everyone not done. */
export function PillTrack({ counts, label, onPick, className = "" }: { counts: Counts; label: string; onPick: (p: TrackPick) => void; className?: string }) {
  const total = Math.max(1, totalOf(counts));
  const rest = counts["in-progress"] + counts["not-started"];
  const seg = (key: string, n: number, pick: TrackPick, what: string, width?: string) => (
    <span key={key} className={`msv-slot ${width ? "" : "is-rest"}`} style={width ? { width } : undefined}>
      <Tip label={seeLine(n, what)} className="h-full w-full">
        <button type="button" onClick={(e) => { e.stopPropagation(); onPick(pick); }} aria-label={`${label}: ${seeLine(n, what)}`} className={`msv-seg is-${key}`} />
      </Tip>
    </span>
  );
  return (
    <span role="group" aria-label={`${label}: ${pctDone(counts)}% done${counts.attention ? `, ${counts.attention} need attention` : ""}`} className={`msv-track ${className}`}>
      {counts.done > 0 && seg("done", counts.done, "done", "done", `${(counts.done / total) * 100}%`)}
      {counts.attention > 0 && seg("attention", counts.attention, "attention", "who need attention", `${(counts.attention / total) * 100}%`)}
      {rest > 0 && seg("rest", rest, "open", "still working on it")}
    </span>
  );
}

/** One tick per student around a 270 degree sweep, open at the bottom. */
export function TickGauge({ counts, pct, label, onPick, children }: { counts: Counts; pct: number; label: string; onPick?: (s: MState) => void; children?: React.ReactNode }) {
  const size = 120;
  const c = size / 2;
  const rIn = 43;
  const rOut = 56;
  const ticks = sequence(counts, 60);
  const n = Math.max(1, ticks.length);
  const sweep = 270;
  const start = 135;
  // tick width: just over half its slot, so the gaps read as separate people
  const slot = (2 * Math.PI * ((rIn + rOut) / 2) * (sweep / 360)) / n;
  const width = Math.max(1.6, Math.min(5.5, slot * 0.5));
  const doneN = ticks.filter((t) => t === "done").length;
  return (
    <span className="msv-gauge" role="img" aria-label={`${label}: ${pct}% done. ${countsLabel(counts)}`}>
      {/* a tick click opens that tick's state (the legend beside the gauge
         is the keyboard path to the same filters) */}
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden className={onPick ? "is-live" : undefined} onClick={onPick ? (e) => { const st = (e.target as Element).getAttribute("data-state") as MState | null; if (st) { e.stopPropagation(); onPick(st); } } : undefined}>
        {ticks.map((state, i) => {
          const a = ((start + (sweep * (i + 0.5)) / n) * Math.PI) / 180;
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          // done ticks brighten toward the leading edge
          const lit = state === "done" && doneN > 1 ? Math.round((i / (doneN - 1)) * 100) : null;
          return (
            <line
              key={i}
              x1={c + rIn * cos}
              y1={c + rIn * sin}
              x2={c + rOut * cos}
              y2={c + rOut * sin}
              strokeWidth={width}
              className={`msv-tick is-${state}`}
              data-state={state}
              style={{ "--i": i, ...(lit !== null ? { stroke: `color-mix(in oklab, var(--msv-done-lit) ${lit}%, var(--msv-done))` } : null) } as React.CSSProperties}
            />
          );
        })}
      </svg>
      <span className="msv-gauge-center">{children}</span>
    </span>
  );
}

/** The summary for one grade: one dot per checkpoint, column by column,
 *  Done first. The legend beside it names the unit and the counts. */
export function CheckpointWaffle({ counts, label, onPick }: { counts: Counts; label: string; onPick: (s: MState) => void }) {
  const cells = sequence(counts);
  const total = cells.length;
  if (!total) return <p className="msv-waffle-empty">No milestone activity yet</p>;
  return (
    <div className="msv-waffle-wrap" style={{ "--n": total } as React.CSSProperties}>
      {/* a dot click opens its state across the grade's milestones; the
         legend buttons are the keyboard path to the same drill */}
      <div className="msv-waffle" role="img" aria-label={`${label} checkpoints: ${countsLabel(counts)}`} onClick={(e) => { const st = (e.target as Element).getAttribute("data-state") as MState | null; if (st) onPick(st); }}>
        {cells.map((state, i) => <span key={i} aria-hidden data-state={state} className={`msv-cell is-${state}`} style={{ "--i": i } as React.CSSProperties} />)}
      </div>
      <div className="msv-legend">
        <span className="msv-legend-title">Checkpoints</span>
        {M_STATES.map((st) => counts[st.key] > 0 && (
          <Tip key={st.key} label={`See the ${counts[st.key]} ${st.label} ${counts[st.key] === 1 ? "checkpoint" : "checkpoints"}`}>
            <button type="button" onClick={() => onPick(st.key)} className={`msv-legend-item is-${st.key}`} aria-label={`${counts[st.key]} ${st.label}: see the milestones and students`}>
              <span aria-hidden className={`msv-swatch is-${st.key}`} />
              <b>{counts[st.key]}</b>
              <span>{st.label}</span>
            </button>
          </Tip>
        ))}
      </div>
    </div>
  );
}

/** The drawer's people: one dot per student in state order. The dots
 *  outside the active filter step back, so the chips and the chart are
 *  one control. Each dot names its student on hover. */
export function StudentDots({ entries, active, label, onPick }: { entries: Entry[]; active: (s: MState) => boolean; label: string; onPick: (id: string) => void }) {
  return (
    // even rows: one row up to 24 students, then two or three
    <div className="msv-people" role="group" aria-label={`${label}: one dot per student`} style={{ "--cols": entries.length <= 24 ? Math.max(entries.length, 12) : Math.ceil(entries.length / (entries.length <= 48 ? 2 : 3)) } as React.CSSProperties}>
      {entries.map((e) => (
        <Tip key={e.s.id} label={`${e.s.name} · ${M_LABEL[e.state]}`}>
          <button type="button" onClick={() => onPick(e.s.id)} aria-label={`${e.s.name}, ${M_LABEL[e.state]}: show in the list`} className={`msv-person is-${e.state} ${active(e.state) ? "" : "is-dim"}`} />
        </Tip>
      ))}
    </div>
  );
}

/** A ring for one figure. `hero` carries the page's one glow. */
export function HeroRing({ pct, size = 44, stroke = 5, hero = false, label }: { pct: number; size?: number; stroke?: number; hero?: boolean; label?: string }) {
  const id = `msv-ring-${useId().replace(/:/g, "")}`;
  const r = (size - stroke) / 2;
  const v = Math.max(0, Math.min(100, pct));
  return (
    <span className={`msv-ring ${hero ? "is-hero" : ""}`} style={{ width: size, height: size }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" className="msv-ring-a" />
            <stop offset="100%" className="msv-ring-b" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="msv-ring-track" strokeWidth={stroke} />
        {v > 0 && <circle className="msv-ring-arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" pathLength={100} strokeDasharray={`${v} ${100 - v}`} />}
      </svg>
    </span>
  );
}

/** One pill per milestone of the student's grade, in curriculum order.
 *  Each pill's state reads by fill (done), half fill (in progress), amber
 *  (needs attention) or outline (not started), not by colour alone. Each
 *  pill names its milestone on hover and opens it for this student. */
export function MilestoneDots({ marks, counts, who, onPick }: { marks: Mark[]; counts: Counts; who: string; onPick: (m: Mark) => void }) {
  return (
    <span role="group" aria-label={`${who}: ${countsLine(counts)}`} className="msv-steps">
      {marks.map((m) => (
        <Tip key={m.item.id} label={`${m.item.name} · ${M_LABEL[m.state]}`}>
          <button type="button" onClick={(e) => { e.stopPropagation(); onPick(m); }} aria-label={`${m.item.name}: ${M_LABEL[m.state]}. Open it for ${who}`} className={`msv-step is-${m.state}`} />
        </Tip>
      ))}
    </span>
  );
}
