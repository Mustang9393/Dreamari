"use client";
/* eslint-disable @next/next/no-img-element -- Existing locally hosted student artwork; responsive crops are controlled by V6 CSS. */

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Play,
  ArrowRight,
  Search,
  Sun,
  Moon,
  Bookmark,
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
import { careerSlug } from "@/components/career/slug";
import { COLLEGES } from "@/components/colleges/data";
import { SchoolCard } from "@/components/colleges/shared";
import { useGlobalTheme } from "@/components/app/theme";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { MobileNav, Wordmark } from "@/components/app/chrome";
import { PosterCard } from "@/components/app/PosterCard";
import { TextTabs } from "@/components/app/TextTabs";
import { Listbox } from "../v4/Listbox";
import { ProductivitySuite } from "../v4/ProductivitySuite";
import { CounselorConnect } from "../v4/CounselorConnect";
import { CounselorImpact } from "../v4/CounselorImpact";
import {
  students,
  featured,
  domains,
  indicators,
  type Domain,
  type Indicator,
} from "./data";
import { attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { closingSoon } from "@/lib/counselorV5";
import { Coverflow } from "../v5/Coverflow";
import { GenAvatar } from "./GenAvatar";
import { LineAvatar } from "./LineAvatar";
import { ABSwitch, useAB } from "../abTests";
import { LIVE_TRAITS, PORTRAIT_TRAITS } from "./avatarTraits";
import "./v6.css";
import "../v5/v5.css";
import { setCounselorBase } from "@/lib/counselorBase";
import { Dropdown, Option } from "@/components/colleges/filterKit";
import { CuratedCareerRows, WorldPills } from "../v5/Explore";
import { V5Prepare, usePrepareMerged } from "../v5/Prepare";
import { V5Profile } from "../v5/Profile";
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
const href = (area: Area, id?: string) =>
  `/counselor?v=6&view=${area.toLowerCase()}${id ? `&studentId=${encodeURIComponent(id)}` : ""}`;
/** A student's procedural avatar (GenAvatar): no photos for minors, and
 *  unlike the illustrated set it never repeats. */
function Avatar({ student }: { student: CounselorStudent }) {
  // traits come from the portrait the roster matched to this name
  const traits = student.avatarIndex >= 0 ? PORTRAIT_TRAITS[student.avatarIndex] : LIVE_TRAITS;
  const [style] = useAB<"line" | "anime">("v6-avatar", "line");
  return style === "line"
    ? <LineAvatar seed={student.id} tone={traits.t} className="six-avatar" />
    : <GenAvatar seed={student.id} traits={traits} className="six-avatar" />;
}

/** DEMO-ONLY: mock watch counts and career tags for FOR_YOU_VIDEOS, in the
 *  same order, until views are logged (plan section 3). */
const WATCHES: { watched: number; career: string }[] = [
  { watched: 34, career: "HR Manager" },
  { watched: 41, career: "Investment Banking" },
  { watched: 22, career: "Food Scientist" },
  { watched: 29, career: "Investment Banking" },
  { watched: 18, career: "Software Engineer" },
  { watched: 26, career: "Aviation Maintenance" },
  { watched: 15, career: "Aviation Maintenance" },
];

/** Explore's For You video card (ExploreExperience VideoCard): a 9:16 clip
 *  on black with its title on the same solid scrim panel, plus the signal
 *  that earns it a place here (Chandu, 7 Oct 2026: "use the same video
 *  cards from explore... but with stats"). Plays muted while hovered. */
function ReelStatCard({ src, title, watched, career, onOpen }: { src: string; title: string; watched: number; career: string; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => { const v = ref.current; if (v && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {}); }}
      onPointerLeave={() => ref.current?.pause()}
      aria-label={`${title}, ${watched} students watched`}
      className="dm-tap relative flex aspect-[9/16] w-[220px] flex-none cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left sm:w-auto"
      style={{ borderColor: "var(--glass-surface-2)", background: "#000" }}
    >
      <video ref={ref} src={`${src}#t=0.5`} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="metadata" />
      <span className="absolute top-[12px] left-[12px] z-[1] flex flex-col items-center rounded-[var(--radius-md)] px-[12px] py-[6px]" style={{ background: "rgba(8,10,22,0.62)", color: "#fff", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        <span className="text-[22px] leading-[26px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{watched}</span>
        <span className="text-[11.5px] leading-[14px] font-semibold">Watched</span>
      </span>
      <span className="absolute top-[12px] right-[12px] z-[1] flex size-9 items-center justify-center rounded-full border" style={{ background: "rgba(5,8,20,0.72)", borderColor: "rgba(255,255,255,0.30)", color: "#fff" }}><Play size={15} aria-hidden /></span>
      <span className="relative z-[1] p-[12px]">
        <span className="flex flex-col gap-[2px] rounded-[var(--radius-lg)] border px-[14px] py-[10px]" style={{ background: "var(--scrim-heavy)", borderColor: "var(--glass-border)", color: "#fff" }}>
          <span className="text-[15px] leading-[20px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
          <span className="text-[12.5px] leading-[16px] font-medium" style={{ opacity: 0.8 }}>{career}</span>
        </span>
      </span>
    </button>
  );
}

/** DEMO-ONLY: the avatar A/B, shown next to the student lists. */
const AVATAR_AB = <ABSwitch test="v6-avatar" fallback="line" options={[{ key: "line", label: "Line art" }, { key: "anime", label: "Anime" }]} why="Avatars: line-art faces on a skin-tone disc, or our anime faces. Open because line art is more generic and calm, anime matches the student app's simulations." />;
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
function CareerShelf({ onOpen }: { onOpen: (c: CatalogCareer) => void }) {
  const [layout] = useAB<"cover" | "row">("v6-saved-layout", "cover");
  // the shared focus carousel (v5/Coverflow.tsx), #1 front and center
  return (
    <Section title="What they’re curious about" action={<ABSwitch test="v6-saved-layout" fallback="cover" options={[{ key: "cover", label: "Carousel" }, { key: "row", label: "Row" }]} why="Careers as a turning carousel (#1 front and center, turns on its own) or a row of all of them for scanning. Open because the carousel is more fun but shows one at a time." />}>
      <Coverflow mode={layout}
        label="Careers students are curious about"
        items={featured.map((c, i) => {
          // DEMO-ONLY: students exploring each career, falling with rank,
          // until per-career saves are tracked (the world count repeated
          // across careers in the same world).
          const n = Math.max(3, Math.round(students.length * (0.46 - i * 0.04)));
          return { key: c.title, rank: i + 1, title: c.title, world: c.world, photo: c.photo, stat: { value: String(n), label: "Students" }, onOpen: () => onOpen(c) };
        })}
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
  const { theme, toggle } = useGlobalTheme();
  const area: Area | "Profile" = view === "profile" ? "Profile" :
    areas.find((a) => a.toLowerCase() === view) ||
    (["review-queue", "productivity", "connect", "impact"].includes(view || "")
      ? "Workspace"
      : "Home");
  const [selectedCareer, setSelectedCareer] = useState<CatalogCareer | null>(
    null,
  );
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [video, setVideo] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selectedCareer || video !== null) {
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [selectedCareer, video]);
  const pendingReviews = students.reduce((n, st) => n + Object.values(st.milestones).filter((m) => m === "Pending Review").length, 0);
  // four, so the hero fills the height of the queue card beside it
  const deadlines = closingSoon(students, 4);
  const add = (c: CatalogCareer) => {
    setShortlist((s) => (s.includes(c.title) ? s : [...s, c.title]));
    setNotice(`${c.title} added to your meeting shortlist.`);
  };
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
         wrapped to two rows there). */}
      <MobileNav
        active={merged && area === "Workspace" ? "Prepare" : area}
        items={[
          { label: "Home", href: href("Home"), Icon: House },
          { label: "Students", href: href("Students"), Icon: Users },
          { label: "Explore", href: href("Explore"), Icon: Compass },
          { label: "Prepare", href: href("Prepare"), Icon: ClipboardList },
          { label: "Analytics", href: href("Analytics"), Icon: BarChart3 },
        ]}
        profile={merged
          ? { href: "/counselor?v=6&view=profile", label: "Sarah Chen", src: "/images/connect/avatars/pro-tanaka.jpg" }
          : { href: href("Workspace"), label: "Workspace", node: <span className="six-identity six-identity-sm">SC</span> }}
      />
      <main className="six-main" id="main">
        {area === "Home" && (
          <>
            <Heading
              title="Welcome back, Sarah."
            >
              <Link
                className="six-primary"
                href={href("Prepare", students[0].id)}
              >
                Prepare for a meeting <ArrowUpRight size={17} />
              </Link>
            </Heading>
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
                  <Link className="six-primary" href={href("Workspace")}>
                    Start reviewing <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="six-closing">
                  <span className="six-label">Closing soon</span>
                  <ul>
                    {deadlines.map((d) => (
                      <li key={d.id}>
                        <Link href={d.href.startsWith("/counselor") ? href("Students") : d.href}>
                          <span>
                            <strong>{d.title}</strong>
                            <small>{d.when}{d.days !== null ? ` · ${d.days} days` : ""}</small>
                          </span>
                          {/* A count, not faces: the portrait set repeats, so faces
                             cannot tell a counselor who is who (Chandu, 7 Oct). */}
                          <span className="six-count">{d.students.length} {d.students.length === 1 ? "student" : "students"}</span>
                        </Link>
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
                <Link href={href("Students")} className="six-text">
                  See all <ArrowRight size={16} />
                </Link>
              </section>
            </div>
            <CareerShelf onOpen={setSelectedCareer} />
            {/* Most watched career videos, with the signal that justifies
               them (Chandu, 7 Oct 2026): how many students watched each
               and the career it shows. DEMO-ONLY: video views are not logged
               and videos are not tagged to careers yet (plan section 3);
               WATCHES is seeded mock data until they are. */}
            <Section title="Most watched by your students">
              <div className="flex gap-[14px] overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
                {[...FOR_YOU_VIDEOS.map((v, i) => ({ v, i, ...WATCHES[i] }))].sort((a, b) => b.watched - a.watched).slice(0, 5).map(({ v, i, watched, career }) => (
                  <ReelStatCard key={v.title} src={v.video} title={v.title} watched={watched} career={career} onOpen={() => setVideo(i)} />
                ))}
              </div>
            </Section>
          </>
        )}
        {area === "Students" && (studentId ? <StudentPage studentId={studentId} /> : (
          <StudentDirectory
            prepare={(s) => router.push(href("Prepare", s.id))}
          />
        ))}
        {area === "Explore" && <Explore onOpen={setSelectedCareer} />}
        {/* Prepare, the student page, the review desk and Profile are the
           shared v5 screens (Chandu, 7 Oct 2026: "do all this across v5 and
           v6"; "even v6's Prepare tab isn't intuitive"). */}
        {(area === "Prepare" || (merged && area === "Workspace")) && <V5Prepare key={`${studentId || "home"}-${area}-${tab ?? ""}`} studentId={studentId} initialTab={area === "Workspace" ? tab ?? "reviews" : tab} />}
        {view === "profile" && <V5Profile />}
        {area === "Analytics" && (
          <Analytics prepare={(s) => router.push(href("Prepare", s.id))} />
        )}
        {area === "Workspace" && !merged && <Workspace key={view} initial={view} />}
      </main>
      {notice && (
        <div className="six-toast" role="status">
          {notice}
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="six-dialog"
        onCancel={() => {
          setSelectedCareer(null);
          setVideo(null);
        }}
      >
        <button
          className="six-close"
          onClick={() => {
            setSelectedCareer(null);
            setVideo(null);
          }}
        >
          Close ×
        </button>
        {selectedCareer && (
          <>
            <img
              className="six-detail-photo"
              src={selectedCareer.photo}
              alt=""
            />
            <div className="six-detail-body">
              <p className="six-eyebrow">{selectedCareer.world}</p>
              <h2>{selectedCareer.title}</h2>
              <div className="six-two">
                <Link
                  className="six-primary"
                  href={`/career/${careerSlug(selectedCareer.title)}`}
                  target="_blank"
                >
                  Open career guide <ArrowUpRight size={16} />
                </Link>
                <button
                  className="six-secondary"
                  onClick={() => add(selectedCareer)}
                >
                  <Bookmark size={16} />
                  {shortlist.includes(selectedCareer.title)
                    ? "In meeting shortlist"
                    : "Add to meeting shortlist"}
                </button>
              </div>
              <Link
                className="six-text"
                href={href("Prepare")}
                onClick={() => setSelectedCareer(null)}
              >
                Bring this to a student meeting <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
        {video !== null && (
          <div className="six-detail-body">
            <h2>{FOR_YOU_VIDEOS[video].title}</h2>
            <video
              src={FOR_YOU_VIDEOS[video].video}
              controls
              autoPlay
              className="six-player"
            />
          </div>
        )}
      </dialog>
    </div>
  );
}

function StudentDirectory({
  prepare,
}: {
  prepare: (s: CounselorStudent) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All students");
  const filtered = students.filter(
    (s) =>
      (filter === "All students" || s.status !== "On Track") &&
      `${s.name} ${s.careerTrack}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="Students"
      >
        {AVATAR_AB}
      </Heading>
      <div className="six-toolbar">
        <label className="six-search">
          <Search size={18} />
          <input
            aria-label="Find a student"
            placeholder="Find a student or interest…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="six-tabs seg-track">
          {["All students", "Needs attention"].map((f) => (
            <button
              className="seg-item"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              key={f}
            >
              {f}
            </button>
          ))}
        </div>
        <span>{filtered.length} students</span>
      </div>
      <div className="six-directory">
        {filtered.map((s) => (
          <button
            className="six-student six-glass"
            onClick={() => prepare(s)}
            key={s.id}
          >
            <div className="six-row">
              <Avatar student={s} />
              <span
                className={`six-status ${s.status === "On Track" ? "good" : s.status === "At Risk" ? "risk" : "warn"}`}
              >
                {s.status}
              </span>
            </div>
            <h2>{s.name}</h2>
            <p>
              Grade {s.grade} · {s.careerTrack}
            </p>
            <div className="six-track">
              <i style={{ width: `${s.roadmapPct}%` }} />
            </div>
            <div className="six-row six-between">
              <small>{s.roadmapPct}% milestone progress</small>
              <span>
                Prepare <ArrowUpRight size={15} />
              </span>
            </div>
          </button>
        ))}
      </div>
      {!filtered.length && (
        <p>No students match “{query}”.</p>
      )}
    </>
  );
}

function Explore({ onOpen }: { onOpen: (c: CatalogCareer) => void }) {
  const [limit, setLimit] = useState(48);
  const [tab, setTab] = useState("Careers");
  const [query, setQuery] = useState("");
  const [state, setState] = useState("New Jersey");
  const [path, setPath] = useState("All pathways");
  const [world, setWorld] = useState("All");
  const [schoolList, setSchoolList] = useState<string[]>([]);
  const terms = query.toLowerCase().trim();
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
      (path !== "Skilled trades" ||
        /construction|machines|making|driving/i.test(c.world)),
  );
  return (
    <>
      <Heading
        title="Explore"
      />
      <div className="six-toolbar">
        <TextTabs
          items={["Careers", "Schools", "Labor market"].map((t) => ({ key: t, label: t }))}
          value={tab}
          onChange={setTab}
          ariaLabel="Explore"
          layoutId="six-explore-tabs"
        />
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
        <><div className="six-directory">
          {COLLEGES.filter((c) =>
            `${c.name} ${c.stateName}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
            .slice(0, limit)
            .map((c) => (
              // The student app's school card (Explore Schools' own). Save here is
              // the counselor's own meeting shortlist, never the student's
              // saved list.
              <SchoolCard
                key={c.slug}
                c={c}
                href={`/colleges/${c.slug}`}
                saved={schoolList.includes(c.slug)}
                onSave={() => setSchoolList((l) => (l.includes(c.slug) ? l.filter((x) => x !== c.slug) : [...l, c.slug]))}
                compared={false}
              />
            ))}
        </div>
        {COLLEGES.filter(c=>`${c.name} ${c.stateName}`.toLowerCase().includes(query.toLowerCase())).length > limit && <button className="six-secondary" onClick={()=>setLimit(n=>n+48)}>Show more schools</button>}
        {!COLLEGES.some(c=>`${c.name} ${c.stateName}`.toLowerCase().includes(query.toLowerCase())) && <p>No schools match “{query}”. Try another name or state.</p>}
        </>
      ) : (
        <>
          {/* categories and the curated rows, shared with v5 (Chandu,
             7 Oct 2026: "explore needs a by category thing and curated
             rows too") */}
          {tab === "Careers" && (
            <div className="flex flex-col gap-[var(--space-8)] pb-[var(--space-4)]">
              <WorldPills value={world} onChange={setWorld} />
              {!terms && world === "All" && path === "All pathways" && <CuratedCareerRows onOpen={onOpen} />}
            </div>
          )}
          <div className="six-toolbar">
            <div className="six-tabs seg-track">
              {["All pathways", "Skilled trades"].map((t) => (
                <button
                  key={t}
                  className="seg-item"
                  aria-pressed={path === t}
                  onClick={() => setPath(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {/* one compact dropdown, not a full-width panel for one control
               (Chandu, 7 Oct 2026: "why is this HUGE") */}
            {tab === "Labor market" && (
              <Dropdown quiet label="State" value={state} active={false} panel={(close) => ({
                title: "State", description: "Openings are for this state.", count: 3, noun: "state", width: 300,
                children: <div className="flex flex-col p-[8px]">{["New Jersey", "Florida", "Texas"].map((v) => <Option key={v} radio on={state === v} onToggle={() => { setState(v); close(); }} label={v} />)}</div>,
              })} />
            )}
            <span>
              {matches.length} careers
              {tab === "Labor market" ? ` · ${state}` : ""}
            </span>
          </div>
          <div className="six-career-grid">
            {matches.slice(0, limit).map((c) => (
              <CareerCard
                key={c.title}
                career={c}
                onOpen={onOpen}
                // DEMO-ONLY: mock yearly openings per state until state
                // projections are loaded (plan section 3).
                caption={tab === "Labor market" ? `${(((c.title.length * 37) % 9) + 3) * (state === "Florida" ? 170 : state === "Texas" ? 230 : 95)} openings a year in ${state}` : undefined}
              />
            ))}
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
            <p>No careers match “{query}”.</p>
          )}
        </>
      )}
    </>
  );
}

function Analytics({ prepare }: { prepare: (s: CounselorStudent) => void }) {
  const [domain, setDomain] = useState<Domain>("Readiness");
  const [selected, setSelected] = useState(0);
  const [group, setGroup] = useState("All grades");
  const [which, setWhich] = useState("Remaining");
  const metrics = indicators(domain).map((m) => ({
    ...m,
    eligible: m.eligible.filter(
      (id) =>
        group === "All grades" ||
        students.find((s) => s.id === id)?.grade === Number(group),
    ),
    ids: m.ids.filter(
      (id) =>
        group === "All grades" ||
        students.find((s) => s.id === id)?.grade === Number(group),
    ),
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
        <Listbox
          ariaLabel="Analytics grade"
          value={group}
          onChange={setGroup}
          options={["All grades", "9", "10", "11", "12"].map((value) => ({
            value,
            label: value === "All grades" ? value : `Grade ${value}`,
          }))}
        />
      </Heading>
      <TextTabs
        className="six-domains"
        items={domains.map((d) => ({ key: d, label: d }))}
        value={domain}
        onChange={(d) => {
          setDomain(d);
          setSelected(0);
          setWhich(d === "Risk" ? "Included" : "Remaining");
        }}
        ariaLabel="Analytics area"
        layoutId="six-analytics-tabs"
      />
      <div className="six-analytics-cards">
        {metrics.map((m, i) => (
          <Metric
            key={m.name}
            metric={m}
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
          <a href="/counselor?v=4&view=impact" className="six-text">
            Open impact reports <ArrowUpRight size={16} />
          </a>
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
    </>
  );
}
function Metric({
  metric: m,
  active,
  onSelect,
}: {
  metric: Indicator;
  active: boolean;
  onSelect: () => void;
}) {
  const pct = m.eligible.length
    ? Math.round((m.ids.length / m.eligible.length) * 100)
    : 0;
  return (
    <button
      className="six-metric six-glass"
      aria-pressed={active}
      onClick={onSelect}
    >
      <span className="six-row six-between">
        {m.name}
        <ArrowUpRight size={17} />
      </span>
      <div className="six-gauge">
        <svg viewBox="0 0 200 150" aria-hidden="true">
          <defs>
            <linearGradient id={`g-${m.name.replace(/\W/g, "")}`}>
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
            stroke={`url(#g-${m.name.replace(/\W/g, "")})`}
            strokeWidth="12"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${pct} 100`}
          />
        </svg>
        <strong>{m.eligible.length ? `${pct}%` : "None"}</strong>
      </div>
      <p>
        {m.ids.length} of {m.eligible.length} eligible students
      </p>
      <span className="six-metric-action">
        {active ? "Showing student breakdown" : "View student breakdown"}
      </span>
    </button>
  );
}
function Workspace({ initial }: { initial?: string }) {
  const [tab, setTab] = useState(
    initial === "productivity"
      ? "Documents"
      : initial === "connect"
        ? "Connect"
        : initial === "impact"
          ? "Impact reports"
          : "Reviews",
  );
  return (
    <>
      <Heading
        title="Workspace"
      />
      <TextTabs
        items={["Reviews", "Documents", "Connect", "Impact reports"].map((t) => ({ key: t, label: t }))}
        value={tab}
        onChange={setTab}
        ariaLabel="Workspace tools"
        layoutId="six-workspace-tabs"
      />
      {/* the review desk is the shared v5 one, outside the v4 wrapper */}
      {tab === "Reviews" ? <V5Reviews /> : (
      <div
        className="six-existing marketing-v2 themeable"
        data-counselor-version="v4"
      >
        <div className="v4-content">
          {tab === "Documents" ? (
            <ProductivitySuite />
          ) : tab === "Connect" ? (
            <CounselorConnect />
          ) : (
            <CounselorImpact />
          )}
        </div>
      </div>
      )}
    </>
  );
}
