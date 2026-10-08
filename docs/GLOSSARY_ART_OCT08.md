# Glossary LAB art, 8 October 2026

## Intent

The user rejected recoloured variants of the same soft 3D technique. These sets differentiate the illustration technique itself. Signal's supplied pixel artwork is unchanged. Dreamy remains the original floating white-blue cloud with glassy star eyes, no limbs and no human body. The experimental procedural mascot is not enabled.

## Final directions

- **Drift:** premium sculpted 3D, satin sky-blue/navy/cream surfaces, restrained gold accents, soft studio shading. A tactile counterpart to the rounded cloud-world surfaces.
- **Orbit:** flat editorial paper-cut illustration. Broad indigo, periwinkle and ivory shapes, hard offset cut-paper edges, subtle fibre texture. No ceramic gloss or soft toy shading. Layered ivory paper components with dark ink accompany these assets.
- **Horizon:** hard-edged faceted neon rendering. Dark navy polygon planes, cyan and hot-magenta emissive outlines, restrained glow, Miami Art Deco geometry. No gold, satin or inflated toy surfaces. Angular cyan/magenta UI rails accompany the art.
- **Signal:** existing pixel art and pixel/mono typography remain. Its supplied city background repeats with mirrored joining tiles and very slow rightward parallax. No generated backgrounds.

## Reusable generation brief

Generate one transparent isolated glossary object. Use the chosen technique above, not a recolour of another technique. No text, labels, UI, frames or backdrop. Compose a clear silhouette readable at small sizes. Preserve Dreamy's established cloud face when present; never give Dreamy hands, legs or a human torso. No other characters.

Semantic briefs, unchanged across sets:

| Word | Visual meaning |
| --- | --- |
| Company | Sneaker boutique with a cloud-shaped awning and one sneaker in its window |
| Product | One sneaker, clear lateral or three-quarter silhouette |
| Service | Sneaker customization, brush and palette beside the sneaker |
| Customer | Original Dreamy floating beside a sneaker shopping bag, holding nothing |
| Profit | Three stacks of star-marked coins, not a generic money bag |

For Orbit, prefer frontal boutique / lateral sneaker, broad flat shapes and four paper laces. For Horizon, prefer a stepped Art Deco shop, segmented polygon sole and holographic customization tools. Keep Dreamy's rounded cloud identity even when its surrounding props use paper or neon techniques.

## Generation provenance and outputs

Generated with the built-in image generation tool. Three asset-only agents produced five objects per theme. The first Orbit/Horizon sets were rejected and are not vendored. Final PNG source folders and image identifiers are in `scripts/prepare-glossary-art.mjs`, ordered company, product, service, customer, profit:

- Drift: `01a1190e-1cca-79e0-a2bb-a0297f12f804`
- Orbit: `01a1190e-4a51-72f2-ac68-61b16feba4de`
- Horizon: `01a1190e-705b-7c72-ba5b-aadb6c018e22`

Each source is named `exec-<identifier>.png` in the local generated-images folder. The preparation script checks alpha, trims transparent margins, preserves aspect ratio, fits into 90% of a square canvas and exports WebP. It does not redraw or stretch the artwork.

Final output roots:

- `public/images/glossary/themes-oct08/drift/`
- `public/images/glossary/themes-oct08/orbit-paper/`
- `public/images/glossary/themes-oct08/horizon-neon/`

Each has `company`, `product`, `service`, `customer`, `profit` at 768px (`<term>.webp`) and 256px (`<term>-256.webp`). Small activity/HUD art uses the 256px files. Learning cards use 768px. Only the active theme's small assets and mascot poses are preloaded. Fresh technique-specific paths avoid serving the rejected sets from browser caches.

Run normalization from the repo root:

```sh
node scripts/prepare-glossary-art.mjs /absolute/path/to/generated_images
```

## Scope

Only the existing Glossary LAB route is restyled. Main game content, question data, answer text, grading, seven-question sequence, Power Play, unlock rules and Quick Links placement remain. Sorting gains pointer capture for mouse/pen/touch dragging and reassignment, alongside the existing tap and keyboard buttons. Mastery is still committed through the existing continuation flow.
