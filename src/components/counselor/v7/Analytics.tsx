"use client";

// v7 Analytics (22 Oct 2026): Joshua's Replit Analytics, 1:1 in function
// (Chandu: "lets make the v7 1:1 with the replit apart from the cosmetic
// upgrades and the design system upgrades"). Seven sub-tabs, the export
// toast, the remembered sub-tab, Prepare meeting from a Risk row, the
// demographics toggle. Every figure the Replit shows is here; the data file
// (analyticsData.ts) says which are roster reads and which are demo seeds.
//
// What changed from the Replit, and why:
// - No bars, no donut (Chandu: "I dont like bar graphs", "why is everything
//   a ring to you?"). The two charts are trails of lit marks on the glow
//   kit; the postsecondary mix is one segmented line of light with a
//   legend; every percentage measure is the house LightRange.
// - One line per row, numbers over words: a measure row is its number, its
//   name, its light and its value. The Replit's "· demo measure" suffix on
//   every row is said once, in the section's footnote.
// - The student count is said once (the Overview tile), not again in the
//   middle of the mix.
// - The Risk filter works, and the count tiles are roster reads where a
//   source exists, so the list, the tiles and Students agree.

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, ChevronDown, Download } from "lucide-react";
import { LightRange } from "@/components/app/LightRange";
import { Listbox } from "@/components/app/Listbox";
import { TextTabs } from "@/components/app/TextTabs";
import { Atmosphere, GLOW, GlowStroke, Orb } from "@/components/counselor/v4/charts/glow";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { attentionRank, attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { notify } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { flagsFor } from "./data";
import {
  ANALYTICS_TABS, COHORT_OUTCOMES, GRADE_OPTIONS, MEASURES, OUTCOME_FILTERS, OVERVIEW_TILES, READINESS_SNAPSHOT, RISK_CATEGORIES, RISK_TEST,
  destinationCounts, pct, planMix, riskTiles, type AnalyticsTab, type Measure, type RiskCategory,
} from "./analyticsData";
import { CARD, CARD_STYLE, DISPLAY, H2, H3, MUTED, OVERLINE, QuietButton, RULE, STATUS_DOT, Status, TITLE, briefHref, moment } from "./ui";

const PICKER = "h-11 min-w-[150px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold";
const PICKER_STYLE = { borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" } as const;
const BODY = "text-[15px] leading-[24px]";
const NOTE = "text-[13px] leading-[20px]";
const STAT = "text-[24px] leading-[28px] font-extrabold tabular-nums";

// The active sub-tab outlives the screen within a page session (the
// Replit remembers it when you leave and return; a reload forgets it).
let remembered: AnalyticsTab = "overview";

export function V7Analytics() {
  const [tab, setTabRaw] = useState<AnalyticsTab>(remembered);
  const setTab = (t: AnalyticsTab) => { remembered = t; setTabRaw(t); };
  const roster = useReviewedRoster();

  const exportSnapshot = () => {
    moment();
    notify("Analytics snapshot exported for this demo.");
  };

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-5)] sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-[var(--space-3)]">
          <span className={OVERLINE} style={MUTED}>Caseload intelligence</span>
          <h1 className={TITLE} style={DISPLAY}>Analytics</h1>
          <p className={BODY} style={MUTED}>See readiness, pathways, outcomes, and where support matters most.</p>
        </div>
        <QuietButton onClick={exportSnapshot} icon={<Download className="h-4 w-4" aria-hidden />}>Export snapshot</QuietButton>
      </header>

      {/* seven tabs fit from 768px; below that they become one dropdown
         (standing rule: a tab set wider than the screen is a dropdown) */}
      <div className="hidden md:block"><TextTabs items={[...ANALYTICS_TABS]} value={tab} onChange={setTab} ariaLabel="Analytics sections" layoutId="v7-analytics-tabs" soft caps={false} /></div>
      <div className="md:hidden">
        <Listbox ariaLabel="Analytics section" value={tab} onChange={(v) => setTab(v as AnalyticsTab)} options={ANALYTICS_TABS.map((t) => ({ value: t.key, label: t.label }))}
          className="h-11 w-full rounded-[var(--radius-md)] border px-[12px] text-[15px] font-semibold" style={PICKER_STYLE} />
      </div>

      {tab === "overview" ? <Overview roster={roster} />
        : tab === "readiness" ? <MeasureTab title="Readiness" line="Track academic and graduation readiness. Keep what students say apart from verified records." measures={MEASURES.readiness} />
        : tab === "postsecondary" ? <Postsecondary roster={roster} />
        : tab === "career" ? <MeasureTab title="Career & work-based learning" line="Participation and experience measures show how students connect learning to work." measures={MEASURES.career} />
        : tab === "risk" ? <Risk roster={roster} />
        : tab === "outcomes" ? <Outcomes />
        : <MeasureTab title="Dreamari engagement" line="Engagement is one part of the student picture. It does not mean a student is ready." measures={MEASURES.engagement} />}
    </div>
  );
}

// ---- Overview -----------------------------------------------------------------

function Overview({ roster }: { roster: CounselorStudent[] }) {
  const onTrack = pct(roster.filter((s) => s.status === "On Track").length, roster.length);
  const mix = useMemo(() => planMix(roster), [roster]);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="grid grid-cols-2 gap-[var(--space-4)] md:grid-cols-3 lg:grid-cols-6">
        <Tile label="Students" value={String(roster.length)} />
        <Tile label="On track" value={`${onTrack}%`} at={onTrack} />
        {OVERVIEW_TILES.map((t) => <Tile key={t.label} label={t.label} value={`${t.value}%`} at={t.value} />)}
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-5)] lg:grid-cols-[3fr_2fr]">
        <section aria-label="Readiness snapshot" className={`${CARD} flex flex-col gap-[var(--space-5)] p-[var(--space-6)]`} style={CARD_STYLE}>
          <CardHead overline="Readiness snapshot" title="Student milestones" />
          <Marks points={READINESS_SNAPSHOT} label="Student milestones" />
          <p className={NOTE} style={MUTED}>Sample caseload data. Measures can be set per state and district.</p>
        </section>
        <section aria-label="Planning destinations" className={`${CARD} flex flex-col gap-[var(--space-5)] p-[var(--space-6)]`} style={CARD_STYLE}>
          <CardHead overline="Planning destinations" title="Postsecondary mix" />
          <MixLine parts={mix} />
        </section>
      </div>

      <p className={NOTE} style={MUTED}>Student-stated, activity and verified data are kept apart where records allow. Demo figures are samples.</p>
    </div>
  );
}

/** One number and its name. A percentage also shows where it sits on the
 *  house range of light. */
function Tile({ label, value, at }: { label: string; value: string; at?: number }) {
  return (
    <div className={`${CARD} flex flex-col gap-[var(--space-2)] p-[var(--space-5)]`} style={CARD_STYLE}>
      <span className="text-[13px] leading-[18px] font-semibold" style={MUTED}>{label}</span>
      <span className={STAT} style={DISPLAY}>{value}</span>
      {typeof at === "number" ? <div className="-mx-[8px] mt-auto"><LightRange accent="var(--primary)" at={at} /></div> : <span className="mt-auto h-[28px]" aria-hidden />}
    </div>
  );
}

function CardHead({ overline, title }: { overline: string; title: string }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <span className={OVERLINE} style={MUTED}>{overline}</span>
      <h3 className={H3} style={DISPLAY}>{title}</h3>
    </div>
  );
}

// ---- the numbered measure tabs -------------------------------------------------

const FOOTNOTE = "Measures can be set to state and district requirements. Verified values need an authorized source connection.";

function MeasureTab({ title, line, measures, children }: { title: string; line: string; measures: Measure[]; children?: React.ReactNode }) {
  const [grade, setGrade] = useState("all");
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <SectionIntro title={title} line={line} control={<Listbox ariaLabel="Grade" value={grade} onChange={setGrade} options={GRADE_OPTIONS} className={PICKER} style={PICKER_STYLE} />} />
      {children}
      <MeasureList measures={measures} />
      <p className={NOTE} style={MUTED}>Demo measures. {FOOTNOTE}</p>
    </div>
  );
}

function SectionIntro({ overline, title, line, control }: { overline?: string; title: string; line: string; control?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
        {overline && <span className={OVERLINE} style={MUTED}>{overline}</span>}
        <h2 className={H2} style={DISPLAY}>{title}</h2>
        <p className={BODY} style={MUTED}>{line}</p>
      </div>
      {control && <div className="flex flex-none items-center gap-[var(--space-2)]">{control}</div>}
    </div>
  );
}

/** `01  GPA & grades  [light]  86%`: one line per measure. */
function MeasureList({ measures }: { measures: Measure[] }) {
  return (
    <ol className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
      {measures.map((m, i) => (
        <li key={m.label} className="flex items-center gap-[12px] border-b px-[var(--space-5)] py-[8px] last:border-b-0 sm:gap-[16px]" style={{ borderColor: RULE }}>
          <span className="w-[22px] flex-none text-[12px] font-semibold tabular-nums" style={MUTED}>{String(i + 1).padStart(2, "0")}</span>
          <span className="w-[128px] flex-none truncate text-[14px] font-semibold sm:w-[260px] sm:text-[15px]">{m.label}</span>
          <div className="min-w-0 flex-1"><LightRange accent="var(--primary)" at={m.value} ariaLabel={`${m.label}: ${m.value} percent`} /></div>
          <b className="w-[44px] flex-none text-right text-[15px] font-bold tabular-nums">{m.value}%</b>
        </li>
      ))}
    </ol>
  );
}

// ---- Postsecondary ---------------------------------------------------------------

function Postsecondary({ roster }: { roster: CounselorStudent[] }) {
  const counts = useMemo(() => destinationCounts(roster), [roster]);
  return (
    <MeasureTab title="Postsecondary readiness" line="A live view of planning progress and destinations across your caseload." measures={MEASURES.postsecondary}>
      <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4 lg:grid-cols-7">
        {counts.map((c) => <CountTile key={c.label} label={c.label} value={c.value} />)}
      </div>
    </MeasureTab>
  );
}

/** A count and its name. A value with no source says so, not 0. */
function CountTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className={`${CARD} flex flex-col gap-[4px] p-[var(--space-4)]`} style={CARD_STYLE}>
      {value === null
        ? <span className="text-[15px] leading-[28px] font-semibold" style={MUTED}>Not tracked</span>
        : <span className={STAT} style={DISPLAY}>{value}</span>}
      <span className="text-[13px] leading-[18px] font-semibold" style={MUTED}>{label}</span>
    </div>
  );
}

// ---- Risk ------------------------------------------------------------------------------

const RISK_PAGE = 8;

function Risk({ roster }: { roster: CounselorStudent[] }) {
  const [cat, setCat] = useState<RiskCategory>("all");
  const [shown, setShown] = useState(RISK_PAGE);
  const list = useMemo(() => roster.filter(RISK_TEST[cat]).sort(attentionRank), [roster, cat]);
  const tiles = useMemo(() => riskTiles(roster), [roster]);
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <SectionIntro overline="Prioritized intervention list" title="Who needs attention first?" line="Start with the students carrying the most overdue steps."
        control={<Listbox ariaLabel="Risk category" value={cat} onChange={(v) => { setCat(v as RiskCategory); setShown(RISK_PAGE); }} options={[...RISK_CATEGORIES]} className={PICKER} style={PICKER_STYLE} />} />

      {list.length ? (
        <div className="flex flex-col gap-[var(--space-2)]">
          <ul className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
            {list.slice(0, shown).map((s) => <RiskRow key={s.id} s={s} />)}
          </ul>
          {list.length > shown && <button type="button" onClick={() => setShown((n) => n + 25)} className="dm-link w-fit cursor-pointer pt-[4px] text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>Show {Math.min(25, list.length - shown)} more</button>}
        </div>
      ) : (
        // playbook tier 3: a list mid-flow with nothing in it is one muted line
        <p className={BODY} style={MUTED}>No students in this category.</p>
      )}

      <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4">
        {tiles.map((t) => <CountTile key={t.label} label={t.label} value={t.value} />)}
      </div>
    </div>
  );
}

/** One line: face, name, what is open, the status, Prepare meeting. */
function RiskRow({ s }: { s: CounselorStudent }) {
  const flags = flagsFor(s);
  const reason = flags.length ? flags.slice(0, 3).join(" · ") : `${attentionReason(s)} · Review their next milestone`;
  const urgent = flags.length >= 3;
  return (
    <li className="flex items-center gap-[12px] border-b px-[var(--space-5)] py-[10px] last:border-b-0 sm:gap-[14px]" style={{ borderColor: RULE }}>
      <StudentFace s={s} size={32} />
      <span className="w-[112px] flex-none truncate text-[15px] font-semibold sm:w-[200px]">{s.name}</span>
      <span className="hidden min-w-0 flex-1 truncate text-[14px] sm:block" style={MUTED}>{reason}</span>
      <span className="min-w-0 flex-1 sm:flex-none">
        {urgent
          ? <span className="inline-flex items-center gap-[7px] text-[13px] leading-[18px] font-semibold whitespace-nowrap"><span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: STATUS_DOT["At Risk"] }} />{flags.length} urgent items</span>
          : <Status status={s.status} />}
      </span>
      <span className="hidden sm:block"><QuietButton href={briefHref(s.id)} icon={<CalendarCheck className="h-4 w-4" aria-hidden />}>Prepare meeting</QuietButton></span>
      <span className="sm:hidden"><QuietButton href={briefHref(s.id)} icon={<CalendarCheck className="h-4 w-4" aria-hidden />} label={`Prepare meeting with ${s.name}`} /></span>
    </li>
  );
}

// ---- Outcomes ----------------------------------------------------------------------------

function Outcomes() {
  const [picks, setPicks] = useState<Record<string, string>>(() => Object.fromEntries(OUTCOME_FILTERS.map((f) => [f.key, f.options[0].value])));
  const [demographics, setDemographics] = useState(false);
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        {OUTCOME_FILTERS.map((f) => (
          <Listbox key={f.key} ariaLabel={f.label} value={picks[f.key]} onChange={(v) => setPicks((p) => ({ ...p, [f.key]: v }))} options={f.options} className={PICKER} style={PICKER_STYLE} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-5)] lg:grid-cols-[3fr_2fr]">
        <section aria-label="Cohort outcomes" className={`${CARD} flex flex-col gap-[var(--space-5)] p-[var(--space-6)]`} style={CARD_STYLE}>
          <CardHead overline="Cohort outcomes" title="Student destinations" />
          <Marks points={COHORT_OUTCOMES} label="Student destinations" />
        </section>
        <section aria-label="Outcome definitions" className={`${CARD} flex flex-col gap-[var(--space-4)] p-[var(--space-6)]`} style={CARD_STYLE}>
          <CardHead overline="Outcome definitions" title="Follow the full picture" />
          <p className={BODY} style={MUTED}>Graduation, college, trade, apprenticeship, workforce and military outcomes are shown one by one. Persistence can be added when verified long-term data is available.</p>
          <div className="mt-auto flex flex-col items-start gap-[var(--space-3)]">
            <QuietButton onClick={() => setDemographics((d) => !d)} icon={<ChevronDown className={`h-4 w-4 transition-transform ${demographics ? "rotate-180" : ""}`} aria-hidden />}>
              {demographics ? "Hide demographic breakdown" : "Demographics where permitted"}
            </QuietButton>
            {demographics && <p className={NOTE} style={MUTED}>Demographic comparisons are off in this prototype. Production access must follow district permissions and reporting safeguards.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---- the two charts: trails of lit marks -------------------------------------------------

/** Width of an element, kept current on resize. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** A monotone cubic path through points (no overshoot past a value). */
function monotone(p: { x: number; y: number }[]): string {
  if (p.length < 2) return "";
  const n = p.length;
  const dx = Array.from({ length: n - 1 }, (_, i) => p[i + 1].x - p[i].x);
  const dy = Array.from({ length: n - 1 }, (_, i) => p[i + 1].y - p[i].y);
  const m = dx.map((d, i) => dy[i] / (d || 1));
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${(p[i].x + h).toFixed(1)} ${(p[i].y + t[i] * h).toFixed(1)} ${(p[i + 1].x - h).toFixed(1)} ${(p[i + 1].y - t[i + 1] * h).toFixed(1)} ${p[i + 1].x.toFixed(1)} ${p[i + 1].y.toFixed(1)}`;
  }
  return d;
}

const COL = 76;

/** Each measure is a point of light on one trail, its value above it and
 *  its name below. Narrow screens scroll the trail sideways so every name
 *  stays readable. The glow kit's tokens live under data-counselor-version,
 *  so the SVG carries that attribute alone (no v4 layout follows it). */
function Marks({ points, label, height = 220 }: { points: Measure[]; label: string; height?: number }) {
  const [ref, W0] = useWidth<HTMLDivElement>();
  const W = Math.max(W0, points.length * COL);
  const H = height;
  const top = 40, bottom = H - 34, pad = 16;
  const xs = points.map((_, i) => pad + ((W - pad * 2) * (i + 0.5)) / points.length);
  const y = (v: number) => bottom - (Math.max(0, Math.min(100, v)) / 100) * (bottom - top);
  const pts = points.map((p, i) => ({ x: xs[i], y: y(p.value) }));
  const box = { x: pad, y: top, w: W - pad * 2, h: bottom - top };
  const stops = [GLOW.indigo, GLOW.blue, GLOW.sky].map((c, i) => ({ at: i / 2, color: c }));
  const area = `${monotone(pts)} L${pts[pts.length - 1].x.toFixed(1)} ${bottom} L${pts[0].x.toFixed(1)} ${bottom} Z`;
  const words = points.map((p) => `${p.label} ${p.value} percent`).join(", ");
  return (
    <div ref={ref} className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="img" aria-label={`${label}: ${words}`}>
      {W0 > 0 && (
        <div data-counselor-version="v4" style={{ width: W, height: H, color: "var(--foreground)" }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ display: "block", overflow: "visible" }}>
            {[0, 100].map((v) => <line key={v} x1={pad} x2={W - pad} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.1} />)}
            <Atmosphere d={area} box={box} stops={stops} span={[pts[0].x, pts[pts.length - 1].x]} />
            <GlowStroke d={monotone(pts)} width={3} from={0.55} />
            {points.map((p, i) => (
              <g key={p.label}>
                <Orb cx={xs[i]} cy={pts[i].y} r={6} />
                <text x={xs[i]} y={pts[i].y - 16} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor" style={{ fontVariantNumeric: "tabular-nums" }}>{p.value}%</text>
                <text x={xs[i]} y={bottom + 22} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--muted-foreground)">{p.label}</text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}

/** The postsecondary mix as one line of light in four parts, brightest for
 *  the largest share, with a legend that says each share once. */
const MIX_LIGHT = [100, 68, 46, 28];

function MixLine({ parts }: { parts: { label: string; value: number }[] }) {
  const total = parts.reduce((n, p) => n + p.value, 0);
  const shares = parts.map((p) => ({ ...p, pct: pct(p.value, total) }));
  const tint = (p: number) => `color-mix(in srgb, var(--primary) ${p}%, transparent)`;
  if (!total) return <p className={BODY} style={MUTED}>No stated plans yet.</p>;
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex h-[28px] items-center gap-[6px]" role="img" aria-label={`Postsecondary mix: ${shares.map((s) => `${s.label} ${s.pct} percent`).join(", ")}`}>
        {shares.map((s, i) => s.pct > 0 && (
          <span key={s.label} className="h-[4px] rounded-full" style={{
            width: `${s.pct}%`,
            background: `linear-gradient(to right, ${tint(Math.max(18, MIX_LIGHT[i] - 30))}, ${tint(MIX_LIGHT[i])})`,
            boxShadow: `0 0 8px ${tint(MIX_LIGHT[i] * 0.55)}, 0 0 22px ${tint(MIX_LIGHT[i] * 0.3)}`,
          }} />
        ))}
      </div>
      <ul className="flex flex-col">
        {shares.map((s, i) => (
          <li key={s.label} className="flex items-center gap-[10px] border-b py-[8px] last:border-b-0" style={{ borderColor: RULE }}>
            <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: tint(MIX_LIGHT[i]), boxShadow: `0 0 8px ${tint(MIX_LIGHT[i] * 0.6)}` }} />
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{s.label}</span>
            <b className="text-[15px] font-bold tabular-nums">{s.pct}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
