"use client";

// DEMO-ONLY v2 fork of ../PlatformEngagement.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useId } from "react";
import { LogIn, Users, CalendarDays, TrendingUp } from "lucide-react";
import { MetricTile } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";

import { GLASS_CARD as TINTED_CARD } from "../surfaces";

// Copied verbatim off the live reference (all 6 months of the login table,
// the 4 headline stats, and the per-grade intervention bars) -- this
// screen's numbers are fixed content, not derived from the seeded roster,
// same as Milestone Tracker's grade data. Month labels shifted to this
// app's own "today" convention (the rest of the dashboard dates itself in
// Sep 2026) while keeping the reference's exact values in the same
// chronological order.
const MONTHS = [
  { label: "Apr 2026", total: 298, unique: 91, avg: 3.27 },
  { label: "May 2026", total: 441, unique: 112, avg: 3.94 },
  { label: "Jun 2026", total: 193, unique: 74, avg: 2.61 },
  { label: "Jul 2026", total: 267, unique: 88, avg: 3.03 },
  { label: "Aug 2026", total: 158, unique: 55, avg: 2.87 },
  { label: "Sep 2026", total: 214, unique: 71, avg: 3.01 },
];
const LATEST = MONTHS[MONTHS.length - 1];
const WEEKLY_ACTIVE = 42;

const INTERVENTION_BY_GRADE = [
  { grade: 9, count: 3 },
  { grade: 10, count: 2 },
  { grade: 11, count: 4 },
  { grade: 12, count: 3 },
];

function LoginsChart() {
  const id = useId().replace(/:/g, "");
  const W = 600;
  const H = 220;
  const padX = 16;
  const padTop = 20;
  const padBottom = 24;
  const max = Math.max(...MONTHS.map((m) => m.total));
  const x = (i: number) => padX + (i / (MONTHS.length - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - v / max) * (H - padTop - padBottom);
  const lineFor = (key: "total" | "unique") => MONTHS.map((m, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(m[key]).toFixed(1)}`).join(" ");

  return (
    <figure className="m-0 flex flex-col gap-[10px]">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Total logins and unique student logins by month" className="h-auto w-full overflow-visible" preserveAspectRatio="none" style={{ height: H }}>
        <defs>
          <linearGradient id={`pe-total-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5B6CF9" stopOpacity="0.7" /><stop offset="100%" stopColor="#5B6CF9" /></linearGradient>
          <linearGradient id={`pe-unique-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#9BA8FB" stopOpacity="0.7" /><stop offset="100%" stopColor="#9BA8FB" /></linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={padX} x2={W - padX} y1={padTop + t * (H - padTop - padBottom)} y2={padTop + t * (H - padTop - padBottom)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        <path d={lineFor("total")} fill="none" stroke={`url(#pe-total-${id})`} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 6px rgba(91,108,249,0.5))" }} />
        <path d={lineFor("unique")} fill="none" stroke={`url(#pe-unique-${id})`} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 6px rgba(155,168,251,0.5))" }} />
        {MONTHS.map((m, i) => (
          <g key={m.label}>
            <circle cx={x(i)} cy={y(m.total)} r="4.5" fill="#5B6CF9" stroke="#0e0c20" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <circle cx={x(i)} cy={y(m.unique)} r="4.5" fill="#9BA8FB" stroke="#0e0c20" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
        {MONTHS.map((m, i) => (
          <text key={m.label} x={x(i)} y={H - 6} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 600, fill: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{m.label}</text>
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-[16px] gap-y-[4px]">
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] flex-none rounded-[2px]" style={{ background: "#5B6CF9" }} />Total Logins</span>
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] flex-none rounded-[2px]" style={{ background: "#9BA8FB" }} />Unique Student Logins</span>
      </div>
    </figure>
  );
}

export function PlatformEngagement() {
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={LogIn} value={String(LATEST.unique)} label="Active this month" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={Users} value={String(WEEKLY_ACTIVE)} label="Active weekly" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={CalendarDays} value="18" label="Active daily" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={TrendingUp} value={LATEST.avg.toFixed(2)} label="Logins per student" accent="#5B6CF9" /></div></HoverBeam>
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
