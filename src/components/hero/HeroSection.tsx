import { Button } from "@/components/ui/Button";
import { GradientBlobs } from "./GradientBlobs";
import { RoleToggle } from "./RoleToggle";
import { HeroIllustration } from "./HeroIllustration";
import { ScrollNudge } from "./ScrollNudge";

export function HeroSection() {
  return (
    // A single viewport-height frame, not a document-flow block that grows with its
    // content: toggle/copy/buttons sit in a flex-1 middle section that centers
    // itself in whatever room remains. No overflow-hidden here (unlike before) — the
    // cloud is deliberately allowed to extend past this section's own bottom edge, so
    // "How It Works" (the next section) can occlude the overflowing part and it reads
    // as peeking from behind that section rather than being cropped into a box.
    <section
      // No min-height floor: on a real phone the visible viewport (browser chrome
      // included) can be well under a desktop-oriented "reasonable minimum," and a
      // min-height that exceeds it forces the section taller than one screen — which is
      // exactly what "always fits in one screen" was supposed to prevent. h-dvh alone
      // already tracks the actual current viewport correctly.
      className="relative isolate flex h-dvh flex-col px-6 pt-5 sm:px-10 sm:pt-6 lg:px-16"
      style={{
        background: "radial-gradient(ellipse 120% 90% at 85% 35%, var(--color-brand-700) 0%, var(--color-brand-900) 45%, var(--color-brand-950) 100%)",
      }}
    >
      <GradientBlobs />

      {/* Forces this section's own bottom edge to a known, exact color instead of
          trusting wherever the radial gradient above naturally falls off to at that
          point — an ellipse centered at 85%/35% doesn't necessarily reach its own
          100% stop color right at the box's bottom edge (it varies with viewport
          aspect ratio), so without this the actual rendered bottom-edge color could
          be visibly brighter than the shade "How It Works" starts its own top mask
          from, reading as a hard seam between the two sections. z-[1]: above the
          background/blobs, below the actual nav/copy/button content (z-10), so it
          darkens what's behind those without dimming the content itself. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[48%]"
        style={{ background: "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-brand-950) 40%, transparent) 55%, var(--color-brand-950) 100%)" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col items-center">
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center sm:gap-6">
          <ScrollNudge />

          {/* Reorder mockup v2 (position/size only, no copy changes, pending approval):
              toggle leads, on its own — a PayPal-style "Personal/Business" pattern, where
              the mode selector sits above the headline because it's about to gate which
              hero actually renders (per the enterprise-toggle plan). DREAMARI + the
              headline are their own tightly-grouped inner block (own small gap) so they
              read as one "brand → promise" unit, separated from the toggle by the outer
              column's own (larger) gap — not a manual negative-margin adjustment fighting
              that same gap. */}
          <RoleToggle />

          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            {/* Bumped up (was clamp(1rem,...,1.5rem)) — the Student/Enterprise toggle
                above was rendering with a visibly taller footprint than the actual brand
                mark (34px vs. 20px, measured), which put a secondary utility control
                ahead of brand identity. Also trimmed the toggle's own padding down
                (RoleToggle.tsx), but a pill BUTTON has a padding floor a single text line
                doesn't — it still needs a real tap target — so closing the rest of the
                gap has to come from DREAMARI's side. */}
            <p
              className="font-display font-extrabold tracking-[0.08em] text-brand-200 uppercase"
              style={{ fontSize: "clamp(1.375rem, 2vw + 1vh, 2.25rem)", lineHeight: 1.1 }}
            >
              DREAMARI
            </p>

            <h1
              className="max-w-5xl font-extrabold tracking-tight text-white"
              style={{ fontSize: "clamp(2.75rem, 5.5vw + 1.7vh, 5.5rem)", lineHeight: 1.02 }}
            >
              Discover your dream career.
            </h1>
          </div>

          <p
            className="max-w-2xl leading-relaxed text-ink-100"
            style={{ fontSize: "clamp(0.9rem, 0.5vw + 1.1vh, 1.25rem)" }}
          >
            Build your profile, match with careers, play day-in-the-life work simulations,
            explore new paths, and connect with professionals.
            <br />
            <span className="font-bold">One clear step at a time.</span>
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button variant="cta-solid" href="/flow">
              Start my journey
            </Button>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
