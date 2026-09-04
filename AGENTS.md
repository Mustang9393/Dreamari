<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shared AI handoff

Before editing, read `docs/AI_HANDOFF.md` and inspect `git status` plus recent commits. Only one AI edits at a time. Update the handoff with completed work, validation results, unresolved issues, and the recommended next step before committing. Never push or merge `main` without explicit user authorization.

Importing into the production app (dreamonna): read `docs/DESIGN_SYSTEM_ALIGNMENT.md` first. Take layout, copy and behaviour from `src/`; take token names from the certified Figma export; never import `design-tokens/`.

The W3C DTCG collections and generated artifacts under `design-tokens/` and `src/app/design-tokens.generated.css` are the visual source of truth. New UI must use existing semantic tokens and shared components whenever an appropriate token or component exists; do not introduce page-local color palettes or duplicate design constants. Run `npm run tokens:check` before every release.
