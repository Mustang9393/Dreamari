import {
  FUTURE_VALUES_GRADIENT,
  MATCH_CATEGORY_COLORS as GENERATED_MATCH_CATEGORY_COLORS,
  STEP_AURORA_ACCENTS as GENERATED_STEP_AURORA_ACCENTS,
} from "@/generated/design-tokens";

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
export const STEP_AURORA_ACCENTS: string[] = [...GENERATED_STEP_AURORA_ACCENTS];

// The Match Experience's own 5 category colors (matchData.ts MATCH_CARD_META / globals.css
// --color-category-*). Confetti needs resolved colors rather than CSS custom-property
// strings, so this array is generated from the same DTCG aliases as the CSS variables.
export const MATCH_CATEGORY_COLORS: string[] = [...GENERATED_MATCH_CATEGORY_COLORS];

type StepGradient = { from: string; to: string };

// Explicit CTA-button/progress-fill gradient stops for steps where the Figma source uses
// specific colors that don't match the generic "accent → darkened accent" derivation
// every other step uses. Keyed by step number (1-based). Matched exactly to Figma node
// 588:35961 (Academic Journey / "Build" chapter, amber) — its eyebrow/text color already
// equals STEP_AURORA_ACCENTS' own amber (#d97706), but its button and progress-bar
// gradients use their own distinct, slightly brighter stops.
export const STEP_GRADIENT_OVERRIDES: Partial<Record<number, { button: StepGradient; progress: StepGradient }>> = {
  8: {
    ...FUTURE_VALUES_GRADIENT,
  },
};

export type FlowState = {
  path: "High School" | "University" | "Job Seeker";
  fullName: string;
  schoolWorkplace: string;
  gradeLevel: string;
  gpaRange: string;
  subjects: string[];
  // Which of the currently-selected `subjects` the user also flagged as coming easily to
  // them — a second, optional follow-up question that only appears once `subjects` is
  // non-empty (see AcademicJourneyStep), not a fixed/independent list of its own.
  easySubjects: string[];
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
  easySubjects: [],
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
