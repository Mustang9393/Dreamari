// Connect, mock data for the frontend prototype, shaped by the implementation
// handoff (Dreamari_Connect_Claude_Implementation_Handoff.docx, v1.0) and the
// Replit prototype's content evidence. Realistic where behavior needs it,
// clearly bounded: no backend exists yet, so routing/SLA/entitlement are
// simulated states, not real authorization (the handoff's P0 items are
// server-side work and are documented as assumptions in ConnectExperience).
//
// Identity rules, per direct request: students post under a handle + class
// year (Freshman/Sophomore/Junior/Senior), Twitter-shaped, like the
// marketing site's own Connect chapter (src/components/marketing/chapters/
// Connect.tsx), never a full/last name. Professionals display full name +
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
  /** Demo display count for the card (direct feedback: show 17+); the
   *  thread may hold fewer real comments. */
  comments?: number;
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
  /** Connect 2.0 per-post learning signals ("8.4K Views · 642 Likes · 187
   *  Saves"). Optional: derived from `helpful` where the seed doesn't say. */
  views?: number;
  saves?: number;
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
  // Connect 2.0 profile (DREAMARI CONNECT 2.pdf): field, short story, and the
  // three public numbers the doc names. `world` is the app's world taxonomy,
  // for relevance-first ranking against the student's own Top 3.
  world: string;
  field: string;
  story: string;
  followers: number;
  studentsReached: number;
  totalLikes: number;
  questionsAnswered: number;
  /** About (Connect 2.0): where they studied, how they got here, what they can help with */
  education?: string;
  journey?: string;
  topics?: string[];
  /** Private activity signal: days since they last answered or posted. */
  activeDaysAgo: number;
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
  /** People-free banner art for the community card (generated, on-accent). */
  photo: string;
  joined: boolean;
  unreadAnswers: number;
  recommendedBecause?: string; // explicit-interest explanation (Top 3), never internal rankings
};

export const PROS: Pro[] = [
  { id: "pro-chen", name: "David Chen", role: "Software Engineer", org: "Amazon", scope: "Software engineering careers", verifiedBy: "Work email verified by Dreamari · Feb 2026", world: "Tech & Engineering", field: "Software Engineering", story: "I taught myself to code in a library after school because we didn't have a computer at home. Nine years later I ship features millions of people use, and the thing I still lean on most is asking better questions.", followers: 1286, studentsReached: 9418, totalLikes: 4921, questionsAnswered: 63, activeDaysAgo: 1, education: "B.S. Computer Science, University of Washington", journey: "Self-taught in a public library, then a state school degree, an internship that turned into an offer, and nine years shipping consumer features.", topics: ["Software engineering", "Internships", "Learning to code", "College"] },
  { id: "pro-martinez", name: "Elena Martinez", role: "Brand Strategist", org: "EY", scope: "Consulting & professional services", verifiedBy: "Verified through EY partner program · Aug 2026", world: "Business & Money", field: "Consulting", story: "I switched from marketing to strategy consulting at 27 with no MBA. The pitch that got me in was a two-page teardown of a brand I loved, not a résumé.", followers: 742, studentsReached: 5104, totalLikes: 2380, questionsAnswered: 41, activeDaysAgo: 3, education: "B.A. Communications, Arizona State University", journey: "Six years in brand marketing, then a two-page teardown of a brand she loved got her into strategy consulting at 27, no MBA.", topics: ["Consulting", "Marketing", "Career switches", "Portfolios"] },
  { id: "pro-okafor", name: "Amara Okafor", role: "Investment Banking Analyst", org: "JPMorgan Chase", scope: "Finance & banking careers", verifiedBy: "Work email verified by Dreamari · May 2026", world: "Business & Money", field: "Investment Banking", story: "First in my family to work in finance. I got here from a state school by cold-emailing 140 analysts; 11 wrote back and two of them changed my life. I try to be one of those two for someone every week.", followers: 1934, studentsReached: 12660, totalLikes: 6812, questionsAnswered: 87, activeDaysAgo: 0, education: "B.S. Economics, University of Michigan", journey: "State school, 140 cold emails, two mentors who wrote back, an analyst program, and now deals in technology and media.", topics: ["Investment banking", "Finance careers", "Internships", "College"] },
  { id: "pro-reyes", name: "Marcus Reyes", role: "Registered Nurse", org: "CVS Health", scope: "Nursing & patient care careers", verifiedBy: "License + employer verified by Dreamari · Mar 2026", world: "Health & Medicine", field: "Nursing", story: "I was a lifeguard who liked the first-aid part more than the pool. Nursing school at a community college, then an ER, now a MinuteClinic. Every day is a hundred small decisions that matter.", followers: 968, studentsReached: 7215, totalLikes: 3540, questionsAnswered: 58, activeDaysAgo: 2, education: "A.D.N. Austin Community College; B.S.N. Texas State University", journey: "Lifeguard, community college nursing program, three years in an emergency room, now a MinuteClinic.", topics: ["Nursing", "Nursing school", "Emergency medicine", "Community college"] },
  { id: "pro-cole", name: "Jasmine Cole", role: "Art Director", org: "Nike", scope: "Design & creative careers", verifiedBy: "Work email verified by Dreamari · Jun 2026", world: "Arts, Media & Sport", field: "Design", story: "My portfolio at 17 was Instagram edits for my friends' sneaker resale accounts. That instinct for what makes people stop scrolling is the same one I use on campaigns now.", followers: 2210, studentsReached: 14380, totalLikes: 8104, questionsAnswered: 52, activeDaysAgo: 1, education: "B.F.A. Graphic Design, Savannah College of Art and Design", journey: "Instagram edits for friends at 17, a design degree, junior designer at an agency, now art director on global campaigns.", topics: ["Design", "Portfolios", "Art school", "Creative careers"] },
  { id: "pro-osei", name: "Nadia Osei", role: "Engineering Manager", org: "Google", scope: "Software engineering careers", verifiedBy: "Work email verified by Dreamari · Apr 2026", world: "Tech & Engineering", field: "Engineering Management", story: "I spent six years as an engineer before managing anyone. The job became less about the code I write and more about the people who can write it because I cleared the way.", followers: 1522, studentsReached: 8830, totalLikes: 4260, questionsAnswered: 39, activeDaysAgo: 5, education: "B.S. Electrical Engineering, Georgia Tech", journey: "Six years as an engineer before managing anyone; now leads a team of engineers and clears the way for them.", topics: ["Engineering management", "Software engineering", "Leadership", "Internships"] },
  { id: "pro-zhang", name: "Wei Zhang", role: "Cybersecurity Engineer", org: "Microsoft", scope: "Security engineering careers", verifiedBy: "Work email verified by Dreamari · Jul 2026", world: "Tech & Engineering", field: "Cybersecurity", story: "Capture-the-flag competitions in high school taught me more than any class. Security is a career for people who like to understand how things break so they can keep them whole.", followers: 1107, studentsReached: 6940, totalLikes: 3312, questionsAnswered: 46, activeDaysAgo: 4, education: "B.S. Computer Science, University of Illinois", journey: "Capture-the-flag competitions in high school, a security internship, and a decade keeping systems whole.", topics: ["Cybersecurity", "Competitions", "Learning to code", "Internships"] },
  { id: "pro-gallagher", name: "Tom Gallagher", role: "Markets Analyst", org: "Morgan Stanley", scope: "Finance & banking careers", verifiedBy: "Work email verified by Dreamari · Mar 2026", world: "Business & Money", field: "Markets", story: "I read the business section at breakfast as a kid because my dad did. Twenty years on I still start the day the same way; now people pay for what I think about it.", followers: 655, studentsReached: 4120, totalLikes: 1980, questionsAnswered: 33, activeDaysAgo: 9, education: "B.A. Economics, Boston College", journey: "Read the business pages at breakfast as a kid; twenty years later people pay for what he thinks about them.", topics: ["Markets", "Finance careers", "Economics", "Reading the news"] },
  { id: "pro-grant", name: "Sofia Grant", role: "Investment Banking Associate", org: "Goldman Sachs", scope: "Finance & banking careers", verifiedBy: "Work email verified by Dreamari · Jan 2026", world: "Business & Money", field: "Investment Banking", story: "Nobody at my high school had heard of investment banking. A single alumni panel changed my trajectory, so I answer every question here the way I wish someone had answered mine.", followers: 1410, studentsReached: 9975, totalLikes: 5230, questionsAnswered: 71, activeDaysAgo: 2, education: "B.S. Finance, University of Florida; M.B.A., Wharton", journey: "One alumni panel in high school changed her path; analyst, then associate, now she answers the questions she once had.", topics: ["Investment banking", "Business school", "Internships", "College"] },
  { id: "pro-whitfield", name: "Andre Whitfield", role: "Recruiter", org: "Deloitte", scope: "Hiring & early careers", verifiedBy: "Verified through Deloitte partner program · May 2026", world: "Teaching & Education", field: "Recruiting", story: "I have read more than ten thousand résumés. Most of what students worry about, I never notice; most of what I notice, nobody tells them. Ask me.", followers: 3020, studentsReached: 21540, totalLikes: 9870, questionsAnswered: 118, activeDaysAgo: 0, education: "B.A. Psychology, Howard University", journey: "Campus recruiter, then corporate recruiting; more than ten thousand resumes read, thousands of interviews run.", topics: ["Resumes", "Interviews", "Hiring", "Early careers"] },
  { id: "pro-tanaka", name: "Keiko Tanaka", role: "HR Manager", org: "Amazon", scope: "Hiring & early careers", verifiedBy: "Work email verified by Dreamari · Feb 2026", world: "Teaching & Education", field: "Human Resources", story: "I hire for teams of 400 people. The interview is not a test of who you are; it is a conversation about whether we can do good work together. I can teach you how to have that conversation.", followers: 1188, studentsReached: 8410, totalLikes: 3925, questionsAnswered: 64, activeDaysAgo: 6, education: "B.A. Sociology, UCLA; M.S. Human Resources, Cornell", journey: "Started in staffing, moved into HR, now hires for teams of 400 and coaches candidates on the conversation.", topics: ["Interviews", "Human resources", "Hiring", "Workplace skills"] },
  { id: "pro-brooks", name: "Danielle Brooks", role: "Nurse Practitioner", org: "Mayo Clinic", scope: "Nursing & patient care careers", verifiedBy: "License + employer verified by Dreamari · Apr 2026", world: "Health & Medicine", field: "Nursing", story: "RN at 22, NP at 30, still learning at 41. Healthcare has a ladder most students never see; I like showing them the rungs.", followers: 1340, studentsReached: 9120, totalLikes: 4488, questionsAnswered: 55, activeDaysAgo: 3, education: "B.S.N. University of Minnesota; M.S.N. Nurse Practitioner", journey: "Registered nurse at 22, nurse practitioner at 30, still learning at 41; she likes showing students the rungs.", topics: ["Nursing", "Nurse practitioner path", "Healthcare careers", "Graduate school"] },
  { id: "pro-fontaine", name: "Leo Fontaine", role: "Motion Designer", org: "Spotify", scope: "Design & creative careers", verifiedBy: "Work email verified by Dreamari · Aug 2026", world: "Arts, Media & Sport", field: "Motion Design", story: "I made lyric videos for local bands for free for three years. One of them got a label deal, kept me on, and that reel is what Spotify saw.", followers: 1876, studentsReached: 11230, totalLikes: 7360, questionsAnswered: 29, activeDaysAgo: 12, education: "Self-taught; certificate in Motion Design, School of Motion", journey: "Free lyric videos for local bands for three years; one label deal later, the reel got him to Spotify.", topics: ["Motion design", "Portfolios", "Self-teaching", "Creative careers"] },
  { id: "pro-haddad", name: "Omar Haddad", role: "Clinical Research Nurse", org: "Pfizer", scope: "Nursing & patient care careers", verifiedBy: "License + employer verified by Dreamari · May 2026", world: "Health & Medicine", field: "Clinical Research", story: "I wanted medicine but not the operating room. Research nursing let me stay close to patients and closer to the science; the trial I coordinate now might change how we treat asthma.", followers: 612, studentsReached: 3980, totalLikes: 1745, questionsAnswered: 24, activeDaysAgo: 7, education: "B.S.N. Rutgers University", journey: "Wanted medicine without the operating room; research nursing kept him close to patients and the science.", topics: ["Clinical research", "Nursing", "Healthcare careers", "Science"] },
  { id: "pro-vega", name: "Camille Vega", role: "Content Producer", org: "Netflix", scope: "Media & content careers", verifiedBy: "Work email verified by Dreamari · Jul 2026", world: "Arts, Media & Sport", field: "Media Production", story: "I produced my school's morning announcements and took it far too seriously. That seriousness about small things is the entire job.", followers: 2490, studentsReached: 15870, totalLikes: 9012, questionsAnswered: 44, activeDaysAgo: 1, education: "B.A. Film and Media, University of Texas at Austin", journey: "Ran the school morning announcements far too seriously; production assistant, producer, now content at Netflix.", topics: ["Media production", "Content creation", "Internships", "Creative careers"] },
];

// The five communities, their names, order, counts, companies and topic
// chips are the Aug 29 doc's own Community-tab mockup, verbatim, all five
// joined ("Your Communities · 5 joined"). Ids are stable (threads/insights
// key on them), so the doc's renames land on the existing boards.
export const COMMUNITIES: Community[] = [
  {
    id: "teaching-education",
    name: "General Professional Development",
    world: "Teaching & Education",
    purpose: "Grow your skills, build confidence, and connect with mentors who help you level up.",
    photo: "/images/connect/covers/gpd-bulb-violet.webp",
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
    purpose: "Explore finance paths and learn from industry professionals.",
    photo: "/images/connect/covers/finance.webp",
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
    purpose: "Dive into tech roles and stay ahead of what's next.",
    photo: "/images/connect/covers/technology.webp",
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
    purpose: "Make an impact in healthcare and improve lives.",
    photo: "/images/connect/covers/healthcare.webp",
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
    purpose: "Turn ideas into impact across design, media, and storytelling.",
    photo: "/images/connect/covers/creative.webp",
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
    helpful: 260,
    followers: 8,
    comments: 30,
    unreadAnswer: true,
    responses: [
      {
        kind: "answer",
        proId: "pro-chen",
        primary: true,
        postedAgo: "14h ago",
        body: "Short answer: no, but you need proof you can build. My team has engineers from bootcamps, community college transfers, and self-taught paths. What we actually screen for is (1) can you write working code, (2) can you explain your thinking, (3) have you finished something real, even a small project counts. A degree is one way to show that; a portfolio of 2-3 finished projects is another. Trade-off to know: some larger companies still filter first jobs by degree, so the non-degree path usually starts at smaller companies. Next step: pick one small project you'd actually use, finish it, and put it somewhere you can link to.",
        disclosure: "This reflects my experience hiring at one company, not an industry-wide rule.",
      },
      { kind: "followup", body: "This helps a lot, does the project need to be original, or is following a tutorial okay to start?", postedAgo: "9h ago" },
      {
        kind: "answer",
        proId: "pro-chen",
        postedAgo: "6h ago",
        body: "Tutorials are a fine start, just add one feature the tutorial didn't cover. That one change is where the real learning (and the interview story) comes from.",
      },
      { kind: "peer", handle: "Sam", grade: "Senior", body: "I did exactly this last summer, built a study-timer app off a tutorial and added a stats page. It came up in every conversation at the career fair.", postedAgo: "4h ago", likes: 9 },
      { kind: "peer", handle: "Priya", grade: "Sophomore", body: "me finally understanding what tech companies actually want after reading this thread 😭😭 my life is changed forever", postedAgo: "2h ago", likes: 13, image: "/images/connect/reactions/tim-eric-mind-blown.gif", imageAlt: "Mind blown reaction GIF" },
      {
        kind: "answer",
        proId: "pro-osei",
        postedAgo: "3h ago",
        body: "Hiring-manager view: I read the portfolio before the resume, every single time. One finished project with a clear README beats a long list of skills.",
      },
      {
        kind: "answer",
        proId: "pro-zhang",
        postedAgo: "2h ago",
        body: "Security side of tech here, certifications can genuinely substitute for a degree. Security+ plus a home lab got two people onto my team.",
      },
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
    state: "answered",
    routedScope: "AI & data careers",
    expectedWindow: "within 1 day",
    views: 1120,
    location: "United Kingdom",
    helpful: 126,
    followers: 3,
    comments: 43,
    responses: [
      {
        kind: "answer",
        proId: "pro-chen",
        primary: true,
        postedAgo: "4h ago",
        body: "Data science asks what happened and why; AI builds systems that act on it. They share the same math foundation, so you don't have to choose in high school, take statistics either way.",
      },
      {
        kind: "answer",
        proId: "pro-osei",
        postedAgo: "3h ago",
        body: "Most of the AI engineers on my team started as data scientists. The path between the two is shorter than the job titles suggest.",
      },
      {
        kind: "answer",
        proId: "pro-zhang",
        postedAgo: "2h ago",
        body: "Whichever you pick, learn Python properly. It's the shared language of both.",
      },
    ],
  },
  {
    id: "t-ib-hours",
    boardId: "business-money",
    type: "question",
    title: "Are the hours in investment banking really that bad?",
    context: "Everyone online says 80-100 hour weeks. Is that true everywhere, and does it ever get better?",
    handle: "Jordan",
    grade: "Junior",
    postedAgo: "2d ago",
    state: "answered",
    routedScope: "Finance & banking careers",
    expectedWindow: "within 2 days",
    views: 5891,
    location: "United States",
    helpful: 223,
    followers: 12,
    comments: 24,
    unreadAnswer: true,
    saved: true,
    responses: [
      { kind: "peer", handle: "Diego", grade: "Sophomore", body: "taking notes for my future self", postedAgo: "1d ago", likes: 6, image: "/images/connect/reactions/taking-notes.gif", imageAlt: "SpongeBob fish taking notes GIF" },
      {
        kind: "answer",
        proId: "pro-okafor",
        primary: true,
        postedAgo: "1d ago",
        body: "Honest answer: the first two years are genuinely intense, 70-80 hours is normal at most banks during busy periods, and deadlines don't care about your weekend. What people skip: it's cyclical, not constant; protected-Saturday policies exist at most large banks now; and the skills you build in those two years open doors that would otherwise take a decade. The real question is whether the work itself interests you, if it doesn't, the hours will break you; if it does, they're the price of a very fast start. Next step: try the Investment Banking simulation on Dreamari and see how the actual work feels before you commit to the idea of it.",
        disclosure: "Based on my experience as an analyst at one large bank.",
      },
      { kind: "peer", handle: "Sam", grade: "Senior", body: "Following because I have been using the two words interchangeably in essays 💀", postedAgo: "4h ago", likes: 7 },
      { kind: "peer", handle: "Lena", grade: "Junior", body: "me choosing my major based on vibes and this thread", postedAgo: "2h ago", likes: 10, image: "/images/connect/reactions/imagination.gif", imageAlt: "SpongeBob imagination GIF" },
      { kind: "peer", handle: "Noah", grade: "Sophomore", body: "the way this is everyone's first question about banking", postedAgo: "1d ago", likes: 8 },
      { kind: "peer", handle: "Ava", grade: "Sophomore", body: "reading this from my 8am class thinking about 80-hour weeks", postedAgo: "20h ago", likes: 14, image: "/images/connect/reactions/leo-laughing.gif", imageAlt: "Leonardo DiCaprio laughing GIF" },
      {
        kind: "answer",
        proId: "pro-gallagher",
        postedAgo: "22h ago",
        body: "Markets side is a different model, the hours are bounded by the trading day, so it's intense but it ends. Worth knowing both rhythms exist before you decide.",
      },
      {
        kind: "answer",
        proId: "pro-grant",
        postedAgo: "18h ago",
        body: "Associate view: it genuinely improves as you get senior, you trade all-nighters for responsibility. Year two is easier than year one.",
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
    helpful: 89,
    followers: 5,
    comments: 37,
    responses: [
      {
        kind: "answer",
        proId: "pro-reyes",
        primary: true,
        postedAgo: "2d ago",
        body: "Most hospitals require you to be 16+ and go through a volunteer office rather than asking a nurse directly. Search '[your city] hospital volunteer program', that's the front door. Community clinics and long-term care facilities say yes more often than big hospitals. One practical example: our facility takes two high-school volunteers every semester through a school counselor referral, so ask your counselor first, it's the fastest route.",
      },
      { kind: "peer", handle: "Sana", grade: "Junior", body: "My counselor literally set mine up with one email. Ask them first, for real.", postedAgo: "2d ago", likes: 9 },
      { kind: "peer", handle: "Theo", grade: "Sophomore", body: "volunteer office route = the move", postedAgo: "1d ago", likes: 6, image: "/images/connect/reactions/drake-approve.gif", imageAlt: "Drake approving GIF" },
      {
        kind: "answer",
        proId: "pro-brooks",
        postedAgo: "2d ago",
        body: "NP addition: ask to shadow in a clinic, not just a hospital, clinics say yes more often and you see much more of the patient conversation.",
      },
      {
        kind: "answer",
        proId: "pro-haddad",
        postedAgo: "1d ago",
        body: "Research sites take students too, our unit runs a shadow day every semester. Ask about 'observer programs'; that's the magic phrase.",
      },
    ],
  },
  // , , ,  board seeding: every community has real, short activity , , , 
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
    helpful: 337,
    followers: 9,
    comments: 18,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "2h ago",
        body: "You have more than you think. School projects, clubs, sports, a job helping a family business, each one is a bullet if you say what you did and what changed. 'Organized a bake sale that raised $400' beats 'hard worker' every time.",
      },
      { kind: "peer", handle: "Diego", grade: "Sophomore", body: "the bake sale example just fixed my entire resume", postedAgo: "1h ago", likes: 11, image: "/images/connect/reactions/high-five.gif", imageAlt: "The Office high five GIF" },
      { kind: "peer", handle: "Ruby", grade: "Junior", body: "quantify everything. noted.", postedAgo: "1h ago", likes: 5 },
      {
        kind: "answer",
        proId: "pro-whitfield",
        postedAgo: "2h ago",
        body: "Recruiter here: I spend under thirty seconds on a first pass. One page, clean font, results first, that's the whole game at your stage.",
      },
      {
        kind: "answer",
        proId: "pro-tanaka",
        postedAgo: "1h ago",
        body: "We hire interns with zero work experience every year. The resume just has to show you finish things.",
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
    state: "answered",
    routedScope: "Consulting & professional services",
    expectedWindow: "within 2 days",
    helpful: 283,
    followers: 3,
    comments: 31,
    responses: [
      {
        kind: "answer",
        proId: "pro-whitfield",
        primary: true,
        postedAgo: "7h ago",
        body: "Say your name, your year, and one real question about them, 'what does your first year actually look like?' works every time. We remember the askers, not the resumes.",
      },
      {
        kind: "answer",
        proId: "pro-martinez",
        postedAgo: "6h ago",
        body: "Skip 'do you have internships' as the opener. Ask about the person first, the internship conversation happens on its own.",
      },
      {
        kind: "answer",
        proId: "pro-tanaka",
        postedAgo: "5h ago",
        body: "And take the follow-up seriously: one short thank-you note the same week puts you ahead of most adults.",
      },
    ],
  },
  {
    id: "t-gpd-interview-nerves",
    boardId: "teaching-education",
    type: "question",
    title: "How do I stop being so nervous in interviews?",
    handle: "Jordan",
    grade: "Junior",
    postedAgo: "1d ago",
    views: 1937,
    location: "United Kingdom",
    state: "answered",
    routedScope: "Consulting & professional services",
    expectedWindow: "within 2 days",
    helpful: 149,
    followers: 7,
    comments: 44,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "18h ago",
        body: "Nerves usually mean you care, not that you're unprepared. Practice your first sixty seconds out loud until it's boring to you, the opening is where nerves live, and once it's automatic the rest is a conversation.",
        disclosure: "Personal approach, different interviewers look for different things.",
      },
      { kind: "peer", handle: "Jo", grade: "Senior", body: "Doing two practice interviews with my school counselor helped me more than any video I watched.", postedAgo: "12h ago", likes: 7 },
      { kind: "peer", handle: "Marcus", grade: "Freshman", body: "practice it until it's boring… then walk in like", postedAgo: "8h ago", likes: 12, image: "/images/connect/reactions/mic-drop.gif", imageAlt: "Obama mic drop GIF" },
      {
        kind: "answer",
        proId: "pro-whitfield",
        postedAgo: "16h ago",
        body: "Recruiters expect nerves, they read as caring. What we actually notice is whether you recover, not whether you shake.",
      },
      {
        kind: "answer",
        proId: "pro-tanaka",
        postedAgo: "14h ago",
        body: "Ask for the interview format in advance. Knowing what's coming removes half the fear before you walk in.",
      },
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
    state: "answered",
    routedScope: "Finance & banking careers",
    expectedWindow: "within 2 days",
    helpful: 246,
    followers: 4,
    comments: 25,
    responses: [
      {
        kind: "answer",
        proId: "pro-okafor",
        primary: true,
        postedAgo: "5h ago",
        body: "Stereotype. Accounting is the language every deal I work on is written in, the accountants in the room are often the ones who spot what everyone else missed.",
      },
      {
        kind: "answer",
        proId: "pro-gallagher",
        postedAgo: "4h ago",
        body: "Quiet is not the same as boring. It's also one of the most recession-proof starts in all of finance.",
      },
      {
        kind: "answer",
        proId: "pro-grant",
        postedAgo: "3h ago",
        body: "Half my deal team started in accounting. It's a launchpad, not a ceiling.",
      },
    ],
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
    helpful: 112,
    followers: 6,
    comments: 38,
    responses: [
      {
        kind: "answer",
        proId: "pro-reyes",
        primary: true,
        postedAgo: "16h ago",
        body: "A nurse practitioner is a registered nurse who went back for a graduate degree. NPs can diagnose and prescribe in most states; RNs carry out the care plan and are with the patient far more of the day. Same ladder, different rungs, most NPs I know worked as RNs first.",
      },
      { kind: "peer", handle: "Ruby", grade: "Junior", body: "so an NP is basically nurse+. got it.", postedAgo: "12h ago", likes: 7 },
      { kind: "peer", handle: "Ethan", grade: "Junior", body: "'same ladder, different rungs' is a great way to put it", postedAgo: "10h ago", likes: 5 },
      {
        kind: "answer",
        proId: "pro-brooks",
        postedAgo: "14h ago",
        body: "I'm the NP in question, Marcus has it exactly right. I worked bedside for six years first, and I still think that made me a better NP than the degree did.",
      },
      {
        kind: "answer",
        proId: "pro-haddad",
        postedAgo: "12h ago",
        body: "There are also research nurses like me in the same buildings, same license, very different day. Worth comparing all the branches before you pick.",
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
    helpful: 209,
    followers: 5,
    comments: 19,
    responses: [
      {
        kind: "answer",
        proId: "pro-cole",
        primary: true,
        postedAgo: "3h ago",
        body: "No, a portfolio beats a diploma in this field. Art school buys you time, critique and connections, which are real, but every hiring conversation I've been in starts and ends with the work. Ten finished pieces you're proud of is the actual requirement.",
        disclosure: "My experience hiring at one company, agencies and studios vary.",
      },
      { kind: "peer", handle: "Zoe", grade: "Sophomore", body: "ten finished pieces. okay. starting tonight", postedAgo: "2h ago", likes: 8, image: "/images/connect/reactions/kermit-typing.gif", imageAlt: "Kermit typing GIF" },
      { kind: "peer", handle: "Jo", grade: "Senior", body: "portfolio > diploma is such a freeing thing to hear", postedAgo: "1h ago", likes: 6 },
      {
        kind: "answer",
        proId: "pro-fontaine",
        postedAgo: "4h ago",
        body: "Self-taught motion designer here, no art school. Online courses plus two years of daily practice reels did it.",
      },
      {
        kind: "answer",
        proId: "pro-vega",
        postedAgo: "3h ago",
        body: "Producing side: I care that you can take feedback and hit a deadline. School teaches that, but so does running a school club's channel.",
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
    state: "answered",
    routedScope: "Design & creative careers",
    expectedWindow: "within 3 days",
    helpful: 75,
    followers: 2,
    comments: 32,
    responses: [
      {
        kind: "answer",
        proId: "pro-vega",
        primary: true,
        postedAgo: "2h ago",
        body: "Brand deals, ad revenue, and commissions, roughly in that order for the working creators I hire. The consistent ones treat it like a job: posting schedule, invoices, contracts.",
      },
      {
        kind: "answer",
        proId: "pro-cole",
        postedAgo: "1h ago",
        body: "Brands pay for audiences they can't reach themselves. Build a specific one, however small, and you're already interesting.",
      },
      {
        kind: "answer",
        proId: "pro-fontaine",
        postedAgo: "1h ago",
        body: "Also: the editors behind big creators get paid too. Being the person who makes someone else's content great is a real path in.",
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
    helpful: 153,
    saved: true,
    replies: [
      { handle: "Priya", grade: "Sophomore", body: "Wait, only 3 hours of coding? That honestly makes it sound more doable.", postedAgo: "2d ago", likes: 14 },
      { handle: "Ethan", grade: "Junior", body: "What happens in a code review? Is someone just grading your work?", postedAgo: "2d ago", likes: 6 },
      { proId: "pro-chen", body: "Good question, a teammate reads your change and suggests improvements before it ships. It's collaboration, not a grade.", postedAgo: "2d ago", likes: 21 },
      { handle: "Sam", grade: "Senior", body: "The communication part is real. My internship was half writing things down clearly.", postedAgo: "1d ago", likes: 9 },
      { handle: "Zoe", grade: "Sophomore", body: "Saving this for when my parents ask what software engineers actually do.", postedAgo: "1d ago", likes: 11 },
      { handle: "Maya", grade: "Junior", body: "3 hours of meetings a day 💀 the way school never mentions this part", postedAgo: "22h ago", likes: 16, image: "/images/connect/reactions/this-is-fine.gif", imageAlt: "This is fine dog meme GIF" },
      { handle: "Marcus", grade: "Freshman", body: "Do you get to pick what you work on?", postedAgo: "20h ago", likes: 3 },
      { handle: "Lena", grade: "Junior", body: "communication skills being the plot twist of every single career on this app", postedAgo: "18h ago", likes: 9 },
    ],
  },
  {
    id: "i-first-internship",
    boardId: "business-money",
    type: "insight",
    proId: "pro-okafor",
    title: "What I wish I knew before my first finance internship",
    body: "Nobody expects you to know the technical work on day one, they expect you to be reliable. Show up early, write everything down, and ask your questions in batches instead of one at a time. The intern who asks thoughtful questions at the right moment stands out more than the one who pretends to know everything.",
    postedAgo: "5d ago",
    helpful: 250,
    replies: [
      { handle: "Maya", grade: "Junior", body: "Asking questions in batches is such a simple fix. Stealing this.", postedAgo: "4d ago", likes: 12 },
      { handle: "Devon", grade: "Senior", body: "Did anything go wrong in your first week?", postedAgo: "3d ago", likes: 5 },
      { proId: "pro-okafor", body: "Plenty, I mislabeled a whole folder of files on day two. Owning it fast mattered more than the mistake.", postedAgo: "3d ago", likes: 18 },
      { handle: "Ethan", grade: "Junior", body: "writing everything down saved me in group projects too. it scales.", postedAgo: "2d ago", likes: 6 },
      { handle: "Maya", grade: "Junior", body: "me visualizing myself being the reliable one", postedAgo: "2d ago", likes: 8, image: "/images/connect/reactions/imagination.gif", imageAlt: "SpongeBob imagination GIF" },
    ],
  },
  {
    id: "i-tell-me-about-yourself",
    boardId: "teaching-education",
    type: "insight",
    proId: "pro-martinez",
    title: "The 30-second answer to 'tell me about yourself'",
    body: "One line on who you are, one on what you've done that you're proud of, one on why you're here. Practice it out loud twice. Interviewers aren't grading your biography, they're checking whether you can organize a thought.",
    postedAgo: "2d ago",
    helpful: 116,
    replies: [
      { handle: "Lena", grade: "Junior", body: "Tried this out loud and it fixed my rambling problem immediately.", postedAgo: "1d ago", likes: 16 },
      { handle: "Amir", grade: "Junior", body: "What if I don't have anything I'm proud of yet?", postedAgo: "1d ago", likes: 4 },
      { proId: "pro-martinez", body: "You do, it just doesn't feel impressive to you because you were there. Pick the thing you stuck with the longest.", postedAgo: "22h ago", likes: 19 },
      { handle: "Jo", grade: "Senior", body: "The 'checking whether you can organize a thought' line is so true.", postedAgo: "10h ago", likes: 7 },
      { handle: "Riley", grade: "Sophomore", body: "sixty seconds. one organized thought. got it.", postedAgo: "8h ago", likes: 5 },
      { handle: "Devon", grade: "Senior", body: "one line who you are, one line what you did, one line why you're here…", postedAgo: "6h ago", likes: 12, image: "/images/connect/reactions/mic-drop.gif", imageAlt: "Obama mic drop GIF" },
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
    helpful: 213,
    replies: [
      { handle: "Sana", grade: "Junior", body: "Three-day weeks sounds amazing until you remember each day is twelve hours.", postedAgo: "3d ago", likes: 13, image: "/images/connect/reactions/shocked-pikachu.gif", imageAlt: "Shocked Pikachu meme GIF" },
      { handle: "Zoe", grade: "Sophomore", body: "Does asking lots of questions ever annoy the senior nurses?", postedAgo: "3d ago", likes: 4 },
      { proId: "pro-reyes", body: "The opposite, the new nurse who asks is the one we trust. Silence is what worries us.", postedAgo: "2d ago", likes: 22 },
      { handle: "Ruby", grade: "Junior", body: "The 'say something the moment a patient looks different' part matches the Dreamari nurse game exactly.", postedAgo: "2d ago", likes: 8 },
      { handle: "Theo", grade: "Sophomore", body: "Respect. This job sounds intense.", postedAgo: "1d ago", likes: 5 },
      { handle: "Amir", grade: "Junior", body: "the three-day week math is wild when each day is twelve hours", postedAgo: "1d ago", likes: 6 },
      { handle: "Ethan", grade: "Junior", body: "me hearing 'three-day work week' right before the 'each day is twelve hours' part", postedAgo: "1d ago", likes: 14, image: "/images/connect/reactions/tim-eric-mind-blown.gif", imageAlt: "Mind blown reaction GIF" },
    ],
  },
  {
    id: "i-what-brands-pay-for",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-cole",
    title: "What a brand actually pays a designer for",
    body: "Not prettiness, decisions. Why this color, why this type, why this layout for this audience. The day you can defend your choices out loud is the day you stop being a student and start being a designer.",
    postedAgo: "1d ago",
    helpful: 79,
    replies: [
      { handle: "Ruby", grade: "Junior", body: "'Decisions, not prettiness' just reframed my whole portfolio.", postedAgo: "20h ago", likes: 10, image: "/images/connect/reactions/math-lady.gif", imageAlt: "Calculating math meme GIF" },
      { handle: "Theo", grade: "Sophomore", body: "How do you practice defending choices without a client?", postedAgo: "16h ago", likes: 6 },
      { handle: "Sana", grade: "Junior", body: "defending my choices out loud, starting with my group project tomorrow", postedAgo: "12h ago", likes: 7, image: "/images/connect/reactions/high-five.gif", imageAlt: "The Office high five GIF" },
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
    helpful: 176,
    replies: [
      { handle: "Ethan", grade: "Junior", body: "Does a school project count or does it have to be personal?", postedAgo: "20h ago", likes: 5 },
      { handle: "Zoe", grade: "Sophomore", body: "me immediately opening my laptop to finish that half-built app", postedAgo: "14h ago", likes: 7, image: "/images/connect/reactions/kermit-typing.gif", imageAlt: "Kermit typing GIF" },
      { proId: "pro-osei", body: "School projects count if you can explain your own contribution. 'We built' is fine; follow it with 'my part was…'", postedAgo: "16h ago", likes: 12 },
      { handle: "Priya", grade: "Sophomore", body: "adding a feature nobody asked for is genuinely my specialty", postedAgo: "10h ago", likes: 9, image: "/images/connect/reactions/leo-laughing.gif", imageAlt: "Leonardo DiCaprio laughing GIF" },
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
    helpful: 273,
    replies: [
      { handle: "Priya", grade: "Sophomore", body: "Writing down what you ruled out is such a good idea for math homework too honestly.", postedAgo: "5d ago", likes: 8 },
      { handle: "Sam", grade: "Senior", body: "Three days for one character. I feel better about my week now.", postedAgo: "5d ago", likes: 15 },
      { handle: "Noah", grade: "Sophomore", body: "me on day two of the same bug", postedAgo: "4d ago", likes: 11, image: "/images/connect/reactions/this-is-fine.gif", imageAlt: "This is fine dog meme GIF" },
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
    helpful: 139,
    replies: [
      { handle: "Maya", grade: "Junior", body: "Being the person who noticed first, that's basically the nurse game's lesson too.", postedAgo: "1d ago", likes: 9 },
      { handle: "Diego", grade: "Sophomore", body: "What time does that mean you wake up?", postedAgo: "1d ago", likes: 4 },
      { proId: "pro-gallagher", body: "Early. But honestly the wake-up matters less than the habit: same checklist, every morning, no exceptions.", postedAgo: "22h ago", likes: 11 },
      { handle: "Riley", grade: "Sophomore", body: "'the person who noticed first' being the whole job is lowkey every job", postedAgo: "20h ago", likes: 6 },
    ],
  },
  {
    id: "i-first-week-bank",
    boardId: "business-money",
    type: "insight",
    proId: "pro-grant",
    title: "Three things that surprised me in my first week at a bank",
    body: "Nobody expected me to know finance, they expected me to be careful. Half the job is writing clearly. And the people who moved up fastest were the ones other people wanted on their team.",
    postedAgo: "1w ago",
    helpful: 236,
    replies: [
      { handle: "Lena", grade: "Junior", body: "The writing part keeps coming up in every single insight on this app.", postedAgo: "6d ago", likes: 13 },
      { handle: "Zoe", grade: "Sophomore", body: "reliable > brilliant. noted.", postedAgo: "5d ago", likes: 7 },
      { handle: "Theo", grade: "Sophomore", body: "me preparing to be careful and reliable", postedAgo: "5d ago", likes: 5, image: "/images/connect/reactions/taking-notes.gif", imageAlt: "SpongeBob fish taking notes GIF" },
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
    helpful: 102,
    replies: [
      { handle: "Marcus", grade: "Freshman", body: "This makes it feel way less scary than 'go network'.", postedAgo: "2d ago", likes: 10 },
      { handle: "Ava", grade: "Sophomore", body: "Tried the 'what surprised you' question at the panel last week and it worked.", postedAgo: "2d ago", likes: 7 },
      { handle: "Marcus", grade: "Freshman", body: "everyone at the next career fair when I pull up with actual questions", postedAgo: "1d ago", likes: 9, image: "/images/connect/reactions/minions-excited.gif", imageAlt: "Excited minions GIF" },
      { handle: "Jo", grade: "Senior", body: "asking real questions >> collecting contacts", postedAgo: "1d ago", likes: 8 },
    ],
  },
  {
    id: "i-dont-know-answer",
    boardId: "teaching-education",
    type: "insight",
    proId: "pro-tanaka",
    title: "What to say when you don't know the answer in an interview",
    body: "Say 'I don't know, but here's how I'd find out', and then actually walk through it. Interviewers aren't testing your memory, they're testing what you do at the edge of what you know.",
    postedAgo: "5d ago",
    helpful: 199,
    replies: [
      { handle: "Jo", grade: "Senior", body: "Used this in a scholarship interview. It works.", postedAgo: "4d ago", likes: 14, image: "/images/connect/reactions/office-celebrate.gif", imageAlt: "The Office celebration GIF" },
      { handle: "Lena", grade: "Junior", body: "Saving this whole board at this point.", postedAgo: "4d ago", likes: 6 },
      { handle: "Devon", grade: "Senior", body: "'here is how I would find out' is the cheat code", postedAgo: "6h ago", likes: 10, image: "/images/connect/reactions/drake-approve.gif", imageAlt: "Drake approving GIF" },
    ],
  },
  {
    id: "i-shift-life",
    boardId: "health-medicine",
    type: "insight",
    proId: "pro-brooks",
    title: "Day shift vs night shift, honestly",
    body: "Days are busier and you learn faster; nights are calmer and you get more time with each patient. Most new nurses do some of both in year one. Neither is the easy option, they're different kinds of hard.",
    postedAgo: "2d ago",
    helpful: 296,
    replies: [
      { handle: "Sana", grade: "Junior", body: "Which one did you like more as a new grad?", postedAgo: "1d ago", likes: 3 },
      { proId: "pro-brooks", body: "Nights, at first, more room to think. Then days, once thinking got faster.", postedAgo: "20h ago", likes: 9 },
      { handle: "Lena", grade: "Junior", body: "'different kinds of hard' is such an honest answer", postedAgo: "16h ago", likes: 5 },
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
    helpful: 162,
    replies: [
      { handle: "Zoe", grade: "Sophomore", body: "This is the realest thing anyone has said on here.", postedAgo: "5d ago", likes: 17, image: "/images/connect/reactions/dicaprio-cheers.gif", imageAlt: "Leonardo DiCaprio toast GIF" },
      { handle: "Noah", grade: "Sophomore", body: "seventeen and rethinking everything right now", postedAgo: "4d ago", likes: 8 },
    ],
  },
  {
    id: "i-sketchbook-portfolio",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-fontaine",
    title: "Your sketchbook is already a portfolio",
    body: "Students wait for permission to have 'real work'. The messy process pages, the versions you rejected and why, are often more impressive to me than the polished final. Show your thinking, not just your taste.",
    postedAgo: "3d ago",
    helpful: 259,
    replies: [
      { handle: "Ruby", grade: "Junior", body: "Posting my process pages instead of hiding them from now on.", postedAgo: "2d ago", likes: 8 },
      { handle: "Theo", grade: "Sophomore", body: "Does this apply to video edits too? I have so many drafts.", postedAgo: "2d ago", likes: 4 },
      { proId: "pro-fontaine", body: "Especially video. A before/after cut with one sentence on what you changed is a portfolio piece.", postedAgo: "1d ago", likes: 10 },
      { handle: "Ava", grade: "Sophomore", body: "me realizing my messy sketchbook was the portfolio all along", postedAgo: "1d ago", likes: 9, image: "/images/connect/reactions/imagination.gif", imageAlt: "SpongeBob imagination GIF" },
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
    helpful: 125,
    replies: [
      { handle: "Theo", grade: "Sophomore", body: "'Rooms where good ideas could die' is a wild sentence. Noted.", postedAgo: "6d ago", likes: 12 },
      { handle: "Ruby", grade: "Junior", body: "'the craft got me here; the communication keeps me here', writing that down forever", postedAgo: "5d ago", likes: 10 },
      { handle: "Devon", grade: "Senior", body: "rooms where good ideas could die. respect for the honesty.", postedAgo: "5d ago", likes: 6 },
    ],
  },
  {
    id: "i-chen-2",
    boardId: "tech-engineering",
    type: "insight",
    proId: "pro-chen",
    title: "What I look for when I read a student's first project",
    body: "A README I can follow, a bug you found and fixed, and one thing you would do differently. That beats a polished app copied from a tutorial every time.",
    postedAgo: "6d ago",
    helpful: 107,
    views: 2367,
    saves: 32,
    replies: [{ handle: "Priya", grade: "Junior", body: "okay this actually helps", postedAgo: "2d ago", likes: 6 }, { handle: "Ethan", grade: "Sophomore", body: "is this true everywhere?", postedAgo: "1d ago", likes: 4 }, { proId: "pro-chen", body: "It varies by place, but the idea holds.", postedAgo: "1d ago", likes: 10 }],
  },
  {
    id: "i-martinez-2",
    boardId: "business-money",
    type: "insight",
    proId: "pro-martinez",
    title: "The two-page teardown that got me into consulting",
    body: "I picked a brand I loved, wrote what worked, what did not, and what I would change. No jargon, no slides. That document did more than my résumé.",
    postedAgo: "1w ago",
    helpful: 144,
    views: 3144,
    saves: 43,
    replies: [{ handle: "Maya", grade: "Freshman", body: "wait this is so useful", postedAgo: "2d ago", likes: 7 }, { handle: "Sam", grade: "Senior", body: "can you do a post on the first year?", postedAgo: "1d ago", likes: 5 }, { proId: "pro-martinez", body: "Start small this week. Ask me here if you get stuck.", postedAgo: "1d ago", likes: 11 }],
  },
  {
    id: "i-okafor-2",
    boardId: "business-money",
    type: "insight",
    proId: "pro-okafor",
    title: "My top five rules for breaking into investment banking",
    body: "Start early, talk to real analysts, learn Excel like a language, read one deal story a week, and never pretend to know something in an interview.",
    postedAgo: "2w ago",
    helpful: 181,
    views: 3921,
    saves: 54,
    replies: [{ handle: "Diego", grade: "Senior", body: "needed this today", postedAgo: "2d ago", likes: 8 }, { handle: "Noah", grade: "Freshman", body: "my counselor never said this", postedAgo: "1d ago", likes: 6 }, { proId: "pro-okafor", body: "Good question. Short answer: yes, and I will write that one next.", postedAgo: "1d ago", likes: 12 }],
  },
  {
    id: "i-osei-2",
    boardId: "tech-engineering",
    type: "insight",
    proId: "pro-osei",
    title: "How I decided to become a manager",
    body: "I noticed I was happiest when a teammate shipped something they were stuck on. Six years of coding first mattered; managing is not a shortcut around the craft.",
    postedAgo: "5d ago",
    helpful: 218,
    views: 4698,
    saves: 65,
    replies: [{ handle: "Ethan", grade: "Sophomore", body: "saving this", postedAgo: "2d ago", likes: 9 }, { handle: "Zoe", grade: "Junior", body: "how did you start?", postedAgo: "1d ago", likes: 7 }, { proId: "pro-osei", body: "It varies by place, but the idea holds.", postedAgo: "1d ago", likes: 13 }],
  },
  {
    id: "i-zhang-2",
    boardId: "tech-engineering",
    type: "insight",
    proId: "pro-zhang",
    title: "Three free ways to try cybersecurity this month",
    body: "Play a beginner capture-the-flag, read one breach report and explain it to a friend, and turn on every security setting on your own phone. That is how I started.",
    postedAgo: "3d ago",
    helpful: 255,
    views: 5475,
    saves: 76,
    replies: [{ handle: "Theo", grade: "Junior", body: "okay this actually helps", postedAgo: "2d ago", likes: 10 }, { handle: "Sam", grade: "Sophomore", body: "is this true everywhere?", postedAgo: "1d ago", likes: 8 }, { proId: "pro-zhang", body: "Start small this week. Ask me here if you get stuck.", postedAgo: "1d ago", likes: 14 }],
  },
  {
    id: "i-gallagher-2",
    boardId: "business-money",
    type: "insight",
    proId: "pro-gallagher",
    title: "How to read the business pages in ten minutes",
    body: "Headline, first paragraph, one number that surprised you. Do that daily for a month and you will understand markets better than most adults.",
    postedAgo: "4d ago",
    helpful: 292,
    views: 6252,
    saves: 88,
    replies: [{ handle: "Diego", grade: "Freshman", body: "wait this is so useful", postedAgo: "2d ago", likes: 11 }, { handle: "Ava", grade: "Senior", body: "can you do a post on the first year?", postedAgo: "1d ago", likes: 9 }, { proId: "pro-gallagher", body: "Good question. Short answer: yes, and I will write that one next.", postedAgo: "1d ago", likes: 15 }],
  },
  {
    id: "i-grant-2",
    boardId: "business-money",
    type: "insight",
    proId: "pro-grant",
    title: "What business school actually taught me",
    body: "Less finance than you think. Mostly how to work with people who disagree with me, and how to ask for help before a deadline instead of after.",
    postedAgo: "6d ago",
    helpful: 99,
    views: 2199,
    saves: 30,
    replies: [{ handle: "Maya", grade: "Senior", body: "needed this today", postedAgo: "2d ago", likes: 12 }, { handle: "Lena", grade: "Freshman", body: "my counselor never said this", postedAgo: "1d ago", likes: 3 }, { proId: "pro-grant", body: "It varies by place, but the idea holds.", postedAgo: "1d ago", likes: 16 }],
  },
  {
    id: "i-whitfield-2",
    boardId: "teaching-education",
    type: "insight",
    proId: "pro-whitfield",
    title: "Three résumé lines I never skip past",
    body: "A number (raised, sold, organized, taught), a verb that shows you started something, and one line about a time it did not work. Those tell me more than a GPA.",
    postedAgo: "1w ago",
    helpful: 136,
    views: 2976,
    saves: 41,
    replies: [{ handle: "Lena", grade: "Sophomore", body: "saving this", postedAgo: "2d ago", likes: 13 }, { handle: "Marcus", grade: "Junior", body: "how did you start?", postedAgo: "1d ago", likes: 4 }, { proId: "pro-whitfield", body: "Start small this week. Ask me here if you get stuck.", postedAgo: "1d ago", likes: 17 }],
  },
  {
    id: "i-tanaka-2",
    boardId: "teaching-education",
    type: "insight",
    proId: "pro-tanaka",
    title: "The one interview question to prepare for",
    body: "Tell me about a time something went wrong. Everyone rehearses their wins. The people I hire can talk calmly about a mistake and what they changed.",
    postedAgo: "2w ago",
    helpful: 173,
    views: 3753,
    saves: 52,
    replies: [{ handle: "Ava", grade: "Junior", body: "okay this actually helps", postedAgo: "2d ago", likes: 5 }, { handle: "Riley", grade: "Sophomore", body: "is this true everywhere?", postedAgo: "1d ago", likes: 5 }, { proId: "pro-tanaka", body: "Good question. Short answer: yes, and I will write that one next.", postedAgo: "1d ago", likes: 18 }],
  },
  {
    id: "i-brooks-2",
    boardId: "health-medicine",
    type: "insight",
    proId: "pro-brooks",
    title: "Nursing has a ladder. Here are the rungs.",
    body: "Nursing assistant, licensed practical nurse, registered nurse, nurse practitioner. You can step on at any rung, work, and keep climbing while you earn.",
    postedAgo: "5d ago",
    helpful: 210,
    views: 4530,
    saves: 63,
    replies: [{ handle: "Zoe", grade: "Freshman", body: "wait this is so useful", postedAgo: "2d ago", likes: 6 }, { handle: "Sana", grade: "Senior", body: "can you do a post on the first year?", postedAgo: "1d ago", likes: 6 }, { proId: "pro-brooks", body: "It varies by place, but the idea holds.", postedAgo: "1d ago", likes: 19 }],
  },
  {
    id: "i-fontaine-2",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-fontaine",
    title: "Your first motion reel should be thirty seconds",
    body: "Three pieces, your best first, no intro card, no music you do not have rights to. Nobody watches past thirty seconds anyway.",
    postedAgo: "3d ago",
    helpful: 247,
    views: 5307,
    saves: 74,
    replies: [{ handle: "Ruby", grade: "Senior", body: "needed this today", postedAgo: "2d ago", likes: 7 }, { handle: "Theo", grade: "Freshman", body: "my counselor never said this", postedAgo: "1d ago", likes: 7 }, { proId: "pro-fontaine", body: "Start small this week. Ask me here if you get stuck.", postedAgo: "1d ago", likes: 20 }],
  },
  {
    id: "i-haddad-2",
    boardId: "health-medicine",
    type: "insight",
    proId: "pro-haddad",
    title: "What a clinical research nurse does all day",
    body: "I meet patients in a trial, take vitals, record everything exactly, and flag anything unusual to the doctors. It is patient care with a science notebook.",
    postedAgo: "4d ago",
    helpful: 284,
    views: 6084,
    saves: 85,
    replies: [{ handle: "Sana", grade: "Sophomore", body: "saving this", postedAgo: "2d ago", likes: 8 }, { handle: "Zoe", grade: "Junior", body: "how did you start?", postedAgo: "1d ago", likes: 8 }, { proId: "pro-haddad", body: "Good question. Short answer: yes, and I will write that one next.", postedAgo: "1d ago", likes: 9 }],
  },
  {
    id: "i-haddad-3",
    boardId: "health-medicine",
    type: "insight",
    proId: "pro-haddad",
    title: "Medicine without the operating room",
    body: "If you like science and people but not blood, there is a whole side of healthcare you never see on TV: research, labs, public health, informatics.",
    postedAgo: "6d ago",
    helpful: 91,
    views: 2031,
    saves: 27,
    replies: [{ handle: "Priya", grade: "Junior", body: "okay this actually helps", postedAgo: "2d ago", likes: 9 }, { handle: "Noah", grade: "Sophomore", body: "is this true everywhere?", postedAgo: "1d ago", likes: 9 }, { proId: "pro-haddad", body: "It varies by place, but the idea holds.", postedAgo: "1d ago", likes: 10 }],
  },
  {
    id: "i-vega-2",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-vega",
    title: "How a show actually gets made",
    body: "An idea becomes a one-page pitch, then a script, then a budget, then a shoot, then months of editing. Producers keep all of that moving on time and on budget.",
    postedAgo: "1w ago",
    helpful: 128,
    views: 2808,
    saves: 38,
    replies: [{ handle: "Ruby", grade: "Freshman", body: "wait this is so useful", postedAgo: "2d ago", likes: 10 }, { handle: "Lena", grade: "Senior", body: "can you do a post on the first year?", postedAgo: "1d ago", likes: 3 }, { proId: "pro-vega", body: "Start small this week. Ask me here if you get stuck.", postedAgo: "1d ago", likes: 11 }],
  },
  {
    id: "i-vega-3",
    boardId: "arts-media",
    type: "insight",
    proId: "pro-vega",
    title: "The morning announcements were my first production",
    body: "I treated a school broadcast like a real show: run sheet, roles, timing. Taking small things seriously is the whole job.",
    postedAgo: "2w ago",
    helpful: 165,
    views: 3585,
    saves: 50,
    replies: [{ handle: "Theo", grade: "Senior", body: "needed this today", postedAgo: "2d ago", likes: 11 }, { handle: "Ava", grade: "Freshman", body: "my counselor never said this", postedAgo: "1d ago", likes: 4 }, { proId: "pro-vega", body: "Good question. Short answer: yes, and I will write that one next.", postedAgo: "1d ago", likes: 12 }],
  },
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o-amazon-fe",
    boardId: "tech-engineering",
    type: "opportunity",
    org: "Amazon",
    kind: "Internship",
    title: "Amazon Future Engineer, High School Internship",
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
    title: "Google Tech Exchange, Student Developer Program",
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

// , , ,  Event board (post-event continuation) , , , 

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
  entitled: boolean; // prototype: simulated AccessGrant, real entitlement is server-side (P0)
  code?: string; // prototype: demo redemption token, real tokens are single-use/server-side (handoff 9.2)
  // Upcoming events have neither yet, there's nothing to recap or share
  // until the event itself has happened.
  recap?: { proId: string; takeaways: string[]; postedAgo: string };
  resources?: { title: string; description: string; sourceLabel: string }[];
};

export const EVENTS: EventBoard[] = [
  {
    id: "event-ey",
    name: "Dream Opportunity EY Student Impact Day",
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
    entitled: true, // already joined, demonstrates the straight-into-the-board state
    recap: {
      proId: "pro-martinez",
      takeaways: [
        "Your major does not determine your career path, several of us on the panel changed directions completely.",
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
  // The two spring partnership boards the Replit prototype carried, which
  // the CEO of JA Singapore singled out (Slack, Sep 2): a nonprofit plus a
  // corporate partner, with the Replit's own figures. Morgan Stanley is
  // already joined; the Junior Achievement board unlocks with its code.
  {
    id: "event-do-morgan-stanley-nyc",
    name: "Dream Opportunity Morgan Stanley NYC",
    host: "Morgan Stanley",
    date: "March 12, 2026",
    location: "Morgan Stanley, New York City",
    lifecycle: "Active follow-up",
    closesOn: "September 30, 2026",
    students: 312,
    pros: 87,
    postCount: 203,
    orgs: ["Dream Opportunity", "Morgan Stanley", "Dreamari"],
    topics: ["Finance", "Investing", "Networking"],
    entitled: true,
  },
  {
    id: "event-ja-goldman-sachs-nyc",
    name: "Junior Achievement Goldman Sachs NYC",
    host: "Junior Achievement",
    date: "April 16, 2026",
    location: "Goldman Sachs, New York City",
    lifecycle: "Active follow-up",
    closesOn: "October 15, 2026",
    students: 236,
    pros: 52,
    postCount: 98,
    orgs: ["Junior Achievement", "Goldman Sachs", "Dreamari"],
    topics: ["Finance", "Banking", "Networking"],
    entitled: false,
    code: "JA-GS-2026",
  },
  // The three ACTUAL fall events (from Slack, Sep 1): Brooklyn/JPMorgan
  // Chase Oct 23, Dallas/AT&T Oct 29, New Jersey/EY Nov 4. All upcoming --
  // their boards open after each event happens, same lifecycle rule as
  // always. No invented stats: an event that has not happened has none.
  {
    id: "event-jpmc-brooklyn",
    name: "Dream Opportunity JPMorgan Chase Student Event",
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
    name: "Dream Opportunity AT&T Student Event",
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
    name: "Dream Opportunity EY Student Event",
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
    helpful: 277,
    followers: 19,
    comments: 45,
    responses: [
      { kind: "peer", handle: "Noah", grade: "Sophomore", body: "The consultant who started as a music major completely changed how I think about picking a college path.", postedAgo: "1h ago", likes: 11 },
      { kind: "peer", handle: "Riley", grade: "Sophomore", body: "us walking out of that panel", postedAgo: "45m ago", likes: 13, image: "/images/connect/reactions/minions-excited.gif", imageAlt: "Excited minions GIF" },
      { kind: "peer", handle: "Zoe", grade: "Sophomore", body: "the approachability surprised me too honestly", postedAgo: "30m ago", likes: 4 },
      {
        kind: "answer",
        proId: "pro-martinez",
        postedAgo: "1h ago",
        body: "From our side of the stage: the questions in that room were better than most college career fairs I've worked. Keep that energy.",
      },
    ],
  },
  {
    id: "et-consulting-vs-ib",
    boardId: "event-ey",
    type: "question",
    title: "What's actually different between consulting and investment banking?",
    context: "One of the speakers mentioned consulting today. I've been going back and forth between the two, they sound similar from the outside but I can tell they're not.",
    handle: "Devon",
    grade: "Senior",
    postedAgo: "3h ago",
    state: "answered",
    routedScope: "Consulting & professional services",
    expectedWindow: "within 2 days",
    views: 942,
    location: "United States",
    helpful: 143,
    followers: 4,
    comments: 26,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "2h ago",
        body: "Shortest version: bankers price and close deals; consultants change how companies run. Transactions versus transformations, different rhythms, both client-service jobs.",
      },
    ],
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
    helpful: 240,
    followers: 6,
    comments: 39,
    unreadAnswer: true,
    responses: [
      {
        kind: "answer",
        proId: "pro-martinez",
        primary: true,
        postedAgo: "5h ago",
        body: "Pick one thing and act on it this month. If a panelist named a skill, find the free version of it and spend two hours there. If they named a class, check whether your school offers it next term. Then post what you found back here so the next person gets it too. Notes you act on once beat notes you reread five times.",
        disclosure: "Personal approach, different professionals prefer different styles.",
      },
      { kind: "peer", handle: "Amir", grade: "Junior", body: "posting what you found back here is such a good rule", postedAgo: "4h ago", likes: 6 },
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
