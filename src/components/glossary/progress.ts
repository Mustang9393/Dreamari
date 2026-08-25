// Glossary Game save state. Same shape as src/components/play/progress.ts —
// localStorage read through useSyncExternalStore, since the repo lints the
// useState-in-an-effect version as an error. Deliberately lighter than the
// simulation's beat-by-beat resume: a glossary lesson is ~4 minutes and
// restartable, so this only needs to remember what's already been mastered
// and the running Dream Score, not an exact mid-question resume point.

const KEY = "dreamari-glossary-progress";

export type LessonSave = {
  masteredTermIds: string[];
  completed: boolean;
};

type CareerSave = {
  dreamScore: number;
  lessons: Record<string, LessonSave>;
};

type Store = Record<string, CareerSave>;

const EMPTY: Store = {};

function parse(raw: string | null): Store {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return EMPTY;
    const out: Store = {};
    for (const [careerSlug, entry] of Object.entries(value as Record<string, unknown>)) {
      const save = entry as Partial<CareerSave>;
      if (typeof save.dreamScore !== "number" || !save.lessons || typeof save.lessons !== "object") continue;
      const lessons: Record<string, LessonSave> = {};
      for (const [lessonId, lesson] of Object.entries(save.lessons as Record<string, unknown>)) {
        const l = lesson as Partial<LessonSave>;
        if (Array.isArray(l.masteredTermIds) && typeof l.completed === "boolean") {
          lessons[lessonId] = { masteredTermIds: l.masteredTermIds.filter((id) => typeof id === "string"), completed: l.completed };
        }
      }
      out[careerSlug] = { dreamScore: Math.max(0, Math.floor(save.dreamScore)), lessons };
    }
    return out;
  } catch {
    return EMPTY;
  }
}

let cachedRaw: string | null | undefined;
let cached: Store = EMPTY;
const listeners = new Set<() => void>();

export function glossaryProgressSnapshot(): Store {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

export function serverGlossaryProgressSnapshot(): Store {
  return EMPTY;
}

export function subscribeGlossaryProgress(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function commit(next: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private browsing or a full quota: the round still works, it just won't persist.
  }
  for (const listener of listeners) listener();
}

export function readDreamScore(store: Store, careerSlug: string): number {
  return store[careerSlug]?.dreamScore ?? 0;
}

export function readLesson(store: Store, careerSlug: string, lessonId: string): LessonSave | null {
  return store[careerSlug]?.lessons[lessonId] ?? null;
}

/** Adds to the running Dream Score and records which terms this lesson has
 *  mastered. Called once, when a lesson's Lesson Complete screen resolves. */
export function saveLessonComplete(careerSlug: string, lessonId: string, masteredTermIds: string[], scoreGain: number): void {
  const store = { ...glossaryProgressSnapshot() };
  const existing = store[careerSlug] ?? { dreamScore: 0, lessons: {} };
  store[careerSlug] = {
    dreamScore: existing.dreamScore + Math.max(0, Math.floor(scoreGain)),
    lessons: { ...existing.lessons, [lessonId]: { masteredTermIds, completed: true } },
  };
  commit(store);
}
