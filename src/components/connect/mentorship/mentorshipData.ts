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

// Coach's own language and assets (coach.com/content/coachfoundation and
// coachfoundation-impact, the Foundation's press releases on 3BL / PR
// Newswire, 18 Sept 2026): the initiative is Dream It Real, scholars are
// "Dream It Real Scholars", each "matched with a Coach employee mentor
// throughout their college journey". Cover: Coach Foundation press photo of
// Dream It Real scholars at Tapestry HQ, Hudson Yards (3BL Media). Lockup:
// the Foundation's white logo from cms.coach.com. Wordmark: Wikimedia
// Commons "Coach New Logo.svg". Brand tan is Coach's signature saddle.
export const PROGRAM = {
  id: "coach",
  partner: "Coach Foundation",
  initiative: "Dream It Real",
  title: "Dream It Real Mentorship",
  mission: "To create opportunities and remove barriers for the next generation of young people who have the courage to dream it real.",
  cohort: "2026-27 Cohort · October to April",
  counts: "450 Scholars · 450 Mentors",
  safeguard: "Private, matched, and safeguarded.",
  cover: "/images/connect/covers/coach-dream-it-real.jpg",
  logoWhite: "/images/connect/partners/coach-foundation-white.png",
  brand: "#D2B48C",
  facts: ["8,000+ scholarships funded", "94% first-generation scholars", "88% less debt at graduation", "7 programs globally"],
} as const;

/** The tiled Mentorship landing: Coach's program is live for this student;
 *  the other partners' real, current mentorship programs are listed as they
 *  would appear once onboarded, each with the partner's own imagery.
 *  JPMorganChase: The Fellowship Initiative (since 2010, 1:1 employee
 *  mentors, three years; photo from jpmorganchase.com newsroom, TFI New York
 *  graduation). EY: College MAP (since 2009, group mentoring, 5,000+ students
 *  in 35 cities; photo from ey.com's College MAP page). */
export type ProgramTile = { id: string; company: string; title: string; kind: string; line: string; cover: string; focus?: string; mark?: string; state: "yours" | "enrolling" | "soon"; meta: string };
export const PROGRAM_TILES: ProgramTile[] = [
  { id: "coach", company: "Coach", title: "Dream It Real Mentorship", kind: "1:1 mentorship", line: "A Coach employee mentor for all four years of college.", cover: "/images/connect/covers/coach-dream-it-real.jpg", focus: "50% 30%", mark: "/images/connect/partners/coach-foundation-white.png", state: "yours", meta: "450 scholars · 450 mentors · October to April" },
  { id: "jpmc", company: "JPMorgan Chase", title: "The Fellowship Initiative", kind: "1:1 mentorship", line: "Three years with a JPMorganChase mentor, sophomore year through college enrollment.", cover: "/images/connect/covers/jpmc-fellowship-initiative.jpg", focus: "50% 40%", state: "enrolling", meta: "January 2027 · 2 to 3 Saturdays a month" },
  { id: "ey", company: "EY", title: "College MAP", kind: "Group mentorship", line: "EY mentors work with small groups through the college and financial aid process.", cover: "/images/connect/covers/ey-college-map.jpg", focus: "60% 40%", state: "soon", meta: "35 cities · groups of 6 to 8" },
];

export type MentorshipView = "student" | "mentor" | "enterprise";
export const VIEWS: { key: MentorshipView; label: string }[] = [
  { key: "student", label: "Student View" },
  { key: "mentor", label: "Mentor View" },
  { key: "enterprise", label: "Enterprise View" },
];

/** What a college student shares with a mentor from inside the app, sent
 *  into the chat as a card the mentor can open: the plan for the season,
 *  the resume, saved careers, a simulation result, the career report, a
 *  school shortlist, an opportunity. Each is the real feature's page. */
export type ShareKind = "plan" | "resume" | "careers" | "sim" | "report" | "schools" | "opportunity";
export type Share = { kind: ShareKind; title: string; line: string; href: string; meta: string[] };
export const SHAREABLES: Share[] = [
  { kind: "plan", title: "My Plan · Year 1, Fall", line: "Explore + Build a Foundation. 8 steps, 3 done.", href: "/profile?tab=plan", meta: ["EXPLORE Fashion Buyer", "BUILD College resume", "JOIN Retail Club"] },
  { kind: "resume", title: "Fashion Buyer Resume", line: "Updated Sep 12 · 69/100 ATS", href: "/resume-builder?view=document", meta: ["1 job", "1 club", "Excel · Canva · Spanish"] },
  { kind: "careers", title: "Saved careers", line: "Top 3 from Explore", href: "/profile?tab=top3", meta: ["Fashion Buyer", "Marketing", "Product Management"] },
  { kind: "sim", title: "Fashion Buyer · Day in the Life", line: "Played once · 3 skills picked up", href: "/play", meta: ["Retail math", "Trend forecasting", "Vendor negotiation"] },
  { kind: "report", title: "Fashion Buyer career report", line: "Pay, education, career ladder, related careers", href: "/career/fashion-buyer", meta: ["$78K median", "Merchandising degree", "Assistant buyer first"] },
  { kind: "schools", title: "School shortlist", line: "3 schools compared for Fashion Merchandising", href: "/colleges", meta: ["FIT (SUNY)", "Baruch College", "Cornell"] },
  { kind: "opportunity", title: "Coach Summer Internship", line: "Applications open · College sophomores", href: "/connect?tab=mentorship", meta: ["Merchandising track", "New York, NY", "Apply by Jan 31"] },
];

export const MENTOR = {
  name: "Avery Thompson",
  title: "Senior Manager, Merchandising",
  org: "Coach",
  photo: "/images/connect/avatars/pro-doyle-2.png",
} as const;

export const MENTEE = {
  name: "Maya",
  line: "College Freshman",
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

/** The real cards for the prep row: the Fashion Buyer poster, the Play
 *  card, the student's own resume. */
export const PREP_CAREER = { title: "Fashion Buyer", world: "Business & Finance", photo: "/images/app/poster-fashion-buyer.webp", href: "/career/fashion-buyer" } as const;
// No Fashion Buyer simulation exists yet; the warm lounge art from the IB
// sim set stands in until the fashion one is illustrated (18 Sept 2026).
export const PREP_PLAY = { title: "Fashion Buyer", world: "Business & Finance", cover: "/images/play/ib/locations/cafe-lounge-sunset.webp", href: "/play" } as const;
export const PREP_RESUME_HREF = "/resume-builder?view=document";
export const PREP_RESUME_NAME = "Fashion Buyer Resume";
export const PREP_RESUME_META = "Updated Sep 12 · 69/100 ATS";
/** The sample resume the file card shows when the student has not saved one
 *  yet: Maya’s, matching the mentee in this program. */
export const SAMPLE_RESUME = {
  profile: { firstName: "Maya", lastName: "Reyes", email: "maya.reyes@baruch.cuny.edu", phone: "(917) 555-0142", country: "United States", state: "New York", city: "Brooklyn", bio: "" },
  education: [{ id: "ed1", schoolName: "Baruch College, CUNY", cityState: "New York, NY", gradYear: "2030", program: "", gpa: "3.6", honors: ["Dream It Real Scholar"] }],
  experience: [
    { id: "ex1", type: "job" as const, where: "Zara, Atlantic Terminal", title: "Sales Associate", location: "Brooklyn, NY", startDate: "2025-06", endDate: "", current: true, bullets: ["Restocked and merchandised the women’s floor for a store doing 900 transactions a day", "Tracked sell-through on new arrivals and flagged fast movers to the visual lead"], aiAssisted: false },
    { id: "ex2", type: "club" as const, where: "Baruch Retail Club", title: "Events Coordinator", location: "New York, NY", startDate: "2025-09", endDate: "", current: true, bullets: ["Organized a buyer panel with three alumni for 60 students"], aiAssisted: false },
  ],
  skills: { people: ["Customer service", "Teamwork"], tech: ["Excel", "Google Sheets", "Canva"], languages: ["Spanish"] },
  certifications: [],
  versions: [],
};

/** A meeting request lives in the thread as its own card: named, with an
 *  agenda, a time and a place, and Accept / Decline / Add to calendar on the
 *  receiving side (direct feedback, 18 Sept 2026). */
export type MeetingRequest = { title: string; agenda: string; when: string; where: string; status: "pending" | "accepted" | "declined" };
export type Message = { from: "mentor" | "mentee"; text: string; when: string; meeting?: MeetingRequest; share?: Share };
export const THREAD: Message[] = [
  { from: "mentor", text: "Hi Maya, I’m looking forward to our conversation about exploring careers.", when: "Mon 9:14 AM" },
  { from: "mentor", text: "I started as a buyer’s assistant before merchandising, so ask me anything about that path.", when: "Mon 9:15 AM" },
  { from: "mentee", text: "Thank you. I saved Fashion Buyer and would love to hear how you found your first experience.", when: "Mon 6:02 PM" },
  { from: "mentee", text: "Also, does Tuesday at 4 still work for you?", when: "Mon 6:03 PM" },
  { from: "mentee", text: "", when: "Mon 6:04 PM", share: { kind: "resume", title: "Fashion Buyer Resume", line: "Updated Sep 12 · 69/100 ATS", href: "/resume-builder?view=document", meta: ["1 job", "1 club", "Excel · Canva · Spanish"] } },
  { from: "mentor", text: "", when: "Tue 8:40 AM", meeting: { title: "Explore Careers check-in", agenda: "How I got into merchandising, and two bullets for your resume draft.", when: "Tue, Oct 28 · 4:00 PM", where: "Microsoft Teams", status: "pending" } },
];

/** One nudge at a time above the composer, the way an assistant offers a
 *  next line: it changes with the conversation, can be dismissed, and never
 *  sits there permanently. Indexed by how many messages the student has
 *  sent. */
export const NUDGES: Record<"mentee" | "mentor", string[]> = {
  mentee: ["Ask Avery how the buyer’s assistant path worked day to day", "Share one thing from the Fashion Buyer simulation", "Ask what to bring to Tuesday’s meeting", "Say thanks and confirm Tuesday"],
  mentor: ["Ask what Maya saved this week", "Offer to look at her resume before Tuesday", "Share one thing you wish you knew at her age", "Confirm Tuesday and send the link"],
};
export const EMOJI = ["👍", "🙌", "😊", "🎉", "🙏", "💯", "👀", "✨", "😂", "❤️", "🔥", "🤔", "👏", "✅", "📚", "☕️"] as const;

/** Avery as a full Connect profile, so the avatar in the thread opens the
 *  same profile page every professional has. */
export const MENTOR_PRO = {
  id: "coach-avery",
  name: "Avery Thompson",
  role: "Senior Manager, Merchandising",
  org: "Coach",
  scope: "Fashion, merchandising and buying careers",
  verifiedBy: "Employment verified by Coach Foundation · Dream It Real mentor since 2023",
  world: "Business & Finance",
  field: "Merchandising",
  story: "I started as a buyer’s assistant counting units in a stockroom. Twelve years later I plan what a hundred stores sell each season, and the instinct I still use most is asking what the customer will reach for first.",
  followers: 184,
  studentsReached: 2210,
  totalLikes: 466,
  questionsAnswered: 12,
  activeDaysAgo: 1,
  education: "B.S. Fashion Merchandising, Fashion Institute of Technology",
  journey: "Buyer’s assistant, assistant buyer, buyer, then merchandising manager. Dream It Real mentor for three cohorts.",
  topics: ["Fashion buying", "Merchandising", "Retail math", "First jobs in fashion"],
} as const;

export const STUDENT_SUGGESTED = [
  "Do you use the software Dreamari recommends for this career at Coach?",
  "Can you review the resume I made in Dreamari?",
  "What should I focus on if I want to become a Fashion Buyer?",
] as const;

export const MENTOR_SUGGESTED = [
  "Would you like me to review the resume you created in Dreamari?",
  "Is there anything you want to know about becoming a Fashion Buyer?",
] as const;

/** The composer's plus menu, like any messaging app: attachments and the
 *  mentorship actions live off the canvas. */
export const COMPOSER_ACTIONS = [
  { key: "file", label: "Attach file", who: "both" },
  { key: "photo", label: "Photo or video", who: "both" },
  { key: "link", label: "Send meeting link", who: "mentor" },
  { key: "time", label: "Suggest a meeting time", who: "both" },
  { key: "resource", label: "Share approved resource", who: "mentor" },
  { key: "share", label: "Share from Dreamari", who: "both" },
] as const;
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
