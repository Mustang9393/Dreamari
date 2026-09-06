"use client";

import { QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { Sparkles } from "lucide-react";
import { useDreamScore } from "@/lib/dreamScore";

// The header for focus flows (Build, Match, the games): the same wordmark and
// the same hamburger every other app screen carries, in the same corners, and
// nothing else. No destination tabs on purpose: a student in the middle of
// Build or Match should finish before the app offers somewhere else to go.
// The theme switch lives inside the hamburger's menu, as it does everywhere,
// so the old standalone sun/moon button is gone.
//
// Fixed and pointer-transparent as a bar, so the flow beneath keeps every
// swipe and scroll; only the two controls take pointer events. Carries the
// marketing-v2 token scope itself, since Build and Match do not wrap their
// pages in it.
export function FlowChrome() {
  // Dream Score carried through Build and Match: small, beside the menu,
  // visible but never competing with the task (Joshua Pierce, 5 Sept 2026)
  const score = useDreamScore();
  return (
    <header className="marketing-v2 themeable pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 pt-5 md:px-8" style={{ background: "transparent" }}>
      <span className="pointer-events-auto flex">
        <Wordmark />
      </span>
      <span className="pointer-events-auto relative flex items-center gap-[10px]">
        {/* re-keyed on every score change: the chip bounces in, a ring flashes
           off it and the sparkle spins once as the points slot in */}
        {score > 0 && (
          <span key={score} aria-label={`Dream Score ${score} XP`} className="flex h-9 items-center gap-[5px] rounded-[var(--radius-md)] px-[10px] text-[12.5px] leading-[16px] font-bold tabular-nums motion-safe:animate-[xp-slot-in_0.75s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ background: "var(--glass-surface-2)", boxShadow: "inset 0 0 0 1px var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
            <Sparkles className="h-3.5 w-3.5 motion-safe:animate-[xp-spin_0.75s_ease-out_both]" aria-hidden style={{ color: "var(--accent-subtle)" }} /> {score.toLocaleString("en-US")} XP
          </span>
        )}
        <QuickLinksMenu />
      </span>
    </header>
  );
}
