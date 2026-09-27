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

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { QuickLinksMenu } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { setGlobalTheme, useGlobalTheme } from "@/components/app/theme";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { KindBadge, StateChip } from "./kit";
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

export function ComponentLab() {
  const { theme } = useGlobalTheme();
  const mounted = useMounted();
  const active = useScrollSpy(IDS, mounted);

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

      <div className="mx-auto grid max-w-[1320px] gap-[var(--space-8)] px-4 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Sections" className="dm-scroll sticky top-[56px] max-h-[calc(100vh-56px)] overflow-y-auto py-[var(--space-6)]">
            <ul className="flex flex-col gap-[2px]">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={go(s.id)}
                    aria-current={active === s.id ? "true" : undefined}
                    className="block rounded-[var(--radius-sm)] border-l-2 px-[10px] py-[6px] text-[13px] leading-[18px] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
                    style={{ borderColor: active === s.id ? "var(--primary)" : "transparent", color: active === s.id ? "var(--foreground)" : "var(--muted-foreground)" }}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 py-[var(--space-6)]">
          <div className="mb-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
            <h1 className="text-[34px] leading-[1.05] font-extrabold sm:text-[44px]" style={{ fontFamily: "var(--font-display)" }}>
              Component library
            </h1>
            <p className="max-w-[64ch] text-[14.5px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>
              Every reusable piece of Dreamari with its states. Built from docs/handoff/COMPONENT_INVENTORY.md. Where a state is missing, you see the playbook default so the gap is visible.
            </p>
            <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[6px] text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
              <span className="inline-flex items-center gap-[6px]">
                <StateChip>State</StateChip> the state shown
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <KindBadge kind="built" /> exists in code today
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <KindBadge kind="proposed" /> dashed cell, playbook default
              </span>
            </div>
          </div>
          {mounted ? SECTIONS.map(({ id, Body }) => <Body key={id} />) : <p className="py-[var(--space-10)] text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>Loading the library…</p>}
        </main>
      </div>
    </div>
  );
}
