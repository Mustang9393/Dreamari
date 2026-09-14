// A student's resume data (profile, education, experience, skills,
// certifications) plus any saved tailored versions. No backend in the
// prototype, so localStorage is the record -- same idiom as picks.ts and
// studentProfile.ts. Read those first if this file is unfamiliar; the shape
// below (type -> EMPTY -> normalize -> read/snapshot/subscribe/write) is
// copied from them on purpose, not reinvented.

const RESUME_KEY = "dreamari-resume";

export type ExperienceType = "job" | "internship" | "research" | "volunteer" | "club" | "other";

type ResumeProfile = {
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

type ATSKeywordStatus = "verified" | "possible" | "missing";
type ATSKeywordMatch = { keyword: string; status: ATSKeywordStatus; context: string };
type ATSReadabilityStatus = "pass" | "warn";
type ATSReadabilityItem = { id: string; label: string; status: ATSReadabilityStatus; note: string };
type ATSQualityBreakdown = {
  experienceQuality: number;
  bulletQuality: number;
  atsFormatting: number;
  completeness: number;
  skills: number;
  education: number;
  focusConciseness: number;
};

/** The full "ATS Check" audit for one saved resume version -- a resume-
 *  quality rating (score + letter grade + category breakdown + strengths/
 *  improvements), a job-match breakdown (only meaningful once a job
 *  description is set), a deterministic ATS readability checklist, and the
 *  job's requirements the student's real profile doesn't support. Persisted
 *  on the version it was run against (direct feedback, 15 Sept 2026: "make
 *  sure all of the functionality from the replit is there") rather than
 *  recomputed on every view -- `analyzedFor` is a fingerprint of the inputs
 *  that produced it, so the UI can tell when it's gone stale and needs a
 *  re-run rather than silently showing an old result. */
export type ATSCheckResult = {
  qualityScore: number;
  qualityGrade: string;
  qualityBreakdown: ATSQualityBreakdown;
  qualityStrengths: string[];
  qualityImprovements: string[];
  jobMatchScore: number | null;
  jobMatchLabel: string;
  verifiedMatches: string[];
  possibleMatches: string[];
  jobGaps: string[];
  keywordMatches: ATSKeywordMatch[];
  readability: ATSReadabilityItem[];
  missingQualifications: string[];
  aiAssisted: boolean;
  generatedAt: number;
  analyzedFor: string;
};

export type ResumeVersion = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  educationIds: string[];
  experienceIds: string[];
  jobDescription: string;
  /** Optional context alongside the job description -- matches the
   *  reference's own "Match to a Job" fields (direct feedback, 15 Sept
   *  2026: "it asks for position, JD and company too"). Neither is
   *  required; they sharpen the match analysis when filled in. */
  targetPosition: string;
  targetCompany: string;
  /** A ResumeTemplateId (src/components/resume/data.ts) -- kept as a plain
   *  string here so this data-layer file doesn't import from components/. */
  template: string;
  atsCheck: ATSCheckResult | null;
};

export type ResumeData = {
  profile: ResumeProfile;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  skills: ResumeSkills;
  certifications: ResumeCertification[];
  versions: ResumeVersion[];
};

export const EMPTY_PROFILE: ResumeProfile = { firstName: "", lastName: "", email: "", phone: "", country: "", state: "", city: "", bio: "" };
const EMPTY_SKILLS: ResumeSkills = { people: [], tech: [], languages: [] };
export const EMPTY_RESUME: ResumeData = {
  profile: EMPTY_PROFILE,
  education: [],
  experience: [],
  skills: EMPTY_SKILLS,
  certifications: [],
  versions: [],
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
function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function keywordStatus(value: unknown): ATSKeywordStatus {
  return value === "verified" || value === "possible" || value === "missing" ? value : "missing";
}
function readabilityStatus(value: unknown): ATSReadabilityStatus {
  return value === "pass" || value === "warn" ? value : "warn";
}
function normalizeATSCheck(value: unknown): ATSCheckResult | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const b = (v.qualityBreakdown && typeof v.qualityBreakdown === "object" ? v.qualityBreakdown : {}) as Record<string, unknown>;
  return {
    qualityScore: num(v.qualityScore),
    qualityGrade: str(v.qualityGrade),
    qualityBreakdown: {
      experienceQuality: num(b.experienceQuality),
      bulletQuality: num(b.bulletQuality),
      atsFormatting: num(b.atsFormatting),
      completeness: num(b.completeness),
      skills: num(b.skills),
      education: num(b.education),
      focusConciseness: num(b.focusConciseness),
    },
    qualityStrengths: strings(v.qualityStrengths),
    qualityImprovements: strings(v.qualityImprovements),
    jobMatchScore: typeof v.jobMatchScore === "number" ? v.jobMatchScore : null,
    jobMatchLabel: str(v.jobMatchLabel),
    verifiedMatches: strings(v.verifiedMatches),
    possibleMatches: strings(v.possibleMatches),
    jobGaps: strings(v.jobGaps),
    keywordMatches: Array.isArray(v.keywordMatches)
      ? v.keywordMatches
          .filter((k): k is Record<string, unknown> => !!k && typeof k === "object")
          .map((k) => ({ keyword: str(k.keyword), status: keywordStatus(k.status), context: str(k.context) }))
      : [],
    readability: Array.isArray(v.readability)
      ? v.readability
          .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
          .map((r) => ({ id: str(r.id), label: str(r.label), status: readabilityStatus(r.status), note: str(r.note) }))
      : [],
    missingQualifications: strings(v.missingQualifications),
    aiAssisted: bool(v.aiAssisted),
    generatedAt: num(v.generatedAt, Date.now()),
    analyzedFor: str(v.analyzedFor),
  };
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
      targetPosition: str(v.targetPosition),
      targetCompany: str(v.targetCompany),
      template: str(v.template) || "classic",
      atsCheck: normalizeATSCheck(v.atsCheck),
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

// ---- List helpers -----------------------------------------------------
// Every step screen adds/edits/removes one entry at a time; centralizing the
// splice logic here keeps that identical everywhere instead of re-derived
// per screen.

/** Adds one skill to a category, case-insensitively deduped -- the "Match
 *  to a Job" suggestions add here, one click, no confirmation step (direct
 *  feedback, 15 Sept 2026, mirroring the reference's own one-tap add). */
export function addSkill(category: keyof ResumeSkills, skill: string): void {
  const value = skill.trim();
  if (!value) return;
  const current = readResume();
  if (current.skills[category].some((s) => s.toLowerCase() === value.toLowerCase())) return;
  writeResume({ skills: { ...current.skills, [category]: [...current.skills[category], value] } });
}

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
/** Patches just the ATS Check result onto an already-saved version --
 *  called after a check run completes, without disturbing anything else a
 *  student may have changed on the version in the meantime. */
export function saveATSCheck(versionId: string, result: ATSCheckResult): void {
  const current = readResume();
  const version = current.versions.find((v) => v.id === versionId);
  if (!version) return;
  upsertVersion({ ...version, atsCheck: result });
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
