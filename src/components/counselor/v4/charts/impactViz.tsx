"use client";

// WHY (10 Oct 2026, Chandu): "try better types of graphs, more beautiful
// ones ... be creative with the graphs, don't be traditional, as long as
// they convey the information sensibly we can use them." My Impact's own
// chart forms, v4 only. Same sections, same order, same data and drills:
//   - DotConstellation: the cover's on-track rate as one dot per student,
//     set as rays of four and lit clockwise, so 85% reads as a sweep of
//     real people. Kept exactly as it was before the glow pass: Chandu,
//     same day, "My impact was better before, the hero graph used to be a
//     dotted rose kinda thing? That was way better than this." A loved
//     exception to the few-marks rule, like Readiness's Gaps donut.
//   - SlopeGraph (follow-up, same day: "ASCA Alignment and District goals
//     need better graphs. Think beyond bars and donuts please."): each ASCA
//     measure is a line from last semester to now, labelled at its end,
//     drawn as a light trail (still straight: two points), an orb at "now".
//   - GoalRose: one petal per district goal, its length the result as a
//     share of target, a ring at 100%; met petals green, short ones amber.
//     Each petal is a soft field of light that brightens toward its tip.
//   - Win visuals ("The Key Wins can also be better"), each a handful of
//     light marks: a flow of the undecided splitting into "chose" and
//     "still exploring", a step up, a level against the district mark, a
//     review-days line, a lift line, a pathway climbing to an orb. Dots,
//     gauges and clocks went with the same rules ("I dont like bar
//     graphs", "why is everything a ring to you?").
//     The On track card was a 100-cell lift waffle; Chandu: "IM NOT REALLY
//     SURE WHAT THE ON TRACK REPRESENTS? ... Why are some squares dark and
//     others light?" Now it is one labelled 0 to 100% line: an orb at
//     "You", a tick at "School", the bright stretch between them labelled
//     "+14", so every mark says what it is.
//   - TimeFlow: Use of Time as a Sankey of light from the time logged into
//     the four categories, the ASCA 80% line across the source. It was 100
//     cells; the user asked for few marks and suggested this flow.
// Blue family plus status colours only; text never wears the data colour.
// Motion is opacity and transform, off under reduced motion.

import { useId, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Tip } from "@/components/app/IconTip";
import { Aurora, GLOW, GlowStroke, Orb } from "./glow";
import "./impactViz.css";

/** A small lit tube for the Key Wins minis: the shared kit's bloom and
 *  hot-core classes (glow.css tokens), with a tighter bloom than
 *  GlowStroke's so it fits a small card without spilling. */
function ImTube({ d, width = 2.5, className, color = GLOW.blue }: { d: string; width?: number; className?: string; color?: string }) {
  const common = { d, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g className={["gl-stroke", className ?? ""].join(" ")} style={{ ["--gl-c" as string]: color }}>
      <path {...common} className="gl-bloom gl-b2" strokeWidth={width * 3.4} />
      <path {...common} className="gl-bloom gl-b1" strokeWidth={width * 1.9} />
      <path {...common} stroke={color} strokeWidth={width} />
      <path {...common} className="gl-core" strokeWidth={Math.max(0.8, width * 0.34)} />
    </g>
  );
}

/** One dot per student in concentric rings, lit clockwise from 12 o'clock. */
export function DotConstellation({ lit, total }: { lit: number; total: number }) {
  const reduce = useReducedMotion();
  const gid = `iv-glow-${useId().replace(/:/g, "")}`;
  // Past 200 students each dot is 1% instead of one student.
  const n = total <= 200 ? Math.max(1, total) : 100;
  const on = total <= 200 ? lit : Math.round((lit / Math.max(1, total)) * 100);
  // Spokes: each spoke is a short radial line of dots, inner to outer, so
  // the lit share sweeps clockwise as clean rays (the last spoke may be short).
  const rings = n <= 40 ? [96, 111, 126] : [84, 98, 112, 126];
  const spokes = Math.ceil(n / rings.length);
  const sizes = rings.map((_, i) => 2.4 + i * (n > 150 ? 0.4 : 0.7));
  const dots = Array.from({ length: n }, (_, i) => {
    const sp = Math.floor(i / rings.length), ri = i % rings.length;
    const t = (sp + 0.5) / spokes;
    return { t, x: 140 + Math.sin(t * Math.PI * 2) * rings[ri], y: 140 - Math.cos(t * Math.PI * 2) * rings[ri], r: sizes[ri] };
  });
  return (
    <svg viewBox="0 0 280 280" className="iv-constellation" aria-hidden="true">
      <defs>
        <radialGradient id={gid}><stop offset="0%" stopColor="var(--v4-chart-1)" stopOpacity=".42" /><stop offset="50%" stopColor="var(--v4-chart-1)" stopOpacity=".12" /><stop offset="100%" stopColor="var(--v4-chart-1)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="140" cy="140" r="138" fill={`url(#${gid})`} className="iv-hero-glow" />
      {dots.map((d, i) => {
        const isOn = i < on;
        const mix = on > 1 ? Math.round(45 + (i / (on - 1)) * 55) : 100;
        return (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} className={isOn ? "iv-star is-on" : "iv-star"}
            style={isOn ? { fill: `color-mix(in srgb, var(--v4-chart-1) ${mix}%, var(--v4-chart-2))`, animationDelay: reduce ? undefined : `${Math.round(d.t * 900)}ms` } : undefined} />
        );
      })}
    </svg>
  );
}

export type FlowGroup = { c: string; pct: number; color: string; /** admin time: a quiet grey ribbon, not lit */ quiet?: boolean };

/** Use of Time as a Sankey of light: the time logged flows from one node
 *  on the left into the categories on the right, each ribbon's width its
 *  share. Student services come first, so the ASCA 80% line drawn across
 *  the source shows at a glance whether they fill it. Hovering a ribbon
 *  (or a legend row) lights it; a ribbon opens its entries. */
export function TimeFlow({ groups, target, active, onActive, onPick, label }: { groups: FlowGroup[]; target: number; active?: string | null; onActive?: (c: string | null) => void; /** a ribbon opens its category's entries */ onPick?: (c: string) => void; label: string }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const [wrap, width] = useWidth<HTMLDivElement>();
  const narrow = width > 0 && width < 520;
  const H = narrow ? 156 : 176, top = 8, bottom = 8, gap = narrow ? 12 : 16;
  const total = groups.reduce((a, g) => a + Math.max(0, g.pct), 0) || 1;
  const live = groups.filter((g) => g.pct > 0);
  const plotH = H - top - bottom;
  const xs = narrow ? 64 : 92, xe = Math.max(xs + 80, width - (narrow ? 44 : 52));
  // the source is a short node in the middle; the targets spread out with
  // gaps, so the ribbons fan like a flow instead of stacking like bars
  const sH = plotH * 0.52, sTop = top + (plotH - sH) / 2;
  const tH = plotH - gap * Math.max(0, live.length - 1);
  const shares = live.map((g) => Math.max(0, g.pct) / total);
  const before = shares.map((_, i) => shares.slice(0, i).reduce((a, n) => a + n, 0));
  const ribbons = live.map((g, i) => {
    const share = shares[i];
    const a0 = sTop + before[i] * sH, a1 = a0 + share * sH;
    const b0 = top + before[i] * tH + i * gap, b1 = b0 + share * tH;
    const mx = (xs + xe) / 2;
    const d = `M${xs} ${a0.toFixed(1)} C${mx} ${a0.toFixed(1)} ${mx} ${b0.toFixed(1)} ${xe} ${b0.toFixed(1)} L${xe} ${b1.toFixed(1)} C${mx} ${b1.toFixed(1)} ${mx} ${a1.toFixed(1)} ${xs} ${a1.toFixed(1)} Z`;
    const mid = `M${xs} ${((a0 + a1) / 2).toFixed(1)} C${mx} ${((a0 + a1) / 2).toFixed(1)} ${mx} ${((b0 + b1) / 2).toFixed(1)} ${xe} ${((b0 + b1) / 2).toFixed(1)}`;
    return { g, d, mid, b0, b1, pct: Math.round(share * 100) };
  });
  const yt = sTop + (target / 100) * sH;
  return (
    <div ref={wrap} className="iv-flow" style={{ height: H }} role="img" aria-label={label} onPointerLeave={() => onActive?.(null)}>
      {width > 0 && (
        <svg width={width} height={H} aria-hidden="true">
          <defs>
            {ribbons.map((r, i) => (
              <linearGradient key={i} id={`iv-fr-${id}-${i}`} x1={xs} x2={xe} y1="0" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={r.g.color} className="iv-fr-0" />
                <stop offset="100%" stopColor={r.g.color} className="iv-fr-1" />
              </linearGradient>
            ))}
          </defs>
          {ribbons.map((r, i) => {
            const dim = active && active !== r.g.c;
            return (
              <g key={r.g.c} className={`iv-ribbon${r.g.quiet ? " is-quiet" : ""}${dim ? " is-dim" : ""}${active === r.g.c ? " is-lit" : ""}${reduce ? "" : " iv-rise"}`}
                style={reduce ? undefined : { animationDelay: `${i * 90}ms` }}
                onPointerEnter={() => onActive?.(r.g.c)} onClick={onPick ? () => onPick(r.g.c) : undefined} cursor={onPick ? "pointer" : undefined}>
                <path d={r.d} fill={`url(#iv-fr-${id}-${i})`} className="iv-ribbon-body" />
                {!r.g.quiet && <path d={r.mid} className="iv-ribbon-core" style={{ stroke: r.g.color }} />}
                {/* the arriving node: a short lit line, its share beside it */}
                <line x1={xe} x2={xe} y1={r.b0 + 1} y2={r.b1 - 1} className="iv-node" style={{ stroke: r.g.color }} />
                <text x={xe + 8} y={(r.b0 + r.b1) / 2 + 4} className="iv-flow-pct">{r.pct}%</text>
              </g>
            );
          })}
          {/* the source: all the time logged */}
          <line x1={xs} x2={xs} y1={sTop} y2={sTop + sH} className="iv-node is-source" />
          {/* the ASCA line across the source: student services (top) should reach it */}
          <line x1={xs - 8} x2={xs + 26} y1={yt} y2={yt} className="iv-flow-target" />
          <text x={xs - 12} y={yt - 3} textAnchor="end" className="iv-flow-tlabel">ASCA</text>
          <text x={xs - 12} y={yt + 10} textAnchor="end" className="iv-flow-tlabel">{target}%</text>
        </svg>
      )}
    </div>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Push sorted positions apart by at least `gap`, keeping them inside [lo, hi]. */
function nudge(ys: number[], gap: number, lo: number, hi: number) {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) order[k].y = Math.max(order[k].y, order[k - 1].y + gap);
  const over = order.length ? order[order.length - 1].y - hi : 0;
  if (over > 0) order.forEach((o) => { o.y -= over; });
  for (let k = order.length - 2; k >= 0; k--) order[k].y = Math.min(order[k].y, order[k + 1].y - gap);
  if (order.length && order[0].y < lo) { const d = lo - order[0].y; order.forEach((o) => { o.y += d; }); }
  const out = [...ys];
  order.forEach((o) => { out[o.i] = o.y; });
  return out;
}

export type SlopeItem = { key: string; pct: number; delta: number; short: string; label: string; /** what the label's tooltip says it opens */ tip: string; onOpen: () => void };

/** Last semester (left axis) to now (right axis), one line per measure,
 *  a direct label at the right end. `lo` crops the scale; the caption says so. */
export function SlopeGraph({ items, lo }: { items: SlopeItem[]; lo: number }) {
  const reduce = useReducedMotion();
  const [wrap, width] = useWidth<HTMLDivElement>();
  const [lit, setLit] = useState<string | null>(null);
  // Narrow screens wrap the labels onto two lines, so they get more room.
  const narrow = width > 0 && width < 480;
  const H = narrow ? 236 : 196, top = 14, bottom = 30;
  const plotH = H - top - bottom;
  const x0 = 40;
  const slopeW = narrow ? Math.max(80, width * 0.28) : Math.max(84, Math.min(240, width * 0.38));
  const x1 = x0 + slopeW;
  const y = (v: number) => top + (1 - (Math.max(lo, Math.min(100, v)) - lo) / (100 - lo)) * plotH;
  const grid = Array.from({ length: Math.floor((100 - lo) / 10) + 1 }, (_, i) => lo + i * 10);
  const rightY = nudge(items.map((it) => y(it.pct)), narrow ? 62 : 40, top, top + plotH);
  const leftY = nudge(items.map((it) => y(it.pct - it.delta)), 16, top, top + plotH);
  return (
    <div ref={wrap} className="iv-slope" style={{ height: H }} onPointerLeave={() => setLit(null)}>
      {width > 0 && (
        <svg width={width} height={H} aria-hidden="true" className="iv-slope-svg">
          {grid.map((g) => <line key={g} x1={x0} x2={x1} y1={y(g)} y2={y(g)} className="iv-slope-grid" />)}
          <line x1={x0} x2={x0} y1={top} y2={top + plotH} className="iv-slope-axis" />
          <line x1={x1} x2={x1} y1={top} y2={top + plotH} className="iv-slope-axis" />
          <text x={x0} y={H - 8} textAnchor="middle" className="iv-slope-cap">Last sem.</text>
          <text x={x1} y={H - 8} textAnchor="middle" className="iv-slope-cap">Now</text>
          {items.map((it, i) => {
            const a = y(it.pct - it.delta);
            // a level line has a zero-height box, which would blank its gradient
            const b = Math.abs(y(it.pct) - a) < 0.01 ? a - 0.02 : y(it.pct);
            const dim = lit && lit !== it.key;
            return (
              <g key={it.key} className={dim ? "iv-slope-line is-dim" : "iv-slope-line"} onPointerEnter={() => setLit(it.key)} onClick={it.onOpen}>
                <g className={reduce ? undefined : "iv-rise"} style={{ animationDelay: reduce ? undefined : `${i * 120}ms` }}>
                  <GlowStroke d={`M${x0} ${a.toFixed(2)} L${x1} ${b.toFixed(2)}`} color={GLOW.blue} width={2.5} from={0.4} />
                </g>
                <line x1={x0} y1={a} x2={x1} y2={b} stroke="transparent" strokeWidth="18" />
                <circle cx={x0} cy={a} r="2.5" className="iv-slope-from" />
                <Orb cx={x1} cy={b} r={5} color={GLOW.blue} />
                <text x={x0 - 9} y={leftY[i] + 4} textAnchor="end" className="iv-slope-left">{Math.round(it.pct - it.delta)}</text>
                {Math.abs(rightY[i] - b) > 3 && <line x1={x1 + 6} y1={b} x2={x1 + 14} y2={rightY[i]} className="iv-slope-leader" />}
              </g>
            );
          })}
        </svg>
      )}
      {width > 0 && items.map((it, i) => (
        <div key={it.key} className="iv-slope-slot" style={{ left: x1 + 4, top: rightY[i] }}>
        <Tip label={it.tip} className="max-w-full">
        <button type="button" onClick={it.onOpen} className={lit && lit !== it.key ? "iv-slope-label dm-quiet is-dim" : "iv-slope-label dm-quiet"}
          onPointerEnter={() => setLit(it.key)} onFocus={() => setLit(it.key)} onBlur={() => setLit(null)}
          aria-label={`${it.label}: ${it.pct}%, ${it.delta >= 0 ? "up" : "down"} ${Math.abs(it.delta)} points from last semester. Show students`}>
          <strong>{it.pct}%</strong><span>{it.short}</span><em>{it.delta >= 0 ? "+" : ""}{it.delta}</em>
        </button>
        </Tip>
        </div>
      ))}
    </div>
  );
}

export type RoseGoal = { key: string; short: string; ratio: number; met: boolean; value: string };

/** One petal per goal: length is result / target (inverted for lower is
 *  better before it gets here), capped at 130%; a ring marks 100%. Each
 *  petal fills with status-coloured light that brightens toward its tip,
 *  so the length reads as where the light reaches. */
export function GoalRose({ goals, lit, onLit, onOpen }: { goals: RoseGoal[]; lit: string | null; onLit: (k: string | null) => void; onOpen: (k: string) => void }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const C = 130, R = 92, CAP = 1.3;
  const r100 = R / CAP;
  const n = goals.length;
  const half = Math.min(0.62, (Math.PI / n) * 1.1);
  const litGoal = goals.find((g) => g.key === lit);
  return (
    <Tip label={litGoal ? `${litGoal.short}: open its students` : "Select a petal to open its students"} className="w-full justify-center">
    <svg viewBox="0 0 260 260" className="iv-rose" role="group" aria-label="Goal rose: each petal is a goal's result as a share of its target" onPointerLeave={() => onLit(null)}>
      {[0.5, 1, CAP].map((k) => <circle key={k} cx={C} cy={C} r={(R / CAP) * k} className={k === 1 ? "iv-rose-target" : "iv-rose-ring"} />)}
      {goals.map((g, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const len = (Math.min(CAP, Math.max(0.08, g.ratio)) / CAP) * R;
        // drawn around the hub at 0,0 inside a translate, so the grow-in
        // scales from the hub with a plain 0 0 origin (no pixel origins)
        const tip = [Math.cos(a) * len, Math.sin(a) * len];
        const s1 = [Math.cos(a - half) * len * 0.72, Math.sin(a - half) * len * 0.72];
        const s2 = [Math.cos(a + half) * len * 0.72, Math.sin(a + half) * len * 0.72];
        const d = `M0 0 Q${s1[0].toFixed(1)} ${s1[1].toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} Q${s2[0].toFixed(1)} ${s2[1].toFixed(1)} 0 0 Z`;
        const lr = Math.max(len, r100) + 18;
        const lx = C + Math.cos(a) * lr, ly = C + Math.sin(a) * lr;
        const dim = lit && lit !== g.key;
        const color = g.met ? "var(--v4-ok)" : "var(--v4-warn)";
        const gid = `iv-pl-${id}-${i}`;
        return (
          <g key={g.key} className={`iv-petal ${g.met ? "is-met" : "is-open"}${dim ? " is-dim" : ""}${lit === g.key ? " is-lit" : ""}`}
            tabIndex={0} role="button" aria-label={`${g.short}: ${g.value}, ${Math.round(g.ratio * 100)}% of target, ${g.met ? "met" : "in progress"}. Show students`}
            onPointerEnter={() => onLit(g.key)} onFocus={() => onLit(g.key)} onBlur={() => onLit(null)} onClick={() => onOpen(g.key)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(g.key); } }}>
            <g transform={`translate(${C} ${C})`}>
              <defs>
                <radialGradient id={gid} cx="0" cy="0" r={len} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={color} className="iv-pl-s0" />
                  <stop offset="62%" stopColor={color} className="iv-pl-s1" />
                  <stop offset="100%" stopColor={color} className="iv-pl-s2" />
                </radialGradient>
              </defs>
              <g className={reduce ? "iv-petal-body" : "iv-petal-body iv-petal-in"} style={{ animationDelay: reduce ? undefined : `${i * 70}ms` }}>
                <path d={d} className="iv-petal-fill" fill={`url(#${gid})`} style={{ stroke: color }} />
              </g>
            </g>
            {g.ratio > CAP && <circle cx={C + tip[0]} cy={C + tip[1]} r="2.5" className="iv-petal-cap" />}
            {lit === g.key && <Orb cx={C + tip[0]} cy={C + tip[1]} r={3.5} color={color} />}
            <text x={lx} y={ly + 4} textAnchor="middle" className="iv-petal-label">{g.value}</text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r="3" className="iv-rose-hub" />
    </svg>
    </Tip>
  );
}

/** "7 over" / "15 under": the margin to target, glyph and status colour. */
export function MarginMarker({ text, good }: { text: string; good: boolean }) {
  return <span className={good ? "iv-margin is-good" : "iv-margin is-short"}><b aria-hidden>{good ? "▲" : "▼"}</b>{text}</span>;
}

/* ---------- Key Wins micro-visuals ---------- */

/** The undecided students this period as a flow of light: one stream
 *  splits, the students who chose a direction rising to an orb, the ones
 *  still exploring running on, each ribbon as wide as its count. */
export function WinFlow({ moved, still }: { moved: number; still: number }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const W = 170, H = 76, x0 = 4, x1 = W - 8, total = Math.max(1, moved + still);
  const band = 26, y0 = 38;
  const hm = Math.max(2, (moved / total) * band), hs = Math.max(2, (still / total) * band);
  // source band: chose on top, still below; chose rises to y 8, still settles to y 50
  const m0 = y0 - band / 2, m1 = m0 + hm, s0 = m1, s1 = s0 + hs;
  const mt = 16, st = 50;
  const c = (x0 + x1) / 2;
  const rib = (a0: number, a1: number, b0: number, b1: number) => `M${x0} ${a0} C${c} ${a0} ${c} ${b0} ${x1} ${b0} L${x1} ${b1} C${c} ${b1} ${c} ${a1} ${x0} ${a1} Z`;
  const mid = (a: number, b: number) => `M${x0} ${a} C${c} ${a} ${c} ${b} ${x1} ${b}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="iv-wv" aria-hidden="true">
      <defs>
        <linearGradient id={`iv-ws-${id}`} x1={x0} x2={x1} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" className="iv-wv-still-0" /><stop offset="100%" className="iv-wv-still-1" /></linearGradient>
        <linearGradient id={`iv-wf-${id}`} x1={x0} x2={x1} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor={GLOW.blue} className="iv-fr-0" /><stop offset="100%" stopColor={GLOW.sky} className="iv-fr-1" /></linearGradient>
      </defs>
      <g className={reduce ? undefined : "iv-rise"}>
        <path d={rib(s0, s1, st, st + hs)} fill={`url(#iv-ws-${id})`} />
        <path d={rib(m0, m1, mt, mt + hm)} fill={`url(#iv-wf-${id})`} />
        <GlowStroke d={mid((m0 + m1) / 2, mt + hm / 2)} color={GLOW.sky} width={1.5} from={0.2} />
      </g>
      <Orb cx={x1} cy={mt + hm / 2} r={3.5} color={GLOW.sky} />
      <text x={x1 - 10} y={mt - 7} textAnchor="end" className="iv-wv-text is-strong">chose a direction</text>
      <text x={x1} y={st + hs + 11} textAnchor="end" className="iv-wv-text">{still} still exploring</text>
    </svg>
  );
}

/** Before to after as one light trail stepping up, both ends labelled, an
 *  orb at "after". */
export function WinStep({ from, to }: { from: number; to: number }) {
  const reduce = useReducedMotion();
  const W = 150, H = 64;
  const lo = Math.max(0, Math.min(from, to) - 12), hi = Math.min(100, Math.max(from, to) + 6);
  const y = (v: number) => 10 + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - 22);
  const d = `M4 ${y(from)} H${W * 0.48} V${y(to)} H${W - 6}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="iv-wv" aria-hidden="true">
      <g className={reduce ? undefined : "iv-rise"}>
        <Aurora d={`${d} V${H - 2} H4 Z`} box={{ x: 0, y: 6, w: W, h: H - 8 }} strength={0.6} />
        <ImTube d={d} width={2} />
      </g>
      <circle cx="4" cy={y(from)} r="2.5" className="iv-wv-from" />
      <Orb cx={W - 6} cy={y(to)} r={3.5} color={GLOW.sky} />
      <text x="6" y={y(from) - 8} className="iv-wv-text">{from}%</text>
      <text x={W - 6} y={y(to) - 11} textAnchor="end" className="iv-wv-text is-strong">{to}%</text>
    </svg>
  );
}

/** Senior plans against the district benchmark: the same labelled line
 *  as On track, so the two "versus a mark" wins read alike. */
export function WinGauge({ value, bench }: { value: number; bench: number }) {
  return <WinLiftTrack ours={value} school={bench} oursLabel="Seniors" refLabel="District" />;
}

/** Review speed on a day line: a light trail from 0 to the average days,
 *  an orb where it stops, the standard flagged at its end. A line, not a
 *  clock ring. */
export function WinClock({ days, standard }: { days: number; standard: number }) {
  const reduce = useReducedMotion();
  const W = 150, H = 64, y = 34, x0 = 8, x1 = W - 10;
  const span = Math.max(standard, Math.ceil(days));
  const at = (d: number) => x0 + ((x1 - x0) * Math.max(0, Math.min(span, d))) / span;
  const xe = at(days);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="iv-wv" aria-hidden="true">
      <line x1={x0} x2={x1} y1={y} y2={y} className="iv-wv-trail" />
      <g className={reduce ? undefined : "iv-rise"}><ImTube d={`M${x0} ${y} L${xe.toFixed(1)} ${y - 0.02}`} width={2} color={GLOW.sky} /></g>
      <line x1={at(standard)} x2={at(standard)} y1={y - 9} y2={y + 9} className="iv-wv-tick" />
      <Orb cx={xe} cy={y} r={3.8} color={GLOW.sky} />
      <text x={xe} y={y - 12} textAnchor="middle" className="iv-wv-text is-strong">{days.toFixed(1)}d</text>
      <text x={at(standard)} y={y + 22} textAnchor="end" className="iv-wv-text">standard {standard}d</text>
      <text x={x0} y={y + 22} textAnchor="start" className="iv-wv-text">0</text>
    </svg>
  );
}

/** One 0 to 100% line that reads with no legend: a soft trail of light
 *  up to the school's rate, a brighter trail for our lift above it
 *  (labelled "+14"), an orb at "You", and a crisp tick at "School". */
export function WinLiftTrack({ ours, school, oursLabel = "You", refLabel = "School" }: { ours: number; school: number; oursLabel?: string; refLabel?: string }) {
  const reduce = useReducedMotion();
  const [wrap, width] = useWidth<HTMLSpanElement>();
  const H = 66, cy = 32;
  const x0 = 6, x1 = Math.max(x0 + 60, width - 8);
  const at = (v: number) => x0 + ((x1 - x0) * Math.max(0, Math.min(100, v))) / 100;
  const xo = at(ours), xs = at(school);
  const lift = ours - school;
  // Labels are placed by rough text widths (10.5px type, ~6.2px a glyph)
  // so none overlap on a narrow card: the lift sits under the gap when it
  // fits there, otherwise beside the "You" label; "100%" drops when crowded.
  const cw = 6.2;
  const oursText = `${oursLabel} ${ours}%`, oursW = oursText.length * cw, oursX = Math.min(xo + 6, x1 + 6);
  const liftText = lift !== 0 ? `${lift > 0 ? "+" : "−"}${Math.abs(lift)}` : "";
  const liftW = liftText.length * cw, mid = (xo + xs) / 2;
  const liftBelow = mid - liftW / 2 > xs - 2;
  const show100 = (liftBelow ? mid + liftW / 2 : xs) + 8 < x1 + 6 - 4 * cw;
  return (
    <span ref={wrap} className="iv-lift" aria-hidden>
      {width > 0 && (
        <svg width={width} height={H}>
          <line x1={x0} x2={x1} y1={cy} y2={cy} className="iv-wv-trail" />
          <g className={reduce ? undefined : "iv-rise"}>
            <GlowStroke d={`M${x0} ${cy} L${Math.min(xo, xs).toFixed(1)} ${cy - 0.02}`} color={GLOW.blue} width={1.5} from={0.1} quiet />
            {lift > 0 && <GlowStroke d={`M${xs.toFixed(1)} ${cy} L${xo.toFixed(1)} ${cy - 0.02}`} color={GLOW.sky} width={3} from={0.7} />}
          </g>
          <line x1={xs} x2={xs} y1={cy - 9} y2={cy + 9} className="iv-lift-tick" />
          <g className={reduce ? undefined : "iv-lead-in"}><Orb cx={xo} cy={cy} r={5} color={GLOW.sky} /></g>
          <text x={oursX} y={cy - 15} textAnchor="end" className="iv-wv-text is-strong">{oursText}</text>
          <text x={xs - 6} y={cy + 23} textAnchor="end" className="iv-wv-text">{refLabel} {school}%</text>
          {liftText && (liftBelow
            ? <text x={mid} y={cy + 23} textAnchor="middle" className="iv-wv-text is-strong">{liftText}</text>
            : <text x={oursX - oursW - 8} y={cy - 15} textAnchor="end" className="iv-wv-text is-strong">{liftText}</text>)}
          {show100 && <text x={x1 + 6} y={cy + 23} textAnchor="end" className="iv-wv-text is-faint">100%</text>}
        </svg>
      )}
    </span>
  );
}

/** A light trail that climbs to the share reached and ends in an orb, the
 *  target flagged on the way. */
export function WinPath({ pct, target }: { pct: number; target: number }) {
  const reduce = useReducedMotion();
  const W = 150, H = 64;
  const at = (t: number) => ({ x: 6 + t * (W - 16), y: H - 10 - t * (H - 26) - Math.sin(t * Math.PI) * 8 });
  const upto = Math.max(0.02, Math.min(1, pct / 100));
  const samples = (to: number) => Array.from({ length: 25 }, (_, i) => at((i / 24) * to));
  const line = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const end = at(upto);
  const flag = at(target / 100);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="iv-wv" aria-hidden="true">
      <path d={line(samples(1))} className="iv-wv-trail" />
      <g className={reduce ? undefined : "iv-rise"}><ImTube d={line(samples(upto))} width={2} /></g>
      {/* the target flag hangs below the path, the share reached sits above the orb */}
      <line x1={flag.x} y1={flag.y - 4} x2={flag.x} y2={flag.y + 14} className="iv-wv-tick" />
      <path d={`M${flag.x} ${flag.y + 14} l-9 -3 l9 -3 Z`} className="iv-wv-flag" />
      <text x={flag.x} y={flag.y + 27} textAnchor="middle" className="iv-wv-text">target {target}%</text>
      <Orb cx={end.x} cy={end.y} r={3.5} color={GLOW.sky} />
      <text x={Math.min(W - 2, end.x + 4)} y={end.y - 12} textAnchor="end" className="iv-wv-text is-strong">{pct}%</text>
    </svg>
  );
}
