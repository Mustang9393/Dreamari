// Prepare > Meetings, the engaging pass (10 Oct 2026, Chandu: "Meetings and
// messages and their subtabs ... need super engaging and exciting like we
// did for awaiting me just now"). The small model behind it: a ticking
// clock for the next meeting's countdown, Dreamy's one-line drafts (a
// talking point before a meeting, the note a logged meeting saves, the
// invite Needs Outreach sends), what a student last sent, and the invites
// store. Kept out of the components so Meetings.tsx and MeetingsNext.tsx
// read as layout.

import { useSyncExternalStore } from "react";
import { createLocalRecord } from "@/lib/localRecord";
import { MILESTONE_KEYS, attentionReason, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import type { Meeting, OfficeHours } from "@/lib/counselorMeetings";
import { submissionFor } from "../v5/submission";

// ---- a clock -----------------------------------------------------------------
// One interval per granularity, shared by every reader, running only while
// something reads it. The server snapshot is 0, so the first client render
// matches the server and the live value lands right after.
function makeClock(ms: number) {
  let t = 0;
  let timer: number | undefined;
  const subs = new Set<() => void>();
  const subscribe = (l: () => void) => {
    subs.add(l);
    if (subs.size === 1) {
      t = Date.now();
      timer = window.setInterval(() => { t = Date.now(); subs.forEach((s) => s()); }, ms);
    }
    return () => {
      subs.delete(l);
      if (!subs.size) window.clearInterval(timer);
    };
  };
  const snap = () => {
    if (!t) t = Date.now();
    return Math.floor(t / ms) * ms;
  };
  return () => useSyncExternalStore(subscribe, snap, () => 0);
}
/** Ticks every second (the countdown). */
export const useSecondClock = makeClock(1000);
/** Ticks every minute (which meeting is next, which are over). */
export const useMinuteClock = makeClock(60000);

/** "2d 8h", "3h 12m", "12:04", or null once it has started. */
export function countdown(ms: number): string | null {
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${String(m).padStart(2, "0")}m`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function meetingStart(m: Meeting): Date {
  const [y, mo, d] = m.day.split("-").map(Number);
  const [h, mi] = m.time.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi);
}

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** "Tue, Oct 13", or "Today" / "Tomorrow". */
export function dayWord(day: string, now: Date): string {
  if (day === iso(now)) return "Today";
  if (day === iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))) return "Tomorrow";
  const d = new Date(`${day}T12:00:00`);
  return `${DAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`;
}

// ---- what the student last sent ----------------------------------------------
/** The furthest milestone the student has handed in, and where it stands:
 *  waiting on the counselor first (that is the one to read before the
 *  meeting), then sent back, then approved. */
export function lastSent(s: CounselorStudent): { milestone: MilestoneKey; state: "waiting" | "changes" | "approved"; daysAgo: number } | null {
  const keys = [...MILESTONE_KEYS].reverse();
  const pick = (st: string[]) => keys.find((k) => st.includes(s.milestones[k]));
  const waiting = pick(["Pending Review"]);
  if (waiting) return { milestone: waiting, state: "waiting", daysAgo: submissionFor(s, waiting).sentDaysAgo };
  const changes = pick(["Changes Requested"]);
  if (changes) return { milestone: changes, state: "changes", daysAgo: submissionFor(s, changes).sentDaysAgo };
  const approved = pick(["Approved", "Completed"]);
  if (approved) return { milestone: approved, state: "approved", daysAgo: submissionFor(s, approved).sentDaysAgo + 6 };
  return null;
}

// ---- Dreamy's drafts ---------------------------------------------------------
// DEMO-ONLY: templated wording until drafts come from the model. Short
// words, one idea per sentence, no dashes.
const OPENER: Record<Meeting["type"], (first: string, s: CounselorStudent) => string> = {
  Applications: (f) => `Ask ${f} to name one reach, one match and one safety school.`,
  "Financial aid": (f) => `Walk ${f} through the FAFSA steps and the next deadline.`,
  "Course planning": (f) => `Check ${f}'s credits, then pick next year's classes together.`,
  Resume: (f) => `Open ${f}'s resume and add one new skill together.`,
  "Career exploration": (f, s) => `Ask what ${f} liked about ${s.topMatches[0]?.title ?? "their top career"}, then find a shadow day.`,
  "Check-in": (f) => `Ask how ${f} is doing this week, and listen first.`,
};

/** The second sentence: what to do about why they are flagged, as an
 *  action, so it never repeats the facts line above it word for word. */
function nextStep(reason: string): string {
  let m: RegExpMatchArray | null;
  if ((m = reason.match(/^(.+) overdue$/))) return `Then set a new date for the ${m[1]}.`;
  if ((m = reason.match(/^(.+) needs changes$/))) return `Then fix the ${m[1]} together.`;
  if (/^\d+ milestones not started$/.test(reason)) return "Then pick one milestone to start this week.";
  if ((m = reason.match(/^(.+?)( and .+)? not started$/))) return `Then start the ${m[1]} together.`;
  return "Then pick one next step on the roadmap.";
}

/** One or two short sentences to open the meeting with. */
export function talkingPoint(s: CounselorStudent, m: Meeting): string {
  const first = s.name.split(" ")[0];
  const open = OPENER[m.type](first, s);
  if (s.status === "On Track") return open;
  return `${open} ${nextStep(attentionReason(s))}`;
}

/** The note a one-tap "Log it" saves on the meeting. */
export function logNote(m: Meeting): string {
  return m.topic ? `${m.type}. They asked: ${m.topic}` : `${m.type}. Talked it through.`;
}

const short = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""}`; };
const ampm = (t: string) => (Number(t.split(":")[0]) < 12 ? "AM" : "PM");

/** The next office-hours day from tomorrow on: "Tue, Oct 13, 10 to 11:30 AM". */
export function nextOfficeHours(hours: OfficeHours, now: Date): string | null {
  for (let k = 1; k < 15; k++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
    const oh = hours.find((o) => o.weekday === d.getDay());
    if (!oh) continue;
    const range = ampm(oh.from) === ampm(oh.to) ? `${short(oh.from)} to ${short(oh.to)} ${ampm(oh.to)}` : `${short(oh.from)} ${ampm(oh.from)} to ${short(oh.to)} ${ampm(oh.to)}`;
    return `${DAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}, ${range}`;
  }
  return null;
}

/** Dreamy's invite as a template: {first} is each student's first name.
 *  The office hours are written in, so the counselor reads the real day. */
export function inviteTemplate(when: string | null): string {
  return `Hi {first}! Can you stop by my office hours${when ? `, ${when}` : ""}? I want to help with your next step.`;
}
export function fillInvite(template: string, s: CounselorStudent): string {
  return template.split("{first}").join(s.name.split(" ")[0]);
}

// ---- outreach --------------------------------------------------------------
// DEMO-ONLY: an invite is a local record until messages have a backend. Its
// shape is the real one (who, when, what it said); a real send would go
// through Connect. `done` is the counselor's own "Done" on the row: nothing
// leaves the list until they click it (10 Oct 2026: "Dont make them
// disappear unless i click done").
type Outreach = Record<string, { at?: string; text?: string; done?: string }>;
const outreach = createLocalRecord<Outreach>("dreamari-counselor-outreach-invites", {});
export function useInvites(): Outreach {
  return outreach.useValue();
}
export function sendInvite(studentId: string, text: string): void {
  outreach.update((all) => ({ ...all, [studentId]: { ...all[studentId], at: new Date().toISOString(), text } }));
}
export function undoInvite(studentId: string): void {
  outreach.update((all) => {
    const next = { ...all };
    delete next[studentId];
    return next;
  });
}
export function markOutreachDone(studentId: string): void {
  outreach.update((all) => ({ ...all, [studentId]: { ...all[studentId], done: new Date().toISOString() } }));
}
