"use client";

import { useSyncExternalStore } from "react";
import { XpBadge, StreakBolt } from "./ScoreIcons";
import { useDreamScore } from "@/lib/dreamScore";
import { DREAM_SCORE_TARGET_ATTR } from "./xpFlight";
import { DreamScoreTip, STREAK_TIP } from "./DreamScoreTip";
import { Shimmer } from "@/components/app/states";

/** THE streak and Dream Score chip: lightning and streak, then the XP badge
 *  and the XP, no divider, the same everywhere the top bar appears (desktop nav,
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
      // no surface and no divider: two small numbers with air between them,
      // the Dream Score leading (bold, full ink) and the streak behind it
      // (Chandu, 15 Oct 2026: they were clutter, take less space)
      className={`flex h-10 flex-none items-center gap-[12px] px-[2px] text-[13px] leading-[18px] tabular-nums ${className}`}
      style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
    >
      <DreamScoreTip text={STREAK_TIP}>
        <span role="img" aria-label="12 day streak" className="flex items-center gap-[3px] font-semibold" style={{ color: "color-mix(in srgb, var(--foreground) 78%, transparent)" }}><StreakBolt size={24} />12</span>
      </DreamScoreTip>
      {known ? (
        <DreamScoreTip>
          <span role="img" key={xp} {...{ [DREAM_SCORE_TARGET_ATTR]: "" }} aria-label={`Dream Score ${xp} XP`} className="flex items-center gap-[4px] font-bold motion-safe:animate-[xp-slot-in_0.75s_cubic-bezier(0.16,1,0.3,1)_both]">
            <XpBadge size={26} />{xp.toLocaleString("en-US")}
          </span>
        </DreamScoreTip>
      ) : (
        <span role="img" aria-label="Loading Dream Score" className="flex items-center gap-[4px]">
          <XpBadge size={26} />
          <Shimmer className="h-[12px] w-[28px] rounded-full" />
        </span>
      )}
    </span>
  );
}
