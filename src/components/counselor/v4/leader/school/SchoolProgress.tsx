"use client";

// What this screen answers: how far have students got on their planning
// milestones, how much career-connected activity is the school offering, and
// who, in a representative sample, still needs a nudge.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.2 (Student Progress),
// 2.0 (the filter row) and 3.6 (any of the 11 schools). The v2 deviations
// from the Replit still hold: the Replit's filter row scopes ONLY the
// 20-student sample (so it lives with the sample and says so), Academic Year
// is a static label (one option), filters are Listbox not native selects,
// a whole sample row opens the profile, ?status= from the Overview presets
// the status filter and opens the Students tab, milestone and experience
// figures are shared placeholders (NOTES.md 6.7).
//
// v4 rebuild (6 Oct 2026). WHY: this was the v2 screen inside v4's frame (an
// OverviewCard hero with extrabold numbers, green delta arrows, GLASS_INSET
// status tiles, a boxed filter panel, a ring of status pills). Direct
// instruction: make the leader roles "like this version" in every aspect.
// It is now the counselor's own Student progress, read for a school:
//   - The same underline tab row (Milestones, Experiences, Students) and the
//     same report canvas: the selected measure as the big light number on
//     the left with its sentence, every measure as a bar on the right.
//     Selecting a bar moves the left side, exactly as the counselor's chart.
//   - Milestone bars keep the launch-baseline tick inside the track, and the
//     value column carries "+x pts" under the share; the full Replit label
//     heads the explainer (the bar uses a short label so the row stays one line).
//   - Experiences are bars on ONE count scale (340 simulations vs 7 events is
//     the real story); "counts, not percentages" stays on the canvas.
//   - Students: the four statuses are the bars, and the counselor's
//     "Students behind the number" list sits below: two columns of hairline
//     rows with a dot-and-word status, the filters as one row of v4 selects.
//     The sample's ID and counselor moved from the table face into the
//     profile panel (one click), as the counselor's list shows name, grade
//     and pathway only (density first). Every filter, the counter, the
//     "filters apply to this sample only" note, the empty state and the
//     profile are kept.
//   - Every (i) is still a drill: "How it is counted" and "About these
//     counts" open the same wording the v2 drills held.

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Listbox } from "../../Listbox";
import { Segmented } from "../../viz";
import { Avatar } from "../../chips";
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
import { ACADEMIC_YEAR_LABEL, ReportBars, niceScale, num, schoolLine, useSchoolDetail } from "./schoolKit";
import { StatusMark, SUPPORT_TONE, TextAction } from "../kit";

type Tab = "milestones" | "experiences" | "students";

/** Bar labels short enough for one line; the full Replit label heads the explainer and the drill. */
const SHORT: Record<string, string> = {
  report: "Career + Postsecondary Report",
  shortlist: "Postsecondary shortlist",
  "top-three": "Top three",
  resume: "Resume",
  "follow-up": "Follow-up coverage",
  professionals: "Professionals engaged",
  conversations: "Career conversations",
  events: "Career events",
  "work-based": "Work-based learning",
  simulations: "Simulations completed",
};
const shortStatus = (s: SupportStatus) => (s === "Incomplete Career + Postsecondary Report" ? "Incomplete report" : s);

export function SchoolProgress() {
  const params = useSearchParams();
  const detail = useSchoolDetail();
  const { studentProgress: sp, school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const [open, setOpen] = useState<SampleStudent | null>(null);
  const [milestone, setMilestone] = useState(sp.kpis[0].id);
  const [experience, setExperience] = useState<string>(() => sp.experiences.tiles.reduce((a, b) => (b.value > a.value ? b : a)).id);
  const [showAll, setShowAll] = useState(false);

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

  const sample = sp.sample.students;
  const rows = useMemo(
    () => filterSampleStudents(sample, { grade: grade === "all" ? "all" : (Number(grade) as GradeFilter), counselor, group, status, interest }),
    [sample, grade, counselor, group, status, interest],
  );
  const statusCounts = useMemo(() => SUPPORT_STATUSES.map((st) => ({ status: st, count: sample.filter((x) => x.status === st).length })), [sample]);
  const filtered = grade !== "all" || counselor !== "all" || group !== "all" || status !== "all" || interest !== "all";
  const clear = () => { setGrade("all"); setCounselor("all"); setGroup("all"); setStatus("all"); setInterest("all"); setShowAll(false); };
  const sub = schoolLine(detail);
  const profile = open ? studentProfile(open) : null;

  const k = sp.kpis.find((x) => x.id === milestone) ?? sp.kpis[0];
  const t = sp.experiences.tiles.find((x) => x.id === experience) ?? sp.experiences.tiles[0];
  const notOnTrack = sample.length - (statusCounts.find((c) => c.status === "On Track")?.count ?? 0);
  const statusCount = status === "all" ? sample.length : statusCounts.find((c) => c.status === status)?.count ?? 0;

  const kpiDrill = (x: (typeof sp.kpis)[number]): Drill => ({
    title: x.label,
    subtitle: sub,
    lead: x.tooltip,
    stats: [
      { value: `${x.value}%`, label: "Current" },
      { value: `${x.baseline}%`, label: "Launch baseline" },
      { value: `+${x.delta} pts`, label: "Change since launch" },
      ...(x.id === "follow-up" ? [{ value: String(school.followUps), label: "Students requiring follow-up" }] : []),
    ],
  });
  const experienceDrill = (x: (typeof sp.experiences.tiles)[number]): Drill => ({
    title: x.label,
    subtitle: sub,
    lead: x.helper,
    stats: [{ value: num(x.value), label: x.label }],
    itemsLabel: "About these counts",
    items: [sp.experiences.subtitle, sp.experiences.tooltipText],
  });

  const expScale = niceScale(Math.max(...sp.experiences.tiles.map((x) => x.value)));
  const sampleScale = niceScale(Math.max(...statusCounts.map((c) => c.count)));
  const shown = showAll ? rows : rows.slice(0, 8);

  return (
    <div className="v4-progress">
      <Segmented
        ariaLabel="Student progress sections"
        value={tab}
        onChange={(v) => { setTab(v); setShowAll(false); }}
        options={[
          { key: "milestones", label: "Milestones" },
          { key: "experiences", label: "Experiences" },
          { key: "students", label: "Students" },
        ]}
      />

      <section className="v4-report-canvas v4-surface">
        {tab === "milestones" && (
          <>
            <div className="v4-report-explainer">
              <span className="v4-overline">Planning milestones</span>
              <h2>{k.label}</h2>
              <div className="v4-report-hero-number">{k.value}%</div>
              <p>Up {k.delta} points since launch, from {k.baseline}%. {k.id === "follow-up" ? "Share of flagged students with a follow-up action recorded." : "Share of every enrolled student."}</p>
              <div className="v4-school-explainer-actions"><TextAction onClick={() => setDrill(kpiDrill(k))}>How it is counted</TextAction></div>
              <span className="v4-chart-instruction">Select a bar to read its measure <ArrowUpRight size={14} aria-hidden /></span>
            </div>
            <ReportBars
              label="Planning milestones"
              selected={milestone}
              onSelect={setMilestone}
              unit="% of students · the tick marks the launch baseline"
              ticks={["0", "25", "50", "75", "100%"]}
              items={sp.kpis.map((x) => ({
                key: x.id,
                label: SHORT[x.id] ?? x.label,
                value: x.value,
                baseline: x.baseline,
                display: <>{x.value}%<small>+{x.delta} pts</small></>,
                aria: `${x.label}: ${x.value}%, up ${x.delta} points from a launch baseline of ${x.baseline}%`,
              }))}
            />
          </>
        )}

        {tab === "experiences" && (
          <>
            <div className="v4-report-explainer">
              <span className="v4-overline">{sp.experiences.title === "Career Experiences and Access" ? "Career experiences and access" : sp.experiences.title}</span>
              <h2>{t.label}</h2>
              <div className="v4-report-hero-number">{num(t.value)}</div>
              <p>{t.helper}</p>
              <small>A count for {ACADEMIC_YEAR_LABEL}, not a percentage.</small>
              <div className="v4-school-explainer-actions"><TextAction onClick={() => setDrill(experienceDrill(t))}>About these counts</TextAction></div>
              <span className="v4-chart-instruction">Select a bar to read its count <ArrowUpRight size={14} aria-hidden /></span>
            </div>
            <ReportBars
              label={sp.experiences.title}
              selected={experience}
              onSelect={setExperience}
              scale={expScale}
              unit="Counts, not percentages"
              items={sp.experiences.tiles.map((x) => ({ key: x.id, label: SHORT[x.id] ?? x.label, value: x.value, display: num(x.value), aria: `${x.label}: ${num(x.value)}` }))}
            />
          </>
        )}

        {tab === "students" && (
          <>
            <div className="v4-report-explainer">
              <span className="v4-overline">Representative sample</span>
              <h2>{status === "all" ? "Sample support status" : status}</h2>
              <div className="v4-report-hero-number">{statusCount}</div>
              <p>{status === "all" ? `${sample.length} synthetic students. ${notOnTrack} need support.` : `${statusCount} of ${sample.length} synthetic students.`}</p>
              <small>{STUDENT_SAMPLE_COPY.subtitle}</small>
              <span className="v4-chart-instruction">Select a bar to filter the students below <ArrowUpRight size={14} aria-hidden /></span>
            </div>
            <ReportBars
              label="Sample support status"
              selected={status}
              onSelect={(s) => { setStatus(status === s ? "all" : (s as SupportStatus)); setShowAll(false); }}
              scale={sampleScale}
              unit="Synthetic students"
              items={statusCounts.map((c) => ({ key: c.status, label: shortStatus(c.status), value: c.count, display: c.count, color: SUPPORT_TONE[c.status], aria: `${c.status}: ${c.count} students. Filter the list` }))}
            />
          </>
        )}
      </section>

      {tab === "students" && (
        <section className="v4-report-students">
          <header>
            <div><span className="v4-overline">Students behind the number</span><h2>{status === "all" ? "All statuses" : status}<span>{rows.length}</span></h2></div>
            {filtered && <TextAction onClick={clear}>Clear filters</TextAction>}
          </header>
          <div role="group" aria-label="Filters for the student sample only" className="v4-school-filters">
            {/* One year, so a label and not a control. */}
            <span className="v4-school-year" aria-label={`${SCHOOL_FILTERS.academicYear.label}: ${ACADEMIC_YEAR_LABEL}`}>{ACADEMIC_YEAR_LABEL}</span>
            <Listbox ariaLabel={SCHOOL_FILTERS.grade.label} value={grade} onChange={(v) => { setGrade(v); setShowAll(false); }} options={SCHOOL_FILTERS.grade.options.map((o) => ({ value: String(o.value), label: o.label }))} />
            <Listbox ariaLabel={SCHOOL_FILTERS.counselor.label} value={counselor} onChange={(v) => { setCounselor(v); setShowAll(false); }} options={detail.filters.counselorOptions} />
            <Listbox ariaLabel={SCHOOL_FILTERS.studentGroup.label} value={group} onChange={(v) => { setGroup(v as StudentGroupFilter); setShowAll(false); }} options={SCHOOL_FILTERS.studentGroup.options.map((o) => ({ value: o.value, label: o.label }))} />
            <Listbox ariaLabel={STUDENT_SAMPLE_COPY.statusFilter.label} value={status} onChange={(v) => { setStatus(v as SupportStatus | "all"); setShowAll(false); }} options={[{ value: "all", label: STUDENT_SAMPLE_COPY.statusFilter.allLabel }, ...SUPPORT_STATUSES.map((s) => ({ value: s, label: s }))]} />
            <Listbox ariaLabel={STUDENT_SAMPLE_COPY.interestFilter.label} value={interest} onChange={(v) => { setInterest(v as InterestArea | "all"); setShowAll(false); }} options={[{ value: "all", label: STUDENT_SAMPLE_COPY.interestFilter.allLabel }, ...INTEREST_AREAS.map((a) => ({ value: a, label: a }))]} />
          </div>
          <p className="v4-school-sample-note"><span><b>Filters apply to this sample only.</b> Schoolwide numbers on every screen stay schoolwide.</span><span>{STUDENT_SAMPLE_COPY.counter(rows.length, sample.length)}</span></p>

          {rows.length === 0 ? (
            <div className="v4-school-empty"><span>{STUDENT_SAMPLE_COPY.empty}</span><TextAction onClick={clear}>Clear filters</TextAction></div>
          ) : (
            <div className="v4-report-person-grid">
              {shown.map((s) => (
                <button key={s.id} type="button" onClick={() => setOpen(s)} aria-label={`${s.name}, ${s.status}. Open profile`}>
                  <Avatar name={s.name} size={40} />
                  <span><strong>{s.name}</strong><small>Grade {s.grade} · {s.interest}</small></span>
                  <span className="v4-school-person-meta"><StatusMark color={SUPPORT_TONE[s.status]}>{shortStatus(s.status)}</StatusMark><small>{s.lastActivity}</small></span>
                  <ArrowUpRight size={14} aria-hidden />
                </button>
              ))}
            </div>
          )}
          {rows.length > 8 && <button type="button" className="v4-show-all" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer students" : `View all ${rows.length} students`}<ChevronDown size={14} aria-hidden style={{ transform: showAll ? "rotate(180deg)" : undefined }} /></button>}
        </section>
      )}

      <p className="v4-data-note">{school.name} · {num(school.enrollment)} students · {ACADEMIC_YEAR_LABEL} · demo data. Milestones are shares of enrolled students; follow-up coverage is a share of students flagged for follow-up. The student sample is 20 synthetic profiles.</p>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      <SidePanel open={!!open} onClose={() => setOpen(null)} title={profile?.title ?? ""} subtitle={profile?.subline}>
        {profile && open && (
          <>
            <dl className="v4-school-facts">
              {profile.stats.map((s) => (
                <div key={s.label}><dt>{s.label}</dt><dd>{s.label === "Support Status" ? <StatusMark color={SUPPORT_TONE[open.status]}>{s.value}</StatusMark> : s.value}</dd></div>
              ))}
            </dl>
            <p className="v4-school-panel-note">{profile.footer}</p>
            <button type="button" onClick={() => setOpen(null)} className="v4-school-panel-close">{profile.closeLabel}</button>
          </>
        )}
      </SidePanel>
    </div>
  );
}
