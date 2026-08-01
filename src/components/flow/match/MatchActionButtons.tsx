import { HeartIcon, XIcon } from "../icons";

type MatchActionButtonsProps = {
  onPass: () => void;
  onLike: () => void;
};

// Exact Figma tokens (node 607:36345 / 607:36371): Pass = translucent dark surface with
// a #404759 border, Like = solid #2e73f5. Light mode swaps the dark translucent Pass
// surface for a plain white/bordered one — Figma only specs the dark version.
export function MatchActionButtons({ onPass, onLike }: MatchActionButtonsProps) {
  return (
    <div className="flex w-full gap-4">
      <button
        type="button"
        onClick={onPass}
        className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-600 transition-transform hover:scale-[1.02] active:scale-[0.98] dark:border-[var(--color-match-border-dark)] dark:bg-[color-mix(in_srgb,var(--color-match-toast-bg-dark)_60%,transparent)] dark:text-white"
      >
        <XIcon className="size-5" />
        Pass
      </button>
      <button
        type="button"
        onClick={onLike}
        className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-match-accent-dark)] text-base font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <HeartIcon className="size-5 fill-current" />
        Like
      </button>
    </div>
  );
}
