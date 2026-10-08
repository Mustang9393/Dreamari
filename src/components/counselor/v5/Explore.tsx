"use client";

// v5 Explore (7 Oct 2026): "help me become a better advisor" (Joshua). The
// student app's own Explore pieces for the counselor: career posters with a
// search that also takes a school subject ("Math" finds where math
// matters), school posters, and real pay by state from BLS OEWS.
//
// 8 Oct 2026, redone (Chandu: "the trends addition is bad... Show the trend
// as a part of the explore page. Use the cards, simpler data, not a bunch
// of lists and bars. Use the ranking system we have already in the explore
// rows, re-do the curations. If I click on Health and Medicine still have a
// curated set of rows for Health and Medicine and have signals like what's
// growing, open in MODALS... SAME for schools"). The separate Trends tab is
// gone: each curated row is a trend (most in demand, growing fastest, what
// your students save), each card carries its one figure in the poster
// chip, a world or school type swaps in its own rows, and every card opens
// the counselor's sheet (ExploreSheets) instead of the student app.

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { ALL_CATALOG_CAREERS, BROWSE_MIGHT_NOT_KNOW, BROWSE_PUBLIC_SERVICE, BROWSE_TRADES, type CatalogCareer } from "@/components/app/catalog";
import { PosterCard, RankedPosterCard } from "@/components/app/PosterCard";
import { TextTabs } from "@/components/app/TextTabs";
import { SubTabs } from "../v4/SubTabs";
import { PillSwitch } from "./Switch";
import { EmptyView } from "@/components/app/states";
import { WORLD_COLORS } from "@/components/app/worlds";
import { careerProfile } from "@/components/career/profiles";
import { careerSlug } from "@/components/career/slug";
import { STATE_WAGES, STATE_WAGE_YEAR } from "@/components/career/stateWages";
import { COLLEGES, collegeImage, type College } from "@/components/colleges/data";
import { Dropdown, Option } from "@/components/colleges/filterKit";
import { US_STATES } from "@/lib/studentProfile";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { HOME_STATE, HOME_STATE_CODE, careerSignal, growthText, isTradeCareer, isTradeSchool, jobsText, money, noDegreeNeeded, price, payRows, schoolStudents, useSavers, type Pathway } from "./exploreData";
import { RankedSchoolPoster, SchoolPoster } from "./ExploreCards";
import { openCareer, openSchool, useShortlist } from "./ExploreSheets";

export { isTradeCareer, isTradeSchool, payRows, type Pathway } from "./exploreData";

type Tab = "careers" | "schools" | "pay";
const TABS: { key: Tab; label: string }[] = [
  { key: "careers", label: "Careers" },
  { key: "schools", label: "Schools" },
  { key: "pay", label: "Pay by State" },
];
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const PAGE = 36;
const H2 = "text-[22px] leading-[28px] font-semibold sm:text-[24px]";

// A school subject points at the worlds where it matters most, so a
// counselor can answer "I like biology" without knowing career titles.
// DEMO-ONLY: a small hand map; production builds this from O*NET knowledge
// and skills (plan section 3).
const SUBJECTS: Record<string, string[]> = {
  math: ["Business & Finance", "Tech & Engineering", "Science & Research"],
  biology: ["Health & Medicine", "Science & Research", "Farming, Animals & Nature"],
  chemistry: ["Science & Research", "Health & Medicine", "Food & Cooking"],
  art: ["Arts, Media & Sport"],
  english: ["Arts, Media & Sport", "Teaching & Education", "Law, Safety & Justice"],
  history: ["Law, Safety & Justice", "Teaching & Education"],
  "computer science": ["Tech & Engineering"],
  coding: ["Tech & Engineering"],
  shop: ["Building & Construction", "Fixing Machines & Engines", "Factories & Making Things"],
};

/** Skilled trades or everything, for the whole Explore page (Chandu, 7 Oct
 *  2026: "the all pathways and trades toggle needs to sit above everything.
 *  It should affect all curations"). */
export function PathwaySwitch({ value, onChange }: { value: Pathway; onChange: (p: Pathway) => void }) {
  return <PillSwitch label="Pathway" value={value} onChange={onChange} items={[{ key: "all", label: "All pathways" }, { key: "trades", label: "Skilled trades" }]} />;
}

/** `embedded`: inside another shell (v4) that prints its own page title. */
export function V5Explore({ embedded = false }: { embedded?: boolean } = {}) {
  // v4 takes only what it lacks (8 Oct 2026: "we can add whatever is useful
  // from v5 to v4 but not all of it"): careers and pay by state; v4 has its
  // own school views, so Schools stays out.
  const tabs = embedded ? TABS.filter((t) => t.key !== "schools") : TABS;
  const [tab, setTab] = useState<Tab>("careers");
  const [path, setPath] = useState<Pathway>("all");
  return (
    <div className={`flex flex-col gap-[var(--space-8)] ${embedded ? "" : "pt-[var(--space-2)] lg:pt-[var(--space-4)]"}`}>
      <header className="flex flex-col gap-[var(--space-5)]">
        {embedded ? (
          // Inside v4 both switches change the page, so both are v4's level 3
          // pill on one row (9 Oct 2026); v4.css restyles the pathway's
          // seg-track to match. v5 keeps its own page nav below.
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <SubTabs ariaLabel="Explore" options={tabs} value={tab} onChange={setTab} />
            <PathwaySwitch value={path} onChange={setPath} />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
              <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Explore</h1>
              <PathwaySwitch value={path} onChange={setPath} />
            </div>
            <TextTabs soft items={TABS} value={tab} onChange={setTab} ariaLabel="Explore" layoutId="v5-explore-tabs" />
          </>
        )}
      </header>
      {tab === "careers" && <Careers key={path} path={path} onOpen={openCareer} />}
      {tab === "schools" && <Schools key={path} path={path} />}
      {tab === "pay" && <Pay path={path} onOpen={openCareer} />}
    </div>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-12 w-full items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] lg:max-w-[460px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      <Search className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      <span className="sr-only">{placeholder}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" />
      {value && <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="dm-quiet flex size-7 items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>}
    </label>
  );
}

type OpenCareer = (c: CatalogCareer, row?: CatalogCareer[]) => void;

// Careers: world pills, then that world's curated rows (or the whole
// catalog's with nothing picked), then every career in it.
function Careers({ path, onOpen }: { path: Pathway; onOpen: OpenCareer }) {
  const [query, setQuery] = useState("");
  const [world, setWorld] = useState("All");
  const [shown, setShown] = useState(PAGE);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const subjectWorlds = SUBJECTS[q];
    return ALL_CATALOG_CAREERS.filter((c) =>
      (path === "all" || isTradeCareer(c)) &&
      (world === "All" || c.world === world) &&
      (!q || (subjectWorlds ? subjectWorlds.includes(c.world) : `${c.title} ${c.world}`.toLowerCase().includes(q))));
  }, [query, path, world]);
  const subject = SUBJECTS[query.trim().toLowerCase()];
  const browsing = !query.trim();
  return (
    <section aria-label="Careers" className="flex flex-col gap-[var(--space-6)]">
      <SearchField value={query} onChange={(v) => { setQuery(v); setShown(PAGE); }} placeholder="A career, a world, or a subject like Math" />
      <WorldPills value={world} trades={path === "trades"} onChange={(w) => { setWorld(w); setShown(PAGE); }} />

      {browsing && world === "All" && <ShortlistCareers onOpen={onOpen} />}
      {browsing && <CuratedCareerRows key={world} world={world} onOpen={onOpen} trades={path === "trades"} />}

      <div className="flex flex-col gap-[var(--space-4)]">
        {browsing
          ? <h2 className={H2} style={{ fontFamily: "var(--font-display)" }}>{world === "All" ? "All Careers" : `All of ${world}`}</h2>
          : <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{list.length} careers{subject ? ` where ${query.trim()} matters` : world !== "All" ? ` in ${world}` : ""}</p>}
        {list.length === 0 ? (
          <div className="py-[var(--space-8)]"><EmptyView tier={5} query={query} line="Try a subject, a world or another career." cta="Clear search" onAction={() => { setQuery(""); setWorld("All"); }} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-[repeat(auto-fill,minmax(176px,1fr))] sm:gap-[var(--space-5)]">
              {list.slice(0, shown).map((c) => <PosterCard key={c.title} fill career={c} onClick={() => onOpen(c, list)} />)}
            </div>
            {list.length > shown && <MoreButton left={list.length - shown} onClick={() => setShown((n) => n + PAGE)} />}
          </>
        )}
      </div>
    </section>
  );
}

function MoreButton({ left, onClick }: { left: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="dm-quiet mx-auto flex h-10 cursor-pointer items-center gap-[6px] rounded-full border px-[18px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
      Show more <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {left} left</span>
    </button>
  );
}

const WORLD_COUNTS = (() => {
  const counts = new Map<string, number>();
  ALL_CATALOG_CAREERS.forEach((c) => counts.set(c.world, (counts.get(c.world) ?? 0) + 1));
  return [...counts.entries()].sort((x, y) => y[1] - x[1]);
})();

/** One scrolling row of pills. Shared with v6. Three wrapped rows with
 *  counts were "too cluttered" (Chandu, 7 Oct 2026): one row, names only. */
function Pills({ items, value, onChange, label }: { items: string[]; value: string; onChange: (w: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="-mx-5 flex gap-[8px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]" style={{ maskImage: "linear-gradient(to right, transparent, #000 20px, #000 calc(100% - 48px), transparent)" }}>
      {items.map((w) => {
        const on = value === w;
        return (
          <button key={w} type="button" aria-pressed={on} onClick={() => onChange(w)}
            className={`${on ? "" : "dm-quiet "}inline-flex h-9 flex-none cursor-pointer items-center rounded-full border px-[14px] text-[13.5px] font-semibold whitespace-nowrap`}
            style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            {w}
          </button>
        );
      })}
    </div>
  );
}

export function WorldPills({ value, onChange, trades = false }: { value: string; onChange: (w: string) => void; trades?: boolean }) {
  return <Pills label="Career world" value={value} onChange={onChange} items={["All", ...WORLD_COUNTS.map(([w]) => w).filter((w) => !trades || isTradeCareer({ world: w }))]} />;
}

type CareerRow = { title: string; list: CatalogCareer[]; chip: (c: CatalogCareer) => string | undefined; ranked?: boolean };

/** The curated rows for the whole catalog or one world. Each row is one
 *  trend and each card carries that trend's figure. Ranked rows (the
 *  Top 10 numerals) alternate with poster rows so the page keeps a rhythm.
 *  Shared with v6. */
export function CuratedCareerRows({ onOpen, trades = false, world = "All" }: { onOpen: OpenCareer; trades?: boolean; world?: string }) {
  const savers = useSavers();
  const rows = useMemo<CareerRow[]>(() => {
    const inWorld = (c: CatalogCareer) => (world === "All" || c.world === world) && (!trades || isTradeCareer(c));
    const sig = payRows(HOME_STATE, trades).filter((r) => world === "All" || r.career.world === world);
    const bySig = new Map(sig.map((r) => [r.career.title, r]));
    const top = (key: "openings" | "growth" | "pay", n: number) => [...sig].sort((a, b) => b[key] - a[key]).slice(0, n).map((r) => r.career);
    const byTitle = new Map(ALL_CATALOG_CAREERS.map((c) => [c.title.toLowerCase(), c]));
    const saving = [...savers.entries()].map(([t, list]) => ({ c: byTitle.get(t), n: list.length })).filter((x): x is { c: CatalogCareer; n: number } => !!x.c && inWorld(x.c)).sort((a, b) => b.n - a.n);
    const saves = new Map(saving.map((x) => [x.c.title, x.n]));
    const jobs = (c: CatalogCareer) => { const s = bySig.get(c.title); return s ? jobsText(s.openings) : undefined; };
    const grows = (c: CatalogCareer) => { const s = bySig.get(c.title); return s ? growthText(s.growth) : undefined; };
    const pays = (c: CatalogCareer) => { const s = bySig.get(c.title) ?? careerSignal(c.title, HOME_STATE); return s ? money(s.pay) : undefined; };
    const saved = (c: CatalogCareer) => `${saves.get(c.title)} saved`;
    const studentsRow: CareerRow = { title: "Your Students Are Saving", list: saving.slice(0, 12).map((x) => x.c), chip: saved };
    if (world !== "All") {
      const quick = sig.filter((r) => noDegreeNeeded(careerProfile(careerSlug(r.career.title))?.facts.find((f) => /degree|education/i.test(f.label))?.value)).sort((a, b) => b.pay - a.pay).map((r) => r.career);
      return [
        { title: `Top 10 in ${world}`, list: top("openings", 10), chip: jobs, ranked: true },
        studentsRow,
        { title: "Growing Fastest", list: top("growth", 10), chip: grows, ranked: true },
        { title: "Top Paying", list: top("pay", 12), chip: pays },
        { title: "No Four-Year Degree Needed", list: quick.slice(0, 12), chip: pays },
      ];
    }
    const keep = (l: CatalogCareer[]) => l.filter(inWorld);
    return [
      { title: `Most in Demand in ${HOME_STATE}`, list: top("openings", 10), chip: jobs, ranked: true },
      studentsRow,
      { title: "Growing Fastest", list: top("growth", 10), chip: grows, ranked: true },
      { title: trades ? "Top Paying Trades" : "Top Paying", list: top("pay", 12), chip: pays },
      { title: "Skilled Trades", list: trades ? [] : BROWSE_TRADES, chip: pays },
      { title: trades ? "Trades They Might Not Know" : "Careers They Might Not Know", list: keep(BROWSE_MIGHT_NOT_KNOW), chip: grows },
      { title: "Public Service", list: keep(BROWSE_PUBLIC_SERVICE), chip: pays },
    ];
  }, [savers, trades, world]);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      {rows.filter((r) => r.list.length >= 3).map((r) => (
        <Row key={r.title} title={r.title}>
          {r.list.map((c, i) => r.ranked
            ? <RankedPosterCard key={c.title} career={c} rank={i + 1} chip={r.chip(c)} onClick={() => onOpen(c, r.list)} />
            : <PosterCard key={c.title} career={{ ...c, salary: r.chip(c) }} onClick={() => onOpen(c, r.list)} />)}
        </Row>
      ))}
    </div>
  );
}

/** A curated row, the student Browse rail's shape: cards bleed past the
 *  page margin and the last one peeks. */
function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-[var(--space-2)]">
      <h2 className={H2} style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="poster-row -mx-5 flex gap-[var(--space-5)] overflow-x-auto px-5 py-4 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]">{children}</div>
    </section>
  );
}

// ---- schools ----------------------------------------------------------------

const SCHOOL_KINDS = ["All", "Close to Home", "4-Year", "2-Year", "Trade and Technical", "Open Admission"] as const;
type SchoolKind = (typeof SCHOOL_KINDS)[number];
const inKind = (c: College, k: SchoolKind) =>
  k === "All" ? true
  : k === "Close to Home" ? c.state === HOME_STATE_CODE
  : k === "4-Year" ? c.level === "Bachelor's degrees"
  : k === "2-Year" ? c.level === "Associate degrees"
  : k === "Trade and Technical" ? c.level === "Certificates"
  : c.admission === "open" || c.admitRate === null;

/** Schools, the careers page's shape: a type as pills, that type's
 *  curated rows, then every school in it. Trades keeps trade schools and
 *  two-year colleges. */
function Schools({ path }: { path: Pathway }) {
  const [kind, setKind] = useState<SchoolKind>("All");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  const trades = path === "trades";
  const kinds = SCHOOL_KINDS.filter((k) => !trades || k !== "4-Year");
  const q = query.trim().toLowerCase();
  const list = COLLEGES.filter((c) => (!trades || isTradeSchool(c)) && inKind(c, kind) && (!q || `${c.name} ${c.city} ${c.stateName}`.toLowerCase().includes(q)))
    .sort((a, b) => (collegeImage(b) ? 1 : 0) - (collegeImage(a) ? 1 : 0));
  return (
    <section aria-label="Schools" className="flex flex-col gap-[var(--space-6)]">
      <SearchField value={query} onChange={(v) => { setQuery(v); setShown(PAGE); }} placeholder="A school, a city or a state" />
      <Pills label="School type" items={[...kinds]} value={kind} onChange={(k) => { setKind(k as SchoolKind); setShown(PAGE); }} />
      {!q && kind === "All" && <ShortlistSchools />}
      {!q && <CuratedSchoolRows key={kind} kind={kind} trades={trades} onOpen={openSchool} />}
      <div className="flex flex-col gap-[var(--space-4)]">
        {!q
          ? <h2 className={H2} style={{ fontFamily: "var(--font-display)" }}>{kind === "All" ? "All Schools" : `All ${kind}`}</h2>
          : <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{list.length} schools</p>}
        {list.length === 0 ? (
          <div className="py-[var(--space-8)]"><EmptyView tier={5} query={query} line="Try another name, city or state." cta="Clear search" onAction={() => { setQuery(""); setKind("All"); }} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-[repeat(auto-fill,minmax(176px,1fr))] sm:gap-[var(--space-5)]">
              {list.slice(0, shown).map((c) => <SchoolPoster key={c.slug} fill c={c} onClick={() => openSchool(c, list)} />)}
            </div>
            {list.length > shown && <MoreButton left={list.length - shown} onClick={() => setShown((n) => n + PAGE)} />}
          </>
        )}
      </div>
    </section>
  );
}

type SchoolRow = { title: string; list: College[]; chip: (c: College) => string | undefined; ranked?: boolean };

/** Curated school rows for all schools or one type. Shared with v6. */
export function CuratedSchoolRows({ trades = false, kind = "All", onOpen }: { trades?: boolean; kind?: string; onOpen: (c: College, row: College[]) => void }) {
  const roster = useReviewedRoster();
  const rows = useMemo<SchoolRow[]>(() => {
    const pool = COLLEGES.filter((c) => (!trades || isTradeSchool(c)) && inKind(c, kind as SchoolKind))
      .sort((a, b) => (collegeImage(b) ? 1 : 0) - (collegeImage(a) ? 1 : 0));
    const looking = pool.map((c) => ({ c, n: schoolStudents(c, roster).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
    const lookN = new Map(looking.map((x) => [x.c.slug, x.n]));
    const perYear = (c: College) => (c.netPrice === null ? undefined : `${price(c.netPrice)}/yr`);
    const finish = (c: College) => (c.finish === null ? undefined : `${c.finish}% finish`);
    const getIn = (c: College) => (c.admitRate === null ? "Open" : `${c.admitRate}% in`);
    const value = pool.filter((c) => c.netPrice !== null && (c.finish ?? 0) >= 40).sort((a, b) => a.netPrice! - b.netPrice!);
    const finishers = pool.filter((c) => c.finish !== null).sort((a, b) => b.finish! - a.finish!);
    const student: SchoolRow = { title: "Your Students Are Looking At", list: looking.slice(0, 12).map((x) => x.c), chip: (c) => { const n = lookN.get(c.slug) ?? 0; return `${n} ${n === 1 ? "student" : "students"}`; } };
    if (kind !== "All") {
      return [
        { title: "Best Value", list: value.slice(0, 10), chip: perYear, ranked: true },
        student,
        { title: "Strongest Finishers", list: finishers.slice(0, 10), chip: finish, ranked: true },
        { title: "Easiest to Get Into", list: pool.filter((c) => c.admitRate === null || c.admitRate >= 70).slice(0, 12), chip: getIn },
      ];
    }
    return [
      { title: "Best Value", list: value.slice(0, 10), chip: perYear, ranked: true },
      student,
      { title: "Strongest Finishers", list: finishers.slice(0, 10), chip: finish, ranked: true },
      { title: "Close to Home", list: pool.filter((c) => c.state === HOME_STATE_CODE).slice(0, 12), chip: perYear },
      { title: "Two-Year Starts", list: pool.filter((c) => c.level === "Associate degrees").slice(0, 12), chip: perYear },
      { title: "Trade and Technical", list: pool.filter((c) => c.level === "Certificates").slice(0, 12), chip: perYear },
    ];
  }, [trades, kind, roster]);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      {rows.filter((r) => r.list.length >= 3).map((r) => (
        <Row key={r.title} title={r.title}>
          {r.list.map((c, i) => r.ranked
            ? <RankedSchoolPoster key={c.slug} c={c} rank={i + 1} chip={r.chip(c)} onClick={() => onOpen(c, r.list)} />
            : <SchoolPoster key={c.slug} c={c} chip={r.chip(c)} onClick={() => onOpen(c, r.list)} />)}
        </Row>
      ))}
    </div>
  );
}

// ---- pay by state -----------------------------------------------------------

/** Pay by state, curated: short ranked lists for the state, then the full
 *  list. Pay is real (BLS OEWS). Shared with v6's Labor market. */
export function PayCuration({ state, trades, onOpen }: { state: string; trades: boolean; onOpen: OpenCareer }) {
  const rows = useMemo(() => payRows(state, trades), [state, trades]);
  const lists: { title: string; items: typeof rows; value: (r: (typeof rows)[number]) => string }[] = [
    { title: "Highest Paying", items: [...rows].sort((a, b) => b.pay - a.pay), value: (r) => money(r.pay) },
    { title: "Top Paying Trades", items: trades ? [] : [...rows].filter((r) => isTradeCareer(r.career)).sort((a, b) => b.pay - a.pay), value: (r) => money(r.pay) },
    { title: "Most Openings", items: [...rows].sort((a, b) => b.openings - a.openings), value: (r) => `${r.openings.toLocaleString()} a year` },
    { title: "Fastest Growing", items: [...rows].sort((a, b) => b.growth - a.growth), value: (r) => growthText(r.growth) },
  ];
  const shown = lists.filter((l) => l.items.length >= 3);
  return (
    // three lists sit three across, four sit two by two: never an orphan row
    <div className={`grid grid-cols-1 gap-y-[var(--space-10)] ${shown.length === 3 ? "gap-x-[var(--space-8)] lg:grid-cols-3" : "gap-x-[var(--space-12)] lg:grid-cols-2"}`}>
      {shown.map((l) => {
        const five = l.items.slice(0, 5);
        return (
          <section key={l.title} aria-label={l.title} className="flex min-w-0 flex-col gap-[var(--space-3)]">
            <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>{l.title}</h2>
            <ol className="flex flex-col">
              {five.map((r, i) => (
                <li key={r.career.title} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
                  <button type="button" onClick={() => onOpen(r.career, five.map((x) => x.career))} className="dm-quiet group -mx-[var(--space-2)] flex w-[calc(100%+var(--space-4))] cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[10px] text-left">
                    <span className="w-[20px] flex-none text-right text-[17px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>{i + 1}</span>
                    <span className="relative block h-[48px] w-[36px] flex-none overflow-hidden rounded-[7px]"><Image src={r.career.photo} alt="" fill sizes="36px" className="object-cover" /></span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[15px] leading-[19px] font-semibold">{r.career.title}</span>
                      <span className="truncate text-[12.5px] font-semibold" style={{ color: WORLD_COLORS[r.career.world] }}>{r.career.world}</span>
                    </span>
                    <span className="text-[15px] font-semibold whitespace-nowrap tabular-nums">{l.value(r)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function Pay({ path, onOpen }: { path: Pathway; onOpen: OpenCareer }) {
  const [state, setState] = useState(HOME_STATE);
  // compare two states side by side (Joshua: "eventually compare states,
  // Florida vs New Jersey"; gap 7 in the counselor UX spec)
  const [other, setOther] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const rows = useMemo(() => payRows(state, path === "trades").sort((a, b) => b.pay - a.pay), [state, path]);
  const otherPay = (c: CatalogCareer) => (other ? STATE_WAGES[careerSlug(c.title)]?.[other] : undefined);
  const stateMenu = (label: string, value: string | undefined, onPick: (st: string | null) => void, clearable: boolean) => (
    <Dropdown label={label} value={value} active={!!value} panel={(close) => ({
      title: label, description: "Pay is the state's average for the job.", count: rows.length, noun: "career", width: 340,
      children: <div className="flex flex-col p-[8px]">{clearable && <Option radio on={!value} onToggle={() => { onPick(null); close(); }} label="No comparison" />}{US_STATES.filter((st) => st !== (label === "State" ? other : state)).map((st) => <Option key={st} radio on={st === value} onToggle={() => { onPick(st); close(); }} label={st} />)}</div>,
    })} />
  );
  const visible = rows.slice(0, all ? rows.length : 20);
  return (
    <section aria-label="Pay by state" className="flex flex-col gap-[var(--space-8)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          {stateMenu("State", state, (st) => st && setState(st), false)}
          {stateMenu("Compare with", other ?? undefined, setOther, true)}
        </div>
        <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>BLS, May {STATE_WAGE_YEAR}. Average yearly pay.</p>
      </div>
      {!other && <PayCuration state={state} trades={path === "trades"} onOpen={onOpen} />}
      <section aria-label="Every career by pay" className="flex flex-col gap-[var(--space-3)]">
        <h2 className={H2} style={{ fontFamily: "var(--font-display)" }}>{other ? `${state} and ${other}` : "Every Career by Pay"}</h2>
        {other && (
          <div className="grid grid-cols-[28px_minmax(0,1fr)_110px_110px_64px] gap-x-[var(--space-3)] border-b pb-[8px] text-[12px] font-semibold tracking-[0.06em] uppercase" style={{ borderColor: RULE, color: "var(--muted-foreground)" }}>
            <span /><span>Career</span><span className="truncate text-right">{state}</span><span className="truncate text-right">{other}</span><span className="text-right">Diff</span>
          </div>
        )}
        <ol className={other ? "flex flex-col" : "gap-x-[var(--space-12)] lg:columns-2"}>
          {visible.map(({ career, pay }, i) => {
            const o = otherPay(career);
            const diff = o ? Math.round(((o - pay) / pay) * 100) : null;
            return (
              <li key={career.title} className="break-inside-avoid border-b" style={{ borderColor: RULE }}>
                <button type="button" onClick={() => onOpen(career, visible.map((r) => r.career))} className={`dm-quiet group -mx-[var(--space-2)] w-[calc(100%+var(--space-4))] cursor-pointer rounded-[var(--radius-md)] px-[var(--space-2)] py-[10px] text-left ${other ? "grid grid-cols-[28px_minmax(0,1fr)_110px_110px_64px] items-center gap-x-[var(--space-3)]" : "flex items-center gap-[var(--space-3)]"}`}>
                  <span className="w-[28px] flex-none text-right text-[15px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{career.title}</span>
                  <span className="text-right text-[15px] font-semibold tabular-nums">{money(pay)}</span>
                  {other && <span className="text-right text-[15px] font-semibold tabular-nums">{o ? money(o) : "None"}</span>}
                  {other && <span className={`text-right text-[14px] font-semibold tabular-nums ${diff === null ? "" : diff >= 0 ? "v5-ok" : "v5-risk"}`}>{diff === null ? "" : `${diff >= 0 ? "+" : ""}${diff}%`}</span>}
                </button>
              </li>
            );
          })}
        </ol>
        {rows.length > 20 && <button type="button" onClick={() => setAll((a) => !a)} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>{all ? "Show fewer" : `Show all ${rows.length}`}</button>}
      </section>
    </section>
  );
}

// The counselor's shortlist, first on Explore once there is one (8 Oct 2026
// audit: "Shortlist" saved to a list nobody could open).
function ShortlistCareers({ onOpen }: { onOpen: OpenCareer }) {
  const ids = useShortlist();
  const list = useMemo(() => ids.filter((x) => x.startsWith("career:")).map((x) => ALL_CATALOG_CAREERS.find((c) => careerSlug(c.title) === x.slice(7))).filter((c): c is CatalogCareer => !!c), [ids]);
  if (!list.length) return null;
  return <Row title="Your Shortlist">{list.map((c) => <PosterCard key={c.title} career={c} onClick={() => onOpen(c, list)} />)}</Row>;
}
function ShortlistSchools() {
  const ids = useShortlist();
  const list = useMemo(() => ids.filter((x) => x.startsWith("school:")).map((x) => COLLEGES.find((c) => c.slug === x.slice(7))).filter((c): c is College => !!c), [ids]);
  if (!list.length) return null;
  return <Row title="Your Shortlist">{list.map((c) => <SchoolPoster key={c.slug} c={c} onClick={() => openSchool(c, list)} />)}</Row>;
}
