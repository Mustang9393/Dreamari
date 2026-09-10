// The student's own answers, carried out of Build and editable later from
// Profile > Settings (Slack, 10 Sept 2026: "they should obviously have the
// luxury to change these things"). There is no backend in the prototype, so
// localStorage is the record, same idiom as picks.ts. Only the fields a
// student is allowed to revise live here; the vibe/education/cost answers
// stay in the Build flow.

export const STUDENT_PROFILE_KEY = "dreamari-student-profile";

export type StudentProfile = {
  /** industry worlds they care about, at most two (INTEREST_WORLDS labels) */
  interests: string[];
  /** favourite school subjects, at most two (SUBJECTS) */
  subjects: string[];
  /** states they would go to school in; Build asks for one, Settings allows more */
  states: string[];
  email: string;
  gpa: string;
  zipCode: string;
  /** how far they would go for school (TRAVEL_DISTANCE_OPTIONS) */
  travelDistance: string;
};

export const EMPTY_PROFILE: StudentProfile = { interests: [], subjects: [], states: [], email: "", gpa: "", zipCode: "", travelDistance: "" };

export const MAX_INTERESTS = 2;
export const MAX_SUBJECTS = 2;

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "Washington, D.C.", "West Virginia", "Wisconsin", "Wyoming",
];

function strings(value: unknown, max = Infinity): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, max) : [];
}
function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalize(value: unknown): StudentProfile {
  if (!value || typeof value !== "object") return EMPTY_PROFILE;
  const v = value as Record<string, unknown>;
  return {
    interests: strings(v.interests, MAX_INTERESTS),
    subjects: strings(v.subjects, MAX_SUBJECTS),
    states: strings(v.states),
    email: str(v.email),
    gpa: str(v.gpa),
    zipCode: str(v.zipCode),
    travelDistance: str(v.travelDistance),
  };
}

export function readStudentProfile(): StudentProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = window.localStorage.getItem(STUDENT_PROFILE_KEY);
    return raw ? normalize(JSON.parse(raw)) : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

// Stable snapshot for useSyncExternalStore: rebuilt only when the raw string moves.
let cachedRaw: string | null | undefined;
let cached: StudentProfile = EMPTY_PROFILE;
const listeners = new Set<() => void>();

export function studentProfileSnapshot(): StudentProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STUDENT_PROFILE_KEY);
  } catch {
    return EMPTY_PROFILE;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = readStudentProfile();
  }
  return cached;
}
export function serverStudentProfileSnapshot(): StudentProfile {
  return EMPTY_PROFILE;
}
export function subscribeStudentProfile(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STUDENT_PROFILE_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Merge a partial update into the stored profile. */
export function writeStudentProfile(patch: Partial<StudentProfile>): void {
  if (typeof window === "undefined") return;
  try {
    const next = normalize({ ...readStudentProfile(), ...patch });
    window.localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(next));
  } catch {
    // no storage: the session still works, it just won't be remembered
  }
  for (const listener of listeners) listener();
}
