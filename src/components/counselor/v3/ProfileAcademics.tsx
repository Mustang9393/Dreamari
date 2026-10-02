"use client";

// Counselor Dashboard v3 (29 Sept 2026): the Student Profile's school
// record, on the imagined integration (src/lib/counselorSis.ts, all mock).
// Three pieces:
// - SchoolRecordStrip: GPA, credits, attendance and behavior as one quiet
//   row at the top of the profile's Overview tab, the four numbers a
//   counselor checks before any conversation.
// - ProfileAcademics: the Academics tab. This semester's grades and the
//   graduation audit side by side (the two things a schedule change or a
//   recovery plan is decided from), then attendance, tests, career and
//   technical, readiness, and the transcript folded by year.
// - ProfileApplications: a senior's colleges and school documents.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, TrendingDown, TrendingUp, X } from "lucide-react";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { CHRONIC_ABSENCE, sisFor, type Letter } from "@/lib/counselorSis";
import { GLASS_INSET } from "../surfaces";
import { Disclosure } from "./Disclosure";
import { BTN, BTN_STYLE, Card, CardTitle, Empty, SyncBadge, Verdict } from "./kit";
import { CollegeTable, useSeniorFiles } from "./Applications";
import { Tip } from "@/components/app/IconTip";
import { useV3Extras } from "@/components/counselor/v3Extras";

const LETTER_COLOR: Record<Letter, string> = { A: "var(--foreground)", B: "var(--foreground)", C: "var(--foreground)", D: "var(--cd-amber)", F: "var(--cd-red)" };

function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "warn" | "bad" }) {
  return (
    <div className="flex min-w-0 flex-col gap-[4px] rounded-[var(--radius-md)] border px-[14px] py-[12px]" style={GLASS_INSET}>
      <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: tone === "bad" ? "var(--cd-red)" : tone === "warn" ? "var(--cd-amber)" : "var(--foreground)" }}>{value}</span>
      <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>
    </div>
  );
}

export function SchoolRecordStrip({ student, onOpen }: { student: CounselorStudent; onOpen: () => void }) {
  const r = sisFor(student);
  const behind = r.credits.expected - r.credits.earned;
  return (
    <Card>
      <CardTitle title="School record" aside={<span className="flex items-center gap-[12px]"><SyncBadge /><button type="button" onClick={onOpen} className={BTN} style={BTN_STYLE}>Academics</button></span>} />
      <div className="grid grid-cols-2 gap-[var(--space-2)] lg:grid-cols-4">
        <Kpi label="GPA" value={r.gpa.toFixed(2)} note={`${r.weightedGpa.toFixed(2)} weighted`} tone={r.gpa < 2 ? "bad" : r.gpa < 2.5 ? "warn" : undefined} />
        <Kpi label="Credits" value={`${r.credits.earned} / ${r.credits.required}`} note={behind > 0 ? `${behind} behind` : "On track to graduate"} tone={behind > 0 ? (student.grade >= 11 ? "bad" : "warn") : undefined} />
        <Kpi label="Attendance" value={`${r.attendance.rate}%`} note={`${r.attendance.absences} days missed this fall`} tone={r.attendance.rate < 85 ? "bad" : r.attendance.rate < CHRONIC_ABSENCE ? "warn" : undefined} />
        <Kpi label="Behavior" value={String(r.behavior.incidents)} note={r.behavior.last ? `${r.behavior.last.type}` : "No incidents this fall"} tone={r.behavior.incidents >= 3 ? "bad" : r.behavior.incidents >= 2 ? "warn" : undefined} />
      </div>
    </Card>
  );
}

export function ProfileAcademics({ student }: { student: CounselorStudent }) {
  const router = useRouter();
  const r = sisFor(student);
  const [openYear, setOpenYear] = useState<number | null>(null);
  const failing = r.courses.filter((c) => c.letter === "F" || c.letter === "D");
  const readyCount = r.readiness.filter((p) => p.met).length;
  const maxWeek = 100;
  // Areas behind pace for this grade (the same rule Academics uses), so the
  // audit's verdict names where the gap is instead of restating the credit
  // count the School record strip already shows.
  const short = r.requirements.filter((q) => q.area !== "Elective" && q.earned + q.inProgress < q.required * ((student.grade - 8) / 4) - 0.01).map((q) => q.area);
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card>
          <CardTitle title="This semester" unit="Fall 2026, week 6" aside={failing.length ? <button type="button" onClick={() => router.push(`/counselor?view=productivity&doc=success-plan&student=${student.id}`)} className={BTN} style={BTN_STYLE}>Success plan</button> : undefined} />
          <Verdict tone={failing.some((c) => c.letter === "F") ? "bad" : failing.length ? "warn" : "good"}>{failing.length ? `${failing.map((c) => c.name).join(" and ")} ${failing.length === 1 ? "needs" : "need"} attention` : "Passing every course"}</Verdict>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead>
                <tr className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>
                  <th className="py-[6px] pr-[12px] font-bold">Per.</th>
                  <th className="py-[6px] pr-[12px] font-bold">Course</th>
                  <th className="py-[6px] pr-[12px] font-bold">Teacher</th>
                  <th className="py-[6px] pr-[12px] text-right font-bold">Grade</th>
                  <th className="py-[6px] text-right font-bold">4 weeks</th>
                </tr>
              </thead>
              <tbody>
                {r.courses.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: "var(--glass-border)" }}>
                    <td className="py-[9px] pr-[12px] text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{c.period}</td>
                    <td className="py-[9px] pr-[12px]">
                      <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
                      {c.level !== "Regular" && !c.name.startsWith(c.level) && <span className="ml-[6px] text-[11px] font-bold" style={{ color: "var(--primary)" }}>{c.level}</span>}
                    </td>
                    <td className="py-[9px] pr-[12px] text-[12.5px] font-semibold whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{c.teacher}</td>
                    <td className="py-[9px] pr-[12px] text-right text-[13px] font-extrabold tabular-nums whitespace-nowrap" style={{ color: LETTER_COLOR[c.letter] }}>{c.letter} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.pct}%</span></td>
                    <td className="py-[9px] text-right">
                      <span className="inline-flex items-center gap-[3px] text-[12px] font-bold tabular-nums" style={{ color: c.trend < -3 ? "var(--cd-amber)" : "var(--muted-foreground)" }}>
                        {c.trend >= 0 ? <TrendingUp className="h-[12px] w-[12px]" aria-hidden /> : <TrendingDown className="h-[12px] w-[12px]" aria-hidden />}
                        {c.trend > 0 ? "+" : ""}{c.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 2 Oct 2026 redundancy pass: the "N of 24 credits" unit and the
           "N credits behind" verdict repeated the School record strip; the
           verdict now names the short areas. Eight label+bar rows became one
           credit matrix: a dot per required credit (filled earned, soft this
           semester, empty still needed), since credits are small whole
           counts, not percentages. Exact numbers sit in each row's tooltip. */}
        <Card>
          <CardTitle title="Graduation audit" />
          <Verdict tone={r.onTrackToGraduate ? "good" : "bad"}>{r.onTrackToGraduate ? "Every area on pace" : short.length ? `Short in ${short.slice(0, 2).join(" and ")}` : "A failed core course to recover"}</Verdict>
          <ul className="flex flex-col gap-[9px]">
            {r.requirements.map((q) => (
              <li key={q.area} className="grid grid-cols-[10.5rem_1fr] items-center gap-x-[12px]">
                <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{q.area}</span>
                <Tip label={`${q.earned} earned${q.inProgress ? `, ${q.inProgress} this semester` : ""}, of ${q.required}`} className="w-fit">
                  <span role="img" aria-label={`${q.area}: ${q.earned} earned${q.inProgress ? `, ${q.inProgress} this semester` : ""}, of ${q.required}`} className="flex gap-[4px]" tabIndex={0}>
                    {Array.from({ length: q.required }, (_, i) => <CreditDot key={i} earned={Math.max(0, Math.min(1, q.earned - i))} now={Math.max(0, Math.min(1, q.earned + q.inProgress - i)) - Math.max(0, Math.min(1, q.earned - i))} />)}
                  </span>
                </Tip>
              </li>
            ))}
          </ul>
          <span className="flex flex-wrap gap-x-[14px] gap-y-[4px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-[6px]"><CreditDot earned={1} now={0} />Earned</span>
            <span className="flex items-center gap-[6px]"><CreditDot earned={0} now={1} />This semester</span>
            <span className="flex items-center gap-[6px]"><CreditDot earned={0} now={0} />Still needed</span>
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-3">
        <Card>
          {/* 2 Oct 2026 redundancy pass: the rate, the absences and the
             behavior footer all repeated the School record strip (incident
             count and last type live there). Kept what only this card has:
             tardies and the week-by-week columns. */}
          <CardTitle title="Attendance" unit="last six weeks" aside={<span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.attendance.tardies} {r.attendance.tardies === 1 ? "tardy" : "tardies"}</span>} />
          <div className="flex h-[64px] items-end gap-[6px]" role="img" aria-label={`Weekly attendance: ${r.attendance.weeks.join("%, ")}%`}>
            {r.attendance.weeks.map((w, i) => (
              <span key={i} className="flex h-full flex-1 flex-col justify-end">
                <span className="block rounded-t-[4px]" style={{ height: `${Math.max(8, ((w - 60) / (maxWeek - 60)) * 100)}%`, background: `linear-gradient(180deg, ${w < CHRONIC_ABSENCE ? "var(--cd-amber)" : "var(--primary)"}, color-mix(in srgb, ${w < CHRONIC_ABSENCE ? "var(--cd-amber)" : "var(--primary)"} 30%, transparent))` }} />
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Tests" />
          {r.tests.length === 0 ? <Empty>First state test is PSAT 8/9 in the spring.</Empty> : (
            <ul className="flex flex-col gap-[10px]">
              {r.tests.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-[10px]">
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{t.name}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.when} · benchmark {t.benchmark}</span>
                  </span>
                  <span className="flex items-center gap-[6px] text-[15px] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>
                    {t.score}
                    {t.met ? <Check className="h-[14px] w-[14px]" aria-label="meets benchmark" style={{ color: "var(--cd-green)" }} /> : <X className="h-[14px] w-[14px]" aria-label="below benchmark" style={{ color: "var(--cd-amber)" }} />}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle title="College and career ready" unit={`${readyCount} of ${r.readiness.length}`} />
          <ul className="flex flex-col gap-[8px]">
            {r.readiness.map((p) => (
              <li key={p.id} className="flex items-start gap-[8px] text-[12.5px] leading-[17px] font-semibold" style={{ color: p.met ? "var(--foreground)" : "var(--muted-foreground)" }}>
                {p.met ? <Check className="mt-[2px] h-[13px] w-[13px] flex-none" aria-hidden style={{ color: "var(--cd-green)" }} /> : <span aria-hidden className="mt-[5px] ml-[3px] size-[7px] flex-none rounded-full border" style={{ borderColor: "var(--muted-foreground)" }} />}
                {p.label}
              </li>
            ))}
          </ul>
          <span className="border-t pt-[10px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
            {r.cte.program}: {r.cte.courses.length} of 2 courses for concentrator{r.cte.wblHours ? ` · ${r.cte.wblHours} work-based hours` : ""}{r.cte.credential ? ` · ${r.cte.credential}` : ""}
          </span>
        </Card>
      </div>

      <Card>
        {/* 2 Oct 2026 redundancy pass: GPA and weighted GPA dropped from the
           unit; the School record strip is their home. */}
        <CardTitle title="Transcript" />
        {r.transcript.length === 0 ? <Empty>First semester of high school. The transcript starts in January.</Empty> : r.transcript.map((y) => (
          <Disclosure key={y.grade} id={`transcript-${y.grade}`} title={`Grade ${y.grade} · ${y.year}`} summary={`${y.courses.filter((c) => c.letter !== "F").reduce((n, c) => n + c.credits, 0)} credits · ${y.courses.map((c) => c.letter).join(" ")}`} open={openYear === y.grade} onToggle={() => setOpenYear(openYear === y.grade ? null : y.grade)}>
            <ul className="grid grid-cols-1 gap-x-[var(--space-5)] gap-y-[6px] sm:grid-cols-2">
              {y.courses.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-[10px] border-b pb-[6px] text-[12.5px]" style={{ borderColor: "var(--glass-border)" }}>
                  <span className="min-w-0 truncate font-semibold" style={{ color: "var(--foreground)" }}>{c.name}{c.level !== "Regular" && !c.name.startsWith(c.level) && <span className="ml-[6px] text-[11px] font-bold" style={{ color: "var(--primary)" }}>{c.level}</span>}</span>
                  <span className="flex-none font-extrabold tabular-nums" style={{ color: LETTER_COLOR[c.letter] }}>{c.letter} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.credits}</span></span>
                </li>
              ))}
            </ul>
          </Disclosure>
        ))}
      </Card>
    </div>
  );
}

export function ProfileApplications({ student }: { student: CounselorStudent }) {
  const router = useRouter();
  const files = useSeniorFiles(student);
  const extras = useV3Extras();
  return (
    <Card>
      <CardTitle title="Colleges and documents" aside={<SyncBadge label="Parchment and Common App · synced 7:15 AM" />} />
      {!files ? <Empty>{student.name.split(" ")[0]} has not added colleges yet.</Empty> : (
        <>
          <div className="overflow-x-auto"><CollegeTable files={files} /></div>
          <div className="flex flex-wrap gap-[8px]">
            <button type="button" onClick={() => router.push(`/counselor?view=productivity&doc=recommendation-letter&student=${student.id}`)} className={BTN} style={BTN_STYLE}>Open the letter</button>
            {/* The Applications screen sits behind the v3 extras toggle (2 Oct 2026). */}
            {extras && <button type="button" onClick={() => router.push("/counselor?view=applications")} className={BTN} style={BTN_STYLE}>All applications</button>}
          </div>
        </>
      )}
    </Card>
  );
}

/** One required credit: filled for earned, soft blue for this semester,
 *  an empty track for still needed. Half credits (PE) fill half a dot. */
function CreditDot({ earned, now }: { earned: number; now: number }) {
  const e = Math.round(earned * 100);
  const n = Math.round((earned + now) * 100);
  return (
    <span aria-hidden className="block size-[12px] flex-none rounded-full" style={{ background: `linear-gradient(90deg, var(--primary) 0 ${e}%, color-mix(in srgb, var(--primary) 38%, transparent) ${e}% ${n}%, color-mix(in srgb, var(--foreground) 12%, transparent) ${n}% 100%)` }} />
  );
}
