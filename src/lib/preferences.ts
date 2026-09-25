// Preferences (My Profile > Preferences): the student's current answers,
// editable any time without retaking Build (Joshua Pierce, Slack, 25 Sept
// 2026: "students complete Build once and may feel like those answers are
// permanent. They need to be able to update them anytime"). Same
// localStorage-as-record idiom as studentProfile.ts; no backend anywhere.
//
// Two rules keep this honest with the rest of the app:
// 1. First read SEEDS from what Build already recorded (interests, subjects,
//    GPA, states, distance, path), so the tab never opens empty for a student
//    who did Build.
// 2. Saving a section WRITES the overlapping answers back to the student
//    profile, so Match, the Flow Lab, school matching and Settings follow
//    ("update them anytime and Dreamari will adjust your recommendations").

import { INTEREST_WORLDS, TRAVEL_DISTANCE_OPTIONS } from "@/components/build/types";
import { readStudentProfile, subscribeStudentProfile, writeStudentProfile, type StudentProfile } from "./studentProfile";
import { readPicks, subscribePicks } from "./picks";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { careerSlug } from "@/components/career/slug";

export const PREFERENCES_KEY = "dreamari-preferences";

export type JobPrefs = {
  types: string[];
  roles: string[];
  locations: string[];
  modes: string[];
  gradYear: string;
  availability: string;
  relocate: string;
  languages: string;
  certifications: string;
  portfolio: string;
};

export type Preferences = {
  industries: string[]; // INTEREST_WORLDS labels, max 3
  careers: string[]; // career titles, max 3
  subjects: string[]; // max 5
  workWith: string; // Independent | Mix of both | With a team
  pace: string; // Fast-paced | Balanced | Steady
  structure: string; // Structured | Flexible | Mix of both
  teamSize: string[]; // max 2
  environments: string[]; // max 3
  gpa: string;
  gpaType: string; // weighted | unweighted | unsure | ""
  pathways: string[]; // max 2
  states: string[]; // max 3, full names
  distance: string; // 25 miles | 50 miles | 100 miles | Best opportunity
  budget: string;
  schoolTypes: string[]; // max 2
  campus: string[]; // max 2
  sizes: string[]; // max 2
  skillsToBuild: string[]; // max 5, skills or software
  skillsHave: string[];
  softwareKnow: string[];
  jobs: JobPrefs;
  updatedAt: string; // ISO; "" until the student saves something here
};

export const LIMITS = { industries: 3, careers: 3, subjects: 5, teamSize: 2, environments: 3, pathways: 2, states: 3, schoolTypes: 2, campus: 2, sizes: 2, skillsToBuild: 5, jobRoles: 3, jobIndustries: 3, jobLocations: 3, jobModes: 2 } as const;

export const EMPTY_JOBS: JobPrefs = { types: [], roles: [], locations: [], modes: [], gradYear: "", availability: "", relocate: "", languages: "", certifications: "", portfolio: "" };
export const EMPTY_PREFERENCES: Preferences = {
  industries: [], careers: [], subjects: [], workWith: "", pace: "", structure: "", teamSize: [], environments: [],
  gpa: "", gpaType: "", pathways: [], states: [], distance: "", budget: "", schoolTypes: [], campus: [], sizes: [],
  skillsToBuild: [], skillsHave: [], softwareKnow: [], jobs: EMPTY_JOBS, updatedAt: "",
};

const strs = (v: unknown, max?: number): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, max) : []);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

function normalize(v: Partial<Preferences> | null | undefined): Preferences {
  const j = (v?.jobs ?? {}) as Partial<JobPrefs>;
  return {
    industries: strs(v?.industries, LIMITS.industries), careers: strs(v?.careers, LIMITS.careers), subjects: strs(v?.subjects, LIMITS.subjects),
    workWith: str(v?.workWith), pace: str(v?.pace), structure: str(v?.structure), teamSize: strs(v?.teamSize, LIMITS.teamSize), environments: strs(v?.environments, LIMITS.environments),
    gpa: str(v?.gpa), gpaType: str(v?.gpaType), pathways: strs(v?.pathways, LIMITS.pathways), states: strs(v?.states, LIMITS.states), distance: str(v?.distance), budget: str(v?.budget),
    schoolTypes: strs(v?.schoolTypes, LIMITS.schoolTypes), campus: strs(v?.campus, LIMITS.campus), sizes: strs(v?.sizes, LIMITS.sizes),
    skillsToBuild: strs(v?.skillsToBuild, LIMITS.skillsToBuild), skillsHave: strs(v?.skillsHave), softwareKnow: strs(v?.softwareKnow),
    jobs: { types: strs(j.types), roles: strs(j.roles, LIMITS.jobRoles), locations: strs(j.locations, LIMITS.jobLocations), modes: strs(j.modes, LIMITS.jobModes), gradYear: str(j.gradYear), availability: str(j.availability), relocate: str(j.relocate), languages: str(j.languages), certifications: str(j.certifications), portfolio: str(j.portfolio) },
    updatedAt: str(v?.updatedAt),
  };
}

// ---- Build <-> Preferences vocabulary ----
const worldLabel = (slug: string) => INTEREST_WORLDS.find((w) => w.slug === slug)?.label ?? slug;
const worldSlug = (label: string) => INTEREST_WORLDS.find((w) => w.label === label)?.slug ?? label;
const DISTANCE_TO_BUILD: Record<string, string> = { "25 miles": TRAVEL_DISTANCE_OPTIONS[0], "50 miles": TRAVEL_DISTANCE_OPTIONS[1], "100 miles": TRAVEL_DISTANCE_OPTIONS[2], "Best opportunity": TRAVEL_DISTANCE_OPTIONS[3] };
const DISTANCE_FROM_BUILD: Record<string, string> = Object.fromEntries(Object.entries(DISTANCE_TO_BUILD).map(([a, b]) => [b, a]));
const PATHWAYS_FROM_PATH: Record<string, string[]> = { college: ["4-Year College"], trades: ["Trade / Certificate"], both: ["4-Year College", "Trade / Certificate"] };

const careerTitle = (id: string) => ALL_PROFILE_CAREERS.find((c) => c.id === id)?.title ?? ALL_CATALOG_CAREERS.find((c) => careerSlug(c.title) === id)?.title ?? id;

/** What Build and Match already know, in this tab's vocabulary: the Top 3
 *  are the careers the student is considering until they say otherwise. */
export function seedFromProfile(p: StudentProfile, pickIds: string[] = []): Partial<Preferences> {
  return {
    careers: pickIds.map(careerTitle).slice(0, LIMITS.careers),
    industries: p.interests.map(worldLabel).slice(0, LIMITS.industries),
    subjects: p.subjects.slice(0, LIMITS.subjects),
    gpa: p.gpa,
    gpaType: p.gpaType,
    states: p.states.slice(0, LIMITS.states),
    distance: DISTANCE_FROM_BUILD[p.travelDistance] ?? "",
    pathways: PATHWAYS_FROM_PATH[p.path] ?? [],
  };
}

/** The overlapping answers, written back so the rest of the app follows. */
function syncToProfile(next: Preferences): void {
  const hasTrade = next.pathways.some((p) => /Trade|2-Year/.test(p));
  const hasCollege = next.pathways.some((p) => /4-Year|Graduate/.test(p));
  writeStudentProfile({
    interests: next.industries.map(worldSlug),
    subjects: next.subjects,
    gpa: next.gpa,
    gpaType: next.gpaType,
    states: next.states,
    travelDistance: DISTANCE_TO_BUILD[next.distance] ?? "",
    path: hasTrade && hasCollege ? "both" : hasTrade ? "trades" : hasCollege ? "college" : "",
  });
}

// ---- store ----
let cached: { raw: string | null; value: Preferences } | null = null;

function readRaw(): string | null {
  try { return window.localStorage.getItem(PREFERENCES_KEY); } catch { return null; }
}

/** Stored answers over the Build seed: a field the student never saved here
 *  still shows what Build recorded. */
export function preferencesSnapshot(): Preferences {
  if (typeof window === "undefined") return EMPTY_PREFERENCES;
  const raw = readRaw();
  // The seed can change when Build runs again; cache on both inputs.
  const picks = readPicks().ids;
  const seedKey = JSON.stringify([readStudentProfile(), picks]);
  const key = `${raw ?? ""}\u0000${seedKey}`;
  if (cached && cached.raw === key) return cached.value;
  let stored: Partial<Preferences> = {};
  try { stored = raw ? (JSON.parse(raw) as Partial<Preferences>) : {}; } catch { stored = {}; }
  const value = normalize({ ...seedFromProfile(readStudentProfile(), picks), ...stored });
  cached = { raw: key, value };
  return value;
}
export function serverPreferencesSnapshot(): Preferences { return EMPTY_PREFERENCES; }
export function subscribePreferences(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === PREFERENCES_KEY) listener(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener("dreamari:preferences", listener);
  const unsubProfile = subscribeStudentProfile(listener);
  const unsubPicks = subscribePicks(listener);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("dreamari:preferences", listener); unsubProfile(); unsubPicks(); };
}
export function writePreferences(patch: Partial<Preferences>): void {
  const next = normalize({ ...preferencesSnapshot(), ...patch, updatedAt: new Date().toISOString() });
  try { window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); } catch { /* no storage */ }
  syncToProfile(next);
  window.dispatchEvent(new Event("dreamari:preferences"));
}
