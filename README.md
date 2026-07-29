# Dreamari — Hero Section

Dev handoff build of the hero/landing section from Figma
([Dreamari_UIKIT, node 211:619](https://www.figma.com/design/d8j3JbtVojSgVOqsjGpcZM/Dreamari_UIKIT?node-id=211-619)).

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
    ui/
      Button.tsx        Shared button primitive (variants: nav, cta-solid, cta-outline)
  lib/
    navigation.ts       Nav link data (labels/hrefs — wire up real routes here)
public/
  images/
    dreamari-logo.svg
    hero-cloud-mascot.png
```

Each component is a single-responsibility, independently reusable unit — compose them differently on other pages as needed (e.g. reuse `Navbar` and `Button` elsewhere without pulling in the hero).

## Design tokens

All brand colors and gradients live as CSS custom properties in `src/app/globals.css`, registered in Tailwind's `@theme` block so they're usable as regular utility classes (`bg-brand-500`, `text-ink-200`, `from-brand-400`, etc.) instead of one-off hex values scattered through components.

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
