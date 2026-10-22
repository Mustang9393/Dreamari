"use client";

import { useEffect, useState, useRef } from "react";
import { BuiltByStamp } from "./DreamOpportunity";
import { hasSavedTheme, setGlobalTheme, useGlobalTheme } from "@/components/app/theme";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { SkyAurora } from "@/components/app/SkyAurora";
import { HowItWorks } from "./HowItWorks";
import { Nav } from "./Nav";
import { SchoolsView } from "./SchoolsView";
import { StudentFinalCTA } from "./FinalCTAs";

export function MarketingApp() {
  const [view, setView] = useState<"student" | "schools">("student");
  // Theme is the app's global one (the menu's toggle, persisted as
  // dreamari-theme). The Schools view renders light unless the visitor has
  // chosen a theme; the student landing is art-directed dark.
  const { theme } = useGlobalTheme();
  useEffect(() => {
    if (hasSavedTheme()) return;
    setGlobalTheme(view === "schools" ? "light" : "dark");
  }, [view]);
  const schoolsTheme = theme;

  // The phone pager (globals.css: html { scroll-snap-type: y mandatory } under
  // 768px) is built for the student landing, whose hero, chapters and footer
  // are the pages. The Schools view is a long-form page with no snap points of
  // its own, so with the snap left on, a phone can only ever rest on the one
  // remaining page, the footer. Reuse the pager's existing off switch (the
  // same data attribute scrollHooks.advanceTo flips during a scripted advance)
  // for as long as the Schools view is showing.
  useEffect(() => {
    const html = document.documentElement;
    if (view === "schools") html.dataset.snapOff = "1";
    else delete html.dataset.snapOff;
    return () => {
      delete html.dataset.snapOff;
    };
  }, [view]);

  // The app's aurora at the foot of the screen for the whole page (22 Oct
  // 2026, Chandu: "lets use the new backgrounds we made for the app with the
  // aurora stuff on the landing page"; then, of a first pass that boxed it
  // inside the hero: "The sharp line under the aurora seperating the line
  // above the fold etc is bad" and "it should always have the aurora at the
  // foot of the screen so its visible throughout the scroll. But we need a
  // cool transition with the cloud etc when i scroll under the fold"). Fixed
  // to the viewport, so its bottom edge is always the screen's own; and as
  // Dreamy ducks under the bezel (Mascot.tsx's exit, the hero's bottom edge
  // climbing the first third of the screen) the aurora flares up to meet
  // him and settles again: he dives into the light.
  const auroraGain = useRef(1);
  useEffect(() => {
    if (view !== "student") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
      if (!hero) return;
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh - hero.getBoundingClientRect().bottom) / (vh * 0.45)));
      auroraGain.current = 1 + 1.1 * Math.sin(p * Math.PI);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [view]);

  return (
    <div className={`relative ${view === "schools" && schoolsTheme === "light" ? "theme-light" : ""}`}>
      {/* Ambient page-wide backdrop — per direct feedback the whole page read as flat,
         too-black once you scrolled past Hero's own gradient (that one fades fully to
         var(--background) by its bottom edge, per ChapterShell's "no per-chapter
         background override" decision, which left every chapter below it on plain flat
         --background with nothing but small glow blobs behind individual cards).
         `absolute inset-0` against this wrapper (now `relative`) rather than `fixed` —
         a fixed viewport-relative layer can't fade out at a specific point IN THE
         PAGE (it has no concept of "near the bottom of the document," only "near the
         bottom of whatever's currently on screen"), which ruled it out once the ask
         became "fade to black organically by the end of the scroll." Sizing this to
         the full document instead means everything (the blob positions AND the final
         fade) is expressed as percentages of the page's own total height, so it scales
         correctly regardless of how tall the page ends up being on any given viewport.
         Hidden in the Schools/light theme, which is its own light palette this dark-
         toned wash would muddy. */}
      {view === "student" && (
        // Several overlapping ellipses on ONE element (stacked background layers, listed
        // top-first) rather than separate small blurred circles — per direct follow-up
        // feedback that an earlier pass still left too much dead black between the glow
        // spots. Overlapping ellipses give continuous blue/purple coverage with no gap
        // to fall back to flat black in, distributed by percentage down the whole page
        // rather than clustered in one viewport-height's worth of space. The FIRST layer
        // (painted on top of all the others) is the actual "fade to black" — transparent
        // through the first ~80% of the page, then ramping to var(--background) by the
        // very end, so the reader arrives at Footer through a deliberate dim rather than
        // the vivid wash just stopping arbitrarily or running out.
        <div
          aria-hidden
          data-landing-wash
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "linear-gradient(to bottom, transparent 0%, transparent 80%, var(--background) 97%)",
              "radial-gradient(ellipse 85% 30% at 15% 0%, color-mix(in srgb, var(--primary) 48%, transparent), transparent 62%)",
              "radial-gradient(ellipse 75% 26% at 100% 16%, color-mix(in srgb, var(--hero-accent-purple) 85%, transparent), transparent 60%)",
              "radial-gradient(ellipse 90% 30% at 0% 36%, color-mix(in srgb, var(--world-driving-flying-shipping) 42%, transparent), transparent 62%)",
              "radial-gradient(ellipse 85% 28% at 90% 56%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 60%)",
              "radial-gradient(ellipse 100% 26% at 30% 76%, color-mix(in srgb, var(--primary) 42%, transparent), transparent 62%)",
              "radial-gradient(ellipse 90% 24% at 70% 92%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 62%)",
              "var(--background)",
            ].join(", "),
          }}
        />
      )}

      {view === "student" && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[100dvh]">
          <SkyAurora gainRef={auroraGain} />
        </div>
      )}

      <Nav view={view} onSchoolsClick={() => setView("schools")} onStudentClick={() => setView("student")} />

      {/* Both views stay mounted (toggled with `hidden`, not conditionally rendered) so
          the mascot's rAF loop, IntersectionObservers, and scroll listeners don't tear
          down and reinitialize every time the audience is switched. */}
      <main hidden={view !== "student"} className="relative z-[1]">
        <Hero view={view} onChangeView={setView} />
        <HowItWorks />
        <StudentFinalCTA />
        {/* Quiet "created by Dream Opportunity" stamp; Footer itself is
           spec-locked (landing.md) so this lives beside it, not in it. */}
        <BuiltByStamp />
      </main>

      <main hidden={view !== "schools"} className="relative z-[1]">
        <SchoolsView view={view} onChangeView={setView} theme={schoolsTheme} />
      </main>

      <Footer view={view} />
    </div>
  );
}
