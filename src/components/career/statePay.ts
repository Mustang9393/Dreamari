// Pay by state from real OEWS figures (4 Oct 2026). The Career Detail page's
// "Your states" are the states the student picked in Build (Chandu: "home
// state on career page should show whatever people pick from build; if they
// haven't, for the demo, show New Jersey"); "Best states" are the three that
// pay most; the map gets every state BLS published, so no state's figure is
// made up any more (the map used to fill the rest from a seeded spread).
// Careers with no BLS state data keep their profile's own block.

import type { PayByState } from "./profiles";
import { STATE_WAGES } from "./stateWages";

// DEMO-ONLY: the demo student's state (Westfield High School, NJ, the
// pilot) when Build has no state yet. Production uses the student's record.
export const DEMO_HOME_STATE = "New Jersey";

export type StatePay = PayByState & {
  /** every state with a published figure, for the map; absent when the career has no state data */
  all?: { state: string; pay: string }[];
};

const short = (n: number) => `$${Math.round(n / 1000)}K`;

export function statePay(slug: string, picked: string[], profile?: PayByState): StatePay | undefined {
  const wages = STATE_WAGES[slug];
  if (!wages || Object.keys(wages).length === 0) return profile;
  const mine = picked.length ? picked : [DEMO_HOME_STATE];
  const rows = Object.entries(wages).sort((a, b) => b[1] - a[1]);
  return {
    title: profile?.title ?? "Pay by state",
    yourStates: mine.filter((s) => wages[s] !== undefined).map((s) => ({ state: s, pay: short(wages[s]) })),
    best: rows.filter(([s]) => !mine.includes(s)).slice(0, 3).map(([s, v]) => ({ state: s, pay: short(v) })),
    all: rows.map(([s, v]) => ({ state: s, pay: short(v) })),
  };
}
