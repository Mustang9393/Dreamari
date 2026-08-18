# AI handoff

This file records work from the Codex/Claude shared workflow beginning 2026-08-05. It is forward-looking; earlier project history remains in Git commits and each tool's existing context.

## Current session

- Date: 2026-08-15
- Active branch: `redesign/marketing-handoff-rebuild` (branched from `main`; `archive/pre-redesign`
  preserves pre-rebuild `main` per the handoff brief's own instruction)
- Main branch: not touched this session — do not merge without explicit user authorization
- Objective: full replacement of the public marketing homepage (`src/app/page.tsx` and
  everything under `src/components/marketing/`) per
  `DREAMARI-CLAUDE-CODE-HANDOFF.md` and an iteratively-refined HTML reference prototype
  supplied directly by the user (`dreamari-landing-wireframe_25.html`), plus a real Figma
  DTCG token export (`design-tokens.zip`) supplied mid-session. This was an explicit,
  user-directed full replace — not additive work — and does not touch `/flow`, `/home`,
  `/career-report`, `/onboarding`, or the app's existing `design-tokens/` pipeline
  (`design-tokens.generated.css` still builds and validates unchanged; `npm run
  tokens:check` passes 503 tokens).
- Deleted entirely: `src/components/hero/*` and `src/components/landing/*` (old
  DREAMARI-dominant hero, old How It Works scroller) — confirmed no other route imported
  from either directory before removal.
- New `src/components/marketing/` tree: `Nav`, `Hero` + `Mascot` (canvas eye-tracking,
  ported from the reference prototype's vanilla JS), `AudienceToggle`, `HowItWorks` +
  `ChapterShell` + five chapter components (Build/Match/Play/Explore/Connect) with a
  shared IntersectionObserver-driven "play once, hold, replay on rescroll" pattern,
  `SchoolsView` (full enterprise view: hero variant, phone mock, counselor dashboard
  mock, metrics, org grid), `FinalCTAs`, `Footer`. Tokens live in
  `marketing/tokens.css`, scoped to a `.marketing-v2` class (not `:root`) specifically so
  they don't collide with the app's own global DTCG token names.
- Tokens: `tokens.css` is resolved directly from the user's `design-tokens.zip`
  (Primitives.Default / Semantic.Dark / Semantic.Light), not hand-guessed — every value
  has a source-path comment. Fonts: Bricolage Grotesque + Space Mono added via
  `next/font/google` in `marketing/fonts.ts`, separate from the app's existing Favorit/
  Montserrat load in `layout.tsx`.
- **Real bug, worth flagging for any future work in this app's shared `globals.css`**:
  its `@theme inline` block (`globals.css:141`) binds Tailwind's `font-display` utility
  class to `--font-favorit-display` at the CSS-generation layer — a scoped CSS custom
  property override on a descendant does NOT intercept this, because Tailwind bakes the
  literal variable name into the generated utility rule. Any new page wanting a
  different display font under `.font-display` must override with an explicit
  higher-specificity rule (see `marketing/tokens.css`'s `.marketing-v2 .font-display`
  block), not just redefine `--font-display` in a scoped ancestor.
- Fixed mid-session (all verified via `getBoundingClientRect`/computed-style checks, not
  just screenshots, after the browser tool's screenshot capture proved to lag/stale
  during this session): a CSS sizing loop that collapsed chapter graphics to 0 width
  when stacked on mobile/tablet (an `inline-flex` glow wrapper conflicting with several
  chapters' own `w-full` content — Play in particular went completely blank), a
  resulting loss of horizontal centering for the fixed-width chapters (Match/Explore),
  the Match card's zoomed end-state overlapping the copy text above it on narrow
  viewports, a stray visible seam where the hero mascot's ambient glow got hard-clipped
  by `overflow:hidden` before the fade-to-background overlay had ramped up enough to
  mask it, and three Tailwind default-breakpoint mismatches (nav links wrapped and
  chapter rows forced into a cramped row layout in the 768–899px range) where the
  reference's own breakpoints are 900px/800px/600px, not Tailwind's 768px.
- Validation: ESLint, `tsc --noEmit`, `npm run tokens:check`, and a full production
  build (`npm run build`) all pass clean as of the last change this session.
- Browser-verified: hero mascot eye-tracking and scroll-exit fade, all 5 chapter
  animations play-once/hold/replay-on-rescroll correctly, Student/Schools toggle
  (including the light-theme repaint), mobile (390px) and tablet (768px) layouts with no
  horizontal overflow, chapter-graphic centering and width numerically confirmed clean
  at mobile width after the fixes above.
- Not pushed to `origin` or opened as a PR as of this entry — see "Recommended next
  step" for status once that happens.

### 2026-08-15 finance-focused content pass, full-frame chapter redesign

- Scope: same five `HowItWorks` chapters only (Build/Match/Play/Explore/Connect);
  no other route touched.
- Build now asks the real Question 3 of 7 ("Choose your interests": Tech / Business &
  Money / Health, Business & Money nudged as the example), oneliner states the 7-question
  assessment. Rows are full-width and identically sized (a `flex-col`, not wrapped pills of
  variable width) per explicit feedback that mixed chip sizes read as broken.
- Match's 3-card deck is now all Business & Finance careers (Investment Banking /
  Operations / Project Manager) rather than a cross-category mix — per explicit request
  that the deck stay on-theme with Build's finance path. Tapping a card flips it to a
  Description/Salary/College-major info panel; liking/disliking is illusion-of-choice only
  (`Match.tsx`) — every path ends on the same "You're matched! Investment Banking" reveal,
  since no real per-choice branching was requested. Explore's 4 cards were reframed to
  match-strength categories (Strong Match/Match/Stretch/Wildcard) over the previous mixed
  category set; the Wildcard (Food Scientist) has no stand-in photo and renders an icon
  tile instead of a placeholder image.
- Play was rebuilt from a split image-banner/content layout into a full-bleed photo card
  with the glossary game overlaid in a glass panel (`rgba(8,11,23,0.42)` + blur — the
  standard `--glass-surface-3` token was too opaque and hid the scene entirely, so this one
  panel intentionally uses a custom lower-opacity value rather than that token). Red
  answer-state color and the progress bar are both gone per direct request.
- Connect was rebuilt from a pinned-corkboard layout into a single social-post card
  (avatar/name/tag, question, like/comment/share row, then a linear comment list) using the
  existing `--glass-surface-2`/`--glass-surface-3` tokens and blur, not new colors. Marcus's
  tag changed from JPMorgan Chase to Goldman Sachs per direct request.
- Shared chapter frame (`ChapterShell.tsx`) raised from `min(56dvh, 520px)` to
  `min(82dvh, 680px)` / `min(94cqw, 480px)` after direct feedback that graphics read as
  small and Play required internal scrolling to see all three answers; `dvh` (not `vh`) is
  deliberate so the cap still shrinks safely on short viewports rather than ever
  overflowing the fold.
- Added auto-advance-on-interaction: Build's `pick()` and Match's post-celebration
  `useEffect` both call `scrollIntoView` on the next chapter's section id after a short
  delay, so picking an interest or finishing the swipe deck carries the reader forward
  without a manual scroll. Match's "You're matched" reveal also got a real entrance
  (scale/glow bounce, `mkt-match-celebrate` in `animations.css`) since the user asked for
  an "emotional moment" payoff there, not a static swap.
- A mid-session debugging detour: `usePlayingOnScroll`'s IntersectionObserver appeared to
  never fire at all (stuck `graphicRevealed: false`) on both local dev and the live
  production deploy, reproduced with injected `window.__ioObserved`/`__ioLog` counters
  showing `observe()` ran but the callback never called back — this correlated with the
  browser automation tool itself reporting "Browser pane is currently hidden" on click/
  scroll actions. A fresh tab in the same tool recovered normal IntersectionObserver
  firing, confirming this was a browser-automation-session state issue, not a code defect.
  The debug instrumentation has been removed from `scrollHooks.ts`.
- Validation: `tsc --noEmit`, `npm run build`, and `npm run tokens:check` all pass clean.
  Browser-verified end to end: Build's picks and auto-scroll, Match's flip/like/celebrate/
  auto-scroll, Play's overlay legibility with the scene still visible behind it, Explore's
  reframed cards, and Connect's post/comment layout with the Goldman Sachs swap.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Match/Play interaction rework, Explore card fixes, mobile alignment

- Match now matches immediately on a "like" (button or swipe) instead of waiting for
  the whole 3-card deck to clear — passing every card without ever liking one still
  falls through to the same match, so the illusion-of-choice ending is unchanged.
  Added real pointer-based swipe (drag left = pass, drag right = match, a plain tap
  still flips the card) so mobile has genuine swipe gesture support, not just the two
  buttons; swipe intent shows as Like/Pass badges that fade in with drag distance.
- Play was rewritten twice this session: first into a 3-scenario auto-advancing
  situational simulation (replacing the glossary-term quiz), then, per direct
  feedback, cut down to a single scenario with a "Try again" replay control instead of
  cycling scenarios. Feedback on picking an option is now a checkmark burst + radiating
  ring positioned with explicit z-index above the glass panel (the panel's own
  backdrop-filter stacking context was rendering on top of the burst before this).
  Picking an option also auto-scrolls to Explore after a couple of seconds, same
  act-then-advance rhythm as Build/Match, cancelled if "Try again" is tapped first.
- Explore: all 4 cards now show a real photo (Food Scientist reuses
  `career-neurosurgeon.jpg` as the closest available stand-in — worth flagging that
  this is a surgical/OR scene, not an actual food-science lab, and should be swapped for
  a real photo once one is available) plus real salary/major text under the title. The
  match-strength label (Strong Match/Match/Stretch/Wildcard) moved to a corner-ribbon
  badge instead of replacing the industry line, which is back to reading "Business &
  Finance" like every other career here. The Wildcard card gets a distinct "rare pull"
  treatment: an animated gradient border plus a diagonal sheen sweep (`mkt-holo-border`/
  `mkt-holo-sheen` in `animations.css`), built from the app's own indigo/blue/cyan/pink/
  gold tones rather than a literal rainbow, keeping clear of red per the standing rule.
  Title sizing is now length-tiered with wrap allowed (not a flat nowrap size), since
  longer titles like "Management Analyst" were overlapping the right-side action rail.
- Fixed a large dead gap between Build's title copy and its actual question: the
  shared frame is sized for the tallest chapter's content, and Build's own content was
  vertically centered inside it (`justify-center`), leaving empty space above the
  question every time the frame was taller than Build's content. Anchored to
  `justify-start` instead so the question sits right below the headline; the leftover
  slack now falls below the interactive content, which is normal for a full-height
  snap section.
- The "How Dreamari works" eyebrow and "Five chapters. One clearer future." heading in
  `HowItWorks.tsx` had no responsive text alignment at all (left-aligned at every
  width) while every chapter's own copy was already mobile-centered via ChapterShell —
  added the same `text-center min-[901px]:text-left` pattern so mobile reads as
  centered throughout, matching everything else on the page. Footer's two-column
  PRODUCT/COMPANY link list was left as-is (left-aligned link columns are the
  conventional pattern there, not part of what was flagged).
- Validation: `tsc --noEmit`, `npm run build`, and `npm run tokens:check` all pass
  clean. Browser-verified: Match's immediate-match-on-like and drag-to-swipe, Play's
  single-question replay flow and the burst now rendering above the glass panel,
  Explore's four real photos with salary/major and corner badges, the Wildcard holo
  card, Build's tightened copy-to-question gap, and mobile-centered intro copy at
  375px width.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 fixed the `--mu` scaling bug behind oversized graphic text

- Root cause of "the graphics' text is way too big and overpowers the page copy"
  (reported after several rounds of "scale the text up" requests this session): every
  chapter graphic's internal font sizes are `calc(var(--mu) * Npx)`, and `--mu` was
  defined on the OUTER `.mkt-graphic` wrapper (a `flex-1` column with no width cap),
  not on the actual card frame inside it (capped at `min(94cqw, 480px)`). On a wide
  desktop screen the outer wrapper can reach ~770-800px, so `--mu` was scaling as if
  the visible card were that wide, even though the card itself always rendered at its
  480px ceiling. Net effect: card-internal text grew disproportionately on wide
  screens, independent of and eventually exceeding the fixed-size H2 chapter
  title/oneliner next to it.
- Fix: added a second, nested container-query context (`mkt-graphic-scale` in
  `animations.css`, applied to the actual frame div in `ChapterShell.tsx`) so `--mu`
  for every chapter's own content is computed from the frame's real, already-capped
  width instead of the outer wrapper's. A container can only resolve `cqw` against an
  ancestor, never itself, so the frame's own `width: min(94cqw, 480px)` still resolves
  against the outer wrapper exactly as before — only what `--mu` means for the frame's
  *children* changed. This caps `--mu` around 1.5 on any normal-to-wide screen (down
  from up to 2.3), while leaving the frame/card itself exactly the same visual size —
  the ask was "cards should stay large, only the text was too big," and this fixes the
  text without touching card dimensions at all.
- No per-file font-size numbers were changed; this was purely the shared scaling
  mechanism. Verified via computed `getComputedStyle().fontSize` at both a narrow
  (800px, stacked) and wide (1440px, side-by-side) viewport that graphic headline text
  (e.g. Build's "Choose your interests," Match's card title, Explore's card title) now
  renders well below the H2 chapter title's font size at every width, instead of
  approaching or exceeding it on wide screens.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified all 5 chapters at both viewport widths.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Food Scientist industry fix, bigger Match buttons, mobile safe-area

- Explore's industry line was a single shared `INDUSTRY` constant ("Business &
  Finance") applied to all four cards, including the Wildcard — per direct feedback
  that a food scientist obviously isn't in business/finance, this is now a per-card
  `industry` field; the three business-track cards keep "Business & Finance," Food
  Scientist now reads "Science & Research."
- Match's (and, to stay the same scale per the standing "read as the same thing"
  requirement, Explore's) card aspect ratio moved from `168/300` to `168/240` — a bit
  shorter and wider — freeing enough vertical room to grow the like/pass button
  circles from 42px\*mu to 52px\*mu (icons 18→22px\*mu) per direct request that they
  read as too small to comfortably tap.
- Fixed the iOS Safari "compact tab bar" floating chip overlapping the bottom of the
  mobile layout: `ChapterShell`'s row gap/padding was a flat 40px/32px at every width
  below 901px, which was tight enough that the frame's content (e.g. Match's like/pass
  buttons) sat right at the phone's bottom edge, right where that floating chip lives.
  Reduced the mobile-only gap/padding, dropped the frame's dvh ceiling from 82 to
  74dvh, and added real safe-area room below 640px specifically (`max-[640px]:pb-
  [calc(1.25rem+env(safe-area-inset-bottom))]`) so bottom controls clear it.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at 375px mobile width across Match/Play/Connect/Explore — no
  cropping introduced by the smaller dvh ceiling, Food Scientist now reads "Science &
  Research," Match's card is visibly wider/shorter with bigger buttons.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 fixed a hard-edge tiling artifact in the Wildcard holo sheen

- Reported as "a smooth gradient shine, but also a hard rectangle/line dragging across
  the screen." Both `.mkt-holo-border` and `.mkt-holo-sheen` (in `animations.css`) set
  a `background-size` larger than 100% and animated `background-position` to sweep the
  gradient across, but never set `background-repeat: no-repeat` — the default
  `repeat` tiles the gradient, and since each tile's gradient runs from transparent
  back to transparent with no easing *between* tiles, the seam where one tile ends and
  the next begins renders as a hard straight edge riding along with the animation.
  Added `background-repeat: no-repeat` to both rules; confirmed via computed style
  that `background-repeat` now resolves to `no-repeat` on both.
- Validation: `npm run build`, `npm run tokens:check` pass clean (no TS changes).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 real Food Scientist photo

- The Wildcard card's stand-in (`career-neurosurgeon.jpg`, an OR/surgical shot) was
  visibly wrong for "Food Scientist" — user supplied a real photo (a food-science lab
  scene: pipette, jars, produce) via a pasted image, saved to
  `public/images/career-food-scientist.jpg` and wired into `Explore.tsx`'s `CARDS`
  array in place of the surgeon photo. The now-unused `career-neurosurgeon.jpg` asset
  was left in place (not referenced anywhere, but not deleted either).
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified the new photo crops well in the card at its `168/240` aspect ratio,
  with the holo border/sheen still intact around it.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 real per-card matching, brighter cards, deck polish, extra reply

- **Match no longer always resolves to Investment Banking.** Per direct request, the
  celebration screen now shows whichever card was actually liked (new `matchedCard`
  state holding the real `CARDS` entry, replacing the old `likedMatched` boolean).
  Passing all three without ever liking one still needs to end somewhere, so it falls
  back to matching whichever card was last on screen — the only remaining "soft" rule.
  Connect's thread ("How do you get an internship at a bank?", Marcus at Goldman
  Sachs) was intentionally left as-is since it wasn't in scope of this request; it will
  read as bank-specific even if the visitor actually matched with Operations or
  Project Manager. Flagging this as a known follow-up, not fixed here.
  `career-chief-executive.jpg` was also replaced with a user-supplied higher-res
  version of the same photo.
- **Scrim gradients lightened** on both the top card and the celebration screen — the
  darken zone now starts around 55-58% down the card instead of 40-42%, so most of the
  photo stays visible instead of the card reading as near-black. Same fix applies to
  both spots since they shared the same gradient stops.
  the previous 42px/18px per direct feedback that the swipe/pass targets were too
  small.
- The card stack now actually reads as a stack: peeking cards behind the top one got a
  bigger offset/scale step, a visible border, and less opacity falloff (was washing out
  almost invisibly). Added a `mkt-match-card-enter` keyframe animation (not a
  transition — the top card is a fresh DOM node each time due to `key={card.key}`, so
  only an `animation` reliably restarts on mount) so the newly-promoted top card slides/
  scales in instead of popping into place instantly after a swipe.
- Explore's Food Scientist card now uses a real user-supplied photo
  (`career-food-scientist.jpg`) instead of reusing the surgeon stand-in, which had
  already been flagged as an obvious mismatch.
- Connect got a third reply (Priya, Grade 12, reusing the now-unused
  `career-neurosurgeon.jpg` as an avatar crop) per direct request that there was room
  for one more. This initially relied on the comments list's internal
  `overflow-y-auto` scroll to fit the third reply — corrected right after, per an
  explicit "nothing should scroll inside the graphics other than Explore" rule: removed
  the scroll entirely and tightened the Post section and each comment row's
  padding/gaps/font sizes instead, so all three replies fit outright within the frame
  at both mobile and desktop widths. Verified via `scrollHeight <= clientHeight` at
  both 375px and desktop widths.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: passing Investment Banking then liking Operations correctly shows
  "You're matched! Operations" (not the old fixed outcome), the top-card scrim is
  visibly lighter, peeking cards read as a distinct stack, the promoted card slides in
  smoothly, and Connect shows all three replies (scrolling to the third when needed).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 compact sections for Build/Connect, fixed Connect's stretch-and-center

- Root cause of "huge gap scrolling past Build without interacting" and "huge blank
  space above/below Connect's comments": both symptoms came from forcing
  content-driven chapters (a short question; a post + a few comments) into the SAME
  full-viewport-tall section and frame that Match/Explore/Play need for their big photo
  cards. Shrinking just the inner frame (tried first) didn't help — the section itself
  was still `min-h-dvh`, so the dead space just moved from "inside the frame" to "the
  section's own vertical-centering slack." Added a `compact` prop to `ChapterShell`
  that Build and Connect now pass: the section drops from `min-h-dvh` to
  `min-h-[62dvh]`, and the graphic frame from `min(74dvh,680px)` to
  `min(50dvh,460px)`. Match/Explore/Play don't pass it and are visually unchanged —
  confirmed via screenshot.
- Separately, Connect's card had its own bug compounding the "big blank space"
  complaint: the card div used `h-full` (stretch to fill the frame) and, from the
  previous round's no-scroll fix, the replies column had `justify-center` — the
  combination meant any leftover height between a short comment thread and a much
  taller frame became blank padding **inside the glass card**, not just empty page
  background around it. Removed `h-full` (now `max-h-full` only, sizes to actual
  content) and the `justify-center` on the replies column, matching how Match/Explore's
  own cards already size to content rather than force-stretching.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at 375px: Build's gap to Match is now proportionate instead of a
  near-full extra screen, Connect's card is content-sized with no internal dead space
  and still fits all 3 replies with zero scroll (`scrollHeight <= clientHeight`
  confirmed), and Match's card is untouched (still full-size).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 responsive reply count for Connect, fixed CTA-adjacency gap

- Root cause of "cropping out on desktop" (user sent a screenshot from
  `dreamari.vercel.app` showing Jordan's reply cut off mid-box): `--mu` (the font/
  spacing scale every chapter uses) is driven by the graphic frame's WIDTH, but the
  frame's HEIGHT cap doesn't scale to match — so a wide-but-not-especially-tall
  viewport (e.g. 1440×900) gets a bigger `--mu` (bigger text/padding, taller content)
  than a narrower/taller one, while the frame's height budget stays fixed. At that
  combination, 3 replies needed ~549px but the frame only had 450px, and the card's
  `max-h-full` + `overflow-hidden` silently clipped the excess instead of showing it or
  scrolling.
- Rather than pick a breakpoint by guessing, made the reply count self-measuring:
  `Connect.tsx` now renders `REPLIES.slice(0, visibleReplies)`, where `visibleReplies`
  starts at 3 and a `useLayoutEffect` drops it by one (floor of 2) whenever the card's
  true content height (`scrollHeight`, unaffected by the clip) exceeds the frame's
  actual available height (`frame.clientHeight`) — verified before paint, so there's no
  visible flash of the overflowing state. A `resize` listener resets the attempt to 3
  on every resize, so a taller/narrower viewport gets the third reply back
  automatically. This directly implements the "reduce to two / add one back if there's
  room, be responsive" instruction without a hardcoded height breakpoint.
- Separately, "the You're ready section looks weird" traced to `HowItWorks.tsx`: since
  Connect (and Build) now use the shorter `compact` section from the previous round,
  the CTA block right after Connect started with almost no gap, reading as one run-on
  block. Added `pb-8 sm:pb-12` to the chapters wrapper so there's real breathing room
  before the CTA begins, without touching `FinalCTAs.tsx` itself (shared by the Schools
  variant elsewhere).
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at 1440×900 (where the crop reproduced): reply count now
  self-corrects to 2 with `scrollHeight <= clientHeight` confirmed (no crop), Jordan's
  full reply text renders and its bottom edge sits inside the card, and there's now a
  ~245px gap between Connect's card and the "You're ready" heading. At 375px mobile,
  all 3 replies still fit with no crop and no blank space (measured `fits:true`, exact
  height match, matching the previous round's mobile result).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 fixed Match's swipe glitch, flip/swipe interaction, Explore scroll trap

- **Match's swipe "glitch"** ("the card behind loads again like a glitch, then a dark
  overlay happens") was a real structural bug: the top (interactive) card and the
  peeking cards behind it were two SEPARATE JSX blocks/render paths. When a swipe
  removed the front card, the card that had been peeking at depth 1 didn't get updated
  in place — it unmounted from the peeking block and a brand new element mounted in
  the top-card block instead, jumping straight from a faded/bordered/no-scrim peeking
  look to the full-strength scrim+text top-card look with no transition between the
  two. Refactored to a single map over `stack.slice(0, 3)` keyed by `card.key`, where
  each card's transform/opacity is a continuous function of its depth (0/1/2) — the
  same DOM node now animates smoothly from depth 1 to depth 0 instead of unmount/
  remount. Only depth 0 gets the scrim, poster text, swipe badges, and pointer
  handlers. Removed the now-unnecessary `mkt-match-card-enter` mount animation.
  **Follow-up bug caught during verification**: the refactor's DOM order put the front
  card first and the peeking cards after, and later DOM siblings paint on top by
  default with no z-index set — so the peeking cards were rendering OVER the top card,
  ghosting through as a double-exposure image. Fixed with explicit `zIndex: 3 - depth`.
- **Tap-to-flip was a dead end**: `onCardPointerDown` had `if (exiting || flipped ||
  !top) return`, which blocked STARTING any new interaction whenever the info panel
  was already showing — so there was no way to tap back to the poster, or swipe
  like/pass while flipped. Removed the `flipped` condition from that guard. Verified:
  tap flips to the info panel, tap again flips back, and swiping right while the info
  panel is showing correctly commits the match.
- **Career titles are now uppercase everywhere**: the celebration screen's title
  (`matchedCard.title`) and the tap-to-flip info panel's title had no `uppercase`
  applied (the info panel's wrapper explicitly sets `normal-case`, which was
  overriding it) — both now force uppercase directly. Match's top-card poster title
  and Explore's card titles were already uppercase via an ancestor class.
- **Explore reduced from 4 to 3 cards** per direct request — dropped Human Resources/
  Stretch (the middle-of-the-spectrum one), keeping Accountant/Strong Match,
  Management Analyst/Match, and the Food Scientist Wildcard.
- **Explore's scroll nudge replaced**: the bouncing chevron icon (`.mkt-explore-nudge`)
  is gone; the existing tease-scroll-and-settle effect is now the whole nudge, made
  slower and more pronounced (86px over 900ms eased, holds, settles back over 700ms)
  via a small custom `animateScrollTop` helper — native `scrollTo({behavior:"smooth"})`
  doesn't give reliable control over duration across browsers, and the ask was
  specifically for a slow, deliberate "the next card is peeking" motion rather than a
  quick bounce.
- **Fixed Explore's feed trapping page scroll** ("scroll up again while on the card,
  the page doesn't scroll up" / "messes up the scroll of the page"): nested scrollable
  containers on touch devices (and to a lesser extent, wheel/trackpad) don't
  automatically hand a scroll gesture back to the parent once the inner one hits its
  boundary — iOS Safari in particular keeps routing an entire touch gesture to
  whichever scroller it started on. Added `touchmove`/`wheel` listeners on
  `.mkt-explore-track` that detect "already at this boundary, gesture still pushing
  that direction" and manually forward the delta to `window.scrollBy` instead of
  letting the feed absorb it. Verified via direct scrollTop/window.scrollY
  measurement: scrolling down from the feed's bottom boundary now advances the page
  into Connect, and scrolling up from the top boundary advances it back toward Play.
- A mid-session note: the dev server's Fast Refresh state became corrupted after many
  rapid edits this session (stale closures throwing `ReferenceError`s for variables
  renamed/removed several rounds ago, e.g. `likedMatched`), which also made the browser
  tool's click actions hang. Cleared `.next` and restarted the dev server to recover;
  worth doing proactively if click actions start timing out mid-session again.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified on a fresh dev server + fresh tab: swipe stack transitions
  smoothly with no ghosting, tap/tap-back/swipe-while-flipped all work, celebration
  and flip-panel titles are uppercase, Explore has exactly 3 cards, and the scroll
  boundary handoff moves the outer page correctly in both directions.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Connect's real crop floor, sequenced Explore nudge, faster auto-scroll

- **Connect was still cropping** on a real wide-but-short desktop window even after the
  previous round's fix — `MIN_VISIBLE_REPLIES` was hard-floored at 2, so once the
  measurement determined even 2 replies didn't fit, it just stopped there and let the
  overflow clip instead of dropping further. Lowered the floor to 1 (still a real,
  substantive reply — Marcus's answer — rather than an empty-looking post). Verified
  by force-reproducing the crop at 1920×750: it now correctly drops to 1 reply with
  `scrollHeight <= clientHeight` confirmed (no crop), whereas the same viewport would
  have stuck at a cropped 2 before this fix.
- **Explore's nudge, take two**: the single tease-scroll wasn't reading as "solved" —
  per direct feedback, a physical peek and a static arrow were fighting each other
  when shown together, and the user didn't want the nudge to feel "permanent" (i.e.
  always in the way) or to sit where it overlapped the card's own title/industry/stats
  text. Restructured into two sequential beats instead of one: the existing peek-scroll
  plays first and fully settles back, and only THEN does a small down-arrow fade in —
  positioned at the card's vertical midpoint (`top: 56%`) rather than near the bottom,
  since every card's text lives in the bottom ~30% and the photo itself has nothing at
  the midpoint on any of the three cards. Still disappears entirely (unmounted, not
  just hidden) the instant the reader scrolls the feed themselves.
- **Auto-scroll delays cut down** per direct feedback that the wait after each
  interaction was too long: Build 900ms→400ms, Match 2200ms→950ms, Play 2000ms→950ms.
  Each new value is sized to the actual feedback animation plus a small buffer (Match's
  celebrate bounce + text fade settles by ~0.8s, Play's burst/glow settles by ~0.8s,
  Build's check-in transition is ~0.2s), not an arbitrary "let them admire it" pause on
  top of that.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: Connect's 1-reply floor at 1920×750 (measured, no crop), Explore's
  arrow appearing only after the peek settles and sitting clear of card text, and
  Build's pick advancing to Match within ~1s of tapping (down from ~2s+).
- A second occurrence of the dev-server Fast-Refresh/browser-tool-hang issue from the
  previous entry came up again mid-session (click actions timing out); a fresh tab
  recovered it each time without needing another full server restart.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 removed the per-chapter alternating background

- User-reported screenshot showed a hard background-color seam sitting right behind
  Build's "+ 12 more interests" line — `ChapterShell` had an `altBackground` prop that
  alternated chapters between the page background and `var(--card)` (Match and
  Explore had it, Build/Play/Connect didn't), and the previous round's `compact`
  section height made Build noticeably shorter, putting that pre-existing seam right
  behind trailing content instead of in empty space below it. Per direct feedback
  ("can it not just flow organically? keep the same background everywhere") this
  wasn't just a compact-mode edge case — the alternating background itself was the
  thing to remove. Deleted `altBackground` entirely (prop, default, and the
  conditional style) from `ChapterShell.tsx`, and dropped the `altBackground` line
  from `Match.tsx` and `Explore.tsx`'s `ChapterShell` calls. All 5 chapters now share
  one continuous background with no per-section seam anywhere.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: scrolling from Build straight into Match now shows no background
  break at all.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 frame hugs content instead of capping it; conic-gradient holo border

- **Root-caused "why does Connect fit 2 replies on mobile but not desktop"**: `--mu`
  scales off the graphic frame's WIDTH (capped at ~480px on both), so text/padding
  sizes end up the same on mobile and desktop once both are wide enough — but the
  frame's HEIGHT was a fixed `compact` ceiling (`min(50dvh, 460px)`) that has nothing
  to do with width, so the same content needed more vertical room at desktop's larger
  mu than the ceiling allowed, while mobile's smaller mu (since its narrower frame
  never reaches the 480px width cap) let more fit under the same-ish budget. Direct
  ask was to stop fighting this with a JS reply-count workaround and instead make the
  frame **hug its content** — implemented in `ChapterShell.tsx`: `compact` chapters now
  get `height: auto` (with `maxHeight` only as a generous safety net,
  `min(72dvh, 620px)`) instead of a fixed height, and the compact section dropped its
  `min-h-[62dvh]` entirely in favor of just its own padding. Removed Connect's whole
  `visibleReplies`/`useLayoutEffect` measurement system from the previous two rounds —
  no longer needed, since the frame just grows to fit all 3 replies now. Verified at
  1920×750 (the viewport that broke it before): frame height matches card height
  exactly, all 3 replies present, `fits: true`.
- **Wildcard holo border reworked** per direct feedback that it was "too slow and
  disappears for quite a bit": the old version animated `background-position` across
  an oversized, non-repeating `linear-gradient`, so only a slice of the 6-color
  sequence sat inside the border at any moment — as that slice drifted across a
  same-ish-hue stretch, the border visibly dulled for a beat. Replaced with a
  `conic-gradient` rotated via an animated `@property` custom angle: a conic gradient
  wraps the FULL color sequence around the shape at all times, so rotating it changes
  *where* each color sits, never *how much* of the spectrum is showing — the
  "disappears" complaint structurally can't happen anymore. Sped up 5s → 2.2s. Added a
  second layer, `.mkt-holo-aura` — the same rotating gradient, blurred and enlarged
  (`inset: -10px`, `blur(18px)`), sitting behind the card as a soft glowing halo
  bleeding past the edges, with a slight animation-delay offset from the border so the
  glow doesn't feel perfectly glued to the ring.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: Connect shows all 3 replies with the frame exactly matching card
  height at both 1440×900 and the extreme 1920×750 case, Build's layout is unaffected,
  and the Wildcard card now shows the full color spectrum continuously with a visible
  glowing aura around it.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 locked Explore's feed to vertical-only touch scrolling

- Reported as "scrolling within the card goes side to side and vertical, like a free
  scroll to anywhere / dragging the contents." `.mkt-explore-track` had no explicit
  `touch-action`, so the browser's default (`auto`) let touch gestures pan in any
  direction rather than committing to vertical-only scroll the moment a `overflow-y-
  auto` + `scroll-snap-type: y` feed is touched. Added `touch-pan-y` (Tailwind utility
  for `touch-action: pan-y`), matching the same fix already used on Match's card.
  Confirmed via computed style that `touchAction` now resolves to `pan-y`.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Explore rebuilt as a committed TikTok/Reels-style carousel

- `touch-pan-y` (previous entry) turned out to make vertical `touchmove` events
  non-cancelable in some browsers, which broke an earlier `preventDefault`-based
  scroll-forwarding approach for handing off scroll at the feed's first/last card to
  the adjacent chapter. Rather than patch that forwarding again, `Explore.tsx`'s whole
  feed was replaced: no native scroll/`scroll-snap` at all now, just a custom
  index-based carousel (`activeIndex` + a continuous `dragPx` for live drag/peek)
  driving `translateY`/`scale`/`opacity` per card via `requestAnimationFrame`-eased
  math, per direct request for "TikTok/Reels" one-card-per-gesture paging instead of
  free scroll with snap.
- Peek visibility required a real discovery: cards rendered at the container's full
  size leave zero overlappable pixels for a neighbor to peek into, regardless of
  z-index (two edge-to-edge same-size cards never share a visible boundary strip).
  Fixed by rendering every card `GUTTER_FRACTION` (9%) shorter than the container top
  and bottom, so there's genuine empty space for a neighbor's sliver to occupy — the
  focused card still fills that inner band exactly, so its own edges are never
  affected.
- The carousel's `commit()` function IS the boundary handoff now — committing past
  index 0 or the last index calls `scrollIntoView` on `#play`/`#connect` directly, no
  separate touchend-detection layer needed.
- Real bug found and fixed during this round's verification: the wheel handler had no
  `preventDefault()`, and React's `onWheel` prop has been passive by default since
  v17 (calling `preventDefault` inside it silently no-ops) — a single trackpad swipe
  was committing the carousel's own index **and** letting the native page scroll
  advance through the scroll-snap sections at the same time, which is almost
  certainly what looked like "a two-card jump" in earlier manual testing. Fixed with a
  plain non-passive `addEventListener("wheel", ..., {passive:false})` on the track
  purely to call `preventDefault`, leaving the existing `onWheel` prop's commit logic
  untouched. Re-verified: single wheel gesture now advances exactly one card, and
  boundary handoff to Play/Connect no longer overshoots into the CTA section.
- The Wildcard's blurred aura glow (added in the previous round) was reported as
  getting clipped by the track's necessary `overflow-hidden`. Tried three fixes in
  order: (1) an unclipped sibling layer outside the track — bled past the whole
  chapter frame into Connect below it; (2) back inside the clipped track with a
  track-level `mask-image` fade — faded the *other* two cards' own left/right photo
  edges too, and still cut hard on the card's left/right (the track has zero
  horizontal margin the way it has a vertical gutter, so there's no room to fade
  into); (3) killed the aura glow entirely per direct instruction ("if you can't fix
  it, kill the glow"). The rotating conic-gradient border + diagonal sheen sweep
  (both unaffected by any of this) are the Wildcard's whole "rare pull" treatment now
  — uniform on all four edges, nothing bleeding past the frame.
- Also rounded the two plain cards' corners (`calc(var(--mu) * 17px)`, matching the
  Wildcard's own inner radius) — they'd been rendering as sharp-cornered rectangles
  since `ExploreCardBody` is a bare fragment with no wrapping element to round;
  `CardFace` now wraps the non-Wildcard path in a rounded `overflow-hidden` div too.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: single-card-per-gesture wheel commit with no overshoot, correct
  boundary handoff to Play (up) and Connect (down) at the first/last card, peek
  visibility on both neighbors, rounded corners on all three cards, and the
  Wildcard's border/sheen rendering with no glow artifacts leaking past the frame.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Hero subhead: force the second sentence onto its own line

- The hero's two-sentence subhead ("Build, match, play, explore, and connect, all in
  one place. One clear step at a time.") was one plain text node, so its wrap points
  were whatever the browser's line-breaking happened to land on at a given width —
  at some widths that left the second sentence's last couple of words orphaned alone
  on their own line. Split into two `<span className="block">` elements, one per
  sentence, so each sentence always starts its own line regardless of viewport width;
  each still wraps internally on its own if it's ever too long for the line.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at desktop and mobile (375px) widths.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 all four interactive chapters reset and replay on every scroll-back

- Direct request: every chapter's demo (and Explore's nudge specifically) should
  start over and replay each time the reader scrolls back onto it, not just once
  ever. `usePlayingOnScroll` (`scrollHooks.ts`) previously exposed `everPlayed`
  (sticky true forever after the first reveal) — fine for a one-time entrance fade,
  useless for "reset on every revisit." Added a `visitId` counter, returned as the
  hook's new 4th tuple element, that increments every time the IntersectionObserver
  reports the section entering view (unlike `everPlayed`, this changes on every
  single visit, including the first).
- Each chapter with its own interactive state (Build's picked interest, Match's
  swipe deck/celebration, Play's picked scenario option, Explore's carousel
  position/nudge) was split into an outer component (still owns `ChapterShell` +
  the `usePlayingOnScroll` call) and an inner `*Demo`/`ExploreCarousel` component
  holding all of that local state, mounted as `<XDemo key={visitId} />`. Remounting
  via key is the standard React pattern for "reset all local state when X changes"
  and was the correct fix here — a first attempt just called the state setters
  directly inside a `useEffect(() => setX(null), [visitId])` and was rejected by
  this repo's `react-hooks/set-state-in-effect` eslint rule (calling setState
  synchronously inside an effect body is flagged as an error, not a warning); a
  fresh mount's own effects already replay any entrance sequence without ever
  calling setState from a change-triggered effect.
- Explore's nudge effect no longer depends on `graphicRevealed`/`scrolled` — since
  `ExploreCarousel` now remounts fresh every visit, a plain mount-time effect
  (deps: `[containerHeight]` only) already replays the sequence each time; a new
  `scrolledRef` mirrors the `scrolled` state so the chained setTimeouts can still
  bail out cleanly if the reader interacts partway through, without needing
  `scrolled` in the dependency array (which would otherwise skip the whole
  sequence once it's already true). Also shaved the nudge's initial delay from
  900ms to 650ms per direct feedback ("start a few ms sooner").
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check`, and
  `eslint` on all five touched files all pass clean (one pre-existing
  `react-hooks/refs` error in `Explore.tsx` predates this change — confirmed via
  `git stash` that it's already present on `main` before this commit, unrelated to
  this work).
- Not yet browser-verified end-to-end: this session's browser tab got stuck with
  `document.hidden === true` (confirmed via a manual `IntersectionObserver` probe
  that never fired a single callback, not even its mandatory initial one),
  which is a page-visibility artifact of the tool's tab, not the app — Chrome
  throttles/suspends `IntersectionObserver` for hidden documents, and this would
  block the SAME reveal/replay mechanism for all five chapters equally, not just
  the new code. Restarting the dev server, clearing `.next`, and opening multiple
  fresh tabs did not clear it. The remount-via-key implementation itself follows a
  standard, well-established React pattern and needs no exotic runtime behavior to
  work correctly once the tab is genuinely visible/focused — flagging for whoever
  picks this up next to do a quick manual scroll-away-and-back check on each
  chapter before considering this fully closed.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 landing-page copy refresh + Build/Match/Explore/Play/Connect UX pass

- Copy pass for tomorrow's meeting, plus a batch of direct UI/UX feedback across
  four chapters. Scope: `Hero.tsx`, `FinalCTAs.tsx`, and all five `HowItWorks`
  chapters except Connect's core copy (untouched) — no other route touched.
- Hero: "Start my journey" → "Start Journey" (now matches the bottom CTA's own
  label); "Scroll" hint → "Scroll Down To Learn More".
- Bottom "You're ready" CTA (`StudentFinalCTA`): dropped the secondary "See how it
  works" ghost button per direct feedback ("we don't need it... one clear CTA").
  `CTABlock`'s `secondary` prop is now optional so `SchoolsFinalCTA` (which still
  wants both of its own buttons) is unaffected. Left Hero's own separate "See how
  it works" button alone — it's a different instance, not in scope here.
- Build: the "Question 3 of 7 / Choose your interests" step now sits inside its
  own bordered glass card (previously floated loose in the section, reading as not
  obviously "one step of 7"). Same card recipe as Connect's post card
  (glass-surface-3 + blur + a `var(--c)`-tinted glow) for visual consistency —
  `var(--c)` resolves to each chapter's own accent since `ChapterShell` sets it
  from the `color` prop. Renamed the old `EXAMPLE` constant to `CLICKABLE`: only
  "Business & Money" is clickable now, Tech and Health show a hover color change
  (via a small `hovered` state, since the background is otherwise driven by inline
  styles that plain Tailwind `hover:` classes can't override) but do nothing on
  click, so the rest of the storyboard's fixed path still makes sense no matter
  what a reader tries.
- Match: `CARDS` reordered to Operations first, then Investment Banking, then
  Project Manager (previously Investment Banking led). The nudge text is now a
  two-beat guided sequence keyed off whichever card is actually on top (not
  `likedCount`/`stack.length` as before) — "Swipe left to see it's not a match"
  while Operations is up front, "Swipe right to see a match" once Investment
  Banking is. To guarantee the deck can only ever end matched with Investment
  Banking: liking Operations (`onExitTransitionEnd`, `exited.key === "ops"`) just
  advances the stack instead of setting `matchedCard`; passing Investment Banking
  (`onCardPointerUp`, `top?.key !== "iba"` guard) is silently absorbed rather than
  dismissing the card, so it springs back instead of ever being passable. Removed
  `likedCount` state entirely (nothing reads it anymore). The Like/Pass buttons
  lost their `onClick` per direct feedback ("don't have the button actually
  pressable") — visually identical, swipe-only now. Heart icon path replaced with
  a hand-authored solid thumbs-up (less Tinder-like per feedback).
- Explore: added a left-side up/down chevron button pair (mirroring the existing
  right-side action rail, but real controls wired straight into `commit()`) plus a
  persistent "Swipe up/down or use arrows" hint pill, since a swipe-only feed
  doesn't intuitively read as "like a FYP feed" to everyone.
- Play: `SCENARIO` copy replaced — Christina (VP) introduces Marcus, the Managing
  Director, ahead of a big pitch tomorrow; three new options (role/deadline, start
  slides, wait for a teammate) with new short positive-feedback response lines,
  matching the existing illusion-of-choice tone (no wrong branch to build). Kept
  the existing artwork — no new image asset was supplied for this scenario.
- Connect: rebuilt as a two-screen flow. Screen 1 is a new Community Overview
  card ("Students Interested in Business & Money", a horizontal 1,987/212/123
  Students/Professionals/Posts stat row, an "Enter Community" button) shown by
  default; clicking it reveals Screen 2, the pre-existing post/comment card.
  Extracted a shared `CardShell` component so both screens use the exact same
  glass-card recipe. Screen 2 also picked up two smaller, separately-requested
  fixes: a "Community Board" kicker label at the top (so the card reads as a
  public post, not a private message) and Maya's tag changed from "Grade 10" to
  "Howard University · Sophomore" (a college sophomore asking about landing a
  bank internship is more realistic than a high schooler asking the same). Local
  `screen` state lives in a new `ConnectDemo` component, keyed by `visitId` (same
  reset-on-revisit pattern as the other four chapters) so scrolling back onto
  Connect always starts back on the Community Overview screen.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same one pre-existing `react-hooks/refs` error in `Explore.tsx`,
  unrelated to this work).
- Browser-verified via DOM/text inspection and `.click()` on real buttons (Build's
  lock behavior, Explore's nav buttons, Connect's screen transition) — this
  session's browser tab was stuck reporting itself hidden to the page (see the
  previous entry), which blocks synthetic PointerEvent drag/swipe gestures
  specifically (confirmed: neither a raw `dispatchEvent(new PointerEvent(...))`
  nor a CDP-driven `left_click_drag` produced any pointer events on the target
  element at all, while plain `.click()` calls worked reliably). Match's new
  guaranteed-ending swipe logic was therefore verified by code review rather than
  a live drag test; every click-based path verified live successfully.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Explore nudge reliability/speed fix, dropped auto chapter-jump, Build "+more" consolidated, Explore stat row never wraps

- Explore's peek+arrow nudge was reported as "doesn't always work and too slow."
  Root cause: the nudge's `useEffect` depended on `containerHeight`, and
  `ResizeObserver` can fire more than once while the frame's layout settles
  (scroll-into-view physics, container-query recalculation) — each firing tore
  down the in-flight chained-`setTimeout` sequence via the effect's cleanup, so a
  resize landing mid-peek or mid-settle cancelled the animation with `dragPx` left
  mid-flight and the sequence never actually finished. Fixed by making the effect
  mount-only (`deps: []`) and reading `containerHeight` through a ref
  (`containerHeightRef`, kept in sync by its own tiny effect) instead, with a
  50ms-interval retry (`begin()`) until a real measurement exists — once the
  sequence actually starts, nothing can tear it down early except unmounting or
  the reader interacting. Also cut every duration in the chain (900/700/700ms →
  500/400/200ms, initial delay 650ms → 350ms): the arrow now reliably appears in
  ~1.7s instead of ~3.6s, confirmed across several repeated page reloads.
- Committing past Explore's first/last card used to auto-scroll into Play/Connect
  — per direct feedback this felt like being launched somewhere unasked for.
  `commit()` now just stops at the boundary card; `goToPrevChapter`/
  `goToNextChapter` were removed as they're no longer referenced anywhere.
- Build: consolidated the three per-option "+more" chips (added earlier this
  session) plus the old "+12 more interests in the full assessment" text into a
  single "+ more" chip below the options row, per direct feedback that per-option
  chips were clutter. The post-selection state ("{selected} noted...") is
  unchanged.
- Explore's salary/major stat row (`ExploreCardBody`) used `flex-wrap`, which let
  the two stats wrap onto separate lines on narrower cards when the major name was
  long ("Business Administration"). Per direct feedback they must always sit side
  by side. Switched to `flex-nowrap` + `min-width:0` on each stat item (a flex
  item's default `min-width:auto` refuses to shrink below its content's natural
  width, which is what was forcing the wrap in the first place) + a
  `text-overflow: ellipsis` truncation capped at `calc(var(--mu) * 72px)` on the
  value text, so an overlong value truncates instead of ever breaking the layout.
  Verified via `getBoundingClientRect()` on both stat spans (same `top` value,
  i.e. same line) and visually via screenshot at both desktop and 375px mobile
  widths, on the Management Analyst card specifically (the longest major).
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
- Pushed to `origin/main` with explicit user authorization (this entry covers both
  this round and the previous round's changes, pushed together).

### 2026-08-16 Explore cards use each career's own world font + color, per the design system

- Direct request to pull Explore's card fonts/colors from the real design system
  (Figma's Career Poster Card component, node 2403:244) instead of one-size-fits-
  all values. Checked the component's actual per-world token values via
  `get_variable_defs` and `get_design_context` on two of its "World" variants:
  Business, Money, Sales & Office uses Viaoda Libre Regular for the poster title
  and `--world-business-money-office` (#ffb81f) for the industry-line color;
  Science & Research specifically uses a DIFFERENT poster-title font — Source Code
  Pro SemiBold — and its own `--world-science-research` (#00c8dc) color. The
  component's own usage note confirms this is deliberate: each of its 13 "worlds"
  carries its own poster-title typeface, not one blanket font for every card.
- Explore's `ExploreCardBody` was applying a single hardcoded `--font-poster`
  (Viaoda Libre) to every card's title regardless of industry, and a literal
  `color: "#ffb81f"` to every card's industry line — coincidentally correct for
  the two Business & Finance cards, but wrong for Food Scientist (Science &
  Research), which should never have looked like a Business & Finance card
  typographically. `--world-business-money-office`/`--world-science-research`
  were already correctly defined in `tokens.css` from an earlier round; added a
  new `--font-poster-mono: "Source Code Pro", monospace` alongside the existing
  `--font-poster`, and loaded the actual webfont (weight 600 only — the only
  weight this design system variant uses) by appending
  `&family=Source+Code+Pro:wght@600` to the existing Google Fonts `<link>` URL in
  `fonts.ts` (this project loads fonts via a plain stylesheet link rather than
  next/font/google, which broke specifically on Vercel's build — see that file's
  existing comment). A new `WORLDS` lookup in `Explore.tsx` maps each card's
  `industry` string to its `{ color, font, weight }`, and `ExploreCardBody` now
  reads the title's `fontFamily`/`fontWeight` and the industry line's `color`
  from that lookup instead of hardcoding either.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified via computed style: Food Scientist's title now measures as
  `"Source Code Pro", monospace` at weight 600 with its industry line at
  `rgb(0, 200, 220)`; Accountant's title still measures as `"Viaoda Libre", serif`
  at weight 400 with its industry line at `rgb(255, 184, 31)` — confirmed
  unchanged. Also screenshot-verified visually.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Explore nav buttons repositioned, Play rebuilt as an immersive RPG scene, mascot visibility

- Explore's left-side up/down nav buttons went through two iterations this round.
  First attempt moved them into their own row BELOW the card (mirroring how Match
  budgets a button row below its own card) — rejected; direct feedback wanted them
  specifically on the LEFT side, stacked vertically, just genuinely outside the
  card's bounds rather than overlapping the photo. Final version: the whole
  carousel is now a flex ROW (button column, then the card), not a flex column.
  The card itself no longer uses `flex-1` for its own sizing (a row's flex-grow
  and an aspect-ratio's derived width would fight over the same horizontal axis) —
  it just uses `h-full` + `aspectRatio` directly, same as the original single-child
  version, with `max-w-full` as a safety cap.
- Play was substantially rebuilt per direct feedback ("the image is the least
  visible part, it's supposed to be an immersive simulation experience like an
  RPG... elevate it to look amazing") against a reference screenshot of a
  visual-novel-style choice screen (full uncovered art on top, a separate opaque
  panel below with a dialogue bubble and lettered A/B/C choice rows). Adapted the
  structure to this app's dark theme rather than cloning the reference's light
  panel: the scene image is now a real, unobscured `flex-1` region (previously it
  was a full-bleed background under a heavy dark gradient PLUS a translucent
  blurred panel covering most of it — the actual bug behind "least visible part"),
  and the interaction area below it is a genuine opaque `var(--card)` surface
  (`flex-none`, sized to its own content) rather than glass laid over the art.
  Added a chat-bubble treatment for the scene text and a leading arrow icon per
  option row. Two follow-up corrections: the first pass used a fixed image/panel
  percentage split, which clipped the third option on shorter viewports — fixed by
  making the panel `flex-none` (sizes to its own real content height, so it can
  never be clipped) and the image `flex-1` (absorbs whatever's left), plus
  tightening every padding/gap/font-size in the panel so its natural height stays
  comfortably small; and the reference's lettered A/B/C badges were tried, then
  removed per direct feedback, leaving just the arrow to signal "tap to choose."
- Mascot: `VISIBLE_FRACTION` (Mascot.tsx) raised from 0.63 to 0.7 per direct
  feedback ("I don't see enough of it") — 0.63 was deliberately calibrated to stop
  exactly at the mouth's own top edge (y=63.5% in the source artwork) so literally
  none of it showed; 0.7 does let the very top of the mouth peek in now, a
  conscious tradeoff since more of the character actually visible was judged worth
  it. Updated both hardcoded `37%` transform offsets (the resting position and the
  scroll-driven exit) to `30%` (= 1 − 0.7) to match, and Hero.tsx's reserved
  `paddingBottom` multiplier from `.63` to `.7` so the copy above still never
  overlaps the taller visible mascot (these three numbers aren't a shared import,
  they have to be kept in sync by hand — noted in both files' comments).
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified at both desktop and 375px mobile widths: Explore's button
  column sits outside the card at both sizes, Play shows the full scene plus all
  three options with no scrolling and no clipping (picking an option correctly
  shows its feedback text + "Try again"), the mascot shows noticeably more of
  itself without looking broken, and Connect/Build's earlier changes were spot-
  checked on mobile too since this was a broader "make sure this all works on
  mobile" pass.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Match buttons re-enabled, Explore nav reverted to below-card, Play mobile text floor

- Match's Like/Pass buttons had been made decorative-only (no `onClick`) in an
  earlier round specifically so the guided tutorial could only be experienced via
  a real swipe. Direct feedback asked for them to work again — re-added
  `onClick`, using the exact same guards the swipe path already has: Like always
  calls `act("like")` (the "no match on Operations" rule lives downstream in
  `onExitTransitionEnd`'s own `exited?.key === "ops"` check, so it applies
  regardless of trigger source); Pass only calls `act("pass")` when
  `top?.key !== "iba"`, mirroring `onCardPointerUp`'s own guard, so passing
  Investment Banking via the button is still a no-op — the deck still can only
  ever end matched with Investment Banking, tap or swipe.
- Explore's nav buttons went back to a row below the card (this chapter's THIRD
  layout for these buttons this session) — the left-side button-column version
  from the previous entry made the card sit off-center in a lopsided way that
  looked wrong specifically on mobile, per direct feedback. Back to the
  flex-column-with-flex-1-card structure from two rounds ago (card on top, button
  row below in normal flow, same shape as Match's own row).
- Play's panel font sizes (tightened significantly two rounds ago specifically so
  nothing would clip) were flagged as too small on mobile — root cause: `--mu` is
  a container-query value off the frame's own width, which shrinks toward its 1.0
  floor on a narrow phone, so mu-scaled text has no real minimum size. Switched
  every panel font-size from plain `calc(var(--mu) * Npx)` to
  `clamp(minPx, calc(var(--mu) * Npx), maxPx)`, giving mobile a genuine readable
  floor (e.g. the prompt headline floors at 14px, option labels at 13px) while
  leaving desktop's sizing unchanged. Since the panel is `flex-none` (sized to its
  own content) and the image above it is `flex-1` (absorbs whatever's left), a
  taller panel on mobile automatically means a proportionally smaller image there
  too — exactly the trade-off directly confirmed as acceptable ("okay if we
  shrink it a bit for mobile too").
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified: Match's Like button correctly matches Investment Banking,
  Pass correctly no-ops on it; Explore's card is centered again with buttons
  below at both desktop and mobile widths; Play's option-label/headline computed
  font sizes hit their 13px/14px floors on a 375px viewport with the card's
  `scrollHeight === clientHeight` (confirmed no overflow/clipping).
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Explore: swiping past the last/first card on mobile no longer gets stuck

- Reported: after reaching the last card in Explore's feed, a mobile reader could
  no longer scroll to the next section at all — the track has
  `touch-action: none` (needed so it can fully own every drag gesture itself,
  rather than fighting a native scroll the way `touch-pan-y` did earlier this
  project — see that fix's own note about non-cancelable touchmove events), which
  on a phone leaves literally no free screen space for a plain scroll gesture to
  land on once the carousel has captured the touch. Desktop never had this
  problem — a wheel/trackpad gesture still works over the rest of the page even
  while the track's own wheel listener has captured one scroll — so the earlier
  "stop auto-jumping at the boundary" fix (a few rounds back) only actually
  trapped mobile readers, not desktop ones.
- Fix is scoped specifically to the touch/drag path, not wheel: `onPointerUp` now
  checks whether the committed swipe is already at the boundary card in that
  direction, and if so calls `goToPrevChapter()`/`goToNextChapter()` (re-added,
  scrollIntoView on `#play`/`#connect`) instead of a no-op; `commit()` itself and
  the wheel handler are untouched and still just clamp at the edge with no jump.
  This isn't a reversion of the earlier "don't auto-launch me" feedback — that
  was about ANY input (including incidental wheel scroll) silently launching
  navigation; this only fires on a genuine, deliberate, threshold-exceeding swipe
  commit specifically at the edge, the same gesture strength that already moves
  between cards mid-deck, and only for the one input method that can otherwise
  leave a reader with no way to proceed at all.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error). Live
  drag-gesture verification was blocked by this session's browser tab
  intermittently reporting itself "hidden" to the automation tool (a recurring,
  previously-documented tool quirk, not a code issue) right as the test was
  attempted; confirmed via DOM inspection that the carousel reaches the last card
  correctly and the rest of the logic is unchanged from the already-verified
  commit()/onPointerUp code paths, with only the boundary branch added.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Explore: boundary jump made uniform again (wheel included)

- The previous entry's assumption — "desktop never gets stuck because the
  wheel/trackpad still works over the rest of the page" — turned out to be
  wrong: it only holds if the reader's cursor isn't already sitting on the
  card itself. Direct feedback: "I still get stuck there if my mouse is on top
  of the last card and I scroll down." Hovering the graphic and continuing to
  scroll down hits the SAME captured, non-passive wheel listener, and with
  `commit()` only clamping at the boundary there was nowhere for that scroll to
  go — desktop readers could get just as stuck as mobile ones, just via a
  different, easy-to-hit precondition (cursor position) instead of an
  unavoidable one (screen space).
- Removed the split from the previous entry: the boundary-jump
  (`goToPrevChapter()`/`goToNextChapter()`) now lives inside `commit()` itself
  again, so it fires identically for wheel, touch, and the nav buttons — this is
  the same shape `commit()` had several rounds ago, before it was first narrowed
  to "never jump, any input" and then to "jump only on touch." `onPointerUp` goes
  back to simply calling `commit()` on both directions with no special-casing of
  its own.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error). Live
  verification was blocked again by the same recurring `document.hidden`
  tool-tab quirk (confirmed directly this time: a manual check read
  `document.hidden === true` on the active tab, and a dispatched synthetic wheel
  event plus a direct button click at the boundary card both failed to trigger
  `scrollIntoView`'s smooth-scroll animation, consistent with how this same
  condition has previously suppressed IntersectionObserver callbacks, CSS
  transitions, and pointer/touch event delivery elsewhere this session — not a
  code defect). Confidence here rests on this being a straightforward
  simplification back to a structure that WAS verified working earlier in the
  session, not new untested logic.
- Not yet independently re-verified live on a real device/browser as of this
  entry — worth a manual spot-check (scroll wheel with the cursor directly over
  Explore's last card, and a real touch swipe on a phone) next time this app is
  opened somewhere the automation tooling isn't fighting itself.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Match's guided cards locked to one swipe direction, Explore's redundant arrow removed

- Match: per direct feedback ("don't let people swipe right on it, lock swiping
  to the instructions"), Operations now blocks a right-swipe/Like outright
  rather than just neutering its outcome after the fact — `onCardPointerUp`'s
  threshold check gained a `top?.key !== "ops"` guard (mirroring the existing
  `top?.key !== "iba"` guard on the pass/left-swipe side), and the Like button's
  `onClick` got the same guard. Each guided card is now locked to the single
  direction its own on-screen instruction actually shows: Operations only ever
  demos "swipe left," Investment Banking only ever demos "swipe right." Since
  liking Operations can no longer happen via any path, the dead-code branch in
  `onExitTransitionEnd` that used to catch and neutralize it (added when this
  was only a soft, post-hoc block) was removed — every "like" that reaches there
  now is a real match, no special-casing needed.
- Explore: removed the second-beat down-arrow nudge (`showArrow` state, the
  `mkt-explore-arrow` JSX block, and its now-unused keyframes in
  `animations.css`) per direct feedback that it was redundant — the persistent
  "swipe up/down or use arrows" hint pill and the two visible arrow buttons
  already communicate the same thing. The first-beat physical peek (the next
  card sliding up and settling back) is untouched.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified: clicking Like on Operations is confirmed a real no-op (the
  top card, checked via textContent, stays Operations with no match); the
  `.mkt-explore-arrow` element no longer exists anywhere in the DOM. Pass-on-
  Operations (unchanged code, already verified working in an earlier round)
  couldn't be re-confirmed this round — the same recurring `document.hidden`
  tool-tab condition was active again, which blocks the CSS transitionend that
  `onExitTransitionEnd` depends on; confirmed via a direct `document.hidden`
  check rather than assumed.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-06 hero copy pass (superseded by the full rebuild above)

- Date: 2026-08-06
- Active branch: `v2`
- Main branch: pushed this session with explicit user authorization (see below)
- Objective: apply the final approved copy to the public landing hero on `v2`, remove all
  unapproved visible hero terms, and verify the responsive result. Build, Match, How It
  Works, Career Report, and the post-onboarding Home are outside this copy-only pass.

## 2026-08-06 hero hierarchy redesign (position/size only, no copy changes)

- Rebalanced the landing hero's visual hierarchy so the career-promise headline ("Discover
  your dream career.") is the largest, dominant element instead of DREAMARI. Per UX audit
  (NN/g 3-second clarity test, semantic H1 weight, familiarity-first sequencing), a brand
  name larger than the value proposition asks a first-time visitor to parse an unfamiliar
  term before learning what the product does or promises.
- Reordered the Student/Enterprise toggle above the DREAMARI + headline group (a
  PayPal-style "Personal/Business" pattern), because the toggle is a mode selector about to
  gate which hero variant renders (Enterprise page in progress), not a caption for the
  brand block beneath it.
- Grouped DREAMARI and the headline into one nested block, separated from the toggle by
  extra margin — reads as one brand-to-promise unit (Gestalt proximity) instead of three
  ungrouped stacked lines.
- DREAMARI is now a `<p>` kicker (was previously the dominant title) directly above the
  `<h1>` headline; kept solid, uppercase, wide-tracked, and using `font-display` (Favorit)
  exclusively — no change to which font renders where.
- Trimmed `RoleToggle.tsx` pill padding/min-height slightly; a button still needs a real tap
  target, so DREAMARI's own font-size (`clamp(1.375rem, 2vw + 1vh, 2.25rem)`) was bumped
  instead of shrinking the toggle further, to close most of the remaining visual-weight gap.
- Copy is byte-for-byte unchanged from the approved list; only element order, tag, and
  size/spacing values changed in `src/components/hero/HeroSection.tsx` and
  `src/components/hero/RoleToggle.tsx`.
- Validation passed: `npm run tokens:check` (503 tokens), `npm run lint`, `npx tsc --noEmit`,
  `npm run build`. Browser-verified at 1280px desktop, 768×1024 tablet, and 320×700 mobile
  with no horizontal overflow or layout regressions.
- Pushed to `v2` then to `main` with explicit user authorization (see commit hash below).

### 2026-08-06 follow-up: spacing refinement

- User feedback after the initial push: DREAMARI/headline read too loose against each
  other, and the toggle read too close to that group given it's a separate control.
- Tightened the DREAMARI-to-headline gap to near zero (`gap-0 sm:gap-0.5`) so the two read
  as a single unit, and moved the toggle's separation from the shared outer column gap into
  its own explicit `mb-2 sm:mb-3` wrapper, independent of the other sibling gaps in that
  column (so ScrollNudge-to-toggle and group-to-paragraph spacing were unaffected).
  `src/components/hero/HeroSection.tsx` only; `RoleToggle.tsx` unchanged this pass.
- Re-ran the full validation suite (`tokens:check`, `lint`, `tsc`, `build`) and browser
  re-verified desktop and 320×700 mobile; DREAMARI now sits tight against the headline and
  the toggle has clearly more room below it. Pushed to `v2` then `main` with explicit
  authorization.

### 2026-08-06 hero reverted to DREAMARI-dominant per UIKIT Figma reference

- User directive: match the approved UIKIT Figma hero
  (`d8j3JbtVojSgVOqsjGpcZM`, node `1036:39072`) with DREAMARI as the single largest
  element on screen, sized appropriately and responsively — overriding the earlier
  headline-dominant UX redesign above.
- DREAMARI is again the dominant `<h1>` (`font-display`, `clamp(3rem, 6.5vw + 2vh, 7rem)`,
  ~48–112px) with the career-promise headline demoted to a smaller `<h2>`
  (`clamp(1.75rem, 2.2vw + 1.1vh, 3rem)`, ~28–48px) below it — roughly a 2.3x size ratio at
  every viewport, matching the Figma reference's proportions. The toggle-above-brand-group
  ordering and its extra separation margin from the earlier session are unchanged.
- Added a partial gradient on the headline ("dream career." in `brand-100`→`brand-600`,
  "Discover your " plain white) matching the Figma reference's two-tone treatment, using
  existing semantic brand tokens (no new colors introduced).
- The Figma reference's top header nav (Explore / Missions / For schools / "Get started
  free") was intentionally NOT reproduced — those are unapproved terms already removed
  from this hero earlier in the shared workflow. Only the toggle → DREAMARI → headline →
  paragraph → CTA structure and sizing ratio were adopted from the reference.
- Fixed a `ScrollNudge` overlap bug (reported after this change, but present before it
  too, on any sufficiently short viewport): it was `absolute inset-x-0 bottom-0` inside the
  centered flex-1 content group, pinned to that group's own bottom edge rather than the
  viewport. On short viewports (or once DREAMARI grew taller) that edge could coincide with
  the CTA button, visually overlapping it. Changed `ScrollNudge` to a normal in-flow last
  child instead of an absolutely-positioned one, so it always stacks below the CTA with the
  column's existing gap and can't overlap a sibling regardless of container height.
  Verified no overlap at 1280×720, 1280×600, 768×1024, and 320×700.
- Validation passed: `tokens:check` (503 tokens), `lint`, `tsc --noEmit`, `build`.
  Browser-verified at desktop, 1280×720, 1280×600, 768×1024, and 320×700 (no horizontal
  overflow at 320px) plus a manual click-through confirming the Scroll control still
  advances to How It Works.

## Completed

- Updated the public landing hero to the final approved copy: Student / Enterprise,
  dominant “DREAMARI” title, smaller “Discover your dream career.” headline, the confirmed
  Build/Match/Play/Explore/Connect summary, “One clear step at a time.”,
  “Start my journey”, and the existing Scroll chevron.
- Removed the former Explore, Missions, For schools, Get started free, Teacher, and legacy
  supporting sentences from the visible landing hero. The visual system and route behavior
  remain unchanged; page metadata now uses the approved summary.
- Changed only the two How It Works CTA labels from “Start building →” to the approved
  “Start my journey”. All other How It Works copy and behavior remain unchanged.
- Refined the landing hero hierarchy without changing copy: DREAMARI is solid white with
  controlled uppercase tracking, while “Discover your dream career.” is one clear type
  tier above the descriptive paragraph. The former multi-stop title gradient was removed.
- Installed the supplied licensed `FavoritExtraBoldC.woff2` locally and made
  `fontFamily.display` the semantic source for the hero display style. Only DREAMARI uses
  Favorit; the secondary headline, body, controls, and application UI remain Montserrat.
- Removed the landing page's otherwise-empty header/duplicate wordmark. Enlarged the
  secondary promise and applied a restrained brand-blue gradient across the whole line;
  DREAMARI remains solid white to preserve the brand → promise → explanation hierarchy.
- Made the Student/Enterprise switch slightly more compact, added deliberate space before
  the title group, and tightened the spacing between DREAMARI and its career promise.

- Preserved the former remote `v2` at `codex/v2-backup-before-token-alignment-20260805`.
- Synchronized `v2` exactly to `main` commit `6dd1370` before token work.
- Baseline ESLint and TypeScript checks passed.
- Baseline production build reached Google Fonts and failed only because the initial sandbox denied network access; the final network-enabled build passed.
- Replaced the stale single token export with light/dark primitives, light/dark semantics, and components collections targeting DTCG 2025.10.
- Added generated CSS/TypeScript artifacts and dependency-free token validation.
- Wired existing CSS variables, Build-step accents, Match category colors, and How It Works chapter colors to generated artifacts without changing rendered values.
- Classified viewport formulas, canvas animation math, SVG/illustration paint, crop geometry, and keyframe geometry as documented implementation constants rather than misleading portable tokens.
- Official DTCG 2025.10 JSON Schema validation passed for all five files.
- `npm run tokens:check` passed: 438 tokens across both modes, aliases, composites, descriptions, path parity, generated-artifact freshness, and required text contrast.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed.
- Browser verification passed with no console/framework errors. Local production matched deployed `main` on homepage and opening Build flow at 1280×633 and 390×844; observed screenshot differences were limited to expected animation timing.
- Light/dark semantic switching and the Welcome → Choose Your Path interaction passed.
- Reworked the responsive How It Works scroll sequence on `v2`: phone/tablet gestures
  advance exactly one snap stage at a time, focused stages remain parked until the next
  gesture, and the upcoming stage remains visible as a blurred handoff.
- Added a dedicated CONNECT exit interval before the finale. Browser measurements at
  390×844 and 768×1024 confirmed the finale is 0% opaque at the CONNECT snap, then
  CONNECT is 0% opaque at the fully revealed finale snap.
- Scoped document snapping to the active How It Works viewport so fresh homepage loads
  remain at the hero instead of jumping to BUILD. Desktop remains free-scrolling.
- Responsive How It Works validation passed across BUILD → MATCH → PLAY → EXPLORE →
  CONNECT → finale, one gesture per state, with no skipped Explore/Connect stages.
- Extended the same one-gesture stage snapping to desktop wheel/trackpad input. At
  1280×800 the verified sequence is BUILD → MATCH → PLAY → EXPLORE → CONNECT → finale,
  with consecutive gestures and no swallowed intermediate stage.
- Added tablet-specific content geometry instead of inheriting desktop minimums. At the
  compact 687×787 breakpoint the rail ends at x=44, content begins at x=105, CONNECT
  ends at x=584, and right-aligned stages keep a 32px outer margin. Titles,
  descriptions, icons and the progress rail no longer overlap.
- Added `CHANGELOG.md` covering the design-token migration, responsive How It Works
  interaction, collaboration workflow, and validation performed for the main release.
- Added `/career-report` as a responsive frontend-reference route using the Dreamari token
  system, dark/light modes, sticky active-section navigation, report-version controls,
  download/share actions, and the approved Replit report copy.
- Connected successful completion of the sole Match path to
  `/career-report?from=match`. There is deliberately no visible skip-to-report shortcut;
  `/career-report` remains directly addressable only for design review.
- Added a short post-Match preparation state and four optimised Dreamy expression assets
  from the user-supplied ZIP packs.
- Career Report validation passed at 390×844, 768×1024, and 1280×800 with no horizontal
  overflow or browser console errors. ESLint, TypeScript, `npm run tokens:check`, and the
  final production build all pass.
- Removed the Dreamy cloud mark from the temporary Career Report header. The remaining
  wordmark/header is intentionally minimal until the new navigation/header/footer system
  is designed and implemented.
- Removed the Career Report's avoidable page-local color literals and mapped its surfaces,
  text, borders, feedback states, shadows, and accents to the generated semantic tokens.
  Future visual work must follow the same token-first rule.
- Reworked the hero title into two deliberate lines and moved all four high-value actions
  above the fold. Simulation/Explore are visually primary; Download/Share are grouped as
  report utilities and repeat at the conclusion for long-scroll task completion.
- Added accessible Download and Share dialogs with focus trapping, Escape/backdrop close,
  focus return, print-ready Save-as-PDF guidance, copy/native/email fallbacks, and loading,
  success, cancellation, permission, and unavailable-print error handling.
- Replaced the generic report wait with four visible assembly stages, reduced-motion
  timing, a Dreamy interruption state, safe retry, and preserved-Match reassurance.
- QA routes: `/career-report?from=match` exercises assembly; add `&state=error` to exercise
  the first-attempt failure and retry path. These states are for frontend review only.
- Browser verification passed at 390×844, 768×1024, and 1280×800 in light/dark modes,
  including canonical-link copy feedback, print feedback, modal keyboard dismissal and
  focus return, assembly completion, simulated failure, retry recovery, zero horizontal
  overflow, and no browser console errors.
- Completed a section-by-section responsive audit and removed the Career Report's main
  density and legibility problems. Reach, Good fit, and Safe choices now use substantial
  cards; Strong Options uses three intentional full-width rows instead of an orphaned
  grid item; school metadata, role descriptions, certification detail, and report-history
  text use a more legible type scale.
- Gave Academic Strengths, My Plan, and conclusion Dreamy assets dedicated layout space.
  No illustration is absolutely positioned over live copy, and the report conclusion
  keeps its approved copy unchanged inside a separate content column.
- Final responsive browser verification passed at 320×700, 390×844, 768×1024, 1024×768,
  and 1280×800 with no horizontal overflow or current console/framework warnings. ESLint,
  TypeScript, `npm run tokens:check`, and the network-enabled production build pass.
- Removed the “Report actions” label from both action groups. Download and Share are now
  48px icon-only utility controls with accessible names and native hover titles, separated
  from the Play and Explore CTAs by a responsive divider; both still open their complete
  accessible dialogs.
- Added `/home` as the post-onboarding student launchpad, using Figma desktop node
  `790:35798` as the content/style source of truth and mobile node `745:36522` for
  responsive behavior. Figma was used only as a visual reference; code tokens remain the
  implementation source of truth.
- Implemented the featured Product Manager story, four quick actions, Continue Your
  Journey, Recommended for You, daily glossary challenge, Popular with Explorers,
  Mystery Unlocks, and the personalised sponsored Mars challenge in the source order.
- Added working desktop Play/Explore/Community controls and a persistent mobile
  Home/Explore/Play/Community/Profile tab bar. The Explore tab scrolls to recommendations,
  Play/Home returns to the featured story, challenge completion adds feedback and a
  disabled success state, and streak acknowledgement provides live confirmation.
- Added a Home icon beside the Career Report Dreamari wordmark and a “Go to Launchpad”
  hero CTA. The Dreamari wordmark still links to `/`; both new entry points link to
  `/home`.
- Added 13 generated cinematic career images, one character and one clear work setting
  per image, with diverse global representation. Optimised them to WebP (about 1.2 MB
  total versus 23 MB of source PNGs).
- Design QA is recorded in `design-qa.md`. Combined source/implementation evidence is in
  `work/home-design-qa-desktop-final.png` and `work/home-design-qa-mobile.png`; the final
  result is passed after correcting the initial oversized desktop hero title.
- Student home verification passed at 390×844, 768×1024, 1280×720, and 1440×900 with no
  horizontal overflow. Career Report → Home, tab navigation, quick actions, challenge
  completion, streak feedback, ESLint, TypeScript, `npm run tokens:check`, and the
  network-enabled production build pass.
- Follow-up card fidelity pass uses UIKIT node `793:36808` as exact truth. The reusable
  standard card now measures 427×336 with a 180px image and 156px
  `surface-match-card` body, matching badge/duration/title/description/metadata/CTA
  placement. Focused 1:1 evidence is `work/home-card-design-qa-final.png`.
- All career sections now use streaming-style carousels with partial-card previews,
  horizontal touch scrolling, snap points, edge-aware Next/Previous controls, and a
  restrained Netflix/Prime-style hover/focus expansion. Desktop verification moved the
  Recommended rail from `0 → 113 → 0`; mobile moved one 336px step with no page overflow.
- The featured hero now matches the 100% Figma composition: full-bleed beneath navigation,
  520px desktop/470px mobile height, no rounded shell or eyebrow, single-line desktop
  title/description, CTA beside a bar-plus-percentage with its scene label below, centered
  pagination, and compact 72px text-only Quick Actions.
- Product Manager uses `product-manager-hero-v2.webp`, a 1915×821 restrained cinematic
  campus panorama. The carousel advances every 5.5 seconds even while hovered, retains
  dots/arrows and reduced-motion handling, and card images fade into the semantic
  `surface-match-card` body instead of ending at a hard seam.

## Remaining external check

- The production app repository's `packages/ui/tokens` was not available here. Before adopting these paths in production, compare them against that canonical collection and run `packages/ui/scripts/validate-tokens.mjs`; production wins on any conflict.

## 2026-08-05 post-onboarding Launchpad alignment

- Added `src/components/student-app/StudentAppShell.tsx` as the shared post-onboarding shell
  for `/home` and `/career-report`. It owns the Dreamari wordmark/context, explicit Home,
  Explore, Play and Community desktop navigation, Profile entry, XP, theme control, mobile
  tabs, and the restrained Dream Horizon brand signature.
- `/home` now identifies itself as Home instead of visually aliasing Home to Play. Its large
  saturated Quick Actions are replaced by a quieter “Your next moves” command area with
  task context, and a separate career-signal panel explains the recommendation logic.
- Recommended for You is now an intelligence-led surface rather than another equal-weight
  rail. Existing content, card anatomy, View All deep links, challenge, popular, mystery,
  sponsored, light/dark, and carousel behaviour are preserved.
- The featured-story carousel has a visible pause/resume control. All three hero images are
  intentionally eager because they rotate above the fold. Home query state is parsed by the
  server route and passed as stable initial state, preventing category deep-link hydration
  mismatches without touching any onboarding flow.
- `/career-report` now uses the same shell, bottom navigation, horizon, surface hierarchy,
  typography and control language as the Launchpad. The approved report copy, report section
  navigation, Dreamy moments, preparation/error states, report version controls, Download,
  Share, Play, Explore, and Launchpad actions remain functional and unchanged in meaning.
- Explicit boundary audit: no marketing homepage, How It Works, Build, Match, flow content,
  or onboarding component was modified. The only route file changed is `/home/page.tsx` to
  supply stable query state to the post-onboarding client experience.
- Visual evidence is under `work/launchpad-v2-qa/`. Browser QA passed at 320×700, 390×844,
  768×1024, and 1440×1000 in light/dark modes with `scrollWidth === innerWidth`. Hero pause
  and resume state, report Share modal open/close, and route navigation pass with no current
  console warnings or errors.
- `npm run tokens:check` passes all 501 DTCG tokens. ESLint, `npx tsc --noEmit`, and the
  network-enabled Next.js production build pass.

## 2026-08-05 launchpad token and theme alignment

- `/home` is now wrapped in the shared `ThemeProvider` and exposes a semantic header theme
  control. Dark remains the default outside Build; the user's saved `dreamari-theme`
  preference continues to win across routes.
- The launchpad component contains no direct primitive color references. It consumes
  `color.action`, `color.category`, `color.feedback` and generated `component.home-*`
  contracts for its shell, navigation, cards, rails, Quick Actions, hero and feature panel.
- `build-tokens.mjs` now merges `components.tokens.json` into both light and dark outputs,
  which makes preserved component aliases available to web consumers without flattening
  the source JSON. The dependency-free validator passes 501 tokens across all five files.
- Every browsable rail has a View All plus chevron action. Deep links use
  `/home?tab=explore&category=journey|recommended|popular|mystery` and restore the relevant
  collection when reopened.
- Accepted light/dark evidence is under `work/home-theme-qa/`; `design-qa.md` remains
  `final result: passed`.

## 2026-08-05 Match readability and homepage scroll recovery

- Match-card description text now uses a responsive `clamp(13px, 4% of card size, 16px)`
  value. Browser checks measured 13px at 390×844 and 14.67px at 1280×800; the longest
  approved copy fits its reserved panel with no clipping or page overflow.
- How It Works now enters an explicit upward-exit state when the user scrolls or swipes
  above BUILD. Mandatory snap is disabled during that exit instead of repeatedly pulling
  the page back to the first chapter, and normal snapping resumes on downward re-entry.
- Browser-tested the full return path from the focused sequence to the hero at 390×844
  and 1280×800. `npm run tokens:check` and ESLint pass. The production build is otherwise
  clean but could not finish in the restricted environment because `next/font` could not
  reach Google Fonts to download Montserrat.
- Match hierarchy keeps the percentage in its original position beside the bar and
  separates liked-card status plus the save threshold onto the supporting row. The
  temporary `Card N of 5` label has been removed. Progress and toast feedback expose
  appropriate ARIA semantics.
- The card-size formula now includes a `100vw - 48px` guard outside the desktop/height
  reduction. At 320×700 the card width remains 272px, the progress panel stays on one row,
  and the page has no horizontal overflow. Audit evidence and notes are saved under
  `work/match-hierarchy-audit/`.
- Match feedback is positioned relative to the decision column above its 52px action
  row. At 320×700 the Undo toast overlays only the card's decorative lower edge and no
  longer blocks either action; the complete three-Like/two-Pass path reaches Path Saved.
- The `MATCHES` eyebrow is removed from all Match decision screens. `Computer Science`
  and the progress panel shift upward, while `--match-card-height` adds the recovered
  22–28px to the card only. At 320×700 the front card is 272×294; at 390×844 it is
  316.7×338.8; at 1280×800 it is 366.7×392.3. The 20px gaps above and below the deck are
  unchanged and all three viewports remain free of page overflow.
- Match title hierarchy is now intentional rather than equal: the path header scales at
  `0.068 × card width`, weight 700, semantic `text.secondary`; the active card title
  remains `0.078 × card width`, weight 800, white. Measured pairs are 18.5/21.2px at
  320px, 21.5/24.7px at 390px, and 24.9/28.6px at 1280px.
- Match progress support copy uses bounded single-line states: `3 more likes to save`,
  `2 more likes to save`, `1 more like to save`, then `Path saved!`. Both sides are
  `white-space: nowrap`; at 320×700, `4 liked` measures 45.9px and `Path saved!` 69.3px
  inside the 272px panel with no wrapping or page overflow.
- Match feedback is now a compact 32px-high chip using 12px type and 8×14px padding
  instead of the prior 44px/14px treatment. At 320×700, `Skills liked | Undo` measures
  144.7px wide and the worst-case `Earning Potential liked | Undo` measures 220.2px;
  both stay inside the viewport and above, not over, the 52px actions.

## 2026-08-05 Career Report mobile repair

- Scope remained inside Career Report and the shared post-onboarding shell. Build, Match,
  onboarding, and the marketing homepage/How It Works were not changed.
- Report-tab selection now centers the active tab with horizontal `scrollTo` inside the tab
  rail. It no longer uses `scrollIntoView`, which was also moving the page vertically and
  causing anchors to settle on the wrong section.
- The post-onboarding roots use `overflow-x-clip` rather than `overflow-hidden`, restoring
  sticky header and section-tab behaviour while still containing the decorative horizon.
- The temporary report-building and error experiences omit the persistent app bottom tabs
  and use a compact-phone layout. Build progress, Retry, and Return to Match all fit within
  320×700 without document or horizontal overflow.
- Browser QA covered completed section anchors, sticky navigation, Share open/close, build
  progress, and error recovery at 320×700 and 390×844. Evidence is under
  `work/career-report-mobile-fix/`. TypeScript, ESLint, the 501-token DTCG validator, and the
  network-enabled Next.js production build pass.

## Recommended next step

- Design the Enterprise hero variant the Student/Enterprise toggle will soon gate; the
  toggle's current position (above the DREAMARI/headline group) was chosen with this in
  mind, but no Enterprise content exists yet.
- A separate, not-yet-delivered ask: write inline comments on the feedback doc's "Updated
  Copy" excerpt about sizing/positioning rationale (no copy changes) — distinct from the
  hero redesign above and still outstanding.
- Review the open local `v2` Home and Career Report previews. Apply requested refinements,
  then commit and push only when explicitly requested.
- If the post-onboarding direction is accepted, the next design decision is whether Explore,
  Play, and Community should become separate route surfaces or remain category states inside
  the reference Launchpad. Do not apply the shell to Build or Match without a new explicit
  request.
- The external production task remains to compare this reference token set with the app
  repository's canonical `packages/ui/tokens` before production adoption.

## Shared rule

Only one AI edits at a time. The active AI pulls the authorized branch, reads this file, completes and validates its scoped work, updates this file, commits, and pushes. Neither AI pushes or merges `main` without explicit user authorization.

The DTCG token collections and generated artifacts are the visual source of truth for all
future UI. Reuse semantic tokens and shared components whenever a matching foundation
exists; do not introduce page-local palettes or duplicate design constants. Run
`npm run tokens:check` before every release, and treat any visual/token drift as a defect.
