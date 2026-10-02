"use client";

// What this screen answers: how far have students got on their planning
// milestones, how much career-connected activity is the school offering, and
// who, in a representative sample, still needs a nudge.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.2 (Student Progress),
// 2.0 (the filter row) and 3.6 (any of the 11 schools).
//
// Deliberate deviations from the Replit, with why:
// - The Replit's global filter row (Academic Year, Grade, Counselor, Student
//   Group) lives ONLY on the Student Sample card here, labelled as filtering
//   the sample. In the Replit those filters look global but change nothing
//   except the 20-student sample (its own (i) admits it), which misleads a
//   principal into thinking a KPI or chart is filtered. Academic year is a
//   single static "2026–27" label, not a control, because it has one option.
// - Filters are Listbox, not native selects (cross-browser guardrails).
// - The whole sample row opens the student profile (the Replit opens it from
//   the name only): every card and row opens something in this app. The
//   profile opens in the side panel instead of a centred modal.
// - Support status is also coloured per status (the Replit's pills were green
//   or amber only), so a row matches the Overview bar the leader came from.
// - KPI (i) tooltips and the Career Experiences card/tile (i) text are drills.
//   The milestone KPIs and experience counts are the same at every school (a
//   placeholder in the data, NOTES.md 6.7); only Follow-Up Coverage varies.
// - One hero per tab: the Milestones card.
// - Viz pass (2 Oct 2026). The Replit stacks five KPI cards, five count
//   tiles and a 20-row table in one long scroll, which reads as "just a lot
//   of numbers". It is now ONE tab row (Milestones, Experiences, Students)
//   and each tab is drawn, not listed. Nothing is dropped: every figure,
//   helper sentence and (i) text is still on the row or in its drill.
//   - Milestones: the five completion measures are ONE card of horizontal
//     bars (bar = current %, tick = launch baseline, value and "+x pts" at
//     the right). Five separate cards could not be compared at a glance;
//     bars on one 0 to 100 scale can. Follow-Up Coverage keeps its helper
//     sentence under its label because its denominator (flagged students)
//     differs from the other four (enrolled students).
//   - Experiences: the five counts as bars on ONE shared scale (bar length
//     proportional to the count, 340 simulations vs 7 events is the real
//     story), with "counts, not percentages" kept in the card header.
//   - Students: a ring of the sample's support status sits above the sample
//     table; each key row filters the table below it (the Replit makes the
//     leader go to the filters to learn the same thing). Counts come from the
//     full 20-student sample, not the filtered rows.
//   - Tabs are Segmented (the one tab design on this screen); the sample's
//     filters stay Listbox fields inside the sample card, not a second row of
//     tabs. Labels are one word each so the row fits a 375px phone.
// - Arriving from an Overview status bar (?status=...) pre-sets the status
//   filter, as in the Replit, and now also opens the Students tab (the
//   filter is invisible on the other two). Changing the filter does not
//   rewrite the URL.
// - The table is a stacked list below md instead of a horizontally scrolling table.

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { Segmented, SegmentedRing } from "../../viz";
import { TREND_UP } from "@/components/counselor/palette";
import { Go } from "@/components/counselor/chips";
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
import { ACADEMIC_YEAR_LABEL, ColorBar, FIELD, FIELD_STYLE, LABEL, STATUS_COLOR, StatusPill, num, useSchoolDetail } from "./schoolKit";

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
    () => SUPPORT_STATUSES.map((st) => ({ status: st, count: sp.sample.students.filter((x) => x.status === st).length })),
    [sp.sample.students],
  );
  const filtered = grade !== "all" || counselor !== "all" || group !== "all" || status !== "all" || interest !== "all";
  const clear = () => { setGrade("all"); setCounselor("all"); setGroup("all"); setStatus("all"); setInterest("all"); };
  const maxExperience = Math.max(...sp.experiences.tiles.map((t) => t.value));
  const sub = `${school.name} · ${num(school.enrollment)} students · ${ACADEMIC_YEAR_LABEL}`;
  const profile = open ? studentProfile(open) : null;

  const kpiDrill = (k: (typeof sp.kpis)[number]): Drill => ({
    title: k.label,
    subtitle: sub,
    lead: k.tooltip,
    stats: [
      { value: `${k.value}%`, label: "Current" },
      { value: `${k.baseline}%`, label: "Launch baseline" },
      { value: `+${k.delta} pts`, label: "Change since launch" },
      ...(k.id === "follow-up" ? [{ value: String(school.followUps), label: "Students requiring follow-up" }] : []),
    ],
  });

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
        <OverviewCard
          hero
          title="Planning milestones"
          unit="% of students"
          aside={
            <span className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span aria-hidden className="h-[12px] w-[2px] rounded-[1px]" style={{ background: "color-mix(in srgb, var(--foreground) 55%, transparent)" }} />
              Launch baseline
            </span>
          }
        >
          <ul className="flex flex-col">
            {sp.kpis.map((k) => (
              <li key={k.id} className="border-b last:border-b-0" style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                <BarRow
                  label={k.label}
                  helper={k.helper?.replace(/ \+\d+ pts since launch$/, "")}
                  onOpen={() => setDrill(kpiDrill(k))}
                  bar={<ColorBar pct={k.value} reference={k.baseline} height={10} />}
                  value={
                    <>
                      <span className="text-[22px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{k.value}%</span>
                      <span className="flex items-center gap-[4px] text-[12px] leading-[16px] font-extrabold tabular-nums" style={{ color: TREND_UP }}>
                        <TrendingUp className="h-[12px] w-[12px] flex-none" aria-hidden />+{k.delta} pts
                      </span>
                    </>
                  }
                />
              </li>
            ))}
          </ul>
        </OverviewCard>
      )}

      {tab === "experiences" && (
        <OverviewCard title={sp.experiences.title} unit="counts, not percentages">
          <p className="-mt-[8px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sp.experiences.subtitle}</p>
          <ul className="flex flex-col">
            {sp.experiences.tiles.map((t) => (
              <li key={t.id} className="border-b last:border-b-0" style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                <BarRow
                  label={t.label}
                  onOpen={() => setDrill({ title: t.label, subtitle: sub, lead: t.helper, stats: [{ value: num(t.value), label: t.label }], itemsLabel: "About these counts", items: [sp.experiences.tooltipText] })}
                  /* One shared scale: the longest bar is the largest count. */
                  bar={<ColorBar pct={Math.max(1.5, (t.value / maxExperience) * 100)} height={10} />}
                  value={<span className="text-[22px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{num(t.value)}</span>}
                />
              </li>
            ))}
          </ul>
        </OverviewCard>
      )}

      {tab === "students" && (
        <OverviewCard title="Sample support status" unit={`${sp.sample.students.length} synthetic students`} aside={<span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Select one to filter the table</span>}>
          <div className="flex flex-wrap items-center gap-x-[var(--space-6)] gap-y-[var(--space-4)]">
            <span className="mx-auto flex sm:mx-0">
            <SegmentedRing segments={statusCounts.map((c) => ({ value: c.count, color: STATUS_COLOR[c.status] }))} size={104} stroke={12}>
              <span className="flex flex-col items-center leading-none">
                <span className="text-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{sp.sample.students.length}</span>
                <span className="mt-[3px] text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>students</span>
              </span>
            </SegmentedRing>
            </span>
            <ul className="grid min-w-[240px] flex-1 grid-cols-2 gap-[8px] xl:grid-cols-4">
              {statusCounts.map((c) => {
                const on = status === c.status;
                return (
                  <li key={c.status} className="flex">
                    <button
                      type="button"
                      onClick={() => setStatus(on ? "all" : c.status)}
                      aria-pressed={on}
                      className="dm-quiet flex w-full cursor-pointer flex-col gap-[4px] rounded-[var(--radius-md)] border p-[12px] text-left"
                      style={on ? { ...GLASS_INSET, borderColor: STATUS_COLOR[c.status] } : GLASS_INSET}
                    >
                      <span className="flex items-center gap-[8px]">
                        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: STATUS_COLOR[c.status] }} />
                        <span className="text-[22px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{c.count}</span>
                      </span>
                      <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.status}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </OverviewCard>
      )}

      {/* The sample. Every filter here scopes this card only (see header). */}
      {tab === "students" && (
      <OverviewCard title={STUDENT_SAMPLE_COPY.title} aside={<span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{STUDENT_SAMPLE_COPY.counter(rows.length)}</span>}>
        <p className="-mt-[8px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{STUDENT_SAMPLE_COPY.subtitle}</p>
        <div role="group" aria-label="Filters for the student sample only" className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={GLASS_INSET}>
          <span className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[4px]">
            <span className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <b className="font-bold" style={{ color: "var(--foreground)" }}>Filters apply to this sample only.</b> Schoolwide numbers on every screen stay schoolwide.
            </span>
            {filtered && (
              <button type="button" onClick={clear} className="dm-quiet cursor-pointer rounded-[var(--radius-sm)] px-[8px] py-[4px] text-[12.5px] font-bold" style={{ color: "var(--primary)" }}>Clear filters</button>
            )}
          </span>
          <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-6">
            <span className="flex min-w-0 flex-col gap-[4px]">
              <span className={LABEL} style={{ color: "var(--muted-foreground)" }}>{SCHOOL_FILTERS.academicYear.label}</span>
              {/* One year, so a label and not a control. */}
              <span className="flex h-10 items-center rounded-[var(--radius-sm)] border px-[10px] text-[13px] font-semibold" style={{ ...FIELD_STYLE, color: "var(--muted-foreground)" }}>{ACADEMIC_YEAR_LABEL}</span>
            </span>
            <Filter label={SCHOOL_FILTERS.grade.label}>
              <Listbox ariaLabel="Grade" value={grade} onChange={setGrade} options={SCHOOL_FILTERS.grade.options.map((o) => ({ value: String(o.value), label: o.label }))} className={FIELD} style={FIELD_STYLE} />
            </Filter>
            <Filter label={SCHOOL_FILTERS.counselor.label}>
              <Listbox ariaLabel="Counselor" value={counselor} onChange={setCounselor} options={detail.filters.counselorOptions} className={FIELD} style={FIELD_STYLE} />
            </Filter>
            <Filter label={SCHOOL_FILTERS.studentGroup.label}>
              <Listbox ariaLabel="Student group" value={group} onChange={(v) => setGroup(v as StudentGroupFilter)} options={SCHOOL_FILTERS.studentGroup.options.map((o) => ({ value: o.value, label: o.label }))} className={FIELD} style={FIELD_STYLE} />
            </Filter>
            <Filter label={STUDENT_SAMPLE_COPY.statusFilter.label}>
              <Listbox ariaLabel="Support status" value={status} onChange={(v) => setStatus(v as SupportStatus | "all")} options={[{ value: "all", label: STUDENT_SAMPLE_COPY.statusFilter.allLabel }, ...SUPPORT_STATUSES.map((s) => ({ value: s, label: s }))]} className={FIELD} style={FIELD_STYLE} />
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

/** One bar row that opens a drill: label (and an optional helper line) left,
 *  the bar in the middle, value right. On a phone the bar drops under the
 *  label and value so every row is two lines, never a squeezed three columns. */
function BarRow({ label, helper, bar, value, onOpen }: { label: string; helper?: string; bar: React.ReactNode; value: React.ReactNode; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${label}: details`}
      className="dm-quiet group relative grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[16px] gap-y-[10px] rounded-[var(--radius-sm)] py-[14px] pr-[28px] pl-[8px] text-left md:grid-cols-[minmax(0,280px)_minmax(0,1fr)_96px]"
    >
      <span className="flex min-w-0 flex-col gap-[2px]">
        <span className="text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
        {helper && <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{helper}</span>}
      </span>
      <span className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1">{bar}</span>
      <span className="flex flex-col items-end gap-[3px] text-right md:col-start-3 md:row-start-1">{value}</span>
      <Go className="absolute top-1/2 right-[8px] -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </button>
  );
}
