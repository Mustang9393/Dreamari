# Background Space — why extraction "fails" and exactly what to build (2026-08-19)

## Why you can't extract it

The atmospheric background is NOT a token, style, or exportable asset —
so the Variables API, style export, and asset export all come back
empty-handed. In Figma it is a plain frame named **`Background Space`**
(e.g. node `3185:17012` on the Explore-Browse screen; every screen has
a copy) containing five ordinary layers:

| Layer | What it is | Recreate as |
|---|---|---|
| Blue Nebula | 864×864 ellipse, fill `primary` (#2f6bf2), opacity 30%, layer blur 180 | CSS |
| Violet Nebula | 1008×1008 ellipse, fill `accent-subtle` (#8b7bff), opacity 20%, blur 200 | CSS |
| Pink Nebula | 720×720 ellipse, fill `decorative-pink-glow` (#ff5d7d), opacity 10%, blur 160 | CSS |
| Spotlight | 1152×576 ellipse, white, opacity 6%, blur 120 | CSS |
| Grain Texture | flat white rectangle at 5% opacity — NOT a real noise asset | CSS (or your own noise tile) |

There is nothing to export. You REBUILD it in CSS. If you ever need to
re-derive values yourself: select `Background Space` in Dev Mode →
click each child → the Inspect panel shows size, position, fill
variable, opacity, and Layer blur. That's the whole extraction.

## DO NOT ship the literal Figma version on the web

The naive translation — five `filter: blur(120-200px)` layers — is
exactly what we shipped first, and it CRASHED iPhone tabs in production
(Safari and iOS Chrome are both WebKit; huge blur layers exhaust the
tab's GPU memory → "a problem repeatedly occurred"). Pre-faded radial
gradients render the identical soft wash at near-zero GPU cost.

## Production-ready version (WebKit-safe, responsive, token-bound)

Battle-tested at dreamari.vercel.app/flow. Positions/sizes are
proportional translations of the 1440-frame absolutes; the px floors
stop the wash from vanishing on phones (vw-only sizing collapsed to
invisible blobs at 375px — learned the hard way).

```css
.background-space {
  position: fixed; /* or absolute, per surface */
  inset: 0;
  overflow: hidden;
  background: var(--background, #05070f);
}
.background-space > * { position: absolute; }

.bg-blue-nebula {
  width: max(60vw, 620px);
  aspect-ratio: 1;
  left: 50%;
  top: -16vh;
  transform: translateX(-35%);
  background: radial-gradient(circle,
    color-mix(in srgb, var(--primary, #2f6bf2) 34%, transparent) 0%,
    color-mix(in srgb, var(--primary, #2f6bf2) 14%, transparent) 40%,
    transparent 68%);
}
.bg-violet-nebula {
  width: max(100vw, 980px);
  aspect-ratio: 1;
  left: min(-30vw, -220px);
  top: 40vh;
  background: radial-gradient(circle,
    color-mix(in srgb, var(--accent-subtle, #8b7bff) 24%, transparent) 0%,
    transparent 66%);
}
.bg-pink-nebula {
  width: max(75vw, 700px);
  aspect-ratio: 1;
  left: 4vw;
  top: 18vh;
  background: radial-gradient(circle,
    color-mix(in srgb, var(--decorative-pink-glow, #ff5d7d) 14%, transparent) 0%,
    transparent 64%);
}
.bg-spotlight {
  width: max(95vw, 820px);
  height: max(45vh, 380px);
  left: 0;
  top: -4vh;
  background: radial-gradient(ellipse at 50% 40%,
    rgba(255, 255, 255, 0.07) 0%,
    transparent 62%);
}
/* Grain: the Figma layer is just flat white @5% — skip it, or add your
   own tileable noise PNG/SVG here if you want visible grain. */
```

Gradient opacity percentages bake in the Figma layer-opacity × a
falloff-shape correction (a radial gradient's average density differs
from a uniformly-blurred disc); they were tuned visually against the
Figma frame. Treat the deployed page as the acceptance reference.

## The named gradients (text-scrim etc.) are a DIFFERENT thing

Those are fill STYLES (not variables) — the bootstrap prompt's Step 4b
already carries their literal CSS (text-scrim, card-surface,
content-fade, hero-surface, cta-accent, signal-banner, shimmer). Same
rule: nothing to export; copy the CSS.
