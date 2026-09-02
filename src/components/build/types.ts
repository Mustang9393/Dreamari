// The rebuilt build-profile flow (docs/BUILD_FLOW_SPEC.md is the verbatim source of
// truth for every string and step). Sequence: 8 steps with a celebration interstitial
// after step 3 (at 50%), then the completion screen, then handoff to the existing
// Match experience. Replit's "Skip" buttons are demo chrome and intentionally absent.

export type StageId =
  | "interests"
  | "subjects"
  | "workVibe"
  | "milestone"
  | "education"
  | "cost"
  | "location"
  | "profile"
  | "complete";

// Progress percentages are exact per the reference flow: 13/25/38/50/63/75/88/100.
// The HUD labels the chapter ("BUILD") rather than the stage — see PhaseProgress —
// so no per-stage label lives here; counters would make the flow feel long.
export const STAGES: { id: StageId; percent: number; almostDone?: boolean }[] = [
  { id: "interests", percent: 13 },
  { id: "subjects", percent: 25 },
  { id: "workVibe", percent: 38 },
  { id: "milestone", percent: 50 },
  { id: "education", percent: 63 },
  { id: "cost", percent: 75 },
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
  { label: "Business & Money", slug: "business-money-office" },
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

// Balanced sits in the middle so the slider reads as a spectrum: fast — balanced — calm.
export const ENERGY_OPTIONS = ["Fast pace", "Balanced", "Calm"];
export const TEAM_OPTIONS = ["Solo", "Small team", "Big team"];

export const EDUCATION_OPTIONS: { title: string }[] = [
  { title: "Work after HS" },
  { title: "1–2 years" },
  { title: "4 years" },
  { title: "5 years+" },
  { title: "Not sure yet" },
];

// Slider stop labels, in track order. Index -1 = untouched ("Select a range").
export const COST_STOPS = [
  "As low as possible",
  "$25,000 or less",
  "$50,000 or less",
  "$100,000 or less",
  "Over $100,000 for the right path",
  "Cost is not a major factor for me",
  "I’m not sure yet",
];

export const GRADE_OPTIONS = ["8th grade", "9th grade", "10th grade", "11th grade", "12th grade", "College", "Other"];

export const TRAVEL_DISTANCE_OPTIONS = ["Within 25 miles", "Within 50 miles", "Within 100 miles", "Anywhere around your preferred state"];

export const GPA_OPTIONS = [
  "4.0 or higher",
  "3.5 to 3.9",
  "3.0 to 3.4",
  "2.5 to 2.9",
  "2.0 to 2.4",
  "Below 2.0",
  "My school does not use GPA",
];

export const PATH_OPTIONS: { id: "college" | "trades" | "both"; title: string; subtitle: string }[] = [
  { id: "college", title: "College", subtitle: "Majors & degrees" },
  { id: "trades", title: "Trades", subtitle: "Skilled careers" },
  { id: "both", title: "Both", subtitle: "Explore everything" },
];

export type BuildState = {
  interests: string[];
  subjects: string[];
  energy: string | null;
  teamStyle: string | null;
  education: string | null;
  costIndex: number; // -1 until the slider is touched
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
// 63/75/88/100 percent.
export const STAGE_ACCENTS: Record<StageId, string> = {
  interests: "#4767f3",
  subjects: "#5d64f4",
  workVibe: "#7560f5",
  milestone: "#8b5cf6",
  education: "#a956d9",
  cost: "#c550be",
  location: "#e34aa0",
  profile: "#ff4585",
  complete: "#ff4585",
};

// Dreamy's coaching line + expression sprite per stage (sprites in
// public/images/dreamy/, catalogued from the supplied expression packs).
export const STAGE_DREAMY: Record<Exclude<StageId, "milestone" | "complete">, { line: string; sprite: string }> = {
  interests: { line: "Start with what pulls your attention. ✨", sprite: "/images/dreamy/v2/dreamy-happy.png" },
  subjects: { line: "Pick the subjects you enjoy most. ✨", sprite: "/images/dreamy/v2/dreamy-glasses.png" },
  workVibe: { line: "There is no right answer. Just choose what feels like you. ✨", sprite: "/images/dreamy/v2/dreamy-idea.png" },
  education: { line: "How much education or training feels right? ✨", sprite: "/images/dreamy/v2/dreamy-puzzle.png" },
  cost: { line: "Choose a range that feels realistic. ✨", sprite: "/images/dreamy/v2/dreamy-curious.png" },
  // alert (red exclamation marks) and nervous (sweat drop) both read as
  // worried, not thoughtful -- wrong note for a flow that should feel
  // encouraging start to finish. Swapped for expressions from the same
  // pack that keep the tone positive.
  location: { line: "Choose states that feel possible for your next step. ✨", sprite: "/images/dreamy/v2/dreamy-curious.png" },
  profile: { line: "Last step. Let’s make your profile yours. ✨", sprite: "/images/dreamy/v2/dreamy-happy.png" },
};
