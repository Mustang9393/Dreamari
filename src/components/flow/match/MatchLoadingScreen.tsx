import Image from "next/image";

// Brief branded transition between finishing Build and entering the Match Experience —
// there's no equivalent screen in the Figma/Replit reference to match copy against, so
// this uses our own established voice (same mascot + animation pattern as WelcomeStep).
export function MatchLoadingScreen() {
  return (
    <div className="flex w-full flex-col items-center gap-5 text-center">
      <div className="relative aspect-[1366/768] w-40 shrink-0 sm:w-56">
        <Image
          src="/images/dreamy-welcome-mascot.png"
          alt="Dreamy thinking"
          fill
          sizes="224px"
          className="animate-[cloud-float_6s_ease-in-out_infinite] object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 animate-bounce rounded-full bg-[var(--color-brand-600)] [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-[var(--color-brand-600)] [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-[var(--color-brand-600)]" />
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">Finding your matches...</p>
      <p className="max-w-xs text-sm font-medium text-slate-600 dark:text-slate-400">Lining up careers and majors that fit everything you just told me.</p>
    </div>
  );
}
