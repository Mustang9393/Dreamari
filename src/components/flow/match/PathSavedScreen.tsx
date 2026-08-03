import Image from "next/image";

type PathSavedScreenProps = {
  pathTitle: string;
  liked: number;
  passed: number;
  onContinue: () => void;
};

// A real full-screen takeover (like MatchLoadingScreen/CongratulationsStep), not a
// modal floating over a dimmed backdrop — this replaces MatchExperience's own header/
// progress/deck/buttons entirely while celebrating (see MatchExperience's early return
// on pendingPathSaved), rather than overlaying on top of them. No backdrop-blur here:
// the whole point is that the colorful, interactive AuroraBackground + confetti +
// lightning behind this (see FlowContainer's matchCelebrating) reads crisp and in-
// focus, not blurred — only the content panel itself gets a solid-ish background, for
// legibility, not a blur that would also soften the confetti/lightning behind it.
export function PathSavedScreen({ pathTitle, liked, passed, onContinue }: PathSavedScreenProps) {
  return (
    <div className="flex w-full flex-col items-center gap-5 text-center">
      <div className="relative aspect-square w-40 shrink-0 sm:w-48">
        <Image
          src="/images/dreamy-celebration-mascot.png"
          alt="Dreamy celebrating with confetti"
          fill
          sizes="192px"
          className="animate-[cloud-float_6s_ease-in-out_infinite] object-contain"
          priority
        />
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-white/95 p-8 shadow-2xl dark:bg-[color-mix(in_srgb,var(--color-match-modal-bg-dark)_92%,transparent)]">
        <p className="text-xl font-extrabold text-slate-900 dark:text-white">Path Saved!</p>
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
