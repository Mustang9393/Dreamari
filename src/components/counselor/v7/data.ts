"use client";

// v7's reads over the shared counselor data. Nothing here is a new source:
// the roster and review decisions (counselorReviews), the meetings every
// build shares (counselorMeetings, which also holds the meetings students
// book from My Plan), and the share log. Only the prep status and the
// Confirm / Decline answer on a requested meeting are v7's own.

import { useMemo } from "react";
import { createLocalRecord, isoDay, seedHash } from "@/lib/localRecord";
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

// DEMO-ONLY: a GPA per student, until the SIS feed carries one. The Replit's
// directory filters by GPA (3.5+, 3.0 to 3.49, 2.5 to 2.99, below 2.5, not
// entered); the seed leans on status so the bands look believable, and
// about one in nine students has none entered.
export function gpaOf(s: CounselorStudent): number | null {
  const h = seedHash(`gpa-${s.id}`);
  if (h % 9 === 0) return null;
  const base = s.status === "At Risk" ? 2.1 : s.status === "Needs Attention" ? 2.6 : 3.1;
  return Math.round((base + ((h % 100) / 100) * 0.9) * 10) / 10;
}
export type GpaBand = "all" | "3.5" | "3.0" | "2.5" | "low" | "none";
export const GPA_BANDS: { value: GpaBand; label: string }[] = [
  { value: "all", label: "Any GPA" }, { value: "3.5", label: "3.5 and up" }, { value: "3.0", label: "3.0 to 3.49" }, { value: "2.5", label: "2.5 to 2.99" }, { value: "low", label: "Below 2.5" }, { value: "none", label: "Not entered" },
];
export function inGpaBand(s: CounselorStudent, band: GpaBand): boolean {
  if (band === "all") return true;
  const g = gpaOf(s);
  if (band === "none") return g === null;
  if (g === null) return false;
  if (band === "3.5") return g >= 3.5;
  if (band === "3.0") return g >= 3 && g < 3.5;
  if (band === "2.5") return g >= 2.5 && g < 3;
  return g < 2.5;
}
