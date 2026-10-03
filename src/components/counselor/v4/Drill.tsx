"use client";

// One drill-down for every summary card (27 Sept 2026, direct instruction:
// "Offer drilldown capability of EVERY SINGLE CARD that can afford it",
// after the My Impact clean-up: "we'll need drill down for more details if
// we considerably reduced clutter"). A card shows the answer; its drill
// holds what the card no longer says: the full wording, the breakdown
// behind the number, the students it counts, and one way to act. Same
// side panel the Milestone Tracker already opens, so drilling reads the
// same everywhere.

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SurfaceState } from "@/components/app/SurfaceState";
import { Avatar, Go } from "./chips";
import { GLASS_INSET } from "../surfaces";
import { SidePanel } from "./SidePanel";

export type DrillStudent = { id: string; name: string; grade: number; avatarIndex?: number; note: string };
export type Drill = {
  title: string;
  subtitle?: string;
  /** the full sentence the card cut down, verbatim where it came from the Replit */
  lead?: string;
  stats?: { value: string; label: string }[];
  /** a breakdown, drawn as bars when `pct` is set */
  rows?: { label: string; value: string; pct?: number }[];
  rowsLabel?: string;
  /** more lines (ideas, actions, facts), as a checklist */
  items?: string[];
  itemsLabel?: string;
  students?: DrillStudent[];
  studentsLabel?: string;
  action?: { label: string; onClick: () => void };
};

/** A card or tile that opens a drill. The whole surface is the target;
 *  the arrow shows on hover, the shared affordance for "opens something". */
export function DrillTile({ onOpen, label, className = "", style, children }: { onOpen: () => void; label: string; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`${label}: details`} className={`dm-quiet group relative flex w-full cursor-pointer flex-col text-left ${className}`} style={style ?? { ...GLASS_INSET }}>
      {children}
      <Go className="absolute right-[12px] bottom-[12px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </button>
  );
}

export function DrillBar({ pct }: { pct: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
      <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 45%, transparent), var(--primary))" }} />
    </span>
  );
}

const label = "text-[11px] font-bold tracking-[0.06em] uppercase";

export function DrillPanel({ drill, onClose }: { drill: Drill | null; onClose: () => void }) {
  const router = useRouter();
  // Nothing to show at all (a card wired for a drill with no breakdown
  // authored yet): tier 3, one plain line, rather than an open panel with
  // just a title and dead space underneath (27 Sept 2026 -- COMPONENT_INVENTORY
  // row 59). Wrapped in SurfaceState so `?state=loading|error&surface=59`
  // still previews those states even though a drill's own data is always
  // synchronous today (built from local roster data, no network).
  const isEmpty = !!drill && !drill.lead && !drill.stats?.length && !drill.rows?.length && !drill.items?.length && !drill.students?.length && !drill.action;
  return (
    <SidePanel open={!!drill} onClose={onClose} title={drill?.title ?? ""} subtitle={drill?.subtitle}>
      {drill && (
        <SurfaceState id={59} isEmpty={isEmpty}>
          {drill.lead && <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13.5px] leading-[20px]" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>{drill.lead}</p>}
          {drill.stats && (
            <div className="grid grid-cols-2 gap-[8px]">
              {drill.stats.map((s) => (
                <span key={s.label} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
                  <span className="text-[20px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.value}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
                </span>
              ))}
            </div>
          )}
          {drill.rows && (
            <div className="flex flex-col gap-[10px]">
              {drill.rowsLabel && <span className={label} style={{ color: "var(--muted-foreground)" }}>{drill.rowsLabel}</span>}
              {drill.rows.map((r) => (
                <span key={r.label} className="flex flex-col gap-[5px]">
                  <span className="flex items-baseline justify-between gap-[10px] text-[13px]">
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>{r.label}</span>
                    <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.value}</span>
                  </span>
                  {typeof r.pct === "number" && <DrillBar pct={r.pct} />}
                </span>
              ))}
            </div>
          )}
          {drill.items && (
            <div className="flex flex-col gap-[8px]">
              {drill.itemsLabel && <span className={label} style={{ color: "var(--muted-foreground)" }}>{drill.itemsLabel}</span>}
              <ul className="flex flex-col gap-[8px]">
                {drill.items.map((it) => (
                  <li key={it} className="flex items-start gap-[9px] text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: "var(--primary)" }} />{it}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {drill.students && drill.students.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <span className={label} style={{ color: "var(--muted-foreground)" }}>{drill.studentsLabel ?? `${drill.students.length} students`}</span>
              <ul className="flex flex-col gap-[4px]">
                {drill.students.slice(0, 12).map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)} className="dm-quiet group flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[6px] py-[6px] text-left">
                      <Avatar name={s.name} size={30} index={s.avatarIndex} />
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.note}</span>
                      </span>
                      <Go className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
              {drill.students.length > 12 && <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>and {drill.students.length - 12} more</span>}
            </div>
          )}
          {drill.action && (
            <button type="button" onClick={drill.action.onClick} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] mt-auto flex h-10 w-full flex-none cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] text-[13px] font-bold">
              {drill.action.label} <Go />
            </button>
          )}
        </SurfaceState>
      )}
    </SidePanel>
  );
}
