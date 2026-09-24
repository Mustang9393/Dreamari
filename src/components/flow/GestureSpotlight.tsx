"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { GestureHint } from "./GestureHint";

// Persists per-device, not per-session -- a drag-to-reorder or drag-to-blank
// mechanic is genuinely non-obvious the first time, but re-showing it on
// every visit would be the "entire modal with written instructions" problem
// this is meant to replace, just moved to every mount instead of the first.
export function useFirstUseHint(key: string, { repeatOnReload = false }: { repeatOnReload?: boolean } = {}): [boolean, () => void] {
  const storageKey = `dreamari:hint-seen:${key}`;
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const navigation = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if ((repeatOnReload && navigation?.type === "reload") || !window.localStorage.getItem(storageKey)) setShow(true);
      } catch {
        // Storage blocked (private mode, etc.) -- fall back to not nagging
        // rather than showing the hint every single mount.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [repeatOnReload, storageKey]);
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
// The gap kept between the card and the real element it's explaining --
// never flush against it (direct feedback, 24 Sept 2026: "more padding...
// do not overlap or hide other elements").
const TARGET_GAP = 12;
// The pointer triangle's own size. Its center follows the real target even
// when the card itself has to clamp against a viewport edge.
const ARROW_W = 16;
const ARROW_H = 9;
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
  label,
  onDismiss,
  cta = "Got it",
  spotlight = false,
  side = "top",
  align = "center",
  wrapperClassName = "relative inline-flex",
  anchorId,
  children,
}: {
  active: boolean;
  label: string;
  onDismiss: () => void;
  /** "Next" for a step that leads into another coachmark, so a 2-part tour
      (For You -> Schools) reads as one guided moment instead of two
      unrelated hints firing separately (direct feedback, 24 Sept 2026:
      "they should happen in succession"). Defaults to "Got it" for a
      standalone or final-step coachmark. */
  cta?: string;
  /** A feathered screen dimmer and soft light bloom around the target.
      Off by default so callers opt in deliberately. */
  spotlight?: boolean;
  /** Preferred side of the target. The coachmark flips when that side does
      not have enough viewport room. Defaults to "top". */
  side?: "top" | "bottom";
  /** Preferred horizontal anchor. The final position is always clamped to
      the viewport, and the pointer shifts back toward the real target. */
  align?: "start" | "center" | "end";
  /** Preserve the caller's grid or flex sizing when a whole card is targeted. */
  wrapperClassName?: string;
  /** Optional stable target for guided tours to scroll into view. */
  anchorId?: string;
  /** The real element this coachmark explains. Its wrapper supplies the live
      target rectangle used to position the portaled card and glow. */
  children: React.ReactNode;
}) {
  const targetRef = useRef<HTMLSpanElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const spotlightId = useId().replaceAll(":", "");
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!active) return;

    const target = targetRef.current;
    const bubble = bubbleRef.current;
    if (!target || !bubble) return;

    // Keep position and size as two separate measurements. The target's
    // viewport rect may legitimately be scaled by the app's responsive
    // zoom; it is used only as an anchor. The tooltip's unscaled layout box
    // builds its own outline. Mixing those coordinate spaces was what made
    // the earlier implementation drift and deform on wide displays.
    const sync = () => {
      const nextRect = target.getBoundingClientRect();
      // Explore renders separate phone and desktop controls and hides one
      // with responsive CSS. Portals escape that hidden ancestor, so a
      // zero-sized hidden target must not emit its own duplicate coachmark.
      setTargetRect(target.getClientRects().length && nextRect.width > 0 && nextRect.height > 0 ? nextRect : null);
      setSize({ width: bubble.offsetWidth, height: bubble.offsetHeight });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(target);
    ro.observe(bubble);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, [active, label]);

  const viewport = typeof window === "undefined"
    ? { width: 0, height: 0 }
    : { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
  // The app intentionally zooms <body> on very wide screens. A portal into
  // body inherits that zoom even though targetRect is already expressed in
  // real viewport pixels, so cancel it on the overlay itself. Without this,
  // a 272px coachmark becomes 340px and its fixed left/top are multiplied a
  // second time at 1920/2560px.
  const bodyZoom = typeof window === "undefined" ? 1 : Number.parseFloat(window.getComputedStyle(document.body).zoom) || 1;
  const overlayZoom = 1 / bodyZoom;
  const margin = 16;
  const targetInViewport = !!targetRect
    && targetRect.bottom > 0
    && targetRect.top < viewport.height
    && targetRect.right > 0
    && targetRect.left < viewport.width;
  let placementSide = side;
  let left = -9999;
  let top = -9999;
  let arrowCenter = size ? size.width / 2 : 0;

  if (size && targetRect && viewport.width && viewport.height) {
    const targetCenter = targetRect.left + targetRect.width / 2;
    const idealLeft = align === "start"
      ? targetRect.left
      : align === "end"
        ? targetRect.right - size.width
        : targetCenter - size.width / 2;
    left = Math.min(Math.max(idealLeft, margin), Math.max(margin, viewport.width - size.width - margin));

    const below = targetRect.bottom + TARGET_GAP;
    const above = targetRect.top - TARGET_GAP - size.height;
    const fitsBelow = below + size.height <= viewport.height - margin;
    const fitsAbove = above >= margin;
    if (side === "bottom" && !fitsBelow && fitsAbove) placementSide = "top";
    if (side === "top" && !fitsAbove && fitsBelow) placementSide = "bottom";
    top = placementSide === "bottom" ? below : above;
    top = Math.min(Math.max(top, margin), Math.max(margin, viewport.height - size.height - margin));

    // The card may be clamped away from the target at a screen edge. Aim
    // the pointer back at the actual target while keeping it clear of the
    // rounded corners.
    arrowCenter = Math.min(Math.max(targetCenter - left, CARD_RADIUS + ARROW_W), size.width - CARD_RADIUS - ARROW_W);
  }

  const outlineD = size ? tooltipOutlinePath(size.width, size.height - ARROW_H, placementSide, arrowCenter) : "";

  // Mount the bubble as soon as the coachmark becomes active, even before
  // the target has been measured. Its hidden first frame gives the layout
  // effect a real bubble node to observe; gating the portal on
  // targetInViewport created a deadlock on cold page loads because neither
  // targetRect nor size could ever be populated.
  const overlay = active && typeof document !== "undefined" ? createPortal(
    <>
      {spotlight && targetInViewport && targetRect && (
        <>
          {/* The scrim is its own layer below both the target bloom and the
              coachmark (9997 < 9998 < 9999). An SVG luminance mask gives
              the opening a genuinely feathered edge in Chromium, WebKit,
              and Firefox without relying on browser-specific CSS masks. */}
          <svg
            aria-hidden
            data-coachmark-scrim
            className="pointer-events-none fixed left-0 top-0 z-[9997] motion-safe:animate-[coachmark-fade-in_0.28s_ease]"
            width={viewport.width}
            height={viewport.height}
            viewBox={`0 0 ${viewport.width} ${viewport.height}`}
            style={{ zoom: overlayZoom }}
          >
            <defs>
              <filter id={`${spotlightId}-feather`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="26" />
              </filter>
              <mask id={`${spotlightId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={viewport.width} height={viewport.height} style={{ maskType: "luminance" }}>
                <rect width={viewport.width} height={viewport.height} fill="white" />
                <ellipse
                  cx={targetRect.left + targetRect.width / 2}
                  cy={targetRect.top + targetRect.height / 2}
                  rx={targetRect.width / 2 + 34}
                  ry={targetRect.height / 2 + 30}
                  fill="black"
                  filter={`url(#${spotlightId}-feather)`}
                />
              </mask>
            </defs>
            <rect width={viewport.width} height={viewport.height} fill="rgba(2, 5, 12, 0.7)" mask={`url(#${spotlightId}-mask)`} />
          </svg>
          <span
            aria-hidden
            data-coachmark-halo
            className="pointer-events-none fixed z-[9998] motion-safe:animate-[coachmark-fade-in_0.28s_ease]"
            style={{
              zoom: overlayZoom,
              left: targetRect.left - 22,
              top: targetRect.top - 22,
              width: targetRect.width + 44,
              height: targetRect.height + 44,
              borderRadius: 999,
              background: "radial-gradient(ellipse at 50% 44%, rgba(255,255,255,0.18) 0%, rgba(255,250,238,0.085) 42%, rgba(255,250,238,0.025) 62%, transparent 82%)",
            }}
          />
        </>
      )}
      <div
        ref={bubbleRef}
        data-coachmark-bubble
        className="fixed z-[9999] flex w-[272px] max-w-[calc(100vw-32px)] flex-col items-start gap-3 px-4 text-left backdrop-blur-[16px] motion-safe:animate-[coachmark-fade-in_0.28s_ease]"
        style={{
          zoom: overlayZoom,
          left,
          top,
          visibility: targetInViewport && size && targetRect ? "visible" : "hidden",
          background: "linear-gradient(155deg, color-mix(in srgb, #2F6BF2 24%, rgba(24,24,36,0.97)) 0%, rgba(26,26,38,0.96) 55%, color-mix(in srgb, #7C5CFA 20%, rgba(24,24,36,0.97)) 100%)",
          boxShadow: "0 22px 50px -24px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.14)",
          clipPath: size ? `path('${outlineD}')` : undefined,
          paddingTop: (placementSide === "bottom" ? ARROW_H : 0) + 14,
          paddingBottom: (placementSide === "top" ? ARROW_H : 0) + 14,
        }}
      >
        <button
          type="button"
          onClick={onDismiss}
          className="relative flex w-full cursor-pointer flex-col items-start gap-3 bg-transparent text-left transition-[filter] duration-150 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3894FF]"
        >
          <span className="text-[13.5px] leading-[19px] font-bold text-white">{label}</span>
          <span className="inline-flex items-center self-start rounded-[8px] border px-3 py-1.5 text-[10px] font-bold tracking-[0.5px] text-white uppercase" style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.3)" }}>
            {cta}
          </span>
        </button>
      </div>
    </>,
    document.body,
  ) : null;

  return (
    <span ref={targetRef} id={anchorId} className={wrapperClassName}>
      {children}
      {overlay}
    </span>
  );
}
