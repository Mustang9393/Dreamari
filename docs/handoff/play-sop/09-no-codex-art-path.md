# Play SOP, chapter 9: art without Codex (any image generator + `art:extract`)

> **Audience:** whoever builds the next career, and Usman's agent. **Why this exists:** Chandu, 5 Oct 2026, starting Aviation Maintenance Technician: "We don't have the sprites and separate backgrounds etc for this like we had for the others. We need to either do it ourself or get codex to generate these assets. But I'm also out of codex credits... We need an SOP to do this and hopefully automate this whole process for newer games that are coming too."
>
> Chapter 8 automates everything **after** generation, but assumes Codex produces green-screen sprites and people-free room plates. This chapter removes that dependency.
> - **Generation:** any image generator works (ChatGPT, Midjourney, Gemini, Codex when credits exist), and composed scenes are fine.
> - **Sorting:** one command does the rest on this Mac, offline, with no credits.

---

## 1. The idea in one paragraph

Generators are good at **scenes**: "Maya in the hangar at sunset, gesturing welcome". They are bad at the strict asset formats the engine wants, like a lone figure on #00FF00 or an empty room with clear floor in the middle. So we stop asking them for formats.

We ask for scenes, then sort and cut them on the machine:
- A scene with **nobody in it** becomes a **room plate**.
- A scene with **people who can be separated** gives one **sprite cutout per person**. Apple's on-device subject lifting does the cutting; it's the model behind "Lift subject from background" in Photos.
- A scene whose people **cannot be separated** becomes a **hero**: two technicians kneeling together, or a teammate plus the player's own gloved hand in a first-person shot. A hero is a composed moment shown whole on its beat.

Then chapter 8's `art:process` takes over unchanged.

---

## 2. The steps

### Step 1. Generate scenes (any tool)

Per career, aim for:

| What | How many | Example (AMT) |
|---|---|---|
| The mentor (and anyone else the script names), alone, waist-up or full figure, facing the camera | 1 per expression: **welcoming, proud, concerned** (the mentor set) | Maya at the hangar door, gesturing |
| Rooms with **no people** | 3 to 6 | wide hangar, landing gear close-up, workshop |
| First-person or group moments the script calls for | as the script needs | toolbox drawer with gloved hands, two techs at a fluid leak |

Rules that keep the output usable:
- **Same character, same outfit, same art style in every image.** After the first image, attach it as a reference every time (prompt in §4).
- **One person per image whenever you want a sprite.** Two people standing apart also works: the cutter separates them. Two people overlapping does not.
- **Rooms with people in them are fine as heroes**, but you only get a room plate from an image with nobody in it.

### Step 2. Drop everything in one folder

```
art-intake/<career-id>/scenes/
```
Use any of PNG, JPG or WebP, with descriptive names (`hangar-maya.webp`, `toolbox-pov.webp`). Duplicates are harmless.

### Step 3. Sort and cut

```
npm run art:extract -- <career-id>
```
This puts everything into the folders `art:process` already reads:
- `plates/`: scenes with no person in them.
- `heroes/`: scenes where some people can't be separated.
- `cutouts/`: one transparent PNG per separable person, plus `_sheet.jpg`, a numbered contact sheet, and `assign.json`.

The first run compiles a small Swift helper (`scripts/play-art/native/extract-subjects.swift`) into `scripts/play-art/native/.bin/`, which is gitignored. Objects the subject lifter picks up, like an aircraft or a landing gear, are dropped automatically, because only cutouts that contain a detected person are kept.

### Step 4. Name the sprites (the only manual step)

Open `cutouts/_sheet.jpg`. In `cutouts/assign.json`, give each cutout you want a name of the form `<character>-<expression>`. Expressions are welcoming, proud, concerned, confident, focused, uncertain, composed and assessing. Leave background coworkers as `""`.
```
npm run art:extract -- <career-id> --assign
```
This copies the named cutouts into `sprites/`.

Cutouts are usually cut off at the thigh by their scene. That's the **waist-up** standard IB's cast has always used, so `--assign` switches the career's manifest to `"spriteStandard": "waist-up-legacy"`. `art:place` then stands every room's character on the waist-up slot (`{ x: 0.5, baselineY: 0.99, heightFrac: 0.9 }`) instead of the full-figure one.

### Step 5. Fill any missing expression

If the cast lacks an expression (usually **concerned**), generate just that one from a cutout, with the prompt in §4, on #00FF00. Save it to `sprites/<character>-<expression>.png`; `art:process` chroma-keys it automatically.

### Step 6. Chapter 8, unchanged

```
npm run art:new -- <career-id> --folder <short> --firm "<Firm>"   # once, if the manifest doesn't exist yet
npm run art:process -- <career-id>
npm run art:route -- --level <level.json> --manifest src/components/play/art/<career-id>.json --write
npm run art:qa -- <career-id>
```
Then write each room's one-line `alt`, set its `role` in `rooms.json`, and register the manifest (chapter 8, steps 7 and 9).

---

## 3. What is automatic, and what is not

| Step | Who |
|---|---|
| Generating images | a person, in any generator (prompts below) |
| Sorting scenes into rooms, sprites and heroes | `art:extract` |
| Cutting each person out (hair, hands, tools) | `art:extract` (Vision subject lifting) |
| Dropping lifted objects that aren't people | `art:extract` (Vision person detection) |
| Picking the sprite standard (waist-up vs full figure) | `art:extract --assign` |
| Naming which cutout is which character and expression | **a person**, in `assign.json` (one word per sprite) |
| Everything after (keying, canvas, face chips, placement, routing, QA) | chapter 8, unchanged |

**Known limits:**
- People who overlap can't be separated; that scene becomes a hero, by design.
- Expressions come only from what was generated. Two smiles don't make a concerned face.
- macOS only (Vision). On another machine, keep generating on #00FF00 as chapter 7 says.

---

## 4. Prompts (paste into ChatGPT or any generator, attaching the reference image)

### 4.1 A missing expression, from a cutout

Attach the character's best cutout (for example `cutouts/hangar-maya-1.png`), then:

> Use the attached character as the exact reference: same face, same hair, same outfit and badges, same tools on the belt, same anime cel-shaded art style and the same warm rim light. Draw only her, waist-up, facing the viewer, centred, with a **concerned** expression: brows drawn together, lips pressed, eyes looking slightly down at something worrying, one hand raised near her chin. Plain flat **#00FF00** green background, no shadow on the background, no floor, no other people, no text, no logos. Same framing as the reference: the top of her hair close to the top edge, the image cut at mid-thigh. Portrait, 3:4.

Swap the expression line for the others:
- **Proud:** a warm, closed-mouth smile, chin slightly up, arms relaxed or crossed.
- **Welcoming:** a friendly smile, one open hand gesturing toward the viewer.
- **Assessing:** a neutral, attentive face, head slightly tilted.

### 4.2 A room with nobody in it

> **[Room description, e.g. "A large aircraft maintenance hangar at sunset, a narrow-body jet with its door open and yellow access stairs, tool carts, polished concrete floor"].** Same anime cel-shaded art style and warm sunset light as the attached image. **No people anywhere,** not even in the distance. Keep the floor at the horizontal centre clear and uncluttered, because a character will stand there. Landscape, 4:3, no text, no logos.

### 4.3 A composed moment (a hero)

Write the script's moment as one image. For a first-person shot, say so explicitly ("first-person view, the player's gloved hands at the bottom of the frame holding a flashlight"). Heroes can contain anyone; they are shown whole.

---

## 5. First run: Aviation Maintenance Technician (5 Oct 2026)

These are the seven images Chandu supplied (the landing gear came twice):

| Image | Sorted to |
|---|---|
| `hangar-wide`, `landing-gear`, `workshop` | `plates/` (rooms) |
| `gear-leak-pov`, `toolbox-pov` | `heroes/`: both first-person, with people who can't be separated |
| `hangar-maya-and-tech` | 2 cutouts: Maya, plus an unnamed technician |
| `hangar-maya` | 1 cutout: Maya |
| `toolbox-pov` | 1 cutout: the male technician, separable; the scene itself is still a hero |

**Assigned:** `maya-welcoming` is the soft smile with an open hand (`hangar-maya-1`), and `maya-proud` is the big grin (`hangar-maya-and-tech-1`).

**Still needed:** `maya-concerned`, from prompt 4.1. The script names only Maya ("one recurring mentor"), so the other technicians stay background.
