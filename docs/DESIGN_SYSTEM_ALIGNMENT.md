# Design system alignment: Figma v2.0, this prototype, the production app

Last checked 4 September 2026. Figma file: "Dreamari Design System v2.0" (sV90J9zEKarhCYJMQKbYxx). Production app: dreamonna, tokens in `packages/ui/tokens`, imported from the certified Figma export.

## State today

Figma and this prototype agree. On 4 September the Figma file was corrected so that its text styles and CTA match what the product ships. The production app is one export behind.

| Layer | Source of truth | Status |
|---|---|---|
| Token names and values | Figma variables, exported to the app | Figma corrected 4 Sept. App needs a fresh export. |
| Text styles | Figma text styles | Corrected 4 Sept (see below). App needs a fresh export. |
| Components and screens | This prototype (`src/`) | Figma is not kept current for screens. Build from the prototype. |
| Brand marks | `docs/BRAND_MARKS.md` and `src/components/connect/primitives.tsx` | Cleared for demo use; licences before launch. |

## What the app gets from the next Figma export

Nothing in the export needs hand editing. Import it as usual and these land:

- Body, label, caption and nav text styles in Inter (Semi Bold, Bold, Regular, Black as before). Montserrat is gone from every UI style.
- Section Heading, Display Stat and Stat Large in Bricolage Grotesque. Display, H1, H2, Body and the logo were already Bricolage.
- CTA Default and Disabled variants filled with `primary` and text in `primary-foreground`. The white default button is retired. Secondary is unchanged: glass fill, hairline border, white text.
- `card` is #151829 in dark and neutral/100 (#d8dbe8) in light. It was already set; confirm it survives the export.

## Shared vocabulary

Figma, the prototype's runtime CSS and the app use the same flat names. A value in the prototype maps straight onto the app token of the same name.

| Name | Value (dark) | Value (light) |
|---|---|---|
| `--background` | #05070f | #f4f7ff |
| `--foreground` | #f4f7ff | #05070f |
| `--card` | #151829 | #d8dbe8 |
| `--primary`, `--accent` | #2f6bf2 | #1e4fcc |
| `--primary-foreground` | #ffffff | #ffffff |
| `--border`, `--glass-border`, `--secondary` | white 9% | black 9% |
| `--muted-foreground` | white 62% | #4a4f6d |
| `--glass-surface-1` / `-2` / `-3` | white 3% / white 9% / #0c1023 80% | black 3% / black 9% / #050814 40% |
| `--radius-xs` / `-sm-alt` / `-sm` / `-md` / `-md-alt` / `-lg` / `-xl` / `-2xl` / `-full` | 4 / 5 / 8 / 12 / 14 / 16 / 20 / 24 / 999 | same |
| `--space-*` | 4px scale with `--space-1h` = 6 | same |
| Display face | Bricolage Grotesque | same |
| Body face | Inter | same |

The prototype's copy of these values is `src/components/marketing/tokens.css`.

## What lives only in the prototype

Figma is no longer where screens are drawn first. Take layout, copy, behaviour and motion for these from the running app and the files named.

- Landing page and its chapters, the phone pager and scroll cue, the Play console tile: `src/components/marketing/`
- Home: feature carousel, Continue Learning & Playing rail, Your Next Moves: `src/components/app/HomeExperience.tsx`
- Explore: For You reel with video cards, Browse rails, Videos Inside Leading Companies: `src/components/app/ExploreExperience.tsx`, `CompanyVideoCards.tsx`
- Connect: event boards, community cards, board view, Professionals to Follow, volunteer dashboard: `src/components/connect/`
- Profile: tabbed card, Overview, My Plan, Career Report, Resume: `src/components/profile/`
- Colleges search and detail: `src/components/colleges/`
- Career detail header: `src/components/career/`
- Motion: confirm shimmer, spark bar, burst, gesture hint: `src/components/flow/`, `src/app/globals.css`

Figma's Home screens and Env Card v2 are older than the prototype and are superseded.

## Instructions for the production app

1. Re-export tokens and text styles from Figma v2.0 and import them the normal way. That brings Inter, the Bricolage headings, the blue CTA default and the card fill into the app. Do not hand edit the token JSON.
2. Do not import `design-tokens/` from this repo. It is a prototype-only experiment with different names. Its README says so.
3. Build screens and components from the prototype. Where the prototype uses a token name, use the app token of the same name. Where it uses a literal, that is a component-level design decision; express it with the nearest app token or a local value, and do not create a new token for it.
4. If the prototype and Figma disagree on a screen, the prototype wins. If they disagree on a token value after the export, tell design; it means Figma slipped again.
5. New token-level decisions are logged in `docs/TOKEN_DECISIONS.md`. Design makes them in Figma; the app picks them up at the next export.

## For an agent reading this repo

- Read this file, `docs/TOKEN_DECISIONS.md` and `docs/BRAND_MARKS.md` before proposing an import.
- Take design decisions from `src/`. Take token names and values from the Figma export. Never copy `design-tokens/*.json` or `src/app/design-tokens.generated.css` into the production app.
- The prototype's runtime tokens are in `src/components/marketing/tokens.css`. Those names are the shared vocabulary.
