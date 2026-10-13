// United Way questions as real Connect threads (8 Oct 2026). Chandu: "it's
// not clear where the questions go, how many recent answers and questions
// can I see? There should be a feed in the board with these things listed
// maybe? or a questions tab listing every question like we have in the
// other boards." So each United Way board's questions are Threads, the same
// type every other board uses: they list in the board's Q&A tab with the
// shared QuestionCard, open in the shared thread page (answers, follow-ups,
// comments, related questions), and show up in the student's own Connect
// feeds. Waiting questions are the ones routed to volunteers; the volunteer
// view's "Questions for you" reads the same list, so a question a student
// sees waiting is the one a volunteer sees to answer.
// Handles are first names only. Counts and timings are demo.
//
// 12 Oct 2026: every post now carries `place`, the poster's own community
// (a chapter's short name on the board), because the client "needed a
// means of communication between the 4 regions on one board". The board's
// Talk tab (the Q&A tab, grown) lists every community's posts together,
// filters them by community, and anyone can reply across communities.
// Rules for the seeded talk: positive framing only, 8th-grade copy, first
// names for students, volunteers are existing Connect professionals.

import type { Insight, Thread } from "../data";

const NET = "united-way-student-success";
const MI = "united-way-michigan";
const SC = "united-way-south-central";

export const UW_THREADS: Thread[] = [
  // ——— network ———
  {
    id: "uw-t-health", boardId: NET, type: "question",
    title: "I like health care but not med school. What else is there?",
    context: "Blood makes me nervous. Is there anything that takes less than 10 years?",
    handle: "Maya", grade: "Junior", place: "Palm Beach", postedAgo: "2d ago", state: "answered",
    routedScope: "Health careers", expectedWindow: "within 1 day", helpful: 64, followers: 12, comments: 9,
    responses: [
      { kind: "answer", proId: "pro-reyes", primary: true, postedAgo: "2d ago", body: "Nursing, imaging, pharmacy tech. Most take two years or less. Try the hospital job shadow on Events." },
      { kind: "answer", proId: "pro-ortega", postedAgo: "1d ago", body: "Pharmacy tech is a good start. A short course, then you get paid." },
      { kind: "peer", handle: "Jade", grade: "Senior", place: "Palm Beach", body: "I did the job shadow last year. The imaging team was so cool.", postedAgo: "1d ago", likes: 21 },
    ],
  },
  {
    id: "uw-t-internship", boardId: NET, type: "question",
    title: "How do I get an internship if no one I know has an office job?",
    handle: "Andre", grade: "Senior", place: "Midlands", postedAgo: "3d ago", state: "answered",
    routedScope: "Internships", expectedWindow: "within 1 day", helpful: 58, followers: 9, comments: 7,
    responses: [
      { kind: "answer", proId: "pro-whitfield", primary: true, postedAgo: "3d ago", body: "That's what these programs are for. Young Men United and Ignite both pay. Apply on Programs." },
      { kind: "followup", body: "Do I need a résumé before I raise my hand?", postedAgo: "2d ago" },
      { kind: "answer", proId: "pro-whitfield", postedAgo: "2d ago", body: "No. Raise your hand first. Build the résumé while you wait." },
    ],
  },
  {
    id: "uw-t-finance", boardId: NET, type: "question",
    title: "What is the first week of a finance job like?",
    handle: "Luis", grade: "Junior", place: "Miami", postedAgo: "4d ago", state: "answered",
    routedScope: "Business & Finance", expectedWindow: "within 1 day", helpful: 41, followers: 6, comments: 4,
    responses: [
      { kind: "answer", proId: "pro-okafor", primary: true, postedAgo: "4d ago", body: "Mostly learning the tools and the people. Ask one good question a day." },
    ],
  },
  {
    id: "uw-t-hours", boardId: NET, type: "question",
    title: "Do service hours really help with scholarships?",
    handle: "Priya", grade: "Sophomore", place: "Salt Lake", postedAgo: "5d ago", state: "answered",
    routedScope: "Paying for college", expectedWindow: "within 1 day", helpful: 37, followers: 8, comments: 5,
    responses: [
      { kind: "answer", proId: "pro-tanaka", primary: true, postedAgo: "5d ago", body: "Yes. Many ask for them. Serve keeps your record and a signed letter." },
      { kind: "peer", handle: "Omar", grade: "Senior", place: "Bay Area", body: "My scholarship asked for 40 hours. Glad I kept track.", postedAgo: "4d ago", likes: 14 },
    ],
  },
  {
    id: "uw-t-fafsa", boardId: NET, type: "question",
    title: "Do I need my parents' taxes for the FAFSA?",
    handle: "Sofia", grade: "Senior", place: "Orange County", postedAgo: "6d ago", state: "answered",
    routedScope: "Paying for college", expectedWindow: "within 1 day", helpful: 52, followers: 15, comments: 6,
    responses: [
      { kind: "answer", proId: "pro-wong", primary: true, postedAgo: "6d ago", body: "Usually yes. Bring a parent to Financial aid night. We fill it out together." },
    ],
  },
  {
    id: "uw-t-recruiting", boardId: NET, type: "question",
    title: "Is recruiting a good job if I like people but not sales?",
    handle: "Maya", grade: "Junior", place: "Palm Beach", postedAgo: "2h ago", state: "routed",
    routedScope: "Recruiting", expectedWindow: "within 1 day", helpful: 3, followers: 2, responses: [],
  },
  {
    id: "uw-t-interview", boardId: NET, type: "question",
    title: "What should I wear to my first job interview?",
    handle: "Luis", grade: "Senior", place: "Miami", postedAgo: "5h ago", state: "routed",
    routedScope: "First jobs", expectedWindow: "within 1 day", helpful: 6, followers: 4, responses: [],
  },
  {
    id: "uw-t-sixteen", boardId: NET, type: "question",
    title: "Can I get an office internship at 16?",
    handle: "Ava", grade: "Sophomore", place: "Southwest Virginia", postedAgo: "1d ago", state: "routed",
    routedScope: "Internships", expectedWindow: "within 1 day", helpful: 4, followers: 3, responses: [],
  },

  // ——— Michigan ———
  {
    id: "mi-t-summer", boardId: MI, type: "question",
    title: "How do I get a summer job in Detroit at 15?",
    handle: "Jaylen", grade: "Freshman", place: "Southeast Michigan", postedAgo: "1d ago", state: "answered",
    routedScope: "Summer jobs", expectedWindow: "within 1 day", helpful: 72, followers: 18, comments: 8,
    responses: [
      { kind: "answer", proId: "pro-whitfield", primary: true, postedAgo: "1d ago", body: "Try Grow Detroit's Young Talent. Paid summer jobs for ages 14 to 24. Sign-ups open in March." },
      { kind: "peer", handle: "Kiara", grade: "Junior", place: "Southeast Michigan", body: "I did it last summer at a hospital. Sign up the first week, it fills up.", postedAgo: "20h ago", likes: 31 },
    ],
  },
  {
    id: "mi-t-trades", boardId: MI, type: "question",
    title: "Do I need college to work in the trades?",
    handle: "Eli", grade: "Senior", place: "Lakeshore", postedAgo: "2d ago", state: "answered",
    routedScope: "Trades", expectedWindow: "within 1 day", helpful: 61, followers: 11, comments: 6,
    responses: [
      { kind: "answer", proId: "pro-tanaka", primary: true, postedAgo: "2d ago", body: "No. Most trades start as paid apprentices. Watch the trades panel on Events." },
    ],
  },
  {
    id: "mi-t-suw", boardId: MI, type: "question",
    title: "Does Student United Way help with college?",
    handle: "Ana", grade: "Junior", place: "West Michigan", postedAgo: "3d ago", state: "answered",
    routedScope: "Paying for college", expectedWindow: "within 1 day", helpful: 44, followers: 7, comments: 4,
    responses: [
      { kind: "answer", proId: "pro-okafor", primary: true, postedAgo: "3d ago", body: "Yes. It shows you led something real. Ask your advisor for a letter." },
    ],
  },
  {
    id: "mi-t-age", boardId: MI, type: "question",
    title: "Can I volunteer if I'm 14?",
    handle: "Noah", grade: "Freshman", place: "Marquette", postedAgo: "4d ago", state: "answered",
    routedScope: "Service hours", expectedWindow: "within 1 day", helpful: 39, followers: 5, comments: 3,
    responses: [
      { kind: "answer", proId: "pro-brooks", primary: true, postedAgo: "4d ago", body: "Yes. Many shifts on Serve start at 14." },
    ],
  },
  {
    id: "mi-t-nurse", boardId: MI, type: "question",
    title: "What do nurses at a hospital in Grand Rapids do all day?",
    handle: "Nia", grade: "Junior", place: "West Michigan", postedAgo: "1h ago", state: "routed",
    routedScope: "Health careers", expectedWindow: "within 1 day", helpful: 2, followers: 2, responses: [],
  },
  {
    id: "mi-t-shadow", boardId: MI, type: "question",
    title: "How do I ask for a job shadow if I don't know anyone?",
    handle: "Marcus", grade: "Sophomore", place: "Genesee", postedAgo: "4h ago", state: "routed",
    routedScope: "First jobs", expectedWindow: "within 1 day", helpful: 5, followers: 3, responses: [],
  },
  {
    id: "mi-t-apprentice", boardId: MI, type: "question",
    title: "Is an apprenticeship better than community college?",
    handle: "Eli", grade: "Senior", place: "Lakeshore", postedAgo: "1d ago", state: "routed",
    routedScope: "Trades", expectedWindow: "within 1 day", helpful: 7, followers: 4, responses: [],
  },
  // ——— South Central Michigan (10 Oct 2026): nonprofit and public sector
  // careers, the call's focus. DEMO-ONLY: questions, answers and counts ———
  {
    id: "sc-t-nonprofit", boardId: SC, type: "question",
    title: "Can you make a living working at a nonprofit?",
    context: "I want to help people, but I also need to pay rent.",
    handle: "Maya", grade: "Junior", place: "Kalamazoo", postedAgo: "2d ago", state: "answered",
    routedScope: "Nonprofit jobs", expectedWindow: "within 1 day", helpful: 58, followers: 10, comments: 6,
    responses: [
      { kind: "answer", proId: "pro-doyle", primary: true, postedAgo: "2d ago", body: "Yes. Pay starts lower than some jobs, then grows. Many nonprofits pay off student loans too. Ask about that." },
      { kind: "peer", handle: "Jordan", grade: "College", place: "Kalamazoo", body: "My internship at a nonprofit paid. Ask before you assume it won't.", postedAgo: "1d ago", likes: 17 },
    ],
  },
  {
    id: "sc-t-government", boardId: SC, type: "question",
    title: "How do I get a job with the city or the state?",
    handle: "Andre", grade: "Senior", place: "Lansing", postedAgo: "3d ago", state: "answered",
    routedScope: "Government jobs", expectedWindow: "within 1 day", helpful: 47, followers: 8, comments: 4,
    responses: [
      { kind: "answer", proId: "pro-whitfield", primary: true, postedAgo: "3d ago", body: "Start with a summer internship. Lansing has lots of state offices. Watch Shared by professionals on Home." },
    ],
  },
  {
    id: "sc-t-student-united", boardId: SC, type: "question",
    title: "Can I stay in Student United when I go to college?",
    handle: "Ana", grade: "Senior", place: "Jackson", postedAgo: "4d ago", state: "answered",
    routedScope: "Student United", expectedWindow: "within 1 day", helpful: 39, followers: 6, comments: 3,
    responses: [
      { kind: "answer", proId: "pro-wong", primary: true, postedAgo: "4d ago", body: "Yes. There are college chapters too. After college, Young Leaders United picks up where it ends." },
    ],
  },
  {
    id: "sc-t-health", boardId: SC, type: "question",
    title: "What does a public health nurse do all day?",
    handle: "Nia", grade: "Junior", place: "Battle Creek", postedAgo: "5d ago", state: "answered",
    routedScope: "Health careers", expectedWindow: "within 1 day", helpful: 33, followers: 5, comments: 2,
    responses: [
      { kind: "answer", proId: "pro-reyes", primary: true, postedAgo: "5d ago", body: "Home visits, shots at schools, and teaching families. Try the job shadow in Battle Creek." },
    ],
  },
  {
    // WHY (10 Oct 2026): the forwarded note lists FAFSA help among CapCAN's
    // services, and this board had nowhere a student asking about aid
    // would find it. So one answer points to CapCAN, the way a Detroit
    // answer points to Grow Detroit's Young Talent. Routed to "CapCAN" so
    // it also lists on CapCAN's Questions tab. DEMO-ONLY: the question,
    // answer and counts, like the rest of this section.
    id: "sc-t-fafsa", boardId: SC, type: "question",
    title: "Who can help me with the FAFSA in Lansing?",
    handle: "Sam", grade: "Senior", place: "Lansing", postedAgo: "3d ago", state: "answered",
    routedScope: "CapCAN", expectedWindow: "within 1 day", helpful: 29, followers: 7, comments: 2,
    responses: [
      { kind: "answer", proId: "pro-wong", primary: true, postedAgo: "3d ago", body: "Try CapCAN. They help with the FAFSA and scholarships. Find it in Programs." },
    ],
  },
  {
    id: "sc-t-planner", boardId: SC, type: "question",
    title: "Do I need a master's degree to be a city planner?",
    handle: "Leo", grade: "Sophomore", place: "Lansing", postedAgo: "2h ago", state: "routed",
    routedScope: "Government jobs", expectedWindow: "within 1 day", helpful: 4, followers: 2, responses: [],
  },
  {
    id: "sc-t-msu", boardId: SC, type: "question",
    title: "Which majors at MSU or Western lead to nonprofit work?",
    handle: "Priya", grade: "Junior", place: "Kalamazoo", postedAgo: "6h ago", state: "routed",
    routedScope: "Nonprofit jobs", expectedWindow: "within 1 day", helpful: 6, followers: 3, responses: [],
  },
  // ——— Talk across communities (12 Oct 2026). DEMO-ONLY: every post,
  // reply and count below ———
  {
    // a Lansing student asks Kalamazoo students about a Kalamazoo program;
    // routed to the program, so it also lists on its Questions tab
    id: "sc-t-yuw-ask", boardId: SC, type: "question",
    title: "Kalamazoo students: what is Youth United Way like?",
    context: "We don't have it in Lansing yet. I want to start something like it.",
    handle: "Leo", grade: "Sophomore", place: "Lansing", postedAgo: "5h ago", state: "answered",
    routedScope: "Youth United Way", expectedWindow: "within 1 day", helpful: 31, followers: 9, comments: 5,
    responses: [
      { kind: "answer", proId: "pro-brooks", primary: true, postedAgo: "4h ago", body: "Teens visit local nonprofits. Then they vote on real grants. Kalamazoo students can tell you the rest." },
      { kind: "peer", handle: "Theo", grade: "Junior", place: "Kalamazoo", body: "We visited six nonprofits this fall. Then we voted together. It felt like real work.", postedAgo: "3h ago", likes: 18 },
      { kind: "peer", handle: "Ava", grade: "Junior", place: "Kalamazoo", body: "You could start a Student United chapter in Lansing. We can share our notes with you.", postedAgo: "2h ago", likes: 12 },
      { kind: "peer", handle: "Leo", grade: "Sophomore", place: "Lansing", body: "Yes please! Can we meet at the next convening?", postedAgo: "1h ago", likes: 7 },
    ],
  },
  {
    // a follow-up from the regional convening, in the board's own Talk
    id: "sc-t-next-convening", boardId: SC, type: "question",
    title: "Who's going to the next convening in Battle Creek?",
    context: "The fall one was so fun. I want to sit with people from the other towns this time.",
    handle: "Nia", grade: "Junior", place: "Battle Creek", postedAgo: "1d ago", state: "answered",
    routedScope: "Regional convening", expectedWindow: "within 1 day", helpful: 26, followers: 11, comments: 4,
    responses: [
      { kind: "answer", proId: "pro-reyes", primary: true, postedAgo: "1d ago", body: "I'll be at the health table again. Bring one question about health jobs." },
      { kind: "peer", handle: "Sam", grade: "Senior", place: "Lansing", body: "Lansing is bringing a van. Ask your Student United lead for a seat.", postedAgo: "20h ago", likes: 14 },
      { kind: "peer", handle: "Jada", grade: "Senior", place: "Jackson", body: "Jackson too! Let's all sit together this time.", postedAgo: "18h ago", likes: 11 },
    ],
  },
  {
    id: "sc-t-hours-swap", boardId: SC, type: "question",
    title: "Can I sign up for a shift in another town?",
    handle: "Jada", grade: "Senior", place: "Jackson", postedAgo: "3h ago", state: "routed",
    routedScope: "Service hours", expectedWindow: "within 1 day", helpful: 5, followers: 3, responses: [],
  },
  {
    id: "mi-t-giving", boardId: MI, type: "question",
    title: "Grand Rapids students: how do you run your giving drive?",
    context: "Our Student United Way in Marquette wants to try one this winter.",
    handle: "Noah", grade: "Freshman", place: "Marquette", postedAgo: "6h ago", state: "answered",
    routedScope: "Student United Way", expectedWindow: "within 1 day", helpful: 22, followers: 6, comments: 3,
    responses: [
      { kind: "answer", proId: "pro-okafor", primary: true, postedAgo: "5h ago", body: "Pick one cause and one goal. Two weeks is long enough. Share the total at the end." },
      { kind: "peer", handle: "Ana", grade: "Junior", place: "West Michigan", body: "We ran a class contest with a poster for each class. Everyone wanted to win.", postedAgo: "4h ago", likes: 16 },
      { kind: "peer", handle: "Kiara", grade: "Junior", place: "Southeast Michigan", body: "We added a bake sale on the last day. It was the best day.", postedAgo: "2h ago", likes: 9 },
    ],
  },
  {
    id: "uw-t-mentor-swap", boardId: NET, type: "question",
    title: "Orange County seniors: is e-Mentorship worth it?",
    context: "Salt Lake has student advocates. I want to know how a mentor is different.",
    handle: "Priya", grade: "Junior", place: "Salt Lake", postedAgo: "8h ago", state: "answered",
    routedScope: "e-Mentorship", expectedWindow: "within 1 day", helpful: 19, followers: 5, comments: 3,
    responses: [
      { kind: "answer", proId: "pro-okafor", primary: true, postedAgo: "7h ago", body: "A mentor helps with your plan after high school. An advocate helps you at school. Both are good to have." },
      { kind: "peer", handle: "Sofia", grade: "Senior", place: "Orange County", body: "Yes. My mentor helped me pick a college I can pay for.", postedAgo: "5h ago", likes: 13 },
    ],
  },
];

// ——— Posts by volunteers across communities (12 Oct 2026). DEMO-ONLY:
// each post, reply and count. A volunteer's post lists on the board's Talk
// tab and on their own profile, like any Connect post ———
export const UW_INSIGHTS: Insight[] = [
  {
    // a Jackson volunteer shares what worked
    id: "uwi-sc-reading", boardId: SC, type: "insight", proId: "pro-wong", place: "Jackson",
    title: "What worked at our Jackson reading shifts",
    // DEMO-ONLY graphic (13 Oct 2026): graphic posts like every other board
    graphic: { text: "Same reader, same table, every week. That's what made it work.", bg: "p-pastel", font: "classic" },
    body: "We paired each teen with the same young reader every week. Same day, same table. The kids looked forward to it, and so did the teens. Any town can copy this. Ask me how.",
    postedAgo: "2d ago", helpful: 48,
    replies: [
      { handle: "Nia", grade: "Junior", place: "Battle Creek", body: "Could Battle Creek try this at our library?", postedAgo: "2d ago", likes: 9 },
      { proId: "pro-wong", body: "Yes. Start with four pairs and one adult. I can share our sign-up sheet here.", postedAgo: "1d ago", likes: 14 },
      { handle: "Sam", grade: "Senior", place: "Lansing", body: "Signing up for the Kalamazoo reading shift to try it first.", postedAgo: "1d ago", likes: 6 },
    ],
  },
  {
    // a volunteer follows up on the convening, on its own event board
    id: "uwi-sc-convening-tables", boardId: "sc-e-fall-convening", type: "insight", proId: "pro-reyes", place: "Battle Creek",
    title: "Your questions at the health table, answered",
    body: "Thanks for all the questions at the health table. The top one: do you need a four-year degree? No. Many health jobs start with a one or two-year program. The job shadow in Battle Creek is a good first step.",
    postedAgo: "1w ago", helpful: 37,
    replies: [
      { handle: "Theo", grade: "Junior", place: "Kalamazoo", body: "This helps a lot. Signing up for the shadow day.", postedAgo: "6d ago", likes: 8 },
      { handle: "Jada", grade: "Senior", place: "Jackson", body: "Can Jackson students go to the Battle Creek shadow too?", postedAgo: "5d ago", likes: 5 },
      { proId: "pro-reyes", body: "Yes. It's open to all four towns.", postedAgo: "5d ago", likes: 11 },
    ],
  },
  // ——— one post per community board, and one on the shared board (13 Oct
  // 2026, Communities: "a mix of what's on our boards right now and what's
  // there live now", so graphic posts like the other boards). DEMO-ONLY ———
  {
    id: "uwi-sc-kz-food", boardId: SC, type: "insight", proId: "pro-brooks", place: "Kalamazoo",
    title: "My first step into nursing was a food crew",
    body: "As a teen I helped on a Saturday food crew in Kalamazoo. Leading it taught me to plan and talk to people. Those skills got me into nursing. Start as a helper and you can lead by spring.",
    graphic: { text: "Start as a helper. Lead by spring.", bg: "p-sunset-sea", font: "display" },
    postedAgo: "5h ago", helpful: 34,
    replies: [{ handle: "Theo", grade: "Junior", place: "Kalamazoo", body: "Signing up for the food bank crew this Saturday.", postedAgo: "4h ago", likes: 6 }, { proId: "pro-brooks", body: "Love it. Ages 14 and up can join.", postedAgo: "3h ago", likes: 9 }],
  },
  {
    id: "uwi-sc-bc-nurse", boardId: SC, type: "insight", proId: "pro-reyes", place: "Battle Creek",
    title: "Public health is more than hospitals",
    body: "In Battle Creek our nurses visit schools, homes and clinics. Many started with a one-year program. Come shadow us in December.",
    graphic: { text: "Public health nurses work in schools, homes and clinics.", bg: "p-teal-cloud", font: "classic" },
    postedAgo: "1d ago", helpful: 52,
    replies: [{ handle: "Nia", grade: "Junior", place: "Battle Creek", body: "Signed up for the shadow day!", postedAgo: "20h ago", likes: 11 }],
  },
  {
    id: "uwi-sc-lan-city", boardId: SC, type: "insight", proId: "pro-doyle", place: "Lansing",
    title: "What a city job looks like day to day",
    body: "Parks, roads, housing, water. A city needs writers, planners and people who like numbers. Our summer interns do real work from week one.",
    graphic: { text: "A city needs writers, planners and people who love numbers.", bg: "p-city-dusk", font: "display" },
    postedAgo: "7h ago", helpful: 41,
    replies: [{ handle: "Leo", grade: "Sophomore", place: "Lansing", body: "I didn't know parks had planners. So cool.", postedAgo: "6h ago", likes: 8 }, { handle: "Andre", grade: "Senior", place: "Lansing", body: "Applying for the parks internship this week.", postedAgo: "4h ago", likes: 5 }],
  },
  {
    id: "uwi-sc-across-ask", boardId: SC, type: "insight", proId: "pro-whitfield", place: "Lansing",
    title: "A tip for every town: one question a month",
    body: "Students who ask one good question a month hear about openings first. Post yours here. Someone in another town may know the answer.",
    graphic: { text: "Ask one good question a month.", bg: "p-above-clouds", font: "classic" },
    postedAgo: "9h ago", helpful: 46,
    replies: [{ handle: "Jada", grade: "Senior", place: "Jackson", body: "Doing it. This month: how do I get a city internship?", postedAgo: "8h ago", likes: 7 }, { handle: "Theo", grade: "Junior", place: "Kalamazoo", body: "Ask Lansing! They have the parks one.", postedAgo: "7h ago", likes: 10 }],
  },
  {
    id: "uwi-mi-mlk", boardId: MI, type: "insight", proId: "pro-tanaka", place: "Genesee",
    title: "What made our MLK Day of Service run well",
    body: "Each group got one job and one lead. Teens checked in at one table, so hours were easy to count. Bring this plan to your own Day of Caring.",
    postedAgo: "3d ago", helpful: 29,
    replies: [
      { handle: "Eli", grade: "Senior", place: "Lakeshore", body: "Using this for the Muskegon Day of Caring in April.", postedAgo: "2d ago", likes: 7 },
    ],
  },
];

// ——— Event follow-up boards (12 Oct 2026): the questions on a past
// event's board, the way event-ey's board has them. DEMO-ONLY ———
export const UW_EVENT_THREADS: Thread[] = [
  {
    id: "sc-et-favorite", boardId: "sc-e-fall-convening", type: "question",
    title: "What was your favorite table at the convening?",
    context: "I want to hear what the other towns liked. Mine was the college table.",
    handle: "Amaya", grade: "Junior", place: "Battle Creek", postedAgo: "1w ago", state: "answered",
    routedScope: "Event volunteers", expectedWindow: "within 2 days", views: 612, helpful: 64, followers: 12, comments: 14,
    responses: [
      { kind: "answer", proId: "pro-wong", primary: true, postedAgo: "1w ago", body: "I loved your project ideas. The best ones started with one small, real problem in your town." },
      { kind: "peer", handle: "Leo", grade: "Sophomore", place: "Lansing", body: "The city office table. I didn't know you could work on parks as a job.", postedAgo: "6d ago", likes: 21 },
      { kind: "peer", handle: "Jada", grade: "Senior", place: "Jackson", body: "Same! Jackson should do a parks day with Lansing.", postedAgo: "6d ago", likes: 15 },
      { kind: "peer", handle: "Theo", grade: "Junior", place: "Kalamazoo", body: "The college table. Western has service work that counts for class.", postedAgo: "5d ago", likes: 12 },
    ],
  },
  {
    id: "sc-et-shared-day", boardId: "sc-e-fall-convening", type: "question",
    title: "Can all four towns do the service day together?",
    handle: "Jada", grade: "Senior", place: "Jackson", postedAgo: "6d ago", state: "answered",
    routedScope: "Event volunteers", expectedWindow: "within 2 days", views: 488, helpful: 52, followers: 18, comments: 9,
    responses: [
      { kind: "answer", proId: "pro-brooks", primary: true, postedAgo: "6d ago", body: "Yes. That was the plan from the convening: one shared day in the spring. Each town picks one project. The sign-up goes up in Serve." },
      { kind: "peer", handle: "Sam", grade: "Senior", place: "Lansing", body: "Lansing can bring the food box crew.", postedAgo: "5d ago", likes: 10 },
      { kind: "peer", handle: "Nia", grade: "Junior", place: "Battle Creek", body: "Battle Creek can host. Our park has room for everyone.", postedAgo: "5d ago", likes: 13 },
    ],
  },
  {
    id: "sc-et-college-table", boardId: "sc-e-fall-convening", type: "question",
    title: "Will the next convening have a college table again?",
    handle: "Theo", grade: "Junior", place: "Kalamazoo", postedAgo: "1d ago", state: "routed",
    routedScope: "Event volunteers", expectedWindow: "within 2 days", views: 96, helpful: 8, followers: 4, responses: [],
  },
  {
    id: "mi-et-projects", boardId: "mi-e-suw-meetup", type: "question",
    title: "Which project from another city do you want to try?",
    handle: "Ana", grade: "Junior", place: "West Michigan", postedAgo: "5d ago", state: "answered",
    routedScope: "Event volunteers", expectedWindow: "within 2 days", views: 301, helpful: 33, followers: 7, comments: 6,
    responses: [
      { kind: "answer", proId: "pro-brooks", primary: true, postedAgo: "5d ago", body: "Pick the one that fits your school's size. Then ask that group here how they started." },
      { kind: "peer", handle: "Noah", grade: "Freshman", place: "Marquette", body: "The Flint group's coat drive. We need coats up here in winter.", postedAgo: "4d ago", likes: 11 },
      { kind: "peer", handle: "Marcus", grade: "Sophomore", place: "Genesee", body: "Happy to share how we did it. Start with one school first.", postedAgo: "4d ago", likes: 9 },
    ],
  },
  {
    id: "uw-et-first-ask", boardId: "uw-e-mentor-night", type: "question",
    title: "What should I ask my mentor first?",
    handle: "Andre", grade: "Senior", place: "Midlands", postedAgo: "2w ago", state: "answered",
    routedScope: "Event volunteers", expectedWindow: "within 2 days", views: 402, helpful: 41, followers: 8, comments: 5,
    responses: [
      { kind: "answer", proId: "pro-okafor", primary: true, postedAgo: "2w ago", body: "Ask what they wish they knew at your age. Then ask how they would start if they were you." },
      { kind: "peer", handle: "Sofia", grade: "Senior", place: "Orange County", body: "I asked that too. My mentor talked for twenty minutes. So helpful.", postedAgo: "2w ago", likes: 10 },
    ],
  },
];
