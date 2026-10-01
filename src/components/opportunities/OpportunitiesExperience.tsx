"use client";

// Opportunities (1 Oct 2026). The fifth destination: real scholarships,
// programs and internships that fit the student, kept with their dates.
// Decided in Joshua's thread (30 Sept) after SchooLinks' own walkthroughs
// (docs/reference/schoolinks-scholarships-and-applications-notes-2026-10.md):
// finding money and programs is neither exploring (Explore is "who am I")
// nor people (Connect), and Joshua lost the partner internships four taps
// into a Connect board. Named Opportunities, not Apply or Earn (Chandu:
// "apply reads like an action... anxiety inducing for a kid who hasn't
// decided anything"; "earn sounds too grown up, 8th grader comprehension").
//
// Design passes, same day. Chandu: "VERY TEXT HEAVY... progressive
// disclosure is key... title > subtitle > body top down everywhere... use
// logos... lead the eye along the story"; "cards have to be clickable...
// all of these pills look the same so they all compete"; "don't do the
// side bar sheet, it's too narrow and sits very far on large screens";
// "where are the internships tabs?". So:
// 1. The title, one line, and ONE contained control: Scholarships |
//    Programs | Internships. Filters, Saved and Sort are quiet text-level
//    controls on their own row.
// 2. A grid of cards (Card.tsx), the whole card the click target. Nothing
//    is open until a card is clicked; then the grid narrows and the preview
//    (Preview.tsx) opens as a second pane in the page, LinkedIn-style: full
//    height under the filter bar, flat edge to the page's right edge, its
//    own scroll, a draggable left edge (Chandu: "like LinkedIn does, a
//    second pane in the page itself, adjustable left edge, scrollable within
//    the panel, but not separate like a sheet"). Phones get a sheet.
// 3. "Later" is folded shut: what opens to you in a later grade, one tap.
// Fit is reasons, not a percentage; nothing is applied for here.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, BookmarkCheck, CalendarClock, ChevronDown, SlidersHorizontal, Tag, Trophy, Wallet, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { EmptyView } from "@/components/app/states";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { Chips, Dropdown, Option, Section, StickyBar } from "@/components/colleges/filterKit";
import { COLLEGES } from "@/components/colleges/data";
import { opportunityStore, setFafsaStatus, setOpportunityStatus, type FafsaStatus, type OpportunityStatus } from "@/lib/opportunities";
import { FIELDS, PROGRAM_KIND, SCHOLARSHIP_KIND, type Field, type Paid, type ProgramKind, type ScholarshipKind } from "./types";
import { fitFor, timing, today, useStudent, worldToField, type Timing } from "./match";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "./data";
import { Card, MUTED, type Enriched } from "./Card";
import { Preview } from "./Preview";

export type Tab = "scholarships" | "programs" | "internships";
type Closes = "any" | "month" | "3mo" | "later";
type AmountMin = 0 | 1000 | 5000 | 20000 | "full";
type Cost = "free" | "paid" | "tuition";
type SortKey = "fit" | "closing" | "amount" | "az";
type F = { closes: Closes; fields: Set<Field>; kinds: Set<string>; amount: AmountMin; cost: Set<Cost>; grade: number | null; savedOnly: boolean; school: string | null };

const ITEMS: Record<Tab, Enriched["item"][]> = { scholarships: SCHOLARSHIP_ITEMS, programs: PROGRAM_ITEMS, internships: INTERNSHIP_ITEMS };
const NOUN: Record<Tab, string> = { scholarships: "scholarship", programs: "program", internships: "internship" };
const LABEL: Record<Tab, string> = { scholarships: "Scholarships", programs: "Programs", internships: "Internships" };
const PROGRAM_KINDS: ProgramKind[] = ["summer", "fellowship", "competition", "leadership"];
const INTERNSHIP_KINDS: ProgramKind[] = ["internship", "apprenticeship"];
const CLOSES: { key: Closes; label: string }[] = [{ key: "any", label: "Any time" }, { key: "month", label: "This month" }, { key: "3mo", label: "Next 3 months" }, { key: "later", label: "Later" }];
const AMOUNTS: { key: AmountMin; label: string }[] = [{ key: 0, label: "Any" }, { key: 1000, label: "$1,000+" }, { key: 5000, label: "$5,000+" }, { key: 20000, label: "$20,000+" }, { key: "full", label: "Full ride" }];
const COSTS: { key: Cost; label: string }[] = [{ key: "free", label: "Free" }, { key: "paid", label: "Pays you" }, { key: "tuition", label: "Has tuition" }];
const SORTS: Record<Tab, { key: SortKey; label: string }[]> = {
  scholarships: [{ key: "fit", label: "Best fit" }, { key: "closing", label: "Closing soon" }, { key: "amount", label: "Biggest" }, { key: "az", label: "A to Z" }],
  programs: [{ key: "fit", label: "Best fit" }, { key: "closing", label: "Closing soon" }, { key: "az", label: "A to Z" }],
  internships: [{ key: "fit", label: "Best fit" }, { key: "closing", label: "Closing soon" }, { key: "az", label: "A to Z" }],
};

const PANE_MIN = 360;
const PANE_MAX = 760;
// The pane starts under the docked filter bar: the pill's bottom (68) plus the bar (49).
const PANE_TOP = 117;

const empty = (): F => ({ closes: "any", fields: new Set(), kinds: new Set(), amount: 0, cost: new Set(), grade: null, savedOnly: false, school: null });
const tog = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
const costOf = (p: Paid): Cost | null => (p === "free" ? "free" : p === "paid" || p === "stipend" ? "paid" : p === "tuition" ? "tuition" : null);

export function OpportunitiesExperience({ initialTab, initialField = "", initialSchool = "", initialSaved = false }: { initialTab: Tab; initialField?: string; initialSchool?: string; initialSaved?: boolean }) {
  const student = useStudent();
  const record = opportunityStore.useValue();
  const [todayIso] = useState(() => today());
  const [tab, setTab] = useState<Tab>(initialTab);
  const school = initialSchool ? COLLEGES.find((c) => c.slug === initialSchool) ?? null : null;
  const [f, setF] = useState<F>(() => {
    const base = empty();
    const fld = (FIELDS as string[]).includes(initialField) ? (initialField as Field) : worldToField(initialField);
    if (fld) base.fields = new Set([fld]);
    if (school) base.school = school.slug;
    if (initialSaved) base.savedOnly = true;
    return base;
  });
  const set = (patch: Partial<F>) => setF((cur) => ({ ...cur, ...patch }));
  const [sort, setSort] = useState<SortKey>("fit");
  const [laterOpen, setLaterOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  // The pane's width, dragged from its left edge; remembered per browser.
  const [paneW, setPaneW] = useState(480);
  const paneRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let v = 0;
    try { v = Number(window.localStorage.getItem("dm-opportunities-pane")); } catch { /* no storage */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a per-browser preference read after mount, so the server and first client render agree
    if (v >= PANE_MIN && v <= PANE_MAX) setPaneW(v);
  }, []);
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const right = paneRef.current?.getBoundingClientRect().right ?? window.innerWidth;
    const move = (ev: PointerEvent) => setPaneW(Math.round(Math.min(PANE_MAX, Math.max(PANE_MIN, right - ev.clientX))));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setPaneW((w) => { try { window.localStorage.setItem("dm-opportunities-pane", String(w)); } catch { /* no storage */ } return w; }); };
    e.preventDefault();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const [last, setLast] = useState<{ id: string; prev: OpportunityStatus | null } | null>(null);

  const grade = f.grade ?? student.grade;
  const me = useMemo(() => ({ ...student, grade }), [student, grade]);
  const all = useMemo<Enriched[]>(() => ITEMS[tab].map((item) => ({ item, fit: fitFor(item, me), time: timing(item, todayIso) })), [tab, me, todayIso]);
  const savedCount = useMemo(() => [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS, ...INTERNSHIP_ITEMS].filter((i) => record.status[i.id]).length, [record]);

  const passes = (e: Enriched, g: F): boolean => {
    const { item, fit, time } = e;
    if (g.savedOnly) return !!record.status[item.id];
    if (fit.when === "no") return false;
    if (g.school) { const sc = COLLEGES.find((c) => c.slug === g.school); if (sc && !item.states.includes("Any") && !item.states.includes(sc.state)) return false; }
    if (g.closes === "month" && !(time.status === "open" && time.days !== null && time.days <= 31)) return false;
    if (g.closes === "3mo" && !(time.status === "open" && time.days !== null && time.days <= 92)) return false;
    if (g.closes === "later" && !(time.status === "unknown" || (time.days !== null && time.days > 92))) return false;
    if (g.fields.size && !item.fields.some((x) => g.fields.has(x))) return false;
    if (g.kinds.size && !g.kinds.has(item.kind)) return false;
    if (item.type === "scholarship") {
      if (g.amount === "full" && !/full/i.test(item.amount)) return false;
      if (typeof g.amount === "number" && g.amount > 0 && (item.amountMax === null || item.amountMax < g.amount) && !/full/i.test(item.amount)) return false;
    } else if (g.cost.size) {
      const c = costOf(item.paid);
      if (!c || !g.cost.has(c)) return false;
    }
    return true;
  };
  const countWith = (patch: Partial<F>) => all.filter((e) => passes(e, { ...f, ...patch })).length;

  const visible = useMemo(() => {
    const rows = all.filter((e) => passes(e, f));
    const dayRank = (t: Timing) => (t.status === "open" && t.days !== null ? t.days : t.status === "unknown" ? 9000 : 99999);
    rows.sort((a, b) => {
      if (sort === "az") return a.item.name.localeCompare(b.item.name);
      if (sort === "closing") return dayRank(a.time) - dayRank(b.time) || b.fit.score - a.fit.score;
      if (sort === "amount") { const am = (e: Enriched) => (e.item.type === "scholarship" ? (/full/i.test(e.item.amount) ? 1e9 : e.item.amountMax ?? -1) : -1); return am(b) - am(a) || dayRank(a.time) - dayRank(b.time); }
      return b.fit.score - a.fit.score || dayRank(a.time) - dayRank(b.time);
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- passes reads f and record, both listed
  }, [all, f, sort, record]);

  const now = f.savedOnly ? visible : visible.filter((e) => e.fit.when === "now");
  const later = f.savedOnly ? [] : visible.filter((e) => e.fit.when === "later");
  const noun = NOUN[tab];
  const n = visible.length;

  const setStatus = (id: string, next: OpportunityStatus | null) => { setLast({ id, prev: record.status[id]?.status ?? null }); setOpportunityStatus(id, next); };
  const toggleSave = (id: string) => setStatus(id, record.status[id] ? null : "saved");
  const undo = () => { if (last) { setOpportunityStatus(last.id, last.prev); setLast(null); } };
  const open = (id: string) => setSelected((cur) => (cur === id ? null : id));
  const switchTab = (t: Tab) => { setTab(t); setLaterOpen(false); setSelected(null); setF((cur) => ({ ...cur, kinds: new Set(), amount: 0, cost: new Set() })); setSort("fit"); };
  // Nothing is open until a card is clicked.
  const shown = selected ? visible.find((e) => e.item.id === selected) ?? null : null;
  useEffect(() => {
    if (!shown) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [shown]);

  // The one line under the title: what is open to this grade now, and when
  // the rest opens. Counted on the whole list, not the filtered one.
  const nowAll = all.filter((e) => e.fit.when === "now").length;
  const laterAll = all.filter((e) => e.fit.when === "later");
  const nextGrade = laterAll.length ? Math.min(...laterAll.map((e) => (e.item.grades.length ? Math.min(...e.item.grades.filter((g) => g > grade)) : 13))) : null;
  const laterWord = nextGrade === null ? "" : nextGrade === 12 ? "as a senior" : nextGrade === 13 ? "in college" : `in grade ${nextGrade}`;
  const line = f.savedOnly ? `${savedCount} saved` : `${nowAll} open to you now${laterAll.length ? `. ${laterAll.length} more ${laterWord}.` : "."}`;

  const chips: { key: string; label: string; off: () => void }[] = [];
  if (f.school && school) chips.push({ key: "school", label: `Usable at ${school.name}`, off: () => set({ school: null }) });
  if (f.closes !== "any") chips.push({ key: "closes", label: CLOSES.find((c) => c.key === f.closes)!.label, off: () => set({ closes: "any" }) });
  f.fields.forEach((x) => chips.push({ key: `field-${x}`, label: x, off: () => set({ fields: tog(f.fields, x) }) }));
  f.kinds.forEach((k) => chips.push({ key: `kind-${k}`, label: tab === "scholarships" ? SCHOLARSHIP_KIND[k as ScholarshipKind]?.label ?? k : PROGRAM_KIND[k as ProgramKind]?.label ?? k, off: () => set({ kinds: tog(f.kinds, k) }) }));
  if (f.amount !== 0) chips.push({ key: "amount", label: AMOUNTS.find((a) => a.key === f.amount)!.label, off: () => set({ amount: 0 }) });
  f.cost.forEach((c) => chips.push({ key: `cost-${c}`, label: COSTS.find((x) => x.key === c)!.label, off: () => set({ cost: tog(f.cost, c) }) }));
  if (f.grade !== null && f.grade !== student.grade) chips.push({ key: "grade", label: `Grade ${f.grade}`, off: () => set({ grade: null }) });
  const moreCount = (f.amount !== 0 ? 1 : 0) + (tab === "programs" ? f.cost.size : 0) + (f.grade !== null && f.grade !== student.grade ? 1 : 0);

  const counts: Record<Tab, number> = {
    scholarships: SCHOLARSHIP_ITEMS.filter((i) => fitFor(i, student).when !== "no").length,
    programs: PROGRAM_ITEMS.filter((i) => fitFor(i, student).when !== "no").length,
    internships: INTERNSHIP_ITEMS.filter((i) => fitFor(i, student).when !== "no").length,
  };
  const kindLabel = (k: string) => (tab === "scholarships" ? SCHOLARSHIP_KIND[k as ScholarshipKind].label : PROGRAM_KIND[k as ProgramKind].label);
  const kindOptions: { key: string; label: string; note: string }[] = tab === "scholarships"
    ? (Object.keys(SCHOLARSHIP_KIND) as ScholarshipKind[]).map((k) => ({ key: k, ...SCHOLARSHIP_KIND[k] }))
    : (tab === "programs" ? PROGRAM_KINDS : INTERNSHIP_KINDS).map((k) => ({ key: k, ...PROGRAM_KIND[k] }));

  // The one contained control on the page.
  const segment = (
    <div role="tablist" aria-label="Scholarships, programs or internships" className="flex flex-none items-center gap-[3px] rounded-full border p-[3px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      {(["scholarships", "programs", "internships"] as Tab[]).map((key) => {
        const on = tab === key;
        return (
          <button key={key} type="button" role="tab" aria-selected={on} onClick={() => switchTab(key)} className="dm-quiet flex h-[36px] cursor-pointer items-center gap-[7px] rounded-full px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap sm:px-[16px]" style={on ? { background: ACCENT, color: "#fff" } : { color: "var(--foreground)" }}>
            {LABEL[key]}<span className="text-[12px] font-semibold tabular-nums" style={{ color: on ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)" }}>{counts[key]}</span>
          </button>
        );
      })}
    </div>
  );
  // Saved is a quiet toggle, like the filters beside it.
  const savedButton = (
    <button type="button" aria-pressed={f.savedOnly} onClick={() => set({ savedOnly: !f.savedOnly })} className="dm-quiet flex h-[36px] flex-none cursor-pointer items-center gap-[6px] rounded-[9px] px-[10px] text-[14px] leading-[18px] font-semibold whitespace-nowrap" style={{ background: f.savedOnly ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent", color: f.savedOnly ? "var(--foreground)" : "var(--muted-foreground)" }}>
      <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: savedCount ? SOFT : "currentColor" }} />
      Saved{savedCount ? <span className="tabular-nums" style={{ color: SOFT }}>{savedCount}</span> : null}
    </button>
  );
  // Full width until something is open; then as many columns as fit beside the pane.
  const grid = shown ? "grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]" : "grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";
  const card = (e: Enriched) => <li key={e.item.id} className="min-w-0"><Card e={e} on={e.item.id === selected} status={record.status[e.item.id]?.status ?? null} onOpen={() => open(e.item.id)} onSave={() => toggleSave(e.item.id)} /></li>;
  const previewProps = shown && { e: shown, status: record.status[shown.item.id]?.status ?? null, setStatus: (s: OpportunityStatus | null) => setStatus(shown.item.id, s), undo: last?.id === shown.item.id ? undo : undefined, onClose: () => setSelected(null) };

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation active="Opportunities" />
      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[24px] px-5 pt-3 pb-[140px] sm:px-[var(--space-14)] md:pt-8">
        {/* 1. Title, the one line, the three lists. */}
        <div className="flex w-full flex-col gap-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[var(--space-6)]">
          <div className="flex min-w-0 flex-col gap-[8px]">
            <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Opportunities</h1>
            <p className="text-[17px] leading-[24px]" style={MUTED}>{line}</p>
          </div>
          <div className="dm-scroll -mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">{segment}</div>
        </div>

        {student.grade === 12 && tab === "scholarships" && !f.savedOnly && <Fafsa value={record.fafsa} />}

        {/* 2. Filters, Saved and Sort: one quiet row between hairlines, sticky
           under the nav (frosts only while stuck). Phones scroll it sideways
           (both scrollbar rules, per the guardrails). */}
        {/* StickyBar sits directly in main (a tall parent), since a sticky
           element only sticks within its parent's own height. */}
          <StickyBar>
          <div className="dm-scroll relative z-20 flex items-center gap-[2px] overflow-x-auto py-[6px] [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            <Dropdown quiet label="Closes" icon={<CalendarClock className="h-4 w-4" aria-hidden />} active={f.closes !== "any"} value={f.closes !== "any" ? CLOSES.find((c) => c.key === f.closes)!.label : undefined} panel={() => ({
              title: "Closes", description: "How soon the deadline is.", noun, count: n, width: 360,
              onClear: f.closes !== "any" ? () => set({ closes: "any" }) : undefined,
              children: <Section title="Deadline" first><Chips options={CLOSES} value={f.closes} onChange={(v) => set({ closes: v })} label="Deadline" count={(v) => countWith({ closes: v })} /></Section>,
            })} />
            <Dropdown quiet label="Type" icon={<Trophy className="h-4 w-4" aria-hidden />} active={f.kinds.size > 0} value={f.kinds.size ? (f.kinds.size === 1 ? kindLabel([...f.kinds][0]) : `${f.kinds.size}`) : undefined} panel={() => ({
              title: "Type", description: tab === "scholarships" ? "What the money is based on." : "What you would be doing.", noun, count: n, width: 400,
              onClear: f.kinds.size ? () => set({ kinds: new Set() }) : undefined,
              children: <Section title={tab === "scholarships" ? "Based on" : "Kind"} first>{kindOptions.map((k) => <Option key={k.key} on={f.kinds.has(k.key)} onToggle={() => set({ kinds: tog(f.kinds, k.key) })} label={k.label} note={k.note} count={countWith({ kinds: new Set([k.key]) })} />)}</Section>,
            })} />
            <Dropdown quiet label="Field" icon={<Tag className="h-4 w-4" aria-hidden />} active={f.fields.size > 0} value={f.fields.size ? (f.fields.size === 1 ? [...f.fields][0] : `${f.fields.size}`) : undefined} panel={() => ({
              title: "Field", description: "Your Top 3 already counts in Best fit.", noun, count: n, width: 380,
              onClear: f.fields.size ? () => set({ fields: new Set() }) : undefined,
              children: <Section title="Fields" first>{FIELDS.map((x) => <Option key={x} on={f.fields.has(x)} onToggle={() => set({ fields: tog(f.fields, x) })} label={x} note={student.fields.includes(x) ? "In your Top 3" : undefined} count={countWith({ fields: new Set([x]) })} />)}</Section>,
            })} />
            {tab === "internships" && (
              <Dropdown quiet label="Pay" icon={<Wallet className="h-4 w-4" aria-hidden />} active={f.cost.size > 0} value={f.cost.size ? COSTS.find((c) => c.key === [...f.cost][0])!.label : undefined} panel={() => ({
                title: "Pay", description: "Paid, free, or has a fee.", noun, count: n, width: 340,
                onClear: f.cost.size ? () => set({ cost: new Set() }) : undefined,
                children: <Section title="Pay" first><Chips options={COSTS} value={f.cost.size === 1 ? [...f.cost][0] : ("" as Cost)} onChange={(v) => set({ cost: f.cost.has(v) ? new Set() : new Set([v]) })} label="Pay" count={(v) => countWith({ cost: new Set([v]) })} /></Section>,
              })} />
            )}
            <Dropdown quiet label="More" icon={<SlidersHorizontal className="h-4 w-4" aria-hidden />} active={moreCount > 0} value={moreCount ? `${moreCount}` : undefined} panel={() => ({
              title: "More", description: tab === "scholarships" ? "How much it pays." : tab === "programs" ? "Cost, and who can apply." : "Who can apply.", noun, count: n, width: 380,
              onClear: moreCount ? () => set({ amount: 0, cost: tab === "programs" ? new Set() : f.cost, grade: null }) : undefined,
              children: tab === "scholarships"
                ? <Section title="Amount" first><Chips options={AMOUNTS} value={f.amount} onChange={(v) => set({ amount: v })} label="Amount" count={(v) => countWith({ amount: v })} /></Section>
                : (
                  <>
                    {tab === "programs" && <Section title="Cost" first><Chips options={COSTS} value={f.cost.size === 1 ? [...f.cost][0] : ("" as Cost)} onChange={(v) => set({ cost: f.cost.has(v) ? new Set() : new Set([v]) })} label="Cost" count={(v) => countWith({ cost: new Set([v]) })} /></Section>}
                    <Section title="Grade" hint={`You: grade ${student.grade}`} first={tab !== "programs"}><Chips options={[9, 10, 11, 12].map((g) => ({ key: g, label: `${g}` }))} value={grade} onChange={(v) => set({ grade: v === student.grade ? null : v })} label="Grade" /></Section>
                  </>
                ),
            })} />
            <div className="ml-auto flex flex-none items-center gap-[2px]">
              {savedButton}
              <Dropdown quiet label="Sort" icon={<ArrowUpDown className="h-4 w-4" aria-hidden />} active={sort !== "fit"} value={SORTS[tab].find((s) => s.key === sort)!.label} panel={(close) => ({
                title: "Sort", description: "Best fit puts what you can apply to now first.", noun, count: n, width: 320,
                children: <Section title="Order" first>{SORTS[tab].map((s) => <Option key={s.key} radio on={sort === s.key} onToggle={() => { setSort(s.key); close(); }} label={s.label} />)}</Section>,
              })} />
            </div>
          </div>
          </StickyBar>
          {(chips.length > 0 || f.savedOnly) && (
            <div className="-mt-[12px] flex flex-wrap items-center gap-[8px]">
              <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={MUTED}>{n} shown</span>
              {chips.map((c) => (
                <button key={c.key} type="button" onClick={c.off} className="dm-quiet flex h-[30px] cursor-pointer items-center gap-[5px] rounded-full border pr-[8px] pl-[11px] text-[13px] font-semibold" style={{ borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--foreground)" }}>
                  {c.label} <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={() => setF({ ...empty() })} className="dm-link cursor-pointer px-[4px] text-[13px] font-bold" style={{ color: SOFT }}>Clear all</button>
            </div>
          )}

        {/* 3. Cards; 4. Later, folded; the preview beside them once one is open. */}
        <div className={shown ? "dm-opp-split grid w-full gap-[22px] lg:items-start" : ""}>
        <style>{shown ? `@media (min-width: 1024px) { .dm-opp-split { grid-template-columns: minmax(0, 1fr) ${paneW}px; } }` : ""}</style>
        <div className="flex flex-col gap-[26px]">
          {n === 0 && (
            <EmptyView tier={5} heading={f.savedOnly ? "Nothing saved yet" : `No ${noun}s match`} line={f.savedOnly ? "Tap the bookmark on anything you like." : "Try fewer filters."} cta={f.savedOnly ? "See everything" : "Clear filters"} onAction={() => setF(empty())} />
          )}
          {now.length > 0 && <ul className={grid} aria-label={f.savedOnly ? "Saved" : `${noun}s open to you now`}>{now.map(card)}</ul>}
          {later.length > 0 && (
            <section className="flex flex-col gap-[16px]">
              <button type="button" aria-expanded={laterOpen} onClick={() => setLaterOpen((o) => !o)} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-lg)] border px-[20px] py-[16px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[16px] leading-[21px] font-bold">Later</span>
                  <span className="text-[13px] leading-[18px]" style={MUTED}>{later.length} {noun}{later.length === 1 ? "" : "s"} that open to you {laterWord}. Save them now and we keep the dates.</span>
                </span>
                <ChevronDown className="h-5 w-5 flex-none transition-transform" aria-hidden style={{ color: "var(--muted-foreground)", transform: laterOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {laterOpen && <ul className={grid} aria-label={`${noun}s for later`}>{later.map(card)}</ul>}
            </section>
          )}
        </div>
        {previewProps && (
          <aside ref={paneRef} aria-label={`${shown!.item.name}, preview`} className="relative hidden lg:sticky lg:block" style={{ top: PANE_TOP, height: `calc(100dvh - ${PANE_TOP}px)`, marginRight: "calc(-1 * var(--space-14))", marginTop: -22 }}>
            {/* The adjustable left edge. */}
            <div role="separator" aria-orientation="vertical" aria-label="Resize the preview" aria-valuemin={PANE_MIN} aria-valuemax={PANE_MAX} aria-valuenow={paneW} tabIndex={0} onPointerDown={startResize}
              onKeyDown={(ev) => { if (ev.key === "ArrowLeft") setPaneW((w) => Math.min(PANE_MAX, w + 24)); if (ev.key === "ArrowRight") setPaneW((w) => Math.max(PANE_MIN, w - 24)); }}
              className="group absolute inset-y-0 left-[-6px] z-[3] w-[12px] cursor-col-resize">
              <span aria-hidden className="absolute top-1/2 left-[4px] h-[56px] w-[4px] -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" style={{ background: "color-mix(in srgb, var(--foreground) 35%, transparent)" }} />
            </div>
            <div className="dm-scroll h-full overflow-y-auto border-l" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 94%, var(--foreground))" }}>
              <Preview {...previewProps} mode="pane" />
            </div>
          </aside>
        )}
        </div>
      </main>

      {/* Phones and tablets: the same pane as a sheet. Portalled; main is its own stacking context. */}
      {previewProps && createPortal(
        <div className="marketing-v2 themeable lg:hidden" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
          <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="fixed inset-0 z-[115] cursor-default bg-[rgba(8,7,16,0.5)] backdrop-blur-[8px]" />
          <div role="dialog" aria-label={shown!.item.name} className="dm-scroll fixed inset-x-0 bottom-0 z-[116] max-h-[90dvh] overflow-y-auto rounded-t-[24px] pb-[env(safe-area-inset-bottom)]"><Preview {...previewProps} mode="sheet" /></div>
        </div>,
        document.body,
      )}

      <MobileNav active="Opportunities" />
    </div>
  );
}

// ---- FAFSA (seniors only) -------------------------------------------------------

function Fafsa({ value }: { value: FafsaStatus }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[10px] rounded-[var(--radius-lg)] border px-[18px] py-[12px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      <span className="flex flex-col gap-[2px]">
        <span className="text-[15px] leading-[20px] font-bold">FAFSA opened October 1</span>
        <span className="text-[13px] leading-[18px]" style={MUTED}>Most college money starts here.</span>
      </span>
      <div role="radiogroup" aria-label="FAFSA status" className="flex flex-none items-center gap-[3px] rounded-full border p-[3px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        {([["not-started", "Not started"], ["in-progress", "Started"], ["submitted", "Submitted"]] as const).map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={value === k} onClick={() => setFafsaStatus(k)} className="dm-quiet h-[30px] cursor-pointer rounded-full px-[12px] text-[13px] font-semibold whitespace-nowrap" style={value === k ? { background: ACCENT, color: "#fff" } : { color: "var(--foreground)" }}>{label}</button>
        ))}
      </div>
    </div>
  );
}
