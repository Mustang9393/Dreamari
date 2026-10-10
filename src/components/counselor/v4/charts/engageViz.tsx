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
//   - KpiSpark: the stat tiles' trend, a shape-only sparkline with the
//     latest month lit and the month before it marked.
//   - DotWaffle: weekly and daily active as one dot per student, so "42 of
//     121" reads as people, not as a bar length.
//   - TickRing: Dreamari Activity as a dial of 40 ticks (2.5% each).
//   - Lollipops: the top ten students on one shared, zero-based scale.
//   - GradeDots: Inactive 7+ Days, each grade's students as dots, the
//     inactive ones in the warning colour (the number stays large, Maisha's
//     9 Oct ask).
// Blue family plus status colours only; text never wears the data colour.
// No blur on animated layers (CROSS_BROWSER_GUARDRAILS.md): the glow is
// stacked strokes, not a filter.

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Tip } from "@/components/app/IconTip";
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

const TOTAL = "var(--v4-chart-1)";
const ACTIVE = "var(--v4-chart-2)";

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
              <linearGradient id={`ev-ta-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOTAL} stopOpacity=".34" /><stop offset="70%" stopColor={TOTAL} stopOpacity=".06" /><stop offset="100%" stopColor={TOTAL} stopOpacity="0" /></linearGradient>
              <linearGradient id={`ev-aa-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ACTIVE} stopOpacity=".26" /><stop offset="100%" stopColor={ACTIVE} stopOpacity="0" /></linearGradient>
              <linearGradient id={`ev-tl-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={TOTAL} stopOpacity=".55" /><stop offset="100%" stopColor={TOTAL} /></linearGradient>
              <linearGradient id={`ev-beam-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOTAL} stopOpacity="0" /><stop offset="100%" stopColor={TOTAL} stopOpacity=".13" /></linearGradient>
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={left} x2={width - right} y1={y(t)} y2={y(t)} className={t === 0 ? "ev-axis" : "ev-grid"} />
                <text x={left - 10} y={y(t) + 4} textAnchor="end" className="ev-tick">{t}</text>
              </g>
            ))}
            {/* the light beam on the selected period */}
            <rect x={x(index) - band * 0.26} y={top - 6} width={band * 0.52} height={base - top + 6} rx={Math.min(14, band * 0.2)} fill={`url(#ev-beam-${id})`} className="ev-beam" />
            {data.length > 1 && (
              <g className={reduce ? undefined : "ev-reveal"}>
                <path d={area(totalD)} fill={`url(#ev-ta-${id})`} />
                <path d={area(activeD)} fill={`url(#ev-aa-${id})`} />
                {/* the hero glow: stacked strokes, no filter */}
                <path d={totalD} fill="none" stroke={TOTAL} strokeOpacity=".08" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                <path d={totalD} fill="none" stroke={TOTAL} strokeOpacity=".16" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d={totalD} fill="none" stroke={`url(#ev-tl-${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={activeD} fill="none" stroke={ACTIVE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            <line x1={x(index)} x2={x(index)} y1={top - 6} y2={base} className="ev-scrub" />
            {data.map((p, i) => i !== index && (
              <g key={p.label} className="ev-rest">
                <circle cx={x(i)} cy={y(p.total)} r="3" fill={TOTAL} />
                <circle cx={x(i)} cy={y(p.unique)} r="2.5" fill={ACTIVE} />
              </g>
            ))}
            {index === last && !reduce && <circle cx={x(index)} cy={ty} r="6" fill={TOTAL} className="ev-pulse" style={{ transformOrigin: `${x(index)}px ${ty}px` }} />}
            <circle cx={x(index)} cy={ty} r="13" fill={TOTAL} opacity=".14" />
            <circle cx={x(index)} cy={ty} r="5.5" fill={TOTAL} stroke="var(--background)" strokeWidth="2" />
            <circle cx={x(index)} cy={y(cur.unique)} r="4.5" fill={ACTIVE} stroke="var(--background)" strokeWidth="2" />
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

/** A stat tile's trend: shape only, the latest month lit. */
export function KpiSpark({ values, label }: { values: number[]; label: string }) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const W = 132, H = 40, pad = 5;
  const lo = Math.min(...values), hi = Math.max(...values);
  const pts = values.map((v, i) => ({ x: pad + (i / Math.max(1, values.length - 1)) * (W - pad * 2), y: pad + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (H - pad * 2) }));
  // Curved, not sharp ("I liked when the engagement graphs were more
  // curved than sharp"): monotone, so the line never overshoots a month.
  const d = monotone(pts);
  const end = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ev-spark" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`ev-sa-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOTAL} stopOpacity=".28" /><stop offset="100%" stopColor={TOTAL} stopOpacity="0" /></linearGradient>
        <linearGradient id={`ev-sl-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={TOTAL} stopOpacity=".25" /><stop offset="100%" stopColor={TOTAL} /></linearGradient>
      </defs>
      <g className={reduce ? undefined : "ev-reveal"}>
        <path d={`${d} L${end.x} ${H} L${pts[0].x} ${H} Z`} fill={`url(#ev-sa-${id})`} />
        <path d={d} fill="none" stroke={`url(#ev-sl-${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {prev && <circle cx={prev.x} cy={prev.y} r="2.5" fill="var(--background)" stroke={TOTAL} strokeWidth="1.5" />}
      <circle cx={end.x} cy={end.y} r="4" fill={TOTAL} stroke="var(--background)" strokeWidth="2" />
    </svg>
  );
}

/** One dot per student, the active ones filled first, column by column,
 *  so the filled share reads left to right like a bar. */
export function DotWaffle({ n, of, label }: { n: number; of: number; label: string }) {
  const reduce = useReducedMotion();
  const total = Math.max(1, of);
  const rows = total > 90 ? 4 : total > 40 ? 3 : 2;
  const cols = Math.ceil(total / rows);
  const S = 8;
  return (
    <svg viewBox={`0 0 ${cols * S} ${rows * S}`} className="ev-waffle" role="img" aria-label={label} preserveAspectRatio="xMinYMid meet">
      {Array.from({ length: total }, (_, i) => {
        const c = Math.floor(i / rows), r = i % rows;
        const on = i < n;
        return <circle key={i} cx={c * S + S / 2} cy={r * S + S / 2} r={S * 0.32} className={on ? "ev-dot is-on" : "ev-dot"} style={on && !reduce ? { animationDelay: `${c * 14}ms` } : undefined} />;
      })}
    </svg>
  );
}

/** A dial of 40 ticks, 2.5% each; the filled ticks step from light to full blue. */
export function TickRing({ pct, children, size = 92 }: { pct: number; children?: ReactNode; size?: number }) {
  const reduce = useReducedMotion();
  const N = 40;
  const on = Math.round((Math.max(0, Math.min(100, pct)) / 100) * N);
  const C = 50, R1 = 37, R2 = 47;
  return (
    <span className="ev-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {Array.from({ length: N }, (_, i) => {
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          const lit = i < on;
          const mix = on > 1 ? Math.round(40 + (i / (on - 1)) * 60) : 100;
          return (
            <line key={i} x1={C + Math.cos(a) * R1} y1={C + Math.sin(a) * R1} x2={C + Math.cos(a) * R2} y2={C + Math.sin(a) * R2}
              className={lit ? "ev-tick-mark is-on" : "ev-tick-mark"}
              style={lit ? { stroke: `color-mix(in srgb, var(--v4-chart-1) ${mix}%, var(--v4-chart-2))`, animationDelay: reduce ? undefined : `${i * 12}ms` } : undefined} />
          );
        })}
      </svg>
      <span className="ev-ring-center">{children}</span>
    </span>
  );
}

/** Ranked counts on one zero-based scale: a stem and a dot head per row. */
export function Lollipop({ value, max, delay = 0 }: { value: number; max: number; delay?: number }) {
  const reduce = useReducedMotion();
  const pct = (value / Math.max(1, max)) * 100;
  return (
    <span className="ev-lolly" aria-hidden>
      <i className={reduce ? undefined : "ev-grow"} style={{ width: `${pct}%`, animationDelay: reduce ? undefined : `${delay}ms` }}><b /></i>
    </span>
  );
}

/** A grade's students as dots, the inactive ones in the warning colour. */
export function GradeDots({ inactive, of }: { inactive: number; of: number }) {
  return (
    <span className="ev-grade-dots" aria-hidden style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.max(of, inactive) / 2)}, 6px)` }}>
      {Array.from({ length: Math.max(of, inactive) }, (_, i) => <i key={i} className={i < inactive ? "is-off" : undefined} />)}
    </span>
  );
}
