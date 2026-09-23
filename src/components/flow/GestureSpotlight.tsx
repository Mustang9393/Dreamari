"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { BorderBeam } from "border-beam";
import { GestureHint } from "./GestureHint";

// Persists per-device, not per-session -- a drag-to-reorder or drag-to-blank
// mechanic is genuinely non-obvious the first time, but re-showing it on
// every visit would be the "entire modal with written instructions" problem
// this is meant to replace, just moved to every mount instead of the first.
export function useFirstUseHint(key: string): [boolean, () => void] {
  const storageKey = `dreamari:hint-seen:${key}`;
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (!window.localStorage.getItem(storageKey)) setShow(true);
      } catch {
        // Storage blocked (private mode, etc.) -- fall back to not nagging
        // rather than showing the hint every single mount.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);
  const dismiss = () => {
    setShow(false);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Nothing to persist to; the hint just won't reappear this mount.
    }
  };
  return [show, dismiss];
}

// Dims everything on screen EXCEPT a cutout around one real element, with the
// gesture's motion animated right where it needs to happen -- precise
// spotlighting instead of a generic centered modal, for the handful of
// interactions (drag-to-blank, drag-to-reorder) that have zero affordance
// today. A single reusable primitive so each call site stays a few lines,
// not a bespoke overlay each time.
export function GestureSpotlight({
  active,
  targetRef,
  direction,
  label,
  hintSize = 34,
  hintDistance = 56,
  remeasureKey,
}: {
  active: boolean;
  targetRef: RefObject<HTMLElement | null>;
  direction: "left" | "right" | "up";
  label: string;
  /** Size/travel of the animated dot. Defaults suit a full card; pass
      smaller values for a compact target like a list row or a pill. */
  hintSize?: number;
  hintDistance?: number;
  /** Forces a fresh getBoundingClientRect() when the SAME target ref now
      points at a different real element (e.g. a new card became "top") --
      the ref object itself never changes identity, so without this the
      measurement effect would never re-run and the cutout would stay
      locked to wherever the first element used to be. */
  remeasureKey?: string | number;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!active) {
      const timer = window.setTimeout(() => setRect(null), 0);
      return () => window.clearTimeout(timer);
    }
    const measure = () => {
      const el = targetRef.current;
      if (el) setRect(el.getBoundingClientRect());
    };
    const timer = window.setTimeout(measure, 0);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, targetRef, remeasureKey]);

  if (!active || !rect) return null;

  return (
    // pointer-events: none on the whole thing -- purely visual. An earlier
    // version put onPointerDown on this full-screen div to dismiss on tap,
    // which meant it silently ATE the very gesture it was teaching: a real
    // swipe or scroll starting anywhere on screen (including right over the
    // spotlighted card) hit this overlay first and never reached the real
    // element underneath. Dismissal is entirely the caller's job -- flip
    // `active` to false from real gesture handlers.
    <div className="pointer-events-none fixed inset-0 z-[200] motion-safe:animate-[fade-slide-up_0.28s_ease]" aria-hidden>
      {/* No dimming scrim -- the card was never meant to be dimmed, and the
         previous box-shadow: 0 0 0 9999px spotlight trick rendered as a hard
         torn seam across the card on Safari/macOS (reported on a real
         MacBook Pro). Just the gesture's motion and label, on the card. */}
      {/* Right where a real thumb or cursor would actually be: centered on
         the target itself, not floating off it in empty space above/below. */}
      <div
        className="absolute flex flex-col items-center gap-3"
        style={{
          left: rect.left + rect.width / 2,
          top: rect.top + rect.height / 2,
          transform: "translate(-50%, -50%)",
        }}
      >
        <GestureHint direction={direction} color="#ffffff" size={hintSize} distance={hintDistance} />
        <span className="rounded-[var(--radius-sm)] px-3.5 py-2 text-[14px] font-bold whitespace-nowrap text-white" style={{ background: "rgba(0,0,0,0.62)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// A one-time callout that explains a STATIC piece of UI in words -- an icon
// row, a tab label -- rather than a gesture in motion. GestureSpotlight's
// animated dot has nothing to animate for something like "here's what these
// icons do" or "try this other tab," and a full-screen dimming scrim would
// be too heavy for it (survey feedback, 23 Sept 2026: several testers added
// a career to Top 3 or wanted to unsave one and had no idea the icons did
// that; others never noticed the For You tab existed). Pair with
// useFirstUseHint (or an equivalent per-session gate, like
// ExploreSectionTabs' own Schools-tab nudge) so it only ever shows once --
// share the SAME key across every surface teaching the same thing (the For
// You reel and Career Detail both use "action-icons") so whichever one a
// student reaches first is the only one that explains it.
// Minimum breathing room from any viewport edge, and the gap kept between
// the bubble and the real element it's explaining -- never flush against
// either (direct feedback, 24 Sept 2026: "more padding... do not overlap or
// hide other elements").
const VIEWPORT_MARGIN = 16;
const TARGET_GAP = 12;

export function Coachmark({
  active,
  targetRef,
  label,
  onDismiss,
  cta = "Got it",
  spotlight = false,
}: {
  active: boolean;
  targetRef: RefObject<HTMLElement | null>;
  label: string;
  onDismiss: () => void;
  /** "Next" for a step that leads into another coachmark, so a 2-part tour
      (For You -> Schools) reads as one guided moment instead of two
      unrelated hints firing separately (direct feedback, 24 Sept 2026:
      "they should happen in succession"). Defaults to "Got it" for a
      standalone or final-step coachmark. */
  cta?: string;
  /** Dims the rest of the screen with a cutout around the target (direct
      feedback, 24 Sept 2026: "dim the screen a bit... like a spotlight").
      An SVG mask, not GestureSpotlight's old box-shadow spread -- that
      technique specifically rendered as a hard torn seam on Safari/macOS
      (see GestureSpotlight's own comment above); a mask cutout is the
      standard, broadly-supported way to punch a hole in an overlay and
      doesn't share that failure mode. Off by default so every existing
      coachmark (the icon rows) keeps its current no-scrim look; opt in per
      call site. */
  spotlight?: boolean;
}) {
  const maskId = useId();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<{ top: number; left: number; height: number; side: "top" | "bottom"; arrowLeft: number } | null>(null);

  useEffect(() => {
    if (!active) {
      const timer = window.setTimeout(() => setRect(null), 0);
      return () => window.clearTimeout(timer);
    }
    const measure = () => {
      const el = targetRef.current;
      // A hidden (lg:hidden / hidden lg:flex) target reports a zero-size
      // rect instead of null -- treated the same as "not ready yet" so a
      // coachmark never renders pinned to (0,0) for the breakpoint that
      // isn't showing its icon row right now.
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) setRect(el.getBoundingClientRect());
      else setRect(null);
    };
    const timer = window.setTimeout(measure, 0);
    // "resize" alone covers phone/tablet orientation changes too -- rotating
    // fires it the same as dragging a desktop window does.
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, targetRef]);

  // Two-pass placement: `rect` alone isn't enough to keep the bubble on
  // screen, since clamping needs the BUBBLE's own rendered size too, and
  // that depends on how long `label` is and how it wraps at the current
  // width. So the bubble first renders off-screen (visibility: hidden, no
  // flash), gets measured for real, and only then gets its final clamped
  // position -- synchronously, before paint, so nothing visibly jumps.
  useLayoutEffect(() => {
    if (!rect || !bubbleRef.current) {
      setPlacement(null);
      return;
    }
    const bubble = bubbleRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Prefer above the target; flip below only when there's truly not
    // enough headroom AND below has more room to offer -- e.g. a target
    // pinned near the top of a short landscape-phone viewport.
    const spaceAbove = rect.top - TARGET_GAP - VIEWPORT_MARGIN;
    const spaceBelow = vh - rect.bottom - TARGET_GAP - VIEWPORT_MARGIN;
    const side: "top" | "bottom" = spaceAbove >= bubble.height || spaceAbove >= spaceBelow ? "top" : "bottom";

    const idealLeft = rect.left + rect.width / 2 - bubble.width / 2;
    const maxLeft = Math.max(VIEWPORT_MARGIN, vw - VIEWPORT_MARGIN - bubble.width);
    const left = Math.min(Math.max(idealLeft, VIEWPORT_MARGIN), maxLeft);
    const top =
      side === "top"
        ? Math.max(VIEWPORT_MARGIN, rect.top - TARGET_GAP - bubble.height)
        : Math.min(Math.max(VIEWPORT_MARGIN, vh - VIEWPORT_MARGIN - bubble.height), rect.bottom + TARGET_GAP);

    // The arrow stays aimed at the target's real center even when the
    // bubble itself had to shift over to stay on screen -- clamped inside
    // the bubble's own edges so it never pokes out past a rounded corner.
    const targetCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.min(Math.max(targetCenter - left, 16), Math.max(16, bubble.width - 16));

    setPlacement({ top, left, height: bubble.height, side, arrowLeft });
  }, [rect]);

  if (!active || !rect) return null;

  // Dark and nearly opaque, not a light/bright glass -- legibility over the
  // busy photos this sits on beats the glassy look (direct feedback, 24
  // Sept 2026: "the color now is too bright... make it dark so its
  // contrasting"). Still carries backdrop-blur for the sliver that isn't
  // opaque. z-[9999] matches IconTip's own tooltip layer, the highest in
  // the app -- a coachmark explaining a control must never end up UNDER
  // that control's own hover tooltip, a modal, or anything else.
  const bubbleBg = "rgba(6,7,12,0.96)";
  // The arrow renders OUTSIDE BorderBeam on purpose -- BorderBeam clips its
  // own contents to contain the rotating beam, so a caret nested inside it
  // and positioned past its edge (poking out to "point" at the target) was
  // being silently clipped away (direct feedback, 24 Sept 2026: "the
  // pointything... is not properly triggering, they are inside the tooltip
  // and not visible"). As its own sibling in the unclipped outer layer, sized
  // and positioned from the same `placement` math, it always renders.
  const arrowTop = placement ? (placement.side === "top" ? placement.top + placement.height - 5.5 : placement.top - 5.5) : -9999;
  const arrowLeftAbs = placement ? placement.left + placement.arrowLeft - 5.5 : -9999;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {spotlight && rect && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full motion-safe:animate-[fade-slide-up_0.28s_ease]">
          <defs>
            {/* Blurring the cutout shape itself (not the dim layer) turns a
               crisp rounded-rect hole into a soft vignette -- the mask goes
               from black (fully clear) to white (fully dimmed) over the
               blur radius instead of snapping at one pixel (direct
               feedback, 24 Sept 2026: "a more organic fade style border").
               Extra padding (18px vs. a tight fit) keeps the actual target
               fully clear in the center once the blur eats into it from
               every edge. */}
            <filter id={`${maskId}-soft`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - 18}
                y={rect.top - 18}
                width={rect.width + 36}
                height={rect.height + 36}
                rx={16}
                fill="black"
                filter={`url(#${maskId}-soft)`}
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(4,4,9,0.6)" mask={`url(#${maskId})`} />
        </svg>
      )}
      {/* No scrim by default (same reasoning as GestureSpotlight: a torn-seam
         spotlight effect over real content reads as a bug, not a tutorial) --
         `spotlight` opts a specific call site into the SVG-mask cutout above
         instead, which doesn't share that old box-shadow technique's Safari
         bug. Tapping the bubble itself dismisses it; so does the caller's own
         first real interaction with whatever it's explaining. Flips above/below and
         slides along the X axis to stay clear of every viewport edge --
         never centered blindly on the target. BorderBeam's border-radius
         auto-detects off the button below, so it doesn't need its own.
         Positioning lives on THIS plain div, not on BorderBeam itself --
         BorderBeam's own stylesheet stamps `position: relative` on whatever
         element it wraps, which (being injected after Tailwind's own
         sheet) wins the cascade over an `absolute` class applied to that
         same element. The result was exactly what got reported: the beam
         box read as `position: relative` instead, so it sat at its normal
         full-width flow position instead of the intended fixed coordinate,
         with the 272px button inside it left-aligned within that -- "border
         beam running the full width but its surface only in the left
         part" (24 Sept 2026). Putting BorderBeam one level further in, as a
         plain un-positioned child, lets it keep the `position: relative` it
         actually wants for its own internal glow layers, while this wrapper
         (never touched by BorderBeam's CSS) is the one actually pinned to
         `top`/`left` and measured for the clamping math above. */}
      <div
        ref={bubbleRef}
        className={`pointer-events-auto absolute ${placement ? "motion-safe:animate-[fade-slide-up_0.28s_ease]" : ""}`}
        style={{
          top: placement?.top ?? -9999,
          left: placement?.left ?? -9999,
          visibility: placement ? "visible" : "hidden",
        }}
      >
        <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={3} strength={0.7} active={placement !== null}>
          <button
            type="button"
            onClick={onDismiss}
            // NOT dm-quiet -- its :hover background is !important and was
            // clobbering this bubble's own dark background the moment a
            // mouse hovered it, flashing to a lighter glass tone (direct
            // feedback, 24 Sept 2026: "when i hover its weird"). A plain
            // brightness lift gives the same "this is pressable" feedback
            // without a color swap.
            className="flex w-[272px] max-w-[calc(100vw-32px)] cursor-pointer flex-col items-start gap-3 rounded-[var(--radius-md)] px-4 py-3.5 text-left shadow-lg backdrop-blur-[16px] transition-[filter] duration-150 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-subtle)]"
            style={{ background: bubbleBg }}
          >
            <span className="text-[13.5px] leading-[19px] font-bold text-white">{label}</span>
            {/* Its own secondary-styled pill, not the primary blue -- this
               is a dismiss, not the call to action (direct feedback, 24
               Sept 2026). */}
            <span
              className="inline-flex items-center self-start rounded-[var(--radius-sm)] border px-3 py-1.5 text-[10px] font-bold tracking-[0.5px] text-white uppercase"
              style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.3)" }}
            >
              {cta}
            </span>
          </button>
        </BorderBeam>
      </div>
      {placement && (
        <span
          aria-hidden
          className="pointer-events-none absolute h-[11px] w-[11px] rotate-45"
          style={{ top: arrowTop, left: arrowLeftAbs, background: bubbleBg }}
        />
      )}
    </div>
  );
}
