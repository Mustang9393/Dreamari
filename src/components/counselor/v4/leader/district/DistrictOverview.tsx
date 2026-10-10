"use client";

// DistrictOverview (the District Leader's Today): which of our 11 schools
// are behind, and by how much? DEMO-ONLY data (2 Oct 2026, NOTES.md 3.1).
//
// v4 rebuild (6 Oct 2026). WHY: this was the v2 screen inside v4's frame:
// six boxed KPI cards with extrabold numbers and a glowing hero card, a
// "Schools by status" tile with chips, and an uppercase-headed table card.
// Direct instruction: make the leader roles "like this version" (the
// counselor's v4) "in every aspect, design, layout, structure everything...
// navigations, organisation, layouts, graphics, spacing, the premium look".
// It is now the counselor's Today, read for a district instead of a
// caseload, composed the same way as the School Leader's rebuilt Today:
//   - Welcome line with the key counts as links and one primary action
//     (Today's v4-welcome).
//   - The six district measures as Today's hairline signal strip, not six
//     cards. Each still opens its drill (definition, current / baseline /
//     change, and every school's value, highest first).
//   - "Every measure since launch" as Today's landscape sheet: planning
//     milestones (the measure each school's status follows, the old hero)
//     on the left with its launch and today lanes, the five outcome
//     measures on the right as lanes with the launch-baseline tick (what
//     the v2 cards' bars showed). Counselor capacity is a relative %, so it
//     is a line under the lanes, not a 0-100 lane that would misread.
//   - Top five by career exploration and Schools by status as Today's
//     sheet + review island pair. Every column of the v2 table (school,
//     city, students, status, career with its baseline tick, planning,
//     trend) and every status count, its schools and the "every school,
//     lowest first" drill are kept (Maisha's rule: never drop a data point
//     the Replit shows). The status groups' school names moved from the
//     face into one drill per group; the eleven schools are on the face as
//     eleven status-coloured squares that each open their school.
//   - "How to read this" is the closing data note.
//
// Maisha's v4 review (7 Oct 2026): "for the School Leader + District Leader
// views, we can follow this direction aesthetically so I can share during
// demos", the direction being "make the experience more exciting to
// receive... without losing the clean, professional, easy-to-process
// experience". Structure unchanged; added, one moment per region:
//   - Count-up on the signal strip and the hero numbers.
//   - The outcome lanes in ONE series colour ("so there isn't too much
//     competing for our attention") with the student app's SparkBar.
//   (A "Wins This Term" section was added here and removed the same day:
//   Chandu, 7 Oct 2026, "Remove ... anything like that you added to a screen
//   as a section or CONTENT/DATA wise that Maisha didn't ask for.")
//   - School status in the colours she asked for (above green, meeting
//     blue, support amber). Headers in Title Case.

//
// Glow pass (10 Oct 2026). WHY: Chandu asked for every graph to get the
// light material ("i want all graphs to get these material updates and
// more creative visions, not just the ones in engagement"), then ruled out
// bars ("I dont like bar graphs"), rings, grids and dense marks ("that
// whole grid idea is bad") and asked for charts "made of LIGHT". So on
// this screen: the measure lanes are points of light with a
// trail from launch, and the status island's eleven squares became a light
// strip plot (charts/ldViz StripPlot): one point per school on the planning
// scale, in its status colour, each still opening the school.
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, ArrowUpRight, School } from "lucide-react";
import { StripPlot } from "../../charts/ldViz";
import { DrillPanel, type Drill } from "../../Drill";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import {
  DISTRICT,
  DISTRICT_KPIS,
  DISTRICT_OUTCOME_MEASURES,
  DISTRICT_STATUS_CARD,
  DISTRICT_TOP_FIVE,
  SCHOOLS,
  SCHOOL_STATUS_LABELS,
  statusCounts,
  type SchoolStatus,
} from "@/lib/leaderData";
import { useChartColors } from "../../ChartColors";
import { CountUp, InlineLink, Lane, LeaderWelcome, SignalStrip, TextAction, series, titleCase, titled } from "../kit";
import { DistrictTrack, LaneLegend, SchoolName, SchoolStatusMark, STATUS_COLOR, kpiDrill, pts, useDistrictGo, useOpenSchool } from "./districtKit";

const subscribeDate = (notify: () => void) => { const t = window.setInterval(notify, 60000); return () => window.clearInterval(t); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());


const TOP_COLS = { "--dt-cols": "minmax(0,1fr) 118px 118px 62px 74px 14px" } as React.CSSProperties;

export function DistrictOverview() {
  const measureColors = useChartColors();
  const go = useDistrictGo();
  const open = useOpenSchool();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const date = useSyncExternalStore(subscribeDate, dateSnapshot, () => "Today");
  const [drill, setDrill] = useState<Drill | null>(null);
  const goPerformance = () => { setDrill(null); go("school-performance"); };

  const counts = useMemo(() => statusCounts(), []);
  const kpi = (id: string) => DISTRICT_KPIS.find((k) => k.id === id)!;
  const planning = kpi("planning");
  const capacity = kpi("capacity");
  const outcomes = DISTRICT_KPIS.filter((k) => k.id !== "capacity");
  const openKpi = (id: string) => setDrill(kpiDrill(kpi(id), goPerformance));
  const first = account.name ? account.name.split(" ")[0] : "";
  const byPlanning = useMemo(() => [...SCHOOLS].sort((a, b) => a.planning.value - b.planning.value), []);

  // Every school, lowest planning completion first (status follows it).
  const statusDrill = (): Drill => ({
    title: DISTRICT_STATUS_CARD.title,
    subtitle: `${SCHOOLS.length} schools · ${counts.above} above · ${counts.meeting} meeting · ${counts.support} need support`,
    lead: "A school's status follows its planning milestone completion. Every school is listed below, lowest first, with its status.",
    rowsLabel: "Planning milestones by school, lowest first",
    rows: byPlanning.map((s) => ({ label: `${s.name} · ${SCHOOL_STATUS_LABELS[s.status].filter}`, value: `${s.planning.value}%`, pct: s.planning.value })),
    action: { label: "Compare in School Performance", onClick: goPerformance },
  });
  // One status group: the schools the v2 card listed under it.
  const groupDrill = (status: SchoolStatus): Drill => {
    const label = DISTRICT_STATUS_CARD.pills.find((p) => p.status === status)!.label;
    const list = byPlanning.filter((s) => s.status === status);
    return {
      title: label,
      subtitle: `${counts[status]} of ${SCHOOLS.length} schools`,
      lead: "A school's status follows its planning milestone completion.",
      rowsLabel: "Planning milestones, lowest first",
      rows: list.map((s) => ({ label: s.name, value: `${s.planning.value}%`, pct: s.planning.value })),
      action: { label: "Compare in School Performance", onClick: goPerformance },
    };
  };

  const behind = counts.support;
  const how = DISTRICT_OUTCOME_MEASURES.note;

  return (
    <div className="v4-daily v4-leader-page v4-sections">
      <LeaderWelcome
        overline={date || "Today"}
        title={`Welcome back${first ? `, ${first}` : ""}`}
        sentence={<>
          <InlineLink onClick={() => openKpi("planning")}>{planning.displayValue} of students</InlineLink> across Metro Heights have completed their planning milestones, up {planning.delta} points since launch.{" "}
          {behind > 0
            ? <><InlineLink onClick={() => setDrill(groupDrill("support"))}>{behind} of {SCHOOLS.length} schools</InlineLink> need support.</>
            : <>All {SCHOOLS.length} schools meet or beat target.</>}
        </>}
        action={{ label: "Compare schools", onClick: () => go("school-performance") }}
      />

      <SignalStrip
        label="District measures"
        items={DISTRICT_KPIS.map((k) => ({
          label: k.label,
          value: k.id === "capacity" ? `+${k.value}%` : k.displayValue,
          small: k.id === "capacity" ? "relative, not points" : `${pts(k.delta)} since launch`,
          onClick: () => openKpi(k.id),
          aria: `${k.label}: ${k.displayValue}. Open every school`,
        }))}
      />

      <section className="v4-progress-landscape" {...measureColors.attrs}>
        <header className="v4-section-head">
          <div><h2>Every Measure Since Launch</h2></div>
          <span className="v4-section-tools">{measureColors.toggle}<TextAction onClick={() => go("school-performance")}>Compare schools</TextAction></span>
        </header>
        <div className="v4-landscape-grid">
          <div className="v4-caseload-map">
            <div className="v4-map-label"><strong><CountUp value={planning.value} /><span>%</span></strong><p>planning milestones<br />up {planning.delta} pts since launch</p></div>
            <div className="mt-[22px] flex flex-col">
              <Lane label="At launch" value={planning.baseline} display={`${planning.baseline}%`} color="var(--v4-chart-6)" />
              <Lane label="Today" value={planning.value} display={`${planning.value}%`} baseline={planning.baseline} onClick={() => openKpi("planning")} aria={`Planning milestones ${planning.value}%. Open every school`} />
            </div>
            <small>A school&apos;s status follows this measure</small>
          </div>
          <div>
            <div className="v4-lane-heading"><span>Outcome Measures</span><span>Share of District Students</span></div>
            <div className="v4-leader-lanes v4-district-measures">
              {outcomes.map((k, i) => (
                <Lane
                  key={k.id}
                  label={k.label}
                  color={series(i)}
                  value={k.value}
                  display={`${k.value}%`}
                  sub={`from ${k.baseline}%`}
                  baseline={k.baseline}
                  onClick={() => openKpi(k.id)}
                  aria={`${k.label}: ${k.value}%, launch baseline ${k.baseline}%, ${pts(k.delta)}. Open every school`}
                />
              ))}
              <div className="v4-district-measure-axis" aria-hidden><span /><div>{["0", "25", "50", "75", "100%"].map((t) => <span key={t}>{t}</span>)}</div></div>
            </div>
            <div className="v4-sheet-foot mt-[14px]" style={{ paddingBottom: 0 }}>
              <LaneLegend />
              <TextAction onClick={() => openKpi("capacity")} label={`${capacity.label}: +${capacity.value}% relative to launch, not percentage points. Open every school`}>{capacity.label} +{capacity.value}% relative</TextAction>
            </div>
          </div>
        </div>
      </section>

      <div className="v4-daily-grid">
        <section className="v4-focus-sheet flex flex-col">
          <header className="v4-section-head"><div><h2>{titleCase(DISTRICT_TOP_FIVE.title)}</h2></div><span className="v4-pill">5 of {SCHOOLS.length} schools</span></header>
          <div className="v4-district-table mt-[22px]" style={TOP_COLS} aria-label={DISTRICT_TOP_FIVE.title}>
            <div className="v4-district-thead" aria-hidden><span>School</span><span>Status</span><span>Career Exploration</span><span className="v4-district-r">Planning</span><span className="v4-district-r">Trend</span><span /></div>
            {DISTRICT_TOP_FIVE.rows.map((r, i) => (
              <button key={r.school.id} type="button" className="v4-district-row" onClick={() => open(r.school.id)} aria-label={`${r.openLabel}. ${r.statusLabel}. Career exploration ${r.career.value}%, launch baseline ${r.career.baselineRounded}%. Planning ${r.planning.value}%. ${r.trendAriaLabel}`}>
                <span className="flex min-w-0 items-start gap-[12px]"><span className="v4-list-index mt-[2px]">{String(i + 1).padStart(2, "0")}</span><SchoolName school={r.school} /></span>
                <span className="v4-district-cell"><SchoolStatusMark status={r.school.status} /></span>
                <span className="v4-district-cell v4-district-num"><strong>{r.career.value}%</strong><DistrictTrack value={r.career.value} baseline={r.career.baselineRounded} thin /></span>
                <span className="v4-district-cell v4-district-num is-right"><strong>{r.planning.value}%</strong></span>
                <span className="v4-district-cell v4-district-num is-right"><small style={{ color: "var(--foreground)", fontSize: 11 }}>{r.trendLabel}</small></span>
                <span className="v4-district-cell"><ArrowUpRight size={14} aria-hidden className="v4-district-go" /></span>
                <span className="v4-district-phone"><SchoolStatusMark status={r.school.status} /><span>Career <strong>{r.career.value}%</strong></span><span>Planning <strong>{r.planning.value}%</strong></span><span>Trend <strong>{r.trendLabel}</strong></span></span>
              </button>
            ))}
          </div>
          <div className="v4-sheet-foot mt-auto"><span>Ranked by career exploration · the hollow dot is each school&apos;s launch baseline · trend is the planning change since launch</span><TextAction onClick={() => go("school-performance")}>All schools</TextAction></div>
        </section>

        <section className="v4-review-island">
          <header className="v4-section-head"><span className="v4-overline">{titleCase(DISTRICT_STATUS_CARD.title)}</span><School size={22} aria-hidden /></header>
          <div className="v4-review-number"><strong><CountUp value={behind} /></strong><span>{behind === 1 ? "school needs" : "schools need"} support<br />{counts.above} above target · {counts.meeting} meeting</span></div>
          <div className="v4-district-strip">
            <StripPlot
              label="Every school by planning milestones, coloured by status. Select a school to open it"
              unit="%"
              min={Math.max(0, Math.floor((byPlanning[0]?.planning.value ?? 0) / 10) * 10 - 10)}
              max={Math.min(100, Math.ceil((byPlanning[byPlanning.length - 1]?.planning.value ?? 100) / 10) * 10 + 10)}
              points={byPlanning.map((s) => ({ id: s.id, value: s.planning.value, color: STATUS_COLOR[s.status], label: `${s.name} · ${SCHOOL_STATUS_LABELS[s.status].filter} · planning ${s.planning.value}%`, aria: `Open ${s.name}. ${SCHOOL_STATUS_LABELS[s.status].filter}, planning ${s.planning.value}%`, onClick: () => open(s.id) }))}
            />
          </div>
          <div className="v4-review-stack">
            {DISTRICT_STATUS_CARD.pills.map((p) => (
              <button key={p.status} type="button" onClick={() => setDrill(groupDrill(p.status))} aria-label={`${p.label}: ${counts[p.status]} schools. Open the list`}>
                <span className="v4-mini-document"><i aria-hidden className="block size-[9px] rounded-[3px]" style={{ background: STATUS_COLOR[p.status] }} /></span>
                <span>{p.label}</span>
                <b>{counts[p.status]}</b>
              </button>
            ))}
          </div>
          <button type="button" className="v4-island-action" onClick={() => setDrill(statusDrill())}>Every school, lowest first <ArrowRight size={18} aria-hidden /></button>
        </section>
      </div>

      <p className="v4-data-note">{DISTRICT.name} · {DISTRICT.metaLine} · synthetic data. {how.title}: {how.body} Open a measure to see every school.</p>
      <DrillPanel drill={titled(drill)} onClose={() => setDrill(null)} />
    </div>
  );
}
