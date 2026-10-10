"use client";

// Students > Milestones, the Charts view (9 Oct 2026). Chandu: "I need a
// card view with prettier charts/graphs for milestones page ... Default to
// the chart view and have the list as an option. But the graphs need to
// look premium and sexy, use light, glass, gradient etc."
//
// Redrawn 10 Oct 2026 (Chandu: "try better types of graphs, more beautiful
// ones ... be creative with the graphs, don't be traditional, as long as
// they convey the information sensibly"). The card keeps its order and its
// data (name, "N waiting", the chart, all four of Maisha's states); the
// chart changed:
// - the donut became a tick gauge, one tick per student (TickGauge in
//   milestoneViz.tsx), so the ring also shows how many people a milestone
//   covers, not only how full it is;
// - the green glow pool behind every ring is gone: the page keeps one glow,
//   on the summary's Complete figure, and 35 glowing rings were 35 heroes;
// - the legend swatches are tick-shaped, so the key matches the mark.
// The whole card opens the milestone's drawer, like a list row.
// Drilldowns (Chandu, 10 Oct 2026: "everything needs drilldowns that are
// logical. I see graphs ... that don't do anything when I click"): a
// legend row, or a tick of that colour, opens the drawer already filtered
// to that state, so "2 Needs Attention" leads straight to those two.

import { HoverBeam } from "@/components/app/HoverBeam";
import { Tip } from "@/components/app/IconTip";
import { CountUp } from "./overviewShared";
import { TickGauge, seeLine } from "./milestoneViz";
import { M_STATES, type MState, type MilestoneRow } from "./milestonesModel";

/** A card, in reading order (Chandu, 9 Oct 2026: "more minimalist and
 *  better designed? Less clutter? Proper hierarchy? Simple?"):
 *  1. the milestone's name, with "N waiting" beside it when there is any;
 *  2. the gauge and its percentage, the one thing to read at a glance;
 *  3. the counts beside it: Done first in full weight, then only the
 *     states that have someone in them, quiet, numbers in one column.
 *  A state with nobody in it is left out instead of printing a faded zero;
 *  the drawer and the List view still show all four. */
export function MilestoneCard({ row, onOpen, onWaiting }: { row: MilestoneRow; onOpen: (state?: MState) => void; onWaiting: () => void }) {
  const waiting = row.key ? row.waiting.length : 0;
  const shown = M_STATES.filter((st) => st.key === "done" || row.counts[st.key] > 0);
  return (
    <li className="v4-msc-cell">
      <HoverBeam strength={0.45} className="h-full">
        <div onClick={() => onOpen()} className="v4-msc">
          <div className="v4-msc-head">
            <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }} className="v4-msc-title" aria-label={`${row.item.name}: ${row.pct}% complete. Open students`}>{row.item.name}</button>
            {waiting > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); onWaiting(); }} className="v4-msc-wait" aria-label={`${waiting} waiting for you: open the review queue`}>{waiting} waiting</button>}
          </div>
          <div className="v4-msc-body">
            <TickGauge counts={row.counts} pct={row.pct} label={row.item.name} onPick={(st) => onOpen(st)}>
              <b className="v4-msc-pct"><CountUp value={row.pct} /><small>%</small></b>
            </TickGauge>
            <ul className="v4-msc-counts">
              {shown.map((st) => (
                <li key={st.key} className={st.key === "done" ? "is-lead" : undefined}>
                  <Tip label={seeLine(row.counts[st.key])} className="w-full">
                    <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(st.key); }} aria-label={`${row.item.name}, ${row.counts[st.key]} ${st.label}: ${seeLine(row.counts[st.key])}`}>
                      <span className="v4-msc-count-label"><span className={`msv-key is-${st.key}`} />{st.label}</span>
                      <b>{row.counts[st.key]}</b>
                    </button>
                  </Tip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </HoverBeam>
    </li>
  );
}
