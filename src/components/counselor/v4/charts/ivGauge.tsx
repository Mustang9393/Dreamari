"use client";

// The Readiness indicator dial, restored as it was in 9d152836. Chandu,
// 10 Oct 2026: "why did you remove the whole row that was there above the
// gaps row in readiness?" (his "I dont want those cards with numbers" was
// about the Readiness by Grade grid cards, not this row).

import type { ReactNode } from "react";
import { useArrived } from "./insightViz";
import "./ivGauge.css";

const TICKS = 40;
const SWEEP = 270;

/** A 270 degree dial of 40 ticks lit to `value` (0-100), the share in the
 *  middle. Each tick is 2.5 points, so the lit count is honest. */
export function SegmentGauge({ value, size = 92, active = false, children }: { value: number; size?: number; active?: boolean; children?: ReactNode }) {
  const { on, reduce } = useArrived();
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * TICKS);
  const c = size / 2;
  const r1 = size / 2 - 3;
  const r0 = r1 - size * 0.11;
  return (
    <span className={`v4-iv-gauge ${active ? "is-active" : ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {Array.from({ length: TICKS }, (_, i) => {
          const a = ((135 + (i * SWEEP) / (TICKS - 1)) * Math.PI) / 180;
          const isLit = on && i < lit;
          // the lit run deepens toward its end: pale at the start, full blue at the share
          const mix = lit > 1 ? Math.round(42 + (58 * i) / (lit - 1)) : 100;
          return (
            <line key={i} x1={c + r0 * Math.cos(a)} y1={c + r0 * Math.sin(a)} x2={c + r1 * Math.cos(a)} y2={c + r1 * Math.sin(a)}
              strokeWidth={size > 80 ? 3 : 2.5} strokeLinecap="round"
              style={{ stroke: isLit ? `color-mix(in srgb, var(--primary) ${mix}%, var(--v4-ig-tint))` : "var(--v4-ig-off)", transitionDelay: reduce ? "0ms" : `${i * 14}ms` }} />
          );
        })}
      </svg>
      <span className="v4-iv-gauge-center">{children}</span>
    </span>
  );
}
