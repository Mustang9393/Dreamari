type ScrollHintProps = {
  opacity: number;
  className?: string;
};

export function ScrollHint({ opacity, className = "" }: ScrollHintProps) {
  return (
    <div
      className={`pointer-events-none flex flex-col items-center gap-0.5 text-ink-200 ${className}`}
      style={{ opacity, transition: "opacity 0.15s linear" }}
      aria-hidden
    >
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-80">Scroll</span>
      <svg viewBox="0 0 24 24" fill="none" className="size-4 animate-bounce">
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
