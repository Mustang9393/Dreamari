"use client";

// Analytics > Team: the lead counselor's view (7 Oct 2026, gap 4 in
// docs/handoff/specs/counselor-app-ux.md: "which counselor needs support?").
// One row per counselor, caseload by last-name range: on track, need you,
// reviews waiting, handoffs in. Every row opens that caseload in Students.

import Image from "next/image";
import Link from "next/link";
import { cv } from "@/lib/counselorBase";
import { useMemo } from "react";
import { useHandoffs } from "@/lib/counselorHandoffs";
import { useCoverage } from "@/lib/counselorCoverage";
import { SCHOOL_COUNSELORS, counselorFor, readinessMetrics } from "@/lib/counselorOrg";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS } from "@/lib/counselorRoster";
import { DrawRing } from "./charts";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
// DEMO-ONLY: photos for the seeded counselors (adults; Daniel has none)
const PHOTO: Record<string, string> = { "Sarah Chen": "/images/connect/avatars/pro-tanaka.jpg", "Renee Alvarez": "/images/connect/avatars/pro-martinez.jpg" };

export function TeamView() {
  const roster = useReviewedRoster();
  const handoffs = useHandoffs();
  const coverage = useCoverage();
  const rows = useMemo(() => SCHOOL_COUNSELORS.map((c) => {
    const mine = roster.filter((s) => counselorFor(s).id === c.id);
    const m = readinessMetrics(mine);
    const pending = mine.reduce((n, s) => n + MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review").length, 0);
    const handIns = Object.values(handoffs).filter((h) => h.to === c.name).length;
    return { c, m, pending, handIns, needYou: m.students - m.onTrack };
  }).sort((a, b) => a.m.onTrackPct - b.m.onTrackPct), [roster, handoffs]);
  const max = Math.max(...rows.map((r) => r.m.students));

  return (
    <section aria-label="Team" className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
        <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Your Team</h2>
        <span className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Lowest on track first</span>
      </div>
      <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
        {rows.map(({ c, m, pending, handIns, needYou }) => (
          <li key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-[var(--space-5)] gap-y-[var(--space-3)] border-b py-[var(--space-5)] lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]" style={{ borderColor: RULE }}>
            <Link href={cv("students", `&counselor=${c.id}`)} className="dm-quiet dm-row col-span-2 flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] lg:col-span-1">
              {PHOTO[c.name]
                ? <Image src={PHOTO[c.name]} alt="" width={88} height={88} className="size-[44px] rounded-full object-cover" style={{ objectPosition: "50% 20%" }} />
                : <span className="flex size-[44px] items-center justify-center rounded-full text-[15px] font-semibold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent)" }}>{c.name.split(" ").map((p) => p[0]).join("")}</span>}
              <span className="flex flex-col">
                <span className="text-[16px] font-semibold">{c.name}</span>
                <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Students {c.range}{coverage?.name === c.name ? <span style={{ color: "var(--accent)" }}> · you&apos;re covering today</span> : ""}</span>
              </span>
            </Link>
            <span className="flex items-center gap-[var(--space-3)]">
              <DrawRing pct={m.onTrackPct} size={40} stroke={5} color={m.onTrackPct >= 80 ? "var(--color-feedback-success-solid)" : "var(--primary)"} />
              <Fig value={`${m.onTrackPct}%`} label="On track" />
            </span>
            <Fig value={String(m.students)} label="Caseload" bar={m.students / max} />
            <Fig value={String(needYou)} label="Need them" cls={needYou ? "v5-warn" : undefined} />
            <Fig value={String(pending)} label={handIns ? `Reviews · ${handIns} handed in` : "Reviews waiting"} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Fig({ value, label, cls, bar }: { value: string; label: string; cls?: string; bar?: number }) {
  return (
    <span className="flex min-w-0 flex-col gap-[4px]">
      <span className={`text-[22px] leading-[26px] font-semibold tabular-nums ${cls ?? ""}`} style={{ fontFamily: "var(--font-display)" }}>{value}</span>
      {typeof bar === "number" && <span className="block h-[4px] w-full max-w-[120px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}><span className="block h-full rounded-full" style={{ width: `${bar * 100}%`, background: "var(--primary)" }} /></span>}
      <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </span>
  );
}
