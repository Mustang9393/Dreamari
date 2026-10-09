"use client";

// WHY (10 Oct 2026, Chandu on Prepare > Assist: "I think the assist one
// shouldnt have a drop down for students, rather a search bar and maybe
// requests should be populated? ... I like assist right now how do we
// gamify it and make it more engaging?"). The small model behind Assist as
// a session, kept out of the components so they read as layout:
// - what is waiting: Dreamy's queue, built from the real stores (letter
//   requests, upcoming meetings that need a brief, past meetings with no
//   summary yet), so Assist opens on work, not a blank form;
// - what is done: a draft counts as done when the counselor copies, prints
//   or saves it to notes (the three ways a draft already left Assist);
// - time saved: fixed per-format estimates, summed for the week, the way
//   Grammarly's weekly stats count what the tool did for you;
// - recent students, for the search box's focus list.

import { useMemo, useState } from "react";
import { createLocalRecord, shortDate } from "@/lib/localRecord";
import { letterRequests, useLetterOverrides } from "@/lib/counselorLetters";
import { isPast, seededMeetings, timeLabel, useAddedMeetings, type Meeting } from "@/lib/counselorMeetings";
import type { CounselorStudent } from "@/lib/counselorRoster";
import type { DocKind } from "./DocumentDesk";
import { dayWord, meetingStart, useMinuteClock } from "./meetingsModel";

export type AssistItem = {
  /** the same key a saved draft uses (counselorDrafts.draftKey) */
  key: string;
  student: CounselorStudent;
  kind: DocKind;
  /** for a letter: the request's type */
  letterType: string;
  /** why Dreamy put it here, a lowercase fragment after the format: "due Oct 15" */
  why: string;
};

// DEMO-ONLY: minutes a counselor would spend writing each format from a
// blank page. Fixed estimates until real timing data exists.
export const MINUTES_SAVED: Record<DocKind, number> = {
  "recommendation-letter": 25,
  "student-brief": 10,
  "parent-brief": 12,
  "meeting-summary": 8,
  "success-plan": 15,
  "brag-sheet": 5,
  "family-questionnaire": 5,
};
// DEMO-ONLY: what Dreamy saved earlier this week, before this browser
// started counting, so the weekly figure never opens on zero.
const SEED_WEEK_MINUTES = 47;

const LETTER_OPEN = new Set(["In Progress", "Pending Review"]);

/** Dreamy's queue: up to two letters (soonest due), two meeting briefs
 *  (today's meetings, or the next day with any) and two summaries (the most
 *  recent meetings already over). The clock is read once, so the queue
 *  holds still for the whole session. */
export function useAssistQueue(roster: CounselorStudent[]): AssistItem[] {
  const tick = useMinuteClock();
  const [t0, setT0] = useState(0);
  if (tick && !t0) setT0(tick);
  const overrides = useLetterOverrides();
  const meetings = useMeetings(roster);
  if (!t0) return [];
  const now = new Date(t0);
  const byId = new Map(roster.map((s) => [s.id, s]));
  const out: AssistItem[] = [];
  const seen = new Set<string>();
  const push = (s: CounselorStudent | undefined, kind: DocKind, letterType: string, why: string) => {
    if (!s) return;
    const key = `${s.id}:${kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ key, student: s, kind, letterType, why });
  };

  // briefs: the meetings still ahead, today first, else the next day with any
  const ahead = meetings.filter((m) => !isPast(m, now));
  const firstDay = ahead[0]?.day;
  const briefs = ahead.filter((m) => m.day === firstDay).slice(0, 2);
  const when = (m: Meeting) => `${dayWord(m.day, now).replace(/,.*/, "")} at ${timeLabel(m.time)}`;
  for (const m of briefs) {
    // a financial aid meeting is a family conversation
    push(byId.get(m.studentId), m.type === "Financial aid" ? "parent-brief" : "student-brief", "", `meets you ${when(m).replace(/^Today/, "today").replace(/^Tomorrow/, "tomorrow")}`);
  }

  // letters: asked for and still open, soonest due first
  const letters = letterRequests(roster, overrides, now)
    .filter((r) => r.status !== "sent" && LETTER_OPEN.has(byId.get(r.studentId)?.milestones["Recommendation Letter"] ?? ""))
    .slice(0, 2);
  for (const r of letters) push(byId.get(r.studentId), "recommendation-letter", r.type, `due ${shortDate(r.due)}`);

  // summaries: meetings over in the last week, newest first
  const weekAgo = now.getTime() - 7 * 86400000;
  const over = meetings.filter((m) => isPast(m, now) && meetingStart(m).getTime() > weekAgo).sort((a, b) => meetingStart(b).getTime() - meetingStart(a).getTime());
  for (const m of over.slice(0, 2)) push(byId.get(m.studentId), "meeting-summary", "", `met ${when(m).replace(/^Today/, "today")}`);

  return out;
}

/** Every meeting, seeded and added, for students on the roster. The same
 *  list as v5/Prepare's useMeetings, rebuilt here because importing
 *  Prepare would loop back into ProductivitySuite (Prepare > Documents). */
function useMeetings(roster: CounselorStudent[]): Meeting[] {
  const added = useAddedMeetings();
  return useMemo(() => {
    const ids = new Set(roster.map((s) => s.id));
    return [...seededMeetings(roster, new Date()), ...added].filter((m) => ids.has(m.studentId)).sort((a, b) => `${a.day}${a.time}`.localeCompare(`${b.day}${b.time}`));
  }, [roster, added]);
}

// ---- finished drafts -----------------------------------------------------------
export type FinishHow = "saved" | "copied" | "printed";
export type Finished = { studentId: string; kind: DocKind; how: FinishHow; minutes: number; at: string; noteId?: string };
// DEMO-ONLY: kept in this browser until the counselor's account stores it.
const finishedStore = createLocalRecord<Record<string, Finished>>("dreamari-counselor-assist-finished", {});

export const useFinished = () => finishedStore.useValue();

export function weekStart(now: Date = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
}

/** Done this week (an older finish does not tick off this week's queue). */
export function isDone(f: Finished | undefined, since: number): boolean {
  return !!f && new Date(f.at).getTime() >= since;
}

export function markFinished(key: string, f: Omit<Finished, "at" | "minutes">): Finished {
  const entry: Finished = { ...f, minutes: MINUTES_SAVED[f.kind] ?? 10, at: new Date().toISOString() };
  finishedStore.update((all) => ({ ...all, [key]: entry }));
  return entry;
}

export function unmarkFinished(key: string): void {
  finishedStore.update((all) => {
    const next = { ...all };
    delete next[key];
    return next;
  });
}

/** Minutes Dreamy saved this week. */
export function weekMinutes(all: Record<string, Finished>, since: number): number {
  return SEED_WEEK_MINUTES + Object.values(all).reduce((n, f) => n + (new Date(f.at).getTime() >= since ? f.minutes : 0), 0);
}

/** "1 h 5 min", "45 min" */
export function minutesLabel(m: number): string {
  const h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}

/** Undo for Save to notes. counselorNotes.ts has no remove (and is a shared
 *  helper this screen does not change), so the one note Assist added is
 *  taken out of the same record directly. */
export function removeAssistNote(studentId: string, noteId: string): void {
  const KEY = "dreamari-counselor-notes";
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) || "{}") as Record<string, { id: string }[]>;
    all[studentId] = (all[studentId] ?? []).filter((n) => n.id !== noteId);
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // no storage: nothing was kept
  }
}

// ---- recent students -----------------------------------------------------------
const recentStore = createLocalRecord<string[]>("dreamari-counselor-assist-recent", []);
export const useRecentStudents = () => recentStore.useValue();
export function addRecentStudent(id: string): void {
  recentStore.update((list) => [id, ...list.filter((x) => x !== id)].slice(0, 6));
}
