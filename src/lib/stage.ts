// The demo student's stage: high school or college. Real accounts know
// this; the prototype keeps it in storage so one Demo toggle (My Plan)
// changes what the whole app shows, notifications included. Mentorship
// and chat are strictly college.

import { useSyncExternalStore } from "react";

export type Stage = "hs" | "college";
export const STAGE_KEY = "dreamari-stage";
const listeners = new Set<() => void>();

export function readStage(): Stage {
  if (typeof window === "undefined") return "hs";
  try {
    return window.localStorage.getItem(STAGE_KEY) === "college" ? "college" : "hs";
  } catch {
    return "hs";
  }
}
export function writeStage(stage: Stage): void {
  try { window.localStorage.setItem(STAGE_KEY, stage); } catch { /* no storage */ }
  for (const l of listeners) l();
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === STAGE_KEY) listener(); };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); if (typeof window !== "undefined") window.removeEventListener("storage", onStorage); };
}
export function useStage(): Stage {
  return useSyncExternalStore(subscribe, readStage, () => "hs");
}
