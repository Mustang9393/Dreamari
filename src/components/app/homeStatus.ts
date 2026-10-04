"use client";

// Live one-liners for Home's "Your Next Moves" cards (3 Oct 2026). The cards
// used to carry a sentence of marketing copy each; they now say where the
// student stands (the plan's next step, the nearest deadline), read from the
// same data the Profile and Opportunities read, so Home never disagrees with
// them. Same derivations as Home v2's dashboard tiles (HomeDashboard.tsx).

import { useMemo, useState, useSyncExternalStore } from "react";
import { ALL_PROFILE_CAREERS, DEMO_TOP3, STUDENT } from "@/components/profile/data";
import { collegePlan, currentPlanWindowId, gradePlan } from "@/components/profile/gradePlanData";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { useStage } from "@/lib/stage";
import { opportunityStore } from "@/lib/opportunities";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "@/components/opportunities/data";
import { timing, today } from "@/components/opportunities/match";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The plan's next step for this season, and how far through the season's
 *  steps the student is (a floor of 8% so the bar is never invisible). */
export function usePlanNext(): { step: string; pct: number } {
  const stage = useStage();
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const grade = (Number(STUDENT.grade.replace("Grade ", "")) || 9) as 9 | 10 | 11 | 12;
  return useMemo(() => {
    const ids = stored.ids.filter((id) => ALL_PROFILE_CAREERS.some((c) => c.id === id));
    const lead = ALL_PROFILE_CAREERS.find((c) => c.id === (ids[0] ?? DEMO_TOP3[0]));
    const plan = stage === "hs" ? gradePlan(grade) : collegePlan(1, lead ? { id: lead.id, title: lead.title } : null);
    const id = currentPlanWindowId();
    const win = plan.windows.find((w) => w.id === id) ?? plan.windows[0];
    const first = win.steps[0];
    return { step: first ? first.title : win.title, pct: Math.max(8, Math.round((1 / Math.max(1, win.steps.length)) * 100)) };
  }, [stage, stored, grade]);
}

/** The nearest open deadline among what the student saved, else the nearest
 *  one anyone can still apply to, so the line is never empty. */
export function useNextDeadline(): { name: string; date: string } | null {
  const record = opportunityStore.useValue();
  const [todayIso] = useState(() => today());
  return useMemo(() => {
    const all = [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS, ...INTERNSHIP_ITEMS];
    const dated = (ids: string[]) => ids.map((id) => all.find((i) => i.id === id)).filter((i): i is (typeof all)[number] => !!i)
      .map((item) => ({ item, t: timing(item, todayIso) })).filter((x) => x.t.status === "open" && x.t.iso && x.t.days !== null && x.t.days >= 0)
      .sort((a, b) => (a.t.days ?? 0) - (b.t.days ?? 0));
    const next = dated(Object.keys(record.status))[0] ?? dated(all.map((i) => i.id))[0];
    if (!next) return null;
    const d = new Date(next.t.iso! + "T12:00:00");
    return { name: next.item.name, date: `${MONTHS[d.getMonth()]} ${d.getDate()}` };
  }, [record, todayIso]);
}
