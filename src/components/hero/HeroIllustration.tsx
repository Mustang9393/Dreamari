import Image from "next/image";

// Square, matching the source image's natural ratio (no crop rectangle) — the "peeking
// from behind a wall" look comes from letting the *shape* of the cloud be occluded by
// the next section sitting in front of it, not from clipping it into a box.
const CLOUD_SIZE = "clamp(220px, 46vh, 560px)";
// How much of that full size stays reserved (and therefore guaranteed clear of the
// text/buttons above it) versus how much is allowed to hang below, into "How It Works."
const VISIBLE_FRACTION = 0.6;

export function HeroIllustration() {
  return (
    // A flex-participating slot reserving only the *visible* fraction of the cloud's
    // height — this is what actually guarantees the text/buttons above never overlap
    // it, on any screen size, the same way the old flow-based layout did. The full,
    // uncropped image lives inside it anchored to the top, deliberately taller than
    // this slot, so its remaining height overflows past the slot's (and the hero
    // section's) bottom edge into "How It Works," which occludes it there — that
    // overflow is what makes it read as peeking from behind that section rather than
    // being cropped into a box.
    //
    // No separate scroll-based opacity fade: as the user scrolls, "How It Works" rises
    // and progressively covers more of the cloud on its own — that occlusion *is* the
    // disappearing effect. Fading opacity on top of it as well made the cloud go
    // translucent well before the wall visually reached it, which read as murky
    // double-fading rather than one clean effect.
    // overflow-x-clip only (not overflow-hidden): the cloud can run slightly wider than
    // this slot on narrow/tall phone aspect ratios (its size is driven by vh, this
    // slot's width by the viewport), so horizontal clipping keeps that from causing a
    // page-wide horizontal scrollbar — but overflow-y must stay visible, since the
    // cloud hanging below this slot into "How It Works" is the intended effect.
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
        style={{ width: CLOUD_SIZE, height: CLOUD_SIZE }}
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
