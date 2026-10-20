"use client";

// v7's reads over the shared counselor data. Nothing here is a new source:
// the roster and review decisions (counselorReviews), the meetings every
// build shares (counselorMeetings, which also holds the meetings students
// book from My Plan), and the share log. Only the prep status and the
// Confirm / Decline answer on a requested meeting are v7's own.

import { useMemo } from "react";
import { createLocalRecord, isoDay } from "@/lib/localRecord";
import { useAddedMeetings, seededMeetings, type Meeting } from "@/lib/counselorMeetings";
import { MILESTONE_KEYS, milestonesForGrade, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";

/** Every meeting, seeded and booked, with its student on the roster. */
export function useAllMeetings(roster: CounselorStudent[]) {
  const added = useAddedMeetings();
  return useMemo(() => {
    const ids = new Set(roster.map((s) => s.id));
    return [...seededMeetings(roster, new Date()), ...added].filter((m) => ids.has(m.studentId)).sort((a, b) => `${a.day}${a.time}`.localeCompare(`${b.day}${b.time}`));
  }, [roster, added]);
}

export function mondayOf(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
}
export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
export function inWeek(m: Meeting, monday: Date): boolean {
  return m.day >= isoDay(monday) && m.day <= isoDay(addDays(monday, 6));
}

// ---- what a meeting needs from the counselor -------------------------------

/** The student's open items, said the way the Replit says them ("Career
 *  Report overdue", "Academic Plan needs changes"), worst first. */
export function flagsFor(s: CounselorStudent): string[] {
  const keys = milestonesForGrade(s.grade);
  const out: string[] = [];
  for (const k of keys) if (s.milestones[k] === "Overdue") out.push(`${k} overdue`);
  for (const k of keys) if (s.milestones[k] === "Changes Requested") out.push(`${k} needs changes`);
  for (const k of keys) if (s.milestones[k] === "Pending Review") out.push(`${k} to review`);
  const notStarted = keys.filter((k) => s.milestones[k] === "Not Started").length;
  if (notStarted >= 2) out.push(`${notStarted} milestones not started`);
  return out;
}

export type Prep = "requested" | "action" | "prep" | "ready";
export const PREP_LABEL: Record<Prep, string> = { requested: "Requested", action: "Action required", prep: "Needs prep", ready: "Ready" };
export const PREP_DOT: Record<Prep, string> = {
  requested: "var(--color-brand-400, var(--primary))",
  action: "var(--color-feedback-danger-solid)",
  prep: "var(--color-feedback-warning-solid)",
  ready: "color-mix(in srgb, var(--foreground) 35%, transparent)",
};

// A meeting a student booked themselves (My Plan's Book a meeting writes
// through addMeeting with the topic they typed) waits for the counselor's
// answer. Seeded meetings are already on the calendar.
type Answer = "confirmed" | "declined";
const answers = createLocalRecord<Record<string, Answer>>("dreamari-counselor-v7-meeting-answers", {});
export const useAnswers = () => answers.useValue();
export function answerMeeting(id: string, a: Answer) {
  answers.update((m) => ({ ...m, [id]: a }));
}
// Opening the brief is the prep (the Replit's Prepare button).
const prepped = createLocalRecord<Record<string, true>>("dreamari-counselor-v7-prepped", {});
export const usePrepped = () => prepped.useValue();
export function markPrepped(id: string) {
  prepped.update((m) => ({ ...m, [id]: true }));
}

export function prepFor(m: Meeting, s: CounselorStudent, booked: boolean, ans: Record<string, Answer>, done: Record<string, true>): Prep {
  if (booked && !ans[m.id]) return "requested";
  if (done[m.id]) return "ready";
  if (s.status === "At Risk" && m.type === "Check-in") return "action";
  return flagsFor(s).length ? "prep" : "ready";
}

/** The milestone a review queue opens on: the one with the most waiting. */
export function pendingCount(roster: CounselorStudent[]): number {
  let n = 0;
  for (const s of roster) for (const k of MILESTONE_KEYS) if (s.milestones[k as MilestoneKey] === "Pending Review") n++;
  return n;
}
