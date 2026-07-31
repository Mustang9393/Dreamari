import type { SwipeDirection } from "./types";

type MatchToastProps = {
  label: string;
  direction: SwipeDirection;
  onUndo: () => void;
};

// Matches the Figma toast component (node 607:36461) verbatim: "{Label} {liked|passed} |
// Undo", always on a dark pill regardless of app theme — a toast reads as a system
// notification, not page content, so it doesn't follow the light/dark toggle.
export function MatchToast({ label, direction, onUndo }: MatchToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#171c2e] px-5 py-3 text-sm font-medium text-white shadow-lg">
      <span>{label} {direction === "like" ? "liked" : "passed"}</span>
      <span className="text-white/30">|</span>
      <button type="button" onClick={onUndo} className="font-semibold text-[#5b9bff] hover:opacity-80">
        Undo
      </button>
    </div>
  );
}
