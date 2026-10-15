# Glossary Games as a system: worlds, industries, generated levels

Current state, 16 October 2026. For Usman and any agent working for him. The goal: "create a glossary game for X" is one file and one registry line, and everything else, levels, games, look, hub card, just works.

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

Every world already has a row in `WORLD_SYSTEMS`. The Component Lab group "Glossary game, live engine" shows all 14 under "World design systems", with a World picker that re-themes every specimen.

## Create a glossary game for X (agent runbook)

1. **Pick the industry and its world.** Industry slug is lowercase letters and dashes (it is the route). World is an exact `WORLD_COLORS` key.
2. **Write the blueprint** at `src/components/glossary/blueprints/<slug>.ts`, copying `blueprints/health.ts`:
   ```ts
   export const X_GLOSSARY: GlossaryBlueprint = {
     industry: { slug: "aviation", title: "Flight Terms", subject: "aviation", world: "Driving, Flying & Shipping" },
     exampleCareerSlug: "airline-pilot",      // the hub card and cover that introduce it
     company: "Skyline Air",                  // the one story every example names
     idPrefix: "AV",                          // lesson ids AV-L01, AV-L02...
     chapters: [{ number: 1, name: "...", tier: "Beginner" }, ...],
     levels: [
       { number: 1, title, tier, goal, unlocks, milestone, nextMilestone, companyValue, nextCompanyValue,
         terms: [ { term, definition, example, cue, formula?, icon? } x 5 ], facts?, intro? },
       { number: 2, ...terms... },
       { number: 3, title, tier, goal, unlocks, milestone, nextMilestone, companyValue, nextCompanyValue, words: [five words] },  // roadmap only
     ],
   };
   ```
   Copy rules: eighth grade, one idea per sentence, every example names the company and says its own term (it becomes the blank), no dashes. `validateBlueprint` throws at import with every problem it can see.
3. **Register it** in `GLOSSARY_INDUSTRIES` (`src/components/glossary/data.ts`): `aviation: buildGlossaryCareer(X_GLOSSARY),`.
4. **Map its careers** in `CAREER_INDUSTRY` (`industries.ts`) if the world has more than one glossary or the career's world is not inferable; otherwise skip.
5. **Hub card:** add to `GLOSSARY_GAMES` in `src/components/play/games.ts` if not already listed (Finance, Medical, Flight and Tech are). `hasGlossary()` turns the card playable by itself.
6. **Check:** `npx tsc --noEmit`, `node scripts/qa/dreamy-reactions.test.mjs`, then open `/play/glossary/<slug>?theme=drift` and press the DEMO-ONLY Skip through Level 1 (14 presses), then the same with `?theme=signal`.
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
| level title | 30 | the HUD and the Levels map |
| level goal | 48 | the welcome line |

Inside those limits the engine's own rules hold: a long term scales down on the teach card instead of overflowing (`--term-chars`), HUD labels and relic captions wrap to two lines and never cut mid-glyph, tiles, chips and bubbles break long words, a Power Play slot grows to the length of its answer, and every card clips at its edge. Dreamy is never clipped by a column (the main column overflows; the Drift slot is inset by the atlas margin). Screens never scroll: FitToScreen scales a screen to its room.

## What the generator produces per level

Level 1 of Investment Banking is the recipe, in its order:

| # | Kind | Credits | Built from |
|---|---|---|---|
| 1 | Definition | term 1 | the definition against three other terms' definitions |
| 2 | Match It Up | all five | word to cue |
| 3 | Fill in the Blank | term 5 | the example with the word blanked, four words as tiles |
| 4 | Reverse Recall | term 3 | the definition, which word |
| 5 | Sort the Buckets | terms 1 to 4 | cues into their words |
| 6 | Catch the Misuse | term 4 | three true "word = cue" pairs and one swapped |
| 7 | Type the Term | term 2 | spell the word for its definition |

Every term is credited at least twice, so mastery (two credits) is reachable in the main loop. Review: one Reverse Recall per term, drawn only for terms still short of mastery. Power Play: the five examples with their words blanked, as one paragraph (one Power Play, one paragraph, all five words). The right answer's position rotates by level. Feedback copy is built from each term's own definition and example.

## Presentation the generator relies on

- A generated industry has no term art. The engine treats a lesson without art like Levels 2+: words-only teach cards, initials in the HUD tokens and on the relics, no pictures on match, sort or card backs.
- Dreamy's poses and reactions, the reward, the Power Play board and the Complete screen are shared by every industry and both themes.
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

## Where every piece is documented

Component Lab, group "Glossary game, live engine (Drift and Signal)": the 14 world design systems, every live piece in both themes and all of its states, with a generated-industry specimen beside the authored one. The older group "Glossary game (retired engine, unrouted)" documents the first engine and stays for archaeology.

## Not done

- A sheet importer (xlsx to blueprint); the blueprint file is the import format.
- Chapter names for generated industries come from the blueprint, not from the levels.
- Phone-width and light-mode passes on generated industries.
