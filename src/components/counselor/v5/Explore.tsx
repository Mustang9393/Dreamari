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

export function V5Explore() {
  const [tab, setTab] = useState<Tab>("careers");
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-5)]">
        <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Explore</h1>
        <TextTabs items={TABS} value={tab} onChange={setTab} ariaLabel="Explore" layoutId="v5-explore-tabs" />
      </header>
      {tab === "careers" && <Careers />}
      {tab === "schools" && <Schools />}
      {tab === "pay" && <Pay />}
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
function Careers() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [path, setPath] = useState<"all" | "trades">("all");
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
  const browsing = !query.trim() && world === "All" && path === "all";
  const open = (c: CatalogCareer) => router.push(`/career/${careerSlug(c.title)}`);
  return (
    <section aria-label="Careers" className="flex flex-col gap-[var(--space-6)]">
      <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={query} onChange={(v) => { setQuery(v); setShown(PAGE); }} placeholder="A career, a world, or a subject like Math" />
        <Segmented label="Pathway" value={path} onChange={(v) => { setPath(v); setShown(PAGE); }} items={[{ key: "all", label: "All careers" }, { key: "trades", label: "Skilled trades" }]} />
      </div>
      <WorldPills value={world} onChange={(w) => { setWorld(w); setShown(PAGE); }} />

      {browsing && <CuratedCareerRows onOpen={open} />}

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

/** Career worlds as pills, with how many careers each holds. Shared with v6. */
export function WorldPills({ value, onChange }: { value: string; onChange: (w: string) => void }) {
  return (
    <div role="tablist" aria-label="Career world" className="-mx-5 flex gap-[8px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
      {[["All", ALL_CATALOG_CAREERS.length] as const, ...WORLD_COUNTS].map(([w, n]) => {
        const on = value === w;
        return (
          <button key={w} type="button" role="tab" aria-selected={on} onClick={() => onChange(w)}
            className="dm-quiet inline-flex h-9 flex-none cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13.5px] font-semibold whitespace-nowrap"
            style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            {w}<span className="tabular-nums" style={{ opacity: 0.7 }}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}

/** The curated rows, shown while nothing is searched or filtered. Shared
 *  with v6, which opens careers in its own modal. */
export function CuratedCareerRows({ onOpen }: { onOpen: (c: CatalogCareer) => void }) {
  const roster = useReviewedRoster();
  // your students' saves, matched to catalog posters by title
  const saving = useMemo(() => {
    const byTitle = new Map(ALL_CATALOG_CAREERS.map((c) => [c.title.toLowerCase(), c]));
    return schoolSnapshot(roster.map(toV5)).topSaved.map(({ career }) => byTitle.get(career.title.toLowerCase()) ?? { title: career.title, world: career.world, photo: career.photo }).slice(0, 12);
  }, [roster]);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <Row title="Trending Now">
        {BROWSE_TRENDING.slice(0, 10).map((c, i) => <RankedPosterCard key={c.title} career={c} rank={i + 1} onClick={() => onOpen(c)} />)}
      </Row>
      {saving.length > 0 && <Row title="Your Students Are Saving">{saving.map((c) => <PosterCard key={c.title} career={c} onClick={() => onOpen(c)} />)}</Row>}
      <Row title="Skilled Trades">{BROWSE_TRADES.map((c) => <PosterCard key={c.title} career={c} onClick={() => onOpen(c)} />)}</Row>
      <Row title="Typical Pay: $100K+">{BROWSE_TYPICAL_PAY.map((c) => <PosterCard key={c.title} career={c} onClick={() => onOpen(c)} />)}</Row>
      <Row title="Careers They Might Not Know">{BROWSE_MIGHT_NOT_KNOW.map((c) => <PosterCard key={c.title} career={c} onClick={() => onOpen(c)} />)}</Row>
      <Row title="Public Service">{BROWSE_PUBLIC_SERVICE.map((c) => <PosterCard key={c.title} career={c} onClick={() => onOpen(c)} />)}</Row>
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

/** The student app's Schools browse, unchanged. Save and Compare here are
 *  the counselor's own, kept in this tab, never the student's lists. */
function Schools() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  return (
    <BrowseV2
      saved={saved}
      onSave={(slug) => setSaved((s) => { const n = new Set(s); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; })}
      compare={compare}
      onCompare={(slug) => setCompare((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : c.length < 3 ? [...c, slug] : c))}
    />
  );
}

/** Highest-paying careers in a state, from the real BLS OEWS state file. */
function Pay() {
  const [state, setState] = useState("New Jersey");
  const [path, setPath] = useState<"all" | "trades">("all");
  const rows = useMemo(() => {
    const out: { career: CatalogCareer; pay: number }[] = [];
    for (const c of ALL_CATALOG_CAREERS) {
      if (path === "trades" && !TRADES.test(c.world)) continue;
      const pay = STATE_WAGES[careerSlug(c.title)]?.[state];
      if (pay) out.push({ career: c, pay });
    }
    return out.sort((a, b) => b.pay - a.pay).slice(0, 25);
  }, [state, path]);
  return (
    <section aria-label="Pay by state" className="flex flex-col gap-[var(--space-6)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Dropdown label="State" value={state} active panel={(close) => ({
          title: "State", description: "Pay is the state's average for the job.", count: rows.length, noun: "career", width: 340,
          children: <div className="flex flex-col p-[8px]">{US_STATES.map((st) => <Option key={st} radio on={st === state} onToggle={() => { setState(st); close(); }} label={st} />)}</div>,
        })} />
        <Segmented label="Pathway" value={path} onChange={setPath} items={[{ key: "all", label: "All careers" }, { key: "trades", label: "Skilled trades" }]} />
      </div>
      <ol className="flex flex-col">
        {rows.map(({ career, pay }, i) => (
          <li key={career.title} className="border-b" style={{ borderColor: RULE }}>
            <Link href={`/career/${careerSlug(career.title)}`} className="dm-quiet group -mx-[var(--space-2)] flex items-center gap-[var(--space-4)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[var(--space-3)]">
              <span className="w-[28px] flex-none text-right text-[20px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>{i + 1}</span>
              <span className="relative block h-[56px] w-[42px] flex-none overflow-hidden rounded-[8px]"><Image src={career.photo} alt="" fill sizes="42px" className="object-cover" /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="truncate text-[16px] leading-[20px] font-semibold">{career.title}</span>
                <span className="truncate text-[13px] font-semibold" style={{ color: WORLD_COLORS[career.world] }}>{career.world}</span>
              </span>
              <span className="text-[17px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>${Math.round(pay / 1000)}K</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>BLS, May {STATE_WAGE_YEAR}. Average yearly pay.</p>
    </section>
  );
}
