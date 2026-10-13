"use client";

// v1's graphs and details inside v6 Analytics (13 Oct 2026, Chandu: "please
// update the analytics part of the v6 to have graphs and details from v1
// wherever necessary"). Each v6 area gets the v1 panels that answer its
// question, drawn in v5/v6's own chart language (gradient bars, one status
// line per milestone) instead of v1's bars and rings:
//   Readiness       v1 Milestone Tracker: every grade's milestones by status,
//                   and v1 My Impact's caseload progress by grade
//   Postsecondary   v1 My Impact's plans by pathway; v1 Insights' top saved
//                   majors and colleges
//   Career & WBL    v1 Insights' top saved careers, careers explored in
//                   simulations, and the career fair planning note
//   Risk            v1 Engagement's students needing a check-in by grade
// Engagement already carries v1's logins and summary (v5's panel), and
// Outcomes has no v1 counterpart, so neither gets more. Figures are v1's own
// seed data (DEMO-ONLY there), plus the live roster for plans by pathway.

import { useState } from "react";
import { GRADE_READINESS } from "@/lib/milestoneReadiness";
import type { CounselorStudent, PostsecondaryIntent } from "@/lib/counselorRoster";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { GradientBars } from "../v5/charts";
import { CardTabs } from "../v5/Switch";
import { TOP_COLLEGES, TOP_MAJORS, TOP_SAVED_CAREERS, TOP_SIMULATIONS } from "../CareerCollegeInsights";
import { INTERVENTION_BY_GRADE } from "../PlatformEngagement";
import type { Domain } from "./data";

const GRADES = [9, 10, 11, 12] as const;
type Grade = (typeof GRADES)[number];
const PATHWAYS: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Military", "Workforce", "Undecided"];
const STATUS = [
  { key: "completed", label: "Completed", color: "var(--color-feedback-success-solid)" },
  { key: "inProgress", label: "In progress", color: "var(--primary)" },
  { key: "needsAttention", label: "Needs attention", color: "var(--color-feedback-warning-solid)" },
  { key: "notStarted", label: "Not started", color: "color-mix(in srgb, var(--foreground) 18%, transparent)" },
] as const;

function Panel({ title, sub, aside, children, wide = false }: { title: string; sub?: string; aside?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className="six-glass six-brief-panel" style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
        <span className="flex flex-col gap-[2px]">
          <h2>{title}</h2>
          {sub && <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{sub}</span>}
        </span>
        {aside}
      </div>
      {children}
    </section>
  );
}

const counts = (items: { name: string; count: number }[]) => {
  const max = Math.max(...items.map((i) => i.count));
  return <GradientBars rows={items.map((i) => ({ label: i.name, value: i.count }))} suffix="" max={max} />;
};

/** Every milestone of one grade as one status line: the share done leads,
 *  the line shows done, in progress, needs attention and not started. */
function Milestones({ grade, setGrade }: { grade: Grade; setGrade: (g: Grade) => void }) {
  const g = GRADE_READINESS[grade];
  return (
    <Panel wide title="Milestones by grade" sub={g.focus}
      aside={<CardTabs label="Grade" items={GRADES.map((x) => ({ key: String(x) as `${Grade}`, label: `Grade ${x}` }))} value={String(grade) as `${Grade}`} onChange={(k) => setGrade(Number(k) as Grade)} />}>
      <ul className="mt-[var(--space-3)] flex flex-col gap-[var(--space-4)]">
        {g.cards.map((c) => (
          <li key={c.name} className="flex flex-col gap-[6px]">
            <span className="flex items-baseline justify-between gap-[var(--space-3)] text-[14px] font-semibold">
              <span className="truncate">{c.name}</span>
              <span className="flex-none tabular-nums">{c.pct}%<span className="ml-[6px] font-medium" style={{ color: "var(--muted-foreground)" }}>{c.completed} of {c.total}</span></span>
            </span>
            <span className="flex h-[10px] overflow-hidden rounded-full" aria-label={STATUS.map((s) => `${c[s.key]} ${s.label.toLowerCase()}`).join(", ")}>
              {STATUS.map((s) => c[s.key] > 0 && <span key={s.key} style={{ width: `${(c[s.key] / c.total) * 100}%`, background: s.color }} />)}
            </span>
          </li>
        ))}
      </ul>
      <span className="flex flex-wrap gap-x-[var(--space-5)] gap-y-[6px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {STATUS.map((s) => <span key={s.key} className="flex items-center gap-[6px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: s.color }} />{s.label}</span>)}
      </span>
    </Panel>
  );
}

export function V1Details({ domain, students, group }: { domain: Domain | "My Impact"; students: CounselorStudent[]; /** the page's grade picker: "All grades" or "9".."12" */ group: string }) {
  const [grade, setGrade] = useState<Grade>(group === "All grades" ? 12 : (Number(group) as Grade));
  const inGroup = students.filter((s) => group === "All grades" || s.grade === Number(group));
  if (domain === "Readiness") {
    return (
      <div className="six-two six-analytics-bottom">
        <Milestones grade={group === "All grades" ? grade : (Number(group) as Grade)} setGrade={setGrade} />
        <Panel title="Caseload progress by grade" sub="Average milestones done">
          <GradientBars rows={GRADES.map((x) => ({ label: `Grade ${x}`, value: GRADE_READINESS[x].avgDone }))} />
        </Panel>
      </div>
    );
  }
  if (domain === "Postsecondary") {
    const plans = PATHWAYS.map((p) => ({ name: p, count: inGroup.filter((s) => s.postsecondaryIntent === p).length }));
    return (
      <div className="six-two six-analytics-bottom">
        <Panel title="Plans after high school" sub={`${inGroup.length} students${group === "All grades" ? "" : `, grade ${group}`}`}>{counts(plans)}</Panel>
        <Panel title="Top saved majors" sub="Saved to student profiles">{counts(TOP_MAJORS.slice(0, 6))}</Panel>
        <Panel wide title="Top saved colleges" sub="Saved to student profiles">
          <ol className="grid grid-cols-1 gap-x-[var(--space-8)] gap-y-[10px] sm:grid-cols-2">
            {TOP_COLLEGES.map((c, i) => (
              <li key={c.name} className="flex items-baseline gap-[10px] text-[14px] font-semibold">
                <span className="w-[20px] flex-none tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="flex-none tabular-nums" style={{ color: "var(--muted-foreground)" }}>{c.count}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    );
  }
  if (domain === "Career & WBL") {
    return (
      <div className="six-two six-analytics-bottom">
        <Panel title="Top saved careers" sub="Saved to student profiles">{counts(TOP_SAVED_CAREERS.slice(0, 6))}</Panel>
        <Panel title="Careers explored in simulations" sub="Students who played each one">{counts(TOP_SIMULATIONS.slice(0, 6))}</Panel>
        <Panel wide title="Career fair planning" sub={`What ${DEMO_SCHOOL} students want most`}>
          <p className="text-[14.5px] leading-[21px]">Top interests this semester: technology, business and health. A career fair or job shadow day with pros from these fields fits your students best.</p>
          <span className="flex flex-wrap gap-[8px]">
            {["Technology & Engineering", "Business & Entrepreneurship", "Healthcare & Nursing", "Law & Criminal Justice"].map((t) => (
              <span key={t} className="rounded-full border px-[10px] py-[4px] text-[12.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{t}</span>
            ))}
          </span>
        </Panel>
      </div>
    );
  }
  if (domain === "Risk") {
    const total = INTERVENTION_BY_GRADE.reduce((n, g) => n + g.count, 0);
    return (
      <div className="six-two six-analytics-bottom">
        <Panel wide title="Students who may need a check-in, by grade" sub={`${total} students across all grades`}>
          <GradientBars tone="danger" suffix="" max={Math.max(...INTERVENTION_BY_GRADE.map((g) => g.count))} rows={INTERVENTION_BY_GRADE.map((g) => ({ label: `Grade ${g.grade}`, value: g.count, note: g.count === 1 ? "student" : "students" }))} />
        </Panel>
      </div>
    );
  }
  return null;
}
