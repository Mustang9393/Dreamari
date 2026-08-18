"use client";

import { useState } from "react";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Nav } from "./Nav";
import { SchoolsView } from "./SchoolsView";
import { StudentFinalCTA } from "./FinalCTAs";

export function MarketingApp() {
  const [view, setView] = useState<"student" | "schools">("student");

  return (
    <div className={view === "schools" ? "theme-light" : undefined}>
      {/* Ambient page-wide backdrop — per direct feedback the whole page read as flat,
         too-black once you scrolled past Hero's own gradient (that one fades fully to
         var(--background) by its bottom edge, per ChapterShell's "no per-chapter
         background override" decision, which left every chapter below it on plain flat
         --background with nothing but small glow blobs behind individual cards). This
         is `fixed` (stays put as the page scrolls, rather than living inside any one
         section) so it reads as one continuous wash of depth behind Nav/Hero/every
         chapter/the final CTA/footer, instead of reintroducing hard seams between
         sections. It has to be the FIRST child here (not a negative z-index) — a
         negative z-index would paint it behind this wrapper's own ancestor
         backgrounds (globals.css's body/html), hiding it entirely; being first in
         source order with z-index:auto is what actually keeps it behind Nav/content
         while still painting on top of the page's solid background. Hidden in the
         Schools/light theme, which is its own light palette this dark-toned wash
         would muddy. */}
      {view === "student" && (
        // Several overlapping ellipses on ONE element (stacked background layers, listed
        // top-first) rather than separate small blurred circles — per direct follow-up
        // feedback that the first pass still left too much dead black between the glow
        // spots. Overlapping ellipses sized well past the viewport give continuous blue/
        // purple coverage with no gap to fall back to flat black in, wherever the reader
        // scrolls to (this stays fixed, so it's the same wash at any scroll position).
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{
            background: [
              "radial-gradient(ellipse 85% 65% at 15% 0%, color-mix(in srgb, var(--primary) 48%, transparent), transparent 62%)",
              "radial-gradient(ellipse 75% 70% at 100% 20%, color-mix(in srgb, var(--hero-accent-purple) 85%, transparent), transparent 60%)",
              "radial-gradient(ellipse 90% 75% at 0% 55%, color-mix(in srgb, var(--world-driving-flying-shipping) 42%, transparent), transparent 62%)",
              "radial-gradient(ellipse 85% 70% at 90% 85%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 60%)",
              "radial-gradient(ellipse 100% 65% at 30% 100%, color-mix(in srgb, var(--primary) 42%, transparent), transparent 62%)",
              "var(--background)",
            ].join(", "),
          }}
        />
      )}

      <Nav onSchoolsClick={() => setView("schools")} />

      {/* Both views stay mounted (toggled with `hidden`, not conditionally rendered) so
          the mascot's rAF loop, IntersectionObservers, and scroll listeners don't tear
          down and reinitialize every time the audience is switched. */}
      <main hidden={view !== "student"}>
        <Hero view={view} onChangeView={setView} />
        <HowItWorks />
        <StudentFinalCTA />
      </main>

      <main hidden={view !== "schools"}>
        <SchoolsView view={view} onChangeView={setView} />
      </main>

      <Footer />
    </div>
  );
}
