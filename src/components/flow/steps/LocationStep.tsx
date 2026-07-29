import { FlowActions } from "../FlowActions";
import { FlowCard } from "../FlowCard";
import { SelectionRow } from "../SelectionRow";
import { CompassIcon, GlobeIcon, HomeIcon, MapIcon } from "../icons";

const OPTIONS = [
  { title: "Close to home", sub: "Within my home state or region", icon: <HomeIcon /> },
  { title: "Anywhere in the US", sub: "Open to relocating domestically", icon: <MapIcon /> },
  { title: "Specific regions", sub: "I have some areas in mind", icon: <CompassIcon /> },
  { title: "International", sub: "Open to studying or working abroad", icon: <GlobeIcon /> },
];

type LocationStepProps = {
  location: number;
  onChange: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
};

export function LocationStep({ location, onChange, onBack, onNext }: LocationStepProps) {
  return (
    <FlowCard>
      <div className="flex w-full flex-col gap-2">
        <p className="w-full text-2xl leading-[32px] font-bold text-slate-900 dark:text-white">Where could you see yourself?</p>
        <p className="w-full text-sm font-medium text-slate-600 dark:text-slate-300">Select your geographic preference for study or future work.</p>
      </div>

      <div className="flex w-full flex-col gap-3">
        {OPTIONS.map((option, index) => (
          <SelectionRow
            key={option.title}
            icon={option.icon}
            title={option.title}
            sub={option.sub}
            selected={location === index}
            onClick={() => onChange(index)}
          />
        ))}
      </div>

      <FlowActions nextLabel="See my results" onBack={onBack} onNext={onNext} />
    </FlowCard>
  );
}
