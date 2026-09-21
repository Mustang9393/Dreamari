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
   Chromebooks it reads as an obviously foreign control. This is a whole
   category, not one element -- see "Never let a native OS control leak
   through" below for the full list and the components that replace each one.
6. **The `title="..."` HTML attribute produces the browser's own native
   tooltip**, not a styled one -- a second, worse version of problem #2
   above: it cannot be positioned, cannot be styled, has its own OS-native
   delay and appearance, and (unlike `IconTip`) was never clamped to the
   viewport at all. Icon-only controls already have a house rule to use
   `IconTip` for their label; a bare `title=` attribute on a native element
   is a silent way to violate that rule while looking like you've labelled
   the control. `grep -rnE '<(button|span|div|a|img|input|svg|li|p)\b[^>]*\btitle="' src/components`
   should return nothing (a `title` prop on one of this codebase's own
   components, e.g. `<Section title="...">`, is a different, harmless thing
   -- only a literal HTML element with a `title=` attribute is the bug).
7. **A portalled panel's surface color must actually contrast with
   whatever page it lands on** -- resolving to *some* color isn't the same
   as resolving to a *visible* one. `Listbox`/`DatePicker`'s default panel
   background (the app's own `--card` token) reads fine on the standard
   app background, but the Build flow (`/flow`) paints its own custom
   gradient background instead of that standard one -- so `--card` still
   computed a real, valid hex value there, just one close enough in tone to
   the flow's own background that the panel looked like it had no surface
   at all and bled into the page behind it (direct feedback, 21 Sept 2026:
   "no surface color... clashing with everything"). Confirmed via computed
   style, not assumption -- always check the actual computed
   `background-color`, not just whether the CSS property has a value, when
   a panel "looks transparent." Any page with its own non-standard
   background must pass an explicit `panelStyle` (both components accept
   one) using that page's own solid surface token -- see `LocationStep.tsx`
   and `build/steps.tsx`'s `SelectField` for the pattern.

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

**Never let a native OS control leak through.** The underlying rule behind
`<select>`, `title=`, and the disclosure-triangle case below is the same one:
whenever an element's *visual chrome* is drawn by the browser/OS rather than
by our own CSS, that chrome differs by platform in ways CSS cannot reach --
Mac's version happening to look acceptable is not the same as it being
fixed. Audited and replaced app-wide, 21 Sept 2026:

| Native control | Risk | This app's replacement |
|---|---|---|
| `<select>` | Popup chrome, not stylable at all, on any platform | `src/components/app/Listbox.tsx` |
| `<input type="date">` | Calendar popup AND the closed-state text segments/spinners are OS-chrome, even worse than `<select>` | `src/components/app/DatePicker.tsx` |
| `title="..."` attribute | Native tooltip: unstylable, unclampable, own OS delay/position | `IconTip`/`Tip` (`src/components/app/IconTip.tsx`) |
| `<summary>`'s default marker | A disclosure triangle rendered by the engine, doubling any custom chevron icon, and inconsistent between the old WebKit-specific pseudo-element and the modern standard one | Suppressed globally in `src/app/globals.css` (`summary`/`::-webkit-details-marker`/`::marker` rules) -- every `<summary>` pairs with its own icon instead |
| `<dialog>` | Its default UA styling (border, padding, background) if not fully reset | Already fully reset where used (`GpaField.module.css`'s `.dialog`) -- keep doing this on any new use, don't rely on the element's defaults |
| `alert()`/`confirm()`/`prompt()` | A native, unstylable, blocking browser dialog | None in the app (verified) -- never introduce one; use a Portal-based modal/toast instead |
| `<input type="file">` | Its picker dialog is the OS's own file browser | Not used in the app; if ever needed, this ONE case is a genuine, accepted exception -- opening the user's actual filesystem has no custom-UI equivalent on any platform |

Before adding any new form control or interactive element, check this table
first. If it's not listed and you're unsure whether an element you're about
to use renders OS-native chrome, treat that as a real risk, not a
hypothetical one -- everything in this table looked like a small, standard
HTML element until a real cross-platform report came in.

**Give every hover-only interaction a keyboard/focus equivalent.** This is
already the house rule for icon-only controls (`IconTip`, universal rule);
it also happens to be the fix for touch-stuck hover on Chromebooks, since a
focus-triggered affordance works the same way for touch as for keyboard.

## What to do when you can't reproduce a Windows/Chromebook report

Don't close it as "can't repro, Windows-only, skip." Check it against the
causes above first -- every Windows-only-looking report this repo has had so
far turned out to have a concrete, fixable root cause once traced through
actual code (scrollbar pairing, viewport clamping, a native tooltip/select/
date input, a panel that technically had a background color but not a
visible one) -- not a platform quirk nothing can be done about. The one
confirmed exception is `<input type="file">`'s OS picker dialog (see the
table above) -- that one really is unfixable, because it opens the real
filesystem. If, after checking the code against every rule above, nothing
explains it: ask for the exact OS/browser/display-scale
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
   (`src/components/app/Listbox.tsx`); a date, `DatePicker`
   (`src/components/app/DatePicker.tsx`); an icon-only control's label, a
   `title=` attribute is never acceptable, `IconTip` is. Check the full
   table above if what you're adding isn't one of these three.
5. If that picker/tooltip/panel renders on a page with its own non-standard
   background (not the app's default), check the ACTUAL computed
   `background-color` of the panel in the browser, not just that a CSS
   property has some value -- pass `panelStyle` with that page's own solid
   surface token if the default doesn't visibly contrast. See the Build
   flow example above.
6. If you added a new `DEMO_`/`SHOW_` toggle or other demo-only branch, tag
   the comment `DEMO-ONLY:` (exact casing) and add it to
   `docs/HANDOFF_INDEX.md`'s Demo vs Production section -- see that file for
   the full current list and why this matters for anyone building toward
   production off this repo.
