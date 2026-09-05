// v3 match-flow deck — careers and copy from the user's wireframe
// (Downloads/MATCH FLOW.html), cleaned of cite artifacts and emoji glyphs
// (icons are Lucide in the UI, not characters in the data). Poster art is the
// design system's own Browse Card imagery; each world carries its Career
// Poster Card face and world token, exactly like the Explore rail.
//
// IDS ARE THE SHARED CATALOGUE IDS. A card's id is the same string the profile
// (PROFILE_CAREERS / LOCKER_EXTRAS) and the reports (CAREER_REPORTS_V2) use, so
// whatever a student swipes right on resolves to a real report, a real pathway
// and a real plan. Adding a card means adding that career to all three, not
// inventing a new id here — the deck used to carry its own "FIN-001" scheme and
// nothing downstream could find the career again.

export type Career = {
  id: string;
  title: string;
  world: string;
  /** world accent — always a --color-world-* token */
  color: string;
  /** the world's Career Poster Card title face (loaded via the shared font stylesheet) */
  font: string;
  fontWeight: number;
  letterSpacing?: string;
  salary: string;
  employers: string;
  hook: string;
  classes: string;
  skills: string;
  workStyle: string;
  pathway: string;
  /** Future Tradeoff sub-card — PROTOTYPE copy drafted for the lab (the
   * wireframe had no tradeoff lines); replace with vetted taxonomy copy. */
  tradeoff: string;
  photo: string;
};

export const DECK: Career[] = [
  {
    id: "investment-banking",
    title: "Investment Banker",
    world: "Business & Money",
    color: "var(--color-world-business-money-office)",
    font: '"Viaoda Libre", serif',
    fontWeight: 400,
    salary: "$361K median",
    employers: "JPMorgan Chase · Goldman Sachs",
    hook: "Build financial deal models, evaluate corporate mergers, structure capital raising, and pitch decks to executive clients.",
    classes: "High School Algebra, AP Statistics, Economics, Business Math, Macroeconomics",
    skills: "Financial Analysis, Valuation Modeling, Quantitative Reasoning, Client Negotiation, Presentation Design",
    workStyle: "Fast Pace · Large Deal Crew · High Stakes Project Sprints",
    pathway: "4-Year Bachelor's in Finance/Economics + Summer Analyst Pipeline",
    tradeoff: "The pay is real and so are the hours.",
    photo: "/images/app/poster-investment-banking-v3.png",
  },
  {
    id: "private-equity",
    title: "Private Equity Analyst",
    world: "Business & Money",
    color: "var(--color-world-business-money-office)",
    font: '"Viaoda Libre", serif',
    fontWeight: 400,
    salary: "$250K median",
    employers: "Blackstone · KKR · mid-market funds",
    hook: "Study companies a fund might buy, build the case for the price, and help run the business better once it is owned.",
    classes: "AP Statistics, Economics, Accounting, Business Math, Public Speaking",
    skills: "Company Analysis, Valuation Modeling, Market Research, Written Argument, Financial Diligence",
    workStyle: "Deep Focus · Very Small Team · Long Projects Over Fast Deals",
    pathway: "4-Year Bachelor's in Finance/Economics, usually after banking experience",
    tradeoff: "Fewer, deeper projects than banking, and far fewer seats.",
    photo: "/images/app/poster-private-equity.png",
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    world: "Tech & Engineering",
    color: "var(--color-world-tech-engineering-design)",
    font: '"Science Gothic", sans-serif',
    fontWeight: 700,
    letterSpacing: "-0.05em",
    salary: "$136K median",
    employers: "Microsoft · Spotify · almost every industry",
    hook: "Write and ship the code behind apps and systems, find out why things break, and make them faster and safer.",
    classes: "Computer Science, Algebra II, Geometry, Physics, Digital Media",
    skills: "Programming, Debugging, Systems Thinking, Version Control, Reading Other People's Code",
    workStyle: "Deep Focus · Small Squad · Review and Iterate",
    pathway: "4-Year CS Degree, or a Bootcamp plus a Portfolio",
    tradeoff: "You can enter without a degree, but you never stop learning.",
    photo: "/images/app/poster-software-engineer.png",
  },
  {
    id: "airline-pilot",
    title: "Airline Pilot",
    world: "Driving, Flying & Shipping",
    color: "var(--color-world-driving-flying-shipping)",
    font: '"Heebo", sans-serif',
    fontWeight: 700,
    letterSpacing: "0.04em",
    salary: "$110K – $200K",
    employers: "Delta · United · regional carriers",
    hook: "Plan the route, fuel and weather, fly the aircraft, and run every checklist with the crew from gate to gate.",
    classes: "Physics, Trigonometry, Geography, Earth Science, Communications",
    skills: "Instrument Flying, Weather Reading, Checklist Discipline, Crew Communication, Decision Making",
    workStyle: "Two-Person Flight Deck · Nights Away · Total Focus on Duty",
    pathway: "Flight School or Aviation Degree + 1,500 Logged Hours",
    tradeoff: "The view is unmatched, and you are away from home a lot.",
    photo: "/images/app/poster-airline-pilot-alt.png",
  },
  {
    id: "registered-nurse",
    title: "Registered Nurse",
    world: "Health & Medicine",
    color: "var(--color-world-health-medicine)",
    font: '"Nunito", sans-serif',
    fontWeight: 700,
    salary: "$65K – $95K",
    employers: "Hospitals · clinics · schools",
    hook: "Assess patients through the shift, give treatment and medication, and catch the small changes before they become emergencies.",
    classes: "AP Biology, Anatomy & Physiology, Chemistry, Psychology, Health Sciences",
    skills: "Patient Assessment, Pharmacology, Wound and IV Care, Charting, Calm Under Pressure",
    workStyle: "On Your Feet · Always a Team · Three Long Shifts a Week",
    pathway: "2-Year ADN or 4-Year BSN + the NCLEX-RN License",
    tradeoff: "You matter to someone every shift, and the shifts are long.",
    photo: "/images/app/poster-registered-nurse.png",
  },
  {
    id: "food-scientist",
    title: "Food Scientist",
    world: "Farming, Animals & Nature",
    color: "var(--color-world-farming-animals-nature)",
    font: '"Lora", serif',
    fontWeight: 700,
    salary: "$55K – $95K",
    employers: "PepsiCo · Nestlé · Church & Dwight",
    hook: "Formulate ingredient recipes, test flavor stability, improve product shelf-life, and ensure FDA health safety guidelines.",
    classes: "AP Chemistry, Biology, Food Nutrition, Statistics, Organic Chemistry",
    skills: "Chemical Sensory Analysis, Lab Equipment Calibration, Quality Assurance, Product Formulation",
    workStyle: "Steady & Calm · Small Research Team · Clean Lab Environment",
    pathway: "4-Year Bachelor's in Food Science, Chemistry, or Bio-Engineering",
    tradeoff: "Steady hours and real science — breakthroughs take patience.",
    photo: "/images/app/poster-food-scientist.png",
  },
];

/** The taxonomy's total, for the header badge. */
export const TOTAL_PATHS = 322;
export const MAX_SLOTS = 3;
