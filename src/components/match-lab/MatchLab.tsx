"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { Confetti } from "@/components/flow/aurora/Confetti";
import { HomeButton } from "@/components/flow/HomeButton";
import { MatchBackdrop } from "@/components/flow/match/MatchBackdrop";
import { MatchExperience } from "@/components/flow/match/MatchExperience";
import { MATCH_PATHS } from "@/components/flow/match/matchData";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { ThemeToggle } from "@/components/flow/theme/ThemeToggle";

// The current production match experience, mounted standalone as the v3
// prototyping baseline. Iterate here; the real /flow handoff stays untouched
// until a direction is chosen and explicitly promoted.
const MATCH_ACCENT = "#2f6bf2";

export function MatchLab() {
  const router = useRouter();
  const [celebrating, setCelebrating] = useState(false);
  return (
    <ThemeProvider>
      <div className="fixed inset-0" style={{ background: "var(--color-night-background)" }} />
      <AuroraBackground accent={MATCH_ACCENT} visitedAccents={[]} finale={celebrating} lightning={celebrating} />
      {!celebrating && <MatchBackdrop />}
      <Confetti colors={[MATCH_ACCENT, "#8b5cf6", "#ff4585"]} active={celebrating} />
      <HomeButton />
      <ThemeToggle />
      <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden pt-[72px] pb-3 sm:py-5">
        <div className="flex min-h-0 w-full max-w-[860px] flex-1 flex-col justify-center px-4 sm:px-10">
          <MatchExperience paths={MATCH_PATHS} onComplete={() => router.push("/career-report?from=match")} onCelebrationChange={setCelebrating} />
        </div>
      </section>
    </ThemeProvider>
  );
}
