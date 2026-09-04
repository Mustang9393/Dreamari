# Design system alignment: Figma v2.0, prototype, production app

Audited 4 September 2026 against the Figma file "Dreamari Design System v2.0" (sV90J9zEKarhCYJMQKbYxx): the Components section, the CTA, Desktop Navigation, FormInput and Env Card v2 components, and the Screens sections. Read this before importing anything from this repo into the production app.

## The short version

- The Figma file and this prototype share ONE token vocabulary at runtime: flat shadcn-style names (`--primary`, `--background`, `--foreground`, `--border`, `--glass-surface-1`, `--radius-md`, `--space-4`). The prototype's runtime values live in `src/components/marketing/tokens.css`. The `design-tokens/` DTCG folder is a separate experiment with its own nested names and is NOT for import (see its README).
- Colour roles, glass surfaces, radius and spacing are aligned between Figma and the prototype. Nothing to change there.
- Four values in Figma are stale. The prototype is ahead and is the intended state. Update Figma, then re-export.
- Figma has no designs for most of what the prototype now contains. The prototype is the reference for those screens. Nobody is asked to draw them in Figma first.

## Aligned (Figma = prototype = production names)

| Token | Value | Where |
|---|---|---|
| `--background` | #05070f | page |
| `--foreground` | #f4f7ff | text |
| `--primary`, `--accent` | #2f6bf2 (light theme #1e4fcc) | brand blue |
| `--primary-foreground` | #ffffff | text on blue |
| `--border`, `--glass-border`, `--secondary` | white 9% | hairlines, secondary fills |
| `--muted-foreground` | white 62% | secondary text |
| `--glass-surface-1` / `-2` / `-3` | white 3% / white 9% / #0c1023 at 80% | glass fills |
| `--radius-md` / `-md-alt` / `-lg` / `-xl` / `-2xl` / `-full` | 12 / 14 / 16 / 20 / 24 / 999 | prototype adds `-xs` 4, `-sm-alt` 5, `-sm` 8 |
| `--space-*` | 4px scale with the 6px half step (`--space-1h`) | both |
| Display face | Bricolage Grotesque (UI/H2 19/24 Bold, UI/Body 16/22 SemiBold, logo ExtraBold) | both, as of 4 Sept |

## Stale in Figma, correct in the prototype

| Item | Figma today | Prototype and intended state | Figma change needed |
|---|---|---|---|
| Body, label and caption face | Montserrat (UI/Label 13/18 SemiBold, Label Bold, Label Small 10/14, FormInput 13) | Inter, since 2 Sept 2026 (thin Montserrat read weak on dark) | Text styles UI/Label, Label Bold, Label Small, Form text to Inter. Montserrat may remain only as a fallback name. |
| Primary CTA | Default = white fill (#f4f7ff) with dark text; Hover = glass dark; Pressed = blue | Primary buttons are brand blue with white text, radius `--radius-md` 12, min height 44, no pill shapes. Secondary = glass with hairline border, white text. | CTA component: Default fill `--primary`, text `--primary-foreground`; keep Secondary as is; retire the white Default. |
| Card fill | `--card` = neutral.800 (#0e0f18) | `--card` = #151829, lightened 20 Aug 2026 after theme review | Re-point the `card` variable to #151829. |
| Display face | Correct (Bricolage) but the app side also carried Favorit until today | Bricolage Grotesque only, caps included; Favorit retired | Remove any remaining Favorit text style; `font-family.display` and `font-family.cta` = Bricolage Grotesque. |

## In the prototype, not in Figma

Figma is no longer where new screens are drawn. The prototype is the reference for all of the following; take layout, copy and behaviour from the running app and the component files listed.

- Landing page: hero, Build, Match, Explore, Play, Connect, Get Hired chapters; phone pager; scroll cue; console-tile Play preview. `src/components/marketing/`
- Home: feature carousel (full-bleed photo, left frost, chips, timing segments), Continue Learning & Playing rail, Your Next Moves, Explore Recommended. `src/components/app/HomeExperience.tsx`
- Explore: For You reel with video cards; Browse rails including Videos Inside Leading Companies. `src/components/app/ExploreExperience.tsx`, `CompanyVideoCards.tsx`
- Connect: event boards (glass surface, brand glow, ruled pattern, lockups), community cards, board view with four tabs, Professionals to Follow rail, volunteer dashboard. `src/components/connect/`
- Profile: tabbed card, Overview doorways, My Plan, Career Report, Resume coming soon. `src/components/profile/`
- Colleges: search and detail. `src/components/colleges/`
- Career detail header with progressive blur. `src/components/career/`
- Brand mark system: one-colour marks, split accent files, register in `docs/BRAND_MARKS.md`. `src/components/connect/primitives.tsx`
- Motion: confirm shimmer, spark bar, burst, gesture hint. `src/components/flow/`, `src/app/globals.css`

Figma Env Card v2 (like/dislike/save stack, white "More Info" CTA) and the Figma Home screens (star Dreamy, "Continue Where You Left Off", "Careers Picked for You") are superseded by the prototype.

## Instructions for the production app (Usman)

1. Tokens: keep the certified Figma export as the source of names and values. Apply the four changes in the "Stale in Figma" table in Figma, re-export, and the app follows. Until that export exists, treat `src/components/marketing/tokens.css` in this repo as the authority for those four values only.
2. Do not import `design-tokens/` from this repo. It is a different vocabulary. Its README says so.
3. Components and screens: implement from the prototype. Variable names in the prototype's CSS match the Figma names one to one (`--primary`, `--glass-surface-2`, `--radius-md`), so a value in the prototype maps straight onto the app's token of the same name. Where the prototype uses a literal (an rgba or a px), it is a design decision, not a token; express it with the nearest app token or a component-local value.
4. Order of trust when two sources disagree: this document, then the running prototype, then Figma. Figma is updated last because designs are no longer drawn there first.
5. Record any new token-level decision in `docs/TOKEN_DECISIONS.md` so it reaches Figma and the export.

## For an agent reading this repo

- Read this file, `docs/TOKEN_DECISIONS.md` and `docs/BRAND_MARKS.md` before proposing an import.
- Take design decisions (layout, copy, behaviour, motion) from `src/`. Take token names from Figma. Never copy `design-tokens/*.json` or `src/app/design-tokens.generated.css` into the production app.
- The prototype's runtime tokens are in `src/components/marketing/tokens.css` (dark and light blocks). Those names are the shared vocabulary.
