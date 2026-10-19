"use client";

// DEMO-ONLY: "Top 3 next step" v2 (19 Oct 2026). Chandu, after the About Me
// audit found Top 3 still a dead end ("I added to Top 3 but didn't know what
// to do next", 25 Sept survey): "lets do a v2 toggle so we can demonstrate how
// we can solve the top 3 dead end." Off by default. Turned on by ?top3=v2
// (?top3=v1 turns it off) or the Quick links menu's switch; remembered in
// localStorage. What it changes (Chandu's flow, 19 Oct 2026):
//   1. Top 3 cards: "Plan this" (makes it #1, opens My Plan) and Learn more.
//      Play moves off the cards into My Plan's steps.
//   2. My Plan keeps its seasons and In app / Out of app design; its In app
//      steps are written for the #1 career (profile/careerPlanSteps.ts) and
//      reach Play, glossaries, schools, Connect and Opportunities. The
//      counselor meeting waits until the Career Report is shared.
// Production: if approved, make these the only behaviour and delete this file.
import { useSyncExternalStore } from "react";

const KEY = "dreamari-top3-flow";
const EVENT = "dreamari-top3-flow-change";

function read(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get("top3");
    if (param === "v2") window.localStorage.setItem(KEY, "v2");
    if (param === "v1") window.localStorage.removeItem(KEY);
    return window.localStorage.getItem(KEY) === "v2";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useTop3FlowV2(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

export function setTop3FlowV2(on: boolean) {
  try {
    if (on) window.localStorage.setItem(KEY, "v2");
    else window.localStorage.removeItem(KEY);
  } catch {
    // private browsing: nothing to remember
  }
  window.dispatchEvent(new Event(EVENT));
}
