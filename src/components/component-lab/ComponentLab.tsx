"use client";

// DEMO-ONLY: the Component Lab. One page where Usman (building production)
// can see every element and component in Dreamari with all of its states,
// including the ones that don't exist yet. Direct instruction, 27 Sept
// 2026: "for Usman to see EVERY ELEMENT, COMPONENT LIBRARY, WITH ALL THE
// RELEVANT STATES, EMPTY, ERROR, LOADING ETC SO HE HAS FULL CONTEXT OF
// LITERALLY EVERYTHING IN DREAMARI."
//
// Built from docs/handoff/COMPONENT_INVENTORY.md. Where a component lacks a
// state, the cell shows the playbook default (docs/COMPONENT_STATES_PLAYBOOK.md)
// marked "Proposed default (not built yet)", so the gaps are visible next
// to what exists instead of buried in a doc.
//
// Safety: nothing here writes the real localStorage stores, navigates on
// its own, plays audio on mount or calls /api/*. The theme toggle applies
// the class without persisting. Reached from the hamburger's lab links.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Moon, Rows3, Search, Sun } from "lucide-react";
import { QuickLinksMenu } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { setGlobalTheme, useGlobalTheme } from "@/components/app/theme";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { KindBadge, LabViewContext, ScaleBadge, StateChip, type LabView, type ScaleFilter } from "./kit";
import { PreviewModal } from "./Preview";
import { FoundationsSection } from "./sections/Foundations";
import { ControlsSection } from "./sections/Controls";
import { FeedbackSection } from "./sections/Feedback";
import { SurfacesSection } from "./sections/Surfaces";
import { ChartsSection } from "./sections/Charts";
import { NavigationSection } from "./sections/Navigation";
import { OverlaysSection } from "./sections/Overlays";
import { GameSection } from "./sections/Game";
import { FeaturesSection } from "./sections/Features";
import { StatesGallerySection } from "./sections/StatesGallery";
import { InteractionsSection } from "./sections/Interactions";

const SECTIONS = [
  { id: "foundations", label: "Foundations", Body: FoundationsSection },
  { id: "controls", label: "Controls", Body: ControlsSection },
  { id: "feedback", label: "Feedback and loading", Body: FeedbackSection },
  { id: "surfaces", label: "Surfaces and cards", Body: SurfacesSection },
  { id: "charts", label: "Charts", Body: ChartsSection },
  { id: "navigation", label: "Navigation and chrome", Body: NavigationSection },
  { id: "overlays", label: "Overlays", Body: OverlaysSection },
  { id: "game", label: "Game UI", Body: GameSection },
  { id: "features", label: "Feature modules", Body: FeaturesSection },
  { id: "interactions", label: "Interactions and motion", Body: InteractionsSection },
  { id: "states", label: "States gallery", Body: StatesGallerySection },
] as const;

/** Which section is under the reading line (a band ~25% down the viewport). */
function useScrollSpy(ids: readonly string[], ready: boolean) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-22% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids, ready]);
  return active;
}

const IDS = SECTIONS.map((s) => s.id);

// Sections render on the client only. Several real components are
// intentionally non-deterministic (ChoiceBody shuffles its options, stores
// are read from localStorage), which would mismatch server HTML; the lab
// has nothing worth server-rendering anyway.
const noopSubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** `?solo=<id>` means this page is the full-screen preview's iframe. */
function useSoloParam() {
  return useSyncExternalStore(noopSubscribe, () => new URLSearchParams(location.search).get("solo"), () => null);
}

/** `?kit=core` / `?kit=bespoke` seeds the All / Core kit / Bespoke filter,
 *  so a link can open the library already filtered. */
function readKit(): ScaleFilter {
  const kit = new URLSearchParams(location.search).get("kit");
  return kit === "core" || kit === "bespoke" ? kit : "all";
}
function useKitParam() {
  return useSyncExternalStore(noopSubscribe, readKit, () => "all" as const);
}

const SCALES: { key: ScaleFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "core", label: "Core kit" },
  { key: "bespoke", label: "Bespoke" },
];

/** The iframe that the full-screen preview opens: only the one Specimen or
 *  state cell, at the frame's true width. Everything else renders hidden
 *  (its cells return null, so nothing heavy mounts) and the match portals
 *  into the visible root. */
function SoloView({ id }: { id: string }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const scale = useKitParam();
  // Match the parent lab's theme. ThemeBoot (root layout) re-applies the
  // saved theme in its own effect, which runs after ours, so defer a tick.
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("theme");
    if (t !== "light" && t !== "dark") return;
    const h = setTimeout(() => setGlobalTheme(t), 0);
    return () => clearTimeout(h);
  }, []);
  const view = useMemo<LabView>(() => ({ grid: "auto", scale, solo: id, soloRoot: root, openPreview: () => {} }), [id, root, scale]);
  return (
    <div className="marketing-v2 themeable min-h-screen" style={{ color: "var(--foreground)", background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
      <div ref={setRoot} className="p-4 sm:p-6" />
      <LabViewContext.Provider value={view}>
        <div hidden>
          {SECTIONS.map(({ id: sid, Body }) => (
            <Body key={sid} />
          ))}
        </div>
      </LabViewContext.Provider>
    </div>
  );
}

export function ComponentLab() {
  const mounted = useMounted();
  const solo = useSoloParam();
  if (!mounted) return <LabPage mounted={false} />;
  return solo ? <SoloView id={solo} /> : <LabPage mounted />;
}

type IndexEntry = { section: string; label: string; items: { id: string; name: string }[] };

/** Every Specimen on the page, grouped by section, read from the DOM once
 *  the sections mount (each Specimen <article> carries data-spec). */
function useSpecimenIndex(ready: boolean, scale: ScaleFilter) {
  const [index, setIndex] = useState<IndexEntry[]>([]);
  useEffect(() => {
    if (!ready) return;
    const h = setTimeout(() => {
      setIndex(
        SECTIONS.map((s) => ({
          section: s.id,
          label: s.label,
          items: [...document.querySelectorAll<HTMLElement>(`#${s.id} article[data-spec]`)].map((a) => ({ id: a.id, name: a.dataset.spec ?? "" })),
        })),
      );
    }, 0);
    return () => clearTimeout(h);
  }, [ready, scale]);
  return index;
}

/** "Find a component": filters every Specimen by name across sections. */
function SpecimenSearch({ index, onPick, autoFocus = false }: { index: IndexEntry[]; onPick: (id: string) => void; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const hits = query ? index.flatMap((g) => g.items.filter((i) => i.name.toLowerCase().includes(query)).map((i) => ({ ...i, section: g.label }))).slice(0, 40) : [];
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="relative block">
        <span className="sr-only">Find a component</span>
        <Search className="pointer-events-none absolute top-1/2 left-[10px] h-[14px] w-[14px] -translate-y-1/2" aria-hidden style={{ color: "var(--muted-foreground)" }} />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) {
              onPick(hits[0].id);
              setQ("");
            }
          }}
          placeholder="Find a component"
          className="w-full rounded-full border py-[7px] pr-[12px] pl-[30px] text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}
        />
      </label>
      {query && (
        <ul className="dm-scroll flex max-h-[min(calc(60vh/var(--vz,1)),420px)] flex-col gap-[1px] overflow-y-auto">
          {hits.length === 0 && (
            <li className="px-[10px] py-[6px] text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
              Nothing matches &ldquo;{q.trim()}&rdquo;.
            </li>
          )}
          {hits.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(h.id);
                  setQ("");
                }}
                className="flex w-full cursor-pointer flex-col items-start rounded-[var(--radius-sm)] px-[10px] py-[5px] text-left transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
              >
                <span className="text-[13px] leading-[18px] font-semibold">{h.name}</span>
                <span className="text-[11px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>
                  {h.section}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LabPage({ mounted }: { mounted: boolean }) {
  const { theme } = useGlobalTheme();
  const active = useScrollSpy(IDS, mounted);
  // Grid density (feedback, 27 Sept 2026: components broke and wrapped in
  // narrow cells). Adaptive packs cells; One per row gives each state the
  // full column so a component renders near its real width.
  const [grid, setGrid] = useState<"auto" | "wide">("auto");
  // Core kit / Bespoke (9 Oct 2026): career games scale to ~900 careers
  // only on the data-driven pieces, so the library can show just those, or
  // just the hand-drawn ones that need a core fallback. Seeded from ?kit=
  // and written back, so the filtered view is a shareable link.
  const kitParam = useKitParam();
  const [picked, setPicked] = useState<ScaleFilter | null>(null);
  const scale = picked ?? kitParam;
  const setScale = useCallback((next: ScaleFilter) => {
    setPicked(next);
    const url = new URL(location.href);
    if (next === "all") url.searchParams.delete("kit");
    else url.searchParams.set("kit", next);
    history.replaceState(null, "", url);
  }, []);
  const [preview, setPreview] = useState<{ id: string; title: string } | null>(null);
  const openPreview = useCallback((id: string, title: string) => setPreview({ id, title }), []);
  const closePreview = useCallback(() => setPreview(null), []);
  const view = useMemo<LabView>(() => ({ grid, scale, solo: null, soloRoot: null, openPreview }), [grid, scale, openPreview]);
  const index = useSpecimenIndex(mounted, scale);
  const [findOpen, setFindOpen] = useState(false);
  const jumpTo = useCallback((id: string) => {
    setFindOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }, []);

  // Deep links (/component-lab#states): the sections mount after hydration,
  // so the browser's own jump to the hash has nothing to land on yet.
  useEffect(() => {
    if (!mounted || !location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [mounted]);

  // Keep the active chip in view in the mobile row as the page scrolls.
  useEffect(() => {
    const chip = document.getElementById(`lab-chip-${active}`);
    const row = chip?.parentElement;
    if (!chip || !row || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="marketing-v2 themeable min-h-screen" style={{ color: "var(--foreground)", background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />

      <header className="sticky top-0 z-30 border-b backdrop-blur-[14px]" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--background) 82%, transparent)" }}>
        <div className="mx-auto flex h-[56px] max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconTip label="Back to the app">
              <Link href="/home" aria-label="Back to the app" className="dm-quiet flex size-9 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
                <ArrowLeft className="h-[16px] w-[16px]" aria-hidden />
              </Link>
            </IconTip>
            <p className="min-w-0 truncate text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--primary)" }}>
              Component library · not the demo
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconTip label="Find a component">
              <button type="button" aria-label="Find a component" aria-expanded={findOpen} onClick={() => setFindOpen((o) => !o)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border lg:hidden" style={{ borderColor: "var(--glass-border)", background: findOpen ? "var(--primary)" : "var(--glass-surface-2)", color: findOpen ? "#fff" : undefined }}>
                <Search className="h-[16px] w-[16px]" aria-hidden />
              </button>
            </IconTip>
            <div role="group" aria-label="Grid layout" className="hidden rounded-full border p-[3px] sm:flex" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              {([
                { key: "auto", label: "Adaptive grid", Icon: LayoutGrid },
                { key: "wide", label: "One per row", Icon: Rows3 },
              ] as const).map(({ key, label, Icon }) => (
                <IconTip key={key} label={label}>
                  <button type="button" aria-label={label} aria-pressed={grid === key} onClick={() => setGrid(key)} className="flex size-[30px] cursor-pointer items-center justify-center rounded-full transition-colors" style={grid === key ? { background: "var(--primary)", color: "#fff" } : { color: "var(--muted-foreground)" }}>
                    <Icon className="h-[15px] w-[15px]" aria-hidden />
                  </button>
                </IconTip>
              ))}
            </div>
            <div role="group" aria-label="Component scale" className="hidden rounded-full border p-[3px] sm:flex" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              {SCALES.map(({ key, label }) => (
                <button key={key} type="button" aria-pressed={scale === key} onClick={() => setScale(key)} className="flex h-[30px] cursor-pointer items-center rounded-full px-[11px] text-[12.5px] font-semibold whitespace-nowrap transition-colors" style={scale === key ? { background: "var(--primary)", color: "#fff" } : { color: "var(--muted-foreground)" }}>
                  {label}
                </button>
              ))}
            </div>
            <IconTip label={theme === "dark" ? "Switch to light" : "Switch to dark"}>
              <button
                type="button"
                aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
                onClick={() => setGlobalTheme(theme === "dark" ? "light" : "dark")}
                className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border"
                style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
              >
                {theme === "dark" ? <Sun className="h-[16px] w-[16px]" aria-hidden /> : <Moon className="h-[16px] w-[16px]" aria-hidden />}
              </button>
            </IconTip>
            <QuickLinksMenu />
          </div>
        </div>
        {findOpen && (
          <div className="border-t px-4 py-[10px] lg:hidden" style={{ borderColor: "var(--border)" }}>
            <SpecimenSearch index={index} onPick={jumpTo} autoFocus />
          </div>
        )}
        {/* Mobile and tablet: the section index is a sticky chip row. */}
        <nav aria-label="Sections" className="dm-scroll flex gap-[6px] overflow-x-auto px-4 pb-[10px] lg:hidden">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              id={`lab-chip-${s.id}`}
              href={`#${s.id}`}
              onClick={go(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className="shrink-0 rounded-full border px-[12px] py-[5px] text-[12.5px] font-semibold whitespace-nowrap transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
              style={active === s.id ? { borderColor: "var(--primary)", background: "var(--primary)", color: "#fff" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mx-auto grid max-w-[1320px] gap-[var(--space-8)] px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Sections" className="dm-scroll sticky top-[56px] flex max-h-[calc(calc(100vh/var(--vz,1))-56px)] flex-col gap-[var(--space-4)] overflow-y-auto py-[var(--space-6)] pr-[4px]">
            <SpecimenSearch index={index} onPick={jumpTo} />
            <ul className="flex flex-col gap-[2px]">
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                const items = index.find((g) => g.section === s.id)?.items ?? [];
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={go(s.id)}
                      aria-current={isActive ? "true" : undefined}
                      className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border-l-2 px-[10px] py-[6px] text-[13px] leading-[18px] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
                      style={{ borderColor: isActive ? "var(--primary)" : "transparent", color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
                    >
                      <span>{s.label}</span>
                      {items.length > 0 && <span className="text-[11px] font-medium tabular-nums" style={{ color: "var(--muted-foreground)" }}>{items.length}</span>}
                    </a>
                    {/* The active section lists its components, so any one
                        is a click away without scrolling through the rest. */}
                    {isActive && items.length > 0 && (
                      <ul className="mt-[2px] mb-[6px] ml-[12px] flex flex-col border-l" style={{ borderColor: "var(--border)" }}>
                        {items.map((it) => (
                          <li key={it.id}>
                            <a
                              href={`#${it.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                jumpTo(it.id);
                              }}
                              className="block truncate rounded-[var(--radius-sm)] py-[5px] pr-[8px] pl-[10px] text-[12px] leading-[17px] transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {it.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 py-[var(--space-6)]">
          <div className="mb-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
            <h1 className="text-[34px] leading-[1.05] font-extrabold sm:text-[44px]" style={{ fontFamily: "var(--font-display)" }}>
              Component library
            </h1>
            <p className="max-w-[64ch] text-[14.5px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>
              Every reusable piece of Dreamari with its states. Built from docs/handoff/COMPONENT_INVENTORY.md. Every state is built into the real app; each cell names the file and, for screen states, the live URL.
            </p>
            <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[6px] text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
              <span className="inline-flex items-center gap-[6px]">
                <StateChip>State</StateChip> the state shown
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <KindBadge kind="built" /> exists in code today
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>?state=</span> any state can be seen live on the real screen
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <ScaleBadge scale="core" /> scales to every career by data
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <ScaleBadge scale="bespoke" /> drawn for one career, has a core fallback
              </span>
            </div>
          </div>
          {mounted ? (
            <LabViewContext.Provider value={view}>
              {SECTIONS.map(({ id, Body }) => (
                <Body key={id} />
              ))}
            </LabViewContext.Provider>
          ) : <p className="py-[var(--space-10)] text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>Loading the library…</p>}
        </main>
      </div>
      <PreviewModal target={preview} onClose={closePreview} />
    </div>
  );
}
