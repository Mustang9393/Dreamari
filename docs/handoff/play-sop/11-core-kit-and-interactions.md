# 11. The core kit: every scalable game component, its rules and logic

**Audience:** Usman (and his agent), building career simulations from scratch for hundreds of careers.
**Read with:**
- Joshua's SOP 1 (Content & Gameplay), SOP 2 (Visual & Image Production) and SOP 3 (Screen Map & Handoff), v2.0.
- Our SOPs 4 to 7 in [10-automation-handoff-usman.md](10-automation-handoff-usman.md), which cover art: positioning, character isolation and sprites.

**Snapshot:** 9 Oct 2026, branch `lab-v3-cinematic`. Where this chapter and chapters 01 to 03 disagree, this chapter wins (see §9).

## Why this chapter exists

Chandu, 9 Oct 2026: "make a version where there isnt the custom arts like ecg, toolbox, clocks etc and what other animations because we wont be able to realistically scale that."

The three live games (Investment Banking, Registered Nurse and Aviation Maintenance Technician) were hand-tuned. Along the way they picked up pieces that only work for one career:
- a bedside ECG monitor;
- a ticking desk clock;
- a toolbox drawer drawn tool by tool;
- an airport departure board;
- a torque wrench you pull until it clicks;
- photo hotspots placed by hand.

These are great demos, but nobody can draw 900 of each. So every game component is now in one of two groups:
- **Core kit.** It scales by data alone. Write the content and the component works for any career. New careers are built **only** from these.
- **Bespoke.** It needs hand-drawn art, hand-placed coordinates or a one-career mechanic. It stays in the three demo games. Each bespoke piece has a named core replacement that teaches the same thing with the same words.

The split is enforced in code and visible in three places:

| Where | What it shows |
|---|---|
| `/component-lab?kit=core` | The component library filtered to core kit components only. Every game component has a **Core kit** or **Bespoke** badge. Bespoke ones show their core fallback beside them, rendered from the same data. `?kit=bespoke` shows the other half. |
| `/play/<game>?kit=core` | Any live level played end to end on the core kit only (for example `/play/aviation-maintenance-technician?kit=core`). This is exactly what a generated career will look like. |
| `src/components/play/coreKit.ts` | The rules as code. `toCoreLevel(level)` swaps every bespoke field for its core version. `bespokeIn(level)` lists any bespoke field still in a level, so a generator can refuse to ship one. `BESPOKE_FIELDS` is the list. |

---

## 1. How a game is built (the 60-second model)

1. A career simulation is **data, not screens**.
   - A `Simulation` (`src/components/play/games.ts`) holds `Level[]`.
   - A `Level` (`src/components/play/types.ts`) is an ordered list of `Beat`s plus `Ending`s.
   - Each beat is one screen (or one staged moment) of Joshua's Master Screen Map.
2. **One beat kind is one component.** `BeatBody` in `SimulationPlayer.tsx` routes a beat's `kind` to its body in `interactions.tsx`.
3. **Every scored body reports exactly one result:** `onResolve(tier, why, choiceId?)`. The tier is `best`, `acceptable`, `wrong` or `risky`. The player owns everything else: score, strikes, feedback, saves and endings. A body never touches the score.
4. **Presentation is set per level, not per screen:**
   - `directed`: Joshua's v2 script rules: typing, docked feedback, no option numbers, and so on.
   - `cinematic`: name plates, reply bubbles, drain-bar timer.
   - `worldTheme`: career-colour buttons.
   - `coreKit`: set by `toCoreLevel`.
   A new career should set `directed: true, cinematic: true, worldTheme: true`. All three flags are core kit.

---

## 2. Joshua's vocabulary mapped to the engine

SOP 3 §11 and §12 fix the Screen Type and Interaction names ("Do not invent a new name every time the same mechanic appears"). SOP 3 also names components. This table is the bridge: a script row with a given **Screen Type + Interaction** becomes the beat in the "Write this" column.

| SOP 3 Screen Type | SOP 3 Interaction | SOP 3 component | Write this beat | Our component | Scale |
|---|---|---|---|---|---|
| STORY | CONTINUE | StoryDialogue | `card` variant `intro` or `chapter`, `speaker` set | `CardBody` in `DialogueBox` | Core |
| CHARACTER INTRO | CONTINUE | CharacterReveal | `card` variant `character` (+ `ladder`, `introduce`) | `CardBody` + `PowerLadder` + `IntroSplash` | Core |
| LEARNING | CONTINUE | TermCard | `flips` (one term at a time) or `focus` (a pair) | `FlipsBody`, `FocusBody` | Core |
| LEARNING | TAP TO REVEAL | (none) | `reveal` | `RevealBody` | Core |
| LEARNING | MULTIPLE CHOICE / DRAG AND DROP (unscored check) | (none) | `check` method `tap`, `type` or `drag` | `CheckBody` | Core |
| QUESTION | MULTIPLE CHOICE | ChoiceModal | `choice` layout `options` | `ChoiceBody` → `OptionButton` | Core |
| QUESTION | DRAG AND DROP | ChoiceModal | `choice` layout `options` + `dragEnabled`, or layout `blank` / `tiles` | `DragOptionsBody`, `BlankBody` | Core |
| QUESTION (boss) | MULTIPLE CHOICE | (Boss Moment) | `choice` layout `boss` | `BossOverlay` | Core |
| TIMED QUESTION | TIMED MULTIPLE CHOICE | TimedChoice | `choice` + `timer`, or `rapid` for a block (SOP 3 §25) | `ChoiceBody` / `RapidBody` + `DrainBar` | Core |
| MATCHING | MATCHING | MatchBoard | `match` | `MatchBody` | Core |
| MATCHING (sort) | DRAG AND DROP | (none) | `bucket` | `BucketBody` | Core |
| RANKING | RANKING / SEQUENCING | RankCards | `rank` | `RankBody` | Core |
| (chain) | SEQUENCING | (none) | `chain` | `ChainBody` | Core |
| MESSAGE | MESSAGE SELECTION | MessageChoice | `choice` layout `chat` + `chatWith`, or `choice` with every label in quotes (reply bubbles) | `ChatBody`, `ReplyBubble` | Core |
| MESSAGE | SELECT MULTIPLE | MessageChoice | `pick` + `chatWith` | `PickBody` (composer) | Core |
| WORK ARTIFACT | FIND THE MISTAKE | (none) | `choice` layout `document` (+ `doc`) | `DocumentBody` | Core |
| WORK ARTIFACT | SELECT MULTIPLE / FIND THE MISTAKE | (none) | `flags` | `FlagsBody` | Core |
| WORK ARTIFACT | SELECT MULTIPLE | (none) | `pick` | `PickBody` | Core |
| (judgement scale) | MULTIPLE CHOICE | (none) | `slider` | `SliderBody` | Core |
| FEEDBACK | RESULT REVEAL | StrongMove | nothing: the player draws feedback after every scored beat | `FeedbackSheet` + `ScoreFlight` | Core |
| TRANSITION | AUTO ADVANCE | (none) | `card` variant `act` + `auto: true` | `CardBody` (act) | Core |
| CHECKPOINT | CONTINUE | (none) | `card` variant `act` + `secondaryCta` ("Finish later") | `CardBody` (act) | Core |
| REVIEW (midpoint) | SCORE REVEAL | MidpointReview | `card` variant `act` + `review{threshold,…}` | `CheckpointReview` | Core |
| FINAL REVIEW | SCORE REVEAL | FinalReview | `review` (+ `deciding`) | `ReviewBody` | Core |
| OUTCOME | RESULT REVEAL | LevelOutcome | nothing: `Level.endings` (+ `offer`) | `EndingCard`, `OfferSheet` | Core |

**Notes on the mapping**
- **FEEDBACK is its own screen in SOP 3 §19, but not its own beat here.** The verdict copy lives on the scored beat. For a `choice`, each option has its own `why`. The other kinds use `whenRight` / `whenWrong` / `whenClose` / `whenHarmful` / `whenPass` / `whenFail`. The feedback button label is `feedbackCta`, and the skill tags are `skills`. A generator writes these from the FEEDBACK row that follows the QUESTION row.
- **Joshua's example scale** (SOP 3 §16: Best +6, Reasonable +2, Poor −3, Dangerous −8) maps to tiers. Best = `best`, reasonable but weaker = `acceptable`, poor judgement = `wrong`, dangerous = `risky`. The engine's own point values are in §4.1; to match a script's exact numbers, set `Level.points` or a beat's own `points`.
- **"Level 1.5" (SOP 3 §28).** Student copy never says it. The HUD label after the checkpoint comes from `Level.sectionAfter`, so write immersive copy there ("Second half of your internship").

---

## 3. Every core kit component: data, rules, logic

### 3.0 Rules every scored beat follows

**Scored and unscored kinds**
- Scored kinds: `choice`, `match`, `rapid`, `chain`, `slider`, `flags`, `rank`, `pick`, `bucket`. In the demo only, also `inspect` and `torque` (bespoke).
- A beat with `practice: true` never scores: no points, no strike and no progress dot. It still shows its verdict unless `noVerdict` is set.

**From setup to answer**
- **Setup line.** If `setup` is set, the line is read first. Tap, Space, Enter or "a" reveals the interaction. Set `inlineSetup` to keep the situation and the question on one screen.
- **Timer.** It starts only when the interaction is revealed. It pauses while feedback is up, once the answer is locked, and while a rapid block holds the clock.
- **One attempt.** The body reports one tier. After a wrong pick, the best answer is revealed in place.

**The pause before the verdict**

| Answer | Pause |
|---|---|
| Best or acceptable | 420 ms |
| Wrong or risky | 1150 ms |
| Wrong or risky on a `directed` level | 950 ms |

**Shuffling.** Options, cards and rows use a seeded shuffle. The order stays put while on screen and is new on each page load. Rank is never shown in its answer order.

**Keyboard**
- Number keys 1 to N pick options on layouts that lock on tap.
- On layouts with a Submit or Send step, a number key only selects. Only Submit or Send commits (fixed 9 Oct 2026).
- Space or Enter advances dialogue and feedback. The right arrow (ArrowRight) also advances.
- Every tap target is a real button or has `role="button"` with Enter and Space.

**Directed levels**
- Option numbers are hidden.
- Default prompts are dropped for options, document, zones, move and chat.
- `promptStyle: "heading"` turns the prompt into the screen heading.

### 3.1 Teaching and story kinds (unscored)

#### `card`: StoryDialogue, CharacterReveal, TRANSITION, CHECKPOINT, MidpointReview

**Fields**
- **Required:** `variant` (`intro`, `character`, `chapter`, `offer`, `step` or `act`), `title`, `cta`.
- **Optional:**
  - `body`, `example` (grey EXAMPLE box), `showBands`, `facts` (up to 3 label/value tiles), `step{at,of}`, `note`.
  - `auto` (act only), `secondaryCta` / `secondaryHref`, `ladder`, `review`.
  - `system`, `celebrate`, `bodyLarge`, `schedule` / `scheduleNote`, `entrance: "boss"`, `reactsTo`, `introduce`.

**Rules**
- One button.
- **Typing on a directed level:**
  - Quoted text types at speech pace (24 ms per character) with voice blips.
  - Narration types at 16 ms.
  - System cards appear at once.
  - The button waits for the typing. One tap shows all of it.
- **`act` + `auto`:** advances by itself after 1.4 s (1.8 s on a directed level) and plays the sweep sound. This is TRANSITION / AUTO ADVANCE.
- **`act` + `secondaryCta`:** a CHECKPOINT. On arrival the run is saved one beat ahead, so "Finish later" resumes on the next screen (SOP 3 §27).
- **`act` + `review{threshold, intro, progressLine, pass, fail}`:** the MidpointReview. Its three stages:
  1. Intro, which auto-advances.
  2. A ring counting up to the reputation (well under SOP 3 §35's 7 s).
  3. Pass (reputation ≥ `threshold`, 68 in every live level): balloons and the sweep sound. Below the threshold: the `fail` line, no party.

  It never changes the score and never blocks progress (SOP 3 §26).
- **`entrance: "boss"`:** a darkened room with a warm spotlight, plus the sweep sound.

**Placement**
- Centred if `system`, `act`, or `center` on a directed level.
- Otherwise docked at the bottom over the scene.

#### `flips`: TermCard (one at a time)

**Fields:** `title`, `cards[{term, def}]`, `cta`.

**Rules**
- Each tap turns the card with a 3D page turn and the flip sound. Progress dots sit below.
- On a directed level:
  - each card's button reads "Next";
  - the last one reads `cta` and advances;
  - the heading shows only on card 1.
- On other levels: the last card reads "Got it", then a separate Continue button.
- In Express mode, these terms become tappable underlined words wherever they are used later. That is why the terms must be written exactly as they appear in later copy.

#### `focus`: TermCard (a pair)

**Fields:** `title`, `terms[2]`.

**Rules**
- Two cards on screen; one is sharp and one is blurred.
- "Got it" on card 1 moves the focus to card 2. "Got it" on card 2 advances.
- "Back to {term}" returns to card 1. ArrowLeft and ArrowRight also work.

#### `reveal`: TAP TO REVEAL

**Fields:** `title`, `body?`, `rows[{label, reveal, color?: red|amber|green}]`, `note?`, `cta`.

**Rules**
- Each row opens once.
- Continue appears only when every row is open (nobody skips the lesson).

#### `check`: an unscored comprehension gate

**Fields:** `method` (`tap`, `type` or `drag`), `question`, `options[{label, correct, why}]`, `answer` (for type), `whyRight`, `hint`, `cta`.

**Rules**
- Unlimited tries, never a strike, can't be skipped.
- **tap:** a wrong pick shakes for 460 ms and stays enabled.
- **type:** compared after trimming and ignoring case. A wrong entry shakes and clears. `hint` fades in after 2 misses. A digits-only answer opens the number keypad.
- **drag:** a token on a rail is dropped onto a card, and every card is also tappable.
- Options are not shuffled.
- When solved: the `why` line, then the `cta` button.

### 3.2 Scored kinds

#### `choice`: ChoiceModal, TimedChoice, MessageChoice, FIND THE MISTAKE, Boss Moment

**Fields**
- **Required:** `layout`, `question`, `choices[{id, label, tier, why}]`, `feedback`, `feedbackCta`, `skills`.
- **Optional:** `timer` (seconds), `timeoutWhy` (the verdict line on a timeout; default "Time ran out."), `doc` (window title for `document`), `docTime`, `dragEnabled`, `dragItem` (the label on the drag token), `chatWith{name, role, message?, time?}`, `gauge{measuredLabel, limitLabel, measured, limit}`, `taskCard[{label, value}]` + `taskCardTitle`.

**Core layouts**

| `layout` | What the student does | Locks on |
|---|---|---|
| `options` | Taps one of 2 to 4 answers | Tap |
| `options` + `dragEnabled` | Drags a token onto an answer card (tapping still works) | Drop or tap |
| `blank` / `tiles` | Drags or taps a word into the gap in a sentence | Drop or tap |
| `document` | Picks the line in a document that has the mistake | Tap |
| `chat` | Drags a drafted message into the composer, then Send (a 1.1 s typing delay) | Send |
| `boss` | Same as options, in a gold-edged (world accent) box with a trophy | Tap |
| any, `cinematic` level, every label in quotes | Answers drawn as the student's own speech bubbles | Tap |

**Rules**
- After a wrong pick, the best answer is revealed.
- Timeout scores **wrong**, never risky ("Time ran out."). A slow reader is not reckless.
- `gauge` draws a measured-against-limit bar (proportions only, no invented units).
- `taskCard` draws a paper card of labelled lines above the answers. The card heading is `taskCardTitle`, default "Task card".
- `feedback` is not displayed. It is kept as the writer's summary.

#### `match`: MatchBoard

**Fields:** `question`, `pairs[{term, def}]`, `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`.

**Rules**
- Start a pair from either column.
  - A right pair flashes, then clears (260 ms).
  - A wrong pair shakes (520 ms) and counts as a miss.
- It always ends with the board cleared: **best** with zero misses, otherwise **wrong**.
- No timer.
- The "x of N matched" counter is hidden on a directed level.

#### `rapid`: TimedChoice block (SOP 3 §25)

**Fields:** `question`, `items[{question, options[{label, correct, why}]}]`, `timer` (one shared timer for the whole block), `whenPass`, `whenFail`.

**Rules**
- Each pick shows that option's `why`.
- **Between questions on a directed level:** a "Next question" button (on the last one, "See how you did"), and the clock is held while the student reads.
- **Between questions on other levels:** auto-advance after 480 ms (right) or 1150 ms (wrong).
- **Pass:** at least `ceil(0.75 × n)` right → **best**, otherwise **wrong**. For 4 questions that is 3 of 4, per SOP 3.
- **Timeout:** the block finishes with the right count so far.

#### `chain`: SEQUENCING (build the answer)

**Fields:** `question`, `steps[{label, prompt, options[{label, correct}]}]`, `whenRight`, `whenWrong`, …

**Rules**
- After each pick, a pause: 460 ms if right, 1150 ms if wrong.
- Then the **correct** sentence is added, even after a miss, so the finished answer is always right.
- All right → **best**. Any miss → **wrong**.

#### `slider`: a judgement scale

**Fields:** `question`, `steps[{label, tier, why}]` in order from low to high, `timer?`.

**Rules**
- A native range input with painted segments, then Submit.
- Only the chosen step's own tier scores; neighbouring steps get no partial credit.
- Timeout → **wrong** ("Time ran out.") (fixed 9 Oct 2026).

#### `flags`: FIND THE MISTAKE / SELECT MULTIPLE

**Fields:** `question`, `rows[{label, flag, why}]`, `whenRight`, `whenWrong`, `timer?`, …

**Rules**
- Toggle rows (`aria-pressed`), then "Submit findings".
- **Best only if the marked set exactly equals the flagged set.** A false positive fails.
- Timeout submits whatever is marked.
- The counter "x of N red flags marked" tells the student N.

#### `rank`: RankCards

**Fields:** `question`, `order[]` (the correct order), `whenRight`, `whenClose?`, `whenWrong`, …

**Rules**
- Rows start shuffled and never in the answer order.
- To reorder: drag a row, or use the ↑/↓ buttons (36 px, with tooltips). The first use shows a gesture hint.
- Scoring on "Submit rank":
  - Exact order → **best**.
  - With `whenClose`, at least n−2 rows in place → **acceptable**.
  - Otherwise **wrong**.
- Directed levels clamp labels to 3 lines.

#### `pick`: SELECT MULTIPLE (and MESSAGE + SELECT MULTIPLE)

**Fields:** `question`, `pick` (N), `cards[{label, role: pick|leave|harmful}]`, `whenRight`, `whenWrong`, `whenHarmful?`, `timer?`, `chatWith?`.

**Rules**
- Toggle up to N cards. At the cap, the rest are disabled. Submit works only at exactly N.
- Scoring:
  - Any harmful card → **risky**.
  - Exactly the N "pick" cards → **best**.
  - Otherwise **wrong**.
- With `chatWith`, the picks build the student's message in a chat composer, and the button reads Send.
- Timeout submits the current picks.

#### `bucket`: a two-way sort

**Fields:** `question`, `buckets[2]`, `items[{label, into: 0|1}]`, `whenRight`, `whenWrong`, …

**Rules**
- One item at a time. Number keys 1 and 2 also sort.
- Each pick flashes: 420 ms if right, 900 ms if wrong.
- Pass at `ceil(0.75 × n)` → **best**.

### 3.3 Review, feedback and outcome

#### `review`: FinalReview

**Fields:** `title`, `body`, `pending?`, `deciding?`, `decidingNote?`.

**Rules on a directed level**
1. A ring counts from 0 to the reputation over 2.6 s.
2. A 450 ms pause, then the button.
3. If `deciding` is set, a 2.6 s pulsing hold with that line follows: SOP 3's "Decision Processing: 2 to 3 s suspense".
4. Reduced motion skips all of it.

**Body.** If the body has 3 or more lines ending in "✓", it renders as a ticked checklist.

**Advancing** goes to the ending and clears the save.

#### Feedback (the StrongMove screen)

The player draws it after every scored beat. It shows:
- the tier headline: "Strong move!", "That works.", "Not quite." or "Risky call.", or `bestHeadline` on a best answer;
- the reputation delta, with points flying into the gauge on a directed level;
- the chosen answer's `why`;
- the `skills` as tappable chips that explain each skill;
- the `feedbackCta` button;
- on directed levels, the beat's `reactor` (or the speaker) on stage, wearing the expression for that tier.

**Colour:** good answers use the success colour. Otherwise it is red if the delta is −6 or worse, amber if not.

#### Outcome (LevelOutcome, SOP 3 §38 and §39)

**Choosing the ending.** `Level.endings[]`, each with `min`, `headline`, `message`, `subline`, `primary`, `advances`, and the optional `kicker`, `unlock`, `hideReputation`, `scoreNote` (one line under that outcome in the tappable score panel) and `offer`. The ending with the highest `min` that is ≤ reputation wins.

**The standard set**

| `min` | System outcome | Student-facing headline |
|---|---|---|
| 85 | ADVANCE | Career-specific, e.g. "Bag Secured" |
| 40 | RETRY | e.g. "Not yet." |
| 0 | TERMINATED | "Terminated" |

**Advancing**
- The button reads "Unlock Level N · role".
- If the ending has an `offer`: the offer letter (OfferSheet), then "Accept Offer".
- Then the Connect interstitial, then the next level.
- Celebration: promotion music, fanfare, ticker-tape confetti in the world palette, and a local burst.

**Not advancing**
- "Fix your N misses": a repair round in which a best answer banks only as acceptable. Hidden by `noRepair`.
- Plus the `primary` replay button.

### 3.4 Shell pieces (always core)

| Piece | Rules |
|---|---|
| `Hud` | Home, back, start over, help (?), music and mute. Title + "Level N · role". The reputation gauge. A SparkBar showing **reputation**, plus one dot per scored beat (big dots at act boundaries). |
| `ScoreGauge` | A 0 to 100 ring in the world accent, with count-up and a delta float. |
| `TappableScore` (Express) | The gauge as a button. The outcomes list is built from the level's own `endings` (fixed 9 Oct 2026; it used to hard-code IB's labels). |
| `Clock` / `DrainBar` | The countdown. Clock on normal levels, a slanted DrainBar on cinematic ones. Both turn red and pulse under 34%. Silent by design. |
| `DialogueBox` | Three voices: character, narrator and system. Typewriter, tap to finish, voice blips pitched per character. A slanted name plate on cinematic levels. |
| `AmbientBackdrop` | The drifting mood gradient, used when a beat has no art. **This is the core scene fallback.** |
| `PreGameFlow` | Optional. Start card → How to Play (3 generic screens) → mini lesson → hand-off line. Never a gate. |
| `PerformancePlanFlow` | The three-strikes plan: warning → 3 two-option steps → pass or terminate. **Fires only if the career has its own plan in `performance-plan.ts`** (see §4.3). |
| `ConnectInterstitial` | A between-level prompt that matches the career's world. |

---

## 4. Global rules and logic (one config, never per screen: SOP 3 §17)

### 4.1 Reputation

**Start and limits** (`scoring.ts`)
- Starts at 50 (`START_REPUTATION`) and is clamped to 0 to 100.
- Advance at 85 (`ADVANCE_AT`).
- Midpoint "on track" at 68 (`review.threshold`).

**Base tier values:** best +5, acceptable +2, wrong −5, risky −6 (`TIER_SCORE`, types.ts).

**The delta per beat**, in order of precedence:
1. If the beat has `points`: `round(TIER_SCORE[tier] × beat.points / 5)`. This is a script's own per-decision weight, for example AMT's +8, +10, +12, +15.
2. Else, if the level has `points`: `round(TIER_SCORE[tier] × level.points / 5)`. IB uses 6, matching SOP 3's "typical strong +6".
3. Else: `round(TIER_SCORE[tier] × 10 / scoredBeatCount)`, so a perfect run lands on 100 whatever the number of beats.

**How reputation is stored.** It is **derived**, not accumulated: each beat's tier is banked by beat id, and reputation is recomputed from all of them. That makes replay, repair and resume safe.

### 4.2 Bands

Bands are only shown on levels without `hideBand`:

| Band | Range |
|---|---|
| Trusted | 85+ |
| Respected | 60 to 84 |
| Cautious | 40 to 59 |
| At Risk | 0 to 39 |

New careers should set `hideBand`, so the outcome carries the meaning (SOP 3 §39).

### 4.3 Strikes and the Performance Plan

**Strikes**
- A wrong answer is 1 strike; a risky one is 2.
- At 3 strikes, the Performance Plan fires, once per level. It pre-empts that beat's feedback.

**The plan's outcome**
- **Pass:** reputation is reset to exactly 50, strikes return to 0, and play resumes on the next beat.
- **Fail:** the run restarts from beat 0.

**Turning it off**
- `noStrikes: true` turns it off. All three live Level 1s set it, because the v2 scripts have no plan.
- **New rule (9 Oct 2026):** a career with no plan of its own in `performance-plan.ts` never fires one. It used to fall back to Investment Banking's plan, which would have shown Cobalt Capital's copy in every new career.

### 4.4 Timers

**Who owns the timer.** `BeatStage` owns it. It runs only while the beat is revealed, unpaused and unlocked.

**What a timeout does, by kind**

| Kind | On timeout |
|---|---|
| `choice` | wrong |
| `slider` | wrong |
| `rapid` | finishes with the right count so far |
| `flags` | submits what is marked |
| `pick` | submits the current picks |

**Music.** It gets a low-pass filter while a timer runs: tension without a ticking sound.

**Time types (SOP 3 §20 to §22)**
- **Real UI timer:** `timer`.
- **Story time and narrative countdowns:** copy (`facts`, `title`).
- The desk-clock instrument that showed a running countdown is bespoke (§6). Write the deadline as a `facts` tile instead, and show it once (SOP 3 §21).

### 4.5 Progress and saves (SOP 3 §24 and §27)

- **Progress is separate from reputation.**
  - The HUD shows one dot per scored beat.
  - `sectionAfter` relabels the HUD after the checkpoint.
  - The beat-level `progress` field is authored in some levels but never read; don't generate it.
- **Autosave:**
  - Saved to localStorage `dreamari-play-progress`, keyed `game:slot`, on every advance.
  - Resume returns to the right next screen.
  - A checkpoint saves one beat ahead.
- **Demo only:** `?screen=<beatId>` opens a clean run on that beat (QA only; remove for production with the other `qaSkip` shortcuts).

### 4.6 Express mode

**How it is built.** `?mode=express` plays the level minus the beats listed in `expressCut`. Every scored beat, threshold and ending stays the same.

**What replaces the cut teaching**
- Terms from `flips` become tappable underlined words.
- Cast names open their intro card.

**Its own state.** Express has its own save slot (n+100) and uses TappableScore.

### 4.7 Audio (SOP 3 §36)

All sounds are generated in WebAudio; there are no audio files. The mute setting is stored in `dreamari-play-muted`.

| Cue | When |
|---|---|
| select | Tile or button tap |
| correct / wrong | The answer's tier |
| sweep | Board clear, act card, celebration, checkpoint pass |
| fanfare | Advancing ending |
| flip | Flips / focus card turn |
| voice blip | Character typing (pitch per character) |
| scene change / character enter / focus moment | Backdrop swap, sprite enters, an interactive screen takes over |

There are two music tracks: "main", and "promotion" on an advancing ending.

### 4.8 Analytics (SOP 3 §40 to §42)

Today the player logs only `play` and `finish` (`logActivity`). Joshua's event families (`decision_submitted`, `checkpoint_reached`, `final_reputation`, …) are **not built**.

The cleanest place to add them:
- in `SimulationPlayer`'s resolve handler, which already has the beat id, tier, chosen option id and reputation before and after;
- and in its advance / ending transitions.

Use the beat `id` as the Decision ID. It is permanent and survives reordering (SOP 3 §41).

---

## 5. Data contract for a generated career

### 5.1 Allowed fields (the core kit whitelist)

**Level**
- `id`, `n`, `role`, `title`, `blurb`, `cover`, `mood`, `cast`, `beats`, `endings`.
- `hideBand`, `directed`, `cinematic`, `worldTheme`, `points`.
- `place`, `sectionAfter`, `preGame`, `noRepair`, `noStrikes`, `plainEndings`, `quietQuestions`, `saveSlot`.
- `expressCut`, `scoreTip`, `scoreOutcomes` (only to override the score panel's rows; by default they come from `endings`).

**Every beat (BeatBase)**
- `id`, `art`, `artAlt`, `verdictInRoom`, `resetScene`, `pose`, `mood`.
- `speaker`, `speakerRole`, `castMember`, `castMembers`, `castFront`, `castScale`, `castPose`, `reactor`.
- `tone`, `setup`, `planLineIfFailed`, `practice`, `keepScene`, `center`, `inlineSetup`, `noVerdict`, `pivotal`, `introduce`.
- `points`, `promptStyle`, `bestHeadline`, `prompt`.

**Kinds**
- **Teaching:** `card`, `check`, `flips`, `focus`, `reveal`.
- **Scored:** `choice` (layouts `options`, `blank`, `tiles`, `document`, `boss`, `chat`), `match`, `rapid`, `chain`, `slider`, `flags`, `rank`, `pick`, `bucket`.
- **Final:** `review`.

**Kind fields.** All fields in §3, except those listed in §5.2.

### 5.2 Forbidden in generated content (bespoke)

| Field or kind | Why it does not scale | Write this instead |
|---|---|---|
| `kind: "inspect"` | A photo with hand-placed hotspot coordinates | A practice inspection becomes `reveal` (each spot taps open to its note; issues in red). A scored one becomes `flags` (one "Part: finding" row per hotspot, issues flagged) |
| `kind: "torque"` | A one-career hand-drawn instrument with its own sounds | `slider`: Under / At the mark / Over |
| `world` (any kind: monitor, clock, lights, record, sheet, inbox, wristband, elevator, badge, foam) | Hand-drawn domain instruments (the ECG only makes sense in health, the elevator only in an office tower) | Put the numbers in a card's `facts`. For foam, use `reveal` |
| `board` | The airport split-flap board | A plain title |
| `briefing` | The airport status board | `taskCard` + `taskCardTitle: "Briefing"` |
| `opsChat.radio`, `chatWith.radio` | The ramp-radio header | Leave `radio` out (a normal chat header) |
| `docStyle`, `marks` | The hospital chart and pitch slide papers, with red-pen circles | Plain `document` layout |
| `layout: "zones"`, `layout: "move"` | One-off IB drag designs with IB-specific icons | `options` + `dragEnabled` |
| `artFrame` | A camera push-in on hand-measured image coordinates | Nothing (the art shows static) |
| `exampleSteps` | A finance-only icon set | `example` (a paragraph) |
| `review.style: "logbook"` | The AMT logbook page and signature | Leave `style` out (a ticked checklist) |
| `Simulation.trailer` with per-career art plates | Hand-picked art per card | Optional. A trailer card with no art plays on black, which is core |

**What the player still adds on cinematic levels.** It draws two bespoke celebrations itself: the firm's foil `CareerSeal` and the ECG / takeoff / market `EndingBackdrop`. Under `coreKit` both are skipped, in favour of the icon tile and a burst.

### 5.3 The machine check

```ts
import { bespokeIn, toCoreLevel } from "@/components/play/coreKit";

const problems = bespokeIn(level); // [{ beat: "AMT-18c", field: "world" }, ...]
if (problems.length) {
  // Either reject the generated level, or auto-convert:
  level = toCoreLevel(level);
}
```

`toCoreLevel` keeps every beat id, so saves and links survive. It also never drops copy; it only re-dresses it. Run the conversion in the generator, not at runtime, so the shipped data is plain.

### 5.4 Writing rules that make data scale (from the bugs we hit)

- **Never rely on a component default for a name, place, time or firm.** Always write `chatWith.name` / `role`, `doc`, `speaker` and `speakerRole`. Several components used to default to IB's Christina, "Client files" or "Today 3:04 PM". Those defaults are now neutral, but explicit data is the contract.
- **Endings carry the career's success word** (`headline`). Nothing else in the UI hard-codes "Bag secured".
- **Copy rules:** 8th-grade reading level, no em dashes, one idea per sentence, each fact said once (SOP 3 §48 redundancy check).
- **All answers fit on screen without scrolling** (SOP 3 §14). Use 2 to 4 options of at most about 90 characters each.
- **`skills`** come from `SKILL_MEANING` (so the chips can explain themselves). Add a new skill there before using it.

---

## 6. The bespoke catalogue (demo games only)

These stay in the three demo games. They are flagged **Bespoke** in `/component-lab`, each beside its core fallback.

| Bespoke piece | File | Used in | Core fallback |
|---|---|---|---|
| VitalsMonitor (ECG) | `WorldUi.tsx` | RN | `facts`: Patient: Stable / Getting worse |
| DeskClock (live clock) | `WorldUi.tsx` | IB | `facts`: Due: 6:00 PM |
| LightsBoard (call lights) | `WorldUi.tsx` | RN | Plain `rank` |
| RecordSheet | `WorldUi.tsx` | RN | Nothing; the copy carries it |
| ReportSheet (night report) | `WorldUi.tsx` | RN | Plain `pick` list |
| InboxHeader, Wristband | `WorldUi.tsx` | IB, RN | Plain `rapid` |
| Elevator | `WorldUi.tsx` | IB | Plain act card |
| IdBadge | `WorldUi.tsx` | IB, RN | Plain intro card |
| ShadowBoard (toolbox foam) | `ShadowBoard.tsx` | AMT | `reveal`: the missing tool, then the rest |
| TorqueBody (torque wrench) | `TorqueBody.tsx` | AMT v2 lab | `slider` |
| InspectBody (photo hotspots) | `interactions.tsx` | AMT | `reveal` (practice) or `flags` (scored) |
| HeroCamera (push-in + reticle) | `HeroCamera.tsx` | AMT | Static art |
| DepartureBoard, Briefing (split-flap) | `interactions.tsx` | AMT | Plain title; `taskCard` "Briefing" |
| RadioHeader | `interactions.tsx` | AMT | Normal chat header |
| PaperChoice chart/slide + PenCircle marks | `interactions.tsx`, `WorldUi.tsx` | RN, IB | `document` |
| ZonesBody, MoveBody | `interactions.tsx` | IB | `options` + `dragEnabled` |
| LogbookReview + Signature | `WorldUi.tsx` | AMT | Ticked checklist |
| CareerSeal (firm foil marks) | `Celebrations.tsx` | Cinematic endings | Icon tile |
| EndingBackdrop (ECG / takeoff / market) | `Celebrations.tsx` | Cinematic endings | Nothing |
| TrailerFlow art plates | `TrailerFlow.tsx` | IB, RN, AMT | A card with no art (on black) |

**Per-career art is not bespoke in this sense:** room plates, character sprites, expressions and hero scenes. It is produced by the automated art pipeline (chapters 08 to 10 and SOPs 4 to 7). If a career has no art yet, the player falls back to `AmbientBackdrop` with no characters, and the game is still fully playable.

---

## 7. Scaling a new career from scratch: the full path

| Step | Owner and source | Output | Check |
|---|---|---|---|
| 1. Script | Content (Joshua's SOP 1 + SOP 3 Master Screen Map, 26 fields) | Rows with Screen Type + Interaction + exact copy | SOP 3 QA view |
| 2. Map rows to beats | Generator (§2 table) | `src/components/play/<career>-level-1.ts` | `bespokeIn(level)` is empty; `npx tsc` passes |
| 3. Scoring config | Generator (SOP 3 §16 and §17 → §4 here) | `points`, `endings` (85 / 40 / 0), `review.threshold` 68 | Play it perfect: lands on 100. Play it all wrong: lands under 40 |
| 4. Register | Engineer | One entry in `games.ts`. A plan in `performance-plan.ts`, or `noStrikes` | `/play/<id>` loads |
| 5. Art | Art pipeline (SOP 2 + our SOPs 4 to 7, `npm run art:*`) | Manifest `art/<career>.json`, plates, sprites, expressions | `/play-tools/scene-review`, `npm run art:qa` |
| 6. Glossary | Chapter 04 templates | `glossary/data.ts` entry | `/play/glossary/<career>` |
| 7. QA | QA (SOP 3 §46 and §49) | Every beat via `?screen=<id>`; keyboard-only run; 375 px and 1440 px | `docs/CROSS_BROWSER_GUARDRAILS.md` self-check |

Before step 5 lands, a level with no art is playable and reviewable. Content and art can ship separately.

---

## 8. Using the component library as the spec

- Open `/component-lab#game` and set the toggle to **Core kit**. That is the full set of UI a generated career can use, each in its real states.
- **Bespoke** shows the demo-only pieces, each with a **Core fallback** line and a cell that renders the fallback from the same data.
- The **Full-screen preview** link on any specimen (`?solo=`) shows it alone, for screenshots and design review.
- `/play/<game>?kit=core` plays a whole live level on the core kit, the closest thing to a generated career today.

---

## 9. Corrections to chapters 01 to 03 (written against `2ff4bd5d`, 26 Sept)

Those chapters are still right on fundamentals. Where they disagree with this chapter, this chapter wins.

**Chapter 01 (data model)**
- **Kinds.** There are 17 kinds, not 15: `inspect` and `torque` were added. Both are bespoke.
- **Fields added since:**
  - On `BeatBase`: `verdictInRoom`, `artFrame`, `resetScene`, `castMembers`, `castScale`, `castPose`, `reactor`, `practice`, `keepScene`, `center`, `inlineSetup`, `noVerdict`, `pivotal`, `introduce`, `points`, `promptStyle`, `bestHeadline`.
  - On `card`: `board`, `opsChat`, `world`, `exampleSteps`, `review`, `bodyLarge`, `schedule`, `entrance`, `reactsTo`.
  - On `choice`: layouts `zones`, `move` and `chat`, plus `chatWith`, `world`, `docStyle`, `marks`, `gauge`, `taskCard`, `taskCardTitle` and `briefing`.
  - On `review`: `style`, `pending`, `deciding`.
  - On `Ending`: `kicker`, `unlock`, `hideReputation`, `offer`.
  - Level flags: `directed`, `cinematic`, `coreKit`, `points`, `scoreTip`, `saveSlot`, `place`, `sectionAfter`, `preGame`, `noRepair`, `noStrikes`, `worldTheme`, `plainEndings`, `quietQuestions`, `qaSkip`.
- **The delta formula** in §3.1 ignores `practice` and `points`. Use §4.1 here.
- **The live Level 1s** are `ib-level-1-v2.ts`, `rn-level-1-v2.ts` and `amt-level-1.ts`. They are registered in `games.ts` with the v1 Express cut.

**Chapter 02 (player)**
- **Missing layers:**
  - The whole `directed` and `cinematic` layer (§1 and §3 here).
  - PreGameFlow, OfferSheet, CheckpointReview, the review's suspense and deciding hold, ScoreFlight, DrainBar, the name plate, IntroSplash and HeroCamera.
  - TickerTapeStorm, Balloons, CareerSeal and EndingBackdrop.
- **Missing flags and shortcuts:** `noStrikes`, `noRepair`, `plainEndings`, `?screen=`, `?v=2`, `?kit=core`, and the checkpoint's save-ahead.
- **The Performance Plan** no longer falls back to IB's (§4.3).

**Chapter 03 (interactions)**
- `inspect` and `torque`; the zones / move / chat / drag differences; and BriefedChoice, DepartureBoard, OpsChat, TaskCard, LimitGauge, PaperChoice, ReplyBubble and the world panels. All of these are covered in §3 and §6 here.
- **Hold times:** 950 ms on a miss on directed levels.
- **Typing speeds:** speech 24 ms, narration 16 ms, system instant.

**README key numbers:** use §4 here.

---

## 10. Fixes made on 9 Oct 2026 while writing this

**Why.** A core component must never carry another career's words, and the keyboard must reach everything.

**Keyboard and timers**
- The right-arrow key now advances dialogue and feedback. The code listened for "ChevronRight", which is not a real key name.
- Number keys no longer skip the Submit or Send step on zones, move, chat and briefing layouts.
- Zones' number keys now match the order shown on screen.
- Photo hotspots and the toolbox foam can now be reached and used with the keyboard. Pressing Enter on a tool no longer also presses the card's own button.
- A slider's timer now resolves as a timeout.
- The boss box has its own number keys (it is drawn outside the choice body and had none).

**Hard-coded career copy, now data or neutral**
- Zones card label "Client files", plus the zone and move icons.
- The chat default "Christina", and the "Today 3:04 PM" timestamps.
- "Ramp channel".
- The chart's "19:00" and "Handover note".
- The finance-only example icons.
- The boss box's IB gold.
- The IB-specific timeout line.
- TappableScore's "Bag secured / Retry / Terminated".
- The ticker tape's Cobalt foil.
- The pre-game hand-off line "Your internship starts now."
- Who stands in front in a two-person scene (it named Christina; now `castFront`, default the first listed).
- **The biggest one:** the Performance Plan's fallback to IB's plan.

The live games set the old strings explicitly in their own content, so they look exactly as before.

**Known, not fixed**
- `?screen=<beatId>` links that open straight onto a shuffled beat can log a hydration mismatch, because the shuffle nonce (`SHUFFLE_NONCE` in `interactions.tsx`) is rolled separately on the server and in the browser. Normal play never starts on a shuffled beat, so students never see it. It is a QA shortcut; remove it for production with the other `qaSkip` shortcuts, or seed the shuffle from the run instead.
- RN v1 (the Express source) keeps the old shared timeout line "Time ran out. In a real week, silence is its own answer." as explicit `timeoutWhy`, only so Express renders as before. Drop it if the line reads too corporate for nursing.
