"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
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
// The pointer triangle's own size, how far its base tucks up under the
// card (hides the seam where the two shapes meet -- 2px wasn't enough to
// fully hide it, direct feedback, 24 Sept 2026: "badly done"), and how far
// its clamp keeps it from a corner so it never sits astride the card's own
// border-radius curve.
const ARROW_W = 16;
const ARROW_H = 9;
const ARROW_CORNER_CLEARANCE = 22;
const CARD_RADIUS = 12;

/** One continuous outline -- rounded rect with the pointer triangle cut
 * INTO one edge (top or bottom) rather than stitched on as a second shape
 * (direct feedback, 24 Sept 2026: "one congruent structure", "not an
 * assembly of a rectangle and a triangle"). `w`/`h` are the card's own box;
 * the triangle adds `arrowH` of extra room above (side "bottom", pointer
 * hangs up off the card's top edge) or below (side "top") -- the caller
 * sizes its box to `h + arrowH` and offsets the card content accordingly.
 * Used for BOTH the clip-path that shapes the actual glass surface and the
 * SVG stroke traced on top of it, so the beam and the fill are always
 * exactly the same shape by construction, never two things kept in sync by
 * hand. */
function tooltipOutlinePath(w: number, h: number, side: "top" | "bottom", arrowCenter: number): string {
  const r = CARD_RADIUS;
  const cardTop = side === "bottom" ? ARROW_H : 0;
  const cardBottom = cardTop + h;
  const aLeft = Math.max(r, arrowCenter - ARROW_W / 2);
  const aRight = Math.min(w - r, arrowCenter + ARROW_W / 2);
  const topSeg =
    side === "bottom"
      ? `L ${aLeft} ${cardTop} L ${arrowCenter} 0 L ${aRight} ${cardTop} L ${w - r} ${cardTop}`
      : `L ${w - r} ${cardTop}`;
  const bottomSeg =
    side === "top"
      ? `L ${aRight} ${cardBottom} L ${arrowCenter} ${cardBottom + ARROW_H} L ${aLeft} ${cardBottom} L ${r} ${cardBottom}`
      : `L ${r} ${cardBottom}`;
  return [
    `M ${r} ${cardTop}`,
    topSeg,
    `A ${r} ${r} 0 0 1 ${w} ${cardTop + r}`,
    `L ${w} ${cardBottom - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${cardBottom}`,
    bottomSeg,
    `A ${r} ${r} 0 0 1 0 ${cardBottom - r}`,
    `L 0 ${cardTop + r}`,
    `A ${r} ${r} 0 0 1 ${r} ${cardTop}`,
    "Z",
  ].join(" ");
}

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
  const bubbleRef = useRef<HTMLButtonElement | null>(null);
  const [placement, setPlacement] = useState<{ top: number; left: number; width: number; height: number; side: "top" | "bottom"; arrowLeft: number } | null>(null);

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
    // the bubble's own edges so it never pokes out past a rounded corner
    // (ARROW_CORNER_CLEARANCE below, not just half its own 16px width).
    const targetCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.min(Math.max(targetCenter - left, ARROW_CORNER_CLEARANCE), Math.max(ARROW_CORNER_CLEARANCE, bubble.width - ARROW_CORNER_CLEARANCE));

    setPlacement({ top, left, width: bubble.width, height: bubble.height, side, arrowLeft });
  }, [rect]);

  if (!active || !rect) return null;

  // The Counselor Dashboard's own "premium glass" recipe (surfaces.ts:
  // GLASS_CARD) -- a dark floor with a subtle brand-tinted gradient and an
  // inset highlight, instead of one flat color. Recreated here rather than
  // imported -- that module belongs to the Counselor Dashboard's own
  // isolated product (AGENTS.md), this is just borrowing its look. Lightened
  // a step past that recipe's own floor specifically because THIS surface
  // sits on top of the spotlight's own dark dimming layer, not a plain page
  // background -- the two dark-on-dark layers were reading as one blob
  // (direct feedback, 24 Sept 2026: "the surface needs to stand out, its
  // blending too much with the dark dimming + page").
  // Hardcoded hex, not var(--primary) -- this button is portaled straight
  // onto <body> (below), OUTSIDE the `.themeable` wrapper that actually
  // defines the app's CSS custom properties. var(--primary) resolves to
  // nothing out there, which doesn't just fall back to a default -- it
  // makes the WHOLE gradient value invalid, so the browser drops
  // `background` entirely and the surface goes fully transparent (direct
  // report, 24 Sept 2026, live during a demo: "the surface blends too much
  // and i cant even see it at all" -- confirmed via computed style: an
  // inline background that read back as `none`). #2F6BF2 is --primary's own
  // dark-theme value (tokens.css); hardcoding it here is deliberate, not a
  // temporary shortcut -- this component can never safely depend on
  // inherited custom properties.
  const bubbleBg = "linear-gradient(155deg, color-mix(in srgb, #2F6BF2 24%, rgba(24,24,36,0.97)) 0%, rgba(26,26,38,0.96) 55%, color-mix(in srgb, #7C5CFA 20%, rgba(24,24,36,0.97)) 100%)";
  const bubbleShadow = "0 22px 50px -24px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.14)";

  // Card + pointer, ONE outline (direct feedback, 24 Sept 2026: "one
  // congruent structure... not an assembly of a rectangle and a triangle
  // thing"). Before `placement` resolves, the extra ARROW_H goes on the
  // bottom arbitrarily -- it doesn't matter which side yet, only that the
  // TOTAL measured height already includes it, so the box doesn't jump in
  // size the moment `placement.side` becomes known.
  const side = placement?.side ?? "top";
  const topExtra = side === "bottom" ? ARROW_H : 0;
  const bottomExtra = side === "top" ? ARROW_H : 0;
  const outlineD = placement ? tooltipOutlinePath(placement.width, placement.height - ARROW_H, placement.side, placement.arrowLeft) : "";
  // A static, single tone -- not the rotating rainbow gradient this had
  // before (direct feedback, 24 Sept 2026: "i dont like the colors of the
  // border... no color movement"). Still traced from the exact same
  // `outlineD` as the clip-path, so it's one congruent outline either way.
  const outlineStroke = "color-mix(in srgb, #2F6BF2 45%, rgba(255,255,255,0.35))";

  // Portaled straight onto <body> -- `position: fixed` only escapes to the
  // true viewport when nothing between here and <body> establishes its own
  // containing block, and this app has plenty of ancestors that do
  // (backdrop-filter, transform, etc. on cards and the parallax reel). One
  // of those was trapping this z-[9999] layer inside a lower stacking
  // context than the sticky header, so the header rendered ON TOP of the
  // coachmark instead of the other way around (direct feedback, 24 Sept
  // 2026: "the tooltip is going under the dreamari logo"). A portal sidesteps
  // the whole class of bug instead of chasing down which ancestor did it.
  return createPortal(
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
         first real interaction with whatever it's explaining. Flips above/below
         and slides along the X axis to stay clear of every viewport edge --
         never centered blindly on the target.

         The button itself IS the clipped shape (card + pointer cut from one
         `tooltipOutlinePath`, via `clip-path: path(...)`) -- not a rectangle
         with a second triangle element glued beside it. `bubbleRef` always
         measures this same node; before `placement` resolves there's no
         clip-path yet (nothing to clip to), but the padding already reserves
         ARROW_H of extra height either way, so the measured size never
         changes shape between the two passes. BorderBeam (a 3rd-party lib)
         can only ever trace a plain rounded rect, not an arbitrary
         rect+triangle outline, so the beam here is a hand-built SVG <path>
         stroke sharing the EXACT same `outlineD` string as the clip-path --
         the fill and the beam are the same shape by construction, not two
         things kept in sync by hand (direct feedback, 24 Sept 2026: "the
         border beam follows the whole outline including the arrow"). */}
      <button
        ref={bubbleRef}
        type="button"
        onClick={onDismiss}
        // NOT dm-quiet -- its :hover background is !important and was
        // clobbering this bubble's own dark background the moment a mouse
        // hovered it, flashing to a lighter glass tone (direct feedback, 24
        // Sept 2026: "when i hover its weird"). A plain brightness lift
        // gives the same "this is pressable" feedback without a color swap.
        className={`pointer-events-auto absolute flex w-[272px] max-w-[calc(100vw-32px)] cursor-pointer flex-col items-start gap-3 text-left backdrop-blur-[16px] transition-[filter] duration-150 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3894FF] ${
          placement ? "motion-safe:animate-[fade-slide-up_0.28s_ease]" : ""
        }`}
        style={{
          top: placement?.top ?? -9999,
          left: placement?.left ?? -9999,
          visibility: placement ? "visible" : "hidden",
          background: bubbleBg,
          boxShadow: bubbleShadow,
          clipPath: placement ? `path('${outlineD}')` : undefined,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: topExtra + 14,
          paddingBottom: bottomExtra + 14,
        }}
      >
        {placement && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${placement.width} ${placement.height}`}
            preserveAspectRatio="none"
          >
            <path d={outlineD} fill="none" stroke={outlineStroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          </svg>
        )}
        <span className="relative text-[13.5px] leading-[19px] font-bold text-white">{label}</span>
        {/* Its own secondary-styled pill, not the primary blue -- this is a
           dismiss, not the call to action (direct feedback, 24 Sept 2026). */}
        <span
          className="relative inline-flex items-center self-start rounded-[8px] border px-3 py-1.5 text-[10px] font-bold tracking-[0.5px] text-white uppercase"
          style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.3)" }}
        >
          {cta}
        </span>
      </button>
    </div>,
    document.body,
  );
}
