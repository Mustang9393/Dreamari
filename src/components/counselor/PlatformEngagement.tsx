"use client";

import { useMemo } from "react";
import { LogIn, Users, CalendarDays, TrendingUp } from "lucide-react";
import { AreaChart, MetricTile, demoSeries } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster, DEMO_SCHOOL } from "@/lib/counselorRoster";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

export function PlatformEngagement() {
  const roster = useMemo(() => getRoster(), []);
  const monthly = useMemo(() => demoSeries("counselor-engagement", 6, 180), []);
  const totalLogins = monthly.reduce((a, b) => a + b, 0);
  const uniqueStudents = Math.min(roster.length, Math.round(monthly[monthly.length - 1] * 0.33));
  const dailyActive = Math.round(uniqueStudents * 0.26);
  const avgLogins = (totalLogins / Math.max(1, roster.length)).toFixed(2);

  const monthLabels = ["Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"];

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={LogIn} value={String(monthly[monthly.length - 1])} label={`Monthly Active Students · unique logins in Sep 2026`} accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={Users} value={String(uniqueStudents)} label="Weekly Active Students · avg unique students per week" accent="#33C78C" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={CalendarDays} value={String(dailyActive)} label="Daily Active Students · avg unique students per day" accent="#F5A623" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={TrendingUp} value={avgLogins} label="Avg Logins / Student · per student, this academic year" accent="#EC5FA6" /></div></HoverBeam>
      </div>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <span className="flex flex-col gap-[2px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Current Academic Year · Logins by Month</h2>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{DEMO_SCHOOL} · Current Academic Year</span>
          </span>
          <AreaChart points={monthly} accent="#2F6BF2" labels={[monthLabels[0], monthLabels[Math.floor(monthLabels.length / 2)], monthLabels[monthLabels.length - 1]]} />
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Monthly Login Summary</h2>
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
                {monthLabels.map((m, i) => (
                  <tr key={m} className="border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                    <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: i === monthLabels.length - 1 ? "var(--primary)" : "var(--foreground)" }}>{m}</td>
                    <td className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{monthly[i] * 3}</td>
                    <td className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{monthly[i]}</td>
                    <td className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{(monthly[i] * 3 / Math.max(1, monthly[i])).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HoverBeam>
    </div>
  );
}
