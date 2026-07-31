import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { SelectionRow } from "../SelectionRow";
import { StepHeader } from "../StepHeader";
import { CompassIcon, GlobeIcon, HomeIcon, MapIcon } from "../icons";

const OPTIONS = [
  { title: "In my home state", sub: "Within my home state or region", icon: <HomeIcon /> },
  { title: "Anywhere in the US", sub: "Open to relocating domestically", icon: <MapIcon /> },
  { title: "West Coast", sub: "California, Oregon, Washington, and nearby", icon: <CompassIcon /> },
  { title: "East Coast", sub: "From New England down to Florida", icon: <CompassIcon /> },
  { title: "Midwest", sub: "The heartland states", icon: <CompassIcon /> },
  { title: "South", sub: "The southern states", icon: <CompassIcon /> },
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
    <FlowCard header={<StepHeader eyebrow="LOCATION PREFERENCE" title="Location Flexibility" subtitle="Choose what fits you best" onBack={onBack} />}>
      <div className="flex w-full flex-col gap-2 sm:gap-3">
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

      <FlowButton onClick={onNext} className="mt-2 sm:mt-3">
        Finish →
      </FlowButton>
    </FlowCard>
  );
}
