"use client";

import { Sparkle } from "lucide-react";
import { useDreamScore } from "@/lib/dreamScore";
import { DREAM_SCORE_TARGET_ATTR } from "./xpFlight";

/** The live Dream Score, the same chip the main nav shows, for surfaces
 *  that render their own header (the Resume Builder). Carries the flying
 *  XP landing target so "+N XP" always has somewhere to slot in, and
 *  re-keys on the total so the number rolls in when it changes. */
export function DreamScoreChip({ className = "" }: { className?: string }) {
  const xp = useDreamScore();
  return (
    <span
      key={xp}
      {...{ [DREAM_SCORE_TARGET_ATTR]: "" }}
      className={`flex flex-none items-center gap-[6px] rounded-full border px-[12px] py-[6px] motion-safe:animate-[xp-slot-in_0.75s_cubic-bezier(0.16,1,0.3,1)_both] ${className}`}
      style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
      aria-label={`Dream Score ${xp} XP`}
    >
      <Sparkle aria-hidden className="h-4 w-4" style={{ color: "var(--foreground)" }} />
      <span className="text-[13px] leading-[18px] font-bold tabular-nums" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
        {xp.toLocaleString("en-US")} XP
      </span>
    </span>
  );
}
