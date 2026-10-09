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

import type { Thread } from "../data";

const NET = "united-way-student-success";
const MI = "united-way-michigan";
const SC = "united-way-south-central";

export const UW_THREADS: Thread[] = [
  // ——— network ———
  {
    id: "uw-t-health", boardId: NET, type: "question",
    title: "I like health care but not med school. What else is there?",
    context: "Blood makes me nervous. Is there anything that takes less than 10 years?",
    handle: "Maya", grade: "Junior", postedAgo: "2d ago", state: "answered",
    routedScope: "Health careers", expectedWindow: "within 1 day", helpful: 64, followers: 12, comments: 9,
    responses: [
      { kind: "answer", proId: "pro-reyes", primary: true, postedAgo: "2d ago", body: "Nursing, imaging, pharmacy tech. Most take two years or less. Try the hospital job shadow on Events." },
      { kind: "answer", proId: "pro-ortega", postedAgo: "1d ago", body: "Pharmacy tech is a good start. A short course, then you get paid." },
      { kind: "peer", handle: "Jade", grade: "Senior", body: "I did the job shadow last year. The imaging team was so cool.", postedAgo: "1d ago", likes: 21 },
    ],
  },
  {
    id: "uw-t-internship", boardId: NET, type: "question",
    title: "How do I get an internship if no one I know has an office job?",
    handle: "Andre", grade: "Senior", postedAgo: "3d ago", state: "answered",
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
    handle: "Luis", grade: "Junior", postedAgo: "4d ago", state: "answered",
    routedScope: "Business & Finance", expectedWindow: "within 1 day", helpful: 41, followers: 6, comments: 4,
    responses: [
      { kind: "answer", proId: "pro-okafor", primary: true, postedAgo: "4d ago", body: "Mostly learning the tools and the people. Ask one good question a day." },
    ],
  },
  {
    id: "uw-t-hours", boardId: NET, type: "question",
    title: "Do service hours really help with scholarships?",
    handle: "Priya", grade: "Sophomore", postedAgo: "5d ago", state: "answered",
    routedScope: "Paying for college", expectedWindow: "within 1 day", helpful: 37, followers: 8, comments: 5,
    responses: [
      { kind: "answer", proId: "pro-tanaka", primary: true, postedAgo: "5d ago", body: "Yes. Many ask for them. Serve keeps your record and a signed letter." },
      { kind: "peer", handle: "Omar", grade: "Senior", body: "My scholarship asked for 40 hours. Glad I kept track.", postedAgo: "4d ago", likes: 14 },
    ],
  },
  {
    id: "uw-t-fafsa", boardId: NET, type: "question",
    title: "Do I need my parents' taxes for the FAFSA?",
    handle: "Sofia", grade: "Senior", postedAgo: "6d ago", state: "answered",
    routedScope: "Paying for college", expectedWindow: "within 1 day", helpful: 52, followers: 15, comments: 6,
    responses: [
      { kind: "answer", proId: "pro-wong", primary: true, postedAgo: "6d ago", body: "Usually yes. Bring a parent to Financial aid night. We fill it out together." },
    ],
  },
  {
    id: "uw-t-recruiting", boardId: NET, type: "question",
    title: "Is recruiting a good job if I like people but not sales?",
    handle: "Maya", grade: "Junior", postedAgo: "2h ago", state: "routed",
    routedScope: "Recruiting", expectedWindow: "within 1 day", helpful: 3, followers: 2, responses: [],
  },
  {
    id: "uw-t-interview", boardId: NET, type: "question",
    title: "What should I wear to my first job interview?",
    handle: "Luis", grade: "Senior", postedAgo: "5h ago", state: "routed",
    routedScope: "First jobs", expectedWindow: "within 1 day", helpful: 6, followers: 4, responses: [],
  },
  {
    id: "uw-t-sixteen", boardId: NET, type: "question",
    title: "Can I get an office internship at 16?",
    handle: "Ava", grade: "Sophomore", postedAgo: "1d ago", state: "routed",
    routedScope: "Internships", expectedWindow: "within 1 day", helpful: 4, followers: 3, responses: [],
  },

  // ——— Michigan ———
  {
    id: "mi-t-summer", boardId: MI, type: "question",
    title: "How do I get a summer job in Detroit at 15?",
    handle: "Jaylen", grade: "Freshman", postedAgo: "1d ago", state: "answered",
    routedScope: "Summer jobs", expectedWindow: "within 1 day", helpful: 72, followers: 18, comments: 8,
    responses: [
      { kind: "answer", proId: "pro-whitfield", primary: true, postedAgo: "1d ago", body: "Try Grow Detroit's Young Talent. Paid summer jobs for ages 14 to 24. Sign-ups open in March." },
      { kind: "peer", handle: "Kiara", grade: "Junior", body: "I did it last summer at a hospital. Sign up the first week, it fills up.", postedAgo: "20h ago", likes: 31 },
    ],
  },
  {
    id: "mi-t-trades", boardId: MI, type: "question",
    title: "Do I need college to work in the trades?",
    handle: "Eli", grade: "Senior", postedAgo: "2d ago", state: "answered",
    routedScope: "Trades", expectedWindow: "within 1 day", helpful: 61, followers: 11, comments: 6,
    responses: [
      { kind: "answer", proId: "pro-tanaka", primary: true, postedAgo: "2d ago", body: "No. Most trades start as paid apprentices. Watch the trades panel on Events." },
    ],
  },
  {
    id: "mi-t-suw", boardId: MI, type: "question",
    title: "Does Student United Way help with college?",
    handle: "Ana", grade: "Junior", postedAgo: "3d ago", state: "answered",
    routedScope: "Paying for college", expectedWindow: "within 1 day", helpful: 44, followers: 7, comments: 4,
    responses: [
      { kind: "answer", proId: "pro-okafor", primary: true, postedAgo: "3d ago", body: "Yes. It shows you led something real. Ask your advisor for a letter." },
    ],
  },
  {
    id: "mi-t-age", boardId: MI, type: "question",
    title: "Can I volunteer if I'm 14?",
    handle: "Noah", grade: "Freshman", postedAgo: "4d ago", state: "answered",
    routedScope: "Service hours", expectedWindow: "within 1 day", helpful: 39, followers: 5, comments: 3,
    responses: [
      { kind: "answer", proId: "pro-brooks", primary: true, postedAgo: "4d ago", body: "Yes. Many shifts on Serve start at 14." },
    ],
  },
  {
    id: "mi-t-nurse", boardId: MI, type: "question",
    title: "What do nurses at a hospital in Grand Rapids do all day?",
    handle: "Nia", grade: "Junior", postedAgo: "1h ago", state: "routed",
    routedScope: "Health careers", expectedWindow: "within 1 day", helpful: 2, followers: 2, responses: [],
  },
  {
    id: "mi-t-shadow", boardId: MI, type: "question",
    title: "How do I ask for a job shadow if I don't know anyone?",
    handle: "Marcus", grade: "Sophomore", postedAgo: "4h ago", state: "routed",
    routedScope: "First jobs", expectedWindow: "within 1 day", helpful: 5, followers: 3, responses: [],
  },
  {
    id: "mi-t-apprentice", boardId: MI, type: "question",
    title: "Is an apprenticeship better than community college?",
    handle: "Eli", grade: "Senior", postedAgo: "1d ago", state: "routed",
    routedScope: "Trades", expectedWindow: "within 1 day", helpful: 7, followers: 4, responses: [],
  },
  // ——— South Central Michigan (10 Oct 2026): nonprofit and public sector
  // careers, the call's focus. DEMO-ONLY: questions, answers and counts ———
  {
    id: "sc-t-nonprofit", boardId: SC, type: "question",
    title: "Can you make a living working at a nonprofit?",
    context: "I want to help people, but I also need to pay rent.",
    handle: "Maya", grade: "Junior", postedAgo: "2d ago", state: "answered",
    routedScope: "Nonprofit jobs", expectedWindow: "within 1 day", helpful: 58, followers: 10, comments: 6,
    responses: [
      { kind: "answer", proId: "pro-doyle", primary: true, postedAgo: "2d ago", body: "Yes. Pay starts lower than some jobs, then grows. Many nonprofits pay off student loans too. Ask about that." },
      { kind: "peer", handle: "Jordan", grade: "College", body: "My internship at a nonprofit paid. Ask before you assume it won't.", postedAgo: "1d ago", likes: 17 },
    ],
  },
  {
    id: "sc-t-government", boardId: SC, type: "question",
    title: "How do I get a job with the city or the state?",
    handle: "Andre", grade: "Senior", postedAgo: "3d ago", state: "answered",
    routedScope: "Government jobs", expectedWindow: "within 1 day", helpful: 47, followers: 8, comments: 4,
    responses: [
      { kind: "answer", proId: "pro-whitfield", primary: true, postedAgo: "3d ago", body: "Start with a summer internship. Lansing has lots of state offices. Watch Shared by professionals on Home." },
    ],
  },
  {
    id: "sc-t-student-united", boardId: SC, type: "question",
    title: "Can I stay in Student United when I go to college?",
    handle: "Ana", grade: "Senior", postedAgo: "4d ago", state: "answered",
    routedScope: "Student United", expectedWindow: "within 1 day", helpful: 39, followers: 6, comments: 3,
    responses: [
      { kind: "answer", proId: "pro-wong", primary: true, postedAgo: "4d ago", body: "Yes. There are college chapters too. After college, Young Leaders United picks up where it ends." },
    ],
  },
  {
    id: "sc-t-health", boardId: SC, type: "question",
    title: "What does a public health nurse do all day?",
    handle: "Nia", grade: "Junior", postedAgo: "5d ago", state: "answered",
    routedScope: "Health careers", expectedWindow: "within 1 day", helpful: 33, followers: 5, comments: 2,
    responses: [
      { kind: "answer", proId: "pro-reyes", primary: true, postedAgo: "5d ago", body: "Home visits, shots at schools, and teaching families. Try the job shadow in Battle Creek." },
    ],
  },
  {
    id: "sc-t-planner", boardId: SC, type: "question",
    title: "Do I need a master's degree to be a city planner?",
    handle: "Leo", grade: "Sophomore", postedAgo: "2h ago", state: "routed",
    routedScope: "Government jobs", expectedWindow: "within 1 day", helpful: 4, followers: 2, responses: [],
  },
  {
    id: "sc-t-msu", boardId: SC, type: "question",
    title: "Which majors at MSU or Western lead to nonprofit work?",
    handle: "Priya", grade: "Junior", postedAgo: "6h ago", state: "routed",
    routedScope: "Nonprofit jobs", expectedWindow: "within 1 day", helpful: 6, followers: 3, responses: [],
  },
];
