// Career -> education route -> program -> schools that actually offer it.
// The logic behind Explore Schools' "For you" (Joshua Pierce, Slack, 10 Sept
// 2026, from the Replit reference): the career decides which routes and
// institution types are even relevant, the route's recommended major decides
// which schools count, and Reach / Target / Safety only appears where the
// numbers (a GPA and an acceptance rate) support it. Open-admission schools
// are labelled as such, never ranked against selective ones.

import { reportV2, type CollegeStatus, type EducationRoute } from "@/components/profile/report-data";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { COLLEGES, synthDetail, type College } from "./data";
import type { StudentProfile } from "@/lib/studentProfile";

export type Pathway = {
  careerId: string;
  careerTitle: string;
  /** the common route, in plain words: "Bachelor's degree", "Training program" */
  route: string;
  routeKind: EducationRoute["kind"];
  routeTime: string;
  /** the recommended major / program */
  program: string;
  alsoRelevant: string[];
  /** a two-year start makes sense for this career */
  twoYearStart: boolean;
  /** a trade / technical route exists for this career */
  trade: boolean;
  /** 4-year degree is a real route */
  degree: boolean;
};

export type Fit = "Reach" | "Target" | "Safety" | "Open admission" | "Fit unavailable";

export type SchoolMatch = {
  college: College;
  /** the programme name at this school that lines up with the route */
  program: string;
  /** "Direct path" (offers the recommended program) or "2-year start" or "Trade route" */
  path: "Direct path" | "2-year start" | "Trade route";
  fit: Fit;
  /** the report's own reason when it lists this school */
  why: string | null;
};

export type SchoolGroups = {
  reach: SchoolMatch[];
  target: SchoolMatch[];
  safety: SchoolMatch[];
  /** selective schools we can't place without a GPA (or an acceptance rate) */
  unplaced: SchoolMatch[];
  start2: SchoolMatch[];
  trade: SchoolMatch[];
  total: number;
};

// What counts as "offers this program", per career. Programme names come from
// the federal CIP-style lists on each college (detail-ref.ts), so the match
// is on wording, kept deliberately narrow so a business school doesn't show
// up under nursing.
const PROGRAM_MATCH: Record<string, RegExp> = {
  "investment-banking": /financ|account|business admin|econom/i,
  "private-equity": /financ|account|business admin|econom/i,
  "registered-nurse": /nurs/i,
  "software-engineer": /computer|software|information/i,
  "data-scientist": /computer|data|statistic|mathemat|information/i,
  "game-designer": /game|digital arts|computer graphics|animation|computer/i,
  "food-scientist": /food|agricult|biolog|chem|nutrition/i,
  "fashion-buyer": /fashion|merchandis|marketing|retail|business admin/i,
  "airline-pilot": /aviation|aeronaut|flight|pilot/i,
};

function routeWords(route: EducationRoute): string {
  const n = route.name.toLowerCase();
  if (route.kind === "Degree") {
    if (n.includes("two-year") || n.includes("2-year") || n.includes("associate")) return "Associate, then transfer";
    if (n.includes("master")) return "Master's degree";
    if (n.includes("doctor") || n.includes("md") || n.includes("phd")) return "Doctorate";
    return "Bachelor's degree";
  }
  if (route.kind === "Training") return "Training program";
  if (route.kind === "Certificate") return "Certificate";
  if (route.kind === "Apprenticeship") return "Apprenticeship";
  return "Military training";
}

export function careerTitle(careerId: string): string {
  return ALL_PROFILE_CAREERS.find((c) => c.id === careerId)?.title ?? careerId;
}

export function pathwayFor(careerId: string | null | undefined): Pathway | null {
  if (!careerId) return null;
  const report = reportV2(careerId);
  if (!report || report.education.length === 0) return null;
  const common = report.education.find((r) => r.common) ?? report.education[0];
  const kinds = new Set(report.education.map((r) => r.kind));
  const names = report.education.map((r) => r.name.toLowerCase()).join(" | ");
  return {
    careerId,
    careerTitle: careerTitle(careerId),
    route: routeWords(common),
    routeKind: common.kind,
    routeTime: common.time,
    program: report.majors[0]?.name ?? common.name,
    alsoRelevant: report.majors.slice(1).map((m) => m.name),
    twoYearStart: /two-year|2-year|associate|community college|transfer/.test(names),
    trade: kinds.has("Training") || kinds.has("Certificate") || kinds.has("Apprenticeship"),
    degree: report.education.some((r) => r.kind === "Degree" && !/two-year|2-year|associate/.test(r.name.toLowerCase())),
  };
}

/** "3.7" -> 3.7, "3.5 to 3.9" -> 3.7, "4.0 or higher" -> 4, "Below 2.0" -> 1.8, else null */
export function parseGpa(value: string | null | undefined): number | null {
  if (!value) return null;
  if (/higher/i.test(value)) return 4;
  if (/below/i.test(value)) return 1.8;
  const nums = value.match(/\d\.\d/g)?.map(Number) ?? [];
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Indicative bands, not predictions; the caveat travels with the label. */
export function fitFor(c: College, gpa: number | null): Fit {
  if (c.admission === "open" || c.admitRate === null) return c.admission === "open" ? "Open admission" : "Fit unavailable";
  if (gpa === null) return "Fit unavailable";
  const r = c.admitRate;
  if (r < 20) return gpa >= 3.9 ? "Target" : "Reach";
  if (r < 50) return gpa >= 3.6 ? "Target" : "Reach";
  if (r < 80) return gpa >= 3.3 ? "Safety" : gpa >= 2.8 ? "Target" : "Reach";
  return gpa >= 2.5 ? "Safety" : "Target";
}

function realProgrammes(c: College): string[] | null {
  if (c.detail && !c.detail.sample) return c.detail.programmes.map((p) => p.name);
  return null;
}
function anyProgrammes(c: College): string[] {
  return (c.detail ?? synthDetail(c)).programmes.map((p) => p.name);
}

function reportEntryFor(careerId: string, c: College): { status: CollegeStatus; why: string; program: string } | null {
  const report = reportV2(careerId);
  if (!report) return null;
  const key = c.name.toLowerCase().replace(/[^a-z ]/g, "").split(" ").slice(0, 2).join(" ");
  const hit = report.colleges.find((e) => e.name.toLowerCase().replace(/[^a-z ]/g, "").startsWith(key));
  return hit ? { status: hit.status, why: hit.why, program: hit.program } : null;
}

export const HOME_STATE = "NJ";

/** The wording test for "offers the recommended program" for this pathway. */
export function programMatcher(pathway: Pathway): RegExp {
  return PROGRAM_MATCH[pathway.careerId] ?? new RegExp(pathway.program.split(/[\s,/]+/)[0], "i");
}
/** Real programme list only (no synthesised lists), so Browse shelves stay honest. */
export function offersProgram(c: College, rx: RegExp): boolean {
  return (realProgrammes(c) ?? []).some((n) => rx.test(n));
}
/** "$30K a year after aid" or null when the school doesn't publish it. */
export function costLine(c: College): string | null {
  return c.netPrice === null ? null : `$${Math.round(c.netPrice / 1000)}K a year after aid`;
}

export function schoolsFor(pathway: Pathway, profile: StudentProfile): SchoolGroups {
  const gpa = parseGpa(profile.gpa);
  const rx = PROGRAM_MATCH[pathway.careerId] ?? new RegExp(pathway.program.split(/[\s,/]+/)[0], "i");
  const preferStates = new Set(profile.states.length ? profile.states.map((s) => s.toLowerCase()) : []);
  const used = new Set<string>();
  const groups: SchoolGroups = { reach: [], target: [], safety: [], unplaced: [], start2: [], trade: [], total: 0 };

  const place = (m: SchoolMatch) => {
    if (used.has(m.college.slug)) return;
    used.add(m.college.slug);
    groups.total += 1;
    if (m.path === "2-year start") return void groups.start2.push(m);
    if (m.path === "Trade route") return void groups.trade.push(m);
    if (m.fit === "Reach") return void groups.reach.push(m);
    if (m.fit === "Target") return void groups.target.push(m);
    if (m.fit === "Safety") return void groups.safety.push(m);
    groups.unplaced.push(m);
  };

  // Home state and the student's preferred states first, then more finish.
  const near = (c: College) => (c.state === HOME_STATE || preferStates.has(c.stateName.toLowerCase()) ? 0 : 1);
  const ordered = [...COLLEGES].sort((a, b) => near(a) - near(b) || (b.finish ?? -1) - (a.finish ?? -1));

  if (pathway.degree) {
    for (const c of ordered) {
      if (c.level !== "Bachelor's degrees") continue;
      const entry = reportEntryFor(pathway.careerId, c);
      const real = realProgrammes(c);
      const hit = real?.find((n) => rx.test(n)) ?? null;
      if (!hit && !entry) continue;
      const fit: Fit = entry ? entry.status : fitFor(c, gpa);
      place({ college: c, program: hit ?? entry?.program ?? pathway.program, path: "Direct path", fit, why: entry?.why ?? null });
    }
  }
  if (pathway.twoYearStart) {
    for (const c of ordered) {
      if (c.level !== "Associate degrees") continue;
      const hit = anyProgrammes(c).find((n) => rx.test(n)) ?? null;
      const entry = reportEntryFor(pathway.careerId, c);
      // a public two-year in the home state is a legitimate start even
      // when its programme list doesn't name the major outright
      if (!hit && !entry && !(c.control === "Public" && c.state === HOME_STATE)) continue;
      place({ college: c, program: hit ?? entry?.program ?? "Transfer pathway", path: "2-year start", fit: fitFor(c, gpa), why: entry?.why ?? null });
    }
  }
  if (pathway.trade) {
    for (const c of ordered) {
      if (c.level !== "Certificates" && c.level !== "Associate degrees") continue;
      const hit = anyProgrammes(c).find((n) => rx.test(n));
      if (!hit) continue;
      place({ college: c, program: hit, path: "Trade route", fit: fitFor(c, gpa), why: null });
    }
  }
  return groups;
}

// Plain words on the surface (direct feedback, 10 Sept 2026: "reach, target,
// safety is a little confusing"); the counselor term travels alongside as a
// small note so the language still lines up with the backend doc.
// The Replit's taxonomy, verbatim (direct feedback, 10 Sept 2026: "use the
// same copy/taxonomy from the replit"). "Fit unavailable" stays chip-less:
// a school without a published acceptance rate simply shows no fit.
export const FIT_WORDS: Record<Fit, string> = {
  Reach: "Reach",
  Target: "Target",
  Safety: "Safety",
  "Open admission": "Open admission",
  "Fit unavailable": "",
};
export const FIT_COUNSELOR: Partial<Record<Fit, string>> = { Reach: "reach", Target: "target", Safety: "safety" };

/** A programme name short enough for a badge: "Business Administration and
 *  Management, General" -> "Business Administration". */
export function shortProgram(name: string): string {
  return name
    .replace(/,.*$/, "")
    .replace(/\/.*$/, "")
    .replace(/\s+(and|&)\s+Management$/i, "")
    .replace(/\s+General$/i, "")
    .replace(/Registered Nursing/i, "Nursing")
    .trim()
    .slice(0, 28);
}


// ---- Routes: the career constrains the menu, the student picks ----------
// (direct feedback, 11 Sept 2026: the route is the student's decision, so
// it is a control, defaulted from Build's college / trades / both answer).

export type Institution = "4-year" | "2-year" | "trade";
export type Route = {
  id: string;
  institution: Institution;
  /** pill label: "Bachelor's degree", "Start at a 2-year college", "Flight school" */
  label: string;
  /** pill time: "4 yrs", "2 + 2 yrs" */
  time: string;
  /** the program shown under the pills */
  program: string;
  common: boolean;
};

function shortTime(t: string): string {
  const n = t.toLowerCase();
  if (/^2 \+ 2/.test(n)) return "2 + 2 yrs";
  if (/^4 years plus/.test(n)) return "4 yrs + more";
  const range = n.match(/(\d+(?:\.\d)?)\s*(?:to|-)\s*(\d+(?:\.\d)?)/);
  if (range) return `${range[1]}–${range[2]} yrs`;
  const one = n.match(/(\d+(?:\.\d)?)\s*year/);
  return one ? `${one[1]} yrs` : t;
}

export function routesFor(careerId: string): Route[] {
  const report = reportV2(careerId);
  if (!report) return [];
  const major = report.majors[0]?.name ?? "";
  const out: Route[] = [];
  for (const r of report.education) {
    const n = r.name.toLowerCase();
    let inst: Institution | null = null;
    let label = "";
    let program = major;
    if (r.kind === "Degree" && /two-year|2-year|associate|community college/.test(n)) {
      inst = "2-year";
      label = /associate/.test(n) ? "Associate degree" : "Start at a 2-year college";
      program = /associate/.test(n) ? major : `Transfer path to ${major}`;
    } else if (r.kind === "Degree") {
      inst = "4-year";
      label = "Bachelor's degree";
    } else if ((r.kind === "Training" || r.kind === "Certificate") && /school|flight|technical|certificate|program|academy/.test(n)) {
      inst = "trade";
      label = /flight/.test(n) ? "Flight school" : "Trade or technical school";
      program = r.name.replace(/,.*$/, "");
    }
    if (!inst || out.some((x) => x.institution === inst)) continue; // one pill per institution type
    out.push({ id: inst, institution: inst, label, time: shortTime(r.time), program, common: r.common });
  }
  // the common route first, then shorter/cheaper routes
  return out.sort((a, b) => Number(b.common) - Number(a.common));
}

/** Build's answer picks the default when it can: "trades"/"both" -> a trade
 *  route if the career has one; otherwise the common route. */
export function defaultRoute(routes: Route[], pathPreference: string): Route | null {
  if (routes.length === 0) return null;
  if ((pathPreference === "trades" || pathPreference === "both") && routes.some((r) => r.institution === "trade")) return routes.find((r) => r.institution === "trade")!;
  return routes.find((r) => r.common) ?? routes[0];
}

export type RouteSchools = { fit: SchoolGroups | null; list: SchoolMatch[] };

/** Schools for ONE chosen route. 4-year: the fit groups. 2-year / trade: a
 *  single list (open admission mostly, so no fit). */
export function schoolsForRoute(pathway: Pathway, route: Route, profile: StudentProfile): RouteSchools {
  const groups = schoolsFor({ ...pathway, program: route.institution === "4-year" ? pathway.program : route.program, twoYearStart: true, trade: true }, profile);
  if (route.institution === "4-year") return { fit: groups, list: [] };
  if (route.institution === "2-year") return { fit: null, list: groups.start2 };
  return { fit: null, list: groups.trade };
}
