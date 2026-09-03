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

/** Behind the (i) on three quick facts. Degree opens a sheet with the
 *  education mix; pay and openings open a small popover. */
export type FactDetails = {
  degree?: {
    doorAsksFor: string;
    experienceFirst: string;
    trainingAfterHiring: string;
    note: string;
    noBachelorPct: string;
    extra?: string;
    distribution: { label: string; pct: number }[];
  };
  pay?: { starting: string; typical: string; top: string; note?: string };
  openings?: { note: string };
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
  factDetails?: FactDetails;
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
    // Transcribed from the production (i) tooltips and sheet (screenshots,
    // 2026-09-03); em dashes replaced with periods and commas, wording kept.
    factDetails: {
      degree: {
        doorAsksFor: "High school diploma or equivalent",
        experienceFirst: "No. You can start without it",
        trainingAfterHiring: "Apprenticeship",
        note: "This is a trade you learn on an apprenticeship: paid work with training, not a degree first.",
        noBachelorPct: "92%",
        extra: "100% got in with two years of study or less.",
        distribution: [
          { label: "Did not finish high school", pct: 25.6 },
          { label: "Finished high school", pct: 42.6 },
          { label: "Some college, no degree", pct: 17.8 },
          { label: "Associate's degree", pct: 5.9 },
          { label: "Bachelor's degree", pct: 6.6 },
          { label: "Master's degree", pct: 1.1 },
          { label: "Doctorate or professional degree", pct: 0.3 },
        ],
      },
      pay: { starting: "$40,410", typical: "$60,580", top: "$99,910", note: "27% work for themselves, so this describes the ones with a boss." },
      openings: { note: "Counts every job that needs filling, mostly people moving on rather than brand-new roles. The job itself changes by about +43,100 by 2034. It is growing about as fast as most jobs." },
    },
  },
};

import { GENERATED_PROFILES } from "./profiles.generated";

export function careerProfile(slug: string): CareerProfile | undefined {
  // Hand-transcribed production data wins; the generated blueprint fills
  // every other catalog career.
  return CAREER_PROFILES[slug] ?? GENERATED_PROFILES[slug];
}
