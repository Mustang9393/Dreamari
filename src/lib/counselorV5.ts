// Counselor v5 data layer (7 Oct 2026). The counselor app is built against
// the shape the real product will receive (docs/handoff/counselor-app-plan-
// 2026-10-07.md, Phase 0): roster and academics in OneRoster 1.2's shape
// (users, grades, results), Dreamari's own signals beside them. Today every
// field is read from the demo roster (counselorRoster.ts), the mock SIS
// (counselorSis.ts) and the student signals (studentSignals.ts); swapping
// in a real OneRoster feed should only touch this file.

import { MILESTONE_KEYS, attentionRank, attentionReason, attentionSeverity, getRosterWithLive, type AttentionSeverity, type CaseloadStatus, type CounselorStudent, type MilestoneKey } from "./counselorRoster";
import { sisFor } from "./counselorSis";
import { signalsFor } from "./studentSignals";
import { ALL_PROFILE_CAREERS, type ProfileCareer } from "@/components/profile/data";
import { SCHOLARSHIP_ITEMS } from "@/components/opportunities/data";
import { fitFor as opportunityFit, timing, today as todayIso, worldToField } from "@/components/opportunities/match";
import { fafsaRows } from "./counselorFafsa";
import { cv } from "./counselorBase";

/** OneRoster 1.2 `users` record, student role, the fields v5 reads. */
export type OrUser = {
  sourcedId: string;
  status: "active" | "tobedeleted";
  role: "student";
  givenName: string;
  familyName: string;
  /** CEDS grade codes ("09".."12") */
  grades: string[];
  identifier: string;
  orgSourcedIds: string[];
};

/** What the SIS adds through OneRoster results and the gradebook. */
export type Academics = {
  gpa: number;
  creditsEarned: number;
  creditsRequired: number;
  attendanceRate: number;
  onTrackToGraduate: boolean;
};

/** Dreamari's own signals, per student (the backend will store these). */
export type DreamariSignals = {
  world: string;
  top3: string[];
  /** saved career ids, best first */
  saved: string[];
  simulations: number;
  dreamScore: number;
  lastActive: string;
};

export type V5Student = {
  user: OrUser;
  name: string;
  grade: number;
  /** roster portrait file number, -1 for the live student */
  portrait: number;
  status: CaseloadStatus;
  attention: { reason: string; severity: AttentionSeverity } | null;
  academics: Academics;
  dreamari: DreamariSignals;
  /** the demo roster row, for screens that still read it directly */
  source: CounselorStudent;
};

const CAREER_BY_ID = new Map(ALL_PROFILE_CAREERS.map((c) => [c.id, c]));

export function careerById(id: string): ProfileCareer | undefined {
  return CAREER_BY_ID.get(id);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** DEMO-ONLY: the demo roster stores a saved-career COUNT, not which
 *  careers. Pick that many from the student's own world (then the rest of
 *  the catalog), rotated per student, so school-wide totals vary the way a
 *  real school's would instead of everyone in a world saving the same three. */
function savedFor(s: CounselorStudent, top3: string[]): string[] {
  const inWorld = ALL_PROFILE_CAREERS.filter((c) => c.world === s.careerTrack).map((c) => c.id);
  const others = ALL_PROFILE_CAREERS.map((c) => c.id).filter((id) => !inWorld.includes(id));
  const h = hash(s.id);
  // 1 to 3 from their own world (rotated), the rest from elsewhere: real
  // students save across worlds, and a world with three careers in the
  // catalog would otherwise be "saved" by every student in it.
  const fromWorld = 1 + (h % 3);
  const start = h % Math.max(1, inWorld.length);
  const rotated = [...inWorld.slice(start), ...inWorld.slice(0, start)].slice(0, fromWorld);
  const total = Math.max(2, Math.min(6, s.engagement.careersSaved));
  const offset = hash(s.name) % Math.max(1, others.length);
  const elsewhere = [...others.slice(offset), ...others.slice(0, offset)].filter((_, i) => i % 7 === h % 7);
  return [...new Set([...top3.slice(0, 1), ...rotated, ...elsewhere])].slice(0, total);
}

export function toV5(s: CounselorStudent): V5Student {
  const sis = sisFor(s);
  const sig = signalsFor(s);
  const [givenName, ...rest] = s.name.split(" ");
  const top3 = sig.top3.filter((id) => CAREER_BY_ID.has(id));
  return {
    user: {
      sourcedId: s.id,
      status: "active",
      role: "student",
      givenName,
      familyName: rest.join(" "),
      grades: [String(s.grade).padStart(2, "0")],
      identifier: s.tag,
      orgSourcedIds: [s.school],
    },
    name: s.name,
    grade: s.grade,
    portrait: s.avatarIndex,
    status: s.status,
    attention: s.status === "On Track" ? null : { reason: attentionReason(s), severity: attentionSeverity(s) },
    academics: {
      gpa: sis.gpa,
      creditsEarned: sis.credits.earned,
      creditsRequired: sis.credits.required,
      attendanceRate: sis.attendance.rate,
      onTrackToGraduate: sis.onTrackToGraduate,
    },
    dreamari: {
      world: s.careerTrack,
      top3,
      saved: savedFor(s, top3),
      simulations: sig.simulationsCompleted,
      dreamScore: sig.dreamScore,
      lastActive: s.lastActive,
    },
    source: s,
  };
}

/** The caseload. Client-only (the live student is read from this browser). */
export function v5Students(): V5Student[] {
  return getRosterWithLive().map(toV5);
}

export type SchoolSnapshot = {
  students: number;
  onTrackPct: number;
  atRisk: number;
  /** submissions waiting for the counselor, by milestone, most first */
  pending: { key: MilestoneKey; count: number }[];
  pendingTotal: number;
  needYou: V5Student[];
  /** most-saved careers, most first */
  topSaved: { career: ProfileCareer; students: number }[];
  /** interest worlds, most students first */
  worlds: { world: string; students: number }[];
};

export function schoolSnapshot(list: V5Student[]): SchoolSnapshot {
  const saves = new Map<string, number>();
  const worlds = new Map<string, number>();
  for (const s of list) {
    for (const id of s.dreamari.saved) saves.set(id, (saves.get(id) ?? 0) + 1);
    worlds.set(s.dreamari.world, (worlds.get(s.dreamari.world) ?? 0) + 1);
  }
  const onTrack = list.filter((s) => s.status === "On Track").length;
  const pending = MILESTONE_KEYS.map((key) => ({ key, count: list.filter((s) => s.source.milestones[key] === "Pending Review").length }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);
  return {
    students: list.length,
    onTrackPct: list.length ? Math.round((onTrack / list.length) * 100) : 0,
    atRisk: list.filter((s) => s.status === "At Risk").length,
    pending,
    pendingTotal: pending.reduce((n, p) => n + p.count, 0),
    needYou: list.filter((s) => s.status !== "On Track").sort((a, b) => attentionRank(a.source, b.source)),
    topSaved: [...saves.entries()]
      .map(([id, n]) => ({ career: CAREER_BY_ID.get(id)!, students: n }))
      .filter((x) => x.career)
      .sort((a, b) => b.students - a.students || a.career.title.localeCompare(b.career.title)),
    worlds: [...worlds.entries()].map(([world, students]) => ({ world, students })).sort((a, b) => b.students - a.students),
  };
}

// ---- Closing soon (7 Oct 2026) ---------------------------------------------
// The hero's second signal (Chandu chose "what needs me today": what is
// waiting, what is closing, who is next). Each deadline names the students it
// touches, so the counselor sees whose it is, not a stat. Scholarship dates
// and the fit check are the Opportunities tab's real data; FAFSA and early
// action read the FAFSA tracker and the Applications milestone.


export type Deadline = { id: string; title: string; when: string; days: number | null; students: CounselorStudent[]; href: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const short = (iso: string) => { const d = new Date(`${iso}T12:00:00`); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; };

export function closingSoon(roster: CounselorStudent[], limit = 3): Deadline[] {
  const now = todayIso();
  const out: Deadline[] = [];

  // Early action: seniors whose applications are not in (Nov 1 is the
  // common early-action date).
  const year = new Date().getFullYear();
  const ea = `${year}-11-01`;
  const eaDays = Math.round((Date.parse(`${ea}T12:00:00`) - Date.now()) / 86400000);
  if (eaDays >= 0) {
    const seniors = roster.filter((s) => s.grade === 12 && !["Approved", "Completed", "Pending Review"].includes(s.milestones.Applications));
    if (seniors.length) out.push({ id: "early-action", title: "Early action", when: short(ea), days: eaDays, students: seniors, href: cv("students") });
  }

  // FAFSA: seniors who have not filed (it opened Oct 1).
  const fafsa = fafsaRows(roster).filter((r) => r.state === "not-submitted" || r.state === "incomplete").map((r) => r.student);
  if (fafsa.length) out.push({ id: "fafsa", title: "FAFSA", when: "Open now", days: null, students: fafsa, href: cv("students") });

  // Scholarships open now with a posted date, soonest first, with the
  // students the Opportunities fit check says can apply now.
  const open = SCHOLARSHIP_ITEMS.map((item) => ({ item, t: timing(item, now) }))
    .filter((x) => x.t.status === "open" && x.t.iso && x.t.days !== null && x.t.days >= 0 && !x.t.approx)
    .sort((a, b) => (a.t.days ?? 0) - (b.t.days ?? 0));
  for (const { item, t } of open) {
    // Field-specific scholarships only, matched to the student's own field:
    // one open to everyone touches the whole caseload and says nothing.
    if (item.fields.includes("Any")) continue;
    const fits = roster.filter((s) => {
      const field = worldToField(s.careerTrack);
      return !!field && item.fields.includes(field) && opportunityFit(item, { grade: s.grade, state: "NJ", gpa: sisFor(s).gpa, fields: [field] }).when === "now";
    });
    if (fits.length) out.push({ id: item.id, title: item.name, when: short(t.iso!), days: t.days, students: fits, href: `/opportunities/${item.id}` });
    if (out.length >= limit + 2) break;
  }

  // soonest first; "open now" items sort after dated ones that are close
  return out.sort((a, b) => (a.days ?? 45) - (b.days ?? 45)).slice(0, limit);
}
