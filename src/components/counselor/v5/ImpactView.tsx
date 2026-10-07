"use client";

// My Impact (Chandu, 7 Oct 2026: "I think we're missing the my impact stuff?
// and also the use of time page can be designed so much better with more
// graphics"). v4's My Impact (the report a counselor hands a principal: did
// this period move the numbers?) and the use-of-time log, as one page in the
// order a principal reads it: outcomes against their targets, the work
// behind them, where the time went (ASCA's 80/20), the ASCA domains, then the
// benchmarks. One page with sections, not a second tab row under Analytics'
// own (the no-stacked-tabs rule). Export prints the whole page.

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Briefcase, ChevronDown, Clock, Heart, Printer, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { QUESTIONS } from "@/components/counselor/v4/CounselorConnect";
import { CountUp } from "@/components/counselor/v4/InsightCharts";
import { letterRequests } from "@/lib/counselorLetters";
import { isPast, seededMeetings, useAddedMeetings, useMeetingsDone } from "@/lib/counselorMeetings";
import { SCHOOL_TARGETS, TARGET_LABELS, readinessMetrics, type TargetKey } from "@/lib/counselorOrg";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { ASCA_TARGET_PCT, TIME_KIND_LABEL, hoursLabel, removeTime, summarize, useTimeLog, type TimeKind } from "@/lib/counselorTimeLog";
import { DrawRing, GradientBars } from "./charts";
import { openLog } from "./LogSheet";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
const INK: Record<TimeKind, string> = {
  direct: "var(--primary)",
  indirect: "color-mix(in srgb, var(--primary) 50%, var(--background))",
  support: "color-mix(in srgb, var(--foreground) 22%, transparent)",
};
const KINDS: TimeKind[] = ["direct", "indirect", "support"];
// DEMO-ONLY: comparators the backend will compute (v4 used the same).
const SCHOOL_AVERAGE_ON_TRACK = 71;
const REVIEW_DAYS = 2.1;
const REVIEW_STANDARD = 5;

function Title({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
      <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px] sm:leading-[30px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>
      {aside}
    </div>
  );
}

export function ImpactView() {
  const roster = useReviewedRoster();
  const m = readinessMetrics(roster);
  const done = useMeetingsDone();
  const added = useAddedMeetings();
  const now = new Date();

  // ---- outcomes against targets
  const outcomes: { key: TargetKey; value: number; count: number; of: number }[] = [
    { key: "onTrack", value: m.onTrackPct, count: m.onTrack, of: m.students },
    { key: "plansOnFile", value: m.withPlanPct, count: m.withPlan, of: m.students },
    { key: "seniorPlan", value: m.seniorPlanPct, count: m.seniorsCompliant, of: m.seniors },
    { key: "fafsa", value: m.fafsaPct, count: m.fafsaDone, of: m.seniors },
  ];
  const toGo = (o: (typeof outcomes)[number]) => Math.max(0, Math.ceil((SCHOOL_TARGETS[o.key] / 100) * o.of) - o.count);
  const met = outcomes.filter((o) => o.value >= SCHOOL_TARGETS[o.key]).length;

  // ---- the work behind them
  const reviewable = ["Career Report", "Academic Plan", "Resume"] as const;
  const reviewed = roster.reduce((n, s) => n + reviewable.filter((k) => s.milestones[k] === "Approved" || s.milestones[k] === "Changes Requested").length, 0);
  const approved = roster.reduce((n, s) => n + reviewable.filter((k) => s.milestones[k] === "Approved").length, 0);
  const answered = QUESTIONS.filter((q) => q.status === "responded" || q.status === "resolved").length;
  const answerPct = Math.round((answered / QUESTIONS.length) * 100);
  const meetings = useMemo(() => [...seededMeetings(roster, now), ...added], [roster, added]); // eslint-disable-line react-hooks/exhaustive-deps
  const held = meetings.filter((mt) => isPast(mt, now) || done[mt.id]).length;
  const walkIns = added.filter((mt) => mt.topic === "Walk-in").length;
  const letters = letterRequests(roster);
  const sent = letters.filter((l) => l.status === "sent").length;

  // ---- ASCA domains
  const total = roster.length || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const asca = [
    { icon: BookOpen, title: "Academic", items: [{ ring: pct(roster.filter((s) => s.milestones["Academic Plan"] === "Approved").length), label: "Four-year plans approved" }, { count: roster.length, label: "Students supported" }] },
    { icon: Briefcase, title: "Career", items: [{ ring: pct(roster.filter((s) => s.milestones["Career Report"] === "Approved").length), label: "Career reports done" }, { ring: m.withPlanPct, label: "Declared a pathway" }] },
    { icon: Heart, title: "Social-emotional", items: [{ count: roster.filter((s) => s.supportFlagReason).length, label: "Monitored for support" }, { ring: answerPct, label: "Questions answered" }] },
  ];

  return (
    <div className="flex flex-col gap-[64px]">
      {/* who, for which period, and the export */}
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-4)]">
          <Image src="/images/connect/avatars/pro-tanaka.jpg" alt="" width={112} height={112} className="size-[56px] rounded-full object-cover" style={{ objectPosition: "50% 20%" }} />
          <div className="flex flex-col">
            <span className="text-[20px] leading-[26px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>Sarah Chen</span>
            <span className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>School Counselor · Lincoln High School · Aug 2026 to Jan 2027</span>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="dm-quiet inline-flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
          <Printer className="h-4 w-4" aria-hidden /> Export report
        </button>
      </header>

      <section aria-label="Outcomes" className="flex flex-col gap-[var(--space-5)]">
        <Title aside={<span className={`text-[14px] font-semibold ${met === outcomes.length ? "v5-ok" : "v5-warn"}`}>{met} of {outcomes.length} targets met</span>}>Outcomes</Title>
        <div className="grid grid-cols-2 border-y lg:grid-cols-4" style={{ borderColor: RULE }}>
          {outcomes.map((o, i) => {
            const target = SCHOOL_TARGETS[o.key];
            const ok = o.value >= target;
            return (
              <div key={o.key} className={`flex flex-col gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-6)] sm:px-[var(--space-5)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} lg:border-l lg:first:border-l-0`} style={{ borderColor: RULE }}>
                <TargetRing pct={o.value} target={target} ok={ok} />
                <span className="text-[30px] leading-[34px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}><CountUp value={o.value} />%</span>
                <span className="text-[14px] leading-[18px] font-semibold">{TARGET_LABELS[o.key]}</span>
                <span className={`text-[13px] font-semibold ${ok ? "v5-ok" : "v5-warn"}`}>{ok ? `Target ${target}% met` : `${toGo(o)} to go for ${target}%`}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="My work" className="flex flex-col gap-[var(--space-5)]">
        <Title>My Work</Title>
        <dl className="grid grid-cols-1 gap-y-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-4">
          <Work value={reviewed} label="Plans reviewed" note={`${approved} approved, ${reviewed - approved} sent back`} ring={Math.round((approved / Math.max(1, reviewed)) * 100)} />
          <Work value={answered} label="Questions answered" note={`${answerPct}% of ${QUESTIONS.length} asked`} ring={answerPct} />
          <Work value={held} label="Meetings held" note={walkIns ? `${walkIns} walk-ins logged` : "Booked and walk-in"} />
          <Work value={sent} label="Letters sent" note={`${letters.length - sent} still to write`} ring={Math.round((sent / Math.max(1, letters.length)) * 100)} />
        </dl>
      </section>

      <TimeSection />

      <section aria-label="ASCA alignment" className="flex flex-col gap-[var(--space-5)]">
        <Title aside={<span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>ASCA National Model, 4th edition</span>}>ASCA Alignment</Title>
        <div className="grid grid-cols-1 gap-[var(--space-8)] md:grid-cols-3 md:gap-0">
          {asca.map((d, i) => (
            <div key={d.title} className={`flex flex-col gap-[var(--space-5)] ${i ? "md:border-l md:pl-[var(--space-8)]" : ""} ${i < 2 ? "md:pr-[var(--space-8)]" : ""}`} style={{ borderColor: RULE }}>
              <span className="flex items-center gap-[8px] text-[16px] font-semibold"><d.icon className="h-[18px] w-[18px]" style={{ color: "var(--accent)" }} aria-hidden />{d.title}</span>
              <ul className="flex flex-col gap-[var(--space-4)]">
                {d.items.map((it) => (
                  <li key={it.label} className="flex items-center gap-[var(--space-3)]">
                    {"ring" in it && typeof it.ring === "number"
                      ? <><DrawRing pct={it.ring} size={44} stroke={5} /><span className="flex flex-col"><span className="text-[18px] leading-[22px] font-semibold tabular-nums">{it.ring}%</span><span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{it.label}</span></span></>
                      : <><span className="flex size-[44px] items-center justify-center rounded-full text-[15px] font-semibold tabular-nums" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--accent)" }}>{"count" in it ? it.count : ""}</span><span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{it.label}</span></>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Against benchmarks" className="flex flex-col gap-[var(--space-5)]">
        <Title>Against Benchmarks</Title>
        <div className="grid grid-cols-1 gap-[var(--space-8)] md:grid-cols-3">
          <Benchmark label="On-track rate" gap={`${m.onTrackPct - SCHOOL_AVERAGE_ON_TRACK >= 0 ? "+" : ""}${m.onTrackPct - SCHOOL_AVERAGE_ON_TRACK} pts`} note={`${m.onTrackPct}% vs ${SCHOOL_AVERAGE_ON_TRACK}% school average`} pct={m.onTrackPct} tick={SCHOOL_AVERAGE_ON_TRACK} />
          <Benchmark label="Senior plans" gap={`${m.seniorPlanPct - SCHOOL_TARGETS.seniorPlan >= 0 ? "+" : ""}${m.seniorPlanPct - SCHOOL_TARGETS.seniorPlan} pts`} note={`${m.seniorPlanPct}% vs ${SCHOOL_TARGETS.seniorPlan}% district`} pct={m.seniorPlanPct} tick={SCHOOL_TARGETS.seniorPlan} />
          <Benchmark label="Review turnaround" gap={`${(REVIEW_STANDARD - REVIEW_DAYS).toFixed(1)} days faster`} note={`${REVIEW_DAYS} days vs ${REVIEW_STANDARD}-day standard`} pct={(REVIEW_DAYS / REVIEW_STANDARD) * 100} tick={100} />
        </div>
      </section>
    </div>
  );
}

/** A ring with its target marked as a tick on the circle. */
function TargetRing({ pct, target, ok }: { pct: number; target: number; ok: boolean }) {
  const reduce = useReducedMotion();
  const size = 64, stroke = 7, r = (size - stroke) / 2;
  const a = (target / 100) * 2 * Math.PI - Math.PI / 2;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="overflow-visible">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth={stroke} />
      <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={ok ? "var(--color-feedback-success-solid)" : "var(--primary)"} strokeWidth={stroke} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: Math.max(0.001, pct / 100) }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <line x1={cx + (r - stroke) * Math.cos(a)} y1={cy + (r - stroke) * Math.sin(a)} x2={cx + (r + stroke) * Math.cos(a)} y2={cy + (r + stroke) * Math.sin(a)} stroke="var(--foreground)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function Work({ value, label, note, ring }: { value: number; label: string; note: string; ring?: number }) {
  return (
    <div className="flex min-w-0 items-center gap-[var(--space-4)] pr-[var(--space-4)]">
      {typeof ring === "number" ? <DrawRing pct={ring} size={52} stroke={6} /> : <span className="flex size-[52px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--accent)" }}><Clock className="h-5 w-5" aria-hidden /></span>}
      <div className="flex min-w-0 flex-col">
        <dd className="m-0 text-[28px] leading-[32px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}><CountUp value={value} /></dd>
        <dt className="text-[14px] font-semibold">{label}</dt>
        <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{note}</span>
      </div>
    </div>
  );
}

function Benchmark({ label, gap, note, pct, tick }: { label: string; gap: string; note: string; pct: number; tick: number }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="text-[26px] leading-[30px] font-semibold whitespace-nowrap tabular-nums v5-ok" style={{ fontFamily: "var(--font-display)" }}>{gap}</span>
      <span className="relative mt-[var(--space-1)] block h-[10px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 55%, var(--background)), var(--primary))" }} />
        <span aria-hidden className="absolute top-[-4px] bottom-[-4px] w-[2px] rounded-full" style={{ left: `calc(${Math.min(100, tick)}% - 1px)`, background: "var(--foreground)" }} />
      </span>
      <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{note}</span>
    </div>
  );
}

// ---- Use of time, drawn ------------------------------------------------------

function TimeSection() {
  const log = useTimeLog();
  const week = summarize(log);
  const [open, setOpen] = useState(false);
  const metGoal = week.studentPct >= ASCA_TARGET_PCT;
  // per day, oldest first, for the columns
  const byDay = new Map<string, Record<TimeKind, number>>();
  for (const e of week.entries) {
    const k = e.at.slice(0, 10);
    const d = byDay.get(k) ?? { direct: 0, indirect: 0, support: 0 };
    d[e.kind] += e.minutes;
    byDay.set(k, d);
  }
  const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const peak = Math.max(60, ...days.map(([, d]) => d.direct + d.indirect + d.support));
  const byActivity = new Map<string, number>();
  for (const e of week.entries) {
    const k = e.activity.replace(/^Walk-in: .*/, "Walk-ins").replace(/^Reviewed .*/, "Reviews");
    byActivity.set(k, (byActivity.get(k) ?? 0) + e.minutes);
  }
  const top = [...byActivity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <section aria-label="Use of time" className="flex flex-col gap-[var(--space-6)]">
      <Title aside={
        <button type="button" onClick={() => openLog({ mode: "time" })} className="dm-solid inline-flex min-h-[40px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Clock className="h-4 w-4" aria-hidden /> Log time
        </button>
      }>Use of Time</Title>

      <div className="grid grid-cols-1 items-center gap-[var(--space-10)] lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:gap-[var(--space-12)]">
        {/* the week as a donut, ASCA's 80% marked on the ring */}
        <div className="flex flex-col items-start gap-[var(--space-6)] sm:flex-row sm:items-center">
          <TimeDonut minutes={week.minutes} total={week.total} pct={week.studentPct} />
          <ul className="grid grid-cols-2 gap-[var(--space-3)] sm:flex sm:flex-col">
            {KINDS.map((k) => (
              <li key={k} className="flex flex-col">
                <span className="flex items-center gap-[8px] text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[10px] rounded-full" style={{ background: INK[k] }} />{TIME_KIND_LABEL[k]}</span>
                <span className="pl-[18px] text-[18px] leading-[22px] font-semibold tabular-nums">{hoursLabel(week.minutes[k])}</span>
              </li>
            ))}
            <li className={`pl-[18px] text-[13px] font-semibold ${metGoal ? "v5-ok" : "v5-warn"}`}>{metGoal ? "Goal met" : `${ASCA_TARGET_PCT - week.studentPct} pts under the goal`}</li>
          </ul>
        </div>

        {/* each day as a stacked column */}
        <figure className="m-0 flex flex-col gap-[var(--space-3)]">
          <figcaption className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Day by day</figcaption>
          <div className="flex h-[180px] items-end gap-[var(--space-3)]">
            {days.map(([day, d]) => {
              const sum = d.direct + d.indirect + d.support;
              return (
                <div key={day} className="flex min-w-0 flex-1 flex-col items-center gap-[6px]">
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{hoursLabel(sum)}</span>
                  <div className="flex w-full max-w-[44px] flex-col-reverse overflow-hidden rounded-[8px]" style={{ height: `${(sum / peak) * 130}px` }} role="img" aria-label={`${day}: ${hoursLabel(sum)}`}>
                    {KINDS.map((k) => <span key={k} style={{ height: `${(d[k] / Math.max(1, sum)) * 100}%`, background: INK[k] }} />)}
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })}</span>
                </div>
              );
            })}
          </div>
        </figure>

        <figure className="m-0 flex flex-col gap-[var(--space-3)]">
          <figcaption className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Where the time went</figcaption>
          <GradientBars suffix="" format="none" max={Math.max(1, ...top.map(([, v]) => v))} rows={top.map(([label, v]) => ({ label, value: v, note: hoursLabel(v) }))} />
        </figure>
      </div>

      <div className="flex flex-col border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="dm-link inline-flex cursor-pointer items-center gap-[6px] self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>
          {open ? "Hide entries" : `All ${week.entries.length} entries`}<ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {open && (
          <ul className="mt-[var(--space-3)] grid grid-cols-1 gap-x-[var(--space-10)] md:grid-cols-2">
            {week.entries.map((e) => (
              <li key={e.id} className="flex items-center gap-[var(--space-3)] border-b py-[10px]" style={{ borderColor: RULE }}>
                <span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: INK[e.kind] }} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14.5px] leading-[19px] font-semibold">{e.activity}</span>
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{new Date(e.at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {TIME_KIND_LABEL[e.kind]}</span>
                </span>
                <span className="text-[14px] font-semibold tabular-nums">{hoursLabel(e.minutes)}</span>
                {!e.id.startsWith("seed-") ? (
                  <IconTip label="Remove">
                    <button type="button" aria-label={`Remove ${e.activity}`} onClick={() => removeTime(e.id)} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>
                  </IconTip>
                ) : <span aria-hidden className="size-8" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TimeDonut({ minutes, total, pct }: { minutes: Record<TimeKind, number>; total: number; pct: number }) {
  const reduce = useReducedMotion();
  const size = 168, stroke = 18, r = (size - stroke) / 2, c = 2 * Math.PI * r, cx = size / 2;
  const segs = KINDS.map((k) => ({ k, len: (minutes[k] / total) * c }));
  const starts = segs.map((_, i) => segs.slice(0, i).reduce((t, s) => t + s.len, 0));
  const a = (ASCA_TARGET_PCT / 100) * 2 * Math.PI - Math.PI / 2;
  return (
    <span className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="overflow-visible">
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          {segs.map((s, i) => (
            <motion.circle key={s.k} cx={cx} cy={cx} r={r} fill="none" stroke={INK[s.k]} strokeWidth={stroke}
              strokeDasharray={`${Math.max(0, s.len - 2)} ${c}`} strokeDashoffset={-starts[i]}
              initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: i * 0.12 }} />
          ))}
        </g>
        {/* ASCA's 80% */}
        <line x1={cx + (r - stroke / 2 - 4) * Math.cos(a)} y1={cx + (r - stroke / 2 - 4) * Math.sin(a)} x2={cx + (r + stroke / 2 + 4) * Math.cos(a)} y2={cx + (r + stroke / 2 + 4) * Math.sin(a)} stroke="var(--foreground)" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] leading-[38px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{pct}%</span>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>for students</span>
      </span>
    </span>
  );
}
