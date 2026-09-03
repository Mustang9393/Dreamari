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
type BlurDirection = "up" | "left";

export function CardProgressiveBlur({ direction = "up", size = "52%", maxBlur }: { direction?: BlurDirection; size?: string; maxBlur?: number } = {}) {
  const stops = maxBlur ? [...CARD_BLUR_STOPS.filter((b) => b < maxBlur), maxBlur] : CARD_BLUR_STOPS;
  const total = stops.length;
  const box = direction === "up" ? { insetInline: 0, bottom: 0, height: size } : { insetBlock: 0, left: 0, width: size };
  const toward = direction === "up" ? "to bottom" : "to left";
  return (
    <span aria-hidden className="pointer-events-none absolute overflow-hidden" style={box}>
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
            style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask }}
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
