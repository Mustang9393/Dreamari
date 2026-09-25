// The Counselor Dashboard's caseload.
//
// v1 of the dashboard is a 1:1 port of the Replit reference in structure AND
// content (direct instruction, 24 Sept 2026), so `getRoster()` is the
// reference's own 120 students, verbatim: the roster table's columns
// (counselorRosterData.ts) plus each student's drill-down (DOB, grade-scoped
// milestone statuses, engagement, support flag; counselorProfileData.ts).
// There is no backend and no concept of multiple real student accounts in
// this prototype, so a real 120-student roster can't exist; what CAN exist
// is one real student (whoever is signed in on THIS browser, read straight
// out of the same localStorage stores the student app writes to), which v2
// of the dashboard adds on top via `getRosterWithLive()` so the "draws from
// the student app" story stays true there without breaking v1's 1:1 totals.
//
// Read `realStudentEntry()` before trusting any one row as "real data" --
// every other row is reference content. Don't wire this up to anything that
// implies real aggregate statistics across an actual school.

import { readStudentProfile } from "./studentProfile";
import { readPicks } from "./picks";
import { readResume } from "./resume";
import { readReportHistory } from "./reportHistory";
import { readDreamScore } from "./dreamScore";
import { REFERENCE_ROSTER } from "./counselorRosterData";
import { REFERENCE_PROFILES, STATUS_CODES, MILESTONES_FOR_GRADE, CLUSTER_BY_TRACK, TOP5_BY_TRACK, educationGoalsFor } from "./counselorProfileData";
import { ROSTER_PORTRAITS } from "./counselorRosterPortraits";

export const DEMO_SCHOOL = "Lincoln High School";

export const MILESTONE_KEYS = [
  "Career Assessment",
  "Career Report",
  "Academic Plan",
  "Career Pathway",
  "Resume",
  "College Exploration",
  "College List",
  "Applications",
  "Financial Aid",
  "Recommendation Letter",
  "Transcript Submission",
] as const;
export type MilestoneKey = (typeof MILESTONE_KEYS)[number];
// The reference's own vocabulary, including three states the first port
// didn't model: "Completed" (student-completed, no counselor approval
// involved), "Overdue", and "Not Applicable" (the reference renders it as a
// dash for milestones a grade hasn't reached yet).
export type MilestoneStatus = "Approved" | "Pending Review" | "Changes Requested" | "In Progress" | "Not Started" | "Completed" | "Overdue" | "Not Applicable";
export type CaseloadStatus = "On Track" | "Needs Attention" | "At Risk";
// Spelled the reference's way ("Trade/Technical School").
export type PostsecondaryIntent = "4-Year College" | "2-Year College" | "Trade/Technical School" | "Workforce" | "Military" | "Undecided";

// The reference's seven career families, kept for its own cluster and
// Top 5 tables (counselorProfileData.ts).
export const REFERENCE_TRACKS = ["Technology", "Healthcare", "Finance & Business", "Skilled Trades", "Education", "Arts & Media", "Law & Government"] as const;
export type CareerTrack = (typeof REFERENCE_TRACKS)[number];

// A student's pathway is the reference's own career track, verbatim (25
// Sept 2026: an earlier pass spread these onto Build's fifteen interest
// worlds for "parity with Dreamari's plan" -- reverted the same day,
// direct instruction: "take out all the additional stuff we did for
// parity with dreamari's plan... we want the content and everything to
// match the replit, just the UX and UI enhancements"). `WORLD_TO_TRACK`
// below still converts the ONE live student's real Build pick into one
// of these seven, since a real Dreamari session can't have declared a
// fictional reference track directly.
export const CAREER_TRACKS: string[] = [...REFERENCE_TRACKS];

export type CounselorStudent = {
  id: string;
  /** The reference's own student number, e.g. "#ER-00001". */
  tag: string;
  name: string;
  grade: number;
  school: string;
  dob: string;
  careerTrack: string;
  /** The reference's cluster label for the pathway ("Information Technology & Engineering"). */
  careerCluster: string;
  educationGoals: string[];
  roadmapPct: number;
  status: CaseloadStatus;
  postsecondaryIntent: PostsecondaryIntent;
  milestones: Record<MilestoneKey, MilestoneStatus>;
  /** How many of the 11 milestones apply at this student's grade (the
   *  reference tracks 3 / 5 / 6 / 11 for Grades 9-12). */
  milestoneCount: number;
  supportFlagReason: string | null;
  topMatches: { title: string; pct: number }[];
  engagement: {
    dreamScore: number;
    dailyDropsCompleted: number;
    simulations: number;
    careersSaved: number;
    collegesSaved: number;
    challenges: number;
    questionsSubmitted: number;
    communityPosts: number;
  };
  lastActive: string;
  /** true for the one row backed by this browser's real student data. */
  isReal: boolean;
  /** The portrait file number (student-NN.png) this seeded student wears,
   *  hand-matched to the name (counselorRosterPortraits.ts). -1 for the
   *  real student, who wears Jordan's own avatar. */
  avatarIndex: number;
};

/** The milestones the reference shows for a grade, in order. */
export function milestonesForGrade(grade: number): MilestoneKey[] {
  return MILESTONE_KEYS.slice(0, MILESTONES_FOR_GRADE[grade] ?? MILESTONE_KEYS.length);
}

// The student app's 15 interest worlds folded onto the reference's 7
// pathways, for the one live row.
const WORLD_TO_TRACK: Record<string, CareerTrack> = {
  "arts-media-sport": "Arts & Media",
  "building-construction": "Skilled Trades",
  "business-money-office": "Finance & Business",
  "helping-human-services": "Education",
  "driving-flying-shipping": "Skilled Trades",
  "factories-making-things": "Skilled Trades",
  "farming-animals-nature": "Skilled Trades",
  "fixing-machines-engines": "Skilled Trades",
  "food-farming-nature": "Skilled Trades",
  "health-medicine": "Healthcare",
  "law-safety-government": "Law & Government",
  "personal-care-community-services": "Education",
  "science-research": "Technology",
  "teaching-learning": "Education",
  "tech-engineering-design": "Technology",
};

function asStatus(s: string): MilestoneStatus {
  return s === "—" ? "Not Applicable" : (s as MilestoneStatus);
}

function initialsOf(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function buildReferenceRoster(): CounselorStudent[] {
  return REFERENCE_ROSTER.map((row, i) => {
    const [name, grade, careerTrack, roadmapPct, status, careerReport, resume, applications, recLetter, transcript, intent, lastActive] = row;
    const [dob, statuses, dreamScore, dailyDrops, simulations, careersSaved, collegesSaved, challenges, questions, posts, flag] = REFERENCE_PROFILES[i];
    // Grade-scoped statuses from the drill-down for the milestones the
    // reference tracks at this grade; the roster table's own three
    // application-stage columns for anything beyond that (they read "Not
    // Started" or the reference's dash there); dash for the rest.
    const milestones = {} as Record<MilestoneKey, MilestoneStatus>;
    MILESTONE_KEYS.forEach((key, k) => {
      const code = statuses[k] as keyof typeof STATUS_CODES | undefined;
      if (code && STATUS_CODES[code]) {
        milestones[key] = STATUS_CODES[code];
      } else if (key === "Applications") milestones[key] = asStatus(applications);
      else if (key === "Recommendation Letter") milestones[key] = asStatus(recLetter);
      else if (key === "Transcript Submission") milestones[key] = asStatus(transcript);
      else milestones[key] = "Not Applicable";
    });
    // The table and the drill-down agree on these two everywhere; keep the
    // table's value authoritative in case a captured row ever drifts.
    milestones["Career Report"] = asStatus(careerReport);
    milestones["Resume"] = statuses.length >= 5 ? milestones["Resume"] : asStatus(resume);
    const id = i + 1;
    return {
      id: `ref-${i}`,
      tag: `#${initialsOf(name)}-${String(id).padStart(5, "0")}`,
      name,
      grade,
      school: DEMO_SCHOOL,
      dob,
      careerTrack,
      careerCluster: CLUSTER_BY_TRACK[careerTrack] ?? careerTrack,
      educationGoals: educationGoalsFor(intent),
      roadmapPct,
      status: status as CaseloadStatus,
      postsecondaryIntent: intent as PostsecondaryIntent,
      milestones,
      milestoneCount: statuses.length,
      supportFlagReason: flag,
      topMatches: TOP5_BY_TRACK[careerTrack] ?? TOP5_BY_TRACK.Technology,
      engagement: { dreamScore, dailyDropsCompleted: dailyDrops, simulations, careersSaved, collegesSaved, challenges, questionsSubmitted: questions, communityPosts: posts },
      lastActive,
      isReal: false,
      avatarIndex: ROSTER_PORTRAITS[name] ?? 33 + (i % 48),
    };
  });
}

/** Title-cased fallback for a career id with no catalog lookup wired in yet
 *  ("investment-banking" -> "Investment Banking"). */
function titleFromId(id: string): string {
  return id.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

/** The one real roster row: whatever this browser's student has actually
 *  done, mapped onto the same shape as the reference rows. Uses the app's
 *  existing fixed demo identity (the student Profile page always shows
 *  "Jordan Rivera" -- see src/lib/avatar.ts) since StudentProfile has no
 *  name field of its own. Grade defaults to 11 (StudentProfile doesn't
 *  track grade either); everything else below is read live. Used by v2 of
 *  the dashboard only (see getRosterWithLive). */
export function realStudentEntry(): CounselorStudent {
  const profile = readStudentProfile();
  const picks = readPicks();
  const resume = readResume();
  const reports = readReportHistory();
  const dreamScore = readDreamScore();

  // The live student's pathway is the reference track their first Build
  // interest maps onto, not the Build world's own name (25 Sept 2026
  // reversion: the dashboard's pathway vocabulary is the reference's seven
  // tracks everywhere, including this one real row).
  const family: CareerTrack | undefined = profile.interests[0] ? WORLD_TO_TRACK[profile.interests[0]] : undefined;
  const careerTrack: string = family ?? "Undeclared";
  const topMatches = picks.ids.length > 0 ? picks.ids.map((id, i) => ({ title: titleFromId(id), pct: Math.max(60, 94 - i * 8) })) : family ? TOP5_BY_TRACK[family] : [];

  const resumeDone = resume.education.length > 0 || resume.experience.length > 0;
  const roadmapSignals = [profile.interests.length > 0, profile.subjects.length > 0, picks.ids.length > 0, resumeDone, reports.length > 0];
  const roadmapPct = Math.round((roadmapSignals.filter(Boolean).length / roadmapSignals.length) * 100);
  const status: CaseloadStatus = roadmapPct >= 55 ? "On Track" : roadmapPct >= 30 ? "Needs Attention" : "At Risk";
  const intent: PostsecondaryIntent = profile.path === "college" ? "4-Year College" : profile.path === "trades" ? "Trade/Technical School" : "Undecided";

  // Only four milestones have a real signal in the student app; the rest
  // read as not started rather than pretending.
  const milestones = Object.fromEntries(MILESTONE_KEYS.map((k) => [k, "Not Started"])) as Record<MilestoneKey, MilestoneStatus>;
  milestones["Career Pathway"] = profile.interests.length > 0 ? "Approved" : "Not Started";
  // A report the student shared with their counselor is a submission: it
  // lands in the Review Queue as Pending Review until the counselor decides
  // (counselorReviews overlays the decision). A report only saved or
  // printed is the student's own, complete but not reviewed.
  const shared = reports.some((r) => r.label === "Shared with counselor");
  milestones["Career Report"] = shared ? "Pending Review" : reports.length > 0 ? "Completed" : "Not Started";
  milestones["Resume"] = resumeDone ? "Approved" : "Not Started";
  milestones["Academic Plan"] = profile.subjects.length > 0 ? "Approved" : "Not Started";

  let savedCareersCount = 0;
  let savedCollegesCount = 0;
  try {
    savedCareersCount = (JSON.parse(window.localStorage.getItem("dreamari-saved-careers") ?? "[]") as unknown[]).length;
  } catch {
    // ignore
  }
  try {
    savedCollegesCount = (JSON.parse(window.localStorage.getItem("dm-colleges-saved") ?? "[]") as unknown[]).length;
  } catch {
    // ignore
  }

  return {
    id: "real-student",
    tag: "#JR-LIVE",
    name: "Jordan Rivera",
    grade: 11,
    school: DEMO_SCHOOL,
    dob: "—",
    careerTrack,
    careerCluster: family ? CLUSTER_BY_TRACK[family] : "Undeclared",
    educationGoals: educationGoalsFor(intent),
    roadmapPct,
    status,
    postsecondaryIntent: intent,
    milestones,
    milestoneCount: MILESTONES_FOR_GRADE[11],
    supportFlagReason: null,
    topMatches,
    engagement: {
      dreamScore,
      dailyDropsCompleted: 0,
      simulations: 0,
      careersSaved: savedCareersCount,
      collegesSaved: savedCollegesCount,
      challenges: 0,
      questionsSubmitted: 0,
      communityPosts: 0,
    },
    lastActive: new Date().toISOString().slice(0, 10),
    isReal: true,
    avatarIndex: -1,
  };
}

let cachedRoster: CounselorStudent[] | null = null;

/** Portrait index for a seeded student known only by name (Connect's
 *  questions carry names, not ids); the real student and unknown names fall
 *  through to the name-based avatar. */
export function avatarIndexForName(name: string): number | undefined {
  return getRoster().find((s) => s.name === name)?.avatarIndex;
}

/** The reference caseload, exactly as the Replit shows it: 120 rows. */
export function getRoster(): CounselorStudent[] {
  if (!cachedRoster) cachedRoster = buildReferenceRoster();
  return cachedRoster;
}

/** The reference caseload plus this browser's live student, inserted at a
 *  fixed position (not appended) so it reads as an ordinary row. The live
 *  row is always read fresh. v2 only. */
export function getRosterWithLive(): CounselorStudent[] {
  const base = getRoster();
  const insertAt = 4;
  return [...base.slice(0, insertAt), realStudentEntry(), ...base.slice(insertAt)];
}

export function getStudentById(id: string): CounselorStudent | undefined {
  if (id === "real-student") return realStudentEntry();
  return getRoster().find((s) => s.id === id);
}

/** A short, specific reason a student is flagged, derived straight from
 *  their own milestone data -- not a canned "needs attention" label.
 *  Checked worst-first: an overdue or rejected submission is more urgent
 *  than something merely not started, which is more urgent than a low
 *  roadmap percentage with no specific stalled milestone. */
export type AttentionSeverity = "Critical" | "High" | "Medium";
const SEVERITY_RANK: Record<AttentionSeverity, number> = { Critical: 3, High: 2, Medium: 1 };

function attentionSignal(s: CounselorStudent): { reason: string; severity: AttentionSeverity } {
  const overdue = MILESTONE_KEYS.filter((k) => s.milestones[k] === "Overdue");
  if (overdue.length > 0) return { reason: `${overdue[0]} overdue`, severity: "Critical" };
  const changesRequested = MILESTONE_KEYS.filter((k) => s.milestones[k] === "Changes Requested");
  if (changesRequested.length > 0) return { reason: `${changesRequested[0]} needs changes`, severity: "Critical" };
  const notStarted = MILESTONE_KEYS.filter((k) => s.milestones[k] === "Not Started");
  if (notStarted.length >= 3) return { reason: `${notStarted.length} milestones not started`, severity: "High" };
  if (notStarted.length === 1) return { reason: `${notStarted[0]} not started`, severity: "Medium" };
  if (notStarted.length > 1) return { reason: `${notStarted[0]} +${notStarted.length - 1} more`, severity: "Medium" };
  if (s.roadmapPct < 30) return { reason: `Roadmap ${s.roadmapPct}% complete`, severity: "Medium" };
  return { reason: "Behind pace for grade", severity: "Medium" };
}

export function attentionReason(s: CounselorStudent): string {
  return attentionSignal(s).reason;
}
export function attentionSeverity(s: CounselorStudent): AttentionSeverity {
  return attentionSignal(s).severity;
}
/** Highest first. Ties (e.g. two "Medium"s) fall back to whichever
 *  student has completed less of their roadmap -- the more behind one
 *  surfaces first within the same tier. */
export function attentionRank(a: CounselorStudent, b: CounselorStudent): number {
  const bySeverity = SEVERITY_RANK[attentionSeverity(b)] - SEVERITY_RANK[attentionSeverity(a)];
  return bySeverity !== 0 ? bySeverity : a.roadmapPct - b.roadmapPct;
}
