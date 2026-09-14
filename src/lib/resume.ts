// A student's resume data (profile, education, experience, skills,
// certifications) plus any saved tailored versions. No backend in the
// prototype, so localStorage is the record -- same idiom as picks.ts and
// studentProfile.ts. Read those first if this file is unfamiliar; the shape
// below (type -> EMPTY -> normalize -> read/snapshot/subscribe/write) is
// copied from them on purpose, not reinvented.

export const RESUME_KEY = "dreamari-resume";

export type ExperienceType = "job" | "internship" | "research" | "volunteer" | "club" | "other";

export type ResumeProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  /** Optional 1-2 sentence intro/objective. Not in the original reference,
   *  added on request -- standard advice for a student resume with a short
   *  work history, and it's opt-in so nobody is forced to write one. */
  bio: string;
};

export type ResumeEducation = {
  id: string;
  schoolName: string;
  cityState: string;
  gradYear: string;
  /** "AP" | "IB" | "None" | "" (unanswered) */
  program: string;
  gpa: string;
  honors: string[];
};

export type ResumeExperience = {
  id: string;
  type: ExperienceType;
  where: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  /** the final, student-editable lines -- AI-drafted or typed by hand */
  bullets: string[];
  /** true once at least one bullet came from the AI generator this session */
  aiAssisted: boolean;
};

export type ResumeSkills = {
  people: string[];
  tech: string[];
  languages: string[];
};

export type ResumeCertification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
  credentialUrl: string;
};

export type ResumeVersion = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  educationIds: string[];
  experienceIds: string[];
  jobDescription: string;
  /** A ResumeTemplateId (src/components/resume/data.ts) -- kept as a plain
   *  string here so this data-layer file doesn't import from components/. */
  template: string;
};

export type ResumeData = {
  profile: ResumeProfile;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  skills: ResumeSkills;
  certifications: ResumeCertification[];
  versions: ResumeVersion[];
  /** the "you've got a good start" coaching tip, shown once ever, not once per click */
  tipDismissed: boolean;
};

export const EMPTY_PROFILE: ResumeProfile = { firstName: "", lastName: "", email: "", phone: "", country: "", state: "", city: "", bio: "" };
export const EMPTY_SKILLS: ResumeSkills = { people: [], tech: [], languages: [] };
export const EMPTY_RESUME: ResumeData = {
  profile: EMPTY_PROFILE,
  education: [],
  experience: [],
  skills: EMPTY_SKILLS,
  certifications: [],
  versions: [],
  tipDismissed: false,
};

export const MAX_SKILLS_PER_CATEGORY = 3;

/** Same id shape used elsewhere in the repo (studentProfile.ts archive entries, reportHistory.ts). */
export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function bool(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}
function strings(value: unknown, max = Infinity): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, max) : [];
}

function normalizeProfile(value: unknown): ResumeProfile {
  if (!value || typeof value !== "object") return EMPTY_PROFILE;
  const v = value as Record<string, unknown>;
  return { firstName: str(v.firstName), lastName: str(v.lastName), email: str(v.email), phone: str(v.phone), country: str(v.country), state: str(v.state), city: str(v.city), bio: str(v.bio).slice(0, 400) };
}
function normalizeEducation(value: unknown): ResumeEducation[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).id === "string")
    .map((v) => ({ id: str(v.id), schoolName: str(v.schoolName), cityState: str(v.cityState), gradYear: str(v.gradYear), program: str(v.program), gpa: str(v.gpa), honors: strings(v.honors) }));
}
function normalizeExperience(value: unknown): ResumeExperience[] {
  if (!Array.isArray(value)) return [];
  const TYPES: ExperienceType[] = ["job", "internship", "research", "volunteer", "club", "other"];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).id === "string")
    .map((v) => ({
      id: str(v.id),
      type: TYPES.includes(v.type as ExperienceType) ? (v.type as ExperienceType) : "other",
      where: str(v.where),
      title: str(v.title),
      location: str(v.location),
      startDate: str(v.startDate),
      endDate: str(v.endDate),
      current: bool(v.current),
      bullets: strings(v.bullets),
      aiAssisted: bool(v.aiAssisted),
    }));
}
function normalizeSkills(value: unknown): ResumeSkills {
  if (!value || typeof value !== "object") return EMPTY_SKILLS;
  const v = value as Record<string, unknown>;
  return { people: strings(v.people, MAX_SKILLS_PER_CATEGORY), tech: strings(v.tech, MAX_SKILLS_PER_CATEGORY), languages: strings(v.languages, MAX_SKILLS_PER_CATEGORY) };
}
function normalizeCertifications(value: unknown): ResumeCertification[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).id === "string")
    .map((v) => ({ id: str(v.id), name: str(v.name), issuer: str(v.issuer), issueDate: str(v.issueDate), expirationDate: str(v.expirationDate), credentialId: str(v.credentialId), credentialUrl: str(v.credentialUrl) }));
}
function normalizeVersions(value: unknown): ResumeVersion[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).id === "string")
    .map((v) => ({
      id: str(v.id),
      name: str(v.name),
      createdAt: typeof v.createdAt === "number" ? v.createdAt : Date.now(),
      updatedAt: typeof v.updatedAt === "number" ? v.updatedAt : Date.now(),
      educationIds: strings(v.educationIds),
      experienceIds: strings(v.experienceIds),
      jobDescription: str(v.jobDescription),
      template: str(v.template) || "classic",
    }));
}

function normalize(value: unknown): ResumeData {
  if (!value || typeof value !== "object") return EMPTY_RESUME;
  const v = value as Record<string, unknown>;
  return {
    profile: normalizeProfile(v.profile),
    education: normalizeEducation(v.education),
    experience: normalizeExperience(v.experience),
    skills: normalizeSkills(v.skills),
    certifications: normalizeCertifications(v.certifications),
    versions: normalizeVersions(v.versions),
    tipDismissed: bool(v.tipDismissed),
  };
}

export function readResume(): ResumeData {
  if (typeof window === "undefined") return EMPTY_RESUME;
  try {
    const raw = window.localStorage.getItem(RESUME_KEY);
    return raw ? normalize(JSON.parse(raw)) : EMPTY_RESUME;
  } catch {
    return EMPTY_RESUME;
  }
}

// Stable snapshot for useSyncExternalStore: rebuilt only when the raw string moves.
let cachedRaw: string | null | undefined;
let cached: ResumeData = EMPTY_RESUME;
const listeners = new Set<() => void>();

export function resumeSnapshot(): ResumeData {
  if (typeof window === "undefined") return EMPTY_RESUME;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(RESUME_KEY);
  } catch {
    return EMPTY_RESUME;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = readResume();
  }
  return cached;
}
export function serverResumeSnapshot(): ResumeData {
  return EMPTY_RESUME;
}
export function subscribeResume(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === RESUME_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Merge a partial update into the stored resume. */
export function writeResume(patch: Partial<ResumeData>): void {
  if (typeof window === "undefined") return;
  try {
    const next = normalize({ ...readResume(), ...patch });
    window.localStorage.setItem(RESUME_KEY, JSON.stringify(next));
  } catch {
    // no storage: the session still works, it just won't be remembered
  }
  for (const listener of listeners) listener();
}

export function isResumeEmpty(r: ResumeData): boolean {
  return r.education.length === 0 && r.experience.length === 0 && r.certifications.length === 0 && r.skills.people.length === 0 && r.skills.tech.length === 0 && r.skills.languages.length === 0 && !r.profile.firstName && !r.profile.lastName;
}

// ---- List helpers -----------------------------------------------------
// Every step screen adds/edits/removes one entry at a time; centralizing the
// splice logic here keeps that identical everywhere instead of re-derived
// per screen.

export function upsertEducation(entry: ResumeEducation): void {
  const current = readResume();
  const exists = current.education.some((e) => e.id === entry.id);
  writeResume({ education: exists ? current.education.map((e) => (e.id === entry.id ? entry : e)) : [...current.education, entry] });
}
export function removeEducation(id: string): void {
  writeResume({ education: readResume().education.filter((e) => e.id !== id) });
}

export function upsertExperience(entry: ResumeExperience): void {
  const current = readResume();
  const exists = current.experience.some((e) => e.id === entry.id);
  writeResume({ experience: exists ? current.experience.map((e) => (e.id === entry.id ? entry : e)) : [...current.experience, entry] });
}
export function removeExperience(id: string): void {
  writeResume({ experience: readResume().experience.filter((e) => e.id !== id) });
}

export function upsertCertification(entry: ResumeCertification): void {
  const current = readResume();
  const exists = current.certifications.some((c) => c.id === entry.id);
  writeResume({ certifications: exists ? current.certifications.map((c) => (c.id === entry.id ? entry : c)) : [...current.certifications, entry] });
}
export function removeCertification(id: string): void {
  writeResume({ certifications: readResume().certifications.filter((c) => c.id !== id) });
}

export function upsertVersion(entry: ResumeVersion): void {
  const current = readResume();
  const exists = current.versions.some((v) => v.id === entry.id);
  writeResume({ versions: exists ? current.versions.map((v) => (v.id === entry.id ? entry : v)) : [...current.versions, entry] });
}
export function removeVersion(id: string): void {
  writeResume({ versions: readResume().versions.filter((v) => v.id !== id) });
}

/** A tailored resume only picks which education/experience entries to
 *  include (Choose & Tailor's actual scope) -- skills and certifications
 *  always carry through from the master profile. */
export function resumeForVersion(resume: ResumeData, version: ResumeVersion): ResumeData {
  return {
    ...resume,
    education: resume.education.filter((e) => version.educationIds.includes(e.id)),
    experience: resume.experience.filter((e) => version.experienceIds.includes(e.id)),
  };
}
