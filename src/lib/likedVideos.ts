"use client";

import { useMemo, useSyncExternalStore } from "react";

/** Liked For You reel videos (Explore > For You, 4 Oct 2026: Joshua asked
 *  for the videos to have actions so watching them is not passive). Same
 *  storage idiom as savedVideos.ts, which the reel's Save uses as is:
 *  browser-only, keyed by the video's own file path, since the reel's
 *  videos have no separate id. A like only tunes For You; it is not a list,
 *  so nothing else in the app reads it yet. */
const KEY = "dm-videos-liked";
const EVENT = "dm-videos-liked-change";

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

export function useLikedVideos(): [Set<string>, (videoPath: string) => void] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const liked = useMemo(() => {
    try {
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [raw]);
  const toggle = (videoPath: string) => {
    const next = new Set(liked);
    if (next.has(videoPath)) next.delete(videoPath);
    else next.add(videoPath);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [liked, toggle];
}
