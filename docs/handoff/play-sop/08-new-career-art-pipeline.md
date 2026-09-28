# Play SOP, chapter 8: the new-career art pipeline (automatic, built for 900+ careers)

> **Audience:** Usman and his agent. **Why this exists:** Usman, 29 Sept 2026: "From the backend point of view, the game works, but the post processing... like generating and positioning graphics introduces a manual process, that is not easy to manage and scale." He was right: until now every step after image generation was done by hand. The user's bar for the fix: "I want it to be automated so we don't have to manually do anything. We have 900+ careers." This chapter is that pipeline. Chapter 7 is still the art direction reference; this chapter replaces its "do these steps by hand" parts with commands.

---

## 1. What is automatic now, and what is left for a person

| Step | Before | Now |
|---|---|---|
| Write the image prompts for a career | Hand-edit the master prompt per cast | `npm run art:prompts` builds the whole pack from two small JSON files |
| Generate sprites and room plates | Codex | **Codex** (unchanged: Codex generates images; Claude cannot) |
| Remove green screen, despill, clean speckles, crop, put on the standard canvas, export webp | By hand | `npm run art:process` |
| Cut 512px face chips | By hand | `art:process` (auto-framed from the sprite's alpha) |
| Resize and export room plates and hero scenes | By hand | `art:process` |
| Measure sprite sizes and type them into code | By hand, in `expressions.ts` | `art:process` writes them into the career's manifest |
| Position each room (focal points, where the character stands) | Hand-tuned numbers in `locations.ts` | **Automatic.** `art:process` runs `place`, which computes both focal points from the image and uses the standard character slot |
| Decide which room each of ~35 beats per level plays in | By hand | `npm run art:route` (Claude reads the level and routes every beat by the house style) |
| Check heads are not cropped and faces sit high enough on every screen size | Eyeballed at 5 window sizes | `npm run art:qa` computes it for 5 viewports, no screenshots |
| Check every file exists, sizes, ratios, alt text, green fringe, orphans | Checklist | `art:validate` (and `art:qa`) |
| See a career's scenes at 5 screen sizes, exceptions only | Clicking through the game | `/play-tools/scene-review` (read-only; "Flagged only" toggle) |
| Wire the career into the engine | Edit 4 code files | One JSON manifest per career, one line in `src/components/play/art/index.ts` |

**Left for a person, by exception only:** art QA that a machine cannot judge (the same person in every image, no real brands, style consistent with the career). The QA page and `art:qa` point at what to look at; nobody reviews a clean career.

---

## 2. The data: one manifest per career

Everything the player needs to stage a career's art lives in **one JSON file**: `src/components/play/art/<career-id>.json`. Schema: `src/components/play/art/career-art.schema.json`. Types: `src/components/play/art/types.ts`. The engine (`locations.ts`, `expressions.ts`, `SimulationPlayer.tsx`) reads only these files; there are no art tables in code any more.

```jsonc
{
  "$schema": "./career-art.schema.json",
  "career": "registered-nurse",          // Simulation.careerId
  "folder": "rn",                         // public/images/play/<folder>
  "spriteStandard": "full-figure-1024x2048",
  "locations": {
    "riverbend-station": {
      "src": "/images/play/rn/locations/station.webp",
      "alt": "The Four West nurses' station, monitors lit, the corridor stretching away.",
      "role": "work-floor",               // drives beat routing
      "focal":       { "x": 0.42, "y": 0.45 },   // 640px and wider
      "mobileFocal": { "x": 0.38, "y": 0.42 },   // phones
      "characterAnchor": { "x": 0.5, "baselineY": 1.78, "heightFrac": 1.75 },
      "locked": true                      // hand-tuned: never auto-placed over
    }
  },
  "cast": {
    "Rosa": {
      "default": "/images/play/rn/expressions/rosa-welcoming.webp",
      "tiers": { "best": ".../rosa-proud.webp", "wrong": ".../rosa-concerned.webp" },
      "face": "/images/play/rn/face-rosa.jpg",
      "voicePitch": 615
    }
  },
  "portraitRatios": { "/images/play/rn/expressions/rosa-welcoming.webp": 0.5 },
  "beatLocations": { "RN1-09": "riverbend-station" }
}
```

**For the backend:** serve this document per career exactly as it is (it validates against the schema). Investment Banking and Registered Nurse are already converted: `investment-banking.json` (8 rooms, 5 cast, 110 beats routed) and `registered-nurse.json` (6 rooms, 4 cast, 26 beats), produced by exporting the old code tables, so the live game is unchanged.

Room roles (the enum the router uses): `work-floor`, `work-floor-night`, `private-meeting`, `formal-meeting`, `break`, `transition` (hallway, elevator, corridor), `arrival` (exterior, lobby, reception), `specialist` (the career's own room: patient room, garage bay, studio).

---

## 3. One-time setup

1. Node 20+ and the repo installed (`npm install`). The art scripts use `sharp`, which ships with Next.js; if your environment lacks it, `npm install sharp`.
2. For beat routing with Claude: an Anthropic API key in `ANTHROPIC_API_KEY`. The default model is `claude-sonnet-5`; override with `PLAY_BEATS_MODEL`. Without a key, routing falls back to the offline rules engine (weaker, see section 7).
3. Codex (for image generation) with access to each career's reference art from Joshua.

---

## 4. Shipping a new career's art, step by step

Replace `software-engineer` / `se` / "Northwind Labs" with the career.

**Step 1. Scaffold.**
```
npm run art:new -- software-engineer --folder se --firm "Northwind Labs"
```
Creates `art-intake/software-engineer/{sprites,plates,heroes}/` with naming rules, and a starter manifest `src/components/play/art/software-engineer.json`.

**Step 2. Describe the cast and rooms** in two small files (templates in `scripts/play-art/templates/`):
- `cast.json`: one entry per character: `name`, `title` (their job title, as in the story), `role` (`mentor`, `judge`, `peer` or `top`), and the `identity` sentence (skin, hair, age, build, jewelry, exact wardrobe, named props, "Exactly as in their reference"). The identity sentence comes from Joshua's Characters tab.
- `rooms.json`: one entry per room: `id`, `description`, `time` (day, night, morning) and `role`. A career needs about six: the work floor, its night version, a private meeting room, a formal room, a break room, a transition space, plus a specialist room if the job has one.

Save both in `art-intake/software-engineer/`.

**Step 3. Build the prompt pack.**
```
npm run art:prompts -- software-engineer --cast art-intake/software-engineer/cast.json --rooms art-intake/software-engineer/rooms.json
```
Writes `art-intake/software-engineer/PROMPTS.md`: the frozen sprite master prompt with only its CAST block rewritten (expression sets chosen from each role), and one plate prompt per room. Section 6 shows the exact prompt text.

**Step 4. Generate in Codex.** Attach Joshua's character references, paste the sprite prompt, and save each image under the filename it is captioned with, into `art-intake/software-engineer/sprites/`. Paste each plate prompt and save the result as `plates/<room-id>.png`. Hero scenes, if the script calls for any, go in `heroes/<beat-id>.png`. Green-screen output is fine; the script keys it.

**Step 5. Process (this also positions everything).**
```
npm run art:process -- software-engineer
```
Keys, cleans, crops and standardizes every sprite; cuts face chips; exports plates and heroes; measures every file; writes the cast, ratios and new rooms into the manifest; then auto-places every room that is not `locked`. It prints a report of anything flagged.

**Step 6. Route every beat to a room.** Export each level's beats as JSON (`{ "id": "se-l1", "beats": [...] }`, the same shape as `src/components/play/types.ts`), then:
```
npm run art:route -- --level se-l1.json --manifest src/components/play/art/software-engineer.json --write
```
Claude reads the whole level and assigns a room to every beat except the final review, following the house style in section 5. `--write` merges into `beatLocations` and never overwrites a beat that is already routed (use `--overwrite` to redo).

**Step 7. Fill the room descriptions.** Each new room's `alt` is left as `"TODO: describe"`, which fails QA on purpose; replace it with one plain sentence (the `description` from `rooms.json` works). This is the only text a person writes.

**Step 8. QA.**
```
npm run art:qa -- software-engineer
```
Non-zero exit on any error: a missing file, a wrong ratio, a head cropped at any of 390x844, 768x1024, 1440x900, 1920x1080 or 2560x1080, alt text left as TODO, a beat routed to a room that does not exist. Warnings (a low face, a busy standing spot, a large file, green fringe, an orphaned file) do not fail it. Then open `/play-tools/scene-review`, pick the career, and turn on "Flagged only". A clean career shows nothing to review.

**Step 9. Register the manifest.** Add the import to `src/components/play/art/index.ts` (one line), or serve it from the backend's per-career record. The level data and `games.ts` registry entry follow the existing SOP (README section 3).

---

## 5. How positioning is automatic (so nobody tunes a room)

Two standards make positioning a calculation instead of a judgement:

1. **Every sprite is made to one standard**: a full figure on a 1024x2048 transparent canvas, about 4% empty above the hair and 2% below the shoes, the same camera for the whole cast. `art:process` enforces it even when Codex's framing drifts (it trims to the figure and re-places it on the standard canvas). So one character slot fits every character in every career: `{ "x": 0.5, "baselineY": 1.78, "heightFrac": 1.75 }` (head to hips across the frame, face in the upper third, legs behind the dialogue box).
2. **Every plate is generated with clear floor at its horizontal centre** (the plate prompt requires it), because the speaker always stands in the middle of the screen.

`place` then computes the focal points from the image: it measures visual clutter (edge density) column by column in the lower half of the plate, picks the clearest standing column (biased to the middle), and solves the object-cover math so that column lands at the centre of a phone screen (`mobileFocal`) and a desktop screen (`focal`). Focal height comes from where the picture's detail sits. It then checks the standing column's position at tablet and ultrawide too and reports it.

**Measured against the hand-tuned rooms** (run on copies of the IB and RN manifests): plain rooms agree within 0.02 to 0.09 (the corridor, staff room, elevator hallway, reception). The two places it disagrees are rooms whose hand tuning encoded story knowledge the image cannot show ("never over the bed" in the RN patient room and night ward), and the IB trading floor, which is cluttered wall to wall and was not generated to the plate standard; `place` flags that one itself. New careers generated with the plate prompt avoid both. Hand-tuned rooms carry `"locked": true` and are never overwritten.

**House style for routing beats to rooms** (the rules Claude follows, in `scripts/play-beats/map-beats.mjs`): the work floor is home (onboarding, character introductions, questions, everyday tasks); the first beat is a one-beat establishing shot outside; meeting rooms only when a meeting is actually happening in the story; one-on-one teaching from the mentor happens in the break room; short private moments (walking, private news, just after a big meeting, the end of a day) use the transition room; after six in the evening the work floor becomes its night version until morning; the specialist room only when the moment clearly happens there; a run stays in one room until the story moves it.

---

## 6. The prompts (they run in Codex)

Codex generates the images. Claude does everything after that. `art:prompts` assembles these per career; they are reproduced here so the rules are visible.

### 6.1 Sprites: the master prompt

The full, frozen text is `docs/handoff/sprite-master-prompt.md`. Only its `== CAST ==` block changes per career, and `art:prompts` writes that block from `cast.json`. Expression sets by role:

| Role | Sprites |
|---|---|
| mentor (beside you) | welcoming, proud, concerned |
| judge (above you) | composed, assessing, concerned |
| peer (measured against you) | confident, focused, uncertain |
| top (the figure at the top) | composed |

Filenames are `<name>-<expression>.png`, lowercase, hyphenated. If Codex cannot produce true transparency, ask for a flat pure green (#00FF00) background instead; `art:process` keys it.

### 6.2 Room plates (one per room)

```
Generate a people-free interior/exterior scene: <description>, <time of day>.

Requirements (non-negotiable, matches every other plate in this app):
- No people, no reflections or shadows implying a person just left frame.
- 16:9, at least 1920x1080, camera at eye level, no dramatic tilt or fisheye.
- The floor at the horizontal centre of the frame (x 40%-60%) must be clear and continuous from the bottom edge up to about 45% of the height: a character cutout stands there.
- No text, readable signage, readable screens, logos or real brands anywhere.
- Same illustration style, line weight and colour grade as this career's other references: do not mix photographic and illustrated looks.
```

### 6.3 Separating people out of an existing room image

For a room that only exists with people in it (from Joshua's pack):

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

---

## 7. Proof it works (measured 29 Sept 2026)

- **Engine conversion:** the IB and RN art tables were exported to the two manifests and the engine now reads only those; `tsc` clean.
- **Sprite ratios:** `measure` found every stored ratio matches the real files exactly (delta 0.0000), so the old hand-typed table was correct and is now generated instead.
- **End to end on a synthetic career:** four green-screen sprites (shrunk and off-centre on a larger green canvas) and two plates went through `new-career`, `process`, `validate` and `qa`: clean key with no halo on skin or clothing, correct margins, face chips centred on the face, cast tiers wired exactly like RN's hand-authored set, rooms auto-placed. Leaving an alt as TODO failed QA; filling it passed.
- **Beat routing:** the router's prompt was run blind (the model saw only the prompt, never the answers) on all four shipped levels and scored against the hand routing: **72 of 113 beats (64%)** matched exactly, up from 47% before the house-style rules were written down. The differences are defensible alternatives (opening the nursing shift in the lobby rather than the corridor), not wrong rooms. The offline rules engine scores 46% and is a fallback only.
- **A real defect found by QA:** all ten shipped RN sprites have green-tinted semi-transparent edges (53 to 60% of edge pixels green-dominant), left over from their original hand keying. `validate` now catches this for every career.

---

## 8. Scaling to 900+ careers

**Batch it.** Every command takes a career id, so a career is a loop iteration:

```
for c in $(cat careers.txt); do
  npm run art:process -- "$c" && \
  for lv in content/$c/levels/*.json; do npm run art:route -- --level "$lv" --manifest "src/components/play/art/$c.json" --write; done && \
  npm run art:qa -- "$c" || echo "$c needs a look" >> needs-review.txt
done
```

Only careers that land in `needs-review.txt` need a person.

**Proposal, not decided (for Joshua and Chandu):** the biggest cost at 900 careers is not positioning but the number of images. At about six rooms and four characters with up to three expressions each, 900 unique careers is roughly 5,400 plates and 9,000+ sprites. Many careers share a workplace (an office floor, a hospital ward, a workshop, a classroom, a kitchen, a studio, outdoors). A shared room library per workplace type (on the order of 50 to 100 plates, reused across careers of that type, with only the specialist room unique) and reusable cast archetypes per world would cut generation by an order of magnitude. The manifest already supports it: `src` can point at a shared folder.

---

## 9. Known limits

- Face chips and the QA face position use body proportions from the alpha mask, not a face detector, so chips are always listed for a quick glance.
- Automatic placement cannot know story constraints a picture does not show ("never over the bed"). Generate plates to the standard (clear centre floor) and it has nothing to get wrong; otherwise lock the room.
- Keying fine curly hair leaves a slight green fringe (the same order as the shipped RN sprites). The `validate` fringe warning tells you which files; asking Codex for true transparency avoids it.
- Investment Banking's sprites are the older waist-up set (`spriteStandard: "waist-up-legacy"`); geometry QA skips them and says so. Every new career uses the full-figure standard.
- One IB room (`cobalt-trading-floor-sunset`) is not yet marked `locked`. It is only at risk if someone runs `place` or `process` against the real IB manifest.

---

## 10. Files

| Path | What |
|---|---|
| `src/components/play/art/<career>.json` | The per-career manifest (IB and RN today) |
| `src/components/play/art/career-art.schema.json`, `types.ts`, `index.ts` | Schema, types, the list of careers the engine loads |
| `scripts/play-art/play-art.mjs` (+ `lib/`, `templates/`, `README.md`) | `new-career`, `prompts`, `process`, `place`, `qa`, `validate`, `measure` |
| `scripts/play-beats/map-beats.mjs` | Beat to room routing (Claude, or offline rules) |
| `src/components/play/scenePlacement.ts` | The placement math, shared by the player and the review page |
| `/play-tools/scene-review` | Read-only review of any career's rooms at 5 screen sizes, with automatic flags |
| `docs/handoff/sprite-master-prompt.md` | The frozen sprite master prompt |
