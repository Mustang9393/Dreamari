// The simulation engine's vocabulary. Every career simulation is DATA in this
// shape -- adding Level 2, or the other 24 careers, means writing beats, not
// components. The rules here are the ones on the Scoring Model and Interaction
// Rules tabs of the handoff, which all 25 careers share.

/** The four answer tiers. Exactly one Best per scored beat, roughly one Risky
 *  per level. `none` is for rapid-fire children, which feed their set's result
 *  and carry no score of their own. */
export type Tier = "best" | "acceptable" | "wrong" | "risky" | "none";

export const TIER_SCORE: Record<Tier, number> = {
  best: 5,
  acceptable: 2,
  wrong: -3,
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
};

export type Mood = "day" | "night" | "crunch";

/** Intro, narrative and character cards: one button, no score. `offer` carries
 *  the salary/hours tiles the level-opening contract screens use, and `step`
 *  is a numbered card in an onboarding or character carousel. */
export type CardBeat = BeatBase & {
  kind: "card";
  variant: "intro" | "character" | "chapter" | "offer" | "step";
  title: string;
  body?: string;
  /** Grey EXAMPLE box under the body. */
  example?: string;
  /** Show the reputation bands and where the player currently sits. */
  showBands?: boolean;
  /** offer variant: the three tiles (role, pay, hours). */
  facts?: { label: string; value: string }[];
  /** step variant: "1 of 5". */
  step?: { at: number; of: number };
  /** A warning or aside under the body, in the level's accent. */
  note?: string;
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
  layout: "options" | "blank" | "tiles" | "document" | "boss";
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

export type Beat =
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
  | BucketBeat;

export type Ending = {
  /** Inclusive floor. Matched highest-first. */
  min: number;
  band: BandName;
  headline: string;
  message: string;
  subline: string;
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
  /** Express mode: beat ids the trimmed demo run drops. All are teaching
   *  screens -- every scored beat must survive, and scoring, thresholds and
   *  endings stay untouched (Express handoff doc). Presence of this list is
   *  what offers the mode at all. */
  expressCut?: string[];
  /** True only on the derived level object actually being played in Express
   *  (the route builds it from `expressCut`) -- the player uses it to key a
   *  separate save slot and to turn the cut teaching into tappable panels. */
  express?: boolean;
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
