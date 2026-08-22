// Connect — mock data for the frontend prototype, shaped by the implementation
// handoff (Dreamari_Connect_Claude_Implementation_Handoff.docx, v1.0) and the
// Replit prototype's content evidence. Realistic where behavior needs it,
// clearly bounded: no backend exists yet, so routing/SLA/entitlement are
// simulated states, not real authorization (the handoff's P0 items are
// server-side work and are documented as assumptions in ConnectExperience).
//
// Identity rules, per direct request: students post under a handle + class
// year (Freshman/Sophomore/Junior/Senior) — Twitter-shaped, like the
// marketing site's own Connect chapter (src/components/marketing/chapters/
// Connect.tsx) — never a full/last name. Professionals display full name +
// verified scope ("what was verified and by whom"). No follower counts, no
// DMs, no popularity ranking anywhere.

export type QuestionState = "awaiting" | "routed" | "answered" | "resolved";

export type ProResponse = {
  kind: "answer";
  proId: string;
  primary?: boolean;
  body: string;
  disclosure?: string; // personal-experience disclosure, per handoff 13.3
  postedAgo: string;
};

export type FollowUp = { kind: "followup"; body: string; postedAgo: string };
export type PeerPerspective = { kind: "peer"; handle: string; grade: string; body: string; postedAgo: string };

export type Thread = {
  id: string;
  boardId: string;
  type: "question";
  title: string;
  context?: string;
  handle: string; // first-name-only handle, never a full/last name
  grade: string; // Freshman / Sophomore / Junior / Senior
  postedAgo: string;
  state: QuestionState;
  routedScope: string;
  expectedWindow: string;
  helpful: number;
  followers: number;
  responses: (ProResponse | FollowUp | PeerPerspective)[];
  saved?: boolean;
  unreadAnswer?: boolean; // powers the For You "new answers" module
};

export type Insight = {
  id: string;
  boardId: string;
  type: "insight";
  proId: string;
  title: string;
  body: string;
  postedAgo: string;
  helpful: number;
  saved?: boolean;
};

export type Opportunity = {
  id: string;
  boardId: string;
  type: "opportunity";
  org: string;
  kind: string; // Internship / Fellowship / Workshop resources
  title: string;
  body: string;
  eligibility: string;
  location: string;
  deadline: string;
  sourceLabel: string; // labeled external destination, per handoff 21
  verifiedDate: string;
  cta: "View details" | "View resource";
};

export type Pro = {
  id: string;
  name: string;
  role: string;
  org: string;
  scope: string; // approved answer scope
  verifiedBy: string; // "what was verified and by whom"
};

export type Community = {
  id: string;
  name: string;
  world: string; // maps to the app's world taxonomy for the identity accent
  purpose: string;
  topics: string[];
  students: number; // from the Replit prototype's real evidence counts
  activePros: number;
  responseWindow: string; // from recent performance, not a static promise
  joined: boolean;
  unreadAnswers: number;
  recommendedBecause?: string; // explicit-interest explanation (Top 3), never internal rankings
};

export const PROS: Pro[] = [
  { id: "pro-chen", name: "David Chen", role: "Software Engineer", org: "Amazon", scope: "Software engineering careers", verifiedBy: "Work email verified by Dreamari · Feb 2026" },
  { id: "pro-martinez", name: "Elena Martinez", role: "Brand Strategist", org: "EY", scope: "Consulting & professional services", verifiedBy: "Verified through EY partner program · Aug 2026" },
  { id: "pro-okafor", name: "Amara Okafor", role: "Investment Banking Analyst", org: "JPMorgan Chase", scope: "Finance & banking careers", verifiedBy: "Work email verified by Dreamari · May 2026" },
  { id: "pro-reyes", name: "Marcus Reyes", role: "Registered Nurse", org: "CVS Health", scope: "Nursing & patient care careers", verifiedBy: "License + employer verified by Dreamari · Mar 2026" },
];

export const COMMUNITIES: Community[] = [
  {
    id: "business-money",
    name: "Business & Money",
    world: "Business & Money",
    purpose: "Banking, investing, consulting and business careers — ask people who do the work.",
    topics: ["Investment Banking", "Consulting", "Accounting", "Economics"],
    students: 312,
    activePros: 11,
    responseWindow: "Most questions answered within 2 days",
    joined: true,
    unreadAnswers: 2,
  },
  {
    id: "tech-engineering",
    name: "Tech & Engineering",
    world: "Tech & Engineering",
    purpose: "Software, cybersecurity, AI and data careers, answered by working engineers.",
    topics: ["Software Engineering", "Cybersecurity", "AI & Data"],
    students: 389,
    activePros: 16,
    responseWindow: "Most questions answered within 1 day",
    joined: true,
    unreadAnswers: 1,
  },
  {
    id: "health-medicine",
    name: "Health & Medicine",
    world: "Health & Medicine",
    purpose: "Medicine, nursing and public health careers — real paths, real trade-offs.",
    topics: ["Nursing", "Medicine", "Public Health"],
    students: 267,
    activePros: 9,
    responseWindow: "Most questions answered within 3 days",
    joined: false,
    unreadAnswers: 0,
    recommendedBecause: "Because your Top 3 includes Registered Nurse",
  },
  {
    id: "arts-media",
    name: "Arts, Media & Sport",
    world: "Arts, Media & Sport",
    purpose: "Design, media, content and creative careers, without the gatekeeping.",
    topics: ["Design", "Media", "Marketing"],
    students: 198,
    activePros: 8,
    responseWindow: "Most questions answered within 3 days",
    joined: false,
    unreadAnswers: 0,
    recommendedBecause: "Because you saved Art Director in Explore",
  },
  {
    // name/world match exactly, same as every other community — a prior
    // draft invented "First-Gen & New to This" here under the Teaching &
    // Education color, which strayed from the app's established 15-world
    // taxonomy (that world is teaching careers, not general student support).
    id: "teaching-education",
    name: "Teaching & Education",
    world: "Teaching & Education",
    purpose: "Teaching, school counseling and education careers — from the people doing it.",
    topics: ["Elementary Teaching", "School Counseling", "Higher Education"],
    students: 428,
    activePros: 14,
    responseWindow: "Most questions answered within 2 days",
    joined: false,
    unreadAnswers: 0,
    recommendedBecause: "Because you saved School Counselor in Explore",
  },
];

export const THREADS: Thread[] = [
  {
    id: "t-cs-degree",
    boardId: "tech-engineering",
    type: "question",
    title: "Do I need a CS degree to work in tech?",
    context: "I love building things and I'm teaching myself to code, but I'm not sure I want to study computer science in college. What do tech companies actually look for?",
    handle: "Ethan",
    grade: "Junior",
    postedAgo: "1d ago",
    state: "answered",
    routedScope: "Software engineering careers",
    expectedWindow: "within 1 day",
    helpful: 27,
    followers: 8,
    unreadAnswer: true,
    responses: [
      {
        kind: "answer",
        proId: "pro-chen",
        primary: true,
        postedAgo: "14h ago",
        body: "Short answer: no, but you need proof you can build. My team has engineers from bootcamps, community college transfers, and self-taught paths. What we actually screen for is (1) can you write working code, (2) can you explain your thinking, (3) have you finished something real — even a small project counts. A degree is one way to show that; a portfolio of 2-3 finished projects is another. Trade-off to know: some larger companies still filter first jobs by degree, so the non-degree path usually starts at smaller companies. Next step: pick one small project you'd actually use, finish it, and put it somewhere you can link to.",
        disclosure: "This reflects my experience hiring at one company, not an industry-wide rule.",
      },
      { kind: "followup", body: "This helps a lot — does the project need to be original, or is following a tutorial okay to start?", postedAgo: "9h ago" },
      {
        kind: "answer",
        proId: "pro-chen",
        postedAgo: "6h ago",
        body: "Tutorials are a fine start — just add one feature the tutorial didn't cover. That one change is where the real learning (and the interview story) comes from.",
      },
      { kind: "peer", handle: "Sam", grade: "Senior", body: "I did exactly this last summer — built a study-timer app off a tutorial and added a stats page. It came up in every conversation at the career fair.", postedAgo: "4h ago" },
    ],
  },
  {
    id: "t-ds-vs-ai",
    boardId: "tech-engineering",
    type: "question",
    title: "What is the difference between data science and AI?",
    context: "I keep seeing both mentioned but I can't tell if they're the same thing. Which one is better to study in college?",
    handle: "Priya",
    grade: "Sophomore",
    postedAgo: "6h ago",
    state: "routed",
    routedScope: "AI & data careers",
    expectedWindow: "within 1 day",
    helpful: 9,
    followers: 3,
    responses: [],
  },
  {
    id: "t-ib-hours",
    boardId: "business-money",
    type: "question",
    title: "Are the hours in investment banking really that bad?",
    context: "Everyone online says 80-100 hour weeks. Is that true everywhere, and does it ever get better?",
    handle: "Maya",
    grade: "Junior",
    postedAgo: "2d ago",
    state: "answered",
    routedScope: "Finance & banking careers",
    expectedWindow: "within 2 days",
    helpful: 34,
    followers: 12,
    unreadAnswer: true,
    saved: true,
    responses: [
      {
        kind: "answer",
        proId: "pro-okafor",
        primary: true,
        postedAgo: "1d ago",
        body: "Honest answer: the first two years are genuinely intense — 70-80 hours is normal at most banks during busy periods, and deadlines don't care about your weekend. What people skip: it's cyclical, not constant; protected-Saturday policies exist at most large banks now; and the skills you build in those two years open doors that would otherwise take a decade. The real question is whether the work itself interests you — if it doesn't, the hours will break you; if it does, they're the price of a very fast start. Next step: try the Investment Banking simulation on Dreamari and see how the actual work feels before you commit to the idea of it.",
        disclosure: "Based on my experience as an analyst at one large bank.",
      },
    ],
  },
  {
    id: "t-nurse-shadow",
    boardId: "health-medicine",
    type: "question",
    title: "How do I shadow a nurse while still in high school?",
    handle: "Zoe",
    grade: "Sophomore",
    postedAgo: "3d ago",
    state: "resolved",
    routedScope: "Nursing & patient care careers",
    expectedWindow: "within 3 days",
    helpful: 18,
    followers: 5,
    responses: [
      {
        kind: "answer",
        proId: "pro-reyes",
        primary: true,
        postedAgo: "2d ago",
        body: "Most hospitals require you to be 16+ and go through a volunteer office rather than asking a nurse directly. Search '[your city] hospital volunteer program' — that's the front door. Community clinics and long-term care facilities say yes more often than big hospitals. One practical example: our facility takes two high-school volunteers every semester through a school counselor referral, so ask your counselor first — it's the fastest route.",
      },
    ],
  },
];

export const INSIGHTS: Insight[] = [
  {
    id: "i-day-in-life",
    boardId: "tech-engineering",
    type: "insight",
    proId: "pro-chen",
    title: "A day in the life of a software engineer at Amazon",
    body: "People assume software engineers code 8 hours straight. In reality, my day is roughly 3 hours of coding, 2 hours of meetings, 1 hour of code review, and the rest reading documentation or unblocking teammates. Communication skills matter more than most people expect.",
    postedAgo: "3d ago",
    helpful: 52,
    saved: true,
  },
  {
    id: "i-first-internship",
    boardId: "business-money",
    type: "insight",
    proId: "pro-okafor",
    title: "What I wish I knew before my first finance internship",
    body: "Nobody expects you to know the technical work on day one — they expect you to be reliable. Show up early, write everything down, and ask your questions in batches instead of one at a time. The intern who asks thoughtful questions at the right moment stands out more than the one who pretends to know everything.",
    postedAgo: "5d ago",
    helpful: 38,
  },
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o-amazon-fe",
    boardId: "tech-engineering",
    type: "opportunity",
    org: "Amazon",
    kind: "Internship",
    title: "Amazon Future Engineer — High School Internship",
    body: "Paid 8-week summer internship for high school students. Work alongside Amazon engineers on real products. No prior experience required.",
    eligibility: "High school students, 16+",
    location: "Seattle, WA",
    deadline: "Sep 30, 2026",
    sourceLabel: "amazonfutureengineer.com",
    verifiedDate: "Verified Aug 18, 2026",
    cta: "View details",
  },
  {
    id: "o-google-tx",
    boardId: "tech-engineering",
    type: "opportunity",
    org: "Google",
    kind: "Fellowship",
    title: "Google Tech Exchange — Student Developer Program",
    body: "Semester-long program covering data structures, algorithms, and systems design with Google engineers.",
    eligibility: "Sophomores & juniors",
    location: "Mountain View, CA",
    deadline: "Oct 1, 2026",
    sourceLabel: "buildyourfuture.withgoogle.com",
    verifiedDate: "Verified Aug 15, 2026",
    cta: "View details",
  },
  {
    id: "o-ey-discover",
    boardId: "event-ey",
    type: "opportunity",
    org: "Ernst & Young",
    kind: "Internship",
    title: "EY Discover Internship Program",
    body: "Hands-on exposure to consulting and professional services work for high school students, hosted at EY offices.",
    eligibility: "High school juniors & seniors",
    location: "Dallas, TX",
    deadline: "Nov 15, 2026",
    sourceLabel: "ey.com/careers/students",
    verifiedDate: "Verified Aug 20, 2026",
    cta: "View details",
  },
];

// ——— Event board (post-event continuation) ———

export type EventBoard = {
  id: string;
  name: string;
  host: string;
  date: string;
  location: string;
  // Lifecycle per handoff 9.4 (Draft/Scheduled/Live collapsed for this
  // prototype into the two states the UI actually distinguishes): a
  // student can only ever ASK about an event that already happened.
  lifecycle: "Upcoming" | "Active follow-up";
  closesOn?: string; // Active follow-up only: when the board goes read-only
  orgs: string[];
  topics: string[];
  entitled: boolean; // prototype: simulated AccessGrant — real entitlement is server-side (P0)
  code?: string; // prototype: demo redemption token — real tokens are single-use/server-side (handoff 9.2)
  // Upcoming events have neither yet — there's nothing to recap or share
  // until the event itself has happened.
  recap?: { proId: string; takeaways: string[]; postedAgo: string };
  resources?: { title: string; description: string; sourceLabel: string }[];
};

export const EVENTS: EventBoard[] = [
  {
    id: "event-ey",
    name: "EY Student Impact Day",
    host: "Ernst & Young",
    date: "August 14, 2026",
    location: "EY Dallas Office",
    lifecycle: "Active follow-up",
    closesOn: "September 5, 2026",
    orgs: ["Ernst & Young", "Dreamari"],
    topics: ["Consulting", "Finance", "Networking"],
    entitled: true, // already joined — demonstrates the straight-into-the-board state
    recap: {
      proId: "pro-martinez",
      takeaways: [
        "Your major does not determine your career path — several of us on the panel changed directions completely.",
        "Every person you spoke to is someone you can follow up with. Do it within 48 hours while the conversation is fresh.",
        "Curiosity is the skill that matters most early in your career. Keep asking the questions you didn't get to ask.",
      ],
      postedAgo: "10h ago",
    },
    resources: [
      { title: "Panel slides & career overviews", description: "Everything shown on stage, plus the career one-pagers each speaker recommended.", sourceLabel: "dreamari.co/resources" },
      { title: "Speaker-recommended reading list", description: "Six short reads the panel mentioned, organized by career area.", sourceLabel: "dreamari.co/resources" },
    ],
  },
  {
    id: "event-jpm",
    name: "JPMorgan Chase Markets Day",
    host: "JPMorgan Chase",
    date: "August 10, 2026",
    location: "JPMorgan Chase — New York, NY",
    lifecycle: "Active follow-up",
    closesOn: "September 1, 2026",
    orgs: ["JPMorgan Chase", "Dreamari"],
    topics: ["Investment Banking", "Trading", "Networking"],
    entitled: false, // not joined yet — demonstrates the enter-code state
    code: "JPM2026",
    recap: {
      proId: "pro-okafor",
      takeaways: [
        "Trading and investment banking look similar from outside but run on completely different clocks — trading reacts in seconds, banking builds over months.",
        "The analysts who stood out to us weren't the ones with finance degrees — they were the ones who could explain a hard idea simply.",
      ],
      postedAgo: "1d ago",
    },
    resources: [
      { title: "Desk-by-desk overview slides", description: "What each floor actually does, in plain language.", sourceLabel: "dreamari.co/resources" },
    ],
  },
  {
    id: "event-amazon",
    name: "Amazon Future Engineer Info Session",
    host: "Amazon",
    date: "September 10, 2026",
    location: "Virtual",
    lifecycle: "Upcoming", // hasn't happened yet — no discussion to join
    orgs: ["Amazon", "Dreamari"],
    topics: ["Software Engineering"],
    entitled: false,
  },
];

export const EVENT_THREADS: Thread[] = [
  {
    id: "et-takeaway",
    boardId: "event-ey",
    type: "question",
    title: "What was everyone's biggest takeaway from today?",
    context: "I was surprised by how approachable everyone was. I expected it to feel intimidating, but it didn't at all. What stood out to you?",
    handle: "Amir",
    grade: "Junior",
    postedAgo: "2h ago",
    state: "awaiting",
    routedScope: "Event professionals",
    expectedWindow: "within 2 days",
    helpful: 34,
    followers: 19,
    responses: [
      { kind: "peer", handle: "Noah", grade: "Sophomore", body: "The consultant who started as a music major completely changed how I think about picking a college path.", postedAgo: "1h ago" },
    ],
  },
  {
    id: "et-consulting-vs-ib",
    boardId: "event-ey",
    type: "question",
    title: "What's actually different between consulting and investment banking?",
    context: "One of the speakers mentioned consulting today. I've been going back and forth between the two — they sound similar from the outside but I can tell they're not.",
    handle: "Devon",
    grade: "Senior",
    postedAgo: "3h ago",
    state: "routed",
    routedScope: "Consulting & professional services",
    expectedWindow: "within 2 days",
    helpful: 17,
    followers: 4,
    responses: [],
  },
  {
    id: "et-stay-in-touch",
    boardId: "event-ey",
    type: "question",
    title: "How do you stay in touch with someone professionally without it feeling awkward?",
    context: "I connected with a few people at the event but I'm not sure what to say when I reach out. I don't want it to come across like I'm just asking for something.",
    handle: "Riley",
    grade: "Sophomore",
    postedAgo: "8h ago",
    state: "answered",
    routedScope: "Event professionals",
    expectedWindow: "within 2 days",
    helpful: 29,
    followers: 6,
    unreadAnswer: true,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "5h ago",
        body: "The trick is to give before you ask. Message something like: 'You mentioned X on the panel — I tried it / read about it, and here's what I found.' That's a conversation, not a request. Keep it short, don't apologize for reaching out, and don't attach your resume unless they ask. One real follow-up like that is worth more than ten generic thank-you notes. Ask a follow-up in this thread if you want help wording yours.",
        disclosure: "Personal approach — different professionals prefer different styles.",
      },
    ],
  },
  {
    id: "et-trading-hours",
    boardId: "event-jpm",
    type: "question",
    title: "Is trading as stressful as banking, or is that just a stereotype?",
    context: "You mentioned trading reacts in seconds. Does that mean the hours are just as long as investment banking, or is it a different kind of pressure?",
    handle: "Zoe",
    grade: "Sophomore",
    postedAgo: "6h ago",
    state: "answered",
    routedScope: "Event professionals",
    expectedWindow: "within 2 days",
    helpful: 14,
    followers: 5,
    responses: [
      {
        kind: "answer",
        proId: "pro-okafor",
        primary: true,
        postedAgo: "3h ago",
        body: "Different pressure, not necessarily longer hours. Trading days are bounded by market hours, so the stress is concentrated and intense rather than spread across a 90-hour week. Banking hours are longer but more self-paced within the deadline. Neither is easier — it's a question of whether you want pressure that ends at market close or pressure that follows you home.",
        disclosure: "Based on my own team's experience — desks vary.",
      },
    ],
  },
];

export const UPCOMING_SESSION = {
  title: "Office hour: Investment banking Q&A",
  pro: "Amara Okafor · JPMorgan Chase",
  when: "Thu Aug 28 · 4:00 PM CT",
  boardId: "business-money",
};

// Starter prompts for empty boards (handoff 7.2): career-based, not an empty feed
export const STARTER_PROMPTS = [
  "What does a normal Tuesday look like in this job?",
  "What class helped you most, and what turned out not to matter?",
  "What would you tell a Sophomore who thinks they want this career?",
];
