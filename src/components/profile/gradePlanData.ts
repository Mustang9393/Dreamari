// The grade-by-grade "My Plan" -- separate from the career-route plan
// (PlanTab, Level 1/2/3 horizons keyed to a CHOSEN career). This one tracks
// the general high-school journey a counselor cares about regardless of
// career: course planning, applications, financial aid. Structure and step
// copy are from "Dreamari - My Plan, Grade by Grade" (product spec, 17 Sept
// 2026, provided for engineering implementation) -- windows and step
// titles are the spec's own, not invented here, trimmed to just the title
// per direct feedback ("remove all redundant long descriptions to
// titles... shorten everything"). The spec's full milestone-status/flag/
// counselor-verification state machine (Pending Verification, carry-over,
// Urgent escalation, the counselor-facing Milestone Tracker) is real
// backend work for the production app, out of scope here -- what's built
// is the student-facing shape: pick a grade, see the three terms, check
// off steps.

export type GradeStepLabel = "BUILD" | "EXPLORE" | "PLAY" | "CONNECT" | "DECIDE" | "PLAN" | "REVIEW" | "APPLY" | "FUND" | "TRACK" | "RESULT";

export type GradeStep = { id: string; label: GradeStepLabel; inApp: boolean; title: string; deadlineBound?: boolean };

export type GradeWindow = { id: "fall" | "winter" | "spring"; title: string; steps: GradeStep[] };

export type GradePlan = { grade: 9 | 10 | 11 | 12; title: string; tagline: string; windows: GradeWindow[] };

function step(id: string, label: GradeStepLabel, inApp: boolean, title: string, deadlineBound?: boolean): GradeStep {
  return { id, label, inApp, title, deadlineBound };
}

export const GRADE_PLANS: GradePlan[] = [
  {
    grade: 9,
    title: "Foundation",
    tagline: "Explore widely and get the four-year course plan on paper.",
    windows: [
      {
        id: "fall",
        title: "Fall",
        steps: [step("g9-fall-build", "BUILD", true, "Build your Profile"), step("g9-fall-explore", "EXPLORE", true, "Explore 10 careers, save your Top 3")],
      },
      {
        id: "winter",
        title: "Winter",
        steps: [
          step("g9-winter-play", "PLAY", true, "Play 3 Career Simulations"),
          step("g9-winter-plan1", "PLAN", false, "Four-Year Academic Plan"),
          step("g9-winter-plan2", "PLAN", false, "Next-Year Course Plan", true),
        ],
      },
      { id: "spring", title: "Spring", steps: [step("g9-spring-connect", "CONNECT", true, "Ask 2 professionals a career question")] },
    ],
  },
  {
    grade: 10,
    title: "Skills and People",
    tagline: "Narrow to one career, build skills, write a first resume.",
    windows: [
      {
        id: "fall",
        title: "Fall",
        steps: [step("g10-fall-decide", "DECIDE", true, "Choose your #1 career from your Top 3"), step("g10-fall-play", "PLAY", true, "Complete 3 Skill Games")],
      },
      {
        id: "winter",
        title: "Winter",
        steps: [step("g10-winter-plan", "PLAN", false, "Next-Year Course Plan", true), step("g10-winter-review", "REVIEW", false, "Update Four-Year Academic Plan")],
      },
      {
        id: "spring",
        title: "Spring",
        steps: [
          step("g10-spring-build", "BUILD", true, "Draft your Resume"),
          step("g10-spring-connect", "CONNECT", true, "Ask 3 professionals about starting out"),
          step("g10-spring-experience", "PLAN", false, "Secure or plan a summer experience"),
        ],
      },
    ],
  },
  {
    grade: 11,
    title: "Professional Readiness",
    tagline: "Get application-ready. This is the year that decides whether senior fall is calm or chaotic.",
    windows: [
      {
        id: "fall",
        title: "Fall",
        steps: [
          step("g11-fall-play", "PLAY", true, "Complete 3 Glossary Games"),
          step("g11-fall-explore", "EXPLORE", true, "Build your Postsecondary List"),
          step("g11-fall-review", "REVIEW", false, "Graduation Progress Review"),
        ],
      },
      {
        id: "winter",
        title: "Winter",
        steps: [
          step("g11-winter-build", "BUILD", true, "Application-Ready Resume"),
          step("g11-winter-plan", "PLAN", false, "Grade 12 Course Plan", true),
          step("g11-winter-apply", "APPLY", false, "Apply to 5 internships or programs"),
        ],
      },
      {
        id: "spring",
        title: "Spring",
        steps: [
          step("g11-spring-connect", "CONNECT", true, "Ask 3 professionals for advice"),
          step("g11-spring-plan", "PLAN", false, "Application & Deadline Plan", true),
          step("g11-spring-fund", "FUND", false, "Financial Aid & Affordability Prep", true),
        ],
      },
    ],
  },
  {
    grade: 12,
    title: "Finish and Transition",
    tagline: "Submit everything, decide, and plan the handoff.",
    windows: [
      {
        id: "fall",
        title: "Fall",
        steps: [
          step("g12-fall-build", "BUILD", true, "Final Resume"),
          step("g12-fall-review", "REVIEW", false, "Graduation Status"),
          step("g12-fall-track1", "TRACK", false, "Recommendation Status", true),
          step("g12-fall-track2", "TRACK", false, "Transcript & Document Status", true),
          step("g12-fall-track3", "TRACK", false, "Application Progress", true),
        ],
      },
      { id: "winter", title: "Winter", steps: [step("g12-winter-fund", "FUND", false, "Financial Aid & FAFSA Status", true)] },
      {
        id: "spring",
        title: "Spring",
        steps: [step("g12-spring-result", "RESULT", false, "Application & Admission Results"), step("g12-spring-decide", "DECIDE", true, "Postsecondary Decision & Transition Plan")],
      },
    ],
  },
];

export function gradePlan(grade: 9 | 10 | 11 | 12): GradePlan {
  return GRADE_PLANS.find((g) => g.grade === grade) ?? GRADE_PLANS[0];
}
