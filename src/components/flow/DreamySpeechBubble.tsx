type DreamySpeechBubbleProps = {
  message: string;
  className?: string;
};

// A real triangular tail (not a corner-radius trick) on the bubble's LEFT edge, vertically
// centered on the bubble — used everywhere Dreamy "talks" (About You's in-flow placement,
// ConfidenceCheckStep's floating corner). Assumes Dreamy sits immediately to the LEFT in a
// row with items-center, so the tail lines up with the vertical center of his face — where
// his mouth is — instead of pointing at an arbitrary corner. Padding/rounding sized up
// (not just the font) so the bubble itself reads as bigger while still fitting the same
// text size — leaves room for a longer message rather than larger characters.
export function DreamySpeechBubble({ message, className = "" }: DreamySpeechBubbleProps) {
  return (
    <div
      className={`relative rounded-3xl bg-white px-5 py-3 text-left font-semibold text-slate-700 shadow-md sm:px-6 sm:py-4 dark:bg-slate-800 dark:text-slate-200 ${className}`}
    >
      {message}
      <span aria-hidden className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rotate-45 bg-white dark:bg-slate-800" />
    </div>
  );
}
