# Dreamari design-token handoff

**Do not import these files into the production app.** Production tokens are the certified Figma export in the app repo (`packages/ui/tokens`), with flat shadcn names. Copy values, not files. Read `docs/handoff/DESIGN_SYSTEM_HANDOFF_2026-10-24.md` first, then `docs/DESIGN_SYSTEM_ALIGNMENT.md` and `docs/TOKEN_DECISIONS.md`.

This directory is the portable token source for the Dreamari coded design reference only. The production application's `packages/ui/tokens` remains the final source of truth.

## 24 October 2026: Black & Blue is the token set

The files now carry the app's current look, Black & Blue (the default since 19 October 2026, `src/app/look-v2.css`): a dusk-navy dark mode and a cool-white light mode. What changed:

- **Brand ramp re-hued to 213deg.** `color.brand.*` now holds the Black & Blue ramp; `brand.600` is the dusk cobalt `#2f5fb1`. The old purple and pink slots (`accent.purple`, `decorative.pink-glow`) resolve to light blues and are for glows only.
- **Two new primitive groups, `color.dusk.*` (dark) and `color.day.*` (light)**, holding every surface, ink, border and link value the look uses. They exist in both primitive files at identical values; the semantic files choose between them.
- **A new semantic group, `color.ui.*`**, the flat theme vocabulary the app paints with: `background`, `foreground`, `card`, `surface`, `muted`, `muted-foreground`, `border`, `primary`, `primary-hover`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-subtle`, `destructive`, `glass-surface-1..3`, `glass-border`, `inset-surface`, `inset-border`, `scrim-base`, `scrim-ink`, `scrim-ink-soft`. Each token names its runtime CSS variable. These are the shadcn role names production already uses, so they map 1:1.
- **Dark primary is periwinkle with dark ink.** `color.ui.primary` is `#8fb3f5` in dark with `primary-foreground` `#0b1a33` (8.2:1). White on it is 2.1:1, so never hard-code white on a primary fill. Light keeps cobalt `#2f5fb1` with white (6.2:1).
- **Existing semantics re-pointed** where the live app had moved: `action.primary(-hover)`, the new `action.primary-foreground`, `text.brand`, `surface.page`, `surface.card`, `surface.feature(-strong)` in light, dark glass rungs. `action.secondary` keeps `#7fa8ff` (`accent.sky`) because the Glossary Games clouds mix it and game worlds keep their own palettes.
- **`component.cta` is the blue button** (primary fill, primary-foreground ink; secondary is glass with a hairline), matching the decision logged in `docs/TOKEN_DECISIONS.md`. It described the retired white button until now.
- **The validator checks more pairs** and composites translucent colours over the page before measuring: body, secondary and link text on the page, cards and glass; primary ink on primary and primary-hover; secondary ink on secondary; scrim ink on scrim. Each needs 4.5:1 in both modes.
- **Checked against the running app:** with these values swapped in, every painted colour of ~3,000 sampled component-library elements was identical in dark and light. The only generated variables whose values moved are ones nothing in `src/` reads.

**Classic is archived, not part of this set.** The token files as they stood before this change, and the CSS they generated, are in `archive/classic-2026-10-24/`. The prototype's Classic switch (`?look=v1`, DEMO-ONLY) keeps working from `src/app/archive/look-classic.css`. Neither is to be handed off or built from.

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
