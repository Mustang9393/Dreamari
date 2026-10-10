"use client";

// WHY (10 Oct 2026, Chandu): "try better types of graphs, more beautiful
// ones ... be creative with the graphs, don't be traditional, as long as
// they convey the information sensibly we can use them." My Impact's own
// chart forms, v4 only. Same sections, same order, same data and drills:
//   - DotConstellation: the cover's on-track rate as one dot per student,
//     set as rays of four and lit clockwise, so 85% reads as a sweep of real people.
//     The page's one glow sits behind it.
//   - SlopeGraph (follow-up, same day: "ASCA Alignment and District goals
//     need better graphs. Think beyond bars and donuts please."): each ASCA
//     measure is a line from last semester to now, labelled at its end.
//   - GoalRose: one petal per district goal, its length the result as a
//     share of target, a ring at 100%; met petals green, short ones amber.
//   - Win visuals ("The Key Wins can also be better"): each win's own
//     micro-chart (a dot cluster, a step up, a benchmark gauge, a turnaround
//     clock, a lift waffle, a pathway arrow).
//   - TimeWaffle: the week as 100 cells (1% each), one column per 2%, the
//     ASCA 80% line drawn across it.
// Blue family plus status colours only; text never wears the data colour.
// Motion is opacity and transform, off under reduced motion.

import { useId, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Tip } from "@/components/app/IconTip";
import "./impactViz.css";

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

export type WaffleGroup = { c: string; pct: number; color: string };

/** 100 cells, 1% each, filled column by column (2% a column) in category
 *  order, the ASCA target drawn as a line after the 80th cell. Hovering a
 *  legend row (or a cell) lights that category's cells. */
export function TimeWaffle({ groups, target, active, onActive, onPick, label }: { groups: WaffleGroup[]; target: number; active?: string | null; onActive?: (c: string | null) => void; /** a cell opens its category's entries */ onPick?: (c: string) => void; label: string }) {
  const reduce = useReducedMotion();
  // Largest remainder, so the cells always add up to exactly 100.
  const raw = groups.map((g) => Math.max(0, g.pct));
  const sum = raw.reduce((a, n) => a + n, 0) || 1;
  const exact = raw.map((n) => (n / sum) * 100);
  const cells = exact.map(Math.floor);
  let rest = 100 - cells.reduce((a, n) => a + n, 0);
  exact.map((n, i) => ({ i, r: n - Math.floor(n) })).sort((a, b) => b.r - a.r).forEach(({ i }) => { if (rest > 0) { cells[i]++; rest--; } });
  const owner: number[] = cells.flatMap((n, gi) => Array(n).fill(gi));
  const ROWS = 2, COLS = 50, S = 14, G = 3;
  const W = COLS * S - G, H = ROWS * S - G;
  const tx = (target / 100) * COLS * S - G / 2;
  return (
    <div className="iv-waffle-wrap">
      <span className="iv-waffle-target-label" style={{ left: `${(tx / W) * 100}%` }}>ASCA target {target}%</span>
      <svg viewBox={`0 0 ${W} ${H}`} className="iv-waffle" role="img" aria-label={label} onPointerLeave={() => onActive?.(null)}>
        {owner.map((gi, i) => {
          const c = Math.floor(i / ROWS), r = i % ROWS;
          const g = groups[gi];
          const dim = active && active !== g.c;
          return (
            <rect key={i} x={c * S} y={r * S} width={S - G} height={S - G} rx="3" fill={g.color}
              className={reduce ? "iv-cell" : "iv-cell iv-cell-in"} style={{ opacity: dim ? 0.22 : 1, animationDelay: reduce ? undefined : `${c * 12}ms` }}
              onPointerEnter={() => onActive?.(g.c)} onClick={onPick ? () => onPick(g.c) : undefined} cursor={onPick ? "pointer" : undefined} />
          );
        })}
        <line x1={tx} x2={tx} y1={-5} y2={H + 5} className="iv-waffle-target" />
      </svg>
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
            const a = y(it.pct - it.delta), b = y(it.pct);
            const dim = lit && lit !== it.key;
            return (
              <g key={it.key} className={dim ? "iv-slope-line is-dim" : "iv-slope-line"} onPointerEnter={() => setLit(it.key)} onClick={it.onOpen}>
                <line x1={x0} y1={a} x2={x1} y2={b} className={reduce ? "iv-slope-stroke" : "iv-slope-stroke iv-draw"} pathLength={100} style={{ animationDelay: reduce ? undefined : `${i * 120}ms` }} />
                <line x1={x0} y1={a} x2={x1} y2={b} stroke="transparent" strokeWidth="18" />
                <circle cx={x0} cy={a} r="4" className="iv-slope-from" />
                <circle cx={x1} cy={b} r="5" className="iv-slope-to" />
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
 *  better before it gets here), capped at 130%; a ring marks 100%. */
export function GoalRose({ goals, lit, onLit, onOpen }: { goals: RoseGoal[]; lit: string | null; onLit: (k: string | null) => void; onOpen: (k: string) => void }) {
  const reduce = useReducedMotion();
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
        const tip = [C + Math.cos(a) * len, C + Math.sin(a) * len];
        const s1 = [C + Math.cos(a - half) * len * 0.72, C + Math.sin(a - half) * len * 0.72];
        const s2 = [C + Math.cos(a + half) * len * 0.72, C + Math.sin(a + half) * len * 0.72];
        const d = `M${C} ${C} Q${s1[0].toFixed(1)} ${s1[1].toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} Q${s2[0].toFixed(1)} ${s2[1].toFixed(1)} ${C} ${C} Z`;
        const lr = Math.max(len, r100) + 18;
        const lx = C + Math.cos(a) * lr, ly = C + Math.sin(a) * lr;
        const dim = lit && lit !== g.key;
        return (
          <g key={g.key} className={`iv-petal ${g.met ? "is-met" : "is-open"}${dim ? " is-dim" : ""}${lit === g.key ? " is-lit" : ""}`}
            tabIndex={0} role="button" aria-label={`${g.short}: ${g.value}, ${Math.round(g.ratio * 100)}% of target, ${g.met ? "met" : "in progress"}. Show students`}
            onPointerEnter={() => onLit(g.key)} onFocus={() => onLit(g.key)} onBlur={() => onLit(null)} onClick={() => onOpen(g.key)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(g.key); } }}>
            <path d={d} className={reduce ? undefined : "iv-petal-in"} style={{ transformOrigin: `${C}px ${C}px`, animationDelay: reduce ? undefined : `${i * 70}ms` }} />
            {g.ratio > CAP && <circle cx={tip[0]} cy={tip[1]} r="2.5" className="iv-petal-cap" />}
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

/** A cluster of dots lighting up one by one: students who chose a direction. */
export function WinDots({ n }: { n: number }) {
  const reduce = useReducedMotion();
  const count = Math.max(1, Math.min(60, n));
  const cols = Math.ceil(Math.sqrt(count * 2.2));
  const S = 11;
  const rows = Math.ceil(count / cols);
  return (
    <svg viewBox={`0 0 ${cols * S + S / 2} ${rows * S}`} className="iv-wv iv-wv-dots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        return <circle key={i} cx={c * S + S / 2 + (r % 2 ? S / 2 : 0)} cy={r * S + S / 2} r={S * 0.3} className={reduce ? "iv-wv-dot" : "iv-wv-dot iv-pop"} style={{ animationDelay: reduce ? undefined : `${i * 28}ms` }} />;
      })}
    </svg>
  );
}

/** Before to after as one step up, both ends labelled. */
export function WinStep({ from, to }: { from: number; to: number }) {
  const reduce = useReducedMotion();
  const W = 150, H = 64;
  const lo = Math.max(0, Math.min(from, to) - 12), hi = Math.min(100, Math.max(from, to) + 6);
  const y = (v: number) => 8 + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - 20);
  const d = `M4 ${y(from)} H${W * 0.48} V${y(to)} H${W - 4}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="iv-wv" aria-hidden="true">
      <path d={`${d} V${H - 4} H4 Z`} className="iv-wv-wash" />
      <path d={d} className={reduce ? "iv-wv-line" : "iv-wv-line iv-draw"} pathLength={100} />
      <circle cx="4" cy={y(from)} r="3.5" className="iv-wv-hollow" />
      <circle cx={W - 4} cy={y(to)} r="4.5" className="iv-wv-solid" />
      <text x="6" y={y(from) - 7} className="iv-wv-text">{from}%</text>
      <text x={W - 6} y={y(to) - 8} textAnchor="end" className="iv-wv-text is-strong">{to}%</text>
    </svg>
  );
}

/** A half gauge with the benchmark tick. */
export function WinGauge({ value, bench }: { value: number; bench: number }) {
  const reduce = useReducedMotion();
  const C = 60, R = 46;
  const pt = (v: number, r = R) => { const a = Math.PI + (Math.max(0, Math.min(100, v)) / 100) * Math.PI; return [C + Math.cos(a) * r, 56 + Math.sin(a) * r]; };
  const arc = (v: number) => { const [x, y] = pt(v); return `M${C - R} 56 A${R} ${R} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`; };
  const [t1x, t1y] = pt(bench, R - 9), [t2x, t2y] = pt(bench, R + 9), [lx, ly] = pt(bench, R + 17);
  return (
    <svg viewBox="0 0 120 64" className="iv-wv iv-wv-gauge" aria-hidden="true">
      <path d={arc(100)} className="iv-wv-track" />
      <path d={arc(value)} className={reduce ? "iv-wv-arc" : "iv-wv-arc iv-draw"} pathLength={100} />
      <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} className="iv-wv-tick" />
      <text x={lx} y={ly + 3} textAnchor="middle" className="iv-wv-text">{bench}</text>
    </svg>
  );
}

/** A clock face where the full turn is the standard; the arc is the time taken. */
export function WinClock({ days, standard }: { days: number; standard: number }) {
  const reduce = useReducedMotion();
  const C = 32, R = 24;
  const share = Math.max(0, Math.min(1, days / standard));
  return (
    <svg viewBox="0 0 64 64" className="iv-wv iv-wv-clock" aria-hidden="true">
      <circle cx={C} cy={C} r={R} className="iv-wv-track" />
      <circle cx={C} cy={C} r={R} className={reduce ? "iv-wv-arc" : "iv-wv-arc iv-draw"} pathLength={100} strokeDasharray={`${share * 100} 100`} transform={`rotate(-90 ${C} ${C})`} />
      {Array.from({ length: standard }, (_, i) => {
        const a = (i / standard) * Math.PI * 2 - Math.PI / 2;
        return <line key={i} x1={C + Math.cos(a) * (R - 8)} y1={C + Math.sin(a) * (R - 8)} x2={C + Math.cos(a) * (R - 5)} y2={C + Math.sin(a) * (R - 5)} className="iv-wv-tick is-soft" />;
      })}
      <line x1={C} y1={C} x2={C + Math.cos(share * Math.PI * 2 - Math.PI / 2) * (R - 10)} y2={C + Math.sin(share * Math.PI * 2 - Math.PI / 2) * (R - 10)} className="iv-wv-hand" />
      <circle cx={C} cy={C} r="2.5" className="iv-wv-solid" />
    </svg>
  );
}

/** 100 cells: up to the school's rate in a quieter blue, our lift above it bright. */
export function WinLift({ ours, school }: { ours: number; school: number }) {
  const reduce = useReducedMotion();
  const S = 7;
  return (
    <svg viewBox={`0 0 ${20 * S} ${5 * S}`} className="iv-wv iv-wv-lift" aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => {
        const c = Math.floor(i / 5), r = 4 - (i % 5);
        const k = i < Math.min(ours, school) ? "is-base" : i < ours ? "is-lift" : "";
        return <rect key={i} x={c * S} y={r * S} width={S - 2} height={S - 2} rx="1.5" className={`iv-wv-cell ${k}${!reduce && k ? " iv-pop" : ""}`} style={!reduce && k ? { animationDelay: `${c * 22}ms` } : undefined} />;
      })}
    </svg>
  );
}

/** A path that climbs to the share reached, the target flagged on the way. */
export function WinPath({ pct, target }: { pct: number; target: number }) {
  const reduce = useReducedMotion();
  const W = 150, H = 64;
  const at = (t: number) => ({ x: 6 + t * (W - 16), y: H - 10 - t * (H - 26) - Math.sin(t * Math.PI) * 8 });
  const upto = Math.max(0.02, Math.min(1, pct / 100));
  const samples = (to: number) => Array.from({ length: 25 }, (_, i) => at((i / 24) * to));
  const line = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const end = at(upto), prev = at(Math.max(0, upto - 0.04));
  const ang = Math.atan2(end.y - prev.y, end.x - prev.x);
  const head = [[end.x + Math.cos(ang) * 6, end.y + Math.sin(ang) * 6], [end.x + Math.cos(ang + 2.4) * 6, end.y + Math.sin(ang + 2.4) * 6], [end.x + Math.cos(ang - 2.4) * 6, end.y + Math.sin(ang - 2.4) * 6]];
  const flag = at(target / 100);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="iv-wv" aria-hidden="true">
      <path d={line(samples(1))} className="iv-wv-trail" />
      <path d={line(samples(upto))} className={reduce ? "iv-wv-line" : "iv-wv-line iv-draw"} pathLength={100} />
      <polygon points={head.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")} className="iv-wv-solid" />
      {/* the target flag hangs below the path, the share reached sits above the arrow */}
      <line x1={flag.x} y1={flag.y - 4} x2={flag.x} y2={flag.y + 14} className="iv-wv-tick" />
      <path d={`M${flag.x} ${flag.y + 14} l-9 -3 l9 -3 Z`} className="iv-wv-flag" />
      <text x={flag.x} y={flag.y + 27} textAnchor="middle" className="iv-wv-text">target {target}%</text>
      <text x={Math.min(W - 2, end.x + 4)} y={end.y - 12} textAnchor="end" className="iv-wv-text is-strong">{pct}%</text>
    </svg>
  );
}
