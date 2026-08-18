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
    // min-h fills the first screen exactly (100dvh minus the sticky nav's 77px of
    // in-flow height) — per direct feedback, Dreamy's crop line must ALWAYS be the
    // screen's own bottom edge: before this, the hero was only as tall as its
    // content, so on tall viewports (tablet portrait especially) the section ended
    // mid-screen and the mascot visibly dissolved against nothing, "floating" with
    // no edge motivating the cut. flex + the inner wrapper's flex-1/justify-center
    // distribute any leftover height AROUND the copy block instead of dumping it
    // all in one void above the mascot — that's the "without introducing so much
    // blank space" half of the request: the gap gets split roughly half above the
    // toggle and half between the CTA and the mascot, so neither reads as empty.
    <section ref={heroRef} className="relative isolate flex min-h-[calc(100dvh-77px)] flex-col overflow-hidden px-6 pt-[76px]">
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
      {/* No bottom curtain/dim strip here anymore — the mascot now fades ITSELF to
         full transparency before the section's overflow-hidden crop line can touch it
         (see the mask on Mascot.tsx's float wrapper for the geometry). Any curtain
         painted here, translucent or not, necessarily tints the ambient page gradient
         behind it and reads as a band; self-fading alpha has no color to mismatch. */}

      {/* flex-1 + w-full: stretches this wrapper to the section's full (now dvh-
         filling) height so the Mascot's absolute bottom-0 lands on the section's —
         i.e. the screen's — real bottom edge, and justify-center recenters the copy
         in whatever's left. */}
      <div className="relative z-[2] mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center">
        <div className="mb-[18px] flex justify-center [@media(max-height:600px)]:mb-2">
          <AudienceToggle view={view} onChange={onChangeView} />
        </div>
        <div
          className="relative z-[2] mx-auto flex max-w-[720px] flex-col items-center text-center"
          // Reserves room below the CTAs for the mascot's peeking sliver (77% of its
          // own box, since it's cropped to show its top 77% — see Mascot.tsx's
          // VISIBLE_FRACTION) so the copy and the mascot can never overlap, at any hero
          // height or viewport size. Reads the same --mascot-size Mascot.tsx uses
          // (tokens.css), so the two can't drift apart; the multiplier itself has to be
          // kept in sync by hand with VISIBLE_FRACTION since it's not a shared import.
          style={{ paddingBottom: "calc(var(--mascot-size) * .77 + 16px)" }}
        >
          <h1
            className="font-display text-[38px] font-extrabold uppercase [@media(max-height:600px)]:text-[28px] sm:text-[clamp(52px,4vw,64px)]"
            style={{ lineHeight: 1.05, color: "var(--foreground)" }}
          >
            <span style={{ color: "var(--primary-tint)" }}>Dream</span>ari
          </h1>
          {/* textWrap:balance (not fixed <span className="block"> breaks) — a longer
             caption now that "Discover your dream career" moved down here from the
             headline above, so hardcoded 2-line breaks would risk a lone short word
             stranded on its own line at some widths (a widow). Balance lets the
             browser pick break points based on the ACTUAL rendered width, keeping
             every line a reasonably even length instead. */}
          <p
            className="mt-3 max-w-[580px] text-[clamp(16px,0.8vw+12px,19px)] leading-relaxed [@media(max-height:600px)]:mt-1 [@media(max-height:600px)]:text-[13px] [@media(max-height:600px)]:leading-snug"
            style={{ color: "var(--muted-foreground)", textWrap: "balance" }}
          >
            Discover your dream career. Build, match, explore, simulate, and connect, all in one place. One clear step at a time.
          </p>
          {/* Single CTA per direct feedback — the ghost "See how it works" button is
             gone; the scroll hint below already covers "there's more to see." */}
          <div className="mt-5 flex flex-wrap justify-center gap-3 [@media(max-height:600px)]:mt-2">
            <MarketingButton href="/flow" variant="primary">
              Start Journey
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
