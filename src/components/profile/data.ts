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
};

export type PlanTask = {
  id: string;
  label: string;
  minutes: number;
  action: "Play" | "Explore" | "Join" | "Build";
  href: string;
};

export type PlanHorizon = {
  id: string;
  title: string;
  subtitle: string;
  tasks: PlanTask[];
};

export type ProfileCareer = {
  id: string;
  title: string;
  world: string;
  photo: string;
  match: number; // Career Interest Score (0-100, Tier per doc 14.6)
  evidence: string[]; // behavioral receipts shown on the report
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
    evidence: [
      "Finished the Investment Banking simulator — twice",
      "Reached Finance Glossary Level 4",
      "Saved 3 finance careers and came back 5 days in a row",
    ],
    routes: [
      {
        id: "ib-uni-target",
        type: "University",
        program: "Finance at a target school (e.g. NYU Stern)",
        location: "New York, NY",
        duration: "4 yrs",
        cost: "$240K–320K",
        credential: "BS in Finance",
        salary: "$96K–110K+ first year",
        loanPayoff: "~4–6 yrs at analyst pay",
        nextStep: "Compare 3 finance programs",
      },
      {
        id: "ib-uni-state",
        type: "University",
        program: "Economics at your state flagship",
        location: "In-state",
        duration: "4 yrs",
        cost: "$45K–90K",
        credential: "BA in Economics",
        salary: "$70K–95K first year",
        loanPayoff: "~2–3 yrs",
        nextStep: "Check your state school's finance club",
      },
      {
        id: "ib-cc-transfer",
        type: "Community College → Transfer",
        program: "Business at community college, transfer junior year",
        location: "Local",
        duration: "2 + 2 yrs",
        cost: "$6K–20K, then in-state",
        credential: "BS via transfer",
        salary: "$70K–95K first year",
        loanPayoff: "~1–2 yrs",
        nextStep: "Look up your CC's transfer agreements",
      },
    ],
    plan: [
      h("ib-3", "Next 3 Months", "Build your foundation.", [
        t("ib-3-1", "Complete the finance glossary game", 10, "Play", "/match-lab"),
        t("ib-3-2", "Explore 5 finance careers", 10, "Explore", "/explore?tab=browse"),
        t("ib-3-3", "Play the Investment Banking mini game", 15, "Play", "/match-lab"),
        t("ib-3-4", "Start your resume draft", 15, "Build", "#resume"),
      ]),
      h("ib-6", "Next 6 Months", "Build skills and meet people.", [
        t("ib-6-1", "Reach Finance Glossary Level 7", 15, "Play", "/match-lab"),
        t("ib-6-2", "Try the Freshman Finance simulator", 20, "Play", "/match-lab"),
        t("ib-6-3", "Compare 3 finance programs side by side", 10, "Explore", "/explore?tab=browse"),
      ]),
      h("ib-12", "Next 12 Months", "Apply what you built.", [
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
    evidence: [
      "Watched the full Airline Pilot reel card 3 times",
      "Saved 3 aviation careers",
      "Passed the aviation weather scenario first try",
    ],
    routes: [
      {
        id: "pilot-part141",
        type: "Flight School",
        program: "Part 141 accelerated flight academy",
        location: "Phoenix, AZ (or nearest academy)",
        duration: "1.5–2 yrs",
        cost: "$85K–110K",
        credential: "Commercial license + CFI",
        salary: "$45K–60K instructing, $90K+ regional",
        loanPayoff: "~4–5 yrs",
        nextStep: "Book a $150 discovery flight",
      },
      {
        id: "pilot-uni",
        type: "Aviation University",
        program: "BS Aeronautical Science (e.g. Embry-Riddle)",
        location: "Daytona Beach, FL",
        duration: "4 yrs",
        cost: "$180K–240K",
        credential: "BS + R-ATP at 1,000 hrs",
        salary: "$90K+ regional, $200K+ major",
        loanPayoff: "~5–7 yrs",
        nextStep: "Explore aviation university programs",
      },
      {
        id: "pilot-military",
        type: "Military Route",
        program: "Air Force / Navy flight training",
        location: "Nationwide",
        duration: "8–10 yr commitment",
        cost: "$0 — they pay you",
        credential: "Military wings → airline transition",
        salary: "$50K–90K in service, $200K+ after",
        loanPayoff: "None",
        nextStep: "Talk to a recruiter or JROTC advisor",
      },
    ],
    plan: [
      h("pl-3", "Next 3 Months", "Get your hands on the sky.", [
        t("pl-3-1", "Play the Aviation Maintenance mini game", 10, "Play", "/match-lab"),
        t("pl-3-2", "Explore 5 aviation careers", 10, "Explore", "/explore?tab=browse"),
        t("pl-3-3", "Learn 10 aviation glossary terms", 10, "Play", "/match-lab"),
      ]),
      h("pl-6", "Next 6 Months", "Test it in the real world.", [
        t("pl-6-1", "Book a discovery flight near you", 20, "Explore", "/explore"),
        t("pl-6-2", "Compare flight school vs aviation university", 10, "Explore", "/explore?tab=browse"),
        t("pl-6-3", "Start your resume draft", 15, "Build", "#resume"),
      ]),
      h("pl-12", "Next 12 Months", "Commit to a route.", [
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
    evidence: [
      "Liked Private Equity Analyst in the For You reel",
      "Read the full PE career breakdown twice",
      "Finished the valuation scenario with a first-try pass",
    ],
    routes: [
      {
        id: "pe-uni-target",
        type: "University",
        program: "Finance or Economics at a target school",
        location: "Northeast preferred",
        duration: "4 yrs + 2 yrs banking",
        cost: "$240K–320K",
        credential: "BS + IB analyst experience",
        salary: "$150K–300K+ as PE associate",
        loanPayoff: "~2–3 yrs at PE pay",
        nextStep: "Understand the IB-to-PE path",
      },
      {
        id: "pe-uni-state",
        type: "University",
        program: "Honors Finance at your state flagship",
        location: "In-state",
        duration: "4 yrs + 2 yrs banking",
        cost: "$45K–90K",
        credential: "BS + IB analyst experience",
        salary: "$150K–300K+ as PE associate",
        loanPayoff: "~1–2 yrs",
        nextStep: "Find your school's investment fund club",
      },
    ],
    plan: [
      h("pe-3", "Next 3 Months", "Learn the language of deals.", [
        t("pe-3-1", "Complete the finance glossary game", 10, "Play", "/match-lab"),
        t("pe-3-2", "Play the Private Equity mini game", 15, "Play", "/match-lab"),
        t("pe-3-3", "Explore how PE differs from IB", 10, "Explore", "/explore?tab=browse"),
      ]),
      h("pe-6", "Next 6 Months", "Build the analyst mindset.", [
        t("pe-6-1", "Reach Finance Glossary Level 7", 15, "Play", "/match-lab"),
        t("pe-6-2", "Complete the valuation scenario", 20, "Play", "/match-lab"),
        t("pe-6-3", "Start your resume draft", 15, "Build", "#resume"),
      ]),
      h("pe-12", "Next 12 Months", "Aim at the funnel.", [
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
    evidence: ["Finished the debugging scenario", "Saved 2 tech careers"],
    routes: [
      { id: "se-uni", type: "University", program: "Computer Science", location: "In-state", duration: "4 yrs", cost: "$45K–90K", credential: "BS in CS", salary: "$85K–130K first year", loanPayoff: "~1–2 yrs", nextStep: "Try a beginner coding game" },
      { id: "se-boot", type: "Bootcamp + Portfolio", program: "12-week intensive after HS", location: "Remote", duration: "3–6 mo", cost: "$10K–18K", credential: "Certificate + portfolio", salary: "$55K–80K first year", loanPayoff: "~1 yr", nextStep: "Build one small project" },
    ],
    plan: [
      h("se-3", "Next 3 Months", "Write your first code.", [
        t("se-3-1", "Play the coding logic mini game", 10, "Play", "/match-lab"),
        t("se-3-2", "Explore 5 tech careers", 10, "Explore", "/explore?tab=browse"),
      ]),
      h("se-6", "Next 6 Months", "Build something real.", [t("se-6-1", "Finish a small project", 30, "Build", "#resume")]),
      h("se-12", "Next 12 Months", "Show your work.", [t("se-12-1", "Publish your portfolio", 30, "Build", "#resume")]),
    ],
  },
  {
    id: "registered-nurse",
    title: "Registered Nurse",
    world: "Health & Medicine",
    photo: "/images/app/poster-registered-nurse.png",
    match: 78,
    evidence: ["Completed the triage scenario", "Saved 2 health careers"],
    routes: [
      { id: "rn-adn", type: "Community College", program: "ADN (Associate Degree in Nursing)", location: "Local", duration: "2 yrs", cost: "$6K–20K", credential: "ADN + NCLEX-RN", salary: "$65K–80K", loanPayoff: "<1 yr", nextStep: "Check your CC's nursing waitlist" },
      { id: "rn-bsn", type: "University", program: "BSN", location: "In-state", duration: "4 yrs", cost: "$40K–90K", credential: "BSN + NCLEX-RN", salary: "$75K–95K", loanPayoff: "~1–2 yrs", nextStep: "Compare ADN vs BSN outcomes" },
    ],
    plan: [
      h("rn-3", "Next 3 Months", "Test the fit.", [
        t("rn-3-1", "Play the triage mini game", 10, "Play", "/match-lab"),
        t("rn-3-2", "Learn 10 medical glossary terms", 10, "Play", "/match-lab"),
      ]),
      h("rn-6", "Next 6 Months", "Get close to the work.", [t("rn-6-1", "Explore hospital volunteering near you", 15, "Explore", "/explore")]),
      h("rn-12", "Next 12 Months", "Line up prerequisites.", [t("rn-12-1", "Map your junior-year science classes", 15, "Build", "#resume")]),
    ],
  },
  {
    id: "asset-management",
    title: "Asset Management",
    world: "Business & Money",
    photo: "/images/app/poster-asset-management.png",
    match: 80,
    evidence: ["Saved from the Browse rail", "Played the markets mini game"],
    routes: [
      { id: "am-uni", type: "University", program: "Finance or Economics", location: "In-state", duration: "4 yrs", cost: "$45K–90K", credential: "BS in Finance", salary: "$70K–95K first year", loanPayoff: "~2 yrs", nextStep: "Explore what asset managers do daily" },
    ],
    plan: [
      h("am-3", "Next 3 Months", "Learn the basics.", [t("am-3-1", "Complete the finance glossary game", 10, "Play", "/match-lab")]),
      h("am-6", "Next 6 Months", "Go deeper.", [t("am-6-1", "Play the markets simulator", 20, "Play", "/match-lab")]),
      h("am-12", "Next 12 Months", "Compare paths.", [t("am-12-1", "Compare finance programs", 15, "Explore", "/explore?tab=browse")]),
    ],
  },
  {
    id: "food-scientist",
    title: "Food Scientist",
    world: "Farming, Animals & Nature",
    photo: "/images/app/poster-food-scientist.png",
    match: 73,
    evidence: ["Liked in the match deck", "Read the full breakdown"],
    routes: [
      { id: "fs-uni", type: "University", program: "Food Science or Chemistry", location: "Land-grant school", duration: "4 yrs", cost: "$40K–90K", credential: "BS in Food Science", salary: "$60K–80K", loanPayoff: "~2 yrs", nextStep: "Explore food science programs" },
    ],
    plan: [
      h("fs-3", "Next 3 Months", "Taste the field.", [t("fs-3-1", "Play the flavor lab mini game", 10, "Play", "/match-lab")]),
      h("fs-6", "Next 6 Months", "Get technical.", [t("fs-6-1", "Learn 10 chemistry glossary terms", 10, "Play", "/match-lab")]),
      h("fs-12", "Next 12 Months", "Find programs.", [t("fs-12-1", "Shortlist 3 food science schools", 15, "Explore", "/explore?tab=browse")]),
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
  readinessNext: "Pass one skill scenario on your first try to keep climbing.",
};
