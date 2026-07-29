type OnboardingProgressProps = {
  label: string;
  percent: number;
};

export function OnboardingProgress({ label, percent }: OnboardingProgressProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-amber-100/90 px-5 py-2 pb-3">
      <p className="text-sm font-bold text-amber-600">{label}</p>
      <div className="flex w-full items-center gap-2.5">
        <div className="h-1.5 flex-1 rounded-full bg-navy-975">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="whitespace-nowrap text-xs font-bold tracking-wider text-amber-600 uppercase">
          {percent}%
        </p>
      </div>
    </div>
  );
}
