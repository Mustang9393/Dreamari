"use client";

// DistrictOverview: which of our 11 schools are behind, and by how much?
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 3.1 (District Overview).
//
// Deliberate deviations from the Replit, with the WHY:
// - The six KPI cards are drill tiles, not (i) tooltips. The tooltip's
//   definition is the drill's lead; the drill also lists every school's value
//   for that measure, highest first. A superintendent asking "which schools
//   are behind" gets the answer instead of a definition.
// - Hero = Planning milestones. It is the measure each school's status
//   follows, so it is the number the status card and the list below hang on.
//   It is the screen's only glow.
// - The "Outcome measures" ranked-bar card is cut: it repeats the five KPI
//   numbers. Its one unique line ("percentages are weighted by enrollment,
//   not averaged school scores") sits under the KPI row.
// - Decorative sparklines and the icon chips are dropped (static art, not
//   data). The Replit's TREND is the planning change since launch; it stays
//   as a labelled number.
// - Status pills are neutral chips with a green / blue / amber dot (was
//   purple / blue / orange): blue plus status colours only.
// - The status card opens a drill listing every school lowest first; the
//   Replit's card was not clickable.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "../../../surfaces";
import { OverviewCard, SeeLink, Verdict } from "../../overviewShared";
import { DrillPanel, DrillTile, type Drill } from "../../Drill";
import {
  DISTRICT_KPIS,
  DISTRICT_OUTCOME_MEASURES,
  DISTRICT_STATUS_CARD,
  DISTRICT_TOP_FIVE,
  SCHOOLS,
  SCHOOL_STATUS_LABELS,
  statusCounts,
  type DistrictKpi,
} from "@/lib/leaderData";
import { Bar, EYEBROW, ROWS, SchoolCell, SchoolRow, StatusChip, StatusDot, STATUS_COLOR, TableHead, kpiDrill, pts, useOpenSchool } from "./districtKit";

const HERO_ID = "planning";

/** One KPI card. The whole surface opens its drill. */
function KpiCard({ kpi, onOpen }: { kpi: DistrictKpi; onOpen: () => void }) {
  const hero = kpi.id === HERO_ID;
  const isCapacity = kpi.id === "capacity";
  const surface = hero ? { ...GLASS_CARD_HERO, borderColor: "color-mix(in srgb, var(--primary) 38%, var(--glass-border))" } : GLASS_CARD;
  return (
    <HoverBeam strength={hero ? 0.7 : 0.6} className="h-full">
      <DrillTile onOpen={onOpen} label={kpi.label} className="v4-surface h-full gap-[10px] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        {hero && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.26) }} />}
        <span className="relative text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{kpi.label}</span>
        <span className="relative text-[34px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{kpi.displayValue}</span>
        <span className="relative text-[12.5px] font-bold" style={{ color: "var(--primary)" }}>
          {isCapacity ? "+19% relative vs launch" : `${pts(kpi.delta)} vs launch`}
        </span>
        <span className="relative mt-auto flex flex-col gap-[6px] pt-[4px]">
          {/* The tick marks the launch baseline: the gap to the fill is the gain. */}
          {!isCapacity && <Bar value={kpi.value} reference={kpi.baseline} />}
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {isCapacity ? "0% relative at launch, not percentage points" : `Launch baseline ${kpi.baseline}%`}
          </span>
        </span>
      </DrillTile>
    </HoverBeam>
  );
}

export function DistrictOverview() {
  const router = useRouter();
  const open = useOpenSchool();
  const [drill, setDrill] = useState<Drill | null>(null);
  const goPerformance = () => { setDrill(null); router.push("/counselor?view=school-performance"); };

  const counts = useMemo(() => statusCounts(), []);

  // Status card drill: every school, lowest planning completion first (status follows it).
  const statusDrill = (): Drill => ({
    title: DISTRICT_STATUS_CARD.title,
    subtitle: `${SCHOOLS.length} schools · ${counts.above} above · ${counts.meeting} meeting · ${counts.support} need support`,
    lead: "A school's status follows its planning milestone completion. Every school is listed below, lowest first, with its status.",
    rowsLabel: "Planning milestones by school, lowest first",
    rows: [...SCHOOLS].sort((a, b) => a.planning.value - b.planning.value).map((s) => ({ label: `${s.name} · ${SCHOOL_STATUS_LABELS[s.status].filter}`, value: `${s.planning.value}%`, pct: s.planning.value })),
    action: { label: "Compare in School performance", onClick: goPerformance },
  });

  const behind = counts.support;
  const how = DISTRICT_OUTCOME_MEASURES.note;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <section aria-label="District measures" className="flex flex-col gap-[var(--space-3)]">
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-3">
          {DISTRICT_KPIS.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} onOpen={() => setDrill(kpiDrill(kpi, goPerformance))} />
          ))}
        </div>
        <p className="text-[12px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className={EYEBROW}>{how.title}</span> · {how.body} Open a card to see every school.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-3">
          <HoverBeam strength={0.6} className="h-full">
            <DrillTile onOpen={() => setDrill(statusDrill())} label={DISTRICT_STATUS_CARD.title} className="v4-surface h-full gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
              <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{DISTRICT_STATUS_CARD.title}</span>
              <Verdict band={behind > 0 ? "near" : "met"}>
                {behind > 0 ? `${behind} of ${SCHOOLS.length} schools need support` : `All ${SCHOOLS.length} schools meet or beat target`}
              </Verdict>
              {/* The whole district in one bar: 3 / 5 / 3 of 11. */}
              <span aria-hidden className="flex h-[10px] w-full gap-[3px]">
                {DISTRICT_STATUS_CARD.pills.map((p) => (
                  <span key={p.status} className="h-full rounded-full" style={{ flex: counts[p.status], background: `linear-gradient(90deg, color-mix(in srgb, ${STATUS_COLOR[p.status]} 45%, transparent), ${STATUS_COLOR[p.status]})` }} />
                ))}
              </span>
              <span className="flex flex-1 flex-col justify-between gap-[14px]">
                {DISTRICT_STATUS_CARD.pills.map((p) => (
                  <span key={p.status} className="flex flex-col gap-[6px]">
                    <span className="flex items-center justify-between gap-[10px]">
                      <span className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                        <StatusDot color={STATUS_COLOR[p.status]} />{p.label}
                      </span>
                      <span className="text-[20px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{counts[p.status]}</span>
                    </span>
                    <Bar value={(counts[p.status] / SCHOOLS.length) * 100} color={STATUS_COLOR[p.status]} />
                    {/* Who is in the group: fills the card with the answer, not padding. */}
                    <span className="text-[12px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                      {SCHOOLS.filter((s) => s.status === p.status).map((s) => s.name.replace(/ (Academy|High School|Preparatory)$/, "")).join(" · ")}
                    </span>
                  </span>
                ))}
              </span>
              <span className="mt-auto text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Open to see every school, lowest first.</span>
            </DrillTile>
          </HoverBeam>
        </div>

        <div className="xl:col-span-9">
          <OverviewCard title={DISTRICT_TOP_FIVE.title} aside={<SeeLink onClick={() => router.push("/counselor?view=school-performance")}>All schools</SeeLink>}>
            <div className="flex flex-col">
              <TableHead
                template="md:grid-cols-[minmax(0,1fr)_132px_112px_72px_92px]"
                labels={[{ label: "School" }, { label: "Status" }, { label: "Career exploration" }, { label: "Planning" }, { label: "Trend", align: "right" }]}
              />
              <div className={ROWS}>
                {DISTRICT_TOP_FIVE.rows.map((r) => (
                  <SchoolRow key={r.school.id} school={r.school} onOpen={open}>
                    {/* Desktop: a table row. */}
                    <span className="hidden items-center gap-[12px] md:grid md:grid-cols-[minmax(0,1fr)_132px_112px_72px_92px]">
                      <SchoolCell school={r.school} />
                      <StatusChip status={r.school.status} />
                      <span className="flex flex-col gap-[5px]">
                        <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.career.value}%</span>
                        <Bar value={r.career.value} reference={r.career.baselineRounded} />
                      </span>
                      <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.planning.value}%</span>
                      <span role="img" aria-label={r.trendAriaLabel} className="text-right text-[12.5px] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{r.trendLabel}</span>
                    </span>
                    {/* Phone: name, status, then the measures in one line. */}
                    <span className="flex flex-col gap-[6px] md:hidden">
                      <SchoolCell school={r.school} />
                      <StatusChip status={r.school.status} />
                      <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                        Career {r.career.value}% · Planning {r.planning.value}% · <span style={{ color: "var(--primary)" }}>{r.trendLabel}</span>
                      </span>
                    </span>
                  </SchoolRow>
                ))}
              </div>
            </div>
            <div className="mt-auto"><Note /></div>
          </OverviewCard>
        </div>
      </div>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}

// The list is ranked by career exploration; trend is the planning change
// since launch (that is what the Replit's TREND column holds).
function Note() {
  return (
    <p className="text-[12px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
      Ranked by career exploration. The tick marks each school&apos;s launch baseline. Trend is the planning milestone change since launch.
    </p>
  );
}
