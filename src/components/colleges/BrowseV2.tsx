"use client";

// Explore Schools, Browse all (30 Sept 2026). Joshua, from the SchooLinks
// screenshots: "the main filters sit directly above the results as
// dropdowns instead of requiring students to open a large sidebar...
// students should be able to filter and sort directly from the search
// results." Chandu: the slide-in sheet "almost breaks the flow", "way too
// many rows of chips", the search "isn't up to par"; then, on the first
// build: "just do v2... the dropdown looks hard to read and hard to follow,
// no hierarchy or proper grouping of information."
//
// Page, top to bottom:
// 1. One search that finds schools, programs and states as you type
//    (grouped suggestions; a program or state becomes a filter).
// 2. One filter bar: School type, Location, Admissions, Academic fit,
//    Degree, Program, More. The button shows its choice.
// 3. The count, one row of removable chips, Sort.
//
// Every dropdown has the same anatomy, so each reads the same way:
//   header   title, one line on what it does, Clear when something is on
//   sections a small label per group; options as rows (a label, a note, a
//            count, a check on the right) or as chips for a scale
//   footer   Show N schools
// On phones and tablets the same panel opens as a bottom sheet.

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, BookOpen, Check, GraduationCap, MapPin, School, Search, SlidersHorizontal, Wrench, Building2, X } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { EmptyView } from "@/components/app/states";
import { PANEL } from "@/components/career/CareerDetailExperience";
import { ACADEMIC_RECORD } from "@/components/profile/report-data";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { COLLEGES, STATES, money, type Control, type Setting, type Size } from "./data";
import { ACCENT, SchoolCard, SOFT, type CardBadge } from "./shared";
import { parseGpa } from "./pathway";
import {
  DEGREES, DISTANCES, HOME_ZIP, SCHOOL_TYPES, SORTS, actRange, costOf, degreesOf, fitV2, milesFrom, offers, outcomesScore, placeForZip, programIndex, programLabel, programsOf, satRange, typeOf,
  type Degree, type FitV2, type SchoolType, type SortKey,
} from "./searchV2";
import { Chips, Dropdown, Option, Section, StickyBar } from "./filterKit";

const HOME_STATE = "NJ";

type Admit = "open" | "over50" | "20to50" | "under20";
type F = {
  types: Set<SchoolType>; states: Set<string>; zip: string; within: number | null;
  admit: Set<Admit>; sat: number | null; act: number | null; fit: Set<FitV2>;
  degrees: Set<Degree>; program: string | null;
  costCap: number | null; controls: Set<Control>; sizes: Set<Size>; settings: Set<Setting>;
};
const empty = (): F => ({ types: new Set(), states: new Set(), zip: HOME_ZIP, within: null, admit: new Set(), sat: null, act: null, fit: new Set(), degrees: new Set(), program: null, costCap: null, controls: new Set(), sizes: new Set(), settings: new Set() });
const tog = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
const admitOf = (rate: number | null): Admit => (rate === null ? "open" : rate > 50 ? "over50" : rate >= 20 ? "20to50" : "under20");

const ADMIT: { key: Admit; big: string; small: string }[] = [
  { key: "open", big: "Everyone", small: "gets in" },
  { key: "over50", big: "Over half", small: "get in" },
  { key: "20to50", big: "20% to 50%", small: "get in" },
  { key: "under20", big: "Under 20%", small: "get in" },
];
const TYPE_META: Record<SchoolType, { icon: typeof School; note: string }> = {
  "4-year": { icon: GraduationCap, note: "Bachelor's degrees" },
  "2-year": { icon: Building2, note: "Associate degrees, often a start toward a 4-year" },
  Trade: { icon: Wrench, note: "Certificates for a skilled trade" },
  Graduate: { icon: BookOpen, note: "Master's and doctorates only" },
};
const FIT: { key: FitV2; label: string; note: string; color: string }[] = [
  { key: "Reach", label: "Reach", note: "Harder to get in for you", color: "rgb(255,160,30)" },
  { key: "Target", label: "Target", note: "A good match for your record", color: "rgb(96,140,255)" },
  { key: "Likely", label: "Likely", note: "Very likely to get in", color: "rgb(52,199,140)" },
  { key: "Open", label: "Open admission", note: "Everyone who applies gets in", color: "rgba(255,255,255,0.7)" },
];
const FIT_TONE: Record<FitV2, CardBadge["tone"]> = { Reach: "reach", Target: "target", Likely: "safety", Open: "open" };
const COSTS = [10000, 15000, 20000, 25000];
const DEGREE_NOTE: Record<Degree, string> = { Certificate: "Under two years, job-ready", Associate: "About two years", "Bachelor's": "About four years", "Master's": "After a bachelor's", Doctorate: "The highest degree" };

function useGpa(): number | null {
  const p = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  return parseGpa(p.gpa || ACADEMIC_RECORD.gpa);
}

const field = "h-11 w-full rounded-[10px] border px-[12px] text-[15px] font-semibold";
const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

// ---- Search with suggestions ------------------------------------------------

function SearchBox({ query, setQuery, onProgram, onState }: { query: string; setQuery: (q: string) => void; onProgram: (p: string) => void; onState: (s: string) => void }) {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const q = query.trim().toLowerCase();
  const schools = q ? COLLEGES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4) : [];
  const programs = q.length >= 2 ? programIndex(COLLEGES).filter((p) => p.label.toLowerCase().includes(q)).slice(0, 4) : [];
  const places = q.length >= 2 ? STATES.filter((s) => s.name.toLowerCase().startsWith(q) || s.code.toLowerCase() === q).slice(0, 2) : [];
  type Opt = { key: string; group: string; label: string; note: string; icon: React.ReactNode; run: () => void };
  const opts: Opt[] = [
    ...schools.map((c) => ({ key: `s-${c.slug}`, group: "Schools", label: c.name, note: `${c.city}, ${c.state}`, icon: <School className="h-4 w-4" aria-hidden />, run: () => router.push(`/colleges/${c.slug}`) })),
    ...programs.map((p) => ({ key: `p-${p.name}`, group: "Programs", label: p.label, note: `${p.schools} ${p.schools === 1 ? "school" : "schools"}`, icon: <BookOpen className="h-4 w-4" aria-hidden />, run: () => { onProgram(p.name); setQuery(""); } })),
    ...places.map((s) => ({ key: `l-${s.code}`, group: "States", label: s.name, note: `${s.n} schools`, icon: <MapPin className="h-4 w-4" aria-hidden />, run: () => { onState(s.code); setQuery(""); } })),
  ];
  const show = focused && q.length > 0 && opts.length > 0;
  return (
    <div className="relative min-w-0 flex-1">
      <HoverBeam strength={0.85} active={focused} className="w-full">
        <label className="flex min-h-[52px] items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)]" style={{ ...PANEL, borderColor: focused ? "color-mix(in srgb, var(--primary) 55%, rgba(255,255,255,0.16))" : PANEL.borderColor }}>
          <Search className="h-5 w-5 flex-none" aria-hidden style={{ color: q ? SOFT : "var(--muted-foreground)" }} />
          <span className="sr-only">Search schools, programs or states</span>
          <input
            ref={input}
            type="search"
            role="combobox"
            aria-expanded={show}
            aria-controls="school-search-suggestions"
            aria-activedescendant={show && opts[cursor] ? `sug-${opts[cursor].key}` : undefined}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onKeyDown={(e) => {
              if (!show) return;
              if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(opts.length - 1, c + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
              else if (e.key === "Enter" && opts[cursor]) { e.preventDefault(); opts[cursor].run(); input.current?.blur(); }
            }}
            placeholder="Search a school, a program like Nursing, or a state"
            autoComplete="off"
            enterKeyHint="search"
            className="dm-beam-input min-w-0 flex-1 bg-transparent text-[16px] leading-[22px] font-semibold outline-none placeholder:font-medium [&::-webkit-search-cancel-button]:appearance-none"
            style={{ color: "var(--foreground)" }}
          />
          {q && (
            <IconTip label="Clear search">
              <button type="button" onClick={() => { setQuery(""); input.current?.focus(); }} aria-label="Clear search" className="dm-quiet flex size-[34px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
            </IconTip>
          )}
        </label>
      </HoverBeam>
      {show && (
        <div id="school-search-suggestions" role="listbox" className="absolute inset-x-0 top-[58px] z-[60] flex flex-col overflow-hidden rounded-[16px] border py-[6px]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 28px 70px -28px rgba(0,0,0,0.8)" }}>
          {opts.map((o, i) => (
            <div key={o.key} className="contents">
              {(i === 0 || opts[i - 1].group !== o.group) && <span className={`px-[16px] pt-[10px] pb-[4px] text-[12px] font-bold tracking-[0.07em] uppercase ${i > 0 ? "mt-[4px] border-t" : ""}`} style={{ color: "var(--muted-foreground)", borderColor: "var(--glass-border)" }}>{o.group}</span>}
              <button id={`sug-${o.key}`} type="button" role="option" aria-selected={i === cursor} onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setCursor(i)} onClick={() => { o.run(); input.current?.blur(); }} className="mx-[6px] flex min-h-[48px] cursor-pointer items-center gap-[12px] rounded-[10px] px-[10px] text-left" style={{ background: i === cursor ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent" }}>
                <span className="flex size-[30px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: SOFT }}>{o.icon}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14.5px] font-semibold" style={{ color: "var(--foreground)" }}>{o.label}</span>
                  <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{o.note}</span>
                </span>
                <span className="flex-none text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{o.group === "Schools" ? "Open" : "Add filter"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- The page ----------------------------------------------------------------

export function BrowseV2({ saved, onSave, compare, onCompare, initialQuery = "", initialType = "" }: { saved: Set<string>; onSave: (slug: string) => void; compare: string[]; onCompare: (slug: string) => void; initialQuery?: string; initialType?: string }) {
  const gpa = useGpa();
  const [query, setQuery] = useState(initialQuery);
  const [f, setF] = useState<F>(() => {
    const x = empty();
    if (initialType === "trade") x.types.add("Trade");
    if (initialType === "2-year") x.types.add("2-year");
    if (initialType === "4-year") x.types.add("4-year");
    return x;
  });
  const [sort, setSort] = useState<SortKey>("relevant");
  const [programQ, setProgramQ] = useState("");
  const set = (p: Partial<F>) => setF((x) => ({ ...x, ...p }));
  const home = placeForZip(f.zip);
  const q = query.trim().toLowerCase();

  const rows = useMemo(() => COLLEGES.map((c) => ({ c, fit: fitV2(c, gpa, f.sat), miles: home ? milesFrom(c, home.at) : null, cost: costOf(c) })), [gpa, f.sat, home]);
  type R = (typeof rows)[number];
  const pass = (r: R, skip?: keyof F) => {
    const { c } = r;
    // Typed text matches name and place, and (from three letters) the
    // programs a school offers: "nurs" finds every nursing school.
    if (q && !`${c.name} ${c.city} ${c.stateName} ${c.state}`.toLowerCase().includes(q) && !(q.length >= 3 && programsOf(c).some((p) => p.name.toLowerCase().includes(q)))) return false;
    if (skip !== "types" && f.types.size && !f.types.has(typeOf(c))) return false;
    if (skip !== "states" && f.states.size && !f.states.has(c.state)) return false;
    if (skip !== "within" && f.within !== null && (r.miles === null || r.miles > f.within)) return false;
    if (skip !== "admit" && f.admit.size && !f.admit.has(admitOf(c.admitRate))) return false;
    if (skip !== "sat" && f.sat) { const s = satRange(c); if (s && f.sat < s.lo) return false; }
    if (skip !== "act" && f.act) { const a = actRange(c); if (a && f.act < a.lo) return false; }
    if (skip !== "fit" && f.fit.size && (!r.fit || !f.fit.has(r.fit))) return false;
    if (skip !== "degrees" && f.degrees.size && ![...f.degrees].some((d) => degreesOf(c).has(d))) return false;
    if (skip !== "program" && f.program && !offers(c, f.program)) return false;
    if (skip !== "costCap" && f.costCap !== null && (r.cost === null || r.cost > f.costCap)) return false;
    if (skip !== "controls" && f.controls.size && !f.controls.has(c.control)) return false;
    if (skip !== "sizes" && f.sizes.size && !f.sizes.has(c.size)) return false;
    if (skip !== "settings" && f.settings.size && !f.settings.has(c.setting)) return false;
    return true;
  };
  // A count ignores its own filter, so it says what choosing it would show.
  const countWith = (skip: keyof F, test: (r: R) => boolean) => rows.filter((r) => pass(r, skip) && test(r)).length;

  const results = useMemo(() => {
    const list = rows.filter((r) => pass(r));
    const prog = f.program;
    const by: Record<SortKey, (a: R, b: R) => number> = {
      relevant: (a, b) => (prog ? offers(b.c, prog) - offers(a.c, prog) : 0) || (a.c.state === HOME_STATE ? 0 : 1) - (b.c.state === HOME_STATE ? 0 : 1) || (b.c.finish ?? -1) - (a.c.finish ?? -1),
      acceptance: (a, b) => (b.c.admitRate ?? 100) - (a.c.admitRate ?? 100),
      tuition: (a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity),
      outcomes: (a, b) => outcomesScore(b.c) - outcomesScore(a.c),
      program: (a, b) => (prog ? offers(b.c, prog) - offers(a.c, prog) : 0) || outcomesScore(b.c) - outcomesScore(a.c),
    };
    return list.sort(by[sort]);
  }, [rows, f, q, sort, saved]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = results.length;

  // The one row of what is on.
  const chips: { key: string; label: string; remove: () => void }[] = [];
  for (const t of f.types) chips.push({ key: `t-${t}`, label: SCHOOL_TYPES.find((x) => x.key === t)!.label, remove: () => set({ types: tog(f.types, t) }) });
  for (const s of f.states) chips.push({ key: `s-${s}`, label: STATES.find((x) => x.code === s)?.name ?? s, remove: () => set({ states: tog(f.states, s) }) });
  if (f.within !== null) chips.push({ key: "within", label: `Within ${f.within} mi`, remove: () => set({ within: null }) });
  for (const a of f.admit) { const m = ADMIT.find((x) => x.key === a)!; chips.push({ key: `a-${a}`, label: `${m.big} ${m.small}`, remove: () => set({ admit: tog(f.admit, a) }) }); }
  if (f.sat) chips.push({ key: "sat", label: `SAT ${f.sat}`, remove: () => set({ sat: null }) });
  if (f.act) chips.push({ key: "act", label: `ACT ${f.act}`, remove: () => set({ act: null }) });
  for (const x of f.fit) chips.push({ key: `f-${x}`, label: FIT.find((y) => y.key === x)!.label, remove: () => set({ fit: tog(f.fit, x) }) });
  for (const d of f.degrees) chips.push({ key: `d-${d}`, label: d, remove: () => set({ degrees: tog(f.degrees, d) }) });
  if (f.program) chips.push({ key: "program", label: programLabel(f.program), remove: () => set({ program: null }) });
  if (f.costCap !== null) chips.push({ key: "cost", label: `Under ${money(f.costCap)}`, remove: () => set({ costCap: null }) });
  for (const c of f.controls) chips.push({ key: `c-${c}`, label: c, remove: () => set({ controls: tog(f.controls, c) }) });
  for (const s of f.sizes) chips.push({ key: `z-${s}`, label: `${s} school`, remove: () => set({ sizes: tog(f.sizes, s) }) });
  for (const s of f.settings) chips.push({ key: `w-${s}`, label: s, remove: () => set({ settings: tog(f.settings, s) }) });

  const firstOf = <T,>(s: Set<T>) => [...s][0];
  const summary = (size: number, first: string | undefined) => (size === 0 ? undefined : size === 1 ? first : `${size} picked`);
  const programs = useMemo(() => programIndex(COLLEGES), []);
  const pq = programQ.trim().toLowerCase();
  const programList = (pq ? programs.filter((p) => p.label.toLowerCase().includes(pq)) : programs).filter((p) => p.name !== f.program).slice(0, pq ? 40 : 12);
  const moreCount = (f.costCap !== null ? 1 : 0) + f.controls.size + f.sizes.size + f.settings.size;
  const bubble = (Icon: typeof School) => <span className="flex size-[34px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: SOFT }}><Icon className="h-4 w-4" aria-hidden /></span>;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <SearchBox query={query} setQuery={setQuery} onProgram={(p) => { set({ program: p }); setSort("program"); }} onState={(s) => set({ states: new Set([...f.states, s]) })} />

      {/* One quiet row, the same language as Opportunities (1 Oct 2026; Chandu:
         "borrow the same design language for the filter/sort stuff"): text-level
         triggers between hairlines, Sort and the count at the right, chips only
         when something is on. Both scrollbar rules, per the guardrails. */}
      <StickyBar>
      {/* dm-dense: seven controls plus the count and Sort are wider than the
         nav pill between 1024 and 1280px, and the row cannot scroll there
         (the panels would clip), so that range drops the trigger icons, the
         count and the word Sort (1 Oct 2026: "the schools page is breaking"). */}
      <div className="dm-scroll dm-dense relative z-20 flex items-center gap-[2px] overflow-x-auto py-[6px] [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden" role="toolbar" aria-label="Filters">
        <Dropdown quiet label="School type" active={f.types.size > 0} value={summary(f.types.size, SCHOOL_TYPES.find((x) => f.types.has(x.key))?.label.split(" /")[0])} panel={() => ({
          title: "School type", description: "What kind of school you want to go to.", count: n, width: 420,
          onClear: f.types.size ? () => set({ types: new Set() }) : undefined,
          children: (
            <Section title="Pick any" first>
              {SCHOOL_TYPES.map((t) => {
                const count = countWith("types", (r) => typeOf(r.c) === t.key);
                return <Option key={t.key} on={f.types.has(t.key)} onToggle={() => set({ types: tog(f.types, t.key) })} label={t.label} note={t.key === "Graduate" ? "None in our list yet" : TYPE_META[t.key].note} count={count} disabled={count === 0 && !f.types.has(t.key)} lead={bubble(TYPE_META[t.key].icon)} />;
              })}
            </Section>
          ),
        })} />

        <Dropdown quiet label="Location" icon={<MapPin className="h-4 w-4" aria-hidden />} active={f.states.size > 0 || f.within !== null} value={f.within !== null ? `Within ${f.within} mi` : summary(f.states.size, STATES.find((s) => f.states.has(s.code))?.name)} panel={() => ({
          title: "Location", description: "How far from home, or which states.", count: n, width: 480,
          onClear: f.states.size || f.within !== null ? () => set({ states: new Set(), within: null }) : undefined,
          children: (
            <>
              <Section title="Distance from home" first>
                <div className="flex items-end gap-[12px] rounded-[12px] border p-[12px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <label className="flex w-[110px] flex-none flex-col gap-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    Your ZIP
                    <input inputMode="numeric" maxLength={5} value={f.zip} onChange={(e) => set({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })} className={field} style={{ ...fieldStyle, background: "var(--background)" }} />
                  </label>
                  <span className="flex h-11 min-w-0 flex-1 items-center gap-[6px] text-[14px] font-semibold" style={{ color: home ? "var(--foreground)" : "var(--muted-foreground)" }}>
                    {home ? <><MapPin className="h-4 w-4 flex-none" aria-hidden style={{ color: SOFT }} />{home.place}</> : f.zip.length === 5 ? "We can't place that ZIP yet" : "Enter 5 digits"}
                  </span>
                </div>
                <div className="pt-[6px]">
                  <Chips label="Distance" value={f.within ?? 0} onChange={(v) => set({ within: v === 0 ? null : v })}
                    options={[{ key: 0, label: "Any" }, ...DISTANCES.map((d) => ({ key: d as number, label: `${d} mi` }))]}
                    count={(v) => (v === 0 || !home ? undefined : countWith("within", (r) => r.miles !== null && r.miles <= v))} />
                </div>
              </Section>
              <Section title="States" hint="Pick any">
                <Option on={f.states.has(HOME_STATE)} onToggle={() => set({ states: tog(f.states, HOME_STATE) })} label="New Jersey" note="Your state" count={countWith("states", (r) => r.c.state === HOME_STATE)} lead={bubble(MapPin)} />
                <div className="grid grid-cols-1 gap-x-[6px] pt-[2px] sm:grid-cols-2">
                  {STATES.filter((s) => s.code !== HOME_STATE).map((s) => <Option key={s.code} on={f.states.has(s.code)} onToggle={() => set({ states: tog(f.states, s.code) })} label={s.name} count={countWith("states", (r) => r.c.state === s.code)} />)}
                </div>
              </Section>
            </>
          ),
        })} />

        <Dropdown quiet label="Admissions" active={f.admit.size > 0 || !!f.sat || !!f.act} value={f.sat ? `SAT ${f.sat}` : f.act ? `ACT ${f.act}` : summary(f.admit.size, ADMIT.find((a) => a.key === firstOf(f.admit))?.big)} panel={() => ({
          title: "Admissions", description: "How hard it is to get in, and where your scores fit.", count: n, width: 460,
          onClear: f.admit.size || f.sat || f.act ? () => set({ admit: new Set(), sat: null, act: null }) : undefined,
          children: (
            <>
              <Section title="Acceptance rate" hint="Pick any" first>
                <div className="grid grid-cols-2 gap-[8px]">
                  {ADMIT.map((a) => {
                    const on = f.admit.has(a.key);
                    const count = countWith("admit", (r) => admitOf(r.c.admitRate) === a.key);
                    return (
                      <button key={a.key} type="button" role="checkbox" aria-checked={on} onClick={() => set({ admit: tog(f.admit, a.key) })} className="dm-quiet relative flex min-h-[78px] cursor-pointer flex-col items-start justify-center gap-[3px] rounded-[12px] border px-[14px] py-[10px] text-left" style={on ? { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 16%, transparent)" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                        <span className="text-[16px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{a.big}</span>
                        <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{a.small} · {count} {count === 1 ? "school" : "schools"}</span>
                        {on && <span aria-hidden className="absolute top-[10px] right-[10px] flex size-[18px] items-center justify-center rounded-full" style={{ background: ACCENT }}><Check className="h-[11px] w-[11px] text-white" strokeWidth={3} /></span>}
                      </button>
                    );
                  })}
                </div>
              </Section>
              <Section title="Your test scores" hint="Optional">
                <div className="grid grid-cols-2 gap-[10px]">
                  <label className="flex flex-col gap-[4px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>SAT, 400 to 1600<input inputMode="numeric" value={f.sat ?? ""} onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, "").slice(0, 4), 10); set({ sat: Number.isFinite(v) ? v : null }); }} placeholder="1210" className={field} style={fieldStyle} /></label>
                  <label className="flex flex-col gap-[4px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>ACT, 1 to 36<input inputMode="numeric" value={f.act ?? ""} onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, "").slice(0, 2), 10); set({ act: Number.isFinite(v) ? v : null }); }} placeholder="26" className={field} style={fieldStyle} /></label>
                </div>
                <p className="pt-[6px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Shows schools where your score is in or above the middle half of admitted students. Test-optional policies aren&apos;t listed yet.</p>
              </Section>
            </>
          ),
        })} />

        <Dropdown quiet label="Academic fit" active={f.fit.size > 0} value={summary(f.fit.size, FIT.find((x) => x.key === firstOf(f.fit))?.label)} panel={() => ({
          title: "Academic fit", description: `From your GPA${gpa ? ` ${gpa.toFixed(1)}` : ""}${f.sat ? ` and SAT ${f.sat}` : ""}. An indication, not a prediction.`, count: n, width: 420,
          onClear: f.fit.size ? () => set({ fit: new Set() }) : undefined,
          children: (
            <Section title="Pick any" first>
              {FIT.map((x) => <Option key={x.key} on={f.fit.has(x.key)} onToggle={() => set({ fit: tog(f.fit, x.key) })} label={x.label} note={x.note} count={countWith("fit", (r) => r.fit === x.key)} lead={<span aria-hidden className="mx-[12px] size-[10px] flex-none rounded-full" style={{ background: x.color, boxShadow: `0 0 8px ${x.color}` }} />} />)}
              {!f.sat && <p className="pt-[6px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Add your SAT under Admissions to sharpen this.</p>}
            </Section>
          ),
        })} />

        <Dropdown quiet label="Degree" active={f.degrees.size > 0} value={summary(f.degrees.size, firstOf(f.degrees))} panel={() => ({
          title: "Degree", description: "The level of degree the school awards.", count: n, width: 380,
          onClear: f.degrees.size ? () => set({ degrees: new Set() }) : undefined,
          children: (
            <Section title="Pick any" first>
              {DEGREES.map((d) => <Option key={d} on={f.degrees.has(d)} onToggle={() => set({ degrees: tog(f.degrees, d) })} label={d} note={DEGREE_NOTE[d]} count={countWith("degrees", (r) => degreesOf(r.c).has(d))} />)}
            </Section>
          ),
        })} />

        <Dropdown quiet label="Program" icon={<GraduationCap className="h-4 w-4" aria-hidden />} active={!!f.program} value={f.program ? programLabel(f.program) : undefined} panel={() => ({
          title: "Program", description: "What you want to study. Schools that graduate the most in it come first.", count: n, width: 460,
          onClear: f.program ? () => set({ program: null }) : undefined,
          children: (
            <>
              <div className="border-b px-[16px] py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
                <label className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-[12px] h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                  <span className="sr-only">Search programs</span>
                  <input value={programQ} onChange={(e) => setProgramQ(e.target.value)} placeholder="Search programs, e.g. Nursing" className={`${field} pl-[36px]`} style={fieldStyle} />
                </label>
              </div>
              {f.program && (
                <Section title="Selected" first>
                  <Option radio on onToggle={() => set({ program: null })} label={programLabel(f.program)} note="Tap to remove" count={countWith("program", (r) => !!offers(r.c, f.program!))} />
                </Section>
              )}
              <Section title={pq ? `Matches for "${programQ.trim()}"` : "Most offered"} first={!f.program}>
                {programList.length === 0 ? <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No program matches. Try a shorter word.</p>
                  : programList.map((p) => <Option key={p.name} radio on={false} onToggle={() => { set({ program: p.name }); setSort("program"); setProgramQ(""); }} label={p.label} count={countWith("program", (r) => !!offers(r.c, p.name))} />)}
              </Section>
            </>
          ),
        })} />

        <Dropdown quiet label="More" icon={<SlidersHorizontal className="h-4 w-4" aria-hidden />} active={moreCount > 0} value={moreCount ? `${moreCount}` : undefined} panel={() => ({
          title: "More filters", description: "Cost, who runs it, size and campus.", count: n, width: 640,
          onClear: moreCount ? () => set({ costCap: null, controls: new Set(), sizes: new Set(), settings: new Set() }) : undefined,
          children: (
            <>
              <Section title="Cost for a year" hint="After grants" first>
                <Chips label="Cost" value={f.costCap ?? 0} onChange={(v) => set({ costCap: v === 0 ? null : v })} options={[{ key: 0, label: "Any" }, ...COSTS.map((c) => ({ key: c, label: `Under ${money(c)}` }))]} count={(v) => (v === 0 ? undefined : countWith("costCap", (r) => r.cost !== null && r.cost <= v))} />
              </Section>
              <div className="grid grid-cols-1 border-t sm:grid-cols-2" style={{ borderColor: "var(--glass-border)" }}>
                <Section title="Who runs it" first>
                  {(["Public", "Private", "For profit"] as Control[]).map((c) => <Option key={c} on={f.controls.has(c)} onToggle={() => set({ controls: tog(f.controls, c) })} label={c} count={countWith("controls", (r) => r.c.control === c)} />)}
                </Section>
                <div className="border-t sm:border-t-0 sm:border-l" style={{ borderColor: "var(--glass-border)" }}>
                  <Section title="Size" first>
                    {([["Small", "Under 5,000 students"], ["Medium", "5,000 to 20,000"], ["Large", "Over 20,000"]] as [Size, string][]).map(([s, note]) => <Option key={s} on={f.sizes.has(s)} onToggle={() => set({ sizes: tog(f.sizes, s) })} label={s} note={note} count={countWith("sizes", (r) => r.c.size === s)} />)}
                  </Section>
                </div>
              </div>
              <Section title="Campus setting" hint="Pick any">
                <div className="grid grid-cols-1 gap-x-[6px] sm:grid-cols-2">
                  {(["City", "Suburb", "Town", "Countryside"] as Setting[]).map((s) => <Option key={s} on={f.settings.has(s)} onToggle={() => set({ settings: tog(f.settings, s) })} label={s} count={countWith("settings", (r) => r.c.setting === s)} />)}
                </div>
              </Section>
            </>
          ),
        })} />
        <div className="ml-auto flex flex-none items-center gap-[8px]">
          <span className="dm-dense-hide text-[13px] leading-[18px] font-semibold tabular-nums whitespace-nowrap" style={{ color: "var(--muted-foreground)" }} aria-live="polite">{n} {n === 1 ? "school" : "schools"}</span>
          <Dropdown quiet denseHideLabel label="Sort" icon={<ArrowUpDown className="h-4 w-4" aria-hidden />} active={false} value={SORTS.find((s) => s.key === sort)!.label} panel={(close) => ({
          title: "Sort by", description: "The order results are listed in.", count: n, width: 360,
          children: (
            <Section title="Order" first>
              {SORTS.map((s) => <Option key={s.key} radio on={sort === s.key} onToggle={() => { setSort(s.key); close(); }} label={s.label} note={s.key === "program" && !f.program ? "Pick a program first" : s.note} disabled={s.key === "program" && !f.program} />)}
            </Section>
          ),
        })} />
        </div>
      </div>
      </StickyBar>

      {(chips.length > 0 || q) && (
        <div className="-mt-[6px] flex flex-wrap items-center gap-[8px]" aria-label="Applied filters">
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={c.remove} aria-label={`Remove ${c.label}`} className="dm-quiet flex min-h-[30px] flex-none cursor-pointer items-center gap-[6px] rounded-full px-[11px] text-[13px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: SOFT }}>
              {c.label} <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
          {(chips.length > 0 || q) && <button type="button" onClick={() => { setF(empty()); setQuery(""); }} className="dm-link flex-none cursor-pointer text-[13px] font-bold whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>Clear all</button>}
        </div>
      )}

      {n === 0 ? (
        <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
          <EmptyView tier={5} query={[...(q ? [`"${query.trim()}"`] : []), ...chips.map((c) => c.label)].join(", ")} line="Take off a filter, or widen the distance." cta="Clear filters" onAction={() => { setF(empty()); setQuery(""); }} />
        </section>
      ) : (
        <ul className={`grid grid-cols-1 gap-[var(--space-5)] ${n === 1 ? "" : n === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`} aria-label="Schools">
          {results.map(({ c, fit, miles }) => {
            const prog = f.program && offers(c, f.program) ? programLabel(f.program) : undefined;
            const badge: CardBadge | undefined = fit ? { label: fit === "Open" ? "Open admission" : fit, tone: FIT_TONE[fit] } : undefined;
            return (
              <li key={c.slug} className="min-w-0">
                <SchoolCard c={c} saved={saved.has(c.slug)} onSave={() => onSave(c.slug)} compared={compare.includes(c.slug)} onCompare={() => onCompare(c.slug)} program={prog} fit={badge} extraChip={f.within !== null && miles !== null ? { label: `${miles} mi`, tone: "muted" } : undefined} />
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
        Government figures, 2024-25. Costs are what families paid after grants. Outcomes rank uses graduation, return and loan repayment rates; distances are approximate.
      </p>
    </div>
  );
}
