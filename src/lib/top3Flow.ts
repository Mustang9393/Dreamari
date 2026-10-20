"use client";

// My Profile v2 is the default (20 Oct 2026). It began as a DEMO-ONLY
// toggle (19 Oct, Chandu: "lets do a v2 toggle so we can demonstrate how we
// can solve the top 3 dead end"), off by default behind ?top3=v2 and a
// switch at the foot of My Profile. Then, 20 Oct: "lets push v2 of the my
// profile as the default without having the part about it leading to my
// plan. Just move top 3 into the career thing. Keep the start here etc. We
// wont do the my plan ctas, keep the ctas we have now, Play and report. And
// the next step should be to lead students to explore. Change the my plan
// to what it was before too."
//
// So what v2 means now, everywhere:
//   1. No Top 3 tab: the Top 3 cards live in About Me's Career Goal, and the
//      guided goals start there ("Start here"), then College Goal.
//   2. Top 3 cards: "Make my goal" until the goal is set, then the same
//      Show more, Play and Report as before. No "Plan this".
//   3. After both goals the next step is Explore, not My Plan.
//   4. My Plan keeps its original steps; the #1-career steps
//      (careerPlanSteps.ts) are parked, not deleted.
// The switch is gone, so this always answers true. Kept as a hook so the
// call sites read as "the v2 behaviour" rather than dead branches.
export function useTop3FlowV2(): boolean {
  return true;
}
