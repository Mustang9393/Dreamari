"use client";

// "Hide tips and welcome screens" (WCAG 2.2.4, audit 21 Oct 2026): the app
// interrupts with coachmarks, spot tips and first-visit welcomes. A student
// who finds them distracting, or uses a screen reader that keeps landing in
// them, can turn them all off in Profile > Settings > Accessibility. Kept
// per browser, like the other preferences.
import { useSyncExternalStore } from "react";

const KEY = "dreamari:quiet-tips";
const listeners = new Set<() => void>();
let memo: boolean | null = null;

function read(): boolean {
  try { return window.localStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function quietTips(): boolean {
  if (typeof window === "undefined") return false;
  if (memo === null) memo = read();
  return memo;
}
export function setQuietTips(on: boolean): void {
  try { window.localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* private mode: this tab only */ }
  memo = on;
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === KEY) { memo = read(); listener(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}
export function useQuietTips(): boolean {
  return useSyncExternalStore(subscribe, quietTips, () => false);
}
