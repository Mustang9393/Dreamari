"use client";

// Students > Milestones (9 Oct 2026, Maisha's consolidation): the old
// Milestones and Student Progress tabs in one page, By Milestone | By
// Student. STUB: being built; renders the old tracker meanwhile.

import { MilestoneTracker } from "./MilestoneTracker";

export function Milestones({ initialMode }: { initialMode?: "milestone" | "student" } = {}) {
  void initialMode;
  return <MilestoneTracker />;
}
