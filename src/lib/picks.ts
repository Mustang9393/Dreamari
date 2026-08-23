// What the student carried out of Match: the careers they swiped right on, in
// their own ranking, and which one they chose to start with in the report
// chooser. There is no backend in the prototype, so localStorage IS the
// handoff between /match-lab, /career-report and /profile.
//
// Career ids are the shared catalogue ids used by the match deck, the profile
// (PROFILE_CAREERS / LOCKER_EXTRAS) and the reports (CAREER_REPORTS_V2) --
// "investment-banking", "airline-pilot", and so on. One vocabulary, so a
// career swiped in the deck resolves to a real report and a real plan.

export const PICKS_KEY = "dreamari-picks";

export type Picks = {
  /** career ids, best first, at most three */
  ids: string[];
  /** the one they chose to start with; always a member of ids */
  focus: string | null;
};

const EMPTY: Picks = { ids: [], focus: null };

function isPicks(value: unknown): value is Picks {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Picks>;
  if (!Array.isArray(candidate.ids) || candidate.ids.some((id) => typeof id !== "string")) return false;
  return candidate.focus === null || typeof candidate.focus === "string";
}

/** Reads the stored picks. Returns empty on the server, and on anything
 *  malformed -- a stale or hand-edited value must never break a screen. */
export function readPicks(): Picks {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(PICKS_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!isPicks(parsed)) return EMPTY;
    const ids = parsed.ids.slice(0, 3);
    return { ids, focus: parsed.focus && ids.includes(parsed.focus) ? parsed.focus : null };
  } catch {
    return EMPTY;
  }
}

/** A React-readable snapshot of storage. useSyncExternalStore demands a
 *  referentially STABLE value between changes, so the parsed object is cached
 *  against the raw string and only rebuilt when that string actually moves --
 *  returning a fresh object every call would spin the renderer forever. */
let cachedRaw: string | null | undefined;
let cachedPicks: Picks = EMPTY;
const listeners = new Set<() => void>();

export function picksSnapshot(): Picks {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PICKS_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPicks = readPicks();
  }
  return cachedPicks;
}

/** The server has no storage, so it renders as if nothing was ever chosen.
 *  Anything that must be right in the first paint travels in the URL instead. */
export function serverPicksSnapshot(): Picks {
  return EMPTY;
}

export function subscribePicks(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab writing counts too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PICKS_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function writePicks(picks: Picks): void {
  if (typeof window === "undefined") return;
  try {
    const ids = picks.ids.slice(0, 3);
    const next: Picks = { ids, focus: picks.focus && ids.includes(picks.focus) ? picks.focus : null };
    window.localStorage.setItem(PICKS_KEY, JSON.stringify(next));
  } catch {
    // Private browsing, quota, disabled storage: the flow still works for the
    // length of one navigation because the ids also travel in the URL.
  }
  for (const listener of listeners) listener();
}

/** The ?picks= handoff: "investment-banking,airline-pilot,private-equity".
 *  The URL is the authority right after Match (deep-linkable for demos);
 *  storage is what survives a refresh or a later visit to /profile. */
export function parsePicksParam(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function picksParam(ids: string[]): string {
  return ids.slice(0, 3).join(",");
}
