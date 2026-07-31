import type { ReactNode } from "react";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { PathOption } from "../PathOption";
import { BookIcon, BriefcaseIcon, GraduationCapIcon } from "../icons";
import type { FlowState } from "../types";

const PATHS: { key: FlowState["path"]; title: string; sub: string; icon: ReactNode }[] = [
  { key: "High School", title: "High School", sub: "Find your best fit major", icon: <BookIcon /> },
  { key: "University", title: "University", sub: "Explore internships and roles", icon: <GraduationCapIcon /> },
  { key: "Job Seeker", title: "Job Seekers", sub: "Launch your next career move", icon: <BriefcaseIcon /> },
];

type ChoosePathStepProps = {
  path: FlowState["path"];
  onChange: (path: FlowState["path"]) => void;
  onBack: () => void;
  onNext: () => void;
};

export function ChoosePathStep({ path, onChange, onBack, onNext }: ChoosePathStepProps) {
  return (
    <FlowCard onBack={onBack}>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-[0.8px] text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">JOURNEY STAGE</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">Choose Your Path</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Where are you starting your journey?</p>
      </div>
      <div className="flex w-full flex-col gap-3.5">
        {PATHS.map((option) => (
          <PathOption
            key={option.key}
            icon={option.icon}
            title={option.title}
            sub={option.sub}
            selected={path === option.key}
            onClick={() => onChange(option.key)}
          />
        ))}
      </div>
      <FlowButton onClick={onNext}>
        Continue →
      </FlowButton>
    </FlowCard>
  );
}
