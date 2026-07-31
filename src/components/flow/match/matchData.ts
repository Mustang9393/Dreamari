import type { MatchCardKey, MatchPath } from "./types";

// Base color verified from the updated Figma "Match Card" component (node 616:xxxxx
// per type, same canvas as the screens in node 630:38908) — Figma's own gradient
// inserts a darkened-tint middle stop that reads as muddy rather than a clean glow, so
// only its top (near-black) and bottom (saturated hue) stops are used; see types.ts.
// Tags/emoji copied exactly. Replit's five real card types don't share the same names
// as Figma's, so each is paired with the Figma type it's closest to in meaning
// (Workstyle -> "Work Style", Future Fit -> "Pathway"). "Earning Potential" has no good
// thematic match (nearest unused type, "Daily Work", has Build/Test/Improve tags that
// don't fit a pay-range card), so its tags are left empty rather than showing a
// mismatched set.
export const MATCH_CARD_META: Record<MatchCardKey, { label: string; emoji: string; tags: string[]; gradient: readonly [string, string] }> = {
  classes: { label: "Classes", emoji: "🏫", tags: ["Algorithms", "Data", "Projects"], gradient: ["rgb(2, 4, 9)", "rgb(234, 68, 89)"] },
  workstyle: { label: "Workstyle", emoji: "👥", tags: ["Focused", "Team-based", "Flexible"], gradient: ["rgb(2, 4, 9)", "rgb(255, 246, 160)"] },
  skills: { label: "Skills", emoji: "⚙️", tags: ["Logic", "Systems", "Communication"], gradient: ["rgb(2, 4, 9)", "rgb(10, 181, 255)"] },
  earning: { label: "Earning Potential", emoji: "💰", tags: [], gradient: ["rgb(2, 4, 9)", "rgb(154, 57, 251)"] },
  future: { label: "Future Fit", emoji: "🧭", tags: ["Explore", "Practice", "Specialize"], gradient: ["rgb(2, 4, 9)", "rgb(1, 190, 88)"] },
};

const CARD_ORDER: MatchCardKey[] = ["classes", "workstyle", "skills", "earning", "future"];

function buildPath(id: string, title: string, body: Record<MatchCardKey, string>): MatchPath {
  return {
    id,
    title,
    cards: CARD_ORDER.map((key) => ({ key, ...MATCH_CARD_META[key], body: body[key] })),
  };
}

// Copy verified live at dceeai.replit.app (Build → See Matches → Computer Science),
// word-for-word from the actual Match Experience cards — not paraphrased.
export const MATCH_PATHS: MatchPath[] = [
  buildPath("computer-science", "Computer Science", {
    classes: "You take classes like coding, databases, and algorithms. Lots of hands-on projects where you build real apps.",
    workstyle: "You spend time on a computer solving problems. Sometimes you work alone, sometimes with a team.",
    skills: "You learn to code, fix bugs, and think step-by-step. These skills help you build websites, apps, and games.",
    earning: "Pay is high. Most jobs start at $80k–$130k or more per year.",
    future: "AI will change some jobs, but skilled coders will still be needed. Good long-term choice.",
  }),
];
