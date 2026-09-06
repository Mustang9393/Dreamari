"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

// The marketing-page twin of the app's Folded section (career detail, the
// Career Report's "Where this comes from"): the heading IS the control,
// collapsed it is the heading alone, open it is the content. Same aria
// wiring, same chevron; only the surface tokens are the marketing scope's.
// Two sizes: "md" is a standalone question row (the FAQ), "sm" sits under a
// card's own heading ("What students do" inside a stage row) and so has to
// stay visibly smaller than that heading.
type DisclosureProps = {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  size?: "md" | "sm";
  children: ReactNode;
};

export function Disclosure({ id, title, open, onToggle, size = "md", children }: DisclosureProps) {
  const isRow = size === "md";
  return (
    <div
      className={isRow ? "border-t" : "rounded-xl border"}
      style={{ borderColor: "var(--border)", background: isRow ? undefined : "var(--glass-surface-1)" }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className={`flex w-full cursor-pointer items-center justify-between gap-4 text-left transition-colors duration-150 ${
          isRow ? "py-5 sm:py-6" : "rounded-[inherit] px-4 py-3 hover:[background:var(--glass-surface-2)]"
        }`}
        style={{ color: "var(--foreground)" }}
      >
        {isRow ? (
          <h3 className="min-w-0 text-[17px] leading-snug font-bold sm:text-[18px]">{title}</h3>
        ) : (
          <span className="min-w-0 text-[14px] font-bold">{title}</span>
        )}
        <ChevronDown
          aria-hidden
          className={`flex-none transition-transform duration-200 ${isRow ? "h-5 w-5" : "h-4 w-4"}`}
          style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }}
        />
      </button>
      <div id={`${id}-panel`} hidden={!open} className={isRow ? "pb-6 sm:pb-7" : "px-4 pt-1 pb-4"}>
        {children}
      </div>
    </div>
  );
}
