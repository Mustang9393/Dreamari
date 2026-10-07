"use client";

// Charts for the United Way board (7 Oct 2026). Chandu: "make sure we don't
// limit ourselves to graphs that are on platform and really use whatever is
// most apt and simple and beautiful. Also check the v4 counselor dashboard
// for chart ideas." So each number gets the form that says it fastest:
// - where students are: a US map with one pin per local United Way, sized
//   by students (geography is the question, so a map answers it);
// - reach to outcome: a true funnel, each step narrower, with the share
//   kept from the step before (the drop-off is the story);
// - goals that are rates: rings, as the counselor v4 OutcomeTile does
//   ("a rate of one caseload reads as a ring, not a bar filling toward
//   nothing"), with last year as a quiet line underneath;
// - counts compared across chapters: ranked bars, the counselor v4
//   RankedBars pattern.
// Map geometry is the same @svg-maps/usa data PayMap and Build use.

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import usaMapModule from "@svg-maps/usa";
import { Ring } from "../viz";
import type { Chapter } from "./uwData";

type UsaMap = { viewBox: string; locations: { id: string; name: string; path: string }[] };
const USA = (usaMapModule as unknown as { default?: UsaMap }).default ?? (usaMapModule as unknown as UsaMap);
const VIEWBOX = "283 3 944 722";
const EASE = [0.22, 1, 0.36, 1] as const;

/** A US map with one pin per local United Way. Pins are sized by students;
 *  the picked one wears United Way yellow. Tap a pin to pick it. */
export function ChapterMap({ chapters, picked, onPick, blue, yellow, height = 260 }: { chapters: Chapter[]; picked?: string; onPick?: (id: string) => void; blue: string; yellow: string; height?: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [centres, setCentres] = useState<Record<string, { x: number; y: number }>>({});
  const [hover, setHover] = useState<string | null>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const next: Record<string, { x: number; y: number }> = {};
    svg.querySelectorAll<SVGPathElement>("path[data-state]").forEach((p) => {
      const b = p.getBBox();
      next[p.dataset.state!] = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    });
    setCentres(next);
  }, []);
  const states = new Set(chapters.map((c) => c.state));
  const max = Math.max(...chapters.map((c) => c.students), 1);
  // two chapters in one state sit side by side, not on top of each other
  const seen: Record<string, number> = {};
  const pins = chapters.map((c) => {
    const n = (seen[c.state] = (seen[c.state] ?? -1) + 1);
    const at = centres[c.state];
    return at ? { c, x: at.x + n * 70 - (chapters.filter((k) => k.state === c.state).length - 1) * 35, y: at.y + n * 60 - (chapters.filter((k) => k.state === c.state).length - 1) * 30 } : null;
  }).filter((p): p is { c: Chapter; x: number; y: number } => !!p);
  const tip = pins.find((p) => p.c.id === (hover ?? picked));
  return (
    // the box keeps the map's own shape, so the tooltip's percentages land on the pin
    <div className="relative mx-auto" style={{ height, maxWidth: "100%", aspectRatio: "944 / 722" }}>
      <svg ref={svgRef} viewBox={VIEWBOX} className="block h-full w-full" role="img" aria-label="Local United Ways on the board">
        {USA.locations.map((l) => (
          <path key={l.id} d={l.path} data-state={l.name} fill={states.has(l.name) ? `color-mix(in srgb, ${blue} 40%, #141a33)` : "color-mix(in srgb, var(--foreground) 7%, transparent)"} stroke="var(--card)" strokeWidth={1.2} transform={l.name === "Alaska" ? "translate(229.6 299.9) scale(0.55)" : undefined} />
        ))}
        {pins.map(({ c, x, y }, i) => {
          const r = 16 + 24 * Math.sqrt(c.students / max);
          const on = c.id === picked;
          return (
            <g key={c.id} role={onPick ? "button" : undefined} tabIndex={onPick ? 0 : undefined} aria-label={`${c.name}, ${c.students} students`} style={{ cursor: onPick ? "pointer" : "default", outline: "none" }}
              onClick={() => onPick?.(c.id)} onKeyDown={(e) => { if (onPick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPick(c.id); } }}
              onPointerEnter={() => setHover(c.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(c.id)} onBlur={() => setHover(null)}>
              <motion.circle cx={x} cy={y} r={r + 8} fill={on ? yellow : blue} opacity={0.22} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.07 }} style={{ transformOrigin: `${x}px ${y}px` }} />
              <motion.circle cx={x} cy={y} r={r} fill={on ? yellow : blue} stroke="#fff" strokeWidth={on ? 3 : 2} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }} style={{ transformOrigin: `${x}px ${y}px` }} />
            </g>
          );
        })}
      </svg>
      {tip && (
        <span className="pointer-events-none absolute rounded-[var(--radius-sm)] border px-[10px] py-[6px] text-[12.5px] leading-[16px] font-bold whitespace-nowrap" style={{ left: `${((tip.x - 283) / 944) * 100}%`, top: `${((tip.y - 3) / 722) * 100}%`, transform: "translate(-50%, calc(-100% - 26px))", background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 10px 24px -12px rgba(0,0,0,0.7)" }}>
          {tip.c.short} · <span className="tabular-nums">{tip.c.students.toLocaleString("en-US")}</span> students
        </span>
      )}
    </div>
  );
}

/** Reach to outcome as a real funnel: each step narrower, centred, with the
 *  share kept from the step before. */
export function Funnel({ steps, color }: { steps: { label: string; value: number }[]; color: string }) {
  const reduce = useReducedMotion();
  const top = Math.max(...steps.map((s) => s.value), 1);
  return (
    <ol className="flex flex-col gap-[6px]" aria-label="From reached to matched">
      {steps.map((s, i) => {
        const w = Math.max(18, (s.value / top) * 100);
        const kept = i > 0 ? Math.round((s.value / steps[i - 1].value) * 100) : null;
        return (
          <li key={s.label} className="grid grid-cols-[88px_minmax(0,1fr)_48px] items-center gap-[10px]">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
            <span className="flex justify-center">
              <motion.span className="flex h-[30px] items-center justify-center rounded-[8px] text-[13px] font-extrabold tabular-nums" initial={reduce ? false : { width: "0%" }} animate={{ width: `${w}%` }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }} style={{ background: `color-mix(in srgb, ${color} ${100 - i * 16}%, #0a1030)`, color: "#fff" }}>
                {s.value.toLocaleString("en-US")}
              </motion.span>
            </span>
            <span className="text-right text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{kept !== null ? `${kept}%` : ""}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** A goal as a ring: the share of the goal reached, the value inside, the
 *  label and last year underneath (the counselor v4 OutcomeTile). */
export function GoalRing({ label, value, goal, last, unit = "", color }: { label: string; value: number; goal: number; last: number; unit?: string; color: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const fmt = (n: number) => (unit === "%" ? `${n}%` : n.toLocaleString("en-US"));
  return (
    <div className="flex min-w-0 items-center gap-[14px] rounded-[var(--radius-md)] border p-[14px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      <Ring pct={pct} size={72} stroke={7} accent={color}>
        <span className="text-[16px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{unit === "%" ? `${value}%` : `${pct}%`}</span>
      </Ring>
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
        <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{unit === "%" ? `Goal ${fmt(goal)}` : `${fmt(value)} of ${fmt(goal)}`}</span>
        <span className="text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>Last year {fmt(last)}</span>
      </span>
    </div>
  );
}

/** Counts compared: one row each, bar scaled to the largest (counselor v4 RankedBars). */
export function RankedRows({ rows, color, unit }: { rows: { label: string; value: number; sub?: string; on?: boolean; onClick?: () => void }[]; color: string; unit: string }) {
  const reduce = useReducedMotion();
  const top = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-[4px]">
      {rows.map((r, i) => {
        const body = (
          <>
            <span className="flex min-w-0 flex-col text-left">
              <span className="truncate text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{r.label}</span>
              {r.sub && <span className="truncate text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{r.sub}</span>}
            </span>
            <span className="relative block h-[8px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
              <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${Math.max(3, (r.value / top) * 100)}%` }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }} style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${color} 45%, transparent), ${color})` }} />
            </span>
            <span className="text-right text-[14px] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.value.toLocaleString("en-US")}<span className="ml-[4px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{unit}</span></span>
          </>
        );
        const cls = "grid w-full grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-[14px] rounded-[var(--radius-md)] px-[10px] py-[8px]";
        return (
          <li key={r.label}>
            {r.onClick
              ? <button type="button" onClick={r.onClick} aria-pressed={r.on} className={`dm-quiet cursor-pointer ${cls}`} style={{ background: r.on ? "var(--glass-surface-2)" : "transparent", boxShadow: r.on ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>{body}</button>
              : <div className={cls}>{body}</div>}
          </li>
        );
      })}
    </ul>
  );
}
