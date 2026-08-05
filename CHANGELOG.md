# Changelog

Notable changes to the Dreamari frontend reference are recorded here.

## 2026-08-05

### Career report experience

- Added the responsive `/career-report` frontend reference and connected successful
  Match completion to its branded preparation state.
- Reorganised the approved Replit report content into an at-a-glance direction summary,
  a single recommended next move, and progressively deeper profile, career, plan,
  education, certification, version-history, and conclusion sections.
- Added sticky section navigation with responsive active-section tracking, current versus
  baseline report controls, light/dark themes, print-based download, and share feedback.
- Added four optimised Dreamy expression assets from the supplied source packs for
  preparation, exploration, insight, planning, and celebration moments.
- Kept the temporary Career Report header intentionally minimal and removed the Dreamy
  cloud mark so the next navigation/header/footer system can replace it cleanly.
- Mapped Career Report surfaces, text, borders, feedback states, shadows, and accents to
  the shared generated semantic tokens instead of maintaining a page-local color palette.
- Verified the report at 390×844, 768×1024, and 1280×800 with no horizontal overflow or
  browser console errors; ESLint, TypeScript, token validation, and production build pass.

### Design system

- Replaced the flattened prototype token export with five W3C DTCG 2025.10 collections:
  light/dark primitives, light/dark semantics, and component tokens.
- Preserved semantic aliases, composite typography and shadow values, explicit units,
  stable paths, and token descriptions.
- Added dependency-free token generation and validation scripts plus generated CSS and
  TypeScript artifacts consumed by the Tailwind frontend.
- Extracted Build-step accents, Match category colors, How It Works chapter colors, and
  reusable component dimensions from page-level literals.
- Added automated checks covering 438 tokens, light/dark parity, alias resolution,
  descriptions, composites, generated-artifact freshness, and required text contrast.

### How It Works experience

- Added one-gesture stage snapping across desktop, tablet, and mobile while preserving
  the blurred incoming-stage transition.
- Separated CONNECT's exit from the finale so `YOU'RE READY` appears only after CONNECT
  has completely disappeared.
- Added tablet-specific title and description bounds so content clears the progress rail
  and screen edges at compact and standard tablet widths.
- Scoped document snapping to the active section so a fresh homepage visit still opens
  on the hero.

### Collaboration and documentation

- Added `docs/AI_HANDOFF.md` and repository instructions for safe Codex/Claude handoffs.
- Documented the portable-token boundary and the remaining production comparison against
  the app repository's canonical `packages/ui/tokens` collection.

### Validation

- Passed token validation, ESLint, TypeScript, and the Next.js production build.
- Browser-tested the full BUILD → MATCH → PLAY → EXPLORE → CONNECT → finale sequence at
  390×844, 687×787, 768×1024, and 1280×800 without console errors.
