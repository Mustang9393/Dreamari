import type { MatchCardKey, MatchPath } from "./types";

// Base color verified from the updated Figma "Match Card" component (node 616:xxxxx
// per type, same canvas as the screens in node 630:38908) — Figma's own gradient
// inserts a darkened-tint middle stop that reads as muddy rather than a clean glow, so
// only its top (near-black) and bottom (saturated hue) stops are used; see types.ts.
// Emoji copied exactly. The card component no longer has a tags row at all in the
// updated Figma (node 630:38953's own children are just the graphic area and the
// description box) — dropped here to match.
//
// workstyle/skills were re-tuned away from Figma's own pale pastel-yellow and bright
// cyan — both read as washed out and off-brand next to the rest of the app. Replaced
// with our own accent palette instead (see STEP_AURORA_ACCENTS in ../types.ts): amber
// #d97706 (same amber used for Future Values/Academic Journey) for workstyle, and brand
// blue #1f5ff0 (same blue as the Welcome/Congratulations bookends) for skills.
export const MATCH_CARD_META: Record<MatchCardKey, { label: string; emoji: string; gradient: readonly [string, string] }> = {
  classes: { label: "Classes", emoji: "🏫", gradient: ["rgb(2, 4, 9)", "rgb(234, 68, 89)"] },
  workstyle: { label: "Workstyle", emoji: "👥", gradient: ["rgb(2, 4, 9)", "rgb(217, 119, 6)"] },
  skills: { label: "Skills", emoji: "⚙️", gradient: ["rgb(2, 4, 9)", "rgb(31, 95, 240)"] },
  earning: { label: "Earning Potential", emoji: "💰", gradient: ["rgb(2, 4, 9)", "rgb(154, 57, 251)"] },
  future: { label: "Future Fit", emoji: "🧭", gradient: ["rgb(2, 4, 9)", "rgb(1, 190, 88)"] },
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
