"use client";

import { useState } from "react";
import { FileText, ShieldAlert, Trophy } from "lucide-react";
import Link from "next/link";

import { Keycap } from "./interactions";
import { type PerformancePlan, type PipState } from "./performance-plan";
import { playCorrect, playSweep, playWrong } from "./sound";

// The Performance Plan takeover. Deliberately its own small state machine,
// not a beat in the level's own array -- it is not one of the ten scored
// beats, it never moves the level's progress bar, and it can only happen
// once per level. RED is the ambience for the whole sequence (the warning
// and the two decision steps that still have a job on the line), draining
// to purple on a pass and staying red -- but quiet, no confetti -- on
// termination. See performance-plan.ts for the content and scoring.ts's
// STRIKE RULE comment for how a player ends up here at all.

type Phase = "warning" | "step" | "passed" | "terminated";

/** Fixed flavor text, identical at every level: one line of plain SYSTEM
 *  text at the foot of the card, no avatar and no name (Dreamy is gone from
 *  the simulation, D62). Step 1 always gets the first line; step 2 shows
 *  nothing, and the silence is deliberate; step 3 only gets the second line
 *  if both earlier steps were missed, since it means this answer alone
 *  decides whether the job is kept. */
const SYSTEM_STEP_ONE = "Three mistakes is a pattern, not bad luck. Two right answers out of three and you keep the job.";
const SYSTEM_LAST_CHANCE = "This one decides it. Be specific.";

export function PerformancePlanFlow({
  plan,
  pip,
  onPassed,
  onTerminated,
}: {
  /** This simulation's own plan for this level (PERFORMANCE_PLANS[simId][n]). */
  plan: PerformancePlan;
  pip: PipState;
  onPassed: () => void;
  onTerminated: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("warning");
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<"correct" | "incorrect" | null>(null);

  const current = plan.steps[step];
  const setupText = current.setup.replace("{PLAN_LINE}", pip.triggerLine);
  // Rolled once, at trigger time, in resolve()'s setTimeout callback -- not
  // here. React's render pass has to stay pure, and Math.random is not.
  const order = pip.stepOrders[step];

  function pick(which: "correct" | "incorrect") {
    if (picked) return;
    setPicked(which);
    if (which === "correct") {
      playCorrect();
      setCorrectCount((count) => count + 1);
    } else {
      playWrong();
    }
  }

  function continueStep() {
    setPicked(null);
    if (step < 2) {
      setStep((s) => (s + 1) as 0 | 1 | 2);
      return;
    }
    // correctCount already reflects this step's own pick -- `pick()` above
    // updates it synchronously before Continue is even clickable.
    setPhase(correctCount >= 2 ? "passed" : "terminated");
  }

  // Step 3's system line is conditional on both earlier steps having missed
  // -- i.e. correctCount is still 0 by the time step 3 is showing.
  const showSystemLine = step === 0 ? true : step === 1 ? false : correctCount === 0;
  const systemLine = step === 2 ? SYSTEM_LAST_CHANCE : SYSTEM_STEP_ONE;

  return (
    <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 pb-3 sm:px-5 sm:pb-5">
      {/* Full RED ambience -- the only place in the game red is used.
         Draining to deep purple on a pass, staying red (just without the
         warning's shield/gradient energy) on termination. */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 transition-[background] duration-700"
        style={{
          background:
            phase === "warning"
              ? "radial-gradient(ellipse at 50% 30%, #7a1f0a 0%, #3a0a10 55%, #0d0308 100%)"
              : phase === "step"
                ? "radial-gradient(ellipse at 50% 20%, #5a0f14 0%, #26060c 60%, #0a0308 100%)"
                : phase === "passed"
                  ? "radial-gradient(ellipse at 50% 30%, #3a1a5c 0%, #1c0e30 55%, #0a0614 100%)"
                  : "radial-gradient(ellipse at 50% 30%, #3a0a10 0%, #1a0508 60%, #080304 100%)",
        }}
      />
      <div className="relative z-[1] flex w-full max-w-[480px] flex-col items-center gap-[var(--space-4)]">
        {phase === "warning" && (
          <WarningCard setup={plan.warningSetup} question={plan.warningQuestion} cta={plan.warningCta} onBegin={() => setPhase("step")} />
        )}

        {phase === "step" && (
          <StepCard
            stepIndex={step}
            setup={setupText}
            correctLabel={current.correct}
            order={order}
            picked={picked}
            whyCorrect={current.whyCorrect}
            whyIncorrect={current.whyIncorrect}
            incorrectLabel={current.incorrect}
            showSystemLine={showSystemLine}
            systemLine={systemLine}
            onPick={pick}
            onContinue={continueStep}
          />
        )}

        {phase === "passed" && (
          <OutcomeCard
            tone="passed"
            icon={<Trophy className="h-[28px] w-[28px]" aria-hidden />}
            headline={plan.passedSetup}
            body={plan.passedBody}
          >
            <button
              type="button"
              onClick={() => {
                playSweep();
                onPassed();
              }}
              className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
              style={{ background: "#a855f7", color: "#0a0614" }}
            >
              {plan.passedCta}
            </button>
          </OutcomeCard>
        )}

        {phase === "terminated" && (
          <OutcomeCard tone="terminated" icon={<FileText className="h-[28px] w-[28px]" aria-hidden />} headline="Employment Terminated" body={plan.terminatedSetup}>
            <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {plan.terminatedBody}
            </p>
            <div className="mt-[var(--space-1)] flex w-full flex-col gap-[8px]">
              <button
                type="button"
                onClick={onTerminated}
                className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
                style={{ background: "#e5484d", color: "#1a0508" }}
              >
                {plan.terminatedRestartCta}
              </button>
              <Link
                href="/play"
                className="flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] border px-[18px] py-[13px] text-[15px] font-semibold"
                style={{ borderColor: "rgba(255,255,255,0.25)", color: "#F4F7FF" }}
              >
                {plan.terminatedLeaveCta}
              </Link>
            </div>
          </OutcomeCard>
        )}
      </div>
    </div>
  );
}

function WarningCard({ setup, question, cta, onBegin }: { setup: string; question: string; cta: string; onBegin: () => void }) {
  return (
    <div
      className="flex w-full flex-col items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border-2 px-[22px] py-[26px] text-center backdrop-blur-[22px] motion-safe:animate-[play-sheet-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{ background: "linear-gradient(160deg, rgba(234,88,12,0.22), rgba(127,29,29,0.55))", borderColor: "#f97316" }}
    >
      <span className="flex h-[58px] w-[58px] items-center justify-center rounded-[var(--radius-lg)]" style={{ background: "#f97316", color: "#fff" }}>
        <ShieldAlert className="h-[28px] w-[28px]" aria-hidden />
      </span>
      <h2 className="text-[22px] leading-[1.2] font-extrabold sm:text-[26px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
        Performance Plan
      </h2>
      <p className="text-[15.5px] leading-relaxed font-semibold" style={{ color: "#fff" }}>
        {setup}
      </p>
      <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
        {question}
      </p>
      <button
        type="button"
        onClick={onBegin}
        className="dm-solid mt-[var(--space-1)] flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
        style={{ background: "#f97316", color: "#1a0508" }}
      >
        {cta}
      </button>
    </div>
  );
}

function StepCard({
  stepIndex,
  setup,
  correctLabel,
  incorrectLabel,
  order,
  picked,
  whyCorrect,
  whyIncorrect,
  showSystemLine,
  systemLine,
  onPick,
  onContinue,
}: {
  stepIndex: 0 | 1 | 2;
  setup: string;
  correctLabel: string;
  incorrectLabel: string;
  order: ("correct" | "incorrect")[];
  picked: "correct" | "incorrect" | null;
  whyCorrect: string;
  whyIncorrect: string;
  showSystemLine: boolean;
  systemLine: string;
  onPick: (which: "correct" | "incorrect") => void;
  onContinue: () => void;
}) {
  const labels: Record<"correct" | "incorrect", string> = { correct: correctLabel, incorrect: incorrectLabel };
  return (
    <div className="flex w-full flex-col gap-[var(--space-3)]">
      {/* Three step pips -- the plan's own progress, entirely separate from
         the level's frozen reputation bar shown above it in the HUD. */}
      <div className="flex items-center justify-center gap-[8px]">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-[7px] rounded-full transition-[width,background] duration-300"
            style={{ width: dot === stepIndex ? 26 : 7, background: dot <= stepIndex ? "#f4f7ff" : "rgba(255,255,255,0.25)" }}
          />
        ))}
      </div>
      <div
        className="flex w-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border-2 px-[18px] py-[20px] backdrop-blur-[22px]"
        style={{ background: "rgba(10,3,6,0.72)", borderColor: "#e5484d" }}
      >
        <p className="m-0 text-[18px] leading-[1.3] font-extrabold sm:text-[20px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
          {setup}
        </p>
        {!picked ? (
          <div className="flex flex-col gap-[10px]">
            {order.map((which) => (
              <button
                key={which}
                type="button"
                onClick={() => onPick(which)}
                className="dm-quiet flex w-full cursor-pointer items-center rounded-[var(--radius-lg)] border px-[16px] py-[13px] text-left text-[15px] font-bold"
                style={{ borderColor: "rgba(255,255,255,0.25)", color: "#F4F7FF" }}
              >
                {labels[which]}
              </button>
            ))}
          </div>
        ) : (
          <>
            <p className="text-[14.5px] leading-relaxed font-semibold" style={{ color: picked === "correct" ? "#4ade80" : "#fca5a5" }}>
              {picked === "correct" ? whyCorrect : whyIncorrect}
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
              style={{ background: "#e5484d", color: "#1a0508" }}
            >
              Continue
              <Keycap tint="#1a0508">⏎</Keycap>
            </button>
          </>
        )}
      </div>
      {showSystemLine && (
        <p
          className="rounded-[var(--radius-lg)] border px-[16px] py-[13px] text-[13.5px] leading-relaxed font-semibold"
          style={{ background: "rgba(10,3,6,0.5)", borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)" }}
        >
          {systemLine}
        </p>
      )}
    </div>
  );
}

function OutcomeCard({
  tone,
  icon,
  headline,
  body,
  children,
}: {
  tone: "passed" | "terminated";
  icon: React.ReactNode;
  headline: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex w-full flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border-2 px-[22px] py-[26px] text-center backdrop-blur-[22px] motion-safe:animate-[play-sheet-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{
        background: tone === "passed" ? "rgba(88,28,135,0.4)" : "rgba(40,8,12,0.6)",
        borderColor: tone === "passed" ? "#a855f7" : "#e5484d",
      }}
    >
      <span
        className="flex h-[58px] w-[58px] items-center justify-center rounded-[var(--radius-lg)]"
        style={{ background: tone === "passed" ? "#facc15" : "#6b7280", color: tone === "passed" ? "#1a0614" : "#0a0a0a" }}
      >
        {icon}
      </span>
      <h2 className="text-[24px] leading-[1.15] font-extrabold sm:text-[28px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
        {headline}
      </h2>
      <p className="text-[15.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
        {body}
      </p>
      {children}
    </div>
  );
}
