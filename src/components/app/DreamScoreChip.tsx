"use client";

import { Flame, Zap } from "lucide-react";
import { useDreamScore } from "@/lib/dreamScore";
import { DREAM_SCORE_TARGET_ATTR } from "./xpFlight";
import { DreamScoreTip } from "./DreamScoreTip";

/** THE streak and Dream Score chip: flame and streak, a divider, a filled
 *  bolt and the XP, the same everywhere the top bar appears (desktop nav,
 *  phone and tablet header, the Resume Builder's own header). The XP half
 *  carries the flying-XP landing target and re-keys on the total so the
 *  number rolls in when it changes (direct feedback, 18 Sept 2026: one
 *  counter, one icon, one animation, site-wide; streak and XP in one chip). */
export function DreamScoreChip({ className = "" }: { className?: string }) {
  const xp = useDreamScore();
  return (
    <DreamScoreTip className={`flex ${className}`}>
      <span
        // no bordered surface: the two numbers sit plain in the bar with air
        // around them (direct feedback, 19 Sept 2026)
        className="flex h-10 flex-none items-center gap-[10px] px-[6px] text-[13px] leading-[18px] font-bold tabular-nums"
        style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
        aria-label={`12 day streak, Dream Score ${xp} XP`}
      >
        <span className="flex items-center gap-[4px]"><Flame aria-hidden className="h-4 w-4" style={{ color: "var(--accent)" }} /> 12</span>
        <span aria-hidden className="h-[14px] w-px" style={{ background: "var(--glass-border)" }} />
        <span key={xp} {...{ [DREAM_SCORE_TARGET_ATTR]: "" }} className="flex items-center gap-[4px] motion-safe:animate-[xp-slot-in_0.75s_cubic-bezier(0.16,1,0.3,1)_both]">
          <Zap aria-hidden className="h-4 w-4" fill="currentColor" style={{ color: "var(--accent)" }} /> {xp.toLocaleString("en-US")}
        </span>
      </span>
    </DreamScoreTip>
  );
}
