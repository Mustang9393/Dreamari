"use client";

// DEMO-ONLY: v3 = the team's counter-proposal (Slack, 24 Sept 2026): keep the
// three-stage flow and fix what the survey actually named.
// BUILD ADD-ON (3 interests, one sub-interest follow-up per world) ->
// MATCH (a coherent six with reason chips and "Show me six more"; picking up
// to 3 IS the Top 3) -> MY PROFILE (same lab Top 3 screen as v2).
// Placeholder until the full build lands; the shell and chip are live so
// the two flows can be switched between from day one.

import { StepHeader, CARD } from "./shared";

export function V3Flow() {
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <StepHeader steps={["Build", "Match", "My Profile"]} current={0} title="v3 is on its way" helper="Build add-on (3 interests, one follow-up per world), then a coherent six with a reason on every card and a Show me six more row, then the same Top 3 screen as v2. Landing Friday." />
      <div className="rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-6)]" style={CARD}>
        <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Switch to v2 with the chip below to play Joshua{"'"}s flow end to end.</p>
      </div>
    </div>
  );
}
