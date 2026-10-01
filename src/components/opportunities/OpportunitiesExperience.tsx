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
// The page tells one story, top to bottom:
// 1. The title, one line, and ONE contained control: Scholarships |
//    Programs | Internships. Filters and Sort are quiet text-level controls
//    on their own row, which docks into the nav pill while it is stuck.
// 2. A grid of cards (Card.tsx), the whole card the click target. Clicking
//    one switches the page to the reading layout (Gmail, Apple Mail): the
//    grid folds into a compact list on the left and the detail (Preview.tsx)
//    becomes the main surface on the right, in the page, no overlay. Close
//    returns to the grid; previous and next move through the list. Chosen
//    after a drawer, a side pane, a page, an in-row panel and an expanding
//    card all failed (Chandu: "let's not do the pop up modals, try the
//    reading layout").
// 3. "Later" is folded shut: what opens to you in a later grade. Scrolling
//    to it the first time opens it on its own, so its use is understood.
// 4. No Saved view here. Saved things live in one place, the Profile's
//    Saved (Chandu: "a central place for saved... train the students to
//    reach the saved and learn where it lives"), so every Save confirms
//    with the way there.
// Fit is reasons, not a percentage; nothing is applied for here.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, BookmarkCheck, CalendarClock, ChevronDown, ChevronRight, SlidersHorizontal, Tag, Trophy, Wallet, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { EmptyView } from "@/components/app/states";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { Chips, Dropdown, Option, Section, StickyBar } from "@/components/colleges/filterKit";
import { COLLEGES } from "@/components/colleges/data";
import { savedHref } from "@/components/profile/layoutVersion";
import { opportunityStore, setFafsaStatus, setOpportunityStatus, type FafsaStatus, type OpportunityStatus } from "@/lib/opportunities";
import { FIELDS, PROGRAM_KIND, SCHOLARSHIP_KIND, type Field, type Paid, type ProgramKind, type ScholarshipKind } from "./types";
import { fitFor, timing, today, useStudent, worldToField, type Timing } from "./match";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "./data";
import { Card, CardRow, MUTED, type Enriched } from "./Card";
import { Expanded } from "./Preview";

export type Tab = "scholarships" | "programs" | "internships";
type Closes = "any" | "month" | "3mo" | "later";
type AmountMin = 0 | 1000 | 5000 | 20000 | "full";
type Cost = "free" | "paid" | "tuition";
type SortKey = "fit" | "closing" | "amount" | "az";
type F = { closes: Closes; fields: Set<Field>; kinds: Set<string>; amount: AmountMin; cost: Set<Cost>; grade: number | null; school: string | null };

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
const LATER_NUDGED = "dm-opp-later-nudged";

const empty = (): F => ({ closes: "any", fields: new Set(), kinds: new Set(), amount: 0, cost: new Set(), grade: null, school: null });
const tog = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
const costOf = (p: Paid): Cost | null => (p === "free" ? "free" : p === "paid" || p === "stipend" ? "paid" : p === "tuition" ? "tuition" : null);

export function OpportunitiesExperience({ initialTab, initialField = "", initialSchool = "", initialOpen = "" }: { initialTab: Tab; initialField?: string; initialSchool?: string; initialOpen?: string }) {
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
    return base;
  });
  const set = (patch: Partial<F>) => setF((cur) => ({ ...cur, ...patch }));
  const [sort, setSort] = useState<SortKey>("fit");
  const [laterOpen, setLaterOpen] = useState(false);
  const [laterPulse, setLaterPulse] = useState(false);
  const [selected, setSelected] = useState<string | null>(initialOpen || null);
  const [last, setLast] = useState<{ id: string; prev: OpportunityStatus | null } | null>(null);
  const [nudge, setNudge] = useState<{ name: string } | null>(null);
  const laterRef = useRef<HTMLElement>(null);

  const grade = f.grade ?? student.grade;
  const me = useMemo(() => ({ ...student, grade }), [student, grade]);
  const all = useMemo<Enriched[]>(() => ITEMS[tab].map((item) => ({ item, fit: fitFor(item, me), time: timing(item, todayIso) })), [tab, me, todayIso]);

  const passes = (e: Enriched, g: F): boolean => {
    const { item, fit, time } = e;
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
    const whenRank = { now: 0, later: 1, no: 2 } as const;
    rows.sort((a, b) => {
      if (sort === "az") return a.item.name.localeCompare(b.item.name);
      if (sort === "closing") return dayRank(a.time) - dayRank(b.time) || b.fit.score - a.fit.score;
      if (sort === "amount") { const am = (e: Enriched) => (e.item.type === "scholarship" ? (/full/i.test(e.item.amount) ? 1e9 : e.item.amountMax ?? -1) : -1); return am(b) - am(a) || dayRank(a.time) - dayRank(b.time); }
      return whenRank[a.fit.when] - whenRank[b.fit.when] || b.fit.score - a.fit.score || dayRank(a.time) - dayRank(b.time);
    });
    return rows;
  }, [all, f, sort]);

  const now = visible.filter((e) => e.fit.when === "now");
  const later = visible.filter((e) => e.fit.when === "later");
  const noun = NOUN[tab];
  const n = visible.length;

  // The expanded card: nothing is open until a card is clicked.
  const shownIndex = selected ? visible.findIndex((e) => e.item.id === selected) : -1;
  const shown = shownIndex >= 0 ? visible[shownIndex] : null;
  const close = () => setSelected(null);
  const step = (d: 1 | -1) => { const nx = visible[shownIndex + d]; if (nx) { setSelected(nx.item.id); if (nx.fit.when === "later") setLaterOpen(true); } };
  useEffect(() => {
    if (!shown) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-bound per open item; step closes over the current list on purpose
  }, [shown?.item.id]);
  // The URL names the open item, so it can be shared and reopened.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected) url.searchParams.set("open", selected); else url.searchParams.delete("open");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [selected]);

  // Later opens itself the first time it scrolls into view, with a pulse, so
  // a student learns what the fold is for (Chandu, 1 Oct 2026).
  useEffect(() => {
    const el = laterRef.current;
    if (!el || laterOpen) return;
    let seen = false;
    try { seen = window.sessionStorage.getItem(LATER_NUDGED) === "1"; } catch { /* no storage */ }
    if (seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || e.intersectionRatio < 0.6) return;
      io.disconnect();
      try { window.sessionStorage.setItem(LATER_NUDGED, "1"); } catch { /* no storage */ }
      setLaterPulse(true);
      setLaterOpen(true);
      window.setTimeout(() => setLaterPulse(false), 1400);
    }, { threshold: [0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, [laterOpen, tab]);

  const setStatus = (id: string, next: OpportunityStatus | null) => {
    const prev = record.status[id]?.status ?? null;
    setLast({ id, prev });
    setOpportunityStatus(id, next);
    // The first Save of a thing: say where it went.
    if (next === "saved" && prev === null) { const item = all.find((e) => e.item.id === id)?.item; setNudge({ name: item?.name ?? "Saved" }); }
  };
  useEffect(() => {
    if (!nudge) return;
    const t = window.setTimeout(() => setNudge(null), 6000);
    return () => window.clearTimeout(t);
  }, [nudge]);
  const toggleSave = (id: string) => setStatus(id, record.status[id] ? null : "saved");
  const undo = () => { if (last) { setOpportunityStatus(last.id, last.prev); setLast(null); } };
  const switchTab = (t: Tab) => { setTab(t); setLaterOpen(false); setSelected(null); setF((cur) => ({ ...cur, kinds: new Set(), amount: 0, cost: new Set() })); setSort("fit"); };

  // The one line under the title: what is open to this grade now, and when
  // the rest opens. Counted on the whole list, not the filtered one.
  const nowAll = all.filter((e) => e.fit.when === "now").length;
  const laterAll = all.filter((e) => e.fit.when === "later");
  const nextGrade = laterAll.length ? Math.min(...laterAll.map((e) => (e.item.grades.length ? Math.min(...e.item.grades.filter((g) => g > grade)) : 13))) : null;
  const laterWord = nextGrade === null ? "" : nextGrade === 12 ? "as a senior" : nextGrade === 13 ? "in college" : `in grade ${nextGrade}`;
  const line = `${nowAll} open to you now${laterAll.length ? `. ${laterAll.length} more ${laterWord}.` : "."}`;

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
  const grid = "grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";
  const card = (e: Enriched) => <li key={e.item.id} className="min-w-0"><Card e={e} on={e.item.id === selected} status={record.status[e.item.id]?.status ?? null} onOpen={() => setSelected(e.item.id)} onSave={() => toggleSave(e.item.id)} /></li>;
  const savedLink = `${savedHref()}&shelf=opportunities`;

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

        {student.grade === 12 && tab === "scholarships" && <Fafsa value={record.fafsa} />}

        {/* 2. Filters and Sort: one quiet row, docked into the nav pill while
           stuck (StickyBar sits directly in main, a tall parent). Phones scroll
           it sideways (both scrollbar rules, per the guardrails). */}
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
              <Dropdown quiet label="Sort" icon={<ArrowUpDown className="h-4 w-4" aria-hidden />} active={sort !== "fit"} value={SORTS[tab].find((s) => s.key === sort)!.label} panel={(close) => ({
                title: "Sort", description: "Best fit puts what you can apply to now first.", noun, count: n, width: 320,
                children: <Section title="Order" first>{SORTS[tab].map((s) => <Option key={s.key} radio on={sort === s.key} onToggle={() => { setSort(s.key); close(); }} label={s.label} />)}</Section>,
              })} />
            </div>
          </div>
        </StickyBar>
        {chips.length > 0 && (
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

        {/* 3. The reading layout while one is open: the list on the left, the
           detail as the page on the right (phones: the detail alone). */}
        {shown && (
          <div className="grid w-full gap-[22px] lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
            <ol className="hidden flex-col gap-[2px] lg:flex" aria-label={`${noun}s`}>
              {now.map((e) => <li key={e.item.id}><CardRow e={e} on={e.item.id === selected} status={record.status[e.item.id]?.status ?? null} onOpen={() => setSelected(e.item.id)} /></li>)}
              {later.length > 0 && <li className="px-[12px] pt-[14px] pb-[6px] text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={MUTED}>Later, {laterWord}</li>}
              {later.map((e) => <li key={e.item.id}><CardRow e={e} on={e.item.id === selected} status={record.status[e.item.id]?.status ?? null} onOpen={() => setSelected(e.item.id)} /></li>)}
            </ol>
            <article aria-label={shown.item.name} className="overflow-hidden rounded-[var(--radius-lg)] border lg:sticky lg:top-[117px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 94%, var(--foreground))" }}>
              <Expanded e={shown} status={record.status[shown.item.id]?.status ?? null} setStatus={(s) => setStatus(shown.item.id, s)} undo={last?.id === shown.item.id ? undo : undefined} onClose={close}
                onPrev={shownIndex > 0 ? () => step(-1) : undefined} onNext={shownIndex < visible.length - 1 ? () => step(1) : undefined} position={`${shownIndex + 1} of ${visible.length}`} />
            </article>
          </div>
        )}

        {/* 3. Cards; 4. Later, folded. */}
        <div className={shown ? "hidden" : "flex flex-col gap-[26px]"}>
          {n === 0 && <EmptyView tier={5} heading={`No ${noun}s match`} line="Try fewer filters." cta="Clear filters" onAction={() => setF(empty())} />}
          {now.length > 0 && <ul className={grid} aria-label={`${noun}s open to you now`}>{now.map(card)}</ul>}
          {later.length > 0 && (
            <section ref={laterRef} className="flex flex-col gap-[16px]">
              <motion.button type="button" aria-expanded={laterOpen} onClick={() => setLaterOpen((o) => !o)} animate={laterPulse ? { scale: [1, 1.012, 1] } : { scale: 1 }} transition={{ duration: 0.7, ease: "easeInOut" }}
                className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-lg)] border px-[20px] py-[16px] text-left transition-colors duration-500" style={{ borderColor: laterPulse ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--glass-border)", background: laterPulse ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-1))" : "var(--glass-surface-1)" }}>
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[16px] leading-[21px] font-bold">Later</span>
                  <span className="text-[13px] leading-[18px]" style={MUTED}>{later.length} {noun}{later.length === 1 ? "" : "s"} that open to you {laterWord}. Save them now and we keep the dates.</span>
                </span>
                <ChevronDown className="h-5 w-5 flex-none transition-transform duration-300" aria-hidden style={{ color: "var(--muted-foreground)", transform: laterOpen ? "rotate(180deg)" : "none" }} />
              </motion.button>
              <AnimatePresence initial={false}>
                {laterOpen && (
                  <motion.div key="later" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }} className="overflow-hidden">
                    <ul className={`${grid} pt-[2px]`} aria-label={`${noun}s for later`}>{later.map(card)}</ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}
        </div>
      </main>

      {/* The Save confirmation: where it went, and the way there. */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {nudge && (
            <motion.div key="nudge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }} role="status"
              className="marketing-v2 themeable fixed inset-x-0 bottom-[72px] z-[125] flex justify-center px-4 lg:bottom-[28px]" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
              <div className="flex max-w-full items-center gap-[10px] rounded-full border py-[8px] pr-[8px] pl-[14px] shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)" }}>
                <BookmarkCheck className="h-4 w-4 flex-none" aria-hidden style={{ color: SOFT }} />
                <span className="truncate text-[14px] leading-[18px] font-semibold">Saved to your Saved</span>
                <Link href={savedLink} className="dm-solid flex h-[32px] flex-none items-center gap-[2px] rounded-full px-[12px] text-[13px] font-bold text-white" style={{ background: ACCENT }}>View saved <ChevronRight className="h-4 w-4" aria-hidden /></Link>
                <button type="button" aria-label="Dismiss" onClick={() => setNudge(null)} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={MUTED}><X className="h-4 w-4" aria-hidden /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
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
