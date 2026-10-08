"use client";

// The two small marks Students > Milestones is drawn with (9 Oct 2026):
// a thin bar for a milestone and one dot per milestone for a student
// ("● ● ● ● ● ◐ ○").
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
