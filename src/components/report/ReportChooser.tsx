"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { FlowChrome } from "@/components/app/FlowChrome";
import { PosterCard } from "@/components/app/PosterCard";
import { WORLD_COLORS } from "@/components/app/worlds";
import type { CatalogCareer } from "@/components/app/catalog";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { ALL_PROFILE_CAREERS, type ProfileCareer } from "@/components/profile/data";
import { reportV2 } from "@/components/profile/report-data";
import { Button } from "@/components/ui/Button";
import { picksParam, picksSnapshot, serverPicksSnapshot, subscribePicks, writePicks } from "@/lib/picks";

// The screen after Match. Rebuilt 2026-09-02 (direct feedback): not three
// full career reports in a carousel, but the three careers they just swiped
// right on, as the same browse cards Explore uses, side by side, and one ask:
// which one do you want to start with. Tap a card to choose it, one button
// to go. Their #1 from the deck starts chosen, so confirming without touching
// anything keeps the ranking they already made. The reports themselves live
// in the profile, where this hands off.

function careerById(id: string): ProfileCareer | null {
  return ALL_PROFILE_CAREERS.find((career) => career.id === id) ?? null;
}

function asPoster(career: ProfileCareer): CatalogCareer {
  // The plain browse card, no salary badge (direct feedback): the choice here
  // is about the person and the work, not the number.
  return { title: career.title, world: career.world, photo: career.photo };
}

export function ReportChooser({ initialPicks }: { initialPicks: string[] }) {
  const router = useRouter();

  // The URL is the authority the moment we arrive from Match; storage covers a
  // refresh or landing here cold. Careers with no report are dropped.
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const ids = useMemo(
    () => (initialPicks.length ? initialPicks : stored.ids).filter((id) => careerById(id) && reportV2(id)),
    [initialPicks, stored],
  );
  const careers = useMemo(() => ids.map(careerById).filter(Boolean) as ProfileCareer[], [ids]);

  const [picked, setPicked] = useState<string | null>(null);
  const chosen = picked && ids.includes(picked) ? picked : (ids[0] ?? null);
  const chosenCareer = chosen ? careerById(chosen) : null;
  const [leaving, setLeaving] = useState(false);
  // Cards arrive one after another; the reveal is the whole ceremony.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  function confirm(e: React.MouseEvent) {
    if (!chosenCareer || leaving) return;
    setLeaving(true);
    dispatchAuroraPulse("cta", e);
    // Chosen career first: the profile reads this order as the Top 3 ranking,
    // so "the one I start with" and "my #1" stay the same thing.
    const ordered = [chosenCareer.id, ...ids.filter((id) => id !== chosenCareer.id)];
    writePicks({ ids: ordered, focus: chosenCareer.id });
    window.setTimeout(() => router.push(`/profile?picks=${picksParam(ordered)}&focus=${chosenCareer.id}`), 260);
  }

  return (
    <div
      className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col"
      style={{
        background: "transparent",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
        transition: "background 600ms ease",
      }}
    >
      <AppBackdrop />
      <FlowChrome />

      <main className="relative z-10 mx-auto flex w-full max-w-[880px] flex-1 flex-col items-center justify-center gap-[var(--space-8)] px-5 pt-[96px] pb-[var(--space-10)] md:px-8">
        {careers.length === 0 ? (
          <EmptyState onGoMatch={() => router.push("/match-lab")} />
        ) : (
          <>
            <header className="flex flex-col items-center gap-[var(--space-2)] text-center">
              <h1 className="text-[28px] leading-[32px] font-extrabold tracking-[-0.01em] sm:text-[36px] sm:leading-[40px]" style={{ fontFamily: "var(--font-display)", textWrap: "balance" }}>
                Choose where to start
              </h1>
              <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>The rest stay in your profile.</p>
            </header>

            {/* The three cards, side by side. On a phone the row scrolls, with
               each card snapping into place. */}
            <div role="radiogroup" aria-label="Your Top 3" className="-mx-5 flex w-[calc(100%+40px)] snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto px-5 pt-3 pb-4 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:justify-center sm:overflow-visible sm:px-0">
              {careers.map((career, index) => {
                const selected = career.id === chosen;
                const ring = WORLD_COLORS[career.world] ?? "var(--primary)";
                return (
                  <div
                    key={career.id}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => setPicked(career.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPicked(career.id);
                      }
                    }}
                    className={`relative flex-none snap-center rounded-[var(--radius-lg)] outline-none transition-[transform,opacity,box-shadow] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[var(--accent-subtle)] ${revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"} ${selected ? "scale-[1.03]" : "opacity-[0.78] hover:opacity-100"}`}
                    style={{
                      transitionDelay: revealed ? "0ms" : `${index * 90}ms`,
                      boxShadow: selected ? `0 0 0 2px ${ring}, 0 24px 48px -24px color-mix(in srgb, ${ring} 70%, transparent)` : "0 18px 40px -28px rgba(0,0,0,0.7)",
                    }}
                  >
                    {/* the card is the whole control: the poster's own button
                       is inert here so the radio wrapper takes the tap */}
                    <div className="pointer-events-none">
                      <PosterCard career={asPoster(career)} />
                    </div>
                    <span
                      aria-hidden
                      className={`absolute top-[10px] left-[10px] flex size-7 items-center justify-center rounded-[var(--radius-sm)] transition-opacity duration-200 ${selected ? "opacity-100" : "opacity-0"}`}
                      style={{ background: ring, color: "#fff" }}
                    >
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  </div>
                );
              })}
            </div>

            <Button variant="primary" size="large" onClick={confirm} disabled={!chosenCareer || leaving} type="button" className="min-w-[260px]">
              {chosenCareer ? `Start with ${chosenCareer.title}` : "Start"} <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onGoMatch }: { onGoMatch: () => void }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-4)] text-center">
      <h1 className="text-[28px] leading-[32px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>No matches yet</h1>
      <p className="max-w-[40ch] text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>Swipe right on up to three careers in Match, and they show up here to choose from.</p>
      <Button variant="primary" onClick={onGoMatch} type="button">
        Go to Match <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
