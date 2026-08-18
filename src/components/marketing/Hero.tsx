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
         (hero-accent-purple -> hero-mid -> background). Vertically masked to fade out
         before the section's own bottom edge — this used to cover Hero's full height
         at a flat 60% opacity with a hard stop right at the section boundary, which
         read as a visible seam once the page background became a vivid multi-color
         ambient wash (MarketingApp.tsx) instead of one flat color: Hero looked
         distinctly different from the section immediately below it, with a sharp line
         exactly where one ended and the other began. Fading this overlay's own
         opacity out lets it dissolve into that same ambient layer underneath instead
         of cutting off hard. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(90deg, var(--hero-accent-purple), var(--hero-mid) 65%, var(--background) 100%)",
          opacity: 0.6,
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-56 -right-40 h-[640px] w-[640px] rounded-full blur-[10px]"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(47,107,242,.35), rgba(122,45,226,.18) 45%, transparent 70%)" }}
      />
      {/* Dims (rather than replaces) the hero's own bottom edge right where the mascot
         gets cropped by this section's overflow-hidden — fading in a translucent BLACK
         (not a flat opaque color) means it darkens whatever's actually behind it at
         that point instead of painting over it with one hardcoded hue, so it still
         blends once that background is a vivid multi-color ambient gradient rather
         than a single flat color. A first attempt tried fading the mascot's own alpha
         out via mask-image instead of a curtain at all, which seemed cleaner, but
         mask-image also clips any filter effects on its descendants (here, the
         mascot's drop-shadow) to the masked box's own bounds — since the shadow
         normally spreads a little past the mascot's raster edges, that turned into a
         visible rectangular halo cutoff, a worse artifact than the one being fixed. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[70px]"
        style={{ background: "linear-gradient(180deg, transparent, rgba(2,3,10,0.62) 88%)" }}
      />

      <div className="relative z-[2] mx-auto max-w-[1200px]">
        <div className="mb-[18px] flex justify-center [@media(max-height:600px)]:mb-2">
          <AudienceToggle view={view} onChange={onChangeView} />
        </div>
        <div
          className="relative z-[2] mx-auto flex max-w-[720px] flex-col items-center text-center"
          // Reserves room below the CTAs for the mascot's peeking sliver (70% of its own
          // box, since it's cropped to show its top 70% — see Mascot.tsx's
          // VISIBLE_FRACTION) so the copy and the mascot can never overlap, at any hero
          // height or viewport size. Reads the same --mascot-size Mascot.tsx uses
          // (tokens.css), so the two can't drift apart; the multiplier itself has to be
          // kept in sync by hand with VISIBLE_FRACTION since it's not a shared import.
          style={{ paddingBottom: "calc(var(--mascot-size) * .7 + 16px)" }}
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
              Start Journey
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
            Scroll Down To Learn More
            <div className="mt-1 text-[14px] leading-none">⌄</div>
          </div>
        </div>

        <Mascot heroRef={heroRef} />
      </div>
    </section>
  );
}
