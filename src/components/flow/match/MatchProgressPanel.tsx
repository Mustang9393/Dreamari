const SAVE_THRESHOLD = 3;

type MatchProgressPanelProps = {
  liked: number;
  current: number;
  total: number;
};

function messageFor(liked: number): string {
  if (liked >= SAVE_THRESHOLD) return "Path saved!";
  const remaining = SAVE_THRESHOLD - liked;
  return `${remaining} more ${remaining === 1 ? "like" : "likes"} to save`;
}

// Uses the updated Figma "Progress Panel" tokens (node 630:38951) for dark mode:
// rgba(255,255,255,0.05) surface, rgba(255,255,255,0.1) border, 22px radius, #99a6b8
// muted text, #2e73f5 accent, and the liked count turning green (#33c78c) once the save
// threshold is hit. Completion percentage is restored to its original position beside
// the bar, while liked-card progress remains a separate line so the two measures do not
// read as one contradictory count.
// Figma only specs dark; light mode is a real solid
// white surface with a visible border/shadow and a genuinely-contrasting track color.
// Figma's own #2e73f5 blue and #33c78c green don't clear ~4.5:1 against white (they're
// tuned for the dark navy card instead), so light mode uses darker blue-700/emerald-700
// shades for any of these colors used as small text, while keeping the exact Figma
// hues for graphical elements (the progress fill) where text-contrast rules don't apply.
export function MatchProgressPanel({ liked, current, total }: MatchProgressPanelProps) {
  const saved = liked >= SAVE_THRESHOLD;
  const percent = Math.round((current / total) * 100);
  return (
    <div
      role="group"
      className="w-full rounded-[var(--dimension-radius-xl)] border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:px-5"
      aria-label={`${percent}% complete. ${liked} liked.`}
    >
      <span className="block text-left text-xs font-semibold tracking-[0.72px] text-slate-600 dark:text-[var(--color-match-text-muted-dark)]">YOUR PROGRESS</span>
      <div className="mt-2.5 flex w-full items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5"
          role="progressbar"
          aria-label="Match progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className="h-full rounded-full bg-[var(--color-match-accent-dark)] transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs font-bold text-blue-700 dark:text-[var(--color-match-accent-dark)]">{percent}%</span>
      </div>
      <div className="mt-2.5 flex flex-nowrap items-center justify-between gap-2 text-[13px]">
        <span className={`shrink-0 whitespace-nowrap font-bold ${saved ? "text-emerald-700 dark:text-[var(--color-match-success-dark)]" : "text-slate-900 dark:text-white"}`}>
          {liked} liked
        </span>
        <span className="whitespace-nowrap text-xs text-slate-600 dark:text-[var(--color-match-text-muted-dark)]">{messageFor(liked)}</span>
      </div>
    </div>
  );
}
