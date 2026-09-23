// The Counselor Dashboard's caseload. There is no backend and no concept of
// multiple real student accounts in this prototype, so a real 120-student
// roster can't exist -- what CAN exist is one real student (whoever is
// signed in on THIS browser, read straight out of the same localStorage
// stores the student app already writes to) sitting inside a seeded,
// deterministic roster of synthetic classmates that gives the dashboard
// something to actually look and feel like a real caseload with. The seed
// technique mirrors `demoSeries()` in `src/components/connect/viz.tsx`
// (hash-based, not `Math.random()`) so the roster is stable across reloads
// instead of reshuffling every render.
//
// Read `realStudentEntry()` before trusting any one row as "real data" --
// every OTHER row in `getRoster()` is synthetic, generated once per index
// and never persisted. Don't wire this up to anything that implies real
// aggregate statistics across an actual school.

import { readStudentProfile } from "./studentProfile";
import { readPicks } from "./picks";
import { readResume } from "./resume";
import { readReportHistory } from "./reportHistory";
import { readDreamScore } from "./dreamScore";
import { INTEREST_WORLDS } from "@/components/build/types";

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
export type MilestoneStatus = "Approved" | "Pending Review" | "Changes Requested" | "In Progress" | "Not Started";
export type CaseloadStatus = "On Track" | "Needs Attention" | "At Risk";
export type PostsecondaryIntent = "4-Year College" | "2-Year College" | "Trade / Technical School" | "Workforce" | "Military" | "Undecided";

export type CounselorStudent = {
  id: string;
  name: string;
  grade: number;
  school: string;
  careerTrack: string;
  roadmapPct: number;
  status: CaseloadStatus;
  postsecondaryIntent: PostsecondaryIntent;
  milestones: Record<MilestoneKey, MilestoneStatus>;
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
};

const CAREER_TRACKS = INTEREST_WORLDS.map((w) => w.label);

// Real, specific career titles per world -- the alternative (deriving a
// title from the track label, e.g. "Tech Role 1") read as an obvious
// placeholder, not a real match. Five per track keeps every seeded
// student's Top 5 concrete and varied.
const CAREER_TITLES_BY_TRACK: Record<string, string[]> = {
  "Arts, Media & Sport": ["Graphic Designer", "Video Editor", "Sports Coach", "Music Producer", "Art Director"],
  "Building & Construction": ["Civil Engineer", "Architect", "Construction Manager", "Electrician", "Carpenter"],
  "Business & Finance": ["Investment Banker", "Accountant", "Marketing Manager", "Financial Analyst", "Entrepreneur"],
  "Counseling & Social Work": ["School Counselor", "Social Worker", "Case Manager", "Therapist", "Youth Advocate"],
  "Driving, Flying & Shipping": ["Airline Pilot", "Logistics Coordinator", "Truck Driver", "Air Traffic Controller", "Ship Captain"],
  "Factories & Making Things": ["Manufacturing Engineer", "Quality Inspector", "Machinist", "Production Supervisor", "Industrial Designer"],
  "Farming, Animals & Nature": ["Veterinarian", "Agricultural Scientist", "Park Ranger", "Zoologist", "Farm Manager"],
  "Fixing Machines & Engines": ["Automotive Technician", "HVAC Technician", "Aircraft Mechanic", "Industrial Mechanic", "Electrician"],
  "Food & Cooking": ["Chef", "Restaurant Manager", "Food Scientist", "Nutritionist", "Baker"],
  "Health & Medicine": ["Registered Nurse", "Physician", "Physical Therapist", "Medical Technician", "Pharmacist"],
  "Law, Safety & Justice": ["Attorney", "Police Officer", "Paralegal", "Firefighter", "Criminal Investigator"],
  "Personal Care & Community Services": ["Cosmetologist", "Fitness Trainer", "Event Planner", "Community Organizer", "Childcare Director"],
  "Science & Research": ["Research Scientist", "Lab Technician", "Environmental Scientist", "Biomedical Researcher", "Data Analyst"],
  "Teaching & Education": ["Teacher", "School Administrator", "Curriculum Designer", "Instructional Coach", "Education Consultant"],
  "Tech & Engineering": ["Software Engineer", "Data Scientist", "Cybersecurity Analyst", "UX Designer", "IT Project Manager"],
};

const FIRST_NAMES = [
  "Emma", "Marcus", "Aisha", "Diego", "Olivia", "Jamal", "Sophia", "Henry", "Chloe", "Victoria",
  "Charlotte", "Isabella", "Jackson", "Sebastian", "Elizabeth", "Noah", "Ava", "Liam", "Mia", "Ethan",
  "Amara", "Lucas", "Zoe", "Gabriel", "Layla", "Mason", "Nora", "Caleb", "Priya", "Owen",
  "Ruby", "Elijah", "Hannah", "Wyatt", "Grace", "Julian", "Lily", "Adrian", "Scarlett", "Xavier",
];
const LAST_NAMES = [
  "Rodriguez", "Thompson", "Patel", "Martinez", "Chen", "Washington", "Kim", "Anderson", "Davis", "Santos",
  "Thomas", "Wilson", "Johnson", "Garcia", "Brown", "Taylor", "Moore", "Jackson", "Lee", "Nguyen",
  "Clark", "Lewis", "Walker", "Hall", "Young", "King", "Wright", "Scott", "Green", "Baker",
];

const POSTSECONDARY: PostsecondaryIntent[] = ["4-Year College", "4-Year College", "2-Year College", "Trade / Technical School", "Workforce", "Undecided"];

/** FNV-1a hash seeded PRNG, same technique as `demoSeries()` in viz.tsx --
 *  deterministic per seed string, no `Math.random()`. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h % 100000) / 100000;
  };
}
function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function milestonesForRoadmap(rand: () => number, roadmapPct: number): Record<MilestoneKey, MilestoneStatus> {
  const approvedCount = Math.round((roadmapPct / 100) * MILESTONE_KEYS.length);
  const out = {} as Record<MilestoneKey, MilestoneStatus>;
  MILESTONE_KEYS.forEach((key, i) => {
    if (i < approvedCount) {
      out[key] = "Approved";
    } else if (i === approvedCount) {
      out[key] = pick(rand, ["In Progress", "Pending Review", "Not Started"] as const);
    } else {
      out[key] = rand() < 0.15 ? "Changes Requested" : "Not Started";
    }
  });
  return out;
}

function seedStudent(index: number): CounselorStudent {
  const rand = seededRandom(`counselor-roster-${index}`);
  const name = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
  const grade = 9 + Math.floor(rand() * 4);
  // Weighted toward On Track -- matches the reference's own 86% on-track ratio.
  const statusRoll = rand();
  const status: CaseloadStatus = statusRoll < 0.86 ? "On Track" : statusRoll < 0.95 ? "Needs Attention" : "At Risk";
  const roadmapPct = status === "On Track" ? 55 + Math.floor(rand() * 45) : status === "Needs Attention" ? 30 + Math.floor(rand() * 30) : Math.floor(rand() * 30);
  const careerTrack = pick(rand, CAREER_TRACKS);
  const titles = CAREER_TITLES_BY_TRACK[careerTrack] ?? [careerTrack];
  const topMatches = titles.map((title, i) => ({ title, pct: Math.max(45, 94 - i * 6 - Math.floor(rand() * 6)) }));
  const daysAgo = Math.floor(rand() * 10);
  const lastActive = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
  return {
    id: `seed-${index}`,
    name,
    grade,
    school: DEMO_SCHOOL,
    careerTrack,
    roadmapPct,
    status,
    postsecondaryIntent: pick(rand, POSTSECONDARY),
    milestones: milestonesForRoadmap(rand, roadmapPct),
    topMatches,
    engagement: {
      dreamScore: 20 + Math.floor(rand() * 220),
      dailyDropsCompleted: Math.floor(rand() * 100),
      simulations: Math.floor(rand() * 20),
      careersSaved: Math.floor(rand() * 18),
      collegesSaved: Math.floor(rand() * 25),
      challenges: Math.floor(rand() * 12),
      questionsSubmitted: Math.floor(rand() * 6),
      communityPosts: Math.floor(rand() * 15),
    },
    lastActive,
    isReal: false,
  };
}

/** Title-cased fallback for a career id with no catalog lookup wired in yet
 *  ("investment-banking" -> "Investment Banking") -- good enough for a
 *  roster row; swap for the real catalog title resolver if/when one is
 *  exported from the career data module. */
function titleFromId(id: string): string {
  return id.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

/** The one real roster row: whatever this browser's student has actually
 *  done, mapped onto the same shape as the seeded rows. Uses the app's
 *  existing fixed demo identity (the student Profile page always shows
 *  "Jordan Rivera" -- see src/lib/avatar.ts) since StudentProfile has no
 *  name field of its own. Grade defaults to 11 (StudentProfile doesn't
 *  track grade either); everything else below is read live. */
export function realStudentEntry(): CounselorStudent {
  const profile = readStudentProfile();
  const picks = readPicks();
  const resume = readResume();
  const reports = readReportHistory();
  const dreamScore = readDreamScore();

  const careerTrack = INTEREST_WORLDS.find((w) => profile.interests[0] && w.slug === profile.interests[0])?.label ?? profile.interests[0] ?? "Undeclared";
  const topMatches = picks.ids.map((id, i) => ({ title: titleFromId(id), pct: Math.max(60, 94 - i * 8) }));

  const resumeDone = resume.education.length > 0 || resume.experience.length > 0;
  const roadmapSignals = [profile.interests.length > 0, profile.subjects.length > 0, picks.ids.length > 0, resumeDone, reports.length > 0];
  const roadmapPct = Math.round((roadmapSignals.filter(Boolean).length / roadmapSignals.length) * 100);
  const status: CaseloadStatus = roadmapPct >= 55 ? "On Track" : roadmapPct >= 30 ? "Needs Attention" : "At Risk";

  const milestones = { ...milestonesForRoadmap(seededRandom("real-student-fill"), roadmapPct) };
  milestones["Career Pathway"] = profile.interests.length > 0 ? "Approved" : "Not Started";
  milestones["Career Report"] = reports.length > 0 ? "Approved" : "Not Started";
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
    name: "Jordan Rivera",
    grade: 11,
    school: DEMO_SCHOOL,
    careerTrack,
    roadmapPct,
    status,
    postsecondaryIntent: profile.path === "college" ? "4-Year College" : profile.path === "trades" ? "Trade / Technical School" : "Undecided",
    milestones,
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
  };
}

const ROSTER_SIZE = 119;
let cachedRoster: CounselorStudent[] | null = null;

/** The full caseload: the real student inserted at a fixed, stable position
 *  (not just appended) plus `ROSTER_SIZE` seeded classmates. Seeded rows are
 *  cached for the life of the page load; the real row is always read fresh. */
export function getRoster(): CounselorStudent[] {
  if (!cachedRoster) {
    cachedRoster = Array.from({ length: ROSTER_SIZE }, (_, i) => seedStudent(i));
  }
  const real = realStudentEntry();
  const insertAt = 4;
  return [...cachedRoster.slice(0, insertAt), real, ...cachedRoster.slice(insertAt)];
}

export function getStudentById(id: string): CounselorStudent | undefined {
  if (id === "real-student") return realStudentEntry();
  return getRoster().find((s) => s.id === id);
}

/** A short, specific reason a student is flagged, derived straight from
 *  their own milestone data -- not a canned "needs attention" label. A
 *  counselor scanning the Overview strip should see WHY, not just WHO
 *  (direct instruction: "show a signal that shows why the students need
 *  attention"). Checked worst-first: an actual rejection is more urgent
 *  than something merely not started yet, which is more urgent than a low
 *  roadmap percentage with no specific stalled milestone. */
export type AttentionSeverity = "Critical" | "High" | "Medium";
const SEVERITY_RANK: Record<AttentionSeverity, number> = { Critical: 3, High: 2, Medium: 1 };

// Reason and severity computed together, from the same read of the
// student's milestones, so the two can never disagree with each other --
// an active rejection sitting unaddressed (Changes Requested) outranks a
// milestone that's merely not started yet, which outranks a generically
// low roadmap percentage (direct instruction: "rate by severity so
// counselor knows what to give attention first"). Milestone name leads,
// flag word trails in the reason text -- shorter and more scannable than
// a "Changes requested: X" label prefix, and reads the same direction as
// the milestone chips everywhere else in this dashboard.
function attentionSignal(s: CounselorStudent): { reason: string; severity: AttentionSeverity } {
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
