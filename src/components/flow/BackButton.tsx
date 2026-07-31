import { ChevronLeftIcon } from "./icons";
import { dispatchAuroraPulse } from "./aurora/pulse";

type BackButtonProps = {
  onClick: () => void;
  // "accent" (default) is for sitting on the plain card body, tinted with the step's own
  // accent color. "onColor" is for sitting on top of a StepHeader's colored gradient
  // banner, where an accent-tinted icon would have poor contrast against a similarly
  // saturated background — this variant is a flat white/light tone instead.
  tone?: "accent" | "onColor";
};

// Sits inline with a step's first line of text (its eyebrow label, or its heading when
// there's no eyebrow) instead of on its own row — that row-of-its-own placement was what
// made every card taller than it needed to be.
export function BackButton({ onClick, tone = "accent" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("select", event);
        onClick();
      }}
      aria-label="Back to previous question"
      className={`-ml-1 flex size-6 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70 ${
        tone === "onColor" ? "text-white/85" : "text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
      }`}
    >
      <ChevronLeftIcon className="size-4" />
    </button>
  );
}
