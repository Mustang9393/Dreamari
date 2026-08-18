import { BuildFlowExperience } from "@/components/build/BuildFlowExperience";

// Variant B of the build-profile A/B test: the boxless cinematic treatment.
// Same flow, same state, same copy — presentation only (see variant.tsx).
export default function CinematicFlowPage() {
  return (
    <main>
      <BuildFlowExperience initialVariant="cinematic" />
    </main>
  );
}
