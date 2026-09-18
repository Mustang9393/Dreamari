// The Coach Foundation Dreamer Mentorship Program: copy verbatim from Joshua
// Pierce's Replit (dceeai.replit.app/community-boards, MENTORSHIP tab, walked
// 18 Sept 2026; docs/reference/joshua-mentorship-replit-2026-09-18/README.md),
// numbers and program facts from the Tapestry call (Coach One Nation team,
// Sept 2026; docs/reference/partner-calls/tapestry-coach-foundation-2026-09-18.md):
// 450 US scholars each matched 1:1, October to April, 3 to 4 required
// meetings, Dream Day in June; UK 35 (monthly), Japan 33 (April to September),
// China 1,000 on a 1-year scholarship with quarterly regional events instead
// of matching; Tapestry-wide goal of 500,000 volunteer hours by 2030 and a
// Coach Foundation goal of 10,000 scholarships by 2030.

export const PROGRAM = {
  partner: "Coach Foundation",
  title: "Dreamer Mentorship Program",
  cohort: "2026–27 Cohort · October – April",
  counts: "450 Scholars · 450 Mentors",
  safeguard: "Formal mentorship is private, matched, and safeguarded.",
} as const;

export type MentorshipView = "student" | "mentor" | "enterprise";
export const VIEWS: { key: MentorshipView; label: string }[] = [
  { key: "student", label: "Student View" },
  { key: "mentor", label: "Mentor View" },
  { key: "enterprise", label: "Enterprise View" },
];

export const MENTOR = {
  name: "Avery Thompson",
  title: "Senior Manager, Merchandising",
  org: "Coach",
  photo: "/images/connect/avatars/pro-doyle-2.png",
  years: "12 years at Coach",
} as const;

export const MENTEE = {
  name: "Maya",
  line: "College Freshman",
  sub: "Formally matched mentee",
  exploring: ["Fashion Buyer", "Marketing", "Product Management"],
} as const;

export const MEETING = {
  date: { month: "Oct", day: 28, weekday: "Tuesday" },
  time: "4:00 PM",
  where: "Microsoft Teams",
  required: 4,
  completed: 2,
  reschedule: ["Thu, Oct 30 · 5:00 PM", "Mon, Nov 3 · 4:00 PM", "Wed, Nov 5 · 6:30 PM"],
} as const;

export const PREP = [
  { key: "explore", label: "EXPLORE", line: "Learn more about a career you want to discuss.", item: "Fashion Buyer", cta: "Explore Career", href: "/explore?tab=browse" },
  { key: "play", label: "PLAY", line: "Experience the career before talking about it.", item: "Fashion / Marketing Day-in-the-Life", cta: "Play Simulation", href: "/play" },
  { key: "resume", label: "RESUME", line: "Bring something your mentor can help improve.", item: "Resume Draft", cta: "View Resume", href: "/resume-builder?view=document" },
] as const;

export type Message = { from: "mentor" | "mentee"; text: string; when: string };
export const THREAD: Message[] = [
  { from: "mentor", text: "Hi Maya, I’m looking forward to our conversation about exploring careers.", when: "Mon 9:14 AM" },
  { from: "mentee", text: "Thank you. I saved Fashion Buyer and would love to hear how you found your first experience.", when: "Mon 6:02 PM" },
];

export const STUDENT_SUGGESTED = [
  "Do you use the software Dreamari recommends for this career at Coach?",
  "Can you review the resume I made in Dreamari?",
  "What should I focus on if I want to become a Fashion Buyer?",
] as const;

export const MENTOR_SUGGESTED = [
  "Would you like me to review the resume you created in Dreamari?",
  "Is there anything you want to know about becoming a Fashion Buyer?",
] as const;

export const MENTOR_TOOLS = ["Share approved resource", "Send meeting link", "Suggest meeting time"] as const;
export const APPROVED_RESOURCES = [
  { title: "How a buyer plans a season", kind: "Article · Coach Learning", min: "6 min" },
  { title: "Retail math basics", kind: "Worksheet · Dreamari", min: "10 min" },
  { title: "Fashion Buyer career report", kind: "Dreamari Explore", min: "4 min" },
] as const;

export const THREAD_FOOT = "Private mentorship conversation · Safeguarded by Dreamari";
export const ESCALATE_REASONS = ["Inappropriate message", "Asked to move off the platform", "Missed meetings, no response", "Something else"] as const;

export type Month = { key: string; month: string; title: string; focus: string; note?: string; state: "complete" | "current" | "upcoming" };
export const YEAR_PLAN: Month[] = [
  { key: "oct", month: "October", title: "Meet + Set Goals", focus: "Meet your mentor and set one goal.", note: "Set a shared rhythm for the year.", state: "complete" },
  { key: "nov", month: "November", title: "Explore Careers", focus: "Discuss one Dreamari career with your mentor.", note: "Your progress: 2 careers explored", state: "current" },
  { key: "dec", month: "December", title: "Skills + Strengths", focus: "Name two strengths to practice.", state: "upcoming" },
  { key: "jan", month: "January", title: "Resume + Experience", focus: "Turn one experience into a resume bullet.", state: "upcoming" },
  { key: "feb", month: "February", title: "Networking", focus: "Practice one authentic networking introduction.", state: "upcoming" },
  { key: "mar", month: "March", title: "Internships + Opportunities", focus: "Identify one internship or program to explore.", state: "upcoming" },
  { key: "apr", month: "April", title: "Reflection + Next Steps", focus: "Reflect on progress and choose a next step.", state: "upcoming" },
];

export const NEXT_CONVERSATION = {
  head: "Maya has been exploring:",
  prompt: "What helped you figure out what kind of work you wanted to try first?",
  cta: "Prepare for Meeting",
  prep: [
    "Maya saved Fashion Buyer two weeks ago and played the Day-in-the-Life once.",
    "Her resume draft has one experience and no bullet points yet.",
    "This month's topic is Explore Careers: aim to discuss one career in depth.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Enterprise

export type ProgramId = "all" | "us" | "uk" | "jp" | "cn";
export type ProgramStat = {
  id: Exclude<ProgramId, "all">;
  name: string;
  students: number;
  mentors: number;
  mentorLabel: string;
  hours: number;
  cadence: string;
  window: string;
  /** hours logged per month, Jan to Sep */
  monthly: number[];
};

// Monthly hours follow the real calendars: the US and UK programs run
// October to April and dip after Dream Day in June, Japan runs April to
// September, China's quarterly events land in March, June and September.
export const PROGRAMS: ProgramStat[] = [
  { id: "us", name: "United States", students: 450, mentors: 450, mentorLabel: "Mentors", hours: 8200, cadence: "3 to 4 meetings a year, most pairs monthly", window: "October to April, Dream Day in June", monthly: [1210, 1340, 1420, 1180, 620, 940, 310, 360, 820] },
  { id: "uk", name: "United Kingdom", students: 35, mentors: 35, mentorLabel: "Mentors", hours: 1400, cadence: "Monthly", window: "October to April", monthly: [190, 210, 220, 200, 110, 90, 60, 80, 240] },
  { id: "jp", name: "Japan", students: 33, mentors: 33, mentorLabel: "Mentors", hours: 1100, cadence: "Monthly", window: "April to September", monthly: [20, 20, 30, 170, 190, 200, 180, 160, 130] },
  { id: "cn", name: "China", students: 1000, mentors: 18, mentorLabel: "Employee Contributors", hours: 7700, cadence: "Quarterly regional events", window: "1-year scholarship, no 1:1 matching", monthly: [420, 380, 1460, 510, 470, 1520, 440, 480, 2020] },
];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"] as const;

export type Kpi = { key: "hours" | "students" | "mentors" | "meetings"; label: string; year: number; month: number; deltaYear: number; deltaMonth: number; spark: number[] };
export const KPIS: Kpi[] = [
  { key: "hours", label: "Volunteer hours", year: 18400, month: 2200, deltaYear: 14, deltaMonth: 9, spark: [1840, 1950, 3130, 2060, 1390, 2750, 990, 1080, 3210] },
  { key: "students", label: "Students", year: 1518, month: 1180, deltaYear: 9, deltaMonth: 4, spark: [1290, 1310, 1350, 1380, 1400, 1420, 1440, 1470, 1518] },
  { key: "mentors", label: "Mentors", year: 536, month: 418, deltaYear: 7, deltaMonth: 12, spark: [470, 476, 482, 488, 490, 494, 500, 512, 536] },
  { key: "meetings", label: "Mentor meetings", year: 3240, month: 386, deltaYear: 18, deltaMonth: 21, spark: [420, 445, 470, 380, 210, 260, 120, 140, 386] },
];

/** This month by week, instead of the Replit's single "M1" bar. */
export const THIS_MONTH_WEEKS = [480, 530, 590, 600];
/** This year by week, 16 weeks. */
export const THIS_YEAR_WEEKS = [920, 951, 981, 1012, 1043, 1073, 1104, 1135, 1165, 1196, 1227, 1257, 1288, 1319, 1349, 1380];

export const IMPACT = [
  { key: "explored", pct: 89, label: "Explored 3+ careers", delta: 6 },
  { key: "simulation", pct: 76, label: "Completed a simulation", delta: 11 },
  { key: "resume", pct: 68, label: "Built or updated a resume", delta: 9 },
] as const;

/** Required meetings completed so far, across the 450 US pairs. */
export const MEETINGS_PER_PAIR = [
  { label: "0", pairs: 18 },
  { label: "1", pairs: 64 },
  { label: "2", pairs: 171 },
  { label: "3", pairs: 132 },
  { label: "4+", pairs: 65 },
] as const;

/** The two 2030 goals the partner reports on (Tapestry call). `logged` is
 *  what has been counted through Dreamari so far; `pace` is where a straight
 *  line from program start to 2030 would sit today. */
export const GOALS = [
  { key: "hours", title: "500,000 volunteer hours by 2030", scope: "Tapestry-wide", logged: 61200, target: 500000, pace: 58000, unit: "hours" },
  { key: "scholarships", title: "10,000 scholarships by 2030", scope: "Coach Foundation", logged: 4860, target: 10000, pace: 5100, unit: "scholarships" },
] as const;

export const SETTINGS = [
  { key: "format", title: "Mentorship Format", options: ["1:1", "Group"], value: "1:1" },
  { key: "matching", title: "Matching", options: ["Auto Match", "Manual Review"], value: "Auto Match" },
  { key: "cadence", title: "Program Cadence", options: ["October to April", "Monthly", "Quarterly", "Flexible"], value: "October to April" },
  { key: "topics", title: "Topic Planning", options: ["Dreamari-led", "Partner-led", "School-led", "Shared"], value: "Dreamari-led" },
] as const;

/** What counts toward approved service hours: the rules a partner sets,
 *  live on the page instead of behind a dead "Configure rules" button.
 *  Message counting answers the Tapestry ask to see activity without
 *  reading conversations ("Julie has been messaging this person 15 times
 *  this month... it equates to this many volunteer hours"). */
export const HOUR_RULES = [
  { key: "meetings", title: "Mentor meetings", line: "Each completed meeting counts as 1 hour.", on: true },
  { key: "messages", title: "Messages", line: "Every 10 messages sent to a mentee count as 30 minutes.", on: true },
  { key: "prep", title: "Meeting prep", line: "Time spent on Prepare for Meeting counts, up to 20 minutes.", on: false },
  { key: "boards", title: "Community answers", line: "Verified answers on Coach boards count as 15 minutes each.", on: true },
] as const;

export const EXPORT_ITEMS = [
  { title: "Impact summary", line: "One page: hours, students, mentors, meetings, goals. PDF." },
  { title: "Hours by program", line: "Monthly volunteer hours for every program. CSV." },
  { title: "Mentor activity", line: "Meetings and messages per mentor, no message content. CSV." },
] as const;
