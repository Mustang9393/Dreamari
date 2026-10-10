"use client";

// The School Leader and District Leader chart forms (10 Oct 2026 glow pass).
// WHY: Chandu, "i want all graphs to get these material updates and more
// creative visions, not just the ones in engagement", after "think more
// light, glow?" and "why is everything a ring to you?". The leader screens
// had three rings (the coverage orbit, the interest focus ring, the
// intentions ring) and a plain stacked share bar. Each became the form its
// data actually has:
//   - LightGauge: one share of 100 as a light trail on a hairline scale,
//     ending in a lit orb, under its figure. (A 100-dot field was tried the
//     same day and dropped as too dense: Chandu, "too much and too dense".)
//   - DotTrack: a value as a point of light on a hairline scale, with a
//     light trail from its launch baseline ("I dont like bar graphs").
//   - StripPlot: one point of light per school on one scale.
//   - PlanFlow: parts of one whole as a glowing Sankey. Every student
//     starts in one column and flows out to a plan, so ribbon width is the
//     share and the eye follows people to where they are heading (the
//     brief's "grade to plan" flow). It replaces both the intentions ring
//     (School) and the stacked share bar (District): same data, one form.
// Built on the shared kit (./glow.tsx); no blur filters, only stacked
// shapes and gradients, so it stays cheap on Chromebooks. Light mode keeps
// the glossy colour and drops the halos (ldViz.css).

import { useId, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Tip } from "@/components/app/IconTip";
import { GLOW, GlowStroke, Orb } from "./glow";
import "./ldViz.css";

const uid = (s: string) => s.replace(/:/g, "");

/** Measures its own width so charts draw at real pixels, never stretched. */
export function useLdWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(Math.floor(el.getBoundingClientRect().width));
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// ---------------------------------------------------------------------------
// LightGauge
// ---------------------------------------------------------------------------

/** One share of 100 as a light trail on a hairline scale, ending in a lit
 *  orb, under the figure. Few marks: the scale, the trail, the orb.
 *  `figure` is the rendered number. */
export function LightGauge({ value, figure, caption, className = "" }: { value: number; figure: React.ReactNode; caption: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const [wrap, w] = useLdWidth<HTMLSpanElement>();
  const p = Math.max(0, Math.min(100, value));
  const H = 48, cy = 18, x0 = 8, x1 = Math.max(x0 + 10, w - 8);
  const x = (n: number) => x0 + ((x1 - x0) * n) / 100;
  return (
    <span className={`ld-gauge ${className}`}>
      <span className="ld-gauge-figure">{figure}<em>{caption}</em></span>
      <span ref={wrap} className="ld-gauge-plot" aria-hidden>
        {w > 0 && (
          <svg width={w} height={H}>
            <line x1={x0} x2={x1} y1={cy} y2={cy} className="ld-gauge-axis" />
            {[0, 50, 100].map((t) => <text key={t} x={x(t)} y={H - 4} textAnchor={t === 0 ? "start" : t === 100 ? "end" : "middle"} className="ld-gauge-tick">{t === 100 ? "100%" : t}</text>)}
            {p > 0 && <g className={reduce ? undefined : "ld-gauge-trail"}><GlowStroke d={`M${x0} ${cy} L${x(p)} ${cy}`} color={GLOW.blue} width={3} from={0.4} /></g>}
            <g className={reduce ? undefined : "ld-gauge-orb"}><Orb cx={x(p)} cy={cy} r={6} color={GLOW.sky} pulse={!reduce} /></g>
          </svg>
        )}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PlanFlow
// ---------------------------------------------------------------------------

export type FlowPart = { label: string; value: number; color: string };

/** Shorter label when the column is narrow: the part before " / ", then an
 *  ellipsis. The full label stays in the aria-label. */
function fit(label: string, chars: number) {
  if (label.length <= chars) return label;
  const head = label.split(" / ")[0];
  if (head.length <= chars) return head;
  return `${label.slice(0, Math.max(3, chars - 1)).trimEnd()}…`;
}

/** Parts of one whole as a glowing Sankey: one source column (every
 *  student) flowing out to a node per part, ribbon width = share.
 *  `source` labels the column ("964 students"); `note` adds a quiet second
 *  line per part (a head-count). With `onOpen` the whole figure is one
 *  button that opens the detail. */
export function PlanFlow({ parts, source, label, note, onOpen }: { parts: FlowPart[]; source: string; label: string; note?: (value: number) => string; onOpen?: () => void }) {
  const id = uid(useId());
  const reduce = useReducedMotion();
  const [wrap, w] = useLdWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const shown = parts.filter((p) => p.value > 0);
  const total = shown.reduce((n, p) => n + p.value, 0) || 1;
  const narrow = w < 440;
  const labelW = narrow ? Math.max(118, Math.round(w * 0.44)) : Math.min(236, Math.round(w * 0.42));
  const rowH = note ? 34 : 22;
  const gap = 14;
  const top = 6;
  const bodyH = Math.max(narrow ? 200 : 250, shown.length * (rowH + 12));
  // The source column is shorter than the spread of plans, so the ribbons
  // fan out like light leaving one place, instead of running flat.
  const srcH = bodyH * 0.58;
  const srcTop = top + (bodyH - srcH) / 2;
  const H = top + bodyH + 6;
  const BW = 12;
  const x0 = 2, a = x0 + BW;
  const xn = Math.max(a + 60, w - labelW - 18 - BW);
  const b = xn;
  const mid = (a + b) / 2;
  const avail = bodyH - gap * (shown.length - 1);
  const lead = shown.reduce((m, p, i) => (p.label !== "Undecided" && p.value > shown[m].value ? i : m), 0);
  const nodes: (FlowPart & { sy0: number; sy1: number; ny0: number; ny1: number })[] = [];
  for (const p of shown) {
    const prev = nodes[nodes.length - 1];
    const sy0 = prev ? prev.sy1 : srcTop;
    const ny0 = prev ? prev.ny1 + gap : top;
    nodes.push({ ...p, sy0, sy1: sy0 + (p.value / total) * srcH, ny0, ny1: ny0 + Math.max(3, (p.value / total) * avail) });
  }
  // Labels sit at their node's centre, pushed apart so none overlap.
  const ys = nodes.map((n) => (n.ny0 + n.ny1) / 2);
  const placed = [...ys];
  for (let i = 1; i < placed.length; i++) placed[i] = Math.max(placed[i], placed[i - 1] + rowH);
  const maxY = top + bodyH - rowH / 2 + 4;
  if (placed.length && placed[placed.length - 1] > maxY) {
    placed[placed.length - 1] = maxY;
    for (let i = placed.length - 2; i >= 0; i--) placed[i] = Math.min(placed[i], placed[i + 1] - rowH);
  }
  const lx = xn + BW + 14;
  const chars = Math.floor((labelW - 46) / 6.3);
  const aria = `${label}: ${shown.map((p) => `${p.label} ${p.value}%`).join(", ")}${onOpen ? ". Open details" : ""}`;

  const art = (
    <div ref={wrap} className="ld-flow-plot" style={{ height: H }}>
      {w > 0 && (
        <svg width={w} height={H} aria-hidden="true" className={reduce ? undefined : "is-anim"} onMouseLeave={() => setHover(null)}>
          <defs>
            {nodes.map((n, i) => (
              <linearGradient key={i} id={`ld-rib-${id}-${i}`} x1={a} x2={b} y1="0" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={n.color} className="ld-flow-stop-a" />
                <stop offset="100%" stopColor={n.color} className="ld-flow-stop-b" />
              </linearGradient>
            ))}
          </defs>
          <text x={x0} y={srcTop - 12} className="ld-flow-source">{source}</text>
          {/* ribbons */}
          {nodes.map((n, i) => {
            const d = `M${a} ${n.sy0} C${mid} ${n.sy0} ${mid} ${n.ny0} ${b} ${n.ny0} L${b} ${n.ny1} C${mid} ${n.ny1} ${mid} ${n.sy1} ${a} ${n.sy1} Z`;
            const edge = `M${a} ${n.sy0} C${mid} ${n.sy0} ${mid} ${n.ny0} ${b} ${n.ny0}`;
            return (
              <g key={n.label} className={`ld-flow-ribbon ${hover !== null && hover !== i ? "is-dim" : ""} ${hover === i ? "is-on" : ""}`} style={reduce ? undefined : { animationDelay: `${150 + i * 110}ms` }} onMouseEnter={() => setHover(i)}>
                <path d={d} fill={`url(#ld-rib-${id}-${i})`} />
                <path d={edge} fill="none" stroke={n.color} className="ld-flow-edge" />
              </g>
            );
          })}
          {/* the source column, every student: a line of light */}
          <GlowStroke d={`M${x0 + BW / 2} ${srcTop + 1} L${x0 + BW / 2} ${srcTop + srcH - 1}`} color={GLOW.sky} width={3} from={1} />
          <path d={`M${x0 + BW / 2} ${srcTop + 1} L${x0 + BW / 2} ${srcTop + srcH - 1}`} stroke={GLOW.blue} className="ld-flow-solid" />
          {/* one node per part, then its label */}
          {nodes.map((n, i) => {
            const ly = placed[i];
            const cy = ys[i];
            return (
              <g key={n.label} className={hover !== null && hover !== i ? "ld-flow-part is-dim" : "ld-flow-part"} onMouseEnter={() => setHover(i)}>
                <GlowStroke d={`M${xn + BW / 2} ${n.ny0 + 1} L${xn + BW / 2} ${Math.max(n.ny0 + 1.5, n.ny1 - 1)}`} color={n.color} width={3} from={1} />
                <path d={`M${xn + BW / 2} ${n.ny0 + 1} L${xn + BW / 2} ${Math.max(n.ny0 + 1.5, n.ny1 - 1)}`} stroke={n.color} className="ld-flow-solid" />
                {i === lead && <Orb cx={xn + BW / 2} cy={(n.ny0 + n.ny1) / 2} r={4} color={GLOW.sky} />}
                {Math.abs(ly - cy) > 2 && <path d={`M${xn + BW + 2} ${cy} L${lx - 4} ${ly}`} className="ld-flow-lead" />}
                <text x={lx} y={note ? ly - 3 : ly + 4} className="ld-flow-label">{fit(n.label, chars)}</text>
                <text x={w - 2} y={note ? ly - 3 : ly + 4} textAnchor="end" className="ld-flow-value">{n.value}%</text>
                {note && <text x={lx} y={ly + 12} className="ld-flow-note">{note(n.value)}</text>}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
  return onOpen
    ? <button type="button" className="ld-flow is-button" onClick={onOpen} aria-label={aria}>{art}</button>
    : <figure className="ld-flow" role="img" aria-label={aria}>{art}</figure>;
}

// ---------------------------------------------------------------------------
// DotTrack
// ---------------------------------------------------------------------------

/** A value on a hairline scale as a point of light (10 Oct 2026: "I dont
 *  like bar graphs"; "i want them to be made of LIGHT"). With `baseline`, a
 *  lit outline marks launch and a thin light trail runs from it to today,
 *  so the row reads cold as "from here to here". `district` adds a faint
 *  dashed line of light. A handful of marks and nothing repeated (no
 *  ticks: "that whole grid idea is bad"); the scale is labelled under the
 *  column. Flat and emissive: no bars, no rims, no shadows. */
export function DotTrack({ value, baseline, district, scale = 100, color = GLOW.blue, thin = false }: { value: number; baseline?: number; district?: number; scale?: number; color?: string; thin?: boolean }) {
  const reduce = useReducedMotion();
  const pct = (n: number) => Math.max(0, Math.min(100, (n / Math.max(1e-9, scale)) * 100));
  const v = pct(value);
  const b = baseline !== undefined ? pct(baseline) : null;
  const lo = b === null ? null : Math.min(b, v);
  const hi = b === null ? null : Math.max(b, v);
  return (
    <span className={`ld-dots ${thin ? "is-thin" : ""} ${reduce ? "" : "is-anim"}`} style={{ "--lc": color } as React.CSSProperties} aria-hidden>
      <span className="ld-dots-axis" />
      {district !== undefined && <em className="ld-dots-district" style={{ left: `${pct(district)}%` }} />}
      {lo !== null && hi !== null && hi > lo && <span className="ld-dots-trail" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />}
      {b !== null && <span className="ld-dots-base" style={{ left: `${b}%` }} />}
      <b className="ld-dots-now" style={{ left: `${v}%` }} />
    </span>
  );
}

/** A light strip plot: one point of light per group (one per school) on
 *  a shared scale. Points that would touch step down into a second or third
 *  row, so every point stays clickable; each opens its own drill and shows
 *  its label on hover or focus (Tip). */
export type StripPoint = { id: string; value: number; color: string; label: string; aria: string; onClick: () => void };
export function StripPlot({ points, min = 0, max = 100, unit = "%", label }: { points: StripPoint[]; min?: number; max?: number; unit?: string; label: string }) {
  const reduce = useReducedMotion();
  const [wrap, w] = useLdWidth<HTMLDivElement>();
  const D = 24, GAP = 14, STEP = 14;
  const sorted = [...points].sort((a, b) => a.value - b.value);
  const xOf = (v: number) => 12 + ((Math.max(min, Math.min(max, v)) - min) / Math.max(1e-9, max - min)) * Math.max(1, w - 24);
  const ends: number[] = [];
  const placed = sorted.map((p) => {
    const x = xOf(p.value);
    let row = ends.findIndex((e) => x - e >= GAP);
    if (row === -1) { row = ends.length; ends.push(x); } else ends[row] = x;
    return { ...p, x, row };
  });
  const rows = Math.max(1, ends.length);
  const H = D + (rows - 1) * STEP + 8;
  return (
    <div ref={wrap} className={`ld-strip ${reduce ? "" : "is-anim"}`} role="group" aria-label={label}>
      <div className="ld-strip-plot" style={{ height: H }}>
        <span className="ld-strip-axis" style={{ top: D / 2 + 4 }} aria-hidden />
        {w > 0 && placed.map((p, i) => (
          <span key={p.id} className="ld-strip-at" style={{ left: p.x, top: p.row * STEP + 4, "--lc": p.color, animationDelay: reduce ? undefined : `${100 + i * 50}ms` } as React.CSSProperties}>
            <Tip label={p.label}><button type="button" className="ld-strip-point" onClick={p.onClick} aria-label={p.aria} /></Tip>
          </span>
        ))}
      </div>
      <div className="ld-strip-scale" aria-hidden><span>{min}{unit}</span><span>{Math.round((min + max) / 2)}{unit}</span><span>{max}{unit}</span></div>
    </div>
  );
}
