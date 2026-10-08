"use client";

import { useEffect, useRef } from "react";
// Shared photo-card chrome, factored out of Connect's card work so every
// full-bleed-photo card in the app (Connect, Home, wherever comes next)
// fades its image the same soft way instead of each screen inventing (or
// worse, copy-pasting) its own version.

/** The For You reel's progressive-blur recipe at card scale: stacked
 *  backdrop-filter layers at increasing blur, each feathered in by its own
 *  mask band, composited into a smooth sharp-to-frosted ramp. */
const CARD_BLUR_STOPS = [1, 2, 4, 8, 14];

/** Which way the frost ramps. "up": sharp at the top of the band, frosted at
 *  the card's bottom edge (the default, for bottom-anchored text). "left":
 *  sharp at the band's right, frosted at its left edge, for a photo that
 *  sits on a card's right and has to dissolve into a text panel. */
type BlurDirection = "up" | "down" | "left";

export function CardProgressiveBlur({ direction = "up", size = "52%", maxBlur }: { direction?: BlurDirection; size?: string; maxBlur?: number } = {}) {
  const stops = maxBlur ? [...CARD_BLUR_STOPS.filter((b) => b < maxBlur), maxBlur] : CARD_BLUR_STOPS;
  const total = stops.length;
  // "down" (7 Oct 2026): the same ramp hung from the TOP edge, for a scroll
  // area whose content slides up under a header, the way iOS frosts the
  // strip under the clock: sharp below, frosted at the edge.
  const box = direction === "up" ? { insetInline: 0, bottom: 0, height: size } : direction === "down" ? { insetInline: 0, top: 0, height: size } : { insetBlock: 0, left: 0, width: size };
  const toward = direction === "up" ? "to bottom" : direction === "down" ? "to top" : "to left";
  return (
    // borderRadius: inherit -- a rounded ancestor's overflow:hidden doesn't
    // reliably clip a backdrop-filter child in every browser (the blur
    // layer can render in its own compositing pass that ignores the
    // ancestor's clip), which showed up as sharp square corners poking out
    // of the board banner's otherwise-rounded bottom corners. Inheriting
    // the radius here clips it directly, regardless of that quirk.
    <span aria-hidden className="pointer-events-none absolute overflow-hidden" style={{ ...box, borderRadius: "inherit" }}>
      {stops.map((blur, index) => {
        /* every band -- including the first -- fades in from transparent, so
           the ramp truly starts at 0px with no visible seam */
        const fadeStart = (index / total) * 62;
        const fadeEnd = fadeStart + 62 / total + 14;
        const mask = `linear-gradient(${toward}, transparent ${fadeStart.toFixed(1)}%, black ${Math.min(100, fadeEnd).toFixed(1)}%, black 100%)`;
        return (
          <span
            key={blur}
            className="absolute inset-0"
            // borderRadius here too, not just on the wrapper above: Chromium
            // can promote a backdrop-filter element to its own compositing
            // layer and clip it against the ancestor's box *before* that
            // ancestor's own radius is baked in, leaving a hairline sliver
            // of the unblurred, unmasked edge visible right along the
            // curve (direct feedback, repeated: "bright borders on the
            // rounded corners"). The filtered element needs the radius on
            // itself for that layer's own clip to be rounded.
            style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask, borderRadius: "inherit" }}
          />
        );
      })}
    </span>
  );
}

export const CARD_TEXT_SHADOW = "0 1px 2px rgba(0,0,0,0.7), 0 1px 10px rgba(0,0,0,0.4)";

/** A soft, multi-stop bottom scrim -- the standard companion to
 *  CardProgressiveBlur. Four stops read as a gradual dim, not a visible
 *  edge, the way a 1-2 stop mask does. */
export function cardBottomScrim(strength: "regular" | "heavy" = "regular") {
  const base = strength === "heavy" ? 0.82 : 0.55;
  return `linear-gradient(to top, rgba(14,12,32,${base}) 0%, rgba(14,12,32,${base * 0.58}) 38%, rgba(14,12,32,${base * 0.2}) 68%, transparent 100%)`;
}

/** A light top scrim for cards that also carry text up there (a title
 *  sitting directly on the photo, not just in the bottom safe-zone
 *  CardProgressiveBlur covers) -- without it, a title over a bright patch
 *  of photo can fall under WCAG contrast even with a text-shadow backing
 *  it, since a shadow alone doesn't guarantee a dark base under every
 *  glyph. */
export function cardTopScrim() {
  return "linear-gradient(to bottom, rgba(10,9,20,0.55) 0%, rgba(10,9,20,0.22) 45%, transparent 72%)";
}

/** The scroll edges of a panel, frosted the way iOS 26's soft scroll-edge
 *  effect frosts the strip under a bar (Apple HIG, "Scroll edge effects":
 *  content blurs and fades progressively as it passes under the edge, and
 *  the effect is absent while nothing has scrolled under). Chandu, 7 Oct
 *  2026: "I love the new scroll edge look. Let's use that everywhere", then
 *  "it should feel much more natural and not have that left and right sharp
 *  edge", "this should not happen when idle", "the blur should start from 0
 *  and ramp up organically". So: six blur layers from 0.5px to 9px, crossfading in local
 *  bands (8 Oct 2026: reduce the cumulative haze); a side fade so the band never shows a
 *  vertical seam; and each edge's opacity follows the scroll (the top edge is
 *  off at scrollTop 0, the bottom edge is off at the end or when nothing
 *  overflows). Drop it inside a `relative` wrapper that also holds the scroll
 *  container (`scroller`, or the first overflow-y child found). Keep it off
 *  anything a student must reach: footers and CTAs stay outside the wrapper. */
export function ScrollEdges({ top = 0, bottom = 56, tint = "var(--card)", scroller }: { top?: number; bottom?: number; /** the surface both ramps fade toward; "none" for frost only */ tint?: string; /** the scroll container; defaults to the wrapper's first overflow-y child */ scroller?: React.RefObject<HTMLElement | null> }) {
  const host = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // the scroll container: the given one, else the nearest ancestor's
    // overflow-y child (the host may sit one wrapper deeper than the scroller)
    let target: HTMLElement | null = scroller?.current ?? null;
    for (let p = el.parentElement, hops = 0; !target && p && hops < 4; p = p.parentElement, hops++) {
      target = Array.from(p.querySelectorAll<HTMLElement>("*")).find((n) => n !== el && !el.contains(n) && /auto|scroll/.test(getComputedStyle(n).overflowY) && n.scrollHeight > 0) ?? null;
    }
    if (!target) return;
    // Ease the strength from zero; do not snap a full frost band on at 1px.
    const ease = (v: number) => { const x = Math.max(0, Math.min(1, v)); return x * x * (3 - 2 * x); };
    const paint = () => {
      const t = ease(target.scrollTop / Math.max(top, 32));
      const left = target.scrollHeight - target.clientHeight - target.scrollTop;
      const b = target.scrollHeight - target.clientHeight < 4 ? 0 : ease(left / Math.max(bottom, 32));
      el.style.setProperty("--se-top", t.toFixed(3));
      el.style.setProperty("--se-bottom", b.toFixed(3));
    };
    paint();
    let frame = 0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint(); }); };
    target.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    const observe = () => {
      ro.disconnect();
      ro.observe(target);
      if (target.firstElementChild) ro.observe(target.firstElementChild);
      schedule();
    };
    observe();
    // Switching tabs replaces the content node without replacing the scroller.
    const mo = new MutationObserver(observe);
    mo.observe(target, { childList: true, subtree: true, characterData: true });
    return () => { target.removeEventListener("scroll", schedule); ro.disconnect(); mo.disconnect(); cancelAnimationFrame(frame); };
  }, [scroller, top, bottom]);
  return (
    <span ref={host} aria-hidden className="contents" style={{ ["--se-top" as string]: 0, ["--se-bottom" as string]: 0 }}>
      {top > 0 && <EdgeFrost edge="top" size={top} tint={tint} />}
      {bottom > 0 && <EdgeFrost edge="bottom" size={bottom} tint={tint} />}
    </span>
  );
}

const EDGE_STOPS = [0.5, 1, 2, 4, 6, 9];
function EdgeFrost({ edge, size, tint }: { edge: "top" | "bottom"; size: number; tint?: string }) {
  const toward = edge === "top" ? "to top" : "to bottom";
  const strength = edge === "top" ? "var(--se-top)" : "var(--se-bottom)";
  const n = EDGE_STOPS.length;
  // No opacity or mask on the WRAPPER: either one turns the wrapper into the
  // backdrop root for its backdrop-filter children, which then blur a
  // transparent box and show nothing (why the first version was invisible,
  // 7 Oct 2026). Each layer carries its own two masks (the vertical ramp and
  // the side fade, intersected) and scales its blur radius by the scroll
  // strength, so the effect lives entirely on the filtered elements.
  const side = "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)";
  return (
    <span className="pointer-events-none absolute inset-x-0 z-[2]" style={{ [edge]: 0, height: size }}>
      {EDGE_STOPS.map((blur, i) => {
        // Local crossfading bands, rather than six opaque filters piled up at
        // the edge. Each blur hands off to the next; only the last stays solid.
        const step = 100 / n;
        const start = Math.max(0, (i - 0.5) * step);
        const peak = (i + 1) * step;
        const end = Math.min(100, (i + 2.5) * step);
        const ramp = `linear-gradient(${toward}, transparent ${start}%, rgba(0,0,0,.15) ${start + (peak - start) * 0.35}%, rgba(0,0,0,.65) ${start + (peak - start) * 0.7}%, black ${peak}%${i < n - 1 ? `, rgba(0,0,0,.65) ${peak + (end - peak) * 0.3}%, rgba(0,0,0,.15) ${peak + (end - peak) * 0.7}%, transparent ${end}%` : ""})`;
        return (
          <span
            key={blur}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(calc(${blur}px * ${strength}))`,
              WebkitBackdropFilter: `blur(calc(${blur}px * ${strength}))`,
              maskImage: `${ramp}, ${side}`,
              WebkitMaskImage: `${ramp}, ${side}`,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />
        );
      })}
      {tint && tint !== "none" && (
        <span className="absolute inset-0" style={{ opacity: strength, background: `linear-gradient(${toward}, transparent 0%, color-mix(in srgb, ${tint} 12%, transparent) 30%, color-mix(in srgb, ${tint} 55%, transparent) 65%, ${tint} 100%)`, maskImage: side, WebkitMaskImage: side }} />
      )}
    </span>
  );
}
