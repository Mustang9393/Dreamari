# Archived: the Classic token set (before 24 October 2026)

Not part of the design system. Do not import, build from, or hand off.

On 24 October 2026 the token files in `design-tokens/` took the Black & Blue values (the app's default look since 19 October 2026). This folder keeps the set they replaced, byte for byte, so the old palette can be recovered:

- the five DTCG files as they stood at the previous commit;
- `design-tokens.generated.css`, the CSS they generated.

The Classic look itself still runs in the prototype behind `?look=v1` and the bottom-left switch (DEMO-ONLY). It is held by `src/app/archive/look-classic.css`, a snapshot of every generated variable that changed, applied only when Black & Blue is off. Delete that file, this folder and the look switch together when Classic is retired.

Why archived rather than kept alongside (Chandu, 24 Oct 2026): "lets not have classic in the token/design system/component library for the new handoff to usman. Keep the classic stuff archived."
