"use client";

import { useMemo, useSyncExternalStore } from "react";

/** Saved careers (Career Detail's own bookmark, the Saved page's Careers
 *  shelf) -- same storage idiom as saved colleges (colleges/shared.tsx) and
 *  saved videos (lib/savedVideos.ts), browser-only, keyed by career id.
 *  Careers previously had no real save/unsave concept at all: the bookmark
 *  on Career Detail was a local-only toggle that never persisted and never
 *  showed up anywhere (direct feedback, 21 Sept 2026 -- "careers should
 *  also have unsave concept... please include it"). */
const KEY = "dreamari-saved-careers";
const EVENT = "dreamari-saved-careers-change";

function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
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

export function useSavedCareers(): [Set<string>, (careerId: string) => void] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const saved = useMemo(() => {
    try {
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [raw]);
  const toggle = (careerId: string) => {
    const next = new Set(saved);
    if (next.has(careerId)) next.delete(careerId);
    else next.add(careerId);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [saved, toggle];
}
