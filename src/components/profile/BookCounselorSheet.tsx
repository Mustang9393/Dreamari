"use client";

// My Plan v2's "Book a meeting with your counselor" (lib/top3Flow, 19 Oct
// 2026). The student half of counselor scheduling that lib/counselorMeetings
// says is "still to build": the student picks why, a free office-hours slot
// and an optional line, and the meeting lands on the counselor's calendar
// (addMeeting, the same store the dashboard reads). The step opens only
// after the Career Report is shared, so the counselor has read it first.
// DEMO-ONLY: the student is the roster's "real-student" (Jordan Rivera);
// with a backend this is the signed-in student's id.

import { useMemo, useState } from "react";
import { skyMoment } from "@/lib/sky";
import { CalendarCheck, Check, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { addMeeting, timeLabel, useAddedMeetings, useOfficeHours, type MeetingType } from "@/lib/counselorMeetings";
import { isoDay } from "@/lib/localRecord";
import { useBackStep } from "@/lib/backStep";
import { Portal } from "./CareerReport";

export const STUDENT_ID = "real-student";
const MINUTES = 20;
const TYPES: MeetingType[] = ["Career exploration", "Course planning", "Applications", "Financial aid", "Resume", "Check-in"];

/** The student's own upcoming meeting, if they booked one. */
export function useMyNextMeeting() {
  const added = useAddedMeetings();
  const [today] = useState(() => isoDay(new Date()));
  return added.filter((m) => m.studentId === STUDENT_ID && m.day >= today).sort((a, b) => (a.day + a.time).localeCompare(b.day + b.time))[0] ?? null;
}

function dayLabel(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function BookCounselorSheet({ onClose }: { onClose: () => void }) {
  useBackStep(true, onClose);
  const hours = useOfficeHours();
  const taken = useAddedMeetings();
  const [type, setType] = useState<MeetingType>("Career exploration");
  const [topic, setTopic] = useState("");
  const [booked, setBooked] = useState<{ day: string; time: string } | null>(null);
  // the next six free office-hours slots, from tomorrow
  const [start] = useState(() => Date.now());
  const slots = useMemo(() => {
    const out: { day: string; time: string }[] = [];
    for (let i = 1; i <= 21 && out.length < 6; i++) {
      const d = new Date(start + i * 86400000);
      for (const o of hours.filter((h) => h.weekday === d.getDay())) {
        const [fh, fm] = o.from.split(":").map(Number);
        const [th, tm] = o.to.split(":").map(Number);
        for (let t = fh * 60 + fm; t + MINUTES <= th * 60 + tm && out.length < 6; t += 30) {
          const time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
          const day = isoDay(d);
          if (!taken.some((m) => m.day === day && m.time === time)) out.push({ day, time });
        }
      }
    }
    return out;
  }, [hours, taken, start]);
  const [slot, setSlot] = useState(0);

  const book = () => {
    const s = slots[slot];
    if (!s) return;
    addMeeting({ studentId: STUDENT_ID, type, day: s.day, time: s.time, minutes: MINUTES, topic: topic.trim() });
    skyMoment({ big: true });
    setBooked(s);
  };

  const chip = (on: boolean) => ({ borderColor: on ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 24%, transparent)", background: on ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: "var(--foreground)" });

  return (
    <Portal>
      <div className="marketing-v2 themeable fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Book a meeting with your counselor" style={{ background: "transparent", fontFamily: "var(--font-body)" }}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.38)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
        <div className="relative z-[1] flex max-h-[92dvh] w-full max-w-[520px] flex-col gap-[var(--space-5)] overflow-y-auto rounded-t-[var(--radius-lg)] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <h3 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{booked ? "You're booked" : "Meet your counselor"}</h3>
            <IconTip label="Close">
              <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
            </IconTip>
          </div>

          {booked ? (
            <>
              <p className="flex items-center gap-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)] text-[15px] leading-[21px] font-semibold" style={{ borderColor: "var(--inset-border)", background: "var(--inset-surface)" }}>
                <CalendarCheck className="h-5 w-5 flex-none" style={{ color: "var(--accent-subtle)" }} aria-hidden />
                {dayLabel(booked.day)} at {timeLabel(booked.time)}. Your counselor has your Career Report.
              </p>
              <button type="button" onClick={onClose} className="dm-tap min-h-[44px] cursor-pointer rounded-[var(--radius-md)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Done</button>
            </>
          ) : (
            <>
              <fieldset className="flex flex-col gap-[var(--space-2)]">
                <legend className="mb-[var(--space-2)] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>What about?</legend>
                <div className="flex flex-wrap gap-[8px]">
                  {TYPES.map((t) => (
                    <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className="dm-tap min-h-[36px] cursor-pointer rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold" style={chip(type === t)}>{t}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-[var(--space-2)]">
                <legend className="mb-[var(--space-2)] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>When?</legend>
                {slots.length ? (
                  <div className="grid grid-cols-2 gap-[8px]">
                    {slots.map((s, i) => (
                      <button key={`${s.day}-${s.time}`} type="button" aria-pressed={slot === i} onClick={() => setSlot(i)} className="dm-tap flex min-h-[44px] cursor-pointer flex-col items-start justify-center rounded-[var(--radius-md)] border px-[12px] py-[6px] text-left" style={chip(slot === i)}>
                        <span className="text-[14px] font-bold">{dayLabel(s.day)}</span>
                        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{timeLabel(s.time)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>No open times in the next three weeks. Ask at the counseling office.</p>
                )}
              </fieldset>
              <label className="flex flex-col gap-[var(--space-2)]">
                <span className="text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>Anything to add? (optional)</span>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} placeholder="What do you want to talk about?" className="min-h-[44px] rounded-[var(--radius-md)] border bg-transparent px-[12px] text-[15px]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 24%, transparent)", color: "var(--foreground)" }} />
              </label>
              <button type="button" disabled={!slots.length} onClick={book} className="dm-tap flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                <Check className="h-4 w-4" aria-hidden /> Book it
              </button>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
