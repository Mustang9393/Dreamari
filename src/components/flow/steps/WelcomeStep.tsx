import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <FlowCard>
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <p className="text-xl leading-[27px] font-bold tracking-[-0.4px] text-slate-900 dark:text-white">
          Hey there!
          <br />
          I&apos;m Dreamy, your career guide.
        </p>
        <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
          Let&apos;s figure out what lights you up, it only takes 5 minutes.
        </p>
      </div>
      <FlowButton onClick={onNext}>
        Let&apos;s go →
      </FlowButton>
    </FlowCard>
  );
}
