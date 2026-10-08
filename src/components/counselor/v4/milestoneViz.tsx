"use client";

// The two small marks Students > Milestones is drawn with (9 Oct 2026):
// a thin segmented bar for a milestone (done / in progress / needs
// attention / not started, Maisha's "horizontal segmented progress bar")
// and one dot per milestone for a student ("● ● ● ● ● ◐ ○").

import { Tip } from "@/components/app/IconTip";
import { M_LABEL, M_STATES, type Counts, type Mark } from "./milestonesModel";

export function SegBar({ counts, label, className = "" }: { counts: Counts; label: string; className?: string }) {
  return (
    <span role="img" aria-label={`${label}: ${M_STATES.map((st) => `${counts[st.key]} ${st.label}`).join(", ")}`} className={`v4-ms-bar ${className}`}>
      {M_STATES.map((st) => counts[st.key] > 0 && <span key={st.key} style={{ flexGrow: counts[st.key], background: st.color }} />)}
    </span>
  );
}

/** One dot per milestone of the student's grade, each naming its milestone
 *  on hover; the row reads them all out as one label. */
export function MilestoneDots({ marks }: { marks: Mark[] }) {
  return (
    <span role="img" aria-label={marks.map((m) => `${m.item.name}: ${M_LABEL[m.state]}`).join("; ")} className="v4-ms-dots">
      {marks.map((m) => (
        <Tip key={m.item.id} label={`${m.item.name}: ${M_LABEL[m.state]}`}>
          <span aria-hidden className={`v4-ms-dot is-${m.state}`} />
        </Tip>
      ))}
    </span>
  );
}

/** The legend for the dots, once per list. */
export function DotLegend() {
  return (
    <span className="v4-ms-legend" aria-hidden>
      {M_STATES.map((st) => <span key={st.key}><span className={`v4-ms-dot is-${st.key}`} />{st.label}</span>)}
    </span>
  );
}
