// Career Report version history (Slack, 10 Sept 2026): every time a report
// is shared, printed or saved on purpose, the state that shaped it is kept,
// so a student can go back, print or share an older version, or restore it.
// No backend in the prototype: localStorage holds the list, newest first,
// capped so it can't grow without bound.

export const REPORT_HISTORY_KEY = "dreamari-report-history";
const MAX_VERSIONS = 30;

export type ReportSnapshot = {
  careerId: string;
  careerTitle: string;
  top3: string[];
  focusId: string | null;
  /** careerId -> chosen route id */
  routeChoice: Record<string, string>;
  /** careerId -> completed plan task ids */
  done: Record<string, string[]>;
  savedMajors: string[];
};

export type ReportVersion = {
  id: string;
  /** ISO timestamp */
  createdAt: string;
  /** what created it: "Shared with counselor", "Printed", "Saved" ... */
  label: string;
  snapshot: ReportSnapshot;
};

const EMPTY: ReportVersion[] = [];

function isVersion(value: unknown): value is ReportVersion {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ReportVersion>;
  return typeof v.id === "string" && typeof v.createdAt === "string" && typeof v.label === "string" && !!v.snapshot && typeof v.snapshot === "object";
}

export function readReportHistory(): ReportVersion[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(REPORT_HISTORY_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isVersion).slice(0, MAX_VERSIONS) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let cachedRaw: string | null | undefined;
let cached: ReportVersion[] = EMPTY;
const listeners = new Set<() => void>();

export function reportHistorySnapshot(): ReportVersion[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(REPORT_HISTORY_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = readReportHistory();
  }
  return cached;
}
export function serverReportHistorySnapshot(): ReportVersion[] {
  return EMPTY;
}
export function subscribeReportHistory(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === REPORT_HISTORY_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function write(list: ReportVersion[]): void {
  try {
    window.localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(list.slice(0, MAX_VERSIONS)));
  } catch {
    // no storage: history simply isn't kept
  }
  for (const listener of listeners) listener();
}

/** Keep a version. A snapshot identical to the newest kept one just
 *  refreshes that entry's label and time instead of duplicating it. */
export function recordReportVersion(label: string, snapshot: ReportSnapshot): ReportVersion {
  const now = new Date().toISOString();
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const version: ReportVersion = { id, createdAt: now, label, snapshot };
  if (typeof window === "undefined") return version;
  const current = readReportHistory();
  const newest = current[0];
  if (newest && sameSnapshot(newest.snapshot, snapshot)) {
    const refreshed = { ...newest, createdAt: now, label };
    write([refreshed, ...current.slice(1)]);
    return refreshed;
  }
  write([version, ...current]);
  return version;
}

export function deleteReportVersion(id: string): void {
  if (typeof window === "undefined") return;
  write(readReportHistory().filter((v) => v.id !== id));
}

export function sameSnapshot(a: ReportSnapshot, b: ReportSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function formatVersionTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
