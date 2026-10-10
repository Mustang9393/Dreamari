"use client";

// Chart marks for Insights > College & Career and Insights > Readiness
// (10 Oct 2026). WHY: Chandu asked to "work on different styles for the
// graphs etc and everything inside milestones and insights. Don't change
// structure of the page or organisation of the pages, but please try better
// types of graphs, more beautiful ones ... take it to the next level ... be
// creative with the graphs, don't be traditional, as long as they convey the
// information sensibly we can use them."
//
// The counselor's question is always "which students", so every mark opens
// exactly the students it counts.
//
// Glow pass (10 Oct 2026). Chandu: "think more light, glow?" with neon
// tube, aurora and glowing Sankey references, then "GIVE ALL GRAPHS THIS
// SORT OF VISUAL UPGRADE IF POSSIBLE. AND TRY DIFFERENT KINDS OF GRAPHS".
// Every mark here now wears the shared light kit (glow.tsx) or the same
// principles in CSS: stacked shapes and radial gradients, never a blur.
//   - Readiness tiles: the tick dials are gone (Chandu: "why is everything
//     a ring to you?", "I dont like bar graphs", "all the grids and
//     hexagons are too much", "i dont want so many things to read for
//     readiness"); a tile is its name, share, count and path to students.
//   - Poster meters and the schools' face strips became plain numbers;
//     Gaps' bar view is gone.
//   - DotDonut: exactly as it was (loved: "The gaps donuts were better
//     before"), the one chart here still made of one mark per student.
//   - Treemap: majors as tiles sized by their count, each a soft fill of
//     light (no outlines, which made it read as a grid of boxes).
//   - GradeTrail: Readiness by Grade, one measure at a time: a trail of
//     light across the grades with an Orb per grade (see its note for why).
//   - The postsecondary flow (grade to plan) lives in ivFlow.tsx.
// Colour: the GLOW blues, the --v4-step ramp and status amber only. Light
// mode keeps the gloss and drops the bloom, so nothing goes muddy on a
// pale surface. Every animation is opacity or transform, and still under
// reduced motion.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { IconTip } from "@/components/app/IconTip";
import { GLOW, GlowStroke, Orb } from "./glow";
import "./insightViz.css";

/** Width of an element, measured (0 before the first layout). */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(Math.round(el.getBoundingClientRect().width));
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** False on the first paint, true right after, so marks can draw in once. */
export function useArrived() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    let inner = 0;
    const id = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setOn(true)); });
    return () => { cancelAnimationFrame(id); cancelAnimationFrame(inner); };
  }, []);
  return { on: on || !!reduce, reduce: !!reduce };
}

/* ------------------------------------------------------------------ */
/* DotDonut                                                            */
/* ------------------------------------------------------------------ */

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** One dot per eligible student scattered evenly in a ring (a sunflower
 *  pattern), the lit ones a clockwise sector from twelve o'clock: exactly
 *  `lit` dots, so the sector's size is the share. */
export function DotDonut({ total, lit, size = 132, children }: { total: number; lit: number; size?: number; children?: ReactNode }) {
  const { on, reduce } = useArrived();
  const dots = useMemo(() => {
    const c = size / 2;
    const r1 = size / 2 - 4;
    const r0 = r1 * 0.58;
    const pts = Array.from({ length: total }, (_, i) => {
      const r = Math.sqrt(r0 * r0 + ((r1 * r1 - r0 * r0) * (i + 0.5)) / Math.max(1, total));
      const a = i * GOLDEN;
      const x = c + r * Math.cos(a);
      const y = c + r * Math.sin(a);
      // clockwise angle from twelve o'clock, 0..2pi
      const t = (Math.atan2(y - c, x - c) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
      return { x, y, t };
    }).sort((a, b) => a.t - b.t);
    const area = Math.PI * (r1 * r1 - r0 * r0);
    const dr = Math.min(4.2, Math.max(1.6, 0.4 * Math.sqrt(area / Math.max(1, total))));
    return { pts, dr };
  }, [total, size]);
  return (
    <span className="v4-iv-dotdonut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {dots.pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={dots.dr} className={on && i < lit ? "is-lit" : ""} style={reduce ? undefined : { transitionDelay: `${Math.min(i, 120) * 6}ms` }} />
        ))}
      </svg>
      <span className="v4-iv-dotdonut-center">{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Treemap                                                             */
/* ------------------------------------------------------------------ */

type Box = { x: number; y: number; w: number; h: number };

/** Squarified treemap (Bruls, Huizing, van Wijk): areas in proportion to
 *  `values`, rows chosen to keep tiles close to square so names fit. */
export function squarify(values: number[], W: number, H: number): Box[] {
  const total = values.reduce((a, b) => a + b, 0);
  if (!total || !W || !H) return values.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  const areas = values.map((v) => (v / total) * W * H);
  const out: Box[] = [];
  let x = 0, y = 0, w = W, h = H, i = 0;
  const worst = (row: number[], side: number) => {
    const s = row.reduce((a, b) => a + b, 0);
    const mx = Math.max(...row), mn = Math.min(...row);
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  while (i < areas.length) {
    const side = Math.min(w, h);
    const row = [areas[i]];
    let j = i + 1;
    while (j < areas.length && worst([...row, areas[j]], side) <= worst(row, side)) { row.push(areas[j]); j++; }
    const s = row.reduce((a, b) => a + b, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      for (const a of row) { out.push({ x, y: cy, w: cw, h: a / cw }); cy += a / cw; }
      x += cw; w -= cw;
    } else {
      const ch = s / w;
      let cx = x;
      for (const a of row) { out.push({ x: cx, y, w: a / ch, h: ch }); cx += a / ch; }
      y += ch; h -= ch;
    }
    i = j;
  }
  return out;
}

/** Majors as tiles: area is the count, name and count printed. Each tile
 *  is made of light: a soft translucent fill that deepens with the count
 *  (`--k`); no outline at rest, no gloss or shading. Tiles are keyed by name, so switching lists glides each
 *  tile to its new place. */
export function Treemap<T>({ items, height: fixed, onOpen }: { items: { key: string; label: string; value: number; aria: string; /** hover text, e.g. "See the 9 students" */ tip?: string; data: T }[]; /** default: 384px, taller when narrow so names still fit */ height?: number; onOpen: (data: T) => void }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const height = fixed ?? (W && W < 520 ? 440 : 384);
  const boxes = useMemo(() => squarify(items.map((i) => i.value), W, height), [items, W, height]);
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div ref={ref} className="v4-iv-treemap" style={{ height }}>
      {W > 0 && items.map((it, k) => {
        const b = boxes[k];
        const share = it.value / max;
        const roomy = b.w > 132 && b.h > 80;
        return (
          <div key={it.key} className="v4-iv-tmslot" style={{ left: b.x, top: b.y, width: b.w, height: b.h }}>
            <IconTip label={it.tip ?? it.aria} className="h-full w-full">
              <button type="button" onClick={() => onOpen(it.data)} aria-label={it.aria} className={`v4-iv-tm ${roomy ? "" : "is-tight"}`}
                style={{ ["--k" as string]: share.toFixed(2) } as CSSProperties}>
                <span className="v4-iv-tm-face">
                  <span className="v4-iv-tm-name">{it.label}</span>
                  <b>{it.value}</b>
                </span>
              </button>
            </IconTip>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* InterestMeter                                                       */
/* ------------------------------------------------------------------ */

/** Under a poster: the share of the students in view who saved it, as a
 *  plain line that opens the savers. It was a slim meter, then a few faces;
 *  Chandu (10 Oct 2026): "I dont like bar graphs" and "that whole grid idea
 *  is bad" (no rows of small repeated marks), so it is words only. */
export function InterestMeter({ share, onOpen, tip, aria }: { share: number; onOpen: () => void; tip: string; aria: string }) {
  return (
    <span className="v4-iv-meter">
      <IconTip label={tip} className="w-full">
        <button type="button" onClick={onOpen} aria-label={aria} className="v4-iv-meterbtn">
          <small>{share}% of students</small>
        </button>
      </IconTip>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* spread (label nudging, used by the postsecondary flow)              */
/* ------------------------------------------------------------------ */

/** Push labels apart (top to bottom) so none sit closer than `gap`, kept
 *  inside [lo, hi]. Returns the new y for each input, in input order. */
export function spread(ys: number[], gap: number, lo: number, hi: number) {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) order[k].y = Math.max(order[k].y, order[k - 1].y + gap);
  if (order.length && order[order.length - 1].y > hi) {
    order[order.length - 1].y = hi;
    for (let k = order.length - 2; k >= 0; k--) order[k].y = Math.min(order[k].y, order[k + 1].y - gap);
  }
  if (order.length && order[0].y < lo) {
    order[0].y = lo;
    for (let k = 1; k < order.length; k++) order[k].y = Math.max(order[k].y, order[k - 1].y + gap);
  }
  const out: number[] = new Array(ys.length);
  for (const o of order) out[o.i] = o.y;
  return out;
}

/* ------------------------------------------------------------------ */
/* GradeTrail                                                          */
/* ------------------------------------------------------------------ */

/** Monotone cubic through the points (Fritsch-Carlson, as d3's
 *  curveMonotoneX): smooth, and never overshoots past a data value. */
function monotone(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0].x} ${pts[0].y}`;
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) m.push((pts[i + 1].y - pts[i].y) / (pts[i + 1].x - pts[i].x));
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    const h0 = pts[i].x - pts[i - 1].x, h1 = pts[i + 1].x - pts[i].x;
    t.push(m[i - 1] * m[i] <= 0 ? 0 : (3 * (h0 + h1)) / ((2 * h1 + h0) / m[i - 1] + (h1 + 2 * h0) / m[i]));
  }
  t.push(m[n - 2]);
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = (pts[i + 1].x - pts[i].x) / 3;
    d += `C${pts[i].x + h} ${pts[i].y + t[i] * h} ${pts[i + 1].x - h} ${pts[i + 1].y - t[i + 1] * h} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

export type TrailPoint = { key: string; label: string; value: number | null; tip: string; aria: string; onOpen: () => void; /** the grade label opens the whole grade */ grade: { tip: string; aria: string; onOpen: () => void } };

/** Readiness by Grade, as simple as it can be (10 Oct 2026). WHY: Chandu
 *  turned down the ribbon chart (unsure it read), then a dot grid and a
 *  strip plot ("all the grids and hexagons are too much and too dense"),
 *  and asked: "I dont want cards for readiness by grade, i dont want so
 *  many things to read for readiness. Make it simple. But no bar graphs."
 *  So: one measure at a time (the switch lives in the section header), one
 *  trail of light across the grades, an Orb per grade at its share on an
 *  honest 0 to 100 scale, the share above it and the grade below. Those
 *  are the only words. Under 50% the Orb and its share turn the status
 *  amber. A grade the measure does not cover has no point, and the trail
 *  starts at the next one. Switching measures glides each Orb to its new
 *  height (transform only) and fades the trail in at its new shape. Every
 *  Orb is a button that opens that grade's students missing the measure;
 *  a grade's name opens the whole grade, needs support first. */
export function GradeTrail({ points, measureKey, height = 240 }: { points: TrailPoint[]; /** changes when the measure switches, to fade the trail in anew */ measureKey: string; height?: number }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const { on, reduce } = useArrived();
  const H = height;
  const top = 44, bottom = H - 40;
  const padX = W && W < 480 ? 12 : 40;
  const xs = points.map((_, i) => padX + ((W - padX * 2) * (i + 0.5)) / Math.max(1, points.length));
  const y = (v: number) => bottom - (Math.max(0, Math.min(100, v)) / 100) * (bottom - top);
  const pts = points.map((p, i) => (p.value === null ? null : { x: xs[i], y: y(p.value) })).filter((p): p is { x: number; y: number } => !!p);
  return (
    <div ref={ref} className="v4-iv-gt" style={{ height: H }}>
      {W > 0 && (
        <>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            {/* the only scale: faint hairlines at 0 and 100% */}
            {[0, 100].map((v) => <line key={v} x1={padX / 2} x2={W - padX / 2} y1={y(v)} y2={y(v)} className="v4-iv-gt-hair" />)}
            {pts.length > 1 && (
              <g key={measureKey} className={`v4-iv-gt-trail ${on ? "is-on" : ""}`}>
                <GlowStroke d={monotone(pts)} width={3} from={0.55} />
              </g>
            )}
          </svg>
          {points.map((p, i) => {
            const warn = p.value !== null && p.value < 50;
            const py = p.value === null ? bottom : on ? y(p.value) : bottom;
            return (
              <span key={p.key} className={`v4-iv-gt-pt ${p.value === null ? "is-none" : ""} ${warn ? "is-warn" : ""}`}
                style={{ transform: `translate(${xs[i]}px, ${py}px)`, transitionDuration: reduce ? "0ms" : undefined }}>
                {p.value !== null && (
                  <>
                    <b className="v4-iv-gt-pct">{p.value}%</b>
                    <IconTip label={p.tip} className="v4-iv-gt-hit">
                      <button type="button" onClick={p.onOpen} aria-label={p.aria}>
                        <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden><Orb cx={14} cy={14} r={6.5} color={warn ? "var(--color-feedback-warning)" : GLOW.blue} /></svg>
                      </button>
                    </IconTip>
                  </>
                )}
              </span>
            );
          })}
          {points.map((p, i) => (
            <span key={p.key} className="v4-iv-gt-grade" style={{ left: xs[i], top: bottom + 20 }}>
              <IconTip label={p.grade.tip}><button type="button" onClick={p.grade.onOpen} aria-label={p.grade.aria}>{p.label}</button></IconTip>
            </span>
          ))}
        </>
      )}
    </div>
  );
}
