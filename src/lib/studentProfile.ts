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
  /** Build's "college / trades / both"; "" until answered */
  path: string;
};

export const EMPTY_PROFILE: StudentProfile = { interests: [], subjects: [], states: [], email: "", gpa: "", zipCode: "", travelDistance: "", path: "" };

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
    path: str(v.path),
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

// ---- Previous builds ------------------------------------------------------
// Each time Build finishes, the answers it replaces are archived (Slack /
// direct feedback, 10 Sept 2026: "launch the build again and have an
// archived version of previous builds"). Newest first, capped.

export const STUDENT_PROFILE_ARCHIVE_KEY = "dreamari-student-profile-archive";
const MAX_ARCHIVED = 10;

export type ArchivedProfile = { id: string; savedAt: string; profile: StudentProfile };

export function isEmptyProfile(p: StudentProfile): boolean {
  return p.interests.length === 0 && p.subjects.length === 0 && p.states.length === 0 && !p.email && !p.gpa && !p.zipCode && !p.travelDistance && !p.path;
}

export function readProfileArchive(): ArchivedProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STUDENT_PROFILE_ARCHIVE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is ArchivedProfile => !!v && typeof v === "object" && typeof (v as ArchivedProfile).id === "string" && typeof (v as ArchivedProfile).savedAt === "string")
      .map((v) => ({ ...v, profile: normalize(v.profile) }))
      .slice(0, MAX_ARCHIVED);
  } catch {
    return [];
  }
}

let cachedArchiveRaw: string | null | undefined;
let cachedArchive: ArchivedProfile[] = [];
const EMPTY_ARCHIVE: ArchivedProfile[] = [];
export function profileArchiveSnapshot(): ArchivedProfile[] {
  if (typeof window === "undefined") return EMPTY_ARCHIVE;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STUDENT_PROFILE_ARCHIVE_KEY);
  } catch {
    return EMPTY_ARCHIVE;
  }
  if (raw !== cachedArchiveRaw) {
    cachedArchiveRaw = raw;
    cachedArchive = readProfileArchive();
  }
  return cachedArchive;
}
export function serverProfileArchiveSnapshot(): ArchivedProfile[] {
  return EMPTY_ARCHIVE;
}
export function subscribeProfileArchive(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STUDENT_PROFILE_ARCHIVE_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function writeArchive(list: ArchivedProfile[]): void {
  try {
    window.localStorage.setItem(STUDENT_PROFILE_ARCHIVE_KEY, JSON.stringify(list.slice(0, MAX_ARCHIVED)));
  } catch {
    // no storage
  }
  for (const listener of listeners) listener();
}

/** Put the current answers into the archive (no-op when there are none). */
export function archiveCurrentProfile(): void {
  if (typeof window === "undefined") return;
  const current = readStudentProfile();
  if (isEmptyProfile(current)) return;
  const entry: ArchivedProfile = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, savedAt: new Date().toISOString(), profile: current };
  writeArchive([entry, ...readProfileArchive()]);
}

/** Make an archived build current again; today's answers take its place in the archive. */
export function restoreArchivedProfile(id: string): void {
  if (typeof window === "undefined") return;
  const archive = readProfileArchive();
  const target = archive.find((a) => a.id === id);
  if (!target) return;
  const current = readStudentProfile();
  const rest = archive.filter((a) => a.id !== id);
  const swapped: ArchivedProfile[] = isEmptyProfile(current) ? rest : [{ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, savedAt: new Date().toISOString(), profile: current }, ...rest];
  writeArchive(swapped);
  writeStudentProfile(target.profile);
}

export function deleteArchivedProfile(id: string): void {
  if (typeof window === "undefined") return;
  writeArchive(readProfileArchive().filter((a) => a.id !== id));
}
