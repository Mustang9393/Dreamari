# Play SOP, chapter 3: Simulation interactions (all 15 beat kinds)

> Reference chapter of the Play SOP. Start at [README.md](README.md). This chapter was produced by a line-by-line read of the source at commit `2ff4bd5d` (26 Sept 2026); every `file:line` reference is against that commit, so re-check line numbers if the files have moved. Conventions: `UNCLEAR:` means the code alone does not settle it; `OBSERVED:` / `FINDING:` / `GAP:` / `BUG:` mark something a rebuild would get wrong by trusting comments or field names. All of them are collected, with a recommended decision, in [06-known-issues-and-decisions.md](06-known-issues-and-decisions.md).

Audience: Usman (backend) and his AI agent, recreating and scaling "Play" career simulations.

Files read in full: `src/components/play/interactions.tsx` (2117 lines), `src/components/play/types.ts` (481 lines).
Files read in part: `src/components/play/SimulationPlayer.tsx` (mount/resolve/timer/feedback/dialogue box), `scoring.ts`, `sound.ts`, `src/components/flow/ConfirmShimmer.tsx`, `src/components/flow/GestureSpotlight.tsx`, `src/components/build/ui.tsx` (LocalBurst), `src/components/app/IconTip.tsx`, `src/components/app/app.css` (dm-* utilities), `src/app/globals.css` (keyframes), `src/components/marketing/tokens.css` (token values). Content examples come from `ib-level-1.ts`, `ib-level-2.ts`, `ib-level-3.ts`, `rn-level-1.ts`.

Conventions in this file:
- `I:123` = `src/components/play/interactions.tsx` line 123. `T:` = `types.ts`. `SP:` = `SimulationPlayer.tsx`. `SC:` = `scoring.ts`. `SND:` = `sound.ts`. `G:` = `src/app/globals.css`.
- "UNCLEAR:" = I could not confirm it from code. "GAP/BUG:" = something in code that looks wrong or inconsistent with its own comments; flagged, not fixed.
- Pixel values are literal Tailwind arbitrary values from the source (`px-[18px]` = 18px horizontal padding).

---

## 0. Inventory: every interaction kind that exists

`Beat` union (T:373-388) has 15 kinds. Component per kind, and whether it is scored (feeds reputation). SCORED_KINDS is at SP:77.

| `kind` | Sub-mode | Component (file:line) | Scored? | Used in shipped content |
|---|---|---|---|---|
| `card` | `variant`: intro / character / chapter / offer / step / act | `CardBody` I:219 (+ `PowerLadder` I:366, `BandLadder` I:341) | No | Everywhere (23 in IB1) |
| `review` | - | `ReviewBody` SP:1321 (lives in the player, not interactions.tsx) | No | 1 per level |
| `check` | `method`: tap / type / drag | `CheckBody` I:418 | No (never a strike) | RN1: drag (RN1-05), type (RN1-11). `tap` not used by any current level (IB1's check was cut in the 20 Sept rebuild). |
| `reveal` | - | `RevealBody` I:647 | No | IB1 L1-09, RN1-08, RN1-10 |
| `flips` | - | `FlipsBody` I:723 | No | RN1-12 (IB1 now uses `focus` instead) |
| `focus` | - | `FocusBody` I:822 | No | IB1 L1-14, L1-15 |
| `choice` | `layout: "options"` | `ChoiceBody` I:892 renders `OptionButton` list | Yes | Many |
| `choice` | `layout: "options"` + `dragEnabled: true` | `DragOptionsBody` I:935 | Yes | IB1 L1-06, L1-20, 2 more |
| `choice` | `layout: "blank"` / `"tiles"` | `BlankBody` I:1050 | Yes | IB1 L1-16 (blank), IB2 L2-13 (tiles), IB3 L3-25 (tiles), RN1-17 (blank) |
| `choice` | `layout: "document"` | `DocumentBody` I:1167 | Yes | IB1 L1-24, IB2 L2-15, IB3 L3-13 (timed 60s), RN1 |
| `choice` | `layout: "boss"` | `BossOverlay` I:1213 (mounted directly by `BeatStage`, SP:1199-1202, NOT via `ChoiceBody`) | Yes | IB1 L1-25, RN1-16 |
| `match` | - | `MatchBody` I:1259 (+ `MatchTile` I:1359) | Yes | IB2 L2-20, RN1-13 |
| `rapid` | - | `RapidBody` I:1407 | Yes (set = 1 beat) | IB1 L1-18, IB2 L2-21, IB3 L3-14, RN1-14 |
| `chain` | - | `ChainBody` I:1537 | Yes | IB2 L2-11 |
| `slider` | - | `SliderBody` I:1625 | Yes | IB2 L2-14 |
| `flags` | - | `FlagsBody` I:1700 | Yes | IB2 L2-17 (timed 60s) |
| `rank` | optional three-band via `whenClose` | `RankBody` I:1775 | Yes | IB1 L1-33, IB3 L3-09, L3-23, RN1-15 (three-band) |
| `pick` | - | `PickBody` I:1937 | Yes | IB3 L3-11 (timed), L3-16, L3-18 (timed); RN1-24 |
| `bucket` | - | `BucketBody` I:2027 | Yes | IB3 L3-12, L3-24 |

Not implemented anywhere (do not assume they exist): typed numeric with tolerance, free text, multi-select-without-count, drag-to-zone with multiple zones, timed "tap fast" game separate from `rapid`, skill-chip picker. "Skill chips" exist only as the tappable chips on the feedback sheet (SP:2277-2306) and as the `reveal` beat used to teach two of them.

Timed beats in shipped content (awk over the four level files): L1-18 rapid 45s; L2-17 flags 60s; L2-22 choice 30s; L3-11 pick 60s; L3-13 choice(document) 60s; L3-14 rapid 120s; L3-18 pick 60s; RN1-14 rapid 45s; RN1-20 choice 40s; RN1-23 choice 30s.

---

## 1. How an interaction is mounted and how its result travels (read this first)

### 1.1 Mount chain
`SimulationPlayer` -> `BeatStage` (SP:1037, keyed `key={beat.id}` at SP:666 so each beat is a fresh mount) -> `DialogueBox` (SP:1632) -> `BeatBody` (SP:1264) -> the `XBody` component.

- `BeatBody` switch: SP:1295-1309 (exact mapping, in order): card -> `CardBody`, check -> `CheckBody`, reveal -> `RevealBody`, flips -> `FlipsBody`, focus -> `FocusBody`, choice -> `ChoiceBody`, match -> `MatchBody`, rapid -> `RapidBody(remaining)`, chain -> `ChainBody`, slider -> `SliderBody`, flags -> `FlagsBody(remaining)`, rank -> `RankBody`, pick -> `PickBody(remaining)`, bucket -> `BucketBody`, fallthrough -> `ReviewBody`.
- Boss is special-cased BEFORE `BeatBody`: `beat.kind === "choice" && beat.layout === "boss"` renders `<DialogueBox gold ...><BossOverlay/></DialogueBox>` (SP:1199-1202). Consequence: boss gets no Action Prompt line from `BeatBody` (the authored `prompt: "Choose one."` on RN1-16 is never rendered; UNCLEAR whether intended) and no digit keys (see GAP list).
- Props each body receives:
  - Unscored: `onNext: () => void` (advance to next beat). `CardBody` and `FlipsBody` also get `accent` (the world color, `WORLD_COLORS[simulation.world] ?? "var(--primary)"`, SP:157).
  - Scored: `onResolve: Resolve` where `type Resolve = (tier: Tier, why: string, id?: string) => void` (I:36). `ChoiceBody`/`BossOverlay` also get `locked: string | null` (the id of the locked option, owned by the player). `RapidBody`, `FlagsBody`, `PickBody` also get `remaining: number` (seconds left on the shared clock).
- Header comment I:31-33: "Each one owns its own rules from the Interaction Rules tab and reports a single result upward: one tier, and the line that explains THAT answer. Nothing here knows about reputation or navigation."

### 1.2 Staging: the interaction does not exist until the setup line is read
- `stageable = Boolean(beat.setup) && kind !== "card" && kind !== "review"` (SP:1102). If stageable, `revealed` starts false.
- DialogueBox types the `setup` line with `useTypewriter` (26 ms/char). While typing, a tap on the box / Space / Enter / ArrowRight(see bug) / "a" key skips to the full line. Once typed and `held`, a "Continue" link appears (13px, uppercase, accent color, chevron with `play-nudge 1.1s`), SP:1852-1862. Pressing it calls `onAdvance` -> `revealed = true`.
- Children (the interaction) render only when `done && !held` (SP:1863-1869), wrapped in `motion-safe:animate-[fade-slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]`. So every interaction enters with a 6px rise + fade over 0.4s, then its own per-row stagger.
- Once revealed, a staged beat's setup line is HIDDEN (SP:1207-1210, "The general rule (Joshua Pierce, Slack, 6 Sept 2026): once a character has said the line in the scene, the activity screen does not repeat it."). So the question must stand alone without the setup.
- When the interactive screen takes over: backdrop blurs (`dimmed`, SP:418-423) and `playFocusMoment()` (220 Hz sine, 0.22s) fires once on the false-to-true edge (SP:447-451).
- Layout of the box: interactive beats are vertically centered, `max-w-[720px] sm:max-w-[clamp(720px,50vw,1000px)]`; cards/dialogue are bottom-docked `max-w-[620px] sm:max-w-[clamp(620px,43vw,880px)]` with `mb-[3dvh] sm:mb-[4dvh]` (SP:1164-1196). Box: `max-h-[76dvh] overflow-y-auto` (class `dm-scroll`), padding `px-16 pt-20 pb-16`, `sm:px-[clamp(20px,1.4vw,32px)] sm:pt-[clamp(22px,1.53vw,34px)]`, `gap-[var(--space-3)]` (12px), `backdrop-blur-[22px]`, background `color-mix(in srgb, var(--background) 86%, transparent)` (system voice 93%). Shape: system = `rounded-[var(--radius-sm)] border`; character = `rounded-[var(--radius-lg)] rounded-tl-[6px] border-2`; narrator = `rounded-[var(--radius-lg)] border-2`. Edge color: gold (boss/celebrate) `--world-business-money-office`; tone alarm `--destructive`; tone conflict `--world-building-construction`; system `color-mix(accent-subtle 40%, glass-border-raised)`; else `--color-glass-border-raised` (SP:1747-1759). Long content therefore SCROLLS inside the box; nothing in the interactions clamps text.
- The whole box has `onClick={step}` (SP:1826). Once the interaction is showing, `step` is a no-op, so clicks inside interactions are safe.

### 1.3 The Action Prompt line (small grey instruction above every interaction)
- Rendered by `BeatBody` (SP:1281-1293): `<p class="text-[12px] font-bold tracking-[0.04em]" color=--muted-foreground>` placed above the body in a `flex-col gap-[var(--space-2)]` (8px).
- Text = `beat.prompt ?? DEFAULT_PROMPT(beat)`. Cards and review never get one. Authoring `prompt: ""` suppresses it (empty string is not nullish, then falsy, so nothing renders) -- RN1-14 does this on purpose (rn-level-1.ts "Blank, not omitted...").
- `DEFAULT_PROMPT` (SP:1236-1262), verbatim:
  - choice blank/tiles: "Drag or tap the right word into the space."
  - choice document: "Tap the line with the mistake."
  - choice boss: "Choose one." (never shown, see 1.1)
  - choice with timer: "Tap one before the timer runs out." else "Tap one."
  - match: "Tap a quote, then tap its match."
  - rapid: timer ? "Quick questions, one timer. Tap fast." : "Quick questions. Tap fast."
  - slider: "Slide to your answer, then confirm."
  - flags: "Tap every problem you can find, then submit."
  - rank: "Move the rows into order, then submit."
  - pick: `Pick ${beat.pick}, then submit.`
  - bucket: "Sort each one into a bucket."
  - chain: "Build the answer one step at a time."
  - check / reveal / flips / focus: undefined (no default; author `prompt` yourself if wanted -- RN1-05 authors "Drag the blue dot to the answer, or tap the answer.", RN1-12 "Tap the card for the next word.").

### 1.4 What happens after `onResolve(tier, why, id)` (the player's `resolve`, SP:263-308)
1. Ignored if already `locked` (double-resolve guard at the player level).
2. `setLocked(id ?? "resolved")` immediately. Bodies that read `locked` (Choice family) repaint the picked option now. Timer interval stops (it depends on `locked`).
3. Hold on the board: `hold = (tier wrong|risky) ? 1150 : 420` ms (SP:267-270). Comment: "long enough to see what you picked land, and longer on a miss so the revealed right answer is readable before the explanation covers it."
4. Repair round banking: if replaying a missed beat, best/acceptable are banked as `acceptable` (SP:271-273: "A repair can rescue a beat but never earn full marks for it").
5. Strikes (SC:18-22): wrong = 1, risky = 2; third strike (`STRIKE_TRIGGER = 3`) opens the Performance Plan (PIP) INSTEAD of the feedback sheet, once per level (SP:285-294), using the beat's `planLineIfFailed` string.
6. Otherwise `setResult({tier, why, delta: scoredValue(tier)})` and `phase = "feedback"` -> `FeedbackSheet` (SP:2220).
- Points: `TIER_SCORE` best +5, acceptable +2, wrong -5, risky -6, none 0 (T:17-23), multiplied by `scoreScale = 10 / (number of scored beats in this level)` and rounded (SP:127-131), so a perfect run always lands at 100 even in Express. Reputation starts at 50 (SC:8), clamps 0-100.
- The `id` argument only matters for Choice-family beats (it drives which option shows as picked). Composite interactions (match, rapid, chain, flags, rank, pick, bucket, slider) call `onResolve(tier, why)` with no id -> `locked = "resolved"`.
- `why` is the ONE sentence the feedback sheet shows (D55). For choice beats it is the picked option's `why`; for composite beats it is `whenRight` / `whenWrong` / `whenClose` / `whenHarmful` / `whenPass` / `whenFail`.

### 1.5 FeedbackSheet (what the student sees after every scored interaction)
SP:2216-2322. Comment SP:2216-2219: "D55: a feedback card is a headline of two or three words, then ONE sentence, then the skill chips and the score -- nothing else. The sentence is the Why line for the option the student actually chose (result.why); the beat-level feedback body is no longer shown."
- Full-screen scrim `color-mix(--background 58%)` + `backdrop-filter: blur(28px)`; card `max-w-[620px]`, `rounded-[var(--radius-lg)] border-2 px-18 py-18`, background `--background 92%`, border = verdict color; entrance `play-sheet-up 0.44s cubic-bezier(0.16,1,0.3,1)` (translateY 22px -> 0 + fade).
- Verdict color: delta > 0 -> `--color-feedback-success`; delta <= -6 -> `--destructive`; else `--world-building-construction` (orange).
- Headline = `TIER_HEADLINE[tier]` (T:28-34): "Strong move!", "That works.", "Not quite.", "Risky call." Derived, never authored. 21px display font.
- Score readout right-aligned: `+5 · 55` style, 14px extrabold tabular-nums.
- Speaker's tier-reaction portrait 72x72 (`expressionFor(beat.speaker, tier)`), entrance `play-character-enter 0.32s`.
- `why` at 15.5px semibold.
- Skill chips from `beat.skills`: `dm-quiet` pills, 11.5px, `rounded-[var(--radius-md)] px-10 py-4`; tap toggles a meaning line from `SKILL_MEANING` (skills.ts:7). Chip names MUST be keys of `SKILL_MEANING` or the meaning line silently doesn't render. Current keys: Critical Thinking, Problem-Solving, Decision-Making, Active Learning, Self-Reflection & Improvement, Reading Comprehension, Active Listening, Verbal Communication, Written Communication, Social Awareness, Teamwork & Collaboration, Persuasive Communication, Helping & Supporting Others, Teaching & Guiding Others, Time Management, Leadership & Team Management.
- CTA = `beat.feedbackCta` (fallback "Continue"), `autoFocus`, `dm-solid`. Window keydown Enter / Space / "ChevronRight" advances (SP:2228-2238; see BUG: "ChevronRight" is not a real key name).
- `beat.feedback` (the beat-level string every scored type still requires) is NOT rendered anywhere (grep confirms only `skills`/`feedbackCta` are read). Authors can leave it `""` (IB1/RN1 do).

### 1.6 The shared clock (timed beats)
- Owned by `BeatStage` (SP:1110-1143), not by the interaction. `seconds = beat.timer` if present (only Choice, Rapid, Slider, Flags, Pick types declare `timer`).
- Starts only when `revealed` (SP:1118-1120: "A timed beat must not burn its clock while the player is still reading the situation."). Pauses when `paused` (feedback phase) or `locked`; resumes from `remainingRef` (SP:1112-1114).
- Ticks every 100 ms against a wall-clock deadline (`Date.now()`), so it does not drift.
- On expiry: ONLY for `kind === "choice"` does BeatStage itself resolve: `onResolve("wrong", "Time ran out. In a real week, silence is its own answer.", fallback.id)` where fallback = first `wrong`-tier choice or `choices[0]` (SP:1130-1133). Rapid / Flags / Pick handle expiry themselves by watching `remaining <= 0`. Slider has a `timer` field but nothing handles its expiry (GAP).
- `Clock` component (SP:2179-2211): 46x46 ring, border-2, `backdrop-blur-[10px]`, SVG r=18 stroke 3, rotated -90deg, `stroke-dashoffset` transition `0.1s linear`; number `Math.ceil(remaining)` 13px. Color `--world-business-money-office` (amber), switches to `--destructive` + `play-pulse 0.9s infinite` when fraction < 0.34. SILENT: SP:2173-2178 "SILENT, per direct instruction: no per-second tick sound". (`playTick` still exists in SND:128 but is unused by the clock.)
- While the clock counts, music is low-passed (`setMusicFocused`, SP:405-414).

### 1.7 Keyboard layers active during an interaction
1. `useDigitKeys` (I:106-119): number keys 1..N pick option N. Registered by ChoiceBody (all non-boss layouts), RapidBody, ChainBody, BucketBody. Ignored with meta/ctrl/alt.
2. DialogueBox window listener (SP:1708-1750): Space / Enter / "ChevronRight" / "a". Returns early if a modal is open (`document.body.style.overflow === "hidden"`, comment 17 Sept 2026 "the spacebar is connected to the game behind the modal"), if focus is on a button / input / textarea / contenteditable. While an interaction is showing (not held) and the beat is not a card/review, it does nothing. For cards/review it presses the one CTA (`onPrimary`).
3. FeedbackSheet listener (SP:2228-2238).
4. Native: every control is a real `<button>` / `<input>`, so Tab + Enter/Space works everywhere except Rank's drag (arrows are the keyboard route) and Match (buttons, tab order = term column then def column).

---

## 2. Shared primitives inside interactions.tsx (reuse these for any new kind)

### 2.1 Deterministic per-load shuffle -- `SHUFFLE_NONCE`, `seededShuffle`, `useShuffled` (I:38-74)
- Purpose: answer positions random per page load (so position is not learnable) but STABLE while on screen and pure during render.
- Comment I:38-46 (verbatim essence): randomised "so the right answer is never learnable by position -- 'harder to game the system', direct request" and "STABLE while a question is on screen: options must never move under a player mid-answer ... a nonce rolls ONCE at page load (module scope), and each beat's order is a pure seeded Fisher-Yates of (nonce, beat id) ... Display order only -- scoring reads tiers/roles off the option objects themselves, never off positions."
- Algorithm: `SHUFFLE_NONCE = floor(Math.random() * 0xffffffff)` at module load (I:47). Hash = FNV-1a over the key characters starting from the nonce (`h ^= charCode; h = Math.imul(h, 16777619) >>> 0`), then a mulberry32 PRNG (`h += 0x6d2b79f5` ...) drives a standard Fisher-Yates from the end (I:49-70). `useShuffled(items, key)` memoizes on `[items, key]` (I:72-74).
- Who uses it: ChoiceBody, DragOptionsBody, BlankBody, DocumentBody, BossOverlay (key = `beat.id`), RapidBody (per item, key = `${beat.id}:${index}`, question ORDER is not shuffled, I:1408), PickBody (key = beat.id).
- Who does NOT: CheckBody (authored order), RevealBody, MatchBody (its own deterministic sort, see 3.12), RankBody (its own deterministic shuffle, see 3.16), BucketBody (authored order), ChainBody (authored order), SliderBody (order is the meaning), FlagsBody (authored order).
- Important: ChoiceBody computes the same `useShuffled(beat.choices, beat.id)` as its sub-layouts, so digit key N always matches the Nth option on screen.
- Backend implication: if a server ever needs to know "what position was shown", it cannot reconstruct it (nonce is client-only and per load). Score by option id/tier, never by index.

### 2.2 `useTypewriter(text, speed = 26)` (I:82-101)
- Exported, used by DialogueBox. Count derived from ELAPSED time (`floor((now - started)/speed)`), polled every 16 ms. Comment I:78-81: counting ticks "drifted against React's commits and stalled halfway through a long line". `prefers-reduced-motion: reduce` shows the full text immediately. Returns `{visible, done, skip}`.

### 2.3 `useDigitKeys(count, pick, enabled = true)` (I:106-119)
- Window keydown; digits 1..count -> `pick(digit - 1)`, `preventDefault`. Ignores modifier combos. Comment I:103-105: "The badge on each option shows its digit, so the keyboard route is discoverable without a line of instructions -- the affordance IS the hint." (Note the comment says "Ignored while focus is in a control" but the code has NO focus check -- UNCLEAR/GAP: typing "1" while focused on a button still picks option 1. No beat currently mixes digit keys with a text input, so it is latent.)
- Orphan comment I:121-124 describes "A single keycap glyph, shown only where there is a real keyboard" but no component follows it (dead comment; the keycap component was removed).

### 2.4 `tierSound(tier)` (I:130-134)
- best/acceptable -> `playCorrect()`; wrong/risky -> `playWrong()`; none -> `playSelect()`. Comment I:127-129: "Every pick in the game gets the same treatment -- the chosen tile colours to its tier, a bad one shakes, a sound fires. A game where only the matching screen reacts feels broken on the other nine."

### 2.5 `OptionButton` (exported, I:136-203) -- the canonical answer row
Props: `label, index, disabled?, picked?, tier?, dimmed?, revealed?, numbered = true, compact = false, onClick`.
- Derived: `bad = picked && tier in {wrong, risky}`; `mark = picked ? (bad ? "wrong" : "right") : revealed ? "answer" : null`; `paint = mark === "wrong" ? TIER_COLOR[tier] : "var(--color-feedback-success)"`.
- Layout: `<button>` full width, `flex items-center gap-[14px]`, `rounded-[var(--radius-md)]` (12px), `border` (1px), left-aligned, `leading-snug font-semibold`. Default size `px-[18px] py-[16px] text-[16px] sm:text-[17px]`; compact `px-[14px] py-[10px] text-[14px]`.
- Colors: idle bg `--glass-surface-1`, border `--color-glass-border-raised`, text `--foreground`. Marked: bg `color-mix(in srgb, paint 18%, var(--glass-surface-1))`, border `paint`. Dimmed (other options after lock): opacity 0.4 unless marked.
- Badge (the digit): `h/w 29px text-[13px]` (compact 24px / 12px), `rounded-full border font-extrabold`; idle transparent bg, muted digit; marked: filled `paint`, glyph color `#05070f`, glyph = X icon (wrong) or Check icon (right/answer), 15x15. Badge hidden if `numbered=false` until there is a mark. Badge `aria-hidden`.
- Animations: every row enters with `fade-slide-up 0.34s cubic-bezier(0.16,1,0.3,1) both`, `animationDelay = index * 55ms`. Wrong pick: `play-shake 0.42s ease-in-out`. Revealed right answer: `play-pop 0.44s cubic-bezier(0.34,1.56,0.64,1)`. Right pick: `confirm-lift 0.42s ease-out` + `ConfirmShimmer` sweep. Transition `transform,border-color,background,opacity 200ms`; `motion-reduce:transition-none`.
- States: hover -- UNCLEAR: OptionButton has no hover style of its own (no dm-* class, no hover: utility); only cursor-pointer. Focus -- browser default focus ring (no custom focus-visible). Disabled -- `cursor-default`, no opacity change (dimming is done by `dimmed`).
- Comment I:154-157 on `revealed`: "This is the best answer and the round is over: show it even when the player chose something else. Being told WHICH one was right, at the moment you get it wrong, is most of what instant feedback is for." Comment I:172-174: "A right pick previously just recolored; a wrong one shook and the revealed answer popped, so getting it right was the least-marked outcome. It now gets the Build flow's confirm moment: a lift plus one light sweep."
- Note: an `acceptable` pick is painted green (`paint` = success) with a Check, same as best. Only wrong/risky paint differently: wrong = `--world-building-construction` (orange), risky = `--destructive` (red) via `TIER_COLOR` (SC:66-72).

### 2.6 `Question` (exported, I:209-215)
- `<p class="text-[18px] leading-[1.25] font-extrabold sm:text-[21px]">`, `font-family: var(--font-display)` (Bricolage Grotesque, G:146), color `--foreground`. Comment I:205-208: subheading tier -- the speaker's line (DialogueBox) is the title above it; answers are body text below it. Honors the "strict type hierarchy" rule: heading > subheading > body.

### 2.7 Primary CTA recipe (copy exactly; used by every Continue / Check / Submit)
`<button class="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold" style="background: var(--primary); color: var(--primary-foreground)">{label}<ChevronRight class="h-4 w-4" aria-hidden/></button>`
- Continue-type buttons carry the chevron; Submit-type buttons (Slider "Submit", Flags "Submit findings", Rank "Submit rank", Pick "Submit", Check "Check") do not.
- When it appears late (after solve / all revealed) it enters with `fade-slide-up 0.34s ease-out both`.
- `dm-solid` (app/app.css:264-283): `transition: filter 140ms, transform 140ms`; hover (hover-capable pointers only) `brightness(1.05)` + `translateY(-1px)`; active `translateY(0)`; focus-visible `outline: 2px solid var(--accent-subtle); outline-offset: 2px`; reduced motion disables transforms (app.css:350-352).
- Secondary/quiet button: `dm-quiet ... rounded-[var(--radius-md)] border px-[16px]/[18px] py-[12px] text-[14px] font-semibold`, border `--color-glass-border-raised`. `dm-quiet` hover: bg `--glass-surface-2`, text `--foreground`, inset 1px ring `color-mix(foreground 14%)`; active bg `color-mix(foreground 12%)`; radius fallback `--radius-sm` (app.css:211-226).
- app.css is imported by `src/app/play/[game]/page.tsx:6`, so these utilities are live in Play.

### 2.8 The drag token (used by Check drag and DragOptionsBody -- identical code I:554-581 and I:980-1007)
- `motion.button` (framer-motion) with `drag`, `dragSnapToOrigin` (springs back on release), `dragMomentum={false}`, `whileDrag={{ scale: 1.22 }}`.
- 48x48 circle, `rounded-full`, bg `--primary`, text white 10px extrabold uppercase "Drag", `tracking-[0.06em]`, `touch-none select-none`, `cursor-grab active:cursor-grabbing`, `z-30`.
- Idle: `play-pulse 1.6s ease-in-out infinite` (opacity 0.35<->1, scale 0.85<->1) and shadow `0 6px 18px -6px color-mix(primary 70%)`. Dragging: pulse off, shadow `0 0 0 6px color-mix(primary 30%), 0 14px 34px -8px color-mix(primary 85%)`.
- Sits in a "rail": `flex justify-center rounded-[var(--radius-lg)] border border-dashed py-[10px]`, border `--color-glass-border-raised`.
- `aria-label="Drag this token onto an answer, or tap an answer"`.
- Hit test on `onDrag` (hover highlight) and `onDragEnd` (drop): pointer `clientX/clientY` inside a card's `getBoundingClientRect()` (I:433-438, I:950-955). No padding halo (unlike BlankBody's 26px halo). Dropping outside all cards does nothing (token springs back).
- Target cards light up while hovered: bg `color-mix(primary 16%, glass-surface-1)`, border `--primary`, `scale(1.03)`, transition 150ms.
- After success the token is replaced by "Locked in" (Check icon 14px, 12px bold uppercase `tracking-[0.08em]`, color success, h-48) with `play-pop 0.5s` (Check) / no pop (DragOptions).
- Comment I:544-547 (D75): "The token costs a deliberate second to move, which is the point (D75) -- it feels like a game, not a quiz. Idle, it breathes; held, it grows and glows; over a card, THAT card lights up before the drop, so the reach itself gives feedback."
- Keyboard/SR: the token is focusable but has no keyboard drag. The fallback is that every card is a tappable button (I:585-587 "Each card is also a button: a tap answers exactly like a drop, so a player whose drag misses (or who never sees the token as draggable) is never stranded on the screen.").

### 2.9 Cross-file helpers used by interactions
- `ConfirmShimmer({active})` (flow/ConfirmShimmer.tsx): absolutely-positioned, `rounded-[inherit]`, a 40%-wide diagonal band `linear-gradient(100deg, transparent, rgba(255,255,255,0.26) 50%, transparent)` animated `confirm-shimmer-sweep 0.5s ease-out forwards` (translateX -120% skew -18deg -> clears the right edge). Parent must be `position: relative`. Comment (4 Sept 2026): band used to peak at 60% white and left a "stuck white slab"; now peaks at 26%.
- `LocalBurst({nonce})` (build/ui.tsx:212): 10 confetti particles (6x6, radius 2px) from `top-1/3 left-1/2`, each flying along a precomputed vector (angles -95deg + i*21deg, distance 46/62/78px), rotate 200/-160deg, colors cycle `--color-brand-400`, `--color-accent-purple`, `--color-world-arts-media-sport`, `--color-world-business-money-office`, `dreamy-burst 0.7s ease-out forwards`, delay `(i%4)*0.03s`. `nonce=0` renders nothing; change the nonce to replay.
- `GestureSpotlight` + `useFirstUseHint(key)` (flow/GestureSpotlight.tsx): first-use-per-device hint. `useFirstUseHint` returns `[show, dismiss]`, reads `localStorage["dreamari:hint-seen:<key>"]`, dismiss writes "1". `GestureSpotlight` portals a `pointer-events-none fixed inset-0 z-[200]` overlay (no scrim) with an animated `GestureHint` dot (2.6s cycle) and a label pill (`rgba(0,0,0,0.62)` bg, white 14px bold) centered ON the target's rect; re-measures on resize/scroll. Keys used by Play: `"blank-drag"` (BlankBody, label "Drag or tap into the blank", direction up, hintSize 22, hintDistance 28) and `"rank-drag"` (RankBody, "Press & drag to reorder", same sizes). Not affected by the `COACHMARKS_ENABLED = false` DEMO switch (that gates `Coachmark` only).
- `IconTip({label})` (app/IconTip.tsx:101): tooltip on hover and keyboard focus only (not on tap), portalled, viewport-clamped with 8px margin, flips above if it would overflow bottom. Required around every icon-only control (house rule). Used by Rank's up/down arrows.
- Sounds (sound.ts, all synthesized WebAudio, muted via `localStorage["dreamari-play-muted"] === "1"`):
  - `playSelect` 660 Hz triangle, 0.06s, peak 0.05 (SND:89) -- tile picked/toggled/tick.
  - `playCorrect` 587.33 Hz then 880 Hz (+70 ms) sine (SND:96).
  - `playWrong` 196 Hz then 155 Hz (+100 ms) triangle; "Low and short, never harsh" (SND:104-113).
  - `playSweep` C5-E5-G5-C6 arpeggio at 75 ms spacing (SND:115) -- "board is clear" / completion.
  - `playFlip` two triangle glides 340->980 Hz then 980->480 Hz (SND:136) -- page turn.
  - `playFocusMoment` 220 Hz sine 0.22s (SND:200) -- fired by the player when an interaction takes the screen.
- Scoring helpers (scoring.ts): `passThreshold(n) = ceil(n * 0.75)` (SC:61) -- 4 items pass at 3, 5 at 4, 6 at 5; `TIER_COLOR` (SC:66-72) best/acceptable `--color-feedback-success`, wrong `--world-building-construction`, risky `--destructive`, none `--muted-foreground`; `BANDS` (SC:27-32).

### 2.10 Keyframes referenced (globals.css)
| name | line | definition |
|---|---|---|
| `fade-slide-up` | G:493 | 0% opacity 0 translateY(6px) -> 100% opacity 1 translateY(0) |
| `confirm-lift` | G:760 | 0% none; 38% translateY(-3px) scale(1.035); 100% none |
| `confirm-shimmer-sweep` | G:788 | translateX(-120%) skewX(-18deg) opacity 0; 18% opacity 1; 70% 0.55; 100% past right edge |
| `play-pop` | G:896 | scale 0.94 -> 1.035 (60%) -> 1 |
| `play-nudge` | G:985 | translateX 0 -> 4px (50%, opacity 0.7 -> 1) -> 0 |
| `play-shake` | G:997 | translateX 0, -5, 5, -3, 3, 0 at 0/20/40/60/80/100% |
| `play-sheet-up` | G:1015 | opacity 0 translateY(22px) -> none |
| `play-pulse` | G:1035 | opacity 0.35 scale 0.85 -> (50%) opacity 1 scale 1 -> back |
| `dreamy-burst` | G:517 | translate(0,0) scale 1 rotate 0 -> translate(--bx,--by) scale 0.35 rotate(--br), opacity 1 -> 0 |
All interaction animations are `motion-safe:` prefixed (disabled under prefers-reduced-motion), except framer-motion transitions (FlipsBody's page turn, drag scale) which framer does not auto-disable. UNCLEAR whether a MotionConfig reducedMotion is set higher up; not seen in this slice.

### 2.11 Token values (dark theme, `src/components/marketing/tokens.css` + `design-tokens.generated.css`)
`--primary #2f6bf2`, `--primary-foreground #fff`, `--foreground #f4f7ff`, `--background #05070f`, `--card #151829`, `--muted-foreground #ffffff9e`, `--glass-surface-1 #ffffff08`, `--glass-surface-2 #ffffff17`, `--glass-surface-3 #0c1023cc`, `--glass-border #ffffff17`, `--color-glass-border-raised rgb(255 255 255 / 0.16)`, `--color-feedback-success #33c78c` (light `#007a55`), `--destructive #ef4444`, `--accent-subtle #3894ff` (light `#1e4fcc`), `--world-business-money-office #ffb81f` (amber; light in Play `#ad6e00`), `--world-building-construction #ff9640` (orange), spacing `--space-1..6 = 4/8/12/16/20/24px`, radius `--radius-sm 8px`, `--radius-md 12px`, `--radius-lg 16px`. In the CRT experiment (`.marketing-v2.play-crt`, G:1138-1171) radii become 0 and `--font-display` becomes "Press Start 2P" -- another reason to always use the tokens rather than literal radii.
Light mode in Play redefines glass surfaces as `color-mix(in srgb, var(--background) 62/74/87%, transparent)` (G:1326-1333).

---

## 3. Each interaction, one by one

Template per section: Purpose / Data contract + real example / Layout & visuals / Input model & a11y / Validation, feedback, result / Animations / Edge cases / Design-decision comments.

---

### 3.1 `card` -- CardBody (I:219-334), PowerLadder (I:366-408), BandLadder (I:341-354)

**Purpose.** Every non-question screen: level intro, system rules, character intros (two-card pattern: role card, then POWER card with ladder), chapter breaks, offer/contract tiles, numbered onboarding steps, and the Act Moment (auto celebration or checkpoint). One button, never scored.

**Data contract (`CardBeat`, T:112-159).** Required: `kind: "card"`, `id`, `variant: "intro" | "character" | "chapter" | "offer" | "step" | "act"`, `title`, `cta`. Optional: `body`, `example` (grey EXAMPLE box), `showBands` (reputation band table), `facts: {label, value}[]` (offer tiles), `step: {at, of}`, `note`, `auto` (act only: auto-advance), `secondaryCta` + `secondaryHref` (act only: exit link), `ladder: {label, lit}[]` (bottom-to-top, "Name - Role"), `system` (the game talking: no avatar/name, squared hairline box, centered), `celebrate` (arrival burst + sweep). Plus BeatBase: `setup` (on cards this is an eyebrow label like "Christina • Associate", shown statically, not typed-then-hidden), `speaker`, `castMember(s)`, `art`, `pose`, `mood`, `tone`, `spotlight`.
- NOTE: `variant` only changes rendering for `"act"`. For intro/character/chapter/offer/step the render is identical; the visible differences come from which optional fields are present (`facts`, `step`, `ladder`, `system` via DialogueBox). UNCLEAR whether other code (e.g. scene selection, Express) reads `variant` -- `SP:170` reads `variant === "character"` to build the Express cast map.

Examples:
```ts
// ib-level-1.ts L1-04 (system teach card with EXAMPLE box)
{ kind: "card", variant: "intro", id: "L1-04", system: true, speaker: "System",
  title: "Here is an example.",
  example: "A big sneaker company wants to open 100 new stores but does not have enough money. An investment bank helps find investors and arrange the deal so the company can expand.",
  cta: "Continue" }
// rn-level-1.ts RN1-07 (character POWER card)
{ kind: "card", variant: "character", id: "RN1-07", speaker: "Narrator", castMember: "Rosa",
  setup: "Rosa • Staff Nurse",
  title: "Rosa decides which patients you take. What she thinks of you reaches her manager before you do.",
  ladder: [ { label: "You - New Graduate Nurse", lit: true }, { label: "Rosa - Staff Nurse", lit: true }, { label: "Denise - Nurse Manager", lit: false } ],
  cta: "Continue" }
// ib-level-1.ts L1-ACT1 (auto Act Moment) and L1-CHECK (checkpoint with exit)
{ kind: "card", variant: "act", id: "L1-ACT1", auto: true, speaker: "System", title: "Foundation Complete", body: "You know the basics.", cta: "Continue" }
{ kind: "card", variant: "act", id: "L1-CHECK", speaker: "System", title: "Client Ready", body: "You passed your first major test. Checkpoint saved.", cta: "Continue Internship", secondaryCta: ..., secondaryHref: ... }
```

**Layout (non-act).** `flex-col gap-[var(--space-3)]` (12px), in this order:
1. Burst (`LocalBurst nonce=1`) if `celebrate`.
2. Step eyebrow if `step`: "Step {at} of {of}", 11.5px extrabold uppercase `tracking-[0.1em]`, color `--accent-subtle`, followed by a dot track: each dot `h-[5px] rounded-full`, width 18px for the current step else 5px, filled `--accent-subtle` for `index < at` else `--color-glass-border-raised`, `transition-[width] 300ms`, gap 4px.
3. Title: `Question` style (18/21px display extrabold), or if `celebrate` a larger `text-[24px] leading-[1.15] sm:text-[28px]` display extrabold in plain `--foreground`.
4. Body: 16px `leading-relaxed`, `--muted-foreground`.
5. Example: `rounded-[12px] border px-[13px] py-[11px] text-[14px] leading-relaxed`, bg `--glass-surface-1`, border `--color-glass-border-raised`, muted text, prefixed by inline "EXAMPLE" label 11px extrabold `tracking-[0.16em]` uppercase `--accent-subtle`, `mr-[6px]`.
6. Facts: `<dl class="grid grid-cols-3 gap-[7px]">`, tiles `rounded-[12px] border px-[10px] py-[9px]` glass-surface-1; `<dt>` 10.5px extrabold uppercase `tracking-[0.08em]` muted; `<dd>` `mt-[3px] text-[13.5px] leading-[18px] font-extrabold` foreground. Always 3 columns (also on phone) -- designed for exactly three tiles (role, pay, hours).
7. Note: 13px bold, color hard-coded `--world-business-money-office` (GAP: ignores `accent`, though T:127 says "in the level's accent").
8. PowerLadder if `ladder`.
9. BandLadder if `showBands`.
10. Primary CTA (recipe 2.7) with `mt-[var(--space-1)]`, label `cta` + chevron. Click -> `playSelect(); onNext()`.

**PowerLadder.** Container `rounded-[12px] border px-[14px] py-[12px]`, border `--glass-border`, bg `color-mix(glass-surface-1 60%, transparent)`. Heading "THE LADDER" 10.5px extrabold `tracking-[0.16em]` muted, `mb-[8px]`. `<ul aria-label="The career ladder">` with a rail: absolute `left-[5px] top-[8px] bottom-[8px] w-[2px] rounded-full` in `--color-glass-border-raised`. Rungs are rendered REVERSED (data bottom-to-top, display top-down). Each `<li>` `py-[5px] text-[13.5px] gap-[12px]`, enters `fade-slide-up 0.3s ease-out both` delay `index*70ms`. Dot 12x12 `border-2 rounded-full`: lit = fill + border accent + glow `0 0 10px color-mix(accent 60%)`; unlit = `--background` fill, raised border. Label: lit extrabold foreground opacity 1; unlit semibold muted opacity 0.6. A "YOU" pill (9.5px extrabold uppercase, bg `color-mix(accent 22%)`, text accent, `px-[8px] py-[1px] rounded-[var(--radius-sm)]`) appears after a lit rung whose label starts with "You" (string prefix match -- author the player's rung as "You - ...").

**BandLadder.** `ul flex-col gap-[5px]`; bands high-to-low from `BANDS`; each row `rounded-[var(--radius-sm)] border px-[11px] py-[8px] text-[13px] font-bold`, border transparent, all muted; right side `tabular-nums` "85+" or "60 to 84". No current-band highlight on purpose (I:336-340).

**Act variant (I:237-264).** Centered column `gap-[var(--space-3)] py-[var(--space-6)]`: LocalBurst; eyebrow = `title`, 13px extrabold `tracking-[0.14em]` uppercase in `accent`; line = `body`, 24px/28px display extrabold. If `secondaryCta`: `max-w-[320px]` stack gap 10px of primary CTA (`cta`, no chevron) and a quiet `<a href={secondaryHref ?? "/play"}>` (`dm-quiet border px-[18px] py-[12px] text-[14px] font-semibold`, muted). NOTE the swapped semantics: on act, `title` is the small eyebrow and `body` is the headline (T:129-135).
- `auto: true`: `playSweep()` then `setTimeout(onNext, 1400)` on mount (I:230-236). No button rendered at all when `auto` and no `secondaryCta`. Cleared on unmount.

**Input model.** One button (Tab/Enter/Space); DialogueBox also maps Space/Enter/"a" to `onPrimary` when focus is not on a button (SP:1740-1747 "Without this, two thirds of the level could not be played from the keyboard at all").

**Sounds.** `celebrate`: `playSweep()` on mount (I:223-225). Act: `playSweep()` on mount (auto only). CTA: `playSelect()`.

**Edge cases.** `facts` with 1-2 items still uses 3 columns (empty cells). Long title/body scroll inside the 76dvh box. `celebrate` + `act` would double the sweep (not used). Ladder rung labels are React keys: duplicates collide.

**Design comments (verbatim/near-verbatim).**
- I:220-222 "The arrival card celebrates: one burst and the level-up sweep as it lands, the title a step larger. Everything else on the card is the same, so the moment is the only thing that changed."
- I:226-229 "Act Moment (Interaction Rules): a completion moment auto-advances with no button at all, never a real stopping point -- fast, celebratory, and it must not introduce any reading. A checkpoint (secondaryCta set) waits on the student instead, same as every other card."
- I:282-283 "the arrival title is a step larger, plain ink (no gradient: direct feedback, 6 Sept 2026); the burst and the sweep carry the moment"
- I:336-340 BandLadder: "a reference table of the rules, not a readout of where the player stands ... highlighting it as a 'current' band read as if the player had already earned that standing before making a single choice".
- I:356-365 PowerLadder: "Drawn as a DIAGRAM -- a vertical rail of connected dots, labelled and clearly non-interactive -- after the bordered-row version read as a set of tappable options on a screen whose only action is Continue (direct feedback: 'I don't understand what the use of this screen is'). Rungs come bottom-to-top in data and render top-down (highest rung first), the way a ladder is read."
- I:377-378 "The rail: one thin line connecting every rung, which is what makes this read as a chart rather than a stack of buttons."
- T:143-147 ladder: "a rung always carries its job title, never a bare name ... Only ever shows rungs the student has actually met (Characters tab)."
- T:149-152 system: "so a student can tell the game talking from the job talking (Interaction Rules, System Card)."
- T:154-156 celebrate: "(Joshua Pierce, Slack, 6 Sept 2026: 'the student is genuinely arriving for the first day of their new job')."
- T:136-141 secondaryCta: "the one place a student is offered a mid-level exit (the Act Moment checkpoint). Progress is already saved by the time this renders."
- SP:1156-1164 placement: system cards sit CENTER screen ("big intros like these sit CENTER SCREEN (direct feedback)"); character/narrator cards bottom-docked.

---

### 3.2 `review` -- ReviewBody (SP:1321-1360)
**Purpose.** "A held breath before the ending." Closes the level before the ending card.
**Contract (T:263-267).** `kind: "review"`, `id`, `title`, `body`.
**Layout.** Title 19px/22px display extrabold; body 16px muted relaxed. For 2200 ms shows "Decision pending" (14px bold `--accent-subtle`) with four 7x7 dots pulsing `play-pulse 1.1s infinite` staggered 140 ms; then the CTA "See the decision" (hard-coded label, chevron) fades in (`fade-slide-up 0.4s`). Centered on the ambient backdrop (SP:1152-1164).
**Edge.** No `cta` field; label is fixed. Keyboard: DialogueBox `onPrimary` = `onNext` works immediately (even during the 2.2s wait -- UNCLEAR whether that is intended; the key path skips the pending state).

---

### 3.3 `check` -- CheckBody (I:418-640): Comprehension Check

**Purpose.** Unscored gate after a teach card; "what stops anyone who tapped through the teach card without reading" (rn-level-1.ts RN1-05 comment). Unlimited tries, cannot skip, never a strike. Method choice (T:161-166): `tap` when the answer is a concept; `type` when it is a number/exact word to carry forward (recall, not recognition); `drag` when the answer should cost a deliberate second.

**Contract (`CheckBeat`, T:167-180).** Required: `kind: "check"`, `id`, `method`, `question`, `cta`. `options?: {label, correct, why}[]` (tap/drag; "exactly one correct option"). `answer?: string` (type; compared trimmed + case-insensitive). `whyRight?: string` (type only). `hint?: string` (type; shown after two wrong tries).

Examples:
```ts
// rn-level-1.ts RN1-05 -- drag
{ kind: "check", method: "drag", id: "RN1-05", speaker: "System",
  setup: "Quick check before you start.",
  question: "A patient starts breathing badly at 2 AM. Who notices first?",
  prompt: "Drag the blue dot to the answer, or tap the answer.",
  options: [
    { label: "The nurse at the bedside", correct: true, why: "Right. The nurse is the one in the room." },
    { label: "The head of the hospital", correct: false, why: "Not this one. Try again." },
    { label: "The person who books appointments", correct: false, why: "Not this one. Try again." } ],
  cta: "Continue" }
// rn-level-1.ts RN1-11 -- type
{ kind: "check", method: "type", id: "RN1-11", speaker: "System",
  setup: "Quick check. Type the number, then press enter.",
  question: "What's the minimum amount of points you need to move up to the next level?",
  answer: "85",
  whyRight: "Right. 85 and above moves you up. Anything less and you play the year again.",
  hint: "At Risk under 40 · Cautious 40 to 59 · Respected 60 to 84 · Trusted 85 and above",
  cta: "Continue" }
```

**Shared state.** `solved`, `missed: Set<number>` (indices currently shaking), `entry`, `tries`, `shakeBox` (counter used as a React key), `over` (drag hover index), `dragging`. `miss(i)`: `playWrong()`, add i to `missed`, remove after 460 ms (so the shake can replay). `solve()`: `playCorrect()`, `solved = true`.

**Tap method layout (I:481-507).** Column gap 8px. Each option: `<button>` `flex gap-[12px] rounded-[var(--radius-md)] border px-[18px] py-[15px] text-[16px] sm:text-[17px] font-semibold text-left`, bg glass-surface-1, border raised; enter `fade-slide-up 0.34s cubic-bezier(0.16,1,0.3,1) both` delay `i*55ms`; wrong tap `play-shake 0.42s`. Solved: correct row bg `color-mix(success 18%, glass-surface-1)`, border success, leading Check icon 16px success; others opacity 0.4 and disabled. No digit badges, no digit keys.

**Type method layout (I:509-540).** `<form key={shakeBox}>` (re-keyed on each miss so the shake class replays, and the input remounts with `autoFocus`). Input: full width, `rounded-[var(--radius-lg)] border-2 bg-transparent px-[16px] py-[14px] text-center text-[24px] font-extrabold tabular-nums`, display font, `outline-none` with `focus-visible:outline-2 outline-offset-2 outline-[var(--primary)]`; border success when solved else raised; `aria-label="Your answer"`; `inputMode="numeric"` iff the answer is all digits (`/^\d+$/`) else "text"; `autoFocus`. When solved the input shows `beat.answer` and is disabled. Hint (`tries >= 2 && hint`): 13px semibold muted relaxed, `fade-slide-up 0.4s`. "Check" button (primary recipe, no chevron) shown until solved. Enter submits via the form.
- Validation: `entry.trim().toLowerCase() === answer.trim().toLowerCase()`. Empty/whitespace entry is ignored (no sound, no try counted). Wrong: `playWrong`, `tries++`, `shakeBox++`, entry cleared. NO numeric tolerance ("85.0", "eighty five", "85 points" are all wrong).

**Drag method layout (I:542-618).** Token rail (see 2.8) above answer cards. Cards: `flex flex-col gap-[8px] sm:grid sm:grid-cols-3` (stack on phone, 3 columns from 640px). Card: `rounded-[var(--radius-lg)] border px-[16px] py-[13px] text-[15.5px] sm:text-[16px] font-semibold`, transition 150ms, eyebrow "ANSWER {n}" 10px extrabold `tracking-[0.12em]` (muted; primary while hovered; success + Check when solved). Wrong drop/tap: shake that card, token springs back (dragSnapToOrigin). Right: card `play-pop 0.44s`, success tint; rail shows "Locked in". All cards disabled after solve.
- Comment I:462-464: "Drag hit-test: the token is dropped wherever the pointer ends; the card under that point wins. dragSnapToOrigin gives the sprung-back rail return on a miss for free."

**After solve (all methods, I:620-637).** `whyRight` line 14.5px semibold success color `fade-slide-up 0.34s` (tap/drag: the correct option's `why`; type: `beat.whyRight`), then primary CTA (`cta` + chevron) -> `playSelect(); onNext()`.
- Wrong options' `why` strings are NEVER shown (GAP: authored but unused; RN1 authors "Not this one. Try again."). A wrong attempt only shakes + thud.
- Result to player: none. `onNext` only. No tier, no strike, nothing saved.

**Edge cases.** No `options` -> `options = []`, `rightIndex = -1`, `whyRight = ""`. Two options marked correct: any correct one solves; `whyRight` uses the FIRST correct. Rapid taps: `missed` Set tolerates repeated taps; `solved` guard prevents double solve. Drag hit-test uses live rects so it survives scrolling inside the box.

**Design comments.** I:412-417 (doc), I:424-425 "so the target lights up BEFORE the drop -- the reach is part of the fun", I:527-528 "Supporting information fades back in after two wrong tries (Interaction Rules, typed check)", I:544-547 (D75), I:585-587 (tap fallback). Handoff log: IB1's check was switched from drag back to TAP "per direct feedback overriding the sheet's D75 -- flag D75/Joshua if it should return" (docs/AI_HANDOFF.md ~line 2500).

---

### 3.4 `reveal` -- RevealBody (I:647-714): Tap to Reveal

**Purpose.** Teach a short list where each row hides its payload; forces engagement ("Continue only appears once every row is open, so nobody can skip the lesson", T:193-195). Used for skill-tag explainers and the reputation-band explainer.

**Contract (`RevealBeat`, T:196-203).** `kind: "reveal"`, `id`, `title`, `rows: {label, reveal, color?: "red" | "amber" | "green"}[]`, `note?` (static line under rows), `cta`.
```ts
// rn-level-1.ts RN1-10 (colored rows + score spotlight)
{ kind: "reveal", id: "RN1-10", speaker: "System", spotlight: "score",
  setup: "That number in the corner just moved.",
  title: "Your reputation decides if you move up, repeat the year, or lose the job.",
  prompt: "Tap each outcome to reveal its score.",
  rows: [
    { label: "You lose the job", reveal: "under 40 · At Risk", color: "red" },
    { label: "No move up, start the year over", reveal: "40 to 84 · Cautious", color: "amber" },
    { label: "Promoted to Staff Nurse", reveal: "85 and above · Trusted", color: "green" } ],
  cta: "Continue" }
```

**Layout.** Title via `Question`. Rows column gap 8px. Row = `<button>` `flex justify-between gap-[12px] rounded-[var(--radius-md)] border px-[16px] py-[14px] text-[15px] sm:text-[16px] font-semibold text-left`, enter stagger `i*55ms`, transition border/bg 200ms. Unrevealed: glass-surface-1, raised border, right-side cue: Eye icon 13px + "TAP TO REVEAL" 10.5px extrabold `tracking-[0.1em]` in `--accent-subtle`. Revealed: bg `color-mix(tint 12%, glass-surface-1)`, border tint, payload appears under the label as `mt-[3px] block text-[14px] leading-snug font-bold` in tint, `fade-slide-up 0.3s`. Tint map (I:650-654): red `--destructive`, amber `--world-business-money-office`, green `--color-feedback-success`; no color -> `--accent-subtle`. Note: 13px semibold muted relaxed. CTA once all open.

**Input/a11y.** Buttons; once revealed a row is `disabled` (cannot re-hide). Any order. No keyboard shortcuts. The revealed payload is inside the button text so SR reads it.

**Feedback.** `playSelect()` per reveal. Continue -> `playSelect(); onNext()`. Unscored, no result.

**Edge.** `allOpen = open.size >= rows.length` -- 0 rows shows Continue immediately. Duplicate labels collide as keys.

---

### 3.5 `flips` -- FlipsBody (I:723-815): Word Cards flipbook

**Purpose.** Vocabulary, one word per page, term and definition on the SAME face (no flip-to-reveal, per direct feedback). Continue only after the last word. Not scored. (IB1 replaced this with `focus` pairs; RN1 still uses it.)

**Contract (`FlipsBeat`, T:186-191).** `kind: "flips"`, `id`, `title`, `cards: {term, def}[]`, `cta`.
```ts
// rn-level-1.ts RN1-12
{ kind: "flips", id: "RN1-12", speaker: "Rosa",
  setup: '"Four words you will hear before lunch."',
  title: "Learn them now and the rest of the day makes sense.",
  prompt: "Tap the card for the next word.",
  cards: [
    { term: "Vitals", def: "The basic body numbers, like heart rate and temperature" },
    { term: "Chart", def: "The patient record, where everything gets written down" },
    { term: "Report", def: "The handover, when one nurse tells the next what happened" },
    { term: "Escalate", def: "Tell someone more senior, straight away" } ],
  cta: "Continue" }
```

**Layout.** Title (`Question`). Wrapper `perspective: 1200px`. The card is ONE `motion.button`, keyed by `card.term`: `flex-col items-center gap-[10px] rounded-[var(--radius-md)] border px-[20px] py-[26px] sm:py-[34px] text-center`, `transformOrigin: left center`, background = ruled binder paper `repeating-linear-gradient(180deg, transparent 0 26px, color-mix(glass-border 55%) 27px), color-mix(accent 5%, var(--card))`, border `--glass-border` (success once finished), shadow `0 18px 40px -22px rgba(0,0,0,0.45)`. Contents: "WORD {n} OF {N}" 11px extrabold `tracking-[0.16em]` muted; term `text-[34px] sm:text-[44px] leading-[1.1] font-extrabold uppercase` display font with SVG filter `url(#play-sketch)` (hand-drawn wobble: feTurbulence fractalNoise baseFrequency 0.045 numOctaves 2 -> feDisplacementMap scale 3.2); an accent squiggle underline SVG 120x8 path `M2 5 Q 20 1, 40 4 T 78 4 T 118 3` stroke 2.4 round caps, also sketch-filtered; definition `max-w-[38ch] text-[16px] sm:text-[17px] leading-relaxed font-semibold` muted; cue "NEXT WORD" (or "GOT IT" on the last) 12px extrabold `tracking-[0.08em]` `--accent-subtle` + chevron `play-nudge 1.4s infinite`. Below the card: progress dots 6x6, gap 6px, filled `--accent-subtle` for `index < at + (finished ? 1 : 0)`, transition-colors 300ms. CTA after finish.

**Input.** Tap/click the card (or focus + Enter/Space). No back, no swipe, no digit keys. Each turn: `playFlip()`; last card additionally `playCorrect()` and `finished = true` (card disabled, cue hidden).

**Animation.** Page turn: framer `initial {rotateY: -70, opacity: 0}` -> `animate {rotateY: 0, opacity: 1}`, `transition {duration: 0.5, ease: [0.16, 1, 0.3, 1]}`. One-directional, no backface (I:744-746 cites the glossary flipbook's 3D-safety note).

**Edge.** `cards: []` would crash (`card.term` of undefined, I:726) -- always author >= 1. Duplicate terms collide (key). The SVG filter id `play-sketch` is global; two flips on screen would duplicate it (never happens).

**Comments.** I:718-722 doc; I:730-731 "The card physically turns; the sound bank already had a flip for it that nothing was calling. A generic tick undersold the motion."; I:758-760 "The glossary flipbook's binder page: ruled paper over a faint world-gold tint, with a real paper shadow (direct feedback -- same look, minus the illustration)."; I:767 "The hand-drawn wobble, same filter recipe as the glossary."; I:781 "The hand-drawn underline squiggle, straight off the binder."; I:796 "One dot per word, filling as the student pages through."

---

### 3.6 `focus` -- FocusBody (I:822-888): Teach Card, Focus One

**Purpose.** Teach exactly two related terms: both on screen, only one sharp. Replaced the one-word flip carousel in IB1 "with a pair that shows both terms belong together while still forcing attention onto one at a time" (T:361-366). Not scored.

**Contract (`FocusBeat`, T:367-371).** `kind: "focus"`, `id`, `title`, `terms: [{term, def}, {term, def}]` (a TUPLE of exactly two). No `cta` (button label fixed "Got it").
```ts
// ib-level-1.ts L1-14
{ kind: "focus", id: "L1-14", speaker: "Christina", castMember: "Christina",
  title: "Two terms you will hear all the time.",
  terms: [ { term: "Comps", def: "Similar companies used for comparison." }, { term: "Deck", def: "A slide presentation." } ] }
```

**Layout.** Title. Two stacked term cards gap 10px: `flex-col gap-[4px] rounded-[var(--radius-md)] border px-[18px] py-[16px]` glass-surface-1; focused border `--accent-subtle`, unfocused border raised + `filter: blur(6px)` + opacity 0.5 + `aria-hidden`; `transition-[filter,opacity,border-color] duration-300`. Term 19px display extrabold uppercase `leading-[1.1]`; def 14.5px semibold muted relaxed. Button row gap 10px: "Back" (dm-quiet, `flex-none px-[16px] py-[12px] text-[14px]`, only while focus = 1) and "Got it" (primary, `flex-1`, chevron).

**Behavior.** Got it at focus 0 -> `playFlip()`, focus = 1. Got it at focus 1 -> `playCorrect()`, `onNext()`. Back -> `playFlip()`, focus = 0. Unscored. No default Action Prompt.

**Edge/notes.** Cards are not clickable (divs). T:361-366 says "GOT IT on the focused card" but the button is a shared row below both cards. Duplicate terms collide.

---

### 3.7 `choice` layout `options` -- ChoiceBody (I:892-927)

**Purpose.** The workhorse scored beat: Scenario, Timed Scenario (with `timer`). "Pick one option. Locks immediately, no confirm step." (T:205-207). Beat 1 of a level is "always the easy win ... one obvious right answer, three options, no timer" (ib-level-1.ts L1-06 comment).

**Contract (`ChoiceBeat`, T:208-229).** Required: `kind: "choice"`, `id`, `layout`, `question`, `choices: Choice[]`, `feedback` (unused, may be ""), `feedbackCta`, `skills: string[]`. `Choice` (T:36-43) = `{id, label, tier, why}` -- `why` explains THAT option. Optional: `timer` (seconds), `doc` (document header), `dragEnabled` (options layout only). Plus scored-beat BeatBase fields `progress` (0..1, 0.1 per scored beat) and `planLineIfFailed` (one sentence in the supervisor's voice naming the mistake; used if this beat's wrong/risky lands the third strike).
- Authoring rules from types/scoring comments: exactly one `best` per scored beat; "roughly one Risky per level" (T:6-8); the 20 Sept binary levels use only best/wrong (T:11-16). Timeout scores Wrong, never Risky (T:216-217).
```ts
// ib-level-1.ts L1-11
{ kind: "choice", layout: "options", id: "L1-11",
  planLineIfFailed: "you reached for work that was above you before you could do the work in front of you",
  progress: 0.2, castMembers: ["Christina", "Jordan"], speaker: "Narrator",
  question: "Day 1: What should you do first?",
  choices: [
    { id: "a", label: "Complete systems training", tier: "best", why: "Right. Learn the systems first. Everything else depends on them." },
    { id: "b", label: "Join a client call", tier: "wrong", why: "Client calls are not yours yet, and you would not know what you were listening to." },
    { id: "c", label: "Lead a company sale", tier: "wrong", why: "Nobody hands a sale to someone on day one. Aim at what is actually in front of you." } ],
  feedback: "", feedbackCta: "Continue", skills: ["Decision-Making", "Active Learning"] }
```

**Layout.** `Question` then column gap 8px of `OptionButton`s (2.5) in seeded-shuffled order, digits 1..N.

**Input.** Click/tap an option, or press its digit (useDigitKeys enabled while `locked === null`). One attempt; no confirm.

**Validation/feedback.** No correctness computed here: `tierSound(choice.tier)` then `onResolve(choice.tier, choice.why, choice.id)`. The player sets `locked = choice.id`, so on re-render: picked option painted by tier (right = green + check + lift + shimmer; wrong = orange/red + X + shake), all others disabled and dimmed to 0.4, and the `best` option (if not picked) gets `revealed` (green check + pop). Then after 420/1150 ms the feedback sheet covers it. Acceptable picks paint green and play the correct sound but score +2 and headline "That works.".

**Timer.** If `timer`, the Clock ring shows above the box; on expiry BeatStage resolves wrong with the fallback choice id, so the UI shows THAT option as the student's (wrong) pick (GAP: student sees an X on an option they never chose; the feedback why is "Time ran out. In a real week, silence is its own answer.").

**Edge.** Double click/digit + click: guarded by `locked` in `pickByKey` and by the player's `if (locked) return`, but the button `onClick` itself does not check `locked` -- it relies on `disabled`, which applies after the parent re-renders (same tick). Two quick keypresses in the same frame: the second `onResolve` is ignored by the player guard, but `tierSound` plays twice (minor).

---

### 3.8 `choice` `options` + `dragEnabled` -- DragOptionsBody (I:935-1039)

**Purpose.** "Drag to Answer / Drag Cards to Zone / Drag Message to Chat (Interaction Rules): one mechanic under three different dressings" (I:929-934, T:222-227) -- same scoring as options, but the answer costs a deliberate drag.

**Contract.** `ChoiceBeat` with `layout: "options"` and `dragEnabled: true` (ignored on other layouts). Example: ib-level-1.ts L1-06 (shown in 3.7's section style):
```ts
{ kind: "choice", layout: "options", dragEnabled: true, id: "L1-06",
  planLineIfFailed: "you could not yet say what an investment bank is for", progress: 0.1,
  speaker: "System", setup: "Quick check before you start.",
  question: "A shoe company wants to buy a smaller shoe company. Who helps organize the deal?",
  choices: [
    { id: "a", label: "An investment bank", tier: "best", why: "Right. That is the whole job in one sentence: banks help companies buy and sell other companies." },
    { id: "b", label: "A shoe designer", tier: "wrong", why: "A shoe designer makes the shoes. Nobody is asking them to arrange a sale." },
    { id: "c", label: "A delivery company", tier: "wrong", why: "A delivery company moves the boxes. Buying a company is a different problem." } ],
  feedback: "", feedbackCta: "Continue", skills: ["Reading Comprehension", "Active Learning"] }
```

**Layout.** `Question`; token rail (2.8); cards `flex-col gap-[8px] sm:grid sm:grid-cols-3`; card = `rounded-[var(--radius-lg)] border px-[16px] py-[13px] text-[15.5px] sm:text-[16px] font-semibold` (no "ANSWER n" eyebrow here, unlike Check drag), transition 150ms. Hover-over-while-dragging: primary tint 16%, primary border, scale 1.03. Locked picked card: `color-mix(TIER_COLOR 20%)` bg + tier border; best picked also `play-pop 0.44s`. Others: opacity 0.4.

**Input.** Drag token onto a card OR tap a card OR digit key (via ChoiceBody's useDigitKeys, although no digits are visible). One attempt.

**Validation.** Drop on `best`: `commit` -> `tierSound` + `onResolve`. Drop on non-best: `playWrong()`, shake that card (460 ms), THEN `commit(choice)` which plays `tierSound` again (GAP: wrong sound fires twice) and resolves with that tier. So on this SCORED variant a wrong drop LOCKS as wrong -- the doc comment "A wrong drop shakes that card and springs the token back" (I:930-932) describes the check variant, not this one. After lock the rail shows "Locked in" in success green with a check EVEN on a wrong answer (GAP). The best answer is NOT revealed (it dims to 0.4 like the rest), unlike OptionButton layouts (GAP).

---

### 3.9 `choice` layout `blank` / `tiles` -- BlankBody (I:1050-1164): Drag to Blank / Fill in the Blank

**Purpose.** A sentence with one gap; word tiles below; drag a tile into the gap or tap it. `tiles` = same mechanic laid out as a 2-column grid (for longer phrases, e.g. L3-25's opening lines).

**Contract.** `ChoiceBeat` with `layout: "blank" | "tiles"`. `question` MUST contain `___` (three underscores); it is split on the first `___` into before/after (I:1053). Example:
```ts
// ib-level-1.ts L1-16 (blank)
{ kind: "choice", layout: "blank", id: "L1-16", planLineIfFailed: "you could not yet use the words the desk uses",
  progress: 0.3, speaker: "System", setup: "One quick check on the four words.",
  question: "Christina asks for the ___ by EOD. She wants the slides.",
  choices: [
    { id: "a", label: "deck", tier: "best", why: "Right. Deck means the slides. EOD means she wants them today." },
    { id: "b", label: "comps", tier: "wrong", why: "Comps are the list of similar companies, not the slides." },
    { id: "c", label: "model", tier: "wrong", why: "The model is the spreadsheet behind the slides, not the slides themselves." } ],
  feedback: "", feedbackCta: "Continue", skills: ["Reading Comprehension", "Critical Thinking"] }
// ib-level-2.ts L2-13 (tiles, with an acceptable option)
  question: "Profit means money a company keeps after paying ___.",
  choices: [ {id:"a",label:"costs",tier:"best",...}, {id:"b",label:"emails",tier:"wrong",...}, {id:"c",label:"meetings",tier:"wrong",...}, {id:"d",label:"rent",tier:"acceptable",why:"Rent is one cost, not all of them."} ]
```

**Layout.** The sentence renders inside `Question` (18/21px display). The slot is an inline `<span>`: `mx-[3px] inline-block min-w-[104px] rounded-[8px] border-2 px-[9px] text-center align-baseline`, dashed border; color states: idle border raised; a tile is held -> border `rgba(255,255,255,0.55)` (GAP: hard-coded white, invisible-ish on light theme); pointer over the slot -> border `--primary`, bg `color-mix(primary 22%)`, `scale(1.06)`; filled -> solid border in `TIER_COLOR[chosen.tier]`, text = chosen label in foreground. Transition 160ms on border/bg/transform. Empty slot contains a single space with transparent text.
- Tiles: `blank` -> `flex flex-wrap gap-[8px]` (tiles size to content); `tiles` -> `grid grid-cols-2 gap-[8px]`. Tile: `motion.button` `relative w-full rounded-[var(--radius-md)] border px-[18px] py-[15px] text-[15px] sm:text-[17px] font-semibold touch-none select-none cursor-grab`. Bg/border: picked -> TIER_COLOR 20% / tier; locked and this is best -> success 20% / success (the right answer is revealed); held -> `color-mix(primary 18%, glass-surface-2)` / primary; idle glass-surface-1 / raised. Locked non-picked non-best: opacity 0.4. Transition 200ms.

**Input.** 
- Drag: framer `drag={locked === null}`, `dragSnapToOrigin`, `dragMomentum={false}`, `dragElastic={1}`, `whileDrag {scale: 1.1, zIndex: 40, boxShadow: "0 18px 36px -12px rgba(0,0,0,0.6)"}`. `onDrag` updates `over` via the slot hit-test with a 26 px halo on every side (I:1064-1071). `onDragEnd`: if over the slot -> commit; else nothing (tile springs back, no penalty, try again).
- Tap: `onTap` (framer fires it only when the pointer did not pass the drag threshold, so a drag never double-commits, I:1129-1131) -> commit. `whileTap {scale: 0.97}`.
- Digit keys commit directly (ChoiceBody's useDigitKeys) -- no visible digits.
- First-use hint: `useFirstUseHint("blank-drag")` + `GestureSpotlight` on the first tile, "Drag or tap into the blank"; dismissed on first drag start or tap (persisted per device).

**Validation.** Commit = `tierSound` + `onResolve(tier, why, id)`. One attempt (scored). The slot then shows the picked word in tier color; best is revealed on the tiles if missed.

**Animation.** Tiles enter via a WRAPPER div `fade-slide-up 0.34s cubic-bezier(0.16,1,0.3,1) both` delay `i*55ms` -- deliberately not on the button (I:1105-1108: "A CSS keyframe with fill-mode 'both' leaves its final transform on the element, which silently overrode framer's drag transform when both sat on the button: the tile then never moved under the finger."). Reuse this rule for any draggable.

**Edge.** No `___` in question -> `after` undefined, slot appended at the end. More than one `___` -> only the first becomes a slot; the rest render as literal underscores inside `after`... actually `split` returns 3+ parts and only [0],[1] are used, so text after the 2nd `___` is DROPPED (GAP: author exactly one `___`). Slot `min-w-[104px]` wraps with the sentence; long labels widen it.

**Comments.** I:1041-1049 (verbatim essence): "a tile can be DRAGGED into the slot (D75 -- a drag costs a deliberate second and feels like a game rather than a quiz) or simply TAPPED. Tap was added after players got stuck on the data-room beat: a drag that misses the slot springs back with no other way forward. One attempt on a scored beat ... Number keys still commit directly". I:1056-1058 "Drag has no visual cue beyond a cursor-grab style that's invisible on touch, so the first encounter gets a spotlight". I:1067-1068 "A forgiving halo around the slot -- a drop just shy of a small inline target should not read as a miss".

---

### 3.10 `choice` layout `document` -- DocumentBody (I:1167-1209): Catch the Mistake

**Purpose.** A document window; each line is a choice; tap the wrong line. Scored like any choice.

**Contract.** `ChoiceBeat` + `layout: "document"`, optional `doc` (window title; defaults to "Document"; T:219-220 notes the label used to be hardcoded to "Level 1's Nike summary"). Example ib-level-1.ts L1-24:
```ts
{ kind: "choice", layout: "document", doc: "Deal Summary • Intern Draft", id: "L1-24",
  planLineIfFailed: "you let a line with obvious errors go out to a client", progress: 0.6, speaker: "System",
  setup: "Review the summary and find the mistakes.", question: "Which line goes out wrong?",
  choices: [
    { id: "a", label: "The deal is worth nine billion dollers and closes on Febuary 31.", tier: "best", why: "Right. Dollers, Febuary, and February never has a 31st. Three errors in one line." },
    { id: "b", label: "Full deck by end of day.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
    { id: "c", label: "Client call Friday, 9 AM.", tier: "wrong", why: "..." },
    { id: "d", label: "The client's revenue grew by 8% last year.", tier: "wrong", why: "..." } ],
  feedback: "", feedbackCta: "Continue", skills: ["Reading Comprehension", "Critical Thinking"] }
```
Note the "best" tier here is the line WITH the mistake. Lines are seeded-shuffled like any choice (so a multi-slide deck like L2-15 "Slide 3..Slide 7" will appear out of slide order -- UNCLEAR whether acceptable; worth an author flag to disable shuffle for ordered documents).

**Layout.** Window: `overflow-hidden rounded-[12px] border` raised. Title bar: `flex gap-[7px] px-[12px] py-[8px] text-[12px] font-bold tracking-[0.04em]`, bg `--glass-surface-3`, muted, FileText icon 14px. Lines: `<ul>` of full-width buttons `border-t px-[12px] py-[11px] text-[14.5px] leading-snug font-medium text-left`, border `--glass-border`, bg glass-surface-1, enter `fade-slide-up 0.3s ease-out both` delay `i*45ms`, `transition-colors 200ms`. Locked: picked bg `color-mix(TIER_COLOR 18%, transparent)`; best (unpicked) bg success 18% (revealed); others opacity 0.45. No shake, no icons, no numbered badges.
**Input.** Tap, or digit keys (invisible). **Feedback.** `tierSound` + `onResolve(tier, why, id)`. Timer supported (L3-13 is 60s).

---

### 3.11 `choice` layout `boss` -- BossOverlay (I:1213-1241): Boss Moment

**Purpose.** "a gold overlay over the current screen, two options, and it counts as one of the ten scored beats" (I:1211-1212). ib-level-1.ts L1-25 comment: "Boss Moment, re-added 20 Sept: gold overlay, never red, counts as one of the ten scored beats."
**Contract.** `ChoiceBeat` + `layout: "boss"`. Content uses 2-3 choices (RN1-16 has 2, L1-25 has 3). Example RN1-16:
```ts
{ kind: "choice", layout: "boss", id: "RN1-16", planLineIfFailed: "you went quiet when a senior nurse put you on the spot",
  progress: 0.5, speaker: "Narrator",
  setup: "A family told the morning meeting you explained things better than anyone all week. Your name was said out loud.",
  question: "What do you do?", prompt: "Choose one.",
  choices: [
    { id: "a", label: "Thank her, and name who helped you", tier: "best", why: "Right. Passing credit on costs nothing and makes people want you on their shift." },
    { id: "b", label: "Say it was nothing", tier: "wrong", why: "You were handed a moment on the record and you gave it straight back." } ],
  feedback: "", feedbackCta: "Continue", skills: ["Social Awareness", "Teamwork & Collaboration"] }
```
**Layout.** DialogueBox with `gold` (edge `--world-business-money-office`). Centered column: trophy tile 52x52 `rounded-[var(--radius-lg)]` bg `--world-business-money-office` (hard-coded amber, not accent), Trophy icon 26px `#05070f`; `Question`; `OptionButton` list (numbered badges shown). Same lock/reveal behavior as 3.7.
**Gaps.** Digit badges are displayed but digit keys do NOT work (BossOverlay never calls useDigitKeys, and ChoiceBody is bypassed). Action Prompt never renders (bypasses BeatBody). "never red": a `risky` boss option would still paint red via TIER_COLOR.

---

### 3.12 `match` -- MatchBody (I:1259-1357), MatchTile (I:1359-1401)

**Purpose.** Pair terms (left) with definitions/actions (right), "the way a language app does it: tap one tile, tap another, and find out immediately" (I:1245-1255). One scored beat; no partial credit.

**Contract (`MatchBeat`, T:233-243).** `kind: "match"`, `id`, `question`, `pairs: {term, def}[]`, `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`, `progress?`.
```ts
// ib-level-2.ts L2-20
{ kind: "match", id: "L2-20", planLineIfFailed: 'you mixed up terms in a client conversation', progress: 0.8,
  resetScene: true, speaker: "Narrator",
  setup: "You heard these words in the meetings. Learn the deal lingo.",
  question: "Tap a term, then tap its match.",
  pairs: [
    { term: "Valuation", def: "What a company may be worth" },
    { term: "Pitch", def: "Why the client should pick us" },
    { term: "Due Diligence", def: "Checking every number and fact" },
    { term: "Margin", def: "Profit as a percent of sales" } ],
  whenRight: "Right. These four words come up in every deal conversation.",
  whenWrong: "Close. Valuation is what a company may be worth. Due diligence is the checking.",
  feedback: "...", feedbackCta: "Continue", skills: ["Active Learning", "Reading Comprehension"] }
```
RN1-13 uses quote-to-action pairs (`term: '"Get her vitals."'`, `def: "Check her heart rate and temperature"`), per its comment "matching a word to what you DO with it is what a first shift actually asks".

**Layout.** `Question`; `grid grid-cols-2 gap-[8px]` (two columns on ALL widths including phone); each column `ul flex-col gap-[7px]`. Left = terms in AUTHORED order (`strong`: 16px extrabold). Right = defs in a deterministic order (`sort` by `((def.length*7 + index*3) % 11)`, I:1262-1269; NOT the seeded shuffle, so the same on every load and could coincide with authored order for some data). Tile: `flex min-h-[58px] w-full items-center rounded-[var(--radius-lg)] border-2 px-[14px] py-[13px] text-left leading-snug`, defs 14.5px semibold; transition bg/border/transform/opacity 150ms; enter `fade-slide-up 0.3s ease-out both` with delay `i*45ms` only in idle state. Footer "{done} of {total} matched" 12.5px semibold muted.
- Tile states (I:1374-1383): idle glass-surface-1 / raised; picked `color-mix(primary 26%)` / primary, `-translate-y-px`, `aria-pressed=true`; right (flash) `color-mix(success 26%)` / success; wrong (flash) `color-mix(destructive 24%)` / destructive + `play-shake 0.42s`; done `color-mix(success 12%, transparent)` / `color-mix(success 40%)` / muted text / `opacity-45` / disabled.

**Input.** Tap either column first. Tapping another tile on the SAME side replaces the selection (`playSelect`); tapping the same tile again re-selects it (no deselect). Tapping a tile on the other side attempts the pair. Taps ignored during a flash or on done tiles. Keyboard: Tab through buttons + Enter/Space; no digit keys. SR: `aria-pressed` on the held tile; UNCLEAR: no live-region announcement for right/wrong.

**Validation & timing (I:1282-1309).** `ok = picked.term === term` (identity = the TERM string; defs are keyed by their pair's term). Right: `playCorrect`, flash both tiles green 260 ms, then both clear (done). Wrong: `playWrong`, flash both red + shake 520 ms, then deselect; sets `missed = true` for the rest of the beat. The student must clear every pair to finish (no give-up); when the last pair clears: `playSweep()` then 420 ms later `onResolve(missed ? "wrong" : "best", missed ? whenWrong : whenRight)` (no id). So one wrong attempt anywhere = beat scores Wrong even though the board is completed. Then the player's 420/1150 ms hold, then the sheet.

**Edge.** Duplicate terms or duplicate defs break identity/keys. `settled` ref prevents double resolve. With many pairs (6+) the two-column grid gets tall; relies on DialogueBox scrolling. Long defs wrap within `min-h-[58px]`.

**Comments.** I:1245-1255 full rationale ("The old version waited for a Check button, highlighted only the left column, and stacked the chosen definition UNDERNEATH the term, which made the pairing invisible until you submitted. ... The board emptying is the progress bar. The handoff's rule still holds -- no partial credit, one wrong pair scores the beat Wrong -- it is just enforced by remembering that a mistake happened rather than by a submit step."); I:1260-1261; I:1273-1275 "BOTH tiles in the attempt are flashed, identified by side as well as key: a definition tile is keyed by the term it belongs to, so flashing by key alone lit up the wrong tile and left the one you actually tapped grey."

---

### 3.13 `rapid` -- RapidBody (I:1407-1527): Rapid-fire set

**Purpose.** "A set of quick questions on ONE shared countdown that keeps running between them. The set is one scored beat; the children score nothing." (T:245-247). Level 2's model has no timer.

**Contract (`RapidBeat`, T:248-259).** `kind: "rapid"`, `id`, `question` (NOT RENDERED by RapidBody -- content sets it to ""), `timer?`, `items: {question, options: {label, correct, why}[]}[]`, `whenPass`, `whenFail`, `feedback`, `feedbackCta`, `skills`.
```ts
// ib-level-1.ts L1-18 (timed 45s, 4 items)
{ kind: "rapid", id: "L1-18", planLineIfFailed: "you missed the small rules of how people here talk to each other",
  progress: 0.4, timer: 45, speaker: "Christina", castMember: "Christina", question: "",
  items: [
    { question: "How long should an email to a senior banker be?",
      options: [
        { label: "Two full pages with every detail", correct: false, why: "Too long. Bankers read on a phone between meetings." },
        { label: "Four sentences or less", correct: true, why: "Right. Answer first, detail underneath." },
        { label: "As long as possible to explain everything", correct: false, why: "Long is not thorough. The skill is what you leave out." } ] },
    /* ...3 more items... */ ],
  whenPass: "Right. Short, honest, quick to flag, and you know the words. ...",
  whenFail: "Close. On a real desk any one of those four slips is the one people remember.",
  feedback: "", feedbackCta: "Continue", skills: ["Written Communication", "Decision-Making"] }
```

**Layout.** Header row: "QUESTION {n} OF {N}" 12px extrabold `tracking-[0.14em]` `--accent-subtle`; dot track (aria-hidden) gap 5px, dots `h-[6px] rounded-full`, width 20 current / 6 otherwise, color: answered = success (even if answered wrong -- dots don't encode correctness), current = foreground, upcoming = raised; `transition-[width,background] 300ms`. `Question` = the ITEM's question. `OptionButton` list (per-item seeded shuffle; key `${beat.id}:${index}`), tier mapped `correct ? "best" : "wrong"`. After a pick, an explanation box: `rounded-[12px] border px-[12px] py-[10px] text-[13.5px] leading-[19px] font-semibold`, bg `color-mix(success|wrong-orange 14%, glass-surface-1)`, border same color, shows the picked option's `why`, `fade-slide-up 0.24s cubic-bezier(0.16,1,0.3,1)`. Footer: "{need} of {N} correct to pass. No score on single questions." 12.5px semibold muted.

**Input.** Tap or digit keys (enabled while `picked === null`). One pick per item.

**Validation & timing.** Pick: `playCorrect`/`playWrong`; count right; after 480 ms (hit) or 1150 ms (miss) advance to next item (I:1458-1460 "Longer on a miss: the green answer has to be readable before the next question replaces it."). After the last item, or when a timed beat's `remaining <= 0`, `finish(right)`: `pass = right >= passThreshold(items.length)` -> `onResolve(pass ? "best" : "wrong", pass ? whenPass : whenFail)`. Unanswered questions at timeout count as wrong. `settled` ref prevents double finish (timer vs last-pick race).
- DISCREPANCY: code passes at `ceil(0.75 * n)` (3 of 4). ib-level-1.ts L1-18 comment says "Under binary scoring all four sub-questions must be right; the old three-of-four pass is retired." and its whenFail says "any one of those four slips". The code was NOT changed to match; the on-screen footer says "3 of 4 correct to pass". Decide which is canonical before scaling.

**Timer fix comment (I:1429-1435).** Without `beat.timer`, `remaining` is 0 from the first render; the effect "used to fire immediately on mount, resolving the whole set as failed before the player ever saw question one." Guard `if (beat.timer && remaining <= 0)`.

**Explanation comment (I:1503-1509).** "(direct feedback, 10 Sept 2026: 'in the express version we need explanation when you get something wrong ... didnt happen'). Shown for the ~480/1150ms window before the next question".

**Edge.** Items with zero correct options: never passable per item. `items: []` -> `item` undefined -> renders null and never resolves (soft-lock; GAP). Many items + short timer: clock keeps running during the 480/1150 ms feedback windows.

---

### 3.14 `chain` -- ChainBody (I:1537-1620): Build the Strongest Answer

**Purpose.** "Three prompts in sequence, each adding a sentence to the answer box. The chain scores ONCE: all steps right is Best, anything less is Wrong, because the three sentences are one argument." (I:1534-1536; T:269-272 "partial credit would teach three separate facts instead of one skill").

**Contract (`ChainBeat`, T:273-282).** `kind: "chain"`, `id`, `question`, `steps: {label, prompt, options: {label, correct}[]}[]` (options have NO `why`), `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`.
```ts
// ib-level-2.ts L2-11
{ kind: "chain", id: "L2-11", planLineIfFailed: 'you built an argument for the client that did not hold together', progress: 0.2,
  speaker: "Narrator", setup: "Build the pitch one sentence at a time. All three parts have to connect.",
  question: "What is Cobalt's case for Maison Laurent?",
  steps: [
    { label: "Client goal", prompt: "What does Maison Laurent want?",
      options: [ { label: "Grow globally", correct: true }, { label: "Cut its marketing budget", correct: false }, { label: "Sell fewer products", correct: false } ] },
    { label: "Cobalt strength", prompt: "Why is Cobalt a good fit?", options: [ ... { label: "Understands luxury brands", correct: true } ... ] },
    { label: "Outcome", prompt: "What can Cobalt help Maison Laurent earn?", options: [ { label: "Investor trust", correct: true }, ... ] } ],
  whenRight: "Right. Goal, strength, outcome. Three sentences that hold together as one argument.",
  whenWrong: "Close. A pitch only works if all three parts connect. One weak link breaks it.",
  feedback: "...", feedbackCta: "Continue", skills: ["Persuasive Communication", "Critical Thinking"] }
```

**Layout.** `Question`; step pills row `flex gap-[7px]`, each pill `flex-1 h-[24px] rounded-full border text-[11px] font-extrabold tracking-[0.06em] uppercase`, colors: done = success border + `color-mix(success 18%)` bg; current = primary border; upcoming raised border + muted text; `transition-colors 300ms`. Built answer box (once >= 1 step done): `rounded-[12px] border px-[12px] py-[10px] text-[14px] leading-[21px]` glass-surface-1, text = `built.join(". ") + "."`. Current step prompt 15px bold foreground; `OptionButton`s in AUTHORED order (not shuffled), tier `correct ? best : wrong`, with reveal of the correct one on a miss.

**Input.** Tap or digit keys (enabled while `picked === null`).

**Validation & timing.** Per step: `playCorrect`/`playWrong`; after 460 ms (right) / 1150 ms (wrong): append the CORRECT option's label to the built answer regardless of what was picked (the box always reads as the right argument), carry `missed`, advance. After the last step: `playSweep()` (plays even on failure) then immediately `onResolve(wrong ? "wrong" : "best", wrong ? whenWrong : whenRight)`.

**Edge.** Option labels should not end with punctuation (the join adds ". "). Step pills keyed by `label` (duplicates collide). No shuffle -> put the correct option in varying positions manually (L2-11 does: 1st, 2nd, 1st). `settled` guard.

---

### 3.15 `slider` -- SliderBody (I:1625-1695): Risk Slider

**Purpose.** Judge a level on an ordered scale (Low / Medium / High / Critical), then submit. "Only the correct segment scores its tier; neighbours are not partial credit." (T:284-285). NOTE: in practice each step carries its OWN tier, so an author CAN give a neighbour `acceptable` (L2-14 gives "Critical" acceptable and "Low" risky) -- the component simply scores whatever tier the selected step has.

**Contract (`SliderBeat`, T:286-295).** `kind: "slider"`, `id`, `question`, `steps: {label, tier, why}[]` (low to high), `feedback`, `feedbackCta`, `skills`, `timer?` (declared but not honored, see gaps).
```ts
// ib-level-2.ts L2-14
{ kind: "slider", id: "L2-14", planLineIfFailed: 'you passed work up the chain without checking where the numbers came from',
  progress: 0.4, mood: "night", speaker: "Christina",
  setup: '"I need the model before Marcus reviews it. You aligned at kickoff, so I am not checking behind you on this one."',
  question: "How risky is it to send Marcus the model without checking the source?",
  steps: [
    { label: "Low", tier: "risky", why: "Not low. If the source is wrong, Marcus repeats it to the client." },
    { label: "Medium", tier: "wrong", why: "Higher. Christina trusts you now, so nobody checks behind you." },
    { label: "High", tier: "best", why: "Right. High. It can still be caught, but only if someone catches it." },
    { label: "Critical", tier: "acceptable", why: "Close. Critical is for things you can't undo. This is still fixable." } ],
  feedback: "...", feedbackCta: "Continue", skills: ["Critical Thinking", "Decision-Making"] }
```

**Layout.** `Question`; panel `rounded-[var(--radius-lg)] border px-[14px] pt-[16px] pb-[12px]` glass-surface-1. Current label 19px display extrabold colored by `shade[at]`. Track area `relative mt-[14px] mb-[10px] h-[26px]`: segment bar `h-[10px] rounded-full overflow-hidden gap-[3px]`, one `flex-1` segment per step colored `shade[min(i,3)]`, opacity 1 for `i <= at` else 0.22, `transition-opacity 200ms`. `shade` (I:1629) = [success green, `--world-business-money-office` amber, `--world-building-construction` orange, `--destructive` red]; steps beyond 4 reuse red. Handle: 24x24 circle `border-2`, fill `--foreground`, border = current shade, shadow `0 4px 12px rgba(0,0,0,0.45)`, `left: (at/last)*100%`, `transition-[left] 200ms`, pointer-events none. Labels row under the track `flex justify-between text-[11.5px] font-bold` muted, current label foreground. Submit button (primary recipe, "Submit", `disabled:opacity-50`).

**Input/a11y.** A real `<input type="range" min=0 max={last} step=1>` stretched over the track at opacity 0 (`absolute inset-0 w-full cursor-pointer opacity-0`) -- mouse drag, touch drag, click-to-jump, keyboard arrows/Home/End all native. `aria-label = question`, `aria-valuetext = current step label`. `playSelect()` on every change. Starts at index 0 (lowest). Submit is always enabled (a student can submit the default without moving).

**Validation.** Submit: `locked = true` (range and button disabled), `tierSound(step.tier)`, `onResolve(step.tier, step.why)`. Correct segment is NOT revealed on screen after a wrong submit (only the feedback why explains).

**Edge/gaps.** `steps.length === 1` -> `last = 0` -> handle `left: NaN%` (GAP). `timer` on a slider: Clock shows and hits 0 but nothing resolves (BeatStage only auto-resolves `choice`; SliderBody doesn't receive `remaining`) -- GAP; no content uses it. Labels `justify-between` can crowd with 5+ steps on a phone. Comment I:1670-1671 "Labels sit UNDER the track, not on it: on the prototype the handle covered the word it was pointing at." Comment I:1622-1624 "A real range input drives it, so keyboard and screen readers work; the segments are painted around it."

---

### 3.16 `flags` -- FlagsBody (I:1700-1771): Find All Red Flags

**Purpose.** "Tap every row that is wrong, then submit. All the flags and nothing else is Best; anything else is Wrong. Tapping everything must not pass, which is why false positives count against you." (I:1697-1699).

**Contract (`FlagsBeat`, T:298-308).** `kind: "flags"`, `id`, `question`, `rows: {label, flag, why}[]`, `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`, `timer?`.
```ts
// ib-level-2.ts L2-17 (timed 60s, tone alarm)
{ kind: "flags", id: "L2-17", planLineIfFailed: 'you signed off on someone else\'s work with errors still in it', progress: 0.6,
  timer: 60, speaker: "Narrator", castMember: "Jordan", tone: "alarm",
  setup: "It is 10:10 AM. The meeting is in 20 minutes. There are errors in Jordan's work, and you have to fix them before Christina and Marcus come in.",
  question: "Tap every red flag in Jordan's work.",
  rows: [
    { label: "Bags sold: 2", flag: false, why: "Not an error. Two is small, but not wrong." },
    { label: "Price per bag: $2,000", flag: false, why: "Not an error. That's a normal price." },
    { label: "Revenue: 2 × $2,000 = $400", flag: true, why: "Right. 2 × $2,000 is $4,000, not $400." },
    { label: "Profit: $4,000 − $1,000 = $5,000", flag: true, why: "Right. ... Subtracting can't grow a number." },
    { label: "Source: Missing", flag: true, why: "Right. A number nobody can check should never reach a client." } ],
  whenRight: "Right. The multiplication, the subtraction, and the missing source.",
  whenWrong: "Three lines are wrong: the multiplication, the subtraction, and the missing source.",
  feedback: "...", feedbackCta: "Continue", skills: ["Critical Thinking", "Helping & Supporting Others"] }
```

**Layout.** `Question`; counter "{marked} of {total} red flags marked" 12.5px bold muted (NOTE: tells the student how many flags exist). Rows `ul flex-col gap-[7px]`; row button `flex gap-[10px] rounded-[12px] border-2 px-[12px] py-[11px] text-[14.5px] font-semibold text-left`, enter `fade-slide-up 0.3s` delay `i*40ms`, transition 150ms. Off: glass-surface-1 / raised. On: `color-mix(destructive 18%)` / destructive. Leading checkbox 22x22 `rounded-[7px] border-2`, on = filled destructive with Flag icon 13px `#05070f`. Authored order (no shuffle). Submit "Submit findings" (primary recipe, always enabled).

**Input/a11y.** Toggle buttons with `aria-pressed`; `playSelect()` on each toggle. No digit keys.

**Validation.** `right = rows.every((row, i) => row.flag === picks.includes(i))` -- exact set equality. `playCorrect`/`playWrong`, `onResolve(right ? "best" : "wrong", right ? whenRight : whenWrong)`. On timer expiry: `submit(marked)` with whatever is marked (I:1717-1720 "Out of time: score whatever was found at that moment, per the rules tab."). `settled` ref.
- Row `why` strings are NEVER rendered (GAP: authored per row, unused). No per-row right/wrong reveal after submit; rows remain toggleable after submit (no lock state; the `settled` guard makes it harmless).

---

### 3.17 `rank` -- RankBody (I:1775-1935): Rank the Order

**Purpose.** Order rows correctly (priority, hierarchy, sequence). Default all-or-nothing; authoring `whenClose` turns on three-band partial credit (T:310-314, "the RN handoff's three-band scoring").

**Contract (`RankBeat`, T:315-328).** `kind: "rank"`, `id`, `question`, `order: string[]` (CORRECT order; player always sees it shuffled), `whenRight`, `whenClose?`, `whenWrong`, `feedback`, `feedbackCta`, `skills`.
```ts
// rn-level-1.ts RN1-15 (three-band)
{ kind: "rank", id: "RN1-15", planLineIfFailed: "you went to the least urgent patient first while someone else was waiting on you",
  progress: 0.4, speaker: "Narrator",
  setup: "10:20 AM. Four patients need you at the same time. Rosa is in a room with the door shut.",
  question: "Put them in the order you go.",
  prompt: "Use the arrows to order them, then tap Submit rank.",
  order: [ "A patient who says she cannot catch her breath", "A patient climbing out of bed on his own",
           "A patient whose pain medicine is due now", "A patient asking when lunch comes" ],
  whenRight: "Right. Breathing first, then the fall waiting to happen, then pain, then the question that can wait.",
  whenClose: "Three of four in the right place. Close enough to be safe, not yet the order an experienced nurse would take.",
  whenWrong: "Breathing comes before everything. ...", feedback: "", feedbackCta: "Continue", skills: ["Time Management", "Helping & Supporting Others"] }
// ib-level-3.ts L3-09 (6 rows, all-or-nothing)
  order: ["Intern", "Analyst", "Associate", "Vice President", "Executive Director", "Managing Director"]
```

**Initial order (I:1776-1784).** Deterministic (NOT per-load random): for i from n-1 down to 1, `j = (i*7 + n*3) % (i+1)`, swap. If the result equals the answer, reverse it. So every student sees the same starting order for a given list length.

**Layout.** `Question`; `ul flex-col gap-[6px]`. Row `<li>`: `flex items-center gap-[10px] rounded-[12px] border px-[11px] py-[9px] touch-none select-none`, bg glass-surface-1, border raised (held: `--accent-subtle`). Contents: GripVertical icon 15px opacity 0.45; position badge 22x22 round, bg raised, 11.5px extrabold tabular-nums, shows `slot(index)+1` (live renumbering during drag); label `flex-1 text-[14.5px] font-bold`; up/down buttons wrapped in `IconTip` ("Move up"/"Move down"): `dm-quiet h-[36px] w-[36px] md:h-[30px] md:w-[30px] rounded-[var(--radius-sm)] border`, ChevronUp/Down 16px, `disabled:opacity-30` at the ends, `aria-label="Move {row} up|down"`. Submit "Submit rank" (primary recipe, `disabled:opacity-50`). First-use `GestureSpotlight` on row 1: "Press & drag to reorder" (key `rank-drag`).

**Input model.**
- Pointer drag on the whole row (mouse left button or touch; `event.button !== 0` ignored): `setPointerCapture`; row height measured `rect.height + 6` (the list gap); `dy = clientY - startY`; target slot `= clamp(index + round(dy/height), 0, n-1)`. While dragging: the held row follows the pointer exactly (`translateY(dy) scale(1.03)`, shadow `0 14px 30px rgb(0 0 0 / 0.42)`, z-index 2, transition only on box-shadow 0.15s); rows between origin and target translate one slot out of the way with `transform 0.2s cubic-bezier(0.16,1,0.3,1)`; `will-change: transform`. On pointerup/cancel: if target != origin, `playSelect()` and commit the reorder (splice). `playSelect()` also on pointer down. Cursor grab/grabbing; default when locked.
- Arrow buttons: `stopPropagation` on their pointerdown so they don't start a drag; `move(index, ±1)` with `playSelect()`. These are the keyboard and screen-reader route (Tab to a button, Enter/Space).
- No digit keys. UNCLEAR: no live region announces new positions for SR users.

**Validation (I:1914-1926).** `right = rows.join("|") === order.join("|")`. `placed = count of rows in the correct index`. `close = !right && Boolean(whenClose) && placed >= n - 2`. Sounds: correct if right or close, else wrong. Result: right -> `("best", whenRight)`; close -> `("acceptable", whenClose)`; else `("wrong", whenWrong)`. Submit locks the list (arrows disabled, drag disabled). The correct order is not shown on screen afterwards.
- DISCREPANCY: T:310-314 says partial credit is for "exactly one adjacent pair swapped"; code accepts ANY arrangement with n-2 rows in place (e.g. a non-adjacent swap of rows 1 and 4). For n = 3, n-2 = 1 correct row counts as "close". Specify the rule precisely before scaling.

**Edge.** Duplicate row strings: React keys collide and `join("|")` comparison still works but drag keys break. A row label containing "|" could false-match (theoretical). `order` of length 1: initial reverse equals itself (always correct).

**Comments.** I:1773-1774 "Rows arrive shuffled -- the prototype loaded one of these already in the right order"; I:1787-1793 "Dragging is the obvious gesture for a list you are ordering, by mouse and by finger. The arrows stay as the keyboard and screen-reader route. The rows SLIDE rather than swap. ... Reordering the array mid-drag would move rows by re-layout, which no transition can animate."; I:1797-1798 "GripVertical is a weak affordance on its own -- press-and-drag to reorder isn't obvious from a static icon. First encounter only."; I:1839-1847 "Committing the reorder must NOT happen inside setDrag's own updater -- React 18 Strict Mode double-invokes state updaters ... the reorder silently applied twice ... Read `drag` directly ... and keep setDrag(null) separate and side-effect-free."; I:1880-1881 "The held row must track the pointer exactly; the rows moving out of its way are the ones that should ease."; I:1894-1895 "36px, not the original 30px -- a real repeatedly-tapped control mid-simulation (mobile audit, 9 Sept 2026)."; I:1918-1919 "Partial credit (RN handoff): one adjacent swap leaves N-2 rows in place -- 'three of four in the right place' on a 4-row beat."

---

### 3.18 `pick` -- PickBody (I:1937-2022): Pick N of M

**Purpose.** Choose exactly N cards, then submit. "A harmful card in the set scores Risky however good the rest are." (T:330-331).

**Contract (`PickBeat`, T:332-344).** `kind: "pick"`, `id`, `question`, `pick: number`, `cards: {label, role: "pick" | "leave" | "harmful"}[]`, `whenRight`, `whenWrong`, `whenHarmful?` (falls back to whenWrong), `feedback`, `feedbackCta`, `skills`, `timer?`.
```ts
// ib-level-3.ts L3-11 (timed 60s, harmful cards)
{ kind: "pick", id: "L3-11", planLineIfFailed: 'you put the team on work that did not move the deal forward', mood: "crunch",
  speaker: "Narrator", progress: 0.2, timer: 60,
  setup: "You manage two Analysts. Silverman Sacks is chasing the same deal.",
  question: "Pick the 2 tasks that give Cobalt the best chance.", pick: 2,
  cards: [
    { label: "Bring sharper market insight", role: "pick" },
    { label: "Point out the risks in Silverman Sacks' plan", role: "pick" },
    { label: "Offer to cut Cobalt's fees", role: "leave" },
    { label: "Get inside information on Silverman Sacks", role: "harmful" },
    { label: "Make the numbers look bigger", role: "harmful" } ],
  whenRight: "Right. Better insight and a clear read of the rival are what a client pays a bank for.",
  whenWrong: "Cutting fees buys the work instead of earning it. Cobalt wins on thinking, not price.",
  whenHarmful: "Stolen information and inflated numbers end careers. Nothing won that way survives.",
  feedback: "...", feedbackCta: "Continue", skills: ["Decision-Making", "Critical Thinking"] }
```
RN1-24 is the untimed variant (`pick: 3` of 6, no harmful cards).

**Layout.** `Question`; counter "{chosen} of {pick} chosen" 12.5px bold, muted, turns success color when full. Cards (seeded shuffle, key beat.id) `ul flex-col gap-[7px]`; card button `flex gap-[10px] rounded-[12px] border-2 px-[12px] py-[11px] text-[14.5px] font-semibold text-left`, enter `fade-slide-up 0.3s` delay `i*40ms`, transition 150ms. Off: glass-surface-1/raised. On: `color-mix(primary 20%)` / primary, leading circle 22x22 `rounded-full border-2` filled primary with Check 13px `#05070f`. When full, unselected cards: `cursor-not-allowed opacity-45`, `aria-disabled` (still focusable). Submit (primary recipe, disabled until exactly full: `disabled:cursor-not-allowed disabled:opacity-45`).

**Input.** Tap to toggle (`aria-pressed`); `playSelect()` on select only (deselect silent). Cannot exceed N (tap ignored). No digit keys.

**Validation (I:1944-1956).** `harmful = any chosen card has role "harmful"`; `right = !harmful && chosen.length === pick && every chosen role === "pick"`; tier = harmful ? `risky` : right ? `best` : `wrong`. `playCorrect` if right else `playWrong`. Why = right ? whenRight : harmful ? (whenHarmful ?? whenWrong) : whenWrong. Timer expiry submits the partial selection (fewer than N -> wrong, or risky if a harmful is among them). `chosen` indexes the SHUFFLED array and roles are read off the same array (I:1938-1939 "positions and roles can never disagree"). No reveal of the correct set on screen; no lock state after submit (settled guard).

**Edge.** Authoring more "pick"-role cards than `pick` means several right answers are impossible to all select; exactly `pick` cards should have role "pick". Risky = -6 and 2 strikes (can trigger the PIP in one beat together with one earlier wrong).

---

### 3.19 `bucket` -- BucketBody (I:2027-2117): Two-Bucket Sort

**Purpose.** "One item at a time, two buttons, and it passes at three quarters of the items rounded up -- the universal rule for any beat made of sub-items." (I:2024-2026).

**Contract (`BucketBeat`, T:348-359).** `kind: "bucket"`, `id`, `question`, `buckets: [string, string]`, `items: {label, into: 0 | 1}[]`, `whenRight`, `whenWrong`, `feedback`, `feedbackCta`, `skills`. No timer.
```ts
// ib-level-3.ts L3-12
{ kind: "bucket", id: "L3-12", planLineIfFailed: 'you filled the pitch with things the client had not asked about', mood: "crunch",
  speaker: "Christina", progress: 0.3, setup: '"Which of these belong in the final pitch?"',
  question: "Sort each idea.", buckets: ["Helps Cobalt win", "Weak pitch"],
  items: [
    { label: "Show why Asia growth matters", into: 0 }, { label: "Use general fashion trends", into: 1 },
    { label: "Prove Cobalt understands luxury customers", into: 0 }, { label: "Focus only on slide design", into: 1 },
    { label: "Explain risks in Silverman Sacks' plan", into: 0 }, { label: "Promise results without evidence", into: 1 } ],
  whenRight: "Right. A pitch is built from what the client cares about, not from what was easy to make.",
  whenWrong: "Close. Look for the ideas that answer why Cobalt, not the ones describing what Cobalt did.",
  feedback: "...", feedbackCta: "Continue", skills: ["Persuasive Communication", "Critical Thinking"] }
```

**Layout.** `Question`; header row: dot track (`aria-label="Item {n} of {N}"`, dots 6px high, width 22 current / 6 others, answered = success regardless of correctness, current foreground, upcoming raised, transition 300ms) and "{need} of {N} to pass" 12px bold muted. Item card: `rounded-[var(--radius-lg)] border-2 px-[14px] py-[16px] text-[16px] leading-[23px] font-bold`, glass-surface-1/raised, keyed by label so each new item plays `play-pop 0.36s cubic-bezier(0.34,1.56,0.64,1)`. Two bucket buttons side by side `flex gap-[8px]`, each `flex-1 rounded-[var(--radius-md)] border-2 px-[12px] py-[14px] text-[14.5px] font-extrabold`, transition 150ms. Flash on the TAPPED bucket only: right = `color-mix(success 22%)` / success; wrong = `color-mix(destructive 22%)` / destructive + `play-shake 0.42s`. The correct bucket is not highlighted on a miss.

**Input.** Tap a bucket or press 1 / 2 (`useDigitKeys(2, ...)` enabled when not flashing). Buttons disabled during the flash.

**Validation & timing.** `ok = item.into === into`; sound; flash; after 420 ms (ok) / 900 ms (miss) record score and advance. After the last item: `playSweep()` (even on fail), `pass = score >= passThreshold(n)` -> `onResolve(pass ? "best" : "wrong", pass ? whenRight : whenWrong)`. Items in AUTHORED order (author should interleave buckets manually; L3-12 alternates 0/1 strictly, which is itself a learnable pattern -- flag for content). Buckets always in authored order.

**Edge.** Duplicate item labels collide (key + pop replay). `items: []` renders null and never resolves (GAP, soft-lock).

---

## 4. Result contract summary (what each kind reports)

| kind | onResolve args | possible tiers | pass rule |
|---|---|---|---|
| choice (all layouts) | `(choice.tier, choice.why, choice.id)` | any authored tier; timeout -> wrong | n/a (single pick) |
| match | `(best|wrong, whenRight|whenWrong)` | best, wrong | zero wrong attempts |
| rapid | `(best|wrong, whenPass|whenFail)` | best, wrong | `ceil(0.75 n)` correct (see discrepancy) |
| chain | `(best|wrong, whenRight|whenWrong)` | best, wrong | every step right |
| slider | `(step.tier, step.why)` | any authored tier | selected step's tier |
| flags | `(best|wrong, whenRight|whenWrong)` | best, wrong | exact set of flagged rows |
| rank | `(best|acceptable|wrong, whenRight|whenClose|whenWrong)` | best, acceptable (only with whenClose), wrong | exact order; close = n-2 in place |
| pick | `(risky|best|wrong, ...)` | risky, best, wrong | exactly N, all role "pick", no harmful |
| bucket | `(best|wrong, whenRight|whenWrong)` | best, wrong | `ceil(0.75 n)` correct |
| card, check, reveal, flips, focus, review | `onNext()` only | - | - |

Nothing is persisted per sub-item; the only thing saved is `scores[beat.id] = tier` in the run (SP:281-284). A backend replicating analytics would need to add sub-item telemetry itself.

---

## 5. Adding a NEW interaction kind (checklist derived from the code)

1. **types.ts**: add `XBeat = BeatBase & { kind: "x"; ... }`. For a scored kind include `question`, the "why" strings (per option or `whenRight`/`whenWrong`), `feedback` (legacy, unused but every scored type has it), `feedbackCta`, `skills: string[]`, and `timer?` only if you will honor it. Add it to the `Beat` union (T:373-388). Scored beats also get `progress` and `planLineIfFailed` via BeatBase.
2. **interactions.tsx**: `export function XBody({ beat, onResolve, remaining? }: {...})`. Rules to follow (each is established by existing components):
   - Start with `<Question>{beat.question}</Question>` inside `flex flex-col gap-[var(--space-3)]`.
   - Shuffle display order with `useShuffled(items, beat.id)` and score off the objects, never indices of the authored array.
   - Report exactly once: keep a `settled` ref guard; call `onResolve(tier, why, id?)`. Never compute reputation or navigate.
   - Fire `tierSound(tier)` (or playCorrect/playWrong) at the moment of verdict; `playSelect()` on neutral taps; `playSweep()` for a completed multi-step board.
   - If there are selectable options, use `OptionButton` and `useDigitKeys` so the keyboard route matches the visible digits.
   - If timed, accept `remaining` and resolve when `beat.timer && remaining <= 0` (the guard on `beat.timer` is mandatory, see I:1429-1435). Only `choice` is auto-resolved by BeatStage.
   - Draggables: framer-motion `drag` + `dragSnapToOrigin` + `dragMomentum={false}`, put CSS entrance animations on a wrapper not the dragged element (I:1105-1108), always offer a tap fallback (I:585-587, I:1041-1049), add a `useFirstUseHint("<key>")` + `GestureSpotlight` if the gesture has no static affordance.
   - Icon-only buttons in `IconTip`; min 36px touch target on mobile (I:1894-1895).
   - Colors only from tokens: success `--color-feedback-success`, wrong via `TIER_COLOR`, selection `--primary`, info accent `--accent-subtle`, surfaces `--glass-surface-1/2/3`, borders `--color-glass-border-raised`. Radii via `--radius-sm/md/lg` (CRT mode zeroes them).
   - Every entrance `motion-safe:animate-[fade-slide-up_...]` with a 40-55 ms per-row stagger; shake `play-shake 0.42s` for wrong; `play-pop` for revealed right answers.
3. **SimulationPlayer.tsx**:
   - Import it and add `if (beat.kind === "x") return <XBody .../>` to `BeatBody` (SP:1295-1309) BEFORE the ReviewBody fallthrough (otherwise the new kind renders as a review!).
   - Add a `case "x":` to `DEFAULT_PROMPT` (SP:1236-1262) with the sheet's wording.
   - If scored, add `"x"` to `SCORED_KINDS` (SP:77) -- this drives `scoreScale` (10 / scored count). Forgetting it silently breaks the 50 -> 100 scale.
   - If the beat's `feedbackCta`/`skills` fields exist they are picked up automatically by `FeedbackSheet` (`"feedbackCta" in beat`).
4. **scoring.ts**: do not invent scoring (SC:4-6 "Do not invent new scoring -- every career copies this."). Use `passThreshold` for sub-item sets, TIER_SCORE tiers only.
5. **Content**: `id` unique per level; exactly one best per scored beat; ten scored beats per level with `progress` 0.1..1.0; a `planLineIfFailed` on every scored beat; skills from `SKILL_MEANING` keys.
6. Other places that may switch on `kind` (outside this slice, verify): Express derivation / `expressCut`, `locations.ts` scene mapping, `performance-plan.ts`. `grep -rn 'kind === "' src/components/play src/app/play` before shipping.

---

## 6. GAPS, BUGS and DISCREPANCIES found (flagged, not fixed)

1. **"ChevronRight" is not a KeyboardEvent.key value** (should be "ArrowRight"). Appears in DialogueBox (SP:1710) and FeedbackSheet (SP:2231). Right-arrow therefore does nothing; the comment at SP:1696 promises "space / enter / right". Looks like a lucide `ArrowRight`->`ChevronRight` find-and-replace casualty.
2. **Rapid pass rule vs content**: code passes at 3 of 4 (`passThreshold`), ib-level-1.ts L1-18 comment says all four must be right under binary scoring.
3. **Rank partial credit rule**: types.ts says "exactly one adjacent pair swapped"; code accepts any arrangement with n-2 correct positions (non-adjacent swaps, and for n=3 just one correct row).
4. **Boss has no digit keys** although it shows 1/2/3 badges; and Boss never shows its Action Prompt (bypasses BeatBody). RN1-16's `prompt: "Choose one."` is dead.
5. **DragOptionsBody (scored drag)**: wrong drop plays the wrong sound twice; "Locked in" shows in success green with a check even for a wrong answer; best answer is not revealed after a wrong pick (other choice layouts reveal it).
6. **Choice timeout** marks the fallback wrong option as if the student picked it (X + shake on an option they never touched).
7. **Slider `timer`** is typed but never enforced (Clock would reach 0 with no effect). **Slider with 1 step** -> NaN handle position.
8. **Unused authored strings**: `feedback` on every scored beat (D55), wrong options' `why` in Check, every row `why` in Flags, `RapidBeat.question`. Backend schema can keep them optional.
9. **Empty arrays soft-lock or crash**: `flips.cards: []` crashes; `rapid.items: []` and `bucket.items: []` render nothing and never resolve. Validate at authoring time (min 1 item; min 2 options).
10. **Hard-coded world color**: CardBody `note`, BossOverlay trophy tile, RevealBody amber rows, Slider shade[1], Clock ring all use `--world-business-money-office` instead of the career accent -- they will be amber on a nursing (teal) sim. FlipsBody/CardBody accept `accent`; the rest don't.
11. **BlankBody held-slot border** `rgba(255,255,255,0.55)` is a hard-coded white (weak on light theme). **Blank with 2+ `___`** drops text after the second marker.
12. **useDigitKeys comment** claims focus-in-control is ignored; the code has no such check.
13. **No correct-answer reveal on screen** for Slider, Flags, Rank, Pick, Bucket (miss) -- only the feedback sheet's single sentence explains. Choice-family and Rapid/Chain do reveal.
14. **Progress dots in Rapid and Bucket** mark every answered item green regardless of correctness.
15. **Sweep fanfare on failure**: Chain, Bucket and Match play `playSweep()` on completion even when the result is wrong.
16. **Bucket content pattern**: L3-12 strictly alternates buckets 0/1/0/1 (learnable); items are not shuffled.
17. **Document layout shuffles ordered documents** (e.g. L2-15 "Slide 3..7" appear out of slide order).
18. **Duplicate labels/terms** are used as React keys in Reveal, Flips, Focus, Match, Flags, Rank, Pick, Bucket, Chain pills -- duplicates break rendering/identity. Enforce uniqueness in the authoring schema.
19. **A11y**: no ARIA live region announces right/wrong for any interaction (the feedback sheet has an autofocused button, which is the main SR cue). Rank has no SR announcement of new positions. OptionButton has no custom focus-visible style (browser default).
20. **Orphan comment** I:121-124 (keycap glyph) with no code.

---

## 7. Design-decision comment log (file:line, dated/attributed where the source says so)

interactions.tsx
- I:31-33 bodies report one tier + one line upward; know nothing about reputation/navigation.
- I:35 Resolve's `id` "is the picked option, so the shell can show which one locked."
- I:38-46 randomised positions ("harder to game the system", direct request), stable on screen, per-load nonce, display order only.
- I:78-81 typewriter counts elapsed time; tick counting drifted and stalled.
- I:103-105 digit badges are the keyboard hint.
- I:121-124 keycap glyph (orphan).
- I:127-129 every pick gets colour + shake + sound.
- I:154-157 reveal the best answer at the moment of a wrong pick.
- I:158-161 `numbered` / `compact`.
- I:172-174 right pick gets Build flow's confirm moment (lift + sweep).
- I:205-208 Question is the subheading tier.
- I:220-222 arrival card celebration.
- I:226-229 Act Moment auto-advance vs checkpoint.
- I:282-283 plain ink title, no gradient (direct feedback, 6 Sept 2026).
- I:336-340 BandLadder is a reference table, no current-band highlight.
- I:356-365 PowerLadder as a diagram (direct feedback: "I don't understand what the use of this screen is").
- I:377-378 the rail makes it read as a chart.
- I:412-417 Comprehension Check rules.
- I:424-425 target lights before the drop.
- I:462-464 drag hit-test and dragSnapToOrigin.
- I:527-528 hint after two wrong tries (Interaction Rules).
- I:544-547 D75 deliberate-second token.
- I:585-587 every card is also a tap target.
- I:644-646 Tap to Reveal gating.
- I:718-722 Word Cards: no flip-to-reveal (direct feedback).
- I:730-731 flip sound.
- I:744-746 keyed page turn, one-directional (glossary 3D-safety note).
- I:758-760 binder page look (direct feedback).
- I:767, I:781 sketch filter and squiggle.
- I:796 progress dots.
- I:819-821 Focus One behavior.
- I:929-934 Drag to Answer / Cards to Zone / Message to Chat.
- I:1041-1049 Drag to Blank; tap added after players got stuck on the data-room beat (D75).
- I:1056-1058 first-encounter spotlight.
- I:1060-1061 held/over state for pre-drop feedback.
- I:1067-1068 forgiving 26px halo.
- I:1105-1108 entrance animation on wrapper, not on the draggable.
- I:1129-1131 framer onTap never double-commits.
- I:1166 Catch the Mistake.
- I:1211-1212 Boss Moment.
- I:1245-1255 Match redesign rationale.
- I:1260-1261 defs shuffled deterministically per beat.
- I:1273-1275 flash both tiles by side+key.
- I:1405-1406, I:1408 rapid: shared countdown; only options shuffle.
- I:1429-1435 no-timer rapid resolved as failed on mount (fixed).
- I:1458-1459 longer pause on a miss.
- I:1503-1509 per-question explanation (direct feedback, 10 Sept 2026).
- I:1529-1532 Level 2/3 interactions invent no scoring.
- I:1534-1536 chain scores once.
- I:1622-1624 real range input for a11y.
- I:1670-1671 labels under the track.
- I:1697-1699 false positives count against you.
- I:1718 score what was found at timeout.
- I:1773-1774 rank arrives shuffled (prototype loaded it solved).
- I:1777 deterministic shuffle.
- I:1787-1793 rows slide rather than swap.
- I:1797-1798 grip is a weak affordance.
- I:1808 slot().
- I:1827 +6 = list gap.
- I:1839-1847 Strict Mode double-invoke bug and fix.
- I:1880-1881 held row tracks exactly.
- I:1894-1895 36px arrows (mobile audit, 9 Sept 2026).
- I:1918-1919 RN handoff partial credit.
- I:1938-1939 pick indexes the shuffled array.
- I:2024-2026 three-quarters rule.

types.ts
- T:1-4 careers are data; rules shared by all 25 careers.
- T:6-8 four tiers, exactly one Best, ~one Risky per level, `none` for rapid children.
- T:11-16 Wrong -3 -> -5 (Scoring Model REBUILT 20 Sept to binary scoring).
- T:25-27 headlines derived, never authored.
- T:40-41 per-option why.
- T:45-47 Dreamy poses.
- T:52-56 Action Prompt definition.
- T:57-59 spotlight "score".
- T:61-62, T:65-70 sticky art and `resetScene`.
- T:74-76 mood overrides (L2 navy, L3 maroon, different on purpose).
- T:79-82 castMember; T:83-86 castMembers.
- T:87-91 tone.
- T:94-95 progress only on the ten scored beats.
- T:97-103 planLineIfFailed fills {PLAN_LINE} of the Performance Plan.
- T:109-111 card variants.
- T:114-115 act variant.
- T:129-135 act swaps title/body roles.
- T:136-141 secondaryCta is the only mid-level exit.
- T:143-147 ladder rules (Characters tab).
- T:149-152 system card.
- T:154-156 celebrate (Joshua Pierce, Slack, 6 Sept 2026).
- T:161-166 check methods.
- T:182-185 Word Cards, no flip-to-reveal.
- T:193-195 Tap to Reveal.
- T:205-207 Choice covers Scenario, Timed Scenario, Boss, Fill in the Blank, Catch the Mistake.
- T:216-217 timeout scores Wrong, never Risky.
- T:219-220 `doc` header (was hardcoded to Level 1's Nike summary).
- T:222-227 dragEnabled one mechanic, three names.
- T:231-232 Match all pairs must be right.
- T:245-247 rapid shared countdown, 3/4 pass.
- T:251 L1 and L3 share one clock; L2 has none.
- T:261-262 review.
- T:269-272 chain one score, no partial credit.
- T:284-285 slider neighbours not partial credit.
- T:310-314 rank three-band when `whenClose`.
- T:330-331 harmful card = Risky.
- T:346-347 bucket 3/4 pass.
- T:361-366 Focus One replaces the flip carousel.

SimulationPlayer.tsx (interaction-facing only)
- SP:60-66 DEMO-ONLY `DEMO_CONNECT_SHORTCUT = true` (direct instruction, 17 Sept 2026) -- not interaction logic, listed because `grep DEMO-ONLY` is the authoritative list.
- SP:73-77 SCORED_KINDS.
- SP:112-126 score scaling for Express (direct feedback, 9 Sept 2026).
- SP:267-270 hold 420/1150 ms.
- SP:271-273 repair banks acceptable.
- SP:274-278 beat.id in deps (stale-closure bug filed scores under the wrong beat).
- SP:280-281, 285-287 PIP once per level, preempts feedback.
- SP:418-423 blur only interactive screens.
- SP:447-448 focus-moment cue on the edge.
- SP:664-665 keyed BeatStage gives the countdown its start value.
- SP:1033-1036 BeatStage owns the countdown; timeout = Wrong.
- SP:1083-1091 RPG pacing; no mascot in the simulation (D62).
- SP:1112-1113 clock survives the feedback pause.
- SP:1118-1119 clock starts when the question does.
- SP:1207-1210 do not repeat the spoken line (Joshua Pierce, Slack, 6 Sept 2026).
- SP:1234-1235 DEFAULT_PROMPT in the sheet's own wording.
- SP:1281-1284 every screen states its action.
- SP:1320 review = held breath.
- SP:1696-1697 one gesture: finish line or open question.
- SP:1712-1722 never hijack input under a modal (direct feedback, 17 Sept 2026).
- SP:1740-1743 key presses a card's single button.
- SP:2173-2178 Clock is a ring; silent by direct instruction.
- SP:2216-2219 D55 feedback card contents.
- SP:2228-2230 feedback sheet owns Enter/Space.
- SP:2279-2281 chips tappable from L1-11 onward (Interaction Rules).
