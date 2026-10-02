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
// - One hero: Career + Postsecondary Report Completion, the first milestone.
// - Each KPI card carries a bar with a tick at its launch baseline (the same
//   KpiCardButton as the Overview), so the gain reads as a gap, not just a
//   number. Follow-Up Coverage's helper sentence is in its drill's lead.
// - Arriving from an Overview status bar (?status=...) pre-sets the status
//   filter, as in the Replit. Changing the filter does not rewrite the URL.
// - The table is a stacked list below md instead of a horizontally scrolling table.

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Listbox } from "@/components/app/Listbox";
import { Go } from "@/components/counselor/chips";
import { GLASS_INSET } from "@/components/counselor/surfaces";
import { OverviewCard, InitialsBadge } from "../../overviewShared";
import { DrillPanel, DrillTile, type Drill } from "../../Drill";
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
import { ACADEMIC_YEAR_LABEL, Delta, FIELD, FIELD_STYLE, KpiCardButton, LABEL, StatusPill, num, useSchoolDetail } from "./schoolKit";

const COLS = "md:grid md:grid-cols-[minmax(0,1.9fr)_56px_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,2fr)_112px] md:items-center md:gap-x-[12px]";

export function SchoolProgress() {
  const params = useSearchParams();
  const detail = useSchoolDetail();
  const { studentProgress: sp, school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const [open, setOpen] = useState<SampleStudent | null>(null);

  const fromUrl = params.get("status");
  const [grade, setGrade] = useState<string>("all");
  const [counselor, setCounselor] = useState("all");
  const [group, setGroup] = useState<StudentGroupFilter>("all");
  const [status, setStatus] = useState<SupportStatus | "all">(SUPPORT_STATUSES.includes(fromUrl as SupportStatus) ? (fromUrl as SupportStatus) : "all");
  const [interest, setInterest] = useState<InterestArea | "all">("all");

  const rows = useMemo(
    () => filterSampleStudents(sp.sample.students, { grade: grade === "all" ? "all" : (Number(grade) as GradeFilter), counselor, group, status, interest }),
    [sp.sample.students, grade, counselor, group, status, interest],
  );
  const filtered = grade !== "all" || counselor !== "all" || group !== "all" || status !== "all" || interest !== "all";
  const clear = () => { setGrade("all"); setCounselor("all"); setGroup("all"); setStatus("all"); setInterest("all"); };
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
      <div className="grid grid-cols-2 gap-[var(--space-4)] md:grid-cols-3 xl:grid-cols-5">
        {sp.kpis.map((k, i) => (
          <KpiCardButton
            key={k.id}
            hero={i === 0}
            label={k.label}
            value={`${k.value}%`}
            onOpen={() => setDrill(kpiDrill(k))}
            className={i === 4 ? "col-span-2 md:col-span-1" : ""}
            delta={<Delta stack text={`+${k.delta} pts`} caption="vs launch" />}
            bar={{ value: k.value, baseline: k.baseline }}
          />
        ))}
      </div>

      <OverviewCard title={sp.experiences.title} unit="counts, not percentages">
        <p className="-mt-[8px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sp.experiences.subtitle}</p>
        <div className="grid grid-cols-2 gap-[8px] md:grid-cols-3 xl:grid-cols-5">
          {sp.experiences.tiles.map((t, i) => (
            <DrillTile
              key={t.id}
              onOpen={() => setDrill({ title: t.label, subtitle: sub, lead: t.helper, stats: [{ value: num(t.value), label: t.label }], itemsLabel: "About these counts", items: [sp.experiences.tooltipText] })}
              label={t.label}
              className={`gap-[4px] rounded-[var(--radius-md)] border p-[var(--space-4)] ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <span className="text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{num(t.value)}</span>
              <span className="text-[12.5px] leading-[16px] font-bold" style={{ color: "var(--foreground)" }}>{t.label}</span>
            </DrillTile>
          ))}
        </div>
      </OverviewCard>

      {/* The sample. Every filter here scopes this card only (see header). */}
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
