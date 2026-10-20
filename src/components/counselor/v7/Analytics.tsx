"use client";

// Analytics is in the nav but not built: Joshua (Slack, 20 Oct 2026):
// "Analytics is not done yet, so please do not build that section yet."
// The playbook's "not available yet" state (docs/COMPONENT_STATES_PLAYBOOK.md):
// say what it will hold and point at what works today.

import { BarChart3 } from "lucide-react";
import { H2, MUTED, PageHead, TextLink, v7 } from "./ui";

export function V7Analytics() {
  return (
    <div className="flex flex-col gap-[var(--space-10)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Analytics" />
      <div className="flex max-w-[520px] flex-col items-start gap-[var(--space-4)]">
        <span className="flex size-12 items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><BarChart3 className="h-5 w-5" aria-hidden /></span>
        <h2 className={H2} style={{ fontFamily: "var(--font-display)" }}>Coming soon</h2>
        <p className="text-[15px] leading-[24px]" style={MUTED}>Your school&apos;s numbers will live here. For now, see who needs you on Students.</p>
        <TextLink href={v7("students")}>Open Students</TextLink>
      </div>
    </div>
  );
}
