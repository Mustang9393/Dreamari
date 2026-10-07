// A student handed to a teammate (7 Oct 2026, gap 2 in
// docs/handoff/specs/counselor-app-ux.md: "handoffs lose notes"). The note
// travels with the student, and the student page says who has them now.
// DEMO-ONLY store; production reassigns the caseload in the SIS roster.

import { createLocalRecord } from "./localRecord";

export type Handoff = { to: string; note: string; at: string };
const store = createLocalRecord<Record<string, Handoff>>("dreamari-counselor-handoffs", {});

export function useHandoffs(): Record<string, Handoff> {
  return store.useValue();
}

export function handOff(studentId: string, to: string, note: string): void {
  store.update((h) => ({ ...h, [studentId]: { to, note, at: new Date().toISOString() } }));
}

export function undoHandoff(studentId: string): void {
  store.update((h) => {
    const next = { ...h };
    delete next[studentId];
    return next;
  });
}
