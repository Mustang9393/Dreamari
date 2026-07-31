import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { BriefcaseIcon, ChevronRightIcon, GraduationCapIcon, TargetIcon } from "../icons";
import { dispatchAuroraPulse } from "../aurora/pulse";
import type { FlowState } from "../types";

// Colors and icon choices match the reference app's own Choose Your Path tiles exactly
// (graduation-cap/blue for High School, briefcase/emerald for University, target/violet
// for Job Seekers) rather than our previous Book/GraduationCap/Briefcase mapping.
const PATHS: { key: FlowState["path"]; title: string; sub: string; icon: ReactNode; color: string }[] = [
  { key: "High School", title: "High School", sub: "Find your best fit major", icon: <GraduationCapIcon />, color: "#60A5FA" },
  { key: "University", title: "University", sub: "Explore internships and roles", icon: <BriefcaseIcon />, color: "#34D399" },
  { key: "Job Seeker", title: "Job Seekers", sub: "Launch your next career move", icon: <TargetIcon />, color: "#A78BFA" },
];

type ChoosePathStepProps = {
  path: FlowState["path"];
  onChange: (path: FlowState["path"]) => void;
  onBack: () => void;
  onNext: () => void;
};

// No FlowCard wrapper and no separate "Continue" button here, unlike the rest of the
// flow's steps — this page's reference layout has each tile act as its own immediate
// "Select" action (clicking picks the path AND advances in one motion), sitting directly
// on the aurora background rather than boxed in a card, so there's nothing left to
// confirm afterward. No back button either — this is the very first real choice in the
// flow (right after the welcome screen), so there's nothing meaningful to go back to.
export function ChoosePathStep({ onChange, onNext }: ChoosePathStepProps) {
  function choose(key: FlowState["path"]) {
    onChange(key);
    onNext();
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-10">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-2 size-24 sm:size-36">
          <Image
            src="/images/dreamy-books-mascot.png"
            alt="Dreamy, ready to help you choose your path"
            fill
            sizes="144px"
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
        <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Choose Your Path</p>
        <p className="mt-1 text-sm text-slate-500 sm:mt-2 sm:text-[15px] dark:text-slate-400">Where are you starting your journey?</p>
      </div>

      {/* Stacked full-width tiles on mobile — each big enough to read comfortably and
          tap confidently, not squeezed into a 3-across row — switching to a row only at
          sm: where there's enough width for three real cards side by side. */}
      <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:gap-5">
        {PATHS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={(event) => {
              dispatchAuroraPulse("select", event);
              choose(item.key);
            }}
            style={{ "--path-color": item.color } as CSSProperties}
            className="group relative flex w-full flex-row items-center gap-4 overflow-hidden rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-left shadow-[0_4px_24px_rgba(100,130,200,0.1)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(100,130,200,0.18)] sm:w-[200px] sm:flex-col sm:items-center sm:rounded-3xl sm:px-6 sm:py-8 sm:text-center dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-3xl"
              style={{ background: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--path-color) 22%, transparent), transparent 70%)" }}
            />
            <span
              className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/80 sm:mb-5 sm:size-16 dark:border-white/10 dark:bg-white/10"
              style={{ boxShadow: `0 4px 20px color-mix(in srgb, ${item.color} 22%, transparent)` }}
            >
              <span className="size-5 text-[color:var(--path-color)] sm:size-7 dark:text-[color-mix(in_srgb,var(--path-color)_75%,white)]">{item.icon}</span>
            </span>
            <span className="relative z-10 flex flex-1 flex-col gap-0.5 sm:flex-none sm:items-center sm:gap-0">
              <h3 className="text-base font-bold text-slate-900 sm:mb-1 sm:text-base dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-500 sm:mb-4 dark:text-slate-400">{item.sub}</p>
              <span className="flex items-center gap-1 text-sm font-semibold text-[color:var(--path-color)] dark:text-[color-mix(in_srgb,var(--path-color)_75%,white)]">
                Select
                <ChevronRightIcon className="size-4" />
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
