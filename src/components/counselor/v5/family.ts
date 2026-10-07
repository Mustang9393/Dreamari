// Guardians and weekly check-ins, for the counselor side (7 Oct 2026, from the
// 25 Sept SchooLinks research: guardian involvement is first-class, and
// weekly well-being check-ins with "Notes from students" are a counselor
// feature). DEMO-ONLY: neither exists in the data yet. Guardians are seeded
// from the student's family name; check-ins are seeded per student and week.
// Production reads guardians from the SIS (OneRoster contacts) and check-ins
// from the student app's weekly check-in.

import type { CounselorStudent } from "@/lib/counselorRoster";
import { readWeeklyCheckIn } from "@/lib/weeklyCheckIn";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export type Guardian = { name: string; relation: string; phone: string; email: string; language: string };

// names match the relation (a father is never "Aisha")
const WOMEN = ["Maria", "Linh", "Ana", "Grace", "Rosa", "Aisha", "Mei", "Sandra", "Nadia", "Patrice"];
const MEN = ["James", "David", "Omar", "Kevin", "Luis", "Michael", "Andre", "Samuel"];
const REL = ["Mother", "Father", "Grandmother", "Aunt", "Uncle"];
const MALE = new Set(["Father", "Uncle"]);
const LANG = ["English", "English", "English", "Spanish", "Mandarin", "Arabic", "Vietnamese"];

export function guardiansFor(s: CounselorStudent): Guardian[] {
  const last = s.name.split(" ").slice(-1)[0];
  const h = hash(s.id);
  const count = 1 + (h % 2);
  // one household, one home language
  const language = LANG[h % LANG.length];
  return Array.from({ length: count }, (_, i) => {
    const relation = i === 0 ? REL[h % 2] : REL[2 + ((h >> 4) % 3)];
    const pool = MALE.has(relation) ? MEN : WOMEN;
    const first = pool[(h >> (i * 3)) % pool.length];
    return {
      name: `${first} ${last}`,
      relation,
      phone: `(732) 555-${String(1000 + ((h >> (i * 5)) % 9000)).padStart(4, "0")}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      language,
    };
  });
}

export type CheckDim = "Mood" | "Friends" | "Sleep and health" | "School";
export const CHECK_DIMS: CheckDim[] = ["Mood", "Friends", "Sleep and health", "School"];
export type Level = "good" | "okay" | "low";
export type CheckIn = { answered: boolean; levels: Record<CheckDim, Level>; note?: string; daysAgo: number };

// Words that make a note urgent (SchooLinks' "tracked alert words"). The
// app only raises it to the counselor; what happens next follows the
// district's safety policy. DEMO-ONLY list; districts set their own.
export const ALERT_WORDS = ["alone", "hopeless", "hurt", "unsafe", "give up", "scared", "can't do this"];
export function alertIn(note?: string): string | null {
  if (!note) return null;
  const n = note.toLowerCase();
  return ALERT_WORDS.find((w) => n.includes(w)) ?? null;
}

const NOTES = [
  "Excited about the robotics team this year!",
  "A lot of tests this week but I'm keeping up.",
  "Can we talk about which classes to take next year?",
  "Didn't sleep much, big project due.",
  "Feeling good about my college list.",
  "Started a new job after school, it's going well.",
  "Missing my friends who moved schools.",
  "Want help planning for the SAT.",
  "I've been feeling really alone lately.",
];

/** This week's check-in, seeded so most students are fine and a few need
 *  a conversation; students already at risk lean lower. */
export function checkInFor(s: CounselorStudent): CheckIn {
  // the live student's own answer from Home, when they sent one this week
  if (s.id === "real-student" && typeof window !== "undefined") {
    const mine = readWeeklyCheckIn();
    if (mine) return { answered: true, levels: mine.levels, note: mine.note, daysAgo: Math.max(0, Math.floor((Date.now() - new Date(mine.at).getTime()) / 86400000)) };
  }
  const h = hash(`${s.id}:week`);
  const answered = h % 8 !== 0;
  const risk = s.status === "At Risk" ? 2 : s.status === "Needs Attention" ? 1 : 0;
  const level = (k: number): Level => {
    const v = ((h >> (k * 3)) % 10) - risk * 2;
    // most students are fine; a low answer is the exception
    return v >= 3 ? "good" : v >= 0 ? "okay" : "low";
  };
  const levels = { Mood: level(1), Friends: level(2), "Sleep and health": level(3), School: level(4) } as Record<CheckDim, Level>;
  // DEMO-ONLY: about one at-risk student in four leaves a note that trips an
  // alert word, so the "needs a response today" path can be seen
  const alert = s.status === "At Risk" && h % 4 === 0;
  const note = alert ? NOTES[NOTES.length - 1] : h % 3 === 0 ? NOTES[h % (NOTES.length - 1)] : undefined;
  return { answered: answered || alert, levels, note: answered || alert ? note : undefined, daysAgo: 1 + (h % 5) };
}

export const LEVEL_INK: Record<Level, string> = {
  good: "var(--color-feedback-success-solid)",
  okay: "var(--color-feedback-warning-solid)",
  low: "var(--color-feedback-danger-solid)",
};
export const LEVEL_WORD: Record<Level, string> = { good: "Good", okay: "Okay", low: "Low" };

/** This week's alert key for a student (one alert per student per week). */
export function alertKey(studentId: string, now = new Date()): string {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  return `alert:${studentId}:${monday.toISOString().slice(0, 10)}`;
}

/** "today", "yesterday", "3 days ago" */
export const whenText = (daysAgo: number) => (daysAgo <= 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`);
