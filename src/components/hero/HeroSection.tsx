import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { GradientBlobs } from "./GradientBlobs";
import { RoleToggle } from "./RoleToggle";
import { HeroIllustration } from "./HeroIllustration";

export function HeroSection() {
  return (
    <section
      className="relative isolate overflow-hidden px-6 pb-16 pt-6 sm:px-10 lg:px-16"
      style={{
        background:
          "radial-gradient(ellipse 120% 90% at 85% 35%, #143c96 0%, #0c2560 45%, #0a1e4c 100%)",
      }}
    >
      <GradientBlobs />

      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center">
        <Navbar />

        <div className="mt-24 flex flex-col items-center gap-10 text-center sm:mt-32">
          <RoleToggle />

          <h1 className="max-w-4xl text-5xl font-extrabold uppercase leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Discover your{" "}
            <span className="bg-gradient-to-r from-brand-400 from-[26%] to-brand-200 to-[62.5%] bg-clip-text text-transparent">
              dream career.
            </span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-ink-100 sm:text-xl">
            Step into real careers through guided simulations. Build the
            skills, earn the proof, and picture yourself in the room.{" "}
            <span className="font-bold">One clear step at a time.</span>
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button variant="cta-solid" href="/flow">
              Start exploring
            </Button>
            <Button variant="cta-outline" href="#trailer">
              Watch trailer
            </Button>
          </div>
        </div>

        <div className="mt-16 w-full sm:mt-20">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
