// The student's Build answers, kept whole (6 Oct 2026). Build itself writes a
// subset into the student profile; My Build (Profile) edits every answer the
// Build flow asked, in the Build flow's own words and controls, so the full
// set has to live somewhere. One store, seeded from the profile the first
// time, and every save writes the profile and the preferences too, so
// Explore, the Report and the plan all move with it.

import { useSyncExternalStore } from "react";
import { INITIAL_BUILD_STATE, INTEREST_WORLDS, type BuildState } from "@/components/build/types";
import { readStudentProfile, writeStudentProfile } from "@/lib/studentProfile";
import { preferencesSnapshot, writePreferences } from "@/lib/preferences";

const KEY = "dreamari-build-answers";
const AT_KEY = "dreamari-build-answers-at";
const listeners = new Set<() => void>();
let cache: BuildState | null = null;

function seedFromProfile(): BuildState {
  const p = readStudentProfile();
  const prefs = preferencesSnapshot();
  const labelFor = (v: string) => INTEREST_WORLDS.find((w) => w.slug === v || w.label === v)?.label ?? v;
  return {
    ...INITIAL_BUILD_STATE,
    interests: (prefs.industries.length ? prefs.industries : p.interests.map(labelFor)).slice(0, 3),
    subjects: (prefs.subjects.length ? prefs.subjects : p.subjects).slice(0, 5),
    state: p.states[0] ?? "",
    email: p.email,
    gpa: p.gpa,
    zipCode: p.zipCode,
    travelDistance: p.travelDistance,
    path: (p.path === "college" || p.path === "trades" || p.path === "both") ? p.path : null,
  };
}

export function readBuildAnswers(): BuildState {
  if (cache) return cache;
  if (typeof window === "undefined") return INITIAL_BUILD_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { cache = { ...INITIAL_BUILD_STATE, ...(JSON.parse(raw) as Partial<BuildState>) }; return cache; }
  } catch { /* no storage */ }
  cache = seedFromProfile();
  return cache;
}

export function writeBuildAnswers(next: BuildState): void {
  cache = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); window.localStorage.setItem(AT_KEY, String(Date.now())); } catch { /* no storage */ }
  // the rest of the app reads these two stores
  writeStudentProfile({ interests: next.interests, subjects: next.subjects, states: next.state ? [next.state] : [], gpa: next.gpa, zipCode: next.zipCode, travelDistance: next.travelDistance, path: next.path ?? "" });
  writePreferences({ industries: next.interests.slice(0, 3), subjects: next.subjects.slice(0, 5), gpa: next.gpa, states: next.state ? [next.state] : [] });
  listeners.forEach((l) => l());
}

export function useBuildAnswers(): BuildState {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    readBuildAnswers,
    () => INITIAL_BUILD_STATE,
  );
}

/** When the answers were last saved here, as "Oct 7, 2026"; null before the first save. */
function savedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AT_KEY);
    if (!raw) return null;
    return new Date(Number(raw)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return null; }
}
export function useBuildSavedAt(): string | null {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, savedAt, () => null);
}
