"use client";

// 10 Oct 2026, Chandu: "try better types of graphs, more beautiful ones. The
// graphs in the engagement tab are slightly better than the rest live right
// now. I want you to take it to the next level ... be creative with the
// graphs, don't be traditional, as long as they convey the information
// sensibly." Same sections, same order, same data and controls; only the
// visuals change (charts/engageViz.tsx). After the glow pass and the
// user's same-day rules ("i want them to be made of LIGHT", "I dont like
// bar graphs", "Please dont use the [cell shapes] anymore i hate it. Too
// many things", "that whole grid idea is bad"), the page carries few marks: the
// monthly tiles a neon trail to an orb, weekly, daily and each Dreamari
// Activity measure one point of light on a faint 0 to 100% line, Logins a
// layered glowing area with a scrubber, the top ten a plain ranked list,
// and Inactive 7+ Days big numbers with one amber light per grade. Same
// day ("everything needs drilldowns that are logical. I see graphs ... that don't do anything when I click"): the
// weekly and daily lights open who was active, the Active tile's trend
// and each logins period open that period's active students, and every
// students mark carries a tooltip saying what it opens. The exported Sparkline, LoginsChart and SiteBars below
// stay as they were: v5's Analytics and the component lab draw them.

// DEMO-ONLY v2 fork of ../PlatformEngagement.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 9 Oct 2026, Maisha: "Keep V4 Engagement as the primary Engagement
// design." Added: the Insights filters (School Year replaces this page's
// own year picker), Dreamari Activity (four indicators, DEMO-ONLY pending
// Usman), the ten most active students as real, openable students, and
// Inactive 7+ Days opening its students with View, Message and Message All.
// Her second pass, same day: the Logins chart loses its Site view ("remove
// the tab called 'site' completely"; SiteBars and the by-site data stay
// exported below only because v5's Analytics and the component lab draw
// them), and Inactive 7+ Days is four tiles with the number large instead
// of four bars ("the numbers are 2, 1, 1, 3. Does it make sense for this to
// be a line chart? Maybe the numbers should be larger").

import { motion, useReducedMotion } from "framer-motion";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { KpiSpark, LoginsArea, ShareLight, WarnLight } from "./charts/engageViz";
import { Segmented } from "./viz";
import { Disclosure } from "./Disclosure";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { DEMO_SCHOOL, lastActiveLabel } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { SCHOOL_TARGETS, districtSchools } from "@/lib/counselorOrg";
import { MetricRow, OverviewCard, Verdict } from "./overviewShared";

import { TREND_UP } from "./palette";
import { CountUp, Dreamy } from "./InsightCharts";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { seedHash } from "@/lib/localRecord";
import { signalsFor } from "@/lib/studentSignals";

import { Avatar, Go } from "./chips";
import { IconTip } from "@/components/app/IconTip";
import type React from "react";
import { InsightStudentsPanel, messageHref, studentHref, type StudentsDrill } from "./InsightStudents";
import { doneBy, pct, useInsightsScope, type SchoolYearKey } from "./insightsScope";
import "./insights.css";

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

function EngagementStat({ value, decimals = 0, label, series, delta, prevLabel, share, open }: { value: number; decimals?: number; label: string; series?: number[]; delta?: number; prevLabel?: string; share?: { n: number; of: number }; /** the chart opens the students it counts */ open?: { tip: string; onClick: () => void } }) {
  const hit = (node: React.ReactNode, cls = "w-full max-w-[260px]") => open ? <IconTip label={open.tip} className={cls}><button type="button" className="ev-hit dm-quiet" onClick={open.onClick} aria-label={`${label}: ${open.tip}`}>{node}</button></IconTip> : node;
  const up = (delta ?? 0) >= 0;
  const sharePct = share ? Math.round((share.n / Math.max(1, share.of)) * 100) : 0;
  return (
    <div className="v4-engagement-stat flex h-full flex-col gap-[10px]">
        <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </span>
        <span className="flex items-baseline gap-[8px]">
          <span className="v4-engagement-stat-value text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}><CountUp value={value} decimals={decimals}/></span>
          {typeof delta === "number" && (
            // Green up, the same as the Overview's trend chips (blue text
            // on a blue-tinted card is hard to read).
            <span className="flex items-center gap-[3px] text-[12px] font-bold tabular-nums whitespace-nowrap" style={{ color: up ? TREND_UP : "var(--cd-amber)" }}>
              {up ? <ArrowUpRight className="h-[13px] w-[13px]" aria-hidden /> : <ArrowDownRight className="h-[13px] w-[13px]" aria-hidden />}{up ? "+" : ""}{delta}%
            </span>
          )}
        </span>
        {/* One structure for all four tiles (label, figure, sub-line, chart
           directly under it, left-aligned, one width), so the row lines up. */}
        {(series || share) && (
          <span className="mt-auto flex w-full flex-col gap-[8px]">
            <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{series ? `vs ${prevLabel}` : `${sharePct}% of ${share!.of} students`}</span>
            {series
              ? hit(<KpiSpark values={series} label={`${label}, month by month`} />)
              : hit(<ShareLight n={share!.n} of={share!.of} label={`${share!.n} of ${share!.of} students`} />)}
          </span>
        )}
    </div>
  );
}



// Monotone cubic (Fritsch-Carlson) through the points: a smooth curve like
// the reference's, which never overshoots a month's real value the way a
// plain Catmull-Rom spline can.
export function smoothPath(pts: { x: number; y: number }[]) {
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

const TOTAL_COLOR = "var(--v4-chart-1)";
// Light blue, not the reference's green: one chart family app-wide.
const UNIQUE_COLOR = "var(--v4-chart-2)";

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
export const ENGAGEMENT_YEARS: Record<"current" | "2024-2025" | "2023-2024", YearData> = {
  current: {
    label: "Apr – Sep 2026",
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
// No Site view in v4 (Maisha, 9 Oct 2026: "remove the tab called 'site'
// completely"); v5's Analytics keeps its own.
type EngagementView = "day" | "month" | "student";
const VIEWS: { key: EngagementView; label: string }[] = [{ key: "day", label: "Day" }, { key: "month", label: "Month" }, { key: "student", label: "Student" }];

/** Logins by site: total logins and unique students per part of the app,
 *  two bars a row, one scale. Drawn by v5's Analytics and the component
 *  lab, not by this page any more (9 Oct 2026). */
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
                {/* Every other label on a narrow chart, counted back from the latest
                   point, so labels never overlap at phone width. */}
                {((MONTHS.length <= 8 && W >= 520) || (MONTHS.length - 1 - i) % 2 === 0) && <text x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === MONTHS.length - 1 ? "end" : "middle"} style={{ fontSize: 11.5, fontWeight: 600, fill: hover === i ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{m.label}</text>}
                {/* One hover column per month, the full plot height, so the
                   pointer doesn't have to find a 9px dot. */}
                <rect x={x(i) - plotW / (MONTHS.length - 1) / 2} y={padTop} width={plotW / (MONTHS.length - 1)} height={plotH} fill="transparent" role="img" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${m.label}: ${m.total} total logins, ${m.unique} unique students, ${m.avg.toFixed(2)} logins each`} style={{ cursor: "pointer", outline: "none" }} />
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
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: UNIQUE_COLOR }} />Active students</span>
      </div>
    </figure>
  );
}

// DEMO-ONLY: 2025–26 as a school year of its own, v4 only (v5 reads
// ENGAGEMENT_YEARS and keeps its three years). Same rule as every year
// here: it climbs to its latest month.
const YEAR_2025_26: YearData = {
  label: "2025 – 2026",
  monthly: [pt("Aug 2025", 171, 60), pt("Sep 2025", 193, 65), pt("Oct 2025", 186, 63), pt("Nov 2025", 214, 69), pt("Dec 2025", 207, 67), pt("Jan 2026", 233, 72), pt("Feb 2026", 249, 75), pt("Mar 2026", 242, 74), pt("Apr 2026", 263, 79), pt("May 2026", 282, 84)],
  daily: [pt("Mon 5/18", 44, 30), pt("Tue 5/19", 49, 33), pt("Wed 5/20", 47, 32), pt("Thu 5/21", 55, 37), pt("Fri 5/22", 52, 35), pt("Tue 5/26", 60, 40), pt("Wed 5/27", 66, 44)],
  byStudent: [{ name: "Imani W.", count: 46 }, { name: "Andre K.", count: 42 }, { name: "Lucia M.", count: 39 }, { name: "Darnell P.", count: 35 }, { name: "Grace H.", count: 31 }, { name: "Omar S.", count: 29 }, { name: "Talia R.", count: 26 }, { name: "Kevin D.", count: 24 }, { name: "Zara N.", count: 22 }, { name: "Miles J.", count: 20 }],
  bySite: [{ site: "Career Explorer", total: 742, unique: 109 }, { site: "Academic Planner", total: 458, unique: 93 }, { site: "College Finder", total: 291, unique: 72 }, { site: "Resume Builder", total: 214, unique: 60 }, { site: "Career Simulations", total: 161, unique: 50 }],
};
const YEAR_DATA: Record<SchoolYearKey, YearData> = { "2026-27": ENGAGEMENT_YEARS.current, "2025-26": YEAR_2025_26, "2024-25": ENGAGEMENT_YEARS["2024-2025"], "2023-24": ENGAGEMENT_YEARS["2023-2024"] };

/** DEMO-ONLY: logins are counted school-wide, not per student, until the
 *  backend logs them per student. A grade or group filter scales the
 *  school's figures to that slice of the caseload (every month by the same
 *  share, so a climbing line still climbs). */
function scaled(y: YearData, k: number): YearData {
  if (k >= 1) return y;
  const p = (m: Point): Point => pt(m.label, Math.max(1, Math.round(m.total * k)), Math.max(1, Math.round(m.unique * k)));
  return { ...y, monthly: y.monthly.map(p), daily: y.daily.map(p), bySite: y.bySite.map((s) => ({ ...s, total: Math.round(s.total * k), unique: Math.round(s.unique * k) })) };
}

// Dreamari's own engagement (9 Oct 2026, Maisha: "Add Dreamari-specific
// Engagement indicators: % of students actively exploring careers, % who
// completed a Play experience, % who connected with a professional, % who
// engaged with an opportunity").
// DEMO-ONLY: pending Usman's confirmation that the backend can track each of
// these per student, for the school year. The roster keeps lifetime counts
// (every seeded student has saved a career and played a simulation, so
// "ever did it" reads 99%), not who did it this year, so until those events
// are logged a student counts on a steady seeded share weighted by their
// own activity: more saves, more likely exploring; more simulations, more
// likely to have finished a Play experience. Connecting with a professional
// has no store yet; an opportunity counts anyone who applied to a program in
// Opportunities.
type Indicator = { key: string; label: string; did: (s: CounselorStudent) => boolean; note: (s: CounselorStudent) => string };
const roll = (s: CounselorStudent, key: string) => seedHash(`${s.id}:${key}`) % 100;
const INDICATORS: Indicator[] = [
  { key: "exploring", label: "Exploring careers", did: (s) => signalsFor(s).careersSaved > 0 && roll(s, "explore") < 45 + signalsFor(s).careersSaved * 3, note: (s) => `${signalsFor(s).careersSaved} careers saved` },
  { key: "play", label: "Finished a Play experience", did: (s) => signalsFor(s).simulationsCompleted > 0 && roll(s, "play") < 25 + signalsFor(s).simulationsCompleted * 5, note: (s) => `${signalsFor(s).simulationsCompleted} simulations played` },
  { key: "professional", label: "Connected with a professional", did: (s) => roll(s, "pro") < 31, note: (s) => `Exploring ${s.careerTrack}` },
  { key: "opportunity", label: "Engaged with an opportunity", did: (s) => signalsFor(s).programsApplied > 0 || roll(s, "opp") < 36, note: (s) => (signalsFor(s).programsApplied > 0 ? "Applied to a program" : "Saved a program") },
];

/** The ten most active students, by logins. In the current year they are
 *  the filtered caseload, each name opening the student; earlier years keep
 *  their own lists (many of those students have graduated). */
function ActiveStudents({ rows }: { rows: { s: CounselorStudent; count: number }[] }) {
  const router = useRouter();
  return (
    <ol className="ev-leaders">
      {rows.map((r, i) => (
        <li key={r.s.id}>
          <button type="button" onClick={() => router.push(studentHref(r.s.id))} className="ev-leader dm-quiet group" aria-label={`${r.s.name}, Grade ${r.s.grade}: ${r.count} logins. Open student`}>
            <span className="ev-leader-rank">{String(i + 1).padStart(2, "0")}</span>
            <Avatar name={r.s.name} size={28} index={r.s.avatarIndex} />
            <span className="ev-leader-name">{r.s.name}<small>Grade {r.s.grade}</small></span>
            <strong>{r.count}</strong>
            <Go kind="open" className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
          </button>
        </li>
      ))}
    </ol>
  );
}

/** An earlier year's top ten: the same plain list, names only (many of
 *  those students have graduated, so nothing opens). */
function PastLeaders({ items }: { items: { name: string; count: number }[] }) {
  return (
    <ol className="ev-leaders">
      {items.map((r, i) => (
        <li key={r.name} className="ev-leader is-plain" aria-label={`${r.name}: ${r.count} logins`}>
          <span className="ev-leader-rank">{String(i + 1).padStart(2, "0")}</span>
          <span className="ev-leader-name">{r.name}</span>
          <strong>{r.count}</strong>
        </li>
      ))}
    </ol>
  );
}

const daysInactive = (s: CounselorStudent) => Number(lastActiveLabel(s.lastActive).match(/^(\d+) days ago$/)?.[1] ?? 0);

export function PlatformEngagement() {
  // The District Leader's Engagement leads with the schools compared
  // (seeded siblings, counselorOrg.ts); Lincoln's own month-by-month detail
  // follows. A school role sees Lincoln only.
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const [drill, setDrill] = useState<StudentsDrill | null>(null);
  const router = useRouter();
  const district = account.role === "District Leader";
  const everyone = useReviewedRoster();
  const scope = useInsightsScope();
  const { roster, back, scopeLabel } = scope;
  const sub = (s: string) => [s, scopeLabel].filter(Boolean).join(" · ");
  const inactive = roster.filter((s) => daysInactive(s) >= 7);
  const checkins = [9, 10, 11, 12].map((grade) => ({ grade, size: roster.filter((s) => s.grade === grade).length, students: inactive.filter((s) => s.grade === grade) })).filter((g) => scope.filter.grade === "all" || g.grade === Number(scope.filter.grade));
  const schools = district ? districtSchools(everyone).slice().sort((a, b) => a.activePct - b.activePct) : [];
  const reach = schools.filter((s) => s.activePct >= SCHOOL_TARGETS.activeStudents).length;
  const [view, setView] = useState<EngagementView>("month");
  const [monthlyDataOpen, setMonthlyDataOpen] = useState(false);
  // The School Year filter picks the year (it replaced this card's own
  // Reporting Period dropdown, 9 Oct 2026, so the year is set once for all
  // of Insights); grade and group scale it to their share of the caseload.
  const share = everyone.length ? roster.length / everyone.length : 1;
  const year = scaled(YEAR_DATA[scope.filter.year] ?? ENGAGEMENT_YEARS.current, share);
  const latest = year.monthly[year.monthly.length - 1];
  const prev = year.monthly[year.monthly.length - 2];
  const weekly = Math.round(WEEKLY_ACTIVE * share);
  const daily = Math.round(DAILY_ACTIVE * share);
  // DEMO-ONLY: per-student logins for the current year, seeded from each
  // student's Dreamari activity until logins are logged per student.
  const active = roster.map((s) => ({ s, count: 8 + Math.round(s.engagement.dailyDropsCompleted / 4) + (seedHash(`${s.id}:logins`) % 9) })).sort((a, b) => b.count - a.count).slice(0, 10);

  // DEMO-ONLY: who was active in a period needs per-student login logs
  // (pending Usman). Until then the students most recently active fill the
  // period's count (weekly, daily), or a steady seeded pick fills a past
  // month or day's count, so every figure opens a list of the right size.
  const byRecent = [...roster].sort((a, b) => daysInactive(a) - daysInactive(b));
  const openActive = (title: string, n: number, pool: CounselorStudent[], when: string) => {
    const count = Math.min(n, pool.length);
    const act = pool.slice(0, count);
    const rest = roster.filter((s) => !act.includes(s));
    setDrill({
      title,
      subtitle: sub(`${count} of ${roster.length} students · ${when}`),
      stats: [{ value: `${pct(count, roster.length)}%`, label: "of students" }, { value: String(rest.length), label: "not active" }],
      students: act.map((s) => ({ s, note: lastActiveLabel(s.lastActive) })),
      listLabel: `Active · ${count}`,
      extra: rest.length ? { label: `Message the ${rest.length} not active`, onClick: () => router.push(messageHref(rest.map((s) => s.id))) } : undefined,
    });
  };
  const seeded = (key: string) => [...roster].sort((a, b) => seedHash(`${a.id}:${key}`) - seedHash(`${b.id}:${key}`));
  const openPeriod = (p: Point) => openActive(`Active in ${p.label}`, p.unique, back === 0 && p === latest ? byRecent : seeded(p.label), `${p.total} logins`);

  const indicators = INDICATORS.map((ind) => {
    const did = roster.filter((s) => ind.did(s) && doneBy(s, `eng:${ind.key}`, back));
    const not = roster.filter((s) => !did.includes(s));
    return { ind, did, not, value: pct(did.length, roster.length) };
  });
  const openIndicator = (x: (typeof indicators)[number]) => setDrill({
    title: x.ind.label,
    subtitle: sub(`${x.did.length} of ${roster.length} students`),
    stats: [{ value: `${x.value}%`, label: "of students" }, { value: String(x.not.length), label: "not yet" }],
    students: x.did.map((s) => ({ s, note: x.ind.note(s) })),
    extra: x.not.length ? { label: `Message the ${x.not.length} not yet`, onClick: () => router.push(messageHref(x.not.map((s) => s.id))) } : undefined,
  });

  if (roster.length === 0) return <p className="v4-filter-empty">No students match {scope.who}. Try a different grade or group.</p>;

  return (
    <div className="v4-page v4-engagement v4-sections flex flex-col">
      {district && (
        <OverviewCard title="Schools" unit="% of students active this month" hero>
          <Verdict band={reach === schools.length ? "met" : reach >= schools.length - 1 ? "near" : "missed"}>{reach} of {schools.length} schools reach {SCHOOL_TARGETS.activeStudents}% · {schools[0]?.short} has the most room to grow</Verdict>
          <div className="flex flex-col gap-[10px]">
            {schools.map((s) => <MetricRow key={s.id} label={s.name} note={`${s.activeStudents} of ${s.students} · ${s.avgLogins.toFixed(1)} logins each`} value={s.activePct} target={SCHOOL_TARGETS.activeStudents} />)}
          </div>
        </OverviewCard>
      )}
      {/* Each stat with its direction (direct feedback, 26 Sept 2026: "no
         trends signal to see growth"). The two monthly figures have six
         months of history, so they carry a sparkline and the change from
         last month; weekly and daily have no history here, so they show
         their share of the caseload instead of an invented trend. */}
      <div className="v4-engagement-stats grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-4">
        <EngagementStat value={latest.unique} label={`Active in ${latest.label}`} series={year.monthly.map((m) => m.unique)} prevLabel={prev.label} delta={pctChange(latest.unique, prev.unique)} open={{ tip: `See the ${Math.min(latest.unique, roster.length)} students`, onClick: () => openPeriod(latest) }} />
        <EngagementStat value={weekly} label="Weekly active" share={{ n: weekly, of: roster.length }} open={{ tip: `See the ${weekly} students`, onClick: () => openActive("Weekly active", weekly, byRecent, "last 7 days") }} />
        <EngagementStat value={daily} label="Daily active" share={{ n: daily, of: roster.length }} open={{ tip: `See the ${daily} students`, onClick: () => openActive("Daily active", daily, byRecent, "today") }} />
        <EngagementStat value={latest.avg} decimals={2} label="Logins per active student" series={year.monthly.map((m) => m.avg)} prevLabel={prev.label} delta={pctChange(latest.avg, prev.avg)} />
      </div>

      {/* What students do on Dreamari, beyond logging in. Each opens the
         students it counts, with a message to the ones not there yet. */}
      <section className="v4-surface flex flex-col gap-[var(--space-4)] border p-[var(--space-5)]">
        <header className="v4-card-head"><h2>Dreamari Activity</h2><span>Students participating</span></header>
        <div className="ev-activity">
          {indicators.map((x) => (
            <IconTip key={x.ind.key} label={`See the ${x.did.length} students`} className="flex min-w-0 w-full">
            <button type="button" onClick={() => openIndicator(x)} className="ev-activity-item dm-quiet group" aria-label={`${x.ind.label}: ${x.value}%, ${x.did.length} students. Show them`}>
              <span className="ev-activity-label">{x.ind.label}</span>
              <strong className="ev-activity-figure"><CountUp value={x.value} /><small>%</small></strong>
              <span className="ev-activity-note">{x.did.length} of {roster.length}</span>
              <ShareLight n={x.did.length} of={roster.length} />
            </button>
            </IconTip>
          ))}
        </div>
      </section>

      <section className="v4-engagement-chart h-full">
        <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]">
          <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
            <span className="flex flex-col gap-[2px]">
              <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Logins by {VIEWS.find((v) => v.key === view)!.label}</h2>
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{[DEMO_SCHOOL, year.label, scopeLabel].filter(Boolean).join(" · ")}</span>
            </span>
            <Segmented ariaLabel="Logins by" value={view} onChange={(k) => setView(k as EngagementView)} options={VIEWS.map((v) => ({ key: v.key, label: v.label }))} />
          </div>
          {view === "day" && <LoginsArea key={`day-${scope.filter.year}-${share}`} data={year.daily} path={smoothPath} unit="day" onSee={openPeriod} />}
          {view === "month" && <LoginsArea key={`month-${scope.filter.year}-${share}`} data={year.monthly} path={smoothPath} unit="month" onSee={openPeriod} />}
          {view === "student" && (back === 0
            ? <><span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Top 10 students by logins</span><ActiveStudents rows={active} /></>
            : <><span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Top 10 students that year</span><PastLeaders key={`student-${scope.filter.year}`} items={year.byStudent} /></>)}
          {/* The month table closes the chart's own card (it is that chart's data). */}
          {view === "month" && (
          <div className="v4-engagement-table border-t pt-[var(--space-2)]" style={{ borderColor: "var(--glass-border)" }}>
          <Disclosure id="monthly-login-data" title="View monthly data" open={monthlyDataOpen} onToggle={()=>setMonthlyDataOpen(!monthlyDataOpen)} variant="card">
          <div className="dm-scroll overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                  <th className="px-[var(--space-3)] py-[10px] text-left font-bold" style={{ color: "var(--muted-foreground)" }}>Month</th>
                  <th className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Total Logins</th>
                  <th className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Active Students</th>
                  <th className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Logins / Active Student</th>
                </tr>
              </thead>
              <tbody>
                {[...year.monthly].reverse().map((m, i) => (
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
          </Disclosure>
          </div>
          )}
        </div>
      </section>

      {/* Inactive 7+ Days, by grade (kept from v4). 9 Oct 2026, Maisha: "Make
         'Inactive 7+ Days' actionable: keep the V4 breakdown by grade;
         clicking Grade 12 with three inactive students immediately opens
         those three, with View Student, Message Student, Message All." It is
         always today's roster, whatever school year is picked.
         Four tiles, not four bars (Maisha, same day: "the numbers are 2, 1,
         1, 3. Does it make sense for this to be a line chart? Maybe the
         numbers should be larger"): counts this small compare as figures,
         not as lengths. Each tile is the number, the grade, and Open. */}
      <section className="v4-engagement-checkins h-full">
        <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]">
          <header className="v4-card-head"><h2>Inactive 7+ Days</h2><span>Right now · {inactive.length} {inactive.length === 1 ? "student" : "students"} · select a grade</span></header>
          {inactive.length === 0 ? (
            <div className="v4-progress-empty"><Dreamy mood="celebrate" size={64}/><p><strong>Every student logged in this week.</strong><span>No one to reach out to right now.</span></p></div>
          ) : (
          <div className="v4-inactive-tiles" role="group" aria-label="Inactive students by grade">
            {checkins.map((g) => (
              <button key={g.grade} type="button" disabled={!g.students.length} className="v4-inactive-tile dm-quiet group" aria-label={`Grade ${g.grade}: ${g.students.length} inactive 7+ days. Open them`}
                onClick={() => setDrill({ title: `Grade ${g.grade}: Inactive 7+ Days`, subtitle: sub(`${g.students.length} ${g.students.length === 1 ? "student" : "students"} with no activity for 7+ days`), students: g.students.map((s) => ({ s, note: lastActiveLabel(s.lastActive) })) })}>
                <strong><CountUp value={g.students.length} />{g.students.length > 0 && <WarnLight />}</strong>
                <span className="v4-inactive-grade">Grade {g.grade}</span>
                <span className="ev-grade-share">of {g.size} students</span>
                <span className="v4-inactive-open">Open<Go kind="open" /></span>
              </button>
            ))}
          </div>
          )}
        </div>
      </section>
      <InsightStudentsPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
