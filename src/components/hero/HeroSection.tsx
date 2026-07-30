import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { GradientBlobs } from "./GradientBlobs";
import { RoleToggle } from "./RoleToggle";
import { HeroIllustration } from "./HeroIllustration";
import { ScrollNudge } from "./ScrollNudge";

export function HeroSection() {
  return (
    // A single viewport-height frame, not a document-flow block that grows with its
    // content: nav/toggle/copy/buttons sit in a flex-1 middle section that centers
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
        background: "radial-gradient(ellipse 120% 90% at 85% 35%, #143c96 0%, #0c2560 45%, #0a1e4c 100%)",
      }}
    >
      <GradientBlobs />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col items-center">
        <Navbar />

        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center sm:gap-6">
          <ScrollNudge />
          <RoleToggle />

          <h1
            className="max-w-4xl font-extrabold tracking-tight text-white uppercase"
            style={{ fontSize: "clamp(1.875rem, 3.45vw + 2.5vh, 4.625rem)", lineHeight: 0.95 }}
          >
            Discover Your{" "}
            <span className="bg-gradient-to-r from-brand-400 from-[26%] to-brand-200 to-[62.5%] bg-clip-text text-transparent">
              Dream Career
            </span>
          </h1>

          <p
            className="max-w-2xl leading-relaxed text-ink-100"
            style={{ fontSize: "clamp(0.9rem, 0.5vw + 1.1vh, 1.25rem)" }}
          >
            Step into real careers through guided simulations. Build the skills, earn the proof, and picture
            yourself in the room. <span className="font-bold">One clear step at a time.</span>
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
