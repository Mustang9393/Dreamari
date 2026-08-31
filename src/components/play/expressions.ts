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
const RNE = "/images/play/rn/expressions";

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
  // The Registered Nurse cast, chroma-keyed from the RN_Game_Asset_Pack's
  // green-screen masters (generated to docs/handoff/sprite-master-prompt.md).
  Rosa: {
    best: `${RNE}/rosa-proud.webp`,
    acceptable: `${RNE}/rosa-welcoming.webp`,
    wrong: `${RNE}/rosa-concerned.webp`,
    risky: `${RNE}/rosa-concerned.webp`,
    none: `${RNE}/rosa-welcoming.webp`,
  },
  Denise: {
    best: `${RNE}/denise-composed.webp`,
    acceptable: `${RNE}/denise-composed.webp`,
    wrong: `${RNE}/denise-concerned.webp`,
    risky: `${RNE}/denise-concerned.webp`,
    none: `${RNE}/denise-assessing.webp`,
  },
  Tyler: {
    best: `${RNE}/tyler-confident.webp`,
    acceptable: `${RNE}/tyler-focused.webp`,
    wrong: `${RNE}/tyler-uncertain.webp`,
    risky: `${RNE}/tyler-uncertain.webp`,
    none: `${RNE}/tyler-focused.webp`,
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
  Rosa: `${RNE}/rosa-welcoming.webp`,
  Denise: `${RNE}/denise-assessing.webp`,
  Tyler: `${RNE}/tyler-confident.webp`,
  Yvonne: `${RNE}/yvonne-composed.webp`,
  // Level 2's Analyst onboarding carousel only -- reverted from D11's "hand
  // it to Christina" back to its own unnamed HR character, per direct
  // instruction. One expression, same as Marcus/Lamisa.
  "Cobalt HR": `${E}/cobalt-hr-welcoming.webp`,
};

export function defaultExpressionFor(speaker: string | undefined): string | undefined {
  if (!speaker) return undefined;
  return DEFAULT_EXPRESSION[speaker];
}

// Real width/height ratio of each portrait file. SceneCharacter renders these
// at a fixed CSS height with `object-contain`, and next/image derives its
// fitting box from the width/height props rather than the decoded pixels --
// a mismatched ratio there (a generic guess) doesn't crop anything, but it
// does letterbox: contain shrinks to fit the WRONG box, leaving transparent
// space above or below the actual art and pushing the visible character
// noticeably smaller/higher than the assigned height implies. Christina's
// welcoming pose is a real outlier (0.73 vs ~0.49-0.61 for everyone else's
// upright poses) because it has an arm extended out to the side, not a
// processing error -- measured directly off each file, not guessed.
export const PORTRAIT_RATIO: Record<string, number> = {
  [`${E}/christina-concerned.webp`]: 0.4856,
  [`${E}/christina-proud.webp`]: 0.4933,
  [`${E}/christina-welcoming.webp`]: 0.7283,
  [`${E}/cobalt-hr-welcoming.webp`]: 0.5578,
  [`${E}/jordan-confident.webp`]: 0.5144,
  [`${E}/jordan-focused.webp`]: 0.61,
  [`${E}/jordan-uncertain.webp`]: 0.5083,
  [`${E}/lamisa-composed.webp`]: 0.5128,
  [`${E}/marcus-assessing.webp`]: 0.4978,
  // The RN pack's sprites all share the master prompt's 1024x2048 canvas.
  [`${RNE}/rosa-welcoming.webp`]: 0.5,
  [`${RNE}/rosa-proud.webp`]: 0.5,
  [`${RNE}/rosa-concerned.webp`]: 0.5,
  [`${RNE}/denise-composed.webp`]: 0.5,
  [`${RNE}/denise-assessing.webp`]: 0.5,
  [`${RNE}/denise-concerned.webp`]: 0.5,
  [`${RNE}/tyler-confident.webp`]: 0.5,
  [`${RNE}/tyler-focused.webp`]: 0.5,
  [`${RNE}/tyler-uncertain.webp`]: 0.5,
  [`${RNE}/yvonne-composed.webp`]: 0.5,
};
