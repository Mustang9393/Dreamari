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
