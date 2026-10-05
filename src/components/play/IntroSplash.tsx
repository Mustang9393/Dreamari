"use client";

import { motion } from "framer-motion";
import { useId } from "react";

/** v3 (cinematic): a character's name, huge, behind them on their
 *  introduction (Citizen Sleeper's DRAGOS / YU-JIN).
 *
 *  The outline is drawn by an SVG filter around the WHOLE word's silhouette,
 *  not by -webkit-text-stroke: a stroke traces every contour inside the font,
 *  so the bars of a T or an A showed as lines inside the letters (direct
 *  feedback, 5 Oct 2026). The filter works on the rendered, opaque glyphs'
 *  alpha, so overlaps cannot show. Under the career-colour ring sits a wider,
 *  soft dark halo: invisible on a dim room, it is what lets gold read on IB's
 *  bright sky ("I liked the nurse version... when it came to the yellow it
 *  didn't work"). A faint fill and a downward fade keep it a backdrop. */
export function IntroSplash({ name, accent, className = "absolute inset-x-0 top-[12%] flex flex-col items-center sm:top-[10%]", maxVw = 23 }: { name: string; accent: string; className?: string; maxVw?: number }) {
  const id = `splash-${useId().replace(/:/g, "")}`;
  return (
    <motion.div
      aria-hidden
      // Clear of the HUD: well below the top bar on every screen size.
      className={`pointer-events-none ${className}`}
      initial={{ opacity: 0, x: -70 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        {/* One outline around the word's silhouette (so no contour inside
           a letter can show), in a bright tint of the career colour, over a
           solid deep shade of the same colour. No black keyline (Chandu,
           5 Oct 2026: "can we avoid the black outlines of the big character
           names? Instead use just a more darker or contrasty version of the
           color itself"), and no box or blur behind the name ("I like the
           earlier version where the color just did a fade"). */}
        <filter id={id} x="-15%" y="-70%" width="130%" height="240%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d1" />
          <feComposite in="d1" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood style={{ floodColor: `color-mix(in srgb, ${accent} 78%, white)` }} result="ink" />
          <feComposite in="ink" in2="ring" operator="in" result="line" />
          <feComponentTransfer in="SourceGraphic" result="fill">
            <feFuncA type="linear" slope="0.9" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="fill" />
            <feMergeNode in="line" />
          </feMerge>
        </filter>
      </svg>
      <span
        className="relative block leading-[0.9] font-extrabold uppercase"
        style={{
          // Room inside the box for the outlines and the shade: the fade
          // mask below clips everything outside the element's own box, which
          // cut the tops of the letters flat and squared off the shadow.
          padding: "0.22em 0.2em 0.12em",
          fontFamily: "var(--font-display)",
          // Sized to the name so a long one ("Christina") still fits a
          // phone's width edge to edge.
          fontSize: `clamp(54px, min(${maxVw}vw, ${(140 / Math.max(name.length, 4)).toFixed(1)}vw), 360px)`,
          letterSpacing: "-0.03em",
          // A shade darker than the career colour, so the fill reads on a
          // bright room (Chandu, 5 Oct 2026: "the big names arent very
          // legible, we can have a slightly darker gradient for the names").
          color: `color-mix(in srgb, ${accent} 62%, black)`,
          filter: `url(#${id})`,
          // The colour fades from top to bottom across the whole word, all
          // the way to nothing at the foot (Chandu: "it can still fade to
          // transparent or 0 opacity in the bottom like they did before").
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.9) 38%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.9) 38%, rgba(0,0,0,0) 100%)",
        }}
      >
        {name}
      </span>
    </motion.div>
  );
}

