"use client";

import { useId } from "react";

// Illustrated marks for the streak and Dream Score chip: gradient-filled
// shapes with a soft highlight instead of flat single-colour line icons
// (direct feedback, 19 Sept 2026: "make them white or use proper
// illustration svgs with solid/gradient or multicolor stuff that matches
// the brand"). The bolt wears the brand ramp, blue into the accent purple;
// the flame is warm so the streak reads as fire at a glance, with a brand
// blue core to tie it back. Gradient ids come from useId so several chips
// on one page never share (and clobber) a definition.

export function StreakFlame({ size = 16, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${id}-outer`} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFD166" />
          <stop offset="0.45" stopColor="#FF8A3D" />
          <stop offset="1" stopColor="#FF4D2E" />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="12" y1="11" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF4C2" />
          <stop offset="0.6" stopColor="#FFC24D" />
          <stop offset="1" stopColor="#7FA8FF" />
        </linearGradient>
      </defs>
      <path
        d="M12.6 2.2c.4 3.1 2.1 4.9 3.9 6.6C18.4 10.6 20 12.6 20 15.3 20 19.6 16.5 22 12 22s-8-2.5-8-6.8c0-2.6 1.3-4.7 3.2-6.2-.1 1.6.5 2.7 1.6 3.3-.3-3.5 1.2-7 3.8-10.1Z"
        fill={`url(#${id}-outer)`}
      />
      <path
        d="M12.3 11.4c.5 1.6 1.5 2.5 2.4 3.5.8.9 1.3 1.8 1.3 2.9 0 2.3-1.8 3.7-4 3.7s-4-1.4-4-3.7c0-1.3.6-2.4 1.6-3.2 0 .9.4 1.5 1 1.8-.2-1.9.6-3.5 1.7-5Z"
        fill={`url(#${id}-inner)`}
      />
    </svg>
  );
}

/** The Dream Score mark: a four point "dream spark" with a small twin, in the
 *  brand ramp (sky blue into brand blue into the accent violet, deep enough to read on the light theme too). It replaces
 *  the lightning bolt (Chandu, 15 Oct 2026: streak and XP read as clutter, and
 *  a bolt is every app's XP icon). A spark is already this app's own motion
 *  language (SparkBar, the nudge sparkle), so the icon and the "+N XP" that
 *  flies into it speak the same way. */
const STAR = "M12 2C12.8 7.5 16.5 11.2 22 12C16.5 12.8 12.8 16.5 12 22C11.2 16.5 7.5 12.8 2 12C7.5 11.2 11.2 7.5 12 2Z";

export function DreamSpark({ size = 16, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={{ filter: "drop-shadow(0 0 5px color-mix(in srgb, #7FA8FF 55%, transparent))" }}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="4" y1="8" x2="17" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A9C4FF" />
          <stop offset="0.5" stopColor="#5E8BFF" />
          <stop offset="1" stopColor="#8A63FF" />
        </linearGradient>
      </defs>
      <path d={STAR} transform="translate(10 14) scale(0.72) translate(-12 -12)" fill={`url(#${id}-fill)`} />
      <path d={STAR} transform="translate(18.2 5.8) scale(0.36) translate(-12 -12)" fill="#7FA3FF" />
    </svg>
  );
}
