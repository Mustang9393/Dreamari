"use client";

// Progressive disclosure for the counselor dashboard (25 Sept 2026, direct
// instruction: "try to use progressive disclosure as much as possible
// wherever logical ... like we have in the student My Plan, behind
// accordions"). Same shape as the student's My Plan season accordion
// (ProfileExperience.tsx): a full-width header button with the title, a
// one-line summary and a chevron that turns, and the body only when open.
// The header always carries the summary, so a closed section still answers
// the glance question; opening it is for acting.

import { ChevronDown } from "lucide-react";

export function Disclosure({ id, title, summary, open, onToggle, variant = "section", children }: {
  id: string;
  title: React.ReactNode;
  /** the one line a closed section still shows */
  summary?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  /** "section": small uppercase label (a season inside a card). "card": the card's own 15px heading. */
  variant?: "section" | "card";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="dm-quiet -mx-[8px] flex cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-sm)] px-[8px] py-[6px] text-left"
      >
        {variant === "card" ? (
          <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</span>
        ) : (
          <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: open ? "var(--foreground)" : "var(--muted-foreground)" }}>{title}</span>
        )}
        <span className="flex min-w-0 items-center gap-[10px]">
          {summary && <span className="truncate text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{summary}</span>}
          <ChevronDown aria-hidden className="h-4 w-4 flex-none transition-transform duration-200" style={{ color: "var(--muted-foreground)", transform: open ? "rotate(180deg)" : "none" }} />
        </span>
      </button>
      {open && <div id={id} className="flex flex-col gap-[var(--space-3)]">{children}</div>}
    </div>
  );
}

/** "Show all N" under a list that opens with its first few rows. */
export function ShowAll({ total, shown, open, onToggle }: { total: number; shown: number; open: boolean; onToggle: () => void }) {
  if (total <= shown && !open) return null;
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="dm-quiet flex w-fit cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[5px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      {open ? `Show top ${shown}` : `Show all ${total}`}
      <ChevronDown aria-hidden className="h-[13px] w-[13px] transition-transform duration-200" style={{ color: "var(--muted-foreground)", transform: open ? "rotate(180deg)" : "none" }} />
    </button>
  );
}
