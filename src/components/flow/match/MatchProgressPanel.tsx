const SAVE_THRESHOLD = 3;

type MatchProgressPanelProps = {
  liked: number;
  total: number;
  percent: number;
};

function messageFor(liked: number): string {
  if (liked >= SAVE_THRESHOLD) return "Path saved! Keep going to strengthen your match.";
  return `Like ${SAVE_THRESHOLD - liked} more to save this path`;
}

// Exact updated Figma "Progress Panel" tokens (node 630:38951) for dark mode:
// rgba(255,255,255,0.05) surface, rgba(255,255,255,0.1) border, 22px radius, #99a6b8
// muted text, #2e73f5 accent, and the "N OF total LIKED" count turning green (#33c78c)
// once the save threshold is hit. Figma only specs dark; light mode is a real solid
// white surface with a visible border/shadow and a genuinely-contrasting track color.
// Figma's own #2e73f5 blue and #33c78c green don't clear ~4.5:1 against white (they're
// tuned for the dark navy card instead), so light mode uses darker blue-700/emerald-700
// shades for any of these colors used as small text, while keeping the exact Figma
// hues for graphical elements (the progress fill) where text-contrast rules don't apply.
export function MatchProgressPanel({ liked, total, percent }: MatchProgressPanelProps) {
  const saved = liked >= SAVE_THRESHOLD;
  return (
    <div className="w-full rounded-[var(--dimension-radius-xl)] border border-slate-200 bg-white px-6 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div className="flex w-full items-start justify-between text-[11px] font-semibold tracking-[0.88px]">
        <span className="text-slate-600 dark:text-[var(--color-match-text-muted-dark)]">OVERALL PROGRESS</span>
        <span className={`font-bold ${saved ? "text-emerald-700 dark:text-[var(--color-match-success-dark)]" : "text-slate-900 dark:text-white"}`}>{liked} OF {total} LIKED</span>
      </div>
      <div className="mt-2 flex w-full items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
          <div className="h-full rounded-full bg-[var(--color-match-accent-dark)] transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-[12px] font-bold text-blue-700 dark:text-[var(--color-match-accent-dark)]">{percent}%</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[13px]">
        <span aria-hidden className="size-1.5 rounded-full bg-slate-400 dark:bg-[var(--color-match-text-muted-dark)]" />
        <span className="text-slate-600 dark:text-[var(--color-match-text-muted-dark)]">{messageFor(liked)}</span>
      </div>
    </div>
  );
}
