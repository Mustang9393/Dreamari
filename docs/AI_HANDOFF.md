# AI handoff

This file records work from the Codex/Claude shared workflow beginning 2026-08-05. It is forward-looking; earlier project history remains in Git commits and each tool's existing context.

## Current session

- Date: 2026-08-05
- Active branch: `v2`
- Main branch: promotion explicitly authorized for this Career Report release
- Objective: remove the cloud mark from the temporary report header, revalidate the
  Career Report, push `v2`, and promote the verified commit to `main`.

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

## Remaining external check

- The production app repository's `packages/ui/tokens` was not available here. Before adopting these paths in production, compare them against that canonical collection and run `packages/ui/scripts/validate-tokens.mjs`; production wins on any conflict.

## Recommended next step

- Verify the Career Report on the new `main` Vercel deployment. The temporary header is
  expected to be replaced when the new navigation/header/footer system is designed.
- The external production task remains to compare this reference token set with the app
  repository's canonical `packages/ui/tokens` before production adoption.

## Shared rule

Only one AI edits at a time. The active AI pulls the authorized branch, reads this file, completes and validates its scoped work, updates this file, commits, and pushes. Neither AI pushes or merges `main` without explicit user authorization.

The DTCG token collections and generated artifacts are the visual source of truth for all
future UI. Reuse semantic tokens and shared components whenever a matching foundation
exists; do not introduce page-local palettes or duplicate design constants. Run
`npm run tokens:check` before every release, and treat any visual/token drift as a defect.
