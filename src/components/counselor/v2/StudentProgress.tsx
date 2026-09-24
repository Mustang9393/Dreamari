"use client";

// DEMO-ONLY v2 fork of ../StudentProgress.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useCallback, useMemo, useState } from "react";
import { Download, FileDown, FileText, ClipboardCheck, FileBadge, School, Send, DollarSign, GraduationCap, ClipboardList, AlertTriangle } from "lucide-react";
import { BarChart } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { INTEREST_WORLDS } from "@/components/build/types";

import { GLASS_CARD as TINTED_CARD } from "../surfaces";

// Each report's chart shape and category set is copied from the reference
// (all 9 report types clicked through live) -- a genuinely different
// taxonomy per report, not one generic "% approved by grade" chart reused
// everywhere. Two reports (Application Progress, Financial Aid Progress)
// render no chart at all on the reference -- same here, table only.
type ChartSpec = { title: string; categories: string[]; colors: string[]; values: (roster: CounselorStudent[]) => number[]; max: number; suffix?: string } | null;

const STATUS_COLORS: Record<string, string> = {
  approved: "#33C78C",
  "pending review": "#5B6CF9",
  "in progress": "#F5A623",
  "not started": "#5B6470",
  overdue: "#E0453C",
};

function countByStatus(roster: CounselorStudent[], key: MilestoneKey, fold: Partial<Record<MilestoneStatus, string>>): (categories: string[]) => number[] {
  const counts = new Map<string, number>();
  for (const s of roster) {
    const status = s.milestones[key];
    const bucket = fold[status];
    if (bucket) counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  return (categories) => categories.map((c) => counts.get(c) ?? 0);
}

type ReportType = { id: string; label: string; icon: typeof FileText; gradeMin?: number; chart: (roster: CounselorStudent[]) => ChartSpec };

const REPORT_TYPES: ReportType[] = [
  {
    id: "career-report", label: "Career Report Completion", icon: FileText,
    chart: (roster) => {
      const categories = ["approved", "pending review", "in progress", "overdue"];
      const tally = countByStatus(roster, "Career Report", { Approved: "approved", "Pending Review": "pending review", "In Progress": "in progress", "Changes Requested": "overdue", "Not Started": "overdue" });
      return { title: "Career Report Completion", categories, colors: categories.map((c) => STATUS_COLORS[c]), values: () => tally(categories), max: Math.max(1, roster.length) };
    },
  },
  {
    id: "academic-plan", label: "Academic Plan Completion", icon: ClipboardCheck,
    chart: (roster) => {
      const categories = ["approved", "pending review", "in progress", "not started", "overdue"];
      const tally = countByStatus(roster, "Academic Plan", { Approved: "approved", "Pending Review": "pending review", "In Progress": "in progress", "Not Started": "not started", "Changes Requested": "overdue" });
      return { title: "Academic Plan Completion", categories, colors: categories.map((c) => STATUS_COLORS[c]), values: () => tally(categories), max: Math.max(1, roster.length) };
    },
  },
  {
    id: "resume", label: "Resume Completion", icon: FileBadge, gradeMin: 10,
    chart: (roster) => {
      const categories = ["approved", "pending review", "in progress", "not started"];
      const tally = countByStatus(roster, "Resume", { Approved: "approved", "Pending Review": "pending review", "In Progress": "in progress", "Changes Requested": "in progress", "Not Started": "not started" });
      return { title: "Resume Completion (Grade 10+)", categories, colors: categories.map((c) => STATUS_COLORS[c]), values: () => tally(categories), max: Math.max(1, roster.length) };
    },
  },
  {
    id: "college-list", label: "College List Progress", icon: School, gradeMin: 11,
    chart: (roster) => {
      const categories = ["approved", "in progress", "not started"];
      const tally = countByStatus(roster, "College List", { Approved: "approved", "Pending Review": "in progress", "In Progress": "in progress", "Changes Requested": "in progress", "Not Started": "not started" });
      return { title: "College List (Grade 11+)", categories, colors: categories.map((c) => STATUS_COLORS[c]), values: () => tally(categories), max: Math.max(1, roster.length) };
    },
  },
  { id: "applications", label: "Application Progress", icon: Send, chart: () => null },
  { id: "financial-aid", label: "Financial Aid Progress", icon: DollarSign, chart: () => null },
  {
    id: "postsecondary", label: "Postsecondary Plans", icon: GraduationCap,
    chart: (roster) => {
      const categories = ["4-Year College", "Undecided", "Trade/Technical School", "2-Year College"];
      const counts = new Map<string, number>();
      for (const s of roster) {
        const bucket = s.postsecondaryIntent === "Trade / Technical School" ? "Trade/Technical School"
          : s.postsecondaryIntent === "Workforce" || s.postsecondaryIntent === "Military" ? "Undecided"
          : s.postsecondaryIntent;
        counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
      }
      const colors = ["#5B6CF9", "#5B6470", "#F5A623", "#4AB8D8"];
      return { title: "Postsecondary Plans", categories, colors, values: () => categories.map((c) => counts.get(c) ?? 0), max: Math.max(1, roster.length) };
    },
  },
  {
    id: "review-activity", label: "Counselor Review Activity", icon: ClipboardList,
    chart: (roster) => {
      const categories = ["Resume Draft", "Career Report", "Academic Plan", "Career Report - Revised", "Academic Plan - Revised"];
      const values = [
        roster.filter((s) => s.milestones.Resume === "Pending Review").length,
        roster.filter((s) => s.milestones["Career Report"] === "Pending Review").length,
        roster.filter((s) => s.milestones["Academic Plan"] === "Pending Review").length,
        roster.filter((s) => s.milestones["Career Report"] === "Changes Requested").length,
        roster.filter((s) => s.milestones["Academic Plan"] === "Changes Requested").length,
      ];
      const colors = ["#5B6CF9", "#33C78C", "#4AB8D8", "#F5A623", "#7C5CFA"];
      return { title: "Counselor Review Activity", categories, colors, values: () => values, max: Math.max(4, ...values) };
    },
  },
  {
    id: "intervention", label: "Students Needing Intervention", icon: AlertTriangle,
    chart: (roster) => {
      const grades = [9, 10, 11, 12];
      const values = grades.map((g) => roster.filter((s) => s.grade === g && s.status === "At Risk").length);
      return { title: "Students Needing Intervention", categories: grades.map((g) => `Grade ${g}`), colors: grades.map(() => "#E0453C"), values: () => values, max: Math.max(4, ...values) };
    },
  },
];

const GRADES = [9, 10, 11, 12];

const PATHWAY_OPTIONS = ["All Pathways", ...INTEREST_WORLDS.map((w) => w.label)];

export function StudentProgress() {
  const [reportId, setReportId] = useState(REPORT_TYPES[0].id);
  const [gradeLevel, setGradeLevel] = useState("All Grades");
  const [pathway, setPathway] = useState("All Pathways");
  const report = REPORT_TYPES.find((r) => r.id === reportId)!;

  const fullRoster = useReviewedRoster();
  const roster = useMemo(() => {
    let list = fullRoster;
    if (gradeLevel !== "All Grades") list = list.filter((s) => String(s.grade) === gradeLevel);
    if (pathway !== "All Pathways") list = list.filter((s) => s.careerTrack === pathway);
    return list;
  }, [fullRoster, gradeLevel, pathway]);

  const byGrade = useCallback((g: number) => roster.filter((s) => s.grade === g), [roster]);

  const reportRoster = report.gradeMin ? roster.filter((s) => s.grade >= report.gradeMin!) : roster;
  const chart = useMemo(() => report.chart(reportRoster), [report, reportRoster]);
  const chartValues = chart ? chart.values(reportRoster) : [];

  const exportCsv = () => {
    if (!chart) return;
    const rows = [["Category", "Students"], ...chart.categories.map((c, i) => [c, String(Math.round(chartValues[i] ?? 0))])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[300px_1fr]">
      <div className="flex flex-col gap-[6px]">
        <span className="px-[4px] text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Report Types</span>
        {REPORT_TYPES.map((r) => {
          const Icon = r.icon;
          const on = r.id === reportId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setReportId(r.id)}
              className="dm-quiet flex cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-left text-[13px] font-semibold"
              style={{ background: on ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              <Icon className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: on ? "var(--primary)" : "var(--muted-foreground)" }} />
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-[var(--space-4)]">
        <HoverBeam strength={0.6} className="h-full">
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
              <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Report Filters</span>
              <div className="flex items-center gap-[8px]">
                <button type="button" onClick={exportCsv} disabled={!chart} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <Download className="h-[14px] w-[14px]" aria-hidden /> CSV
                </button>
                <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <FileDown className="h-[14px] w-[14px]" aria-hidden /> PDF
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
              <label className="flex flex-col gap-[4px]">
                <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Grade Level</span>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="h-10 cursor-pointer rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <option style={{ color: "#000" }}>All Grades</option>
                  {GRADES.map((g) => <option key={g} value={String(g)} style={{ color: "#000" }}>Grade {g}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-[4px]">
                <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Career Pathway</span>
                <select value={pathway} onChange={(e) => setPathway(e.target.value)} className="h-10 cursor-pointer rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  {PATHWAY_OPTIONS.map((p) => <option key={p} value={p} style={{ color: "#000" }}>{p}</option>)}
                </select>
              </label>
            </div>
          </div>
        </HoverBeam>

        {chart && (
          <HoverBeam strength={0.6} className="h-full">
            <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <div className="flex flex-col gap-[2px]">
                <h2 className="text-[16px] font-bold" style={{ color: "var(--foreground)" }}>{chart.title}</h2>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{reportRoster.length} students shown</span>
              </div>
              <BarChart groups={chart.categories} series={[{ label: report.label, accent: chart.colors[0], values: chartValues }]} barColors={chart.colors} max={chart.max} valueSuffix="" />
            </div>
          </HoverBeam>
        )}

        <HoverBeam strength={0.6} className="h-full">
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Summary by Grade</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                    <th className="px-[var(--space-3)] py-[10px] text-left font-bold" style={{ color: "var(--muted-foreground)" }}>Metric</th>
                    {GRADES.map((g) => <th key={g} className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Grade {g}</th>)}
                    <th className="px-[var(--space-3)] py-[10px] text-right font-bold" style={{ color: "var(--muted-foreground)" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                    <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: "var(--foreground)" }}>Total Students</td>
                    {GRADES.map((g) => <td key={g} className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{byGrade(g).length}</td>)}
                    <td className="px-[var(--space-3)] py-[10px] text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{roster.length}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                    <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: "var(--foreground)" }}>On Track</td>
                    {GRADES.map((g) => <td key={g} className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "#33C78C" }}>{byGrade(g).filter((s) => s.status === "On Track").length}</td>)}
                    <td className="px-[var(--space-3)] py-[10px] text-right font-bold tabular-nums" style={{ color: "#33C78C" }}>{roster.filter((s) => s.status === "On Track").length}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                    <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: "var(--foreground)" }}>Needs Attention</td>
                    {GRADES.map((g) => <td key={g} className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "#F5A623" }}>{byGrade(g).filter((s) => s.status === "Needs Attention").length}</td>)}
                    <td className="px-[var(--space-3)] py-[10px] text-right font-bold tabular-nums" style={{ color: "#F5A623" }}>{roster.filter((s) => s.status === "Needs Attention").length}</td>
                  </tr>
                  <tr>
                    <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: "var(--foreground)" }}>At Risk</td>
                    {GRADES.map((g) => <td key={g} className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "#E0453C" }}>{byGrade(g).filter((s) => s.status === "At Risk").length}</td>)}
                    <td className="px-[var(--space-3)] py-[10px] text-right font-bold tabular-nums" style={{ color: "#E0453C" }}>{roster.filter((s) => s.status === "At Risk").length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </HoverBeam>
      </div>
    </div>
  );
}
