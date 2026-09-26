# Play SOP: building and scaling career simulations and Glossary Games

**Audience:** Usman and his AI agent. **Goal:** recreate the two Play games exactly as they exist in this prototype, then scale them to every career once Joshua delivers each career's script and assets, with no open questions. **Snapshot:** commit `2ff4bd5d`, 26 Sept 2026.

The prototype is the reference implementation. Layout, copy, behavior, timings and feedback logic come from `src/`; token names come from the certified Figma export (see `docs/DESIGN_SYSTEM_ALIGNMENT.md`). Nothing in this SOP is a proposal unless it is labelled as one.

## How to use this SOP (reading order for an agent)

1. This README: the pipeline, the design rules and the per-career checklists.
2. [06-known-issues-and-decisions.md](06-known-issues-and-decisions.md): read before writing code. It lists every place the code and its comments disagree, the bugs to fix while porting, and the decisions to get from Joshua before career #3.
3. The reference chapter for whatever you are building. Each one is exhaustive (every field, value, timing, color, animation and edge case, with `file:line`):

| Chapter | Covers |
|---|---|
| [01-simulation-data-model.md](01-simulation-data-model.md) | Every type and field, the 15 beat kinds with real examples, scoring math, skills, Performance Plan data, progress saves, locations, expressions, the asset inventory, beat-by-beat tables of all five shipped levels, the reusable pacing template |
| [02-simulation-player.md](02-simulation-player.md) | The runtime: state machine, scenes and characters, the dialogue system (typewriter, tap to finish, voice blips), HUD, feedback and correction model, error states, every animation, sound and music, trailer, Performance Plan, Connect interstitial |
| [03-simulation-interactions.md](03-simulation-interactions.md) | All 19 interaction screens: data, layout, input, validation, feedback, animations, edge cases; shared primitives to reuse; how to add a new kind |
| [04-glossary-game.md](04-glossary-game.md) | The Glossary Game end to end: content schema, state machine, remediation, every screen, sound and music, animations, edge states |
| [05-play-hub-art-and-history.md](05-play-hub-art-and-history.md) | The Play hub, all 18 entry points into Play, every image slot, and the dated decision log (the WHY of each decision, with quoted feedback) |
| [07-art-direction-and-prompts.md](07-art-direction-and-prompts.md) | Which image goes where, how Joshua's art is separated into sprites and backgrounds, the sprite master prompt, post-processing, art QA |
| [templates/simulation-content-intake.md](templates/simulation-content-intake.md) | Exactly what a career's simulation dataset must contain, the writing rules and the validation list |
| [templates/glossary-content-intake.md](templates/glossary-content-intake.md) | The same for a Glossary lesson |

Existing related docs: `docs/handoff/specs/play.md` (locked spec, partly stale; see ch. 6 §F), `docs/handoff/sprite-master-prompt.md` (the master prompt), `docs/COMPONENT_STATES_PLAYBOOK.md` (default empty/loading/error treatments), `docs/CROSS_BROWSER_GUARDRAILS.md` (run its self-check on any UI work).

---

## 1. The architecture in one page

**A career simulation is data, not components.** `src/components/play/types.ts` defines the whole vocabulary. A `Simulation` holds `Level[]`; a level holds an ordered `Beat[]` (a union of 15 kinds) plus `Ending[]`. Adding a career means writing data and adding entries to a handful of lookup maps; the player and the 15 interaction components never change.

```
/play                        PlayHub.tsx            hub (rows built from games.ts)
/play/[game]?level=&mode=    [game]/page.tsx        resolves Simulation + Level (+ Express)
                             SimulationPlayer.tsx   walks beats; scene, dialogue, HUD, scoring, endings
                             interactions.tsx       one body component per beat kind; reports one tier
                             TrailerFlow / PerformancePlanFlow / ConnectInterstitial   overlays
/play/glossary/[career]      GlossaryGameExperience.tsx + glossary/data.ts
```

Per-career data lives in: `games.ts` (registry), `<abbr>-level-N.ts` (beats and endings), `locations.ts` (rooms and the beat→room map), `expressions.ts` (sprites), `performance-plan.ts`, `music.ts`, `SimulationPlayer.tsx` `VOICE_PITCH`, `glossary/data.ts`. Chapter 6 §C lists every map and what silently happens when an entry is missing.

**Production shape (recommendation for the backend):** serve each career as one JSON document that matches `types.ts` exactly (plus the lookup maps folded in: locations, sprites, voice pitches, plan, music), validated on import against the intake checklists. Keep scoring, pacing and feedback logic in the client exactly as they are ("Do not invent new scoring: every career copies this", `scoring.ts:3-6`). Move persistence (run saves, strikes, unlocks, completion, XP) server-side; today it is all `localStorage` (keys in ch. 1 §4.3 and ch. 4 §2.8). Score by option id and tier, never by position: answer order is shuffled per page load.

---

## 2. The pipeline: from Joshua's dataset to a live career

| Step | Owner | Input | Output | Done when |
|---|---|---|---|---|
| 1. Receive | Joshua | Script workbook (Scoring Model, Interaction Rules, Characters, Trailer tabs; per-level screen sheet) and the asset pack (scene art, room art, character references) | | Both received |
| 2. Map the script | Usman's agent | Workbook | A dataset in the intake format (`templates/simulation-content-intake.md`) | Every row has a kind, fields and ids; the validation list passes |
| 3. Resolve blockers | Joshua | Anything the sheet leaves open (salaries, endings marked draft, unsourced statistics) | Answers | Nothing invented: unsourced numbers ship without the number; open salaries stay off-screen |
| 4. Separate the art | Usman / art | Joshua's pack | Sprites via the sprite master prompt; people-free room plates; face chips; hero scenes and a cover prepared (ch. 7) | Art QA checklist (ch. 7 §5) passes |
| 5. Wire the data | Usman's agent | Dataset + art | Level data, registry entry, locations and beat map, sprites and ratios, voice pitches, Performance Plan, music, Connect insight, Home and My Plan entries | Every map in ch. 6 §C has the career |
| 6. Glossary (if supplied) | Usman's agent | Glossary sheet | `GlossaryCareer` content, hub card, icons | Glossary validation list passes |
| 7. QA | Usman + Chandu | The build | Section 7 checklist | Every item checked on phone, tablet and desktop, Chrome on Windows included |
| 8. Ship | | | Career in `SIMULATIONS`; removed from `SOON` | Joshua signs off the endings copy |

---

## 3. Adding a new career simulation (step by step)

Follow in order. Detail: ch. 1 §2.5 and ch. 2 §11.

1. **Ids.** Choose `Simulation.id` (the URL slug; also the save, plan and music key), `careerId` (the catalogue slug, usually the same), and a beat-id prefix unique across all careers (`SE1-`). Beat ids share one global location map.
2. **Level file** `src/components/play/<abbr>-level-1.ts` exporting a `Level`: `id`, `n: 1`, `role`, `title`, `blurb`, `cover`, `mood: "day"`, `cast` (speaker → face chip), `beats`, `endings`; `hideBand: true` for rebuilt levels; `expressCut` (teaching beats only) if the career gets Express mode.
   - Exactly **10 scored beats** (choice, match, rapid, chain, slider, flags, rank, pick, bucket), `progress` 0.1…1.0, each with `planLineIfFailed`, two skills that exist in `SKILL_MEANING`, and `feedbackCta`.
   - The **last beat is `review`**. Endings include `min: 0` and an `85` ending with `advances: true`.
   - Follow the pacing template (ch. 1 §6.6 and the intake template) and the writing rules (intake template).
3. **Register** in `games.ts`: the `Simulation` (title, world = exact `WORLD_COLORS` key, fictional firm, cover, 7-card trailer with a `finale`, levels, `upcoming` so built + upcoming = the six-rung ladder). Append to `SIMULATIONS`; remove the career from `SOON`.
4. **Rooms** in `locations.ts`: add `LocationId`s, `LOCATION_ART` entries (src, alt, focal, mobileFocal, characterAnchor) and a `BEAT_LOCATION` entry for **every beat except the final review**.
5. **Sprites** in `expressions.ts`: `DEFAULT_EXPRESSION` for every on-screen character, `EXPRESSION_PORTRAITS` tier sets for characters who react, `PORTRAIT_RATIO` for every file (its real width/height).
6. **Voices**: `VOICE_PITCH` in `SimulationPlayer.tsx` for every speaking character (mentors 600-640 Hz, judges 360-400, peers 470-505).
7. **Performance Plan**: `PERFORMANCE_PLANS["<id>"]` for levels 1, 2 and 3 (without it the IB plan text shows).
8. **Music**: `SIM_TRACKS["<id>"] = { main, promotion? }` (otherwise IB's songs play).
9. **Connect**: `STAGE_INSIGHT["<id>:<role>"]` and a Connect community in the career's world.
10. **Home and My Plan**: Home hardcodes IB and RN (`HomeExperience.tsx`); My Plan's glossary task hardcodes IB.
11. **Entry points** light up by themselves: Career Detail and the Explore reel show "Play Game" once `simulationFor(slug)` finds the career; Top 3 routes to it.
12. **QA** with section 7.

## 4. Adding a new Glossary Game (step by step)

Detail: ch. 4 §1.5.

1. Author the `GlossaryCareer` in `glossary/data.ts` per `templates/glossary-content-intake.md`: 5 terms, 7 main questions, review questions, one Power Play paragraph, facts.
2. Add any new icon slugs to `TERM_ICON_MAP` (relevant to the lesson's story; never emoji).
3. Parameterize the three hardcoded "finance" strings (issue A11) before the second career ships.
4. Add the hub card to `GLOSSARY_GAMES` ("<Subject> Terms", sub "Learn key <subject> terms", cover). The Career Detail "Glossary Game" button appears once `hasGlossary(slug)` is true.
5. QA with section 7.

---

## 5. The experience rules (why the games feel the way they do)

These are the decisions behind the build. Each is recorded in code comments or the handoff log with its source; do not change them without Joshua or Chandu.

### Simulation

- **RPG pacing.** Read the situation first; advance when you are ready; only then do the question and options appear. A staged beat types its setup line, the student taps to continue, then the interaction rises in.
- **Tap to finish, then tap to reveal.** While a line is typing, one tap (or Space, Enter, "A") shows the whole line at once; the next tap reveals the question. The whole dialogue box is the tap target.
- **Three voices, three looks, three sounds.** A named **character** speaks in a chat-notched bubble, in the display face, with a name, a face and voice blips. The **Narrator** sets scenes in quiet italics, silent, no name. **System** is the game talking: squared hairline box, utility type, silent. There is **no mascot** in the simulation ("a student should be able to tell at a glance whether the office is talking or the game is").
- **No repeat.** Once a line has been said in the scene, the activity screen does not repeat it (Joshua, 6 Sept). The question must stand alone.
- **Every screen states its action** in a small grey Action Prompt ("Tap one."), except button-only screens, where the button label is the prompt.
- **Teach, check, test.** A teach card, its example on its own screen, an unscored comprehension check (unlimited tries, cannot skip, never a strike), then scored beats that use what was taught. Nothing is taught that is not used.
- **Beat 1 is the easy win.** One obvious answer, three options, no timer.
- **Instant, honest feedback.** A pick locks immediately (no confirm). The chosen tile colors to its tier, a bad pick shakes, a sound fires, and the right answer is revealed at the moment you miss. The board holds 420 ms after a right answer and 1150 ms after a miss so the revealed answer can be read, then the **feedback card** shows: a derived headline ("Strong move!", "That works.", "Not quite.", "Risky call."; never authored), ONE sentence (the why for the option you chose), two tappable skill chips, the score change, and the speaker's reaction face. Nothing else.
- **Correction model.** Four tiers: Best +5, Acceptable +2, Wrong −5, Risky −6 (points scale so a perfect run always reaches exactly 100 from a start of 50). A timeout is Wrong, never Risky. **Strikes**: Wrong 1, Risky 2; the third strike in a level immediately opens the **Performance Plan** (red takeover, three questions, two of three right keeps the job and resets reputation to 50; fewer ends the year), once per level. An ending below 85 offers **"Fix your N misses"**, which replays only the missed beats, capped at Acceptable ("Replaying twenty screens to fix three answers is what makes a student close the app"). 85+ promotes.
- **Autosave is visible.** The run saves at every advance; every third HUD dot is a checkpoint; a returning student sees "Picked up where you left off" with "Start over".
- **Reputation is the reward.** The HUD gauge counts up over 650 ms, pops and floats the delta, in the career's own world color. The bar under it shows reputation, not progress.
- **Scenes.** A beat's own illustration stays up to 3 beats; otherwise the beat's room; the final review floats on an ambient backdrop. Characters stand in the room while a line is read, then step aside when the controls appear (the face moves to the dialogue box). The backdrop blurs only while the student is answering. No parallax, no idle bob (unsynced motion read as a positioning bug).
- **Sound.** All effects are synthesized. Voice blips every two letters at each character's pitch. Wrong is "low and short, never harsh". The countdown clock is **silent** by instruction. Music and sound effects mute separately, in one tap each ("a game you cannot silence in one tap is a game you do not open at school"). Music muffles (low-pass) during timers and the Performance Plan.
- **Trailer** is optional (only from "Watch trailer"), about 20 seconds, reuses existing art, and always shows Skip.
- **Express mode** is the short demo run: teaching screens are cut, and the cut teaching becomes tappable panels (character names, terms, the score) so nothing is missing.
- **Between levels**, one real Connect interaction (like, comment or ask a professional), always skippable.

### Glossary Game

- Five terms unlocked one tap each; the example is optional behind a real flip ("you shouldn't be mandated to go through both cards").
- Seven questions across five kinds, each followed by a required feedback panel (Dreamy party or puzzle, "Correct!" or "Not quite", the authored explanation).
- Mastery is two credited right answers per term; weak terms get one round of different review questions; nothing blocks completion.
- A streak popup on every fifth right answer in a row; Power Play retries until every blank is right; the success screens get fireworks (never with the starfield) and the "not flat basic confetti, ever" burst.
- Its own immersive backdrop (berry and stars): "when playing a game it should feel like we are entering a new world". The Play hub itself keeps the app backdrop.
- One scale formula sizes everything from a 1440x900 anchor with no page scroll on any screen; CTAs cap at 560px.
- No text animation in the glossary; the typewriter is simulation-only.

---

## 6. Key numbers at a glance

| Thing | Value | Chapter |
|---|---|---|
| Typewriter | 26 ms per character, time-derived (polled every 16 ms), no punctuation pauses; instant under reduced motion | 2 §3.2 |
| Voice blip | every 2 letters/digits; 45 ms triangle tone, peak 0.022, ±3% detune, `VOICE_PITCH` (500 Hz default) | 2 §3.8 |
| Hold before feedback | 420 ms right, 1150 ms miss | 2 §1.6 |
| Scoring | start 50; Best +5, Acceptable +2, Wrong −5, Risky −6; × (10 / scored beats); clamp 0-100; advance at 85 | 1 §3 |
| Sub-item pass | `ceil(0.75 × items)` (3 of 4) (see A1) | 1 §3.2 |
| Strikes | Wrong 1, Risky 2, plan at 3, once per level | 1 §3.4 |
| Sticky hero art | 3 beats | 2 §2.1 |
| Dialogue text | character 23px phone / clamp(27px, 1.875vw, 40px); system 19 / clamp(21, 1.4vw, 28); narrator 21 italic / clamp(23, 1.6vw, 33) | 2 §3.6 |
| Question / options | 18/21px display 800 / 16/17px body 600 | 2 §3.6 |
| Box widths | interactive 720 / clamp(720px, 50vw, 1000px); dialogue 620 / clamp(620px, 43vw, 880px); max height 76dvh | 2 §2.9 |
| Fonts | display Bricolage Grotesque, body Inter, trailer and hub titles the world's poster face | 2 §0 |
| Accent | `WORLD_COLORS[simulation.world]`; status colors: success `--color-feedback-success`, wrong `--world-building-construction`, risky `--destructive` | 2 §4.4 |
| Core easing | `cubic-bezier(0.16, 1, 0.3, 1)` for entrances; `play-pop` uses `cubic-bezier(0.34, 1.56, 0.64, 1)` | 2 §7 |
| Glossary mastery | 2 credits per term; streak popup every 5; 20 XP once per lesson | 4 §2 |

---

## 7. QA checklist for every new career (sign-off gate)

**Content**
- [ ] The intake validation list passes (simulation, and glossary if supplied).
- [ ] Every setup, question and option read aloud once: 13-year-old level, no em dashes, no "fired", no real brands, no unsourced numbers.
- [ ] Exactly one Best per scored beat; options close in length; each `why` explains its own option.

**Play-through (Full and Express, phone 375x812, tablet 768x1024, laptop 1440x900, 1920x1080; Chrome on Windows plus iPhone Safari)**
- [ ] Play the whole level twice: once all right (reaches exactly 100, promotes, promotion music, Connect, Level 2 or "coming soon"), once with three misses (Performance Plan fires on the third strike, pass and fail both work).
- [ ] End below 85: "Fix your N misses" replays only the misses at the Acceptable cap.
- [ ] Refresh mid-level: resumes on the right beat with the notice.
- [ ] Every beat shows a room (review: ambient); the right character stands in it; nobody over the answers; no cropped heads.
- [ ] Every speaker has a face chip, their own voice pitch and the right reaction face on the feedback card.
- [ ] Timers start only after the question appears; the clock is silent; timeouts score Wrong.
- [ ] Keyboard only: the whole level is playable (Space/Enter, number keys).
- [ ] Sound and music mute independently; the trailer plays and skips.
- [ ] The HUD, gauge and bar wear the career's world color, with no stray amber (issue B10).
- [ ] Reduced motion on: no stuck particles or blobs, and text appears at once.
- [ ] Light mode spot check on the feedback card, ending card and HUD.

**Hub and entry points**
- [ ] The hub card appears in all four tiers and the phone deck, with Express and trailer chips if applicable.
- [ ] Career Detail and the Explore reel show Play Game; Top 3 Play lands on the game; the glossary button shows only if a glossary exists.
- [ ] Art QA checklist (ch. 7 §5) passes, including the trademark sweep.

---

## 8. Glossary of terms used in this SOP

- **Beat**: one screen of a level (one entry in `Level.beats`).
- **Scored beat**: a beat of kind choice, match, rapid, chain, slider, flags, rank, pick or bucket; exactly ten per level.
- **Tier**: Best / Acceptable / Wrong / Risky, the result of a scored beat.
- **Setup line**: the line typed out before a question appears; leaves the screen once the question shows.
- **Staged beat**: a non-card beat with a setup line (read first, then reveal).
- **Location / plate**: a people-free room background. **Hero art**: a full illustrated scene for one beat.
- **Sprite / expression**: a transparent character cutout in one expression. **Face chip**: the square face used in the dialogue box.
- **Strike / Performance Plan (PIP)**: the three-mistakes recovery sequence.
- **Repair round**: "Fix your N misses" at a non-promoting ending.
- **Express**: the trimmed demo mode derived from a level's `expressCut`.
- **World**: one of the 15 career worlds; its color is the career's accent everywhere.
