"use client";

// DEMO-ONLY v2 fork of ../PlatformEngagement.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { motion, useReducedMotion } from "framer-motion";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { BarChart, Segmented } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { RankedBars } from "./CareerCollegeInsights";
import { useSyncExternalStore } from "react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { SCHOOL_TARGETS, districtSchools } from "@/lib/counselorOrg";
import { MetricRow, OverviewCard, Verdict } from "./overviewShared";
import { Card, HeroCard } from "./kit";
import { Disclosure } from "./Disclosure";

import { GLASS_CARD as TINTED_CARD } from "../surfaces";
import { TREND_UP } from "../palette";

// DEMO-ONLY: engagement always trends up (direct instruction, 26 Sept
// 2026: "dont ever show a negative trend for engagement, even for demos.
// Always look up!"). The latest month keeps the reference's own headline
// figures (71 monthly active students, 214 logins, 3.01 logins each; the
// weekly 42 and daily 18 below are also the reference's); the five months
// before it climb toward them with two small, natural dips (June, August;
// direct feedback: "have a bit more variation... dont just show a straight
// line. It can dip a little... and trend upwards"). The latest month is
// always the highest, so every "vs last month" change is positive. The reference's own six months rose
// and fell (a 441-login peak, then a drop), which read as decline.
// A backend replaces this with real monthly counts.
const MONTHS = [
  { label: "Apr 2026", total: 104, unique: 41, avg: 2.54 },
  { label: "May 2026", total: 142, unique: 52, avg: 2.73 },
  { label: "Jun 2026", total: 131, unique: 49, avg: 2.67 },
  { label: "Jul 2026", total: 176, unique: 60, avg: 2.93 },
  { label: "Aug 2026", total: 168, unique: 58, avg: 2.9 },
  { label: "Sep 2026", total: 214, unique: 71, avg: 3.01 },
];
const WEEKLY_ACTIVE = 42;
const DAILY_ACTIVE = 18;
const pctChange = (now: number, before: number) => Math.round(((now - before) / before) * 100);

/** A tiny trend line under a stat: the months' shape, no axes. */
export function Sparkline({ values }: { values: number[] }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const W = 120;
  const H = 34;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * W, y: 3 + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (H - 6) }));
  const d = smoothPath(pts);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[34px] w-full max-w-[140px] overflow-visible" aria-hidden>
      <defs><linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOTAL_COLOR} stopOpacity="0.3" /><stop offset="100%" stopColor={TOTAL_COLOR} stopOpacity="0" /></linearGradient></defs>
      <motion.path d={`${d} L${W} ${H} L0 ${H} Z`} fill={`url(#sp-${id})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
      <motion.path d={d} fill="none" stroke={TOTAL_COLOR} strokeWidth="2" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <circle cx={last.x} cy={last.y} r="3" fill={TOTAL_COLOR} stroke="var(--card)" strokeWidth="1.5" />
    </svg>
  );
}

/** Monthly, weekly and daily actives out of the caseload, as one waffle:
 *  a dot per student, shaded by how often they log in (2 Oct 2026
 *  redundancy pass). The three are nested shares of one population (every
 *  daily user is also weekly and monthly), so one grid with a legend says
 *  it once, where four tiles each restated a number the chart repeats. */
function ActiveWaffle({ total, monthly, weekly, daily }: { total: number; monthly: number; weekly: number; daily: number }) {
  const reduce = useReducedMotion();
  const shades = [
    { label: "Daily", n: daily, color: TOTAL_COLOR },
    { label: "Weekly", n: weekly, color: `color-mix(in srgb, ${TOTAL_COLOR} 62%, transparent)` },
    { label: "Monthly", n: monthly, color: `color-mix(in srgb, ${TOTAL_COLOR} 32%, transparent)` },
  ];
  const rest = "color-mix(in srgb, var(--foreground) 9%, transparent)";
  const colorAt = (i: number) => shades.find((s) => i < s.n)?.color ?? rest;
  return (
    <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:gap-[var(--space-5)]">
      <motion.div className="grid w-full max-w-[360px] grid-cols-[repeat(20,minmax(0,1fr))] gap-[4px]" role="img" aria-label={`${daily} daily, ${weekly} weekly, ${monthly} monthly of ${total} students`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {Array.from({ length: total }, (_, i) => <span key={i} aria-hidden className="aspect-square rounded-full" style={{ background: colorAt(i) }} />)}
      </motion.div>
      <ul className="flex flex-row flex-wrap gap-x-[16px] gap-y-[6px] sm:flex-col">
        {/* Monthly's count is the card's headline, so its swatch is unnumbered. */}
        {shades.map((s) => (
          <li key={s.label} className="flex items-center gap-[7px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: s.color }} />{s.label}{s.label !== "Monthly" && <b className="tabular-nums" style={{ color: "var(--foreground)" }}>{s.n}</b>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Monotone cubic (Fritsch-Carlson) through the points: a smooth curve like
// the reference's, which never overshoots a month's real value the way a
// plain Catmull-Rom spline can.
function smoothPath(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 2) return "";
  const dx = pts.slice(1).map((p, i) => p.x - pts[i].x);
  const m = pts.slice(1).map((p, i) => (p.y - pts[i].y) / dx[i]);
  const t = pts.map((_, i) => (i === 0 ? m[0] : i === n - 1 ? m[n - 2] : m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = Math.hypot(a, b);
    if (h > 3) { t[i] = (3 / h) * a * m[i]; t[i + 1] = (3 / h) * b * m[i]; }
  }
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c = dx[i] / 3;
    d += ` C${(pts[i].x + c).toFixed(1)} ${(pts[i].y + c * t[i]).toFixed(1)} ${(pts[i + 1].x - c).toFixed(1)} ${(pts[i + 1].y - c * t[i + 1]).toFixed(1)} ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
  }
  return d;
}

const TOTAL_COLOR = "#5B6CF9";
// Light blue, not the reference's green: one chart family app-wide.
const UNIQUE_COLOR = "var(--cd-blue-soft)";

// Logins the way the Replit offers them (27 Sept 2026, Maisha: "in the
// replit they had the option to see logins by month, year, day, semester,
// etc. This is important. The version just has by month and no option to
// change"). The Replit's picker is an academic year (current, 2024-2025,
// 2023-2024) crossed with a view: logins by day (seven school days), by
// month, by student (the ten most active) and by site (the five parts of
// the app). By student and by site are the Replit's own numbers per year,
// verbatim. By day and by month keep the Replit's labels and scale but
// climb to their latest point, the standing rule for demo engagement
// (direct instruction, 26 Sept 2026: "dont ever show a negative trend for
// engagement, even for demos. Always look up!"); the current year's months
// are the ones this screen already showed.
type Point = { label: string; total: number; unique: number; avg: number };
const pt = (label: string, total: number, unique: number): Point => ({ label, total, unique, avg: Math.round((total / unique) * 100) / 100 });
type YearData = { label: string; monthly: Point[]; daily: Point[]; byStudent: { name: string; count: number }[]; bySite: { site: string; total: number; unique: number }[] };
const ENGAGEMENT_YEARS: Record<"current" | "2024-2025" | "2023-2024", YearData> = {
  current: {
    label: "Current academic year",
    monthly: MONTHS,
    daily: [pt("Thu 9/17", 38, 26), pt("Fri 9/18", 34, 24), pt("Mon 9/21", 44, 30), pt("Tue 9/22", 47, 32), pt("Wed 9/23", 45, 31), pt("Thu 9/24", 52, 35), pt("Fri 9/25", 58, 38)],
    byStudent: [{ name: "Aaliyah T.", count: 38 }, { name: "Marcus J.", count: 35 }, { name: "Destiny R.", count: 31 }, { name: "Jordan C.", count: 29 }, { name: "Kayla M.", count: 27 }, { name: "Isaiah W.", count: 24 }, { name: "Brianna L.", count: 22 }, { name: "Elijah P.", count: 21 }, { name: "Sophia G.", count: 19 }, { name: "Nathan B.", count: 17 }],
    bySite: [{ site: "Career Explorer", total: 623, unique: 98 }, { site: "Academic Planner", total: 389, unique: 84 }, { site: "College Finder", total: 241, unique: 61 }, { site: "Resume Builder", total: 188, unique: 52 }, { site: "Career Simulations", total: 130, unique: 43 }],
  },
  "2024-2025": {
    label: "2024 – 2025",
    monthly: [pt("Aug 2024", 164, 58), pt("Sep 2024", 188, 63), pt("Oct 2024", 176, 60), pt("Nov 2024", 205, 67), pt("Dec 2024", 198, 65), pt("Jan 2025", 221, 70), pt("Feb 2025", 236, 73), pt("Mar 2025", 229, 72), pt("Apr 2025", 251, 77), pt("May 2025", 268, 81)],
    daily: [pt("Mon 9/2", 41, 28), pt("Tue 9/3", 46, 31), pt("Wed 9/4", 44, 30), pt("Thu 9/5", 52, 35), pt("Fri 9/6", 49, 33), pt("Mon 9/9", 57, 38), pt("Tue 9/10", 63, 42)],
    byStudent: [{ name: "Jayla H.", count: 44 }, { name: "Devon A.", count: 41 }, { name: "Amara S.", count: 37 }, { name: "Chris F.", count: 33 }, { name: "Layla N.", count: 30 }, { name: "Malik D.", count: 28 }, { name: "Priya K.", count: 25 }, { name: "Tyler M.", count: 23 }, { name: "Simone V.", count: 21 }, { name: "Ava T.", count: 19 }],
    bySite: [{ site: "Career Explorer", total: 714, unique: 107 }, { site: "Academic Planner", total: 441, unique: 91 }, { site: "College Finder", total: 278, unique: 70 }, { site: "Resume Builder", total: 203, unique: 58 }, { site: "Career Simulations", total: 149, unique: 47 }],
  },
  "2023-2024": {
    label: "2023 – 2024",
    monthly: [pt("Aug 2023", 131, 47), pt("Sep 2023", 152, 52), pt("Oct 2023", 146, 50), pt("Nov 2023", 168, 55), pt("Dec 2023", 161, 54), pt("Jan 2024", 183, 59), pt("Feb 2024", 197, 62), pt("Mar 2024", 190, 61), pt("Apr 2024", 209, 66), pt("May 2024", 224, 71)],
    daily: [pt("Mon 9/4", 33, 23), pt("Tue 9/5", 38, 26), pt("Wed 9/6", 36, 25), pt("Thu 9/7", 43, 29), pt("Fri 9/8", 41, 28), pt("Mon 9/11", 47, 32), pt("Tue 9/12", 52, 35)],
    byStudent: [{ name: "Marcus B.", count: 40 }, { name: "Zoe C.", count: 36 }, { name: "Andre M.", count: 33 }, { name: "Fatima A.", count: 30 }, { name: "James T.", count: 27 }, { name: "Keisha R.", count: 25 }, { name: "Lucas N.", count: 22 }, { name: "Maya S.", count: 20 }, { name: "Darius W.", count: 18 }, { name: "Emma L.", count: 16 }],
    bySite: [{ site: "Career Explorer", total: 591, unique: 94 }, { site: "Academic Planner", total: 364, unique: 78 }, { site: "College Finder", total: 218, unique: 57 }, { site: "Resume Builder", total: 167, unique: 44 }, { site: "Career Simulations", total: 112, unique: 38 }],
  },
};
type EngagementYear = keyof typeof ENGAGEMENT_YEARS;
type EngagementView = "day" | "month" | "student" | "site";
const VIEWS: { key: EngagementView; label: string }[] = [{ key: "day", label: "Day" }, { key: "month", label: "Month" }, { key: "student", label: "Student" }, { key: "site", label: "Site" }];

/** Logins by site: total logins and unique students per part of the app,
 *  two bars a row, one scale. */
export function SiteBars({ sites }: { sites: YearData["bySite"] }) {
  const reduce = useReducedMotion();
  const max = Math.ceil(Math.max(...sites.map((s) => s.total)) / 100) * 100;
  return (
    <figure className="m-0 flex flex-col gap-[14px]">
      <ul className="flex flex-col gap-[14px]">
        {sites.map((s, i) => (
          <li key={s.site} className="flex flex-col gap-[5px]">
            <span className="flex items-baseline justify-between gap-[12px] text-[13px]">
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>{s.site}</span>
              <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}><b style={{ color: "var(--foreground)" }}>{s.total}</b> logins · <b style={{ color: "var(--foreground)" }}>{s.unique}</b> students</span>
            </span>
            {([["total", TOTAL_COLOR], ["unique", UNIQUE_COLOR]] as const).map(([k, color]) => (
              <span key={k} className="relative block h-[7px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }} aria-hidden>
                <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${(s[k] / max) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : i * 0.04 }} style={{ background: color }} />
              </span>
            ))}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-[4px]">
        <span className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] rounded-full" style={{ background: TOTAL_COLOR }} />Total logins</span>
        <span className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] rounded-full" style={{ background: UNIQUE_COLOR }} />Unique students</span>
      </div>
    </figure>
  );
}

// Rebuilt 26 Sept 2026 (direct feedback: "the logins by month is better in
// replit... everything in that graph seems squished down"). The old SVG
// stretched a 600x220 drawing to the card with preserveAspectRatio="none",
// flattening the curve and smearing the text; this one measures its own
// width and draws at real pixels, 280 tall. From the reference: smooth
// curves, a labelled y-axis on round steps, a dot on every month, the
// unique line in its own green so the two series never read as one. Ours
// adds a soft area under the total, lines that draw in on load, and a
// hover column that reads all three of the month's numbers at once.
export function LoginsChart({ data }: { data: Point[] }) {
  const MONTHS = data;
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 280;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const peak = Math.max(...MONTHS.map((m) => m.total));
  const step = [2, 5, 10, 20, 25, 50, 100].find((st) => peak / st <= 5) ?? 100;
  const max = Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const plotW = Math.max(1, W - padLeft - padRight);
  const plotH = H - padTop - padBottom;
  const x = (i: number) => padLeft + (i / (MONTHS.length - 1)) * plotW;
  const y = (v: number) => padTop + (1 - v / max) * plotH;
  const pts = (key: "total" | "unique") => MONTHS.map((m, i) => ({ x: x(i), y: y(m[key]) }));
  const totalD = smoothPath(pts("total"));
  const uniqueD = smoothPath(pts("unique"));
  const baseline = padTop + plotH;
  const draw = { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const };
  const hm = hover !== null ? MONTHS[hover] : null;
  // Beside the hover line, never on it: centred, it covered the month's own peak.
  const tipRight = hover !== null && x(hover) > W / 2;
  const tipLeft = hover !== null ? x(hover) + (tipRight ? -12 : 12) : 0;

  return (
    <figure className="m-0 flex flex-col gap-[12px]">
      <div ref={wrapRef} className="relative w-full" style={{ height: H }} onMouseLeave={() => setHover(null)}>
        {W > 0 && (
          <svg width={W} height={H} role="img" aria-label="Total logins and unique student logins" className="block overflow-visible">
            <defs>
              <linearGradient id={`pe-area-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOTAL_COLOR} stopOpacity="0.28" /><stop offset="100%" stopColor={TOTAL_COLOR} stopOpacity="0" /></linearGradient>
            </defs>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={padLeft} x2={W - padRight} y1={y(v)} y2={y(v)} stroke="color-mix(in srgb, var(--foreground) 9%, transparent)" strokeWidth="1" strokeDasharray={v === 0 ? undefined : "3 4"} />
                <text x={padLeft - 10} y={y(v) + 4} textAnchor="end" style={{ fontSize: 11, fontWeight: 600, fill: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{v}</text>
              </g>
            ))}
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padTop} y2={baseline} stroke="color-mix(in srgb, var(--foreground) 22%, transparent)" strokeWidth="1" />}
            <motion.path d={`${totalD} L${x(MONTHS.length - 1).toFixed(1)} ${baseline} L${padLeft} ${baseline} Z`} fill={`url(#pe-area-${id})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
            <motion.path d={totalD} fill="none" stroke={TOTAL_COLOR} strokeWidth="2.5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${TOTAL_COLOR} 55%, transparent))` }} />
            <motion.path d={uniqueD} fill="none" stroke={UNIQUE_COLOR} strokeWidth="2.5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...draw, delay: 0.1 }} style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${UNIQUE_COLOR} 45%, transparent))` }} />
            {MONTHS.map((m, i) => (
              <g key={m.label}>
                {(["total", "unique"] as const).map((k) => (
                  <motion.circle key={k} cx={x(i)} cy={y(m[k])} r={hover === i ? 6 : 4.5} fill={k === "total" ? TOTAL_COLOR : UNIQUE_COLOR} stroke="var(--card)" strokeWidth="2" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: reduce ? 0 : 0.2 + (i / (MONTHS.length - 1)) * 0.9 }} />
                ))}
                {(MONTHS.length <= 8 || (MONTHS.length - 1 - i) % 2 === 0) && <text x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === MONTHS.length - 1 ? "end" : "middle"} style={{ fontSize: 11.5, fontWeight: 600, fill: hover === i ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{m.label}</text>}
                {/* One hover column per month, the full plot height, so the
                   pointer doesn't have to find a 9px dot. */}
                <rect x={x(i) - plotW / (MONTHS.length - 1) / 2} y={padTop} width={plotW / (MONTHS.length - 1)} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${m.label}: ${m.total} total logins, ${m.unique} unique students, ${m.avg.toFixed(2)} logins each`} style={{ cursor: "pointer", outline: "none" }} />
              </g>
            ))}
          </svg>
        )}
        {hm && (
          <div className={`pointer-events-none absolute top-[8px] flex flex-col ${tipRight ? "-translate-x-full" : ""} gap-[4px] rounded-[var(--radius-sm)] border px-[10px] py-[8px] text-[12px] font-semibold whitespace-nowrap`} style={{ left: tipLeft, background: "var(--popover, var(--card))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
            <span className="font-bold">{hm.label}</span>
            <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: TOTAL_COLOR }} />{hm.total} total logins</span>
            <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: UNIQUE_COLOR }} />{hm.unique} unique students</span>
            <span style={{ color: "var(--muted-foreground)" }}>{hm.avg.toFixed(2)} logins each</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-[4px]">
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: TOTAL_COLOR }} />Total Logins</span>
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: UNIQUE_COLOR }} />Unique Student Logins</span>
      </div>
    </figure>
  );
}

export function PlatformEngagement() {
  // The District Leader's Engagement leads with the schools compared
  // (seeded siblings, counselorOrg.ts); Lincoln's own month-by-month detail
  // follows. A school role sees Lincoln only.
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const district = account.role === "District Leader";
  const roster = useReviewedRoster();
  const schools = district ? districtSchools(roster).slice().sort((a, b) => a.activePct - b.activePct) : [];
  const reach = schools.filter((s) => s.activePct >= SCHOOL_TARGETS.activeStudents).length;
  const [yearKey, setYearKey] = useState<EngagementYear>("current");
  const [view, setView] = useState<EngagementView>("month");
  const [tableOpen, setTableOpen] = useState(false);
  const year = ENGAGEMENT_YEARS[yearKey];
  const latest = year.monthly[year.monthly.length - 1];
  const prev = year.monthly[year.monthly.length - 2];
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {district && (
        <OverviewCard title="Schools" unit="% of students active this month" hero>
          <Verdict band={reach === schools.length ? "met" : reach >= schools.length - 1 ? "near" : "missed"}>{reach} of {schools.length} schools reach {SCHOOL_TARGETS.activeStudents}% · {schools[0]?.short} has the most room to grow</Verdict>
          <div className="flex flex-col gap-[10px]">
            {schools.map((s) => <MetricRow key={s.id} label={s.name} note={`${s.activeStudents} of ${s.students} · ${s.avgLogins.toFixed(1)} logins each`} value={s.activePct} target={SCHOOL_TARGETS.activeStudents} />)}
          </div>
        </OverviewCard>
      )}
      {/* 2 Oct 2026 redundancy pass: four tiles became one card. "Active
         this month" showed three times (tile, last chart point, first table
         row) and "Logins per student" three times; now the headline carries
         the month, its change and the six-month sparkline (a trend, so a
         line), and the waffle carries weekly and daily as shares of the
         caseload. Logins per student is one muted figure here plus the
         chart hover. Glow only when it is the screen's one hero (the
         District Leader's Schools card already is). */}
      {(() => {
        const delta = pctChange(latest.unique, prev.unique);
        const body = (
          <>
            <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
              <span className="flex flex-col gap-[6px]">
                <span className="flex items-baseline gap-[10px]">
                  <span className="text-[34px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{latest.unique}</span>
                  <span className="text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{yearKey === "current" ? "active this month" : `active in ${latest.label}`}</span>
                </span>
                <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <span className="flex items-center gap-[3px] font-bold tabular-nums" style={{ color: delta >= 0 ? TREND_UP : "var(--cd-amber)" }}>
                    {delta >= 0 ? <ArrowUpRight className="h-[13px] w-[13px]" aria-hidden /> : <ArrowDownRight className="h-[13px] w-[13px]" aria-hidden />}{delta >= 0 ? "+" : ""}{delta}% vs {prev.label}
                  </span>
                  <span className="tabular-nums">{latest.avg.toFixed(2)} logins each</span>
                </span>
              </span>
              <Sparkline values={year.monthly.map((m) => m.unique)} />
            </div>
            <ActiveWaffle total={roster.length} monthly={latest.unique} weekly={WEEKLY_ACTIVE} daily={DAILY_ACTIVE} />
          </>
        );
        return district ? <Card>{body}</Card> : <HeroCard>{body}</HeroCard>;
      })()}

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
            {/* 2 Oct 2026 redundancy pass: the "{school} · {year}" subtitle
               repeated the year picker beside it; cut. */}
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Logins by {VIEWS.find((v) => v.key === view)!.label.toLowerCase()}</h2>
            <span className="flex flex-wrap items-center gap-[8px]">
              <Segmented ariaLabel="Logins by" value={view} onChange={(k) => setView(k as EngagementView)} options={VIEWS.map((v) => ({ key: v.key, label: v.label }))} />
              <Listbox ariaLabel="Academic year" value={yearKey} onChange={(v) => setYearKey(v as EngagementYear)} options={(Object.keys(ENGAGEMENT_YEARS) as EngagementYear[]).map((k) => ({ value: k, label: ENGAGEMENT_YEARS[k].label }))} className="flex h-9 min-w-[190px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
            </span>
          </div>
          {view === "day" && <LoginsChart key={`day-${yearKey}`} data={year.daily} />}
          {view === "month" && <LoginsChart key={`month-${yearKey}`} data={year.monthly} />}
          {/* Student: a ranking of ten names, so ranked bars (the caption
             restating the title is cut). Site: two comparable series over
             five parts of the app, so one grouped column chart with a
             legend (2 Oct 2026 redundancy pass; SiteBars stays exported
             for the component lab). */}
          {view === "student" && <RankedBars key={`student-${yearKey}`} items={year.byStudent} />}
          {view === "site" && (
            <div className="mx-auto w-full max-w-[720px]">
              <BarChart key={`site-${yearKey}`} barStyle="solid" height={220} groups={year.bySite.map((s) => s.site)} series={[{ label: "Total logins", accent: TOTAL_COLOR, values: year.bySite.map((s) => s.total) }, { label: "Unique students", accent: UNIQUE_COLOR, values: year.bySite.map((s) => s.unique) }]} max={Math.ceil(Math.max(...year.bySite.map((s) => s.total)) / 100) * 100} valueSuffix="" />
            </div>
          )}
          {/* The monthly table folds shut under the chart: the chart's hover
             already reads each month, and its first row repeated the
             headline (2 Oct 2026 redundancy pass). Kept for the exact
             figures. */}
          {view === "month" && (
            <Disclosure id="pe-monthly-table" title="Monthly table" open={tableOpen} onToggle={() => setTableOpen((v) => !v)}>
              <MonthlyTable months={year.monthly} />
            </Disclosure>
          )}
        </div>
      </HoverBeam>

    </div>
  );
}

function MonthlyTable({ months }: { months: Point[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
            <th className="px-[var(--space-3)] py-[10px] text-left font-bold" style={{ color: "var(--muted-foreground)" }}>Month</th>
            <th className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Total Logins</th>
            <th className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Unique Student Logins</th>
            <th className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Avg Logins / Student</th>
          </tr>
        </thead>
        <tbody>
          {[...months].reverse().map((m, i) => (
            <tr key={m.label} className="border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
              <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: i === 0 ? "var(--primary)" : "var(--foreground)" }}>{m.label}</td>
              <td className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{m.total}</td>
              <td className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{m.unique}</td>
              <td className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{m.avg.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
