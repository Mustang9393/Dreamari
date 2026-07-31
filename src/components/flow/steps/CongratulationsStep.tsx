import { useState } from "react";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { BackButton } from "../BackButton";
import { SelectionRow } from "../SelectionRow";
import { ArrowLeftRightIcon, BriefcaseIcon, GraduationCapIcon } from "../icons";

const PATHWAYS = [
  { title: "College", sub: "Majors & degrees", icon: <GraduationCapIcon /> },
  { title: "Trades", sub: "Skilled careers", icon: <BriefcaseIcon /> },
  { title: "Both", sub: "Explore everything", icon: <ArrowLeftRightIcon /> },
];

type CongratulationsStepProps = {
  onBack: () => void;
  onSeeMatches: (pathway: string) => void;
};

export function CongratulationsStep({ onBack, onSeeMatches }: CongratulationsStepProps) {
  const [selected, setSelected] = useState(0);

  return (
    <FlowCard>
      {/* Heading is centered, so the back button can't sit inline with it the way it
          does on other steps without pushing the text off-center — absolutely
          positioning it over the top-left corner aligns it with the heading's line
          without disturbing that centering or adding its own row. */}
      <div className="relative flex w-full flex-col items-center gap-2 text-center">
        <div className="absolute top-0 left-0">
          <BackButton onClick={onBack} />
        </div>
        <p className="text-2xl leading-8 font-extrabold text-slate-900 dark:text-white">Congratulations!</p>
        <p className="text-sm leading-5 font-medium text-slate-600 dark:text-slate-300">Your profile is ready. Let&apos;s find your path.</p>
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

      <FlowButton onClick={() => onSeeMatches(PATHWAYS[selected].title)} className="mt-2 sm:mt-3">
        See Matches →
      </FlowButton>
    </FlowCard>
  );
}
