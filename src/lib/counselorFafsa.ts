// DEMO-ONLY seeds, real product shape: each senior's FAFSA status in the
// three states the counselor research asks for (Counselor Dashboard v3,
// 29 Sept 2026): Completed, Submitted but incomplete (with the one fix it
// needs), and Not submitted.
//
// Why it matters here: the demo school is in Illinois, one of the states
// where a senior must file the FAFSA, the state's alternative application,
// or an opt-out form to graduate (so are New Jersey, where the fall 2026
// pilot's Central High School is, and Alabama, Indiana, Nebraska, Oklahoma
// and Texas). NCAN reports that seniors who complete the FAFSA are far
// more likely to enroll right after high school, and "incomplete" (usually
// a parent contributor who has not signed) is where students silently
// stall.
//
// Status is derived from the roster's own "Financial Aid" milestone so it
// never disagrees with the Milestone Tracker: Approved = completed,
// Pending Review = completed by the student's report and waiting for the
// counselor to confirm, In Progress = incomplete or started-not-submitted,
// Not Started = not submitted. Production replaces the seed with the state
// data feed where one exists (the state agency's completion data, such as
// ISAC in Illinois or Edwin in Massachusetts) plus the student's own report.

import type { CounselorStudent } from "./counselorRoster";
import { createLocalRecord, seedHash } from "./localRecord";

export type FafsaState = "completed" | "incomplete" | "not-submitted" | "opted-out";

export const FAFSA_LABEL: Record<FafsaState, string> = {
  completed: "Completed",
  incomplete: "Submitted, incomplete",
  "not-submitted": "Not submitted",
  "opted-out": "Opt-out form on file",
};

export type FafsaRow = {
  student: CounselorStudent;
  state: FafsaState;
  /** the one thing standing in the way, or what is known */
  note: string;
  /** completed by the student's report, not yet confirmed by the counselor */
  needsConfirm: boolean;
  remindedAt?: string;
};

type Override = { state?: FafsaState; confirmed?: boolean; remindedAt?: string };
const store = createLocalRecord<Record<string, Override>>("dreamari-counselor-fafsa", {});

const INCOMPLETE_FIX = [
  "Parent contributor has not signed",
  "Contributor has not given consent",
  "Needs a correction to household size",
  "Selected for verification, documents due",
];

function base(s: CounselorStudent): Omit<FafsaRow, "remindedAt"> {
  const m = s.milestones["Financial Aid"];
  const h = seedHash(s.id);
  if (m === "Approved" || m === "Completed") return { student: s, state: "completed", note: "Confirmed", needsConfirm: false };
  if (m === "Pending Review") return { student: s, state: "completed", note: "Student reports it is done", needsConfirm: true };
  if (m === "In Progress") {
    return h % 5 < 3
      ? { student: s, state: "incomplete", note: INCOMPLETE_FIX[h % INCOMPLETE_FIX.length], needsConfirm: false }
      : { student: s, state: "not-submitted", note: "Started, not submitted", needsConfirm: false };
  }
  return { student: s, state: "not-submitted", note: "Not started", needsConfirm: false };
}

const ORDER: Record<FafsaState, number> = { "not-submitted": 0, incomplete: 1, completed: 2, "opted-out": 3 };

/** Every senior, what needs the most help first. */
export function fafsaRows(roster: CounselorStudent[], o: Record<string, Override> = store.read()): FafsaRow[] {
  return roster
    .filter((s) => s.grade === 12)
    .map((s) => {
      const b = base(s);
      const ov = o[s.id];
      if (!ov) return b;
      const state = ov.state ?? b.state;
      const needsConfirm = b.needsConfirm && !ov.confirmed && state === "completed";
      const note = ov.state === "opted-out" ? "Family chose not to file" : ov.confirmed ? "Confirmed" : b.note;
      return { ...b, state, needsConfirm, note, remindedAt: ov.remindedAt };
    })
    .sort((a, b) => ORDER[a.state] - ORDER[b.state] || (a.needsConfirm === b.needsConfirm ? 0 : a.needsConfirm ? -1 : 1) || a.student.name.localeCompare(b.student.name));
}

export function useFafsaOverrides(): Record<string, Override> {
  return store.useValue();
}

export function remindFafsa(ids: string[]): void {
  const at = new Date().toISOString();
  store.update((o) => ({ ...o, ...Object.fromEntries(ids.map((id) => [id, { ...o[id], remindedAt: at }])) }));
}

export function confirmFafsa(id: string): void {
  store.update((o) => ({ ...o, [id]: { ...o[id], confirmed: true } }));
}

export function setOptOut(id: string, on: boolean): void {
  store.update((o) => ({ ...o, [id]: { ...o[id], state: on ? "opted-out" : undefined } }));
}

/** Filed or formally opted out: what the Illinois graduation requirement counts. */
export function meetsRequirement(r: FafsaRow): boolean {
  return (r.state === "completed" && !r.needsConfirm) || r.state === "opted-out";
}
