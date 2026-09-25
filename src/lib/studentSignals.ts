// The bridge between the student app and the Counselor Dashboard (25 Sept
// 2026; Usman: "the student app in general, and My Plan in particular,
// should define what the counselor dashboard shows"). One place that reads
// what a student has actually done on Dreamari and turns it into what a
// counselor tracks: the status of every My Plan step for their grade.
//
// Two sources, one shape:
// - the LIVE student (this browser): every store the app writes (profile,
//   picks, saved careers and colleges, resume, report history, play and
//   glossary progress, dream score, career exploration, stage).
// - SEEDED students (the reference roster): the same signals derived from
//   the counts and milestone statuses the reference recorded per student
//   (engagement.simulations, careersSaved, milestones.Resume ...), so the
//   whole school reads through one function.
//
// Step status follows docs/handoff/specs/my-plan.md and gradePlanData.ts:
// IN APP steps auto-complete from real actions (no checkbox); OUT OF APP
// steps are either counselor-verified (the counselor's own decision, from
// counselorReviews) or student-reported (a checkbox in My Plan that the
// prototype does not persist, so they read "not tracked" here until the
// backend stores them).

import { readStudentProfile } from "./studentProfile";
import { readPicks } from "./picks";
import { readResume } from "./resume";
import { readReportHistory } from "./reportHistory";
import { readDreamScore } from "./dreamScore";
import { GRADE_PLANS, type GradeStep, type GradeWindow } from "@/components/profile/gradePlanData";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import type { CounselorStudent } from "./counselorRoster";

export type StudentSignals = {
  profileBuilt: boolean;
  avatarSet: boolean;
  interests: string[];
  subjects: string[];
  path: string;
  gpa: string;
  /** career ids, best first */
  top3: string[];
  focusCareer: string | null;
  careersSaved: number;
  collegesSaved: number;
  simulationsCompleted: number;
  glossaryLessonsCompleted: number;
  questionsAsked: number;
  resumeStarted: boolean;
  resumeSections: number;
  resumeAtsScore: number | null;
  reportVersions: number;
  reportSharedWithCounselor: boolean;
  experiencesLogged: number;
  dreamScore: number;
  stage: "hs" | "college";
};

function count(key: string): number {
  try {
    return (JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown[]).length;
  } catch {
    return 0;
  }
}
function has(key: string): boolean {
  try {
    return !!window.localStorage.getItem(key);
  } catch {
    return false;
  }
}
function simulationsDone(): number {
  try {
    const store = JSON.parse(window.localStorage.getItem("dreamari-play-progress") ?? "{}") as Record<string, { scored?: number }>;
    return Object.values(store).filter((r) => (r.scored ?? 0) >= 10).length;
  } catch {
    return 0;
  }
}
function glossaryDone(): number {
  try {
    const store = JSON.parse(window.localStorage.getItem("dreamari-glossary-progress") ?? "{}") as Record<string, { lessons?: Record<string, { completed?: boolean }> }>;
    return Object.values(store).reduce((n, c) => n + Object.values(c.lessons ?? {}).filter((l) => l.completed).length, 0);
  } catch {
    return 0;
  }
}
function experiencesLogged(): number {
  try {
    const v = JSON.parse(window.localStorage.getItem("dreamari-career-exploration") ?? "{}") as unknown;
    if (Array.isArray(v)) return v.length;
    if (v && typeof v === "object") return Object.values(v as Record<string, unknown>).reduce<number>((n, e) => n + (Array.isArray(e) ? e.length : 0), 0);
    return 0;
  } catch {
    return 0;
  }
}

/** Everything the live student has done on Dreamari, read from the app's own stores. */
export function readLiveSignals(): StudentSignals {
  if (typeof window === "undefined") return EMPTY_SIGNALS;
  const profile = readStudentProfile();
  const picks = readPicks();
  const resume = readResume();
  const reports = readReportHistory();
  const latestAts = resume.versions.map((v) => (v as unknown as { ats?: { qualityScore?: number } }).ats?.qualityScore).filter((n): n is number => typeof n === "number").pop() ?? null;
  return {
    profileBuilt: profile.interests.length > 0 && profile.subjects.length > 0,
    avatarSet: has("dreamari-jordan-avatar") || has("dreamari-cover"),
    interests: profile.interests,
    subjects: profile.subjects,
    path: profile.path,
    gpa: profile.gpa,
    top3: picks.ids,
    focusCareer: picks.focus,
    careersSaved: count("dreamari-saved-careers"),
    collegesSaved: count("dm-colleges-saved"),
    simulationsCompleted: simulationsDone(),
    glossaryLessonsCompleted: glossaryDone(),
    questionsAsked: 0, // Connect has no per-student "asked" store yet
    resumeStarted: resume.education.length > 0 || resume.experience.length > 0,
    resumeSections: [resume.education.length > 0, resume.experience.length > 0, resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0, resume.certifications.length > 0].filter(Boolean).length,
    resumeAtsScore: latestAts,
    reportVersions: reports.length,
    reportSharedWithCounselor: reports.some((r) => r.label === "Shared with counselor"),
    experiencesLogged: experiencesLogged(),
    dreamScore: readDreamScore(),
    stage: (() => { try { return window.localStorage.getItem("dreamari-stage") === "college" ? "college" : "hs"; } catch { return "hs"; } })(),
  };
}

export const EMPTY_SIGNALS: StudentSignals = {
  profileBuilt: false, avatarSet: false, interests: [], subjects: [], path: "", gpa: "", top3: [], focusCareer: null,
  careersSaved: 0, collegesSaved: 0, simulationsCompleted: 0, glossaryLessonsCompleted: 0, questionsAsked: 0,
  resumeStarted: false, resumeSections: 0, resumeAtsScore: null, reportVersions: 0, reportSharedWithCounselor: false,
  experiencesLogged: 0, dreamScore: 0, stage: "hs",
};

/** The same signals for a seeded roster row, derived from what the reference
 *  recorded about that student. Deterministic; nothing random. */
export function seededSignals(s: CounselorStudent): StudentSignals {
  const m = s.milestones;
  const done = (k: keyof typeof m) => m[k] === "Approved" || m[k] === "Completed";
  const started = (k: keyof typeof m) => m[k] === "In Progress" || m[k] === "Pending Review" || done(k);
  // The seeded student's Top 3 come from their world's catalog; a world
  // with no authored profile careers yet falls back to the whole catalog so
  // a student who the reference says has three matches always has three.
  const inWorld = ALL_PROFILE_CAREERS.filter((c) => c.world === s.careerTrack).map((c) => c.id);
  const catalog = inWorld.length >= 3 ? inWorld : [...inWorld, ...ALL_PROFILE_CAREERS.map((c) => c.id).filter((id) => !inWorld.includes(id))];
  return {
    profileBuilt: true,
    avatarSet: true,
    interests: [s.careerTrack],
    subjects: [],
    path: s.postsecondaryIntent === "Undecided" ? "" : s.postsecondaryIntent === "Trade/Technical School" ? "trades" : "college",
    gpa: "",
    top3: catalog.slice(0, Math.min(3, s.topMatches.length)),
    focusCareer: done("Career Pathway") ? (catalog[0] ?? null) : null,
    careersSaved: s.engagement.careersSaved,
    collegesSaved: s.engagement.collegesSaved,
    simulationsCompleted: s.engagement.simulations,
    glossaryLessonsCompleted: s.engagement.challenges,
    questionsAsked: s.engagement.questionsSubmitted,
    resumeStarted: started("Resume"),
    resumeSections: done("Resume") ? 4 : started("Resume") ? 2 : 0,
    resumeAtsScore: done("Resume") ? 70 + (s.roadmapPct % 25) : null,
    reportVersions: done("Career Report") ? 2 : started("Career Report") ? 1 : 0,
    reportSharedWithCounselor: m["Career Report"] === "Pending Review",
    experiencesLogged: Math.round(s.engagement.challenges / 2),
    dreamScore: s.engagement.dreamScore,
    stage: "hs",
  };
}

export function signalsFor(s: CounselorStudent): StudentSignals {
  return s.isReal ? readLiveSignals() : seededSignals(s);
}

// ---- My Plan step status --------------------------------------------------

export type StepStatus = "done" | "in-progress" | "not-started" | "awaiting-review" | "not-tracked";
export type StepKind = "in-app" | "counselor-verified" | "student-reported";

export function stepKind(step: GradeStep): StepKind {
  if (step.inApp) return "in-app";
  return step.counselorVerified ? "counselor-verified" : "student-reported";
}

/** IN APP steps: derived from the signals. `target` is the number the step
 *  asks for ("Explore 10 careers", "Play 3 simulations"); progress toward it
 *  is what makes "in progress" honest. */
function inAppStatus(step: GradeStep, sig: StudentSignals): { status: StepStatus; progress?: [number, number] } {
  const toward = (n: number, target: number): { status: StepStatus; progress: [number, number] } => ({ status: n >= target ? "done" : n > 0 ? "in-progress" : "not-started", progress: [Math.min(n, target), target] });
  switch (step.id) {
    case "g9-fall-build": return { status: sig.profileBuilt ? "done" : sig.interests.length > 0 ? "in-progress" : "not-started" };
    case "g9-fall-avatar": return { status: sig.avatarSet ? "done" : "not-started" };
    // "Explore 10 careers, save your Top 3": every saved career counts, and
    // each Top 3 pick stands for the careers compared to choose it. Done
    // only when the Top 3 is actually full.
    case "g9-fall-explore": {
      const explored = sig.careersSaved + sig.top3.length * 3;
      const r = toward(explored, 10);
      return sig.top3.length < 3 && r.status === "done" ? { status: "in-progress", progress: r.progress } : r;
    }
    case "g9-winter-play": return toward(sig.simulationsCompleted, 3);
    case "g9-spring-connect": return sig.questionsAsked > 0 ? toward(sig.questionsAsked, 2) : { status: "not-tracked" };
    case "g10-fall-decide": return { status: sig.focusCareer ? "done" : sig.top3.length > 0 ? "in-progress" : "not-started" };
    case "g10-fall-play": return toward(sig.glossaryLessonsCompleted, 3);
    case "g10-spring-build": return { status: sig.resumeSections >= 2 ? "done" : sig.resumeStarted ? "in-progress" : "not-started" };
    case "g10-spring-connect": return sig.questionsAsked > 0 ? toward(sig.questionsAsked, 3) : { status: "not-tracked" };
    case "g11-fall-play": return toward(sig.glossaryLessonsCompleted, 3);
    case "g11-fall-explore": return { status: sig.collegesSaved >= 3 ? "done" : sig.collegesSaved > 0 ? "in-progress" : "not-started", progress: [Math.min(sig.collegesSaved, 3), 3] };
    case "g11-winter-build": return { status: sig.resumeSections >= 3 ? "done" : sig.resumeStarted ? "in-progress" : "not-started" };
    case "g11-spring-connect": return sig.questionsAsked > 0 ? toward(sig.questionsAsked, 3) : { status: "not-tracked" };
    case "g12-fall-build": return { status: sig.resumeSections >= 4 || (sig.resumeAtsScore ?? 0) >= 80 ? "done" : sig.resumeStarted ? "in-progress" : "not-started" };
    case "g12-spring-decide": return { status: sig.path ? "done" : "not-started" };
    default: return { status: "not-tracked" };
  }
}

/** Counselor-verified OUT OF APP steps map onto the roster's milestone
 *  vocabulary so the counselor's decisions (counselorReviews) and the
 *  reference's statuses both apply. */
const VERIFIED_STEP_MILESTONE: Record<string, keyof CounselorStudent["milestones"]> = {
  "g9-winter-plan1": "Academic Plan",
  "g9-winter-plan2": "Academic Plan",
  "g10-winter-plan": "Academic Plan",
  "g10-winter-review": "Academic Plan",
  "g11-fall-review": "Academic Plan",
  "g11-winter-plan": "Academic Plan",
  "g11-spring-plan": "Applications",
  "g12-fall-review": "Transcript Submission",
  "g12-fall-track1": "Recommendation Letter",
  "g12-fall-track2": "Transcript Submission",
};
const REPORTED_STEP_MILESTONE: Record<string, keyof CounselorStudent["milestones"]> = {
  "g11-spring-fund": "Financial Aid",
  "g12-fall-track3": "Applications",
  "g12-winter-fund": "Financial Aid",
  "g12-spring-result": "Applications",
};

function milestoneToStatus(v: CounselorStudent["milestones"][keyof CounselorStudent["milestones"]]): StepStatus {
  if (v === "Approved" || v === "Completed") return "done";
  if (v === "Pending Review") return "awaiting-review";
  if (v === "In Progress") return "in-progress";
  if (v === "Not Started" || v === "Overdue" || v === "Changes Requested") return "not-started";
  return "not-tracked";
}

export type StepReading = { step: GradeStep; window: GradeWindow["id"]; kind: StepKind; status: StepStatus; progress?: [number, number]; milestone?: keyof CounselorStudent["milestones"] };

/** Every non-optional My Plan step for the student's grade, with its status. */
export function planReadings(s: CounselorStudent, sig: StudentSignals = signalsFor(s)): StepReading[] {
  const plan = GRADE_PLANS.find((p) => p.grade === s.grade) ?? GRADE_PLANS[0];
  const out: StepReading[] = [];
  for (const w of plan.windows) {
    for (const step of w.steps) {
      if (step.optional) continue;
      const kind = stepKind(step);
      if (kind === "in-app") {
        const r = inAppStatus(step, sig);
        out.push({ step, window: w.id, kind, status: r.status, progress: r.progress });
      } else {
        const key = (kind === "counselor-verified" ? VERIFIED_STEP_MILESTONE : REPORTED_STEP_MILESTONE)[step.id];
        const status: StepStatus = key ? milestoneToStatus(s.milestones[key]) : kind === "counselor-verified" ? "not-started" : "not-tracked";
        out.push({ step, window: w.id, kind, status, milestone: key });
      }
    }
  }
  return out;
}

export const STATUS_LABEL: Record<StepStatus, string> = {
  done: "Done",
  "in-progress": "In progress",
  "awaiting-review": "Awaiting your review",
  "not-started": "Not started",
  "not-tracked": "Not tracked yet",
};
export const KIND_LABEL: Record<StepKind, string> = {
  "in-app": "In app, auto-tracked",
  "counselor-verified": "You verify",
  "student-reported": "Student reports",
};
