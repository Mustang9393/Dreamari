"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { Confetti } from "@/components/flow/aurora/Confetti";
import { HomeButton } from "@/components/flow/HomeButton";
import { MatchBackdrop } from "@/components/flow/match/MatchBackdrop";
import { MatchExperience } from "@/components/flow/match/MatchExperience";
import { MatchLoadingScreen } from "@/components/flow/match/MatchLoadingScreen";
import { MATCH_PATHS } from "@/components/flow/match/matchData";
import { StepTransition } from "@/components/flow/StepTransition";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { ThemeToggle } from "@/components/flow/theme/ThemeToggle";
import { DreamyGuide } from "./DreamyGuide";
import { CostStep } from "./CostStep";
import { LocationStep } from "./LocationStep";
import { CompletionScreen, EducationStep, InterestsStep, MilestoneScreen, ProfileStep, SubjectsStep, WorkVibeStep, type StepProps } from "./steps";
import { INITIAL_BUILD_STATE, STAGES, STAGE_ACCENTS, STAGE_DREAMY, type BuildState, type StageId } from "./types";

// The rebuilt build-profile flow (docs/BUILD_FLOW_SPEC.md = verbatim copy source).
// Design/layout/structure follow the Figma Build Flow frames (3009-15623):
// Background Space nebulas + the reactive dot-matrix aurora curtain, a centered
// glass card carrying its own phase HUD, the CTA row outside the card. Dreamy
// floats above the question block as an interactive, reacting guide. The A/B
// test is settled: the cinematic (boxless) treatment is THE flow; the boxed
// glass variant was removed with its plumbing (see variant.tsx).

const MATCH_LOADING_MS = 1800;
const MATCH_ACCENT = "#2f6bf2";

type Phase = "build" | "loading" | "match";

// Figma "Background Space" (dev handoff Step 4): nebula ellipses positioned
// proportionally, colored by pipeline tokens. Sits UNDER the aurora canvas.
function BackgroundSpace() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ background: "var(--color-night-background)" }}>
      {/* Radial-gradient nebulas, NOT filter:blur() — giant blur() layers blow
         iOS Safari's GPU memory and crash the tab ("a problem repeatedly
         occurred"), which is exactly what happened in prod. Gradients give the
         same soft wash for free. px floors keep phones from going flat black. */}
      <div className="absolute" style={{ width: "max(90vw, 900px)", aspectRatio: "1", left: "50%", top: "-30vh", transform: "translateX(-40%)", background: "radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 34%, transparent) 0%, color-mix(in srgb, var(--color-brand-500) 14%, transparent) 40%, transparent 68%)" }} />
      <div className="absolute" style={{ width: "max(100vw, 980px)", aspectRatio: "1", left: "min(-30vw, -220px)", top: "40vh", background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent-purple) 24%, transparent) 0%, transparent 66%)" }} />
      <div className="absolute" style={{ width: "max(75vw, 700px)", aspectRatio: "1", left: "4vw", top: "18vh", background: "radial-gradient(circle, color-mix(in srgb, var(--color-decorative-pink-glow) 14%, transparent) 0%, transparent 64%)" }} />
      <div className="absolute" style={{ width: "max(95vw, 820px)", height: "max(45vh, 380px)", left: "0", top: "-4vh", background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.07) 0%, transparent 62%)" }} />
    </div>
  );
}

export function BuildFlowExperience() {
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);
  const [state, setState] = useState<BuildState>(INITIAL_BUILD_STATE);
  const [phase, setPhase] = useState<Phase>("build");
  const [matchCelebrating, setMatchCelebrating] = useState(false);
  const [reactionNonce, setReactionNonce] = useState(0);

  const stage = STAGES[stageIndex];
  const stageId: StageId = stage.id;

  const next = () => setStageIndex((current) => Math.min(current + 1, STAGES.length - 1));
  const back = () => setStageIndex((current) => Math.max(current - 1, 0));
  const react = () => setReactionNonce((n) => n + 1);
  const seeMatches = () => setPhase("loading");

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("match"), MATCH_LOADING_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  function patch(update: Partial<BuildState>) {
    setState((current) => ({ ...current, ...update }));
  }

  const accent = phase === "build" ? STAGE_ACCENTS[stageId] : MATCH_ACCENT;
  const isComplete = stageId === "complete" && phase === "build";

  const stepProps: StepProps = { state, patch, onNext: next, react, percent: stage.percent, phase: stage.phase, almostDone: stage.almostDone };

  let content: ReactNode = null;
  if (stageId === "interests") content = <InterestsStep {...stepProps} />;
  else if (stageId === "subjects") content = <SubjectsStep {...stepProps} onBack={back} />;
  else if (stageId === "workVibe") content = <WorkVibeStep {...stepProps} onBack={back} />;
  else if (stageId === "milestone") content = <MilestoneScreen onNext={next} percent={stage.percent} />;
  else if (stageId === "education") content = <EducationStep {...stepProps} onBack={back} />;
  else if (stageId === "cost") content = <CostStep {...stepProps} onBack={back} />;
  else if (stageId === "location") content = <LocationStep {...stepProps} onBack={back} />;
  else if (stageId === "profile") content = <ProfileStep {...stepProps} onBack={back} />;
  else if (stageId === "complete") content = <CompletionScreen state={state} patch={patch} onSeeMatches={seeMatches} />;

  const dreamy = stageId in STAGE_DREAMY ? STAGE_DREAMY[stageId as keyof typeof STAGE_DREAMY] : null;

  return (
    <ThemeProvider>
        <BackgroundSpace />
        {/* No accumulated per-step blobs (visitedAccents empty, per direct
           feedback); the single accent tracks the progress bar's gradient at the
           current percent, and input pulses supply the reactivity. Screen-wide
           confetti is reserved for the Match celebration — the flow's own
           celebrations are Dreamy-local bursts. */}
        <AuroraBackground accent={accent} visitedAccents={[]} finale={isComplete || matchCelebrating} lightning={matchCelebrating} />
        {phase !== "build" && !matchCelebrating && <MatchBackdrop />}
        <Confetti colors={[accent, "#8b5cf6", "#ff4585", "#2f6bf2"]} active={matchCelebrating} />
        <HomeButton />
        <ThemeToggle />

        {/* h-dvh + overflow-hidden: the flow never page-scrolls. If a stage's
           content exceeds the viewport (short landscape phones), the step column
           scrolls internally instead. */}
        {/* h-dvh + overflow-hidden: the page never scrolls. Dreamy + progress
           stay PINNED (flex-none) so the fixed header controls never cut him
           off; only the step content below scrolls when a stage is taller than
           the viewport, and the whole group centers when it is not. The CTA
           row inside each step is sticky to this scroll container's bottom so
           Next/Previous never need hunting. */}
        <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden pt-[72px] sm:py-5">
          {/* Same 860px column for BOTH variants — per direct feedback the framed
             question blocks should match the unframed version's width. */}
          <div className="flex max-w-[860px] min-h-0 w-full flex-1 flex-col justify-center">
            {phase === "build" && dreamy && (
              <div className="mb-3 w-full flex-none px-5 sm:px-10">
                <DreamyGuide sprite={dreamy.sprite} line={dreamy.line} reactionNonce={reactionNonce} />
              </div>
            )}
            <div className="flow-scroll-fade flex min-h-0 w-full flex-col overflow-y-auto overscroll-contain px-4 [scrollbar-width:none] max-sm:pt-3 sm:px-10">
              {phase === "build" && <StepTransition key={stageId}>{content}</StepTransition>}
              {phase === "loading" && (
                <StepTransition key="match-loading">
                  <MatchLoadingScreen />
                </StepTransition>
              )}
              {phase === "match" && (
                <StepTransition key="match-experience">
                  <MatchExperience paths={MATCH_PATHS} onComplete={() => router.push("/career-report?from=match")} onCelebrationChange={setMatchCelebrating} />
                </StepTransition>
              )}
            </div>
          </div>
        </section>
    </ThemeProvider>
  );
}
