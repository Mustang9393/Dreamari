// Profile prototype data — PROTOTYPE COPY throughout (flagged), shaped by the
// Career Intelligence Layer V3 doc:
//  - routes are generated PER CAREER (doc 1.7's "important rule" — never a
//    fixed trade/CC/university trio) with cost, duration, credential, salary
//    and loan-payoff fields;
//  - plans follow 3/6/12-month horizons of small deep-linked tasks (doc 1.8);
//  - the report shows interest EVIDENCE (receipts of behavior), and Readiness
//    surfaces the doc's student-facing status labels — evidence over points.

export type PathwayRoute = {
  id: string;
  type: string; // pathway type, e.g. "University", "Flight School"
  program: string; // school or program
  location: string;
  duration: string;
  cost: string;
  credential: string;
  salary: string;
  loanPayoff: string;
  nextStep: string;
  recommended?: boolean; // Dreamari's suggested route for this student
  short: string; // short label for the compare charts
  // numeric midpoints for the compare charts
  costMidK: number;
  years: number;
  payMidK: number;
  payoffYears: number;
};

export type PlanTask = {
  id: string;
  label: string;
  minutes: number;
  action: "Play" | "Explore" | "Join" | "Build";
  href: string;
  custom?: boolean; // student-added step
};

export type PlanHorizon = {
  id: string;
  title: string;
  subtitle: string;
  tasks: PlanTask[];
};

export type Receipt = {
  kind: "sim" | "level" | "saved" | "streak" | "scenario" | "watched";
  value: string; // the big number/word, e.g. "2x"
  label: string; // what it counts, e.g. "IB sim runs"
};

export type ProfileCareer = {
  id: string;
  title: string;
  world: string;
  photo: string;
  match: number; // Career Interest Score (0-100, Tier per doc 14.6)
  receipts: Receipt[]; // behavioral evidence, shown as tiles not sentences
  routes: PathwayRoute[];
  plan: PlanHorizon[];
};

const h = (id: string, title: string, subtitle: string, tasks: PlanTask[]): PlanHorizon => ({ id, title, subtitle, tasks });
const t = (id: string, label: string, minutes: number, action: PlanTask["action"], href: string): PlanTask => ({ id, label, minutes, action, href });

export const PROFILE_CAREERS: ProfileCareer[] = [
  {
    id: "investment-banking",
    title: "Investment Banking",
    world: "Business & Money",
    photo: "/images/app/poster-investment-banking.png",
    match: 86,
    receipts: [
      { kind: "sim", value: "2x", label: "IB sim finished" },
      { kind: "level", value: "Lv 4", label: "Finance glossary" },
      { kind: "saved", value: "3", label: "Careers saved" },
      { kind: "streak", value: "5 days", label: "Return streak" },
    ],
    routes: [
      {
        id: "ib-uni-target", short: "Target school",
        type: "University",
        program: "Finance at a target school (e.g. NYU Stern)",
        location: "New York, NY",
        duration: "4 yrs",
        cost: "$240K–320K",
        credential: "BS in Finance",
        salary: "$96K–110K+ first year",
        loanPayoff: "~4–6 yrs at analyst pay",
        nextStep: "Compare 3 finance programs",
        costMidK: 280,
        years: 4,
        payMidK: 103,
        payoffYears: 5,
      },
      {
        id: "ib-uni-state", recommended: true, short: "State flagship",
        type: "University",
        program: "Economics at your state flagship",
        location: "In-state",
        duration: "4 yrs",
        cost: "$45K–90K",
        credential: "BA in Economics",
        salary: "$70K–95K first year",
        loanPayoff: "~2–3 yrs",
        nextStep: "Check your state school's finance club",
        costMidK: 68,
        years: 4,
        payMidK: 82,
        payoffYears: 2.5,
      },
      {
        id: "ib-cc-transfer", short: "CC transfer",
        type: "Community College → Transfer",
        program: "Business at community college, transfer junior year",
        location: "Local",
        duration: "2 + 2 yrs",
        cost: "$6K–20K, then in-state tuition for the last 2 yrs",
        credential: "BS via transfer",
        salary: "$70K–95K first year",
        loanPayoff: "~1–2 yrs",
        nextStep: "Look up your CC's transfer agreements",
        costMidK: 60,
        years: 4,
        payMidK: 82,
        payoffYears: 1.5,
      },
    ],
    plan: [
      h("ib-3", "Next 3 Months", "Foundation", [
        t("ib-3-1", "Complete the finance glossary game", 10, "Play", "/match-lab"),
        t("ib-3-2", "Explore 5 finance careers", 10, "Explore", "/explore?tab=browse"),
        t("ib-3-3", "Play the Investment Banking mini game", 15, "Play", "/match-lab"),
        t("ib-3-4", "Start your resume draft", 15, "Build", "#resume"),
      ]),
      h("ib-6", "Next 6 Months", "Skills + people", [
        t("ib-6-1", "Reach Finance Glossary Level 7", 15, "Play", "/match-lab"),
        t("ib-6-2", "Try the Freshman Finance simulator", 20, "Play", "/match-lab"),
        t("ib-6-3", "Compare 3 finance programs side by side", 10, "Explore", "/explore?tab=browse"),
      ]),
      h("ib-12", "Next 12 Months", "Apply it", [
        t("ib-12-1", "Complete the Freshman Year Finance sim", 30, "Play", "/match-lab"),
        t("ib-12-2", "Tailor your resume to a finance internship", 20, "Build", "#resume"),
        t("ib-12-3", "Ask Dreamy how juniors prep for IB", 5, "Explore", "/explore"),
      ]),
    ],
  },
  {
    id: "airline-pilot",
    title: "Airline Pilot",
    world: "Driving, Flying & Shipping",
    photo: "/images/app/poster-airline-pilot-alt.png",
    match: 75,
    receipts: [
      { kind: "watched", value: "3x", label: "Pilot reel watched" },
      { kind: "saved", value: "3", label: "Careers saved" },
      { kind: "scenario", value: "1st try", label: "Scenario passed" },
    ],
    routes: [
      {
        id: "pilot-part141", recommended: true, short: "Flight school",
        type: "Flight School",
        program: "Part 141 accelerated flight academy",
        location: "Phoenix, AZ (or nearest academy)",
        duration: "1.5–2 yrs",
        cost: "$85K–110K",
        credential: "Commercial license + CFI",
        salary: "$45K–60K, then $90K+ regional",
        loanPayoff: "~4–5 yrs",
        nextStep: "Book a $150 discovery flight",
        costMidK: 98,
        years: 2,
        payMidK: 90,
        payoffYears: 4.5,
      },
      {
        id: "pilot-uni", short: "Aviation uni",
        type: "Aviation University",
        program: "BS Aeronautical Science (e.g. Embry-Riddle)",
        location: "Daytona Beach, FL",
        duration: "4 yrs",
        cost: "$180K–240K",
        credential: "BS + R-ATP at 1,000 hrs",
        salary: "$90K+ regional, $200K+ major",
        loanPayoff: "~5–7 yrs",
        nextStep: "Explore aviation university programs",
        costMidK: 210,
        years: 4,
        payMidK: 95,
        payoffYears: 6,
      },
      {
        id: "pilot-military", short: "Military",
        type: "Military Route",
        program: "Air Force / Navy flight training",
        location: "Nationwide",
        duration: "8–10 yrs",
        cost: "$0 (they pay you)",
        credential: "Military wings, then airlines",
        salary: "$50K–90K, then $200K+ after",
        loanPayoff: "None",
        nextStep: "Talk to a recruiter or JROTC advisor",
        costMidK: 0,
        years: 9,
        payMidK: 70,
        payoffYears: 0,
      },
    ],
    plan: [
      h("pl-3", "Next 3 Months", "First taste", [
        t("pl-3-1", "Play the Aviation Maintenance mini game", 10, "Play", "/match-lab"),
        t("pl-3-2", "Explore 5 aviation careers", 10, "Explore", "/explore?tab=browse"),
        t("pl-3-3", "Learn 10 aviation glossary terms", 10, "Play", "/match-lab"),
      ]),
      h("pl-6", "Next 6 Months", "Real world", [
        t("pl-6-1", "Book a discovery flight near you", 20, "Explore", "/explore"),
        t("pl-6-2", "Compare flight school vs aviation university", 10, "Explore", "/explore?tab=browse"),
        t("pl-6-3", "Start your resume draft", 15, "Build", "#resume"),
      ]),
      h("pl-12", "Next 12 Months", "Commit", [
        t("pl-12-1", "Complete the pilot pathway simulator", 30, "Play", "/match-lab"),
        t("pl-12-2", "Shortlist 3 flight programs", 15, "Explore", "/explore?tab=browse"),
        t("pl-12-3", "Ask Dreamy about FAFSA for flight school", 5, "Explore", "/explore"),
      ]),
    ],
  },
  {
    id: "private-equity",
    title: "Private Equity",
    world: "Business & Money",
    photo: "/images/app/poster-private-equity.png",
    match: 88,
    receipts: [
      { kind: "watched", value: "Liked", label: "For You likes" },
      { kind: "sim", value: "2x", label: "PE breakdown read" },
      { kind: "scenario", value: "1st try", label: "Scenario passed" },
    ],
    routes: [
      {
        id: "pe-uni-target", short: "Target school",
        type: "University",
        program: "Finance or Economics at a target school",
        location: "Northeast preferred",
        duration: "4 yrs + 2 yrs banking",
        cost: "$240K–320K",
        credential: "BS + IB analyst experience",
        salary: "$150K–300K+ as PE associate",
        loanPayoff: "~2–3 yrs at PE pay",
        nextStep: "Understand the IB-to-PE path",
        costMidK: 280,
        years: 6,
        payMidK: 225,
        payoffYears: 2.5,
      },
      {
        id: "pe-uni-state", recommended: true, short: "State flagship",
        type: "University",
        program: "Honors Finance at your state flagship",
        location: "In-state",
        duration: "4 yrs + 2 yrs banking",
        cost: "$45K–90K",
        credential: "BS + IB analyst experience",
        salary: "$150K–300K+ as PE associate",
        loanPayoff: "~1–2 yrs",
        nextStep: "Find your school's investment fund club",
        costMidK: 68,
        years: 6,
        payMidK: 225,
        payoffYears: 1.5,
      },
    ],
    plan: [
      h("pe-3", "Next 3 Months", "Learn the language", [
        t("pe-3-1", "Complete the finance glossary game", 10, "Play", "/match-lab"),
        t("pe-3-2", "Play the Private Equity mini game", 15, "Play", "/match-lab"),
        t("pe-3-3", "Explore how PE differs from IB", 10, "Explore", "/explore?tab=browse"),
      ]),
      h("pe-6", "Next 6 Months", "Analyst mindset", [
        t("pe-6-1", "Reach Finance Glossary Level 7", 15, "Play", "/match-lab"),
        t("pe-6-2", "Complete the valuation scenario", 20, "Play", "/match-lab"),
        t("pe-6-3", "Start your resume draft", 15, "Build", "#resume"),
      ]),
      h("pe-12", "Next 12 Months", "Aim the funnel", [
        t("pe-12-1", "Complete 3 finance simulations", 30, "Play", "/match-lab"),
        t("pe-12-2", "Compare 3 target finance programs", 15, "Explore", "/explore?tab=browse"),
        t("pe-12-3", "Ask Dreamy about summer finance programs", 5, "Explore", "/explore"),
      ]),
    ],
  },
];

// The Career Locker — saved careers not (yet) in the Top 3. Match values are
// Career Interest Scores; art from the app catalog.
export const LOCKER_EXTRAS: ProfileCareer[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    world: "Tech & Engineering",
    photo: "/images/app/poster-software-engineer.png",
    match: 84,
    receipts: [{ kind: "scenario", value: "Pass", label: "Debugging scenario" }, { kind: "saved", value: "2", label: "Careers saved" }],
    routes: [
      { id: "se-uni", short: "CS degree", type: "University", program: "Computer Science", location: "In-state", duration: "4 yrs", cost: "$45K–90K", credential: "BS in CS", salary: "$85K–130K first year", loanPayoff: "~1–2 yrs", nextStep: "Try a beginner coding game",   costMidK: 68,
        years: 4,
        payMidK: 108,
        payoffYears: 1.5,
      },
      { id: "se-boot", short: "Bootcamp", type: "Bootcamp + Portfolio", program: "12-week intensive after HS", location: "Remote", duration: "3–6 mo", cost: "$10K–18K", credential: "Certificate + portfolio", salary: "$55K–80K first year", loanPayoff: "~1 yr", nextStep: "Build one small project",   costMidK: 14,
        years: 0.5,
        payMidK: 68,
        payoffYears: 1,
      },
    ],
    plan: [
      h("se-3", "Next 3 Months", "First code", [
        t("se-3-1", "Play the coding logic mini game", 10, "Play", "/match-lab"),
        t("se-3-2", "Explore 5 tech careers", 10, "Explore", "/explore?tab=browse"),
      ]),
      h("se-6", "Next 6 Months", "Build real", [t("se-6-1", "Finish a small project", 30, "Build", "#resume")]),
      h("se-12", "Next 12 Months", "Show it", [t("se-12-1", "Publish your portfolio", 30, "Build", "#resume")]),
    ],
  },
  {
    id: "registered-nurse",
    title: "Registered Nurse",
    world: "Health & Medicine",
    photo: "/images/app/poster-registered-nurse.png",
    match: 78,
    receipts: [{ kind: "scenario", value: "Pass", label: "Triage scenario" }, { kind: "saved", value: "2", label: "Health careers saved" }],
    routes: [
      { id: "rn-adn", short: "ADN (CC)", type: "Community College", program: "ADN (Associate Degree in Nursing)", location: "Local", duration: "2 yrs", cost: "$6K–20K", credential: "ADN + NCLEX-RN", salary: "$65K–80K", loanPayoff: "<1 yr", nextStep: "Check your CC's nursing waitlist",   costMidK: 13,
        years: 2,
        payMidK: 73,
        payoffYears: 0.8,
      },
      { id: "rn-bsn", short: "BSN (uni)", type: "University", program: "BSN", location: "In-state", duration: "4 yrs", cost: "$40K–90K", credential: "BSN + NCLEX-RN", salary: "$75K–95K", loanPayoff: "~1–2 yrs", nextStep: "Compare ADN vs BSN outcomes",   costMidK: 65,
        years: 4,
        payMidK: 85,
        payoffYears: 1.5,
      },
    ],
    plan: [
      h("rn-3", "Next 3 Months", "Test the fit", [
        t("rn-3-1", "Play the triage mini game", 10, "Play", "/match-lab"),
        t("rn-3-2", "Learn 10 medical glossary terms", 10, "Play", "/match-lab"),
      ]),
      h("rn-6", "Next 6 Months", "Get close", [t("rn-6-1", "Explore hospital volunteering near you", 15, "Explore", "/explore")]),
      h("rn-12", "Next 12 Months", "Line it up", [t("rn-12-1", "Map your junior-year science classes", 15, "Build", "#resume")]),
    ],
  },
  {
    id: "asset-management",
    title: "Asset Management",
    world: "Business & Money",
    photo: "/images/app/poster-asset-management.png",
    match: 80,
    receipts: [{ kind: "saved", value: "Saved", label: "From the Browse rail" }, { kind: "sim", value: "1x", label: "Markets mini game" }],
    routes: [
      { id: "am-uni", short: "Finance degree", type: "University", program: "Finance or Economics", location: "In-state", duration: "4 yrs", cost: "$45K–90K", credential: "BS in Finance", salary: "$70K–95K first year", loanPayoff: "~2 yrs", nextStep: "Explore what asset managers do daily",   costMidK: 68,
        years: 4,
        payMidK: 83,
        payoffYears: 2,
      },
    ],
    plan: [
      h("am-3", "Next 3 Months", "Basics", [t("am-3-1", "Complete the finance glossary game", 10, "Play", "/match-lab")]),
      h("am-6", "Next 6 Months", "Deeper", [t("am-6-1", "Play the markets simulator", 20, "Play", "/match-lab")]),
      h("am-12", "Next 12 Months", "Compare", [t("am-12-1", "Compare finance programs", 15, "Explore", "/explore?tab=browse")]),
    ],
  },
  {
    id: "food-scientist",
    title: "Food Scientist",
    world: "Farming, Animals & Nature",
    photo: "/images/app/poster-food-scientist.png",
    match: 73,
    receipts: [{ kind: "watched", value: "Liked", label: "In the match deck" }, { kind: "sim", value: "1x", label: "Breakdown read" }],
    routes: [
      { id: "fs-uni", short: "Food science", type: "University", program: "Food Science or Chemistry", location: "Land-grant school", duration: "4 yrs", cost: "$40K–90K", credential: "BS in Food Science", salary: "$60K–80K", loanPayoff: "~2 yrs", nextStep: "Explore food science programs",   costMidK: 65,
        years: 4,
        payMidK: 70,
        payoffYears: 2,
      },
    ],
    plan: [
      h("fs-3", "Next 3 Months", "Taste it", [t("fs-3-1", "Play the flavor lab mini game", 10, "Play", "/match-lab")]),
      h("fs-6", "Next 6 Months", "Technical", [t("fs-6-1", "Learn 10 chemistry glossary terms", 10, "Play", "/match-lab")]),
      h("fs-12", "Next 12 Months", "Find programs", [t("fs-12-1", "Shortlist 3 food science schools", 15, "Explore", "/explore?tab=browse")]),
    ],
  },
];

export const ALL_PROFILE_CAREERS: ProfileCareer[] = [...PROFILE_CAREERS, ...LOCKER_EXTRAS];

// Student identity + readiness (prototype figures). Readiness follows the
// doc's student-facing status labels (section 22), never a vanity total.
export const STUDENT = {
  name: "Jordan Rivera",
  avatar: "/images/avatar-jordan.jpg",
  grade: "Grade 11",
  school: "Westfield High School",
  streakDays: 12,
  readiness: 46, // 0-100 — "Building Readiness" band
  readinessStatus: "Building Readiness",
  readinessNext: "Pass 1 scenario first try",
};

// ---- Rich route detail (Replit v2-my-profile parity) ----
// Everything the Replit pathways section shows per route: pitch, fit,
// student life, and the loan-payoff math. Optional: locker-extra careers
// render without these blocks until authored. PROTOTYPE COPY.

export type RouteDetail = {
  pitch: string;
  fit: { tagline: string; acceptance: string; acceptancePct?: number; aid: string; targets: string; placement: "High" | "Medium" };
  life: { clubs: string[]; feel: string; abroad: string };
  payoff: {
    time: string;
    tag: string;
    avgLoan: string;
    startSalary: string;
    years: { label: string; amount: string; note?: string }[];
    budget: { income: string; loan: string; keep: string; pct: number };
    takeaway: string;
  };
  tags: Partial<Record<"time" | "cost" | "salary" | "payoff" | "access" | "abroad" | "community", string>>;
};

export const ROUTE_DETAILS: Record<string, RouteDetail> = {
  "ib-uni-target": {
    pitch: "Target top finance roles at elite firms.",
    fit: { tagline: "Best for elite finance jobs", acceptance: "~20% acceptance, competitive", acceptancePct: 20, aid: "Big endowments, real aid packages", targets: "JPMorgan, Goldman Sachs, Blackstone", placement: "High" },
    life: { clubs: ["500+ clubs, finance societies, Women in Business", "ALFA, LatinX, BSU, Asian Student Assoc.", "Active fraternities and sororities"], feel: "Huge and diverse, easy to find your people", abroad: "Extensive options worldwide (London, Shanghai, Abu Dhabi)" },
    payoff: { time: "~4-6 yrs", tag: "Bonuses melt it fast", avgLoan: "$280K", startSalary: "$103K", years: [{ label: "Year 1", amount: "$133K", note: "$103K + $30K bonus" }, { label: "Year 2", amount: "$170K", note: "$120K + $50K bonus" }, { label: "Year 3", amount: "$225K", note: "$145K + $80K bonus" }], budget: { income: "$8,583/mo", loan: "$1,290/mo", keep: "$7,293/mo", pct: 15 }, takeaway: "Stack your bonuses and it is gone in 5 or 6 years." },
    tags: { salary: "Highest earning", cost: "Premium", access: "Elite network", abroad: "Global campuses", community: "500+ clubs" },
  },
  "ib-uni-state": {
    pitch: "Strong finance jobs without the elite price tag.",
    fit: { tagline: "Best value for finance", acceptance: "~60-80% acceptance at most flagships", acceptancePct: 70, aid: "In-state tuition plus merit scholarships", targets: "Regional banks, Big 4, corporate finance", placement: "High" },
    life: { clubs: ["Finance club, student investment fund, case teams", "Cultural orgs and honor societies", "Big sports weekends and Greek life"], feel: "Big school energy at an affordable price", abroad: "Solid exchange options" },
    payoff: { time: "~2-3 yrs", tag: "Totally manageable", avgLoan: "$68K", startSalary: "$82K", years: [{ label: "Year 1", amount: "$82K", note: "$75K + $7K bonus" }, { label: "Year 2", amount: "$88K", note: "$80K + $8K bonus" }, { label: "Year 3", amount: "$95K", note: "$86K + $9K bonus" }], budget: { income: "$6,833/mo", loan: "$640/mo", keep: "$6,193/mo", pct: 9 }, takeaway: "Strong pay with a fraction of the debt of a target school." },
    tags: { cost: "Great value", salary: "Strong", access: "Accessible", payoff: "Fast" },
  },
  "ib-cc-transfer": {
    pitch: "Two cheap years, then the same degree on your resume.",
    fit: { tagline: "Best for lowest debt", acceptance: "Open enrollment, everyone is accepted", acceptancePct: 100, aid: "Pell grants and local scholarships", targets: "Transfer to a 4-year, then the same doors open", placement: "Medium" },
    life: { clubs: ["Business club, honor societies, career groups", "Latino Student Assoc., BSU, Asian Pacific Club", "Limited Greek life at most CCs"], feel: "Local, diverse, everyone hustles together", abroad: "Limited options at some schools" },
    payoff: { time: "~1-2 yrs", tag: "Very fast", avgLoan: "$13K", startSalary: "$82K after transfer", years: [{ label: "Year 1", amount: "$82K", note: "$75K + $7K bonus" }, { label: "Year 2", amount: "$88K", note: "$80K + $8K bonus" }, { label: "Year 3", amount: "$95K", note: "$86K + $9K bonus" }], budget: { income: "$6,833/mo", loan: "$575/mo", keep: "$6,258/mo", pct: 8 }, takeaway: "Debt gone fast, wealth building starts in your early 20s." },
    tags: { cost: "Most affordable", payoff: "Fastest", access: "Open enrollment" },
  },
  "pilot-part141": {
    pitch: "Get in the cockpit fastest and build hours for pay.",
    fit: { tagline: "Best for hands-on learners", acceptance: "~90% of applicants accepted", acceptancePct: 90, aid: "Aviation grants and financing programs", targets: "Regional airlines, then majors at 1,500 hours", placement: "High" },
    life: { clubs: ["Aviation clubs, Women in Aviation", "Small cohorts, limited campus life", "No Greek life at flight academies"], feel: "Close-knit, small classes, mentorship", abroad: "Limited or none" },
    payoff: { time: "~4-5 yrs", tag: "Tight at first, then easy", avgLoan: "$98K", startSalary: "$52K instructing", years: [{ label: "Year 1", amount: "$52K", note: "CFI, building hours" }, { label: "Year 2", amount: "$90K", note: "$75K + $15K signing bonus" }, { label: "Year 3", amount: "$110K" }], budget: { income: "$4,333/mo", loan: "$980/mo", keep: "$3,353/mo", pct: 23 }, takeaway: "Lean years while instructing, then pay jumps at the regionals." },
    tags: { time: "Fastest to cockpit", salary: "Jumps at regionals" },
  },
  "pilot-uni": {
    pitch: "A degree plus wings, with airline cadet pipelines.",
    fit: { tagline: "Best for airline-sponsored pipelines", acceptance: "~60-70% acceptance", acceptancePct: 65, aid: "Aviation scholarships and ROTC options", targets: "Delta, United and American cadet programs", placement: "High" },
    life: { clubs: ["Flight teams and aviation fraternities", "Big-school clubs and intramurals", "Active Greek life"], feel: "Aviation-obsessed campus, everyone talks planes", abroad: "Some exchange programs" },
    payoff: { time: "~5-7 yrs", tag: "Big loan, big paychecks", avgLoan: "$210K", startSalary: "$90K regional", years: [{ label: "Year 1", amount: "$90K", note: "$75K + $15K signing bonus" }, { label: "Year 2", amount: "$105K" }, { label: "Year 3", amount: "$200K+", note: "$170K + $30K profit share" }], budget: { income: "$7,500/mo", loan: "$1,450/mo", keep: "$6,050/mo", pct: 19 }, takeaway: "Costs more, but the 1,000-hour R-ATP break gets you hired sooner." },
    tags: { salary: "Majors sooner", cost: "Premium", access: "Cadet pipelines" },
  },
  "pilot-military": {
    pitch: "Serve first, fly free, leave with elite training.",
    fit: { tagline: "Best if you want to serve and fly free", acceptance: "Flight slots are highly selective", acceptancePct: 15, aid: "$0 cost, they pay you", targets: "Air Force or Navy, then any airline", placement: "High" },
    life: { clubs: ["Squadron culture and tight crews", "Base life, moves every few years", "Strong veteran network afterward"], feel: "Discipline and camaraderie, a family for a decade", abroad: "Stationed worldwide" },
    payoff: { time: "None", tag: "No debt at all", avgLoan: "$0", startSalary: "$70K in service", years: [{ label: "Year 1", amount: "$70K" }, { label: "Year 2", amount: "$80K" }, { label: "Year 3", amount: "$90K" }], budget: { income: "$6,250/mo", loan: "$0/mo", keep: "$6,250/mo", pct: 0 }, takeaway: "Zero debt, elite training. The trade: 8 to 10 years of service." },
    tags: { payoff: "No debt", access: "Selective" },
  },
  "pe-uni-target": {
    pitch: "The classic 2-year IB analyst route into PE.",
    fit: { tagline: "Best for the classic PE track", acceptance: "~20% acceptance, competitive", acceptancePct: 20, aid: "Big endowments, real aid packages", targets: "Blackstone, KKR, Apollo after an IB stint", placement: "High" },
    life: { clubs: ["Finance societies and PE/VC clubs", "Case competitions and pitch nights", "Active fraternities and sororities"], feel: "Ambitious, networked, always recruiting", abroad: "Extensive options worldwide" },
    payoff: { time: "~4-6 yrs", tag: "Bonuses melt it fast", avgLoan: "$280K", startSalary: "$110K", years: [{ label: "Year 1", amount: "$140K", note: "$110K + $30K bonus" }, { label: "Year 2", amount: "$180K", note: "$135K + $45K bonus" }, { label: "Year 3", amount: "$300K+", note: "PE associate" }], budget: { income: "$9,166/mo", loan: "$1,290/mo", keep: "$7,876/mo", pct: 14 }, takeaway: "The debt is heavy but PE associate pay clears it quickly." },
    tags: { salary: "Highest ceiling", cost: "Premium", access: "Elite network" },
  },
  "pe-uni-state": {
    pitch: "Prove yourself in banking first, then jump to PE.",
    fit: { tagline: "Best underdog route", acceptance: "~60-80% acceptance at most flagships", acceptancePct: 70, aid: "In-state tuition plus merit scholarships", targets: "Middle-market PE after regional IB", placement: "Medium" },
    life: { clubs: ["Student investment fund, finance club", "Cultural orgs and honor societies", "Big sports and Greek life"], feel: "Big school energy at an affordable price", abroad: "Solid exchange options" },
    payoff: { time: "~2-3 yrs", tag: "Totally manageable", avgLoan: "$68K", startSalary: "$85K", years: [{ label: "Year 1", amount: "$85K", note: "$75K + $10K bonus" }, { label: "Year 2", amount: "$100K", note: "$85K + $15K bonus" }, { label: "Year 3", amount: "$140K", note: "$100K + $40K bonus" }], budget: { income: "$7,083/mo", loan: "$640/mo", keep: "$6,443/mo", pct: 9 }, takeaway: "Less debt buys you patience for the longer climb into PE." },
    tags: { cost: "Great value", payoff: "Fast", access: "Accessible" },
  },
};

export const routeDetail = (routeId: string): RouteDetail | undefined => ROUTE_DETAILS[routeId];
