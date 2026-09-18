"use client";

import { useEffect, useId, useRef, useState } from "react";

// Chart primitives for the mentorship dashboard, drawn by hand so every mark
// follows the same rules: thin marks, one axis, a recessive grid, direct
// labels only where they carry information, and a hover layer on every chart
// with more than one value. Colours come from the caller; nothing here picks
// a palette. Numbers are compact (1.2K) on axes and full in tooltips.

/** The container's painted width, so charts draw in real pixels and text
 *  never scales with the viewBox (a 640-unit chart stretched to 1300px
 *  doubled every label, headless capture 18 Sept 2026). */
function useMeasuredWidth<T extends HTMLElement>(fallback: number): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => { const w = el.offsetWidth; if (w > 0) setWidth(w); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

const GRID = "rgba(255,255,255,0.08)";
const AXIS = "rgba(255,255,255,0.18)";
const INK = "var(--foreground)";
const MUTED = "var(--muted-foreground)";
const FONT = "var(--font-body)";

export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-US");
}

/** A tidy axis maximum: the smallest of 1, 2, 2.5, 5 × 10^n above `max`. */
function niceMax(max: number): number {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= max) return m * pow;
  return 10 * pow;
}

/** Vertical bars with a labelled y axis, three gridlines, a dashed average
 *  line, the current period emphasised, and the value shown on hover or
 *  keyboard focus. `highlight` marks the current period; `compare` (same
 *  length) draws last period as a ghost behind each bar. */
export function BarChart({ values, labels, accent, highlight, compare, height = 200, unit = "hours", ariaLabel }: { values: number[]; labels: string[]; accent: string; highlight?: number; compare?: number[]; height?: number; unit?: string; ariaLabel: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const [ref, W] = useMeasuredWidth<HTMLElement>(640);
  const H = height;
  const padL = 44;
  const padR = 8;
  const padT = 26;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = niceMax(Math.max(...values, ...(compare ?? [0])));
  const avg = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
  const n = values.length;
  const slot = plotW / n;
  const barW = Math.min(52, slot * 0.56);
  const x = (i: number) => padL + slot * i + (slot - barW) / 2;
  const y = (v: number) => padT + (1 - v / max) * plotH;
  const ticks = [0, 0.5, 1].map((t) => t * max);
  const active = hover ?? highlight ?? null;
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <figure ref={ref} className="relative m-0 w-full" role="img" aria-label={ariaLabel}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" style={{ fontFamily: FONT }} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`bar-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="1" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* grid + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={t === 0 ? AXIS : GRID} strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fontWeight="600" fill={MUTED}>{compact(t)}</text>
          </g>
        ))}
        {/* average */}
        <line x1={padL} x2={W - padR} y1={y(avg)} y2={y(avg)} stroke={accent} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="4 4" />
        <text x={padL + 6} y={y(avg) - 5} textAnchor="start" fontSize="10.5" fontWeight="700" fill={accent} fillOpacity="0.9">avg {compact(Math.round(avg))}</text>
        {/* bars */}
        {values.map((v, i) => {
          const isActive = active === i;
          const dim = active !== null && !isActive;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)} style={{ outline: "none" }}>
              {/* hit area */}
              <rect x={padL + slot * i} y={padT} width={slot} height={plotH} fill="transparent" />
              {compare && compare[i] !== undefined && (
                <rect x={x(i)} y={y(compare[i])} width={barW} height={Math.max(0, y(0) - y(compare[i]))} rx="4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="3 3" />
              )}
              <rect
                x={x(i)}
                y={y(v)}
                width={barW}
                height={Math.max(2, y(0) - y(v))}
                rx="4"
                fill={`url(#bar-${id})`}
                opacity={dim ? 0.38 : 1}
                style={{ transition: "opacity 0.15s ease" }}
              />
              {highlight === i && <rect x={x(i)} y={y(v)} width={barW} height={Math.max(2, y(0) - y(v))} rx="4" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.5" />}
              <text x={x(i) + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" fontWeight={highlight === i ? 800 : 600} fill={highlight === i ? INK : MUTED}>{labels[i]}</text>
              {isActive && (
                <text x={x(i) + barW / 2} y={y(v) - 8} textAnchor="middle" fontSize="12" fontWeight="800" fill={INK}>{v.toLocaleString("en-US")}</text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">{total.toLocaleString("en-US")} {unit} in total; average {Math.round(avg).toLocaleString("en-US")} per period.</figcaption>
    </figure>
  );
}

/** A tiny line for a metric tile: last nine periods, end point marked. */
export function Sparkline({ values, accent, width = 96, height = 30 }: { values: number[]; accent: string; width?: number; height?: number }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pad = 3;
  const x = (i: number) => pad + (i / Math.max(1, values.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / Math.max(1, max - min)) * (height - pad * 2);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = values.length - 1;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="block flex-none">
      <path d={d} fill="none" stroke={accent} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last])} r="2.6" fill={accent} />
    </svg>
  );
}

/** Progress toward a dated goal: the filled track, a tick where a straight
 *  line to the deadline would sit today, and the on-pace verdict. */
export function GoalTrack({ logged, target, pace, accent, unit }: { logged: number; target: number; pace: number; accent: string; unit: string }) {
  const pct = Math.min(100, (logged / target) * 100);
  const pacePct = Math.min(100, (pace / target) * 100);
  const ahead = logged >= pace;
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: INK }}>
          {compact(logged)} <span className="text-[13px] font-semibold" style={{ color: MUTED }}>of {compact(target)} {unit}</span>
        </span>
        <span className="rounded-full px-[8px] py-[2px] text-[11px] leading-[15px] font-bold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${ahead ? "var(--world-food-farming-nature)" : "var(--world-business-money-office)"} 16%, transparent)`, color: ahead ? "var(--world-food-farming-nature)" : "var(--world-business-money-office)" }}>
          {ahead ? "Ahead of pace" : "Behind pace"}
        </span>
      </div>
      <div className="relative h-[8px] w-full rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: accent }} />
        <span aria-hidden className="absolute top-[-4px] h-[16px] w-[2px] rounded-full" style={{ left: `calc(${pacePct}% - 1px)`, background: "#FFFFFF", opacity: 0.85 }} />
      </div>
      <span className="text-[11.5px] leading-[15px] font-semibold" style={{ color: MUTED }}>
        {Math.round(pct)}% done · pace line {Math.round(pacePct)}%
      </span>
    </div>
  );
}

/** A small column histogram with the count over each column, for
 *  distributions like meetings completed per pair. `emphasis` marks the
 *  columns that count as on track. */
export function Histogram({ values, labels, accent, emphasisFrom, height = 120, ariaLabel }: { values: number[]; labels: string[]; accent: string; emphasisFrom?: number; height?: number; ariaLabel: string }) {
  const [ref, W] = useMeasuredWidth<HTMLDivElement>(320);
  const H = height;
  const padT = 20;
  const padB = 20;
  const plotH = H - padT - padB;
  const max = Math.max(...values);
  const n = values.length;
  const slot = W / n;
  const barW = Math.min(44, slot * 0.6);
  return (
    <div ref={ref} className="w-full">
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label={ariaLabel} style={{ fontFamily: FONT }}>
      <line x1={0} x2={W} y1={H - padB} y2={H - padB} stroke={AXIS} strokeWidth="1" />
      {values.map((v, i) => {
        const h = (v / max) * plotH;
        const on = emphasisFrom === undefined || i >= emphasisFrom;
        const x = slot * i + (slot - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={H - padB - h} width={barW} height={Math.max(2, h)} rx="4" fill={accent} opacity={on ? 1 : 0.35} />
            <text x={x + barW / 2} y={H - padB - h - 6} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={INK}>{v}</text>
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill={MUTED}>{labels[i]}</text>
          </g>
        );
      })}
    </svg>
    </div>
  );
}

/** One stacked bar showing how a total splits across parts, with a legend
 *  row. Adjacent segments are separated by a 2px gap in the surface colour. */
export function ShareBar({ parts, accent }: { parts: { label: string; value: number }[]; accent: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const alphas = [1, 0.7, 0.5, 0.32];
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex h-[10px] w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        {parts.map((p, i) => (
          <span key={p.label} className="block h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(p.value / total) * 100}%`, background: accent, opacity: alphas[i % alphas.length] }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-[14px] gap-y-[4px]">
        {parts.map((p, i) => (
          <span key={p.label} className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: MUTED }}>
            <span aria-hidden className="size-[8px] rounded-[2px]" style={{ background: accent, opacity: alphas[i % alphas.length] }} />
            {p.label} <strong style={{ color: INK }}>{Math.round((p.value / total) * 100)}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
