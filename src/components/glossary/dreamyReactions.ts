import type { GlossaryQuestion } from "./data";

export type DreamyReaction = "welcome" | "explain" | "choose" | "match" | "sort" | "calculate" | "recall" | "case" | "hint" | "correct" | "retry" | "mastery";
export type DreamyPose = DreamyReaction | "happy" | "glasses" | "idea" | "curious" | "party" | "nervous" | "puzzle" | "heart";

const legacy: Partial<Record<DreamyPose, DreamyReaction>> = {
  happy: "welcome", glasses: "calculate", idea: "hint", curious: "choose",
  party: "mastery", nervous: "retry", puzzle: "retry", heart: "retry",
};

export function dreamyReaction(pose: DreamyPose): DreamyReaction {
  return legacy[pose] ?? pose as DreamyReaction;
}

export function dreamyReactionAsset(pose: DreamyPose, sheet = false): string {
  return `/images/glossary/dreamy-drift-animated-oct15-v2/drift/${dreamyReaction(pose)}${sheet ? "-sheet" : "-256"}.webp`;
}

// Only presentation is classified here. Content, grading and step order
// remain owned by the existing question renderers.
export function questionReaction(question: GlossaryQuestion, numericStep = false): DreamyReaction {
  if (numericStep || question.kind === "profitBuilder") return "calculate";
  if (question.kind === "matchUp") return "match";
  if (question.kind === "sortBuckets") return "sort";
  if (question.kind === "typeTerm") return "recall";
  if (question.kind === "chain") return "case";
  if (question.kind === "choice") {
    if (question.visual?.kind === "profit" || ["figures", "shares", "split"].includes(question.scene?.kind ?? "")) return "calculate";
    if (question.type === "Reverse Recall" || question.sentence) return "recall";
    if (question.scene?.kind === "story") return "case";
  }
  return "choose";
}

/** Which way each pose is drawn looking (props and pupils), so a screen can
 *  mirror him to face its content (15 Oct 2026, Chandu: "always FACE the
 *  content"). "front" never needs a flip. */
export type DreamyFacing = "left" | "right" | "front";
export const DREAMY_FACING: Record<DreamyReaction, DreamyFacing> = {
  welcome: "front", explain: "front", choose: "right", match: "right", sort: "left", calculate: "right",
  recall: "left", case: "front", hint: "right", correct: "right", retry: "front", mastery: "front",
};
