"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";
import { StarsBackground } from "@/components/ui/stars";

// Play's own background -- deliberately NOT AppBackdrop (direct feedback,
// Joshua Pierce via Slack, 21 Sept 2026: "it shouldn't have a similar
// background color as the Explore/my profile etc, it'll feel redundant...
// when playing a game it should feel like we are entering a new world").
// Scoped to actual gameplay only (GlossaryGameExperience) -- the Play TAB
// hub itself uses the standard AppBackdrop, same as every other tab (direct
// feedback: "Dont change the background of the PLAY TAB... ONLY CHANGE THE
// BACKGROUND OF THE IN GAME BACKGROUND").
//
// A same-hue duotone built from the career's own accent (gold for Finance)
// was tried and rejected outright: "WHY HAVE YOU USED A GOLDEN BACKGROUND
// FOR THE GLOSSARY GAME!!!!!!!!!!!!!! USE SOOMETHING ELSE. IT JUST HAS TO
// PLAY WELL WITH THE GAME UI NOT MATCH IT" -- the backdrop was echoing the
// CTA/progress-bar color instead of setting a scene the gold reads *against*.
// A fixed jade/emerald scene followed -- also since rejected: "Increase the
// colored space so theres more color on the background overall too. Right
// now it still feels black dominated. Maybe try a different combo than
// green/yellow?" Rebuilt again on a berry/magenta palette instead (still
// nowhere near the app's own blue/purple wash, and nowhere near the gold
// CTA), with the glows themselves made much bigger and stronger so color
// actually dominates the frame instead of two small accents on a mostly
// black field.
//
// The canvas Vortex work (`src/components/ui/vortex.tsx`, adapted from
// Aceternity's component) is left in place, unused, for when that
// experiment resumes -- not deleted.
//
// Layered on top: animate-ui's Stars Background (`src/components/ui/
// stars.tsx`, pulled in via `npx shadcn@latest view
// @animate-ui/components-backgrounds-stars` -- direct request 21 Sept
// 2026, "lets get back to experimenting"). Its own default is grayscale on
// black; recolored here to the SAME berry wash below (passed as its
// `background` prop) rather than the reference's own palette, and its
// `starColor` kept a plain, high-contrast white so the three drifting
// star layers read clearly against it instead of blending in (direct
// instruction: "match it to the background so it plays well with the
// background, not blend into it so i cant see it").
//
// `onPlayPulse` (backdropPulse.ts) still lets a game moment -- a correct
// answer, a term unlocked, a lesson finished -- bloom a brief radial flash
// from the center of the screen on top of the scene, so the reward reads in
// the background itself, not just on the card. This still uses the
// career's own accent -- a brief, earned reaction is a different thing
// from an always-on backdrop wash matching the UI.
const BACKDROP_WASH = [
  "radial-gradient(115% 95% at 15% -10%, rgba(219,39,119,0.55) 0%, transparent 68%)",
  "radial-gradient(105% 90% at 100% 105%, rgba(157,23,77,0.5) 0%, transparent 65%)",
  "linear-gradient(160deg, #2a0a1f 0%, #170a14 45%, #3a0f2c 100%)",
].join(", ");

export function PlayBackdrop({ accent = "#ffb81f", showStars = true }: { accent?: string; showStars?: boolean } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* `showStars=false` on the two celebration screens (Unlock complete,
         Lesson complete) -- direct instruction, 21 Sept 2026: "do not
         combine the fireworks with the star background use only the
         fireworks." Falls back to the plain berry wash with no stars, so
         the screen's own FireworksBackground is the only motion. `speed`
         is a duration in seconds for the smallest/fastest star layer (the
         other two scale off it, *2 and *3) -- the reference's own default
         of 50 read as too fast once seen live (direct feedback: "Slow the
         movement of the stars upward... please"). */}
      {showStars ? (
        <StarsBackground background={BACKDROP_WASH} starColor="#ffffff" speed={140} className="absolute inset-0 h-full w-full" />
      ) : (
        <div className="absolute inset-0 h-full w-full" style={{ background: BACKDROP_WASH }} />
      )}
      {bloom && (
        <span
          key={bloom.key}
          aria-hidden
          // `forwards` is load-bearing: without it, the moment the 900ms
          // animation ends the element reverts to CSS's default opacity (1,
          // fully visible) instead of holding the keyframe's own faded-out
          // end state -- a sharp, stuck, fully-opaque circle right after
          // every correct answer (direct feedback, 21 Sept 2026: "the sharp
          // round blob that appears after right answer is bad... let the
          // pulse stay and then fade away thats all, no color blobs
          // accumulating"). `forwards` keeps it pinned at opacity 0 once the
          // fade finishes, so nothing lingers between pulses.
          className="motion-safe:animate-[backdrop-bloom_900ms_ease-out_forwards] absolute top-1/2 left-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ "--bloom-peak": bloomPeak, background: `radial-gradient(closest-side, color-mix(in srgb, ${bloomColor} 55%, transparent), transparent 68%)` } as React.CSSProperties}
        />
      )}
    </div>
  );
}
