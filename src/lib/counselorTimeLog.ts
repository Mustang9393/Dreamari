// DEMO-ONLY store, real product shape: the counselor's use-of-time log for
// ASCA's 80/20 guidance (Counselor Dashboard v3, 29 Sept 2026). ASCA
// recommends counselors spend at least 80% of their time on direct and
// indirect student services and no more than 20% on program planning and
// school support. The research behind v3 names this as a daily pain:
// counselors lose time to scheduling, filing and proctoring and have no
// easy way to show it.
//
// Most entries write themselves: the v3 screens log a review, a letter
// sent, a reminder, a meeting marked done. The counselor adds only what
// happens outside the dashboard (a hallway check-in, lunch duty), in one
// tap. A week of seeded history keeps the chart from rendering empty
// (standing rule: no graph renders empty); the counselor's own entries are
// stored on top of it.

import { createLocalRecord, isoDay } from "./localRecord";

/** ASCA's three buckets. Direct: in person with students (lessons,
 *  appraisal and advisement, counseling). Indirect: on a student's behalf
 *  (consultation, reviews, letters, referrals). School support: program
 *  planning and non-counseling duties (proctoring, lunch duty, scheduling). */
export type TimeKind = "direct" | "indirect" | "support";

export const TIME_KIND_LABEL: Record<TimeKind, string> = {
  direct: "Direct with students",
  indirect: "Indirect, for students",
  support: "School support",
};

export type TimeEntry = {
  id: string;
  /** ISO timestamp */
  at: string;
  minutes: number;
  kind: TimeKind;
  activity: string;
  studentId?: string;
  /** true when the dashboard logged it from an action */
  auto: boolean;
};

/** The one-tap presets for time spent outside the dashboard. */
export const QUICK_LOG: { activity: string; minutes: number; kind: TimeKind }[] = [
  { activity: "Hallway check-in", minutes: 5, kind: "direct" },
  { activity: "Classroom lesson", minutes: 45, kind: "direct" },
  { activity: "Parent call", minutes: 15, kind: "indirect" },
  { activity: "Teacher consult", minutes: 15, kind: "indirect" },
  { activity: "Test proctoring", minutes: 60, kind: "support" },
  { activity: "Lunch duty", minutes: 30, kind: "support" },
];

/** ASCA's recommended share for direct plus indirect student services. */
export const ASCA_TARGET_PCT = 80;

const store = createLocalRecord<TimeEntry[]>("dreamari-counselor-time-log", []);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function logTime(entry: Omit<TimeEntry, "id" | "at" | "auto"> & { auto?: boolean }): void {
  store.update((prev) => [{ ...entry, auto: entry.auto ?? true, id: newId(), at: new Date().toISOString() }, ...prev].slice(0, 500));
}

export function removeTime(id: string): void {
  store.update((prev) => prev.filter((e) => e.id !== id));
}

// The seeded week: the five school days before today, a realistic mix in
// which support duties (proctoring, scheduling) push the student share just
// under ASCA's 80%, the situation the research describes.
const SEED_DAY: { activity: string; minutes: number; kind: TimeKind }[][] = [
  [{ activity: "Senior college meetings", minutes: 120, kind: "direct" }, { activity: "Review queue", minutes: 40, kind: "indirect" }, { activity: "Master schedule changes", minutes: 75, kind: "support" }, { activity: "Small group, Grade 9 transition", minutes: 45, kind: "direct" }],
  [{ activity: "Classroom lesson, Grade 11 careers", minutes: 90, kind: "direct" }, { activity: "Recommendation letters", minutes: 60, kind: "indirect" }, { activity: "PSAT proctoring", minutes: 120, kind: "support" }],
  [{ activity: "Student check-ins", minutes: 100, kind: "direct" }, { activity: "Parent calls", minutes: 45, kind: "indirect" }, { activity: "Teacher consults", minutes: 30, kind: "indirect" }, { activity: "Lunch duty", minutes: 30, kind: "support" }],
  [{ activity: "FAFSA night prep", minutes: 60, kind: "indirect" }, { activity: "Senior college meetings", minutes: 110, kind: "direct" }, { activity: "Attendance paperwork", minutes: 50, kind: "support" }],
  [{ activity: "Crisis response", minutes: 60, kind: "direct" }, { activity: "Review queue", minutes: 35, kind: "indirect" }, { activity: "Scholarship packets", minutes: 45, kind: "indirect" }, { activity: "504 meeting notes", minutes: 40, kind: "support" }],
];

function seededWeek(now: Date): TimeEntry[] {
  const out: TimeEntry[] = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let school = 0;
  while (school < SEED_DAY.length) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    SEED_DAY[school].forEach((e, i) => {
      const at = new Date(d);
      at.setHours(8 + i * 2, 0, 0, 0);
      out.push({ ...e, id: `seed-${isoDay(d)}-${i}`, at: at.toISOString(), auto: e.kind !== "support" });
    });
    school++;
  }
  return out;
}

export type TimeSummary = {
  entries: TimeEntry[];
  minutes: Record<TimeKind, number>;
  total: number;
  /** direct + indirect, rounded percent */
  studentPct: number;
  autoPct: number;
};

/** The last seven days: the seeded week plus everything logged since. */
export function summarize(entries: TimeEntry[], now: Date = new Date()): TimeSummary {
  const since = now.getTime() - 7 * 86400000;
  const all = [...entries, ...seededWeek(now)].filter((e) => new Date(e.at).getTime() >= since).sort((a, b) => b.at.localeCompare(a.at));
  const minutes: Record<TimeKind, number> = { direct: 0, indirect: 0, support: 0 };
  for (const e of all) minutes[e.kind] += e.minutes;
  const total = minutes.direct + minutes.indirect + minutes.support || 1;
  const auto = all.filter((e) => e.auto).reduce((n, e) => n + e.minutes, 0);
  return { entries: all, minutes, total, studentPct: Math.round(((minutes.direct + minutes.indirect) / total) * 100), autoPct: Math.round((auto / total) * 100) };
}

export function useTimeLog(): TimeEntry[] {
  return store.useValue();
}

export function hoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}
