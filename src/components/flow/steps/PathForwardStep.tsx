import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { PathOption } from "../PathOption";
import { BookIcon } from "../icons";

const OPTIONS = [
  { title: "2–4 years", sub: "Associate degree, trade certification, or apprenticeship" },
  { title: "4 years", sub: "Bachelor's degree at a college or university" },
  { title: "6+ years", sub: "Graduate school, medical, law, or doctoral program" },
];

type PathForwardStepProps = {
  pathForward: number;
  onChange: (index: number) => void;
  onNext: () => void;
};

export function PathForwardStep({ pathForward, onChange, onNext }: PathForwardStepProps) {
  return (
    <FlowCard>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-[0.8px] text-amber-600 dark:text-amber-300">FUTURE HORIZONS</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">How much time do you want to invest in further study?</p>
      </div>

      <div className="flex w-full flex-col gap-3.5">
        {OPTIONS.map((option, index) => (
          <PathOption
            key={option.title}
            icon={<BookIcon />}
            title={option.title}
            sub={option.sub}
            selected={pathForward === index}
            onClick={() => onChange(index)}
          />
        ))}
      </div>

      <FlowButton onClick={onNext}>
        Complete Build Phase →
      </FlowButton>
    </FlowCard>
  );
}
