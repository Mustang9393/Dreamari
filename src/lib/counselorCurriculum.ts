// The reference's own per-grade curriculum -- restored to the Milestone
// Tracker 25 Sept 2026 after a content audit found it had gone completely
// unused. `src/lib/milestoneReadiness.ts` (`GRADE_READINESS`) is the
// Replit's verbatim checklist per grade (Grade 9 has 7 named checkpoints,
// Grade 10 has 8, Grade 11 has 11, Grade 12 has 10, each with its own
// completion %, counted breakdown and classification); when the Tracker
// was rebuilt on the student app's own My Plan steps ("the bridge"), these
// were replaced rather than kept alongside, and zero v2 files ended up
// importing this module. Maisha, 25 Sept 2026: "keep content the same as
// that's needed for counselors... open to you making it visually look
// better as long as content and comprehension isn't reduced." This module
// is the data layer for that restoration: the reference's names,
// percentages and classifications, verbatim, wearing this dashboard's own
// visual language (rings, season tiles, drill-through).
//
// Two things are NOT in the reference's own data and are a deliberate,
// documented presentation choice on top of it, not a content change:
// - `season`: the reference lists each grade's checkpoints in one flat,
//   already-roughly-chronological order (assessment/exploration first,
//   plans/reviews in the middle, reflections/decisions last); assigning
//   the first third to Fall, the middle third to Winter, and the last
//   third to Spring keeps that order and gives the Tracker's season tiles
//   something to group by. Mechanical (by index, not hand-picked per
//   item) so it's auditable against the source array above.
// - Per-student status: GRADE_READINESS only has the aggregate counts
//   (how many of the 30 are done/in progress/etc.), not which specific
//   students -- there is no such field in the reference to preserve.
//   `statusesForItem` below assigns each seeded student a status with a
//   stable hash so drill-through ("who hasn't done this") always sums
//   back to the exact counts the row itself shows, and the same student
//   always lands in the same bucket for a given checkpoint.

import { GRADE_READINESS, type MilestoneCard } from "./milestoneReadiness";
import type { CounselorStudent } from "./counselorRoster";

export type CurriculumKind = "auto" | "counselor-verified";
export type CurriculumStatus = "done" | "awaiting-review" | "in-progress" | "not-started" | "not-tracked";
export type CurriculumWindow = "fall" | "winter" | "spring";

export type CurriculumItem = {
  id: string;
  grade: 9 | 10 | 11 | 12;
  name: string;
  /** The reference's own classification, verbatim ("Counselor Review",
   *  "Student Submission / Counselor Visibility", ...). */
  classification: string;
  kind: CurriculumKind;
  window: CurriculumWindow;
  total: number;
  completed: number;
  inProgress: number;
  needsAttention: number;
  notStarted: number;
  notApplicable: number;
  donePct: number;
};

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
}

/** Counselor Review / Counselor Verification / tracked-with-the-counselor
 *  items need the counselor's own action; the rest are the student's own
 *  completion, the counselor only sees the result. */
function kindFor(subtitle: string): CurriculumKind {
  if (/Counselor Review|Counselor Verification|Tracking/.test(subtitle)) return "counselor-verified";
  return "auto";
}

function windowFor(index: number, total: number): CurriculumWindow {
  if (index < total / 3) return "fall";
  if (index < (2 * total) / 3) return "winter";
  return "spring";
}

function toItem(card: MilestoneCard, grade: 9 | 10 | 11 | 12, index: number, total: number): CurriculumItem {
  return {
    id: `${grade}-${slug(card.name)}`,
    grade,
    name: card.name,
    classification: card.subtitle,
    kind: kindFor(card.subtitle),
    window: windowFor(index, total),
    total: card.total,
    completed: card.completed,
    inProgress: card.inProgress,
    needsAttention: card.needsAttention,
    notStarted: card.notStarted,
    notApplicable: card.notApplicable ?? 0,
    donePct: card.pct,
  };
}

export function curriculumForGrade(grade: 9 | 10 | 11 | 12): CurriculumItem[] {
  const cards = GRADE_READINESS[grade].cards;
  return cards.map((c, i) => toItem(c, grade, i, cards.length));
}

export function curriculumItemById(grade: 9 | 10 | 11 | 12, id: string): CurriculumItem | undefined {
  return curriculumForGrade(grade).find((i) => i.id === id);
}

/** The grade's own one-line description, the reference's own words
 *  (dropped from an earlier pass as "explained the grade, not the state
 *  of it" -- restored as the section's own caption, where it does not
 *  compete with the per-checkpoint stats). */
export function curriculumFocus(grade: 9 | 10 | 11 | 12): string {
  return GRADE_READINESS[grade].focus;
}
/** The reference's own precomputed grade average, used verbatim rather
 *  than an average of the cards recomputed here. */
export function curriculumAvgDone(grade: 9 | 10 | 11 | 12): number {
  return GRADE_READINESS[grade].avgDone;
}

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Every seeded student in the grade, bucketed into a status for this one
 *  checkpoint, sized to match the checkpoint's own counts exactly (so a
 *  drill-through list's length always equals what the row itself claims).
 *  The live student (this browser) has no signal tying the reference's
 *  own curriculum names to real Dreamari data -- there is no such mapping
 *  to invent -- so they read "in progress" here, same convention as an
 *  unscored row elsewhere in this dashboard. */
export function statusesForItem(item: CurriculumItem, gradeRoster: CounselorStudent[]): Map<string, CurriculumStatus> {
  const seeded = gradeRoster.filter((s) => !s.isReal);
  const ranked = seeded.map((s) => ({ id: s.id, rank: hash(`${item.id}:${s.id}`) })).sort((a, b) => a.rank - b.rank);
  const map = new Map<string, CurriculumStatus>();
  let i = 0;
  const take = (n: number, status: CurriculumStatus) => { for (let k = 0; k < n && i < ranked.length; k++, i++) map.set(ranked[i].id, status); };
  take(item.completed, "done");
  take(item.needsAttention, "awaiting-review");
  take(item.inProgress, "in-progress");
  take(item.notStarted, "not-started");
  take(item.notApplicable, "not-tracked");
  for (const s of gradeRoster) if (s.isReal) map.set(s.id, "in-progress");
  return map;
}

export const CURRICULUM_KIND_LABEL: Record<CurriculumKind, string> = {
  auto: "Student completes",
  "counselor-verified": "You verify",
};
