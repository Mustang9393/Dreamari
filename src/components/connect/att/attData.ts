// AT&T x Connected Learning Centers -- every string here is copied verbatim
import type { Pro } from "../data";
import { PARTNER_PORTRAITS } from "../primitives";
// from Joshua's Connect update on Replit (dceeai.replit.app/community-boards
// -> AT&T x Connected Learning Centers -> Enter Community, captured 17 Sept
// 2026; see docs/reference/joshua-connect-replit-2026-09). Content and copy
// are his; only the presentation is ours. Do not reword anything in this
// file without going back to the source.

export const ATT_ID = "att-connected-learning-centers";

export const ATT = {
  id: ATT_ID,
  eyebrow: "ACTIVE COMMUNITY",
  name: "AT&T × Connected Learning Centers",
  about: "A moderated career community connecting students with AT&T professionals and opportunities.",
  stats: [
    { value: "620", label: "Students" },
    { value: "54", label: "AT&T Professionals" },
    { value: "8", label: "Connected Learning Centers" },
  ],
  brand: {
    color: "#00A8E0",
    markWhite: "/images/connect/partners/att-white.png",
    markInk: "/images/connect/partners/att-ink.png",
    cover: "/images/connect/covers/att-connected-learning-center.jpg",
  },
} as const;

export const VIEWS = [
  { key: "student", label: "Student View" },
  { key: "volunteer", label: "Volunteer View" },
  { key: "enterprise", label: "Enterprise View" },
] as const;
export type AttView = typeof VIEWS[number]["key"];

export const STUDENT_TABS = [
  { key: "home", label: "Home" },
  { key: "questions", label: "Questions" },
  { key: "opportunities", label: "Opportunities" },
  { key: "people", label: "People" },
] as const;
export const VOLUNTEER_TABS = [
  { key: "home", label: "Home" },
  { key: "questions", label: "Questions" },
  { key: "share", label: "Share" },
  { key: "yearRound", label: "Year-Round Impact" },
] as const;
export const ENTERPRISE_TABS = [
  { key: "program", label: "Program" },
  { key: "impact", label: "Impact" },
  { key: "team", label: "Team" },
] as const;

// ——— people ———

// Portraits: the men are the three unused headshots from the team's own
// generated collection (Headshots/, same set as the current pro-* portraits);
// the women are from Connect's retired pre-Sept-2026 set (recovered from git
// history, shown nowhere else) until three more headshots arrive. No AT&T
// face repeats a current pro's; pros never wear the
// generated student avatars (direct feedback, 17 Sept 2026).
/** Flip to true to show ONLY what Joshua's Replit has: original first names,
 *  no opportunity details or signals, no poll tally, no counts on insight
 *  and answer actions, no openable profiles. Everything we added beyond the
 *  source is gated on this (see docs/reference/att-board-additions-2026-09-17.md). */
export const REPLIT_ONLY = false;

export type AttPro = { name: string; role: string; org: "AT&T"; photo: string };
/** Joshua's original first names, used when REPLIT_ONLY is on. */
const SOURCE_NAMES: Record<string, string> = { marcus: "Marcus Reed", jordan: "Jordan Lee", maya: "Maya Patel", andre: "Andre Johnson", elena: "Elena Rodriguez", amina: "Amina Thompson" };
const RENAMED_PROS: Record<string, AttPro> = {
  marcus: { name: "Terrence Reed", role: "Network Engineering Manager", org: "AT&T", photo: PARTNER_PORTRAITS["Terrence Reed"] },
  jordan: { name: "Calvin Lee", role: "Cybersecurity Analyst", org: "AT&T", photo: PARTNER_PORTRAITS["Calvin Lee"] },
  maya: { name: "Nisha Patel", role: "AI Product Manager", org: "AT&T", photo: PARTNER_PORTRAITS["Nisha Patel"] },
  andre: { name: "Dev Johnson", role: "Cloud Solutions Architect", org: "AT&T", photo: PARTNER_PORTRAITS["Dev Johnson"] },
  elena: { name: "Lucia Rodriguez", role: "Customer Experience Director", org: "AT&T", photo: PARTNER_PORTRAITS["Lucia Rodriguez"] },
  amina: { name: "Amina Thompson", role: "Technology Program Manager", org: "AT&T", photo: PARTNER_PORTRAITS["Amina Thompson"] },
};
export const ATT_PROS: Record<string, AttPro> = REPLIT_ONLY
  ? Object.fromEntries(Object.entries(RENAMED_PROS).map(([k, p]) => [k, { ...p, name: SOURCE_NAMES[k] ?? p.name }]))
  : RENAMED_PROS;

// ——— Student View ———

export const INSIGHTS_SECTION = { title: "Professional Insights", sub: "Advice from AT&T professionals." };
export const STUDENT_INSIGHTS = [
  { id: "att-i1", pro: "marcus", question: "How is AI changing your work?", quote: "AI helps our teams identify network issues faster, while communication and problem-solving matter more than ever.", helpful: 64, comments: 7 },
  { id: "att-i2", pro: "jordan", question: "What skill matters most in cybersecurity?", quote: "Curiosity matters. The strongest analysts keep asking why something happened and explain risk clearly to others.", helpful: 51, comments: 4 },
  { id: "att-i3", pro: "maya", question: "What surprised you most about working in AI?", quote: "The work is as much about understanding people and their needs as it is about building the technology.", helpful: 38, comments: 3 },
];
export const INSIGHT_ACTIONS = { like: "Like", comment: "Comment", ask: "Ask", commentPlaceholder: "Add a comment...", post: "Post" };

export const POLL = {
  eyebrow: "This Week",
  question: "Which skill will matter most in your future career?",
  options: ["Communication", "Technology", "Problem solving", "Leadership"],
  saved: "Your response is saved.",
  // Ours: the source shows no results. After voting the options become the
  // tally, the way Instagram's poll sticker flips to percentages.
  results: { Communication: 34, Technology: 31, "Problem solving": 22, Leadership: 13 } as Record<string, number>,
  responses: 148,
  answered: "students have answered",
};

export const HOME_OPPORTUNITIES = {
  title: "Opportunities for You",
  seeAll: "See all",
  items: [
    { id: "att-o-internship", kind: "Internship", title: "AT&T Technology Internship", line: "College sophomores" },
    { id: "att-o-summer", kind: "Program", title: "Summer Technology Exploration Program", line: "High school students · Virtual" },
    { id: "att-o-panel", kind: "Virtual Panel", title: "Inside AT&T Cybersecurity", line: "October 22 · Online" },
    { id: "att-o-careerday", kind: "Event", title: "Connected Learning Center Career Day", line: "Detroit, MI · November 14" },
  ],
};
export const SAVE = { save: "Save", saved: "Saved" };

// ——— Opportunity detail (ours; direct feedback, 17 Sept 2026: cards must
// open to something realistic, be addable to My Plan, and carry signals).
// Program descriptions are demo copy in AT&T's voice, to be replaced by the
// program's own text before anything ships.
export const OPPORTUNITY_UI = {
  interested: "interested",
  applied: "applied",
  registered: "registered",
  addPlan: "Add to My Plan",
  inPlan: "In My Plan",
  about: "About",
  who: "Who it's for",
  when: "When",
  where: "Where",
  how: "How to take part",
  note: "Applications and registration happen on AT&T's site.",
  open: "Applications open",
  soon: "Opening soon",
  registration: "Registration open",
  upcoming: "Upcoming",
  // one-word versions for the cards; the sheet uses the full ones
  short: { open: "Open", soon: "Soon", registration: "Open", upcoming: "Upcoming" },
  closes: "Closes",
  opens: "Opens",
  aboutFull: "About this opportunity",
  close: "Close",
};
export type OpportunityDetail = {
  about: string; who: string; when: string; where: string; how: string;
  status: "open" | "soon" | "registration" | "scheduled"; interested: number; applied?: number; registered?: number;
  /** Structured time, so dates render as a calendar tile, deadlines as a
   *  short chip and spans as "Jun to Aug" instead of a sentence (direct
   *  feedback, 17 Sept 2026: "dates, time can be represented better"). */
  date?: { month: string; day: number; time?: string };
  deadline?: { month: string; day: number };
  span?: string;
};
export const OPPORTUNITY_DETAILS: Record<string, OpportunityDetail> = {
  "att-o-internship": { about: "A 10-week paid summer internship inside one of AT&T's technology teams. Interns join a real product or network team, ship work that matters, and finish with a presentation to leadership and a mentor who stays in touch.", who: "College sophomores and juniors in computer science, engineering, information systems, or a related major.", when: "June to August · Applications close January 31", where: "Dallas, Atlanta, or remote, depending on team", how: "Apply through AT&T Careers with a résumé and a short statement. Selected students interview with two team members.", status: "open", interested: 312, applied: 47, span: "Jun to Aug", deadline: { month: "Jan", day: 31 } },
  "att-o-network-internship": { about: "Work alongside the engineers who plan, build, and monitor AT&T's network. Interns rotate through design, operations, and reliability, and leave understanding how a national network actually runs.", who: "College students in electrical engineering, computer engineering, networking, or telecommunications.", when: "June to August · Applications close February 15", where: "Dallas, TX, with some hybrid roles", how: "Apply through AT&T Careers. A short technical conversation follows for shortlisted students.", status: "open", interested: 186, applied: 29, span: "Jun to Aug", deadline: { month: "Feb", day: 15 } },
  "att-o-cyber-internship": { about: "Join AT&T's security teams to learn threat monitoring, incident response, and how risk is explained to the rest of the business. Interns pair with a security analyst for the summer.", who: "College sophomores in cybersecurity, computer science, or information assurance.", when: "June to August · Applications open March 1", where: "Dallas or Atlanta", how: "Applications open on AT&T Careers in March. Add it to My Plan to be reminded the week they open.", status: "soon", interested: 241, span: "Jun to Aug", date: { month: "Mar", day: 1 } },
  "att-o-summer": { about: "A four-week virtual program where high school students explore technology careers with AT&T professionals: weekly live sessions, small-group projects, and a final showcase.", who: "High school students in grades 9 to 12. No prior experience needed.", when: "July · Two sessions a week · Registration closes May 30", where: "Virtual", how: "Register through your Connected Learning Center or directly on the program page.", status: "registration", interested: 428, registered: 96, span: "July", deadline: { month: "May", day: 30 } },
  "att-o-futures": { about: "A summer cohort program for students at Connected Learning Centers: career exploration, digital skills, and a mentor from AT&T for the whole summer.", who: "Students in grades 10 to 12 who attend a partner Connected Learning Center.", when: "June to August", where: "At your Connected Learning Center, with virtual sessions", how: "Ask your center coordinator to nominate you. Nominations open in April.", status: "scheduled", interested: 203, span: "Jun to Aug" },
  "att-o-discovery": { about: "Short, self-paced career discovery modules built with AT&T teams: what the roles are, what a week looks like, and which skills to start on now.", who: "Any student. Works well alongside Dreamari's Explore.", when: "Anytime · New modules each quarter", where: "Online", how: "Register once and complete modules at your own pace.", status: "registration", interested: 517, registered: 164, span: "Anytime" },
  "att-o-panel": { about: "A live panel with AT&T cybersecurity professionals on how they got started, what a normal day looks like, and what they would study now. Student questions run the second half.", who: "Students interested in security, technology, or problem solving.", when: "October 22 · 4:00 to 5:00 PM ET", where: "Online · Link shared after registration", how: "Register here. A recording is shared with registrants afterward.", status: "registration", interested: 274, registered: 118, date: { month: "Oct", day: 22, time: "4 to 5 PM ET" } },
  "att-o-careerday": { about: "An in-person career day at the Detroit Connected Learning Center: meet AT&T professionals across network, technology, and customer roles, try hands-on demos, and get résumé feedback.", who: "Students at Detroit-area Connected Learning Centers and their families.", when: "November 14 · 10:00 AM to 2:00 PM", where: "Detroit Connected Learning Center, Detroit, MI", how: "Register through your center. Walk-ins are welcome while space lasts.", status: "registration", interested: 156, registered: 71, date: { month: "Nov", day: 14, time: "10 AM to 2 PM" } },
  "att-o-office": { about: "A half-day visit to AT&T's Dallas offices to see the teams behind the network: a network operations tour, a conversation with engineers, and lunch with early-career employees.", who: "College students in technology and engineering majors. Seats are limited.", when: "Spring · Date confirmed to registrants", where: "Dallas, TX", how: "Request a seat here. Confirmed students receive travel details by email.", status: "registration", interested: 98, registered: 24, span: "Spring" },
  "att-o-workshop": { about: "A hands-on virtual workshop on technology career paths at AT&T: how roles connect, which skills transfer, and how to read a job description like a recruiter.", who: "High school and college students.", when: "December 4 · 5:00 to 6:30 PM ET", where: "Virtual", how: "Register here. Materials are shared the day before.", status: "registration", interested: 189, registered: 63, date: { month: "Dec", day: 4, time: "5 to 6:30 PM ET" } },
  "att-o-scholarship": { about: "A scholarship for high school seniors pursuing technology or engineering degrees, awarded through the Connected Learning Center network. Recipients also receive an AT&T mentor for their first year of college.", who: "High school seniors connected to a Connected Learning Center, planning to study a technology or engineering field.", when: "Apply by January 12 · Awards announced in April", where: "Nationwide", how: "Apply with a transcript, one recommendation, and a short essay. Your center coordinator can help.", status: "open", interested: 342, applied: 58, deadline: { month: "Jan", day: 12 } },
  "att-o-shadow": { about: "Spend a day with AT&T's network operations team: watch how outages are found and fixed, sit in on a shift handoff, and see how the network is monitored around the clock.", who: "College students in networking, engineering, or computer science.", when: "Spring · Dates offered by region", where: "Regional network operations centers", how: "Request a day here. Matched students are contacted by the hosting team.", status: "registration", interested: 121, registered: 33, span: "Spring" },
  "att-o-hackathon": { about: "A weekend innovation challenge for student teams: build a prototype that helps communities stay connected, with AT&T engineers as coaches and a final pitch to a judging panel.", who: "Teams of 2 to 4 high school or college students.", when: "Spring weekend · Registration open now", where: "Virtual with regional finals", how: "Register your team here. Solo students can be matched to a team.", status: "registration", interested: 265, registered: 88, span: "Spring weekend" },
};

export const ASK = {
  eyebrow: "Ask AT&T Professionals",
  placeholder: "What would you like to know?",
  cta: "Ask",
  submitted: "Question submitted for moderation",
  again: "Ask another",
};
export const RECENT_ANSWERS = {
  eyebrow: "Recent Answers",
  read: "Read answer",
  hide: "Hide answer",
  more: "Show more",
  less: "Show less",
  // the first two show by default; Show more reveals the third
  items: [
    { id: "att-q1", question: "What should I learn now if I want to work in cybersecurity?", pro: "jordan", answer: "Build strong technology fundamentals, practice explaining how you solve problems, and start with small security projects.", helpful: 112, comments: 9 },
    { id: "att-q2", question: "What surprised you most when you started working in technology?", pro: "marcus", answer: "The best work is rarely done alone. Clear questions and thoughtful collaboration make a bigger difference than having every answer.", helpful: 86, comments: 5 },
    { id: "att-q3", question: "What skills matter most in network engineering?", pro: "andre", answer: "Strong fundamentals matter, but curiosity, careful troubleshooting, and clear communication are what help teams solve real network problems.", helpful: 74, comments: 6 },
  ],
};

export const OPPORTUNITY_GROUPS = [
  {
    title: "Internships",
    items: [
      { id: "att-o-internship", kind: "Internship", title: "AT&T Technology Internship", line: "College sophomores · Applications open" },
      { id: "att-o-network-internship", kind: "Internship", title: "Network Engineering Internship", line: "College students · Applications open" },
      { id: "att-o-cyber-internship", kind: "Internship", title: "Cybersecurity Internship", line: "College sophomores · Opening soon" },
    ],
  },
  {
    title: "Programs",
    items: [
      { id: "att-o-summer", kind: "Program", title: "Summer Technology Exploration Program", line: "High school students · Virtual" },
      { id: "att-o-futures", kind: "Program", title: "Connected Futures Program", line: "Grades 10–12 · Summer" },
      { id: "att-o-discovery", kind: "Program", title: "Career Discovery Program", line: "Students · Registration open" },
    ],
  },
  {
    title: "Events & Panels",
    items: [
      { id: "att-o-panel", kind: "Virtual Panel", title: "Inside AT&T Cybersecurity", line: "October 22 · Online" },
      { id: "att-o-careerday", kind: "Career Day", title: "Connected Learning Center Career Day", line: "Detroit · November 14" },
      { id: "att-o-office", kind: "Office Visit", title: "Careers Behind the Network", line: "Dallas · Limited seats" },
      { id: "att-o-workshop", kind: "Workshop", title: "Technology Careers Workshop", line: "Virtual · December 4" },
    ],
  },
  {
    title: "Scholarships & More",
    items: [
      { id: "att-o-scholarship", kind: "Scholarship", title: "Connected Learning Scholarship", line: "High school seniors · Apply by January 12" },
      { id: "att-o-shadow", kind: "Job Shadow", title: "Network Operations Job Shadow", line: "College students · Spring" },
      { id: "att-o-hackathon", kind: "Hackathon", title: "AT&T Student Innovation Challenge", line: "Teams of 2–4 · Registration open" },
    ],
  },
];

// Row titles and sizes are the source's; the people in each row were spread
// out so nobody appears in all three (direct feedback, 17 Sept 2026: "don't
// repeat people too much"). The source repeats Marcus and Jordan in every row.
export const PEOPLE_ROWS = [
  { title: "Recommended for You", pros: ["marcus", "jordan", "maya"] },
  { title: "Most Active", pros: ["andre", "elena", "amina", "marcus"] },
  { title: "Technology & Engineering", pros: ["jordan", "andre", "amina"] },
];
export const FOLLOW = { follow: "Follow", following: "Following" };

// ——— Volunteer View ———

export const VOLUNTEER_HOME = {
  title: "What should I do right now?",
  topic: "AI & Future of Work",
  prompt: "Share how AI is showing up in your work.",
  cta: "Answer prompt",
  placeholder: "Share what students should know...",
  submit: "Submit answer",
  cancel: "Cancel",
  footer: "23 students engaged this month.",
};
export const QUESTIONS_WAITING = {
  title: "Questions waiting",
  sub: "Answer what you know.",
  answer: "Answer",
  placeholder: "Share your experience...",
  send: "Send answer",
  more: "View more questions",
  fewer: "Show fewer questions",
  // the first two show by default; View more reveals the rest
  items: [
    "What should I learn now if I want to work in cybersecurity?",
    "What surprised you most about your first year at AT&T?",
    "What skills matter most in network engineering?",
    "How did you choose your first role in technology?",
  ],
};
export const SHARE = {
  title: "What would you like to share?",
  back: "Back",
  insight: {
    kind: "Insight",
    line: "Advice or trends students should know.",
    cta: "Share insight",
    heading: "Share an insight",
    question: "What would you like students to know?",
    chips: ["What is changing in your industry?", "What skill matters most?", "What do students misunderstand about your career?"],
    placeholder: "What would you like students to know?",
    post: "Post insight",
  },
  opportunity: {
    kind: "Opportunity",
    line: "Internships, events, programs, or panels.",
    cta: "Share opportunity",
    heading: "Share an opportunity",
    chooseType: "Choose type",
    types: ["Internship", "Program", "Virtual Panel", "Office Visit", "Event", "Scholarship"],
    placeholder: "Add a short description or link...",
    post: "Share opportunity",
  },
};
export const SUBMITTED = "Submitted for moderation";

export type PeriodCard = { key: string; period: string; theme: string; prompt: string; students: string; cta: "Answer Prompt" | "Share Insight" };
export const YEAR_ROUND = {
  title: "Year-Round Impact",
  sub: "Stay connected with students all year.",
  cadence: [{ key: "monthly", label: "Monthly" }, { key: "biweekly", label: "Biweekly" }] as const,
  answer: "Answer Prompt",
  submit: "Submit",
  cancel: "Cancel",
  fullYear: "View full year",
  hideYear: "Hide full year",
  monthly: [
    { key: "sep", period: "September", theme: "Back to School + Career Access", prompt: "Share one thing you wish you knew before your first job.", students: "Students are choosing the careers they want to explore this year.", cta: "Answer Prompt" },
    { key: "oct", period: "October", theme: "AI & Future of Work", prompt: "Share one way AI is changing your work.", students: "Students are exploring how AI may affect their future careers.", cta: "Share Insight" },
    { key: "nov", period: "November", theme: "Careers Behind AT&T", prompt: "Introduce students to a role they may not know exists.", students: "Students are discovering different career paths inside AT&T.", cta: "Share Insight" },
    { key: "dec", period: "December", theme: "Advice Worth Keeping", prompt: "Share one career lesson you hope students remember.", students: "Students will save their favorite advice for their career plans.", cta: "Answer Prompt" },
  ] as PeriodCard[],
  biweekly: [
    { key: "sep1", period: "Sep 1–15", theme: "Welcome + Career Access", prompt: "Share one thing you wish you knew before your first job.", students: "Students are choosing careers they want to explore this year.", cta: "Answer Prompt" },
    { key: "sep16", period: "Sep 16–30", theme: "Skills + Student Pulse", prompt: "Share the skill that matters most in your role today.", students: "Students are choosing the skills and careers they want to explore next.", cta: "Answer Prompt" },
    { key: "oct1", period: "Oct 1–15", theme: "AI at Work", prompt: "Show students one way AI is changing your job.", students: "Students are learning where AI is appearing across different careers.", cta: "Share Insight" },
    { key: "oct16", period: "Oct 16–31", theme: "Future Skills", prompt: "Share one skill students can practice for an AI-enabled workplace.", students: "Students are identifying the future skills that interest them most.", cta: "Share Insight" },
  ] as PeriodCard[],
  year: [
    ["September", "Back to School + Career Access"],
    ["October", "AI & Future of Work"],
    ["November", "Careers Behind AT&T"],
    ["December", "Advice Worth Keeping"],
    ["January", "Internships & Applications"],
    ["February", "Networking + Employee Groups"],
    ["March", "Hackathons + Skill Building"],
    ["April", "Panels + Career Conversations"],
    ["May", "Summer Readiness"],
    ["June", "Student Pulse"],
    ["July", "Career Inspiration"],
    ["August", "New Year Reset"],
  ] as [string, string][],
};

// ——— Enterprise View ———

export type TopicSource = "dreamari" | "att" | "school";
export const TOPIC_SOURCES: { key: TopicSource; name: string; sub: string }[] = [
  { key: "dreamari", name: "Dreamari", sub: "Suggested automatically" },
  { key: "att", name: "AT&T", sub: "Your team chooses" },
  { key: "school", name: "School Partner", sub: "Educators choose" },
];

export type ProgramPeriod = {
  key: string;
  period: string;
  theme: string;
  /** which source the demo lands on for this period */
  defaultSource: TopicSource;
  dreamari: { topic: string; employees: string; students: string; selected: boolean };
  att: { topic: string; volunteer: string; student: string; saved: boolean };
  school: { topic: string; by: string; employee: string; student: string };
};
const DREAMARI_AI = { topic: "AI & Future of Work", employees: "How is AI changing your role?", students: "Which AI-related career interests you most?" };
const SCHOOL_BY = "Suggested by Detroit Connected Learning Center";
// The AT&T fields on the biweekly periods all carry the same two prompts in
// the source; the topic field carries the period's own theme.
const attBiweekly = (topic: string) => ({ topic, volunteer: "How is your work changing?", student: "Which career interests you most?", saved: false });

export const PROGRAM = {
  title: "Community Program",
  sub: "Plan how AT&T stays connected with students.",
  autopilot: { label: "Auto-pilot", sub: "Dreamari fills unscheduled periods." },
  topicSource: "Topic source",
  labels: {
    dreamari: "Dreamari suggestion",
    att: "AT&T topic",
    school: "School partner topic",
    employees: "Prompt for employees:",
    students: "Prompt for students:",
    volunteer: "Volunteer activity:",
    student: "Student activity:",
    employee: "Employee prompt:",
    schoolStudent: "Student activity:",
  },
  actions: { selected: "Topic selected", use: "Use This Topic", another: "Suggest Another", save: "Save", edit: "Edit Topic", saved: "Saved", approve: "Approve", editShort: "Edit" },
  fields: { topic: "Enter topic", volunteer: "What should employees respond to?", student: "What should students explore or answer?" },
  monthly: [
    { key: "sep", period: "September", theme: "Back to School + Career Access", defaultSource: "dreamari", dreamari: { ...DREAMARI_AI, selected: true }, att: { topic: "Back to School + Career Access", volunteer: "What do you wish you knew before your first job?", student: "Which career do you want to explore?", saved: false }, school: { topic: "Back to School + Career Access", by: SCHOOL_BY, employee: "What do you wish you knew before your first job?", student: "Which career do you want to explore?" } },
    { key: "oct", period: "October", theme: "AI & Future of Work", defaultSource: "att", dreamari: { ...DREAMARI_AI, selected: false }, att: { topic: "Careers Behind AT&T", volunteer: "How is AI changing your role?", student: "Explore AI-related careers", saved: true }, school: { topic: "Careers Behind AT&T", by: SCHOOL_BY, employee: "How is AI changing your role?", student: "Explore AI-related careers" } },
    { key: "nov", period: "November", theme: "Careers Behind AT&T", defaultSource: "school", dreamari: { ...DREAMARI_AI, selected: false }, att: { topic: "Career Readiness Month", volunteer: "What skill has helped you most professionally?", student: "Ask one professional about that skill.", saved: false }, school: { topic: "Career Readiness Month", by: SCHOOL_BY, employee: "What skill has helped you most professionally?", student: "Ask one professional about that skill." } },
    { key: "dec", period: "December", theme: "Advice Worth Keeping", defaultSource: "dreamari", dreamari: { topic: "Skills That Matter", employees: "Which skill has mattered most in your career?", students: "Which skill do you want to build next?", selected: true }, att: { topic: "Advice Worth Keeping", volunteer: "Which career lesson has stayed with you?", student: "Save one piece of advice for your career plan.", saved: false }, school: { topic: "Advice Worth Keeping", by: SCHOOL_BY, employee: "Which career lesson has stayed with you?", student: "Save one piece of advice for your career plan." } },
  ] as ProgramPeriod[],
  biweekly: [
    { key: "sep1", period: "Sep 1–15", theme: "Welcome + Career Access", defaultSource: "dreamari", dreamari: { ...DREAMARI_AI, selected: false }, att: attBiweekly("Welcome + Career Access"), school: { topic: "Welcome + Career Access", by: SCHOOL_BY, employee: "How is your work changing?", student: "Which career interests you most?" } },
    { key: "sep16", period: "Sep 16–30", theme: "Skills + Student Pulse", defaultSource: "dreamari", dreamari: { ...DREAMARI_AI, selected: false }, att: attBiweekly("Skills + Student Pulse"), school: { topic: "Skills + Student Pulse", by: SCHOOL_BY, employee: "How is your work changing?", student: "Which career interests you most?" } },
    { key: "oct1", period: "Oct 1–15", theme: "AI at Work", defaultSource: "dreamari", dreamari: { ...DREAMARI_AI, selected: false }, att: attBiweekly("AI at Work"), school: { topic: "AI at Work", by: SCHOOL_BY, employee: "How is your work changing?", student: "Which career interests you most?" } },
    { key: "oct16", period: "Oct 16–31", theme: "Future Skills", defaultSource: "dreamari", dreamari: { ...DREAMARI_AI, selected: false }, att: attBiweekly("Future Skills"), school: { topic: "Future Skills", by: SCHOOL_BY, employee: "How is your work changing?", student: "Which career interests you most?" } },
  ] as ProgramPeriod[],
};

export const IMPACT = {
  title: "Community Impact",
  sub: "A clear view of AT&T’s community contribution.",
  range: [{ key: "month", label: "This Month" }, { key: "year", label: "This Year" }] as const,
  tiles: [
    { key: "students", value: "620", label: "Students Reached" },
    { key: "volunteers", value: "54", label: "AT&T Volunteers" },
    { key: "views", value: "48.2K", label: "Content Views" },
    { key: "answered", value: "286", label: "Questions Answered" },
    { key: "hours", value: "174", label: "Volunteer Hours" },
    { key: "opportunities", value: "37", label: "Opportunities Shared" },
  ],
  trend: {
    eyebrow: "Impact trend",
    metrics: [{ key: "reached", label: "Students Reached" }, { key: "views", label: "Views" }, { key: "engagements", label: "Engagements" }] as const,
    months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    // Only the line's shape is shown in the source (no data labels); these
    // series reproduce that rising curve ending on the headline totals.
    series: {
      reached: [180, 240, 310, 400, 500, 620],
      views: [12400, 17800, 24100, 31500, 39800, 48200],
      engagements: [640, 890, 1210, 1580, 1990, 2460],
    } as Record<string, number[]>,
  },
  employee: {
    eyebrow: "Employee impact",
    lines: ["54 employees contributed", "174 volunteer hours", "286 questions answered", "48.2K content views"],
    cta: "View Team Impact",
  },
};

export const TEAM = {
  title: "AT&T Volunteers",
  sub: "See who is contributing to the community.",
  topEyebrow: "Top contributors",
  top: [
    { pro: "marcus", reached: "12.8K", answers: 31, hours: 14 },
    { pro: "jordan", reached: "9.4K", answers: 24, hours: 11 },
    { pro: "maya", reached: "7.8K", answers: 19, hours: 9 },
  ],
  topLabels: { reached: "reached", answers: "answers", hours: "hours" },
  rosterTitle: "All Volunteers",
  filters: [{ key: "all", label: "All" }, { key: "active", label: "Most Active" }, { key: "needs", label: "Needs Engagement" }] as const,
  columns: ["Name", "Role", "Activity", "Students Reached", "Hours"],
  roster: [
    { pro: "marcus", activity: "Active this week", reached: "12.8K", hours: 14 },
    { pro: "jordan", activity: "Active this week", reached: "9.4K", hours: 11 },
    { pro: "maya", activity: "Active this month", reached: "7.8K", hours: 9 },
    { pro: "elena", activity: "Active this month", reached: "4.2K", hours: 7 },
    { pro: "andre", activity: "Needs engagement", reached: "2.8K", hours: 5 },
    { pro: "amina", activity: "Needs engagement", reached: "2.1K", hours: 4 },
  ],
  footer: {
    eyebrow: "AT&T community impact",
    stats: [{ value: "54", label: "Volunteers" }, { value: "620", label: "Students" }, { value: "174", label: "Hours" }],
    cta: "Download Impact Summary",
  },
};

export const BACK = "Back to communities";

// ——— Full profiles (ours). The six AT&T professionals open the same
// profile page every other professional has (direct feedback, 17 Sept 2026);
// these records fill that page. Positive, career-story copy only.
const V = "Work email verified by Dreamari · Sep 2026";
const rec = (key: string, extra: Omit<Pro, "id" | "name" | "role" | "org" | "verifiedBy" | "world">): Pro => ({ id: `att-${key}`, name: ATT_PROS[key].name, role: ATT_PROS[key].role, org: "AT&T", verifiedBy: V, world: "Tech & Engineering", ...extra });
export const ATT_PRO_RECORDS: Record<string, Pro> = {
  marcus: rec("marcus", { scope: "Network engineering careers", field: "Network Engineering", story: "I started as a field technician climbing towers. Fifteen years later I lead the team that keeps a region's network running, and the instinct I still use most is asking what the customer is actually experiencing.", followers: 412, studentsReached: 6280, totalLikes: 1140, questionsAnswered: 31, activeDaysAgo: 1, education: "B.S. Electrical Engineering, University of Texas at Dallas", journey: "Field technician, then network operations, then a decade of engineering roles before leading a regional team.", topics: ["Network engineering", "Field technician paths", "Leadership", "Internships"] }),
  jordan: rec("jordan", { scope: "Cybersecurity careers", field: "Cybersecurity", story: "I got into security through capture-the-flag competitions in college. Now I spend my days finding problems before anyone else does, and explaining risk to people who have never written a line of code.", followers: 358, studentsReached: 5140, totalLikes: 986, questionsAnswered: 24, activeDaysAgo: 2, education: "B.S. Computer Science, Georgia State University", journey: "Campus security club, an internship in a security operations center, then analyst roles with growing scope.", topics: ["Cybersecurity", "Competitions", "Certifications", "Internships"] }),
  maya: rec("maya", { scope: "AI and product management careers", field: "Product Management", story: "I studied psychology first and came to technology through user research. Product management turned out to be the job where understanding people and understanding systems are the same skill.", followers: 296, studentsReached: 4410, totalLikes: 812, questionsAnswered: 19, activeDaysAgo: 3, education: "B.A. Psychology, University of Michigan; M.S. Human-Computer Interaction, Georgia Tech", journey: "User researcher, then associate product manager, now leading AI product work.", topics: ["Product management", "AI careers", "User research", "Career switches"] }),
  andre: rec("andre", { scope: "Cloud and infrastructure careers", field: "Cloud Architecture", story: "My first job was fixing computers at a repair shop. Cloud architecture is the same instinct at a much bigger scale: understand how the pieces fit, then design something that keeps working when one of them fails.", followers: 231, studentsReached: 3720, totalLikes: 640, questionsAnswered: 16, activeDaysAgo: 4, education: "B.S. Information Systems, University of Houston", journey: "Repair shop, systems administrator, cloud engineer, now designing platforms teams build on.", topics: ["Cloud computing", "Systems", "Certifications", "First jobs"] }),
  elena: rec("elena", { scope: "Customer experience and operations careers", field: "Customer Experience", story: "I started in a call center in college. Every role since has been about the same question: what would make this easier for the person on the other end? Now I lead teams that answer it at scale.", followers: 274, studentsReached: 4020, totalLikes: 705, questionsAnswered: 21, activeDaysAgo: 2, education: "B.B.A. Management, Florida International University", journey: "Call center agent, team lead, operations manager, now a director of customer experience.", topics: ["Customer experience", "Operations", "Leadership", "Career growth"] }),
  amina: rec("amina", { scope: "Technology program management careers", field: "Program Management", story: "I am the person who makes sure fifty moving parts land on the same day. Program management is for people who like both the plan and the people, and I found it through an internship I almost did not apply for.", followers: 203, studentsReached: 3150, totalLikes: 548, questionsAnswered: 14, activeDaysAgo: 5, education: "B.S. Industrial Engineering, North Carolina A&T State University", journey: "Engineering internship, project coordinator, program manager on network rollouts, now leading technology programs.", topics: ["Program management", "Internships", "Engineering", "Organization"] }),
};
