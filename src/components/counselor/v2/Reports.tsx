"use client";

// DEMO-ONLY v2: Reports (School Administrator and District Administrator).
// Five report templates built from the live numbers; Generate downloads a
// CSV of the current figures (the same export idiom Student Progress uses),
// and the generated list is kept for the session. There is no report
// service in this prototype; the shape (template, scope, generated at,
// download) is what a backend fills in.

import { useMemo, useState, useSyncExternalStore } from "react";
import { CalendarClock, Download, FileBarChart, Trash2 } from "lucide-react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { DISTRICT_NAME, HOME_ENGAGEMENT, SCHOOL_TARGETS, TARGET_LABELS, counselorFor, districtRollup, districtSchools, readinessMetrics, schoolTargetValue, type TargetKey } from "@/lib/counselorOrg";
import { CAREER_TRACKS } from "@/lib/counselorRoster";
import { GLASS_CARD, GLASS_INSET } from "../surfaces";
import { Listbox } from "@/components/app/Listbox";
import { addSchedule, nextRunLabel, readSchedules, removeSchedule, type ReportSchedule } from "@/lib/counselorCasefile";

type Template = { id: string; title: string; line: string; rows: (ctx: Ctx) => string[][] };
type Ctx = { roster: ReturnType<typeof useReviewedRoster>; district: boolean };

const KEYS: TargetKey[] = ["onTrack", "plansOnFile", "seniorPlan", "fafsa", "activeStudents"];

const TEMPLATES: Template[] = [
  {
    id: "readiness", title: "Readiness against targets", line: "Each target, the current value and the gap",
    rows: ({ roster, district }) => {
      const whole = district ? districtRollup(districtSchools(roster)) : districtSchools(roster)[0];
      return [["Target", "Value %", "Target %", "Gap"], ...KEYS.map((k) => { const v = schoolTargetValue(whole, k); return [TARGET_LABELS[k], String(v), String(SCHOOL_TARGETS[k]), String(v - SCHOOL_TARGETS[k])]; })];
    },
  },
  {
    id: "by-grade", title: "Readiness by grade", line: "On track, plans and senior measures for each grade",
    rows: ({ roster }) => [["Grade", "Students", "On track %", "Plans on file %", "Senior plan %", "FAFSA %"], ...[9, 10, 11, 12].map((g) => { const m = readinessMetrics(roster.filter((s) => s.grade === g)); return [String(g), String(m.students), String(m.onTrackPct), String(m.withPlanPct), m.seniors ? String(m.seniorPlanPct) : "", m.seniors ? String(m.fafsaPct) : ""]; })],
  },
  {
    id: "by-school", title: "Readiness by school", line: "Every school in the district against the five targets",
    rows: ({ roster }) => [["School", "Students", ...KEYS.map((k) => `${TARGET_LABELS[k]} %`)], ...districtSchools(roster).map((s) => [s.name, String(s.students), ...KEYS.map((k) => String(schoolTargetValue(s, k)))])],
  },
  {
    id: "by-counselor", title: "Caseloads by counselor", line: "Students, on track, pending reviews and overdue work per counselor",
    rows: ({ roster }) => {
      const byId = new Map<string, typeof roster>();
      for (const s of roster) { const c = counselorFor(s); byId.set(c.name, [...(byId.get(c.name) ?? []), s]); }
      return [["Counselor", "Students", "On track %", "Plans on file %", "Pending reviews", "Overdue"], ...[...byId.entries()].map(([name, list]) => { const m = readinessMetrics(list); return [name, String(m.students), String(m.onTrackPct), String(m.withPlanPct), String(m.pendingReviews), String(m.overdue)]; })];
    },
  },
  {
    id: "equity", title: "Equity by pathway", line: "On-track rate for each career pathway",
    rows: ({ roster }) => [["Pathway", "Students", "On track %", "Plans on file %"], ...CAREER_TRACKS.map((t) => { const m = readinessMetrics(roster.filter((s) => s.careerTrack === t)); return [t, String(m.students), String(m.onTrackPct), String(m.withPlanPct)]; })],
  },
  {
    id: "engagement", title: "Platform engagement", line: "Students active this month and logins per student",
    rows: ({ roster, district }) => district
      ? [["School", "Students", "Active this month", "Active %", "Logins per student"], ...districtSchools(roster).map((s) => [s.name, String(s.students), String(s.activeStudents), String(s.activePct), String(s.avgLogins)])]
      : [["Measure", "Value"], ["Students", String(roster.length)], ["Active this month", String(Math.round(roster.length * HOME_ENGAGEMENT.activeShare))], ["Active weekly", String(HOME_ENGAGEMENT.weeklyActive)], ["Logins per student", String(HOME_ENGAGEMENT.avgLogins)]],
  },
];

function downloadCsv(name: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Reports() {
  const roster = useReviewedRoster();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const district = account.role === "District Administrator";
  const scope = district ? DISTRICT_NAME : DEMO_SCHOOL;
  const templates = useMemo(() => TEMPLATES.filter((t) => (district ? t.id !== "by-counselor" && t.id !== "by-grade" : t.id !== "by-school")), [district]);
  const [generated, setGenerated] = useState<{ id: string; title: string; at: Date }[]>([]);
  // Scheduled delivery, mocked from the SchooLinks Report Center (25 Sept
  // 2026): pick a template, a cadence and recipients; the list is what a
  // backend job would run. No mail is sent here.
  const [schedules, setSchedules] = useState<ReportSchedule[]>(() => readSchedules());
  const [scheduling, setScheduling] = useState<Template | null>(null);
  const [cadence, setCadence] = useState<"weekly" | "monthly">("weekly");
  const [day, setDay] = useState("Monday");
  const [recipients, setRecipients] = useState(account.name ? `${account.name.toLowerCase().replace(/\s+/g, ".")}@lincolnhs.edu` : "");
  const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  const FIELD = "flex h-9 min-w-[120px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";

  const generate = (t: Template) => {
    downloadCsv(`${t.id}-${new Date().toISOString().slice(0, 10)}`, t.rows({ roster, district }));
    setGenerated((g) => [{ id: `${t.id}-${Date.now()}`, title: t.title, at: new Date() }, ...g]);
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Templates <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{scope} · today&apos;s numbers</span></h2>
        <ul className="flex flex-col gap-[6px]">
          {templates.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={GLASS_INSET}>
              <span className="flex min-w-0 flex-col">
                <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{t.title}</span>
                <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.line}</span>
              </span>
              <span className="flex flex-none items-center gap-[6px]">
                <button type="button" onClick={() => generate(t)} className="dm-quiet flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <Download className="h-[14px] w-[14px]" aria-hidden /> CSV
                </button>
                <button type="button" onClick={() => { setScheduling(scheduling?.id === t.id ? null : t); setCadence("weekly"); setDay("Monday"); }} aria-expanded={scheduling?.id === t.id} className="dm-quiet flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <CalendarClock className="h-[14px] w-[14px]" aria-hidden /> Schedule
                </button>
              </span>
              {scheduling?.id === t.id && (
                <form className="flex w-full flex-wrap items-center gap-[8px] border-t pt-[10px]" style={{ borderColor: "var(--glass-border)" }} onSubmit={(e) => { e.preventDefault(); setSchedules(addSchedule({ templateId: t.id, title: t.title, cadence, day, recipients: recipients.trim() || "you" })); setScheduling(null); }}>
                  <Listbox ariaLabel="Cadence" value={cadence} onChange={(v) => { setCadence(v as "weekly" | "monthly"); setDay(v === "weekly" ? "Monday" : "1st"); }} options={[{ value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }]} className={FIELD} style={fieldStyle} />
                  <Listbox ariaLabel="Day" value={day} onChange={setDay} options={(cadence === "weekly" ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] : ["1st", "15th", "Last day"]).map((d) => ({ value: d, label: d }))} className={FIELD} style={fieldStyle} />
                  <input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="Email recipients" aria-label="Recipients" className="h-9 min-w-[220px] flex-1 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle} />
                  <button type="submit" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">Save schedule</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}><CalendarClock className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} />Scheduled <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>emailed as CSV</span></h2>
        {schedules.length === 0 ? (
          <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing scheduled. Use Schedule on a template above.</p>
        ) : (
          <ul className="flex flex-col gap-[6px]">
            {schedules.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[4px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={GLASS_INSET}>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{nextRunLabel(r)} · to {r.recipients}</span>
                </span>
                <button type="button" onClick={() => setSchedules(removeSchedule(r.id))} aria-label="Remove schedule" className="dm-quiet flex size-[28px] flex-none cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "var(--muted-foreground)" }}><Trash2 className="h-[13px] w-[13px]" aria-hidden /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}><FileBarChart className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} />Generated this session</h2>
        {generated.length === 0 ? (
          <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing generated yet.</p>
        ) : (
          <ul className="flex flex-col gap-[6px]">
            {generated.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={GLASS_INSET}>
                <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{g.title}</span>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{g.at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
