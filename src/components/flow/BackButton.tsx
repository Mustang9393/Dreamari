import { ChevronLeftIcon } from "./icons";
import { dispatchAuroraPulse } from "./aurora/pulse";

type BackButtonProps = {
  onClick: () => void;
};

// Sits inline with a step's first line of text (its eyebrow label, or its heading when
// there's no eyebrow) instead of on its own row — that row-of-its-own placement was what
// made every card taller than it needed to be.
export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("select", event);
        onClick();
      }}
      aria-label="Back to previous question"
      className="-ml-1 flex size-6 shrink-0 items-center justify-center rounded-full text-[color:var(--step-accent)] transition-opacity hover:opacity-70 dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
    >
      <ChevronLeftIcon className="size-4" />
    </button>
  );
}
