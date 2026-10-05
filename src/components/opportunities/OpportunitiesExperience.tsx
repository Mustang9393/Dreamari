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
//    one opens its own page (/opportunities/[id]), a focused full page.
//    3 Oct 2026, Joshua: "remove the scholarship list on the left once a
//    scholarship is opened, so the detail page becomes a focused full-page
//    view." The reading layout (list left, reader right, 1 Oct) is gone.
//    What it was good for is kept: the page has previous and next through
//    this same list ("3 of 24"), and Back lands on the same filters and
//    scroll position (saved below in RETURN_KEY), so scanning many is still
//    one tap each.
// 3. "Later" is folded shut: what opens to you in a later grade. Scrolling
//    to it the first time opens it on its own, so its use is understood.
// 4. No Saved view here. Saved things live in one place, the Profile's
//    Saved (Chandu: "a central place for saved... train the students to
//    reach the saved and learn where it lives"), so every Save confirms
//    with the way there.
// Fit is reasons, not a percentage; nothing is applied for here.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, CalendarClock, ChevronDown, ChevronLeft, ChevronRight, GraduationCap, SlidersHorizontal, Tag, Trophy, Wallet, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { EmptyView } from "@/components/app/states";
import { FeedbackBar, type Feedback } from "@/components/app/FeedbackBar";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { Chips, Dropdown, Option, Section, StickyBar } from "@/components/colleges/filterKit";
import { COLLEGES } from "@/components/colleges/data";
import { savedHref } from "@/components/profile/layoutVersion";
import { opportunityStore, setFafsaStatus, setOpportunityStatus, type FafsaStatus, type OpportunityStatus } from "@/lib/opportunities";
import { FIELDS, LEVEL, LEVELS, PROGRAM_KIND, SCHOLARSHIP_KIND, type Field, type Level, type Paid, type ProgramKind, type ScholarshipKind } from "./types";
import { fitFor, stateName, timing, today, useStudent, worldToField, type Timing } from "./match";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "./data";
import { MUTED, Row, isFullRide, type Enriched } from "./Card";
import { Shelf } from "./Shelf";
import { Poster } from "./Poster";
import { postersArt } from "./art";
import { RETURN_KEY, consumeReturning, readListReturn, type ListReturn } from "./listReturn";

export type Tab = "scholarships" | "programs" | "internships";
type Closes = "any" | "month" | "3mo" | "later";
type AmountMin = 0 | 1000 | 5000 | 20000 | "full";
type Cost = "free" | "paid" | "tuition";
type SortKey = "fit" | "closing" | "amount" | "az";
type F = { closes: Closes; fields: Set<Field>; kinds: Set<string>; levels: Set<Level>; amount: AmountMin; cost: Set<Cost>; grade: number | null; school: string | null };

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

const empty = (): F => ({ closes: "any", fields: new Set(), kinds: new Set(), levels: new Set(), amount: 0, cost: new Set(), grade: null, school: null });
const tog = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
const costOf = (p: Paid): Cost | null => (p === "free" ? "free" : p === "paid" || p === "stipend" ? "paid" : p === "tuition" ? "tuition" : null);

export function OpportunitiesExperience({ initialTab, initialField = "", initialSchool = "" }: { initialTab: Tab; initialField?: string; initialSchool?: string }) {
  const router = useRouter();
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
  // A shelf opened with View all ("all" = Browse all); null = the shelves.
  const [shelf, setShelf] = useState<string | null>(null);
  const [laterPulse, setLaterPulse] = useState(false);
  const [bar, setBar] = useState<Feedback | null>(null);
  const barSeq = useRef(0);
  const laterRef = useRef<HTMLElement>(null);

  const savedLink = `${savedHref()}&shelf=opportunities`;
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
    // A level filter keeps only what the provider says it pays for; one
    // whose page does not say is left out rather than guessed in.
    if (g.levels.size && !(item.type === "scholarship" && item.levels?.some((l) => g.levels.has(l)))) return false;
    if (item.type === "scholarship") {
      if (g.amount === "full" && !isFullRide(item.amount)) return false;
      if (typeof g.amount === "number" && g.amount > 0 && (item.amountMax === null || item.amountMax < g.amount) && !isFullRide(item.amount)) return false;
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
      if (sort === "amount") { const am = (e: Enriched) => (e.item.type === "scholarship" ? (isFullRide(e.item.amount) ? 1e9 : e.item.amountMax ?? -1) : -1); return am(b) - am(a) || dayRank(a.time) - dayRank(b.time); }
      return whenRank[a.fit.when] - whenRank[b.fit.when] || b.fit.score - a.fit.score || dayRank(a.time) - dayRank(b.time);
    });
    return rows;
  }, [all, f, sort]);

  const now = visible.filter((e) => e.fit.when === "now");
  const later = visible.filter((e) => e.fit.when === "later");
  const noun = NOUN[tab];
  const n = visible.length;

  // Opening one: remember the list as it stands (tab, filters, sort, scroll
  // and the order on screen), so the page can step through it ("3 of 24")
  // and Back lands exactly here.
  const open = (id: string, ids: string[] = [...now, ...later].map((e) => e.item.id)) => {
    const ret: ListReturn = {
      tab, closes: f.closes, fields: [...f.fields], kinds: [...f.kinds], levels: [...f.levels], amount: f.amount, cost: [...f.cost], grade: f.grade, school: f.school,
      sort, laterOpen, shelf, y: Math.round(window.scrollY), ids, label: LABEL[tab],
    };
    try { window.sessionStorage.setItem(RETURN_KEY, JSON.stringify(ret)); } catch { /* the page still opens; it just has no previous and next */ }
    router.push(`/opportunities/${id}`);
  };
  // Coming back from a page: put the list back as it was, once. A link in
  // with its own field or school wins over the remembered list.
  useEffect(() => {
    if (!consumeReturning()) return;
    const ret = readListReturn();
    if (!ret || initialField || initialSchool) return;
    const r = ret;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time restore from sessionStorage, which the server render cannot read
    setTab(r.tab);
    setF({ closes: r.closes, fields: new Set(r.fields), kinds: new Set(r.kinds), levels: new Set(r.levels), amount: r.amount, cost: new Set(r.cost), grade: r.grade, school: r.school });
    setSort(r.sort);
    setLaterOpen(r.laterOpen);
    setShelf(r.shelf ?? null);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.scrollTo({ top: r.y })));
  }, [initialField, initialSchool]);

  // Later opens itself, with a pulse, when the student scrolls it into view
  // while it is folded, so they learn what the fold is for (Chandu, 1 Oct
  // 2026: "when I scroll to the end make the Later tab animate and visibly
  // auto expand"). Once per tab (the list), no stored flag: a stored
  // once-per-session flag fired silently when Later was already on screen
  // at load and then never played again ("nothing happening when I
  // scroll"). A short delay after it comes into view keeps it readable as
  // a response to the scroll, not a page-load twitch.
  const nudgedFor = useRef<Tab | null>(null);
  useEffect(() => {
    const el = laterRef.current;
    if (!el || laterOpen || nudgedFor.current === tab) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || e.intersectionRatio < 0.6) { window.clearTimeout(timer); return; }
      timer = window.setTimeout(() => {
        io.disconnect();
        nudgedFor.current = tab;
        setLaterPulse(true);
        setLaterOpen(true);
        window.setTimeout(() => setLaterPulse(false), 1400);
      }, 350);
    }, { threshold: [0.6] });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, [laterOpen, tab]);

  // One bar, the lab's shape: what happened, Undo, where it went.
  const setStatus = (id: string, next: OpportunityStatus | null) => {
    const prev = record.status[id]?.status ?? null;
    setOpportunityStatus(id, next);
    const name = all.find((e) => e.item.id === id)?.item.name ?? "it";
    const undo = () => setOpportunityStatus(id, prev);
    const text = next === null ? `Removed ${name} from Saved in your profile` : next === "saved" && prev === null ? `Saved ${name} to your profile` : next === "saved" ? `${name} is back to just saved` : next === "applied" ? `Marked ${name} as applied` : next === "won" ? `Nice. You got ${name}` : `Updated ${name}`;
    barSeq.current += 1;
    setBar({ id: `${id}:${barSeq.current}`, text, undo, link: next ? { label: "View saved", href: savedLink } : undefined });
  };
  const toggleSave = (id: string) => setStatus(id, record.status[id] ? null : "saved");
  const switchTab = (t: Tab) => { setTab(t); setLaterOpen(false); setShelf(null); setF((cur) => ({ ...cur, kinds: new Set(), levels: new Set(), amount: 0, cost: new Set() })); setSort("fit"); };

  // The one line under the title: what is open to this grade now, and when
  // the rest opens. Counted on the whole list, not the filtered one.
  const nowAll = all.filter((e) => e.fit.when === "now").length;
  const laterAll = all.filter((e) => e.fit.when === "later");
  const nextGrade = laterAll.length ? Math.min(...laterAll.map((e) => (e.item.grades.length ? Math.min(...e.item.grades.filter((g) => g > grade)) : 13))) : null;
  const laterWord = nextGrade === null ? "" : nextGrade === 12 ? "when you are a senior" : nextGrade === 13 ? "in college" : `in grade ${nextGrade}`;
  // Plain words, short sentences: these are 14-year-olds (Chandu, 1 Oct
  // 2026: "change the copy to something an 8th grader would understand").
  const line = `${nowAll} you can apply to now${laterAll.length ? `. ${laterAll.length} more ${laterWord}.` : "."}`;

  const chips: { key: string; label: string; off: () => void }[] = [];
  if (f.school && school) chips.push({ key: "school", label: `Usable at ${school.name}`, off: () => set({ school: null }) });
  if (f.closes !== "any") chips.push({ key: "closes", label: CLOSES.find((c) => c.key === f.closes)!.label, off: () => set({ closes: "any" }) });
  f.fields.forEach((x) => chips.push({ key: `field-${x}`, label: x, off: () => set({ fields: tog(f.fields, x) }) }));
  f.levels.forEach((l) => chips.push({ key: `level-${l}`, label: LEVEL[l].label, off: () => set({ levels: tog(f.levels, l) }) }));
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
  // 6 Oct 2026. Chandu: "make opportunities page a lot cleaner. The card
  // thing is too basic and a lot at once... the grid itself and the card
  // designs are bad", then "the long lists are also too much to scan... It
  // needs to be easy on the eyes, spaced enough so it's not clutter." So the
  // tab opens on shelves (Shelf.tsx): a few short named rows of cards, each
  // answering one question, like Explore. A card can sit on two shelves;
  // that is fine, the way a film sits in two Netflix rows. View all on a
  // shelf, Browse all, any filter, or any sort but Best fit shows the plain
  // list instead (rows, two columns on a wide screen), since then the
  // student has already said what they are looking for.
  const props = (e: Enriched, ids?: string[]) => ({ e, status: record.status[e.item.id]?.status ?? null, onOpen: () => open(e.item.id, ids), onSave: () => toggleSave(e.item.id) });
  const rows = "grid grid-cols-1 gap-x-[28px] gap-y-[2px] lg:grid-cols-2";
  const row = (e: Enriched) => <li key={e.item.id} className="min-w-0 border-b" style={{ borderColor: "color-mix(in srgb, var(--foreground) 7%, transparent)" }}><Row {...props(e)} /></li>;
  const due = (e: Enriched) => (e.time.status === "open" && e.time.days !== null ? e.time.days : 99999);
  const top3 = (e: Enriched) => e.fit.reasons.some((r) => r.startsWith("Fits your Top 3"));
  const nearMe = (e: Enriched) => e.fit.reasons.some((r) => r.startsWith("Open in "));
  const big = (e: Enriched) => e.item.type === "scholarship" && (isFullRide(e.item.amount) || (e.item.amountMax ?? 0) >= 20000);
  const size = (e: Enriched) => (e.item.type === "scholarship" ? (isFullRide(e.item.amount) ? 1e9 : e.item.amountMax ?? 0) : 0);
  const pays = (e: Enriched) => e.item.type === "program" && (e.item.paid === "paid" || e.item.paid === "stipend");
  const free = (e: Enriched) => e.item.type === "program" && e.item.paid === "free";
  const online = (e: Enriched) => e.item.states.includes("Remote") || (e.item.type === "program" && /online/i.test(e.item.setting ?? ""));
  const shelves = [
    { key: "fit", title: "Best fits for you", line: "Picked from your Top 3, your grades and where you live.", items: now },
    { key: "soon", title: "Closing soon", line: "The next deadlines, soonest first.", items: now.filter((e) => due(e) <= 120).sort((a, b) => due(a) - due(b)) },
    ...(tab === "scholarships"
      ? [
        { key: "big", title: "Big awards", line: "$20,000 or more, or a full ride.", items: now.filter(big).sort((a, b) => size(b) - size(a)) },
        { key: "near", title: `Only in ${stateName(student.state)}`, line: `Just for students who live in ${stateName(student.state)}.`, items: now.filter(nearMe) },
        { key: "renew", title: "Pays every year", line: "Win once, get it again each year of college.", items: now.filter((e) => e.item.type === "scholarship" && e.item.renewable === true) },
        ...(["merit", "need", "field", "identity", "arts", "service"] as ScholarshipKind[]).map((k) => ({ key: `kind-${k}`, title: SCHOLARSHIP_KIND[k].label, line: `${SCHOLARSHIP_KIND[k].note}.`, items: now.filter((e) => e.item.kind === k) })),
      ]
      : [
        { key: "pays", title: "They pay you", line: "Earn money while you learn.", items: now.filter(pays) },
        { key: "free", title: "Free to join", line: "No cost to you.", items: now.filter(free) },
        { key: "online", title: "Online", line: "Join from home.", items: now.filter(online) },
        ...(tab === "programs" ? PROGRAM_KINDS : INTERNSHIP_KINDS).map((k) => ({ key: `kind-${k}`, title: k === "leadership" ? "Leadership programs" : `${PROGRAM_KIND[k].label}s`, line: `${PROGRAM_KIND[k].note}.`, items: now.filter((e) => e.item.kind === k) })),
      ]),
    { key: "top3", title: "For your Top 3", line: "Tied to the careers you picked.", items: now.filter(top3) },
  // A shelf needs three to be a row, and must actually narrow the list
  // (an "Internships" shelf holding 14 of 15 internships says nothing).
  ].filter((x) => x.items.length >= 3 && (x.key === "fit" || x.items.length < now.length * 0.85)).slice(0, 5);
  // Later is a shelf too in this view, the last one, so it never unfolds a
  // long list on load; the folded Later section stays for the list view.
  const laterShelf = { key: "later", title: "Later", line: `You can apply to these ${laterWord}. Save the ones you like.`, items: later };
  const filtered = f.closes !== "any" || f.fields.size > 0 || f.kinds.size > 0 || f.levels.size > 0 || f.amount !== 0 || f.cost.size > 0 || f.grade !== null || f.school !== null;
  const listMode = filtered || sort !== "fit" || shelf !== null;
  const opened = shelf && shelf !== "all" ? [...shelves, laterShelf].find((x) => x.key === shelf) ?? null : null;
  const listItems = opened ? opened.items : now;
  const viewAll = (key: string) => { setShelf(key); window.scrollTo({ top: 0, behavior: "smooth" }); };

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
              title: "Field", description: "Your Top 3 is already counted.", noun, count: n, width: 380,
              onClear: f.fields.size ? () => set({ fields: new Set() }) : undefined,
              children: <Section title="Fields" first>{FIELDS.map((x) => <Option key={x} on={f.fields.has(x)} onToggle={() => set({ fields: tog(f.fields, x) })} label={x} note={student.fields.includes(x) ? "In your Top 3" : undefined} count={countWith({ fields: new Set([x]) })} />)}</Section>,
            })} />
            {/* What the money pays for (Joshua, 3 Oct 2026: "Level of Study").
               Visible, not under More: it is the first question a student
               going to a 2-year college or a trade school has. */}
            {tab === "scholarships" && (
              <Dropdown quiet label="School type" icon={<GraduationCap className="h-4 w-4" aria-hidden />} active={f.levels.size > 0} value={f.levels.size ? (f.levels.size === 1 ? LEVEL[[...f.levels][0]].label : `${f.levels.size}`) : undefined} panel={() => ({
                title: "School type", description: "Where you can use the money.", noun, count: n, width: 380,
                onClear: f.levels.size ? () => set({ levels: new Set() }) : undefined,
                children: <Section title="Pays for" first>{LEVELS.map((l) => <Option key={l} on={f.levels.has(l)} onToggle={() => set({ levels: tog(f.levels, l) })} label={LEVEL[l].label} note={LEVEL[l].note} count={countWith({ levels: new Set([l]) })} />)}</Section>,
              })} />
            )}
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
                title: "Sort", description: "Best fit shows what you can apply to now first.", noun, count: n, width: 320,
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

        {/* 3. Cards; 4. Later, folded. */}
        <div className="flex flex-col gap-[26px]">
          {n === 0 && <EmptyView tier={5} heading={`No ${noun}s match`} line="Take off a filter or two." cta="Clear filters" onAction={() => setF(empty())} />}
          {!listMode && n > 0 && (
            <div className="flex flex-col gap-[44px] sm:gap-[52px]">
              {[...shelves, ...(later.length >= 2 ? [laterShelf] : [])].map((x) => {
                const ids = x.items.map((e) => e.item.id);
                const art = postersArt(x.items.slice(0, 10).map((e) => e.item));
                return <Shelf key={`${tab}-${x.key}`} title={x.title} line={x.line} items={x.items} onViewAll={() => viewAll(x.key)}>{(e) => <Poster {...props(e, ids)} photo={art.get(e.item.id) ?? null} />}</Shelf>;
              })}
              <button type="button" onClick={() => viewAll("all")} className="dm-quiet mx-auto flex cursor-pointer items-center gap-[6px] rounded-full border px-[20px] py-[11px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
                Browse all {now.length} {noun}s <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
          {listMode && listItems.length > 0 && (
            <section className="flex flex-col gap-[10px]" aria-label={opened ? opened.title : `${noun}s open to you now`}>
              {shelf !== null && (
                <div className="mb-[8px] flex flex-col gap-[10px]">
                  <button type="button" onClick={() => setShelf(null)} className="dm-quiet -ml-[8px] flex w-fit cursor-pointer items-center gap-[4px] rounded-full px-[8px] py-[5px] text-[13.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>
                    <ChevronLeft className="h-4 w-4" aria-hidden /> All {LABEL[tab].toLowerCase()}
                  </button>
                  <h2 className="text-[21px] leading-[26px] font-bold sm:text-[24px] sm:leading-[30px]">
                    {opened ? opened.title : `Every ${noun} open to you`}<span className="pl-[8px] text-[15px] font-semibold tabular-nums" style={MUTED}>{listItems.length}</span>
                  </h2>
                </div>
              )}
              <ul className={rows}>{listItems.map(row)}</ul>
            </section>
          )}
          {listMode && !opened && later.length > 0 && (
            <section ref={laterRef} className="flex flex-col gap-[16px]">
              <motion.button type="button" aria-expanded={laterOpen} onClick={() => setLaterOpen((o) => !o)} animate={laterPulse ? { scale: [1, 1.012, 1] } : { scale: 1 }} transition={{ duration: 0.7, ease: "easeInOut" }}
                className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-lg)] border px-[20px] py-[16px] text-left transition-colors duration-500" style={{ borderColor: laterPulse ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--glass-border)", background: laterPulse ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-1))" : "var(--glass-surface-1)" }}>
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[16px] leading-[21px] font-bold">Later</span>
                  <span className="text-[13px] leading-[18px]" style={MUTED}>{later.length} {noun}{later.length === 1 ? "" : "s"} you can apply to {laterWord}. Save the ones you like so you do not lose them.</span>
                </span>
                <ChevronDown className="h-5 w-5 flex-none transition-transform duration-300" aria-hidden style={{ color: "var(--muted-foreground)", transform: laterOpen ? "rotate(180deg)" : "none" }} />
              </motion.button>
              <AnimatePresence initial={false}>
                {laterOpen && (
                  <motion.div key="later" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }} className="overflow-hidden">
                    <ul className={`${rows} pt-[2px]`} aria-label={`${noun}s for later`}>{later.map(row)}</ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}
        </div>
      </main>

      <FeedbackBar bar={bar} onClose={() => setBar(null)} />

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
