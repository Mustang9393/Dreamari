"use client";

// Event reminders (12 Oct 2026): "Remind me" on an upcoming event, kept in
// one place so the ticket on a United Way board and the event's own page
// on Connect's event board agree. DEMO-ONLY: in memory for the session; the
// real reminder is a server-side notification before the event starts.

import { useSyncExternalStore } from "react";

let state: Record<string, boolean> = {};
const EMPTY: Record<string, boolean> = {};
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Flips one event's reminder; returns the new value. */
export function toggleEventReminder(id: string): boolean {
  state = { ...state, [id]: !state[id] };
  listeners.forEach((fn) => fn());
  return state[id];
}

export function useEventReminders(): Record<string, boolean> {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}
