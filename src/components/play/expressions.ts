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

// 29 Sept 2026: the cast (default face, tier reactions, face chip, voice
// pitch) and every sprite's measured ratio now live in each career's art
// manifest (src/components/play/art/<career>.json). scripts/play-art writes
// `portraitRatios` from the real files, so no ratio is typed by hand again.

import { CAREER_ART } from "./art";

type ExpressionSet = Partial<Record<Tier, string>>;

const CAST = Object.assign({}, ...CAREER_ART.map((career) => career.cast)) as Record<string, (typeof CAREER_ART)[number]["cast"][string]>;

export const EXPRESSION_PORTRAITS: Partial<Record<string, ExpressionSet>> = Object.fromEntries(
  Object.entries(CAST).filter(([, member]) => member.tiers).map(([name, member]) => [name, member.tiers]),
);

export function expressionFor(speaker: string | undefined, tier: Tier): string | undefined {
  if (!speaker) return undefined;
  return EXPRESSION_PORTRAITS[speaker]?.[tier];
}

/** A named expression from the art manifest's `poses` (Beat.castPose). */
export function poseFor(speaker: string | undefined, pose: string | undefined): string | undefined {
  if (!speaker || !pose) return undefined;
  return CAST[speaker]?.poses?.[pose];
}

// The face a character wears simply for being in the room, before any answer
// exists to react to -- each character's most neutral available expression.
export function defaultExpressionFor(speaker: string | undefined): string | undefined {
  if (!speaker) return undefined;
  return CAST[speaker]?.default;
}

/** Typing voice-blip pitch per speaker (500 Hz when unset). */
export const VOICE_PITCH: Record<string, number> = Object.fromEntries(
  Object.entries(CAST).filter(([, member]) => member.voicePitch).map(([name, member]) => [name, member.voicePitch as number]),
);

// Real width/height ratio of each sprite file. SceneCharacter renders sprites
// at a fixed CSS height with object-contain, and next/image derives its box
// from these, so a wrong ratio letterboxes the sprite (it reads smaller and
// higher than its slot). Measured off the files by scripts/play-art.
export const PORTRAIT_RATIO: Record<string, number> = Object.assign({}, ...CAREER_ART.map((career) => career.portraitRatios));
