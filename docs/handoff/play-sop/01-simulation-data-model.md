# Play SOP, chapter 1: Simulation data model and authoring contract

> Reference chapter of the Play SOP. Start at [README.md](README.md). This chapter was produced by a line-by-line read of the source at commit `2ff4bd5d` (26 Sept 2026); every `file:line` reference is against that commit, so re-check line numbers if the files have moved. Conventions: `UNCLEAR:` means the code alone does not settle it; `OBSERVED:` / `FINDING:` / `GAP:` / `BUG:` mark something a rebuild would get wrong by trusting comments or field names. All of them are collected, with a recommended decision, in [06-known-issues-and-decisions.md](06-known-issues-and-decisions.md).


Files read in full: `src/components/play/{types,games,ib-level-1,ib-level-2,ib-level-3,ib-level-1-express-legacy,rn-level-1,skills,scoring,progress,performance-plan,locations,art-ratios,expressions}.ts`, `src/app/play/[game]/page.tsx`, `src/app/play/page.tsx`, `src/components/play/SimulationPlayer.tsx` (all 2447 lines), `src/components/play/interactions.tsx` (logic for every body). Parts of `PlayHub.tsx`, `TrailerFlow.tsx`, `PerformancePlanFlow.tsx`, `music.ts`, `ConnectInterstitial.tsx`, `src/components/app/worlds.ts`, `docs/handoff/sprite-master-prompt.md` were read to explain runtime behavior.

Legend used below:
- **SP** = `src/components/play/SimulationPlayer.tsx`
- **IX** = `src/components/play/interactions.tsx`
- **T** = `src/components/play/types.ts`
- "UNCLEAR:" = something the code does not settle, or code and comments disagree.
- "FINDING:" = a code fact a re-implementer would get wrong if they trusted comments or field names.

---

## 0. Architecture in one paragraph

Every simulation is plain data: a `Simulation` (T:466) holds `Level[]` (T:407), each level holds a flat `Beat[]` (T:373, a 15-member discriminated union on `kind`) plus `Ending[]`. The route `/play/[game]` (`src/app/play/[game]/page.tsx`) picks the simulation and level, optionally derives an Express level, and mounts `SimulationPlayer` keyed on `level.id`. `SimulationPlayer` walks the beats by index. Each beat renders one body component from IX. Scored bodies report one `Tier` upward through `onResolve(tier, why, id?)` (IX:36). Reputation is DERIVED from a `beatId -> Tier` map (SP:132), never stored as a running total. Scene art is picked per beat by `sceneFor()` (SP:1002): fresh hero art first, then the beat's location from `BEAT_LOCATION` (locations.ts:223), then an ambient gradient. Character sprites come from `expressions.ts`. Progress autosaves to `localStorage["dreamari-play-progress"]` (progress.ts:11).

Header comment on the whole engine (T:1-4): "Every career simulation is DATA in this shape -- adding Level 2, or the other 24 careers, means writing beats, not components. The rules here are the ones on the Scoring Model and Interaction Rules tabs of the handoff, which all 25 careers share."

---

## 1. Every exported type in `types.ts`

### 1.1 `Tier` (T:9)

```ts
export type Tier = "best" | "acceptable" | "wrong" | "risky" | "none";
```
Doc (T:6-8): "Exactly one Best per scored beat, roughly one Risky per level. `none` is for rapid-fire children, which feed their set's result and carry no score of their own."

FINDING: no authored beat uses `none`. Rapid children are `{label, correct, why}` options, not tiered choices. `none` only exists in lookup tables (score 0, headline "", expression fallback).

FINDING: "Exactly one Best per scored beat" is violated by `L3-25` (ib-level-3.ts:492-517), which has two `tier: "best"` choices (a and b). The engine tolerates it: either scores Best.

### 1.2 `TIER_SCORE` (T:17-23)

| tier | points |
|---|---|
| best | +5 |
| acceptable | +2 |
| wrong | -5 |
| risky | -6 |
| none | 0 |

Comment (T:11-16): "Wrong moved from -3 to -5 (Scoring Model, REBUILT 20 Sept to binary scoring): symmetrical with Best, so ten scored beats at +-5 from a start of 50 give a clean 0-100 range with no rounding, and a level's final reputation always equals correct answers x 10. Acceptable/Risky stay defined (existing Level 2/3 content still authors them) but the new binary levels simply never assign either tier to a choice."

FINDING: `TIER_SCORE` is global. Level 2, Level 3 and RN Level 1 file headers still describe `-3` for wrong (ib-level-2.ts:7 "+5 / +2 / -3 / -6", ib-level-3.ts:5-6 same, rn-level-1.ts RN1-10 comment SP says "+5/-3 demo"), but at runtime every level uses wrong = -5. The HUD spotlight demo still animates `[0, 5, 0, -3, 0]` (SP:1398).

Consumed: SP:131 (`scoredValue`), SP:53 import.

### 1.3 `TIER_HEADLINE` (T:28-34)

| tier | headline |
|---|---|
| best | "Strong move!" |
| acceptable | "That works." |
| wrong | "Not quite." |
| risky | "Risky call." |
| none | "" |

Comment (T:25-27): "Headlines are DERIVED from the score, never authored per beat -- the handoff is explicit about this, so a writer cannot accidentally congratulate someone for a risky call." Consumed: FeedbackSheet headline, SP:2267.

### 1.4 `Choice` (T:36-43)

| field | type | req | runtime |
|---|---|---|---|
| `id` | string | yes | Identity for lock state (`locked === choice.id`, IX:917 etc.). Convention `"a"`,`"b"`,`"c"`... Also used as a React key. |
| `label` | string | yes | Option text. |
| `tier` | Tier | yes | Passed to `onResolve` on pick (IX:899, 921, 946, 1075, 1186, 1235). Colors the picked tile (`TIER_COLOR`). |
| `why` | string | yes | "Why THIS option" (T:40-41). This is the ONE sentence shown on the feedback card (`result.why`, SP:2275). |

Display order is shuffled per page-load and per beat id (IX:38-74); scoring reads tiers off objects, never positions.

### 1.5 `DreamyPose` (T:48)

`"happy" | "glasses" | "idea" | "curious" | "alert" | "nervous" | "party" | "puzzle" | "heart"`.

FINDING: dead in the simulation. Dreamy was removed (SP:1556-1561 "Dreamy is GONE from the simulation (Interaction Rules, D62)"). No beat authors `pose`, and no consumer reads `beat.pose` (grep).

### 1.6 `BeatBase` (T:50-105, not exported, but every beat has these)

| field | type | req | runtime behavior |
|---|---|---|---|
| `id` | string | yes | Unique within the SHARED `BEAT_LOCATION` map across ALL careers, so ids are career-prefixed (`L1-`, `L2-`, `L3-`, `L1E-`, `RN1-`). Keys: location lookup (locations.ts:415), score map (SP:287), save/resume, repair queue, `expressCut`, option shuffle seed (IX:893), `BeatStage` remount key (SP:667). |
| `prompt` | string | no | Action Prompt, the small grey line above the body (SP:1285-1293). Card and review never show one. If omitted, `DEFAULT_PROMPT(beat)` (SP:1236-1262) supplies one. An empty string `""` suppresses it (used on RN1-14 and L1E-13, because `"" ?? default` keeps `""`). |
| `spotlight` | `"score"` | no | While on screen, HUD `ScoreGauge` runs its debut flight + arrow + `[0,5,0,-3,0]` demo (SP:618, SP:1393-1554). Only effective when the level is NOT express and NOT `hideBand` (SP:2091-2095: those levels render `TappableScore`, which ignores `demo`). So on IB L1 Full (`hideBand: true`) the `L1-34` spotlight does nothing visible. |
| `art` | string | no | Hero illustration path. Sticky for up to `SCENE_FRESH_BEATS = 3` beats after the owning beat (SP:985, 1002-1017). |
| `artAlt` | string | no | Alt text for `art` (SP:1010). |
| `resetScene` | boolean | no | Stops `sceneFor`'s backward walk at this beat, so earlier hero art cannot bleed in (SP:1016). The beat falls to its own location. |
| `pose` | DreamyPose | no | Dead (see 1.5). |
| `mood` | Mood | no | Overrides `level.mood` for this beat (SP:417). Drives edge tint (SP:597-608) and ambient wash (SP:760-764). |
| `speaker` | string | no | `"Narrator"`, `"System"` and `"Dreamy"` are voiceless: no name, no portrait (SP:1092-1093). `"System"` gets the system box voice (squared, hairline, silent; SP:1099, 1766-1771). Any other value is a character: display font, voice blips at `VOICE_PITCH[speaker] ?? 500` (SP:1579-1590, 1693), face chip from `level.cast[speaker]` (SP:1094). Also: fallback for which sprite stands in the scene (SP:540), which expression shows on the feedback card (SP:2226 `expressionFor(beat.speaker, tier)`). |
| `castMember` | string | no | Who stands in a location scene when different from the speaker (SP:437, 540). Also the key for Express's character lexicon (SP:170). NOT used for the dialogue face chip or the feedback-card expression (both use `speaker`). |
| `castMembers` | string[] | no | Two+ people in one scene, story order, slot i = `characterAnchors[i]` (SP:518-536). Christina gets zIndex 2, everyone else 1 (SP:533). Only honored when the location has `characterAnchors` (only `l1-reception`). Otherwise the single-anchor branch runs with `castMember ?? speaker`. |
| `tone` | `"normal" \| "conflict" \| "alarm"` | no | Box edge color: alarm = `--destructive`, conflict = `--world-building-construction` (SP:1753-1761). conflict/alarm also make the pre-answer sprite use the `wrong` tier expression (concerned/uncertain) (SP:427-428, 924). |
| `setup` | string | no | On card/review: a static eyebrow label (`staticSetup`, SP:1216). On every other kind: a typed "held" line with its own Continue; the question and timer only appear after it (SP:248, 1100-1104, 1120). Once revealed, the line is hidden, not repeated (SP:1207-1211, rule from "Joshua Pierce, Slack, 6 Sept 2026"). A non-card beat with no setup opens already revealed. Express: character names and first-use flip terms in `setup` become tappable (SP:183-191). |
| `progress` | number 0..1 | no | Doc (T:94-96) says it is present only on the ten scored beats. FINDING: no runtime code reads `beat.progress` (grep). The HUD dots count `Object.keys(scores).length` (SP:133, 2103-2120). It is authoring metadata only. |
| `planLineIfFailed` | string | no | One sentence in the supervisor's voice. Captured as `triggerLine` when a wrong/risky answer on this beat lands the third strike (SP:280, 298), then substituted into `{PLAN_LINE}` in plan step 1 (PerformancePlanFlow.tsx:49). If missing, `""` is substituted. |

### 1.7 `Mood` (T:107)

`"day" | "night" | "crunch"`. Level default plus per-beat override. Visuals: night = navy edge gradient `#071033/#061029/#04081f`; crunch = maroon `#4a0d1c/#3a0a16/#2a0710` (SP:602-606). Ambient wash day `#3452e6,#7c5cff`, night `#1c3f9e,#4b3ba8`, crunch `#a8123a,#7a1650` (SP:760-764). Comment T:74-76: "Level 2 runs three screens in late-night navy and comes back to day; Level 3 has a maroon Crunch Time stretch. The two are different on purpose."

### 1.8 Beat kinds (the `Beat` union, T:373-388)

`SCORED_KINDS` (SP:77) = `choice, match, rapid, chain, slider, flags, rank, pick, bucket`. Unscored = `card, check, flips, reveal, review, focus`. Only scored kinds call `onResolve`, and only they count toward `scoreScale` (SP:127-130).

For each kind: fields beyond BeatBase, runtime, then a real example.

---

#### 1.8.1 `CardBeat` (`kind: "card"`, T:112-159), UNSCORED

| field | type | req | runtime |
|---|---|---|---|
| `variant` | `"intro" \| "character" \| "chapter" \| "offer" \| "step" \| "act"` | yes | Only `"act"` renders differently (IX:237-264) and `"character"` feeds the Express lexicon (SP:170). `intro/chapter/offer/step` share one layout (IX:265-333); their differences come only from which optional fields are set. |
| `title` | string | yes | Headline (`Question` tier). On `act`: small uppercase eyebrow in accent color (IX:241). |
| `body` | string | no | Muted paragraph. On `act`: the big line (IX:242). |
| `example` | string | no | Grey "EXAMPLE" box (IX:294-304). |
| `showBands` | boolean | no | Renders `BandLadder`: the four BANDS as a static reference table (IX:319, 341-354). No authored beat uses it. |
| `facts` | `{label, value}[]` | no | Tile grid, FIXED `grid-cols-3` (IX:306). Author exactly 3. |
| `step` | `{at, of}` | no | "Step {at} of {of}" plus dots (IX:268-281). |
| `note` | string | no | Bold aside. FINDING: color is hardcoded `var(--world-business-money-office)` (IX:316), not "the level's accent" as T:127 says. |
| `auto` | boolean | no | `act` only: plays sweep, calls `onNext` after 1400 ms, no button (IX:230-236). |
| `secondaryCta` | string | no | `act` only: renders primary `cta` button plus a quiet `<a href={secondaryHref ?? "/play"}>` (IX:243-260). FINDING: an `act` card with neither `auto` nor `secondaryCta` renders NO button at all (IX:243 only renders buttons when `secondaryCta` is set); it can only be advanced by keyboard (space/enter via DialogueBox `onPrimary`, SP:1744-1747). |
| `secondaryHref` | string | no | Defaults to `/play`. |
| `ladder` | `{label, lit}[]` | no | `PowerLadder` diagram. Authored bottom-to-top, rendered top-down (IX:366-408). A lit rung whose label starts with "You" gets a "You" tag (IX:398). Rule (T:143-148): rungs always "Name - Role", only rungs the student has met. |
| `system` | boolean | no | Centers the card on screen (SP:1164). Note: the "system" VOICE comes from `speaker: "System"`, not this flag. |
| `celebrate` | boolean | no | Burst + sweep sound + larger title (IX:223-225, 267, 284) + gold box edge (SP:1214, 1753-1754). Rule T:154-157 (Joshua Pierce, Slack, 6 Sept 2026). |
| `cta` | string | yes | Primary button label (IX:329). |

Real examples:

```ts
// intro + celebrate (ib-level-1.ts:56-65)
{ kind: "card", variant: "intro", id: "L1-01", speaker: "Narrator", setup: "Intern • Week 1",
  title: "Welcome to Investment Banking. Your internship at Cobalt Capital starts today. Your first day begins now.",
  celebrate: true, cta: "Continue" },

// intro + system + example (ib-level-1.ts:86-94)
{ kind: "card", variant: "intro", id: "L1-04", system: true, speaker: "System", title: "Here is an example.",
  example: "A big sneaker company wants to open 100 new stores but does not have enough money. An investment bank helps find investors and arrange the deal so the company can expand.",
  cta: "Continue" },

// character card 1 of 2 (rn-level-1.ts:131-140)
{ kind: "card", variant: "character", id: "RN1-06", speaker: "Narrator", castMember: "Rosa", setup: "Rosa • Staff Nurse",
  title: "Rosa is a Staff Nurse, the nurse you work beside all year, and she’ll be giving you direction on every shift.", cta: "Continue" },

// character card 2 of 2, POWER card with ladder (rn-level-1.ts:141-155)
{ kind: "card", variant: "character", id: "RN1-07", speaker: "Narrator", castMember: "Rosa", setup: "Rosa • Staff Nurse",
  title: "Rosa decides which patients you take. What she thinks of you reaches her manager before you do.",
  ladder: [ { label: "You - New Graduate Nurse", lit: true }, { label: "Rosa - Staff Nurse", lit: true }, { label: "Denise - Nurse Manager", lit: false } ],
  cta: "Continue" },

// act, auto (ib-level-1.ts:242-253)
{ kind: "card", variant: "act", id: "L1-ACT1", auto: true, speaker: "System", title: "Foundation Complete", body: "You know the basics.", cta: "Continue" },

// act, checkpoint (ib-level-1.ts:420-433)
{ kind: "card", variant: "act", id: "L1-CHECK", speaker: "System", title: "Client Ready",
  body: "You passed your first major test. Checkpoint saved.", cta: "Continue Internship", secondaryCta: "Finish Later", secondaryHref: "/play" },

// chapter (ib-level-1.ts:562-575)
{ kind: "card", variant: "chapter", id: "L1-35", speaker: "Christina", castMember: "Christina", resetScene: true,
  title: "Your internship is complete.", body: '"Nine weeks. However this lands, you did the work." Now it is time for your final review.', cta: "Begin Final Review" },

// offer (none in IB L1 or RN L1; from ib-level-2.ts:52-68)
{ kind: "card", variant: "offer", id: "L2-01", art: `${ART}/l2-02.webp`, artAlt: "A first-year analyst's desk at Cobalt Capital, city windows behind.",
  speaker: "Narrator", setup: "Your offer", title: "Cobalt Capital, Investment Banking Analyst.",
  facts: [ { label: "Position", value: "Analyst · Year 1" }, { label: "Salary", value: "$110,000 + bonus" }, { label: "Hours", value: "80-90 / week" } ],
  body: "Standard for the industry. Long days early on, and the hours ease as you move up.", cta: "Accept Offer" },

// step (none in IB L1 or RN L1; from ib-level-2.ts:69-82)
{ kind: "card", variant: "step", id: "L2-02", resetScene: true, speaker: "Cobalt HR", step: { at: 1, of: 5 },
  setup: '"Interns prove they can learn. Analysts prove they can be trusted."', title: "Research the client.",
  body: "Learn what the company wants and why it matters.", cta: "Continue" },
```

#### 1.8.2 `CheckBeat` (`kind: "check"`, T:167-180), UNSCORED, never a strike

| field | type | req | runtime |
|---|---|---|---|
| `method` | `"tap" \| "type" \| "drag"` | yes | IX:481-618. |
| `question` | string | yes | Heading. |
| `options` | `{label, correct, why}[]` | tap/drag | Exactly one `correct: true`. A wrong tap/drop shakes for 460 ms and stays open (IX:440-444). Only the correct option's `why` is ever shown (IX:431). |
| `answer` | string | type | Compared `trim().toLowerCase()` (IX:452). An all-digit answer switches the keyboard to `inputMode="numeric"` (IX:521). |
| `whyRight` | string | type | Shown after solving (IX:431, 622-625). |
| `hint` | string | type | Fades in after `tries >= 2` wrong entries (IX:529). |
| `cta` | string | yes | Continue button, shown only once solved (IX:620-636). |

Rule (T:161-166): "Unlimited tries, cannot skip, never a strike... `tap` when the answer is a concept, `type` when it is a number or exact word the student must carry forward (recall, not recognition), `drag` when the answer should cost a deliberate second". Drag cards are always tappable too (IX:585-593).

```ts
// drag (rn-level-1.ts:108-124)
{ kind: "check", method: "drag", id: "RN1-05", speaker: "System", setup: "Quick check before you start.",
  question: "A patient starts breathing badly at 2 AM. Who notices first?",
  prompt: "Drag the blue dot to the answer, or tap the answer.",
  options: [
    { label: "The nurse at the bedside", correct: true, why: "Right. The nurse is the one in the room." },
    { label: "The head of the hospital", correct: false, why: "Not this one. Try again." },
    { label: "The person who books appointments", correct: false, why: "Not this one. Try again." },
  ], cta: "Continue" },

// type (rn-level-1.ts:212-225)
{ kind: "check", method: "type", id: "RN1-11", speaker: "System", setup: "Quick check. Type the number, then press enter.",
  question: "What's the minimum amount of points you need to move up to the next level?", answer: "85",
  whyRight: "Right. 85 and above moves you up. Anything less and you play the year again.",
  hint: "At Risk under 40 · Cautious 40 to 59 · Respected 60 to 84 · Trusted 85 and above", cta: "Continue" },
```
`method: "tap"`: no authored example in any level file. Shape is the same as drag (`options` required).

#### 1.8.3 `FlipsBeat` (`kind: "flips"`, T:186-191), UNSCORED

Fields: `title: string`, `cards: {term, def}[]`, `cta: string`. One word per card, term and definition on the same face (no flip-to-reveal, "per direct feedback", T:183-184). Tap to page; Continue only after the last word (IX:723-815). In Express, flips cards become the tappable term lexicon (SP:176-181); a term is underlined only in the FIRST beat whose `setup` contains it as a whole word (SP:186-191).

```ts
// rn-level-1.ts:228-245
{ kind: "flips", id: "RN1-12", speaker: "Rosa", setup: '"Four words you will hear before lunch."',
  title: "Learn them now and the rest of the day makes sense.", prompt: "Tap the card for the next word.",
  cards: [
    { term: "Vitals", def: "The basic body numbers, like heart rate and temperature" },
    { term: "Chart", def: "The patient record, where everything gets written down" },
    { term: "Report", def: "The handover, when one nurse tells the next what happened" },
    { term: "Escalate", def: "Tell someone more senior, straight away" },
  ], cta: "Continue" },
```

#### 1.8.4 `RevealBeat` (`kind: "reveal"`, T:196-203), UNSCORED

Fields: `title: string`; `rows: {label, reveal, color?: "red"|"amber"|"green"}[]`; `note?: string` (static line under the rows, never a row); `cta: string`. Continue appears only when every row is opened (IX:649, 701). Row tint: red `--destructive`, amber `--world-business-money-office`, green `--color-feedback-success`, none `--accent-subtle` (IX:650-661).

```ts
// skills explainer (ib-level-1.ts:150-162)
{ kind: "reveal", id: "L1-09", speaker: "System",
  title: "You are building real career skills. Every decision in this game practices skills investment bankers use in real life.",
  prompt: "Tap any skill tag to see what it means.",
  rows: [ { label: "Decision-Making", reveal: "Compare options and make thoughtful choices." },
          { label: "Active Learning", reveal: "Learn from new information and apply it." } ],
  note: "2 of 15 career skills. After each decision, we show you which skill you practiced.", cta: "Continue" },

// score explainer with spotlight + colors (rn-level-1.ts:195-211)
{ kind: "reveal", id: "RN1-10", speaker: "System", spotlight: "score", setup: "That number in the corner just moved.",
  title: "Your reputation decides if you move up, repeat the year, or lose the job.",
  prompt: "Tap each outcome to reveal its score.",
  rows: [ { label: "You lose the job", reveal: "under 40 · At Risk", color: "red" },
          { label: "No move up, start the year over", reveal: "40 to 84 · Cautious", color: "amber" },
          { label: "Promoted to Staff Nurse", reveal: "85 and above · Trusted", color: "green" } ],
  cta: "Continue" },
```

#### 1.8.5 `ChoiceBeat` (`kind: "choice"`, T:208-229), SCORED

| field | type | req | runtime |
|---|---|---|---|
| `layout` | `"options" \| "blank" \| "tiles" \| "document" \| "boss"` | yes | `options` -> OptionButton list (IX:907-926), or `DragOptionsBody` if `dragEnabled` (IX:906). `blank` AND `tiles` -> identical `BlankBody` (IX:904): the question is split on `"___"` and a dashed slot is drawn; tiles drag or tap into it (IX:1050-1164). `document` -> `DocumentBody`, a window titled `beat.doc ?? "Document"` (IX:1167-1209). `boss` -> `BossOverlay` inside a gold DialogueBox (SP:1199-1202, IX:1213-1241). |
| `question` | string | yes | Heading. For blank/tiles must contain `___` (FINDING: `L3-25` is `tiles` with no `___`; the split yields `[whole, undefined]` so the slot renders after the text). |
| `choices` | Choice[] | yes | See 1.4. |
| `feedback` | string | yes | FINDING: never displayed (D55, SP:2216-2219). IB L1/RN author `""`. |
| `feedbackCta` | string | yes | Feedback card button label (SP:2223, 2314). |
| `skills` | string[] | yes | Chips on the feedback card, each tappable to show `SKILL_MEANING[skill]` (SP:2277-2306). Convention: exactly 2. |
| `timer` | number (s) | no | Clock starts only after reveal (SP:1120). At 0: resolves `"wrong"` with why `"Time ran out. In a real week, silence is its own answer."` and locks the first `wrong`-tier choice (or `choices[0]`) (SP:1130-1133). Never risky (T:216-217). Default prompt becomes "Tap one before the timer runs out." (SP:1242). |
| `doc` | string | no | Document window header (T:219-220). |
| `dragEnabled` | boolean | no | `options` layout only. Token dragged onto a card; every card stays tappable. A wrong drop still COMMITS (one attempt), shake plus commit (IX:956-967). |

Default prompts (SP:1238-1242): blank/tiles "Drag or tap the right word into the space."; document "Tap the line with the mistake."; boss "Choose one."; options "Tap one." or the timer variant. Number keys 1..n pick (IX:903), except boss (BossOverlay has no `useDigitKeys`).

```ts
// options + dragEnabled, the deliberate easy win (ib-level-1.ts:104-124)
{ kind: "choice", layout: "options", dragEnabled: true, id: "L1-06",
  planLineIfFailed: "you could not yet say what an investment bank is for", progress: 0.1, speaker: "System",
  setup: "Quick check before you start.",
  question: "A shoe company wants to buy a smaller shoe company. Who helps organize the deal?",
  choices: [
    { id: "a", label: "An investment bank", tier: "best", why: "Right. That is the whole job in one sentence: banks help companies buy and sell other companies." },
    { id: "b", label: "A shoe designer", tier: "wrong", why: "A shoe designer makes the shoes. Nobody is asking them to arrange a sale." },
    { id: "c", label: "A delivery company", tier: "wrong", why: "A delivery company moves the boxes. Buying a company is a different problem." },
  ], feedback: "", feedbackCta: "Continue", skills: ["Reading Comprehension", "Active Learning"] },

// blank (ib-level-1.ts:222-241)
{ kind: "choice", layout: "blank", id: "L1-16", planLineIfFailed: "you could not yet use the words the desk uses", progress: 0.3,
  speaker: "System", setup: "One quick check on the four words.",
  question: "Christina asks for the ___ by EOD. She wants the slides.",
  choices: [
    { id: "a", label: "deck", tier: "best", why: "Right. Deck means the slides. EOD means she wants them today." },
    { id: "b", label: "comps", tier: "wrong", why: "Comps are the list of similar companies, not the slides." },
    { id: "c", label: "model", tier: "wrong", why: "The model is the spreadsheet behind the slides, not the slides themselves." },
  ], feedback: "", feedbackCta: "Continue", skills: ["Reading Comprehension", "Critical Thinking"] },

// blank with a risky option (rn-level-1.ts:368-388)
{ kind: "choice", layout: "blank", id: "RN1-17", planLineIfFailed: "you opened a patient record that was none of your business",
  progress: 0.6, speaker: "Rosa", setup: '"A patient record is private. The system logs every person who opens one."',
  question: "You may only open the record of a patient who is ___.", prompt: "Drag or tap the right words into the space.",
  choices: [
    { id: "a", label: "yours today", tier: "best", why: "Right. If they are not your patient, you have no reason to be in there." },
    { id: "b", label: "someone you know", tier: "risky", why: "Looking up someone you know is how nurses lose their licence. Every open is logged with your name." },
    { id: "c", label: "on your floor", tier: "wrong", why: "Same floor is not the same as your patient. The log does not care which corridor you are on." },
  ], feedback: "", feedbackCta: "Continue", skills: ["Active Learning", "Critical Thinking"] },

// document (ib-level-1.ts:379-399)
{ kind: "choice", layout: "document", doc: "Deal Summary • Intern Draft", id: "L1-24",
  planLineIfFailed: "you let a line with obvious errors go out to a client", progress: 0.6, speaker: "System",
  setup: "Review the summary and find the mistakes.", question: "Which line goes out wrong?",
  choices: [
    { id: "a", label: "The deal is worth nine billion dollers and closes on Febuary 31.", tier: "best", why: "Right. Dollers, Febuary, and February never has a 31st. Three errors in one line." },
    { id: "b", label: "Full deck by end of day.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
    { id: "c", label: "Client call Friday, 9 AM.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
    { id: "d", label: "The client's revenue grew by 8% last year.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
  ], feedback: "", feedbackCta: "Continue", skills: ["Reading Comprehension", "Critical Thinking"] },

// boss (ib-level-1.ts:400-419)
{ kind: "choice", layout: "boss", id: "L1-25",
  planLineIfFailed: "you did not build a relationship with anyone senior when the chance was in front of you", progress: 0.7,
  speaker: "Narrator", setup: "Marcus sent the deal email to the whole team. Your name is on it.", question: "What do you do?",
  choices: [
    { id: "a", label: "Send a short thank-you to the deal lead", tier: "best", why: "Right. One short note to one person. That is how people remember you without you asking them to." },
    { id: "b", label: "Assume everyone already knows what you did", tier: "wrong", why: "Nobody is keeping a list of what you did. Being quiet about good work is not the same as being humble." },
    { id: "c", label: "Reply all thanking everybody", tier: "wrong", why: "Reply all turns a thank-you into a performance. The whole team did not need the email." },
  ], feedback: "", feedbackCta: "Continue", skills: ["Social Awareness", "Verbal Communication"] },

// timed + alarm, the late-level urgent beat (rn-level-1.ts:480-502)
{ kind: "choice", layout: "options", id: "RN1-23", planLineIfFailed: "you saw a patient get worse and nobody heard about it in time",
  progress: 0.9, timer: 30, tone: "alarm", speaker: "Narrator",
  setup: "Your patient was fine an hour ago. Now she is confused and breathing fast. Rosa is with someone else.",
  question: "What do you do?", prompt: "Tap one before the timer runs out.",
  choices: [
    { id: "a", label: "Interrupt Rosa now", tier: "best", why: "Right. A sudden change is the one thing you interrupt anybody for." },
    { id: "b", label: "Ask another nurse nearby", tier: "acceptable", why: "Fine, and much faster than waiting. Rosa knows this patient and would still want to hear it." },
    { id: "c", label: "Check her again in ten minutes", tier: "wrong", why: "Ten minutes is a long time when someone is getting worse in front of you." },
    { id: "d", label: "Write it down and carry on", tier: "risky", why: "Writing it down is not telling anyone. Nobody reads a note in time." },
  ], feedback: "", feedbackCta: "See what happens next", skills: ["Problem-Solving", "Verbal Communication"] },
```
`tiles` example (ib-level-2.ts:247-266): `L2-13`, `question: "Profit means money a company keeps after paying ___."`, choices costs(best)/emails(wrong)/meetings(wrong)/rent(acceptable).

#### 1.8.6 `MatchBeat` (`kind: "match"`, T:233-243), SCORED

Fields: `question`, `pairs: {term, def}[]`, `whenRight`, `whenWrong`, `feedback` (not shown), `feedbackCta`, `skills`, `progress?` (redeclared, same as base). Runtime (IX:1259-1357): tap a tile in either column, then a tile in the other. Right pair flashes green and clears; wrong pair shakes and releases. When all pairs cleared: Best if no mistake ever happened, else Wrong (no partial credit). `why` = whenRight/whenWrong. Definitions are reordered by a deterministic formula `((def.length*7 + index*3) % 11)` (IX:1262-1269), not the page-load shuffle. Default prompt "Tap a quote, then tap its match." (SP:1244).

```ts
// rn-level-1.ts:246-268
{ kind: "match", id: "RN1-13", planLineIfFailed: "you could not follow a plain instruction from your own team", progress: 0.2,
  speaker: "Rosa", setup: '"I need four things from you, all at once."', question: "Match what she said to what you do.",
  prompt: "Tap a quote, then tap what you do.",
  pairs: [
    { term: '"Get her vitals."', def: "Check her heart rate and temperature" },
    { term: '"It is in the chart."', def: "Look in the patient record" },
    { term: '"Give me report."', def: "Tell her what happened on your shift" },
    { term: '"Escalate it."', def: "Tell someone more senior now" },
  ],
  whenRight: "Right. Four words, four things to actually go and do.",
  whenWrong: "Close. Vitals are numbers, the chart is the record, escalate means tell someone now.",
  feedback: "", feedbackCta: "Continue", skills: ["Reading Comprehension", "Active Learning"] },
```

#### 1.8.7 `RapidBeat` (`kind: "rapid"`, T:248-259), SCORED as ONE beat

Fields: `question: string` (FINDING: never rendered anywhere; RapidBody shows only `item.question`, IX:1487); `timer?` (one shared clock for the whole set; L2 has none, T:251); `items: {question, options: {label, correct, why}[]}[]`; `whenPass`; `whenFail`; `feedback` (not shown); `feedbackCta`; `skills`.

Runtime (IX:1407-1527): items in authored order, options shuffled per item. Each pick shows that option's `why` for 480 ms (hit) / 1150 ms (miss). Pass = `correct >= passThreshold(items.length)` = `ceil(n * 0.75)`: 4 items -> 3, 5 -> 4, 6 -> 5 (scoring.ts:61-63). Pass -> `best` + whenPass; fail -> `wrong` + whenFail. On timeout (only if `timer` set) it finishes with the count so far; unanswered = wrong. Footer text: "{need} of {n} correct to pass. No score on single questions." (IX:1523).

FINDING: `L1-18`'s comment (ib-level-1.ts:266-267) says "Under binary scoring all four sub-questions must be right; the old three-of-four pass is retired." The code still passes at 3 of 4. No per-beat or per-level override exists. UNCLEAR: which one is intended; the code is what ships.

```ts
// rn-level-1.ts:269-321 (items abbreviated to first one here; the file has 4)
{ kind: "rapid", id: "RN1-14", planLineIfFailed: "you got the basics wrong on things the floor expects a nurse to know cold",
  progress: 0.3, timer: 45, speaker: "Rosa", setup: '"Quick one. Every nurse needs these habits cold."',
  question: "", prompt: "",
  items: [
    { question: "Before you give a patient their medicine, what do you check first?",
      options: [
        { label: "The number on the door", correct: false, why: "Patients move beds. The door is not the person." },
        { label: "Their name and date of birth", correct: true, why: "Right. Two things that belong to the person, not to the room." },
        { label: "Whichever bed they are in", correct: false, why: "Beds get swapped all day. It is the commonest way the wrong person gets something." },
      ] },
    /* ...3 more items: "You are not sure about something Rosa asked...", "You forgot to write down...", "What does escalate mean?" */
  ],
  whenPass: "Right. Three of four means you can be trusted beside a patient.",
  whenFail: "You needed three of four. These four come up every single shift.",
  feedback: "", feedbackCta: "Continue", skills: ["Written Communication", "Decision-Making"] },
```

#### 1.8.8 `ReviewBeat` (`kind: "review"`, T:263-267), UNSCORED, the level's terminal screen

Fields: `title`, `body`. Runtime (SP:1321-1361): title and body, "Decision pending" dots for 2200 ms, then a "See the decision" button (label hardcoded). Always centered (SP:1164). Deliberately has NO location (locations.ts:214-216), so it renders the `AmbientBackdrop` unless fresh hero art is within 3 beats (L2-25 sets `resetScene` for that reason). Its index is the landing spot after a repair round (SP:310, 330). Advancing past the LAST beat enters the ending (SP:334-344), so review must be last.

```ts
// ib-level-1.ts:576-583
{ kind: "review", id: "L1-36", speaker: "System", setup: "Final Review",
  title: "Cobalt Capital is deciding who gets a return offer.", body: "Your reputation will determine what happens next." },
```

#### 1.8.9 `ChainBeat` (`kind: "chain"`, T:273-282), SCORED

Fields: `question`, `steps: {label, prompt, options: {label, correct}[]}[]`, `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`. Runtime (IX:1537-1620): steps in order; each step appends the CORRECT option's label to a built sentence regardless of what was picked; any miss anywhere -> `wrong`; all right -> `best`. FINDING: `step.prompt` is not rendered (only `entry.label` chips and `current.options`; IX:1576-1616). No per-option `why`.

```ts
// ib-level-2.ts:191-233 (not in IB L1 or RN L1)
{ kind: "chain", id: "L2-11", planLineIfFailed: 'you built an argument for the client that did not hold together', progress: 0.2,
  speaker: "Narrator", setup: "Build the pitch one sentence at a time. All three parts have to connect.",
  question: "What is Cobalt's case for Maison Laurent?",
  steps: [
    { label: "Client goal", prompt: "What does Maison Laurent want?", options: [ { label: "Grow globally", correct: true }, { label: "Cut its marketing budget", correct: false }, { label: "Sell fewer products", correct: false } ] },
    { label: "Cobalt strength", prompt: "Why is Cobalt a good fit?", options: [ { label: "We have the biggest office", correct: false }, { label: "Understands luxury brands", correct: true }, { label: "We are the cheapest option", correct: false } ] },
    { label: "Outcome", prompt: "What can Cobalt help Maison Laurent earn?", options: [ { label: "Investor trust", correct: true }, { label: "A longer meeting", correct: false }, { label: "More slides", correct: false } ] },
  ],
  whenRight: "Right. Goal, strength, outcome. Three sentences that hold together as one argument.",
  whenWrong: "Close. A pitch only works if all three parts connect. One weak link breaks it.",
  feedback: "A strong pitch is three sentences: what the client wants, why you can deliver, what they get. All three or none.",
  feedbackCta: "Continue", skills: ["Persuasive Communication", "Critical Thinking"] },
```

#### 1.8.10 `SliderBeat` (`kind: "slider"`, T:286-295), SCORED

Fields: `question`, `steps: {label, tier, why}[]` (low to high), `feedback`, `feedbackCta`, `skills`, `timer?`. Runtime (IX:1625-1695): a range input over the steps; Submit resolves `steps[at].tier` with `steps[at].why`. Segment colors assume 4 steps (IX:1629 `shade` array has 4 entries).

FINDING: `timer` is declared but NOT enforced for slider. SliderBody takes no `remaining`, and BeatStage only auto-resolves `choice` on timeout (SP:1130). A timed slider would show a clock that hits 0 and does nothing. No authored slider has a timer.

```ts
// ib-level-2.ts:267-285
{ kind: "slider", id: "L2-14", planLineIfFailed: 'you passed work up the chain without checking where the numbers came from',
  progress: 0.4, mood: "night", speaker: "Christina",
  setup: '"I need the model before Marcus reviews it. You aligned at kickoff, so I am not checking behind you on this one."',
  question: "How risky is it to send Marcus the model without checking the source?",
  steps: [
    { label: "Low", tier: "risky", why: "Not low. If the source is wrong, Marcus repeats it to the client." },
    { label: "Medium", tier: "wrong", why: "Higher. Christina trusts you now, so nobody checks behind you." },
    { label: "High", tier: "best", why: "Right. High. It can still be caught, but only if someone catches it." },
    { label: "Critical", tier: "acceptable", why: "Close. Critical is for things you can't undo. This is still fixable." },
  ],
  feedback: "Sending an unchecked number up the chain is high risk. Not medium, because nobody checks behind you.",
  feedbackCta: "Continue", skills: ["Critical Thinking", "Decision-Making"] },
```

#### 1.8.11 `FlagsBeat` (`kind: "flags"`, T:298-308), SCORED

Fields: `question`, `rows: {label, flag, why}[]`, `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`, `timer?`. Runtime (IX:1700-1771): toggle rows, then "Submit findings". Best only when the marked set EXACTLY equals the flagged set (false positives fail: IX:1709). On timeout, submits what is marked. FINDING: per-row `why` is not rendered anywhere.

```ts
// ib-level-2.ts:319-342
{ kind: "flags", id: "L2-17", planLineIfFailed: 'you signed off on someone else\'s work with errors still in it', progress: 0.6,
  timer: 60, speaker: "Narrator", castMember: "Jordan", tone: "alarm",
  setup: "It is 10:10 AM. The meeting is in 20 minutes. There are errors in Jordan's work, and you have to fix them before Christina and Marcus come in.",
  question: "Tap every red flag in Jordan's work.",
  rows: [
    { label: "Bags sold: 2", flag: false, why: "Not an error. Two is small, but not wrong." },
    { label: "Price per bag: $2,000", flag: false, why: "Not an error. That's a normal price." },
    { label: "Revenue: 2 × $2,000 = $400", flag: true, why: "Right. 2 × $2,000 is $4,000, not $400." },
    { label: "Profit: $4,000 − $1,000 = $5,000", flag: true, why: "Right. $4,000 minus $1,000 is $3,000. Subtracting can't grow a number." },
    { label: "Source: Missing", flag: true, why: "Right. A number nobody can check should never reach a client." },
  ],
  whenRight: "Right. The multiplication, the subtraction, and the missing source.",
  whenWrong: "Three lines are wrong: the multiplication, the subtraction, and the missing source.",
  feedback: "Three errors: the multiplication, the subtraction, and the missing source. Checking work means redoing the maths.",
  feedbackCta: "Continue", skills: ["Critical Thinking", "Helping & Supporting Others"] },
```

#### 1.8.12 `RankBeat` (`kind: "rank"`, T:315-328), SCORED

Fields: `question`, `order: string[]` (the CORRECT order; shown shuffled), `whenRight`, `whenClose?`, `whenWrong`, `feedback`, `feedbackCta`, `skills`. Runtime (IX:1775-1935): a deterministic shuffle `j = (i*7 + n*3) % (i+1)`, reversed if it equals the answer (IX:1776-1784). Reorder by drag or up/down arrows, then "Submit rank".
- exact order -> `best` + whenRight
- else if `whenClose` is authored AND `placed >= order.length - 2` -> `acceptable` + whenClose
- else -> `wrong` + whenWrong

FINDING: the comment (IX:1918-1919, T:312-313) says "exactly one adjacent pair swapped". The code accepts ANY arrangement with at least N-2 rows in place. That means any single transposition, adjacent or not. For a 4-row beat that is "2 or more in place". "Three of four in place" (RN1-15 whenClose copy) is impossible for a permutation.

```ts
// all-or-nothing (ib-level-1.ts:532-549)
{ kind: "rank", id: "L1-33", planLineIfFailed: "you walked past someone who needed help on a night you had time to give",
  progress: 1, speaker: "Narrator", mood: "night", question: "Rank these from best to worst.",
  order: ["Ask how you can help", "Wish her luck and keep working", "Laugh and walk away"],
  whenRight: "Right. Offering costs you nothing tonight and it is the thing people remember about you.",
  whenWrong: "Wishing her luck is not unkind, it is just not help. Walking away from someone drowning at 7 PM is the one people repeat later.",
  feedback: "", feedbackCta: "Continue", skills: ["Social Awareness", "Critical Thinking"] },

// three-band with whenClose (rn-level-1.ts:324-349)
{ kind: "rank", id: "RN1-15", planLineIfFailed: "you went to the least urgent patient first while someone else was waiting on you",
  progress: 0.4, speaker: "Narrator", setup: "10:20 AM. Four patients need you at the same time. Rosa is in a room with the door shut.",
  question: "Put them in the order you go.", prompt: "Use the arrows to order them, then tap Submit rank.",
  order: [ "A patient who says she cannot catch her breath", "A patient climbing out of bed on his own",
           "A patient whose pain medicine is due now", "A patient asking when lunch comes" ],
  whenRight: "Right. Breathing first, then the fall waiting to happen, then pain, then the question that can wait.",
  whenClose: "Three of four in the right place. Close enough to be safe, not yet the order an experienced nurse would take.",
  whenWrong: "Breathing comes before everything. Lunch comes after everything. The two in the middle are about who could get hurt in the next minute.",
  feedback: "", feedbackCta: "Continue", skills: ["Time Management", "Helping & Supporting Others"] },
```

#### 1.8.13 `PickBeat` (`kind: "pick"`, T:332-344), SCORED

Fields: `question`, `pick: number`, `cards: {label, role: "pick"|"leave"|"harmful"}[]`, `whenRight`, `whenWrong`, `whenHarmful?`, `feedback`, `feedbackCta`, `skills`, `timer?`. Runtime (IX:1937-2022): choose exactly `pick` cards (Submit disabled until full). Any `harmful` chosen -> `risky` + (whenHarmful ?? whenWrong). All chosen are `pick` and count == pick -> `best`. Else `wrong`. On timeout it submits the partial selection. Default prompt `Pick ${pick}, then submit.`.

```ts
// rn-level-1.ts:503-527
{ kind: "pick", id: "RN1-24", planLineIfFailed: "you handed over your patients without saying what actually mattered", progress: 1,
  speaker: "Narrator", setup: "7 PM. Your shift is ending. The night nurse sits down for report.",
  question: "Pick the three things she must hear.", prompt: "Tap three, then tap Submit.", pick: 3,
  cards: [
    { label: "Room 12 got worse this afternoon and was seen by the doctor", role: "pick" },
    { label: "Room 14 starts a new medicine at 10 PM", role: "pick" },
    { label: "Room 9 is waiting on test results tonight", role: "pick" },
    { label: "Room 12 watches the same show every evening", role: "leave" },
    { label: "You are hoping to swap a shift next week", role: "leave" },
    { label: "The coffee machine is broken", role: "leave" },
  ],
  whenRight: "Right. What changed, what is coming, and what is still open. Everything else can wait.",
  whenWrong: "Report is not everything you know. It is what she needs in order to keep three people safe overnight.",
  feedback: "", feedbackCta: "Continue", skills: ["Verbal Communication", "Critical Thinking"] },
```
Harmful example: `L3-11` (ib-level-3.ts:187-211), cards "Get inside information on Silverman Sacks" and "Make the numbers look bigger" are `harmful`, `whenHarmful: "Stolen information and inflated numbers end careers. Nothing won that way survives."`.

#### 1.8.14 `BucketBeat` (`kind: "bucket"`, T:348-359), SCORED

Fields: `question`, `buckets: [string, string]`, `items: {label, into: 0|1}[]`, `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`. Runtime (IX:2027-2117): one item at a time, two buttons (keys 1/2). Pass at `passThreshold(items.length)`: 5 items -> 4, 6 -> 5. Pass -> `best` + whenRight, else `wrong` + whenWrong.

```ts
// ib-level-3.ts:212-235 (not in IB L1 or RN L1)
{ kind: "bucket", id: "L3-12", planLineIfFailed: 'you filled the pitch with things the client had not asked about', mood: "crunch",
  speaker: "Christina", progress: 0.3, setup: '"Which of these belong in the final pitch?"', question: "Sort each idea.",
  buckets: ["Helps Cobalt win", "Weak pitch"],
  items: [
    { label: "Show why Asia growth matters", into: 0 }, { label: "Use general fashion trends", into: 1 },
    { label: "Prove Cobalt understands luxury customers", into: 0 }, { label: "Focus only on slide design", into: 1 },
    { label: "Explain risks in Silverman Sacks' plan", into: 0 }, { label: "Promise results without evidence", into: 1 },
  ],
  whenRight: "Right. A pitch is built from what the client cares about, not from what was easy to make.",
  whenWrong: "Close. Look for the ideas that answer why Cobalt, not the ones describing what Cobalt did.",
  feedback: "Strong ideas prove you understand the client. Weak ones talk about effort, design or promises.",
  feedbackCta: "Continue", skills: ["Persuasive Communication", "Critical Thinking"] },
```

#### 1.8.15 `FocusBeat` (`kind: "focus"`, T:367-371), UNSCORED

Fields: `title`, `terms: [{term, def}, {term, def}]` (exactly 2). NO `cta` field: the buttons are hardcoded "Got it" and "Back" (IX:822-888). First "Got it" moves focus to card 2 (card 1 blurs). Second "Got it" advances. FINDING: focus terms are NOT added to the Express lexicon (only `flips` are, SP:176).

```ts
// ib-level-1.ts:200-210
{ kind: "focus", id: "L1-14", speaker: "Christina", castMember: "Christina", title: "Two terms you will hear all the time.",
  terms: [ { term: "Comps", def: "Similar companies used for comparison." }, { term: "Deck", def: "A slide presentation." } ] },
```

### 1.9 `Ending` (T:390-403)

| field | type | req | runtime |
|---|---|---|---|
| `min` | number | yes | Inclusive floor. `endingFor` sorts by `min` descending and takes the first `reputation >= min` (scoring.ts:54-57). You must include a `min: 0` ending. |
| `band` | BandName | no | FINDING: not read at runtime. The ending card computes its own band with `bandFor(reputation)` for its color and "{rep} · {band}" line (SP:390, 2355-2362), even on `hideBand` levels. |
| `headline` | string | yes | h2 (SP:2364). |
| `message` | string | yes | Body (SP:2367). |
| `subline` | string | yes | Muted line (SP:2370). |
| `primary` | string | yes | Replay button label, or a disabled label when `advances` and there is no next level (SP:2383-2427). NOT used when advancing to a built next level: that button says `Start Level {n} · {role}` (SP:2380). |
| `advances` | boolean | yes | true -> next-level button (opens ConnectInterstitial, then `router.push('/play/{id}?level={n+1}')`, SP:694-701), promotion music (SP:399-402), Trophy icon. false -> "Fix your N misses" repair button (if any wrong/risky) plus replay. |

### 1.10 `BandName` (T:405)

`"At Risk" | "Cautious" | "Respected" | "Trusted"`.

### 1.11 `Level` (T:407-448)

| field | type | req | runtime |
|---|---|---|---|
| `id` | string | yes | React key for the player (page.tsx:53). Express derives `${id}-express`. Convention `"ib-l1"`, `"rn-l1"`. |
| `n` | number | yes | `?level=` match (page.tsx:27), save slot (Express = n+100, SP:88), HUD "Level n · role", next level = `n+1` (SP:392), plan lookup `PERFORMANCE_PLANS[sim][n]` (SP:625). |
| `role` | string | yes | HUD, next-level button, trailer ladder rung (TrailerFlow.tsx:34), hub meta, Connect `stageRole` (SP:697). |
| `title` | string | yes | FINDING: no runtime consumer in player or hub (grep). |
| `blurb` | string | yes | FINDING: no runtime consumer (grep). |
| `cover` | string | yes | Only passed as `src` for scene mode `"none"` (SP:1030), which renders `AmbientBackdrop` and ignores the src. Effectively unused by the player. Hub uses `Simulation.cover`. |
| `mood` | Mood | yes | Default mood (SP:417). All four current levels use `"day"`. |
| `cast` | `Record<string,string>` | no | Speaker name -> face chip image for the dialogue box (SP:1094, 1802-1815: 52px mobile, `clamp(62px,4.3vw,90px)` desktop, `object-cover object-top`), and the portrait in Express character panels (SP:174). |
| `beats` | Beat[] | yes | See section 6. |
| `endings` | Ending[] | yes | See 1.9. |
| `hideBand` | boolean | no | Swaps the HUD gauge for `TappableScore` (tap opens outcomes "Bag secured 85+ / Retry level 40-84 / Terminated Under 40", SP:1921-1926) and hides the band word next to the gauge. Only IB L1 Full sets it. |
| `expressCut` | string[] | no | Beat ids dropped in Express. Non-empty is what OFFERS Express (PlayHub.tsx:789, page.tsx:40). |
| `express` | boolean | no | Set only on the derived express level (page.tsx:42). Drives save slot n+100, `TappableScore`, the " · Express" HUD suffix, and the tappable lexicon. |
| `expressSource` | Level | no | Express is built from THIS object's beats + expressCut instead (page.tsx:39). Full mode never reads it. |

### 1.12 `TrailerCard` (T:454-464)

| field | type | req | runtime (TrailerFlow.tsx) |
|---|---|---|---|
| `id` | string | yes | key |
| `seconds` | number | yes | Auto-advance delay (line 62). Ken Burns duration `max(seconds+1.2, 3)` (line 90). |
| `text` | string | yes | Title card line. |
| `art` | string | no | Full-bleed plate. None = black. |
| `sprite` | string | no | Expression cutout rising into frame, dark-graded (lines 101-109). |
| `finale` | boolean | no | No auto-advance. Shows `simulation.firm`, the ladder `[...levels.map(l=>l.role), ...upcoming]` (line 34) and a "▶ Start Level 1" button. FINDING: that button only calls `onDone` (closes the overlay), it does not navigate (lines 239-254). |

### 1.13 `Simulation` (T:466-481)

| field | type | req | runtime |
|---|---|---|---|
| `id` | string | yes | URL slug `/play/{id}`, save key prefix, `PERFORMANCE_PLANS` key, `SIM_TRACKS` music key (music.ts:22), Connect `STAGE_INSIGHT` key prefix. |
| `careerId` | string | yes | Shared career catalogue slug. `simulationFor(x)` matches `id` OR `careerId` (games.ts:95-97). Used by career detail / Explore / Profile to decide whether to show a Play button (`simulationFor(slug)`), and by the hub to order the student's Top 3 first (PlayHub.tsx:90). |
| `title` | string | yes | HUD title, hub card title. |
| `world` | string | yes | Must be a key of `WORLD_COLORS` (src/components/app/worlds.ts:29-45) or accent falls back to `var(--primary)` (SP:157). Also picks the poster title font (`posterTitleFont`). |
| `firm` | string | yes | Trailer finale house mark only (TrailerFlow.tsx:185). |
| `cover` | string | yes | Hub hero card image. |
| `trailer` | TrailerCard[] | no | Opened ONLY from the hub's "Watch trailer" chip (PlayHub.tsx:317-320, 799-812), never autoplayed. |
| `levels` | Level[] | yes | Built levels in order. |
| `upcoming` | string[] | yes | Role names not built. `upcoming[0]` shows "{x} is coming soon." after an advancing ending with no next level (SP:2428-2431). Also the trailer ladder tail. |

---

## 2. Registration (`games.ts`) and "add a new career"

### 2.1 What exists

- `INVESTMENT_BANKING` (games.ts:11-38): id/careerId `"investment-banking"`, title "Investment Banker", world "Business & Finance", firm "Cobalt Capital", cover `/images/play/ib/l1-04.webp`, 7 trailer cards TR-01..TR-07, levels `[IB_LEVEL_1, IB_LEVEL_2, IB_LEVEL_3]`, upcoming `["Vice President", "Executive Director", "Managing Director"]`.
- `REGISTERED_NURSE` (games.ts:40-65): id/careerId `"registered-nurse"`, title "Registered Nurse", world "Health & Medicine", firm "Riverbend Medical Center", cover `/images/play/rn/locations/station-hero.webp`, 7 trailer cards RN-TR-01..07, levels `[RN_LEVEL_1]`, upcoming `["Staff Nurse", "Charge Nurse", "Nurse Manager", "Director of Nursing", "Chief Nursing Officer"]`.
- `SIMULATIONS = [INVESTMENT_BANKING, REGISTERED_NURSE]` (games.ts:67). This array is the registry. `simulationFor` and the hub read it.

Trailer data verbatim:

| id | seconds | text | art | sprite |
|---|---|---|---|---|
| TR-01 | 4 | Every summer, thousands of students want this job. | none | |
| TR-02 | 4.5 | Cobalt Capital takes six interns. Two get to stay. | ib/locations/reception.webp | |
| TR-03 | 4 | The nights are long. | ib/locations/trading-floor-night.webp | |
| TR-04 | 4 | The rooms are serious. | ib/l3-17.webp | |
| TR-05 | 4 | One wrong number reaches the client. | ib/l2-23.webp | |
| TR-06 | 4.5 | And one person at the top decides who rises. | ib/locations/elevator-hallway-sunset.webp | ib/expressions/lamisa-composed.webp |
| TR-07 | 4 | Six levels. Intern to Managing Director. How far will you get? | finale | |
| RN-TR-01 | 4 | More people work as nurses than any other job in health care. | rn/locations/lobby.jpg | |
| RN-TR-02 | 4.5 | Nursing schools turn away tens of thousands of people who qualify. Every year. | none | |
| RN-TR-03 | 4 | Nights. Weekends. Holidays. Twelve hours on your feet. | rn/locations/staff-room.jpg | |
| RN-TR-04 | 4 | Thirty beds. One of them needs you first. | rn/locations/corridor.jpg | |
| RN-TR-05 | 4.5 | The thing you notice, or do not notice, decides what happens next. | rn/locations/ward-night.jpg | |
| RN-TR-06 | 4.5 | Somewhere above you is the nurse who answers for every floor in this hospital. | rn/locations/lobby.jpg | rn/expressions/yvonne-composed.webp |
| RN-TR-07 | 4 | Six levels. New nurse to the top of the hospital. How far will you get? | finale | |

Trailer rule (games.ts:18-22): "REUSE ONLY -- six of seven cards use art that already exists; only the finale's ladder is new. The seven-beat shape (scale, odds, cost, room, consequence, the person at the top, the ladder) travels to every career." RN (games.ts:47-51): "The two statistic cards ship WITHOUT their numbers, per the sheet's own rule: no numbers we cannot source (D04)."

Ladder rule: the trailer finale ladder is `levels.map(role) + upcoming`. Both current careers make exactly 6 rungs.

### 2.2 "In the works" / locked handling

- `SOON` (games.ts:76-88): `{careerId, title, world, cover}[]`. 7 entries: airline-pilot, software-engineer, private-equity, food-scientist, accountant, aviation-maintenance-technician, emergency-medicine-doctor. Each cover is its OWN `/images/app/soon-{careerId}.png` (games.ts:69-75: "not the shared `poster-*.png`... per direct correction").
- `FEATURED_ROW_SOON_IDS = ["accountant", "aviation-maintenance-technician", "emergency-medicine-doctor"]` (games.ts:93) ride in the featured row next to real sims. PlayHub filters them out of the "In the works" grid (PlayHub.tsx:95-103).
- The hub filters any SOON entry whose careerId is live in SIMULATIONS (PlayHub.tsx:96-99), so promoting a career to playable does not require deleting its SOON row, though you should.
- Locked cards render `locked: true` with a lock badge and no link (PlayHub.tsx:226, 939, 965).
- `worldForCareer(slug)` (games.ts:103-105) looks in SIMULATIONS then SOON.
- `GLOSSARY_GAMES` (games.ts:119-131): separate game type. "Finance Terms" (investment-banking) is real. Medical/Flight/Tech Terms are "Coming soon" cards gated by `hasGlossary()` in glossary/data.ts (not in this slice).

### 2.3 Level unlocking between levels

FINDING: there is NO persisted unlock state. The route serves any built level via `?level=N` (page.tsx:26-27; an unknown N falls back to `levels[0]`). The hub always links to Level 1 (`/play/{id}`, PlayHub.tsx:781) and only reads the Level 1 save. Reaching Level 2 happens only through an `advances: true` ending -> ConnectInterstitial -> `router.push('/play/{id}?level={n+1}')` (SP:699). The `DEMO_CONNECT_SHORTCUT` HUD button can also open it from any beat (SP:620).

### 2.4 Express mode

- Offered iff `levels[0].expressCut` is non-empty (PlayHub.tsx:789). Link `/play/{id}?mode=express`.
- Derivation (page.tsx:39-43): `expressBase = picked.expressSource ?? picked`; `express = mode==="express" && expressBase.expressCut?.length`; the level becomes `{ ...expressBase, id: picked.id+"-express", express: true, beats: expressBase.beats.filter(b => !expressBase.expressCut.includes(b.id)) }`. So in Express, cast, endings, hideBand etc. all come from `expressBase`. For IB L1 that is the LEGACY object: 4-band endings "Top of the Class / So Close / No Return Offer / Contract Ended", no `hideBand`.
- Scoring scale: `scoreScale = SCORED_BEATS / countOfScoredKinds` (SP:127-131), `scoredValue = Math.round(TIER_SCORE[tier] * scale)`. IB L1 Express (legacy) keeps 4 scored beats (L1E-08, -12, -13, -13b), so scale = 2.5: best = round(12.5) = +13, acceptable = +5, wrong = round(-12.5) = -12 (JS rounds half toward +inf), risky = -15. A perfect run is 50 + 52 = 102, clamped to 100. RN L1 Express keeps all 10 scored beats, so scale = 1.
- Save slot = `n + 100` (SP:88).
- Push-to-pull teaching: character cards (`variant:"character"` with `castMember`, first per name) become tappable name panels in every `setup` line. Flips terms become tappable on first use (SP:165-202). The HUD score is tappable (TappableScore).
- FINDING: legacy header (ib-level-1-express-legacy.ts:72) says "only three scored beats (L1-08, L1-12, L1-13)"; SP:119-120 says 4. Code count is 4 (L1E-13b is a scored `choice`).
- FINDING: the repair hint text "A fix is worth +2, not the full +5." (SP:2405) is hardcoded; in scaled Express a fixed beat is worth +5.

### 2.5 Checklist: add a new career (derived strictly from code)

1. **Pick ids.** `Simulation.id` = URL slug = save key = plan key = music key. Set `careerId` to the shared catalogue slug (usually the same string). Choose a beat-id prefix unique across ALL careers (BEAT_LOCATION is one global map; e.g. `SE1-`).
2. **Write the level file** `src/components/play/<abbr>-level-1.ts` exporting `Level`: `id`, `n: 1`, `role`, `title`, `blurb`, `cover`, `mood`, `cast` (speaker -> face chip), `beats`, `endings`. Optional: `hideBand`, `expressCut`.
   - Exactly 10 beats of SCORED_KINDS in Full mode, or `scoreScale` rescales points (SP:127). Give them `progress` 0.1..1.0 and `planLineIfFailed` (convention; progress is not read at runtime).
   - Last beat must be `kind: "review"` (the ending is entered by advancing past the last beat; repair returns to the first `review`).
   - `endings`: include `min: 0`. Current careers use 85 (advances: true) plus lower tiers with `advances: false`.
   - Every scored beat: `feedbackCta`, `skills` (names must be keys of `SKILL_MEANING` or the chip shows no meaning), and `feedback` (required by type, not shown).
3. **Register** in `games.ts`: create the `Simulation` constant (`title`, `world` from `WORLD_COLORS` keys, `firm`, `cover`, `trailer?` with 7 cards and the last `finale: true`, `levels`, `upcoming` so levels+upcoming = the full ladder). Append it to `SIMULATIONS`. Remove the career from `SOON` (the hub also auto-filters it).
4. **Locations** in `locations.ts`: add ids to the `LocationId` union, add `LOCATION_ART` entries (`src`, `alt`, `focal`, `mobileFocal`, `characterAnchor`, optional `characterAnchors`), and add EVERY non-review beat id to `BEAT_LOCATION`. A missing id falls to the ambient backdrop.
5. **Expressions** in `expressions.ts`: add each on-screen character to `DEFAULT_EXPRESSION` (a missing name means no sprite stands in the scene; SP:437, 931). Add a tier set to `EXPRESSION_PORTRAITS` for characters who react (the feedback card shows `expressionFor(beat.speaker, tier)`). Add every sprite's width/height ratio to `PORTRAIT_RATIO` (default 0.55 letterboxes, SP:962).
6. **Voice pitch** in SP `VOICE_PITCH` (SP:1579-1590) per speaking character, else 500 Hz for all.
7. **Performance plan** in `performance-plan.ts`: add `PERFORMANCE_PLANS["<sim id>"] = {1: {...}, 2: {...}, 3: {...}}`. Without it the IB/Cobalt plan text is used (SP:625). A level `n > 3` has no plan entry and would crash when a plan fires (the type is `Record<1|2|3, ...>`).
8. **Music** (optional) in `music.ts` `SIM_TRACKS`: `{ main, promotion? }`. Falls back to the IB tracks.
9. **Assets** under `public/images/play/<abbr>/` (see section 5.6 for folder conventions).
10. **Connect insight** (optional) `ConnectInterstitial.tsx` `STAGE_INSIGHT["<sim id>:<role>"]`.
11. **Home** hardcodes IB and RN in `HomeExperience.tsx` (lines 19, 298-310, 426-428). A new career will not appear on Home without editing it.
12. **Express** (optional): set `expressCut` on levels[0]. Cutting scored beats changes point values via `scoreScale`.

---

## 3. Scoring (`scoring.ts` + SP)

Constants (scoring.ts:8-10): `START_REPUTATION = 50`, `SCORED_BEATS = 10`, `ADVANCE_AT = 85`.

Header rule (scoring.ts:3-6): "The scoring model from the handoff, one system for all 25 career simulations. Ten scored beats per level: ten Best answers take a perfect run from 50 to exactly 100, and the progress bar moves a clean 10% per beat. Do not invent new scoring -- every career copies this."

### 3.1 Reputation formula

```
scale        = 10 / (number of beats whose kind ∈ SCORED_KINDS)        // SP:127-130
value(tier)  = Math.round(TIER_SCORE[tier] * scale)                    // SP:131
reputation   = clamp(baseline + Σ value(scores[beatId]))               // SP:132
clamp(v)     = max(0, min(100, round(v)))                              // scoring.ts:46-48
baseline     = 50, or (50 - earnedSoFar) after passing a Performance Plan (SP:628-629)
```
`applyScore` (scoring.ts:42-44) exists but the player does not use it (it derives instead). Full-mode 10-beat levels: best +5, acceptable +2, wrong -5, risky -6. IB L1 Full (binary: only best/wrong authored) gives final = 10 x correct answers.

### 3.2 What counts as correct / partial / wrong per kind

| kind | best | acceptable | wrong | risky |
|---|---|---|---|---|
| choice | the option's own tier | option tier | option tier; also timeout | option tier |
| slider | segment tier | segment tier | segment tier | segment tier |
| match | all pairs, zero mistakes | never | any mistake | never |
| rapid | correct >= ceil(0.75n) | never | below threshold / timeout | never |
| chain | every step right | never | any step wrong | never |
| flags | marked set == flagged set exactly | never | anything else / timeout | never |
| rank | exact order | `whenClose` authored and >= n-2 in place | else | never |
| pick | exactly `pick` cards, all role pick | never | otherwise | any harmful chosen |
| bucket | right >= ceil(0.75n) | never | below | never |

`passThreshold(items) = Math.ceil(items * 0.75)` (scoring.ts:61-63): "four items pass at three, five at four, six at five."

### 3.3 Bands (scoring.ts:27-32) and colors (34-39)

| name | min | max | note | color |
|---|---|---|---|---|
| Trusted | 85 | 100 | Promotion | `var(--color-feedback-success)` |
| Respected | 60 | 84 | Repeat the level | `var(--world-business-money-office)` |
| Cautious | 40 | 59 | Repeat the level | `var(--world-building-construction)` |
| At Risk | 0 | 39 | Well below the line | `var(--destructive)` |

`bandFor(rep)` = first BAND with `rep >= min` (scoring.ts:50-52). Comment 24-26: "Ranges are spelled out rather than derived... the arithmetic version read 'At Risk 0 to 84' on the intro card."

`TIER_COLOR` (scoring.ts:65-71): best/acceptable success green, wrong construction amber, risky destructive, none muted.

### 3.4 Strikes and the Performance Plan trigger

- `TIER_STRIKES = { wrong: 1, risky: 2 }`, `STRIKE_TRIGGER = 3` (scoring.ts:18-22). Best/acceptable add 0. Strikes never decrease within a level.
- In `resolve` (SP:263-308): `banked` tier is saved to scores FIRST, then strikes are added. If strikes reach 3 and no plan fired yet (`pipUsed` false): the plan opens IMMEDIATELY, the beat's own feedback card is skipped, `resumeIndex = index + 1`, `triggerLine = beat.planLineIfFailed ?? ""`, and the random left/right order is rolled for 3 steps (SP:293-299). Once per level (`pipUsed`); later misses cost reputation only.
- FINDING: strikes and `pipUsed` live only in React state. They are NOT in `RunSave`, so a resumed run starts at 0 strikes.
- Timing: answer hold is 420 ms on best/acceptable/none and 1150 ms on wrong/risky before feedback (SP:270).

### 3.5 Repair round

Ending without `advances` and with misses offers "Fix your N misses" (SP:2391-2416). `misses` = beat ids whose tier is wrong or risky (SP:134-136). The queue replays only those beats in level order, then jumps to the review beat (SP:315-333). In repair, a best OR acceptable answer is banked as `acceptable` (SP:273): "A repair can rescue a beat but never earn full marks for it." Repair wrongs still add strikes if no plan fired.

### 3.6 Performance Plan pass/fail (PerformancePlanFlow.tsx)

Warning card, then 3 steps, each correct/incorrect with randomized position. `correctCount >= 2` passes (line 100). Pass: reputation becomes exactly 50 by moving the baseline (SP:628-629), strikes reset, resume at `resumeIndex`, save written with reputation 50. Terminated: its OWN card ("Employment Terminated" headline, `terminatedSetup`, `terminatedBody`), `terminatedRestartCta` restarts the level from beat 0 with clean state (SP:636-647), and `terminatedLeaveCta` links to `/play`. FINDING: a failed plan never shows the level's `min: 0` Ending, even though ending comments say "under 40, or a failed performance plan".

### 3.7 HUD

The ring gauge wears the world accent (SP:1437-1439, "Chandu, 7 Sept 2026"). The SparkBar shows `percent={reputation}`. There are 10 fixed dots (`SCORED_BEATS`); dots 3, 6 and 9 are larger "checkpoint" dots (SP:2107-2120). Filled dots = number of scored beats answered. In Express with fewer scored beats the dots never fill.

---

## 4. Skills, Performance Plan data, Progress

### 4.1 `skills.ts`

`SKILL_MEANING: Record<string,string>`, 17 entries ("the core 15 every career uses plus the two senior skills that appear from Level 3 up. Student-facing wording is Joshua's", skills.ts:1-5):

| skill | meaning |
|---|---|
| Critical Thinking | Analyze information and use reasoning to understand a situation. |
| Problem-Solving | Identify problems and determine effective solutions. |
| Decision-Making | Compare options and make thoughtful choices. |
| Active Learning | Learn from new information and apply it. |
| Self-Reflection & Improvement | Review performance and identify ways to improve. |
| Reading Comprehension | Understand and interpret written information and instructions. |
| Active Listening | Listen carefully, understand others, and respond appropriately. |
| Verbal Communication | Clearly communicate ideas and information when speaking. |
| Written Communication | Clearly communicate ideas and information in writing. |
| Social Awareness | Understand how other people are feeling and reacting. |
| Teamwork & Collaboration | Work effectively with others toward a shared goal. |
| Negotiation | Work through differences to reach an agreement. |
| Persuasive Communication | Communicate ideas effectively to gain support or influence decisions. |
| Helping & Supporting Others | Recognize when others need help and respond appropriately. |
| Teaching & Guiding Others | Help someone else get better at the work, without doing it for them. |
| Time Management | Prioritize tasks and use available time effectively. |
| Leadership & Team Management | Decide who does what, and take responsibility for the result. |

Consumed only by FeedbackSheet (SP:2300). A chip whose name is missing from the table still renders but shows no meaning. FINDING: `PERFORMANCE_PLANS["investment-banking"][3].steps[2].skillSecondary = "Evaluating Outcomes"` (performance-plan.ts:167) is not a key in SKILL_MEANING. UNCLEAR: whether plan skills are shown as tappable chips (not verified in PerformancePlanFlow).

UNCLEAR: which 2 are "senior skills from Level 3 up". By usage, "Teaching & Guiding Others" and "Leadership & Team Management" appear only in L3 and plans.

### 4.2 `performance-plan.ts`

Types:
- `PerformancePlanStep` (15-29): `setup` (step 1 carries `{PLAN_LINE}`), `correct`, `incorrect` (always authored in this order; rendered position randomized: "MUST RANDOMISE POSITION. In the build the right answer was A all three times"), `whyCorrect`, `whyIncorrect`, `skillPrimary`, `skillSecondary`.
- `PerformancePlan` (31-48): `warningSetup`, `warningQuestion`, `warningCta` (PIPn-00); `steps` (exactly 3 tuple, PIPn-01..03); `passedSetup`, `passedBody`, `passedCta` (PIPn-04, 2 or 3 of 3); `terminatedSetup`, `terminatedBody`, `terminatedRestartCta`, `terminatedLeaveCta` (PIPn-05, 0 or 1 of 3).
- `PERFORMANCE_PLANS: Record<string, Record<1|2|3, PerformancePlan>>` (53): keyed by SIMULATION id, then level n. "every career carries its own supervisor voice and step options, but the three plan questions never change across careers" (50-52).
- `PipState` (308-321): `triggerLine`, `resumeIndex`, `stepOrders` (rolled once at trigger inside the setTimeout, keeping render pure).
- `randomStepOrders()` (323-326): each step 50/50 `["correct","incorrect"]` or reversed.

Content: `investment-banking` 1/2/3 and `registered-nurse` 1/2/3 are all authored (RN 2 and 3 exist although RN has only Level 1 built). Shared fixed strings across all six: `warningCta: "Begin Recovery"`, `passedSetup: "You made it out."`, `passedCta: "Back to work"`, `terminatedRestartCta: "Play this year again"`, `terminatedLeaveCta: "Back to Games"`, terminatedBody "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.". Step 1 setup template for IB L1/L2: `'Your supervisor names the most recent one. "Three times this year. The last was when {PLAN_LINE}." She asks how you check your work before you hand it in. Pick one.'`; IB L3 uses "Christina (VP) names..."; RN uses "Denise names..." (L1/L2) and "Yvonne names..." (L3). The three questions per career: (1) how is your work checked, (2) why did nobody hear about it / why you did not ask, (3) name one thing you changed and show proof. Full text: performance-plan.ts:54-303.

Flow-level fixed copy (PerformancePlanFlow.tsx:28-29): `SYSTEM_STEP_ONE = "Three mistakes is a pattern, not bad luck. Two right answers out of three and you keep the job."`, `SYSTEM_LAST_CHANCE = "This one decides it. Be specific."`.

`planLineIfFailed` authoring pattern: a lowercase clause that completes "The last was when ___." Examples: "you could not yet say what an investment bank is for", "you opened a patient record that was none of your business".

### 4.3 `progress.ts`

- localStorage key `"dreamari-play-progress"` (11). Other Play keys: `"dreamari-play-muted"` (sound.ts:9), `"dreamari-play-music-muted"` (music.ts:12).
- Stored value: `Record<slot, RunSave>` where slot = `` `${gameId}:${level}` `` (35-37). Express uses level `n+100`, e.g. `"investment-banking:101"`.
- `RunSave` (13-29): `gameId` (simulation id), `level` (slot number), `index` (NEXT beat to show = last completed + 1), `scores: Record<beatId, Tier-string>` (reputation derives from this), `reputation` (for the hub display), `scored` (count), `at` (epoch ms).
- `parse` (39-71) validates types, clamps reputation 0..100, floors index/scored, and defaults `scores` to `{}` for old saves.
- `useSyncExternalStore` pattern (73-109), with a cached snapshot keyed on the raw string and cross-tab `storage` events.
- `saveRun` (126-130) is called on every `advance()` (SP:347) and after a plan pass (SP:634). `clearRun` (134-138) runs when the ending is entered (SP:341), on restart (SP:365) and on plan termination (SP:641).
- Resume: `saved.index > 0 && saved.index < level.beats.length` (SP:95). A "Picked up where you left off / Start over" notice shows (SP:716-728).
- Not saved: strikes, pipUsed, repair queue, phase.

---

## 5. Locations, backgrounds, art ratios, expressions

### 5.1 `LOCATION_ART` (locations.ts:73-201)

Type: `{ src, alt, focal:{x,y}, mobileFocal:{x,y}, characterAnchor?: CharacterSlot, characterAnchors?: CharacterSlot[] }`, where `CharacterSlot = {x, baselineY, heightFrac, centered?}` (50). baselineY and heightFrac are fractions of scene height; the sprite's bottom = `(1 - baselineY) * sceneHeight` px from the bottom and its height = `heightFrac * sceneHeight` px (SP:947-949). x is used only when `centered === false`, otherwise the sprite is centered at 0.5 (SP:937).

| LocationId | src | focal | mobileFocal | characterAnchor | anchors |
|---|---|---|---|---|---|
| cobalt-trading-floor-sunset | ib/locations/trading-floor-sunset.webp | .58,.43 | .57,.36 | x .74, base .99, h .9 | |
| cobalt-internal-boardroom-sunset | ib/locations/internal-boardroom-sunset.webp | .61,.40 | .66,.36 | x .91, .99, .9 | |
| cobalt-trading-floor-night | ib/locations/trading-floor-night.webp | .58,.45 | .60,.37 | x .75, .99, .9 | |
| cobalt-cafe-lounge-sunset | ib/locations/cafe-lounge-sunset.webp | .66,.42 | .69,.36 | x .76, .99, .9 | |
| cobalt-client-boardroom-sunset | ib/locations/client-boardroom-sunset.webp | .62,.40 | .67,.35 | x .9, .99, .9 | |
| cobalt-elevator-hallway-sunset | ib/locations/elevator-hallway-sunset.webp | .55,.45 | .53,.40 | x .4, .99, .9 | |
| l1-reception | ib/locations/reception.webp | .52,.42 | .52,.34 | x .5, .99, .88 | [{x .38, .99, .88, centered:false}, {x .64, .99, .9, centered:false}] |
| cobalt-exterior-sunset | ib/locations/exterior-sunset.webp | .62,.55 | .60,.50 | x .32, .99, .85 (never exercised) | |
| riverbend-lobby | rn/locations/lobby.jpg | .45,.45 | .40,.40 | x .62, base 1.78, h 1.75 | |
| riverbend-station | rn/locations/station.jpg | .42,.45 | .38,.42 | x .68, 1.78, 1.75 | |
| riverbend-patient-room | rn/locations/patient-room.jpg | .60,.50 | .65,.45 | x .24, 1.78, 1.75 | |
| riverbend-corridor | rn/locations/corridor.jpg | .50,.45 | .45,.42 | x .55, 1.78, 1.75 | |
| riverbend-staff-room | rn/locations/staff-room.jpg | .50,.45 | .45,.42 | x .64, 1.78, 1.75 | |
| riverbend-ward-night | rn/locations/ward-night.jpg | .40,.45 | .35,.42 | x .72, 1.78, 1.75 | |

FINDING: no single `characterAnchor` sets `centered: false`, so every single character renders centered at x = 0.5 regardless of its authored `x`. Only the two reception multi-slots honor x.

Rules recorded in comments:
- Sprite scale by cast type (locations.ts:147-156): IB cutouts are waist-up crops, RN sprites are full head-to-toe, so RN anchors use heightFrac 1.75 and baselineY = heightFrac + 0.03 = 1.78 to put "head-to-hips across the frame exactly like the IB treatment: face in the upper third, waist at the bottom edge, legs cropped behind the dialogue box" ("direct feedback: match how much body IB shows, cropping lower body is fine").
- Boardrooms (86-89, 111-112): "Centered and full scale like every other location -- off-to-the-side by the window read as a scaling/positioning bug."
- Patient room (176): "The open floor left of the bed -- never over the bed itself." Ward night (198): "The clear aisle right of the bed and cart."
- l1-reception (22-28): the one bespoke plate with its own scene.json slot layout; single anchor used "when only one of them is present".
- cobalt-exterior-sunset (30-32): supplied 20 Sept for L1-01, the one street-level view.
- Riverbend plates (34-37): "the asset pack's people-free daytime masters, so the chroma-keyed cast sprites stand in them cleanly."

### 5.2 Background choice per beat: `sceneFor` (SP:1002-1031)

1. Walk back from the current beat. The first beat with `art` wins IF `index - i <= 3` (`SCENE_FRESH_BEATS`), giving `{mode:"hero", src: art}`. If it is older than 3 beats, stop. A beat with `resetScene` also stops the walk (checked after its own `art`).
2. Else `locationFor(beat.id)` gives `{mode:"location", ...}`.
3. Else `{mode:"none"}` gives `AmbientBackdrop` (mood-colored drifting blobs plus sparks, SP:770-795).

Hero plates are static `object-cover` (SP:797-814). Location plates use `objectPosition` = focal (desktop) or mobileFocal (mobile) (SP:856-877). Whenever an interactive beat is revealed (not card/review), the plate gets `blur(7px) brightness(0.7) saturate(0.45)` plus a vignette (SP:423, 495, 853, 561-568). A scene-change sound plays only when `scene.src` changes (SP:442-446).

Character in scene (SP:517-552): only in location mode, only while the beat is a card/review OR the setup is still held (not revealed). Name resolution: `castMembers` (when the location has `characterAnchors`), otherwise `castMember ?? speaker`. The sprite is `expressionFor(name, tier)` if a tier is present, else `expressionFor(name, neutralTier)` for conflict/alarm, else `defaultExpressionFor(name)` (SP:924). No sprite if the name has no default expression. Narrator/System have none, so no one stands.

UNCLEAR: SceneCharacter's `tier` prop (`phase === "feedback" ? result.tier`, SP:546) looks unreachable. Scored beats are always `revealed` by feedback time, so the scene character is not rendered then. The tier reaction reliably appears on the feedback card instead (SP:2226, 2254-2265), which is keyed on `beat.speaker`.

`BEAT_LOCATION` routing rules (locations.ts:203-222): "EVERY beat gets an entry here, including a beat the player is actively answering... A room behind an interactive beat renders dimmed... The one deliberate exception is the terminal review beat of each level... Routed from the handoff's background-library.json where a beat is listed there; filled in by narrative judgment elsewhere, using its own tie-break rule...: internal prep/review -> internal boardroom, formal client pitch/deal decision -> client boardroom, public working-floor moment -> trading floor, private transition -> hallway."

Verified by diff: every beat id in all five level files has a BEAT_LOCATION entry EXCEPT the five review beats (L1-36, L1E-25, L2-25, L3-28, RN1-26). No orphan keys.

### 5.3 `art-ratios.ts`

`ART_RATIO: Record<string, number>`, 18 entries (w/h): l1-04 1.3333, l1-07 1.4989, l1-12 1.7766, l1-13 1.4989, l2-02/07/08/10/18/19 1.7766, l2-23 1.4989, l3-06/08 1.7766, l3-14/16/17 1.4989, l3-19/20 1.7766. Comment: "a missing entry falls back to 16:9."

FINDING: `ART_RATIO` is imported NOWHERE (grep). It is dead code. Several values are also stale against the files on disk: l2-10 is 2896x1629 (1.778), l2-23 is 3072x1728 (1.778, listed 1.4989), l3-19/20 are 3344x1882. Treat it as not part of the contract.

### 5.4 `expressions.ts`

`EXPRESSION_PORTRAITS` (tier -> sprite), dir E = `/images/play/ib/expressions`, RNE = `/images/play/rn/expressions`:

| character | best | acceptable | wrong | risky | none |
|---|---|---|---|---|---|
| Christina | christina-proud | christina-welcoming | christina-concerned | christina-concerned | christina-welcoming |
| Jordan | jordan-confident | jordan-focused | jordan-uncertain | jordan-uncertain | jordan-focused |
| Rosa | rosa-proud | rosa-welcoming | rosa-concerned | rosa-concerned | rosa-welcoming |
| Denise | denise-composed | denise-composed | denise-concerned | denise-concerned | denise-assessing |
| Tyler | tyler-confident | tyler-focused | tyler-uncertain | tyler-uncertain | tyler-focused |

`DEFAULT_EXPRESSION` (pre-answer face): Christina welcoming, Jordan confident, Marcus marcus-assessing, Lamisa lamisa-composed, Rosa welcoming, Denise assessing, Tyler confident, Yvonne yvonne-composed, "Cobalt HR" cobalt-hr-welcoming.

`expressionFor(speaker, tier)` returns `EXPRESSION_PORTRAITS[speaker]?.[tier]` or undefined. `defaultExpressionFor(speaker)` returns `DEFAULT_EXPRESSION[speaker]` or undefined. There is no cross-fallback: Marcus, Lamisa, Yvonne and Cobalt HR show no feedback-card face because they have no tier set.

Mood/tone -> expression: conflict/alarm borrow the `wrong` tier for the neutral face (SP:427-428). Mood (day/night/crunch) does NOT change expressions.

`PORTRAIT_RATIO` (w/h used for next/image box sizing, height 900, SP:962; default 0.55): christina-concerned .4856, christina-proud .4933, christina-welcoming .7283 ("real outlier... arm extended"), cobalt-hr-welcoming .5578, jordan-confident .5144, jordan-focused .61, jordan-uncertain .5083, lamisa-composed .5128, marcus-assessing .4978, all RN .5 ("1024x2048 canvas"). The comment explains the ratio matters: wrong ratio "does letterbox... pushing the visible character noticeably smaller/higher".

Rules (expressions.ts:3-15): "Only Christina and Jordan have an approved expression set -- Marcus and Lamisa keep their single face until their own set is generated, per the handoff's own caution against batch-generating a cast before their canonical turnaround is approved." "Expression swaps occur after the player commits, before feedback text finishes appearing... so these render on the verdict card, not the question." "inventing an expression we have no art for would be worse than a smaller, honest set."

Role-to-sprite-set convention (docs/handoff/sprite-master-prompt.md): mentor = welcoming/proud/concerned; judge above = composed/assessing/concerned; peer = confident/focused/uncertain; figure at the top = composed only. Filenames `<name>-<expression>` lowercase hyphenated. The prompt specifies a PNG 1024x2048 full-figure true alpha; the shipped files are `.webp`.

### 5.5 Face chips

`Level.cast` values are SEPARATE square files, not runtime crops: IB `face-{name}.webp` 512x512, RN `face-{name}.jpg` 420-460 square. They render `object-cover object-top` at 52px, or `clamp(62px, 4.3vw, 90px)` on desktop (SP:1808-1814). The chip shows only when the speaker is a character AND the big scene sprite is not already visible (SP:1094, 432-437). The feedback card's 72px face is the EXPRESSION sprite cropped by CSS `object-cover object-top` (SP:2255-2263). The T:418-420 comment says faces were "cropped from this level's own scene art (Vision's face detection found the boxes)". The sprite prompt says "Dialogue face chips are cropped from these same files by us". UNCLEAR: which source produced each face file; the engine only needs a square image.

### 5.6 Asset inventory `public/images/play/**` (70 files)

```
public/images/play/
├── fashion-buyer/maison-laurent-atelier.webp (1672x941)   used by connect/mentorship, not Play
├── ib/                         Investment Banking (prefix "ib")
│   ├── face-{christina,cobalt-hr,jordan,lamisa,marcus}.webp   512x512   (5)  Level.cast chips
│   ├── face-christina-serious.webp  384x384  marketing Play chapter only
│   ├── l{level}-{nn}.webp  hero scene plates, named by ORIGINAL sheet screen id (21)
│   │     l1-04 1400x1050, l1-07 1400x934, l1-12 1400x788, l1-13 1400x934,
│   │     l2-02/07/08/18 1400x788, l2-09 2644x1487, l2-10 2896x1629, l2-19 3344x1882, l2-23 3072x1728,
│   │     l3-01 1400x788, l3-06 2896x1629, l3-07 1400x1555, l3-08 2896x1629, l3-14/16/17 1400x934,
│   │     l3-19/20 3344x1882
│   ├── expressions/{name}-{expression}.webp  ~0.49-0.73 ratio, 1800 tall (9)
│   │     christina-{concerned,proud,welcoming}, jordan-{confident,focused,uncertain},
│   │     marcus-assessing, lamisa-composed, cobalt-hr-welcoming
│   └── locations/{room}-{timeofday}.webp (8)
│         trading-floor-sunset, trading-floor-night, internal-boardroom-sunset, client-boardroom-sunset,
│         cafe-lounge-sunset, elevator-hallway-sunset (1600x900); reception, exterior-sunset (1448x1086)
└── rn/                         Registered Nurse (prefix "rn")
    ├── face-{denise,rosa,tyler,yvonne}.jpg  420-460 square (4)   Level.cast chips
    ├── {denise,rosa,tyler,yvonne}.jpg  ~1448x1086 (4)   UNREFERENCED (original portraits)
    ├── expressions/{name}-{expression}.webp  1024x2048 (10)
    │     rosa-{welcoming,proud,concerned}, denise-{composed,assessing,concerned},
    │     tyler-{confident,focused,uncertain}, yvonne-composed
    └── locations/ (7)  lobby, station, patient-room, corridor, staff-room, ward-night (.jpg 1672x941),
                        station-hero.webp (1672x941, the sim + level cover)
```
Counts: ib 44 (6 face incl. christina-serious + 21 hero [4 l1, 8 l2, 9 l3] + 9 expressions + 8 locations), rn 25 (4 face + 4 portraits + 10 expressions + 7 locations), fashion-buyer 1. Total 70, which matches `find public/images/play -type f | wc -l`.

Unreferenced in src: `ib/l3-01.webp` (the flagged D11 HR art, ib-level-3.ts:67-69), `ib/l3-07.webp` (the low near-square seated Lamisa art dropped per ib-level-3.ts:133-138), `rn/{denise,rosa,tyler,yvonne}.jpg`. `ib/l1-07.webp` is referenced only by dead `ART_RATIO`. Trailer and trademark notes: `l2-09.webp` still contains real "LOUIS VUITTON" branding and is a TEMPORARY placeholder "before any public release" (ib-level-2.ts:25-33, 151-156).

Other Play audio: `/audio/play/ib-main-song.mp3`, `/audio/play/ib-promotion-song.mp3`, `/audio/play/rn-main-song.m4a` (music.ts:18-25).

Naming conventions: career folder = short prefix (`ib`, `rn`); `face-<name>` for chips; `expressions/<name>-<expression>` for sprites; `locations/<room>[-<timeofday>]` for plates; hero plates `l<level>-<sheetScreen#>` (IB only; RN has no hero plates, its cover lives in locations/).

---

## 6. Level structures (beat by beat)

Columns: id | kind(variant/layout/method) | speaker [cast] | location or art | flags | scored (progress) | summary. "hero:" = own art; mood/tone/timer flags shown.

### 6.1 IB Level 1 Full (`ib-level-1.ts`), 37 beats, 10 scored, `hideBand: true`, 3 endings

Cast: Christina, Jordan, Marcus faces. Note: there is no `L1-12` id (the numbering skips it).

| id | kind | speaker [cast] | location / art | flags | scored | summary |
|---|---|---|---|---|---|---|
| **Act 1: Learn the Game** |||||||
| L1-01 | card/intro | Narrator | cobalt-exterior-sunset | celebrate, setup "Intern • Week 1" | | Welcome, first day begins |
| L1-02 | card/intro | Narrator | l1-reception | | | Stakes: 9 weeks, 7 interns, 2 invited back |
| L1-03 | card/intro | System | l1-reception | system | | Teach: what IB does |
| L1-04 | card/intro | System | l1-reception | system, example | | Example: sneaker company raising money |
| L1-05 | card/intro | System | l1-reception | system | | "Quick check before you start" (Express-cut id) |
| L1-06 | choice/options | System | l1-reception | dragEnabled | Q1 (0.1) | Easy win: who organizes a company purchase |
| L1-07 | card/character | Christina [Christina] | l1-reception | | | Christina card 1: Associate, guides you |
| L1-08 | card/character | Christina [Christina] | l1-reception | ladder You/Christina lit, Marcus dim | | Christina POWER card |
| L1-09 | reveal | System | l1-reception | | | 2 of 15 skill tags |
| L1-10 | card/intro | Narrator [Christina, Jordan] | l1-reception (2 slots) | | | Christina meets you, Jordan also starting |
| L1-11 | choice/options | Narrator [Christina, Jordan] | l1-reception | no setup (opens revealed) | Q2 (0.2) | Day 1: what first (systems training) |
| L1-13 | card/intro | Christina [Christina] | cafe | | | Learn the language of IB |
| L1-14 | focus | Christina [Christina] | cafe | | | Comps / Deck |
| L1-15 | focus | Christina [Christina] | cafe | | | Model / EOD |
| L1-16 | choice/blank | System | cafe | | Q3 (0.3) | "___ by EOD" = deck |
| L1-ACT1 | card/act | System | cafe | auto | | Foundation Complete |
| **Act 2: Prove You're Client-Ready** |||||||
| L1-17 | card/intro | Christina [Christina] | trading-floor-sunset | | | Billion-dollar clients: communicate like a pro |
| L1-18 | rapid (4) | Christina [Christina] | trading-floor-sunset | timer 45 | Q4 (0.4) | Email length, unknown number, deck error, EOD |
| L1-19 | card/intro | Christina [Christina] | trading-floor-sunset | | | Client information is confidential |
| L1-20 | choice/options | System | trading-floor-sunset | dragEnabled | Q5 (0.5) | Where client files go (data room) |
| L1-21 | card/character | Marcus [Marcus] | internal-boardroom | | | Marcus card 1: VP, 11 years |
| L1-22 | card/character | Marcus [Marcus] | internal-boardroom | ladder You/Marcus lit | | Marcus POWER card |
| L1-23 | card/intro | Marcus [Marcus, Christina] | internal-boardroom | castMembers ignored (no anchors) | | "Prove you catch the details" |
| L1-24 | choice/document | System | internal-boardroom | doc "Deal Summary • Intern Draft" | Q6 (0.6) | Find the line with 3 errors |
| L1-25 | choice/boss | Narrator | trading-floor-sunset | gold | Q7 (0.7) | Deal email with your name: thank the lead |
| L1-CHECK | card/act | System | trading-floor-sunset | secondaryCta "Finish Later" -> /play | | Client Ready checkpoint |
| **Act 3: Survive the Internship** |||||||
| L1-26 | card/character | Jordan [Jordan] | trading-floor-sunset | no ladder (peer) | | Meet Jordan, rival |
| L1-27 | card/intro | Narrator [Jordan] | hero: l1-12.webp | | | Jordan claims your spreadsheet |
| L1-28 | choice/options (5) | Narrator | hero l1-12 (fresh) | dragEnabled | Q8 (0.8) | Credit taken: speak to Christina privately |
| L1-29 | card/intro | Narrator | hero: l1-13.webp | resetScene | | 3 PM: an intern quits, due 6 PM |
| L1-30 | choice/options | Narrator | hero l1-13 (fresh) | dragEnabled | Q9 (0.9) | Ask Christina to help prioritize |
| L1-31 | card/intro | Narrator | hero l1-13 (fresh, 2 back) | mood night | | 6 PM, ~75 hr weeks |
| L1-32 | card/intro | Narrator | hero l1-13 (3 back, still fresh) | mood night | | 7 PM: intern with 200 misprinted pages |
| L1-33 | rank (3) | Narrator | trading-floor-night | mood night | Q10 (1.0) | Rank responses best to worst |
| L1-34 | card/intro | Narrator | trading-floor-night | mood night, spotlight score (no effect under hideBand) | | Christina noticed |
| L1-35 | card/chapter | Christina [Christina] | l1-reception | resetScene | | Neutral praise, "Begin Final Review" |
| L1-36 | review | System | ambient | | | Cobalt deciding return offers |

Endings: 85 "Bag Secured" (advances, primary "Unlock Analyst Level"); 40 "Retry Level" (primary "Play the internship again"); 0 "Terminated" (primary "Play this year again"). No `band` fields.

Express: `expressCut: ["L1-05","L1-ACT1","L1-CHECK"]` is kept only so Express is offered; Express actually plays `IB_LEVEL_1_EXPRESS_LEGACY` (ib-level-1.ts:43-53).

### 6.2 IB Level 1 Express LEGACY (`ib-level-1-express-legacy.ts`), 24 beats, 8 scored in full, frozen from commit f999ea2b

| id | kind | speaker [cast] | loc/art | flags | scored | summary | cut? |
|---|---|---|---|---|---|---|---|
| L1E-01 | card/intro | Narrator | reception | celebrate | | Welcome to Cobalt Capital | |
| L1E-02 | card/intro | Narrator | reception | | | Nine weeks, six interns, two offers | CUT |
| L1E-03 | card/intro | System | reception | system | | How IB works | CUT |
| L1E-03b | card/intro | System | reception | system, example | | 100 hospitals example | CUT |
| L1E-04 | check/drag | System | reception | | | Who helps buy a company | CUT |
| L1E-05 | card/character | Narrator [Christina] | reception | | | Christina card 1 | |
| L1E-06 | card/character | Narrator [Christina] | reception | ladder | | Christina POWER | CUT |
| L1E-07 | reveal | System | reception | | | 2 of 15 skills | CUT |
| L1E-08 | choice/options | Narrator [Christina, Jordan] | reception | | 0.1 | Day 1 first (systems training) | |
| L1E-09 | reveal | System | reception | spotlight score, 3 color rows | | Score explainer | CUT |
| L1E-10 | check/type | System | reception | answer "85" | | Minimum points | CUT |
| L1E-11 | flips (4) | Christina | cafe | | | Comps, Deck, Model, EOD | |
| L1E-12 | match (4) | Christina | cafe | | 0.2 | Request -> action | |
| L1E-13 | rapid (4) | Christina [Christina] | cafe | timer 45, prompt "" | 0.3 | Communication quiz | |
| L1E-13b | choice/blank | Christina [Christina] | trading-floor-sunset | risky "group chat" | (none) | Secure ___ = data room | |
| L1E-17 | card/character | Narrator [Marcus] | trading-floor-sunset | | | Marcus card 1 | CUT |
| L1E-18 | card/character | Narrator [Marcus] | trading-floor-sunset | ladder | | Marcus POWER | CUT |
| L1E-19 | choice/document | Christina | trading-floor-sunset | tone conflict | 0.7 | Maison Laurent summary errors | CUT |
| L1E-20 | card/character | Narrator [Jordan] | cafe | | | Jordan card | CUT |
| L1E-21 | choice/options | Narrator | hero l1-12 | tone conflict, risky | 0.8 | Jordan credit dispute | CUT |
| L1E-22 | choice/options | Narrator | hero l1-13 | timer 30, tone alarm | 0.9 | Partner quits | CUT |
| L1E-23 | choice/options | Narrator | trading-floor-night | resetScene | 1.0 | Help another intern | CUT |
| L1E-24 | card/chapter | Christina [Christina] | reception | | | "You stood out" | |
| L1E-25 | review | System | ambient | | | Reviewing your internship | |

Express plays 9 beats: 01, 05, 08, 11, 12, 13, 13b, 24, 25 (4 scored). Endings: 85 Trusted "Top of the Class" (advances), 60 Respected "So Close", 40 Cautious "No Return Offer", 0 At Risk "Contract Ended".

### 6.3 IB Level 2 Analyst (`ib-level-2.ts`), 25 beats, 10 scored, no expressCut

Cast: Christina, Jordan, Marcus, Cobalt HR.

| id | kind | speaker [cast] | loc / art | flags | scored | summary |
|---|---|---|---|---|---|---|
| L2-01 | card/offer | Narrator | hero l2-02 | facts x3 | | Analyst offer: $110,000 + bonus, 80-90 hrs |
| L2-02 | card/step 1/5 | Cobalt HR | trading-floor-sunset | resetScene | | Research the client |
| L2-03 | card/step 2/5 | Cobalt HR | trading-floor-sunset | | | Build the numbers |
| L2-04 | card/step 3/5 | Cobalt HR | trading-floor-sunset | | | Check for mistakes |
| L2-05 | card/step 4/5 | Cobalt HR | trading-floor-sunset | | | Update slides |
| L2-06 | card/step 5/5 | Cobalt HR | trading-floor-sunset | cta "Done" | | Take meeting notes |
| L2-07 | card/character | Narrator | hero l2-07 | | | Christina checks your work |
| L2-08 | card/character | Narrator | hero l2-08 | | | Marcus, VP |
| L2-09 | card/chapter | Narrator | hero l2-09 (placeholder, trademark) | resetScene, note | | "Your First Big Deal", Start Level 2 |
| L2-10 | choice/options | Narrator | hero l2-10 | | 0.1 | Ask for your role and deadline |
| L2-11 | chain (3) | Narrator | hero l2-10 (fresh) | | 0.2 | Goal, strength, outcome |
| L2-12 | card/chapter | Narrator | hero l2-10 (2 back) | mood night | | Late night grind |
| L2-13 | choice/tiles | Christina | hero l2-10 (3 back) | mood night, acceptable "rent" | 0.3 | Profit after ___ costs |
| L2-14 | slider (4) | Christina | trading-floor-night | mood night, Low = risky | 0.4 | How risky is an unchecked source |
| L2-15 | choice/document | Christina | trading-floor-night | mood night, 5 lines | 0.5 | Two market sizes contradiction |
| L2-16 | card/chapter | Narrator | trading-floor-night | | | Next morning 9 AM |
| L2-17 | flags (5) | Narrator [Jordan] | trading-floor-sunset | timer 60, tone alarm | 0.6 | Red flags in Jordan's math |
| L2-18 | card/character | Jordan | hero l2-18 | note | | Jordan responds, rivalry |
| L2-19 | choice/options | Christina | hero l2-19 | risky "pitching" | 0.7 | Take notes in the client meeting |
| L2-20 | match (4) | Narrator | internal-boardroom | resetScene | 0.8 | Valuation, Pitch, Due Diligence, Margin |
| L2-21 | rapid (4) | Marcus | internal-boardroom | NO timer | 0.9 | Marcus checks understanding |
| L2-22 | choice/options | Narrator | hero l2-23 | timer 30, mood night, tone alarm, risky | 1.0 | 1 AM contradiction: check sources |
| L2-23 | card/chapter | Christina | hero l2-23 | | | Your team notices you |
| L2-24 | card/chapter | Marcus | hero l2-23 (1 back, from L2-23) | note | | Plot twist: Jordan more visible |
| L2-25 | review | System | ambient (resetScene) | | | Reviewing Analyst performance |

Endings (4-band): 85 Trusted "Promoted to Associate" (advances, "Claim Your Reward"); 60 Respected "Another Year as Analyst"; 40 Cautious "Performance Review"; 0 At Risk "Contract Ended".

### 6.4 IB Level 3 Associate (`ib-level-3.ts`), 28 beats, 10 scored, no expressCut

Cast: Christina, Marcus, Lamisa, Cobalt HR.

| id | kind | speaker | loc / art | flags | scored | summary |
|---|---|---|---|---|---|---|
| L3-01..05 | card/step 1-5/5 | Cobalt HR | trading-floor-sunset | | | Review work, deadlines, guide Analysts, prep clients, speak up |
| L3-06 | card/character | Christina | hero l3-06 | note | | Christina made VP |
| L3-07 | card/character | Lamisa | internal-boardroom | resetScene | | Lamisa, Managing Director |
| L3-08 | card/chapter | Marcus | hero l3-08 | note | | Marcus to ED; Start Level 3 |
| L3-09 | rank (6) | Narrator | hero l3-08 (fresh) | | 0.1 | Order the six roles |
| L3-10 | card/chapter | Narrator | hero l3-14 | mood crunch | | Crunch time, 3 days |
| L3-11 | pick 2 of 5 | Narrator | hero l3-14 | crunch, timer 60, 2 harmful | 0.2 | Tasks that win vs Silverman Sacks |
| L3-12 | bucket (6) | Christina | hero l3-14 | crunch | 0.3 | Helps Cobalt win / Weak pitch |
| L3-13 | choice/document | Christina | hero l3-14 (3 back) | crunch, timer 60, prompt "Tap the best line." | 0.4 | Clearest headline |
| L3-14 | rapid (5) | Christina | hero l3-16 | crunch, timer 120 | 0.5 | Five calls, one clock |
| L3-15 | card/chapter | Marcus | hero l3-17 | | | Pitch day morning |
| L3-16 | pick 3 of 5 | Lamisa | hero l3-17 | | 0.6 | Correct Jordan respectfully |
| L3-17 | card/chapter | Narrator | hero l3-17 (2 back) | | | Crunch over, in the room |
| L3-18 | pick 3 of 6 | Lamisa | hero l3-17 (3 back) | timer 60, 1 harmful | 0.7 | Three reasons to choose Cobalt |
| L3-19 | card/chapter | Lamisa | hero l3-19 | | | After the pitch |
| L3-20 | card/chapter | Christina | hero l3-20 | | | Christina proud |
| L3-21 | card/chapter | Narrator | hero l3-20 | | | Maison Laurent reviewing |
| L3-22 | card/offer | Lamisa | hero l3-20 | facts x3 | | Deal secured, $30B raise |
| L3-23 | rank (4) | Christina | hero l3-20 (3 back) | | 0.8 | First four moves |
| L3-24 | bucket (5) | Christina | trading-floor-sunset | | 0.9 | Do first / Can wait |
| L3-25 | choice/tiles | Christina | trading-floor-sunset | TWO best choices, no `___` | 1.0 | Opening line of client update |
| L3-26 | card/chapter | Narrator | trading-floor-sunset | | | Corrected numbers sent |
| L3-27 | card/chapter | Narrator | trading-floor-sunset | | | Deal stays on track |
| L3-28 | review | System | ambient | | | Reviewing Associate year |

Endings: 85 Trusted "Promoted to Vice President" (advances, "Claim Your Reward"; no next level, so disabled and "Vice President is coming soon."); 60 Respected "Another Year as Associate"; 40 Cautious "Performance Review"; 0 At Risk "Contract Ended".

### 6.5 RN Level 1 New Grad RN (`rn-level-1.ts`), 27 beats, 10 scored

Cast: Rosa, Denise, Tyler, Yvonne faces. `expressCut: ["RN1-03","RN1-04","RN1-04b","RN1-05","RN1-07","RN1-08","RN1-10","RN1-11"]` (no scored beat cut, scale stays 1).

| id | kind | speaker [cast] | location | flags | scored | summary | Express |
|---|---|---|---|---|---|---|---|
| RN1-01 | card/intro | Narrator | corridor | celebrate | | Welcome to Riverbend | |
| RN1-02 | card/intro | Narrator | corridor | | | Four West, first year | |
| RN1-03 | card/intro | Narrator | corridor | | | Nobody works alone until ready | CUT |
| RN1-04 | card/intro | System | corridor | system | | What a nurse does | CUT |
| RN1-04b | card/intro | System | corridor | system, example | | 2 AM breathing example | CUT |
| RN1-05 | check/drag | System | corridor | | | Who notices first | CUT |
| RN1-06 | card/character | Narrator [Rosa] | station | | | Rosa card 1 | |
| RN1-07 | card/character | Narrator [Rosa] | station | ladder | | Rosa POWER | CUT |
| RN1-08 | reveal | System | station | resetScene | | 2 of 15 skills | CUT |
| RN1-09 | choice/options | Narrator [Rosa] | station | | 0.1 | Get report from the night nurse (easy win) | |
| RN1-10 | reveal | System | station | spotlight score, 3 colored rows | | Reputation outcomes | CUT |
| RN1-11 | check/type | System | station | answer "85" | | Minimum points | CUT |
| RN1-12 | flips (4) | Rosa | staff-room | | | Vitals, Chart, Report, Escalate | |
| RN1-13 | match (4) | Rosa | staff-room | | 0.2 | Quote -> action | |
| RN1-14 | rapid (4) | Rosa | staff-room | timer 45, question "", prompt "" | 0.3 | Nursing habits | |
| RN1-15 | rank (4) + whenClose | Narrator | corridor | | 0.4 | Four patients, triage order | |
| RN1-16 | choice/boss (2 opts) | Narrator | station | | 0.5 | Credit: thank and name helpers | |
| RN1-17 | choice/blank | Rosa | station | risky | 0.6 | Only open your own patient's record | |
| RN1-18 | card/character | Narrator [Denise] | station | | | Denise card 1 | |
| RN1-19 | card/character | Narrator [Denise] | station | ladder | | Denise POWER | |
| RN1-20 | choice/document | Rosa | station | timer 40, tone conflict, resetScene | 0.7 | Handover note with 3 errors | |
| RN1-21 | card/character | Narrator [Tyler] | station | no ladder | | Tyler, peer | |
| RN1-22 | choice/options | Narrator [Tyler] | station | tone conflict, resetScene, acceptable | 0.8 | Tyler claims your catch | |
| RN1-23 | choice/options | Narrator | patient-room | timer 30, tone alarm, risky | 0.9 | Patient deteriorating: interrupt Rosa | |
| RN1-24 | pick 3 of 6 | Narrator | ward-night | | 1.0 | Handover report essentials | |
| RN1-25 | card/chapter | Rosa | ward-night | | | Rosa's neutral praise | |
| RN1-26 | review | System | ambient | | | Ready to work on your own? | |

Endings: 85 Trusted "You are off orientation." (advances, "Unlock Level 2"; no L2 built, so disabled and "Staff Nurse is coming soon."); 60 Respected "Not yet."; 40 Cautious "Not this year."; 0 At Risk "Terminated". All primaries for non-advancing endings are "Start over". Header (rn-level-1.ts:20-24): endings are "Draft pending approval"; the whenClose rank is "a rules conflict to settle for all 25 careers".

### 6.6 Derived reusable pacing template

Derived from RN L1 (declared "built to the same SOP as the IB simulation", rn-level-1.ts:5-8) and IB L1:

1. **Arrival (unscored, one idea per screen):** `card/intro celebrate` (setup "<Role> • Year/Week 1") -> `card/intro` stakes line (a TRUE stake; "Nursing has no two-of-six-get-offers scarcity, so this career never invents one", rn-level-1.ts:10-12) -> `card/intro system` "What a <job> actually does" -> `card/intro system` with `example` on its own screen -> `check` (drag) comprehension gate.
2. **Mentor intro:** two character cards: role card, then POWER card with `ladder` (You + mentor lit, next senior dim).
3. **Skills reveal:** `reveal` of the 2 skills the next scored beat awards, note "2 of 15".
4. **Scored beat 1 = deliberate easy win:** `choice/options`, 3 options, no timer, progress 0.1.
5. **Score explainer:** `reveal` with `spotlight: "score"` and 3 colored rows (red <40, amber 40-84, green 85+), then `check/type` answer "85" with the band hint. (Retired on hideBand levels: the HUD score is tappable instead.)
6. **Vocabulary taught then tested:** `flips` of 4 words (or two `focus` pairs), then a scored `match` (quote -> action) or `choice/blank` using those words. "nothing is taught that is not needed" (rn-level-1.ts:229-231).
7. **Rapid habits quiz:** `rapid`, 4 items, 45 s shared timer.
8. **Floor gets busy:** rank (triage), boss moment, blank with one `risky` option.
9. **Judge intro:** two character cards for the next senior (role + POWER ladder) placed right before they matter, then a timed `document` error-catch (3 errors on one line) with `tone: "conflict"`.
10. **Peer rival:** ONE character card (no power card), then a `tone: "conflict"` choice where composure is best.
11. **Crisis:** timed (30 s) `tone: "alarm"` choice with a `risky` option (-6).
12. **Close:** final scored beat at progress 1.0 (IB: rank; RN: pick "give report"; "The level opens on receiving report and closes on giving it"), then a neutral praise `card/chapter` said to every player, then `review` (System), then endings.

IB L1 rebuild variant: a three-act structure with `card/act auto` after Act 1 and a `card/act` checkpoint with `secondaryCta` after Act 2, `focus` pairs instead of flips, binary tiers only, `hideBand`, 3 endings. IB L2/L3 variant (promotion levels): offer card -> 5-step `Cobalt HR` onboarding carousel -> character cards -> `chapter` "Start Level N" -> scored beats interleaved with chapter cards and a mood stretch (night / crunch) -> debrief chapters -> review.

Invariants seen across all four Full levels: exactly 10 scored beats; progress 0.1 steps; every scored beat has `planLineIfFailed`, 2 skills and a `feedbackCta`; last beat review; min-0 ending exists; review beats have no location.

---

## 7. Authoring rules recorded in code comments (file:line)

types.ts
- 6-8 exactly one Best, roughly one Risky, none for rapid children.
- 11-16 binary scoring rebuild 20 Sept (quoted in 1.2).
- 25-27 headlines derived, never authored.
- 52-55 Action Prompt; button screens skip it.
- 61-70 sticky art; resetScene "an offer letter's own art bleeding into the onboarding steps".
- 94-104 progress / planLineIfFailed only on the ten scored beats.
- 129-142 Act Moment (auto) vs checkpoint (secondaryCta) "the one place a student is offered a mid-level exit".
- 143-148 ladder: "a rung always carries its job title, never a bare name... Only ever shows rungs the student has actually met (Characters tab)."
- 149-153 System Card: "so a student can tell the game talking from the job talking".
- 154-157 celebrate: "(Joshua Pierce, Slack, 6 Sept 2026: 'the student is genuinely arriving for the first day of their new job')".
- 161-166 check method choice (tap concept / type recall / drag deliberate).
- 182-185 flips: "no flip-to-reveal, per direct feedback".
- 216-217 timeout = Wrong, never Risky.
- 222-227 dragEnabled "A card is always still tappable, so a missed drag never strands anyone."
- 269-272 chain: "partial credit would teach three separate facts instead of one skill".
- 310-314 rank whenClose "the RN handoff's three-band scoring".
- 424-429 hideBand "the band word is RETIRED", 20 Sept.
- 430-435 expressCut "All are teaching screens -- every scored beat must survive" (contradicted later by the legacy file cutting scored beats).
- 440-447 expressSource "(direct feedback, 21 Sept 2026...)".

games.ts
- 18-22 trailer seven-beat shape travels to every career. 29-30 "Lamisa is SEEN before she is met". 35-37 "The top three are not documented anywhere." 47-51 RN "no numbers we cannot source (D04)". 58 "Yvonne is SEEN here and introduced properly at Level 3." 63 "nursing genuinely has six". 69-75 SOON own covers "per direct correction". 81-84 featured row. 115-118 "{Subject} Terms" (direct feedback, 9 Sept 2026). 121-125, 129-130 glossary dummy cards (9 Sept 2026).

scoring.ts
- 3-6 "Do not invent new scoring -- every career copies this." 12-17 THE STRIKE RULE. 24-26 ranges spelled out. 59-60 one pass rule for all.

skills.ts 1-5: O*NET; "Student-facing wording is Joshua's. A chip a student cannot decode is decoration (Interaction Rules): every chip that shows a skill name is tappable".

progress.ts 1-5: "'Save at the last completed screen... Students play in short bursts between classes.'"

performance-plan.ts
- 1-13 fires on 3 strikes, not a scored beat, "full RED ambience, the only place in the game red is used"; structure identical everywhere. 20-22, 318-319 "MUST RANDOMISE POSITION". 50-52 plan questions never change across careers.

expressions.ts
- 3-15 (quoted in 5.4). 37-38 RN cast "chroma-keyed from the RN_Game_Asset_Pack's green-screen masters (generated to docs/handoff/sprite-master-prompt.md)". 67-69 default = most neutral expression. 73-76 Marcus/Lamisa single approved expression. 83-85 "Cobalt HR" "reverted from D11's 'hand it to Christina'... per direct instruction". 94-103 measured ratios.

locations.ts
- 1-13 locations replace ambient gradient; hero scenes always win; locations not sticky. 22-28 reception bespoke. 30-32 exterior 20 Sept. 58-62 boardroom anchor strip. 86-89/111-112 centered full scale. 147-156 RN 1.75 scale (direct feedback). 203-222 routing rules and tie-break. 224-228 L1 every beat gets a room. 231-233, 235-237 L1-01 exterior; L1-02..11 "the story hasn't left reception yet". 248-249 cafe for teaching. 262-263 Marcus in the internal boardroom. 268-269 boss on the open floor. 282-283 6 PM onward is night. 288 "full circle with L1-02". 292-303 L1E namespace "do not merge". 383-386 RN ids "RN1-xx so they can never collide"; "The Day-1 morning run holds one room... the same visual-congruence rule".

art-ratios.ts 1-4: "Regenerate when art is added -- a missing entry falls back to 16:9." (But unused, see 5.3.)

ib-level-1.ts
- 4-21 20 Sept rebuild; "Copy is verbatim from the sheet: 25-word setups, 10-word options, no em dashes, written for a 13 year old"; `feedback` not displayed; "Art is reused, never invented". 38-41 hideBand. 43-51 Express revert (direct instruction, 21 Sept 2026). 105-106 "Beat 1 is always the easy win (Interaction Rules): one obvious right answer, three options, no timer." 223-224 new Q3 tests the four words. 243-244 act auto "no reading". 266-267 all four must be right (contradicted by code). 401-402 "Boss Moment, re-added 20 Sept: gold overlay, never red, counts as one of the ten scored beats." 421-423 checkpoint "the only place the student is OFFERED an exit". 437 "Jordan has no power over the player -- one card, no ladder." 459-461 "'Crash out' and 'Subtweet him' are deliberate voice, not to be softened." 494-495 "Options deliberately close in length so the correct one does not give itself away." 533-535 "a perfect run reaches 100 here and nowhere earlier." 551-552 L1-34 not scored. 563-565 "Praise made neutral: said to every student... so the review that follows never reads as a lie." 585-587 three outcomes, band word gone.

ib-level-1-express-legacy.ts
- 3-33 frozen snapshot, L1E- namespace. 50-76 all Express cuts with dated feedback (9 Sept 2026) and "not rebalanced against the 85-point Trusted threshold... flagging rather than guessing". 81-85, 91-92 arrival event (6 Sept, 9 Sept 2026). 103 "The stakes line is what makes Jordan matter later." 118-119 example on its own screen. 130-134 check is not scored (D53), token-DRAG (D75). 158 "Useful about her role, not her past (direct feedback, 6 Sept 2026)". 163-165 power card (D89), rungs met only (D92). 181-182 "showing two of fifteen with no count read as the whole list" (D86). 196 easy win (D73). 205-217 setup restored so the beat is `stageable`. 231-233 three rows not four (D93). 249-250 typed recall (D67). 263 taught before tested (D68). 280-281 request-to-action pairs (D68/D71). 303-308 restored quiz. 317-318 "no restatement and no 'Tap fast' (direct feedback, 6 Sept 2026)". 362-367 lettered sub-beats carry no progress. 387 Marcus cards before he is named (D60). 414-415 three errors on one line (D94/D96). 438-439 Jordan described by what he does (D83/D97). 451-453 rebalanced (D84). 504-506 resetScene reason. 579-581 "never the word 'fired' -- these are 13 and 14 year olds."

ib-level-2.ts
- 3-33 production changes D10, D11 reverted, D16, narrative cards do not advance progress; D06 open; trademark D08/D09. 73-74, 151-156 L2-09 placeholder. 173-176, 361-364 branding patched out. 239-240, 311-312 "Dreamy removed from the simulation (D62)". 384-386 resetScene reason. 404 "Level 2's rapid-fire model has NO timer". 438-439 D16. 455-456 "NEW BEAT... to reach ten scored questions and to cover Problem-Solving." 506-511 review not routed; SYSTEM card (D62). 549-550 "E-TERM... Deep red, no confetti."

ib-level-3.ts
- 3-44 46 sheet screens collapse to 28/30 beats; D11, D22, D26, D01/D23, D31, D32, D30; L3-30 offer left out ("TO BE RESEARCHED" D36/D37); trademark removal. 67-69 l3-01 flagged art. 133-138 "resetScene is load-bearing here". 247-249 prompt override (direct feedback, 9 Sept 2026 QA pass). 399-402, 414-415 asset package notes.

rn-level-1.ts
- 3-24 same SOP; no invented scarcity; RN1-xx ids; known blockers (salary proposals, draft endings, whenClose rules conflict). 42-48 Express cuts (direct feedback 9 Sept 2026, Chandu 7 Sept 2026). 53-55, 61 arrival treatment. 76-77 stakes line is true. 97-98 example on own screen. 109-110 check not scored. 128-130 "'nursing assistant' is taught inside the sentence because a later beat depends on the term." 137 "mirroring Christina's card (direct feedback, 6 Sept 2026)". 157 "The two chips shown are the two the very next beat awards." 180-181 "the room must not be empty while the line says she is standing in it." 196-197 score explainer. 213-214 typed recall. 229-231 flipbook, nothing taught not needed. 277-279 blank question/prompt reason. 325-328 three-band rank reasoning. 369-370 "the -6 is genuinely how nurses lose their licence". 390 Denise two cards. 417-418 three errors of two kinds on ONE line. 443-444 "Tyler: one card, no power card... what he does is described, never explained." 456 "Composure, every single time: the lesson is never to compete." 465-466 Tyler's uncertain face carries the conflict tone. 481 "The second -6". 504 opens on receiving report, closes on giving it. 531-532 Rosa says this regardless of score. 551-553 three outcomes, four screens.

src/app/play/[game]/page.tsx: 13-14 one route per simulation; 28-38 Express derivation and expressSource; 48-52 keyed on level to avoid state leaking between levels.

SimulationPlayer.tsx: 61-67 DEMO-ONLY. 73-77 SCORED_KINDS. 85-88 Express slot. 112-126 score scaling (direct feedback, 9 Sept 2026). 144-147 once per level. 159-164 "Without these panels Express is not a faster mode, it is an incomplete one". 183-185 terms underline once. 267-273 repair banks acceptable. 293-295 "No feedback. Fires the moment the third strike lands". 1088-1091 no mascot (D62). 1160-1163 system cards center screen (direct feedback). 1207-1210 "(Joshua Pierce, Slack, 6 Sept 2026): once a character has said the line in the scene, the activity screen does not repeat it." 1437-1439 world color gauge (Chandu, 7 Sept 2026). 1585-1586 RN voice pitches (Chandu, 7 Sept 2026). 1919-1920 outcome-first wording (Scoring Model, 20 Sept). 2084-2090 pull instead of push. 2177 clock "SILENT, per direct instruction". 2216-2219 D55 feedback card = headline + ONE sentence + chips + score. 2393-2394 repair rationale.

interactions.tsx: 38-46 randomized positions ("harder to game the system", direct request). 226-229 Act Moment. 356-365 ladder drawn as a diagram (direct feedback). 1041-1049 blank drag-or-tap (added after players got stuck). 1245-1255 match no partial credit. 1503-1509 rapid per-option why shown (direct feedback, 10 Sept 2026). 1894-1895 36px arrow targets (mobile audit, 9 Sept 2026).

---

## 8. DEMO-ONLY flags

`grep -rn "DEMO-ONLY" src/components/play src/app/play` returns exactly one hit:

- `src/components/play/SimulationPlayer.tsx:61-67`: `export const DEMO_CONNECT_SHORTCUT = true;`. "a HUD button that jumps straight to the Connect interstitial without replaying a level (direct instruction, 17 Sept 2026...). Flip back to false before this ships to students." Wired at SP:620 (only when a next level exists), rendered as a FastForward icon "Demo: jump to Connect" (SP:2063-2074).

Non-tagged items that behave like demo/pre-launch state (not flags, but flagged in comments):
- `L2-09` art `l2-09.webp` contains a real trademark and is a "TEMPORARY PLACEHOLDER... Live on the pre-launch internal deployment ONLY" (ib-level-2.ts:151-156).
- RN endings "Draft pending approval" (rn-level-1.ts:22).
- `ScoreGauge`'s `DEMO_STEPS` (SP:1398) is the spotlight teaching animation, not a demo flag.

---

## 9. Quick list of code-vs-comment conflicts (for the engineer)

1. Rapid pass: `L1-18` comment says 4/4 required; code passes 3/4 (`passThreshold`).
2. Rank partial credit: comments say "one adjacent swap"; code accepts >= n-2 in place, any transposition.
3. `TIER_SCORE.wrong` is -5 everywhere; L2/L3/RN comments and the spotlight demo still say -3.
4. `beat.progress`, `level.title`, `level.blurb`, `ending.band`, `beat.pose`, `ART_RATIO`, `RapidBeat.question`, `ChainBeat.steps[].prompt`, `FlagsBeat.rows[].why`, and every scored `feedback` string are never displayed or read.
5. `slider.timer` declared but not enforced.
6. `CardBeat.note` color hardcoded to the Business & Finance world var, not the level accent.
7. `hideBand` does not hide the band word on the ending card.
8. `spotlight: "score"` has no effect on `hideBand` or Express levels.
9. `castMembers` only works at `l1-reception`; L1-23 shows Marcus alone.
10. Single `characterAnchor.x` is ignored (always centered).
11. A failed Performance Plan restarts the level through its own card, never the min-0 Ending.
12. Strikes and `pipUsed` are not persisted across resume.
13. `L3-25` has two Best choices and a `tiles` question with no `___`.
14. `PERFORMANCE_PLANS` fallback to IB for unknown sims; no entry for `n > 3`.
15. Plan skill "Evaluating Outcomes" is not in `SKILL_MEANING`.
16. Trailer finale "Start Level 1" only closes the overlay.
17. Repair hint "+2, not the full +5" is wrong under Express scaling.
18. An `act` card without `auto` or `secondaryCta` has no visible button.
