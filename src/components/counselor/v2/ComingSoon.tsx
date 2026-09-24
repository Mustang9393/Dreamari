"use client";

// DEMO-ONLY v2 placeholder for the role-shell screens that do not have
// their own pass yet (Counselors, Readiness, Reports, Schools, School
// Impact; see ../roles.ts). Playbook tier 1 + tier 6
// (docs/COMPONENT_STATES_PLAYBOOK.md): a whole destination with nothing
// built yet gets a bordered card, a bold heading, a muted line naming what
// is coming and one CTA back to a screen that works. Honest by design: the
// menu item is real, the screen is not, and the copy says so instead of
// showing an empty grid. Replaced screen by screen as each pass lands.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GLASS_CARD } from "../surfaces";
import { VIEW_TITLES, type CounselorView } from "../shell";

export function ComingSoon({ view }: { view: CounselorView }) {
  const { title, subtitle } = VIEW_TITLES[view];
  return (
    <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={GLASS_CARD}>
      <span className="rounded-full border px-[10px] py-[3px] text-[11px] font-bold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Coming soon</span>
      <h2 className="text-[17px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title} is not built yet</h2>
      <p className="max-w-[46ch] text-[13.5px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{subtitle}. This screen is next in the role-based build; the menu shows it now so the full shell can be reviewed.</p>
      <Link href="/counselor?view=overview" className="dm-quiet mt-[var(--space-2)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
        <ArrowLeft className="h-[14px] w-[14px]" aria-hidden /> Back to Overview
      </Link>
    </div>
  );
}
