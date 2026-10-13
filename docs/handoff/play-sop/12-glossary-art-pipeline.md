# 12. Scale glossary artwork: Drift and Signal

## Why this is separate from lesson content

Chandu asked for Levels 2 to 4 to match Level 1, and for a prompt that can
scale to future careers. Art is a supporting visual, not an alternative to
the lesson's explanation or a place to bake in the correct answer.
Keep authored words, definitions, examples, questions, answer options, types,
sequence, numbers and scoring unchanged. Preserve the live scene-card diagrams.

Only Drift and Signal are active. Do not generate Orbit/Horizon sets.
Do not generate game backgrounds, cards, UI, text, numbers or formulas.
Dreamy is always a floating cloud, never a person with limbs.

## Required style anchors

Always attach the shipped reference bytes, not only a written style name.
Use these as style/character references, not edit targets:

| Theme | Character | Object / materials | Currency |
| --- | --- | --- | --- |
| Drift | `public/images/glossary/themes-oct08/drift/customer.webp` | `public/images/glossary/themes-oct08/drift/company.webp` | `public/images/glossary/themes-oct08/drift/profit.webp` |
| Signal | `public/images/glossary/signal/cloud-sale-sneaker.webp` | `public/images/glossary/signal/building.webp` | `public/images/glossary/signal/coins-320.webp` |

For new careers, change the subject props, not the theme's technique or
Dreamy's identity. Add a same-theme prop reference when the subject needs one.
Do not use another theme as an anchor. Never chain only off the last generated
image: return to the canonical Level 1 anchors to prevent cumulative drift.

## Copy/paste production prompt

Replace the bracketed fields and attach the three theme references above.
Generate ONE asset per call. A sheet of five pictures is not a production asset.

```text
Use case: stylized-concept
Asset type: one isolated Dreamari glossary illustration
Career: [CAREER]
Term: [EXACT TERM ID]
Meaning: [EXACT AUTHORED DEFINITION]
Example context: [EXACT AUTHORED EXAMPLE, for meaning only; never render text]
Subject: [ONE CLEAR VISUAL METAPHOR OR CONCRETE PROP]

Generate a new subject. Attached images are canonical STYLE and CHARACTER
references only. Do not copy their subject when this term needs another one.

Composition: one compact centered object cluster on genuine transparent alpha.
Square 1024px source, roughly 82% subject coverage and 8-10% clear safe margin.
Clear silhouette at 48px, attractive at 200px. Maximum one main subject and
two supporting cues. Use a broad arrow only if direction teaches the meaning.
No clipping or ground rectangle. No background scene, UI, card, frame, words,
letters, numbers, formulas, percentage, branded logo or watermark. The app
renders all text and exact maths. Avoid clutter, generic stock clipart and
irrelevant decoration. Do not depict a numerical answer or guarantee a result.

Character lock: if the subject needs a person, use Dreamy, not a human.
Keep the reference's floating cloud silhouette, white/cyan lobes, large deep
navy star eyes and small blue mouth. No arms, hands, feet, legs, human torso,
other people or animals. Props sit or float beside Dreamy. Dreamy holds nothing.
Expression: [happy / interested / thoughtful / gently concerned]. Not scary.
Do not add Dreamy when a simple object teaches this term more clearly.

Style: [INSERT ONE THEME LOCK BELOW]
```

### Drift style lock

```text
Match the attached Drift Level 1 artwork. Premium sculpted 3D illustration,
satin sky-blue and deep navy, ivory, restrained metallic gold. Polished molded
forms, soft bevels, believable depth, clean small studio highlights. Soft
upper-left lighting, navy undersides, contact shadows only between objects.
Objects use a three-quarter frontal view; Dreamy keeps the reference's face.
Arrows use the same tactile material. No pixel art, flat vector, painterly
brushwork, fuzzy clay, inflated toy blobs, neon or photographic people.
```

### Signal style lock

```text
Match the attached Signal Level 1 artwork. Carefully drawn 2D pixel-art game
sprite, dark navy stepped outlines, visible square pixel clusters and clean
three/four-tone cel shading. Cyan, white, blue and gold, restrained amber
accents. Build on a coherent logical grid around 128x128, enlarged with
nearest-neighbor. No antialiasing, smooth curves, blur, 3D rendering, soft
gradients, painterly textures or photographic shine. Dreamy's silhouette,
star eyes, expression and props must use the SAME pixel grid.
```

## Subject planning, before generation

1. Read the actual lesson data. Inventory unique term IDs across all levels.
2. Reuse an existing asset only when its meaning and example context match.
3. Write one concrete semantic brief per term. The two themes share meaning
   but change illustration technique. Do not merely recolor a 3D image.
4. Separate confusable concepts. Revenue is all sales income, Profit is what
   remains after costs, Margin is the portion kept, Cash Flow has both directions.
   Stock is ownership; Bond is repayable borrowing; Interest is extra repayment.
5. If the term cannot be represented honestly, keep the glyph/diagram fallback.
   Do not register a misleading picture simply to reach full coverage.
6. For story-specific assets, scope the registry to the career. A sneaker shop
   must never silently appear in Nursing or Aviation because an ID is shared.

## Production manifest and repeatable commands

Example: `docs/reference/glossary-finance-art-oct13.json`. It stores the exact
template, style locks, anchors, semantic briefs, level/term IDs and generation
source paths. Built-in ImageGen is the generation method; no external provider
account or paid CLI is implied. Keep original PNG sources untouched.

```sh
# One JSONL prompt per asset, with the required references.
node scripts/glossary-art.mjs prompts docs/reference/glossary-finance-art-oct13.json

# After every source is filled in, export a new versioned set and receipt.
node scripts/glossary-art.mjs prepare docs/reference/glossary-finance-art-oct13.json

# Read-only file verification. Requires the original local sources.
node scripts/glossary-art.mjs validate docs/reference/glossary-finance-art-oct13.json

# Contact sheets with unchanged Level 1 anchors in the top row.
node scripts/glossary-art.mjs preview docs/reference/glossary-finance-art-oct13.json /absolute/path/to/review
```

For another career, copy the manifest, set a NEW version and career slug,
replace the terms/briefs and source paths, keep the theme locks/anchors.
The script refuses missing alpha, clipped sources, collisions and over-budget
outputs, including duplicate term slugs. Validation checks the current source,
reference, prompt and output hashes against the saved receipt. It does not
generate images or make a quality judgment.
The preview command composes existing artwork for review, not game backgrounds.
Original local generation sources are not required by the deployed player;
only optimized WebPs ship. Receipts preserve source/reference SHA-256 hashes,
generation IDs, exact final prompts, dimensions, output hashes and byte sizes.
AI provenance is not a legal licence certification.

### File contract

- Path: `public/images/glossary/<version>/<drift|signal>/<term-slug>.webp`.
- Drift: large 768px, small 256px named `<term-slug>-256.webp`.
- Signal: large 768px, small 320px named `<term-slug>-320.webp`.
- Alpha-preserving square canvases. Trim only transparency; never stretch.
- Drift subject fits within 90% of the canvas.
- Signal is sampled once onto a 128px grid, then enlarged with nearest-neighbor.
  Small output pads the grid before doubling so no fractional pixels appear.
- Budgets: 140KB large, 35KB small. Aim below these, not at the ceiling.
- Add explicit career/term ID mappings in `src/components/glossary/termArt.ts`.
  Never use broad keyword matching for new terms.
- Preload only the active theme's current lesson assets. Prefetch the next
  teaching card, not every asset across careers. Never ship full source PNGs
  to a 40px HUD or matching tile.

## Acceptance gate, every new set

A prompt alone cannot guarantee consistent style. Do all of these before push:

- Review every image beside the canonical anchors at both 200px and 48px.
- Check the term's actual meaning, not just whether the image is attractive.
- No misleading guaranteed gains, gambling cues, unintended text or wrong props.
- Dreamy has the correct cloud face and no limbs/human body; no substitute cast.
- Genuine transparency, safe margins and preserved aspect ratio.
- Signal uses pixel clusters, not a pixel filter over 3D. Drift retains satin depth.
- Equal canvas dimensions and visual weight within each theme. No tiny subjects.
- Check all three levels' teaching faces, examples, five-term reward and HUD.
- Check the matching screen, sort screen and a numerical case. Diagrams and
  authored copy still render unchanged. No pictures baked with answer numbers.
- Do not decorate an unplaced conceptual sorting statement with its correct
  bucket's picture. That reveals the answer. Bucket-header art is safe; item
  art must represent the item's own subject, independently of its destination.
- Phone, tablet and laptop: labels wrap cleanly, art does not squish, no page scroll.
- Check Level 1 regression. Do not replace its anchors or shipped artwork.
- Run TypeScript, scoped lint, `npm run tokens:check` and asset validation.
- Update AI handoff with WHY, new set paths, checks, rejected variants and limits.
- Push only with user authorization, then verify the exact production SHA,
  hosted bytes and live asset rendering before calling the set live.

## This set

Investment Banking Levels 2 to 4: 15 terms, two styles, 30 illustrations and
60 optimized WebP files. Existing Level 1 assets and all question data stay
unchanged. Contextual imagery supplements definitions; scene-card maths stays
authoritative. The earlier no-new-term-art recommendation is superseded only
by Chandu's explicit request for this theme-consistent asset pass.
