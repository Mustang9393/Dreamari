// United Way · Student Success: the partner community (7 Oct 2026).
//
// Why this shape: own research across United Way Worldwide and its local
// United Ways (docs/reference/united-way-board-research-2026-10-07.md).
// Three audiences, three Connect roles: students (the board), volunteers
// (hours are their currency) and United Way itself (impact in the Global
// Results Framework every local United Way reports). One global board, no
// chapter picker. Mentoring also lives in the Mentorship tab, and high
// school mentoring has no direct messages.
//
// Second pass, same day (Chandu: "Use United Way branding... use brand
// imagery from them, official ones. Avoid lots of cluttered text... 8th
// grade reading"): every photo and the logo are United Way's own, taken
// from unitedway.org (the logo is the inline SVG in its site header, in
// United Way's published colours; the white version is its one-colour
// variant, which the brand guide allows on dark grounds). Copy is cut to a
// title, one short line and icon facts. Program facts are the programs'
// own; this board's activity counts are demo numbers.
//
// Brand colours (United Way brand standards): Blue #0044B5, Red #FD372C,
// Yellow #FFBA00, Green #009464.

import { PROS, type Pro } from "../data";

export const UW_ID = "united-way-student-success";

export const BRAND = {
  blue: "#0044B5",
  red: "#FD372C",
  yellow: "#FFBA00",
  green: "#009464",
  /** United Way blue lifted for text on the app's dark ground (AA contrast) */
  blueText: "#7FA6FF",
  logo: "/images/connect/partners/united-way.svg",
  logoWhite: "/images/connect/partners/united-way-white.svg",
};

/** United Way's own photography (unitedway.org), one per use. */
export const PHOTOS = {
  hero: "/images/connect/covers/uw-hero.jpg",
  mentor: "/images/connect/covers/uw-mentor.jpg",
  workplace: "/images/connect/covers/uw-workplace.jpg",
  scholars: "/images/connect/covers/uw-scholars.jpg",
  ignite: "/images/connect/covers/uw-ignite.jpg",
  volunteers: "/images/connect/covers/uw-volunteers.jpg",
};

export const UW = {
  name: "Student Success",
  line: "Mentors, programs and real jobs from United Way.",
  stats: [
    { value: "1,100", label: "United Ways" },
    { value: "4", label: "programs open" },
  ],
};

export const VIEWS = [
  { key: "student", label: "Student" },
  { key: "volunteer", label: "Volunteer" },
  { key: "partner", label: "United Way" },
] as const;
export type UwView = typeof VIEWS[number]["key"];

export const STUDENT_TABS = [
  { key: "home", label: "Home" },
  { key: "programs", label: "Programs" },
  { key: "ask", label: "Ask" },
  { key: "events", label: "Events" },
] as const;
export const VOLUNTEER_TABS = [
  { key: "today", label: "Today" },
  { key: "impact", label: "My Impact" },
] as const;
export const PARTNER_TABS = [
  { key: "impact", label: "Impact" },
  { key: "programs", label: "Programs" },
] as const;

export const BACK = "Back to communities";

// ——— Programs ———

export type ProgramKind = "mentor" | "work" | "college" | "internship";
export type Program = {
  id: string;
  title: string;
  kind: ProgramKind;
  kindLabel: string;
  photo: string;
  focus: string;
  line: string;
  gets: string[]; // three short facts, shown with icons
  when: string;
  where: string;
  by: string;
  status: "open" | "soon" | "returning";
  /** the program's own published number, one stat */
  proof?: { value: string; label: string };
  /** opens in the Mentorship tab */
  mentorship?: boolean;
};

export const PROGRAMS: Program[] = [
  {
    id: "uw-ementorship", title: "e-Mentorship", kind: "mentor", kindLabel: "Mentor", photo: PHOTOS.mentor, focus: "50% 30%",
    line: "A mentor for your senior year.",
    gets: ["One mentor all year", "Six online workshops", "Help to graduate on time"],
    when: "Oct to Apr", where: "Online", by: "Orange County United Way", status: "returning",
    proof: { value: "100%", label: "graduated on time" }, mentorship: true,
  },
  {
    id: "uw-ycc", title: "Youth Career Connections", kind: "work", kindLabel: "Work", photo: PHOTOS.workplace, focus: "50% 35%",
    line: "Meet pros. Work at a real company.",
    gets: ["Pros visit your class", "Visit real workplaces", "Four weeks at a company"],
    when: "School year", where: "Orange County, CA", by: "Orange County United Way", status: "open",
    proof: { value: "2,262", label: "students placed at work" },
  },
  {
    id: "uw-destination", title: "Destination Graduation", kind: "college", kindLabel: "College", photo: PHOTOS.scholars, focus: "50% 40%",
    line: "Graduate. Then pick your next step.",
    gets: ["Financial aid help", "Scholarship help", "College trips"],
    when: "School year", where: "Orange County, CA", by: "Orange County United Way", status: "open",
  },
  {
    id: "uw-ignite", title: "Ignite Internships", kind: "internship", kindLabel: "Internship", photo: PHOTOS.ignite, focus: "60% 40%",
    line: "A summer job at a local company.",
    gets: ["79 local companies", "Coaching before day one", "A review for your résumé"],
    when: "Summer", where: "Southwest Virginia", by: "United Way of Southwest Virginia", status: "open",
    proof: { value: "79", label: "companies" },
  },
];

export const PROGRAMS_UI = {
  interested: "I'm interested",
  done: "You're on the list",
  doneLine: "The program will email you.",
  openMentorship: "See it in Mentorship",
  noMessages: "No direct messages. Your program lead sets up each meeting.",
};

// ——— Events (career days, panels, job shadows, workshops) ———

export type UwEvent = {
  id: string;
  kind: string;
  title: string;
  where: string;
  virtual: boolean;
  about: string;
  who: string;
  date: { month: string; day: number; time: string };
  going: number;
  world?: string;
};

export const EVENTS: UwEvent[] = [
  { id: "uw-e-panel", kind: "Online panel", title: "What a first job is really like", where: "Online", virtual: true, about: "Four volunteers share their first jobs. Then you ask.", who: "Any student", date: { month: "Oct", day: 23, time: "6:00 PM" }, going: 318, world: "Business & Finance" },
  { id: "uw-e-fafsa", kind: "Workshop", title: "Financial aid night", where: "Online", virtual: true, about: "Fill out the FAFSA step by step, with help.", who: "Seniors and families", date: { month: "Oct", day: 29, time: "6:30 PM" }, going: 133 },
  { id: "uw-e-careerday", kind: "Career day", title: "Career Day with local employers", where: "Albuquerque, NM", virtual: false, about: "Visit employer stations. Try a few jobs in one day.", who: "Grades 8 to 12", date: { month: "Nov", day: 6, time: "8:30 AM" }, going: 148 },
  { id: "uw-e-resume", kind: "Workshop", title: "Résumé check with volunteers", where: "Online", virtual: true, about: "Bring the résumé you built here. Get notes the same night.", who: "Any student", date: { month: "Nov", day: 12, time: "5:00 PM" }, going: 240 },
  { id: "uw-e-shadow", kind: "Job shadow", title: "A day at a hospital", where: "West Palm Beach, FL", virtual: false, about: "Shadow nurses, pharmacists and imaging staff for a day.", who: "Juniors and seniors", date: { month: "Nov", day: 20, time: "8:00 AM" }, going: 96, world: "Health & Medicine" },
  { id: "uw-e-expo", kind: "Career expo", title: "OnTrack Career Expo", where: "Oakland, CA", virtual: false, about: "Hands-on booths and mentors who grew up like you.", who: "High school students", date: { month: "Mar", day: 14, time: "9:00 AM" }, going: 212 },
];

export const EVENTS_UI = {
  filters: [{ key: "all", label: "All" }, { key: "online", label: "Online" }, { key: "inperson", label: "In person" }] as const,
  going: "going",
  save: "Save", saved: "Saved",
  addPlan: "Add to My Plan", inPlan: "In My Plan",
};
export type EventFilter = typeof EVENTS_UI.filters[number]["key"];

// ——— Ask ———

export const ASK = {
  title: "Ask a volunteer",
  placeholder: "Ask about a job or a program",
  submitted: "Sent. A volunteer will answer soon.",
  again: "Ask another",
  answers: "Recent answers",
  people: "Volunteers here",
};

/** Volunteers are existing Connect professionals, so every portrait,
 *  profile and verification line is the real one. */
export const VOLUNTEER_IDS = ["pro-okafor", "pro-reyes", "pro-tanaka", "pro-cole", "pro-whitfield", "pro-brooks"] as const;
export const VOLUNTEERS: Record<string, Pro> = Object.fromEntries(VOLUNTEER_IDS.map((id) => [id, PROS.find((p) => p.id === id)!]));

export const ANSWERS = [
  { id: "uw-q1", question: "I like health care but not med school. What else is there?", pro: "pro-reyes", answer: "Nursing, imaging, pharmacy tech. Most take two years. Try the hospital job shadow here.", helpful: 64 },
  { id: "uw-q2", question: "How do I get an internship if no one I know has an office job?", pro: "pro-whitfield", answer: "That is what Ignite and Youth Career Connections are for. Raise your hand on Programs.", helpful: 58 },
  { id: "uw-q3", question: "What is the first week of a finance job like?", pro: "pro-okafor", answer: "Mostly learning the tools and the people. Ask one good question a day.", helpful: 41 },
];

// ——— Volunteer view ———

export const TODAY = {
  title: "Quick ways to help",
  requests: [
    { id: "r1", kind: "Answer", minutes: 5, title: "What is the first week of a finance job like?" },
    { id: "r2", kind: "Review", minutes: 15, title: "Check Jordan's résumé for Ignite" },
    { id: "r3", kind: "Speak", minutes: 45, title: "Join the Oct 23 first-job panel" },
    { id: "r4", kind: "Mentor", minutes: 60, title: "Mentor a senior in e-Mentorship" },
  ],
  min: "min", accept: "Accept", accepted: "Added to your hours",
};

export const MY_IMPACT = {
  tiles: [
    { key: "hours", value: "18", label: "Hours" },
    { key: "answers", value: "27", label: "Answers" },
    { key: "students", value: "31", label: "Students helped" },
    { key: "meetings", value: "6", label: "Mentor meetings" },
  ],
  goal: { title: "Your campaign hours", logged: 18, target: 25, pace: 16, unit: "hours" },
  monthsTitle: "Hours by month",
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  hours: [0, 1, 2, 2, 2, 3, 2, 3, 3],
  export: "Export hours", exported: "Hours file ready. No student names.",
};

// ——— United Way view (Global Results Framework, Youth Success) ———

export const IMPACT = {
  range: [{ key: "month", label: "Month" }, { key: "year", label: "Year" }] as const,
  outcome: { value: "71%", line: "took a career step within 30 days" },
  funnel: [{ label: "Reached", value: 2340 }, { label: "Explored", value: 1870 }, { label: "Joined", value: 1120 }, { label: "Matched", value: 412 }],
  tiles: [
    { key: "reached", month: "612", year: "2,340", label: "Youth reached" },
    { key: "matches", month: "41", year: "412", label: "Mentor matches" },
    { key: "hours", month: "96", year: "1,480", label: "Volunteer hours" },
    { key: "placements", month: "22", year: "206", label: "Internships" },
  ],
  grfTitle: "Youth Success goals",
  grf: [
    { label: "Job skills training", value: 1120, goal: 1500, last: 760 },
    { label: "On-time graduation", value: 96, goal: 100, last: 94, unit: "%" },
    { label: "Plan after high school", value: 71, goal: 85, last: 58, unit: "%" },
    { label: "Good attendance", value: 90, goal: 92, last: 87, unit: "%" },
  ],
  grfNote: "Line = last year",
  export: "Export report", exported: "Report ready in Global Results order",
  safety: [
    { label: "Volunteers checked", value: "286" },
    { label: "Direct messages", value: "Off" },
    { label: "Flags this month", value: "3" },
  ],
};

export const PARTNER_PROGRAMS = {
  columns: ["Program", "Students", "Volunteers", "Hours"],
  rows: [
    { program: "e-Mentorship", by: "Orange County", students: 312, volunteers: 58, hours: 290 },
    { program: "Youth Career Connections", by: "Orange County", students: 486, volunteers: 64, hours: 410 },
    { program: "Destination Graduation", by: "Orange County", students: 274, volunteers: 22, hours: 120 },
    { program: "Ignite Internships", by: "Southwest Virginia", students: 229, volunteers: 86, hours: 260 },
  ],
};

export const REPORT = {
  title: "Report this",
  reasons: ["Not okay for students", "Asked to talk off the app", "Wrong advice", "Something else"],
  sent: "Sent to moderators",
};

// ——— Mentorship tab: the e-Mentorship sheet ———

export const MENTORSHIP_PROGRAM = {
  id: "united-way",
  title: "e-Mentorship",
  kind: "Mentor · High school",
  photo: PHOTOS.mentor,
  line: "A mentor for your senior year.",
  gets: PROGRAMS[0].gets,
  when: "Oct to Apr", where: "Online",
  workshops: [
    { month: "Oct", day: 14, title: "Meet your mentor" },
    { month: "Nov", day: 11, title: "Financial aid" },
    { month: "Dec", day: 9, title: "Life after high school" },
    { month: "Jan", day: 13, title: "Stress and balance" },
    { month: "Feb", day: 10, title: "Money basics" },
    { month: "Mar", day: 10, title: "Your first job" },
  ],
  proof: { value: "100%", label: "graduated on time" },
};
