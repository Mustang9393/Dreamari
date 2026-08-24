// Autosave for a simulation run. The Interaction Rules tab is explicit about
// why this exists: "Save at the last completed screen. Reopening returns the
// player there with reputation intact. Students play in short bursts between
// classes." A student who loses a 20-beat run because the bell rang will not
// start it again.
//
// Read through useSyncExternalStore rather than copied into state in an effect:
// storage is an external store, and the repo lints the effect version as an
// error. Same shape as src/lib/picks.ts.

const KEY = "dreamari-play-progress";

export type RunSave = {
  /** simulation id, so two careers can be mid-run at once */
  gameId: string;
  /** level number within that simulation */
  level: number;
  /** index of the NEXT beat to show: the last completed screen, plus one */
  index: number;
  reputation: number;
  /** how many of the ten scored beats are done, for the progress dots */
  scored: number;
  /** epoch ms, so the hub can say how long ago they left it */
  at: number;
};

type Store = Record<string, RunSave>;

const EMPTY: Store = {};

function slot(gameId: string, level: number): string {
  return `${gameId}:${level}`;
}

function parse(raw: string | null): Store {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return EMPTY;
    const out: Store = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const save = entry as Partial<RunSave>;
      if (
        typeof save.gameId === "string" &&
        typeof save.level === "number" &&
        typeof save.index === "number" &&
        typeof save.reputation === "number" &&
        typeof save.scored === "number"
      ) {
        out[key] = {
          gameId: save.gameId,
          level: save.level,
          index: Math.max(0, Math.floor(save.index)),
          reputation: Math.max(0, Math.min(100, Math.round(save.reputation))),
          scored: Math.max(0, Math.floor(save.scored)),
          at: typeof save.at === "number" ? save.at : 0,
        };
      }
    }
    return out;
  } catch {
    return EMPTY;
  }
}

// useSyncExternalStore needs a referentially stable snapshot between changes,
// so the parsed object is cached against the raw string.
let cachedRaw: string | null | undefined;
let cached: Store = EMPTY;
const listeners = new Set<() => void>();

export function progressSnapshot(): Store {
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

/** The server has never seen a save, so it renders a fresh run. */
export function serverProgressSnapshot(): Store {
  return EMPTY;
}

export function subscribeProgress(listener: () => void): () => void {
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
    // Private browsing or a full quota: the run still works, it just will not
    // survive leaving the page.
  }
  for (const listener of listeners) listener();
}

export function readRun(store: Store, gameId: string, level: number): RunSave | null {
  return store[slot(gameId, level)] ?? null;
}

export function saveRun(save: Omit<RunSave, "at">): void {
  const store = { ...progressSnapshot() };
  store[slot(save.gameId, save.level)] = { ...save, at: Date.now() };
  commit(store);
}

/** Called when a level ends or the player starts it over: a finished or
 *  abandoned run should not be resumed into. */
export function clearRun(gameId: string, level: number): void {
  const store = { ...progressSnapshot() };
  delete store[slot(gameId, level)];
  commit(store);
}
