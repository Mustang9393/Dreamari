"use client";

import { createContext, useContext } from "react";
import type { CSSProperties } from "react";

// A/B presentation variant for the build flow, threaded through context so every
// step renders BOTH treatments from one implementation (same state, same copy,
// same inputs — presentation only):
//   A "glass"     — Figma Build Flow card structure: glass panels, in-card HUD.
//   B "cinematic" — boxless immersive treatment from the supplied BUILD FLOW.html
//                   reference: questions materialize word-by-word (ink bleed),
//                   options cascade up onto the bare space background.
export type FlowVariant = "glass" | "cinematic";

export const VariantContext = createContext<FlowVariant>("glass");

export function useVariant(): FlowVariant {
  return useContext(VariantContext);
}

// Staggered entrance for option rows in the cinematic variant (reference:
// cardCascade, 45ms per item). Returns {} in glass so callers can spread it
// unconditionally.
export function cascade(variant: FlowVariant, index: number): CSSProperties {
  if (variant !== "cinematic") return {};
  return {
    opacity: 0,
    animation: "card-cascade 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    animationDelay: `${0.35 + 0.045 * index}s`,
  };
}
