import type { CSSProperties } from "react";

// The A/B test is decided: the cinematic (boxless) treatment won and is now
// THE build flow. The variant context that let one implementation render both
// treatments is gone with the losing glass variant; only the cinematic
// entrance choreography remains.

// Staggered entrance for option rows (reference: cardCascade, 45ms per item).
export function cascade(index: number): CSSProperties {
  return {
    opacity: 0,
    animation: "card-cascade 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    animationDelay: `${0.35 + 0.045 * index}s`,
  };
}
