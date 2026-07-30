import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GifBanner } from "../GifBanner";
import { ArrowLeftRightIcon, BriefcaseIcon, GraduationCapIcon } from "../icons";

const PATHWAYS = [
  { title: "College Path", icon: <GraduationCapIcon /> },
  { title: "Trades Path", icon: <BriefcaseIcon /> },
  { title: "Hybrid Path Both", icon: <ArrowLeftRightIcon /> },
];

type CongratulationsStepProps = {
  onRestart: () => void;
};

export function CongratulationsStep({ onRestart }: CongratulationsStepProps) {
  return (
    <FlowCard>
      <GifBanner gifId="Q81NcsY6YxK7jxnr4v" alt="Success kid celebration" />

      <div className="flex w-full flex-col items-center gap-2 text-center">
        <p className="text-[28px] leading-9 font-extrabold text-slate-900 dark:text-white">You did it!</p>
        <p className="text-base leading-[22px] font-bold text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">Your unique path is ready.</p>
        <p className="text-sm leading-5 font-medium text-slate-600 dark:text-slate-300">
          Based on your interests, strengths, values, and preferences, here are paths made for you.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        {PATHWAYS.map((pathway) => (
          <div key={pathway.title} className="flex w-full items-center gap-3 rounded-xl bg-surface-tertiary p-3 dark:bg-white/5">
            <span className="size-5 text-slate-900 dark:text-white">{pathway.icon}</span>
            <p className="text-[15px] font-semibold text-slate-900 dark:text-white">{pathway.title}</p>
          </div>
        ))}
      </div>

      <FlowButton onClick={onRestart}>
        See my matches →
      </FlowButton>
    </FlowCard>
  );
}
