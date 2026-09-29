"use client";

// v3 (29 Sept 2026): Log time, one click from every screen. Chandu:
// "shouldn't Time use be more easily accessible? If it's adding or logging
// meetings ad hoc etc it should probably be simpler and easier to access."
// Time use lived three scrolls down My Impact, a report a counselor opens
// once a month, while logging happens ten times a day, usually right after
// a hallway conversation. So the logging moved to the top bar (the same
// place Toggl, Harvest and Linear put their quick-create), opens with the
// one-tap presets, and a walk-in is one more tap to the full meeting form.
// Press L from anywhere to open it.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Plus, UserRound, Check, Undo2 } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { hoursLabel, logTime, QUICK_LOG, removeTime, summarize, useTimeLog, type TimeKind } from "@/lib/counselorTimeLog";
import { SidePanel } from "./SidePanel";
import { ChoiceRow, MeetingForm } from "./MeetingForm";

const KINDS: TimeKind[] = ["direct", "indirect", "support"];
const KIND_WORD: Record<TimeKind, string> = { direct: "With students", indirect: "For students", support: "School duty" };

export function QuickLogButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const entries = useTimeLog();
  const [open, setOpen] = useState(false);
  const [walkIn, setWalkIn] = useState(false);
  const [last, setLast] = useState<{ text: string; undoable: boolean } | null>(null);
  const [activity, setActivity] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [kind, setKind] = useState<TimeKind>("direct");
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const sum = summarize(entries);
  const todayMin = sum.entries.filter((e) => new Date(e.at).toDateString() === new Date().toDateString()).reduce((n, e) => n + e.minutes, 0);

  // L opens it from anywhere that is not a text field; Escape and a click
  // outside close it and return focus to the button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "l" && !compact) { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape" && open) { setOpen(false); button.current?.focus(); }
    };
    const onDown = (e: MouseEvent) => { if (open && wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onDown); };
  }, [open, compact]);

  const record = (entry: { activity: string; minutes: number; kind: TimeKind }) => {
    logTime({ ...entry, auto: false });
    // The newest entry is the one just written.
    setLast({ text: `${entry.activity}, ${hoursLabel(entry.minutes)}`, undoable: true });
  };
  const undo = () => {
    const newest = entries[0];
    if (newest && !newest.auto) removeTime(newest.id);
    setLast(null);
  };

  const label = "text-[11px] font-bold tracking-[0.06em] uppercase";
  const trigger = compact ? (
    <IconTip label="Log time (L)">
      <button ref={button} type="button" aria-label="Log time" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)} className="dm-quiet relative flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: open ? "var(--primary)" : "var(--foreground)" }}>
        <Clock className="h-[18px] w-[18px]" aria-hidden />
      </button>
    </IconTip>
  ) : (
    <IconTip label="Press L">
      <button ref={button} type="button" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-bold" style={{ borderColor: open ? "color-mix(in srgb, var(--primary) 60%, var(--glass-border))" : "var(--glass-border)", color: "var(--foreground)" }}>
        <Clock className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} /> Log time
      </button>
    </IconTip>
  );

  return (
    <div ref={wrap} className="relative">
      {trigger}
      {open && (
        <div role="dialog" aria-label="Log time" className="fixed inset-x-[12px] top-[64px] z-40 flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:absolute sm:inset-x-auto sm:top-[44px] sm:right-0 sm:w-[380px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.5)" }}>
          <div className="flex items-baseline justify-between gap-[8px]">
            <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Log time</span>
            <button type="button" onClick={() => { setOpen(false); router.push("/counselor?view=time"); }} className="dm-link cursor-pointer text-[12px] font-bold" style={{ color: "var(--primary)" }}>
              Today {hoursLabel(todayMin)} · week {sum.studentPct}% with students
            </button>
          </div>

          <button type="button" onClick={() => { setOpen(false); setWalkIn(true); }} className="dm-quiet flex cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left" style={{ borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}>
            <span className="flex size-[32px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}><UserRound className="h-[15px] w-[15px]" aria-hidden /></span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>A student just stopped by</span>
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Walk-in: student, a note, done</span>
            </span>
          </button>

          <div className="flex flex-col gap-[8px]">
            <span className={label} style={{ color: "var(--muted-foreground)" }}>One tap</span>
            <div className="flex flex-wrap gap-[6px]">
              {QUICK_LOG.map((q) => (
                <button key={q.activity} type="button" onClick={() => record(q)} className="dm-quiet flex h-8 cursor-pointer items-center gap-[6px] rounded-full border px-[11px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <Plus className="h-[12px] w-[12px]" aria-hidden /> {q.activity} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>{q.minutes}m</span>
                </button>
              ))}
            </div>
          </div>

          <form className="flex flex-col gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }} onSubmit={(e) => { e.preventDefault(); if (!activity.trim()) return; record({ activity: activity.trim(), minutes, kind }); setActivity(""); }}>
            <span className={label} style={{ color: "var(--muted-foreground)" }}>Something else</span>
            <label className="sr-only" htmlFor="quicklog-activity">What you did</label>
            <input id="quicklog-activity" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="What you did, e.g. IEP meeting" className="h-9 rounded-[var(--radius-sm)] border px-[10px] text-[13px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
            <ChoiceRow name="Kind of time" options={KINDS} value={kind} onChange={setKind} format={(k) => KIND_WORD[k]} />
            <span className="flex items-center justify-between gap-[8px]">
              <ChoiceRow name="Minutes" options={[5, 15, 30, 60] as const} value={minutes as 5 | 15 | 30 | 60} onChange={setMinutes} format={(m) => `${m}m`} />
              <button type="submit" disabled={!activity.trim()} className="dm-solid flex h-8 cursor-pointer items-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-[12px] text-[12.5px] font-bold text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-50">Log</button>
            </span>
          </form>

          {last && (
            <p role="status" className="flex items-center justify-between gap-[8px] rounded-[var(--radius-sm)] px-[10px] py-[6px] text-[12.5px] font-semibold" style={{ background: "color-mix(in srgb, var(--cd-green) 12%, transparent)", color: "var(--foreground)" }}>
              <span className="flex items-center gap-[6px]"><Check className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--cd-green)" }} />Done: {last.text}</span>
              {last.undoable && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: "var(--primary)" }}><Undo2 className="h-[12px] w-[12px]" aria-hidden />Undo</button>}
            </p>
          )}
        </div>
      )}
      <SidePanel open={walkIn} onClose={() => setWalkIn(false)} title="Log a meeting" subtitle="A walk-in, or book one ahead">
        <MeetingForm onDone={(msg) => { setWalkIn(false); setLast({ text: msg.replace(/^(Logged|Booked) /, ""), undoable: false }); setOpen(true); }} />
      </SidePanel>
    </div>
  );
}
