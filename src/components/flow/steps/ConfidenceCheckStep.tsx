import { DreamyCorner } from "../DreamyCorner";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GifBanner } from "../GifBanner";
import { GridOption } from "../GridOption";
import { StepHeader } from "../StepHeader";

const SKILLS = ["Problem Solving", "Communication", "Creativity", "Leadership", "Teamwork", "Analysis", "Organization", "Adaptability"];

const MAX_STRENGTHS = 3;

// Reaffirms whatever the user has actually picked so far, rather than a single static
// line — reads as Dreamy reacting to their choices instead of a canned prompt that never
// changes as they select strengths.
function getReaffirmingMessage(strengths: string[]): string {
  if (strengths.length === 0) return "Pick a few — you've got more strengths than you think! 💪";
  if (strengths.length === 1) return `${strengths[0]} is a real strength. Great pick! 💪`;
  const last = strengths[strengths.length - 1];
  const rest = strengths.slice(0, -1).join(", ");
  return `${rest} and ${last} — that's a powerful combo! 💪`;
}

type ConfidenceCheckStepProps = {
  strengths: string[];
  onToggleStrength: (strength: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function ConfidenceCheckStep({ strengths, onToggleStrength, onBack, onNext }: ConfidenceCheckStepProps) {
  return (
    // relative (not overflow-hidden) so DreamyCorner's absolute, negative-offset position
    // resolves against this wrapper instead of FlowCard's own overflow-hidden root, which
    // would otherwise clip it — see the note in FlowCard.tsx. Width must match FlowCard's
    // own rule exactly (see its comment) so DreamyCorner's right-anchored position lines
    // up with the actual card underneath it.
    <div className="relative w-full max-w-2xl lg:w-[var(--flow-content-width)] lg:max-w-none">
      <DreamyCorner message={getReaffirmingMessage(strengths)} />
      <FlowCard
        header={
          <StepHeader
            eyebrow="CONFIDENCE CHECK"
            title="What are you most confident doing?"
            subtitle="Pick up to 3 strengths you already have"
            onBack={onBack}
          />
        }
      >
        <GifBanner gifId="G1X87RbwxK2EgZQbAd" alt="Cristiano Ronaldo looking confident" focus="center" maxHeight={190} />

        <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SKILLS.map((skill) => {
            const index = strengths.indexOf(skill);
            const selected = index !== -1;
            const disabled = !selected && strengths.length >= MAX_STRENGTHS;
            return <GridOption key={skill} label={skill} selected={selected} disabled={disabled} onClick={() => onToggleStrength(skill)} />;
          })}
        </div>

        <div className="mt-2 flex w-full flex-col gap-3.5 sm:mt-3">
          <FlowButton onClick={onNext}>
            Continue →
          </FlowButton>
          <p className="w-full text-center text-[10px] leading-tight text-slate-600 dark:text-slate-400">
            Based on Self-Efficacy Theory — Albert Bandura, Stanford University
          </p>
        </div>
      </FlowCard>
    </div>
  );
}
