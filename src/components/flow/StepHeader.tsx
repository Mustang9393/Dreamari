import { BackButton } from "./BackButton";

type StepHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onBack: () => void;
};

// Full-bleed colored banner at the top of a step's FlowCard, replacing the old plain-card
// header (colored eyebrow/title text sitting directly on the white/dark card body). Color
// comes from the step's own --step-progress-from/to gradient (already used for the
// progress bar fill), not a fixed color per step, so this stays in sync with the rest of
// the step's accent theming automatically. Rendered via FlowCard's `header` slot, which
// gives it the negative-margin "bleed out of the card's own padding" treatment needed to
// reach the card's edges and rounded top corners. Deliberately no icon/graphic here — text
// only, per feedback that a decorative icon next to the question read as clutter.
export function StepHeader({ eyebrow, title, subtitle, onBack }: StepHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-0.5 rounded-t-3xl bg-gradient-to-r from-[var(--step-progress-from)] to-[var(--step-progress-to)] p-3.5 sm:gap-1 sm:p-5">
      <div className="flex items-center gap-1.5">
        <BackButton onClick={onBack} tone="onColor" />
        {eyebrow && <p className="text-[11px] font-bold tracking-[0.8px] text-white/75 uppercase">{eyebrow}</p>}
      </div>
      <p className="text-lg leading-snug font-bold text-white sm:text-2xl">{title}</p>
      {subtitle && <p className="text-xs leading-snug text-white/80 sm:text-sm">{subtitle}</p>}
    </div>
  );
}
