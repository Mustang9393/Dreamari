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

// "Applications", not "College applications" (9 Oct 2026, Maisha: "College"
// reads "Schools" everywhere in the counselor app, like the student app).
// Resume and Career exploration added the same day so a week of seeded
// meetings reads like a real week, not six application meetings.
export type MeetingType = "Applications" | "Financial aid" | "Course planning" | "Resume" | "Career exploration" | "Check-in";

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

// The counselor's own office hours, set on Profile and read by the
// calendar and the booking sheet (7 Oct 2026: hours set in one place drive
// the free slots everywhere). The seeded meetings stay on OFFICE_HOURS.
const hoursStore = createLocalRecord<OfficeHours>("dreamari-counselor-office-hours", OFFICE_HOURS);

export function useOfficeHours(): OfficeHours {
  return hoursStore.useValue();
}

export function readOfficeHours(): OfficeHours {
  return hoursStore.read();
}

export function setOfficeHours(next: OfficeHours): void {
  hoursStore.update(() => [...next].sort((a, b) => a.weekday - b.weekday));
}

const WEEKDAY_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const short = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
};
const ampm = (t: string) => (Number(t.split(":")[0]) < 12 ? "AM" : "PM");

/** "Tue and Thu, 10 to 11:30 AM · Wed, 1:30 to 3 PM": days sharing a time
 *  are grouped. */
export function officeHoursLabel(oh: OfficeHours): string {
  if (!oh.length) return "No office hours set";
  const groups = new Map<string, number[]>();
  for (const o of oh) groups.set(`${o.from}-${o.to}`, [...(groups.get(`${o.from}-${o.to}`) ?? []), o.weekday]);
  return [...groups.entries()].map(([k, days]) => {
    const [from, to] = k.split("-");
    const names = days.map((d) => WEEKDAY_NAME[d]);
    const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
    const range = ampm(from) === ampm(to) ? `${short(from)} to ${short(to)} ${ampm(to)}` : `${short(from)} ${ampm(from)} to ${short(to)} ${ampm(to)}`;
    return `${list}, ${range}`;
  }).join(" · ");
}

type Done = { notes: string; at: string };
const doneStore = createLocalRecord<Record<string, Done>>("dreamari-counselor-meetings-done", {});

// DEMO-ONLY: what students wrote when they booked. One line per slot, a
// different one on each row of the week, and about one in four booked with
// nothing written (9 Oct 2026 audit: "four of six quotes are 'Can you look
// at my essay topic?'").
const TOPICS: Record<MeetingType, string[]> = {
  Applications: ["Which schools should be reach, match and safety?", "Can you look at my essay topic?", "Early action or regular decision?", "The trade school asks for a personal statement. Help?", "How do I ask a teacher for a recommendation?"],
  "Financial aid": ["My parents are not sure how to do the FAFSA", "What is the difference between a grant and a loan?", "Are there scholarships I can still apply for?"],
  "Course planning": ["Should I take AP Chemistry next year?", "Do I have the credits to graduate?", "Can I switch out of Spanish for a tech elective?", "Is dual enrollment worth it for me?"],
  Resume: ["Can we go over my resume before the job fair?", "What do I put under skills?", "Should my part-time job go on my resume?"],
  "Career exploration": ["I liked the nursing simulation. What next?", "Can we talk about trades vs a four-year plan?", "How do I find a shadow day in my pathway?"],
  "Check-in": ["Can we go over my Academic Plan?", "Just want to talk about how things are going", "Stressed about this semester", "My Career Report came back with changes. Can you walk me through it?"],
};

/** Why a student booked, by grade: seniors apply and pay for school,
 *  juniors polish resumes and explore, younger students plan courses and
 *  check in on milestones. */
function typeFor(s: CounselorStudent, k: number): MeetingType {
  if (s.grade === 12) return k % 3 === 2 ? "Financial aid" : "Applications";
  if (s.grade === 11) return (["Resume", "Applications", "Career exploration"] as MeetingType[])[k % 3];
  if (s.status === "At Risk") return "Check-in";
  return (["Course planning", "Career exploration", "Check-in"] as MeetingType[])[k % 3];
}

function to24(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Office-hours slots this week and next, filled from the caseload
 *  deterministically. The pool cycles through the grades (12, 11, 10, 9,
 *  then again) so a week mixes seniors with everyone else, instead of six
 *  seniors in a row (9 Oct 2026 audit). */
export function seededMeetings(roster: CounselorStudent[], now: Date = new Date()): Meeting[] {
  if (!roster.length) return [];
  const byGrade = [12, 11, 10, 9].map((g) => [...roster].filter((s) => s.grade === g).sort((a, b) => (a.status === "At Risk" ? -1 : 0) - (b.status === "At Risk" ? -1 : 0) || seedHash(a.id) - seedHash(b.id)));
  const pool: CounselorStudent[] = [];
  for (let i = 0; pool.length < roster.length; i++) for (const g of byGrade) if (g[i]) pool.push(g[i]);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const out: Meeting[] = [];
  let k = 0;
  // how many of each reason so far: the next line of that reason follows
  const used: Partial<Record<MeetingType, number>> = {};
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
        // the slot's position, not the student's hash, picks the reason and
        // the line, so a week never shows the same pair twice; every fourth
        // booking came with nothing written
        const type = typeFor(s, k);
        const topics = TOPICS[type];
        const n = used[type] ?? 0;
        used[type] = n + 1;
        const topic = h % 4 === 0 ? "" : topics[n % topics.length];
        out.push({ id: `m-${isoDay(day)}-${to24(t)}`, studentId: s.id, type, day: isoDay(day), time: to24(t), minutes: type === "Check-in" ? 15 : 30, topic });
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

export const MEETING_TYPES: MeetingType[] = ["Check-in", "Applications", "Financial aid", "Course planning", "Resume", "Career exploration"];

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
