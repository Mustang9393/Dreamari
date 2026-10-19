// Career outlook lab data (19 Oct 2026). Joshua, after a focus group with
// students in Canada: students want "more detailed career outlook
// information": projected growth, projected job openings (growth plus
// replacement), pay by state, and state trends where available. Usman:
// "State level data can be sparse so design should handle the absence of
// data in a graceful way."
//
// The national figures are NOT new: they come from the numbers every career
// profile already carries from BLS ("People doing it", "Jobs open each
// year", and the change-by-year sentence behind the openings (i)). This file
// only parses them into numbers the Pay & Outlook tab can lay out.

import { US_STATES } from "@/lib/studentProfile";

export type NationalOutlook = {
  /** people doing the job today */
  employment: number;
  /** jobs gained or lost by `year` */
  change: number;
  year: number;
  /** change / employment, in percent */
  growthPct: number;
  /** all openings each year: new jobs plus people moving on or retiring */
  openings: number;
  /** the part of `openings` that comes from new jobs */
  fromGrowth: number;
  /** the profile's own plain-language read, e.g. "Growing faster than most jobs" */
  verdict: string;
};

export type StateOutlook = { growthPct: number; openings: number };

const num = (s: string | undefined) => {
  if (!s) return NaN;
  const n = Number(s.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

export function nationalOutlook(facts: { label: string; value: string }[], openingsNote?: string): NationalOutlook | null {
  const employment = num(facts.find((f) => /people doing/i.test(f.label))?.value);
  const openings = num(facts.find((f) => /open each year/i.test(f.label))?.value);
  const m = openingsNote?.match(/changes by about ([+-]?[\d,]+) by (\d{4})[^.]*\.\s*(.*)$/);
  if (!m || !(employment > 0) || !(openings > 0)) return null;
  const change = num(m[1]);
  const year = Number(m[2]);
  const growthPct = (change / employment) * 100;
  // the profile's sentence ("It is growing faster than most jobs.") reads as
  // a verdict once its subject goes; a declining job's sentence is a whole
  // explanation, so it gets a short one of the same voice
  const said = m[3].match(/^It is ([^.;,]+)/i)?.[1];
  const verdict = said ? said[0].toUpperCase() + said.slice(1) : change < 0 ? "Fewer of these jobs ahead" : "About as many of these jobs ahead";
  // BLS projections run ten years, so the yearly share from new jobs is the
  // ten-year change spread evenly (none when the job is shrinking)
  const fromGrowth = Math.max(0, Math.round(change / 10));
  return { employment, change, year, growthPct, openings, fromGrowth: Math.min(fromGrowth, openings), verdict };
}

export const pct = (p: number) => {
  const r = Math.abs(p) >= 1 ? Math.round(p) : Math.round(p * 10) / 10;
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}%`;
};

export const count = (n: number) => {
  const r = n >= 1000 ? Math.round(n / 100) * 100 : n >= 100 ? Math.round(n / 10) * 10 : Math.max(10, Math.round(n));
  return r.toLocaleString("en-US");
};

// ---------------------------------------------------------------------------
// DEMO-ONLY: state projections. The real source is the states' long-term
// occupational projections (Projections Central, projectionscentral.org,
// the same SOC codes STATE_WAGE_SOC maps). Until Usman wires them, each
// state's figure is seeded from the national one so the layout can be
// judged with realistic spread, and about one state in five, plus a few
// whole careers, has no forecast, so the sparse-data handling is always on
// screen. Replace this block with the real table; keep the null cases.

// rough share of US jobs by state (population share, %), for openings
const SHARE: Record<string, number> = {
  California: 11.6, Texas: 9.1, Florida: 6.8, "New York": 5.8, Pennsylvania: 3.8, Illinois: 3.7, Ohio: 3.5, Georgia: 3.3,
  "North Carolina": 3.2, Michigan: 3.0, "New Jersey": 2.8, Virginia: 2.6, Washington: 2.3, Arizona: 2.2, Tennessee: 2.1,
  Massachusetts: 2.1, Indiana: 2.0, Maryland: 1.8, Missouri: 1.8, Wisconsin: 1.8, Colorado: 1.8, Minnesota: 1.7,
  "South Carolina": 1.6, Alabama: 1.5, Louisiana: 1.4, Kentucky: 1.3, Oregon: 1.3, Oklahoma: 1.2, Connecticut: 1.1,
  Utah: 1.0, Iowa: 0.95, Nevada: 0.95, Arkansas: 0.9, Kansas: 0.88, Mississippi: 0.88, "New Mexico": 0.63, Nebraska: 0.59,
  Idaho: 0.58, "West Virginia": 0.52, Hawaii: 0.43, "New Hampshire": 0.42, Maine: 0.41, Montana: 0.33, "Rhode Island": 0.33,
  Delaware: 0.31, "South Dakota": 0.27, "North Dakota": 0.23, Alaska: 0.22, "Washington, D.C.": 0.2, Vermont: 0.19, Wyoming: 0.17,
};

function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

// careers whose states publish nothing yet (the "no state forecasts" case);
// the demo default, Software Engineer, always has them
const careerHasStates = (slug: string) => slug === "software-engineer" || seed(`${slug}:any`) >= 0.15;

export function stateOutlook(slug: string, state: string, national: NationalOutlook | null): StateOutlook | null {
  if (!national || !careerHasStates(slug) || SHARE[state] === undefined) return null;
  // the demo student's state (New Jersey) always has a forecast; the rest
  // are missing about one time in five
  if (state !== "New Jersey" && seed(`${slug}:${state}:gap`) < 0.2) return null;
  // most states sit near the US figure, a few well above or below it
  const u = seed(`${slug}:${state}:g`) * 2 - 1;
  // (cubed, so a ranked top five spreads out instead of tying)
  const spread = Math.max(10, Math.abs(national.growthPct) * 1.5);
  const growthPct = national.growthPct + Math.sign(u) * Math.pow(Math.abs(u), 3) * spread;
  const openings = national.openings * (SHARE[state] / 100) * (0.8 + 0.4 * seed(`${slug}:${state}:o`));
  return { growthPct, openings };
}

/** Every state with a forecast, fastest growing first. Empty when the
 *  career's states publish none. */
export function statesByGrowth(slug: string, national: NationalOutlook | null) {
  return US_STATES.map((state) => ({ state, o: stateOutlook(slug, state, national) }))
    .filter((r): r is { state: string; o: StateOutlook } => r.o !== null)
    .sort((a, b) => b.o.growthPct - a.o.growthPct);
}
