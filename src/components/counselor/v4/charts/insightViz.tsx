"use client";

// Chart marks for Insights > College & Career and Insights > Readiness
// (10 Oct 2026). WHY: Chandu asked to "work on different styles for the
// graphs etc and everything inside milestones and insights. Don't change
// structure of the page or organisation of the pages, but please try better
// types of graphs, more beautiful ones ... take it to the next level ... be
// creative with the graphs, don't be traditional, as long as they convey the
// information sensibly we can use them."
//
// One idea runs through both pages: a student is a dot (or a face). The
// counselor's question is always "which students", so the marks count
// people, not abstract lengths:
//   - SegmentGauge: a 270 degree dial of 40 ticks, lit to the share (the
//     Readiness indicators). The selected tile carries the page's one glow.
//   - DotBar / DotDonut: one dot per eligible student, the ones still
//     missing an indicator lit (Readiness > Gaps, bar and donut views).
//   - FaceStrip: one face per student exploring a school, a unit chart that
//     says who as well as how many (College & Career > schools).
//   - Treemap: majors as tiles sized by their count, gliding to the new
//     layout when Saved | At their schools switches.
//   - DotRibbon: postsecondary plans as one dot per student, grouped.
//   - InterestMeter: a slim share-of-caseload meter under each career poster.
//   - JourneyChart: Readiness by Grade as a "readiness journey": four grade
//     lanes, one smooth ribbon per indicator crossing them at its share.
//     The user, on the heat grid: "I don't like the readiness grade bar
//     graphs... are there really no other creative graph styles?", and on
//     rings: "why is everything a ring to you?" A ribbon shows the one thing
//     a grid of cells hides: how each indicator moves from grade to grade.
// Colour: --primary, the --v4-step blue ramp and neutrals only. Every mark
// is SVG or CSS, never blurred while animating, and still under reduced
// motion. Forked, not shared: the other Insights tabs keep their own marks.

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Avatar } from "../chips";
import { IconTip } from "@/components/app/IconTip";
import type { CounselorStudent } from "@/lib/counselorRoster";
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
function useArrived() {
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
/* SegmentGauge                                                        */
/* ------------------------------------------------------------------ */

const TICKS = 40;
const SWEEP = 270;

/** A 270 degree dial of 40 ticks lit to `value` (0-100), the share in the
 *  middle. Each tick is 2.5 points, so the lit count is honest. */
export function SegmentGauge({ value, size = 92, active = false, children }: { value: number; size?: number; active?: boolean; children?: ReactNode }) {
  const { on, reduce } = useArrived();
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * TICKS);
  const c = size / 2;
  const r1 = size / 2 - 3;
  const r0 = r1 - size * 0.11;
  return (
    <span className={`v4-iv-gauge ${active ? "is-active" : ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {Array.from({ length: TICKS }, (_, i) => {
          const a = ((135 + (i * SWEEP) / (TICKS - 1)) * Math.PI) / 180;
          const isLit = on && i < lit;
          // the lit run deepens toward its end: pale at the start, full blue at the share
          const mix = lit > 1 ? Math.round(42 + (58 * i) / (lit - 1)) : 100;
          return (
            <line key={i} x1={c + r0 * Math.cos(a)} y1={c + r0 * Math.sin(a)} x2={c + r1 * Math.cos(a)} y2={c + r1 * Math.sin(a)}
              strokeWidth={size > 80 ? 3 : 2.5} strokeLinecap="round"
              style={{ stroke: isLit ? `color-mix(in srgb, var(--primary) ${mix}%, var(--v4-iv-tint))` : "var(--v4-iv-off)", transitionDelay: reduce ? "0ms" : `${i * 14}ms` }} />
          );
        })}
      </svg>
      <span className="v4-iv-gauge-center">{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* DotBar + DotDonut                                                   */
/* ------------------------------------------------------------------ */

/** One dot per eligible student, column by column, the `lit` ones first so
 *  the lit run reads like a bar. Every row of a chart shares `rows` and the
 *  same dot pitch, so a longer bar always means more students. */
export function DotBar({ total, lit, rows, label }: { total: number; lit: number; rows: number; label?: string }) {
  const { on, reduce } = useArrived();
  return (
    <span className="v4-iv-dotbar" style={{ ["--rows" as string]: rows } as CSSProperties} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={on && i < lit ? "is-lit" : ""} style={reduce ? undefined : { transitionDelay: `${Math.min(i, 120) * 6}ms` }} />
      ))}
    </span>
  );
}

/** Rows a DotBar needs so the longest one fits `width` at `pitch` px. */
export function dotRows(maxTotal: number, width: number, pitch: number, min = 2) {
  if (!width) return min;
  return Math.max(min, Math.ceil((maxTotal * pitch) / Math.max(1, width)));
}

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
/* FaceStrip                                                           */
/* ------------------------------------------------------------------ */

/** One face per student, in a row whose length is the count (a unit
 *  chart). Faces overlap evenly when the longest strip would not fit, so
 *  the lengths stay comparable across rows. */
export function FaceStrip({ students, pitch, size = 26 }: { students: CounselorStudent[]; pitch: number; size?: number }) {
  const { on, reduce } = useArrived();
  return (
    <span className="v4-iv-faces" style={{ width: size + Math.max(0, students.length - 1) * pitch, height: size }} aria-hidden>
      {students.map((s, i) => (
        <span key={s.id} className={`v4-iv-face ${on ? "is-on" : ""}`} style={{ left: i * pitch, width: size, height: size, zIndex: students.length - i, transitionDelay: reduce ? "0ms" : `${i * 40}ms` }}>
          <Avatar name={s.name} index={s.avatarIndex} size={size} />
        </span>
      ))}
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

/** Majors as tiles: area is the count, blue deepens with it, name and
 *  count printed. Tiles are keyed by name, so switching lists glides each
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
                style={{ ["--t" as string]: `color-mix(in srgb, var(--primary) ${Math.round(10 + share * 24)}%, transparent)`, ["--b" as string]: `color-mix(in srgb, var(--primary) ${Math.round(3 + share * 14)}%, transparent)` } as CSSProperties}>
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
/* DotRibbon                                                           */
/* ------------------------------------------------------------------ */

/** Groups of students as one ribbon of dots, column by column, a gap
 *  between groups and a short name under each group wide enough to hold
 *  it. Each group is a button; hovering one dims the rest. */
export function DotRibbon({ groups, rows = 4, hot, onHot }: {
  groups: { key: string; short: string; count: number; color: string; aria: string; /** hover text */ tip?: string; onOpen: () => void }[];
  rows?: number; hot: string | null; onHot: (k: string | null) => void;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const { on, reduce } = useArrived();
  const shown = groups.filter((g) => g.count > 0);
  const cols = shown.reduce((a, g) => a + Math.ceil(g.count / rows), 0);
  const gap = 12;
  const pitch = W ? Math.max(8, Math.min(19, (W - gap * Math.max(0, shown.length - 1)) / Math.max(1, cols))) : 0;
  let seen = 0;
  return (
    <div ref={ref} className="v4-iv-ribbon" style={{ ["--p" as string]: `${pitch}px`, ["--rows" as string]: rows, gap } as CSSProperties} onMouseLeave={() => onHot(null)}>
      {pitch > 0 && shown.map((g) => {
        const width = Math.ceil(g.count / rows) * pitch;
        const start = seen;
        seen += g.count;
        return (
          <IconTip key={g.key} label={g.tip ?? g.aria}>
          <button type="button" onClick={g.onOpen} aria-label={g.aria} onMouseEnter={() => onHot(g.key)} onFocus={() => onHot(g.key)} onBlur={() => onHot(null)}
            className={`v4-iv-ribbon-group ${hot && hot !== g.key ? "is-dim" : ""}`} style={{ ["--c" as string]: g.color } as CSSProperties}>
            <span className="v4-iv-ribbon-dots" aria-hidden>
              {Array.from({ length: g.count }, (_, i) => <i key={i} className={on ? "is-on" : ""} style={reduce ? undefined : { transitionDelay: `${Math.min(start + i, 140) * 5}ms` }} />)}
            </span>
            <span className="v4-iv-ribbon-name" style={{ maxWidth: Math.max(width, 0) }}>{width >= 40 ? g.short : ""}</span>
          </button>
          </IconTip>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* InterestMeter                                                       */
/* ------------------------------------------------------------------ */

/** A slim meter under a poster: the share of the students in view who
 *  saved it, on a 0-100% track (honest, so small shares look small). */
export function InterestMeter({ share, onOpen, tip, aria }: { share: number; onOpen: () => void; tip: string; aria: string }) {
  const { on } = useArrived();
  return (
    <span className="v4-iv-meter">
      <IconTip label={tip} className="w-full">
        <button type="button" onClick={onOpen} aria-label={aria} className="v4-iv-meterbtn">
          <span className="v4-iv-meter-track" aria-hidden><i style={{ width: on ? `${Math.max(2, share)}%` : "0%" }} /></span>
          <small>{share}% of students</small>
        </button>
      </IconTip>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* JourneyChart                                                        */
/* ------------------------------------------------------------------ */

export type JourneyPoint = { value: number; tip: string; aria: string; onOpen: () => void } | null;
export type JourneySeries = { key: string; label: string; points: JourneyPoint[]; tip: string; aria: string; onOpen: () => void };
export type JourneyLane = { key: string; title: string; sub: string; tip: string; aria: string; onOpen: () => void };

/** End marker per ribbon, so colour is never the only cue. */
const MARKS = ["circle", "square", "diamond", "triangle"] as const;
function Mark({ kind, x, y, r, className }: { kind: (typeof MARKS)[number]; x: number; y: number; r: number; className?: string }) {
  if (kind === "circle") return <circle cx={x} cy={y} r={r} className={className} />;
  if (kind === "square") return <rect x={x - r * 0.9} y={y - r * 0.9} width={r * 1.8} height={r * 1.8} rx={r * 0.3} className={className} />;
  if (kind === "diamond") return <path d={`M${x} ${y - r * 1.2}L${x + r * 1.2} ${y}L${x} ${y + r * 1.2}L${x - r * 1.2} ${y}Z`} className={className} />;
  return <path d={`M${x} ${y - r * 1.15}L${x + r * 1.1} ${y + r * 0.8}L${x - r * 1.1} ${y + r * 0.8}Z`} className={className} />;
}

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

/** Push labels apart (top to bottom) so none sit closer than `gap`, kept
 *  inside [lo, hi]. Returns the new y for each input, in input order. */
function spread(ys: number[], gap: number, lo: number, hi: number) {
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

/** The readiness journey: grade lanes left to right, each indicator one
 *  ribbon crossing them at its share on one 0-100% scale. A chip on the
 *  ribbon at every lane prints the share (amber under 50%) and opens that
 *  grade's students missing it; the lane header opens the grade; the name
 *  at a ribbon's end opens everyone missing that indicator. Hovering a lane
 *  or a ribbon lights it and dims the rest. */
export function JourneyChart({ lanes, series, height = 500, minWidth = 600 }: { lanes: JourneyLane[]; series: JourneySeries[]; height?: number; /** below this the chart scrolls sideways */ minWidth?: number }) {
  const [ref, measured] = useWidth<HTMLDivElement>();
  const { on, reduce } = useArrived();
  const [lane, setLane] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null);
  const [atEnd, setAtEnd] = useState(false);
  const W = Math.max(minWidth, measured);
  const H = height;
  const head = 56, top = head + 22, bottom = H - 22;
  const padL = 44, padR = 150;
  const area = Math.max(1, W - padL - padR);
  const laneX = lanes.map((_, i) => padL + (area * (i + 0.5)) / lanes.length);
  const colW = Math.min(150, (area / lanes.length) * 0.72);
  const y = (v: number) => bottom - (v / 100) * (bottom - top);
  const endX = laneX[laneX.length - 1] + colW / 2 + 8;
  const id = useId().replace(/:/g, "");

  const paths = series.map((s) => {
    const pts = s.points.map((p, i) => (p ? { x: laneX[i], y: y(p.value) } : null)).filter((p): p is { x: number; y: number } => !!p);
    const last = pts[pts.length - 1];
    return { pts, d: pts.length ? `${monotone(pts)}L${endX} ${last.y}` : "", start: pts[0], startsLate: !s.points[0] && pts.length > 0, last };
  });
  // chips per lane, nudged apart; names at the right end, nudged apart
  const chipY = lanes.map((_, li) => spread(series.map((s) => (s.points[li] ? y(s.points[li]!.value) : -999)), 24, top, bottom));
  const nameY = spread(paths.map((p) => (p.last ? p.last.y : bottom)), 22, top, bottom);
  const dimSeries = (k: string) => (hot && hot !== k ? "is-dim" : "");
  const dimLane = (k: string) => (lane && lane !== k ? "is-dim" : "");

  return (
    <div className={`v4-iv-journey-scroll dm-scroll ${W > measured + 1 && measured > 0 && !atEnd ? "has-more" : ""}`} ref={ref}
      onScroll={(e) => { const el = e.currentTarget; setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4); }}>
      <div className="v4-iv-journey" style={{ width: W, height: H }} onMouseLeave={() => { setLane(null); setHot(null); }}>
        {measured > 0 && (
          <>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
              <defs>
                {series.map((s, k) => (
                  <linearGradient key={s.key} id={`${id}-g${k}`} gradientUnits="userSpaceOnUse" x1={laneX[0]} x2={endX} y1={0} y2={0}>
                    <stop offset="0%" className={`v4-iv-stop-a s-${k}`} />
                    <stop offset="100%" className={`v4-iv-stop-b s-${k}`} />
                  </linearGradient>
                ))}
              </defs>
              {/* lanes: soft glass columns; hovering one lights that grade */}
              {lanes.map((l, i) => (
                <rect key={l.key} x={laneX[i] - colW / 2} y={4} width={colW} height={H - 8} rx={18}
                  className={`v4-iv-lane ${lane === l.key ? "is-hot" : ""} ${dimLane(l.key)}`} onMouseEnter={() => setLane(l.key)} />
              ))}
              {/* the shared scale: solid hairlines at 0, 50 and 100% */}
              {[0, 50, 100].map((v) => (
                <g key={v} className="v4-iv-scale">
                  <line x1={padL - 8} x2={endX} y1={y(v)} y2={y(v)} />
                  <text x={padL - 14} y={y(v) + 4} textAnchor="end">{v === 0 ? "0" : `${v}%`}</text>
                </g>
              ))}
              {series.map((s, k) => {
                const p = paths[k];
                if (!p.d) return null;
                return (
                  <g key={s.key} className={`v4-iv-ribbon-g ${dimSeries(s.key)}`}>
                    <path d={p.d} className="v4-iv-ribbon" stroke={`url(#${id}-g${k})`} pathLength={1}
                      style={{ strokeDashoffset: on ? 0 : 1, transitionDelay: reduce ? "0ms" : `${k * 120}ms` }} />
                    {/* a ribbon that starts late (career pathway, Grade 10) gets a
                       small tick where it begins; the empty Grade 9 lane says the rest */}
                    {p.startsLate && (
                      <g className="v4-iv-starts">
                        <line x1={p.start.x} x2={p.start.x} y1={p.start.y - 11} y2={p.start.y + 11} />
                      </g>
                    )}
                    {/* a wide invisible stroke so the ribbon is easy to hover */}
                    <path d={p.d} className="v4-iv-ribbon-hit" onMouseEnter={() => setHot(s.key)} onMouseLeave={() => setHot(null)} />
                  </g>
                );
              })}
              {/* where a nudged chip really sits on its ribbon: a dot at the true share */}
              {lanes.map((l, li) => series.map((s, k) => {
                const pt = s.points[li];
                if (!pt) return null;
                const ty = y(pt.value);
                const cy = chipY[li][k];
                return (
                  <g key={`${l.key}-${s.key}`} className={`v4-iv-truept ${dimSeries(s.key)} ${on ? "is-on" : ""}`}>
                    {Math.abs(cy - ty) > 6 && <circle cx={laneX[li]} cy={ty} r={4} className={`s-${k}`} />}
                  </g>
                );
              }))}
            </svg>
            {/* lane headers: the grade and its size; opens the grade's students */}
            {lanes.map((l, i) => (
              <span key={l.key} className={`v4-iv-lanehead ${dimLane(l.key)}`} style={{ left: laneX[i], width: colW }}>
                <IconTip label={l.tip} className="w-full">
                  <button type="button" onClick={l.onOpen} aria-label={l.aria} onMouseEnter={() => setLane(l.key)} onFocus={() => setLane(l.key)} onBlur={() => setLane(null)}>
                    <strong>{l.title}</strong><small>{l.sub}</small>
                  </button>
                </IconTip>
              </span>
            ))}
            {/* value chips: one per ribbon per lane, nudged so none collide */}
            {lanes.map((l, li) => series.map((s, k) => {
              const pt = s.points[li];
              if (!pt) return null;
              return (
                <span key={`${l.key}-${s.key}`} className={`v4-iv-chip-slot ${on ? "is-on" : ""} ${dimLane(l.key)} ${dimSeries(s.key)}`} style={{ left: laneX[li], top: chipY[li][k], transitionDelay: reduce ? "0ms" : `${300 + li * 120}ms` }}>
                  <IconTip label={pt.tip}>
                    <button type="button" onClick={pt.onOpen} aria-label={pt.aria} className={`v4-iv-chip s-${k} ${pt.value < 50 ? "is-warn" : ""}`}
                      onMouseEnter={() => { setHot(s.key); setLane(l.key); }} onFocus={() => { setHot(s.key); setLane(l.key); }} onBlur={() => { setHot(null); setLane(null); }}>
                      <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden><Mark kind={MARKS[k % 4]} x={5} y={5} r={3.6} className={`v4-iv-chipmark s-${k}`} /></svg>{pt.value}%
                    </button>
                  </IconTip>
                </span>
              );
            }))}
            {/* direct labels at each ribbon's end; opens everyone missing it */}
            {series.map((s, k) => paths[k].last && (
              <span key={s.key} className={`v4-iv-endname ${dimSeries(s.key)}`} style={{ left: endX + 12, top: nameY[k] }}>
                <IconTip label={s.tip}>
                  <button type="button" onClick={s.onOpen} aria-label={s.aria} onMouseEnter={() => setHot(s.key)} onFocus={() => setHot(s.key)} onBlur={() => setHot(null)}><svg width={12} height={12} viewBox="0 0 12 12" aria-hidden><Mark kind={MARKS[k % 4]} x={6} y={6} r={4.2} className={`v4-iv-chipmark s-${k}`} /></svg>{s.label}</button>
                </IconTip>
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
