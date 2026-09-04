# Dreamari design-token handoff

**Do not import this directory into the production app.** Production tokens are the certified Figma export in the app repo (`packages/ui/tokens`): flat shadcn names (`background`, `foreground`, `card`, `primary`), two layers, single-mode primitives. This directory is the prototype's own vocabulary (nested `color.text.primary`, three layers, split light/dark) and is not a version of that system. Take design decisions from the prototype (layout, copy, behaviour); take tokens from Figma. Token-level decisions made in the prototype are listed in `docs/TOKEN_DECISIONS.md` so they can be made in Figma and re-exported.

This directory is the portable token source for the Dreamari coded design reference only. The production application's `packages/ui/tokens` remains the final source of truth.

## Files

- `primitives.light.tokens.json`
- `primitives.dark.tokens.json`
- `semantic.light.tokens.json`
- `semantic.dark.tokens.json`
- `components.tokens.json`

All five files target the W3C Design Tokens Community Group 2025.10 format and pin its public schema. Light and dark files intentionally expose identical paths so mode changes never require component renames.

## Rules

1. Primitive tokens contain explicit values.
2. Semantic tokens preserve aliases to primitives.
3. Component tokens preserve aliases to semantic or foundation tokens.
4. Typography and shadows use DTCG composite values.
5. Every token carries a type and description.
6. Stable paths are an API. Rename deliberately and document migrations.
7. Do not edit generated CSS or TypeScript. Edit the token files and rebuild.

## Commands

```bash
npm run tokens:build
npm run tokens:validate
npm run tokens:check
```

`tokens:build` generates:

- `src/app/design-tokens.generated.css`
- `src/generated/design-tokens.ts`

`tokens:validate` checks JSON parsing, DTCG value shapes, explicit/inherited types, descriptions, cross-file aliases, circular references, light/dark path parity, composite completeness, alias preservation, and required text contrast.

`tokens:check` additionally fails when generated artifacts are stale. Run it in CI and before every push that changes tokens.

## Intentionally code-owned values

Not every numeric or color literal is a portable design token. These remain implementation constants and must not be exported as misleading cross-platform values:

- responsive formulas using `calc()`, `min()`, `max()`, viewport units, or breakpoints;
- canvas particle physics, alpha interpolation, lightning, and confetti calculations;
- SVG illustration paint and decorative clay-scene colors;
- image crop coordinates and aspect-ratio math;
- animation keyframe geometry;
- transient transforms used for drag, swipe, or scroll choreography.

If one of these becomes a reusable product decision rather than implementation math, promote it into the appropriate token collection and add a description explaining the contract.

## Figma and production workflow

Use one light primitive + light semantic + components set for light mode, and the corresponding dark files for dark mode. Preserve aliases when importing or exporting. Do not flatten semantic or component values into resolved hex, pixel, typography, or shadow strings.

Before production use, compare paths and values against the production repository's `packages/ui/tokens` and run its dependency-free `packages/ui/scripts/validate-tokens.mjs`. Production wins if the two sources disagree.

## Purge of 4 September 2026

Unused tokens were removed so the set Usman pulls is the set the product uses. Rules applied:

- A token stays if the prototype references it (`var(--…)` or a Tailwind utility mapped in `globals.css`), or if a kept token aliases it.
- Foundations always stay: `dimension.*`, `duration.*`, `fontFamily.*`, `fontWeight.*`, `number.*`, `typography.*`, `shadow.*`. These are the scales a shadcn theme maps onto.
- Semantic roles that mirror shadcn roles always stay: `color.action.*`, `color.text.*`, `color.feedback.*`, `color.elevation.*`, `color.border.strong`, `color.surface.brand|navigation|feature*`.
- Component groups that mirror shadcn components stay: `component.cta`, `component.input`, `component.progress`, `component.toast`, plus `component.home-card`, which the app uses.
- Removed: prototype-only colour primitives (match backdrops, path accents, unused palette steps), the `path`, `category` and `match` semantics, and the component groups that described retired screens (`home-hero`, `home-feature`, `home-navigation`, `home-quick-action`, `home-rail`, `home-shell`, `match-card`, `match-progress`, `flow-card`, `selection-item`, `speech-bubble`, `step-header`).
- Display face is Bricolage Grotesque; Favorit is gone from `fontFamily.display`.

Count: 587 tokens before, 464 after, light and dark still at path parity. Rebuild and validate with `npm run tokens:check`.
