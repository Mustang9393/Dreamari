"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AuroraBackground } from "./aurora/AuroraBackground";
import { Confetti } from "./aurora/Confetti";
import { FlowProgress } from "./FlowProgress";
import { HomeButton } from "./HomeButton";
import { StepTransition } from "./StepTransition";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ThemeToggle } from "./theme/ThemeToggle";
import { INITIAL_FLOW_STATE, STEP_AURORA_ACCENTS, TOTAL_STEPS, type FlowState } from "./types";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ChoosePathStep } from "./steps/ChoosePathStep";
import { AboutYouStep } from "./steps/AboutYouStep";
import { AcademicJourneyStep } from "./steps/AcademicJourneyStep";
import { ConfidenceCheckStep } from "./steps/ConfidenceCheckStep";
import { WorkStyleStep } from "./steps/WorkStyleStep";
import { FutureValuesStep } from "./steps/FutureValuesStep";
import { PathForwardStep } from "./steps/PathForwardStep";
import { FinancialStep } from "./steps/FinancialStep";
import { LocationStep } from "./steps/LocationStep";
import { CongratulationsStep } from "./steps/CongratulationsStep";

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function FlowContainer() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FlowState>(INITIAL_FLOW_STATE);

  const next = () => setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  const back = () => setStep((current) => Math.max(current - 1, 1));
  const restart = () => {
    setState(INITIAL_FLOW_STATE);
    setStep(1);
  };

  function patch(update: Partial<FlowState>) {
    setState((current) => ({ ...current, ...update }));
  }

  const isFinale = step === TOTAL_STEPS;
  const visitedAccents = useMemo(() => STEP_AURORA_ACCENTS.slice(0, step), [step]);
  const accentVar = { "--step-accent": STEP_AURORA_ACCENTS[step - 1] } as CSSProperties;

  let content: ReactNode = null;
  if (step === 1) content = <WelcomeStep onNext={next} />;
  else if (step === 2) content = <ChoosePathStep path={state.path} onChange={(path) => patch({ path })} onNext={next} />;
  else if (step === 3)
    content = (
      <AboutYouStep
        fullName={state.fullName}
        schoolWorkplace={state.schoolWorkplace}
        gradeLevel={state.gradeLevel}
        onChangeFullName={(fullName) => patch({ fullName })}
        onChangeSchoolWorkplace={(schoolWorkplace) => patch({ schoolWorkplace })}
        onChangeGradeLevel={(gradeLevel) => patch({ gradeLevel })}
        onNext={next}
      />
    );
  else if (step === 4)
    content = (
      <AcademicJourneyStep
        path={state.path}
        gradeLevel={state.gradeLevel}
        gpaRange={state.gpaRange}
        subjects={state.subjects}
        onChangeGpaRange={(gpaRange) => patch({ gpaRange })}
        onToggleSubject={(subject) => patch({ subjects: toggleInList(state.subjects, subject) })}
        onNext={next}
      />
    );
  else if (step === 5)
    content = (
      <ConfidenceCheckStep
        strengths={state.strengths}
        onToggleStrength={(strength) => patch({ strengths: toggleInList(state.strengths, strength) })}
        onNext={next}
      />
    );
  else if (step === 6)
    content = (
      <WorkStyleStep
        energy={state.energy}
        teamStyle={state.teamStyle}
        interaction={state.interaction}
        onChangeEnergy={(energy) => patch({ energy })}
        onChangeTeamStyle={(teamStyle) => patch({ teamStyle })}
        onChangeInteraction={(interaction) => patch({ interaction })}
        onNext={next}
      />
    );
  else if (step === 7)
    content = (
      <FutureValuesStep values={state.values} onToggleValue={(value) => patch({ values: toggleInList(state.values, value) })} onNext={next} />
    );
  else if (step === 8)
    content = <PathForwardStep pathForward={state.pathForward} onChange={(pathForward) => patch({ pathForward })} onNext={next} />;
  else if (step === 9)
    content = <FinancialStep financial={state.financial} onChange={(financial) => patch({ financial })} onBack={back} onNext={next} />;
  else if (step === 10)
    content = <LocationStep location={state.location} onChange={(location) => patch({ location })} onBack={back} onNext={next} />;
  else if (step === 11) content = <CongratulationsStep onRestart={restart} />;

  return (
    <ThemeProvider>
      <AuroraBackground accent={STEP_AURORA_ACCENTS[step - 1]} visitedAccents={visitedAccents} finale={isFinale} />
      <Confetti colors={STEP_AURORA_ACCENTS} active={isFinale} />
      <HomeButton />
      <ThemeToggle />
      <section
        style={accentVar}
        className="relative z-10 flex min-h-dvh w-full flex-col items-center gap-3 px-6 py-3 sm:gap-10 sm:px-10 sm:py-12 lg:px-16"
      >
        <FlowProgress step={step} />

        <div className="flex w-full flex-1 items-center justify-center">
          <StepTransition key={step}>{content}</StepTransition>
        </div>
      </section>
    </ThemeProvider>
  );
}
