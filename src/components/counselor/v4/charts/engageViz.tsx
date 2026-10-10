"use client";

// WHY (10 Oct 2026, Chandu): "Work on different styles for the graphs etc
// and everything inside milestones and insights. Don't change structure of
// the page or organisation of the pages, but please try better types of
// graphs, more beautiful ones. The graphs in the engagement tab are slightly
// better than the rest live right now. I want you to take it to the next
// level." These are Engagement's own chart forms, v4 only. They replace
// the visuals inside the same sections, in the same order, with the same
// data, tooltips and controls:
//   - LoginsArea: the page's one hero chart (a period's "See students" opens
//     who was active then: "everything needs drilldowns that are logical"). Layered gradient areas on one
//     zero-based scale, a scrubber that snaps to the nearest period, a light
//     beam on the selected period, the latest point lit. The page's only glow.
//   - KpiSpark: the stat tiles' trend, a neon curve rising to a lit orb
//     (the glow pass's "Conversion" reference), the month before marked.
//   - ShareLight: weekly and daily active (and each Dreamari Activity
//     measure) as one point of light on a faint 0 to 100% hairline. They
//     were dot grids, then cell hives; Chandu, same day: "all the grids ...
//     are too much and too dense. Lets not do those." Weekly and
//     daily have no history, so a trail would invent one; one point is
//     honest.
//   - Dreamari Activity: the four measures are independent (each is its
//     own roll per student, a student can do any mix), so a funnel or
//     Sankey would invent a nesting; each is a ShareLight under its figure.
//     It was four tick dials, then cell hives; rings, bars and any layout of many
//     small repeated marks are all out ("why is everything a ring to you?",
//     "I dont like bar graphs", "that whole grid idea is bad").
//   - The top ten is a clean ranked list with plain numbers: no per-row
//     chart ("Too many things"). It was lollipops, then dot strips.
//   - WarnLight: Inactive 7+ Days stays plain numbers (Maisha's 9 Oct ask)
//     with one amber light per grade that has students to reach.
//   All marks are light, not solid ("please dont give all the graphs that
//   3d look ... i want them to be made of LIGHT"): points of light with a
//   bright core fading to colour, no highlights or rims, and only a handful
//   of marks per chart.
// Blue family plus status colours only; text never wears the data colour.
// No blur on animated layers (CROSS_BROWSER_GUARDRAILS.md): the glow is
// stacked strokes, not a filter.

import { useId, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Tip } from "@/components/app/IconTip";
import { Aurora, GLOW, GlowStroke, LightGrid, Orb } from "./glow";
import "./engageViz.css";

type Point = { label: string; total: number; unique: number; avg: number };
type XY = { x: number; y: number };

/** Measures its own width so charts draw at real pixels, never stretched. */
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

/** Round tick steps (1, 2, 2.5, 5 × 10^n), about four of them. */
function niceScale(peak: number) {
  const p = Math.max(1, peak);
  const mag = 10 ** Math.floor(Math.log10(p / 4));
  const step = Math.max(1, ([1, 2, 2.5, 5, 10].find((n) => n * mag >= p / 4) ?? 10) * mag);
  const max = Math.ceil(p / step) * step;
  return { max, ticks: Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step) };
}

const TOTAL = GLOW.blue;
/** its own colour, outside the aurora's blues: near-white in dark, deep navy in light */
const ACTIVE = "var(--ev-active)";

/** The hero: total logins and active students over the period. */
export function LoginsArea({ data, path, unit, onSee }: { data: Point[]; path: (p: XY[]) => string; unit: "day" | "month"; /** opens the selected period's active students */ onSee?: (p: Point) => void }) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const [wrap, width] = useWidth<HTMLDivElement>();
  const last = Math.max(0, data.length - 1);
  const [pinned, setPinned] = useState(last);
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <p className="v4-source-note">No login activity in this period.</p>;
  const index = Math.min(hover ?? pinned, last);
  const cur = data[index];
  const narrow = width < 560;
  const height = narrow ? 236 : 316;
  const left = 34, right = 16, top = 34, bottom = 10;
  const plotW = Math.max(1, width - left - right);
  const plotH = height - top - bottom;
  const { max, ticks } = niceScale(Math.max(...data.map((p) => p.total)));
  const band = plotW / data.length;
  const x = (i: number) => left + (i + 0.5) * band;
  const y = (n: number) => top + (1 - n / max) * plotH;
  const base = y(0);
  const pts = (k: "total" | "unique") => data.map((p, i) => ({ x: x(i), y: y(p[k]) }));
  const totalD = path(pts("total"));
  const activeD = path(pts("unique"));
  const area = (d: string) => `${d} L${x(last).toFixed(1)} ${base} L${x(0).toFixed(1)} ${base} Z`;
  const peak = data.reduce((m, p, i) => (p.total > data[m].total ? i : m), 0);
  const best = index === last && peak === last;
  const pick = (clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect();
    const i = Math.round((clientX - r.left - left) / band - 0.5);
    setHover(Math.max(0, Math.min(last, i)));
  };
  // Value pills beside the scrubber, flipped left near the right edge and
  // kept apart when the two values sit close.
  const flip = x(index) > width - 90;
  const ty = y(cur.total);
  let uy = y(cur.unique);
  if (uy - ty < 26) uy = ty + 26;

  return (
    <figure className="ev-logins">
      <figcaption className="ev-readout" aria-live="polite" aria-atomic="true">
        <span className="ev-readout-date">{cur.label}{best && <em className="ev-verdict">Best {unit} yet</em>}</span>
        <span className="ev-readout-series"><i style={{ background: TOTAL }} aria-hidden /><b>{cur.total}</b>Total logins</span>
        <span className="ev-readout-series"><i style={{ background: ACTIVE }} aria-hidden /><b>{cur.unique}</b>Active students</span>
        <span className="ev-readout-avg">{cur.avg.toFixed(2)} logins each</span>
        {onSee && (
          <Tip label={`See the ${cur.unique} active students`}>
            <button type="button" className="ev-see dm-quiet" onClick={() => onSee(cur)} aria-label={`See the ${cur.unique} students active in ${cur.label}`}>See students<ArrowUpRight size={13} aria-hidden /></button>
          </Tip>
        )}
      </figcaption>
      <div ref={wrap} className="ev-logins-plot" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} aria-hidden="true" className="ev-logins-svg"
            onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
            onPointerDown={(e) => { pick(e.clientX, e.currentTarget); }}
            onPointerUp={() => { if (hover !== null) setPinned(hover); }}
            onPointerLeave={() => setHover(null)}>
            <defs>
              <linearGradient id={`ev-beam-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GLOW.sky} stopOpacity="0" /><stop offset="100%" stopColor={GLOW.blue} stopOpacity=".22" /></linearGradient>
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={left} x2={width - right} y1={y(t)} y2={y(t)} className={t === 0 ? "ev-axis" : "ev-grid"} />
                <text x={left - 10} y={y(t) + 4} textAnchor="end" className="ev-tick">{t}</text>
              </g>
            ))}
            <LightGrid xs={data.map((_, i) => x(i))} top={top - 6} bottom={base} />
            {/* the light beam on the selected period */}
            <rect x={x(index) - band * 0.26} y={top - 6} width={band * 0.52} height={base - top + 6} rx={Math.min(14, band * 0.2)} fill={`url(#ev-beam-${id})`} className="ev-beam" />
            {data.length > 1 && (
              <g className={reduce ? undefined : "ev-reveal"}>
                <Aurora d={area(totalD)} box={{ x: left, y: top, w: plotW, h: base - top }} span={[x(0), x(last)]} />
                {/* a casing in the page colour so the active line cuts through the
                   aurora instead of melting into it (Chandu: "the second line
                   is hard to distinguish against the aurora stuff") */}
                <path d={activeD} fill="none" className="ev-casing" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <GlowStroke d={activeD} color={ACTIVE} width={2.5} from={1} />
                <GlowStroke d={totalD} color={GLOW.blue} width={3} />
              </g>
            )}
            <line x1={x(index)} x2={x(index)} y1={top - 6} y2={base} className="ev-scrub" />
            {data.map((p, i) => i !== index && (
              <g key={p.label} className="ev-rest">
                <circle cx={x(i)} cy={y(p.total)} r="3" style={{ stroke: GLOW.blue }} />
                <circle cx={x(i)} cy={y(p.unique)} r="2.5" style={{ stroke: ACTIVE }} />
              </g>
            ))}
            <Orb cx={x(index)} cy={y(cur.unique)} r={4.5} color={ACTIVE} />
            <Orb cx={x(index)} cy={ty} r={7} color={GLOW.blue} pulse={index === last && !reduce} />
            <ValuePill x={x(index)} y={ty} value={cur.total} flip={flip} strong />
            <ValuePill x={x(index)} y={uy} value={cur.unique} flip={flip} />
          </svg>
        )}
      </div>
      <div className="ev-periods" role="group" aria-label={`Logins by ${unit}`} style={{ gridTemplateColumns: `repeat(${data.length},minmax(0,1fr))`, paddingLeft: left, paddingRight: right }}>
        {data.map((p, i) => (
          <button key={p.label} type="button" aria-pressed={i === index} aria-label={`${p.label}: ${p.total} total logins, ${p.unique} active students, ${p.avg.toFixed(2)} logins each`}
            onClick={() => { setPinned(i); setHover(null); }} onFocus={() => { setPinned(i); setHover(null); }} className="dm-quiet">
            <span className="v4-period-full ev-period-full">{p.label}</span>
            <span className="v4-period-short ev-period-short" aria-hidden>{/\d{4}$/.test(p.label) ? p.label.split(" ")[0] : p.label.split(" ").at(-1)}</span>
          </button>
        ))}
      </div>
    </figure>
  );
}

function ValuePill({ x, y, value, flip, strong }: { x: number; y: number; value: number; flip: boolean; strong?: boolean }) {
  const text = String(value);
  const w = 12 + text.length * 7.6;
  const px = flip ? x - 14 - w : x + 14;
  return (
    <g className={strong ? "ev-pill is-strong" : "ev-pill"}>
      <rect x={px} y={y - 11} width={w} height={22} rx={11} />
      <text x={px + w / 2} y={y + 4} textAnchor="middle">{text}</text>
    </g>
  );
}

/** Monotone cubic (Fritsch-Carlson): smooth, and never above or below the
 *  data between two points, so the curve stays honest. */
function monotone(pts: XY[]) {
  const n = pts.length;
  if (n < 2) return "";
  const dx = pts.slice(1).map((p, i) => p.x - pts[i].x);
  const m = pts.slice(1).map((p, i) => (p.y - pts[i].y) / dx[i]);
  const t = pts.map((_, i) => (i === 0 ? m[0] : i === n - 1 ? m[n - 2] : m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], h = Math.hypot(a, b);
    if (h > 3) { t[i] = (3 / h) * a * m[i]; t[i + 1] = (3 / h) * b * m[i]; }
  }
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c = dx[i] / 3;
    d += ` C${(pts[i].x + c).toFixed(1)} ${(pts[i].y + c * t[i]).toFixed(1)} ${(pts[i + 1].x - c).toFixed(1)} ${(pts[i + 1].y - c * t[i + 1]).toFixed(1)} ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
  }
  return d;
}

/** A flat series has a zero-height box, and an objectBoundingBox gradient
 *  on a zero-height box paints nothing; a hair of slope keeps it drawn. */
function keepDrawn(pts: XY[]) {
  if (pts.length > 1 && pts.every((p) => Math.abs(p.y - pts[0].y) < 0.01)) pts[pts.length - 1] = { ...pts[pts.length - 1], y: pts[0].y - 0.02 };
  return pts;
}

/** Room around a small chart for its glow: the SVG is drawn this much
 *  larger on every side and placed back over its box (absolute, -P), so
 *  halos and bloom never meet an edge. */
const GLOW_PAD = 30;

/** A stat tile's trend as a neon curve rising to a lit orb (the
 *  "Conversion" reference): aurora under the line, the month before marked.
 *  Same box as ShareLight, so the four tiles line up. */
export function KpiSpark({ values, label }: { values: number[]; label: string }) {
  const reduce = useReducedMotion();
  const [wrap, width] = useWidth<HTMLSpanElement>();
  const W = Math.max(40, width), H = 40, P = GLOW_PAD;
  const lo = Math.min(...values), hi = Math.max(...values);
  const x0 = 4, x1 = W - 8, y0 = 8, y1 = H - 6;
  const pts = keepDrawn(values.map((v, i) => ({ x: x0 + (i / Math.max(1, values.length - 1)) * (x1 - x0), y: y0 + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (y1 - y0) })));
  // Curved, not sharp ("I liked when the engagement graphs were more
  // curved than sharp"): monotone, so the line never overshoots a month.
  const d = monotone(pts);
  const end = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  return (
    <span ref={wrap} className="ev-chartbox" role="img" aria-label={label}>
      {width > 0 && (
        <svg width={W + P * 2} height={H + P * 2} style={{ left: -P, top: -P }} aria-hidden="true">
          <g transform={`translate(${P} ${P})`}>
            <g className={reduce ? undefined : "ev-reveal"}>
              <Aurora d={`${d} L${end.x} ${H} L${pts[0].x} ${H} Z`} box={{ x: 0, y: 0, w: W, h: H }} strength={0.8} />
              <GlowStroke d={d} color={TOTAL} width={2} from={0.3} />
            </g>
            {prev && <circle cx={prev.x} cy={prev.y} r="2" className="ev-spark-prev" />}
            <g className="ev-orb"><Orb cx={end.x} cy={end.y} r={3.5} color={GLOW.blue} /></g>
          </g>
        </svg>
      )}
    </span>
  );
}

/** A share of the caseload as one point of light on a faint 0 to 100%
 *  line: few marks, low density ("all the grids ... are too much and too
 *  dense"). Dark: a short trail leads into the orb, fading from nothing.
 *  Light: a solid blue trail from 0 to the value, brighter at the orb, on
 *  a 2px base, so it reads on a pale surface. */
export function ShareLight({ n, of, label }: { n: number; of: number; label?: string }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const [wrap, width] = useWidth<HTMLSpanElement>();
  const W = Math.max(40, width), H = 40, P = GLOW_PAD, cy = 24;
  const x0 = 4, x1 = W - 4;
  const p = Math.max(0, Math.min(1, n / Math.max(1, of)));
  const x = x0 + (x1 - x0) * p;
  const lead = Math.min(x - x0, 56);
  return (
    <span ref={wrap} className="ev-chartbox" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {width > 0 && (
        <svg width={W + P * 2} height={H + P * 2} style={{ left: -P, top: -P }} aria-hidden="true">
          <defs>
            <linearGradient id={`ev-sl-${id}`} x1={x - lead} x2={x} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor={GLOW.sky} stopOpacity="0" /><stop offset="100%" stopColor={GLOW.sky} stopOpacity=".9" /></linearGradient>
            <linearGradient id={`ev-st-${id}`} x1={x0} x2={Math.max(x, x0 + 1)} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor={GLOW.blue} stopOpacity=".55" /><stop offset="100%" stopColor={GLOW.blue} /></linearGradient>
          </defs>
          <g transform={`translate(${P} ${P})`}>
            <line x1={x0} x2={x1} y1={cy} y2={cy} className="ev-share-line" />
            <line x1={x0} x2={x0} y1={cy - 4} y2={cy + 4} className="ev-share-end" />
            <line x1={x1} x2={x1} y1={cy - 4} y2={cy + 4} className="ev-share-end" />
            {x - x0 > 2 && <line x1={x0} x2={x} y1={cy} y2={cy} stroke={`url(#ev-st-${id})`} className={reduce ? "ev-share-trail" : "ev-share-trail ev-lead-in"} />}
            {lead > 2 && <line x1={x - lead} x2={x} y1={cy} y2={cy} stroke={`url(#ev-sl-${id})`} strokeWidth="1.5" strokeLinecap="round" className={reduce ? "ev-share-lead" : "ev-share-lead ev-lead-in"} />}
            <g className={reduce ? "ev-orb" : "ev-orb ev-lead-in"}><Orb cx={x} cy={cy} r={4} color={GLOW.sky} /></g>
          </g>
        </svg>
      )}
    </span>
  );
}

/** A single amber point of light: this grade has students to reach. */
export function WarnLight() {
  return <span className="ev-warn-light" aria-hidden />;
}
