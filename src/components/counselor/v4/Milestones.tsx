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
//
// Cut back the same day (Chandu, 9 Oct 2026, reviewing it live: "the
// milestones data itself seem super dense and wordy and overall super
// cluttered. Can we design all of this better to be more readable and not
// overwhelming like it is now?"). A row is now the name, one percentage,
// one bar and "N waiting for you" when it applies; the type label, the
// "N of M" line, the legend and the trailing chevron left the page for the
// drawer. The bar reads on its own: green done, a thin amber mark for who
// needs attention, the rest is the track.
// Then reframed (Chandu, 9 Oct 2026: "is there a cleaner way to portray
// the data in milestones other than the constant progress bar graphs?").
// Maisha asked for horizontal bars to compare quickly, so the bar stays,
// but it is now a short fixed-width meter beside the percentage, one
// column that lines up down the card, and the rows are hairline rows in
// one card per grade instead of a boxed card each.
//
// Maisha's second pass (9 Oct 2026):
// - no "Students / Lincoln High School" breadcrumb over the title (the
//   Workspace shell skips it for this page);
// - on All Grades the four summary figures are larger, and the Cohort
//   Pulse grade lines are gone ("Remove the grade-specific progress bar
//   breakdown ... from the 'All Grades' view. This information should
//   appear only when an individual grade is selected"); a picked grade
//   shows its own full bar and counts in the summary card instead;
// - Bars | Donuts, a switch at the top right of each grade's card ("a
//   view toggle for the milestone breakdown ... between the current
//   line/bar view and a donut chart view, as discussed during our call").
//   One setting for the page, remembered in localStorage.
// - Charts | List (Chandu, 9 Oct 2026: "I need a card view with prettier
//   charts/graphs for milestones page ... Default to the chart view and
//   have the list as an option ... premium ... light, glass, gradient").
//   Charts (MilestoneCards.tsx) replaces Donuts: a glass card per
//   milestone with a gradient gauge and all four state counts. List is the
//   hairline rows. The switch moved from every grade's card to the page
//   toolbar, beside By Milestone | By Student: it is one setting for the
//   page, so it is shown once and never moves when the view changes. A new
//   storage key, so everyone starts on Charts.
//
// The charts redrawn (Chandu, 10 Oct 2026: "try better types of graphs,
// more beautiful ones ... be creative with the graphs, don't be
// traditional, as long as they convey the information sensibly we can use
// them", and "Don't change structure of the page or organisation"). The
// page order, filters and links are untouched; only the marks changed
// (all of them in milestoneViz.tsx):
// - the summary figures roll up on arrival, and Complete wears a gradient
//   ring with the page's one glow (one hero per page);
// - one grade picked: the four-colour bar became a waffle, one dot per
//   checkpoint, so "174 Done" is a block you can see, not a sliver;
// - each grade's head gets a quiet ring beside its percentage;
// - List rows: the meter became a lit pill track with quarter ticks.
//
// Every mark drills (Chandu, 10 Oct 2026: "everything needs drilldowns
// that are logical. I see graphs ... that don't do anything when I
// click"). What each opens, and why it is the logical next screen:
// - Students: the By Student list (every student, the figure's own rows);
// - Milestones: a drill ranking every milestone, lowest first, with the
//   lowest one a click away;
// - Complete: a drill of the students who are not complete, lowest first;
// - Need Attention: By Student filtered to them (unchanged);
// - a waffle state (dot or legend): that state across the grade's
//   milestones, which milestones hold it and who;
// - a grade head's ring: that grade's students who are not complete;
// - cards, list bars, By Student pills: the milestone drawer, filtered to
//   the state clicked or focused on the student clicked.

import { createElement, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Download } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { createLocalRecord } from "@/lib/localRecord";
import { useCounselorFilters, type GradeFilter } from "../shell";
import { Listbox } from "./Listbox";
import { Go } from "./chips";
import { Segmented } from "./viz";
import { CheckpointWaffle, HeroRing, PillTrack, seeLine } from "./milestoneViz";
import { DrillPanel, type Drill } from "./Drill";
import { Tip } from "@/components/app/IconTip";
import { CountUp } from "./overviewShared";
import { MilestoneCard } from "./MilestoneCards";
import { MilestoneDrawer, type MilestoneFilter } from "./MilestoneDrawer";
import { MilestonesByStudent, type StudentStatusFilter } from "./MilestonesByStudent";
import { GRADES, M_LABEL, buildModel, milestoneIcon, needsHelp, pctDone, reviewHref, reviewHrefIds, sumCounts, typeLabel, type Grade, type MState, type MilestoneRow, type StudentRow } from "./milestonesModel";
import { SubTabs } from "./SubTabs";
import "./milestones.css";

type Mode = "milestone" | "student";
type Viz = "charts" | "list";
const GRADE_OPTIONS = ["All Grades", "9", "10", "11", "12"];
// The Charts | List choice is one setting for the page, kept across visits
// (the app's localStorage record idiom: a stable snapshot, the server and
// the first client paint both read the fallback).
const VIZ_RECORD = createLocalRecord<Viz>("dreamari:milestones-view", "charts");
const VIZ_OPTIONS: { key: Viz; label: string }[] = [{ key: "charts", label: "Charts" }, { key: "list", label: "List" }];

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
  const [openRow, setOpenRow] = useState<{ grade: Grade; id: string; filter?: MilestoneFilter; focus?: string } | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  // All Grades: one collapsible section per grade, Grade 9 open, the rest
  // closed, each independent (Maisha: "once there are 7-12 milestones, the
  // page becomes too long and repetitive"; 35 rows stacked was that page).
  const [openGrades, setOpenGrades] = useState<Set<Grade>>(() => new Set<Grade>([9]));
  const toggleGrade = (g: Grade) => setOpenGrades((prev) => { const next = new Set(prev); if (next.has(g)) next.delete(g); else next.add(g); return next; });
  const storedViz = VIZ_RECORD.useValue();
  const viz: Viz = storedViz === "list" ? "list" : "charts";
  const setViz = (v: Viz) => VIZ_RECORD.write(v);
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor";
  const roster = useReviewedRoster();
  const model = useMemo(() => buildModel(roster, (s) => !showCounselor || counselorFilter === "All" || counselorFor(s).id === counselorFilter), [roster, showCounselor, counselorFilter]);

  const grades: Grade[] = gradeFilter === "All Grades" ? GRADES : [gradeFilter];
  const rows = grades.flatMap((g) => model.rows[g]);
  const students = model.students.filter((r) => grades.includes(r.s.grade as Grade));
  const counts = sumCounts(rows);
  const needHelp = students.filter((r) => needsHelp(r.s)).length;
  // each grade's percentage, for the section heads on All Grades
  const pulse = GRADES.map((g) => ({ g, pct: pctDone(sumCounts(model.rows[g])) }));
  const opened = openRow ? model.rows[openRow.grade].find((r) => r.item.id === openRow.id) ?? null : null;

  // ---- drills (see the header: what each figure opens and why) ----
  const scopeLabel = gradeFilter === "All Grades" ? "All Grades" : `Grade ${gradeFilter}`;
  const openStudents = () => { setDrill(null); setStatus("All"); setMode("student"); };
  const asDrillStudent = (r: StudentRow) => ({ id: r.s.id, name: r.s.name, grade: r.s.grade, avatarIndex: r.s.avatarIndex, note: `${r.pct}% · ${r.counts.done} of ${r.total} done` });
  const notCompleteDrill = (list: StudentRow[], scope: string, pct: number) => {
    const open = list.filter((r) => r.total > 0 && r.pct < 100).sort((a, b) => a.pct - b.pct || a.s.name.localeCompare(b.s.name));
    setDrill({
      title: `${open.length} not complete`,
      subtitle: `${scope} · ${pct}% of checkpoints done`,
      students: open.map(asDrillStudent),
      studentsLabel: `${open.length} students, furthest behind first`,
      action: { label: "Open By Student", onClick: openStudents },
    });
  };
  const milestonesDrill = () => {
    const ranked = [...rows].sort((a, b) => a.pct - b.pct || a.item.name.localeCompare(b.item.name));
    const low = ranked[0];
    setDrill({
      title: `${rows.length} milestones`,
      subtitle: `${scopeLabel} · lowest first`,
      rows: ranked.map((r) => ({ label: gradeFilter === "All Grades" ? `Grade ${r.grade} · ${r.item.name}` : r.item.name, value: `${r.pct}%`, pct: r.pct })),
      rowsLabel: "Complete",
      action: low ? { label: `Open ${low.item.name}`, onClick: () => { setDrill(null); setOpenRow({ grade: low.grade, id: low.item.id }); } } : undefined,
    });
  };
  const stateDrill = (g: Grade, st: MState) => {
    const holding = model.rows[g].filter((r) => r.counts[st] > 0).sort((a, b) => b.counts[st] - a.counts[st]);
    const who = new Map<string, { r: StudentRow; items: string[] }>();
    for (const r of holding) for (const e of r.entries) if (e.state === st) {
      const sr = model.students.find((x) => x.s.id === e.s.id);
      if (!sr) continue;
      const cur = who.get(e.s.id) ?? { r: sr, items: [] };
      cur.items.push(r.item.name);
      who.set(e.s.id, cur);
    }
    const people = [...who.values()].sort((a, b) => b.items.length - a.items.length || a.r.s.name.localeCompare(b.r.s.name));
    const n = holding.reduce((t, r) => t + r.counts[st], 0);
    const top = holding[0];
    setDrill({
      title: `${n} ${M_LABEL[st]}`,
      subtitle: `Grade ${g} · checkpoints across ${holding.length} ${holding.length === 1 ? "milestone" : "milestones"}`,
      rows: holding.map((r) => ({ label: r.item.name, value: `${r.counts[st]} of ${r.total}`, pct: (r.counts[st] / Math.max(1, r.total)) * 100 })),
      rowsLabel: "Where they are",
      students: people.map(({ r, items }) => ({ id: r.s.id, name: r.s.name, grade: r.s.grade, avatarIndex: r.s.avatarIndex, note: items.length > 2 ? `${items.slice(0, 2).join(", ")} +${items.length - 2}` : items.join(", ") })),
      studentsLabel: `${people.length} ${people.length === 1 ? "student" : "students"}`,
      action: top ? { label: `Open ${top.item.name}`, onClick: () => { setDrill(null); setOpenRow({ grade: g, id: top.item.id, filter: st }); } } : undefined,
    });
  };
  const gradeStudents = (g: Grade) => model.students.filter((r) => r.s.grade === g);
  const openNeedHelp = () => { setStatus("Need Help"); setMode("student"); };

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
          {mode === "milestone" && <Segmented ariaLabel="Milestone view" value={viz} onChange={setViz} options={VIZ_OPTIONS} />}
          <IconTip label="Export CSV"><button type="button" onClick={exportCsv} aria-label="Export CSV" className="v4-ms-icon is-bordered"><Download className="h-[15px] w-[15px]" aria-hidden /></button></IconTip>
          {/* two page view switches share one row, both the level 3 pill */}
          <SubTabs ariaLabel="View" value={mode} onChange={setMode} options={[{ key: "milestone", label: "By Milestone" }, { key: "student", label: "By Student" }]} />
        </span>
      </div>

      <section aria-label="Summary" className="v4-ms-overview v4-surface">
        {/* the figures step up on All Grades ("slightly increase the size
           of the summary metrics ... for better visibility", Maisha) */}
        <dl className={`v4-ms-summary ${gradeFilter === "All Grades" ? "is-all" : ""}`}>
          <div><dt>Students</dt><dd><Tip label={seeLine(students.length)}><button type="button" onClick={openStudents} className="v4-ms-fig" aria-label={`${students.length} students: open the student list`}><CountUp value={students.length} /></button></Tip></dd></div>
          <div><dt>Milestones</dt><dd><Tip label="See every milestone, lowest first"><button type="button" onClick={milestonesDrill} className="v4-ms-fig" aria-label={`${rows.length} milestones: rank them, lowest first`}><CountUp value={rows.length} /></button></Tip></dd></div>
          <div className="is-hero"><dt>Complete</dt><dd><Tip label={seeLine(students.filter((r) => r.total > 0 && r.pct < 100).length, "not complete")}><button type="button" onClick={() => notCompleteDrill(students, scopeLabel, pctDone(counts))} className="v4-ms-fig is-hero-fig" aria-label={`${pctDone(counts)}% complete: see the students who are not complete`}><HeroRing hero pct={pctDone(counts)} size={gradeFilter === "All Grades" ? 40 : 32} stroke={gradeFilter === "All Grades" ? 5 : 4} /><CountUp value={pctDone(counts)} suffix="%" /></button></Tip></dd></div>
          <div>
            <dt>Need Attention</dt>
            <dd>
              {needHelp > 0 ? (
                <Tip label={seeLine(needHelp)}>
                  <button type="button" onClick={openNeedHelp} className="v4-ms-summary-link v4-ms-fig" aria-label={`${needHelp} students need attention: show them`}>
                    <span style={{ color: "var(--v4-caution)" }}><CountUp value={needHelp} /></span><Go />
                  </button>
                </Tip>
              ) : 0}
            </dd>
          </div>
        </dl>
        {/* One grade picked: that grade's bar with all four states and the
           counts behind it, under a hairline. The grade lines left All
           Grades (Maisha: "This information should appear only when an
           individual grade is selected"); the grade sections below already
           carry each grade's percentage. The line shows the breakdown, not
           the percentage again (the Complete figure above says it once). */}
        {gradeFilter !== "All Grades" && (
          <div className="v4-ms-grade-line">
            {/* "Checkpoints" names the unit: the strip above counts students,
               the waffle counts milestone checkpoints, so 3 and 7 are both
               right. One dot per checkpoint, Done first. */}
            <CheckpointWaffle counts={counts} label={`Grade ${gradeFilter}`} onPick={(st) => stateDrill(gradeFilter as Grade, st)} />
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
              const waitingIds = model.rows[g].flatMap((r) => (r.key ? r.waiting.map((s) => s.id) : []));
              const open = grades.length === 1 || openGrades.has(g);
              // Charts: a grid of glass cards, straight on the page (a card
              // inside a card would bury the glass). List: the hairline rows
              // in one surface per grade.
              const list = viz === "charts" ? (
                <ul id={`v4-ms-grade-${g}`} className="v4-msc-grid">
                  {model.rows[g].map((r) => <MilestoneCard key={r.item.id} row={r} onOpen={(st) => setOpenRow({ grade: g, id: r.item.id, filter: st })} onWaiting={() => router.push(reviewHref(r.key!, r.waiting.map((s) => s.id)))} />)}
                </ul>
              ) : (
                <div id={`v4-ms-grade-${g}`} className="v4-ms-card v4-surface">
                  <ul className="v4-ms-rows">
                    {model.rows[g].map((r) => <MilestoneModule key={r.item.id} row={r} onOpen={(f) => setOpenRow({ grade: g, id: r.item.id, filter: f })} onWaiting={() => router.push(reviewHref(r.key!, r.waiting.map((s) => s.id)))} />)}
                  </ul>
                </div>
              );
              if (grades.length === 1) return <section key={g} aria-label={`Grade ${g} milestones`}>{list}</section>;
              return (
                <section key={g} aria-label={`Grade ${g} milestones`} className="v4-ms-grade">
                  {/* "Grade 10 · 74%" and the waiting link, nothing else */}
                  <div className="v4-ms-grade-head">
                    {/* the name and chevron fold the section; the ring and its
                       percentage drill into the grade's students not complete */}
                    <span className="v4-ms-grade-title">
                      <button type="button" aria-expanded={open} aria-controls={`v4-ms-grade-${g}`} onClick={() => toggleGrade(g)} className="v4-ms-grade-toggle dm-quiet"><h2>Grade {g}</h2></button>
                      <Tip label={seeLine(gradeStudents(g).filter((r) => r.total > 0 && r.pct < 100).length, "not complete")}>
                        <button type="button" onClick={() => notCompleteDrill(gradeStudents(g), `Grade ${g}`, p.pct)} className="v4-ms-grade-pct v4-ms-fig" aria-label={`Grade ${g}, ${p.pct}% complete: see the students not complete`}><HeroRing pct={p.pct} size={18} stroke={3} />{p.pct}%</button>
                      </Tip>
                      <button type="button" tabIndex={-1} aria-hidden onClick={() => toggleGrade(g)} className="v4-ms-grade-chev dm-quiet"><ChevronDown className="h-[16px] w-[16px] flex-none transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden /></button>
                    </span>
                    {waitingIds.length > 0 && <button type="button" onClick={() => router.push(reviewHrefIds(waitingIds))} className="v4-ms-wait">{waitingIds.length} waiting for you</button>}
                  </div>
                  {open && list}
                </section>
              );
            })}
          </div>
        )
      ) : (
        <MilestonesByStudent key={`${gradeFilter}-${counselorFilter}`} rows={students} status={status} setStatus={setStatus} onOpenMilestone={(r, m) => setOpenRow({ grade: r.s.grade as Grade, id: m.item.id, filter: m.state, focus: r.s.id })} />
      )}

      <MilestoneDrawer row={opened} onClose={() => setOpenRow(null)} initialFilter={openRow?.filter} focusId={openRow?.focus} />
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}

/** One milestone as a hairline row: a quiet icon, the name, the short
 *  meter beside its percentage, and "N waiting for you" only when
 *  submissions are in the counselor's queue. The whole row opens the
 *  drawer; the arrow shows on hover. */
function MilestoneModule({ row, onOpen, onWaiting }: { row: MilestoneRow; onOpen: (f?: MilestoneFilter) => void; onWaiting: () => void }) {
  const waiting = row.key ? row.waiting.length : 0;
  return (
    <li onClick={() => onOpen()} className="v4-ms-row dm-quiet">
      <span className="v4-ms-row-icon" aria-hidden>{createElement(milestoneIcon(row), { className: "h-[15px] w-[15px]" })}</span>
      <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }} className="v4-ms-row-title v4-ms-name" aria-label={`${row.item.name}: ${row.pct}% complete. Open students`}>{row.item.name}</button>
      <PillTrack counts={row.counts} label={row.item.name} onPick={(f) => onOpen(f)} className="v4-ms-row-bar" />
      <span className="v4-ms-row-pct">{row.pct}%</span>
      <span className="v4-ms-row-wait">
        {waiting > 0 && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onWaiting(); }} className="v4-ms-wait">{waiting} waiting for you</button>
        )}
      </span>
      <span className="v4-ms-row-go" aria-hidden><Go /></span>
    </li>
  );
}
