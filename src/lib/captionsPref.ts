"use client";

// Captions on or off for the company videos (21 Oct 2026, Chandu: "also make
// captions toggleable"). On by default, since most students meet these clips
// with the sound off and WCAG 1.2.2 wants them there; a viewer who would
// rather watch clean can turn them off once and every player remembers. The
// native CC menu in players with controls feeds the same switch
// (VideoTranscript.tsx CaptionTrack). Kept per browser, like the others.
import { useSyncExternalStore } from "react";

const KEY = "dreamari-captions";
const listeners = new Set<() => void>();
let memo: boolean | null = null;

function read(): boolean {
  try { return window.localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function captionsOn(): boolean {
  if (typeof window === "undefined") return true;
  if (memo === null) memo = read();
  return memo;
}
export function setCaptionsOn(on: boolean): void {
  if (on === captionsOn()) return;
  try { window.localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode: this tab only */ }
  memo = on;
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === KEY) { memo = read(); listener(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}
export function useCaptionsOn(): boolean {
  return useSyncExternalStore(subscribe, captionsOn, () => true);
}
