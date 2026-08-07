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
          {/* Toggle leads, on its own — a PayPal-style "Personal/Business" pattern, where
              the mode selector sits above the headline because it's about to gate which
              hero actually renders (per the enterprise-toggle plan). Extra margin below
              (on top of the outer column's own gap) pushes it further from the brand group
              than any other pair of siblings in this column, so it reads as clearly
              separate rather than a caption sitting just above DREAMARI. */}
          <div className="mb-2 sm:mb-3">
            <RoleToggle />
          </div>

          {/* Per the approved UIKIT hero reference (Figma node 1036:39072): DREAMARI is the
              single largest element on screen, with the career-promise headline sized well
              below it. Sizes scale with clamp(vw + vh) rather than fixed breakpoints so the
              same ~2.3x DREAMARI-to-headline ratio holds from mobile through desktop. */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <h1
              className="font-display font-extrabold tracking-[0.04em] text-white uppercase"
              style={{ fontSize: "clamp(3rem, 6.5vw + 2vh, 7rem)", lineHeight: 0.95 }}
            >
              DREAMARI
            </h1>

            <h2
              className="max-w-4xl font-extrabold tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 2.2vw + 1.1vh, 3rem)", lineHeight: 1.15 }}
            >
              <span className="text-white">Discover your </span>
              <span className="bg-gradient-to-r from-brand-100 to-brand-600 bg-clip-text text-transparent">
                dream career.
              </span>
            </h2>
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

          <ScrollNudge />
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
