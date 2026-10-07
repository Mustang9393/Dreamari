// United Way · Michigan (8 Oct 2026). Chandu: "lets please do very detailed
// research on United Way Michigan and rebuild the board for that
// specifically", then "build one with the broader network view and one
// specific to Michigan". Same engine as the network board (uwData.ts),
// Michigan's own content. Research: docs/reference/united-way-michigan-
// research-2026-10-08.md. What it changed versus a naive Michigan board:
// - Michigan has "approximately 35" local United Ways (Michigan Association
//   of United Ways, May 2026), and several merged recently: Capital Area
//   (Lansing), Battle Creek and Kalamazoo, and Jackson are one United Way of
//   South Central Michigan (2022); Washtenaw joined Southeastern Michigan
//   (2023); Ottawa and Allegan joined Heart of West Michigan (2024);
//   Northwest Michigan closed on 30 Sept 2026 and the state association
//   serves its counties. So the map shows today's organisations, not old
//   names.
// - Detroit's high school career work (College and Career Pathways, the
//   "Find Your Future" fair) is 2017 to 2019 history, and Grow Detroit's
//   Young Talent is the City's program, not United Way's. Neither is shown
//   as a United Way program; GDYT is pointed to in a Q&A answer
//   (uwThreads.ts), because a Detroit teen needs to know it exists.
// - No Michigan United Way runs its own mentoring for high schoolers; they
//   fund partners (Big Brothers Big Sisters, Winning Futures). Cards say
//   who runs it and who funds it, and nothing here hands off to the
//   Mentorship tab.
// - What Michigan United Ways do run for teens is service and leadership:
//   Student United Way, Youth United Way, Youth Genesee Serves, Days of
//   Caring. So Serve carries real shifts and Programs leads with them.
// Photos are the Michigan United Ways' own (Heart of West Michigan United
// Way's Student United Way class and 2025 Day of Caring; United Way for
// Southeastern Michigan's volunteers, a WCC graduate and Detroit), plus
// unitedway.org's where Michigan had none.

import { PHOTOS, VOLUNTEER_IDS, type Chapter, type Program, type Shift, type UwBoard, type UwEvent } from "./uwData";

export const UW_MI_ID = "united-way-michigan";

const MI = {
  hero: "/images/connect/covers/uw-mi-students.jpg",
  caring: "/images/connect/covers/uw-mi-caring.jpg",
  volunteers: "/images/connect/covers/uw-mi-hero.jpg",
  team: "/images/connect/covers/uw-mi-workplace.jpg",
  scholars: "/images/connect/covers/uw-mi-scholars.jpg",
  detroit: "/images/connect/covers/uw-mi-city.jpg",
};

// DEMO-ONLY: students, volunteers and hours per United Way are demo counts.
const CHAPTERS: Chapter[] = [
  { id: "semi", name: "United Way for Southeastern Michigan", short: "Southeast Michigan", place: "Detroit · 4 counties", lon: -83.08, lat: 42.37, students: 486, volunteers: 74, hours: 410, url: "https://unitedwaysem.org" },
  { id: "hwm", name: "Heart of West Michigan United Way", short: "West Michigan", place: "Grand Rapids · 3 counties", lon: -85.67, lat: 42.96, students: 312, volunteers: 48, hours: 290, url: "https://www.hwmuw.org" },
  { id: "scmi", name: "United Way of South Central Michigan", short: "South Central", place: "Lansing, Kalamazoo, Battle Creek, Jackson · 6 counties", lon: -84.55, lat: 42.73, students: 268, volunteers: 41, hours: 220, url: "https://unitedforscmi.org" },
  { id: "lake", name: "United Way of the Lakeshore", short: "Lakeshore", place: "Muskegon · 3 counties", lon: -86.25, lat: 43.23, students: 142, volunteers: 22, hours: 120, url: "https://www.unitedwaylakeshore.org" },
  { id: "gen", name: "United Way of Genesee County", short: "Genesee", place: "Flint · 2 counties", lon: -83.69, lat: 43.01, students: 96, volunteers: 15, hours: 80, url: "https://www.unitedwaygenesee.org" },
  { id: "bay", name: "United Way of Bay County", short: "Bay County", place: "Bay City · 3 counties", lon: -83.89, lat: 43.59, students: 54, volunteers: 9, hours: 60, url: "https://www.unitedwaybaycounty.org" },
  { id: "mid", name: "United Way of Midland County", short: "Midland", place: "Midland · 1 county", lon: -84.25, lat: 43.62, students: 41, volunteers: 6, hours: 40, url: "https://unitedwaymidland.org" },
  { id: "mqt", name: "United Way of Marquette County", short: "Marquette", place: "Marquette · 1 county", lon: -87.4, lat: 46.54, students: 38, volunteers: 8, hours: 50, url: "https://www.uwmqt.org" },
];

const PROGRAMS: Program[] = [
  {
    id: "mi-suw", title: "Student United Way", kind: "lead", photo: MI.caring, focus: "50% 75%",
    line: "Give, serve and speak up with your school.",
    gets: ["Run a giving drive", "Plan service projects", "Pitch ideas to nonprofits"],
    who: "High school", when: "School year", where: "Grand Rapids and Wyoming", by: "Heart of West Michigan United Way", status: "open",
    steps: ["Raise your hand", "Join a committee", "Lead a project"],
    proof: { value: "174", label: "students last year" }, chapter: "hwm",
    url: "https://www.nhaschools.com/en/blog/news/from-classroom-to-community-nha-high-schools-give",
  },
  {
    id: "mi-winning-futures", title: "Winning Futures", kind: "mentor", photo: PHOTOS.mentor, focus: "50% 30%",
    line: "A business mentor at school, from 10th grade on.",
    gets: ["A trained business mentor", "Meets at school, in the school day", "Lessons on jobs and money"],
    who: "10th to 12th grade", when: "Nov to May", where: "Metro Detroit schools", by: "Winning Futures · funded by United Way for Southeastern Michigan", status: "open",
    steps: ["Raise your hand", "Your school signs up", "Meet your mentor"],
    proof: { value: "$30,000", label: "in scholarships in 2024" }, chapter: "semi", world: "Business & Finance",
    url: "https://unitedwaysem.org/wp-content/uploads/2026/04/090-2026-8.5x11-2024-25-Annual-Report-V1-copy.pdf",
  },
  {
    id: "mi-pathways", title: "Career Pathways", kind: "work", photo: PHOTOS.ignite, focus: "60% 40%",
    line: "Try jobs. Get work experience. See colleges.",
    gets: ["Summer work experience", "MiCareerQuest career day", "College visits"],
    who: "High school", when: "School year and summer", where: "Muskegon area", by: "United Way of the Lakeshore · with West Michigan Works", status: "open",
    proof: { value: "892", label: "students in 2025" }, chapter: "lake", world: "Tech & Engineering",
    url: "https://www.unitedwaylakeshore.org/health-1",
  },
  {
    id: "mi-discoverworks", title: "DiscoverWorks", kind: "summer", photo: MI.detroit, focus: "50% 55%",
    line: "Free summer learning, up to 10th grade.",
    gets: ["Free, full days", "Half-day for 9th and 10th", "Reading and math gains"],
    who: "Rising 9th and 10th graders", when: "Summer", where: "Metro Detroit", by: "United Way for Southeastern Michigan", status: "soon",
    deadline: "Sign-ups open in spring",
    proof: { value: "26,778", label: "students in 2025" }, chapter: "semi",
    url: "https://unitedwaysem.org/resources/discoverworks/",
  },
  {
    // DEMO-ONLY: research could not confirm Youth United Way still meets;
    // its last published story is older. Status shown as open for the demo.
    id: "mi-yuw", title: "Youth United Way", kind: "lead", photo: PHOTOS.volunteers, focus: "50% 40%",
    line: "Teens decide where grant money goes.",
    gets: ["Visit local nonprofits", "Vote on real grants", "Lead with other teens"],
    who: "High school", when: "School year", where: "Kalamazoo County", by: "United Way of South Central Michigan", status: "open",
    proof: { value: "$1.2M+", label: "granted by teens since 1989" }, chapter: "scmi",
    url: "https://unitedforscmi.org/youth-united-way-inspires-students-to-engage-deeply-in-community/",
  },
  {
    id: "mi-bigs", title: "Bigs in Schools", kind: "mentor", photo: PHOTOS.scholars, focus: "50% 35%",
    line: "A Big who meets you at school.",
    gets: ["One mentor for years", "Meets at school or the library", "Help with school and money"],
    who: "Jackson County students", when: "School year", where: "Jackson County", by: "Big Brothers Big Sisters · funded by United Way of South Central Michigan", status: "open",
    chapter: "scmi",
    url: "https://unitedforscmi.org/impact-long-term-mentoring-changes-lives/",
  },
  {
    id: "mi-college-opp", title: "College Opportunity Program", kind: "college", photo: MI.scholars, focus: "50% 30%",
    line: "Plan for college with help.",
    gets: ["Help picking a college", "Help paying for it", "A mentor along the way"],
    who: "High school", when: "School year", where: "Midland County", by: "West Midland Family Center · funded by United Way of Midland County", status: "open",
    chapter: "mid",
    url: "https://unitedwaymidland.org/what-we-do/youth-success/",
  },
  {
    // the published page shows the 2019-20 round; the grant ranges are its
    id: "mi-ygs", title: "Youth Genesee Serves", kind: "lead", photo: MI.team, focus: "50% 40%",
    line: "Get up to $1,500 for your service idea.",
    gets: ["Grants of $300 to $1,500", "Your idea, your team", "Help to plan it"],
    who: "Ages 5 to 18", when: "School year", where: "Genesee County", by: "United Way of Genesee County", status: "returning",
    chapter: "gen",
    url: "https://www.unitedwaygenesee.org/youth-genesee-serves",
  },
];

// Events a student attends. Michigan United Ways published no high school
// career fair for 2026-27, so the career events are this board's own
// online ones (volunteers from the board), plus MiCareerQuest, which the
// Lakeshore pathway uses. DEMO-ONLY: dates and "going" counts below are
// demo except Teen and Tween Night (20 May 2027, uwmqt.org).
const EVENTS: UwEvent[] = [
  { id: "mi-e-fafsa", kind: "Workshop", title: "FAFSA night", where: "Online", virtual: true, about: "Fill out the FAFSA step by step, with help. Michigan grants need it too.", who: "Seniors and families", date: { month: "Oct", day: 27, time: "6:30 PM", year: 2026 }, going: 164, chapter: null },
  { id: "mi-e-trades", kind: "Online panel", title: "Skilled trades in Michigan", where: "Online", virtual: true, about: "An electrician, a welder and a lineworker. Paid training, no debt.", who: "Any student", date: { month: "Nov", day: 5, time: "6:00 PM", year: 2026 }, going: 231, world: "Tech & Engineering", chapter: null },
  { id: "mi-e-mcq", kind: "Career day", title: "MiCareerQuest", where: "West Michigan", virtual: false, about: "Try real tools from real jobs. Health, trades, tech and more.", who: "9th and 10th grade", date: { month: "Nov", day: 18, time: "8:30 AM", year: 2026 }, going: 412, chapter: "lake" },
  { id: "mi-e-health", kind: "Online panel", title: "Health jobs without med school", where: "Online", virtual: true, about: "A nurse, a pharmacist and a therapist. Two years of school or less to start.", who: "Any student", date: { month: "Dec", day: 3, time: "6:00 PM", year: 2026 }, going: 198, world: "Health & Medicine", chapter: null },
  { id: "mi-e-suw", kind: "Info night", title: "Student United Way info night", where: "Wyoming High School", virtual: false, about: "See what the committees do. Bring a friend.", who: "Grades 9 to 12", date: { month: "Jan", day: 21, time: "5:30 PM", year: 2027 }, going: 58, chapter: "hwm" },
  { id: "mi-e-resume", kind: "Workshop", title: "Résumé check for summer jobs", where: "Online", virtual: true, about: "Bring the résumé you built here. Get notes the same night.", who: "Any student", date: { month: "Feb", day: 10, time: "5:00 PM", year: 2027 }, going: 187, chapter: null },
  { id: "mi-e-teen", kind: "Teen night", title: "Teen and Tween Night", where: "Marquette", virtual: false, about: "Talks and games for teens at the youth center.", who: "Ages 11 to 17", date: { month: "May", day: 20, time: "6:00 PM", year: 2027 }, going: 44, chapter: "mqt", url: "https://www.uwmqt.org/" },
];

// Serve: real Michigan United Way volunteer days that take teens. Dates are
// published ones where research found them (Fresh Coast 12-19 Oct 2026 and
// Halloween Fun 30 Oct 2026, uwmqt.org; MLK Day is the third Monday). Stuff
// the Sled, Youth Day of Caring and the Muskegon Day of Caring use their
// usual months. DEMO-ONLY: spots left and exact dates for those three.
const SERVE: Shift[] = [
  { id: "mi-s-film", kind: "Festival crew", title: "Fresh Coast Film Festival", where: "Marquette", date: { month: "Oct", day: 17, time: "10:00 AM", year: 2026 }, hours: 4, spots: 9, who: "Ages 14 and up", chapter: "mqt" },
  { id: "mi-s-halloween", kind: "Youth center", title: "Halloween Fun for kids", where: "Lake Superior Village Youth Center", date: { month: "Oct", day: 30, time: "4:00 PM", year: 2026 }, hours: 3, spots: 6, who: "Ages 14 and up", chapter: "mqt" },
  { id: "mi-s-sled", kind: "Holiday drive", title: "Stuff the Sled holiday bags", where: "Grand Rapids", date: { month: "Nov", day: 21, time: "9:00 AM", year: 2026 }, hours: 3, spots: 30, who: "Ages 14 and up", chapter: "hwm" },
  { id: "mi-s-mlk", kind: "Day of Service", title: "MLK Day of Service", where: "Flint", date: { month: "Jan", day: 18, time: "10:00 AM", year: 2027 }, hours: 4, spots: 120, who: "All ages", chapter: "gen" },
  { id: "mi-s-muskegon", kind: "Day of Caring", title: "Muskegon Day of Caring", where: "Muskegon", date: { month: "Apr", day: 23, time: "8:30 AM", year: 2027 }, hours: 4, spots: 80, who: "School groups welcome", chapter: "lake" },
  { id: "mi-s-youth-doc", kind: "Day of Caring", title: "Youth Day of Caring", where: "Battle Creek", date: { month: "May", day: 7, time: "9:00 AM", year: 2027 }, hours: 4, spots: 140, who: "High school", chapter: "scmi" },
];

export const MICHIGAN: UwBoard = {
  id: UW_MI_ID,
  name: "Michigan",
  line: "Lead, serve and find real work with Michigan's United Ways.",
  stats: [{ value: "35", label: "United Ways" }, { value: "8", label: "programs" }],
  photos: { hero: MI.hero, heroFocus: "50% 40%", volunteers: MI.volunteers, volunteersFocus: "50% 35%" },
  map: "michigan",
  chapters: CHAPTERS,
  pick: "Find your Michigan United Way",
  programs: PROGRAMS,
  events: EVENTS,
  serve: SERVE,
  serveGoal: { logged: 6, target: 40, line: "Many schools and scholarships ask for 40." },
  youth: { title: "Bring Student United Way to your school", line: "Wyoming High joins this fall. Yours could be next.", by: "Heart of West Michigan United Way", url: "https://www.hwmuw.org/impact-reports/2024-25-impact-report" },
  help: { title: "Need help at home?", line: "Food, rent, bills. Free and private.", call: "Call 211 or text your ZIP to 898211", url: "https://mi211.org" },
  volunteerIds: [...VOLUNTEER_IDS],
  today: {
    since: ["3 new questions from Michigan students", "Nia thanked you", "Stuff the Sled needs 12 more people"],
    requests: [
      { id: "mi-r1", kind: "Review", minutes: 15, title: "Check Eli's résumé for a summer job" },
      { id: "mi-r2", kind: "Speak", minutes: 45, title: "Join the Nov 5 skilled trades panel" },
      { id: "mi-r3", kind: "Speak", minutes: 30, title: "Talk careers with a Student United Way committee" },
    ],
  },
  // DEMO-ONLY: dates and spots for adult shifts. Kinds are real: UWSEM's
  // volunteer hub lists reading and tutoring roles; Teen and Tween Night
  // asks for presenters (uwmqt.org); Bay County's Lifted Voices trains adults
  // who work with youth (unitedwaybaycounty.org).
  shifts: [
    { id: "mi-v-panel", kind: "Panel", title: "Speak on the skilled trades panel", where: "Online", date: { month: "Nov", day: 5, time: "6:00 PM", year: 2026 }, hours: 1, spots: 1, who: "Trades workers", chapter: null, length: "quick" },
    { id: "mi-v-resume", kind: "Résumé night", title: "Check résumés online", where: "Online", date: { month: "Feb", day: 10, time: "5:00 PM", year: 2027 }, hours: 1, spots: 12, who: "Any volunteer", chapter: null, length: "quick" },
    { id: "mi-v-mcq", kind: "Career day", title: "Run a booth at MiCareerQuest", where: "West Michigan", date: { month: "Nov", day: 18, time: "8:00 AM", year: 2026 }, hours: 5, spots: 24, who: "Any volunteer", chapter: "lake", length: "day" },
    { id: "mi-v-sled", kind: "Holiday drive", title: "Stuff the Sled holiday bags", where: "Grand Rapids", date: { month: "Nov", day: 21, time: "9:00 AM", year: 2026 }, hours: 3, spots: 12, who: "Any volunteer", chapter: "hwm", length: "day" },
    { id: "mi-v-lifted", kind: "Training", title: "Lifted Voices: walk in a teen's shoes", where: "Bay City", date: { month: "Dec", day: 9, time: "9:00 AM", year: 2026 }, hours: 2, spots: 18, who: "Adults who work with youth", chapter: "bay", length: "quick" },
    { id: "mi-v-tutor", kind: "Tutor", title: "Read and tutor with students", where: "Metro Detroit", date: { month: "Nov", day: 2, time: "3:30 PM", year: 2026 }, hours: 20, spots: 40, who: "Checked volunteers", chapter: "semi", length: "ongoing" },
    { id: "mi-v-wf", kind: "Mentor", title: "Mentor with Winning Futures", where: "Metro Detroit schools", date: { month: "Nov", day: 4, time: "10:00 AM", year: 2026 }, hours: 14, spots: 26, who: "Checked volunteers", chapter: "semi", length: "ongoing" },
    { id: "mi-v-teen", kind: "Presenter", title: "Present at Teen and Tween Night", where: "Marquette", date: { month: "May", day: 20, time: "6:00 PM", year: 2027 }, hours: 2, spots: 4, who: "Any volunteer", chapter: "mqt", length: "quick" },
  ],
  myImpact: {
    tiles: [
      { key: "hours", value: "16", label: "Hours" },
      { key: "answers", value: "22", label: "Answers" },
      { key: "students", value: "28", label: "Students helped" },
      { key: "meetings", value: "5", label: "Mentor meetings" },
    ],
    goal: { logged: 16, target: 24 },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    hours: [0, 1, 1, 2, 2, 2, 2, 3, 3],
  },
  team: { you: "Deloitte", rows: [{ label: "Deloitte", value: 486 }, { label: "Amazon", value: 412 }, { label: "CVS Health", value: 351 }, { label: "JPMorgan Chase", value: 298 }, { label: "Mayo Clinic", value: 204 }] },
  thanks: [
    { from: "Nia, junior", text: "Now I know what a nurse does all day. I want it." },
    { from: "Eli, senior", text: "Your notes got me a summer job interview." },
  ],
  impact: {
    outcome: { value: "68%", line: "took a career step within 30 days" },
    funnel: [{ label: "Reached", value: 1820 }, { label: "Explored", value: 1410 }, { label: "Joined", value: 760 }, { label: "Served", value: 498 }],
    tiles: [
      { key: "reached", month: "462", year: "1,820", label: "Youth reached" },
      { key: "matches", month: "22", year: "214", label: "Mentor matches" },
      { key: "hours", month: "118", year: "1,270", label: "Volunteer hours" },
      { key: "placements", month: "212", year: "2,140", label: "Teen service hours" },
    ],
    trendBase: 64,
    grf: [
      { label: "Job skills training", value: 760, goal: 1000, last: 540 },
      { label: "On-time graduation", value: 93, goal: 95, last: 91, unit: "%" },
      { label: "Plan after high school", value: 66, goal: 80, last: 55, unit: "%" },
      { label: "FAFSA filed", value: 61, goal: 70, last: 57, unit: "%" },
    ],
    safety: [{ label: "Volunteers checked", value: "223" }, { label: "Direct messages", value: "Off" }, { label: "Flags this month", value: "1" }],
    careers: [
      { label: "Registered Nurse", world: "Health & Medicine", value: 198 },
      { label: "Electrician", world: "Tech & Engineering", value: 164 },
      { label: "Mechanical Engineer", world: "Tech & Engineering", value: 141 },
      { label: "Software Developer", world: "Tech & Engineering", value: 127 },
      { label: "Teacher", world: "Teaching & Education", value: 96 },
    ],
    topics: [{ label: "Summer jobs", value: 214 }, { label: "Paying for college", value: 188 }, { label: "Trades", value: 161 }, { label: "Health careers", value: 132 }, { label: "Service hours", value: 104 }],
    // ALICE in Michigan, 2026 update (2024 data), Michigan Association of
    // United Ways: 67% of households headed by someone under 25 are below
    // the ALICE Threshold (40% of all Michigan households).
    context: { value: "67%", line: "of Michigan households led by someone under 25 can't cover the basics", source: "ALICE in Michigan, 2026 update" },
  },
  partnerPrograms: [
    { program: "Student United Way", by: "West Michigan", students: 174, volunteers: 12, hours: 269 },
    { program: "Career Pathways", by: "Lakeshore", students: 142, volunteers: 22, hours: 120 },
    { program: "Winning Futures", by: "Southeast Michigan", students: 238, volunteers: 52, hours: 310 },
    { program: "DiscoverWorks", by: "Southeast Michigan", students: 248, volunteers: 22, hours: 100 },
    { program: "Youth United Way", by: "South Central", students: 96, volunteers: 8, hours: 90 },
    { program: "Bigs in Schools", by: "South Central", students: 172, volunteers: 33, hours: 130 },
    { program: "Youth Genesee Serves", by: "Genesee", students: 96, volunteers: 15, hours: 80 },
    { program: "College Opportunity Program", by: "Midland", students: 41, volunteers: 6, hours: 40 },
  ],
  roster: [
    { pro: "pro-whitfield", checks: "done", hours: 19 },
    { pro: "pro-reyes", checks: "done", hours: 16 },
    { pro: "pro-tanaka", checks: "done", hours: 14 },
    { pro: "pro-ortega", checks: "training", hours: 3 },
    { pro: "pro-wong", checks: "pending", hours: 0 },
    { pro: "pro-rossi", checks: "pending", hours: 0 },
  ],
  network: {
    title: "Across Michigan",
    items: [
      { name: "Michigan 2-1-1", line: "Help requests last year", stat: "625,852" },
      { name: "ALICE in Michigan", line: "Households below the line", stat: "40%" },
      { name: "Days of Caring", line: "Volunteers at Bay County's 2026 day", stat: "800+" },
    ],
  },
};
