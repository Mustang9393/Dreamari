// Career & Pathway Report v2 — the student-owned artifact.
//
// Shape follows the Career Intelligence Layer V3 doc: careers carry a simple
// explanation and a real-life example (CIL 5), pathways carry cost/time/
// credential/entry-requirements/pros-cons/next-step (CIL 1.7), and every
// number that reaches a student carries its source, year and last-verified
// date. The internal scores in CIL 13-21 (Career Interest Score, Feed Rank,
// Signal Confidence, Readiness) are deliberately NOT represented here: the
// report explains itself with evidence a student can point at instead.
//
// PROTOTYPE CONTENT. Salary and outlook strings are transcribed from BLS
// occupational pages; college and program facts are illustrative fixtures.

export type PathwayStage = "explore" | "compare" | "decide" | "plan" | "share";

export const PATHWAY_STAGES: { id: PathwayStage; label: string; blurb: string }[] = [
  { id: "explore", label: "Explore", blurb: "Look around and save what interests you." },
  { id: "compare", label: "Compare", blurb: "Put your top careers side by side." },
  { id: "decide", label: "Decide", blurb: "Pick a direction you want to test." },
  { id: "plan", label: "Plan", blurb: "Turn it into steps you can actually do." },
  { id: "share", label: "Share", blurb: "Bring it to your counselor." },
];

// ---- Sourcing: every figure a student sees can name where it came from ----

export type Source = {
  label: string; // what it backs up
  org: string; // "U.S. Bureau of Labor Statistics"
  year: string; // data year
  verified: string; // last checked
  url: string;
};

// ---- Career at a glance (report section 4) ----

export type CareerGlance = {
  simple: string; // CIL 5: the one-sentence explanation
  example: string; // CIL 5: the real-life example
  whatYouDo: string;
  responsibilities: string[];
  environment: string;
  schedule: string;
  skills: string[];
  industries: string[];
  employers: string[]; // EXAMPLE employers, never opportunities
  education: string;
  alternatives: string[];
};

// ---- Salary and outlook (report section 5) ----

export type SalaryBlock = {
  median: string;
  entry: string;
  experienced: string;
  geography: string; // how much place changes it
  variablePay: string | null; // bonus/commission note, null when it does not move the number
  outlook: string;
  outlookDetail: string;
  source: Source;
};

// ---- Education, majors, colleges (report sections 6-8) ----

export type EducationRoute = {
  name: string;
  kind: "Degree" | "Certificate" | "Apprenticeship" | "Training" | "Military";
  time: string;
  prerequisites: string;
  licensure: string | null;
  common: boolean; // the most common path
  note: string;
};

export type MajorInfo = {
  name: string;
  teaches: string;
  connection: string;
  alternatives: string[];
};

// Reach / Target / Safety per the reference report. These are indicative
// bands, not predictions: the caveat travels with them in Sources.
export type CollegeStatus = "Reach" | "Target" | "Safety";

export type CollegeEntry = {
  name: string;
  location: string;
  control: "Public" | "Private";
  length: "2-year" | "4-year" | "Flight school" | "Program";
  program: string;
  cost: string; // in-state / typical, plainly labeled
  outcome: string | null;
  requirements: string;
  why: string; // why it is on this list, in the student's terms
  status: CollegeStatus;
};

// ---- Top 3 comparison (report section 3) ----
// Transparent labels only. "Evidence" describes what the student did, never a
// score: "Strong interest" is earned by activity, not computed from a model.

export type EvidenceStrength = "Strong interest" | "Needs more exploration" | "Just saved";

export type ComparisonRow = {
  careerId: string;
  work: string;
  setting: string;
  education: string;
  timeToEnter: string;
  costBand: "Low" | "Medium" | "High";
  costNote: string;
  salaryRange: string;
  outlook: string;
  majors: string[];
  tradeoff: string;
  whySaved: string;
  evidence: EvidenceStrength;
  investigate: string;
};

// ---- Action plan (report section 9) ----

export type ReportAction = {
  id: string;
  label: string;
  reason: string; // why this, for this student
  due: string | null;
  href: string;
  destination: string; // where it takes you, in words
};

// ---- The report object ----

export type CareerReportV2 = {
  glance: CareerGlance;
  salary: SalaryBlock;
  education: EducationRoute[];
  majors: MajorInfo[];
  colleges: CollegeEntry[];
  comparison: ComparisonRow;
  actions: ReportAction[];
  sources: Source[];
};

const bls = (label: string, year: string, url: string): Source => ({ label, org: "U.S. Bureau of Labor Statistics", year, verified: "August 2026", url });

export const CAREER_REPORTS_V2: Record<string, CareerReportV2> = {
  "investment-banking": {
    glance: {
      simple: "Investment bankers help companies raise money and buy or sell businesses.",
      example: "A hospital company wants to build 100 new hospitals but does not have the money. An investment bank finds investors and puts the deal together.",
      whatYouDo: "Analyze companies and build the math behind big deals.",
      responsibilities: [
        "Build financial models in Excel",
        "Research companies and industries",
        "Put together pitch decks for clients",
        "Support live deals like mergers and IPOs",
        "Check the numbers until they are airtight",
        "Present what you found to senior bankers",
      ],
      environment: "Office based, usually in a big city. Small deal teams, a lot of screen time.",
      schedule: "Long hours are normal, especially when a deal is closing. Weekend work happens.",
      skills: ["Working with numbers", "Attention to detail", "Writing clearly", "Staying calm under deadline"],
      industries: ["Investment banks", "Advisory firms", "Corporate finance teams", "Private credit"],
      employers: ["JPMorgan", "Goldman Sachs", "Evercore", "Regional and boutique banks"],
      education: "Bachelor's degree in finance or economics.",
      alternatives: ["Start at a regional bank and move up", "Two-year college, then transfer", "Any major plus finance internships"],
    },
    salary: {
      median: "$101,910",
      entry: "$85,000 to $120,000 in year one at most banks",
      experienced: "$150,000 to $250,000 after several years",
      geography: "New York pays well above the national number. Smaller cities pay less and cost less to live in.",
      variablePay: "Bonus is a big part of pay in this job and it changes year to year with the market.",
      outlook: "Faster than average",
      outlookDetail: "Employment of financial analysts is projected to grow faster than the average for all occupations.",
      source: bls("Financial analyst pay and outlook", "May 2024", "https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm"),
    },
    education: [
      { name: "Bachelor's degree in finance, economics or business", kind: "Degree", time: "4 years", prerequisites: "High school diploma, strong math", licensure: null, common: true, note: "Summer internships matter as much as the major." },
      { name: "Two-year college, then transfer", kind: "Degree", time: "2 + 2 years", prerequisites: "High school diploma", licensure: null, common: false, note: "Much cheaper start. Check the transfer agreement early." },
      { name: "Any major plus finance internships", kind: "Degree", time: "4 years", prerequisites: "High school diploma", licensure: null, common: false, note: "Banks hire non-finance majors who can show the skills." },
    ],
    majors: [
      { name: "Finance", teaches: "How money moves through companies and markets, and how to value a business.", connection: "The most direct line into banking work.", alternatives: ["Economics", "Accounting"] },
      { name: "Economics", teaches: "Why markets and people behave the way they do, with a lot of data work.", connection: "Banks hire heavily from economics for the analysis skills.", alternatives: ["Statistics", "Math"] },
      { name: "Accounting", teaches: "How to read and build financial statements properly.", connection: "Deal work runs on financial statements, so this transfers directly.", alternatives: ["Finance", "Business analytics"] },
    ],
    colleges: [
      { name: "Rutgers University", location: "New Brunswick, NJ", control: "Public", length: "4-year", program: "BS Finance", cost: "About $17K a year in-state tuition and fees", outcome: "84% graduate within 6 years", requirements: "Check the business school's separate admission step", why: "You saved it, and it has a big alumni network near New York.", status: "Target" },
      { name: "Baruch College (CUNY)", location: "New York, NY", control: "Public", length: "4-year", program: "BBA Finance", cost: "About $7K a year in-state tuition and fees", outcome: "72% graduate within 6 years", requirements: "Check the GPA and course requirements on the CUNY site", why: "Public price inside the city where a lot of this work happens.", status: "Safety" },
      { name: "Indiana University (Kelley)", location: "Bloomington, IN", control: "Public", length: "4-year", program: "BS Finance", cost: "About $12K in-state, about $41K out-of-state", outcome: "83% graduate within 6 years", requirements: "Direct admission to Kelley is competitive, check requirements", why: "Known for placing students into banking from a public school.", status: "Target" },
      { name: "New York University (Stern)", location: "New York, NY", control: "Private", length: "4-year", program: "BS Business, Finance concentration", cost: "About $62K a year tuition before aid", outcome: "87% graduate within 6 years", requirements: "Very competitive, check requirements and aid before assuming cost", why: "Often mentioned for finance. Worth a real conversation about cost and odds.", status: "Reach" },
    ],
    comparison: {
      careerId: "investment-banking",
      work: "Build the math behind company deals and pitch it to clients.",
      setting: "Office, big city, small deal teams",
      education: "Bachelor's degree, usually finance or economics",
      timeToEnter: "About 4 years",
      costBand: "Medium",
      costNote: "Low if in-state or transfer, high at a private school",
      salaryRange: "$85K to $120K starting",
      outlook: "Faster than average",
      majors: ["Finance", "Economics", "Accounting"],
      tradeoff: "The pay is real and so are the hours.",
      whySaved: "You finished the IB simulation twice and kept coming back to it.",
      evidence: "Strong interest",
      investigate: "What a normal week actually looks like in year one.",
    },
    actions: [
      { id: "ib-a1", label: "Compare the state school route against the private school route", reason: "Your two saved schools are about $45K a year apart.", due: "Before spring registration", href: "#pathway", destination: "My Pathway" },
      { id: "ib-a2", label: "Ask a working banker what their first year was really like", reason: "Hours are the trade-off you said you were unsure about.", due: null, href: "/explore", destination: "Connect" },
      { id: "ib-a3", label: "Take statistics next year if it fits your schedule", reason: "Every route on your list uses it early.", due: "Course selection", href: "#pathway", destination: "My Pathway" },
      { id: "ib-a4", label: "Look up whether Rutgers business has a separate application", reason: "Some business schools admit separately from the university.", due: null, href: "/colleges", destination: "College lookup" },
      { id: "ib-a5", label: "Bring this report to your next counselor meeting", reason: "You have three questions saved and no meeting booked yet.", due: null, href: "#report", destination: "Career Report" },
    ],
    sources: [
      bls("Financial analyst pay and outlook", "May 2024", "https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm"),
      { label: "College cost, size and graduation rates", org: "U.S. Dept. of Education, College Scorecard", year: "2024-25", verified: "August 2026", url: "https://collegescorecard.ed.gov/" },
      { label: "Occupation tasks and skills", org: "O*NET OnLine", year: "2025", verified: "August 2026", url: "https://www.onetonline.org/" },
    ],
  },

  "airline-pilot": {
    glance: {
      simple: "Airline pilots fly passengers and cargo safely from one airport to another.",
      example: "A plane in Phoenix needs to be in Chicago by 6pm with 180 people on it. The crew plans the fuel, the route and the weather, then flies it.",
      whatYouDo: "Fly the aircraft and manage every stage of the flight.",
      responsibilities: [
        "Run pre-flight checks and build the flight plan",
        "Fly the route as part of a two-pilot crew",
        "Make calls on weather, fuel and delays",
        "Talk with air traffic control the whole way",
        "Log flight hours toward bigger aircraft",
        "Retrain and re-certify every year",
      ],
      environment: "A cockpit, plus airports and hotels. You are away from home a lot early on.",
      schedule: "Schedules are built from seniority. Nights, weekends and holidays are normal at first.",
      skills: ["Staying calm under pressure", "Following procedure exactly", "Quick decisions", "Clear radio communication"],
      industries: ["Passenger airlines", "Cargo carriers", "Charter operators", "Flight schools"],
      employers: ["SkyWest", "Republic Airways", "UPS Airlines", "Regional carriers hiring at 1,500 hours"],
      education: "FAA licenses and 1,500 flight hours.",
      alternatives: ["Aviation university with an R-ATP at 1,000 hours", "Military flight training", "Train part time while working"],
    },
    salary: {
      median: "$226,600",
      entry: "$60,000 to $100,000 at a regional airline",
      experienced: "$250,000 and up as a captain at a major airline",
      geography: "Pay follows the airline and your seniority, not the city you live in. Many pilots commute to their base.",
      variablePay: "Per diem and profit sharing add to base pay at most airlines.",
      outlook: "Faster than average",
      outlookDetail: "Employment of airline and commercial pilots is projected to grow faster than the average for all occupations.",
      source: bls("Airline and commercial pilot pay and outlook", "May 2024", "https://www.bls.gov/ooh/transportation-and-material-moving/airline-and-commercial-pilots.htm"),
    },
    education: [
      { name: "Flight school to a commercial license, then build hours", kind: "Training", time: "1.5 to 2 years, then hour building", prerequisites: "17+, medical certificate, English proficiency", licensure: "FAA Commercial Pilot certificate, then ATP at 1,500 hours", common: true, note: "Most people instruct to build the hours and get paid doing it." },
      { name: "Aviation university degree", kind: "Degree", time: "4 years", prerequisites: "High school diploma, medical certificate", licensure: "R-ATP at 1,000 hours instead of 1,500", common: false, note: "Costs more, but you reach the airlines with fewer hours." },
      { name: "Military flight training", kind: "Military", time: "8 to 10 year commitment", prerequisites: "Officer selection, very competitive", licensure: "Military wings, then civilian conversion", common: false, note: "No training debt. The commitment is the trade." },
    ],
    majors: [
      { name: "Aeronautical Science", teaches: "Flying, aircraft systems, weather and air law, with flight training built in.", connection: "It is the degree wrapped around the licenses you need anyway.", alternatives: ["Professional Flight", "Aviation Management"] },
      { name: "Aviation Management", teaches: "How airports, airlines and operations are run.", connection: "Backup ground career if a medical issue ever stops you flying.", alternatives: ["Business", "Logistics"] },
      { name: "Any major plus flight training", teaches: "Whatever you are good at, alongside training at a local school.", connection: "Airlines care about your certificates and hours, not your major.", alternatives: ["Engineering", "Business"] },
    ],
    colleges: [
      { name: "University of North Dakota", location: "Grand Forks, ND", control: "Public", length: "4-year", program: "BS Commercial Aviation", cost: "About $10K a year in-state tuition, flight fees are extra", outcome: "60% graduate within 6 years", requirements: "Check flight program admission separately from the university", why: "One of the biggest aviation programs, and cheaper than most.", status: "Target" },
      { name: "ATP Flight School", location: "Multiple locations", control: "Private", length: "Flight school", program: "Airline career pilot program", cost: "About $115K for the full program", outcome: "Publishes time-to-airline data", requirements: "Medical certificate and a financing plan", why: "Fastest structured route if you do not want a degree first.", status: "Safety" },
      { name: "Embry-Riddle Aeronautical University", location: "Daytona Beach, FL", control: "Private", length: "4-year", program: "BS Aeronautical Science", cost: "About $42K a year tuition, flight fees are extra", outcome: "62% graduate within 6 years", requirements: "Check requirements and total flight cost, not just tuition", why: "The best known name in aviation degrees. Confirm the real total cost.", status: "Reach" },
      { name: "Local Part 141 academy", location: "Near you", control: "Private", length: "Program", program: "Commercial certificate", cost: "$85K to $110K depending on hours flown", outcome: null, requirements: "Discovery flight and a medical certificate first", why: "You can start this one while still in high school.", status: "Target" },
    ],
    comparison: {
      careerId: "airline-pilot",
      work: "Fly passengers or cargo as part of a two-pilot crew.",
      setting: "Cockpit, away from home often",
      education: "FAA licenses and 1,500 flight hours",
      timeToEnter: "2 to 4 years to a first flying job",
      costBand: "High",
      costNote: "Training is the cost, not tuition, unless you go military",
      salaryRange: "$60K to $100K at a regional",
      outlook: "Faster than average",
      majors: ["Aeronautical Science", "Aviation Management", "Any major plus training"],
      tradeoff: "Big training bill up front, then pay climbs fast.",
      whySaved: "You watched the pilot day-in-the-life three times and passed the scenario first try.",
      evidence: "Strong interest",
      investigate: "How much a first-class medical certificate depends on your health history.",
    },
    actions: [
      { id: "pl-a1", label: "Book a discovery flight near you", reason: "It is about $150 and it answers the question no video can.", due: null, href: "/explore", destination: "Connect" },
      { id: "pl-a2", label: "Read what a first-class medical certificate requires", reason: "It gates every route on this list, so check it before spending money.", due: "Before committing", href: "/explore", destination: "Explore" },
      { id: "pl-a3", label: "Compare the flight school route against the aviation degree route", reason: "They differ by about $110K and by 500 flight hours.", due: null, href: "#pathway", destination: "My Pathway" },
      { id: "pl-a4", label: "Ask about financing before you enroll anywhere", reason: "Flight training does not use normal federal student aid the same way.", due: null, href: "#report", destination: "Questions for my counselor" },
    ],
    sources: [
      bls("Airline and commercial pilot pay and outlook", "May 2024", "https://www.bls.gov/ooh/transportation-and-material-moving/airline-and-commercial-pilots.htm"),
      { label: "Pilot certification and hour requirements", org: "Federal Aviation Administration", year: "2025", verified: "August 2026", url: "https://www.faa.gov/pilots" },
      { label: "College cost and graduation rates", org: "U.S. Dept. of Education, College Scorecard", year: "2024-25", verified: "August 2026", url: "https://collegescorecard.ed.gov/" },
    ],
  },

  "private-equity": {
    glance: {
      simple: "Private equity firms buy companies, try to make them better, and sell them later for more.",
      example: "A firm buys a chain of 40 car washes, fixes how they are run, opens 20 more, and sells the whole thing five years later.",
      whatYouDo: "Buy companies and help make them worth more.",
      responsibilities: [
        "Screen companies that might be worth buying",
        "Model what a company could look like in five years",
        "Meet founders and management teams",
        "Support a deal from first offer to closing",
        "Track how companies in the portfolio are doing",
        "Present to the investment committee",
      ],
      environment: "Small offices and small teams. Fewer people than a bank, more ownership of your work.",
      schedule: "Hours are long during a live deal and calmer between them.",
      skills: ["Judgment about businesses", "Modeling and analysis", "Asking good questions", "Patience"],
      industries: ["Private equity firms", "Growth equity funds", "Family offices", "Search funds"],
      employers: ["Blackstone", "KKR", "Middle-market and regional funds"],
      education: "Bachelor's degree, then two years in banking.",
      alternatives: ["Consulting first, then move over", "State school plus strong internships", "Work in an industry, then join a fund that buys in it"],
    },
    salary: {
      median: "$101,910",
      entry: "$100,000 to $150,000 as a first-year associate",
      experienced: "$150,000 to $300,000 and up with carried interest",
      geography: "Concentrated in a few cities. Fund size moves pay more than geography does.",
      variablePay: "Bonus and carried interest are a large share of total pay, and carry only pays out if deals work.",
      outlook: "Faster than average",
      outlookDetail: "The BLS does not track private equity separately. The closest official occupation is financial analysts, which is projected to grow faster than average.",
      source: bls("Financial analyst pay and outlook (closest tracked occupation)", "May 2024", "https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm"),
    },
    education: [
      { name: "Bachelor's degree, then two years in banking", kind: "Degree", time: "4 years plus 2", prerequisites: "High school diploma, strong math", licensure: null, common: true, note: "Almost nobody joins a fund straight out of school." },
      { name: "Consulting first, then private equity", kind: "Degree", time: "4 years plus 2 to 3", prerequisites: "High school diploma", licensure: null, common: false, note: "Operations-focused funds like this background." },
      { name: "Two-year college, transfer, then internships", kind: "Degree", time: "2 + 2 years", prerequisites: "High school diploma", licensure: null, common: false, note: "Harder route into this field, but it has been done." },
    ],
    majors: [
      { name: "Finance", teaches: "Valuing companies and understanding how deals are financed.", connection: "The core skill the job tests you on.", alternatives: ["Economics", "Accounting"] },
      { name: "Economics", teaches: "How industries and incentives work, with heavy data analysis.", connection: "Useful for judging whether a business can actually grow.", alternatives: ["Statistics", "Finance"] },
      { name: "Business Administration", teaches: "How companies operate day to day across functions.", connection: "Funds that fix operations value this view.", alternatives: ["Industrial engineering", "Management"] },
    ],
    colleges: [
      { name: "Indiana University (Kelley)", location: "Bloomington, IN", control: "Public", length: "4-year", program: "BS Finance, investment banking workshop", cost: "About $12K in-state, about $41K out-of-state", outcome: "83% graduate within 6 years", requirements: "Workshop application is separate and competitive", why: "The banking workshop is the usual on-ramp to this path.", status: "Target" },
      { name: "University of Virginia (McIntire)", location: "Charlottesville, VA", control: "Public", length: "4-year", program: "BS Commerce, finance track", cost: "About $22K in-state, about $60K out-of-state", outcome: "94% graduate within 6 years", requirements: "You apply to McIntire after your second year", why: "Small program with strong finance placement.", status: "Target" },
      { name: "Baruch College (CUNY)", location: "New York, NY", control: "Public", length: "4-year", program: "BBA Finance", cost: "About $7K a year in-state tuition and fees", outcome: "72% graduate within 6 years", requirements: "Check GPA and course requirements", why: "Lowest-cost way to be in the city where the internships are.", status: "Safety" },
    ],
    comparison: {
      careerId: "private-equity",
      work: "Buy companies, improve them, and sell them later.",
      setting: "Small office teams, a few cities",
      education: "Bachelor's degree, then two years in banking",
      timeToEnter: "About 6 years",
      costBand: "Medium",
      costNote: "Same degree cost as banking, plus a longer wait to arrive",
      salaryRange: "$100K to $150K as an associate",
      outlook: "Faster than average",
      majors: ["Finance", "Economics", "Business Administration"],
      tradeoff: "Highest ceiling on your list, and the longest path to reach it.",
      whySaved: "You read the PE breakdown twice and liked the strategy side.",
      evidence: "Needs more exploration",
      investigate: "Whether you would enjoy the two years of banking this route runs through.",
    },
    actions: [
      { id: "pe-a1", label: "Learn what carried interest actually is", reason: "It is most of the pay people quote for this job.", due: null, href: "/match-lab", destination: "Glossary" },
      { id: "pe-a2", label: "Compare this against investment banking properly", reason: "They share the first six years, so the real choice comes later.", due: null, href: "#report", destination: "Top 3 comparison" },
      { id: "pe-a3", label: "Look for a school with an investment fund run by students", reason: "It is the closest thing to this work you can do before college.", due: null, href: "/colleges", destination: "College lookup" },
    ],
    sources: [
      bls("Financial analyst pay and outlook (closest tracked occupation)", "May 2024", "https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm"),
      { label: "College cost and graduation rates", org: "U.S. Dept. of Education, College Scorecard", year: "2024-25", verified: "August 2026", url: "https://collegescorecard.ed.gov/" },
    ],
  },

  "software-engineer": {
    glance: {
      simple: "Software engineers build and improve the apps and systems people use every day.",
      example: "The app you use to track a delivery was designed, built and fixed by a team of software engineers.",
      whatYouDo: "Design, build and test software applications.",
      responsibilities: [
        "Build new software features",
        "Write and test code",
        "Fix bugs and technical problems",
        "Design how software systems should work",
        "Review teammates' code",
        "Work with designers, product managers and other engineers",
      ],
      environment: "Mix of deep focus and team collaboration. Many roles are hybrid or remote.",
      schedule: "Mostly regular weekday hours, with busier stretches near a release.",
      skills: ["Problem solving", "Logical thinking", "Reading other people's code", "Explaining technical things simply"],
      industries: ["Tech", "Finance", "Healthcare", "Entertainment", "Government"],
      employers: ["Google", "Oracle", "Epic Systems", "Almost any company with a product online"],
      education: "Bachelor's degree in CS or a related field.",
      alternatives: ["Two-year college then transfer", "Apprenticeship", "Technical training plus a portfolio"],
    },
    salary: {
      median: "$133,080",
      entry: "$75,000 to $100,000",
      experienced: "$150,000 to $200,000 and up",
      geography: "The Bay Area and Seattle pay well above the national number, and cost much more to live in.",
      variablePay: "Larger companies often include stock, which can be a real part of total pay.",
      outlook: "Much faster than average",
      outlookDetail: "Employment of software developers is projected to grow much faster than the average for all occupations.",
      source: bls("Software developer pay and outlook", "May 2024", "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm"),
    },
    education: [
      { name: "Bachelor's degree in computer science or software engineering", kind: "Degree", time: "4 years", prerequisites: "High school diploma, math through pre-calculus helps", licensure: null, common: true, note: "Internships matter more than your exact school." },
      { name: "Two-year college, then transfer", kind: "Degree", time: "2 + 2 years", prerequisites: "High school diploma", licensure: null, common: false, note: "Common and much cheaper. Confirm the transfer agreement." },
      { name: "Apprenticeship", kind: "Apprenticeship", time: "1 to 2 years", prerequisites: "Some coding ability before you apply", licensure: null, common: false, note: "You get paid while training. Fewer spots exist." },
      { name: "Technical training plus a portfolio", kind: "Training", time: "6 to 12 months", prerequisites: "Self-motivation", licensure: null, common: false, note: "Works when your projects are genuinely good. Harder market than it used to be." },
    ],
    majors: [
      { name: "Computer Science", teaches: "How computers solve problems: algorithms, data, systems and theory.", connection: "The standard degree for this work and the widest set of doors.", alternatives: ["Software Engineering", "Math"] },
      { name: "Software Engineering", teaches: "How to build and ship large software as a team.", connection: "More practical and project-based than CS.", alternatives: ["Computer Science", "Information Systems"] },
      { name: "Computer Engineering", teaches: "Where hardware and software meet.", connection: "Good if you like devices as much as apps.", alternatives: ["Electrical Engineering", "Computer Science"] },
    ],
    colleges: [
      { name: "Carnegie Mellon", location: "Pittsburgh, PA", control: "Private", length: "4-year", program: "BS Computer Science", cost: "About $65K a year tuition before aid", outcome: "93% graduate within 6 years", requirements: "Extremely competitive", why: "World-renowned theoretical and applied computing.", status: "Reach" },
      { name: "Georgia Tech", location: "Atlanta, GA", control: "Public", length: "4-year", program: "BS Computer Science", cost: "About $12K a year in-state tuition and fees", outcome: "92% graduate within 6 years", requirements: "Competitive for CS", why: "Top-tier public university with a thriving tech ecosystem.", status: "Reach" },
      { name: "University of Washington", location: "Seattle, WA", control: "Public", length: "4-year", program: "BS Computer Science", cost: "About $13K a year in-state tuition and fees", outcome: "84% graduate within 6 years", requirements: "CS admission is separate and competitive", why: "Strong ties to major tech companies.", status: "Target" },
      { name: "Rutgers University", location: "New Brunswick, NJ", control: "Public", length: "4-year", program: "BS Computer Science", cost: "About $17K a year in-state tuition and fees", outcome: "84% graduate within 6 years", requirements: "Check requirements", why: "Strong regional network and accessible entry point.", status: "Target" },
      { name: "San Jose State University", location: "San Jose, CA", control: "Public", length: "4-year", program: "BS Software Engineering", cost: "About $8K a year in-state tuition and fees", outcome: "68% graduate within 6 years", requirements: "Check impacted-major requirements", why: "In Silicon Valley at a public price.", status: "Safety" },
      { name: "UMass Lowell", location: "Lowell, MA", control: "Public", length: "4-year", program: "BS Computer Science", cost: "About $16K a year in-state tuition and fees", outcome: "68% graduate within 6 years", requirements: "Check requirements for the co-op program", why: "Co-op program means paid work experience before you graduate.", status: "Target" },
      { name: "Carnegie Mellon University", location: "Pittsburgh, PA", control: "Private", length: "4-year", program: "BS Computer Science", cost: "About $65K a year tuition before aid", outcome: "93% graduate within 6 years", requirements: "Extremely competitive, check requirements and aid", why: "Well known for computing. Worth discussing cost and odds honestly.", status: "Reach" },
    ],
    comparison: {
      careerId: "software-engineer",
      work: "Design, build and test the software people use.",
      setting: "Hybrid or remote, team based",
      education: "Bachelor's degree, or a portfolio route",
      timeToEnter: "2 to 4 years",
      costBand: "Medium",
      costNote: "Low through transfer or apprenticeship, high at a private school",
      salaryRange: "$75K to $100K starting",
      outlook: "Much faster than average",
      majors: ["Computer Science", "Software Engineering", "Computer Engineering"],
      tradeoff: "You have to keep learning after you are hired.",
      whySaved: "You passed the debugging scenario and saved it from the Browse rail.",
      evidence: "Needs more exploration",
      investigate: "Whether you like building things enough to do it all day.",
    },
    actions: [
      { id: "se-a1", label: "Build one small thing and finish it", reason: "A finished project tells you more than another tutorial.", due: null, href: "/match-lab", destination: "Play" },
      { id: "se-a2", label: "Look up the transfer agreement at your local two-year college", reason: "It is the cheapest version of this path by a wide margin.", due: null, href: "/colleges", destination: "College lookup" },
      { id: "se-a3", label: "Take a computer science class next year if one is offered", reason: "It confirms interest before you commit a degree to it.", due: "Course selection", href: "#pathway", destination: "My Pathway" },
    ],
    sources: [
      bls("Software developer pay and outlook", "May 2024", "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm"),
      { label: "College cost and graduation rates", org: "U.S. Dept. of Education, College Scorecard", year: "2024-25", verified: "August 2026", url: "https://collegescorecard.ed.gov/" },
      { label: "Occupation tasks and skills", org: "O*NET OnLine", year: "2025", verified: "August 2026", url: "https://www.onetonline.org/" },
    ],
  },
};

export const reportV2 = (careerId: string): CareerReportV2 | undefined => CAREER_REPORTS_V2[careerId];

// ---- The student's own words and inputs ----
// Everything here is authored or confirmed by the student. Nothing in this
// block is inferred, which is what makes it safe to print in a report and
// safe to show back for correction.

export type StudentDirection = {
  exploring: string;
  goal: string;
  question: string; // the decision they are working through
  reflection: string; // student-authored, editable
  interests: string[];
  strengths: string[];
  values: string[];
};

export const STUDENT_DIRECTION: StudentDirection = {
  exploring: "Finance careers, and flying, which is the odd one out",
  goal: "Work out whether I want a finance degree or flight training after high school",
  question: "Is the pay in banking worth the hours, and can I afford flight training if it is not?",
  reflection:
    "I like the parts of finance where you figure out what a company is actually worth. I did not expect to like the pilot stuff as much as I did. I want to know what a normal week looks like in both before I pick a direction, because right now I am choosing based on how they look, not how they feel.",
  interests: ["Money and markets", "How companies work", "Aviation", "Competition"],
  strengths: ["Math", "Staying calm under pressure", "Explaining things clearly"],
  values: ["Being paid well", "Not being stuck at a desk forever", "Not starting out in debt"],
};

export type EvidenceKind = "interest" | "activity" | "saved" | "simulation" | "reflection" | "question" | "strength" | "experience";

export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  label: string;
  detail: string;
  when: string;
  careerId?: string;
  confirmed: boolean; // the student has confirmed this is right
};

export const EVIDENCE_KIND_LABEL: Record<EvidenceKind, string> = {
  interest: "Interest you chose",
  activity: "Activity you finished",
  saved: "Career you saved",
  simulation: "Simulation you played",
  reflection: "Something you wrote",
  question: "Question you asked",
  strength: "Strength you confirmed",
  experience: "Experience you added",
};

export const EVIDENCE: EvidenceItem[] = [
  { id: "ev-1", kind: "interest", label: "Money and markets", detail: "You picked this during Build.", when: "Mar 2026", confirmed: true },
  { id: "ev-2", kind: "interest", label: "Aviation", detail: "You added this after the Daily Drop about regional airlines.", when: "Jun 2026", confirmed: true },
  { id: "ev-3", kind: "simulation", label: "Investment Banking simulation, finished twice", detail: "Second run scored higher than the first.", when: "Jul 2026", careerId: "investment-banking", confirmed: true },
  { id: "ev-4", kind: "activity", label: "Finance glossary, level 4", detail: "24 terms learned, last played 5 days ago.", when: "Aug 2026", careerId: "investment-banking", confirmed: true },
  { id: "ev-5", kind: "simulation", label: "Pilot decision scenario, passed first try", detail: "Weather diversion scenario.", when: "Jul 2026", careerId: "airline-pilot", confirmed: true },
  { id: "ev-6", kind: "saved", label: "3 careers saved from Browse", detail: "Investment Banking, Private Equity, Asset Management.", when: "Jun 2026", confirmed: true },
  { id: "ev-7", kind: "question", label: "What does an analyst actually do all day?", detail: "Answered by a verified banker in Connect.", when: "Aug 2026", careerId: "investment-banking", confirmed: true },
  { id: "ev-8", kind: "strength", label: "Math", detail: "You confirmed this. Your school has not shared course grades.", when: "Mar 2026", confirmed: true },
  { id: "ev-9", kind: "experience", label: "Summer job, grocery store, 2 summers", detail: "You added this to your resume draft.", when: "Aug 2026", confirmed: false },
  { id: "ev-10", kind: "reflection", label: "Why I saved Airline Pilot", detail: "\"It is the only one I looked up on my own time.\"", when: "Aug 2026", careerId: "airline-pilot", confirmed: true },
];

// School-verified academic data. Rendered only when verified is true, and
// always with its source and date (FERPA: this is an education record).
export const ACADEMIC_RECORD = {
  gpa: "3.7",
  scale: "4.0 unweighted",
  verified: true,
  source: "Westfield High School",
  updated: "June 2026",
};

// Courses and experiences to consider, per career. Fixture content.
export const COURSE_SUGGESTIONS: Record<string, { label: string; why: string }[]> = {
  "investment-banking": [
    { label: "Statistics", why: "Every route on your list uses it in year one." },
    { label: "Economics", why: "Gives you the vocabulary before college does." },
    { label: "A part-time job handling money", why: "Counts as real experience on a resume." },
  ],
  "airline-pilot": [
    { label: "Physics", why: "Makes ground school much easier later." },
    { label: "Discovery flight", why: "The cheapest way to test this for real." },
    { label: "Aviation club or Civil Air Patrol", why: "Cockpit time and people who already fly." },
  ],
  "private-equity": [
    { label: "Statistics", why: "The analysis side of this job runs on it." },
    { label: "Accounting, if offered", why: "You will read financial statements constantly." },
    { label: "Student investment club", why: "Closest thing to the work before college." },
  ],
  "software-engineer": [
    { label: "Computer science", why: "Confirms the interest before you commit a degree." },
    { label: "Math through pre-calculus", why: "Most CS programs expect it." },
    { label: "One finished personal project", why: "Worth more than a certificate." },
  ],
};

export const UPCOMING: { label: string; when: string; note: string }[] = [
  { label: "Course selection opens", when: "Oct 2026", note: "Locks in next year's classes." },
  { label: "Counselor meeting", when: "Not booked", note: "Bring this report." },
  { label: "FAFSA opens", when: "Oct 1, 2026", note: "Applies to college routes, not flight school." },
];
