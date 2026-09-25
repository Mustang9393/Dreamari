// Counselor review decisions -- the one place an Approve / Request Changes
// on the Review Queue is recorded, so every screen that counts or shows a
// student's milestone state reads the same answer. Before this, a decision
// lived only in the Review Queue's own component state: the roster never
// learned about it, Settings' "Pending Reviews" and Student Progress'
// "Counselor Review Activity" each counted pending items their own way, and
// none of the three moved when a counselor actually reviewed something.
// Same localStorage-as-record idiom as counselorNotes.ts; a decision is
// real counselor input whether the submission underneath it is seeded or
// live. Used by the v2 fork of the dashboard (see counselor/version.tsx).

import { useMemo, useSyncExternalStore } from "react";
import { getRosterWithLive, getStudentById, MILESTONE_KEYS, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "./counselorRoster";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "./counselorAccount";
import { scopeRosterForRole } from "./counselorOrg";

const KEY = "dreamari:counselor-reviews";

export type ReviewDecision = {
  studentId: string;
  milestone: MilestoneKey;
  status: "Approved" | "Changes Requested";
  feedback: string;
  decidedAt: string;
};

export function reviewItemId(studentId: string, milestone: MilestoneKey): string {
  return `${studentId}::${milestone}`;
}

type Decisions = Record<string, ReviewDecision>;

const EMPTY: Decisions = {};
let cache: { raw: string | null; parsed: Decisions } = { raw: null, parsed: EMPTY };
const listeners = new Set<() => void>();

function readAll(): Decisions {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  // Snapshot identity must be stable between reads or useSyncExternalStore
  // re-renders forever; only reparse when the stored string changed.
  if (raw === cache.raw) return cache.parsed;
  let parsed: Decisions = EMPTY;
  try {
    const p: unknown = raw ? JSON.parse(raw) : {};
    if (p && typeof p === "object") parsed = p as Decisions;
  } catch {
    parsed = EMPTY;
  }
  cache = { raw, parsed };
  return parsed;
}

function writeAll(all: Decisions): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // no storage: still works this session
  }
  cache = { raw: null, parsed: EMPTY };
  listeners.forEach((l) => l());
}

export function subscribeReviews(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function readDecisions(): Decisions {
  return readAll();
}

export function decideReview(studentId: string, milestone: MilestoneKey, status: ReviewDecision["status"], feedback: string): void {
  const all = { ...readAll() };
  all[reviewItemId(studentId, milestone)] = { studentId, milestone, status, feedback: feedback.trim(), decidedAt: new Date().toISOString() };
  writeAll(all);
}

export function undoReview(studentId: string, milestone: MilestoneKey): void {
  const all = { ...readAll() };
  delete all[reviewItemId(studentId, milestone)];
  writeAll(all);
}

/** A student with every recorded decision applied over their seeded/live
 *  milestone states. Pure: never mutates the roster's own row. */
export function applyDecisions(student: CounselorStudent, decisions: Decisions = readAll()): CounselorStudent {
  let milestones: Record<MilestoneKey, MilestoneStatus> | null = null;
  for (const key of MILESTONE_KEYS) {
    const d = decisions[reviewItemId(student.id, key)];
    if (!d) continue;
    if (!milestones) milestones = { ...student.milestones };
    milestones[key] = d.status;
  }
  return milestones ? { ...student, milestones } : student;
}

let rosterCache: { decisions: Decisions; roster: CounselorStudent[] } | null = null;

/** getRosterWithLive() with decisions applied. Memoized per decisions snapshot so
 *  repeated calls in one render return the same array. */
export function getReviewedRoster(): CounselorStudent[] {
  const decisions = readAll();
  if (rosterCache && rosterCache.decisions === decisions) return rosterCache.roster;
  const roster = getRosterWithLive().map((s) => applyDecisions(s, decisions));
  rosterCache = { decisions, roster };
  return roster;
}

export function getReviewedStudentById(id: string): CounselorStudent | undefined {
  const s = getStudentById(id);
  return s ? applyDecisions(s) : undefined;
}

export function useReviewDecisions(): Decisions {
  return useSyncExternalStore(subscribeReviews, readAll, () => EMPTY);
}

/** The roster every v2 screen should read: the students the signed-in role
 *  may see (scopeRosterForRole: a School Counselor's own caseload, the whole
 *  school for Lead Counselor and School Administrator), with every review
 *  decision applied. Re-renders when a decision is recorded or undone, or
 *  the role changes. Memoized per (decisions, account) so one render gets
 *  one array. */
export function useReviewedRoster(): CounselorStudent[] {
  useReviewDecisions();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const roster = getReviewedRoster();
  return useMemo(() => scopeRosterForRole(roster, account), [roster, account]);
}

/** The whole school regardless of role, for the few places that compare
 *  caseloads (the Lead Counselor's Overview ranks every counselor even
 *  though, by role, it already sees everyone). */
export function useSchoolReviewedRoster(): CounselorStudent[] {
  useReviewDecisions();
  return getReviewedRoster();
}
