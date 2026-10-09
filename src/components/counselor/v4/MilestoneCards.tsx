"use client";

// Students > Milestones, the Charts view (9 Oct 2026). Chandu: "I need a
// card view with prettier charts/graphs for milestones page ... Default to
// the chart view and have the list as an option. But the graphs need to
// look premium and sexy, use light, glass, gradient etc."
//
// One glass card per milestone, all four of Maisha's states kept (her own
// example reads "77% complete · 23 Done · 4 In Progress · 1 Needs
// Attention · 2 Not Started"):
// - a segmented gauge ring: Done, In Progress and Needs Attention as
//   gradient arcs in their status colours, Not Started is the track. The
//   light comes from a glass disc inside the ring and a soft pool of the
//   done colour behind it, both plain gradients (no blur filters, so a
//   Chromebook paints it cheaply);
// - the percentage rolls up in the middle;
// - the counts beside the ring (see MilestoneCard for what shows);
// - "N waiting" as a small pill in the card's header, only when
//   submissions are queued, so no card carries an empty foot and every
//   card in a row is the same height without a blank band.
// The whole card opens the milestone's drawer, like a list row.

import { useId } from "react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { CountUp } from "./overviewShared";
import { M_STATES, totalOf, type Counts, type MilestoneRow } from "./milestonesModel";

const ARCS = [
  { key: "done", grad: "is-done" },
  { key: "in-progress", grad: "is-progress" },
  { key: "attention", grad: "is-attention" },
] as const;

/** The gauge: each drawn state an arc on a 100-unit circle, a hairline gap
 *  between neighbours so the segments read as separate. */
export function GaugeRing({ counts, pct, label }: { counts: Counts; pct: number; label: string }) {
  const id = useId().replace(/:/g, "");
  const total = Math.max(1, totalOf(counts));
  const size = 120;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const drawn = ARCS.filter((a) => counts[a.key] > 0);
  const gap = drawn.length > 1 ? 1.2 : 0;
  const lens = drawn.map((a) => (counts[a.key] / total) * 100);
  const arcs = drawn.map((a, i) => ({ ...a, start: lens.slice(0, i).reduce((n, l) => n + l, 0), len: Math.max(0.6, lens[i] - gap) }));
  return (
    <span className="v4-msc-gauge" role="img" aria-label={`${label}: ${pct}% done. ${M_STATES.map((st) => `${counts[st.key]} ${st.label}`).join(", ")}`}>
      <span className="v4-msc-pool" aria-hidden />
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
        <defs>
          {ARCS.map((a) => (
            <linearGradient key={a.key} id={`${id}-${a.grad}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" className={`v4-msc-stop-a ${a.grad}`} />
              <stop offset="100%" className={`v4-msc-stop-b ${a.grad}`} />
            </linearGradient>
          ))}
          <radialGradient id={`${id}-disc`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" className="v4-msc-disc-a" />
            <stop offset="100%" className="v4-msc-disc-b" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r - stroke / 2 - 5} fill={`url(#${id}-disc)`} className="v4-msc-disc" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="v4-msc-track" strokeWidth={stroke} />
        {arcs.map((a) => (
          <circle
            key={a.key}
            className="v4-ms-ring-arc"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${id}-${a.grad})`}
            strokeWidth={stroke}
            pathLength={100}
            strokeDasharray={`${a.len} ${100 - a.len}`}
            strokeDashoffset={-a.start}
          />
        ))}
      </svg>
      <b className="v4-msc-pct"><CountUp value={pct} /><small>%</small></b>
    </span>
  );
}

/** A card, in reading order (Chandu, 9 Oct 2026: "more minimalist and
 *  better designed? Less clutter? Proper hierarchy? Simple?"):
 *  1. the milestone's name, with "N waiting" beside it when there is any;
 *  2. the ring and its percentage, the one thing to read at a glance;
 *  3. the counts beside the ring: Done first in full weight, then only the
 *     states that have someone in them, quiet, numbers in one column.
 *  No icon chip and no hover arrow: the name says what it is, and the
 *  whole card opens the drawer (the hover ring says so). A state with
 *  nobody in it is left out instead of printing a faded zero; the drawer
 *  and the List view still show all four. */
export function MilestoneCard({ row, onOpen, onWaiting }: { row: MilestoneRow; onOpen: () => void; onWaiting: () => void }) {
  const waiting = row.key ? row.waiting.length : 0;
  const rest = M_STATES.filter((st) => st.key !== "done" && row.counts[st.key] > 0);
  return (
    <li className="v4-msc-cell">
      <HoverBeam strength={0.45} className="h-full">
        <div onClick={onOpen} className="v4-msc">
          <div className="v4-msc-head">
            <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }} className="v4-msc-title" aria-label={`${row.item.name}: ${row.pct}% complete. Open students`}>{row.item.name}</button>
            {waiting > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); onWaiting(); }} className="v4-msc-wait" aria-label={`${waiting} waiting for you: open the review queue`}>{waiting} waiting</button>}
          </div>
          <div className="v4-msc-body">
            <GaugeRing counts={row.counts} pct={row.pct} label={row.item.name} />
            <dl className="v4-msc-counts">
              <div className="is-lead"><dt><span className="v4-msc-swatch is-done" />Done</dt><dd>{row.counts.done}</dd></div>
              {rest.map((st) => <div key={st.key}><dt><span className={`v4-msc-swatch is-${st.key}`} />{st.label}</dt><dd>{row.counts[st.key]}</dd></div>)}
            </dl>
          </div>
        </div>
      </HoverBeam>
    </li>
  );
}
