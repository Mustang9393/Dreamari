// DEMO-ONLY seeds, real product shape: the counselor's office hours and the
// meetings students book into them (Counselor Dashboard v3, 29 Sept 2026).
//
// Why: the research lists "book my counselor" as a core student need and
// meeting notes as a core counselor one, and every competitor it reviews
// has scheduling (SchooLinks, Naviance, Xello). v2 had meeting BRIEFS in
// the Productivity Suite but no meetings. Here a meeting is booked into
// office hours, prepped with the existing brief, and closed with a note
// that lands on the student's profile and in the time log automatically.
// The student half (booking from the app) is still to build; bookings are
// seeded from the caseload until it exists.

import type { CounselorStudent } from "./counselorRoster";
import { createLocalRecord, isoDay, seedHash } from "./localRecord";

export type MeetingType = "College applications" | "Financial aid" | "Course planning" | "Check-in";

export type Meeting = {
  id: string;
  studentId: string;
  type: MeetingType;
  /** ISO date */
  day: string;
  /** "10:15" 24h */
  time: string;
  minutes: number;
  /** a line the student wrote when booking */
  topic: string;
};

export type OfficeHours = { weekday: number; from: string; to: string }[];

/** Tue and Thu mornings, Wed after lunch: the slots the seeds book into. */
export const OFFICE_HOURS: OfficeHours = [
  { weekday: 2, from: "10:00", to: "11:30" },
  { weekday: 3, from: "13:30", to: "15:00" },
  { weekday: 4, from: "10:00", to: "11:30" },
];

type Done = { notes: string; at: string };
const doneStore = createLocalRecord<Record<string, Done>>("dreamari-counselor-meetings-done", {});

const TOPICS: Record<MeetingType, string[]> = {
  "College applications": ["Which schools should be reach, match and safety?", "Can you look at my essay topic?", "Early action or regular decision?"],
  "Financial aid": ["My parents are not sure how to do the FAFSA", "What is the difference between a grant and a loan?"],
  "Course planning": ["Should I take AP Chemistry next year?", "Do I have the credits to graduate?"],
  "Check-in": ["Just want to talk about how things are going", "Stressed about this semester"],
};

function typeFor(s: CounselorStudent, h: number): MeetingType {
  if (s.grade === 12) return h % 3 === 0 ? "Financial aid" : "College applications";
  if (s.status === "At Risk") return "Check-in";
  return h % 2 ? "Course planning" : "Check-in";
}

function to24(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Office-hours slots this week and next, filled from the caseload
 *  deterministically (seniors and students needing support book most). */
export function seededMeetings(roster: CounselorStudent[], now: Date = new Date()): Meeting[] {
  if (!roster.length) return [];
  const pool = [...roster].sort((a, b) => (b.grade === 12 ? 1 : 0) - (a.grade === 12 ? 1 : 0) || (a.status === "At Risk" ? -1 : 0) - (b.status === "At Risk" ? -1 : 0) || seedHash(a.id) - seedHash(b.id));
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const out: Meeting[] = [];
  let k = 0;
  for (let w = 0; w < 2; w++) {
    for (const oh of OFFICE_HOURS) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + w * 7 + (oh.weekday - 1));
      const [fh, fm] = oh.from.split(":").map(Number);
      const [th, tm] = oh.to.split(":").map(Number);
      for (let t = fh * 60 + fm, slot = 0; t + 15 <= th * 60 + tm; t += 30, slot++) {
        const s = pool[k % pool.length];
        const h = seedHash(`${s.id}-${w}-${oh.weekday}-${slot}`);
        // About two in three slots are booked.
        if (h % 3 === 0) continue;
        k++;
        const type = typeFor(s, h);
        const topics = TOPICS[type];
        out.push({ id: `m-${isoDay(day)}-${to24(t)}`, studentId: s.id, type, day: isoDay(day), time: to24(t), minutes: type === "Check-in" ? 15 : 30, topic: topics[h % topics.length] });
      }
    }
  }
  return out;
}

// Meetings the counselor adds: a walk-in logged after the fact (done on
// the spot, with its notes) or one booked ahead for a student. Walk-ins
// are most of a counselor's day and never came through office hours.
const addedStore = createLocalRecord<Meeting[]>("dreamari-counselor-meetings-added", []);

export function useAddedMeetings(): Meeting[] {
  return addedStore.useValue();
}

export function addMeeting(m: Omit<Meeting, "id">, doneNotes?: string): Meeting {
  const meeting = { ...m, id: `a-${Date.now().toString(36)}` };
  addedStore.update((list) => [meeting, ...list].slice(0, 200));
  if (doneNotes !== undefined) doneStore.update((d) => ({ ...d, [meeting.id]: { notes: doneNotes, at: new Date().toISOString() } }));
  return meeting;
}

export function removeAddedMeeting(id: string): void {
  addedStore.update((list) => list.filter((m) => m.id !== id));
}

export const MEETING_TYPES: MeetingType[] = ["Check-in", "College applications", "Financial aid", "Course planning"];

export function useMeetingsDone(): Record<string, Done> {
  return doneStore.useValue();
}

export function readMeetingsDone(): Record<string, Done> {
  return doneStore.read();
}

export function completeMeeting(id: string, notes: string): void {
  doneStore.update((d) => ({ ...d, [id]: { notes, at: new Date().toISOString() } }));
}

export function reopenMeeting(id: string): void {
  doneStore.update((d) => {
    const next = { ...d };
    delete next[id];
    return next;
  });
}

/** "10:15 AM" */
export function timeLabel(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Past or today with its time gone. */
export function isPast(m: Meeting, now: Date = new Date()): boolean {
  const [y, mo, d] = m.day.split("-").map(Number);
  const [h, mi] = m.time.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi + m.minutes).getTime() < now.getTime();
}
