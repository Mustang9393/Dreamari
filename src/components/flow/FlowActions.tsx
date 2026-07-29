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
        className="rounded-lg border border-amber-400 bg-white px-4.5 py-2 text-base font-semibold text-amber-600 dark:border-amber-400/60 dark:bg-white/5 dark:text-amber-300"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={(event) => {
          dispatchAuroraPulse("cta", event);
          onNext();
        }}
        className="rounded-lg bg-amber-600 px-4.5 py-2 text-base font-semibold text-white"
      >
        {nextLabel}
      </button>
    </div>
  );
}
