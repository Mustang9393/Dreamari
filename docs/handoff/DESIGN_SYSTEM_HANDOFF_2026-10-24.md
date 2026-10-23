# Dreamari design system: handoff for Usman

24 October 2026. Black & Blue, dark and light. Prepared from the prototype at branch `design-system-refresh` (cut from `origin/main` at `2ad2476f`).

## In one paragraph

The app's look is **Black & Blue**, the default since 19 October 2026. Dark mode is **Dusk**: a navy sky that gets brighter toward the bottom, navy cards, and a soft periwinkle blue for actions with dark text on it. Light mode is a cool white page, solid white cards, navy text and a deeper cobalt blue for actions with white text on it. One blue hue runs through both. There is no purple, teal or pink in the UI any more. The prototype's token files now hold exactly these values, checked against the running app. Every reusable component, with its states, is in the component library at `/component-lab`, which now shows Black & Blue only. The older Classic look is archived and is not to be built.

## What to read, in order

1. This file.
2. `docs/DESIGN_SYSTEM_ALIGNMENT.md`: the one-table version of the colours, and how the layers relate.
3. `docs/TOKEN_DECISIONS.md`: every token-level decision with the reason behind it.
4. `/component-lab` in the running prototype (hamburger menu, Component library): every component and its states.
5. `docs/COMPONENT_STATES_PLAYBOOK.md`: the default for empty, loading, error and edge-case states.
6. `docs/CROSS_BROWSER_GUARDRAILS.md`: most students are on Windows laptops and Chromebooks; read before layout or scrolling work.

## How to use the token files

- `design-tokens/` holds five W3C DTCG files: primitives (light, dark), semantics (light, dark) and components. Light and dark have identical paths, so a component never renames between modes.
- **Your entry point is `color.ui.*`** in `semantic.light.tokens.json` and `semantic.dark.tokens.json`. It is the flat vocabulary the app paints with, under the same shadcn role names your app already uses (`background`, `foreground`, `card`, `primary`, `primary-foreground`, `muted-foreground`, `border` and so on). Each token's description names its runtime CSS variable.
- **Copy values, not files.** Production tokens stay in `packages/ui/tokens` with your names. Map each of your tokens to the `color.ui` token of the same name. Do not import the JSON or the generated CSS.
- Primitives behind the semantics: `color.brand.*` (the blue ramp), `color.dusk.*` (every dark value), `color.day.*` (every light value), `color.status.*`, `color.world.*`. Semantics alias primitives; nothing in a semantic file is a raw value.
- `npm run tokens:check` validates structure, aliases, mode parity and contrast, and fails if the generated CSS is stale. It now checks every text pair below at 4.5:1 or better in both modes, composited over the page for translucent colours.
- Ignore `design-tokens/archive/` and `src/app/archive/`. They hold the archived Classic look.

## Colour

### The theme, both modes

| Token | Dark (Dusk) | Light | Use |
|---|---|---|---|
| `background` | #131f36 | #f3f6f9 | Page |
| `foreground` | #f4f7ff | #101a26 | Body text |
| `card` | #13213a | #ffffff | Card fill |
| `surface` | #142338 | #ffffff | Sheets, rails |
| `muted` | rgba(21, 36, 60, 0.94) | rgba(29, 37, 57, 0.035) | Quiet fills |
| `muted-foreground` | white 82% | #434c58 | Secondary text |
| `border` | rgba(148, 194, 249, 0.14) | #d5dde7 | Card and divider edges |
| `primary`, `accent` | #8fb3f5 | #2f5fb1 | Buttons, selected tabs, progress |
| `primary-hover` | #a3c1f7 | #284f93 | Primary on hover and press |
| `primary-foreground` | #0b1a33 | #ffffff | Text and icons on a primary fill |
| `secondary` | rgba(30, 48, 78, 0.95) | rgba(29, 37, 57, 0.08) | Secondary fills |
| `secondary-foreground` | #f4f7ff | #1d2539 | Text on secondary |
| `accent-subtle` | #cbe0fb | #24508f | Links and brand-blue words |
| `destructive` | #ff9592 | #ce2c31 | Destructive text and icons |
| `glass-surface-1` | rgba(21, 36, 60, 0.94) | #ffffff | Glass rung 1 |
| `glass-surface-2` | rgba(30, 48, 78, 0.95) | #ffffff | Glass rung 2 |
| `glass-surface-3` | rgba(16, 28, 48, 0.96) | #ffffff | Glass rung 3 (deepest overlay) |
| `glass-border` | rgba(148, 194, 249, 0.14) | rgba(16, 42, 80, 0.12) | Hairline on glass |
| `inset-surface` | rgba(34, 53, 85, 0.94) | #f3f6f9 | Inputs, nested wells |
| `inset-border` | white 14% | rgba(16, 42, 80, 0.10) | Edge of a well |
| `scrim-base` | #131f36 | #f4f7ff | Solid end of a photo scrim |
| `scrim-ink` | #ffffff | #1d2539 | Title on a photo scrim |
| `scrim-ink-soft` | white 82% | #2f384c | Secondary text on a photo scrim |

### Contrast (checked by `tokens:check`)

| Pair | Dark | Light |
|---|---|---|
| foreground on background | 15.3:1 | 16.2:1 |
| muted-foreground on background | 11.4:1 | 8.0:1 (AAA) |
| muted-foreground on card | 11.2:1 | 8.7:1 |
| accent-subtle (links) on background | 12.2:1 | 7.4:1 (AAA) |
| primary-foreground on primary | 8.2:1 | 6.2:1 |
| primary against background (non-text, 3:1 needed) | 7.8:1 | 5.7:1 |
| scrim-ink on scrim-base | 16.4:1 | 14.2:1 |

### Colour rules

- **Never put white text on a primary fill.** Use `primary-foreground`. In dark mode the primary is light (periwinkle), and white on it is 2.1:1. This is the one mistake the new palette makes easy; the component library had it in nine places and they are now fixed.
- **Links and brand words use `accent-subtle`, never `primary`.** `primary` is a fill colour. In light mode `#2f5fb1` as text passes AA but not AAA; `#24508f` passes both.
- **Dark surfaces are nearly opaque (94 to 96%).** The dark backdrop has stars; at the old 3 to 9% white tints they showed through cards behind text. Do not swap in a translucent tint or add `backdrop-filter` to a panel that stays on screen (it costs a recomposite every frame on Chromebooks).
- **Each surface rung is lighter than the one under it**, so stacked cards still lift: page, then card, then glass 1, glass 2, raised.
- **Light-mode glass is solid white.** Translucent white over the tinted page read grey-lavender.
- **One status palette app-wide**, each status as ink, solid and subtle (`color.status.*`, `color.feedback.*`):

| Status | Ink, dark | Ink, light | Solid |
|---|---|---|---|
| Success | #3dd68c | #18794e | #30a46c |
| Warning | #ffca16 | #ab6400 | #ffc53d |
| Danger | #ff9592 | #ce2c31 | #e5484d |
| Info | #70b8ff | #0d74ce | #0090ff |

- **The 15 career-world colours are identity, not theme** (`color.world.*`, same in both modes). They tag a career's world in Explore, Career, Match and Play. Game worlds (Glossary Games, Play backdrops, simulations) keep their own palettes and are not part of this theme.

### The blue ramp (`color.brand.*`, hue 213)

100 #e2eefd, 200 #bcd8fb, 300 #94c2f9, 400 #59a0f8, 500 #2780ec, 600 #2f5fb1, 700 #284f93, 900 #0b2f5b, 950 #061c37. Rungs 300 and 400 are for light and glows, never body text on white.

### Gradients (not tokens; take them from the CSS)

DTCG has no gradient type here, so these stay in `src/app/look-v2.css` and are copied as written:

- **The dark sky** (section 6): a top-to-bottom gradient from deep navy `#111f36` through `#1e375a` toward `#4a7aab` at the horizon. Inside the app it is capped near `#3c608f` wherever text sits on it; full strength only behind the landing hero. Light falls from the horizon, never radially from above (that was what made the old dark look "underwater").
- **Poster and photo scrims**: dark `linear-gradient(180deg, rgba(9,17,32,0) 0%, rgba(9,17,32,0.55) 30%, rgba(9,17,32,0.86) 51%, #091120 100%)`; light `linear-gradient(180deg, rgba(247,249,255,0) 0%, rgba(247,249,255,0.74) 20%, rgba(247,249,255,0.94) 38%, #f7f9ff 58%)`. Light scrims are frost with navy text, not dark glass with white text (section 7).

## Type, spacing, radius

- **Faces:** Bricolage Grotesque for display (headings, big numerals, all caps); Inter for everything else. Loaded once from the root layout's Google Fonts link (`next/font/google` fails on Vercel; see the comment in `src/app/layout.tsx`).
- **Strict hierarchy:** a page heading is the biggest thing on the page, then a section heading, then a subhead, then body. Nothing is sized by how important it feels. The page title class is `PAGE_TITLE_CLASS` in `src/components/app/chrome.tsx`; the lab's Foundations section shows each level with its resolved size and weight.
- **Spacing:** a 4px-based scale: `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20, `-6` 24, `-8` 32, `-10` 40, `-12` 48, `-13` 52, `-14` 56.
- **Radius:** xs 4, sm-alt 5, sm 8, md 12, md-alt 14, lg 16, xl 20, 2xl 24, full 999. Buttons are radius 12 (md), never a pill.
- These are unchanged by Black & Blue and live in `design-tokens/primitives.*` (`dimension.*`, `fontFamily.*`, `fontWeight.*`, `typography.*`).

## How the look behaves

These are the rules that make it Black & Blue rather than "blue colours". Each is in `src/app/look-v2.css` with the reason beside it.

- **One lit action per screen.** The single most important action (welcome splash, Build's Next Step, Home's hero action, the landing CTA) carries `data-lit`: the primary fill on a small soft shadow. Every other button is flat. No glows for the sake of glows.
- **Light hooks.** A selected control filled with the primary gets a soft light beneath it (`data-fill-light`); a selected tab's underline glows faintly (`data-tab-ink`). Light stays inside or directly under the element, never a spread halo.
- **Hover follows the shape.** Card surfaces use the BorderBeam/HoverBeam ring; hover never forces a pill radius or spills outside the element.
- **Tooltips:** every icon-only control shows a tooltip on hover and focus, in the house style `.dm-tip` (a blue gradient bubble with white text). Use `IconTip` / `ToolbarButton`.
- **Motion respects reduced-motion.** Every animation in the lab has a reduced-motion path.

## The component library

`/component-lab` (hamburger menu, Component library, or the URL directly). It is the catalogue of what exists, rendered live from the real components, not pictures of them.

- **Black & Blue only.** The page always opens in Black & Blue, whatever look a browser saved; the Classic switch is hidden there. The header's sun/moon toggle flips dark and light, and every swatch re-reads its live value.
- **Foundations** shows every theme colour (now including `primary-foreground`, `surface`, `secondary-foreground`, `inset-surface`, `inset-border`), the status and world colours, type, spacing, radius, glass, the light hooks and the motion utilities.
- Sections: Foundations; Controls; Feedback and loading; Surfaces and cards; Charts; Navigation and chrome; Overlays; Game UI; Feature modules; Interactions and motion; States gallery. Each specimen names its source file, what it is for and when to use it.
- **States:** every data-backed surface renders loading, slow, error, empty, not found and offline through `src/components/app/SurfaceState.tsx`; preview any with `?state=<state>&surface=<n>` (registry: `src/lib/surfaceStates.ts`).
- Device previews (phone, tablet, desktop) and search are in the lab's header.
- **Retired components are gone, not parked.** On 24 Oct 2026 every component no live page imported was deleted, along with its library specimen: the old Glossary game engine and its Levels map and background versions, the old Play backdrops, burst and intro splash, the old Match card and line icons, the unrouted Aviation v2 lab, global search, MatchRing and the counselor v4 pieces the dashboard had replaced. If it is in the library, it ships somewhere in the app.

## Building a screen

1. Find the screen's spec in `docs/handoff/specs/` and its components in `/component-lab`.
2. Take layout, copy and behaviour from `src/`. Take colours from the theme table above through your own tokens of the same name.
3. Where the prototype uses a literal colour or size, treat it as a component-level decision: use the nearest token or a local value. Do not mint a new token.
4. Check both modes. In dark, look for white text on a primary fill and for translucent panels over the sky; in light, look for dark-glass chips on photos.
5. Empty, loading and error states follow the playbook. Anything tagged `DEMO-ONLY` in code (`grep -rn "DEMO-ONLY" src`) is scaffolding and is not built.

## Not to build

- **Classic** (the look before 19 October): archived in `design-tokens/archive/classic-2026-10-24/` and `src/app/archive/look-classic.css`. The `?look=v1` switch in the prototype is DEMO-ONLY.
- The colour-theme switch itself (`ColorThemeSwitch`, `look.ts`): DEMO-ONLY.
- Game-world palettes as theme tokens: they belong to their games.

## Open items

- **Figma is behind.** Its variables still hold the September values. Design re-points them to the theme table; until then the table and `color.ui.*` win.
- **Two colour families coexist in the prototype.** The flat names (`--background`, `--primary`, ...) are what screens use and what `color.ui` mirrors. An older `--color-*` family (`--color-text-primary`, `--color-surface-*`) is still read in a few places, and some of its values differ slightly from the flat ones (light `--color-text-primary` is #1e2a3f, `--foreground` is #101a26). Build on the flat names only; the old family will be folded in.
- **Dark feature surface.** `look-v2.css` paints `--color-surface-feature` with the pale light-mode blue (#eaf3fd) in dark mode too. The token files keep the intended deep blue for dark (`brand.950`). Nothing visible depends on it today; worth fixing in the CSS.
- **The house tooltip** (`.dm-tip`) still uses a literal gradient that starts at the old blue #2f6bf2. It reads fine in both modes; it should move to the ramp.
- **Gradients** (the sky, scrims) are CSS, not tokens. If production wants them as tokens, they need a gradient type in its pipeline.
