// What the counselor shared with students from Explore (a career or a school)
// (8 Oct 2026 audit: "Share with Students only shows a toast; nothing is
// recorded"). Each share names its recipients so it can be listed where the
// counselor reviews what went out (v4 Connect's Sent, v5 Profile's Sent for
// you) and on each student's page. DEMO-ONLY: stored in this browser until
// sends go through the messaging backend.

import { createLocalRecord } from "./localRecord";

export type Share = { id: string; at: string; kind: "career" | "school" | "opportunity" | "reminder"; title: string; ref: string; studentIds: string[]; studentNames: string[] };

const store = createLocalRecord<Share[]>("dreamari-counselor-shares", []);

export function useShares(): Share[] {
  return store.useValue();
}
export function readShares(): Share[] {
  return store.read();
}
export function addShare(s: Omit<Share, "id" | "at">): Share {
  const entry: Share = { ...s, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString() };
  store.update((list) => [entry, ...list].slice(0, 200));
  return entry;
}
/** Shares that reached one student, newest first. */
export function sharesFor(studentId: string, list: Share[]): Share[] {
  return list.filter((s) => s.studentIds.includes(studentId));
}
