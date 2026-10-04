"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, ChevronDown, X } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { IconTip } from "@/components/app/IconTip";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, ExploreSectionSwitch, ExploreSectionTabs, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { DISPLAY, PANEL } from "@/components/career/CareerDetailExperience";
import { SurfaceState } from "@/components/app/SurfaceState";
import { ADMISSION_WORD, COLLEGES, STATES, money, type Admission, type College, type Control, type Level, type Setting, type Size } from "./data";
import { ACCENT, RULE, SOFT, pct, tags, useSaved } from "./shared";
import { ForYouSchools } from "./ForYouSchools";
import { ForYouBrowseToggle } from "@/components/actions-lab/ExploreLab";
import { savedHref } from "@/components/profile/layoutVersion";
import { BrowseV2 } from "./BrowseV2";

// Find a school -- colleges and trade schools both live here, so the page
// (and its nav chip) says "Schools," never "Colleges" (direct feedback,
// 8 Sept 2026: "Colleges" as the visible label makes clients ask whether
// trade schools are supported). Browse all is BrowseV2.tsx (30 Sept 2026):
// one search, one bar of filter dropdowns above the results, Sort, one row
// of removable chips. The old quick picks and slide-in tray are retired;
// FilterTray below is kept only for the component lab's record.


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

const COST_CAPS = [10000, 15000, 20000, 25000];

function toggleIn<T>(set: Set<T>, v: T): Set<T> { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); return n; }


export function CollegesExperience({ initialQuery = "", initialType = "", initialView }: { initialQuery?: string; initialType?: string; initialView?: "foryou" | "browse" }) {
  const router = useRouter();
  // For you (the student's pathway) vs Browse all (search + filters), the
  // same split Explore Careers has (Joshua Pierce, Slack, 10 Sept 2026).
  // A search or type handoff lands on Browse all; otherwise For you, when
  // the focus career has a pathway (the demo Top 3 always does). An
  // explicit `initialView` (set only when the URL itself carries `?view=`,
  // written by `switchView` below) wins over that heuristic -- without it,
  // switching to Browse all and refreshing silently bounced back to For
  // you, since this heuristic re-ran from scratch and had no memory of
  // which tab the student had actually picked (direct feedback, 22 Sept
  // 2026: "if I refresh on a certain tab... I should land back on that
  // tab, not take me back to Explore careers if I'm in school/browse
  // all" -- the same bug Explore Careers' own For you/Browse toggle had).
  const [view, setView] = useState<"foryou" | "browse">(() => {
    if (initialView) return initialView;
    if (initialQuery || initialType) return "browse";
    // Schools opens on Browse all (3 Oct 2026, Chandu: "default school's tab
    // to browse all"; this reverses the 2 Oct "default Schools tab to for
    // you"). A ?view= in the URL still wins, so a refresh keeps the tab the
    // student picked.
    return "browse";
  });
  // Unlike Explore Careers' own `switchTab` (whose bare `/explore` has one
  // hardcoded server default, "browse"), this page's own default is a
  // heuristic that can resolve either way depending on the student's saved
  // picks -- so unlike that one, BOTH directions need an explicit `?view=`
  // here, or picking Browse all while the heuristic would've said For you
  // (or vice versa) survives right up until the next refresh, then quietly
  // reverts.
  function switchView(next: "foryou" | "browse") {
    setView(next);
    router.replace(`/colleges?view=${next}`, { scroll: false });
  }
  const [compare, setCompare] = useState<string[]>([]);
  // For you's "See saved" goes to the Profile's Saved, Schools shelf: saved
  // things live in one place (Chandu, 1 Oct 2026: "a central place for saved").
  const [compareOpen, setCompareOpen] = useState(false);
  const [saved, toggleSaved] = useSaved();
  const compared = compare.map((s) => COLLEGES.find((c) => c.slug === s)!).filter(Boolean);
  const toggleCompare = (slug: string) => setCompare((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= 3 ? cur : [...cur, slug]));
  useEffect(() => { if (!compareOpen) return; const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCompareOpen(false); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [compareOpen]);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      {/* One backdrop only. AppBackdrop already carries the space sheet; a
         second copy layered here made Schools read lighter and bluer than
         Explore Careers (direct feedback, 11 Sept 2026). */}
      <AppBackdrop />
      <DesktopNavigation active="Explore" />
      {/* No welcome splash of its own here (direct feedback, 13 Sept 2026):
         Explore's own splash now names Schools' detail directly, so a
         second one on this tab was redundant. */}
      {/* Phones and tablets: the same header shell Careers (Explore) uses --
         logo, streak | XP, bell, hamburger -- then the For you | Browse All
         pill and the way back to Careers on their own row at the top of
         main (direct feedback, 19 Sept 2026: "the navigation for careers
         and schools on smaller screens is very very different... Careers
         is the baseline"). Was its own absolute text-tab overlay before;
         now byte-for-byte the same shell, pill and icon styling as Careers. */}
      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      {/* gap-[22px] + the desktop header's own +2px margin, pt-3/md:pt-8:
         the shared "title page" rhythm (Home/Explore/Profile/Play/
         Colleges/Connect), direct feedback 22 Sept 2026 -- see
         HomeExperience.tsx's own comment for the full reasoning. */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-5 pt-3 pb-[140px] sm:px-[var(--space-14)] md:pt-8">
        {/* Phones: the desktop lockup and positions, not a different row
           (1 Oct 2026; Chandu: "follow the desktop's layout and positions").
           Title with the Careers/Schools tabs under it at the left, the
           For you/Browse All pill at the right. */}
        {/* Phone: one row, the same as Explore Careers' Browse row. The
           Careers/Schools switch left, For you / Browse all right, no title
           (Chandu, 1 Oct 2026: "very cluttered on mobile with the two tab
           things competing"). */}
        <div className="relative z-20 flex w-full items-center justify-between gap-[var(--space-3)] lg:hidden">
          <ExploreSectionSwitch active="colleges" />
          <ForYouBrowseToggle tab={view} onTab={switchView} />
        </div>
        {/* Desktop header, laid out exactly like Explore Careers': title and
           the Careers/Schools strip on the left, the For you / Browse All
           pill on the right. Phones use the top bar above instead. */}
        <div className="hidden w-full items-center justify-between gap-[var(--space-6)] lg:flex">
          <div className="flex flex-col gap-[var(--space-2)]">
            {/* "Explore", not "Explore Schools": the Schools tab right under it
               already says which section this is, and the repeated word was
               one more text tier in an over-stacked header (11 Sept 2026). */}
            <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Explore</h1>
            <ExploreSectionTabs active="colleges" />
          </div>
          <ForYouBrowseToggle tab={view} onTab={switchView} />
        </div>

        {view === "foryou" && <ForYouSchools saved={saved} onSave={toggleSaved} compare={compare} onCompare={toggleCompare} onShowSaved={() => router.push(`${savedHref()}&shelf=schools`)} />}
        {/* Browse all: the filter bar above the results (BrowseV2.tsx,
           30 Sept 2026). The v1 quick-pick chips and slide-in Filters sheet
           are retired from this page; FilterTray stays exported below for
           the component lab's record only. */}
        {view === "browse" && <BrowseV2 saved={saved} onSave={toggleSaved} compare={compare} onCompare={toggleCompare} initialQuery={initialQuery} initialType={initialType} />}
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

export function FilterTray({ filters, set, count, onClose, onClear }: { filters: Filters; set: (p: Partial<Filters>) => void; count: number; onClose: () => void; onClear: () => void }) {
  const [statesOpen, setStatesOpen] = useState(false);
  if (typeof document === "undefined") return null;
  return createPortal(
    // Bottom padding (mobile only -- desktop's md:items-stretch is a full-
    // height side panel with no bottom edge to clear) keeps the "Show N
    // colleges" footer button, which lives outside the tray's own scroll
    // region, off the fixed MobileNav bar. Its max-h-[86dvh] alone wasn't
    // enough: the card's BOTTOM edge was still flush with the literal
    // viewport bottom, so the un-scrollable footer landed right where the
    // nav bar sits (same bug as the other sheets on this pass, direct
    // feedback 9 Sept 2026).
    <div className="marketing-v2 themeable fixed inset-0 z-[110] flex items-end justify-end pb-[calc(76px+env(safe-area-inset-bottom))] md:items-stretch md:pb-0" role="dialog" aria-modal="true" aria-label="Filters" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", background: "transparent" }}>
      {/* Was deliberately kept to blur(3px) so "the results stay visible
         behind: dimmed and softened, never black" (11 Sept 2026, a narrow
         exception for this one drawer). Superseded 21 Sept 2026 by an
         explicit app-wide instruction ("blur the background more don't
         just dim the background for the modals... consistently applied to
         all cases") -- raised to the same 28px floor every other modal
         backdrop in the app now uses. The results still show through: a
         real blur reads as visible-but-abstracted, not blocked, at any
         strength. */}
      <button type="button" aria-label="Close filters" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.35)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
      <div className="relative z-[1] flex max-h-[calc(100dvh-96px)] w-full flex-col rounded-[var(--radius-xl)] border md:h-full md:max-h-none md:w-[360px] md:rounded-none md:border-y-0 md:border-r-0" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)" }}>
        <div className="flex items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-3)]" style={{ borderColor: RULE }}>
          <h2 className="text-[18px] leading-[24px] font-extrabold" style={DISPLAY}>Filters</h2>
          <span className="flex items-center gap-[var(--space-2)]">
            <button type="button" onClick={onClear} className="dm-link cursor-pointer text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>Clear</button>
            <IconTip label="Close">
              <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}><X className="h-5 w-5" aria-hidden /></button>
            </IconTip>
          </span>
        </div>
        <div className="dm-scroll min-h-0 flex-1 overflow-y-auto px-[var(--space-3)] [scrollbar-gutter:stable]">
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

export function CompareSheet({ colleges, onClose }: { colleges: College[]; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  const rows: { label: string; get: (c: College) => string }[] = [
    { label: "Cost for a year, after grants", get: (c) => (c.netPrice === null ? "Not published" : money(c.netPrice)) },
    { label: "Applicants who get in", get: (c) => (c.admitRate === null ? "All of them" : `${c.admitRate}%`) },
    { label: "Students who finish their degree", get: (c) => pct(c.finish) },
    { label: "First-years who come back", get: (c) => pct(c.retention) },
    { label: "Borrowers paying loans back", get: (c) => pct(c.repay) },
    { label: "Students", get: (c) => c.undergrads.toLocaleString("en-US") },
    { label: "Type", get: (c) => tags(c).join(" · ") },
    { label: "Typical pay six years after starting", get: (c) => (c.detail?.pay6 ? money(c.detail.pay6) : "Not published") },
    { label: "Owed when they finish", get: (c) => (c.detail?.debt ? money(c.detail.debt) : "Not published") },
  ];
  const head = { background: "color-mix(in srgb, var(--primary) 12%, var(--background))" } as const;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="college-compare-title" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", background: "transparent" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.45)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
      <div className="relative mx-auto mt-auto flex max-h-[92dvh] w-full max-w-[1000px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:my-auto sm:rounded-[var(--radius-lg)]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)] border-b px-5 py-[var(--space-4)]" style={{ borderColor: RULE }}>
          <span className="flex flex-col gap-[2px]">
            <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: SOFT }}>Side by side</span>
            <h3 id="college-compare-title" className="text-[20px] leading-[25px] font-extrabold" style={DISPLAY}>{colleges.length} colleges</h3>
          </span>
          <IconTip label="Close">
            <button type="button" onClick={onClose} className="dm-quiet flex size-[44px] flex-none cursor-pointer items-center justify-center rounded-full" aria-label="Close comparison"><X className="h-5 w-5" aria-hidden /></button>
          </IconTip>
        </div>
        <div className="dm-scroll min-h-0 flex-1 overflow-auto px-5 py-[var(--space-4)]" style={{ touchAction: "pan-x pan-y" }}>
          {/* Surface 16: the compare bar's own button needs 2 picks to open
             this, but the sheet defends itself anyway (27 Sept 2026, states
             pass) so opening it with nothing flagged is never a blank table. */}
          <SurfaceState id={16} isEmpty={colleges.length === 0}>
          <table className="w-full border-collapse text-left text-[13px]" style={{ minWidth: 120 + colleges.length * 190 }}>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-[1] w-[120px] min-w-[120px] border-b px-[12px] py-[10px] text-[12px] leading-[16px] font-bold tracking-[0.04em] uppercase" style={{ ...head, borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Factor</th>
                {colleges.map((c) => (
                  <th key={c.slug} scope="col" className="min-w-[190px] border-b px-[14px] py-[10px] align-bottom text-[15px] leading-[19px] font-extrabold" style={{ borderColor: "var(--glass-border)", fontFamily: "var(--font-display)" }}>
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
          </SurfaceState>
        </div>
      </div>
    </div>,
    document.body,
  );
}
