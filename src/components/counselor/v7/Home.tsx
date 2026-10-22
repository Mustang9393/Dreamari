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
import { ArrowUpRight, CalendarCheck, Send } from "lucide-react";
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
import { Constellation, FIGURES } from "@/components/app/Constellation";
import { openOpp, shareOpp } from "./OppSheets";
import { SECTIONS, CARD, CARD_STYLE, DISPLAY, FIGURE, MUTED, OVERLINE, PrimaryButton, SectionHead, TITLE, v7 } from "./ui";

const RAIL = "-mx-5 flex gap-[24px] sm:gap-[32px] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]";
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
    <div className={SECTIONS}>
      <section className="flex flex-col gap-[var(--space-8)]">
        <div className="flex flex-col gap-[var(--space-5)] sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-[var(--space-3)]">
            <span className={OVERLINE} style={MUTED}>{date}</span>
            <h1 className={TITLE} style={DISPLAY}>
              Welcome back{first ? `, ${first}` : ""}.
            </h1>
          </div>
          <PrimaryButton href={v7("prepare")} icon={<CalendarCheck className="h-4 w-4" aria-hidden />}>Prepare for a meeting</PrimaryButton>
        </div>

        <div className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-3 lg:gap-[var(--space-6)]">
          <Stat figure="reviews" href={v7("reviews")} label="Reviews" value={snap.pendingTotal} go="Start reviewing"
            line={snap.pending[0] ? <>Most: <span className="font-semibold" style={{ color: "var(--foreground)" }}>{snap.pending[0].key}</span></> : "All caught up"} />
          <Stat figure="meetings" href={v7("prepare")} label="Meetings this week" value={thisWeekLeft} go="View schedule"
            line={nextStudent ? <>Next: <span className="font-semibold" style={{ color: "var(--foreground)" }}>{nextStudent.name}</span> · {nextWhen}</> : "Nothing booked"} />
          <Stat figure="people" href={v7("students", "&status=need")} label="Students who need you" value={snap.needYou.length} go="Review students"
            line={snap.atRisk ? <><span aria-hidden className="mr-[7px] inline-block size-[7px] rounded-full align-[1px]" style={{ background: "var(--color-feedback-danger-solid)" }} /><span className="font-semibold" style={{ color: "var(--foreground)" }}>{snap.atRisk}</span> at risk</> : "None at risk"} />
        </div>
      </section>

      <section aria-label="Your students' interests" className="flex flex-col gap-[var(--space-5)]">
        <SectionHead title="Your Students' Interests" href={v7("explore")} cta="Explore careers" />
        <Coverflow mode="row" roomy label="Careers your students save most" items={snap.topSaved.slice(0, 10).map(({ career, students: n }, k) => ({
          key: career.id, rank: k + 1, title: career.title, world: career.world, photo: career.photo, focus: career.photoFocus,
          stat: { value: String(n), label: n === 1 ? "Student" : "Students" },
          onOpen: () => openCareer({ title: career.title, world: career.world, photo: career.photo }),
        }))} />
      </section>

      <NewOpportunities />
    </div>
  );
}

/** One number and the one thing to act on (20 Oct 2026, Chandu: "make the
 *  3 summary cards more aesthetic and simple and useful"). Three parts only:
 *  the label, the number, one line that says what to do next (the queue that
 *  is biggest, who is next, how many are at risk). The text link at the foot
 *  became a corner arrow: the whole card is the link, the arrow says so, and
 *  no words compete with the page's one lit action. */
// Vibrant (22 Oct 2026, Chandu: "the first 3 cards in v4 and v7 should be
// more vibrant somehow. Because right now they are muted compared to the
// career cards below"): the glass stays, but each card carries a bloom of
// the brand blue from its top-left corner, a brighter blue edge, and the
// figure is the sheet's gradient numeral (SheetHero) with a soft blue halo,
// so the three read as lit objects next to the photo posters. Blue only:
// the status colours stay on the one at-risk dot (the counselor budget).
const STAT_STYLE: React.CSSProperties = {
  ...CARD_STYLE,
  borderColor: "color-mix(in srgb, var(--primary) 42%, var(--glass-border))",
  background: "radial-gradient(130% 110% at 0% 0%, color-mix(in srgb, var(--primary) 34%, transparent), transparent 58%), radial-gradient(90% 80% at 100% 110%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 60%), var(--glass-surface-2)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 48px -28px color-mix(in srgb, var(--primary) 55%, transparent)",
};
const STAT_FIGURE: React.CSSProperties = {
  ...DISPLAY,
  backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 45%, #ffffff) 0%, var(--primary) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: "drop-shadow(0 0 14px color-mix(in srgb, var(--primary) 45%, transparent))",
};

export function Stat({ href, label, value, line, go, figure }: { href: string; label: string; value: number; line: React.ReactNode; go: string; /** the card's hover constellation */ figure: keyof typeof FIGURES }) {
  const shown = useCountUp(value);
  return (
    <HoverBeam strength={0.9}>
      <Link href={href} aria-label={`${value} ${label.toLowerCase()}. ${go}`} className={`dm-tap group relative flex h-full flex-col gap-[var(--space-2)] overflow-hidden p-[var(--space-6)] ${CARD} v7-stat`} style={STAT_STYLE}>
        <span className="flex items-center justify-between gap-[var(--space-3)]">
          <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)", opacity: 0.86 }}>{label}</span>
          <span aria-hidden className="flex size-[32px] flex-none items-center justify-center rounded-full border transition-colors group-hover:border-[color:var(--color-text-brand)]" style={{ borderColor: "color-mix(in srgb, var(--primary) 50%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}>
            <ArrowUpRight className="h-[15px] w-[15px] transition-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
          </span>
        </span>
        <span className={`${FIGURE} w-fit pt-[var(--space-2)]`} style={STAT_FIGURE}><span className="sr-only">{value}</span><span aria-hidden>{shown}</span></span>
        <span className="relative z-[1] truncate text-[14px] leading-[20px]" style={MUTED}>{line}</span>
        <Constellation figure={figure} />
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
