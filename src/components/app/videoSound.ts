"use client";

import { useSyncExternalStore } from "react";

// One shared sound preference for every inline video preview on the page
// (Explore's company-video rail today), so muting one card mutes all of
// them and the choice survives to the next card the student hovers
// (direct feedback, 11 Sept 2026: "make it device sound setting aware" --
// a real toggle the student sets once, not per-card). Persisted so it
// survives a reload too. Sound defaults ON: these previews are meant to be
// heard on hover; a browser that blocks unmuted autoplay without a real
// gesture falls back to a silent preview on its own (see CompanyVideoCards),
// which does not change this preference.
const STORAGE_KEY = "dreamari-video-sound-muted";
const listeners = new Set<() => void>();
let cached: boolean | null = null;

function read(): boolean {
  if (cached !== null) return cached;
  try {
    cached = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    cached = false;
  }
  return cached;
}

export function isVideoSoundMuted(): boolean {
  return read();
}

export function setVideoSoundMuted(muted: boolean) {
  cached = muted;
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // private browsing etc. -- the choice just won't persist
  }
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** The shared sound preference, live across every card using it. */
export function useVideoSoundMuted(): boolean {
  return useSyncExternalStore(subscribe, isVideoSoundMuted, () => false);
}
