import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { RadioPillGroup } from "../RadioPillGroup";
import { StepHeader } from "../StepHeader";

// Populates in question order (energy, then team style, then interaction), not
// selection order, so the numbering reads as "your three answers, in the order we
// asked" rather than shuffling as the user changes their mind. Lays the numbered rows
// out horizontally on mobile/tablet (a wide, short strip below the pills) and switches
// to a vertical stack only at the desktop breakpoint, where it sits as its own column
// beside the pills instead of below them.
function SetupPanel({ energy, teamStyle, interaction }: { energy: string; teamStyle: string; interaction: string }) {
  const rows = [energy, teamStyle, interaction].filter(Boolean);

  return (
    // lg:h-full (with the parent row switched to items-stretch) + lg:justify-center is
    // what makes this a real right-side column spanning the full card height instead of
    // a short box that just hugs its own content.
    <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface-tertiary p-4 lg:h-full lg:w-[240px] lg:shrink-0 lg:justify-center dark:border-white/10 dark:bg-white/5">
      {/* This inner wrapper is the piece that's centered as a whole (via the parent's
          items-center) — items-start/text-left inside it is what makes the label and
          every row share one common left edge instead of each being independently
          centered (which staggers rows of different lengths against each other). */}
      <div className="flex flex-col items-start gap-3 text-left">
        <p className="text-xs font-bold tracking-[1.4px] text-slate-600 uppercase dark:text-slate-400">Your setup</p>
        <ol className="flex flex-row flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:items-start lg:gap-2.5">
          {rows.map((row, index) => (
            <li key={row} className="flex items-center gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--step-accent)] text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{row}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

type WorkStyleStepProps = {
  energy: string;
  teamStyle: string;
  interaction: string;
  onChangeEnergy: (value: string) => void;
  onChangeTeamStyle: (value: string) => void;
  onChangeInteraction: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function WorkStyleStep({
  energy,
  teamStyle,
  interaction,
  onChangeEnergy,
  onChangeTeamStyle,
  onChangeInteraction,
  onBack,
  onNext,
}: WorkStyleStepProps) {
  return (
    <FlowCard header={<StepHeader eyebrow="WORKPLACE PREFERENCE" title="Where do you work best?" subtitle="Pick one from each row." onBack={onBack} />}>
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="flex w-full flex-col gap-4">
          <RadioPillGroup label="Your Energy" options={["Fast pace", "Calm", "Balanced"]} value={energy} onChange={onChangeEnergy} />
          <RadioPillGroup
            label="Your Team Style"
            options={["Solo", "Small team", "Big team"]}
            value={teamStyle}
            onChange={onChangeTeamStyle}
          />
          <RadioPillGroup
            label="Your Interaction Style"
            options={["Talk a lot", "Some talking", "Mostly solo"]}
            value={interaction}
            onChange={onChangeInteraction}
          />
        </div>

        <SetupPanel energy={energy} teamStyle={teamStyle} interaction={interaction} />
      </div>

      <div className="mt-2 flex w-full flex-col gap-3 sm:mt-3">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
        <p className="w-full text-center text-[10px] leading-tight text-slate-600 dark:text-slate-400">Based on work style and environment data from O*NET (U.S. Department of Labor)</p>
      </div>
    </FlowCard>
  );
}
