"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuroraBackground } from "./aurora/AuroraBackground";
import { Confetti } from "./aurora/Confetti";
import { FlowProgress } from "./FlowProgress";
import { HomeButton } from "./HomeButton";
import { MatchBackdrop } from "./match/MatchBackdrop";
import { MatchExperience } from "./match/MatchExperience";
import { MatchLoadingScreen } from "./match/MatchLoadingScreen";
import { MATCH_PATHS } from "./match/matchData";
import { StepTransition } from "./StepTransition";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ThemeToggle } from "./theme/ThemeToggle";
import { INITIAL_FLOW_STATE, MATCH_CATEGORY_COLORS, STEP_AURORA_ACCENTS, STEP_GRADIENT_OVERRIDES, TOTAL_STEPS, type FlowState } from "./types";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ChoosePathStep } from "./steps/ChoosePathStep";
import { AboutYouStep } from "./steps/AboutYouStep";
import { AcademicJourneyStep } from "./steps/AcademicJourneyStep";
import { ConfidenceCheckStep } from "./steps/ConfidenceCheckStep";
import { SpendYourDaysStep } from "./steps/SpendYourDaysStep";
import { WorkStyleStep } from "./steps/WorkStyleStep";
import { FutureValuesStep } from "./steps/FutureValuesStep";
import { PathForwardStep } from "./steps/PathForwardStep";
import { FinancialStep } from "./steps/FinancialStep";
import { LocationStep } from "./steps/LocationStep";
import { CongratulationsStep } from "./steps/CongratulationsStep";

const MATCH_LOADING_MS = 1800;
// Match phase isn't one of the 12 Build steps, so it isn't in STEP_AURORA_ACCENTS —
// reuses the same blue as the Welcome/Congratulations bookends for a consistent brand
// accent rather than introducing a new color.
const MATCH_ACCENT = "var(--color-brand-600)";

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

type Phase = "build" | "loading" | "match";

export function FlowContainer() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FlowState>(INITIAL_FLOW_STATE);
  const [phase, setPhase] = useState<Phase>("build");
  // True for exactly as long as MatchExperience's "Path Saved!" celebration is on
  // screen — swaps the plain static MatchBackdrop for the same colorful, interactive
  // AuroraBackground + confetti treatment the Build finale gets.
  const [matchCelebrating, setMatchCelebrating] = useState(false);

  const next = () => setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  const back = () => setStep((current) => Math.max(current - 1, 1));
  const seeMatches = () => setPhase("loading");

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("match"), MATCH_LOADING_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  function patch(update: Partial<FlowState>) {
    setState((current) => ({ ...current, ...update }));
  }

  const isFinale = step === TOTAL_STEPS && phase === "build";
  const visitedAccents = useMemo(() => STEP_AURORA_ACCENTS.slice(0, step), [step]);
  const accent = phase === "build" ? STEP_AURORA_ACCENTS[step - 1] : MATCH_ACCENT;
  const gradientOverride = phase === "build" ? STEP_GRADIENT_OVERRIDES[step] : undefined;
  const derivedTo = `color-mix(in srgb, ${accent} 65%, black)`;
  const accentVar = {
    "--step-accent": accent,
    "--step-button-from": gradientOverride?.button.from ?? accent,
    "--step-button-to": gradientOverride?.button.to ?? derivedTo,
    "--step-progress-from": gradientOverride?.progress.from ?? accent,
    "--step-progress-to": gradientOverride?.progress.to ?? derivedTo,
  } as CSSProperties;

  let content: ReactNode = null;
  if (step === 1) content = <WelcomeStep onNext={next} />;
  else if (step === 2) content = <ChoosePathStep path={state.path} onChange={(path) => patch({ path })} onBack={back} onNext={next} />;
  else if (step === 3)
    content = (
      <AboutYouStep
        fullName={state.fullName}
        schoolWorkplace={state.schoolWorkplace}
        gradeLevel={state.gradeLevel}
        onChangeFullName={(fullName) => patch({ fullName })}
        onChangeSchoolWorkplace={(schoolWorkplace) => patch({ schoolWorkplace })}
        onChangeGradeLevel={(gradeLevel) => patch({ gradeLevel })}
        onBack={back}
        onNext={next}
      />
    );
  else if (step === 4)
    content = (
      <AcademicJourneyStep
        gpaRange={state.gpaRange}
        subjects={state.subjects}
        easySubjects={state.easySubjects}
        onChangeGpaRange={(gpaRange) => patch({ gpaRange })}
        onToggleSubject={(subject) => patch({ subjects: toggleInList(state.subjects, subject) })}
        onToggleEasySubject={(subject) => patch({ easySubjects: toggleInList(state.easySubjects, subject) })}
        onBack={back}
        onNext={next}
      />
    );
  else if (step === 5)
    content = (
      <ConfidenceCheckStep
        strengths={state.strengths}
        onToggleStrength={(strength) => patch({ strengths: toggleInList(state.strengths, strength) })}
        onBack={back}
        onNext={next}
      />
    );
  else if (step === 6)
    content = (
      <SpendYourDaysStep
        activities={state.activities}
        onToggleActivity={(activity) => patch({ activities: toggleInList(state.activities, activity) })}
        onBack={back}
        onNext={next}
      />
    );
  else if (step === 7)
    content = (
      <WorkStyleStep
        energy={state.energy}
        teamStyle={state.teamStyle}
        interaction={state.interaction}
        onChangeEnergy={(energy) => patch({ energy })}
        onChangeTeamStyle={(teamStyle) => patch({ teamStyle })}
        onChangeInteraction={(interaction) => patch({ interaction })}
        onBack={back}
        onNext={next}
      />
    );
  else if (step === 8)
    content = (
      <FutureValuesStep
        values={state.values}
        onToggleValue={(value) => patch({ values: toggleInList(state.values, value) })}
        onBack={back}
        onNext={next}
      />
    );
  else if (step === 9)
    content = <PathForwardStep pathForward={state.pathForward} onChange={(pathForward) => patch({ pathForward })} onBack={back} onNext={next} />;
  else if (step === 10)
    content = <FinancialStep financial={state.financial} onChange={(financial) => patch({ financial })} onBack={back} onNext={next} />;
  else if (step === 11)
    content = <LocationStep location={state.location} onChange={(location) => patch({ location })} onBack={back} onNext={next} />;
  else if (step === 12) content = <CongratulationsStep onBack={back} onSeeMatches={seeMatches} />;

  return (
    <ThemeProvider>
      <AuroraBackground
        accent={accent}
        visitedAccents={phase === "build" ? visitedAccents : []}
        finale={isFinale || matchCelebrating}
        lightning={matchCelebrating}
      />
      {phase !== "build" && !matchCelebrating && <MatchBackdrop />}
      <Confetti colors={matchCelebrating ? MATCH_CATEGORY_COLORS : STEP_AURORA_ACCENTS} active={isFinale || matchCelebrating} />
      <HomeButton />
      <ThemeToggle />
      <section
        style={accentVar}
        // Match/loading phases get less vertical padding than build (sm:py-4 vs sm:py-8)
        // — build steps need the room since FlowProgress sits above them, but match has
        // no progress bar there and the extra padding was just eating into the room the
        // deck + CTAs need to fit one viewport without scrolling.
        className={`relative z-10 flex min-h-dvh w-full flex-col items-center px-6 py-2 sm:px-10 lg:px-16 ${
          phase === "build" ? "sm:py-8" : "sm:py-2"
        }`}
      >
        {/* FlowProgress and the card live in ONE flex-1 column here (not FlowProgress as
            a separate top-anchored sibling) so the pair centers as a single unit on tall
            viewports — previously FlowProgress sat pinned right under the section's own
            top padding while only the card centered in the leftover space below it, which
            on a large monitor read as "progress bar stuck to the top, card floating alone
            in the middle" instead of one cohesive composition.
            justify-start (not the default justify-center) only for step 3 (About You):
            that step renders Dreamy above its card with a deliberately fixed, tight gap
            (AboutYouStep's own sm:-mt-5) — centering this block vertically would stack
            unpredictable extra slack from any leftover viewport height on top of that
            fixed gap, growing it on taller screens instead of holding it at ~12px. */}
        <div
          className={`flex w-full flex-1 flex-col items-center gap-2 sm:gap-8 ${
            step === 3 && phase === "build" ? "justify-start" : "justify-center"
          }`}
        >
          {/* Not on step 1 (Welcome/"Hi, I'm Dreamy") — that screen is the intro, before
              the user has actually started answering anything, so a progress bar there
              reads as premature rather than informative. */}
          {phase === "build" && step !== 1 && <FlowProgress step={step} />}
          <div className="flex w-full items-center justify-center">
            {phase === "build" && <StepTransition key={step}>{content}</StepTransition>}
            {phase === "loading" && (
              <StepTransition key="match-loading">
                <MatchLoadingScreen />
              </StepTransition>
            )}
            {phase === "match" && (
              <StepTransition key="match-experience">
                <MatchExperience
                  paths={MATCH_PATHS}
                  onComplete={() => router.push("/career-report?from=match")}
                  onCelebrationChange={setMatchCelebrating}
                />
              </StepTransition>
            )}
          </div>
        </div>
      </section>
    </ThemeProvider>
  );
}
