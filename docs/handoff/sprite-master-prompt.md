# Master Prompt: Career-Sim Character Sprites (cutout PNGs)

Copy everything inside the box into ChatGPT (attach the character reference
images first), fill in the `CAST` table for the career being built, and it
will return build-ready sprites that drop straight into
`public/images/play/<career>/expressions/` with no QA round. The spec
section is frozen — it encodes exactly what the simulation engine
(`SceneCharacter`, `expressions.ts`) requires. Only the cast table changes
per career.

How the engine consumes these, for context (do not paste this paragraph):
sprites render at a fixed on-screen height with `object-contain`, feet
anchored near the scene's bottom edge, over painted room backdrops — so
they must be true-alpha cutouts, full figure, consistent scale, with no
baked shadow or ground. Dialogue face chips are cropped from these same
files by us; no separate asset is needed.

---

```
You are producing production game sprites for an existing, shipped visual-
novel career simulation. These are not concept images. Every image must
pass the acceptance checklist at the bottom BEFORE you show it to me; if it
fails any line, regenerate it yourself first. I will not be doing a QA
round.

ATTACHED: reference images of each character. They are the single source of
truth for identity and art style. Match them exactly.

== OUTPUT SPEC (identical for every image, non-negotiable) ==
1. FORMAT: PNG with a genuinely TRANSPARENT background (true alpha). Not
   white, not checkerboard-patterned pixels, not a studio backdrop. Nothing
   in the image except the character.
2. EDGES: clean anti-aliased alpha edges. No white fringe, no dark halo, no
   glow, no outline stroke around the silhouette.
3. FIGURE: the FULL figure, head to shoes, nothing cropped — including
   hair, elbows and fingertips. Leave ~4% empty margin above the hair and
   ~2% below the shoes. Feet together or lightly apart, flat on an
   invisible floor. NO cast shadow, no ground ellipse, no floor.
4. CANVAS: portrait orientation, 1024x2048 or taller at the same ratio.
   The figure fills the canvas height minus the margins above.
5. CAMERA: eye-level, straight-on to very slight 3/4, 50mm-equivalent, no
   perspective distortion, no tilt. The SAME camera for every image, so
   the whole cast composites at one scale.
6. LIGHTING: soft, neutral, slightly warm key from upper front-left, as in
   the references. No colored rim light, no dramatic shadows — the sprite
   must sit believably in rooms lit many different ways.
7. STYLE: match the attached references exactly — the same clean anime /
   cel-shaded illustration style, same line weight, same skin shading,
   same fabric rendering. Do not restyle, de-age, glamorize, or change
   body type.
8. IDENTITY: each character must be the SAME person in every image — same
   face structure, hairstyle, skin tone, height, build, and the exact
   wardrobe written in the cast table, unchanged between expressions. Only
   the face and body language change.
9. CONTENT: exactly one character per image. No props unless the cast
   table names them. No text, watermark, signature, or logo anywhere.

== POSE / EXPRESSION VOCABULARY ==
Primary characters get THREE sprites; background/secondary characters get
ONE. Use these exact definitions:
- WELCOMING (neutral-positive default): relaxed upright posture, warm easy
  smile, one hand loosely at the side or mid gesture. Approachable.
- PROUD (positive reaction): brighter genuine smile, chin a touch higher,
  posture open — quiet approval, never celebration or arms in the air.
- CONCERNED (negative reaction): brows drawn slightly, mouth closed and
  flat or a small frown, weight shifted, maybe arms loosely crossed.
  Disappointed-but-professional. Never angry, never cartoonish.
- CONFIDENT (peer-rival default): easy assured smile, open posture,
  slightly performative — the person who answers first in every room.
- FOCUSED (peer neutral): attention forward, mouth neutral, hands at task.
- UNCERTAIN (peer negative): hesitant expression, shoulders slightly in,
  one hand raised in a small self-conscious gesture.
- COMPOSED (senior default): still, straight, unreadable calm authority,
  hands folded or one in a pocket.
- ASSESSING (senior evaluating): composed, but eyes clearly appraising,
  head fractionally tilted, mouth neutral.

== CAST ==
(fill one row per sprite; filename is exactly as written)

CHARACTER: Rosa — Staff Nurse. Identity: young Latina woman, warm brown
skin, dark hair in a loose low bun with face-framing strands, small gold
earrings, thin gold necklace; navy-blue long-sleeve scrubs with sleeves
pushed to the forearms, stethoscope around neck, retractable ID badge at
the chest pocket, bandage scissors in hip pocket. Exactly as in her
reference.
  1. rosa-welcoming.png  — WELCOMING
  2. rosa-proud.png      — PROUD
  3. rosa-concerned.png  — CONCERNED

CHARACTER: Denise — Nurse Manager. Identity: white woman around 50, blond
hair in a loose pinned-back updo with escaping strands, gold hoop
earrings, thin necklace, wristwatch; navy scrubs under a long open black
blazer, ID badge on a black lanyard. Exactly as in her reference (omit the
coffee cup).
  4. denise-composed.png  — COMPOSED
  5. denise-assessing.png — ASSESSING
  6. denise-concerned.png — CONCERNED

CHARACTER: Tyler — the other new nurse. Identity: young Black man, short
tight curls with a low fade, athletic build; navy short-sleeve scrubs, ID
badge clipped to the chest pocket. Exactly as in his reference.
  7. tyler-confident.png — CONFIDENT
  8. tyler-focused.png   — FOCUSED
  9. tyler-uncertain.png — UNCERTAIN

CHARACTER: Yvonne — Chief Nursing Officer. Identity: Black woman around
55, voluminous natural curls with grey streaks, large gold hoop earrings,
delicate pendant necklace; cream silk blouse under a tailored navy
pantsuit, ID badge on a dark lanyard. Exactly as in her reference.
  10. yvonne-composed.png — COMPOSED

== ACCEPTANCE CHECKLIST (verify EVERY line before showing me an image) ==
[ ] Background is true transparent alpha — zero background pixels anywhere
[ ] No fringe/halo/outline on the silhouette edge
[ ] Full figure: hair, both hands, both shoes fully inside the canvas
[ ] No shadow, floor, or ground contact mark
[ ] Same person as the reference: face, hair, skin tone, build, wardrobe
[ ] Wardrobe identical across this character's whole set
[ ] Camera and figure scale consistent with the other sprites in the batch
[ ] Expression matches the vocabulary definition named for this file
[ ] No text, watermark, props not listed, or extra people
[ ] Style is indistinguishable from the attached references

== DELIVERY ==
One image per reply, captioned with ONLY its exact filename. Work through
the cast table in order. If any checklist line cannot be satisfied, say
which line and why instead of showing a failing image.
```

---

## Reusing this for other careers

Keep everything outside `== CAST ==` byte-identical. For a new career,
rewrite only the cast rows: one identity sentence per character (drawn from
their approved reference art — skin, hair, age, build, jewelry, exact
wardrobe including uniform color, and named props), then assign expression
sets by role using the fixed vocabulary:

| Role in the story              | Sprites                         |
| ------------------------------ | ------------------------------- |
| The mentor beside you          | welcoming, proud, concerned     |
| The judge above you            | composed, assessing, concerned  |
| The peer you're measured against | confident, focused, uncertain |
| The figure at the top          | composed (one only)             |

Filenames are always `<name>-<expression>.png`, lowercase, hyphenated —
they map 1:1 onto `EXPRESSION_PORTRAITS` in
`src/components/play/expressions.ts`.
