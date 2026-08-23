# Glass: the `raised` rung — mirror into `packages/ui/tokens` (2026-08-24)

Two primitives were added to the prototype's DTCG collection
(`design-tokens/primitives.{dark,light}.tokens.json`, group `color.glass`).
They need to land in the app repo's `packages/ui/tokens` and in the Figma
Semantic collection, or the two token sources drift.

**This is additive.** No existing token changed value. Nothing already built
against the glass set renders differently after applying it.

## Why

`glass-surface-1` is `#ffffff08` — 3.1% white. Over the night/nebula
backgrounds the build flow and match deck sit on, an option tile filled with
it has no perceivable boundary: its `glass-border` hairline (`#ffffff17`, 9%
white) measures far under the 3:1 that WCAG 2.2 **1.4.11 Non-text Contrast**
asks of a UI component's boundary. The tiles read as loose text, and readers
with low vision lose the hit target entirely.

Rather than move `surface-1` — which mirrors a Figma variable and is correct
where a film is purely decorative — the ramp gains a rung above it.

## The tokens

| Name | Dark | Light | Role |
|---|---|---|---|
| `glass-surface-raised` | `#ffffff11` (6.67% white) | `#ffffffad` (67.8% **white**) | rest fill for a glass tile the reader must be able to find |
| `glass-border-raised` | `#ffffff29` (16% white) | `#0000002e` (18% black) | the hairline that pairs with it |

Dark sits between `surface-1` (`#ffffff08`) and `surface-2` (`#ffffff17`), so
the hover/active step still reads as a step up. `border-raised` sits between
`glass-border` (`#ffffff17`) and `glass-hover` (`#ffffff2e`), so a resting
tile gets a visible edge without borrowing the hover state's weight.

**Light is frosted white, not black-alpha, and that is deliberate.** The
black-alpha rungs go muddy grey over the pastel aurora these screens use. The
prototype had already patched this downstream for `surface-1`
(`html.light { --color-glass-surface-1: rgb(255 255 255 / 0.62) }` in
`globals.css`, with a comment asking for real rungs); this rung authors it in
the source instead.

## DTCG source

`primitives.dark.tokens.json`, inside `color.glass`:

```json
"surface-raised": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [1.0, 1.0, 1.0], "alpha": 0.066667 },
  "$description": "Figma var(--glass-raised) #ffffff11 - the white-alpha rung between surface-1 and surface-2. The rest fill for glass tiles that a reader has to be able to FIND: surface-1's #ffffff08 over a night background leaves no perceivable tile edge, which fails WCAG 2.2 non-text contrast (1.4.11) for the option cards in the build flow. Reach for surface-1 only for decorative film that nobody has to locate."
},
"border-raised": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [1.0, 1.0, 1.0], "alpha": 0.160784 },
  "$description": "Figma var(--glass-border-raised) #ffffff29 - the hairline that pairs with surface-raised. Sits between border (#ffffff17, decorative) and hover (#ffffff2e), so a resting tile has a visible boundary without borrowing the hover state's weight."
}
```

`primitives.light.tokens.json`, same group — components/alpha differ, and both
modes must carry the same paths or the validator's parity check fails:

```json
"surface-raised": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [1.0, 1.0, 1.0], "alpha": 0.678431 },
  "$description": "Light-mode partner to the dark surface-raised: frosted WHITE, not the black-alpha film. The black-alpha rungs read as muddy grey over the pastel aurora the flow and match screens sit on, so the light glass recipe for those night-token surfaces is a translucent white panel."
},
"border-raised": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0.0, 0.0, 0.0], "alpha": 0.180392 },
  "$description": "Light-mode partner to the dark border-raised: #0000002e, a step past the decorative border (#0000001f) so a resting tile keeps a visible edge on the light wash."
}
```

Emitted CSS:

```css
/* light */  --color-glass-surface-raised: rgb(255 255 255 / 0.678431);
             --color-glass-border-raised:  rgb(0 0 0 / 0.180392);
/* dark  */  --color-glass-surface-raised: rgb(255 255 255 / 0.066667);
             --color-glass-border-raised:  rgb(255 255 255 / 0.160784);
```

The alphas are authored on 8-bit steps on purpose, so Figma and CSS agree and
a minifier's `#fff1` / `#ffffff29` round-trip is lossless.

## Figma

Add to the **Semantic** collection alongside the existing `glass-*`
variables, both modes, fill scope for `glass-raised` and stroke scope for
`glass-border-raised`. See `figma-variables-to-add.md` § D.

## Which rung to use

- Interactive tile, chip, panel or select the reader has to locate →
  `surface-raised` + `border-raised`.
- Decorative film, dividers, and trim on a surface that already has its own
  fill (`surface-3` panels, `night-card`) → `surface-1` / `border`, unchanged.
- Hover/active → `surface-2` / `glass-hover`, unchanged.

Applied in the prototype across `src/components/build/**` (27 references) and
`src/components/match-lab/MatchLab.tsx` (9 fills + the 6 hairlines paired with
them; its dividers, `surface-3` sheets and `night-card` deck keep the
decorative rung).
