"use client";

// Charts for the United Way board (7 Oct 2026). Chandu: "make sure we don't
// limit ourselves to graphs that are on platform and really use whatever is
// most apt and simple and beautiful. Also check the v4 counselor dashboard
// for chart ideas." So each number gets the form that says it fastest:
// - where students are: a map (the US, or Michigan) with one pin per local
//   United Way at its real location, sized by students;
// - reach to outcome: a true funnel, each step narrower, with the share
//   kept from the step before (the drop-off is the story);
// - goals that are rates: rings, as the counselor v4 OutcomeTile does
//   ("a rate of one caseload reads as a ring, not a bar filling toward
//   nothing"), with last year as a quiet line underneath;
// - counts compared across chapters: ranked bars, the counselor v4
//   RankedBars pattern.
// Map geometry is the same @svg-maps/usa data PayMap and Build use.

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import usaMapModule from "@svg-maps/usa";
import { Ring } from "../viz";
import type { Chapter } from "./uwData";

type UsaMap = { viewBox: string; locations: { id: string; name: string; path: string }[] };
const USA = (usaMapModule as unknown as { default?: UsaMap }).default ?? (usaMapModule as unknown as UsaMap);
const EASE = [0.22, 1, 0.36, 1] as const;

// Pins sit at each United Way's real longitude and latitude. @svg-maps/usa
// is an Albers equal-area projection (parallels 29.5 and 45.5, centred on
// -96); the scale and offset below were fitted to its Michigan outline
// (x and y scales agree within 1%), so a pin lands on its city.
const R = Math.PI / 180;
const ALB_N = (Math.sin(29.5 * R) + Math.sin(45.5 * R)) / 2;
const ALB_C = Math.cos(29.5 * R) ** 2 + 2 * ALB_N * Math.sin(29.5 * R);
const ALB_R0 = Math.sqrt(ALB_C - 2 * ALB_N * Math.sin(23 * R)) / ALB_N;
const FIT = { s: 1282.76, tx: 766.05, ty: 653.05 };
export function project(lon: number, lat: number): { x: number; y: number } {
  const r = Math.sqrt(ALB_C - 2 * ALB_N * Math.sin(lat * R)) / ALB_N;
  const t = ALB_N * (lon + 96) * R;
  return { x: FIT.tx + FIT.s * r * Math.sin(t), y: FIT.ty - FIT.s * (ALB_R0 - r * Math.cos(t)) };
}

/** The two frames: the whole country, or Michigan with its neighbours
 *  faint at the edges (the Great Lakes read as the gaps between them). */
const FRAMES = {
  usa: { x: 283, y: 3, w: 944, h: 722, home: null as string | null },
  michigan: { x: 842, y: 76, w: 154, h: 156, home: "Michigan" as string | null },
  // South Central Michigan (10 Oct 2026): Kalamazoo, Battle Creek, Lansing
  // and Jackson sit within about 80 miles, so the whole-state frame stacks
  // their pins; this one is southern Lower Michigan only
  southcentral: { x: 918, y: 184, w: 56, h: 40, home: "Michigan" as string | null },
};

/** A map with one pin per local United Way, sized by students; the picked
 *  one wears United Way yellow. Tap a pin to pick it. */
export function ChapterMap({ chapters, picked, onPick, blue, yellow, height = 260, region = "usa" }: { chapters: Chapter[]; picked?: string; onPick?: (id: string) => void; blue: string; yellow: string; height?: number; region?: keyof typeof FRAMES }) {
  const [hover, setHover] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const F = FRAMES[region];
  const k = F.w / 944; // pins and strokes scale with the frame
  const max = Math.max(...chapters.map((c) => c.students), 1);
  // big pins first, so a small neighbour stays on top and tappable
  const pins = chapters.map((c) => ({ c, ...project(c.lon, c.lat), r: (16 + 24 * Math.sqrt(c.students / max)) * k * (region === "usa" ? 1 : 1.1) })).sort((a, b) => b.r - a.r);
  const tip = pins.find((p) => p.c.id === (hover ?? picked));
  return (
    // the box keeps the frame's own shape, so the tooltip's percentages land on the pin
    <div className="relative mx-auto" style={{ height, maxWidth: "100%", aspectRatio: `${F.w} / ${F.h}` }}>
      <svg viewBox={`${F.x} ${F.y} ${F.w} ${F.h}`} className="block h-full w-full" role="img" aria-label="Local United Ways on the board">
        {USA.locations.map((l) => {
          const home = F.home ? l.name === F.home : chapters.some((c) => c.place.endsWith(STATE_ABBR[l.name] ?? "--"));
          return <path key={l.id} d={l.path} fill={home ? `color-mix(in srgb, ${blue} 40%, #141a33)` : "color-mix(in srgb, var(--foreground) 7%, transparent)"} stroke="var(--card)" strokeWidth={1.2 * k} transform={l.name === "Alaska" ? "translate(229.6 299.9) scale(0.55)" : undefined} />;
        })}
        {pins.map(({ c, x, y, r }, i) => {
          const on = c.id === picked;
          return (
            <g key={c.id} role={onPick ? "button" : undefined} tabIndex={onPick ? 0 : undefined} aria-label={`${c.name}, ${c.students} students`} style={{ cursor: onPick ? "pointer" : "default", outline: "none" }}
              onClick={() => onPick?.(c.id)} onKeyDown={(e) => { if (onPick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPick(c.id); } }}
              onPointerEnter={() => setHover(c.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(c.id)} onBlur={() => setHover(null)}>
              <motion.circle cx={x} cy={y} r={r + 8 * k} fill={on ? yellow : blue} opacity={0.22} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.07 }} style={{ transformOrigin: `${x}px ${y}px` }} />
              <motion.circle cx={x} cy={y} r={r} fill={on ? yellow : blue} stroke="#fff" strokeWidth={(on ? 3 : 2) * k * (region === "usa" ? 1 : 1.6)} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }} style={{ transformOrigin: `${x}px ${y}px` }} />
            </g>
          );
        })}
      </svg>
      {tip && (
        <span className="pointer-events-none absolute rounded-[var(--radius-sm)] border px-[10px] py-[6px] text-[12.5px] leading-[16px] font-bold whitespace-nowrap" style={{ left: `${((tip.x - F.x) / F.w) * 100}%`, top: `${((tip.y - F.y) / F.h) * 100}%`, transform: "translate(-50%, calc(-100% - 22px))", background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 10px 24px -12px rgba(0,0,0,0.7)" }}>
          {tip.c.short} · <span className="tabular-nums">{tip.c.students.toLocaleString("en-US")}</span> students
        </span>
      )}
    </div>
  );
}

const STATE_ABBR: Record<string, string> = { California: "CA", Florida: "FL", Michigan: "MI", Utah: "UT", "South Carolina": "SC", "New Mexico": "NM", Virginia: "VA" };

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

// ——— The counselor v4 chart family, for the United Way view ———
// Chandu, 8 Oct 2026: "For the analytics stuff, please use the wide variety
// (logically) and beautiful graphs like we have used in the counselor
// dashboards (v4)... We also had that one diamond and dot graph that I
// really liked." The v4 originals (counselor/v4/InsightCharts.tsx) are
// styled through the counselor app's scoped CSS and colour variables, so
// they can't render inside Connect; these are the same designs, drawn with
// the board's own colours. Each one answers one kind of question:
// - DotDiamondPlot: two rates per row on one 0 to 100% scale, joined by a
//   gap line (v4's "Progress Grade by Grade", the dot and diamond);
// - InterestDots: ranked interests on a shared scale with a spotlight on
//   the picked one (v4's InterestPlot; never a pie);
// - ShareRing: parts of one whole that don't overlap (v4's DestinationRing);
// - GoalArcs: a few rates against their goals, as half-rings (v4's
//   ReadinessArcs);
// - DualBars: two counts per row on one scale (v4's SiteBars).

const MORPH = { duration: 0.9, ease: EASE };

function Mark({ kind, color, size = 10 }: { kind: "dot" | "diamond"; color: string; size?: number }) {
  return <i aria-hidden className="inline-block flex-none" style={{ width: size, height: size, background: color, borderRadius: kind === "dot" ? "50%" : 2, transform: kind === "diamond" ? "rotate(45deg) scale(.85)" : undefined }} />;
}

/** Two rates per row: a dot (this year) and a diamond (last year, or the
 *  goal) on one 0 to 100% scale, with the gap between them drawn. */
export function DotDiamondPlot({ rows, dotLabel, diamondLabel, dotColor, diamondColor }: { rows: { label: string; sub?: string; dot: number; diamond: number }[]; dotLabel: string; diamondLabel: string; dotColor: string; diamondColor: string }) {
  const reduce = useReducedMotion();
  const cols = "grid grid-cols-[86px_minmax(0,1fr)_52px] items-center gap-[10px] sm:grid-cols-[150px_minmax(0,1fr)_62px] sm:gap-[16px]";
  return (
    <figure className="m-0 flex flex-col">
      <figcaption className="mb-[6px] flex justify-end gap-[16px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <span className="flex items-center gap-[7px]"><Mark kind="dot" color={dotColor} />{dotLabel}</span>
        <span className="flex items-center gap-[7px]"><Mark kind="diamond" color={diamondColor} />{diamondLabel}</span>
      </figcaption>
      <div className={cols} aria-hidden><span /><div className="relative h-[16px]">{[0, 25, 50, 75, 100].map((t) => <b key={t} className="absolute text-[11px] font-normal" style={{ left: `${t}%`, transform: t === 0 ? "none" : t === 100 ? "translateX(-100%)" : "translateX(-50%)", color: "var(--muted-foreground)" }}>{t}%</b>)}</div><span /></div>
      {rows.map((r, i) => {
        const lo = Math.min(r.dot, r.diamond), hi = Math.max(r.dot, r.diamond);
        return (
          <div key={r.label} role="img" aria-label={`${r.label}: ${dotLabel} ${r.dot}%, ${diamondLabel} ${r.diamond}%`} className={`${cols} min-h-[58px] border-b last:border-b-0`} style={{ borderColor: "var(--glass-border)" }}>
            <div className="flex min-w-0 flex-col gap-[3px]"><strong className="truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{r.label}</strong>{r.sub && <small className="truncate text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>{r.sub}</small>}</div>
            <div className="relative h-[30px]" aria-hidden>
              <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: "var(--glass-border)" }} />
              {[25, 50, 75].map((t) => <i key={t} className="absolute top-[4px] bottom-[4px] w-px" style={{ left: `${t}%`, background: "var(--glass-border)", opacity: 0.7 }} />)}
              <motion.span className="absolute top-1/2 -mt-[2px] h-[4px] rounded-[4px]" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: reduce ? 0 : 0.15 + 0.08 * i }} style={{ left: `${lo}%`, width: `${hi - lo}%`, background: "color-mix(in srgb, var(--foreground) 22%, transparent)" }} />
              <motion.b className="absolute top-1/2 z-[1]" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 22, delay: reduce ? 0 : 0.25 + 0.08 * i }} style={{ left: `${r.diamond}%`, width: 13, height: 13, margin: "-6.5px 0 0 -6.5px", rotate: 45, borderRadius: 2, background: diamondColor, boxShadow: "0 0 0 2.5px var(--card), 0 2px 6px -2px #0005" }} />
              <motion.b className="absolute top-1/2 z-[2]" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 22, delay: reduce ? 0 : 0.2 + 0.08 * i }} style={{ left: `${r.dot}%`, width: 14, height: 14, margin: "-7px 0 0 -7px", borderRadius: "50%", background: dotColor, boxShadow: "0 0 0 2.5px var(--card), 0 2px 6px -2px #0005" }} />
            </div>
            <div className="flex flex-col items-end gap-[5px] text-[12px] font-semibold tabular-nums">
              <span className="flex items-center gap-[6px]" style={{ color: dotColor }}><Mark kind="dot" color={dotColor} />{r.dot}%</span>
              <span className="flex items-center gap-[6px]" style={{ color: diamondColor }}><Mark kind="diamond" color={diamondColor} />{r.diamond}%</span>
            </div>
          </div>
        );
      })}
    </figure>
  );
}

/** Ranked interests on one shared scale: a spotlight on the picked row (its
 *  rank, count and share in a small ring), then a dot per row. */
export function InterestDots({ items, sample, unit = "students", color }: { items: { name: string; sub?: string; count: number }[]; sample: number; unit?: string; color: string }) {
  const [sel, setSel] = useState(0);
  const item = items[sel];
  const ceiling = Math.ceil(Math.max(...items.map((i) => i.count), 1) / 50) * 50;
  const share = Math.round((item.count / sample) * 100);
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center gap-[var(--space-4)] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <span className="text-[30px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color }}>{String(sel + 1).padStart(2, "0")}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]"><strong className="truncate text-[16px]" style={{ color: "var(--foreground)" }}>{item.name}</strong><span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}><b style={{ color: "var(--foreground)" }}>{item.count.toLocaleString("en-US")}</b> {unit} · {share}% of {unit}</span></span>
        <svg viewBox="0 0 64 64" className="h-[56px] w-[56px] flex-none" aria-hidden><circle cx="32" cy="32" r="26" fill="none" stroke="var(--glass-border)" strokeWidth="4" /><motion.circle key={sel} cx="32" cy="32" r="26" pathLength={100} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" transform="rotate(-90 32 32)" initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${share} 100` }} transition={MORPH} /><text x="32" y="36" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: "var(--foreground)" }}>{share}%</text></svg>
      </div>
      <ol className="flex flex-col">
        {items.map((e, i) => (
          <li key={e.name}>
            <button type="button" aria-pressed={sel === i} onClick={() => setSel(i)} className="dm-quiet grid w-full cursor-pointer grid-cols-[minmax(0,10rem)_minmax(0,1fr)_44px] items-center gap-[12px] rounded-[var(--radius-sm)] px-[6px] py-[9px] text-left" style={{ background: sel === i ? "var(--glass-surface-2)" : "transparent" }}>
              <span className="flex min-w-0 items-baseline gap-[8px]"><small className="text-[11px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{String(i + 1).padStart(2, "0")}</small><span className="truncate text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{e.name}</span></span>
              <span className="relative h-[14px]" aria-hidden>
                <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: "var(--glass-border)" }} />
                {[25, 50, 75].map((t) => <i key={t} className="absolute top-[2px] bottom-[2px] w-px" style={{ left: `${t}%`, background: "var(--glass-border)" }} />)}
                <motion.b className="absolute top-1/2 h-[12px] w-[12px] rounded-full" initial={{ left: "0%" }} animate={{ left: `${(e.count / ceiling) * 100}%` }} transition={{ ...MORPH, delay: i * 0.05 }} style={{ margin: "-6px 0 0 -6px", background: sel === i ? color : `color-mix(in srgb, ${color} 55%, transparent)`, boxShadow: "0 0 0 2px var(--card)" }} />
              </span>
              <strong className="text-right text-[13.5px] tabular-nums" style={{ color: "var(--foreground)" }}>{e.count}</strong>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Parts of one whole, as a ring with a legend; the share in the middle. */
export function ShareRing({ items, colors, centre, centreLabel }: { items: { label: string; count: number }[]; colors: string[]; centre: string; centreLabel: string }) {
  const total = items.reduce((n, x) => n + x.count, 0) || 1;
  const arcs = items.map((x, i) => ({ ...x, color: colors[i % colors.length], start: (items.slice(0, i).reduce((n, y) => n + y.count, 0) / total) * 100, share: (x.count / total) * 100 }));
  return (
    <div className="grid grid-cols-1 items-center gap-[var(--space-5)] sm:grid-cols-[200px_minmax(0,1fr)]">
      <div className="relative mx-auto h-[200px] w-[200px]">
        <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden>
          <circle cx="120" cy="120" r="91" fill="none" stroke="var(--glass-border)" strokeWidth="25" />
          {arcs.map((a) => <motion.circle key={a.label} cx="120" cy="120" r="91" pathLength={100} fill="none" stroke={a.color} strokeWidth="25" strokeDashoffset={-a.start} transform="rotate(-90 120 120)" initial={{ strokeDasharray: `0 100` }} animate={{ strokeDasharray: `${Math.max(0, a.share - 0.6)} ${100 - a.share + 0.6}` }} transition={MORPH} />)}
          <circle cx="120" cy="120" r="69" fill="none" stroke="var(--glass-border)" strokeDasharray="1 5" />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center text-center"><strong className="text-[30px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{centre}</strong><em className="mt-[4px] max-w-[110px] text-[12px] not-italic font-semibold" style={{ color: "var(--muted-foreground)" }}>{centreLabel}</em></span>
      </div>
      <ul className="flex flex-col gap-[10px]">
        {arcs.map((a) => <li key={a.label} className="flex items-center gap-[10px] text-[14px]"><i aria-hidden className="h-[10px] w-[10px] flex-none rounded-full" style={{ background: a.color }} /><span className="flex-1 font-semibold" style={{ color: "var(--foreground)" }}>{a.label}</span><strong className="tabular-nums" style={{ color: "var(--foreground)" }}>{a.count.toLocaleString("en-US")}</strong><span className="w-[38px] text-right text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{Math.round(a.share)}%</span></li>)}
      </ul>
    </div>
  );
}

/** A few rates as half-rings, each with its goal underneath. */
export function GoalArcs({ items, colors }: { items: { value: number; label: string; extra: string }[]; colors: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
      {items.map((m, i) => (
        <div key={m.label} className="flex flex-col items-center gap-[4px] text-center">
          <div className="relative h-[96px] w-[160px]">
            <svg viewBox="0 0 160 96" className="h-full w-full" aria-hidden><path d="M 15 81 A 65 65 0 0 1 145 81" pathLength={100} fill="none" stroke="var(--glass-border)" strokeWidth="9" strokeLinecap="round" /><motion.path d="M 15 81 A 65 65 0 0 1 145 81" pathLength={100} fill="none" stroke={colors[i % colors.length]} strokeWidth="9" strokeLinecap="round" initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${m.value} 100` }} transition={{ ...MORPH, delay: i * 0.08 }} /></svg>
            <strong className="absolute inset-x-0 bottom-[6px] text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.value}<small className="text-[14px]">%</small></strong>
          </div>
          <h3 className="text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{m.label}</h3>
          <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{m.extra}</p>
        </div>
      ))}
    </div>
  );
}

/** Two counts per row on one scale (students and volunteers), click to pick. */
export function DualBars({ rows, labels, colors }: { rows: { label: string; sub?: string; a: number; b: number; on?: boolean; onClick?: () => void }[]; labels: [string, string]; colors: [string, string] }) {
  const reduce = useReducedMotion();
  const max = Math.max(...rows.map((r) => Math.max(r.a, r.b)), 1);
  return (
    <figure className="m-0 flex flex-col gap-[12px]">
      <ul className="flex flex-col gap-[4px]">
        {rows.map((r, i) => (
          <li key={r.label}>
            <button type="button" onClick={r.onClick} aria-pressed={r.on} className="dm-quiet flex w-full cursor-pointer flex-col gap-[5px] rounded-[var(--radius-md)] px-[10px] py-[8px] text-left" style={{ background: r.on ? "var(--glass-surface-2)" : "transparent", boxShadow: r.on ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>
              <span className="flex items-baseline justify-between gap-[12px] text-[13px]"><span className="min-w-0 truncate font-semibold" style={{ color: "var(--foreground)" }}>{r.label}{r.sub && <span className="ml-[6px] font-normal" style={{ color: "var(--muted-foreground)" }}>{r.sub}</span>}</span><span className="flex-none tabular-nums" style={{ color: "var(--muted-foreground)" }}><b style={{ color: "var(--foreground)" }}>{r.a.toLocaleString("en-US")}</b> · <b style={{ color: "var(--foreground)" }}>{r.b.toLocaleString("en-US")}</b></span></span>
              {([r.a, r.b] as const).map((v, k) => (
                <span key={k} className="relative block h-[7px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }} aria-hidden>
                  <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${(v / max) * 100}%` }} transition={{ ...MORPH, delay: reduce ? 0 : i * 0.04 }} style={{ background: colors[k] }} />
                </span>
              ))}
            </button>
          </li>
        ))}
      </ul>
      <figcaption className="flex flex-wrap justify-center gap-x-[18px] gap-y-[4px]">{labels.map((l, k) => <span key={l} className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] rounded-full" style={{ background: colors[k] }} />{l}</span>)}</figcaption>
    </figure>
  );
}
