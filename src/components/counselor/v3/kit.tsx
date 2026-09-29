"use client";

// v3's layout kit (29 Sept 2026, direct ask: "proper layouts, ease of
// navigation, design cleanliness, modernity, spacing"). The v3 screens were
// each hand-rolling the same four things (a hero card, a plain card, a
// student row with one action, the row's action button) with slightly
// different paddings, gaps and type sizes. One set here, so every v3 screen
// has the same rhythm: 20px card padding, 16px between blocks, 8px between
// rows, 15px card titles, 13px row titles over 11.5px notes, one 32px
// avatar, one 32px action button. Same v2 budget: one hero per screen,
// blue plus the reserved status colors, one verdict per card.

import { HoverBeam } from "@/components/app/HoverBeam";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { Avatar, Go } from "../chips";
import { GLASS_CARD, GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { PRIMARY } from "../palette";
import { SIS_SYNC_LABEL } from "@/lib/counselorSis";
import { RefreshCw } from "lucide-react";

export const BTN = "dm-quiet flex h-8 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[11px] text-[12.5px] font-bold whitespace-nowrap";
export const BTN_STYLE = { borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
export const BTN_PRIMARY = "dm-solid flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] bg-[var(--primary)] px-[12px] text-[12.5px] font-bold whitespace-nowrap text-[var(--primary-foreground)]";

export function CardTitle({ title, unit, aside }: { title: string; unit?: string; aside?: React.ReactNode }) {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-x-[10px] gap-y-[6px]">
      <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>
        {title}
        {unit && <span className="ml-[8px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{unit}</span>}
      </h2>
      {aside}
    </div>
  );
}

/** The one glowing card a screen gets. */
export function HeroCard({ children, tint = PRIMARY, className = "" }: { children: React.ReactNode; tint?: string; className?: string }) {
  return (
    <HoverBeam strength={0.7} className="h-full">
      <section className={`relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`} style={{ ...GLASS_CARD_HERO, borderColor: `color-mix(in srgb, ${tint} 34%, var(--glass-border))` }}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(tint, 0.26) }} />
        <div className="relative flex h-full flex-col gap-[var(--space-4)]">{children}</div>
      </section>
    </HoverBeam>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`} style={GLASS_CARD}>
      {children}
    </section>
  );
}

/** The card's one line: a dot and a phrase. */
export function Verdict({ tone, children }: { tone: "good" | "warn" | "bad" | "info"; children: React.ReactNode }) {
  const c = tone === "good" ? "var(--cd-green)" : tone === "warn" ? "var(--cd-amber)" : tone === "bad" ? "var(--cd-red)" : PRIMARY;
  return (
    <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
      <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
      <span>{children}</span>
    </p>
  );
}

/** A number over its label. */
export function BigStat({ value, label, tone }: { value: string; label: string; tone?: "warn" | "bad" }) {
  return (
    <span className="flex min-w-0 flex-col gap-[4px]">
      <span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: tone === "bad" ? "var(--cd-red)" : tone === "warn" ? "var(--cd-amber)" : "var(--foreground)" }}>{value}</span>
      <span className="text-[12px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </span>
  );
}

/** A student with one line of why and (optionally) one action. The name
 *  side opens the profile; the action does its one thing. */
export function StudentRow({ student, note, right, action, onOpen, dim }: { student: CounselorStudent; note: React.ReactNode; right?: React.ReactNode; action?: React.ReactNode; onOpen: () => void; dim?: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={{ ...GLASS_INSET, opacity: dim ? 0.64 : 1 }}>
      <button type="button" onClick={onOpen} className="dm-quiet group flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] text-left">
        <Avatar name={student.name} size={32} index={student.avatarIndex} />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{student.name} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· Grade {student.grade}</span></span>
          <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>
        </span>
      </button>
      {right && <span className="flex flex-none items-center gap-[6px] text-[12px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{right}</span>}
      {action ?? <Go />}
    </li>
  );
}

/** A clickable tile: label, a number, a note. Used as a filter or a way in. */
export function Tile({ label, value, note, active, onClick, tone }: { label: string; value: string; note?: string; active?: boolean; onClick?: () => void; tone?: "warn" | "bad" }) {
  const body = (
    <>
      <span className="text-[12px] font-bold" style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[24px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: tone === "bad" ? "var(--cd-red)" : tone === "warn" ? "var(--cd-amber)" : "var(--foreground)" }}>{value}</span>
      {note && <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
    </>
  );
  const cls = "flex min-w-0 flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-3)] text-left";
  const style = { ...GLASS_INSET, borderColor: active ? "color-mix(in srgb, var(--primary) 60%, var(--glass-border))" : GLASS_INSET.borderColor, background: active ? "color-mix(in srgb, var(--primary) 12%, var(--inset-bg))" : GLASS_INSET.background };
  if (!onClick) return <div className={cls} style={style}>{body}</div>;
  return <button type="button" aria-pressed={active} onClick={onClick} className={`dm-quiet cursor-pointer ${cls}`} style={style}>{body}</button>;
}

/** Where the numbers came from, quiet, top right of a screen. */
export function SyncBadge({ label = SIS_SYNC_LABEL }: { label?: string }) {
  return (
    <span className="flex items-center gap-[6px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
      <RefreshCw className="h-[12px] w-[12px]" aria-hidden style={{ color: "var(--cd-green)" }} />
      {label}
    </span>
  );
}

export function RowList({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-[8px]">{children}</ul>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[var(--radius-md)] border border-dashed px-[12px] py-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{children}</p>;
}
