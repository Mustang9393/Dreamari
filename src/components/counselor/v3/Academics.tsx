"use client";

// Counselor Dashboard v3 (29 Sept 2026): Academics, new, on the imagined
// school integration (src/lib/counselorSis.ts, all mock).
//
// Why: the research's first counselor job is triage, and the evidence it
// names is the ABCs (attendance, behavior, course performance), which only
// the school's records carry. Until now the dashboard could only say
// "behind on the Dreamari plan". With the SIS connected, four questions a
// counselor answers every week get one tab each:
// - Early warning: who is slipping on attendance, behavior or grades now.
// - Graduation: who is short on credits, and in which area.
// - Career and technical: concentrators, work-based learning, credentials
//   (Perkins V counts a concentrator at two courses in one program).
// - State readiness: seniors against a college and career readiness
//   indicator modeled on Illinois' (GPA 2.8, 90% attendance, an academic
//   and a career marker).
// Each tab: one hero with the answer, then the students behind it, most
// in need first, each one click from their profile's Academics tab.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { CHRONIC_ABSENCE, FLAG_LABEL, flagScore, sisFor, type Flag, type SisRecord } from "@/lib/counselorSis";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { MetricRow } from "./overviewShared";
import { SubTabs } from "./SubTabs";
import { ShowAll } from "./Disclosure";
import { BigStat, BTN, BTN_STYLE, Card, CardTitle, Empty, HeroCard, RowList, StudentRow, SyncBadge, Tile, Verdict } from "./kit";

type Tab = "warning" | "graduation" | "cte" | "readiness";
type Row = { s: CounselorStudent; r: SisRecord };

const READY_TARGET = 60;

export function Academics() {
  const router = useRouter();
  const roster = useReviewedRoster();
  const rows: Row[] = useMemo(() => roster.map((s) => ({ s, r: sisFor(s) })), [roster]);
  const [tab, setTab] = useState<Tab>("warning");
  const flagged = rows.filter((x) => x.r.flags.length);
  const offTrack = rows.filter((x) => !x.r.onTrackToGraduate);
  const seniors = rows.filter((x) => x.s.grade === 12);
  const ready = seniors.filter((x) => x.r.readiness.every((p) => p.met));

  const profile = (s: CounselorStudent) => router.push(`/counselor?view=students&studentId=${s.id}&tab=academics`);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-end justify-between gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
        <div className="min-w-0 flex-1">
          <SubTabs
            ariaLabel="Academics"
            value={tab}
            onChange={setTab}
            options={[
              { key: "warning", label: "Early warning", count: flagged.length },
              { key: "graduation", label: "Graduation", count: offTrack.length },
              { key: "cte", label: "Career and technical" },
              { key: "readiness", label: "State readiness" },
            ]}
          />
        </div>
        <SyncBadge />
      </div>
      {tab === "warning" && <EarlyWarning rows={rows} flagged={flagged} onOpen={profile} onBrief={(s) => router.push(`/counselor?view=productivity&doc=student-brief&student=${s.id}`)} />}
      {tab === "graduation" && <Graduation rows={rows} offTrack={offTrack} onOpen={profile} onPlan={(s) => router.push(`/counselor?view=productivity&doc=success-plan&student=${s.id}`)} />}
      {tab === "cte" && <CareerTechnical rows={rows} onOpen={profile} />}
      {tab === "readiness" && <Readiness seniors={seniors} ready={ready} rows={rows} onOpen={profile} />}
    </div>
  );
}

// ---- Early warning ---------------------------------------------------------

function EarlyWarning({ rows, flagged, onOpen, onBrief }: { rows: Row[]; flagged: Row[]; onOpen: (s: CounselorStudent) => void; onBrief: (s: CounselorStudent) => void }) {
  const [kind, setKind] = useState<Flag["kind"] | "all">("all");
  const [all, setAll] = useState(false);
  const count = (k: Flag["kind"]) => flagged.filter((x) => x.r.flags.some((f) => f.kind === k)).length;
  const multi = flagged.filter((x) => new Set(x.r.flags.map((f) => f.kind)).size >= 2).length;
  const list = flagged.filter((x) => kind === "all" || x.r.flags.some((f) => f.kind === kind)).sort((a, b) => flagScore(b.r) - flagScore(a.r));
  const shown = all ? list : list.slice(0, 8);
  const avgAttendance = Math.round((rows.reduce((n, x) => n + x.r.attendance.rate, 0) / (rows.length || 1)) * 10) / 10;
  return (
    <>
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <HeroCard>
            <CardTitle title="Early warning" unit="attendance, behavior, course performance" />
            <div className="flex flex-wrap items-end gap-x-[var(--space-6)] gap-y-[var(--space-3)]">
              <BigStat value={String(flagged.length)} label={`of ${rows.length} students with a signal`} />
              <Verdict tone={multi ? "warn" : "good"}>{multi ? `Focus first: ${multi} with two or more signals` : "No student has more than one signal"}</Verdict>
            </div>
            <div className="grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-4">
              {(["attendance", "behavior", "course", "credits"] as Flag["kind"][]).map((k) => (
                <Tile key={k} label={FLAG_LABEL[k]} value={String(count(k))} note={k === "attendance" ? `under ${CHRONIC_ABSENCE}%` : k === "course" ? "D or F now" : k === "behavior" ? "2+ incidents" : "behind"} active={kind === k} onClick={() => { setKind(kind === k ? "all" : k); setAll(false); }} />
              ))}
            </div>
          </HeroCard>
          <Card>
            <CardTitle title="School-wide" unit="this fall" />
            <div className="flex flex-col gap-[var(--space-3)]">
              <MetricRow label="Average attendance" value={avgAttendance} target={95} display={`${avgAttendance}%`} />
              <MetricRow label="Not chronically absent" value={Math.round(((rows.length - count("attendance")) / (rows.length || 1)) * 100)} target={90} />
              <MetricRow label="Passing every course" value={Math.round(((rows.length - rows.filter((x) => x.r.courses.some((c) => c.letter === "F")).length) / (rows.length || 1)) * 100)} target={95} />
            </div>
          </Card>
        </div>
      </div>
      <Card>
        <CardTitle title={kind === "all" ? "Students with a signal" : FLAG_LABEL[kind]} unit={`${list.length}, most signals first`} aside={kind !== "all" ? <button type="button" onClick={() => setKind("all")} className={BTN} style={BTN_STYLE}>Show all signals</button> : undefined} />
        {list.length === 0 ? <Empty>No student has this signal.</Empty> : (
          <RowList>
            {shown.map(({ s, r }) => {
              const top = r.flags.find((f) => kind === "all" || f.kind === kind) ?? r.flags[0];
              const more = r.flags.length - 1;
              return (
                <StudentRow key={s.id} student={s} onOpen={() => onOpen(s)}
                  note={<>{top.text}{more > 0 && <span style={{ color: "var(--muted-foreground)" }}> · {more} more</span>}</>}
                  right={<><span aria-hidden className="size-[8px] rounded-full" style={{ background: top.severity === 3 ? "var(--cd-red)" : "var(--cd-amber)" }} />{r.flags.length} {r.flags.length === 1 ? "signal" : "signals"}</>}
                  action={<button type="button" onClick={() => onBrief(s)} className={BTN} style={BTN_STYLE}>Meeting brief</button>}
                />
              );
            })}
          </RowList>
        )}
        {list.length > 8 && <ShowAll total={list.length} shown={8} open={all} onToggle={() => setAll((v) => !v)} />}
      </Card>
    </>
  );
}

// ---- Graduation ------------------------------------------------------------

function Graduation({ rows, offTrack, onOpen, onPlan }: { rows: Row[]; offTrack: Row[]; onOpen: (s: CounselorStudent) => void; onPlan: (s: CounselorStudent) => void }) {
  const byGrade = [9, 10, 11, 12].map((g) => {
    const inG = rows.filter((x) => x.s.grade === g);
    const on = inG.filter((x) => x.r.onTrackToGraduate).length;
    return { g, n: inG.length, pct: inG.length ? Math.round((on / inG.length) * 100) : 0 };
  });
  const list = [...offTrack].sort((a, b) => b.s.grade - a.s.grade || (b.r.credits.expected - b.r.credits.earned) - (a.r.credits.expected - a.r.credits.earned));
  const seniorsOff = offTrack.filter((x) => x.s.grade === 12).length;
  return (
    <>
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-2">
          <HeroCard>
            <CardTitle title="On track to graduate" unit="credits earned vs expected" />
            <BigStat value={`${Math.round(((rows.length - offTrack.length) / (rows.length || 1)) * 100)}%`} label={`${rows.length - offTrack.length} of ${rows.length} students`} />
            <Verdict tone={seniorsOff ? "bad" : offTrack.length ? "warn" : "good"}>{seniorsOff ? `${seniorsOff} ${seniorsOff === 1 ? "senior needs" : "seniors need"} credit recovery this year` : offTrack.length ? `${offTrack.length} underclassmen behind, time to recover` : "Every student is on track"}</Verdict>
          </HeroCard>
          <Card>
            <CardTitle title="By grade" unit="target 95%" />
            <div className="flex flex-col gap-[var(--space-3)]">
              {byGrade.map((x) => <MetricRow key={x.g} label={`Grade ${x.g}`} note={`${x.n} students`} value={x.g === 9 ? null : x.pct} target={95} display={x.g === 9 ? "First year" : undefined} />)}
            </div>
          </Card>
        </div>
      </div>
      <Card>
        <CardTitle title="Behind on credits" unit="seniors first" />
        {list.length === 0 ? <Empty>No student is behind on credits.</Empty> : (
          <RowList>
            {list.map(({ s, r }) => {
              const short = r.requirements.filter((q) => q.earned + q.inProgress < q.required * ((s.grade - 8) / 4) - 0.01 && q.area !== "Elective").map((q) => q.area);
              return (
                <StudentRow key={s.id} student={s} onOpen={() => onOpen(s)}
                  note={`${r.credits.expected - r.credits.earned} behind · ${short.length ? `short in ${short.slice(0, 2).join(", ")}` : "failed a core course"}`}
                  right={<span className="tabular-nums">{r.credits.earned} / {r.credits.required}</span>}
                  action={<button type="button" onClick={() => onPlan(s)} className={BTN} style={BTN_STYLE}>Recovery plan</button>}
                />
              );
            })}
          </RowList>
        )}
      </Card>
    </>
  );
}

// ---- Career and technical --------------------------------------------------

function CareerTechnical({ rows, onOpen }: { rows: Row[]; onOpen: (s: CounselorStudent) => void }) {
  const upper = rows.filter((x) => x.s.grade >= 11);
  const concentrators = upper.filter((x) => x.r.cte.concentrator);
  const credentials = rows.filter((x) => x.r.cte.credential);
  const wbl = upper.reduce((n, x) => n + x.r.cte.wblHours, 0);
  const programs = new Map<string, { n: number; conc: number }>();
  for (const x of upper) {
    const p = programs.get(x.r.cte.program) ?? { n: 0, conc: 0 };
    p.n++;
    if (x.r.cte.concentrator) p.conc++;
    programs.set(x.r.cte.program, p);
  }
  const ranked = [...programs.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 6);
  const oneAway = upper.filter((x) => x.r.cte.courses.length === 1).sort((a, b) => b.s.grade - a.s.grade);
  return (
    <>
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-2">
          <HeroCard>
            <CardTitle title="Career and technical education" unit="Grades 11 and 12" />
            <div className="grid grid-cols-3 gap-[var(--space-4)]">
              <BigStat value={`${concentrators.length}`} label={`concentrators of ${upper.length}`} />
              <BigStat value={`${credentials.length}`} label="industry credentials" />
              <BigStat value={wbl.toLocaleString()} label="work-based learning hours" />
            </div>
            <Verdict tone={oneAway.length ? "info" : "good"}>{oneAway.length ? `${oneAway.length} ${oneAway.length === 1 ? "student is" : "students are"} one course from concentrator` : "Every junior and senior is a concentrator"}</Verdict>
          </HeroCard>
          <Card>
            <CardTitle title="Programs of study" unit="concentrators of students" />
            <div className="flex flex-col gap-[var(--space-3)]">
              {ranked.map(([name, p]) => <MetricRow key={name} label={name} note={`${p.n} students`} value={Math.round((p.conc / p.n) * 100)} target={50} display={`${p.conc} of ${p.n}`} />)}
            </div>
          </Card>
        </div>
      </div>
      <Card>
        <CardTitle title="One course from concentrator" unit="plan the second course at registration" />
        {oneAway.length === 0 ? <Empty>No student is one course away.</Empty> : (
          <RowList>
            {oneAway.slice(0, 12).map(({ s, r }) => (
              <StudentRow key={s.id} student={s} onOpen={() => onOpen(s)} note={`${r.cte.program} · took ${r.cte.courses[0]}`} right={r.cte.wblHours ? <span>{r.cte.wblHours} WBL hrs</span> : undefined} />
            ))}
          </RowList>
        )}
      </Card>
    </>
  );
}

// ---- State readiness -------------------------------------------------------

function Readiness({ seniors, ready, rows, onOpen }: { seniors: Row[]; ready: Row[]; rows: Row[]; onOpen: (s: CounselorStudent) => void }) {
  const pct = seniors.length ? Math.round((ready.length / seniors.length) * 100) : 0;
  const parts = seniors[0]?.r.readiness.map((p) => p.id) ?? [];
  const partPct = (id: string) => Math.round((seniors.filter((x) => x.r.readiness.find((p) => p.id === id)?.met).length / (seniors.length || 1)) * 100);
  const oneShort = seniors.filter((x) => x.r.readiness.filter((p) => !p.met).length === 1);
  const juniors = rows.filter((x) => x.s.grade === 11);
  const juniorsPct = juniors.length ? Math.round((juniors.filter((x) => x.r.readiness.every((p) => p.met)).length / juniors.length) * 100) : 0;
  return (
    <>
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-2">
          <HeroCard>
            <CardTitle title="College and career ready" unit="seniors, modeled on Illinois' indicator" />
            <div className="flex flex-wrap items-end gap-x-[var(--space-6)] gap-y-[var(--space-3)]">
              <BigStat value={`${pct}%`} label={`${ready.length} of ${seniors.length} seniors · target ${READY_TARGET}%`} tone={pct < READY_TARGET - 10 ? "bad" : pct < READY_TARGET ? "warn" : undefined} />
              <BigStat value={`${juniorsPct}%`} label="juniors, a year out" />
            </div>
            <Verdict tone={oneShort.length ? "info" : "good"}>{oneShort.length ? `${oneShort.length} ${oneShort.length === 1 ? "senior is" : "seniors are"} one requirement away` : "No senior is one requirement away"}</Verdict>
          </HeroCard>
          <Card>
            <CardTitle title="Each requirement" unit="seniors meeting it" />
            <div className="flex flex-col gap-[var(--space-3)]">
              {parts.map((id) => <MetricRow key={id} label={seniors[0].r.readiness.find((p) => p.id === id)!.label} value={partPct(id)} target={READY_TARGET} />)}
            </div>
          </Card>
        </div>
      </div>
      <Card>
        <CardTitle title="One requirement away" unit="the fastest wins" />
        {oneShort.length === 0 ? <Empty>No senior is one requirement away.</Empty> : (
          <RowList>
            {oneShort.map(({ s, r }) => (
              <StudentRow key={s.id} student={s} onOpen={() => onOpen(s)} note={`Missing: ${r.readiness.find((p) => !p.met)!.label}`} />
            ))}
          </RowList>
        )}
      </Card>
    </>
  );
}
