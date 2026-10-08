// The data behind Students > Milestones (9 Oct 2026, Maisha's merge of the
// old Milestones and Student Progress tabs into one page). One model, two
// readings: By Milestone (a row per checkpoint) and By Student (a row per
// student), built from the same per-student statuses so the two can never
// disagree.
//
// Milestones are the reference's per-grade curriculum
// (counselorCurriculum.ts: Grade 9 has 7, Grade 10 has 8, Grade 11 has 11,
// Grade 12 has 10), because Maisha's own examples are that list verbatim:
// "Career Goals · 77% complete · 23 Done · 4 In Progress · 1 Needs
// Attention · 2 Not Started" is Grade 9's Career Goals row, and "30
// Students · 7 Milestones" is one grade of it. Each student's status per
// checkpoint is `statusesForItem`, which reads the student's real milestone
// status where the checkpoint has one (CHECKPOINT_MILESTONE) and the
// seeded, count-matched assignment otherwise.

import type { LucideIcon } from "lucide-react";
import { Award, BadgeDollarSign, Briefcase, ClipboardCheck, Compass, FileText, Flag, GraduationCap, ListChecks, Map as MapIcon, MessageSquareText, Mic, Route, ScrollText, Send, Signature, Target, UserRound } from "lucide-react";
import { CHECKPOINT_MILESTONE, curriculumForGrade, statusesForItem, type CurriculumItem, type CurriculumStatus } from "@/lib/counselorCurriculum";
import type { CaseloadStatus, CounselorStudent, MilestoneKey, MilestoneStatus } from "@/lib/counselorRoster";
import { MILESTONE_ICON } from "../v5/milestoneIcons";
import { NEUTRAL_SLICE } from "./palette";

export type Grade = 9 | 10 | 11 | 12;
export const GRADES: Grade[] = [9, 10, 11, 12];

export type MState = "done" | "in-progress" | "attention" | "not-started";
// Maisha's four states in her order (done / in progress / needs attention /
// not started), in the status colors the v4 tracker already used: done
// green, someone on it the brand blue, needs attention amber, not started
// neutral.
export const M_STATES: { key: MState; label: string; color: string }[] = [
  { key: "done", label: "Done", color: "var(--v4-ok)" },
  { key: "in-progress", label: "In Progress", color: "var(--v4-step-2)" },
  { key: "attention", label: "Needs Attention", color: "var(--v4-warn)" },
  { key: "not-started", label: "Not Started", color: NEUTRAL_SLICE },
];
export const M_LABEL: Record<MState, string> = { done: "Done", "in-progress": "In Progress", attention: "Needs Attention", "not-started": "Not Started" };
const FROM_CURRICULUM: Partial<Record<CurriculumStatus, MState>> = { done: "done", "in-progress": "in-progress", "awaiting-review": "attention", "not-started": "not-started" };

export type Counts = Record<MState, number>;
const zero = (): Counts => ({ done: 0, "in-progress": 0, attention: 0, "not-started": 0 });

export type Entry = { s: CounselorStudent; state: MState; raw?: MilestoneStatus };
export type MilestoneRow = {
  item: CurriculumItem;
  grade: Grade;
  /** The roster milestone this checkpoint measures, when it has one: the
   *  review desk's submissions are keyed by it. */
  key?: MilestoneKey;
  entries: Entry[];
  counts: Counts;
  total: number;
  pct: number;
  /** Students whose submission sits in the counselor's review queue. */
  waiting: CounselorStudent[];
};
export type Mark = { item: CurriculumItem; state: MState };
export type StudentRow = { s: CounselorStudent; marks: Mark[]; counts: Counts; total: number; pct: number };
export type Model = { rows: Record<Grade, MilestoneRow[]>; students: StudentRow[] };

const pctOf = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

/** Both readings at once. `inScope` narrows to one counselor's caseload
 *  (Lead Counselor); the per-checkpoint assignment still runs over the
 *  whole grade so a student lands in the same bucket either way. */
export function buildModel(roster: CounselorStudent[], inScope: (s: CounselorStudent) => boolean): Model {
  const rows = {} as Record<Grade, MilestoneRow[]>;
  const marks = new Map<string, Mark[]>();
  for (const g of GRADES) {
    const gradeRoster = roster.filter((s) => s.grade === g);
    const scoped = gradeRoster.filter(inScope);
    rows[g] = curriculumForGrade(g).map((item) => {
      const statuses = statusesForItem(item, gradeRoster);
      const key = CHECKPOINT_MILESTONE[g]?.[item.name];
      const entries: Entry[] = [];
      const counts = zero();
      for (const s of scoped) {
        const state = FROM_CURRICULUM[statuses.get(s.id) ?? "not-tracked"];
        if (!state) continue;
        const raw = key ? s.milestones[key] : undefined;
        entries.push({ s, state, raw });
        counts[state]++;
        const list = marks.get(s.id) ?? [];
        list.push({ item, state });
        marks.set(s.id, list);
      }
      const total = entries.length;
      return { item, grade: g, key, entries, counts, total, pct: pctOf(counts.done, total), waiting: entries.filter((e) => e.raw === "Pending Review").map((e) => e.s) };
    });
  }
  const students = roster.filter(inScope).map((s) => {
    const m = marks.get(s.id) ?? [];
    const counts = zero();
    for (const x of m) counts[x.state]++;
    return { s, marks: m, counts, total: m.length, pct: pctOf(counts.done, m.length) };
  });
  return { rows, students };
}

export function sumCounts(list: { counts: Counts }[]): Counts {
  const c = zero();
  for (const x of list) for (const k of Object.keys(c) as MState[]) c[k] += x.counts[k];
  return c;
}
export const totalOf = (c: Counts) => c.done + c["in-progress"] + c.attention + c["not-started"];
export const pctDone = (c: Counts) => pctOf(c.done, totalOf(c));
export const needsHelp = (s: CounselorStudent) => s.status !== "On Track";

// The reference's classification, cut to the short type label Maisha asked
// for ("small label of its type (e.g. 'Counselor Review')"): the counselor's
// part when the counselor has one, the student's part otherwise.
export function typeLabel(classification: string): string {
  if (/Counselor Review/.test(classification)) return "Counselor Review";
  if (/Counselor Verification/.test(classification)) return "Counselor Verification";
  if (/Tracking/.test(classification)) return "Counselor Tracking";
  return classification.split("/")[0].trim();
}
/** Milestones whose next step is the counselor's own (review or verify). */
export const isCounselorStep = (classification: string) => /Counselor (Review|Verification|Tracking)/.test(classification);

// v5's small icon per milestone (Maisha, 7 Oct 2026: "recurring words ...
// could have icons so the eye gets a break"). A checkpoint tied to a roster
// milestone wears that milestone's icon; the rest match by name.
const BY_NAME: [RegExp, LucideIcon][] = [
  [/assessment|interest/i, Compass],
  [/resume/i, UserRound],
  [/course plan|academic plan/i, MapIcon],
  [/pathway focus/i, Route],
  [/goal/i, Target],
  [/reflection/i, MessageSquareText],
  [/experience|work-based/i, Briefcase],
  [/recommendation/i, Signature],
  [/financial|fafsa|afford/i, BadgeDollarSign],
  [/transcript|document/i, ScrollText],
  [/graduation/i, Award],
  [/interview/i, Mic],
  [/decision|transition/i, Flag],
  [/application|deadline|admission/i, Send],
  [/postsecondary list/i, ClipboardCheck],
  [/postsecondary|college/i, GraduationCap],
  [/career/i, FileText],
];
export function milestoneIcon(row: Pick<MilestoneRow, "key" | "item">): LucideIcon {
  if (row.key) return MILESTONE_ICON[row.key];
  return BY_NAME.find(([re]) => re.test(row.item.name))?.[1] ?? ListChecks;
}

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** What sits behind one student's state on one milestone, in a few words
 *  ("5 days overdue", "Waiting for you"). */
export function entryNote(e: Entry, item: CurriculumItem): string {
  if (e.state !== "attention") return M_LABEL[e.state];
  if (e.raw === "Pending Review") return "Waiting for you";
  if (e.raw === "Changes Requested") return "Changes requested";
  // DEMO-ONLY: the roster has no due dates, so how late an overdue step is
  // is seeded per student and milestone (stable, 2 to 13 days).
  return `${2 + (hash(`${item.id}:${e.s.id}`) % 12)} days overdue`;
}
// Intervention first in every student list (Maisha: "See issue → identify
// students → take action").
export const STATE_RANK: Record<MState, number> = { attention: 0, "not-started": 1, "in-progress": 2, done: 3 };
export const STATUS_RANK: Record<CaseloadStatus, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };

/** Prepare > Reviews, filtered to these students' submissions for this
 *  milestone (the review desk reads milestone and ids). */
export function reviewHref(key: MilestoneKey, ids: string[]): string {
  return `/counselor?v=4&view=review-queue&milestone=${encodeURIComponent(key)}&ids=${ids.map(encodeURIComponent).join(",")}`;
}
/** Prepare > Reviews, filtered to these students' submissions (any milestone). */
export const reviewHrefIds = (ids: string[]) => `/counselor?v=4&view=review-queue&ids=${ids.map(encodeURIComponent).join(",")}`;
export const studentHref = (id: string) => `/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`;
export const messageHref = (ids: string[]) => `/counselor?view=connect&compose=1&ids=${ids.map(encodeURIComponent).join(",")}&v=4`;
