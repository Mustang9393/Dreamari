"use client";

// What this screen answers: how far have students got on their planning
// milestones, how much career-connected activity is the school offering, and
// who, in a representative sample, still needs a nudge.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.2 (Student Progress),
// 2.0 (the filter row) and 3.6 (any of the 11 schools).
//
// Deliberate deviations from the Replit, with why:
// - The Replit's global filter row (Grade, Counselor, Student Group) lives
//   ONLY on the Student Sample card here. In the Replit those filters look
//   global but change nothing except the 20-student sample (its own (i)
//   admits it), which misleads a principal into thinking a KPI is filtered.
// - Filters are Listbox, not native selects (cross-browser guardrails).
// - The whole sample row opens the student profile in the side panel.
// - Support status is coloured per status, matching the Overview donut.
// - Arriving from an Overview status row (?status=...) pre-sets the status
//   filter and opens the Students tab. Changing the filter does not rewrite
//   the URL. The table is a stacked list below md.
//
// 2 Oct 2026 redundancy pass, with why (chart type picked from the metric):
// - Milestones: the four completion measures are comparable shares with a
//   launch baseline, so ONE grouped column chart (launch vs now per
//   milestone) with a legend replaces four title-plus-bar rows and the
//   separately drawn baseline-tick legend. Full names, changes and how each
//   is counted are in the one "Details" drill.
// - Follow-Up Coverage left this screen: its home is Counseling team, whose
//   follow-up drill now also carries the 85% launch baseline and the change.
// - Experiences: five comparable counts, so ONE column chart on a shared
//   count axis (340 simulations vs 7 events is the story). The subtitle
//   ("Counts of experiences ...") restated the title; definitions are in
//   the drill.
// - Students: the "Sample support status" ring and its four tiles repeated
//   the Status filter. Both are now ONE row of status chips with counts,
//   which is the status filter. The single-value Academic year field is
//   gone (the year is in the header). The subtitle and the "Filters apply
//   to this sample only. Schoolwide numbers ... stay schoolwide" sentence
//   said the same thing; one short line stays.

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Listbox } from "@/components/app/Listbox";
import { BarChart, Segmented } from "@/components/connect/viz";
import { NEUTRAL_SLICE, PRIMARY } from "@/components/counselor/palette";
import { CardLink, Go } from "@/components/counselor/chips";
import { GLASS_INSET } from "@/components/counselor/surfaces";
import { OverviewCard, InitialsBadge } from "../../overviewShared";
import { DrillPanel, type Drill } from "../../Drill";
import { SidePanel } from "../../SidePanel";
import {
  INTEREST_AREAS,
  STUDENT_SAMPLE_COPY,
  SUPPORT_STATUSES,
  SCHOOL_FILTERS,
  filterSampleStudents,
  studentProfile,
  type GradeFilter,
  type InterestArea,
  type SampleStudent,
  type StudentGroupFilter,
  type SupportStatus,
} from "@/lib/leaderData";
import { ACADEMIC_YEAR_LABEL, ATTENTION_FIRST, FIELD, FIELD_STYLE, LABEL, STATUS_COLOR, StatusPill, num, useSchoolDetail } from "./schoolKit";

/** Column labels short enough to sit under a column; full names are in the drill. */
const MILESTONE_SHORT: Record<string, string> = { report: "Report", shortlist: "Shortlist", "top-three": "Top three", resume: "Resume" };
const EXPERIENCE_SHORT: Record<string, string> = { professionals: "Professionals", conversations: "Conversations", events: "Events", "work-based": "Work-based", simulations: "Simulations" };

const COLS = "md:grid md:grid-cols-[minmax(0,1.9fr)_56px_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,2fr)_112px] md:items-center md:gap-x-[12px]";

type Tab = "milestones" | "experiences" | "students";

export function SchoolProgress() {
  const params = useSearchParams();
  const detail = useSchoolDetail();
  const { studentProgress: sp, school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const [open, setOpen] = useState<SampleStudent | null>(null);

  const [grade, setGrade] = useState<string>("all");
  const [counselor, setCounselor] = useState("all");
  const [group, setGroup] = useState<StudentGroupFilter>("all");
  const [interest, setInterest] = useState<InterestArea | "all">("all");
  const [status, setStatus] = useState<SupportStatus | "all">("all");
  // Arriving from an Overview status bar (?status=): open the Students tab
  // with that filter applied, and follow the param if it changes while this
  // screen stays mounted (adjusting state during render, no effect needed).
  const fromUrl = params.get("status");
  const urlStatus = SUPPORT_STATUSES.includes(fromUrl as SupportStatus) ? (fromUrl as SupportStatus) : null;
  const [tab, setTab] = useState<Tab>(urlStatus ? "students" : "milestones");
  const [seenUrlStatus, setSeenUrlStatus] = useState<SupportStatus | null>(null);
  if (urlStatus !== seenUrlStatus) {
    setSeenUrlStatus(urlStatus);
    if (urlStatus) { setTab("students"); setStatus(urlStatus); }
  }

  const rows = useMemo(
    () => filterSampleStudents(sp.sample.students, { grade: grade === "all" ? "all" : (Number(grade) as GradeFilter), counselor, group, status, interest }),
    [sp.sample.students, grade, counselor, group, status, interest],
  );
  const statusCounts = useMemo(
    () => ATTENTION_FIRST.map((st) => ({ status: st, count: sp.sample.students.filter((x) => x.status === st).length })),
    [sp.sample.students],
  );
  const filtered = grade !== "all" || counselor !== "all" || group !== "all" || status !== "all" || interest !== "all";
  const clear = () => { setGrade("all"); setCounselor("all"); setGroup("all"); setStatus("all"); setInterest("all"); };
  const sub = `${school.name} · ${num(school.enrollment)} students · ${ACADEMIC_YEAR_LABEL}`;
  const profile = open ? studentProfile(open) : null;

  // Follow-Up Coverage lives on Counseling team (2 Oct 2026 redundancy pass).
  const milestones = sp.kpis.filter((k) => k.id !== "follow-up");
  const milestonesDrill: Drill = {
    title: "Planning milestones",
    subtitle: sub,
    // The shared first sentence of every milestone (i) text.
    lead: `Completion percentages are the share of ${num(school.enrollment)} enrolled students meeting the named milestone in ${ACADEMIC_YEAR_LABEL}.`,
    rowsLabel: "Now, with change since launch",
    rows: milestones.map((k) => ({ label: k.label, value: `${k.value}% (was ${k.baseline}%, +${k.delta} pts)`, pct: k.value })),
    itemsLabel: "Who counts",
    items: milestones.map((k) => `${k.label}: ${k.tooltip.match(/numerator is (.+?);/)?.[1] ?? k.tooltip}`),
  };
  const experiences = [...sp.experiences.tiles].sort((a, b) => b.value - a.value);
  const maxExperience = Math.max(...experiences.map((t) => t.value));
  const experiencesDrill: Drill = {
    title: sp.experiences.title,
    subtitle: sub,
    lead: sp.experiences.tooltipText,
    rowsLabel: "Counts",
    rows: experiences.map((t) => ({ label: t.label, value: num(t.value), pct: (t.value / maxExperience) * 100 })),
    itemsLabel: "What each count is",
    items: experiences.map((t) => `${t.label}: ${t.helper}`),
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <Segmented
        ariaLabel="Student progress sections"
        value={tab}
        onChange={setTab}
        options={[
          { key: "milestones", label: "Milestones" },
          { key: "experiences", label: "Experiences" },
          { key: "students", label: "Students" },
        ]}
      />

      {tab === "milestones" && (
        <OverviewCard hero title="Planning milestones" unit="% of students" aside={<CardLink onClick={() => setDrill(milestonesDrill)}>Details</CardLink>}>
          <BarChart
            barStyle="solid"
            height={200}
            maxBarWidth={30}
            groups={milestones.map((k) => MILESTONE_SHORT[k.id] ?? k.label)}
            series={[
              { label: "At launch", accent: NEUTRAL_SLICE, values: milestones.map((k) => k.baseline) },
              { label: "Now", accent: PRIMARY, values: milestones.map((k) => k.value) },
            ]}
          />
        </OverviewCard>
      )}

      {tab === "experiences" && (
        <OverviewCard title={sp.experiences.title} unit="counts" aside={<CardLink onClick={() => setDrill(experiencesDrill)}>Details</CardLink>}>
          <BarChart
            barStyle="solid"
            height={200}
            maxBarWidth={34}
            valueSuffix=""
            max={Math.max(10, Math.ceil(maxExperience / 100) * 100)}
            groups={experiences.map((t) => EXPERIENCE_SHORT[t.id] ?? t.label)}
            series={[{ label: sp.experiences.title, accent: PRIMARY, values: experiences.map((t) => t.value) }]}
          />
        </OverviewCard>
      )}

      {/* The sample. Every filter here scopes this card only (see header). */}
      {tab === "students" && (
      <OverviewCard title={STUDENT_SAMPLE_COPY.title} aside={<span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{STUDENT_SAMPLE_COPY.counter(rows.length)}</span>}>
        <div role="group" aria-label="Filters for the student sample only" className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={GLASS_INSET}>
          <span className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[4px]">
            <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>Filters change this sample only.</span>
            {filtered && (
              <button type="button" onClick={clear} className="dm-quiet cursor-pointer rounded-[var(--radius-sm)] px-[8px] py-[4px] text-[12.5px] font-bold" style={{ color: "var(--primary)" }}>Clear filters</button>
            )}
          </span>
          {/* The status filter: one chip per status with its sample count (2 Oct 2026 redundancy pass: replaces the status ring, its tiles and the Status dropdown). */}
          <div role="group" aria-label={STUDENT_SAMPLE_COPY.statusFilter.label} className="flex flex-wrap gap-[8px]">
            {[{ status: "all" as const, count: sp.sample.students.length }, ...statusCounts].map((c) => {
              const on = status === c.status;
              const label = c.status === "all" ? STUDENT_SAMPLE_COPY.statusFilter.allLabel : c.status;
              return (
                <button
                  key={c.status}
                  type="button"
                  onClick={() => setStatus(c.status)}
                  aria-pressed={on}
                  className="dm-quiet flex h-9 cursor-pointer items-center gap-[8px] rounded-full border px-[12px] text-[12.5px] font-semibold"
                  style={{ borderColor: on ? (c.status === "all" ? "var(--primary)" : STATUS_COLOR[c.status]) : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--foreground) 8%, transparent)" : "transparent", color: "var(--foreground)" }}
                >
                  {c.status !== "all" && <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: STATUS_COLOR[c.status] }} />}
                  {label}
                  <span className="font-extrabold tabular-nums">{c.count}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-4">
            <Filter label={SCHOOL_FILTERS.grade.label}>
              <Listbox ariaLabel="Grade" value={grade} onChange={setGrade} options={SCHOOL_FILTERS.grade.options.map((o) => ({ value: String(o.value), label: o.label }))} className={FIELD} style={FIELD_STYLE} />
            </Filter>
            <Filter label={SCHOOL_FILTERS.counselor.label}>
              <Listbox ariaLabel="Counselor" value={counselor} onChange={setCounselor} options={detail.filters.counselorOptions} className={FIELD} style={FIELD_STYLE} />
            </Filter>
            <Filter label={SCHOOL_FILTERS.studentGroup.label}>
              <Listbox ariaLabel="Student group" value={group} onChange={(v) => setGroup(v as StudentGroupFilter)} options={SCHOOL_FILTERS.studentGroup.options.map((o) => ({ value: o.value, label: o.label }))} className={FIELD} style={FIELD_STYLE} />
            </Filter>
            <Filter label={STUDENT_SAMPLE_COPY.interestFilter.label}>
              <Listbox ariaLabel="Interest area" value={interest} onChange={(v) => setInterest(v as InterestArea | "all")} options={[{ value: "all", label: STUDENT_SAMPLE_COPY.interestFilter.allLabel }, ...INTEREST_AREAS.map((a) => ({ value: a, label: a }))]} className={FIELD} style={FIELD_STYLE} />
            </Filter>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-[10px] rounded-[var(--radius-md)] border border-dashed px-[var(--space-4)] py-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{STUDENT_SAMPLE_COPY.empty}</p>
            <button type="button" onClick={clear} className="dm-quiet cursor-pointer rounded-[var(--radius-sm)] border px-[12px] py-[7px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Clear filters</button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className={`hidden border-b px-[8px] pb-[8px] ${COLS}`} style={{ borderColor: "var(--glass-border)" }} aria-hidden>
              {["Student", "Grade", "Counselor", "Primary interest", "Support status", "Last activity"].map((h) => (
                <span key={h} className={LABEL} style={{ color: "var(--muted-foreground)" }}>{h}</span>
              ))}
            </div>
            <ul>
              {rows.map((s) => (
                <li key={s.id} className="border-b last:border-b-0" style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                  <button type="button" onClick={() => setOpen(s)} aria-label={`${s.name}, open profile`} className={`dm-quiet group flex w-full cursor-pointer flex-col gap-[6px] rounded-[var(--radius-sm)] px-[8px] py-[10px] text-left ${COLS}`}>
                    <span className="flex min-w-0 items-center gap-[10px]">
                      <InitialsBadge name={s.name} />
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                        <span className="text-[11.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{s.id}</span>
                      </span>
                    </span>
                    <span className="hidden text-[13px] font-semibold tabular-nums md:block" style={{ color: "var(--foreground)" }}>{s.grade}</span>
                    <span className="hidden truncate text-[13px] font-semibold md:block" style={{ color: "var(--foreground)" }}>{s.counselor}</span>
                    <span className="hidden truncate text-[13px] font-semibold md:block" style={{ color: "var(--foreground)" }}>{s.interest}</span>
                    <span className="flex min-w-0 items-center justify-between gap-[8px]"><StatusPill status={s.status} /><Go className="opacity-0 transition-opacity group-hover:opacity-100 md:hidden" /></span>
                    <span className="hidden items-center justify-between gap-[6px] text-[13px] font-semibold whitespace-nowrap md:flex" style={{ color: "var(--muted-foreground)" }}>{s.lastActivity}<Go className="opacity-0 transition-opacity group-hover:opacity-100" /></span>
                    <span className="text-[12px] font-semibold md:hidden" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.counselor} · {s.interest} · {s.lastActivity}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </OverviewCard>
      )}

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      <SidePanel open={!!open} onClose={() => setOpen(null)} title={profile?.title ?? ""} subtitle={profile?.subline}>
        {profile && (
          <>
            <div className="grid grid-cols-1 gap-[8px]">
              {profile.stats.map((s) => (
                <span key={s.label} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
                  <span className="text-[18px] leading-[1.2] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.value}</span>
                </span>
              ))}
            </div>
            <p className="text-[12.5px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{profile.footer}</p>
            <button type="button" onClick={() => setOpen(null)} className="dm-quiet mt-auto flex h-10 w-full flex-none cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{profile.closeLabel}</button>
          </>
        )}
      </SidePanel>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col gap-[4px]">
      <span className={LABEL} style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {children}
    </span>
  );
}
