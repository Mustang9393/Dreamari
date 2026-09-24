// DEMO-ONLY: the Flow Lab's own data and storage. Everything here is
// isolated from the live demo on purpose (direct instruction, 24 Sept 2026:
// "NOTHING SHOULD CHANGE IN THE DEMO... replayable, isolated from the
// actual demo app"): the lab reads the catalog and the student's saved
// interests read-only, and writes only to `dreamari:flowlab:*` keys, so
// playing either flow can never alter what /match-grid or /profile show.

import { ALL_CATALOG_CAREERS, type CatalogCareer } from "@/components/app/catalog";
import { INTEREST_WORLDS } from "@/components/build/types";
import { readStudentProfile } from "@/lib/studentProfile";
import { DECK } from "@/components/match-lab/data";
import { careerProfile } from "@/components/career/profiles";
import { reportV2 } from "@/components/profile/report-data";
import { resolveCareer } from "@/components/career/data";
import { careerSlug } from "@/components/career/slug";

export type LabVersion = "v2" | "v3";
export const LAB_VERSION_KEY = "dreamari:flowlab:version";
export const labStateKey = (v: LabVersion) => `dreamari:flowlab:${v}`;

/** Joshua's proposal caps the saved tray at "around 7". */
export const MAX_SAVED = 7;
export const PAGE_SIZE = 6;

export type LabCareer = CatalogCareer & { id: string };

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let cache: LabCareer[] | null = null;
export function labCatalog(): LabCareer[] {
  if (!cache) cache = ALL_CATALOG_CAREERS.map((c) => ({ ...c, id: slug(c.title) }));
  return cache;
}
export function careerById(id: string): LabCareer | undefined {
  return labCatalog().find((c) => c.id === id);
}
export function careersForWorld(world: string): LabCareer[] {
  return labCatalog().filter((c) => c.world === world);
}

export const WORLDS = INTEREST_WORLDS;
export function worldLabel(slugOrLabel: string): string {
  return WORLDS.find((w) => w.slug === slugOrLabel)?.label ?? slugOrLabel;
}
/** Worlds that actually have enough careers in the catalog to browse. */
export function browsableWorlds(): string[] {
  return WORLDS.map((w) => w.label).filter((label) => careersForWorld(label).length >= 3);
}

/** The interests the student chose in the real Build, as world labels
 *  (read-only; the lab never writes to the profile). */
export function interestsFromBuild(): string[] {
  try {
    return readStudentProfile().interests.map(worldLabel).filter((l) => browsableWorlds().includes(l));
  } catch {
    return [];
  }
}

/** Everything the real Build knows that can shape a career list: worlds,
 *  favourite subjects, and the college / trades / both answer. Read-only. */
export type BuildSignals = { worlds: string[]; subjects: string[]; path: string };
export function buildSignals(): BuildSignals {
  try {
    const p = readStudentProfile();
    return { worlds: interestsFromBuild(), subjects: p.subjects ?? [], path: p.path ?? "" };
  } catch {
    return { worlds: [], subjects: [], path: "" };
  }
}

// Title keywords per Build subject, so "Computer Science" can actually
// reorder a world (direct feedback, 25 Sept 2026: "make it so the v2 build
// actually shows relevant options based on what I choose"). Hand-authored
// for the lab; production would come from the taxonomy.
export const SUBJECT_KEYWORDS: Record<string, string[]> = {
  Mathematics: ["analyst", "actuar", "accountant", "statistic", "mathemat", "economist", "data scientist", "quant", "surveyor", "financial"],
  Science: ["scientist", "biolog", "chemist", "lab", "nurse", "physician", "medic", "environment", "geolog", "pharmac", "vet", "research"],
  "English/Literature": ["writer", "editor", "journal", "author", "copywrit", "librar", "communicat", "public relations", "reporter"],
  History: ["histor", "museum", "archiv", "curator", "lawyer", "attorney", "policy", "diplomat", "paralegal", "teacher"],
  Art: ["design", "illustrat", "artist", "animat", "photograph", "fashion", "architect", "stylist", "tattoo", "florist"],
  Music: ["music", "audio", "sound", "dj", "composer", "producer"],
  "Computer Science": ["software", "developer", "programmer", "data", "cyber", "security", "web", "ai ", "robot", "game", "it ", "network", "cloud", "ux", "database", "systems", "computer"],
  "Foreign Languages": ["translat", "interpret", "diplomat", "flight attendant", "travel", "tour", "international", "customs"],
  Business: ["manager", "marketing", "sales", "entrepreneur", "account", "real estate", "consultant", "executive", "owner", "human resources", "recruit", "banker"],
  Psychology: ["psycholog", "counselor", "therapist", "social worker", "mental", "human resources", "behavior", "case manager"],
};
const TRADES_KEYWORDS = ["technician", "electrician", "plumber", "mechanic", "welder", "carpenter", "hvac", "machinist", "operator", "driver", "chef", "cook", "cosmetolog", "paramedic", "emt", "lineman", "installer", "pipefitter", "roofer", "mason", "apprentice", "trucker", "barber", "esthetic", "firefighter", "ironworker", "millwright"];
const COLLEGE_KEYWORDS = ["engineer", "scientist", "physician", "surgeon", "lawyer", "attorney", "analyst", "architect", "pharmacist", "professor", "psychologist", "accountant", "therapist", "dentist", "veterinarian", "economist", "researcher", "actuary", "banker", "consultant"];

export type Ranked = { career: LabCareer; reason: string; score: number };

/** Order one world's careers by how well they fit the student's Build
 *  answers, combined: each matching subject scores, the college/trades
 *  answer nudges a fit up and pushes a mismatch down, ties keep catalog
 *  order. `reason` is the chip: the combination of the student's own
 *  answers that put the card here (matched subjects, else the chosen world,
 *  plus the path when it fits). A path never puts a card in front of the
 *  student by itself; a mismatch pushes it out (direct feedback, 25 Sept
 *  2026: "relevant to my interests + college path, not something that's
 *  there only because of college path"; then "only one card has a reason
 *  chip, so the others don't have anything relevant?"). */
export function rankForStudent(world: string, signals: BuildSignals): Ranked[] {
  const path = signals.path;
  return careersForWorld(world)
    .map((career, index) => {
      const t = career.title.toLowerCase();
      let score = 0;
      const hits: string[] = [];
      for (const subject of signals.subjects) {
        if ((SUBJECT_KEYWORDS[subject] ?? []).some((k) => t.includes(k))) {
          score += 2;
          hits.push(subject);
        }
      }
      // A trade word wins when both match ("Civil Engineering Technician"
      // is a technician, not an engineer).
      const trades = TRADES_KEYWORDS.some((k) => t.includes(k));
      const college = !trades && COLLEGE_KEYWORDS.some((k) => t.includes(k));
      let pathFit: string | null = null;
      if (path === "trades") { score += trades ? 1 : college ? -2 : 0; if (trades) pathFit = "Trades"; }
      else if (path === "college") { score += college ? 1 : trades ? -2 : 0; if (college) pathFit = "College"; }
      // The chip is the combination of Build answers that put the card
      // here: matched subject(s), else the chosen world, plus the path
      // when it fits ("Mathematics · College", "Tech & Engineering ·
      // College"). Every card in a chosen world has at least the world.
      const parts = [...(hits.length ? hits : [world]), ...(pathFit ? [pathFit] : [])];
      return { career, reason: `Fits ${parts.join(" · ")}`, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ career, reason, score }) => ({ career, reason, score }));
}

/** The "For you" set: every career from the chosen worlds, ranked by the
 *  combined answers, with path mismatches left out entirely. Worlds are
 *  interleaved on ties so one world never crowds the other out. */
export function forYou(signals: BuildSignals): Ranked[] {
  const perWorld = signals.worlds.map((w) => rankForStudent(w, signals).filter((r) => r.score >= 0));
  const out: Ranked[] = [];
  const max = Math.max(0, ...perWorld.map((l) => l.length));
  for (let i = 0; i < max; i++) for (const list of perWorld) if (list[i]) out.push(list[i]);
  return out.sort((a, b) => b.score - a.score);
}

/** Worlds to offer under "Explore more": neighbours of the chosen worlds
 *  first, so the next tab over is the next-nearest thing, not alphabetical. */
export function exploreMoreWorlds(chosen: string[]): string[] {
  const near = chosen.flatMap((w) => WORLD_NEIGHBORS[w] ?? []);
  const rest = browsableWorlds();
  return [...new Set([...near, ...rest])].filter((w) => !chosen.includes(w) && rest.includes(w));
}

// One follow-up per world for v3's Build add-on ("Which parts of Arts, Media
// & Sport?"), the granularity two Dreamonna testers asked for. Hand-authored
// for the lab; production would draw these from the taxonomy.
export const SUB_INTERESTS: Record<string, string[]> = {
  "Arts, Media & Sport": ["Design & illustration", "Film, video & photo", "Music & audio", "Writing & journalism", "Sports & fitness", "Fashion"],
  "Building & Construction": ["Architecture & design", "Hands-on building", "Electrical & plumbing", "Project management"],
  "Business & Finance": ["Investing & markets", "Running a business", "Marketing & sales", "Accounting & numbers", "Real estate"],
  "Counseling & Social Work": ["School counseling", "Mental health", "Community programs", "Youth work"],
  "Driving, Flying & Shipping": ["Flying", "Logistics & shipping", "Driving & delivery", "Rail & transit"],
  "Factories & Making Things": ["Manufacturing", "Robotics & automation", "Quality & inspection", "Product design"],
  "Farming, Animals & Nature": ["Animals & vet care", "Farming & food production", "Parks & the outdoors", "Environment & climate"],
  "Fixing Machines & Engines": ["Cars & motorcycles", "Aircraft", "Heating & cooling", "Industrial machines"],
  "Food & Cooking": ["Cooking & kitchens", "Baking", "Food science", "Restaurants & hospitality"],
  "Health & Medicine": ["Nursing & patient care", "Doctors & specialists", "Therapy & rehab", "Labs & research", "Dental & vision"],
  "Law, Safety & Justice": ["Law & courts", "Police & investigation", "Fire & emergency", "Policy & government"],
  "Personal Care & Community Services": ["Beauty & wellness", "Fitness & coaching", "Events", "Community services"],
  "Science & Research": ["Lab research", "Space & physics", "Environment & earth", "Data & analysis"],
  "Teaching & Education": ["Teaching kids", "Teaching teens", "Coaching & training", "Curriculum & ed-tech"],
  "Tech & Engineering": ["Software & apps", "Data & AI", "Cybersecurity", "Design (UX/UI)", "Hardware & engineering", "Games"],
};

// Title keywords that tie a catalog career to a sub-interest, so v3 can put
// a real reason on each card ("Software & apps", not just the world). A
// career that matches none of the student's chosen sub-interests still
// shows its world as the reason. Hand-authored for the lab.
export const SUB_KEYWORDS: Record<string, string[]> = {
  "Design & illustration": ["design", "illustrat", "graphic", "animator", "artist"],
  "Film, video & photo": ["film", "video", "photo", "director", "cinemat", "editor", "producer"],
  "Music & audio": ["music", "audio", "sound", "dj", "composer"],
  "Writing & journalism": ["writer", "journal", "author", "editor", "reporter", "copywriter"],
  "Sports & fitness": ["sport", "athlet", "coach", "fitness", "trainer", "referee"],
  "Fashion": ["fashion", "stylist", "model"],
  "Architecture & design": ["architect", "drafter", "interior", "landscape"],
  "Hands-on building": ["carpenter", "mason", "roofer", "construction", "builder", "welder", "ironworker"],
  "Electrical & plumbing": ["electrician", "plumber", "hvac", "pipefitter"],
  "Project management": ["manager", "estimator", "inspector", "surveyor"],
  "Investing & markets": ["invest", "financial", "trader", "analyst", "banker", "wealth"],
  "Running a business": ["entrepreneur", "founder", "owner", "manager", "executive", "consultant"],
  "Marketing & sales": ["market", "sales", "brand", "advertis", "account"],
  "Accounting & numbers": ["account", "auditor", "bookkeep", "actuar", "tax"],
  "Real estate": ["real estate", "realtor", "property", "appraiser"],
  "School counseling": ["school counselor", "guidance", "academic advisor"],
  "Mental health": ["therapist", "psycholog", "counselor", "mental"],
  "Community programs": ["community", "case manager", "social worker", "nonprofit"],
  "Youth work": ["youth", "child", "family"],
  "Flying": ["pilot", "flight", "air traffic", "aviation"],
  "Logistics & shipping": ["logistic", "supply", "shipping", "freight", "dispatcher", "warehouse"],
  "Driving & delivery": ["driver", "truck", "delivery", "courier"],
  "Rail & transit": ["rail", "train", "transit", "conductor", "bus"],
  "Manufacturing": ["manufactur", "machinist", "assembler", "production", "fabricat"],
  "Robotics & automation": ["robot", "automation", "cnc", "mechatron"],
  "Quality & inspection": ["quality", "inspector", "tester"],
  "Product design": ["industrial design", "product design", "prototype", "toolmaker"],
  "Animals & vet care": ["vet", "animal", "zoo", "groomer", "wildlife"],
  "Farming & food production": ["farm", "agricultur", "rancher", "crop", "grower"],
  "Parks & the outdoors": ["park", "ranger", "forest", "outdoor", "fishing"],
  "Environment & climate": ["environment", "climate", "conservation", "sustainab", "ecolog"],
  "Cars & motorcycles": ["auto", "mechanic", "motorcycle", "car", "diesel"],
  "Aircraft": ["aircraft", "avionics", "aviation"],
  "Heating & cooling": ["hvac", "refrigerat", "heating"],
  "Industrial machines": ["industrial", "millwright", "maintenance", "elevator", "machinery"],
  "Cooking & kitchens": ["chef", "cook", "kitchen", "culinary", "line"],
  "Baking": ["baker", "pastry", "bak"],
  "Food science": ["food scien", "nutrition", "dietitian", "flavor"],
  "Restaurants & hospitality": ["restaurant", "hospitality", "server", "bartender", "sommelier", "caterer"],
  "Nursing & patient care": ["nurse", "nursing", "aide", "paramedic", "emt", "caregiver"],
  "Doctors & specialists": ["physician", "doctor", "surgeon", "pediatric", "anesthesi", "cardiolog"],
  "Therapy & rehab": ["therapist", "physical therap", "occupational", "rehab", "chiropract"],
  "Labs & research": ["lab", "technologist", "pathol", "research", "biomed"],
  "Dental & vision": ["dent", "orthodont", "optom", "optic", "vision"],
  "Law & courts": ["lawyer", "attorney", "paralegal", "judge", "legal", "court"],
  "Police & investigation": ["police", "detective", "investigat", "forensic", "officer", "sheriff"],
  "Fire & emergency": ["fire", "emergency", "dispatcher", "rescue"],
  "Policy & government": ["policy", "government", "legislat", "diplomat", "public", "urban"],
  "Beauty & wellness": ["cosmetolog", "esthetic", "hair", "nail", "massage", "beauty", "makeup"],
  "Fitness & coaching": ["fitness", "trainer", "coach", "yoga", "instructor"],
  "Events": ["event", "wedding", "planner", "concierge"],
  "Community services": ["community", "recreation", "funeral", "childcare"],
  "Lab research": ["scientist", "chemist", "biolog", "microbiolog", "lab", "research"],
  "Space & physics": ["astro", "physic", "space", "aerospace"],
  "Environment & earth": ["geolog", "environment", "meteorolog", "oceanograph", "earth"],
  "Data & analysis": ["data", "statistic", "analyst", "mathemat"],
  "Teaching kids": ["elementary", "preschool", "kindergarten", "early childhood"],
  "Teaching teens": ["high school", "teacher", "middle school", "secondary"],
  "Coaching & training": ["coach", "trainer", "tutor", "instructor"],
  "Curriculum & ed-tech": ["curriculum", "instructional", "education", "librarian", "principal"],
  "Software & apps": ["software", "developer", "programmer", "web", "mobile", "cloud", "devops"],
  "Data & AI": ["data", "machine learning", "ai ", "artificial", "analyst"],
  "Cybersecurity": ["cyber", "security", "network"],
  "Design (UX/UI)": ["ux", "ui", "design", "product"],
  "Hardware & engineering": ["hardware", "electrical", "mechanical", "civil", "robot", "engineer"],
  "Games": ["game"],
};

export function subInterestFor(title: string, candidates: string[]): string | null {
  const t = title.toLowerCase();
  for (const sub of candidates) {
    const keys = SUB_KEYWORDS[sub] ?? [];
    if (keys.some((k) => t.includes(k))) return sub;
  }
  return null;
}

// Which worlds sit next to which, for v3's "one stretch pick" and "Show me
// six more" so the set stays coherent instead of jumping across the map.
export const WORLD_NEIGHBORS: Record<string, string[]> = {
  "Arts, Media & Sport": ["Tech & Engineering", "Personal Care & Community Services", "Teaching & Education"],
  "Building & Construction": ["Fixing Machines & Engines", "Factories & Making Things", "Driving, Flying & Shipping"],
  "Business & Finance": ["Tech & Engineering", "Law, Safety & Justice", "Personal Care & Community Services"],
  "Counseling & Social Work": ["Teaching & Education", "Health & Medicine", "Personal Care & Community Services"],
  "Driving, Flying & Shipping": ["Fixing Machines & Engines", "Building & Construction", "Law, Safety & Justice"],
  "Factories & Making Things": ["Fixing Machines & Engines", "Building & Construction", "Tech & Engineering"],
  "Farming, Animals & Nature": ["Science & Research", "Health & Medicine", "Food & Cooking"],
  "Fixing Machines & Engines": ["Factories & Making Things", "Driving, Flying & Shipping", "Building & Construction"],
  "Food & Cooking": ["Personal Care & Community Services", "Business & Finance", "Farming, Animals & Nature"],
  "Health & Medicine": ["Science & Research", "Counseling & Social Work", "Personal Care & Community Services"],
  "Law, Safety & Justice": ["Business & Finance", "Counseling & Social Work", "Driving, Flying & Shipping"],
  "Personal Care & Community Services": ["Counseling & Social Work", "Health & Medicine", "Arts, Media & Sport"],
  "Science & Research": ["Health & Medicine", "Tech & Engineering", "Farming, Animals & Nature"],
  "Teaching & Education": ["Counseling & Social Work", "Arts, Media & Sport", "Science & Research"],
  "Tech & Engineering": ["Science & Research", "Business & Finance", "Arts, Media & Sport"],
};

// ---- the detail modal's content, in the live Match modal's exact shape ----
// Match's DetailModal shows employers, salary, and three bullet sections
// ("What You'd Do", "Good Fit If You Like", "School & Path"). Its six deck
// careers are hand-authored; the lab covers the whole catalog, so for every
// other career the same three sections are filled from what the app already
// knows (the Career Report, the career profile, the resolved detail), in
// that order of trust, and the section reads "Details coming soon." only
// when none of those exist (direct feedback, 25 Sept 2026: "we're not
// showing all the information that was there on the opened card").
export type MatchDetail = { employers: string | null; salary: string | null; whatYouDo: string[]; goodFitIf: string[]; schoolPath: string[] };

const NOT = (s: string | undefined | null): s is string => !!s && s !== "Coming soon";

export function matchDetail(career: LabCareer): MatchDetail {
  const slug = careerSlug(career.title);
  const deck = DECK.find((d) => d.id === slug || d.title === career.title);
  if (deck) return { employers: deck.employers, salary: deck.salary, whatYouDo: deck.whatYouDo, goodFitIf: deck.goodFitIf, schoolPath: deck.schoolPath };
  const report = reportV2(slug);
  const profile = careerProfile(slug);
  const resolved = resolveCareer(slug);
  const fact = (label: string) => profile?.facts.find((f) => f.label === label)?.value;
  const parts = (SUB_INTERESTS[career.world] ?? []).filter((sub) => (SUB_KEYWORDS[sub] ?? []).some((k) => career.title.toLowerCase().includes(k)));

  const whatYouDo = report
    ? [report.glance.whatYouDo, ...report.glance.responsibilities.slice(0, 2)].filter(NOT)
    : profile
      ? [profile.summary, profile.scenario].filter(NOT)
      : [resolved?.whatTheyActuallyDo, resolved?.description].filter(NOT).slice(0, 1);
  const goodFitIf = profile?.goodAt?.length ? profile.goodAt.slice(0, 3) : [...parts, career.world].slice(0, 3);
  const schoolPath = report
    ? [report.education.find((e) => e.common)?.name, report.majors.length ? report.majors.map((m) => m.name).slice(0, 3).join(", ") : undefined].filter(NOT)
    : profile
      ? [fact("Typical degree"), ...profile.education.studies.slice(0, 2).map((s) => s.name)].filter(NOT)
      : [resolved?.degreeRequired, resolved?.commonMajors].filter(NOT);
  const salary = [report?.salary.median, fact("Typical pay"), resolved?.medianSalary, career.salary].find(NOT) ?? null;
  const employers = report?.glance.employers?.length ? report.glance.employers.slice(0, 2).join(" · ") : null;
  return { employers, salary, whatYouDo, goodFitIf, schoolPath };
}

export function readLabState<T>(v: LabVersion, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(labStateKey(v));
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback;
  } catch {
    return fallback;
  }
}
export function writeLabState<T>(v: LabVersion, state: T): void {
  try {
    window.localStorage.setItem(labStateKey(v), JSON.stringify(state));
  } catch {
    // no storage: the flow still works for this page load
  }
}
export function clearLabState(v: LabVersion): void {
  try {
    window.localStorage.removeItem(labStateKey(v));
  } catch {
    // ignore
  }
}
