type DreamySpeechBubbleProps = {
  message: string;
  className?: string;
};

// A real triangular tail (not a corner-radius trick) on the bubble's right edge, vertically
// centered on the bubble — used everywhere Dreamy "talks" (About You's in-flow placement,
// ConfidenceCheckStep's floating corner). Assumes Dreamy sits immediately to the right in a
// row with items-center, so the tail lines up with the vertical center of his face — where
// his mouth is — instead of pointing at an arbitrary corner.
export function DreamySpeechBubble({ message, className = "" }: DreamySpeechBubbleProps) {
  return (
    <div className={`relative rounded-2xl bg-white px-3 py-2 text-left font-semibold text-slate-700 shadow-md dark:bg-slate-800 dark:text-slate-200 ${className}`}>
      {message}
      <span aria-hidden className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rotate-45 bg-white dark:bg-slate-800" />
    </div>
  );
}
