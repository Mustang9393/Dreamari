"use client";

// DEMO-ONLY v2 fork of ../MilestoneTracker.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GRADE_READINESS, type MilestoneCard } from "@/lib/milestoneReadiness";
import { StatRow } from "../chips";
import { useCounselorFilters } from "../shell";

import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";

// "needsAttention" was colored the same red as this dashboard's "At Risk"
// status everywhere else, while the label it actually renders is "Needs
// Attention" -- the phrase Overview and Students both reserve for amber,
// one tier below At Risk. Same words, different color across screens is
// exactly the inconsistency called out earlier this pass ("be uniform and
// consistent"); this taxonomy has no separate critical/at-risk bucket of
// its own, so amber is the correct match for the one word it does use.
// "critical" below is new -- a card-level severity tint, distinct from any
// one milestone's own status color (see heroTint in MilestoneTracker).
const STATUS_COLORS = {
  completed: "#33C78C",
  inProgress: "#5B6CF9",
  needsAttention: "#F5A623",
  // First lightened to a hand-picked #7A8296 (still only just past the
  // 3:1 floor), then asked directly: "should the grey be brighter/more
  // white?" Yes -- switched to this dashboard's own `--muted-foreground`
  // token (white at 62% opacity, ~#A6A7AE composited over this card's
  // surface, comfortably >3:1) instead of a bespoke hex: it's the exact
  // gray every other piece of secondary text on this whole dashboard
  // already uses, so "not started" now reads as the same neutral the eye
  // is already calibrated to, not a third, screen-local shade of gray.
  notStarted: "var(--muted-foreground)",
  notApplicable: "rgba(255,255,255,0.18)",
  critical: "#E0453C",
} as const;

// `hero` spends the same one saturated, glowing surface Overview
// established -- the four cards used to be visually identical regardless
// of standing, which read as "passes distinguishability but not design
// checks" (direct feedback). The single worst-completing milestone for
// this grade gets the hero treatment (bigger ring, a glow tinted to its
// own severity), everything else recedes to the plain glass.
//
// Composition follows Overview's DonutCard so the two screens read as one
// system: title anchored to the left edge, the ring centered as the
// card's one headline graphic, legend rows spanning the full width so every
// value lands in a single right-hand column, one control anchored left at
// the bottom. Each number is said once: the ring carries "% / n of total",
// the tinted verdict line carries the one fact the glow color encodes, the
// legend carries the per-state breakdown. The hero alone is allowed a
// second arrangement -- on a wide enough card (container query, so it
// works whether the hero spans the full row or two thirds of it) the same
// five parts spread into title+verdict+control | ring | legend, which is
// what a full-width card needs instead of one narrow centered column with
// dead space either side.
function MilestoneCardView({ card, hero, tint, onViewDetails, className = "" }: { card: MilestoneCard; hero?: boolean; tint: string; onViewDetails: () => void; className?: string }) {
  const stats: { label: string; value: number; color: string }[] = [
    { label: "Completed", value: card.completed, color: STATUS_COLORS.completed },
    { label: "In Progress", value: card.inProgress, color: STATUS_COLORS.inProgress },
    { label: "Needs Attention", value: card.needsAttention, color: STATUS_COLORS.needsAttention },
    { label: "Not Started", value: card.notStarted, color: STATUS_COLORS.notStarted },
  ];
  if (card.notApplicable) stats.push({ label: "Not Applicable", value: card.notApplicable, color: STATUS_COLORS.notApplicable });
  const stuck = card.needsAttention + card.notStarted;
  const dotColor = stuck > 0 ? tint : STATUS_COLORS.completed;
  // No severity tint on the card itself (direct feedback, 25 Sept 2026:
  // "Milestone tracker: don't tint cards"). The hero is the one glowing
  // surface, in the brand blue; the verdict's dot is where severity lives.
  const surface = hero ? GLASS_CARD_HERO : GLASS_CARD;
  const wide = hero
    ? "@[640px]:grid-cols-[minmax(0,1fr)_auto_minmax(220px,0.7fr)] @[640px]:grid-rows-[auto_1fr_auto] @[640px]:items-center @[640px]:gap-x-[var(--space-7)] @[640px]:[grid-template-areas:'head_ring_legend'_'verdict_ring_legend'_'cta_ring_legend']"
    : "";

  return (
    <HoverBeam strength={0.6} className={`h-full ${className}`}>
      <div className="@container relative h-full overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        {hero && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.26) }} />}
        <div className={`relative grid h-full grid-rows-[auto_1fr_auto_auto_auto] gap-[var(--space-4)] [grid-template-areas:'head'_'ring'_'verdict'_'legend'_'cta'] ${wide}`}>
          <div className={`flex flex-col gap-[3px] [grid-area:head] ${hero ? "@[640px]:self-start" : ""}`}>
            <h3 className="text-[14.5px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{card.name}</h3>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{card.subtitle}</span>
          </div>

          <div className="flex items-center justify-center self-center [grid-area:ring]">
            <SegmentedRing
              segments={stats.filter((s) => s.value > 0).map((s) => ({ value: s.value, color: s.color }))}
              size={hero ? 168 : 104}
              stroke={hero ? 18 : 12}
            >
              <span className="flex flex-col items-center gap-[2px]">
                <span className={`${hero ? "text-[34px]" : "text-[24px]"} leading-[1] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{card.pct}%</span>
                <span className="text-[10.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{card.completed} of {card.total}</span>
              </span>
            </SegmentedRing>
          </div>

          {/* States in words what the card's own glow color means, since
             the ring's biggest wedge is almost always green (direct
             feedback: "I dont understand whats deciding the card glow").
             This is the card's one verdict, so it's the only line under
             the ring -- the completed count now lives inside the ring. */}
          <span
            className={`flex items-center justify-center gap-[7px] text-center text-[12.5px] leading-[1.3] font-bold [grid-area:verdict] ${hero ? "@[640px]:justify-start @[640px]:text-left @[640px]:text-[14px]" : ""}`}
            style={{ color: "var(--foreground)" }}
          >
            <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
            {stuck > 0 ? `${stuck} of ${card.total} need attention or haven’t started` : "Nobody stuck, just finishing up"}
          </span>

          <div className="flex w-full flex-col gap-[4px] [grid-area:legend]">
            {stats.map((s) => <StatRow key={s.label} {...s} />)}
          </div>

          {/* Navigates to the same grade's roster (this dashboard's
             milestone taxonomy and the roster's were never reconciled, so
             it can't yet filter to this exact milestone -- see
             docs/COUNSELOR_DASHBOARD_REFERENCE_DEVIATIONS.md). The label
             says exactly that much and no more. Same pill affordance as
             "See all" on Overview. */}
          <button
            type="button"
            onClick={onViewDetails}
            className={`dm-quiet flex w-fit cursor-pointer items-center gap-[4px] justify-self-start rounded-full border px-[12px] py-[6px] text-left text-[12.5px] font-bold [grid-area:cta] ${hero ? "@[640px]:self-end" : ""}`}
            style={{ color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 30%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
          >
            See students
            <ChevronRight className="h-[13px] w-[13px]" aria-hidden />
          </button>
        </div>
      </div>
    </HoverBeam>
  );
}

export function MilestoneTracker() {
  const router = useRouter();
  const { gradeFilter, setGradeFilter } = useCounselorFilters();
  const [tab, setTab] = useState<9 | 10 | 11 | 12>(gradeFilter === "All Grades" ? 9 : gradeFilter);
  const grade = GRADE_READINESS[tab];
  const goToGradeRoster = () => {
    setGradeFilter(tab);
    router.push("/counselor?view=students");
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div role="tablist" aria-label="Grade level" className="flex w-fit gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        {([9, 10, 11, 12] as const).map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={tab === g}
            onClick={() => setTab(g)}
            className="dm-quiet flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold"
            style={{ background: tab === g ? "var(--primary)" : "transparent", color: tab === g ? "#FFFFFF" : "var(--muted-foreground)" }}
          >
            Grade {g}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <div className="flex max-w-[520px] flex-col gap-[4px]">
          <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>Grade {tab} students are required to complete {grade.cards.length} milestones</span>
          <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Focus: {grade.focus}</span>
        </div>
        <div className="flex items-center gap-[var(--space-6)]">
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{grade.students}</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>students</span>
          </span>
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{grade.cards.length}</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>milestones</span>
          </span>
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{grade.avgDone}%</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>avg. done</span>
          </span>
        </div>
      </div>

      {/* One hero, three sidekicks -- not four identical cards (direct
         feedback: "passes distinguishability checks but not design
         checks... everything needs to be re-designed").
         Picking the hero (and tinting every card's glow) by raw `pct`
         alone was wrong -- caught by direct feedback ("the colors dont
         actually match the dominant progress"): `pct` is just
         completed/total, so a card with 7 of 9 remaining students
         actively "In Progress" and ZERO "Needs Attention" scored lower
         than a card with real stuck students, because completion counts
         "still working on it" and "actually stuck" as the same gap.
         `stuckShare` below counts only needsAttention + notStarted --
         the two states that are actually a problem -- so the hero and
         every glow tint now track the same thing the ring's own amber/
         gray wedges are showing, not an unrelated completion threshold. */}
      {(() => {
        const stuckShare = (c: MilestoneCard) => (c.needsAttention + c.notStarted) / Math.max(1, c.total);
        const tintFor = (c: MilestoneCard) => {
          const s = stuckShare(c);
          return s >= 0.12 ? STATUS_COLORS.critical : s >= 0.05 ? STATUS_COLORS.needsAttention : STATUS_COLORS.completed;
        };
        const heroCard = grade.cards.reduce((worst, c) => (stuckShare(c) > stuckShare(worst) ? c : worst), grade.cards[0]);
        const rest = grade.cards.filter((c) => c !== heroCard);
        // Grade 10 has 8 milestones: a full-width hero plus 7 sidekicks in
        // three columns strands one card alone on the last row. When the
        // remainder would orphan, the hero gives up a column and the first
        // sidekick sits beside it -- every row full, the hero still the
        // biggest thing on the page.
        const shareRow = rest.length % 3 === 1;
        return (
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
            <MilestoneCardView card={heroCard} hero tint={tintFor(heroCard)} onViewDetails={goToGradeRoster} className={shareRow ? "sm:col-span-2" : "sm:col-span-3"} />
            {rest.map((card) => <MilestoneCardView key={card.name} card={card} tint={tintFor(card)} onViewDetails={goToGradeRoster} />)}
          </div>
        );
      })()}
    </div>
  );
}
