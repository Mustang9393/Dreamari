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
          mascot gets cropped. Kept short and back-loaded (only the last ~15% of its own
          height is fully opaque): the mascot's eyes sit near the BOTTOM of its visible
          62% crop (not the middle), so a taller/earlier fade here doesn't just smooth
          the clip line, it hides the eyes entirely on short mobile viewports where the
          mascot is already at its 190px floor size. The seam this was fixing is handled
          by keeping the ambient glow (Mascot.tsx) well clear of the crop edge instead. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[48px]"
        style={{ background: "linear-gradient(180deg, transparent, var(--background) 88%)" }}
      />

      <div className="relative z-[2] mx-auto max-w-[1200px]">
        <div className="mb-[18px] flex justify-center [@media(max-height:600px)]:mb-2">
          <AudienceToggle view={view} onChange={onChangeView} />
        </div>
        <div
          className="relative z-[2] mx-auto flex max-w-[720px] flex-col items-center text-center"
          // Reserves room below the CTAs for the mascot's peeking sliver (62% of its own
          // box, since it's cropped to show only its top 62%) so the copy and the mascot
          // can never overlap, at any hero height or viewport size. Reads the same
          // --mascot-size Mascot.tsx uses (tokens.css), so the two can't drift apart.
          style={{ paddingBottom: "calc(var(--mascot-size) * .63 + 16px)" }}
        >
          <h1
            className="font-display text-[38px] font-extrabold [@media(max-height:600px)]:text-[28px] sm:text-[52px]"
            style={{ lineHeight: 1.05, color: "var(--foreground)" }}
          >
            Discover your <span style={{ color: "var(--primary-tint)" }}>dream career.</span>
          </h1>
          <p
            className="mt-3 max-w-[500px] text-[16px] leading-relaxed [@media(max-height:600px)]:mt-1 [@media(max-height:600px)]:text-[13px] [@media(max-height:600px)]:leading-snug"
            style={{ color: "var(--muted-foreground)" }}
          >
            <span className="block">Build, match, play, explore, and connect, all in one place.</span>
            <span className="block">One clear step at a time.</span>
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 [@media(max-height:600px)]:mt-2">
            <MarketingButton href="/flow" variant="primary">
              Start my journey
            </MarketingButton>
            <MarketingButton href="#how-it-works" variant="ghost">
              See how it works
            </MarketingButton>
          </div>
          {/* Hidden on short viewports (same tier the mascot-visibility fix already
              tightens elsewhere) so this never competes with the mascot's peeking sliver
              for the little vertical room a short phone has above the fold. */}
          <div
            className="mt-8 font-mono text-[11px] font-bold tracking-[0.14em] uppercase [@media(max-height:600px)]:hidden"
            style={{ color: "var(--muted-foreground)" }}
          >
            Scroll
            <div className="mt-1 text-[14px] leading-none">⌄</div>
          </div>
        </div>

        <Mascot heroRef={heroRef} />
      </div>
    </section>
  );
}
