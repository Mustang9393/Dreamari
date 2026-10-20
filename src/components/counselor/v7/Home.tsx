"use client";

// v7 Home (20 Oct 2026), Joshua's Replit Home on the Black & Blue look:
// the greeting with Prepare for a meeting, three numbers that each open
// their work (reviews, this week's meetings, students who need you), what
// the students are interested in, and new local opportunities.
//
// What changed from the Replit, and why:
// - One lit action. The Replit lights four buttons (Prepare for a meeting
//   and one in each card); here the cards are the links and only Prepare is
//   lit, so the eye has one place to go (Chandu on v4: "A LOT in the user's
//   face").
// - Interests are the student app's career posters with the student count
//   (Maisha, 7 Oct: "Career Interests on Home as Explore cards"), opening
//   the counselor's career sheet, not the student app.
// - Opportunities are the student tab's posters, each with how many of
//   your students it fits and Share in the corner.

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CalendarCheck, ClipboardCheck, Send, Users } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { Poster } from "@/components/opportunities/Poster";
import { today } from "@/components/opportunities/match";
import { useCountUp } from "@/components/counselor/v4/overviewShared";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { timeLabel } from "@/lib/counselorMeetings";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { isoDay } from "@/lib/localRecord";
import { schoolSnapshot, toV5 } from "@/lib/counselorV5";
import { Coverflow } from "../v5/Coverflow";
import { openCareer } from "../v5/ExploreSheets";
import { mondayOf, useAllMeetings, inWeek } from "./data";
import { catalog, matchesFor } from "./oppCatalog";
import { openOpp, shareOpp } from "./OppSheets";
import { CARD, CARD_STYLE, DISPLAY, MUTED, OVERLINE, PrimaryButton, SectionHead, v7 } from "./ui";

const RAIL = "-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]";
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const subscribeDate = (notify: () => void) => { const t = window.setInterval(notify, 60000); return () => window.clearInterval(t); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

export function V7Home() {
  const roster = useReviewedRoster();
  const students = useMemo(() => roster.map(toV5), [roster]);
  const snap = useMemo(() => schoolSnapshot(students), [students]);
  const meetings = useAllMeetings(roster);
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const date = useSyncExternalStore(subscribeDate, dateSnapshot, () => "Today");
  const first = account.name ? account.name.split(" ")[0] : "";

  const [now] = useState(() => new Date());
  const monday = mondayOf(now);
  const week = meetings.filter((m) => inWeek(m, monday));
  const todayIso = isoDay(now);
  const nowHm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const next = meetings.find((m) => m.day > todayIso || (m.day === todayIso && m.time >= nowHm));
  const nextStudent = next ? roster.find((s) => s.id === next.studentId) : undefined;
  const nextWhen = next ? `${DAY[new Date(`${next.day}T12:00:00`).getDay()]} · ${timeLabel(next.time)}` : "";
  const thisWeekLeft = week.filter((m) => m.day >= todayIso).length;

  return (
    <div className="flex flex-col gap-[48px] pt-[var(--space-2)] lg:gap-[64px] lg:pt-[var(--space-4)]">
      <section className="flex flex-col gap-[var(--space-8)]">
        <div className="flex flex-col gap-[var(--space-5)] sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-[var(--space-3)]">
            <span className={OVERLINE} style={MUTED}>{date}</span>
            <h1 className="text-[36px] leading-[1.02] font-extrabold text-balance sm:text-[52px]" style={DISPLAY}>
              Welcome back{first ? `, ${first}` : ""}.
            </h1>
          </div>
          <PrimaryButton href={v7("prepare")} icon={<CalendarCheck className="h-4 w-4" aria-hidden />}>Prepare for a meeting</PrimaryButton>
        </div>

        <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3">
          <Stat href={v7("reviews")} Icon={ClipboardCheck} label="Reviews" value={snap.pendingTotal} line="waiting for you" go="Start reviewing" />
          <Stat href={v7("prepare")} Icon={CalendarCheck} label="Meetings" value={thisWeekLeft} line="left this week" go="View schedule"
            extra={nextStudent ? <><span className="font-semibold" style={{ color: "var(--foreground)" }}>Next: {nextStudent.name}</span> · {nextWhen}</> : undefined} />
          <Stat href={v7("students", "&status=need")} Icon={Users} label="Need you" value={snap.needYou.length} line={snap.needYou.length === 1 ? "student" : "students"} go="Review students"
            extra={snap.atRisk ? <><span aria-hidden className="mr-[6px] inline-block size-[7px] rounded-full align-middle" style={{ background: "var(--color-feedback-danger-solid)" }} />{snap.atRisk} at risk</> : undefined} />
        </div>
      </section>

      <section aria-label="Your students' interests" className="flex flex-col gap-[var(--space-5)]">
        <SectionHead title="Your Students' Interests" href={v7("explore")} cta="Explore careers" />
        <Coverflow mode="row" label="Careers your students save most" items={snap.topSaved.slice(0, 10).map(({ career, students: n }, k) => ({
          key: career.id, rank: k + 1, title: career.title, world: career.world, photo: career.photo, focus: career.photoFocus,
          stat: { value: String(n), label: n === 1 ? "Student" : "Students" },
          onOpen: () => openCareer({ title: career.title, world: career.world, photo: career.photo }),
        }))} />
      </section>

      <NewOpportunities />
    </div>
  );
}

/** One number and the work behind it. The whole card is the link; its
 *  label at the foot says where it goes, so no button competes with the
 *  page's one lit action. */
function Stat({ href, Icon, label, value, line, go, extra }: { href: string; Icon: typeof Users; label: string; value: number; line: string; go: string; extra?: React.ReactNode }) {
  const shown = useCountUp(value);
  return (
    <HoverBeam strength={0.6}>
      <Link href={href} className={`dm-tap group flex h-full flex-col md:min-h-[188px] gap-[var(--space-3)] p-[var(--space-5)] ${CARD}`} style={CARD_STYLE}>
        <span className={`${OVERLINE} flex items-center gap-[8px]`} style={MUTED}><Icon className="h-[15px] w-[15px]" aria-hidden />{label}</span>
        <span className="flex items-end gap-[10px]">
          <span className="text-[52px] leading-[0.95] font-extrabold tabular-nums" style={DISPLAY}><span className="sr-only">{value}</span><span aria-hidden>{shown}</span></span>
          <span className="pb-[4px] text-[14.5px] font-semibold" style={MUTED}>{line}</span>
        </span>
        <span className="min-h-[20px] text-[13.5px] leading-[20px]" style={MUTED}>{extra}</span>
        <span className="mt-auto inline-flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-brand-300))" }}>
          {go}<span aria-hidden className="transition-transform group-hover:translate-x-[2px]">→</span>
        </span>
      </Link>
    </HoverBeam>
  );
}

/** The Replit's "Local work-based learning opportunities · New this week":
 *  the soonest open listings across the shelves, each saying how many of
 *  your students it fits. */
function NewOpportunities() {
  const roster = useReviewedRoster();
  const [todayIso] = useState(() => today());
  const items = useMemo(() => {
    const all = catalog(todayIso).filter((o) => o.e.time.status === "open");
    // one of each shelf first, so the row is a mix, then the rest by date
    const seen = new Set<string>();
    const lead = all.filter((o) => (seen.has(o.shelf) ? false : (seen.add(o.shelf), true)));
    return [...lead, ...all.filter((o) => !lead.includes(o))].slice(0, 10).map((o) => ({ o, fits: matchesFor(o, roster).length }));
  }, [todayIso, roster]);
  return (
    <section aria-label="Opportunities for your students" className="flex flex-col gap-[var(--space-5)]">
      <SectionHead title="New Opportunities Near You" href={v7("opportunities")} cta="See all" />
      <div className={`poster-row ${RAIL}`} style={{ touchAction: "pan-x pan-y" }}>
        {items.map(({ o, fits }) => (
          <div key={o.e.item.id} className="w-[220px] flex-none sm:w-[236px]">
            <Poster e={o.e} status={null} kindLabel={o.kindLabel} cue={fits ? `${fits} ${fits === 1 ? "student fits" : "students fit"}` : undefined} onOpen={() => openOpp(o)}
              action={<ShareDot name={o.e.item.name} onShare={() => shareOpp(o)} />} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShareDot({ name, onShare }: { name: string; onShare: () => void }) {
  return (
    <IconTip label="Share">
      <button type="button" aria-label={`Share ${name}`} onClick={onShare} className="flex size-[36px] cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px]" style={{ background: "rgba(5,8,20,0.55)", borderColor: "rgba(255,255,255,0.22)", color: "#fff" }}>
        <Send className="h-[15px] w-[15px]" aria-hidden />
      </button>
    </IconTip>
  );
}
