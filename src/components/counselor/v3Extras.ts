"use client";

// DEMO-ONLY: whether v3 shows the counselor-research screens (Academics,
// Applications, Meetings, Financial Aid, Time log). Hidden by default since
// 2 Oct 2026 (direct instruction: "hide the extra stuff just for now. have
// a toggle somewhere we can bring those back instanteneously for
// discussion"). The toggle sits in the bottom version dock, next to the v3
// pill, so it never mixes with the real UI. Remembered per device.

import { useSyncExternalStore } from "react";

const KEY = "dreamari:counselor-v3-extras";
const listeners = new Set<() => void>();

function read(): boolean {
  try { return window.localStorage.getItem(KEY) === "on"; } catch { return false; }
}

export function setV3Extras(on: boolean) {
  try { window.localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* this page only */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** True when the research screens are shown in v3. */
export function useV3Extras(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
