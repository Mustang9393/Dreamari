// Career Report > Career Exploration (Joshua Pierce, Slack, 12 Sept 2026).
// Two halves: what Dreamari logged from the student's own activity (read
// only) and what the student adds themselves. No backend in the prototype,
// so localStorage holds the student's entries, keyed by career, in the same
// idiom as picks.ts. Shipped as ONE commit so it can be reverted cleanly.

export const CAREER_EXPLORATION_KEY = "dreamari-career-exploration";

/** The dropdown's options, in Joshua's order. `hours` marks the two types a
 *  counselor may later need hours logged for (open item); the field is not
 *  rendered yet, but the flag and the optional `hours` on an entry mean adding
 *  it is a one-line change in the form. */
export const EXPERIENCE_TYPES = [
  { id: "job-shadow", label: "Job shadow", hours: true },
  { id: "internship", label: "Internship or work experience", hours: true },
  { id: "talked", label: "Talked with someone who does this job", hours: false },
  { id: "career-fair", label: "Career fair or career day", hours: false },
  { id: "guest-speaker", label: "Guest speaker at school", hours: false },
  { id: "workplace-visit", label: "Visited a workplace", hours: false },
  { id: "class", label: "Took a class related to this career", hours: false },
  { id: "certificate", label: "Earned a certificate or license", hours: false },
  { id: "volunteered", label: "Volunteered in this field", hours: false },
  { id: "club", label: "Club or competition", hours: false },
  { id: "other", label: "Something else", hours: false },
] as const;
export type ExperienceTypeId = (typeof EXPERIENCE_TYPES)[number]["id"];
export const FEELINGS = ["More interested", "About the same", "Less interested"] as const;
export type Feeling = (typeof FEELINGS)[number];

export type Experience = {
  id: string;
  careerId: string;
  type: ExperienceTypeId;
  /** ISO date (yyyy-mm-dd); the only required field */
  date: string;
  where: string;
  notes: string;
  feeling: Feeling | null;
  /** reserved for job shadows and internships once counselors confirm */
  hours?: number;
  createdAt: string;
};

export function experienceLabel(type: ExperienceTypeId): string {
  return EXPERIENCE_TYPES.find((t) => t.id === type)?.label ?? "Something else";
}

/** "Sep 3" style, the way the logged rows read. */
export function shortDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const EMPTY: Experience[] = [];
function normalize(value: unknown): Experience[] {
  if (!Array.isArray(value)) return EMPTY;
  const ids = new Set<string>(EXPERIENCE_TYPES.map((t) => t.id));
  return value.filter((v): v is Experience => {
    if (!v || typeof v !== "object") return false;
    const e = v as Partial<Experience>;
    return typeof e.id === "string" && typeof e.careerId === "string" && typeof e.type === "string" && ids.has(e.type) && typeof e.date === "string";
  }).map((e) => ({ ...e, where: e.where ?? "", notes: e.notes ?? "", feeling: FEELINGS.includes(e.feeling as Feeling) ? e.feeling : null }));
}

export function readExperiences(): Experience[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(CAREER_EXPLORATION_KEY);
    return raw ? normalize(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let cachedRaw: string | null | undefined;
let cached: Experience[] = EMPTY;
const listeners = new Set<() => void>();
export function experiencesSnapshot(): Experience[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(CAREER_EXPLORATION_KEY); } catch { return EMPTY; }
  if (raw !== cachedRaw) { cachedRaw = raw; cached = readExperiences(); }
  return cached;
}
export function serverExperiencesSnapshot(): Experience[] { return EMPTY; }
export function subscribeExperiences(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === CAREER_EXPLORATION_KEY) listener(); };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); if (typeof window !== "undefined") window.removeEventListener("storage", onStorage); };
}
function write(list: Experience[]): void {
  try { window.localStorage.setItem(CAREER_EXPLORATION_KEY, JSON.stringify(list)); } catch { /* no storage */ }
  for (const l of listeners) l();
}

export function addExperience(input: Omit<Experience, "id" | "createdAt">): Experience {
  const e: Experience = { ...input, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() };
  if (typeof window !== "undefined") write([...readExperiences(), e]);
  return e;
}
export function updateExperience(id: string, patch: Partial<Omit<Experience, "id" | "careerId" | "createdAt">>): void {
  if (typeof window === "undefined") return;
  write(readExperiences().map((e) => (e.id === id ? { ...e, ...patch } : e)));
}
export function removeExperience(id: string): void {
  if (typeof window === "undefined") return;
  write(readExperiences().filter((e) => e.id !== id));
}

// ---- Logged in Dreamari ----------------------------------------------------
// Read only. Real activity signals when we have them (the career is in the
// student's Top 3); the demo career carries Joshua's three example rows so
// the panel shows its shape in the demo. Dates are the demo's.
export type LoggedItem = { text: string; date: string };
const DEMO_LOGGED: Record<string, LoggedItem[]> = {
  "investment-banking": [
    { text: "Completed the Investment Banking simulation", date: "2026-09-03" },
    { text: "Talked with a professional in Connect", date: "2026-09-08" },
    { text: "Saved Investment Banker as a career goal", date: "2026-09-10" },
  ],
};
export function loggedActivity(careerId: string, careerTitle: string, savedIds: string[]): LoggedItem[] {
  if (DEMO_LOGGED[careerId]) return DEMO_LOGGED[careerId];
  const out: LoggedItem[] = [];
  if (savedIds.includes(careerId)) out.push({ text: `Saved ${careerTitle} as a career goal`, date: new Date().toISOString().slice(0, 10) });
  return out;
}
