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
