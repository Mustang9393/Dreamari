import { CheckIcon } from "../icons";

type PathSavedModalProps = {
  pathTitle: string;
  liked: number;
  passed: number;
  onContinue: () => void;
};

// Matches the Figma "Path Saved!" modal (node 607:36702) verbatim, including the
// dynamic path name in the subtext and the liked/passed tally.
export function PathSavedModal({ pathTitle, liked, passed, onContinue }: PathSavedModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-white p-8 text-center dark:bg-[var(--color-match-modal-bg-dark)]">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-600">
          <CheckIcon className="size-8 text-white" />
        </div>
        <p className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">Path Saved!</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{pathTitle} has been added to your journey.</p>
        <div className="mt-5 flex items-center justify-center gap-8">
          <div>
            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{liked}</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Liked</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-700 dark:text-white">{passed}</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Passed</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-6 h-[52px] w-full rounded-xl bg-[var(--color-brand-600)] text-base font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue Journey
        </button>
      </div>
    </div>
  );
}
