"use client";

// The counselor's own hours (Chandu, 7 Oct 2026: "and have their hours
// tracked somewhere too"), on the use-of-time store v3 built (ASCA: at least
// 80% of a counselor's time on direct and indirect student services). Most
// entries write themselves (a walk-in, a completed meeting, a review, a
// letter, a reply); the rest come from Log time. One stacked bar with the
// 80% line, the three buckets in hours, then the week's entries by day.

import { useMemo } from "react";
import { Clock, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { ASCA_TARGET_PCT, TIME_KIND_LABEL, hoursLabel, removeTime, summarize, useTimeLog, type TimeKind } from "@/lib/counselorTimeLog";
import { openLog } from "./LogSheet";
import { GradientBars } from "./charts";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const INK: Record<TimeKind, string> = {
  direct: "var(--primary)",
  indirect: "color-mix(in srgb, var(--primary) 50%, var(--background))",
  support: "color-mix(in srgb, var(--foreground) 22%, transparent)",
};

export function TimeView() {
  const log = useTimeLog();
  const roster = useReviewedRoster();
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s.name])), [roster]);
  const week = summarize(log);
  const grouped = new Map<string, typeof week.entries>();
  for (const e of week.entries) grouped.set(e.at.slice(0, 10), [...(grouped.get(e.at.slice(0, 10)) ?? []), e]);
  const days = [...grouped.entries()];
  const met = week.studentPct >= ASCA_TARGET_PCT;
  // the biggest uses of time this week, by activity
  const byActivity = new Map<string, number>();
  for (const e of week.entries) {
    const k = e.activity.replace(/^Walk-in: .*/, "Walk-ins").replace(/^Reviewed .*/, "Reviews");
    byActivity.set(k, (byActivity.get(k) ?? 0) + e.minutes);
  }
  const top = [...byActivity.entries()].map(([activity, minutes]) => ({ activity, minutes })).sort((a, b) => b.minutes - a.minutes).slice(0, 6);

  return (
    <div className="flex flex-col gap-[48px]">
      <section aria-label="This week" className="flex flex-col gap-[var(--space-6)]">
        <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[44px] leading-[48px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{week.studentPct}%</span>
            <span className="text-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              of your time with or for students · <span className={met ? "v5-ok" : "v5-warn"}>goal {ASCA_TARGET_PCT}%</span>
            </span>
          </div>
          <button type="button" onClick={() => openLog({ mode: "time" })} className="dm-solid inline-flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Clock className="h-4 w-4" aria-hidden /> Log time
          </button>
        </div>
        {/* the week as one bar, with ASCA's 80% line */}
        <div className="relative">
          <div className="flex h-[16px] w-full overflow-hidden rounded-full" role="img" aria-label={`${hoursLabel(week.minutes.direct)} direct, ${hoursLabel(week.minutes.indirect)} indirect, ${hoursLabel(week.minutes.support)} school support`}>
            {(["direct", "indirect", "support"] as TimeKind[]).map((k) => <span key={k} style={{ width: `${(week.minutes[k] / week.total) * 100}%`, background: INK[k] }} />)}
          </div>
          <span aria-hidden className="absolute top-[-6px] bottom-[-6px] w-[2px] rounded-full" style={{ left: `${ASCA_TARGET_PCT}%`, background: "var(--foreground)" }} />
          <span aria-hidden className="absolute top-[22px] -translate-x-1/2 text-[12px] font-semibold tabular-nums" style={{ left: `${ASCA_TARGET_PCT}%`, color: "var(--muted-foreground)" }}>{ASCA_TARGET_PCT}%</span>
        </div>
        <dl className="mt-[var(--space-3)] grid grid-cols-1 gap-y-[var(--space-4)] border-t pt-[var(--space-5)] sm:grid-cols-4" style={{ borderColor: RULE }}>
          {(["direct", "indirect", "support"] as TimeKind[]).map((k, i) => (
            <div key={k} className={`flex flex-col gap-[4px] ${i ? "sm:border-l sm:pl-[var(--space-6)]" : ""}`} style={{ borderColor: RULE }}>
              <dd className="m-0 text-[26px] leading-[30px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{hoursLabel(week.minutes[k])}</dd>
              <dt className="flex items-center gap-[6px] text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] rounded-full" style={{ background: INK[k] }} />{TIME_KIND_LABEL[k]}</dt>
            </div>
          ))}
          <div className="flex flex-col gap-[4px] sm:border-l sm:pl-[var(--space-6)]" style={{ borderColor: RULE }}>
            <dd className="m-0 text-[26px] leading-[30px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{week.autoPct}%</dd>
            <dt className="text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>Logged for you</dt>
          </div>
        </dl>
      </section>

      {/* entries and where the time went, about 1.6 : 1 */}
      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-[var(--space-12)]">
      <section aria-label="The week's entries" className="flex min-w-0 flex-col gap-[var(--space-6)]">
        <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>The Last Seven Days</h2>
        {days.map(([day, entries]) => (
          <div key={day} className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            <ul className="flex flex-col">
              {entries.map((e) => (
                <li key={e.id} className="flex items-center gap-[var(--space-3)] border-b py-[10px]" style={{ borderColor: RULE }}>
                  <span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: INK[e.kind] }} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] leading-[20px] font-semibold">{e.activity}{e.studentId && byId.get(e.studentId) ? `, ${byId.get(e.studentId)}` : ""}</span>
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{TIME_KIND_LABEL[e.kind]}{e.auto ? " · logged for you" : ""}</span>
                  </span>
                  <span className="text-[14.5px] font-semibold tabular-nums">{hoursLabel(e.minutes)}</span>
                  {!e.id.startsWith("seed-") ? (
                    <IconTip label="Remove">
                      <button type="button" aria-label={`Remove ${e.activity}`} onClick={() => removeTime(e.id)} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>
                    </IconTip>
                  ) : <span aria-hidden className="size-8" />}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <aside aria-label="Where the time went" className="flex min-w-0 flex-col gap-[var(--space-5)] lg:sticky lg:top-[100px] lg:self-start">
        <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>Where the Time Went</h2>
        <GradientBars suffix="" max={Math.max(...top.map((t) => t.minutes))} rows={top.map((t) => ({ label: t.activity, value: t.minutes, note: hoursLabel(t.minutes) }))} format="none" />
      </aside>
      </div>
    </div>
  );
}
