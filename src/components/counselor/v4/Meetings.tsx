"use client";

// Prepare > Meetings (9 Oct 2026, Maisha's consolidation: "Combine 'This
// Week' and 'Needs a Meeting' into one section called 'Meetings'. Under
// Meetings, have two simple views: Upcoming ... and Needs Outreach ...
// Keep: Book a meeting, Log a walk-in, Student name, Meeting reason,
// Date/time. This keeps the calendar functionality without making Prepare
// feel like a separate calendar product.")
//
// The engaging pass (10 Oct 2026, Chandu: "Meetings and messages and their
// subtabs ... need super engaging and exciting like we did for awaiting me
// just now"). Same spirit as the review session (ReviewSession.tsx):
// progress you can see, a decision you can feel, people not forms, Dreamy
// drafting, a finish line.
// - Upcoming: the next meeting as the hero with a live countdown and its
//   prep (status, what they last sent, Dreamy's talking point), past
//   meetings as a one-tap "Done" list (MeetingsNext.tsx), then the week as
//   a time grid (MeetingsWeek.tsx) with the week's progress in its head.
// - Two views (10 Oct 2026, Chandu: "meetings feel really dense and
//   cluttered, maybe calendar is a view they can toggle and the other view
//   has the things"): Agenda, the default, holds the things (the hero,
//   past meetings, a calm list of the next seven days); Calendar holds only
//   the week grid. A quiet two-icon toggle on the toolbar, not a second
//   pill row; the choice is remembered per browser (useAB).
// - Needs Outreach: a session, not a list (MeetingsOutreach.tsx). "3 of 11
//   reached" sparks forward with each invite, the row takes an "Invited"
//   stamp with a burst and a chime, and Dreamy hops. Reaching everyone
//   ends on Dreamy and a fanfare. Booking a student counts as reaching
//   them. Nothing sends unread and nothing leaves on its own (see that
//   file).
// Then, the same day: "So much text right now on this page needs to
// reduce", so no explainer lines, numbers over words, each figure once;
// and the glasses Dreamy (GlassesDreamy) in every session moment.
//
// Unchanged: the calendar's behaviour, &tab=outreach (v5's &tab=needs maps
// here via cv()), Book and Log a walk-in through v5's one booking sheet
// (LogSheet's openLog), the grade filter, "neediest first".

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CalendarPlus, List, UserRound } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { useAB } from "../abTests";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { attentionRank } from "@/lib/counselorRoster";
import { isPast, useMeetingsDone } from "@/lib/counselorMeetings";
import { useCounselorFilters } from "../shell";
import { openLog } from "../v5/LogSheet";
import { SubTabs } from "./SubTabs";
import { useMeetings } from "../v5/Prepare";
import { MeetingsWeek } from "./MeetingsWeek";
import { ComingUp, MeetingsNext } from "./MeetingsNext";
import { MeetingsOutreach } from "./MeetingsOutreach";
import { iso, useInvites, useMinuteClock } from "./meetingsModel";
import "./today.css";
import "./prepare.css";
import "./meetings.css";

type View = "upcoming" | "outreach";
type Mode = "agenda" | "calendar";
const MODES = [{ key: "agenda" as const, label: "Agenda", Icon: List }, { key: "calendar" as const, label: "Calendar", Icon: CalendarDays }];
const NEED: Record<string, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };

export function Meetings() {
  const all = useReviewedRoster();
  const { gradeFilter } = useCounselorFilters();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const roster = useMemo(() => all.filter((s) => gradeFilter === "All Grades" || s.grade === gradeFilter), [all, gradeFilter]);
  // the same urgency order Today and v5 use, so "neediest first" agrees
  const ordered = useMemo(() => [...roster].sort((a, b) => NEED[a.status] - NEED[b.status] || (a.status === "On Track" ? a.name.localeCompare(b.name) : attentionRank(a, b))), [roster]);
  const byId = useMemo(() => new Map(ordered.map((s) => [s.id, s])), [ordered]);
  const meetings = useMeetings(ordered);
  const done = useMeetingsDone();
  const invites = useInvites();
  // a minute clock, so the next meeting and the ones that are over move on
  // by themselves while the page is open
  const tick = useMinuteClock();
  const now = useMemo(() => (tick ? new Date(tick) : new Date()), [tick]);
  const upcoming = meetings.filter((m) => !isPast(m, now) && !done[m.id]);
  const next = upcoming[0];
  const twoWeeksAgo = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14));
  const over = meetings.filter((m) => m.day >= twoWeeksAgo && isPast(m, now));
  const toLog = over.filter((m) => !done[m.id]).reverse();
  // the agenda lists the next seven days after the hero's meeting
  const weekOut = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7));
  // agenda (the things) or calendar (the week grid), remembered per browser
  const [mode, setMode] = useAB<Mode>("v4-meetings-view", "agenda");

  // Needs Outreach: students Dreamari flags with nothing booked into office
  // hours from this week on. Reached = invited this week, or booked or met
  // by the counselor (added meetings carry "a-" ids, LogSheet's addMeeting).
  const monday = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)));
  const seededBooked = new Set(meetings.filter((m) => m.day >= monday && !m.id.startsWith("a-")).map((m) => m.studentId));
  const addedBooked = new Set(meetings.filter((m) => m.day >= monday && m.id.startsWith("a-")).map((m) => m.studentId));
  const flagged = ordered.filter((s) => s.status !== "On Track" && !seededBooked.has(s.id));
  const invitedIds = new Set(flagged.filter((s) => (invites[s.id]?.at ?? "").slice(0, 10) >= monday).map((s) => s.id));
  const bookedIds = new Set(flagged.filter((s) => addedBooked.has(s.id)).map((s) => s.id));
  const toReach = flagged.filter((s) => !invitedIds.has(s.id) && !bookedIds.has(s.id));

  const [view, setViewState] = useState<View>(() => (params.get("tab") === "outreach" || params.get("tab") === "needs" ? "outreach" : "upcoming"));
  const setView = (v: View) => {
    setViewState(v);
    // keep the address in step, so Back and a reload land on the same view
    const nextParams = new URLSearchParams(params.toString());
    if (v === "outreach") nextParams.set("tab", "outreach");
    else nextParams.delete("tab");
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="v4-mtg v4-sections flex flex-col">
      <div className="prep-toolbar">
        <SubTabs ariaLabel="Meetings view" value={view} onChange={setView} options={[{ key: "upcoming", label: "Upcoming", count: upcoming.length }, { key: "outreach", label: "Needs Outreach", count: toReach.length }]} />
        <div className="prep-toolbar-actions">
          {view === "upcoming" && (
            <span className="mtg-mode" role="group" aria-label="Upcoming layout">
              {MODES.map(({ key, label, Icon }) => (
                <IconTip key={key} label={label}>
                  <button type="button" onClick={() => setMode(key)} aria-pressed={mode === key} aria-label={label} className="dm-quiet"><Icon className="h-4 w-4" aria-hidden /></button>
                </IconTip>
              ))}
            </span>
          )}
          <button type="button" className="prep-action is-quiet" onClick={() => openLog({ mode: "walkin" })}><UserRound className="h-4 w-4" aria-hidden />Log a walk-in</button>
          <button type="button" className="prep-action is-primary" onClick={() => openLog({ mode: "book" })}><CalendarPlus className="h-4 w-4" aria-hidden />Book a meeting</button>
        </div>
      </div>
      {view === "upcoming" ? (
        mode === "calendar" ? (
          <MeetingsWeek meetings={meetings} roster={ordered} now={now} done={done} />
        ) : (
          <div className="mtg-agenda v4-sections">
            <MeetingsNext next={next} toLog={toLog} anyOver={over.length > 0} byId={byId} now={now} onOutreach={() => setView("outreach")} />
            <ComingUp meetings={upcoming.slice(1).filter((m) => m.day <= weekOut)} byId={byId} now={now} />
          </div>
        )
      ) : (
        <MeetingsOutreach flagged={flagged} invitedIds={invitedIds} bookedIds={bookedIds} monday={monday} now={now} />
      )}
    </div>
  );
}

