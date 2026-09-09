"use client";

import { useId, useState, type ReactNode } from "react";

// Hover tooltip for the Dream Score chip (Joshua Pierce, Slack, 6 Sept 2026):
// one sentence on what earns it and why it matters, under the chip, tucked to
// the right so it hangs off the corner the chip lives in. Opens on hover or
// keyboard focus, closes on leave, blur or Escape. Compact by design: 240px,
// two lines of 12.5px body text, no title.
export const DREAM_SCORE_TIP = "Earn Dream Score by exploring careers, playing games, and building your profile. The higher your score, the more you unlock.";

export function DreamScoreTip({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className={`relative flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
    >
      <span tabIndex={0} aria-describedby={open ? id : undefined} className="flex rounded-[var(--radius-md)] outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: "color-mix(in srgb, var(--primary) 60%, transparent)" }}>
        {children}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute top-[calc(100%+10px)] right-0 z-50 w-[240px] rounded-[var(--radius-md)] border px-[12px] py-[9px] text-left text-[12.5px] leading-[17px] font-medium motion-safe:animate-[fade-slide-up_0.2s_ease-out_both]"
          style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "color-mix(in srgb, var(--primary) 40%, var(--glass-border))", color: "var(--foreground)", boxShadow: "0 18px 40px -20px rgba(0,0,0,0.7), 0 0 24px -12px var(--primary)", fontFamily: "var(--font-body)" }}
        >
          <span aria-hidden className="absolute -top-[6px] right-[18px] block size-[11px] rotate-45 border-t border-l" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "color-mix(in srgb, var(--primary) 40%, var(--glass-border))" }} />
          {DREAM_SCORE_TIP}
        </span>
      )}
    </span>
  );
}
