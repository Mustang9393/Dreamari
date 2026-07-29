"use client";

import { useState } from "react";
import { AuroraBackground } from "./aurora/AuroraBackground";
import { FlowProgress } from "./FlowProgress";
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

  return (
    <ThemeProvider>
      <AuroraBackground accent={STEP_AURORA_ACCENTS[step - 1]} />
      <ThemeToggle />
      <section className="relative z-10 flex min-h-screen w-full flex-col items-center gap-10 px-6 py-12 sm:px-10 lg:px-16">
        <FlowProgress step={step} />

        <div className="flex w-full flex-1 items-center justify-center">
          {step === 1 && <WelcomeStep onNext={next} />}

        {step === 2 && <ChoosePathStep path={state.path} onChange={(path) => patch({ path })} onNext={next} />}

        {step === 3 && (
          <AboutYouStep
            fullName={state.fullName}
            schoolWorkplace={state.schoolWorkplace}
            gradeLevel={state.gradeLevel}
            onChangeFullName={(fullName) => patch({ fullName })}
            onChangeSchoolWorkplace={(schoolWorkplace) => patch({ schoolWorkplace })}
            onChangeGradeLevel={(gradeLevel) => patch({ gradeLevel })}
            onNext={next}
          />
        )}

        {step === 4 && (
          <AcademicJourneyStep
            path={state.path}
            gradeLevel={state.gradeLevel}
            gpaRange={state.gpaRange}
            subjects={state.subjects}
            onChangeGpaRange={(gpaRange) => patch({ gpaRange })}
            onToggleSubject={(subject) => patch({ subjects: toggleInList(state.subjects, subject) })}
            onNext={next}
          />
        )}

        {step === 5 && (
          <ConfidenceCheckStep
            strengths={state.strengths}
            onToggleStrength={(strength) => patch({ strengths: toggleInList(state.strengths, strength) })}
            onNext={next}
          />
        )}

        {step === 6 && (
          <WorkStyleStep
            energy={state.energy}
            teamStyle={state.teamStyle}
            interaction={state.interaction}
            onChangeEnergy={(energy) => patch({ energy })}
            onChangeTeamStyle={(teamStyle) => patch({ teamStyle })}
            onChangeInteraction={(interaction) => patch({ interaction })}
            onNext={next}
          />
        )}

        {step === 7 && (
          <FutureValuesStep
            values={state.values}
            onToggleValue={(value) => patch({ values: toggleInList(state.values, value) })}
            onNext={next}
          />
        )}

        {step === 8 && (
          <PathForwardStep pathForward={state.pathForward} onChange={(pathForward) => patch({ pathForward })} onNext={next} />
        )}

        {step === 9 && (
          <FinancialStep financial={state.financial} onChange={(financial) => patch({ financial })} onBack={back} onNext={next} />
        )}

        {step === 10 && (
          <LocationStep location={state.location} onChange={(location) => patch({ location })} onBack={back} onNext={next} />
        )}

        {step === 11 && <CongratulationsStep onRestart={restart} />}
        </div>
      </section>
    </ThemeProvider>
  );
}
