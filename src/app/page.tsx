import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { HowItWorksScroller } from "@/components/landing/HowItWorksScroller";
import { HeroSection } from "@/components/hero/HeroSection";

export default function Home() {
  return (
    // overflow-x-clip, not overflow-x-hidden: setting only one overflow axis to `hidden`
    // makes CSS's paired-axis rule implicitly set the *other* axis to `auto`, turning
    // this element into a scroll container — which breaks `position: sticky` for every
    // descendant (its containing block stops being the real viewport). `clip` prevents
    // horizontal overflow without ever establishing a scroll container.
    <main className="relative overflow-x-clip">
      <AnimatedBackground />
      <HeroSection />
      <HowItWorksScroller />
    </main>
  );
}
