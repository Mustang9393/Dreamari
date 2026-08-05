import type { SwipeDirection } from "./types";

type MatchToastProps = {
  label: string;
  direction: SwipeDirection;
  onUndo: () => void;
};

// Keeps the Figma toast copy and dark system-feedback treatment, but uses a deliberately
// compact chip anatomy. This is transient, secondary feedback above the action row; it
// should confirm and offer Undo without covering the card or competing with Pass/Like.
export function MatchToast({ label, direction, onUndo }: MatchToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute bottom-[calc(52px+var(--match-block-gap)+4px)] left-1/2 z-30 flex max-w-[calc(100%_-_24px)] -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--color-match-toast-bg-dark)] px-3.5 py-2 text-xs font-medium text-white shadow-md"
    >
      <span>{label} {direction === "like" ? "liked" : "passed"}</span>
      <span className="text-white/25">|</span>
      <button type="button" onClick={onUndo} className="rounded px-0.5 font-semibold text-[var(--color-match-toast-link-dark)] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        Undo
      </button>
    </div>
  );
}
