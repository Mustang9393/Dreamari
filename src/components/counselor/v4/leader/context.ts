"use client";

// Which school the School Leader view is showing, and whether the leader
// arrived there from the District view (2 Oct 2026).
//
// The Replit: clicking a school anywhere in the District view switches the
// app into that school's School Leader view, and it remembers the school
// (a later switch to School Leader shows it again; Northbridge Academy is
// the default). It offers no way back except the Demo View select
// (NOTES.md 1.1, 6). Kept: the drill and the memory. Added: a "Back to
// Metro Heights" path, because a district leader who opens one school
// expects to return to the comparison they came from.
//
// DEMO-ONLY: localStorage stands in for the signed-in leader's real scope.

import { useSyncExternalStore } from "react";
import { writeCounselorAccount } from "@/lib/counselorAccount";

const SCHOOL_KEY = "dreamari:counselor-leader-school";
const FROM_KEY = "dreamari:counselor-leader-from-district";
const DEFAULT_SCHOOL = "northbridge-academy";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // no storage: the choice lasts for this page only
  }
  emit();
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** The school the School Leader view shows (Northbridge Academy by default). */
export function useLeaderSchoolId(): string {
  return useSyncExternalStore(subscribe, () => read(SCHOOL_KEY) ?? DEFAULT_SCHOOL, () => DEFAULT_SCHOOL);
}
/** True when the School Leader view was opened from the District view. */
export function useFromDistrict(): boolean {
  return useSyncExternalStore(subscribe, () => read(FROM_KEY) === "1", () => false);
}

type Push = (href: string) => void;

/** District -> one school: switch to the School Leader view for it. */
export function openSchoolFromDistrict(push: Push, schoolId: string, view: "overview" | "team" = "overview") {
  write(SCHOOL_KEY, schoolId);
  write(FROM_KEY, "1");
  writeCounselorAccount({ role: "School Leader" });
  push(`/counselor?view=${view}&v=4`);
}

/** The way back the Replit lacks. */
export function backToDistrict(push: Push) {
  write(FROM_KEY, null);
  writeCounselorAccount({ role: "District Leader" });
  push("/counselor?view=school-performance&v=4");
}
