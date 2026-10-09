// Milestone reminders the counselor sent from the Review Desk or a student's
// profile (8 Oct 2026 audit: "Send a reminder" only flipped a local flag, so
// the queue forgot it on reload and the profile never knew). One entry per
// send; the latest per student and milestone is what screens show
// ("Reminded Oct 8"). Each reminder is also recorded as a send, so it lists
// in Connect's Sent tab and on the student's profile. DEMO-ONLY: stored in
// this browser until reminders go through the messaging backend.

import { addSend } from "./counselorCasefile";
import type { MilestoneKey } from "./counselorRoster";
import { createLocalRecord } from "./localRecord";

export type Reminder = { studentId: string; milestone: MilestoneKey; at: string };

const store = createLocalRecord<Reminder[]>("dreamari-counselor-milestone-reminders", []);

export function useReminders(): Reminder[] {
  return store.useValue();
}

/** `name` labels the send in Connect's Sent list. */
export function sendReminder(studentId: string, milestone: MilestoneKey, name?: string): void {
  store.update((list) => [{ studentId, milestone, at: new Date().toISOString() }, ...list].slice(0, 300));
  addSend({ kind: "reminder", text: `A reminder to finish your ${milestone}. Open My Plan to see what is left, or reply if you need help.`, studentIds: [studentId], audience: name ? `${name} · ${milestone}` : milestone });
}

/** A nudge (10 Oct 2026, Review's In progress and Missed deadline): one
 *  note per student covering all their drafts, in the words the counselor
 *  read and approved. Still one reminder entry per milestone, so every
 *  "Reminded Oct 8" stays right; one send for the whole batch, so Sent
 *  lists it once with the note as written (tokens and all for a batch). */
export function sendNudge(students: { id: string; milestones: MilestoneKey[] }[], text: string, audience: string): void {
  const at = new Date().toISOString();
  const entries = students.flatMap((s) => s.milestones.map((milestone) => ({ studentId: s.id, milestone, at })));
  store.update((list) => [...entries, ...list].slice(0, 300));
  addSend({ kind: "reminder", text, studentIds: students.map((s) => s.id), audience });
}

/** The latest reminder for one student's milestone. */
export function lastReminder(list: Reminder[], studentId: string, milestone: MilestoneKey): Reminder | undefined {
  return list.find((r) => r.studentId === studentId && r.milestone === milestone);
}

/** "Oct 8" */
export function reminderDate(r: Reminder): string {
  return new Date(r.at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
