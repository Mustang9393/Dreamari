"use client";

import { useRef } from "react";
import { BorderBeam } from "@/components/app/Beam";
import { AudienceToggle } from "./AudienceToggle";
import { MarketingButton } from "./Button";
import { Mascot } from "./Mascot";
import { NightSky } from "@/components/app/NightSky";

type HeroProps = {
  view: "student" | "schools";
  onChangeView: (view: "student" | "schools") => void;
};

export function Hero({ view, onChangeView }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    // 21 Oct 2026: min-h is the first screen plus 140px. The dusk sky's
    // surface gradient (look-v2.css) fades out over its last 12%, and with the
    // hero exactly one screen tall that fade sat on screen as a dark strip
    // under Dreamy (phones especially); now it always lands below the fold.
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
    // pt is clamp(120px, 15vh, 176px), not a flat 88px — with the copy top-anchored,
    // 88px put the audience toggle almost touching the floating nav island (~72px
    // envelope), which read as crowded (called out directly). Composition intent:
    // the island needs its own clear band of air (roughly two-thirds of its own
    // height below it) before the page's content begins, and that band should
    // breathe WITH the viewport — 15vh gives ~122px on a phone, ~150px on a laptop,
    // capped so a tall monitor doesn't push the headline into the page's middle.
    // The result keeps the headline block in the upper third (where a hero headline
    // reads as a headline) while the toggle sits in the quiet zone between nav and
    // headline rather than glued to either.
    <section ref={heroRef} data-landing-hero className="mkt-snap relative isolate flex min-h-[calc(100dvh+140px)] flex-col overflow-hidden px-6 pt-[calc(clamp(120px,15vh,176px)/var(--vz,1))]">
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
        data-hero-surface
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
        data-hero-glow
        className="pointer-events-none absolute -top-56 -right-40 h-[640px] w-[640px] rounded-full blur-[10px]"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(47,107,242,.35), rgba(122,45,226,.18) 45%, transparent 70%)" }}
      />
      {/* The app's night sky, lively here (cursor parallax, the odd shooting
         star; NightSky.tsx; Chandu, 21 Oct 2026: "add the stars to the landing
         page too but have them be more animated and engaging but not
         distracting"). Inside the hero, over its dusk gradient and under the
         copy: a page-level layer sat under that opaque gradient, or over
         later sections' text. Dark Black & Blue only, like everywhere. */}
      <NightSky lively />
      {/* the aurora is the page's, fixed to the screen's foot (MarketingApp.tsx) */}
      {/* The horizon Dreamy rises out of (21 Oct 2026): a wide, soft light
         at the bottom edge, so the bezel crop reads as a horizon he is
         peeking over, not a cut. Light only, no band of colour. */}
      <div
        aria-hidden
        data-hero-horizon
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
        style={{ background: "radial-gradient(60% 70% at 50% 100%, color-mix(in srgb, var(--primary-tint, #7aa2ff) 34%, transparent), color-mix(in srgb, var(--primary-tint, #7aa2ff) 10%, transparent) 45%, transparent 75%)" }}
      />
      {/* No bottom curtain/dim strip here anymore — the mascot now fades ITSELF to
         full transparency before the section's overflow-hidden crop line can touch it
         (see the mask on Mascot.tsx's float wrapper for the geometry). Any curtain
         painted here, translucent or not, necessarily tints the ambient page gradient
         behind it and reads as a band; self-fading alpha has no color to mismatch. */}

      {/* flex-1 + w-full stretches this wrapper to the section's full dvh-filling
         height. justify-START (round three of this knob, per direct feedback each
         time): -center read as floaty, -end packed the headline too far DOWN the
         screen ("starts too low"). Top-anchored copy starts right under the nav
         like a normal landing page; leftover height on tall screens pools between
         the scroll hint and Dreamy at the bezel, which reads as his airspace —
         and he's visibly holding the bottom of it the whole time it scrolls by. */}
      <div className="relative z-[2] mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-start">
        {/* Every vertical gap from here through the scroll hint divides by
           --vz (this app's own wide-screen zoom, globals.css: 1.1x/1.25x
           past 1441x800/1800x900) instead of scaling up WITH it, the way
           font sizes and the headline correctly do. Measured live: with
           zoom on, this stack's ordinary margins alone (not the text) were
           what pushed "Scroll Down" 15-135px into the mascot -- Mascot.tsx's
           own stage already cancels the SAME zoom on itself (`zoom: calc(1 /
           var(--vz, 1))`, since it's `position:fixed` and its transform math
           assumes 1 local px = 1 real px), so its real position no longer
           grows with zoom at all, while this content kept growing toward
           it. Canceling zoom on the GAPS (not the type) keeps the mascot
           clearance solid at every zoom tier while type still gets
           appropriately bigger on a wide screen, which is the zoom system's
           actual job (direct feedback, 23 Sept 2026, screenshot: "Landing
           page issue on chrome. Overlapping elements"). */}
        <div className="mb-[calc(34px_/_var(--vz,1))] flex justify-center [@media(max-height:600px)]:mb-2">
          <AudienceToggle view={view} onChange={onChangeView} />
        </div>
        <div
          className="relative z-[2] mx-auto flex max-w-[720px] flex-col items-center text-center"
          // 21 Oct 2026: .58 (the new crop) + 160px, so the hero still runs
          // well past the fold; at exactly 100dvh the surface's fade-out
          // (70%..100% of the section) landed on screen as a dark band
          // under Dreamy.
          // Extends the section past 100dvh by the mascot's own local peek
          // height (77% of --mascot-size, matching Mascot.tsx's own
          // VISIBLE_FRACTION so the two can't drift apart) -- NOT what
          // creates the mascot clearance itself (padding after the last
          // child can't push that child up; confirmed empirically, a 1000px
          // override here moved nothing). Its real job is giving `main`
          // (min-h-[100dvh]) genuine scroll room below the fold sized to
          // the mascot, for the scroll-snap section below and the exit
          // animation's own scroll-driven math.
          // Capped at the pre-6-Oct size (460px): on tall screens Dreamy now
          // grows to fill the fold (tokens.css), and an uncapped reserve
          // would have added ~340px of empty scroll before Build. His exit is
          // timed off Build's arrival (Mascot.tsx), not this reserve.
          style={{ paddingBottom: "calc((min(var(--mascot-size), 520px) * .58 + 160px) / var(--vz, 1))" }}
        >
          <h1
            className="font-display text-[42px] font-extrabold uppercase [@media(max-height:600px)]:text-[28px] sm:text-[clamp(58px,calc(4.4vw/var(--vz,1)),72px)]"
            style={{ lineHeight: 1.05, color: "var(--foreground)" }}
          >
            <span style={{ color: "var(--primary-tint)" }}>Dream</span>ari
          </h1>
          {/* textWrap:balance so the browser picks break points from the
             ACTUAL rendered width, keeping every line a reasonably even
             length instead of stranding a lone short word (a widow). */}
          <p
            className="mt-[calc(20px_/_var(--vz,1))] max-w-[580px] text-[clamp(16px,0.8vw+12px,19px)] leading-relaxed [@media(max-height:600px)]:mt-1 [@media(max-height:600px)]:text-[13px] [@media(max-height:600px)]:leading-snug"
            style={{ color: "var(--muted-foreground)", textWrap: "balance" }}
          >
            Discover careers, find your path, experience the work, and connect with professionals who do it every day.
          </p>
          {/* "Build. Match. Explore. Play. Connect." removed (16 Sept 2026,
             direct decision): the next section already introduces these five
             words and what each means, and the closing section brings them
             back in the same styling -- repeating them a third time here,
             before either has been explained, added a line without adding
             information. */}
          {/* Single CTA per direct feedback — the ghost "See how it works" button is
             gone; Dreamy at the bottom edge covers "there's more to see." */}
          {/* The site's single most important CTA (first thing every visitor
             sees) gets the strongest, always-on beam treatment -- not
             hover-only like an internal card, since the whole point is to
             catch the eye of someone who hasn't decided to interact yet
             (direct feedback, 9 Sept 2026: beam candidates "even on the
             landing page"). Same 3.5s family as everywhere else, full
             strength. */}
          <div className="mt-[calc(40px_/_var(--vz,1))] flex flex-wrap justify-center gap-3 [@media(max-height:600px)]:mt-3">
            {/* data-hero-cta: Dreamy perks up while this is hovered or focused
               (animations.css, :has), pointing the eye at the one action */}
            <span data-hero-cta className="contents">
              <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={1} brightness={1.8}>
                <MarketingButton href="/flow" variant="primary" size="lg">
                  Start Journey
                </MarketingButton>
              </BorderBeam>
            </span>
          </div>
          {/* "Scroll Down To Learn More" left 21 Oct 2026: it sat on Dreamy's
             head (Chandu: "dreamy sits too far up and overlaps the scroll down
             to learn more text"), and Dreamy rising out of the bottom edge
             already says there is more below. Freeing that strip is what lets
             him be bigger. */}
        </div>

        <Mascot heroRef={heroRef} />
      </div>
    </section>
  );
}
