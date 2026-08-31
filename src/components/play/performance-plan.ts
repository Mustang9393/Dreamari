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

// Keyed by SIMULATION id, then level -- every career carries its own
// supervisor voice and step options, but the three plan questions never
// change across careers (Performance Plan tab).
export const PERFORMANCE_PLANS: Record<string, Record<1 | 2 | 3, PerformancePlan>> = {
  "investment-banking": {
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
  },
  "registered-nurse": {
    1: {
      warningSetup: "You have made three mistakes this year. Riverbend is putting you on a performance plan. Get 2 of 3 right to keep your job.",
      warningQuestion: "What is a performance plan? It is an official warning from your manager. Miss what is in it and you can be let go.",
      warningCta: "Begin Recovery",
      steps: [
        {
          setup: 'Denise names the most recent one. "Three times this year. The last was when {PLAN_LINE}." How is your work supposed to be checked?',
          correct: "Ask Rosa to check me once every shift",
          incorrect: "Promise to be more careful",
          whyCorrect: "Right. You asked for a check, and a check is something somebody else can see happening.",
          whyIncorrect: "Careful is not a method. Nothing about tomorrow is actually different.",
          skillPrimary: "Self-Reflection & Improvement",
          skillSecondary: "Active Learning",
        },
        {
          setup: "Silence. She waits. Why did nobody hear about it until it was too late?",
          correct: "I did not want to look like I could not cope",
          incorrect: "Nobody asked me about it",
          whyCorrect: "Right. Saying it out loud is the job. It is not an admission of anything.",
          whyIncorrect: "On this floor you are expected to say it, not wait to be asked.",
          skillPrimary: "Social Awareness",
          skillSecondary: "Verbal Communication",
        },
        {
          setup: "Last one. Name one thing you changed, and show me.",
          correct: "I write every change on the board before I leave",
          incorrect: "I feel much more confident now",
          whyCorrect: "Right. Specific, and somebody else can walk over and look at it.",
          whyIncorrect: "Feelings are not evidence. Denise cannot check how you feel.",
          skillPrimary: "Self-Reflection & Improvement",
          skillSecondary: "Written Communication",
        },
      ],
      passedSetup: "You made it out.",
      passedBody: "Rosa trusts you to say something the moment it changes. Back to the floor, and working on your own is still on the table.",
      passedCta: "Back to work",
      terminatedSetup: "Riverbend is ending your job here. Denise walks you out. This is what being let go looks like.",
      terminatedBody: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
      terminatedRestartCta: "Play this year again",
      terminatedLeaveCta: "Back to Games",
    },
    2: {
      warningSetup: "You have made three mistakes this year. Riverbend is putting you on a performance plan. Get 2 of 3 right to keep your job.",
      warningQuestion: "What is a performance plan? It is an official warning from your manager. Miss what is in it and you can be let go.",
      warningCta: "Begin Recovery",
      steps: [
        {
          setup: 'Denise names the most recent one. "Three times this year. The last was when {PLAN_LINE}." How is your work supposed to be checked?',
          correct: "Show her my own checks at the end of each shift",
          incorrect: "Ask Rosa to double check everything again",
          whyCorrect: "Right. A Staff Nurse owns the check. You do it and you show it.",
          whyIncorrect: "Going back to being checked is going backwards. You are past that rung.",
          skillPrimary: "Self-Reflection & Improvement",
          skillSecondary: "Active Learning",
        },
        {
          setup: "Silence. She waits. Why did nobody hear about it until it was too late?",
          correct: "I thought I could fix it before anyone noticed",
          incorrect: "It did not seem big enough to mention",
          whyCorrect: "Right. Fixing it quietly is why nobody could help while it was still small.",
          whyIncorrect: "You do not get to decide alone what is big enough. That is what report is for.",
          skillPrimary: "Social Awareness",
          skillSecondary: "Verbal Communication",
        },
        {
          setup: "Last one. Name one thing you changed, and show me.",
          correct: "I hand over three specific things at every report",
          incorrect: "I am paying much more attention now",
          whyCorrect: "Right. Countable, repeatable, and the night nurse can confirm it.",
          whyIncorrect: "More attention is not a change anyone else can see.",
          skillPrimary: "Self-Reflection & Improvement",
          skillSecondary: "Written Communication",
        },
      ],
      passedSetup: "You made it out.",
      passedBody: "Your team trusts you to run your own patients again. Back to the floor, and the step up is still live.",
      passedCta: "Back to work",
      terminatedSetup: "Riverbend is ending your job here. Denise walks you out. This is what being let go looks like.",
      terminatedBody: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
      terminatedRestartCta: "Play this year again",
      terminatedLeaveCta: "Back to Games",
    },
    3: {
      warningSetup: "You have made three mistakes this year. Riverbend is putting you on a performance plan. Get 2 of 3 right to keep your job.",
      warningQuestion: "What is a performance plan? It is an official warning from your manager. Miss what is in it and you can be let go.",
      warningCta: "Begin Recovery",
      steps: [
        {
          setup: 'Yvonne names the most recent one. "Three times this year. The last was when {PLAN_LINE}." How is your work supposed to be checked?',
          correct: "Set what good looks like before the shift starts",
          incorrect: "Watch my team more closely all shift",
          whyCorrect: "Right. Once you lead people, checking means agreeing the standard up front.",
          whyIncorrect: "Watching harder is not a standard. Nobody knows what you are watching for.",
          skillPrimary: "Self-Reflection & Improvement",
          skillSecondary: "Active Learning",
        },
        {
          setup: "Silence. She waits. Why did nobody hear about it until it was too late?",
          correct: "I did not want to escalate over my own team",
          incorrect: "My team should have told me sooner",
          whyCorrect: "Right. Loyalty that keeps a problem in the room is not loyalty.",
          whyIncorrect: "Naming your team answers a question nobody asked. You are answerable for them.",
          skillPrimary: "Social Awareness",
          skillSecondary: "Verbal Communication",
        },
        {
          setup: "Last one. Name one thing you changed, and show me.",
          correct: "Two nurses now sign the same check, and here it is",
          incorrect: "The floor runs much better since then",
          whyCorrect: "Right. Once you lead people, your evidence is what they do, not how you feel.",
          whyIncorrect: "Better is not a measurement. Point at something Yvonne can read.",
          skillPrimary: "Self-Reflection & Improvement",
          skillSecondary: "Written Communication",
        },
      ],
      passedSetup: "You made it out.",
      passedBody: "Your floor trusts you to run a shift without being watched. Back to work, and Nurse Manager is still live.",
      passedCta: "Back to work",
      terminatedSetup: "Riverbend is ending your job here. Denise walks you out. This is what being let go looks like.",
      terminatedBody: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
      terminatedRestartCta: "Play this year again",
      terminatedLeaveCta: "Back to Games",
    },
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
