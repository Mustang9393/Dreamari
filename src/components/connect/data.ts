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
/** Peers (and insight repliers) can attach a reaction GIF -- deliberate,
 *  per the doc: the boards speak Gen Z, educational but fun. */
export type PeerPerspective = { kind: "peer"; handle: string; grade: string; body: string; postedAgo: string; likes?: number; image?: string; imageAlt?: string };

export type Thread = {
  id: string;
  boardId: string;
  type: "question";
  title: string;
  context?: string;
  handle: string; // first-name-only handle, never a full/last name
  grade: string; // Freshman / Sophomore / Junior / Senior
  postedAgo: string;
  /** Doc's question-card stats row: view count + poster's country. */
  views?: number;
  location?: string;
  state: QuestionState;
  routedScope: string;
  expectedWindow: string;
  helpful: number;
  followers: number;
  responses: (ProResponse | FollowUp | PeerPerspective)[];
  saved?: boolean;
  unreadAnswer?: boolean; // powers the For You "new answers" module
};

/** One comment under a Professional Insight: a student (handle + grade)
 *  or, occasionally, the pro replying back (proId). Short bodies only. */
export type InsightReply = {
  handle?: string;
  grade?: string;
  proId?: string;
  body: string;
  postedAgo: string;
  likes: number;
  image?: string;
  imageAlt?: string;
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
  /** The comment thread under the insight -- the card's count derives
   *  from this list, so the number is never out of step with the page. */
  replies: InsightReply[];
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
  posts: number;
  professionalsFrom: string[]; // real company names for the card's "Professionals from" row
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
  { id: "pro-cole", name: "Jasmine Cole", role: "Art Director", org: "Nike", scope: "Design & creative careers", verifiedBy: "Work email verified by Dreamari · Jun 2026" },
  { id: "pro-osei", name: "Nadia Osei", role: "Engineering Manager", org: "Google", scope: "Software engineering careers", verifiedBy: "Work email verified by Dreamari · Apr 2026" },
  { id: "pro-zhang", name: "Wei Zhang", role: "Cybersecurity Engineer", org: "Microsoft", scope: "Security engineering careers", verifiedBy: "Work email verified by Dreamari · Jul 2026" },
  { id: "pro-gallagher", name: "Tom Gallagher", role: "Markets Analyst", org: "Morgan Stanley", scope: "Finance & banking careers", verifiedBy: "Work email verified by Dreamari · Mar 2026" },
  { id: "pro-grant", name: "Sofia Grant", role: "Investment Banking Associate", org: "Goldman Sachs", scope: "Finance & banking careers", verifiedBy: "Work email verified by Dreamari · Jan 2026" },
  { id: "pro-whitfield", name: "Andre Whitfield", role: "Recruiter", org: "Deloitte", scope: "Hiring & early careers", verifiedBy: "Verified through Deloitte partner program · May 2026" },
  { id: "pro-tanaka", name: "Keiko Tanaka", role: "HR Manager", org: "Amazon", scope: "Hiring & early careers", verifiedBy: "Work email verified by Dreamari · Feb 2026" },
  { id: "pro-brooks", name: "Danielle Brooks", role: "Nurse Practitioner", org: "Mayo Clinic", scope: "Nursing & patient care careers", verifiedBy: "License + employer verified by Dreamari · Apr 2026" },
  { id: "pro-fontaine", name: "Leo Fontaine", role: "Motion Designer", org: "Spotify", scope: "Design & creative careers", verifiedBy: "Work email verified by Dreamari · Aug 2026" },
];

// The five communities, their names, order, counts, companies and topic
// chips are the Aug 29 doc's own Community-tab mockup, verbatim — all five
// joined ("Your Communities · 5 joined"). Ids are stable (threads/insights
// key on them), so the doc's renames land on the existing boards.
export const COMMUNITIES: Community[] = [
  {
    id: "teaching-education",
    name: "General Professional Development",
    world: "Teaching & Education",
    purpose: "Resumes, interviews, networking and confidence — the skills every career needs.",
    topics: ["Resumes", "Interviews", "Networking", "Confidence"],
    students: 428,
    activePros: 84,
    posts: 124,
    professionalsFrom: ["JPMorgan Chase", "Amazon", "EY", "Google", "Deloitte"],
    responseWindow: "Most questions answered within 2 days",
    joined: true,
    unreadAnswers: 0,
  },
  {
    id: "business-money",
    name: "Finance Careers",
    world: "Business & Money",
    purpose: "Banking, investing, business and economics careers — ask people who do the work.",
    topics: ["Banking", "Investing", "Business", "Economics"],
    students: 312,
    activePros: 61,
    posts: 98,
    professionalsFrom: ["JPMorgan Chase", "Goldman Sachs", "EY", "Morgan Stanley", "Blackstone"],
    responseWindow: "Most questions answered within 2 days",
    joined: true,
    unreadAnswers: 2,
  },
  {
    id: "tech-engineering",
    name: "Technology Careers",
    world: "Tech & Engineering",
    purpose: "Software engineering, cybersecurity, AI and data careers, answered by working engineers.",
    topics: ["Software Engineering", "Cybersecurity", "AI", "Data"],
    students: 389,
    activePros: 77,
    posts: 156,
    professionalsFrom: ["Google", "Amazon", "Microsoft", "Meta", "Apple"],
    responseWindow: "Most questions answered within 1 day",
    joined: true,
    unreadAnswers: 1,
  },
  {
    id: "health-medicine",
    name: "Healthcare Careers",
    world: "Health & Medicine",
    purpose: "Medicine, nursing, public health and biotech careers — real paths, real trade-offs.",
    topics: ["Medicine", "Nursing", "Public Health", "Biotech"],
    students: 267,
    activePros: 52,
    posts: 73,
    professionalsFrom: ["CVS Health", "Johnson & Johnson", "Pfizer", "Mayo Clinic"],
    responseWindow: "Most questions answered within 3 days",
    joined: true,
    unreadAnswers: 0,
  },
  {
    id: "arts-media",
    name: "Creative Careers",
    world: "Arts, Media & Sport",
    purpose: "Marketing, design, media and content careers, without the gatekeeping.",
    topics: ["Marketing", "Design", "Media", "Content Creation"],
    students: 198,
    activePros: 39,
    posts: 61,
    professionalsFrom: ["Disney", "Nike", "Spotify", "Netflix", "Adobe"],
    responseWindow: "Most questions answered within 3 days",
    joined: false,
    unreadAnswers: 0,
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
    views: 3412,
    location: "United States",
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
      { kind: "peer", handle: "Sam", grade: "Senior", body: "I did exactly this last summer — built a study-timer app off a tutorial and added a stats page. It came up in every conversation at the career fair.", postedAgo: "4h ago", likes: 9 },
      { kind: "peer", handle: "Priya", grade: "Sophomore", body: "me finally understanding what tech companies actually want after reading this thread 😭😭 my life is changed forever", postedAgo: "2h ago", likes: 13, image: "/images/connect/reactions/tim-eric-mind-blown.gif", imageAlt: "Mind blown reaction GIF" },
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
    views: 1120,
    location: "United Kingdom",
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
    views: 5891,
    location: "United States",
    helpful: 34,
    followers: 12,
    unreadAnswer: true,
    saved: true,
    responses: [
      { kind: "peer", handle: "Diego", grade: "Sophomore", body: "taking notes for my future self", postedAgo: "1d ago", likes: 6, image: "/images/connect/reactions/taking-notes.gif", imageAlt: "SpongeBob fish taking notes GIF" },
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
    views: 2304,
    location: "United States",
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
  // ——— board seeding: every community has real, short activity ———
  {
    id: "t-gpd-resume",
    boardId: "teaching-education",
    type: "question",
    title: "How do I write a resume with no work experience?",
    handle: "Lena",
    grade: "Junior",
    postedAgo: "4h ago",
    views: 2841,
    location: "United States",
    state: "answered",
    routedScope: "Consulting & professional services",
    expectedWindow: "within 2 days",
    helpful: 41,
    followers: 9,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "2h ago",
        body: "You have more than you think. School projects, clubs, sports, a job helping a family business — each one is a bullet if you say what you did and what changed. 'Organized a bake sale that raised $400' beats 'hard worker' every time.",
      },
    ],
  },
  {
    id: "t-gpd-career-fair",
    boardId: "teaching-education",
    type: "question",
    title: "What should I actually say when I walk up to a company's table at a career fair?",
    handle: "Marcus",
    grade: "Freshman",
    postedAgo: "9h ago",
    views: 512,
    location: "United States",
    state: "routed",
    routedScope: "Consulting & professional services",
    expectedWindow: "within 2 days",
    helpful: 12,
    followers: 3,
    responses: [],
  },
  {
    id: "t-gpd-interview-nerves",
    boardId: "teaching-education",
    type: "question",
    title: "How do I stop being so nervous in interviews?",
    handle: "Ava",
    grade: "Sophomore",
    postedAgo: "1d ago",
    views: 1937,
    location: "United Kingdom",
    state: "answered",
    routedScope: "Consulting & professional services",
    expectedWindow: "within 2 days",
    helpful: 28,
    followers: 7,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "18h ago",
        body: "Nerves usually mean you care, not that you're unprepared. Practice your first sixty seconds out loud until it's boring to you — the opening is where nerves live, and once it's automatic the rest is a conversation.",
        disclosure: "Personal approach — different interviewers look for different things.",
      },
      { kind: "peer", handle: "Jo", grade: "Senior", body: "Doing two practice interviews with my school counselor helped me more than any video I watched.", postedAgo: "12h ago", likes: 7 },
    ],
  },
  {
    id: "t-fin-accounting",
    boardId: "business-money",
    type: "question",
    title: "Is accounting actually boring, or is that just a stereotype?",
    handle: "Diego",
    grade: "Sophomore",
    postedAgo: "7h ago",
    views: 864,
    location: "United States",
    state: "routed",
    routedScope: "Finance & banking careers",
    expectedWindow: "within 2 days",
    helpful: 15,
    followers: 4,
    responses: [],
  },
  {
    id: "t-health-np",
    boardId: "health-medicine",
    type: "question",
    title: "What's the difference between a nurse and a nurse practitioner?",
    handle: "Sana",
    grade: "Junior",
    postedAgo: "1d ago",
    views: 1408,
    location: "United States",
    state: "answered",
    routedScope: "Nursing & patient care careers",
    expectedWindow: "within 3 days",
    helpful: 22,
    followers: 6,
    responses: [
      {
        kind: "answer",
        proId: "pro-reyes",
        primary: true,
        postedAgo: "16h ago",
        body: "A nurse practitioner is a registered nurse who went back for a graduate degree. NPs can diagnose and prescribe in most states; RNs carry out the care plan and are with the patient far more of the day. Same ladder, different rungs — most NPs I know worked as RNs first.",
      },
    ],
  },
  {
    id: "t-creative-art-school",
    boardId: "arts-media",
    type: "question",
    title: "Do I need to go to art school to become a designer?",
    handle: "Ruby",
    grade: "Junior",
    postedAgo: "6h ago",
    views: 1102,
    location: "United Kingdom",
    state: "answered",
    routedScope: "Design & creative careers",
    expectedWindow: "within 3 days",
    helpful: 19,
    followers: 5,
    responses: [
      {
        kind: "answer",
        proId: "pro-cole",
        primary: true,
        postedAgo: "3h ago",
        body: "No — a portfolio beats a diploma in this field. Art school buys you time, critique and connections, which are real, but every hiring conversation I've been in starts and ends with the work. Ten finished pieces you're proud of is the actual requirement.",
        disclosure: "My experience hiring at one company — agencies and studios vary.",
      },
    ],
  },
  {
    id: "t-creative-content",
    boardId: "arts-media",
    type: "question",
    title: "How do people actually get paid for content creation?",
    handle: "Theo",
    grade: "Sophomore",
    postedAgo: "3h ago",
    views: 347,
    location: "United States",
    state: "routed",
    routedScope: "Design & creative careers",
    expectedWindow: "within 3 days",
    helpful: 8,
    followers: 2,
    responses: [],
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
    replies: [
      { handle: "Priya", grade: "Sophomore", body: "Wait, only 3 hours of coding? That honestly makes it sound more doable.", postedAgo: "2d ago", likes: 14 },
      { handle: "Ethan", grade: "Junior", body: "What happens in a code review? Is someone just grading your work?", postedAgo: "2d ago", likes: 6 },
      { proId: "pro-chen", body: "Good question — a teammate reads your change and suggests improvements before it ships. It's collaboration, not a grade.", postedAgo: "2d ago", likes: 21 },
      { handle: "Sam", grade: "Senior", body: "The communication part is real. My internship was half writing things down clearly.", postedAgo: "1d ago", likes: 9 },
      { handle: "Zoe", grade: "Sophomore", body: "Saving this for when my parents ask what software engineers actually do.", postedAgo: "1d ago", likes: 11 },
      { handle: "Maya", grade: "Junior", body: "3 hours of meetings a day 💀 the way school never mentions this part", postedAgo: "22h ago", likes: 16, image: "/images/connect/reactions/this-is-fine.gif", imageAlt: "This is fine dog meme GIF" },
      { handle: "Marcus", grade: "Freshman", body: "Do you get to pick what you work on?", postedAgo: "20h ago", likes: 3 },
    ],
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
    replies: [
      { handle: "Maya", grade: "Junior", body: "Asking questions in batches is such a simple fix. Stealing this.", postedAgo: "4d ago", likes: 12 },
      { handle: "Devon", grade: "Senior", body: "Did anything go wrong in your first week?", postedAgo: "3d ago", likes: 5 },
      { proId: "pro-okafor", body: "Plenty — I mislabeled a whole folder of files on day two. Owning it fast mattered more than the mistake.", postedAgo: "3d ago", likes: 18 },
    ],
  },
  {
    id: "i-tell-me-about-yourself",
    boardId: "teaching-education",
    type: "insight",
    proId: "pro-martinez",
    title: "The 30-second answer to 'tell me about yourself'",
    body: "One line on who you are, one on what you've done that you're proud of, one on why you're here. Practice it out loud twice. Interviewers aren't grading your biography — they're checking whether you can organize a thought.",
    postedAgo: "2d ago",
    helpful: 44,
    replies: [
      { handle: "Lena", grade: "Junior", body: "Tried this out loud and it fixed my rambling problem immediately.", postedAgo: "1d ago", likes: 16 },
      { handle: "Amir", grade: "Junior", body: "What if I don't have anything I'm proud of yet?", postedAgo: "1d ago", likes: 4 },
      { proId: "pro-martinez", body: "You do — it just doesn't feel impressive to you because you were there. Pick the thing you stuck with the longest.", postedAgo: "22h ago", likes: 19 },
      { handle: "Jo", grade: "Senior", body: "The 'checking whether you can organize a thought' line is so true.", postedAgo: "10h ago", likes: 7 },
    ],
  },
  {
    id: "i-nursing-first-year",
    boardId: "health-medicine",
    type: "insight",
    proId: "pro-reyes",
    title: "Three things nobody tells you about your first year as a nurse",
    body: "You will ask hundreds of questions and that's the job, not a weakness. Twelve-hour shifts mean three-day weeks. And the nurses who last are the ones who say something the moment a patient looks different.",
    postedAgo: "4d ago",
    helpful: 31,
    replies: [
      { handle: "Sana", grade: "Junior", body: "Three-day weeks sounds amazing until you remember each day is twelve hours.", postedAgo: "3d ago", likes: 13, image: "/images/connect/reactions/shocked-pikachu.gif", imageAlt: "Shocked Pikachu meme GIF" },
      { handle: "Zoe", grade: "Sophomore", body: "Does asking lots of questions ever annoy the senior nurses?", postedAgo: "3d ago", likes: 4 },
      { proId: "pro-reyes", body: "The opposite — the new nurse who asks is the one we trust. Silence is what worries us.", postedAgo: "2d ago", likes: 22 },
      { handle: "Ruby", grade: "Junior", body: "The 'say something the moment a patient looks different' part matches the Dreamari nurse game exactly.", postedAgo: "2d ago", likes: 8 },
      { handle: "Theo", grade: "Sophomore", body: "Respect. This job sounds intense.", postedAgo: "1d ago", likes: 5 },
    ],
  },
  {
    id: "i-what-brands-pay-for",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-cole",
    title: "What a brand actually pays a designer for",
    body: "Not prettiness — decisions. Why this color, why this type, why this layout for this audience. The day you can defend your choices out loud is the day you stop being a student and start being a designer.",
    postedAgo: "1d ago",
    helpful: 27,
    replies: [
      { handle: "Ruby", grade: "Junior", body: "'Decisions, not prettiness' just reframed my whole portfolio.", postedAgo: "20h ago", likes: 10, image: "/images/connect/reactions/math-lady.gif", imageAlt: "Calculating math meme GIF" },
      { handle: "Theo", grade: "Sophomore", body: "How do you practice defending choices without a client?", postedAgo: "16h ago", likes: 6 },
    ],
  },
  {
    id: "i-first-portfolio",
    boardId: "tech-engineering",
    type: "insight",
    proId: "pro-osei",
    title: "What I look for in a first portfolio project",
    body: "Finished beats fancy. A small app that works, with a README that explains your decisions, tells me more than an ambitious half-build. Bonus points if you added one feature nobody asked for because you wanted it.",
    postedAgo: "1d ago",
    helpful: 29,
    replies: [
      { handle: "Ethan", grade: "Junior", body: "Does a school project count or does it have to be personal?", postedAgo: "20h ago", likes: 5 },
      { handle: "Zoe", grade: "Sophomore", body: "me immediately opening my laptop to finish that half-built app", postedAgo: "14h ago", likes: 7, image: "/images/connect/reactions/kermit-typing.gif", imageAlt: "Kermit typing GIF" },
      { proId: "pro-osei", body: "School projects count if you can explain your own contribution. 'We built' is fine; follow it with 'my part was…'", postedAgo: "16h ago", likes: 12 },
    ],
  },
  {
    id: "i-debugging-lesson",
    boardId: "tech-engineering",
    type: "insight",
    proId: "pro-zhang",
    title: "The bug that taught me more than any class",
    body: "My first production bug took three days to find and was one wrong character. What I actually learned: read the error message slowly, reproduce it before touching anything, and write down what you ruled out. That checklist is half of engineering.",
    postedAgo: "6d ago",
    helpful: 41,
    replies: [
      { handle: "Priya", grade: "Sophomore", body: "Writing down what you ruled out is such a good idea for math homework too honestly.", postedAgo: "5d ago", likes: 8 },
      { handle: "Sam", grade: "Senior", body: "Three days for one character. I feel better about my week now.", postedAgo: "5d ago", likes: 15 },
    ],
  },
  {
    id: "i-analyst-morning",
    boardId: "business-money",
    type: "insight",
    proId: "pro-gallagher",
    title: "What an analyst actually does before 10 AM",
    body: "Check overnight market moves, update the numbers that changed, and flag anything weird before your team's morning call. It's less glamorous than the movies and more about being the person who noticed first.",
    postedAgo: "2d ago",
    helpful: 33,
    replies: [
      { handle: "Maya", grade: "Junior", body: "Being the person who noticed first — that's basically the nurse game's lesson too.", postedAgo: "1d ago", likes: 9 },
      { handle: "Diego", grade: "Sophomore", body: "What time does that mean you wake up?", postedAgo: "1d ago", likes: 4 },
      { proId: "pro-gallagher", body: "Early. But honestly the wake-up matters less than the habit: same checklist, every morning, no exceptions.", postedAgo: "22h ago", likes: 11 },
    ],
  },
  {
    id: "i-first-week-bank",
    boardId: "business-money",
    type: "insight",
    proId: "pro-grant",
    title: "Three things that surprised me in my first week at a bank",
    body: "Nobody expected me to know finance — they expected me to be careful. Half the job is writing clearly. And the people who moved up fastest were the ones other people wanted on their team.",
    postedAgo: "1w ago",
    helpful: 27,
    replies: [
      { handle: "Lena", grade: "Junior", body: "The writing part keeps coming up in every single insight on this app.", postedAgo: "6d ago", likes: 13 },
    ],
  },
  {
    id: "i-networking-nobody",
    boardId: "teaching-education",
    type: "insight",
    proId: "pro-whitfield",
    title: "Networking when you don't know anybody",
    body: "Networking isn't collecting contacts, it's being genuinely curious one person at a time. Ask someone how they got their job and what surprised them about it. People remember the student who asked a real question.",
    postedAgo: "3d ago",
    helpful: 36,
    replies: [
      { handle: "Marcus", grade: "Freshman", body: "This makes it feel way less scary than 'go network'.", postedAgo: "2d ago", likes: 10 },
      { handle: "Ava", grade: "Sophomore", body: "Tried the 'what surprised you' question at the panel last week and it worked.", postedAgo: "2d ago", likes: 7 },
      { handle: "Marcus", grade: "Freshman", body: "everyone at the next career fair when I pull up with actual questions", postedAgo: "1d ago", likes: 9, image: "/images/connect/reactions/minions-excited.gif", imageAlt: "Excited minions GIF" },
    ],
  },
  {
    id: "i-dont-know-answer",
    boardId: "teaching-education",
    type: "insight",
    proId: "pro-tanaka",
    title: "What to say when you don't know the answer in an interview",
    body: "Say 'I don't know, but here's how I'd find out' — and then actually walk through it. Interviewers aren't testing your memory, they're testing what you do at the edge of what you know.",
    postedAgo: "5d ago",
    helpful: 48,
    replies: [
      { handle: "Jo", grade: "Senior", body: "Used this in a scholarship interview. It works.", postedAgo: "4d ago", likes: 14, image: "/images/connect/reactions/office-celebrate.gif", imageAlt: "The Office celebration GIF" },
      { handle: "Lena", grade: "Junior", body: "Saving this whole board at this point.", postedAgo: "4d ago", likes: 6 },
    ],
  },
  {
    id: "i-shift-life",
    boardId: "health-medicine",
    type: "insight",
    proId: "pro-brooks",
    title: "Day shift vs night shift, honestly",
    body: "Days are busier and you learn faster; nights are calmer and you get more time with each patient. Most new nurses do some of both in year one. Neither is the easy option — they're different kinds of hard.",
    postedAgo: "2d ago",
    helpful: 24,
    replies: [
      { handle: "Sana", grade: "Junior", body: "Which one did you like more as a new grad?", postedAgo: "1d ago", likes: 3 },
      { proId: "pro-brooks", body: "Nights, at first — more room to think. Then days, once thinking got faster.", postedAgo: "20h ago", likes: 9 },
    ],
  },
  {
    id: "i-nurse-questions",
    boardId: "health-medicine",
    type: "insight",
    proId: "pro-reyes",
    title: "The question I ask every student who shadows me",
    body: "Could you do this at 3 AM, tired, for someone who isn't grateful? If the answer is still yes, nursing will give you more back than almost any job I know. If it's no, that's a useful thing to learn at seventeen.",
    postedAgo: "6d ago",
    helpful: 39,
    replies: [
      { handle: "Zoe", grade: "Sophomore", body: "This is the realest thing anyone has said on here.", postedAgo: "5d ago", likes: 17, image: "/images/connect/reactions/dicaprio-cheers.gif", imageAlt: "Leonardo DiCaprio toast GIF" },
    ],
  },
  {
    id: "i-sketchbook-portfolio",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-fontaine",
    title: "Your sketchbook is already a portfolio",
    body: "Students wait for permission to have 'real work'. The messy process pages — the versions you rejected and why — are often more impressive to me than the polished final. Show your thinking, not just your taste.",
    postedAgo: "3d ago",
    helpful: 22,
    replies: [
      { handle: "Ruby", grade: "Junior", body: "Posting my process pages instead of hiding them from now on.", postedAgo: "2d ago", likes: 8 },
      { handle: "Theo", grade: "Sophomore", body: "Does this apply to video edits too? I have so many drafts.", postedAgo: "2d ago", likes: 4 },
      { proId: "pro-fontaine", body: "Especially video. A before/after cut with one sentence on what you changed is a portfolio piece.", postedAgo: "1d ago", likes: 10 },
    ],
  },
  {
    id: "i-art-director-day",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-cole",
    title: "What an art director actually does all day",
    body: "Less drawing than you'd think, more deciding. I spend my day reviewing work, giving direction that keeps ten people rowing the same way, and defending good ideas in rooms where they could die. The craft got me here; the communication keeps me here.",
    postedAgo: "1w ago",
    helpful: 31,
    replies: [
      { handle: "Theo", grade: "Sophomore", body: "'Rooms where good ideas could die' is a wild sentence. Noted.", postedAgo: "6d ago", likes: 12 },
    ],
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
  /** Doc's event-card stats row (Students / Pros / Posts). */
  students?: number;
  pros?: number;
  postCount?: number;
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
    students: 142,
    pros: 28,
    postCount: 48,
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
  // The three ACTUAL fall events (from Slack, Sep 1): Brooklyn/JPMorgan
  // Chase Oct 23, Dallas/AT&T Oct 29, New Jersey/EY Nov 4. All upcoming --
  // their boards open after each event happens, same lifecycle rule as
  // always. No invented stats: an event that has not happened has none.
  {
    id: "event-jpmc-brooklyn",
    name: "JPMorgan Chase Student Event",
    host: "JPMorgan Chase",
    date: "October 23, 2026",
    location: "Brooklyn, New York",
    lifecycle: "Upcoming",
    orgs: ["JPMorgan Chase", "Dreamari"],
    topics: ["Finance", "Networking"],
    entitled: false,
  },
  {
    id: "event-att-dallas",
    name: "AT&T Student Event",
    host: "AT&T",
    date: "October 29, 2026",
    location: "Dallas, Texas",
    lifecycle: "Upcoming",
    orgs: ["AT&T", "Dreamari"],
    topics: ["Technology", "Networking"],
    entitled: false,
  },
  {
    id: "event-ey-newjersey",
    name: "Ernst & Young (EY) Student Event",
    host: "Ernst & Young",
    date: "November 4, 2026",
    location: "New Jersey",
    lifecycle: "Upcoming",
    orgs: ["Ernst & Young", "Dreamari"],
    topics: ["Consulting", "Networking"],
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
    views: 1908,
    location: "United States",
    helpful: 34,
    followers: 19,
    responses: [
      { kind: "peer", handle: "Noah", grade: "Sophomore", body: "The consultant who started as a music major completely changed how I think about picking a college path.", postedAgo: "1h ago", likes: 11 },
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
    views: 942,
    location: "United States",
    helpful: 17,
    followers: 4,
    responses: [],
  },
  {
    // Replaces a "how do I stay in touch with someone professionally" thread.
    // On a board where minors and adults share a space, modelling one-to-one
    // follow-up with a professional is the wrong thing to teach, however
    // well-meant the answer was. The useful part of that question -- what to do
    // with what you heard -- survives here, in public.
    id: "et-what-to-do-next",
    boardId: "event-ey",
    type: "question",
    title: "What should I actually do with what I learned today?",
    context: "I took a page of notes at the panel and I do not want it to just sit in my bag until I forget it.",
    handle: "Riley",
    grade: "Sophomore",
    postedAgo: "8h ago",
    state: "answered",
    routedScope: "Event professionals",
    expectedWindow: "within 2 days",
    views: 1655,
    location: "United States",
    helpful: 29,
    followers: 6,
    unreadAnswer: true,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "5h ago",
        body: "Pick one thing and act on it this month. If a panelist named a skill, find the free version of it and spend two hours there. If they named a class, check whether your school offers it next term. Then post what you found back here so the next person gets it too. Notes you act on once beat notes you reread five times.",
        disclosure: "Personal approach — different professionals prefer different styles.",
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
