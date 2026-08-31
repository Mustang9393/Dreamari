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

export type LocationId =
  | "cobalt-trading-floor-sunset"
  | "cobalt-internal-boardroom-sunset"
  | "cobalt-trading-floor-night"
  | "cobalt-cafe-lounge-sunset"
  | "cobalt-client-boardroom-sunset"
  | "cobalt-elevator-hallway-sunset"
  // The one genuinely bespoke scene in the handoff, not a reusable generic
  // room: a clean plate of L1's reception with the ORIGINAL two-character
  // slot layout from its own scene.json (christina left at 0.30/0.88,
  // jordan right at 0.72/0.92). Everywhere else uses the six-location
  // library; this exists because this exact background-plus-slots pair was
  // supplied for this exact scene, so there is no reason to substitute a
  // generic room for it.
  | "l1-reception";

// baselineY is a fraction of the scene's height, measured from the top --
// 0.99 puts the sprite's own bottom edge just shy of the scene's bottom
// edge. heightFrac is the sprite's rendered height as that same fraction.
// Tuned so the full sprite sits in frame, centered, feet near the bottom
// with headroom above.
type CharacterSlot = { x: number; baselineY: number; heightFrac: number; centered?: boolean };

type LocationArt = {
  src: string;
  alt: string;
  /** Fraction of the image width/height, left-to-right and top-to-bottom. */
  focal: { x: number; y: number };
  mobileFocal: { x: number; y: number };
  /** Where a single speaking character stands, as a fraction of the frame.
   *  On the two boardrooms this is deliberately the one strip of open floor
   *  behind the last chair, by the window -- not inside the seating, which
   *  the handoff's foreground-mask requirement exists to protect against and
   *  which no mask asset exists to occlude correctly yet. */
  characterAnchor?: CharacterSlot;
  /** Two or more characters on screen together, in named story order (not by
   *  screen position) -- used only where the handoff supplied an actual
   *  multi-character slot layout (today, just l1-reception). */
  characterAnchors?: CharacterSlot[];
};

const L = "/images/play/ib/locations";

export const LOCATION_ART: Record<LocationId, LocationArt> = {
  "cobalt-trading-floor-sunset": {
    src: `${L}/trading-floor-sunset.webp`,
    alt: "Cobalt Capital's trading floor at sunset, rows of desks and monitors against the skyline.",
    focal: { x: 0.58, y: 0.43 },
    mobileFocal: { x: 0.57, y: 0.36 },
    characterAnchor: { x: 0.74, baselineY: 0.99, heightFrac: 0.9 },
  },
  "cobalt-internal-boardroom-sunset": {
    src: `${L}/internal-boardroom-sunset.webp`,
    alt: "An internal boardroom at Cobalt Capital, empty chairs around the table at sunset.",
    focal: { x: 0.61, y: 0.4 },
    mobileFocal: { x: 0.66, y: 0.36 },
    // Centered and full scale like every other location -- off-to-the-side
    // by the window read as a scaling/positioning bug, not a deliberate
    // sense of distance. Christina's treatment is the reference for every
    // scene shaped like this one.
    characterAnchor: { x: 0.91, baselineY: 0.99, heightFrac: 0.9 },
  },
  "cobalt-trading-floor-night": {
    src: `${L}/trading-floor-night.webp`,
    alt: "Cobalt Capital's trading floor at night, monitors lit against the city.",
    focal: { x: 0.58, y: 0.45 },
    mobileFocal: { x: 0.6, y: 0.37 },
    characterAnchor: { x: 0.75, baselineY: 0.99, heightFrac: 0.9 },
  },
  "cobalt-cafe-lounge-sunset": {
    src: `${L}/cafe-lounge-sunset.webp`,
    alt: "A cafe lounge near the office, quiet seating at sunset.",
    focal: { x: 0.66, y: 0.42 },
    mobileFocal: { x: 0.69, y: 0.36 },
    characterAnchor: { x: 0.76, baselineY: 0.99, heightFrac: 0.9 },
  },
  "cobalt-client-boardroom-sunset": {
    src: `${L}/client-boardroom-sunset.webp`,
    alt: "A formal client boardroom with the Cobalt Capital logo on screen, city view at sunset.",
    focal: { x: 0.62, y: 0.4 },
    mobileFocal: { x: 0.67, y: 0.35 },
    // Centered and full scale like every other location -- see the note on
    // cobalt-internal-boardroom-sunset above.
    characterAnchor: { x: 0.9, baselineY: 0.99, heightFrac: 0.9 },
  },
  "cobalt-elevator-hallway-sunset": {
    src: `${L}/elevator-hallway-sunset.webp`,
    alt: "The elevator hallway outside Cobalt Capital's office, city light at sunset.",
    focal: { x: 0.55, y: 0.45 },
    mobileFocal: { x: 0.53, y: 0.4 },
    characterAnchor: { x: 0.4, baselineY: 0.99, heightFrac: 0.9 },
  },
  "l1-reception": {
    src: `${L}/reception.webp`,
    alt: "Cobalt Capital's reception, trading floor and city skyline behind.",
    // scene.json's own focal point for this exact plate.
    focal: { x: 0.52, y: 0.42 },
    mobileFocal: { x: 0.52, y: 0.34 },
    // Full figures, feet near the bottom edge, headroom above -- fills the
    // frame cinematically without cropping the head or feet off-screen.
    characterAnchors: [
      { x: 0.38, baselineY: 0.99, heightFrac: 0.88, centered: false },
      { x: 0.64, baselineY: 0.99, heightFrac: 0.9, centered: false },
    ],
    // The single-character anchor used when only one of them is present
    // (L1-15, Christina alone): her own slot, fully in frame.
    characterAnchor: { x: 0.5, baselineY: 0.99, heightFrac: 0.88 },
  },
};

// Per-beat routing. Every beat is listed, including ones with their own hero
// illustration, and ones the player actively answers (choice, rank, pick, and
// the rest) -- assigning them a location is inert for both today (hero art
// always wins; SimulationPlayer routes every non-card, non-review beat
// straight past this table to the plain ambient backdrop, on purpose, so a
// scored question is never competing with a room and a standing character for
// attention) but keeps the map complete if either rule ever loosens. Review
// beats (L1-16, L2-25, L3-28) are deliberately absent for a different reason:
// the final-review wait reads better as the abstract, liminal AmbientBackdrop
// than as any one room.
//
// Routed from the handoff's background-library.json where a beat is listed
// there; filled in by narrative judgment elsewhere, using its own tie-break
// rule for beats it lists under more than one room: internal prep/review ->
// internal boardroom, formal client pitch/deal decision -> client boardroom,
// public working-floor moment -> trading floor, private transition -> hallway.
export const BEAT_LOCATION: Record<string, LocationId> = {
  // Level 1 -- Intern (ids from the Aug 31 handoff's restructured sheet).
  // L1-01..04 are the arrival story/teach/check screens -- no castMember/
  // speaker resolves to a character on any of them, so the reception shows
  // as an empty room, not a starfield. Neither character has entered the
  // story yet; the room itself already has.
  "L1-01": "l1-reception",
  "L1-02": "l1-reception",
  "L1-03": "l1-reception",
  "L1-03b": "l1-reception",
  "L1-04": "l1-reception",
  // VISUAL CONGRUENCE (direct feedback): the whole Day-1-morning run stays
  // in the daylight reception -- the sunset floor sandwiched between two
  // daylight screens read as day -> evening -> day in five slides. Time of
  // day only ever moves FORWARD through the level from here.
  "L1-05": "l1-reception",
  "L1-06": "l1-reception",
  "L1-07": "l1-reception",
  // Day 1 at reception, with both characters in the supplied two-slot plate.
  "L1-08": "l1-reception",
  "L1-09": "l1-reception",
  "L1-10": "l1-reception",
  // Christina's teaching stretch keeps the cafe, same room the old teach/
  // match/rapid run used.
  "L1-11": "cobalt-cafe-lounge-sunset",
  "L1-12": "cobalt-cafe-lounge-sunset",
  "L1-13": "cobalt-cafe-lounge-sunset",
  // L1-14 has its own hero art (the laptop POV shot).
  "L1-15": "cobalt-trading-floor-sunset",
  "L1-16": "cobalt-trading-floor-sunset",
  "L1-17": "cobalt-trading-floor-sunset",
  "L1-18": "cobalt-trading-floor-sunset",
  "L1-19": "cobalt-trading-floor-sunset",
  "L1-20": "cobalt-cafe-lounge-sunset",
  // L1-21 and L1-22 carry their own hero art.
  "L1-23": "cobalt-trading-floor-night",
  "L1-24": "l1-reception",

  // Level 2 -- Analyst
  "L2-01": "cobalt-elevator-hallway-sunset",
  "L2-02": "cobalt-trading-floor-sunset",
  "L2-03": "cobalt-trading-floor-sunset",
  "L2-04": "cobalt-trading-floor-sunset",
  "L2-05": "cobalt-trading-floor-sunset",
  "L2-06": "cobalt-trading-floor-sunset",
  "L2-07": "cobalt-trading-floor-sunset",
  "L2-08": "cobalt-internal-boardroom-sunset",
  "L2-09": "cobalt-trading-floor-sunset",
  "L2-10": "cobalt-internal-boardroom-sunset",
  "L2-11": "cobalt-internal-boardroom-sunset",
  "L2-12": "cobalt-trading-floor-night",
  "L2-13": "cobalt-trading-floor-night",
  "L2-14": "cobalt-trading-floor-night",
  "L2-15": "cobalt-trading-floor-night",
  "L2-16": "cobalt-trading-floor-night",
  "L2-17": "cobalt-trading-floor-sunset",
  "L2-18": "cobalt-trading-floor-sunset",
  "L2-19": "cobalt-client-boardroom-sunset",
  "L2-20": "cobalt-trading-floor-sunset",
  "L2-21": "cobalt-internal-boardroom-sunset",
  "L2-22": "cobalt-trading-floor-night",
  "L2-23": "cobalt-internal-boardroom-sunset",
  "L2-24": "cobalt-elevator-hallway-sunset",

  // Level 3 -- Associate
  "L3-01": "cobalt-trading-floor-sunset",
  "L3-02": "cobalt-trading-floor-sunset",
  "L3-03": "cobalt-trading-floor-sunset",
  "L3-04": "cobalt-trading-floor-sunset",
  "L3-05": "cobalt-trading-floor-sunset",
  "L3-06": "cobalt-trading-floor-sunset",
  "L3-07": "cobalt-internal-boardroom-sunset",
  "L3-08": "cobalt-elevator-hallway-sunset",
  "L3-09": "cobalt-internal-boardroom-sunset",
  "L3-10": "cobalt-trading-floor-night",
  "L3-11": "cobalt-trading-floor-night",
  "L3-12": "cobalt-trading-floor-night",
  "L3-13": "cobalt-trading-floor-night",
  "L3-14": "cobalt-trading-floor-night",
  "L3-15": "cobalt-internal-boardroom-sunset",
  "L3-16": "cobalt-internal-boardroom-sunset",
  "L3-17": "cobalt-internal-boardroom-sunset",
  "L3-18": "cobalt-client-boardroom-sunset",
  "L3-19": "cobalt-elevator-hallway-sunset",
  "L3-20": "cobalt-elevator-hallway-sunset",
  "L3-21": "cobalt-trading-floor-sunset",
  "L3-22": "cobalt-client-boardroom-sunset",
  "L3-23": "cobalt-trading-floor-sunset",
  "L3-24": "cobalt-trading-floor-sunset",
  "L3-25": "cobalt-trading-floor-sunset",
  "L3-26": "cobalt-trading-floor-sunset",
  "L3-27": "cobalt-trading-floor-sunset",
};

export function locationFor(beatId: string): LocationArt | undefined {
  const id = BEAT_LOCATION[beatId];
  return id ? LOCATION_ART[id] : undefined;
}
