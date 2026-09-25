"use client";

// My Plan completion by grade and season (25 Sept 2026). What it takes
// from the SchooLinks staff dashboard's Scope & Sequence grid
// (docs/reference/schoolinks-counselor-notes-2026-09.md): an aggregate
// that opens the students who have not done the thing. Built first as a
// four-grade by three-season map on the Overview and the tracker; both
// were pulled back the same day ("let's not show the grid in two places",
// then "the school year map is genuinely confusing me ... we already have
// a grade toggle, let's use that"). What remains: `planGradeSummary` for
// the Overview's one line per grade, and `SeasonStrip`, the selected
// grade's three seasons as ring cells on the Milestone Tracker.

import { ChevronDown } from "lucide-react";
import { GRADE_PLANS, type GradeWindow } from "@/components/profile/gradePlanData";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { planReadings } from "@/lib/studentSignals";
import { GLASS_INSET } from "../surfaces";
import { PRIMARY } from "../palette";
import { SeasonScene } from "@/components/profile/SeasonScene";

export type MapGrade = 9 | 10 | 11 | 12;
export type MapWindow = GradeWindow["id"];
export const MAP_WINDOWS: { id: MapWindow; label: string }[] = [
  { id: "fall", label: "Fall" },
  { id: "winter", label: "Winter" },
  { id: "spring", label: "Spring" },
];

export type MapCell = {
  grade: MapGrade;
  window: MapWindow;
  /** students in the grade */
  students: number;
  /** tracked (student, step) pairs in this season */
  tracked: number;
  done: number;
  donePct: number;
  /** students with at least one tracked step in this season not done */
  notDone: number;
  awaiting: number;
};

/** One cell per grade and season, from what students have actually done. */
export function planMapCells(roster: CounselorStudent[]): MapCell[] {
  const cells = new Map<string, MapCell>();
  for (const p of GRADE_PLANS) for (const w of MAP_WINDOWS) cells.set(`${p.grade}-${w.id}`, { grade: p.grade, window: w.id, students: 0, tracked: 0, done: 0, donePct: 0, notDone: 0, awaiting: 0 });
  for (const s of roster) {
    const behind = new Set<MapWindow>();
    for (const r of planReadings(s)) {
      const c = cells.get(`${s.grade}-${r.window}`);
      if (!c || r.status === "not-tracked") continue;
      c.tracked++;
      if (r.status === "done") c.done++;
      else behind.add(r.window);
      if (r.status === "awaiting-review") c.awaiting++;
    }
    for (const w of MAP_WINDOWS) {
      const c = cells.get(`${s.grade}-${w.id}`);
      if (!c) continue;
      c.students++;
      if (behind.has(w.id)) c.notDone++;
    }
  }
  for (const c of cells.values()) c.donePct = c.tracked ? Math.round((c.done / c.tracked) * 100) : 0;
  return [...cells.values()];
}

export type GradeSummary = { grade: MapGrade; title: string; students: number; tracked: number; done: number; donePct: number; notDone: number; awaiting: number };

/** One line per grade, for the Overview: steps done across the year and
 *  how many students still owe something. Lowest share done first. */
export function planGradeSummary(roster: CounselorStudent[]): GradeSummary[] {
  const out: GradeSummary[] = GRADE_PLANS.map((p) => ({ grade: p.grade, title: p.title, students: 0, tracked: 0, done: 0, donePct: 0, notDone: 0, awaiting: 0 }));
  for (const s of roster) {
    const g = out.find((x) => x.grade === s.grade);
    if (!g) continue;
    g.students++;
    let behind = false;
    for (const r of planReadings(s)) {
      if (r.status === "not-tracked") continue;
      g.tracked++;
      if (r.status === "done") g.done++;
      else behind = true;
      if (r.status === "awaiting-review") g.awaiting++;
    }
    if (behind) g.notDone++;
  }
  for (const g of out) g.donePct = g.tracked ? Math.round((g.done / g.tracked) * 100) : 0;
  return out.filter((g) => g.students > 0).sort((a, b) => a.donePct - b.donePct || b.notDone - a.notDone);
}

export function Ring({ pct, size = 38, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="flex-none">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PRIMARY} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(c * Math.max(0, Math.min(100, pct))) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

/** One grade's three seasons as ring cells (25 Sept 2026, direct feedback:
 *  "the school year map is genuinely confusing me ... we already have a
 *  grade toggle, let's use that"). The grade comes from the tracker's own
 *  tabs; the cells pick the season that opens below. */
export function SeasonStrip({ roster, grade, activeWindow, onPick }: { roster: CounselorStudent[]; grade: MapGrade; activeWindow: MapWindow | null; onPick: (window: MapWindow) => void }) {
  const cells = planMapCells(roster.filter((s) => s.grade === grade)).filter((c) => c.grade === grade);
  return (
    <div className="grid grid-cols-3 gap-[8px]" role="tablist" aria-label={`Grade ${grade} seasons`}>
      {MAP_WINDOWS.map((w) => {
        const c = cells.find((x) => x.window === w.id)!;
        const untracked = c.students > 0 && c.tracked === 0;
        const active = activeWindow === w.id;
        return (
          <button
            key={w.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onPick(w.id)}
            className="dm-quiet dm-season-host dm-season-compact group/cell relative flex min-w-0 cursor-pointer items-center gap-[10px] overflow-hidden rounded-[var(--radius-md)] border px-[10px] py-[9px] text-left sm:px-[12px]"
            style={{ ...GLASS_INSET, ...(active ? { borderColor: `color-mix(in srgb, ${PRIMARY} 55%, var(--glass-border))` } : null) }}
          >
            {/* The student My Plan's season scene lives on these tiles only
               (direct instruction, 25 Sept 2026: "use them on the tiles with
               the graphs only"); the art is held in the tile's right band so
               it never sits under the numbers. */}
            <SeasonScene seasonId={w.id} fadeToHeader />
            <span className="relative hidden flex-none sm:block"><Ring pct={untracked ? 0 : c.donePct} size={36} stroke={4.5} /></span>
            <span className="relative flex min-w-0 flex-1 flex-col">
              <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: active ? PRIMARY : "var(--muted-foreground)" }}>{w.label}</span>
              <span className="text-[15px] leading-[1.1] font-extrabold tabular-nums" style={{ color: untracked ? "var(--muted-foreground)" : "var(--foreground)" }}>{untracked ? "—" : `${c.donePct}%`}</span>
              <span className="hidden truncate text-[11px] font-semibold sm:block" style={{ color: c.awaiting > 0 ? PRIMARY : "var(--muted-foreground)" }}>
                {untracked ? "student reports" : c.awaiting > 0 ? `${c.awaiting} pending` : c.notDone > 0 ? `${c.notDone} to do` : "all done"}
              </span>
            </span>
            <ChevronDown aria-hidden className="relative hidden h-[14px] w-[14px] flex-none transition-transform sm:block" style={{ color: "var(--muted-foreground)", transform: active ? "rotate(180deg)" : "none" }} />
          </button>
        );
      })}
    </div>
  );
}
