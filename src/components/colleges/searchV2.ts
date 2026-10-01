// Explore Schools, Browse all v2 (30 Sept 2026): the data behind the
// SchooLinks-style filter bar Joshua asked for ("the main filters sit
// directly above the results as dropdowns instead of requiring students to
// open a large sidebar"). Every filter and sort reads a real field:
// - School type and degree type: the school's level and the degree levels
//   its programmes are listed under (College Scorecard).
// - Program: the programme names (CIP titles) each school graduates.
// - Admissions: acceptance rate and the SAT / ACT middle 50%.
// - Academic fit: the app's own fitFor (For you uses the same), with the
//   student's SAT when they enter one; "Likely" instead of "Safety".
// - Location: state, and miles from a ZIP. Coordinates are approximate city
//   centres (DEMO-ONLY; production geocodes the school's address).
// - "Outcomes rank" stands in for a university ranking: there is no
//   licensed ranking in the data, so it ranks on the government's own
//   outcomes (graduation, return rate, loan repayment), and says so.

import type { College, Level } from "./data";
import { tuitionFees } from "./data";
import { EXTRA } from "./extra";
import { fitFor } from "./pathway";

export type SchoolType = "4-year" | "2-year" | "Trade" | "Graduate";
export type Degree = "Certificate" | "Associate" | "Bachelor's" | "Master's" | "Doctorate";
export type FitV2 = "Reach" | "Target" | "Likely" | "Open";
export type SortKey = "relevant" | "acceptance" | "tuition" | "outcomes" | "program";

export const SCHOOL_TYPES: { key: SchoolType; label: string; level?: Level }[] = [
  { key: "4-year", label: "4-year", level: "Bachelor's degrees" },
  { key: "2-year", label: "Community college / 2-year", level: "Associate degrees" },
  { key: "Trade", label: "Trade & technical", level: "Certificates" },
  { key: "Graduate", label: "Graduate-only" },
];
export const DEGREES: Degree[] = ["Certificate", "Associate", "Bachelor's", "Master's", "Doctorate"];
const DEGREE_KEY: Record<string, Degree> = {
  Certificates: "Certificate", "Certificates (under 1 year)": "Certificate", "Certificates (1-2 years)": "Certificate",
  "Associate degrees": "Associate", "Bachelor's degrees": "Bachelor's", "Master's degrees": "Master's", Doctorates: "Doctorate",
};
export const SORTS: { key: SortKey; label: string; note?: string }[] = [
  { key: "relevant", label: "Most relevant" },
  { key: "acceptance", label: "Acceptance rate", note: "highest first" },
  { key: "tuition", label: "Tuition cost", note: "lowest first" },
  { key: "outcomes", label: "Outcomes rank", note: "graduation, return and repayment" },
  { key: "program", label: "Program relevance", note: "offers your program first" },
];

export function typeOf(c: College): SchoolType {
  return c.level === "Bachelor's degrees" ? "4-year" : c.level === "Associate degrees" ? "2-year" : "Trade";
}

export function degreesOf(c: College): Set<Degree> {
  const out = new Set<Degree>();
  for (const k of Object.keys(EXTRA[c.slug]?.programmes ?? {})) {
    const d = DEGREE_KEY[k] ?? (k.startsWith("Certificate") ? "Certificate" : undefined);
    if (d) out.add(d);
  }
  if (!out.size) out.add(c.level === "Bachelor's degrees" ? "Bachelor's" : c.level === "Associate degrees" ? "Associate" : "Certificate");
  return out;
}

/** Every programme a school graduates, with its share of graduates. */
export function programsOf(c: College): { name: string; share: number }[] {
  const out: { name: string; share: number }[] = [];
  for (const rows of Object.values(EXTRA[c.slug]?.programmes ?? {})) {
    for (const r of rows) out.push({ name: r.name, share: parseFloat(r.share) || 0 });
  }
  return out;
}

/** Friendly program name: drop CIP's trailing ", General" and slashes. */
export function programLabel(name: string): string {
  return name.replace(/, General$/i, "").replace(/\s*\/\s*/g, " / ");
}

let programIndexCache: { name: string; label: string; schools: number }[] | null = null;
export function programIndex(colleges: College[]): { name: string; label: string; schools: number }[] {
  if (programIndexCache) return programIndexCache;
  const n = new Map<string, Set<string>>();
  for (const c of colleges) for (const p of programsOf(c)) (n.get(p.name) ?? n.set(p.name, new Set()).get(p.name)!).add(c.slug);
  programIndexCache = [...n.entries()].map(([name, s]) => ({ name, label: programLabel(name), schools: s.size })).sort((a, b) => b.schools - a.schools || a.label.localeCompare(b.label));
  return programIndexCache;
}

export function offers(c: College, program: string): number {
  const p = programsOf(c).filter((x) => x.name === program);
  return p.reduce((m, x) => Math.max(m, x.share), 0) || (p.length ? 0.1 : 0);
}

/** SAT composite middle 50% (reading + math), when the school reports it. */
export function satRange(c: College): { lo: number; hi: number } | null {
  const e = EXTRA[c.slug];
  return e?.satR && e?.satM ? { lo: e.satR.lo + e.satM.lo, hi: e.satR.hi + e.satM.hi } : null;
}
export function actRange(c: College): { lo: number; hi: number } | null {
  const a = EXTRA[c.slug]?.act;
  return a ? { lo: a.lo, hi: a.hi } : null;
}

/** Reach / Target / Likely: the app's own GPA bands, sharpened by the
 *  student's SAT against the school's middle 50% when both exist. */
export function fitV2(c: College, gpa: number | null, sat: number | null): FitV2 | null {
  const base = fitFor(c, gpa);
  if (base === "Open admission") return "Open";
  if (base === "Fit unavailable") return null;
  let fit: FitV2 = base === "Safety" ? "Likely" : base;
  const r = satRange(c);
  if (sat && r) {
    if (sat < r.lo) fit = "Reach";
    else if (sat > r.hi && fit !== "Reach") fit = "Likely";
    else if (sat >= r.lo && fit === "Likely" && sat <= (r.lo + r.hi) / 2) fit = "Target";
  }
  if (c.admitRate !== null && c.admitRate < 15) fit = "Reach";
  return fit;
}

/** Government outcomes, weighted: finish 40%, return 30%, repay 30%. */
export function outcomesScore(c: College): number {
  const parts: [number | null, number][] = [[c.finish, 0.4], [c.retention, 0.3], [c.repay, 0.3]];
  const have = parts.filter(([v]) => v !== null) as [number, number][];
  if (!have.length) return 0;
  const w = have.reduce((n, [, x]) => n + x, 0);
  return have.reduce((n, [v, x]) => n + v * x, 0) / w;
}

export function costOf(c: College): number | null {
  return tuitionFees(c) ?? c.netPrice;
}

// ---- Location (DEMO-ONLY coordinates) ---------------------------------------

const CITY: Record<string, [number, number]> = {
  "New Brunswick,NJ": [40.49, -74.45], "Ewing,NJ": [40.27, -74.8], "Mahwah,NJ": [41.09, -74.14], "Paramus,NJ": [40.94, -74.07], "Edison,NJ": [40.52, -74.41],
  "Montclair,NJ": [40.82, -74.21], "Newark,NJ": [40.74, -74.17], "Princeton,NJ": [40.35, -74.66], "Glassboro,NJ": [39.7, -75.11], "Union,NJ": [40.7, -74.26],
  "Brookings,SD": [44.31, -96.8], "Vermillion,SD": [42.78, -96.93], "Sioux Falls,SD": [43.54, -96.73], "Kyle,SD": [43.42, -102.18], "Watertown,SD": [44.9, -97.12],
  "Madison,SD": [44.01, -97.11], "Mitchell,SD": [43.71, -98.03], "Rapid City,SD": [44.08, -103.23], "Spearfish,SD": [44.49, -103.86], "Aberdeen,SD": [45.46, -98.49],
  "Yankton,SD": [42.87, -97.4], "Mission,SD": [43.31, -100.66], "Sisseton,SD": [45.66, -97.05], "Normal,IL": [40.51, -88.99], "Potsdam,NY": [44.67, -74.98],
  "College Station,TX": [30.63, -96.33], "Tempe,AZ": [33.43, -111.94], "Phoenix,AZ": [33.45, -112.07], "Miami,FL": [25.76, -80.19], "Manchester,NH": [42.99, -71.46],
  "Norfolk,VA": [36.85, -76.29], "Bluefield,WV": [37.27, -81.22], "Jefferson City,MO": [38.58, -92.17], "Cloquet,MN": [46.72, -92.46], "Lame Deer,MT": [45.62, -106.67],
  "Portland,ME": [43.66, -70.26], "Virginia Beach,VA": [36.85, -75.98], "Wilmington,DE": [39.74, -75.55], "Valdosta,GA": [30.83, -83.28], "Cleveland,WI": [43.92, -87.75],
  "Las Vegas,NV": [36.17, -115.14], "Memphis,TN": [35.15, -90.05], "New York,NY": [40.71, -74.01], "Tucson,AZ": [32.22, -110.97], "Matteson,IL": [41.5, -87.71],
  "Louisville,KY": [38.25, -85.76], "Salida,CA": [37.71, -121.08],
};
const ZIPS: Record<string, { place: string; at: [number, number] }> = {
  "07090": { place: "Westfield, NJ", at: [40.66, -74.35] },
  "07102": { place: "Newark, NJ", at: [40.74, -74.17] },
  "08901": { place: "New Brunswick, NJ", at: [40.49, -74.45] },
  "10001": { place: "New York, NY", at: [40.75, -74.0] },
  "57104": { place: "Sioux Falls, SD", at: [43.55, -96.72] },
  "60601": { place: "Chicago, IL", at: [41.88, -87.62] },
  "62701": { place: "Springfield, IL", at: [39.8, -89.65] },
  "77001": { place: "Houston, TX", at: [29.76, -95.37] },
  "85281": { place: "Tempe, AZ", at: [33.43, -111.93] },
  "33101": { place: "Miami, FL", at: [25.78, -80.2] },
};
export const HOME_ZIP = "07090";

export function placeForZip(zip: string): { place: string; at: [number, number] } | null {
  return ZIPS[zip] ?? null;
}

export function milesFrom(c: College, at: [number, number]): number | null {
  const p = CITY[`${c.city},${c.state}`];
  if (!p) return null;
  const R = 3959;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(p[0] - at[0]);
  const dLon = toRad(p[1] - at[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(at[0])) * Math.cos(toRad(p[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
export const DISTANCES = [25, 50, 100, 250, 500] as const;
