"use client";

// Timers off (WCAG 2.2.1, audit 21 Oct 2026): a timed question that runs
// out is scored Wrong, and a student who reads slowly, uses a screen reader
// or switch access, or is still learning English can't beat the clock. WCAG
// asks for a way to turn a time limit off before it starts, so the HUD
// carries a Timers switch beside Music and Sound. Off: no clock shows, the
// clock never runs, and nothing is scored as timed out. Kept per browser,
// like the music switch.
import { useSyncExternalStore } from "react";

const KEY = "dreamari-play-timers-off";
const listeners = new Set<() => void>();

function read(): boolean {
  try { return window.localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function setTimersOff(off: boolean): void {
  try { window.localStorage.setItem(KEY, off ? "1" : "0"); } catch { /* private mode: this tab only */ }
  memo = off;
  listeners.forEach((l) => l());
}

let memo: boolean | null = null;
function snapshot(): boolean {
  if (memo === null) memo = read();
  return memo;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === KEY) { memo = read(); listener(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

export function useTimersOff(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
