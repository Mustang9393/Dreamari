"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
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
// The gap kept between the card and the real element it's explaining --
// never flush against it (direct feedback, 24 Sept 2026: "more padding...
// do not overlap or hide other elements").
const TARGET_GAP = 12;
// The pointer triangle's own size. Always centered on the card now (the
// card itself is centered on the target via CSS, see Coachmark below), so
// no corner-clearance clamping is needed the way a computed, potentially
// off-center position used to require.
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
  /** A bright glow ring drawn directly around the target (direct feedback,
      24 Sept 2026: "dim the screen... like a spotlight", later "the
      spotlighted area should be even brighter"). Off by default so every
      existing coachmark (the icon rows) keeps its current plain look; opt
      in per call site. */
  spotlight?: boolean;
  /** Which side of the target the card (and its pointer) sits on. No
      auto-detection -- see the file-level comment on why measuring
      available space was dropped; the caller already knows whether its
      target sits near the top of the screen (pick "bottom") or the bottom
      of a card (pick "top"). Defaults to "top". */
  side?: "top" | "bottom";
  /** Horizontal anchor. "center" (default) centers the card on the target,
      which can push it past the viewport edge on a narrow screen if the
      target itself sits near that edge (confirmed live at 320px: "Prefer
      scrolling?" started mid-word, cut off on the left). "start"/"end" pin
      one edge of the card to the matching edge of the target instead, so it
      only ever grows AWAY from the edge the caller knows the target is
      close to -- e.g. a target near the left of the screen picks "start"
      (grows rightward), one near the right picks "end" (grows leftward). No
      measurement either way, same as `side`: the caller's own knowledge of
      roughly where its target sits, not a runtime check. */
  align?: "start" | "center" | "end";
  /** The real element this coachmark explains -- rendered as-is, wrapped in
      a `position: relative` box so the card and glow can anchor to it with
      plain CSS (`top: 100%` / `bottom: 100%`, both centered). */
  children: React.ReactNode;
}) {
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  // Still measured -- but ONLY this element's own box (offsetWidth/Height,
  // never getBoundingClientRect, see the file-level comment), purely to
  // build the clip-path outline at the right size for however long `label`
  // happens to be. Nothing here depends on the target's position, the
  // viewport's size, zoom, or DPI -- CSS anchoring (below) handles all of
  // that natively, the one thing no amount of `getBoundingClientRect` math
  // can ever be as reliable as.
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    if (!active || !bubbleRef.current) {
      setSize(null);
      return;
    }
    const el = bubbleRef.current;
    const sync = () => setSize({ width: el.offsetWidth, height: el.offsetHeight });
    sync();
    // Font load, a locale making `label` render wider, etc. can all change
    // the natural size after first paint -- ResizeObserver (not a resize
    // listener; this box's size has nothing to do with the window's) keeps
    // the outline in sync with whatever actually rendered.
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, label]);

  // Where the pointer sits along the card's own width -- centered for
  // align="center" (the card is centered on the target, so its center IS
  // the target's center); a fixed offset from whichever edge is PINNED to
  // the target for "start"/"end", since the target's own exact width isn't
  // measured. Approximate, not pixel-perfect, but always in the target's
  // general direction rather than potentially aimed off the card entirely.
  const EDGE_ARROW_OFFSET = 28;
  const arrowCenter = size ? (align === "start" ? EDGE_ARROW_OFFSET : align === "end" ? size.width - EDGE_ARROW_OFFSET : size.width / 2) : 0;
  const outlineD = size ? tooltipOutlinePath(size.width, size.height - ARROW_H, side, arrowCenter) : "";

  return (
    // The ONE piece of positioning logic this component still needs:
    // establish a containing block for the card/glow right where the real
    // target already is. No coordinates computed anywhere -- `top: 100%` /
    // `bottom: 100%` and centering are the browser's own layout math against
    // THIS element's box, which is by definition always exactly where the
    // target is, on any screen size, zoom level, or DPI (direct feedback,
    // 24 Sept 2026, after several rounds of getBoundingClientRect-based
    // positioning breaking in real conditions -- confirmed on a real 15"/16"
    // MacBook Pro, not just an emulated viewport: "track the exact element
    // its meant to highlight... instead of computing distances from screen
    // sizes"). inline-block/inline-flex so wrapping a target doesn't change
    // how it sits in its own parent's flex row.
    <span className="relative inline-flex">
      {children}
      {spotlight && active && (
        // A bright ring directly on the target, not a page-wide dimming
        // layer with a computed cutout -- that cutout was the other half of
        // the same measuring-against-the-viewport problem this whole
        // rewrite drops. `-inset-3`/`rounded` scale with the target's own
        // box via plain CSS, same as the card below.
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-[16px] motion-safe:animate-[coachmark-fade-in_0.28s_ease]"
          style={{
            boxShadow: "0 0 0 3px rgba(56,148,255,0.6), 0 0 28px 8px rgba(56,148,255,0.5), 0 0 50px 16px rgba(124,92,250,0.3)",
            background: "radial-gradient(circle, rgba(255,255,255,0.22), transparent 65%)",
          }}
        />
      )}
      {active && (
        <div
          ref={bubbleRef}
          // NOT `motion-safe:animate-[fade-slide-up...]` -- that keyframe's
          // own `transform: translateY(...)` REPLACES the element's whole
          // `transform` property for the animation's duration, wiping out
          // the `translateX(-50%)` centering below entirely (a CSS
          // animation owns the properties it animates outright, it doesn't
          // compose with a separately-set base value) -- confirmed live:
          // computed `transform` read back as `none` and the card rendered
          // off-center. A plain opacity-only keyframe can't touch transform
          // in the first place.
          className="absolute z-[60] flex w-[272px] max-w-[min(272px,calc(100vw-32px))] flex-col items-start gap-3 px-4 text-left backdrop-blur-[16px] motion-safe:animate-[coachmark-fade-in_0.28s_ease]"
          style={{
            [side === "top" ? "bottom" : "top"]: "100%",
            ...(align === "start" ? { left: 0 } : align === "end" ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }),
            [side === "top" ? "marginBottom" : "marginTop"]: TARGET_GAP,
            // The Counselor Dashboard's own "premium glass" recipe
            // (surfaces.ts: GLASS_CARD) -- a dark, nearly-opaque floor with
            // a subtle brand-tinted gradient and an inset highlight, not one
            // flat color. Recreated here (not imported -- that module
            // belongs to the Counselor Dashboard's own isolated product,
            // AGENTS.md) with hardcoded hex, not var(--primary): this used
            // to be portaled onto <body>, outside the .themeable wrapper
            // that defines the app's custom properties, which silently
            // invalidated the whole gradient and dropped the background
            // entirely (confirmed via computed style reading back `none`).
            // No longer portaled, but kept hardcoded since it costs nothing
            // and removes the dependency for good.
            background: "linear-gradient(155deg, color-mix(in srgb, #2F6BF2 24%, rgba(24,24,36,0.97)) 0%, rgba(26,26,38,0.96) 55%, color-mix(in srgb, #7C5CFA 20%, rgba(24,24,36,0.97)) 100%)",
            boxShadow: "0 22px 50px -24px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.14)",
            clipPath: size ? `path('${outlineD}')` : undefined,
            paddingTop: (side === "bottom" ? ARROW_H : 0) + 14,
            paddingBottom: (side === "top" ? ARROW_H : 0) + 14,
          }}
        >
          {size && (
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox={`0 0 ${size.width} ${size.height}`}
              preserveAspectRatio="none"
            >
              {/* One congruent outline -- card + pointer cut from the SAME
                 `tooltipOutlinePath` as the clip-path above, so the stroke
                 and the fill can never drift into two different shapes
                 (direct feedback, 24 Sept 2026: "one congruent structure",
                 "the border beam follows the whole outline including the
                 arrow"). A static single tone, not a rotating rainbow
                 gradient (direct feedback: "no color movement"). */}
              <path
                d={outlineD}
                fill="none"
                stroke="color-mix(in srgb, #2F6BF2 45%, rgba(255,255,255,0.35))"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
          <button
            type="button"
            onClick={onDismiss}
            // NOT dm-quiet -- its :hover background is !important and was
            // clobbering this bubble's own dark background the moment a
            // mouse hovered it (direct feedback, 24 Sept 2026: "when i
            // hover its weird"). A plain brightness lift gives the same
            // "this is pressable" feedback without a color swap.
            className="relative flex w-full cursor-pointer flex-col items-start gap-3 bg-transparent text-left transition-[filter] duration-150 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3894FF]"
          >
            <span className="text-[13.5px] leading-[19px] font-bold text-white">{label}</span>
            {/* Its own secondary-styled pill, not the primary blue -- this
               is a dismiss, not the call to action (direct feedback, 24
               Sept 2026). */}
            <span
              className="inline-flex items-center self-start rounded-[8px] border px-3 py-1.5 text-[10px] font-bold tracking-[0.5px] text-white uppercase"
              style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.3)" }}
            >
              {cta}
            </span>
          </button>
        </div>
      )}
    </span>
  );
}
