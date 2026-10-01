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
// Page, top to bottom:
// 1. Title, one line, and Scholarships | Programs with counts; Saved.
// 2. One line for the season (what is open now for this grade).
// 3. The filter bar, the same dropdown anatomy as Explore Schools.
// 4. The list (left) and the detail (right, or a sheet on phones).
// What SchooLinks does that this does not: no questionnaire first (fit
// comes from the profile), no percentage ring (reasons instead), nothing
// is applied for here (Apply always goes to the provider, labelled).

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowUpDown, ArrowUpRight, Bookmark, BookmarkCheck, CalendarClock, Check, ClipboardCheck, GraduationCap, HandCoins, Megaphone, Tag, Trophy, Undo2, Wallet, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
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

type Tab = "scholarships" | "programs";
type Closes = "any" | "month" | "3mo" | "later";
type AmountMin = 0 | 1000 | 5000 | 20000 | "full";
type Cost = "free" | "paid" | "tuition";
type SortKey = "fit" | "closing" | "amount" | "az";
type F = { closes: Closes; fields: Set<Field>; kinds: Set<string>; amount: AmountMin; cost: Set<Cost>; grade: number | null; savedOnly: boolean; school: string | null };

const CLOSES: { key: Closes; label: string }[] = [{ key: "any", label: "Any time" }, { key: "month", label: "This month" }, { key: "3mo", label: "Next 3 months" }, { key: "later", label: "Later" }];
const AMOUNTS: { key: AmountMin; label: string }[] = [{ key: 0, label: "Any amount" }, { key: 1000, label: "$1,000 and up" }, { key: 5000, label: "$5,000 and up" }, { key: 20000, label: "$20,000 and up" }, { key: "full", label: "Full ride" }];
const COSTS: { key: Cost; label: string; note: string }[] = [{ key: "free", label: "Free", note: "No cost to you" }, { key: "paid", label: "Pays you", note: "A stipend or wages" }, { key: "tuition", label: "Has tuition", note: "Costs money, often with aid" }];
const SORTS: Record<Tab, { key: SortKey; label: string; note?: string }[]> = {
  scholarships: [{ key: "fit", label: "Best fit for you" }, { key: "closing", label: "Closing soonest" }, { key: "amount", label: "Biggest amount" }, { key: "az", label: "A to Z" }],
  programs: [{ key: "fit", label: "Best fit for you" }, { key: "closing", label: "Closing soonest" }, { key: "az", label: "A to Z" }],
};
const STATUS_WORD: Record<OpportunityStatus, string> = { saved: "Saved", applied: "Applied", won: "You got it", passed: "Passed" };
const MUTED = { color: "var(--muted-foreground)" } as const;
const AMBER = "rgb(255,176,32)";

const empty = (): F => ({ closes: "any", fields: new Set(), kinds: new Set(), amount: 0, cost: new Set(), grade: null, savedOnly: false, school: null });
const tog = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
const costOf = (p: Paid): Cost | null => (p === "free" ? "free" : p === "paid" || p === "stipend" ? "paid" : p === "tuition" ? "tuition" : null);
const domain = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
/** The amount as the row shows it: short, or the max when the wording is long. */
function amountShort(item: Item): string {
  if (item.type !== "scholarship") return item.paid === "unknown" ? "" : PAID[item.paid];
  if (/full/i.test(item.amount)) return "Full ride";
  if (item.amount.length <= 14) return item.amount;
  return item.amountMax ? `Up to ${money(item.amountMax)}` : "See details";
}
function checkedOn(v: string): string { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }

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
    const whenRank = { now: 0, later: 1, no: 2 } as const;
    const dayRank = (t: Timing) => (t.status === "open" && t.days !== null ? t.days : t.status === "unknown" ? 9000 : 99999);
    rows.sort((a, b) => {
      if (sort === "az") return a.item.name.localeCompare(b.item.name);
      if (sort === "closing") return dayRank(a.time) - dayRank(b.time) || b.fit.score - a.fit.score;
      if (sort === "amount") { const am = (e: Enriched) => (e.item.type === "scholarship" ? (/full/i.test(e.item.amount) ? 1e9 : e.item.amountMax ?? -1) : -1); return am(b) - am(a) || dayRank(a.time) - dayRank(b.time); }
      return whenRank[a.fit.when] - whenRank[b.fit.when] || b.fit.score - a.fit.score || dayRank(a.time) - dayRank(b.time);
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- passes reads f and record, both listed
  }, [all, f, sort, record]);

  const shownId = selected && visible.some((e) => e.item.id === selected) ? selected : isLg ? visible[0]?.item.id ?? null : null;
  const shown = visible.find((e) => e.item.id === shownId) ?? null;
  const noun = tab === "scholarships" ? "scholarship" : "program";
  const n = visible.length;
  const nowCount = visible.filter((e) => e.fit.when === "now").length;

  const setStatus = (id: string, next: OpportunityStatus | null) => {
    setLast({ id, prev: record.status[id]?.status ?? null });
    setOpportunityStatus(id, next);
  };
  const undo = () => { if (last) { setOpportunityStatus(last.id, last.prev); setLast(null); } };

  const switchTab = (t: Tab) => { setTab(t); setSelected(null); setF((cur) => ({ ...cur, kinds: new Set(), amount: 0, cost: new Set() })); setSort("fit"); };

  // Chips for what is on, each removable.
  const chips: { key: string; label: string; off: () => void }[] = [];
  if (f.school && school) chips.push({ key: "school", label: `Usable at ${school.name}`, off: () => set({ school: null }) });
  if (f.closes !== "any") chips.push({ key: "closes", label: CLOSES.find((c) => c.key === f.closes)!.label, off: () => set({ closes: "any" }) });
  f.fields.forEach((x) => chips.push({ key: `field-${x}`, label: x, off: () => set({ fields: tog(f.fields, x) }) }));
  f.kinds.forEach((k) => chips.push({ key: `kind-${k}`, label: tab === "scholarships" ? SCHOLARSHIP_KIND[k as ScholarshipKind]?.label ?? k : PROGRAM_KIND[k as ProgramKind]?.label ?? k, off: () => set({ kinds: tog(f.kinds, k) }) }));
  if (f.amount !== 0) chips.push({ key: "amount", label: AMOUNTS.find((a) => a.key === f.amount)!.label, off: () => set({ amount: 0 }) });
  f.cost.forEach((c) => chips.push({ key: `cost-${c}`, label: COSTS.find((x) => x.key === c)!.label, off: () => set({ cost: tog(f.cost, c) }) }));
  if (f.grade !== null && f.grade !== student.grade) chips.push({ key: "grade", label: `Grade ${f.grade}`, off: () => set({ grade: null }) });

  const sortLabel = SORTS[tab].find((s) => s.key === sort)!.label;
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

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation active="Opportunities" />
      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-5 pt-3 pb-[140px] sm:px-[var(--space-14)] md:pt-8">
        {/* Title row: title and the one line; Scholarships | Programs and Saved. */}
        <div className="flex w-full flex-col gap-[14px] lg:flex-row lg:items-end lg:justify-between lg:gap-[var(--space-6)]">
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Opportunities</h1>
            <p className="text-[15px] leading-[21px]" style={MUTED}>Real scholarships and programs that fit you. Save the ones you like and we keep the dates.</p>
          </div>
          <div className="flex items-center gap-[8px]">
            {segment}
            {savedButton}
          </div>
        </div>

        <SeasonLine grade={student.grade} todayIso={todayIso} tab={tab} fafsa={record.fafsa} />

        {/* The filter bar: the same dropdown anatomy as Explore Schools. */}
        {/* Phones: one row that scrolls sideways (both scrollbar rules, per the
           cross-browser guardrails); lg: wraps like Explore Schools. */}
        <div className="dm-scroll relative z-20 -mx-5 flex items-center gap-[8px] overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          <Dropdown label="Closes" icon={<CalendarClock className="h-4 w-4" aria-hidden style={MUTED} />} active={f.closes !== "any"} value={f.closes !== "any" ? CLOSES.find((c) => c.key === f.closes)!.label : undefined} panel={() => ({
            title: "When it closes", description: "Pick how soon the deadline is.", noun, count: n, width: 360,
            onClear: f.closes !== "any" ? () => set({ closes: "any" }) : undefined,
            children: <Section title="Deadline" first><Chips options={CLOSES} value={f.closes} onChange={(v) => set({ closes: v })} label="Deadline" count={(v) => countWith({ closes: v })} /></Section>,
          })} />
          <Dropdown label="Field" icon={<Tag className="h-4 w-4" aria-hidden style={MUTED} />} active={f.fields.size > 0} value={f.fields.size ? (f.fields.size === 1 ? [...f.fields][0] : `${f.fields.size}`) : undefined} panel={() => ({
            title: "Career field", description: "Tied to what you want to do. Your Top 3 is already counted in Best fit.", noun, count: n, width: 380,
            onClear: f.fields.size ? () => set({ fields: new Set() }) : undefined,
            children: (
              <Section title="Fields" hint={student.fields.length ? `Your Top 3: ${student.fields.join(", ")}` : undefined} first>
                {FIELDS.map((x) => <Option key={x} on={f.fields.has(x)} onToggle={() => set({ fields: tog(f.fields, x) })} label={x} note={student.fields.includes(x) ? "In your Top 3" : undefined} count={countWith({ fields: new Set([x]) })} />)}
              </Section>
            ),
          })} />
          {tab === "scholarships" ? (
            <>
              <Dropdown label="Amount" icon={<HandCoins className="h-4 w-4" aria-hidden style={MUTED} />} active={f.amount !== 0} value={f.amount !== 0 ? AMOUNTS.find((a) => a.key === f.amount)!.label : undefined} panel={() => ({
                title: "How much", description: "The most it pays, in total.", noun, count: n, width: 380,
                onClear: f.amount !== 0 ? () => set({ amount: 0 }) : undefined,
                children: <Section title="Amount" first><Chips options={AMOUNTS} value={f.amount} onChange={(v) => set({ amount: v })} label="Amount" count={(v) => countWith({ amount: v })} /></Section>,
              })} />
              <Dropdown label="Type" icon={<Trophy className="h-4 w-4" aria-hidden style={MUTED} />} active={f.kinds.size > 0} value={f.kinds.size ? (f.kinds.size === 1 ? SCHOLARSHIP_KIND[[...f.kinds][0] as ScholarshipKind].label : `${f.kinds.size}`) : undefined} panel={() => ({
                title: "Type of scholarship", description: "What it is based on.", noun, count: n, width: 400,
                onClear: f.kinds.size ? () => set({ kinds: new Set() }) : undefined,
                children: <Section title="Based on" first>{(Object.keys(SCHOLARSHIP_KIND) as ScholarshipKind[]).map((k) => <Option key={k} on={f.kinds.has(k)} onToggle={() => set({ kinds: tog(f.kinds, k) })} label={SCHOLARSHIP_KIND[k].label} note={SCHOLARSHIP_KIND[k].note} count={countWith({ kinds: new Set([k]) })} />)}</Section>,
              })} />
            </>
          ) : (
            <>
              <Dropdown label="Type" icon={<Megaphone className="h-4 w-4" aria-hidden style={MUTED} />} active={f.kinds.size > 0} value={f.kinds.size ? (f.kinds.size === 1 ? PROGRAM_KIND[[...f.kinds][0] as ProgramKind].label : `${f.kinds.size}`) : undefined} panel={() => ({
                title: "Type of program", description: "What you would be doing.", noun, count: n, width: 400,
                onClear: f.kinds.size ? () => set({ kinds: new Set() }) : undefined,
                children: <Section title="Programs" first>{(Object.keys(PROGRAM_KIND) as ProgramKind[]).map((k) => <Option key={k} on={f.kinds.has(k)} onToggle={() => set({ kinds: tog(f.kinds, k) })} label={PROGRAM_KIND[k].label} note={PROGRAM_KIND[k].note} count={countWith({ kinds: new Set([k]) })} />)}</Section>,
              })} />
              <Dropdown label="Cost" icon={<Wallet className="h-4 w-4" aria-hidden style={MUTED} />} active={f.cost.size > 0} value={f.cost.size ? (f.cost.size === 1 ? COSTS.find((c) => c.key === [...f.cost][0])!.label : `${f.cost.size}`) : undefined} panel={() => ({
                title: "Cost", description: "Free, pays you, or has tuition.", noun, count: n, width: 360,
                onClear: f.cost.size ? () => set({ cost: new Set() }) : undefined,
                children: <Section title="Cost" first>{COSTS.map((c) => <Option key={c.key} on={f.cost.has(c.key)} onToggle={() => set({ cost: tog(f.cost, c.key) })} label={c.label} note={c.note} count={countWith({ cost: new Set([c.key]) })} />)}</Section>,
              })} />
              <Dropdown label="Grade" icon={<GraduationCap className="h-4 w-4" aria-hidden style={MUTED} />} active={f.grade !== null && f.grade !== student.grade} value={f.grade !== null && f.grade !== student.grade ? `Grade ${f.grade}` : undefined} panel={() => ({
                title: "Who can apply", description: `Showing what grade ${grade} can apply to. Change it to plan ahead.`, noun, count: n, width: 360,
                onClear: f.grade !== null ? () => set({ grade: null }) : undefined,
                children: <Section title="Grade" first><Chips options={[9, 10, 11, 12].map((g) => ({ key: g, label: g === student.grade ? `Grade ${g}, you` : `Grade ${g}` }))} value={grade} onChange={(v) => set({ grade: v === student.grade ? null : v })} label="Grade" /></Section>,
              })} />
            </>
          )}
          <div className="ml-auto flex-none pr-5 sm:pr-0">
            <Dropdown label="Sort" icon={<ArrowUpDown className="h-4 w-4" aria-hidden style={MUTED} />} active={sort !== "fit"} value={sortLabel} panel={(close) => ({
              title: "Sort by", description: "Best fit puts what you can apply to now first.", noun, count: n, width: 340,
              children: <Section title="Order" first>{SORTS[tab].map((s) => <Option key={s.key} radio on={sort === s.key} onToggle={() => { setSort(s.key); close(); }} label={s.label} note={s.note} />)}</Section>,
            })} />
          </div>
        </div>

        {/* The count, the chips for what is on, Clear all. */}
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="text-[14px] leading-[20px] font-semibold tabular-nums">{f.savedOnly ? `${n} saved` : `${n} ${noun}${n === 1 ? "" : "s"}`}{!f.savedOnly && n > 0 ? <span className="font-normal" style={MUTED}>{nowCount === n ? ` grade ${grade} in ${stateName(me.state)} can apply to now` : nowCount === 0 ? ` for later; none open to grade ${grade} yet` : `, ${nowCount} open to grade ${grade} now and ${n - nowCount} for later`}</span> : null}</span>
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={c.off} className="dm-quiet flex h-[30px] cursor-pointer items-center gap-[5px] rounded-full border pr-[8px] pl-[11px] text-[13px] font-semibold" style={{ borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--foreground)" }}>
              {c.label} <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
          {(chips.length > 0 || f.savedOnly) && <button type="button" onClick={() => { setF({ ...empty() }); setSelected(null); }} className="dm-link cursor-pointer px-[4px] text-[13px] font-bold" style={{ color: SOFT }}>Clear all</button>}
        </div>

        {/* List and detail. */}
        <div className="grid w-full gap-[18px] lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
          <ol className="flex flex-col gap-[8px]" aria-label={`${noun}s`}>
            {visible.length === 0 && (
              <li>
                <EmptyView tier={5} heading={f.savedOnly ? "Nothing saved yet" : `No ${noun}s match`} line={f.savedOnly ? "Tap the bookmark on anything you like and it lands here with its date." : "Try fewer filters, or another grade to plan ahead."} cta={f.savedOnly ? "See everything" : "Clear filters"} onAction={() => { setF(empty()); setSelected(null); }} />
              </li>
            )}
            {visible.map((e) => (
              <li key={e.item.id}>
                <RowCard e={e} on={e.item.id === shownId} status={record.status[e.item.id]?.status ?? null} onOpen={() => setSelected(e.item.id)} onSave={() => setStatus(e.item.id, record.status[e.item.id] ? null : "saved")} />
              </li>
            ))}
          </ol>
          {isLg && shown && (
            <div className="sticky top-[88px]">
              <Detail e={shown} status={record.status[shown.item.id]?.status ?? null} setStatus={(s) => setStatus(shown.item.id, s)} undo={last?.id === shown.item.id ? undo : undefined} />
            </div>
          )}
        </div>
      </main>

      {!isLg && shown && selected && createPortal(
        <div className="marketing-v2 themeable" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
          <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="fixed inset-0 z-[115] cursor-default bg-[rgba(8,7,16,0.5)] backdrop-blur-[12px]" />
          <div role="dialog" aria-label={shown.item.name} className="dm-scroll fixed inset-x-0 bottom-0 z-[116] max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-xl)] border pb-[env(safe-area-inset-bottom)]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)" }}>
            <div className="sticky top-0 z-[1] flex justify-end px-[12px] pt-[10px]" style={{ background: "inherit" }}>
              <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <Detail e={shown} status={record.status[shown.item.id]?.status ?? null} setStatus={(s) => setStatus(shown.item.id, s)} undo={last?.id === shown.item.id ? undo : undefined} flat />
          </div>
        </div>,
        document.body,
      )}

      <MobileNav active="Opportunities" />
    </div>
  );
}

// ---- The season line ---------------------------------------------------------

/** One sentence on what is open now for this grade, and the FAFSA status
 *  for seniors (the counselor's Financial Aid screen reads the same three
 *  states). Copy at an 8th-grade level, no dates it cannot keep. */
function SeasonLine({ grade, todayIso, tab, fafsa }: { grade: number; todayIso: string; tab: Tab; fafsa: FafsaStatus }) {
  const month = parseInt(todayIso.slice(5, 7), 10);
  const fall = month >= 8 && month <= 11;
  const winter = month === 12 || month <= 2;
  let line: string;
  if (grade === 12) line = tab === "scholarships" ? "FAFSA opened October 1. Most money comes from the schools you apply to, so check their aid pages too. The scholarships below are extra." : "Senior year programs are few. Save the ones below that still take seniors; the big push this year is your college list.";
  else if (grade === 11) line = tab === "scholarships" ? "Juniors can already apply to some scholarships. Save what fits; the rest open to you as a senior." : fall ? "Most summer programs open in November and December and close by February. Save what you like now and we keep the dates." : winter ? "Summer program deadlines are here. Most close between January and March." : "Summer program deadlines have mostly passed. Save next year's now.";
  else line = tab === "scholarships" ? "A few scholarships take younger students. Most open to you in grade 11, and we will show them when they do." : "Summer programs for your grade open in the winter. Save what you like and we will keep the dates for you.";
  return (
    <div className="flex flex-col gap-[10px] rounded-[14px] border px-[16px] py-[12px] sm:flex-row sm:items-center sm:justify-between" style={{ background: "color-mix(in srgb, var(--primary) 9%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)" }}>
      <p className="text-[14px] leading-[20px]"><span className="font-bold">This season. </span>{line}</p>
      {grade === 12 && tab === "scholarships" && (
        <div role="radiogroup" aria-label="FAFSA status" className="flex flex-none items-center gap-[4px] rounded-full border p-[3px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
          <span className="pl-[10px] pr-[4px] text-[12px] font-bold tracking-[0.04em] uppercase" style={MUTED}>FAFSA</span>
          {([["not-started", "Not started"], ["in-progress", "Started"], ["submitted", "Submitted"]] as const).map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={fafsa === k} onClick={() => setFafsaStatus(k)} className="dm-quiet h-[28px] cursor-pointer rounded-full px-[10px] text-[12.5px] font-semibold whitespace-nowrap" style={fafsa === k ? { background: ACCENT, color: "#fff" } : { color: "var(--foreground)" }}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- One row ------------------------------------------------------------------

function StatusPill({ status }: { status: OpportunityStatus }) {
  const good = status === "won";
  return <span className="flex h-[22px] items-center gap-[4px] rounded-full px-[8px] text-[11.5px] font-bold" style={{ background: good ? "rgba(52,199,140,0.18)" : "color-mix(in srgb, var(--primary) 18%, transparent)", color: good ? "rgb(52,199,140)" : SOFT }}>{status === "applied" ? <ClipboardCheck className="h-3 w-3" aria-hidden /> : good ? <Trophy className="h-3 w-3" aria-hidden /> : <BookmarkCheck className="h-3 w-3" aria-hidden />}{STATUS_WORD[status]}</span>;
}

function RowCard({ e, on, status, onOpen, onSave }: { e: Enriched; on: boolean; status: OpportunityStatus | null; onOpen: () => void; onSave: () => void }) {
  const { item, fit, time } = e;
  const eyebrow = item.type === "program" && item.postedBy ? `Posted by ${item.postedBy.org}` : fit.when === "later" ? "For later" : item.type === "scholarship" ? SCHOLARSHIP_KIND[item.kind].label : PROGRAM_KIND[item.kind].label;
  const sub = item.type === "scholarship" ? item.provider : `${item.org} · ${item.location}`;
  return (
    <div className="relative flex items-stretch gap-[10px] rounded-[14px] border transition-colors" aria-current={on ? "true" : undefined} style={{ borderColor: on ? "color-mix(in srgb, var(--primary) 55%, transparent)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-1))" : "var(--glass-surface-1)", opacity: fit.when === "later" ? 0.78 : 1 }}>
      <button type="button" onClick={onOpen} className="dm-quiet flex min-w-0 flex-1 cursor-pointer flex-col gap-[8px] rounded-[14px] px-[16px] py-[14px] text-left sm:flex-row sm:items-start sm:gap-[14px]">
        <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <span className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={{ color: item.type === "program" && item.postedBy ? SOFT : "var(--muted-foreground)" }}>{eyebrow}</span>
          <span className="text-[16px] leading-[21px] font-bold">{item.name}</span>
          <span className="text-[13px] leading-[18px]" style={MUTED}>{sub}</span>
          {(fit.reasons.length > 0 || fit.checks.length > 0) && (
            <span className="mt-[2px] flex flex-wrap gap-x-[12px] gap-y-[3px]">
              {fit.reasons.slice(0, 3).map((r) => <span key={r} className="flex items-center gap-[4px] text-[12.5px] leading-[16px]" style={{ color: SOFT }}><Check className="h-3 w-3" strokeWidth={3} aria-hidden />{r}</span>)}
              {fit.reasons.length === 0 && fit.checks.slice(0, 1).map((r) => <span key={r} className="text-[12.5px] leading-[16px]" style={{ color: AMBER }}>{r}</span>)}
            </span>
          )}
        </span>
        <span className="flex flex-none flex-row flex-wrap items-center gap-x-[10px] gap-y-[4px] sm:flex-col sm:items-end sm:gap-[5px] sm:pt-[18px] sm:text-right">
          {amountShort(item) && <span className="text-[16px] leading-[20px] font-extrabold tabular-nums">{amountShort(item)}</span>}
          <span className="text-[12.5px] leading-[16px] font-semibold" style={{ color: time.tone === "soon" ? AMBER : "var(--muted-foreground)" }}>{time.label}</span>
          {status && <StatusPill status={status} />}
        </span>
      </button>
      <div className="flex flex-none items-start pt-[12px] pr-[12px]">
        <IconTip label={status ? "Remove from saved" : "Save"}>
          <button type="button" aria-pressed={!!status} aria-label={status ? `Remove ${item.name} from saved` : `Save ${item.name}`} onClick={onSave} className="dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: status ? ACCENT : "var(--glass-border)", background: status ? "color-mix(in srgb, var(--primary) 20%, transparent)" : "transparent", color: status ? SOFT : "var(--muted-foreground)" }}>
            {status ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
          </button>
        </IconTip>
      </div>
    </div>
  );
}

// ---- The detail -----------------------------------------------------------------

function Fact({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[3px]">
      <span className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={MUTED}>{label}</span>
      <span className="text-[15px] leading-[20px] font-bold" style={tone ? { color: tone } : undefined}>{value}</span>
    </div>
  );
}

function Detail({ e, status, setStatus, undo, flat = false }: { e: Enriched; status: OpportunityStatus | null; setStatus: (s: OpportunityStatus | null) => void; undo?: () => void; flat?: boolean }) {
  const { item, fit, time } = e;
  const host = domain(item.url);
  const kindLabel = item.type === "scholarship" ? SCHOLARSHIP_KIND[item.kind].label : PROGRAM_KIND[item.kind].label;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const applied = status === "applied" || status === "won";
  const btn = "dm-quiet flex h-[40px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap";
  const outline = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;
  const onTone = { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--foreground)" } as const;
  return (
    <article className={`flex flex-col gap-[18px] px-[20px] py-[20px] ${flat ? "" : "rounded-[18px] border"}`} style={flat ? undefined : PANEL}>
      <header className="flex flex-col gap-[6px]">
        <span className="text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={{ color: item.type === "program" && item.postedBy ? SOFT : "var(--muted-foreground)" }}>
          {item.type === "program" && item.postedBy ? `Posted by ${item.postedBy.org} on Connect · ${kindLabel}` : kindLabel}
        </span>
        <h2 className="text-[21px] leading-[27px] font-bold" style={{ textWrap: "balance" }}>{item.name}</h2>
        <p className="text-[14px] leading-[20px]" style={MUTED}>{who}{item.type === "program" ? ` · ${item.location}${item.when ? ` · ${item.when}` : ""}` : item.renewable ? " · Renews each year" : ""}</p>
      </header>

      <div className="flex flex-wrap items-center gap-[8px]">
        <button type="button" aria-pressed={!!status} onClick={() => setStatus(status ? null : "saved")} className={btn} style={status ? onTone : outline}>
          {status ? <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-4 w-4" aria-hidden />}{status ? "Saved" : "Save"}
        </button>
        <button type="button" aria-pressed={applied} onClick={() => setStatus(applied ? "saved" : "applied")} className={btn} style={applied ? onTone : outline}>
          <ClipboardCheck className="h-4 w-4" aria-hidden style={applied ? { color: SOFT } : undefined} />{status === "won" ? "You got it" : applied ? "Applied" : "I applied"}
        </button>
        <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid ml-auto w-full text-white sm:w-auto`} style={{ background: ACCENT, borderColor: ACCENT }}>
          Apply on {host} <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>

      {(status || undo) && (
        <p className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px] text-[13px] leading-[18px]" style={MUTED}>
          {status === "saved" && "Saved. It is in your list with its date."}
          {status === "applied" && <>Applied. When you hear back: <button type="button" onClick={() => setStatus("won")} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>I got it</button></>}
          {status === "won" && "You got it. Nice work."}
          {undo && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
        </p>
      )}

      <div className="grid grid-cols-3 gap-[12px] border-t pt-[16px]" style={{ borderColor: "var(--glass-border)" }}>
        <Fact label={item.type === "scholarship" ? "Amount" : "Cost"} value={item.type === "scholarship" ? amountShort(item) : PAID[item.paid]} />
        <Fact label="Closes" value={time.label.replace(/^(Usually closes|Closes|Closed) /, "")} tone={time.tone === "soon" ? AMBER : undefined} />
        <Fact label="Who can apply" value={gradeWord(item.grades)} />
      </div>
      {(item.type === "scholarship" ? item.amount !== amountShort(item) : !!item.costNote) && <p className="-mt-[8px] text-[13px] leading-[18px]" style={MUTED}>{item.type === "scholarship" ? item.amount : item.costNote}</p>}
      {time.approx && <p className="-mt-[8px] text-[12.5px] leading-[17px]" style={MUTED}>{"Last year's date. The provider has not posted this year's yet, so check the page before you plan around it."}</p>}

      {(fit.reasons.length > 0 || fit.checks.length > 0) && (
        <section className="flex flex-col gap-[8px]">
          <h3 className="text-[12px] leading-[16px] font-bold tracking-[0.07em] uppercase" style={MUTED}>Why it fits you</h3>
          <ul className="flex flex-col gap-[5px]">
            {fit.reasons.map((r) => <li key={r} className="flex items-start gap-[8px] text-[14px] leading-[20px]"><Check className="mt-[3px] h-3.5 w-3.5 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} />{r}</li>)}
            {fit.checks.map((r) => <li key={r} className="flex items-start gap-[8px] text-[14px] leading-[20px]"><span aria-hidden className="mt-[7px] size-[6px] flex-none rounded-full" style={{ background: AMBER }} />{r}</li>)}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-[8px]">
        <h3 className="text-[12px] leading-[16px] font-bold tracking-[0.07em] uppercase" style={MUTED}>Who it is for</h3>
        <p className="text-[14px] leading-[20px]">{item.eligibility}</p>
        {item.states.length > 0 && !item.states.includes("Any") && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.states.includes("Remote") ? "Online, open anywhere." : `Open in ${item.states.map(stateName).join(", ")}.`}</p>}
      </section>

      {item.requires.length > 0 && (
        <section className="flex flex-col gap-[8px]">
          <h3 className="text-[12px] leading-[16px] font-bold tracking-[0.07em] uppercase" style={MUTED}>You will need</h3>
          <ul className="flex flex-wrap gap-[6px]">
            {item.requires.map((r) => <li key={r} className="flex h-[28px] items-center rounded-full border px-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>{r}</li>)}
          </ul>
        </section>
      )}

      <footer className="flex flex-col gap-[4px] border-t pt-[12px] text-[12.5px] leading-[17px]" style={{ borderColor: "var(--glass-border)", ...MUTED }}>
        <span>Checked on {host}, {checkedOn(item.verifiedOn)}. Applying happens on their site, not here.</span>
        {item.type === "scholarship" && <span>A real scholarship never asks for a credit card. If one does, close the page.</span>}
        {item.type === "program" && item.postedBy && <span>Posted by a Dreamari partner. Dreamari has not checked the details.</span>}
        {item.type === "scholarship" && item.kind !== "local" && <span>Most money comes from the schools you apply to. <Link href="/colleges" className="dm-link font-bold" style={{ color: SOFT }}>See your schools</Link></span>}
      </footer>
    </article>
  );
}
