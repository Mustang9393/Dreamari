// Student activity events the counselor side counts (7 Oct 2026: "real play
// and video-view tracking"). The student app logs a simulation start, a
// simulation finish and a video view here; the counselor's Most Played and
// Most Watched add these to their seeded baselines. Same-browser only in the
// prototype (localStorage); production posts each event to the activity
// API, keyed to the signed-in student.

import { createLocalRecord } from "./localRecord";

export type ActivityKind = "play" | "finish" | "view";
export type ActivityEvent = { kind: ActivityKind; key: string; at: string };

const store = createLocalRecord<ActivityEvent[]>("dreamari-activity-events", []);

export function logActivity(kind: ActivityKind, key: string): void {
  store.update((list) => [{ kind, key, at: new Date().toISOString() }, ...list].slice(0, 1000));
}

export function useActivity(): ActivityEvent[] {
  return store.useValue();
}

export function countActivity(events: ActivityEvent[], kind: ActivityKind, key: string): number {
  return events.filter((e) => e.kind === kind && e.key === key).length;
}
