"use client";

// Student Progress and Milestones as ONE screen under Students (7 Oct 2026). Maisha: "the information under Student Progress
// within Insights may be somewhat repetitive with what we already have under
// Milestones within the Students tab... I actually think Student Progress
// fits more naturally under the Students tab, and we may be able to remove it
// from Insights altogether and consolidate it with Milestone Tracking...
// without losing any important information." Chandu: "Dont bring any
// recommendations to the meeting without building and showing me."
//
// Shape: one list on the left of everything a counselor tracks, grouped the
// way they think about it (the six core milestones, each grade's own
// checkpoints, then caseload-wide lenses), and the full detail on the right.
// Nothing is rebuilt: the right side IS the existing Student Progress report
// or the existing grade checklist, embedded without its own tab row, so no
// data or behaviour is lost and two tab rows never stack. Shipped as the
// real Milestones page, no toggle (Chandu: "fold them into the thing. NO
// meeting. Just show the upgrade and if they say no we can revert"); the
// separate screens are one revert away (git history before this commit).

import { useMemo, useState } from "react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { milestonesForGrade, type MilestoneKey } from "@/lib/counselorRoster";
import { curriculumAvgDone, curriculumForGrade } from "@/lib/counselorCurriculum";
import { useCounselorFilters } from "../shell";
import { REPORTS, StudentProgress } from "./StudentProgress";
import { MilestoneTracker, type Grade } from "./MilestoneTracker";

type Item = { key: string; label: string; meta: string; pct?: number };

export function MilestonesHub({ initial }: { initial?: string }) {
  const roster = useReviewedRoster();
  const { gradeFilter } = useCounselorFilters();
  const scoped = useMemo(() => (gradeFilter === "All Grades" ? roster : roster.filter((s) => s.grade === gradeFilter)), [roster, gradeFilter]);
  const [active, setActive] = useState(initial ?? "career-report");

  const core: Item[] = REPORTS.filter((r) => r.milestone).map((r) => {
    const m = r.milestone as MilestoneKey;
    const eligible = scoped.filter((s) => milestonesForGrade(s.grade).includes(m) && s.milestones[m] !== "Not Applicable");
    const done = eligible.filter((s) => s.milestones[m] === "Approved" || s.milestones[m] === "Completed").length;
    const pct = eligible.length ? Math.round((done / eligible.length) * 100) : 0;
    return { key: r.id, label: r.label, meta: eligible.length ? `${done} of ${eligible.length} done` : "No eligible students", pct };
  });
  const grades: Item[] = ([9, 10, 11, 12] as Grade[]).map((g) => ({ key: `grade-${g}`, label: `Grade ${g} Checkpoints`, meta: `${curriculumForGrade(g).length} checkpoints`, pct: curriculumAvgDone(g) }));
  const pending = scoped.reduce((n, s) => n + Object.values(s.milestones).filter((v) => v === "Pending Review").length, 0);
  const withPlan = scoped.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const onTrack = scoped.filter((s) => s.status === "On Track").length;
  const lenses: Item[] = [
    { key: "plans", label: "Plans After Graduation", meta: `${withPlan} of ${scoped.length} have a plan`, pct: scoped.length ? Math.round((withPlan / scoped.length) * 100) : 0 },
    { key: "reviews", label: "Waiting on My Review", meta: `${pending} submissions` },
    { key: "support", label: "Support Status", meta: `${onTrack} of ${scoped.length} on track`, pct: scoped.length ? Math.round((onTrack / scoped.length) * 100) : 0 },
  ];
  const groups = [
    { title: "Core Milestones", items: core },
    { title: "Grade Checkpoints", items: grades },
    { title: "Across My Caseload", items: lenses },
  ];
  const all = groups.flatMap((g) => g.items);
  const current = all.find((i) => i.key === active) ?? all[0];
  const grade = current.key.startsWith("grade-") ? (Number(current.key.slice(6)) as Grade) : null;

  return (
    <div className="v4-hub">
      <nav className="v4-hub-rail" aria-label="Milestones">
        {groups.map((g) => (
          <div key={g.title} className="v4-hub-group">
            <span className="v4-overline">{g.title}</span>
            <ul>
              {g.items.map((it) => (
                <li key={it.key}>
                  <button type="button" aria-current={it.key === current.key ? "true" : undefined} onClick={() => setActive(it.key)}>
                    <span className="v4-hub-label"><strong>{it.label}</strong><small>{it.meta}</small></span>
                    {it.pct !== undefined && <span className="v4-hub-pct">{it.pct}%</span>}
                    {it.pct !== undefined && <span className="v4-hub-meter" aria-hidden><i style={{ width: `${it.pct}%` }} /></span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <section className="v4-hub-detail" aria-label={current.label}>
        <header className="v4-hub-head"><span className="v4-overline">{groups.find((g) => g.items.includes(current))?.title}</span><h2>{current.label}</h2></header>
        {grade ? <MilestoneTracker key={grade} grade={grade} embedded /> : <StudentProgress key={current.key} reportId={current.key} embedded />}
      </section>
    </div>
  );
}
