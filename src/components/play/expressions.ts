import type { Tier } from "./types";

// Tier-matched reaction portraits, from the same production handoff as
// locations.ts. Only Christina and Jordan have an approved expression set --
// Marcus and Lamisa keep their single face until their own set is generated,
// per the handoff's own caution against batch-generating a cast before their
// canonical turnaround is approved.
//
// "Expression swaps occur after the player commits, before feedback text
// finishes appearing. This makes the reaction part of the consequence" --
// so these render on the verdict card, not the question. Mapped to the
// tiers actually authored (welcoming/concerned/proud; confident/focused/
// uncertain) rather than the full seven-emotion table the bible describes,
// since inventing an expression we have no art for would be worse than a
// smaller, honest set.

const E = "/images/play/ib/expressions";

type ExpressionSet = Record<Tier, string>;

export const EXPRESSION_PORTRAITS: Partial<Record<string, ExpressionSet>> = {
  Christina: {
    best: `${E}/christina-proud.webp`,
    acceptable: `${E}/christina-welcoming.webp`,
    wrong: `${E}/christina-concerned.webp`,
    risky: `${E}/christina-concerned.webp`,
    none: `${E}/christina-welcoming.webp`,
  },
  Jordan: {
    best: `${E}/jordan-confident.webp`,
    acceptable: `${E}/jordan-focused.webp`,
    wrong: `${E}/jordan-uncertain.webp`,
    risky: `${E}/jordan-uncertain.webp`,
    none: `${E}/jordan-focused.webp`,
  },
};

export function expressionFor(speaker: string | undefined, tier: Tier): string | undefined {
  if (!speaker) return undefined;
  return EXPRESSION_PORTRAITS[speaker]?.[tier];
}

// The face a character wears simply for being in the room, before any answer
// exists to react to -- welcoming and confident are each character's most
// neutral available expression, not tied to a tier.
const DEFAULT_EXPRESSION: Partial<Record<string, string>> = {
  Christina: `${E}/christina-welcoming.webp`,
  Jordan: `${E}/jordan-confident.webp`,
  // Marcus and Lamisa each shipped with exactly one approved expression in the
  // v3 handoff (assessing, composed) -- no tier set to react with yet, so they
  // stand in the room at this single expression rather than not appearing at
  // all. Extend EXPRESSION_PORTRAITS for either once more variants arrive.
  Marcus: `${E}/marcus-assessing.webp`,
  Lamisa: `${E}/lamisa-composed.webp`,
  // Level 2's Analyst onboarding carousel only -- reverted from D11's "hand
  // it to Christina" back to its own unnamed HR character, per direct
  // instruction. One expression, same as Marcus/Lamisa.
  "Cobalt HR": `${E}/cobalt-hr-welcoming.webp`,
};

export function defaultExpressionFor(speaker: string | undefined): string | undefined {
  if (!speaker) return undefined;
  return DEFAULT_EXPRESSION[speaker];
}
