import { TIER_SCORE, type BandName, type Ending, type Tier } from "./types";

// The scoring model from the handoff, one system for all 25 career simulations.
// Ten scored beats per level: ten Best answers take a perfect run from 50 to
// exactly 100, and the progress bar moves a clean 10% per beat. Do not invent
// new scoring -- every career copies this.

export const START_REPUTATION = 50;
export const SCORED_BEATS = 10;
export const ADVANCE_AT = 85;

// Ranges are spelled out rather than derived from the neighbouring floor: the
// arithmetic version read "At Risk 0 to 84" on the intro card, and these four
// numbers are the ones printed on the Scoring Model tab anyway.
export const BANDS: { min: number; max: number; name: BandName; note: string }[] = [
  { min: 85, max: 100, name: "Trusted", note: "Promotion" },
  { min: 60, max: 84, name: "Respected", note: "Repeat the level" },
  { min: 40, max: 59, name: "Cautious", note: "Repeat the level" },
  { min: 0, max: 39, name: "At Risk", note: "Well below the line" },
];

export const BAND_COLOR: Record<BandName, string> = {
  Trusted: "var(--color-feedback-success)",
  Respected: "var(--world-business-money-office)",
  Cautious: "var(--world-building-construction)",
  "At Risk": "var(--destructive)",
};

/** Reputation floors at 0 and ceilings at 100. */
export function applyScore(reputation: number, tier: Tier): number {
  return clamp(reputation + TIER_SCORE[tier]);
}

export function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function bandFor(reputation: number): BandName {
  return (BANDS.find((band) => reputation >= band.min) ?? BANDS[BANDS.length - 1]).name;
}

export function endingFor(endings: Ending[], reputation: number): Ending {
  const sorted = [...endings].sort((a, b) => b.min - a.min);
  return sorted.find((ending) => reputation >= ending.min) ?? sorted[sorted.length - 1];
}

/** Any beat made of sub-items passes at three quarters of them, rounded up:
 *  four items pass at three, five at four, six at five. One rule for all. */
export function passThreshold(items: number): number {
  return Math.ceil(items * 0.75);
}

export const TIER_COLOR: Record<Tier, string> = {
  best: "var(--color-feedback-success)",
  acceptable: "var(--color-feedback-success)",
  wrong: "var(--world-building-construction)",
  risky: "var(--destructive)",
  none: "var(--muted-foreground)",
};
