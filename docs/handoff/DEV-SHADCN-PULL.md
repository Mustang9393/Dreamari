# Dev pull: shadcn + Dreamari theming

Copy-paste prompt for the dev-repo agent. Everything referenced is on `main`
of Mustang9393/Dreamari (the design prototype repo).

---

Set up shadcn/ui in this app so it renders in Dreamari's visual language, using
the design prototype repo (Mustang9393/Dreamari, branch main) as the contract.
Do not invent tokens or restyle components by hand.

1. Pull these files from the prototype repo and keep them byte-identical
   (they are the shared contract; they will be re-pulled when design updates):
   - src/components/marketing/tokens.css  (certified Figma DTCG pull; every
     value carries its Figma variable path in a comment)
   - docs/handoff/shadcn-adapter.css      (completes the shadcn contract on
     top of tokens.css; the per-scope alias block at the bottom is
     load-bearing, keep it)
   - docs/handoff/COMPONENT-MAP.md        (bespoke → primitive map, install
     recipe, and the six integration gotchas — read it fully first)
   - docs/handoff/profile-figma/          (full rendered HTML of every
     /profile screen state, for building the actual screens)

2. Install shadcn exactly like the verified prototype setup:
   npx shadcn@latest init -b radix -p nova --css-variables
   npx shadcn@latest add accordion alert avatar badge button card checkbox dialog dropdown-menu input label progress radio-group select separator sheet skeleton slider switch tabs toggle-group tooltip
   After init, diff globals: if init rewrote :root --background/--foreground,
   re-declare the app's values AFTER shadcn's block. If init added a
   next/font/google import, remove it (it has broken this product's Vercel
   builds). If a legacy ui/ component collides on a case-insensitive
   filesystem, point the components.json "ui" alias at a fresh directory.

3. Wire theming, in this order: tokens.css, then shadcn-adapter.css, then
   components. Map the CSS variables into Tailwind per COMPONENT-MAP.md so
   bg-background / text-primary-foreground etc. resolve. Put the theme scope
   classes on <html>/<body>, not on an inner wrapper: Radix portals (Dialog,
   Sheet, Select, DropdownMenu, Tooltip) mount on document.body and will
   otherwise render with shadcn's default light palette. Wrap the app shell
   in TooltipProvider once.

4. Verify against the living reference: https://dreamari.vercel.app/theme-lab
   shows every primitive themed on these exact files, with a "Used in" note
   for where each appears in the product, plus the contract token board.
   Your Button/Card/Dialog/Tabs should match it in dark AND light before you
   build screens. Known open item: the adapter's --chart-1..5 are placeholders
   pending a Figma re-pull; don't build chart color logic on them yet.

5. Bespoke pieces are NOT shadcn and should be ported from the prototype
   source as-is (they only consume theme variables): Career Poster Card,
   Env Card, MatchRing, ReadinessMeter, receipt tiles, journey strip, bento
   stat tiles (gradient numerals: linear-gradient(100deg, var(--foreground)
   8%, var(--accent-subtle) 92%) clipped to text), compare bars, text scrims.

---

Scope note: the prototype's `shadcn` branch was our internal test bench for
this setup and does not need to be merged or pulled; everything the dev build
needs is on main.
