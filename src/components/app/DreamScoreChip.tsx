"use client";

import { useSyncExternalStore } from "react";
import { ScoreBolt, StreakFlame } from "./ScoreIcons";
import { useDreamScore } from "@/lib/dreamScore";
import { DREAM_SCORE_TARGET_ATTR } from "./xpFlight";
import { DreamScoreTip, STREAK_TIP } from "./DreamScoreTip";
import { Shimmer } from "@/components/app/states";

/** THE streak and Dream Score chip: flame and streak, a divider, a filled
 *  bolt and the XP, the same everywhere the top bar appears (desktop nav,
 *  phone and tablet header, the Resume Builder's own header). The XP half
 *  carries the flying-XP landing target and re-keys on the total so the
 *  number rolls in when it changes (direct feedback, 18 Sept 2026: one
 *  counter, one icon, one animation, site-wide; streak and XP in one chip).
 *  Each half has its own hover target and its own tooltip text -- a single
 *  wrapper around both used to show the Dream Score explanation even when
 *  hovering the streak (direct feedback, 19 Sept 2026). */
const noopSubscribe = () => () => {};

export function DreamScoreChip({ className = "" }: { className?: string }) {
  const xp = useDreamScore();
  // useDreamScore reads localStorage through useSyncExternalStore, whose
  // server snapshot is always 0 -- so the very first client paint shows 0
  // XP for a split second before the real total lands, a wrong number
  // flashing rather than a genuine load. Surface 57 (27 Sept 2026): treat
  // that pre-mount instant as "score unknown" and shimmer it instead, the
  // same shimmer every other loading surface uses.
  const known = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return (
    <span
      // no bordered surface: the two numbers sit plain in the bar with air
      // around them (direct feedback, 19 Sept 2026)
      className={`flex h-10 flex-none items-center gap-[10px] px-[6px] text-[13px] leading-[18px] font-bold tabular-nums ${className}`}
      style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
    >
      <DreamScoreTip text={STREAK_TIP}>
        <span aria-label="12 day streak" className="flex items-center gap-[5px]"><StreakFlame size={17} /> 12</span>
      </DreamScoreTip>
      <span aria-hidden className="h-[14px] w-px" style={{ background: "var(--glass-border)" }} />
      {known ? (
        <DreamScoreTip>
          <span key={xp} {...{ [DREAM_SCORE_TARGET_ATTR]: "" }} aria-label={`Dream Score ${xp} XP`} className="flex items-center gap-[5px] motion-safe:animate-[xp-slot-in_0.75s_cubic-bezier(0.16,1,0.3,1)_both]">
            <ScoreBolt size={17} /> {xp.toLocaleString("en-US")}
          </span>
        </DreamScoreTip>
      ) : (
        <span aria-label="Loading Dream Score" className="flex items-center gap-[5px]">
          <ScoreBolt size={17} />
          <Shimmer className="h-[12px] w-[28px] rounded-full" />
        </span>
      )}
    </span>
  );
}
