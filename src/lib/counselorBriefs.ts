// What a counselor does to a meeting brief before and during the meeting
// (8 Oct 2026 audit: "agenda ticks, added points and saved schools reset on
// every visit"). Kept per student and meeting: the agenda (ticked points,
// the counselor's own points, the notes typed so far) and the schools
// shortlisted from "Schools That Fit". The agenda key is the booked
// meeting's id, or "walk-in" when nothing is booked, so the next meeting
// starts a fresh agenda while the shortlist stays with the student.
// DEMO-ONLY: kept in this browser until briefs are saved to the account.

import { createLocalRecord } from "./localRecord";

export type BriefAgenda = { ticked: string[]; extra: string[]; notes: string };
const EMPTY: BriefAgenda = { ticked: [], extra: [], notes: "" };

const agendas = createLocalRecord<Record<string, BriefAgenda>>("dreamari-counselor-brief-agendas", {});
const shortlists = createLocalRecord<Record<string, string[]>>("dreamari-counselor-brief-schools", {});

export const agendaKey = (studentId: string, meetingId?: string) => `${studentId}:${meetingId ?? "walk-in"}`;

export function useAgenda(key: string): BriefAgenda {
  return agendas.useValue()[key] ?? EMPTY;
}

export function updateAgenda(key: string, fn: (a: BriefAgenda) => BriefAgenda): void {
  agendas.update((all) => ({ ...all, [key]: fn(all[key] ?? EMPTY) }));
}

export function useShortlist(studentId: string): string[] {
  return shortlists.useValue()[studentId] ?? [];
}

export function toggleShortlist(studentId: string, slug: string): void {
  shortlists.update((all) => {
    const cur = all[studentId] ?? [];
    return { ...all, [studentId]: cur.includes(slug) ? cur.filter((x) => x !== slug) : [...cur, slug] };
  });
}
