"use client";

import { useEffect, useState, type RefObject } from "react";
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
