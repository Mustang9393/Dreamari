"use client";

// Counselor Dashboard v3: use of time for ASCA's 80/20 guidance (at least
// 80% of a counselor's time on direct and indirect student services).
//
// Two pieces since 29 Sept 2026 (Chandu: "shouldn't Time use be more
// easily accessible?"):
// - TimeUse: the summary, a section of My Impact, where the number belongs
//   in the report a principal sees. It now links to the log instead of
//   holding it.
// - TimeLog: its own screen under Your work, the day-to-day view: the week
//   by day, every entry (automatic or added), filters by kind, and the
//   same one-tap adds as the top bar's Log time. Logging itself lives in
//   the top bar on every screen (QuickLog.tsx).

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { ASCA_TARGET_PCT, hoursLabel, logTime, QUICK_LOG, removeTime, summarize, TIME_KIND_LABEL, useTimeLog, type TimeEntry, type TimeKind } from "@/lib/counselorTimeLog";
import { OverviewCard } from "./overviewShared";
import { GLASS_INSET } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { CardLink } from "../chips";
import { Card, CardTitle, HeroCard } from "./kit";
import { SubTabs } from "./SubTabs";

const KIND_COLOR: Record<TimeKind, string> = { direct: PRIMARY, indirect: BLUE_3[0], support: NEUTRAL_SLICE };
const KINDS: TimeKind[] = ["direct", "indirect", "support"];

function Breakdown({ sum }: { sum: ReturnType<typeof summarize> }) {
  const under = sum.studentPct < ASCA_TARGET_PCT;
  const gap = ASCA_TARGET_PCT - sum.studentPct;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-3)]">
      <span className="flex items-baseline gap-[10px]">
        <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{sum.studentPct}%</span>
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>with or for students · ASCA {ASCA_TARGET_PCT}%</span>
      </span>
      <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: under ? (gap > 10 ? "var(--cd-red)" : "var(--cd-amber)") : "var(--cd-green)" }} />
        {under ? `${gap} pts under ASCA's 80%` : "Meets ASCA's 80%"}
      </p>
      <span className="relative block">
        <span className="flex h-[10px] w-full overflow-hidden rounded-full" role="img" aria-label={KINDS.map((k) => `${TIME_KIND_LABEL[k]} ${hoursLabel(sum.minutes[k])}`).join(", ")} style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
          {KINDS.map((k) => <span key={k} className="h-full" style={{ width: `${(sum.minutes[k] / sum.total) * 100}%`, background: KIND_COLOR[k] }} />)}
        </span>
        <span aria-hidden className="absolute top-[-3px] h-[16px] w-[2px] rounded-full" style={{ left: `${ASCA_TARGET_PCT}%`, background: "var(--foreground)" }} />
      </span>
      <ul className="flex flex-col gap-[4px] text-[13px] font-semibold">
        {KINDS.map((k) => (
          <li key={k} className="flex items-center justify-between gap-[8px]">
            <span className="flex items-center gap-[8px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[8px] rounded-full" style={{ background: KIND_COLOR[k] }} />{TIME_KIND_LABEL[k]}</span>
            <span className="tabular-nums" style={{ color: "var(--foreground)" }}>{hoursLabel(sum.minutes[k])}</span>
          </li>
        ))}
      </ul>
      <span className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><Sparkles className="h-[12px] w-[12px]" aria-hidden style={{ color: "var(--primary)" }} />{sum.autoPct}% logged automatically from your work in the dashboard</span>
    </div>
  );
}

/** My Impact's section: the number and the split, with the way to the log. */
export function TimeUse() {
  const router = useRouter();
  const entries = useTimeLog();
  const sum = useMemo(() => summarize(entries), [entries]);
  return (
    <OverviewCard title="Time use" unit="last 7 days" aside={<CardLink onClick={() => router.push("/counselor?view=time")}>Time log</CardLink>}>
      <Breakdown sum={sum} />
    </OverviewCard>
  );
}

function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

/** The Time log screen. */
export function TimeLog() {
  const entries = useTimeLog();
  const sum = useMemo(() => summarize(entries), [entries]);
  const [kind, setKind] = useState<TimeKind | "all">("all");
  const list = sum.entries.filter((e) => kind === "all" || e.kind === kind);
  const days = list.reduce<{ key: string; label: string; items: TimeEntry[] }[]>((acc, e) => {
    const key = dayKey(e.at);
    let d = acc.find((x) => x.key === key);
    if (!d) {
      const date = new Date(e.at);
      const today = new Date().toDateString() === key;
      d = { key, label: today ? "Today" : date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }), items: [] };
      acc.push(d);
    }
    d.items.push(e);
    return acc;
  }, []);
  // Hours per school day for the week strip, oldest first.
  const week = [...days].reverse().map((d) => ({ label: d.label === "Today" ? "Today" : d.label.split(",")[0].slice(0, 3), total: d.items.reduce((n, e) => n + e.minutes, 0), student: d.items.filter((e) => e.kind !== "support").reduce((n, e) => n + e.minutes, 0) }));
  const max = Math.max(60, ...week.map((w) => w.total));

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
          <HeroCard>
            <CardTitle title="This week" unit="ASCA 80/20" />
            <Breakdown sum={sum} />
          </HeroCard>
          <Card>
            <CardTitle title="By day" unit="with students of all time logged" />
            <div className="flex h-[140px] items-end gap-[10px]" role="img" aria-label={week.map((w) => `${w.label} ${hoursLabel(w.total)}, ${hoursLabel(w.student)} with students`).join("; ")}>
              {week.map((w) => (
                <span key={w.label} className="flex h-full flex-1 flex-col items-center justify-end gap-[6px]">
                  <span className="relative flex w-full max-w-[44px] flex-col justify-end overflow-hidden rounded-t-[6px]" style={{ height: `${(w.total / max) * 100}%`, background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
                    <span className="block w-full" style={{ height: `${(w.student / (w.total || 1)) * 100}%`, background: `linear-gradient(180deg, ${PRIMARY}, color-mix(in srgb, ${PRIMARY} 35%, transparent))` }} />
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>{w.label}</span>
                </span>
              ))}
            </div>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Blue is time with or for students; grey is school support.</span>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-[8px]">
          <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Add in one tap</span>
          <div className="flex flex-wrap gap-[6px]">
            {QUICK_LOG.map((q) => (
              <button key={q.activity} type="button" onClick={() => logTime({ ...q, auto: false })} className="dm-quiet flex h-8 cursor-pointer items-center gap-[6px] rounded-full border px-[11px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <Plus className="h-[12px] w-[12px]" aria-hidden /> {q.activity} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>{q.minutes}m</span>
              </button>
            ))}
          </div>
          <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>For anything else, or a walk-in, use Log time at the top of any screen (or press L).</span>
        </div>
        <SubTabs ariaLabel="Kind of time" value={kind} onChange={setKind} options={[{ key: "all", label: "All", count: sum.entries.length }, ...KINDS.map((k) => ({ key: k, label: TIME_KIND_LABEL[k], count: sum.entries.filter((e) => e.kind === k).length }))]} />
        {days.map((d) => (
          <section key={d.key} className="flex flex-col gap-[6px]">
            <h3 className="flex items-baseline justify-between text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: d.label === "Today" ? "var(--primary)" : "var(--muted-foreground)" }}>
              {d.label}
              <span className="tabular-nums normal-case tracking-normal">{hoursLabel(d.items.reduce((n, e) => n + e.minutes, 0))}</span>
            </h3>
            <ul className="flex flex-col gap-[4px]">
              {d.items.map((e) => (
                <li key={e.id} className="flex items-center gap-[10px] rounded-[var(--radius-sm)] border px-[10px] py-[7px] text-[12.5px]" style={GLASS_INSET}>
                  <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: KIND_COLOR[e.kind] }} />
                  <span className="min-w-0 flex-1 truncate font-semibold" style={{ color: "var(--foreground)" }}>{e.activity}</span>
                  <span className="flex-none text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{e.auto ? "automatic" : "added"} · {new Date(e.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                  <span className="w-[52px] flex-none text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{hoursLabel(e.minutes)}</span>
                  {e.id.startsWith("seed-") ? <span className="size-6 flex-none" aria-hidden /> : (
                    <IconTip label="Remove">
                      <button type="button" aria-label={`Remove ${e.activity}`} onClick={() => removeTime(e.id)} className="dm-quiet flex size-6 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[12px] w-[12px]" aria-hidden /></button>
                    </IconTip>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Card>
    </div>
  );
}
