"use client";

// DEMO-ONLY: Career Detail v2 (20 Oct 2026). Chandu: "put the new career
// detail under a v2 toggle. Revert the default view to how it was before."
// v1 (the default) is the page as it was on the morning of 20 Oct (commit
// 87c005e9): Pay tab, the three-row pay popover, the dot-list Education tab.
// v2 is the day's redesign (actions-lab/CareerDetailLabV2.tsx): Pay &
// Outlook, the What it pays sheet, the aligned fact strip, the degree sheet
// in the same frame, the Education tab's "See N colleges" buttons and the
// Outlook chart drawn as a line of light.
// On with ?cd=v2, off with ?cd=v1, or the small switch at the foot of the
// page; remembered in localStorage. Production: once one is chosen, keep
// it, delete the other and this file.
import { useSyncExternalStore } from "react";

const KEY = "dreamari-career-detail";
const EVENT = "dreamari-career-detail-change";

// ?cd= is applied once and then taken out of the address, so the switch
// still works on a page that arrived with it (it used to re-apply on every
// read, pinning the page to whatever the URL said).
function applyParam() {
  const url = new URL(window.location.href);
  const param = url.searchParams.get("cd");
  if (param !== "v1" && param !== "v2") return;
  if (param === "v2") window.localStorage.setItem(KEY, "v2");
  else window.localStorage.removeItem(KEY);
  url.searchParams.delete("cd");
  window.history.replaceState(window.history.state, "", url);
}

function read(): boolean {
  try {
    applyParam();
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

export function useCareerDetailV2(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

export function setCareerDetailV2(on: boolean) {
  try {
    if (on) window.localStorage.setItem(KEY, "v2");
    else window.localStorage.removeItem(KEY);
  } catch {
    // private browsing: nothing to remember
  }
  window.dispatchEvent(new Event(EVENT));
}
