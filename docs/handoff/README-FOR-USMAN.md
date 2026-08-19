# Dreamari handoff addendum — tokens, shadcn, and the two code-canonical surfaces

**For Usman (and your AI coding agent — this file is written to be
pasted to it directly).** Companion to the docs you already have:
`dreamari-handoff-package-2026-08-18.md` and
`dreamari-dev-bootstrap-prompt.md`. Everything there still applies —
especially "pull tokens live from the Variables API, never hand-type."

## What's in this package

| File | What it is |
|---|---|
| `README-FOR-USMAN.md` | This file — the map. |
| `SHADCN-ADAPTER-PROPOSAL.md` | Rationale + full mapping of Figma variables onto shadcn's theming contract, including the chart-palette policy. |
| `shadcn-adapter.css` | Working snapshot of that mapping — only the tokens Figma lacks today, everything else comes straight off your pull. Drop-in. |
| `CODE-CANONICAL-SURFACES.md` | The contract for the two surfaces that were designed in code and have no Figma screens (marketing landing, build-profile flow): screens live in code, values live in Figma. Includes the measured variable audit. |
| `bridge.css` | Working snapshot that re-addresses your pull to the `--color-*` names those two surfaces consume. Drop-in. |
| `figma-variables-to-add.md` | Executable spec for the missing Semantic variables (shadcn gaps + bridge verifications), with Light/Dark values and alias targets. |
| `BUILD_FLOW_SPEC.md` | Verbatim behavioral spec for the build flow (copy is contractual). |
| `background-space-extraction.md` | Why the atmospheric background can't be "extracted" (it's five blurred ellipses, not a token) + the production-ready, WebKit-safe CSS to use instead. |
| `figma-agent-prompt.md` | Micro-stepped prompt for the Figma AI agent to add all missing variables and run the approved cleanup — the design side runs this, then you re-pull. |

## Certification — 2026-08-19

The Figma file passed a full integrity audit and fix pass on
2026-08-19: **154 semantic variables, zero broken alias chains in
either mode, zero orphaned styles, zero ghost component references,
zero raw gradient fills on any build-target surface.** Pull with
confidence. Additions since your bootstrap prompt was written:

- `gradient/card-surface-transparent` — a semi-transparent sibling of
  `gradient/card-surface` (stops at a=0.3/0.7/0.85) used by the Career
  Poster Card roots of 4 worlds (Business & Money, Arts Media & Sport,
  Driving Flying & Shipping, Factories & Making Things) for stronger
  image bleed-through. All 15 worlds share the same structure: image
  in a `Career Image` child frame, gradient style on the root.
- `UI/Rank Number` (desktop, 180px) and `UI/Rank Number (Mobile)`
  (200px) text styles now bind the ranked-card digits.
- The `accent` family is brand blue (`#2f6bf2` dark / `#1e4fcc`
  light; `accent-subtle` `#3894ff`); the purple identity lives in
  `accent-purple` (`#7d5cff`). Violet Nebula layers bind
  `accent-purple`.

## Architecture in one paragraph

One Style Dictionary pipeline, fed by the live Figma Variables pull,
with **three outputs**: (1) your app's token CSS (`:root` = Light,
`.dark` = Dark), (2) `shadcn.css` for the internal/admin surface, (3)
`bridge.css` for the two code-canonical surfaces. The two `.css` files
in this package are hand-built snapshots of outputs 2 and 3 so you can
start today; convert them to generated outputs once your pipeline runs.
Every snapshot line carries a fallback literal, so nothing blocks on
the Figma additions — but the additions (see
`figma-variables-to-add.md`) are what make Figma the single source of
truth long-term.

## Order of operations

1. Stand up the Variables pull + token pipeline per your bootstrap
   prompt (no change).
2. Include `shadcn-adapter.css` after your generated tokens, before
   shadcn styles. Decide the admin default theme — the product is
   dark-first; admin renders light unless the root has `class="dark"`.
3. Whoever owns the Figma file runs `figma-agent-prompt.md` through
   the Figma AI agent (or applies `figma-variables-to-add.md` by hand);
   re-pull; the fallbacks go dead.
4. For the landing page and build flow: the deployed prototype
   (dreamari.vercel.app, /flow, /flow/cinematic) is the canonical
   design + behavior reference. The React sources
   (`src/components/marketing/`, `src/components/build/` in the
   prototype repo) port with `bridge.css` — they are React +
   Tailwind v4 + next/image; adaptation cost is framework glue, not
   styling. `BUILD_FLOW_SPEC.md` copy is verbatim-contractual.
5. Charts policy (matters for admin dashboards): `chart-1..5` are
   positional, for arbitrary series. When a chart's series ARE career
   worlds, color them with the world tokens directly and bypass
   `chart-*` — world colors are identity.

## Verify (extends the bootstrap prompt's Step 7)

- Render a shadcn kitchen-sink page (button, card, dialog, dropdown,
  input, sidebar, one chart) in BOTH modes next to the Explore screen —
  they should read as one product.
- Confirm on the live pull: `destructive` = `#F04438` (the `#ef4444`
  you may see in older prototype code is the pre-correction value).
- Spot-check three world colors + their poster fonts, per the original
  prompt.

## Platform lesson worth inheriting (learned in production here)

Never ship large-area `filter: blur()` layers or per-item
backdrop-filters — they exhaust WebKit's GPU memory and crash the tab
on iPhone (Safari AND iOS Chrome). Use pre-faded radial gradients for
nebula/glow washes; reserve backdrop-blur for a few card-level
surfaces. All world/poster fonts are free Google Fonts — licensing is
a non-issue.
