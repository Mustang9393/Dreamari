# Play SOP, chapter 5: Play hub, entry points, image rules and decision history

> Reference chapter of the Play SOP. Start at [README.md](README.md). This chapter was produced by a line-by-line read of the source at commit `2ff4bd5d` (26 Sept 2026); every `file:line` reference is against that commit, so re-check line numbers if the files have moved. Conventions: `UNCLEAR:` means the code alone does not settle it; `OBSERVED:` / `FINDING:` / `GAP:` / `BUG:` mark something a rebuild would get wrong by trusting comments or field names. All of them are collected, with a recommended decision, in [06-known-issues-and-decisions.md](06-known-issues-and-decisions.md).

All `file:line` refs are against that snapshot. `UNCLEAR:` = not determinable from code/docs. `GAP:` = something a new career needs that nothing defines.

Sources read in full: `src/components/play/PlayHub.tsx` (1000 lines), `PlayBackdrop.tsx`, `PlayBackdropV2Crt.tsx`, `PlayBackdropV3Dots.tsx`, `PlayBackdropV4Synthwave.tsx`, `PlayVersionChip.tsx`, `games.ts`, `art-ratios.ts`, `expressions.ts`, `locations.ts` (non-mapping parts), `backdropPulse.ts`, `progress.ts`, `TrailerFlow.tsx` (key parts), `docs/handoff/specs/play.md`, `docs/handoff/sprite-master-prompt.md`, `docs/handoff/background-space-extraction.md`, `docs/handoff/specs/progression-system.md`, `docs/season-art-prompts.json`, `docs/HANDOFF_INDEX.md`, `docs/handoff/README-FOR-USMAN.md`, every Play/glossary/sprite/backdrop/trailer entry of `docs/AI_HANDOFF.md`, relevant commit messages (`git log -- src/components/play/PlayHub.tsx games.ts`), plus the out-of-repo Codex art folder `~/Documents/Dreamari/Play tab/` (README + `prompts-and-crops.json`), which AI_HANDOFF (21 Sept) names as the real source of Play card art.

---

## 0. TL;DR for Usman

- The hub is data-driven from four hand-maintained arrays in `src/components/play/games.ts`: `SIMULATIONS` (playable, :67), `SOON` (placeholders, :76-88), `FEATURED_ROW_SOON_IDS` (which placeholders ride in row 1, :93), `GLOSSARY_GAMES` (:119-131). Adding a career = add a `Simulation` object + push to `SIMULATIONS`; everything on the hub (card, trailer chip, Express chip, progress strip, Top-3 ordering) derives from it.
- Three rows (Career Simulations, Glossary Games, In the works) + a dismissible Explore bridge banner. Each row is a "TV row": compact at rest, morphs into one 16:9 hero + narrow 210:297 side cards when it is the focused row (scroll-centred, mouse hover overrides). Phones (<640px) get a swipeable card stack per row instead.
- Images come from 5 families: card covers (hub/Home), trailer plates (reused scene art), hero scene illustrations (per beat, sticky 3 beats), location plates (per beat fallback, character-free), expression sprites (transparent cutouts) + face chips (dialogue portraits). Only the sprite family has a written generation prompt in the repo (`docs/handoff/sprite-master-prompt.md`). The card-cover prompt template exists only outside the repo (`~/Documents/Dreamari/Play tab/prompts-and-crops.json`). There is NO location/background or hero-scene prompt anywhere. GAP.
- Standing rules that affect every new career: never show "coming soon" on a Play CTA in the demo (hide the button or route to `/play?focus=`); trailer never auto-plays (only the "Watch trailer" chip); Play hub uses the normal `AppBackdrop`, only in-game glossary screens use `PlayBackdrop`; no real trademarks in art; covers for Play placeholders must be their own `soon-*.png` files, never overwrite shared `poster-*.png`.

---

## 1. The Play hub (`/play`)

### 1.1 Route and shell

- Route file: `src/app/play/page.tsx:12-24`. Metadata title "Play · Dreamari", description "Career simulations. Do the job for an hour before you spend four years on it." (:7-10). `PlayHub` is wrapped in `<Suspense>` (:19-21) because it reads `?focus=` via `useSearchParams()`; without Suspense the production build fails (play.md:34, page.tsx:17-18). Google Fonts preconnect links (:15-16).
- Imports tokens (`@/components/marketing/tokens.css`) and `@/components/app/app.css` (:4-5).
- Root wrapper: `PlayHub.tsx:134-142`: `marketing-v2 themeable relative min-h-dvh w-full overflow-x-clip`, background transparent, color `var(--foreground)`, font `var(--font-body)`, `overflowX: clip`.
- Backdrop: `<AppBackdrop />` (:149), the SAME backdrop every other tab uses. Not `PlayBackdrop`. Comment :143-148 quotes the decision (21 Sept 2026): "Dont change the background of the PLAY TAB. Use the same background as other tabs. ONLY CHANGE THE BACKGROUND OF THE IN GAME BACKGROUND".
- Welcome splash: `<FirstVisitSplash surface="play" onOpenChange={(open) => setSplashSettled(!open)} />` (:150). Scene config `src/components/app/WelcomeSplash.tsx:103-109`: sprite `/images/dreamy/v2/splash/dreamy-controller.webp` (`wide: true`), tint `["255, 160, 30", "180, 40, 240"]`, title "PLAY", line "Choose a career. Step into the job and see where your decisions take you.", CTA "Start playing". `DEMO_ALWAYS_SHOW_SPLASH = true` (`WelcomeSplash.tsx:242`) makes it show once per session instead of once ever (HANDOFF_INDEX demo flags table).
- Chrome: `DesktopNavigation active="Play"` (:152), `MobileHeaderShell` with `Wordmark` + `HeaderActions` > `QuickLinksMenu` (:154-157), `MobileNav active="Play"` (:230).
- `<main>` (:163): `seq-reveal relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-5 pt-3 pb-[120px] sm:px-[var(--space-14)] md:pt-8`. `seq-reveal` staggers direct children in (`app.css:138-149`: `fade-slide-up 0.32s cubic-bezier(0.16,1,0.3,1)`, delays 0.03s, 0.08s, ... +0.05s per child up to 8). `gap-[22px]` + h1 `mb-[2px]` + `pt-3 / md:pt-8` is the shared "title page" rhythm (22 Sept 2026, see comment :159-162).
- Title: `<h1 className={PAGE_TITLE_CLASS + " mb-[2px]"} style={PAGE_TITLE_STYLE}>Play</h1>` (:164-166). `PAGE_TITLE_CLASS = "text-[32px] leading-[1.05] font-extrabold uppercase sm:text-[44px]"`, style `fontFamily: var(--font-display)` (`chrome.tsx:32-33`). Uppercase via class, not string, so the accessible name stays natural-cased (AI_HANDOFF 24 Aug, Joshua).

### 1.2 Section order (top to bottom)

`PLAY_ROW_IDS = ["simulations", "glossary", "soon"]` (:30) is both the visual order and the default active row.

1. **Career Simulations** (`FeaturedRow`, :168-175). Row id `simulations`.
2. **Glossary Games** (`HeroShelfRow rowId="glossary"`, :186-205). Only rendered if `GLOSSARY_GAMES.length > 0`.
3. **Explore bridge banner** (`NextStepBanner`, :212-219). Not a row, sits outside the row-focus system, always at rest.
4. **In the works** (`HeroShelfRow rowId="soon"`, :221-227).

Why this order: bridge after Glossary Games "so it closes the page instead of interrupting it" (Joshua Pierce, Slack, 6 Sept 2026; play.md:6; PlayHub :206-211). Note: code order is Sims, Glossary, Banner, In the works, so the banner does not literally close the page; it sits between Glossary Games and In the works. play.md:6 lists the same order. UNCLEAR whether "closes the page" was meant loosely.

### 1.3 Ordering rules

- **Top 3 first**: `picks` from `useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot)` (:79, source `src/lib/picks.ts`, localStorage `dreamari-picks`). `mine` = `picks.ids` mapped to `SIMULATIONS` by `careerId`, in the student's own order; `rest` = every other simulation in `SIMULATIONS` order (:88-93). Row 1 candidates = `[...mine, ...rest]` sims, then `featuredRowSoon` placeholders (:169-170, :307-313).
- **Row-1 placeholders**: `featuredRowSoon = SOON.filter(id in FEATURED_ROW_SOON_IDS)` (:103), in `SOON` array order (Accountant, Aviation Maintenance Technician, Emergency Medicine Doctor). NOT re-ordered by Top 3.
- **In the works ordering**: SOON entries the student picked first, then the rest; then filtered to drop any career that is live in `SIMULATIONS` and any id in `FEATURED_ROW_SOON_IDS` (:95-101), so nothing shows twice. Current result: Airline Pilot, Software Engineer, Private Equity, Food Scientist (Top-3 picks float up).
- **Glossary Games ordering**: `GLOSSARY_GAMES` array order, no Top-3 reordering (:192-203). Current: Finance Terms, Medical Terms, Flight Terms, Tech Terms.
- **Default featured (hero) card** in row 1: `?focus=<id>` if it matches a candidate id (sim `id` or soon `careerId`), else `candidates[0]` (:314-316). With no Top 3 that is Investment Banker (first in `SIMULATIONS`).
- **`?focus=`** (:80-85): "Prime Video/Apple TV pattern, the content page before playback (Joshua Pierce, Slack, 7 Sept 2026)". Overrides Top-3 ordering for the initial hero only; it does not reorder the rail (cards stay in place, the focused one is just wide). In the phone deck the deck is rotated so the focused card is in front (:430-434). An invalid focus falls back silently.
  - GAP: `/play?focus=<career>` for a career that has neither a simulation nor an entry in `FEATURED_ROW_SOON_IDS` (e.g. Profile Top 3's Play button for Airline Pilot, `ProfileExperience.tsx:1335`) falls back to the default hero; the student lands on Investment Banker, not their career. `HeroShelfRow` ignores `focus` entirely.
- Glossary/In-the-works default hero: `items[0]` (:863).

### 1.4 Row-focus system ("TV UX")

- `useCenteredRow(ids)` (:44-76): one `IntersectionObserver` over `[data-row-id="<id>"]` sections, `rootMargin: "-45% 0px -45% 0px"` (a 10%-tall band across the vertical centre of the viewport), `threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]`. The row with the highest intersection ratio in the band is active; ties/gaps keep the previous answer (no flicker to null). Initial state `ids[0]` (Career Simulations).
- **Mouse hover override** (:110-131): `hoveredRow` state; `activeRow = hoveredRow ?? scrollActiveRow`. Each row section gets `onMouseEnter -> setHoveredRow(id)`, `onMouseLeave -> clear only if current === id` (guards the leave-after-enter race). Why (22 Sept 2026, Josh on a large Chrome screen): "the glossary games row scales up and does its job but when he hovers back on the first row it doesnt hover or scale up." On a tall screen where everything fits, scroll never changes, so hover needed its own higher-priority signal.
- Why scroll and not hover as the base signal (21 Sept 2026, commit `b830377f`): "he wants all rows like this"; Josh meant TV remote navigation, and "hover has no equivalent on a touch device at all, so scroll position is the one signal that works identically on desktop AND mobile" (:32-43).
- Why rows morph rather than dim (21 Sept, `aaaeda4a`): "its not about brightening... it has to have the same design as the simulation row, same sized cards, one card large and hero style, the other on the row narrower, opening up to be like the selected card when tapped", and "on a tv, the other rows show normal narrow cards but when i hit the down arrow on my remote they come into view with large tile hero + narrow cards to the right that open and become the big card on clicking" (:829-835). Then "only the focused row should look like that... the other [rows] should have the same card sizes when not focused" (:295-301) extended the compact state to Career Simulations too (`e01b7f99`).
- Active row header: color transitions `duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]` from `var(--foreground)` to `var(--glossary-accent, var(--world-business-money-office))` (:328-331, :869-872). NOTE: `--glossary-accent` is never set on the hub, so the active header is always Business & Finance gold regardless of which career is featured. GAP (if per-career header accent is wanted).
- Known edge (21 Sept, AI_HANDOFF "Career Simulations now falls back to compact too"): on unusually tall viewports (1280x1100) the initial active row can resolve to Glossary Games at scroll top. Not fixed.

### 1.5 Card sizes (three tiers)

All widths explicit (not aspect-ratio classes) because the expand-in-place animation transitions `width`/`height` with CSS so contents re-lay-out each frame; framer's transform-based `layout` animation "scaled the contents and read as stretchy" (:248-251, commit `5d91d481`).

| Tier | When | Height | Width | Ratio |
|---|---|---|---|---|
| hero | row active AND this card featured | `ROW_HEIGHT` = `sm:h-[300px] md:h-[380px] lg:h-[430px]` (:247) | `FEATURED_W` = `sm:w-[533px] md:w-[676px] lg:w-[764px]` (:252) | 16:9 (Netflix billboard) |
| side | row active, card not featured | `ROW_HEIGHT` | `SIDE_W` = `sm:w-[212px] md:w-[269px] lg:w-[304px]` (:253) | 210:297 (Browse `PosterCard`) |
| compact | row at rest | `COMPACT_HEIGHT` = `h-[150px] sm:h-[170px] md:h-[195px]` (:836) | `COMPACT_W` = `w-[267px] sm:w-[302px] md:w-[347px]` (:837) | ~16:9 |
| deck (phone) | viewport < 640px | slot | `w-[calc(100%-32px)]` | 319:386 (:506) |

- Why same height: "the Netflix reference row has no card taller than its neighbors, only wider ones" (:238-246). Why 16:9 / 210:297: Netflix billboard ratio and Browse's own PosterCard ratio; "the sm side card is literally PosterCard's own 210x297" (:243-244). Why every row uses the same three constants: "same sized cards" as Career Simulations, "not a smaller lookalike" (21 Sept, :254-257).
- Tier logic: `RowCard` :629 (`large ? "hero" : active ? "side" : "compact"`); `HeroShelfCard` :923 (`deck || large ? "hero" : ...`). In deck mode the card fills its slot (`h-full w-full`, :634, :968).
- Transition (inline style because `dm-tap`'s own transition shorthand in unlayered `app.css` beats Tailwind utilities, :638-641, :976): `width 0.5s cubic-bezier(0.16,1,0.3,1), height 0.5s cubic-bezier(0.16,1,0.3,1), transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease`. Titles also `transition-[font-size] duration-500` (:677, :680).

### 1.6 Card anatomy (`RowCard`, :591-719; `HeroShelfCard`, :922-999)

Shared box: `<article data-card-id>` with `dm-tap group relative flex-none overflow-hidden rounded-[var(--radius-lg)] border text-left`, `borderColor: var(--color-glass-border-raised)`, `background: var(--glass-surface-1)` (:634-642, :970-978). Never a `<button>` itself: the hero holds a real `<Link>` overlay, so a pressable side card gets its own absolute overlay button (:701-708).

Layers, back to front:

1. **Cover** `CoverPhoto` (:578-589): `next/image fill object-cover`, `sizes` = hero `(min-width: 1024px) 764px, 90vw`; compact `(min-width: 768px) 347px, 60vw`; side `(min-width: 1024px) 304px, 45vw` (:661, :938). Always centred crop (no `object-position`). Fallback if `src` missing OR fails to load (`onError`): `BookOpen` 40px icon on `color-mix(in srgb, <world tint> 20%, var(--card))`, tint = `WORLD_COLORS[world]` or `var(--glossary-accent, var(--world-business-money-office))` (:581-586). Added 22 Sept 2026 because PlayHub never imports `PosterCard`, so the app-wide `PosterPhoto` fallback did not reach it (:568-577).
2. **"Coming soon" pill** (placeholders, non-hero tiers only) (:662-667, :939-944): `absolute top-[8px] left-[8px] z-[1] rounded-full px-[8px] py-[3px] text-[11px] font-bold`, bg `var(--glass-surface-2)`, text `var(--foreground)`; compact tier adds a 12px `Lock` icon + `gap-[5px]`. Placeholder art stays full color: "color but just not pressable" (direct feedback, :564-566).
3. **Bottom scrim block** (:673, :945): `absolute inset-x-0 bottom-0 flex flex-col`, `backgroundImage: var(--poster-scrim)`. RowCard padding `px-[14px] pt-[32px] pb-[14px] sm:px-[16px]`, gap 4px; right padding keeps the corner badge clear: hero `pr-[80px] sm:pr-[96px] md:pr-[108px]`, else `pr-[64px] md:pr-[72px]`. HeroShelfCard: `gap-[1px] px-[12px] pt-[26px] pb-[10px] sm:gap-[4px] sm:px-[14px] sm:pt-[32px] sm:pb-[14px]` + same pr scheme at sm+. Everything left-aligned (reference carousel, 10 Sept 2026, :630-632).
   - **Series eyebrow** (sims only): "Day in the Life" (:676), world-label size, semibold, tracking 0.6px, uppercase, `var(--poster-title)` at 0.75 opacity. Why: "so Home, Play and the game itself all say 'Day in the Life: <career>' (CEO, 4 Sept)" (:674-675).
   - **Title** (:677-679, :946-948): `leading-[1.15] font-extrabold uppercase [overflow-wrap:normal] [word-break:keep-all]`, color `var(--poster-title)`, font `posterTitleFont(world)` (world's poster face, `src/components/app/worlds.ts:51-83`; HeroShelfCard falls back to `var(--font-display)` if no world). Text passed through `breakable()` (inserts U+200B after every hyphen, :271-273). Size by tier and `hasLongWord` (any word >= 10 chars, :265-267):
     - hero normal `text-[26px] sm:text-[34px] md:text-[42px] lg:text-[46px]`; hero long-word `text-[21px] sm:text-[27px] md:text-[33px] lg:text-[37px]`
     - side normal `text-[26px] sm:text-[24px] md:text-[30px] lg:text-[34px]`; side long-word `text-[21px] sm:text-[19px] md:text-[24px] lg:text-[27px]`
     - compact `text-[14px] leading-[18px] sm:text-[16px] sm:leading-[20px]`
     - Why: same two-tier rule as Browse's PosterCard (24px standard, 19px compact when a 10+ char word would clip), scaled per breakpoint; sm side card = PosterCard 210x297 with ~8%-of-height ratio (:261-264, :643-646).
   - **Second line**: world label in the world's accent color, never the title (:668-670, :680-682): `font-semibold tracking-[0.6px] uppercase`, sizes hero `text-[11px] sm:text-[13px] md:text-[15px]`, side `text-[11px] sm:text-[10px] md:text-[13px] lg:text-[14px]`, compact `text-[10.5px] sm:text-[11.5px]`. Glossary cards show their `sub` line instead ("Learn key finance terms", color `var(--muted-foreground)`, :949-953) and also their world if resolvable (:954-958). HeroItem comment says "never both at once" (:824-826) but Glossary items get BOTH `sub` and `world` (:197-199), so both render. UNCLEAR which is intended.
   - **Hero placeholder**: plain text "Coming soon", `mt-[4px] text-[13px] font-bold sm:text-[14px]`, `var(--foreground)` (:683-689, :959-963). "plain text: the lock sits in the corner badge instead (direct feedback, 10 Sept 2026)".
   - **Hero simulation meta** `FeaturedMeta` (:745-766): "Level {n} · {role}" (12/15px, sm 14/18px, bold, `var(--poster-title)` 0.85). With a resumable save: "Level 1 · Intern · NN% done" + `SparkBar` (`height 5`, track `color-mix(in srgb, var(--poster-title) 25%, transparent)`, fill/glow `var(--primary)`, `max-w-[300px]`). Why poster-title color: stays legible over the theme-aware scrim in both themes (:753-755).
4. **Corner badge** `CornerBadge` (:726-738), on every card: play glyph (filled `Play`, `ml-[3px]`) for a real sim / a playable glossary game, `Lock` for a placeholder. `pointer-events-none absolute right-[14px] bottom-[14px] sm:right-[16px] sm:bottom-[16px] z-[2] rounded-full border backdrop-blur-[6px]`, bg `rgba(0,0,0,0.45)`, border `rgba(255,255,255,0.4)`, glyph white. Size hero `size-[52px] sm:size-[64px] md:size-[72px]` (glyph 22/26/30px), else `size-[44px] md:size-[52px]` (glyph 18/22px). Hover: `group-hover:scale-110`, `transition-[transform,opacity] duration-300`. `faded` (deck cards behind the front one) -> `opacity-0`. aria-hidden, purely visual. Why: "include the play button on registered nurse too ... show the locked icon for the rest" (10 Sept 2026, :692-695); bottom-right is where the reference carousel puts its play control.
5. **Hero sim interaction layer** `FeaturedPlayOverlay` (:775-816):
   - Whole-card `<Link href="/play/{sim.id}">` (`absolute inset-0 z-10`), sr-only label "Continue {title} · Level 1" when resumable, else "Play {title} · Level 1" (:782-784). No CTA button anywhere: "a playable featured card is one whole-card link" with "saved progress as a thin strip along the bottom edge (Netflix's partially-watched idiom)" (:344-349, :557-563).
   - Top-right chip cluster (`absolute top-[10px] right-[10px] z-20 gap-[6px]`, fades with `faded`, :785):
     - **Express mode** chip, only if `sim.levels[0].expressCut?.length > 0` (:789-798): `<Link href="/play/{id}?mode=express">`, `Zap` 13px, label "Express mode".
     - **Watch trailer** chip, only if `sim.trailer` and handler (:799-812): button opens `TrailerFlow`. Label must be the full verb phrase: "a chip reading just 'Trailer' made the whole featured card sound like it WAS a trailer rather than the game" (:800-802).
     - Chip style (both): `dm-quiet min-h-[34px] rounded-[var(--radius-md)] border px-[13px] text-[11.5px] font-semibold backdrop-blur-[8px]`, bg `rgba(0,0,0,0.6)`, border `rgba(255,255,255,0.35)`, white text.
   - Trailer is deliberately separate from starting the game, "overriding the doc's play-once-on-first-open rule" (:317-319, :771-774).
6. **Select overlay** (non-hero cards): RowCard renders `<button class="absolute inset-0 z-10">` with sr-only "Feature {title}" only for `kind === "sim"` (:712-716). HeroShelfCard renders it for every non-hero card incl. locked ones (:992-996); its hero only links when `item.href` exists (locked hero is inert, :987-991).

### 1.7 Selection / click behaviour

- Rail click on a non-hero card: `setFeaturedId(id)`; if the row is not active, also `sectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" })` so the observer brings the row into focus (:379-382, :898-901). Condition is `!active || id !== featured.id` (every compact card clickable, including the already-featured one). Why (21 Sept, `6420063e`): with the old `active && id !== featured.id`, a scrolled-away row's featured card had neither the select button nor the hero Link: "when i hover [scroll] to go back to Day in the Life of Investment Banker, the career simulations stay small."
- History of this rule: the same day it had been `active && ...` to fix "the first tile should be big not the second, not unless I click on the second card" (a stop-scroll tap on a compact card silently promoted it, `68464991`). The later fix re-allowed compact taps but made them scroll the row into focus, which resolves both.
- Expand in place: cards keep their rail positions; the clicked one grows into the billboard while the old one shrinks. "reordering the row on every click read as a shuffle, not a selection" (:356-359, commit `c0ec971a`). One persistent keyed `<article>` per candidate (an earlier two-element `layoutId` version froze the incoming card at opacity 0, :701-706).
- Row-1 placeholders are NOT selectable in the rail (RowCard's button requires `kind === "sim"`), and a compact placeholder in row 1 cannot bring the row into focus by tap. Glossary/In-the-works locked cards ARE selectable (they become a non-clickable hero). GAP/inconsistency: decide one rule.
- Hover on desktop: `dm-tap` (app.css:183-201, inside `@media (hover: hover)` since 26 Sept) lifts `translateY(-1px)`, `box-shadow: 0 6px 16px -12px rgb(0 0 0 / 0.85)`, border `color-mix(in srgb, var(--accent-subtle) 50%, var(--glass-border))`; `:active` resets. Focus ring: `outline: 2px solid var(--accent-subtle); outline-offset: 2px` (app.css:277-283). Hover never promotes a side card to hero (click/tap only): recommended 21 Sept "consistent with Career Simulations' own RowCard ... and the user's own earlier explicit feedback rejecting a pure-hover expand for this exact row" (open design question, not decided).

### 1.8 Rails (sm and up)

`dreamari-card-rail hidden items-start gap-[var(--space-3)] overflow-x-auto pt-1 pb-3 sm:flex md:-mx-[var(--space-14)] md:px-[var(--space-14)] lg:mx-[calc(50%-50vw)] lg:px-[calc(50vw-50%)]` (:360, :882).
- Full-bleed: negative margins so "the next card is always visibly PEEKING at the screen edge instead of clipping exactly at the content column" (:350-355; 31 Aug + 4 Sept `c41bd922`). From lg the bleed is computed against the viewport (`50% - 50vw`); root wrapper `overflow-x: clip` hides the scrollbar-width overhang. The comment says "main is capped at 1200px" but main is `max-w-[1440px]` now (stale comment).
- `pt-1 pb-3` on every `overflow-x-auto` rail so the hover lift/shadow is not sliced (2 Sept app-wide rule; memory "rails need pb-3").
- `.dreamari-card-rail` (globals.css:197-206, :222-224): smooth scroll, `overscroll-behavior-inline: contain`, `touch-action: pan-x pan-y`, scrollbar hidden in Firefox (`scrollbar-width: none`) AND WebKit (`::-webkit-scrollbar { display: none }`); reduced motion -> `scroll-behavior: auto`. Cross-browser: both hide rules are required (Windows Chrome showed chunky scrollbars otherwise; `docs/CROSS_BROWSER_GUARDRAILS.md`).

### 1.9 Phone card stack (`CardDeck<T>`, :391-555)

Every row uses it below `sm` (640px); the rail is `hidden sm:flex`. Why: CEO's JioHotstar "For You" recording (10 Sept 2026) for Career Simulations; generalised to every row 21 Sept after "its messed up lets use the same style for the hero row for the rest" (:404-417, `e6b3d5bb`).
- Geometry measured off the recording (1180px frame / 3.147): `DECK_STEP_X = 16` px right per depth, `DECK_STEP_SCALE = 0.06` smaller per depth, scaled about the right edge (`originX: 1, originY: 0.5`), `DECK_VISIBLE = 3`; deeper cards park invisible at slot 3 (:391-398, :514-518). Sizer: `w-[calc(100%-32px)]`, `aspectRatio: "319 / 386"` (:506).
- Motion: `DECK_SPRING = { type: "spring", stiffness: 300, damping: 32, mass: 0.9 }` (:399). Front card only: `drag="x"`, `dragDirectionLock`, `dragSnapToOrigin`, `dragMomentum={false}`, `dragElastic={1}`, `touchAction: "pan-y"` (:524-536). Swipe left if `offset.x < -72` or `velocity.x < -550` (`SWIPE_DISTANCE`, `SWIPE_VELOCITY`, :401-402, :545) -> front card flies to `x = -(width + 60)` then the deck rotates (front rejoins at back). Swipe right -> previous card re-enters from the left (`x: [-offscreen, 0]`, :519, :546).
- A drag never falls through as a tap: `onClickCapture` cancels the click while `dragged` is set (:497-502).
- Idle hint (Career Simulations only, `hintReady` passed): once the splash closes, after `DECK_HINT_DELAY_MS = 2400` ms with no pointerdown the deck advances one card once. Skipped under `prefers-reduced-motion: reduce` and at `min-width: 640px` (:476-487). Any `pointerdown` cancels (:493-495).
- Cards behind the front get `front={false}`: corner badge and chips fade to 0 so they do not peek past the front card's edge (:607-613).
- In deck mode every card renders at hero tier (RowCard is passed `large`, :342; HeroShelfCard `deck`). There is no compact tier on phones.
- Known tool limitation: the swipe gesture itself was not verified by the browser tool; "Worth a real on-device swipe check" (21 Sept).

### 1.10 States

| State | Where | Treatment |
|---|---|---|
| Playable simulation | row 1 | Full color cover, "Day in the Life" eyebrow, play corner badge; hero = whole-card link + Express/Trailer chips + "Level 1 · Intern" |
| In progress (resumable) | row 1 hero only | `run.index > 0 && run.index < first.beats.length` (:749, :779): "Level 1 · Intern · NN% done" + SparkBar; sr-only "Continue..." |
| Placeholder ("In the works"/row-1 soon) | row 1, In the works | Full color cover, lock corner badge, "Coming soon" pill (compact/side) or text (hero), not a link |
| Glossary playable | Glossary row | `hasGlossary(careerSlug)` true -> `href: /play/glossary/{slug}`, play badge (:193-201). Today only `investment-banking` |
| Glossary not authored | Glossary row | `locked: true`, lock badge, "Coming soon", no link. "they dont have to work or lead anywhere, theyre just dummy cards to fill the row" (9 Sept 2026, :177-185) |
| Cover missing/404 | all | `CoverPhoto` fallback (BookOpen on world tint) |
| Completed level | none | GAP: no completed state on the hub. `clearRun` runs when a level ends (`progress.ts:132-138`), so a finished Level 1 looks identical to a fresh one. Hub reads only Level 1 (`sim.levels[0]`, :747, :777) and only the Full-mode slot (Express saves go to slot `n+100`, AI_HANDOFF 31 Aug), and always links `/play/{id}` (level 1). A student on Level 2 sees "Level 1 · Intern". |
| Empty row | all | `if (!featured) return null` (:323, :866); Glossary row gated on length (:186). Per `COMPONENT_STATES_PLAYBOOK.md:37,158-166` the locked-card pattern here is the app's reference default for "not built yet". |

Progress store: localStorage `dreamari-play-progress`, slot key `${gameId}:${level}`, `RunSave = { gameId, level, index (next beat), scores: Record<beatId, tier>, reputation, scored, at }` (`progress.ts:11-29`, :35-37). Read via `useSyncExternalStore` (never copied into state in an effect: a state initializer during hydration saw the server snapshot and threw every save away, AI_HANDOFF 24 Aug).

### 1.11 Explore bridge banner

`NextStepBanner` (:212-219): eyebrow "Looking for another career to play?", text "Explore more careers and find another simulation to play.", CTA "Explore" -> `/explore`, `Icon={ChevronRight}`, `storageKey="dreamari:play-explore-bridge-dismissed"`. Dismiss X writes `"1"` to that key (`NextStepBanner.tsx:45-57`); X sits in the card's top-right corner (10 Sept). Why: Play is for experiencing careers, Explore for discovering them (Joshua Pierce, Slack, 5 Sept 2026; play.md:8-9). Same component as the Top Three next step. Bug history: inside a `seq-reveal` page BorderBeam's own `animation` overrode the fade-in and left the banner at opacity 0 (a 144px blank), fixed 10 Sept by wrapping it so the wrapper takes the reveal. HANDOFF_INDEX known gap: the banner does not change after the simulation is completed (no copy specified).

### 1.12 Trailer overlay (opened from the hub)

`TrailerFlow` (`TrailerFlow.tsx`, 285 lines), mounted by FeaturedRow when `trailerSim?.trailer` (:327). Portals to `document.body` with `marketing-v2 themeable` classes (tokens do not resolve outside the shell otherwise). Details relevant to art are in §3.5. Its finale "Start Level 1" button and "Skip" both call `onDone`, which on the hub is `setTrailerSim(null)` (:327) -- it closes the trailer and returns to the hub; it does NOT navigate into the level. UNCLEAR whether intended (the trailer was designed to play before Level 1; since 31 Aug it is only opened from the hub chip). GAP: decide whether "Start Level 1" should `router.push("/play/{id}")`.

### 1.13 Backdrops and the version chip (in-game only, NOT the hub)

- Hub: `AppBackdrop` (live, same as all tabs). History: 21 Sept `ef77023e` gave both the hub and the glossary game a new `PlayBackdrop` (purple-to-pink using the unused `--hero-accent-pink` token plus a faint diagonal hairline texture), because Joshua (Slack): "it shouldn't have a similar background color as the Explore/my profile etc, it'll feel redundant... when playing a game it should feel like we are entering a new world". Same day it was scoped back to gameplay only (`0d8e3bc5`) per "Dont change the background of the PLAY TAB...".
- Career simulations (`SimulationPlayer.tsx`) never use PlayBackdrop: they use scene art / `LocationBackdrop` / `AmbientBackdrop` (see §3.4).
- Glossary game (`GlossaryGameExperience.tsx:2096-2101`) renders one of four backdrops by `bgVersion`:
  - **v1 (shipped default)** `PlayBackdrop` (`PlayBackdrop.tsx`): fixed berry/magenta wash `BACKDROP_WASH` (:51-55) = `radial-gradient(115% 95% at 15% -10%, rgba(219,39,119,0.55) 0%, transparent 68%)`, `radial-gradient(105% 90% at 100% 105%, rgba(157,23,77,0.5) 0%, transparent 65%)`, `linear-gradient(160deg, #2a0a1f 0%, #170a14 45%, #3a0f2c 100%)`; animate-ui `StarsBackground` (`src/components/ui/stars.tsx`) with `starColor="#ffffff"`, `speed={140}` (reference default 50 was too fast: "Slow the movement of the stars upward"). `showStars={false}` on the two celebration screens (unlock-complete and lesson complete) so fireworks are the only motion ("do not combine the fireworks with the star background use only the fireworks", :65-73; condition `GlossaryGameExperience.tsx:2097`). Palette history: accent-derived gold duotone rejected ("WHY HAVE YOU USED A GOLDEN BACKGROUND FOR THE GLOSSARY GAME!!!!!!!!!!!!!! USE SOOMETHING ELSE. IT JUST HAS TO PLAY WELL WITH THE GAME UI NOT MATCH IT"), jade/emerald rejected ("still feels black dominated... try a different combo than green/yellow"), then berry with bigger, stronger glows (:16-28). Fixed palette on purpose "so it can't drift back into matching whichever world's accent happens to be warm". Never theme-switches (Play is its own fixed world), which is why `SpeechBubble` uses literal dark colors.
  - **v2 CRT** `PlayBackdropV2Crt.tsx`: black (not the CodePen's `#2b52ff` blue: "instead of a blue screen lets keep it black") with magenta/cyan glows `radial-gradient(70% 55% at 18% 12%, rgba(255,0,170,0.22)...)`, `radial-gradient(65% 50% at 85% 88%, rgba(0,231,255,0.18)...)`, `#050308` (:56-60); SVG fractal-noise static (`baseFrequency 0.85`, `numOctaves 2`, desaturated) with opacity breathing `crt-noise-flicker 6s ease-in-out infinite`, `mix-blend-screen`, painted UNDER the scanlines (:74-80); scanlines `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 51%)` at `background-size: 100% 8px`, `crt-scanline-roll 0.4s linear infinite` (:86-90); curvature vignette `radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)` (:94). Loads "Press Start 2P" only while mounted (:25, :34-40). Root gets `.play-crt` (`GlossaryGameExperience.tsx:1937`); token overrides live under `.marketing-v2.play-crt` (globals.css:1131-1180, compound selector to win the cascade), radii zeroed, RGB-split glitch only on filled mastery dots (graphic elements only), blinking cursor `.crt-cursor-after::after` on speech bubbles. Reference: codepen.io/creme/pen/aPJwEz.
  - **v3 Dots** `PlayBackdropV3Dots.tsx`: the real Vanta.js DOTS via CDN (`three.js r134` from cdnjs, `vanta@latest/dist/vanta.dots.min.js` from jsdelivr, :24-25); options `backgroundColor 0x0b0b0c`, `color/color2` = resolved accent, `size 3`, `spacing 35`, `showLines: false` (removes the central LineSegments sphere: "Keep the wavy sea of dots exactly like this... remove ONLY that", :77-102). CDN failure falls back to the `#0b0b0c` div (:104-108). Accent resolved through `useResolvedColor` (probe must be inside `.marketing-v2` to see `--glossary-accent`).
  - **v4 Synthwave** `PlayBackdropV4Synthwave.tsx`: sky `linear-gradient(180deg, oklch(0.1 0.05 292) 0%, oklch(0.72 0.18 75) 100%)` over `#0d0a1f` (:41); 5 static white star dots in the top 45%; floor `h-[58%]` with `perspective: 340px`, `perspectiveOrigin: 50% 0%`, grid `rotateX(78deg)`, `transformOrigin: 50% 0%`, `backgroundColor #0d0a14`, 1px gold lines `oklch(0.78 0.18 75 / 0.4)` every 60px, `synth-grid-scroll 4s linear infinite` (:57-81). No sun, one grid color, gold not magenta ("Lets color the synth one gold rather than magenta"), dark floor, not a reflection.
  - All four share the reward **bloom** (`backdropPulse.ts` event bus, `play:pulse` CustomEvent, kinds `correct | wrong | celebrate`): a `140vmax` radial flash from screen centre, color = accent (or `var(--destructive)` on wrong), peak opacity 0.5 / 0.32 wrong / 0.7 celebrate, `backdrop-bloom 900ms ease-out forwards` (keyframe `globals.css:1052-1056`: 0% opacity 0 scale .7; 30% opacity `--bloom-peak` scale 1; 100% opacity 0 scale 1.35). `forwards` is load-bearing: without it the circle snapped back to full opacity and stuck ("the sharp round blob that appears after right answer is bad").
- **Version chip** `PlayVersionChip.tsx`: demo-only `role="tablist"` of 4 buttons "v1 | v2 CRT | v3 Dots | v4 Synth" (:10-15); active = `var(--glossary-accent)` fill + `#05070f` text; 10px uppercase semibold. Lives in `DemoControlsDock` (bottom-centre fixed dock, `GlossaryGameExperience.tsx:353-387`, tagged `DEMO-ONLY` at :353) next to DEMO reload/step-back controls. Moved off the top bar 22 Sept because "up there they read as part of the actual product UI". State `bgVersion` default `"v1"` (:1790); `?bg=2|3|4` opens that version (read one rAF after mount, :1791-1800); switching writes the param via `history.replaceState` (:1812-1818). Each version also swaps SFX and its own background music loop (`glossaryThemeSound.ts`, :1801-1811); music is gated by the Music toggle, not the Sound toggle (fixed 25 Sept).
- **Live answer**: v1 is the shipped default everywhere; v2/v3/v4 are experiments reachable only via the chip or `?bg=`.
- Not used anywhere: `src/components/ui/vortex.tsx` (Aceternity Vortex, parked "for when that experiment resumes").

### 1.14 Responsive rules summary

- `< 640px` (below `sm`): every row = CardDeck (hero-tier cards, no compact tier), idle hint on row 1 only. Main `px-5`.
- `sm` (640+): rails appear; hero 533x300, side 212x300, compact 302x170. Main `px-[var(--space-14)]`.
- `md` (768+): hero 676x380, side 269x380, compact 347x195; rail bleeds by `-mx-[var(--space-14)]`; `md:pt-8`.
- `lg` (1024+): hero 764x430, side 304x430; rail bleeds to the viewport edge via `calc(50% - 50vw)`.
- Wide screens: main capped at 1440px, centred. The site-wide 1440px-baseline desktop zoom exemption (AI_HANDOFF 24/25 Aug, commit `9d33370`) touches only `globals.css` + `SimulationPlayer.tsx`, i.e. the player; the hub keeps the normal app zoom.
- Touch: `dm-*` hover rules are inside `@media (hover: hover)` and a global inline script in `src/app/layout.tsx` swallows emulated mouse events for 1s after a touch so one tap = one tap (26 Sept).

---

## 2. Entry points into Play from elsewhere

| # | Where (file:line) | Label / UI | Route | Gating / notes |
|---|---|---|---|---|
| 1 | Desktop nav `chrome.tsx:160-165` (`NAV_ITEMS`) | "Play" tab | `/play` | Always |
| 2 | Mobile bottom nav `chrome.tsx:534-539` (`MOBILE_ITEMS`) | "Play" + `CirclePlay` icon | `/play` | Always |
| 3 | Hamburger quick links `chrome.tsx:168-179` | "Play" | `/play` | Always (added 24 Aug: "Play was missing from the hamburger menu's quick links") |
| 4 | Career Detail hero `CareerDetailExperience.tsx:606-619` | "Play Game" (`Gamepad2`), BorderBeam colorful, translucent primary fill | `/play/{career.slug}` (straight into the game, not the hub) | Only if `simulationFor(career.slug)` (:529). Missing sim -> button hidden, never disabled "Coming soon": Joshua's standing rule "never show 'coming soon' in the demo" (HANDOFF_INDEX:96). A disabled + "Coming soon" treatment was requested later and is DEFERRED until the demo period ends (AI_HANDOFF 21 Sept QA batch). |
| 5 | Career Detail hero `CareerDetailExperience.tsx:621-632` | "Glossary Game" (`BookOpen`), quiet outline | `/play/glossary/{career.slug}` | Only if `hasGlossary(career.slug)` (:530). (25 Aug it showed a disabled "Coming soon" pill; now hidden. UNCLEAR when changed.) |
| 6 | Explore For You reel card `ExploreExperience.tsx:1061-1074` | "Play Game" text button (dark glass `rgba(5,8,20,0.72)`) | `/play/{slug}` | Only if `simulationFor(slug)` (:564-565). Bug fixed 21 Sept (engineer's Slack, 20 Sept): it rendered on every card with no onClick. |
| 7 | Profile > Top 3 card `ProfileExperience.tsx:1334-1344` | "Play" with world-accent disc + play glyph | `sim ? /play/{sim.id} : /play?focus={careerId}` | Always shows (never "coming soon", Joshua 11 Sept). See GAP in §1.3: focus on a non-sim career falls back to the default hero. HANDOFF_INDEX:158 says "Top Three / My Plan Play CTA routes to the Investment Banking simulation regardless of the #1 career (Joshua: IB only for now)"; the current code routes per career. UNCLEAR which is authoritative (code is newer). |
| 8 | Profile "Play your #1 Career Simulation" (play.md:33-34, commit `c0d46e58`, 7 Sept) | "Play your #1 Career Simulation" | `/play?focus=investment-banking` | Not found in current `src` (grep for "Play your" returns nothing). UNCLEAR: likely removed with the 11 Sept Top 3 redesign ("Bottom 'Play' nudge removed (Play is on the cards)"). |
| 9 | Profile My Plan roadmap `profile/data.ts:95,101,107` | Tasks "3 Career Simulations from your Top 3" (Play), "Complete 3 Skill Games for your #1 Career" (Play), "Complete 3 Glossary Games for your #1 Career" (Play) | `/play`, `/play`, `/play/glossary/investment-banking` | Finance plan only. GAP: "Skill Games" do not exist; glossary task hard-codes the IB glossary. |
| 10 | Profile grade plans `profile/gradePlanData.ts:52,209` | `PLAY = "/play"`, `GLOSSARY = "/play"` | `/play` | Glossary steps route to the hub, not a glossary game. |
| 11 | Home hero carousel panel 2 `HomeExperience.tsx:296-313` | eyebrow "NEW GAME LAUNCHED", title "Day in the Life: Registered Nurse", chip "Level 1 · New Grad RN", "Your first shift is ready.", button "Play" | `/play/registered-nurse` | Hard-coded to `REGISTERED_NURSE`; cover = `REGISTERED_NURSE.cover`, focus `50% 30%`. Why: IB already lives in the Continue rail, so the feature slot announces the next game (4 Sept). |
| 12 | Home "Continue Where You Left Off" rail `HomeExperience.tsx:421-452` | `ActivityCard` whole-card link, verb chip "Continue"/"Play" | sims: `/play/{sim.id}`; glossary: `/play/glossary/investment-banking` | `ACTIVITIES` hard-coded: IB sim, "Finance Glossary Game" (cover `glossary-finance-thumb.png`, `pct: 60`, "6 of 10 terms mastered" -- hard-coded fake progress, not tagged `DEMO-ONLY`; GAP), RN sim. Same bones as the Play poster card so a saved run is recognisable. |
| 13 | Home rail header `HomeExperience.tsx:540` | "View all in Play" | `/play` | Always |
| 14 | Connect > Mentorship prep row `mentorshipData.ts:116`, `MentorshipTab.tsx:1331` | `PlayPrepCard`: "Play" / "Fashion Buyer Day in the Life" / "Experience the career before talking about it." / CTA "Play Simulation" | `/play` | Cover `/images/play/fashion-buyer/maison-laurent-atelier.webp` (`objectPosition: "40% 45%"`). No Fashion Buyer simulation exists; the tile routes to the hub. Also `mentorshipData.ts:67` activity "Fashion Buyer · Day in the Life" -> `/play`. |
| 15 | Schools marketing page `marketing/SchoolsView.tsx:95-107` | Stage "04 Immerse", link "See the simulation in the app" | `/play/investment-banking` | Marketing |
| 16 | Landing Play chapter `marketing/chapters/Play.tsx` | In-page demo (uses `face-christina-serious.webp`, `l3-20.webp`, `/images/sim-deal-kickoff.jpg`) | none found | Shares Play assets; no link to `/play` found in the file. |
| 17 | Career actions lab (demo) `actions-lab/ExploreLab.tsx:943`, `actions-lab/CareerDetailLab.tsx:584,615` | Mirrors #4-6 | same | Lab copies of Explore/Career Detail; same gating. |
| 18 | In-game HUD `SimulationPlayer.tsx` Home button | Home icon | `/play` | Always links back to the hub (25 Aug). |

Routes (play.md:11-12): `/play` hub; `/play/[game]` player (`?level=n`, `?mode=express`; unknown id -> `notFound()`, `src/app/play/[game]/page.tsx:24-25`); `/play/glossary/[career]` glossary (only lesson 1; no content -> `notFound()`, `src/app/play/glossary/[career]/page.tsx:19-24`). Bare `/play/glossary` is not a page.

Express derivation (`[game]/page.tsx:39-43`): `expressBase = picked.expressSource ?? picked`; Express only if `mode=express` AND `expressBase.expressCut?.length`. The hub chip checks only `levels[0].expressCut` (PlayHub :789); IB L1 keeps a non-empty `expressCut` purely so the hub and route offer the mode, while Express actually plays the frozen `IB_LEVEL_1_EXPRESS_LEGACY` (`ib-level-1.ts:43-53`). New careers: set `expressCut` on the level; only use `expressSource` for the "Full moved on, Express did not" case.

**Gating rules to carry into production**
1. Show a Play/Play Game button only when `simulationFor(slug)` exists; otherwise hide it (Career Detail, Explore) or route to `/play?focus=` (Top 3). Never a "coming soon" Play button while the demo rule stands.
2. Show a Glossary Game button only when `hasGlossary(slug)`.
3. Placeholders exist only on the hub ("In the works" and row-1 soon cards), in full color, never pressable into a game.
4. Deep links from elsewhere should land on the hub with `?focus=` (content page before playback) except the direct "Play Game" buttons on Career Detail/Explore, which go straight into the game. UNCLEAR: whether Career Detail/Explore should also move to `?focus=` for consistency with the 7 Sept Prime Video rule (nothing says so).

---

## 3. Art direction and image rules (per image slot)

### 3.0 Inventory (`find public/images/play -type f`, 70 files)

```
public/images/play/
  fashion-buyer/maison-laurent-atelier.webp            1672x941   (mentorship Play tile)
  ib/
    l1-04 l1-07 l1-12 l1-13                            1400x1050 / 1400x934 / 1400x788 / 1400x934
    l2-02 l2-07 l2-08 l2-18                            1400x788
    l2-09 2644x1487, l2-10 2896x1629, l2-19 3344x1882, l2-23 3072x1728  (recomposited 16:9)
    l3-01 1400x788, l3-06 2896x1629, l3-07 1400x1555, l3-08 2896x1629
    l3-14 l3-16 l3-17 1400x934, l3-19 l3-20 3344x1882
    face-christina 512, face-christina-serious 384, face-cobalt-hr 512, face-jordan 512, face-lamisa 512, face-marcus 512   (square webp)
    expressions/  christina-{welcoming,proud,concerned} cobalt-hr-welcoming jordan-{confident,focused,uncertain} lamisa-composed marcus-assessing   (all 1800px tall, widths 874-1311, webp 157-261KB)
    locations/    trading-floor-{sunset,night} internal-boardroom-sunset client-boardroom-sunset cafe-lounge-sunset elevator-hallway-sunset (1600x900 webp)
                  reception exterior-sunset (1448x1086 webp)
  rn/
    denise.jpg rosa.jpg tyler.jpg yvonne.jpg            ~1448x1086 (ORPHANED, see GAP)
    face-{denise,rosa,tyler,yvonne}.jpg                 420-460 square jpg
    expressions/  rosa-{welcoming,proud,concerned} denise-{composed,assessing,concerned} tyler-{confident,focused,uncertain} yvonne-composed   (all 1024x2048 webp, 83-106KB)
    locations/    corridor lobby patient-room staff-room station ward-night (1672x941 jpg), station-hero.webp (1672x941 composite)
public/images/app/  (hub covers)
  soon-{accountant,airline-pilot,aviation-maintenance-technician,emergency-medicine-doctor,food-scientist,private-equity,software-engineer}.png   1254x1254 PNG, ~2-2.3MB each
  soon-registered-nurse.png 941x1672 (ORPHANED)
  glossary-finance-thumb.png 941x1672; glossary-{registered-nurse,airline-pilot,software-engineer}-cards.png 1672x941
  glossary-{aviation,healthcare,tech}-thumb(-v2).png 1672x941 (6 files ORPHANED)
public/images/dreamy/v2/dreamy-*.png (+ splash/*.webp)   Dreamy poses for glossary + splash
public/audio/play/ ib-main-song.mp3, ib-promotion-song.mp3, rn-main-song.m4a
```

Orphans (no `src` reference): `ib/l1-07.webp`, `ib/l3-01.webp`, `ib/l3-07.webp`, `rn/{rosa,denise,tyler,yvonne}.jpg`, `app/soon-registered-nurse.png`, `app/glossary-{aviation,healthcare,tech}-thumb{,-v2}.png`. GAP: prune or document.

### 3.1 Slot: Simulation cover (hub card, Home rail, Home hero)

- **Purpose**: the career's poster on the Play hub (all three tiers + phone deck), Home Continue rail and Home hero panel.
- **Field**: `Simulation.cover` (`games.ts:17`, `:46`). Also `Level.cover` per level (`ib-level-1.ts:31` `l1-04.webp`, `ib-level-2.ts:43` `l2-23.webp`, `ib-level-3.ts:54` `l3-17.webp`, `rn-level-1.ts:34` `station-hero.webp`). `Level.cover` is effectively unused in the player (`sceneFor` returns it only in `mode: "none"`, which renders `AmbientBackdrop` and ignores `src`, `SimulationPlayer.tsx:486-487, :1030`). GAP: decide whether Level.cover should appear anywhere (e.g., level-select/promotion).
- **Crops it must survive**: 16:9 hero (533x300 up to 764x430), 0.707 portrait side (212x300 up to 304x430), ~1.78 compact (267x150 up to 347x195), 0.826 phone deck (319:386), Home rail card, Home hero (`focus="50% 30%"`). All `object-cover`, centred, no per-image focal point on the hub.
- **Current sources**: IB `l1-04.webp` 1400x1050 (4:3) is "a single fully-painted illustration baked by the art pipeline" (Christina + Jordan at reception). RN `station-hero.webp` 1672x941 is a static composite: `station.jpg` plate + `rosa-welcoming.webp` cutout "grounded with a real contact shadow and a light color-grade toward the scene's warm tones" (commit `4786c332`, 1 Sept 2026). Why: RN had no baked cover, so the same cutout + location-anchor approach the gameplay uses was baked once "matching IB's character-in-frame treatment".
- **Rule**: character in frame (not an empty room). Key subject must sit in the central safe zone so both portrait and landscape crops keep the face (see Codex template, §3.2).
- **Format/naming**: no fixed rule. IB uses the L1 hero plate; RN uses `rn/locations/station-hero.webp`. Recommend `play/<career>/cover.webp`. GAP: no naming convention.
- **Fallback**: `CoverPhoto` BookOpen-on-world-tint (hub only). Home `ActivityCard`/`HeroPanel` fallbacks: UNCLEAR (not in my slice).

### 3.2 Slot: Placeholder ("In the works" / row-1 soon) cover

- **Purpose**: poster for careers with no simulation yet (`SOON[].cover`, `games.ts:76-88`).
- **Folder / naming**: `public/images/app/soon-<careerId>.png` (PNG, square 1254x1254 masters; RN's older one is 941x1672 and orphaned).
- **Hard rule**: its OWN `soon-*.png` file, never the shared `poster-*.png` used by Explore Browse / Profile / Match Lab / marketing (`games.ts:69-75`). Why (25 Aug): an earlier pass overwrote `poster-airline-pilot-alt.png`, `poster-registered-nurse.png`, `poster-software-engineer.png`, `poster-private-equity.png`, `poster-food-scientist.png` in place and put the Play-only illustrated covers on Explore's Browse cards too; restored and split into `soon-*`.
- **Style**: illustrated anime, same family as the simulation art. 25 Aug the realistic BROWSE photos found as stand-ins were replaced by the user's illustrated images: "style consistency with the rest of the row matters more than a same-day source".
- **Source + prompt**: Codex built-in `image_gen`; canonical output folder is `~/Documents/Dreamari/Play tab` (OUTSIDE the repo, AI_HANDOFF 21 Sept: "This is the folder to watch/check for any future Play tab art from Codex, not the project-root one"). It contains `README.md`, `preview.html` (9:16 and 16:9 crop preview), `prompts-and-crops.json` (full prompts + crop positions), PNGs named by career slug (`airline-pilot.png`, `accountant.png`, `aviation-mechanic.png`, `emergency-medicine-doctor.png`, `food-scientist.png`, `investment-banker.png`, `software-engineer.png`, `medical-alternative-02.png`). Swapping = copy over `public/images/app/soon-<id>.png` in place, then clear `.next/dev/cache/images` locally (stale optimizer renditions otherwise).
- **Shared prompt template** (verbatim prefix used for accountant, aviation-mechanic, emergency-medicine-doctor, investment-banker, software-engineer, medical-alternative-02 in `prompts-and-crops.json`):

  > Use case: stylized-concept. Create one finished square 2048x2048 career illustration for Dreamari Play tab. Input image is STYLE and occupation reference only: create a new character and fresh composition, not a replica. Match its refined cinematic semi-realistic anime art, delicate ink contours, angular painterly cel shading, detailed believable workplace, rich navy shadows and warm amber rim light. Attractive but natural adult professional, engaged in work, expressive believable face, no glamour pose. Critical responsive crop requirement: square master designed to work cropped to BOTH centered 9:16 portrait and centered 16:9 landscape. Keep entire head, face, shoulders and most important job cue inside central x=28%-72%, y=24%-72%; head top no higher than 25%. Medium waist-up subject at moderate scale, no giant close-up. Extend rich workplace scenery in all four directions, peripheral props expendable. Enough contrast on face to read at thumbnail size. No words, titles, borders, logos, watermark, collage, panels, or UI.  Subject and scene: <one paragraph: identity (ethnicity, age, hair, glasses), wardrobe, action holding the job cue at chest level in the centre, expression, workplace props, light>

  Per-career subject examples: accountant "A Latina woman accountant in her forties, warm medium brown skin, shoulder-length dark wavy hair, rectangular glasses and smart muted navy blouse... financial ledger raised slightly in one hand and a pen... Calculator, orderly invoices and spreadsheet screens... warm late-afternoon light. One clear main character." Aviation mechanic "An East Asian woman aircraft mechanic in her early thirties... navy coveralls... beside an opened aircraft engine, using a socket wrench at chest level close to body... golden hangar light."
  Edit-style variants exist for fixing a specific image: airline-pilot ("Correct the spatial logic... Use attached reference 1 ONLY for the female character identity and anime rendering style, not its physically impossible cockpit layout... Sky must appear ONLY in the FRONT windshield...") and food-scientist ("Preserve the SAME Muslim woman character wearing her beige hijab... Do not replace her with a man, remove her hijab, or redesign her identity.").
- **Crop positions** in the JSON (`portraitPosition` / `landscapePosition`): `50% 50%` / `50% 20%` for all except aviation-mechanic portrait `30% 50%`. NOT applied in code (every hub cover is plain centred `object-cover`). GAP: wire per-career `object-position` (the JSON says landscape crops should favour `50% 20%`).
- **Current mapping**: Airline Pilot (cockpit), Software Engineer (coding, whiteboard), Private Equity (deal book, boardroom), Food Scientist (lab, samples), Accountant (calculator, ledgers), Aviation Maintenance Technician (engine repair, hangar), Emergency Medicine Doctor (ER, patient) (AI_HANDOFF 21 Sept). An unused alternate EMD image and `medical-alternative-02.png` exist in the Codex folder.
- **Size concern**: 1254 square PNGs at ~2MB each; next/image optimises on Vercel, but GAP: no webp master convention for covers.
- **Fallback**: `CoverPhoto`.

### 3.3 Slot: Glossary game card cover

- **Field**: `GLOSSARY_GAMES[].cover` (`games.ts:119-131`), optional.
- **Files**: `public/images/app/glossary-finance-thumb.png` (941x1672 portrait; user-supplied anime illustration of business term cards on a desk, Empire State skyline, a sneaker sketch tying to the Dream Sneakers story, 25 Aug), `glossary-{registered-nurse,airline-pilot,software-engineer}-cards.png` (1672x941 "card-hand thumbnails", 9 Sept `98ce71de`).
- **Naming rule for titles**: every title follows "{Subject} Terms" ("Finance Terms", "Medical Terms", "Flight Terms", "Tech Terms"). Why (9 Sept): "Finance Glossary Game and everything Terms is not good, make it consistent" (`games.ts:115-118`). `sub` = "Learn key {domain} terms".
- **World**: from `worldForCareer(careerSlug)` (checks SIMULATIONS then SOON, `games.ts:103-105`) so the title uses that career's poster font and world accent (21 Sept fix: Glossary titles had used a generic font). A glossary career not in SIMULATIONS or SOON gets no world -> display font, no world line. GAP for careers outside both lists.
- **Prompt**: none in repo. GAP.
- **Fallback**: missing cover -> `CoverPhoto` BookOpen.
- Private Equity was removed from this row (9 Sept, direct feedback).

### 3.4 Slot: In-game scene art (hero illustrations and location plates)

How the player picks the background for each beat (`sceneFor`, `SimulationPlayer.tsx:1002-1031`):
1. Walk back from the current beat to the nearest beat with `art`. If that beat is within `SCENE_FRESH_BEATS = 3` beats (:985), show it as a **hero** scene. Beyond 3 it is stale; stop.
2. A beat with `resetScene: true` stops the backward walk (ends an inherited picture without owning art; added 24 Aug for L2-02 after the offer-letter art bled into onboarding; later on L1-08, L1-14, L2-09, L2-19, L2-25, L3-07).
3. Otherwise use the beat's own **location** from `BEAT_LOCATION[beat.id]` (`locations.ts:223-413`, 114 beat entries).
4. No location -> `mode: "none"` -> `AmbientBackdrop` (three drifting color fields + fixed sparkle field tinted by level mood and world accent). Deliberately used only for each level's terminal Final Review beat (`locations.ts:213-216`).

Dimming: when the interactive controls are revealed, hero or location backdrop gets `filter: blur(7px) brightness(0.7) saturate(0.45)` (:494-495) plus a vignette; while dialogue is being read the backdrop is sharp and the character stands in frame (24 Aug evening fix: both states had been keyed to `beat.kind` and ran backwards).

**3.4a Hero scene illustrations** (`beat.art`, `beat.artAlt`)
- Folder/naming: `public/images/play/<career>/l<level>-<nn>.webp`, filename carries the handoff screen id (IB L1-04 -> `l1-04.webp`, AI_HANDOFF 24 Aug).
- Format: webp. Original batch converted at 1400px wide ("41MB -> 2.4MB with no visible loss"). Later recomposites at native size (2644-3344 wide).
- Ratio: must be 16:9 (or wider). Why (24/25 Aug): "Any hero image below a 16:9 ratio gets scaled up aggressively by object-cover on wide viewports, cropping heads"; L2-10, L2-23, L3-06, L3-08 recomposited to 16:9 with a TOP-anchored crop (a centre crop cut Christina's forehead on L2-09). Sub-16:9 files still in use (l1-12 is 16:9; l1-13, l3-14, l3-16, l3-17 are 1.5) were audited as POV/ensemble shots without named-character crop risk.
- Rendering: `SceneLayers` (`SimulationPlayer.tsx:797-814`): one sharp `next/image fill priority sizes="100vw" object-cover object-center`, `play-scene-in 1.1s cubic-bezier(0.16,1,0.3,1)` fade. Static: the old slow zoom (`play-camera`, ~9.5% over 26s) was removed 24 Aug because it "pushed a composed illustration past its own edges". The earlier two-blurred-copies phone treatment was also removed ("the blurred edges read as a visible defect").
- `art-ratios.ts` (`ART_RATIO`, 18 entries) is DEAD CODE: nothing imports it (grep), it was for the removed phone progressive-fade layout. Stale values and missing new files (l2-09, l3-01, l3-07). GAP: delete or revive.
- Source: vendor zip of anime scenes per level (IB: "21 anime scenes from the vendor zip", 24 Aug; later "Dreamari Investment Banking Career Simulation.zip", a 24 Aug asset package with separated background/foreground layers). Not in repo. No prompt. GAP.
- Trademark rule: sweep every hero file for real brands before use. 24 Aug night: `l2-09`, `l2-10`, `l2-19`, `l3-19`, `l3-20` had "LOUIS VUITTON" baked in (plus a misspelled "COLBALT CAPITAL" wall sign) against the fictional client Maison Laurent; pulled, then 4 of 5 restored from clean separated layers with labels patched out. **`l2-09.webp` still ships the raw branded art** as an explicitly authorized "pre-launch internal deployment ONLY" placeholder (`ib-level-2.ts:151-156`). GAP/RISK: must be replaced before any public release.
- Story consistency rule: art must not show a different person than the cast bible (L2-02/L3-01 "HR" art showed a woman who was not Christina; decision D11 reattributed, later reverted to a "Cobalt HR" character with her own sprite).
- It is acceptable to keep some beats as flat baked-in illustrations instead of cutout+location, "night/crunch mood scenes especially" (user, 24 Aug night).

**3.4b Location plates** (`LOCATION_ART`, `locations.ts:73-201`)
- Purpose: the room behind any beat without fresh hero art; the stage for cutout sprites.
- Must be character-free ("people-free") plates. Why: cutouts in front of plates with baked-in people ghost the moment anything moves; "THE REAL FIX is character-free background plates from the artist" (24 Aug "PARALLAX REMOVED").
- Folder/naming: `public/images/play/<career>/locations/<room>[-<time>].<ext>`; ids `<firm>-<room>-<time>` (e.g. `cobalt-trading-floor-night`) or `<firm>-<room>` (`riverbend-station`). Id prefixes must not collide across careers.
- Format/size: IB 1600x900 webp (16:9) plus two 1448x1086 4:3 plates (`reception`, `exterior-sunset`); RN 1672x941 jpg. GAP: no single spec; recommend 16:9 >= 1600 wide webp.
- Per-plate data: `src`, `alt` (descriptive sentence), `focal {x,y}` and `mobileFocal {x,y}` as 0-1 fractions (object-position), `characterAnchor {x, baselineY, heightFrac, centered?}` for one standing character, optional `characterAnchors[]` for multiple characters in story order (only `l1-reception`, from that plate's own `scene.json`).
- Anchor conventions: IB `baselineY 0.99, heightFrac 0.88-0.9`; boardrooms centred at full 0.9 scale ("off-to-the-side by the window read as a scaling/positioning bug"); RN `baselineY 1.78, heightFrac 1.75` because RN sprites are full head-to-toe figures while IB sprites are waist-up crops ("match how much body IB shows, cropping lower body is fine", `locations.ts:147-156`). Place the anchor on open floor, never over furniture (boardroom chairs, patient bed) since no foreground masks exist.
- Library size: IB six rooms from `Dreamari-IB-Claude-Production-Handoff-v2.zip` (trading floor day/night, internal boardroom, client boardroom, cafe lounge, elevator hallway) + reception + exterior (20 Sept, user's own ChatGPT image). RN six rooms (lobby, station, patient room, corridor, staff room, ward night) from `RN_Game_Asset_Pack`; "the pack's three people-free daytime plates replaced the lobby/station/staff-room backgrounds". RN pack queue still open: people-free patient-room/corridor/ICU masters, evening/night variants (31 Aug).
- Routing rule (`locations.ts:218-222`): from the handoff's `background-library.json` where listed; otherwise narrative judgment with the tie-break "internal prep/review -> internal boardroom, formal client pitch/deal decision -> client boardroom, public working-floor moment -> trading floor, private transition -> hallway". Every beat gets a room, scored beats included (rendered dimmed); only the terminal review beat is unmapped. Visual-congruence rule: a continuous run (Day 1 morning) stays in one room/time of day ("the sunset floor sandwiched between daylight screens read as day -> evening -> day in five slides", 31 Aug).
- Do not swap a plate without re-tuning its anchors (24 Aug: a re-supplied set of six plates was deliberately NOT swapped in because every anchor is tuned to the current framing).
- Prompt: NONE in repo. `background-library.json` and `scene.json` live in the handoff zip, not the repo. GAP: explicit background/location prompt workflow does not exist.
- Note: `docs/handoff/background-space-extraction.md` is NOT about Play art. It documents the app-wide atmospheric "Background Space" (five blurred ellipses from Figma) and the WebKit-safe CSS (pre-faded radial gradients, never large `filter: blur()` layers, which crashed iPhone tabs). Its platform lesson still applies to any Play backdrop: no large blur layers, no per-item backdrop-filters.

### 3.5 Slot: Trailer plates and trailer sprite

- **Data**: `Simulation.trailer: TrailerCard[]` (`games.ts:23-33`, `:52-61`; type `types.ts:450-464`): `{ id, seconds, text, art?, sprite?, finale? }`.
- **Shape (travels to every career)**: seven beats "scale, odds, cost, room, consequence, the person at the top, the ladder" (`games.ts:18-22`, `:47-51`). 4-4.5s each (~20-30s total), skippable from card 1, no choices, no score. Finale carries the ladder from `levels[].role + upcoming[]` (e.g. IB "Six levels. Intern to Managing Director. How far will you get?").
- **Art rule**: "REUSE ONLY -- six of seven cards use art that already exists; only the finale's ladder is new". Plates are existing location plates or hero illustrations. A card with no `art` is black (IB TR-01, RN-TR-02). No statistic we cannot source: RN's two statistic cards "ship WITHOUT their numbers, per the sheet's own rule: no numbers we cannot source (D04)".
- **Top-person sprite** (card 6): `sprite` = an existing expression cutout of the most senior character (IB `lamisa-composed.webp`, RN `yvonne-composed.webp`), who is "SEEN before she is met": rises into frame dark-graded (`filter: brightness(0.68) contrast(1.08) saturate(0.85) drop-shadow(0 0 60px rgba(0,0,0,0.9))`, box `h-[80dvh] w-[60vw] sm:w-[36vw]`, right 2%/9%, rise 1.4s delay 0.25s, `TrailerFlow.tsx` ~:101-116).
- **Treatment** (`TrailerFlow.tsx`): black stage; plates crossfade 0.9s; Ken Burns alternates scale 1.16->1.04 (even cards) / 1.02->1.14 (odd), linear over `seconds + 1.2` (min 3s); letterbox bars ease to `9dvh`; inline SVG film grain; title in the world's poster face (`posterTitleFont(world)`), constant tracking (animating letter-spacing rewrapped lines = jitter); organic blurred text pool (never a hard-edged scrim); music = the simulation's main theme (`playMusic("main", simulation.id)`) with its own mute; "Skip ▸" always visible; finale "▶ Start Level 1" pulsing CTA. Reduced motion: no scale.
- **Per-career identity derived automatically**: world accent, poster font, firm mark, ladder.
- **Not auto-played** (31 Aug, overriding the sheet's play-once-on-first-open): only from the hub's "Watch trailer" chip.
- Fallback: missing `trailer` -> no chip (`PlayHub.tsx:799`). Missing `art` on a card -> black.

### 3.6 Slot: Expression sprites (standing characters)

- **Purpose**: the character standing in a location scene, reacting after the player commits ("Expression swaps occur after the player commits, before feedback text finishes appearing", `expressions.ts:9-11`), on character intro cards (standing `castMember` sprites), and as the trailer's top-person silhouette.
- **Folder/naming**: `public/images/play/<career>/expressions/<name>-<expression>.webp`, lowercase, hyphenated; names map 1:1 onto `EXPRESSION_PORTRAITS` (`expressions.ts:22-60`). Multi-word speakers hyphenate (`cobalt-hr-welcoming.webp` for speaker "Cobalt HR").
- **Selection**:
  - Tier reaction: `expressionFor(speaker, tier)` from `EXPRESSION_PORTRAITS[speaker][best|acceptable|wrong|risky|none]` (:62-65). Mapping by role: mentor best=proud, acceptable=welcoming, wrong/risky=concerned, none=welcoming; peer best=confident, acceptable=focused, wrong/risky=uncertain, none=focused; judge (Denise) best/acceptable=composed, wrong/risky=concerned, none=assessing.
  - Default (in the room before any answer): `defaultExpressionFor(speaker)` (`DEFAULT_EXPRESSION`, :70-87). Characters with a single approved expression (Marcus assessing, Lamisa composed, Yvonne composed, Cobalt HR welcoming) appear only there.
  - Pre-answer tension: beats with `tone: "conflict" | "alarm"` borrow the concerned/uncertain tier face via `neutralTier` (24 Aug).
  - Who is on screen: `beat.castMember ?? beat.speaker` for single slot; `beat.castMembers[]` for the multi-slot plate. "Narrator" or a speaker with no entry renders nobody (L1-04 had silently rendered no one until `castMembers` was added).
- **Sizing**: rendered at a fixed CSS height from the location anchor with `object-contain`; `PORTRAIT_RATIO[src]` (true width/height of each file, :94-125, fallback 0.55) feeds next/image `width/height` (`SimulationPlayer.tsx:962-963`) plus `max-w-none` to beat Tailwind preflight's `img { max-width: 100% }`, which had silently clamped sprites (25 Aug postmortem: "check the actual rendered <img> box dimensions ... BEFORE touching anchor/position math"). Entrance `play-character-enter 0.42s cubic-bezier(0.16,1,0.3,1)`; drop-shadow `0 18px 30px rgba(0,0,0,0.45)`. No idle bob, no parallax (two characters on unsynced loops "looked like a positioning bug").
- **Spec**: `docs/handoff/sprite-master-prompt.md` (full workflow in §4). RN sprites: 1024x2048 canvas, ratio 0.5 each. IB sprites: from `Dreamari_Clean_Sprites_2K`, cropped to alpha bounding box (~1.7-2% padding), 1800px tall, widths vary (ratios 0.4856-0.7283; Christina welcoming 0.7283 because an arm is extended).
- **Processing**: one genuine single pass (decode once, crop to alpha bbox, resize, save once at high quality) because re-saving degraded the earlier set (24 Aug). Clean interior matting defects (opaque off-white pixels trapped in curly hair; connected-component pass recolouring small bright islands to the local median, 24 Aug). RN: green-screen masters chroma-keyed in-repo with PIL ("green-dominance alpha ramp + despill"), saved as transparent webp ~100KB (31 Aug). GAP: none of these scripts are in the repo.
- **Fallback**: no sprite for a speaker -> no standing character; dialogue shows the face chip (if any).

### 3.7 Slot: Face chips (dialogue portraits, character-card faces)

- **Purpose**: the small round portrait in the dialogue box (Nintendo-style, line in quotes) and the face on character intro/lexicon cards (`cast.set(..., portrait: level.cast?.[castMember])`, `SimulationPlayer.tsx:170-174`). Hidden when the big scene sprite of the same speaker is already on screen (`sceneCharacterVisible`, 24 Aug).
- **Field**: `Level.cast: Record<speakerName, path>` (`types.ts` Level.cast; IB `ib-level-1.ts:33-37` Christina/Jordan/Marcus; RN `rn-level-1.ts:36-41` Rosa/Denise/Tyler/Yvonne). Per level, so a later level adds its new speakers.
- **Files**: IB `public/images/play/ib/face-<name>.webp` 512x512 (regenerated 24 Aug from the fresh 2K sprite source; the older 256px lineage was cut from hero art with the macOS Vision framework). `face-christina-serious.webp` 384 is used only by the marketing landing chapter. RN `face-<name>.jpg` 420-460 square jpg (cropped from the supplied portraits).
- The master prompt says "Dialogue face chips are cropped from these same files by us; no separate asset is needed" (sprite-master-prompt.md:15-16). GAP: no script/spec for the crop (size, circle framing, format differs between careers).

### 3.8 Slot: Glossary game in-game art

- No per-term raster art. Term illustrations are lucide icons chosen by a semantic `icon` slug in content (`glossary/data.ts:110-120`, e.g. `building`, `sneaker`, `palette`, `shopping-bag`, `money-bag`) resolved through `TERM_ICON_MAP` (`GlossaryGameExperience.tsx:127-151`; aviation `thrust/lift/drag/altitude`, healthcare `stethoscope/heart-pulse/pulse/siren`, tech `plug/database/bug/workflow` already mapped), fallback `Sparkles`. Rendered big through an SVG "pencil wobble" sketch filter with radiating dashes and a squiggle underline (`TermFlipCard`). Why: "Illustrations stay RELEVANT to the lesson's own story (direct feedback): the product IS a sneaker..." and "no emoji, follow the design system" (25 Aug).
- Dreamy guide: `/images/dreamy/v2/dreamy-<pose>.png` (poses happy, glasses, idea, curious, party, nervous, puzzle, heart), `DreamyFace` with an `onError` fallback (Sparkles on a brand-tinted circle, 22 Sept, :166-190). Deliberately NOT the SimulationPlayer sprite system (that one is "purpose-built for a person photographed in a specific room").
- Accent: `--glossary-accent` = `WORLD_COLORS[world]` of the career (amber for Finance) for CTAs/progress; Power Play keeps `--hero-accent-purple`. "Keep the yellow for CTAs. The career world accents can stay, its the background that we need to work on" (21 Sept).

### 3.9 Slot: Mentorship Play tile

`/images/play/fashion-buyer/maison-laurent-atelier.webp` 1672x941, Codex-generated boutique concept; brand plate checked to read "DREAMARI", not a real luxury brand; `objectPosition: "40% 45%"` (19 Sept). No Fashion Buyer simulation exists. GAP: tile promises a simulation that does not exist (routes to `/play`).

### 3.10 Slot: Welcome splash sprite

`/images/dreamy/v2/splash/dreamy-controller.webp` (`wide: true`, 640:445 box). The controller Dreamy came from `Dream Expression V3/29.png`, tight-cropped with the v2 set's ~3.7% margin (10 Sept). Why: "Play splash still uses the party sprite; swap to a controller Dreamy when that asset exists" -> swapped.

### 3.11 Audio (for completeness)

`music.ts:17-25`: `DEFAULT_TRACKS` = IB `ib-main-song.mp3` / `ib-promotion-song.mp3`; `SIM_TRACKS["registered-nurse"] = { main: "rn-main-song.m4a" }` (128kbps AAC). A career without its own promotion track borrows IB's ("generic celebration"). Separate music mute (`dreamari-play-music-muted`) from SFX mute. Music never from unlicensed sources (25 Aug: declined to download YouTube "type beats"). GAP: per-career track sourcing/licensing process is undocumented.

---

## 4. Sprite master prompt workflow, and the (missing) background workflow

### 4.1 `docs/handoff/sprite-master-prompt.md` (151 lines), how it works

1. Attach the approved character reference images to ChatGPT first (the references are "the single source of truth for identity and art style").
2. Paste the fenced block (lines 20-130) and fill in only the `== CAST ==` table for the career. Everything else must stay byte-identical ("The spec section is frozen -- it encodes exactly what the simulation engine (SceneCharacter, expressions.ts) requires").
3. The model returns one image per reply captioned only with its filename, working through the cast in order, self-checking against the acceptance checklist before showing an image (the user "will not be doing a QA round").
4. Drop results into `public/images/play/<career>/expressions/` (convert to webp in practice; RN files are `.webp` though the prompt names `.png`).

Frozen OUTPUT SPEC (lines 30-57): true-alpha transparent PNG (no white/checkerboard/backdrop); clean anti-aliased edges, no fringe/halo/outline; full figure head to shoes, ~4% margin above hair, ~2% below shoes, feet on an invisible floor, no shadow/ground; portrait canvas 1024x2048 or taller at the same ratio; eye-level straight-on to slight 3/4, 50mm-equivalent, same camera for all; soft neutral slightly warm key from upper front-left, no colored rim light; style identical to references (clean anime / cel-shaded); identity and wardrobe identical across a character's set, only face/body language change; one character, no props unless listed, no text/logo.

Expression vocabulary (lines 59-77): WELCOMING, PROUD, CONCERNED (mentor/judge reactions); CONFIDENT, FOCUSED, UNCERTAIN (peer); COMPOSED, ASSESSING (senior). Primary characters get three sprites, secondary one.

Role -> sprite set table (lines 142-147):

| Role in the story | Sprites |
|---|---|
| The mentor beside you | welcoming, proud, concerned |
| The judge above you | composed, assessing, concerned |
| The peer you're measured against | confident, focused, uncertain |
| The figure at the top | composed (one only) |

Filenames `<name>-<expression>.png`, lowercase, hyphenated, 1:1 with `EXPRESSION_PORTRAITS`.

The CAST currently in the file is the Registered Nurse cast (Rosa staff nurse / mentor, Denise nurse manager / judge, Tyler new nurse / peer, Yvonne CNO / top), each with one identity sentence (skin, hair, age, build, jewelry, exact wardrobe incl. uniform color, named props, and "Exactly as in her reference").

### 4.2 Adapting it per career (step list for a new career)

1. Define the four story roles (mentor, judge, peer, top) and name the characters in the level spec.
2. Get approved reference art per character (a canonical turnaround first: "the handoff's own caution against batch-generating a cast before their canonical turnaround is approved", `expressions.ts:5-7`).
3. Rewrite ONLY the cast rows: one identity sentence per character + the role's expression set, filenames `<name>-<expression>.png`.
4. Generate; if the generator cannot produce true alpha, use green screen and chroma-key (what the RN pack did: PIL green-dominance alpha ramp + despill). GAP: this deviates from the prompt's own spec and the script is not in the repo.
5. Post-process in one pass: crop to alpha bbox (~2% padding) or keep the 1024x2048 canvas, clean matting defects, export webp (~100KB target), place in `public/images/play/<career>/expressions/`.
6. Measure each file's width/height ratio and add it to `PORTRAIT_RATIO` (`expressions.ts:104-125`); add the tier set to `EXPRESSION_PORTRAITS` and the default to `DEFAULT_EXPRESSION`.
7. Crop face chips (512 square webp recommended, matching IB) into `public/images/play/<career>/face-<name>.webp` and add them to each `Level.cast`.
8. Add each speaker to `VOICE_PITCH` (`SimulationPlayer.tsx:1579-1590`; unlisted speakers fall to 500 so everyone sounds the same, the 7 Sept RN parity bug).
9. Tune each location's `characterAnchor` for this sprite family (full-figure sprites need the RN-style `heightFrac 1.75 / baselineY 1.78` to show head-to-hips like IB; waist-up sprites use `0.9 / 0.99`). GAP: pick ONE sprite framing standard for all future careers so anchors are not per-career hacks.
10. Optionally bake a cover composite (sprite over a plate with contact shadow and color grade, as RN's `station-hero.webp`).

### 4.3 Background / location / hero-scene prompt workflow

GAP (explicit): there is no background, location-plate, hero-scene or trailer-plate generation prompt anywhere in the repo. What exists instead:
- IB plates came from a teammate's `Dreamari-IB-Claude-Production-Handoff-v2.zip` (UX audit, character bible, learning-design spec, six plates, `background-library.json` beat lists, a `scene.json` with focal point and two character slots for the reception plate). Not in repo.
- RN plates came from `RN_Game_Asset_Pack` (people-free daytime masters; queue of patient-room/corridor/ICU masters and evening/night variants still open). Not in repo.
- The IB exterior (20 Sept) was a one-off ChatGPT image from the user's Downloads.
- The only reusable prompt style guidance for environments is implicit in the Codex card template (§3.2: "refined cinematic semi-realistic anime art, delicate ink contours, angular painterly cel shading, detailed believable workplace, rich navy shadows and warm amber rim light") and the sprite spec's lighting note ("sprite must sit believably in rooms lit many different ways").

What a location prompt would have to encode (derived from code, not from any doc): character-free; 16:9 at >= 1600px; eye-level camera matching the sprite spec's 50mm; open floor at the anchor position (no furniture where a character stands); a time-of-day variant set (day/sunset/night) per recurring room; no text/logos/real trademarks; same anime cel-shaded style as the cast; a focal point so `object-cover` crops on phones keep the subject area (`mobileFocal`).

`docs/season-art-prompts.json` is NOT Play art: it holds six built-in `image_gen` prompts (maple, leaf/gingko, snow, crystal, blossom, petal) for the Profile My Plan seasonal falling-sprite animation (AI_HANDOFF 22 Sept "Complete painted seasons"). Useful only as a second example of the house prompt style for transparent sprites ("ONE object only, centered, filling 80% of a square canvas... TRUE transparent alpha background, no paper rectangle... no drop shadow, no halo... Crisp enough silhouette to read at 40-64px").

Other prompt docs found (`grep -rli prompt docs`): `docs/handoff/figma-agent-prompt.md` (Figma variables), `docs/handoff/profile-figma/PROMPT.md` (Profile Figma), reference walk notes. None relate to Play art.

---

## 5. Chronological decision log (Play, Glossary, hub, art)

Format: date, change, why (quoted feedback where recorded). Source is `docs/AI_HANDOFF.md` unless a spec/commit is named.

**Pre-history (16-21 Aug 2026)**: the landing page's Play chapter was a marketing mini-demo (VN-style scene over a choice panel, "the image is the least visible part, it's supposed to be an immersive simulation experience like an RPG"). 21 Aug: Home "Continue your journey" rebuilt around the IB sim using 21 cel-shaded Cobalt Capital scenes ("use these for all things games and simulation oriented"); the "Deal Team Kickoff" game card lived here until 4 Sept.

**24 Aug 2026**
- `/play` hub and IB Level 1 created (`fb89ebf2`); nav Play slot had been `href="#"`. Level content verbatim from `DreamAri_IB_Levels1-3_Handoff.xlsx`. Art: 21 scenes to webp at 1400px, filenames carry beat id; sticky art for unillustrated beats. Phones: art panel across the top (later replaced).
- RPG pacing, autosave/resume ("students play in short bursts between classes"), Vision-cropped face portraits, synthesized sound, visible mute ("a game that cannot be silenced in one tap is a game nobody opens at school"). Parallax removed: baked-in characters ghost; "THE REAL FIX is character-free background plates from the artist".
- Level 2 and Level 3 built; checkpoints/repair round (scores stored per beat, reputation derived); keyboard play.
- Level-navigation bug: `key={level.id}` on SimulationPlayer (stale ending state).
- Ambient backdrop after `SCENE_FRESH_BEATS` (3); Dreamy floats only in ambient state. Light mode: hub was missing `data-space-backdrop`. Play added to hamburger quick links.
- Location library from Handoff v2: six plates replace the ambient gradient on beats without art; Christina/Jordan expression sprites drive scene + verdict portrait. Judgment call: boardroom characters kept small by the window because no foreground masks exist (later reversed). Skipped: mastery model, accessibility settings, analytics ("each is its own multi-surface feature").
- Location tuning: `castMember`; "spotlight" intro placement; `play-hover` not `play-float`; interaction beats text-first (later reversed 21 Sept: every beat gets a dimmed room).
- v3 handoff: Marcus (assessing) and Lamisa (composed) sprites; Cobalt HR sprite not wired ("introducing her would be a storyline change").
- Composition fixes: sprites cropped to alpha bbox; hair matting cleanup; ResizeObserver pixel heights; reception composed from `scene.json`'s two slots; no pointer/idle motion; character big while the line is read, steps back when controls appear.
- Ace Attorney references: VS showdown card (removed same night: "confusing rather than dramatic"); backdrop blurs while a character is read (later inverted, see evening).
- Page titles uppercase (Joshua).
- Evening: centering/blur now keyed to `revealed`; anchors rebuilt fully in frame; `neutralTier` + `tone`; sprites re-exported in one pass from `Dreamari_Clean_Sprites_2K`; 512px face chips; hero zoom removed.
- Late evening: `resetScene` primitive ("mark the first beat of the new scene with resetScene: true rather than stripping the earlier beat's own art").
- Night: live "LOUIS VUITTON" trademark pulled from five files; showdown removed; `tone` moved to BeatBase. User: keep some beats as flat baked art, "night/crunch mood scenes especially".
- Later: Back steps one beat; four more `resetScene` fixes after a full sweep.

**24/25 Aug**: verified against the reference build `dceeai.replit.app/ib-career-game`; 4 of 5 trademark scenes restored from clean layers; L2-09 raw branded art authorized as pre-launch-only placeholder ("do not treat this as resolved"); sub-16:9 hero art recomposited to 16:9 top-anchored; L3-07 Lamisa as cutout; boardroom characters centred at 0.9 ("off-center just read as a bug"); Play exempt from desktop zoom; one-shot scene/entrance/question sound cues ("a loop needs its own volume layer and gets muted fast"); L2 onboarding reverted to "Cobalt HR"; answer-box glow tried then dropped ("We dont have to do the card lights or glow. Forget it.").

**25 Aug**
- Mobile character scale root cause: `PORTRAIT_RATIO` + `max-w-none`. Dialogue text 23/27px, typewriter 12 -> 26 ms/char ("The copy isnt getting enough focus"). Anchor tuning reverted after desktop broke ("everything is fucked"); box lifted `mb-[3dvh] sm:mb-[4dvh]`. VN reskin request withdrawn; keep the rounded glass card.
- Performance Improvement Plan (strike rule, red takeover, randomised step orders rolled outside render).
- Home "Resume Simulation" CTAs wired to `/play/investment-banking` ("wherever there is a resume simulation... it should take me to the relevant simulation").
- Play IB Home button; background music with its own mute ("mute it and only hear sound effects"); hub gains Glossary Games and Mini Games rows; SOON covers replaced by illustrations. Bug: overwrote shared `poster-*.png` -> Play covers moved to `soon-*.png` (why of the `games.ts:69-75` rule). Music muffles (lowpass 20kHz -> 500Hz) during PIP/timed questions.
- Glossary Game built (`DreamAri_Glossary_Content_Template_v1.xlsx`, reference `dceeai.replit.app/ib-glossary-game`): no emoji, design-system tokens, Duolingo patterns, strict hierarchy with no caption tier; `hasGlossary()` gates every entry point ("whichever careers we have data for and then general placeholder for others"). Career Detail "Play Game" wired to `simulationFor()`, hidden when none.
- Glossary card redesigned with an image cover ("genuinely the weakest-looking part of the page"); three dummy glossary entries fill the row. Real Finance thumbnail; "Mini Games" row removed.
- Netflix-style featured career row (`c57a388c`): one dominant card + side choices; Accountant, Aviation Maintenance Technician (world "Fixing Machines & Engines" invented), Emergency Medicine Doctor as side cards with dedicated `soon-*` covers; pushed with 3 missing images, then filled with the user's illustrated images (style over realism); side cards widened ("too slender on mobile").

**26 Aug (handoff date; commit `6d5b8d19` dated 31 Aug)**: row rebuilt as a real Netflix shelf: one shared `ROW_HEIGHT`, featured wider not taller ("doesn't have the featured one taller... they're all proportional and the same height"); CTA grouped with its card ("what is with the start level CTA sitting separate from the featured card"); uppercase titles; world label in world accent, never the title; carousel transition requested ("the featured card keeps getting updated as the other cards move into it"); "More Glossary Games" removed.

**31 Aug**
- CTA moved INTO the card's scrim on the artwork (`be55dc3f`) after two rejected separate-box attempts; roles line removed; real progress bar; CTA radius 10px ("Apple's formula"). Superseded later: today there is no CTA button at all (whole-card link + progress strip + corner badge).
- IB Aug-31 handoff: L1 restructured; check/reveal beats; Dreamy removed from the simulation (D62; three voices: character/narrator/system; per-character voice blips); score gauge ("make it read like a score"); tick sound removed; cinematic trailer (letterbox, Ken Burns, grain, poster serif, Lamisa silhouette, ladder finale "How far WILL you get?"); trailer NOT auto-played, only from a "Watch trailer" chip, overriding the sheet.
- Gamification pass: word-card flipbook, score spotlight flight, tappable skill chips, day-lit congruence. Hub rail full-bleed so the next card peeks; chip text "Watch trailer".
- Registered Nurse Level 1 built to the IB SOP (`1ef0354a`): TrailerFlow parameterized by simulation (world font, accent, firm, ladder) "this is what makes career #3 cheap"; PERFORMANCE_PLANS keyed by sim id; carousel remount bug fixed with one persistent keyed card; blockers honored (no unsourced numbers D04, salary/hours proposals, endings draft).
- RN sprites chroma-keyed from the asset pack's green-screen masters (generated with `sprite-master-prompt.md`); RN-TR-06 Yvonne silhouette.
- IB Express mode (`c5593318`): `expressCut`, slot n+100, pull-teaching panels; "Express mode" chip next to "Watch trailer".
- RN music; expand-in-place via real CSS width transition ("stretchy" fix, `5d91d481`).

**1 Sept**: RN cover composite `station-hero.webp` (Rosa in the station plate), "matching IB's character-in-frame treatment".

**2 Sept**: Build-flow micro-interactions rolled out app-wide; `SparkBar` adopted for the hub's saved-run bar; `.dm-quiet` hover follows the element's own shape.

**3-4 Sept**: Play featured card fits a 375 phone; rail bleeds to the viewport edge on desktop (`c41bd922`); one page title/left margin across tabs; Home rail matches Play cards; one name and one cover per game across Home hero, rail and Play; "Deal Team Kickoff" replaced by the RN simulation (CEO, 4 Sept); "Day in the Life" series name everywhere (CEO, 4 Sept).

**5-7 Sept**
- Explore bridge banner (Joshua, Slack, 5 Sept), placed after Glossary Games (6 Sept).
- Level 1 no-repeat rule: a line said in the scene is not repeated on the activity screen (Joshua, 6 Sept, play.md:17-18).
- Nursing gets a real Express mode (7 Sept, play.md:20-21).
- IB vs Nursing parity audit: `VOICE_PITCH` for Rosa/Denise/Tyler; `rank`/`pick` usage flagged for Joshua (play.md:23-28).
- HUD wears the career's world color, not generic band colors (play.md:30-31).
- Profile "Play your #1 Career Simulation" -> `/play?focus=investment-banking` (Prime Video/Apple TV pattern, `c0d46e58`).

**9 Sept** (`98ce71de`): glossary card-hand thumbnails; non-linking "Coming soon" dummy cards ("they dont have to work or lead anywhere"); "Glossary Game" chip removed; Private Equity removed from the glossary row; "{Subject} Terms" naming; "In the works" enlarged; both shelf rows bleed; "Coming soon" thumbnails stay full color. Home activity cards redesigned with a visible verb chip.

**10 Sept** (`b99d3c5a`, `3e0b778b`): welcome splashes for Match/Explore/Play (Play: "Choose a career. Step into the job..."); phone card stack from the CEO's JioHotstar recording with measured geometry and one-time idle hint after the splash; bottom-right play/lock corner badge on every card ("include the play button on registered nurse too ... show the locked icon for the rest"); centred play badge removed; hero "Coming soon" as plain text; banner invisibility fix; splash CTA ring. Controller Dreamy sprite found and used.

**11 Sept**: Top 3 cards answer "test it or learn more?" (Joshua): Play + Learn more side by side; "never 'coming soon' in a demo; a career without its own game goes to `/play?focus=<id>` and still says Play". Bottom Play nudge removed. One AppBackdrop everywhere (duplicate backdrops removed). (`74236a18` "collapsed Home/Play cards": UNCLEAR what changed on Play.)

**19 Sept**: Mentorship Play prep tile: first IB L2-10 art, then corrected to the Codex Maison Laurent atelier concept (brand plate checked: "DREAMARI").

**20 Sept**: IB Level 1 rebuilt to the 20 Sept handoff (3 acts, binary +5/-5, `hideBand`, new FocusBeat/drag options/act cards); new exterior establishing shot on L1-01; BEAT_LOCATION re-keyed. Engineer's Slack feedback: Explore reel "Play Game" had no onClick and no gating (fixed 21 Sept).

**21 Sept** (the big hub day)
- Express reverted to its pre-20-Sept content via `expressSource` ("ONLY EXPRESS MODE should revert").
- Level 1 location coverage: every beat gets a room; drag-rank double-apply bug fixed; Explore reel Play Game gated on `simulationFor`.
- Glossary Games row Netflix-style hover (`551844c1`: "should only be less dominant until hovered, similar to how Netflix handles rows and tiles"; 1.16x scale, siblings dim), then spring physics (`cd40405f`, "read as rigid"), then overlap fix (`a0412232`).
- Replaced by TV-style scroll row focus for every row (`b830377f`, "he wants all rows like this"; "we dont need the elevated hover for this version... it should be like the first row").
- Rows morph into hero+side on focus (`aaaeda4a`), quotes in §1.4.
- Hero-select bug + per-world fonts on Glossary/In the works titles (`68464991`, "the first tile should be big not the second, not unless I click on the second card").
- Career Simulations falls back to compact too (`e01b7f99`, "only the focused row should look like that"); `RowFocusWrapper` deleted.
- Every row gets the phone card stack (`e6b3d5bb`, "its messed up lets use the same style for the hero row for the rest").
- New artwork for the 7 "coming soon" careers (overwrite `soon-*.png` in place); replacement Food Scientist; corrected Airline Pilot (the original had a "physically impossible cockpit layout"); discovery that Codex's real output folder is `~/Documents/Dreamari/Play tab` with `prompts-and-crops.json` (crop hints not applied).
- Compact featured card inert fix (`6420063e`), quote in §1.7.
- Play gets its own background (`ef77023e`, Joshua: "entering a new world... the change of color will spike the neurological pleasure reward"; "not a direct replication of the Replit's colors") then scoped back to in-game only (`0d8e3bc5`, "Dont change the background of the PLAY TAB").
- Glossary backdrop saga: teal-violet ("Dont do the same blue/purple thing like the rest of the app"), accent duotone (rejected, gold), jade (rejected, "black dominated"), berry + animate-ui Stars (slowed, "Slow the movement of the stars upward"), Fireworks on success screens (colored, behind content, no stars), bloom `forwards` fix, hand-drawn illustrations restored, SpeechBubble literal dark colors, question card centered on a real surface, `PlayBurst` ("not flat basic confetti, ever"), HUD text sized to match the simulation HUD.
- Glossary example optional again via a real 3D flip (Joshua's walkthrough: 5 actions for 5 terms, example behind "Tap for an example", Instagram-carousel logic).
- v2 CRT / v3 Dots / v4 Synthwave experiments behind `PlayVersionChip` (`?bg=`), corrected against their live references over several rounds; per-version SFX and music (v1 got its own tune: "v1 also could use a good tune"); music toggle; DEMO reload/step-back ("clearly marked for usman"); `--space-7` undefined-token padding bug.
- QA batch (Usman's Windows/Chrome list): missing-game Top 3 fallback kept as-is (never "Coming soon"); a disabled Play + "Coming soon" treatment is a deferred follow-up for after demo season.

**22 Sept**
- Mouse hover reclaims row focus (`5b05d5f0`, Josh on a large Chrome screen).
- `CoverPhoto` failed-load fallback for every hub card; glossary NaN mastery and zero-question dead-end fixed; `DreamyFace` fallback (`9b20c36c`).
- Title-page spacing rhythm unified (`0f5380df`).
- Glossary shell scaling anchored to a 13" MacBook Air (1440x900) home base, CTAs capped at 560px ("THE CTA Buttons dont need to stretch past a respectable amount"), vertical centering accounts for the demo dock; demo chip moved to a bottom-centre dock.

**25 Sept**: Glossary music was gated by the Sound toggle; split into `audio()` / `musicAudio()`; CRT tape-hiss removed ("take the static sound out completely").

**26 Sept**: one tap = one tap on phones (global emulated-mouse guard); `dm-*` hover rules only under `@media (hover: hover)`.

Spec-level (not dated in AI_HANDOFF):
- `docs/handoff/specs/play.md` status "Locked. The Investment Banking simulation is the only playable simulation" (stale, RN is playable).
- `docs/handoff/specs/progression-system.md` (6 Sept, PROPOSAL, do not build until Joshua signs off): Play-relevant pieces are the "Played / Clocked In" milestone (one chapter plus its reflection, unlocks a Dreamy outfit from that career), career emblems (one ID-card badge per simulation, finishing the full simulation with reflections; named today: The Analyst, The Nurse, The Pilot, The Engineer, The Scientist, The Doctor, The Accountant, The Mechanic, The Investor), XP (100 per chapter + debrief once per career and chapter, Full or Express; 20 for the chapter reflection; 30 per glossary lesson; 40 per delayed glossary check >= 48h later), "episode drops: a new chapter for the #1 career each Thursday", Dreams state "Tried" (a simulation chapter attached), Altitude never gates a simulation, no leaderboards. None of this is implemented beyond the Build +100 XP.

---

## 6. Gaps

- GAP: `docs/handoff/specs/play.md:3` and `docs/HANDOFF_INDEX.md:60` still say "IB simulation is the only playable"; Registered Nurse is live in `SIMULATIONS` (`games.ts:67`). Update specs.
- GAP: No background / location-plate / hero-scene / trailer-plate generation prompt or spec exists in the repo (§4.3). The handoff zips (`background-library.json`, `scene.json`, character bible) are not in the repo.
- GAP: The card-cover prompt template and crop positions live only in `~/Documents/Dreamari/Play tab/prompts-and-crops.json` (outside git). Copy into `docs/handoff/` and wire `portraitPosition`/`landscapePosition` (currently every cover is centred).
- GAP: No naming/format standard for covers (IB uses a hero plate path, RN a `locations/station-hero.webp` composite; placeholders are 2MB square PNGs).
- GAP: One sprite framing standard. The master prompt says full figure 1024x2048; IB sprites are waist-up 1800px crops; RN full figures need a `heightFrac 1.75` anchor hack. Decide one.
- GAP: The master prompt demands true-alpha PNG but RN was produced on green screen and chroma-keyed; neither the chroma-key, the alpha-bbox crop, the matting cleanup, nor the face-chip crop scripts are in the repo. Face chips differ per career (IB 512 webp, RN 420-460 jpg).
- GAP: `PORTRAIT_RATIO`, `EXPRESSION_PORTRAITS`, `DEFAULT_EXPRESSION`, `VOICE_PITCH`, `BEAT_LOCATION`, `LOCATION_ART`, `SIM_TRACKS`, `SIMULATIONS`, `SOON`, `FEATURED_ROW_SOON_IDS`, `GLOSSARY_GAMES`, `PERFORMANCE_PLANS` are all hand-maintained maps; a missing entry fails silently (no sprite, generic 500 voice pitch, AmbientBackdrop, IB music). A production pipeline needs validation that every speaker/beat has an entry.
- GAP: `art-ratios.ts` (`ART_RATIO`) is dead code (not imported), stale and incomplete.
- GAP: `Level.cover` is not rendered anywhere in the player.
- GAP: Hub has no "completed" state, reads only Level 1 and only the Full-mode save slot, always links Level 1 (§1.10).
- GAP: Trailer finale "Start Level 1" closes the trailer instead of starting the level (§1.12). UNCLEAR if intended.
- GAP: `?focus=` for careers without a sim and not in `FEATURED_ROW_SOON_IDS` falls back silently (Top 3 Play for most careers lands on IB); `HeroShelfRow` ignores focus.
- GAP: Row-1 placeholders are not selectable, Glossary/In-the-works locked cards are. Pick one rule.
- GAP: Active row header is always Business & Finance gold (`--glossary-accent` undefined on the hub).
- GAP: `posterTitleFont` has no case for "Fixing Machines & Engines", "Factories & Making Things", "Personal Care & Community Services", "Food & Cooking" (`worlds.ts:51-83`), so Aviation Maintenance Technician's title uses the body font. Every future world needs a poster font.
- GAP: `GLOSSARY_GAMES` entries for careers outside SIMULATIONS/SOON get no world (display font, no world line).
- GAP: Placeholder careers are hand-picked (`SOON`, `FEATURED_ROW_SOON_IDS`), not derived from the catalog; which careers show "In the works" at scale is undefined.
- GAP: Glossary card titles/subs/covers hand-authored; no glossary cover art prompt; no rule for which glossary games appear as dummies.
- GAP: Home "Finance Glossary Game" progress (`pct: 60`, "6 of 10 terms mastered", `HomeExperience.tsx:427`) is fake and not tagged `DEMO-ONLY`; Home hero panel 2 hard-codes Registered Nurse; Home `ACTIVITIES` hard-codes IB, Finance glossary, RN.
- GAP: My Plan task "Complete 3 Skill Games" routes to `/play` but no Skill Games exist; glossary task hard-codes `/play/glossary/investment-banking`; grade-plan glossary steps route to the hub.
- GAP: Mentorship "Fashion Buyer Day in the Life" Play tile promises a simulation that does not exist.
- GAP/RISK: `l2-09.webp` still carries real Louis Vuitton branding (`ib-level-2.ts:151-156`, "pre-launch internal deployment ONLY"). No automated trademark check exists; the rule lives only in logs.
- GAP: Orphaned assets (`ib/l1-07.webp`, `ib/l3-01.webp`, `ib/l3-07.webp`, `rn/{rosa,denise,tyler,yvonne}.jpg`, `app/soon-registered-nurse.png`, six `app/glossary-*-thumb*.png`); `rn-level-1.ts:15-17` header still says "no alpha cutouts yet".
- GAP: Career Detail disabled "Coming soon" Play treatment is deferred until the demo period ends; the post-demo rule is unspecified.
- GAP: Next-step banner copy after a simulation is completed is unspecified (HANDOFF_INDEX:160).
- GAP: Per-career music sourcing/licensing process undocumented; careers without a promotion track borrow IB's.
- GAP: Progression tie-ins (Clocked In, career emblems, XP per chapter, Dreamy outfits) are proposal-only; nothing on the hub reflects them.
- UNCLEAR: Whether the splash "Start playing" button can still be swallowed by the featured card's whole-card Link beneath it (flagged 21 Sept in `aaaeda4a`, spun off as its own task; no fix entry found).
- UNCLEAR: HANDOFF_INDEX:158 "Top Three / My Plan Play CTA routes to the Investment Banking simulation regardless of the #1 career" vs current Top 3 code routing per career.
- UNCLEAR: Where the "Play your #1 Career Simulation" Profile CTA went (not in current `src`).
- Stale comment: `PlayHub.tsx:353-354` says main is capped at 1200px from lg; it is 1440px (:163).
- Known unfixed edge: tall viewport (1280x1100) initial active row can be Glossary Games.
