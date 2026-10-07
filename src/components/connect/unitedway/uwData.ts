// United Way boards: the shared model, and the network board's content.
//
// History, so the shape makes sense:
// - 7 Oct 2026: one global "United Way · Student Success" board, from our
//   own research (docs/reference/united-way-board-research-2026-10-07.md).
//   Three audiences, three Connect roles: students, volunteers (hours are
//   their currency) and United Way itself (impact in the Global Results
//   Framework every local United Way reports).
// - 8 Oct 2026, Chandu: "I don't think the board we had built incorporated
//   any of our broader research either. So build one with the broader
//   network view and one specific to Michigan. And it was such a basic
//   board, nothing more than answering questions and seeing some details
//   about a program. Please flesh it out to be super useful for everyone
//   involved." So the board is now one engine (UnitedWayBoardView) running
//   two data sets: NETWORK here, MICHIGAN in uwMichigan.ts. Each one carries
//   the research the first board left out:
//     students: programs filtered by kind with who-it's-for, how to join and
//       the program's own page; Serve (teen volunteer shifts with service
//       hours for school, NHS and scholarships, the Youth United Way model);
//       2-1-1 for help at home (United Way runs it); picks matched to Top 3;
//     volunteers: questions routed to them, shifts with open spots, team
//       standings for the workplace campaign, thank-you notes, an hours
//       export in the shape Galaxy Digital and Salesforce expect;
//     United Way: a trend, what students want (top careers, top questions),
//       a volunteer safety roster, and a Post tool that publishes an event
//       or shift straight to the student and volunteer views.
//   The network board also shows the national partnerships research found
//   (Big Brothers Big Sisters, MENTOR, Character Playbook) as context.
//
// Branding: every photo and the logo are United Way's own (unitedway.org,
// and for Michigan the Michigan United Ways' own sites). Copy is a title,
// one short line and icon facts, 8th grade. Program facts are the
// programs' own published ones; activity counts on the board are demo.
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
  // 8 Oct 2026: one photo per program, from the programs' own United Ways
  // (Palm Beach's mentoring page, Orange County's scholarship story,
  // unitedway.org's Ignite intern)
  advocate: "/images/connect/covers/uw-net-advocate.jpg",
  college: "/images/connect/covers/uw-net-college.jpg",
  intern: "/images/connect/covers/uw-net-intern.jpg",
};

// ——— the shared model ———

export const VIEWS = [
  { key: "student", label: "Student" },
  { key: "volunteer", label: "Volunteer" },
  { key: "partner", label: "United Way" },
] as const;
export type UwView = typeof VIEWS[number]["key"];

export const STUDENT_TABS = [
  { key: "home", label: "Home" },
  { key: "programs", label: "Programs" },
  { key: "events", label: "Events" },
  { key: "serve", label: "Serve" },
  { key: "ask", label: "Q&A" },
] as const;
export type StudentTab = typeof STUDENT_TABS[number]["key"];
export const VOLUNTEER_TABS = [
  { key: "today", label: "Today" },
  { key: "shifts", label: "Shifts" },
  { key: "impact", label: "My Impact" },
] as const;
export type VolunteerTab = typeof VOLUNTEER_TABS[number]["key"];
export const PARTNER_TABS = [
  { key: "impact", label: "Impact" },
  { key: "chapters", label: "By United Way" },
  { key: "programs", label: "Programs" },
  { key: "people", label: "Volunteers" },
] as const;
export type PartnerTab = typeof PARTNER_TABS[number]["key"];

/** A local United Way. lon/lat place its pin on the map. */
export type Chapter = { id: string; name: string; short: string; place: string; lon: number; lat: number; students: number; volunteers: number; hours: number; url?: string };

export type ProgramKind = "mentor" | "work" | "college" | "internship" | "summer" | "lead";
export const KIND_LABEL: Record<ProgramKind, string> = { mentor: "Mentor", work: "Careers", college: "College", internship: "Internship", summer: "Summer job", lead: "Lead" };

export type Program = {
  id: string;
  title: string;
  kind: ProgramKind;
  photo: string;
  focus: string;
  line: string;
  /** one short line for the program's page, only when it adds something
   *  the title line and "What you get" don't already say */
  about?: string;
  gets: string[]; // three short facts, shown with icons
  who: string;
  when: string;
  where: string;
  by: string;
  status: "open" | "soon" | "returning";
  /** how you join, three short steps */
  steps?: string[];
  deadline?: string;
  /** the program's own published number, one stat */
  proof?: { value: string; label: string };
  /** opens in the Mentorship tab */
  mentorship?: boolean;
  /** the local United Way that runs it */
  chapter: string;
  /** a career world, so Home can say "Fits your Top 3" */
  world?: string;
  /** the program's own site: the source, kept for the partner team; the
   *  board never sends a student out to it (Chandu, 8 Oct 2026: "don't take
   *  users out of the app for program pages... everything should be able
   *  to be done here") */
  url?: string;
};

export type UwEvent = {
  id: string;
  kind: string;
  title: string;
  where: string;
  virtual: boolean;
  about: string;
  who: string;
  date: { month: string; day: number; time: string; year: number };
  going: number;
  world?: string;
  /** the local United Way that runs it; null = online, open to everyone */
  chapter: string | null;
  url?: string;
};

/** A volunteer shift: for teens (Serve) or adult volunteers (Shifts). */
export type Shift = {
  id: string;
  kind: string;
  title: string;
  where: string;
  date: { month: string; day: number; time: string; year: number };
  hours: number;
  spots: number;
  who: string;
  chapter: string | null;
  /** grouping for volunteers: "quick" under an hour, "day", "ongoing" */
  length?: "quick" | "day" | "ongoing";
  /** works with students, so a background check comes first; packing and
   *  sorting shifts don't need one (the youth-safety split United Ways use) */
  check?: boolean;
};


export type UwBoard = {
  id: string;
  /** banner title on the student view */
  name: string;
  line: string;
  stats: { value: string; label: string }[];
  photos: { hero: string; heroFocus: string; volunteers: string; volunteersFocus: string };
  map: "usa" | "michigan";
  chapters: Chapter[];
  /** "Find your United Way" line under the Local toggle */
  pick: string;
  programs: Program[];
  events: UwEvent[];
  /** Serve tab: teen volunteer shifts that count as service hours */
  serve: Shift[];
  serveGoal: { logged: number; target: number; line: string };
  /** a youth group students can join (Youth United Way and its kin) */
  youth?: { title: string; line: string; by: string; url?: string };
  help: { title: string; line: string; call: string; url: string; /** a number that takes texts (Michigan: 898211) */ text?: string };
  /** school supplies a student can ask for privately (Michigan:
   *  Backpacks for Bright Futures) */
  supplies?: { title: string; line: string; items: string[]; by: string; url: string };
  /** the demo volunteer's own screening status */
  clearance: { status: string; line: string };
  /** who answers here; the questions themselves are Connect threads
   *  (uwThreads.ts), listed by board id */
  volunteerIds: string[];
  today: { since: string[]; requests: { id: string; kind: string; minutes: number; title: string }[] };
  shifts: Shift[];
  myImpact: {
    tiles: { key: string; value: string; label: string }[];
    goal: { logged: number; target: number };
    months: string[];
    hours: number[];
  };
  team: { you: string; rows: { label: string; value: number }[] };
  thanks: { from: string; text: string }[];
  impact: {
    outcome: { value: string; line: string };
    funnel: { label: string; value: number }[];
    tiles: { key: string; month: string; year: string; label: string }[];
    trendBase: number;
    grf: { label: string; value: number; goal: number; last: number; unit?: string }[];
    safety: { label: string; value: string }[];
    careers: { label: string; world: string; value: number }[];
    topics: { label: string; value: number }[];
    /** one line of context from published research, with its source */
    context?: { value: string; line: string; source: string };
    /** an early warning from 2-1-1 calls, with the action it suggests */
    signal?: { value: string; line: string; action: string };
    /** board visits and active students by month (v4's logins chart) */
    monthly: { label: string; total: number; unique: number }[];
    /** what students who declared a plan chose (one ring, no overlaps) */
    paths: { label: string; count: number }[];
  };
  /** how well volunteering runs: three rates against their goals */
  ops: { label: string; value: number; goal: number }[];
  partnerPrograms: { program: string; by: string; students: number; volunteers: number; hours: number }[];
  roster: { pro: string; checks: "done" | "training" | "pending"; hours: number }[];
  /** network board only: national partnerships */
  network?: { title: string; items: { name: string; line: string; stat: string }[] };
};

// ——— shared UI strings ———

export const SCOPE = {
  options: [{ key: "all", label: "Everywhere" }, { key: "local", label: "Local" }] as const,
  everywhere: "Everywhere",
  none: "No programs here yet. Online events are open to you.",
};
export type Scope = typeof SCOPE.options[number]["key"];

export const BACK = "Back to communities";

export const PROGRAMS_UI = {
  interested: "I'm interested",
  done: "You're on the list",
  doneLine: "The program will email you.",
  openMentorship: "See it in Mentorship",
  continueMentorship: "Continue in Mentorship",
  nextStep: "You're interested. Next: three quick questions.",
  noMessages: "No direct messages. Your program lead sets up each meeting.",
  page: "Program page",
  how: "How to join",
  forYou: "Fits your Top 3",
};

/** The program's own page, inside the board (8 Oct 2026, Chandu: "don't
 *  take users out of the app for program pages etc. Build all of that and
 *  the programs functionality into our app in the boards themselves.
 *  Everything should be able to be done here"). */
export const PROGRAM_PAGE = {
  back: "Back to United Way",
  tabs: [{ key: "about", label: "About" }, { key: "how", label: "How it works" }, { key: "ask", label: "Questions" }] as const,
  apply: "Apply",
  applied: "Application sent",
  track: ["Applied", "In review", "Decision"],
  trackLine: "Updates show up here.",
  runBy: "Run by",
  gets: "What you get",
  events: "Events you can go to",
  people: "Volunteers who help here",
  ask: "Ask about this program",
  askPlaceholder: "What do you want to know?",
  asked: "Sent. The answer shows up in Q&A.",
  noQuestions: "No questions yet. Ask the first one.",
  form: {
    title: "Apply",
    grade: { q: "What grade are you in?", options: ["9th", "10th", "11th", "12th"] },
    want: "What do you want most?",
    when: { q: "When are you free?", options: ["After school", "Evenings", "Weekends", "Summer"] },
    submit: "Send application",
  },
};
export type ProgramTab = typeof PROGRAM_PAGE.tabs[number]["key"];

export const EVENTS_UI = {
  filters: [{ key: "all", label: "All" }, { key: "online", label: "Online" }, { key: "inperson", label: "In person" }] as const,
  going: "going",
  save: "Save", saved: "Saved",
  addPlan: "Add to My Plan", inPlan: "In My Plan",
  calendar: "Add to calendar",
};
export type EventFilter = typeof EVENTS_UI.filters[number]["key"];

export const HELP_UI = {
  line: "A real person helps you find help nearby.",
  covers: ["Food and meals", "Rent and power bills", "Health care and rides"],
  call: "Call 2-1-1", text: "Text your ZIP",
  private: "Free. Private. Open every day.",
};

export const SERVE_UI = {
  title: "Your service hours",
  checkIn: "Check in", checkedIn: "Hours verified",
  checkLine: "Check in at the shift to count your hours.",
  signUp: "Sign up",
  spots: "spots left",
  letter: "Get hours letter", lettered: "Your signed hours letter is ready.",
  check: "Background check first",
  hours: "hrs",
};

export const ASK = {
  title: "Ask a volunteer",
  placeholder: "Ask about a job or a program",
  submitted: "Sent. It's at the top of the list.",
  again: "Ask another",
  latest: "Latest questions",
  all: "All questions",
  // where a question goes, in three steps (Chandu: "it's not clear where
  // the questions go")
  how: [
    { title: "You ask", line: "First name only." },
    { title: "Volunteers in that field get it", line: "Checked by United Way." },
    { title: "Everyone can read the answer", line: "Most come in a day." },
  ],
  filters: [{ key: "all", label: "All" }, { key: "answered", label: "Answered" }, { key: "waiting", label: "Waiting" }] as const,
  answerHere: "answer here",
};

export const VOLUNTEER_UI = {
  since: "Since you were last here",
  checkNote: "Shifts with students need a background check.",
  routed: "Questions for you",
  answer: "Answer", post: "Post answer", posted: "Posted. Students can see it now.",
  placeholder: "Two or three sentences is plenty",
  requests: "Quick ways to help",
  min: "min", accept: "Accept", accepted: "Added to your hours",
  shiftFilters: [{ key: "all", label: "All" }, { key: "quick", label: "Under 1 hr" }, { key: "day", label: "A day" }, { key: "ongoing", label: "Ongoing" }] as const,
  signUp: "Sign up", signed: "Signed up",
  goal: "Your campaign hours",
  monthsTitle: "Hours by month",
  team: "Your team",
  thanks: "Notes from students",
  export: "Export hours", exported: "Hours file ready for your company. No student names.",
};

export const PARTNER_UI = {
  range: [{ key: "month", label: "Month" }, { key: "year", label: "Year" }] as const,
  export: "Export report", exported: "Report ready in Global Results order",
  grf: "Youth Success goals",
  trend: "Visits and active students by month",
  careers: "Careers students saved",
  paths: "Plans after high school",
  pathsCentre: "have a plan",
  topics: "What students ask about",
  safety: "Safety",
  post: "Post", posted: "Posted. Students see it now.",
  roster: "Volunteer checks", remind: "Send reminder", reminded: "Reminder sent",
  checks: { done: "Cleared", training: "Training", pending: "Check pending" },
  pause: "Pause", paused: "Paused", resume: "Resume", pausedToast: "Paused on all shifts",
  ops: "How volunteering runs",
};

export const SUPPLY_UI = {
  ask: "Ask privately",
  pick: "What do you need?",
  send: "Request",
  ready: "Your pickup code",
  readyLine: "Show this code at your school office. It's private.",
};

export const POST_UI = {
  title: "Post to the board",
  kinds: [{ key: "event", label: "Event" }, { key: "shift", label: "Shift" }] as const,
  fields: { title: "Title", where: "Where", date: "Date" },
  placeholders: { event: "Résumé night at the library", shift: "Help at our career fair" },
  submit: "Post",
};

/** Volunteers are existing Connect professionals, so every portrait,
 *  profile and verification line is the real one. */
export const VOLUNTEER_IDS = ["pro-okafor", "pro-reyes", "pro-tanaka", "pro-cole", "pro-whitfield", "pro-brooks", "pro-ortega", "pro-chen"] as const;
export const VOLUNTEERS: Record<string, Pro> = Object.fromEntries(
  [...VOLUNTEER_IDS, "pro-weiss", "pro-adler", "pro-wong", "pro-rossi"].map((id) => [id, PROS.find((p) => p.id === id)!]),
);

// ——— the network board ———
// Facts from the research memo (section 1): Orange County's e-Mentorship,
// Youth Career Connections and Destination Graduation; Palm Beach's Mentor
// Center (60 programs, 6,500 matches a year, 100% on-time graduation);
// Salt Lake's Promise Student Advocates (533 students, Dec 2025); the
// Midlands' Young Men United (100% matched, paid eight-week internships);
// Southwest Virginia's Ignite (79 companies); Miami-Dade's Career
// Connections; Bay Area's OnTrack expo; Albuquerque's career days. United
// Way for Southeastern Michigan sits on the network map too; Michigan has
// its own board.

const NET_CHAPTERS: Chapter[] = [
  { id: "oc", name: "Orange County United Way", short: "Orange County", place: "Irvine, CA", lon: -117.79, lat: 33.68, students: 1072, volunteers: 144, hours: 820, url: "https://unitedwayoc.org" },
  { id: "pbc", name: "United Way of Palm Beach County", short: "Palm Beach", place: "Boynton Beach, FL", lon: -80.07, lat: 26.53, students: 640, volunteers: 98, hours: 510, url: "https://unitedwaypbc.org" },
  { id: "semi", name: "United Way for Southeastern Michigan", short: "Southeast Michigan", place: "Detroit, MI", lon: -83.05, lat: 42.33, students: 588, volunteers: 92, hours: 470, url: "https://unitedwaysem.org" },
  { id: "bay", name: "United Way Bay Area", short: "Bay Area", place: "San Francisco, CA", lon: -122.42, lat: 37.77, students: 412, volunteers: 38, hours: 170, url: "https://uwba.org" },
  { id: "slc", name: "United Way of Salt Lake", short: "Salt Lake", place: "Salt Lake City, UT", lon: -111.89, lat: 40.76, students: 396, volunteers: 51, hours: 260, url: "https://uw.org" },
  { id: "mid", name: "United Way of the Midlands", short: "Midlands", place: "Columbia, SC", lon: -81.03, lat: 34.0, students: 274, volunteers: 40, hours: 230, url: "https://www.uway.org" },
  { id: "nm", name: "United Ways of Central New Mexico", short: "Central New Mexico", place: "Albuquerque, NM", lon: -106.65, lat: 35.08, students: 248, volunteers: 22, hours: 90 },
  { id: "swva", name: "United Way of Southwest Virginia", short: "Southwest Virginia", place: "Abingdon, VA", lon: -81.98, lat: 36.71, students: 222, volunteers: 36, hours: 220 },
  { id: "mia", name: "United Way Miami", short: "Miami", place: "Miami, FL", lon: -80.19, lat: 25.76, students: 198, volunteers: 30, hours: 140, url: "https://unitedwaymiami.org" },
];

export const PROGRAMS: Program[] = [
  {
    id: "uw-ementorship", title: "e-Mentorship", kind: "mentor", photo: PHOTOS.mentor, focus: "50% 30%",
    about: "Workshops cover aid, stress, money and first jobs.",
    line: "A mentor for your senior year.",
    gets: ["One mentor all year", "Six online workshops", "Help to graduate on time"],
    who: "Seniors", when: "Oct to Apr", where: "Online", by: "Orange County United Way", status: "returning",
    steps: ["Raise your hand", "Answer 3 questions", "Meet your mentor"],
    proof: { value: "100%", label: "graduated on time" }, mentorship: true, chapter: "oc",
    url: "https://unitedwayoc.org/our-work/united-for-student-success/student-programs/e-mentorship-program/",
  },
  {
    id: "uw-mentor-center", title: "Mentor Center", kind: "mentor", photo: PHOTOS.advocate, focus: "50% 30%",
    about: "Say what you need. It finds the match.",
    line: "60 mentor programs. One fits you.",
    gets: ["A mentor near you", "In school or after", "Help with grades and plans"],
    who: "Grades 6 to 12", when: "School year", where: "Palm Beach County, FL", by: "United Way of Palm Beach County", status: "open",
    steps: ["Raise your hand", "Pick a program", "Meet your mentor"],
    proof: { value: "6,500", label: "matches a year" }, chapter: "pbc",
    url: "https://unitedwaypbc.org/our-impact/helping-youth-succeed",
  },
  {
    id: "uw-ycc", title: "Youth Career Connections", kind: "work", photo: PHOTOS.workplace, focus: "50% 35%",
    line: "Meet pros. Work at a real company.",
    gets: ["Pros visit your class", "Visit real workplaces", "Four weeks at a company"],
    who: "High school", when: "School year", where: "Orange County, CA", by: "Orange County United Way", status: "open",
    steps: ["Raise your hand", "Pick a field", "Start your placement"],
    proof: { value: "2,262", label: "students placed at work" }, chapter: "oc", world: "Business & Finance",
    url: "https://unitedwayoc.org/our-work/united-for-student-success/student-programs/youth-career-connections/",
  },
  {
    id: "uw-ymu", title: "Young Men United", kind: "internship", photo: PHOTOS.scholars, focus: "50% 35%",
    line: "A mentor, a laptop and a paid internship.",
    gets: ["An adult mentor", "Paid 8-week internship", "Job shadows"],
    who: "Young men in high school", when: "School year and summer", where: "Columbia, SC", by: "United Way of the Midlands", status: "open",
    proof: { value: "100%", label: "matched with a mentor" }, chapter: "mid",
    url: "https://www.uway.org/ymu",
  },
  {
    id: "uw-promise", title: "Promise Student Advocates", kind: "mentor", photo: PHOTOS.hero, focus: "65% 40%",
    line: "An adult in your corner at school.",
    gets: ["A caring adult at school", "Help with school and life", "Someone to plan with"],
    who: "High school", when: "School year", where: "Salt Lake County, UT", by: "United Way of Salt Lake", status: "open",
    proof: { value: "533", label: "students with an advocate" }, chapter: "slc",
    url: "https://uw.org/",
  },
  {
    id: "uw-destination", title: "Destination Graduation", kind: "college", photo: PHOTOS.college, focus: "50% 30%",
    line: "Graduate. Then pick your next step.",
    gets: ["Financial aid help", "Scholarship help", "College trips"],
    who: "Grades 9 to 12", when: "School year", where: "Orange County, CA", by: "Orange County United Way", status: "open", chapter: "oc",
  },
  {
    id: "uw-ignite", title: "Ignite Internships", kind: "summer", photo: PHOTOS.intern, focus: "50% 40%",
    line: "A summer job at a local company.",
    gets: ["Jobs in 19 counties", "Coaching before day one", "A résumé review"],
    who: "Ages 16 to 18", when: "Summer", where: "Southwest Virginia", by: "United Way of Southwest Virginia", status: "open",
    deadline: "Apply by Mar 1",
    proof: { value: "79", label: "companies" }, chapter: "swva",
  },
  {
    id: "uw-career-connections", title: "Career Connections", kind: "work", photo: PHOTOS.ignite, focus: "60% 40%",
    line: "Meet employers. Learn what jobs need.",
    gets: ["Employer visits", "Skills employers want", "Help with your plan"],
    who: "High school", when: "School year", where: "Miami-Dade, FL", by: "United Way Miami", status: "soon", chapter: "mia",
    url: "https://unitedwaymiami.org/monthly-newsletter/united-way-of-miami-dade-april-newsletter-2",
  },
];

const NET_EVENTS: UwEvent[] = [
  { id: "uw-e-panel", kind: "Online panel", title: "What a first job is really like", where: "Online", virtual: true, about: "Four volunteers share their first jobs. Then you ask.", who: "Any student", date: { month: "Oct", day: 23, time: "6:00 PM", year: 2026 }, going: 318, world: "Business & Finance", chapter: null },
  { id: "uw-e-fafsa", kind: "Workshop", title: "Financial aid night", where: "Online", virtual: true, about: "Fill out the FAFSA step by step, with help.", who: "Seniors and families", date: { month: "Oct", day: 29, time: "6:30 PM", year: 2026 }, going: 133, chapter: null },
  { id: "uw-e-careerday", kind: "Career day", title: "Career Day with local employers", where: "Albuquerque, NM", virtual: false, about: "Visit employer stations. Try a few jobs in one day.", who: "Grades 8 to 12", date: { month: "Nov", day: 6, time: "8:30 AM", year: 2026 }, going: 148, chapter: "nm" },
  { id: "uw-e-resume", kind: "Workshop", title: "Résumé check with volunteers", where: "Online", virtual: true, about: "Bring the résumé you built here. Get notes the same night.", who: "Any student", date: { month: "Nov", day: 12, time: "5:00 PM", year: 2026 }, going: 240, chapter: null },
  { id: "uw-e-shadow", kind: "Job shadow", title: "A day at a hospital", where: "West Palm Beach, FL", virtual: false, about: "Shadow nurses, pharmacists and imaging staff for a day.", who: "Juniors and seniors", date: { month: "Nov", day: 20, time: "8:00 AM", year: 2026 }, going: 96, world: "Health & Medicine", chapter: "pbc" },
  { id: "uw-e-health-panel", kind: "Online panel", title: "Health jobs without med school", where: "Online", virtual: true, about: "A nurse, a pharmacist and a therapist. Two years of school or less to start.", who: "Any student", date: { month: "Dec", day: 3, time: "6:00 PM", year: 2026 }, going: 204, world: "Health & Medicine", chapter: null },
  { id: "uw-e-ymu", kind: "Info night", title: "Young Men United info night", where: "Columbia, SC", virtual: false, about: "Meet mentors and past interns. Families welcome.", who: "Young men, grades 9 to 12", date: { month: "Jan", day: 14, time: "6:00 PM", year: 2027 }, going: 61, chapter: "mid" },
  { id: "uw-e-expo", kind: "Career expo", title: "OnTrack Career Expo", where: "Oakland, CA", virtual: false, about: "Hands-on booths and mentors who grew up like you.", who: "High school students", date: { month: "Mar", day: 14, time: "9:00 AM", year: 2027 }, going: 212, chapter: "bay", url: "https://uwba.org/get-involved/events/ontrack/2026-event/partnership/" },
];
export const EVENTS = NET_EVENTS;

const NET_SERVE: Shift[] = [
  { id: "s-food", kind: "Food drive", title: "Pack food boxes for families", where: "Your local United Way", date: { month: "Nov", day: 21, time: "9:00 AM", year: 2026 }, hours: 3, spots: 24, who: "Ages 14 and up", chapter: null },
  { id: "s-read", kind: "Reading buddy", title: "Read with a younger student", where: "Online", date: { month: "Dec", day: 2, time: "4:00 PM", year: 2026 }, hours: 1, spots: 40, who: "Ages 15 and up", chapter: null, check: true },
  { id: "s-mlk", kind: "Day of Service", title: "MLK Day of Service", where: "Your local United Way", date: { month: "Jan", day: 18, time: "10:00 AM", year: 2027 }, hours: 4, spots: 60, who: "All ages", chapter: null },
  { id: "s-expo", kind: "Event crew", title: "Help run the OnTrack Career Expo", where: "Oakland, CA", date: { month: "Mar", day: 14, time: "8:00 AM", year: 2027 }, hours: 5, spots: 12, who: "Ages 16 and up", chapter: "bay" },
  { id: "s-doa", kind: "Day of Action", title: "United Way Day of Action", where: "Your local United Way", date: { month: "Jun", day: 21, time: "9:00 AM", year: 2027 }, hours: 4, spots: 80, who: "All ages", chapter: null },
];


export const NETWORK: UwBoard = {
  id: UW_ID,
  name: "Student Success",
  line: "Mentors, programs and real jobs from United Way.",
  stats: [{ value: "1,100", label: "United Ways" }, { value: "8", label: "programs open" }],
  photos: { hero: PHOTOS.hero, heroFocus: "62% 40%", volunteers: PHOTOS.volunteers, volunteersFocus: "50% 40%" },
  map: "usa",
  chapters: NET_CHAPTERS,
  pick: "Find your United Way",
  programs: PROGRAMS,
  events: NET_EVENTS,
  serve: NET_SERVE,
  serveGoal: { logged: 6, target: 40, line: "Many schools and scholarships ask for 40." },
  youth: { title: "Start a Student United Way", line: "Give and serve with your school.", by: "United Way" },
  help: { title: "Need help at home?", line: "Food, rent, bills. Free and private.", call: "Call or text 2-1-1", url: "https://www.211.org" },
  clearance: { status: "Background check cleared", line: "Renews Mar 2027" },
  volunteerIds: [...VOLUNTEER_IDS],
  today: {
    since: ["3 new questions in your field", "Jordan thanked you", "2 shifts need people this week"],
    requests: [
      { id: "r2", kind: "Review", minutes: 15, title: "Check Jordan's résumé for Ignite" },
      { id: "r3", kind: "Speak", minutes: 45, title: "Join the Oct 23 first-job panel" },
      { id: "r4", kind: "Mentor", minutes: 60, title: "Mentor a senior in e-Mentorship" },
    ],
  },
  shifts: [
    { id: "v-panel", kind: "Panel", title: "Speak on the first-job panel", where: "Online", date: { month: "Oct", day: 23, time: "6:00 PM", year: 2026 }, hours: 1, spots: 1, who: "Any volunteer", chapter: null, length: "quick", check: true },
    { id: "v-resume", kind: "Résumé night", title: "Check résumés online", where: "Online", date: { month: "Nov", day: 12, time: "5:00 PM", year: 2026 }, hours: 1, spots: 9, who: "Any volunteer", chapter: null, length: "quick" },
    { id: "v-career", kind: "Career day", title: "Run a booth at Career Day", where: "Albuquerque, NM", date: { month: "Nov", day: 6, time: "8:00 AM", year: 2026 }, hours: 5, spots: 14, who: "Any volunteer", chapter: "nm", length: "day" },
    { id: "v-shadow", kind: "Job shadow", title: "Host a student for a day", where: "West Palm Beach, FL", date: { month: "Nov", day: 20, time: "8:00 AM", year: 2026 }, hours: 6, spots: 8, who: "Health care staff", chapter: "pbc", length: "day", check: true },
    { id: "v-mentor", kind: "Mentor", title: "Mentor a senior, Oct to Apr", where: "Online", date: { month: "Oct", day: 14, time: "4:00 PM", year: 2026 }, hours: 14, spots: 38, who: "Checked volunteers", chapter: "oc", length: "ongoing", check: true },
    { id: "v-expo", kind: "Expo mentor", title: "Mentor at OnTrack Career Expo", where: "Oakland, CA", date: { month: "Mar", day: 14, time: "8:30 AM", year: 2027 }, hours: 5, spots: 20, who: "Any volunteer", chapter: "bay", length: "day", check: true },
  ],
  myImpact: {
    tiles: [
      { key: "hours", value: "18", label: "Hours" },
      { key: "answers", value: "27", label: "Answers" },
      { key: "students", value: "31", label: "Students helped" },
      { key: "meetings", value: "6", label: "Mentor meetings" },
    ],
    goal: { logged: 18, target: 25 },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    hours: [0, 1, 2, 2, 2, 3, 2, 3, 3],
  },
  team: { you: "Deloitte", rows: [{ label: "Amazon", value: 612 }, { label: "Deloitte", value: 548 }, { label: "CVS Health", value: 421 }, { label: "JPMorgan Chase", value: 388 }, { label: "Mayo Clinic", value: 276 }] },
  thanks: [
    { from: "Jordan, senior", text: "Your résumé notes got me an interview." },
    { from: "Priya, junior", text: "I didn't know recruiting was a job. Now I want it." },
  ],
  impact: {
    outcome: { value: "71%", line: "took a career step within 30 days" },
    funnel: [{ label: "Reached", value: 3950 }, { label: "Explored", value: 3120 }, { label: "Joined", value: 1880 }, { label: "Matched", value: 702 }],
    tiles: [
      { key: "reached", month: "1,012", year: "3,950", label: "Youth reached" },
      { key: "matches", month: "64", year: "702", label: "Mentor matches" },
      { key: "hours", month: "214", year: "2,910", label: "Volunteer hours" },
      { key: "placements", month: "38", year: "344", label: "Internships" },
    ],
    trendBase: 120,
    grf: [
      { label: "Job skills training", value: 1880, goal: 2400, last: 1210 },
      { label: "On-time graduation", value: 96, goal: 100, last: 94, unit: "%" },
      { label: "Plan after high school", value: 71, goal: 85, last: 58, unit: "%" },
      { label: "Good attendance", value: 90, goal: 92, last: 87, unit: "%" },
    ],
    safety: [{ label: "Volunteers checked", value: "551" }, { label: "Direct messages", value: "Off" }, { label: "Flags this month", value: "3" }],
    careers: [
      { label: "Registered Nurse", world: "Health & Medicine", value: 412 },
      { label: "Software Developer", world: "Tech & Engineering", value: 356 },
      { label: "Electrician", world: "Tech & Engineering", value: 248 },
      { label: "Teacher", world: "Teaching & Education", value: 231 },
      { label: "Accountant", world: "Business & Finance", value: 187 },
    ],
    topics: [{ label: "Paying for college", value: 318 }, { label: "First jobs", value: 276 }, { label: "Health careers", value: 241 }, { label: "Internships", value: 198 }, { label: "Trades", value: 142 }],
    // DEMO-ONLY: monthly activity and plans; the latest month is the high
    monthly: [{ label: "Apr", total: 2100, unique: 820 }, { label: "May", total: 2480, unique: 930 }, { label: "Jun", total: 2310, unique: 900 }, { label: "Jul", total: 2760, unique: 1040 }, { label: "Aug", total: 2690, unique: 1010 }, { label: "Sep", total: 3240, unique: 1180 }],
    paths: [{ label: "4-year college", count: 412 }, { label: "2-year college or trade school", count: 286 }, { label: "Job or apprenticeship", count: 198 }, { label: "Military", count: 41 }, { label: "Still deciding", count: 163 }],
  },
  partnerPrograms: [
    { program: "e-Mentorship", by: "Orange County", students: 312, volunteers: 58, hours: 290 },
    { program: "Youth Career Connections", by: "Orange County", students: 486, volunteers: 64, hours: 410 },
    { program: "Mentor Center", by: "Palm Beach", students: 402, volunteers: 71, hours: 380 },
    { program: "Promise Student Advocates", by: "Salt Lake", students: 396, volunteers: 51, hours: 260 },
    { program: "Young Men United", by: "Midlands", students: 274, volunteers: 40, hours: 230 },
    { program: "Destination Graduation", by: "Orange County", students: 274, volunteers: 22, hours: 120 },
    { program: "Ignite Internships", by: "Southwest Virginia", students: 229, volunteers: 86, hours: 260 },
    { program: "Career Connections", by: "Miami", students: 198, volunteers: 30, hours: 140 },
  ],
  ops: [
    { label: "Shifts filled", value: 94, goal: 92 },
    { label: "Cleared within 3 days", value: 86, goal: 80 },
    { label: "Came back for a 2nd shift", value: 48, goal: 45 },
  ],
  roster: [
    { pro: "pro-reyes", checks: "done", hours: 24 },
    { pro: "pro-whitfield", checks: "done", hours: 21 },
    { pro: "pro-okafor", checks: "done", hours: 18 },
    { pro: "pro-brooks", checks: "training", hours: 4 },
    { pro: "pro-weiss", checks: "pending", hours: 0 },
    { pro: "pro-adler", checks: "pending", hours: 0 },
  ],
  network: {
    title: "National partners",
    items: [
      { name: "Big Brothers Big Sisters", line: "One-to-one mentors in schools", stat: "4 cities" },
      { name: "MENTOR", line: "Standards for mentor programs", stat: "5,000 programs" },
      { name: "Character Playbook", line: "With the NFL, for middle schools", stat: "1M students" },
    ],
  },
};

// ——— Mentorship tab: the e-Mentorship program ———
// Built like the Coach program (banner, Student / Mentor / United Way views,
// Home and Year plan), with the one rule high school needs: no direct
// messages. The program lead sets up every meeting, on a video call they
// open. Facts are Orange County United Way's (six-month program, six
// workshops, seniors from low income communities); the mentor, meetings and
// counts are demo.

export const MENTORSHIP_PROGRAM = {
  id: "united-way",
  title: "e-Mentorship",
  kind: "Mentor · High school",
  by: "Orange County United Way",
  photo: PHOTOS.mentor,
  line: "A mentor for your senior year.",
  meta: ["Seniors", "Oct to Apr", "Online"],
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

export const UWM = {
  views: [{ key: "student", label: "Student" }, { key: "mentor", label: "Mentor" }, { key: "partner", label: "United Way" }] as const,
  stages: [{ key: "none", label: "Not joined" }, { key: "applied", label: "Applied" }, { key: "matched", label: "Matched" }] as const,
  path: [
    { key: "interested", label: "Raise your hand" },
    { key: "applied", label: "Answer 3 questions" },
    { key: "matched", label: "Get matched" },
    { key: "met", label: "Meet your mentor" },
  ],
  safe: [
    { title: "No direct messages", line: "Your program lead sets up every meeting." },
    { title: "Checked mentors", line: "Background check and training first." },
    { title: "Group workshops", line: "Six online sessions with your class." },
  ],
  mentorsTitle: "Mentors come from these teams",
  form: {
    title: "Three quick questions",
    grade: { q: "What grade are you in?", options: ["11th", "12th"] },
    help: { q: "What do you want help with?", options: ["Picking a career", "College", "Paying for school", "First job"] },
    when: { q: "When are you free?", options: ["After school", "Evenings", "Weekends"] },
    submit: "Send",
  },
  waiting: { title: "You're in. Matching is next.", line: "We match you with a mentor by Oct 1.", meanwhile: "While you wait" },
  prep: [
    { label: "Your Top 3", href: "/profile?tab=top3" },
    { label: "Your résumé", href: "/resume-builder" },
    { label: "Career Report", href: "/profile?tab=report" },
  ],
  mentorId: "pro-okafor",
  mentorWhy: "Matched on: Business & Finance",
  lead: { title: "Your program lead", org: "Orange County United Way", line: "Your program lead sets up each meeting.", contact: "Contact program lead" },
  nextMeeting: { month: "Oct", day: 14, weekday: "Tuesday", time: "4:00 PM", kind: "Video call", by: "Set by your program lead" },
  meetings: { done: 1, total: 7 },
  goals: ["Pick two careers to look into", "Finish my FAFSA", "Practice one interview"],
  planMonths: [
    { month: "Oct", title: "Meet your mentor", focus: "Goals for the year", state: "current" as const },
    { month: "Nov", title: "Financial aid", focus: "FAFSA, step by step", state: "upcoming" as const },
    { month: "Dec", title: "Life after high school", focus: "College, trades, work", state: "upcoming" as const },
    { month: "Jan", title: "Stress and balance", focus: "Asking for help", state: "upcoming" as const },
    { month: "Feb", title: "Money basics", focus: "Pay, budgets, banks", state: "upcoming" as const },
    { month: "Mar", title: "Your first job", focus: "Résumé and interview", state: "upcoming" as const },
    { month: "Apr", title: "Wrap up", focus: "Your plan for next year", state: "upcoming" as const },
  ],
  mentee: { name: "Jordan Rivera", grade: "Senior", school: "Westfield High School", wants: ["Picking a career", "Paying for school"] },
  mentorChecks: [
    { label: "Background check", done: true },
    { label: "Two-hour training", done: true },
    { label: "Read Jordan's Top 3", done: false },
  ],
  mentorHours: { logged: 3, target: 14 },
  partner: {
    tiles: [
      { key: "enrolled", value: "312", label: "Seniors enrolled" },
      { key: "matched", value: "274", label: "Matched" },
      { key: "meetings", value: "641", label: "Meetings held" },
      { key: "mentors", value: "58", label: "Mentors" },
    ],
    funnel: [{ label: "Interested", value: 480 }, { label: "Applied", value: 312 }, { label: "Matched", value: 274 }, { label: "Met 3+ times", value: 221 }],
    onTrack: { value: 96, label: "on track to graduate" },
    workshops: [{ label: "Meet your mentor", value: 268 }, { label: "Financial aid", value: 241 }, { label: "Life after high school", value: 198 }],
    safety: [{ label: "Direct messages", value: "Off" }, { label: "Mentors checked", value: "100%" }, { label: "Flags this month", value: "0" }],
  },
};
