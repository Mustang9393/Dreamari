"use client";

import { useRef } from "react";
import { AudienceToggle } from "./AudienceToggle";
import { MarketingButton } from "./Button";
import { Mascot } from "./Mascot";

type HeroProps = {
  view: "student" | "schools";
  onChangeView: (view: "student" | "schools") => void;
};

export function Hero({ view, onChangeView }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    <section ref={heroRef} className="relative isolate overflow-hidden px-6 pt-[76px]">
      {/* color.styles "hero-surface": Purple-dark gradient for hero/featured backgrounds
         (hero-accent-purple -> hero-mid -> background). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "linear-gradient(90deg, var(--hero-accent-purple), var(--hero-mid) 65%, var(--background) 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-56 -right-40 h-[640px] w-[640px] rounded-full blur-[10px]"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(47,107,242,.35), rgba(122,45,226,.18) 45%, transparent 70%)" }}
      />
      {/* Fades the hero's own bottom edge to the flat background color right where the
          mascot gets cropped. Reaches full background well before this div's own
          bottom edge (55%, not 85%) so the actual hard overflow:hidden clip line always
          falls inside the already-fully-opaque zone — otherwise the clip can land in
          the still-transparent part of the gradient and show a visible seam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[140px]"
        style={{ background: "linear-gradient(180deg, transparent, var(--background) 55%)" }}
      />

      <div className="relative z-[2] mx-auto max-w-[1200px]">
        <div className="mb-[18px] flex justify-center">
          <AudienceToggle view={view} onChange={onChangeView} />
        </div>
        <div
          className="relative z-[2] mx-auto flex max-w-[720px] flex-col items-center text-center"
          // Reserves room below the CTAs for the mascot's peeking sliver (62% of its own
          // box, since it's cropped to show only its top 62%) so the copy and the mascot
          // can never overlap, at any hero height or viewport size.
          style={{ paddingBottom: "calc(clamp(190px, 34vw, 460px) * .62 + 28px)" }}
        >
          <h1 className="font-display text-[38px] font-extrabold sm:text-[52px]" style={{ lineHeight: 1.05, color: "var(--foreground)" }}>
            Discover your <span style={{ color: "var(--primary-tint)" }}>dream career.</span>
          </h1>
          <p className="mt-3 max-w-[500px] text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Step into real careers through guided simulations. Build the skills, earn the proof, and picture yourself
            in the room. One clear step at a time.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <MarketingButton href="/flow" variant="primary">
              Start exploring →
            </MarketingButton>
            <MarketingButton href="#how-it-works" variant="ghost">
              See how it works
            </MarketingButton>
          </div>
        </div>

        <Mascot heroRef={heroRef} />
      </div>
    </section>
  );
}
