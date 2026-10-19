import React from "react";
import { GlowLineArt, type GlowLineArtProps } from "@/components/app/GlowLineArt";

/* A summit with a path climbing to a flag. Two back peaks meet the main
   slopes exactly where the lines cross (solved, not eyeballed), so no ridge
   stops short of another. The flag carries the Dreamari mark. */
const PEAK = "M150 470L330 262Q400 186 470 262L650 470";
const LINES = [
  PEAK,
  "M60 470L176 342Q200 314 224 342L242.4 363.2",    // back peak, left
  "M740 470L624 342Q600 314 576 342L557.6 363.2",   // back peak, right
  "M372 470C420 432 330 404 382 364S416 290 400 224", // the path up, ending on the summit (the peak curve tops out at y 224)
  "M400 224V146",                                    // flagpole, from the summit
  "M400 150H452Q460 150 460 158V182Q460 190 452 190H400", // flag
];

/** About Me's Career Goal card before the student has picked a #1 career
 * (they already have a Top 3, the primary just isn't set). Chandu, 19 Oct
 * 2026: the school hall is for the College Goal, "career needs another one".
 * Same family as the school art (GlowLineArt): one fixed light, a few joined
 * round-cornered lines that catch it, the Dreamari mark on the flag. */
export function CareerPlaceholder(props: GlowLineArtProps) {
  return <GlowLineArt name="career" lines={LINES} faces={`${PEAK}Z`} mark={[412, 159.5, 1.7]} dot={[400, 142]} {...props} />;
}
