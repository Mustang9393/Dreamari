"use client";

// A generic progress ring (25 Sept 2026). Used to be the home of a larger
// grade-by-season My Plan map built on the student app's own My Plan steps
// (GRADE_PLANS/studentSignals.ts); removed the same day, along with that
// whole bridge, in the "take out all the additional stuff we did for
// parity with dreamari's plan... match the replit" content reversion --
// the Milestone Tracker's season tiles are now computed straight from the
// reference's own curriculum (counselorCurriculum.ts). `Ring` is pure
// presentation (a percentage in, an SVG donut out) and had no bridge
// dependency of its own, so it stays as the tracker's ring visual.

import { PRIMARY } from "../palette";

export function Ring({ pct, size = 38, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="flex-none">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PRIMARY} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(c * Math.max(0, Math.min(100, pct))) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}
