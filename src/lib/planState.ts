// Everything a student does inside My Plan / the Career Report that used to
// reset on every reload: checked-off plan steps, their own added tasks,
// which route they picked into a career, and saved majors. There is no
// backend in this prototype, so localStorage is the persistence layer here
// too -- same pattern as `picks.ts`, extended to cover this state as well
// (direct feedback, 14 Sept 2026: "Usman doesn't know how to show things if
// I don't design it," so this is designed and working now, not deferred to
// "when there's a real backend").
//
// Shape mirrors the live React state in ProfileExperience.tsx exactly:
// `done`/`customTasks`/`routeChoice` are keyed by career (or
// `careerId:horizonId` for custom tasks, matching `tasksFor`'s own key);
// `savedMajors` is NOT per-career in the live app (a major can be saved
// regardless of which career is focused), so it stays a flat array here too.

import type { PlanTask } from "@/components/profile/data";

export const PLAN_STATE_KEY = "dreamari-plan-state";

export type PlanState = {
  /** careerId -> completed task ids (built-in doneByDefault tasks and
   *  student-checked ones alike) */
  done: Record<string, string[]>;
  /** "careerId:horizonId" -> the student's own added steps for that horizon */
  customTasks: Record<string, PlanTask[]>;
  /** careerId -> the route id chosen into that career */
  routeChoice: Record<string, string>;
  /** major names the student has saved from the Career Report */
  savedMajors: string[];
};

const EMPTY: PlanState = { done: {}, customTasks: {}, routeChoice: {}, savedMajors: [] };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRecordOfStringArrays(value: unknown): value is Record<string, string[]> {
  return !!value && typeof value === "object" && Object.values(value).every(isStringArray);
}

function isRecordOfStrings(value: unknown): value is Record<string, string> {
  return !!value && typeof value === "object" && Object.values(value).every((item) => typeof item === "string");
}

function isPlanState(value: unknown): value is PlanState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PlanState>;
  return (
    isRecordOfStringArrays(candidate.done ?? {}) &&
    !!candidate.customTasks && typeof candidate.customTasks === "object" &&
    isRecordOfStrings(candidate.routeChoice ?? {}) &&
    isStringArray(candidate.savedMajors ?? [])
  );
}

/** Reads the stored plan state. Returns empty on the server, and on
 *  anything malformed -- a stale or hand-edited value must never break a
 *  screen. */
export function readPlanState(): PlanState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(PLAN_STATE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!isPlanState(parsed)) return EMPTY;
    return {
      done: parsed.done,
      customTasks: parsed.customTasks as Record<string, PlanTask[]>,
      routeChoice: parsed.routeChoice,
      savedMajors: parsed.savedMajors,
    };
  } catch {
    return EMPTY;
  }
}

// Same caching shape as picks.ts: useSyncExternalStore needs a referentially
// stable value between real changes, so the parsed object is cached against
// the raw string and only rebuilt when that string actually moves.
let cachedRaw: string | null | undefined;
let cachedState: PlanState = EMPTY;
const listeners = new Set<() => void>();

export function planStateSnapshot(): PlanState {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PLAN_STATE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = readPlanState();
  }
  return cachedState;
}

/** The server has no storage, so it renders as if nothing was ever done. */
export function serverPlanStateSnapshot(): PlanState {
  return EMPTY;
}

export function subscribePlanState(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab writing counts too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PLAN_STATE_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Merges a partial patch into the stored state and persists the result --
 *  callers pass only the piece that changed (e.g. `{ done }`), same pattern
 *  as `writeStudentProfile`. */
export function writePlanState(patch: Partial<PlanState>): void {
  if (typeof window === "undefined") return;
  try {
    const next: PlanState = { ...readPlanState(), ...patch };
    window.localStorage.setItem(PLAN_STATE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing, quota, disabled storage: the session still works,
    // it just won't survive a reload.
  }
  for (const listener of listeners) listener();
}
