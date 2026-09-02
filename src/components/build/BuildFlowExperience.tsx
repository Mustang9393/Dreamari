"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { primeAudioOnFirstGesture } from "@/components/flow/aurora/feedback";
import { HomeButton } from "@/components/flow/HomeButton";
import { MatchLoadingScreen } from "@/components/flow/match/MatchLoadingScreen";
import { StepTransition } from "@/components/flow/StepTransition";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { ThemeToggle } from "@/components/flow/theme/ThemeToggle";
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

// After the loading beat, Build hands off to the real match flow at
// /match-lab (the old in-page MatchExperience is deleted).
type Phase = "build" | "loading";

export function BuildFlowExperience() {
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);
  const [state, setState] = useState<BuildState>(INITIAL_BUILD_STATE);
  const [phase, setPhase] = useState<Phase>("build");
  // Dreamy's heart-burst reaction, restored -- but only rendered on the
  // identity steps (Interests/Subjects/Work Vibe) that pass reactionNonce
  // into their own QuestionHeading call. Every step still calls react() on
  // selection, but on the stakes-bearing steps (cost, location, education,
  // profile) nothing listens for it, so nothing shows -- a celebratory
  // heart-burst is the wrong tone for "what total school cost feels
  // realistic," not just an unfinished wire-up.
  const [reactionNonce, setReactionNonce] = useState(0);

  const stage = STAGES[stageIndex];
  const stageId: StageId = stage.id;

  const next = () => setStageIndex((current) => Math.min(current + 1, STAGES.length - 1));
  const back = () => setStageIndex((current) => Math.max(current - 1, 0));
  const react = () => setReactionNonce((n) => n + 1);
  const seeMatches = () => setPhase("loading");

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => router.push("/match-lab"), MATCH_LOADING_MS);
    return () => clearTimeout(timer);
  }, [phase, router]);

  // Unlock audio on the first real tap/keypress (iOS mutes Web Audio behind the
  // ringer switch until an <audio> element has played; see feedback.ts).
  useEffect(() => primeAudioOnFirstGesture(), []);

  function patch(update: Partial<BuildState>) {
    setState((current) => ({ ...current, ...update }));
  }

  const accent = phase === "build" ? STAGE_ACCENTS[stageId] : MATCH_ACCENT;
  const isComplete = stageId === "complete" && phase === "build";

  // A trailing glow of the last few steps, not every step ever visited.
  // AuroraBackground has always supported accumulating one persistent blob
  // per visited step, but this flow has fed it an empty array since the
  // rebuild -- a deliberate simplification at the time, not a bug (the code
  // and its own comments call it out as intentional). Un-capped accumulation
  // is the likely reason it read as "too busy" back then: by the final step
  // every one of the 8 questions' colors would still be glowing at once,
  // stacking toward a wash of noise right as the flow should feel like it's
  // arriving somewhere, not getting louder. Windowing it to a short trail
  // keeps the "the space you're in keeps shifting" cue in the beginning and
  // middle of the flow, but lets it settle back down toward the end instead
  // of building indefinitely -- newer territory for this component, not a
  // straight revert to how it worked before.
  const TRAIL_LENGTH = 3;
  const visitedAccents = useMemo(() => {
    if (phase !== "build") return [];
    return STAGES.slice(0, stageIndex)
      .map((s) => STAGE_ACCENTS[s.id])
      .slice(-TRAIL_LENGTH);
  }, [phase, stageIndex]);

  const dreamy = stageId in STAGE_DREAMY ? STAGE_DREAMY[stageId as keyof typeof STAGE_DREAMY] : null;
  const stepProps: StepProps = { state, patch, onNext: next, react, reactionNonce, percent: stage.percent, almostDone: stage.almostDone, sprite: dreamy?.sprite };

  let content: ReactNode = null;
  if (stageId === "interests") content = <InterestsStep {...stepProps} />;
  else if (stageId === "subjects") content = <SubjectsStep {...stepProps} onBack={back} />;
  else if (stageId === "workVibe") content = <WorkVibeStep {...stepProps} onBack={back} />;
  else if (stageId === "milestone") content = <MilestoneScreen onNext={next} onBack={back} percent={stage.percent} />;
  else if (stageId === "education") content = <EducationStep {...stepProps} onBack={back} />;
  else if (stageId === "cost") content = <CostStep {...stepProps} onBack={back} />;
  else if (stageId === "location") content = <LocationStep {...stepProps} onBack={back} />;
  else if (stageId === "profile") content = <ProfileStep {...stepProps} onBack={back} />;
  else if (stageId === "complete") content = <CompletionScreen onSeeMatches={seeMatches} onBack={back} />;


  return (
    <ThemeProvider>
        <BackgroundSpace />
        {/* The current accent tracks the progress bar's gradient at the
           current percent (unchanged); visitedAccents now carries a short
           trailing window (see TRAIL_LENGTH above) instead of staying empty.
           Screen-wide confetti is still reserved for the Match celebration —
           the flow's own celebrations are Dreamy-local bursts. */}
        <AuroraBackground accent={accent} visitedAccents={visitedAccents} finale={isComplete} lightning={false} />
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
        <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden pt-[72px] sm:pt-16 sm:pb-5">
          {/* Same 860px column for BOTH variants — per direct feedback the framed
             question blocks should match the unframed version's width. */}
          <div className="flex max-w-[860px] min-h-0 w-full flex-1 flex-col justify-center">
            {/* flex-1: fills the column's full height instead of shrinking to
               its content. Without this, a step shorter than the viewport
               got centered as a block (question + footer together) one
               level up, leaving real empty space -- and the sticky footer's
               own ::before scrim -- floating short of the true screen
               bottom. Each step's own wrapper now centers its question
               content and pins its footer to this container's bottom via
               mt-auto (see StepFooter), so the footer always reaches the
               real edge regardless of content height or viewport size. */}
            <div className="flow-scroll-fade flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain px-4 [scrollbar-width:none] max-sm:pt-3 sm:px-10">
              {phase === "build" && <StepTransition key={stageId}>{content}</StepTransition>}
              {phase === "loading" && (
                <StepTransition key="match-loading">
                  <MatchLoadingScreen />
                </StepTransition>
              )}
            </div>
          </div>
        </section>
    </ThemeProvider>
  );
}
