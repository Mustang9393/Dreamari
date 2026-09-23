"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ChevronRight } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GRADE_READINESS, type MilestoneCard } from "@/lib/milestoneReadiness";
import { useCounselorFilters } from "./shell";

import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "./surfaces";

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

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-center gap-[6px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
      <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: color }} />
      {label}
      <b className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>{value}</b>
    </span>
  );
}

// `hero` spends the same one saturated, glowing surface Overview
// established -- the four cards used to be visually identical regardless
// of standing, which read as "passes distinguishability but not design
// checks" (direct feedback). The single worst-completing milestone for
// this grade gets the hero treatment (bigger ring, a glow tinted to its
// own severity -- green/amber/red on the same 80%/60% thresholds Overview
// uses for its own hero card), everything else recedes to the plain
// glass. Same rule as Overview, this screen's own data deciding the tint.
function MilestoneCardView({ card, hero, tint, onViewDetails }: { card: MilestoneCard; hero?: boolean; tint: string; onViewDetails: () => void }) {
  const stats: { label: string; value: number; color: string }[] = [
    { label: "Completed", value: card.completed, color: STATUS_COLORS.completed },
    { label: "In Progress", value: card.inProgress, color: STATUS_COLORS.inProgress },
    { label: "Needs Attention", value: card.needsAttention, color: STATUS_COLORS.needsAttention },
    { label: "Not Started", value: card.notStarted, color: STATUS_COLORS.notStarted },
  ];
  if (card.notApplicable) stats.push({ label: "Not Applicable", value: card.notApplicable, color: STATUS_COLORS.notApplicable });
  const surface = hero ? { ...GLASS_CARD_HERO, borderColor: `color-mix(in srgb, ${tint} 38%, var(--glass-border))` } : GLASS_CARD;

  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        {/* Every card's glow is tinted to ITS OWN completion severity, not
           just the hero's -- a quiet sidekick still under 60% was showing
           the same default green glow as a genuinely healthy one. */}
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(tint, hero ? 0.3 : 0.12) }} />
        <div className="relative flex flex-col gap-[2px]">
          <span className="flex items-center gap-[8px]">
            <Info aria-hidden className="h-[14px] w-[14px] flex-none" style={{ color: "var(--muted-foreground)" }} />
            <h3 className="text-[14.5px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{card.name}</h3>
          </span>
          <span className="pl-[22px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{card.subtitle}</span>
          {card.reviewNote && <span className="pl-[22px] text-[11.5px]" style={{ color: "var(--muted-foreground)", opacity: 0.75 }}>{card.reviewNote}</span>}
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-[6px] py-[var(--space-2)]">
          <SegmentedRing
            segments={stats.filter((s) => s.value > 0).map((s) => ({ value: s.value, color: s.color }))}
            size={hero ? 152 : 100}
            stroke={hero ? 17 : 11}
          >
            <span className="flex flex-col items-center">
              <span className={`${hero ? "text-[32px]" : "text-[24px]"} leading-[1] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{card.pct}%</span>
              <span className="text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>completed</span>
            </span>
          </SegmentedRing>
          <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{card.completed} of {card.total}</span>
          {/* Spells out exactly what the card's own glow/border color means
             instead of asking the reader to infer it (direct feedback:
             "I dont understand whats deciding the card glow" -- the ring's
             own biggest wedge is almost always green/Completed, so a
             red-tinted card can look like it's contradicting its own
             ring unless something states plainly that the tint tracks
             stuck students specifically, not overall completion). */}
          {card.needsAttention + card.notStarted > 0 ? (
            <span className="text-[11px] font-bold" style={{ color: tint }}>{card.needsAttention + card.notStarted} of {card.total} need attention or haven&rsquo;t started</span>
          ) : (
            <span className="text-[11px] font-semibold" style={{ color: STATUS_COLORS.completed }}>Nobody stuck -- just finishing up</span>
          )}
        </div>

        <div className="relative grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[10px]">
          {stats.map((s) => <StatRow key={s.label} {...s} />)}
        </div>

        {/* Used to render with no onClick at all (flagged in the original
           audit as one of 8 dead controls). This dashboard's milestone
           taxonomy (completed/inProgress/needsAttention/...) and the
           roster's own (MILESTONE_KEYS/MilestoneStatus) were never
           reconciled into one shared vocabulary -- see
           docs/COUNSELOR_DASHBOARD_REFERENCE_DEVIATIONS.md -- so this
           can't filter Students by "this exact milestone card" yet. What
           it CAN do correctly today: jump to the same grade's roster,
           which is a real, useful "show me who" instead of nothing.
           Upgraded from a bare text link to a real pill button with a
           chevron -- same affordance language as "See all" on Overview. */}
        <button
          type="button"
          onClick={onViewDetails}
          className="dm-quiet relative mt-auto flex w-fit cursor-pointer items-center gap-[4px] rounded-full border px-[12px] py-[6px] text-left text-[12.5px] font-bold"
          style={{ color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 30%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
        >
          View Details & Student Breakdown
          <ChevronRight className="h-[13px] w-[13px]" aria-hidden />
        </button>
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
        return (
          <div className="flex flex-col gap-[var(--space-4)]">
            <MilestoneCardView card={heroCard} hero tint={tintFor(heroCard)} onViewDetails={goToGradeRoster} />
            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
              {rest.map((card) => <MilestoneCardView key={card.name} card={card} tint={tintFor(card)} onViewDetails={goToGradeRoster} />)}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
