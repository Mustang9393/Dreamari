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
  | "l1-reception"
  // The exterior establishing shot supplied 20 Sept for the level's opening
  // beat (L1-01) -- the one time the player sees the building from the
  // street before every other scene is interior.
  | "cobalt-exterior-sunset"
  // Riverbend Medical Center -- the Registered Nurse simulation's six-room
  // library. The lobby/station/staff-room plates are the asset pack's
  // people-free daytime masters, so the chroma-keyed cast sprites stand in
  // them cleanly.
  | "riverbend-lobby"
  | "riverbend-station"
  | "riverbend-patient-room"
  | "riverbend-corridor"
  | "riverbend-staff-room"
  | "riverbend-ward-night";

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
const RN = "/images/play/rn/locations";

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
  "cobalt-exterior-sunset": {
    src: `${L}/exterior-sunset.webp`,
    alt: "Cobalt Capital's tower entrance at sunset, the lobby glowing behind its glass facade.",
    focal: { x: 0.62, y: 0.55 },
    mobileFocal: { x: 0.6, y: 0.5 },
    // No cast member ever appears on L1-01 (Narrator, no castMember) -- kept
    // for consistency with every other location, never exercised.
    characterAnchor: { x: 0.32, baselineY: 0.99, heightFrac: 0.85 },
  },
  // The Riverbend anchors run FAR past full height (1.75) on purpose. The IB
  // cast's cutouts are WAIST-UP crops (Christina head-to-hips fills her whole
  // canvas), while the RN pack's are full head-to-toe figures -- so at equal
  // rendered heights Rosa's face was half the size of Christina's and read as
  // "small scale" (direct feedback: match how much body IB shows, cropping
  // lower body is fine). 1.75x scene height puts head-to-hips across the
  // frame exactly like the IB treatment: face in the upper third, waist at
  // the bottom edge, legs cropped behind the dialogue box. baselineY =
  // heightFrac + 0.03 leaves the cutout's own transparent top margin just
  // above the frame so no head ever crops. Verified mobile/tablet/desktop.
  "riverbend-lobby": {
    src: `${RN}/lobby.jpg`,
    alt: "Riverbend Medical Center's main lobby, morning light across the marble floor.",
    focal: { x: 0.45, y: 0.45 },
    mobileFocal: { x: 0.4, y: 0.4 },
    characterAnchor: { x: 0.62, baselineY: 1.78, heightFrac: 1.75 },
  },
  "riverbend-station": {
    src: `${RN}/station.jpg`,
    alt: "The Four West nurses' station, monitors lit, the corridor stretching away.",
    focal: { x: 0.42, y: 0.45 },
    mobileFocal: { x: 0.38, y: 0.42 },
    characterAnchor: { x: 0.68, baselineY: 1.78, heightFrac: 1.75 },
  },
  "riverbend-patient-room": {
    src: `${RN}/patient-room.jpg`,
    alt: "A patient room on Four West, monitors beside the bed, the city through the window.",
    focal: { x: 0.6, y: 0.5 },
    mobileFocal: { x: 0.65, y: 0.45 },
    // The open floor left of the bed -- never over the bed itself.
    characterAnchor: { x: 0.24, baselineY: 1.78, heightFrac: 1.75 },
  },
  "riverbend-corridor": {
    src: `${RN}/corridor.jpg`,
    alt: "The Four West corridor, numbered patient doors and warm light down its length.",
    focal: { x: 0.5, y: 0.45 },
    mobileFocal: { x: 0.45, y: 0.42 },
    characterAnchor: { x: 0.55, baselineY: 1.78, heightFrac: 1.75 },
  },
  "riverbend-staff-room": {
    src: `${RN}/staff-room.jpg`,
    alt: "The staff room at Riverbend, coffee shelves and the city beyond the glass.",
    focal: { x: 0.5, y: 0.45 },
    mobileFocal: { x: 0.45, y: 0.42 },
    characterAnchor: { x: 0.64, baselineY: 1.78, heightFrac: 1.75 },
  },
  "riverbend-ward-night": {
    src: `${RN}/ward-night.jpg`,
    alt: "The ward at night, monitors glowing against the city lights.",
    focal: { x: 0.4, y: 0.45 },
    mobileFocal: { x: 0.35, y: 0.42 },
    // The clear aisle right of the bed and cart.
    characterAnchor: { x: 0.72, baselineY: 1.78, heightFrac: 1.75 },
  },
};

// Per-beat routing. EVERY beat gets an entry here, including a beat the
// player is actively answering (choice, rank, pick, and the rest) and one
// that also owns its own hero illustration (`beat.art` always wins while it's
// fresh -- see sceneFor in SimulationPlayer.tsx -- so the location entry is
// the fallback once that picture goes stale, not dead weight). A room behind
// an interactive beat renders dimmed (blur + darken, SimulationPlayer's
// `dimmed`), never full brightness, so it reads as a real place without
// competing with the question on top of it. Confirmed by omission, not
// assertion: a beat id missing from this table is a beat that has genuinely
// never been assigned a room, not a kind the engine skips -- audit against
// the level file's own beat list if one looks thin. The one deliberate
// exception is the terminal review beat of each level (see each level's own
// list below): the final-review wait reads better as the abstract, liminal
// AmbientBackdrop than as any one room.
//
// Routed from the handoff's background-library.json where a beat is listed
// there; filled in by narrative judgment elsewhere, using its own tie-break
// rule for beats it lists under more than one room: internal prep/review ->
// internal boardroom, formal client pitch/deal decision -> client boardroom,
// public working-floor moment -> trading floor, private transition -> hallway.
export const BEAT_LOCATION: Record<string, LocationId> = {
  // Level 1 -- Intern (20 Sept rebuild, "Level 1 Intern" tab -- three-act
  // structure, ids L1-01..L1-36). EVERY beat gets a room, scored questions
  // included -- they render dimmed behind their own controls (see the note
  // above), never the bare AmbientBackdrop. Only L1-36 (the Final Review) is
  // deliberately absent, same as every other level's terminal review beat.

  // ---- Act 1: Learn the Game ----
  // L1-01 alone gets the new exterior establishing shot (20 Sept handoff) --
  // the one street-level view of Cobalt Capital, before the level cuts
  // inside for every following scene.
  "L1-01": "cobalt-exterior-sunset",
  // L1-02..11 are the arrival/teach/meet-Christina-and-Jordan run -- no
  // location change reads as "the story hasn't left reception yet" (L1-10's
  // own line: "Christina meets you at reception").
  "L1-02": "l1-reception",
  "L1-03": "l1-reception",
  "L1-04": "l1-reception",
  "L1-05": "l1-reception",
  "L1-06": "l1-reception",
  "L1-07": "l1-reception",
  "L1-08": "l1-reception",
  "L1-09": "l1-reception",
  "L1-10": "l1-reception",
  "L1-11": "l1-reception",
  // Christina's language lesson moves to the cafe, same room the teaching
  // stretch has always used.
  "L1-13": "cobalt-cafe-lounge-sunset",
  "L1-14": "cobalt-cafe-lounge-sunset",
  "L1-15": "cobalt-cafe-lounge-sunset",
  "L1-16": "cobalt-cafe-lounge-sunset",
  // Act 1 completion moment -- closes out in the same room its own beats did.
  "L1-ACT1": "cobalt-cafe-lounge-sunset",

  // ---- Act 2: Prove You're Client-Ready ----
  "L1-17": "cobalt-trading-floor-sunset",
  "L1-18": "cobalt-trading-floor-sunset",
  "L1-19": "cobalt-trading-floor-sunset",
  "L1-20": "cobalt-trading-floor-sunset",
  // Meeting Marcus (VP) and reviewing the deal summary with him and
  // Christina both read as the internal boardroom, not the open floor.
  "L1-21": "cobalt-internal-boardroom-sunset",
  "L1-22": "cobalt-internal-boardroom-sunset",
  "L1-23": "cobalt-internal-boardroom-sunset",
  "L1-24": "cobalt-internal-boardroom-sunset",
  // The Boss Moment (Marcus's deal email) plays out back on the open floor,
  // in front of the whole team -- the checkpoint that follows closes there.
  "L1-25": "cobalt-trading-floor-sunset",
  "L1-CHECK": "cobalt-trading-floor-sunset",

  // ---- Act 3: Survive the Internship ----
  "L1-26": "cobalt-trading-floor-sunset",
  // L1-27 and L1-29 carry their own hero art (l1-12/l1-13.webp) -- these
  // entries are the fallback once that picture goes stale, same pattern as
  // every art-owning beat in Level 2/3 below.
  "L1-27": "cobalt-trading-floor-sunset",
  "L1-28": "cobalt-trading-floor-sunset",
  "L1-29": "cobalt-trading-floor-sunset",
  "L1-30": "cobalt-trading-floor-sunset",
  // 6 PM onward is explicitly night (mood: "night" on the beats
  // themselves) -- the floor at night carries the rest of Act 3.
  "L1-31": "cobalt-trading-floor-night",
  "L1-32": "cobalt-trading-floor-night",
  "L1-33": "cobalt-trading-floor-night",
  "L1-34": "cobalt-trading-floor-night",
  // L1-35 closes the level back at reception, full circle with L1-02.
  "L1-35": "l1-reception",
  // L1-36 is the Final Review -- deliberately absent (see the note above).

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

  // Registered Nurse, Level 1 (ids RN1-xx so they can never collide with
  // the IB level's L1-xx keys in this shared map). The Day-1 morning run
  // holds one room before moving forward through the day -- the same
  // visual-congruence rule the IB opening follows.
  "RN1-01": "riverbend-corridor",
  "RN1-02": "riverbend-corridor",
  "RN1-03": "riverbend-corridor",
  "RN1-04": "riverbend-corridor",
  "RN1-04b": "riverbend-corridor",
  "RN1-05": "riverbend-corridor",
  "RN1-06": "riverbend-station",
  "RN1-07": "riverbend-station",
  "RN1-08": "riverbend-station",
  "RN1-09": "riverbend-station",
  "RN1-10": "riverbend-station",
  "RN1-11": "riverbend-station",
  "RN1-12": "riverbend-staff-room",
  "RN1-13": "riverbend-staff-room",
  "RN1-14": "riverbend-staff-room",
  "RN1-15": "riverbend-corridor",
  "RN1-16": "riverbend-station",
  "RN1-17": "riverbend-station",
  "RN1-18": "riverbend-station",
  "RN1-19": "riverbend-station",
  "RN1-20": "riverbend-station",
  "RN1-21": "riverbend-station",
  "RN1-22": "riverbend-station",
  "RN1-23": "riverbend-patient-room",
  "RN1-24": "riverbend-ward-night",
  "RN1-25": "riverbend-ward-night",
};

export function locationFor(beatId: string): LocationArt | undefined {
  const id = BEAT_LOCATION[beatId];
  return id ? LOCATION_ART[id] : undefined;
}
