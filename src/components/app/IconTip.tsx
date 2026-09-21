"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Portal } from "@/components/profile/CareerReport";

// Universal rule (direct feedback, 17 Sept 2026): anything icon-only shows
// its label as a tooltip on hover and keyboard focus. Originally built for
// the Resume Builder's own toolbar (resume/ui.tsx) and shared here so every
// other icon-only control in the app -- Career detail, College detail, and
// anywhere else -- can wrap itself in the same `IconTip` instead of a second
// implementation of the identical rule.

/** The tooltip bubble itself, portalled to the body and positioned from the
 *  trigger's rect. Rendering it inline under the trigger looked right in
 *  the DOM but painted BEHIND whatever came next (a sheet, the next row):
 *  those neighbours carry their own stacking contexts, so no z-index inside
 *  the header could win. */
type TipState = { x: number; triggerTop: number; triggerBottom: number; above: boolean };

export function Tip({ label, children, hideFromLg = false, className = "" }: { label: string; children: ReactNode; hideFromLg?: boolean; className?: string }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ x: r.left + r.width / 2, triggerTop: r.top, triggerBottom: r.bottom, above: false });
  };
  const hide = () => setTip(null);
  // Scrolling under an open tooltip would leave it stranded; dismiss instead.
  useEffect(() => {
    if (!tip) return;
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", hide, { capture: true } as EventListenerOptions);
  }, [tip]);
  // Clamp the bubble to the viewport. A trigger near the left/right/bottom
  // edge -- common on narrower Windows/Chromebook screens and at non-100%
  // Windows display scaling, where the same layout leaves less room than on
  // a large Mac display -- would otherwise center (or drop) the tooltip
  // partway off-screen, which reads as "the tooltip is nowhere near the
  // icon" (reported on Windows, never reproduced here on Mac at 100%).
  useLayoutEffect(() => {
    if (!tip || !bubbleRef.current) return;
    const margin = 8;
    const rect = bubbleRef.current.getBoundingClientRect();
    let x = tip.x;
    let above = tip.above;
    if (rect.left < margin) x += margin - rect.left;
    else if (rect.right > window.innerWidth - margin) x -= rect.right - (window.innerWidth - margin);
    if (!above && rect.bottom > window.innerHeight - margin) above = true;
    if (x !== tip.x || above !== tip.above) setTip({ ...tip, x, above });
  }, [tip]);
  // The wrapper needs SOME position other than static so the portalled
  // tooltip bubble can measure it, but a caller that already passes its own
  // `absolute`/`fixed`/`sticky` (to place the whole trigger -- a corner
  // button, a close control) doesn't need `relative` too: Tailwind gives
  // both utilities the same specificity, so whichever one the generated
  // stylesheet happens to list last silently wins the cascade -- in this
  // project that was `relative`, so every icon-only control positioned via
  // IconTip's own className (Match's "+"/rank badge among many others)
  // rendered at its static in-flow position instead of the corner it asked
  // for. Found 22 Sept 2026 via a direct report that Match's card content
  // was "cropped and overlapping" -- the real bug was this select button
  // landing on top of the salary chip instead of the card's other corner.
  const positioned = /\b(?:absolute|fixed|sticky|static)\b/.test(className);
  return (
    <span ref={ref} className={`${positioned ? "" : "relative "}flex flex-none ${className}`} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} aria-describedby={tip ? id : undefined}>
      {children}
      {tip && (
        <Portal>
          <span
            ref={bubbleRef}
            id={id}
            role="tooltip"
            className={`pointer-events-none fixed z-[9999] -translate-x-1/2 rounded-[var(--radius-sm)] border px-[10px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap motion-safe:animate-[fade-slide-up_0.18s_ease-out_both] ${hideFromLg ? "lg:hidden" : ""}`}
            style={{
              left: tip.x,
              top: tip.above ? undefined : tip.triggerBottom + 8,
              bottom: tip.above ? window.innerHeight - tip.triggerTop + 8 : undefined,
              background: "color-mix(in srgb, var(--background) 94%, var(--foreground))",
              borderColor: "var(--glass-border)",
              color: "var(--foreground)",
              boxShadow: "0 14px 30px -16px rgba(0,0,0,0.7)",
              fontFamily: "var(--font-body)",
            }}
          >
            {label}
          </span>
        </Portal>
      )}
    </span>
  );
}

/** Wrap any icon-only control in this so its label shows as a tooltip on
 *  hover and keyboard focus -- the icon alone is never the whole affordance. */
export function IconTip({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <Tip label={label} className={className}>{children}</Tip>;
}
