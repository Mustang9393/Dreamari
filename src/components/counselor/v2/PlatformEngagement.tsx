"use client";

// DEMO-ONLY v2 fork of ../PlatformEngagement.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { motion, useReducedMotion } from "framer-motion";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { LogIn, Users, CalendarDays, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useSyncExternalStore } from "react";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { SCHOOL_TARGETS, districtSchools } from "@/lib/counselorOrg";
import { MetricRow, OverviewCard, Verdict } from "./overviewShared";

import { GLASS_CARD as TINTED_CARD } from "../surfaces";

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
const LATEST = MONTHS[MONTHS.length - 1];
const PREV = MONTHS[MONTHS.length - 2];
const WEEKLY_ACTIVE = 42;
const DAILY_ACTIVE = 18;
const pctChange = (now: number, before: number) => Math.round(((now - before) / before) * 100);

/** A tiny trend line under a stat: the months' shape, no axes. */
function Sparkline({ values }: { values: number[] }) {
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

function EngagementStat({ icon: StatIcon, value, label, series, delta, prevLabel, share }: { icon: typeof LogIn; value: string; label: string; series?: number[]; delta?: number; prevLabel?: string; share?: { n: number; of: number } }) {
  const up = (delta ?? 0) >= 0;
  const sharePct = share ? Math.round((share.n / Math.max(1, share.of)) * 100) : 0;
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={TINTED_CARD}>
        <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <StatIcon className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />{label}
        </span>
        <span className="flex items-baseline gap-[8px]">
          <span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
          {typeof delta === "number" && (
            // Direction in words and an arrow, not green/red: the chart
            // family stays blue; a fall is still worth reading calmly.
            <span className="flex items-center gap-[3px] text-[12px] font-bold tabular-nums whitespace-nowrap" style={{ color: up ? "var(--primary)" : "#F5A623" }}>
              {up ? <ArrowUpRight className="h-[13px] w-[13px]" aria-hidden /> : <ArrowDownRight className="h-[13px] w-[13px]" aria-hidden />}{up ? "+" : ""}{delta}%
            </span>
          )}
        </span>
        <span className="mt-auto flex items-end justify-between gap-[10px]">
          {series ? (
            <>
              <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>vs {prevLabel}</span>
              <Sparkline values={series} />
            </>
          ) : share ? (
            <span className="flex w-full flex-col gap-[6px]">
              <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{sharePct}% of {share.of} students</span>
              <span className="relative block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }} aria-hidden>
                <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={{ width: "0%" }} animate={{ width: `${sharePct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${TOTAL_COLOR} 40%, transparent), ${TOTAL_COLOR})` }} />
              </span>
            </span>
          ) : null}
        </span>
      </div>
    </HoverBeam>
  );
}

const INTERVENTION_BY_GRADE = [
  { grade: 9, count: 3 },
  { grade: 10, count: 2 },
  { grade: 11, count: 4 },
  { grade: 12, count: 3 },
];

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
const UNIQUE_COLOR = "#9BA8FB";

// Rebuilt 26 Sept 2026 (direct feedback: "the logins by month is better in
// replit... everything in that graph seems squished down"). The old SVG
// stretched a 600x220 drawing to the card with preserveAspectRatio="none",
// flattening the curve and smearing the text; this one measures its own
// width and draws at real pixels, 280 tall. From the reference: smooth
// curves, a labelled y-axis on round steps, a dot on every month, the
// unique line in its own green so the two series never read as one. Ours
// adds a soft area under the total, lines that draw in on load, and a
// hover column that reads all three of the month's numbers at once.
function LoginsChart() {
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
  const step = 50;
  const max = Math.ceil(Math.max(...MONTHS.map((m) => m.total)) / step) * step;
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
          <svg width={W} height={H} role="img" aria-label="Total logins and unique student logins by month" className="block overflow-visible">
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
                <text x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === MONTHS.length - 1 ? "end" : "middle"} style={{ fontSize: 11.5, fontWeight: 600, fill: hover === i ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{m.label}</text>
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
  // The District Administrator's Engagement leads with the schools compared
  // (seeded siblings, counselorOrg.ts); Lincoln's own month-by-month detail
  // follows. A school role sees Lincoln only.
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const district = account.role === "District Administrator";
  const roster = useReviewedRoster();
  const schools = district ? districtSchools(roster).slice().sort((a, b) => a.activePct - b.activePct) : [];
  const reach = schools.filter((s) => s.activePct >= SCHOOL_TARGETS.activeStudents).length;
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
      {/* Each stat with its direction (direct feedback, 26 Sept 2026: "no
         trends signal to see growth"). The two monthly figures have six
         months of history, so they carry a sparkline and the change from
         last month; weekly and daily have no history here, so they show
         their share of the caseload instead of an invented trend. */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        <EngagementStat icon={LogIn} value={String(LATEST.unique)} label="Active this month" series={MONTHS.map((m) => m.unique)} prevLabel={PREV.label} delta={pctChange(LATEST.unique, PREV.unique)} />
        <EngagementStat icon={Users} value={String(WEEKLY_ACTIVE)} label="Active weekly" share={{ n: WEEKLY_ACTIVE, of: roster.length }} />
        <EngagementStat icon={CalendarDays} value={String(DAILY_ACTIVE)} label="Active daily" share={{ n: DAILY_ACTIVE, of: roster.length }} />
        <EngagementStat icon={TrendingUp} value={LATEST.avg.toFixed(2)} label="Logins per student" series={MONTHS.map((m) => m.avg)} prevLabel={PREV.label} delta={pctChange(LATEST.avg, PREV.avg)} />
      </div>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <span className="flex flex-col gap-[2px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Logins by month <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{DEMO_SCHOOL}, this academic year</span></h2>
          </span>
          <LoginsChart />
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>By month</h2>
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
                {[...MONTHS].reverse().map((m, i) => (
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
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <span className="flex flex-col gap-[2px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Students to check in with <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>by grade</span></h2>
          </span>
          <div className="grid grid-cols-4 items-end gap-[var(--space-4)] px-[var(--space-2)]" style={{ height: 140 }}>
            {INTERVENTION_BY_GRADE.map((g) => (
              <div key={g.grade} className="flex h-full flex-col items-center justify-end gap-[8px]">
                <span className="text-[13px] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{g.count}</span>
                <span className="w-full max-w-[64px] rounded-t-[6px]" style={{ height: `${(g.count / 4) * 88}px`, background: "linear-gradient(180deg, var(--primary), color-mix(in srgb, var(--primary) 55%, transparent))" }} />
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {g.grade}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{INTERVENTION_BY_GRADE.reduce((a, g) => a + g.count, 0)} students in all</p>
        </div>
      </HoverBeam>
    </div>
  );
}
