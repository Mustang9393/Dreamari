# Connect UX preview (demo only)

Chandu requested publishing the reviewed Connect UX work only through the main app hamburger menu. This isolated snapshot keeps `/connect` and its current role journeys unchanged while review happens at `/connect-preview?tab=communities`.

Source snapshot: `codex/connect-ux-polish`, commit `0870eb52`. Shared assets and design tokens are not copied. Internal navigation is scoped to `/connect-preview`. The local Listbox and Portal keep the prototype composer behavior isolated from the shipping app.

Keep changes experimental here until the design is approved. Promote selected changes back to the canonical components after approval, then remove this route/snapshot and its hamburger link. The community card design is unchanged. Previous mobile verification gaps are documented in the source branch's CONNECT_UX_POLISH/AI_HANDOFF notes.
