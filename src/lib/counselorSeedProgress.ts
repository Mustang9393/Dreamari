// DEMO-ONLY: mid-year progress for the seeded roster, v2 only.
//
// The reference roster (counselorRosterData.ts / counselorProfileData.ts) was
// captured with Grades 9-11 barely started: no Grade 9 Career Report or
// Academic Plan approved, no Grade 10 resume approved, every Grade 11
// application plan "Not Started". v1 keeps that data exactly (it is frozen
// 1:1 to the Replit reference). v2 reads the same roster through
// counselorReviews.ts, and there this overlay moves a deterministic share of
// those rows forward so every grade has done, in-progress and not-started
// work at once. Direct instruction, 25 Sept 2026: "i see empty graphs in
// overview etc please seed data so that this doesn't happen".
//
// Rules: deterministic per student (the roster index in the id), never
// touches the live student, never touches Grade 12 (already mid-year), and
// never rewrites a state that carries an attention signal (Overdue,
// Changes Requested, Pending Review) -- only "Not Started" and "In
// Progress" move, so the attention strip, the Review Queue and the
// severity ranking keep the students the reference flagged.
//
// Production: delete this file; real milestone states come from the
// student app and the counselor's own decisions.

import type { CounselorStudent, MilestoneKey, MilestoneStatus } from "./counselorRoster";

type Rule = Partial<Record<MilestoneStatus, (i: number) => MilestoneStatus>>;
type GradeRules = Partial<Record<MilestoneKey, Rule>>;

const RULES: Record<number, GradeRules> = {
  9: {
    // Fall step in My Plan: most of the class has shipped a report by now.
    "Career Report": { "In Progress": (i) => (i % 3 ? "Approved" : "In Progress") },
    // Winter step (Four-Year Academic Plan, Next-Year Course Plan): about
    // half met with their counselor, a few are mid-way, the rest are owed.
    "Academic Plan": {
      "Not Started": (i) => (i % 5 < 2 ? "Approved" : i % 5 === 2 ? "In Progress" : "Not Started"),
      "In Progress": (i) => (i % 2 ? "Approved" : "In Progress"),
    },
  },
  10: {
    // Spring step (Draft your Resume): drafts exist, some are in the queue.
    Resume: {
      "In Progress": (i) => (i % 2 ? "Approved" : i % 8 === 2 ? "Pending Review" : "In Progress"),
      "Not Started": (i) => (i % 3 === 0 ? "Approved" : i % 3 === 1 ? "In Progress" : "Not Started"),
    },
  },
  11: {
    // Spring step (Application & Deadline Plan) reads the Applications
    // milestone: a third verified, a third being built, a third owed.
    Applications: { "Not Started": (i) => (i % 3 === 0 ? "Approved" : i % 3 === 1 ? "In Progress" : "Not Started") },
    Resume: { "Not Started": (i) => (i % 2 ? "In Progress" : "Not Started") },
  },
};

/** The student with mid-year progress applied. Pure: never mutates the row. */
export function seedSchoolYearProgress(s: CounselorStudent): CounselorStudent {
  if (s.isReal) return s;
  const rules = RULES[s.grade];
  if (!rules) return s;
  const i = Number(s.id.replace(/^\D+/, "")) || 0;
  let milestones: Record<MilestoneKey, MilestoneStatus> | null = null;
  for (const key of Object.keys(rules) as MilestoneKey[]) {
    const move = rules[key]?.[s.milestones[key]];
    if (!move) continue;
    const next = move(i);
    if (next === s.milestones[key]) continue;
    if (!milestones) milestones = { ...s.milestones };
    milestones[key] = next;
  }
  return milestones ? { ...s, milestones } : s;
}
