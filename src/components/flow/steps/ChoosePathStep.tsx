import type { ReactNode } from "react";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { PathOption } from "../PathOption";
import { BookIcon, BriefcaseIcon, GraduationCapIcon } from "../icons";
import type { FlowState } from "../types";

const PATHS: { key: FlowState["path"]; title: string; sub: string; icon: ReactNode }[] = [
  { key: "High School", title: "High School", sub: "Exploring colleges & early paths", icon: <BookIcon /> },
  { key: "University", title: "University", sub: "Internships, majors & grad plans", icon: <GraduationCapIcon /> },
  { key: "Job Seeker", title: "Job Seeker", sub: "Career transition & skills matching", icon: <BriefcaseIcon /> },
];

type ChoosePathStepProps = {
  path: FlowState["path"];
  onChange: (path: FlowState["path"]) => void;
  onNext: () => void;
};

export function ChoosePathStep({ path, onChange, onNext }: ChoosePathStepProps) {
  return (
    <FlowCard>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-[0.8px] text-amber-600 dark:text-amber-300">JOURNEY STAGE</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">Choose your path</p>
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
