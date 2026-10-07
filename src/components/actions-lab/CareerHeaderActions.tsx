"use client";

// The career's header actions, one component for the career page AND the
// career sheet (8 Oct 2026, Chandu: "the CTAs on the pop up modals for
// schools and career details are wrong. These are to reflect the full
// career pages not be different... the flows need to follow what we did
// for the detail pages. The pulses, nudges, etc.", then "NO THE CTAS NEED
// TO FOLLOW THE FORMAT IN THE DETAIL PAGES"). Moved whole from
// CareerDetailLab, the live /career page: the loud tier (Play in its
// BorderBeam, Glossary Game), the quiet icon-over-label strip (Save, Top 3,
// Connect) with its pulse on the next step, and the nudge line. The undo
// bar and the swap sheet come from the shared LabLayer, as on the page.
// `surface` only changes colour: "photo" for the page's dark header card,
// "card" for a sheet that follows the light and dark themes. `stack` is the
// page's own phone arrangement at every width, for a sheet, which is narrow
// whatever the screen: the games as equal halves, the strip spread evenly
// under them (Chandu, 8 Oct 2026: "The glossary game being a huge button is
// wrong, can't we arrange it how we have in the detail page? Properly?").

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BorderBeam } from "border-beam";
import { Bookmark, BookmarkCheck, BookOpen, Play, Users } from "lucide-react";
import { StripButton } from "@/components/app/ActionStrip";
import { PROS } from "@/components/connect/data";
import { hasGlossary } from "@/components/glossary/data";
import { simulationFor } from "@/components/play/games";
import { toggleSave, toggleTop3, useLab } from "./labStore";
import { NextStep, Top3Glyph } from "./labUi";

type Tone = { fg: string; border: string; quiet: string; primary: string; skeleton: string; rule: string; ink?: string; nudge?: string };
const TONES: Record<"photo" | "card", Tone> = {
  photo: { fg: "#fff", border: "rgba(255,255,255,0.3)", quiet: "rgba(12,16,35,0.55)", primary: "color-mix(in srgb, var(--primary) 32%, rgba(12,16,35,0.6))", skeleton: "rgba(255,255,255,0.12)", rule: "rgba(255,255,255,0.14)" },
  card: { fg: "var(--foreground)", border: "var(--glass-border)", quiet: "var(--glass-surface-1)", primary: "color-mix(in srgb, var(--primary) 26%, var(--glass-surface-1))", skeleton: "var(--glass-surface-2)", rule: "var(--glass-border)", ink: "var(--foreground)", nudge: "var(--foreground)" },
};

export function CareerHeaderActions({ career, onConnect, surface = "photo", stack = false }: { career: { slug: string; title: string; world: string }; onConnect: () => void; surface?: "photo" | "card"; stack?: boolean }) {
  const router = useRouter();
  const lab = useLab();
  const T = TONES[surface];
  // A page loading from a backend has no saved/Top 3 state yet: the pills
  // wait as skeletons rather than flash the wrong state (the lab's Slow
  // network shows it for a moment on arrival).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), lab.network === "normal" ? 0 : 900);
    return () => window.clearTimeout(t);
  }, [lab.network]);
  const hasSimulation = !!simulationFor(career.slug);
  const hasGlossaryGame = hasGlossary(career.slug);
  const hasWorldProfessionals = PROS.some((pro) => pro.world === career.world);
  const saved = lab.saved.includes(career.slug);
  const rank = lab.top3.indexOf(career.slug);
  return (
    <>
      {/* The header's actions in two tiers, the way Netflix lays out a
         title (3 Oct 2026, Chandu: "Separate the save, my top 3,
         connect CTAs from the play game and glossary game CTAs... it's
         too many actions at once", then "Top right is NOT the answer"
         and "how do other platforms do it?"). One loud tier, the ways
         to try the job; one quiet strip of icon-over-label buttons,
         keep it and talk to a pro, the shape the For You rail already
         uses. Desktop: the games left, the strip right, one line.
         Phones: the games fill the width, the strip sits under them,
         evenly spaced on one line at any width. */}
      {!ready ? (
        <div className="mt-[var(--space-1)] flex gap-[var(--space-3)]">{[150, 108, 110].map((w) => <span key={w} aria-hidden className="h-[44px] animate-pulse rounded-[var(--radius-md)]" style={{ width: w, background: T.skeleton }} />)}</div>
      ) : (
        <div className={`mt-[var(--space-1)] flex flex-col gap-[var(--space-3)] ${stack ? "" : "md:flex-row md:items-center md:justify-between"}`} style={{ textShadow: "none" }}>
          {(hasSimulation || hasGlossaryGame) && (
            <div role="group" aria-label="Try it" className={`grid gap-[var(--space-2)] ${stack ? "" : "md:flex"} ${hasSimulation && hasGlossaryGame ? "grid-cols-2" : "grid-cols-1"}`}>
              {hasSimulation && (
                <div className={`min-w-0 ${stack ? "" : "md:flex-none"}`}>
                <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}>
                <button
                  type="button"
                  onClick={() => router.push(`/play/${career.slug}`)}
                  className="dm-solid flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[16px] text-[14px] font-semibold whitespace-nowrap"
                  style={{ background: T.primary, borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)", color: T.fg }}
                >
                  {/* ▶ Play, the same words and glyph as every simulation button (3 Oct 2026) */}
                  <Play className="h-[14px] w-[14px]" fill="currentColor" aria-hidden /> Play
                </button>
                </BorderBeam>
                </div>
              )}
              {hasGlossaryGame && (
                <button
                  type="button"
                  onClick={() => router.push(`/play/glossary/${career.slug}`)}
                  className="dm-quiet flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[16px] text-[14px] font-semibold whitespace-nowrap"
                  style={{ borderColor: T.border, background: T.quiet, color: T.fg }}
                >
                  <BookOpen className="h-4 w-4" aria-hidden /> Glossary Game
                </button>
              )}
            </div>
          )}
          <div role="group" aria-label="Keep it, or ask a pro" className={`grid border-t pt-[var(--space-2)] ${stack ? "" : "md:flex md:gap-[2px] md:border-t-0 md:pt-0"} ${hasWorldProfessionals ? "grid-cols-3" : "grid-cols-2"}`} style={{ borderColor: T.rule }}>
            <StripButton
              on={saved}
              busy={lab.pending === `save:${career.slug}`}
              pulse={!saved && rank < 0}
              onClick={() => toggleSave(career.slug, career.title)}
              ariaLabel={saved ? "Saved. Tap to remove from Saved" : "Save"}
              // The three glyphs drawn at about the same height (3 Oct 2026,
              // "make sure the 3 icons are more or less the same size"):
              // Lucide's bookmark fills ~75% of its box and the people
              // glyph ~70%, while the Top 3 box fills all of its own, so
              // the bookmark is drawn larger and the box smaller.
              icon={saved ? <BookmarkCheck className="h-[22px] w-[22px]" fill="currentColor" fillOpacity={0.35} aria-hidden /> : <Bookmark className="h-[22px] w-[22px]" aria-hidden />}
              label={saved ? "Saved" : "Save"}
              offLabel="Remove"
        ink={T.ink}
            />
            <StripButton
              on={rank >= 0}
              busy={lab.pending === `top3:${career.slug}`}
              pulse={saved && rank < 0 && lab.top3.length < 3}
              onClick={() => toggleTop3(career.slug, career.title)}
              ariaLabel={rank >= 0 ? `#${rank + 1} in your Top 3. Tap to take it out` : lab.top3.length >= 3 ? "Add to Top 3: your Top 3 is full, you will pick one to swap" : "Add to Top 3"}
              icon={<span className="flex h-[22px] w-[22px] items-center justify-center"><Top3Glyph on={rank >= 0} size={16} soft /></span>}
              label={rank >= 0 ? `#${rank + 1} in Top 3` : "Top 3"}
              offLabel="Take out"
        ink={T.ink}
            />
            {/* Connect with [World] Professionals, ported from the Replit
               reference; hidden when the world has no real pros. */}
            {hasWorldProfessionals && (
              <StripButton onClick={onConnect} ariaLabel="Connect with professionals" icon={<Users className="h-[22px] w-[22px]" aria-hidden />} label="Connect" ink={T.ink} />
            )}
          </div>
        </div>
      )}
      {/* One voice per moment (Chandu, 1 Oct 2026: "we have two doing
         the same job"). Before any action this line teaches what the
         buttons do; after one, the bottom bar confirms and the pulsing
         button is the next step. */}
      {ready && !saved && rank < 0 && (stack
        // in a sheet: centred under the spread strip, with room above it (Chandu, 8 Oct 2026)
        ? <div className="mt-[var(--space-2)]"><NextStep persist center ink={T.nudge} text="Save it to keep it. Your Top 3 comes from what you save." /></div>
        : <NextStep persist ink={T.nudge} text="Save it to keep it. Your Top 3 comes from what you save." />)}
    </>
  );
}
