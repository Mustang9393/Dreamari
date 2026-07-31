import { CitationNote } from "../CitationNote";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { BackButton } from "../BackButton";
import { RadioPillGroup } from "../RadioPillGroup";

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
    <FlowCard>
      <div className="flex flex-col gap-1.5">
        <div className="flex w-full items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <BackButton onClick={onBack} />
            <p className="text-xs font-bold tracking-[0.8px] text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">WORKPLACE PREFERENCE</p>
          </div>
          <CitationNote citation="Based on work style and environment data from ONET (U.S. Department of Labor)" />
        </div>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">Where do you work best?</p>
      </div>

      <div className="flex w-full flex-col gap-4">
        <RadioPillGroup label="Energy" options={["Early bird", "Night owl", "Flexible"]} value={energy} onChange={onChangeEnergy} />
        <RadioPillGroup
          label="Team Style"
          options={["Solo", "Small team", "Big team"]}
          value={teamStyle}
          onChange={onChangeTeamStyle}
        />
        <RadioPillGroup
          label="Interaction"
          options={["In-person", "Remote", "Hybrid"]}
          value={interaction}
          onChange={onChangeInteraction}
        />
      </div>

      <div className="flex w-full flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-tertiary p-4 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-bold tracking-[1.4px] text-slate-500 uppercase dark:text-slate-400">Your setup</p>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {energy} energy • {teamStyle} • {interaction} interaction
        </p>
        <p className="text-xs font-bold text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">Sounds like a great fit for you! ✨</p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
      </div>
    </FlowCard>
  );
}
