"use client";

// v5 chart pieces (7 Oct 2026). Chandu: "I could have sworn I saw better
// graphs in analytics before like we had for v4" and "the bubbles suck".
// These are v4's chart language on the student tokens: rings that draw in,
// a measured smooth trend line (v4 LoginsChart's monotone curve, never
// stretched), and gradient bars. One blue family; status colors only where
// a status is meant.

import { useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { smoothPath } from "@/components/counselor/v4/PlatformEngagement";

const TRACK = "color-mix(in srgb, var(--foreground) 10%, transparent)";

/** A full ring that draws in to `pct`; its number sits beside it, not in it. */
export function DrawRing({ pct, size = 56, stroke = 7, color = "var(--primary)" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="flex-none -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: Math.max(0.001, Math.min(1, pct / 100)) }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  );
}

/** One series over time, drawn at real pixels (measured), with a soft area,
 *  a dot per point, the latest value labelled, and a hover readout. */
export function TrendChart({ points, suffix = "%", max: maxIn, height = 240, label }: { points: { label: string; value: number }[]; suffix?: string; max?: number; height?: number; label: string }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = height;
  const padL = 36, padR = 18, padT = 18, padB = 28;
  const peak = maxIn ?? Math.max(...points.map((p) => p.value));
  const step = [5, 10, 20, 25, 50, 100, 200, 500].find((st) => peak / st <= 4) ?? 500;
  const max = maxIn ?? Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);
  const plotW = Math.max(1, W - padL - padR);
  const plotH = H - padT - padB;
  const x = (i: number) => padL + (i / Math.max(1, points.length - 1)) * plotW;
  const y = (v: number) => padT + (1 - v / max) * plotH;
  const pts = points.map((p, i) => ({ x: x(i), y: y(p.value) }));
  const d = smoothPath(pts);
  const base = padT + plotH;
  const last = points.length - 1;
  const hp = hover !== null ? points[hover] : null;
  return (
    <div ref={wrap} className="relative w-full" style={{ height: H }} onMouseLeave={() => setHover(null)}>
      {W > 0 && (
        <svg width={W} height={H} role="img" aria-label={label} className="block overflow-visible">
          <defs>
            <linearGradient id={`tc-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.26" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient>
          </defs>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="color-mix(in srgb, var(--foreground) 9%, transparent)" strokeDasharray={v === 0 ? undefined : "3 4"} />
              <text x={padL - 8} y={y(v) + 4} textAnchor="end" style={{ fontSize: 11, fontWeight: 600, fill: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{v}</text>
            </g>
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={base} stroke="color-mix(in srgb, var(--foreground) 22%, transparent)" />}
          <motion.path d={`${d} L${x(last).toFixed(1)} ${base} L${padL} ${base} Z`} fill={`url(#tc-${id})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
          <motion.path d={d} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
          {points.map((p, i) => (
            <g key={p.label}>
              <circle cx={x(i)} cy={y(p.value)} r={i === last || hover === i ? 5.5 : 3.5} fill="var(--primary)" stroke="var(--background)" strokeWidth="2" />
              {(points.length <= 8 || (last - i) % 2 === 0) && <text x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"} style={{ fontSize: 11.5, fontWeight: 600, fill: hover === i ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{p.label}</text>}
              <rect x={x(i) - plotW / Math.max(1, last) / 2} y={padT} width={plotW / Math.max(1, last)} height={plotH} fill="transparent" tabIndex={0} aria-label={`${p.label}: ${p.value}${suffix}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} style={{ cursor: "pointer", outline: "none" }} />
            </g>
          ))}
          {hover === null && <text x={x(last)} y={y(points[last].value) - 12} textAnchor="end" style={{ fontSize: 13, fontWeight: 700, fill: "var(--foreground)", fontFamily: "var(--font-body)" }}>{points[last].value}{suffix}</text>}
        </svg>
      )}
      {hp && (
        <div className={`pointer-events-none absolute top-[4px] rounded-[var(--radius-sm)] border px-[10px] py-[6px] text-[12.5px] font-semibold whitespace-nowrap ${x(hover!) > W / 2 ? "-translate-x-full" : ""}`} style={{ left: x(hover!) + (x(hover!) > W / 2 ? -10 : 10), background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          {hp.label}: {hp.value}{suffix}
        </div>
      )}
    </div>
  );
}

/** Labelled gradient bars on one scale. */
export function GradientBars({ rows, suffix = "%", max = 100, tone = "primary" }: { rows: { label: string; value: number; note?: string }[]; suffix?: string; max?: number; tone?: "primary" | "danger" }) {
  const reduce = useReducedMotion();
  const ink = tone === "danger" ? "var(--color-feedback-danger-solid)" : "var(--primary)";
  return (
    <ul className="flex flex-col gap-[var(--space-4)]">
      {rows.map((r, i) => (
        <li key={r.label} className="flex flex-col gap-[6px]">
          <span className="flex items-baseline justify-between gap-[var(--space-3)] text-[14px] font-semibold">
            <span className="truncate">{r.label}</span>
            <span className="tabular-nums">{r.value}{suffix}{r.note && <span className="ml-[6px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.note}</span>}</span>
          </span>
          <span className="relative block h-[10px] overflow-hidden rounded-full" style={{ background: TRACK }} aria-hidden>
            <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${Math.min(100, (r.value / max) * 100)}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : i * 0.05 }}
              style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${ink} 55%, var(--background)), ${ink})` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** DEMO-ONLY: a measure's monthly history until snapshots are stored. It
 *  ends on today's real value; good measures climb to it and problem
 *  measures fall to it, with small natural dips (never a straight line). */
export function historyFor(seed: string, now: number, bad = false, months = 8): { label: string; value: number }[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const d = new Date();
  const start = bad ? Math.min(100, Math.round(now * 1.6 + 4)) : Math.max(0, Math.round(now * 0.62));
  return Array.from({ length: months }, (_, i) => {
    const t = i / (months - 1);
    const wobble = i === months - 1 || i === 0 ? 0 : (((Math.abs(h) >> i) % 7) - 3) * (bad ? -1 : 1);
    const v = Math.round(start + (now - start) * t + wobble);
    const m = new Date(d.getFullYear(), d.getMonth() - (months - 1 - i), 1);
    return { label: m.toLocaleDateString("en-US", { month: "short" }), value: Math.max(0, Math.min(100, i === months - 1 ? now : v)) };
  });
}
