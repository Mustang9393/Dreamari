"use client";

// v3 (29 Sept 2026): one form for every meeting the counselor adds, used
// from Meetings, the Student Profile and the top bar's Log time. Chandu:
// "If its adding or logging meetings adhoc etc it should probably be
// simpler and easier to access." Most of a counselor's student time is
// walk-ins that never went through office hours, so the default is
// "Walk-in, just now": pick the student, tap a type and a length, jot the
// next step, save. One save does the three things a counselor does after a
// conversation today in three places: the meeting is recorded, the note
// lands on the profile, and the time goes into the 80/20 log.
// "Book ahead" is the same form with a day and time.

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { addMeeting, MEETING_TYPES, type MeetingType } from "@/lib/counselorMeetings";
import { addNote } from "@/lib/counselorNotes";
import { logTime } from "@/lib/counselorTimeLog";
import { addDays, isoDay, shortDate } from "@/lib/localRecord";
import { Avatar } from "../chips";

const LENGTHS = [5, 15, 30, 45];
const label = "text-[11px] font-bold tracking-[0.06em] uppercase";

/** Pick-one buttons in a row (radio semantics). */
export function ChoiceRow<T extends string | number>({ name, options, value, onChange, format }: { name: string; options: readonly T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-[6px]">
      {options.map((o) => {
        const on = o === value;
        return (
          <button key={String(o)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o)} className="dm-quiet flex h-8 cursor-pointer items-center rounded-full border px-[12px] text-[12.5px] font-bold" style={{ borderColor: on ? "color-mix(in srgb, var(--primary) 70%, transparent)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {format ? format(o) : String(o)}
          </button>
        );
      })}
    </div>
  );
}

/** Type-to-find a student; the chosen one shows as a chip with Change. */
export function StudentPicker({ value, onChange, autoFocus }: { value: CounselorStudent | null; onChange: (s: CounselorStudent | null) => void; autoFocus?: boolean }) {
  const roster = useReviewedRoster();
  const [q, setQ] = useState("");
  const matches = useMemo(() => (q.trim() ? roster.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : []), [roster, q]);
  if (value) {
    return (
      <span className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[10px] py-[8px]" style={{ borderColor: "var(--glass-border)", background: "var(--inset-bg)" }}>
        <Avatar name={value.name} size={28} index={value.avatarIndex} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{value.name}</span>
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {value.grade}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} className="dm-link cursor-pointer text-[12px] font-bold" style={{ color: "var(--primary)" }}>Change</button>
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-[4px]">
      <label className="relative flex h-10 items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
        <span className="sr-only">Student</span>
        <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && matches[0]) { e.preventDefault(); onChange(matches[0]); } }} placeholder="Type a student's name" className="h-10 w-full rounded-[var(--radius-sm)] border pr-3 pl-9 text-[13px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
      </label>
      {matches.length > 0 && (
        <ul className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border p-[4px]" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
          {matches.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => onChange(s)} className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[8px] py-[6px] text-left">
                <Avatar name={s.name} size={24} index={s.avatarIndex} />
                <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MeetingForm({ student: fixed, onDone }: { student?: CounselorStudent; onDone: (summary: string) => void }) {
  const [student, setStudent] = useState<CounselorStudent | null>(fixed ?? null);
  const [when, setWhen] = useState<"now" | "later">("now");
  const [type, setType] = useState<MeetingType>("Check-in");
  const [minutes, setMinutes] = useState(15);
  const [notes, setNotes] = useState("");
  const today = isoDay(new Date());
  const [day, setDay] = useState(addDays(today, 1));
  const [time, setTime] = useState("10:00");

  const save = () => {
    if (!student) return;
    const first = student.name.split(" ")[0];
    if (when === "now") {
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      addMeeting({ studentId: student.id, type, day: today, time: t, minutes, topic: "Walk-in" }, notes.trim());
      if (notes.trim()) addNote(student.id, `${type} (walk-in), ${shortDate(today)}:\n${notes.trim()}`);
      logTime({ activity: `${type}, ${student.name}`, minutes, kind: "direct", studentId: student.id, auto: false });
      onDone(`Logged ${minutes} min with ${first}${notes.trim() ? ", note saved" : ""}`);
    } else {
      addMeeting({ studentId: student.id, type, day, time, minutes, topic: notes.trim() || "Booked by you" });
      onDone(`Booked ${first} for ${shortDate(day)}`);
    }
  };

  return (
    <form className="flex flex-col gap-[var(--space-4)]" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <div className="flex flex-col gap-[6px]">
        <span className={label} style={{ color: "var(--muted-foreground)" }}>Student</span>
        <StudentPicker value={student} onChange={setStudent} autoFocus={!fixed} />
      </div>
      <div className="flex flex-col gap-[6px]">
        <span className={label} style={{ color: "var(--muted-foreground)" }}>When</span>
        <ChoiceRow name="When" options={["now", "later"] as const} value={when} onChange={setWhen} format={(v) => (v === "now" ? "Walk-in, just now" : "Book ahead")} />
        {when === "later" && (
          <div className="flex gap-[8px] pt-[4px]">
            <label className="flex flex-1 flex-col gap-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Day<input type="date" value={day} min={today} onChange={(e) => setDay(e.target.value)} className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} /></label>
            <label className="flex w-[120px] flex-col gap-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Time<input type="time" value={time} step={900} onChange={(e) => setTime(e.target.value)} className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} /></label>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[6px]">
        <span className={label} style={{ color: "var(--muted-foreground)" }}>About</span>
        <ChoiceRow name="Meeting type" options={MEETING_TYPES} value={type} onChange={setType} />
      </div>
      <div className="flex flex-col gap-[6px]">
        <span className={label} style={{ color: "var(--muted-foreground)" }}>How long</span>
        <ChoiceRow name="Length" options={LENGTHS} value={minutes} onChange={setMinutes} format={(m) => `${m} min`} />
      </div>
      <label className="flex flex-col gap-[6px]">
        <span className={label} style={{ color: "var(--muted-foreground)" }}>{when === "now" ? "Notes, optional" : "What it is about, optional"}</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={when === "now" ? "What you talked about and the one next step" : "A line for your prep"} className="w-full resize-y rounded-[var(--radius-sm)] border px-[10px] py-[8px] text-[13px] leading-[19px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
      </label>
      <div className="flex flex-wrap items-center gap-[10px]">
        <button type="submit" disabled={!student} className="dm-solid flex h-10 cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] bg-[var(--primary)] px-[16px] text-[13px] font-bold text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-[14px] w-[14px]" aria-hidden />{when === "now" ? "Save" : "Book"}</button>
        <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{when === "now" ? `Adds ${minutes} min with students to your time log${notes.trim() ? " and the note to the profile" : ""}.` : "Shows in Meetings and in Today on the day."}</span>
      </div>
    </form>
  );
}

