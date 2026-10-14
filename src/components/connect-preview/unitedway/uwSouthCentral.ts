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
//   opportunities; program registration and tracking come later. (13 Oct
//   2026, Chandu: "Remove all professionals sharing internships or
//   opportunities from the board altogether", so openings come only from
//   United Way's own programs.)
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

import { PHOTOS, type Chapter, type Program, type Shift, type StaffMember, type StaffPost, type UwBoard, type UwEvent } from "./uwData";

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
    // WHY (13 Oct 2026, Chandu: "Maybe small business help thing should be
    // a program card like CapCAN is"). Odein's note listed UWSCMI's
    // Kalamazoo small business programs; they were a panel on the United
    // Way view, removed earlier today with "small business help". Now one
    // program card in Kalamazoo. Never shown as open: the grants' portal is
    // closed (follow their social media for the next round) and the loan
    // fund's page says it is inactive and points to the grants. $5,000 and
    // "City of Kalamazoo" are from the grants' page.
    id: "sc-small-business", title: "Small business help", kind: "work", photo: PHOTOS.workplace, focus: "50% 35%",
    line: "Grants and loans for small businesses in Kalamazoo.",
    about: "Both are paused right now. A new round is posted on their social media.",
    gets: ["Micro-enterprise grants up to $5,000", "A small business loan fund", "For businesses in the City of Kalamazoo"],
    who: "Small business owners", where: "City of Kalamazoo", by: "United Way of South Central Michigan", status: "closed",
    chapter: "kzoo",
    url: "https://unitedforscmi.org/battle-creek-kalamazoo/kalamazoo-micro-enterprise-grants/",
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
  // WHY (12 Oct 2026): the client asked for "a space like our events tab
  // where participants could keep the conversation going after events were
  // done". A regional convening is where all four communities meet, so the
  // past one is the board that stays open: the cross-community talk and the
  // event follow-up meet here. DEMO-ONLY: the date, counts, posts and
  // files; the groups at the tables are generic, the colleges are the
  // ones the call named.
  {
    id: "sc-e-fall-convening", kind: "Regional convening", title: "Fall regional convening", where: "Kalamazoo", virtual: false, about: "All four towns met. Students, nonprofits and colleges.", who: "Students and young pros", date: { month: "Sep", day: 26, time: "10:00 AM", year: 2026 }, going: 164, chapter: null, joined: true,
    followUp: {
      closesOn: "November 7, 2026", students: 164, pros: 12, posts: 23,
      // DEMO-ONLY: the code and the photo count. Photos are United Ways' own;
      // not uw-mi-students, whose banner is West Michigan's
      code: "UWSCFALL", photos: { count: 41, images: [MI.caring, MI.volunteers, MI.team, MI.scholars, "/images/connect/covers/uw-mi-city.jpg", PHOTOS.volunteers] },
      official: {
        postedAgo: "2w ago",
        summary: "164 students from Kalamazoo, Battle Creek, Lansing and Jackson met in Kalamazoo. They talked with nonprofits, city staff and colleges. Then they planned one service day for all four towns.",
        about: "United Way of South Central Michigan links four communities. The convening is where all four meet in person.",
        next: ["Post one thing you learned in Questions.", "Follow a volunteer you met at a table.", "Save the next convening, Nov 14 in Battle Creek."],
      },
      recap: { proId: "pro-doyle", postedAgo: "2w ago", takeaways: ["Nonprofit and city jobs need all kinds of skills: writing, numbers, people and tech.", "Four towns can plan one project. Start with one shared day.", "Ask the people you met one question this month. Post it here so everyone learns."] },
      resources: [
        { kind: "slides", title: "Opening talk slides", description: "The welcome and the plan for the year.", sourceLabel: "United Way of South Central Michigan", meta: "12 slides" },
        { kind: "pdf", title: "Notes from each table", description: "What each table talked about, one page each.", sourceLabel: "Student United", meta: "PDF · 4 pages" },
        { kind: "folder", title: "Who hosted a table", description: "The groups students met.", sourceLabel: "United Way of South Central Michigan", meta: "6 groups", items: ["A Kalamazoo food bank", "A Lansing city office", "A Battle Creek clinic", "A Jackson youth program", "Michigan State", "Western Michigan"] },
      ],
      proIds: ["pro-doyle", "pro-wong", "pro-reyes", "pro-brooks"],
    },
  },
  { id: "sc-e-panel", kind: "Online panel", title: "Jobs that help your town", where: "Online", virtual: true, about: "A city planner, a social worker and a nonprofit director. Then you ask.", who: "Any student", date: { month: "Oct", day: 28, time: "6:00 PM", year: 2026 }, going: 142, chapter: null, joined: true },
  // DEMO-ONLY (13 Oct 2026): a second past event, still locked, so the
  // board shows one joined board and one behind its code
  {
    id: "sc-e-ylu-summer", kind: "Meetup", title: "Young Leaders United summer meetup", where: "Jackson", virtual: false, about: "Young pros and college students met nonprofit leaders in Jackson.", who: "College and young pros", date: { month: "Aug", day: 20, time: "6:00 PM", year: 2026 }, going: 52, chapter: "jx",
    followUp: {
      closesOn: "October 31, 2026", students: 52, pros: 6, posts: 8, code: "UWYLU",
      photos: { count: 16, images: [MI.team, MI.volunteers, MI.caring, PHOTOS.volunteers, MI.scholars] },
      official: { postedAgo: "7w ago", summary: "52 young leaders met nonprofit staff in Jackson. Many signed up to serve this fall.", about: "Young Leaders United meets in all four towns.", next: ["Post what you learned in Questions.", "Join a service day in your town.", "Save the January meetup in Jackson."] },
      proIds: ["pro-doyle", "pro-wong", "pro-whitfield"],
    },
  },
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


// ——— Team: staff in the four offices (12 Oct 2026) ———
// WHY: the client's main ask was for "the employees having a platform to
// communicate from these 4 different locations" (Chandu, 12 Oct 2026), so
// the board opens on a space where the four offices talk, ask each other,
// share what works and plan together. DEMO-ONLY: every staff member (first
// names and roles, no real people), post, reply and task below.
// Staff headshots (13 Oct 2026, Chandu: "For the staff people, let's
// generate actual images of them like we do the Connect professional
// profiles ... The United Way logo pic is not it"). Generated outside this
// repo from docs/reference/united-way-staff-headshot-prompts.md; drop each
// file into public/images/connect/avatars/ and add its line here. Until a
// person has one, they wear the United Way mark. DEMO-ONLY people.
const STAFF_PHOTOS: Record<string, string> = {
  // "Chris": "/images/connect/avatars/uw-kz-chris.png",
  // "Jess": "/images/connect/avatars/uw-kz-jess.png",
  // "Maya": "/images/connect/avatars/uw-lan-maya.png",
  // "Rob": "/images/connect/avatars/uw-lan-rob.png",
  // "Tess": "/images/connect/avatars/uw-jx-tess.png",
  // "Lena": "/images/connect/avatars/uw-jx-lena.png",
  // "Dana": "/images/connect/avatars/uw-bc-dana.png",
  // "Alex": "/images/connect/avatars/uw-bc-alex.png",
};
const staff = (name: string, role: string, office: string): StaffMember => ({ name, role, office, photo: STAFF_PHOTOS[name] });
const KZ_YOUTH: StaffMember = staff("Chris", "Youth programs", "Kalamazoo");
const LAN_YOUTH: StaffMember = staff("Maya", "Youth programs", "Lansing");
const JX_VOL: StaffMember = staff("Tess", "Volunteer center", "Jackson");
const BC_IMPACT: StaffMember = staff("Dana", "Community impact", "Battle Creek");
const LAN_EVENTS: StaffMember = staff("Rob", "Events", "Lansing");
const KZ_IMPACT: StaffMember = staff("Jess", "Community impact", "Kalamazoo");
const BC_VOL: StaffMember = staff("Alex", "Volunteer engagement", "Battle Creek");
const JX_YOUTH: StaffMember = staff("Lena", "Youth programs", "Jackson");

// ——— Communities (13 Oct 2026) ———
// WHY: Chandu asked for "4 boards for the 4 groups and one for across
// communities", each with a staff-only switch, and activity that is "a mix
// of what's on our boards right now and what's there live now". So each
// office gets its own staff talk (below), each community board gets a
// United Way post everyone sees, and the shared board keeps the
// cross-office planning that was live as Team. DEMO-ONLY: all of it.
const LOCAL_STAFF: StaffPost[] = [
  // Kalamazoo
  { id: "sc-s-kz-grant-night", kind: "update", author: KZ_IMPACT, postedAgo: "1h ago", title: "Grant night room is booked", body: "Youth United Way grant night is Mar 12 at the library. I booked the big room. Chris, can you bring the score sheets?", replies: [{ author: KZ_YOUTH, body: "Yes. I'll print 40.", postedAgo: "45m ago" }] },
  { id: "sc-s-kz-kickoff", kind: "ask", author: KZ_YOUTH, postedAgo: "6h ago", title: "Who can greet families at the kickoff?", body: "Student United kickoff is Nov 5 at 5:30. I need two people at the door for 30 minutes.", replies: [{ author: KZ_IMPACT, body: "I can do it. I'll bring name tags.", postedAgo: "5h ago" }] },
  // Battle Creek
  { id: "sc-s-bc-chairs", kind: "update", author: BC_IMPACT, postedAgo: "2h ago", pinned: true, title: "Convening setup: 20 more chairs", body: "The room holds 180. We have 160 chairs. The school next door is lending us 20 more.", tasks: [{ office: "Battle Creek", owner: "Alex", task: "Pick up chairs Friday", done: false }, { office: "Battle Creek", owner: "Dana", task: "Confirm lunch count", done: true }], replies: [{ author: BC_VOL, body: "I can pick them up Friday after lunch.", postedAgo: "1h ago" }] },
  { id: "sc-s-bc-doc", kind: "idea", author: BC_VOL, postedAgo: "1d ago", title: "Let teens pick the Day of Caring projects?", body: "Last year staff picked every project. This year a teen team could pick three. They know what their friends will show up for.", replies: [{ author: BC_IMPACT, body: "Love it. Let's ask Student United at the next meeting.", postedAgo: "20h ago" }] },
  // Lansing
  { id: "sc-s-lan-capcan", kind: "idea", author: LAN_YOUTH, postedAgo: "4h ago", title: "A FAFSA night with CapCAN?", body: "CapCAN helps families with the FAFSA. Could we host one night with them at our office in January?", replies: [{ author: LAN_EVENTS, body: "Yes. I can book the room and the snacks.", postedAgo: "3h ago" }] },
  { id: "sc-s-lan-vans", kind: "update", author: LAN_EVENTS, postedAgo: "1d ago", title: "Vans for Nov 14 are booked", body: "Two vans, 24 seats. Students sign up with their Student United lead.", replies: [{ author: LAN_YOUTH, body: "Sharing the sign-up with the leads today.", postedAgo: "22h ago" }] },
  // Jackson
  { id: "sc-s-jx-mentors", kind: "update", author: JX_VOL, postedAgo: "3h ago", title: "Six new Bigs mentors cleared", body: "Six more mentors passed their checks this week. They start at two schools next month.", replies: [{ author: JX_YOUTH, body: "Great news. I'll set up their first meeting.", postedAgo: "2h ago" }] },
  { id: "sc-s-jx-gym", kind: "ask", author: JX_YOUTH, postedAgo: "2d ago", title: "Can we use the school gym for MLK Day again?", body: "Last year the gym worked well for 80 people. Tess, do you still have the contact?", replies: [{ author: JX_VOL, body: "Yes. I'll add it here this afternoon.", postedAgo: "2d ago" }] },
];
/** United Way posts every member of a community board sees. */
const PUBLIC_STAFF: StaffPost[] = [
  { id: "sc-p-kz-kickoff", kind: "update", public: true, author: KZ_YOUTH, postedAgo: "3h ago", title: "Student United kickoff is Nov 5", body: "Meet your chapter and pick your first project. Bring a friend. Snacks are on us.", poster: { kind: "made", title: "Student United kickoff", when: "Nov 5 · 5:30 PM", where: "Kalamazoo", photo: MI.caring }, replies: [] },
  { id: "sc-p-bc-caring", kind: "update", public: true, author: BC_IMPACT, postedAgo: "1d ago", title: "Youth Day of Caring is May 7", body: "140 spots this year. Every project counts as service hours. Sign-ups open in March.", replies: [] },
  { id: "sc-p-lan-capitol", kind: "update", public: true, author: LAN_EVENTS, postedAgo: "5h ago", title: "64 students are going to public service day", body: "Meet state staff who started as interns. Juniors and seniors can still join.", replies: [] },
  { id: "sc-p-jx-bigs", kind: "update", public: true, author: JX_VOL, postedAgo: "8h ago", title: "Bigs in Schools needs 10 more mentors", body: "One hour a week at school. Volunteers can sign up under Ways to help.", replies: [] },
  { id: "sc-p-convening", kind: "update", public: true, author: BC_VOL, postedAgo: "2h ago", pinned: true, title: "Nov 14: all four towns meet in Battle Creek", body: "Students, nonprofits and colleges, one day. Vans leave from Lansing and Jackson.", poster: { kind: "made", title: "South Central convening", when: "Nov 14 · 10 AM", where: "Battle Creek", photo: MI.volunteers }, replies: [] },
];
const STAFF_POSTS: StaffPost[] = [
  ...LOCAL_STAFF,
  ...PUBLIC_STAFF,
  {
    id: "sc-s-spring-plan", kind: "resource", author: BC_IMPACT, pinned: true, postedAgo: "1d ago",
    title: "Spring service day plan",
    body: "The plan from our thread: one morning in May, one project per town, then lunch together in Battle Creek. Add your project by Feb 1.",
    resource: { label: "Spring service day plan", meta: "Doc · 3 pages" },
    tasks: [
      { office: "Battle Creek", owner: "Dana", task: "Host the lunch and the wrap-up", done: true },
      { office: "Kalamazoo", owner: "Chris", task: "Youth United Way teens run one project", done: true },
      { office: "Lansing", owner: "Maya", task: "Food box packing crew", done: false },
      { office: "Jackson", owner: "Tess", task: "Mentors and their students join", done: false },
    ],
    replies: [{ author: LAN_YOUTH, body: "Added ours: packing food boxes at the Lansing food bank.", postedAgo: "20h ago" }],
  },
  {
    id: "sc-s-yuw-voting", kind: "ask", author: LAN_YOUTH, postedAgo: "3h ago",
    title: "How does Kalamazoo run Youth United Way grant voting?",
    body: "Lansing wants to try teen grant voting next year. How do you set up the vote, and how do teens pick the nonprofits?",
    replies: [
      { author: KZ_YOUTH, body: "Teens visit each nonprofit first. Then they score each one on the same sheet. We vote in one meeting, with snacks.", postedAgo: "2h ago" },
      { author: KZ_YOUTH, body: "I put our score sheet in Shared resources. Copy it for Lansing.", postedAgo: "2h ago" },
      { author: LAN_YOUTH, body: "This is perfect. Can two of us sit in on your next vote?", postedAgo: "1h ago" },
      { author: KZ_YOUTH, body: "Yes! It's in March. I'll post the date here.", postedAgo: "40m ago" },
    ],
  },
  {
    id: "sc-s-bigs-sheet", kind: "resource", author: JX_VOL, postedAgo: "5h ago",
    title: "Our Bigs in Schools mentor sign-up sheet",
    body: "This is the sheet Jackson uses to sign up mentors. It asks for free times, the school, and background check status. Copy it for your own office.",
    resource: { label: "Mentor sign-up sheet", meta: "Sheet · 1 page" },
    replies: [
      { author: BC_IMPACT, body: "Using this for our reading buddies. Thank you!", postedAgo: "4h ago" },
      { author: LAN_EVENTS, body: "Same for Lansing. The check status column saves us a lot of email.", postedAgo: "2h ago" },
    ],
  },
  {
    id: "sc-s-spring-idea", kind: "idea", author: BC_IMPACT, postedAgo: "4d ago",
    title: "One spring service day for all four towns?",
    body: "What if all four offices hold one service day in May? Each town runs one project the same morning. Battle Creek can host lunch for everyone after.",
    replies: [
      { author: KZ_YOUTH, body: "Yes from Kalamazoo. Youth United Way teens can run our project.", postedAgo: "4d ago" },
      { author: LAN_YOUTH, body: "Lansing is in. We can bring the food box crew.", postedAgo: "4d ago" },
      { author: JX_VOL, body: "Jackson too. Our mentors want to bring their students.", postedAgo: "3d ago" },
      { author: BC_IMPACT, body: "Love it. I wrote up the plan and pinned it at the top.", postedAgo: "1d ago" },
    ],
  },
  {
    id: "sc-s-convening-plan", kind: "update", author: LAN_EVENTS, postedAgo: "2d ago",
    title: "Nov 14 convening in Battle Creek: who does what",
    body: "Here is the plan for the next convening. One owner per office. Check yours off when it's done.",
    tasks: [
      { office: "Battle Creek", owner: "Dana", task: "Room, tables and lunch", done: true },
      { office: "Lansing", owner: "Rob", task: "Vans for students", done: true },
      { office: "Kalamazoo", owner: "Chris", task: "College table", done: false },
      { office: "Jackson", owner: "Tess", task: "Volunteer sign-in", done: false },
    ],
    replies: [
      { author: KZ_YOUTH, body: "Two colleges said yes for the table. Confirming the rest this week.", postedAgo: "1d ago" },
      { author: JX_VOL, body: "Volunteer sign-in sheet is ready. Twelve volunteers so far.", postedAgo: "20h ago" },
    ],
  },
  {
    // the debrief also leads the event's own board (uwEvents.ts)
    id: "sc-s-fall-debrief", kind: "update", author: KZ_YOUTH, postedAgo: "2w ago", eventId: "sc-e-fall-convening",
    title: "Fall regional convening: our debrief",
    body: "Thanks, all four offices. Kalamazoo hosted, Lansing and Jackson brought the vans.",
    worked: ["Mixing towns at every table got students talking.", "The college table was busy all day.", "Vans from Lansing and Jackson brought more students."],
    numbers: [{ value: "164", label: "students" }, { value: "12", label: "volunteers" }, { value: "4", label: "towns" }],
    next: [{ office: "Battle Creek", task: "Host the Nov 14 convening" }, { office: "Lansing", task: "Plan the vans again" }, { office: "Jackson", task: "Run volunteer sign-in" }, { office: "Kalamazoo", task: "Bring the college table back" }],
    replies: [
      { author: JX_VOL, body: "Jackson will bring two more volunteer tables next time.", postedAgo: "2w ago" },
      { author: BC_IMPACT, body: "Battle Creek is ready to host. Room is booked.", postedAgo: "12d ago" },
    ],
  },
];

export const SOUTH_CENTRAL: UwBoard = {
  id: UW_SC_ID,
  org: "United Way of South Central Michigan",
  // the client's ask (12 Oct 2026): "a means of communication between the
  // 4 regions on one board"
  talk: { title: "Across the region", line: "Ask and share with students and volunteers in Kalamazoo, Battle Creek, Lansing and Jackson." },
  staff: { title: "Across offices", line: "United Way staff in Kalamazoo, Battle Creek, Lansing and Jackson, in one place.", unit: "community", all: "All communities", me: BC_VOL, posts: STAFF_POSTS },
  // the shared board: the cross-office planning that was live as Team, the
  // students' cross-town threads, and the convening news
  across: ["sc-s-spring-plan", "sc-s-yuw-voting", "sc-s-bigs-sheet", "sc-s-spring-idea", "sc-s-convening-plan", "sc-s-fall-debrief", "sc-p-convening", "sc-t-yuw-ask", "sc-t-next-convening", "uwi-sc-across-ask", "sc-q-across-van", "sc-q-across-club", "sc-q-across-summer", "uwi-sc-across-health", "uwi-sc-across-code"],
  name: "South Central Michigan",
  line: "Find work that helps your town.",
  places: { all: "All communities", tab: "By community", panel: "Students and volunteer hours by community" },
  stats: [{ value: "4", label: "communities" }, { value: String(PROGRAMS.length), label: "programs" }],
  // not uw-mi-students: that class photo carries West Michigan's banner
  // 14 Oct 2026, Chandu: "the image used for the header/card for United Way
  // needs to be better than what's used now ... something more tasteful":
  // United Way's own photo of three volunteers in "Live United" shirts, warm
  // and close, in place of the work-day-in-the-woods shot
  photos: { hero: PHOTOS.scholars, heroFocus: "50% 32%", volunteers: PHOTOS.hero, volunteersFocus: "50% 30%" },
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
    since: ["4 new questions from Lansing and Jackson students", "12 students found your post helpful", "The regional convening needs 6 more volunteers"],
    requests: [
      { id: "sc-r1", kind: "Speak", minutes: 45, title: "Join the Oct 28 panel on jobs that help your town" },
      { id: "sc-r2", kind: "Review", minutes: 15, title: "Check Maya's résumé for a city internship" },
      { id: "sc-r3", kind: "Share", minutes: 10, title: "Post one tip for students in your town" },
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
    { from: "Nia, junior in Battle Creek", text: "You made public health sound like a real plan for me." },
  ],
  impact: {
    // DEMO-ONLY: every number below. The four tiles are the four measures
    // the call named, in its order.
    voices: [
      { from: "Student, Lansing", text: "I asked a social worker real questions. Now I know my next step." },
      { from: "Nonprofit director, Kalamazoo", text: "Two students from the board now volunteer with us every week." },
      { from: "College partner, Kalamazoo", text: "Our students found service work that fits their majors." },
      { from: "Student, Jackson", text: "A volunteer from Lansing answered me in one day. I applied that week." },
      { from: "Nonprofit director, Battle Creek", text: "Our Day of Caring had more teens than ever. Many found us here." },
      { from: "College partner, Lansing", text: "High school students now visit campus already knowing what they want to ask." },
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
    { program: "Student United", by: "All communities", students: 220, volunteers: 18, hours: 260 },
    { program: "Young Leaders United", by: "All communities", students: 64, volunteers: 22, hours: 210 },
    { program: "Public service internships", by: "All communities", students: 48, volunteers: 12, hours: 160 },
    { program: "College to career", by: "Lansing and Kalamazoo", students: 140, volunteers: 10, hours: 70 },
    { program: "Start at community college", by: "All communities", students: 90, volunteers: 6, hours: 40 },
    // DEMO-ONLY: CapCAN's counts on this board, like every row here
    { program: "CapCAN", by: "Lansing", students: 84, volunteers: 6, hours: 50 },
    { program: "Youth United Way", by: "Kalamazoo", students: 96, volunteers: 8, hours: 90 },
    { program: "Bigs in Schools", by: "Jackson", students: 112, volunteers: 19, hours: 130 },
  ],
  roster: [
    { pro: "pro-doyle", checks: "done", hours: 18 },
    { pro: "pro-wong", checks: "done", hours: 15 },
    { pro: "pro-reyes", checks: "done", hours: 12 },
    { pro: "pro-whitfield", checks: "done", hours: 9 },
    { pro: "pro-brooks", checks: "training", hours: 3 },
    { pro: "pro-tanaka", checks: "pending", hours: 0 },
  ],
};
