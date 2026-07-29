export const TOTAL_STEPS = 11;

// One ambient mood per screen (background only — cards/buttons stay on the
// single amber accent). Matches each step's own accent in the source Figma
// frames: Welcome/Path Forward/Financial/Location/Congratulations share blue,
// the rest each get their own hue.
export const STEP_AURORA_ACCENTS: string[] = [
  "#1f5ff0", // 1 Welcome
  "#dc2626", // 2 Choose Path
  "#ea580c", // 3 About You
  "#d97706", // 4 Academic Journey
  "#10b981", // 5 Confidence Check
  "#0d9488", // 6 Work Style
  "#0f766e", // 7 Future Values
  "#1f5ff0", // 8 Path Forward
  "#1f5ff0", // 9 Financial
  "#1f5ff0", // 10 Location
  "#1f5ff0", // 11 Congratulations
];

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
  gpaRange: "3.5 - 4.0 (A- / A)",
  subjects: ["Technology", "Science", "Business"],
  strengths: ["Problem Solving", "Creativity", "Teamwork"],
  energy: "Flexible",
  teamStyle: "Small team",
  interaction: "Hybrid",
  values: ["Income", "Impact", "Creativity"],
  pathForward: 1,
  financial: 0,
  location: 0,
};
