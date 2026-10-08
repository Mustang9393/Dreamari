# Play SOP, chapter 10: our SOPs and the automation handoff (for Usman)

> **From:** Chandu (UI/UX, Level 1 design system). **To:** Usman (engine, schema, automation), with Mika (images). **Date:** 8 Oct 2026.
>
> **Why this exists.** Joshua's three SOPs (SOP 1 Content & Gameplay, SOP 2 Visual & Image Production, SOP 3 Screen Map & Handoff, all v2.0, Investment Banking Level 1 as the master reference) describe *what* a simulation is and *what it should look like*. They do not cover how a character gets into a scene: no sprites, no cut-outs, no expression or pose sets, no positioning, no file specs, no tools, no machine checks. Our pipeline already does most of that in code. This chapter writes it down as four SOPs (4 to 7, continuing Joshua's numbering) plus everything Usman needs to automate it on Windows, so new careers can be produced without Joshua's manual attention.
>
> **Read with:** chapter 8 (`08-new-career-art-pipeline.md`, the commands in depth), chapter 9 (`09-no-codex-art-path.md`, extraction from composed scenes), chapter 7 (`07-art-direction-and-prompts.md`), and `docs/handoff/sprite-master-prompt.md`.

---

## 0. The short version

1. **One career = three files of content plus art.** The script (a level `.ts` file in Joshua's SOP 3 dataset shape), one art manifest (`src/components/play/art/<career>.json`), and the images in `public/images/play/<folder>/`.
2. **Characters are separate cut-out sprites standing in empty rooms**, not painted into every scene. That is what lets one character be reused across 45 to 55 screens and lets the UI move people out from under dialogue cards. The full composed hero scenes Joshua's SOP 2 describes are still used for story events (a person leaving, a fault found).
3. **Most of the pipeline is already scripted in Node with `sharp`** and runs on Windows: `art:new`, `art:prompts`, `art:process`, `art:place`, `art:qa`, `art:validate`, `art:route`.
4. **Two steps are macOS-only today:** `art:extract` (cutting people out of composed scenes with Apple Vision) and the career-photo face detector (`scripts/career-photos/faces.swift`). Section 7 gives Windows replacements and exact output contracts so they drop in.
5. **The machine checks positioning; people check identity and style.** The Scene review page (Quick links, section 6) and `art:qa` flag every crop and face problem at five screen sizes; a person only looks at what is flagged.
6. **One thing needs Joshua's sign-off:** SOP 2 rejects anything that "looks pasted onto the background" (§84, §96). Sprites are composited by design, so SOP 5 below defines how a composited character passes that test. Raise it with Joshua before scaling.

---

## 1. How our SOPs fit Joshua's

| Joshua's SOP | Covers | Gap we fill |
|---|---|---|
| SOP 1 Content & Gameplay | story, screens, scoring, copy, Master Screen Map | nothing; we follow it |
| SOP 2 Visual & Image Production | image actions (NEW / REUSE / VARIANT / UI ONLY), continuity locks, character registry, style gates, prompts for full scenes | **sprites, cut-outs, expression/pose sets, positioning, file specs, tools, compositing rules** |
| SOP 3 Screen Map & Handoff | the 26-field dataset, Screen IDs, component mapping, QA views | **the art manifest the engine reads, asset naming, machine QA** |
| **SOP 4 (ours) Character Positioning** | where a person stands in a room, at what size, at every screen size | |
| **SOP 5 (ours) Character Isolation** | making clean transparent cut-outs, and compositing that passes SOP 2 §84 | |
| **SOP 6 (ours) Sprite Expressions & Poses** | which faces each character gets, how they are made and named, how they map to answers | |
| **SOP 7 (ours) Engineering & Automation** | the pipeline, commands, data contracts, approval gates, Windows path, what to build next | |

**Where Joshua's terms map to ours:** his Asset ID for a room = our `locations` key; his canonical character reference = our cast entry plus the approved `welcoming`/`composed`/`confident` sprite; his Image Action "REUSE + UI CHANGE" = a beat with no `art`, which falls back to its routed room; "NEW IMAGE" for a story event = a hero image on the beat (`Beat.art`); "VARIANT" day/night = a second location (`<room>-night`).

---

## 2. SOP 4: Character Positioning

### 4.1 The model: rooms, slots and a foot line

Every room (Joshua's canonical environment) is an **empty plate**, 16:9, no people. A character sprite stands in it at a **slot**:

| Field | Meaning |
|---|---|
| `baselineY` | the **foot line**: where the bottom of the sprite sits, as a fraction of scene height from the top. Above 1 pushes the legs below the frame on purpose (the dialogue card covers them anyway). Range 0 to 3. |
| `heightFrac` | the sprite's rendered height as a fraction of scene height. Range 0.1 to 3. |
| `centered` | default true: the speaker always stands at 50% across. |
| `x` | used only when `centered: false` (side-by-side scenes). |

A room has either one `characterAnchor` (one person at a time) or `characterAnchors[]` (one slot per person, in story order, for two or more).

**Standard slots (use these, do not invent numbers):**

| Sprite standard | Slot | Reads as |
|---|---|---|
| Full figure (1024x2048) | `x 0.5, baselineY 1.78, heightFrac 1.75` | head to hips visible, face in the upper third, legs behind the dialogue card |
| Waist-up legacy (IB, AMT) | `x 0.5, baselineY 0.99, heightFrac 0.9` | waist-up portrait |

The scripts choose the slot automatically (`slotFor()` in `scripts/play-art/lib/manifest.mjs`).

### 4.2 Height hierarchy (Joshua: "Marcus slightly taller than Christina")

Per beat, `castScale: { "Marcus": 1.08 }` scales one character. Use **1.04 to 1.10** for seniority; never more (SOP 1 §11: "subtle, not exaggerated"). Because every sprite is drawn with the same camera and figure scale (SOP 6), an unscaled cast already reads at true relative height.

### 4.3 Crop: focal points per room

Rooms render `object-cover`, so each room stores where to crop:

- `focal {x, y}` for screens 640px and wider; `mobileFocal {x, y}` below 640px.
- **Computed automatically** by `art:place` (part of `art:process`): it finds the **standing column**, the least cluttered 12%-wide strip in the bottom 55% of the plate (Sobel edge density on a 192x108 greyscale probe, with a centre bias), and solves the crop so that column lands under the speaker at both a 1440x900 laptop and a 390x844 phone.
- A person hand-tunes a room only when flagged, and then sets `locked: true` so scripts never overwrite it.

### 4.4 The UI safe zone (Joshua's "do not cover the action")

The dialogue card is the main obstruction. Its zone is modelled exactly as the player draws it:

| | Phone (under 640px) | Desktop |
|---|---|---|
| Side padding | 12px | 20px |
| Max width | 620px | `min(880, max(620, 0.43 x width))` |
| Height | 225px | 215 x width / 620 |
| Lift from bottom | 3% of height | 4% of height |

**Rules a placement must pass (machine-checked, section 6):** the head is never cropped; the face sits in the **upper third** of the frame (the CLI allows up to 40%); the face is never inside the dialogue zone; the face is never off the side of the frame. The HUD keeps the top 76px clear for hero framing.

### 4.5 Hero scenes (story events)

A composed hero image on a beat (`Beat.art`) can set `artPosition` (a CSS object-position) or `artFrame` (`ratio`, a `focus` box with `x0,y0,x1,y1`, optional `maxScale` default 2, and a `highlight` ellipse). `HeroCamera` fits the focus box into the free band between the HUD and the measured dialogue card. Use it when the story depends on seeing something (Joshua's "the intern leaving must stay visible").

### 4.6 Which room a beat plays in

`beatLocations` in the manifest maps every beat id to a room. `npm run art:route` writes it: Claude reads the level and routes by our house style (work floor is home; the very first beat is the exterior; meetings only when people are in a room; mentor teaching in the break room; night from 6 pm; specialist room only when the moment is there; continuity until the story moves). Measured: 64% match to hand routing with Claude, 46% with the offline rules engine. **A person reviews the routing table** (one line per beat) before art QA.

### 4.7 Positioning checklist (per career)

- [ ] Every room has an alt text of 10+ characters, not "TODO".
- [ ] `art:qa` reports no errors; warnings are reviewed.
- [ ] Scene review shows "Nothing flagged" with "Flagged only" on.
- [ ] Every multi-person room has one anchor per person.
- [ ] Seniority scale between 1.04 and 1.10 where the script calls for it.

---

## 3. SOP 5: Character Isolation (cut-outs)

### 5.1 The output spec (every sprite, every career)

| Property | Value |
|---|---|
| Canvas | **1024 x 2048**, transparent |
| Figure | full figure, head to shoes, filling 94% of the height: **4% empty above the hair, 2% below the shoes**, centred |
| Alpha | true transparency; clean anti-aliased edge; **no** white fringe, dark halo, outline, glow |
| Floor | **no** cast shadow, floor, ground ellipse (the player adds one soft drop shadow: `0 18px 30px rgba(0,0,0,.45)`) |
| Format | **WebP**, quality 90, alpha quality 100 |
| Budget | 250 KB per file (warning above) |
| Path | `public/images/play/<folder>/expressions/<character>-<expression>.webp` |
| Face chip | 512 x 512 WebP `face-<character>.webp`, cut automatically from the alpha |

### 5.2 Three ways to get a cut-out

**Path A (preferred): the generator gives a transparent PNG, or a flat green screen.** `npm run art:process -- <career>` (Node + sharp, any OS):

1. Checks for real alpha (any alpha below 250 on a 64x64 sample).
2. If none (or `--green`): chroma key. Alpha follows green dominance `G - max(R,B)`: 12 or less stays opaque, 100 or more is fully clear, linear between. Despill pulls green toward `max(R,B)` on the edge ring.
3. Drops stray specks (4-connected islands smaller than `max(24 px, 0.002% of frame)`).
4. Trims to the alpha box, scales to 94% of 2048, centres on the 1024x2048 canvas, exports WebP.
5. Cuts the face chip: hairline = first alpha row with more than 4 opaque pixels; head height = figure height / 7.5; eyes at 42% of a square crop with 15% margin.

**Green-screen prompt fallback:** if a generator cannot output true alpha, ask for "a plain flat pure green #00FF00 background, no shadow on the background, no floor".

**Path B: only composed scenes exist.** `npm run art:extract -- <career>` (**macOS today**, see section 7 for Windows): finds every person in each scene (Apple Vision foreground instance mask plus person detection), sorts scenes into `plates/` (nobody), `heroes/` (two or more people in one cut-out) and `cutouts/` (one person each), then refines hair edges (`refine.mjs`, portable): within a 10-unit band of the mask edge, alpha is re-solved by projecting each pixel onto the local foreground-to-background colour line, edges are un-mixed, specks dropped. A person names each cut-out in `cutouts/assign.json` (`"hangar-maya-1.png": {"name": "maya-welcoming"}`) and runs `npm run art:extract -- <career> --assign`. Cut-outs that touch the bottom edge switch the career to the waist-up slot.

**Path C (historic):** hand-keyed RN masters and Joshua's IB 2K clean sprites. Do not repeat; Path A replaces both.

### 5.3 Passing Joshua's "pasted on" test (SOP 2 §84) with a composited character

Propose this to Joshua as an amendment to SOP 2: **a composited sprite is acceptable when it passes the integration test below.** Every item is controlled by our spec:

| SOP 2 §84 check | How a sprite passes |
|---|---|
| Lighting direction | Every sprite and every plate uses the same key: soft, neutral, slightly warm, from **upper front-left**. Written into both prompts. |
| Colour temperature | Sprites are lit neutral so they sit in any room; rooms carry the career's colour identity (SOP 2 §82). |
| Ground contact / shadow | Feet sit below the dialogue card (full-figure slot) so no floor contact is ever visible; one soft drop shadow grounds the figure. |
| Scale and perspective | One camera for everything: eye level, straight-on to slight 3/4, 50mm-equivalent; the slot fixes the scale. |
| Style match | Same reference images attached to sprite and plate prompts (SOP 2 §87 layers 1 to 3). |
| Edge quality | No fringe/halo (machine-checked: green-fringe share of edge pixels under 15%). |

Where a moment needs real interaction between person and place (sitting at a desk, working on an aircraft, two people touching), **use a composed hero scene instead of a sprite** (Joshua's SOP 2 path). Sprites are for standing, talking and reacting.

### 5.4 Isolation checklist

- [ ] 1024x2048, true alpha, 4%/2% margins, full figure, no floor or shadow.
- [ ] No fringe or halo against both a light and a dark background (Scene review shows both).
- [ ] Same camera, light and scale as the rest of the cast.
- [ ] Face chip shows the face, not the hairline or chest (`art:process` flags every chip for a glance).

---

## 4. SOP 6: Sprite Expressions & Poses

### 6.1 Who gets which faces

| Role | Expressions | Example |
|---|---|---|
| **mentor** (supervisor) | welcoming, proud, concerned | Christina, Rosa |
| **judge** (senior evaluator) | composed, assessing, concerned | Marcus |
| **peer** (rival/coworker) | confident, focused, uncertain | Jordan, Tyler |
| **top** (big boss, cameo) | composed only | |

### 6.2 The expression vocabulary (use these exact definitions)

- **WELCOMING** (neutral-positive default): relaxed upright posture, warm easy smile, one hand loosely at the side or mid gesture. Approachable.
- **PROUD** (positive reaction): brighter genuine smile, chin a touch higher, posture open. Quiet approval, never celebration or arms in the air.
- **CONCERNED** (negative reaction): brows drawn slightly, mouth closed and flat or a small frown, weight shifted, maybe arms loosely crossed. Disappointed but professional. Never angry, never cartoonish.
- **CONFIDENT** (peer default): easy assured smile, open posture, slightly performative.
- **FOCUSED** (peer neutral): attention forward, mouth neutral, hands at task.
- **UNCERTAIN** (peer negative): hesitant expression, shoulders slightly in, one hand raised in a small self-conscious gesture.
- **COMPOSED** (senior default): still, straight, unreadable calm authority, hands folded or one in a pocket.
- **ASSESSING** (senior evaluating): composed, but eyes clearly appraising, head fractionally tilted, mouth neutral.

A file whose last hyphen part is not one of these eight is treated as `default` with a warning.

### 6.3 How faces map to answers (automatic)

`art:process` wires each character's `tiers`, which the player shows after an answer (SOP 1 scoring tiers):

| Answer tier | Face shown |
|---|---|
| default (before answering) | first of welcoming, composed, confident, assessing, focused |
| best | proud, else confident |
| acceptable | welcoming, else focused, else composed |
| wrong, risky | concerned, else uncertain |

Extra named poses (`poses`, e.g. AMT Maya `confident`) are used by a beat's `castPose` for non-reaction moments.

### 6.4 Keeping one person one person (Joshua's continuity lock)

1. **Turnaround first.** Approve one canonical sprite per character (the default face) against Joshua's Character Identity Card (SOP 2 §78) before generating the other expressions. Never batch a cast before this.
2. **Attach the approved sprite to every later prompt** as "the single source of truth for identity and art style" (SOP 2 §79: never regenerate from text alone).
3. **One identity sentence per character** in the cast table (skin, hair, age, build, jewellery, exact wardrobe, props), pasted unchanged into every prompt.
4. **Only the face and body language change** between expressions; wardrobe identical across the set.
5. **No seed locking exists today.** If the generator API supports seeds or reference-image strength, record them in the manifest (section 7.5, item 5).

### 6.5 The sprite master prompt

The frozen prompt is `docs/handoff/sprite-master-prompt.md`; `npm run art:prompts -- <career> --cast cast.json --rooms rooms.json` writes the per-career pack (`art-intake/<career>/PROMPTS.md`), changing only the CAST block. Its OUTPUT SPEC, POSE/EXPRESSION VOCABULARY and ACCEPTANCE CHECKLIST sections are the contract; do not edit them per career. Prepend Joshua's **DREAMARI VISUAL REFERENCE LOCK** header (SOP 2 §91) and, for a new character, his **NEW DREAMARI CHARACTER** block (§92).

**Single-expression prompt from an approved cut-out** (when one face is missing):

> Use the attached character as the exact reference: same face, same hair, same outfit and badges, same props, same anime cel-shaded art style and the same lighting. Draw only this person, facing the viewer, centred, with a **[EXPRESSION]** expression: [definition from 6.2]. Plain flat #00FF00 green background, no shadow on the background, no floor, no other people, no text, no logos. Same framing and scale as the reference.

**Empty room (plate) prompt** (`art:prompts` writes this per room):

> Generate a people-free interior/exterior scene: [description], [time]. No people, no reflections or shadows implying a person just left frame. 16:9, at least 1920x1080, camera at eye level, no dramatic tilt or fisheye. The floor at the horizontal centre of the frame (x 40% to 60%) must be clear and continuous from the bottom edge up to about 45% of the height: a character cut-out stands there. No text, readable signage, readable screens, logos or real brands anywhere. Same illustration style, line weight and colour grade as this career's other references.

### 6.6 Expressions checklist

- [ ] Primary characters have three sprites, secondary characters one.
- [ ] Every file name is `<character>-<expression>` from the eight-word vocabulary.
- [ ] Cast contact sheet (all sprites side by side) passes Joshua's §89 check: everyone distinguishable, nobody looks like another career's character.

---

## 5. SOP 7: Engineering & Automation

### 7.1 The pipeline, end to end

| # | Step | Who | Tool | Output |
|---|---|---|---|---|
| 1 | Career brief, story, Master Screen Map | Content (SOP 1) | LLM + review | level script dataset |
| 2 | Visual plan, Image Manifest, Character Identity Cards | Art lead (SOP 2) | LLM + review | rooms list, cast list |
| 3 | **Gate 1: style calibration frame** (one character in one room vs IB) | **Joshua or Chandu approves** | | approved reference |
| 4 | Scaffold the career | Engine | `npm run art:new -- <id> --folder <short> --firm "<Firm>"` | `art-intake/<id>/`, starter manifest |
| 5 | Write the prompt pack | Engine | `npm run art:prompts -- <id> --cast cast.json --rooms rooms.json` | `PROMPTS.md` |
| 6 | Generate canonical sprites (one per character), then **Gate 2: cast approval** | Mika generates; **Chandu/Joshua approve** | image generator | approved turnarounds |
| 7 | Generate remaining expressions, plates, heroes | Mika or automated (7.5) | image generator | `art-intake/<id>/sprites`, `plates`, `heroes` |
| 8 | (only if just scenes exist) extract people | Engine | `art:extract` (Mac) or the Windows path (7.3) | cut-outs, plates, heroes |
| 9 | Process everything | Engine | `npm run art:process -- <id>` | WebP sprites, face chips, plates, heroes, cast wiring, auto placement |
| 10 | Route beats to rooms | Engine | `npm run art:route -- --level L.json --manifest M.json --write` | `beatLocations` |
| 11 | Machine QA | Engine | `npm run art:qa -- <id>`, `art:validate` | report; fix or regenerate |
| 12 | **Gate 3: story contact sheet + Scene review** | **Chandu approves** | `/play-tools/scene-review` | "Nothing flagged" + identity/style sign-off |
| 13 | Register the career | Engine | one import line in `src/components/play/art/index.ts` | live in the player |

**Build once:** the player, the components (SOP 3 §58), the manifest schema, the scripts, the Scene review page, the prompt templates, the room library. **Generate per career:** the script dataset, cast and rooms JSON, sprites, plates, heroes, routing. **Human approval only at Gates 1 to 3** and the routing table glance.

### 7.2 Data contracts

- **Art manifest**: `src/components/play/art/<career>.json`, schema `career-art.schema.json`, types `types.ts`. Top level: `career`, `folder`, `spriteStandard` (`full-figure-1024x2048` or `waist-up-legacy`), `notes[]`, `locations{}`, `cast{}`, `portraitRatios{}`, `beatLocations{}`.
  - Location: `src` (must start `/images/play/`), `alt`, `focal`, `mobileFocal`, `characterAnchor` or `characterAnchors[]`, `note`, `locked`, `role` (`work-floor`, `work-floor-night`, `private-meeting`, `formal-meeting`, `break`, `transition`, `arrival`, `specialist`).
  - Cast member: `default`, `tiers` (`best`, `acceptable`, `wrong`, `risky`, `none`), `poses`, `face`, `voicePitch` (200 to 900 Hz).
- **Inputs**: `cast.json` and `rooms.json` (templates in `scripts/play-art/templates/`).
- **Intake folders** (`art-intake/<career>/`, in git): `scenes/`, `cutouts/`, `sprites/`, `plates/`, `heroes/`, `rooms.json`, `cast.json`, `PROMPTS.md`.
- **Output** (`public/images/play/<folder>/`): `expressions/<name>-<expr>.webp`, `face-<name>.webp`, `locations/<room>[-<time>].webp`, heroes `l<level>-<nn>.webp` or `<beat>.webp`.
- **Asset naming (reconciling Joshua's IDs)**: room ids are lowercase kebab (`riverbend-station-night`); map them to Joshua's Asset IDs (`RN_NURSE_STATION_NIGHT`) in the Image Manifest's Asset ID column so both stay stable.

### 7.3 Windows: replacing the two Mac-only steps

Usman has no Mac, so Apple Vision is out. Three options, in order of preference:

**Option 1 (recommended): keep the exact behaviour, run it on a Mac in the cloud.** GitHub Actions `macos-latest` runners include Xcode command-line tools and the Vision framework. A workflow that checks out the repo and runs `npm run art:extract -- <career>` and the faces script produces identical output with no Mac on anyone's desk. Use it for batches; commit the results.

**Option 2: cross-platform models that produce the same files.**

| Mac step | Windows replacement | Notes |
|---|---|---|
| Person cut-out (`extract-subjects.swift`: foreground instance mask + human rectangles) | **SAM 2** (Meta, Apache-2.0) for masks, prompted with person boxes from a detector such as **RT-DETR** (Apache-2.0) or **MediaPipe** object detector (Apache-2.0); or **rembg** with the **BiRefNet** model for single-character images | Check licences before shipping: some popular models (e.g. BRIA RMBG 2.0, YOLO via Ultralytics AGPL, InsightFace models) have non-commercial or copyleft terms. Test on our anime-style art; photo-trained detectors can miss stylised people. |
| Face detection (`faces.swift`) | **MediaPipe Face Detector** (BlazeFace, Apache-2.0) in Python or Node (`@mediapipe/tasks-vision`), or **OpenCV YuNet** (`cv2.FaceDetectorYN`) | Career poster photos are near-photographic, so these work well. |

**The contracts the replacements must honour** (then everything downstream is unchanged):

- Extraction must write, per scene, one full-frame 8-bit greyscale mask per person `<prefix>-N.mask.png` (sorted left to right), and one JSON line per person: `{"file", "x", "y", "w", "h", "px", "touchesBottom", "people"}` (box in pixels, `px` = mask area, `people` = persons inside that mask). `lib/extract.mjs` and `lib/refine.mjs` take it from there. Drop masks with no person inside (aircraft, tools).
- Face detection must write the same TSV `faces.swift` prints: `<relative path>\t<w>x<h>\tF:cx,top,bottom,width,conf|...\tH:top,bottom|...` with all values as fractions from the top-left (`F` = faces, `H` = whole-person boxes). Then `node scripts/career-photos/face-data.mjs faces.tsv` and `hero-focus.mjs` run unchanged.

**Option 3 (simplest, avoids extraction entirely):** generate sprites as transparent PNGs or on #00FF00 (Path A in SOP 5). `art:process` is pure Node and already runs on Windows. Extraction is only needed when we must reuse composed scenes.

**Other Windows notes:** `sharp` arrives with `next`; if missing, `npm install sharp`. The chapter 8 batch loop is bash: run it in Git Bash or WSL, or port it to a Node script. Ad-hoc tools we used on the Mac have cross-platform equivalents: `sips` (use sharp), `cwebp` and `ffmpeg` (both have Windows builds). `potrace` and Blender are only for the Dreamy mascot, not career sims.

### 7.4 Automated QA that exists today

- `art:validate`: schema rules; every referenced file exists; files over 250 KB warn; `portraitRatios` must match the real file within ±0.002 (error); full-figure sprites must be 1024x2048 with alpha (error); green fringe over 15% of edge pixels warns; plates not 16:9 within 0.05 warn; orphan files warn.
- `art:qa`: validate, plus head cropped at the standard slot (error), face below 40% of the scene (warning), standing column over 35% cluttered at the phone crop (warning).
- Scene review (section 6): the same math rendered at five real screen sizes, with flags.

### 7.5 Automation to build next (the multiplier)

1. **Generator by API, not by hand.** Call an image API from `art:prompts` output: attach the reference images, request transparent PNG where supported (or #00FF00), save straight into `art-intake/<career>/sprites`. Candidates to evaluate: OpenAI's image API (offers a transparent-background option) and Google's Gemini image models (strong reference-image consistency; no alpha, so green screen). Codex ran out of credits on 5 Oct, so do not depend on it.
2. **Identity check by embedding.** Compute a face/character embedding per sprite (CLIP or a face-embedding model) and fail any expression whose similarity to the approved turnaround drops below a threshold; also fail a new character too similar to any existing one (Joshua's §75 uniqueness, as a number instead of an opinion).
3. **Style check against IB.** CLIP similarity between each new image and Joshua's IB style reference sheet (SOP 2 §88); flag outliers for Gate 3.
4. **Obstruction check for hero art.** Detect face boxes in hero scenes and test them against the dialogue zone and HUD for every viewport (the Scene review already does this for rooms, not heroes).
5. **Provenance in the manifest.** For each asset: generator, model, prompt hash, reference IDs, seed if any, approval status and approver. Joshua's SOP 3 asks for versioning but no schema exists; add it here.
6. **One command per career.** Chain `art:new` to `art:qa` in a Node script (`art:career -- <id>`) that stops at each approval gate and resumes after sign-off.
7. **Shared room library.** Many careers share rooms (an office floor, a break room, a hospital corridor); chapter 8 proposes a library so a new career reuses approved plates and only generates its specialist room.

### 7.6 Known issues to fix while automating

- AMT's manifest says `waist-up-legacy` but its sprites are 1024x2048, so `qa` skips the geometry checks; switch it to `full-figure-1024x2048` and rerun.
- `maya-concerned.webp` is 305 KB (over the 250 KB budget).
- `validate` reports false orphans for `poses` and hero art referenced from level `.ts` files (`maya-confident.webp`, `amt-drawer-maya.webp`, `amt-fluid-leak.webp`).
- RN `riverbend-station-night` was auto-placed at `focal.x = 1` and is unlocked; check it.
- IB `cobalt-trading-floor-sunset` has no `locked` and no `role`.
- Face chips differ by career (RN 420 to 460 JPG without alpha; others 512 WebP); standardise on 512 WebP.
- Stale references: `index.ts` mentions `scripts/play-art/new-career.mjs` (the real command is `play-art.mjs new-career`); `types.ts` and `locations.ts` mention `/play-tools/scene-tuner` (it is `/play-tools/scene-review`); `art-ratios.ts` is dead code.
- Scene review uses an upper-third face limit while `art:qa` uses 40%; pick one (we recommend the upper third).

---

## 6. The positioning check tool (Quick links > Scene review)

**What it is.** A read-only page at `/play-tools/scene-review`, opened from the hamburger menu (Quick links > Match flow lab > **Scene review**). It is an automatic contact sheet: every room in a career's art manifest, drawn at **five real screen sizes** (Phone 390x844, Tablet 768x1024, Laptop 1440x900, Wide 1920x1080, Ultrawide 2560x1080) with the **same placement math the game uses** (`src/components/play/scenePlacement.ts`). So what it flags is what a student would really see. It was built automatic on purpose (29 Sept 2026: "drag to position seems like a manual process... I want it to be automated... We have 900+ careers"): the scripts place things, this page is the second line of defence.

**What it shows per room:** the empty plate with the character who stands there most often (or a labelled stand-in), the dashed dialogue-card zone, an upper-third line, an optional centre line, and a ring at the estimated face position (green pass, red fail). Each row shows how many beats play there, who stands there, and a status chip ("Clear" or "N flags"). Click a frame to enlarge it; arrow keys switch size; Escape closes.

**How it measures:** it reads each sprite's opaque pixels (alpha 24+) to find the real top of the head and estimates the face 7% below it for full-figure sprites (16% for waist-up).

**What it flags:**

| Flag | Meaning |
|---|---|
| `head-cropped` | the top of the head is cut off at some screen size |
| `face-low` | the face sits below the upper third |
| `face-hidden` | the face is inside the dialogue card |
| `face-off-side` | the face falls outside the frame |
| `plate-missing` / `sprite-missing` | a file is missing |
| `alt-missing` | no alt text, or it says TODO |
| `unused` | no beat plays in this room |
| `route-dangling` / `route-unknown-beat` | routing points at a room or beat that does not exist |
| `cast-ratio-missing` / `ratio-stale` | a sprite's stored size ratio is missing or more than 2% off the real file |

**How to use it:**

1. Pick the career (or open `/play-tools/scene-review?career=<id>`). Turn on **Flagged only**. A clean career says "Nothing flagged. Every room in this career passes."
2. Fix what is flagged: rerun `art:place` for crops, regenerate a sprite whose head is too low, or hand-tune the room and set `locked: true`.
3. To check art **before** it is in the repo: **Load a manifest** (a career JSON) and **Load plates and sprites** (local files, matched by file name, held in memory only, nothing uploaded).
4. **Copy report** puts a plain-text list of every flag on the clipboard for a ticket or Slack.

It writes nothing; fixes go in the art or the career's manifest. Not covered yet: hero scenes and their `artFrame` (see 7.5 item 4).

---

## 7. Open decisions to take to Joshua

1. **Compositing amendment to SOP 2 §84/§96** (SOP 5.3): allow sprites that pass the integration table; use composed heroes where person and place interact.
2. **One taxonomy.** His SOPs use four screen-type lists (SOP 1 §27 and §36, SOP 2 §6, SOP 3 §11) and loose Image Action names; the engine needs one enumerated list. We propose SOP 3 §11 screen types and SOP 2 §3 image actions as the controlled vocabularies.
3. **Asset ID convention**: his examples mix `IB_JORDAN_CREDIT` and `IB_JORDAN_TAKING_CREDIT`, and some IDs include the level and some do not. Propose `[CAREER]_[L#]_[KIND]_[NAME]`.
4. **File specs**: his SOPs name no sizes or formats; adopt ours (1024x2048 sprites, 1920x1080 plates, 512 face chips, WebP).
5. **Named approvers per gate** (his SOPs say "approved" without who): propose Chandu for Gates 1 and 3, Joshua for Gate 2 on the first three careers, then Chandu.
6. **Text in work artifacts**: his "no text in art" rule versus documents like a patient chart; render artifact text in the UI, never in the image.
