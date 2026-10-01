"use client";

// Opportunities (1 Oct 2026). The fifth destination: real scholarships,
// summer programs and internships that fit the student, kept with their
// dates. Decided in Joshua's thread (30 Sept) after SchooLinks' own
// walkthroughs (docs/reference/schoolinks-scholarships-and-applications-
// notes-2026-10.md): finding money and programs is neither exploring
// (Explore is "who am I") nor people (Connect), and Joshua lost the
// partner internships four taps into a Connect board. Named Opportunities,
// not Apply or Earn (Chandu: "apply reads like an action... anxiety
// inducing for a kid who hasn't decided anything"; "earn sounds too grown
// up, 8th grader comprehension level").
//
// Second pass, same day. Chandu: "VERY TEXT HEAVY... progressive
// disclosure is key, information overload is the number one priority...
// title > subtitle > body top down everywhere... use logos... lead the
// eye along the story." So the page tells one story, top to bottom:
// 1. The title and one line: how many are open to you now.
// 2. The filter bar (three dropdowns, More, Sort) and chips only when on.
// 3. Cards, like Explore Schools' and Home's: the provider's mark, the
//    money as the hero number (a program leads with its name), the name,
//    who gives it, when it closes, and at most one fit signal. Nothing else.
// 4. "Later" is folded shut: what opens to you in a later grade, one tap.
// 5. The detail is staged: mark, title, three facts, the actions, three
//    reasons; everything else (who it is for, what to bring, where it was
//    checked) is behind Details.
// Fit is reasons, not a percentage; nothing is applied for here.

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, ArrowUpRight, Bookmark, BookmarkCheck, CalendarClock, Check, ChevronDown, ClipboardCheck, SlidersHorizontal, Tag, Trophy, Undo2, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { EmptyView } from "@/components/app/states";
import { PANEL } from "@/components/career/CareerDetailExperience";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { Chips, Dropdown, Option, Section } from "@/components/colleges/filterKit";
import { COLLEGES } from "@/components/colleges/data";
import { shortDate } from "@/lib/localRecord";
import { opportunityStore, setFafsaStatus, setOpportunityStatus, type FafsaStatus, type OpportunityStatus } from "@/lib/opportunities";
import { FIELDS, PAID, PROGRAM_KIND, SCHOLARSHIP_KIND, type Field, type Item, type Paid, type ProgramKind, type ScholarshipKind } from "./types";
import { fitFor, gradeWord, stateName, timing, today, useStudent, worldToField, type Fit, type Timing } from "./match";
import { PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "./data";
import { OrgMark, hostOf } from "./OrgMark";

type Tab = "scholarships" | "programs";
type Closes = "any" | "month" | "3mo" | "later";
type AmountMin = 0 | 1000 | 5000 | 20000 | "full";
type Cost = "free" | "paid" | "tuition";
type SortKey = "fit" | "closing" | "amount" | "az";
type F = { closes: Closes; fields: Set<Field>; kinds: Set<string>; amount: AmountMin; cost: Set<Cost>; grade: number | null; savedOnly: boolean; school: string | null };

const CLOSES: { key: Closes; label: string }[] = [{ key: "any", label: "Any time" }, { key: "month", label: "This month" }, { key: "3mo", label: "Next 3 months" }, { key: "later", label: "Later" }];
const AMOUNTS: { key: AmountMin; label: string }[] = [{ key: 0, label: "Any" }, { key: 1000, label: "$1,000+" }, { key: 5000, label: "$5,000+" }, { key: 20000, label: "$20,000+" }, { key: "full", label: "Full ride" }];
const COSTS: { key: Cost; label: string }[] = [{ key: "free", label: "Free" }, { key: "paid", label: "Pays you" }, { key: "tuition", label: "Has tuition" }];
const SORTS: Record<Tab, { key: SortKey; label: string }[]> = {
  scholarships: [{ key: "fit", label: "Best fit" }, { key: "closing", label: "Closing soon" }, { key: "amount", label: "Biggest" }, { key: "az", label: "A to Z" }],
  programs: [{ key: "fit", label: "Best fit" }, { key: "closing", label: "Closing soon" }, { key: "az", label: "A to Z" }],
};
const STATUS_WORD: Record<OpportunityStatus, string> = { saved: "Saved", applied: "Applied", won: "Got it", passed: "Passed" };
const MUTED = { color: "var(--muted-foreground)" } as const;
const AMBER = "rgb(255,176,32)";
const GREEN = "rgb(52,199,140)";

const empty = (): F => ({ closes: "any", fields: new Set(), kinds: new Set(), amount: 0, cost: new Set(), grade: null, savedOnly: false, school: null });
const tog = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
const costOf = (p: Paid): Cost | null => (p === "free" ? "free" : p === "paid" || p === "stipend" ? "paid" : p === "tuition" ? "tuition" : null);
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
/** The hero number: short, or the max when the provider's wording is long. */
function amountShort(item: Item): string {
  if (item.type !== "scholarship") return "";
  if (/full/i.test(item.amount)) return "Full ride";
  if (item.amount.length <= 14) return item.amount;
  // "$25,000 (105 scholarships)" is $25,000; "$10,000 a year..." is a range.
  const single = item.amount.match(/^(\$\d[\d,]*\d)(?![\d,])(?!\s*(to|-|a |per|\+|each|and up))/);
  if (single) return single[1];
  return item.amountMax ? `Up to ${money(item.amountMax)}` : "Varies";
}
function checkedOn(v: string): string { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }
/** "Closes Mar 1" on a card; the detail splits it into a label and a value. */
function closesShort(t: Timing): string { return t.label.replace(/, in \d+ days?$/, ""); }

function useIsLg(): boolean {
  const [lg, setLg] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setLg(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return lg;
}

type Enriched = { item: Item; fit: Fit; time: Timing };

export function OpportunitiesExperience({ initialTab, initialField = "", initialSchool = "", initialSaved = false }: { initialTab: Tab; initialField?: string; initialSchool?: string; initialSaved?: boolean }) {
  const student = useStudent();
  const record = opportunityStore.useValue();
  const isLg = useIsLg();
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
  const [selected, setSelected] = useState<string | null>(null);
  const [laterOpen, setLaterOpen] = useState(false);
  const [last, setLast] = useState<{ id: string; prev: OpportunityStatus | null } | null>(null);

  const grade = f.grade ?? student.grade;
  const me = useMemo(() => ({ ...student, grade }), [student, grade]);
  const all = useMemo<Enriched[]>(() => (tab === "scholarships" ? SCHOLARSHIP_ITEMS : PROGRAM_ITEMS).map((item) => ({ item, fit: fitFor(item, me), time: timing(item, todayIso) })), [tab, me, todayIso]);
  const savedCount = useMemo(() => [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS].filter((i) => record.status[i.id]).length, [record]);

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
  const shownId = selected && visible.some((e) => e.item.id === selected) ? selected : isLg ? now[0]?.item.id ?? later[0]?.item.id ?? null : null;
  const shown = visible.find((e) => e.item.id === shownId) ?? null;
  const noun = tab === "scholarships" ? "scholarship" : "program";
  const n = visible.length;

  const setStatus = (id: string, next: OpportunityStatus | null) => {
    setLast({ id, prev: record.status[id]?.status ?? null });
    setOpportunityStatus(id, next);
  };
  const undo = () => { if (last) { setOpportunityStatus(last.id, last.prev); setLast(null); } };
  const switchTab = (t: Tab) => { setTab(t); setSelected(null); setLaterOpen(false); setF((cur) => ({ ...cur, kinds: new Set(), amount: 0, cost: new Set() })); setSort("fit"); };

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
  const moreCount = (f.amount !== 0 ? 1 : 0) + f.cost.size + (f.grade !== null && f.grade !== student.grade ? 1 : 0);

  const scholarshipCount = SCHOLARSHIP_ITEMS.filter((i) => fitFor(i, student).when !== "no").length;
  const programCount = PROGRAM_ITEMS.filter((i) => fitFor(i, student).when !== "no").length;

  const segment = (
    <div role="tablist" aria-label="Scholarships or programs" className="flex flex-none items-center gap-[3px] rounded-full border p-[3px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      {([["scholarships", "Scholarships", scholarshipCount], ["programs", "Programs", programCount]] as const).map(([key, label, count]) => {
        const on = tab === key;
        return (
          <button key={key} type="button" role="tab" aria-selected={on} onClick={() => switchTab(key)} className="dm-quiet flex h-[34px] cursor-pointer items-center gap-[7px] rounded-full px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap" style={on ? { background: ACCENT, color: "#fff" } : { color: "var(--foreground)" }}>
            {label}<span className="text-[12px] font-semibold tabular-nums" style={{ color: on ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)" }}>{count}</span>
          </button>
        );
      })}
    </div>
  );
  const savedButton = (
    <button type="button" aria-pressed={f.savedOnly} onClick={() => { set({ savedOnly: !f.savedOnly }); setSelected(null); }} className="dm-quiet flex h-[40px] flex-none cursor-pointer items-center gap-[7px] rounded-full border px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap" style={f.savedOnly ? { background: "color-mix(in srgb, var(--primary) 20%, var(--glass-surface-1))", borderColor: ACCENT, color: "var(--foreground)" } : { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: savedCount ? SOFT : "var(--muted-foreground)" }} />
      Saved{savedCount ? <span className="tabular-nums" style={{ color: SOFT }}>{savedCount}</span> : null}
    </button>
  );

  const detail = shown && <Detail e={shown} status={record.status[shown.item.id]?.status ?? null} setStatus={(s) => setStatus(shown.item.id, s)} undo={last?.id === shown.item.id ? undo : undefined} flat={!isLg} />;

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation active="Opportunities" />
      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[26px] px-5 pt-3 pb-[140px] sm:px-[var(--space-14)] md:pt-8">
        {/* 1. Title, the one line, the two lists. */}
        <div className="flex w-full flex-col gap-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[var(--space-6)]">
          <div className="flex min-w-0 flex-col gap-[8px]">
            <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Opportunities</h1>
            <p className="text-[17px] leading-[24px]" style={MUTED}>{line}</p>
          </div>
          <div className="flex items-center gap-[8px]">
            {segment}
            {savedButton}
          </div>
        </div>

        {student.grade === 12 && tab === "scholarships" && !f.savedOnly && <Fafsa value={record.fafsa} />}

        {/* 2. The filter bar: three dropdowns, More, Sort. Phones scroll it
           sideways (both scrollbar rules, per the cross-browser guardrails). */}
        <div className="dm-scroll relative z-20 -mx-5 flex items-center gap-[8px] overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          <Dropdown label="Closes" icon={<CalendarClock className="h-4 w-4" aria-hidden style={MUTED} />} active={f.closes !== "any"} value={f.closes !== "any" ? CLOSES.find((c) => c.key === f.closes)!.label : undefined} panel={() => ({
            title: "Closes", description: "How soon the deadline is.", noun, count: n, width: 360,
            onClear: f.closes !== "any" ? () => set({ closes: "any" }) : undefined,
            children: <Section title="Deadline" first><Chips options={CLOSES} value={f.closes} onChange={(v) => set({ closes: v })} label="Deadline" count={(v) => countWith({ closes: v })} /></Section>,
          })} />
          <Dropdown label="Type" icon={<Trophy className="h-4 w-4" aria-hidden style={MUTED} />} active={f.kinds.size > 0} value={f.kinds.size ? (f.kinds.size === 1 ? (tab === "scholarships" ? SCHOLARSHIP_KIND[[...f.kinds][0] as ScholarshipKind].label : PROGRAM_KIND[[...f.kinds][0] as ProgramKind].label) : `${f.kinds.size}`) : undefined} panel={() => ({
            title: "Type", description: tab === "scholarships" ? "What the money is based on." : "What you would be doing.", noun, count: n, width: 400,
            onClear: f.kinds.size ? () => set({ kinds: new Set() }) : undefined,
            children: tab === "scholarships"
              ? <Section title="Based on" first>{(Object.keys(SCHOLARSHIP_KIND) as ScholarshipKind[]).map((k) => <Option key={k} on={f.kinds.has(k)} onToggle={() => set({ kinds: tog(f.kinds, k) })} label={SCHOLARSHIP_KIND[k].label} note={SCHOLARSHIP_KIND[k].note} count={countWith({ kinds: new Set([k]) })} />)}</Section>
              : <Section title="Programs" first>{(Object.keys(PROGRAM_KIND) as ProgramKind[]).map((k) => <Option key={k} on={f.kinds.has(k)} onToggle={() => set({ kinds: tog(f.kinds, k) })} label={PROGRAM_KIND[k].label} note={PROGRAM_KIND[k].note} count={countWith({ kinds: new Set([k]) })} />)}</Section>,
          })} />
          <Dropdown label="Field" icon={<Tag className="h-4 w-4" aria-hidden style={MUTED} />} active={f.fields.size > 0} value={f.fields.size ? (f.fields.size === 1 ? [...f.fields][0] : `${f.fields.size}`) : undefined} panel={() => ({
            title: "Field", description: "Your Top 3 already counts in Best fit.", noun, count: n, width: 380,
            onClear: f.fields.size ? () => set({ fields: new Set() }) : undefined,
            children: <Section title="Fields" first>{FIELDS.map((x) => <Option key={x} on={f.fields.has(x)} onToggle={() => set({ fields: tog(f.fields, x) })} label={x} note={student.fields.includes(x) ? "In your Top 3" : undefined} count={countWith({ fields: new Set([x]) })} />)}</Section>,
          })} />
          <Dropdown label="More" icon={<SlidersHorizontal className="h-4 w-4" aria-hidden style={MUTED} />} active={moreCount > 0} value={moreCount ? `${moreCount}` : undefined} panel={() => ({
            title: "More", description: tab === "scholarships" ? "How much it pays." : "Cost, and who can apply.", noun, count: n, width: 380,
            onClear: moreCount ? () => set({ amount: 0, cost: new Set(), grade: null }) : undefined,
            children: tab === "scholarships"
              ? <Section title="Amount" first><Chips options={AMOUNTS} value={f.amount} onChange={(v) => set({ amount: v })} label="Amount" count={(v) => countWith({ amount: v })} /></Section>
              : (
                <>
                  <Section title="Cost" first><Chips options={COSTS} value={f.cost.size === 1 ? [...f.cost][0] : ("" as Cost)} onChange={(v) => set({ cost: f.cost.has(v) ? new Set() : new Set([v]) })} label="Cost" count={(v) => countWith({ cost: new Set([v]) })} /></Section>
                  <Section title="Grade" hint={`You: grade ${student.grade}`}><Chips options={[9, 10, 11, 12].map((g) => ({ key: g, label: `${g}` }))} value={grade} onChange={(v) => set({ grade: v === student.grade ? null : v })} label="Grade" /></Section>
                </>
              ),
          })} />
          <div className="ml-auto flex-none pr-5 sm:pr-0">
            <Dropdown label="Sort" icon={<ArrowUpDown className="h-4 w-4" aria-hidden style={MUTED} />} active={sort !== "fit"} value={SORTS[tab].find((s) => s.key === sort)!.label} panel={(close) => ({
              title: "Sort", description: "Best fit puts what you can apply to now first.", noun, count: n, width: 320,
              children: <Section title="Order" first>{SORTS[tab].map((s) => <Option key={s.key} radio on={sort === s.key} onToggle={() => { setSort(s.key); close(); }} label={s.label} />)}</Section>,
            })} />
          </div>
        </div>

        {(chips.length > 0 || f.savedOnly) && (
          <div className="-mt-[10px] flex flex-wrap items-center gap-[8px]">
            <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={MUTED}>{n} shown</span>
            {chips.map((c) => (
              <button key={c.key} type="button" onClick={c.off} className="dm-quiet flex h-[30px] cursor-pointer items-center gap-[5px] rounded-full border pr-[8px] pl-[11px] text-[13px] font-semibold" style={{ borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--foreground)" }}>
                {c.label} <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ))}
            <button type="button" onClick={() => { setF({ ...empty() }); setSelected(null); }} className="dm-link cursor-pointer px-[4px] text-[13px] font-bold" style={{ color: SOFT }}>Clear all</button>
          </div>
        )}

        {/* 3. Cards, and 4. Later, folded; the detail beside them on desktop. */}
        <div className="grid w-full gap-[22px] lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="flex flex-col gap-[26px]">
            {n === 0 && (
              <EmptyView tier={5} heading={f.savedOnly ? "Nothing saved yet" : `No ${noun}s match`} line={f.savedOnly ? "Tap the bookmark on anything you like." : "Try fewer filters."} cta={f.savedOnly ? "See everything" : "Clear filters"} onAction={() => { setF(empty()); setSelected(null); }} />
            )}
            {now.length > 0 && (
              <ul className="grid grid-cols-1 gap-[14px] sm:grid-cols-2" aria-label={f.savedOnly ? "Saved" : `${noun}s open to you now`}>
                {now.map((e) => <li key={e.item.id}><Card e={e} on={e.item.id === shownId} status={record.status[e.item.id]?.status ?? null} onOpen={() => setSelected(e.item.id)} onSave={() => setStatus(e.item.id, record.status[e.item.id] ? null : "saved")} /></li>)}
              </ul>
            )}
            {later.length > 0 && (
              <section className="flex flex-col gap-[14px]">
                <button type="button" aria-expanded={laterOpen} onClick={() => setLaterOpen((o) => !o)} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-lg)] border px-[20px] py-[16px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="flex min-w-0 flex-col gap-[2px]">
                    <span className="text-[16px] leading-[21px] font-bold">Later</span>
                    <span className="text-[13px] leading-[18px]" style={MUTED}>{later.length} {noun}{later.length === 1 ? "" : "s"} that open to you {laterWord}. Save them now and we keep the dates.</span>
                  </span>
                  <ChevronDown className="h-5 w-5 flex-none transition-transform" aria-hidden style={{ color: "var(--muted-foreground)", transform: laterOpen ? "rotate(180deg)" : "none" }} />
                </button>
                {laterOpen && (
                  <ul className="grid grid-cols-1 gap-[14px] sm:grid-cols-2" aria-label={`${noun}s for later`}>
                    {later.map((e) => <li key={e.item.id}><Card e={e} on={e.item.id === shownId} status={record.status[e.item.id]?.status ?? null} onOpen={() => setSelected(e.item.id)} onSave={() => setStatus(e.item.id, record.status[e.item.id] ? null : "saved")} /></li>)}
                  </ul>
                )}
              </section>
            )}
          </div>
          {isLg && detail && <div className="sticky top-[88px]">{detail}</div>}
        </div>
      </main>

      {/* 5. On phones and tablets the detail is a sheet. */}
      {!isLg && detail && selected && createPortal(
        <div className="marketing-v2 themeable" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
          <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="fixed inset-0 z-[115] cursor-default bg-[rgba(8,7,16,0.5)] backdrop-blur-[12px]" />
          <div role="dialog" aria-label={shown!.item.name} className="dm-scroll fixed inset-x-0 bottom-0 z-[116] max-h-[90dvh] overflow-y-auto rounded-t-[var(--radius-xl)] border pb-[env(safe-area-inset-bottom)]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)" }}>
            <div className="sticky top-0 z-[1] flex justify-end px-[12px] pt-[10px]" style={{ background: "inherit" }}>
              <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>
            </div>
            {detail}
          </div>
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

// ---- One card ------------------------------------------------------------------

function SaveDot({ on, name, onToggle, size = 36 }: { on: boolean; name: string; onToggle: () => void; size?: number }) {
  return (
    <IconTip label={on ? "Remove from saved" : "Save"}>
      <button type="button" aria-pressed={on} aria-label={on ? `Remove ${name} from saved` : `Save ${name}`} onClick={(e) => { e.stopPropagation(); onToggle(); }} className="dm-quiet flex cursor-pointer items-center justify-center rounded-full border" style={{ width: size, height: size, borderColor: on ? ACCENT : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 22%, transparent)" : "color-mix(in srgb, var(--background) 40%, transparent)", color: on ? SOFT : "var(--muted-foreground)" }}>
        {on ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
      </button>
    </IconTip>
  );
}

function CostChip({ paid }: { paid: Paid }) {
  if (paid === "unknown") return null;
  const good = paid === "free" || paid === "paid" || paid === "stipend";
  return <span className="flex h-[24px] items-center rounded-full px-[9px] text-[12px] font-bold" style={{ background: good ? "rgba(52,199,140,0.16)" : "rgba(255,255,255,0.08)", color: good ? GREEN : "var(--foreground)" }}>{PAID[paid]}</span>;
}

function Card({ e, on, status, onOpen, onSave }: { e: Enriched; on: boolean; status: OpportunityStatus | null; onOpen: () => void; onSave: () => void }) {
  const { item, fit, time } = e;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const partner = item.type === "program" && item.postedBy;
  const top3 = fit.reasons.find((r) => r.startsWith("Fits your Top 3"));
  // One signal on the right of the footer, never more: Top 3, a partner post,
  // or when it opens to you.
  const signal = fit.when === "later" ? (item.grades.length ? `Grade ${Math.min(...item.grades)}` : "College") : top3 ? "Fits your Top 3" : partner ? "Partner" : null;
  return (
    <HoverBeam strength={0.7}>
      <article aria-current={on ? "true" : undefined} className="dm-tap dm-glass-2 relative flex h-full flex-col gap-[18px] rounded-[var(--radius-lg)] border p-[20px] backdrop-blur-[24px] backdrop-saturate-[1.65]" style={{ borderColor: on ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-2))" : "var(--glass-surface-2)", opacity: fit.when === "later" ? 0.82 : 1 }}>
        <header className="flex items-start justify-between gap-[12px]">
          <OrgMark url={item.url} name={who} size={44} />
          <span className="flex items-center gap-[6px]">
            {status && status !== "saved" && <span className="flex h-[24px] items-center gap-[4px] rounded-full px-[9px] text-[12px] font-bold" style={{ background: status === "won" ? "rgba(52,199,140,0.16)" : "color-mix(in srgb, var(--primary) 18%, transparent)", color: status === "won" ? GREEN : SOFT }}>{status === "won" ? <Trophy className="h-3 w-3" aria-hidden /> : <ClipboardCheck className="h-3 w-3" aria-hidden />}{STATUS_WORD[status]}</span>}
            <SaveDot on={!!status} name={item.name} onToggle={onSave} />
          </span>
        </header>
        <button type="button" onClick={onOpen} aria-label={`Open ${item.name}`} className="dm-quiet -m-[6px] flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-[4px] rounded-[10px] p-[6px] text-left">
          {item.type === "scholarship" && <span className="text-[26px] leading-[30px] font-extrabold tracking-[-0.01em] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{amountShort(item)}</span>}
          <span className={`${item.type === "scholarship" ? "text-[15.5px] leading-[20px]" : "text-[18px] leading-[23px]"} line-clamp-2 font-bold`} style={{ textWrap: "balance" }}>{item.name}</span>
          <span className="line-clamp-1 text-[13px] leading-[18px]" style={MUTED}>{who}</span>
        </button>
        <footer className="flex flex-wrap items-center gap-x-[10px] gap-y-[6px] text-[12.5px] leading-[16px]">
          <span className="flex items-center gap-[8px] whitespace-nowrap">
            {item.type === "program" && <CostChip paid={item.paid} />}
            <span className="font-semibold" style={{ color: time.tone === "soon" ? AMBER : "var(--muted-foreground)" }}>{closesShort(time)}</span>
          </span>
          {signal && <span className="ml-auto flex flex-none items-center gap-[4px] font-semibold" style={{ color: fit.when === "later" ? "var(--muted-foreground)" : SOFT }}>{fit.when === "now" && top3 && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}{signal}</span>}
        </footer>
      </article>
    </HoverBeam>
  );
}

// ---- The detail -----------------------------------------------------------------

function Fact({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[4px]">
      <span className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={MUTED}>{label}</span>
      <span className="text-[16px] leading-[21px] font-bold" style={tone ? { color: tone } : undefined}>{value}</span>
    </div>
  );
}

function Detail({ e, status, setStatus, undo, flat = false }: { e: Enriched; status: OpportunityStatus | null; setStatus: (s: OpportunityStatus | null) => void; undo?: () => void; flat?: boolean }) {
  const { item, fit, time } = e;
  const [more, setMore] = useState(false);
  const host = hostOf(item.url);
  const kind = item.type === "scholarship" ? SCHOLARSHIP_KIND[item.kind].label : PROGRAM_KIND[item.kind].label;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const applied = status === "applied" || status === "won";
  const btn = "dm-quiet flex h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[11px] border px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap";
  const outline = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;
  const onTone = { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--foreground)" } as const;
  const closes = time.status === "unknown" ? "Not posted" : time.status === "closed" ? `Closed ${shortDate(time.iso!)}` : shortDate(time.iso!);
  const reasons = [...fit.reasons.map((r) => ({ r, ok: true })), ...fit.checks.map((r) => ({ r, ok: false }))].slice(0, 3);
  return (
    <article className={`flex flex-col gap-[22px] px-[22px] py-[22px] ${flat ? "" : "rounded-[18px] border"}`} style={flat ? undefined : PANEL}>
      <header className="flex flex-col gap-[14px]">
        <OrgMark url={item.url} name={who} size={56} />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={{ color: item.type === "program" && item.postedBy ? SOFT : "var(--muted-foreground)" }}>{item.type === "program" && item.postedBy ? `Posted by ${item.postedBy.org}` : kind}</span>
          <h2 className="text-[22px] leading-[27px] font-bold" style={{ textWrap: "balance" }}>{item.name}</h2>
          <p className="text-[14px] leading-[20px]" style={MUTED}>{who}{item.type === "program" ? ` · ${item.location}` : ""}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-[12px]">
        <Fact label={item.type === "scholarship" ? "Amount" : "Cost"} value={item.type === "scholarship" ? amountShort(item) : PAID[item.paid]} tone={item.type === "program" && costOf(item.paid) && costOf(item.paid) !== "tuition" ? GREEN : undefined} />
        <Fact label={time.approx ? "Usually closes" : "Closes"} value={closes} tone={time.tone === "soon" ? AMBER : undefined} />
        <Fact label="Who" value={gradeWord(item.grades)} />
      </div>

      <div className="flex flex-col gap-[8px]">
        <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid w-full text-white`} style={{ background: ACCENT, borderColor: ACCENT }}>
          Apply on {host} <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
        <div className="grid grid-cols-2 gap-[8px]">
          <button type="button" aria-pressed={!!status} onClick={() => setStatus(status ? null : "saved")} className={btn} style={status ? onTone : outline}>
            {status ? <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-4 w-4" aria-hidden />}{status ? "Saved" : "Save"}
          </button>
          <button type="button" aria-pressed={applied} onClick={() => setStatus(applied ? "saved" : "applied")} className={btn} style={applied ? onTone : outline}>
            <ClipboardCheck className="h-4 w-4" aria-hidden style={applied ? { color: SOFT } : undefined} />{status === "won" ? "Got it" : applied ? "Applied" : "I applied"}
          </button>
        </div>
      </div>
      {(status === "applied" || undo) && (
        <p className="-mt-[10px] flex flex-wrap items-center gap-x-[10px] text-[13px] leading-[18px]" style={MUTED}>
          {status === "applied" && <>Heard back? <button type="button" onClick={() => setStatus("won")} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>I got it</button></>}
          {undo && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
        </p>
      )}

      {reasons.length > 0 && (
        <section className="flex flex-col gap-[8px] border-t pt-[18px]" style={{ borderColor: "var(--glass-border)" }}>
          <h3 className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={MUTED}>Fits you</h3>
          <ul className="flex flex-col gap-[6px]">
            {reasons.map(({ r, ok }) => <li key={r} className="flex items-start gap-[8px] text-[14px] leading-[20px]">{ok ? <Check className="mt-[3px] h-3.5 w-3.5 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} /> : <span aria-hidden className="mt-[7px] size-[6px] flex-none rounded-full" style={{ background: AMBER }} />}{r}</li>)}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-[14px] border-t pt-[14px]" style={{ borderColor: "var(--glass-border)" }}>
        <button type="button" aria-expanded={more} onClick={() => setMore((m) => !m)} className="dm-quiet -mx-[6px] flex cursor-pointer items-center justify-between rounded-[8px] px-[6px] py-[4px] text-left">
          <span className="text-[14px] leading-[20px] font-bold">Details</span>
          <ChevronDown className="h-4 w-4 transition-transform" aria-hidden style={{ color: "var(--muted-foreground)", transform: more ? "rotate(180deg)" : "none" }} />
        </button>
        {more && (
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <h3 className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={MUTED}>Who it is for</h3>
              <p className="text-[14px] leading-[20px]">{item.eligibility}</p>
              {item.type === "scholarship" && item.amount !== amountShort(item) && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.amount}</p>}
              {item.type === "program" && item.costNote && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.costNote}</p>}
              {item.type === "program" && item.when && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.when}</p>}
              {!item.states.includes("Any") && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.states.includes("Remote") ? "Online, from anywhere." : `${item.states.map(stateName).join(", ")} only.`}</p>}
            </div>
            {item.requires.length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <h3 className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={MUTED}>Bring</h3>
                <ul className="flex flex-wrap gap-[6px]">
                  {item.requires.map((r) => <li key={r} className="flex min-h-[28px] items-center rounded-full border px-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>{r}</li>)}
                </ul>
              </div>
            )}
            {time.approx && item.deadlineNote && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.deadlineNote}</p>}
            <p className="text-[12.5px] leading-[17px]" style={MUTED}>
              Checked on {host}, {checkedOn(item.verifiedOn)}.{item.type === "scholarship" ? " A real scholarship never asks for a credit card." : ""}{item.type === "program" && item.postedBy ? " Posted by a Dreamari partner; details not checked by Dreamari." : ""}
            </p>
          </div>
        )}
      </section>
    </article>
  );
}
