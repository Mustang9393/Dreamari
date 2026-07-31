"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Square, matching the source image's natural ratio (no crop rectangle).
const CLOUD_SIZE = "clamp(220px, 46vh, 560px)";
// How much of that full size stays reserved (and therefore guaranteed clear of the
// text/buttons above it) versus how much sits below, toward "How It Works."
const VISIBLE_FRACTION = 0.6;
// Dreamy fades out over this fraction of one viewport height of scroll — deliberately
// short, so it's fully gone well before "How It Works" reaches it, instead of a visible
// half-cropped remnant riding along under that section's own background.
const FADE_OUT_VH_FRACTION = 0.32;

export function HeroIllustration() {
  // Starts at 1 (not read from scrollY) since this also renders on the server, where
  // window doesn't exist — the real value syncs in on mount below, and the very first
  // frame at scrollY 0 would be 1 anyway.
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let rafId = 0;
    let scheduled = false;

    function update() {
      scheduled = false;
      const fadeDistance = window.innerHeight * FADE_OUT_VH_FRACTION;
      const next = 1 - Math.min(1, window.scrollY / fadeDistance);
      setOpacity(next);
    }

    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    // A flex-participating slot reserving only the *visible* fraction of the cloud's
    // height — this is what guarantees the text/buttons above never overlap it, on any
    // screen size. overflow-x-clip only (not overflow-hidden): the cloud can run
    // slightly wider than this slot on narrow/tall phone aspect ratios (its size is
    // driven by vh, this slot's width by the viewport), so horizontal clipping keeps
    // that from causing a page-wide horizontal scrollbar — but overflow-y stays
    // visible, since the reserved slot is shorter than the full image.
    <div className="relative w-full shrink-0 overflow-x-clip" style={{ height: `calc(${CLOUD_SIZE} * ${VISIBLE_FRACTION})` }}>
      {/* left-1/2 + -translate-x-1/2, not inset-x-0 + mx-auto: this slot sits inside the
          hero's padded content column, which is narrower than the full viewport on
          small screens, so it's narrower than CLOUD_SIZE there — auto-margin centering
          only works when the container is wider than its content, so it was pinning the
          cloud to the slot's left edge and overflowing off the right side of the
          screen instead of centering. Percentage `left` resolves against the
          container, but `translateX` resolves against the element's *own* width, so
          this centers correctly regardless of how the two compare. */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 animate-[cloud-float_6s_ease-in-out_infinite]"
        style={{ width: CLOUD_SIZE, height: CLOUD_SIZE, opacity, willChange: "opacity" }}
      >
        <Image
          src="/images/hero-cloud-mascot.png"
          alt="Dreamari mascot — a friendly cloud character"
          fill
          sizes="560px"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
