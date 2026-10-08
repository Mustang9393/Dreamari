"use client";
/* eslint-disable @next/next/no-img-element -- Existing locally hosted student artwork; responsive crops are controlled by V6 CSS. */

import { useState, useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Briefcase,
  ChevronRight,
  Search,
  Sun,
  Moon,
  House,
  Users,
  Compass,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import {
  ALL_CATALOG_CAREERS,
  FOR_YOU_VIDEOS,
  type CatalogCareer,
} from "@/components/app/catalog";
import { COLLEGES } from "@/components/colleges/data";
import { useGlobalTheme } from "@/components/app/theme";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { MobileNav, Wordmark } from "@/components/app/chrome";
import { PosterCard } from "@/components/app/PosterCard";
import { TextTabs } from "@/components/app/TextTabs";
import { Listbox } from "../v4/Listbox";
import { ProductivitySuite } from "../v4/ProductivitySuite";
import { CounselorConnect } from "../v4/CounselorConnect";
import {
  useStudents,
  domains,
  indicators,
  OUTCOMES,
  OUTCOME_CLASSES,
  CLASS_2025_DESTINATIONS,
  type Domain,
} from "./data";
import { attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { closingSoon } from "@/lib/counselorV5";
import { openDeadline } from "../v5/DeadlineSheet";
import { US_STATES } from "@/lib/studentProfile";
import { isPast, useMeetingsDone } from "@/lib/counselorMeetings";
import { summarize, useTimeLog } from "@/lib/counselorTimeLog";
import { useHandledAlerts } from "@/lib/counselorOutbox";
import { CoverageBanner } from "../v5/Coverage";
import { alertIn, alertKey, checkInFor } from "../v5/family";
import { openCheckIn } from "../v5/CheckInSheet";
import { CheckInsView } from "../v5/CheckIns";
import { HOME_STATE, careerSignal, jobsText, money, useSavers } from "../v5/exploreData";
import { GradientBars, TrendChart } from "../v5/charts";
import { Coverflow } from "../v5/Coverflow";
import { LineAvatar } from "./LineAvatar";
import { ABSwitch, useAB } from "../abTests";
import { LIVE_TRAITS, PORTRAIT_TRAITS } from "./avatarTraits";
import "./v6.css";
import "../v5/v5.css";
import { setCounselorBase } from "@/lib/counselorBase";
import { Dropdown, Option } from "@/components/colleges/filterKit";
import { LogSheetHost, openLog } from "../v5/LogSheet";
import { ReelStatCard, WATCHES } from "../v5/Videos";
import { countActivity, useActivity } from "@/lib/activityEvents";
import { DreamariEngagementPanel } from "../v5/Analytics";
import { ExploreSheetHost, openCareer, openSchool } from "../v5/ExploreSheets";
import { SchoolPoster } from "../v5/ExploreCards";
import { ImpactView } from "../v5/ImpactView";
import { CuratedCareerRows, CuratedSchoolRows, PathwaySwitch, PayCuration, WorldPills, isTradeCareer, isTradeSchool, type Pathway } from "../v5/Explore";
import { V5Prepare, useMeetings, usePrepareMerged } from "../v5/Prepare";
import { V5Profile } from "../v5/Profile";
import { V5Messages } from "../v5/Messages";
import { StudentPage } from "../v5/StudentPage";
import { Reviews as V5Reviews } from "../v5/Workspace";
import "../calm.css";

const areas = [
  "Home",
  "Students",
  "Explore",
  "Prepare",
  "Workspace",
  "Analytics",
] as const;
type Area = (typeof areas)[number];
const href = (area: Area, id?: string, extra = "") =>
  `/counselor?v=6&view=${area.toLowerCase()}${id ? `&studentId=${encodeURIComponent(id)}` : ""}${extra}`;
const IMPACT_HREF = href("Analytics", undefined, "&tab=impact");
/** A student's procedural avatar (LineAvatar): no photos for minors, and
 *  unlike the illustrated set it never repeats. */
function Avatar({ student }: { student: CounselorStudent }) {
  // traits come from the portrait the roster matched to this name
  const traits = student.avatarIndex >= 0 ? PORTRAIT_TRAITS[student.avatarIndex] : LIVE_TRAITS;
  // line art only: the anime faces were dropped everywhere, toggle included
  // (Chandu, 7 Oct 2026: "let's not have the anime art style anywhere")
  return <LineAvatar seed={student.id} tone={traits.t} className="six-avatar" />;
}

function Heading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="six-heading">
      {/* The slogan overline (eyebrow) is no longer printed: it said
         nothing the title did not (Chandu: "remove anything that is
         absolutely not adding value"). */}
      <div>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="six-section">
      <div className="six-section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
/** The student app's own career poster (Chandu, 7 Oct 2026: "re-use our
 *  card components wherever possible"), with v6's one-line caption under it. */
function CareerCard({
  career,
  onOpen,
  caption,
}: {
  career: CatalogCareer;
  onOpen: (c: CatalogCareer) => void;
  caption?: string;
}) {
  return (
    <div className="six-career-slot">
      <PosterCard career={career} fill onClick={() => onOpen(career)} />
      {caption && <p className="six-career-caption">{caption}</p>}
    </div>
  );
}
function CareerShelf() {
  const [layout] = useAB<"cover" | "row">("v6-saved-layout", "cover");
  // Real saves (8 Oct 2026): the counts were a falling formula by rank and
  // disagreed with the career sheet. Now the careers your students saved
  // most, counted from the same savers the sheet reads, and the counts are
  // handed to the sheet so card and sheet always match.
  const savers = useSavers();
  const top = useMemo(() => {
    const byTitle = new Map(ALL_CATALOG_CAREERS.map((c) => [c.title.toLowerCase(), c]));
    return [...savers.entries()]
      .map(([t, list]) => ({ c: byTitle.get(t), n: list.length }))
      .filter((x): x is { c: CatalogCareer; n: number } => !!x.c && x.n > 0)
      .sort((a, b) => b.n - a.n || a.c.title.localeCompare(b.c.title))
      .slice(0, 10);
  }, [savers]);
  if (!top.length) return null;
  const row = top.map((x) => x.c);
  const saves = Object.fromEntries(top.map((x) => [x.c.title, x.n]));
  // the shared focus carousel (v5/Coverflow.tsx), #1 front and center
  return (
    <Section title="What they’re curious about" action={<ABSwitch test="v6-saved-layout" fallback="cover" options={[{ key: "cover", label: "Carousel" }, { key: "row", label: "Row" }]} why="Careers as a turning carousel (#1 front and center, turns on its own) or a row of all of them for scanning. Open because the carousel is more fun but shows one at a time." />}>
      <Coverflow mode={layout}
        label="Careers students are curious about"
        items={top.map(({ c, n }, i) => ({ key: c.title, rank: i + 1, title: c.title, world: c.world, photo: c.photo, stat: { value: String(n), label: n === 1 ? "Student" : "Students" }, onOpen: () => openCareer(c, row, { saves }) }))}
      />
    </Section>
  );
}

export function V6App({
  view,
  studentId,
}: {
  view?: string;
  studentId?: string;
}) {
  const router = useRouter();
  setCounselorBase("/counselor?v=6");
  // the shared prepare-ia A/B (v5/Prepare.tsx): Workspace inside Prepare
  const merged = usePrepareMerged();
  const tab = useSearchParams().get("tab") ?? undefined;
  const activity = useActivity();
  const { theme, toggle } = useGlobalTheme();
  const students = useStudents();
  // Workspace's old "Impact reports" duplicated Analytics > My Impact, so
  // the old view lands there (8 Oct 2026).
  const area: Area | "Profile" = view === "profile" ? "Profile" :
    areas.find((a) => a.toLowerCase() === view) ||
    (view === "impact" ? "Analytics" :
    ["review-queue", "productivity", "connect"].includes(view || "")
      ? "Workspace"
      : "Home");
  const [video, setVideo] = useState<number | null>(null);
  // Explore's tab and state live here so the career sheet reads the state
  // the Labor market tab is showing (8 Oct 2026: the sheet always said NJ).
  const [exploreTab, setExploreTab] = useState("Careers");
  const [marketState, setMarketState] = useState(HOME_STATE);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (video !== null) {
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [video]);
  const pendingReviews = students.reduce((n, st) => n + Object.values(st.milestones).filter((m) => m === "Pending Review").length, 0);
  // four, so the hero fills the height of the queue card beside it
  const deadlines = useMemo(() => closingSoon(students, 4), [students]);
  // check-in alerts, the same rule as v5 Home (8 Oct 2026): an answered
  // check-in whose note has an alert word and that nobody has handled today
  const handledAlerts = useHandledAlerts();
  const alertStudents = useMemo(() => students.filter((s) => { const c = checkInFor(s); return c.answered && alertIn(c.note) && !handledAlerts[alertKey(s.id)]; }), [students, handledAlerts]);
  // "Prepare for a meeting" opens the next booked meeting's brief, or the
  // week when nothing is booked (8 Oct 2026: it opened whoever led the list)
  const meetings = useMeetings(students);
  const done = useMeetingsDone();
  const nextMeeting = meetings.find((m) => !isPast(m) && !done[m.id]);
  // the counselor's week at a glance beside Log time, the ASCA share
  const week = summarize(useTimeLog());
  const videoCareer = video !== null ? ALL_CATALOG_CAREERS.find((c) => c.title === WATCHES[video].career) : undefined;
  return (
    // Student tokens and backdrop under v6's own layout (Chandu, 7 Oct
    // 2026: "tweak that to use our design system... keep the spacing and
    // calmness and layout in v6").
    <div className="six-app marketing-v2 themeable counselor-calm">
      <AppBackdrop />
      <header className="six-nav">
        <span className="six-brand"><Wordmark href={href("Home")} /></span>
        <nav aria-label="Counselor workspace" className="dm-scroll">
          {areas.filter((a) => !(merged && a === "Workspace")).map((a) => (
            <Link
              aria-current={area === a || (merged && a === "Prepare" && area === "Workspace") ? "page" : undefined}
              href={href(a)}
              key={a}
            >
              {a}
            </Link>
          ))}
        </nav>
        <button className="six-theme" onClick={toggle}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        {/* counselors are adults: their own photo, opening their profile */}
        <Link className="six-identity" aria-label="Sarah Chen, your profile" href="/counselor?v=6&view=profile" style={{ overflow: "hidden", padding: 0 }}>
          <img src="/images/connect/avatars/pro-tanaka.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        </Link>
      </header>
      {/* Phones and tablets get the student app's bottom bar (the pill nav
         wrapped to two rows there). With Workspace separate it gets its own
         icon slot (8 Oct 2026: the slot showed "SC" initials, which read as
         a profile), and the avatar stays the counselor's profile. */}
      <MobileNav
        active={merged && area === "Workspace" ? "Prepare" : area}
        items={[
          { label: "Home", href: href("Home"), Icon: House },
          { label: "Students", href: href("Students"), Icon: Users },
          { label: "Explore", href: href("Explore"), Icon: Compass },
          { label: "Prepare", href: href("Prepare"), Icon: ClipboardList },
          ...(merged ? [] : [{ label: "Workspace", href: href("Workspace"), Icon: Briefcase }]),
          { label: "Analytics", href: href("Analytics"), Icon: BarChart3 },
        ]}
        profile={{ href: "/counselor?v=6&view=profile", label: "Sarah Chen", src: "/images/connect/avatars/pro-tanaka.jpg" }}
      />
      <main className="six-main" id="main">
        {area === "Home" && (
          <>
            <Heading
              title="Welcome back, Sarah."
            >
              <Link
                className="six-primary"
                href={nextMeeting ? href("Prepare", nextMeeting.studentId) : href("Prepare")}
              >
                Prepare for a meeting <ArrowUpRight size={17} />
              </Link>
            </Heading>
            {/* today's notices, as on v5 Home (8 Oct 2026): coverage, then
               a check-in alert, which outranks everything below */}
            <div className="six-notices">
              <CoverageBanner />
              {alertStudents.length > 0 && (
                <button type="button" className="six-alert" onClick={() => openCheckIn(alertStudents[0].id, alertStudents.map((s) => s.id))}>
                  <AlertTriangle size={18} aria-hidden className="v5-risk" />
                  <span><strong className="v5-risk">{alertStudents.length === 1 ? "1 check-in needs" : `${alertStudents.length} check-ins need`} a response today:</strong> {alertStudents.map((s) => s.name).join(", ")}</span>
                  <ChevronRight size={16} aria-hidden />
                </button>
              )}
            </div>
            <div className="six-home-grid">
              {/* The hero answers "what needs me today" (Chandu, 7 Oct 2026):
                 what is waiting, then what is closing and whose it is. The
                 Most explored tiles repeated the shelf below and the number
                 strip repeated the queue beside it, so both are gone. */}
              <section className="six-welcome six-glass">
                <div className="six-hero-left">
                  <span className="six-label">Reviews</span>
                  <h2 className="six-hero-figure">
                    <strong>{pendingReviews}</strong>
                    <span>waiting for you</span>
                  </h2>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <Link className="six-primary" href={href("Workspace")}>
                      Start reviewing <ArrowRight size={16} />
                    </Link>
                    {/* the shared log sheet (v5/LogSheet.tsx): walk-ins,
                       bookings and time, one tap from Home */}
                    <button type="button" className="six-secondary" onClick={() => openLog({ mode: "time" })}>Log time</button>
                  </span>
                  {/* what logging adds up to, so a log is not silent
                     (8 Oct 2026); the detail is My Impact */}
                  <Link className="six-text six-week" href={IMPACT_HREF}>
                    This week: {week.studentPct}% with students <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="six-closing">
                  <span className="six-label">Closing soon</span>
                  <ul>
                    {deadlines.map((d) => (
                      <li key={d.id}>
                        {/* opens who it is for, in place, in the deadline
                           sheet shared with v5 (8 Oct 2026): the rows linked
                           out, scholarships into the student app's
                           Opportunities. Book, message and FAFSA live there. */}
                        <button type="button" onClick={() => openDeadline(d)}>
                          <span>
                            <strong>{d.title}</strong>
                            <small>{d.when}{d.days !== null ? ` · ${d.days} days` : ""}</small>
                          </span>
                          {/* A count, not faces: the portrait set repeats, so faces
                             cannot tell a counselor who is who (Chandu, 7 Oct). */}
                          <span className="six-count">{d.students.length} {d.students.length === 1 ? "student" : "students"}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              {/* A queue, not one student (Chandu: "there can be more
                 students in the suggested next convo card"). Most urgent
                 first; each opens that student's brief in Prepare. */}
              <section className="six-meeting six-glass">
                <span className="six-label">Next conversations</span>
                <ul className="six-queue">
                  {students
                    .filter((s) => s.status !== "On Track")
                    .slice(0, 4)
                    .map((s) => (
                      <li key={s.id}>
                        <Link href={href("Prepare", s.id)}>
                          <Avatar student={s} />
                          <span>
                            <strong>{s.name}</strong>
                            <small>Grade {s.grade} · {attentionReason(s)}</small>
                          </span>
                          <ArrowUpRight size={16} />
                        </Link>
                      </li>
                    ))}
                </ul>
                {/* the rest of the same queue (8 Oct 2026: it opened the
                   whole directory) */}
                <Link href={href("Students", undefined, "&tab=attention")} className="six-text">
                  See all <ArrowRight size={16} />
                </Link>
              </section>
            </div>
            <CareerShelf />
            {/* Most watched career videos, with the signal that justifies
               them (Chandu, 7 Oct 2026): how many students watched each
               and the career it shows. DEMO-ONLY: video views are not logged
               and videos are not tagged to careers yet (plan section 3);
               WATCHES is seeded mock data until they are. */}
            <Section title="Most watched by your students">
              <div className="cv-rail-sm grid grid-cols-3 gap-[14px] lg:grid-cols-5" style={{ "--rail-w": "58%" } as CSSProperties}>
                {[...FOR_YOU_VIDEOS.map((v, i) => ({ v, i, ...WATCHES[i], watched: WATCHES[i].watched + countActivity(activity, "view", v.video) }))].sort((a, b) => b.watched - a.watched).slice(0, 5).map(({ v, i, watched, career }) => (
                  <ReelStatCard key={v.title} src={v.video} title={v.title} watched={watched} career={career} onOpen={() => setVideo(i)} />
                ))}
              </div>
            </Section>
          </>
        )}
        {area === "Students" && (studentId ? <StudentPage studentId={studentId} /> : (
          <StudentDirectory
            key={tab ?? "all"}
            students={students}
            initial={tab}
          />
        ))}
        {area === "Explore" && (
          <Explore
            onOpen={openCareer}
            tab={exploreTab}
            onTab={setExploreTab}
            state={marketState}
            onState={setMarketState}
          />
        )}
        {/* Prepare, the student page, the review desk and Profile are the
           shared v5 screens (Chandu, 7 Oct 2026: "do all this across v5 and
           v6"; "even v6's Prepare tab isn't intuitive"). */}
        {(area === "Prepare" || (merged && area === "Workspace")) && <V5Prepare key={`${studentId || "home"}-${area}-${tab ?? ""}`} studentId={studentId} initialTab={area === "Workspace" ? tab ?? "reviews" : tab} />}
        {view === "profile" && <V5Profile />}
        {area === "Analytics" && (
          <Analytics
            key={`${view}-${tab ?? ""}`}
            students={students}
            initial={view === "impact" || tab === "impact" ? "My Impact" : undefined}
            prepare={(s) => router.push(href("Prepare", s.id))}
          />
        )}
        {area === "Workspace" && !merged && <Workspace key={`${view}-${tab ?? ""}`} initial={tab ?? view} />}
      </main>
      <LogSheetHost />
      {/* careers and schools open the counselor's sheets, shared with v5
         (8 Oct 2026: "the career details open into the student app from
         counselor, that's bad"); the career sheet reads the state the Labor
         market tab is showing */}
      <ExploreSheetHost state={area === "Explore" && exploreTab === "Labor market" ? marketState : HOME_STATE} />
      <dialog
        ref={dialog}
        className="six-dialog"
        onCancel={() => {
          setVideo(null);
        }}
      >
        <button
          className="six-close"
          onClick={() => {
            setVideo(null);
          }}
        >
          Close ×
        </button>
        {video !== null && (
          <div className="six-detail-body">
            <h2>{FOR_YOU_VIDEOS[video].title}</h2>
            <video
              src={FOR_YOU_VIDEOS[video].video}
              controls
              autoPlay
              className="six-player"
            />
            {/* the career it shows, in the counselor's career sheet
               (8 Oct 2026: the player was a dead end) */}
            {videoCareer && (
              <button
                type="button"
                className="six-text"
                onClick={() => {
                  setVideo(null);
                  openCareer(videoCareer);
                }}
              >
                About {videoCareer.title} <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}

const DIRECTORY_FILTERS = [
  { key: "all", label: "All students" },
  { key: "attention", label: "Needs attention" },
  { key: "checkins", label: "Check-ins" },
] as const;
type DirectoryFilter = (typeof DIRECTORY_FILTERS)[number]["key"];

function StudentDirectory({
  students,
  initial,
}: {
  students: CounselorStudent[];
  initial?: string;
}) {
  const [query, setQuery] = useState("");
  // ?tab=attention (Home's See all) and ?tab=checkins open a filter directly
  const [filter, setFilter] = useState<DirectoryFilter>(
    DIRECTORY_FILTERS.some((f) => f.key === initial) ? (initial as DirectoryFilter) : "all",
  );
  const filtered = students.filter(
    (s) =>
      (filter === "all" || s.status !== "On Track") &&
      `${s.name} ${s.careerTrack}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading title="Students" />
      <CoverageBanner />
      <div className="six-toolbar">
        {filter !== "checkins" && (
          <label className="six-search">
            <Search size={18} />
            <input
              aria-label="Find a student"
              placeholder="Find a student or interest…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
        {/* Check-ins is v5's weekly check-in view (8 Oct 2026), so the
           alert on Home has somewhere to go in v6 too */}
        <div className="six-tabs seg-track">
          {DIRECTORY_FILTERS.map((f) => (
            <button
              className="seg-item"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              key={f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filter !== "checkins" && <span>{filtered.length} students</span>}
      </div>
      {filter === "checkins" ? <CheckInsView /> : (
      <>
      {/* A card opens the student's page; Prepare is the second action
         (8 Oct 2026: the whole card went to the meeting brief, so there
         was no way to the student page from here). */}
      <div className="six-directory">
        {filtered.map((s) => (
          <div className="six-student six-glass" key={s.id}>
            <div className="six-row">
              <Avatar student={s} />
              <span
                className={`six-status ${s.status === "On Track" ? "good" : s.status === "At Risk" ? "risk" : "warn"}`}
              >
                {s.status}
              </span>
            </div>
            <h2>
              <Link className="six-stretch" href={href("Students", s.id)}>{s.name}</Link>
            </h2>
            <p>
              Grade {s.grade} · {s.careerTrack}
            </p>
            <div className="six-track">
              <i style={{ width: `${s.roadmapPct}%` }} />
            </div>
            <div className="six-row six-between">
              <small>{s.roadmapPct}% milestone progress</small>
              <Link className="six-student-prep" href={href("Prepare", s.id)} aria-label={`Prepare for ${s.name}`}>
                Prepare <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {!filtered.length && (
        <p>{query ? `No students match “${query}”.` : "No students need attention right now."}</p>
      )}
      </>
      )}
    </>
  );
}

function Explore({
  onOpen,
  tab,
  onTab,
  state,
  onState,
}: {
  onOpen: (c: CatalogCareer, row?: CatalogCareer[]) => void;
  tab: string;
  onTab: (t: string) => void;
  state: string;
  onState: (st: string) => void;
}) {
  const [limit, setLimit] = useState(48);
  const [query, setQuery] = useState("");
  const [path, setPath] = useState<Pathway>("all");
  const [world, setWorld] = useState("All");
  const market = tab === "Labor market";
  const terms = query.toLowerCase().trim();
  const schoolMatches = COLLEGES.filter((c) => (path === "all" || isTradeSchool(c)) && `${c.name} ${c.stateName}`.toLowerCase().includes(terms));
  const words =
    terms === "math"
      ? ["math", "business", "finance", "engineering", "tech"]
      : terms === "biology"
        ? ["biology", "health", "science", "nature"]
        : [terms];
  const matches = ALL_CATALOG_CAREERS.filter(
    (c) =>
      words.some((q) => `${c.title} ${c.world}`.toLowerCase().includes(q)) &&
      (world === "All" || c.world === world) &&
      (path === "all" || isTradeCareer(c)) &&
      // Labor market lists careers with figures for the state, highest pay
      // first, so every caption is a real figure
      (!market || !!careerSignal(c.title, state)),
  );
  if (market) matches.sort((a, b) => (careerSignal(b.title, state)?.pay ?? 0) - (careerSignal(a.title, state)?.pay ?? 0));
  return (
    <>
      {/* the pathway switch sits above everything and filters every row
         on every tab (Chandu, 7 Oct 2026), shared with v5 */}
      <Heading title="Explore">
        <PathwaySwitch value={path} onChange={setPath} />
      </Heading>
      <div className="six-toolbar">
        <TextTabs
          items={["Careers", "Schools", "Labor market"].map((t) => ({ key: t, label: t }))}
          value={tab}
          onChange={onTab}
          ariaLabel="Explore"
          layoutId="six-explore-tabs"
        />
        {/* the state first on Labor market, every US state (8 Oct 2026:
           it sat under the lists and offered three); one compact dropdown
           (Chandu, 7 Oct 2026: "why is this HUGE") */}
        {market && (
          <Dropdown quiet label="State" value={state} active={false} panel={(close) => ({
            title: "State", description: "Pay and openings are for this state.", count: US_STATES.length, noun: "state", width: 300,
            children: <div className="flex flex-col p-[8px]">{US_STATES.map((v) => <Option key={v} radio on={state === v} onToggle={() => { onState(v); close(); }} label={v} />)}</div>,
          })} />
        )}
        <label className="six-search">
          <Search size={18} />
          <input
            aria-label="Search Explore"
            placeholder={
              tab === "Schools"
                ? "Search schools or states…"
                : "Try Math, Biology, or a career…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {tab === "Schools" ? (
        <>{!terms && (
          <div className="pb-[var(--space-6)]">
            <CuratedSchoolRows trades={path === "trades"} onOpen={openSchool} />
          </div>
        )}
        {/* school posters open the counselor's school sheet, shared with
           v5 (8 Oct 2026: "SAME for schools") */}
        <div className="six-career-grid">
          {schoolMatches.slice(0, limit).map((c) => <SchoolPoster key={c.slug} fill c={c} onClick={() => openSchool(c, schoolMatches)} />)}
        </div>
        {/* both read the same filtered list as the grid, Trades included
           (8 Oct 2026) */}
        {schoolMatches.length > limit && <button className="six-secondary" onClick={()=>setLimit(n=>n+48)}>Show more schools</button>}
        {!schoolMatches.length && <p>No schools match “{query}”. Try another name or state.</p>}
        </>
      ) : (
        <>
          {/* categories and the curated rows, shared with v5 (Chandu,
             7 Oct 2026: "explore needs a by category thing and curated
             rows too") */}
          {tab === "Careers" && (
            <div className="flex flex-col gap-[var(--space-8)] pb-[var(--space-4)]">
              <WorldPills value={world} onChange={setWorld} trades={path === "trades"} />
              {!terms && <CuratedCareerRows key={world} world={world} onOpen={onOpen} trades={path === "trades"} />}
            </div>
          )}
          {/* the pay lists stay while searching; the results follow under
             their own heading */}
          {market && (
            <div className="pb-[var(--space-6)]"><PayCuration state={state} trades={path === "trades"} onOpen={onOpen} /></div>
          )}
          <div className="six-toolbar">
            {market && <h2 className="six-results-title">{terms ? `Results for “${query.trim()}”` : `Every career in ${state}`}</h2>}
            <span>
              {matches.length} careers
              {market ? ` · ${state}` : ""}
            </span>
          </div>
          <div className="six-career-grid">
            {matches.slice(0, limit).map((c) => {
              // BLS pay and the seeded openings the career sheet shows
              // (exploreData.careerSignal), so card and sheet agree
              const sig = market ? careerSignal(c.title, state) : null;
              return (
                <CareerCard
                  key={c.title}
                  // the poster's pay chip is the state's pay, not the
                  // catalog's national figure, so one card shows one pay
                  career={sig ? { ...c, salary: money(sig.pay) } : c}
                  onOpen={(x) => onOpen(x, matches.slice(0, limit))}
                  caption={sig ? `${jobsText(sig.openings)} a year in ${state}` : undefined}
                />
              );
            })}
          </div>
          {matches.length > limit && (
            <button
              className="six-secondary"
              onClick={() => setLimit((n) => n + 48)}
            >
              Show more careers
            </button>
          )}
          {!matches.length && (
            <p>No careers match “{query}”{market ? ` in ${state}` : ""}.</p>
          )}
        </>
      )}
    </>
  );
}

type AnalyticsArea = Domain | "My Impact";

function Analytics({
  students,
  initial,
  prepare,
}: {
  students: CounselorStudent[];
  initial?: AnalyticsArea;
  prepare: (s: CounselorStudent) => void;
}) {
  // v6's domains plus My Impact, the shared v5 page (Chandu, 7 Oct 2026:
  // "is this going in v6 or v5?"; both). ?tab=impact opens My Impact.
  const [domain, setDomain] = useState<AnalyticsArea>(initial ?? "Readiness");
  const [selected, setSelected] = useState(0);
  const [group, setGroup] = useState("All grades");
  const [which, setWhich] = useState("Remaining");
  const inGroup = (id: string) =>
    group === "All grades" ||
    students.find((s) => s.id === id)?.grade === Number(group);
  const metrics = indicators(domain === "My Impact" || domain === "Outcomes" ? "Readiness" : domain, students).map((m) => ({
    ...m,
    eligible: m.eligible.filter(inGroup),
    ids: m.ids.filter(inGroup),
  }));
  const active = metrics[selected] || metrics[0];
  const ids =
    which === "Included"
      ? active.ids
      : active.eligible.filter((id) => !active.ids.includes(id));
  return (
    <>
      <Heading
        title="Analytics"
      >
        {domain !== "My Impact" && domain !== "Outcomes" && (
          <Listbox
            ariaLabel="Analytics grade"
            value={group}
            onChange={setGroup}
            options={["All grades", "9", "10", "11", "12"].map((value) => ({
              value,
              label: value === "All grades" ? value : `Grade ${value}`,
            }))}
          />
        )}
      </Heading>
      <TextTabs
        className="six-domains"
        items={[...domains, "My Impact" as const].map((d) => ({ key: d, label: d }))}
        value={domain}
        onChange={(d) => {
          setDomain(d);
          setSelected(0);
          setWhich(d === "Risk" ? "Included" : "Remaining");
        }}
        ariaLabel="Analytics area"
        layoutId="six-analytics-tabs"
      />
      {domain === "My Impact" ? <div className="pt-[var(--space-6)]"><ImpactView /></div> : domain === "Outcomes" ? <Outcomes /> : <>
      {domain === "Engagement" && <div className="py-[var(--space-6)]"><DreamariEngagementPanel /></div>}
      <div className="six-analytics-cards">
        {metrics.map((m, i) => (
          <Metric
            key={m.name}
            name={m.name}
            pct={m.eligible.length ? Math.round((m.ids.length / m.eligible.length) * 100) : null}
            caption={`${m.ids.length} of ${m.eligible.length} eligible students`}
            active={selected === i}
            onSelect={() => setSelected(i)}
          />
        ))}
      </div>
      <div className="six-two six-analytics-bottom">
        <section className="six-glass six-brief-panel">
          <h2>{active.name}</h2>
          <p>{active.definition}</p>
          <dl className="six-facts">
            <div>
              <dt>Eligible students</dt>
              <dd>{active.eligible.length}</dd>
            </div>
            <div>
              <dt>Included students</dt>
              <dd>{active.ids.length}</dd>
            </div>
          </dl>
          <button type="button" onClick={() => setDomain("My Impact")} className="six-text">
            Open My Impact <ArrowUpRight size={16} />
          </button>
        </section>
        <section className="six-glass six-brief-panel">
          <div className="six-section-head">
            <h2>{active.action}</h2>
            <div className="six-tabs seg-track">
              {["Remaining", "Included"].map((v) => (
                <button
                  className="seg-item"
                  aria-pressed={which === v}
                  key={v}
                  onClick={() => setWhich(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="six-interventions dm-scroll">
            {students
              .filter((s) => ids.includes(s.id))
              .map((s) => (
                <button
                  className="six-intervention"
                  onClick={() => prepare(s)}
                  key={s.id}
                >
                  <Avatar student={s} />
                  <span>
                    <strong>{s.name}</strong>
                    <small>
                      Grade {s.grade} · {s.careerTrack}
                    </small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            {!ids.length && (
              <p>No students in this group for the selected grade.</p>
            )}
          </div>
        </section>
      </div>
      </>}
    </>
  );
}

/** Outcomes: prior graduating classes, the same view v5 shows (8 Oct
 *  2026): v6 listed this year's seniors as already graduated. Each card is
 *  the class of 2025's figure; the panels show the trend by class and where
 *  the class of 2025 went. DEMO-ONLY figures (data.ts OUTCOMES). */
function Outcomes() {
  const [pick, setPick] = useState(0);
  const o = OUTCOMES[pick];
  const last = OUTCOME_CLASSES[OUTCOME_CLASSES.length - 1];
  return (
    <>
      <div className="six-analytics-cards">
        {OUTCOMES.map((x, i) => (
          <Metric
            key={x.label}
            name={x.label}
            pct={x.byClass[x.byClass.length - 1]}
            caption={`Class of ${last}`}
            detail="trend by class"
            active={pick === i}
            onSelect={() => setPick(i)}
          />
        ))}
      </div>
      <div className="six-two six-analytics-bottom">
        <section className="six-glass six-brief-panel">
          <h2>{o.label}, by class</h2>
          <TrendChart key={o.label} label={`${o.label} by graduating class`} points={o.byClass.map((v, i) => ({ label: OUTCOME_CLASSES[i], value: v }))} max={100} />
        </section>
        <section className="six-glass six-brief-panel">
          <h2>Where the class of {last} went</h2>
          <GradientBars rows={CLASS_2025_DESTINATIONS} />
        </section>
      </div>
    </>
  );
}

/** A measure card. Selecting it shows its students below, so the selected
 *  state marks it, not an outward arrow (8 Oct 2026: the arrow promised a
 *  new page and only selected). */
function Metric({
  name,
  pct,
  caption,
  detail = "student breakdown",
  active,
  onSelect,
}: {
  name: string;
  /** what selecting it shows below */
  detail?: string;
  /** null: nobody is eligible */
  pct: number | null;
  caption: string;
  active: boolean;
  onSelect: () => void;
}) {
  const gid = `g-${name.replace(/\W/g, "")}`;
  return (
    <button
      className="six-metric six-glass"
      aria-pressed={active}
      onClick={onSelect}
    >
      <span className="six-row">{name}</span>
      <div className="six-gauge">
        <svg viewBox="0 0 200 150" aria-hidden="true">
          <defs>
            <linearGradient id={gid}>
              <stop stopColor="var(--six-accent)" />
              <stop offset="1" stopColor="var(--six-secondary)" />
            </linearGradient>
          </defs>
          <path
            d="M 25 125 A 85 85 0 1 1 175 125"
            fill="none"
            stroke="var(--six-line)"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength="100"
          />
          <path
            d="M 25 125 A 85 85 0 1 1 175 125"
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth="12"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${pct ?? 0} 100`}
          />
        </svg>
        <strong>{pct === null ? "None" : `${pct}%`}</strong>
      </div>
      <p>{caption}</p>
      <span className="six-metric-action">
        {active ? `Showing ${detail}` : `View ${detail}`}
      </span>
    </button>
  );
}

const WORKSPACE_TABS = [
  { key: "reviews", label: "Reviews" },
  { key: "messages", label: "Messages" },
  { key: "documents", label: "Documents" },
  { key: "connect", label: "Connect" },
] as const;
type WorkspaceTab = (typeof WORKSPACE_TABS)[number]["key"];

/** Workspace, with Workspace separate from Prepare. ?tab= picks the tab
 *  (8 Oct 2026: links like &tab=messages landed on Reviews); the old view
 *  names still work. Impact reports left: it repeated Analytics > My Impact,
 *  where view=impact now lands. */
function Workspace({ initial }: { initial?: string }) {
  const start: WorkspaceTab =
    initial === "productivity"
      ? "documents"
      : WORKSPACE_TABS.some((t) => t.key === initial)
        ? (initial as WorkspaceTab)
        : "reviews";
  const [tab, setTab] = useState<WorkspaceTab>(start);
  return (
    <>
      <Heading
        title="Workspace"
      />
      <TextTabs
        items={WORKSPACE_TABS.map((t) => ({ key: t.key, label: t.label }))}
        value={tab}
        onChange={setTab}
        ariaLabel="Workspace tools"
        layoutId="six-workspace-tabs"
      />
      {/* the review desk and messages are the shared v5 ones, outside the
         v4 wrapper */}
      {tab === "reviews" ? <V5Reviews /> : tab === "messages" ? <div className="pt-[var(--space-6)]"><V5Messages /></div> : (
      <div
        className="six-existing marketing-v2 themeable"
        data-counselor-version="v4"
      >
        <div className="v4-content">
          {tab === "documents" ? <ProductivitySuite /> : <CounselorConnect />}
        </div>
      </div>
      )}
    </>
  );
}
