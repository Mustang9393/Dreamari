# AI handoff

This file records work from the Codex/Claude shared workflow beginning 2026-08-05. It is forward-looking; earlier project history remains in Git commits and each tool's existing context.

## Current session

- Date: 2026-08-05
- Active branch: `v2`
- Main branch: do not change without a new explicit instruction
- Objective: implement and visually verify the post-onboarding student home/launchpad on
  `v2`, then wait for visual approval before any commit or push.

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

## Recommended next step

- Review the open local `v2` student home preview and its responsive rails/interactions.
  Apply any requested refinements, then commit and push only when explicitly requested.
- The temporary header is expected to be replaced when the new navigation/header/footer
  system is designed.
- The external production task remains to compare this reference token set with the app
  repository's canonical `packages/ui/tokens` before production adoption.

## Shared rule

Only one AI edits at a time. The active AI pulls the authorized branch, reads this file, completes and validates its scoped work, updates this file, commits, and pushes. Neither AI pushes or merges `main` without explicit user authorization.

The DTCG token collections and generated artifacts are the visual source of truth for all
future UI. Reuse semantic tokens and shared components whenever a matching foundation
exists; do not introduce page-local palettes or duplicate design constants. Run
`npm run tokens:check` before every release, and treat any visual/token drift as a defect.
