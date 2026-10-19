import React from "react";
import { GlowLineArt, type GlowLineArtProps } from "@/components/app/GlowLineArt";

/** One look for every school: the same light, the same hall. Kept as a list
 *  for the component lab, which shows each variant. */
export const COLLEGE_ART_VARIANTS = ["hall"] as const;
type Variant = typeof COLLEGE_ART_VARIANTS[number];

/* A low, wide hall drawn as a few joined outlines with soft corners, so no
   line ends near another and nothing reads as a gap. The drum's sides run
   down to meet the pediment's slope exactly (y on the slope at x=340/460). */
const OUTLINE = "M170 470V364Q170 350 184 350H290V310Q290 304 296 301L394 256Q400 253 406 256L504 301Q510 304 510 310V350H616Q630 350 630 364V470Z";
const LINES = [
  OUTLINE,
  "M340 282V238Q340 228 350 228H450Q460 228 460 238V282M352 228A48 48 0 0 1 448 228M392 180V168Q392 162 398 162H402Q408 162 408 168V180", // drum, dome, lantern
  "M290 318H510",                                   // entablature
  "M318 330V456M358 330V456M442 330V456M482 330V456", // columns, a bay left open for the door
  "M386 470V436A14 14 0 0 1 414 436V470",            // door
  "M200 440V398A8 8 0 0 1 216 398V440M244 440V398A8 8 0 0 1 260 398V440", // wing windows
  "M540 440V398A8 8 0 0 1 556 398V440M584 440V398A8 8 0 0 1 600 398V440",
  "M276 484H524M262 498H538",                        // steps
  "M400 162V150",                                    // finial
];

/** Missing-photo art for a college (and About Me's empty College Goal).
 * History, 19 Oct 2026 (Chandu): a grey line drawing of a campus "does not
 * feel as polished"; after several directions: keep the glow card, drop the
 * orb and Dreamy, and "let the line graphic ... take the glow ... from the
 * background and catch the light". Then "overly detailed", "too narrow",
 * "things look broken", "dont have to make it so sharp along corners", and
 * "let the glow be consistent". So: a low, wide hall in a few joined,
 * round-cornered lines in the shared GlowLineArt light, the Dreamari mark in
 * the pediment. Light mode swaps the --cp-* colours (globals.css). */
export function CollegePlaceholder({ className, style, dark, wide }: GlowLineArtProps & {
  seed?: string; variant?: Variant; /** kept for callers; colour comes from the theme */ accent?: string;
}) {
  return <GlowLineArt name="college" lines={LINES} faces={`${OUTLINE}M352 228A48 48 0 0 1 448 228Z`} mark={[379.7, 274.5, 1.9]} dot={[400, 146]} className={className} style={style} dark={dark} wide={wide} />;
}
