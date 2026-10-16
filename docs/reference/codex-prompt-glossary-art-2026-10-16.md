# Codex prompt: generate and register the art for the three Play tab glossary games

Paste everything below the line to Codex as one message. It is self-contained: the three industries, their anchors, every Level 1 term with its authored definition, the formats, the prompts, the pipeline and the registration steps. Finance already has its art and is not part of this job.

---

You are working in the Dreamari prototype repo (Mustang9393/Dreamari). Pull origin/main first. Read docs/handoff/play-sop/12-glossary-art-pipeline.md (the term art pipeline and the script that drives it) and section 6 of docs/reference/glossary-scaling-sop-usman-2026-10-16.html (the image brief). Dev server: `npm run dev -- --webpack` on a free port.

## The job

Three glossary games are built and play with words only. Each needs its Level 1 term art and its welcome illustration, in both themes (Drift and Signal), generated, packaged and registered, so Chandu can review them and release the games to the Play hub. Do not generate art for any other level: Levels 2 and up teach with words by design. Do not touch Finance.

| Industry (slug) | Hub card | Anchor (the place every example names) | Student role | Mode |
|---|---|---|---|---|
| software | Tech Terms | Nova Notes, a note-taking app a small team is building | developer | continuous story |
| aviation | Flight Terms | Skyline Air, a regional airline | pilot | scenario thread |
| nursing | Medical Terms | Riverside Clinic, a community clinic | nurse | scenario thread |

### Level 1 terms and their authored definitions (the brief shows the meaning, never the word)

**software (Nova Notes), Level 1 "App Basics"**
- App: A program people open on a phone or computer to do one job.
- User: A person who opens and uses a program.
- Feature: One thing a program can do for the people using it.
- Code: The written instructions that tell a computer what to do.
- Bug: A mistake in the instructions that makes a program act wrong.

**aviation (Skyline Air), Level 1 "Before Takeoff"**
- Cockpit: The front part of a plane where the pilots sit and fly it.
- Runway: The long strip a plane speeds down to leave the ground or land.
- Preflight: The full check of a plane and its plan before it moves.
- Taxi: Driving a plane slowly on the ground between the gate and the strip.
- Takeoff: The moment a plane speeds up and lifts off the ground.

**nursing (Riverside Clinic), Level 1 "Clinic Basics"**
- Patient: A person getting care from a nurse or doctor.
- Vital Signs: The body's basic numbers: heart rate, breathing, temperature and blood pressure.
- Chart: The written record of a patient's care.
- Dose: How much medicine a patient gets at one time.
- Triage: Sorting patients by how urgent their needs are.

### Welcome illustrations (one per industry per theme)

One composed scene of the workplace, never a person, one readable silhouette, shown at about 300 px beside Dreamy:
- software: a small bright studio desk with a laptop showing a notes app, a plant, sticky notes, a mug.
- aviation: a regional jet at a gate under a control tower at dusk, a jet bridge, runway lights beyond.
- nursing: the front of a low community clinic with a lit entrance, a bench, a small sign post (no letters), an ambulance bay to one side.

## Steps

1. For each industry, write a manifest `docs/reference/glossary-<slug>-art-oct17.json` modelled exactly on `docs/reference/glossary-finance-art-oct13.json`: `version` "<slug>-oct17", `career` "<slug>", `styleReferences` for drift and signal (the six files below), `promptTemplate` (the prompt below), `styles` (the two locks below), and `terms`: five entries with `id` (the exact term string above), `slug` (lowercase file name, e.g. "vital-signs"), `brief` (one or two sentences showing the meaning without the word, with the anchor written in, naming the one thing the eye must read first).
2. `node scripts/glossary-art.mjs prompts <manifest>` prints one prompt per term per theme with the reference paths. Generate ONE image per prompt in ChatGPT image generation, attaching that theme's three references every time. Never chain off the last generated image; return to the references. Square 1024, genuinely transparent.
3. Save into a review folder as `<term-slug>-drift.png` and `<term-slug>-signal.png`. Run `node scripts/glossary-art.mjs prepare <manifest> <review-folder>`, then `validate`, then `preview`. The script writes the WebP sizes under `public/images/glossary/<version>/{drift,signal}/`.
4. Generate the welcome illustration per theme with the same prompt, Asset type "one Dreamari welcome illustration: the workplace this glossary lives in, seen as a small composed scene" and Subject "<anchor>: <the scene line above>". Convert to `public/images/glossary/<version>/{drift,signal}/welcome.webp`, 1024 square, transparent, lossless alpha.
5. Register. Term art: add each industry to `CAREER_TERM_ART` in `src/components/glossary/termArt.ts` (key: the example career slug `software-engineer`, `airline-pilot`, `registered-nurse`) with the version folder and the term-to-slug map, following the finance entry. Welcome: add `WELCOME_ART["<slug>"] = { drift: "...", signal: "..." }` in `src/components/glossary/welcomeArt.ts`.
6. Check: `npx tsc --noEmit` and `node scripts/qa/dreamy-reactions.test.mjs`. Open `/play/glossary/<slug>?theme=drift` and `?theme=signal` for each: the welcome shows the illustration beside Dreamy; Level 1 teach cards show the pictures; `?lesson=2` cards show words only; the Levels map still shows icons. Screenshot each welcome and one Level 1 card per theme.
7. Add a dated `docs/AI_HANDOFF.md` entry: what you generated, the briefs you used, what you rejected and why. Commit with the why in the message. Do not push; Chandu reviews and releases.

## References to attach (style and character anchors, never edit targets)

- Drift: `public/images/glossary/themes-oct08/drift/customer.webp` (character), `company.webp` (object and materials), `profit.webp` (currency).
- Signal: `public/images/glossary/signal/cloud-sale-sneaker.webp`, `building.webp`, `coins-320.webp`.

## The prompt (promptTemplate)

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

## Brief examples to match the register

- Finance, Investor (shipped): "Dreamy floats beside a short curved arrow directing a single gold coin toward a miniature sneaker boutique. This shows a person committing money to a business, not buying a shoe."
- Nursing, Triage: "Three small patient beds in a row at Riverside Clinic, one lit with a bright gold tag and pulled slightly forward, the other two dim and waiting. This shows the most urgent patient being chosen first."
- Software, Bug: "A small glowing notes app screen on a phone with one line of its content gone jagged and flickering red, a tiny gold wrench floating beside it. This shows a mistake inside the program, not an insect."
- Aviation, Taxi: "A regional jet rolling slowly along a painted yellow ground line toward the runway, wheels down, gate behind it. This shows the plane driving on the ground, not flying."

## Rules that have shipped real bugs here

- One image per call. Never a sheet of five.
- Return to the references for every prompt; never chain off the previous output.
- Genuine transparency; no ground rectangle; no card frame.
- No text, letters, numbers, logos or formulas anywhere in an image.
- Dreamy is a floating cloud with no limbs and appears only when the brief says so.
- Finance's art is never regenerated.
- Abstract terms are allowed to be shown as a situation rather than an object (the Triage and Bug briefs above); never a letter or a symbol standing in for the word.

Done looks like: three manifests, thirty term images and six welcome images in the repo in both sizes, three CAREER_TERM_ART entries, three WELCOME_ART entries, tsc and the reaction QA green, screenshots attached, one commit per industry, nothing pushed.
