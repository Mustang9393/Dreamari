"use client";

// Explore Schools, Browse all v2 (30 Sept 2026). Joshua, from the SchooLinks
// screenshots: "their filtering is easier because the main filters sit
// directly above the results as dropdowns instead of requiring students to
// open a large sidebar... students should be able to filter and sort
// directly from the search results." Chandu: the slide-in sheet "almost
// breaks the flow", "way too many rows of chips", and the search "isn't up
// to par".
//
// So, top to bottom, three things only:
// 1. One search that finds schools, programs and places as you type, in
//    grouped suggestions (a program or place becomes a filter, a school
//    opens it).
// 2. One filter bar: School type, Location, Admissions, Academic fit,
//    Degree, Program, and More, each a dropdown that applies live and
//    shows its choice on the button itself; Sort on the right. On phones it
//    scrolls sideways and each dropdown opens as a bottom sheet.
// 3. The result count, one row of removable chips for what is on, Clear.
// More holds the secondary filters (cost, public or private, size, campus
// setting) as a wide dropdown, not a sheet over the page. The card
// experience is unchanged; a Reach / Target / Likely badge and the matched
// program ride on the card when they apply.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Check, ChevronDown, GraduationCap, MapPin, Search, SlidersHorizontal, X, School, BookOpen, ArrowUpDown } from "lucide-react";
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
  DEGREES, DISTANCES, HOME_ZIP, SCHOOL_TYPES, SORTS, actRange, programsOf, costOf, degreesOf, fitV2, milesFrom, offers, outcomesScore, placeForZip, programIndex, programLabel, satRange, typeOf,
  type Degree, type FitV2, type SchoolType, type SortKey,
} from "./searchV2";

const HOME_STATE = "NJ";

type F = {
  types: Set<SchoolType>;
  states: Set<string>;
  zip: string;
  within: number | null;
  admit: Set<"open" | "over50" | "20to50" | "under20">;
  sat: number | null;
  act: number | null;
  fit: Set<FitV2>;
  degrees: Set<Degree>;
  program: string | null;
  costCap: number | null;
  controls: Set<Control>;
  sizes: Set<Size>;
  settings: Set<Setting>;
};
const empty = (): F => ({ types: new Set(), states: new Set(), zip: HOME_ZIP, within: null, admit: new Set(), sat: null, act: null, fit: new Set(), degrees: new Set(), program: null, costCap: null, controls: new Set(), sizes: new Set(), settings: new Set() });
const tog = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
const ADMIT = [
  { key: "open", label: "Everyone gets in" },
  { key: "over50", label: "Over half get in" },
  { key: "20to50", label: "20% to 50% get in" },
  { key: "under20", label: "Under 20% get in" },
] as const;
const FIT_TONE: Record<FitV2, CardBadge["tone"]> = { Reach: "reach", Target: "target", Likely: "safety", Open: "open" };
const FIT_NOTE: Record<FitV2, string> = { Reach: "Harder to get in for you", Target: "A good match for your record", Likely: "Very likely to get in", Open: "Everyone who applies gets in" };

function useGpa(): number | null {
  const p = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  return parseGpa(p.gpa || ACADEMIC_RECORD.gpa);
}

// ---- The dropdown ----------------------------------------------------------

/** A filter button that opens its panel under it (a bottom sheet on phones).
 *  The button says what is chosen, so the bar itself is the summary. */
function Dropdown({ label, value, icon, active, wide = false, children, footer }: { label: string; value?: string; icon?: React.ReactNode; active: boolean; wide?: boolean; children: (close: () => void) => React.ReactNode; footer?: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  useEffect(() => {
    if (!open) return;
    const r = btn.current?.getBoundingClientRect();
    if (r) setAlignRight(r.left + (wide ? 640 : 320) > window.innerWidth - 16);
    const down = (e: MouseEvent) => { const t = e.target as Node; if (wrap.current && !wrap.current.contains(t) && !sheetRef.current?.contains(t)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open, wide]);
  const close = () => setOpen(false);
  // Below desktop the panel is a bottom sheet, portalled to <body>: <main>
  // is its own stacking layer (z-10), so an in-place sheet sat under the
  // phone nav bar. The portal carries the theme classes itself.
  const [isLg, setIsLg] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsLg(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const panel = (
    <div role="dialog" aria-label={label} className={`fixed inset-x-0 bottom-0 z-[116] flex max-h-[78dvh] flex-col rounded-t-[var(--radius-xl)] border pb-[calc(env(safe-area-inset-bottom)+8px)] lg:absolute lg:z-[71] lg:inset-x-auto lg:top-[48px] lg:bottom-auto lg:max-h-[min(70dvh,560px)] lg:rounded-[var(--radius-lg)] lg:pb-0 ${alignRight ? "lg:right-0" : "lg:left-0"} ${wide ? "lg:w-[min(640px,calc(100vw-32px))]" : "lg:w-[320px]"}`} style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -24px rgba(0,0,0,0.75)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <div className="flex items-center justify-between border-b px-[16px] py-[10px] lg:hidden" style={{ borderColor: "var(--glass-border)" }}>
        <span className="text-[16px] font-bold">{label}</span>
        <button type="button" aria-label="Close" onClick={close} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>
      </div>
      <div className="dm-scroll min-h-0 flex-1 overflow-y-auto p-[8px]">{children(close)}</div>
      {footer && <div className="border-t p-[8px]" style={{ borderColor: "var(--glass-border)" }}>{footer(close)}</div>}
    </div>
  );
  return (
    <div ref={wrap} className="relative flex-none">
      <button
        ref={btn}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="dm-quiet flex h-[40px] cursor-pointer items-center gap-[7px] rounded-full border pr-[12px] pl-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap"
        style={active ? { background: "color-mix(in srgb, var(--primary) 20%, var(--glass-surface-1))", borderColor: ACCENT, color: "var(--foreground)" } : { background: "var(--glass-surface-1)", borderColor: open ? "color-mix(in srgb, var(--foreground) 35%, transparent)" : "var(--glass-border)", color: "var(--foreground)" }}
      >
        {icon}
        <span>{label}</span>
        {value && <span className="max-w-[140px] truncate font-bold" style={{ color: SOFT }}>{value}</span>}
        <ChevronDown aria-hidden className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (isLg ? panel : createPortal(
        <div ref={(el) => { sheetRef.current = el; }} className="marketing-v2 themeable" style={{ background: "transparent" }}>
          <button type="button" aria-label="Close" onClick={close} className="fixed inset-0 z-[115] cursor-default bg-[rgba(8,7,16,0.5)] backdrop-blur-[12px]" />
          {panel}
        </div>,
        document.body,
      ))}
    </div>
  );
}

function Row({ on, onToggle, children, count, radio = false, note, disabled = false }: { on: boolean; onToggle: () => void; children: React.ReactNode; count?: number; radio?: boolean; note?: string; disabled?: boolean }) {
  return (
    <button type="button" role={radio ? "radio" : "checkbox"} aria-checked={on} disabled={disabled} onClick={onToggle} className="dm-quiet flex min-h-[42px] w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[10px] text-left text-[14px] leading-[18px] font-medium disabled:cursor-not-allowed disabled:opacity-45" style={{ color: "var(--foreground)" }}>
      <span aria-hidden className={`flex size-[18px] flex-none items-center justify-center border ${radio ? "rounded-full" : "rounded-[4px]"}`} style={{ borderColor: on ? ACCENT : "rgba(255,255,255,0.35)", background: on ? ACCENT : "transparent" }}>
        {on && (radio ? <span className="size-[7px] rounded-full bg-white" /> : <Check className="h-[12px] w-[12px] text-white" strokeWidth={3} />)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{children}</span>
        {note && <span className="truncate text-[12px]" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
      </span>
      {typeof count === "number" && <span className="flex-none text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{count}</span>}
    </button>
  );
}
const Head = ({ children }: { children: React.ReactNode }) => <h3 className="px-[10px] pt-[8px] pb-[2px] text-[11.5px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{children}</h3>;
function ShowButton({ n, close }: { n: number; close: () => void }) {
  return <button type="button" onClick={close} className="dm-solid flex min-h-[42px] w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[14.5px] font-semibold text-white" style={{ background: ACCENT }}>Show {n} {n === 1 ? "school" : "schools"}</button>;
}
const numberField = "h-10 w-full rounded-[var(--radius-sm)] border px-[10px] text-[14px] font-semibold";
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
    ...places.map((s) => ({ key: `l-${s.code}`, group: "Places", label: s.name, note: `${s.n} schools`, icon: <MapPin className="h-4 w-4" aria-hidden />, run: () => { onState(s.code); setQuery(""); } })),
  ];
  const show = focused && q.length > 0 && opts.length > 0;
  return (
    <div className="relative min-w-0 flex-1">
      <HoverBeam strength={0.85} active={focused} className="w-full">
        <label className="flex min-h-[52px] items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)]" style={{ ...PANEL, borderColor: focused ? "color-mix(in srgb, var(--primary) 55%, rgba(255,255,255,0.16))" : PANEL.borderColor }}>
          <Search className="h-5 w-5 flex-none" aria-hidden style={{ color: q ? SOFT : "var(--muted-foreground)" }} />
          <span className="sr-only">Search schools, programs or places</span>
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
        <div id="school-search-suggestions" role="listbox" className="absolute inset-x-0 top-[58px] z-[60] flex flex-col gap-[2px] rounded-[var(--radius-lg)] border p-[6px]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -24px rgba(0,0,0,0.75)" }}>
          {opts.map((o, i) => (
            <div key={o.key} className="contents">
              {(i === 0 || opts[i - 1].group !== o.group) && <span className="px-[10px] pt-[6px] pb-[2px] text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{o.group}</span>}
              <button id={`sug-${o.key}`} type="button" role="option" aria-selected={i === cursor} onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setCursor(i)} onClick={() => { o.run(); input.current?.blur(); }} className="flex min-h-[40px] w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[10px] text-left" style={{ background: i === cursor ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent" }}>
                <span className="flex-none" style={{ color: SOFT }}>{o.icon}</span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>{o.label}</span>
                <span className="flex-none text-[12px]" style={{ color: "var(--muted-foreground)" }}>{o.group === "Schools" ? o.note : o.group === "Programs" ? `Filter · ${o.note}` : `Filter · ${o.note}`}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- The page ----------------------------------------------------------------

export function BrowseV2({ saved, onSave, compare, onCompare, versionChip }: { saved: Set<string>; onSave: (slug: string) => void; compare: string[]; onCompare: (slug: string) => void; versionChip: React.ReactNode }) {
  const gpa = useGpa();
  const [query, setQuery] = useState("");
  const [f, setF] = useState<F>(empty);
  const [sort, setSort] = useState<SortKey>("relevant");
  const set = (p: Partial<F>) => setF((x) => ({ ...x, ...p }));
  const home = placeForZip(f.zip);
  const q = query.trim().toLowerCase();

  const rows = useMemo(() => COLLEGES.map((c) => ({ c, fit: fitV2(c, gpa, f.sat), miles: home ? milesFrom(c, home.at) : null, cost: costOf(c) })), [gpa, f.sat, home]);
  const pass = (r: (typeof rows)[number], skip?: keyof F) => {
    const { c } = r;
    // Typed text matches the school's name and place, and (from three
    // letters) the programs it offers: "nurs" finds every school with a
    // nursing program, not only schools with Nursing in their name.
    if (q && !`${c.name} ${c.city} ${c.stateName} ${c.state}`.toLowerCase().includes(q) && !(q.length >= 3 && programsOf(c).some((p) => p.name.toLowerCase().includes(q)))) return false;
    if (skip !== "types" && f.types.size && !f.types.has(typeOf(c))) return false;
    if (skip !== "states" && f.states.size && !f.states.has(c.state)) return false;
    if (skip !== "within" && f.within !== null && (r.miles === null || r.miles > f.within)) return false;
    if (skip !== "admit" && f.admit.size) {
      const a = c.admitRate;
      const bucket = a === null ? "open" : a > 50 ? "over50" : a >= 20 ? "20to50" : "under20";
      if (!f.admit.has(bucket)) return false;
    }
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
  // Counts per option ignore that option's own filter, so a count says what
  // choosing it would show.
  const countWith = (skip: keyof F, test: (r: (typeof rows)[number]) => boolean) => rows.filter((r) => pass(r, skip) && test(r)).length;

  const results = useMemo(() => {
    const list = rows.filter((r) => pass(r));
    const prog = f.program;
    const by: Record<SortKey, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      relevant: (a, b) => (prog ? offers(b.c, prog) - offers(a.c, prog) : 0) || (a.c.state === HOME_STATE ? 0 : 1) - (b.c.state === HOME_STATE ? 0 : 1) || (b.c.finish ?? -1) - (a.c.finish ?? -1),
      acceptance: (a, b) => (b.c.admitRate ?? 100) - (a.c.admitRate ?? 100),
      tuition: (a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity),
      outcomes: (a, b) => outcomesScore(b.c) - outcomesScore(a.c),
      program: (a, b) => (prog ? offers(b.c, prog) - offers(a.c, prog) : 0) || outcomesScore(b.c) - outcomesScore(a.c),
    };
    return list.sort(by[sort]);
  }, [rows, f, q, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // One row of chips: everything that is on, each removable.
  const chips: { key: string; label: string; remove: () => void }[] = [];
  for (const t of f.types) chips.push({ key: `t-${t}`, label: SCHOOL_TYPES.find((x) => x.key === t)!.label, remove: () => set({ types: tog(f.types, t) }) });
  for (const s of f.states) chips.push({ key: `s-${s}`, label: STATES.find((x) => x.code === s)?.name ?? s, remove: () => set({ states: tog(f.states, s) }) });
  if (f.within !== null) chips.push({ key: "within", label: `Within ${f.within} mi of ${home?.place ?? f.zip}`, remove: () => set({ within: null }) });
  for (const a of f.admit) chips.push({ key: `a-${a}`, label: ADMIT.find((x) => x.key === a)!.label, remove: () => set({ admit: tog(f.admit, a) }) });
  if (f.sat) chips.push({ key: "sat", label: `SAT ${f.sat}`, remove: () => set({ sat: null }) });
  if (f.act) chips.push({ key: "act", label: `ACT ${f.act}`, remove: () => set({ act: null }) });
  for (const x of f.fit) chips.push({ key: `f-${x}`, label: x === "Open" ? "Open admission" : x, remove: () => set({ fit: tog(f.fit, x) }) });
  for (const d of f.degrees) chips.push({ key: `d-${d}`, label: d, remove: () => set({ degrees: tog(f.degrees, d) }) });
  if (f.program) chips.push({ key: "program", label: programLabel(f.program), remove: () => set({ program: null }) });
  if (f.costCap !== null) chips.push({ key: "cost", label: `Under ${money(f.costCap)}`, remove: () => set({ costCap: null }) });
  for (const c of f.controls) chips.push({ key: `c-${c}`, label: c, remove: () => set({ controls: tog(f.controls, c) }) });
  for (const s of f.sizes) chips.push({ key: `z-${s}`, label: `${s} school`, remove: () => set({ sizes: tog(f.sizes, s) }) });
  for (const s of f.settings) chips.push({ key: `w-${s}`, label: s, remove: () => set({ settings: tog(f.settings, s) }) });
  const moreOn = f.costCap !== null || f.controls.size + f.sizes.size + f.settings.size > 0;
  const summary = (n: number, first?: string) => (n === 0 ? undefined : n === 1 ? first : `${n}`);
  const programs = useMemo(() => programIndex(COLLEGES), []);
  const [programQ, setProgramQ] = useState("");
  const n = results.length;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <SearchBox query={query} setQuery={setQuery} onProgram={(p) => { set({ program: p }); setSort("program"); }} onState={(s) => set({ states: new Set([...f.states, s]) })} />

      {/* The filter bar: every main filter above the results. */}
      <div className="-mx-5 flex items-center gap-[8px] overflow-x-auto px-5 pb-[2px] [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" role="toolbar" aria-label="Filters">
        <Dropdown label="School type" active={f.types.size > 0} value={summary(f.types.size, SCHOOL_TYPES.find((x) => f.types.has(x.key))?.label.split(" /")[0])} footer={(close) => <ShowButton n={n} close={close} />}>
          {() => SCHOOL_TYPES.map((t) => {
            const count = countWith("types", (r) => typeOf(r.c) === t.key);
            return <Row key={t.key} on={f.types.has(t.key)} onToggle={() => set({ types: tog(f.types, t.key) })} count={count} disabled={count === 0 && !f.types.has(t.key)} note={t.key === "Graduate" ? "None in our list yet" : undefined}>{t.label}</Row>;
          })}
        </Dropdown>

        <Dropdown label="Location" icon={<MapPin className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />} active={f.states.size > 0 || f.within !== null} value={f.within !== null ? `${f.within} mi` : summary(f.states.size, STATES.find((s) => f.states.has(s.code))?.name)} footer={(close) => <ShowButton n={n} close={close} />}>
          {() => (
            <>
              <Head>Distance</Head>
              <div className="flex items-center gap-[8px] px-[10px] pb-[6px]">
                <label className="flex-1 text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  From ZIP
                  <input inputMode="numeric" maxLength={5} value={f.zip} onChange={(e) => set({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })} className={`${numberField} mt-[4px]`} style={fieldStyle} />
                </label>
                <span className="mt-[18px] flex-1 truncate text-[12.5px] font-semibold" style={{ color: home ? "var(--foreground)" : "var(--muted-foreground)" }}>{home ? home.place : f.zip.length === 5 ? "We can't place that ZIP yet" : "Enter 5 digits"}</span>
              </div>
              <Row radio on={f.within === null} onToggle={() => set({ within: null })}>Any distance</Row>
              {DISTANCES.map((d) => <Row key={d} radio on={f.within === d} disabled={!home} onToggle={() => set({ within: d })} count={home ? countWith("within", (r) => r.miles !== null && r.miles <= d) : undefined}>Within {d} miles</Row>)}
              <Head>State</Head>
              <Row on={f.states.has(HOME_STATE)} onToggle={() => set({ states: tog(f.states, HOME_STATE) })} count={countWith("states", (r) => r.c.state === HOME_STATE)} note="Your state">New Jersey</Row>
              {STATES.filter((s) => s.code !== HOME_STATE).map((s) => <Row key={s.code} on={f.states.has(s.code)} onToggle={() => set({ states: tog(f.states, s.code) })} count={countWith("states", (r) => r.c.state === s.code)}>{s.name}</Row>)}
            </>
          )}
        </Dropdown>

        <Dropdown label="Admissions" active={f.admit.size > 0 || !!f.sat || !!f.act} value={f.sat ? `SAT ${f.sat}` : f.act ? `ACT ${f.act}` : summary(f.admit.size, ADMIT.find((a) => f.admit.has(a.key))?.label)} footer={(close) => <ShowButton n={n} close={close} />}>
          {() => (
            <>
              <Head>Acceptance rate</Head>
              {ADMIT.map((a) => <Row key={a.key} on={f.admit.has(a.key)} onToggle={() => set({ admit: tog(f.admit, a.key) })} count={countWith("admit", (r) => { const x = r.c.admitRate; const b = x === null ? "open" : x > 50 ? "over50" : x >= 20 ? "20to50" : "under20"; return b === a.key; })}>{a.label}</Row>)}
              <Head>Your scores</Head>
              <div className="grid grid-cols-2 gap-[8px] px-[10px] pb-[6px]">
                <label className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>SAT (400 to 1600)<input inputMode="numeric" value={f.sat ?? ""} onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, "").slice(0, 4), 10); set({ sat: Number.isFinite(v) ? v : null }); }} placeholder="e.g. 1210" className={`${numberField} mt-[4px]`} style={fieldStyle} /></label>
                <label className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>ACT (1 to 36)<input inputMode="numeric" value={f.act ?? ""} onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, "").slice(0, 2), 10); set({ act: Number.isFinite(v) ? v : null }); }} placeholder="e.g. 26" className={`${numberField} mt-[4px]`} style={fieldStyle} /></label>
              </div>
              <p className="px-[10px] pb-[6px] text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>Shows schools where your score is in or above the middle half of admitted students. Your GPA {gpa?.toFixed(1) ?? "not set"} is used for Academic fit. Test policy is not in the data yet.</p>
            </>
          )}
        </Dropdown>

        <Dropdown label="Academic fit" active={f.fit.size > 0} value={summary(f.fit.size, [...f.fit][0] === "Open" ? "Open" : [...f.fit][0])} footer={(close) => <ShowButton n={n} close={close} />}>
          {() => (
            <>
              {(["Reach", "Target", "Likely", "Open"] as FitV2[]).map((x) => <Row key={x} on={f.fit.has(x)} onToggle={() => set({ fit: tog(f.fit, x) })} count={countWith("fit", (r) => r.fit === x)} note={FIT_NOTE[x]}>{x === "Open" ? "Open admission" : x}</Row>)}
              <p className="px-[10px] pt-[4px] pb-[6px] text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>From your GPA{f.sat ? ` and SAT ${f.sat}` : ""} against each school&apos;s acceptance rate{f.sat ? " and scores" : ""}. An indication, not a prediction.</p>
            </>
          )}
        </Dropdown>

        <Dropdown label="Degree" active={f.degrees.size > 0} value={summary(f.degrees.size, [...f.degrees][0])} footer={(close) => <ShowButton n={n} close={close} />}>
          {() => DEGREES.map((d) => <Row key={d} on={f.degrees.has(d)} onToggle={() => set({ degrees: tog(f.degrees, d) })} count={countWith("degrees", (r) => degreesOf(r.c).has(d))}>{d}</Row>)}
        </Dropdown>

        <Dropdown label="Program" icon={<GraduationCap className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />} active={!!f.program} value={f.program ? programLabel(f.program) : undefined} footer={(close) => <ShowButton n={n} close={close} />}>
          {() => (
            <>
              <div className="px-[6px] pb-[6px]">
                <input autoFocus value={programQ} onChange={(e) => setProgramQ(e.target.value)} placeholder="Search programs, e.g. Nursing" className={numberField} style={fieldStyle} />
              </div>
              {f.program && <Row radio on onToggle={() => set({ program: null })} note="Tap to clear">{programLabel(f.program)}</Row>}
              {programs.filter((p) => p.name !== f.program && (!programQ.trim() || p.label.toLowerCase().includes(programQ.trim().toLowerCase()))).slice(0, 40).map((p) => (
                <Row key={p.name} radio on={false} onToggle={() => { set({ program: p.name }); setSort("program"); }} count={countWith("program", (r) => !!offers(r.c, p.name))}>{p.label}</Row>
              ))}
            </>
          )}
        </Dropdown>

        <Dropdown wide label="More" icon={<SlidersHorizontal className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />} active={moreOn} value={moreOn ? String((f.costCap !== null ? 1 : 0) + f.controls.size + f.sizes.size + f.settings.size) : undefined} footer={(close) => (
          <div className="flex items-center gap-[8px]">
            <button type="button" onClick={() => set({ costCap: null, controls: new Set(), sizes: new Set(), settings: new Set() })} className="dm-link cursor-pointer px-[10px] text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>Clear these</button>
            <div className="flex-1"><ShowButton n={n} close={close} /></div>
          </div>
        )}>
          {() => (
            <div className="grid grid-cols-1 gap-x-[8px] sm:grid-cols-2">
              <div>
                <Head>Cost for a year, after grants</Head>
                <Row radio on={f.costCap === null} onToggle={() => set({ costCap: null })}>Any cost</Row>
                {[10000, 15000, 20000, 25000].map((cap) => <Row key={cap} radio on={f.costCap === cap} onToggle={() => set({ costCap: cap })} count={countWith("costCap", (r) => r.cost !== null && r.cost <= cap)}>Under {money(cap)}</Row>)}
                <Head>Who runs it</Head>
                {(["Public", "Private", "For profit"] as Control[]).map((c) => <Row key={c} on={f.controls.has(c)} onToggle={() => set({ controls: tog(f.controls, c) })} count={countWith("controls", (r) => r.c.control === c)}>{c}</Row>)}
              </div>
              <div>
                <Head>Size</Head>
                {([["Small", "Under 5,000 students"], ["Medium", "5,000 to 20,000"], ["Large", "Over 20,000"]] as [Size, string][]).map(([s, note]) => <Row key={s} on={f.sizes.has(s)} onToggle={() => set({ sizes: tog(f.sizes, s) })} note={note} count={countWith("sizes", (r) => r.c.size === s)}>{s}</Row>)}
                <Head>Campus setting</Head>
                {(["City", "Suburb", "Town", "Countryside"] as Setting[]).map((s) => <Row key={s} on={f.settings.has(s)} onToggle={() => set({ settings: tog(f.settings, s) })} count={countWith("settings", (r) => r.c.setting === s)}>{s}</Row>)}
              </div>
            </div>
          )}
        </Dropdown>
      </div>

      {/* Count, what is on (one row), sort. */}
      <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[8px]">
        <div className="flex min-w-0 flex-1 items-center gap-[8px] overflow-x-auto [scrollbar-width:none]" aria-label="Applied filters">
          <span className="flex-none text-[14px] font-bold tabular-nums" style={{ color: "var(--foreground)" }} aria-live="polite">{n} {n === 1 ? "school" : "schools"}</span>
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={c.remove} aria-label={`Remove ${c.label}`} className="dm-quiet flex min-h-[30px] flex-none cursor-pointer items-center gap-[6px] rounded-full px-[11px] text-[13px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: SOFT }}>
              {c.label} <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
          {(chips.length > 0 || q) && <button type="button" onClick={() => { setF(empty()); setQuery(""); }} className="dm-link flex-none cursor-pointer text-[13px] font-bold whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>Clear all</button>}
        </div>
        <span className="flex flex-none items-center gap-[10px]">
          {versionChip}
          <Dropdown label="Sort" icon={<ArrowUpDown className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />} active={false} value={SORTS.find((s) => s.key === sort)!.label}>
            {(close) => SORTS.map((s) => <Row key={s.key} radio on={sort === s.key} onToggle={() => { setSort(s.key); close(); }} note={s.key === "program" && !f.program ? "Pick a program to use this" : s.note} disabled={s.key === "program" && !f.program}>{s.label}</Row>)}
          </Dropdown>
        </span>
      </div>

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

