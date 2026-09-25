// DEMO-ONLY: the counselor's casefile extras, mocked from the SchooLinks
// staff dashboard on request (25 Sept 2026: "mock up stuff from SchooLinks
// that were not built because it would read as copy. Build them, then
// we'll see how we can make them not look like a copy"). Three small
// stores, same localStorage-as-record idiom as counselorNotes.ts:
//
// - To-dos: tasks the counselor assigns a student, with a due date and an
//   overdue state (SchooLinks "Student To Dos"). Production: these belong
//   in the student's My Plan / inbox on the student side.
// - Plan sign-off: the three parties on a plan (student, counselor,
//   guardian). The student's submission is derived from the Academic Plan
//   milestone; the counselor's approval and the guardian invite are
//   recorded here. Production: a guardian account and a signature record.
// - Report schedules: a saved report template with a cadence and
//   recipients (SchooLinks Report Center). Production: a job that emails
//   the CSV or PDF.

import type { CounselorStudent } from "./counselorRoster";

const TODOS_KEY = "dreamari-counselor-todos";
const SIGNOFF_KEY = "dreamari-counselor-plan-signoff";
const SCHEDULES_KEY = "dreamari-counselor-report-schedules";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no storage: still works this session
  }
}
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ---- To-dos -------------------------------------------------------------

export type StudentTodo = { id: string; text: string; /** ISO date, no time */ due: string; done: boolean; createdAt: string };

export function readTodos(studentId: string): StudentTodo[] {
  return read<Record<string, StudentTodo[]>>(TODOS_KEY, {})[studentId] ?? [];
}
export function addTodo(studentId: string, text: string, due: string): StudentTodo[] {
  const all = read<Record<string, StudentTodo[]>>(TODOS_KEY, {});
  const next = [{ id: newId(), text, due, done: false, createdAt: new Date().toISOString() }, ...(all[studentId] ?? [])];
  all[studentId] = next;
  write(TODOS_KEY, all);
  return next;
}
export function toggleTodo(studentId: string, id: string): StudentTodo[] {
  const all = read<Record<string, StudentTodo[]>>(TODOS_KEY, {});
  const next = (all[studentId] ?? []).map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  all[studentId] = next;
  write(TODOS_KEY, all);
  return next;
}
export function removeTodo(studentId: string, id: string): StudentTodo[] {
  const all = read<Record<string, StudentTodo[]>>(TODOS_KEY, {});
  const next = (all[studentId] ?? []).filter((t) => t.id !== id);
  all[studentId] = next;
  write(TODOS_KEY, all);
  return next;
}
/** Days until due: negative when overdue. Dates only, local midnight. */
export function daysUntil(due: string): number {
  const d = new Date(`${due}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

// ---- Plan sign-off --------------------------------------------------------

export type SignoffRecord = { counselorAt?: string; guardianInvitedAt?: string };
export type PartyState = { state: "done" | "pending" | "missing"; when?: string };
export type PlanSignoff = { student: PartyState; counselor: PartyState; guardian: PartyState };

export function readSignoff(studentId: string): SignoffRecord {
  return read<Record<string, SignoffRecord>>(SIGNOFF_KEY, {})[studentId] ?? {};
}
export function writeSignoff(studentId: string, patch: SignoffRecord): SignoffRecord {
  const all = read<Record<string, SignoffRecord>>(SIGNOFF_KEY, {});
  const next = { ...(all[studentId] ?? {}), ...patch };
  for (const k of Object.keys(next) as (keyof SignoffRecord)[]) if (next[k] === undefined) delete next[k];
  all[studentId] = next;
  write(SIGNOFF_KEY, all);
  return next;
}

/** The three parties, from the Academic Plan milestone plus what the
 *  counselor recorded here. Seeded guardians: approved for every second
 *  student whose plan is already approved, pending otherwise. */
export function planSignoff(s: CounselorStudent, record: SignoffRecord = readSignoff(s.id)): PlanSignoff {
  const m = s.milestones["Academic Plan"];
  const submitted = m === "Pending Review" || m === "Approved" || m === "Completed" || m === "Changes Requested";
  const approved = m === "Approved" || !!record.counselorAt;
  const i = Number(s.id.replace(/^\D+/, "")) || 0;
  const guardianSeeded = m === "Approved" && i % 2 === 0;
  return {
    student: submitted ? { state: "done", when: s.lastActive } : { state: "missing" },
    counselor: approved ? { state: "done", when: record.counselorAt } : submitted ? { state: "pending" } : { state: "missing" },
    guardian: guardianSeeded ? { state: "done" } : record.guardianInvitedAt ? { state: "pending", when: record.guardianInvitedAt } : { state: "missing" },
  };
}

// ---- Report schedules -------------------------------------------------------

export type ReportSchedule = { id: string; templateId: string; title: string; cadence: "weekly" | "monthly"; /** weekday name or day-of-month */ day: string; recipients: string; createdAt: string };

export function readSchedules(): ReportSchedule[] {
  return read<ReportSchedule[]>(SCHEDULES_KEY, []);
}
export function addSchedule(input: Omit<ReportSchedule, "id" | "createdAt">): ReportSchedule[] {
  const next = [{ ...input, id: newId(), createdAt: new Date().toISOString() }, ...readSchedules()];
  write(SCHEDULES_KEY, next);
  return next;
}
export function removeSchedule(id: string): ReportSchedule[] {
  const next = readSchedules().filter((r) => r.id !== id);
  write(SCHEDULES_KEY, next);
  return next;
}
/** "Next Monday" / "Next 1st": the next run described, no scheduler here. */
export function nextRunLabel(r: ReportSchedule): string {
  return r.cadence === "weekly" ? `Every ${r.day}` : `Monthly on the ${r.day}`;
}

// ---- Batch sends -------------------------------------------------------------

/** One message, reminder or to-do sent to many students at once (25 Sept
 *  2026: "I should be able to select more than one student and send
 *  stuff"). Personal drafts (letters, briefs) stay one student at a time. */
export type BatchKind = "message" | "reminder" | "todo";
export type BatchSend = { id: string; kind: BatchKind; text: string; due?: string; studentIds: string[]; audience: string; at: string };
const SENDS_KEY = "dreamari-counselor-sends";

export function readSends(): BatchSend[] {
  return read<BatchSend[]>(SENDS_KEY, []);
}
export function addSend(input: Omit<BatchSend, "id" | "at">): BatchSend[] {
  const next = [{ ...input, id: newId(), at: new Date().toISOString() }, ...readSends()].slice(0, 50);
  write(SENDS_KEY, next);
  // A to-do sent to many lands on each student's own list too.
  if (input.kind === "todo" && input.due) for (const id of input.studentIds) addTodo(id, input.text, input.due);
  return next;
}
