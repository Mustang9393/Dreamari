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

function averageColorFromImage(img: HTMLImageElement): [number, number, number] | null {
  try {
    const canvas = document.createElement("canvas");
    const size = 24;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let r = 0;
    let g = 0;
    let b = 0;
    const pixels = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    return [r / pixels, g / pixels, b / pixels];
  } catch {
    // Canvas is tainted (CORS) or the image failed to decode — fine, just skip the tint.
    return null;
  }
}

export function GifBanner({ gifId, alt = "", focus = "bottom" }: GifBannerProps) {
  const [glowColor, setGlowColor] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    const rgb = averageColorFromImage(event.currentTarget);
    if (rgb) setGlowColor(`rgb(${rgb[0] | 0}, ${rgb[1] | 0}, ${rgb[2] | 0})`);
  }

  if (failed) return null;

  return (
    // Same fixed-width box on every card — matches how chips/buttons/dropdowns all span the
    // full card width, instead of each gif rendering at its own natural size and reading as
    // randomly placed. Height is a fixed pixel value, not an aspect ratio tied to width — the
    // desktop card is much wider than the mobile one, and an aspect-ratio-driven height scaled
    // right up with it (over 300px tall), which is both way too visually dominant and tall
    // enough to force scrolling to reach the CTA even on a normal laptop screen.
    <div
      className="relative h-[104px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[124px]"
      style={{
        background: "var(--step-accent)",
        // Deliberately soft, not a bright halo — the gif is a supporting visual, not the
        // headline. A loud glow plus full-saturation footage competed with the actual
        // question/answers for attention, which should always win.
        boxShadow: glowColor
          ? `0 0 14px 1px color-mix(in srgb, ${glowColor} 35%, var(--step-accent) 65%)`
          : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://media.giphy.com/media/${gifId}/200w.gif`}
        alt={alt}
        crossOrigin="anonymous"
        onLoad={handleLoad}
        onError={() => setFailed(true)}
        // Desaturated and dimmed slightly so the gif reads as a supporting visual rather than
        // competing with the card's own headline for attention.
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
