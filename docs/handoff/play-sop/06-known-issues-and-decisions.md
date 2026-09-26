# Play SOP, chapter 6: Known issues, rule conflicts and decisions needed

> Every discrepancy the five source reads found, deduplicated and sorted by what blocks scaling. Each item says what the code does today, why it matters for career #3 onward, and a recommended action. "Decide" items need Joshua or the product owner; "Fix" items are engineering-only and safe to do while porting. Snapshot: commit `2ff4bd5d`, 26 Sept 2026. Chapter references point at the detail.

Rule of thumb for Usman's agent: **the code is what ships today, and the prototype's behavior is the reference**. Where a code comment and the code disagree, the code wins until a "Decide" item below is settled. Do not silently pick the comment's version.

---

## A. Decide before scaling (rule conflicts that change what students experience)

| # | Topic | What the code does | What the comments / specs say | Recommendation |
|---|---|---|---|---|
| A1 | Rapid-fire pass rule | Passes at `ceil(0.75 × n)`: 3 of 4 (`scoring.ts:61`). Footer says "3 of 4 correct to pass". | IB L1-18 comment: "Under binary scoring all four sub-questions must be right; the old three-of-four pass is retired." | Ask Joshua. If 4 of 4, add a per-beat `passAt` field rather than changing the global rule (bucket uses the same helper). Ch. 3 §3.13. |
| A2 | Rank partial credit | `whenClose` gives Acceptable when at least n-2 rows are in place, for ANY swap, adjacent or not. On a 3-row list one correct row counts. | `types.ts`: "exactly one adjacent pair swapped". RN1-15's copy says "Three of four in the right place", which a permutation cannot produce. | Implement "exactly one adjacent transposition" if Joshua confirms; fix the RN1-15 `whenClose` copy either way. Ch. 3 §3.17. |
| A3 | Wrong answer value | Wrong is −5 in every level (binary rebuild, 20 Sept). | IB L2/L3 and RN headers still say −3; the score spotlight demo animates `−3`. | Keep −5 (the 0-100 math depends on it). Update the stale comments and change the demo steps to `[0, 5, 0, -5, 0]`. |
| A4 | Band word vs outcome words | IB L1 has `hideBand: true` (HUD shows the number and a tappable panel: "Bag secured / Retry level / Terminated"). IB L2/L3 and RN L1 still show Trusted / Respected / Cautious / At Risk, and every ending card still shows the band. | Scoring Model (20 Sept): "the band word is RETIRED". | Decide whether every level gets the 20 Sept pass. If yes, set `hideBand` on all levels and make the ending card respect it. |
| A5 | Express mode content | IB L1 Express plays a frozen legacy level (`expressSource`) whose cuts include scored beats (4 scored beats left, so each is worth ±13). RN Express cuts only teaching beats. | `types.ts`: "every scored beat must survive" an Express cut. | For new careers, cut only teaching beats (RN pattern). Decide whether IB Express is ever rebuilt to that rule. |
| A6 | Connect interstitial gating | Any one action (Like, Comment or Ask) enables "Continue to Level N"; Close, Escape and the backdrop also continue. XP is 5 / 10 / 20 + 15 bonus. | Comments say all three are required (17 Sept instruction) and that XP escalates 5 → 8 → 12. | Confirm which rule is current; the code reflects the later "no Skip button, Close is the one quiet way out" (19 Sept). Ch. 2 §9.3. |
| A7 | Trailer "Start Level 1" | Both Skip and "▶ Start Level 1" close the trailer back to the hub. | The trailer brief: "a student who skips goes straight to the level". | Recommend: "Start Level 1" navigates to `/play/{id}`; Skip closes. Ch. 2 §9.1. |
| A8 | Level unlocking | Nothing is locked. Any built level plays by `?level=N`; the hub only ever links Level 1 and reads only the Level 1 Full save; there is no "completed" state. | Levels are a ladder (Intern → Managing Director). | Needs a real rule for production (server-side unlock state, hub shows current level and completion). Ch. 5 §1.10. |
| A9 | Glossary XP | 20 XP once per lesson. | `progression-system.md` (proposal) says 30 XP per lesson plus 40 XP for a delayed check 48h later. | Keep 20 until the progression proposal is signed off. |
| A10 | Timeout on a choice beat | The timer resolves as Wrong and paints the first `wrong` option as if the student had picked it. | "Timeout scores Wrong, never Risky" (kept). | Keep the scoring; change the UI so no option is marked as picked, and show "Time ran out". |
| A11 | Glossary subject copy | Three strings say "finance" in code (`GlossaryGameExperience.tsx:403, 463, 480`), and the company-value meter is a finance metaphor. | Glossary is meant to scale to every career. | Add a `subject` field to `GlossaryCareer` ("finance", "nursing") and decide the non-finance progress metaphor (or drop the meter). Ch. 4 §1.5 C. |
| A12 | Post-demo "coming soon" | Careers without a simulation hide the Play button (Career Detail, Explore) or route to `/play?focus=` (Top 3), which silently shows IB. | Joshua: never show "coming soon" in the demo. A later request for a disabled + "Coming soon" button is deferred until the demo period ends. | Decide the post-demo rule, and fix `?focus=` for careers with no game (land on "In the works" with that career featured). |
| A13 | One sprite framing standard | IB sprites are waist-up crops (anchor height 0.9); RN sprites are full-figure 1024x2048 (anchor height 1.75, baseline 1.78). The master prompt specifies full figure. | No rule. | Pick one. Recommendation: full figure 1024x2048 per the master prompt, RN-style anchors, and re-export IB to match when it is next touched. Ch. 7 §2. |
| A14 | Hub card color | The active row header is always Business & Finance gold (`--glossary-accent` is undefined on the hub). | Every other surface wears the career's world color. | Decide if the hub header should follow the featured career's world. |

## B. Fix while porting (engine bugs; no product decision needed)

| # | Where | Bug | Fix |
|---|---|---|---|
| B1 | `SimulationPlayer.tsx:1711, 2233` | Keyboard handlers test `event.key === "ChevronRight"`, which is not a key name, so the right arrow does nothing. | Use `"ArrowRight"`. |
| B2 | `interactions.tsx` BossOverlay | Shows 1/2/3 badges but number keys do nothing, and its Action Prompt never renders (it bypasses `BeatBody`). | Add `useDigitKeys`; render the prompt. |
| B3 | `interactions.tsx` DragOptionsBody | A wrong drop plays the wrong sound twice, shows a green "Locked in" on a wrong answer, and never reveals the right option. | Play once; show the tier color on the rail; reveal Best like `OptionButton` does. |
| B4 | Slider | `timer` is typed but never enforced; a 1-step slider positions the handle at NaN%. | Honor `remaining` or remove `timer` from the type; require at least 2 steps. |
| B5 | Empty lists | `flips.cards: []` crashes; `rapid.items: []` and `bucket.items: []` render nothing and never resolve; an empty trailer array crashes. | Validate at import (see the intake checklist); guard in the component. |
| B6 | HUD Back button | Lets a student step back and re-answer the previous beat for full marks (the repair cap only applies inside a repair round). | In production, Back should not re-open a scored beat that was already banked (or it should bank at the repair cap). |
| B7 | Persistence | Strikes, "plan already used", the plan's reputation baseline and the repair queue are not saved. A refresh re-arms the Performance Plan and loses the "reputation set to 50" after a plan pass. | Persist them in the run save (server-side in production). |
| B8 | Express | Continuing from Level 1 Express goes into Level 2 **Full** (the URL drops `mode=express`). The ending's "+2, not the full +5" copy is wrong under Express scaling. Express shows 10 HUD dots even with 4 scored beats. | Carry `mode` forward; compute the copy from `scoredValue`; draw one dot per scored beat. |
| B9 | Performance Plan | A level `n > 3` has no plan entry and crashes when a plan fires; an unknown simulation silently uses the IB plan text; the plan's back button does not undo the correct count. | Type plans per level without the `1 | 2 | 3` cap and fail loudly on a missing plan; decrement on undo. |
| B10 | Hardcoded amber | `CardBeat.note`, the boss trophy tile, amber reveal rows, slider step 2 and the countdown clock use `--world-business-money-office` instead of the career accent, so a teal nursing sim shows amber. | Pass `accent` through. (Keep amber only where it is the "caution" status color by design.) |
| B11 | Scene character | The scene sprite's post-answer reaction can never show (the character steps aside when controls appear); only the feedback card's 72px portrait reacts. | Accept as the design (the feedback portrait is "the reliable place") and delete the dead `tier` path, or re-show the sprite during feedback. |
| B12 | `castMembers` / anchors | Two-person scenes only work at `l1-reception`; a single character's anchor `x` is ignored (always centered). | Add `characterAnchors` to any plate that needs two people; drop `x` from single anchors or honor it. |
| B13 | Act card with neither `auto` nor `secondaryCta` | Renders no button (keyboard only). | Always render the primary CTA. |
| B14 | Glossary progress | `saveLessonComplete` records every term as mastered and adds XP again on every replay; the saved progress is never read back; Home's "6 of 10 terms mastered" is hardcoded. | Save real mastery; award once server-side; drive Home from real data. |
| B15 | Glossary reduced motion | With reduced motion on, burst particles and the backdrop bloom can stay stuck on screen; stars and fireworks ignore reduced motion. | Render nothing for these under `prefers-reduced-motion`. |
| B16 | Glossary music | v1 music may not restart after leaving and re-entering in-app (module-level `started` flag), and may not start under React StrictMode in dev. | Reset the flag on stop. |
| B17 | Glossary Type the Term | The only question kind with no sound and no backdrop pulse on answer. | Add `playCorrect` / `playWrong` and the pulse. |
| B18 | Glossary Power Play | The word bank lists answers in blank order, which gives the answer away. | Shuffle with `shuffleStable(answers, lesson.id + "-pp")`. |
| B19 | Glossary Sort the Buckets | A placed item cannot be moved back before checking. | Allow tap-to-unplace. |
| B20 | Glossary tokens | `--danger` and `--success` do not exist; the literal fallbacks `#e0483e` and `#1f9d55` are what render. | Use `--destructive` and `--color-feedback-success`. |
| B21 | Accessibility (both games) | No `aria-live` announcement of right/wrong; glossary popups are not dialogs (no role, focus move or trap); inputs lack labels; rank moves are not announced. | Add a polite live region for verdicts, dialog semantics, and labels. |
| B22 | Contrast (light mode) | Glossary CTA (accent fill, `#05070f` text) is about 3.2:1 for finance in light mode; Power Play white text on `#cfc6f5`. | Check every world's CTA pair against 4.5:1. |
| B23 | Content keys | Duplicate labels/terms are used as React keys in almost every list component. | Enforce uniqueness at import. |
| B24 | Document layout | Shuffles lines, so an ordered document ("Slide 3 … Slide 7") appears out of order. | Add `ordered: true` to skip the shuffle for ordered documents. |
| B25 | Bucket | Items are never shuffled; IB L3-12 alternates 0/1/0/1, which students can learn. | Shuffle items (seeded) or require irregular authored order. |
| B26 | Multi-sweep | Chain, bucket and match play the success fanfare even when the result is wrong. | Play the sweep only on Best. |

## C. Hardcoded pieces that block career #3 (make data-driven)

Each of these is a hand-maintained map; a missing entry fails silently (no sprite, a generic 500 Hz voice, the ambient backdrop instead of a room, IB music, IB plan text).

| Map / place | File | What a new career must add | Silent failure if missing |
|---|---|---|---|
| `SIMULATIONS` | `games.ts` | The `Simulation` object | Not playable, not on the hub |
| `BEAT_LOCATION`, `LOCATION_ART` | `locations.ts` | Every non-review beat id; every room | Ambient backdrop instead of a room |
| `DEFAULT_EXPRESSION`, `EXPRESSION_PORTRAITS`, `PORTRAIT_RATIO` | `expressions.ts` | Every on-screen character; every sprite's true w/h | Nobody stands in the room; no reaction face; letterboxed sprite |
| `VOICE_PITCH` | `SimulationPlayer.tsx:1579` | Every speaking character | Every voice identical at 500 Hz |
| `PERFORMANCE_PLANS` | `performance-plan.ts` | Levels 1-3 | IB's plan text in another career |
| `SIM_TRACKS` | `music.ts` | `main` (and `promotion`) | IB's songs |
| `STAGE_INSIGHT` + a Connect community in the world | `ConnectInterstitial.tsx`, `connect/data.ts` | The between-level insight | A generic insight |
| `posterTitleFont` | `app/worlds.ts:51` | A poster face for the world (four worlds have none today) | Body font on the poster |
| `SOON`, `FEATURED_ROW_SOON_IDS` | `games.ts` | Remove the career once it is live | (auto-filtered, but tidy it) |
| `GLOSSARY_CAREERS`, `GLOSSARY_GAMES`, `TERM_ICON_MAP` | `glossary/data.ts`, `games.ts`, `GlossaryGameExperience.tsx:130` | Content, hub card, icon slugs | No glossary; Sparkles icons |
| Home | `HomeExperience.tsx` (19, 298-310, 426-428) | Home hardcodes IB and RN | New career never appears on Home |
| My Plan tasks | `profile/data.ts:95-107` | Glossary task hardcodes `/play/glossary/investment-banking`; "Skill Games" do not exist | Wrong destination |

Production recommendation: move all of these into the per-career content record the backend serves, and run the intake validation list (templates/simulation-content-intake.md) so a missing entry is an import error, not a silent fallback.

## D. Content and asset pipeline gaps

1. **Background separation has no written prompt.** Joshua supplies the art; the sprite master prompt covers cutouts, but separating people out of his room art was done ad hoc. Chapter 7 §3.2 adds a companion edit prompt (untested; tune on first use).
2. **The placeholder-cover prompt template lives outside git** (`~/Documents/Dreamari/Play tab/prompts-and-crops.json`), used only for careers with no pack from Joshua yet. Its crop hints (`landscapePosition: 50% 20%`) are not wired in code (every hub cover is centered).
3. **No post-processing scripts in the repo** for chroma-keying green-screen sprites, alpha-bounding-box crops, matting cleanup or face-chip crops. Chapter 7 §4 specifies each step so it can be scripted.
4. **Face chips differ per career** (IB 512 webp, RN 420-460 jpg). Standardize on 512x512 webp.
5. **The glossary authoring spreadsheet** (`DreamAri_Glossary_Content_Template_v1.xlsx`) is not in the repo. The intake template in `templates/glossary-content-intake.md` is reverse-engineered from `data.ts`; confirm column names against the real sheet.
6. **The simulation handoff zips** (`background-library.json`, `scene.json`, the character bible) are not in the repo.
7. **`art-ratios.ts` is dead code** (imported nowhere, stale values). Delete it.
8. **Orphaned files**: `ib/l1-07.webp`, `ib/l3-01.webp`, `ib/l3-07.webp`, `rn/{rosa,denise,tyler,yvonne}.jpg`, `app/soon-registered-nurse.png`, six `app/glossary-*-thumb*.png`. Prune.
9. **Trademark risk**: `ib/l2-09.webp` still contains real "LOUIS VUITTON" branding, approved as a pre-launch internal placeholder only (`ib-level-2.ts:151-156`). Replace before any public release. No automated trademark check exists; add one to art QA.
10. **Music licensing**: no documented process; careers without a promotion track borrow IB's.
11. **Unused authored fields** (safe to keep optional in the backend schema): `beat.progress`, `pose`, `Level.title`, `Level.blurb`, `Level.cover` (player), `Ending.band`, `RapidBeat.question`, chain step `prompt`, flags row `why`, wrong-option `why` on checks, every scored `feedback`; glossary `memoryTip`, `subtitle`, `difficulty`, `estimatedMinutes`, `careerTitle`, the `order` fields.

## E. Demo-only pieces (remove for production)

`grep -rn "DEMO-ONLY" src` is the authoritative list. In Play:

- `DEMO_CONNECT_SHORTCUT = true` (`SimulationPlayer.tsx:67`): HUD fast-forward to the Connect interstitial. Flip to false.
- Performance Plan back stepper (`PerformancePlanFlow.tsx:54-79`, "we need this for demos").
- Connect interstitial "Replay".
- Glossary `DemoControlsDock` (reload, step back), `PlayVersionChip` and `?bg=2|3|4`, backdrops v2 CRT / v3 Dots / v4 Synthwave and their SFX and music; drop the `--demo-dock-space` term from `--glossary-shell-scale`. Ship v1.
- `DEMO_ALWAYS_SHOW_SPLASH = true` (`WelcomeSplash.tsx:242`).
- Not tagged but demo-state: RN endings marked "Draft pending approval"; Home's hardcoded glossary progress.

## F. Stale docs

- `docs/handoff/specs/play.md` and `docs/HANDOFF_INDEX.md` say Investment Banking is the only playable simulation; Registered Nurse is live.
- `HANDOFF_INDEX.md:158` says the Top 3 Play button always routes to IB; the code routes per career.
- `sound.ts` header says "Four sounds only"; there are ten.
- `SimulationPlayer.tsx:733-747` describes three masked hero layers on phones; the code is one cover layer.
- `PlayHub.tsx:353` says main is capped at 1200px; it is 1440px.
- `rn-level-1.ts:15-17` says "no alpha cutouts yet"; RN sprites ship.
