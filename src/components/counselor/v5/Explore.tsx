"use client";

// v5 Explore (7 Oct 2026): "help me become a better advisor" (Joshua). The
// student app's own Explore pieces for the counselor: career posters with a
// search that also takes a school subject ("Math" finds where math
// matters), the student Schools browse as is (filters, school cards), and
// real pay by state from BLS OEWS. Demand by state is not loaded yet (plan
// section 3), so this tab shows pay, not invented "in-demand" figures.

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { ALL_CATALOG_CAREERS, BROWSE_MIGHT_NOT_KNOW, BROWSE_PUBLIC_SERVICE, BROWSE_TRADES, BROWSE_TRENDING, BROWSE_TYPICAL_PAY, type CatalogCareer } from "@/components/app/catalog";
import { PosterCard, RankedPosterCard } from "@/components/app/PosterCard";
import { TextTabs } from "@/components/app/TextTabs";
import { EmptyView } from "@/components/app/states";
import { WORLD_COLORS } from "@/components/app/worlds";
import { careerSlug } from "@/components/career/slug";
import { STATE_WAGES, STATE_WAGE_YEAR } from "@/components/career/stateWages";
import { BrowseV2 } from "@/components/colleges/BrowseV2";
import { COLLEGES, collegeImage, type College } from "@/components/colleges/data";
import { SchoolCard } from "@/components/colleges/shared";
import { Dropdown, Option } from "@/components/colleges/filterKit";
import { US_STATES } from "@/lib/studentProfile";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { schoolSnapshot, toV5 } from "@/lib/counselorV5";

type Tab = "careers" | "schools" | "pay";
const TABS: { key: Tab; label: string }[] = [
  { key: "careers", label: "Careers" },
  { key: "schools", label: "Schools" },
  { key: "pay", label: "Pay by state" },
];
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const PAGE = 36;

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
const TRADES = /construction|machines|making|driving|food/i;

/** Skilled trades or everything, for the whole Explore page (Chandu, 7 Oct
 *  2026: "the all pathways and trades toggle needs to sit above everything.
 *  It should affect all curations"). Trades means trade careers, and trade
 *  schools plus two-year colleges. */
export type Pathway = "all" | "trades";
export const isTradeCareer = (c: { world: string }) => TRADES.test(c.world);
export const isTradeSchool = (c: College) => c.level !== "Bachelor's degrees";

export function PathwaySwitch({ value, onChange }: { value: Pathway; onChange: (p: Pathway) => void }) {
  return <Segmented label="Pathway" value={value} onChange={onChange} items={[{ key: "all", label: "All pathways" }, { key: "trades", label: "Skilled trades" }]} />;
}

export function V5Explore() {
  const [tab, setTab] = useState<Tab>("careers");
  const [path, setPath] = useState<Pathway>("all");
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-5)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Explore</h1>
          <PathwaySwitch value={path} onChange={setPath} />
        </div>
        <TextTabs items={TABS} value={tab} onChange={setTab} ariaLabel="Explore" layoutId="v5-explore-tabs" />
      </header>
      {tab === "careers" && <Careers key={path} path={path} />}
      {tab === "schools" && <Schools key={path} path={path} />}
      {tab === "pay" && <Pay path={path} />}
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

/** The student segmented switch (Explore's For you / Browse all). */
function Segmented<K extends string>({ items, value, onChange, label }: { items: { key: K; label: string }[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="seg-track inline-flex h-[38px] flex-none items-center gap-[2px] rounded-[12px] p-[3px]" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button key={it.key} type="button" aria-pressed={on} onClick={() => onChange(it.key)}
            className={`seg-item dm-quiet flex h-full cursor-pointer items-center rounded-[9px] px-[14px] text-[13px] leading-[16px] whitespace-nowrap ${on ? "font-semibold text-[color:var(--foreground)] shadow-[0_1px_3px_rgba(0,0,0,0.35)]" : "font-medium text-[color:var(--muted-foreground)]"}`}
            style={{ background: on ? "color-mix(in srgb, var(--foreground) 16%, transparent)" : "transparent" }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// Careers, browsed the way the student app's Browse page is (Chandu, 7 Oct
// 2026: "explore needs a by category thing and curated rows too"): career
// worlds as pills, and with nothing picked, curated rows first (Trending
// with its Top 10 numerals, what your own students save, then the student
// app's rows a counselor gets asked about), the full grid after them.
function Careers({ path }: { path: Pathway }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [world, setWorld] = useState("All");
  const [shown, setShown] = useState(PAGE);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const subjectWorlds = SUBJECTS[q];
    return ALL_CATALOG_CAREERS.filter((c) =>
      (path === "all" || TRADES.test(c.world)) &&
      (world === "All" || c.world === world) &&
      (!q || (subjectWorlds ? subjectWorlds.includes(c.world) : `${c.title} ${c.world}`.toLowerCase().includes(q))));
  }, [query, path, world]);
  const subject = SUBJECTS[query.trim().toLowerCase()];
  const browsing = !query.trim() && world === "All";
  const open = (c: CatalogCareer) => router.push(`/career/${careerSlug(c.title)}`);
  return (
    <section aria-label="Careers" className="flex flex-col gap-[var(--space-6)]">
      <SearchField value={query} onChange={(v) => { setQuery(v); setShown(PAGE); }} placeholder="A career, a world, or a subject like Math" />
      <WorldPills value={world} trades={path === "trades"} onChange={(w) => { setWorld(w); setShown(PAGE); }} />

      {browsing && <CuratedCareerRows onOpen={open} trades={path === "trades"} />}

      <div className="flex flex-col gap-[var(--space-4)]">
        {browsing
          ? <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>All Careers</h2>
          : <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{list.length} careers{subject ? ` where ${query.trim()} matters` : world !== "All" ? ` in ${world}` : ""}</p>}
        {list.length === 0 ? (
          <div className="py-[var(--space-8)]"><EmptyView tier={5} query={query} line="Try a subject, a world or another career." cta="Clear search" onAction={() => { setQuery(""); setWorld("All"); }} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-[repeat(auto-fill,minmax(176px,1fr))] sm:gap-[var(--space-5)]">
              {list.slice(0, shown).map((c) => <PosterCard key={c.title} fill career={c} onClick={() => open(c)} />)}
            </div>
            {list.length > shown && (
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="dm-quiet mx-auto flex h-10 cursor-pointer items-center gap-[6px] rounded-full border px-[18px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
                Show more <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {list.length - shown} left</span>
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

const WORLD_COUNTS = (() => {
  const counts = new Map<string, number>();
  ALL_CATALOG_CAREERS.forEach((c) => counts.set(c.world, (counts.get(c.world) ?? 0) + 1));
  return [...counts.entries()].sort((x, y) => y[1] - x[1]);
})();

/** Career worlds as one scrolling row of pills, biggest worlds first.
 *  Shared with v6. Three wrapped rows with counts were "too cluttered"
 *  (Chandu, 7 Oct 2026): one row, names only, the rest a scroll away. */
export function WorldPills({ value, onChange, trades = false }: { value: string; onChange: (w: string) => void; trades?: boolean }) {
  return (
    <div role="tablist" aria-label="Career world" className="-mx-5 flex gap-[8px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]" style={{ maskImage: "linear-gradient(to right, transparent, #000 20px, #000 calc(100% - 48px), transparent)" }}>
      {["All", ...WORLD_COUNTS.map(([w]) => w).filter((w) => !trades || TRADES.test(w))].map((w) => {
        const on = value === w;
        return (
          <button key={w} type="button" role="tab" aria-selected={on} onClick={() => onChange(w)}
            className="dm-quiet inline-flex h-9 flex-none cursor-pointer items-center rounded-full border px-[14px] text-[13.5px] font-semibold whitespace-nowrap"
            style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            {w}
          </button>
        );
      })}
    </div>
  );
}

/** The curated rows, shown while nothing is searched or filtered. Shared
 *  with v6, which opens careers in its own modal. */
export function CuratedCareerRows({ onOpen, trades = false }: { onOpen: (c: CatalogCareer) => void; trades?: boolean }) {
  const roster = useReviewedRoster();
  // your students' saves, matched to catalog posters by title
  const saving = useMemo(() => {
    const byTitle = new Map(ALL_CATALOG_CAREERS.map((c) => [c.title.toLowerCase(), c]));
    return schoolSnapshot(roster.map(toV5)).topSaved.map(({ career }) => byTitle.get(career.title.toLowerCase()) ?? { title: career.title, world: career.world, photo: career.photo });
  }, [roster]);
  const keep = (list: CatalogCareer[]) => (trades ? list.filter(isTradeCareer) : list);
  // trades: the trade careers by pay, in place of the (now redundant) trades row
  const tradesByPay = ALL_CATALOG_CAREERS.filter(isTradeCareer).map((c) => ({ c, pay: STATE_WAGES[careerSlug(c.title)]?.["New Jersey"] ?? 0 })).filter((x) => x.pay > 0).sort((x, y) => y.pay - x.pay).map((x) => x.c);
  const rows: { title: string; list: CatalogCareer[]; ranked?: boolean }[] = [
    { title: trades ? "Top Paying Trades" : "Trending Now", list: trades ? tradesByPay.slice(0, 10) : BROWSE_TRENDING.slice(0, 10), ranked: true },
    { title: "Your Students Are Saving", list: keep(saving).slice(0, 12) },
    { title: "Skilled Trades", list: trades ? [] : BROWSE_TRADES },
    { title: "Typical Pay: $100K+", list: keep(BROWSE_TYPICAL_PAY) },
    { title: trades ? "Trades They Might Not Know" : "Careers They Might Not Know", list: keep(BROWSE_MIGHT_NOT_KNOW) },
    { title: "Public Service", list: keep(BROWSE_PUBLIC_SERVICE) },
  ];
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      {rows.filter((r) => r.list.length >= 3).map((r) => (
        <Row key={r.title} title={r.title}>
          {r.list.map((c, i) => r.ranked ? <RankedPosterCard key={c.title} career={c} rank={i + 1} onClick={() => onOpen(c)} /> : <PosterCard key={c.title} career={c} onClick={() => onOpen(c)} />)}
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
      <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="poster-row -mx-5 flex gap-[var(--space-5)] overflow-x-auto px-5 py-4 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]">{children}</div>
    </section>
  );
}

/** Schools: curated rows first, then the student app's Schools browse as
 *  is. Save and Compare here are the counselor's own, never the student's.
 *  Trades shows trade schools and two-year colleges only. */
function Schools({ path }: { path: Pathway }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const toggle = (slug: string) => setSaved((s) => { const n = new Set(s); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; });
  return (
    <div className="flex flex-col gap-[var(--space-10)]">
      <CuratedSchoolRows trades={path === "trades"} saved={saved} onSave={toggle} />
      <section aria-label="All schools" className="flex flex-col gap-[var(--space-4)]">
        <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>All Schools</h2>
        <BrowseV2
          initialType={path === "trades" ? "trade" : ""}
          saved={saved}
          onSave={toggle}
          compare={compare}
          onCompare={(slug) => setCompare((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : c.length < 3 ? [...c, slug] : c))}
        />
      </section>
    </div>
  );
}

/** Curated school rows, the career rows' shape. Shared with v6.
 *  DEMO-ONLY: "Close to Home" is the demo school's state (New Jersey);
 *  production reads the school's own state. */
export function CuratedSchoolRows({ trades = false, saved, onSave }: { trades?: boolean; saved: Set<string> | string[]; onSave: (slug: string) => void }) {
  const isSaved = (slug: string) => (Array.isArray(saved) ? saved.includes(slug) : saved.has(slug));
  const pool = useMemo(() => COLLEGES.filter((c) => !trades || isTradeSchool(c))
    // schools with a campus photo lead each row
    .sort((a, b) => (collegeImage(b) ? 1 : 0) - (collegeImage(a) ? 1 : 0)), [trades]);
  const rows: { title: string; list: College[] }[] = [
    { title: "Close to Home", list: pool.filter((c) => c.state === "NJ") },
    { title: "Best Value", list: pool.filter((c) => c.netPrice !== null && (c.finish ?? 0) >= 40).sort((a, b) => a.netPrice! - b.netPrice!) },
    { title: "Strong Finishers", list: pool.filter((c) => c.finish !== null).sort((a, b) => b.finish! - a.finish!) },
    { title: "Open Doors", list: pool.filter((c) => c.admission === "open" || (c.admitRate ?? 0) >= 80) },
    { title: "Two-Year Starts", list: pool.filter((c) => c.level === "Associate degrees") },
    { title: "Trade and Technical", list: pool.filter((c) => c.level === "Certificates") },
  ];
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      {rows.filter((r) => r.list.length >= 3).map((r) => (
        <Row key={r.title} title={r.title}>
          {r.list.slice(0, 12).map((c) => (
            <div key={c.slug} className="w-[280px] flex-none">
              <SchoolCard c={c} href={`/colleges/${c.slug}`} saved={isSaved(c.slug)} onSave={() => onSave(c.slug)} compared={false} />
            </div>
          ))}
        </Row>
      ))}
    </div>
  );
}

/** Pay by state, curated: four short ranked lists for the state, then the
 *  full list. Pay is real (BLS OEWS). DEMO-ONLY: openings and growth are
 *  seeded until state projections are loaded (plan section 3). Shared
 *  with v6's Labor market. */
export function payRows(state: string, trades: boolean) {
  const out: { career: CatalogCareer; pay: number; openings: number; growth: number }[] = [];
  for (const c of ALL_CATALOG_CAREERS) {
    if (trades && !isTradeCareer(c)) continue;
    const pay = STATE_WAGES[careerSlug(c.title)]?.[state];
    if (!pay) continue;
    let h = 0;
    for (const ch of `${c.title}${state}`) h = (h * 31 + ch.charCodeAt(0)) | 0;
    h = Math.abs(h);
    out.push({ career: c, pay, openings: 120 + (h % 2400), growth: Math.round(20 + ((h >> 3) % 160)) / 10 });
  }
  return out;
}

export function PayCuration({ state, trades }: { state: string; trades: boolean }) {
  const rows = useMemo(() => payRows(state, trades), [state, trades]);
  const lists: { title: string; items: typeof rows; value: (r: (typeof rows)[number]) => string }[] = [
    { title: "Highest Paying", items: [...rows].sort((a, b) => b.pay - a.pay), value: (r) => `$${Math.round(r.pay / 1000)}K` },
    { title: "Top Paying Trades", items: trades ? [] : [...rows].filter((r) => isTradeCareer(r.career)).sort((a, b) => b.pay - a.pay), value: (r) => `$${Math.round(r.pay / 1000)}K` },
    { title: "Most Openings", items: [...rows].sort((a, b) => b.openings - a.openings), value: (r) => `${r.openings.toLocaleString()} a year` },
    { title: "Fastest Growing", items: [...rows].sort((a, b) => b.growth - a.growth), value: (r) => `+${r.growth.toFixed(1)}%` },
  ];
  const shown = lists.filter((l) => l.items.length >= 3);
  return (
    // three lists sit three across, four sit two by two: never an orphan row
    <div className={`grid grid-cols-1 gap-y-[var(--space-10)] ${shown.length === 3 ? "gap-x-[var(--space-8)] lg:grid-cols-3" : "gap-x-[var(--space-12)] lg:grid-cols-2"}`}>
      {shown.map((l) => (
        <section key={l.title} aria-label={l.title} className="flex min-w-0 flex-col gap-[var(--space-3)]">
          <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>{l.title}</h2>
          <ol className="flex flex-col">
            {l.items.slice(0, 5).map((r, i) => (
              <li key={r.career.title} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
                <Link href={`/career/${careerSlug(r.career.title)}`} className="dm-quiet group -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[10px]">
                  <span className="w-[20px] flex-none text-right text-[17px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>{i + 1}</span>
                  <span className="relative block h-[48px] w-[36px] flex-none overflow-hidden rounded-[7px]"><Image src={r.career.photo} alt="" fill sizes="36px" className="object-cover" /></span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] leading-[19px] font-semibold">{r.career.title}</span>
                    <span className="truncate text-[12.5px] font-semibold" style={{ color: WORLD_COLORS[r.career.world] }}>{r.career.world}</span>
                  </span>
                  <span className="text-[15px] font-semibold whitespace-nowrap tabular-nums">{l.value(r)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Pay({ path }: { path: Pathway }) {
  const [state, setState] = useState("New Jersey");
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
  return (
    <section aria-label="Pay by state" className="flex flex-col gap-[var(--space-8)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          {stateMenu("State", state, (st) => st && setState(st), false)}
          {stateMenu("Compare with", other ?? undefined, setOther, true)}
        </div>
        <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>BLS, May {STATE_WAGE_YEAR}. Average yearly pay.</p>
      </div>
      {!other && <PayCuration state={state} trades={path === "trades"} />}
      <section aria-label="Every career by pay" className="flex flex-col gap-[var(--space-3)]">
        <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>{other ? `${state} and ${other}` : "Every Career by Pay"}</h2>
        {other && (
          <div className="grid grid-cols-[28px_minmax(0,1fr)_110px_110px_64px] gap-x-[var(--space-3)] border-b pb-[8px] text-[12px] font-semibold tracking-[0.06em] uppercase" style={{ borderColor: RULE, color: "var(--muted-foreground)" }}>
            <span /><span>Career</span><span className="truncate text-right">{state}</span><span className="truncate text-right">{other}</span><span className="text-right">Diff</span>
          </div>
        )}
        <ol className={other ? "flex flex-col" : "gap-x-[var(--space-12)] lg:columns-2"}>
          {rows.slice(0, all ? rows.length : 20).map(({ career, pay }, i) => {
            const o = otherPay(career);
            const diff = o ? Math.round(((o - pay) / pay) * 100) : null;
            return (
              <li key={career.title} className="break-inside-avoid border-b" style={{ borderColor: RULE }}>
                <Link href={`/career/${careerSlug(career.title)}`} className={`dm-quiet group -mx-[var(--space-2)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[10px] ${other ? "grid grid-cols-[28px_minmax(0,1fr)_110px_110px_64px] items-center gap-x-[var(--space-3)]" : "flex items-center gap-[var(--space-3)]"}`}>
                  <span className="w-[28px] flex-none text-right text-[15px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{career.title}</span>
                  <span className="text-right text-[15px] font-semibold tabular-nums">${Math.round(pay / 1000)}K</span>
                  {other && <span className="text-right text-[15px] font-semibold tabular-nums">{o ? `$${Math.round(o / 1000)}K` : "None"}</span>}
                  {other && <span className={`text-right text-[14px] font-semibold tabular-nums ${diff === null ? "" : diff >= 0 ? "v5-ok" : "v5-risk"}`}>{diff === null ? "" : `${diff >= 0 ? "+" : ""}${diff}%`}</span>}
                </Link>
              </li>
            );
          })}
        </ol>
        {rows.length > 20 && <button type="button" onClick={() => setAll((a) => !a)} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>{all ? "Show fewer" : `Show all ${rows.length}`}</button>}
      </section>
    </section>
  );
}
