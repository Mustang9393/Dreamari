import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { HowItWorksScroller } from "@/components/landing/HowItWorksScroller";
import { HeroSection } from "@/components/hero/HeroSection";

export default function Home() {
  return (
    // No overflow value set here at all (not even overflow-x-clip): any non-visible
    // overflow on either axis risks becoming the "nearest scrolling ancestor" that
    // position:sticky descendants (HowItWorksScroller's rail) compute against instead of
    // the real viewport — and unlike Chromium, mobile Safari has been unreliable about
    // keeping sticky descendants working through that in practice, which is what caused
    // How It Works to freeze on the first chapter there. The one thing that actually
    // needs horizontal clipping (HeroIllustration's cloud, which can run slightly wider
    // than its slot on narrow/tall phone aspect ratios) clips itself locally instead.
    <main className="relative">
      <AnimatedBackground />
      <HeroSection />
      <HowItWorksScroller />
    </main>
  );
}
