import type { PerformancePlan } from "./performance-plan";

// AI-authored recovery draft; UX-specific checks avoid the IB fallback.
export const UX_PERFORMANCE_PLAN: PerformancePlan = {
  warningSetup: "Samira has seen three mistakes on this project. Follow a recovery plan. Get 2 of 3 right to continue.",
  warningQuestion: "A recovery plan names what must improve and how the team will check it.",
  warningCta: "Begin Recovery",
  steps: [
    { setup: 'Samira says, "The last problem was when {PLAN_LINE}. How will you check the next handover?"', correct: "Explain your checks and agree what evidence Samira needs", incorrect: "Promise the next design will look more impressive", whyCorrect: "An agreed check makes improvement visible to you and the team.", whyIncorrect: "A better-looking design may still leave the task blocked.", skillPrimary: "Self-Reflection & Improvement", skillSecondary: "Active Learning" },
    { setup: "You guessed what a research note meant. The team worked on the wrong problem. What do you say?", correct: "Name the uncertainty and agree when to ask for help", incorrect: "Say the note was confusing and leave it there", whyCorrect: "Sharing uncertainty lets the team check it before it becomes a decision.", whyIncorrect: "Naming confusion does not show how you will handle it next time.", skillPrimary: "Verbal Communication", skillSecondary: "Teamwork & Collaboration" },
    { setup: "Samira asks what changed after the plan. What do you bring?", correct: "One changed habit with notes and a test that shows it", incorrect: "A statement that you have been trying harder", whyCorrect: "Specific work lets the team check whether the habit improved.", whyIncorrect: "Effort matters, but the team also needs evidence of the change.", skillPrimary: "Self-Reflection & Improvement", skillSecondary: "Written Communication" },
  ],
  passedSetup: "You can continue the project.", passedBody: "Samira agrees your checks and communication have improved. Keep using them.", passedCta: "Back to the project",
  terminatedSetup: "This project attempt has ended.", terminatedBody: "Review the evidence and try again. One attempt does not define your future.", terminatedRestartCta: "Try the project again", terminatedLeaveCta: "Back to Games",
};
