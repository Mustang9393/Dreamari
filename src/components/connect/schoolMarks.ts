// Real school marks for Connect's professional profiles (About card):
// verified professionals list where they studied in `pro.education`
// (data.ts), and this looks up a small logo tile for any school we could
// source a clean vector mark for, instead of a bare GraduationCap icon.
//
// Sourced the same way as the corporate partner marks (PartnerTicker.tsx,
// public/images/marketing/partners/ATTRIBUTION.md): Wikimedia Commons (or,
// where a mark is non-free/trademarked and only hosted locally, English
// Wikipedia's own upload) via Special:FilePath-equivalent, each file trimmed
// to its own ink bounding box so it sizes correctly at small tile sizes.
// Files live in public/images/connect/schools; sources in that folder's
// own ATTRIBUTION.md. Logos are trademarks of their institutions and
// appear here only to identify where a professional studied.
//
// Deliberately NOT sourced (left iconless, existing GraduationCap tile
// still shows): "School of Motion" (an online design-education brand, not
// an accredited university -- no seal/wordmark exists to source) and
// "Art Center College of Design" (the only mark on Commons is an abstract
// orange dot with no wordmark or seal -- doesn't read as identifying the
// school at a small icon size, so it's skipped rather than faked).

export type SchoolMark = { file: string; ratio: number };

/** Keyed by the exact substring that appears inside a `pro.education`
 *  string in data.ts (grep `education: "` there for the current set) --
 *  not necessarily the school's full formal name, since a few entries
 *  abbreviate ("Cornell", "Johns Hopkins", "NYU Stern", "Wharton"). */
export const SCHOOL_MARKS: Record<string, SchoolMark> = {
  "University of Washington": { file: "university-of-washington.svg", ratio: 1.0 },
  "Arizona State University": { file: "arizona-state-university.svg", ratio: 1.0 },
  "University of Michigan": { file: "university-of-michigan.svg", ratio: 1.0 },
  "Austin Community College": { file: "austin-community-college.svg", ratio: 1.485 },
  "Texas State University": { file: "texas-state-university.svg", ratio: 1.0 },
  "Savannah College of Art and Design": { file: "savannah-college-of-art-and-design.png", ratio: 1.003 },
  "Georgia Tech": { file: "georgia-tech.svg", ratio: 1.0 },
  "University of Illinois": { file: "university-of-illinois.svg", ratio: 1.001 },
  "Boston College": { file: "boston-college.svg", ratio: 1.0 },
  "University of Florida": { file: "university-of-florida.svg", ratio: 1.0 },
  Wharton: { file: "wharton.svg", ratio: 3.88 },
  "Howard University": { file: "howard-university.svg", ratio: 1.0 },
  UCLA: { file: "ucla.svg", ratio: 1.0 },
  Cornell: { file: "cornell.svg", ratio: 1.0 },
  "University of Minnesota": { file: "university-of-minnesota.svg", ratio: 0.996 },
  "Rutgers University": { file: "rutgers-university.svg", ratio: 1.001 },
  "University of Texas at Austin": { file: "university-of-texas-at-austin.svg", ratio: 1.0 },
  "Penn State University": { file: "penn-state-university.svg", ratio: 1.044 },
  "University of Oregon": { file: "university-of-oregon.svg", ratio: 1.0 },
  "University of California, Berkeley": { file: "university-of-california-berkeley.svg", ratio: 1.0 },
  "Boston University": { file: "boston-university.svg", ratio: 1.0 },
  "Johns Hopkins": { file: "johns-hopkins.svg", ratio: 0.739 },
  "Stevens Institute of Technology": { file: "stevens-institute-of-technology.svg", ratio: 1.0 },
  "University of Maryland": { file: "university-of-maryland.svg", ratio: 1.0 },
  "University of Arizona": { file: "university-of-arizona.svg", ratio: 1.0 },
  "Mayo Clinic Alix School of Medicine": { file: "mayo-clinic-alix-school-of-medicine.png", ratio: 1.004 },
  "Indiana University": { file: "indiana-university.svg", ratio: 0.999 },
  "Baruch College": { file: "baruch-college.png", ratio: 1.0 },
  "NYU Stern": { file: "nyu-stern.png", ratio: 7.232 },
  "UC San Diego": { file: "uc-san-diego.svg", ratio: 0.996 },
  "Stanford University": { file: "stanford-university.svg", ratio: 1.0 },
};

export type SchoolMatch = { name: string; file: string; ratio: number };

/** Every school in an `education` string that has a sourced mark, in the
 *  order the school names appear, deduped. Splits on "; " first (Marcus
 *  Reyes' "A.D.N. Austin Community College; B.S.N. Texas State University"
 *  is two schools; most entries are a single segment) so a school name
 *  that's a substring of another segment's text never cross-matches. */
export function schoolsIn(education: string): SchoolMatch[] {
  const segments = education.split("; ");
  const seen = new Set<string>();
  const results: SchoolMatch[] = [];
  for (const segment of segments) {
    const hits: { name: string; index: number }[] = [];
    for (const name of Object.keys(SCHOOL_MARKS)) {
      const index = segment.indexOf(name);
      if (index !== -1) hits.push({ name, index });
    }
    hits.sort((a, b) => a.index - b.index);
    for (const { name } of hits) {
      if (seen.has(name)) continue;
      seen.add(name);
      const mark = SCHOOL_MARKS[name];
      results.push({ name, file: mark.file, ratio: mark.ratio });
    }
  }
  return results;
}
