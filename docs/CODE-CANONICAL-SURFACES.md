# Code-canonical surfaces: landing page + build flow (2026-08-19)

Two shipped surfaces were designed IN CODE and have no Figma screens:

1. The marketing landing page (`src/components/marketing/*`, live at /)
2. The build-profile flow (`src/components/build/*`, live at /flow and
   /flow/cinematic — A/B variants, one implementation)

Resolution agreed: **screens live in code, values live in Figma.** These
two surfaces are canonical as code; every color/radius/spacing/font they
consume must resolve from the same live Figma Variables pull that powers
the rest of the app. This doc is the contract that makes them
plug-and-play for the production repo.

## Alignment audit (measured, not estimated)

- Landing: 41 distinct CSS vars consumed → **31 are the exact Figma
  variable names already** (`--background`, `--muted-foreground`,
  `--glass-surface-1`, `--world-*`, `--scrim-*`, `--radius-*`,
  `--space-*`…). The page was built against the extracted Figma dialect.
- Build flow: 48 distinct vars → **21 are the same Figma concepts with
  Tailwind v4's `--color-` prefix** (`--color-glass-surface-1` ↔
  `glass-surface-1`, `--color-night-*`, `--color-world-*`,
  `--color-brand-400/500`, `--color-accent-purple`,
  `--color-decorative-pink-glow`). Zero direct-name hits only because of
  the prefix convention — the concepts are the same tokens.
- Remaining 27 flow-side vars belong to the embedded Match experience
  (`--color-match-*`, `--match-*`) — Match HAS Figma screens and is on
  the dev's own build list; the prototype's Match tokens are not part of
  this contract.

## The bridge (what makes it plug-and-play)

The production pipeline needs ONE additional Style Dictionary output —
or equivalently a static bridge stylesheet — that re-addresses the pull:

```css
/* bridge.css — generated, not hand-maintained */
:root {
  --color-glass-surface-1: var(--glass-surface-1);
  --color-glass-surface-2: var(--glass-surface-2);
  --color-glass-surface-3: var(--glass-surface-3);
  --color-glass-border: var(--glass-border);
  --color-glass-stroke: var(--glass-stroke);
  --color-glass-hover: var(--glass-hover);
  --color-night-background: var(--night-background);
  --color-night-card: var(--night-card);
  --color-night-foreground: var(--night-foreground);
  --color-night-muted-foreground: var(--night-muted-foreground);
  --color-brand-300: var(--brand-300); /* primitives ramp */
  --color-brand-400: var(--brand-400);
  --color-brand-500: var(--brand-500);
  --color-brand-900: var(--brand-900);
  --color-accent-purple: var(--accent-purple);
  --color-accent-subtle: var(--accent-subtle);
  --color-decorative-pink-glow: var(--decorative-pink-glow);
  --color-feedback-success-dark-surface: var(--feedback-success-dark-surface);
  /* world-*: emit all 15 with the prefix */
}
```

Verify on the live pull which of these exist as Figma variables (glass
and night groups shipped in the dev handoff docs; brand ramp and accents
are primitives). Anything missing goes on the same "add to Figma
Semantic" list as the shadcn gap tokens — Figma stays the value source.

## What ships WITH the surfaces (page-local by design, not tokens)

- `--mu` (chapter graphic scale) and `--c` (per-chapter accent): layout
  machinery, defined in the pages' own CSS.
- Animation keyframes (aurora, ink-bleed, card-cascade, option-reveal,
  rail drift, Dreamy sprites' animations) in globals.css — behavior, not
  theme.
- Font-family handles (`--font-body`, `--font-poster*`): families ARE
  design-system facts (the Career Poster Card's per-world faces); load
  via the font stylesheet in `marketing/fonts.ts`. All are free Google
  Fonts — no licensing work.
- Assets: `/images/dreamy/v2/*` sprites, `/images/trending/*` posters
  (exported from the Figma file itself), career photos.
- Copy: build-flow copy is contractual, verbatim from
  `docs/BUILD_FLOW_SPEC.md`.

## Handoff shape for the production dev

1. This repo's deployed URLs are the interaction/visual reference.
2. `src/components/marketing/` and `src/components/build/` port with the
   bridge above — they are React/Tailwind v4/next-image; adaptation cost
   is the framework glue, not the styling.
3. Behavior specs: `docs/BUILD_FLOW_SPEC.md` (flow), plus the WebKit
   lesson worth honoring anywhere: never ship large-area `filter:
   blur()` layers or per-item backdrop-filters — use pre-faded radial
   gradients (crashed iPhone Safari/Chrome tabs in production here).
4. Figma remains the arbiter of every token VALUE these pages consume;
   when the pull changes, these surfaces re-theme with no code edits.
