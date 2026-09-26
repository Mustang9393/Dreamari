# Play SOP, chapter 7: Art direction, which image goes where, and the master prompts

> How every image in Play is chosen, sized and prepared. Joshua supplies each career's art; we separate it into people-free backgrounds and sprites (the sprite master prompt, `docs/handoff/sprite-master-prompt.md`, is the one master prompt). Section 1 is the slot map, section 2 the decision rules, section 3 where art comes from and how it is separated, section 4 post-processing, section 5 art QA. Detail and history: chapter 5 §3-4.

---

## 1. The image slots

| Slot | Where it shows | Engine field | Folder / name | Size / ratio | Format | Picked by | Fallback |
|---|---|---|---|---|---|---|---|
| **Simulation cover** | Play hub card (hero 16:9, side 210:297, compact ~16:9, phone deck 319:386), Home rail and hero | `Simulation.cover` | Recommend `public/images/play/<abbr>/cover.webp` (today IB reuses `l1-04.webp`, RN uses `locations/station-hero.webp`) | Square or 16:9 master that survives every crop above; subject in the central safe zone | webp | Always this file; hub crops are centered `object-cover` | BookOpen icon on the world tint |
| **Placeholder cover** ("In the works", row-1 "coming soon") | Play hub only | `SOON[].cover` | `public/images/app/soon-<careerId>.png` | 1254x1254 (square master, 2048 generated) | png today; webp recommended | Always this file | Same |
| **Glossary card cover** | Play hub glossary row | `GLOSSARY_GAMES[].cover` | `public/images/app/glossary-<slug>-cards.png` | 1672x941 (finance's is 941x1672) | png | Always this file | Same |
| **Hero scene** (illustrated beat) | Full-bleed behind a specific beat and up to 3 beats after it | `beat.art`, `beat.artAlt` | `public/images/play/<abbr>/l<level>-<nn>.webp` (`nn` = the script's screen number) | **16:9 or wider**, 1400px+ wide (recent ones 2644-3344 wide) | webp | Authored on the beat; sticky for 3 beats; `resetScene` breaks the chain | The beat's location |
| **Location plate** (a room) | Behind every beat without fresh hero art; the stage the sprites stand on | `LOCATION_ART[id].src` + `BEAT_LOCATION[beatId]` | `public/images/play/<abbr>/locations/<room>[-<time>].webp` | 16:9, 1600px+ wide (recommend 1920x1080) | webp (RN shipped jpg) | Per beat via `BEAT_LOCATION` | Ambient gradient backdrop |
| **Expression sprite** | Standing in the room while a card or setup line is on screen; the feedback card's 72px reaction portrait; the trailer's top-person silhouette | `DEFAULT_EXPRESSION`, `EXPRESSION_PORTRAITS`, `PORTRAIT_RATIO` | `public/images/play/<abbr>/expressions/<name>-<expression>.webp` | 1024x2048 true-alpha (see A13 for the IB exception) | webp with alpha | Speaker (or `castMember`) + answer tier; `tone: conflict/alarm` borrows the "wrong" face before answering | Nobody stands in the room |
| **Face chip** | Dialogue box portrait (52px phone, up to 90px desktop), Express character panels | `Level.cast[name]` | `public/images/play/<abbr>/face-<name>.webp` | 512x512 square | webp | Speaker name; hidden when the big sprite is already on screen | Name pill (only on the ambient backdrop) |
| **Trailer plates** | The 20-second trailer | `TrailerCard.art`, `sprite` | Reuse existing plates and sprites only | (as source) | (as source) | Authored per card | Black |
| **Glossary term icons** | Glossary flip cards and badges | `GlossaryTerm.icon` (semantic slug) | Code: `TERM_ICON_MAP` (lucide icons, one custom sneaker SVG) | Vector | n/a | Slug | Sparkles icon |
| **Dreamy** (glossary only) | Glossary guide poses | pose name | `public/images/dreamy/v2/dreamy-<pose>.png` | existing set | png | Hardcoded per screen | Sparkles on a brand-tinted circle |
| **Music** | Simulation background | `SIM_TRACKS[simId]` | `public/audio/play/<abbr>-main-song.<mp3/m4a>`, optional `-promotion-song` | ~128 kbps | mp3 / m4a | Main for the run, Promotion on an advancing ending | IB's tracks |

Hard rules that apply to every slot:

1. **No real brands, logos, trademarks or legible real signage.** Sweep every file before it ships (a live "LOUIS VUITTON" was baked into five IB scenes once). The fictional employer's name may appear only if spelled correctly.
2. **No text, UI, watermarks, borders or collage** in any image. The game draws all text.
3. **Same style across a career**: Joshua's style for that career. Style consistency beats a quick same-day stand-in (a realistic photo in an illustrated row was rejected).
4. **Placeholder covers are their own `soon-*` files**, never the shared `poster-*.png` used by Explore, Profile and marketing (an earlier pass overwrote those in place).
5. **Location plates are people-free.** Characters are separate cutouts; a plate with baked-in people ghosts the moment anything moves and doubles people up.
6. **Art must match the cast bible.** A scene may not show a different person in a named character's role (the IB "HR" art that was not Christina had to be reattributed).

## 2. Deciding which image a beat gets

The player's order is fixed (`sceneFor`, chapter 2 §2.1): fresh hero art (the beat's own, or one of the previous 3 beats') → the beat's location → the ambient backdrop. The authoring decisions are:

**Give a beat hero art when** the moment is a specific event that a room plus a standing cutout cannot show: an action between people (Jordan claiming your spreadsheet), a crowd or an object that matters (the offer letter, a misprinted stack of pages), a mood stretch (night grind, crunch time; "night/crunch mood scenes especially" can stay baked illustrations), or an arrival/establishing shot. Budget: IB L1 uses 2 hero plates in 37 beats; IB L2 and L3 use 8-9 each. RN L1 uses none. Start a new career with **zero to four** hero plates and let locations carry the rest.

**Otherwise give it a location**, and pick the room with this tie-break (`locations.ts:218-222`): internal prep or review → the internal meeting room; a formal client moment or decision → the formal room; a public working moment → the main floor; a private transition → the hallway. Then apply visual congruence: a continuous run (the Day 1 morning) stays in one room and one time of day. Six o'clock onward is night. The room must not be empty while the line says someone is standing in it.

**Leave only the final review beat without a location** (the ambient backdrop reads as the "decision pending" wait).

**Break the chain** with `resetScene: true` on the first beat of a new scene when the previous hero art must not linger.

**Covers** show a character in frame (never an empty room). If the career has no single painted cover, composite the mentor's welcoming sprite into the main location plate with a contact shadow and a light color grade toward the room's tones (how RN's `station-hero.webp` was made).

**Trailer**: reuse only. Six of seven cards use existing plates; card 6 uses the top figure's composed sprite, dark-graded; card 1 or 2 may be black. The only new element is the finale ladder, which the code draws.

**Sprites per character** (from the sprite master prompt):

| Role in the story | Sprites | Tier mapping on the feedback card |
|---|---|---|
| Mentor beside you | welcoming, proud, concerned | Best proud, Acceptable welcoming, Wrong/Risky concerned, default welcoming |
| Judge above you | composed, assessing, concerned | Best/Acceptable composed, Wrong/Risky concerned, default assessing |
| Peer you are measured against | confident, focused, uncertain | Best confident, Acceptable focused, Wrong/Risky uncertain, default confident |
| Figure at the top | composed (one only) | default only; no reaction |

Do not batch-generate a whole cast before each character's canonical turnaround is approved, and never invent an expression there is no art for: "a smaller, honest set" is better.

---

## 3. Where art comes from, and the one master prompt

**Joshua supplies the art.** Each career arrives as an asset pack from Joshua (IB: `Dreamari-IB-Claude-Production-Handoff-v2.zip` plus the per-level scene zips; RN: `RN_Game_Asset_Pack`): the scene illustrations (hero art), the room art, the character reference art, and the script workbook. We never invent a career's look. **Our job is only to separate his art into the two things the engine composites:**

1. **Sprites**: each character as a transparent cutout, in the expression set their story role needs.
2. **People-free backgrounds**: each room with the characters removed, so the cutouts can stand in it.

Hero scenes and covers are used as Joshua delivers them (converted to webp, recomposited to 16:9 when narrower, trademark-swept). Where his pack already contains separated background/foreground layers (the IB 24 Aug package did), use those layers directly rather than regenerating.

### 3.1 Sprites: `docs/handoff/sprite-master-prompt.md` (the master prompt, frozen)

This is the repo's one master prompt. Use it exactly as written:

1. Attach Joshua's reference art for each character (the references are "the single source of truth for identity and art style").
2. Change ONLY the `== CAST ==` rows: one identity sentence per character (skin, hair, age, build, jewelry, exact wardrobe including uniform color, named props, "Exactly as in their reference"), and the expression set for their role (table in section 2). Everything else stays byte-identical; it encodes what `SceneCharacter` and `expressions.ts` require.
3. It returns one image per reply, captioned with its filename, self-checked against its acceptance checklist.

Output spec in brief: true-alpha PNG, full figure head to shoes (~4% margin above the hair, ~2% below the shoes), 1024x2048, eye-level 50mm-equivalent camera identical for the whole cast, soft neutral slightly warm key light from the upper front-left, no shadow or floor, identical wardrobe across a character's set. If the generator cannot produce real alpha, generate on flat pure green (#00FF00) and chroma-key (what the RN pack did: green-dominance alpha ramp plus despill, section 4).

### 3.2 Backgrounds: separating the people out of Joshua's room art

No written prompt for this exists in the repo; the RN pack's people-free plates came from Joshua's pack and the IB plates from its separated layers. When a room only exists with people in it, run an edit (inpainting) pass on Joshua's image with this companion to the master prompt (derived from the engine's constraints; tune it on first use):

```
Edit the attached image. Remove every person from the scene (including partial
figures, reflections and shadows cast by people) and fill the space with what
would naturally be behind them. Change NOTHING else: same room, same camera, same
framing, same props, same light, same art style and line work, same colors.
Output at the same size and aspect ratio as the input (16:9, at least 1920x1080).
The floor at the horizontal centre of the frame (x 40%-60%) must be clear and
continuous from the bottom edge up to about 45% of the height, because a character
cutout will stand there. No text, readable signage, readable screens, logos or
real brands anywhere; if the original has any, paint them out as blank surfaces.
```

If a separated plate needs a time-of-day variant Joshua has not supplied (the RN pack's night and evening variants are still open), ask him for it rather than generating one: plates must stay in his style.

After separation: export webp at 1920x1080 (quality ~82), name `<room>-<time>.webp`, and add a `LOCATION_ART` entry: `alt` (one descriptive sentence), `focal` and `mobileFocal` as 0-1 fractions (mobile usually the centre of the open floor, a little higher), and a `characterAnchor`. For 1024x2048 full-figure sprites start from `{ x: 0.5, baselineY: 1.78, heightFrac: 1.75 }` (chest-up, matching IB's waist-up look) and tune in the browser at 375x812, 768x1024, 1440x900 and 1920x1080 until the face sits in the upper third and the waist meets the dialogue box. Never swap a plate later without re-tuning its anchor.

### 3.3 Hero scenes and covers (Joshua's art, prepared, not generated)

- **Hero scenes**: convert to webp, name after the script's screen number (`l1-12.webp`). Anything narrower than 16:9 is recomposited to 16:9 with a **top-anchored** crop (a centre crop cut Christina's forehead on L2-09), from his separated layers where available. Check at the four viewport sizes above plus an ultrawide window for cropped heads, and sweep for trademarks.
- **Simulation cover**: a character in frame. If the pack has no single painted cover, composite the mentor's welcoming sprite into the main separated plate with a contact shadow and a light color grade toward the room (how RN's `station-hero.webp` was made).
- **Placeholder covers for careers with no pack yet** ("In the works"): these were made with Codex outside the repo; the template and crop hints are in `~/Documents/Dreamari/Play tab/prompts-and-crops.json` (not in git). Once Joshua's pack for that career lands, his art replaces them. Always write to `public/images/app/soon-<careerId>.png`, never the shared `poster-*.png`.

## 4. Post-processing, step by step (script these)

**Sprites**
1. If green-screen: chroma-key to true alpha (soft green-dominance ramp) and despill.
2. Clean interior matting: recolor small opaque off-white islands trapped in hair to the local median.
3. Decide framing (A13). For the full-figure standard, keep the 1024x2048 canvas. (IB's waist-up set was cropped to the alpha bounding box with ~2% padding and resized to 1800px tall.)
4. Export once, at high quality, straight from the decoded source (re-saving degraded an earlier set): webp with alpha, ~100 KB.
5. Measure each file's real width/height and add it to `PORTRAIT_RATIO` (a wrong ratio letterboxes the sprite and it reads smaller and higher).
6. Add the tier set to `EXPRESSION_PORTRAITS`, the default to `DEFAULT_EXPRESSION`, and the pitch to `VOICE_PITCH`.

**Face chips**: from the character's welcoming / default sprite, crop a square around the face (hairline to chin with ~15% margin, eyes at ~42% of the height), 512x512 webp, into `face-<name>.webp`, and add it to every level's `cast` where they speak.

**Plates and heroes**: webp, 1920x1080 (plates) or native 16:9 (heroes), quality ~82. The original IB batch went 41 MB → 2.4 MB at 1400px wide with no visible loss.

**Covers**: square 2048 master, delivered at 1254x1254 today; webp recommended to replace the ~2 MB PNGs.

## 5. Art QA checklist (before a career ships)

- [ ] No real brand, logo, trademark or readable real signage in any file (zoom to 100% on every sign, screen, bag and box).
- [ ] No text in any image; the fictional employer spelled correctly if it appears at all.
- [ ] Every named character looks like the same person in every sprite, chip, hero and cover.
- [ ] Every sprite is true alpha: no fringe, halo, checkerboard pixels or baked shadow.
- [ ] Every location plate is people-free with open centre floor.
- [ ] Every scene checked at 375x812, 768x1024, 1440x900, 1920x1080 and one ultrawide: no cropped heads, the sprite's face in the upper third, nothing important under the dialogue box.
- [ ] Hub cover checked in all four card tiers and the phone deck.
- [ ] `PORTRAIT_RATIO` matches every sprite's real dimensions.
- [ ] No orphaned files (every file referenced; every reference resolves).
- [ ] Night and crunch stretches use night-lit plates, not day plates.
