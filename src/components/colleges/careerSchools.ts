// "Schools for this career at this level", one definition shared by the
// Career Detail Education tab (its "· N colleges" count) and Explore
// Schools' Browse all (the curated list that count opens), so the number a
// student taps is the number of schools they land on. Mirrors dreamari.com,
// where each credential row reads "Bachelor's degree · 686 colleges" and
// opens Explore Schools filtered "For Coach or Scout · Bachelor's degree"
// (Chandu, 20 Oct 2026: "IT shows number of colleges and when you click on
// it it should take you to that curated list of colleges").
//
// A school counts when it grants that degree and one of its programs
// matches a telling word from the career's "What people study for it"
// (Finance, Computer, Nursing). The dataset lists programs per school, not
// per degree level, so "teaches Finance and grants master's" stands in for
// "has a Finance master's". Production has the real per-level counts.

import type { College } from "./data";
import { degreesOf, programsOf, type Degree } from "./searchV2";

/** The career and credential a curated list is for. */
export type CareerPick = { slug: string; name: string; degree: Degree; levelName: string; words: string[] };

const STOP = new Set(["general", "studies", "study", "science", "sciences", "and", "other", "the", "pre", "arts", "technology", "management"]);

/** One telling word per major: "Computer Science" -> computer, "Pre-Law"
 *  -> law, "Nursing (BSN)" -> nursing. */
export function majorWords(studies: { name: string }[]): string[] {
  const words = studies
    .map((s) => s.name.replace(/\(.*?\)/g, "").split(/[\s/,-]+/).map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).find((w) => w.length > 2 && !STOP.has(w)))
    .filter((w): w is string => !!w);
  return [...new Set(words)];
}

/** The degree a credential line names, or null when no school is involved
 *  (a diploma, on-the-job training). */
export function degreeOf(credential: string): Degree | null {
  const c = credential.toLowerCase();
  if (/certificate/.test(c)) return "Certificate";
  if (/associate/.test(c)) return "Associate";
  if (/bachelor/.test(c)) return "Bachelor's";
  if (/master/.test(c)) return "Master's";
  if (/doctor|law degree|j\.d\./.test(c)) return "Doctorate";
  return null;
}

export function teaches(c: College, degree: Degree, words: string[]): boolean {
  if (!words.length || !degreesOf(c).has(degree)) return false;
  const rx = new RegExp(`\\b(${words.join("|")})`, "i");
  return programsOf(c).some((p) => rx.test(p.name));
}

/** Explore Schools, Browse all, filtered to this career and credential. */
export function careerSchoolsHref(slug: string, credential: string): string {
  return `/colleges?view=browse&career=${encodeURIComponent(slug)}&level=${encodeURIComponent(credential)}`;
}
