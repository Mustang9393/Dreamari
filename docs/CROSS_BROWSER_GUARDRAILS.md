# Cross-browser / Windows & Chromebook guardrails

Most students use this app on Windows laptops and school Chromebooks, not Mac.
Our own dev machines are Mac. That mismatch has already caused real, shipped
bugs that nobody on a Mac could see or reproduce -- and cost a QA round of
back-and-forth to track down. This file exists so the next bug like that gets
caught before it ships, not after a screenshot comes in from Windows.

Read this before touching layout, scrolling, positioning, or any icon-only
control. If you are an agent working on this repo (including Usman's), treat
this as a checklist to run against your own diff before calling a UI task
done -- not just background reading.

## Why Mac hides bugs that Windows/Chromebook show

1. **Scrollbars take layout space on Windows/ChromeOS, not on Mac.**
   macOS's default scrollbar is an overlay: invisible until you hover, zero
   layout width. Windows and ChromeOS use a classic scrollbar that is always
   visible and reserves real width (~15-17px). Any container styled and
   measured on a Mac with an unstyled scroll area will look fine here and
   show a fat gray bar -- or clip content by that same width -- on Windows.
   This was the root cause of the very first scroller bug this session (the
   Build flow's scrollbar only being hidden on Firefox, not Chrome/Edge,
   because the `-webkit-scrollbar` rule was missing).
2. **Windows display scaling (125%/150%) is the default on most Windows
   laptops**, not an edge case. It shrinks the effective CSS viewport and
   introduces subpixel rounding in anything computed from
   `getBoundingClientRect()`. A tooltip or dropdown positioned with exact
   pixel math and no edge-of-viewport clamping can render off-screen or
   visibly displaced on a scaled Windows display while looking perfect on an
   unscaled Mac display. This is the most likely explanation for two "the
   tooltip is far from the icon" reports we could never reproduce on Mac at
   100% -- see the `IconTip`/`Tip` fix below.
3. **Windows/Chromebook screens and browser chrome are often smaller** than a
   Mac dev display, so triggers that never reach a viewport edge in our own
   testing routinely do on a 1366x768 Chromebook.
4. **Chromebooks can be touchscreens.** Hover-only affordances can get
   visually "stuck" after a tap, since there's no real mouse-leave event.
   Any hover-triggered UI needs a focus/keyboard equivalent already (see the
   icon-tooltip rule elsewhere in this repo) -- that equivalent is also the
   touch-safe path.
5. **Native form controls render with the OS's own chrome**, not the page's.
   A `<select>` popup cannot be restyled by CSS in any browser -- confirmed
   this session, not fixable. On Mac that OS chrome happens to look close
   enough to the app's own design that it went unnoticed; on Windows and
   Chromebooks it reads as an obviously foreign control. **Use
   `src/components/app/Listbox.tsx` instead of `<select>`, always** -- a
   portalled, self-painted dropdown with the same value/onChange/options
   API, matching keyboard behavior (arrows, Enter, Escape, Home/End), and
   built-in responsive bounds (min/max width and height, viewport clamping
   on every edge, repositions on resize/rotation). Every native `<select>`
   in the app was migrated to it 21 Sept 2026; there should be none left --
   `grep -rln "<select" src/components` should return nothing real (comment
   mentions of `<select>` itself are fine).

## The concrete rules

**Never leave a scroll container with the browser's unstyled default
scrollbar.** Every `overflow-y-auto` / `overflow-auto` / `overflow-scroll`
container must use one of:
- `dm-scroll` (`src/components/app/app.css`) -- a thin, deliberately-styled
  6px scrollbar, same look on every platform. Default choice for anything
  where "you can scroll here" should read as obvious (lists, sheets, panels).
- `flow-scroll` (`src/app/globals.css`) -- fully hidden scrollbar, for
  snap/swipe surfaces where the interaction itself (snap points, card
  drag) already makes scrolling obvious, the same reasoning as
  `.foryou-snap` in `src/components/app/app.css`.

Both classes already pair the `scrollbar-width` (Firefox) rule with the
`::-webkit-scrollbar` (Chrome/Edge/Windows/ChromeOS/Safari) rule. **Do not
write a bare `[scrollbar-width:none]` or `[scrollbar-width:thin]` arbitrary
Tailwind property on its own** -- `scrollbar-width` is Firefox-only; every
Chromium browser (which includes Windows Chrome and every Chromebook) needs
the `::-webkit-scrollbar` rule too, or you've silently only fixed Firefox.
This exact mistake shipped twice this session before being caught.

Audit command (run before calling any scrolling UI change done):

```bash
grep -rnE 'className=(\{?[`"][^`"]*\}?)?[^>]*overflow-(y-)?(auto|scroll)' src/components --include="*.tsx" \
  | grep -vE 'dm-scroll|flow-scroll|hide-scrollbar|scrollbar-none|no-scrollbar|foryou-snap'
```

A clean run returns nothing (as of 21 Sept 2026, its one exception is
`src/components/motion-lab/DailyDropDemo.tsx`, an unrouted dev-only rig
preview, not shipped UI).

**Clamp anything positioned with `getBoundingClientRect()` math to the
viewport.** If you compute a fixed/absolute position from a trigger's rect
(a tooltip, a portal-based dropdown, a flyout menu), measure the rendered
bubble after it mounts and shift it back on-screen if it overflows any edge
-- don't trust that a comfortable Mac viewport means there's always room.
`Tip`/`IconTip` (`src/components/app/IconTip.tsx`) does this now: it
clamps horizontally and flips above the trigger when there's no room below.
Any new portal-positioned element should follow the same two-pass pattern
(position once from the trigger rect, then correct after measuring the
positioned element itself in a `useLayoutEffect`) rather than a single
pixel-math calculation with no bounds check.

**Never restyle a native `<select>`.** If a form control needs a custom
look, use a custom listbox/combobox, not CSS on a `<select>` popup -- no
CSS makes that popup match the design system on any platform.

**Give every hover-only interaction a keyboard/focus equivalent.** This is
already the house rule for icon-only controls (`IconTip`, universal rule);
it also happens to be the fix for touch-stuck hover on Chromebooks, since a
focus-triggered affordance works the same way for touch as for keyboard.

## What to do when you can't reproduce a Windows/Chromebook report

Don't close it as "can't repro, Windows-only, skip." Check it against the
five causes above first -- most Windows-only-looking bugs so far have had a
concrete, fixable root cause once traced through actual code (scrollbar
pairing, viewport clamping), not a platform quirk we can't do anything
about. Only the native-`<select>`-styling case turned out to be a genuine,
unfixable platform limitation. If, after checking the code against every
rule above, nothing explains it: ask for the exact OS/browser/display-scale
percentage and a screen recording rather than a static screenshot -- most of
what's unreproducible on Mac is a viewport-size or DPI-scale difference that
a recording of the interaction (not just the end state) will usually surface.

## Self-check before calling a UI change done

1. Run the scrollbar audit command above.
2. Run `npx tsc --noEmit -p .` and `npx eslint <touched files>`.
3. If you added anything positioned via `getBoundingClientRect()`, confirm
   it clamps to the viewport rather than assuming the trigger has room on
   every side.
4. If you added a single-choice picker, it's `Listbox`
   (`src/components/app/Listbox.tsx`), never `<select>`.
5. If you added a new `DEMO_`/`SHOW_` toggle or other demo-only branch, tag
   the comment `DEMO-ONLY:` (exact casing) and add it to
   `docs/HANDOFF_INDEX.md`'s Demo vs Production section -- see that file for
   the full current list and why this matters for anyone building toward
   production off this repo.
