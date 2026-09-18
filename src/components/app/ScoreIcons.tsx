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

export function ScoreBolt({ size = 16, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="6" y1="3" x2="18" y2="21" gradientUnits="userSpaceOnUse">
          {/* light, electric: pale sky at the top through brand-400 to a
             soft violet, never the deep brand blue (direct feedback) */}
          <stop offset="0" stopColor="#E3EDFF" />
          <stop offset="0.45" stopColor="#7FA8FF" />
          <stop offset="1" stopColor="#9D86FF" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="9" y1="3" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M13.6 2.5 5.2 13.4c-.4.5 0 1.2.6 1.2h4.9l-1.6 6.3c-.2.7.7 1.1 1.1.5l8.6-11.2c.4-.5 0-1.2-.6-1.2h-4.9l1.5-6c.2-.7-.7-1.1-1.2-.5Z" fill={`url(#${id}-fill)`} />
      <path d="M13 4.2 7.6 11.4c.7-.2 1.5-.3 2.3-.3l2.4-6.5c.1-.2.4-.5.7-.4Z" fill={`url(#${id}-shine)`} />
    </svg>
  );
}
