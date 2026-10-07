// United Way · Student Success: the partner community (7 Oct 2026).
//
// Why this shape: own research across United Way Worldwide and its local
// United Ways (docs/reference/united-way-board-research-2026-10-07.md).
// United Way is three audiences at once, and Connect already has a role for
// each: students (a community board), volunteers (the Volunteer role, hours
// are their currency) and the organisation itself (the Partner role, which
// here speaks the Global Results Framework, the indicators every local
// United Way reports each year). One global presence, no chapter picker
// (Chandu: "don't think in chapters, make it global"): programs carry where
// they run, and a student anywhere can raise a hand for any of them.
//
// Mentoring belongs in the Mentorship tab as well (Chandu: "if they offer a
// mentorship program we need to have that in mentorships as well"): the
// e-Mentorship program is a tile there, see mentorshipData.ts. High school
// mentoring has NO direct messages in this prototype ("messages should not
// work for high school 1:1 yet"): workshops and program-led meetings carry
// the relationship.
//
// Every program, number and quote below comes from the research sources
// (Orange County, Palm Beach County, Salt Lake, the Midlands, Long Island,
// Southwest Virginia, Clear Impact's GRF pages). Counts for this board's own
// activity are demo numbers, marked, to be replaced by the partner's data.
// Brand: no United Way mark file is in the repo yet, so the banner wears a
// text lockup in United Way blue; swap in the published mark when it lands.

import { PROS, type Pro } from "../data";

export const UW_ID = "united-way-student-success";

export const UW = {
  eyebrow: "United Way Worldwide partner community",
  name: "United Way · Student Success",
  about: "Mentors, programs and real work experience from local United Ways, open to students anywhere. Ask a verified volunteer, join a program, find an internship near you.",
  // United Way blue (brand guide primary; confirm the exact value with the partner)
  color: "#2F6FD6",
  cover: "/images/connect/covers/people-teaching-education.webp",
  // the headline numbers a student sees on the banner (network facts from the research)
  stats: [
    { value: "1,100", label: "local United Ways" },
    { value: "6", label: "programs open" },
    { value: "38", label: "states with volunteers" },
  ],
};

export const VIEWS = [
  { key: "student", label: "Student View" },
  { key: "volunteer", label: "Volunteer View" },
  { key: "partner", label: "United Way View" },
] as const;
export type UwView = typeof VIEWS[number]["key"];

export const STUDENT_TABS = [
  { key: "home", label: "Home" },
  { key: "programs", label: "Programs" },
  { key: "ask", label: "Ask" },
  { key: "opportunities", label: "Opportunities" },
  { key: "people", label: "People" },
] as const;
export const VOLUNTEER_TABS = [
  { key: "today", label: "Today" },
  { key: "questions", label: "Questions" },
  { key: "impact", label: "My Impact" },
] as const;
export const PARTNER_TABS = [
  { key: "impact", label: "Impact" },
  { key: "programs", label: "Programs" },
] as const;

export const BACK = "Back to communities";

// ——— Programs (the network's real programs, one card each) ———

export type ProgramKind = "mentorship" | "work" | "college" | "exposure";
export type Program = {
  id: string;
  title: string;
  by: string; // the local United Way that runs it
  where: string;
  kind: ProgramKind;
  kindLabel: string;
  who: string;
  line: string; // one line on the card
  what: string[]; // what you get
  cadence: string;
  status: "open" | "soon" | "returning";
  statusLine: string;
  proof?: string; // the program's own published outcome
  /** opens in the Mentorship tab instead of a sheet */
  mentorshipId?: string;
  virtual: boolean;
};

export const PROGRAMS: Program[] = [
  {
    id: "uw-ementorship", title: "e-Mentorship", by: "Orange County United Way", where: "Virtual · Orange County, CA", kind: "mentorship", kindLabel: "1:1 mentorship",
    who: "High school seniors from low income communities", line: "A professional mentor and a six-month workshop series, all online.",
    what: ["A matched professional mentor for the school year", "Six months of workshops: financial aid, life after high school, mental health, work-life balance", "Help staying on track to graduate"],
    cadence: "Monthly, virtual · October to April", status: "returning", statusLine: "Coming back for the Class of 2027",
    proof: "Class of 2021: 285 students, 100% graduated on time, 90% confident about college", mentorshipId: "united-way", virtual: true,
  },
  {
    id: "uw-ycc", title: "Youth Career Connections", by: "Orange County United Way", where: "Orange County, CA", kind: "work", kindLabel: "Work-based learning",
    who: "High school students, grades 9 to 12", line: "Professionals in your classroom, site visits, a four-week workplace mentorship.",
    what: ["Corporate speakers in class and industry site visits", "A four-week workplace mentorship for seniors, about 20 hours a week", "Summer internships, financial literacy, an entrepreneurship track"],
    cadence: "School year · in person", status: "open", statusLine: "Open now",
    proof: "Since 2016: 15,399 students and teachers, 65,922 volunteer hours, 2,262 workplace mentorships", virtual: false,
  },
  {
    id: "uw-destination", title: "Destination Graduation", by: "Orange County United Way", where: "Orange County, CA", kind: "college", kindLabel: "College prep",
    who: "High school students", line: "Graduate, then know your options: aid, scholarships, applications, campus trips.",
    what: ["College and career exploration", "Financial aid and scholarship help", "College field trips and application support"],
    cadence: "School year", status: "open", statusLine: "Open now", virtual: false,
  },
  {
    id: "uw-ymu", title: "Young Men United", by: "United Way of the Midlands", where: "Columbia, SC", kind: "mentorship", kindLabel: "Mentorship + internships",
    who: "Young men, high school into college", line: "An adult mentor, a paid eight-week internship, college and employer visits.",
    what: ["Every participant matched with an adult mentor", "Paid eight-week internships and job shadows", "College visits, professional development, a laptop"],
    cadence: "Year round · in person", status: "open", statusLine: "Applications open",
    proof: "2024 to 2025: 100% matched with a mentor, 20 paid internships, 25 job shadows", virtual: false,
  },
  {
    id: "uw-oyce", title: "Opportunity Youth Career Exploration", by: "United Way of Long Island", where: "Long Island, NY", kind: "work", kindLabel: "Paid internships",
    who: "Ages 14 to 17", line: "Career exploration, work-readiness training and a paid internship.",
    what: ["Career pathway education and life-skills workshops", "Work-readiness training", "A paid internship in community outreach, education, events or youth programs"],
    cadence: "Summer and school year", status: "soon", statusLine: "Next cohort opens in spring", virtual: false,
  },
  {
    id: "uw-ignite", title: "Ignite Internships", by: "United Way of Southwest Virginia", where: "19 counties, Southwest VA", kind: "work", kindLabel: "Internships",
    who: "High school students", line: "Internships with 79 local companies, matched to what you want to try.",
    what: ["Paid and credit-bearing internships with 79 employers", "Work-readiness coaching before you start", "A supervisor evaluation you can put on a résumé"],
    cadence: "Summer", status: "open", statusLine: "Applications open", virtual: false,
  },
];

export const PROGRAMS_UI = {
  title: "Programs",
  sub: "Run by local United Ways. Raise a hand for any of them; the program lead gets in touch.",
  interested: "I'm interested",
  interestedDone: "You're on the list",
  interestedLine: "The program lead will reach out by email. Your counselor can see this too.",
  openMentorship: "Open in Mentorship",
  who: "Who it's for",
  what: "What you get",
  when: "When",
  where: "Where",
  proof: "What the program reports",
  by: "Run by",
  kinds: [
    { key: "all", label: "All" },
    { key: "mentorship", label: "Mentoring" },
    { key: "work", label: "Work experience" },
    { key: "college", label: "College prep" },
  ] as const,
};
export type ProgramFilter = typeof PROGRAMS_UI.kinds[number]["key"];

// ——— Opportunities (events, internships, job shadows) ———

export type UwOpportunity = {
  id: string;
  kind: string;
  title: string;
  by: string;
  line: string;
  about: string;
  who: string;
  where: string;
  virtual: boolean;
  world?: string;
  status: "open" | "soon" | "upcoming";
  date?: { month: string; day: number; time?: string };
  deadline?: { month: string; day: number };
  interested: number;
};

export const OPPORTUNITIES: UwOpportunity[] = [
  { id: "uw-o-expo", kind: "Career expo", title: "OnTrack Career Expo", by: "United Way Bay Area", line: "Hands-on exhibits and mentors with similar lived experiences", about: "A one-day career expo: try hands-on exhibits from local employers, hear from professionals who grew up where you did, and leave with two careers to explore in Dreamari.", who: "High school students in the Bay Area. Everyone else can join the virtual panel at noon.", where: "Oakland, CA · virtual panel online", virtual: false, status: "upcoming", date: { month: "Mar", day: 14, time: "9:00 AM" }, interested: 212 },
  { id: "uw-o-careerday", kind: "Career day", title: "Career Exploration Day with employers", by: "United Ways of Central New Mexico", line: "Eighth grade and up · with the district's CTE office", about: "Employers from advanced manufacturing to health care set up stations for a day. Students rotate, ask questions and pick a pathway to try.", who: "Grades 8 to 12 in Albuquerque Public Schools.", where: "Albuquerque, NM", virtual: false, status: "upcoming", date: { month: "Nov", day: 6, time: "8:30 AM" }, interested: 148 },
  { id: "uw-o-panel", kind: "Virtual panel", title: "What a first job really looks like", by: "United Way volunteers", line: "Online · four volunteers, your questions second half", about: "Four United Way volunteers from different companies on their first jobs, what they wish they had known, and what to do this year. Student questions run the second half.", who: "Any student, anywhere.", where: "Online", virtual: true, status: "open", date: { month: "Oct", day: 23, time: "6:00 PM" }, interested: 318, world: "Business & Finance" },
  { id: "uw-o-shadow", kind: "Job shadow", title: "Hospital job shadow day", by: "United Way of Palm Beach County", line: "Nursing, pharmacy, imaging · one day", about: "Spend a day shadowing in a hospital: nursing, pharmacy and imaging, with a debrief with the volunteers who hosted you.", who: "Juniors and seniors interested in health careers.", where: "West Palm Beach, FL", virtual: false, status: "open", deadline: { month: "Nov", day: 20 }, interested: 96, world: "Health & Medicine" },
  { id: "uw-o-intern", kind: "Internship", title: "Summer internship with a local employer", by: "United Way of Southwest Virginia · Ignite", line: "Paid · 79 employers · matched to your interests", about: "A paid summer internship with one of 79 local companies, matched to what you want to try. Work-readiness coaching first, a supervisor evaluation at the end.", who: "High school students in Southwest Virginia.", where: "Southwest Virginia", virtual: false, status: "soon", deadline: { month: "Feb", day: 27 }, interested: 174 },
  { id: "uw-o-resume", kind: "Workshop", title: "Résumé clinic with volunteers", by: "United Way volunteers", line: "Online · bring the résumé you built here", about: "A 45-minute online clinic. Volunteers read your Dreamari résumé live and leave notes you can act on the same night.", who: "Any student with a résumé in Dreamari.", where: "Online", virtual: true, status: "open", date: { month: "Nov", day: 12, time: "5:00 PM" }, interested: 240 },
  { id: "uw-o-fafsa", kind: "Workshop", title: "Financial aid night", by: "Orange County United Way · Destination Graduation", line: "Families welcome · FAFSA walkthrough", about: "A plain-language walk through the FAFSA and state aid with volunteers who do this every year. Families welcome.", who: "Seniors and their families.", where: "Santa Ana, CA · also online", virtual: true, status: "upcoming", date: { month: "Oct", day: 29, time: "6:30 PM" }, interested: 133 },
  { id: "uw-o-site", kind: "Site visit", title: "Inside a design studio", by: "Orange County United Way · Youth Career Connections", line: "Arts, media & entertainment track", about: "A half-day visit to a design studio: how a brief becomes a campaign, who does what, and a short project you take home.", who: "Students in the Arts, Media & Entertainment track.", where: "Irvine, CA", virtual: false, status: "upcoming", date: { month: "Dec", day: 3, time: "9:00 AM" }, interested: 61, world: "Arts, Media & Sport" },
];

export const OPPORTUNITY_UI = {
  title: "Opportunities",
  seeAll: "See all",
  filters: [{ key: "all", label: "All" }, { key: "virtual", label: "Virtual" }, { key: "inperson", label: "In person" }] as const,
  groups: [
    { title: "Career days & expos", kinds: ["Career expo", "Career day", "Site visit"] },
    { title: "Online with volunteers", kinds: ["Virtual panel", "Workshop"] },
    { title: "Internships & job shadows", kinds: ["Internship", "Job shadow"] },
  ],
  interested: "interested",
  save: "Save", saved: "Saved",
  addPlan: "Add to My Plan", inPlan: "In My Plan",
  about: "About", who: "Who it's for", where: "Where", when: "When", by: "Run by",
  status: { open: "Registration open", soon: "Opening soon", upcoming: "Upcoming" },
  short: { open: "Open", soon: "Soon", upcoming: "Upcoming" },
  closes: "Closes",
  note: "Sign-up happens with the local United Way. We hand your name across.",
  close: "Close",
};
export type OpportunityFilter = typeof OPPORTUNITY_UI.filters[number]["key"];

// ——— Home ———

export const HOME = {
  theme: {
    eyebrow: "This month",
    title: "Meet someone who does the job",
    line: "Ask a United Way volunteer one question about a career you are curious about. Public answers help every student here.",
    cta: "Ask a volunteer",
  },
  mentoring: {
    eyebrow: "Mentoring",
    title: "A mentor for senior year",
    line: "e-Mentorship pairs seniors with a professional and a six-month workshop series. It lives in the Mentorship tab.",
    cta: "See the program",
    note: "No direct messages in high school. Your program lead sets up meetings.",
  },
  programsTitle: "Programs open now",
  programsSeeAll: "All programs",
  opportunitiesTitle: "Opportunities for you",
  answersTitle: "Recent answers",
  answersSeeAll: "All answers",
  nearYou: {
    eyebrow: "Near you",
    line: "Opportunities in {state} appear first once your Build state is set.",
    none: "Nothing in {state} yet. Virtual sessions are open to everyone.",
  },
};

// ——— Ask ———

export const ASK = {
  eyebrow: "Ask United Way volunteers",
  placeholder: "What do you want to know about a career or a program?",
  submitted: "Question submitted for moderation",
  again: "Ask another",
  answersEyebrow: "Recent answers",
  read: "Read answer", hide: "Hide answer", more: "Show more", less: "Show less",
  like: "Like", comment: "Comment",
};

/** The volunteers who answer here: existing Connect professionals, so every
 *  avatar, profile and verification line is the real one. Their employers
 *  are the kind of workplace-campaign partners United Way volunteers come
 *  from. */
export const VOLUNTEER_IDS = ["pro-okafor", "pro-reyes", "pro-tanaka", "pro-cole", "pro-whitfield", "pro-brooks", "pro-chen", "pro-walsh"] as const;
export const VOLUNTEERS: Record<string, Pro> = Object.fromEntries(VOLUNTEER_IDS.map((id) => [id, PROS.find((p) => p.id === id)!]));
export const VOLUNTEER_LINE = "Background checked · Work email verified · United Way volunteer";
export const ANSWER_COUNTS: Record<string, number> = { "pro-okafor": 27, "pro-reyes": 22, "pro-tanaka": 19, "pro-cole": 16, "pro-whitfield": 15, "pro-brooks": 12, "pro-chen": 11, "pro-walsh": 9 };

export const RECENT_ANSWERS = [
  { id: "uw-q1", question: "I want a health career but not medical school. What else is there?", pro: "pro-reyes", answer: "Nursing, imaging, respiratory therapy, pharmacy tech, surgical tech. Most start with a two-year program and a license, and hospitals hire all of them. Shadow one day in each if you can. The Palm Beach job shadow day on this board does exactly that.", helpful: 64, comments: 9 },
  { id: "uw-q2", question: "How do I get an internship when nobody in my family has had an office job?", pro: "pro-whitfield", answer: "Programs like Ignite and Youth Career Connections exist for this. They match you to an employer and coach you before day one. Raise a hand on the Programs tab, then build the résumé here so you walk in with one.", helpful: 58, comments: 7 },
  { id: "uw-q3", question: "What does a first week in finance actually look like?", pro: "pro-okafor", answer: "Mostly learning the spreadsheets and the people. Nobody expects you to know the business yet. Ask one good question a day and write down the answer.", helpful: 41, comments: 5 },
  { id: "uw-q4", question: "Is it worth going to a career expo if I already know what I want?", pro: "pro-cole", answer: "Yes. You will meet the people who hire for it, and you might find the job next to the one you wanted. Go with two questions written down.", helpful: 33, comments: 4 },
];

export const PEOPLE = {
  title: "Volunteers who answer here",
  sub: "Professionals from United Way's workplace partners. Every volunteer is background checked and verified by their employer.",
  rows: [
    { title: "Answering most this month", pros: ["pro-okafor", "pro-reyes", "pro-tanaka", "pro-cole"] },
    { title: "Health & Medicine", pros: ["pro-reyes", "pro-brooks"] },
    { title: "Business, hiring & early careers", pros: ["pro-okafor", "pro-whitfield", "pro-tanaka", "pro-walsh"] },
  ],
  answers: "answers",
};

// ——— Volunteer view ———

export const VOLUNTEER_TODAY = {
  since: {
    title: "Since you were last here",
    items: [
      { text: "Your answer on first jobs in finance was read 412 times", go: "questions" as const },
      { text: "Priya built a résumé after your clinic notes", go: "impact" as const },
      { text: "3 new questions are waiting for someone in your field", go: "questions" as const },
    ],
  },
  title: "What should I do right now?",
  sub: "Short asks that fit a lunch break. Every one logs hours.",
  requests: [
    { id: "r1", kind: "Answer", minutes: 5, title: "Answer: “What does a first week in finance look like?”", why: "Three students asked a version of this." },
    { id: "r2", kind: "Review", minutes: 15, title: "Review Jordan's résumé for the Ignite internship", why: "Applications close Feb 27." },
    { id: "r3", kind: "Speak", minutes: 45, title: "Join the panel “What a first job really looks like”", why: "Oct 23, online, 318 students interested." },
    { id: "r4", kind: "Mentor", minutes: 60, title: "Mentor a senior through e-Mentorship", why: "Monthly, virtual, October to April. Workshops are run for you." },
  ],
  minutes: "min", accept: "Accept", accepted: "Accepted", acceptedLine: "Logged to your hours",
};

export const VOLUNTEER_QUESTIONS = {
  title: "Questions waiting", sub: "Routed to you by field.",
  answer: "Answer", send: "Send answer", placeholder: "Write it the way you would say it to a 16-year-old.",
  live: "Live in Recent Answers", more: "Show more", fewer: "Show fewer",
  items: [
    "Do I need college for a job in a hospital?",
    "How do people get into HR?",
    "What should I put on a résumé if I have never had a job?",
    "Is an internship at 16 realistic?",
    "What is a job shadow and how do I ask for one?",
  ],
  yours: {
    title: "Your answers", summary: "4 answers · 1.1K reads",
    items: [
      { question: "What does a first week in finance actually look like?", reads: 412, helpful: 41, when: "Sep" },
      { question: "How do I get an internship when nobody in my family has had an office job?", reads: 388, helpful: 58, when: "Sep" },
      { question: "Is it worth going to a career expo if I already know what I want?", reads: 201, helpful: 33, when: "Aug" },
      { question: "Should I pick a major before I pick a career?", reads: 119, helpful: 17, when: "Jun" },
    ],
  },
};

export const MY_IMPACT = {
  title: "My Impact", sub: "Your year with students, in one place. Only you see this.",
  tiles: [
    { key: "hours", value: "18", label: "Hours this year" },
    { key: "answers", value: "27", label: "Answers" },
    { key: "students", value: "31", label: "Students helped" },
    { key: "meetings", value: "6", label: "Mentoring meetings" },
  ],
  goal: { eyebrow: "Hours toward your company's United Way campaign", logged: 18, target: 25, pace: 16, unit: "hours", line: "Your employer counts these toward its campaign total. Export them any time." },
  hoursEyebrow: "Hours by month",
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  hours: [0, 1, 2, 2, 2, 3, 2, 3, 3],
  export: "Export hours", exported: "CSV ready for INVOLVE or Salesforce · names left out",
  studentsEyebrow: "Students you have helped",
  students: [
    { name: "Jordan Rivera", what: "Résumé review", when: "Sep" },
    { name: "Priya", what: "Résumé clinic", when: "Sep" },
    { name: "Marcus", what: "Finance question", when: "Aug" },
    { name: "Sana", what: "Career expo question", when: "Jun" },
  ],
};

// ——— United Way view: the Global Results Framework, Youth Success ———

export const IMPACT = {
  title: "Impact", sub: "Youth Success, in the words of the Global Results Framework. Export for the Global Results Snapshot.",
  range: [{ key: "month", label: "This Month" }, { key: "year", label: "This Year" }] as const,
  outcome: {
    eyebrow: "Outcome",
    value: "71%",
    line: "of students with a United Way touch completed a career step within 30 days",
    funnelLabel: "From reach to outcome",
    funnel: [{ label: "Reached", value: 2340 }, { label: "Explored a career", value: 1870 }, { label: "Asked or attended", value: 1120 }, { label: "Matched or placed", value: 412 }, { label: "Career step", value: 1660 }],
  },
  // GRF reach and outcome indicators first, then the two only Dreamari adds
  tiles: [
    { key: "reached", month: "612", year: "2,340", label: "Youth reached" },
    { key: "skills", month: "188", year: "1,120", label: "Youth in job skills training" },
    { key: "matches", month: "41", year: "412", label: "Mentor matches" },
    { key: "hours", month: "96", year: "1,480", label: "Volunteer hours" },
    { key: "placements", month: "22", year: "206", label: "Internships & job shadows" },
    { key: "steps", month: "340", year: "1,660", label: "Career steps completed" },
  ],
  indicators: {
    eyebrow: "GRF Youth Success indicators",
    note: "Value this year against the goal; the tick is last year.",
    rows: [
      { label: "Youth receiving job skills training", value: 1120, goal: 1500, last: 760 },
      { label: "Youth gaining soft skills", value: 940, goal: 1200, last: 610 },
      { label: "On-time graduation (seniors in programs)", value: 96, goal: 100, last: 94, unit: "%" },
      { label: "Postsecondary plan completed", value: 71, goal: 85, last: 58, unit: "%" },
      { label: "Satisfactory attendance", value: 90, goal: 92, last: 87, unit: "%" },
    ],
  },
  takePart: { eyebrow: "How students take part", parts: [{ label: "Virtual", value: 1430 }, { label: "In person", value: 910 }], note: "38 states. A local program is one way in." },
  volunteers: { eyebrow: "Volunteers", parts: [{ label: "Workplace partners", value: 212 }, { label: "Community", value: 74 }], note: "286 active volunteers from 41 employers." },
  goal: { eyebrow: "2026 volunteer hours", logged: 1480, target: 2000, pace: 1400, unit: "hours" },
  trend: {
    eyebrow: "Trend",
    metrics: [{ key: "reached", label: "Youth reached" }, { key: "steps", label: "Career steps" }, { key: "hours", label: "Volunteer hours" }] as const,
    months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    series: {
      reached: [640, 920, 1240, 1610, 1980, 2340],
      steps: [410, 620, 880, 1120, 1390, 1660],
      hours: [380, 560, 760, 980, 1230, 1480],
    } as Record<string, number[]>,
  },
  export: "Export for the Global Results Snapshot", exported: "Snapshot CSV ready · indicators in GRF order",
};

export const SAFETY = {
  eyebrow: "Safety",
  note: "What legal and program leads ask first.",
  rows: [
    { label: "Volunteers verified", value: "286", sub: "Background checked, employer verified" },
    { label: "Flags this month", value: "3", sub: "All reviewed within a day" },
    { label: "Direct messages", value: "Off", sub: "High school students: none. Meetings are program-led." },
    { label: "Median answer time", value: "19h", sub: "Moderated before it is public" },
  ],
};

export const PARTNER_PROGRAMS = {
  title: "Programs on this board", sub: "Each local United Way sees its own rows. Worldwide sees them all.",
  columns: ["Program", "Students interested", "Volunteers", "Hours", "Status"],
  rows: [
    { program: "Youth Career Connections", by: "Orange County", students: 486, volunteers: 64, hours: 410, status: "Open" },
    { program: "e-Mentorship", by: "Orange County", students: 312, volunteers: 58, hours: 290, status: "Returning · Class of 2027" },
    { program: "Destination Graduation", by: "Orange County", students: 274, volunteers: 22, hours: 120, status: "Open" },
    { program: "Young Men United", by: "Midlands", students: 141, volunteers: 37, hours: 260, status: "Open" },
    { program: "Opportunity Youth Career Exploration", by: "Long Island", students: 98, volunteers: 19, hours: 140, status: "Opens in spring" },
    { program: "Ignite Internships", by: "Southwest Virginia", students: 229, volunteers: 86, hours: 260, status: "Open" },
  ],
};

export const REPORT = {
  title: "Report this", label: "Moderation",
  note: "Tell us what is wrong. A moderator reads every report.",
  reasons: ["Not appropriate for students", "Asked to move off the platform", "Wrong or misleading advice", "Something else"],
  sent: "Sent to moderators",
};

// ——— Mentorship tab: the program sheet (no direct messages in high school) ———

export const MENTORSHIP_PROGRAM = {
  id: "united-way",
  company: "United Way",
  title: "e-Mentorship",
  kind: "1:1 mentorship",
  line: "A professional mentor and six months of workshops for seniors, all online.",
  cover: "/images/connect/covers/people-business-money.webp",
  meta: "Seniors · virtual · Oct to Apr",
  by: "Orange County United Way, open to seniors anywhere online",
  who: "High school seniors, first in line for students from low income communities.",
  how: ["You are matched with one professional mentor for the school year.", "You meet monthly on a video call your program lead sets up.", "Six workshops run alongside: financial aid, life after high school, mental health, money, work-life balance, your first job."],
  messages: { title: "How you talk to your mentor", line: "No direct messages in high school. Your program lead schedules every meeting and sits in the first one. Workshops are group sessions.", tag: "Program-led meetings" },
  workshops: [
    { month: "Oct", day: 14, title: "Welcome and match", line: "Meet your mentor with the program lead on the call." },
    { month: "Nov", day: 11, title: "Financial aid, plainly", line: "FAFSA and state aid, step by step." },
    { month: "Dec", day: 9, title: "Life after high school", line: "College, trades, work: what each year looks like." },
    { month: "Jan", day: 13, title: "Mental health and balance", line: "Stress, sleep, and asking for help." },
    { month: "Feb", day: 10, title: "Money basics", line: "Paychecks, budgets, your first bank account." },
    { month: "Mar", day: 10, title: "Your first job", line: "Résumé, interview, the first week." },
  ],
  proof: "Class of 2021: 285 students, 100% graduated on time, 90% felt confident about college.",
  cta: "I'm interested", done: "You're on the list", doneLine: "The program lead will reach out by email before October.",
  mentorCta: "Volunteer as a mentor",
  mentorLine: "Monthly, virtual, with workshops run for you. Background check and a two-hour orientation first.",
};
