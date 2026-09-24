// The organisation around the caseload: the school's counselors, the
// targets a school is measured against, and the district's other schools.
// Everything here is SEEDED demo content for the role-based Counselor
// Dashboard (v2, 24 Sept 2026), derived deterministically from the one
// dataset this prototype has (the reference's 120 Lincoln High School
// students, src/lib/counselorRoster.ts). Nothing in this file is real:
//
// - Counselors: the reference has one persona and no counselor field on a
//   student, so the roster is split into three caseloads by last-name
//   initial (A-G, H-R, S-Z), the way many real schools assign. Deterministic
//   and uneven on purpose (45 / 47 / 28 students), which is what makes the
//   Lead Counselor's "who is behind" question answerable.
// - Targets: 80% is the "district target" the reference's own My Impact
//   already quotes for senior plans and plans on file; the FAFSA and active
//   student targets are seeded here at 65% and 60%.
// - Sibling schools: four seeded schools scaled from Lincoln's live numbers
//   (an enrollment multiplier plus fixed per-metric offsets in percentage
//   points), so they move with the grade filter and with review decisions
//   exactly as Lincoln does, and always stay clearly better or worse than it
//   in the same way. `seeded: true` on every one of them.
//
// DEMO-ONLY: replace with real counselor assignments, district targets and
// SIS/school-level rollups when Dreamari has them. Never present the sibling
// schools as real aggregate data.

import { DEMO_SCHOOL, type CounselorStudent } from "./counselorRoster";

export const DISTRICT_NAME = "Lincoln Unified School District";
/** For the sidebar account line, where the full name truncates. */
export const DISTRICT_SHORT = "Lincoln Unified";

// ---- Counselors -------------------------------------------------------

export type SeededCounselor = {
  id: string;
  name: string;
  /** Last-name range this counselor carries, e.g. "A-G". */
  range: string;
  from: string;
  to: string;
};

export const SCHOOL_COUNSELORS: SeededCounselor[] = [
  { id: "c-ag", name: "Sarah Chen", range: "A-G", from: "A", to: "G" },
  { id: "c-hr", name: "Daniel Okafor", range: "H-R", from: "H", to: "R" },
  { id: "c-sz", name: "Renee Alvarez", range: "S-Z", from: "S", to: "Z" },
];

function lastInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1]?.[0] ?? "Z").toUpperCase();
}

export function counselorFor(student: CounselorStudent): SeededCounselor {
  const initial = lastInitial(student.name);
  return SCHOOL_COUNSELORS.find((c) => initial >= c.from && initial <= c.to) ?? SCHOOL_COUNSELORS[SCHOOL_COUNSELORS.length - 1];
}

// ---- Targets ----------------------------------------------------------

export const SCHOOL_TARGETS = {
  /** % of students On Track. */
  onTrack: 80,
  /** % of students with a declared postsecondary plan. */
  plansOnFile: 80,
  /** % of seniors with a declared postsecondary plan (the reference's own
   *  "Senior Plan Compliance" definition, as v1 My Impact computes it). */
  seniorPlan: 80,
  /** % of seniors whose Financial Aid milestone is approved or completed. */
  fafsa: 65,
  /** % of enrolled students active on the platform this month. */
  activeStudents: 60,
} as const;

export type TargetKey = keyof typeof SCHOOL_TARGETS;

export const TARGET_LABELS: Record<TargetKey, string> = {
  onTrack: "On-track rate",
  plansOnFile: "Postsecondary plans on file",
  seniorPlan: "Senior plan compliance",
  fafsa: "FAFSA completion",
  activeStudents: "Students active this month",
};

// ---- Readiness metrics from a roster ----------------------------------

export type ReadinessMetrics = {
  students: number;
  onTrack: number;
  needsAttention: number;
  atRisk: number;
  onTrackPct: number;
  withPlan: number;
  withPlanPct: number;
  seniors: number;
  seniorsCompliant: number;
  seniorPlanPct: number;
  fafsaDone: number;
  fafsaPct: number;
  pendingReviews: number;
  overdue: number;
  changesRequested: number;
};

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

export function readinessMetrics(roster: CounselorStudent[]): ReadinessMetrics {
  const students = roster.length;
  const onTrack = roster.filter((s) => s.status === "On Track").length;
  const atRisk = roster.filter((s) => s.status === "At Risk").length;
  const needsAttention = students - onTrack - atRisk;
  const withPlan = roster.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const seniorRows = roster.filter((s) => s.grade === 12);
  // The reference's own "Senior Plan Compliance": seniors with a declared
  // postsecondary plan (v1 My Impact reads 87% off exactly this). FAFSA is
  // the separate, stricter milestone measure below.
  const seniorsCompliant = seniorRows.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const fafsaDone = seniorRows.filter((s) => s.milestones["Financial Aid"] === "Approved" || s.milestones["Financial Aid"] === "Completed").length;
  let pendingReviews = 0;
  let overdue = 0;
  let changesRequested = 0;
  for (const s of roster) {
    for (const v of Object.values(s.milestones)) {
      if (v === "Pending Review") pendingReviews++;
      else if (v === "Overdue") overdue++;
      else if (v === "Changes Requested") changesRequested++;
    }
  }
  return {
    students, onTrack, needsAttention, atRisk, onTrackPct: pct(onTrack, students),
    withPlan, withPlanPct: pct(withPlan, students),
    seniors: seniorRows.length, seniorsCompliant, seniorPlanPct: pct(seniorsCompliant, seniorRows.length),
    fafsaDone, fafsaPct: pct(fafsaDone, seniorRows.length),
    pendingReviews, overdue, changesRequested,
  };
}

/** How far a value sits from its target, and the reserved status band it
 *  falls in: met (On Track green), within 10 points (Needs Attention
 *  amber), further (At Risk red). One rule for every "vs target" reading. */
export type TargetBand = "met" | "near" | "missed";
export function targetBand(value: number, target: number): TargetBand {
  if (value >= target) return "met";
  return target - value <= 10 ? "near" : "missed";
}

// ---- Platform engagement (home school) --------------------------------

/** Lincoln's latest month, the same values v2/PlatformEngagement.tsx shows
 *  (71 unique students of 120 in Sep 2026, 3.01 logins each). Kept as a
 *  ratio so a grade-filtered roster scales it rather than showing 71 of 30. */
export const HOME_ENGAGEMENT = { activeShare: 71 / 120, avgLogins: 3.01, weeklyActive: 42 } as const;

// ---- Schools ----------------------------------------------------------

export type SchoolSnapshot = ReadinessMetrics & {
  id: string;
  name: string;
  short: string;
  seeded: boolean;
  activeStudents: number;
  activePct: number;
  avgLogins: number;
};

type SiblingSeed = {
  id: string;
  name: string;
  short: string;
  /** Enrollment relative to Lincoln. */
  scale: number;
  /** Percentage-point offsets from Lincoln's own rates. */
  offsets: { onTrack: number; withPlan: number; seniorPlan: number; fafsa: number; active: number; logins: number };
};

// DEMO-ONLY: seeded sibling schools. Each is Lincoln, scaled and nudged, so
// the district always has one school clearly ahead (Jefferson), one clearly
// behind on both readiness and platform use (Washington), one large school
// behind mostly on FAFSA and usage (Roosevelt) and one close to Lincoln
// (Kennedy).
const SIBLING_SCHOOLS: SiblingSeed[] = [
  { id: "roosevelt", name: "Roosevelt High School", short: "Roosevelt", scale: 1.35, offsets: { onTrack: -6, withPlan: -4, seniorPlan: -9, fafsa: -12, active: -14, logins: -0.4 } },
  { id: "jefferson", name: "Jefferson High School", short: "Jefferson", scale: 0.9, offsets: { onTrack: 5, withPlan: 9, seniorPlan: 6, fafsa: 18, active: 12, logins: 0.6 } },
  { id: "washington", name: "Washington High School", short: "Washington", scale: 1.15, offsets: { onTrack: -14, withPlan: -11, seniorPlan: -16, fafsa: -9, active: -27, logins: -1.1 } },
  { id: "kennedy", name: "Kennedy High School", short: "Kennedy", scale: 0.75, offsets: { onTrack: -2, withPlan: 2, seniorPlan: -3, fafsa: 4, active: -5, logins: 0.1 } },
];

const clampPct = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function homeSchoolSnapshot(roster: CounselorStudent[]): SchoolSnapshot {
  const m = readinessMetrics(roster);
  const activeStudents = Math.round(m.students * HOME_ENGAGEMENT.activeShare);
  return { ...m, id: "lincoln", name: DEMO_SCHOOL, short: "Lincoln", seeded: false, activeStudents, activePct: pct(activeStudents, m.students), avgLogins: HOME_ENGAGEMENT.avgLogins };
}

function scaleSchool(home: SchoolSnapshot, seed: SiblingSeed): SchoolSnapshot {
  const students = Math.round(home.students * seed.scale);
  const seniors = Math.round(home.seniors * seed.scale);
  const onTrackPct = clampPct(home.onTrackPct + seed.offsets.onTrack);
  const withPlanPct = clampPct(home.withPlanPct + seed.offsets.withPlan);
  const seniorPlanPct = home.seniors ? clampPct(home.seniorPlanPct + seed.offsets.seniorPlan) : 0;
  const fafsaPct = home.seniors ? clampPct(home.fafsaPct + seed.offsets.fafsa) : 0;
  const activePct = clampPct(home.activePct + seed.offsets.active);
  const onTrack = Math.round((onTrackPct / 100) * students);
  // The not-on-track remainder splits in Lincoln's own attention:risk ratio.
  const homeRest = Math.max(1, home.needsAttention + home.atRisk);
  const rest = students - onTrack;
  const atRisk = Math.round(rest * (home.atRisk / homeRest));
  return {
    id: seed.id, name: seed.name, short: seed.short, seeded: true,
    students, onTrack, atRisk, needsAttention: rest - atRisk, onTrackPct,
    withPlan: Math.round((withPlanPct / 100) * students), withPlanPct,
    seniors, seniorsCompliant: Math.round((seniorPlanPct / 100) * seniors), seniorPlanPct,
    fafsaDone: Math.round((fafsaPct / 100) * seniors), fafsaPct,
    pendingReviews: Math.round(home.pendingReviews * seed.scale),
    overdue: Math.round(home.overdue * seed.scale * (1 - seed.offsets.onTrack / 40)),
    changesRequested: Math.round(home.changesRequested * seed.scale),
    activeStudents: Math.round((activePct / 100) * students), activePct,
    avgLogins: Math.max(0.5, Math.round((home.avgLogins + seed.offsets.logins) * 100) / 100),
  };
}

/** Lincoln (live) plus the four seeded siblings, in seed order. */
export function districtSchools(roster: CounselorStudent[]): SchoolSnapshot[] {
  const home = homeSchoolSnapshot(roster);
  return [home, ...SIBLING_SCHOOLS.map((seed) => scaleSchool(home, seed))];
}

/** The value a school posts for each target, in the target's own unit (%). */
export function schoolTargetValue(school: SchoolSnapshot, key: TargetKey): number {
  switch (key) {
    case "onTrack": return school.onTrackPct;
    case "plansOnFile": return school.withPlanPct;
    case "seniorPlan": return school.seniorPlanPct;
    case "fafsa": return school.fafsaPct;
    case "activeStudents": return school.activePct;
  }
}

export const TARGET_KEYS: TargetKey[] = ["onTrack", "plansOnFile", "seniorPlan", "fafsa", "activeStudents"];

export function targetsMet(school: SchoolSnapshot, keys: TargetKey[] = TARGET_KEYS): number {
  return keys.filter((k) => targetBand(schoolTargetValue(school, k), SCHOOL_TARGETS[k]) === "met").length;
}

/** Whole-district rollup: counts summed, rates recomputed from the sums. */
export function districtRollup(schools: SchoolSnapshot[]): SchoolSnapshot {
  const sum = (f: (s: SchoolSnapshot) => number) => schools.reduce((a, s) => a + f(s), 0);
  const students = sum((s) => s.students);
  const seniors = sum((s) => s.seniors);
  const onTrack = sum((s) => s.onTrack);
  const withPlan = sum((s) => s.withPlan);
  const seniorsCompliant = sum((s) => s.seniorsCompliant);
  const fafsaDone = sum((s) => s.fafsaDone);
  const activeStudents = sum((s) => s.activeStudents);
  return {
    id: "district", name: DISTRICT_NAME, short: "District", seeded: true,
    students, onTrack, needsAttention: sum((s) => s.needsAttention), atRisk: sum((s) => s.atRisk), onTrackPct: pct(onTrack, students),
    withPlan, withPlanPct: pct(withPlan, students),
    seniors, seniorsCompliant, seniorPlanPct: pct(seniorsCompliant, seniors),
    fafsaDone, fafsaPct: pct(fafsaDone, seniors),
    pendingReviews: sum((s) => s.pendingReviews), overdue: sum((s) => s.overdue), changesRequested: sum((s) => s.changesRequested),
    activeStudents, activePct: pct(activeStudents, students),
    avgLogins: students ? Math.round((sum((s) => s.avgLogins * s.students) / students) * 100) / 100 : 0,
  };
}
