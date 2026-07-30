import Image from "next/image";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <FlowCard>
      {/* Full figure, uncropped (object-contain matches the source's own 1366:768 ratio
          exactly, so nothing gets clipped) — same gentle float as the homepage hero cloud,
          just sized down to fit comfortably above the greeting instead of dominating it. */}
      <div className="relative aspect-[1366/768] w-48 shrink-0 self-center sm:w-64">
        <Image
          src="/images/dreamy-welcome-mascot.png"
          alt="Dreamy, your career guide, ready to help you build"
          fill
          sizes="256px"
          className="animate-[cloud-float_6s_ease-in-out_infinite] object-contain"
          priority
        />
      </div>
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <p className="text-xl leading-[27px] font-bold tracking-[-0.4px] text-slate-900 dark:text-white">
          Hi, I&apos;m Dreamy. 👋
        </p>
        <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
          I am your virtual friend who is going to help you find your dream career!
        </p>
      </div>
      <FlowButton onClick={onNext}>
        Let&apos;s go →
      </FlowButton>
    </FlowCard>
  );
}
