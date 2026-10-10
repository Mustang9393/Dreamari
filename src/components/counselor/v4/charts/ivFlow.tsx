"use client";

// A glowing flow (Sankey) for Insights > College & Career > Postsecondary
// Direction (10 Oct 2026). WHY: Chandu's glow references included "a Sankey
// chart with glowing ribbons and glowing node bars", then "GIVE ALL GRAPHS
// THIS SORT OF VISUAL UPGRADE ... AND TRY DIFFERENT KINDS OF GRAPHS". The
// old chart was one dot per student grouped by plan: it said how many chose
// each plan, but not who. Every student has a grade and a plan, so a flow
// from grade to plan says both at once: how big each plan is (the right
// bars), and which grades still have no plan (the grey ribbons into
// "Deciding"). Ribbon thickness is students, on one scale for both sides.
//
// Light: each ribbon is translucent light (about .4 at rest, a gradient
// from the grade's blue to its plan's colour), added on top of the others
// in dark so overlaps read brighter, not as a solid slab. Nodes are thin lit
// slivers with no frames or halos. "Still deciding" stays a quiet grey
// trail: only a chosen plan glows. The right-hand labels are the key
// ("4-year · 66"); plans no one chose are left out, and a plan of one is a
// hairline with its label. Second pass, same day: the first version read as
// "a tangled box" (lit node bars framing it like a rectangle, half the
// width, a duplicate key beside it), so it now spans the section, links are
// sorted inside every node, and nodes have clear gaps. No blur anywhere;
// every animation is opacity.
//
// Every mark opens its students: a grade (left), a plan (right) and every
// ribbon (that grade's students on that plan). Ribbons are focusable and
// show a readout on hover or focus.

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { IconTip } from "@/components/app/IconTip";
import { spread, useArrived, useWidth } from "./insightViz";

export type FlowNode = { key: string; label: string; sub?: string; color: string; aria: string; tip: string; onOpen: () => void; /** unlit, e.g. "Still deciding" */ quiet?: boolean };
export type FlowLink = { from: string; to: string; value: number; aria: string; tip: string; onOpen: () => void };

const BAR = 4;

export function FlowSankey({ left, right, links, height = 300, hot, onHot }: { left: FlowNode[]; right: FlowNode[]; links: FlowLink[]; height?: number; /** a right node lit from outside (the key) */ hot: string | null; onHot: (k: string | null) => void }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const { on, reduce } = useArrived();
  const [hovLeft, setHovLeft] = useState<string | null>(null);
  const [hovLink, setHovLink] = useState<number | null>(null);
  const H = height;
  const narrow = W > 0 && W < 460;
  const padL = narrow ? 74 : 96;
  const padR = narrow ? 98 : 124;
  const x0 = padL, x1 = Math.max(padL + 80, W - padR);
  const live = links.filter((l) => l.value > 0);
  const total = live.reduce((a, l) => a + l.value, 0);
  const valOf = (side: "from" | "to", k: string) => live.filter((l) => l[side] === k).reduce((a, l) => a + l.value, 0);
  const L = left.filter((n) => valOf("from", n.key) > 0);
  const R = right.filter((n) => valOf("to", n.key) > 0);
  // clear gaps between nodes, wider on the plan side, so the two stacks
  // differ in height and the flow never closes into a rectangle
  const gapL = narrow ? 16 : 26, gapR = narrow ? 26 : 44;
  const k = total ? (H - 12 - Math.max(gapL * (L.length - 1), gapR * (R.length - 1))) / total : 0;

  // stack a side's nodes, centred vertically
  const stack = (nodes: FlowNode[], side: "from" | "to", gap: number) => {
    const span = nodes.reduce((a, n) => a + valOf(side, n.key) * k, 0) + gap * Math.max(0, nodes.length - 1);
    let y = (H - span) / 2;
    return nodes.map((n) => { const h = valOf(side, n.key) * k; const box = { n, y, h }; y += h + gap; return box; });
  };
  const lBoxes = stack(L, "from", gapL);
  const rBoxes = stack(R, "to", gapR);
  const lOrder = R.map((n) => n.key);
  const rOrder = L.map((n) => n.key);

  // each ribbon's band at both ends: grades fill top-down in plan order,
  // plans fill top-down in grade order, so ribbons cross as little as possible
  const lCursor = new Map(lBoxes.map((b) => [b.n.key, b.y]));
  const rCursor = new Map(rBoxes.map((b) => [b.n.key, b.y]));
  const bands = new Map<FlowLink, { ya: number; yb: number }>();
  for (const b of lBoxes) {
    for (const to of lOrder) {
      const l = live.find((x) => x.from === b.n.key && x.to === to);
      if (!l) continue;
      const ya = lCursor.get(b.n.key)!;
      lCursor.set(b.n.key, ya + l.value * k);
      bands.set(l, { ya, yb: 0 });
    }
  }
  for (const b of rBoxes) {
    for (const from of rOrder) {
      const l = live.find((x) => x.from === from && x.to === b.n.key);
      if (!l) continue;
      const yb = rCursor.get(b.n.key)!;
      rCursor.set(b.n.key, yb + l.value * k);
      bands.get(l)!.yb = yb;
    }
  }
  const ax = x0 + BAR, bx = x1 - BAR, mx = (ax + bx) / 2;
  const ribbons = live.map((l, i) => {
    const { ya, yb } = bands.get(l)!;
    const t = l.value * k;
    const d = `M${ax} ${ya}C${mx} ${ya} ${mx} ${yb} ${bx} ${yb}L${bx} ${yb + t}C${mx} ${yb + t} ${mx} ${ya + t} ${ax} ${ya + t}Z`;
    const core = `M${ax} ${ya + t / 2}C${mx} ${ya + t / 2} ${mx} ${yb + t / 2} ${bx} ${yb + t / 2}`;
    const to = R.find((n) => n.key === l.to)!;
    const from = L.find((n) => n.key === l.from)!;
    return { l, i, d, core, t, to, from, cy: (ya + yb + t) / 2 };
  });
  const dim = (r: (typeof ribbons)[number]) =>
    (hovLink !== null && hovLink !== r.i) || (hot !== null && r.l.to !== hot) || (hovLeft !== null && r.l.from !== hovLeft);
  const nodeDim = (side: "l" | "r", key: string) => {
    if (hovLink !== null) { const r = ribbons[hovLink]; return side === "l" ? r.l.from !== key : r.l.to !== key; }
    if (side === "l") return (hovLeft !== null && hovLeft !== key) || (hot !== null && !live.some((l) => l.from === key && l.to === hot));
    return (hot !== null && hot !== key) || (hovLeft !== null && !live.some((l) => l.to === key && l.from === hovLeft));
  };
  const rLabelY = spread(rBoxes.map((b) => b.y + b.h / 2), 22, 10, H - 10);
  const key = (e: KeyboardEvent, fn: () => void) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } };
  const tip = hovLink !== null ? ribbons[hovLink] : null;

  return (
    <div ref={ref} className="v4-iv-flow" style={{ height: H }} onMouseLeave={() => { setHovLeft(null); setHovLink(null); onHot(null); }}>
      {W > 0 && total > 0 && (
        <>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden={false} role="group" aria-label="Students by grade and plan">
            <defs>
              {ribbons.map((r) => (
                <linearGradient key={r.i} id={`ivf-${r.i}`} gradientUnits="userSpaceOnUse" x1={ax} x2={bx} y1={0} y2={0}>
                  <stop offset="0%" stopColor={r.to.quiet ? r.to.color : r.from.color} className="v4-iv-flow-s0" />
                  <stop offset="100%" stopColor={r.to.color} className="v4-iv-flow-s1" />
                </linearGradient>
              ))}
            </defs>
            {ribbons.map((r) => (
              <g key={r.i} className={`v4-iv-flow-link ${r.to.quiet ? "is-quiet" : ""} ${on ? "is-on" : ""} ${dim(r) ? "is-dim" : ""} ${hovLink === r.i ? "is-hot" : ""}`}
                style={{ transitionDelay: reduce || !on ? undefined : `${r.i * 30}ms` } as CSSProperties}
                role="button" tabIndex={0} aria-label={r.l.aria}
                onClick={r.l.onOpen} onKeyDown={(e) => key(e, r.l.onOpen)}
                onMouseEnter={() => { setHovLink(r.i); onHot(null); }} onMouseLeave={() => setHovLink(null)}
                onFocus={() => setHovLink(r.i)} onBlur={() => setHovLink(null)}>
                <path d={r.d} fill={`url(#ivf-${r.i})`} className="v4-iv-flow-band" />
                {/* a wider invisible band, so a hairline ribbon is still easy to hover */}
                {r.t < 6 && <path d={r.core} className="v4-iv-flow-hit" />}
              </g>
            ))}
            {/* nodes: thin lit slivers, no frames */}
            {lBoxes.map((b) => (
              <rect key={b.n.key} x={x0} y={b.y} width={BAR} height={Math.max(1.5, b.h)} rx={BAR / 2}
                className={`v4-iv-flow-node ${on ? "is-on" : ""} ${nodeDim("l", b.n.key) ? "is-dim" : ""}`} style={{ ["--c" as string]: b.n.color } as CSSProperties} onClick={b.n.onOpen} />
            ))}
            {rBoxes.map((b) => (
              <rect key={b.n.key} x={x1 - BAR} y={b.y} width={BAR} height={Math.max(1.5, b.h)} rx={Math.min(BAR / 2, Math.max(0.75, b.h / 2))}
                className={`v4-iv-flow-node ${b.n.quiet ? "is-quiet" : ""} ${on ? "is-on" : ""} ${nodeDim("r", b.n.key) ? "is-dim" : ""}`} style={{ ["--c" as string]: b.n.color } as CSSProperties} onClick={b.n.onOpen} />
            ))}
          </svg>
          {/* grade labels (left) and plan labels (right) open their students */}
          {lBoxes.map((b) => (
            <span key={b.n.key} className={`v4-iv-flow-lab is-left ${nodeDim("l", b.n.key) ? "is-dim" : ""}`} style={{ top: b.y + b.h / 2, width: padL - 10 }}>
              <IconTip label={b.n.tip} className="w-full">
                <button type="button" onClick={b.n.onOpen} aria-label={b.n.aria} onMouseEnter={() => setHovLeft(b.n.key)} onMouseLeave={() => setHovLeft(null)} onFocus={() => setHovLeft(b.n.key)} onBlur={() => setHovLeft(null)}>
                  <strong>{b.n.label}</strong>{b.n.sub && <small>{b.n.sub}</small>}
                </button>
              </IconTip>
            </span>
          ))}
          {rBoxes.map((b, i) => (
            <span key={b.n.key} className={`v4-iv-flow-lab is-right ${nodeDim("r", b.n.key) ? "is-dim" : ""}`} style={{ top: rLabelY[i], left: x1 + 8, width: padR - 10 }}>
              <IconTip label={b.n.tip} className="w-full">
                <button type="button" onClick={b.n.onOpen} aria-label={b.n.aria} onMouseEnter={() => onHot(b.n.key)} onMouseLeave={() => onHot(null)} onFocus={() => onHot(b.n.key)} onBlur={() => onHot(null)}>
                  <strong>{b.n.label}</strong>
                </button>
              </IconTip>
            </span>
          ))}
          {tip && (
            <span className="v4-iv-flow-tip" role="tooltip" style={{ left: mx, top: tip.cy }}>{tip.l.tip}</span>
          )}
        </>
      )}
    </div>
  );
}
