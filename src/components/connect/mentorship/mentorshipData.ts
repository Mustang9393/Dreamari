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
/** `lockup` is a partner's own lockup image (the Coach Foundation); otherwise the tile wears the company mark from COMPANY_MARKS at a matched cap height. */
export type ProgramTile = { id: string; company: string; title: string; kind: string; line: string; cover: string; focus?: string; lockup?: string; state: "yours" | "enrolling" | "soon"; meta: string };
export const PROGRAM_TILES: ProgramTile[] = [
  { id: "coach", company: "Coach", title: "Dream It Real Mentorship", kind: "1:1 mentorship", line: "A Coach employee mentor for all four years of college.", cover: "/images/connect/covers/coach-dream-it-real.jpg", focus: "50% 30%", lockup: "/images/connect/partners/coach-foundation-white.png", state: "yours", meta: "" },
  { id: "jpmc", company: "JPMorgan Chase", title: "The Fellowship Initiative", kind: "1:1 mentorship", line: "A JPMorganChase mentor, sophomore year through college.", cover: "/images/connect/covers/jpmc-fellowship-initiative.jpg", focus: "50% 40%", state: "enrolling", meta: "January 2027" },
  { id: "ey", company: "EY", title: "College MAP", kind: "Group mentorship", line: "EY mentors, in small groups, through college and financial aid.", cover: "/images/connect/covers/ey-college-map.jpg", focus: "60% 40%", state: "soon", meta: "" },
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
  { kind: "schools", title: "School shortlist", line: "3 schools compared · estimated debt at graduation", href: "/colleges", meta: ["FIT (SUNY) · $9K", "Baruch College · $7K", "Cornell · $28K"] },
  { kind: "opportunity", title: "Coach Summer Internship", line: "Applications open · College sophomores", href: "/connect?tab=mentorship", meta: ["Merchandising track", "New York, NY", "Apply by Jan 31"] },
];

export const MENTOR = {
  name: "Avery Thompson",
  title: "Senior Manager, Merchandising",
  org: "Coach",
  photo: "/images/connect/avatars/pro-doyle-2.png",
} as const;

// The demo account is Jordan Rivera everywhere in the app, so the mentee is
// Jordan here too (direct feedback, 18 Sept 2026).
export const MENTEE = {
  name: "Jordan",
  fullName: "Jordan Rivera",
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
export const PREP_CAREER = { label: "Explore", title: "Fashion Buyer", why: "Learn more about a career you want to discuss.", cta: "Explore Career", world: "Business & Finance", photo: "/images/app/poster-fashion-buyer.webp", href: "/career/fashion-buyer" } as const;
// No Fashion Buyer simulation exists yet; the warm lounge art from the IB
// sim set stands in until the fashion one is illustrated (18 Sept 2026).
export const PREP_PLAY = { label: "Play", title: "Fashion Buyer Day in the Life", why: "Experience the career before talking about it.", cta: "Play Simulation", world: "Business & Finance", cover: "/images/play/ib/locations/cafe-lounge-sunset.webp", href: "/play" } as const;
export const PREP_RESUME = { label: "Resume", why: "Bring something your mentor can help improve.", cta: "View Resume" } as const;
export const PREP_RESUME_HREF = "/resume-builder?view=document";
export const PREP_RESUME_NAME = "Fashion Buyer Resume";
export const PREP_RESUME_META = "Updated Sep 12 · 69/100 ATS";
/** The sample resume the file card shows when the student has not saved one
 *  yet: Jordan’s, the demo account. */
export const SAMPLE_RESUME = {
  profile: { firstName: "Jordan", lastName: "Rivera", email: "jordan.rivera@baruch.cuny.edu", phone: "(917) 555-0142", country: "United States", state: "New York", city: "Brooklyn", bio: "" },
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
  { from: "mentor", text: "Hi Jordan, I’m looking forward to our conversation about exploring careers.", when: "Mon 9:14 AM" },
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
  mentor: ["Ask what Jordan saved this week", "Offer to look at the resume before Tuesday", "Share one thing you wish you knew at that age", "Confirm Tuesday and send the link"],
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

/** The composer's plus menu: the mentorship actions live off the canvas.
 *  No file or photo attachments (direct feedback, 19 Sept 2026): a
 *  safeguarded student-adult conversation stays text, links and cards. */
export const COMPOSER_ACTIONS = [
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

/** One message that arrives while the demo runs, from the other side of
 *  the pair, so the dock's badge, tone and nudge can be seen working. */
export const INCOMING: Record<"mentee" | "mentor", string> = {
  mentee: "Just read your résumé draft. Strong bullets. Tuesday still good to go over it?",
  mentor: "Finished the Fashion Buyer sim, scored 82! Can we talk about the buying math on Tuesday?",
};
export const PRESENCE = { online: "Online", matched: "Matched" };
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
  // The summer touchpoint every US scholar gets (Tapestry call): Dream Day
  // at Coach, the signature conference of Dream It Real.
  { key: "jun", month: "June", title: "Dream Day at Coach", focus: "Meet your mentor in person at Coach headquarters.", note: "Coach Foundation's signature conference. Invitations go out in May.", state: "upcoming" },
];

/** Year two: mentor and mentee each say whether to continue together
 *  (Tapestry: "a puzzle piece phase" they do by hand today). */
export const REMATCH = { question: "Next year, continue with Avery?", options: ["Continue together", "Match me with someone new"], note: "Both of you answer in April. The program lead pairs everyone in September." } as const;

/** The mentor orientation every Coach mentor takes before the cohort starts
 *  (Tapestry: "best practices around mentorship... the do's and don'ts of
 *  working with a young person"). */
export const ORIENTATION = {
  title: "Mentor orientation",
  status: "Completed Sep 9 · 45 min",
  dos: ["Meet at least 3 to 4 times a year, monthly if you can", "Keep every conversation on Dreamari, never personal numbers or socials", "Ask about school and life before career", "Share your own path, including the detours"],
  donts: ["Never meet a scholar alone off campus or outside program hours", "Do not offer money, gifts or job promises", "Do not give medical, legal or mental health advice; escalate to the program lead"],
} as const;

export const NEXT_CONVERSATION = {
  head: "Jordan has been exploring:",
  prompt: "What helped you figure out what kind of work you wanted to try first?",
  cta: "Prepare for Meeting",
  prep: [
    "Jordan saved Fashion Buyer two weeks ago and played the Day-in-the-Life once.",
    "The resume draft has one experience and no bullet points yet.",
    "This month's topic is Explore Careers: aim to discuss one career in depth.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Enterprise

export type ProgramId = "all" | "us" | "uk" | "jp" | "cn";
export type ProgramStat = {
  id: Exclude<ProgramId, "all">;
  name: string;
  /** who sources the scholars (Tapestry: "How do you source your students? Through the nonprofit partners.") */
  via: string;
  students: number;
  mentors: number;
  mentorLabel: string;
  hours: number;
  cadence: string;
  window: string;
  /** hours logged per month, Jan to Sep */
  monthly: number[];
};

// Monthly hours rise through the year as pairs settle into a rhythm; the
// series are demo data and read upward on purpose (direct feedback, 18 Sept
// 2026: realistic, always positive).
export const PROGRAMS: ProgramStat[] = [
  { id: "us", name: "United States", via: "The Opportunity Network · Bottom Line", students: 450, mentors: 450, mentorLabel: "Mentors", hours: 8200, cadence: "3 to 4 meetings a year, most pairs monthly", window: "October to April, Dream Day in June", monthly: [620, 700, 790, 860, 900, 1010, 980, 1090, 1250] },
  { id: "uk", name: "United Kingdom", via: "SEO London", students: 35, mentors: 35, mentorLabel: "Mentors", hours: 1400, cadence: "Monthly", window: "October to April", monthly: [110, 120, 135, 145, 150, 165, 170, 190, 215] },
  { id: "jp", name: "Japan", via: "Katariba", students: 33, mentors: 33, mentorLabel: "Mentors", hours: 1100, cadence: "Monthly", window: "April to September", monthly: [60, 75, 90, 110, 125, 135, 150, 170, 185] },
  { id: "cn", name: "China", via: "China Youth Development Foundation", students: 1000, mentors: 18, mentorLabel: "Employee Contributors", hours: 7700, cadence: "Quarterly regional events", window: "1-year scholarship, no 1:1 matching", monthly: [560, 640, 720, 790, 850, 920, 980, 1060, 1180] },
];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"] as const;
/** The enterprise view reports on the calendar year, the way Tapestry rolls
 *  hours up to its 2030 goal; the student's year plan runs on the program
 *  year (October to June). Both are right, so the chart says which it is. */
export const REPORTING_NOTE = "Calendar year, the way Tapestry reports hours. The program year runs October to June.";

export type Kpi = { key: "hours" | "students" | "mentors" | "meetings"; label: string; year: number; month: number; deltaYear: number; deltaMonth: number; spark: number[] };
export const KPIS: Kpi[] = [
  { key: "hours", label: "Volunteer hours", year: 18400, month: 2200, deltaYear: 14, deltaMonth: 9, spark: [1350, 1535, 1735, 1905, 2025, 2230, 2280, 2510, 2830] },
  { key: "students", label: "Students", year: 1518, month: 1180, deltaYear: 9, deltaMonth: 4, spark: [1290, 1310, 1350, 1380, 1400, 1420, 1440, 1470, 1518] },
  { key: "mentors", label: "Mentors", year: 536, month: 418, deltaYear: 7, deltaMonth: 12, spark: [470, 476, 482, 488, 490, 494, 500, 512, 536] },
  { key: "meetings", label: "Mentor meetings", year: 3240, month: 386, deltaYear: 18, deltaMonth: 21, spark: [280, 300, 330, 350, 360, 380, 390, 410, 440] },
];

/** This month by week, instead of the Replit's single "M1" bar. */
export const THIS_MONTH_WEEKS = [640, 690, 720, 780];
/** This year by week, 16 weeks. */
export const THIS_YEAR_WEEKS = [920, 951, 981, 1012, 1043, 1073, 1104, 1135, 1165, 1196, 1227, 1257, 1288, 1319, 1349, 1380];

export const IMPACT = [
  { key: "explored", pct: 89, label: "Explored 3+ careers", delta: 6 },
  { key: "simulation", pct: 76, label: "Completed a simulation", delta: 11 },
  { key: "resume", pct: 68, label: "Built or updated a resume", delta: 9 },
  // Coach's own headline outcome (coach.com/content/coachfoundation).
  { key: "graduate", pct: 97, label: "On track to graduate", delta: 2 },
] as const;

/** The outcomes the partner reports on (Coach's published Dream It Real
 *  figures; Tapestry: "the way that we see success is the least amount of
 *  debt a student graduates with"). */
export const OUTCOMES = [
  { value: "88% less", label: "debt at graduation than the national average" },
  { value: "94%", label: "first-generation college students" },
] as const;

/** The US cohorts side by side, since the scholarship runs four years and
 *  impact has to read across them, not one year at a time (Tapestry: "we
 *  support the cohort over the 4 years of their college"). */
export type Cohort = { start: number; year: string; scholars: number; enrolled: number; meetingsAvg: number; explored: number; resume: number };
export const COHORTS: Cohort[] = [
  { start: 2026, year: "Year 1", scholars: 450, enrolled: 450, meetingsAvg: 0.8, explored: 71, resume: 44 },
  { start: 2025, year: "Year 2", scholars: 250, enrolled: 243, meetingsAvg: 3.9, explored: 92, resume: 78 },
  { start: 2024, year: "Year 3", scholars: 250, enrolled: 238, meetingsAvg: 4.2, explored: 96, resume: 88 },
  { start: 2023, year: "Year 4", scholars: 250, enrolled: 236, meetingsAvg: 3.6, explored: 97, resume: 93 },
];

/** Where matching stands right now (Tapestry: a recruitment cycle "just
 *  ended on Monday", then "the puzzle piece phase" of year-two rematching). */
export const MATCHING_STATUS = { recruitment: "Mentor recruitment closed Sep 15", signedUp: 512, matched: 450, waitlist: 62, rematchPending: 38, rematchContinue: 187 } as const;

/** How mentors are verified (Tapestry: "is there a verification process of
 *  that?"). Coach's employee roster is the source of truth, so a mentor can
 *  only be matched once the roster confirms them. */
export const VERIFICATION = { title: "Mentor verification", options: ["Company roster", "Program lead approves", "Dreamari ID check"], value: "Company roster", line: "Only employees on the Coach roster can be matched. Verified mentors carry the badge students see." } as const;

/** Where the mentors come from (Tapestry: about half corporate, half
 *  retail store teams) and how they feel about it. */
export const MENTOR_MIX = [{ label: "Corporate", value: 228 }, { label: "Retail stores", value: 222 }];
export const MENTOR_PULSE = { pct: 94, line: "of mentors would mentor again", quote: "This is the best part of working at Coach." };

/** Activity without reading a word: messages and meetings per pair turn into
 *  hours under the program's rules, and pairs that have gone quiet surface
 *  (Tapestry: "Julie has been messaging this person 15 times this month...
 *  it equates to this many volunteer hours"). */
export type PairActivity = { mentor: string; mentee: string; messages: number; meetings: number; hours: number; lastContact: string; quiet?: boolean };
export const PAIR_ACTIVITY: PairActivity[] = [
  { mentor: "Avery Thompson", mentee: "Jordan R.", messages: 15, meetings: 2, hours: 2.8, lastContact: "Today" },
  { mentor: "Julie Park", mentee: "Devon A.", messages: 22, meetings: 3, hours: 4.1, lastContact: "Yesterday" },
  { mentor: "Marcus Bell", mentee: "Priya S.", messages: 9, meetings: 2, hours: 2.5, lastContact: "4 days ago" },
  { mentor: "Dana Whitfield", mentee: "Theo L.", messages: 2, meetings: 0, hours: 0.1, lastContact: "34 days ago", quiet: true },
  { mentor: "Sam Okafor", mentee: "Zoe M.", messages: 0, meetings: 1, hours: 1, lastContact: "41 days ago", quiet: true },
];

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
