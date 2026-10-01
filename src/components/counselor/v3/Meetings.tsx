"use client";

// Counselor Dashboard v3 (29 Sept 2026): Meetings, new. The research lists
// booking a counselor as a core student need and meeting notes as a core
// counselor one; v2 had meeting BRIEFS in the Productivity Suite but no
// meetings to hang them on. Here the week's bookings sit in the
// counselor's office hours, each one preps with the existing brief, and
// each one closes with a note that lands on the student's profile and in
// the time log as direct student time, so the 80/20 report fills itself.
//
// What needs the counselor first: meetings that happened but have no notes
// yet, then today's, then the rest of the week in time order.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, NotebookPen, Plus } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { addNote } from "@/lib/counselorNotes";
import { completeMeeting, isPast, OFFICE_HOURS, removeAddedMeeting, reopenMeeting, seededMeetings, timeLabel, useAddedMeetings, useMeetingsDone, type Meeting } from "@/lib/counselorMeetings";
import { SidePanel } from "./SidePanel";
import { MeetingForm } from "./MeetingForm";
import { logTime } from "@/lib/counselorTimeLog";
import { addDays, isoDay, shortDate } from "@/lib/localRecord";
import { Avatar } from "../chips";
import { GLASS_CARD, GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { PRIMARY } from "../palette";
import { SubTabs } from "./SubTabs";

const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Tab = "notes" | "this" | "next";

function dayName(iso: string, today: string): string {
  if (iso === today) return "Today";
  if (iso === addDays(today, 1)) return "Tomorrow";
  const [y, m, d] = iso.split("-").map(Number);
  return `${WEEKDAY[new Date(y, m - 1, d).getDay()]}, ${shortDate(iso)}`;
}

export function Meetings() {
  const router = useRouter();
  const params = useSearchParams();
  const roster = useReviewedRoster();
  const done = useMeetingsDone();
  const today = isoDay(new Date());
  // Office-hours bookings plus what the counselor added: walk-ins (done on
  // the spot) and meetings booked ahead (29 Sept 2026, "logging meetings
  // ad hoc should be simpler and easier to access").
  const added = useAddedMeetings();
  const meetings = useMemo(() => [...seededMeetings(roster), ...added].sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time)), [roster, added]);
  const [adding, setAdding] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  const focus = params.get("meeting");
  const [openId, setOpenId] = useState<string | null>(focus);
  const [draft, setDraft] = useState("");

  // Monday of this week: meetings before it belong to no tab.
  const nextMonday = (() => {
    const [y, m, d] = today.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return addDays(today, ((8 - dow) % 7) || 7);
  })();
  const needsNotes = meetings.filter((m) => isPast(m) && !done[m.id]);
  const thisWeek = meetings.filter((m) => m.day < nextMonday);
  const nextWeek = meetings.filter((m) => m.day >= nextMonday);
  const [tab, setTab] = useState<Tab>(needsNotes.length ? "notes" : "this");
  useEffect(() => {
    // A deep link to one meeting's notes (from Today) opens its tab.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follows the URL after mount, same as the rest of the dashboard's params
    if (focus) setTab(meetings.find((m) => m.id === focus && m.day >= nextMonday) ? "next" : needsNotes.some((m) => m.id === focus) ? "notes" : "this");
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = tab === "notes" ? needsNotes : tab === "this" ? thisWeek : nextWeek;
  const todays = meetings.filter((m) => m.day === today);
  const doneThisWeek = thisWeek.filter((m) => done[m.id]);
  const directMin = doneThisWeek.reduce((n, m) => n + m.minutes, 0);

  const save = (m: Meeting) => {
    const s = byId.get(m.studentId);
    const text = draft.trim();
    completeMeeting(m.id, text);
    if (s && text) addNote(s.id, `${m.type} meeting, ${shortDate(m.day)}:\n${text}`);
    logTime({ activity: `${m.type} meeting${s ? `, ${s.name}` : ""}`, minutes: m.minutes, kind: "direct", studentId: m.studentId });
    setOpenId(null);
    setDraft("");
  };

  const btn = "dm-quiet flex h-8 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[11px] text-[12.5px] font-bold";
  const groups = list.reduce<Record<string, Meeting[]>>((g, m) => ((g[m.day] ??= []).push(m), g), {});

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <HoverBeam strength={0.7} className="h-full">
            <div className="relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
              <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(PRIMARY, 0.28) }} />
              <div className="relative flex flex-wrap items-center justify-between gap-[8px]">
                <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>This week</h2>
                <button type="button" onClick={() => setAdding(true)} className="dm-solid flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] bg-[var(--primary)] px-[12px] text-[12.5px] font-bold text-[var(--primary-foreground)]"><Plus className="h-[14px] w-[14px]" aria-hidden />Log a meeting</button>
              </div>
              {flash && <p role="status" className="relative text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}><Check className="mr-[6px] inline h-[13px] w-[13px]" aria-hidden style={{ color: "var(--cd-green)" }} />{flash}</p>}
              <div className="relative grid grid-cols-3 gap-[var(--space-4)]">
                {[
                  { v: String(thisWeek.length), l: "booked" },
                  { v: String(todays.length), l: "today" },
                  { v: `${Math.floor(directMin / 60)}h ${directMin % 60}m`, l: "with students, logged" },
                ].map((x) => (
                  <span key={x.l} className="flex flex-col gap-[4px]">
                    <span className="text-[30px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{x.v}</span>
                    <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{x.l}</span>
                  </span>
                ))}
              </div>
              <p className="relative flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
                <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: needsNotes.length ? "var(--cd-amber)" : "var(--cd-green)" }} />
                {needsNotes.length ? `${needsNotes.length} ${needsNotes.length === 1 ? "meeting needs" : "meetings need"} notes` : "Every meeting has its notes"}
              </p>
            </div>
          </HoverBeam>
          <div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
            <span className="flex items-center gap-[10px]">
              <span className="flex size-[30px] items-center justify-center rounded-[8px]" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--primary)" }}><CalendarDays className="h-[15px] w-[15px]" aria-hidden /></span>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Office hours</h2>
            </span>
            <ul className="flex flex-col gap-[6px] text-[13px] font-semibold">
              {OFFICE_HOURS.map((h) => (
                <li key={h.weekday} className="flex items-center justify-between gap-[8px]">
                  <span style={{ color: "var(--muted-foreground)" }}>{WEEKDAY[h.weekday]}</span>
                  <span className="tabular-nums" style={{ color: "var(--foreground)" }}>{timeLabel(h.from)} to {timeLabel(h.to)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto text-[12.5px] leading-[18px] font-medium" style={{ color: "var(--muted-foreground)" }}>Students book 15 or 30 minutes and say what it is about.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <SubTabs
          ariaLabel="Meetings"
          value={tab}
          onChange={setTab}
          options={[
            { key: "notes", label: "Needs notes", count: needsNotes.length },
            { key: "this", label: "This week", count: thisWeek.length },
            { key: "next", label: "Next week", count: nextWeek.length },
          ]}
        />
        {list.length === 0 && <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{tab === "notes" ? "Every meeting has its notes." : "No meetings booked."}</p>}
        {Object.entries(groups).map(([day, ms]) => (
          <section key={day} className="flex flex-col gap-[6px]">
            <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: day === today ? "var(--primary)" : "var(--muted-foreground)" }}>{dayName(day, today)}</h3>
            <ul className="flex flex-col gap-[6px]">
              {ms.map((m) => {
                const s = byId.get(m.studentId);
                if (!s) return null;
                const finished = done[m.id];
                const past = isPast(m);
                const editing = openId === m.id;
                return (
                  <li key={m.id} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={{ ...GLASS_INSET, opacity: finished ? 0.7 : 1 }}>
                    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px]">
                      <span className="w-[64px] flex-none text-[12.5px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{timeLabel(m.time)}</span>
                      <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)} className="dm-quiet flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] text-left">
                        <Avatar name={s.name} size={32} index={s.avatarIndex} />
                        <span className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {m.type}, {m.minutes} min</span></span>
                          <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>&ldquo;{m.topic}&rdquo;</span>
                        </span>
                      </button>
                      {finished ? (
                        <span className="flex flex-none items-center gap-[6px]">
                          <span className="flex items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><Check className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--cd-green)" }} />{m.topic === "Walk-in" ? "Walk-in logged" : "Notes saved"}</span>
                          <button type="button" onClick={() => (m.id.startsWith("a-") && m.topic === "Walk-in" ? removeAddedMeeting(m.id) : reopenMeeting(m.id))} className={btn} style={{ borderColor: "transparent", color: "var(--muted-foreground)" }}>Undo</button>
                        </span>
                      ) : past ? (
                        <button type="button" onClick={() => { setOpenId(editing ? null : m.id); setDraft(""); }} className={btn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><NotebookPen className="h-[13px] w-[13px]" aria-hidden /> Add notes</button>
                      ) : (
                        <button type="button" onClick={() => router.push(`/counselor?view=productivity&doc=student-brief&student=${s.id}`)} className={btn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Prep brief</button>
                      )}
                    </div>
                    {editing && !finished && (
                      <div className="flex flex-col gap-[8px] pl-0 sm:pl-[76px]">
                        <label className="sr-only" htmlFor={`notes-${m.id}`}>Notes for {s.name}</label>
                        <textarea
                          id={`notes-${m.id}`}
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={3}
                          placeholder="What you talked about and the one next step"
                          className="w-full resize-y rounded-[var(--radius-sm)] border px-[10px] py-[8px] text-[13px] leading-[19px]"
                          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                        />
                        <span className="flex flex-wrap items-center gap-[8px]">
                          <button type="button" onClick={() => save(m)} className="dm-solid flex h-8 cursor-pointer items-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-[12px] text-[12.5px] font-bold text-[var(--primary-foreground)]">Save to {s.name.split(" ")[0]}&apos;s profile</button>
                          <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>Logs {m.minutes} min with students.</span>
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <SidePanel open={adding} onClose={() => setAdding(false)} title="Log a meeting" subtitle="A walk-in, or book one ahead">
        <MeetingForm onDone={(msg) => { setAdding(false); setFlash(msg); }} />
      </SidePanel>
    </div>
  );
}
