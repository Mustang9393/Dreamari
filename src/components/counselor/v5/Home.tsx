"use client";

// v5 Home: "What are my students excited about, who needs me, what next?"
// (Joshua, 7 Oct 2026). The best of both builds (Chandu, same day: "home
// went too literal especially with the carousel... maybe that can still have
// some things from the overview tab or today tab from v4"):
// - v4 Today's working day: the date, the greeting, one neutral sentence
//   with what is waiting, one action, My Next Conversations and Pending
//   Reviews (Maisha's v4 review wording kept).
// - The student app's look: its posters, portraits, world colours and type.
// Open layout, not boxes (Chandu: "avoid boxes wherever possible, like v4
// did; only use boxes where absolutely useful"): the greeting, the numbers,
// the reviews and the interests sit on the page with hairlines between
// them. Only pictures get a frame: student portraits and career posters.
// Only three numbers (Joshua: "Students, % On Track, Need Attention").

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { RailCta } from "@/components/app/HomeExperience";
import { HoverBeam } from "@/components/app/HoverBeam";
import { careerSlug } from "@/components/career/slug";
import { DreamyMoment, useCountUp } from "@/components/counselor/v4/overviewShared";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, type MilestoneKey } from "@/lib/counselorRoster";
import { closingSoon, schoolSnapshot, toV5, type Deadline, type V5Student } from "@/lib/counselorV5";
import { MILESTONE_ICON } from "./milestoneIcons";
import { AvatarSwitch, StudentFace } from "./StudentFace";
import { Coverflow } from "./Coverflow";
import { ABSwitch, useAB } from "../abTests";
import { cv } from "@/lib/counselorBase";

const V5 = (view: string, extra = "") => cv(view, extra);
const studentHref = (id: string) => V5("students", `&studentId=${encodeURIComponent(id)}`);
const RAIL = "-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:gap-[var(--space-6)] sm:px-[var(--space-14)]";
const OVERLINE = "text-[12px] leading-[16px] font-bold tracking-[0.08em] uppercase";
const RULE = "color-mix(in srgb, var(--foreground) 12%, transparent)";

/** Section titles one clear step under the greeting (Chandu, 7 Oct 2026:
 *  "amazing hierarchy... breathing space"). */
function Title({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-[var(--space-4)] gap-y-[var(--space-3)]">
      <h2 className="min-w-0 text-[22px] leading-[28px] font-extrabold text-balance sm:text-[26px] sm:leading-[32px]" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      {action}
    </div>
  );
}

const subscribeDate = (notify: () => void) => { const t = window.setInterval(notify, 60000); return () => window.clearInterval(t); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
const serverDateSnapshot = () => "Today";

export function V5Home() {
  // The same reviewed roster v4 reads, so a review decision shows up here too.
  const roster = useReviewedRoster();
  const students = useMemo(() => roster.map(toV5), [roster]);
  const snap = useMemo(() => schoolSnapshot(students), [students]);
  const deadlines = useMemo(() => closingSoon(roster, 4), [roster]);
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const date = useSyncExternalStore(subscribeDate, dateSnapshot, serverDateSnapshot);
  const first = account.name ? account.name.split(" ")[0] : "";
  const needYou = snap.needYou.length;
  const router = useRouter();
  const [savedLayout] = useAB<"cover" | "row">("v5-saved-layout", "cover");
  const [world, setWorld] = useState("All");

  return (
    // Wide gaps between sections, so each one reads as its own moment.
    <div className="flex flex-col gap-[48px] pt-[var(--space-2)] lg:gap-[72px] lg:pt-[var(--space-4)]">
      {/* The greeting and the three numbers, open on the page (v4 Today). */}
      <section className="flex flex-col gap-[var(--space-6)] lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-[var(--space-3)]">
          <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>{date}</span>
          <h1 className="text-[36px] leading-[1.02] font-extrabold text-balance sm:text-[52px]" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back{first ? `, ${first}` : ""}<span style={{ color: "var(--primary)" }}>.</span>
          </h1>
          {/* No sentence restating the counts: the numbers beside this and
             Pending Reviews below already say them (Chandu, 7 Oct 2026:
             "these repetitions shouldn't be there... the less on screen the
             better"). */}
          <div className="mt-[var(--space-1)]">
            <Link href={snap.pendingTotal ? V5("workspace") : V5("students")} className="dm-solid inline-flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-body)" }}>
              {snap.pendingTotal ? "Start reviewing" : "Open students"} <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        {/* No tiles: three figures divided by hairlines, the way v4's
           signal strip read. Each opens the students behind it. */}
        <dl className="grid grid-cols-3 lg:flex">
          <Signal label="Students" value={snap.students} href={V5("students")} first />
          <Signal label="On track" value={snap.onTrackPct} suffix="%" href={V5("students")} />
          <Signal label="Need you" value={needYou} href={V5("students")} accent />
        </dl>
      </section>

      {/* Closing soon as its own row (Chandu, 7 Oct 2026: "can be a row,
         too much clutter in that right column"); time-sensitive, so right
         under the greeting. */}
      <ClosingSoon deadlines={deadlines} />

      {/* Ordered by what a counselor can act on (Chandu, 7 Oct 2026: "prioritise
         based on what's most valuable and actionable instead of vanity"):
         who needs you and what is waiting come first, then what the
         students are excited about. v4 Today's two blocks, side by side
         from lg, stacked below. */}
      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-[var(--space-12)]">
        <section aria-label="My next conversations" className="flex min-w-0 flex-col gap-[var(--space-5)]">
          <Title title="My Next Conversations" action={<span className="flex items-center gap-[var(--space-3)]"><span className="hidden md:inline-flex"><AvatarSwitch /></span><RailCta href={V5("students")}>See all</RailCta></span>} />
          {/* A sideways row on phones and tablets; four across on desktop,
             so no card is cut at the column's edge. */}
          <div className={`${RAIL} lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0`} style={{ touchAction: "pan-x pan-y" }}>
            {snap.needYou.slice(0, 6).map((s, i) => <PersonCard key={s.user.sourcedId} s={s} hideOnDesktop={i >= 4} />)}
          </div>
        </section>
        <div className="flex min-w-0 flex-col border-t pt-[var(--space-5)] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-[var(--space-8)]" style={{ borderColor: RULE }}>
          <Reviews pending={snap.pending} total={snap.pendingTotal} />
        </div>
      </div>

      {/* What the students are excited about, big and many (Chandu: "top 3
         and so small seems a little meh"; Maisha: a carousel of the top
         careers "with the top ones highlighted"). */}
      <section aria-label="What your students are saving" className="flex w-full flex-col gap-[var(--space-5)]">
        <Title title="What Your Students Are Saving" action={<span className="flex items-center gap-[var(--space-3)]"><ABSwitch test="v5-saved-layout" fallback="cover" options={[{ key: "cover", label: "Carousel" }, { key: "row", label: "Row" }]} why="Top saved careers as a turning carousel (Maisha's references, #1 front and center, turns on its own) or a row of all ten for scanning. Open because the carousel is more fun but shows one career at a time." /><RailCta href={V5("explore")}>Explore careers</RailCta></span>} />
        {/* Saving and Top Interests were the same signal at two zoom levels
           (Chandu, 7 Oct 2026: "they seem like the same thing"): one
           section now, the career worlds as filters over the careers. */}
        <div role="tablist" aria-label="Career world" className="-mx-5 flex gap-[8px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ world: "All", students: snap.students }, ...snap.worlds.slice(0, 6)].map((w) => {
            const on = world === w.world;
            return (
              <button key={w.world} type="button" role="tab" aria-selected={on} onClick={() => setWorld(w.world)}
                className="dm-quiet inline-flex h-9 flex-none cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13.5px] font-semibold whitespace-nowrap"
                style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                {w.world}{w.world !== "All" && <span className="tabular-nums" style={{ opacity: 0.7 }}>{w.students}</span>}
              </button>
            );
          })}
        </div>
        <Coverflow key={world} mode={savedLayout} label="Most saved careers" items={snap.topSaved.filter((x) => world === "All" || x.career.world === world).slice(0, 10).map(({ career, students: n }, k) => ({
          key: career.id, rank: k + 1, title: career.title, world: career.world, photo: career.photo, focus: career.photoFocus,
          stat: { value: String(n), label: n === 1 ? "Student" : "Students" }, onOpen: () => router.push(`/career/${careerSlug(career.title)}`),
        }))} />
      </section>
    </div>
  );
}

function Signal({ label, value, suffix = "", href, accent, first }: { label: string; value: number; suffix?: string; href: string; accent?: boolean; first?: boolean }) {
  const shown = useCountUp(value);
  return (
    <Link href={href} className={`dm-quiet cc-figure flex min-w-0 flex-col gap-[4px] rounded-[var(--radius-sm)] py-[var(--space-1)] ${first ? "pr-[var(--space-4)] lg:pr-[var(--space-10)]" : "border-l px-[var(--space-4)] lg:px-[var(--space-10)]"}`} style={{ borderColor: RULE }}>
      <dd className="cc-num m-0 text-[32px] leading-[36px] font-extrabold tabular-nums sm:text-[48px] sm:leading-[52px]" style={{ fontFamily: "var(--font-display)", color: accent ? "var(--accent)" : "var(--foreground)" }}>
        <span className="sr-only">{value}{suffix}</span>
        <span aria-hidden>{shown}{suffix}</span>
      </dd>
      <dt className="flex items-center gap-[2px] text-[14px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}<ChevronRight className="cc-go h-[14px] w-[14px]" aria-hidden /></dt>
    </Link>
  );
}

function milestoneIn(reason: string | undefined): MilestoneKey | undefined {
  return reason ? MILESTONE_KEYS.find((k) => reason.startsWith(k)) : undefined;
}

/** A student, Instagram-card shaped (Maisha's "choose your doctor" row):
 *  the face first, then the name and the one reason, with the milestone's
 *  icon. The whole card opens the student. */
function PersonCard({ s, hideOnDesktop = false }: { s: V5Student; hideOnDesktop?: boolean }) {
  const key = milestoneIn(s.attention?.reason);
  const Icon = key ? MILESTONE_ICON[key] : null;
  const urgent = s.attention?.severity === "Critical";
  return (
    <div className={`h-[276px] w-[196px] flex-none sm:w-[212px] lg:w-auto ${hideOnDesktop ? "lg:hidden" : ""}`}>
      <HoverBeam strength={0.7}>
        <Link href={studentHref(s.user.sourcedId)} className="dm-tap group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)" }}>
          <span className="relative block h-[164px] w-full flex-none overflow-hidden">
            <StudentFace s={s.source} fill className="transition-transform duration-500 group-hover:scale-[1.04]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px] px-[14px] pt-[12px] pb-[14px]">
            <span className="truncate text-[16px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{s.name}</span>
            <span className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
            <span className="mt-auto flex items-start gap-[6px] text-[13px] leading-[17px] font-semibold" style={{ color: urgent ? "var(--accent)" : "var(--foreground)" }}>
              {Icon && <Icon className="mt-[1px] h-[14px] w-[14px] flex-none" aria-hidden />}
              <span className="line-clamp-2">{s.attention?.reason}</span>
            </span>
          </span>
        </Link>
      </HoverBeam>
    </div>
  );
}

/** v4's Pending Reviews, open on the page: a hairline to its left on wide
 *  screens and above it on narrow ones, then the count and one row per
 *  milestone with its icon. */
function Reviews({ pending, total }: { pending: { key: MilestoneKey; count: number }[]; total: number }) {
  const shown = useCountUp(total);
  return (
    <section aria-label="Pending reviews" className="flex min-w-0 flex-col gap-[var(--space-4)]">
      <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Pending reviews</span>
      {total ? (
        <>
          <p className="flex items-end gap-[var(--space-3)]">
            <span className="text-[52px] leading-[0.9] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
              <span className="sr-only">{total}</span><span aria-hidden>{shown}</span>
            </span>
            <span className="pb-[2px] text-[14px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>submissions<br />waiting for you</span>
          </p>
          <ul className="flex flex-col">
            {pending.slice(0, 4).map(({ key, count }) => {
              const Icon = MILESTONE_ICON[key];
              return (
                <li key={key}>
                  <Link href={V5("workspace")} className="dm-quiet -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[9px]">
                    <Icon className="h-[17px] w-[17px] flex-none" style={{ color: "var(--accent)" }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-semibold">{key}</span>
                    <span className="text-[14px] font-extrabold tabular-nums">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-start gap-[var(--space-2)]">
          <DreamyMoment mood="celebrate" size={64} />
          <p className="text-[14px] leading-[20px] font-semibold">All caught up. Every submitted milestone has been reviewed.</p>
        </div>
      )}
    </section>
  );
}



/** What is closing, soonest first, with how many students it touches. */
function ClosingSoon({ deadlines }: { deadlines: Deadline[] }) {
  if (!deadlines.length) return null;
  return (
    <section aria-label="Closing soon" className="flex flex-col gap-[var(--space-3)]">
      <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Closing soon</span>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {deadlines.slice(0, 4).map((d, i) => (
          <li key={d.id} className={`border-t sm:border-t-0 ${i > 0 ? "sm:border-l" : ""} ${i === 2 ? "sm:border-l-0 lg:border-l" : ""}`} style={{ borderColor: RULE }}>
            <Link href={d.href} className="dm-quiet flex h-full flex-col gap-[4px] rounded-[var(--radius-sm)] py-[var(--space-3)] sm:px-[var(--space-5)]">
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--accent)" }}>{d.when}{d.days !== null ? ` · ${d.days} days` : ""}</span>
              <span className="line-clamp-2 text-[16px] leading-[21px] font-semibold">{d.title}</span>
              <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{d.students.length} {d.students.length === 1 ? "student" : "students"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
