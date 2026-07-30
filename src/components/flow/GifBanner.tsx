"use client";

import { useState, type SyntheticEvent } from "react";

type GifBannerProps = {
  /** Giphy media ID — the trailing id segment of a giphy.com/gifs/... page URL. Embedded
   * directly via Giphy's CDN rather than their search API: the API needs a real per-app
   * key, and the widely-shared public demo key gets abused into rate-limit bans constantly
   * (confirmed while building this — it 403'd), so a few curated, hand-picked IDs are the
   * more reliable path for a small, fixed set of cards like these. */
  gifId: string;
  alt?: string;
  /** Where to bias the crop. Most meme gifs burn their caption in near the bottom, so that's
   * the default — but caption-free ones with a centered subject (a face, a gesture) need
   * "center" instead, or the crop cuts the subject off entirely. */
  focus?: "bottom" | "center";
};

// Placeholder aspect ratio before the real gif has loaded — close to the middle of what
// our actual gifs run (square through ~16:9-ish), so there's no jarring resize once the
// true ratio swaps in.
const DEFAULT_RATIO = 1.4;

export function GifBanner({ gifId, alt = "", focus = "bottom" }: GifBannerProps) {
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [failed, setFailed] = useState(false);

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget;
    if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
  }

  if (failed) return null;

  return (
    // Width is the fixed dimension now (100% of the card, edge to edge — matching the
    // reference: it never gets narrower than the card just to avoid growing tall, and
    // never pillarboxes). Height is derived from that width via the gif's own loaded
    // aspect-ratio, uncapped — a square or portrait gif genuinely does end up taller here,
    // and on a short step that can mean a small scroll to reach the CTA, which is an
    // accepted, occasional trade-off (confirmed against the reference itself, which has
    // the same behavior) rather than something to fix by shrinking or cropping the gif.
    // maxHeight is just a sanity ceiling for a pathological (e.g. very tall portrait) gif,
    // not a normal constraint — none of our current gifs come close to hitting it.
    //
    // No glow/tint here anymore — a colored box-shadow mixing the gif's own dominant color
    // with the step's accent color read as an unwanted colored halo around the container
    // (especially obvious on green-accented steps). Plain, uncolored container; the gif
    // itself is the whole visual.
    <div
      className="relative w-full shrink-0 self-center overflow-hidden rounded-xl bg-black/5 dark:bg-white/5"
      style={{ aspectRatio: ratio, maxHeight: 420 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://media.giphy.com/media/${gifId}/200w.gif`}
        alt={alt}
        onLoad={handleLoad}
        onError={() => setFailed(true)}
        // object-cover, not object-contain: the box's aspect-ratio is set to the gif's own
        // loaded ratio, so in principle they match exactly and neither crop nor letterbox
        // would be needed — but CSS aspect-ratio and the image's actual decoded pixels
        // don't always agree to the sub-pixel (rounding in the layout box vs. the image's
        // own dimensions), and object-contain left a persistent hairline of the container
        // background showing through on whichever side rounded short. object-cover
        // guarantees full coverage — the crop needed to close that gap is negligible.
        className={`absolute inset-0 size-full object-cover saturate-[0.65] brightness-[0.88] ${
          focus === "bottom" ? "object-bottom" : "object-center"
        }`}
      />
      {/* Bottom scrim — mutes any burned-in caption text specifically (the loudest part of
          most meme gifs) without touching the visual above it. Skipped for centered/caption-
          free gifs, where there's no caption to mute and it would just needlessly darken the
          subject's lower half. */}
      {focus === "bottom" && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 100%)" }}
        />
      )}
    </div>
  );
}
