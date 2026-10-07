// The counselor's v4 preferences: notification toggles and the academic
// year. Moved out of v4 Settings (8 Oct 2026) so My Impact can read the
// academic year for its current reporting period. Same storage key and
// change event as before, so saved preferences carry over. DEMO-ONLY:
// browser-local until settings have an API.

import { useMemo, useSyncExternalStore } from "react";

const KEY = "dreamari.counselor.v4.preferences";
const EVENT = "counselor-v4-preferences";

export type CounselorPreferences = { notifications: Record<string, boolean>; year: string; start: string; end: string };

export const PREFERENCE_DEFAULTS: CounselorPreferences = {
  notifications: { submissions: true, overdue: true, questions: true, "low-activity": true, weekly: false },
  year: "2026-2027",
  start: "2026-08-11",
  end: "2027-06-11",
};
const FALLBACK = JSON.stringify(PREFERENCE_DEFAULTS);

const snapshot = () => { try { return localStorage.getItem(KEY) ?? FALLBACK; } catch { return FALLBACK; } };
const serverSnapshot = () => FALLBACK;
const subscribe = (notify: () => void) => {
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", notify);
  return () => { window.removeEventListener(EVENT, notify); window.removeEventListener("storage", notify); };
};

function parse(raw: string): CounselorPreferences {
  try { return { ...PREFERENCE_DEFAULTS, ...(JSON.parse(raw) as Partial<CounselorPreferences>) }; } catch { return PREFERENCE_DEFAULTS; }
}

export function useCounselorPreferences(): CounselorPreferences {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => parse(raw), [raw]);
}

export function updateCounselorPreferences(change: Partial<CounselorPreferences>): void {
  const next = { ...parse(snapshot()), ...change };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* no storage: this session only */ }
  window.dispatchEvent(new Event(EVENT));
}

/** "2026-2027" -> "2026–27"; anything else as typed. */
export function yearLabel(year: string): string {
  const m = year.match(/^(\d{4})\s*[-–]\s*(\d{2})(\d{2})$/);
  return m ? `${m[1]}–${m[3]}` : year;
}
