// Analytics (22 Oct 2026): the data behind v7's Analytics tab, built to
// match Joshua's Replit in function (Chandu: "lets make the v7 1:1 with the
// replit apart from the cosmetic upgrades and the design system upgrades").
//
// Two kinds of numbers live here, and each one says which it is:
//   - real reads over the roster (useReviewedRoster): the student count,
//     who is on track, each student's postsecondary plan, and the Risk list
//     with its category filter and count tiles, so the figures agree with
//     Students and Prepare;
//   - the Replit's own demo measures (GPA 86%, FAFSA 64%...), kept as seeds
//     tagged DEMO-ONLY, because no source for them exists in this prototype
//     (the Replit's Grade and Outcomes filters never changed them either).

import { MILESTONE_KEYS, lastActiveLabel, milestonesForGrade, type CounselorStudent, type PostsecondaryIntent } from "@/lib/counselorRoster";

export const ANALYTICS_TABS = [
  { key: "overview", label: "Overview" },
  { key: "readiness", label: "Readiness" },
  { key: "postsecondary", label: "Postsecondary" },
  { key: "career", label: "Career & WBL" },
  { key: "risk", label: "Risk" },
  { key: "outcomes", label: "Outcomes" },
  { key: "engagement", label: "Engagement" },
] as const;
export type AnalyticsTab = (typeof ANALYTICS_TABS)[number]["key"];

export type Measure = { label: string; value: number };

/** The grade picker every measure tab carries. */
export const GRADE_OPTIONS = [{ value: "all", label: "All grades" }, ...[9, 10, 11, 12].map((g) => ({ value: String(g), label: `Grade ${g}` }))];

// ---- Overview ---------------------------------------------------------------

// DEMO-ONLY: the Replit's four completion tiles; no plan, FAFSA, application
// or WBL completion source exists in the prototype roster.
export const OVERVIEW_TILES: Measure[] = [
  { label: "Postsecondary plan complete", value: 72 },
  { label: "FAFSA complete", value: 64 },
  { label: "Applications submitted", value: 78 },
  { label: "Completed WBL", value: 41 },
];

// DEMO-ONLY: the Replit's Readiness snapshot (student milestones).
export const READINESS_SNAPSHOT: Measure[] = [
  { label: "GPA", value: 74 },
  { label: "Grad req.", value: 81 },
  { label: "Academic plan", value: 68 },
  { label: "FAFSA", value: 64 },
  { label: "Apps", value: 78 },
  { label: "WBL", value: 41 },
  { label: "Career plan", value: 86 },
];

// ---- the numbered measure lists ---------------------------------------------

// DEMO-ONLY: the Replit's measure values for Readiness, Postsecondary,
// Career & WBL and Engagement, in its order and its 86 / 72 / 64 / 78 / 41 /
// 69 / 58 / 73 / 62 cycle.
export const MEASURES: Record<"readiness" | "postsecondary" | "career" | "engagement", Measure[]> = {
  readiness: [
    { label: "GPA & grades", value: 86 },
    { label: "Attendance", value: 72 },
    { label: "Graduation requirements", value: 64 },
    { label: "Academic plan completion", value: 78 },
    { label: "Course requirements", value: 41 },
    { label: "SAT / ACT", value: 69 },
    { label: "AP / IB", value: 58 },
    { label: "State assessments", value: 73 },
    { label: "Credit completion", value: 62 },
  ],
  postsecondary: [
    { label: "Postsecondary plan", value: 86 },
    { label: "College list", value: 72 },
    { label: "Applications started", value: 64 },
    { label: "Applications submitted", value: 78 },
    { label: "Common App", value: 41 },
    { label: "Transcript status", value: 69 },
    { label: "Recommendation letters", value: 58 },
    { label: "FAFSA", value: 73 },
    { label: "State financial aid", value: 62 },
    { label: "Scholarships", value: 86 },
    { label: "Acceptances", value: 72 },
    { label: "Final decision", value: 64 },
    { label: "Final transcript", value: 78 },
  ],
  career: [
    { label: "Work-based learning participation", value: 86 },
    { label: "WBL hours", value: 72 },
    { label: "Internships", value: 64 },
    { label: "Job shadows", value: 78 },
    { label: "Career events", value: 41 },
    { label: "Apprenticeships", value: 69 },
    { label: "Employer experiences", value: 58 },
    { label: "CTE completion", value: 73 },
    { label: "Industry certifications", value: 62 },
  ],
  engagement: [
    { label: "Careers explored", value: 86 },
    { label: "Careers saved", value: 72 },
    { label: "Top 3 completion", value: 64 },
    { label: "Schools explored", value: 78 },
    { label: "Schools saved", value: 41 },
    { label: "Career simulations played", value: 69 },
    { label: "Glossary games completed", value: 58 },
    { label: "Videos watched", value: 73 },
    { label: "Connect activity", value: 62 },
    { label: "Planner tasks completed", value: 86 },
    { label: "Resume completion", value: 72 },
    { label: "Sessions & return frequency", value: 64 },
  ],
};

// ---- postsecondary destinations (real reads) ---------------------------------

/** The Replit's seven destinations. Apprenticeship is not a plan a student
 *  can state in this prototype, so it reads "Not tracked" instead of 0. */
export const DESTINATIONS: { label: string; intent: PostsecondaryIntent | null }[] = [
  { label: "4-Year College", intent: "4-Year College" },
  { label: "2-Year College", intent: "2-Year College" },
  { label: "Trade / Technical School", intent: "Trade/Technical School" },
  { label: "Apprenticeship", intent: null },
  { label: "Military", intent: "Military" },
  { label: "Workforce", intent: "Workforce" },
  { label: "Undecided", intent: "Undecided" },
];

export function destinationCounts(roster: CounselorStudent[]): { label: string; value: number | null }[] {
  return DESTINATIONS.map((d) => ({ label: d.label, value: d.intent ? roster.filter((s) => s.postsecondaryIntent === d.intent).length : null }));
}

/** The Overview mix: the Replit's four slices, read from each student's
 *  stated plan (Workforce, Military and Undecided are "Other / exploring"). */
export function planMix(roster: CounselorStudent[]): { label: string; value: number }[] {
  const n = (p: (s: CounselorStudent) => boolean) => roster.filter(p).length;
  return [
    { label: "4-Year College", value: n((s) => s.postsecondaryIntent === "4-Year College") },
    { label: "2-Year College", value: n((s) => s.postsecondaryIntent === "2-Year College") },
    { label: "Trade / Technical", value: n((s) => s.postsecondaryIntent === "Trade/Technical School") },
    { label: "Other / exploring", value: n((s) => s.postsecondaryIntent === "Workforce" || s.postsecondaryIntent === "Military" || s.postsecondaryIntent === "Undecided") },
  ];
}

export const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

// ---- Risk (real reads) ----------------------------------------------------------

export const RISK_CATEGORIES = [
  { value: "all", label: "All risk categories" },
  { value: "academic", label: "Academic risk" },
  { value: "fafsa", label: "FAFSA incomplete" },
  { value: "overdue", label: "Milestones overdue" },
  { value: "engagement", label: "Low engagement" },
] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number]["value"];

const DONE = new Set(["Approved", "Completed", "Not Applicable"]);
const applies = (s: CounselorStudent, key: (typeof MILESTONE_KEYS)[number]) => milestonesForGrade(s.grade).includes(key);

/** Days since the student last opened the app, from the roster's own label. */
function daysInactive(s: CounselorStudent): number {
  const l = lastActiveLabel(s.lastActive);
  if (l === "Today") return 0;
  if (l === "Yesterday") return 1;
  const n = parseInt(l, 10);
  return Number.isFinite(n) ? n : 0;
}

export const RISK_TEST: Record<RiskCategory, (s: CounselorStudent) => boolean> = {
  all: (s) => s.status !== "On Track",
  academic: (s) => s.status === "At Risk",
  fafsa: (s) => applies(s, "Financial Aid") && !DONE.has(s.milestones["Financial Aid"]),
  overdue: (s) => MILESTONE_KEYS.some((k) => s.milestones[k] === "Overdue"),
  engagement: (s) => daysInactive(s) >= 7,
};

export type RiskTile = { label: string; value: number; /** true when the figure is a demo seed, not a roster read */ demo?: boolean };

/** The eight count tiles under the Risk list. Six are read from the roster;
 *  graduation requirements and attendance have no source here. */
export function riskTiles(roster: CounselorStudent[]): RiskTile[] {
  const n = (p: (s: CounselorStudent) => boolean) => roster.filter(p).length;
  return [
    { label: "Academic risk", value: n(RISK_TEST.academic) },
    // DEMO-ONLY: the Replit's count; no graduation requirement source in the prototype
    { label: "Missing graduation requirements", value: 4, demo: true },
    { label: "No postsecondary plan", value: n((s) => s.postsecondaryIntent === "Undecided") },
    { label: "FAFSA incomplete", value: n(RISK_TEST.fafsa) },
    { label: "No applications", value: n((s) => applies(s, "Applications") && s.milestones.Applications === "Not Started") },
    { label: "Milestones overdue", value: n(RISK_TEST.overdue) },
    { label: "Low engagement", value: n(RISK_TEST.engagement) },
    // DEMO-ONLY: the Replit's count; no attendance source in the prototype
    { label: "Attendance concern", value: 6, demo: true },
  ];
}

// ---- Outcomes ----------------------------------------------------------------------

// DEMO-ONLY: the Replit's Outcomes filters; none of them changes the demo values.
export const OUTCOME_FILTERS: { key: string; label: string; options: { value: string; label: string }[] }[] = [
  { key: "year", label: "School year", options: [{ value: "2024-25", label: "School year · 2024–25" }, { value: "2023-24", label: "School year · 2023–24" }] },
  { key: "grade", label: "Grade", options: [{ value: "all", label: "All grades" }, { value: "12", label: "Grade 12" }] },
  { key: "counselor", label: "Counselor", options: [{ value: "all", label: "All counselors" }, { value: "sarah", label: "Sarah Mitchell" }] },
  { key: "school", label: "School", options: [{ value: "all", label: "All schools" }, { value: "northview", label: "Northview High" }] },
];

// DEMO-ONLY: the Replit's cohort outcomes (student destinations).
export const COHORT_OUTCOMES: Measure[] = [
  { label: "Graduated", value: 91 },
  { label: "College", value: 64 },
  { label: "Trade", value: 13 },
  { label: "Apprentice", value: 8 },
  { label: "Workforce", value: 11 },
  { label: "Military", value: 4 },
];
