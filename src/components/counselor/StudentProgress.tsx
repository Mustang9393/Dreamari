"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, FileDown, FileText, ClipboardCheck, FileBadge, School, Send, DollarSign, GraduationCap, ClipboardList, AlertTriangle } from "lucide-react";
import { BarChart } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster, type MilestoneKey } from "@/lib/counselorRoster";
import { INTEREST_WORLDS } from "@/components/build/types";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

type ReportType = { id: string; label: string; icon: typeof FileText; milestone?: MilestoneKey };

const REPORT_TYPES: ReportType[] = [
  { id: "career-report", label: "Career Report Completion", icon: FileText, milestone: "Career Report" },
  { id: "academic-plan", label: "Academic Plan Completion", icon: ClipboardCheck, milestone: "Academic Plan" },
  { id: "resume", label: "Resume Completion", icon: FileBadge, milestone: "Resume" },
  { id: "college-list", label: "College List Progress", icon: School, milestone: "College List" },
  { id: "applications", label: "Application Progress", icon: Send, milestone: "Applications" },
  { id: "financial-aid", label: "Financial Aid Progress", icon: DollarSign, milestone: "Financial Aid" },
  { id: "postsecondary", label: "Postsecondary Plans", icon: GraduationCap },
  { id: "review-activity", label: "Counselor Review Activity", icon: ClipboardList },
  { id: "intervention", label: "Students Needing Intervention", icon: AlertTriangle },
];

const GRADES = [9, 10, 11, 12];

const PATHWAY_OPTIONS = ["All Pathways", ...INTEREST_WORLDS.map((w) => w.label)];

export function StudentProgress() {
  const [reportId, setReportId] = useState(REPORT_TYPES[0].id);
  const [gradeLevel, setGradeLevel] = useState("All Grades");
  const [pathway, setPathway] = useState("All Pathways");
  const report = REPORT_TYPES.find((r) => r.id === reportId)!;
  const roster = useMemo(() => {
    let list = getRoster();
    if (gradeLevel !== "All Grades") list = list.filter((s) => String(s.grade) === gradeLevel);
    if (pathway !== "All Pathways") list = list.filter((s) => s.careerTrack === pathway);
    return list;
  }, [gradeLevel, pathway]);

  const byGrade = useCallback((g: number) => roster.filter((s) => s.grade === g), [roster]);

  const chartData = useMemo(() => {
    if (report.id === "postsecondary") {
      return { groups: GRADES.map((g) => `Gr. ${g}`), series: [{ label: "With Plan", accent: "#5B6CF9", values: GRADES.map((g) => { const gr = byGrade(g); return gr.length ? (gr.filter((s) => s.postsecondaryIntent !== "Undecided").length / gr.length) * 100 : 0; }) }] };
    }
    if (report.id === "review-activity") {
      return { groups: GRADES.map((g) => `Gr. ${g}`), series: [{ label: "Approved this period", accent: "#33C78C", values: GRADES.map((g) => byGrade(g).length * 2.3) }] };
    }
    if (report.id === "intervention") {
      return { groups: GRADES.map((g) => `Gr. ${g}`), series: [{ label: "Needs Attention / At Risk", accent: "#E0453C", values: GRADES.map((g) => { const gr = byGrade(g); return gr.length ? (gr.filter((s) => s.status !== "On Track").length / gr.length) * 100 : 0; }) }] };
    }
    const key = report.milestone!;
    return { groups: GRADES.map((g) => `Gr. ${g}`), series: [{ label: "Approved", accent: "#5B6CF9", values: GRADES.map((g) => { const gr = byGrade(g); return gr.length ? (gr.filter((s) => s.milestones[key] === "Approved").length / gr.length) * 100 : 0; }) }] };
  }, [report, byGrade]);

  const exportCsv = () => {
    const rows = [["Grade", ...chartData.series.map((s) => s.label)], ...chartData.groups.map((g, i) => [g, ...chartData.series.map((s) => String(Math.round(s.values[i])))])];
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
                <button type="button" onClick={exportCsv} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
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

        <HoverBeam strength={0.6} className="h-full">
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <h2 className="text-[16px] font-bold" style={{ color: "var(--foreground)" }}>{report.label}</h2>
            <BarChart groups={chartData.groups} series={chartData.series} valueSuffix={report.id === "review-activity" ? "" : "%"} max={report.id === "review-activity" ? Math.max(...chartData.series[0].values, 10) : 100} />
          </div>
        </HoverBeam>

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
                  <tr>
                    <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: "var(--foreground)" }}>{report.label}</td>
                    {chartData.groups.map((_, i) => <td key={i} className="px-[var(--space-3)] py-[10px] text-right tabular-nums" style={{ color: "var(--foreground)" }}>{Math.round(chartData.series[0].values[i])}{report.id === "review-activity" ? "" : "%"}</td>)}
                    <td className="px-[var(--space-3)] py-[10px] text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{Math.round(chartData.series[0].values.reduce((a, b) => a + b, 0) / chartData.series[0].values.length)}{report.id === "review-activity" ? "" : "%"}</td>
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
