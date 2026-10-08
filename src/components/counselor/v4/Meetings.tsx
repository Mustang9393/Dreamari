"use client";

// Prepare > Meetings (9 Oct 2026, Maisha's consolidation: "Combine 'This
// Week' and 'Needs a Meeting' into one section called 'Meetings'. Under
// Meetings, have two simple views: Upcoming ... and Needs Outreach ...
// Keep: Book a meeting, Log a walk-in, Student name, Meeting reason,
// Date/time. This keeps the calendar functionality without making Prepare
// feel like a separate calendar product.")
//
// So this is a list, not a calendar grid: v5's This Week (v5/Prepare.tsx)
// drew five day columns, which read as a calendar app. Here each upcoming
// meeting is one row under its day: when, who, why. Needs Outreach is v5's
// Needs a Meeting: students Dreamari flags (not On Track) with nothing
// booked from this week on, neediest first. The two views are a small pill
// toggle (one tab row per page; the area's own nav is the other), and
// &tab=outreach opens the second (v5's &tab=needs maps here via cv()).
// Booking and walk-ins go through v5's one booking sheet (LogSheet's
// openLog), the same sheet Today uses, so a meeting booked anywhere shows
// up here and on the student.

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarPlus, UserRound } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { attentionRank, attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { isPast, timeLabel, useMeetingsDone, type Meeting } from "@/lib/counselorMeetings";
import { useCounselorFilters } from "../shell";
import { openLog } from "../v5/LogSheet";
import { useMeetings } from "../v5/Prepare";
import { StudentFace } from "../v5/StudentFace";
import { DreamyMoment } from "./overviewShared";
import { STATUS_COLORS } from "./chips";
import "./today.css";
import "./prepare.css";

type View = "upcoming" | "outreach";
const NEED: Record<string, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
const studentHref = (id: string) => `/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function dayHeading(day: string, now: Date): { label: string; today: boolean } {
  const today = iso(now);
  const tomorrow = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const d = new Date(`${day}T12:00:00`);
  const date = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  if (day === today) return { label: `Today · ${date}`, today: true };
  if (day === tomorrow) return { label: `Tomorrow · ${date}`, today: false };
  return { label: date, today: false };
}

export function Meetings() {
  const all = useReviewedRoster();
  const { gradeFilter } = useCounselorFilters();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const roster = useMemo(() => all.filter((s) => gradeFilter === "All Grades" || s.grade === gradeFilter), [all, gradeFilter]);
  // the same urgency order Today and v5 use, so "neediest first" agrees
  const ordered = useMemo(() => [...roster].sort((a, b) => NEED[a.status] - NEED[b.status] || (a.status === "On Track" ? a.name.localeCompare(b.name) : attentionRank(a, b))), [roster]);
  const meetings = useMeetings(ordered);
  const done = useMeetingsDone();
  const now = new Date();
  const upcoming = meetings.filter((m) => !isPast(m, now) && !done[m.id]);
  // anyone met or booked this week or later is covered
  const monday = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)));
  const booked = new Set(meetings.filter((m) => m.day >= monday).map((m) => m.studentId));
  const outreach = ordered.filter((s) => s.status !== "On Track" && !booked.has(s.id));

  const [view, setViewState] = useState<View>(() => (params.get("tab") === "outreach" || params.get("tab") === "needs" ? "outreach" : "upcoming"));
  const setView = (v: View) => {
    setViewState(v);
    // keep the address in step, so Back and a reload land on the same view
    const next = new URLSearchParams(params.toString());
    if (v === "outreach") next.set("tab", "outreach");
    else next.delete("tab");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="prep-toolbar">
        <div role="group" aria-label="Meetings view" className="prep-pill-toggle">
          <button type="button" aria-pressed={view === "upcoming"} onClick={() => setView("upcoming")}>Upcoming <small>{upcoming.length}</small></button>
          <button type="button" aria-pressed={view === "outreach"} onClick={() => setView("outreach")}>Needs Outreach <small>{outreach.length}</small></button>
        </div>
        <div className="prep-toolbar-actions">
          <button type="button" className="prep-action is-quiet" onClick={() => openLog({ mode: "walkin" })}><UserRound className="h-4 w-4" aria-hidden />Log a walk-in</button>
          <button type="button" className="prep-action is-primary" onClick={() => openLog({ mode: "book" })}><CalendarPlus className="h-4 w-4" aria-hidden />Book a meeting</button>
        </div>
      </div>
      {view === "upcoming" ? <Upcoming meetings={upcoming} roster={ordered} now={now} /> : <Outreach students={outreach} />}
    </div>
  );
}

/** Every meeting still to come, one row each under its day: when, who,
 *  why (Maisha's three columns). The next one is tagged. The row opens the
 *  student; nothing else sits on it (density first). */
function Upcoming({ meetings, roster, now }: { meetings: Meeting[]; roster: CounselorStudent[]; now: Date }) {
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  if (!meetings.length) {
    return (
      <div className="v4-today-clear py-[var(--space-10)]">
        <DreamyMoment mood="explore" size={72} />
        <h3>No Meetings Booked</h3>
        <p>Book one, or check Needs Outreach for who may need you.</p>
      </div>
    );
  }
  const days = [...new Set(meetings.map((m) => m.day))];
  const next = meetings[0];
  return (
    <div className="flex flex-col">
      {days.map((day) => {
        const head = dayHeading(day, now);
        return (
          <section key={day} className="prep-day" aria-label={head.label}>
            <h3 className={`prep-day-head${head.today ? " is-today" : ""}`}>{head.label}</h3>
            <ul className="prep-rows">
              {meetings.filter((m) => m.day === day).map((m) => {
                const s = byId.get(m.studentId);
                if (!s) return null;
                return (
                  <li key={m.id} className="prep-row">
                    <span className="prep-row-time">{timeLabel(m.time)}<small>{m.minutes} min</small></span>
                    <Link href={studentHref(s.id)} className="prep-row-who dm-quiet">
                      <StudentFace s={s} size={40} />
                      <span className="flex min-w-0 flex-col">
                        <span className="flex min-w-0 items-center text-[15px] leading-[19px] font-semibold"><span className="truncate">{s.name}</span>{m.id === next.id && <span className="prep-next-tag">Next</span>}</span>
                        <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
                      </span>
                    </Link>
                    <span className="prep-row-reason">
                      <strong>{m.type}</strong>
                      {m.topic && <span>“{m.topic}”</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Students Dreamari flags who have nothing booked: why, then Book (the
 *  booking sheet, on the next free office-hours slot) or a walk-in. */
function Outreach({ students }: { students: CounselorStudent[] }) {
  const [all, setAll] = useState(false);
  if (!students.length) {
    return (
      <div className="v4-today-clear py-[var(--space-10)]">
        <DreamyMoment mood="celebrate" size={72} />
        <h3>Everyone Who Needs You Has a Meeting</h3>
        <p>Students Dreamari flags will show here when they have nothing booked.</p>
      </div>
    );
  }
  const shown = all ? students : students.slice(0, 12);
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <ul className="prep-rows">
        {shown.map((s) => (
          <li key={s.id} className="prep-row is-outreach">
            <Link href={studentHref(s.id)} className="prep-row-who dm-quiet">
              <StudentFace s={s} size={40} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
                <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
              </span>
            </Link>
            <span className="prep-row-reason">
              <strong style={{ color: STATUS_COLORS[s.status] }}>{s.status}</strong>
              <span>{attentionReason(s)}</span>
            </span>
            <span className="prep-row-actions">
              <IconTip label="Log a walk-in">
                <button type="button" className="v4-row-action" aria-label={`Log a walk-in with ${s.name}`} onClick={() => openLog({ mode: "walkin", studentId: s.id })}><UserRound size={16} aria-hidden /></button>
              </IconTip>
              <button type="button" className="prep-action is-quiet" style={{ height: 34, color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 45%, transparent)" }} aria-label={`Book a meeting with ${s.name}`} onClick={() => openLog({ mode: "book", studentId: s.id })}>
                <CalendarPlus className="h-[15px] w-[15px]" aria-hidden />Book
              </button>
            </span>
          </li>
        ))}
      </ul>
      {students.length > 12 && (
        <button type="button" onClick={() => setAll((a) => !a)} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--primary)" }}>{all ? "Show fewer" : `Show all ${students.length}`}</button>
      )}
    </div>
  );
}
