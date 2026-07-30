type ScrollHintProps = {
  opacity: number;
  className?: string;
  onClick?: () => void;
};

export function ScrollHint({ opacity, className = "", onClick }: ScrollHintProps) {
  const clickable = Boolean(onClick);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-hidden={!clickable}
      aria-label={clickable ? "Scroll to next section" : undefined}
      tabIndex={clickable ? 0 : -1}
      className={`flex flex-col items-center gap-0.5 border-0 bg-transparent p-0 text-ink-200 ${className}`}
      style={{
        opacity,
        transition: "opacity 0.15s linear",
        cursor: clickable ? "pointer" : "default",
        // Gated on the live opacity, not just whether a handler was passed — otherwise a
        // hint mid-fade-out would still intercept clicks meant for whatever's underneath
        // it once it's visually gone.
        pointerEvents: clickable && opacity > 0.05 ? "auto" : "none",
      }}
    >
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-80">Scroll</span>
      <svg viewBox="0 0 24 24" fill="none" className="size-4 animate-bounce">
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
