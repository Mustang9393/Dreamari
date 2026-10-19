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
// `surface` follows the header or sheet's theme. Both use the same game
// row and unboxed utility toolbar, including their nudge and state styling.
// All handlers, saved/Top 3 state, undo/swap and nudges remain shared.

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, BookOpen, Play } from "lucide-react";
import { StripButton } from "@/components/app/ActionStrip";
import { AskProAction, Top3RankAction } from "@/components/app/actionIcons";
import { PROS } from "@/components/connect/data";
import { hasGlossary } from "@/components/glossary/data";
import { simulationFor } from "@/components/play/games";
import { toggleSave, toggleTop3, useLab } from "./labStore";
import { NextStep } from "./labUi";
import { WORLD_COLORS } from "@/components/app/worlds";

const DARK_INK = new Set(["Business & Finance", "Health & Medicine", "Building & Construction", "Food & Cooking", "Farming, Animals & Nature", "Science & Research"]);

export const careerButtonInk = (world: string) => DARK_INK.has(world) ? "#0b0d12" : "#fff";

type Tone = { fg: string; border: string; quiet: string; primary: string; skeleton: string; rule: string; ink?: string; nudge?: string };
const TONES: Record<"photo" | "card", Tone> = {
  photo: { fg: "#fff", border: "rgba(255,255,255,0.3)", quiet: "rgba(12,16,35,0.55)", primary: "color-mix(in srgb, var(--primary) 32%, rgba(12,16,35,0.6))", skeleton: "rgba(255,255,255,0.12)", rule: "rgba(255,255,255,0.14)" },
  card: { fg: "var(--foreground)", border: "var(--glass-border)", quiet: "var(--glass-surface-1)", primary: "color-mix(in srgb, var(--primary) 26%, var(--glass-surface-1))", skeleton: "var(--glass-surface-2)", rule: "var(--glass-border)", ink: "var(--foreground)", nudge: "var(--muted-foreground)" },
};

export function CareerHeaderActions({ career, onConnect, surface = "photo", stack = true, split = false, games = { play: true, glossary: true } }: { career: { slug: string; title: string; world: string }; onConnect: () => void; surface?: "photo" | "card"; stack?: boolean; /** a sheet footer: games at the left edge, the icons at the right */ split?: boolean; /** which game buttons show. Every career offers both today (8 Oct 2026: without a game they open the Play tab); a backend that hides missing games passes its own, and the row adapts. */ games?: { play: boolean; glossary: boolean } }) {
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
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  // the bright worlds take dark text on a filled button, the deeper ones white
  const ink = careerButtonInk(career.world);
  const saved = lab.saved.includes(career.slug);
  const rank = lab.top3.indexOf(career.slug);
  const gameCount = (games.play ? 1 : 0) + (games.glossary ? 1 : 0);
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
         evenly spaced on one line at any width.
         11 Oct 2026: the page is back on that one row (an 8 Oct pass had
         put it on the sheet's stacked layout, stretching every button across
         the card). The row is built left to right with fixed gaps, never
         pinned to both edges, so a career with no games, one game, or no
         pros (Ask a pro hidden) still reads as one tidy line. In a sheet
         (`split`) the row is a footer bar, so the games take the left edge
         and the icons the right, the usual dialog footer (Chandu: "in the
         pop modals, the games can be left and the action icons can be
         aligned right"). */}
      {!ready ? (
        <div className="mt-[var(--space-1)] flex gap-[var(--space-3)]">{[150, 108, 110].map((w) => <span key={w} aria-hidden className="h-[44px] animate-pulse rounded-[var(--radius-md)]" style={{ width: w, background: T.skeleton }} />)}</div>
      ) : (
        <div className={`mt-[var(--space-1)] flex flex-col gap-[var(--space-3)] ${stack ? "cpk-career-actions" : `cpk-row md:flex-row md:flex-wrap md:items-center md:gap-x-[var(--space-5)] ${split ? "is-split" : ""}`} ${surface === "photo" ? "on-dark-media" : ""}`} style={{ textShadow: "none", "--cpk-world": accent } as CSSProperties}>
          {/* Play and Glossary Game on every career (8 Oct 2026, Chandu: "make
             sure we have a colourful play button and play and glossary
             buttons for every career even if we don't have the actual games
             for them. For careers that don't have them just make the button
             take them to the play tab", and "show the colours just like the
             dreamonna app"): Play is filled in the career's world colour
             with that colour's glow under it, Glossary Game is outlined in
             it. Without the game, both open Play. The two always share one width:
             Play is never the smaller one (Chandu, 8 Oct 2026). */}
          {gameCount > 0 && (
          <div role="group" aria-label="Try it" className={`cpk-games grid gap-[var(--space-2)] ${gameCount === 2 ? "grid-cols-2" : "grid-cols-1"} ${stack ? "cpk-game-actions" : `md:w-max ${gameCount === 2 ? "md:[grid-template-columns:repeat(2,1fr)]" : "md:min-w-[160px]"}`}`}>
            {games.play && (
            <button
              type="button"
              // the Play page with this game picked, never straight into the
              // game (14 Oct 2026, Chandu: "let's make the play button go to
              // the play page instead of directly into the game for the demo")
              onClick={() => router.push(hasSimulation ? `/play?focus=${encodeURIComponent(simulationFor(career.slug)?.id ?? career.slug)}` : "/play")}
              // The world's BRIGHT fill in both themes (9 Oct 2026, Chandu: "light
              // mode amber ... on a darker image or background is bad, we need
              // that same yellow-gradient thing we used for the career simulation
              // in IB"). `on-dark-media` puts the dark-theme world colours back on
              // this button in light mode, and the fill is the simulation's own
              // gradient (app.css, .play-career-world). A fill carries dark ink, so
              // it never needs the text-safe dark rung that read as mud.
              className={`career-play-cta on-dark-media dm-solid flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[18px] text-[14px] font-bold ${stack ? "max-[480px]:px-2 max-[480px]:whitespace-normal" : "whitespace-nowrap"}`}
              style={{ "--career-play": accent, borderColor: "transparent", color: ink, boxShadow: `0 12px 26px -12px color-mix(in srgb, ${accent} 85%, transparent)` } as CSSProperties}
            >
              {/* ▶ Play, the same words and glyph as every simulation button (3 Oct 2026) */}
              <Play className="h-[14px] w-[14px]" fill="currentColor" aria-hidden /> Play
            </button>
            )}
            {games.glossary && (
            <button
              type="button"
              onClick={() => router.push(hasGlossaryGame ? `/play/glossary/${career.slug}` : "/play")}
              data-secondary-game
              className={`dm-quiet flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[16px] text-[14px] font-semibold ${stack ? "max-[480px]:px-2 max-[480px]:whitespace-normal" : "whitespace-nowrap"}`}
              style={{ borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`, background: `color-mix(in srgb, ${accent} 12%, ${T.quiet})`, color: T.fg }}
            >
              <BookOpen className="h-4 w-4" aria-hidden style={{ color: accent }} /> Glossary Game
            </button>
            )}
          </div>
          )}
          <div role="group" aria-label="Keep it, or ask a pro" className={`cpk-icons grid gap-[var(--space-2)] ${stack ? "cpk-action-toolbar" : "cpk-action-toolbar md:flex md:!w-auto md:gap-[var(--space-1)]"} ${hasWorldProfessionals ? "grid-cols-3" : "grid-cols-2"}`}>
            <StripButton
              on={saved}
              busy={lab.pending === `save:${career.slug}`}
              pulse={!saved && rank < 0}
              onClick={() => toggleSave(career.slug, career.title)}
              ariaLabel={saved ? "Saved. Tap to remove from Saved" : "Save"}
              // Keep visible labels with familiar action icons. Sheets use
              // the same full-width quiet row on sheets and detail pages.
              icon={saved ? <BookmarkCheck className="h-[20px] w-[20px]" fill="currentColor" fillOpacity={0.35} aria-hidden /> : <Bookmark className="h-[20px] w-[20px]" aria-hidden />}
              label={saved ? "Saved" : "Save"}
              offLabel="Remove"
              ink={T.ink}
              toolbar
            />
            <StripButton
              on={rank >= 0}
              busy={lab.pending === `top3:${career.slug}`}
              pulse={saved && rank < 0 && lab.top3.length < 3}
              onClick={() => toggleTop3(career.slug, career.title)}
              ariaLabel={rank >= 0 ? `#${rank + 1} in your Top 3. Tap to take it out` : lab.top3.length >= 3 ? "Add to Top 3: your Top 3 is full, you will pick one to swap" : "Add to Top 3"}
              icon={<Top3RankAction on={rank >= 0} size={24} className="cpk-action-icon" />}
              offIcon={<Top3RankAction on size={24} className="cpk-action-icon" />}
              label={rank >= 0 ? `#${rank + 1} in Top 3` : "Top 3"}
              offLabel="Take out"
              ink={T.ink}
              toolbar
            />
            {/* Connect with [World] Professionals, ported from the Replit
               reference; hidden when the world has no real pros. */}
            {hasWorldProfessionals && (
              <StripButton onClick={onConnect} ariaLabel="Ask a professional" icon={<AskProAction size={24} className="cpk-action-icon" />} label="Ask a pro" ink={T.ink} toolbar />
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
        : <div className="mt-[var(--space-3)]"><NextStep persist ink={T.nudge} text="Save it to keep it. Your Top 3 comes from what you save." /></div>)}
    </>
  );
}
