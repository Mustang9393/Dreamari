"use client";

// Counselor Dashboard v3 (29 Sept 2026): Time use, a section of My Impact.
// ASCA's guidance is at least 80% of a counselor's time on direct and
// indirect student services. The research's point: counselors lose time to
// scheduling, filing and proctoring and have no easy way to show a
// principal where it went. Every v3 action (a review, a letter sent, a
// reminder, a meeting closed with notes) logs itself here; what happens
// outside the dashboard is one tap. The result is the 80/20 number with the
// evidence under it, the report the research says counselors cannot
// produce today.

import { useMemo, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { ASCA_TARGET_PCT, hoursLabel, logTime, QUICK_LOG, removeTime, summarize, TIME_KIND_LABEL, useTimeLog, type TimeKind } from "@/lib/counselorTimeLog";
import { OverviewCard } from "./overviewShared";
import { GLASS_INSET } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { ShowAll } from "./Disclosure";

const KIND_COLOR: Record<TimeKind, string> = { direct: PRIMARY, indirect: BLUE_3[0], support: NEUTRAL_SLICE };

export function TimeUse() {
  const entries = useTimeLog();
  const sum = useMemo(() => summarize(entries), [entries]);
  const [all, setAll] = useState(false);
  const under = sum.studentPct < ASCA_TARGET_PCT;
  const gap = ASCA_TARGET_PCT - sum.studentPct;
  const shown = all ? sum.entries : sum.entries.slice(0, 6);

  return (
    <OverviewCard title="Time use" unit="last 7 days">
      <div className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:items-start lg:gap-[var(--space-6)]">
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-3)]">
          <span className="flex items-baseline gap-[10px]">
            <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{sum.studentPct}%</span>
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>with or for students · ASCA {ASCA_TARGET_PCT}%</span>
          </span>
          <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
            <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: under ? (gap > 10 ? "var(--cd-red)" : "var(--cd-amber)") : "var(--cd-green)" }} />
            {under ? `${gap} pts under ASCA's 80%` : "Meets ASCA's 80%"}
          </p>
          {/* One split bar with the 80% tick, the same shape as Overview's
             milestone bar. */}
          <span className="relative block">
            <span className="flex h-[10px] w-full overflow-hidden rounded-full" role="img" aria-label={(["direct", "indirect", "support"] as TimeKind[]).map((k) => `${TIME_KIND_LABEL[k]} ${hoursLabel(sum.minutes[k])}`).join(", ")} style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
              {(["direct", "indirect", "support"] as TimeKind[]).map((k) => <span key={k} className="h-full" style={{ width: `${(sum.minutes[k] / sum.total) * 100}%`, background: KIND_COLOR[k] }} />)}
            </span>
            <span aria-hidden className="absolute top-[-3px] h-[16px] w-[2px] rounded-full" style={{ left: `${ASCA_TARGET_PCT}%`, background: "var(--foreground)" }} />
          </span>
          <ul className="flex flex-col gap-[4px] text-[13px] font-semibold">
            {(["direct", "indirect", "support"] as TimeKind[]).map((k) => (
              <li key={k} className="flex items-center justify-between gap-[8px]">
                <span className="flex items-center gap-[8px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[8px] rounded-full" style={{ background: KIND_COLOR[k] }} />{TIME_KIND_LABEL[k]}</span>
                <span className="tabular-nums" style={{ color: "var(--foreground)" }}>{hoursLabel(sum.minutes[k])}</span>
              </li>
            ))}
          </ul>
          <span className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><Sparkles className="h-[12px] w-[12px]" aria-hidden style={{ color: "var(--primary)" }} />{sum.autoPct}% logged automatically from your work in the dashboard</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-3)]">
          <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Log time outside the dashboard</span>
          <div className="flex flex-wrap gap-[6px]">
            {QUICK_LOG.map((q) => (
              <button key={q.activity} type="button" onClick={() => logTime({ ...q, auto: false })} className="dm-quiet flex h-8 cursor-pointer items-center gap-[6px] rounded-full border px-[11px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <Plus className="h-[12px] w-[12px]" aria-hidden /> {q.activity} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>{q.minutes}m</span>
              </button>
            ))}
          </div>
          <ul className="flex flex-col gap-[4px]">
            {shown.map((e) => (
              <li key={e.id} className="flex items-center gap-[10px] rounded-[var(--radius-sm)] border px-[10px] py-[6px] text-[12.5px]" style={GLASS_INSET}>
                <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: KIND_COLOR[e.kind] }} />
                <span className="min-w-0 flex-1 truncate font-semibold" style={{ color: "var(--foreground)" }}>{e.activity}</span>
                <span className="flex-none text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{e.auto ? "auto" : "added"} · {new Date(e.at).toLocaleDateString("en-US", { weekday: "short" })}</span>
                <span className="w-[44px] flex-none text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{hoursLabel(e.minutes)}</span>
                {!e.id.startsWith("seed-") && (
                  <IconTip label="Remove">
                    <button type="button" aria-label={`Remove ${e.activity}`} onClick={() => removeTime(e.id)} className="dm-quiet flex size-6 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[12px] w-[12px]" aria-hidden /></button>
                  </IconTip>
                )}
              </li>
            ))}
          </ul>
          {sum.entries.length > 6 && <ShowAll total={sum.entries.length} shown={6} open={all} onToggle={() => setAll((v) => !v)} />}
        </div>
      </div>
    </OverviewCard>
  );
}
