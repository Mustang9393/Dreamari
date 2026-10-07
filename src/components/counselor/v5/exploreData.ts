// Explore's signals for the counselor (8 Oct 2026): demand, growth and pay
// for a career in a state, who among your students saved it, and the same
// for schools. Shared by the curated rows and the detail sheets, so a card's
// chip and its sheet never disagree. Pay is real (BLS OEWS by state).

import { useMemo } from "react";
import { ALL_CATALOG_CAREERS, type CatalogCareer } from "@/components/app/catalog";
import { careerSlug } from "@/components/career/slug";
import { STATE_WAGES } from "@/components/career/stateWages";
import type { College } from "@/components/colleges/data";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { careerById, toV5 } from "@/lib/counselorV5";

/** DEMO-ONLY: the demo school's state; production reads the school's own. */
export const HOME_STATE = "New Jersey";
export const HOME_STATE_CODE = "NJ";

const TRADES = /construction|machines|making|driving|food/i;
/** Skilled trades or everything; one switch above the whole Explore page. */
export type Pathway = "all" | "trades";
export const isTradeCareer = (c: { world: string }) => TRADES.test(c.world);
export const isTradeSchool = (c: College) => c.level !== "Bachelor's degrees";

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export type Signal = { pay: number; openings: number; growth: number };

/** Pay is BLS. DEMO-ONLY: openings a year and five-year growth are seeded
 *  until state projections are loaded (plan section 3). */
export function careerSignal(title: string, state: string): Signal | null {
  const pay = STATE_WAGES[careerSlug(title)]?.[state];
  if (!pay) return null;
  const h = hash(`${title}${state}`);
  // skewed, so a top 10 spreads out instead of ten near-equal figures
  return { pay, openings: Math.round(150 + ((h % 1000) / 1000) ** 3 * 9000), growth: Math.round(20 + ((h >> 3) % 160)) / 10 };
}

export function payRows(state: string, trades: boolean) {
  const out: ({ career: CatalogCareer } & Signal)[] = [];
  for (const c of ALL_CATALOG_CAREERS) {
    if (trades && !isTradeCareer(c)) continue;
    const s = careerSignal(c.title, state);
    if (s) out.push({ career: c, ...s });
  }
  return out;
}

export const money = (n: number) => `$${Math.round(n / 1000)}K`;
/** Prices keep their detail under $10K: $614, $4.2K, $18K. */
export const price = (n: number) => (n < 1000 ? `$${Math.max(0, Math.round(n))}` : n < 10000 ? `$${(n / 1000).toFixed(1)}K` : money(n));
export const growthText = (g: number) => `+${g.toFixed(1)}%`;
export const jobsText = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K jobs` : `${n} jobs`);

/** Your students who saved each career, keyed by lower-case title. */
export function useSavers(): Map<string, CounselorStudent[]> {
  const roster = useReviewedRoster();
  return useMemo(() => {
    const m = new Map<string, CounselorStudent[]>();
    for (const s of roster) {
      for (const id of toV5(s).dreamari.saved) {
        const title = careerById(id)?.title.toLowerCase();
        if (!title) continue;
        m.set(title, [...(m.get(title) ?? []), s]);
      }
    }
    return m;
  }, [roster]);
}

/** DEMO-ONLY: which of your students are looking at a school, seeded from
 *  the roster until the student app's saved schools reach the counselor. */
export function schoolStudents(c: College, roster: CounselorStudent[]): CounselorStudent[] {
  const seed = hash(c.slug);
  const n = c.state === HOME_STATE_CODE ? 3 + (seed % 5) : seed % 4;
  return roster.filter((s) => s.grade >= 11).filter((_, i) => (i * 7 + seed) % 11 === 0).slice(0, n);
}

/** The careers a profile says need no four-year degree. */
export function noDegreeNeeded(degree: string | undefined) {
  return !!degree && !/bachelor|master|doctor|professional/i.test(degree);
}

// ---- guiding a student (8 Oct 2026) -----------------------------------------
// Chandu: "This page is supposed to help the counselors understand the careers
// and colleges... better than the student, and also from the POV that they
// need to help the students understand it more and guide them and help them
// achieve". So the sheet names real schools, the ladder, the classes to take
// now and what to do each year.

/** DEMO-ONLY: high school classes that matter most per world, a hand map
 *  until O*NET knowledge areas are mapped to course catalogs. */
const CLASSES: Record<string, string[]> = {
  "Health & Medicine": ["Biology", "Chemistry", "Anatomy or Health Science", "Algebra II"],
  "Business & Finance": ["Algebra II", "Statistics", "Economics", "Accounting or Business"],
  "Tech & Engineering": ["Algebra II", "Physics", "Computer Science", "Pre-Calculus"],
  "Arts, Media & Sport": ["Art, Media or Music", "English", "A class that builds a portfolio"],
  "Building & Construction": ["Geometry", "Construction or Shop (CTE)", "Physics"],
  "Fixing Machines & Engines": ["Auto or Engine Tech (CTE)", "Physics", "Geometry"],
  "Factories & Making Things": ["Manufacturing or Shop (CTE)", "Geometry", "Physics"],
  "Driving, Flying & Shipping": ["Physics", "Algebra II", "Geography"],
  "Law, Safety & Justice": ["English", "Government", "Psychology", "Speech or Debate"],
  "Science & Research": ["Biology", "Chemistry", "Physics", "Statistics"],
  "Teaching & Education": ["English", "Psychology", "The subject they want to teach"],
  "Farming, Animals & Nature": ["Biology", "Earth Science", "Agriculture (CTE)"],
  "Counseling & Social Work": ["Psychology", "Sociology", "English"],
  "Personal Care & Community Services": ["Health", "Psychology", "Cosmetology or Human Services (CTE)"],
  "Food & Cooking": ["Culinary Arts (CTE)", "Chemistry", "Business"],
};
export const classesFor = (world: string) => CLASSES[world] ?? ["English", "Algebra II", "A CTE class in the field"];

/** What a counselor does with a student, year by year, for this route. */
export function stepsByGrade(title: string, world: string, degree: string | undefined, major: string | undefined): { when: string; steps: string[] }[] {
  const short = noDegreeNeeded(degree);
  const classes = classesFor(world).slice(0, 3).join(", ");
  return [
    { when: "Grades 9 and 10", steps: [`Take ${classes}.`, `Play the ${title} simulation in Dreamari and talk about what surprised them.`] },
    { when: "Grade 11", steps: [short ? "Look at CTE, apprenticeship and trade programs, and visit one." : `Shortlist schools with ${major ?? "the right major"}, and visit one.`, "Set up a job shadow or a club that does this work."] },
    { when: "Grade 12", steps: [short ? "Apply to an apprenticeship or a trade program early." : `Apply to programs in ${major ?? "the major"}.`, "File the FAFSA and compare aid offers together."] },
  ];
}

/** Real schools in the list whose programs name what people study for the
 *  career, home state first, then by how many finish. */
export function schoolsTeaching(studies: string[], colleges: College[]): { c: College; program: string }[] {
  const keys = studies.map((s) => s.toLowerCase().replace(/[,/].*$/, "").trim()).filter(Boolean);
  const out: { c: College; program: string }[] = [];
  for (const c of colleges) {
    const hit = c.detail?.programmes.map((p) => p.name).find((n) => { const l = n.toLowerCase(); return keys.some((k) => l.includes(k) || k.includes(l)); });
    if (hit) out.push({ c, program: hit });
  }
  return out.sort((a, b) => Number(b.c.state === HOME_STATE_CODE) - Number(a.c.state === HOME_STATE_CODE) || (b.c.finish ?? 0) - (a.c.finish ?? 0));
}
