"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { bricolage } from "./fonts";
import { LocalBurst } from "./ui";

// Re-exported for existing external consumers (MatchLab, the Glossary game)
// that import LocalBurst from this module -- it now lives in ui.tsx
// alongside QuestionHeading's own reaction burst, but the public import
// path stays stable so nothing else needs to change.
export { LocalBurst };

// The flow's interactive Dreamy — gamified, Duolingo-style: he PERCHES on the
// question block's top edge (the parent overlaps him onto the card, deliberately
// breaking the layout grid), tracks the cursor with a 3D parallax lean, floats,
// wiggles on hover, and celebrates input with a LOCAL confetti burst around
// himself plus a transient expression swap — never a screen-wide effect, and the
// bubble copy stays put so he informs without distracting.

type DreamyGuideProps = {
  sprite: string;
  line: string;
  reactionNonce?: number;
  reactionSprite?: string;
  /** "sm" is the compact perch variant -- smaller avatar, tighter halo, for
   *  overlapping a card's own top edge instead of claiming a full row
   *  (direct feedback, 16 Sept 2026: "place him in other already vacant
   *  spaces instead of increasing vertical space by giving him an entire
   *  row"). Every existing call site keeps the original "md" size. */
  size?: "md" | "sm";
};

const REACTION_MS = 950;

export function DreamyGuide({ sprite, line, reactionNonce = 0, reactionSprite = "/images/dreamy/v2/dreamy-heart.png", size = "md" }: DreamyGuideProps) {
  const compact = size === "sm";
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const [reacting, setReacting] = useState(false);
  const [wiggling, setWiggling] = useState(false);
  const lastNonce = useRef(reactionNonce);

  useEffect(() => {
    if (reactionNonce === lastNonce.current) return;
    lastNonce.current = reactionNonce;
    setReacting(true);
    const timer = setTimeout(() => setReacting(false), REACTION_MS);
    return () => clearTimeout(timer);
  }, [reactionNonce]);

  // Cursor parallax lean — fine pointers only; touch keeps the float bob.
  useEffect(() => {
    const tilt = tiltRef.current;
    if (!tilt || !window.matchMedia("(pointer:fine)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = 0;
    let curY = 0;
    let rafId = 0;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    function tick() {
      rafId = requestAnimationFrame(tick);
      if (!tilt) return;
      const r = tilt.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const tx = Math.max(-1, Math.min(1, (mouseX - cx) / 300));
      const ty = Math.max(-1, Math.min(1, (mouseY - cy) / 300));
      curX += (tx - curX) * 0.12;
      curY += (ty - curY) * 0.12;
      tilt.style.transform = `translate(${curX * 6}px, ${curY * 4}px) rotateX(${-curY * 10}deg) rotateY(${curX * 12}deg) rotateZ(${curX * 2.5}deg)`;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={`relative z-20 flex w-full items-center ${compact ? "gap-2" : "gap-3"}`}>
      <div
        className={compact ? "relative h-[44px] w-[44px] flex-none [perspective:600px] sm:h-[52px] sm:w-[52px]" : "relative h-[72px] w-[72px] flex-none [perspective:600px] sm:h-[88px] sm:w-[88px]"}
        onMouseEnter={() => {
          setWiggling(true);
          setTimeout(() => setWiggling(false), 650);
        }}
      >
        <div
          aria-hidden
          className={`absolute rounded-full ${compact ? "inset-[-35%]" : "inset-[-90%]"}`}
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 30%, transparent) 0%, color-mix(in srgb, var(--color-accent-purple) 9%, transparent) 42%, transparent 64%)" }}
        />
        <div className={`absolute inset-0 ${wiggling ? "motion-safe:[animation:dreamy-wiggle_0.6s_ease-in-out]" : "motion-safe:animate-[dreamy-breathe_5.5s_ease-in-out_infinite]"}`}>
          <div ref={tiltRef} className="relative h-full w-full [transition:transform_.06s_linear] [will-change:transform]">
            <Image
              key={reacting ? reactionSprite : sprite}
              src={reacting ? reactionSprite : sprite}
              alt="Dreamy"
              fill
              sizes="88px"
              className="object-contain motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]"
              priority
            />
          </div>
        </div>
        <LocalBurst nonce={reactionNonce} />
      </div>
      {/* Cinematic bubble: a frosted whisper-caption — near-black glass, a
         faint gradient hairline. Keyed by line so each stage's coaching
         re-performs its entrance. A plain fade + rise, not InkText's
         per-word blur-in -- that animation staggers and re-blurs every
         word, which in a bubble this size read as the text doubling up on
         itself mid-transition (direct feedback, 16 Sept 2026: "the text in
         the speech bubble is being repeated inside"). */}
      <div key={line} className="relative w-fit max-w-full motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]">
        <div
          aria-hidden
          className="absolute top-1/2 -left-[6px] h-3 w-3 -translate-y-1/2 rotate-45 rounded-[2px] backdrop-blur-md"
          style={{ background: "color-mix(in srgb, var(--color-night-card) 72%, transparent)", borderLeft: "1px solid var(--color-glass-border)", borderBottom: "1px solid var(--color-glass-border)" }}
        />
        <p
          className={`${bricolage.className} relative rounded-[var(--radius-lg)] ${compact ? "px-3 py-2 text-[12px] sm:text-[13.5px]" : "px-4 py-2.5 text-[13px] sm:text-[15px]"} leading-snug font-semibold text-[var(--color-night-foreground)] italic backdrop-blur-md`}
          style={{
            background: "color-mix(in srgb, var(--color-night-card) 72%, transparent)",
            border: "1px solid var(--color-glass-border)",
            boxShadow: "0 12px 40px -18px color-mix(in srgb, var(--color-accent-purple) 45%, transparent), inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent)",
          }}
        >
          {line}
        </p>
      </div>
    </div>
    );
}
