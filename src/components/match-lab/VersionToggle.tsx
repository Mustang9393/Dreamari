"use client";

import { useRouter } from "next/navigation";

// A/B switcher between the two Match experiences, live in the header of
// BOTH /match-lab (A, the swipe deck) and /match-grid (B, the grid) --
// since every entry point into Match (Build finishing, Profile's "Start
// swiping", the report empty state) already lands on /match-lab, putting
// the toggle there covers all of them without touching each call site;
// mirroring it onto /match-grid lets a student who lands there directly
// (or switches to B) flip back just as easily.
export function MatchVersionToggle({ current, className = "" }: { current: "A" | "B"; className?: string }) {
  const router = useRouter();
  const options: { id: "A" | "B"; label: string; href: string }[] = [
    { id: "A", label: "A", href: "/match-lab" },
    { id: "B", label: "B", href: "/match-grid" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Match version: A (swipe) or B (grid)"
      className={`flex flex-none items-center gap-0.5 rounded-full border p-0.5 ${className}`}
      style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" }}
    >
      {options.map((option) => {
        const active = option.id === current;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (!active) router.push(option.href);
            }}
            className="flex h-6 w-8 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold transition-colors"
            style={{
              background: active ? "var(--color-accent-purple)" : "transparent",
              color: active ? "#ffffff" : "var(--color-night-muted-foreground)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
