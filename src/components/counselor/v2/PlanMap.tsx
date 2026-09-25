"use client";

// The school-year map (25 Sept 2026): every grade's My Plan as one grid,
// Grade 9-12 down, Fall / Winter / Spring across, a completion ring per
// cell and the number of students who still owe something in that season.
//
// What it takes from the SchooLinks staff dashboard's Scope & Sequence grid
// (docs/reference/schoolinks-counselor-notes-2026-09.md): the whole school
// on one screen, and every aggregate opens the students who have not done
// the thing. What it deliberately does not copy: their wall of indicator
// rows. Dreamari's plans differ per grade, so the columns are the three
// seasons every plan shares, which reads as a school year (time left to
// right) rather than an audit sheet. One blue, no cell tints; the one
// verdict line names the cell with the most room to grow.

import { ChevronRight } from "lucide-react";
import { GRADE_PLANS, type GradeWindow } from "@/components/profile/gradePlanData";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { planReadings } from "@/lib/studentSignals";
import { STATUS_COLORS } from "../chips";
import { GLASS_INSET } from "../surfaces";
import { PRIMARY } from "../palette";

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

function Ring({ pct, size = 38, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="flex-none">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PRIMARY} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(c * Math.max(0, Math.min(100, pct))) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

/** The one line the map exists to say. */
export function planMapVerdict(cells: MapCell[]): { text: string; color: string } | null {
  const tracked = cells.filter((c) => c.tracked > 0 && c.students > 0);
  if (tracked.length === 0) return null;
  const low = tracked.slice().sort((a, b) => a.donePct - b.donePct || b.notDone - a.notDone)[0];
  const season = MAP_WINDOWS.find((w) => w.id === low.window)?.label.toLowerCase() ?? low.window;
  const color = low.donePct >= 80 ? STATUS_COLORS["On Track"] : low.donePct >= 50 ? STATUS_COLORS["Needs Attention"] : STATUS_COLORS["At Risk"];
  return { text: `Grade ${low.grade} ${season} has the most room to grow`, color };
}

export function PlanMap({ roster, activeGrade, onPick, verdict = true, chevrons = true }: { roster: CounselorStudent[]; /** the grade the surrounding screen is already showing */ activeGrade?: MapGrade; onPick: (grade: MapGrade, window: MapWindow) => void; verdict?: boolean; /** off in a half-width card, where twelve chevrons crowd the cells; the card's own subtitle says the cells open the tracker */ chevrons?: boolean }) {
  const cells = planMapCells(roster);
  const line = verdict ? planMapVerdict(cells) : null;
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {line && (
        <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
          <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: line.color, boxShadow: `0 0 8px ${line.color}` }} />
          <span>{line.text}</span>
        </p>
      )}
      <div className="grid gap-[6px]" style={{ gridTemplateColumns: "minmax(64px,auto) repeat(3, minmax(0, 1fr))" }} role="table" aria-label="My Plan completion by grade and season">
        <span aria-hidden />
        {MAP_WINDOWS.map((w) => (
          <span key={w.id} role="columnheader" className="px-[4px] pb-[2px] text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{w.label}</span>
        ))}
        {GRADE_PLANS.map((p) => {
          const active = activeGrade === p.grade;
          return (
            <div key={p.grade} className="contents" role="row">
              <span role="rowheader" className="flex flex-col justify-center pr-[8px]">
                <span className="text-[13px] font-bold" style={{ color: active ? PRIMARY : "var(--foreground)" }}>Grade {p.grade}</span>
                <span className="hidden text-[11px] font-semibold sm:block" style={{ color: "var(--muted-foreground)" }}>{p.title}</span>
              </span>
              {MAP_WINDOWS.map((w) => {
                const c = cells.find((x) => x.grade === p.grade && x.window === w.id)!;
                const untracked = c.students > 0 && c.tracked === 0;
                return (
                  <button
                    key={w.id}
                    type="button"
                    role="cell"
                    onClick={() => onPick(p.grade, w.id)}
                    className="dm-quiet group/cell flex min-w-0 cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[8px] py-[8px] text-left sm:px-[10px]"
                    style={{ ...GLASS_INSET, ...(active ? { borderColor: `color-mix(in srgb, ${PRIMARY} 45%, var(--glass-border))` } : null) }}
                    aria-label={`Grade ${p.grade} ${w.label}: ${untracked ? "students report this themselves" : `${c.donePct}% done, ${c.notDone} not done`}`}
                  >
                    <Ring pct={untracked ? 0 : c.donePct} size={34} stroke={4.5} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[14px] leading-[1.1] font-extrabold tabular-nums" style={{ color: untracked ? "var(--muted-foreground)" : "var(--foreground)" }}>{untracked ? "—" : `${c.donePct}%`}</span>
                      <span className="hidden truncate text-[11px] font-semibold sm:block" style={{ color: c.awaiting > 0 ? PRIMARY : "var(--muted-foreground)" }}>
                        {untracked ? "student reports" : c.awaiting > 0 ? `${c.awaiting} pending` : c.notDone > 0 ? `${c.notDone} to do` : "all done"}
                      </span>
                    </span>
                    {chevrons && <ChevronRight aria-hidden className="hidden h-[14px] w-[14px] flex-none transition-transform group-hover/cell:translate-x-[2px] sm:block" style={{ color: "var(--muted-foreground)" }} />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
