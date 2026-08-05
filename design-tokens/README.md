# Dreamari design-token handoff

This directory is the portable token source for the Dreamari coded design reference. The production application's `packages/ui/tokens` remains the final source of truth; compare these files there before production adoption.

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
