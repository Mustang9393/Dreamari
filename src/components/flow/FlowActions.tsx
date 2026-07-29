import { dispatchAuroraPulse } from "./aurora/pulse";

type FlowActionsProps = {
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
};

export function FlowActions({ nextLabel, onBack, onNext }: FlowActionsProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <button
        type="button"
        onClick={(event) => {
          dispatchAuroraPulse("select", event);
          onBack();
        }}
        className="rounded-lg border border-[var(--step-accent)] bg-white px-4.5 py-2 text-base font-semibold text-[color:var(--step-accent)] dark:border-[color-mix(in_srgb,var(--step-accent)_65%,black)] dark:bg-white/5 dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={(event) => {
          dispatchAuroraPulse("cta", event);
          onNext();
        }}
        className="rounded-lg bg-[var(--step-accent)] px-4.5 py-2 text-base font-semibold text-white"
      >
        {nextLabel}
      </button>
    </div>
  );
}
