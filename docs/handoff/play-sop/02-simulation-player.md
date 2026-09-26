# Play SOP, chapter 2: Simulation player runtime and UX

> Reference chapter of the Play SOP. Start at [README.md](README.md). This chapter was produced by a line-by-line read of the source at commit `2ff4bd5d` (26 Sept 2026); every `file:line` reference is against that commit, so re-check line numbers if the files have moved. Conventions: `UNCLEAR:` means the code alone does not settle it; `OBSERVED:` / `FINDING:` / `GAP:` / `BUG:` mark something a rebuild would get wrong by trusting comments or field names. All of them are collected, with a recommended decision, in [06-known-issues-and-decisions.md](06-known-issues-and-decisions.md).

Scope: `src/components/play/SimulationPlayer.tsx` (all 2447 lines), `TrailerFlow.tsx`, `PerformancePlanFlow.tsx`,
`ConnectInterstitial.tsx` + `ConnectInterstitial.module.css`, `PlayBurst.tsx`, `sound.ts`, `music.ts`,
`backdropPulse.ts`, `useResolvedColor.ts`, `PlayVersionChip.tsx`. Supporting reads (only as far as the player depends on
them): `types.ts`, `scoring.ts`, `progress.ts`, `expressions.ts`, `locations.ts`, `performance-plan.ts`,
`interactions.tsx` (useTypewriter, OptionButton, CardBody, ChoiceBody), `src/app/play/[game]/page.tsx`,
`PlayHub.tsx` (trailer + Express entry points), `src/app/globals.css` (keyframes), `components/app/worlds.ts`,
`components/marketing/tokens.css`, `lib/dreamScore.ts`, `components/build/sound.ts`, `components/build/ui.tsx` (LocalBurst).

Path shorthand: `SP` = `src/components/play/SimulationPlayer.tsx`, `TF` = `TrailerFlow.tsx`, `PPF` =
`PerformancePlanFlow.tsx`, `CI` = `ConnectInterstitial.tsx`, `CIcss` = `ConnectInterstitial.module.css`,
`IX` = `interactions.tsx`, `G` = `src/app/globals.css`, `ROUTE` = `src/app/play/[game]/page.tsx`. All in
`src/components/play/` unless noted.

Conventions below: "OBSERVED:" = something the code does that a reimplementer might not expect (often a latent bug
or doc/code mismatch). "UNCLEAR:" = cannot be settled from code alone.

Token values used throughout (from `components/marketing/tokens.css`): `--space-1..5` = 4/8/12/16/20px (lines 92-96);
`--radius-sm` 8px, `--radius-md` 12px, `--radius-lg` 16px, `--radius-xl` 20px (lines 107-111);
`--font-display` = "Bricolage Grotesque" (line 151); `--font-body` = Inter via `--font-inter` (line 155);
`--font-poster` = "Viaoda Libre" (line 160). Tailwind `sm:` = min-width 640px (Tailwind default).

---------------------------------------------------------------------------------------------------------------------

## 0. Architecture in one paragraph

One Next route per simulation, `/play/[game]` (`ROUTE`). The server page resolves the simulation and level from
URL params and renders `<SimulationPlayer key={level.id} simulation level />` (ROUTE:53). The player is a single
client component holding the whole run in React state: a `phase` (`"beat" | "feedback" | "ending"`, SP:69), a beat
`index`, a per-beat `scores` map, repair queue, strikes, performance-plan state (`pip`), and a `connectOpen` flag.
Beats are data (`types.ts`); `SimulationPlayer` only knows how a beat is staged and how reputation moves (SP:56-59
comment: "Everything about WHAT happens lives in the level data; this file only knows how a beat is staged and how
reputation moves."). The per-kind interaction bodies live in `interactions.tsx` and report a single
`onResolve(tier, why, id)` upward (IX:31-36). The Trailer is NOT part of the player: it is an overlay opened from
the Play hub (`PlayHub.tsx:327`). The Performance Plan and the Connect interstitial are overlays/sub-flows rendered
by the player.

---------------------------------------------------------------------------------------------------------------------

## 1. Full state machine

### 1.1 Entry (route): `src/app/play/[game]/page.tsx`

- URL: `/play/{game}?level={n}&mode=express`.
- `simulationFor(game)` (games.ts:95-97) matches `simulation.id === game || simulation.careerId === game`. No match ->
  `notFound()` (ROUTE:25) -> Next 404.
- `level`: `Number(query.level)` (first value if array). `picked = simulation.levels.find(n === wanted) ??
  simulation.levels[0]` (ROUTE:26-27). OBSERVED: an invalid/missing/unbuilt level silently falls back to Level 1.
  There is NO locked-level gate anywhere in the route or player: any built level is directly playable by URL.
- `mode=express`: honored only if `(picked.expressSource ?? picked).expressCut` is non-empty (ROUTE:39-40).
  Otherwise the param is silently ignored (full mode). Express level object is
  `{ ...expressBase, id: `${picked.id}-express`, express: true, beats: expressBase.beats.filter(b => !expressCut.includes(b.id)) }`
  (ROUTE:41-43). `expressSource` (types.ts:440-447) lets Express be built from a frozen snapshot of an older level
  object (IB Level 1, 21 Sept 2026: "Full mode moved on, Express mode didn't").
- Route also emits `<link rel="preconnect">` to fonts.googleapis.com / fonts.gstatic.com (ROUTE:46-47) and imports
  `marketing/tokens.css` + `app/app.css`.
- Metadata: title "Career Simulation · Dreamari", description "Play the job. Every decision moves your reputation."
  (ROUTE:8-11).
- `key={level.id}` (ROUTE:48-53): WHY: "without this, navigating Level 2 -> Level 3 reuses the same component
  instance, so its internal phase/run/result state (still "ending", still the OLD level's reputation) survives into
  the new level and renders as that level's own ending screen on a run that was never played."

How players actually reach the route (PlayHub.tsx, context only):
- Featured card whole-card link -> `/play/{sim.id}` (always Level 1, full) (PlayHub.tsx:782).
- "Express mode" chip -> `/play/{sim.id}?mode=express` (PlayHub.tsx:789-797), shown only if Level 1 has `expressCut`.
- "Watch trailer" chip -> opens `TrailerFlow` overlay in the hub (PlayHub.tsx:799-811, 327). Deliberately separate
  from starting the game (PlayHub.tsx:317-319: "opened ONLY from its own chip on the featured card -- deliberately
  separate from starting the game, per direct feedback (the handoff doc auto-plays it once on first open instead)").
- Level 2+ is only reached by the Connect interstitial's continue: `router.push(`/play/${simulation.id}?level=${nextLevel.n}`)`
  (SP:699). OBSERVED: this URL drops `mode=express`, so finishing Level 1 Express continues into Level 2 FULL mode.
- The hub reads saved progress only from the full-mode Level 1 slot (`readRun(progress, sim.id, first.n)`,
  PlayHub.tsx:748/778), so Express progress (slot n+100) never shows on the hub card.

### 1.2 Mount-time side effects in SimulationPlayer

- Adds `play-no-zoom` class to `<html>` for the life of the player (SP:238-241). WHY (SP:226-237): the site-wide
  1440px-baseline `body { zoom: 1.1 / 1.25 }` (G:1223-1230, at >=1441x800 and >=1800x900) shrank the whole stage
  into a corner; a local counter-zoom "does not visually undo it (... a Chromium quirk with compounding zoom under dvh
  units ...). Opting the whole document out of the rule for as long as Play is mounted is the only fix that actually
  works."
- ResizeObserver on the scene host records `sceneHeight` in px (SP:215-225) for character sizing.
- Music: `playMusic(promoted ? "promotion" : "main", simulation.id)` on `[promoted, simulation.id]` (SP:399-402);
  `stopMusic` on unmount (SP:403).

### 1.3 Autosave / resume (derived, not seeded)

- Save slot: `level.express ? level.n + 100 : level.n` (SP:85-88). WHY: "the trimmed beats array indexes differently,
  so resuming a full-mode save mid-Express (or vice versa) would land on the wrong beat."
- `saved = readRun(useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot), simulation.id, saveSlot)` (SP:94).
- `resumable = saved && saved.index > 0 && saved.index < level.beats.length ? saved : null` (SP:95).
- `base = resumable ? { index, scores } : { index: 0, scores: {} }` (SP:96-98).
- `run` state is `null` until the player does something; `live = run ?? base` (SP:100-103). WHY (SP:89-93): "a state
  initialiser runs during hydration, when useSyncExternalStore still reports the server snapshot, so seeding silently
  threw the save away and every resume started at beat one. Deriving means the saved run appears as soon as the store
  hydrates."
- `resumed = run === null && resumable !== null` (SP:139) drives the resume notice (see 1.10).
- Storage (progress.ts): key `"dreamari-play-progress"` (progress.ts:11); value is a JSON object keyed
  `"{gameId}:{level}"` (progress.ts:35-37) -> `RunSave { gameId, level, index (NEXT beat to show), scores
  Record<beatId,tier>, reputation (0-100), scored, at (epoch ms) }` (progress.ts:13-29). Parser validates types and
  clamps (progress.ts:39-71). Snapshot cached against the raw string for referential stability (progress.ts:73-92).
  Cross-tab sync via `storage` event (progress.ts:99-109).
- WRITES happen only:
  - in `advance()` after a normal beat: `saveRun({ gameId, level: saveSlot, index: index + 1, scores: live.scores, reputation, scored })` (SP:347);
  - on Performance Plan pass (SP:634, `reputation: 50`);
  - `clearRun` on level end (SP:341), `restart()` (SP:365), PIP termination (SP:641).
- NOT persisted: `strikes`, `pipUsed`, `reputationBaseline`, `repair` queue, `phase`. OBSERVED consequences:
  (a) refresh mid-level resets strikes to 0 and re-arms the plan; (b) after a PIP pass the save says reputation 50
  but on reload the baseline is back to 50 and reputation is re-derived as 50 + earned (the "set to exactly 50" is
  lost); (c) the repair round never saves (and the run was already cleared at the ending), so a refresh during
  repair starts the level fresh at beat 0; (d) a refresh while the feedback sheet is up loses that beat's score and
  resumes on the same beat (scores are banked to storage only on the NEXT advance).

### 1.4 Phase diagram

```
                ROUTE resolves sim + level (+express)
                               |
                               v
   +--------------------- phase "beat" (BeatStage keyed by beat.id) ----------------------+
   |   sub-state "staged/held" (setup line typing, big character on screen)               |
   |        | tap / Space / Enter / "a"  (finish line first, then reveal)                 |
   |        v                                                                             |
   |   sub-state "revealed" (controls up, backdrop dimmed, focus sound, timer runs)       |
   |        | card/review/check/flips/reveal/focus: onNext -> advance()                   |
   |        | scored kinds: onResolve(tier) -> lock -> hold 420ms (1150ms on miss)        |
   |        v                                                                             |
   |   [strike check] --3rd strike, plan not yet used--> PIP (PerformancePlanFlow)        |
   |        |                                              | passed -> beat index+1       |
   |        v                                              | terminated -> beat 0, reset  |
   |   phase "feedback" (FeedbackSheet over hidden stage)                                 |
   |        | CTA / Enter / Space -> advance()                                            |
   +--------+-----------------------------------------------------------------------------+
            | advance(): repair queue? -> next queued beat / review beat
            | last beat? -> clearRun, phase "ending"
            v
   phase "ending" (EndingCard)
      | advances && next level  -> "Start Level N" -> connectOpen=true -> ConnectInterstitial
      |                             -> onContinue -> router.push(/play/{id}?level={n+1})  (new mount)
      | advances && no next     -> disabled primary + "{upcoming[0]} is coming soon."
      | !advances && misses>0   -> "Fix your N misses" (startRepair) | replay (restart)
      | !advances && no misses  -> replay (restart)
      | always                  -> "Back to Games" (/play)
   HUD always: Home (/play), Back (goBack, index>0), [DEMO FastForward -> connectOpen], Music, Mute, gauge
```

### 1.5 Phase "beat": what renders

- Scene layers (section 2), HUD (section 4), optional Clock (section 4.8), and `BeatStage key={beat.id}` (SP:666-684).
  Keying WHY (SP:664-665): "a new beat is a fresh mount, which is what gives the countdown its starting value without
  an effect resetting state."
- BeatStage props from the player: `hidden={phase === "feedback"}`, `paused={phase !== "beat"}`,
  `ambient={scene.mode === "none"}`, `sceneCharacterVisible={bigCharacterVisible}`, `onRevealChange={setRevealed}`,
  `onTimerActive={setTimerActive}`, `onResolve={resolve}`, `onNext={advance}`, `annotate` (Express only), `cast={level.cast}`,
  `locked`, `accent`.
- Staging rule (SP:1083-1087, 1100-1104): a beat is `stageable` iff it has `setup` and kind is not `card`/`review`.
  Stageable beats start "held" (question hidden) until the player advances past the setup line. WHY: "RPG pacing:
  read the situation first, advance when YOU are ready, and only then does the question and its options appear."
  Cards/review are not staged ("their 'setup' is a label like 'Intern • Week 1', not a paragraph to read").
- The parent mirrors `revealed` (SP:242-261) and resets it synchronously during render when `beat.id` changes
  (React "adjust state during render" pattern). WHY (SP:250-256): the effect round-trip "left the FIRST paint of a
  new beat holding the previous beat's revealed value for one frame, which showed the wrong character (or none) for
  an instant."
- Placement (`centered`, SP:1145-1164): `interactive = revealed && kind not card/review`;
  `centered = interactive || kind === "review" || (kind === "card" && beat.system === true)`. Centered -> box
  vertically centered (`items-center`); otherwise bottom-docked (`items-end`) with `mb-[3dvh] sm:mb-[4dvh]`
  (SP:1196). WHY (SP:1160-1163): "System teach/intro cards read as the game addressing the player ... big intros
  like these sit CENTER SCREEN (direct feedback). Character cards and narrator story captions keep the bottom-docked
  dialogue placement." Review: "the liminal wait on the colorful ambient backdrop ... reads better centered."
- Boss layout: `kind === "choice" && layout === "boss"` renders `DialogueBox gold held={!revealed}` wrapping
  `BossOverlay` (SP:1199-1202). Everything else renders `DialogueBox` wrapping `BeatBody` (SP:1204-1224).
- Action Prompt (SP:1281-1293): every non-card/non-review beat shows `beat.prompt ?? DEFAULT_PROMPT(beat)` above its
  body, `12px bold tracking 0.04em`, `var(--muted-foreground)`. Defaults (SP:1236-1262), verbatim:
  - choice blank/tiles: "Drag or tap the right word into the space."
  - choice document: "Tap the line with the mistake."
  - choice boss: "Choose one."
  - choice timed: "Tap one before the timer runs out." / untimed: "Tap one."
  - match: "Tap a quote, then tap its match."
  - rapid timed: "Quick questions, one timer. Tap fast." / untimed: "Quick questions. Tap fast."
  - slider: "Slide to your answer, then confirm."
  - flags: "Tap every problem you can find, then submit."
  - rank: "Move the rows into order, then submit."
  - pick: `Pick ${beat.pick}, then submit.`
  - bucket: "Sort each one into a bucket."
  - chain: "Build the answer one step at a time."
  - (check/flips/reveal/focus: undefined unless authored.)
- Body dispatch (SP:1294-1310): card->CardBody, check->CheckBody, reveal->RevealBody, flips->FlipsBody,
  focus->FocusBody, choice->ChoiceBody, match->MatchBody, rapid->RapidBody(remaining), chain->ChainBody,
  slider->SliderBody, flags->FlagsBody(remaining), rank->RankBody, pick->PickBody(remaining), bucket->BucketBody,
  else (review) -> ReviewBody.
- Scored kinds (feed reputation): `SCORED_KINDS = {choice, match, rapid, chain, slider, flags, rank, pick, bucket}`
  (SP:73-77). Non-scored: card, check ("NOT SCORED, NOT A STRIKE"), flips, reveal, review, focus.

### 1.6 Resolve -> hold -> feedback (`resolve`, SP:263-308)

1. Ignored if `locked` already set (SP:265). Sets `locked = id ?? "resolved"` (SP:266) (the body uses this to paint
   the picked option and disable the rest).
2. Hold before the sheet: `hold = tier wrong|risky ? 1150 : 420` ms (SP:267-270). WHY: "long enough to see what you
   picked land, and longer on a miss so the revealed right answer is readable before the explanation covers it."
3. Repair cap: `banked = repair && (tier best|acceptable) ? "acceptable" : tier` (SP:271-273). WHY: "A repair can
   rescue a beat but never earn full marks for it."
4. `beatId`, `triggerLine = beat.planLineIfFailed`, `strikeDelta = pipUsed ? 0 : TIER_STRIKES[banked] ?? 0`
   (SP:279-283). `beat.id` is in deps on purpose (SP:274-278: a stale closure "filed every score under whichever
   beat was on screen when the callback was first created").
5. After `hold` ms (setTimeout, SP:284-304):
   - bank score: `scores[beatId] = banked` (SP:285-288);
   - if `strikeDelta > 0`: `nextStrikes = strikes + strikeDelta`; if `>= STRIKE_TRIGGER (3)`: `setPipUsed(true)`,
     `setLocked(null)`, `setPip({ triggerLine: triggerLine ?? "", resumeIndex: index + 1, stepOrders: randomStepOrders() })`
     and RETURN without feedback (SP:289-300). WHY: "'No feedback. Fires the moment the third strike lands' -- the
     plan preempts this beat's own feedback card entirely rather than following it."
   - else `setResult({ tier: banked, why, delta: scoredValue(banked) })`, `setPhase("feedback")` (SP:302-303).
- Strike table (scoring.ts:18-22): wrong +1, risky +2, best/acceptable 0; trigger 3; strikes never decrease within
  a level. OBSERVED: strikes also accrue during a repair round (repair doesn't zero `strikeDelta`).
- Timer timeout (BeatStage, SP:1117-1136): for `kind === "choice"` only, on 0 it resolves with the first `wrong`
  choice (or first choice) and why = "Time ran out. In a real week, silence is its own answer." Rapid/flags/pick
  handle their own timeout from the `remaining` prop (IX:1437, 1719, 1959). Timeout scores Wrong, never Risky
  (SP:1033-1036: "a slow reader is not the same as someone who invented numbers").

### 1.7 Phase "feedback"

- `BeatStage` stays mounted but `hidden` (opacity 0, 300ms, `aria-hidden`) (SP:1168-1172) and `paused` (timer stops,
  remaining is remembered in `remainingRef`, SP:1112-1114).
- `FeedbackSheet` overlays (SP:687-689); detail in section 5.
- HUD shows the floating delta: `delta={phase === "feedback" ? result?.delta ?? null : null}` (SP:616).
- Exit: CTA button / Enter / Space -> `advance()`.

### 1.8 `advance()` (SP:312-349)

- Clears `locked`, `result`.
- Repair branch (SP:315-333): pop the head of the queue; `setRepair(rest.length > 0 ? rest : null)`; phase "beat";
  jump to next queued beat, or to the review beat when the queue is exhausted (fallback last beat). Nothing saved.
  WHY for `null` not `[]` (SP:320-327): `[]` is truthy, so the review beat's "See the decision" button re-entered this
  branch and re-landed on the review -- "That's the exact 'nothing happens when I click' report".
- End of level (SP:334-344): `patchRun({})` FIRST (take ownership of scores), then `clearRun`, then phase "ending".
  WHY: "clearing storage while the run is still being read from it would drop every score on the floor ... A player
  who closed the app on the final review screen came back and got the worst ending whatever they had earned."
- Normal: phase "beat", `index + 1`, `saveRun(...)`.

### 1.9 `goBack()` (SP:351-357): HUD Back button

- Only offered when `index > 0` (SP:619). Clears lock/result, phase "beat", `index - 1`. Does not touch scores or
  storage. OBSERVED: it works from the feedback and ending phases too (HUD is always rendered); re-answering a beat
  simply overwrites its score, so Back lets a player re-answer for full marks (the repair "acceptable" cap only
  applies inside a repair round).

### 1.10 Notices over the beat phase

- Repair banner (SP:703-713): when `repair && repair.length > 0 && phase === "beat"`. Absolute `top-[74px]`, z-30,
  centered pill: `Wrench` 14px + "Fixing {n} answer(s)"; 12.5px bold, radius-sm, border `var(--primary)`, bg 82%
  background, backdrop-blur 10px.
- Resume notice (SP:715-728): when `resumed && phase === "beat"`; same placement; border
  `--color-glass-border-raised`; copy "Picked up where you left off" + underlined "Start over" button (calls
  `restart`). Animated `play-notice 11s ease-out both` (G:956-970): fade/rise in by 4%, hold to 88%, fade out and
  `visibility: hidden` at 100% ("Done in CSS so no timer or state has to exist for it", G comment). Disappears
  immediately once the player acts (`run` becomes non-null). Comment SP:715: "Says so, rather than silently dropping
  them mid-level."

### 1.11 Phase "ending" (EndingCard, SP:2324-2447)

- Ending chosen by `endingFor(level.endings, reputation)`: sort by `min` desc, first with `reputation >= min`, else the
  lowest (scoring.ts:54-57). `band = bandFor(reputation)` (BANDS scoring.ts:27-32: Trusted 85-100, Respected 60-84,
  Cautious 40-59, At Risk 0-39).
- Container: `relative z-10 flex min-h-0 flex-1 items-end justify-center px-3 pb-3 sm:px-5 sm:pb-5` (SP:650).
- Card: `mb-[6dvh] max-w-[560px]`, centered text, radius-lg, `border-2` in `BAND_COLOR[band]`, bg 92% background,
  backdrop-blur 22px, `px-20 py-24`, gap space-3, entrance `play-sheet-up 0.5s cubic-bezier(0.16,1,0.3,1) both`
  (SP:2353-2356).
- Icon tile 58px radius-lg bg `BAND_COLOR[band]` fg `#05070f`, icon 28px: `Trophy` if `ending.advances`, else
  `Briefcase` if reputation >= 60, else `FileText` (SP:2348, 2357-2359).
- `"{reputation} · {band}"` 15px extrabold tabular, band color (SP:2360-2362). OBSERVED: shown even on `hideBand`
  levels (EndingCard ignores `hideBand`).
- `ending.headline` h2 26px / sm 30px, leading 1.1, extrabold, display font; `ending.message` 15.5px relaxed
  foreground; `ending.subline` 14px semibold muted (SP:2363-2371).
- `playSweep()` on mount when `ending.advances` (SP:2349-2351). Music switches to "promotion" (SP:399-402).
- Buttons (SP:2372-2441):
  - advances && next: primary "Start Level {next.n} · {next.role}" + ChevronRight -> `onAdvance` = `setConnectOpen(true)` (SP:658).
    Comment (SP:81-83): "Opens on 'Start Level N' instead of navigating straight there -- one real Connect
    interaction (Like/Comment/Ask a professional, always skippable) between levels, direct instruction 17 Sept 2026."
  - advances && no next: non-interactive span `aria-disabled`, opacity .55, `ending.primary`, 16px extrabold,
    radius-sm; plus "{simulation.upcoming[0]} is coming soon." 12.5px muted (SP:2383-2390, 2428-2432).
  - !advances && misses > 0: primary `Wrench` "Fix your {n} miss(es)" -> `startRepair`; helper 12px muted
    "Replays only what you got wrong. A fix is worth +2, not the full +5."; secondary outline `RotateCcw`
    `ending.primary` -> `restart` (SP:2391-2416). WHY (SP:2393-2394): "Replaying twenty screens to fix three answers
    is what makes a student close the app. Fixing the three is what makes them stay." OBSERVED: the "+2 / +5" copy is
    literal; with Express score scaling (section 5.3) the real values differ.
  - else: primary `RotateCcw` `ending.primary` -> `restart`.
  - always: outline Link `X` "Back to Games" -> `/play`.
  - footer 11.5px muted: "{ADVANCE_AT} and above advances." (ADVANCE_AT = 85, scoring.ts:10).
- Button styles: primary `dm-solid` radius-md `px-18 py-13` 15px semibold bg `--primary` fg `--primary-foreground`;
  secondary `dm-quiet` border `--color-glass-border-raised` `py-12`.
- `misses` = beat ids whose banked tier is `wrong` or `risky` (SP:134-136).

### 1.12 `restart()` (SP:359-375) and `startRepair()` (SP:377-388)

- restart: `clearRun`, run `{0, {}}`, repair null, lock/result null, phase "beat", strikes 0, pipUsed false,
  baseline 50, connectOpen false. WHY (SP:360-364): "'Reputation resets to 50 and the level restarts from screen 1' --
  the rules tab. ... otherwise a player who restarts after passing a plan on beat 3 would find themselves unable to
  ever trigger it again this run."
- startRepair: queue = missed beat ids in level order; phase "beat"; jump to first. Music reverts to Main because
  `promoted` goes false (SP:394-398 comment).

### 1.13 Connect interstitial (overlay, any phase)

- Rendered outside the phase branches when `connectOpen && nextLevel` (SP:691-701) "so the demo shortcut (Hud's
  FastForward button) can force it open from any beat". Props: `stageRole={level.role}`,
  `nextLevelLabel={`Level ${nextLevel.n} · ${nextLevel.role}`}`, `onContinue -> router.push(`/play/${id}?level=${n}`)`.
- OBSERVED: every exit from the interstitial (Close X, backdrop click, Escape, Continue) calls `onContinue`, i.e.
  navigates to the next level. There is no "cancel back to the ending card". If opened by the demo shortcut
  mid-beat, the beat underneath is NOT paused (phase stays "beat"), so a timed beat's clock keeps running behind it.
- Full detail in section 9.3.

### 1.14 Exit paths

- HUD Home icon -> `/play` (always) (SP:2026-2038). Ending "Back to Games" -> `/play`. PIP terminated "Back to Games"
  (plan copy) -> `/play`. Act checkpoint card `secondaryCta` -> `secondaryHref ?? "/play"` (IX:253-259).
- Unmount stops music (SP:403) and removes `play-no-zoom` (SP:240).
- Progress on exit = whatever the last `advance()` saved.

---------------------------------------------------------------------------------------------------------------------

## 2. Scene rendering

### 2.1 Scene selection: `sceneFor(level, index, beat)` (SP:1002-1031)

- `SCENE_FRESH_BEATS = 3` (SP:985). Walk back from the current index to the nearest beat with `art`:
  - found at distance `index - i <= 3` -> `{ mode: "hero", src: art, alt: artAlt ?? "" }`;
  - found but stale -> stop looking (fall through to location);
  - a beat with `resetScene: true` (and no art) also stops the walk (SP:1013-1016; types.ts:65-71: e.g. "an offer
    letter's own art bleeding into the onboarding steps that come after it").
- Then `locationFor(beat.id)` (locations.ts:415-418, `BEAT_LOCATION[beatId]` -> `LOCATION_ART[id]`) ->
  `{ mode: "location", src, alt, focal, mobileFocal, characterAnchor?, characterAnchors? }`.
- Else `{ mode: "none", src: level.cover, alt: "" }` -> AmbientBackdrop. (`src` there is only used for scene-change
  detection.)
- WHY for 3 (SP:978-984): "covers a card explaining itself over 2-3 follow-up questions ... without covering the long
  unillustrated tails every level ends on ... which is exactly where a still image stops adding anything and an
  ambient backdrop takes over instead."
- locations.ts:203-213: EVERY beat should have a `BEAT_LOCATION` entry; "The one deliberate exception is the terminal
  review beat of each level ... the final-review wait reads better as the abstract, liminal AmbientBackdrop."
- Scene host: `div ref={sceneHost} aria-hidden={mode === "none" || !alt} className="pointer-events-none absolute inset-0 overflow-hidden"` (SP:481-485).

### 2.2 Why full-bleed on every breakpoint (SP:461-473)

"This USED to be an in-flow panel on phones sized by whatever vertical space the box below it left over -- so the same
character rendered at a different effective zoom on every beat ... Pinning it full-screen always (matching desktop)
makes its size, and therefore every character anchor computed against it, constant across beats; the box now overlaps
it instead of shrinking it."

### 2.3 Hero mode (SP:488-498, SceneLayers SP:797-814)

- Wrapper `absolute inset-0 transition-[filter] duration-500`, `filter: dimmed ? "blur(7px) brightness(0.7) saturate(0.45)" : undefined`.
- `SceneLayers`: one `next/image` `fill priority sizes="100vw"`, `object-cover object-center`,
  `motion-safe:animate-[play-scene-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both]`, `key={src}` so a new plate replays the
  entrance. `play-scene-in` (G:884-893): opacity 0 -> 1, scale 1.06 -> 1.
- Static on purpose (SP:489-492): "the slow zoom this used to carry pushed a composed illustration past its own edges
  over the course of a beat ... A held frame never crops itself." And (SP:798-802): mobile used to stack two blurred
  copies behind a centered one; "the blurred edges read as a visible defect rather than a clever fix. Plain cover."
- NOTE: the doc comment at SP:733-747 (three masked layers on phones) is STALE; the code is one sharp cover layer.
- No character sprites are drawn over hero plates (characters only render in `location` mode).

### 2.4 Location mode (SP:499-553, LocationBackdrop SP:834-880)

- Two images of the same src:
  - phone (`sm:hidden`): `object-cover`, `objectPosition: mobileFocal.x*100% mobileFocal.y*100%`, filter transition
    500ms, NO entrance animation.
  - desktop (`hidden sm:block`): `objectPosition: focal`, `transform: translate3d(offset.x*-6px, offset.y*-4px, 0) scale(1.03)`,
    `motion-safe:animate-[play-scene-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both]`.
    OBSERVED: per CSS cascade, the animation's `both` fill holds `transform: scale(1)` after it ends, overriding the
    inline `scale(1.03)`; the 1.03 only applies under reduced motion.
- `dimmed` filter identical to hero: `blur(7px) brightness(0.7) saturate(0.45)`.
- Pointer parallax is disabled: `useScenePointer()` returns `ZERO_OFFSET {0,0}` (SP:816-825). WHY: "static was the
  right call: it read as things moving on their own for no reason on desktop, and had nothing to respond to on the
  touch devices most players are actually on." And (SP:474-480): "The two-plane parallax is gone: the background plate
  still contains the characters that were lifted out of it, so any relative motion dragged a ghost of them out from
  behind the cutout ... If character-free plates ever arrive from the artist, real parallax is a small change."

### 2.5 "Dimmed" = the focus moment (SP:418-423)

`dimmed = revealed && beat.kind !== "card" && beat.kind !== "review"`. WHY: "Blur ONLY a standalone interactive
question-answer screen -- the moment the controls the player is actually working with are on screen, never the
dialogue leading up to them ... Applies to a hero plate exactly the same as a location."
On the false->true edge: `playFocusMoment()` (SP:447-454).

### 2.6 Characters: `SceneCharacter` (SP:882-975)

Render condition (SP:517-552, mirrored by `bigCharacterVisible` SP:432-437):
`scene.mode === "location" && (kind === "card" || kind === "review" || !revealed)` AND an anchor exists AND an
expression image exists. I.e. on interactive beats the character carries the setup line, then steps aside when the
controls appear (SP:509-516: "handing the speaker off to the dialogue box's small portrait so nothing stands over the
answers"). Cards/reviews show the character for the whole beat.

One vs two cast members:
- Two+: if `scene.characterAnchors && beat.castMembers` -> `castMembers.map((name, i) => slot = characterAnchors[i])`
  (SP:518-536). z-index: `name === "Christina" ? 2 : 1` (SP:524-533: "Christina reads as the host greeting Jordan into
  the room, so she stands in front of him"). Only `l1-reception` has anchors today:
  `[{x:0.38, baselineY:0.99, heightFrac:0.88, centered:false}, {x:0.64, baselineY:0.99, heightFrac:0.9, centered:false}]`
  (locations.ts:130-132). No tier/neutralTier passed for multi-cast. The same location also has a single
  `characterAnchor {x:0.5, baselineY:0.99, heightFrac:0.88}` for beats where only one of them is present
  (locations.ts:134-136).
- One: `speaker = beat.castMember ?? beat.speaker`, `anchor = scene.characterAnchor`,
  `tier = phase === "feedback" ? result?.tier : undefined`, `neutralTier` (SP:538-551). `castMember` exists because a
  character card "is narrated by Dreamy but ABOUT the person it introduces" (types.ts:79-82).
  OBSERVED: on scored beats the character is not rendered after reveal, so during feedback (revealed=true) it is
  never on screen; the `tier` face swap on the scene sprite is effectively unreachable. The feedback sheet's own 72px
  portrait is the reliable reaction (SP:2249-2253 says so).

Image choice (SP:924): `expressionFor(speaker, tier) || expressionFor(speaker, neutralTier) || defaultExpressionFor(speaker)`.
- `neutralTier = "wrong"` when `beat.tone === "conflict" | "alarm"` (SP:424-428) -> concerned/uncertain faces.
- Expression sets (expressions.ts:22-60): Christina (proud/welcoming/concerned), Jordan (confident/focused/uncertain),
  Rosa, Denise, Tyler. Default-only (single face): Marcus (assessing), Lamisa (composed), Yvonne (composed),
  "Cobalt HR" (welcoming) (expressions.ts:70-87). No expression -> `SceneCharacter` returns null (SP:931).
- `playCharacterEnter()` fires on every `src` change (SP:925-930).

Geometry (SP:932-953), all in PIXELS from `sceneHeight`:
- `x = anchor.centered === false ? anchor.x : 0.5`: every single-character anchor is CENTERED (anchor.x ignored)
  unless `centered: false` (SP:932-937: "Centered and filling the room is the norm ... The two boardrooms are the one
  exception" -- OBSERVED: the boardroom anchors in locations.ts:90/113 no longer set `centered:false`, only reception
  does).
- `left: x*100%`, `bottom: (1 - baselineY) * sceneHeight px`, `height: heightFrac * sceneHeight px`, `zIndex`,
  `transform: translate3d(calc(-50% + offset.x*14px), offset.y*-8px, 0)` (offset is always 0).
- IB anchors: `baselineY 0.99, heightFrac 0.85-0.9` (sprite bottom 1% above frame bottom, 85-90% of frame tall).
  RN anchors: `baselineY 1.78, heightFrac 1.75` (locations.ts:162-199) -> bottom at -0.78H, top at 0.03H: the RN
  1024x2048 sprite canvas is pushed below the frame so roughly its top 55% shows (chest-up).
- Why pixels (SP:209-214, 908-913): "a percentage taller than 100% on an absolutely positioned element nested a couple
  of layers deep resolved inconsistently between what the browser reported for layout (correct) and what it actually
  painted ... pixels sidestep it entirely." Renders nothing until `sceneHeight > 0`.
- `<Image key={src} width={round((PORTRAIT_RATIO[src] ?? 0.55) * 900)} height={900} className="h-full w-auto max-w-none object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] motion-safe:animate-[play-character-enter_0.42s_cubic-bezier(0.16,1,0.3,1)_both]">`
  (SP:958-972). `max-w-none` WHY (SP:964-970): Tailwind preflight `img { max-width: 100% }` "silently clamped the
  sprite to a fraction of its real size (confirmed live: removing it took a 188px-wide render to its correct 639px)".
  `PORTRAIT_RATIO` (expressions.ts:94-125) must be the file's real w/h, else `object-contain` letterboxes and the
  character reads smaller/higher (Christina welcoming 0.7283 is an arm-out outlier; RN all 0.5).
- `play-character-enter` (G:928-937): opacity 0, translateY(22px) scale(0.96) -> opacity 1, none.
- No idle bob (SP:941-944): "two characters sharing a scene, animating on independent unsynced loops, drift in and out
  of alignment with each other and read as a positioning bug."
- Floating, not planted (SP:882-890): "chest-up, the same floating convention Dreamy already uses rather than an
  attempt to plant their feet on the floor ... This is why boardroom locations have no `characterAnchor` at all"
  (OBSERVED: stale; boardrooms now do have anchors).

### 2.7 Ambient backdrop (mode "none", SP:748-795)

- Base `var(--background)`. Three blurred blobs:
  - A: `-top-15% -left-10%`, 65%x65%, opacity .6, `blur(70px)`, color `AMBIENT_MOOD_WASH[mood][0]`, `play-ambient-drift-a 18s ease-in-out infinite`;
  - B: `top-10% -right-15%`, 55%x55%, opacity .5, `blur(80px)`, wash[1], drift-b 22s;
  - C: `-bottom-20% left-20%`, 60%x60%, opacity .4, `blur(90px)`, world `accent`, drift-c 26s.
- Wash: day `#3452e6/#7c5cff`, night `#1c3f9e/#4b3ba8`, crunch `#a8123a/#7a1650` (SP:760-764).
- 7 deterministic 3px white sparks at fixed coords (SP:750-758: `{12,20,0}, {82,14,1.1}, {66,64,2.3}, {24,72,0.6},
  {90,46,1.7}, {44,32,2.9}, {58,84,1.4}` = x%, y%, delay s), `play-ambient-twinkle 3.6s ease-in-out infinite`.
  Deterministic WHY (SP:748-749): "fixed coordinates, not Math.random(), so the server and client render the same
  markup and hydration never mismatches."
- Keyframes (G:939-955): drift-a 50% translate(6%,8%) scale 1.08; drift-b 50% translate(-8%,6%) scale 1.1; drift-c 50%
  translate(5%,-10%) scale 1.05; twinkle opacity .15 <-> .85.

### 2.8 Scrims, vignette, mood (layer order = DOM order)

1. Scene host (absolute inset-0).
2. Center vignette (SP:557-568): `opacity: dimmed ? 1 : 0`, `transition-opacity duration-500`,
   `radial-gradient(ellipse at center, transparent 40%, color-mix(in srgb, var(--background) 60%, transparent) 100%)`.
3. Desktop scrim `hidden sm:block` (SP:570-580): `linear-gradient(180deg, bg 62% 0%, transparent 16%, transparent 58%, bg 72% 88%, var(--background) 100%)`.
   WHY: "Light touch on purpose. The art is the point ... the scrim only has to keep the HUD readable at the top and
   soften the box's edge at the bottom."
4. Phone scrim `sm:hidden` (SP:581-590): `linear-gradient(180deg, bg 68% 0%, transparent 15%, transparent 66%, var(--background) 100%)`.
5. Mood tint (only if `mood !== "day"`, `transition-colors duration-700`, SP:592-608):
   - crunch: `#4a0d1c 60% @0%, transparent 22%, transparent 58%, #3a0a16 46% @84%, #2a0710 74% @100%`;
   - night: `#071033 56% @0%, transparent 22%, transparent 58%, #061029 44% @84%, #04081f 72% @100%`.
   WHY: "Mood rides the EDGES, never the whole frame. A full-bleed wash ... also drains the art."
   `mood = beat.mood ?? level.mood` (SP:415-417).
6. HUD `header relative z-20` (SP:2017).
7. Content: BeatStage / EndingCard / PIP container `relative z-10` (Clock `relative z-20`).
8. FeedbackSheet `absolute inset-0 z-30`; repair banner / resume notice `absolute z-30`.
9. Spotlight flight `fixed z-[70]`; Express lexicon panel / TappableScore panel `fixed z-[90]`.
10. Connect overlay (portal to body) `z-index: 85` (CIcss:5). Trailer (hub portal) `z-[80]`.

Root: `marketing-v2 themeable relative flex h-dvh w-full flex-col overflow-hidden`, bg `var(--background)`, color
`var(--foreground)`, font `var(--font-body)` (SP:457-460).

### 2.9 Responsive rules summary

- Breakpoint is Tailwind `sm` (640px). Phones: separate scrim, mobile focal point, no location entrance anim, HUD band
  word hidden, box `px-3 pb-3`, dialogue sizes fixed px. Desktop: clamp() sizes that equal the old flat value at
  1440px and grow linearly (SP:1178-1184: "a 13" laptop and a 5K external monitor got the identical box ... picked so
  it equals the old flat value exactly at 1440px ... capped well short of comic-book-sized").
- Box max widths: interactive `720px` / sm `clamp(720px,50vw,1000px)`; otherwise `620px` / sm `clamp(620px,43vw,880px)` (SP:1185).
- Safe areas: NO `env(safe-area-inset-*)` anywhere in these files. UNCLEAR whether the app shell provides it; the
  player uses `h-dvh` and fixed paddings only.

---------------------------------------------------------------------------------------------------------------------

## 3. Dialogue system

### 3.1 Voices (SP:1088-1099, 1565-1575)

- `voiceless = speaker in {"Dreamy","Narrator","System"}` -> `speaker = undefined`.
- `voice = speaker === "System" ? "system" : speaker ? "character" : "narrator"`.
- WHY (SP:1088-1091, D62): "No mascot in the simulation ... the Narrator sets scenes and the System carries the rules,
  and NEITHER shows an avatar or a name -- a student should be able to tell at a glance whether the office is talking
  (a named character with a face) or the game is." SP:1556-1561: "the simulation asks a student to believe they have a
  job for thirty minutes, and a mascot is the one thing that cannot survive in that room."
- Three voices = three shapes/faces/sounds (SP:1565-1574):
  - character: chat-notched bubble, display face, name + portrait, voice blips;
  - narrator: quiet italics, body face, no name, silent;
  - system: squared, hairline edge, utility type, silent.

### 3.2 Typewriter: `useTypewriter(text, speed = 26)` (IX:82-101)

- One character per 26 ms (~38.5 chars/s). Count is DERIVED FROM ELAPSED TIME: `Math.floor((Date.now() - started) / 26)`,
  polled by a 16 ms `setInterval` (IX:88-92). WHY (IX:78-81): "counting ticks drifted against React's commits and
  stalled halfway through a long line."
- No punctuation pauses, no per-character variation.
- `prefers-reduced-motion: reduce` -> whole line at once (IX:86, 89).
- Returns `{ visible: text.slice(0, shown), done: shown >= text.length, skip: () => setShown(text.length) }`.
- Empty string -> `done` immediately (this is how revealed beats show their body at once: setup is passed as
  `undefined` -> line `""`).
- Restarts only on `text`/`speed` change; DialogueBox remounts per beat (BeatStage keyed), so no reset logic.
- Cursor while typing (SP:1847): inline block `8px x 18px`, `ml-2px translate-y-2px`, bg `accent`, Tailwind
  `animate-pulse` (not motion-safe gated, so it pulses under reduced motion too).

### 3.3 Tap / key to complete, then advance: `step()` (SP:1696-1707)

- If `!done`: `skip()` (whole line appears) and stop. Next tap: if `held && onAdvance`: `playSelect()` +
  `onAdvance()` (reveal the question).
- The WHOLE box is the tap target (`onClick={step}` on the box div, SP:1787). Clicks inside revealed children bubble
  to it but do nothing (`done && !held`).
- Keyboard (SP:1709-1752), window keydown: keys `" "`, `"Enter"`, `"ChevronRight"`, and `"a"`/`"A"`.
  OBSERVED BUG: `"ChevronRight"` is not a KeyboardEvent.key value; the comment says "space / enter / right", but
  ArrowRight does nothing. (Same in FeedbackSheet, SP:2233.)
  Guards, in order:
  1. `document.body.style.overflow === "hidden"` -> ignore. WHY (SP:1712-1722, 17 Sept 2026: "the spacebar is
     connected to the game behind the modal ... when the modal is active all input should be locked to the modal").
     "Every modal in this app already sets this exact flag while open, to lock background scroll, so it doubles as a
     reliable 'something modal is up' signal."
  2. active element is a `<button>`, `<input>`, `<textarea>`, or contentEditable -> ignore.
  3. `preventDefault()`; `!done` -> skip; `held && onAdvance` -> select sound + reveal; `!held && onPrimary` -> select
     sound + `onPrimary()` (cards/review only: presses the card's one button). WHY (SP:1740-1743): "Without this, two
     thirds of the level could not be played from the keyboard at all. Deliberately NOT wired to the box's click, which
     would double-fire with the button underneath it."
  OBSERVED: the Express lexicon panel and TappableScore panel do not set body overflow, so these keys still drive the
  game behind them.
- "Continue" affordance while held and done (SP:1852-1863): button `self-start`, 13px extrabold tracking .06em
  uppercase, color `accent`, text "Continue" + `ChevronRight 16px` animated `play-nudge 1.1s ease-in-out infinite`
  (G:985-996: translateX 0 -> 4px, opacity .7 -> 1), sr-only "or press enter". Entrance `fade-slide-up 0.3s ease-out
  both` (G:493-496: opacity 0, translateY 6px -> 0).
- Digit keys 1..N pick options on choice beats (`useDigitKeys`, IX:106-119, IX:903), ignored with meta/ctrl/alt.

### 3.4 The no-repeat rule (spoken line leaves when the interaction is revealed)

- `setup={stageable && revealed ? undefined : beat.setup}` (SP:1200, 1211). `staticSetup={!stageable}` (SP:1216).
- Setup renders only when `line && (staticSetup || held)` (SP:1800).
- WHY (SP:1207-1210): "The general rule (Joshua Pierce, Slack, 6 Sept 2026): once a character has said the line in the
  scene, the activity screen does not repeat it. Cards keep their eyebrow; a staged beat drops its spoken line the
  moment the interaction is revealed." And DialogueBox prop doc (SP:1657-1664), direct feedback 9 Sept 2026: "if a
  character just said something in the cinematic scene, we should not repeat the same dialogue on the following
  activity card".
- The divider rule between setup and body only renders when `line && staticSetup` (SP:1866-1869): "a rule with nothing
  above it just reads as a stray line at the top of the box." Rule: `-mx-[16px] sm:-mx-[20px] border-t` in
  `--color-glass-border-raised`.
- Children (the body) appear only when `done && !held`, entrance `fade-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both`
  (SP:1864-1872). For cards this means the body waits for the setup label to finish typing.

### 3.5 Box styling (SP:1753-1793)

- Edge color priority: `gold` -> `var(--world-business-money-office)`; `tone === "alarm"` -> `var(--destructive)`;
  `tone === "conflict"` -> `var(--world-building-construction)`; `voice === "system"` ->
  `color-mix(in srgb, var(--accent-subtle) 40%, var(--color-glass-border-raised))`; else
  `var(--color-glass-border-raised)`.
  `gold` = boss layout, or `kind === "card" && beat.celebrate` (SP:1214).
- Shape: system `rounded-[var(--radius-sm)] border` (1px); character `rounded-[var(--radius-lg)] rounded-tl-[6px] border-2`
  (the chat notch top-left); narrator `rounded-[var(--radius-lg)] border-2` (SP:1762-1771).
- Background: system `color-mix(bg 93%, transparent)`, others `color-mix(bg 86%, transparent)`; `backdrop-blur-[22px]`.
- Layout: `dm-scroll flex max-h-[76dvh] flex-col gap-[var(--space-3)] overflow-y-auto px-[16px] pt-[20px] pb-[16px]`,
  `sm:px-[clamp(20px,1.4vw,32px)] sm:pt-[clamp(22px,1.53vw,34px)]` (bottom padding stays 16px on desktop).

### 3.6 Fonts and sizes (exact)

| Element | Mobile | sm+ | Weight / style | Family | Color | Ref |
|---|---|---|---|---|---|---|
| Character line | 23px / lh 1.28 | clamp(27px,1.875vw,40px) | 800 | --font-display | --foreground | SP:1832 |
| System line | 19px / lh 1.4 | clamp(21px,1.4vw,28px) | 700 | --font-body | --foreground | SP:1834 |
| Narrator line | 21px / lh 1.35 | clamp(23px,1.6vw,33px) | 600 italic | --font-body | foreground 90% | SP:1835-1838 |
| Name above line (with portrait) | 12px, tracking .1em, uppercase, mb 3px | same | 800 | --font-display | accent | SP:1818-1822 |
| Floating name pill | 12px, tracking .08em, uppercase, px12 py4, radius-sm, abs -top-13 left-14 z-10 | same | 800 | --font-display | #05070f on accent | SP:1778-1785 |
| Action prompt | 12px, tracking .04em | same | 700 | body | --muted-foreground | SP:1290 |
| Question heading (IX) | 18px / lh 1.25 | 21px | 800 | --font-display | --foreground | IX:166-172 |
| Options (IX OptionButton) | 16px (compact 14px) | 17px | 600 | body | --foreground | IX:132 |
| Review title | 19px / lh 1.2 | 22px | 800 | --font-display | inherit | SP:1329 |
| Review body | 16px relaxed | same | 400 | body | muted | SP:1332 |
| Feedback headline | 21px | same | 800 | --font-display | tier color | SP:2266 |
| Feedback why | 15.5px relaxed | same | 600 | body | --foreground | SP:2274 |
| HUD title | 13px, uppercase, truncate | same | 800 | --font-display | foreground | SP:2054 |
| HUD level line | 11.5px, tracking .1em, uppercase | same | 700 | body | accent | SP:2057 |
| Gauge number | 13.5px tabular | same | 800 | --font-display | accent | SP:1517 |

Hierarchy WHY (SP:1823-1828): "what the speaker actually says is the biggest text on screen, ahead of the question and
its answers -- and each VOICE wears its own face". IX:164-165: "Subheading tier: what the speaker says ... is the
title, sized above this; the answers below are body text, sized under it."

### 3.7 Speaker name tags and face chips

- Portrait (face chip) = `level.cast?.[speaker]` (face crops from the level's own scene art, types.ts:418-421), only
  when `speaker && !sceneCharacterVisible` (SP:1094). WHY (SP:676-678): "The big cinematic character already carries
  the speaker -- the dialogue box's small round portrait would just be a second, redundant face."
- Chip (SP:1802-1816): `mt-2px flex-none overflow-hidden rounded-[var(--radius-lg)] border-2`, border `accent`, bg
  `bg 60%`; `<Image width=112 height=112>` rendered `52x52px` mobile, `clamp(62px,4.3vw,90px)` square on sm,
  `object-cover object-top`. Row: `flex items-start gap-[12px]` (SP:1775-1777: "a Nintendo-style row inside the box
  instead of a floating name tag").
- Name label inside the row appears only when a portrait is shown.
- Floating name pill appears only when `speaker && !portrait && ambient` (SP:1778; prop doc SP:1666-1669: "the name
  pill only earns its place when there is no picture doing that job instead"). OBSERVED: a named speaker with the big
  scene character visible and no ambient backdrop shows NO name at all in the box (the face on stage is the ID).

### 3.8 Voice blips (SP:1577-1590, 1683-1694; sound.ts:144-157)

- `VOICE_PITCH` (Hz): Christina 640, Jordan 470, Marcus 360, Lamisa 560, "Cobalt HR" 600, Rosa 615, Denise 395,
  Tyler 505. Fallback 500. RN entries WHY (SP:1585-1586): "Chandu, 7 Sept 2026: parity fix -- these three spoke
  through the shared 500 fallback, so every RN voice sounded identical." OBSERVED: Yvonne has no pitch (500).
- Trigger: only `voice === "character" && speaker && !done`. Throttle: fire when `visible.length - blipAt >= 2`
  (every ~2 characters, i.e. roughly every 52 ms at 26 ms/char), and only if the newest glyph matches `/[a-z0-9]/i`
  (spaces/punctuation are silent). `blipAt` is a ref reset per beat by remount.
- Synthesis: `tone(ctx, pitch * wobble, now, 0.045 s, peak 0.022, "triangle")`, `wobble = 1 + (Math.random() - 0.5) * 0.06`
  (+/-3% detune "so a long line reads as speech cadence rather than a metronome"). Envelope per `tone()` (sound.ts:74-86):
  gain 0.0001 -> exp ramp to peak in 12 ms -> exp ramp to 0.0001 at `duration`; osc stops at `duration + 0.02`.
- Stops immediately on `skip()` (done).
- WHY (sound.ts:144-149): "the visual-novel idiom (Ace Attorney, Animal Crossing) ... so who is talking is audible
  before it is read. Never fires for the Narrator or a System card: silence is part of what separates the office
  talking from the game talking."

### 3.9 `tone` field

- `types.ts:87-92`: `tone?: "normal" | "conflict" | "alarm"` on any beat.
- Effects: box edge color (alarm destructive, conflict construction-amber, SP:1755-1758) and pre-answer scene face
  borrowed from the "wrong" tier (concerned/uncertain) (SP:424-428). Boss layout DialogueBox does not receive `tone`.

### 3.10 Celebrate

- `CardBeat.celebrate` (types.ts:154-157; Joshua Pierce, Slack, 6 Sept 2026: "the student is genuinely arriving for
  the first day of their new job"): gold box edge (SP:1214), `playSweep()` on mount (IX:223-225), `LocalBurst nonce={1}`
  (IX:267), title 24px / sm 28px display "plain ink (no gradient: direct feedback, 6 Sept 2026)" (IX:282-285).
- `LocalBurst` (components/build/ui.tsx:212-232) = Build flow's 6x6px squares, `dreamy-burst 0.7s ease-out forwards`,
  4-color rotation. The player itself never uses `PlayBurst` (PlayBurst is only used by the Glossary game).
- Act cards (`variant: "act"`, IX:226-264): LocalBurst + `playSweep()`; with `auto` they advance after 1400 ms
  (IX:233); with `secondaryCta` they wait and offer a mid-level exit link.

### 3.11 Express lexicon (tappable terms and names) (SP:159-202, 1592-1630, 1875-1907)

- Only when `level.express`. Built once per level from the level's own beats ("Nothing is authored twice", SP:159-164):
  - cast entries from `card` beats with `variant === "character"` and `castMember`: kicker = role half of
    `setup.split("•")[1]` (e.g. "Christina • Associate" -> "Associate"), title = name, body = card title, portrait =
    `level.cast[name]`;
  - term entries from every `flips` card: kicker "What it means", title = term, body = def.
- Terms underline ONCE: only on the first beat whose `setup` matches `\bterm\b` (case-insensitive) (SP:183-191).
  Character names are tappable in every setup line.
- Only applied after typing is done ("half-typed tokens cannot match", SP:1842-1846).
- `renderTappableLine` (SP:1600-1630): escaped tokens -> `\b(tok1|tok2)\b` gi; each hit becomes an inline `<button>`
  with `underline decoration-dotted decoration-2 underline-offset-4`, `font/color/letter-spacing: inherit`,
  decoration color `currentColor 45%`; click: `stopPropagation`, `playSelect()`, open panel.
- Panel (SP:1877-1907): `fixed inset-0 z-[90]` click-anywhere-to-close; scrim `bg 62%` + `backdrop-filter: blur(28px)`;
  card `role="dialog" aria-label={title}` `max-w-[360px]` radius-sm border (system-style edge), bg 95%,
  `px-20 py-18`, `fade-slide-up 0.25s`; optional 56px portrait (radius 12px); kicker 11px extrabold .1em uppercase
  muted; title 19px/24px extrabold display; body 14px/20px foreground 88%; footer "Tap anywhere to close" 11px bold
  .06em uppercase muted. No Escape key, no focus trap, no body lock.

---------------------------------------------------------------------------------------------------------------------

## 4. HUD (SP:1987-2125)

### 4.1 Container

`header relative z-20 flex flex-none flex-col gap-[8px] px-3 pt-3 sm:px-5 sm:pt-4`. Behind it a gradient span
`absolute inset-x-0 top-0 -z-10 h-[150%]`: `linear-gradient(to bottom, bg 72% 0%, bg 38% 55%, transparent 100%)`
(SP:2018-2023; WHY "light-mode audit finding 4, both themes ... A gradient, not a bar, so the scene still reads edge to
edge"). Title block has `textShadow: 0 1px 3px color-mix(bg 85%, transparent)`.

### 4.2 Row 1 (left to right)

- `Home` icon Link `/play`, `aria-label="Back to Play"`, IconTip "Back to Play". WHY (SP:2026-2028): "Always available,
  mid-level or not -- the per-beat back chevron only ever stepped back one beat within the run; there was no way to
  jump straight out to the Play hub once past the first beat."
- `ChevronLeft` Back button (only if `onBack`, i.e. `index > 0`), `aria-label="Back to the previous screen"`, IconTip "Back".
- Title (`simulation.title`) over level line `Level {n} · {role}` + `" · Express"` when Express (SP:2057-2060).
- Right cluster: [DEMO FastForward] [MusicToggle] [MuteToggle].
- Score: `level.express || level.hideBand` -> `TappableScore` (button + outcomes panel); else `ScoreGauge` with
  `demo={beat.spotlight === "score"}` (SP:2091-2095).
- All icon buttons: `dm-quiet h-9 w-9` (36px) round, `border`, `backdrop-blur-[10px]`, bg `bg 62%`, border
  `--color-glass-border-raised`. Icons 17px (Home, Volume), 19px (ChevronLeft), 16px (Music), 15px (FastForward).
- Band word hidden below `sm` (SP:2079-2083): "at a phone's narrowest widths, four icon buttons plus this cluster left
  almost no room for the title, which was truncating down to one or two characters."

### 4.3 Row 2: progress bar and checkpoint dots (SP:2097-2122)

- `SparkBar className="flex-1" percent={reputation} height={6} track="var(--color-glass-border-raised)" fill={accent} glow={accent}`.
  The bar shows REPUTATION (0-100), not beat progress. WHY (SP:2098-2101): "Same spark/flicker language as the Build
  flow's bar (SparkBar): the reputation gaining ground is the run's core reward. Solid in the career's own world color
  ... (Chandu, 7 Sept 2026)."
- Dots: always `SCORED_BEATS = 10` dots, `aria-label="{scored} of 10 decisions made"`. Every third (dots 3, 6, 9) is
  a checkpoint: 8px with `1.5px solid` border (accent when filled, glass border when not); others 5px no border.
  Filled (`dot < scored`): bg accent; unfilled: transparent with `inset 0 0 0 5px var(--color-glass-border-raised)`.
  `transition-colors duration-300`. WHY (SP:2104-2106): "Every third dot is a checkpoint: the run is saved at each
  beat, and marking them makes that visible instead of hoping the player trusts it."
  OBSERVED: Express levels with fewer than 10 scored beats still show 10 dots, so a finished Express run never fills
  them.
- `scored = Object.keys(live.scores).length` (SP:133).

### 4.4 Colors

- `accent = WORLD_COLORS[simulation.world] ?? "var(--primary)"` (SP:157). Map (components/app/worlds.ts:29-45), e.g.
  "Business & Finance" -> `var(--world-business-money-office)`, "Health & Medicine" -> `var(--world-health-medicine)`.
- Gauge color = accent (SP:1437-1439, "Chandu, 7 Sept 2026": "every simulation's HUD reads as that career's world").
- `BAND_COLOR` (scoring.ts:34-39): Trusted `--color-feedback-success`, Respected `--world-business-money-office`,
  Cautious `--world-building-construction`, At Risk `--destructive`. Used on the EndingCard only (not the HUD).
- `TIER_COLOR` (scoring.ts:65-71): best/acceptable success, wrong construction-amber, risky destructive, none muted
  (used by option painting in IX).

### 4.5 ScoreGauge (SP:1393-1554)

- 38x38px, SVG viewBox 38, `r = 15.5`, stroke 3; track `--color-glass-border-raised`; fill `accent`,
  `strokeLinecap round`, `strokeDashoffset = C * (1 - shown/100)`, rotated -90deg, transition
  `stroke-dashoffset 0.65s cubic-bezier(0.16,1,0.3,1), stroke 0.4s`.
- Number: `useCountUp` (SP:1363-1386): rAF, 650 ms, easeOutCubic `1 - (1-p)^3`, rounds each frame. WHY: "so a +5
  counts up rather than teleporting -- the count is what makes a score read as a SCORE."
- Pop: the gauge span is keyed `${reputation}-${docked|rest}` and runs `play-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)`
  on every change (SP:1494-1500; G:896-907 scale .94 -> 1.035 @60% -> 1).
- Band column (sm+ only, unless `hideBand`): `Star` 11px filled accent + band word 10.5px bold .1em uppercase muted.
  WHY for hideBand (SP:1521-1525): "The band word ... is RETIRED on any rebuilt level (Scoring Model, 20 Sept): the
  corner shows the reputation NUMBER only".
- Delta float (non-demo): when `delta !== null && delta !== 0`, `absolute -top-[16px] right-0` 14px extrabold tabular,
  success if > 0 else destructive, `+N`/`-N`, `play-float 1.4s ease-out forwards` (G:1025-1034: opacity 1 -> 0,
  translateY 0 -> -22px), keyed by reputation.
- `aria-label="Reputation {n}, {band}"` on the wrapper.

Spotlight demo (`demo` = `beat.spotlight === "score"`, full-mode, non-hideBand levels only):
1. Debut flight (SP:1400-1426, 1444-1483): unless reduced motion, measure the docked gauge rect; render a fixed
   `z-[70]` double at `(innerWidth/2, innerHeight*0.4)`: a 150px disc (bg 84%, border accent 45%, blur 14px, shadow
   `0 24px 80px -12px rgba(0,0,0,.9), 0 0 60px -10px accent 60%`), ring inset 10px, number 40px extrabold display in
   accent with `text-shadow 0 2px 12px rgba(0,0,0,.8)`, and a "Reputation" label 13px extrabold tracking .3em
   uppercase. framer-motion: `initial {x: sx, y: sy, translateX: -50%, translateY: -50%, scale .85, opacity 0}`;
   `animate {x: [sx, sx, tx], y: [sy, sy, ty], scale: [.85, 1, .3], opacity: [0, 1, 1]}`;
   `transition {duration 2.4, times [0, .5, 1], ease [0.6, 0, 0.2, 1]}`; `onAnimationComplete -> docked`.
   The real gauge is `opacity-0` until docked. WHY (SP:1400-1404): "the gauge appears HUGE at screen center (where the
   player is actually looking when the beat says 'that number in the corner'), then flies up into its corner slot --
   and only THEN does the arrow-and-pulse demo start (direct feedback)". SP:1407-1409: "animating transform x/y
   numerically is what keeps the travel smooth; interpolating mixed vw/px `left` keyframes is what made it jitter."
   Reduced motion: docked immediately.
2. Docked demo (SP:1427-1435, 1484-1493, 1534-1542): halo `inset-y-[-6px] left-[-6px] w-[50px] rounded-full`,
   `box-shadow 0 0 0 3px accent 55%`, `play-pulse 1.2s ease-in-out infinite`; arrow "▲" 24px success color with glow,
   `play-nudge-up 1s` (G:973-984: translateY 0 -> -5px, opacity .75 -> 1); every 1500 ms cycle
   `DEMO_STEPS = [0, 5, 0, -3, 0]` added to the displayed number with a demo delta float (`+5`, `-3`).
   WHY (SP:1394-1397): "while a beat is EXPLAINING the score, the gauge acts out a worked example -- nudging up 5, back,
   down 3, back -- with an arrow calling the eye to it, so 'that number in the corner' is unmissable".

### 4.6 TappableScore (Express and hideBand levels, SP:1914-1985)

- Button `aria-haspopup="dialog" aria-expanded`, label `Reputation {n}[, {band}]. What this number decides`; click:
  `playSelect()`, open.
- Panel (same shell as lexicon panel): kicker "Reputation", title "This number decides how the level ends.", three rows
  with range and the current row lit (`border accent`, bg accent 12%):
  - hideBand: "Bag secured" 85+ / "Retry level" 40-84 / "Terminated" Under 40 (Scoring Model, 20 Sept:
    "Outcome-first wording ... the word itself is what happens to the player").
  - otherwise: "Promoted" 85+ / "No return offer, start over" 40-84 / "The run ends" Under 40.
  - footer "Tap anywhere to close".
- WHY (SP:2084-2090): "reputation shows from screen one but is never explained by a teaching screen -- the number itself
  is the explainer. Tapping it opens the three outcomes (the old mandatory 'That number in the corner just moved'
  screen, pull instead of push -- Interaction Rules, 20 Sept)."

### 4.7 Music and SFX toggles (SP:2127-2171)

- MusicToggle: `Music` icon; `aria-pressed={musicMuted}`; label/tooltip "Turn music on"/"Turn music off"; icon color
  muted when muted. Independent from SFX (SP:2127-2130: "'mute it and only hear sound effects' means muting the music
  can never also take the SFX with it").
- MuteToggle: `Volume2`/`VolumeX`; `aria-pressed={muted}`; "Turn sound on"/"Turn sound off"; plays `playSelect()` when
  un-muting. WHY (SP:2149-2150): "This gets played in classrooms; a game you cannot silence in one tap is a game you do
  not open at school."
- Both read via `useSyncExternalStore` with server snapshot `false`.

### 4.8 Clock (timed beats, SP:2173-2212)

- Shown when `seconds > 0 && !paused && revealed` (SP:1167), as a flex row between HUD and box:
  `relative z-20 mt-[8px] flex justify-center`.
- 46px circle, `border-2` glass border, bg 62%, blur 10px; SVG r=18 stroke 3; color
  `var(--world-business-money-office)`, urgent (`fraction < 0.34`) `var(--destructive)` +
  `play-pulse 0.9s ease-in-out infinite` (G:1035-1044: opacity .35 -> 1, scale .85 -> 1). Dash transition
  `0.1s linear`. Number `Math.ceil(remaining)` 13px extrabold tabular.
- Countdown: 100 ms interval against a deadline; survives the feedback pause via `remainingRef`; does not start until
  `revealed` (SP:1118-1119: "A timed beat must not burn its clock while the player is still reading the situation").
- SILENT (SP:2177-2178): "per direct instruction: no per-second tick sound -- the ring and the pulse carry the urgency
  on their own." (`playTick` in sound.ts:128-132 is dead code.)
- `onTimerActive(seconds > 0 && !paused && revealed)` -> `setMusicFocused` (lowpass) (SP:405-414, 1138-1143).

### 4.9 DEMO_CONNECT_SHORTCUT (SP:61-67, 620, 2063-2075)

- `export const DEMO_CONNECT_SHORTCUT = true;` Tagged `DEMO-ONLY`. WHY: "direct instruction, 17 Sept 2026: 'add a back
  button or replay thing so we can QA without going back so many steps to launch this' ... Flip back to false before
  this ships to students. See docs/HANDOFF_INDEX.md's Demo vs Production section."
- Renders a `FastForward` 15px button (color `--accent-subtle`), `aria-label="Demo: jump to Connect interstitial"`,
  tooltip "Demo: jump to Connect", only when `nextLevel` exists; click -> `setConnectOpen(true)`.

---------------------------------------------------------------------------------------------------------------------

## 5. Feedback and correction model

### 5.1 Per-pick reaction (in the body, before the sheet): IX shared parts

- `tierSound(tier)` (IX:127-131, called at pick time in ChoiceBody IX:898/921): best/acceptable -> `playCorrect()`;
  wrong/risky -> `playWrong()`; none -> `playSelect()`. IX:124-126: "Every pick in the game gets the same treatment --
  the chosen tile colours to its tier, a bad one shakes, a sound fires."
- OptionButton (IX:93-160): picked bad -> `play-shake 0.42s` (G:997-1014: x -5, 5, -3, 3 px) and tier color; picked
  good -> success color + `confirm-lift 0.42s` (G:760-770: translateY -3px scale 1.035 at 38%) + `ConfirmShimmer`;
  the best option is `revealed` when the player picked another (success color + `play-pop 0.44s`); unpicked options
  dim to 0.4. Numbered badge 29px (24 compact) turns into X or Check. Stagger `animationDelay index*55ms` on the
  `fade-slide-up 0.34s` entrance. Answer order is a seeded shuffle, stable per page load (IX:38-74).
- Then the player holds 420 ms (right) / 1150 ms (miss) before the sheet (SP:270).

### 5.2 FeedbackSheet (SP:2214-2320)

- D55 rule (SP:2216-2219): "a feedback card is a headline of two or three words, then ONE sentence, then the skill chips
  and the score -- nothing else. The sentence is the Why line for the option the student actually chose (result.why);
  the beat-level feedback body is no longer shown." So `beat.feedback` is authored but NOT rendered.
- Overlay: `absolute inset-0 z-30 flex items-center justify-center px-3 py-3 sm:px-5 sm:py-5`, bg `bg 58%`,
  `backdrop-filter: blur(28px)` (+ webkit).
- Card: `max-w-[620px]` radius-lg `border-2` px/py 18px gap space-3, bg `bg 92%`, blur 22px,
  `play-sheet-up 0.44s cubic-bezier(0.16,1,0.3,1) both` (G:1015-1024: opacity 0, translateY 22px -> none).
- Color: `delta > 0` -> `--color-feedback-success`; `delta <= -6` -> `--destructive`; else
  `--world-building-construction`. (Full mode: best +5 / acceptable +2 green; wrong -5 amber; risky -6 red.)
- Header row: optional portrait `expressionFor(beat.speaker, result.tier)` 72px, radius-lg, border-2 in color,
  `object-cover object-top`, `play-character-enter 0.32s ease-out both`, keyed by src (SP:2249-2265: "this is the
  reliable place to see it ... guaranteed visible every time"); headline `TIER_HEADLINE[tier]` (types.ts:28-34:
  best "Strong move!", acceptable "That works.", wrong "Not quite.", risky "Risky call." -- "Headlines are DERIVED from
  the score, never authored per beat ... so a writer cannot accidentally congratulate someone for a risky call");
  right side `"+{delta} · {reputation}"` 14px extrabold tabular.
- Why line: `result.why` 15.5px semibold. Source per kind: the chosen option's `why` (choice), or the kind's
  `whenRight`/`whenWrong`/`whenClose`/`whenPass`/`whenFail`/`whenHarmful` (resolved inside IX; not re-verified here).
  Timeout: "Time ran out. In a real week, silence is its own answer."
- Skill chips (SP:2277-2306): `beat.skills[]` as toggle buttons (`aria-expanded`), 11.5px semibold radius-md,
  px10 py4; open chip border `--accent-subtle`, bg accent-subtle 14%; below it `"{skill}: {SKILL_MEANING[skill]}"`
  12.5px, `fade-slide-up 0.25s`. Interaction Rules: "every chip is tappable from L1-11 onward and shows its What It
  Means line".
- CTA: `beat.feedbackCta` (fallback "Continue") + ChevronRight, primary style, `autoFocus`.
- Keys: window keydown Enter / Space / "ChevronRight" -> `preventDefault` + `onNext()` regardless of focus (SP:2228-2239:
  "the sheet is the only thing on screen, so enter, space and right should all dismiss it whatever happens to hold
  focus"). OBSERVED: Enter on a focused skill chip advances instead of toggling (keydown default is prevented).

### 5.3 Score math (SP:104-137)

- `TIER_SCORE` (types.ts:17-23): best +5, acceptable +2, wrong -5, risky -6, none 0. ("Wrong moved from -3 to -5
  (Scoring Model, REBUILT 20 Sept to binary scoring) ... a level's final reputation always equals correct answers x 10.")
- `scoreScale = SCORED_BEATS / countScoredKindBeatsInThisLevel` (SP:127-130); `scoredValue(tier) = Math.round(TIER_SCORE[tier] * scoreScale)`.
  WHY (SP:112-126, direct feedback 9 Sept 2026: "make sure in express mode if everything correct the offer is received
  and the reputation score scales appropriately"): "IB Level 1 Express currently has 4 scored beats left ... flat
  scoring would cap a perfect run at 70." Example at 4 scored beats: scale 2.5 -> best +13, acceptable +5, wrong -13,
  risky -15; so Express wrong answers show the red (<= -6) sheet color, and the ending's "+2, not the full +5" copy is
  wrong for Express.
- `reputation = clamp(reputationBaseline + sum(scoredValue(tier) for each banked beat))`, clamp = round + [0,100]
  (SP:132, scoring.ts:46-48). Derived, so a repair "simply overwrites its entry and the total follows" (SP:104-110).
- Animations of a score change: gauge count-up 650 ms + ring 0.65 s + pop 0.5 s + delta float 1.4 s; SparkBar moves to
  the new percent.

### 5.4 Retry rules

- No in-place retry of a scored beat: after the sheet, the run advances.
- Unscored `check` beats: unlimited tries, wrong shakes and stays open until right (types.ts:161-166).
- Repair round at the ending (only when the ending does not advance and there are misses): replays only wrong/risky
  beats in level order, then jumps to the review beat; best/acceptable during repair bank as `acceptable`
  (SP:271-273).
- HUD Back re-plays the previous beat at full value (see 1.9).
- Streaks: none. There is no streak/combo counter in the player (strikes are the only running tally, and they only feed
  the Performance Plan). The only "combo" UI is the Connect interstitial's x3 chain.

### 5.5 Performance Plan as the failure branch

See 9.2. Trigger: third strike within one level, once per level. Pass: reputation SET to 50 (baseline =
`50 - earned`, SP:627-635; "reputation is SET to exactly 50, not added to"), strikes 0, resume at the beat after the
trigger. Terminate: full level reset to beat 0 (SP:636-647).

---------------------------------------------------------------------------------------------------------------------

## 6. Error / edge states and recovery

| Situation | What happens | Ref |
|---|---|---|
| Unknown game id | `notFound()` -> Next 404 | ROUTE:25 |
| Unknown / unbuilt / non-numeric `?level=` | silently Level 1 | ROUTE:26-27 |
| `?mode=express` on a level without `expressCut` | silently full mode | ROUTE:40 |
| Locked level | no concept of locking; any built level plays by URL | ROUTE |
| Level n > 3 or sim without a plan | `PERFORMANCE_PLANS[sim.id] ?? PERFORMANCE_PLANS["investment-banking"]` then `[level.n as 1|2|3]`; UNCLEAR/OBSERVED: a level n outside 1-3 would pass `undefined` as `plan` and crash when a plan fires | SP:625 |
| Missing scene/hero image file | `next/image` with no `onError`; broken image. No fallback. | SP:804, 856 |
| Beat with no art and no location | ambient backdrop (by design) | SP:1030 |
| Speaker without expression art | no scene sprite (SceneCharacter returns null) | SP:931 |
| Speaker without `level.cast` face | no chip; name pill only if ambient | SP:1094, 1778 |
| Missing `PORTRAIT_RATIO` entry | falls back to 0.55 width ratio (may letterbox) | SP:962 |
| Missing `VOICE_PITCH` entry | 500 Hz | SP:1693 |
| Empty `planLineIfFailed` | `{PLAN_LINE}` replaced by `""` ("The last was when .") | SP:298, PPF:49 |
| Refresh mid-level | resumes at the last advanced beat with scores; strikes/plan/baseline reset; "Picked up where you left off" + "Start over" notice | SP:94-98, 715-728 |
| Refresh on ending / during repair | run already cleared -> fresh start | SP:341 |
| Save written before per-beat scores existed | resumes with empty scores | progress.ts:58-60 |
| localStorage throws (private mode, quota) | reads return EMPTY / not-muted; writes swallowed ("the run still works, it just will not survive leaving the page") | progress.ts:82-86, 113-118; sound.ts:29-41; music.ts:155-167 |
| Audio autoplay blocked (music) | `play()` rejection resets `current` and arms a one-shot `pointerdown`/`keydown` retry | music.ts:34-54, 115-121 |
| AudioContext suspended (SFX) | `resume()` on every sound call | sound.ts:20 |
| No Web Audio | SFX silent; music plays but never muffles | sound.ts:17-24; music.ts:88-90 |
| Reduced motion | see 7.9 | |
| Two tabs | progress and mute flags sync via `storage` event | progress.ts:101-103 |
| Site-wide zoom at >=1441px | disabled while player mounted | SP:238-241 |

Keyboard support: DialogueBox keys (3.3), digit keys for options, FeedbackSheet keys (5.2), Connect Escape + Tab trap
(9.3). No Escape handling for the Express panel, TappableScore panel, PIP, or Trailer.

Focus management: FeedbackSheet CTA `autoFocus`; Trailer finale Start `autoFocus`; Connect dialog focuses itself on
mount, traps Tab, restores prior focus on close (CI:225-248). Nothing moves focus on a new beat; the box is a click
target `div` (not focusable).

A11y labels present: HUD buttons (`aria-label`s above), `aria-pressed` on toggles, gauge `aria-label`, dots
`aria-label`, dialog roles on the two small panels (no `aria-modal`), sr-only "or press enter", scene
`aria-hidden` when no alt, all decorative layers `aria-hidden`. Absent: `aria-live` for typed dialogue or the feedback
verdict (CI does use `aria-live="polite"` on its XP counter).

---------------------------------------------------------------------------------------------------------------------

## 7. Every animation (values)

### 7.1 CSS keyframes used by the player (src/app/globals.css)

| Name | Keyframes | Used with | Line |
|---|---|---|---|
| fade-slide-up | opacity 0, translateY(6px) -> 1, 0 | Continue 0.3s ease-out; body 0.4s cubic-bezier(0.16,1,0.3,1); review CTA 0.4s ease-out; panels 0.25s ease-out; skill meaning 0.25s; OptionButton 0.34s | G:493 |
| confirm-lift | 0/100% none; 38% translateY(-3px) scale(1.035) | right pick 0.42s ease-out | G:760 |
| play-scene-in | opacity 0 scale 1.06 -> 1, 1 | hero + desktop location, 1.1s cubic-bezier(0.16,1,0.3,1) both | G:884 |
| play-pop | scale .94 -> 1.035 (60%) -> 1 | gauge 0.5s cubic-bezier(0.34,1.56,0.64,1); revealed answer 0.44s | G:896 |
| play-character-enter | opacity 0 translateY(22px) scale(.96) -> 1 none | sprite 0.42s cubic-bezier(0.16,1,0.3,1) both; feedback portrait 0.32s ease-out both | G:928 |
| play-ambient-drift-a/b/c | see 2.7 | 18s / 22s / 26s ease-in-out infinite | G:939-950 |
| play-ambient-twinkle | opacity .15 <-> .85 | 3.6s ease-in-out infinite | G:951 |
| play-notice | 0% op0 y10 / 4%-88% op1 / 100% op0 y-6 hidden | resume notice 11s ease-out both | G:956 |
| play-nudge-up | y 0 op .75 <-> y -5 op 1 | spotlight arrow 1s infinite | G:973 |
| play-nudge | x 0 op .7 <-> x 4px op 1 | Continue chevron 1.1s infinite | G:985 |
| play-shake | x -5/5/-3/3 | wrong pick 0.42s ease-in-out | G:997 |
| play-sheet-up | op 0 y 22px -> op 1 none | FeedbackSheet 0.44s; EndingCard 0.5s; PIP cards 0.5s; all cubic-bezier(0.16,1,0.3,1) both | G:1015 |
| play-float | op 1 -> 0, y 0 -> -22px | deltas 1.4s ease-out forwards | G:1025 |
| play-pulse | op .35 scale .85 <-> op 1 scale 1 | review dots 1.1s (140ms stagger); halo 1.2s; urgent clock 0.9s | G:1035 |
| play-burst / play-burst-flash | see 7.6 | PlayBurst | G:1062-1070 |
| Tailwind animate-pulse | Tailwind default | typing cursor (not motion-gated) | SP:1847 |

The stage section header in G:875-877: "a visual-novel stage. The scene drifts in behind the dialogue box, the box's
contents rise as the typewriter finishes, and reputation deltas float off the HUD. All motion-safe only."

### 7.2 CSS transitions in the player

- Scene filter 500ms (dim); vignette opacity 500ms; mood tint colors 700ms; BeatStage hide opacity 300ms; gauge
  dashoffset 0.65s cubic-bezier(0.16,1,0.3,1) + stroke 0.4s; clock dashoffset 0.1s linear; dots colors 300ms.

### 7.3 JS-driven

- Typewriter 26 ms/char, 16 ms poll. Reputation count-up 650 ms easeOutCubic. Spotlight demo step every 1500 ms.
  Review wait 2200 ms. Resolve hold 420 / 1150 ms. Act auto-advance 1400 ms (IX:233). Timer tick 100 ms.

### 7.4 framer-motion in the player

- Spotlight flight only (SP:1450-1462): keyframes above, `duration 2.4, times [0, .5, 1], ease [0.6, 0, 0.2, 1]`.

### 7.5 Trailer (TF): framer-motion

- Plate crossfade: `AnimatePresence` (no mode), `initial {opacity 0} -> animate {opacity 1}`, `exit {opacity 0}`,
  `duration 0.9, ease "easeInOut"`, keyed by card id (TF:76-85).
- Ken Burns: even index scale 1.16 -> 1.04, odd 1.02 -> 1.14, `duration max(card.seconds + 1.2, 3)`, linear; reduced:
  1 (TF:86-91).
- Sprite rise: `{opacity 0, y 60} -> {opacity 1, y 0}`, `duration 1.4, ease [0.16,1,0.3,1], delay 0.25`; reduced:
  opacity only (TF:101-107).
- Letterbox bars: height 0 -> `9dvh`, `duration 1.1, ease [0.16,1,0.3,1]` (not reduced-gated) (TF:127-128).
- Title: `AnimatePresence initial={false}` (no mode="wait"), `{opacity 0, blur(8px), y 8} -> {1, blur(0), 0}`, exit
  `{opacity 0, blur(6px)}`, `duration 0.7, ease [0.16,1,0.3,1]`; reduced: opacity only (TF:158-165).
- Finale block: opacity 0 -> 1, `duration 0.8, delay 0.3` (TF:182).
- Ladder rungs: `{opacity 0, y 10} -> {1, 0}`, `duration 0.5, delay 0.4 + rung*0.22, ease [0.16,1,0.3,1]`, bottom
  rung first (TF:200-204).
- Start button: opacity and y `{0, 12} -> {1, 0}`, `duration 0.6, delay 0.4 + LADDER.length*0.22 + 0.2`; then
  `scale [1, 1.03, 1]`, `duration 1.8, delay 0.4 + LADDER.length*0.22 + 1, repeat Infinity, ease "easeInOut"`
  (TF:239-249; not reduced-gated).

### 7.6 PlayBurst (PlayBurst.tsx; used by Glossary, not the player)

- `count = 22` particles, shapes cycle dot/diamond/spark, colors cycle `[accent, #ffd166, #ffffff, accent]`.
- Per particle i: angle `(i/count)*2π + (i%3)*0.35`; distance `54 + ((i*37) % 46)` px; size `4 + ((i*13) % 6)` px
  (spark svg at 1.8x); end offset `bx = cos*d`, `by = sin*d - 10`; rotation `i even ? 260deg : -220deg`; delay
  `(i%6)*0.028 s`; duration `0.65 + (i%4)*0.09 s`; timing `cubic-bezier(0.16,1,0.3,1)` forwards.
- Origin flash: 40px circle at top 1/3 center, `radial-gradient(circle, color-mix(accent 70%, white) 0%, transparent 70%)`,
  `play-burst-flash 0.5s ease-out forwards` (scale .4 -> 2.2, opacity .9 -> 0).
- `play-burst` (G:1062-1066): 0% op0 scale .3; 15% op1 translate(25%/20% of target) scale 1.25 rot 20%; 100% op0
  translate(target) scale .4 rot target.
- `nonce === 0` renders nothing; changing nonce remounts (replays). WHY (PlayBurst.tsx:3-10, direct feedback
  21 Sept 2026: "not flat basic confetti, ever.").

### 7.7 Connect interstitial: framer-motion (CI)

- Dialog: `initial {opacity 0, y 18 (0 reduced)} -> {opacity 1, y 0}` default framer transition (CI:342-345).
- Views: `AnimatePresence mode="wait" initial={false}`; each view `{opacity 0, y 8} -> {1, 0}`, exit `{opacity 0}`,
  `duration 0.18` (CI:380-382, 408-409, 555).
- Step carousel: `AnimatePresence mode="wait"`, `x: 28*dir -> 0 -> -28*dir`, `duration 0.22, ease [0.16,1,0.3,1]` (CI:415-422).
- HeroGlow: glow `opacity [.55,.8,.55], scale [1,1.08,1]`, 6s infinite easeInOut; Dreamy `y [0,-6,0]` 5s infinite (CI:141-156).
- XP number: `motion.strong key={totalXp > 0 ? ceil(totalXp/1000) : 0}` `scale [1.3, 1]` (OBSERVED: key only changes on
  0 -> >0 and each 1000-XP boundary, so the pop fires once in practice) (CI:359). Count-up 1100 ms easeOutCubic (CI:89-108).
- Connected check: `{scale .4, rotate -10} -> {1, 0}`, `type "spring", damping 11` (CI:557).
- Flights: `duration 2.2, times [0, .15, .8, 1], ease [0.16,1,0.3,1]`; `left [x,x,x,toX]`, `top [y, y-40, y-40, toY]`,
  `opacity [0,1,1,0]`, `scale [.4, 1.4, 1.15, .25]`, `rotate [-6, 4, 0, 0]`; reduced: in place, opacity only (CI:579-593).
- CSS: `.menuRow` hover translateY(-1px) with .15s transitions; `postActionsNudge` 2.2s (unused by CI itself; for
  Career Detail's modal) (CIcss:55-60, 264-269).

### 7.8 Performance Plan (PPF)

- Ambient background transition 700ms between four radial gradients (PPF:113-126).
- Cards `play-sheet-up 0.5s cubic-bezier(0.16,1,0.3,1) both` (warning, outcome) (PPF:215, 348). Step card: no entrance.
- Step pips `transition-[width,background] 300ms`: active 26px wide, others 7px (PPF:275-281).

### 7.9 Reduced-motion coverage

- Gated: every `motion-safe:` CSS animation; typewriter (instant); spotlight flight (skipped); Trailer Ken Burns, sprite
  rise, title blur; Connect offsets, flights, HeroGlow; OptionButton `motion-reduce:transition-none`.
- NOT gated: typing cursor `animate-pulse`; CSS transitions (filter, opacity, dashoffset); Trailer letterbox bars,
  ladder stagger, Start button infinite scale pulse; Connect view fades; PIP background transition.

---------------------------------------------------------------------------------------------------------------------

## 8. Sound design

### 8.1 sound.ts (SFX, WebAudio synthesis, no assets)

- Mute key: `localStorage["dreamari-play-muted"] = "1" | "0"` (sound.ts:9). `isMuted()` also gates creation:
  `audio()` returns null when muted (sound.ts:13-25). One shared lazily-created `AudioContext` (webkit fallback),
  resumed if suspended on each call.
- `setMuted` notifies in-page listeners; `subscribeMuted` also listens to `storage` (sound.ts:36-60).
- `tone(ctx, freq, start, duration, peak, shape="sine")`: osc -> gain -> destination; gain 0.0001 @start, exp ramp to
  `peak` @start+0.012, exp ramp to 0.0001 @start+duration; stop @start+duration+0.02 (sound.ts:74-86).
- `sweep(ctx, from, to, start, duration, peak, shape="sine")`: freq exp ramp from->to over duration; gain peak at 30% of
  duration, then exp decay (sound.ts:161-174).

| Function | Synthesis | Fires when | Ref |
|---|---|---|---|
| playSelect | tone 660 Hz, 0.06 s, peak 0.05, triangle | reveal a question (step), card primary via key, lexicon tap, TappableScore open, unmute, many IX buttons | sound.ts:89-93 |
| playCorrect | 587.33 Hz 0.12 s peak .12 sine + 880 Hz @+0.07 s 0.18 s peak .13 | best/acceptable pick (IX tierSound), PIP correct | sound.ts:96-102 |
| playWrong | 196 Hz 0.14 s peak .10 triangle + 155 Hz @+0.10 s 0.20 s peak .09 triangle ("Low and short, never harsh") | wrong/risky pick, PIP incorrect | sound.ts:104-112 |
| playSweep | C5 523.25, E5 659.25, G5 783.99, C6 1046.5 at 75 ms steps, 0.24 s, peak .12 | promoting ending (SP:2350), celebrate card, act card, PIP pass click, some IX completions | sound.ts:115-120 |
| playTick(urgent) | 1000 Hz (1400 urgent) 0.035 s peak .025 (.05) square | UNUSED (clock is silent by instruction) | sound.ts:128-132 |
| playFlip | sweep 340->980 0.09 s peak .05 triangle + 980->480 @+0.07 0.10 s .035 | flips/focus page turns (IX) | sound.ts:136-142 |
| playVoiceBlip(pitch) | tone pitch*(1±3%) 0.045 s peak .022 triangle | character line typing, every 2 alnum chars | sound.ts:150-157 |
| playSceneChange | sweep 520->220 Hz 0.32 s peak .045 sine ("a soft downward breath, not a doorbell") | `scene.src` changes (not on first render) | sound.ts:180-184; SP:442-446 |
| playCharacterEnter | sweep 700->980 Hz 0.16 s peak .06 triangle ("brief enough to survive firing twice at once") | each SceneCharacter src change (mount or face swap) | sound.ts:189-193; SP:928-930 |
| playFocusMoment | tone 220 Hz 0.22 s peak .07 sine ("marks attention, not an outcome") | `dimmed` false->true | sound.ts:200-204; SP:450-454 |

OBSERVED: the header comment (sound.ts:1-3) still says "Four sounds only"; there are ten.

Connect interstitial uses Build's own SFX (components/build/sound.ts): `playXpRise(ms)` (square-ish rise through a
lowpass 700->1400 Hz, gain to .07, duration max(0.3, ms/1000)) with 380 ms (first action) / 460 ms (later), and
`playMilestoneChime()` (bell tones 523.25 / 659.25 @+.09 / 783.99 @+.18) on the all-three bonus (CI:282).

### 8.2 music.ts (looped <audio> through a lowpass)

- Mute key: `localStorage["dreamari-play-music-muted"]` (music.ts:12), independent of SFX (music.ts:7-10: "the rule is
  explicitly 'mute it [the music] and only hear sound effects'").
- Tracks (music.ts:18-29): default/IB main `/audio/play/ib-main-song.mp3`, promotion `/audio/play/ib-promotion-song.mp3`;
  RN main `/audio/play/rn-main-song.m4a` (RN promotion falls back to IB: "the promotion stinger is generic celebration,
  so a career without its own borrows it").
- Element: single `new Audio()`, `loop = true`, `volume = 0.55`, `muted = isMusicMuted()` (music.ts:70-77).
- Routed once through `createMediaElementSource -> BiquadFilter lowpass (20000 Hz) -> destination` (music.ts:78-87).
  WHY (music.ts:56-63): "'muffle' the music the way a closed door dulls a room's noise -- ducking volume would just make
  it quieter, this makes it sound genuinely far away, which is the actual ask."
- `playMusic(track, simId)`: records `wanted`, syncs muted, no-op if the resolved FILE is already current ("switching
  careers on the same 'main' track must switch songs"), else sets src, `currentTime = 0`, `play()`; on rejection
  `current = null` and `armGestureRetry()` (one-shot pointerdown/keydown) (music.ts:100-122). WHY (music.ts:34-39):
  "a level entered without a prior tap on the page (Express mode's direct link, a hard reload, a shared URL) stayed
  silent for the whole run".
- `setMusicFocused(bool)`: idempotent; cancels scheduled values and linear-ramps the filter to 500 Hz (focused) or
  20000 Hz over 0.5 s (music.ts:124-139). Player: focused while `pip !== null || timerActive` (SP:411).
- `stopMusic()`: clears `wanted` first, pauses, `current = null`, `focused = false` (music.ts:141-151).
- `setMusicMuted` sets `el.muted` live and notifies listeners.
- Track rules (music.ts:1-5): "the Main Song plays for the entire run, it switches to the Promotion Song the instant a
  level's ending actually promotes the player, and it reverts to the Main Song the instant they redo any steps".
- Trailer plays the sim's "main" track on mount and stops it on unmount, sharing the music mute flag (TF:49-57).
- UNCLEAR: `stopMusic()` does not reset the filter frequency; if the context was mid-muffle when leaving, the next
  `setMusicFocused(false)` call is a no-op because `focused` was already reset to false, so the filter could stay at
  500 Hz until a later focus/unfocus cycle.

### 8.3 backdropPulse.ts / useResolvedColor.ts / PlayVersionChip.tsx (not used by SimulationPlayer)

- `dispatchPlayPulse(kind)` fires `window` CustomEvent `"play:pulse"` with `{kind: "correct"|"wrong"|"celebrate"}`;
  `onPlayPulse(handler)` subscribes and returns an unsubscribe. Consumers: PlayBackdrop*/V2/V3/V4 (Glossary game).
  WHY (backdropPulse.ts:1-11, direct feedback 21 Sept 2026: "interactive feedback animations that also reflect in the
  background"; deliberately not the Build aurora system, which "is a heavy canvas renderer ... and it needs its own
  ThemeProvider context this tree doesn't wrap").
- `useResolvedColor(css)`: next rAF, appends a hidden span inside `.marketing-v2` (fallback body), sets `style.color`,
  reads `getComputedStyle(probe).color`, removes it; returns `rgb(...)` or null. WHY (useResolvedColor.ts:5-24): canvas
  can't parse `var()`; the probe must sit inside the subtree where `--glossary-accent` is defined ("a real bug found
  live: PlayBackdropV3Dots's canvas dots rendered near-white instead of the intended gold").
- `PlayVersionChip`: demo-only tablist v1 / "v2 CRT" / "v3 Dots" / "v4 Synth" for the Glossary background; 10px
  semibold uppercase, active bg `var(--glossary-accent)` text `#05070f`; "never part of the product UI" (PlayVersionChip.tsx:3-7).

---------------------------------------------------------------------------------------------------------------------

## 9. Trailer, Performance Plan, Connect interstitial

### 9.1 TrailerFlow (TF)

Design brief (TF:14-22): "plays once before Level 1, always skippable, teaches nothing, about 20 seconds. Cut like a
AAA game trailer, not a slideshow: cinema letterbox bars, a slow Ken Burns push on every plate, film grain and a deep
vignette, and title cards set in the career world's own approved display face ... that breathe in from a blur the way
film titles do. ... Skip appears from card 1 and is never hidden -- a student who skips goes straight to the level and
loses nothing."

Entry/exit: opened from the hub's "Watch trailer" chip; `onDone` = `setTrailerSim(null)` (PlayHub.tsx:327).
OBSERVED: both "Skip ▸" and the finale's "▶ Start Level 1" only CLOSE the overlay back to the hub; neither navigates to
the level (contradicts the TF header's "goes straight to the level").

Copy source: `simulation.trailer: TrailerCard[]` (`{ id, seconds, text, art?, sprite?, finale? }`, types.ts:450-464),
authored in games.ts (IB TR-01..07 games.ts:23-32; RN RN-TR-01..07 games.ts:52-60). Firm name `simulation.firm`;
ladder = `[...levels.map(l => l.role), ...simulation.upcoming]`.

Structure (portal to `document.body`, TF:38-45: "fixed positioning inside the app shell gets captured by ancestor
transforms/filters"):
- Root `marketing-v2 themeable fixed inset-0 z-[80] overflow-hidden`, bg `#000`, `role="dialog" aria-label="Trailer"`
  (the classes ride along so tokens resolve outside the app shell, TF:68-70).
- Auto-advance: `setTimeout(card.seconds * 1000)` per non-finale card (TF:59-64). Finale holds.
- Plate (if `card.art`): crossfade + Ken Burns (7.5), `next/image fill object-cover priority`. No art -> black.
- Vignettes: `radial-gradient(115% 85% at 50% 46%, transparent 26%, rgba(0,0,0,.62) 74%, rgba(0,0,0,.94) 100%)` and
  `linear-gradient(180deg, rgba(0,0,0,.55) 0%, transparent 30%, transparent 62%, rgba(0,0,0,.72) 100%)` (TF:96-97).
- Sprite (if `card.sprite`): `absolute right-[2%] bottom-0 h-[80dvh] w-[60vw] sm:right-[9%] sm:w-[36vw]`,
  `object-contain object-bottom`, `filter: brightness(0.68) contrast(1.08) saturate(0.85) drop-shadow(0 0 60px rgba(0,0,0,0.9))`
  (TF:101-116: "low-key graded but clearly VISIBLE (above the vignette layers, never buried under them)").
- Film grain: inline SVG `feTurbulence fractalNoise baseFrequency 0.9 numOctaves 2`, 160px tile, `opacity 0.07`,
  `mix-blend-overlay` (TF:24-27, 123).
- Letterbox: top and bottom black bars easing to `9dvh`, z-20 ("the two black bars closing in IS the 'a film is
  starting' cue", TF:125-128).
- Text scrim (non-finale): 90dvh x 160vw centered, `backdrop-filter: blur(9px)`, mask
  `radial-gradient(38% 32% at 50% 50%, black 12%, transparent 62%)`, bg
  `radial-gradient(38% 32% at 50% 50%, rgba(0,0,0,.58) 0%, rgba(0,0,0,.3) 42%, transparent 66%)` (TF:131-150:
  "legibility is 100% on ANY art -- the bright morning plates were washing the serif out").
- Title: `clamp(26px,5.4vw,52px)`, lh 1.22, tracking .04em, `text-balance uppercase`, `posterTitleFont(world)` (e.g.
  Business & Finance `var(--font-poster)` Viaoda Libre 400, letter-spacing .81px; Health & Medicine Nunito 700;
  worlds.ts:51-71), color `#f8f3e7`, text-shadow `0 2px 44px rgba(0,0,0,.95), 0 2px 10px rgba(0,0,0,.95), 0 1px 3px #000`.
  An invisible duplicate reserves height (TF:175-178). No `mode="wait"` so "a cut never shows a picture with no words
  on it (direct feedback)" (TF:151-156).
- Finale (TF:181-256): firm mark 12px bold tracking .5em uppercase body font in accent; vertical ladder stepper, top
  first: ring 14px border-2 (`rgba(255,255,255, .3 + rung*.08)`, top rung filled accent with `0 0 16px` glow), label
  `font-size 11 + rung*0.9 px`, bold tracking .2em uppercase, color `rgba(255,255,255, .5 + rung*.09)` (top: accent +
  glow), 2px x 13px connector `rgba(255,255,255, .14 + rung*.05)`. OBSERVED: `top = rung === 5` is hardcoded to a
  six-rung ladder. WHY (TF:187-193): "short line segments CONNECTING the rings (nothing overlapping, per direct
  feedback) ... A diagram, not buttons, so the one real button below stays the only thing that reads tappable."
  Button "▶ Start Level 1" `min-h-52px max-w-320px` 15px semibold tracking .08em uppercase, primary colors, shadow
  `0 12px 44px -10px primary 85%`, `autoFocus`.
- Chrome: sound toggle top-right `top: calc(9dvh + 14px); right 18px`, 40px round, bg `rgba(0,0,0,.45)`, border
  `rgba(255,255,255,.3)`, labels "Turn trailer sound on/off" (shares the music mute flag); "Skip ▸" bottom-right
  `bottom: calc(9dvh + 16px); right 22px`, min-h 44px, 12px bold tracking .3em uppercase, `rgba(255,255,255,.66)`.
- Edge: `cards[]` empty would crash (`card` undefined): hub only mounts it when `trailer` is set. No Escape key, no
  focus trap, no scroll lock.

### 9.2 PerformancePlanFlow (PPF)

Content: `PERFORMANCE_PLANS[simId][level]` (performance-plan.ts:53). Shape (performance-plan.ts:15-48): warning
`{warningSetup, warningQuestion, warningCta}`, three steps `{setup (step 1 contains {PLAN_LINE}), correct, incorrect,
whyCorrect, whyIncorrect, skillPrimary, skillSecondary}`, `{passedSetup, passedBody, passedCta}`,
`{terminatedSetup, terminatedBody, terminatedRestartCta, terminatedLeaveCta}`. Runtime `PipState {triggerLine,
resumeIndex, stepOrders}` with `randomStepOrders()` = three independent 50/50 `[correct, incorrect]` orders rolled at
trigger time (performance-plan.ts:306-332: "MUST RANDOMISE POSITION. In the build the right answer was A all three
times."). `skillPrimary/skillSecondary` are NOT rendered by PPF.

Why a separate state machine (PPF:11-18): "it is not one of the ten scored beats, it never moves the level's progress
bar, and it can only happen once per level. RED is the ambience ... draining to purple on a pass and staying red --
but quiet, no confetti -- on termination."

Phases `"warning" | "step" | "passed" | "terminated"` (PPF:20); `step 0..2`; `correctCount`; `picked`.

- Background (fixed inset-0 z-0, 700ms): warning `radial-gradient(ellipse at 50% 30%, #7a1f0a 0%, #3a0a10 55%, #0d0308 100%)`;
  step `(50% 20%, #5a0f14, #26060c 60%, #0a0308)`; passed `(50% 30%, #3a1a5c, #1c0e30 55%, #0a0614)`; terminated
  `(50% 30%, #3a0a10, #1a0508 60%, #080304)`. Container `max-w-[480px]` centered.
- Warning card: bg `linear-gradient(160deg, rgba(234,88,12,.22), rgba(127,29,29,.55))`, border-2 `#f97316`, `ShieldAlert`
  on a 58px `#f97316` tile, h2 "Performance Plan" 22/26px display white, setup 15.5px semibold white, question 14px
  white 80%, CTA `warningCta` bg `#f97316` text `#1a0508` -> phase "step".
- Step card: 3 pips; card bg `rgba(10,3,6,.72)` border-2 `#e5484d`; setup 18/20px display extrabold white with
  `{PLAN_LINE}` -> `pip.triggerLine`; two option buttons in `stepOrders[step]` order (15px bold, border
  `rgba(255,255,255,.25)`). Pick: sound (`playCorrect`/`playWrong`), `correctCount++` if correct, show why (green
  `#4ade80` / red `#fca5a5`, 14.5px semibold) + "Continue" (bg `#e5484d`). Continue: next step, or after step 3
  `correctCount >= 2 ? "passed" : "terminated"`.
- System line (PPF:22-29, 103-106): step 1 always "Three mistakes is a pattern, not bad luck. Two right answers out of
  three and you keep the job."; step 2 none ("the silence is deliberate"); step 3 only if `correctCount === 0`:
  "This one decides it. Be specific." Styled 13.5px semibold, bg `rgba(10,3,6,.5)`, border `rgba(255,255,255,.18)`.
- Passed: bg `rgba(88,28,135,.4)` border `#a855f7`, `Trophy` on `#facc15`, headline `passedSetup`, body `passedBody`,
  CTA `passedCta` bg `#a855f7` text `#0a0614` -> `playSweep()` + `onPassed()`.
- Terminated: bg `rgba(40,8,12,.6)` border `#e5484d`, `FileText` on `#6b7280`, headline literal "Employment
  Terminated", body `terminatedSetup`, extra paragraph `terminatedBody` (14px white 75%), restart CTA (`#e5484d`) ->
  `onTerminated()`, leave Link `terminatedLeaveCta` -> `/play`.
- Back stepper (PPF:54-79): hidden on warning; in a step: undo pick -> previous step -> warning; from outcome: back to
  step 3. WHY: "Added for demos ... (direct instruction, 17 Sept 2026: 'a back button ... to go back one step in the
  game itself ... we need this for demos')". Positioned `fixed top-3 left-3 z-[2] sm:top-4 sm:left-5`.
  OBSERVED: undoing a pick does not decrement `correctCount`, so back-and-repick can inflate it. UNCLEAR: the button
  sits inside the `z-10` content layer, under the HUD (`z-20`) whose Home button occupies the same corner; likely
  covered (not verified live).
- The HUD stays rendered above the red ambience, showing the frozen reputation; music is lowpassed for the whole plan.
- Player callbacks: see 5.5 (SP:623-648). OBSERVED/UNCLEAR: a plan triggered during a repair round resumes at
  `index + 1` of normal play while `repair` is still set; subsequent `advance()` calls follow the repair queue again.

### 9.3 ConnectInterstitial (CI + CIcss)

Why it exists / history (CI:3-34): skippable interstitial between levels "that pulls a student into Connect for one
real professional interaction". Rebuilt 17 Sept 2026 after live-testing the Replit reference
(dceeai.replit.app/ib-career-game, "CONNECT BEFORE LEVEL 2"): compact 420-460px single column, backdrop only dims and
blurs, flat segmented control over ONE real post ("shouldn't feel too complicated... match the replit's DNA for the
userflow, except for our enhancements"). Enhancements: cinematic carousel between actions, escalating XP with flying
number, Ask starts blank and only surfaces a real matching thread, Replay for demos. "Content is always real, never
placeholder": Insights/Threads/Communities from `components/connect/data.ts`, matched to the sim's world.

Doc/code discrepancies (OBSERVED):
- CI:25-26 and CI:266 say chain XP "5 -> 8 -> 12"; code is effort-based `ACTION_XP = { like: 5, comment: 10, ask: 20 }`
  + `BONUS_XP = 15` (CI:68-73; "feedback from Joshua: asking a real question is more effort than a like, so it should
  be worth more, regardless of whether it's the first or third thing a student does").
- CI:10-15 says NOT gated; CI:261-269 ("Direct instruction, 17 Sept 2026: 'I should be shown all my options in
  succession and have to at least like 1, at least comment on 1, and at least ask 1'") says all three are required
  before "Connected". Actual code: after ANY one action the footer "Continue to Level N" enables and leads to the
  connected view; completing all three auto-opens it after 700 ms; Close/backdrop/Escape leave at any time.

Structure:
- Portal to body; root `marketing-v2 themeable` + `.overlay` (fixed inset-0, z 85, grid centered, padding 20px),
  inline `--connect-accent: accent`, `zoom: calc(1 / var(--vz, 1))` (CI:318-330: cancels the site zoom so
  getBoundingClientRect-based flights are not zoomed twice; with `play-no-zoom` active `--vz` is 1).
- Backdrop: full-screen `<button aria-label="Close and continue to next level">` with `bg 34%` (CIcss:6-14, "never a
  solid/near-opaque fill (direct feedback, 17 Sept 2026, repeated: 'the background cannot go black')") and Tailwind
  `backdrop-blur-[28px]` (CI:331-341: "Lightning CSS silently strips a plain `backdrop-filter` declaration from a
  stylesheet/CSS-module rule").
- Dialog: `role="dialog" aria-modal="true" aria-labelledby="connect-title" tabIndex={-1}`, `width: min(640px,100%)`,
  `max-height: calc(100dvh - 40px)`, radius-xl, border glass raised, bg accent 9% gradient over bg 92%, shadow
  `0 34px 100px -26px rgba(0,0,0,.75), 0 0 70px -18px accent 48%`, blur 22px (CIcss:15-22). <=480px: bottom sheet
  (align flex-end, full width, top corners only, padding 10px, content 18px) (CIcss:345-349).
- Toolbar (CIcss:33-38): left = "Back to menu" chevron (posts view) or "Replay" (RotateCcw) otherwise; center XP:
  `LocalBurst nonce={burstNonce}`, `Sparkles` 15px, `{displayXp} XP` (15px 700 tabular, accent), chain SparkBar 64px
  wide h4 (fill `linear-gradient(90deg, #33c78c, #facc15, #c084fc)`, glow = chain color of latest, `min 8` once
  started, `idle false`, `memoryKey "connect-interstitial-chain"`), `aria-live="polite" aria-atomic`; right = Close X.
  "No Skip button (direct feedback, 19 Sept 2026). Close stays as the one quiet way out" (CI:372-373).
- Focus/keys (CI:209-248): on mount lock body scroll (`overflow: hidden`, which also silences the game's key handler),
  focus dialog, Tab/Shift-Tab trap over visible `button:not(:disabled), textarea, input, [tabindex="0"]`, Escape ->
  continue; on unmount restore overflow and prior focus. `onContinue` read via ref (CI:213-224: the parent passes a new
  arrow every render, which used to re-run this effect and "rip focus back out of whatever the student was typing").

Views:
1. intro: HeroGlow (glow 260x180 at top -38px + `/images/dreamy/v2/splash/dreamy-puzzle-wide.webp` 136px wide);
   h1 `Connect before {Level N}` (`clamp(26px,4.6vw,32px)`/1.12 800 display, tracking -.03em, `dm-title-shimmer` tinted
   accent); "Engage with real professionals to continue." (14.5px muted); "Do all three for a bonus." (12.5px 650
   accent); three menu rows (copy verbatim from the reference, CI:58-64): Like "React to advice from a professional"
   (ThumbsUp), Comment "Join a professional conversation" (MessageCircle), Ask "Ask professionals in this career"
   (Sparkles); right side `+N XP` or a Check. Icon/Check color = chain color by COMPLETION ORDER (CI:391-395), else accent.
2. posts: segmented tabs (pill, active bg accent text `#05070f`, white text in light mode) with Check on done; carousel
   by direction.
   - Like / Comment share ONE insight: `STAGE_INSIGHT["{simId}:{stageRole}"]` (IB Intern -> "i-first-year-analyst",
     IB Analyst -> "i-analyst-morning", CI:75-85) else the community's most-helpful insight. Card: InsightMark 48,
     Avatar 38 + name + BadgeCheck, `role · org`, CompanyChip; quote 17px/1.55 in curly quotes; meta: helpful(+1 if
     liked), replies(+1 if commented).
     Like: primary "Like" -> "Liked" (`.done`: quiet dark with success border) -> reward. Comment: textarea (maxLength
     200, rows 2, "Add a comment…") + Post (disabled when blank) -> saved comment shown as Avatar "Jordan" "· Just now"
     (OBSERVED: hardcoded student name "Jordan").
   - Ask: community board card (128px photo `PHOTO_COVER[id] ?? community.photo`, focus `PHOTO_FOCUS[id] ?? "60% 42%"`,
     progressive blur, heavy scrim, name 17px display, "{students} students · {activePros} pros", up to 3 company
     chips); `InlineAsk joined defaultOpen` placeholder `Ask the {community} community…`.
     `postQuestion`: `similarQuestion` (CI:110-134): tokenize lowercase alnum, drop STOP_WORDS, strip trailing "s";
     need >= 3 words; score = shared/candidate.size when shared >= 3; first thread with score >= 0.6 (coverage of the
     candidate's words, so elaboration isn't punished). Match -> "{followers}+ students already asked this", title,
     primary answer with pro, actions "This helps, thanks" (reward) / "Comment" (form -> Post -> reward) / "Ask
     something else" (clear). No match -> posted: the question + "{community} will get a notification." + reward.
   - Fallback if no insight/pro: "No professional posts here yet. You can still ask a question."
   - When current step done and not all: dashed "Next: {title} +{xp} XP →" (CI:529-537; CI:283-289: no auto-advance,
     "give them the option to skip and see the next action").
   - Footer secondary "Continue to {Level N} →", disabled until >= 1 action (CIcss:174-189: never the same bright
     gradient as the step's primary; "make sure we don't have two similarly colored CTAs present at once in a modal").
3. connected: HeroGlow; spring check + LocalBurst; title/body/note by count: 3 "All connected!" / "Liked. Commented.
   Asked." / "+15 XP bonus for all three, included above."; 2 "Two connections made!" / "{A} and {B}, done." / "One more
   (+N XP) for the full bonus."; 1 "Connected!" / "{A}, done." / "Two more for a +15 XP bonus."; 0 "Heading out" / "You
   can always connect next time." (0 is unreachable via the UI). "×3 COMBO" chip at 3; "+{displayXp} XP" 32px 800
   display accent; primary "Continue to {Level N} →" wrapped in `BorderBeam size sm colorful dark duration 4.5 strength
   .9 active={done===3}`; "Keep connecting" text button when 1-2 done.

`reward(action)` (CI:270-290): idempotent per action; `awardDreamScore("connect-play:{simId}:{nextLevelLabel}:{action}", ACTION_XP)`
and on the third `awardDreamScore("...:all3", 15)` (lib/dreamScore.ts: localStorage `dreamari:dream-score`,
`dreamari:dream-score:awards`, event `dreamari:dream-score-change`; once per milestone id ever, so Replay re-animates
but never re-banks); XP total += amount; burst; flight from the content center (y capped at +200px) to the XP counter;
sound (8.1). `replay()` resets every local state including XP to 0 (CI:297-301).

---------------------------------------------------------------------------------------------------------------------

## 10. Design-decision comments (the WHYs), grouped, with file:line

### Demo / QA scaffolding
- SP:61-67 DEMO_CONNECT_SHORTCUT: "direct instruction, 17 Sept 2026: 'add a back button or replay thing so we can QA
  without going back so many steps to launch this' ... Flip back to false before this ships to students."
- PPF:54-59 PIP back stepper: "direct instruction, 17 Sept 2026: 'a back button ... to go back one step in the game
  itself ... we need this for demos'".
- CI:29-30 Replay control "for demos, so the whole loop can be re-run without leaving Play."
- PlayVersionChip.tsx:3-7 demo-only background toggle, "never part of the product UI".

### Level flow and Connect
- SP:81-83 Connect between levels: "one real Connect interaction (Like/Comment/Ask a professional, always skippable)
  between levels, direct instruction 17 Sept 2026."
- SP:691-693 Connect rendered outside phase branches so the shortcut can open it from any beat.
- CI:7-34 rebuild notes vs the Replit reference (17 Sept 2026); CI:58-59 menu copy verbatim from the reference.
- CI:68-72 XP by effort: "feedback from Joshua: asking a real question is more effort than a like".
- CI:75-85, 160-166 stage-appropriate insight: direct feedback 17 Sept 2026 "update the content to be contextually
  relevant for the game for where it fires now."
- CI:87-88 count-up: direct feedback 17 Sept 2026 "make the XP animations and counting much richer."
- CI:136-140 HeroGlow: direct feedback 17 Sept 2026 "where did all our cool graphics and animations go?"
- CI:213-222 onContinue ref: direct feedback 17 Sept 2026 "typing in [the Ask box] is a pain, it keeps getting kicked
  out of focus."
- CI:261-269 all-three instruction (17 Sept 2026) (see discrepancy in 9.3).
- CI:283-289 no auto-advance: "once that's done don't immediately nudge them to go to the next thing... give them the
  option to skip and see the next action."
- CI:318-329 zoom reciprocal; CI:331-335 Tailwind backdrop-blur because Lightning CSS strips it (confirmed live 17 Sept).
- CI:372-373 "No Skip button (direct feedback, 19 Sept 2026)."
- CIcss:1-4 compact single column matching the reference (17 Sept 2026); CIcss:8-12 "the background cannot go black";
  CIcss:25-30 textarea focus ring "sucks"; CIcss:96-103 disabled continue "dim yellow gradient is clashing";
  CIcss:105-108 "too much yellow surface on the card once liked"; CIcss:127-130 "make it feel as if I'm typing on that
  actual community board"; CIcss:174-177 "don't have two similarly colored CTAs present at once in a modal";
  CIcss:330-335 light-mode fill fix (light-mode audit, 17 Sept 2026). CIcss:191-328 are Career Detail modal notes
  (same module), all 17 Sept 2026.

### Scoring and HUD
- SP:104-110 derived reputation; plan "reputation is SET to exactly 50, not added to".
- SP:112-126 Express score scaling (direct feedback 9 Sept 2026).
- SP:144-147 strike rule, "Frequency: Once per level."
- SP:267-270 hold durations; SP:271-273 repair never full marks; SP:274-278 stale-closure bug.
- SP:293-295 plan preempts feedback ("No feedback. Fires the moment the third strike lands").
- SP:320-327 `[]`-truthy repair bug ("nothing happens when I click").
- SP:335-339 take ownership before clearing ("got the worst ending whatever they had earned").
- SP:360-364 restart resets strikes and plan.
- SP:1363-1364 count-up "makes a score read as a SCORE"; SP:1388-1392 gauge as a SCORE (direct feedback).
- SP:1394-1397, 1400-1404, 1407-1409 spotlight demo and debut flight (direct feedback).
- SP:1437-1439, 2098-2101 world color, not tier color (Chandu, 7 Sept 2026).
- SP:1521-1525 band word retired (Scoring Model, 20 Sept); SP:1919-1920 outcome-first wording; SP:2084-2090 tappable
  score, pull instead of push (Interaction Rules, 20 Sept).
- SP:2079-2083 band text hidden on phones (title truncation).
- SP:2104-2106 checkpoint dots make autosave visible.
- SP:2393-2394 repair round reason.
- scoring.ts:3-6 "one system for all 25 career simulations ... Do not invent new scoring -- every career copies this."
- types.ts:11-16 binary scoring rebuild 20 Sept; types.ts:25-27 derived headlines.

### Dialogue and voice
- SP:1083-1087 RPG pacing; SP:1088-1091 and SP:1556-1561 no mascot (D62).
- SP:1207-1210 no-repeat rule (Joshua Pierce, Slack, 6 Sept 2026); SP:1657-1664 (direct feedback 9 Sept 2026).
- SP:1160-1163 system cards centered (direct feedback).
- SP:1281-1284 Action Prompt on every screen (Interaction Rules).
- SP:1565-1574 three voices; SP:1577-1590 per-character pitch, RN parity (Chandu, 7 Sept 2026).
- SP:1683-1685 narrator/system silence is part of the contrast.
- SP:1712-1722 keys locked while a modal is up (direct feedback 17 Sept 2026).
- SP:1740-1743 keyboard presses a card's button.
- SP:1775-1777 Nintendo-style portrait row; SP:1794-1799 setup vs question hierarchy; SP:1823-1828 each voice its face.
- SP:2216-2219 D55 feedback card anatomy; SP:2228-2230 sheet owns the keys; SP:2249-2253 reliable reaction portrait.
- SP:2279-2281 tappable skill chips (Interaction Rules).
- IX:78-81 time-derived typewriter; IX:38-46 randomized but stable answer order ("harder to game the system", direct
  request).
- sound.ts:144-149 visual-novel blips.

### Scene, art, layout
- SP:204-205 sticky art; SP:209-214 and 908-913 pixel sizing quirk; SP:226-237 play-no-zoom; SP:242-247 character
  steps aside for controls; SP:250-256 synchronous revealed reset.
- SP:418-422 blur only the question screen; SP:424-426 tense faces; SP:439-441 scene-change cue only on real swaps.
- SP:461-473 full-bleed on every breakpoint; SP:474-480 parallax removed (ghosts in plates).
- SP:489-492 hero static (no crop); SP:557-560 vignette; SP:574-576 light scrim; SP:592-596 mood on the edges.
- SP:748-749 deterministic sparks; SP:766-769 ambient backdrop role.
- SP:798-802 one cover layer; SP:816-820 static locations.
- SP:882-890 floating chest-up sprites; SP:932-936 centered by default; SP:941-944 no idle bob; SP:954-957 keyed
  entrance; SP:964-970 `max-w-none` (188px -> 639px).
- SP:978-984 SCENE_FRESH_BEATS = 3; SP:1013-1015 resetScene.
- SP:1145-1159 centered vs docked; SP:1173-1175 no Dreamy row gap; SP:1178-1184 clamp widths; SP:1187-1195 vh lift.
- SP:2018-2022 HUD gradient (light-mode audit finding 4).
- expressions.ts:9-15 expression swap "part of the consequence"; expressions.ts:94-103 measured portrait ratios.
- locations.ts:203-213 every beat has a room, except the review beat.

### Sound and music
- sound.ts:5-7 and SP:2149-2150 one-tap mute for classrooms.
- SP:2127-2130 and music.ts:7-10 separate music mute.
- SP:2177-2178 silent clock (direct instruction).
- SP:394-398 and music.ts:1-5 main/promotion rules.
- SP:405-409 and music.ts:56-63 muffle, not mute.
- music.ts:34-39 autoplay retry reason; music.ts:100-102 no restart on re-render; music.ts:144-145 clear intent on leave.
- sound.ts:104-105 wrong "never harsh: getting it wrong is part of learning and should not feel like a punishment".
- sound.ts:176-179, 186-188, 195-199 scene/character/focus cue rationale.

### Trailer
- TF:14-22 AAA trailer brief; TF:38-40 portal; TF:49-52 music started by the opening tap; TF:68-70 token classes;
  TF:72-75 alternating push direction; TF:94-95 deep vignette; TF:98-100 visible sprite; TF:125-126 letterbox cue;
  TF:131-133 text scrim; TF:151-156 no blank frame (direct feedback); TF:187-193 ladder diagram (direct feedback);
  TF:259-261 skip always visible.
- PlayHub.tsx:317-319 and 770-774 trailer separate from starting the game (direct feedback, overriding the handoff's
  auto-play-once rule); PlayHub.tsx:800-802 "Watch trailer" full verb phrase (direct feedback).

### Performance Plan
- PPF:11-18 separate state machine, red ambience; PPF:22-27 fixed system lines (D62, no avatar/name); PPF:50-51 random
  order rolled outside render; PPF:110-112 "the only place in the game red is used"; PPF:272-273 plan pips separate
  from the frozen reputation bar.
- performance-plan.ts:1-13 structure identical everywhere, content per level; performance-plan.ts:20-22 "MUST RANDOMISE
  POSITION".

### Glossary-shared utilities
- PlayBurst.tsx:3-10 "not flat basic confetti, ever" (21 Sept 2026).
- backdropPulse.ts:1-11 background reacts to game moments (21 Sept 2026).
- useResolvedColor.ts:5-24 canvas var() resolution and probe scope bug.

---------------------------------------------------------------------------------------------------------------------

## 11. Checklist for a new career (what the player needs from data to render with no gaps)

Derived from the code paths above (not a spec):
1. `Simulation`: `id`, `careerId`, `title`, `world` (must be a `WORLD_COLORS` key or accent falls back to `--primary`),
   `firm`, `cover`, `levels[]`, `upcoming[]`, optional `trailer[]` (7 cards, last `finale`; ladder total should be 6
   rungs because of the hardcoded `rung === 5`).
2. Each `Level`: `id`, `n` (1-3 unless PERFORMANCE_PLANS is extended), `role`, `mood`, `cover`, `cast` face crops for
   every named speaker who should show a chip, `beats`, `endings` (min floors incl. 85 advance), optional `hideBand`,
   `expressCut`.
3. Ten scored beats per full level (SCORED_BEATS = 10 drives the dots and score scale), each with `skills`,
   `feedbackCta`, every option/result `why`, and `planLineIfFailed`.
4. `BEAT_LOCATION` entry for every beat except the final review; `LOCATION_ART` rooms with `focal`, `mobileFocal`,
   `characterAnchor` (tune `baselineY`/`heightFrac` to the sprite canvas).
5. Expressions: `DEFAULT_EXPRESSION` for every on-stage speaker, `EXPRESSION_PORTRAITS` tier sets for the feedback
   portrait, `PORTRAIT_RATIO` for every file, `VOICE_PITCH` for every speaking character.
6. `PERFORMANCE_PLANS[simId][1|2|3]`, `SIM_TRACKS[simId]` music, `STAGE_INSIGHT` entries and a Connect community whose
   `world` matches.
