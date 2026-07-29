import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { HowItWorksScroller } from "@/components/landing/HowItWorksScroller";
import { HeroSection } from "@/components/hero/HeroSection";

export default function Home() {
  return (
    <main className="relative">
      <AnimatedBackground />
      <HeroSection />
      <HowItWorksScroller />
    </main>
  );
}
