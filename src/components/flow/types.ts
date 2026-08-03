export const TOTAL_STEPS = 12;

// One ambient mood per screen (background only — cards/buttons stay on the
// single amber accent). Reassigned from the original Figma set, all still
// existing colors from this same 7-color palette (nothing invented): the two
// gif steps get the closest match to their gif (red for Ronaldo, amber — the
// closest thing to yellow already in the palette — for SpongeBob). Welcome
// and Congratulations are pinned to blue as deliberate start/end bookends;
// everything else is spread across the remaining colors so the back half of
// the flow doesn't read as one repeated blue block anymore. Spend Your Days
// (step 6, inserted after Confidence Check to match the reference app, which
// has this step and we previously didn't) reuses Academic Journey's teal —
// both are "interest exploration" steps and aren't adjacent in the sequence.
export const STEP_AURORA_ACCENTS: string[] = [
  "#1f5ff0", // 1 Welcome — blue bookend
  "#10b981", // 2 Choose Path
  "#ea580c", // 3 About You
  "#0f766e", // 4 Academic Journey
  "#dc2626", // 5 Confidence Check — red, matches its Ronaldo gif
  "#0f766e", // 6 Spend Your Days — teal, reused from Academic Journey
  "#0d9488", // 7 Work Style
  "#d97706", // 8 Future Values — amber, closest to yellow, matches its SpongeBob gif
  "#ea580c", // 9 Path Forward
  "#10b981", // 10 Financial
  "#0d9488", // 11 Location
  "#1f5ff0", // 12 Congratulations — blue bookend
];

// The Match Experience's own 5 category colors (matchData.ts MATCH_CARD_META / globals.css
// --color-category-*), duplicated here as literal hex rather than a var() reference —
// Confetti needs real hex to build particle colors, not a CSS custom property string.
export const MATCH_CATEGORY_COLORS = ["#ea4459", "#1f5ff0", "#d97706", "#9a39fb", "#01be58"];

type StepGradient = { from: string; to: string };

// Explicit CTA-button/progress-fill gradient stops for steps where the Figma source uses
// specific colors that don't match the generic "accent → darkened accent" derivation
// every other step uses. Keyed by step number (1-based). Matched exactly to Figma node
// 588:35961 (Academic Journey / "Build" chapter, amber) — its eyebrow/text color already
// equals STEP_AURORA_ACCENTS' own amber (#d97706), but its button and progress-bar
// gradients use their own distinct, slightly brighter stops.
export const STEP_GRADIENT_OVERRIDES: Partial<Record<number, { button: StepGradient; progress: StepGradient }>> = {
  8: {
    // from/to here match globals.css --color-gold-400/--color-orange-500/--color-amber-400
    // exactly; referenced via var() rather than repeating the same hex a second time.
    // progress.to (#f37a10) has no other use in the app, so it's kept as a literal rather
    // than inventing a single-use primitive for it.
    button: { from: "var(--color-gold-400)", to: "var(--color-orange-500)" },
    progress: { from: "var(--color-amber-400)", to: "#f37a10" },
  },
};

export type FlowState = {
  path: "High School" | "University" | "Job Seeker";
  fullName: string;
  schoolWorkplace: string;
  gradeLevel: string;
  gpaRange: string;
  subjects: string[];
  strengths: string[];
  activities: string[];
  energy: string;
  teamStyle: string;
  interaction: string;
  values: string[];
  pathForward: number;
  financial: number;
  location: number;
};

export const INITIAL_FLOW_STATE: FlowState = {
  path: "High School",
  fullName: "Alex Rivera",
  schoolWorkplace: "Lincoln High School",
  gradeLevel: "11th Grade",
  gpaRange: "3.8 - 4.0",
  subjects: ["Computer Science", "Science", "Business"],
  strengths: ["Problem Solving", "Creativity", "Teamwork"],
  activities: ["Build things", "Be creative", "Lead others"],
  energy: "Balanced",
  teamStyle: "Small team",
  interaction: "Some talking",
  values: ["Income", "Impact", "Creativity"],
  pathForward: 1,
  financial: 0,
  location: 0,
};
