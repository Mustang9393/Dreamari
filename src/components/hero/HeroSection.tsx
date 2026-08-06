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
          <RoleToggle />

          <div className="mt-2 flex flex-col items-center gap-1.5 sm:mt-3 sm:gap-2">
            <h1
              className="max-w-4xl font-display font-extrabold tracking-[0.03em] text-white"
              style={{ fontSize: "clamp(2.5rem, 5vw + 1.5vh, 5rem)", lineHeight: 0.9 }}
            >
              DREAMARI
            </h1>

            <h2
              className="max-w-3xl bg-gradient-to-r from-brand-100 via-brand-200 to-brand-400 bg-clip-text font-bold tracking-tight text-transparent"
              style={{ fontSize: "clamp(1.5rem, 1.6vw + 1.2vh, 2.75rem)", lineHeight: 1.12 }}
            >
              Discover your dream career.
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
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
