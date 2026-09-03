"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { BackButton, DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { BIG, DISPLAY, PANEL, SMALL } from "@/components/career/CareerDetailExperience";
import { ADMISSION_WORD, COLLEGES, STATES, money, type Admission, type College, type Control, type Level, type Setting, type Size } from "./data";
import { ACCENT, CollegeCard, RULE, SOFT, admissionWord, pct, tags, useSaved } from "./shared";

// Find a college. One search box, six quick picks, everything else in a
// tray over the results (NN/g mobile facets), applied filters as removable
// chips (Baymard). Results update as you type; nothing is submitted.
// Design notes: docs/COLLEGE_LOOKUP_AUDIT.md.

const HOME_STATE = "NJ"; // Jordan's build answers (Westfield High School, NJ)

type Filters = {
  states: Set<string>;
  levels: Set<Level>;
  controls: Set<Control>;
  sizes: Set<Size>;
  settings: Set<Setting>;
  admissions: Set<Admission>;
  costCap: number | null;
  also: Set<"tribal" | "religious" | "forProfit">;
  savedOnly: boolean;
};

const EMPTY: Filters = { states: new Set(), levels: new Set(), controls: new Set(), sizes: new Set(), settings: new Set(), admissions: new Set(), costCap: null, also: new Set(), savedOnly: false };
const COST_CAPS = [10000, 15000, 20000, 25000];

function toggleIn<T>(set: Set<T>, v: T): Set<T> { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); return n; }

function matches(c: College, f: Filters, q: string, saved: Set<string>): boolean {
  if (q) {
    const hay = `${c.name} ${c.city} ${c.stateName} ${c.state}`.toLowerCase();
    if (!q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  if (f.states.size && !f.states.has(c.state)) return false;
  if (f.levels.size && !f.levels.has(c.level)) return false;
  if (f.controls.size && !f.controls.has(c.control)) return false;
  if (f.sizes.size && !f.sizes.has(c.size)) return false;
  if (f.settings.size && !f.settings.has(c.setting)) return false;
  if (f.admissions.size && !f.admissions.has(c.admission)) return false;
  if (f.costCap !== null && (c.netPrice === null || c.netPrice > f.costCap)) return false;
  if (f.also.size) {
    if (f.also.has("tribal") && !c.flags?.includes("tribal")) return false;
    if (f.also.has("religious") && !c.flags?.includes("religious")) return false;
    if (f.also.has("forProfit") && c.control !== "For profit") return false;
  }
  if (f.savedOnly && !saved.has(c.slug)) return false;
  return true;
}

export function CollegesExperience({ initialQuery = "", initialType = "" }: { initialQuery?: string; initialType?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Filters>(() => {
    const f: Filters = { ...EMPTY, states: new Set(), levels: new Set(), controls: new Set(), sizes: new Set(), settings: new Set(), admissions: new Set(), also: new Set() };
    if (initialType === "trade") f.levels.add("Certificates");
    if (initialType === "2-year") f.levels.add("Associate degrees");
    if (initialType === "4-year") f.levels.add("Bachelor's degrees");
    return f;
  });
  const [trayOpen, setTrayOpen] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [saved, toggleSaved] = useSaved();
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim();
  const results = useMemo(() => {
    const list = COLLEGES.filter((c) => matches(c, filters, q, saved));
    // home state first, then by how many students finish; never a ranking
    return list.sort((a, b) => (a.state === HOME_STATE ? 0 : 1) - (b.state === HOME_STATE ? 0 : 1) || (b.finish ?? -1) - (a.finish ?? -1));
  }, [filters, q, saved]);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => { setFilters({ ...EMPTY, states: new Set(), levels: new Set(), controls: new Set(), sizes: new Set(), settings: new Set(), admissions: new Set(), also: new Set() }); setQuery(""); };

  // quick picks: the six choices an 8th grader can act on, in their words
  const nearHome = filters.states.size === 1 && filters.states.has(HOME_STATE);
  const quick: { key: string; label: string; on: boolean; toggle: () => void }[] = [
    { key: "home", label: "Near home", on: nearHome, toggle: () => set({ states: nearHome ? new Set() : new Set([HOME_STATE]) }) },
    { key: "4", label: "4-year", on: filters.levels.has("Bachelor's degrees"), toggle: () => set({ levels: toggleIn(filters.levels, "Bachelor's degrees") }) },
    { key: "2", label: "2-year", on: filters.levels.has("Associate degrees"), toggle: () => set({ levels: toggleIn(filters.levels, "Associate degrees") }) },
    { key: "trade", label: "Trade school", on: filters.levels.has("Certificates"), toggle: () => set({ levels: toggleIn(filters.levels, "Certificates") }) },
    { key: "cost", label: "Under $15K a year", on: filters.costCap === 15000, toggle: () => set({ costCap: filters.costCap === 15000 ? null : 15000 }) },
    { key: "open", label: "Everyone gets in", on: filters.admissions.has("open"), toggle: () => set({ admissions: toggleIn(filters.admissions, "open") }) },
  ];
  if (saved.size) quick.push({ key: "saved", label: `Saved · ${saved.size}`, on: filters.savedOnly, toggle: () => set({ savedOnly: !filters.savedOnly }) });

  // applied filters from the tray that the quick picks do not already show
  const applied: { key: string; label: string; remove: () => void }[] = [];
  for (const s of filters.states) if (!(nearHome && s === HOME_STATE)) applied.push({ key: `s-${s}`, label: STATES.find((x) => x.code === s)?.name ?? s, remove: () => set({ states: toggleIn(filters.states, s) }) });
  for (const c of filters.controls) applied.push({ key: `c-${c}`, label: c, remove: () => set({ controls: toggleIn(filters.controls, c) }) });
  for (const s of filters.sizes) applied.push({ key: `z-${s}`, label: `${s} school`, remove: () => set({ sizes: toggleIn(filters.sizes, s) }) });
  for (const s of filters.settings) applied.push({ key: `w-${s}`, label: s, remove: () => set({ settings: toggleIn(filters.settings, s) }) });
  for (const a of filters.admissions) if (a !== "open") applied.push({ key: `a-${a}`, label: ADMISSION_WORD[a], remove: () => set({ admissions: toggleIn(filters.admissions, a) }) });
  if (filters.costCap !== null && filters.costCap !== 15000) applied.push({ key: "cost", label: `Under ${money(filters.costCap)} a year`, remove: () => set({ costCap: null }) });
  for (const a of filters.also) applied.push({ key: `o-${a}`, label: a === "tribal" ? "Tribal college" : a === "religious" ? "Religious" : "Run for profit", remove: () => set({ also: toggleIn(filters.also, a) }) });
  const activeCount = quick.filter((x) => x.on).length + applied.length + (q ? 1 : 0);

  const compared = compare.map((s) => COLLEGES.find((c) => c.slug === s)!).filter(Boolean);
  const toggleCompare = (slug: string) => setCompare((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= 3 ? cur : [...cur, slug]));

  useEffect(() => { if (!trayOpen && !compareOpen) return; const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setTrayOpen(false); setCompareOpen(false); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [trayOpen, compareOpen]);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
      </div>
      <DesktopNavigation active="Explore" />
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <span className="flex items-center gap-[var(--space-3)]"><BackButton fallback="/explore" /><Wordmark /></span>
        <QuickLinksMenu />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col gap-[var(--space-5)] px-5 pt-[var(--space-4)] pb-[140px] md:pt-[96px]">
        <div className="hidden md:block"><BackButton fallback="/explore" /></div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <h1 className="text-[34px] leading-[38px] font-extrabold uppercase sm:text-[44px] sm:leading-[48px]" style={DISPLAY}>Find a college</h1>
          <p className={SMALL} style={{ color: "var(--muted-foreground)" }} aria-live="polite">
            {results.length} {results.length === 1 ? "college" : "colleges"}{activeCount ? " match" : ""}. New Jersey first. We do not rank colleges.
          </p>
        </div>

        {/* the search: one box, results change as you type, and the door to
           every filter fixed beside it (never off the edge of a scroll row) */}
        <div className="flex items-stretch gap-[var(--space-3)]">
        <label className="flex min-h-[56px] min-w-0 flex-1 items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)]" style={{ ...PANEL, borderColor: q ? "color-mix(in srgb, var(--primary) 55%, rgba(255,255,255,0.16))" : PANEL.borderColor }}>
          <Search className="h-5 w-5 flex-none" aria-hidden style={{ color: q ? SOFT : "var(--muted-foreground)" }} />
          <span className="sr-only">Search colleges by name, city or state</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="College, city or state"
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-[17px] leading-[22px] font-semibold outline-none placeholder:font-medium"
            style={{ color: "var(--foreground)" }}
          />
          {q && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Clear search" className="dm-quiet flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </label>
        <button type="button" onClick={() => setTrayOpen(true)} aria-haspopup="dialog" aria-expanded={trayOpen} aria-label={`Filters${applied.length ? `, ${applied.length} on` : ""}`} className="dm-quiet flex min-h-[56px] flex-none cursor-pointer items-center gap-[8px] rounded-[var(--radius-lg)] border px-[var(--space-4)] text-[15px] leading-[20px] font-semibold" style={{ ...PANEL, borderColor: applied.length ? ACCENT : PANEL.borderColor, color: "var(--foreground)" }}>
          <SlidersHorizontal className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Filters</span>
          {applied.length > 0 && <span className="flex size-[22px] items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: ACCENT, color: "#fff" }}>{applied.length}</span>}
        </button>
        </div>

        {/* quick picks + the door to every other filter */}
        <div className="-mx-5 flex items-center gap-[8px] overflow-x-auto px-5 pb-[2px] [scrollbar-width:none]" role="group" aria-label="Quick filters">
          {quick.map((p) => (
            <button key={p.key} type="button" aria-pressed={p.on} onClick={p.toggle} className="dm-quiet flex min-h-[38px] flex-none cursor-pointer items-center rounded-full border px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap" style={p.on ? { background: ACCENT, borderColor: ACCENT, color: "#fff" } : { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* what is applied from the tray, each removable */}
        {(applied.length > 0 || activeCount > 0) && (
          <div className="-mx-5 flex items-center gap-[8px] overflow-x-auto px-5 [scrollbar-width:none]" aria-label="Applied filters">
            {applied.map((a) => (
              <button key={a.key} type="button" onClick={a.remove} className="dm-quiet flex min-h-[32px] flex-none cursor-pointer items-center gap-[6px] rounded-full px-[12px] text-[13px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: SOFT }} aria-label={`Remove ${a.label}`}>
                {a.label} <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="dm-link flex min-h-[32px] flex-none cursor-pointer items-center text-[13px] leading-[16px] font-bold whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>Clear all</button>
          </div>
        )}

        {results.length === 0 ? (
          <section className="flex flex-col items-start gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
            <h2 className={BIG} style={DISPLAY}>No college matches that</h2>
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>Try a shorter name, a city, or take off a filter.</p>
            <button type="button" onClick={clearAll} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>Start over</button>
          </section>
        ) : (
          <ul className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-3" aria-label="Colleges">
            {results.map((c) => (
              <li key={c.slug} className="min-w-0">
                <CollegeCard c={c} saved={saved.has(c.slug)} onSave={() => toggleSaved(c.slug)} compared={compare.includes(c.slug)} onCompare={() => toggleCompare(c.slug)} />
              </li>
            ))}
          </ul>
        )}

        <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          Government figures, 2024-25. Costs are what families paid after grants, not the sticker price.
        </p>
      </main>

      {/* compare bar */}
      {compare.length > 0 && !compareOpen && (
        <div className="fixed inset-x-0 bottom-[84px] z-[60] flex justify-center px-5 md:bottom-[28px]">
          <div className="flex w-full max-w-[560px] items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[10px]" style={{ ...PANEL, background: "rgba(14,12,32,0.92)" }}>
            <span className="flex min-w-0 items-center gap-[8px]">
              <span className="flex -space-x-2">{compared.map((c) => <span key={c.slug} className="flex size-[28px] items-center justify-center rounded-full border text-[11px] font-extrabold" style={{ background: ACCENT, borderColor: "#0e0c20", color: "#fff" }}>{c.name[0]}</span>)}</span>
              <span className="truncate text-[14px] leading-[18px] font-semibold">{compare.length} of 3 picked</span>
            </span>
            <span className="flex items-center gap-[8px]">
              <button type="button" onClick={() => setCompare([])} className="dm-link cursor-pointer text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>Clear</button>
              <button type="button" disabled={compare.length < 2} onClick={() => setCompareOpen(true)} className="dm-solid flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[14px] text-[14px] font-semibold disabled:cursor-default disabled:opacity-50" style={{ background: ACCENT, color: "#fff" }}>
                <ArrowLeftRight className="h-4 w-4" aria-hidden /> Compare
              </button>
            </span>
          </div>
        </div>
      )}

      {trayOpen && <FilterTray filters={filters} set={set} count={results.length} onClose={() => setTrayOpen(false)} onClear={() => setFilters({ ...EMPTY, states: new Set(), levels: new Set(), controls: new Set(), sizes: new Set(), settings: new Set(), admissions: new Set(), also: new Set() })} />}
      {compareOpen && <CompareSheet colleges={compared} onClose={() => setCompareOpen(false)} />}

      <MobileNav active="Explore" />
    </div>
  );
}

// ---- the tray: every filter as short checkbox lists, over the results ----
// Portals mount on <body>, outside `.marketing-v2`, so the root carries the
// token classes itself (with a transparent background, or it paints black).

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={title} className="border-b py-[var(--space-3)]" style={{ borderColor: RULE }}>
      <h3 className="px-[var(--space-2)] text-[13px] leading-[17px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>{title}{note ? <span className="ml-[6px] font-medium normal-case tracking-normal">{note}</span> : null}</h3>
      <ul className="mt-[4px] flex flex-col">{children}</ul>
    </div>
  );
}

/** One row: a small square (or dot) at the left, the label, an optional
 *  count at the right. 40px tall, the whole row is the target. */
function Option({ on, onToggle, children, count, radio = false }: { on: boolean; onToggle: () => void; children: React.ReactNode; count?: number; radio?: boolean }) {
  return (
    <li>
      <button type="button" role={radio ? "radio" : "checkbox"} aria-checked={on} onClick={onToggle} className="dm-quiet flex min-h-[40px] w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] pl-[var(--space-2)] pr-[var(--space-3)] text-left text-[14px] leading-[18px] font-medium" style={{ color: "var(--foreground)" }}>
        <span aria-hidden className={`flex size-[18px] flex-none items-center justify-center border ${radio ? "rounded-full" : "rounded-[4px]"}`} style={{ borderColor: on ? ACCENT : "rgba(255,255,255,0.35)", background: on ? ACCENT : "transparent" }}>
          {on && (radio ? <span className="size-[7px] rounded-full" style={{ background: "#fff" }} /> : <svg viewBox="0 0 12 12" className="size-[11px]" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-5.5" /></svg>)}
        </span>
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {typeof count === "number" && <span className="flex-none text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{count}</span>}
      </button>
    </li>
  );
}

function FilterTray({ filters, set, count, onClose, onClear }: { filters: Filters; set: (p: Partial<Filters>) => void; count: number; onClose: () => void; onClear: () => void }) {
  const [statesOpen, setStatesOpen] = useState(false);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[110] flex items-end justify-end md:items-stretch" role="dialog" aria-modal="true" aria-label="Filters" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", background: "transparent" }}>
      {/* the results stay visible behind: dimmed and softened, never black */}
      <button type="button" aria-label="Close filters" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.35)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }} />
      <div className="relative z-[1] flex max-h-[86dvh] w-full flex-col rounded-t-[var(--radius-xl)] border md:h-full md:max-h-none md:w-[360px] md:rounded-none md:border-y-0 md:border-r-0" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "rgba(255,255,255,0.16)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)" }}>
        <div className="flex items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-3)]" style={{ borderColor: RULE }}>
          <h2 className="text-[18px] leading-[24px] font-extrabold" style={DISPLAY}>Filters</h2>
          <span className="flex items-center gap-[var(--space-2)]">
            <button type="button" onClick={onClear} className="dm-link cursor-pointer text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>Clear</button>
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}><X className="h-5 w-5" aria-hidden /></button>
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-[var(--space-3)] [scrollbar-gutter:stable]">
          <Group title="Where">
            {STATES.slice(0, statesOpen ? undefined : 6).map((s) => <Option key={s.code} on={filters.states.has(s.code)} onToggle={() => set({ states: toggleIn(filters.states, s.code) })} count={s.n}>{s.name}</Option>)}
            {STATES.length > 6 && <li><button type="button" onClick={() => setStatesOpen((v) => !v)} className="dm-link flex min-h-[36px] cursor-pointer items-center gap-[4px] px-[var(--space-2)] text-[13px] font-bold" style={{ color: SOFT }}>{statesOpen ? "Fewer states" : `All ${STATES.length} states`} <ChevronDown className="h-4 w-4" style={{ transform: statesOpen ? "rotate(180deg)" : undefined }} aria-hidden /></button></li>}
          </Group>
          <Group title="Cost for a year" note="after grants">
            <Option radio on={filters.costCap === null} onToggle={() => set({ costCap: null })}>Any</Option>
            {COST_CAPS.map((cap) => <Option key={cap} radio on={filters.costCap === cap} onToggle={() => set({ costCap: cap })}>Under {money(cap)}</Option>)}
          </Group>
          <Group title="Type">
            <Option on={filters.levels.has("Certificates")} onToggle={() => set({ levels: toggleIn(filters.levels, "Certificates") })}>Trade school</Option>
            <Option on={filters.levels.has("Associate degrees")} onToggle={() => set({ levels: toggleIn(filters.levels, "Associate degrees") })}>2-year</Option>
            <Option on={filters.levels.has("Bachelor's degrees")} onToggle={() => set({ levels: toggleIn(filters.levels, "Bachelor's degrees") })}>4-year</Option>
          </Group>
          <Group title="Who runs it">
            {(["Public", "Private", "For profit"] as Control[]).map((c) => <Option key={c} on={filters.controls.has(c)} onToggle={() => set({ controls: toggleIn(filters.controls, c) })}>{c}</Option>)}
          </Group>
          <Group title="Size">
            <Option on={filters.sizes.has("Small")} onToggle={() => set({ sizes: toggleIn(filters.sizes, "Small") })}>Small, under 5,000 students</Option>
            <Option on={filters.sizes.has("Medium")} onToggle={() => set({ sizes: toggleIn(filters.sizes, "Medium") })}>Medium, 5,000 to 20,000</Option>
            <Option on={filters.sizes.has("Large")} onToggle={() => set({ sizes: toggleIn(filters.sizes, "Large") })}>Large, over 20,000</Option>
          </Group>
          <Group title="Where it is">
            {(["City", "Suburb", "Town", "Countryside"] as Setting[]).map((s) => <Option key={s} on={filters.settings.has(s)} onToggle={() => set({ settings: toggleIn(filters.settings, s) })}>{s}</Option>)}
          </Group>
          <Group title="Getting in">
            {(["open", "grades", "more"] as Admission[]).map((a) => <Option key={a} on={filters.admissions.has(a)} onToggle={() => set({ admissions: toggleIn(filters.admissions, a) })}>{ADMISSION_WORD[a]}</Option>)}
          </Group>
          <Group title="Also">
            <Option on={filters.also.has("tribal")} onToggle={() => set({ also: toggleIn(filters.also, "tribal") })}>Tribal college</Option>
            <Option on={filters.also.has("religious")} onToggle={() => set({ also: toggleIn(filters.also, "religious") })}>Religious</Option>
            <Option on={filters.also.has("forProfit")} onToggle={() => set({ also: toggleIn(filters.also, "forProfit") })}>Run for profit</Option>
          </Group>
          <div className="h-[var(--space-3)]" />
        </div>
        <div className="border-t p-[var(--space-3)]" style={{ borderColor: RULE }}>
          <button type="button" onClick={onClose} className="dm-solid flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>
            Show {count} {count === 1 ? "college" : "colleges"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ---- compare: the same pinned-first-column table as the Career Report ----

function CompareSheet({ colleges, onClose }: { colleges: College[]; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  const rows: { label: string; get: (c: College) => string }[] = [
    { label: "Cost for a year, after grants", get: (c) => (c.netPrice === null ? "Not published" : money(c.netPrice)) },
    { label: "Getting in", get: (c) => admissionWord(c) },
    { label: "Finish their degree", get: (c) => pct(c.finish) },
    { label: "Come back for year 2", get: (c) => pct(c.retention) },
    { label: "Paying back loans", get: (c) => pct(c.repay) },
    { label: "Students", get: (c) => c.undergrads.toLocaleString("en-US") },
    { label: "Type", get: (c) => tags(c).join(" · ") },
    { label: "Pay 6 years after starting", get: (c) => (c.detail?.pay6 ? money(c.detail.pay6) : "Not published") },
    { label: "Owe when they finish", get: (c) => (c.detail?.debt ? money(c.detail.debt) : "Not published") },
  ];
  const head = { background: "color-mix(in srgb, var(--primary) 12%, var(--background))" } as const;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="college-compare-title" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", background: "transparent" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.45)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
      <div className="relative mx-auto mt-auto flex max-h-[92dvh] w-full max-w-[1000px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:my-auto sm:rounded-[var(--radius-lg)]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "rgba(255,255,255,0.16)" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)] border-b px-5 py-[var(--space-4)]" style={{ borderColor: RULE }}>
          <span className="flex flex-col gap-[2px]">
            <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: SOFT }}>Side by side</span>
            <h3 id="college-compare-title" className="text-[20px] leading-[25px] font-extrabold" style={DISPLAY}>{colleges.length} colleges</h3>
          </span>
          <button type="button" onClick={onClose} className="dm-quiet flex size-[44px] flex-none cursor-pointer items-center justify-center rounded-full" aria-label="Close comparison"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-[var(--space-4)]" style={{ touchAction: "pan-x pan-y" }}>
          <table className="w-full border-collapse text-left text-[13px]" style={{ minWidth: 120 + colleges.length * 190 }}>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-[1] w-[120px] min-w-[120px] border-b px-[12px] py-[10px] text-[12px] leading-[16px] font-bold tracking-[0.04em] uppercase" style={{ ...head, borderColor: "rgba(255,255,255,0.22)", color: "var(--muted-foreground)" }}>Factor</th>
                {colleges.map((c) => (
                  <th key={c.slug} scope="col" className="min-w-[190px] border-b px-[14px] py-[10px] align-bottom text-[15px] leading-[19px] font-extrabold" style={{ borderColor: "rgba(255,255,255,0.22)", fontFamily: "var(--font-display)" }}>
                    <Link href={`/colleges/${c.slug}`} className="dm-link">{c.name}</Link>
                    <span className="block text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{c.city}, {c.state}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="sticky left-0 z-[1] border-b px-[12px] py-[10px] align-top text-[12px] leading-[16px] font-bold tracking-[0.04em] uppercase" style={{ ...head, borderColor: RULE, color: "var(--muted-foreground)" }}>{r.label}</th>
                  {colleges.map((c) => <td key={c.slug} className="border-b px-[14px] py-[10px] align-top text-[15px] leading-[19px] font-bold tabular-nums" style={{ borderColor: RULE }}>{r.get(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  );
}
