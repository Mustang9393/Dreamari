"use client";

// The small marks Students > Milestones is drawn with (9 Oct 2026): a
// thin bar for a milestone, a ring for the same milestone in the Donuts
// view, and one dot per milestone for a student ("● ● ● ● ● ◐ ○").
//
// The bar reads without a legend (Chandu, 9 Oct 2026: "the milestones data
// itself seem super dense and wordy and overall super cluttered"): green is
// done, a thin amber mark is who needs attention, and the rest is the
// track. The drawer's `full` bar still shows all four states, where each
// has its label beside it.

import { Tip } from "@/components/app/IconTip";
import { M_LABEL, M_STATES, pctDone, totalOf, type Counts, type Mark } from "./milestonesModel";

export function SegBar({ counts, label, full = false, className = "" }: { counts: Counts; label: string; full?: boolean; className?: string }) {
  if (full) {
    return (
      <span role="img" aria-label={`${label}: ${M_STATES.map((st) => `${counts[st.key]} ${st.label}`).join(", ")}`} className={`v4-ms-bar ${className}`}>
        {M_STATES.map((st) => counts[st.key] > 0 && <span key={st.key} style={{ flexGrow: counts[st.key], background: st.color }} />)}
      </span>
    );
  }
  const total = Math.max(1, totalOf(counts));
  return (
    <span role="img" aria-label={`${label}: ${pctDone(counts)}% done${counts.attention ? `, ${counts.attention} need attention` : ""}`} className={`v4-ms-bar ${className}`}>
      {counts.done > 0 && <span className="is-done" style={{ width: `${(counts.done / total) * 100}%` }} />}
      {counts.attention > 0 && <span className="is-attention" style={{ width: `${(counts.attention / total) * 100}%` }} />}
    </span>
  );
}

/** The bar as a ring, for the Donuts view (Maisha, 9 Oct 2026: "a view
 *  toggle for the milestone breakdown ... between the current line/bar view
 *  and a donut chart view"). Same reading as the bar: green done from the
 *  top, a thin amber arc for who needs attention, the rest is the track
 *  (Readiness' DrawRing stroke and track, so the two pages' rings match).
 *  The percentage sits in the middle; the arcs draw in on arrival. */
export function MilestoneRing({ counts, label, size = 76, stroke = 7 }: { counts: Counts; label: string; size?: number; stroke?: number }) {
  const total = Math.max(1, totalOf(counts));
  const r = (size - stroke) / 2;
  const done = (counts.done / total) * 100;
  const attention = (counts.attention / total) * 100;
  const pct = pctDone(counts);
  return (
    <span className="v4-ms-ring" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${pct}% done${counts.attention ? `, ${counts.attention} need attention` : ""}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth={stroke} />
        {counts.done > 0 && <circle className="v4-ms-ring-arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--v4-ok)" strokeWidth={stroke} pathLength={100} strokeDasharray={`${done} ${100 - done}`} />}
        {counts.attention > 0 && <circle className="v4-ms-ring-arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--v4-warn)" strokeWidth={stroke} pathLength={100} strokeDasharray={`${attention} ${100 - attention}`} strokeDashoffset={-done} />}
      </svg>
      <b>{pct}<small>%</small></b>
    </span>
  );
}

/** A short count line: "5 Done · 1 In Progress · 1 Not Started". */
export const countsLine = (counts: Counts) => M_STATES.filter((st) => counts[st.key] > 0).map((st) => `${counts[st.key]} ${st.label}`).join(" · ");

/** One dot per milestone of the student's grade. Each dot names its
 *  milestone on hover; the group names the counts, so the row itself can
 *  stay to the dots alone. */
export function MilestoneDots({ marks, counts }: { marks: Mark[]; counts: Counts }) {
  const line = countsLine(counts);
  return (
    <Tip label={line}>
      <span role="img" aria-label={`${line}. ${marks.map((m) => `${m.item.name}: ${M_LABEL[m.state]}`).join("; ")}`} className="v4-ms-dots">
        {marks.map((m) => <span key={m.item.id} aria-hidden className={`v4-ms-dot is-${m.state}`} />)}
      </span>
    </Tip>
  );
}
