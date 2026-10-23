// The rebuilt build-profile flow (docs/BUILD_FLOW_SPEC.md is the verbatim source of
// truth for every string and step). Sequence: 8 steps with a celebration interstitial
// after step 3 (at 50%), then the completion screen, then handoff to the existing
// Match experience. Replit's "Skip" buttons are demo chrome and intentionally absent.

export type StageId =
  | "welcome"
  | "subjects"
  | "skills"
  | "interests"
  | "workVibe"
  | "milestone"
  | "education"
  // "cost" is no longer a Build stage (Joshua, 23 Oct 2026: the yearly
  // tuition question is removed from Build). It stays in this union because
  // My Build (PreferencesTab) still asks it with CostSlider and borrows this
  // stage's accent and Dreamy line for that section.
  | "cost"
  | "location"
  | "profile"
  | "complete";

// Progress percentages are exact per the reference flow: 13/25/38/50/63/75/88/100.
// The HUD labels the chapter ("BUILD") rather than the stage — see PhaseProgress —
// so no per-stage label lives here; counters would make the flow feel long.
export const STAGES: { id: StageId; percent: number; almostDone?: boolean }[] = [
  // A welcome beat before the first real question (direct feedback, 8 Sept
  // 2026): landing straight on "what interests you" with zero warm-up felt
  // abrupt coming out of signup. 0%, not 13% -- the HUD shouldn't look
  // already-underway before a single answer is given.
  { id: "welcome", percent: 0 },
  // Order per Joshua (Slack to Chandu, 23 Oct 2026): "Subjects, then
  // Skills (new), then Industries, then the remaining Build questions in
  // their current order", with the yearly tuition question removed. Seven
  // questions plus the halfway beat still fill the same eight slots, so the
  // reference percentages are unchanged. The celebration stays at 50%,
  // after the third question, because its copy says "halfway".
  { id: "subjects", percent: 13 },
  { id: "skills", percent: 25 },
  { id: "interests", percent: 38 },
  { id: "milestone", percent: 50 },
  { id: "workVibe", percent: 63 },
  { id: "education", percent: 75 },
  { id: "location", percent: 88, almostDone: true },
  { id: "profile", percent: 100, almostDone: true },
  { id: "complete", percent: 100 },
];

// All 15 worlds from the token set (the Replit reference only listed 13 —
// Farming/Animals/Nature and Fixing Machines & Engines were missing), paired
// with the pipeline's
// world color tokens (design-tokens: color.world.*) so each chip carries its own
// world accent. Slugs mirror the Figma variable names (see the tokens' descriptions
// for why some diverge from display labels).
export const INTEREST_WORLDS: { label: string; slug: string }[] = [
  { label: "Arts, Media & Sport", slug: "arts-media-sport" },
  { label: "Building & Construction", slug: "building-construction" },
  { label: "Business & Finance", slug: "business-money-office" },
  { label: "Counseling & Social Work", slug: "helping-human-services" },
  { label: "Driving, Flying & Shipping", slug: "driving-flying-shipping" },
  { label: "Factories & Making Things", slug: "factories-making-things" },
  { label: "Farming, Animals & Nature", slug: "farming-animals-nature" },
  { label: "Fixing Machines & Engines", slug: "fixing-machines-engines" },
  { label: "Food & Cooking", slug: "food-farming-nature" },
  { label: "Health & Medicine", slug: "health-medicine" },
  { label: "Law, Safety & Justice", slug: "law-safety-government" },
  { label: "Personal Care & Community Services", slug: "personal-care-community-services" },
  { label: "Science & Research", slug: "science-research" },
  { label: "Teaching & Education", slug: "teaching-learning" },
  { label: "Tech & Engineering", slug: "tech-engineering-design" },
];

export const SUBJECTS = [
  "Mathematics",
  "Science",
  "English/Literature",
  "History",
  "Art",
  "Music",
  "Computer Science",
  "Foreign Languages",
  "Business",
  "Psychology",
];

// The Skills question (Joshua, 23 Oct 2026), copy exactly as given. Each
// label is one of the 15 student-facing O*NET skills in the career
// dataset's "Skills" sheet ("Fixing things" = Repairing, "Helping people" =
// Service Orientation, and so on), so the picks join to matching with no
// renaming. Shown shuffled per student (see shuffledSkills); this is the
// canonical order for storage and for anything that lists them.
export const SKILL_OPTIONS = [
  "Fixing things",
  "Using your hands",
  "Picturing things",
  "Running machines",
  "Spotting mistakes",
  "Solving hard problems",
  "New ideas",
  "Understanding people",
  "Helping people",
  "Convincing people",
  "Teaching others",
  "Leading a team",
  "Managing money",
  "Staying organized",
  "Being active",
];
export const MAX_SKILLS = 3;

// A different order for every student, the same order for the whole session
// (Joshua, 23 Oct 2026: "randomize option order per student, stable within a
// session"), so the first chips on screen do not get picked just for being
// first. One seed per browser session; Back and forth through Build, or a
// second run in the same tab, keeps the order a student already saw.
const SKILLS_SEED_KEY = "dreamari-build-skills-seed";
export function shuffledSkills(): string[] {
  if (typeof window === "undefined") return SKILL_OPTIONS;
  let seed = 0;
  try {
    const raw = window.sessionStorage.getItem(SKILLS_SEED_KEY);
    seed = raw ? Number(raw) : 0;
    if (!seed) {
      seed = Math.floor(Math.random() * 2 ** 31) || 1;
      window.sessionStorage.setItem(SKILLS_SEED_KEY, String(seed));
    }
  } catch {
    seed = Math.floor(Math.random() * 2 ** 31) || 1;
  }
  // mulberry32 + Fisher-Yates: small, deterministic for the seed
  let t = seed;
  const rand = () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...SKILL_OPTIONS];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Balanced sits in the middle so the slider reads as a spectrum: fast — balanced — calm.
export const ENERGY_OPTIONS = ["Fast pace", "Balanced", "Calm"];
export const TEAM_OPTIONS = ["Solo", "Small team", "Big team"];

export const EDUCATION_OPTIONS: { title: string }[] = [
  { title: "Work after high school" },
  { title: "1-2 years" },
  { title: "4 years" },
  { title: "5 years+" },
  { title: "Not sure yet" },
];

// Slider stop labels, in track order. Index -1 = untouched ("Select a range").
// Build no longer asks this (Joshua, 23 Oct 2026); My Build still does.
// A YEARLY budget (Slack, 10 Sept 2026): the old wording left it unclear
// whether the number meant one year, two, or all of school; one clear frame
// works across 4-year colleges, community colleges and trade schools.
export const COST_STOPS = [
  "$25K or less",
  "$50K or less",
  "$75K or less",
  "$100K or less",
  "Cost isn’t a major factor",
  "I’m not sure",
];

export const GRADE_OPTIONS = ["8th grade", "9th grade", "10th grade", "11th grade", "12th grade", "College", "Other"];

export const TRAVEL_DISTANCE_OPTIONS = ["Within 25 miles", "Within 50 miles", "Within 100 miles", "Anywhere around your preferred state"];

// Precise, to the decimal (direct feedback, 11 Sept 2026: "we want really
// accurate, to the decimal level" -- a band like "3.5 to 3.9" was only ever
// a rough proxy for the school-matching math in pathway.ts). Every tenth
// from 2.0 to 4.0 (GpaField's slider stops), plus the three answers a
// single number can't hold.
export const GPA_SCALE: string[] = Array.from({ length: 21 }, (_, i) => (2 + i * 0.1).toFixed(1));
export const GPA_HIGHER = "4.0 or higher";
export const GPA_BELOW = "2.0 or below";
export const GPA_NOT_USED = "My school does not use GPA";
/** The flat list, highest first -- for any plain dropdown still using one
 *  (Settings, the college list's edit sheet); GpaField below is Build's own
 *  richer control for this same data and does not read this constant. */
export const GPA_OPTIONS = [GPA_HIGHER, ...[...GPA_SCALE].reverse(), GPA_BELOW, GPA_NOT_USED];

export const PATH_OPTIONS: { id: "college" | "trades" | "both"; title: string; subtitle: string }[] = [
  { id: "college", title: "College", subtitle: "Majors & degrees" },
  { id: "trades", title: "Trades", subtitle: "Skilled careers" },
  { id: "both", title: "Both", subtitle: "Explore everything" },
];

export type BuildState = {
  interests: string[];
  subjects: string[];
  /** up to MAX_SKILLS of SKILL_OPTIONS, in the order picked */
  skills: string[];
  energy: string | null;
  teamStyle: string | null;
  education: string | null;
  costIndex: number; // -1 until the slider is touched; Build no longer asks it, My Build does
  state: string; // the one state they're open to going to; "" = none picked
  fullName: string;
  email: string;
  grade: string;
  gpa: string;
  zipCode: string;
  travelDistance: string;
  path: "college" | "trades" | "both" | null;
};

export const INITIAL_BUILD_STATE: BuildState = {
  interests: [],
  subjects: [],
  skills: [],
  energy: null,
  teamStyle: null,
  education: null,
  costIndex: -1,
  state: "",
  fullName: "",
  email: "",
  grade: "",
  gpa: "",
  zipCode: "",
  travelDistance: "",
  path: null,
};

// Per-stage aurora accents: each stage's accent is the PROGRESS BAR's own gradient
// sampled at that stage's percent (brand #2f6bf2 -> accent purple #8b5cf6 -> world
// pink #ff4585, the same three stops the bar renders) — per direct feedback the
// background should "go off of what the progress bar is showing" rather than cycle
// through the whole palette. Values are the linear interpolation at 13/25/38/50/
// 63/75/88/100 percent, keyed by each stage's slot in STAGES (23 Oct 2026
// reorder: the colors stayed with the percentages, not with the questions).
// "cost" keeps its old 75% color for My Build's Tuition section.
export const STAGE_ACCENTS: Record<StageId, string> = {
  welcome: "#2f6bf2",
  subjects: "#4767f3",
  skills: "#5d64f4",
  interests: "#7560f5",
  milestone: "#8b5cf6",
  workVibe: "#a956d9",
  education: "#c550be",
  cost: "#c550be",
  location: "#e34aa0",
  profile: "#ff4585",
  complete: "#ff4585",
};

// DEMO-ONLY (?look=v2): the same walk, deep cobalt to luminous sky, all at
// the references' hue (213deg), with no violet or pink stops.
export const STAGE_ACCENTS_V2: Record<StageId, string> = {
  welcome: "#176acf",
  subjects: "#1e74dc",
  skills: "#2780ec",
  interests: "#3a8cf1",
  milestone: "#4a96f4",
  workVibe: "#59a0f8",
  education: "#74b0f8",
  cost: "#74b0f8",
  location: "#8abdf9",
  profile: "#9ec6fa",
  complete: "#9ec6fa",
};

// Dreamy's coaching line + expression sprite per stage (sprites in
// public/images/dreamy/, catalogued from the supplied expression packs).
export const STAGE_DREAMY: Record<Exclude<StageId, "welcome" | "milestone" | "complete">, { line: string; sprite: string }> = {
  // Subjects opens Build now (23 Oct 2026), so it carries the warm-up line
  // and the happy face; Industries, third, gets the glasses.
  subjects: { line: "Start with the subjects you enjoy most. ✨", sprite: "/images/dreamy/v2/dreamy-happy.webp" },
  skills: { line: "No wrong answers. Pick what feels fun. ✨", sprite: "/images/dreamy/v2/dreamy-idea.webp" },
  interests: { line: "Now pick the fields that pull your attention. ✨", sprite: "/images/dreamy/v2/dreamy-glasses.webp" },
  workVibe: { line: "There is no right answer. Just choose what feels like you. ✨", sprite: "/images/dreamy/v2/dreamy-idea.webp" },
  education: { line: "How much education or training feels right? ✨", sprite: "/images/dreamy/v2/dreamy-puzzle.webp" },
  cost: { line: "Choose a range that feels realistic. ✨", sprite: "/images/dreamy/v2/dreamy-curious.webp" },
  // alert (red exclamation marks) and nervous (sweat drop) both read as
  // worried, not thoughtful -- wrong note for a flow that should feel
  // encouraging start to finish. Swapped for expressions from the same
  // pack that keep the tone positive.
  location: { line: "Choose states that feel possible for your next step. ✨", sprite: "/images/dreamy/v2/dreamy-curious.webp" },
  profile: { line: "Last step. Let’s make your profile yours. ✨", sprite: "/images/dreamy/v2/dreamy-happy.webp" },
};
