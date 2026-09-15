"use client";

import { useMemo, useSyncExternalStore } from "react";

/** Saved "Videos Inside Leading Companies" clips (Explore > Browse), same
 *  storage idiom as saved colleges (src/components/colleges/shared.tsx) --
 *  browser-only, keyed by the video's own file path since CompanyVideo has
 *  no separate id. */
const KEY = "dm-videos-saved";
const EVENT = "dm-videos-saved-change";

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

export function useSavedVideos(): [Set<string>, (videoPath: string) => void] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const saved = useMemo(() => {
    try {
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [raw]);
  const toggle = (videoPath: string) => {
    const next = new Set(saved);
    if (next.has(videoPath)) next.delete(videoPath);
    else next.add(videoPath);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [saved, toggle];
}
