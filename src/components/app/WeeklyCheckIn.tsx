"use client";

// Home's weekly check-in (8 Oct 2026). One slim card: "How's your week?"
// opens four quick taps and an optional note in place; once sent it shrinks
// to a thank-you. Only the student's counselor sees the answers. A low
// answer shows the 988 line, the way school check-in tools do.

import { useState } from "react";
import { Check, ChevronRight, HeartHandshake } from "lucide-react";
import { CHECK_AREAS, submitWeeklyCheckIn, useWeeklyCheckIn, type CheckArea, type CheckLevel } from "@/lib/weeklyCheckIn";

const OPTIONS: { key: CheckLevel; label: string; face: string }[] = [
  { key: "good", label: "Good", face: "🙂" },
  { key: "okay", label: "Okay", face: "😐" },
  { key: "low", label: "Low", face: "🙁" },
];
const CARD = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" } as const;

export function WeeklyCheckIn() {
  const done = useWeeklyCheckIn();
  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<Partial<Record<CheckArea, CheckLevel>>>({});
  const [note, setNote] = useState("");
  const complete = CHECK_AREAS.every((a) => levels[a]);
  const anyLow = done ? CHECK_AREAS.some((a) => done.levels[a] === "low") : false;

  if (done) {
    return (
      <section aria-label="Weekly check-in" className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[6px] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)]" style={CARD}>
        <span className="flex size-8 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--color-feedback-success-solid) 18%, transparent)", color: "var(--color-feedback-success)" }}><Check className="h-4 w-4" aria-hidden /></span>
        <span className="text-[15px] font-semibold">You checked in this week. Your counselor will see it.</span>
        {anyLow && <span className="w-full text-[14px]" style={{ color: "var(--muted-foreground)" }}>Need to talk now? Find an adult you trust, or call or text <a href="tel:988" className="dm-link font-semibold" style={{ color: "var(--foreground)" }}>988</a>.</span>}
      </section>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="dm-tap flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)] text-left" style={CARD}>
        <span className="flex size-9 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent)" }}><HeartHandshake className="h-[18px] w-[18px]" aria-hidden /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)" }}>How&apos;s your week?</span>
          <span className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Four quick taps. Only your counselor sees it.</span>
        </span>
        <ChevronRight className="h-5 w-5 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </button>
    );
  }

  return (
    <section aria-label="Weekly check-in" className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={CARD}>
      <h2 className="text-[18px] font-bold" style={{ fontFamily: "var(--font-display)" }}>How&apos;s your week?</h2>
      <ul className="flex flex-col gap-[var(--space-3)]">
        {CHECK_AREAS.map((area) => (
          <li key={area} className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
            <span className="text-[15px] font-semibold">{area}</span>
            <span role="radiogroup" aria-label={area} className="flex gap-[6px]">
              {OPTIONS.map((o) => {
                const on = levels[area] === o.key;
                return (
                  <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => setLevels((l) => ({ ...l, [area]: o.key }))}
                    className={`${on ? "" : "dm-quiet "}inline-flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[12px] text-[13.5px] font-semibold`}
                    style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>
                    <span aria-hidden>{o.face}</span>{o.label}
                  </button>
                );
              })}
            </span>
          </li>
        ))}
      </ul>
      <label className="flex flex-col gap-[6px]">
        <span className="text-[14px] font-semibold">Anything you want your counselor to know?</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={400} placeholder="Optional"
          className="w-full resize-none rounded-[var(--radius-md)] border bg-transparent px-[12px] py-[10px] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "var(--glass-border)" }} />
      </label>
      <div className="flex items-center gap-[var(--space-3)]">
        <button type="button" disabled={!complete} onClick={() => submitWeeklyCheckIn(levels as Record<CheckArea, CheckLevel>, note)}
          className="dm-solid inline-flex h-11 cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          Send to my counselor
        </button>
        <button type="button" onClick={() => setOpen(false)} className="dm-link text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Not now</button>
      </div>
    </section>
  );
}
