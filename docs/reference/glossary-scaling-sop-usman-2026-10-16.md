# Dreamari Glossary Games: Master SOP and Prompts for Usman and Codex

_17 October 2026. One document to scale the glossary games from four industries to fifty: the rules (Joshua's), what is built and verified, the prompts an agent pastes to create a game, and the prompts Codex pastes to generate every image. Repo copies: docs/reference/glossary-scaling-sop-usman-2026-10-16.html and the same text as docs/reference/glossary-scaling-sop-usman-2026-10-16.md. The locked engineering spec is docs/handoff/specs/glossary-system.md. Joshua's plan in full is Appendix A of this document. The separate, self-contained Codex prompt for the three Play tab games is docs/reference/codex-prompt-glossary-art-2026-10-16.md and its own Google Doc._

## 0. Readiness, checked 17 October 2026

| Check | Result |
|---|---|
| Live on main | Everything in this document is on main. Mastery shows as a count and five anonymous segments; Signal's scene cards use Signal's frame; the Play tab's four glossary cards carry Chandu's thumbnails; Next level keeps the student's theme; Dreamy's speech bubble wraps on whole words at phone width. |
| Type check, lint | tsc clean. ESLint: no errors in the glossary code (two pre-existing unescaped-entity errors live in src/app/gate/page.tsx). |
| Blueprint QA script | All generated industries pass (190 screens across 22 levels: 31 cases, 13 sorts, 18 select-alls; feedback median 42 characters, longest 90; longest Level 1 Power Play 188 characters): no sentence over 14 words, feedback short, Power Play within its level's size, seven to ten screens plus a Power Play per level, no three of one screen shape in a row, at least four shapes per level, every term credited twice, no answer leakage, no line of copy shown twice in a lesson, Reverse Recall only in the review, Power Play blanks never in order, all four recipes exercised. |
| Validator negative test | A deliberately broken blueprint (bad slug, unknown world, definition saying its word, 14-word moment, two moments the same, 8-word cue, example without the anchor, unknown confusion, numbers without math) is refused with thirteen specific reasons and does not build. It is also a live specimen in the Component Lab. |
| Dreamy reactions QA | Passes: twelve Drift poses, four Signal reactions, asset budget, silhouettes. |
| Walkthroughs | Nursing Level 1 in Drift and Software Level 5 in Signal played end to end with Skip (welcome, cards, questions, streak, Power Play, Complete, next level) with no console errors from the game. After the 17 Oct rewrite: Culinary Level 3 (compare card, wet and dry heat sort, three-step case, Select All, shuffled Power Play bank) in Drift, Software Level 5 case and sort in Signal, and the Level 1 Power Plays of Aviation and Nursing at phone width, each now five short lines. |
| Component Lab | "Glossary game, live engine" documents every piece in both themes with every state, the edge cases (22-character term, acronym, 110-character definition, 72-character moment, two-word options, long feedback) and the error state (a broken blueprint through the validator, the unknown-route 404, the hub release list). |
| Design systems | All fifteen career worlds have a design system row; a blueprint naming any world works. |
| Routes | /play/glossary/<industry> and /play/glossary/<career> resolve; /play-tools/glossary-qa lists every registered glossary (hamburger menu, Glossary QA). Unknown slugs 404. |
| Hub gating | Only finance is released; generated industries play by route and from the QA page. Release is one slug in GLOSSARY_HUB_RELEASED. |
| Demo flags | Every demo-only piece is tagged DEMO-ONLY in its own comment (blueprints, QA page, release list, Skip). |
| Built so far | Finance (Joshua's, 4 of 20 levels). The three other Play tab cards are complete at six playable levels each: Software Engineering (Tech Terms), Flight Operations (Flight Terms), Nursing (Medical Terms). Culinary Arts has four (not on the hub) and is the model blueprint. All four were rewritten on 17 Oct to the Finance style: three moments per word, concept sorts, cases, written Power Plays, then trimmed to the reading rules. |
| Not yet | No generated industry has its Level 1 term art or welcome illustration (Codex, section 6 and the separate prompt). No plates, panoramas or silhouettes registered (optional). Light-mode pass on generated industries. Levels 5 and 6 for Culinary. |

## 1. Who does what

| Role | Owns | Pastes |
|---|---|---|
| Joshua | The rules: the Master Scaling Plan. Finance never changes. | Nothing; reviews. |
| Usman's agent (Claude Code or Codex in the repo) | Blueprints: one file per industry, registered. Levels 5 and 6 later. | Prompt A, Prompt B. |
| Codex (image generation) | Every image: Level 1 term art and the welcome illustration for each industry (required), plates, world panoramas, silhouettes (optional), Dreamy animation. | Prompt D and the section 6 prompts; for the three Play tab games, the separate Codex prompt document. |
| Chandu | Browser QA on the Glossary QA page; release to the hub (Prompt C). | Prompt C. |

## 2. The rules on one page

| Rule | What it means for a new game | Enforced by |
|---|---|---|
| Finance stays exactly as it is | Nothing here touches Finance. | Finance is hand-authored and never passes through the generator. |
| No timers | No countdown, count-up or timed questions. | The engine has none. |
| No forced images | Level 1 of every industry gets pictures (team decision). Levels 2 and up are words only. A card shows generated art or nothing, never an icon. | Engine. |
| No forced math | Numbers only where the job's words naturally carry them. | Validator: numbers fail unless the level sets math: true. |
| Three architectures | continuous_story (one company grows), scenario_thread (same workplace, new situation each level), practice_world (varied drills, no plot). Pick from the table in section 9. | Blueprint mode. |
| Difficulty ladder | Level 1 recognize, 2 apply, 3 analyze (tell confusable words apart), 4 decide. | Generator recipes by level number. |
| Five terms per level, four levels minimum | 20 terms to launch; Levels 5 and 6 can be roadmap words. | Validator. |
| 7 to 10 interactions, one Power Play | Seven derived screens plus the level's authored cases, sort and Select All as extras, then one paragraph with five blanks. | Generator, QA script. |
| Copy length | Definition 110 characters, example 120, cue 34 characters and 7 words, each moment 72 characters and 12 words, sort item 34, Select All line 44, case step 80, feedback 90 and two sentences, term 22, title 30, goal 48. | Validator. |
| Short and plain (added 17 Oct) | Every sentence a student reads is 14 words at most, feedback included. A level's copy reads at grade 8 or below, not counting its own five words. Chandu: "make sure every piece of copy including success explanations etc are shorter and 8th grade comprehension level." | Validator (sentences, feedback, a Flesch-Kincaid grade per level) and the builder (generated feedback). |
| Power Play grows with the level (added 17 Oct) | Level 1: 200 characters, five sentences, one blank each. Level 2: 240, five sentences, one blank each. Levels 3 and 4: 290, six sentences. Levels 5 and up: 330, six sentences. Chandu: "make sure the power play isnt so complex and long and a lot to read for level 1." | Validator. |
| Answer leakage | A definition never says its word; neither does a cue, a moment, a Select All line, a case step or the Power Play paragraph. | Validator. |
| No screen repeats a line (added 17 Oct) | Every word carries three moments and each is shown once. The definition is seen on the teach card and in the review only. Sorts put concrete things into concept buckets, not cues into words. Chandu: "the games are repeating the same questions again and again for mastery instead of having any variety, please refer the finance glossary games." | Validator (no duplicate lines in a level) and the builder (no line shown twice in a lesson). |
| Power Play is not linear (added 17 Oct) | The paragraph's blanks never run in teaching order, and the word bank is shuffled so it never mirrors the blanks. | Validator refuses 1 to 5; the engine shuffles the bank. |
| Review is a new form | Reverse Recall (the definition read aloud) appears only in the review, for words still short of mastery, so the student never sees the same screen twice. | Generator. |
| Wrong-answer feedback names what was wrong | Each term names the word it is confused with. | Generator uses confusion. |
| Eighth grade, no dashes | Short words, one idea per sentence, two sentences instead of a dash. | Validator: dashes, 14-word sentences and a grade 8 cap per level. |
| One Dreamy per screen, the cloud itself | Never draw Dreamy, limbs or people into any image. | Engine; image brief. |
| Every example names the anchor | In a continuous story or scenario thread, each example sentence names the company or place. Not required in a practice world. | Validator. |

## 3. Prompt A: create a glossary game for X

Paste to an agent working in the Dreamari repo, replacing the two bracketed lines. The agent writes one file, registers one line, runs three checks and stops. It does not generate images and does not push.

```
You are working in the Dreamari prototype repo. Pull origin/main first. Read docs/handoff/specs/glossary-system.md before writing anything.

TASK
Create the glossary game for: [INDUSTRY, e.g. "Cybersecurity"]
Notes from Chandu, if any: [optional]

STEP 1. Look the industry up in the 50-industry table in docs/reference/glossary-scaling-sop-usman-2026-10-16.html (section 9). Take its mode (continuous_story, scenario_thread or practice_world) and its career world (an exact WORLD_COLORS key). Choose a slug: lowercase letters and dashes, it becomes the route /play/glossary/. Choose an anchor: one company, clinic, airline, shop or site that every level returns to (practice worlds may use it loosely). Choose the student's role in one word.

STEP 2. Write src/components/glossary/blueprints/.ts by copying the model blueprint culinary.ts (every authored piece in use) and the blueprint with the same mode: software.ts (continuous story), aviation.ts (scenario thread), culinary.ts (practice world). Keep the header comment pattern (DEMO-ONLY content, why, the anchor). Author four playable levels and two roadmap levels, or all six if asked:
- Every playable level: five terms, each with term, definition, example, cue, icon and moments (exactly three).
- Levels 3 and up: a confusion on every term, naming another term in the same level.
- Every playable level: a written powerPlay (intro and paragraph).
- Every level 2 and up: one or two cases. Levels 3 and 5: an authored sort into concept buckets. Anywhere it is natural: an authored selectAll.
- Roadmap levels: title, tier, goal, milestone, nextMilestone, companyValue, nextCompanyValue and five words only.
- Chapters: three, Beginner, Intermediate, Advanced.
- Tiers: Levels 1 and 2 Beginner, 3 and 4 Intermediate, 5 and 6 Advanced. Company values 10000, 50000, 120000, 250000, 500000, 1000000. In a continuous story also set unlocks ("$10K", "$50K", "$120K", "$250K", "$500K", "$1M"); other modes omit unlocks.
- An intro on Levels 2 and up: headline, one line, one hook. One or two facts per level.

WHAT EACH FIELD IS FOR (so the copy lands on the right screen)
- definition: the teach card, and the review question that reads it aloud. Never says the word.
- example: the teach card. Says the word once, names the anchor (not required in a practice world).
- cue: a label of 7 words and 34 characters, never says the word. The match card's right side, a "word = cue" quick-check pair, a compare card point, and the line every feedback is built from ("Dice means small even cubes.").
- moments: three different real situations, 12 words and 72 characters each, that show the word WITHOUT saying it. Each one is shown on exactly one screen: a story card ("Which word is this?"), a fill-in sentence (the moment then "That is ___."), a Select All line, a sort token, a Type the Term prompt or a compare card. Write three that differ in setting, not three rewordings.
- confusion: the exact term string of another word in the same level. Drives the compare card, the quick-check distractor and the "Poach is gentle heat in still water." correction.
- sort: a prompt, 2 to 4 concept buckets (think Finance's "Money in / Money out", "Stock / Bond"; for a kitchen "Wet heat / Dry heat"), 4 to 7 concrete items of 34 characters with the bucket and the term each credits. Items never say a bucket name.
- selectAll: the term, a prompt, exactly 4 concrete items of 44 characters that never say the term, 1 to 3 correct indexes (Finance: "Select every cost." over Materials, Rent, Wages, Sales).
- cases: up to two per level. A scene line (72 characters), 2 to 4 steps, each a prompt of 80 characters with 2 or 4 options of 34 characters; a step never says its own answer; terms lists the words it credits (Finance: "Which helps Dream Sneakers keep more money?" then "What could improve?").
- powerPlay: intro (one short line) and one short paragraph that uses {1} to {5} exactly once each, where {n} is the nth term in teaching order. The blanks must NOT appear in the order 1, 2, 3, 4, 5. The paragraph never says any of the five words. Name the anchor once. It reads as one connected scene, not five sentences stapled together. Size by level: Level 1 is 200 characters and five sentences with one blank each (five plain lines a 12-year-old gets on first read); Level 2 is 240, five sentences, one blank each; Levels 3 and 4 are 290, six sentences; Levels 5 and 6 are 330, six sentences. The anchor may be left out of Level 1 to save room.
- feedback (on a case, a sort or a Select All): 90 characters and two sentences at most, about 60 is right. One sentence that says what is right, and at most one that says why. Never list every item.

COPY RULES (the validator refuses a file that breaks the measurable ones)
- Eighth grade or lower. Short words. One idea per sentence. Say each fact once. No dashes of any kind.
- Every sentence is 14 words at most: definitions, examples, moments, case steps, intros, facts, the Power Play and every feedback line. The validator also scores each level's copy and refuses anything above grade 8.
- No digits, $ or % anywhere in a level's copy unless that level sets math: true, and only when the job's words naturally use numbers. Spell small numbers out.
- No line of copy may appear twice in a level: every moment, cue, sort item, Select All line, case scene and case step is a different line.
- icon: a lucide icon slug (lowercase, dashes). It is only used on the Levels map until plate art exists; it is never shown on a flashcard or in the mastery bar.
- Level title 30 characters, goal 48.

STEP 3. Register: in src/components/glossary/data.ts add `: buildGlossaryCareer(_GLOSSARY),` to GLOSSARY_INDUSTRIES and the import. If a catalog career should open this glossary, map it in CAREER_INDUSTRY in src/components/glossary/industries.ts and set exampleCareerSlug in the blueprint. Do NOT add the slug to GLOSSARY_HUB_RELEASED; release is Chandu's step.

STEP 4. Check, all three must pass:
npx tsc --noEmit
node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-blueprints.test.mjs
node scripts/qa/dreamy-reactions.test.mjs
Then start the dev server (npm run dev -- --webpack), open /play/glossary/?theme=drift and press the top bar's Skip through Level 1 (about 14 presses), and again with ?theme=signal. Open ?lesson=2&q=1, ?lesson=3&q=1, ?lesson=3&q=3 (the sort) and ?lesson=4&q=1 in Drift, and the case screen of each level. Then play one level without Skip and get two answers wrong on purpose: the review screens that follow must read as new questions. Take a screenshot of each.

STEP 5. Write the art list for Codex as a short block in your final message: the slug, the anchor, and the five Level 1 terms each with its definition (Codex turns these into image briefs; see the SOP section 6).

STEP 6. Add a dated entry to docs/AI_HANDOFF.md (what, why, what you checked). Commit with the why in the message. Do not push.

Done looks like: the blueprint file exists and validates, the industry appears on /play-tools/glossary-qa with its playable levels, screenshots attached, the art list written, one commit, nothing pushed.
```

## 4. Prompt B: add Levels 5 and 6 to an existing industry

```
You are working in the Dreamari prototype repo. Pull origin/main. Read docs/handoff/specs/glossary-system.md.

TASK: turn the roadmap Levels 5 and 6 of src/components/glossary/blueprints/[slug].ts into playable levels. Keep the five words each level already lists unless one cannot be written within the rules; then swap it and say why. Both levels are Advanced and use the decide recipe by default, so every term needs definition, example, cue, icon, three moments and a confusion, and each level needs a written powerPlay, one or two cases and (Level 5) an authored sort. Follow the copy rules exactly as in Prompt A. Run the three checks, open ?lesson=5&q=1 and ?lesson=6&q=1 in both themes, screenshot, write the handoff entry, commit, do not push.
```

## 5. Prompt C: release an industry to the Play hub (Chandu, after QA)

```
In the Dreamari repo: add "[slug]" to GLOSSARY_HUB_RELEASED in src/components/glossary/data.ts. If the hub has no card for it, add one to GLOSSARY_GAMES in src/components/play/games.ts keyed to its example career slug (or the industry slug when no catalog career owns it) with title "[Subject] Terms", sub "Learn key [subject] terms" and a cover (a 1400 by 788 WebP thumbnail: Dreamy over a fan of the subject's term cards, matching the four on the hub). Confirm Codex has registered its Level 1 term art (termArt.ts) and welcome illustration (welcomeArt.ts). Run npx tsc --noEmit, open /play and confirm the card is playable, commit with the why, push to main.
```

## 6. Images (Codex)

Codex generates every image. Nothing in Usman's game-creation work waits on images: a game plays with words the moment it is registered. Required before release: 6.1 and 6.2. Optional, shared polish: 6.3 to 6.5. 6.6 is animation. For the three Play tab games that exist today, use the separate Codex prompt document, which carries every term and anchor already filled in.

### 6.1 Level 1 term art (required: 5 terms, both themes)

The repo has a reproducible pipeline for this: docs/handoff/play-sop/12-glossary-art-pipeline.md and scripts/glossary-art.mjs. The input is a manifest JSON; the model is docs/reference/glossary-finance-art-oct13.json. The script prints the exact prompts, then packages, validates and previews the finished images. Flow:

1. Write docs/reference/glossary-<slug>-art-<mmmdd>.json: version (folder name, lowercase and dashes, e.g. "nursing-oct17"), career (the slug), styleReferences (the three Drift and three Signal reference files below), promptTemplate (the prompt below), styles (the two style locks below), terms (five entries: id = the exact term, slug = lowercase file name, brief = one or two sentences that show the meaning, not the word, with the anchor written in).
2. node scripts/glossary-art.mjs prompts <manifest> prints one prompt per term per theme with the reference paths. Generate ONE image per call in ChatGPT, attaching the references. Never chain off the last image; return to the references every time.
3. Save the generated images into a review folder named <term-slug>-drift.png and <term-slug>-signal.png. node scripts/glossary-art.mjs prepare <manifest> <review-folder> writes the WebP sizes under public/images/glossary/<version>/{drift,signal}/. Then validate and preview with the same script.
4. Register: add the industry's example career (or the industry slug) to CAREER_TERM_ART in src/components/glossary/termArt.ts with the version folder and the term-to-slug map. The engine shows the pictures on Level 1 and nowhere else.

References to attach. Drift: public/images/glossary/themes-oct08/drift/customer.webp (character), company.webp (object and materials), profit.webp (currency). Signal: public/images/glossary/signal/cloud-sale-sneaker.webp, building.webp, coins-320.webp.

The prompt (promptTemplate; {{SUBJECT}} is the term's brief, {{STYLE}} is the theme's lock):

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

Drift style lock:

```
Match the supplied Drift Level 1 artwork exactly: premium sculpted 3D illustration, satin sky-blue and deep navy with ivory and restrained metallic gold, polished molded forms, soft bevels, believable depth and small clean studio highlights. Lighting soft from upper left, darker navy undersides, subtle contact shadows only between objects. Not clay/plastic toy lumps, not flat vector, not pixel art, not painterly. Three-quarter frontal view for objects, original frontal floating cloud. Gold/cyan semantic arrows must have the same tactile material as the objects.
```

Signal style lock:

```
Match the supplied Signal Level 1 artwork exactly: authentic carefully drawn 2D pixel-art game sprite, dark navy stepped pixel outlines, visible square pixel clusters, clean 3-4 tone cel shading, cyan/white/blue with gold accents and tiny amber details. Logical sprite resolution around 128x128, enlarged with nearest-neighbor; no antialiasing, no smooth curves, no blur, no 3D renderer, no gradients, no clay or photographic shine. Maintain the reference's crisp graphic construction and pixel Dreamy's cloud identity. Objects and arrows use the same pixel grid.
```

Writing a brief: show the meaning, never the word; put the anchor in; name the one thing the eye must read first. Example from Finance, Investor: "Dreamy floats beside a short curved arrow directing a single gold coin toward a miniature sneaker boutique. This shows a person committing money to a business, not buying a shoe." Example for Nursing, Triage: "Three small patient beds in a row at Riverside Clinic, one lit with a bright gold tag and pulled slightly forward, the other two dim and waiting. This shows the most urgent patient being chosen first."

### 6.2 Welcome illustration (required: 1 per theme)

One composed scene of the workplace the glossary lives in, never a person: the clinic front, the hangar and tower, the kitchen pass, the software studio. 1024 square, transparent, one readable silhouette; it shows at about 300 px beside Dreamy on the welcome screen. Use the 6.1 prompt with Asset type "one Dreamari welcome illustration: the workplace this glossary lives in, seen as a small composed scene" and Subject "{{the anchor}}: {{two sentences describing the place, no people}}", with the theme's style lock. Files: public/images/glossary/<version>/{drift,signal}/welcome.webp. Register in WELCOME_ART[industrySlug] in src/components/glossary/welcomeArt.ts with both theme paths.

### 6.3 Scene plates for the Levels map (optional, six strips cover everything)

Until registered, the map shows each level's first term icon on the world accent. Strips scale by tier and theme: six files cover all fifty industries. 1536 by 512 WebP, opaque, horizon in the lower third, nothing important within twelve percent of any edge, no text, no Dreamy, no single focal object; even detail across the width (the engine crops a slice per level from a phone thumbnail to the open card). Files under public/images/glossary/plates/ named drift-beginner, drift-intermediate, drift-advanced, signal-beginner, signal-intermediate, signal-advanced (.webp). Register in PLATES[theme][tier] in src/components/glossary/levelPlates.ts; two or three strips per tier add variety for free.

| Strip | Scene brief |
|---|---|
| drift-beginner | Dawn. Warm low sun, long soft clouds, a calm horizon glow. |
| drift-intermediate | Full day. High sun, bright sky, scattered sculpted clouds. |
| drift-advanced | Night. Moon, deep navy, thin high clouds, a faint band of stars. |
| signal-beginner | Pixel city at sunrise, a few windows still lit, pink and amber sky. |
| signal-intermediate | Pixel city at midday, cyan sky, traffic and cranes. |
| signal-advanced | Pixel city at night, lit towers, dark sky with a few stars. |

```
Use case: environment backdrop.
Asset type: one wide Dreamari scene plate for the Levels map, used as a cropped background strip behind level titles.
Scene: {{SCENE BRIEF}}
Composition: 1536 by 512 landscape, horizon in the lower third, even detail across the full width, no single focal object, nothing important within 12% of any edge. No text, letters, numbers, logos or UI. No character, no Dreamy. Opaque background, no transparency.
STYLE: {{the theme's style lock from 6.1}}
Keep the reference's palette and material identity. Readable as a strip at 90 by 44 pixels and attractive at 540 by 90.
```

### 6.4 Signal world panoramas (optional, one per career world, fifteen at most)

The game's sky in Signal. One 1200 by 800 pixel panorama per career world, opaque, horizon in the lower third, a readable skyline across the middle band, a dark quiet lower band, nothing important within ten percent of the left and right edges, no text, no Dreamy. The engine tiles it in mirrored pairs (edges never need to match), crops three parallax bands and slices it for the Levels map plates. Files: public/images/glossary/backdrops/signal/<world-slug>.webp. Register in SIGNAL_WORLD_BACKDROPS in src/components/glossary/worldBackdrops.ts. Start with the worlds that have a glossary: Tech & Engineering, Driving, Flying & Shipping, Health & Medicine, Food & Cooking. Attach the three Signal references and the current panorama public/images/glossary/signal/bg.webp.

```
Use case: game backdrop.
Asset type: one wide Dreamari pixel-art panorama for the Signal glossary game, used as a scrolling parallax background and cropped into strips.
Scene: {{WORLD SCENE, e.g. "a hospital campus at dusk: a low clinic with lit windows, an ambulance bay, a water tower, trees"}}
Composition: 1200 by 800, horizon in the lower third, a continuous readable skyline silhouette across the middle band, a dark quiet lower band (water, road or ground), even detail across the width, nothing important within 10% of the left and right edges. No text, letters, numbers, logos or UI. No character, no Dreamy. Opaque.
STYLE: {{Signal style lock from 6.1}}
Match the attached panorama's palette, pixel density and night-to-dusk mood exactly; only the place changes.
```

### 6.5 Drift horizon silhouettes (optional)

Drift is painted and already takes each world's accent; it needs no image. Optional: one flat dark horizon silhouette per world (a clinic roofline, a runway and tower, a kitchen pass), SVG preferred or transparent WebP 1600 by 300, no interior detail, repeatable left to right, no text, no Dreamy. Files: public/images/glossary/backdrops/drift/<world-slug>.svg. Register in DRIFT_WORLD_SILHOUETTES in worldBackdrops.ts. Richer clouds and weather are open for Codex to explore inside the scenery layer (LabMaterialScenery in GlossaryLabGameExperience.tsx): gradients, masks and transforms only, never a filter on an animated layer, and everything must stop under prefers-reduced-motion.

### 6.6 Dreamy expressions (animation)

Chandu's "Dream Expressions V2" pack (19 Drift stills) is at public/images/dreamy/expressions-v2/01.webp to 19.webp. Four are used statically on the Drift Levels map open card: 06 (books, ready to play), 18 (arrow, playing now), 12 (graduation cap, complete), 17 (alert, locked). Animate first, because the game has a slot for each: 10 (green check) for a right answer, 09 (red X) and 14 ("hmm") for a wrong one, 16 (confetti) and 12 for mastery and the complete screen, 15 (glasses and clipboard) for review and hints, 08 (reading) for the teach cards, 18 (arrow) for Next. Deliver the four-frame WebP atlas format described in docs/reference/dreamy-drift-animated-oct15-v2.json so dreamyReactions.ts can take them without engine changes. Signal needs pixel versions drawn to the Signal Dreamy rig.

### 6.7 Hub thumbnails (one per released industry)

The Play tab's glossary cards use a landscape thumbnail: Dreamy over a fan of the subject's term cards on a dark sky, 1400 by 788 WebP, under 130 KB. The four on the hub (Finance, Medical, Flight, Tech) are Chandu's and are the reference. The shelf card is portrait at rest and 16:9 when active, so keep Dreamy and the centre card in the middle third. File: public/images/app/glossary-<subject>-thumb-<mmmdd>.webp, set as cover on the card in GLOSSARY_GAMES.

## 7. Prompt D: Codex, generate and register the art for industry X

```
You are working in the Dreamari prototype repo. Pull origin/main. Read docs/handoff/play-sop/12-glossary-art-pipeline.md and section 6 of docs/reference/glossary-scaling-sop-usman-2026-10-16.html.

TASK: generate and register the required art for the glossary industry [slug] (anchor: [anchor]; Level 1 terms with definitions: [paste the art list from the game-creation agent]).

1. Write the manifest docs/reference/glossary-[slug]-art-[mmmdd].json modelled on docs/reference/glossary-finance-art-oct13.json: version "[slug]-[mmmdd]", career "[slug]", the six style references, the prompt template and both style locks from the SOP, and five terms with id, slug and a brief that shows the meaning without the word and names the anchor.
2. node scripts/glossary-art.mjs prompts  and generate one image per prompt, attaching the three references for that theme every time. Save as -drift.png and -signal.png in a review folder.
3. Also generate the welcome illustration per theme (SOP 6.2) and save as welcome-drift.png and welcome-signal.png.
4. node scripts/glossary-art.mjs prepare  , then validate and preview. Convert the welcome images to public/images/glossary/[version]/{drift,signal}/welcome.webp (1024 square, transparent).
5. Register: CAREER_TERM_ART in src/components/glossary/termArt.ts for the term art; WELCOME_ART["[slug]"] in src/components/glossary/welcomeArt.ts for the welcome.
6. Check: npx tsc --noEmit and node scripts/qa/dreamy-reactions.test.mjs. Open /play/glossary/[slug]?theme=drift and ?theme=signal: the welcome shows the illustration beside Dreamy, Level 1 teach cards show the pictures, Level 2 cards show words only. Screenshot each.
7. Add a dated docs/AI_HANDOFF.md entry (what, why, prompts used, what was rejected and why). Commit; do not push. Chandu reviews, then releases the industry.

Rules that have shipped real bugs: one image per call; never chain off the last image; genuine transparency; no text or numbers in any image; Dreamy is a cloud with no limbs and appears only when the brief says so; Finance's art is never regenerated.
```

## 8. QA and release checklist (Chandu)

1. Open the hamburger menu, Glossary QA. The new industry is listed with its playable levels.
2. Play Level 1 in Drift with Skip, then Level 1 in Signal. Watch for clipped words, odd line breaks, a Dreamy facing away, a dollar meter where a milestone should be, and that the mastery segments fill without pointing at a word.
3. Open Level 3 and Level 4 in Drift and step through every screen with Skip: no two screens may show the same line, the sort must be concrete things into concept buckets, and each case must read as a real call. Then play one level without Skip, miss two answers on purpose, and check the review screens feel new.
4. Read the Power Play paragraph of each level once as a student would. Level 1 should be five short lines.
5. Confirm Codex's Level 1 pictures and the welcome illustration are in place and on style.
6. Release with Prompt C.

## 9. The 50 industries: mode and career world

| No. | Industry | Mode | Career world | Framing |
|---|---|---|---|---|
| 1 | Finance & Investment Banking (built, Joshua's) | continuous_story | Business & Finance | Dream Sneakers. Does not change. |
| 2 | Accounting & Audit | scenario_thread | Business & Finance | Month-end close, reconciliations, statements, controls, audits; same company, different situations. |
| 3 | Entrepreneurship & Venture | continuous_story | Business & Finance | Idea, customers, business model, raise money, hire, grow. |
| 4 | Management Consulting | scenario_thread | Business & Finance | Different client problems: costs, growth, operations, market entry. |
| 5 | Marketing & Brand Management | scenario_thread | Business & Finance | Different campaigns for one brand. |
| 6 | Sales & Business Development | scenario_thread | Business & Finance | A pipeline: qualify, discovery, pitch, objection, proposal, close. |
| 7 | Human Resources & People Operations | scenario_thread | Business & Finance | Recruiting, onboarding, pay, benefits, performance, retention. |
| 8 | Supply Chain & Logistics | continuous_story | Driving, Flying & Shipping | One product from supplier to factory to warehouse to customer. |
| 9 | Law & Legal Services | scenario_thread | Law, Safety & Justice | Rotating client matters: contracts, evidence, discovery, litigation. |
| 10 | Software Engineering (built) | continuous_story | Tech & Engineering | One app from requirements to release. Nova Notes. |
| 11 | Cybersecurity | scenario_thread | Tech & Engineering | One organization through security events: access, phishing, malware, response. |
| 12 | Data Science & Analytics | continuous_story | Tech & Engineering | Question, data, cleaning, analysis, model, recommendation. |
| 13 | Artificial Intelligence & Machine Learning | continuous_story | Tech & Engineering | One AI system: data, training, model, evaluation, bias, deployment. |
| 14 | Product Management & UX | continuous_story | Tech & Engineering | One product: research, pain point, prototype, testing, launch. |
| 15 | Electrical & Computer Engineering | scenario_thread | Tech & Engineering | Circuits, components, signals, measurement, troubleshooting. |
| 16 | Mechanical Engineering | scenario_thread | Tech & Engineering | Forces, materials, CAD, prototypes, tolerances, failures. |
| 17 | Civil Engineering & Construction Management | continuous_story | Building & Construction | One project from site plan to turnover. |
| 18 | Architecture | continuous_story | Building & Construction | One client from brief to presentation. |
| 19 | Registered Nursing (built) | scenario_thread | Health & Medicine | A clinic with different patients each level. Riverside Clinic. |
| 20 | Medicine / Physician | scenario_thread | Health & Medicine | Patient encounters: history, exam, diagnostics, treatment. |
| 21 | Surgery & Operating Room | scenario_thread | Health & Medicine | Different procedures: OR roles, sterile technique, anesthesia. |
| 22 | Pharmacy | practice_world | Health & Medicine | Fast prescription and medication drills. |
| 23 | Dentistry | scenario_thread | Health & Medicine | A dental clinic day. |
| 24 | Mental & Behavioral Health | scenario_thread | Counseling & Social Work | Client situations: assessment, symptoms, care plans. |
| 25 | Allied Health & Diagnostics | practice_world | Health & Medicine | Radiology, lab, respiratory, sonography drills. |
| 26 | Biotechnology | continuous_story | Science & Research | One research project from hypothesis to scale-up. |
| 27 | Biomedical Engineering | continuous_story | Science & Research | One medical device from need to regulatory. |
| 28 | Public Health & Epidemiology | continuous_story | Science & Research | One health event: detect, measure, risk, intervene, evaluate. |
| 29 | Veterinary Medicine | scenario_thread | Farming, Animals & Nature | Different animal patients. |
| 30 | Food Science | continuous_story | Farming, Animals & Nature | One food product from formulation to production. |
| 31 | Consumer Packaged Goods | continuous_story | Business & Finance | One product from insight to shelf to growth. |
| 32 | Aerospace Engineering | continuous_story | Tech & Engineering | One component from requirements to certification. |
| 33 | Airline Pilot & Flight Operations (built) | scenario_thread | Driving, Flying & Shipping | Different flights and phases. Skyline Air. |
| 34 | Electrician | scenario_thread | Building & Construction | Different jobs: circuits, panels, grounding, code, testing. |
| 35 | HVAC & Refrigeration | scenario_thread | Fixing Machines & Engines | Service different systems. |
| 36 | Plumbing & Pipefitting | scenario_thread | Building & Construction | Different jobsite problems. |
| 37 | Welding & Fabrication | practice_world | Factories & Making Things | Fast shop drills. |
| 38 | Automotive Technology | scenario_thread | Fixing Machines & Engines | Vehicles with different symptoms: scan, diagnose, repair, verify. |
| 39 | Diesel & Heavy Equipment | scenario_thread | Fixing Machines & Engines | Trucks and machinery: inspections, hydraulics, diagnostics. |
| 40 | Aviation Maintenance Technician | scenario_thread | Fixing Machines & Engines | Different maintenance events: inspection, airframe, sign-off. |
| 41 | Avionics Technician | scenario_thread | Fixing Machines & Engines | Aircraft electrical and electronic systems. |
| 42 | Advanced Manufacturing & CNC | continuous_story | Factories & Making Things | One production order from blueprint to quality. |
| 43 | Industrial Maintenance & Mechatronics | scenario_thread | Factories & Making Things | Keep a facility running: motors, sensors, PLCs, root cause. |
| 44 | Robotics Technician | scenario_thread | Factories & Making Things | Automation cells: programming, teach points, calibration, safety. |
| 45 | Carpentry & Construction Trades | scenario_thread | Building & Construction | Layout, framing, finishing, tools, safety. |
| 46 | Solar & Renewable Energy Technician | continuous_story | Building & Construction | One installation from site survey to monitoring. |
| 47 | Culinary Arts (built) | practice_world | Food & Cooking | Fast kitchen drills. Harbor Kitchen. |
| 48 | Cosmetology & Barbering | practice_world | Personal Care & Community Services | Fast client and technique drills. |
| 49 | EMT & Paramedic | scenario_thread | Health & Medicine | Different emergency calls from size-up to handoff. |
| 50 | CNA & Medical Assistant | scenario_thread | Health & Medicine | Different patients and duties: rooming, vitals, infection control. |

## 10. Where everything is

| Path | What |
|---|---|
| docs/handoff/specs/glossary-system.md | The locked spec. |
| docs/reference/glossary-scaling-sop-usman-2026-10-16.html, .md | This document, HTML and markdown. |
| docs/reference/codex-prompt-glossary-art-2026-10-16.md | The separate Codex prompt for the three Play tab games, every term and anchor filled in. |
| docs/reference/glossary-scaling-plan-handover-2026-10-16.html | Joshua's plan in full with our mapping, and the image brief in detail. |
| docs/handoff/play-sop/12-glossary-art-pipeline.md, scripts/glossary-art.mjs | The term art pipeline: manifest in, prompts out, packaging, validation, preview. |
| docs/reference/glossary-finance-art-oct13.json | The model manifest with the finance briefs. |
| src/components/glossary/generate.ts | Blueprint types (terms with moments; sort, selectAll, cases, powerPlay per level), the four recipes, the validator with the reading rules, the build-time assertions. |
| src/components/glossary/blueprints/ | culinary.ts (the model: every authored piece in use, four levels), health.ts, software.ts, aviation.ts (six levels each). |
| src/components/glossary/data.ts | GLOSSARY_INDUSTRIES, GLOSSARY_HUB_RELEASED, Finance's hand-authored levels. |
| src/components/glossary/industries.ts | The fifteen world design systems, CAREER_INDUSTRY. |
| src/components/glossary/termArt.ts, welcomeArt.ts, levelPlates.ts, worldBackdrops.ts | Image registries: term art, welcome, plates and the Dreamy state expressions, panoramas and silhouettes. |
| src/components/glossary/GlossaryLabGameExperience.tsx | The engine. |
| scripts/qa/glossary-blueprints.test.mjs, scripts/qa/dreamy-reactions.test.mjs | The two QA scripts. |
| /play-tools/glossary-qa | Every glossary, every level, both themes. Hamburger menu, Glossary QA. |
| /component-lab, "Glossary game, live engine" | Every piece in both themes with a World picker. |

## Appendix A. Joshua's Master Scaling Plan in full, with how the system holds each rule

### 1.1 Executive rules

These override anything else in the document.

| Rule | What it means | In the system |
|---|---|---|
| Finance stays exactly as it is | Everything here applies only to new glossary worlds. Finance and Investment Banking, including Business Basics and Investing Basics, do not change. Nothing is applied retroactively. | Finance is hand-authored in data.ts and data-finance-l2-4.ts. It never passes through the generator. |
| No timers | No countdown, no count-up, no timer in the header, no timed questions, no timer as a difficulty mechanic. Every new world, every new level. | The engine has no timer. The "4 min" on the Levels map is an estimate of length, not a clock. |
| No forced images | The Dreamari team decides whether a term has an honest, relevant image. No AI tool or content generator makes this decision. If the team decides no, the term gets no image. Never create an image to fill a slot. If a match-to-pictures question loses its pictures, it becomes match-to-meanings. | Levels 2 and up teach with words only. The team has decided Level 1 earns pictures everywhere (3.4). A flashcard shows generated art or nothing; it never shows an icon in place of a picture. Match It Up is always word to meaning. |
| No forced math | The team decides whether math belongs in a lesson. Never invent prices, percentages or calculations because a template has a math slot. Keep the question's position; swap the mechanic (sorting, ordering, spot the mistake, decision). | Numbers in a level's copy fail validation unless the level sets math: true. The generator never writes a calculation. |

### 1.2 Three glossary world architectures

| Mode | What it means | Use it when | Do not use it when |
|---|---|---|---|
| Continuous Story continuous_story | One company, project, product or mission progresses across Levels 1 to 4. Later events build on earlier ones. | Vocabulary has a natural cause-and-effect progression. | You would have to invent awkward plot points just to introduce a term. |
| Scenario Thread scenario_thread | The student stays in the same professional world, but each lesson is a new situation: a new shift, case, customer, patient or problem. | The workplace is consistent but the vocabulary does not need one continuous plot. | One coherent project would genuinely improve understanding. |
| Practice World practice_world | Short, varied mini-situations. There is a visual world and Dreamy, but no obligation to keep a narrative. | Vocabulary is best learned through rapid identification, comparison, classification, procedures, decisions or examples. | A recurring situation would materially improve understanding. |

A scenario thread is still a world. Nursing keeps the student inside one clinic, but nobody has to remember Patient A from Level 1 to understand Patient B in Level 3. That is far more scalable than turning every career into a television show.

### 1.3 Master scaling rules

| Rule | Global standard | How the system holds it |
|---|---|---|
| World size | 4 initial levels per glossary world. | Blueprint levels; roadmap levels beyond that show as locked words. |
| Vocabulary | 5 new core terms per level. 20 across Levels 1 to 4. | Validated: exactly five terms per playable level. |
| Lesson length | 7 to 10 scored interactions, including the final Power Play. | Seven derived screens plus the level's authored extras, seven to ten in all, plus 1 Power Play. Asserted by the QA script. |
| Term coverage | Every new term is introduced clearly, then used in applied context before the lesson ends. | Teach cards first; every term is credited at least twice in the main loop (asserted). |
| Power Play | Always one integrated final challenge. Never five screens for five terms. | One written paragraph with five blanks, never in teaching order, sized by level (Level 1 is five short lines, one blank each). The type allows nothing else. |
| Question clarity | Every screen asks an explicit question or action. Never "Complete the activity." | Every generated prompt is a question or an instruction. |
| Copy length | Context line about 12 words. Question about 18 words. Answer choices usually 7 words. | Each moment 12 words and 72 characters, cue 7 words and 34 characters, case step 80 characters, every sentence 14 words, feedback 90 characters, validated. |
| Reading difficulty | Roughly 8th grade. Difficulty comes from the concept, not the writing. | Validated since 17 Oct: a Flesch-Kincaid grade of 8 or below per level, with the level's own five words not counted, and no sentence over 14 words. |
| Answer leakage | Never put the answer inside the question, visual, heading, labels or setup. | Validated: a definition may not say its own word, a cue, a moment, a Select All line and a case step may not say the word they ask for. |
| Distractors | The right answer is not systematically the longest or most professional-sounding. | Distractors are the other terms of the same level, so lengths vary naturally. Answer position rotates by level. |
| Interaction diversity | No more than two consecutive screens with the same mechanic. | Asserted at build and in the QA script, by the shape the student sees (story card, fill-in sentence, compare card, 2x2, match, sort, select, case, type). |
| Multiple choice | Useful, but mixed with matching, sorting, fill-in-the-blank, error identification, comparison, sequencing, decisions. | Each recipe mixes story cards, fill-in sentences, compare cards, match, sort, select-all, cases and type. |
| Multi-part questions | About 2 to 3 judgments per screen. Never seven items at once. | Match has five pairs, Sort four to seven items, Select All four lines, a case two to four steps. |
| Wrong-answer feedback | Say exactly what was wrong. | Feedback is one or two short lines from the cue, and names the word it is mixed up with when it fits ("It is Blanch: a quick boil, then ice water. Poach is gentle heat in still water."). |
| Nested counters | No "Step 1 of 2" when the lesson already has a progress system. | None in generated levels. |
| Dreamy | Exactly one Dreamy per screen. The cloud itself: no arms, hands, legs or body. Expressions react to the situation. | One actor per screen, twelve Drift poses and four Signal reactions, always facing the content. |
| Intro cards | Skippable; students who know a term move quickly into practice. | Teach cards advance on tap. |
| Continuity | A story recap fits one short sentence. | Each level's intro is a headline, one line and one hook. |
| Mastery | Recognition first, then application, then transfer. Harder because students must think, not because screens hold more text. | The four recipes below. |

### 1.4 How difficulty progresses

The learning progression stays the same across all 50 worlds even though the worlds change. A Level 4 question is not a longer Level 1 question. It requires better judgment. Math is one possible mechanic, never a required marker of difficulty.

| Level | Cognitive goal | Example |
|---|---|---|
| Level 1 | Recognize and understand | "Which term means money earned from sales?" |
| Level 2 | Apply | "Maya puts $25,000 into the company. What does that money become?" |
| Level 3 | Compare, analyze, classify | Interpret relationships, consequences, workflows; tell two confusable words apart. |
| Level 4 | Decide, diagnose, distinguish | "The company needs money but does not want to give up ownership. Which option fits?" |
| Power Play | Integrate | One situation requiring all five terms together. |

In the system each level has a **focus**: recognize, apply, analyze or decide. It defaults by level number (1, 2, 3, 4 and later) and can be overridden. The focus picks the recipe: seven derived screens, plus the level's authored cases (and an authored sort or Select All where the recipe has no slot) as extra screens, seven to ten in all. The numbers in brackets are which of the five terms the screen credits; m0, m1 and m2 are which of that word's three moments it shows. Every moment is shown once per lesson.

| Step | Level 1 recognize | Level 2 apply | Level 3 analyze | Level 4+ decide |
|---|---|---|---|---|
| 1 | Definition: the five definitions as options (1) | Story card m0, which word (1) | Compare card, term 1 beside its confusion, m0 decides (1) | Story card m0, which option fits (1) |
| 2 | Match It Up, word to meaning (all) | Fill in the blank: m1, then "That is ___." (2) | Story card m0 (3) | Compare card, term 2 (2) |
| 3 | Fill in the blank, m1 (5) | Story card m0 (3) | Sort: the authored concept sort, else m1 of terms 2 to 5 into the words | Match It Up, "Use it when" (all) |
| 4 | Story card m0 (3) | Select All, authored or derived (4) | Select All about term 2 | Fill in the blank, m1 (3) |
| 5 | Sort: authored, else m1 of terms 1 to 4 into the words | Match It Up (all) | Fill in the blank, m1 (1) | Select All about term 4 |
| 6 | Catch the Misuse (4) | Catch the Misuse (5) | Catch the Misuse against the confusion (4) | Catch the Misuse (5) |
| 7 | Type the Term from m2 (2) | Type the Term from m2 (1) | Type the Term from m2 (5) | Type the Term from m2 (1) |
| extra | An authored Select All or case, if written | Cases (one or two) | Cases | Cases, and an authored sort |
| finale | Power Play: the level's written paragraph, all five words, blanks never in teaching order, word bank shuffled, size by level. |  |  |  |

The review (one Reverse Recall per word, the definition read aloud) is drawn only for words still short of mastery and never appears in the main loop. Live proof of all four recipes with every authored piece: /play/glossary/culinary?lesson=1 through lesson=4, the model blueprint.

### 1.5 The 50 glossary worlds

Joshua calls each of these a "Glossary World". In the system they are **industries**, grouped under Dreamari's 15 career worlds. The career world owns the look (accent color, display face, body face); the industry owns the levels and the story. Several industries share one world. The mode column is Joshua's recommended architecture and becomes mode in the blueprint.

| # | Industry | Mode | Career world | Recommended framing |
|---|---|---|---|---|
| 1 | Finance & Investment Banking (built) | continuous_story | Business & Finance | Keep Dream Sneakers. Does not change. |
| 2 | Accounting & Audit | scenario_thread | Business & Finance | Month-end close, reconciliations, statements, controls, audit requests. Same company, different situations. |
| 3 | Entrepreneurship & Venture | continuous_story | Business & Finance | Idea, customers, business model, raise money, hire, grow, decide. |
| 4 | Management Consulting | scenario_thread | Business & Finance | Different client problems: costs, growth, operations, market entry. |
| 5 | Marketing & Brand Management | scenario_thread | Business & Finance | Different campaigns for one brand. |
| 6 | Sales & Business Development | scenario_thread | Business & Finance | A pipeline: qualify, discovery, pitch, objection, proposal, close. |
| 7 | Human Resources & People Operations | scenario_thread | Business & Finance | Recruiting, onboarding, pay, benefits, performance, retention. |
| 8 | Supply Chain & Logistics | continuous_story | Driving, Flying & Shipping | One product from supplier to factory to warehouse to customer. |
| 9 | Law & Legal Services | scenario_thread | Law, Safety & Justice | Rotating client matters: contracts, evidence, discovery, litigation. |
| 10 | Software Engineering (built, 6 levels) | continuous_story | Tech & Engineering | Build and release one app: requirements, code, testing, deployment, bugs. |
| 11 | Cybersecurity | scenario_thread | Tech & Engineering | One organization through security events: access, phishing, malware, response. |
| 12 | Data Science & Analytics | continuous_story | Tech & Engineering | Business question, data, cleaning, analysis, model, recommendation. |
| 13 | Artificial Intelligence & Machine Learning | continuous_story | Tech & Engineering | One AI system: data, training, model, evaluation, bias, deployment. |
| 14 | Product Management & UX | continuous_story | Tech & Engineering | One product: research, pain point, prototype, testing, launch. |
| 15 | Electrical & Computer Engineering | scenario_thread | Tech & Engineering | Circuits, components, signals, measurement, troubleshooting. |
| 16 | Mechanical Engineering | scenario_thread | Tech & Engineering | Forces, materials, CAD, prototypes, tolerances, failures. |
| 17 | Civil Engineering & Construction Management | continuous_story | Building & Construction | One project from site plan to turnover. |
| 18 | Architecture | continuous_story | Building & Construction | One client from brief to presentation. |
| 19 | Registered Nursing (built, 6 levels) | scenario_thread | Health & Medicine | A hospital shift world with different patients. |
| 20 | Medicine / Physician | scenario_thread | Health & Medicine | Patient encounters: history, exam, diagnostics, treatment. |
| 21 | Surgery & Operating Room | scenario_thread | Health & Medicine | Different procedures: OR roles, sterile technique, anesthesia. |
| 22 | Pharmacy | practice_world | Health & Medicine | Fast prescription and medication scenarios. |
| 23 | Dentistry | scenario_thread | Health & Medicine | A dental clinic day. |
| 24 | Mental & Behavioral Health | scenario_thread | Counseling & Social Work | Professional client situations: assessment, symptoms, care plans. |
| 25 | Allied Health & Diagnostics | practice_world | Health & Medicine | Radiology, lab, respiratory, sonography; variety helps here. |
| 26 | Biotechnology | continuous_story | Science & Research | One research project from hypothesis to scale-up. |
| 27 | Biomedical Engineering | continuous_story | Science & Research | One medical device from need to regulatory. |
| 28 | Public Health & Epidemiology | continuous_story | Science & Research | One health event: detect, measure, risk, intervene, evaluate. |
| 29 | Veterinary Medicine | scenario_thread | Farming, Animals & Nature | Different animal patients. |
| 30 | Food Science | continuous_story | Farming, Animals & Nature | One food product from formulation to production. |
| 31 | Consumer Packaged Goods | continuous_story | Business & Finance | One product from insight to shelf to growth. |
| 32 | Aerospace Engineering | continuous_story | Tech & Engineering | One component from requirements to certification. |
| 33 | Airline Pilot & Flight Operations (built, 6 levels) | scenario_thread | Driving, Flying & Shipping | Different flights and phases: preflight, taxi, cruise, weather, diversions. |
| 34 | Electrician | scenario_thread | Building & Construction | Different jobs: circuits, panels, grounding, code, testing. |
| 35 | HVAC & Refrigeration | scenario_thread | Fixing Machines & Engines | Service different systems. |
| 36 | Plumbing & Pipefitting | scenario_thread | Building & Construction | Different jobsite problems. |
| 37 | Welding & Fabrication | practice_world | Factories & Making Things | Fast shop exercises; a long narrative adds little. |
| 38 | Automotive Technology | scenario_thread | Fixing Machines & Engines | Vehicles with different symptoms: scan, diagnose, repair, verify. |
| 39 | Diesel & Heavy Equipment | scenario_thread | Fixing Machines & Engines | Trucks and machinery: inspections, hydraulics, diagnostics. |
| 40 | Aviation Maintenance Technician | scenario_thread | Fixing Machines & Engines | Different maintenance events: inspection, airframe, sign-off. |
| 41 | Avionics Technician | scenario_thread | Fixing Machines & Engines | Aircraft electrical and electronic systems. |
| 42 | Advanced Manufacturing & CNC | continuous_story | Factories & Making Things | One production order from blueprint to quality. |
| 43 | Industrial Maintenance & Mechatronics | scenario_thread | Factories & Making Things | Keep a facility running: motors, sensors, PLCs, root cause. |
| 44 | Robotics Technician | scenario_thread | Factories & Making Things | Automation cells: programming, teach points, calibration, safety. |
| 45 | Carpentry & Construction Trades | scenario_thread | Building & Construction | Different stages and jobs: layout, framing, finishing, safety. |
| 46 | Solar & Renewable Energy Technician | continuous_story | Building & Construction | One installation from site survey to monitoring. |
| 47 | Culinary Arts (built, 4 levels) | practice_world | Food & Cooking | Fast kitchen challenges: knife skills, methods, temperatures, service. |
| 48 | Cosmetology & Barbering | practice_world | Personal Care & Community Services | Fast client and technique exercises. |
| 49 | EMT & Paramedic | scenario_thread | Health & Medicine | Different emergency calls from size-up to handoff. |
| 50 | CNA & Medical Assistant | scenario_thread | Health & Medicine | Different patients and duties: rooming, vitals, infection control. |

Only five worlds are primarily practice worlds, because most professions are easier to understand when the vocabulary sits in a recurring workplace or project.

### 1.6 Story mode does not determine question type

A continuous story lesson still contains matching, multiple choice, sorting, drag and drop, sequencing, error detection, decisions and fill-in-the-blank, with calculations only when the team decides they are relevant. The story is the contextual spine: one context line, then the question. The story makes the information meaningful. It never becomes additional reading.

### 1.7 Artwork

Do not build a unique illustration for every term. 50 worlds times 4 levels times 5 terms is 1,000 terms; bespoke imagery for all of them is a production bottleneck and invites misleading visuals for abstract concepts. The team decides whether each term has an honest, relevant image. Candidates: sneaker, stethoscope, circuit breaker, wrench, aircraft engine, syringe, welding torch, hair clipper, CNC machine. Terms that do not need a standalone image: profit, liability, risk, margin, differential diagnosis, return, leverage, compliance, strategy.

| Mode | Visual strategy |
|---|---|
| Continuous story | Visualize the entity progressing; reuse the same company or product assets and change their state. |
| Scenario thread | Reuse a small library of environments, equipment, documents and tools. |
| Practice world | Rely on interactions, Dreamy reactions, motion, clouds, buttons and success states. |

**In the system:** Level 1 of every industry gets pictures for its five terms and one welcome illustration (decision of 16 October, section 3.4). Every later level teaches with words: words-only teach cards, anonymous mastery segments, no pictures on match, sort or card backs. A flashcard never shows an icon in place of a picture.

### 1.8 Dreamy's role

Dreamy is part of the interaction system, not an illustration beside every piece of content. One screen, one Dreamy. Dreamy is the cloud itself: no arms, hands, legs or body. Dreamy is curious before a question, thinking during a hard one, concerned near a warning, excited after a correct answer, encouraging after a mistake, celebrating mastery, confident during the Power Play, surprised by an unexpected result. When term artwork is not appropriate, the game still comes from Dreamy's expressions, cloud movement, background animation, button reactions, correct-answer states, mastery animations, combos, unlocks, celebrations and transitions. A screen does not need a vocabulary illustration to feel like a game.

**In the system:** one actor per screen, twelve animated Drift poses and four Signal reactions mapped to question kinds and answer states, always facing the content, with the reward pluses on the main Dreamy when a student is right.

### 1.9 Quality gate before any lesson ships

| Ask | Question | Automated? |
|---|---|---|
| Clarity | Can a student understand exactly what they are asked within about three seconds? | Sentences of 14 words at most and a grade 8 cap are automated; the rest is review. |
| Learning | Does answering require understanding the vocabulary, or can the student guess from wording or visuals? | Leakage checks are automated; the rest is review. |
| Purpose | Did the screen teach or test something meaningful? | Author review. |
| Copy | Is anything repeated that could be removed? | No line of copy is shown twice in a lesson (automated); the rest is review. |
| Feedback | If the student is wrong, will they understand exactly what was wrong and why? | Generated from the term's own cue and its confusion, two short sentences at most. |
| Imagery | Has the team decided the image honestly helps? If not, remove it. | Registration is the decision. |
| Math | Has the team decided math belongs? If not, do not use it. | math: true is the decision; numbers without it fail. |
| Story | Would removing the story hurt understanding? If not, reduce it. | Author review. |
| Timer | Is there any timer? Remove it. | None exists. |
