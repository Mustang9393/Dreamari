export const TOTAL_STEPS = 11;

// One ambient mood per screen (background only — cards/buttons stay on the
// single amber accent). Reassigned from the original Figma set, all still
// existing colors from this same 7-color palette (nothing invented): the two
// gif steps get the closest match to their gif (red for Ronaldo, amber — the
// closest thing to yellow already in the palette — for SpongeBob). Welcome
// and Congratulations are pinned to blue as deliberate start/end bookends;
// everything else is spread across the remaining colors so the back half of
// the flow doesn't read as one repeated blue block anymore.
export const STEP_AURORA_ACCENTS: string[] = [
  "#1f5ff0", // 1 Welcome — blue bookend
  "#10b981", // 2 Choose Path
  "#ea580c", // 3 About You
  "#0f766e", // 4 Academic Journey
  "#dc2626", // 5 Confidence Check — red, matches its Ronaldo gif
  "#0d9488", // 6 Work Style
  "#d97706", // 7 Future Values — amber, closest to yellow, matches its SpongeBob gif
  "#ea580c", // 8 Path Forward
  "#10b981", // 9 Financial
  "#0d9488", // 10 Location
  "#1f5ff0", // 11 Congratulations — blue bookend
];

type StepGradient = { from: string; to: string };

// Explicit CTA-button/progress-fill gradient stops for steps where the Figma source uses
// specific colors that don't match the generic "accent → darkened accent" derivation
// every other step uses. Keyed by step number (1-based). Matched exactly to Figma node
// 588:35961 (Academic Journey / "Build" chapter, amber) — its eyebrow/text color already
// equals STEP_AURORA_ACCENTS' own amber (#d97706), but its button and progress-bar
// gradients use their own distinct, slightly brighter stops.
export const STEP_GRADIENT_OVERRIDES: Partial<Record<number, { button: StepGradient; progress: StepGradient }>> = {
  7: {
    button: { from: "#ffcf04", to: "#f37c11" },
    progress: { from: "#fbbf24", to: "#f37a10" },
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
  energy: "Flexible",
  teamStyle: "Small team",
  interaction: "Hybrid",
  values: ["Income", "Impact", "Creativity"],
  pathForward: 1,
  financial: 0,
  location: 0,
};
