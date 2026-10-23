# Design system alignment: Figma v2.0, this prototype, the production app

Last checked 24 October 2026. Figma file: "Dreamari Design System v2.0" (sV90J9zEKarhCYJMQKbYxx). Production app: dreamonna, tokens in `packages/ui/tokens`, imported from the certified Figma export.

**Start with `docs/handoff/DESIGN_SYSTEM_HANDOFF_2026-10-24.md`.** It is the build guide for Usman; this page is the short version of where each layer stands.

## State today

The look changed after the last Figma alignment (4 September). Since 19 October 2026 the app's default look is **Black & Blue**: a dusk-navy dark mode and a cool-white light mode, one blue hue (213deg), no purple. The prototype's token files took those values on 24 October. Figma has not yet.

| Layer | Source of truth | Status |
|---|---|---|
| Token values, both modes | This prototype: `color.ui.*` in `design-tokens/semantic.*.tokens.json`, the table below | Current as of 24 Oct 2026. |
| Token names | Figma variables and the app's flat shadcn names | Unchanged. `color.ui.*` uses the same names. |
| Figma variables | Figma v2.0 | Behind: still the September values. Design to update; see "What Figma needs". |
| Text styles | Figma text styles | Current (Inter body, Bricolage Grotesque display; corrected 4 Sept). |
| Components and screens | This prototype (`src/`) and the component library at `/component-lab` | Current. Build from the prototype. |
| Brand marks | `docs/BRAND_MARKS.md` and `src/components/connect/primitives.tsx` | Cleared for demo use; licences before launch. |

Classic, the look before 19 October, is archived (`design-tokens/archive/classic-2026-10-24/`). It is not part of the design system and is not to be built.

## Shared vocabulary

Figma, the prototype's runtime CSS and the app use the same flat names. A value in the prototype maps straight onto the app token of the same name. Measured from the running app on 24 October 2026; the token files match.

| Name | Dark (Dusk) | Light |
|---|---|---|
| `--background` | #131f36 | #f3f6f9 |
| `--foreground` | #f4f7ff | #101a26 |
| `--card` | #13213a | #ffffff |
| `--surface` | #142338 | #ffffff |
| `--muted` | rgba(21, 36, 60, 0.94) | rgba(29, 37, 57, 0.035) |
| `--muted-foreground` | white 82% | #434c58 |
| `--border` | rgba(148, 194, 249, 0.14) | #d5dde7 |
| `--primary`, `--accent` | #8fb3f5 | #2f5fb1 |
| `--primary-foreground` | #0b1a33 | #ffffff |
| `--secondary` | rgba(30, 48, 78, 0.95) | rgba(29, 37, 57, 0.08) |
| `--secondary-foreground` | #f4f7ff | #1d2539 |
| `--accent-subtle` (link and brand text) | #cbe0fb | #24508f |
| `--destructive` | #ff9592 | #ce2c31 |
| `--glass-surface-1` / `-2` / `-3` | rgba(21, 36, 60, 0.94) / rgba(30, 48, 78, 0.95) / rgba(16, 28, 48, 0.96) | #ffffff / #ffffff / #ffffff |
| `--glass-border` | rgba(148, 194, 249, 0.14) | rgba(16, 42, 80, 0.12) |
| `--inset-surface` / `--inset-border` | rgba(34, 53, 85, 0.94) / white 14% | #f3f6f9 / rgba(16, 42, 80, 0.10) |
| `--radius-xs` / `-sm-alt` / `-sm` / `-md` / `-md-alt` / `-lg` / `-xl` / `-2xl` / `-full` | 4 / 5 / 8 / 12 / 14 / 16 / 20 / 24 / 999 | same |
| `--space-1` to `--space-14` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 52, 56 | same |
| Display face | Bricolage Grotesque | same |
| Body face | Inter | same |

The prototype's runtime copies of these values are `src/components/marketing/tokens.css` (base) with `src/app/look-v2.css` on top (Black & Blue). In the token files they are `color.ui.*`.

## What Figma needs

Design re-points the Figma variables to the table above, in both modes, and the app takes the next export as usual. The decisions behind each value are in `docs/TOKEN_DECISIONS.md`. Until then the app can take values from the table; names do not change.

## What lives only in the prototype

Take layout, copy, behaviour and motion for these from the running app and the files named. Every reusable piece, with its states, is in the component library at `/component-lab`.

- Landing page and its chapters: `src/components/marketing/`
- Home: `src/components/app/HomeExperience.tsx`
- Explore: `src/components/app/ExploreExperience.tsx`, `CompanyVideoCards.tsx`
- Connect: `src/components/connect/`
- Profile: `src/components/profile/`
- Colleges search and detail: `src/components/colleges/`
- Career detail: `src/components/career/`
- Play: `src/components/play/`; Glossary Games: `src/components/glossary/`
- The look itself (sky backdrop, lit action, light hooks, photo scrims): `src/app/look-v2.css`
- Motion: confirm shimmer, spark bar, burst, gesture hint: `src/components/flow/`, `src/app/globals.css`

## Instructions for the production app

1. Map the app's flat tokens to the table above (or take the next Figma export once design has updated it). Do not hand edit an export.
2. Do not import `design-tokens/` from this repo. Copy values, not files. Never touch `design-tokens/archive/`.
3. Build screens and components from the prototype. Where the prototype uses a token name, use the app token of the same name. Where it uses a literal, that is a component-level design decision; express it with the nearest app token or a local value, and do not create a new token for it.
4. If the prototype and Figma disagree on a screen, the prototype wins. If they disagree on a token value, the table above wins until Figma is updated.
5. New token-level decisions are logged in `docs/TOKEN_DECISIONS.md`.

## For an agent reading this repo

- Read the handoff named at the top, this file, `docs/TOKEN_DECISIONS.md` and `docs/BRAND_MARKS.md` before proposing an import.
- Take design decisions from `src/`. Take token names from the Figma export and values from `color.ui.*`. Never copy `design-tokens/*.json` or `src/app/design-tokens.generated.css` into the production app.
- `src/app/archive/` and `design-tokens/archive/` hold the archived Classic look. Ignore them.
