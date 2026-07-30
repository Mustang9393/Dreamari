import { useState } from "react";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GifBanner } from "../GifBanner";
import { SelectionRow } from "../SelectionRow";
import { ArrowLeftRightIcon, BriefcaseIcon, GraduationCapIcon } from "../icons";

const PATHWAYS = [
  { title: "College Path", sub: "Degree-first, on a campus", icon: <GraduationCapIcon /> },
  { title: "Trades Path", sub: "Hands-on skills, faster to earn", icon: <BriefcaseIcon /> },
  { title: "Hybrid Path Both", sub: "A mix of both worlds", icon: <ArrowLeftRightIcon /> },
];

type CongratulationsStepProps = {
  onRestart: () => void;
};

export function CongratulationsStep({ onRestart }: CongratulationsStepProps) {
  const [selected, setSelected] = useState(0);

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

      <div className="flex w-full flex-col gap-3">
        <p className="text-[11px] font-bold tracking-[1.4px] text-slate-500 uppercase dark:text-slate-400">Pick where to start</p>
        <div className="flex w-full flex-col gap-2.5">
          {PATHWAYS.map((pathway, index) => (
            <SelectionRow
              key={pathway.title}
              icon={pathway.icon}
              title={pathway.title}
              sub={pathway.sub}
              selected={selected === index}
              onClick={() => setSelected(index)}
            />
          ))}
        </div>
      </div>

      <FlowButton onClick={onRestart}>
        See my matches →
      </FlowButton>
    </FlowCard>
  );
}
