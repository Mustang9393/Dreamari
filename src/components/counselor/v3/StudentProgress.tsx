"use client";

// DEMO-ONLY v2 fork of ../StudentProgress.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useCounselorFilters } from "../shell";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { Download, FileDown, FileText, ClipboardCheck, FileBadge, School, Send, DollarSign, GraduationCap, ClipboardList, AlertTriangle } from "lucide-react";
import { DonutCard } from "./Overview";
import { Disclosure } from "./Disclosure";
import { DrillPanel, type Drill } from "./Drill";
import { BarChart } from "@/components/connect/viz";
import { SubTabs } from "./SubTabs";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Listbox } from "@/components/app/Listbox";
import { type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { CAREER_TRACKS } from "@/lib/counselorRoster";

import { GLASS_CARD as TINTED_CARD } from "../surfaces";
import { CHART_STAGE, CHART_STATUS, NEUTRAL_SLICE, PRIMARY } from "../palette";

// Each report's chart shape and category set is copied from the reference
// (all 9 report types clicked through live) -- a genuinely different
// taxonomy per report, not one generic "% approved by grade" chart reused
// everywhere. Two reports (Application Progress, Financial Aid Progress)
// render no chart at all on the reference -- same here, grade summary only.
// 2 Oct 2026 redundancy pass: each category now carries its students, so a
// legend row opens them. `share` reports split the caseload into parts of
// one whole (a ring); `count` reports tally things that are not one whole
// (reviews waiting, At Risk by grade) and stay columns.
type ChartSpec = { title: string; kind: "share" | "count"; categories: string[]; colors: string[]; buckets: CounselorStudent[][]; max: number; note?: (s: CounselorStudent) => string } | null;

// One chart family (palette.ts CHART_STAGE): blue by how far along, red
// only for overdue.
const STATUS_COLORS = CHART_STAGE;

function bucketByStatus(roster: CounselorStudent[], key: MilestoneKey, fold: Partial<Record<MilestoneStatus, string>>, categories: string[]): CounselorStudent[][] {
  return categories.map((c) => roster.filter((s) => fold[s.milestones[key]] === c));
}

function milestoneShare(title: string, key: MilestoneKey, categories: string[], fold: Partial<Record<MilestoneStatus, string>>) {
  return (roster: CounselorStudent[]): ChartSpec => ({ title, kind: "share", categories, colors: categories.map((c) => STATUS_COLORS[c]), buckets: bucketByStatus(roster, key, fold, categories), max: Math.max(1, roster.length), note: (s) => s.milestones[key] });
}

type ReportType = { id: string; label: string; icon: typeof FileText; gradeMin?: number; chart: (roster: CounselorStudent[]) => ChartSpec };

const REPORT_TYPES: ReportType[] = [
  { id: "career-report", label: "Career Report", icon: FileText, chart: milestoneShare("Career Report Completion", "Career Report", ["approved", "pending review", "in progress", "overdue"], { Approved: "approved", Completed: "approved", "Pending Review": "pending review", "In Progress": "in progress", Overdue: "overdue", "Changes Requested": "overdue", "Not Started": "overdue" }) },
  { id: "academic-plan", label: "Academic Plan", icon: ClipboardCheck, chart: milestoneShare("Academic Plan Completion", "Academic Plan", ["approved", "pending review", "in progress", "not started", "overdue"], { Approved: "approved", Completed: "approved", "Pending Review": "pending review", "In Progress": "in progress", "Not Started": "not started", Overdue: "overdue", "Changes Requested": "overdue" }) },
  { id: "resume", label: "Resume", icon: FileBadge, gradeMin: 10, chart: milestoneShare("Resume Completion (Grade 10+)", "Resume", ["approved", "pending review", "in progress", "not started"], { Approved: "approved", Completed: "approved", "Pending Review": "pending review", "In Progress": "in progress", "Changes Requested": "in progress", Overdue: "not started", "Not Started": "not started" }) },
  { id: "college-list", label: "College List", icon: School, gradeMin: 11, chart: milestoneShare("College List (Grade 11+)", "College List", ["approved", "in progress", "not started"], { Approved: "approved", Completed: "approved", "Pending Review": "in progress", "In Progress": "in progress", "Changes Requested": "in progress", Overdue: "not started", "Not Started": "not started" }) },
  { id: "applications", label: "Applications", icon: Send, chart: () => null },
  { id: "financial-aid", label: "Financial Aid", icon: DollarSign, chart: () => null },
  {
    id: "postsecondary", label: "Plans", icon: GraduationCap,
    chart: (roster) => {
      const categories = ["4-Year College", "Undecided", "Trade/Technical School", "2-Year College"];
      const bucketOf = (s: CounselorStudent) => s.postsecondaryIntent === "Workforce" || s.postsecondaryIntent === "Military" ? "Undecided" : s.postsecondaryIntent;
      const colors = [PRIMARY, NEUTRAL_SLICE, "var(--cd-blue-soft)", "var(--cd-blue-pale)"];
      return { title: "Postsecondary Plans", kind: "share", categories, colors, buckets: categories.map((c) => roster.filter((s) => bucketOf(s) === c)), max: Math.max(1, roster.length), note: (s) => s.postsecondaryIntent };
    },
  },
  {
    // The "Revised" columns (Changes Requested) live only here: keep them.
    id: "review-activity", label: "Reviews", icon: ClipboardList,
    chart: (roster) => {
      const categories = ["Resume Draft", "Career Report", "Academic Plan", "Career Report - Revised", "Academic Plan - Revised"];
      const buckets = [
        roster.filter((s) => s.milestones.Resume === "Pending Review"),
        roster.filter((s) => s.milestones["Career Report"] === "Pending Review"),
        roster.filter((s) => s.milestones["Academic Plan"] === "Pending Review"),
        roster.filter((s) => s.milestones["Career Report"] === "Changes Requested"),
        roster.filter((s) => s.milestones["Academic Plan"] === "Changes Requested"),
      ];
      return { title: "Counselor Review Activity", kind: "count", categories, colors: categories.map(() => PRIMARY), buckets, max: Math.max(4, ...buckets.map((b) => b.length)) };
    },
  },
  {
    id: "intervention", label: "Intervention", icon: AlertTriangle,
    chart: (roster) => {
      const grades = [9, 10, 11, 12];
      const buckets = grades.map((g) => roster.filter((s) => s.grade === g && s.status === "At Risk"));
      return { title: "Students Needing Intervention", kind: "count", categories: grades.map((g) => `Grade ${g}`), colors: grades.map(() => PRIMARY), buckets, max: Math.max(4, ...buckets.map((b) => b.length)) };
    },
  },
];

const GRADES = [9, 10, 11, 12];

// DEMO-ONLY: the Replit's "Students to check in with" by grade (3/2/4/3,
// 12 in all), verbatim. It used to be a card on Platform Engagement, where
// it sat beside this screen's roster-computed At Risk count and the two
// disagreed (2 Oct 2026 redundancy pass). It now lives in a closed fold
// under Intervention, labelled as check-ins, so the reference figure stays
// reachable without contradicting the chart.
const CHECK_INS_BY_GRADE = [
  { grade: 9, count: 3 },
  { grade: 10, count: 2 },
  { grade: 11, count: 4 },
  { grade: 12, count: 3 },
];

const SUMMARY_STATUSES = ["On Track", "Needs Attention", "At Risk"] as const;

// The roster's own seven pathways. The earlier list was the student app's
// 15 interest worlds, none of which match a roster careerTrack, so every
// pathway choice returned an empty report.
const PATHWAY_OPTIONS = ["All Pathways", ...CAREER_TRACKS];

const cap = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

/** Summary by Grade as four stacked status bars, one per grade (2 Oct 2026
 *  redundancy pass: the same table sat under all nine reports). Each bar
 *  is the grade's whole, split On Track / Needs Attention / At Risk, scaled
 *  to the largest grade so both size and mix read. Numbers wait for hover
 *  or focus; the exact table is in the fold below. */
function GradeStatusBars({ byGrade }: { byGrade: (g: number) => CounselorStudent[] }) {
  const [hover, setHover] = useState<{ grade: number; status: string; n: number; of: number } | null>(null);
  const largest = Math.max(1, ...GRADES.map((g) => byGrade(g).length));
  return (
    <div className="flex flex-col gap-[var(--space-3)]" onMouseLeave={() => setHover(null)}>
      {GRADES.map((g) => {
        const list = byGrade(g);
        return (
          <div key={g} className="flex items-center gap-[12px]">
            <span className="w-[64px] flex-none text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {g}</span>
            <span className="flex h-[12px] flex-1 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
              <span className="flex h-full gap-[2px]" style={{ width: `${(list.length / largest) * 100}%` }}>
                {SUMMARY_STATUSES.map((st) => {
                  const n = list.filter((s) => s.status === st).length;
                  if (!n) return null;
                  const c = CHART_STATUS[st];
                  return (
                    <span key={st} tabIndex={0} aria-label={`Grade ${g}: ${n} ${st} of ${list.length}`} onMouseEnter={() => setHover({ grade: g, status: st, n, of: list.length })} onFocus={() => setHover({ grade: g, status: st, n, of: list.length })} onBlur={() => setHover(null)} className="h-full cursor-default outline-none first:rounded-l-full last:rounded-r-full focus-visible:brightness-125" style={{ flex: n, background: `linear-gradient(90deg, color-mix(in srgb, ${c} 55%, transparent), ${c})`, opacity: hover && (hover.grade !== g || hover.status !== st) ? 0.45 : 1, transition: "opacity 150ms" }} />
                  );
                })}
              </span>
            </span>
          </div>
        );
      })}
      {/* The legend doubles as the hover readout: the hovered segment's
         count shows beside its own status name. */}
      <div className="flex flex-wrap gap-x-[16px] gap-y-[4px] pl-[76px]" aria-live="polite">
        {SUMMARY_STATUSES.map((st) => (
          <span key={st} className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: hover?.status === st ? "var(--foreground)" : "var(--muted-foreground)" }}>
            <span aria-hidden className="size-[9px] rounded-full" style={{ background: CHART_STATUS[st] }} />{st}
            {hover?.status === st && <b className="tabular-nums">Grade {hover.grade}: {hover.n} of {hover.of}</b>}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StudentProgress() {
  const [reportId, setReportId] = useState(REPORT_TYPES[0].id);
  const [pathway, setPathway] = useState("All Pathways");
  const [tableOpen, setTableOpen] = useState(false);
  const [checkInsOpen, setCheckInsOpen] = useState(false);
  const [drill, setDrill] = useState<Drill | null>(null);
  const report = REPORT_TYPES.find((r) => r.id === reportId)!;
  // Grade comes from the header filter (the screen had its own grade
  // picker as well, which asked the same question twice); the Lead
  // Counselor gets the same counselor picker as Students.
  const { gradeFilter, counselorFilter, setCounselorFilter } = useCounselorFilters();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor";

  const fullRoster = useReviewedRoster();
  const roster = useMemo(() => {
    let list = fullRoster;
    if (gradeFilter !== "All Grades") list = list.filter((s) => s.grade === gradeFilter);
    if (pathway !== "All Pathways") list = list.filter((s) => s.careerTrack === pathway);
    if (showCounselor && counselorFilter !== "All") list = list.filter((s) => counselorFor(s).id === counselorFilter);
    return list;
  }, [fullRoster, gradeFilter, pathway, showCounselor, counselorFilter]);

  const byGrade = useCallback((g: number) => roster.filter((s) => s.grade === g), [roster]);

  const reportRoster = report.gradeMin ? roster.filter((s) => s.grade >= report.gradeMin!) : roster;
  const chart = useMemo(() => report.chart(reportRoster), [report, reportRoster]);
  const chartValues = chart ? chart.buckets.map((b) => b.length) : [];

  const summaryRows: [string, (list: CounselorStudent[]) => number][] = [
    ["Total Students", (l) => l.length],
    ["On Track", (l) => l.filter((s) => s.status === "On Track").length],
    ["Needs Attention", (l) => l.filter((s) => s.status === "Needs Attention").length],
    ["At Risk", (l) => l.filter((s) => s.status === "At Risk").length],
  ];

  // The CSV carries the report's chart (when it has one) and the grade
  // summary, so the two table-only reports export too.
  const exportCsv = () => {
    const rows: string[][] = [];
    if (chart) rows.push(["Category", "Students"], ...chart.categories.map((c, i) => [c, String(chartValues[i] ?? 0)]), []);
    rows.push(["Metric", ...GRADES.map((g) => `Grade ${g}`), "Total"], ...summaryRows.map(([label, f]) => [label, ...GRADES.map((g) => String(f(byGrade(g)))), String(f(roster))]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // The exact table is folded shut on screen; open it before printing so
  // the PDF still carries it.
  const exportPdf = () => {
    flushSync(() => setTableOpen(true));
    window.print();
  };

  const openBucket = (i: number) => {
    if (!chart) return;
    const list = chart.buckets[i];
    setDrill({
      title: cap(chart.categories[i]),
      subtitle: `${chart.title} · ${list.length} of ${reportRoster.length}`,
      students: list.map((s) => ({ id: s.id, name: s.name, grade: s.grade, avatarIndex: s.avatarIndex, note: chart.note ? chart.note(s) : s.status })),
    });
  };

  const ReportIcon = report.icon;
  const FIELD = "flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
  const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  const TH = "px-[var(--space-3)] py-[10px] font-bold";
  const TD = "px-[var(--space-3)] py-[10px] text-right tabular-nums";
  const rowColor: Record<string, string> = { "Needs Attention": "var(--cd-amber)", "At Risk": "var(--cd-red)" };

  return (
    // No side list of report types: the reference (and v1) spend a 300px
    // column on nine report names next to a chart that then has to fit in
    // what is left (direct feedback, 24 Sept 2026: "a submenu is taking up
    // space inside its container"). Listbox, not a native select, for the
    // filters, per docs/CROSS_BROWSER_GUARDRAILS.md.
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* All nine reports visible at once, as underline sub-tabs: this
         screen sits inside the Reports tabs, and pill chips under pill
         tabs read as the same control twice (direct instruction: "dont
         repeat tab components together"). */}
      <SubTabs ariaLabel="Report" value={reportId} onChange={setReportId} options={REPORT_TYPES.map((r) => ({ key: r.id, label: r.label }))} />
      <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:flex lg:items-end lg:[&>label]:min-w-[220px]">
          {showCounselor && (
            <label className="flex min-w-0 flex-col gap-[4px]">
              <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Counselor</span>
              <Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{ value: "All", label: "All counselors" }, ...SCHOOL_COUNSELORS.map((c) => ({ value: c.id, label: c.name }))]} className={FIELD} style={fieldStyle} />
            </label>
          )}
          <label className="flex min-w-0 flex-col gap-[4px]">
            <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Career Pathway</span>
            <Listbox ariaLabel="Career pathway" value={pathway} onChange={setPathway} options={PATHWAY_OPTIONS.map((p) => ({ value: p, label: p }))} className={FIELD} style={fieldStyle} />
          </label>
          <div className="flex items-center gap-[8px] sm:col-span-2 lg:ml-auto">
            <button type="button" onClick={exportCsv} className="dm-quiet flex h-10 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <Download className="h-[14px] w-[14px]" aria-hidden /> CSV
            </button>
            <button type="button" onClick={exportPdf} className="dm-quiet flex h-10 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <FileDown className="h-[14px] w-[14px]" aria-hidden /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2 Oct 2026 redundancy pass: the report and the grade summary sit
         side by side. A share report is a ring with clickable category
         rows (its lead % in the middle), replacing a Stat pair and a bar
         chart that said the same thing three ways; the "N students" count
         in the heading and the "has no chart" caption are cut. */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        {chart?.kind === "share" && (
          <DonutCard
            title={chart.title}
            centerPct={(chartValues[0] / Math.max(1, reportRoster.length)) * 100}
            centerLabel={chart.categories[0]}
            rows={chart.categories.map((c, i) => ({ label: cap(c), value: chartValues[i] ?? 0, color: chart.colors[i], onClick: chartValues[i] ? () => openBucket(i) : undefined }))}
          />
        )}
        {chart?.kind === "count" && (
          <HoverBeam strength={0.6} className="h-full">
            <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}><ReportIcon className="h-[16px] w-[16px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />{chart.title}</h2>
              {/* Columns: grades are an ordered sequence, and the review
                 queue is a handful of counts, not parts of one whole. */}
              <BarChart barStyle="solid" height={200} groups={chart.categories} series={[{ label: report.label, accent: chart.colors[0], values: chartValues }]} barColors={chart.colors} max={Math.max(20, Math.ceil(Math.max(...chartValues, 1) / 20) * 20)} valueSuffix="" />
              {report.id === "intervention" && (
                <Disclosure id="sp-check-ins" title="Check-ins" summary={`${CHECK_INS_BY_GRADE.reduce((a, g) => a + g.count, 0)} students`} open={checkInsOpen} onToggle={() => setCheckInsOpen((v) => !v)}>
                  <ul className="flex flex-wrap gap-x-[18px] gap-y-[6px]">
                    {CHECK_INS_BY_GRADE.map((g) => (
                      <li key={g.grade} className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {g.grade} <b className="tabular-nums" style={{ color: "var(--foreground)" }}>{g.count}</b></li>
                    ))}
                  </ul>
                </Disclosure>
              )}
            </div>
          </HoverBeam>
        )}

        <HoverBeam strength={0.6} className={`h-full ${chart ? "" : "lg:col-span-2"}`}>
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Summary by Grade</h2>
            <GradeStatusBars byGrade={byGrade} />
            <div className="mt-auto">
              <Disclosure id="sp-grade-table" title="Table" open={tableOpen} onToggle={() => setTableOpen((v) => !v)}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                        <th className={`${TH} text-left`} style={{ color: "var(--muted-foreground)" }}>Metric</th>
                        {GRADES.map((g) => <th key={g} className={`${TH} text-right`} style={{ color: "var(--muted-foreground)" }}>Grade {g}</th>)}
                        <th className={`${TH} text-right`} style={{ color: "var(--muted-foreground)" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryRows.map(([label, f]) => (
                        <tr key={label} className="border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                          <td className="px-[var(--space-3)] py-[10px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</td>
                          {GRADES.map((g) => <td key={g} className={TD} style={{ color: rowColor[label] ?? "var(--foreground)" }}>{f(byGrade(g))}</td>)}
                          <td className={`${TD} font-bold`} style={{ color: rowColor[label] ?? "var(--foreground)" }}>{f(roster)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Disclosure>
            </div>
          </div>
        </HoverBeam>
      </div>
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
