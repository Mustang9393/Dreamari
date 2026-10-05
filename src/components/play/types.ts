// The simulation engine's vocabulary. Every career simulation is DATA in this
// shape -- adding Level 2, or the other 24 careers, means writing beats, not
// components. The rules here are the ones on the Scoring Model and Interaction
// Rules tabs of the handoff, which all 25 careers share.

/** The four answer tiers. Exactly one Best per scored beat, roughly one Risky
 *  per level. `none` is for rapid-fire children, which feed their set's result
 *  and carry no score of their own. */
export type Tier = "best" | "acceptable" | "wrong" | "risky" | "none";

// Wrong moved from -3 to -5 (Scoring Model, REBUILT 20 Sept to binary
// scoring): symmetrical with Best, so ten scored beats at +-5 from a start
// of 50 give a clean 0-100 range with no rounding, and a level's final
// reputation always equals correct answers x 10. Acceptable/Risky stay
// defined (existing Level 2/3 content still authors them) but the new
// binary levels simply never assign either tier to a choice.
export const TIER_SCORE: Record<Tier, number> = {
  best: 5,
  acceptable: 2,
  wrong: -5,
  risky: -6,
  none: 0,
};

// Headlines are DERIVED from the score, never authored per beat -- the handoff
// is explicit about this, so a writer cannot accidentally congratulate someone
// for a risky call.
export const TIER_HEADLINE: Record<Tier, string> = {
  best: "Strong move!",
  acceptable: "That works.",
  wrong: "Not quite.",
  risky: "Risky call.",
  none: "",
};

export type Choice = {
  id: string;
  label: string;
  tier: Tier;
  /** Why THIS option, so a student who picks badly is told why their pick was
   *  weak rather than just being read the right answer. */
  why: string;
};

/** Dreamy's poses (public/images/dreamy/v2). The guide should look like it
 *  means what it is saying, so a beat picks the face rather than always
 *  wearing the same one. */
export type DreamyPose = "happy" | "glasses" | "idea" | "curious" | "alert" | "nervous" | "party" | "puzzle" | "heart";

type BeatBase = {
  id: string;
  /** Action Prompt (Interaction Rules): the short grey line telling the
   *  student what to do on screens whose action is not a labelled button --
   *  "Tap one.", "Drag or tap the right word into the space.". Button screens skip
   *  it: there the button label IS the prompt. */
  prompt?: string;
  /** Calls the player's eye to a HUD element this beat is talking about --
   *  "score" spotlights the reputation gauge with an arrow nudge and a
   *  worked increase/decrease demo while the beat is on screen. */
  spotlight?: "score";
  /** Scene art. Sticky: a beat without its own art keeps the last one, so the
   *  unillustrated beats read as happening in the same room. */
  art?: string;
  artAlt?: string;
  /** The verdict plays in the beat's own room (its routed location) with
   *  the reactor standing in it, though the question was asked over `art`
   *  (AMT screen 4: the drawer close-up for the question, Maya on the
   *  hangar floor for "Strong move!"). */
  verdictInRoom?: boolean;
  /** A camera on `art` (HeroCamera.tsx). `ratio` is the image's width /
   *  height; `focus` is a region of the image (fractions) the camera pushes
   *  in on; `highlight` marks one spot with a reticle (AMT: the drawer's
   *  empty slot). Beats that share the picture and the frame hold the
   *  shot. */
  artFrame?: {
    ratio: number;
    /** Fitted into the free band between the HUD and the dialogue box
     *  (measured live); `fill` is how much of that band's height it takes,
     *  `maxScale` caps the push-in. */
    focus?: { x0: number; y0: number; x1: number; y1: number; fill?: number; maxScale?: number };
    highlight?: { x: number; y: number; rx: number; ry: number };
  };
  /** Deliberately breaks the sticky-art chain at this beat, even though it
   *  has no `art` of its own -- for when the beats that follow move to a
   *  different character/scene than the one the last hero illustration was
   *  for (an offer letter's own art bleeding into the onboarding steps that
   *  come after it, say). The beat falls straight through to its own
   *  location instead of inheriting a stale picture. */
  resetScene?: boolean;
  /** Which face Dreamy wears on this beat. Only used when Dreamy is speaking. */
  pose?: DreamyPose;
  /** Overrides the level's mood for this beat. Level 2 runs three screens in
   *  late-night navy and comes back to day; Level 3 has a maroon Crunch Time
   *  stretch. The two are different on purpose (Interaction Rules tab). */
  mood?: Mood;
  speaker?: string;
  /** Who a location scene should show standing in it, when that differs from
   *  who is talking -- a "character" card is narrated by Dreamy but ABOUT the
   *  person it introduces, so the scene needs their name, not the narrator's. */
  castMember?: string;
  /** Two or more people on screen together (the reception's Christina and
   *  Jordan). Takes priority over `castMember`/`speaker` when set, and is
   *  only usable on a location with `characterAnchors` for that many people. */
  castMembers?: string[];
  /** A named expression (the art manifest's `poses`) the cast member wears
   *  on this beat before there is any answer to react to. */
  castPose?: string;
  /** A tense beat borrows the concerned/uncertain tier reaction as its
   *  pre-answer default expression instead of the usual neutral one, and
   *  tints the dialogue box to match. Not tied to any one beat kind -- a
   *  Flags beat about catching someone else's mistake under a clock is
   *  exactly as tense as a Choice beat. */
  tone?: "normal" | "conflict" | "alarm";
  setup?: string;
  /** 0 to 1. Present only on the ten scored beats -- progress measures scored
   *  beats, so narrative cards never move it. */
  progress?: number;
  /** Present only on the ten scored beats. One sentence, the supervisor's own
   *  voice, naming what a Wrong/Risky answer on THIS beat got wrong. Sits
   *  unused until a Wrong/Risky answer here happens to be the one that lands
   *  the third strike -- then it fills the {PLAN_LINE} slot opening the
   *  Performance Plan, so the plan names the actual mistake rather than
   *  reading as generic. See performance-plan.ts and scoring.ts's strike
   *  rule comment. */
  planLineIfFailed?: string;
  /** Directed levels only (Level.directed): who reacts on stage when the
   *  verdict lands, when that is not the speaker -- Marcus asks the document
   *  question but has no reaction sprites, so Christina, beside him, reacts. */
  reactor?: string;
  /** Directed levels: an unscored check (no points, no strike, no dot) on a
   *  beat kind that would otherwise score. */
  practice?: boolean;
  /** Directed levels: the question sits low and the scene behind it is only
   *  darkened, never blurred -- for a beat whose picture IS the story (IB v2
   *  screen 33: "keep Jordan visibly talking to the manager in the
   *  background... do not blur or obscure it more than necessary"). */
  keepScene?: boolean;
  /** Directed levels: a story card that sits centre screen instead of
   *  docking at the bottom (IB v2 screens 38-40). */
  center?: boolean;
  /** Directed levels: the setup line stays above the question on ONE screen
   *  instead of being staged as its own tap first, for a script that writes
   *  the situation and the question as a single screen (RN v2 8, 26, 30, 41). */
  inlineSetup?: boolean;
  /** Directed levels: a practice beat that moves straight on when answered,
   *  with no verdict screen, because the script writes none (IB v2 screen 14
   *  goes straight to 15). */
  noVerdict?: boolean;
  /** Cinematic levels: a pivotal choice. The room drains to grey while you
   *  decide (Ace Attorney's evidence moment); the people in it, and the
   *  colour, come back with the verdict. */
  pivotal?: boolean;
  /** Cinematic levels: this card introduces a character, so their name is
   *  set huge behind them and their role rides on the name plate. Cards
   *  whose label already reads "Name \u2022 Role" are detected without it;
   *  this is for introductions written as prose ("Meet Marcus, the Vice
   *  President."), so no screen's copy has to change to get the reveal. */
  introduce?: { name: string; role?: string };
  /** This decision's own Reputation value for a Best answer (Wrong costs
   *  the same), when a script gives each decision its own weight (AMT:
   *  "Reputation +8", "+10", "+12", "+15"). Falls back to Level.points. */
  points?: number;
  /** Directed levels: the authored prompt is the screen's heading, above the
   *  question, instead of the small instruction under it (RN v2 screen 33:
   *  "DRAG THE RIGHT WORD INTO THE SPACE." is the heading). */
  promptStyle?: "heading";
  /** Directed levels: the verdict headline when this beat is answered best,
   *  instead of the derived "Strong move!" (RN v2 screen 49, "Good recovery."). */
  bestHeadline?: string;
};

export type Mood = "day" | "night" | "crunch";

/** Intro, narrative and character cards: one button, no score. `offer` carries
 *  the salary/hours tiles the level-opening contract screens use, and `step`
 *  is a numbered card in an onboarding or character carousel. */
export type CardBeat = BeatBase & {
  /** The card's title shown as a departure board (split-flap tiles; a live
   *  countdown when the title names minutes, red when `late`). AMT 15 and
   *  34: same words, airport UI. */
  board?: { late?: boolean };
  /** A message in the shared Operations chat window under the title (AMT
   *  15 and 34: "Operations asks: ..." as their message arriving). */
  opsChat?: { name: string; role: string; message: string };
  kind: "card";
  /** "act": a completion moment (with `auto`) or a checkpoint (with
   *  `secondaryCta`) -- full-bleed, celebratory, never a scored beat. */
  variant: "intro" | "character" | "chapter" | "offer" | "step" | "act";
  title: string;
  body?: string;
  /** Grey EXAMPLE box under the body. */
  example?: string;
  /** Directed levels: the example drawn as a short illustrated sequence
   *  instead of a paragraph (4 Oct 2026, Chandu: "the example modal is badly
   *  designed. Its just a paragraph"). The steps carry the doc's own words,
   *  split where the story turns. */
  exampleSteps?: { icon: "store" | "gap" | "bank" | "grow"; text: string }[];
  /** Show the reputation bands and where the player currently sits. */
  showBands?: boolean;
  /** offer variant: the three tiles (role, pay, hours). */
  facts?: { label: string; value: string }[];
  /** step variant: "1 of 5". */
  step?: { at: number; of: number };
  /** A warning or aside under the body, in the level's accent. */
  note?: string;
    /** "act" variant only: auto-advances after a short pause instead of
   *  waiting on `cta` -- a quick celebratory beat, not a real stopping
   *  point (Act Moment, Interaction Rules). On this variant `title` is the
   *  small eyebrow ("FOUNDATION COMPLETE") and `body` is the one line
   *  underneath ("You know the basics."), swapped from every other
   *  variant's use of `title` as the headline. */
  auto?: boolean;
  /** "act" variant only: a second, quieter action under the primary
   *  button that leaves the level instead of continuing it -- the one
   *  place a student is offered a mid-level exit (the Act Moment
   *  checkpoint). Progress is already saved by the time this renders, so
   *  it only needs somewhere to send them. */
  secondaryCta?: string;
  secondaryHref?: string;
  /** character variant, card two of two (the POWER card): the ladder graphic,
   *  bottom-to-top, each rung "Name - Role" (a rung always carries its job
   *  title, never a bare name). `lit` rungs are the player and the character
   *  this card is about; the rest render dimmed. Only ever shows rungs the
   *  student has actually met (Characters tab). */
  ladder?: { label: string; lit: boolean }[];
  /** The game speaking rather than a person: no avatar, no name, thin
   *  outline, a different card shape from every in-story card -- so a
   *  student can tell the game talking from the job talking (Interaction
   *  Rules, System Card). */
  system?: boolean;
  /** The arrival moment: a burst, a sweep and shimmering ink on the title,
   *  so the first day reads as an event (Joshua Pierce, Slack, 6 Sept 2026:
   *  "the student is genuinely arriving for the first day of their new job"). */
  celebrate?: boolean;
  /** Directed levels: the second line reads as part of the main message,
   *  not fine print (IB v2 screens 1-2, "increase the size of the second
   *  line slightly"). */
  bodyLarge?: boolean;
  /** Directed levels: a shift schedule drawn as a timeline, the card's main
   *  visual (RN v2 screens 6 and 29: "the patient schedule should be a major
   *  visual element"), with an optional line under it. */
  schedule?: { time: string; room: string; task: string }[];
  scheduleNote?: string;
  /** Directed levels only: the boss-level arrival (doc screen 24, "strong
   *  lighting, elevated visuals, and a boss-level presence") -- a gold-rimmed
   *  box, a darker room with a spotlight behind the character, a slower
   *  entrance and the sweep sound. */
  entrance?: "boss";
  /** Directed levels only: the scene character wears the reaction to this
   *  earlier scored beat ("Christina saw how you handled it" shows her proud
   *  or concerned, depending on how the ranking actually went). */
  reactsTo?: string;
  cta: string;
};

/** Comprehension Check: the unscored gate after a Teach Card. Unlimited
 *  tries, cannot skip, never a strike -- wrong answers shake and stay open
 *  until the student gets it right (Interaction Rules). `tap` when the
 *  answer is a concept, `type` when it is a number or exact word the
 *  student must carry forward (recall, not recognition), `drag` when the
 *  answer should cost a deliberate second (a token dragged onto a card). */
export type CheckBeat = BeatBase & {
  kind: "check";
  method: "tap" | "type" | "drag";
  question: string;
  /** tap/drag methods: exactly one correct option. */
  options?: { label: string; correct: boolean; why: string }[];
  /** type method: the accepted entry, compared trimmed and case-insensitive. */
  answer?: string;
  /** type method: right answer's confirmation line. */
  whyRight?: string;
  /** type method: fades in under the box after two wrong tries. */
  hint?: string;
  cta: string;
};

/** Word Cards: vocabulary taught one word per card, flipbook-style -- a
 *  big centered term with its definition on the SAME face (no
 *  flip-to-reveal, per direct feedback), paged through one by one with a
 *  3D page turn. Continue appears only after the last word. Not scored. */
export type FlipsBeat = BeatBase & {
  kind: "flips";
  title: string;
  cards: { term: string; def: string }[];
  cta: string;
};

/** Tap to Reveal: rows that show a label and hide their payload behind TAP
 *  TO REVEAL. Continue only appears once every row is open, so nobody can
 *  skip the lesson. Not scored (Interaction Rules). */
export type RevealBeat = BeatBase & {
  kind: "reveal";
  title: string;
  /** A plain line under the title (IB Level 1 doc, screen 9). */
  body?: string;
  rows: { label: string; reveal: string; color?: "red" | "amber" | "green" }[];
  /** Static line under the rows (never a row itself). */
  note?: string;
  cta: string;
};

/** Pick one option. Locks immediately, no confirm step. Covers Scenario, Timed
 *  Scenario, Boss Moment, Fill in the Blank and Catch the Mistake -- they score
 *  identically and differ only in how the options are drawn. */
export type ChoiceBeat = BeatBase & {
  kind: "choice";
  /** `zones`, `move` and `chat` are the doc's three distinct drag designs
   *  (IB Level 1 doc, 4 Oct 2026, screens 23, 30 and 32): files into one of
   *  three storage zones, an action card into a YOUR MOVE drop zone, and a
   *  message into a chat with a named character. */
  layout: "options" | "blank" | "tiles" | "document" | "boss" | "zones" | "move" | "chat";
  /** `chat` layout: the character on the other end of the thread. */
  /** `message`: what they sent you first, shown as their bubble above
   *  your reply (AMT screen 16: Operations asked "Can we start boarding?"). */
  chatWith?: { name: string; role: string; message?: string };
  question: string;
  choices: Choice[];
  feedback: string;
  feedbackCta: string;
  skills: string[];
  /** Seconds. On timeout the beat scores as Wrong, never Risky: a slow reader
   *  is not the same as someone who invented numbers. */
  timer?: number;
  /** Header for the `document` layout's window chrome. The label was hardcoded
   *  to Level 1's Nike summary, which is wrong on every other beat. */
  doc?: string;
  /** `options` layout only: a draggable token, same rail-and-drop mechanic
   *  CheckBeat's own drag method already uses, in front of a SCORED beat
   *  instead of a free comprehension check ("Drag to Answer" / "Drag Cards
   *  to Zone" / "Drag Message to Chat" on the Interaction Rules tab -- one
   *  mechanic, three names for what the card around it is dressed as). A
   *  card is always still tappable, so a missed drag never strands anyone. */
  dragEnabled?: boolean;
  /** A measured value against its limit, drawn as a bar with the limit
   *  marked (AMT screen 11: "Measured condition vs. Acceptable maintenance
   *  limit"). Fractions 0-1, no invented units. */
  gauge?: { measuredLabel: string; limitLabel: string; measured: number; limit: number };
  /** A short paper task card shown above the answers, one labelled line
   *  each (AMT screen 18: the card names the job and the tool, so picking
   *  the tool is reading the card, never knowing jargon in advance). */
  taskCard?: { label: string; value: string }[];
  /** A situation told as a status board instead of a stack of lines (AMT
   *  screen 37: the deadline as the heading, the pressures as compact items,
   *  the one fact that changes everything set apart). Same copy, word for
   *  word; only the layout differs. */
  briefing?: { heading: string; lines: string[]; twist?: string };
};

/** Tap the parts of a picture that deserve a closer look (AMT screens 7 and
 *  31). Each hotspot reveals what it is when tapped; the beat is done once
 *  every `issue` hotspot is found. With a timer, running out counts as
 *  Wrong. */
export type InspectBeat = BeatBase & {
  kind: "inspect";
  question: string;
  image: string;
  imageAlt: string;
  hotspots: { id: string; x: number; y: number; r: number; label: string; note: string; issue?: boolean }[];
  timer?: number;
  /** The points pop up one after another as markers to check, instead of
   *  hiding in the picture (AMT screen 31: "Several inspection points
   *  appear rapidly"). Only a point that has appeared can be tapped. */
  rapid?: boolean;
  whenRight: string;
  whenWrong: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
};

/** Tap a term, then its definition. Nothing scores until Check Matches. All
 *  pairs must be right. */
export type MatchBeat = BeatBase & {
  kind: "match";
  question: string;
  pairs: { term: string; def: string }[];
  whenRight: string;
  whenWrong: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
  progress?: number;
};

/** A set of quick questions on ONE shared countdown that keeps running between
 *  them. The set is one scored beat; the children score nothing. Passes at
 *  three quarters of the items, rounded up. */
export type RapidBeat = BeatBase & {
  kind: "rapid";
  question: string;
  /** Level 1 and 3 share one clock across the set; Level 2's model has none. */
  timer?: number;
  items: { question: string; options: { label: string; correct: boolean; why: string }[] }[];
  whenPass: string;
  whenFail: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
};

/** The level's closing sequence: the review beat, then the ending the final
 *  reputation earned. */
export type ReviewBeat = BeatBase & {
  kind: "review";
  title: string;
  body: string;
  /** Directed levels: the line under the score while the count runs
   *  ("Decision pending..."). Defaults to "Decision pending". */
  pending?: string;
};

/** Build the Strongest Answer: chained steps, each adding a sentence to the
 *  answer being assembled. ONE score for the whole chain -- all steps right is
 *  Best, anything less is Wrong, because the steps form a single argument and
 *  partial credit would teach three separate facts instead of one skill. */
export type ChainBeat = BeatBase & {
  kind: "chain";
  question: string;
  steps: { label: string; prompt: string; options: { label: string; correct: boolean }[] }[];
  whenRight: string;
  whenWrong: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
};

/** Risk Slider: drag across labelled segments, then submit. Only the correct
 *  segment scores its tier; neighbours are not partial credit. */
export type SliderBeat = BeatBase & {
  kind: "slider";
  question: string;
  /** In order, low to high. Each carries its own tier and explanation. */
  steps: { label: string; tier: Tier; why: string }[];
  feedback: string;
  feedbackCta: string;
  skills: string[];
  timer?: number;
};

/** Find All Red Flags: tap every row that is wrong, then submit. */
export type FlagsBeat = BeatBase & {
  kind: "flags";
  question: string;
  rows: { label: string; flag: boolean; why: string }[];
  whenRight: string;
  whenWrong: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
  timer?: number;
};

/** Rank the Order: shuffled rows, moved with up/down, then submitted. All
 *  positions right by default; a beat authored with `whenClose` grants
 *  partial credit instead (all right = Best, exactly one adjacent pair
 *  swapped = Acceptable, anything else = Wrong -- the RN handoff's
 *  three-band scoring). */
export type RankBeat = BeatBase & {
  kind: "rank";
  question: string;
  /** In the CORRECT order. The player always sees them shuffled. */
  order: string[];
  whenRight: string;
  /** Partial credit line ("three of four in the right place") -- its
   *  presence is what turns the beat's scoring three-band. */
  whenClose?: string;
  whenWrong: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
};

/** Pick N of M: choose exactly N cards, then submit. A harmful card in the set
 *  scores Risky however good the rest are. */
export type PickBeat = BeatBase & {
  kind: "pick";
  question: string;
  /** Build the reply inside a chat (AMT screen 35, "Message Operations"):
   *  their last message on top, the picked pieces assemble into your
   *  message, and Send submits. */
  chatWith?: { name: string; role: string; message?: string };
  pick: number;
  cards: { label: string; role: "pick" | "leave" | "harmful" }[];
  whenRight: string;
  whenWrong: string;
  whenHarmful?: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
  timer?: number;
};

/** Two-Bucket Sort: one item at a time, two buttons. Passes at three quarters
 *  of the items, rounded up. */
export type BucketBeat = BeatBase & {
  kind: "bucket";
  question: string;
  buckets: [string, string];
  /** `into` is the index of the bucket this item belongs in. */
  items: { label: string; into: 0 | 1 }[];
  whenRight: string;
  whenWrong: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
};

/** Teach Card - Focus One (Interaction Rules): two term cards on screen at
 *  once, only one in focus (sharp; the other blurred). GOT IT on the
 *  focused card swaps which one is sharp; Back returns focus to the
 *  first. Not scored -- it replaces the one-word-at-a-time flip carousel
 *  with a pair that shows both terms belong together while still forcing
 *  attention onto one at a time. */
export type FocusBeat = BeatBase & {
  kind: "focus";
  title: string;
  terms: [{ term: string; def: string }, { term: string; def: string }];
};

/** LOCAL EXPERIMENT (amt-torque-lab): set a click-type torque wrench to the
 *  manual's mark (`target` +- `band` on a 0..1 scale), pull until it clicks,
 *  stop at the click. Over-pulling resolves wrong. */
export type TorqueBeat = BeatBase & {
  kind: "torque";
  question: string;
  target: number;
  band: number;
  whenRight: string;
  whenWrong: string;
  feedback: string;
  feedbackCta: string;
  skills: string[];
};

export type Beat =
  | TorqueBeat
  | InspectBeat
  | CardBeat
  | CheckBeat
  | FlipsBeat
  | RevealBeat
  | ChoiceBeat
  | MatchBeat
  | RapidBeat
  | ReviewBeat
  | ChainBeat
  | SliderBeat
  | FlagsBeat
  | RankBeat
  | PickBeat
  | BucketBeat
  | FocusBeat;

export type Ending = {
  /** Inclusive floor. Matched highest-first. */
  min: number;
  /** Omitted on a level whose own `hideBand` retires the four-band system
   *  in favor of stating the outcome itself as the headline (Scoring
   *  Model: "the band word is RETIRED" for Level 1). */
  band?: BandName;
  headline: string;
  message: string;
  subline: string;
  /** Directed levels: a bold line under the subline ("Level 2 Unlocked •
   *  Staff Nurse"), when the script gives the unlock its own line. */
  unlock?: string;
  /** Directed levels: no "Reputation N" line, when the script's ending
   *  screen has none (AMT screen 40: the score was revealed on 39). */
  hideReputation?: boolean;
  /** Directed levels: a small label above the headline, when the script
   *  gives the ending screen one (AMT screen 40: "LEVEL 1 COMPLETE"). */
  kicker?: string;
  primary: string;
  /** Advancing to the next level, or replaying this one. */
  advances: boolean;
};

export type BandName = "At Risk" | "Cautious" | "Respected" | "Trusted";

export type Level = {
  id: string;
  n: number;
  /** "Intern", "Analyst" ... */
  role: string;
  title: string;
  blurb: string;
  cover: string;
  /** Late-night navy in Level 2, Crunch Time maroon in Level 3: different on
   *  purpose. */
  mood: Mood;
  /** Speaker name -> portrait, for the dialogue box. Faces are cropped from
   *  this level's own scene art (Vision's face detection found the boxes), so a
   *  character who appears in a scene can also speak with a face. */
  cast?: Record<string, string>;
  beats: Beat[];
  endings: Ending[];
  /** Retires the At Risk / Cautious / Respected / Trusted band word from
   *  the reputation gauge's own corner label -- the outcome (BAG SECURED,
   *  RETRY LEVEL, TERMINATED) carries the meaning instead (Scoring Model,
   *  Interaction Rules: "the band word is RETIRED", 20 Sept). Per-level so
   *  Levels 2 and 3 keep their own band word until they get the same pass. */
  hideBand?: boolean;
  /** Express mode: beat ids the trimmed demo run drops. All are teaching
   *  screens -- every scored beat must survive, and scoring, thresholds and
   *  endings stay untouched (Express handoff doc). Presence of this list is
   *  what offers the mode at all. Read against `expressSource` if that's
   *  set (see below), not necessarily this level's own `beats`. */
  expressCut?: string[];
  /** True only on the derived level object actually being played in Express
   *  (the route builds it from `expressCut`) -- the player uses it to key a
   *  separate save slot and to turn the cut teaching into tappable panels. */
  express?: boolean;
  /** Escape hatch for "Full mode moved on, Express mode didn't" (direct
   *  feedback, 21 Sept 2026: IB Level 1's Full mode rebuild changed what
   *  Express played too, and only Express was supposed to revert). When
   *  set, Express mode is built from THIS level object's own `beats` +
   *  `expressCut` instead of the level's -- a frozen snapshot, not a live
   *  view of Full mode's own content. Full mode is completely unaffected;
   *  this field is only ever read for the express derivation. */
  expressSource?: Level;
  /** The 4 Oct 2026 presentation pass (IB Level 1 doc), opt-in per level so
   *  Express and every other level stay exactly as they were: cards type
   *  what is SAID (characters with voice blips, the narrator faster and
   *  silent, the system not at all), a hint says a tap shows the whole
   *  line, characters react on stage when a verdict lands, points fly into
   *  the score, numbers and "Tap one." come off the options, and the review
   *  builds suspense on the score itself. */
  directed?: boolean;
  /** Directed levels: the one-time tooltip under the score the first time
   *  it moves (doc screen 12). */
  scoreTip?: string;
  /** Directed levels: points per decision, fixed (+points right, -points
   *  wrong) instead of scaled to ten decisions. IB Level 1 uses 6, the doc's
   *  "+6, 50 -> 56". */
  points?: number;
  /** Its own save slot, so a lab build of a level never resumes into (or
   *  overwrites) the main build's run. */
  saveSlot?: number;
  /** Shown in the HUD instead of "Level N" from this beat on (IB v2: the
   *  second half after the checkpoint is "Level 1.5", which "needs to feel
   *  like a new section"). */
  sectionAfter?: { beatId: string; label: string };
  /** The optional, skippable run-up before the story (IB v2, 4 Oct 2026):
   *  a start card with How to Play, then a short career mini lesson, then a
   *  clear hand-off into screen 1. Once the story starts, instruction ends. */
  preGame?: PreGame;
  /** The retry ending offers only Start over, no "fix your misses" round
   *  (RN v2 screen 55: "Button: Start Over"). */
  noRepair?: boolean;
  /** No three-strikes performance plan: neither v2 script has one, so a run
   *  ends only on the score thresholds. */
  noStrikes?: boolean;
  /** The v2 labs' cinematic presentation pass (name plates, intro
   *  name splash, reply bubbles, drain-bar timer, paper documents). */
  cinematic?: boolean;
  /** Career-world colours for this level's buttons and primary surfaces
   *  (the v2 labs get it from preGame; the main nursing game opts in). */
  worldTheme?: boolean;
  /** The endings show only what the script writes: no "Back to Games" on a
   *  retry or termination and no "85 and above advances." footer (RN v2
   *  screen 55: "Button: Start Over"). */
  plainEndings?: boolean;
  /** DEMO-ONLY: a skip-screen button (and Start over) in the HUD that moves
   *  past any screen without answering it, beside the usual back button, for
   *  quick QA and demos (Chandu, 5 Oct 2026: "just let me skip any screen and
   *  also hit a back button to go back to any screen"). On IB and nursing
   *  Level 1; kept for demos and flagged for Usman to remove in production
   *  ("keep them for now... we'll flag them for Usman"). */
  qaSkip?: boolean;
};

/** How to Play is the same three screens for every career (mission,
 *  reputation, skills), filled from the career's own ladder and skills; the
 *  mini lesson is each career's own. */
export type PreGame = {
  /** What starting the story is called here ("Start the internship"). */
  startLabel?: string;
  /** The run-up's skip button ("Skip to the internship"). */
  skipLabel?: string;
  /** The hand-off card's line ("Your internship starts now."). */
  handoffLine?: string;
  /** The last How to Play screen's button ("Start your first day"). */
  howToCta?: string;
  /** How to Play's three score outcomes, best first ("Bag Secured",
   *  "Retry", "Terminated"). The ranges come from the level's endings. */
  tiers?: { label: string }[];
  /** Every rung of the career, bottom first ("Intern", "Analyst", ...). */
  ladder: string[];
  /** A few of the skills this level practises, shown as chips. */
  skills: string[];
  /** How many career skills the game tracks in all. */
  skillTotal: number;
  lesson?: {
    title: string;
    screens: (
      | { kind: "say"; heading: string; body: string; image?: string; cta?: string; icon?: "bank" | "care" }
      | { kind: "diagram"; heading: string; steps: { icon: "store" | "gap" | "bank" | "grow" | "investors"; text: string }[]; image?: string; cta?: string }
      | { kind: "check"; heading: string; question: string; options: { label: string; correct: boolean; why?: string }[]; image?: string; cta?: string; method?: "tap" | "drag" }
    )[];
  };
};

/** One trailer card: full-bleed reused art (none = black), one line of
 *  plain-English text, auto-advances after `seconds`. The finale card
 *  carries the six-rung ladder and the Start/Skip buttons instead of
 *  auto-advancing (Trailer tab). */
export type TrailerCard = {
  id: string;
  seconds: number;
  text: string;
  art?: string;
  /** A character sprite (an existing expression cutout) rising into frame,
   *  dark-graded -- the trailer's people are silhouettes until the game
   *  introduces them properly. */
  sprite?: string;
  finale?: boolean;
  /** The consequence beat: the plate drains to grey, the same grade the
   *  game uses on a pivotal choice. */
  drain?: boolean;
};

export type Simulation = {
  id: string;
  /** The shared career catalogue id, so a simulation lines up with the report,
   *  the pathway and the plan for the same career. */
  careerId: string;
  title: string;
  world: string;
  firm: string;
  cover: string;
  /** Plays once before Level 1, skippable, no choices, no score -- about 20
   *  seconds of reused art (Trailer tab). */
  trailer?: TrailerCard[];
  levels: Level[];
  /** Levels named on the ladder but not built yet. */
  upcoming: string[];
};
