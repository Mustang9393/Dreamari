import { ALL_CATALOG_CAREERS, FOR_YOU_REEL, type CatalogCareer, type ReelCareer } from "@/components/app/catalog";
import { reportV2 } from "@/components/profile/report-data";
import { careerProfile, type CareerProfile } from "./profiles";
import { careerSlug } from "./slug";

// Career Detail page data — resolved by merging whatever the app already
// knows about a career (the shallow 39-title catalog, the For You reel's
// richer 8, and the 6-career CareerReportV2 that backs the Career Report)
// rather than a fourth parallel career list. A career missing from a given
// source just skips that source; ResolvedCareer's optional fields say
// "coming soon" instead of the section silently vanishing.

export type LadderRung = { number: string; jobTitle: string; oneLiner: string; salary: string; skills: string[] };

// Career Ladder + Common Softwares have no home anywhere else in the app —
// authored here, and only for the careers below. PROTOTYPE COPY: ladder pay
// bands and skills are general industry knowledge, not a verified source;
// the software lists are placeholders pending the real per-career list
// (flagged to the user — do not treat as final). The accordion's expanded
// state is deliberately more than the one-liner it opens from — progressive
// disclosure per direct feedback means there's real information to dig into,
// not just the collapsed row's sentence repeated.
type CareerExtra = { ladder?: LadderRung[]; software?: string[] };

const rung = (number: string, jobTitle: string, oneLiner: string, salary: string, skills: string[]): LadderRung => ({ number, jobTitle, oneLiner, salary, skills });

export const CAREER_EXTRAS: Record<string, CareerExtra> = {
  "investment-banking": {
    ladder: [
      rung("1", "Summer Analyst / Intern", "You learn the basics by helping real bankers with real deals.", "~$85K", ["Excel modeling", "Pitch decks", "Company research"]),
      rung("2", "Investment Banking Analyst", "Your first real job. You crunch the numbers on big deals.", "~$150K", ["Financial modeling", "Valuation", "Long hours"]),
      rung("3", "Investment Banking Associate", "You lead small teams and start talking to clients yourself.", "~$225K", ["Deal management", "Client communication", "Team leadership"]),
      rung("4", "Vice President", "You bring in new business and manage big client relationships.", "~$350K", ["Business development", "Client relationships", "Deal negotiation"]),
      rung("5", "Managing Director / Partner", "You run the business. You make the big calls and handle the biggest clients.", "-", ["Firm strategy", "Major client relationships", "P&L ownership"]),
    ],
    software: ["Excel", "PowerPoint", "Bloomberg Terminal", "FactSet", "Capital IQ"],
  },
  "private-equity": {
    ladder: [
      rung("1", "PE Analyst", "You screen deals and build the models the senior team pitches from.", "~$100K", ["Financial modeling", "Deal screening", "Industry research"]),
      rung("2", "Associate", "You run point on live deals and manage the analysts under you.", "~$180K", ["Due diligence", "Deal execution", "Team management"]),
      rung("3", "Senior Associate / VP", "You lead due diligence and start sourcing your own deals.", "~$275K", ["Deal sourcing", "Negotiation", "Board reporting"]),
      rung("4", "Principal", "You negotiate terms directly and sit on portfolio company boards.", "~$450K", ["Term negotiation", "Board governance", "Portfolio oversight"]),
      rung("5", "Partner / Managing Director", "You raise the fund and decide what the firm invests in.", "-", ["Fundraising", "Investment strategy", "Firm leadership"]),
    ],
    software: ["Excel", "PowerPoint", "Capital IQ", "PitchBook", "Bloomberg Terminal"],
  },
  "airline-pilot": {
    ladder: [
      rung("1", "Flight Instructor / CFI", "You build hours teaching other students to fly.", "~$45K", ["Flight instruction", "Building flight hours", "Aircraft handling"]),
      rung("2", "Regional First Officer", "Your first airline job, flying smaller jets as the co-pilot.", "~$90K", ["Jet operations", "Crew coordination", "Instrument flying"]),
      rung("3", "Regional Captain", "You're in command of the aircraft on regional routes.", "~$120K", ["Command decisions", "Crew leadership", "Weather judgment"]),
      rung("4", "Major Airline First Officer", "You move up to bigger planes at a major carrier.", "~$180K", ["Wide-body systems", "International routes", "Advanced instrumentation"]),
      rung("5", "Major Airline Captain", "You command wide-body jets on the longest, highest-paying routes.", "~$250K+", ["Long-haul command", "Crew management", "Emergency decision-making"]),
    ],
    software: ["ForeFlight", "Jeppesen FliteDeck", "Electronic Flight Bag (EFB) systems", "Garmin Pilot", "Airline crew scheduling software"],
  },
  "software-engineer": {
    ladder: [
      rung("1", "Junior / Associate Engineer", "You ship small, well-scoped features with a mentor reviewing your code.", "~$85K", ["Writing code", "Debugging", "Code review basics"]),
      rung("2", "Software Engineer II", "You own features end to end and start reviewing others' code.", "~$115K", ["Feature ownership", "Code review", "System design basics"]),
      rung("3", "Senior Software Engineer", "You design systems, not just features, and unblock the team.", "~$150K", ["System design", "Mentorship", "Cross-team collaboration"]),
      rung("4", "Staff Engineer", "You set technical direction across multiple teams.", "~$190K", ["Technical strategy", "Architecture", "Org-wide influence"]),
      rung("5", "Principal Engineer / Engineering Manager", "You shape the whole org's technical strategy or lead the people who do.", "~$230K+", ["Technical vision", "People leadership", "Company-wide strategy"]),
    ],
    software: ["VS Code", "Git / GitHub", "Docker", "Jira", "Slack"],
  },
  "registered-nurse": {
    ladder: [
      rung("1", "Nursing Student / CNA", "You get real patient contact hours before you're even licensed.", "~$35K", ["Basic patient care", "Vitals", "Clinical rotations"]),
      rung("2", "New Grad RN", "Your first licensed job, usually on a structured residency unit.", "~$65K", ["Medication administration", "Charting", "Patient assessment"]),
      rung("3", "Registered Nurse", "You carry a full patient load on your own.", "~$80K", ["Independent patient care", "Clinical judgment", "Family communication"]),
      rung("4", "Charge Nurse", "You run the floor for your shift and support the newer nurses.", "~$95K", ["Shift leadership", "Staffing decisions", "Mentoring new nurses"]),
      rung("5", "Nurse Manager / Nurse Practitioner", "You either run a unit or go back to school to diagnose and prescribe.", "~$115K+", ["Unit management", "Advanced diagnosis", "Staff development"]),
    ],
    software: ["Epic (EHR)", "Cerner", "Pyxis medication systems", "Microsoft Excel", "Hospital scheduling software"],
  },
  "food-scientist": {
    ladder: [
      rung("1", "Lab Technician", "You run tests and keep the lab's data clean and organized.", "~$40K", ["Lab testing", "Data logging", "Sample prep"]),
      rung("2", "Food Scientist I", "You help develop and test new products.", "~$60K", ["Product testing", "Formulation basics", "Sensory analysis"]),
      rung("3", "Food Scientist II", "You own a product line from concept through shelf.", "~$80K", ["Product development", "Shelf-life testing", "Regulatory basics"]),
      rung("4", "Senior Food Scientist", "You lead formulation projects and mentor junior scientists.", "~$100K", ["Formulation leadership", "Project management", "Mentorship"]),
      rung("5", "R&D Director", "You set the whole company's product development roadmap.", "~$130K+", ["R&D strategy", "Budget ownership", "Cross-functional leadership"]),
    ],
    software: ["Excel", "LIMS (lab data management)", "Minitab / JMP", "Genesis R&D (nutrition labeling)", "SAP"],
  },
  "asset-management": {
    ladder: [
      rung("1", "Analyst", "You research companies and build the models portfolio managers use.", "~$85K", ["Equity research", "Financial modeling", "Industry analysis"]),
      rung("2", "Associate", "You cover a sector and pitch your own ideas into the portfolio.", "~$130K", ["Sector coverage", "Investment pitches", "Risk analysis"]),
      rung("3", "Portfolio Manager", "You own a portfolio and are accountable for its returns.", "~$200K", ["Portfolio construction", "Risk management", "Performance accountability"]),
      rung("4", "Senior Portfolio Manager", "You run a larger, more visible book of client money.", "~$300K", ["Large-portfolio management", "Client reporting", "Team oversight"]),
      rung("5", "Chief Investment Officer", "You set investment strategy across the whole firm.", "-", ["Firm-wide strategy", "Risk oversight", "Executive leadership"]),
    ],
    software: ["Excel", "Bloomberg Terminal", "FactSet", "Morningstar Direct", "PowerPoint"],
  },
  "aerospace-engineer": {
    ladder: [
      rung("1", "Engineering Intern", "You support real design work under a licensed engineer.", "~$60K", ["CAD basics", "Testing support", "Documentation"]),
      rung("2", "Associate Aerospace Engineer", "You own components of a larger aircraft or spacecraft design.", "~$85K", ["Component design", "Simulation", "Design reviews"]),
      rung("3", "Aerospace Engineer", "You lead design and testing on a subsystem.", "~$110K", ["Subsystem design", "Test planning", "Cross-team coordination"]),
      rung("4", "Senior Aerospace Engineer", "You lead a design team and sign off on safety-critical work.", "~$140K", ["Design leadership", "Safety certification", "Technical reviews"]),
      rung("5", "Principal / Chief Engineer", "You're accountable for the safety and performance of the whole program.", "~$175K+", ["Program oversight", "Safety accountability", "Technical strategy"]),
    ],
    software: ["CATIA", "SolidWorks", "MATLAB", "ANSYS", "AutoCAD"],
  },
  "product-designer": {
    ladder: [
      rung("1", "Design Intern", "You ship small design tasks with a senior designer reviewing your work.", "~$55K", ["UI basics", "Prototyping", "Design critique"]),
      rung("2", "Junior Product Designer", "You own screens and flows within a larger product.", "~$80K", ["Flow design", "User research basics", "Prototyping"]),
      rung("3", "Product Designer", "You own a whole feature area from research through shipped design.", "~$110K", ["End-to-end design", "User research", "Cross-functional collaboration"]),
      rung("4", "Senior Product Designer", "You set design direction across a product and mentor others.", "~$145K", ["Design direction", "Mentorship", "Systems thinking"]),
      rung("5", "Design Lead / Director", "You set design strategy and standards across the company.", "~$190K+", ["Design strategy", "Team leadership", "Company-wide standards"]),
    ],
    software: ["Figma", "Adobe Creative Suite", "Sketch", "Notion", "Miro"],
  },
  "biomedical-researcher": {
    ladder: [
      rung("1", "Lab Assistant", "You run experiments and keep the lab running under a researcher's direction.", "~$40K", ["Lab techniques", "Sample handling", "Data entry"]),
      rung("2", "Research Associate", "You design and run your own experiments within a study.", "~$60K", ["Experiment design", "Data analysis", "Lab safety"]),
      rung("3", "Biomedical Researcher", "You lead a research project and publish your findings.", "~$85K", ["Project leadership", "Scientific writing", "Statistical analysis"]),
      rung("4", "Senior Researcher", "You lead a research team and bring in grant funding.", "~$115K", ["Grant writing", "Team leadership", "Study design"]),
      rung("5", "Principal Investigator / Lab Director", "You run the lab and decide what it studies next.", "~$150K+", ["Lab management", "Research strategy", "Funding oversight"]),
    ],
    software: ["GraphPad Prism", "SPSS", "Electronic Lab Notebook (ELN) software", "Excel", "Reference managers (e.g. EndNote)"],
  },
  "marine-biologist": {
    ladder: [
      rung("1", "Field Research Assistant", "You collect data and samples on other researchers' projects.", "~$35K", ["Field sampling", "Data collection", "Basic diving/boating"]),
      rung("2", "Marine Biologist I", "You run your own field studies and analyze the data.", "~$50K", ["Study design", "Field research", "Data analysis"]),
      rung("3", "Marine Biologist II", "You lead a research project end to end.", "~$65K", ["Project leadership", "Scientific writing", "Grant support"]),
      rung("4", "Senior Marine Biologist", "You lead a team and set the research agenda for a program.", "~$85K", ["Team leadership", "Research strategy", "Stakeholder communication"]),
      rung("5", "Research Director", "You run the whole research program and its funding.", "~$110K+", ["Program management", "Funding strategy", "Executive communication"]),
    ],
    software: ["R / RStudio", "ArcGIS", "Excel", "Field data-logging software", "Microsoft Office"],
  },
  neurosurgeon: {
    ladder: [
      rung("1", "Medical Student", "Four years of medical school before you touch a scalpel professionally.", "-", ["Anatomy", "Clinical rotations", "Board exam prep"]),
      rung("2", "Resident", "6-7 years of surgical training inside a hospital.", "~$65K", ["Surgical technique", "Patient rounds", "On-call decision-making"]),
      rung("3", "Fellow", "A final year of training in a surgical subspecialty.", "~$75K", ["Subspecialty technique", "Complex case management", "Research"]),
      rung("4", "Attending Neurosurgeon", "You operate independently and carry your own patient caseload.", "~$500K", ["Independent surgery", "Caseload management", "Patient consultation"]),
      rung("5", "Senior / Chief of Neurosurgery", "You lead a surgical department and its most complex cases.", "~$800K+", ["Department leadership", "Complex/rare cases", "Mentoring surgeons"]),
    ],
    software: ["Epic (EHR)", "Surgical navigation systems", "PACS imaging software", "Medical dictation software", "OR scheduling systems"],
  },
  "constitutional-attorney": {
    ladder: [
      rung("1", "Law Clerk / Intern", "You research and draft memos for practicing attorneys.", "~$50K", ["Legal research", "Memo writing", "Case review"]),
      rung("2", "Associate Attorney", "You handle your own cases under a partner's supervision.", "~$95K", ["Case management", "Legal writing", "Court filings"]),
      rung("3", "Attorney", "You run your own caseload and argue in court.", "~$130K", ["Oral argument", "Caseload ownership", "Client counsel"]),
      rung("4", "Senior Attorney / Partner", "You bring in clients and mentor junior attorneys.", "~$200K", ["Business development", "Mentorship", "Complex litigation"]),
      rung("5", "Managing Partner", "You run the firm.", "~$300K+", ["Firm management", "Strategic direction", "Major client relationships"]),
    ],
    software: ["Westlaw / LexisNexis", "Microsoft Word", "Clio (case management)", "Adobe Acrobat", "Zoom"],
  },
  "creative-director": {
    ladder: [
      rung("1", "Junior Designer", "You execute on a senior designer's direction.", "~$50K", ["Visual design", "Following brand guidelines", "Production work"]),
      rung("2", "Art Director", "You own the visual direction for individual campaigns.", "~$85K", ["Campaign direction", "Vendor coordination", "Concept development"]),
      rung("3", "Senior Art Director", "You lead a small creative team across several campaigns.", "~$120K", ["Team leadership", "Client presentations", "Concept development"]),
      rung("4", "Creative Director", "You set the creative vision for a brand or a whole account.", "~$160K", ["Brand vision", "Account leadership", "Cross-team direction"]),
      rung("5", "Chief Creative Officer", "You set creative direction across the entire agency or company.", "~$220K+", ["Agency-wide vision", "Executive leadership", "New business strategy"]),
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
  // Present for careers with a full production-shaped profile (profiles.ts);
  // the detail page renders the richer sections from it.
  profile?: CareerProfile;
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
  const profile = careerProfile(slug);

  const title = profile?.title ?? catalog?.title ?? reel?.title;
  const world = profile?.world ?? catalog?.world ?? reel?.world;
  const photo = profile?.photo ?? catalog?.photo ?? reel?.photo;
  if (!title || !world || !photo) return null;

  return {
    slug,
    title,
    world,
    photo,
    profile,
    description: profile?.summary ?? report?.glance.simple ?? reel?.description ?? "",
    medianSalary: report?.salary.median ?? catalog?.salary ?? reel?.salary ?? COMING_SOON,
    degreeRequired: report?.education.find((e) => e.common)?.name ?? COMING_SOON,
    commonMajors: report?.majors.length ? report.majors.map((m) => m.name).join(", ") : (reel?.major ?? COMING_SOON),
    whatTheyActuallyDo: report?.glance.whatYouDo ?? reel?.description ?? COMING_SOON,
    realLifeExample: report?.glance.example ?? null,
    ladder: extra?.ladder,
    software: profile?.software ?? extra?.software,
  };
}

// Same world, excluding this career, capped at 5 -- feeds the real PosterCard
// grid (Explore's own browse-card component), not a Figma placeholder image.
export function similarCareers(current: ResolvedCareer): CatalogCareer[] {
  return ALL_CATALOG_CAREERS.filter((c) => c.world === current.world && c.title !== current.title).slice(0, 5);
}
