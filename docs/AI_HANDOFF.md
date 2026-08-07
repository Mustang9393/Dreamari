# AI handoff

This file records work from the Codex/Claude shared workflow beginning 2026-08-05. It is forward-looking; earlier project history remains in Git commits and each tool's existing context.

## Current session

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
