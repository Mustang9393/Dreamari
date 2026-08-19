// v3 match-flow deck — careers and copy from the user's wireframe
// (Downloads/MATCH FLOW.html), cleaned of cite artifacts and emoji glyphs
// (icons are Lucide in the UI, not characters in the data). Poster art is the
// design system's own Browse Card imagery; each world carries its Career
// Poster Card face and world token, exactly like the Explore rail.

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
    id: "FIN-001",
    title: "Investment Banker",
    world: "Business & Money",
    color: "var(--color-world-business-money-office)",
    font: '"Viaoda Libre", serif',
    fontWeight: 400,
    salary: "$100K – $160K",
    employers: "JPMorgan Chase · Goldman Sachs",
    hook: "Build financial deal models, evaluate corporate mergers, structure capital raising, and pitch decks to executive clients.",
    classes: "High School Algebra, AP Statistics, Economics, Business Math, Macroeconomics",
    skills: "Financial Analysis, Valuation Modeling, Quantitative Reasoning, Client Negotiation, Presentation Design",
    workStyle: "Fast Pace · Large Deal Crew · High Stakes Project Sprints",
    pathway: "4-Year Bachelor's in Finance/Economics + Summer Analyst Pipeline",
    tradeoff: "The pay is top-tier, but the hours can own your calendar.",
    photo: "/images/career-investment-banking-2.jpg",
  },
  {
    id: "TECH-002",
    title: "Video Game Designer",
    world: "Tech & Engineering",
    color: "var(--color-world-tech-engineering-design)",
    font: '"Science Gothic", sans-serif',
    fontWeight: 700,
    letterSpacing: "-0.05em",
    salary: "$85K – $135K",
    employers: "Epic Games · Riot · Nintendo",
    hook: "Design player mechanics, balance character capabilities, script storyline encounters, and test level prototypes.",
    classes: "Computer Science, Geometry, Creative Writing, Digital Media Arts, Physics",
    skills: "Game Engine Scripting (Unity/Unreal), Level Design, UX Flow, Rapid Prototyping, Systems Balancing",
    workStyle: "Creative Focus · Small Agile Squad · Iterative Sprints",
    pathway: "2–4 Years Game Design/CompSci or Direct Portfolio Track",
    tradeoff: "You build worlds people love, but crunch seasons are real.",
    photo: "/images/matchflow/mf-video-game-designer.png",
  },
  {
    id: "SCI-003",
    title: "Food Scientist",
    world: "Farming, Animals & Nature",
    color: "var(--color-world-farming-animals-nature)",
    font: '"Lora", serif',
    fontWeight: 700,
    salary: "$72K – $115K",
    employers: "Pepsico · Beyond Meat · Kraft",
    hook: "Formulate ingredient recipes, test flavor stability, improve product shelf-life, and ensure FDA health safety guidelines.",
    classes: "AP Chemistry, Biology, Food Nutrition, Statistics, Organic Chemistry",
    skills: "Chemical Sensory Analysis, Lab Equipment Calibration, Quality Assurance, Product Formulation",
    workStyle: "Steady & Calm · Small Research Team · Clean Lab Environment",
    pathway: "4-Year Bachelor's in Food Science, Chemistry, or Bio-Engineering",
    tradeoff: "Steady, meaningful work — breakthroughs take patience.",
    photo: "/images/matchflow/mf-food-scientist-poster.png",
  },
  {
    id: "DES-004",
    title: "Footwear Designer",
    world: "Arts, Media & Sport",
    color: "var(--color-world-arts-media-sport)",
    font: '"Fraunces", serif',
    fontWeight: 700,
    salary: "$78K – $130K",
    employers: "Nike · Adidas · New Balance",
    hook: "Sketch silhouette concepts, select functional polymers and fabrics, review factory mold samples, and collaborate with athletes.",
    classes: "Studio Art, 3D Industrial Design, Graphic Design, Geometry, Materials Science",
    skills: "Concept Sketching, CAD Modeling, Color Theory, Ergonomic Testing, Trend Forecasting",
    workStyle: "Creative & Hands-On · Collaborative Studio · Studio Vibe",
    pathway: "4-Year BFA in Industrial Design, Product Design, or Fashion",
    tradeoff: "Your ideas ship worldwide, but trends move fast and so must you.",
    // Stand-in: Figma Section 2 has no footwear poster; this is the Fashion
    // Designer studio image (same world) until a footwear one is generated.
    photo: "/images/matchflow/mf-footwear-designer-poster.png",
  },
  {
    id: "HLTH-005",
    title: "Flight Nurse",
    world: "Health & Medicine",
    color: "var(--color-world-health-medicine)",
    font: '"Nunito", sans-serif',
    fontWeight: 700,
    salary: "$90K – $145K",
    employers: "Air Medical · Trauma Units",
    hook: "Administer critical ICU medication, manage airborne patient telemetry, and perform emergency procedures in transit.",
    classes: "AP Biology, Anatomy & Physiology, Chemistry, Psychology, Health Sciences",
    skills: "Emergency Triage, Airway Management, Critical Pharmacology, Rapid Decision Making Under Pressure",
    workStyle: "High Stakes · Ultra-Tight Crew (Pilot + Medic) · Dynamic Horizon",
    pathway: "BSN Nursing Degree + 3–5 Yrs ICU/ER Experience + CFRN Certification",
    tradeoff: "Every shift matters, and the intensity is not for everyone.",
    photo: "/images/trending/trending-nurse.png",
  },
  {
    id: "AV-006",
    title: "Aviation Maintenance Tech",
    world: "Building & Construction",
    color: "var(--color-world-building-construction)",
    font: '"Heebo", sans-serif',
    fontWeight: 700,
    letterSpacing: "0.04em",
    salary: "$75K – $120K",
    employers: "Delta · Boeing · NASA",
    hook: "Inspect jet turbines, troubleshoot flight avionics, replace hydraulic lines, and certify FAA airworthiness logs.",
    classes: "Physics, Shop Class / Vocational Tech, Applied Mathematics, Electronics",
    skills: "Turbine Diagnostic Testing, Electrical Schematics, Mechanical Repair, Precision Measurement",
    workStyle: "Solo & Squad Tasks · Hangar Environment · High Attention to Detail",
    pathway: "~2-Year FAA-Approved Part 147 School / Airframe & Powerplant (A&P) License",
    // Closest trade imagery in the design system's browse set (no aviation-tech
    // card exists yet) — flagged as placeholder art, swap when one lands.
    tradeoff: "Great stability without a 4-year degree, but precision is non-negotiable.",
    photo: "/images/matchflow/mf-electrician.png",
  },
];

/** The taxonomy's total, for the header badge. */
export const TOTAL_PATHS = 322;
export const MAX_SLOTS = 3;
