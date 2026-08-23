"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

import { WORLD_COLORS } from "@/components/app/worlds";
import { CareerReportDocument, CareerReportView } from "@/components/profile/CareerReport";
import { ALL_PROFILE_CAREERS, STUDENT, type ProfileCareer } from "@/components/profile/data";
import { reportV2 } from "@/components/profile/report-data";
import { picksParam, picksSnapshot, serverPicksSnapshot, subscribePicks, writePicks } from "@/lib/picks";

// The bridge between Match and the profile. The student swiped a Top 3; here
// those three are the REAL reports, side by side, and they commit to one.
//
// Nothing here is a summary OF a report -- each column renders the same
// document the profile renders and the printer prints, so a chooser column can
// never drift from the thing it is choosing between.

function careerById(id: string): ProfileCareer | null {
  return ALL_PROFILE_CAREERS.find((career) => career.id === id) ?? null;
}

export function ReportChooser({ initialPicks }: { initialPicks: string[] }) {
  const router = useRouter();

  // The URL is the authority the moment we arrive from Match; storage covers a
  // refresh or landing here cold. Careers with no report are dropped rather
  // than rendered as an empty column.
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const ids = useMemo(
    () => (initialPicks.length ? initialPicks : stored.ids).filter((id) => careerById(id) && reportV2(id)),
    [initialPicks, stored],
  );
  // The report in the middle of the stage IS the one you are choosing -- no
  // separate select step. Their #1 from the deck starts centred, so confirming
  // without touching anything keeps the ranking they already made.
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = picked && ids.includes(picked) ? picked : (ids[0] ?? null);
  const index = Math.max(0, ids.indexOf(chosen ?? ""));
  const go = (step: number) => {
    const next = ids[index + step];
    if (next) setPicked(next);
  };
  const [reading, setReading] = useState<string | null>(null);
  const [savedMajors, setSavedMajors] = useState<Set<string>>(new Set());
  const [leaving, setLeaving] = useState(false);

  const careers = useMemo(() => ids.map(careerById).filter(Boolean) as ProfileCareer[], [ids]);
  const chosenCareer = chosen ? careerById(chosen) : null;
  const readingCareer = reading ? careerById(reading) : null;

  function toggleMajor(name: string) {
    setSavedMajors((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function confirm() {
    if (!chosenCareer || leaving) return;
    setLeaving(true);
    // Chosen career first: the profile reads this order as the Top 3 ranking,
    // so "the one I start with" and "my #1" stay the same thing.
    const ordered = [chosenCareer.id, ...ids.filter((id) => id !== chosenCareer.id)];
    writePicks({ ids: ordered, focus: chosenCareer.id });
    router.push(`/profile?picks=${picksParam(ordered)}&focus=${chosenCareer.id}`);
  }

  return (
    <div
      className="marketing-v2 themeable relative min-h-dvh w-full"
      style={{
        background:
          "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
        overflowX: "clip",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img alt="" src="/images/app/background-space.svg" className="absolute inset-0 h-full w-full max-w-none object-cover" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-[var(--space-4)] pt-[var(--space-8)] pb-[130px] md:pt-[var(--space-10)]">
        <header className="flex flex-wrap items-baseline gap-x-[var(--space-4)] gap-y-[2px] px-5 md:px-[var(--space-10)]">
          <h1 className="text-[30px] leading-[1.05] font-extrabold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>
            Choose where to start
          </h1>
          <p className="text-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            The rest stay in your profile.
          </p>
        </header>

        {careers.length === 0 ? (
          <div className="px-5 md:px-[var(--space-10)]">
            <EmptyState onGoMatch={() => router.push("/match-lab")} />
          </div>
        ) : (
          <ReportStage
            careers={careers}
            index={index}
            onGo={go}
            onCentre={(id) => setPicked(id)}
            onExpand={(id) => setReading(id)}
          />
        )}
      </main>

      {careers.length > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-[14px]"
          style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", borderColor: "var(--glass-border)" }}
        >
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-end px-5 py-[var(--space-4)] md:px-[var(--space-10)]">
            <button
              type="button"
              onClick={confirm}
              disabled={!chosenCareer || leaving}
              className="dm-solid inline-flex cursor-pointer items-center gap-[8px] rounded-full px-[22px] py-[12px] text-[16px] font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {chosenCareer ? `Start with ${chosenCareer.title}` : "Start"}
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {readingCareer && (
        <div className="fixed inset-0 z-[70] overflow-y-auto" style={{ background: "color-mix(in srgb, var(--background) 94%, transparent)" }}>
          <div
            className="sticky top-0 z-10 flex items-center justify-between gap-[var(--space-3)] px-5 py-[var(--space-3)] backdrop-blur-[10px] md:px-[var(--space-10)]"
            style={{ background: "var(--glass-surface-3)", borderBottom: "1px solid var(--glass-border)" }}
          >
            <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {readingCareer.title}
            </span>
            <span className="flex items-center gap-[var(--space-2)]">
              <button
                type="button"
                onClick={() => {
                  setPicked(readingCareer.id);
                  setReading(null);
                }}
                className="dm-quiet cursor-pointer rounded-full border px-[14px] py-[7px] text-[14px] font-bold"
                style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                Start with this
              </button>
              <button
                type="button"
                onClick={() => setReading(null)}
                aria-label="Close"
                className="dm-quiet flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border"
                style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                <X className="h-[18px] w-[18px]" aria-hidden />
              </button>
            </span>
          </div>
          <div className="mx-auto w-full max-w-[1200px] px-5 pb-[120px] md:px-[var(--space-10)]">
            <CareerReportView
              student={{ name: STUDENT.name, grade: STUDENT.grade, school: STUDENT.school }}
              career={readingCareer}
              savedMajors={savedMajors}
              onToggleMajor={toggleMajor}
              onOpenShare={() => {}}
              onOpenEvidence={() => {}}
              updatedLabel="just now"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// The stage. One report is centred and readable; the others peek in from the
// edges, scaled back and dimmed, so it is obvious there are more without
// showing three squeezed columns -- and on a phone it is the same one-up view
// rather than three stacked documents.
function ReportStage({
  careers,
  index,
  onGo,
  onCentre,
  onExpand,
}: {
  careers: ProfileCareer[];
  index: number;
  onGo: (step: number) => void;
  onCentre: (id: string) => void;
  onExpand: (id: string) => void;
}) {
  const touchX = useRef<number | null>(null);

  return (
    <div
      className="relative w-full"
      role="group"
      aria-roledescription="carousel"
      aria-label="Your career reports"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onGo(-1);
        if (event.key === "ArrowRight") onGo(1);
      }}
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchX.current;
        const end = event.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null) return;
        if (Math.abs(end - start) > 48) onGo(end < start ? 1 : -1);
      }}
    >
      <div className="relative h-[min(72vh,760px)] w-full">
        {careers.map((career, position) => {
          const offset = position - index;
          const active = offset === 0;
          const beyond = Math.abs(offset) > 1;
          const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
          return (
            <div
              key={career.id}
              aria-hidden={!active}
              className="absolute inset-y-0 left-1/2 w-[min(92vw,560px)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{
                transform: `translateX(calc(-50% + ${offset * 56}%)) scale(${active ? 1 : 0.88})`,
                opacity: beyond ? 0 : active ? 1 : 0.55,
                zIndex: 20 - Math.abs(offset),
                pointerEvents: beyond ? "none" : "auto",
              }}
            >
              <section
                className={`flex h-full flex-col overflow-hidden rounded-[22px] border ${active ? "backdrop-blur-[20px]" : ""}`}
                style={{
                  // Opaque enough that the report behind it does not read
                  // through the glass -- a peeking card should sit BEHIND the
                  // one you are reading, not inside it.
                  background: active ? "var(--glass-surface-3)" : "var(--glass-surface-1)",
                  borderColor: active ? accent : "var(--glass-border)",
                  borderWidth: active ? 2 : 1,
                  boxShadow: active ? `0 26px 70px -30px color-mix(in srgb, ${accent} 85%, transparent)` : "none",
                }}
              >
                <div className="flex flex-none items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-3)]">
                  <span
                    className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold"
                    style={{
                      background: active ? accent : "transparent",
                      border: active ? "none" : "1.5px solid var(--glass-border)",
                      color: active ? "#05070f" : "var(--muted-foreground)",
                    }}
                  >
                    {active ? <Check className="h-[15px] w-[15px]" aria-hidden /> : position + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                    {career.title}
                  </span>
                  {active && (
                    <button
                      type="button"
                      onClick={() => onExpand(career.id)}
                      aria-label={`Open the ${career.title} report full width`}
                      className="dm-quiet flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full border"
                      style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
                    >
                      <Maximize2 className="h-[15px] w-[15px]" aria-hidden />
                    </button>
                  )}
                </div>

                <div className="relative min-h-0 flex-1">
                  <div
                    className={`h-full overflow-y-auto overscroll-contain px-[var(--space-2)] pb-[var(--space-5)] [scrollbar-width:thin] ${active ? "" : "overflow-hidden"}`}
                    inert={!active}
                  >
                    <CareerReportDocument
                      student={{ name: STUDENT.name, grade: STUDENT.grade, school: STUDENT.school }}
                      career={career}
                      idPrefix={`pick-${career.id}-`}
                    />
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[64px]"
                    style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--background) 94%, transparent), transparent)" }}
                  />
                </div>
              </section>

              {/* A peeking report is a target, not decoration: tap it to bring
                 it to the middle. */}
              {!active && !beyond && (
                <button
                  type="button"
                  onClick={() => onCentre(career.id)}
                  className="absolute inset-0 cursor-pointer rounded-[22px]"
                  style={{ background: "color-mix(in srgb, var(--background) 30%, transparent)" }}
                >
                  <span className="sr-only">Show the {career.title} report</span>
                </button>
              )}
            </div>
          );
        })}

        <StageArrow side="left" disabled={index === 0} onClick={() => onGo(-1)} />
        <StageArrow side="right" disabled={index === careers.length - 1} onClick={() => onGo(1)} />
      </div>

      <div className="mt-[var(--space-3)] flex items-center justify-center gap-[7px]">
        {careers.map((career, position) => (
          <button
            key={career.id}
            type="button"
            onClick={() => onCentre(career.id)}
            aria-label={career.title}
            aria-current={position === index ? "true" : undefined}
            className="h-[7px] cursor-pointer rounded-full transition-[width,background] duration-300 motion-reduce:transition-none"
            style={{
              width: position === index ? 26 : 7,
              background: position === index ? "var(--foreground)" : "var(--glass-border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StageArrow({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous report" : "Next report"}
      className="absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px] transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none"
      style={{
        [side]: "max(8px, 2vw)",
        background: "color-mix(in srgb, var(--background) 72%, transparent)",
        borderColor: "var(--glass-border)",
        color: "var(--foreground)",
      }}
    >
      <Icon className="h-[20px] w-[20px]" aria-hidden />
    </button>
  );
}

function EmptyState({ onGoMatch }: { onGoMatch: () => void }) {
  return (
    <div className="rounded-[22px] border px-[var(--space-5)] py-[var(--space-8)] text-center" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      <p className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
        Nothing saved yet
      </p>
      <button
        type="button"
        onClick={onGoMatch}
        className="dm-solid mt-[var(--space-4)] inline-flex cursor-pointer items-center gap-[8px] rounded-full px-[20px] py-[11px] text-[15px] font-extrabold"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Find your Top 3
        <ArrowRight className="h-[17px] w-[17px]" aria-hidden />
      </button>
    </div>
  );
}
