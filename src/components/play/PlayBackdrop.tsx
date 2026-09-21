"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";

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
// This version is a fixed, always-dark, deep jade/emerald scene -- a cool
// hue nowhere near the game's warm gold UI (so gold pops as the one bright
// accent instead of blending in) and nowhere near the app's own blue/purple
// wash either, per the earlier "not the same blue/purple thing" feedback.
// It's fixed rather than derived from `accent` on purpose this time, so it
// never risks matching whichever career's world color happens to be warm.
//
// The canvas Vortex work (`src/components/ui/vortex.tsx`, adapted from
// Aceternity's component) is left in place, unused, for when that
// experiment resumes -- not deleted.
//
// `onPlayPulse` (backdropPulse.ts) still lets a game moment -- a correct
// answer, a term unlocked, a lesson finished -- bloom a brief radial flash
// from the center of the screen on top of the scene, so the reward reads in
// the background itself, not just on the card. This still uses the
// career's own accent -- a brief, earned reaction is a different thing
// from an always-on backdrop wash matching the UI.
export function PlayBackdrop({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: [
          // Two asymmetric jade/emerald glows -- a cool color a warm gold
          // UI reads clearly against, not a copy of it.
          "radial-gradient(95% 75% at 12% -8%, rgba(23,168,120,0.35) 0%, transparent 58%)",
          "radial-gradient(85% 70% at 105% 105%, rgba(15,120,110,0.28) 0%, transparent 55%)",
          // A deep, near-black jade floor.
          "linear-gradient(160deg, #0a1f19 0%, #0a0e12 48%, #10201c 100%)",
        ].join(", "),
      }}
    >
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
