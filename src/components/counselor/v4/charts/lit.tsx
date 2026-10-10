"use client";

// WHY (10 Oct 2026, Chandu): "i want all graphs to get these material
// updates and more creative visions, not just the ones in engagement". The
// small visuals outside Insights (Messages, Meetings, Review, the student
// profile, drill rows and the Lead Counselor's Home) wear the same light as
// the shared kit in glow.tsx. Three of his corrections the same day shape
// every form here:
//   - "why is everything a ring to you?" and "I dont like bar graphs": no
//     rings and no bars. Meters are rows of points of light, shares are
//     fields of lit cells, a drop-off is a flow.
//   - "I dont want 3d solid look ... i want them to be made of LIGHT": every
//     mark is emissive. A bright core fades to the series colour, then to a
//     soft halo. Flat and translucent, like neon. No gloss, no rims, no
//     bevels, no shadows, no solid gradient bodies.
//   - "all the grids and hexagons are too much and too dense": few marks.
//     No cell fields, no rows of dots; dense rows get one point of light.
// The forms:
//   - LightStrip: a hairline scale, a short light trail and one Orb at the
//     value (a strip plot with one point), for meters inside rows.
//   - LightPool: a pool of light behind a number (a read rate, a session's
//     progress) whose area grows with the share. Same footprint as the old
//     ring, so a row still leads with a face-sized mark.
//   - ReachFunnel: Sent, Read and Replied as one ribbon of light that
//     narrows as students drop off.
//   - SplitFlow: a small Sankey. One source of light splits into a ribbon
//     per group, each ending at that group's own row.
// No blur filters: light is radial gradients and stacked translucent
// shapes. Only opacity and transform animate. Light mode keeps the same
// light, softer: the core is the colour itself, never a white smudge.

import { useEffect, useId, useRef, useState } from "react";
import { GLOW, GlowStroke, Orb } from "./glow";
import "./lit.css";

function useUid() {
  return useId().replace(/:/g, "");
}

/** Width of an element, kept current on resize. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/** One emissive point: core, colour, fade. Shared by the SVG forms. */
function LightStops({ color, soft }: { color: string; soft?: boolean }) {
  return (
    <>
      <stop offset="0%" style={{ stopColor: soft ? color : `color-mix(in srgb, ${color} var(--lit-core-mix, 100%), white)` }} />
      <stop offset="22%" stopColor={color} stopOpacity=".95" />
      <stop offset="50%" stopColor={color} stopOpacity=".38" />
      <stop offset="100%" stopColor={color} stopOpacity="0" />
    </>
  );
}

/** A strip plot with one point: a hairline scale, a light trail that
 *  fades in toward the value, and one point of light on it. `target` sets a
 *  small mark on the scale. Low density on purpose (10 Oct 2026: "I dont
 *  like bar graphs", then "too much and too dense"). */
export function LightStrip({ pct, color = GLOW.blue, target, className = "", label }: { pct: number; color?: string; target?: number; className?: string; label?: string }) {
  const v = clamp(pct);
  return (
    <span className={`lit-strip ${className}`} style={{ ["--lit-c" as string]: color }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <i className="lit-strip-scale" />
      {v > 0 && <i className="lit-strip-trail" style={{ width: `${v}%` }} />}
      {typeof target === "number" && <i className="lit-strip-target" style={{ left: `${clamp(target)}%` }} />}
      <i className="lit-strip-point" style={{ left: `${v}%` }} data-zero={v === 0 ? "" : undefined} />
    </span>
  );
}

/** A pool of light behind a number. Its area is the share, so a 25% pool
 *  covers a quarter of a full one. Children sit centred on top. */
export function LightPool({ pct, size = 34, className = "", children }: { pct: number; size?: number; className?: string; children?: React.ReactNode }) {
  const id = useUid();
  const v = clamp(pct);
  const r = 48 * Math.sqrt(v / 100);
  return (
    <span className={`lit-pool ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          {/* a soft core: the number sits on it and must stay readable */}
          <radialGradient id={`lp-${id}`}><LightStops color={GLOW.sky} soft /></radialGradient>
          <radialGradient id={`lp-h-${id}`}>
            <stop offset="0%" stopColor={GLOW.blue} stopOpacity=".5" />
            <stop offset="100%" stopColor={GLOW.blue} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* the full share, as the faintest wash, so the pool has a scale */}
        <circle cx="50" cy="50" r="48" className="lit-pool-room" />
        {v > 0 && (
          <g className="lit-pool-on">
            <circle cx="50" cy="50" r={Math.min(70, r * 1.6)} fill={`url(#lp-h-${id})`} className="lit-pool-halo" />
            <circle cx="50" cy="50" r={Math.max(6, r)} fill={`url(#lp-${id})`} className="lit-pool-light" />
          </g>
        )}
      </svg>
      {children}
    </span>
  );
}

/** Stages of one audience (Sent, Read, Replied) as a ribbon of light whose
 *  thickness is each stage's share. Smooth joins with flat tangents, so the
 *  ribbon never bulges past a stage's real value. Each stage's label and
 *  count sit under its point. */
export function ReachFunnel({ stages, label }: { stages: { k: string; v: number; pct: number }[]; label: string }) {
  const id = useUid();
  const [ref, w] = useWidth<HTMLDivElement>();
  const H = 58;
  const mid = H / 2;
  const half = (p: number) => Math.max(0.75, (clamp(p) / 100) * (H / 2 - 7));
  const n = stages.length;
  const xs = stages.map((_, i) => (w * (2 * i + 1)) / (2 * n));
  const pts = (sign: 1 | -1) => stages.map((s, i) => [xs[i], mid - sign * half(s.pct)] as const);
  const curve = (p: readonly (readonly [number, number])[]) => {
    let d = "";
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1];
      const [x1, y1] = p[i];
      const c = (x1 - x0) / 2;
      d += `C${x0 + c} ${y0} ${x1 - c} ${y1} ${x1} ${y1}`;
    }
    return d;
  };
  const top = pts(1);
  const bottom = pts(-1);
  const edge = (p: typeof top) => `M0 ${p[0][1]}H${p[0][0]}${curve(p)}H${w}`;
  const rev = [...bottom].reverse();
  const ribbon = `${edge(top)}L${w} ${rev[0][1]}H${rev[0][0]}${curve(rev)}H0Z`;
  const last = stages[n - 1];
  return (
    <div className="lit-funnel" role="group" aria-label={label}>
      <div ref={ref} className="lit-funnel-plot">
        {w > 0 && (
          <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
            <defs>
              <linearGradient id={`lf-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GLOW.sky} stopOpacity=".2" />
                <stop offset="12%" stopColor={GLOW.sky} />
                <stop offset="100%" stopColor={GLOW.indigo} />
              </linearGradient>
            </defs>
            <path d={ribbon} fill={`url(#lf-${id})`} className="lit-funnel-light" />
            <GlowStroke d={edge(top)} color={GLOW.sky} width={1.2} from={0.85} />
            <GlowStroke d={edge(bottom)} color={GLOW.blue} width={1.2} from={0.85} quiet />
            {xs.map((x, i) => <line key={i} x1={x} x2={x} y1={3} y2={H - 3} className="lit-funnel-stop" />)}
            {last.v > 0 && <Orb cx={xs[n - 1]} cy={mid} r={3.5} color={GLOW.sky} />}
          </svg>
        )}
      </div>
      <ol className="lit-funnel-keys" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {stages.map((s) => <li key={s.k}><span>{s.k}</span><strong>{s.v}</strong></li>)}
      </ol>
    </div>
  );
}

/** A small Sankey: one source of light on the left splits into a ribbon
 *  per segment, each ending at the vertical middle of its own row in
 *  `children` (the clickable legend rows). Ribbon thickness is the
 *  segment's share at both ends, on one scale. */
export function SplitFlow({ segments, label, width = 96, children }: { segments: { value: number; color: string }[]; label: string; width?: number; children: React.ReactNode }) {
  const id = useUid();
  const rowsRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<{ y: number; h: number }[]>([]);
  const [boxH, setBoxH] = useState(0);
  useEffect(() => {
    const el = rowsRef.current;
    if (!el) return;
    const measure = () => {
      setBoxH(el.offsetHeight);
      const top = el.getBoundingClientRect().top;
      setRows([...el.children].map((c) => { const b = c.getBoundingClientRect(); return { y: b.top - top + b.height / 2, h: b.height }; }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [segments.length]);
  const total = segments.reduce((a, s) => a + Math.max(0, s.value), 0);
  const share = segments.map((s) => (total ? Math.max(0, s.value) / total : 0));
  const ready = rows.length === segments.length && boxH > 0;
  // one scale: the source fits the box, and no ribbon is thicker than its row
  const rowH = ready ? Math.min(...rows.map((r) => r.h)) : 0;
  const scale = ready ? Math.min(boxH * 0.8, (rowH - 8) / Math.max(0.01, ...share)) : 0;
  const srcX = 6;
  const endX = width - 8;
  let cursor = boxH / 2 - scale / 2;
  const ribbons = ready ? segments.map((s, i) => {
    const t = share[i] * scale;
    const y0 = cursor + t / 2;
    cursor += t;
    const y1 = rows[i].y;
    const c = (endX - srcX) * 0.55;
    const half = Math.max(0.5, t / 2);
    const top = `M${srcX} ${y0 - half}C${srcX + c} ${y0 - half} ${endX - c} ${y1 - half} ${endX} ${y1 - half}`;
    const body = `${top}L${endX} ${y1 + half}C${endX - c} ${y1 + half} ${srcX + c} ${y0 + half} ${srcX} ${y0 + half}Z`;
    const mid = `M${srcX} ${y0}C${srcX + c} ${y0} ${endX - c} ${y1} ${endX} ${y1}`;
    return { key: i, color: s.color, body, mid, y1, on: s.value > 0 };
  }) : [];
  return (
    <div className="lit-split" role="group" aria-label={label}>
      <svg className="lit-split-plot" width={width} height={boxH || 1} viewBox={`0 0 ${width} ${boxH || 1}`} aria-hidden="true">
        <defs>
          {ribbons.map((r) => (
            <linearGradient key={r.key} id={`sf-${id}-${r.key}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={GLOW.blue} />
              <stop offset="80%" stopColor={r.color} />
              <stop offset="100%" stopColor={r.color} stopOpacity=".2" />
            </linearGradient>
          ))}
        </defs>
        {/* the source: a short upright line of light (stacked strokes; a
           gradient stroke would vanish on a zero-width path) */}
        {ready && scale > 0 && [6, 3, 1.6].map((sw, k) => <line key={k} x1={srcX} x2={srcX} y1={boxH / 2 - scale / 2 + 1} y2={boxH / 2 + scale / 2 - 1} strokeWidth={sw} strokeLinecap="round" className={`lit-split-src is-${k}`} />)}
        {ribbons.filter((r) => r.on).map((r) => (
          <g key={r.key} className="lit-split-ribbon">
            <path d={r.body} fill={`url(#sf-${id}-${r.key})`} className="lit-split-light" />
            <GlowStroke d={r.mid} color={r.color} width={1.1} from={0.3} quiet />
            <Orb cx={endX} cy={r.y1} r={3} color={r.color} />
          </g>
        ))}
      </svg>
      <div ref={rowsRef} className="lit-split-rows">{children}</div>
    </div>
  );
}
