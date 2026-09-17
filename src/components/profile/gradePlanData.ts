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

export type GradeStepLabel = "BUILD" | "EXPLORE" | "PLAY" | "CONNECT" | "DECIDE" | "PLAN" | "REVIEW" | "APPLY" | "FUND" | "TRACK" | "RESULT" | "MENTOR" | "VOLUNTEER" | "JOIN" | "STUDY" | "LEARN" | "SKILL" | "EXPERIENCE" | "LEAD" | "PREPARE" | "TRANSITION" | "GIVE BACK";

export type GradeStep = { id: string; label: GradeStepLabel; inApp: boolean; title: string; href?: string; deadlineBound?: boolean; optional?: boolean; counselorVerified?: boolean; counselorNote?: string };

export type GradeWindow = { id: "fall" | "winter" | "spring"; title: string; steps: GradeStep[] };

export type PlanStage = "hs" | "college";
export type GradePlan = { grade: 9 | 10 | 11 | 12; title: string; tagline: string; windows: GradeWindow[] };
export type CollegeYear = 1 | 2 | 3 | 4;
export type CollegePlan = { year: CollegeYear; title: string; windows: GradeWindow[] };

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

// ---------------------------------------------------------------------------
// College, Year 1 to 4. Copy verbatim from Joshua Pierce (Slack, 18 Sept
// 2026: "expand it so students can continue using it through college"),
// same Fall / Winter / Spring windows and IN APP / OUT OF APP split as high
// school. Nothing here is counselor-verified or deadline-bound; a college
// student checks their own steps.
//
// Product logic from the same message: the college plan should change with
// the student's primary career. The copy below is the Investment Banking
// version. `{career}` and `{field}` are swapped for the student's #1 career
// and its field at render time (collegePlan), so the headline steps read
// right for any career now. The finance-specific recommendations inside the
// OUT OF APP steps (Excel, PowerPoint, Bloomberg Terminal, financial
// modeling, valuation, the finance/accounting/economics course list, finance
// clubs) still need to be driven from the same skills / software / classes
// data Explore Careers already holds for each career. That is a data join
// for the production app, not prototype copy; flagged in AI_HANDOFF.

const c = (id: string, label: GradeStepLabel, inApp: boolean, title: string, href?: string): GradeStep => ({ id, label, inApp, title, href });
const GLOSSARY = "/play";
const CAREER_DETAIL = "/explore?tab=browse";
const MY_PLAN_REPORT = "/profile?tab=report";

export const COLLEGE_PLANS: CollegePlan[] = [
  {
    year: 1,
    title: "Explore + Build a Foundation",
    windows: [
      { id: "fall", title: "Fall", steps: [
        c("c1-fall-explore", "EXPLORE", true, "Learn the skills, software, classes, and education needed for {career}", CAREER_DETAIL),
        c("c1-fall-play", "PLAY", true, "Try the {career} Day-in-the-Life simulation", PLAY),
        c("c1-fall-build", "BUILD", true, "Create your college resume", BUILD_RESUME),
        c("c1-fall-connect", "CONNECT", true, "Follow {field} and {career} professionals", CONNECT),
        c("c1-fall-join", "JOIN", false, "Join {clubs}"),
        c("c1-fall-study", "STUDY", false, "Join or create a study group"),
        c("c1-fall-learn", "LEARN", false, "Focus on strong grades in relevant classes like {classes}"),
        c("c1-fall-volunteer", "VOLUNTEER", false, "Volunteer on campus or in your community"),
      ] },
      { id: "winter", title: "Winter", steps: [
        c("c1-winter-connect", "CONNECT", true, "Join {field} Community Boards", CONNECT),
        c("c1-winter-mentor", "MENTOR", true, "Connect with a professional mentor and meet at least once a month", CONNECT),
        c("c1-winter-play", "PLAY", true, "Start learning {field} vocabulary through Glossary Games", GLOSSARY),
        c("c1-winter-explore", "EXPLORE", true, "Review the skills needed for {career}", CAREER_DETAIL),
        c("c1-winter-skill", "SKILL", false, "Start learning {starterTools}"),
        c("c1-winter-connect2", "CONNECT", false, "Build a relationship with a professor, academic mentor, or advisor"),
        c("c1-winter-experience", "EXPERIENCE", false, "Get involved in a club, project, part-time job, research, or volunteer activity"),
      ] },
      { id: "spring", title: "Spring", steps: [
        c("c1-spring-build", "BUILD", true, "Add your first-year experiences to your resume", BUILD_RESUME),
        c("c1-spring-connect", "CONNECT", true, "Ask professionals how they got their first experience", CONNECT),
        c("c1-spring-play", "PLAY", true, "Complete another career simulation to confirm the career still interests you", PLAY),
        c("c1-spring-apply", "APPLY", false, "Apply for summer jobs, internships, {programs}, research, or volunteer opportunities"),
        c("c1-spring-plan", "PLAN", false, "Decide how you want to become more involved next year"),
      ] },
    ],
  },
  {
    year: 2,
    title: "Build Skills + Step Up",
    windows: [
      { id: "fall", title: "Fall", steps: [
        c("c2-fall-explore", "EXPLORE", true, "Review the software, skills, and classes needed for your target career", CAREER_DETAIL),
        c("c2-fall-build", "BUILD", true, "Update your resume", BUILD_RESUME),
        c("c2-fall-mentor", "MENTOR", true, "Continue meeting with your mentor monthly", CONNECT),
        c("c2-fall-volunteer", "VOLUNTEER", true, "Join a Dreamari student group or mentor high school students interested in college", CONNECT),
        c("c2-fall-lead", "LEAD", false, "Apply for an E-board or club leadership position"),
        c("c2-fall-skill", "SKILL", false, "Build stronger {coreSkills}"),
        c("c2-fall-study", "STUDY", false, "Join study groups for important classes"),
        c("c2-fall-learn", "LEARN", false, "Take relevant {courses}"),
      ] },
      { id: "winter", title: "Winter", steps: [
        c("c2-winter-connect", "CONNECT", true, "Follow and engage with professionals in your target career", CONNECT),
        c("c2-winter-play", "PLAY", true, "Complete {career} simulations", PLAY),
        c("c2-winter-play2", "PLAY", true, "Build industry vocabulary through Glossary Games", GLOSSARY),
        c("c2-winter-skill", "SKILL", false, "Learn {advancedTools} if available through your school"),
        c("c2-winter-connect2", "CONNECT", false, "Meet with professors, alumni, your academic advisor, or career center"),
        c("c2-winter-prepare", "PREPARE", false, "Research internships and other career-building opportunities"),
      ] },
      { id: "spring", title: "Spring", steps: [
        c("c2-spring-build", "BUILD", true, "Make your resume internship-ready", BUILD_RESUME),
        c("c2-spring-connect", "CONNECT", true, "Ask your mentor and professionals for application advice", CONNECT),
        c("c2-spring-play", "PLAY", true, "Review industry vocabulary before interviews", GLOSSARY),
        c("c2-spring-apply", "APPLY", false, "Apply for internships, {programs}, research, jobs, or other opportunities"),
        c("c2-spring-lead", "LEAD", false, "Secure a club or campus leadership role for next year"),
      ] },
    ],
  },
  {
    year: 3,
    title: "Lead + Gain Serious Experience",
    windows: [
      { id: "fall", title: "Fall", steps: [
        c("c3-fall-build", "BUILD", true, "Make your resume recruiting-ready", BUILD_RESUME),
        c("c3-fall-connect", "CONNECT", true, "Grow your {career} network", CONNECT),
        c("c3-fall-mentor", "MENTOR", true, "Continue meeting with your mentor monthly", CONNECT),
        c("c3-fall-play", "PLAY", true, "Complete a Day-in-the-Life simulation before {y3Recruiting}", PLAY),
        c("c3-fall-lead", "LEAD", false, "Hold a meaningful club or E-board leadership role"),
        c("c3-fall-skill", "SKILL", false, "Strengthen {skillStack}"),
        c("c3-fall-connect2", "CONNECT", false, "Attend career fairs, employer events, and alumni events"),
      ] },
      { id: "winter", title: "Winter", steps: [
        c("c3-winter-play", "PLAY", true, "Practice career simulations before interviews", PLAY),
        c("c3-winter-play2", "PLAY", true, "Use Glossary Games to learn the vocabulary of the industry you're interviewing for", GLOSSARY),
        c("c3-winter-connect", "CONNECT", true, "Learn from professionals at {employers}", CONNECT),
        c("c3-winter-volunteer", "VOLUNTEER", true, "Mentor high school students through Dreamari", CONNECT),
        c("c3-winter-apply", "APPLY", false, "Apply for internships, research, fellowships, or career-related opportunities"),
        c("c3-winter-build", "BUILD", false, "Complete {workProducts} you can show employers"),
        c("c3-winter-study", "STUDY", false, "Maintain strong performance in career-relevant classes"),
      ] },
      { id: "spring", title: "Spring", steps: [
        c("c3-spring-explore", "EXPLORE", true, "Confirm {career} is still your strongest career direction", CAREER_DETAIL),
        c("c3-spring-build", "BUILD", true, "Add new experience, skills, and leadership to your resume", BUILD_RESUME),
        c("c3-spring-connect", "CONNECT", true, "Ask your mentor how to prepare for your internship", CONNECT),
        c("c3-spring-experience", "EXPERIENCE", false, "Complete {majorExperience}"),
        c("c3-spring-lead", "LEAD", false, "Help younger students get involved in your club or organization"),
      ] },
    ],
  },
  {
    year: 4,
    title: "Launch + Give Back",
    windows: [
      { id: "fall", title: "Fall", steps: [
        c("c4-fall-build", "BUILD", true, "Complete your job-ready resume", BUILD_RESUME),
        c("c4-fall-connect", "CONNECT", true, "Engage with mentors and professionals in your target career", CONNECT),
        c("c4-fall-play", "PLAY", true, "Refresh your career simulation before {y4Recruiting}", PLAY),
        c("c4-fall-explore", "EXPLORE", true, "Explore {gradPrograms} if they are part of your plan", POSTSECONDARY_LIST),
        c("c4-fall-apply", "APPLY", false, "Begin applying for {nextSteps}"),
        c("c4-fall-lead", "LEAD", false, "Continue your leadership role and prepare someone else to take over"),
        c("c4-fall-connect2", "CONNECT", false, "Ask professors, mentors, and alumni for guidance and references"),
      ] },
      { id: "winter", title: "Winter", steps: [
        c("c4-winter-play", "PLAY", true, "Practice career simulations before interviews", PLAY),
        c("c4-winter-play2", "PLAY", true, "Review industry vocabulary through Glossary Games", GLOSSARY),
        c("c4-winter-mentor", "MENTOR", true, "Meet with your mentor for job-search guidance", CONNECT),
        c("c4-winter-volunteer", "VOLUNTEER", true, "Mentor younger college or high school students through Dreamari", CONNECT),
        c("c4-winter-apply", "APPLY", false, "Continue applications and interviews"),
        c("c4-winter-skill", "SKILL", false, "Close any remaining skill or software gaps for your target role"),
        c("c4-winter-connect", "CONNECT", false, "Stay active with alumni, professors, employers, and professional organizations"),
      ] },
      { id: "spring", title: "Spring", steps: [
        c("c4-spring-plan", "PLAN", true, "Confirm your post-college career or education plan", MY_PLAN_REPORT),
        c("c4-spring-connect", "CONNECT", true, "Identify the mentors and professional relationships you want to maintain", CONNECT),
        c("c4-spring-build", "BUILD", true, "Complete your final resume", BUILD_RESUME),
        c("c4-spring-decide", "DECIDE", false, "Compare job, graduate-school, or other opportunities"),
        c("c4-spring-transition", "TRANSITION", false, "Prepare for your first full-time role or next education step"),
        c("c4-spring-giveback", "GIVE BACK", false, "Mentor younger students and hand off your campus leadership responsibilities"),
      ] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Per-career recipes for the college plan. Joshua's product logic (Slack,
// 18 Sept 2026): "the College plan should eventually change based on the
// student's primary career... for another career, those recommendations
// should change based on the information we already have in Explore
// Careers." Every finance-specific phrase in the Investment Banking copy
// above is a slot; each recipe fills the same slots for one career, in the
// same grammar, so the sentences stay Joshua's and only the specifics move.
// Grounded in the career's own Career Report (majors, skills, routes,
// employers) in report-data.ts; the IB recipe is Joshua's original wording.
// In the production app these slots are the join onto the Explore Careers
// data itself; here they are a mock of that join for the ten careers a
// student can hold as #1.

export type CollegeRecipe = {
  /** the field word: "Finance", "Tech", "Aviation" */
  field: string;
  /** "a finance, investing, business, or related club" */
  clubs: string;
  /** "math, economics, accounting, and statistics" */
  classes: string;
  /** "Excel and PowerPoint" */
  starterTools: string;
  /** "finance programs" (inside "internships, {programs}, research") */
  programs: string;
  /** "Excel and financial modeling skills" */
  coreSkills: string;
  /** "finance, accounting, economics, math, or statistics courses" */
  courses: string;
  /** "tools like Bloomberg Terminal" */
  advancedTools: string;
  /** "internship recruiting" (Year 3 fall) */
  y3Recruiting: string;
  /** "financial modeling, valuation, Excel, Bloomberg, and presentation skills" */
  skillStack: string;
  /** "banks and finance companies" */
  employers: string;
  /** "finance projects, investment pitches, research, or other work" */
  workProducts: string;
  /** "a major internship, finance project, research experience, or other career-building opportunity" */
  majorExperience: string;
  /** "recruiting" (Year 4 fall) */
  y4Recruiting: string;
  /** "MBA, master's, or other graduate programs" */
  gradPrograms: string;
  /** "full-time roles, graduate programs, fellowships, or other next steps" */
  nextSteps: string;
};

const IB_RECIPE: CollegeRecipe = {
  field: "Finance",
  clubs: "a finance, investing, business, or related club",
  classes: "math, economics, accounting, and statistics",
  starterTools: "Excel and PowerPoint",
  programs: "finance programs",
  coreSkills: "Excel and financial modeling skills",
  courses: "finance, accounting, economics, math, or statistics courses",
  advancedTools: "tools like Bloomberg Terminal",
  y3Recruiting: "internship recruiting",
  skillStack: "financial modeling, valuation, Excel, Bloomberg, and presentation skills",
  employers: "banks and finance companies",
  workProducts: "finance projects, investment pitches, research, or other work",
  majorExperience: "a major internship, finance project, research experience, or other career-building opportunity",
  y4Recruiting: "recruiting",
  gradPrograms: "MBA, master's, or other graduate programs",
  nextSteps: "full-time roles, graduate programs, fellowships, or other next steps",
};

export const COLLEGE_RECIPES: Record<string, CollegeRecipe> = {
  "investment-banking": IB_RECIPE,
  "private-equity": {
    ...IB_RECIPE,
    coreSkills: "Excel, financial modeling, and company analysis skills",
    advancedTools: "tools like Bloomberg Terminal or Capital IQ",
    skillStack: "LBO and valuation modeling, financial diligence, Excel, and presentation skills",
    employers: "private equity funds, banks, and consulting firms",
    workProducts: "investment memos, stock pitches, case competitions, or other work",
    majorExperience: "a major banking, consulting, or investing internship, or another career-building opportunity",
    y3Recruiting: "banking and consulting internship recruiting",
  },
  "asset-management": {
    ...IB_RECIPE,
    clubs: "an investing, finance, business, or related club",
    coreSkills: "Excel and portfolio analysis skills",
    advancedTools: "tools like Bloomberg Terminal or FactSet",
    skillStack: "valuation, portfolio analysis, Excel, Bloomberg, and presentation skills",
    employers: "asset managers, banks, and investment firms",
    workProducts: "stock pitches, a paper portfolio, market research, or other work",
    majorExperience: "a major asset management or finance internship, research experience, or other career-building opportunity",
    gradPrograms: "the CFA program, a master's in finance, or other next steps",
  },
  "software-engineer": {
    field: "Tech",
    clubs: "a coding, hackathon, robotics, or related club",
    classes: "computer science, math, and physics",
    starterTools: "Git and one programming language well",
    programs: "tech programs",
    coreSkills: "coding, data structures, and algorithms skills",
    courses: "computer science, software engineering, math, or statistics courses",
    advancedTools: "cloud platforms and frameworks like AWS or React",
    y3Recruiting: "internship recruiting",
    skillStack: "coding interviews, system design, Git, testing, and code review skills",
    employers: "tech companies and engineering teams",
    workProducts: "apps, open-source contributions, hackathon projects, or other work",
    majorExperience: "a major software internship, a shipped project, research experience, or other career-building opportunity",
    y4Recruiting: "new-grad recruiting",
    gradPrograms: "a master's in computer science or other graduate programs",
    nextSteps: "full-time engineering roles, graduate programs, fellowships, or other next steps",
  },
  "data-scientist": {
    field: "Tech",
    clubs: "a data science, analytics, coding, or related club",
    classes: "statistics, math, and computer science",
    starterTools: "Python and SQL",
    programs: "data programs",
    coreSkills: "Python, SQL, and statistics skills",
    courses: "statistics, computer science, data science, math, or economics courses",
    advancedTools: "tools like Tableau, cloud platforms, or machine learning libraries",
    y3Recruiting: "internship recruiting",
    skillStack: "statistical modeling, Python, SQL, data visualization, and presentation skills",
    employers: "tech companies and analytics teams",
    workProducts: "data projects, Kaggle notebooks, dashboards, research, or other work",
    majorExperience: "a major data or analytics internship, research experience, or other career-building opportunity",
    y4Recruiting: "recruiting",
    gradPrograms: "a master's in data science or statistics, or other graduate programs",
    nextSteps: "full-time data roles, graduate programs, fellowships, or other next steps",
  },
  "game-designer": {
    field: "Games",
    clubs: "a game development, design, or related club",
    classes: "computer science, art and design, and writing",
    starterTools: "Unity or Godot",
    programs: "studio programs",
    coreSkills: "prototyping, scripting, and level design skills",
    courses: "game design, computer science, psychology, art, or writing courses",
    advancedTools: "engines and tools like Unreal Engine, Blender, or version control",
    y3Recruiting: "studio internship recruiting",
    skillStack: "systems design, prototyping, playtesting, scripting, and pitching skills",
    employers: "game studios and interactive media companies",
    workProducts: "playable prototypes, game jam entries, design documents, or other work",
    majorExperience: "a major studio internship, a released game, a team project, or other career-building opportunity",
    y4Recruiting: "studio recruiting",
    gradPrograms: "a master's in game design or other graduate programs",
    nextSteps: "full-time studio roles, indie projects, graduate programs, or other next steps",
  },
  "airline-pilot": {
    field: "Aviation",
    clubs: "a flying club, aviation, or related club",
    classes: "math, physics, meteorology, and aerodynamics",
    starterTools: "flight planning tools like ForeFlight",
    programs: "airline cadet programs",
    coreSkills: "instrument flying and flight planning skills",
    courses: "aeronautical science, meteorology, aviation safety, or physics courses",
    advancedTools: "tools like flight simulators and training devices",
    y3Recruiting: "flight instructor hiring",
    skillStack: "instrument flying, crew communication, checkride preparation, and hour-building skills",
    employers: "airlines, flight schools, and cargo carriers",
    workProducts: "ratings, certificates, and logbook hours",
    majorExperience: "a flight instructor job, an airline cadet program, or another hour-building opportunity",
    y4Recruiting: "airline applications",
    gradPrograms: "R-ATP eligibility, airline cadet pathways, or other next steps",
    nextSteps: "regional airline roles, cadet programs, flight instructing, or other next steps",
  },
  "registered-nurse": {
    field: "Nursing",
    clubs: "a pre-nursing, health, volunteering, or related club",
    classes: "biology, chemistry, anatomy, and statistics",
    starterTools: "medical terminology and basic patient-care skills",
    programs: "hospital volunteer programs",
    coreSkills: "clinical assessment and patient-care skills",
    courses: "anatomy, physiology, pharmacology, microbiology, or nutrition courses",
    advancedTools: "tools like electronic health record systems and simulation labs",
    y3Recruiting: "clinical placements",
    skillStack: "clinical judgment, patient communication, charting, and NCLEX preparation skills",
    employers: "hospitals, clinics, and health systems",
    workProducts: "clinical hours, certifications like CNA or BLS, and care plans",
    majorExperience: "a nurse externship, a CNA or patient-care job, or another clinical opportunity",
    y4Recruiting: "nurse residency applications",
    gradPrograms: "an MSN, nurse practitioner track, or other graduate programs",
    nextSteps: "nurse residency programs, graduate programs, or other next steps",
  },
  "food-scientist": {
    field: "Food Science",
    clubs: "a food science, chemistry, sustainability, or related club",
    classes: "chemistry, biology, and math",
    starterTools: "lab safety and basic lab techniques",
    programs: "food industry programs",
    coreSkills: "lab technique, sensory evaluation, and data analysis skills",
    courses: "food chemistry, microbiology, nutrition, statistics, or food processing courses",
    advancedTools: "lab instruments and product development software",
    y3Recruiting: "internship recruiting",
    skillStack: "formulation, food safety, lab technique, data analysis, and presentation skills",
    employers: "food companies, labs, and research centers",
    workProducts: "product development projects, research posters, competition entries, or other work",
    majorExperience: "a major food industry internship, research experience, or other career-building opportunity",
    y4Recruiting: "recruiting",
    gradPrograms: "a master's in food science or other graduate programs",
    nextSteps: "full-time R&D or quality roles, graduate programs, fellowships, or other next steps",
  },
  "fashion-buyer": {
    field: "Fashion",
    clubs: "a fashion, retail, business, or related club",
    classes: "business math, statistics, marketing, and design",
    starterTools: "Excel and retail math",
    programs: "retail programs",
    coreSkills: "Excel, retail math, and trend research skills",
    courses: "merchandising, marketing, statistics, economics, or business courses",
    advancedTools: "merchandise planning and inventory systems",
    y3Recruiting: "buying internship recruiting",
    skillStack: "assortment planning, vendor negotiation, sales data analysis, Excel, and presentation skills",
    employers: "retailers, brands, and buying offices",
    workProducts: "trend reports, a mock assortment plan, retail projects, or other work",
    majorExperience: "a major buying or merchandising internship, a retail job, or other career-building opportunity",
    y4Recruiting: "recruiting",
    gradPrograms: "a master's in fashion management or other graduate programs",
    nextSteps: "assistant buyer roles, retail leadership programs, graduate programs, or other next steps",
  },
};

/** The recipe for a career, Investment Banking when there is none. */
export function collegeRecipe(careerId?: string | null): CollegeRecipe {
  return (careerId && COLLEGE_RECIPES[careerId]) || IB_RECIPE;
}

/** The college plan for a year, with every slot filled for the student's #1
 *  career (Investment Banking when none is chosen yet). */
export function collegePlan(year: CollegeYear, career?: { id: string; title: string } | null): CollegePlan {
  const base = COLLEGE_PLANS.find((p) => p.year === year) ?? COLLEGE_PLANS[0];
  const recipe = collegeRecipe(career?.id);
  const values: Record<string, string> = { ...recipe, career: career?.title ?? "Investment Banking" };
  const fill = (text: string) => text.replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m);
  return { ...base, windows: base.windows.map((w) => ({ ...w, steps: w.steps.map((s) => ({ ...s, title: fill(s.title) })) })) };
}
