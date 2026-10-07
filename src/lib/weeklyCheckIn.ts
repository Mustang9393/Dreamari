// The student's weekly check-in (8 Oct 2026; Chandu: "there's a '1 check-in
// needs a response today' but there's no check-in system built"). Four
// areas, good / okay / low, and an optional note, once a week from Home. The
// counselor side (counselor/v5/family.ts checkInFor) reads this for the live
// student; seeded students keep their seeded answers. DEMO-ONLY storage:
// this browser's localStorage until the backend stores check-ins.

import { createLocalRecord } from "./localRecord";

export type CheckLevel = "good" | "okay" | "low";
export const CHECK_AREAS = ["Mood", "Friends", "Sleep and health", "School"] as const;
export type CheckArea = (typeof CHECK_AREAS)[number];
export type WeeklyAnswer = { week: string; at: string; levels: Record<CheckArea, CheckLevel>; note?: string };

const record = createLocalRecord<WeeklyAnswer | null>("dreamari:weekly-checkin", null);

/** Monday of this week, YYYY-MM-DD (one check-in per week). */
export function weekKey(now = new Date()): string {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

/** This week's answer, or null when the student has not checked in yet. */
export function readWeeklyCheckIn(): WeeklyAnswer | null {
  const a = record.read();
  return a && a.week === weekKey() ? a : null;
}

export function useWeeklyCheckIn(): WeeklyAnswer | null {
  const a = record.useValue();
  return a && a.week === weekKey() ? a : null;
}

export function submitWeeklyCheckIn(levels: Record<CheckArea, CheckLevel>, note?: string): void {
  record.write({ week: weekKey(), at: new Date().toISOString(), levels, note: note?.trim() || undefined });
}

// ---- counselor-sent requests (8 Oct 2026; Chandu: "remove the 'how's your
// week' thing from the student side. Just make sure there is a workflow to
// trigger these from the counselor side") --------------------------------
// The student no longer sees a standing card. A counselor sends a check-in
// (everyone, a grade, the ones who haven't answered, or one student); the
// student gets it as a notification and answers in a sheet.

export type CheckInRequest = { id: string; at: string; label: string; studentIds: string[]; count: number; note?: string };
const requests = createLocalRecord<CheckInRequest[]>("dreamari:checkin-requests", []);
/** the live student's id on the counselor roster */
export const LIVE_STUDENT_ID = "real-student";

export function useCheckInRequests(): CheckInRequest[] {
  return requests.useValue();
}
export function sendCheckInRequest(r: Omit<CheckInRequest, "id" | "at">): CheckInRequest {
  const entry: CheckInRequest = { ...r, id: `ci-${Date.now().toString(36)}`, at: new Date().toISOString() };
  requests.update((list) => [entry, ...list].slice(0, 50));
  return entry;
}
/** The newest request that reached the live student and that they have not
 *  answered since it was sent. */
export function pendingCheckIn(list: CheckInRequest[], answer: WeeklyAnswer | null): CheckInRequest | null {
  const mine = list.find((r) => r.studentIds.includes(LIVE_STUDENT_ID));
  if (!mine) return null;
  if (answer && new Date(answer.at) >= new Date(mine.at)) return null;
  return mine;
}
