# Dreamari Glossary Games: Master SOP and Prompts for Usman and ChatGPT (image gen)

_17 October 2026. One document with everything needed to scale the glossary games from four industries to fifty: the rules (Joshua's), what is built and verified, the prompts an agent pastes to create a game, the prompts for every image, the UI and its component library, how it scales, and every guardrail in place. Repo copies: docs/reference/glossary-scaling-sop-usman-2026-10-16.html and the same text as docs/reference/glossary-scaling-sop-usman-2026-10-16.md. The locked engineering spec is docs/handoff/specs/glossary-system.md. Joshua's plan in full is Appendix A of this document. This is the only glossary SOP: the one prompt that builds a whole world end to end (game, levels, every graphic, release) is section 7c, the Signal backgrounds are 7d, the shared polish is 7e, and every older glossary SOP, handover and separate prompt was deleted on 17 Oct 2026._

## 0. Readiness, checked 17 October 2026

| Check | Result |
|---|---|
| Live on main | Everything in this document is on main. Mastery shows as a count and five anonymous segments; Signal's scene cards use Signal's frame; the Play tab's four glossary cards carry Chandu's 17 Oct covers (three objects on a night cloud floor, no Dreamy); Next level keeps the student's theme; Dreamy's speech bubble wraps on whole words at phone width. Since 17 Oct: Codex's Level 1 term art and welcome scenes for Software, Aviation and Nursing in both themes, living worlds (asset-free time of day per world; weather removed on 17 Oct, Chandu's decision), the symmetry and alignment pass, and the light-mode pass. |
| Light mode | A contrast sweep of every Culinary screen (all six levels, the welcome, teach cards, unlocked screen, Power Play and review) in Drift and Signal with the app in light mode: every line at 4.5:1 or better (3:1 large), disabled buttons excepted. Fixed on 17 Oct: Signal's gold and cyan words and their navy drop shadows, the welcome copy over the daytime city, the Start label, the A to D keys, the compare card names, the theme switch label, the empty mastery segments. |
| Alignment audit | One screen of every shape the five games produce (30 shapes) in both themes at 1440x900 and 375x812: no row of unequal tiles, no off-centre short row, no block off the column's edges, no HUD or bubble off the column. Every screen also checked by eye for what the audit cannot see. The welcome screen is one centred column up to 860px. |
| Art QA | Three Level 1 packs, six welcomes, 72 exports with alpha and hash receipts (2.2 MB served); Finance and the words-only later levels unchanged. World scenes: deterministic, asset-free, Finance bypassed, performance contract held. |
| Type check, lint | tsc clean. ESLint: no errors in the glossary code (two pre-existing unescaped-entity errors live in src/app/gate/page.tsx). |
| Blueprint QA script | All generated industries pass (209 screens across 24 levels, six per industry: 35 cases, 14 sorts, 20 select-alls; feedback median 42 characters, longest 90; longest Level 1 Power Play 188 characters, Level 5 317): no sentence over 14 words, feedback short, Power Play within its level's size, seven to ten screens plus a Power Play per level, no three of one screen shape in a row, at least four shapes per level, every term credited twice, no answer leakage, no line of copy shown twice in a lesson, Reverse Recall only in the review, Power Play blanks never in order, all four recipes exercised. |
| Validator negative test | A deliberately broken blueprint (bad slug, unknown world, definition saying its word, 14-word moment, two moments the same, 8-word cue, example without the anchor, unknown confusion, numbers without math) is refused with thirteen specific reasons and does not build. It is also a live specimen in the Component Lab. |
| Dreamy reactions QA | Passes: twelve Drift poses, four Signal reactions, asset budget, silhouettes. |
| Walkthroughs | Nursing Level 1 in Drift and Software Level 5 in Signal played end to end with Skip (welcome, cards, questions, streak, Power Play, Complete, next level) with no console errors from the game. After the 17 Oct rewrite: Culinary Level 3 (compare card, wet and dry heat sort, three-step case, Select All, shuffled Power Play bank) in Drift, Software Level 5 case and sort in Signal, and the Level 1 Power Plays of Aviation and Nursing at phone width, each now five short lines. |
| Component Lab | "Glossary game, live engine" documents every piece in both themes with every state, the edge cases (22-character term, acronym, 110-character definition, 72-character moment, two-word options, long feedback) and the error state (a broken blueprint through the validator, the unknown-route 404, the hub release list). |
| Design systems | All fifteen career worlds have a design system row; a blueprint naming any world works. |
| Routes | /play/glossary/<industry> and /play/glossary/<career> resolve; /play-tools/glossary-qa lists every registered glossary (hamburger menu, Glossary QA). Unknown slugs 404. |
| Hub gating | The Play tab shows only games with thumbnail art (Chandu, 17 Oct 2026). Finance, Medical (nursing), Flight (aviation) and Tech (software) are released and open from their cards. Kitchen Terms (culinary), the test world, has no cover, so it plays only from the hamburger menu's Glossary QA link. Release is one slug in GLOSSARY_HUB_RELEASED plus a card in GLOSSARY_GAMES. |
| Demo flags | Every demo-only piece is tagged DEMO-ONLY in its own comment (blueprints, QA page, release list, Skip). |
| Built so far | Finance (Joshua's, 4 of 20 levels). The three other Play tab cards are complete at six playable levels each: Software Engineering (Tech Terms), Flight Operations (Flight Terms), Nursing (Medical Terms). Culinary Arts (Kitchen Terms) has six too and is the model blueprint and test world; it has no art. Every world has the required Levels 1 to 4; Levels 5 and 6 are extras. All four were rewritten on 17 Oct to the Finance style: three moments per word, concept sorts, cases, written Power Plays, then trimmed to the reading rules. |
| Next (Usman) | Every prompt is in this document. Each new world: Prompt E (7c) builds its game and levels and generates its Level 1 pictures, welcome scene and Play tab cover. Once per career world: its Signal background with Prompt F (7d); none of the fifteen exist yet, so every world shows the default city. Once for the app: the Levels map plates, the Drift horizon silhouettes and Dreamy's animated reactions with Prompt G (7e), all optional. |

## 1. Who does what

| Role | Owns | Pastes |
|---|---|---|
| Joshua | The rules: the Master Scaling Plan. Finance never changes. | Nothing; reviews. |
| Usman's agent (Claude Code or Codex in the repo) | Whole worlds: the game, its levels, its graphics and its release. Levels 1 to 4 required; 5 and 6 optional. | Prompt E (7c) end to end; or Prompt A (game), Prompt B (Levels 5 and 6) and Prompt D (art) one at a time. |
| Codex or ChatGPT (image generation) | Every image: Level 1 term art and the welcome illustration for each industry (required), plates, world panoramas, silhouettes (optional), Dreamy animation. | The art parts of Prompt E, or Prompt D; Prompt F (7d) for the Signal backgrounds; Prompt G (7e) for the shared polish. 7b is a worked example of Prompt D. |
| Chandu | Browser QA on the Glossary QA page; release to the hub (Prompt C). | Prompt C. |

## 2. The rules on one page

| Rule | What it means for a new game | Enforced by |
|---|---|---|
| Finance stays exactly as it is | Nothing here touches Finance. | Finance is hand-authored and never passes through the generator. |
| No timers | No countdown, count-up or timed questions. | The engine has none. |
| No forced images | Level 1 of every industry gets pictures (team decision). Levels 2 and up are words only. A card shows generated art or nothing, never an icon. | Engine. |
| No forced math | Numbers only where the job's words naturally carry them. | Validator: numbers fail unless the level sets math: true. |
| Three architectures | continuous_story (one company grows), scenario_thread (same workplace, new situation each level), practice_world (varied drills, no plot). Pick from the table in section 12. | Blueprint mode. |
| Difficulty ladder | Level 1 recognize, 2 apply, 3 analyze (tell confusable words apart), 4 decide. | Generator recipes by level number. |
| Levels 1 to 4 required, 5 and 6 optional (added 17 Oct) | Every world ships Levels 1 to 4 playable, five terms each: Joshua's "4 initial levels per Glossary World" and "20 terms across Levels 1 to 4". Levels 5 and 6 may be playable extras or locked roadmap words. Chandu: "1-4 should be there mandatorily." | Validator: a world missing any of Levels 1 to 4, or with one of them as roadmap words only, does not build. |
| 7 to 10 interactions, one Power Play | Seven derived screens plus the level's authored cases, sort and Select All as extras, then one paragraph with five blanks. | Generator, QA script. |
| Copy length | Definition 110 characters, example 120, cue 34 characters and 7 words, each moment 72 characters and 12 words, sort item 34, Select All line 44, case step 80, feedback 90 and two sentences, term 22, title 30, goal 48. | Validator. |
| Short and plain (added 17 Oct) | Every sentence a student reads is 14 words at most, feedback included. A level's copy reads at grade 8 or below, not counting its own five words. Chandu: "make sure every piece of copy including success explanations etc are shorter and 8th grade comprehension level." | Validator (sentences, feedback, a Flesch-Kincaid grade per level) and the builder (generated feedback). |
| Power Play grows with the level (added 17 Oct) | Level 1: 200 characters, five sentences, one blank each. Level 2: 240, five sentences, one blank each. Levels 3 and 4: 290, six sentences. Levels 5 and up: 330, six sentences. Chandu: "make sure the power play isnt so complex and long and a lot to read for level 1." | Validator. |
| Answer leakage | A definition never says its word; neither does a cue, a moment, a Select All line, a case step or the Power Play paragraph. | Validator. |
| No screen repeats a line (added 17 Oct) | Every word carries three moments and each is shown once. The definition is seen on the teach card and in the review only. Sorts put concrete things into concept buckets, not cues into words. Chandu: "the games are repeating the same questions again and again for mastery instead of having any variety, please refer the finance glossary games." | Validator (no duplicate lines in a level) and the builder (no line shown twice in a lesson). |
| Power Play is not linear (added 17 Oct) | The paragraph's blanks never run in teaching order, and the word bank is shuffled so it never mirrors the blanks. | Validator refuses 1 to 5; the engine shuffles the bank. |
| Review is a new form | Reverse Recall (the definition read aloud) appears only in the review, for words still short of mastery, so the student never sees the same screen twice. | Generator. |
| Dreamy asks, like Finance (added 17 Oct) | Dreamy speaks the situation as a question: the moment, then one short question ("Ana clocks in at seven and clocks out at seven. What is this called?"), the way Finance asks "Maya puts $25,000 into Dream Sneakers to help it grow. What is Maya?". Lines without a moment are voiced in the game's world from its anchor and the student's role ("You hear "Triage" at Riverside Clinic. What does it mean?", "A new nurse wrote these notes. Which one is wrong?"). Nothing to author: the generator builds every line from the moments, the anchor and the role. Chandu: "make Dreamy ask the situation as a question in every generated game like Finance." | Generator; the QA script refuses a bubble that is only a stock line. |
| Wrong-answer feedback names what was wrong | Each term names the word it is confused with. | Generator uses confusion. |
| Eighth grade, no dashes | Short words, one idea per sentence, two sentences instead of a dash. | Validator: dashes, 14-word sentences and a grade 8 cap per level. |
| One Dreamy per screen, the cloud itself | Never draw Dreamy, limbs or people into any image. | Engine; image brief. |
| Every example names the anchor | In a continuous story or scenario thread, each example sentence names the company or place. Not required in a practice world. | Validator. |
| Play tab only with a cover (added 17 Oct) | A game joins the Play tab only once its thumbnail cover exists; until then it plays from the hamburger menu's Glossary QA link. Missing graphics are generated with the prompts here (7c to 7e), never a stand-in. Chandu: "Only use games with thumbnail art in the play tab." | GLOSSARY_GAMES and GLOSSARY_HUB_RELEASED; Prompt C. |

## 3. Prompt A: create a glossary game for X

Paste to an agent working in the Dreamari repo, replacing the two bracketed lines. The agent writes one file, registers one line, runs three checks and stops. It does not generate images and does not push.

```
You are working in the Dreamari prototype repo. Pull origin/main first. Read docs/handoff/specs/glossary-system.md before writing anything.

TASK
Create the glossary game for: [INDUSTRY, e.g. "Cybersecurity"]
Notes from Chandu, if any: [optional]

STEP 1. Look the industry up in the 50-industry table in docs/reference/glossary-scaling-sop-usman-2026-10-16.md (section 12). Take its mode (continuous_story, scenario_thread or practice_world) and its career world (an exact WORLD_COLORS key). Choose a slug: lowercase letters and dashes, it becomes the route /play/glossary/<slug>. Choose an anchor: one company, clinic, airline, shop or site that every level returns to (practice worlds may use it loosely). Choose the student's role in one word.

STEP 2. Write src/components/glossary/blueprints/<slug>.ts by copying the model blueprint culinary.ts (every authored piece in use) and the blueprint with the same mode: software.ts (continuous story), aviation.ts (scenario thread), culinary.ts (practice world). Keep the header comment pattern (DEMO-ONLY content, why, the anchor). Levels 1 to 4 must be playable; the validator refuses a file without them. Levels 5 and 6 are optional: write them as roadmap words, or make them playable if asked:
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
- moments: three different real situations, 12 words and 72 characters each, that show the word WITHOUT saying it. Each one is shown on exactly one screen: Dreamy's question (Dreamy says the moment, then "What is this called?"), a fill-in sentence (the moment then "That is ___."), a Select All line, a sort token, a Type the Term prompt or a compare card. Write three that differ in setting, not three rewordings.
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

STEP 3. Register: in src/components/glossary/data.ts add `<slug>: buildGlossaryCareer(<NAME>_GLOSSARY),` to GLOSSARY_INDUSTRIES and the import. If a catalog career should open this glossary, map it in CAREER_INDUSTRY in src/components/glossary/industries.ts and set exampleCareerSlug in the blueprint. Do NOT add the slug to GLOSSARY_HUB_RELEASED; release is Chandu's step.

STEP 4. Check, all three must pass:
npx tsc --noEmit
node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-blueprints.test.mjs
node scripts/qa/dreamy-reactions.test.mjs
Then start the dev server (npm run dev -- --webpack), open /play/glossary/<slug>?theme=drift and press the top bar's Skip through Level 1 (about 14 presses), and again with ?theme=signal. Open ?lesson=2&q=1, ?lesson=3&q=1, ?lesson=3&q=3 (the sort) and ?lesson=4&q=1 in Drift, and the case screen of each level. Then play one level without Skip and get two answers wrong on purpose: the review screens that follow must read as new questions. Take a screenshot of each.

STEP 5. Write the art list for Codex as a short block in your final message: the slug, the anchor, and the five Level 1 terms each with its definition (Codex turns these into image briefs; see the SOP section 6).

STEP 6. Add a dated entry to docs/AI_HANDOFF.md (what, why, what you checked). Commit with the why in the message. Do not push.

Done looks like: the blueprint file exists and validates, the industry appears on /play-tools/glossary-qa with Levels 1 to 4 playable, screenshots attached, the art list written, one commit, nothing pushed.
```

## 4. Prompt B: add the optional Levels 5 and 6 to an existing industry

```
You are working in the Dreamari prototype repo. Pull origin/main. Read docs/handoff/specs/glossary-system.md.

TASK: turn the roadmap Levels 5 and 6 of src/components/glossary/blueprints/[slug].ts into playable levels. Keep the five words each level already lists unless one cannot be written within the rules; then swap it and say why. Both levels are Advanced and use the decide recipe by default, so every term needs definition, example, cue, icon, three moments and a confusion, and each level needs a written powerPlay, one or two cases and (Level 5) an authored sort. Follow the copy rules exactly as in Prompt A. Run the three checks, open ?lesson=5&q=1 and ?lesson=6&q=1 in both themes, screenshot, write the handoff entry, commit, do not push.
```

## 5. Prompt C: release an industry to the Play hub (Chandu, after QA)

```
Only once the industry has its Play tab cover (the Play tab shows only games with thumbnail art; until then it plays from the hamburger menu's Glossary QA link). In the Dreamari repo: add "[slug]" to GLOSSARY_HUB_RELEASED in src/components/glossary/data.ts. If the hub has no card for it, add one to GLOSSARY_GAMES in src/components/play/games.ts keyed to its example career slug (or the industry slug when no catalog career owns it) with title "[Subject] Terms", sub "Learn key [subject] terms" and a cover (a 1400 by 788 WebP thumbnail: three glossy objects of the subject on a night cloud floor, matching the four on the hub; section 6.7). Confirm Codex has registered its Level 1 term art (termArt.ts) and welcome illustration (welcomeArt.ts). Run npx tsc --noEmit, open /play and confirm the card is playable, commit with the why, push to main.
```

## 6. Images (Codex or ChatGPT)

Codex generates every image. Nothing in Usman's game-creation work waits on images: a game plays with words the moment it is registered. Required before release: 6.1 and 6.2. Optional, shared polish: 6.3 to 6.5. 6.6 is animation. Prompt E (7c) runs 6.1, 6.2 and 6.7 for a new world in one go; Prompt F (7d) is 6.4 for every career world; Prompt G (7e) is 6.3, 6.5 and 6.6. Section 7b is a worked example of Prompt D, filled in.

### 6.1 Level 1 term art (required: 5 terms, both themes)

The repo has a reproducible pipeline for this: scripts/glossary-art.mjs, and everything it needs is in this section. The input is a manifest JSON; the model is docs/reference/glossary-finance-art-oct13.json. The script prints the exact prompts, then packages, validates and previews the finished images. Flow:

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

**Before generating.**

1. Read the lesson data. Reuse an existing image only when its meaning matches the term.
2. Write one brief per term. Both themes share the meaning but not the technique: never just recolor a 3D image into pixels.
3. Keep words students confuse apart. Revenue is all sales income; Profit is what is left after costs.
4. If a term cannot be shown honestly, leave it without a picture. Never register a misleading image to fill a slot.
5. Scope art to its industry. A sneaker shop must never show up in Nursing because two terms share an id.

**Commands** (from the repo root; the finance manifest is the example):

```
# One prompt per image, with the references to attach.
node scripts/glossary-art.mjs prompts docs/reference/glossary-finance-art-oct13.json

# After every source image is saved: export the versioned WebPs and a receipt.
node scripts/glossary-art.mjs prepare docs/reference/glossary-finance-art-oct13.json

# Read-only check of sources, prompts and outputs against the receipt.
node scripts/glossary-art.mjs validate docs/reference/glossary-finance-art-oct13.json

# Contact sheets with the Level 1 anchors in the top row, for review.
node scripts/glossary-art.mjs preview docs/reference/glossary-finance-art-oct13.json /absolute/path/to/review
```

For a new industry, copy the manifest, set a new version and career slug, and replace the terms, briefs and source paths. Keep the style locks and references. The script refuses missing transparency, clipped sources, name collisions, duplicate term slugs and files over budget. It does not generate images and does not judge quality. Receipts keep the hashes, the exact prompts and the sizes. Only the optimized WebPs ship; the source PNGs stay local.

**File contract.**

- Path: public/images/glossary/<version>/<drift|signal>/<term-slug>.webp.
- Drift: 768 px large, 256 px small, named <term-slug>-256.webp. Signal: 768 px large, 320 px small, named <term-slug>-320.webp.
- Square canvases with transparency kept. Trim only transparency; never stretch. The Drift subject fits within 90% of the canvas.
- Signal is sampled once onto a 128 px grid, then enlarged with nearest neighbor, so no half pixels appear.
- Budgets: 140 KB large, 35 KB small. Aim well under them.
- Map each term to its file by hand in termArt.ts. Never match terms by keyword.

**Acceptance gate** (every new set, before asking to push):

- Review every image beside the Level 1 anchors at 200 px and at 48 px.
- Check the meaning, not just the looks: no wrong props, no stray text, no promise of a sure gain.
- Dreamy keeps the cloud face and has no limbs. No people stand in for Dreamy.
- Real transparency, safe margins, aspect ratio kept, equal canvas and visual weight within a theme.
- Signal is true pixel clusters, not a pixel filter over 3D. Drift keeps its satin depth.
- Check the teach cards, Match It Up, the sort and the mastery bar. A sort item's picture shows the item, never its bucket, so it cannot give the answer away.
- Phone, tablet and laptop: nothing squishes, labels wrap, no page scroll.
- Never replace Finance's Level 1 anchors or shipped art.
- Run npx tsc --noEmit, a scoped lint, npm run tokens:check and the script's validate step.
- Write the handoff entry: why, the set's paths, the checks, what was rejected. Push only with Chandu's go-ahead.

**Object-only subjects.** When the brief has no Dreamy, write "No Dreamy, no cloud shape, no eyes or face, no mascot" into it. The conditional character lock alone did not stop the generator copying the cloud from the style reference. Reject any output that adds a second character; keep the source and record the retry under revisionPrompts in the manifest. Before admitting a set, node scripts/qa/glossary-art-source-preview.mjs <manifest> <review-folder> makes a contact sheet of the original sources, welcomes included.

### 6.2 Welcome illustration (required: 1 per theme)

One composed scene of the workplace the glossary lives in, never a person: the clinic front, the hangar and tower, the kitchen pass, the software studio. 1024 square, transparent, one readable silhouette; it shows at about 300 px beside Dreamy on the welcome screen. Use the 6.1 prompt with Asset type "one Dreamari welcome illustration: the workplace this glossary lives in, seen as a small composed scene" and Subject "{{the anchor}}: {{two sentences describing the place, no people}}", with the theme's style lock. Package it with its own script: add welcome: {brief, sources: {drift, signal}, prompts: {drift, signal}} to the industry's manifest, then run node scripts/glossary-welcome-art.mjs prepare <manifest> and validate <manifest>. It exports 1024 plus 256 (Drift) or 320 (Signal) with real alpha, safe margins and proportional sizing, writes a separate hash receipt, keeps the source PNGs and refuses to overwrite silently. Files land at public/images/glossary/<version>/{drift,signal}/welcome.webp. Register in WELCOME_ART[industrySlug] in src/components/glossary/welcomeArt.ts with both theme paths; LEVEL_WELCOME_ART can pin one to a single lesson.

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

### 6.4 Signal world backgrounds (one per career world, fifteen at most)

The game's sky in Signal: one opaque 1200 by 800 pixel-art panorama per career world, under 180 KB, at public/images/glossary/backdrops/signal/<world-slug>.webp, registered in SIGNAL_WORLD_BACKDROPS in src/components/glossary/worldBackdrops.ts. Until a world has one it shows the default city, public/images/glossary/signal/bg.webp, which is also the style reference. The engine stretches it to the screen height, repeats it in mirrored pairs, scrolls three bands at their own speeds (sky: the top 35%; city: the middle; shore: the bottom 24%), lays the time of day over it and slices it for the Levels map. So: sky in the top third, a continuous skyline in the middle, water or ground under it, a dark quiet walkway across the bottom quarter, no landmark within 10% of either edge, no text, no people, no Dreamy. scripts/glossary-signal-backdrop.mjs prepare packages a source to that contract and validate checks every registered file. The full prompt, the fifteen world scenes and the checks are Prompt F, section 7d.

### 6.5 Drift horizon silhouettes (optional)

Drift is painted and already takes each world's accent; it needs no image. Optional: one flat dark horizon silhouette per world (a clinic roofline, a runway and tower, a kitchen pass), SVG preferred or transparent WebP 1600 by 300, no interior detail, repeatable left to right, no text, no Dreamy. Files: public/images/glossary/backdrops/drift/<world-slug>.svg. Register in DRIFT_WORLD_SILHOUETTES in worldBackdrops.ts. Richer clouds are open for Codex to explore inside the scenery layer (LabMaterialScenery in GlossaryLabGameExperience.tsx): gradients, masks and transforms only, never a filter on an animated layer, and everything must stop under prefers-reduced-motion.

### 6.6 Dreamy expressions (animation)

Chandu's "Dream Expressions V2" pack (19 Drift stills) is at public/images/dreamy/expressions-v2/01.webp to 19.webp. Four are used statically on the Drift Levels map open card: 06 (books, ready to play), 18 (arrow, playing now), 12 (graduation cap, complete), 17 (alert, locked). Animate first, because the game has a slot for each: 10 (green check) for a right answer, 09 (red X) and 14 ("hmm") for a wrong one, 16 (confetti) and 12 for mastery and the complete screen, 15 (glasses and clipboard) for review and hints, 08 (reading) for the teach cards, 18 (arrow) for Next. Deliver the four-frame WebP atlas format described in docs/reference/dreamy-drift-animated-oct15-v2.json so dreamyReactions.ts can take them without engine changes. Signal needs pixel versions drawn to the Signal Dreamy rig.

### 6.7 Play tab covers (one per released industry)

Each glossary card on the Play tab has a landscape cover: three glossy 3D objects that say the subject at a glance, grouped in the centre on a night cloud floor. No Dreamy, no people, no text. 1400 by 788 WebP, under 130 KB. The four on the tab are the reference set (Chandu, 17 Oct 2026): public/images/app/glossary-finance-thumb-oct17b.webp (a calculator, a rising chart, gold coins), glossary-medical-thumb-oct17b.webp (a stethoscope, a green cross, a clipboard with a heart line), glossary-flight-thumb-oct17b.webp (a jet, a pilot's cap, a crossed wrench and screwdriver) and glossary-tech-thumb-oct17b.webp (a laptop, a padlock shield, a server stack). The card is portrait at rest and 16:9 when active, so the group stays inside the middle third. File: public/images/app/glossary-<subject>-thumb-<mmmdd>.webp, set as cover on the card in GLOSSARY_GAMES. No cover, no card: the game plays from the hamburger menu's Glossary QA link until its cover exists.

```
Use case: Play tab game cover.
Match the four attached covers exactly in frame, camera, lighting, palette and material: a deep navy to violet night sky with small white four-point sparkles; soft rounded cloud banks in blue and violet with pink rim light at the sides and along the bottom; a smooth cloud floor with soft reflections; in the centre, three glossy 3D objects from the subject, grouped tightly and overlapping a little, lit with a cool blue glow and warm gold accents.
Subject: {{the workplace}}.
Objects: {{three plain objects that say the subject at a glance, e.g. a stethoscope, a green medical cross, a clipboard with a heart line}}.
Composition: 1400 by 788 landscape (16:9). The group sits in the middle third, about 45% of the width, nothing important near the edges (the card crops to portrait at rest).
No Dreamy, no people, no characters. No text, letters, numbers, logo or watermark; a simple symbol such as a $ on a coin is fine.
```

Package: resize the chosen source to 1400 by 788 and save as WebP under 130 KB (sharp: resize(1400, 788, { fit: "cover" }).webp({ quality: 86 })). Check it on /play at rest (portrait) and active (16:9): the three objects stay whole in both.

### 6.8 Living worlds (code only, no image to make)

Every world except Finance gets its own atmosphere without a background image (Codex, 16 to 17 Oct 2026). src/components/glossary/worldScenes.ts turns the industry, its career world, the level number and the tier into a scene: a seed from the world name picks where the sun sits, and consecutive levels walk through dawn, day, dusk and night. There is no weather: the breeze, glint and drizzle motes were removed on 17 Oct 2026 (Chandu's decision); do not add weather back. The world's accent colours it; the tier deepens the atmosphere; mastered words warm the horizon; right answers, repairs and picks send brief light cues (a repair is a cool sweep, never a punishment flash). LivingWorld.tsx draws it and glossary-living-worlds.css styles it. The Levels map uses the same phase colours behind its plates.

Budget it keeps: four decorative nodes per scene, no new image, font, canvas, timer or event listener, transforms and opacity only, no filters, blur or backdrop sampling, everything stops under reduced motion. Finance returns null and keeps its original path. A world that one day needs a recognisable place can still register a panorama or silhouette (6.4, 6.5); never generate a background per industry or per level. Checked by node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-world-scenes.test.mjs.

## 7. Prompt D: Codex, generate and register the art for industry X

```
You are working in the Dreamari prototype repo. Pull origin/main. Read section 6 of docs/reference/glossary-scaling-sop-usman-2026-10-16.md (the prompt template, style locks, references, commands, file contract and acceptance gate).

TASK: generate and register the required art for the glossary industry [slug] (anchor: [anchor]; Level 1 terms with definitions: [paste the art list from the game-creation agent]).

1. Write the manifest docs/reference/glossary-[slug]-art-[mmmdd].json modelled on docs/reference/glossary-finance-art-oct13.json: version "[slug]-[mmmdd]", career "[slug]", the six style references, the prompt template and both style locks from the SOP, and five terms with id, slug and a brief that shows the meaning without the word and names the anchor.
2. node scripts/glossary-art.mjs prompts <manifest> and generate one image per prompt, attaching the three references for that theme every time. Save as <term-slug>-drift.png and <term-slug>-signal.png in a review folder.
3. Also generate the welcome illustration per theme (SOP 6.2) and save as welcome-drift.png and welcome-signal.png.
4. node scripts/glossary-art.mjs prepare <manifest> <review-folder>, then validate and preview. Convert the welcome images to public/images/glossary/[version]/{drift,signal}/welcome.webp (1024 square, transparent).
5. Register: CAREER_TERM_ART in src/components/glossary/termArt.ts for the term art; WELCOME_ART["[slug]"] in src/components/glossary/welcomeArt.ts for the welcome.
6. Check: npx tsc --noEmit and node scripts/qa/dreamy-reactions.test.mjs. Open /play/glossary/[slug]?theme=drift and ?theme=signal: the welcome shows the illustration beside Dreamy, Level 1 teach cards show the pictures, Level 2 cards show words only. Screenshot each.
7. Add a dated docs/AI_HANDOFF.md entry (what, why, prompts used, what was rejected and why). Commit; do not push. Chandu reviews, then releases the industry.

Rules that have shipped real bugs: one image per call; never chain off the last image; genuine transparency; no text or numbers in any image; Dreamy is a cloud with no limbs and appears only when the brief says so; Finance's art is never regenerated.
```

## 7b. Prompt D, filled in: the three Play tab games

**Done on 17 October 2026 (Codex).** Software, Aviation and Nursing now have their Level 1 art and welcome scenes in both themes: versions software-oct17, aviation-oct17, nursing-oct17, manifests and receipts in docs/reference/glossary-<slug>-art-oct17*.json, registered in termArt.ts and welcomeArt.ts, checked by scripts/qa/glossary-industry-art.test.mjs. The prompt below is kept as the worked example of Prompt D filled in; copy its shape for the next industry. It used to be a separate document; it now lives here.

```
You are working in the Dreamari prototype repo (Mustang9393/Dreamari). Pull origin/main first. Read section 6 of docs/reference/glossary-scaling-sop-usman-2026-10-16.md: the prompt template, both style locks, the references, the commands, the file contract and the acceptance gate are there. Dev server: npm run dev -- --webpack on a free port.

THE JOB
Generate, package and register the Level 1 term art and the welcome illustration, in both themes (Drift and Signal), for the three glossary games below, so Chandu can review them and release the games to the Play hub. Do not make art for any other level: Levels 2 and up teach with words by design. Do not touch Finance.

Industry (slug) | Hub card | Anchor (every example names it) | Student role | Register under
software | Tech Terms | Nova Notes, a note-taking app a small team is building | developer | software-engineer
aviation | Flight Terms | Skyline Air, a regional airline | pilot | airline-pilot
nursing | Medical Terms | Riverside Clinic, a community clinic | nurse | registered-nurse

LEVEL 1 TERMS (exact term, then its definition; a brief shows the meaning, never the word)
software, Level 1 "App Basics"
- App: A program people open on a phone or computer to do one job.
- User: A person who opens and uses a program.
- Feature: One thing a program can do for the people using it.
- Code: The written instructions that tell a computer what to do.
- Bug: A mistake in the instructions that makes a program act wrong.
aviation, Level 1 "Before Takeoff"
- Cockpit: The front part of a plane where the pilots sit and fly it.
- Runway: The long strip a plane speeds down to leave the ground or land.
- Preflight: The full check of a plane and its plan before it moves.
- Taxi: Driving a plane slowly on the ground between the gate and the strip.
- Takeoff: The moment a plane speeds up and lifts off the ground.
nursing, Level 1 "Clinic Basics"
- Patient: A person getting care from a nurse or doctor.
- Vital Signs: The body's basic numbers: heart rate, breathing, temperature and blood pressure.
- Chart: The written record of a patient's care.
- Dose: How much medicine a patient gets at one time.
- Triage: Sorting patients by how urgent their needs are.

WELCOME SCENES (one per industry per theme; a place, never a person; shown at about 300 px beside Dreamy)
- software: a small bright studio desk with a laptop showing a notes app, a plant, sticky notes, a mug.
- aviation: a regional jet at a gate under a control tower at dusk, a jet bridge, runway lights beyond.
- nursing: the front of a low community clinic with a lit entrance, a bench, a small sign post with no letters, an ambulance bay to one side.

BRIEFS TO MATCH IN REGISTER
- Finance, Investor (shipped): "Dreamy floats beside a short curved arrow directing a single gold coin toward a miniature sneaker boutique. This shows a person committing money to a business, not buying a shoe."
- Nursing, Triage: "Three small patient beds in a row at Riverside Clinic, one lit with a bright gold tag and pulled slightly forward, the other two dim and waiting. This shows the most urgent patient being chosen first."
- Software, Bug: "A small glowing notes app screen on a phone with one line of its content gone jagged and flickering red, a tiny gold wrench floating beside it. This shows a mistake inside the program, not an insect."
- Aviation, Taxi: "A regional jet rolling slowly along a painted yellow ground line toward the runway, wheels down, gate behind it. This shows the plane driving on the ground, not flying."

STEPS
1. For each industry, write docs/reference/glossary-<slug>-art-oct17.json modelled on docs/reference/glossary-finance-art-oct13.json: version "<slug>-oct17", career "<slug>", the six style references, the prompt template and both style locks from section 6.1, and five terms with id (the exact term above), slug (lowercase file name, e.g. "vital-signs") and brief.
2. node scripts/glossary-art.mjs prompts <manifest>. Generate ONE image per prompt, attaching that theme's three references every time. Never chain off the last image. Square 1024, genuinely transparent.
3. Save as <term-slug>-drift.png and <term-slug>-signal.png in a review folder. Run prepare, then validate, then preview.
4. Welcome: the same prompt with Asset type "one Dreamari welcome illustration: the workplace this glossary lives in, seen as a small composed scene" and Subject "<anchor>: <the scene line above>". Save to public/images/glossary/<version>/{drift,signal}/welcome.webp, 1024 square, lossless transparency.
5. Register: CAREER_TERM_ART in src/components/glossary/termArt.ts, keyed by the "Register under" slug and following the investment-banking entry; WELCOME_ART["<slug>"] = { drift, signal } in src/components/glossary/welcomeArt.ts.
6. Check: npx tsc --noEmit and node scripts/qa/dreamy-reactions.test.mjs. Open /play/glossary/<slug>?theme=drift and ?theme=signal: the welcome shows the illustration beside Dreamy, Level 1 teach cards show the pictures, ?lesson=2 shows words only. Screenshot each welcome and one Level 1 card per theme.
7. Run the acceptance gate in section 6.1. Add a dated docs/AI_HANDOFF.md entry: what you generated, the briefs, what you rejected and why. One commit per industry. Do not push.

Done looks like: three manifests, thirty term images in both sizes, six welcome images, three CAREER_TERM_ART entries, three WELCOME_ART entries, tsc and the reaction QA green, screenshots attached, nothing pushed.
```

## 7c. Prompt E: one prompt for a whole glossary world, end to end

The one prompt Usman needs per industry. Paste it to an agent in the repo with the industry name. It builds the game and all its levels, generates every graphic the game needs, releases it to the Play tab, and checks everything, stopping before any push. It chains Prompts A, B, D and C with the art steps of section 6, so those sections are the detail behind each part. Run 7d once per career world and 7e once for the whole app; Prompt E does not repeat them.

```
You are working in the Dreamari prototype repo (Mustang9393/Dreamari). Pull origin/main first. Read docs/handoff/specs/glossary-system.md, then docs/reference/glossary-scaling-sop-usman-2026-10-16.md in full: sections 2 (rules), 3 (every field and copy rule), 6 (art contracts and the acceptance gate) and 10 (guardrails and checks) are binding. Dev server: npm run dev -- --webpack on a free port. Never touch Finance.

INPUT
Industry: [e.g. "Cybersecurity"]
Notes from Chandu, if any: [optional]

PART 1. THE GAME (section 3, Prompt A)
Look the industry up in section 12 for its mode and career world. Choose the slug, the anchor (one company, clinic, airline, shop or site) and the student's role; Dreamy voices his lines with both, so pick a real place name and a one-word role. Write src/components/glossary/blueprints/<slug>.ts from the model blueprint culinary.ts and the blueprint with the same mode. Make Levels 1 to 4 playable (required) and Levels 5 and 6 playable too unless the notes say otherwise; every field and copy rule in section 3 applies. Register it in GLOSSARY_INDUSTRIES (src/components/glossary/data.ts), and in CAREER_INDUSTRY (industries.ts) if a catalog career owns it. Run npx tsc --noEmit and node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-blueprints.test.mjs until both pass. Do not release it yet.

PART 2. LEVEL 1 PICTURES, BOTH THEMES (section 6.1)
Write docs/reference/glossary-<slug>-art-<mmmdd>.json modelled on docs/reference/glossary-nursing-art-oct17.json: the six style references, the prompt template, both style locks and the five Level 1 terms, each with a brief that shows the meaning, never the word, and names the anchor. A brief without Dreamy ends "No Dreamy, no cloud shape, no eyes or face, no mascot." Run node scripts/glossary-art.mjs prompts <manifest>, generate ONE image per prompt with that theme's three references attached every time, save <term-slug>-drift.png and <term-slug>-signal.png in a review folder, then run prepare, validate and preview. Register in CAREER_TERM_ART (src/components/glossary/termArt.ts). If a term cannot be shown honestly, leave it without a picture.

PART 3. WELCOME SCENE, BOTH THEMES (section 6.2)
One composed scene of the anchor's workplace, never a person. Add welcome {brief, sources, prompts} to the manifest, generate both themes, run node scripts/glossary-welcome-art.mjs prepare <manifest> and validate <manifest>, and register WELCOME_ART["<slug>"] in src/components/glossary/welcomeArt.ts.

PART 4. PLAY TAB COVER (section 6.7)
Attach the four existing covers as references: public/images/app/glossary-finance-thumb-oct17b.webp, glossary-medical-thumb-oct17b.webp, glossary-flight-thumb-oct17b.webp, glossary-tech-thumb-oct17b.webp. Use the cover prompt in section 6.7 with the workplace and three objects that say the subject at a glance. No Dreamy, no people, no text. Save as public/images/app/glossary-<subject>-thumb-<mmmdd>.webp, 1400 by 788, under 130 KB, and check it on /play at rest and active.

PART 5. THE WORLD'S SIGNAL BACKGROUND, ONLY IF IT HAS NONE
If SIGNAL_WORLD_BACKDROPS in src/components/glossary/worldBackdrops.ts has no entry for this game's career world, run section 7d for that one world. Otherwise skip.

PART 6. RELEASE (section 5, Prompt C)
Add { careerSlug, title: "[Subject] Terms", sub: "Learn key [subject] terms", cover } to GLOSSARY_GAMES in src/components/play/games.ts (careerSlug is the catalog career slug, or the industry slug when none owns it), and add the slug to GLOSSARY_HUB_RELEASED in src/components/glossary/data.ts.

PART 7. CHECK EVERYTHING (section 10.3)
Run every command in 10.3, all green. In the browser: /play shows the new card and it opens the game; Skip through Level 1 in ?theme=drift and ?theme=signal; open ?lesson=2 to ?lesson=6 at &q=1, ?pp=1 and ?unlock=done; the welcome shows the scene beside Dreamy, Level 1 cards show the pictures, later levels show words only, the Levels map reads. Paste scripts/qa/glossary-alignment-audit.js and scripts/qa/glossary-contrast-audit.js on one screen of each kind at 1440x900 and 375x812, in both themes, with the app in light and in dark: both lists empty (disabled buttons excepted). Run the acceptance gate in section 6.1 on every image. Screenshot the welcome, one Level 1 card and the Play tab card in each theme.

PART 8. HAND OVER
A dated docs/AI_HANDOFF.md entry: what you built, the briefs, what you rejected and why, the checks. Commit the game and the art separately, the why in each message. Do not push; Chandu reviews and pushes.

Done looks like: the game on the Play tab with its cover, six levels that pass every rule, Level 1 pictures and the welcome scene in both themes, all checks green, screenshots attached, nothing pushed.
```

## 7d. Prompt F: Signal world backgrounds (one per career world)

Signal's sky is one pixel-art panorama per career world, so fifteen images cover all fifty industries, and every game under a world inherits its background the moment it is registered. Until a world has one, it shows the default city (public/images/glossary/signal/bg.webp). Run this once for every world, or for one world from Prompt E. The engine stretches each image to the screen height, repeats it in mirrored pairs (so the left and right edges never need to match), scrolls three bands at different speeds (sky: the top 35%; city: the middle; shore: the bottom 24%), lays the time of day over it as a light wash, and slices it for the Levels map.

```
You are working in the Dreamari prototype repo (Mustang9393/Dreamari). Pull origin/main first. Read sections 6.1 (Signal style lock), 6.4 and 10 of docs/reference/glossary-scaling-sop-usman-2026-10-16.md. Dev server: npm run dev -- --webpack on a free port.

THE JOB
Generate one Signal background per career world below, package each with the repo script, register it, and check it in the game. One image per call. Never chain off the last image: attach the same four references every time.

REFERENCES (attach all four to every call)
- public/images/glossary/signal/bg.webp: the shipped default. Match its palette, pixel density, dusk light, band layout and level of detail exactly; only the place changes.
- public/images/glossary/signal/cloud-sale-sneaker.webp, building.webp, coins-320.webp: the Signal pixel style.

PROMPT (replace the scene line per world)
Use case: game backdrop.
Asset type: one wide Dreamari pixel-art panorama for the Signal glossary game, used as a scrolling parallax background, repeated in mirrored pairs and cropped into strips.
Scene: [WORLD SCENE from the list below]
Composition: landscape 3:2 (1536 by 1024 is fine; it is resized to 1200 by 800). Four horizontal bands like the attached default: a dusk sky with soft pixel clouds and a few stars in the top third; a continuous, readable skyline of the world's buildings across the middle band, its tallest shapes below the top 15%; a calm strip of water, road or ground under it; a dark, quiet foreground walkway or edge (a railing, a fence, a curb, lamps) across the bottom quarter. Even detail across the full width, no single landmark within 10% of the left or right edge (the image is mirrored there), nothing that reads as a focal point the eye locks onto. No text, letters, numbers, signs with words, logos or UI. No people, no characters, no Dreamy. Opaque, no transparency.
STYLE: Authentic, carefully drawn 2D pixel art: stepped pixel outlines, visible square pixel clusters, clean three to four tone cel shading, dusk palette of blue, violet, pink and amber with warm lit windows. No antialiasing, no smooth gradients, no blur, no 3D render, no photographic light. Match the attached default panorama's palette, pixel density and dusk mood exactly; only the place changes.

WORLD SCENES (slug: scene)
- business-finance: a financial district: glass towers, a columned exchange building, a river with a stone embankment.
- tech-engineering: a tech campus: glass office blocks with lit windows, a low data centre, a radio mast, a footbridge over water.
- health-medicine: a hospital campus: a large hospital with a rooftop helipad, a low clinic, an ambulance bay, trees, a quiet road.
- arts-media-sport: an arts district: a stadium with floodlights, a domed theatre, a broadcast mast, colour-block murals with no words, a plaza.
- science-research: a research park: a domed observatory, lab buildings, a wind turbine, a lake.
- teaching-education: a college town: a school with a clock tower with no numbers, a library, trees, a sports field, a lamp-lit path.
- building-construction: a growing city: tower cranes, scaffolded buildings, a half-built bridge, a site fence.
- law-safety-justice: a civic centre: a columned courthouse with steps, a fire station, a domed city hall, a lamp-lit plaza.
- food-cooking: a harbour-front restaurant street: small restaurants with lit kitchen windows, awnings, a fish market, string lights, a dock.
- farming-animals-nature: open country: barns and a silo, rolling fields, a small vet clinic, a forest edge, a fence line and a pond.
- counseling-social-work: a neighbourhood: a community centre, row houses with lit windows, a park with benches, a small library.
- driving-flying-shipping: an airport by a harbour: a control tower, a terminal with a jet bridge, port cranes and a cargo ship, runway lights.
- factories-making-things: an industrial district: factory halls with sawtooth roofs, chimneys with soft steam, a warehouse, a rail line.
- fixing-machines-engines: a service district: a garage with roll-up doors, a truck depot, an aircraft hangar, a fuel stop, a road.
- personal-care-community-services: a main street: salons and barbershops with lit fronts and no words, a gym, a post office, a bus stop, trees.

PACKAGE AND REGISTER (per world)
1. Save the chosen source as output/glossary-signal-backdrops/<slug>.png (keep sources local; they do not ship).
2. node scripts/glossary-signal-backdrop.mjs prepare output/glossary-signal-backdrops/<slug>.png <slug>
   It writes public/images/glossary/backdrops/signal/<slug>.webp at 1200 by 800, opaque, under 180 KB, and prints the registry line.
3. Add that line to SIGNAL_WORLD_BACKDROPS in src/components/glossary/worldBackdrops.ts, keyed by the exact world name ("Health & Medicine").
4. node scripts/glossary-signal-backdrop.mjs validate, then npx tsc --noEmit.

CHECK (per world, in the browser)
Open a game in that world with ?theme=signal (the Glossary QA page in the hamburger menu lists them): the welcome, a question (?q=1), a sort, the Power Play (?pp=1) and the Levels map. The skyline scrolls with no visible seam or obvious mirrored landmark; nothing important hides behind the top bar, the mastery card or the answers; the bands line up (sky behind the bubble, skyline mid-screen, the dark walkway at the bottom); it reads in light mode under the daytime haze and in dark mode. Paste scripts/qa/glossary-contrast-audit.js on one question in each mode: the list stays empty. Reject and regenerate any image with text, people, a focal landmark at an edge, a non-pixel look, or a palette that drifts from the default.

HAND OVER
A dated docs/AI_HANDOFF.md entry: the worlds done, the scene lines used, what you rejected and why. One commit for the set, the why in the message. Do not push; Chandu reviews and pushes.

Done looks like: a registered, validated background for every world in the list, each checked in a live game in both modes, nothing pushed.
```

## 7e. Prompt G: the rest of the shared polish (once for the whole app)

These cover every world at once and are optional: the games are complete without them.

```
You are working in the Dreamari prototype repo (Mustang9393/Dreamari). Pull origin/main first. Read section 6 of docs/reference/glossary-scaling-sop-usman-2026-10-16.md. One image per call, never chain off the last image, no text, no people, Dreamy only where a part asks and never with limbs. Do not touch Finance.

PART 1. LEVELS MAP PLATES (section 6.3)
Generate the six strips in section 6.3 with its prompt and each theme's style lock: drift-beginner, drift-intermediate, drift-advanced, signal-beginner, signal-intermediate, signal-advanced. 1536 by 512 WebP, opaque, under 140 KB, in public/images/glossary/plates/. Register in PLATES in src/components/glossary/levelPlates.ts. Check the Levels map of two games in both themes at laptop and phone width: every title stays readable over every plate.

PART 2. DRIFT HORIZON SILHOUETTES (section 6.5)
Hand-made SVGs, no image generation: one flat dark horizon shape per career world, 1600 by 300, no interior detail, repeatable left to right, no text, no Dreamy, drawn from the same world scene list as section 7d (a hospital roofline, a runway and tower, restaurant rooftops and so on). Save to public/images/glossary/backdrops/drift/<world-slug>.svg and register in DRIFT_WORLD_SILHOUETTES (src/components/glossary/worldBackdrops.ts). Check Drift play and the Levels map in light and dark; the time-of-day wash still shows and everything stops under reduced motion.

PART 3. DREAMY'S REACTIONS IN MOTION (section 6.6)
Animate the Drift stills in this order: 10 (right answer), 09 and 14 (wrong answer), 16 and 12 (mastery and complete), 15 (review and hints), 08 (teach cards), 18 (Next). Deliver each as the four-frame WebP atlas in docs/reference/dreamy-drift-animated-oct15-v2.json so dreamyReactions.ts takes them without engine changes. Then draw the Signal pixel versions on the Signal Dreamy rig. Run node scripts/qa/dreamy-reactions.test.mjs.

EVERY PART
Run the acceptance gate in section 6.1 on what you made, the checks in 10.3, and a dated docs/AI_HANDOFF.md entry per part. One commit per part, the why in the message. Do not push.
```

## 8. The UI and the component library

A new industry needs no new UI. Every screen below is shared by all industries and both themes; the blueprint only supplies words. Each one is a live specimen in the Component Lab (/component-lab, group "Glossary game, live engine (Drift and Signal)") with every state its props allow, the edge cases at each copy limit, a Theme switch and a World picker. Port to production by taking layout, copy and behaviour from src/ and token names from the certified Figma export; never import design-tokens/ (AGENTS.md, docs/DESIGN_SYSTEM_ALIGNMENT.md). The engine is src/components/glossary/GlossaryLabGameExperience.tsx.

| Screen or piece | What it does | Variants and states in the lab |
|---|---|---|
| IntroScreen (welcome) | Level kicker, "Meet" and the anchor in the world's display face, one line, Start. | With welcome art (the art stacks above the copy and fits its box; narrow Signal puts Dreamy top-left); Dreamy alone (the scene grows to fit him); authored and generated; per-level art; light Signal puts the copy on a solid panel. |
| Teach cards (UnlockScreen, SketchFace) | One card per word: term, definition, the Level 1 picture, tap to flip to the example. A worked line ("$30,000 − $25,000 = $5,000") shows only on the back, with the example, never on the front (Chandu, 17 Oct 2026). | Picture (Level 1 only) or words only; 22-character term (scales down); acronym; definition at the limit; the underline follows the word. |
| UnlockCompleteScreen | "All five words unlocked" before practice. | Authored, generated. |
| QuestionScreen | One frame for every question: Dreamy, the bubble where Dreamy asks the situation as a question with the live hint under it, the scene card when there is one, the answers, inline feedback. | Definition; fill-in sentence; story card (which word); compare card; Catch the Misuse (document list); Match It Up (word to meaning, "Use it when"); Sort (two to four buckets, four to seven items, concept or word buckets); Select All (authored items or moments); Type the Term (word bank and input); Case (two to four steps, two or four options, number steps); Finance's Profit Builder and money cards; two-word options fall to a list; long pairs. |
| SceneCardView | The card above a prompt. | story, compare, figures, ledger, shares, split; story at 72 characters. |
| FeedbackPanel | Right, first miss ("Keep going", change your answer), revealed. | Right; wrong; last question; names the confusion; long line. |
| Review questions | Reverse Recall, drawn only for a word short of mastery. | Generated; authored. |
| DreamyFace, RewardPluses, SpeechBubble, StreakBanner | One Dreamy per screen; twelve Drift poses and four Signal reactions facing the content; pluses on a right answer; the streak every five. | Every pose; talking; reward; neutral, aside, wrong and right tones. |
| MasteryHud, ValuationTicker | Level title, progress, five anonymous mastery segments and a count; the company value (continuous story) or the milestone. | Fresh, mid lesson, all mastered, 30-character title; dollar and milestone forms. |
| PowerPlayIntroScreen, PowerPlayScreen | The finale: one paragraph, five blanks, a shuffled word bank, drag, tap or type. | Level 1 (five short lines), Level 3, generated, the longest Level 5 paragraph. |
| MasteryLoadingScreen, CompleteScreen | A fact while it saves; the summary, Next level (keeps the theme and settings). | Built, generated fact; next level available, last level. |
| TopBar | Back, Levels, theme switch, Restart, Skip (demo only), sound. | In play, intro. |
| LabLevelMap (Levels) | Every level of the world, the open card first: number and title as a header, then the five words, the goal, the facts and Play on the card's full width. | Continuous story (dollar unlocks), scenario thread (milestones), registered plate art, Dreamy by level state; Drift two-up small cards; Signal list. |
| Living world scenery | The asset-free time of day behind every screen (6.8); no weather. | Drift clouds, Signal panorama, both with phases. |
| Play hub glossary cards | One card per GLOSSARY_GAMES entry with its thumbnail; released opens the game, the rest show a lock. | Released, locked, active 16:9. |
| Error states | What a developer or student sees when something is wrong. | A broken blueprint against the content rules; a second against the reading and level rules; the unknown route 404; the hub release list. |

Adding a new screen kind is engine work, not industry work: add it to QuestionScreen, give it a specimen with every state in the Component Lab, run the alignment audit (10.3) and document it here.

## 9. How it scales

| Piece | What it costs per new industry | Where |
|---|---|---|
| The game | One blueprint file (about 150 lines of words) and one registry line. The generator builds seven to ten screens per level from four recipes; no UI code. | src/components/glossary/blueprints/, generate.ts, data.ts |
| Levels | Levels 1 to 4 required, 5 and 6 optional (playable or roadmap words), any further titles as roadmap. | REQUIRED_LEVELS in generate.ts |
| Look and feel | Nothing: pick one of the fifteen career worlds; it brings the accent, the display face and weight and the body face. Both themes come free, in light and dark. | WORLD_SYSTEMS in industries.ts |
| Atmosphere | Nothing: living worlds give each world its time of day. One Signal background per career world (7d) covers every industry under it. | worldScenes.ts |
| Required art | Five Level 1 term images and one welcome scene, each in two themes (twelve images), through the manifest and the two scripts. | termArt.ts, welcomeArt.ts |
| Optional art | Plates (six strips cover all fifty), a Signal panorama or a Drift silhouette per career world, a welcome per lesson. | levelPlates.ts, worldBackdrops.ts, LEVEL_WELCOME_ART |
| Release | One slug in GLOSSARY_HUB_RELEASED, one card and one thumbnail. No thumbnail, no card. | data.ts, play/games.ts |
| What does not scale | Finance stays hand-authored: its own content, art, Profit Builder, money scene cards and sneaker-shop welcome. Never copy it into a blueprint and never route it through the generator. | data.ts, data-finance-l2-4.ts |

A game is playable the moment its blueprint is registered, before any art: Levels 2 and up are words by design, and Level 1 shows words until its pictures are registered. Art and content can ship separately.

## 10. Every guardrail in place

### 10.1 Content: the validator refuses the blueprint

- The world exists; the slug is lowercase letters and dashes; the mode is one of the three; the student role is set.
- Levels 1 to 4 exist and are playable; five terms per playable level; three moments per term; no duplicate term, cue, definition or moment.
- Limits: term 22 characters; cue 34 characters and 7 words; definition 110; example 120; moment 72 and 12 words; sort item 34; Select All line 44; case step 80; case option 34; feedback 90 characters and two sentences; title 30; goal 48.
- Every sentence a student reads is 14 words at most; each level reads at grade 8 or below (Flesch-Kincaid, its own words not counted).
- Power Play: {1} to {5} once each, never in teaching order, never saying its own words; Level 1 at most 200 characters and five sentences with one blank each; Level 2 at most 240 with one blank each; Levels 3 and 4 at most 290; Levels 5 and up at most 330.
- No answer leakage: a definition, cue, moment, Select All line, case step or Power Play never says the word it asks for.
- Every example says its word; in a continuous story or scenario thread it names the anchor.
- Levels 3 and up: every term names a confusion that is another word of the same level.
- No digits, $ or % unless the level sets math: true; no dashes of any kind.
- Sort: two to four buckets, four to seven items, every item in a bucket and crediting a level word, no item says a bucket. Select All: four lines, one to three right. Cases: at most two per level, two to four steps, two or four options each.

### 10.2 Build: the builder throws

- No line of copy is shown twice in a lesson; Dreamy never says only a stock line (the QA script fails it); every term is credited at least twice in the main loop; never three screens of one shape in a row; generated feedback stays under 100 characters.

### 10.3 Checks to run before every commit

```
npx tsc --noEmit
node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-blueprints.test.mjs
node scripts/qa/dreamy-reactions.test.mjs
node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-industry-art.test.mjs
node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-world-scenes.test.mjs
node scripts/glossary-signal-backdrop.mjs validate
npm run tokens:check
```

Then in the browser: paste scripts/qa/glossary-alignment-audit.js into the console on one screen of each kind (?lesson=N&q=M) at 1440x900 and 375x812, in ?theme=drift and ?theme=signal. Its issues list must be empty. Then paste scripts/qa/glossary-contrast-audit.js on the same screens with the app in light mode (and again in dark): its low list must be empty apart from disabled buttons. ?pp=1, ?pp=intro, ?unlock=done and ?q= past the main loop open the Power Play, its intro, the unlocked screen and the review questions. It cannot see a clipped word inside a tile or a digit sitting low in its box: look for those by eye.

### 10.4 Layout and alignment, held in the CSS

- Every answer block fills the column and shares its edges with the bubble and the HUD, at every size. A screen scaled down to fit a phone is laid out wider first so its edges still match.
- Tiles in a row share one width and one height; a short last row is centred. Sort tokens use a column count picked from the item count; three buckets sit three across on wide screens, the third full width on phones.
- Match It Up: the cue column takes 60% on phones, cues centred and balanced, every cue inside its tile.
- No automatic hyphenation anywhere; a word breaks only if it is longer than its whole tile. Profit Builder operators never start a line; "=" never sits alone.
- Counters centre their digit in a fixed-height box in both themes. A long term scales down on the teach card instead of overflowing; its underline follows the word.
- Word banks are centred. The welcome scene grows to fit a lone Dreamy.
- Levels map: the open card is a header (number and title), then the words, then the goal, facts and Play on the full width; Drift phone cards two to a row with a square icon and a whole-word title, an odd last card centred; a phone page holds the whole chapter.
- Welcome symmetry: up to 860px wide, both themes use one column, the art then the copy, centred on the same axis, the copy capped at 520px; wider screens keep copy left and art right.
- Graphics sit above surfaces: welcome art and Dreamy stack over the copy panel, the art always fits inside its own box so it never covers text, and on narrow Signal screens Dreamy floats top-left over the scene, as in Drift.
- Light mode is its own palette, not dark mode on a pale sky. Signal's gold and cyan become deep amber (#a85a00) and deep teal (#0e7490); the hard navy drop shadows go and display words keep a faint gold echo; the welcome copy sits on a solid light panel with a navy title and a gold pixel shadow; the Start slab stays gold with dark ink; the empty mastery segments sit on a faint ink track. Every text line reads at 4.5:1 or better (3:1 for large type), disabled buttons excepted.
- Read docs/CROSS_BROWSER_GUARDRAILS.md before any layout work: students are on Windows laptops and Chromebooks.

### 10.5 Engine and experience

- No timers. One Dreamy per screen, the cloud itself, facing the content.
- Pictures only on Level 1, and only generated art: a card never shows an icon in place of a picture. Mastery is a count and five anonymous segments.
- Review questions are drawn only for words short of mastery, in a form the main loop never used. The Power Play's word bank is shuffled so it never mirrors the blanks.
- Next level keeps the theme and settings. The first miss offers a retry; the answer is revealed after the second.
- Animated layers use transforms and opacity only: no filters, blur or backdrop sampling. Reduced motion stops scene motion.
- Finance bypasses the generator and the living worlds. Its display face is Fraunces Bold (Chandu, 17 Oct 2026); its content never changes.

### 10.6 Images

- One image per call; return to the three references every time; genuine transparency; no text, letters or numbers; Dreamy only when the brief asks, with no limbs; object-only briefs say "No Dreamy, no cloud shape, no eyes or face, no mascot".
- Scripts package, validate and hash every set; budgets 140 KB large and 35 KB small; terms mapped by hand, never by keyword; Finance's art is never regenerated; the acceptance gate in 6.1 runs before any push.

### 10.7 Process

- Nothing is pushed to main without Chandu's go-ahead; nothing reaches the Play hub without Prompt C. The Play tab shows only glossaries with a thumbnail cover; the rest play from the hamburger menu's Glossary QA link (Chandu, 17 Oct 2026).
- Every demo-only piece carries a DEMO-ONLY comment. Every real change gets a dated docs/AI_HANDOFF.md entry and a commit that say why.
- Student copy at eighth grade, no dashes; the same in these docs.
- A new screen or state goes into the Component Lab in the same commit.

## 11. QA and release checklist (Chandu)

1. Open the hamburger menu, Glossary QA. The new industry is listed with its playable levels.
2. Play Level 1 in Drift with Skip, then Level 1 in Signal. Watch for clipped words, odd line breaks, a Dreamy facing away, a dollar meter where a milestone should be, and that the mastery segments fill without pointing at a word.
3. Open Level 3 and Level 4 in Drift and step through every screen with Skip: no two screens may show the same line, the sort must be concrete things into concept buckets, and each case must read as a real call. Then play one level without Skip, miss two answers on purpose, and check the review screens feel new.
4. Read the Power Play paragraph of each level once as a student would. Level 1 should be five short lines.
5. Run the alignment audit (10.3) on one screen of each kind in both themes at both sizes, and the contrast audit with the app in light mode and in dark.
6. Confirm Codex's Level 1 pictures, the welcome illustration and the Play tab cover are in place and on style.
7. Release with Prompt C (Prompt E does it as its Part 6).

## 12. The 50 industries: mode and career world

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

## 13. Where everything is

| Path | What |
|---|---|
| docs/handoff/specs/glossary-system.md | The locked spec. |
| docs/reference/glossary-scaling-sop-usman-2026-10-16.html, .md | This document, HTML and markdown. The only glossary SOP. |
| scripts/glossary-art.mjs | The term art script: manifest in, prompts out, packaging, validation, preview (section 6.1). |
| scripts/glossary-signal-backdrop.mjs | Packages and validates the Signal world backgrounds (6.4, 7d). |
| scripts/glossary-welcome-art.mjs, scripts/qa/glossary-art-source-preview.mjs | The welcome scene packager and the source contact sheet (6.1, 6.2). |
| src/components/glossary/worldScenes.ts, LivingWorld.tsx, glossary-living-worlds.css | Living worlds (6.8). |
| scripts/qa/glossary-industry-art.test.mjs, scripts/qa/glossary-world-scenes.test.mjs, scripts/qa/glossary-alignment-audit.js, scripts/qa/glossary-contrast-audit.js | Art, world scene, alignment and light-mode contrast checks (10.3). |
| docs/reference/glossary-<slug>-art-oct17*.json | The manifests and receipts of the three Play tab packs. |
| docs/reference/glossary-finance-art-oct13.json | The model manifest with the finance briefs. |
| src/components/glossary/generate.ts | Blueprint types (terms with moments; sort, selectAll, cases, powerPlay per level), the four recipes, the validator with the reading rules, the build-time assertions. |
| src/components/glossary/blueprints/ | culinary.ts (the model: every authored piece in use), health.ts, software.ts, aviation.ts; six levels each. |
| src/components/glossary/data.ts | GLOSSARY_INDUSTRIES, GLOSSARY_HUB_RELEASED, Finance's hand-authored levels. |
| src/components/glossary/industries.ts | The fifteen world design systems, CAREER_INDUSTRY. |
| src/components/glossary/termArt.ts, welcomeArt.ts, levelPlates.ts, worldBackdrops.ts | Image registries: term art, welcome, plates and the Dreamy state expressions, panoramas and silhouettes. |
| src/components/glossary/GlossaryLabGameExperience.tsx | The engine. |
| src/components/glossary/glossary-levels.css | The layout, alignment, light-mode and layering rules of 10.4, each with a dated why comment. |
| scripts/qa/glossary-blueprints.test.mjs, scripts/qa/dreamy-reactions.test.mjs | The blueprint and Dreamy checks (10.3). |
| /play-tools/glossary-qa | Every glossary, every level, both themes. Hamburger menu, Glossary QA. |
| /component-lab, "Glossary game, live engine" | Every piece in both themes with a World picker. |

## Appendix A. Joshua's Master Scaling Plan in full, with how the system holds each rule

### 1.1 Executive rules

These override anything else in the document.

| Rule | What it means | In the system |
|---|---|---|
| Finance stays exactly as it is | Everything here applies only to new glossary worlds. Finance and Investment Banking, including Business Basics and Investing Basics, do not change. Nothing is applied retroactively. | Finance is hand-authored in data.ts and data-finance-l2-4.ts. It never passes through the generator. |
| No timers | No countdown, no count-up, no timer in the header, no timed questions, no timer as a difficulty mechanic. Every new world, every new level. | The engine has no timer. The "4 min" on the Levels map is an estimate of length, not a clock. |
| No forced images | The Dreamari team decides whether a term has an honest, relevant image. No AI tool or content generator makes this decision. If the team decides no, the term gets no image. Never create an image to fill a slot. If a match-to-pictures question loses its pictures, it becomes match-to-meanings. | Levels 2 and up teach with words only. The team has decided Level 1 earns pictures everywhere (section 6). A flashcard shows generated art or nothing; it never shows an icon in place of a picture. Match It Up is always word to meaning. |
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
| World size | 4 initial levels per glossary world. | Validated: Levels 1 to 4 must be playable in every world. Levels 5 and 6 are optional, playable or locked roadmap words. Finance shows 20 level titles with 4 playable. |
| Vocabulary | 5 new core terms per level. 20 across Levels 1 to 4. | Validated: exactly five terms per playable level. |
| Lesson length | 7 to 10 scored interactions, including the final Power Play. | Seven derived screens plus the level's authored extras, seven to ten in all, plus 1 Power Play. Asserted by the QA script. |
| Term coverage | Every new term is introduced clearly, then used in applied context before the lesson ends. | Teach cards first; every term is credited at least twice in the main loop (asserted). |
| Power Play | Always one integrated final challenge. Never five screens for five terms. | One written paragraph with five blanks, never in teaching order, sized by level (Level 1 is five short lines, one blank each). The type allows nothing else. |
| Question clarity | Every screen asks an explicit question or action. Never "Complete the activity." | Every generated prompt is a question or an instruction. |
| Copy length | Context line about 12 words. Question about 18 words. Answer choices usually 7 words. | Each moment 12 words and 72 characters, cue 7 words and 34 characters, case step 80 characters, every sentence 14 words, feedback 90 characters, validated. |
| Reading difficulty | Roughly 8th grade. Difficulty comes from the concept, not the writing. | Validated since 17 Oct: a Flesch-Kincaid grade of 8 or below per level, with the level's own five words not counted, and no sentence over 14 words. |
| Answer leakage | Never put the answer inside the question, visual, heading, labels or setup. | Validated: a definition may not say its own word, a cue, a moment, a Select All line and a case step may not say the word they ask for. |
| Distractors | The right answer is not systematically the longest or most professional-sounding. | Distractors are the other terms of the same level, so lengths vary naturally. Answer position rotates by level. |
| Interaction diversity | No more than two consecutive screens with the same mechanic. | Asserted at build and in the QA script, by the shape the student sees (Dreamy's question, fill-in sentence, compare card, 2x2, match, sort, select, case, type). |
| Multiple choice | Useful, but mixed with matching, sorting, fill-in-the-blank, error identification, comparison, sequencing, decisions. | Each recipe mixes Dreamy's questions, fill-in sentences, compare cards, match, sort, select-all, cases and type. |
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
| 1 | Definition: the five definitions as options (1) | Dreamy asks m0, which word (1) | Compare card, term 1 beside its confusion, m0 decides (1) | Dreamy asks m0, which word you need (1) |
| 2 | Match It Up, word to meaning (all) | Fill in the blank: m1, then "That is ___." (2) | Dreamy asks m0 (3) | Compare card, term 2 (2) |
| 3 | Fill in the blank, m1 (5) | Dreamy asks m0 (3) | Sort: the authored concept sort, else m1 of terms 2 to 5 into the words | Match It Up, "Use it when" (all) |
| 4 | Dreamy asks m0 (3) | Select All, authored or derived (4) | Select All about term 2 | Fill in the blank, m1 (3) |
| 5 | Sort: authored, else m1 of terms 1 to 4 into the words | Match It Up (all) | Fill in the blank, m1 (1) | Select All about term 4 |
| 6 | Catch the Misuse (4) | Catch the Misuse (5) | Catch the Misuse against the confusion (4) | Catch the Misuse (5) |
| 7 | Type the Term from m2 (2) | Type the Term from m2 (1) | Type the Term from m2 (5) | Type the Term from m2 (1) |
| extra | An authored Select All or case, if written | Cases (one or two) | Cases | Cases, and an authored sort |
| finale | Power Play: the level's written paragraph, all five words, blanks never in teaching order, word bank shuffled, size by level. |  |  |  |

The review (one Reverse Recall per word, the definition read aloud) is drawn only for words still short of mastery and never appears in the main loop. Live proof of all four recipes with every authored piece: /play/glossary/culinary?lesson=1 through lesson=6, the model blueprint.

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
| 47 | Culinary Arts (built, 6 levels) | practice_world | Food & Cooking | Fast kitchen challenges: knife skills, methods, temperatures, service. |
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

**In the system:** Level 1 of every industry gets pictures for its five terms and one welcome illustration (decision of 16 October, section 6). Every later level teaches with words: words-only teach cards, anonymous mastery segments, no pictures on match, sort or card backs. A flashcard never shows an icon in place of a picture.

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
