"use client";

// My Plan steps the student ticked, kept (v2, lib/top3Flow, 19 Oct 2026).
// The plan's ticks used to live in component state and vanish on reload;
// in v2 they are saved, with the career and the day, so the Career Report's
// "Logged in Dreamari" can show what the student really did instead of
// seeded lines (audit: "the Report's exploration log is fake").
// Browser-only, like every student store in the prototype.
import { createLocalRecord } from "./localRecord";

export type PlanDone = { id: string; title: string; careerId: string | null; date: string };

const store = createLocalRecord<PlanDone[]>("dreamari-plan-done", []);

export function usePlanDone(): PlanDone[] {
  return store.useValue();
}

export function togglePlanDone(step: { id: string; title: string }, careerId: string | null): void {
  store.update((list) => (list.some((d) => d.id === step.id)
    ? list.filter((d) => d.id !== step.id)
    : [...list, { id: step.id, title: step.title, careerId, date: new Date().toISOString().slice(0, 10) }]));
}
