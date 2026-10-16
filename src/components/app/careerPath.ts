// Explore's Skip college switch (16 Oct 2026; Chandu: "for the explore
// careers tab lets have a switch without cluttering to show college paths
// and non college paths... The goal is to show trade/non college careers
// for those that want that", then "lets make it a toggle switch that then
// shows only trade/non college level stuff").
//
// Every career is sorted onto a path from the same fact Career Detail
// already shows as "Typical degree" (the BLS typical entry education): a
// bachelor's or higher is the college path; a high school diploma, a
// certificate, an apprenticeship, "no set degree" or a 2-year degree is the
// no-college path. A career whose door is open both ways ("High school
// diploma; many hold a bachelor's") sits on both, so the switch never hides
// it. Nothing here invents a requirement: no fact, no path.

import { careerSlug } from "@/components/career/slug";
import { careerProfile } from "@/components/career/profiles";
import { reportV2 } from "@/components/profile/report-data";
import type { CatalogCareer } from "./catalog";

export type CareerPath = "college" | "trades";
/** What the switch shows: every career, or only the no-college path. */
export type PathChoice = "all" | "trades";

export function isPathChoice(value: string | undefined): value is PathChoice {
  return value === "all" || value === "trades";
}

// DEMO-ONLY: 50 catalog careers have no "Typical degree" fact in their
// profile yet, so their BLS typical entry education is written here until
// the profiles carry it. Drop a title from this table the moment its
// profile gets the fact; the profile wins whenever both exist.
const TYPICAL_DEGREE_FALLBACK: Record<string, string> = {
  "Addiction Counselor": "Bachelor's degree",
  "Community Health Worker": "High school diploma or equivalent",
  "Family Therapist": "Master's degree",
  "Healthcare Social Worker": "Master's degree",
  "Human Services Assistant": "High school diploma or equivalent",
  "Probation Officer": "Bachelor's degree",
  "Rehabilitation Counselor": "Master's degree",
  "Social Worker": "Bachelor's degree",
  "Aircraft Assembler": "High school diploma or equivalent",
  "Apparel Production Manager": "Bachelor's degree",
  "Assembly Worker": "High school diploma or equivalent",
  "Cabinetmaker": "High school diploma or equivalent",
  "CNC Machinist": "High school diploma + training",
  "Engine Assembler": "High school diploma or equivalent",
  "Gemologist": "Postsecondary certificate",
  "Machinist": "High school diploma + training",
  "Packaging Machine Operator": "High school diploma or equivalent",
  "Semiconductor Process Technician": "Associate's degree",
  "Welder": "High school diploma + training",
  "Animal Trainer": "High school diploma or equivalent",
  "Farmer or Rancher": "High school diploma or equivalent",
  "Private Chef": "Postsecondary certificate",
  "Dental Hygienist": "Associate's degree",
  "EMT": "Postsecondary certificate",
  "Family Doctor": "Doctoral or professional degree",
  "Licensed Practical Nurse": "Postsecondary certificate",
  "Medical Assistant": "Postsecondary certificate",
  "Nursing Assistant": "Postsecondary certificate",
  "Physical Therapist Assistant": "Associate's degree",
  "Respiratory Therapist": "Associate's degree",
  "Ultrasound Technician": "Associate's degree",
  "Veterinary Technician": "Associate's degree",
  "X-Ray Technologist": "Associate's degree",
  "Airport Security Screener": "High school diploma or equivalent",
  "Animal Control Officer": "High school diploma or equivalent",
  "Court Bailiff": "High school diploma or equivalent",
  "Fire Investigator": "High school diploma + fire academy",
  "Firefighter": "Postsecondary certificate",
  "Paralegal": "Associate's degree",
  "Police Officer": "High school diploma (police academy required)",
  "Private Investigator": "High school diploma or equivalent",
  "Security Guard": "High school diploma or equivalent",
  "Barber": "Postsecondary certificate",
  "Embalmer": "Associate's degree",
  "Esthetician": "Postsecondary certificate",
  "Funeral Director": "Associate's degree",
  "Makeup Artist": "Postsecondary certificate",
  "Nail Technician": "Postsecondary certificate",
  "Industrial-Organizational Psychologist": "Master's degree",
  "Game Programmer": "Bachelor's degree",
};

const COLLEGE = /bachelor|master|doctor|professional degree|law degree|j\.d\./i;
const TRADES = /high school|no formal|no set degree|no specific|postsecondary|certificat|associate|apprentice|some college|flight school|academy|licen|training/i;

/** The "Typical degree" line this career shows on its detail page. */
export function typicalDegree(career: Pick<CatalogCareer, "title">): string | undefined {
  const slug = careerSlug(career.title);
  const fromProfile = careerProfile(slug)?.facts.find((f) => f.label === "Typical degree")?.value;
  if (fromProfile) return fromProfile;
  const fromReport = reportV2(slug)?.education.find((e) => e.common)?.name;
  if (fromReport) return fromReport;
  return TYPICAL_DEGREE_FALLBACK[career.title];
}

const cache = new Map<string, ReadonlySet<CareerPath>>();

/** Which path(s) this career sits on. Empty when nothing is known: such a
 *  career shows on All only, never guessed onto a path. */
export function careerPaths(career: Pick<CatalogCareer, "title">): ReadonlySet<CareerPath> {
  const hit = cache.get(career.title);
  if (hit) return hit;
  const degree = typicalDegree(career);
  const paths = new Set<CareerPath>();
  if (degree) {
    if (COLLEGE.test(degree)) paths.add("college");
    if (TRADES.test(degree)) paths.add("trades");
    // "Bachelor's degree; many hold an MFA" is still a college door, but a
    // trade word inside a college line ("training", "license") must not
    // put a surgeon on the trades path.
    if (paths.has("college") && paths.has("trades") && !/high school|no set degree|no formal|certificate|associate|apprentice/i.test(degree)) paths.delete("trades");
  }
  cache.set(career.title, paths);
  return paths;
}

export function onPath(career: Pick<CatalogCareer, "title">, choice: PathChoice): boolean {
  if (choice === "all") return true;
  return careerPaths(career).has(choice);
}

export function filterByPath<T extends Pick<CatalogCareer, "title">>(careers: T[], choice: PathChoice): T[] {
  if (choice === "all") return careers;
  return careers.filter((c) => onPath(c, choice));
}

/** The "Typical pay" figure Career Detail shows, as a number (NaN when
 *  unknown), so a pay rail sorts by the same number the student sees. */
export function typicalPayValue(career: CatalogCareer): number {
  const fact = careerProfile(careerSlug(career.title))?.facts.find((f) => f.label === "Typical pay")?.value;
  const raw = fact ?? career.salary;
  return raw ? parseInt(raw.replace(/\D/g, ""), 10) : NaN;
}

export type PathRail = { id: string; title: string; careers: CatalogCareer[]; group: "theme" | "world" };

// The Skip college view cannot reuse Browse's curated rows: those rows
// were picked around degree careers, and filtering them leaves ~20 of the
// 186 trades careers in the catalog (Tech & Engineering and Typical Pay
// empty out completely). So this view builds its own rails from the whole
// catalog: three hooks a student weighing "no 4-year degree" actually asks
// about (what pays, what pays me while I train, what is quick), then every
// world with enough careers to fill a row. Worlds under the floor stay
// reachable through search's Browse by category.
const WORLD_RAIL_FLOOR = 12;
const PAY_FLOOR = 70_000;

export function buildTradesRails(catalog: CatalogCareer[]): PathRail[] {
  const trades = filterByPath(catalog, "trades");
  const degree = (c: CatalogCareer) => typicalDegree(c) ?? "";
  const pay = trades.filter((c) => typicalPayValue(c) >= PAY_FLOOR).sort((a, b) => typicalPayValue(b) - typicalPayValue(a));
  const apprentice = trades.filter((c) => /apprentice/i.test(degree(c)));
  const twoYears = trades.filter((c) => /associate|certificat/i.test(degree(c)));
  const byWorld = new Map<string, CatalogCareer[]>();
  for (const c of trades) byWorld.set(c.world, [...(byWorld.get(c.world) ?? []), c]);
  const worlds = [...byWorld.entries()].filter(([, v]) => v.length >= WORLD_RAIL_FLOOR).sort((a, b) => b[1].length - a[1].length);
  const rails: PathRail[] = [
    // Same title form as Browse's own "Typical Pay: $100K +" row.
    { id: "trades-pay", title: "Typical Pay: $70K +", careers: pay, group: "theme" },
    { id: "trades-apprentice", title: "Paid Apprenticeships", careers: apprentice, group: "theme" },
    { id: "trades-2-years", title: "Ready in 2 Years or Less", careers: twoYears, group: "theme" },
    ...worlds.map(([world, careers]) => ({ id: `trades-${careerSlug(world)}`, title: world, careers, group: "world" as const })),
  ];
  return rails.filter((r) => r.careers.length >= 3);
}
