export type MatchCardKey = "classes" | "workstyle" | "skills" | "earning" | "future";

export type MatchCardMeta = {
  label: string;
  emoji: string;
  // [top, bottom] for a 2-stop gradient — near-black (dark mode) or white (light mode)
  // fading directly to the full saturated hue at the card's bottom edge. Figma's own
  // spec (node 616:xxxxx per type) inserts a third, darkened-tint stop in between, but
  // that middle color reads as a muddy, desaturated smear rather than a clean glow —
  // dropped here in favor of a straight 2-color fade, which still keeps the "solid cap
  // at the top, color revealed near the bottom" rhythm via the stop position alone.
  gradient: readonly [string, string];
};

export type MatchCardContent = MatchCardMeta & {
  key: MatchCardKey;
  body: string;
};

export type MatchPath = {
  id: string;
  title: string;
  cards: MatchCardContent[];
};

export type SwipeDirection = "like" | "pass";
