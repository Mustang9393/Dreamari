// Drafts from the Productivity Suite, one per student and document kind
// (8 Oct 2026 audit: "drafts are useState only and vanish on navigation").
// The suite writes here as the counselor generates or edits, so a letter
// half written on Monday is still there on Tuesday, on the Documents tab
// and on the student's own Drafts tab alike, and the letters queue can add
// evidence straight into the open letter. DEMO-ONLY: kept in this browser
// until drafts are saved to the counselor's account.

import { createLocalRecord } from "./localRecord";

export type SavedDraft = { studentId: string; kind: string; letterType: string; text: string; updatedAt: string };

const store = createLocalRecord<Record<string, SavedDraft>>("dreamari-counselor-drafts", {});

export const draftKey = (studentId: string, kind: string) => `${studentId}:${kind}`;

export function useDrafts(): Record<string, SavedDraft> {
  return store.useValue();
}

export function readDraft(studentId: string, kind: string): SavedDraft | undefined {
  return store.read()[draftKey(studentId, kind)];
}

export function saveDraft(d: Omit<SavedDraft, "updatedAt">): void {
  store.update((all) => ({ ...all, [draftKey(d.studentId, d.kind)]: { ...d, updatedAt: new Date().toISOString() } }));
}

export function removeDraft(studentId: string, kind: string): void {
  store.update((all) => {
    const next = { ...all };
    delete next[draftKey(studentId, kind)];
    return next;
  });
}

/** Saved drafts, newest first; one student's only when an id is given. */
export function listDrafts(all: Record<string, SavedDraft>, studentId?: string): SavedDraft[] {
  return Object.values(all).filter((d) => !studentId || d.studentId === studentId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
}
