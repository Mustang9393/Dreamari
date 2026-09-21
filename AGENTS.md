<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shared AI handoff

Before editing, read `docs/AI_HANDOFF.md` and inspect `git status` plus recent commits. Only one AI edits at a time. Update the handoff with completed work, validation results, unresolved issues, and the recommended next step before committing. Never push or merge `main` without explicit user authorization.

Importing into the production app (dreamonna): read `docs/DESIGN_SYSTEM_ALIGNMENT.md` first. Take layout, copy and behaviour from `src/`; take token names from the certified Figma export; never import `design-tokens/`.

The W3C DTCG collections and generated artifacts under `design-tokens/` and `src/app/design-tokens.generated.css` are the visual source of truth. New UI must use existing semantic tokens and shared components whenever an appropriate token or component exists; do not introduce page-local color palettes or duplicate design constants. Run `npm run tokens:check` before every release.

## Engineering handoff

Read `docs/HANDOFF_INDEX.md` first: it lists the locked feature specs in `docs/handoff/specs/`, the source-of-truth data files, the full demo-vs-production breakdown (every demo-only flag is tagged `DEMO-ONLY:` in its own code comment -- `grep -rn "DEMO-ONLY" src` is the authoritative list), and the current demo tag. `docs/AI_HANDOFF.md` is a session log; specs win over it.

**Standing rule: document the WHY of every major update** (added 22 Sept 2026, so Usman and anyone else pulling from this repo can follow reasoning without inferring it from screens alone). A major update is a real feature, a behavior change, or a decision that could be second-guessed later -- not routine spacing/copy polish. For those, both the commit message and the matching `docs/AI_HANDOFF.md` entry state the reasoning (what changed, and the concrete feedback/decision that drove it, quoted where there is one) -- not just what changed. Skip the ceremony for small, self-evidently correct fixes; this is for anything someone downstream could reasonably ask "why was this done this way."

## Cross-browser guardrails (read before UI work)

Most students are on Windows laptops or Chromebooks, not Mac -- our dev machines are Mac, and that mismatch has already shipped real, hard-to-reproduce bugs (unpaired scrollbar CSS, unclamped tooltip positioning). Before any layout, scrolling, positioning or icon-only-control work, read `docs/CROSS_BROWSER_GUARDRAILS.md` and run its self-check before calling the work done -- don't rely on your own screen looking right.

## Empty, loading, error and edge-case states (default here first)

Real data will be sparse well before every screen has a bespoke design for its empty/loading/error/edge-case treatment. `docs/COMPONENT_STATES_PLAYBOOK.md` defines the app's default for each situation (a card grid with a locked item, a tab with nothing saved yet, a failed AI call, a title that's too long), grounded in the patterns already shipping elsewhere in the app. Default to it instead of inventing a new treatment or waiting on a design pass; flag what you used it for so it can get a real design pass later.
