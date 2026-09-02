// Full career profiles: the production career page's information
// architecture (dreamonna.com/explore/<slug>), authored here so the
// prototype can redesign HOW that information is shown without touching
// WHAT it says. Copy and figures below are transcribed verbatim from the
// production page export ("Carpenter · Dreamari.pdf", 2026-09-02). Do not
// paraphrase or re-order data here; layout decisions live in the component.

export type PayByState = {
  /** Production titles this block "Pay by state" when the figures are pay,
   *  and "Where the jobs are" when they are job-concentration labels. */
  title?: string;
  /** The student's own state(s); pay is "—" in production when unknown. */
  yourStates?: { state: string; pay: string }[];
  best: { state: string; pay: string }[];
};

export type ProfileRung = {
  number: string;
  jobTitle: string;
  pay: string;
  description: string;
  whatYouDo: string[];
  toGetHere: string[];
};

export type CareerProfile = {
  slug: string;
  title: string;
  world: string;
  photo: string;
  // Hero
  summary: string; // one-line definition
  scenario: string; // "Imagine ..." line
  // Quick facts, in the production order
  facts: { label: string; value: string }[];
  payByState: PayByState;
  knowAbout: string[];
  goodAt: string[];
  software: string[];
  ladder: ProfileRung[];
  education: {
    studies: { name: string; href?: string }[];
    where: { count: string; credential: string; href?: string }[];
  };
  sources: string;
};

const K = (state: string, pay: string) => ({ state, pay });

export const CAREER_PROFILES: Record<string, CareerProfile> = {
  carpenter: {
    slug: "carpenter",
    title: "Carpenter",
    world: "Building & Construction",
    photo: "/images/app/poster-carpenter.png",
    summary: "Builds the wooden frames and structures of buildings.",
    scenario: "Imagine framing a house in three weeks. Every wall you set has to be exactly square, or every wall after it is wrong.",
    facts: [
      { label: "Typical degree", value: "High school diploma or equivalent" },
      { label: "Typical pay", value: "$60,580/year" },
      { label: "People doing it", value: "959,000" },
      { label: "Jobs open each year", value: "74,100" },
    ],
    payByState: {
      title: "Pay by state",
      yourStates: [K("South Dakota", "$48K")],
      best: [K("Vermont", "$62K"), K("Idaho", "$52K"), K("Utah", "$52K")],
    },
    knowAbout: ["Building things", "Math", "Running a team or a business", "Designing how things look and work", "How things get engineered and built"],
    goodAt: ["Accurate measuring and math", "A 3-4 year apprenticeship", "Reading blueprints", "Power tool safety", "Physical strength and stamina"],
    software: ["Intuit QuickBooks", "Microsoft Excel", "Microsoft Office software", "Microsoft Windows", "Microsoft Word"],
    ladder: [
      {
        number: "1",
        jobTitle: "Apprentice Carpenter",
        pay: "$40K",
        description: "You learn the trade by building alongside skilled carpenters. Pay starts lower and rises as you learn new skills.",
        whatYouDo: ["Measure lumber", "Carry materials", "Study blueprints", "Assist with framing"],
        toGetHere: ["High school diploma", "Accepted into apprenticeship"],
      },
      {
        number: "2",
        jobTitle: "Carpenter",
        pay: "$57K",
        description: "You frame whole buildings yourself, following blueprints exactly. Pay is steady hourly work once you finish your apprenticeship.",
        whatYouDo: ["Frame walls", "Read blueprints", "Cut lumber precisely", "Install doors and windows"],
        toGetHere: ["3 to 4 year apprenticeship", "1 to 2 years experience"],
      },
      {
        number: "3",
        jobTitle: "Carpentry Contractor",
        pay: "$77K",
        description: "You run your own crew, bidding and managing whole projects. Pay depends on your bids, so it can rise or fall with each job.",
        whatYouDo: ["Plan projects", "Manage a crew", "Bid on jobs", "Handle project paperwork"],
        toGetHere: ["Several years as carpenter", "Contractor license"],
      },
    ],
    education: {
      studies: [{ name: "Carpentry/Carpenter" }],
      where: [
        { count: "130", credential: "Certificate, under a year" },
        { count: "192", credential: "Certificate, 1-2 years" },
      ],
    },
    sources: "Job description and skills from O*NET (USDOL/ETA). Pay and growth from the U.S. Bureau of Labor Statistics.",
  },
};

export function careerProfile(slug: string): CareerProfile | undefined {
  return CAREER_PROFILES[slug];
}
