import type { CareerArt } from "./types";
import investmentBanking from "./investment-banking.json";
import registeredNurse from "./registered-nurse.json";
import aviationMaintenance from "./aviation-maintenance-technician.json";

export type { CareerArt, CastMember, CharacterSlot, FocalPoint, SceneLocation } from "./types";

// Every career's art manifest. Adding a career: drop its JSON here (made by
// `node scripts/play-art/new-career.mjs <career>` and filled by the
// pipeline) and add it to this list. Nothing else in the engine changes.
export const CAREER_ART: CareerArt[] = [investmentBanking as CareerArt, registeredNurse as CareerArt, aviationMaintenance as CareerArt];

/** The full-figure standard's default slot: head-to-hips across the frame,
 *  face in the upper third, legs behind the dialogue box. Every sprite made
 *  to the master prompt fits it without tuning. */
export const STANDARD_SLOT = { x: 0.5, baselineY: 1.78, heightFrac: 1.75 } as const;
