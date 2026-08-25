import { ALL_CATALOG_CAREERS, FOR_YOU_REEL, type CatalogCareer, type ReelCareer } from "@/components/app/catalog";
import { reportV2 } from "@/components/profile/report-data";
import { careerSlug } from "./slug";

// Career Detail page data — resolved by merging whatever the app already
// knows about a career (the shallow 39-title catalog, the For You reel's
// richer 8, and the 6-career CareerReportV2 that backs the Career Report)
// rather than a fourth parallel career list. A career missing from a given
// source just skips that source; ResolvedCareer's optional fields say
// "coming soon" instead of the section silently vanishing.

export type LadderRung = { number: string; jobTitle: string; oneLiner: string; salary: string };

// Career Ladder + Common Softwares have no home anywhere else in the app —
// authored here, and only for the careers below. PROTOTYPE COPY: ladder pay
// bands are general industry knowledge, not a verified source; the software
// lists are placeholders pending the real per-career list (flagged to the
// user — do not treat as final).
type CareerExtra = { ladder?: LadderRung[]; software?: string[] };

const rung = (number: string, jobTitle: string, oneLiner: string, salary: string): LadderRung => ({ number, jobTitle, oneLiner, salary });

export const CAREER_EXTRAS: Record<string, CareerExtra> = {
  "investment-banking": {
    ladder: [
      rung("1", "Summer Analyst / Intern", "You learn the basics by helping real bankers with real deals.", "~$85K"),
      rung("2", "Investment Banking Analyst", "Your first real job. You crunch the numbers on big deals.", "~$150K"),
      rung("3", "Investment Banking Associate", "You lead small teams and start talking to clients yourself.", "~$225K"),
      rung("4", "Vice President", "You bring in new business and manage big client relationships.", "~$350K"),
      rung("5", "Managing Director / Partner", "You run the business. You make the big calls and handle the biggest clients.", "-"),
    ],
    software: ["Excel", "PowerPoint", "Bloomberg Terminal", "FactSet", "Capital IQ"],
  },
  "private-equity": {
    ladder: [
      rung("1", "PE Analyst", "You screen deals and build the models the senior team pitches from.", "~$100K"),
      rung("2", "Associate", "You run point on live deals and manage the analysts under you.", "~$180K"),
      rung("3", "Senior Associate / VP", "You lead due diligence and start sourcing your own deals.", "~$275K"),
      rung("4", "Principal", "You negotiate terms directly and sit on portfolio company boards.", "~$450K"),
      rung("5", "Partner / Managing Director", "You raise the fund and decide what the firm invests in.", "-"),
    ],
    software: ["Excel", "PowerPoint", "Capital IQ", "PitchBook", "Bloomberg Terminal"],
  },
  "airline-pilot": {
    ladder: [
      rung("1", "Flight Instructor / CFI", "You build hours teaching other students to fly.", "~$45K"),
      rung("2", "Regional First Officer", "Your first airline job, flying smaller jets as the co-pilot.", "~$90K"),
      rung("3", "Regional Captain", "You're in command of the aircraft on regional routes.", "~$120K"),
      rung("4", "Major Airline First Officer", "You move up to bigger planes at a major carrier.", "~$180K"),
      rung("5", "Major Airline Captain", "You command wide-body jets on the longest, highest-paying routes.", "~$250K+"),
    ],
    software: ["ForeFlight", "Jeppesen FliteDeck", "Electronic Flight Bag (EFB) systems", "Garmin Pilot", "Airline crew scheduling software"],
  },
  "software-engineer": {
    ladder: [
      rung("1", "Junior / Associate Engineer", "You ship small, well-scoped features with a mentor reviewing your code.", "~$85K"),
      rung("2", "Software Engineer II", "You own features end to end and start reviewing others' code.", "~$115K"),
      rung("3", "Senior Software Engineer", "You design systems, not just features, and unblock the team.", "~$150K"),
      rung("4", "Staff Engineer", "You set technical direction across multiple teams.", "~$190K"),
      rung("5", "Principal Engineer / Engineering Manager", "You shape the whole org's technical strategy or lead the people who do.", "~$230K+"),
    ],
    software: ["VS Code", "Git / GitHub", "Docker", "Jira", "Slack"],
  },
  "registered-nurse": {
    ladder: [
      rung("1", "Nursing Student / CNA", "You get real patient contact hours before you're even licensed.", "~$35K"),
      rung("2", "New Grad RN", "Your first licensed job, usually on a structured residency unit.", "~$65K"),
      rung("3", "Registered Nurse", "You carry a full patient load on your own.", "~$80K"),
      rung("4", "Charge Nurse", "You run the floor for your shift and support the newer nurses.", "~$95K"),
      rung("5", "Nurse Manager / Nurse Practitioner", "You either run a unit or go back to school to diagnose and prescribe.", "~$115K+"),
    ],
    software: ["Epic (EHR)", "Cerner", "Pyxis medication systems", "Microsoft Excel", "Hospital scheduling software"],
  },
  "food-scientist": {
    ladder: [
      rung("1", "Lab Technician", "You run tests and keep the lab's data clean and organized.", "~$40K"),
      rung("2", "Food Scientist I", "You help develop and test new products.", "~$60K"),
      rung("3", "Food Scientist II", "You own a product line from concept through shelf.", "~$80K"),
      rung("4", "Senior Food Scientist", "You lead formulation projects and mentor junior scientists.", "~$100K"),
      rung("5", "R&D Director", "You set the whole company's product development roadmap.", "~$130K+"),
    ],
    software: ["Excel", "LIMS (lab data management)", "Minitab / JMP", "Genesis R&D (nutrition labeling)", "SAP"],
  },
  "asset-management": {
    ladder: [
      rung("1", "Analyst", "You research companies and build the models portfolio managers use.", "~$85K"),
      rung("2", "Associate", "You cover a sector and pitch your own ideas into the portfolio.", "~$130K"),
      rung("3", "Portfolio Manager", "You own a portfolio and are accountable for its returns.", "~$200K"),
      rung("4", "Senior Portfolio Manager", "You run a larger, more visible book of client money.", "~$300K"),
      rung("5", "Chief Investment Officer", "You set investment strategy across the whole firm.", "-"),
    ],
    software: ["Excel", "Bloomberg Terminal", "FactSet", "Morningstar Direct", "PowerPoint"],
  },
  "aerospace-engineer": {
    ladder: [
      rung("1", "Engineering Intern", "You support real design work under a licensed engineer.", "~$60K"),
      rung("2", "Associate Aerospace Engineer", "You own components of a larger aircraft or spacecraft design.", "~$85K"),
      rung("3", "Aerospace Engineer", "You lead design and testing on a subsystem.", "~$110K"),
      rung("4", "Senior Aerospace Engineer", "You lead a design team and sign off on safety-critical work.", "~$140K"),
      rung("5", "Principal / Chief Engineer", "You're accountable for the safety and performance of the whole program.", "~$175K+"),
    ],
    software: ["CATIA", "SolidWorks", "MATLAB", "ANSYS", "AutoCAD"],
  },
  "product-designer": {
    ladder: [
      rung("1", "Design Intern", "You ship small design tasks with a senior designer reviewing your work.", "~$55K"),
      rung("2", "Junior Product Designer", "You own screens and flows within a larger product.", "~$80K"),
      rung("3", "Product Designer", "You own a whole feature area from research through shipped design.", "~$110K"),
      rung("4", "Senior Product Designer", "You set design direction across a product and mentor others.", "~$145K"),
      rung("5", "Design Lead / Director", "You set design strategy and standards across the company.", "~$190K+"),
    ],
    software: ["Figma", "Adobe Creative Suite", "Sketch", "Notion", "Miro"],
  },
  "biomedical-researcher": {
    ladder: [
      rung("1", "Lab Assistant", "You run experiments and keep the lab running under a researcher's direction.", "~$40K"),
      rung("2", "Research Associate", "You design and run your own experiments within a study.", "~$60K"),
      rung("3", "Biomedical Researcher", "You lead a research project and publish your findings.", "~$85K"),
      rung("4", "Senior Researcher", "You lead a research team and bring in grant funding.", "~$115K"),
      rung("5", "Principal Investigator / Lab Director", "You run the lab and decide what it studies next.", "~$150K+"),
    ],
    software: ["GraphPad Prism", "SPSS", "Electronic Lab Notebook (ELN) software", "Excel", "Reference managers (e.g. EndNote)"],
  },
  "marine-biologist": {
    ladder: [
      rung("1", "Field Research Assistant", "You collect data and samples on other researchers' projects.", "~$35K"),
      rung("2", "Marine Biologist I", "You run your own field studies and analyze the data.", "~$50K"),
      rung("3", "Marine Biologist II", "You lead a research project end to end.", "~$65K"),
      rung("4", "Senior Marine Biologist", "You lead a team and set the research agenda for a program.", "~$85K"),
      rung("5", "Research Director", "You run the whole research program and its funding.", "~$110K+"),
    ],
    software: ["R / RStudio", "ArcGIS", "Excel", "Field data-logging software", "Microsoft Office"],
  },
  neurosurgeon: {
    ladder: [
      rung("1", "Medical Student", "Four years of medical school before you touch a scalpel professionally.", "-"),
      rung("2", "Resident", "6-7 years of surgical training inside a hospital.", "~$65K"),
      rung("3", "Fellow", "A final year of training in a surgical subspecialty.", "~$75K"),
      rung("4", "Attending Neurosurgeon", "You operate independently and carry your own patient caseload.", "~$500K"),
      rung("5", "Senior / Chief of Neurosurgery", "You lead a surgical department and its most complex cases.", "~$800K+"),
    ],
    software: ["Epic (EHR)", "Surgical navigation systems", "PACS imaging software", "Medical dictation software", "OR scheduling systems"],
  },
  "constitutional-attorney": {
    ladder: [
      rung("1", "Law Clerk / Intern", "You research and draft memos for practicing attorneys.", "~$50K"),
      rung("2", "Associate Attorney", "You handle your own cases under a partner's supervision.", "~$95K"),
      rung("3", "Attorney", "You run your own caseload and argue in court.", "~$130K"),
      rung("4", "Senior Attorney / Partner", "You bring in clients and mentor junior attorneys.", "~$200K"),
      rung("5", "Managing Partner", "You run the firm.", "~$300K+"),
    ],
    software: ["Westlaw / LexisNexis", "Microsoft Word", "Clio (case management)", "Adobe Acrobat", "Zoom"],
  },
  "creative-director": {
    ladder: [
      rung("1", "Junior Designer", "You execute on a senior designer's direction.", "~$50K"),
      rung("2", "Art Director", "You own the visual direction for individual campaigns.", "~$85K"),
      rung("3", "Senior Art Director", "You lead a small creative team across several campaigns.", "~$120K"),
      rung("4", "Creative Director", "You set the creative vision for a brand or a whole account.", "~$160K"),
      rung("5", "Chief Creative Officer", "You set creative direction across the entire agency or company.", "~$220K+"),
    ],
    software: ["Adobe Creative Suite", "Figma", "Keynote", "Miro", "Asana"],
  },
};

export type ResolvedCareer = {
  slug: string;
  title: string;
  world: string;
  photo: string;
  description: string; // hero one-liner
  medianSalary: string;
  degreeRequired: string;
  commonMajors: string;
  whatTheyActuallyDo: string;
  realLifeExample: string | null;
  ladder?: LadderRung[];
  software?: string[];
};

const COMING_SOON = "Coming soon";

function findCatalog(slug: string): CatalogCareer | undefined {
  return ALL_CATALOG_CAREERS.find((c) => careerSlug(c.title) === slug);
}

function findReel(slug: string): ReelCareer | undefined {
  return FOR_YOU_REEL.find((c) => careerSlug(c.title) === slug);
}

export function resolveCareer(slug: string): ResolvedCareer | null {
  const catalog = findCatalog(slug);
  const reel = findReel(slug);
  const report = reportV2(slug);
  const extra = CAREER_EXTRAS[slug];

  const title = catalog?.title ?? reel?.title;
  const world = catalog?.world ?? reel?.world;
  const photo = catalog?.photo ?? reel?.photo;
  if (!title || !world || !photo) return null;

  return {
    slug,
    title,
    world,
    photo,
    description: report?.glance.simple ?? reel?.description ?? "",
    medianSalary: report?.salary.median ?? catalog?.salary ?? reel?.salary ?? COMING_SOON,
    degreeRequired: report?.education.find((e) => e.common)?.name ?? COMING_SOON,
    commonMajors: report?.majors.length ? report.majors.map((m) => m.name).join(", ") : (reel?.major ?? COMING_SOON),
    whatTheyActuallyDo: report?.glance.whatYouDo ?? reel?.description ?? COMING_SOON,
    realLifeExample: report?.glance.example ?? null,
    ladder: extra?.ladder,
    software: extra?.software,
  };
}

// Same world, excluding this career, capped at 5 -- feeds the real PosterCard
// grid (Explore's own browse-card component), not a Figma placeholder image.
export function similarCareers(current: ResolvedCareer): CatalogCareer[] {
  return ALL_CATALOG_CAREERS.filter((c) => c.world === current.world && c.title !== current.title).slice(0, 5);
}
