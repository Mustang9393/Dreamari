# Dreamari

Dev handoff build of sections from the Dreamari_UIKIT Figma file, extracted
frame by frame:
- Hero/landing section ([node 211:619](https://www.figma.com/design/d8j3JbtVojSgVOqsjGpcZM/Dreamari_UIKIT?node-id=211-619)) — route: `/`
- Academic journey onboarding card ([node 346:35363](https://www.figma.com/design/d8j3JbtVojSgVOqsjGpcZM/Dreamari_UIKIT?node-id=346-35363)) — route: `/onboarding`
- 11-step career onboarding flow (content from the [Desktop 01–11](https://www.figma.com/design/d8j3JbtVojSgVOqsjGpcZM/Dreamari_UIKIT?node-id=205-279) frames, restyled with the `346:35363` card language) — route: `/flow`

Next.js (App Router) + TypeScript + Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder structure

```
src/
  app/
    layout.tsx        Root layout — loads Montserrat, global metadata
    page.tsx           Renders <HeroSection />
    globals.css         Design tokens (colors, fonts) as CSS variables / Tailwind @theme
  components/
    layout/
      Navbar.tsx        Logo, nav links, "Get started free" CTA
    hero/
      HeroSection.tsx      Composes the full section: background, blobs, nav, content, illustration
      RoleToggle.tsx        Interactive Student/Teacher segmented control (client component)
      GradientBlobs.tsx     Decorative ambient background glows
      HeroIllustration.tsx  Cloud mascot image
    onboarding/
      OnboardingSection.tsx    Composes the full onboarding card screen: background, particles, progress, card
      OnboardingProgress.tsx   "BUILD 56%" progress pill
      AcademicJourneyCard.tsx  Interactive card (client component) — GPA select, subject chips, computed summary
      SubjectChip.tsx          Reusable toggle chip with selection-order badge
      OnboardingParticles.tsx  Decorative ambient glow dots
    flow/
      FlowContainer.tsx    Client component — owns step index + all answer state, renders the active step
      FlowProgress.tsx     Top "STEP X OF 11" pill + progress track
      FlowCard.tsx         Shared white rounded card shell every step renders into
      FlowButton.tsx       Full-width gold/orange gradient CTA (steps 1–8, 11)
      FlowActions.tsx      Previous/Next button pair (steps 9–10)
      Chip.tsx             Toggle chip with selection-order badge (steps 4, 5, 7)
      PathOption.tsx       Selectable icon/title/sub row, single-select (steps 2, 8)
      SelectionRow.tsx     Icon/title/sub row with a check indicator, single-select (steps 9, 10)
      RadioPillGroup.tsx   Labeled 3-option segmented pill row (step 6)
      LabeledInput.tsx     Labeled text field (step 3)
      LabeledSelect.tsx    Labeled native select with chevron (steps 3, 4)
      icons.tsx            Small inline-SVG icon set (book, briefcase, home, compass, sun/moon, …)
      types.ts             FlowState shape, initial demo answers, per-step aurora accent colors
      steps/                One component per Figma frame (WelcomeStep, ChoosePathStep, …, CongratulationsStep)
      aurora/
        AuroraBackground.tsx   Canvas dot-matrix aurora — per-step color mood + select/CTA pulse animations
        pulse.ts                dispatchAuroraPulse()/onAuroraPulse() — a tiny window-CustomEvent bus
      theme/
        ThemeProvider.tsx       Light/dark context, toggles a `.dark` class on <html>, persists to localStorage
        ThemeToggle.tsx         Fixed sun/moon button
    ui/
      Button.tsx        Shared button primitive (variants: nav, cta-solid, cta-outline)
  lib/
    navigation.ts       Nav link data (labels/hrefs — wire up real routes here)
public/
  images/
    dreamari-logo.svg
    hero-cloud-mascot.png
    chevron-down.svg
```

Each component is a single-responsibility, independently reusable unit — compose them differently on other pages as needed (e.g. reuse `Navbar` and `Button` elsewhere without pulling in the hero).

## Design tokens

Portable design decisions live in the five W3C DTCG 2025.10 files under `design-tokens/`. `npm run tokens:build` generates the CSS custom properties and TypeScript color arrays consumed by the app; `globals.css` retains only Tailwind registration, compatibility aliases, and code-owned responsive/runtime formulas. See `design-tokens/README.md` for the file convention, alias rules, validation, and the boundary between portable tokens and decorative implementation constants.

| Token | Value | Used for |
|---|---|---|
| `brand-950` → `brand-700` | `#0a1e4c` → `#143c96` | Section background radial gradient |
| `brand-600` | `#1f5ff0` | Toggle border |
| `brand-500` / `brand-400` | `#2f6bf2` / `#4a82ff` | Primary button + toggle gradients |
| `brand-300` | `#7fa8ff` | Decorative blob glow, outline button border |
| `brand-200` | `#d9e6ff` | Heading gradient end, toggle background |
| `brand-100` | `#eef4ff` | Toggle track background |
| `accent-deep` / `accent-navy` | `#0f4cd1` / `#1f418f` | CTA + toggle gradients |
| `ink-100` / `ink-200` | `#edeff3` / `#b9cbec` | Body copy / nav link text |
| `amber-600` / `amber-400` / `amber-100` | `#d97706` / `#fbbf24` / `#fef3c7` | Onboarding accent (overline text, selected chip state, progress badge bg) |
| `gold-400` / `orange-500` | `#ffcf04` / `#f37c11` | Onboarding progress fill + primary button gradient |
| `slate-900` / `slate-500` / `slate-600` | `#1e2a3f` / `#8a93a3` / `#5b6472` | Onboarding card text (headline / labels / body) |
| `surface-tertiary` / `border-subtle` | `#fafbfc` / `#f5f6f8` | Onboarding chip + summary panel surfaces |
| `navy-975` / `navy-700` | `#08205a` / `#1144c0` | Onboarding section background gradient (a slightly darker navy pair than the hero's `brand-950`/`900` — kept separate rather than forcing a mismatched reuse) |

## Fonts

- **Body/UI text — Montserrat** (400/500/600/700/800), loaded via `next/font/google` in `layout.tsx`. Matches the Figma spec exactly.
- **Display heading ("DISCOVER YOUR DREAM CAREER.") — spec'd in Figma as "Favorit Extra Bold"**, a licensed font (Colophon Foundry) that isn't available on Google Fonts and wasn't bundled with the file. It currently **falls back to Montserrat ExtraBold**, which is close but not pixel-identical (Favorit is more geometric/condensed).
  - To swap in the real font once licensed files are available: add the `.woff2` files under `public/fonts/`, load via `next/font/local` in `layout.tsx`, and point `--font-display` in `globals.css` at the new variable. The heading in `HeroSection.tsx` already uses `font-display` conceptually — just confirm the class if you add a dedicated utility.

## Notes on translating the Figma export

Figma's native code export uses absolute pixel positioning against one fixed canvas size — it's a good visual reference but not production-ready markup. This build re-implements the same visual design with real flexbox/flow layout so it's responsive (see mobile breakpoints in each component) instead of pixel-locked.

- **Decorative background blobs** (`GradientBlobs.tsx`): positions are percentage/edge-relative approximations of the Figma layout rather than exact px matches, so they hold up across viewport sizes instead of clipping oddly on resize.
- **Hero illustration crop**: the source PNG is a 2000×2000 square; Figma cropped/scaled it to a specific frame. Reimplemented with `object-cover` and a tuned `object-position` for the same visual crop responsively.
- **Duplicate toggle layer**: the Figma file contained two overlapping Student/Teacher toggle layers at slightly different positions (one bare text pair with no pill background, one fully-styled). Treated the unstyled pair as a stray Figma artifact and implemented a single interactive `RoleToggle` component.
- **Nav links and CTA buttons** point at `#` placeholder hrefs — update `src/lib/navigation.ts` and the `href` props in `HeroSection.tsx`/`Navbar.tsx` once real routes exist.

### Onboarding card (node 346:35363)

- **Decorative particles**: Figma placed ~16 individual glow-dot SVGs at fixed pixel coordinates against a 1366px canvas. Reimplemented as a data-driven list of small radial-gradient divs (`OnboardingParticles.tsx`) at percentage positions, the same pattern as `GradientBlobs.tsx` from the hero — much less code than importing 16 near-identical tiny SVGs, and it holds up on resize.
- **GPA range field**: Figma showed a static-looking dropdown field with one value. Implemented as a real `<select>` with a sensible set of GPA bands, not just a decorative box.
- **Subject selection + order badges**: the design shows two subjects pre-selected with order badges "1" and "3" (a gap at 2), and the summary panel below references a third subject ("Science") that has no corresponding chip in the visible set. Both read as inconsistencies in the design file rather than intentional — the order badges likely refer to a longer subject list than the 8 chips shown. Implemented cleanly instead: selection order is derived live from an array of selected subjects (no gaps possible), the summary panel text is fully computed from whatever's actually selected, and the initial demo state (Technology, Business) reflects that fix.
- **Progress bar percentage**: hardcoded at 56% to match the Figma snapshot — `OnboardingProgress` takes `label`/`percent` as props, so wire it to real onboarding-flow progress state.

### Career flow (`/flow`, Desktop 01–11 frames)

- **Source frames**: node IDs `205:279`, `205:332`, `205:400`, `205:471`, `205:559`, `205:633`, `205:713`, `205:784`, `205:858`, `205:939`, `205:1023` — 11 steps in sequence (numbered 01–11 in the Figma file; there's no separate "05" *number* missing, `205:559` is step 5 "Confidence Check").
- **No mascot / speech bubble** — each frame in Figma pairs a left-column mascot illustration + speech bubble with a right-column card. Per instruction, only the card content was built; the mascot column is left for a follow-up pass. The ambient background *was* later built (see "Aurora background" below), just not from Figma's mascot-panel background — it's a new canvas effect.
- **One accent color on the cards, not seven**: the Figma frames each carry their own signature accent (red for "Choose your path", orange for "About You", emerald for "Confidence Check", teal / teal-700 for "Work Style" / "Future Values", blue for the rest). Card content instead uses the single amber/gold accent already established for the onboarding card (`346:35363`) across all 11 steps, so the flow reads as one consistent product surface. Those per-step Figma accents weren't thrown away, though — they live on in the aurora background (see below).

### Aurora background + light/dark mode

A canvas-based animated "dot matrix" background sits behind every step, deliberately subtle — it's ambient texture, not a competing visual, so the card and its content stay the clear focus:

- **Per-step color mood**: each step has its own accent hex in `STEP_AURORA_ACCENTS` (`types.ts`) — reusing the exact per-frame accents from the source Figma file (red/orange/amber/emerald/teal/teal-700/blue) that the card content itself no longer uses. The background smoothly cross-fades to the new step's color over about a second and a half, rather than snapping.
- **Selection pulse**: every selectable control (`Chip`, `PathOption`, `SelectionRow`, `RadioPillGroup`, and the "Previous" button) dispatches a small, localized ripple from the click point via `dispatchAuroraPulse("select", event)` — a soft, fast (~700ms) ring.
- **CTA pulse**: `FlowButton` and the "Next"/primary button in `FlowActions` dispatch a bigger, slower (~1300ms) pulse that sweeps the *whole* canvas (both a traveling ring and a uniform brightness lift), reflecting a "you just made a real commitment" action versus a quick toggle.
- **The event bus is decoupled on purpose**: `pulse.ts` dispatches a plain `window` `CustomEvent` rather than threading a ref or context through 11 step files and a dozen shared components — any component can fire a pulse without knowing whether `AuroraBackground` is even mounted.
- **Respects `prefers-reduced-motion`**: if the user's OS requests reduced motion, the canvas renders one static frame and never starts its animation loop.
- **Light/dark mode**: `ThemeProvider` toggles a `.dark` class on `<html>` (Tailwind v4's `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css` wires that class to every `dark:` utility used across the flow), persists the choice to `localStorage`, and a tiny inline script in `layout.tsx` applies the stored/system preference *before* first paint to avoid a flash of the wrong theme. `<html>` carries `suppressHydrationWarning` because that pre-paint script is expected to make the server-rendered class list differ from the client's on first hydration — that mismatch is intentional, not a bug.
  - Light mode: pale, low-opacity dots on a near-white canvas — a soft pastel wash.
  - Dark mode: the same dot field rendered brighter and more saturated against a near-black canvas — this is where the "aurora borealis" read is strongest. Cards switch to a translucent frosted-glass panel (`dark:bg-slate-900/80` + `backdrop-blur-xl`) so the aurora shows through faintly behind the content without hurting legibility.
- **Icons are hand-built, not downloaded**: the Figma frames use ~15 simple outline icons (book, briefcase, home, compass, piggy-bank, …) from a generic icon library, each re-exported as a color-baked SVG per instance (a different file for "gray unselected" vs "white on colored circle"). Rather than pull down a dozen near-duplicate assets, they're implemented once each in `icons.tsx` using `currentColor`, so one icon definition adapts to any background.
- **Cross-step data flow**: fields answered in earlier steps feed later ones for real — the "So far" summary on the Academic Journey step reads the path chosen in step 2 and the grade level from step 3, not static demo text.
- **Navigation matches the design exactly**: steps 1–8 and 11 show only a single forward "Continue" button (no way back), while steps 9–10 show Previous/Next — that asymmetry is in the Figma file itself, not an oversight, so it's preserved as-is.
- **Step 11's "See my matches" button** restarts the demo flow (there's no matches/results page yet to route to).
