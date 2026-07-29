import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingParticles } from "./OnboardingParticles";
import { AcademicJourneyCard } from "./AcademicJourneyCard";

export function OnboardingSection() {
  return (
    <section
      className="relative isolate flex flex-col items-center gap-10 overflow-hidden px-6 py-16 sm:px-10 lg:px-16"
      style={{
        background: "linear-gradient(241deg, var(--color-navy-975) 49%, var(--color-navy-700) 104%)",
      }}
    >
      <OnboardingParticles />

      <div className="relative flex w-full flex-col items-center gap-10">
        <OnboardingProgress label="BUILD" percent={56} />
        <AcademicJourneyCard />
      </div>
    </section>
  );
}
