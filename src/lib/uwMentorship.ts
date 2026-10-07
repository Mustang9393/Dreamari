// Where a student is in United Way's e-Mentorship (7 Oct 2026). One store
// shared by the United Way board ("I'm interested") and the Mentorship tab
// (the full program), so raising a hand on the board shows up in
// Mentorship and the other way round (Chandu: "an I'm interested model in
// the community board where I mark my interest and can fully explore the
// mentorship in Mentorship like we have for Coach. But make it make sense.").
//
// The path, in order:
//   none       → the program is open to explore
//   interested → the student raised a hand; a three-question form is next
//   applied    → the form is in; matching happens before October 1
//   matched    → a mentor is assigned; meetings are program-led
// High school: no direct messages at any stage.

import { useSyncExternalStore } from "react";

export type UwStage = "none" | "interested" | "applied" | "matched";
export type UwApplication = { grade: string; help: string[]; when: string };
type State = { stage: UwStage; app?: UwApplication };

const KEY = "dreamari-uw-mentorship";
const listeners = new Set<() => void>();
const EMPTY: State = { stage: "none" };
let cache: State | null = null;

function read(): State {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as State) } : EMPTY;
  } catch { cache = EMPTY; }
  return cache;
}

function write(next: State): void {
  cache = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* no storage */ }
  listeners.forEach((l) => l());
}

export function setUwStage(stage: UwStage, app?: UwApplication): void {
  write({ ...read(), stage, ...(app ? { app } : {}) });
}

/** "I'm interested" never moves a student backwards. */
export function markUwInterest(): void {
  if (read().stage === "none") setUwStage("interested");
}

export function useUwMentorship(): State {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    read,
    () => EMPTY,
  );
}
