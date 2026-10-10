// United Way of South Central Michigan (10 Oct 2026). From the 8 Oct call
// with Stephanie Slingerland (UWSCMI) and Maisha. What the board does, in
// their words:
// - connect students to nonprofit and public sector careers across the
//   lifecycle: high school, college, young professional;
// - two affinity groups carry it: Student United and Young Leaders United,
//   and the board is the digital link between their in-person events;
// - four communities, each with its own space (Kalamazoo, Battle Creek,
//   Lansing, Jackson), plus a regional layer that mirrors their regional
//   convenings (the board's "Whole region" scope);
// - colleges: Michigan State, Western Michigan and the local community
//   colleges; users: students, nonprofits, colleges, corporate partners;
// - baseline engagement: students ask questions, professionals share
//   opportunities (the "Shared by professionals" section); program
//   registration and tracking come later;
// - what they measure: students connected to nonprofit and public sector
//   professionals, program participation, volunteer hours and
//   opportunities accessed, plus testimonials (the partner view's four
//   tiles and "In their words");
// - built to replicate; pilot April 2027 (one school system, one college),
//   wider rollout April 2028.
// Real: the four communities, the 2022 merger that made them one United
// Way (research doc, 8 Oct), Youth United Way Kalamazoo, Bigs in Schools
// Jackson, Battle Creek's Youth Day of Caring, the colleges named. Photos
// are United Ways' own (see uwMichigan.ts). Everything else is DEMO-ONLY,
// marked where it sits; the professionals' shared openings name generic
// local employers, never a real organization's made-up posting.

import { PHOTOS, type Chapter, type Program, type SharedOpportunity, type Shift, type UwBoard, type UwEvent } from "./uwData";

export const UW_SC_ID = "united-way-south-central";

const MI = {
  caring: "/images/connect/covers/uw-mi-caring.jpg",
  volunteers: "/images/connect/covers/uw-mi-hero.jpg",
  team: "/images/connect/covers/uw-mi-workplace.jpg",
  scholars: "/images/connect/covers/uw-mi-scholars.jpg",
};
const SITE = "https://unitedforscmi.org";

// DEMO-ONLY: students, volunteers and hours per community.
const COMMUNITIES: Chapter[] = [
  { id: "lan", name: "Lansing", short: "Lansing", place: "Ingham, Eaton and Clinton counties", lon: -84.55, lat: 42.73, students: 236, volunteers: 41, hours: 290, url: SITE },
  { id: "kzoo", name: "Kalamazoo", short: "Kalamazoo", place: "Kalamazoo County", lon: -85.59, lat: 42.29, students: 214, volunteers: 38, hours: 260, url: SITE },
  { id: "bc", name: "Battle Creek", short: "Battle Creek", place: "Calhoun County", lon: -85.18, lat: 42.32, students: 148, volunteers: 24, hours: 170, url: SITE },
  { id: "jx", name: "Jackson", short: "Jackson", place: "Jackson County", lon: -84.4, lat: 42.25, students: 112, volunteers: 19, hours: 130, url: SITE },
];

const PROGRAMS: Program[] = [
  {
    // the call named it; DEMO-ONLY: gets, steps and status until UWSCMI
    // shares the chapter details
    id: "sc-student-united", title: "Student United", kind: "lead", photo: MI.caring, focus: "50% 75%",
    line: "Serve and lead with students in your town.",
    gets: ["Meet people who work at nonprofits", "Plan service projects", "Chapters in high school and college"],
    who: "High school and college", when: "School year", where: "Kalamazoo, Battle Creek, Lansing, Jackson", by: "United Way of South Central Michigan", status: "open",
    steps: ["Raise your hand", "Join your town's chapter", "Lead a project"],
    chapter: null,
  },
  {
    // DEMO-ONLY: gets and status, as above
    id: "sc-young-leaders", title: "Young Leaders United", kind: "lead", photo: MI.team, focus: "50% 40%",
    line: "For young pros who want to give back.",
    gets: ["Meet leaders in nonprofits and government", "Serve as a group", "Meetups across the region"],
    who: "College and young professionals", when: "All year", where: "All four communities", by: "United Way of South Central Michigan", status: "open",
    chapter: null,
  },
  {
    // DEMO-ONLY: a proposal for what "professionals share opportunities"
    // grows into; not a UWSCMI program today
    id: "sc-internships", title: "Public service internships", kind: "internship", photo: PHOTOS.intern, focus: "50% 40%",
    line: "Paid summer work at nonprofits and city offices.",
    gets: ["Paid, 8 weeks", "A mentor at work", "Help with your résumé"],
    who: "Juniors, seniors and college students", when: "Summer 2027", where: "All four communities", by: "United Way of South Central Michigan · with local nonprofits", status: "soon",
    deadline: "Apply by Mar 1",
    chapter: null,
  },
  {
    // DEMO-ONLY: the colleges are the ones the call named; the program is a
    // proposal
    id: "sc-college", title: "College to career", kind: "college", photo: MI.scholars, focus: "50% 30%",
    line: "Meet students and grads who work for the public good.",
    gets: ["Campus visits", "Talks with grads at nonprofits", "Service that fits your major"],
    who: "High school and college", when: "School year", where: "Michigan State and Western Michigan", by: "United Way of South Central Michigan · with Michigan State and Western Michigan", status: "open",
    chapter: null,
  },
  {
    // DEMO-ONLY: as above
    id: "sc-community-college", title: "Start at community college", kind: "college", photo: PHOTOS.college, focus: "50% 30%",
    line: "Two years, low cost, then a public service job.",
    gets: ["KVCC, Kellogg, LCC or Jackson College", "Help to transfer", "Paid work while you study"],
    who: "High school seniors", when: "Spring", where: "Your local community college", by: "United Way of South Central Michigan · with local community colleges", status: "open",
    chapter: null,
  },
  {
    // WHY (10 Oct 2026): a teammate forwarded CapCAN as a Michigan program
    // to add ("See if we can use these anywhere and if yes, please do").
    // It is a Lansing college access network that works "through our
    // partnership with United Way" (capcan.org), so it sits with the
    // college programs, in the Lansing community. The four gets are the
    // services the forwarded note lists; the video series is the about
    // line. No season, count or price is published, so there is no "when",
    // no proof stat and nothing says free.
    id: "sc-capcan", title: "CapCAN", kind: "college", photo: PHOTOS.advocate, focus: "50% 30%",
    about: "They also post College Couch Corner videos.",
    line: "Help to get into college and pay for it.",
    gets: ["FAFSA and scholarship help", "College tours, in person or online", "Help with college applications", "Job boards and apprenticeships"],
    who: "Students and adults", where: "Lansing area", by: "Capital Area College Access Network · a United Way partner", status: "open",
    chapter: "lan",
    url: "https://capcan.org/",
  },
  {
    // DEMO-ONLY: research could not confirm Youth United Way still meets
    // (see uwMichigan.ts)
    id: "sc-yuw", title: "Youth United Way", kind: "lead", photo: PHOTOS.volunteers, focus: "50% 40%",
    line: "Teens decide where grant money goes.",
    gets: ["Visit local nonprofits", "Vote on real grants", "Lead with other teens"],
    who: "High school", when: "School year", where: "Kalamazoo County", by: "United Way of South Central Michigan", status: "open",
    proof: { value: "$1.2M+", label: "granted by teens since 1989" }, chapter: "kzoo",
    url: "https://unitedforscmi.org/youth-united-way-inspires-students-to-engage-deeply-in-community/",
  },
  {
    id: "sc-bigs", title: "Bigs in Schools", kind: "mentor", photo: PHOTOS.scholars, focus: "50% 35%",
    line: "A mentor who sticks with you.",
    gets: ["One mentor for years", "Meets at school or the library", "Help with school and money"],
    who: "Jackson County students", when: "School year", where: "Jackson County", by: "Big Brothers Big Sisters · funded by United Way of South Central Michigan", status: "open",
    chapter: "jx",
    url: "https://unitedforscmi.org/impact-long-term-mentoring-changes-lives/",
  },
];

// DEMO-ONLY: dates and "going" counts. The regional convening is the
// in-person moment the call described; chapter null puts it in every
// community's view.
const EVENTS: UwEvent[] = [
  { id: "sc-e-panel", kind: "Online panel", title: "Jobs that help your town", where: "Online", virtual: true, about: "A city planner, a social worker and a nonprofit director. Then you ask.", who: "Any student", date: { month: "Oct", day: 28, time: "6:00 PM", year: 2026 }, going: 142, chapter: null },
  { id: "sc-e-kickoff", kind: "Info night", title: "Student United kickoff", where: "Kalamazoo", virtual: false, about: "Meet your chapter. Pick your first project.", who: "High school and college", date: { month: "Nov", day: 5, time: "5:30 PM", year: 2026 }, going: 58, chapter: "kzoo" },
  { id: "sc-e-convening", kind: "Regional convening", title: "South Central convening", where: "Battle Creek", virtual: false, about: "All four towns meet. Students, nonprofits and colleges.", who: "Students and young pros", date: { month: "Nov", day: 14, time: "10:00 AM", year: 2026 }, going: 186, chapter: null },
  { id: "sc-e-capitol", kind: "Visit", title: "Public service day in Lansing", where: "Lansing", virtual: false, about: "See how state jobs work. Meet staff who started as interns.", who: "Juniors and seniors", date: { month: "Dec", day: 4, time: "9:00 AM", year: 2026 }, going: 64, chapter: "lan" },
  { id: "sc-e-ylu", kind: "Meetup", title: "Young Leaders United meetup", where: "Jackson", virtual: false, about: "Meet young pros who work for the public good.", who: "College and young pros", date: { month: "Jan", day: 22, time: "6:00 PM", year: 2027 }, going: 47, chapter: "jx" },
  { id: "sc-e-resume", kind: "Workshop", title: "Résumé check for internships", where: "Online", virtual: true, about: "Bring the résumé you built here. Get notes the same night.", who: "Any student", date: { month: "Feb", day: 9, time: "5:00 PM", year: 2027 }, going: 121, chapter: null },
];

// Youth Day of Caring is Battle Creek's real one (uwMichigan.ts). DEMO-ONLY:
// the other shifts, dates and spots.
const SERVE: Shift[] = [
  { id: "sc-s-crew", kind: "Event crew", title: "Help run the regional convening", where: "Battle Creek", date: { month: "Nov", day: 14, time: "8:30 AM", year: 2026 }, hours: 5, spots: 16, who: "Ages 16 and up", chapter: null },
  { id: "sc-s-food", kind: "Food drive", title: "Pack food boxes for families", where: "Lansing", date: { month: "Nov", day: 21, time: "9:00 AM", year: 2026 }, hours: 3, spots: 30, who: "Ages 14 and up", chapter: "lan" },
  { id: "sc-s-read", kind: "Reading buddy", title: "Read with a younger student", where: "Kalamazoo", date: { month: "Dec", day: 2, time: "4:00 PM", year: 2026 }, hours: 1, spots: 20, who: "Ages 15 and up", chapter: "kzoo", check: true },
  { id: "sc-s-mlk", kind: "Day of Service", title: "MLK Day of Service", where: "Jackson", date: { month: "Jan", day: 18, time: "10:00 AM", year: 2027 }, hours: 4, spots: 80, who: "All ages", chapter: "jx" },
  { id: "sc-s-youth-doc", kind: "Day of Caring", title: "Youth Day of Caring", where: "Battle Creek", date: { month: "May", day: 7, time: "9:00 AM", year: 2027 }, hours: 4, spots: 140, who: "High school", chapter: "bc" },
];

// "Professionals share opportunities" (the call's baseline). DEMO-ONLY:
// every opening; employers are generic on purpose.
const SHARED: SharedOpportunity[] = [
  { id: "sc-o-parks", title: "Parks summer intern", org: "A Lansing city office", kind: "Internship", line: "Paid, 8 weeks, ages 16 and up", proId: "pro-doyle", chapter: "lan", when: "Apply by Mar 1" },
  { id: "sc-o-tutor", title: "After-school tutor", org: "A Jackson youth program", kind: "Part-time job", line: "$15 an hour, 6 hours a week", proId: "pro-wong", chapter: "jx", when: "Starts Nov 10" },
  { id: "sc-o-shadow", title: "Shadow a public health nurse", org: "A Battle Creek clinic", kind: "Job shadow", line: "One day, juniors and seniors", proId: "pro-reyes", chapter: "bc", when: "Dec 10" },
  { id: "sc-o-food", title: "Youth volunteer lead", org: "A Kalamazoo food bank", kind: "Volunteer", line: "Saturdays, counts as service hours", proId: "pro-brooks", chapter: "kzoo", when: "Starts Nov 2" },
  { id: "sc-o-policy", title: "Policy research assistant", org: "A state office in Lansing", kind: "Internship", line: "For college students, 10 hours a week", proId: "pro-whitfield", chapter: "lan", when: "Spring 2027" },
];

export const SOUTH_CENTRAL: UwBoard = {
  id: UW_SC_ID,
  name: "South Central Michigan",
  line: "Find work that helps your town.",
  places: { all: "Whole region", tab: "By community", panel: "Students and volunteer hours by community" },
  shared: SHARED,
  stats: [{ value: "4", label: "communities" }, { value: String(PROGRAMS.length), label: "programs" }],
  // not uw-mi-students: that class photo carries West Michigan's banner
  photos: { hero: MI.volunteers, heroFocus: "50% 35%", volunteers: PHOTOS.hero, volunteersFocus: "50% 30%" },
  map: "southcentral",
  chapters: COMMUNITIES,
  pick: "Pick your community",
  programs: PROGRAMS,
  events: EVENTS,
  serve: SERVE,
  serveGoal: { logged: 6, target: 40, line: "Many scholarships ask for 40." },
  youth: { title: "Start a Student United chapter", line: "Bring it to your school or campus.", by: "United Way of South Central Michigan" },
  help: { title: "Need help at home?", line: "Food, rent, bills. Free and private.", call: "Call or text 2-1-1", url: "https://mi211.org", text: "898211" },
  clearance: { status: "Background check cleared", line: "Renews Mar 2027" },
  // nonprofit and public sector people lead (the call: connect students to
  // nonprofit and public sector professionals); corporate partners follow
  volunteerIds: ["pro-doyle", "pro-wong", "pro-reyes", "pro-brooks", "pro-whitfield", "pro-tanaka", "pro-okafor", "pro-ortega"],
  // DEMO-ONLY: the volunteer's day
  today: {
    since: ["4 new questions from Lansing and Jackson students", "12 students saved your internship post", "The regional convening needs 6 more volunteers"],
    requests: [
      { id: "sc-r1", kind: "Speak", minutes: 45, title: "Join the Oct 28 panel on jobs that help your town" },
      { id: "sc-r2", kind: "Review", minutes: 15, title: "Check Maya's résumé for a city internship" },
      { id: "sc-r3", kind: "Share", minutes: 10, title: "Post a summer opening at your organization" },
    ],
  },
  // DEMO-ONLY: adult shifts
  shifts: [
    { id: "sc-v-panel", kind: "Panel", title: "Speak on the public service panel", where: "Online", date: { month: "Oct", day: 28, time: "6:00 PM", year: 2026 }, hours: 1, spots: 2, who: "Nonprofit and public sector staff", chapter: null, length: "quick", check: true },
    { id: "sc-v-resume", kind: "Résumé night", title: "Check internship résumés online", where: "Online", date: { month: "Feb", day: 9, time: "5:00 PM", year: 2027 }, hours: 1, spots: 12, who: "Any volunteer", chapter: null, length: "quick" },
    { id: "sc-v-convening", kind: "Convening", title: "Host a table at the regional convening", where: "Battle Creek", date: { month: "Nov", day: 14, time: "9:00 AM", year: 2026 }, hours: 5, spots: 20, who: "Any volunteer", chapter: null, length: "day", check: true },
    { id: "sc-v-shadow", kind: "Job shadow", title: "Host a student for a day", where: "Lansing", date: { month: "Dec", day: 4, time: "9:00 AM", year: 2026 }, hours: 6, spots: 10, who: "Public sector staff", chapter: "lan", length: "day", check: true },
    { id: "sc-v-ylu", kind: "Service day", title: "Lead a Young Leaders United service day", where: "Kalamazoo", date: { month: "Mar", day: 6, time: "9:00 AM", year: 2027 }, hours: 4, spots: 25, who: "Young professionals", chapter: "kzoo", length: "day" },
    { id: "sc-v-bigs", kind: "Mentor", title: "Mentor with Bigs in Schools", where: "Jackson County schools", date: { month: "Nov", day: 4, time: "3:30 PM", year: 2026 }, hours: 14, spots: 20, who: "Checked volunteers", chapter: "jx", length: "ongoing", check: true },
  ],
  myImpact: {
    tiles: [
      { key: "hours", value: "14", label: "Hours" },
      { key: "answers", value: "19", label: "Answers" },
      { key: "students", value: "24", label: "Students helped" },
      { key: "meetings", value: "4", label: "Mentor meetings" },
    ],
    goal: { logged: 14, target: 24 },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    hours: [0, 1, 1, 1, 2, 2, 2, 2, 3],
  },
  team: { you: "Deloitte", rows: [{ label: "Deloitte", value: 312 }, { label: "Amazon", value: 268 }, { label: "CVS Health", value: 231 }, { label: "JPMorgan Chase", value: 186 }, { label: "Mayo Clinic", value: 142 }] },
  thanks: [
    { from: "Ava, junior", text: "I didn't know city planner was a job. Now I want it." },
    { from: "Jordan, college sophomore", text: "Your tip got me a nonprofit internship." },
  ],
  impact: {
    // DEMO-ONLY: every number below. The four tiles are the four measures
    // the call named, in its order.
    voices: [
      { from: "Student, Lansing", text: "I asked a social worker real questions. Now I know my next step." },
      { from: "Nonprofit director, Kalamazoo", text: "Two students from the board now volunteer with us every week." },
      { from: "College partner, Kalamazoo", text: "Our students found service work that fits their majors." },
    ],
    outcome: { value: "58%", line: "took a next step within 30 days" },
    funnel: [{ label: "Reached", value: 1240 }, { label: "Asked", value: 860 }, { label: "Connected", value: 520 }, { label: "Joined", value: 310 }],
    tiles: [
      { key: "connected", month: "84", year: "520", label: "Students connected" },
      { key: "participants", month: "46", year: "310", label: "Program participants" },
      { key: "hours", month: "138", year: "1,180", label: "Volunteer hours" },
      { key: "opportunities", month: "62", year: "470", label: "Opportunities accessed" },
    ],
    trendBase: 58,
    grf: [
      { label: "Met a nonprofit or public pro", value: 61, goal: 75, last: 48, unit: "%" },
      { label: "Came back for a 2nd event", value: 44, goal: 50, last: 37, unit: "%" },
      { label: "FAFSA filed", value: 59, goal: 70, last: 53, unit: "%" },
      { label: "Plan after high school", value: 66, goal: 80, last: 55, unit: "%" },
    ],
    safety: [{ label: "Volunteers checked", value: "142" }, { label: "Direct messages", value: "Off" }, { label: "Flags this month", value: "0" }],
    careers: [
      { label: "Social Worker", world: "Health & Medicine", value: 168 },
      { label: "Teacher", world: "Teaching & Education", value: 142 },
      { label: "Registered Nurse", world: "Health & Medicine", value: 131 },
      { label: "Urban Planner", world: "Tech & Engineering", value: 96 },
      { label: "Nonprofit Manager", world: "Business & Finance", value: 88 },
    ],
    topics: [{ label: "Nonprofit jobs", value: 188 }, { label: "Government jobs", value: 151 }, { label: "Paying for college", value: 132 }, { label: "Internships", value: 118 }, { label: "Service hours", value: 96 }],
    context: { value: "Apr 2027", line: "Pilot starts with one school system and one college", source: "United Way of South Central Michigan, Oct 2026" },
    monthly: [{ label: "Apr", total: 610, unique: 240 }, { label: "May", total: 700, unique: 268 }, { label: "Jun", total: 680, unique: 262 }, { label: "Jul", total: 790, unique: 296 }, { label: "Aug", total: 820, unique: 305 }, { label: "Sep", total: 960, unique: 352 }],
    paths: [{ label: "4-year college", count: 118 }, { label: "2-year college or trade school", count: 104 }, { label: "Job or apprenticeship", count: 72 }, { label: "Military", count: 12 }, { label: "Still deciding", count: 58 }],
  },
  // DEMO-ONLY: values, goals as uwMichigan.ts
  ops: [
    { label: "Shifts filled", value: 94, goal: 92 },
    { label: "Cleared within 3 days", value: 86, goal: 80 },
    { label: "Came back for a 2nd shift", value: 48, goal: 45 },
  ],
  partnerPrograms: [
    { program: "Student United", by: "Whole region", students: 220, volunteers: 18, hours: 260 },
    { program: "Young Leaders United", by: "Whole region", students: 64, volunteers: 22, hours: 210 },
    { program: "Public service internships", by: "Whole region", students: 48, volunteers: 12, hours: 160 },
    { program: "College to career", by: "Lansing and Kalamazoo", students: 140, volunteers: 10, hours: 70 },
    { program: "Start at community college", by: "Whole region", students: 90, volunteers: 6, hours: 40 },
    // DEMO-ONLY: CapCAN's counts on this board, like every row here
    { program: "CapCAN", by: "Lansing", students: 84, volunteers: 6, hours: 50 },
    { program: "Youth United Way", by: "Kalamazoo", students: 96, volunteers: 8, hours: 90 },
    { program: "Bigs in Schools", by: "Jackson", students: 112, volunteers: 19, hours: 130 },
  ],
  // WHY (10 Oct 2026): the same forwarded note listed UWSCMI's Kalamazoo
  // small business programs. They are for business owners, not students,
  // so they stay off the student and volunteer views and sit on the United
  // Way view only, as one small panel that links to each program's page.
  // Status is the pages' own, never shown as open: the loan fund's page
  // says it is currently inactive and points to the grants; the grants'
  // portal is closed and the page says to follow their social media for
  // updates. $5,000 and "City of Kalamazoo" are from the grants' page.
  community: {
    title: "Small business help",
    items: [
      { name: "Kalamazoo Micro-Enterprise Grants", line: "$5,000 grants for very small businesses in the City of Kalamazoo.", status: "Closed for now", url: "https://unitedforscmi.org/battle-creek-kalamazoo/kalamazoo-micro-enterprise-grants/" },
      { name: "Kalamazoo Small Business Loan Fund", line: "Its page points to the grants instead.", status: "Inactive", url: "https://unitedforscmi.org/battle-creek-kalamazoo/kalamazoo-small-business-loan-fund/" },
    ],
  },
  roster: [
    { pro: "pro-doyle", checks: "done", hours: 18 },
    { pro: "pro-wong", checks: "done", hours: 15 },
    { pro: "pro-reyes", checks: "done", hours: 12 },
    { pro: "pro-whitfield", checks: "done", hours: 9 },
    { pro: "pro-brooks", checks: "training", hours: 3 },
    { pro: "pro-tanaka", checks: "pending", hours: 0 },
  ],
};
