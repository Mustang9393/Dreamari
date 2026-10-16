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
         terms: [ { term, definition, example, cue } x 5 ], facts?, intro? },                       // recognize
       { number: 2, ...terms with a `situation` each... },                                          // apply
       { number: 3, ...terms with a `situation` and a `confusion` each... },                        // analyze
       { number: 4, ...terms with a `situation` and a `confusion` each... },                        // decide
       { number: 5, title, tier, goal, unlocks, milestone, nextMilestone, companyValue, nextCompanyValue, words: [five words] },  // roadmap only
     ],
   };
   ```
   Per term: `definition` (one sentence, never says the word), `example` (says the word; names the anchor unless practice world), `cue` (seven words at most: the match card, the sort token), `situation` (the SOP's context line: twelve words, shows the word in use without saying it; required from Level 2), `confusion` (the word in the same level it is mixed up with; required from Level 3), `formula` (only on a level with `math: true`). Copy rules: eighth grade, one idea per sentence, no dashes, no numbers unless the level sets `math: true`. `validateBlueprint` throws at import with every problem it can see.
3. **Register it** in `GLOSSARY_INDUSTRIES` (`src/components/glossary/data.ts`): `aviation: buildGlossaryCareer(X_GLOSSARY),`.
4. **Map its careers** in `CAREER_INDUSTRY` (`industries.ts`) if the world has more than one glossary or the career's world is not inferable; otherwise skip.
5. **Hub card:** add to `GLOSSARY_GAMES` in `src/components/play/games.ts` if not already listed (Finance, Medical, Flight and Tech are). `hasGlossary()` turns the card playable by itself.
6. **Check:** `npx tsc --noEmit`, `node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-blueprints.test.mjs` (every registered blueprint: the SOP rules below, as assertions), `node scripts/qa/dreamy-reactions.test.mjs`, then open `/play/glossary/<slug>?theme=drift` and press the DEMO-ONLY Skip through Level 1 (14 presses), then the same with `?theme=signal`.
7. **Level 1 art (optional, see below).** Without it the industry teaches with words only, which is the rule for every level after the first anyway.

That is the whole job. No question is written by hand.

## Copy limits and layout rules (enforced)

`validateBlueprint` refuses copy that would break a slot. The limits are measured against the real components at 375px and 1280px:

| Field | Limit | Slot it must fit |
|---|---|---|
| term | 22 characters | the HUD token label (two lines), a word tile, a Power Play chip |
| cue | 34 | the right side of a match card, a sort token |
| definition | 120 | the teach card at 24px, an answer tile |
| example | 150 | one sentence of the Power Play paragraph |
| formula | 28 | the worked line under the definition |
| situation | 72, and 12 words | the scene card's one line |
| cue (words) | 7 words | an answer tile (SOP: answer choices usually 7 words) |
| level title | 30 | the HUD and the Levels map |
| level goal | 48 | the welcome line |

Inside those limits the engine's own rules hold: a long term scales down on the teach card instead of overflowing (`--term-chars`), HUD labels and relic captions wrap to two lines and never cut mid-glyph, tiles, chips and bubbles break long words, a Power Play slot grows to the length of its answer, and every card clips at its edge. Dreamy is never clipped by a column (the main column overflows; the Drift slot is inset by the atlas margin). Screens never scroll: FitToScreen scales a screen to its room.

## What the generator produces per level

The level's cognitive focus picks the recipe (SOP section 3: recognize, then apply, then compare and classify, then decide; "a Level 4 question should not simply be a longer Level 1 question"). Default by level number, override with `focus` on the level. Every recipe is seven scored questions plus one Power Play (SOP: 7 to 10), never three of the same mechanic in a row, every term credited at least twice so mastery (two credits) is reachable in the main loop.

| # | Level 1 recognize | Level 2 apply | Level 3 analyze | Level 4+ decide |
|---|---|---|---|---|
| 1 | Definition (term 1) | Situation, "Which word is this?" (1) | Compare card, term 1 vs its confusion | Situation, "Which option fits?" (1) |
| 2 | Match It Up, word to cue (all) | Match It Up (all) | Select All about term 2: its cue and situation vs the confusion's cue and another situation | Compare card, term 2 vs its confusion |
| 3 | Fill in the Blank (5) | Fill in the Blank (5) | Reverse Recall (3) | Match It Up, "Use it when" (all) |
| 4 | Reverse Recall (3) | Reverse Recall (3) | Sort the Buckets (1 to 4) | Situation, "Which option fits?" (3) |
| 5 | Sort the Buckets (1 to 4) | Sort the Buckets (1 to 4) | Catch the Misuse, term 4 wearing its confusion's cue | Select All about term 4 |
| 6 | Catch the Misuse (4) | Situation (4) | Situation (5) | Catch the Misuse (5) |
| 7 | Type the Term (2) | Type the Term from a situation (2) | Type the Term from a situation (5) | Type the Term from a situation (4) |

Review: one Reverse Recall per term, drawn only for terms still short of mastery. Power Play: the five examples with their words blanked, as one paragraph (one Power Play, one paragraph, all five words). The right answer's position rotates by level. Feedback is built from each term's own copy, and when the term has a `confusion` the wrong-answer line names it ("Not Tailwind: that is wind pushing from behind"), which is the SOP's "identify exactly what was wrong". Live proof of all four recipes: `/play/glossary/software?lesson=1` to `lesson=4`; `&q=N` jumps to question N.

## Presentation the generator relies on

- A generated industry has no term art. The engine treats a lesson without art like Levels 2+: words-only teach cards, initials in the HUD tokens and on the relics, no pictures on match, sort or card backs.
- Dreamy's poses and reactions, the reward, the Power Play board and the Complete screen are shared by every industry and both themes.
- The Levels map needs no level art: every card wears a scene plate painted from the theme's sky (Drift by tier and level, Signal a skyline slice per level), and the selected card opens in place with its goal, words and Play button.
- The welcome scene's illustration (the sneaker shop) is Investment Banking's own. A glossary without welcome art gets Dreamy alone, facing the copy.
- The value meter reads "`company` value" and the intro reads "`subject` words".

## Level 1 art for X (ChatGPT prompt)

Only Level 1 of an industry gets pictures, and only if they clearly help (Joshua, 15 Oct 2026). The finance pictures were made with ChatGPT's image generation (Codex session, `docs/reference/glossary-finance-art-oct13.json`). Reuse that exact prompt; only the subject brief changes. Make one image per term per theme, Drift and Signal, 1024 px square, transparent.

Attach three existing Level 1 images of the same theme as references (Drift: `public/images/glossary/themes-oct08/drift/company.webp`, `customer.webp`, `profit.webp`; Signal: `public/images/glossary/signal/building.webp`, `cloud-sale-sneaker.webp`, `coins-320.webp`), then send:

```
Use case: stylized-concept.
Asset type: one isolated Dreamari glossary illustration for flashcards, matching, buckets and mastery HUD.
Generate a NEW subject, using the attached Level 1 images as STYLE and CHARACTER references only. Do not edit or reproduce their subjects.
Subject: {{SUBJECT}}
Composition: one coherent centered object cluster on genuinely transparent alpha, square 1024px canvas, occupy about 82% of canvas, 8-10% clear margin, no clipping, balanced silhouette. Readable at 48px and attractive at 200px. Main semantic cue must stay legible, limit incidental details. No background scene, no ground rectangle, no tile/card frame, no UI. No letters, words, numbers, formulas, logo, watermark or text. Labels and exact maths are rendered by the application, never in art.
Character lock: If Dreamy is called for, use the reference's SAME floating cloud silhouette, white/cyan lobes, large deep navy glassy star eyes and small blue mouth. Never arms, hands, feet, legs, torso, humanoid body, another person/animal, or object held in a hand. Props float beside Dreamy, never become limbs. If the subject brief does not call for Dreamy, do not add a character.
STYLE: {{STYLE}}
No generic stock clipart, irrelevant props, photoreal people, blurry text, excessive sparkles or tiny decorative clutter. Preserve the reference's visual identity while making the specified meaning clear.
```

`{{STYLE}}` for Drift:

```
Match the supplied Drift Level 1 artwork exactly: premium sculpted 3D illustration, satin sky-blue and deep navy with ivory and restrained metallic gold, polished molded forms, soft bevels, believable depth and small clean studio highlights. Lighting soft from upper left, darker navy undersides, subtle contact shadows only between objects. Not clay/plastic toy lumps, not flat vector, not pixel art, not painterly. Three-quarter frontal view for objects, original frontal floating cloud. Gold/cyan semantic arrows must have the same tactile material as the objects.
```

`{{STYLE}}` for Signal:

```
Match the supplied Signal Level 1 artwork exactly: authentic carefully drawn 2D pixel-art game sprite, dark navy stepped pixel outlines, visible square pixel clusters, clean 3-4 tone cel shading, cyan/white/blue with gold accents and tiny amber details. Logical sprite resolution around 128x128, enlarged with nearest-neighbor; no antialiasing, no smooth curves, no blur, no 3D renderer, no gradients, no clay or photographic shine. Maintain the reference's crisp graphic construction and pixel Dreamy's cloud identity. Objects and arrows use the same pixel grid.
```

`{{SUBJECT}}` is one or two sentences per term that show the meaning, not the word. The finance ones are in the JSON above; for example, Investor: "Dreamy floats beside a short curved arrow directing a single gold coin toward a miniature sneaker boutique. This shows a person committing money to a business, not buying a shoe." Write the industry's company into it the same way.

Then register the finished files: export each as `<term-slug>.webp` (Drift, plus `-256`), `<term-slug>-320.webp` (Signal) under `public/images/glossary/<industry>-<date>/{drift,signal}/`, and add the industry's example career to `CAREER_TERM_ART` in `src/components/glossary/termArt.ts` with the version folder and the term-to-slug map. The engine shows the pictures on Level 1 and nowhere else.

## The Master Scaling Plan SOP, and what it changed here (16 Oct 2026)

Joshua's "Dreamari Glossary Game Master Scaling Plan" (PDF, 22 pages) was read against this system and his Finance levels. Verdict: it fits. Its executive rules were already true of the engine (no timers anywhere; one Dreamy per screen, the cloud itself; one Power Play paragraph; no nested Step counters; Finance hand-authored and untouched), and its scaling rules are now enforced by the generator rather than left to the author:

| SOP rule | Here |
|---|---|
| Three architectures (continuous story, scenario thread, practice world) | `mode` on the blueprint. A practice world's examples need not name the anchor. |
| Difficulty progresses recognize, apply, analyze, decide | the four recipes above, by level number or `focus` |
| Context line about 12 words, answers usually 7 | `situation` 12 words and 72 characters, `cue` 7 words, validated |
| No answer leakage | a definition may not say its own word (Reverse Recall reads it aloud); a situation may not say its word |
| Wrong-answer feedback names exactly what was wrong | `confusion` per term; the misuse distractor and the correction use it |
| No forced math | numbers in copy fail validation unless the level sets `math: true` (the team's decision, in the file) |
| No forced images | unchanged: Level 1 art only, registered by hand in `termArt.ts`; everything else is words |
| Interaction diversity, 7 to 10 interactions, every term introduced then applied | asserted by `scripts/qa/glossary-blueprints.test.mjs` on every registered blueprint |
| Section 8 fields (world_mode, world_anchor, student_role, level_goal, student_definition, common_confusion, applied_example, visual_useful, power_play) | `mode`, `company`, `studentRole`, `goal`, `definition`, `confusion`, `example`, the `termArt.ts` registration, the generated paragraph. `question_type`, `question_term_ids`, `feedback_*` and `story_state` are not stored per lesson: the recipe is the stored structure, reviewed once in code, and `intro` per level carries the story. |

Where this system deliberately differs from the SOP: the PDF calls each of its 50 industries a "Glossary World"; here those are **industries** under the 15 career worlds, which own the look. The SOP's "the Dreamari team decides" for images and math is a flag in the blueprint file (`termArt.ts` registration, `math: true`), so the decision is visible in review and not left to a generator.

Progress: only a continuous story has a company whose value grows, so only that mode shows the dollar meter and `unlocks` on the Levels map. A scenario thread or a practice world shows the level's milestone in words with "Level n of N" (the SOP's `level_goal`), on the intro, the complete screen and the map. Open: the hub card has no cover art for an industry no catalog career owns (Kitchen Terms shows the plain card).

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
| 10 | Software Engineering (built, `/play/glossary/software`, 4 levels) | continuous_story | Tech & Engineering |
| 11 | Cybersecurity | scenario_thread | Tech & Engineering |
| 12 | Data Science & Analytics | continuous_story | Tech & Engineering |
| 13 | Artificial Intelligence & Machine Learning | continuous_story | Tech & Engineering |
| 14 | Product Management & UX | continuous_story | Tech & Engineering |
| 15 | Electrical & Computer Engineering | scenario_thread | Tech & Engineering |
| 16 | Mechanical Engineering | scenario_thread | Tech & Engineering |
| 17 | Civil Engineering & Construction Management | continuous_story | Building & Construction |
| 18 | Architecture | continuous_story | Building & Construction |
| 19 | Registered Nursing (built, `/play/glossary/nursing`, 2 levels) | scenario_thread | Health & Medicine |
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
| 33 | Airline Pilot & Flight Operations (built, `/play/glossary/aviation`, 3 levels) | scenario_thread | Driving, Flying & Shipping |
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
| 47 | Culinary Arts (built, `/play/glossary/culinary`, 2 levels) | practice_world | Food & Cooking |
| 48 | Cosmetology & Barbering | practice_world | Personal Care & Community Services |
| 49 | EMT & Paramedic | scenario_thread | Health & Medicine |
| 50 | CNA & Medical Assistant | scenario_thread | Health & Medicine |

## Where every piece is documented

Component Lab, group "Glossary game, live engine (Drift and Signal)": the 14 world design systems, every live piece in both themes and all of its states, with a generated-industry specimen beside the authored one. The older group "Glossary game (retired engine, unrouted)" documents the first engine and stays for archaeology.

## Not done

- A sheet importer (xlsx to blueprint); the blueprint file is the import format.
- Chapter names for generated industries come from the blueprint, not from the levels.
- Phone-width and light-mode passes on generated industries.
- Levels 3 and 4 copy for Nursing and Culinary, Level 4 for Aviation (roadmap words are in each blueprint).
