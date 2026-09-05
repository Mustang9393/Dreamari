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
    id: "data-scientist",
    title: "Data Scientist",
    world: "Tech & Engineering",
    color: "var(--color-world-tech-engineering-design)",
    font: '"Science Gothic", sans-serif',
    fontWeight: 700,
    letterSpacing: "-0.05em",
    salary: "$120K median",
    employers: "Google · Meta · almost every industry",
    hook: "Turn messy data into models and dashboards that help a company decide what to build next and who to show it to.",
    classes: "Statistics, Computer Science, Algebra II, AP Calculus, Data Science",
    skills: "Statistical Modeling, Python/R Programming, Data Visualization, Machine Learning Basics, Clear Communication of Findings",
    workStyle: "Deep Focus · Small Analytics Team · Project-Based Sprints",
    pathway: "4-Year Bachelor's in Statistics/CS/Data Science, sometimes a Master's",
    tradeoff: "The tools change fast, and so does what counts as a modern skill set.",
    photo: "/images/app/poster-data-scientist.png",
  },
  {
    id: "fashion-buyer",
    title: "Fashion Buyer",
    world: "Business & Money",
    color: "var(--color-world-business-money-office)",
    font: '"Viaoda Libre", serif',
    fontWeight: 400,
    salary: "$78K median",
    employers: "Nordstrom · Macy's · independent boutiques",
    hook: "Decide which styles a store buys next season, negotiate with vendors, and read sales data to predict what will sell.",
    classes: "Business Math, Statistics, Art/Design, Economics, Marketing",
    skills: "Trend Forecasting, Vendor Negotiation, Sales Data Analysis, Budget Management, Visual Merchandising",
    workStyle: "Fast Pace · Small Buying Team · Seasonal Deadlines",
    pathway: "4-Year Bachelor's in Fashion Merchandising, Business, or a related field",
    tradeoff: "You shape what people wear, and the seasons never really stop.",
    photo: "/images/app/poster-fashion-buyer.png",
  },
  {
    id: "game-designer",
    title: "Game Designer",
    world: "Tech & Engineering",
    color: "var(--color-world-tech-engineering-design)",
    font: '"Science Gothic", sans-serif',
    fontWeight: 700,
    letterSpacing: "-0.05em",
    salary: "$98K median",
    employers: "Riot Games · EA · independent studios",
    hook: "Design the rules, levels, and systems that make a game fun, then playtest and rework them until they click.",
    classes: "Computer Science, Art/Design, Physics, Creative Writing, Statistics",
    skills: "Systems Design, Prototyping, Playtesting, Basic Scripting, Collaborative Feedback",
    workStyle: "Creative Bursts · Cross-Functional Team · Iterate and Playtest",
    pathway: "4-Year Degree in Game Design/CS, or a strong self-made portfolio",
    tradeoff: "Making games is real work, even when the subject is play.",
    photo: "/images/app/poster-game-designer.png",
  },
];

/** The taxonomy's total, for the header badge. */
export const TOTAL_PATHS = 322;
export const MAX_SLOTS = 3;
