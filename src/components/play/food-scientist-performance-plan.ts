import type { PerformancePlan } from "./performance-plan";

// AI-authored recovery draft; Food-science-specific checks avoid the IB fallback.
export const FS_PERFORMANCE_PLAN: PerformancePlan = {
  warningSetup: "Mei has seen three mistakes on this project. Follow a recovery plan. Get 2 of 3 right to continue.",
  warningQuestion: "A recovery plan names what must improve and how the team will check it.",
  warningCta: "Begin Recovery",
  steps: [
    { setup: 'Mei says, "The last problem was when {PLAN_LINE}. How will you check the next handover?"', correct: "Name the missing record, check it with Mei and document the next test", incorrect: "Promise the next batch will look more impressive", whyCorrect: "An agreed check makes improvement visible to you and the team.", whyIncorrect: "Good appearance does not repair missing evidence.", skillPrimary: "Self-Reflection & Improvement", skillSecondary: "Active Learning" },
    { setup: "You guessed a sample identity from its appearance. What do you say?", correct: "Name the uncertain identity, keep the sample held and ask Mei", incorrect: "Say the sample looked familiar and leave it there", whyCorrect: "Sharing uncertainty lets the team check it before it becomes a decision.", whyIncorrect: "Naming confusion does not show how you will handle it next time.", skillPrimary: "Verbal Communication", skillSecondary: "Teamwork & Collaboration" },
    { setup: "Mei asks what changed after the plan. What do you bring?", correct: "One changed habit with notes and a test that shows it", incorrect: "A statement that you have been trying harder", whyCorrect: "Specific work lets the team check whether the habit improved.", whyIncorrect: "Effort matters, but the team also needs evidence of the change.", skillPrimary: "Self-Reflection & Improvement", skillSecondary: "Written Communication" },
  ],
  passedSetup: "You can continue the project.", passedBody: "Mei agrees your checks and communication have improved. Keep using them.", passedCta: "Back to the project",
  terminatedSetup: "This project attempt has ended.", terminatedBody: "Review the sample records and try again. One attempt does not define your future.", terminatedRestartCta: "Try the project again", terminatedLeaveCta: "Back to Games",
};
