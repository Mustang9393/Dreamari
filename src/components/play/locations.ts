// Cobalt Capital's six recurring locations, from the production art handoff
// (Dreamari-IB-Claude-Production-Handoff-v2). These replace the plain ambient
// gradient on any beat that has no illustration of its own: instead of a
// stretch of screens fading to an abstract drifting backdrop, the player sees
// an actual room that means something -- the trading floor for ordinary work,
// the night floor for crunch, the cafe for coaching, the boardrooms for
// judgment and pitches, the hallway for arrivals and private consequence.
//
// A location is chosen ONLY when the current beat has no fresh illustration of
// its own (see SCENE_FRESH_BEATS in SimulationPlayer.tsx) -- the 21 hand-drawn
// hero scenes always win. Locations are not sticky the way hero art is: each
// beat resolves its own location directly from BEAT_LOCATION, since virtually
// every beat has one, so there is no need to carry a stale room forward.

// 29 Sept 2026: the rooms, their focal points and character slots, and the
// beat -> room routing moved out of this file into one JSON per career
// (src/components/play/art/<career>.json, schema alongside), so a new career
// is art plus data, never code. The per-location reasoning that used to sit
// here as comments now rides in each manifest's `notes` / `note` fields.
// Tune a room visually at /play-tools/scene-tuner; process new art with
// scripts/play-art.

import { CAREER_ART, type SceneLocation } from "./art";

export type LocationId = string;
export type LocationArt = SceneLocation;

export const LOCATION_ART: Record<LocationId, LocationArt> = Object.assign({}, ...CAREER_ART.map((career) => career.locations));

// Per-beat routing, merged across careers. EVERY beat gets a room, scored
// questions included (they render dimmed behind their own controls); the one
// deliberate exception is each level's terminal review beat, which reads
// better as the ambient backdrop. A beat missing from a manifest has simply
// never been assigned a room.
export const BEAT_LOCATION: Record<string, LocationId> = Object.assign({}, ...CAREER_ART.map((career) => career.beatLocations));

export function locationFor(beatId: string): LocationArt | undefined {
  const id = BEAT_LOCATION[beatId];
  return id ? LOCATION_ART[id] : undefined;
}
