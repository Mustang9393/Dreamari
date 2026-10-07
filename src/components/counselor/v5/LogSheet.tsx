"use client";

// One place to book a meeting, log a walk-in or log time (Chandu, 7 Oct
// 2026: "there should be a full flow to book meetings, add or document
// hours / meetings / walk-ins / meeting notes"; "logging hours probably also
// needs a quick CTA in the home page as well"). It brings back v3's model
// (29 Sept research): most of a counselor's student time is walk-ins that
// never went through office hours, so one save does the three things a
// counselor otherwise does in three places: the meeting is recorded, the
// note lands on the student's profile, and the minutes go into the 80/20
// use-of-time log (ASCA). Booking takes the next free office-hours slots;
// logging time covers the hours outside student meetings (lessons, calls,
// proctoring) in a couple of taps.
//
// Any screen opens it through openLog(); one LogSheetHost per app shell
// renders it, so the same sheet serves Home, Prepare, the calendar, the
// student page and v6.

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CalendarPlus, Check, Clock, UserRound, Users, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { useDialogFocus } from "@/components/counselor/v4/useDialogFocus";
import { MEETING_TYPES, addMeeting, useOfficeHours, type OfficeHours, seededMeetings, timeLabel, useAddedMeetings, type MeetingType } from "@/lib/counselorMeetings";
import { addNote } from "@/lib/counselorNotes";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { ASCA_TARGET_PCT, QUICK_LOG, logTime, summarize, useTimeLog, type TimeKind } from "@/lib/counselorTimeLog";
import { StudentFace } from "./StudentFace";
import { StudentSearch } from "./StudentSearch";
import { guardiansFor } from "./family";
import { cv } from "@/lib/counselorBase";

export type LogMode = "walkin" | "book" | "family" | "time";
type Request = { mode: LogMode; studentId?: string; day?: string; time?: string };

// ---- the open/close store ---------------------------------------------------
let current: Request | null = null;
let toast: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Open the sheet from anywhere. */
export function openLog(r: Request): void { current = r; emit(); }
function closeLog(message?: string): void {
  current = null;
  if (message) {
    toast = message;
    window.setTimeout(() => { toast = null; emit(); }, 3200);
  }
  emit();
}

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayLabel = (day: string) => { const d = new Date(`${day}T12:00:00`); return `${DAY[d.getDay()]} ${MONTH[d.getMonth()]} ${d.getDate()}`; };
const LENGTHS = [5, 15, 30, 45];
const HOW = ["Call", "Email", "Text", "In person"] as const;
const TIME_LENGTHS = [15, 30, 45, 60, 90];
const KIND_SHORT: Record<TimeKind, string> = { direct: "With students", indirect: "For students", support: "School support" };

/** Free office-hours slots from tomorrow on (15-minute steps). */
function freeSlots(taken: Set<string>, hours: OfficeHours, limit = 12): { day: string; time: string }[] {
  const out: { day: string; time: string }[] = [];
  const now = new Date();
  for (let k = 0; k < 21 && out.length < limit; k++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
    const oh = hours.find((o) => o.weekday === d.getDay());
    if (!oh) continue;
    const [fh, fm] = oh.from.split(":").map(Number);
    const [th, tm] = oh.to.split(":").map(Number);
    for (let t = fh * 60 + fm; t + 15 <= th * 60 + tm && out.length < limit; t += 15) {
      const time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      if (k === 0 && t <= now.getHours() * 60 + now.getMinutes()) continue;
      if (!taken.has(`${iso(d)} ${time}`)) out.push({ day: iso(d), time });
    }
  }
  return out;
}

/** Rendered once by each app shell (V5App, V6App). */
export function LogSheetHost() {
  const req = useSyncExternalStore(subscribe, () => current, () => null);
  const note = useSyncExternalStore(subscribe, () => toast, () => null);
  // client only: the portal needs document.body
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <div className="marketing-v2 themeable counselor-calm" style={{ color: "var(--foreground)" }}>
      {req && <Sheet key={`${req.mode}-${req.studentId ?? ""}-${req.day ?? ""}-${req.time ?? ""}`} req={req} />}
      {note && (
        <div role="status" className="fixed bottom-[96px] left-1/2 z-[120] flex -translate-x-1/2 items-center gap-[8px] rounded-full border px-[16px] py-[10px] text-[14px] font-semibold lg:bottom-[32px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 18px 40px -18px rgba(10,16,40,0.5)" }}>
          <Check className="h-4 w-4 v5-ok" aria-hidden /> {note}
        </div>
      )}
    </div>,
    document.body,
  );
}

function Sheet({ req }: { req: Request }) {
  const roster = useReviewedRoster();
  const added = useAddedMeetings();
  const timeLog = useTimeLog();
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<LogMode>(req.mode);
  const [student, setStudent] = useState<CounselorStudent | null>(() => roster.find((s) => s.id === req.studentId) ?? null);
  const [type, setType] = useState<MeetingType>("Check-in");
  const [minutes, setMinutes] = useState(15);
  const [notes, setNotes] = useState("");
  const [topic, setTopic] = useState("");
  const taken = useMemo(() => new Set([...seededMeetings(roster, new Date()), ...added].map((m) => `${m.day} ${m.time}`)), [roster, added]);
  const officeHours = useOfficeHours();
  const slots = useMemo(() => freeSlots(taken, officeHours), [taken, officeHours]);
  const [slot, setSlot] = useState<{ day: string; time: string } | null>(() => (req.day && req.time ? { day: req.day, time: req.time } : req.day ? slots.find((x) => x.day === req.day) ?? null : null));
  const shownSlots = slot && !slots.some((s) => s.day === slot.day && s.time === slot.time) ? [slot, ...slots] : slots;
  // family mode (a call, email or meeting with a guardian)
  const guardians = student ? guardiansFor(student) : [];
  const [guardianIdx, setGuardianIdx] = useState(0);
  const [how, setHow] = useState<(typeof HOW)[number]>("Call");
  const guardian = guardians[Math.min(guardianIdx, Math.max(0, guardians.length - 1))];
  // time mode
  const [activity, setActivity] = useState("");
  const [kind, setKind] = useState<TimeKind>("direct");
  const [timeMin, setTimeMin] = useState(30);
  const week = summarize(timeLog);
  useDialogFocus(true, ref, () => closeLog());

  const first = student?.name.split(" ")[0];
  const canSave = mode === "time" ? !!activity.trim() : mode === "book" ? !!student && !!slot : mode === "family" ? !!student && !!guardian : !!student;
  const save = () => {
    if (!canSave) return;
    const now = new Date();
    if (mode === "walkin" && student) {
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      addMeeting({ studentId: student.id, type, day: iso(now), time, minutes, topic: "Walk-in" }, notes.trim());
      if (notes.trim()) addNote(student.id, `${type} (walk-in, ${minutes} min): ${notes.trim()}`);
      logTime({ activity: `Walk-in: ${type.toLowerCase()}`, minutes, kind: "direct", studentId: student.id, auto: true });
      closeLog(`Logged ${minutes} min with ${first}`);
    } else if (mode === "book" && student && slot) {
      addMeeting({ studentId: student.id, type, day: slot.day, time: slot.time, minutes: type === "Check-in" ? 15 : 30, topic: topic.trim() });
      closeLog(`${first} booked for ${dayLabel(slot.day)}, ${timeLabel(slot.time)}`);
    } else if (mode === "family" && student && guardian) {
      addNote(student.id, `${how} with ${guardian.name} (${guardian.relation.toLowerCase()}, ${minutes} min)${notes.trim() ? `: ${notes.trim()}` : ""}`);
      logTime({ activity: `Family ${how.toLowerCase()}`, minutes, kind: "indirect", studentId: student.id, auto: true });
      closeLog(`Logged a ${how.toLowerCase()} with ${guardian.name.split(" ")[0]}`);
    } else if (mode === "time") {
      logTime({ activity: activity.trim(), minutes: timeMin, kind, auto: false });
      closeLog(`Logged ${timeMin} min: ${activity.trim()}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-[var(--space-6)]">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={() => closeLog()} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="log-title" tabIndex={-1}
        className="relative flex h-[min(720px,92dvh)] w-full flex-col overflow-hidden rounded-t-[var(--radius-xl)] border outline-none sm:max-w-[560px] sm:rounded-[var(--radius-xl)]"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 40px 90px -40px rgba(10,16,40,0.65)" }}>
        <header className="flex items-center justify-between gap-[var(--space-3)] px-[var(--space-6)] pt-[var(--space-6)] pb-[var(--space-4)]">
          <h2 id="log-title" className="text-[22px] leading-[28px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{mode === "book" ? "Book a Meeting" : mode === "walkin" ? "Log a Walk-in" : mode === "family" ? "Log a Family Contact" : "Log Time"}</h2>
          <IconTip label="Close">
            <button type="button" aria-label="Close" onClick={() => closeLog()} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>
          </IconTip>
        </header>
        <div className="px-[var(--space-6)]">
          <div role="tablist" aria-label="What to log" className="seg-track grid h-[40px] grid-cols-4 gap-[2px] rounded-[12px] p-[3px]" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
            {([["walkin", "Walk-in", UserRound], ["book", "Book", CalendarPlus], ["family", "Family", Users], ["time", "Time", Clock]] as const).map(([k, label, Icon]) => {
              const on = mode === k;
              return (
                <button key={k} type="button" role="tab" aria-selected={on} onClick={() => setMode(k)}
                  className={`seg-item dm-quiet flex h-full cursor-pointer items-center justify-center gap-[6px] rounded-[9px] text-[13.5px] ${on ? "font-semibold text-[color:var(--foreground)]" : "font-medium text-[color:var(--muted-foreground)]"}`}
                  style={{ background: on ? "color-mix(in srgb, var(--foreground) 16%, transparent)" : "transparent" }}>
                  <Icon className="h-[15px] w-[15px]" aria-hidden />{label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-6)] overflow-y-auto px-[var(--space-6)] py-[var(--space-6)]">
          {mode !== "time" && (
            <Field label="Student">
              {student ? (
                <span className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <StudentFace s={student} size={36} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] leading-[19px] font-semibold">{student.name}</span>
                    <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade}</span>
                  </span>
                  <button type="button" onClick={() => setStudent(null)} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--accent)" }}>Change</button>
                </span>
              ) : (
                <StudentSearch compact wide students={roster} onPick={setStudent} placeholder="Type a name or ID" />
              )}
            </Field>
          )}

          {mode === "family" && student && (
            <>
              <Field label="Who">
                {!guardians.length ? <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>No guardian on file.</p> : (
                <div className="flex flex-col gap-[8px]">
                  {guardians.map((g, i) => {
                    const on = i === guardianIdx;
                    return (
                      <button key={g.name} type="button" aria-pressed={on} onClick={() => setGuardianIdx(i)}
                        className="dm-quiet flex cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-left"
                        style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent" }}>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-[15px] font-semibold">{g.name}</span>
                          <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{g.relation} · {g.phone}{g.language !== "English" ? ` · ${g.language}` : ""}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                )}
              </Field>
              <Field label="How">
                <Chips options={HOW} value={how} onChange={setHow} />
              </Field>
            </>
          )}

          {mode !== "time" && mode !== "family" && (
            <Field label="About">
              <Chips options={MEETING_TYPES} value={type} onChange={setType} />
            </Field>
          )}

          {(mode === "walkin" || mode === "family") && (
            <>
              <Field label="How long">
                <Chips options={LENGTHS} value={minutes} onChange={setMinutes} format={(m) => `${m} min`} />
              </Field>
              <Field label="Notes">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What you talked about, and the next step" className="w-full resize-y rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 26%, transparent)", background: "var(--glass-surface-1)" }} />
              </Field>
            </>
          )}

          {mode === "book" && (
            <>
              <Field label="When">
                {!shownSlots.length ? (
                  <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>No office hours set. <a href={cv("profile")} onClick={() => closeLog()} className="dm-link font-semibold" style={{ color: "var(--accent)" }}>Set your office hours in Profile</a></p>
                ) : (
                <div className="grid grid-cols-2 gap-[8px] sm:grid-cols-3">
                  {shownSlots.slice(0, 9).map((sl) => {
                    const on = slot?.day === sl.day && slot?.time === sl.time;
                    return (
                      <button key={`${sl.day}${sl.time}`} type="button" aria-pressed={on} onClick={() => setSlot(sl)}
                        className="dm-quiet flex cursor-pointer flex-col items-start rounded-[var(--radius-md)] border px-[12px] py-[8px] text-left"
                        style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "transparent" }}>
                        <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{dayLabel(sl.day)}</span>
                        <span className="text-[15px] font-semibold tabular-nums">{timeLabel(sl.time)}</span>
                      </button>
                    );
                  })}
                </div>
                )}
              </Field>
              <Field label="Topic">
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Optional" className="h-11 w-full rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 26%, transparent)", background: "var(--glass-surface-1)" }} />
              </Field>
            </>
          )}

          {mode === "time" && (
            <>
              <Field label="What">
                <div className="flex flex-col gap-[var(--space-3)]">
                  <div className="flex flex-wrap gap-[8px]">
                    {QUICK_LOG.map((q) => {
                      const on = activity === q.activity;
                      return (
                        <button key={q.activity} type="button" aria-pressed={on} onClick={() => { setActivity(q.activity); setKind(q.kind); setTimeMin(q.minutes); }}
                          className="dm-quiet inline-flex h-9 cursor-pointer items-center rounded-full border px-[14px] text-[13.5px] font-semibold"
                          style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>
                          {q.activity}
                        </button>
                      );
                    })}
                  </div>
                  <input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Or type it" aria-label="Activity" className="h-11 w-full rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 26%, transparent)", background: "var(--glass-surface-1)" }} />
                </div>
              </Field>
              <Field label="How long">
                <Chips options={TIME_LENGTHS} value={timeMin} onChange={setTimeMin} format={(m) => (m >= 60 ? `${m / 60 === 1.5 ? "1.5" : m / 60} hr` : `${m} min`)} />
              </Field>
              <Field label="Counts as">
                <Chips options={["direct", "indirect", "support"] as TimeKind[]} value={kind} onChange={setKind} format={(k) => KIND_SHORT[k]} />
              </Field>
            </>
          )}
        </div>

        <footer className="flex flex-col items-stretch gap-[var(--space-3)] border-t px-[var(--space-6)] py-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
          <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>
            {mode === "walkin" || mode === "family" ? (student ? `Adds to ${first}'s notes and your time` : "Adds to notes and your time") : mode === "time" ? `This week: ${week.studentPct}% with students · goal ${ASCA_TARGET_PCT}%` : "From your office hours"}
          </span>
          <button type="button" onClick={save} disabled={!canSave} className="dm-solid inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Check className="h-4 w-4" aria-hidden /> {mode === "book" ? "Book" : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {children}
    </div>
  );
}

function Chips<T extends string | number>({ options, value, onChange, format }: { options: readonly T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-[8px]">
      {options.map((o) => {
        const on = o === value;
        return (
          <button key={String(o)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o)}
            className="dm-quiet inline-flex h-9 cursor-pointer items-center rounded-full border px-[14px] text-[13.5px] font-semibold"
            style={on ? { background: "color-mix(in srgb, var(--primary) 16%, transparent)", borderColor: "var(--primary)", color: "var(--foreground)" } : { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
            {format ? format(o) : String(o)}
          </button>
        );
      })}
    </div>
  );
}

