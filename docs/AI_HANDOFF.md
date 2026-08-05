# AI handoff

This file records work from the Codex/Claude shared workflow beginning 2026-08-05. It is forward-looking; earlier project history remains in Git commits and each tool's existing context.

## Current session

- Date: 2026-08-05
- Active branch: `v2`
- Main branch: do not change without a new explicit instruction
- Objective: unify and visually verify the post-onboarding Home and Career Report on `v2`,
  then wait for visual approval before any commit or push. Marketing, Build, Match, and How
  It Works are explicitly outside this pass.

## Completed

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
