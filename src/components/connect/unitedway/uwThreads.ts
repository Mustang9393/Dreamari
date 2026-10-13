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
      { kind: "answer", proId: "pro-whitfield", primary: true, postedAgo: "3d ago", body: "Start with a summer internship. Lansing has lots of state offices. Look at Programs for the public service internships." },
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
    title: "Reading buddy shifts in Jackson: how they work",
    // DEMO-ONLY graphic (13 Oct 2026): graphic posts like every other board
    graphic: { text: "Reading buddies · Jackson · Tuesdays 4 PM · 1 hour · Counts as service", bg: "p-pastel", font: "classic" },
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
    title: "Saturday food crew needs teen helpers",
    body: "The Kalamazoo food bank needs teen helpers on Saturdays at 9 AM. Ages 14 and up. It counts as service hours, and leads learn to plan and run a team. That is how I started before nursing.",
    graphic: { text: "Saturday food crew · Kalamazoo · 9 AM · Ages 14+ · Counts as service", bg: "p-sunset-sea", font: "display" },
    postedAgo: "5h ago", helpful: 34,
    replies: [{ handle: "Theo", grade: "Junior", place: "Kalamazoo", body: "Signing up for the food bank crew this Saturday.", postedAgo: "4h ago", likes: 6 }, { proId: "pro-brooks", body: "Love it. Ages 14 and up can join.", postedAgo: "3h ago", likes: 9 }],
  },
  {
    id: "uwi-sc-bc-nurse", boardId: SC, type: "insight", proId: "pro-reyes", place: "Battle Creek",
    title: "Shadow a public health nurse on Dec 10",
    body: "Spend a day with our public health nurses in Battle Creek on Dec 10. You will visit a school and a clinic. Open to juniors and seniors. Sign up in Programs.",
    graphic: { text: "Shadow a public health nurse · Dec 10 · Battle Creek · Juniors and seniors", bg: "p-teal-cloud", font: "classic" },
    postedAgo: "1d ago", helpful: 52,
    replies: [{ handle: "Nia", grade: "Junior", place: "Battle Creek", body: "Signed up for the shadow day!", postedAgo: "20h ago", likes: 11 }],
  },
  {
    id: "uwi-sc-lan-city", boardId: SC, type: "insight", proId: "pro-doyle", place: "Lansing",
    title: "City summer jobs open in February",
    body: "City offices post summer jobs for teens in February: parks, libraries and youth programs. Set a reminder now. Our interns do real work from week one.",
    graphic: { text: "City summer jobs open in February · Parks · Libraries · Youth programs", bg: "p-city-dusk", font: "display" },
    postedAgo: "7h ago", helpful: 41,
    replies: [{ handle: "Leo", grade: "Sophomore", place: "Lansing", body: "I didn't know parks had planners. So cool.", postedAgo: "6h ago", likes: 8 }, { handle: "Andre", grade: "Senior", place: "Lansing", body: "Applying for the parks internship this week.", postedAgo: "4h ago", likes: 5 }],
  },
  {
    id: "uwi-sc-across-ask", boardId: SC, type: "insight", proId: "pro-whitfield", place: "Lansing",
    title: "How to get answers from all four towns",
    body: "Post your question on this board and students and pros in Kalamazoo, Battle Creek, Lansing and Jackson can all answer. Most answers come within a day.",
    graphic: { text: "Ask once, hear from four towns · Most answers come within a day", bg: "p-above-clouds", font: "classic" },
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

// ——— More activity on South Central's community boards (13 Oct 2026,
// Chandu: "show way more activity in the feeds"). DEMO-ONLY: every
// question, answer, reply and count below. Students only ask, comment and
// like; professionals answer and post. Positive framing, first names,
// 8th-grade copy. Ids listed in uwSouthCentral.ts `across` sit on the
// shared board; the rest sit on their asker's or poster's community. ———
type Ans = [proId: string, body: string, ago: string];
type Peer = [handle: string, grade: string, place: string, body: string, ago: string, likes: number];
function q(id: string, place: string, handle: string, grade: string, ago: string, title: string, answers: Ans[], peers: Peer[] = [], helpful = 12, context?: string): Thread {
  return {
    id, boardId: SC, type: "question", title, context, handle, grade, place, postedAgo: ago,
    state: answers.length ? "answered" : "routed", routedScope: "Volunteers here", expectedWindow: "within 1 day",
    helpful, followers: Math.round(helpful / 4), comments: answers.length + peers.length + Math.round(helpful / 8), views: helpful * 14,
    responses: [
      ...answers.map(([proId, body, postedAgo], i) => ({ kind: "answer" as const, proId, primary: i === 0, postedAgo, body })),
      ...peers.map(([h, g, p, body, postedAgo, likes]) => ({ kind: "peer" as const, handle: h, grade: g, place: p, body, postedAgo, likes })),
    ],
  };
}
type Reply = [who: string, grade: string | null, place: string | null, body: string, ago: string, likes: number];
function post(id: string, place: string, proId: string, ago: string, title: string, body: string, helpful: number, replies: Reply[] = [], graphic?: Insight["graphic"]): Insight {
  return {
    id, boardId: SC, type: "insight", proId, place, title, body, graphic, postedAgo: ago, helpful,
    replies: replies.map(([who, grade, p, b, a, likes]) => (grade ? { handle: who, grade, place: p ?? undefined, body: b, postedAgo: a, likes } : { proId: who, body: b, postedAgo: a, likes })),
  };
}

export const UW_SC_MORE_THREADS: Thread[] = [
  // Kalamazoo
  q("sc-q-kz-teacher", "Kalamazoo", "Mia", "Junior", "40m ago", "How did you know teaching was right for you?", [["pro-wong", "I tutored my little cousin and loved the moment it clicked for her. Try a reading shift and see how it feels.", "20m ago"]], [["Theo", "Junior", "Kalamazoo", "The reading shift is so fun. The kids are hilarious.", "10m ago", 6]], 22),
  q("sc-q-kz-wmu", "Kalamazoo", "Owen", "Senior", "3h ago", "Does Western have service work that counts for class?", [["pro-wong", "Yes. Many classes there count service hours. Ask about it on your campus visit.", "2h ago"]], [["Ava", "Junior", "Kalamazoo", "My sister did this for her teaching class. She loved it.", "1h ago", 9]], 31),
  q("sc-q-kz-firstjob", "Kalamazoo", "Lila", "Sophomore", "5h ago", "What is a good first job at 16?", [["pro-tanaka", "Anything where you work with people: a library, a food bank, a camp. Those teach skills every job needs.", "4h ago"]], [], 18),
  q("sc-q-kz-yuw-join", "Kalamazoo", "Sam", "Freshman", "8h ago", "Can freshmen join Youth United Way?", [], [], 7),
  q("sc-q-kz-resume", "Kalamazoo", "Ava", "Junior", "1d ago", "What goes on a résumé if I only have volunteer work?", [["pro-whitfield", "Volunteer work is real work. Write what you did and what changed. Food drive lead counts.", "1d ago"]], [["Mia", "Junior", "Kalamazoo", "Saving this. Thank you!", "20h ago", 4]], 44),
  // Battle Creek
  q("sc-q-bc-pharm", "Battle Creek", "Diego", "Junior", "1h ago", "How long does it take to become a pharmacy tech?", [["pro-ortega", "Most programs take under a year. Some stores even train you while you work.", "45m ago"]], [["Nia", "Junior", "Battle Creek", "Wait, they pay you while you learn? Love that.", "30m ago", 5]], 26),
  q("sc-q-bc-pt", "Battle Creek", "Grace", "Senior", "4h ago", "What does a physical therapist do all day?", [["pro-adler", "I help people move again after they get hurt. Lots of talking, lots of cheering people on.", "3h ago"]], [], 19),
  q("sc-q-bc-shadow", "Battle Creek", "Nia", "Junior", "9h ago", "What should I wear to the nurse shadow day?", [["pro-reyes", "Comfy shoes and plain clothes. We give you a badge. Bring one question.", "8h ago"]], [["Amaya", "Junior", "Battle Creek", "I'm going too! See you there.", "7h ago", 8]], 15),
  q("sc-q-bc-caring", "Battle Creek", "Eli", "Sophomore", "1d ago", "Can I lead a project at Youth Day of Caring?", [], [], 9),
  // Lansing
  q("sc-q-lan-city", "Lansing", "Andre", "Senior", "30m ago", "What jobs does a city office have for teens?", [["pro-doyle", "Parks, libraries and summer programs hire teens. Data and writing help too.", "15m ago"]], [["Leo", "Sophomore", "Lansing", "I'm applying to the parks one!", "5m ago", 3]], 21),
  q("sc-q-lan-data", "Lansing", "Priya", "Junior", "2h ago", "Is data science a real job at nonprofits?", [["pro-doyle", "Yes. I use data to find where help is needed most. Start with a stats class.", "1h ago"]], [], 28),
  q("sc-q-lan-capcan", "Lansing", "Sam", "Senior", "6h ago", "Did anyone go to a CapCAN FAFSA night?", [], [["Andre", "Senior", "Lansing", "Yes. They helped my mom with every page. Took one hour.", "5h ago", 11]], 17),
  q("sc-q-lan-code", "Lansing", "Jaden", "Sophomore", "1d ago", "Do I need to be good at math to code?", [["pro-rossi", "Not great, just curious. Most code is logic, like a puzzle. Try a free class first.", "1d ago"]], [["Priya", "Junior", "Lansing", "I'm bad at math and I love coding!", "20h ago", 14]], 39),
  // Jackson
  q("sc-q-jx-mentor", "Jackson", "Jada", "Senior", "1h ago", "What do you do with your Big each week?", [], [["Kai", "Junior", "Jackson", "We do homework, then play cards. My Big helped me pick classes.", "40m ago", 9]], 20),
  q("sc-q-jx-bank", "Jackson", "Marcus", "Junior", "5h ago", "How do I open my first bank account?", [["pro-okafor", "Bring an ID and a parent if you're under 18. Ask for a student account with no fees.", "4h ago"]], [], 33),
  q("sc-q-jx-design", "Jackson", "Ruby", "Sophomore", "8h ago", "Can art be a job, not just a hobby?", [["pro-cole", "Yes! Brands, games and nonprofits all need designers. Start a folder of your best work.", "7h ago"]], [["Jada", "Senior", "Jackson", "This made my day.", "6h ago", 7]], 41),
  q("sc-q-jx-mlk", "Jackson", "Kai", "Junior", "1d ago", "Who's coming to MLK Day of Service?", [], [["Ruby", "Sophomore", "Jackson", "Me and three friends!", "20h ago", 5], ["Marcus", "Junior", "Jackson", "Count me in.", "18h ago", 3]], 12),
  // shared board
  q("sc-q-across-van", "Kalamazoo", "Owen", "Senior", "2h ago", "Can Kalamazoo students ride the Lansing van on Nov 14?", [], [["Sam", "Senior", "Lansing", "Ask your Student United lead. We had two open seats last time.", "1h ago", 6]], 10),
  q("sc-q-across-club", "Jackson", "Ruby", "Sophomore", "7h ago", "Which town has the best service club? Let's swap ideas.", [["pro-wong", "Love this. Each town, post one project that worked. Then steal one!", "6h ago"]], [["Theo", "Junior", "Kalamazoo", "Kalamazoo: teen grant voting.", "5h ago", 12], ["Nia", "Junior", "Battle Creek", "Battle Creek: park clean-up with a picnic.", "5h ago", 10], ["Leo", "Sophomore", "Lansing", "Lansing: food box crew!", "4h ago", 9]], 52),
  q("sc-q-across-summer", "Battle Creek", "Grace", "Senior", "1d ago", "Summer plans: who is doing an internship?", [["pro-tanaka", "Great question to ask early. Most summer spots open in February.", "1d ago"]], [["Andre", "Senior", "Lansing", "Parks internship in Lansing, fingers crossed.", "22h ago", 8]], 34),
];

export const UW_SC_MORE_POSTS: Insight[] = [
  post("uwi-sc-kz-teach", "Kalamazoo", "pro-wong", "2h ago", "Become a reading tutor this fall", "The best part of my job is the moment a student gets it. If you love that feeling, teaching might be for you. Try a reading shift this month.", 38, [["Mia", "Junior", "Kalamazoo", "This is exactly why I want to teach.", "1h ago", 5]], { text: "Become a reading tutor · 2 hours a week · After school · Training included", bg: "p-snow-peak", font: "classic" }),
  post("uwi-sc-kz-interview", "Kalamazoo", "pro-tanaka", "1d ago", "Three things I look for in a first job interview", "Show up on time. Make eye contact. Ask one question about the job. That's it. You don't need a long résumé to do well.", 61, [["Owen", "Senior", "Kalamazoo", "Short and clear. Thanks!", "20h ago", 7]]),
  post("uwi-sc-bc-pharm", "Battle Creek", "pro-ortega", "3h ago", "How to start in pharmacy, fast", "Pharmacy tech training takes under a year, and many stores pay you while you learn. Later you can go on to pharmacy school. Ask me anything about it.", 33, [["Diego", "Junior", "Battle Creek", "How many years is pharmacy school?", "2h ago", 4], ["pro-ortega", null, null, "Usually six to eight after high school. Many start as techs first.", "1h ago", 9]], { text: "Pharmacy tech: under 1 year of training · Many stores pay while you learn", bg: "p-peak-dawn", font: "display" }),
  post("uwi-sc-bc-pt", "Battle Creek", "pro-adler", "1d ago", "Why I love physical therapy", "I get to watch people walk again after an injury. It takes science and a lot of heart. Shadow day spots are open in December.", 29, [["Grace", "Senior", "Battle Creek", "Signing up!", "1d ago", 3]]),
  post("uwi-sc-lan-code", "Lansing", "pro-rossi", "4h ago", "Learn to code for free, in three steps", "I learned to code at 17 with free videos. Start small: make a simple website about something you love.", 47, [["Jaden", "Sophomore", "Lansing", "Starting tonight!", "3h ago", 8]], { text: "Learn to code free: pick 1 course · build 1 small site · share it here", bg: "p-night-sky", font: "display" }),
  post("uwi-sc-lan-audit", "Lansing", "pro-weiss", "2d ago", "What an auditor really does", "I help companies and nonprofits keep honest records. If you like puzzles and numbers, look at accounting.", 22, []),
  post("uwi-sc-jx-design", "Jackson", "pro-cole", "2h ago", "Build your first design portfolio", "Every drawing counts. Take photos of your best ten pages. That is how I got my first design job.", 55, [["Ruby", "Sophomore", "Jackson", "I have so many sketchbooks! Doing this.", "1h ago", 10]], { text: "Start a portfolio: your 10 best pages · a photo of each · 1 line on why", bg: "s-studio", font: "display" }),
  post("uwi-sc-jx-money", "Jackson", "pro-okafor", "1d ago", "One money tip for your first paycheck", "Save a little from every check, even five dollars. It adds up faster than you think.", 40, [["Marcus", "Junior", "Jackson", "Opening my account this week.", "20h ago", 6]]),
  post("uwi-sc-across-health", "Battle Creek", "pro-brooks", "5h ago", "Teen helper spots at clinics in all four towns", "Kalamazoo, Battle Creek, Lansing and Jackson all have clinics that hire teens to help out. Ask at the front desk. That's how I started.", 36, [["Nia", "Junior", "Battle Creek", "Asking at our clinic Monday.", "4h ago", 5], ["Kai", "Junior", "Jackson", "Didn't know Jackson had this!", "3h ago", 4]], { text: "Clinics in all 4 towns take teen helpers · Ask at the front desk", bg: "p-teal-cloud", font: "classic" }),
  post("uwi-sc-across-code", "Lansing", "pro-chen", "1d ago", "A coding club for all four towns?", "If students in each town want to learn together, I can run one online night a month. Reply if you'd join.", 58, [["Jaden", "Sophomore", "Lansing", "Yes please!", "1d ago", 9], ["Owen", "Senior", "Kalamazoo", "I'm in.", "22h ago", 7], ["Ruby", "Sophomore", "Jackson", "Me too!", "20h ago", 6]]),
];

// ——— Posts from the people at past events (13 Oct 2026, Chandu: "the feed
// (posts) in the event I've opened has three cards. Instead put the pinned
// recap inside the feed, have more posts from participants"). Pros who were
// in the room follow up on each event's own board. DEMO-ONLY ———
function evPost(boardId: string, id: string, place: string, proId: string, ago: string, title: string, body: string, helpful: number, replies: Reply[] = [], graphic?: Insight["graphic"]): Insight {
  return { ...post(id, place, proId, ago, title, body, helpful, replies, graphic), boardId };
}
const FALL = "sc-e-fall-convening", YLU = "sc-e-ylu-summer", MIM = "mi-e-suw-meetup", MENTOR = "uw-e-mentor-night";
export const UW_EVENT_POSTS: Insight[] = [
  evPost(FALL, "uwe-fall-data", "Lansing", "pro-doyle", "6d ago", "Data jobs you can aim for near home", "At the city office table, students asked what data people do all day. We find where help is needed most, then show it so others act. Start with one stats class.", 58, [["Leo", "Sophomore", "Lansing", "Taking stats next year now!", "5d ago", 9], ["Jada", "Senior", "Jackson", "Can I shadow you?", "5d ago", 6]], { text: "Data jobs near you: city offices · health departments · nonprofits", bg: "p-city-dusk", font: "display" }),
  evPost(FALL, "uwe-fall-projects", "Kalamazoo", "pro-wong", "1w ago", "Your project ideas, one by one", "I read every card from the project table. The best ones started small: a reading corner, a coat drive, a park clean-up. Pick one and post your first step here.", 44, [["Theo", "Junior", "Kalamazoo", "Our reading corner starts next week!", "6d ago", 11]]),
  evPost(FALL, "uwe-fall-health", "Battle Creek", "pro-brooks", "5d ago", "Health jobs that take one to two years", "Most of you asked if you need med school. You don't. Nursing, pharmacy tech and imaging start with one or two years of school.", 39, [["Nia", "Junior", "Battle Creek", "This changed my plan. Thank you!", "4d ago", 8]], { text: "Health jobs in 1 to 2 years: nursing assistant · pharmacy tech · imaging", bg: "p-teal-cloud", font: "classic" }),
  evPost(FALL, "uwe-fall-follow", "Lansing", "pro-whitfield", "4d ago", "How to follow up with someone you met", "Send one short note within a week. Say where you met and ask one question. That's it. Most people answer.", 52, [["Andre", "Senior", "Lansing", "Sent mine today. She already wrote back!", "3d ago", 14]]),
  evPost(FALL, "uwe-fall-tables", "Kalamazoo", "pro-tanaka", "3d ago", "Save the date: next convening Nov 14", "All four towns meet again on Nov 14 in Battle Creek. Vans leave from Lansing and Jackson. Bring one question for each table you want to visit.", 47, [], { text: "Next convening · Nov 14 · Battle Creek · Vans from Lansing and Jackson", bg: "p-peak-dawn", font: "display" }),
  evPost(YLU, "uwe-ylu-serve", "Jackson", "pro-doyle", "6w ago", "Serving as a group changes the work", "Young Leaders United picked one project for the fall. Doing it together made it faster and more fun. Bring a friend next time.", 21, [["Kai", "Junior", "Jackson", "Bringing my cousin to the next one.", "6w ago", 3]]),
  evPost(YLU, "uwe-ylu-teach", "Kalamazoo", "pro-wong", "7w ago", "Tutors needed in all four towns", "Many of you asked about teaching jobs. Schools in all four towns need tutors now. It's a great first step.", 18, [], { text: "Tutors needed in all 4 towns this fall · 2 hours a week", bg: "p-snow-peak", font: "classic" }),
  evPost(YLU, "uwe-ylu-resume", "Lansing", "pro-whitfield", "7w ago", "Put your service on your résumé", "Service hours show you show up. List what you did and what changed. Recruiters notice.", 26, []),
  evPost(MIM, "uwe-mim-start", "West Michigan", "pro-tanaka", "1w ago", "Starting a group at your school", "Every group at the meetup started with three friends and one idea. Start small. Then ask other cities how they grew.", 19, [["Ana", "Junior", "West Michigan", "We started with four. Now we're twelve!", "6d ago", 7]]),
  evPost(MIM, "uwe-mim-money", "Southeast Michigan", "pro-okafor", "1w ago", "How to run a drive at your school", "Set a small goal, tell people why it matters, and thank every giver. That works for a bake sale and for a bank.", 23, [], { text: "Run a drive: set a goal · say why it matters · thank every giver", bg: "p-pastel", font: "classic" }),
  evPost(MENTOR, "uwe-mentor-first", "Orange County", "pro-reyes", "2w ago", "What mentors loved hearing from you", "The best questions were simple: how did you start, and what would you do at my age. Keep asking those.", 31, [["Sofia", "Senior", "Orange County", "My mentor said the same thing!", "2w ago", 5]]),
  evPost(MENTOR, "uwe-mentor-next", "Midlands", "pro-whitfield", "2w ago", "Your next step after mentor night", "Pick one mentor and send one question this month. Then post what you learned here.", 27, [], { text: "After mentor night: pick 1 mentor · send 1 question by Nov 1", bg: "p-above-clouds", font: "display" }),
];

// ——— More professionals answering every South Central question (13 Oct
// 2026, Chandu: "for each student question ... populate more responses from
// professionals so it looks like there's motion happening here ... Same idea
// as how you have it on the Connect community boards"). Two or three pros
// answer each one, in their own field and voice. DEMO-ONLY ———
const MORE_ANSWERS: Record<string, [proId: string, body: string, ago: string][]> = {
  "sc-t-nonprofit": [["pro-wong", "Yes. Khan Academy is a nonprofit and pays a real salary. Look at the job, not just the label.", "1d ago"], ["pro-tanaka", "Many big nonprofits pay close to companies for tech and finance roles.", "20h ago"]],
  "sc-t-government": [["pro-doyle", "Start with a summer job at a city office. Many full-time hires started as interns.", "2d ago"], ["pro-whitfield", "Set alerts on your city's and state's job pages. They post often.", "1d ago"]],
  "sc-t-student-united": [["pro-wong", "Yes. Many colleges have a chapter. If yours doesn't, start one with two friends.", "3d ago"], ["pro-brooks", "I kept serving in college. It helped me find my first job.", "2d ago"]],
  "sc-t-health": [["pro-brooks", "We visit schools and homes, give shots, and teach families how to stay well.", "4d ago"], ["pro-ortega", "Public health nurses team up with pharmacists a lot. Every day is different.", "3d ago"]],
  "sc-t-fafsa": [["pro-okafor", "Bring your parent's tax forms and an hour. CapCAN walks you through each page.", "2d ago"], ["pro-tanaka", "Ask your school counselor too. Many schools run a FAFSA night in the fall.", "1d ago"]],
  "sc-t-planner": [["pro-doyle", "Many planners start with a bachelor's. A master's helps later, not on day one.", "1h ago"], ["pro-chen", "Learn maps and data tools early. Planners use them every day.", "40m ago"]],
  "sc-t-msu": [["pro-wong", "Education, social work, public health and nonprofit management all lead there.", "5h ago"], ["pro-doyle", "Public health at MSU is a great path. So is data science at Western.", "3h ago"]],
  "sc-t-yuw-ask": [["pro-wong", "It's real decision-making. Teens learn how money helps a town.", "4h ago"]],
  "sc-t-next-convening": [["pro-whitfield", "I'll be at the jobs table. Bring one question you really want answered.", "16h ago"], ["pro-brooks", "Health table again! Come say hi.", "12h ago"]],
  "sc-t-hours-swap": [["pro-tanaka", "Yes. Hours count in any town. Sign up under Serve and check in at the shift.", "2h ago"], ["pro-wong", "Kalamazoo's reading shift is open to all four towns.", "1h ago"]],
  "sc-et-favorite": [["pro-doyle", "Mine was hearing your town project ideas. So many good ones.", "6d ago"], ["pro-reyes", "The health table was packed all day. Thank you for the questions!", "6d ago"]],
  "sc-et-shared-day": [["pro-doyle", "Lansing city staff want to help with the parks project.", "5d ago"]],
  "sc-et-college-table": [["pro-wong", "Yes! Michigan State and Western both said they'll come back.", "20h ago"], ["pro-whitfield", "I'll bring résumé tips to the college table too.", "18h ago"]],
  "sc-q-kz-teacher": [["pro-cole", "I teach design workshops on weekends. Seeing a student's first good idea never gets old.", "15m ago"], ["pro-adler", "Coaching patients feels like teaching too. Try tutoring to see if you love it.", "10m ago"]],
  "sc-q-kz-wmu": [["pro-doyle", "Ask for service learning classes. They often mix class work with real projects.", "1h ago"]],
  "sc-q-kz-firstjob": [["pro-whitfield", "A grocery or camp job teaches you to show up and talk to people. Recruiters love that.", "3h ago"], ["pro-okafor", "Save part of your first check. Even a little.", "2h ago"]],
  "sc-q-kz-yuw-join": [["pro-wong", "Yes. Freshmen are welcome. Ask your school's Youth United Way lead.", "6h ago"], ["pro-tanaka", "Join early. You'll have four years to lead.", "5h ago"]],
  "sc-q-kz-resume": [["pro-tanaka", "Put your best volunteer role first, with one number: hours, people helped, money raised.", "20h ago"], ["pro-weiss", "Keep it to one page. Clear beats long.", "18h ago"]],
  "sc-q-bc-pharm": [["pro-reyes", "Many techs work while they study for the next step, like nursing or pharmacy school.", "30m ago"]],
  "sc-q-bc-pt": [["pro-brooks", "PTs and nurses work side by side. It's a great team.", "2h ago"], ["pro-reyes", "Shadow a PT for a day. You'll know fast if you love it.", "1h ago"]],
  "sc-q-bc-shadow": [["pro-brooks", "Closed shoes, and bring a snack. It's a long, fun day.", "6h ago"]],
  "sc-q-bc-caring": [["pro-tanaka", "Yes. Ask early. Leads help pick the project and run the team.", "20h ago"], ["pro-wong", "Lead with a friend your first time. It's easier with two.", "18h ago"]],
  "sc-q-lan-city": [["pro-whitfield", "Look for summer youth jobs on the city site in February.", "10m ago"]],
  "sc-q-lan-data": [["pro-chen", "Yes! Many nonprofits hire data analysts. Learn spreadsheets first.", "45m ago"], ["pro-rossi", "Try a free coding class. Data work often uses a little code.", "30m ago"]],
  "sc-q-lan-capcan": [["pro-okafor", "Great that you went. Do the FAFSA as early as you can each year.", "4h ago"], ["pro-tanaka", "Save your FAFSA login somewhere safe. You'll need it every year.", "3h ago"]],
  "sc-q-lan-code": [["pro-chen", "I started with simple games. Math came later, when I needed it.", "22h ago"]],
  "sc-q-jx-mentor": [["pro-wong", "Mentors help with homework, plans and confidence. Small talks add up.", "30m ago"], ["pro-whitfield", "Ask your Big about their first job. Great talk starter.", "20m ago"]],
  "sc-q-jx-bank": [["pro-weiss", "Pick a bank with no monthly fee and a good app.", "3h ago"]],
  "sc-q-jx-design": [["pro-chen", "Designers and engineers work together on every app you use.", "6h ago"]],
  "sc-q-jx-mlk": [["pro-tanaka", "I'll be there with my team. See you in the gym!", "16h ago"], ["pro-brooks", "Bring water and a friend. It's a great day.", "14h ago"]],
  "sc-q-across-van": [["pro-whitfield", "Yes, if there are seats. Ask by Nov 10 so they can plan.", "40m ago"], ["pro-wong", "Kalamazoo has a van too this time. Check with your lead.", "30m ago"]],
  "sc-q-across-club": [["pro-tanaka", "Jackson's mentor club is great too. Steal the best of each.", "4h ago"]],
  "sc-q-across-summer": [["pro-whitfield", "Apply to three. Most students who apply to three get one.", "20h ago"], ["pro-doyle", "Our public health office takes summer interns too.", "18h ago"]],
};
for (const t of [...UW_THREADS, ...UW_SC_MORE_THREADS, ...UW_EVENT_THREADS]) {
  const more = MORE_ANSWERS[t.id];
  if (!more) continue;
  const hasPrimary = t.responses.some((r) => r.kind === "answer" && r.primary);
  const answers = more.map(([proId, body, postedAgo], i) => ({ kind: "answer" as const, proId, body, postedAgo, primary: !hasPrimary && i === 0 }));
  // answers first (the thread page leads with them), then the students' replies
  const firstPeer = t.responses.findIndex((r) => r.kind === "peer");
  if (firstPeer < 0) t.responses.push(...answers);
  else t.responses.splice(firstPeer, 0, ...answers);
  t.state = "answered";
  t.comments = Math.max(t.comments ?? 0, t.responses.length + 4);
}
