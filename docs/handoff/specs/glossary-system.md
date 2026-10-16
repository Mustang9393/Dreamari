# Glossary Games as a system: worlds, industries, generated levels

Current state, 16 October 2026 (evening: the Master Scaling Plan SOP folded in). For Usman and any agent working for him. The goal: "create a glossary game for X" is one file and one registry line, and everything else, levels, games, look, hub card, just works.

## The model in one picture

```
Career world (14, WORLD_COLORS)        owns the DESIGN SYSTEM: accent, display face, body face
  └─ Industry glossary (finance, nursing, ...)   owns the LEVELS, the company story, the hub card
       └─ Level (5 terms)                        owns nothing: games are GENERATED from the terms
```

- Glossaries are **industry** games, not career games. Finance sits under Business & Finance; Nursing under Health & Medicine. Several industries can sit under one world and share its look.
- A career opens its industry's glossary: `CAREER_INDUSTRY` in `src/components/glossary/industries.ts` maps a career slug to an industry; a career not listed opens the first glossary under its world. `/play/glossary/<industry>` and `/play/glossary/<career>` both work.
- The **world's design system** (`WORLD_SYSTEMS`, same file): the world's accent from `WORLD_COLORS`, its Career Poster Card display face from the Figma design system (`posterTitleFont` in `app/worlds.ts`), and a readable body face. Drift wears both faces; Signal keeps Jersey 20 and Roboto and takes the accent. Business & Finance keeps the Nunito body the finance game launched with.
- **Levels and games are generated** by `src/components/glossary/generate.ts` from a blueprint: five terms per level, each with a definition, an example sentence and a cue. Investment Banking's four levels stay hand-authored; everything else is generated.

Every world already has a row in `WORLD_SYSTEMS` (15, Personal Care & Community Services included). The Component Lab group "Glossary game, live engine" shows all 15 under "World design systems", with a World picker that re-themes every specimen.

## Create a glossary game for X (agent runbook)

1. **Pick the industry and its world.** Industry slug is lowercase letters and dashes (it is the route). World is an exact `WORLD_COLORS` key.
2. **Write the blueprint** at `src/components/glossary/blueprints/<slug>.ts`, copying `blueprints/software.ts` (a continuous story, four playable levels), `blueprints/aviation.ts` (a scenario thread) or `blueprints/culinary.ts` (a practice world):
   ```ts
   export const X_GLOSSARY: GlossaryBlueprint = {
     industry: { slug: "aviation", title: "Flight Terms", subject: "flight", world: "Driving, Flying & Shipping" },
     mode: "scenario_thread",                 // continuous_story | scenario_thread | practice_world (SOP section 1)
     studentRole: "pilot",                    // who the student is in this world
     exampleCareerSlug: "airline-pilot",      // the hub card and cover that introduce it (omit if no catalog career owns it)
     company: "Skyline Air",                  // the anchor every example names (not required in a practice world)
     // unlocks ("$10K") per level only in a continuous_story; other modes show the milestone on the map
     idPrefix: "AV",                          // lesson ids AV-L01, AV-L02...
     chapters: [{ number: 1, name: "...", tier: "Beginner" }, ...],
     levels: [
       { number: 1, title, tier, goal, unlocks, milestone, nextMilestone, companyValue, nextCompanyValue,
         terms: [ { term, definition, example, cue, moments: [a, b, c] } x 5 ],
         powerPlay: { intro, paragraph }, facts?, intro? },                                          // recognize
       { number: 2, ...terms as above..., cases: [one or two], powerPlay },                          // apply
       { number: 3, ...terms with a `confusion` each..., sort, cases, powerPlay },                   // analyze
       { number: 4, ...terms with a `confusion` each..., selectAll?, cases, powerPlay },             // decide
       { number: 5, title, tier, goal, unlocks, milestone, nextMilestone, companyValue, nextCompanyValue, words: [five words] },  // optional: roadmap words, or playable
     ],
   };
   ```
   Per term: `definition` (one sentence, never says the word; the teach card and the review question), `example` (says the word; names the anchor unless practice world; the teach card and the Power Play fallback), `cue` (seven words at most, never says the word: the match card's right side, a quick-check pair, a compare card point), `moments` (exactly three short real situations that show the word without saying it, twelve words and 72 characters each; every moment is shown on one screen only, which is what keeps a level from asking the same thing twice), `confusion` (the word in the same level it is mixed up with; required from Level 3), `formula` (only on a level with `math: true`). Per level, optional and Finance-style: `sort` (concrete items into two to four concept buckets, like "Money in / Money out"), `selectAll` (four concrete items, one to three right), `cases` (up to two: a scene and two to four steps of two or four options each), `powerPlay` (one written paragraph using {1} to {5} once each, where {n} is the nth term, in an order that is not 1 to 5). Copy rules: eighth grade, one idea per sentence, no dashes, no numbers unless the level sets `math: true`. `validateBlueprint` throws at import with every problem it can see, and `buildLesson` throws if the assembled level would show a line twice, leave a word short of mastery, or run three of one screen shape in a row.
3. **Register it** in `GLOSSARY_INDUSTRIES` (`src/components/glossary/data.ts`): `aviation: buildGlossaryCareer(X_GLOSSARY),`.
4. **Map its careers** in `CAREER_INDUSTRY` (`industries.ts`) if the world has more than one glossary or the career's world is not inferable; otherwise skip.
5. **Release:** a new glossary plays by route and on `/play-tools/glossary-qa` (hamburger, "Glossary QA") at once. It reaches the Play tab only once it has a thumbnail cover (Chandu, 17 Oct 2026: "Only use games with thumbnail art in the play tab"): then add its card to `GLOSSARY_GAMES` in `src/components/play/games.ts` and its slug to `GLOSSARY_HUB_RELEASED` in `data.ts` (SOP Prompt C). Released today: finance, nursing, aviation, software. Culinary is the test world and stays QA-only. SOP Prompt E (section 7c) builds, illustrates and releases a whole world in one run.
6. **Check:** `npx tsc --noEmit`, `node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-blueprints.test.mjs` (every registered blueprint: the SOP rules below, as assertions), `node scripts/qa/dreamy-reactions.test.mjs`, then open `/play/glossary/<slug>?theme=drift` and press the DEMO-ONLY Skip through Level 1 (14 presses), then the same with `?theme=signal`.
7. **Level 1 art (optional, see below).** Without it the industry teaches with words only, which is the rule for every level after the first anyway.

That is the whole job. No question is written by hand.

## Required levels (enforced)

Levels 1 to 4 must be playable in every world; `validateBlueprint` refuses a blueprint where any of them is missing or only roadmap words (`REQUIRED_LEVELS` in `generate.ts`). This is Joshua's plan: "4 initial levels per Glossary World", "20 terms across Levels 1 to 4". Levels 5 and 6 are optional, playable or roadmap (17 Oct 2026, Chandu: "if 5 and 6 are playable but 1-4 are also available across everything its fine. 1-4 should be there mandatorily"). Nursing, Software and Aviation ship six playable levels; Culinary ships four.

## Copy limits and layout rules (enforced)

`validateBlueprint` refuses copy that would break a slot. The limits are measured against the real components at 375px and 1280px:

| Field | Limit | Slot it must fit |
|---|---|---|
| term | 22 characters | the HUD token label (two lines), a word tile, a Power Play chip |
| cue | 34 | the right side of a match card, a quick-check pair, a compare point |
| definition | 110 | the teach card at 24px, an answer tile |
| example | 120 | the teach card |
| formula | 28 | the worked line, on the back of the teach card with the example (never the front, 17 Oct 2026) |
| moment | 72, and 12 words | the scene card's one line, a fill-in sentence, a Select All line, a Type prompt |
| sort item | 34 | a sort token |
| sort bucket | 34 | a bucket label |
| Select All line | 44 | one line of the select list |
| case step prompt | 80 | Dreamy's bubble for one step |
| case option | 34 | a two-up or 2x2 tile |
| Power Play paragraph | Level 1: 200 and five sentences, one blank each; Level 2: 240, five, one blank each; Levels 3 and 4: 290, six; Levels 5+: 330, six | the board; Level 1 must read as five plain lines |
| feedback (authored or generated) | 90, and two sentences | the feedback panel at phone width |
| any sentence | 14 words | everything a student reads |
| cue (words) | 7 words | an answer tile (SOP: answer choices usually 7 words) |
| level title | 30 | the HUD and the Levels map |
| level goal | 48 | the welcome line |

Reading rules (17 Oct 2026, Chandu: "make sure every piece of copy including success explanations etc are shorter and 8th grade comprehension level" and "make sure the power play isnt so complex and long and a lot to read for level 1"): every sentence is 14 words at most; feedback is two short sentences built from the cue, never the full definition, and the generator drops the "other word" clause when a line would pass 90 characters; each level's copy must score grade 8 or below on Flesch-Kincaid with its own five words and the anchor counted as one syllable (`readingGrade` in `generate.ts`); the Power Play's size grows with the level (`powerPlayLimit`).

Inside those limits the engine's own rules hold: a long term scales down on the teach card instead of overflowing (`--term-chars`), HUD labels and relic captions wrap to two lines and never cut mid-glyph, tiles, chips and bubbles break long words, a Power Play slot grows to the length of its answer, and every card clips at its edge. Dreamy is never clipped by a column (the main column overflows; the Drift slot is inset by the atlas margin). Screens never scroll: FitToScreen scales a screen to its room.

## What the generator produces per level

Dreamy asks, like Finance (17 Oct 2026): the generator puts the moment in Dreamy's bubble followed by one short question, and voices every line without a moment from the blueprint's `company` (anchor) and `studentRole` ("You hear "Triage" at Riverside Clinic. What does it mean?"). `glossary-blueprints.test.mjs` fails a bubble that is only a stock instruction.

The level's cognitive focus picks the recipe (SOP section 3: recognize, then apply, then compare and classify, then decide; "a Level 4 question should not simply be a longer Level 1 question"). Default by level number, override with `focus` on the level. Every recipe is seven derived screens, plus the level's authored cases (and an authored sort or Select All where the recipe has no slot for one) as extra screens, so a level runs seven to ten scored screens plus one Power Play (SOP: 7 to 10). The rules the builder asserts at import: no line of copy shown twice in a lesson, every term credited at least twice in the main loop (one credit per term per screen), never three of the same screen shape in a row (a story card, a fill-in sentence, a compare card and a plain 2x2 are four shapes, as in Finance Level 2), at least four shapes per level.

Why this shape (17 Oct 2026, Chandu: "the games are repeating the same questions again and again for mastery instead of having any variety, please refer the finance glossary games"): the first generator built every screen from the same three strings per term, so the definition appeared as the Definition options, the Which Word prompt, the Type prompt and three feedback lines. Finance never does that; every Finance screen carries its own fresh line, and the sort is concrete things into concept buckets, not cues into words. The moments, the authored pieces and the no-repeat assertion are that style, made scalable.

The numbers in brackets are which term the screen credits; m0, m1, m2 are which of its three moments it shows.

| # | Level 1 recognize | Level 2 apply | Level 3 analyze | Level 4+ decide |
|---|---|---|---|---|
| 1 | Definition: the five definitions as options (1) | Dreamy asks m0: the moment, then "Which word is this?" (1) | Compare card, term 1 vs its confusion, m0 decides (1) | Dreamy asks m0, then "Which word do you need here?" (1) |
| 2 | Match It Up, word to meaning (all) | Fill in the blank: m1 then "That is ___." (2) | Dreamy asks m0 (3) | Compare card, term 2 vs its confusion (2) |
| 3 | Fill in the blank, m1 (5) | Dreamy asks m0 (3) | Sort: the level's authored concept sort, else m1 of terms 2 to 5 into the words | Match It Up, "Use it when" (all) |
| 4 | Dreamy asks m0 (3) | Select All: authored, else two moments of term 4 against the confusion's and another's (4) | Select All about term 2 (authored or derived) | Fill in the blank, m1 (3) |
| 5 | Sort: authored, else m1 of terms 1 to 4 into the words | Match It Up (all) | Fill in the blank, m1 (1) | Select All about term 4 (authored or derived) |
| 6 | Catch the Misuse, term 4 wearing another word's cue (4) | Catch the Misuse (5) | Catch the Misuse against the confusion (4) | Catch the Misuse (5) |
| 7 | Type the Term from m2 (2) | Type the Term from m2 (1) | Type the Term from m2 (5) | Type the Term from m2 (1) |
| extra | an authored Select All or case, if written | cases (one or two), after screens 3 and 5 | cases | cases, and an authored sort |

Review: one Reverse Recall per term (the definition read aloud), drawn only for terms still short of mastery; Reverse Recall never appears in the main loop, so the review is always a form the student has not seen. Power Play: the level's written paragraph (recommended), else the five examples with their words blanked in a rotating non-sequential order; either way the blanks never run 1 to 5, and the engine shuffles the word bank so it never mirrors the blanks (17 Oct 2026, Chandu: "dont make the power play so linear"). The right answer's position rotates by level and screen. Feedback is built from each term's own copy, and when the term has a `confusion` the wrong-answer line names it ("Not Tailwind: that is wind pushing from behind").

Live proof of all four recipes with authored pieces: `/play/glossary/culinary?lesson=1` to `lesson=6` (the model blueprint, `blueprints/culinary.ts`).

## Presentation the generator relies on

- A generated industry has no term art. The engine treats a lesson without art like Levels 2+: words-only teach cards, initials in the HUD tokens and on the relics, no pictures on match, sort or card backs.
- Dreamy's poses and reactions, the reward, the Power Play board and the Complete screen are shared by every industry and both themes.
- The Levels map needs no level art: every card wears a scene plate painted from the theme's sky (Drift by tier and level, Signal a skyline slice per level), and the selected card opens in place with its goal, words and Play button. Painted plate variations, if the team wants them, scale by tier and theme through `PLATES` in `levelPlates.ts` (strip format in that file); a level can pin one with `plate`.
- The welcome scene's illustration (the sneaker shop) is Investment Banking's own. A glossary without welcome art gets Dreamy alone, facing the copy.
- The value meter reads "`company` value" and the intro reads "`subject` words".

## Level 1 art for X

Only Level 1 of an industry gets pictures (Joshua, 15 Oct 2026; the team's decision of 16 Oct). The prompt template, both style locks, the references, the script commands, the file contract and the acceptance gate are in the master SOP, `docs/reference/glossary-scaling-sop-usman-2026-10-16.md`, section 6. The filled-in prompt for the three Play tab games is section 7b. They are kept in that one place on purpose (17 Oct 2026, Chandu: "It should all be in the SOP"), so this spec no longer carries its own copy.

## The Master Scaling Plan SOP, and what it changed here (16 Oct 2026)

Joshua's "Dreamari Glossary Game Master Scaling Plan" (PDF, 22 pages) was read against this system and his Finance levels. Verdict: it fits. Its executive rules were already true of the engine (no timers anywhere; one Dreamy per screen, the cloud itself; one Power Play paragraph; no nested Step counters; Finance hand-authored and untouched), and its scaling rules are now enforced by the generator rather than left to the author:

| SOP rule | Here |
|---|---|
| Three architectures (continuous story, scenario thread, practice world) | `mode` on the blueprint. A practice world's examples need not name the anchor. |
| Difficulty progresses recognize, apply, analyze, decide | the four recipes above, by level number or `focus` |
| Context line about 12 words, answers usually 7 | each `moment` 12 words and 72 characters, `cue` 7 words, validated |
| No answer leakage | a definition may not say its own word (Reverse Recall reads it aloud); a cue, a moment, a Select All line and a case step may not say the word they ask for |
| Wrong-answer feedback names exactly what was wrong | `confusion` per term; the misuse distractor and the correction use it |
| No forced math | numbers in copy fail validation unless the level sets `math: true` (the team's decision, in the file) |
| No forced images | unchanged: Level 1 art only, registered by hand in `termArt.ts`; everything else is words |
| Interaction diversity, 7 to 10 interactions, every term introduced then applied | asserted at build and by `scripts/qa/glossary-blueprints.test.mjs` on every registered blueprint |
| Section 8 fields (world_mode, world_anchor, student_role, level_goal, student_definition, common_confusion, applied_example, visual_useful, power_play) | `mode`, `company`, `studentRole`, `goal`, `definition`, `confusion`, `example`, the `termArt.ts` registration, the generated paragraph. `question_type`, `question_term_ids`, `feedback_*` and `story_state` are not stored per lesson: the recipe is the stored structure, reviewed once in code, and `intro` per level carries the story. |

Where this system deliberately differs from the SOP: the PDF calls each of its 50 industries a "Glossary World"; here those are **industries** under the 15 career worlds, which own the look. The SOP's "the Dreamari team decides" for images and math is a flag in the blueprint file (`termArt.ts` registration, `math: true`), so the decision is visible in review and not left to a generator.

Progress: only a continuous story has a company whose value grows, so only that mode shows the dollar meter and `unlocks` on the Levels map. A scenario thread or a practice world shows the level's milestone in words with "Level n of N" (the SOP's `level_goal`), on the intro, the complete screen and the map. An industry without a cover stays off the Play tab (Kitchen Terms, until SOP section 7c Part 1).

## The 50 glossary worlds of the SOP, mapped to our career worlds

Numbers are the SOP's. Built ones are linked. "Mode" is the SOP's recommended architecture, which becomes `mode` in the blueprint.

| # | Industry (SOP "Glossary World") | Mode | Career world (design system) |
|---|---|---|---|
| 1 | Finance & Investment Banking (built, hand-authored, `/play/glossary/finance`) | continuous_story | Business & Finance |
| 2 | Accounting & Audit | scenario_thread | Business & Finance |
| 3 | Entrepreneurship & Venture | continuous_story | Business & Finance |
| 4 | Management Consulting | scenario_thread | Business & Finance |
| 5 | Marketing & Brand Management | scenario_thread | Business & Finance |
| 6 | Sales & Business Development | scenario_thread | Business & Finance |
| 7 | Human Resources & People Operations | scenario_thread | Business & Finance |
| 8 | Supply Chain & Logistics | continuous_story | Driving, Flying & Shipping |
| 9 | Law & Legal Services | scenario_thread | Law, Safety & Justice |
| 10 | Software Engineering (built, `/play/glossary/software`, 6 levels) | continuous_story | Tech & Engineering |
| 11 | Cybersecurity | scenario_thread | Tech & Engineering |
| 12 | Data Science & Analytics | continuous_story | Tech & Engineering |
| 13 | Artificial Intelligence & Machine Learning | continuous_story | Tech & Engineering |
| 14 | Product Management & UX | continuous_story | Tech & Engineering |
| 15 | Electrical & Computer Engineering | scenario_thread | Tech & Engineering |
| 16 | Mechanical Engineering | scenario_thread | Tech & Engineering |
| 17 | Civil Engineering & Construction Management | continuous_story | Building & Construction |
| 18 | Architecture | continuous_story | Building & Construction |
| 19 | Registered Nursing (built, `/play/glossary/nursing`, 6 levels) | scenario_thread | Health & Medicine |
| 20 | Medicine / Physician | scenario_thread | Health & Medicine |
| 21 | Surgery & Operating Room | scenario_thread | Health & Medicine |
| 22 | Pharmacy | practice_world | Health & Medicine |
| 23 | Dentistry | scenario_thread | Health & Medicine |
| 24 | Mental & Behavioral Health | scenario_thread | Counseling & Social Work |
| 25 | Allied Health & Diagnostics | practice_world | Health & Medicine |
| 26 | Biotechnology | continuous_story | Science & Research |
| 27 | Biomedical Engineering | continuous_story | Science & Research |
| 28 | Public Health & Epidemiology | continuous_story | Science & Research |
| 29 | Veterinary Medicine | scenario_thread | Farming, Animals & Nature |
| 30 | Food Science | continuous_story | Farming, Animals & Nature |
| 31 | Consumer Packaged Goods | continuous_story | Business & Finance |
| 32 | Aerospace Engineering | continuous_story | Tech & Engineering |
| 33 | Airline Pilot & Flight Operations (built, `/play/glossary/aviation`, 6 levels) | scenario_thread | Driving, Flying & Shipping |
| 34 | Electrician | scenario_thread | Building & Construction |
| 35 | HVAC & Refrigeration | scenario_thread | Fixing Machines & Engines |
| 36 | Plumbing & Pipefitting | scenario_thread | Building & Construction |
| 37 | Welding & Fabrication | practice_world | Factories & Making Things |
| 38 | Automotive Technology | scenario_thread | Fixing Machines & Engines |
| 39 | Diesel & Heavy Equipment | scenario_thread | Fixing Machines & Engines |
| 40 | Aviation Maintenance Technician | scenario_thread | Fixing Machines & Engines |
| 41 | Avionics Technician | scenario_thread | Fixing Machines & Engines |
| 42 | Advanced Manufacturing & CNC | continuous_story | Factories & Making Things |
| 43 | Industrial Maintenance & Mechatronics | scenario_thread | Factories & Making Things |
| 44 | Robotics Technician | scenario_thread | Factories & Making Things |
| 45 | Carpentry & Construction Trades | scenario_thread | Building & Construction |
| 46 | Solar & Renewable Energy Technician | continuous_story | Building & Construction |
| 47 | Culinary Arts (built, `/play/glossary/culinary`, 6 levels) | practice_world | Food & Cooking |
| 48 | Cosmetology & Barbering | practice_world | Personal Care & Community Services |
| 49 | EMT & Paramedic | scenario_thread | Health & Medicine |
| 50 | CNA & Medical Assistant | scenario_thread | Health & Medicine |

## Images are Codex's; games are Claude's (16 Oct 2026)

Codex generates every image, Claude writes blueprints and builds games. Two optional image kinds exist, and a game ships without either: Level 1 term art (the prompt above, registered in `termArt.ts`) and Levels map scene plates, which scale by tier and theme (six strips for the whole catalogue, 1536 by 512 WebP, horizon in the lower third, nothing within twelve percent of the edges, no text, no Dreamy) and are registered in `PLATES` in `levelPlates.ts`. World backdrops are the third kind (16 Oct 2026, Chandu: "generate reliably and scale different backgrounds in signal mode for each world"): one Signal panorama per career world (fifteen at most), registered in `SIGNAL_WORLD_BACKDROPS` in `worldBackdrops.ts`, feeds the parallax sky and the Levels map plates for every industry under that world; Drift is painted and takes the world accent for its orbs and clouds, with an optional silhouette strip per world in `DRIFT_WORLD_SILHOUETTES`. The full brief with scene descriptions and prompts is section 6 of the master SOP, `docs/reference/glossary-scaling-sop-usman-2026-10-16.md`.

Required per industry since 16 Oct 2026: Level 1 term art (five per theme) and one welcome illustration per theme (`WELCOME_ART` in `welcomeArt.ts`); a level may pin its own welcome (`LEVEL_WELCOME_ART`) or its own Levels map plate (`plate`). Until plate art exists the map shows the level's first term icon on the world accent, and the open Drift card shows one static Dreamy expression by state (`LEVEL_DREAMY_BY_STATE`). Handover Part 3, sections 3.4 to 3.6.

## Where every piece is documented

The master SOP, `docs/reference/glossary-scaling-sop-usman-2026-10-16.md` (HTML twin beside it, Google Doc for sharing), is the only glossary SOP: rules, prompts for games and art, the UI and Component Lab map (section 8), how it scales (9), every guardrail in place (10), the 50 industries, Joshua's plan. Living worlds are its section 6.8. The older handover, the separate art prompt, Play SOP chapters 04 and 12 and the glossary intake template were deleted on 17 Oct 2026; git history has them.

Component Lab, group "Glossary game, live engine (Drift and Signal)": the 14 world design systems, every live piece in both themes and all of its states, with a generated-industry specimen beside the authored one. The older group "Glossary game (retired engine, unrouted)" documents the first engine and stays for archaeology.

## Not done

- A sheet importer (xlsx to blueprint); the blueprint file is the import format.
- Chapter names for generated industries come from the blueprint, not from the levels.
- Graphics only, and every prompt is in the SOP: each new world's art comes with Prompt E (7c); the fifteen Signal world backgrounds with Prompt F (7d, packaged by `scripts/glossary-signal-backdrop.mjs`); the Levels map plates, Drift silhouettes and animated Dreamy reactions with Prompt G (7e). Living worlds have no weather (removed 17 Oct 2026, Chandu's decision); do not add it back.
