// DEMO-ONLY, local only: the v3 "cinematic" lab (5 Oct 2026). The SAME
// levels as the v2 labs -- every screen, answer, score and line still comes
// from ib-level-1-v2.ts / rn-level-1-v2.ts, so the 1:1 doc parity is
// inherited, not copied -- with one presentation flag on top. Chandu, after a
// pass through Game UI Database's 139 dialogue-choice screens: "build them
// but as a v3 link in the hamburger menu instead. And keep it local for now."
// Own save slots, so a v3 run never resumes a v2 one.

import { IB_LEVEL_1_V2 } from "./ib-level-1-v2";
import { RN_LEVEL_1_V2 } from "./rn-level-1-v2";
import type { Level } from "./types";

export const IB_LEVEL_1_V3: Level = { ...IB_LEVEL_1_V2, id: "ib-l1-v3", saveSlot: 301, cinematic: true };
export const RN_LEVEL_1_V3: Level = { ...RN_LEVEL_1_V2, id: "rn-l1-v3", saveSlot: 302, cinematic: true };
