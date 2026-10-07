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

/** The latest reminder for one student's milestone. */
export function lastReminder(list: Reminder[], studentId: string, milestone: MilestoneKey): Reminder | undefined {
  return list.find((r) => r.studentId === studentId && r.milestone === milestone);
}

/** "Oct 8" */
export function reminderDate(r: Reminder): string {
  return new Date(r.at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
