// The Performance Improvement Plan, from the Performance Plan tab of the
// handoff. Fires only when a player racks up three strikes inside one
// level -- see THE STRIKE RULE in scoring.ts's own comment for the trigger
// math. It is NOT one of the ten scored beats and never moves the level's
// progress bar. Runs in full RED ambience, the only place in the game red
// is used, and can end the run in termination -- a failure path the build
// never had at all.
//
// Content is bespoke per level (the supervisor's example changes, the
// skills tagged change), but the STRUCTURE is identical everywhere:
// Warning -> three fixed Decision steps -> Passed or Terminated. One
// engine (PerformancePlanFlow in SimulationPlayer.tsx) drives all three
// from this data.

export type PerformancePlanStep = {
  /** Step 1 carries the {PLAN_LINE} template naming the beat that produced
   *  the third strike; steps 2 and 3 are fixed scenarios that never change
   *  beat to beat. Always paired with the fixed "Pick one." question. */
  setup: string;
  /** Always the right and wrong option text, in that fixed order -- the
   *  RENDERED position is randomised per the handoff ("MUST RANDOMISE
   *  POSITION. In the build the right answer was A all three times"). */
  correct: string;
  incorrect: string;
  whyCorrect: string;
  whyIncorrect: string;
  skillPrimary: string;
  skillSecondary: string;
};

export type PerformancePlan = {
  /** PIPn-00: the full-red warning card that opens the sequence. */
  warningSetup: string;
  warningQuestion: string;
  warningCta: string;
  /** PIPn-01 .. 03: exactly three decision steps, scored pass/fail only. */
  steps: [PerformancePlanStep, PerformancePlanStep, PerformancePlanStep];
  /** PIPn-04: 2 or 3 of 3 correct. */
  passedSetup: string;
  passedBody: string;
  passedCta: string;
  /** PIPn-05: 0 or 1 of 3 correct. Two CTAs, unlike every other outcome in
   *  the game -- restart this level, or leave the simulation entirely. */
  terminatedSetup: string;
  terminatedBody: string;
  terminatedRestartCta: string;
  terminatedLeaveCta: string;
};

export const PERFORMANCE_PLANS: Record<1 | 2 | 3, PerformancePlan> = {
  1: {
    warningSetup: "You made three mistakes this year. Cobalt Capital is putting you on a performance plan. Get 2 of 3 right to keep your job.",
    warningQuestion: "What is a performance plan? It is an official warning from your boss. Miss the goals in it and you can be let go.",
    warningCta: "Begin Recovery",
    steps: [
      {
        setup: 'Your supervisor names the most recent one. "Three times this year. The last was when {PLAN_LINE}." She asks how you check your work before you hand it in. Pick one.',
        correct: "Explain what you do now, then ask what the team expects",
        incorrect: "Say sorry and promise it will not happen again",
        whyCorrect: "Right. Asking for the standard shows you want to fix the cause, not just the mood in the room.",
        whyIncorrect: "An apology closes the conversation. It does not tell her anything will actually change.",
        skillPrimary: "Self-Reflection & Improvement",
        skillSecondary: "Active Learning",
      },
      {
        setup: "You did not understand an instruction and guessed instead of asking. The work came back wrong. Pick one.",
        correct: "Say you were unsure, and ask what to do next time you are",
        incorrect: "Say you misheard and will listen more carefully",
        whyCorrect: "Right. Admitting you were unsure is what lets someone help you. Guessing hides the problem.",
        whyIncorrect: "Blaming your hearing makes it a one-off. It was not a one-off, it was a habit of not asking.",
        skillPrimary: "Social Awareness",
        skillSecondary: "Active Learning",
      },
      {
        setup: "Last week of the plan. Your supervisor asks what you have done differently this month. Pick one.",
        correct: "Name one habit you changed and show work that proves it",
        incorrect: "Say you have been trying harder and paying more attention",
        whyCorrect: "Right. One specific change with proof beats any amount of effort you cannot point at.",
        whyIncorrect: "Trying harder is invisible. If she cannot see it, from where she sits it did not happen.",
        skillPrimary: "Self-Reflection & Improvement",
        skillSecondary: "Written Communication",
      },
    ],
    passedSetup: "You made it out.",
    passedBody: "Your team trusts you to check your own work now. Back to the internship, and the return offer is still there.",
    passedCta: "Back to work",
    terminatedSetup: "Cobalt Capital is ending your contract. Your supervisor walks you out. This is what being let go looks like.",
    terminatedBody: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
    terminatedRestartCta: "Play this year again",
    terminatedLeaveCta: "Back to Games",
  },
  2: {
    warningSetup: "You made three mistakes this year. Cobalt Capital is putting you on a performance plan. Get 2 of 3 right to keep your job.",
    warningQuestion: "What is a performance plan? It is an official warning from your boss. Miss the goals in it and you can be let go.",
    warningCta: "Begin Recovery",
    steps: [
      {
        setup: 'Your supervisor names the most recent one. "Three times this year. The last was when {PLAN_LINE}." She asks how you check your work before you hand it in. Pick one.',
        correct: "Explain what you do now, then ask for the check the team uses",
        incorrect: "Apologise and promise it will not happen again",
        whyCorrect: "Right. Asking for the team's check turns your problem into their process, which is where it gets solved.",
        whyIncorrect: "An apology closes the conversation. It does not tell her anything will actually change.",
        skillPrimary: "Critical Thinking",
        skillSecondary: "Self-Reflection & Improvement",
      },
      {
        setup: "You missed a deadline on an internal document and said nothing until your manager asked where it was. Pick one.",
        correct: "Own it, say what slowed you down, and agree how to flag delays",
        incorrect: "Say you were overwhelmed and will manage your time better",
        whyCorrect: "Right. The missed deadline is forgivable. The silence is the part that cost you trust.",
        whyIncorrect: "Overwhelmed explains the delay. It does not explain why nobody heard about it for two days.",
        skillPrimary: "Time Management",
        skillSecondary: "Social Awareness",
      },
      {
        setup: "Last week of the plan. Your supervisor asks for one concrete thing you have done differently. Pick one.",
        correct: "Name one habit you changed and show the improved work",
        incorrect: "Say you have been working harder and staying focused",
        whyCorrect: "Right. One specific change with proof beats any amount of effort you cannot point at.",
        whyIncorrect: "Working harder is invisible. If she cannot see it, from where she sits it did not happen.",
        skillPrimary: "Self-Reflection & Improvement",
        skillSecondary: "Written Communication",
      },
    ],
    passedSetup: "You made it out.",
    passedBody: "Your team trusts you to deliver without being checked. Back to the Analyst year, and the promotion is still live.",
    passedCta: "Back to work",
    terminatedSetup: "Cobalt Capital is ending your contract. Your supervisor walks you out. This is what being let go looks like.",
    terminatedBody: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
    terminatedRestartCta: "Play this year again",
    terminatedLeaveCta: "Back to Games",
  },
  3: {
    warningSetup: "You made three mistakes this year. Cobalt Capital is putting you on a performance plan. Get 2 of 3 right to keep your job.",
    warningQuestion: "What is a performance plan? It is an official warning from your boss. Miss the goals in it and you can be let go.",
    warningCta: "Begin Recovery",
    steps: [
      {
        setup: 'Christina (VP) names the most recent one. "Three times this year. The last was when {PLAN_LINE}." She asks how the review is supposed to work. Pick one.',
        correct: "Say the review was yours, name what you missed and your fix",
        incorrect: "Explain the Analyst made the mistake and you will speak to them",
        whyCorrect: "Right. You reviewed it. From here up, their mistakes are your mistakes and saying so is the job.",
        whyIncorrect: "True and useless. Christina knows who typed it. She is asking who was supposed to catch it.",
        skillPrimary: "Leadership & Team Management",
        skillSecondary: "Self-Reflection & Improvement",
      },
      {
        setup: "You knew two days ago that a deadline would slip. You said nothing and tried to fix it yourself. Pick one.",
        correct: "Say when you knew, why you waited, and agree a rule for next time",
        incorrect: "Say the team was stretched and you were handling it",
        whyCorrect: "Right. Two days of warning is worth more to your VP than two days of you quietly trying.",
        whyIncorrect: "Handling it alone sounds like ownership. It removed everyone else's chance to help.",
        skillPrimary: "Social Awareness",
        skillSecondary: "Time Management",
      },
      {
        setup: "Last week of the plan. Christina (VP) asks what has changed in how you run your team. Pick one.",
        correct: "Name one change and point to your Analysts' work that shows it",
        incorrect: "Say the team is in a better place and communicating more",
        whyCorrect: "Right. At this level the proof is not your work. It is what the people under you produced.",
        whyIncorrect: "A better place is a feeling. She is asking for something she can look at.",
        skillPrimary: "Teaching & Guiding Others",
        skillSecondary: "Evaluating Outcomes",
      },
    ],
    passedSetup: "You made it out.",
    passedBody: "Your team trusts you to run work without being watched. Back to the Associate year, and the VP promotion is still live.",
    passedCta: "Back to work",
    terminatedSetup: "Cobalt Capital is ending your contract. Your supervisor walks you out. This is what being let go looks like.",
    terminatedBody: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
    terminatedRestartCta: "Play this year again",
    terminatedLeaveCta: "Back to Games",
  },
};

/** Runtime state for an in-progress plan, held by SimulationPlayer. Created
 *  the instant the third strike lands and cleared on pass or termination. */
export type PipState = {
  /** The beat that produced the third strike -- captured once, at trigger
   *  time, since strikes keep counting toward nothing after this beat. */
  triggerLine: string;
  /** The index normal play resumes at after a pass: the beat AFTER the one
   *  that triggered the plan, per the handoff. */
  resumeIndex: number;
  /** One random left/right order per step, rolled once at trigger time
   *  (inside the setTimeout callback in resolve(), not during render --
   *  React's render pass must stay pure, so Math.random can't live inside
   *  PerformancePlanFlow itself). "MUST RANDOMISE POSITION. In the build
   *  the right answer was A all three times." */
  stepOrders: [("correct" | "incorrect")[], ("correct" | "incorrect")[], ("correct" | "incorrect")[]];
};

export function randomStepOrders(): PipState["stepOrders"] {
  const roll = (): ("correct" | "incorrect")[] => (Math.random() < 0.5 ? ["correct", "incorrect"] : ["incorrect", "correct"]);
  return [roll(), roll(), roll()];
}
