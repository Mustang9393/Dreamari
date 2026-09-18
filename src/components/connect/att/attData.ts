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
  // Banner copy stays the source's, word for word (direct feedback, 18
  // Sept 2026: "do not expand on the copy in the banner").
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

// Four student tabs: Learn is the virtual launchpad the AT&T report asks
// for; People folded into Ask (the people worth following are the ones who
// answer). Volunteers get a time-boxed Today and their own impact instead
// of a calendar; the enterprise view opens on Impact.
export const STUDENT_TABS = [
  { key: "home", label: "Home" },
  { key: "learn", label: "Learn" },
  { key: "questions", label: "Ask" },
  { key: "opportunities", label: "Opportunities" },
  { key: "people", label: "People" },
] as const;
export const VOLUNTEER_TABS = [
  { key: "home", label: "Today" },
  { key: "questions", label: "Questions" },
  { key: "share", label: "Share" },
  { key: "yearRound", label: "Impact" },
] as const;
export const ENTERPRISE_TABS = [
  { key: "impact", label: "Impact" },
  { key: "program", label: "Program" },
  { key: "team", label: "Team" },
] as const;

// ——— the one program theme every view reads (fixes the source's drift
// between the student poll, the volunteer prompt and the planner) ———
export const THEME = {
  eyebrow: "AT&T theme",
  month: "September",
  theme: "Back to School + Career Access",
  // the planner's "Students see" line, as something a student can do now.
  // With picks saved (the usual case), the card speaks to them instead of
  // asking the student to choose again (direct feedback, 18 Sept 2026).
  student: "Pick the careers you'll explore this year.",
  explore: "Explore careers",
  exploreHref: "/explore",
  // Career Access is the theme; "exploring careers" is the signal AT&T
  // asked for, so the card says it and shows the student's own picks
  withPicks: "You're exploring",
  plan: "Open My Plan",
  planHref: "/profile?tab=plan",
  ask: "Ask a pro",
  volunteer: "Share one thing you wish you knew before your first job.",
};

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

/** The student pulse: one question per period, set in the Program planner
 *  (the biweekly "Skills + Student Pulse" period). Answering pays XP and
 *  picks the student's next module; the same answers show volunteers what
 *  students care about (Today) and AT&T how the month is landing (Impact). */
export const POLL = {
  eyebrow: "Weekly pulse · Sep 15 to 21",
  cadence: "New question every Monday · +5 XP",
  question: "Which skill matters most for your future?",
  options: ["Communication", "Technology", "Problem solving", "Leadership"],
  saved: "Saved",
  xp: 5,
  nextLabel: "Next for you",
  next: { Communication: "l-calls", Technology: "l-internet", "Problem solving": "l-defender", Leadership: "l-roles" } as Record<string, string>,
  // Ours: the source shows no results. After voting the options become the
  // tally, the way Instagram's poll sticker flips to percentages.
  results: { Communication: 34, Technology: 31, "Problem solving": 22, Leadership: 13 } as Record<string, number>,
  responses: 148,
  answered: "students have answered",
};
export const PULSE = {
  volunteer: "Students this month: Communication leads at 34%.",
  enterprise: "Student pulse",
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
/** Something to choose on: how many questions each professional has
 *  answered here (the source's tiles carried nothing but a name). */
export const ANSWER_COUNTS: Record<string, number> = { marcus: 31, jordan: 24, maya: 19, elena: 14, andre: 11, amina: 8 };
export const PEOPLE_ANSWER = { answers: "answers" };

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
/** Time-boxed asks matched to the volunteer (the report's "structured,
 *  time-bounded micro-volunteering"). Accepting one counts toward hours. */
export const REQUESTS = {
  title: "Requests for you",
  sub: "Matched to you. Each fits in a break.",
  accept: "Accept",
  accepted: "Accepted",
  acceptedLine: "Added to your hours",
  minutes: "min",
  defaultResume: "Jordan Rivera's résumé",
  items: [
    { id: "r0", kind: "Tutoring", title: "Algebra II homework help, a 9th grader in Detroit", minutes: 30, why: "Requested 4 min ago · online" },
    { id: "r1", kind: "Question", title: "A 10th grader in Ohio asks what to learn now for cybersecurity", minutes: 10, why: "Matches your role" },
    // {resume} is the student's latest saved résumé name when one exists
    { id: "r2", kind: "Résumé review", title: "Review {resume} for the Technology Internship", minutes: 20, why: "Applying this month" },
    { id: "r3", kind: "Live session", title: "Take student questions at Inside AT&T Cybersecurity", minutes: 45, why: "Oct 22 · 4 PM ET · Online" },
  ],
};
/** Closing the loop: what happened to the answers a volunteer already gave. */
export const YOUR_ANSWERS = {
  title: "Your answers",
  summary: "4 answers this month · read 312 times",
  reads: "reads",
  live: "Live in Recent Answers",
  items: [
    { question: "What should I learn now if I want to work in cybersecurity?", reads: 186, helpful: 112, when: "3d ago" },
    { question: "What skills matter most in network engineering?", reads: 126, helpful: 74, when: "1w ago" },
  ],
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
    chips: ["What is changing in your industry?", "What skill matters most?", "What do you wish students knew about your career?"],
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

/** The volunteer's own year (replaces the calendar-first Year-Round tab; the
 *  calendar stays, collapsed, under it). Hours by month read upward. */
export const MY_IMPACT = {
  title: "My Impact",
  sub: "Your year with students, in one place.",
  tiles: [
    { key: "hours", value: "14", label: "Hours this year" },
    { key: "answers", value: "31", label: "Answers" },
    { key: "reads", value: "12.8K", label: "Reads" },
    { key: "students", value: "26", label: "Students helped" },
  ],
  hoursEyebrow: "Hours by month",
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  hours: [0, 1, 1, 1, 2, 2, 2, 2, 3],
  believes: "Synced to AT&T Believes · Volunteers Network",
  rewards: { eyebrow: "Believes Volunteer Rewards", logged: 14, target: 25, pace: 12, unit: "hours", line: "25 hours unlocks a $1,000 grant to the nonprofit you choose." },
  studentsEyebrow: "Students you have helped",
  students: [
    { name: "Jordan Rivera", what: "Résumé review", when: "Sep" },
    { name: "Priya", what: "Cybersecurity question", when: "Sep" },
    { name: "Marcus", what: "Career fair question", when: "Aug" },
    { name: "Sana", what: "Network engineering question", when: "Jun" },
  ],
  calendar: "Program calendar",
  hideCalendar: "Hide calendar",
};

/** The Learn tab: AT&T's free, virtual learning partners as modules a
 *  student can finish from anywhere. Progress banks XP like the rest of
 *  the app. Provider names are real (The Achievery, DigitalLearn); module
 *  titles and copy are demo text until the partners supply their own. */
export type LearnModule = { id: string; title: string; minutes: number; xp: number; career: string; /** the résumé skill a finished unit banks in Dreamari */ skill: string; /** the Dreamari world the career sits in; empty for modules every career needs */ world: string; progress: number; about: string; steps: string[]; /** an app feature the module hands off to */ link?: { label: string; href: string } };
export const LEARN = {
  title: "Learn",
  sub: "Free. Virtual. Every module banks XP.",
  // Units live on AT&T's platforms and open there; Dreamari holds the plan
  // and the progress (direct decision, 18 Sept 2026: import, never replicate)
  opens: "Opens in",
  sync: "Progress syncs from your account",
  start: "Open unit",
  resume: "Continue unit",
  done: "Completed",
  continueEyebrow: "Continue learning",
  seeAll: "See all",
  sheet: { about: "About", steps: "You'll", counts: "Counts toward", plan: "Add to My Plan", inPlan: "In My Plan", minutes: "min", xp: "XP", progress: "Progress" },
  xpMilestone: "Module progress",
  fits: "Fits your picks",
  // what a finished unit turns into here: a résumé skill, a plan step, a
  // question to a pro. The unit opens on AT&T's platform; the value stays.
  bank: { eyebrow: "Bank it in Dreamari", resume: "Add to résumé skills", onResume: "On your résumé", ask: "Ask an AT&T pro about this", resumeToast: "Added to your résumé skills", resumeFull: "Tech skills are full on your résumé. Swap one in Resume Builder." },
  groups: [
    {
      provider: "The Achievery",
      href: "https://www.theachievery.com/en",
      line: "Free · K to 12",
      modules: [
        { id: "l-internet", skill: "Network fundamentals", world: "Tech & Engineering", title: "How the Internet Actually Works", minutes: 20, xp: 15, career: "Network Engineer", progress: 60, about: "Follow one message from your phone to a server and back.", steps: ["Trace one request across the network", "Spot the three places it can slow down", "Meet the roles that fix each one"] },
        { id: "l-defender", skill: "Security awareness", world: "Tech & Engineering", title: "Cybersecurity: Think Like a Defender", minutes: 25, xp: 20, career: "Cybersecurity Analyst", progress: 0, about: "Spot an attack in progress and decide what to do first.", steps: ["Read an alert the way an analyst does", "Decide what to check first", "Write a two-line summary for your manager"] },
        { id: "l-ai", skill: "AI literacy", world: "Tech & Engineering", title: "AI in Everyday Life", minutes: 15, xp: 15, career: "AI Product Manager", progress: 100, about: "Where AI already shows up in your day, and what a PM asks before shipping it.", steps: ["Find five AI moments in your day", "Sort them into helpful and risky", "Pitch one improvement"] },
        { id: "l-roles", skill: "Career research", world: "Tech & Engineering", title: "Careers Behind the Network", minutes: 15, xp: 15, career: "Network Engineering Manager", progress: 0, about: "Six roles you've never heard of, and what a week looks like in each.", steps: ["Match six roles to what they do", "Pick the two that fit you", "Save them to Explore"] },
      ],
    },
    {
      provider: "DigitalLearn",
      href: "https://www.digitallearn.org",
      line: "Digital skills · with the Public Library Association",
      modules: [
        { id: "l-safety", skill: "Online safety", world: "", title: "Online Safety Basics", minutes: 20, xp: 15, career: "Every career", progress: 0, about: "Passwords, phishing, privacy. The habits every employer expects on day one.", steps: ["Check three of your own settings", "Spot the phishing email", "Set up a password manager"] },
        { id: "l-calls", skill: "Video communication", world: "", title: "Video Calls for School and Interviews", minutes: 15, xp: 10, career: "Every career", progress: 35, about: "Camera, sound, background. Look ready on any call.", steps: ["Set up your frame and light", "Practice a 60-second intro", "Record and review it once"] },
        { id: "l-resume", skill: "Résumé writing", world: "", title: "Build a Résumé in Google Docs", minutes: 30, xp: 20, career: "Every career", progress: 0, about: "A clean one-pager from a blank doc, then an ATS check in Resume Builder.", steps: ["Start from the one-page layout", "Write three bullets that show results", "Import it into Resume Builder"], link: { label: "Open Resume Builder", href: "/profile?tab=resume" } },
      ],
    },
  ],
};
export const LEARN_MODULES: LearnModule[] = LEARN.groups.flatMap((g) => g.modules);

/** The two asks AT&T already fulfils at scale, 194,000 devices and
 *  UPchieve tutoring by employees, as one-tap requests from anywhere. */
export const HELP = {
  // Devices are gated the way Compudopt gates them: enrolled, no working
  // computer at home, household qualifies, one per household, random
  // draw before an event. The board joins the list; it never promises one.
  // Plain questions only. Eligibility (Compudopt's enrolment and
  // need checks, PCs for People's income rules) runs behind the scenes with
  // the school; the student is never shown criteria (direct feedback, 18
  // Sept 2026: "that seems negative, don't tell the students that").
  device: {
    kind: "Device",
    title: "Get a laptop or hotspot",
    line: "Free. We check with your school, then ship it or hand it over at an event.",
    via: "Through Compudopt and PCs for People, AT&T's device partners.",
    what: "What do you need?",
    options: ["Laptop", "Wi-Fi hotspot", "Both"],
    have: "Do you have a working computer at home?",
    haveOptions: ["No", "Yes, but shared", "Yes"],
    use: "You'll use it mostly for",
    useOptions: ["School work", "Applications", "Both"],
    get: "How would you like to get it?",
    getOptions: ["Pick up at a Detroit event", "Ship to me"],
    onFile: "Your school and grade are on file.",
    submit: "Send request",
    done: "Request received. We confirm with your school and Compudopt. You'll hear back within five days.",
    status: "Under review · reply within five days",
  },
  tutor: {
    kind: "Tutoring",
    title: "Homework help now",
    line: "An AT&T volunteer, online, usually within ten minutes.",
    via: "Online here, in a moderated room with an AT&T volunteer. A transcript is kept and program staff can join. Free for grades 8 to 12.",
    qualifies: "Your school is on file.",
    what: "Subject",
    options: ["Algebra", "Geometry", "Biology", "Chemistry", "Essay", "College apps"],
    submit: "Find a tutor",
    done: "Request sent. A volunteer is on the way.",
  },
};

/** In person is an option, never the entry point. One quiet card, low on
 *  the student's Home. */
export const NEAR_YOU = {
  eyebrow: "Prefer in person?",
  name: "Detroit Connected Learning Center",
  line: "Open today until 7 PM · Career Day Nov 14",
  note: "Everything here works from anywhere. Centers add Wi-Fi, computers and a person to help.",
  cta: "Find a center",
  optional: "Optional",
};

export const OPPORTUNITY_FILTERS = [
  { key: "all", label: "All" },
  { key: "virtual", label: "Virtual" },
  { key: "inPerson", label: "In person" },
] as const;
export type OpportunityFilter = typeof OPPORTUNITY_FILTERS[number]["key"];
export const VIRTUAL_WHERE = /virtual|online|remote|anytime|nationwide/i;

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
  sub: "One theme a month, seen by everyone.",
  autopilot: { label: "Auto-pilot", sub: "Dreamari fills unscheduled periods." },
  topicSource: "Source",
  // one vocabulary for the same two fields, whoever wrote them
  studentsSee: "Students see",
  volunteersSee: "Volunteers see",
  current: "Live now",
  inUse: "In use",
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
    { key: "sep", period: "September", theme: "Back to School + Career Access", defaultSource: "dreamari", dreamari: { topic: "Back to School + Career Access", employees: "Share one thing you wish you knew before your first job.", students: "Which career do you want to explore this year?", selected: true }, att: { topic: "Back to School + Career Access", volunteer: "What do you wish you knew before your first job?", student: "Which career do you want to explore?", saved: false }, school: { topic: "Back to School + Career Access", by: SCHOOL_BY, employee: "What do you wish you knew before your first job?", student: "Which career do you want to explore?" } },
    { key: "oct", period: "October", theme: "AI & Future of Work", defaultSource: "att", dreamari: { ...DREAMARI_AI, selected: false }, att: { topic: "AI & Future of Work", volunteer: "How is AI changing your role?", student: "Explore AI-related careers", saved: true }, school: { topic: "Careers Behind AT&T", by: SCHOOL_BY, employee: "How is AI changing your role?", student: "Explore AI-related careers" } },
    { key: "nov", period: "November", theme: "Careers Behind AT&T", defaultSource: "school", dreamari: { ...DREAMARI_AI, selected: false }, att: { topic: "Career Readiness Month", volunteer: "What skill has helped you most professionally?", student: "Ask one professional about that skill.", saved: false }, school: { topic: "Careers Behind AT&T", by: SCHOOL_BY, employee: "Introduce students to a role they may not know exists.", student: "Find one role inside AT&T you had never heard of." } },
    { key: "dec", period: "December", theme: "Advice Worth Keeping", defaultSource: "dreamari", dreamari: { topic: "Advice Worth Keeping", employees: "Share one career lesson you hope students remember.", students: "Save one piece of advice to your career plan.", selected: true }, att: { topic: "Advice Worth Keeping", volunteer: "Which career lesson has stayed with you?", student: "Save one piece of advice for your career plan.", saved: false }, school: { topic: "Advice Worth Keeping", by: SCHOOL_BY, employee: "Which career lesson has stayed with you?", student: "Save one piece of advice for your career plan." } },
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
  // This Month and This Year are different numbers (the source showed the
  // same six in both); "reached" means views, students are students.
  // AT&T's own vocabulary (people served, devices, hours) plus the two
  // numbers only Dreamari can add: Achievery units and career steps.
  tiles: [
    { key: "students", month: "214", year: "620", label: "People Served" },
    { key: "devices", month: "9", year: "48", label: "Devices Placed" },
    { key: "volunteers", month: "31", year: "54", label: "AT&T Volunteers" },
    { key: "hours", month: "28", year: "174", label: "Volunteer Hours" },
    { key: "units", month: "310", year: "1,240", label: "Achievery Units Completed" },
    { key: "steps", month: "196", year: "812", label: "Career Steps Completed" },
  ],
  devices: {
    eyebrow: "Devices",
    requests: 71,
    fulfilled: 48,
    waiting: 23,
    parts: [{ label: "Laptops", value: 31 }, { label: "Hotspots", value: 17 }],
    line: "of {requests} requests fulfilled · {waiting} waiting",
    next: "Next distribution · Oct 4 · Detroit",
  },
  outcome: {
    eyebrow: "Outcome",
    value: "62%",
    line: "of students with an AT&T touch completed a career step within 30 days",
    funnel: [{ label: "Unit done", value: 1240 }, { label: "Plan step", value: 812 }, { label: "Résumé", value: 214 }, { label: "Applied", value: 96 }],
    funnelLabel: "From access to outcome",
  },
  reach: {
    eyebrow: "How students take part",
    parts: [{ label: "Virtual", value: 441 }, { label: "At a center", value: 179 }],
    note: "15 states. A center is one way in.",
  },
  goal: { eyebrow: "2026 volunteer hours", logged: 174, target: 240, pace: 170, unit: "hours" },
  trend: {
    eyebrow: "Impact trend",
    metrics: [{ key: "reached", label: "People Served" }, { key: "views", label: "Achievery Units" }, { key: "engagements", label: "Career Steps" }] as const,
    months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    // Only the line's shape is shown in the source (no data labels); these
    // series reproduce that rising curve ending on the headline totals.
    series: {
      reached: [180, 240, 310, 400, 500, 620],
      views: [210, 380, 540, 760, 990, 1240],
      engagements: [120, 240, 360, 510, 660, 812],
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
  topLabels: { reached: "reads", answers: "answers", hours: "hours" },
  rosterTitle: "All Volunteers",
  filters: [{ key: "all", label: "All" }, { key: "active", label: "Most Active" }, { key: "needs", label: "Needs Engagement" }] as const,
  columns: ["Name", "Role", "Activity", "Reads", "Hours"],
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

// ——— Safeguarding (ours): every card can be reported, and the program
// team sees the numbers. Minors never have a private channel here. ———
export const REPORT = {
  label: "Report",
  title: "What happened?",
  note: "Dreamari moderators and the AT&T program lead see this. The person is not told who reported.",
  reasons: ["Asked for personal contact details", "Inappropriate or unsafe", "Not about careers or school", "Something else"],
  sent: "Sent to moderators. Thank you.",
};
export const SAFETY = {
  eyebrow: "Safety",
  rows: [
    { label: "Volunteers verified", value: "54 of 54", sub: "background check and work email" },
    { label: "Open flags", value: "0", sub: "2 resolved this month" },
    { label: "Average review", value: "4 min", sub: "volunteer posts before they go live" },
    { label: "Live sessions logged", value: "100%", sub: "transcript kept, staff can join" },
  ],
  note: "Under 18: public questions only, no private messages.",
};

// ——— Full profiles (ours). The six AT&T professionals open the same
// profile page every other professional has (direct feedback, 17 Sept 2026);
// these records fill that page. Positive, career-story copy only.
const V = "Background checked · Work email verified · AT&T Believes volunteer";
const rec = (key: string, extra: Omit<Pro, "id" | "name" | "role" | "org" | "verifiedBy" | "world">): Pro => ({ id: `att-${key}`, name: ATT_PROS[key].name, role: ATT_PROS[key].role, org: "AT&T", verifiedBy: V, world: "Tech & Engineering", ...extra });
export const ATT_PRO_RECORDS: Record<string, Pro> = {
  marcus: rec("marcus", { scope: "Network engineering careers", field: "Network Engineering", story: "I started as a field technician climbing towers. Fifteen years later I lead the team that keeps a region's network running, and the instinct I still use most is asking what the customer is actually experiencing.", followers: 412, studentsReached: 6280, totalLikes: 1140, questionsAnswered: 31, activeDaysAgo: 1, education: "B.S. Electrical Engineering, University of Texas at Dallas", journey: "Field technician, then network operations, then a decade of engineering roles before leading a regional team.", topics: ["Network engineering", "Field technician paths", "Leadership", "Internships"] }),
  jordan: rec("jordan", { scope: "Cybersecurity careers", field: "Cybersecurity", story: "I got into security through capture-the-flag competitions in college. Now I spend my days finding problems before anyone else does, and explaining risk to people who have never written a line of code.", followers: 358, studentsReached: 5140, totalLikes: 986, questionsAnswered: 24, activeDaysAgo: 2, education: "B.S. Computer Science, Georgia State University", journey: "Campus security club, an internship in a security operations center, then analyst roles with growing scope.", topics: ["Cybersecurity", "Competitions", "Certifications", "Internships"] }),
  maya: rec("maya", { scope: "AI and product management careers", field: "Product Management", story: "I studied psychology first and came to technology through user research. Product management turned out to be the job where understanding people and understanding systems are the same skill.", followers: 296, studentsReached: 4410, totalLikes: 812, questionsAnswered: 19, activeDaysAgo: 3, education: "B.A. Psychology, University of Michigan; M.S. Human-Computer Interaction, Georgia Tech", journey: "User researcher, then associate product manager, now leading AI product work.", topics: ["Product management", "AI careers", "User research", "Career switches"] }),
  andre: rec("andre", { scope: "Cloud and infrastructure careers", field: "Cloud Architecture", story: "My first job was fixing computers at a repair shop. Cloud architecture is the same instinct at a much bigger scale: understand how the pieces fit, then design something that keeps working when one of them fails.", followers: 231, studentsReached: 3720, totalLikes: 640, questionsAnswered: 16, activeDaysAgo: 4, education: "B.S. Information Systems, University of Houston", journey: "Repair shop, systems administrator, cloud engineer, now designing platforms teams build on.", topics: ["Cloud computing", "Systems", "Certifications", "First jobs"] }),
  elena: rec("elena", { scope: "Customer experience and operations careers", field: "Customer Experience", story: "I started in a call center in college. Every role since has been about the same question: what would make this easier for the person on the other end? Now I lead teams that answer it at scale.", followers: 274, studentsReached: 4020, totalLikes: 705, questionsAnswered: 21, activeDaysAgo: 2, education: "B.B.A. Management, Florida International University", journey: "Call center agent, team lead, operations manager, now a director of customer experience.", topics: ["Customer experience", "Operations", "Leadership", "Career growth"] }),
  amina: rec("amina", { scope: "Technology program management careers", field: "Program Management", story: "I am the person who makes sure fifty moving parts land on the same day. Program management is for people who like both the plan and the people, and I found it through an internship I almost did not apply for.", followers: 203, studentsReached: 3150, totalLikes: 548, questionsAnswered: 14, activeDaysAgo: 5, education: "B.S. Industrial Engineering, North Carolina A&T State University", journey: "Engineering internship, project coordinator, program manager on network rollouts, now leading technology programs.", topics: ["Program management", "Internships", "Engineering", "Organization"] }),
};
