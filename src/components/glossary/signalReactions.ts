import type { DreamyPose } from "./dreamyReactions";

export type SignalReaction = "curious" | "calculate" | "reassure" | "celebrate";

/** Mix the reviewed acting poses with the canonical live rig. In particular,
 * correct-answer dialogue keeps its existing character, typewriter and payoff. */
export function signalReaction(pose: DreamyPose): SignalReaction | null {
  if (["choose", "match", "sort", "recall", "curious"].includes(pose)) return "curious";
  if (pose === "calculate" || pose === "glasses") return "calculate";
  if (["retry", "nervous", "puzzle", "heart"].includes(pose)) return "reassure";
  if (pose === "mastery" || pose === "party") return "celebrate";
  return null;
}

export function signalReactionAsset(reaction: SignalReaction, sheet = true): string {
  return `/images/glossary/dreamy-signal-animated-oct15/${reaction}${sheet ? "-sheet" : "-320"}.webp`;
}
