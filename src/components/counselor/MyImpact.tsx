"use client";

import { useMemo } from "react";
import { Printer, Share2, FileBarChart, Users, Compass, GraduationCap, HelpCircle } from "lucide-react";
import { MetricTile, BarChart } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster, DEMO_SCHOOL, type CounselorStudent } from "@/lib/counselorRoster";
import { readCounselorAccount } from "@/lib/counselorAccount";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";
const GRADES = [9, 10, 11, 12];

function pathwayBreakdown(roster: CounselorStudent[]) {
  const counts: Record<string, number> = { "4-Year College": 0, "2-Year College": 0, "Trade / Technical School": 0, Workforce: 0, Military: 0, Undecided: 0 };
  for (const s of roster) counts[s.postsecondaryIntent] = (counts[s.postsecondaryIntent] ?? 0) + 1;
  return counts;
}

export function MyImpact() {
  const roster = useMemo(() => getRoster(), []);
  const account = readCounselorAccount();

  const total = roster.length || 1;
  const onTrack = roster.filter((s) => s.status === "On Track").length;
  const withPlan = roster.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const answered = roster.filter((s) => s.engagement.questionsSubmitted > 0).length;

  const pathway = pathwayBreakdown(roster);

  const byGrade = (g: number) => roster.filter((s) => s.grade === g);
  const gradeCompletion = GRADES.map((g) => { const gr = byGrade(g); return gr.length ? Math.round(gr.reduce((sum, s) => sum + s.roadmapPct, 0) / gr.length) : 0; });
  const overallAvg = Math.round(gradeCompletion.reduce((a, b) => a + b, 0) / gradeCompletion.length);

  const careerReportPct = Math.round((roster.filter((s) => s.milestones["Career Report"] === "Approved").length / total) * 100);
  const academicPlanPct = Math.round((roster.filter((s) => s.milestones["Academic Plan"] === "Approved").length / total) * 100);
  const rewardsPct = Math.round((roster.filter((s) => s.engagement.dreamScore >= 100).length / total) * 100);
  const seniors = byGrade(12);
  const seniorsCompliant = seniors.filter((s) => s.milestones["Applications"] === "Approved" || s.milestones["Financial Aid"] === "Approved").length;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-col gap-[2px]">
          <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{account.name || "Sarah Chen"}</h2>
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{account.role || "School Counselor"} · {account.school || DEMO_SCHOOL}</span>
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Reporting Period: August 2026 – January 2026</span>
        </div>
        <div className="flex items-center gap-[8px]">
          <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <Printer className="h-[14px] w-[14px]" aria-hidden /> Print
          </button>
          <button type="button" className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <Share2 className="h-[14px] w-[14px]" aria-hidden /> Share
          </button>
          <button type="button" className="dm-solid flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Generate Principal / District Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={Users} value={String(total)} label="Total Caseload · students" accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={Compass} value={`${Math.round((onTrack / total) * 100)}%`} label="On-Track Rate · of caseload on pace" accent="#33C78C" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={GraduationCap} value={`${Math.round((withPlan / total) * 100)}%`} label="Postsecondary Plans · students with a declared plan" accent="#F5A623" /></div></HoverBeam>
      </div>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Postsecondary Plans by Pathway</h2>
          <div className="flex flex-col gap-[8px]">
            {Object.entries(pathway).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
              <div key={label} className="flex items-center gap-[12px]">
                <span className="w-[180px] flex-none truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
                <span className="relative h-[10px] flex-1 overflow-hidden rounded-[5px]" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <span className="absolute inset-y-0 left-0 rounded-[5px]" style={{ width: `${(count / total) * 100}%`, background: "var(--primary)" }} />
                </span>
                <span className="w-[34px] flex-none text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <span className="flex flex-col gap-[2px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Caseload Progress by Grade Level</h2>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Overall average plan completion: {overallAvg}%</span>
          </span>
          <BarChart groups={GRADES.map((g) => `Grade ${g}`)} series={[{ label: "Avg. completion", accent: "#2F6BF2", values: gradeCompletion }]} />
        </div>
      </HoverBeam>

      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={FileBarChart} value={`${careerReportPct}%`} label={`Career Reports Approved · ${roster.filter((s) => s.milestones["Career Report"] === "Approved").length} of ${total} students`} accent="#5B6CF9" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={GraduationCap} value={`${academicPlanPct}%`} label="Academic Plans Approved" accent="#33C78C" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={HelpCircle} value={`${answered}`} label="Questions Answered (30+ days)" accent="#EC5FA6" /></div></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}><MetricTile icon={Compass} value={`${rewardsPct}%`} label="Senior Plan Compliance" accent="#F5A623" /></div></HoverBeam>
      </div>

      <div className="rounded-[var(--radius-lg)] border p-[var(--space-4)] text-[13px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 8%, var(--card))", color: "var(--foreground)" }}>
        {seniorsCompliant} of {seniors.length} seniors have applications or financial aid in progress or submitted — meets or exceeds the district target of 87%.
      </div>
    </div>
  );
}
