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
