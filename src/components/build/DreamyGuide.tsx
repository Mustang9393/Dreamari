"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { bricolage } from "./fonts";
import { useVariant } from "./variant";
import { InkText } from "./ui";

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
};

const REACTION_MS = 950;

// Local burst particle vectors (deterministic, no randomness at render — SSR-safe
// and consistent): 10 particles fanning up/outward from Dreamy's head.
const BURST_PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (-95 + i * 21) * (Math.PI / 180);
  const distance = 46 + (i % 3) * 16;
  return {
    bx: `${Math.round(Math.cos(angle) * distance)}px`,
    by: `${Math.round(Math.sin(angle) * distance)}px`,
    br: `${i % 2 === 0 ? 200 : -160}deg`,
    delay: `${(i % 4) * 0.03}s`,
    color: ["var(--color-brand-400)", "var(--color-accent-purple)", "var(--color-world-arts-media-sport)", "var(--color-world-business-money-office)"][i % 4],
  };
});

export function LocalBurst({ nonce }: { nonce: number }) {
  if (nonce === 0) return null;
  return (
    <div key={nonce} aria-hidden className="pointer-events-none absolute inset-0">
      {BURST_PARTICLES.map((particle, i) => (
        <span
          key={i}
          className="absolute top-1/3 left-1/2 h-1.5 w-1.5 rounded-[2px] motion-safe:animate-[dreamy-burst_0.7s_ease-out_forwards]"
          style={{
            background: particle.color,
            ["--bx" as string]: particle.bx,
            ["--by" as string]: particle.by,
            ["--br" as string]: particle.br,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export function DreamyGuide({ sprite, line, reactionNonce = 0, reactionSprite = "/images/dreamy/v2/dreamy-heart.png" }: DreamyGuideProps) {
  const variant = useVariant();
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

  if (variant === "cinematic") {
    // Boxless composition: Dreamy floats centered with his line as quiet,
    // centered narration — no glass bubble, no perch (there is no card edge).
    return (
      <div className="relative z-20 flex w-full items-center gap-3">
        <div
          className="relative flex-none [perspective:600px]"
          style={{ width: 88, height: 88 }}
          onMouseEnter={() => {
            setWiggling(true);
            setTimeout(() => setWiggling(false), 650);
          }}
        >
          <div
            aria-hidden
            className="absolute inset-[-90%] rounded-full"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 30%, transparent) 0%, color-mix(in srgb, var(--color-accent-purple) 9%, transparent) 42%, transparent 64%)" }}
          />
          <div className={`absolute inset-0 ${wiggling ? "motion-safe:[animation:dreamy-wiggle_0.6s_ease-in-out]" : "motion-safe:animate-[cloud-float_5.5s_ease-in-out_infinite]"}`}>
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
           faint gradient hairline, and the line materializing ink-style. Keyed
           by line so each stage's coaching re-performs its entrance. */}
        <div key={line} className="relative flex-1">
          <div
            aria-hidden
            className="absolute top-1/2 -left-[6px] h-3 w-3 -translate-y-1/2 rotate-45 rounded-[2px] backdrop-blur-md"
            style={{ background: "color-mix(in srgb, var(--color-night-card) 72%, transparent)", borderLeft: "1px solid var(--color-glass-border)", borderBottom: "1px solid var(--color-glass-border)" }}
          />
          <p
            className={`${bricolage.className} relative rounded-2xl px-4 py-2.5 text-[14px] leading-snug font-semibold text-[var(--color-night-foreground)] italic backdrop-blur-md sm:text-[15px]`}
            style={{
              background: "color-mix(in srgb, var(--color-night-card) 72%, transparent)",
              border: "1px solid var(--color-glass-border)",
              boxShadow: "0 12px 40px -18px color-mix(in srgb, var(--color-accent-purple) 45%, transparent), inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent)",
            }}
          >
            <InkText text={line} delay={0.15} />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 flex w-full items-end gap-2.5 sm:gap-3">
      {/* Negative bottom margin makes him PERCH OVER the card's top edge below —
         gamified, physics-defying placement per direct request. */}
      <div
        className="relative -mb-2 flex-none [perspective:600px] sm:-mb-3"
        style={{ width: 104, height: 104 }}
        onMouseEnter={() => {
          setWiggling(true);
          setTimeout(() => setWiggling(false), 650);
        }}
      >
        <div
          aria-hidden
          className="absolute inset-[-90%] rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 34%, transparent) 0%, color-mix(in srgb, var(--color-accent-purple) 10%, transparent) 42%, transparent 64%)" }}
        />
        <div className={`absolute inset-0 ${wiggling ? "motion-safe:[animation:dreamy-wiggle_0.6s_ease-in-out]" : "motion-safe:animate-[cloud-float_5.5s_ease-in-out_infinite]"}`}>
          <div ref={tiltRef} className="relative h-full w-full [transition:transform_.06s_linear] [will-change:transform]">
            <Image
              key={reacting ? reactionSprite : sprite}
              src={reacting ? reactionSprite : sprite}
              alt="Dreamy"
              fill
              sizes="104px"
              className="object-contain motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]"
              priority
            />
          </div>
        </div>
        <LocalBurst nonce={reactionNonce} />
      </div>

      {/* Speech bubble beside his head, above the card edge he perches on. */}
      <div className="relative mb-4 flex-1 sm:mb-5">
        <div
          aria-hidden
          className="absolute top-1/2 -left-[7px] h-3.5 w-3.5 -translate-y-1/2 rotate-45 rounded-[3px] border-b border-l backdrop-blur-xl"
          style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-border)" }}
        />
        <p
          className={`${bricolage.className} relative rounded-2xl border px-4 py-2.5 text-[14px] leading-snug font-semibold text-[var(--color-night-foreground)] backdrop-blur-xl sm:text-[15px]`}
          style={{
            background: "var(--color-glass-surface-3)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          {line}
        </p>
      </div>
    </div>
  );
}
