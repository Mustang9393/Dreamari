"use client";

// DEMO-ONLY v2 Milestone Tracker, rebuilt 25 Sept 2026 on the roster
// instead of the reference's static 30-per-grade table (direct questions:
// "are we getting the proper data, have we done the proper hierarchy of
// information, is it all readable, understandable, do things align?").
//
// Data: for the chosen grade, each milestone the roster tracks at that
// grade (milestonesForGrade: 3 / 5 / 6 / 11, the same set the Student
// Profile's grid shows) is tallied over the students this role may see, so
// the tracker agrees with Students, the Review Queue and the Overview, and
// moves when a review is approved or the caseload changes. Five states:
// done (Approved or Completed), awaiting your review (Pending Review),
// in progress, not started, blocked (Overdue or Changes Requested). "Not
// started" is neutral gray, not a status color: a freshman who has not
// started a plan is expected, not alarming. Blocked is the reserved red.
//
// Shape: grade tabs, one summary line, one hero (the milestone with the
// largest stuck share) and a worst-first list. Seven ring cards became one
// ring and a list because a counselor's question is "which milestone
// first", not "show me every ring".

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SegmentedRing, Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { milestonesForGrade, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { CardLink, StatRow, STATUS_COLORS } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD_HERO, glowBackdrop } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { OverviewCard, RankBar, Stat, Verdict } from "./overviewShared";

type Grade = 9 | 10 | 11 | 12;
type Tally = { key: MilestoneKey; total: number; done: number; awaiting: number; inProgress: number; notStarted: number; blocked: number; donePct: number; behindShare: number };

// Done is the brand blue; the two "still moving" states are lighter steps
// of the same ramp; not started is neutral; blocked is the reserved red.
const STATE_COLORS = { done: PRIMARY, awaiting: BLUE_3[0], inProgress: "#C9D0FE", notStarted: NEUTRAL_SLICE, blocked: STATUS_COLORS["At Risk"] } as const;

function tally(students: CounselorStudent[], key: MilestoneKey): Tally {
  let done = 0, awaiting = 0, inProgress = 0, notStarted = 0, blocked = 0;
  for (const s of students) {
    const v = s.milestones[key];
    if (v === "Approved" || v === "Completed") done++;
    else if (v === "Pending Review") awaiting++;
    else if (v === "In Progress") inProgress++;
    else if (v === "Not Started") notStarted++;
    else if (v === "Overdue" || v === "Changes Requested") blocked++;
  }
  const total = done + awaiting + inProgress + notStarted + blocked;
  // Ranking: blocked students weigh most, then not started; a milestone
  // everyone is still working on is not "behind".
  const behindShare = total ? (blocked * 2 + notStarted) / total : 0;
  return { key, total, done, awaiting, inProgress, notStarted, blocked, donePct: total ? Math.round((done / total) * 100) : 0, behindShare };
}

function bandFor(t: Tally): "met" | "near" | "missed" {
  return t.blocked > 0 ? "missed" : t.notStarted / Math.max(1, t.total) >= 0.5 ? "near" : "met";
}

function verdictFor(t: Tally): string {
  const parts: string[] = [];
  if (t.blocked > 0) parts.push(`${t.blocked} blocked`);
  if (t.notStarted > 0) parts.push(`${t.notStarted} not started`);
  if (t.awaiting > 0) parts.push(`${t.awaiting} awaiting your review`);
  if (parts.length === 0) return t.done === t.total ? "Everyone is done" : "Everyone is on it";
  return parts.join(" · ");
}

export function MilestoneTracker() {
  const router = useRouter();
  const { gradeFilter, setGradeFilter } = useCounselorFilters();
  const [grade, setGrade] = useState<Grade>(gradeFilter === "All Grades" ? 9 : gradeFilter);
  const roster = useReviewedRoster();
  const students = useMemo(() => roster.filter((s) => s.grade === grade), [roster, grade]);
  const tallies = useMemo(() => milestonesForGrade(grade).map((key) => tally(students, key)).sort((a, b) => b.behindShare - a.behindShare || a.donePct - b.donePct), [students, grade]);
  const hero = tallies[0];
  const rest = tallies.slice(1);
  const overallDone = tallies.length ? Math.round(tallies.reduce((a, t) => a + t.donePct, 0) / tallies.length) : 0;
  const totalAwaiting = tallies.reduce((a, t) => a + t.awaiting, 0);

  const openStudents = () => {
    setGradeFilter(grade);
    router.push("/counselor?view=students");
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <Segmented ariaLabel="Grade level" options={([9, 10, 11, 12] as const).map((g) => ({ key: String(g), label: `Grade ${g}` }))} value={String(grade)} onChange={(k) => setGrade(Number(k) as Grade)} />
        <div className="flex gap-[var(--space-6)]">
          <Stat value={String(students.length)} label="students" />
          <Stat value={String(tallies.length)} label="milestones" />
          <Stat value={`${overallDone}%`} label="done" />
          <Stat value={String(totalAwaiting)} label="awaiting review" color={totalAwaiting > 0 ? PRIMARY : undefined} />
        </div>
      </div>

      {students.length === 0 || !hero ? (
        <p className="py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No Grade {grade} students on this caseload.</p>
      ) : (
        <>
          {/* The hero: the milestone furthest behind. One header row (what it
             is, the way in), then one body row: the ring, and directly
             beside it the verdict and the breakdown it draws. Everything
             sits left and reads left to right; nothing is pinned to a far
             corner (direct feedback, 25 Sept 2026: "the positions of the
             information are scattered and not really congruent"). */}
          <HoverBeam strength={0.7} className="h-full">
            <div className="group relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
              <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.26) }} />
              <div className="relative flex flex-col gap-[var(--space-5)]">
                <div className="flex items-start justify-between gap-[8px]">
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Furthest behind</span>
                    <h2 className="text-[17px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{hero.key}</h2>
                  </span>
                  <CardLink onClick={openStudents}>Students</CardLink>
                </div>
                <div className="flex flex-col items-start gap-[var(--space-5)] sm:flex-row sm:items-center sm:gap-[var(--space-7)]">
                  <SegmentedRing
                    segments={[
                      { value: hero.done, color: STATE_COLORS.done },
                      { value: hero.awaiting, color: STATE_COLORS.awaiting },
                      { value: hero.inProgress, color: STATE_COLORS.inProgress },
                      { value: hero.notStarted, color: STATE_COLORS.notStarted },
                      { value: hero.blocked, color: STATE_COLORS.blocked },
                    ].filter((s) => s.value > 0)}
                    size={152}
                    stroke={17}
                  >
                    <span className="flex flex-col items-center gap-[2px]">
                      <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{hero.donePct}%</span>
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{hero.done} of {hero.total} done</span>
                    </span>
                  </SegmentedRing>
                  <div className="flex w-full max-w-[340px] flex-col gap-[var(--space-3)]">
                    <Verdict band={bandFor(hero)}>{verdictFor(hero)}</Verdict>
                    <div className="flex flex-col gap-[4px]">
                      <StatRow label="Done" value={hero.done} color={STATE_COLORS.done} />
                      <StatRow label="Awaiting your review" value={hero.awaiting} color={STATE_COLORS.awaiting} />
                      <StatRow label="In progress" value={hero.inProgress} color={STATE_COLORS.inProgress} />
                      <StatRow label="Not started" value={hero.notStarted} color={STATE_COLORS.notStarted} />
                      {hero.blocked > 0 && <StatRow label="Blocked" value={hero.blocked} color={STATE_COLORS.blocked} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HoverBeam>

          {rest.length > 0 && (
            <OverviewCard title={`All Grade ${grade} milestones`} unit="% done, worst first" aside={<CardLink onClick={openStudents}>Students</CardLink>}>
              <ul className="flex flex-col gap-[10px]">
                {rest.map((t) => (
                  <li key={t.key} className="flex flex-col gap-[6px]">
                    <span className="flex items-baseline justify-between gap-[10px]">
                      <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
                        <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{t.key}</span>
                        <span className="text-[11.5px] font-semibold" style={{ color: t.blocked > 0 ? STATE_COLORS.blocked : "var(--muted-foreground)" }}>{verdictFor(t)}</span>
                      </span>
                      <span className="flex-none text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{t.donePct}%</span>
                    </span>
                    <RankBar value={t.donePct} />
                  </li>
                ))}
              </ul>
            </OverviewCard>
          )}
        </>
      )}
    </div>
  );
}
