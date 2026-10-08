"use client";

// Students > Milestones (9 Oct 2026, Maisha's consolidation): the old
// Milestones and Student Progress tabs as one page. "Merge 'milestones' and
// 'student progress' into one tab and call it 'Milestones'." The page title
// and "Track every milestone. See who needs support. Take action." come
// from the Workspace shell; this file draws everything under them:
// - a grade picker (All Grades by default) and the By Milestone | By
//   Student switch, a small pill at the upper right (never a second tab
//   row under the Directory | Milestones tabs);
// - one compact summary strip (students, milestones, completion, students
//   needing attention), computed from the roster for the grade in view;
// - Cohort Pulse, only on All Grades: each grade in one short line with a
//   thin segmented bar, so the grades compare at a glance; it disappears
//   once a grade is picked, where it would only repeat the strip;
// - By Milestone (default): Maisha, "Use V4 as the primary structural
//   direction ... make those cards significantly more compact ... each
//   milestone should almost feel like a clean horizontal module/row";
// - By Student (MilestonesByStudent.tsx), the old Student Progress.
// Clicking a milestone opens its drawer (MilestoneDrawer.tsx).

import { createElement, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Download } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { useCounselorFilters, type GradeFilter } from "../shell";
import { Listbox } from "./Listbox";
import { Go } from "./chips";
import { SegBar } from "./milestoneViz";
import { MilestoneDrawer } from "./MilestoneDrawer";
import { MilestonesByStudent, type StudentStatusFilter } from "./MilestonesByStudent";
import { GRADES, M_STATES, buildModel, milestoneIcon, needsHelp, pctDone, reviewHref, sumCounts, typeLabel, type Grade, type MilestoneRow } from "./milestonesModel";
import { SubTabs } from "./SubTabs";
import "./milestones.css";

type Mode = "milestone" | "student";
const GRADE_OPTIONS = ["All Grades", "9", "10", "11", "12"];

export function Milestones({ initialMode }: { initialMode?: Mode } = {}) {
  const router = useRouter();
  const params = useSearchParams();
  const urlMode = params.get("mode");
  const [mode, setModeState] = useState<Mode>(urlMode === "student" || urlMode === "milestone" ? urlMode : initialMode ?? "milestone");
  // The mode rides in the URL (replace, not push) so Back from a student
  // lands on the same reading of the page.
  const setMode = (m: Mode) => {
    setModeState(m);
    const q = new URLSearchParams(params.toString());
    q.set("mode", m);
    if (q.get("view") === "progress") q.set("view", "milestones");
    router.replace(`/counselor?${q.toString()}`, { scroll: false });
  };
  const { gradeFilter, setGradeFilter, counselorFilter, setCounselorFilter } = useCounselorFilters();
  const [status, setStatus] = useState<StudentStatusFilter>("All");
  const [openRow, setOpenRow] = useState<{ grade: Grade; id: string } | null>(null);
  // All Grades: one collapsible section per grade, Grade 9 open, the rest
  // closed, each independent (Maisha: "once there are 7-12 milestones, the
  // page becomes too long and repetitive"; 35 rows stacked was that page).
  const [openGrades, setOpenGrades] = useState<Set<Grade>>(() => new Set<Grade>([9]));
  const toggleGrade = (g: Grade) => setOpenGrades((prev) => { const next = new Set(prev); if (next.has(g)) next.delete(g); else next.add(g); return next; });
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor";
  const roster = useReviewedRoster();
  const model = useMemo(() => buildModel(roster, (s) => !showCounselor || counselorFilter === "All" || counselorFor(s).id === counselorFilter), [roster, showCounselor, counselorFilter]);

  const grades: Grade[] = gradeFilter === "All Grades" ? GRADES : [gradeFilter];
  const rows = grades.flatMap((g) => model.rows[g]);
  const students = model.students.filter((r) => grades.includes(r.s.grade as Grade));
  const counts = sumCounts(rows);
  const needHelp = students.filter((r) => needsHelp(r.s)).length;
  const pulse = GRADES.map((g) => {
    const c = sumCounts(model.rows[g]);
    return { g, counts: c, pct: pctDone(c), help: model.students.filter((r) => r.s.grade === g && needsHelp(r.s)).length, n: model.students.filter((r) => r.s.grade === g).length };
  });
  const opened = openRow ? model.rows[openRow.grade].find((r) => r.item.id === openRow.id) ?? null : null;

  const exportCsv = () => {
    const lines = mode === "milestone"
      ? [["Grade", "Milestone", "Type", "Students", "Done", "In Progress", "Needs Attention", "Not Started", "Waiting for You", "Complete %"], ...rows.map((r) => [String(r.grade), r.item.name, typeLabel(r.item.classification), String(r.total), String(r.counts.done), String(r.counts["in-progress"]), String(r.counts.attention), String(r.counts["not-started"]), String(r.waiting.length), String(r.pct)])]
      : [["Student", "Grade", "Status", "Complete %", "Done", "In Progress", "Needs Attention", "Not Started"], ...students.map((r) => [r.s.name, String(r.s.grade), r.s.status, String(r.pct), String(r.counts.done), String(r.counts["in-progress"]), String(r.counts.attention), String(r.counts["not-started"])])];
    const csv = lines.map((l) => l.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `milestones-${gradeFilter === "All Grades" ? "all-grades" : `grade-${gradeFilter}`}-by-${mode}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const setGrade = (v: string) => setGradeFilter(v === "All Grades" ? "All Grades" : (Number(v) as GradeFilter));

  return (
    <div className="v4-page v4-ms flex flex-col gap-[var(--space-4)]">
      <div className="v4-ms-toolbar">
        <span className="flex flex-wrap items-center gap-[8px]">
          {/* a row of pills, not a dropdown: Maisha wrote the selector as
             "All Grades | Grade 9 | Grade 10 | Grade 11 | Grade 12" (9 Oct
             2026), and a pill is one tap with every grade in view */}
          <SubTabs ariaLabel="Grade" className="v4-ms-grades" value={String(gradeFilter)} onChange={setGrade} options={GRADE_OPTIONS.map((g) => ({ key: g, label: g === "All Grades" ? g : `Grade ${g}` }))} />
          {showCounselor && <Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{ value: "All", label: "All Counselors" }, ...SCHOOL_COUNSELORS.map((c) => ({ value: c.id, label: c.name }))]} />}
        </span>
        <span className="flex items-center gap-[8px]">
          <IconTip label="Export CSV"><button type="button" onClick={exportCsv} aria-label="Export CSV" className="v4-ms-icon is-bordered"><Download className="h-[15px] w-[15px]" aria-hidden /></button></IconTip>
          {/* two page view switches share one row, both the level 3 pill */}
          <SubTabs ariaLabel="View" value={mode} onChange={setMode} options={[{ key: "milestone", label: "By Milestone" }, { key: "student", label: "By Student" }]} />
        </span>
      </div>

      <section aria-label="Summary" className="v4-ms-overview v4-surface">
        <dl className="v4-ms-summary">
          <div><dt>Students</dt><dd>{students.length}</dd></div>
          <div><dt>Milestones</dt><dd>{rows.length}</dd></div>
          <div><dt>Complete</dt><dd>{pctDone(counts)}%</dd></div>
          <div>
            <dt>Need Attention</dt>
            <dd>
              {needHelp > 0 ? (
                <button type="button" onClick={() => { setStatus("Need Help"); setMode("student"); }} className="v4-ms-summary-link" aria-label={`${needHelp} students need attention: show them`}>
                  <span style={{ color: "var(--v4-caution)" }}>{needHelp}</span><Go />
                </button>
              ) : 0}
            </dd>
          </div>
          <span className="v4-ms-legend-row" aria-hidden>{M_STATES.map((st) => <span key={st.key}><i style={{ background: st.color }} />{st.label}</span>)}</span>
        </dl>
        {/* Cohort Pulse (Maisha: "only when All Grades is selected ... a
           thin segmented line or compact indicator, not anonymous dots").
           Each grade opens itself. */}
        {gradeFilter === "All Grades" && (
          <div className="v4-ms-pulse">
            <h2 className="v4-ms-overline">Cohort Pulse</h2>
            <ul>
              {pulse.map((p) => (
                <li key={p.g}>
                  <button type="button" onClick={() => setGradeFilter(p.g)} aria-label={`Grade ${p.g}: ${p.pct}% complete, ${p.help} need attention. Show Grade ${p.g}`}>
                    <span className="v4-ms-pulse-line"><b>Grade {p.g}</b><span>{p.pct}% complete</span>{p.help > 0 && <span className="is-help" style={{ color: "var(--v4-caution)" }}>{p.help} need attention</span>}</span>
                    <SegBar counts={p.counts} label={`Grade ${p.g}`} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {mode === "milestone" ? (
        students.length === 0 ? (
          <p className="py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No students in this grade{showCounselor && counselorFilter !== "All" ? " on this caseload" : ""}.</p>
        ) : (
          <div className="flex flex-col gap-[var(--space-3)]">
            {grades.map((g) => {
              const p = pulse.find((x) => x.g === g)!;
              const waiting = model.rows[g].reduce((t, r) => t + (r.key ? r.waiting.length : 0), 0);
              const open = grades.length === 1 || openGrades.has(g);
              const list = (
                <ul id={`v4-ms-grade-${g}`} className="v4-ms-rows">
                  {model.rows[g].map((r) => <MilestoneModule key={r.item.id} row={r} onOpen={() => setOpenRow({ grade: g, id: r.item.id })} onWaiting={() => router.push(reviewHref(r.key!, r.waiting.map((s) => s.id)))} />)}
                </ul>
              );
              if (grades.length === 1) return <section key={g} aria-label={`Grade ${g} milestones`}>{list}</section>;
              return (
                <section key={g} aria-label={`Grade ${g} milestones`} className="v4-ms-grade">
                  <button type="button" aria-expanded={open} aria-controls={`v4-ms-grade-${g}`} onClick={() => toggleGrade(g)} className="v4-ms-grade-head dm-quiet">
                    <h2>Grade {g}</h2>
                    <span className="v4-ms-grade-roll"><span>{model.rows[g].length} milestones</span><span>{p.pct}% complete</span>{waiting > 0 && <span style={{ color: "var(--primary)" }}>{waiting} waiting for you</span>}</span>
                    <ChevronDown className="h-[16px] w-[16px] flex-none transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden />
                  </button>
                  {open && list}
                </section>
              );
            })}
          </div>
        )
      ) : (
        <MilestonesByStudent key={`${gradeFilter}-${counselorFilter}`} rows={students} status={status} setStatus={setStatus} />
      )}

      <MilestoneDrawer row={opened} onClose={() => setOpenRow(null)} />
    </div>
  );
}

/** One milestone as a slim horizontal module: icon, name and type, the
 *  share done with "N of M complete", the four-state bar, and "N waiting
 *  for you" only when submissions are in the counselor's queue. */
function MilestoneModule({ row, onOpen, onWaiting }: { row: MilestoneRow; onOpen: () => void; onWaiting: () => void }) {
  const waiting = row.key ? row.waiting.length : 0;
  return (
    <li>
      <HoverBeam strength={0.5}>
        <div onClick={onOpen} className="v4-ms-row v4-surface dm-quiet">
          <span className="v4-ms-row-icon" aria-hidden>{createElement(milestoneIcon(row), { className: "h-[16px] w-[16px]" })}</span>
          <span className="v4-ms-row-name">
            <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }} className="v4-ms-row-title" aria-label={`${row.item.name}: ${row.pct}% complete. Open students`}>{row.item.name}</button>
            <span className="v4-ms-type">{typeLabel(row.item.classification)}</span>
          </span>
          <span className="v4-ms-row-measure">
            <strong>{row.pct}%</strong>
            <small>{row.counts.done} of {row.total} complete</small>
          </span>
          <SegBar counts={row.counts} label={row.item.name} className="v4-ms-row-bar" />
          <span className="v4-ms-row-wait">
            {waiting > 0 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onWaiting(); }} className="v4-ms-wait">{waiting} waiting for you</button>
            )}
          </span>
          <span className="v4-ms-row-go" aria-hidden><Go /></span>
        </div>
      </HoverBeam>
    </li>
  );
}
