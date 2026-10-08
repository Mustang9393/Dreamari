"use client";

// Prepare > Meetings (9 Oct 2026, Maisha's consolidation: "Combine 'This
// Week' and 'Needs a Meeting' into one section called 'Meetings'. Under
// Meetings, have two simple views: Upcoming ... and Needs Outreach ...
// Keep: Book a meeting, Log a walk-in, Student name, Meeting reason,
// Date/time. This keeps the calendar functionality without making Prepare
// feel like a separate calendar product.")
//
// Upcoming is a week calendar (MeetingsWeek.tsx; 9 Oct 2026, Chandu on the
// first row-list version: "I think meetings can have a more calendar
// look"): days as columns, the working day as rows, meetings as blocks,
// free slots as the way to book. Needs Outreach is v5's Needs a Meeting:
// students Dreamari flags (not On Track) with nothing booked from this
// week on, neediest first. The two views are a small pill
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
import { isPast, useMeetingsDone } from "@/lib/counselorMeetings";
import { useCounselorFilters } from "../shell";
import { openLog } from "../v5/LogSheet";
import { SubTabs } from "./SubTabs";
import { useMeetings } from "../v5/Prepare";
import { MeetingsWeek } from "./MeetingsWeek";
import { StudentFace } from "../v5/StudentFace";
import { DreamyMoment } from "./overviewShared";
import { STATUS_COLORS } from "./chips";
import "./today.css";
import "./prepare.css";

type View = "upcoming" | "outreach";
const NEED: Record<string, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
const studentHref = (id: string) => `/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
        <SubTabs ariaLabel="Meetings view" value={view} onChange={setView} options={[{ key: "upcoming", label: "Upcoming", count: upcoming.length }, { key: "outreach", label: "Needs Outreach", count: outreach.length }]} />
        <div className="prep-toolbar-actions">
          <button type="button" className="prep-action is-quiet" onClick={() => openLog({ mode: "walkin" })}><UserRound className="h-4 w-4" aria-hidden />Log a walk-in</button>
          <button type="button" className="prep-action is-primary" onClick={() => openLog({ mode: "book" })}><CalendarPlus className="h-4 w-4" aria-hidden />Book a meeting</button>
        </div>
      </div>
      {view === "upcoming" ? <MeetingsWeek meetings={meetings} roster={ordered} now={now} done={done} /> : <Outreach students={outreach} />}
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
