"use client";

import { useSyncExternalStore } from "react";

// Dream Score (XP), introduced early and often (Joshua Pierce, 5 Sept 2026):
// complete a milestone, earn points, see the number rise, want the next one.
// DEMO ONLY storage: kept in the browser for the prototype; production stores
// the score server-side and awards once per milestone id.
const KEY = "dreamari:dream-score";
const AWARDS_KEY = "dreamari:dream-score:awards";
const EVENT = "dreamari:dream-score-change";

export function readDreamScore(): number {
  try {
    return Number(window.localStorage.getItem(KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

/** Award points once per milestone id; returns the new total (or the current one if already awarded). */
export function awardDreamScore(milestone: string, points: number): { total: number; awarded: boolean } {
  try {
    const awards = new Set<string>(JSON.parse(window.localStorage.getItem(AWARDS_KEY) ?? "[]"));
    if (awards.has(milestone)) return { total: readDreamScore(), awarded: false };
    awards.add(milestone);
    const total = readDreamScore() + points;
    window.localStorage.setItem(KEY, String(total));
    window.localStorage.setItem(AWARDS_KEY, JSON.stringify([...awards]));
    window.dispatchEvent(new Event(EVENT));
    return { total, awarded: true };
  } catch {
    return { total: 0, awarded: false };
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The live score; 0 on the server and before the first paint. */
export function useDreamScore(): number {
  return useSyncExternalStore(subscribe, readDreamScore, () => 0);
}
