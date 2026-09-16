// The grade-by-grade "My Plan" -- separate from the career-route plan
// (PlanTab, Level 1/2/3 horizons keyed to a CHOSEN career). This one tracks
// the general high-school journey a counselor cares about regardless of
// career: course planning, applications, financial aid. Windows and step
// titles are from "Dreamari - My Plan, Grade by Grade" (product spec, 17
// Sept 2026, provided for engineering implementation), trimmed to a title
// only -- the spec's own full paragraphs were cut per direct feedback
// ("remove all redundant long descriptions to titles... shorten
// everything"), and a later one-line `hint` field (added when a title
// alone read as too basic) was cut again once the CTA itself ("Go to
// Play", etc.) turned out to be the part that actually told a student what
// to do ("the ctas should be enough"). `href` sends an IN APP step to the
// real feature that completes it; OUT OF APP steps have none, since
// there's nowhere in the app for them to go.
//
// The spec's full milestone-status/flag/carry-over/counselor-verification
// state machine (Pending Verification, Urgent escalation, the
// counselor-facing Milestone Tracker) is real backend work for the
// production app, out of scope here. Per the spec's own "How milestones
// update" section, IN APP steps are meant to auto-complete when the
// student actually does the real action elsewhere in the app (no manual
// checkbox), while OUT OF APP steps get one of three verification modes
// (student-checkable / student-submitted+counselor-verified /
// counselor-only). This prototype has no counselor account or dashboard to
// verify anything against, so `counselorVerified` steps below don't get a
// working checkbox at all -- direct feedback, 16 Sept 2026: "only some are
// student checkable right? counsellor etc checks happen on their own
// dashboards" -- rather than fake a checkmark this app can't actually
// confirm. Everything else (every IN APP step, plus OUT OF APP steps that
// are genuinely self-reported, like tracking your own applications) stays
// student-checkable.

export type GradeStepLabel = "BUILD" | "EXPLORE" | "PLAY" | "CONNECT" | "DECIDE" | "PLAN" | "REVIEW" | "APPLY" | "FUND" | "TRACK" | "RESULT";

export type GradeStep = { id: string; label: GradeStepLabel; inApp: boolean; title: string; href?: string; deadlineBound?: boolean; optional?: boolean; counselorVerified?: boolean; counselorNote?: string };

export type GradeWindow = { id: "fall" | "winter" | "spring"; title: string; steps: GradeStep[] };

export type GradePlan = { grade: 9 | 10 | 11 | 12; title: string; tagline: string; windows: GradeWindow[] };

function step(id: string, label: GradeStepLabel, inApp: boolean, title: string, opts?: { href?: string; deadlineBound?: boolean; optional?: boolean; counselorVerified?: boolean; counselorNote?: string }): GradeStep {
  return { id, label, inApp, title, href: opts?.href, deadlineBound: opts?.deadlineBound, optional: opts?.optional, counselorVerified: opts?.counselorVerified, counselorNote: opts?.counselorNote };
}

const BUILD_PROFILE = "/flow";
const BUILD_RESUME = "/resume-builder";
const EXPLORE_CAREERS = "/explore?tab=browse";
const POSTSECONDARY_LIST = "/colleges";
const PLAY = "/play";
const CONNECT = "/connect";
const CHOOSE_TOP1 = "/profile?tab=top3";

export const GRADE_PLANS: GradePlan[] = [
  {
    grade: 9,
    title: "Foundation",
    tagline: "Explore widely and get the four-year course plan on paper.",
    windows: [
      {
        id: "fall",
        title: "Fall",
        steps: [
          step("g9-fall-build", "BUILD", true, "Build your Profile", { href: BUILD_PROFILE }),
          step("g9-fall-avatar", "BUILD", true, "Add an avatar and cover", { href: BUILD_PROFILE, optional: true }),
          step("g9-fall-explore", "EXPLORE", true, "Explore 10 careers, save your Top 3", { href: EXPLORE_CAREERS }),
        ],
      },
      {
        id: "winter",
        title: "Winter",
        steps: [
          step("g9-winter-play", "PLAY", true, "Play 3 Career Simulations", { href: PLAY }),
          step("g9-winter-plan1", "PLAN", false, "Four-Year Academic Plan", { counselorVerified: true, counselorNote: "Ask your counselor to map out your Grade 9-12 courses together." }),
          step("g9-winter-plan2", "PLAN", false, "Next-Year Course Plan", { deadlineBound: true, counselorVerified: true, counselorNote: "Meet with your counselor before registration closes to pick next year's courses." }),
        ],
      },
      {
        id: "spring",
        title: "Spring",
        steps: [step("g9-spring-connect", "CONNECT", true, "Ask 2 professionals a career question", { href: CONNECT })],
      },
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
        steps: [
          step("g10-fall-decide", "DECIDE", true, "Choose your #1 career from your Top 3", { href: CHOOSE_TOP1 }),
          step("g10-fall-play", "PLAY", true, "Complete 3 Skill Games", { href: PLAY }),
        ],
      },
      {
        id: "winter",
        title: "Winter",
        steps: [
          step("g10-winter-plan", "PLAN", false, "Next-Year Course Plan", { deadlineBound: true, counselorVerified: true, counselorNote: "Meet with your counselor to pick your Grade 11 courses." }),
          step("g10-winter-review", "REVIEW", false, "Update Four-Year Academic Plan", { counselorVerified: true, counselorNote: "Revisit your 4-year plan with your counselor." }),
        ],
      },
      {
        id: "spring",
        title: "Spring",
        steps: [
          step("g10-spring-build", "BUILD", true, "Draft your Resume", { href: BUILD_RESUME }),
          step("g10-spring-connect", "CONNECT", true, "Ask 3 professionals about starting out", { href: CONNECT }),
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
          step("g11-fall-play", "PLAY", true, "Complete 3 Glossary Games", { href: PLAY }),
          step("g11-fall-explore", "EXPLORE", true, "Build your Postsecondary List", { href: POSTSECONDARY_LIST }),
          step("g11-fall-review", "REVIEW", false, "Graduation Progress Review", { counselorVerified: true, counselorNote: "Ask your counselor to confirm your credits are on track." }),
        ],
      },
      {
        id: "winter",
        title: "Winter",
        steps: [
          step("g11-winter-build", "BUILD", true, "Application-Ready Resume", { href: BUILD_RESUME }),
          step("g11-winter-plan", "PLAN", false, "Grade 12 Course Plan", { deadlineBound: true, counselorVerified: true, counselorNote: "Meet with your counselor to pick your senior-year courses." }),
          step("g11-winter-apply", "APPLY", false, "Apply to 5 internships or programs"),
        ],
      },
      {
        id: "spring",
        title: "Spring",
        steps: [
          step("g11-spring-connect", "CONNECT", true, "Ask 3 professionals for advice", { href: CONNECT }),
          step("g11-spring-plan", "PLAN", false, "Application & Deadline Plan", { deadlineBound: true, counselorVerified: true, counselorNote: "Build a timeline for every application deadline with your counselor." }),
          step("g11-spring-fund", "FUND", false, "Financial Aid & Affordability Prep", { deadlineBound: true }),
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
          step("g12-fall-build", "BUILD", true, "Final Resume", { href: BUILD_RESUME }),
          step("g12-fall-review", "REVIEW", false, "Graduation Status", { counselorVerified: true, counselorNote: "Ask your counselor to confirm you're meeting graduation requirements." }),
          step("g12-fall-track1", "TRACK", false, "Recommendation Status", { deadlineBound: true, counselorVerified: true, counselorNote: "Ask your counselor or teachers to confirm your recommendation letters were sent." }),
          step("g12-fall-track2", "TRACK", false, "Transcript & Document Status", { deadlineBound: true, counselorVerified: true, counselorNote: "Ask your counselor to confirm your transcripts and forms were sent." }),
          step("g12-fall-track3", "TRACK", false, "Application Progress", { deadlineBound: true }),
        ],
      },
      {
        id: "winter",
        title: "Winter",
        steps: [step("g12-winter-fund", "FUND", false, "Financial Aid & FAFSA Status", { deadlineBound: true })],
      },
      {
        id: "spring",
        title: "Spring",
        steps: [
          step("g12-spring-result", "RESULT", false, "Application & Admission Results"),
          step("g12-spring-decide", "DECIDE", true, "Postsecondary Decision & Transition Plan"),
        ],
      },
    ],
  },
];

export function gradePlan(grade: 9 | 10 | 11 | 12): GradePlan {
  return GRADE_PLANS.find((g) => g.grade === grade) ?? GRADE_PLANS[0];
}
