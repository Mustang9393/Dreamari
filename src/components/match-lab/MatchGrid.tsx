"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, ChevronLeft, ChevronRight, GraduationCap, Info, Plus, Sparkles, X } from "lucide-react";
import { BorderBeam } from "border-beam";
import { BackButton } from "@/components/app/chrome";
import { FlowChrome } from "@/components/app/FlowChrome";
import { WelcomeSplash } from "@/components/app/WelcomeSplash";
import { announce } from "@/components/app/LiveRegion";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { ThemeProvider, useTheme } from "@/components/flow/theme/ThemeProvider";
import { bricolage } from "@/components/build/fonts";
import { playMilestoneChime } from "@/components/build/sound";
import { picksParam, writePicks } from "@/lib/picks";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { DECK, MAX_SLOTS, type Career } from "./data";

// ---------------------------------------------------------------------------
// THE Match experience (13 Sept 2026): started as an A/B experiment against
// the swipe deck (MatchLab.tsx, now dormant at /match-lab -- every entry
// point into Match points here instead). A grid, not a swipe deck: every
// career is visible at once, so a student who commits to a Top 3 early
// never loses sight of the other five the way a finished swipe deck can
// bury them. Selecting is a corner control; tapping the card itself opens a
// short, decision-focused detail (What You'd Do / Good Fit If You Like /
// School & Path -- see DetailModal below), morphing straight out of the
// card via a shared layoutId so opening it feels like the card itself
// expanding, not a new screen replacing it. Reuses the same DECK data and
// the same picks handoff into Profile that MatchLab always did.
// ---------------------------------------------------------------------------

const SUCCESS = "var(--color-feedback-success)";

export function MatchGrid() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Not a first-visit-only splash (direct instruction, 14 Sept 2026: "should
  // fire when I come to the match screen from anywhere") -- every arrival at
  // this screen, however a student got here, re-teaches the +/Learn more
  // interaction rather than showing it once per session.
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // announce()/dispatchAuroraPulse() run BEFORE the setState call that
  // follows them, matching MatchLab.tsx's like() -- calling announce() (or
  // never inside a setState updater, where it also isn't pure) after
  // setSelected tripped "Cannot update a component (LiveRegion) while
  // rendering a different component (MatchGrid)", since both dispatch a
  // synchronous window event another component's own setState reacts to.
  function toggle(id: string, origin?: { clientX: number; clientY: number }) {
    const title = DECK.find((c) => c.id === id)?.title;
    if (selected.includes(id)) {
      const next = selected.filter((x) => x !== id);
      announce(`Removed ${title}. ${next.length} of ${MAX_SLOTS}.`);
      setSelected(next);
      return;
    }
    if (selected.length >= MAX_SLOTS) {
      setToast("Remove one first to add this career.");
      return;
    }
    const next = [...selected, id];
    dispatchAuroraPulse("select", origin);
    announce(next.length === MAX_SLOTS ? `Saved ${title}. Your Top 3 is complete.` : `Saved ${title}. ${next.length} of ${MAX_SLOTS}.`);
    setSelected(next);
    if (next.length === MAX_SLOTS) playMilestoneChime();
  }

  function finish() {
    if (selected.length === 0) return;
    dispatchAuroraPulse("cta");
    writePicks({ ids: selected, focus: null });
    setTimeout(() => router.push(`/profile?picks=${picksParam(selected)}&tab=top3&welcome=1`), 260);
  }

  const openCareer = DECK.find((c) => c.id === openId) ?? null;
  const openIndex = openCareer ? DECK.findIndex((c) => c.id === openCareer.id) : -1;

  return (
    <ThemeProvider>
      <div className="marketing-v2 themeable contents">
        <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
        <BackgroundSpace />
        <AuroraBackground accent="#2f6bf2" visitedAccents={[]} finale={selected.length >= MAX_SLOTS} lightning={false} />
        <FlowChrome />
        <WelcomeSplash surface="matchGrid" open={showIntro} onDone={() => setShowIntro(false)} />

        {/* Fixed to the viewport, not min-h-dvh -- every one of the 6 cards
           has to read as visible at once with zero scrolling (direct
           feedback, 12 Sept 2026), so the grid fills exactly the space
           between the header and the sticky bar instead of pushing the
           page taller than the screen. */}
        <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden px-4 pt-16 pb-24 sm:pt-[72px]" style={{ WebkitTapHighlightColor: "transparent" }}>
          <div className="flex min-h-0 w-full max-w-[880px] flex-1 flex-col">
            {/* ---- header ---- */}
            <div className="mb-1 flex flex-none items-center justify-between gap-3 px-1">
              <span className="flex flex-none items-center gap-2">
                <BackButton fallback="/flow" />
                <h1 className={`${bricolage.className} text-[17px] font-extrabold whitespace-nowrap uppercase text-[var(--color-night-foreground)] sm:text-[19px]`}>Find your Top 3</h1>
              </span>
              <span className="flex flex-none items-center gap-2">
                {/* A little more prominent than a muted status chip (direct
                   feedback, 14 Sept 2026): bigger dot, bolder/brighter
                   text, a stronger border -- this is the one number a
                   student should always be able to find at a glance. */}
                <span
                  className="flex flex-none items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold whitespace-nowrap text-[var(--color-night-foreground)] backdrop-blur"
                  style={{ background: "var(--color-glass-surface-raised)", borderColor: "color-mix(in srgb, var(--color-feedback-success) 40%, var(--color-glass-border-raised))" }}
                >
                  <span aria-hidden className="h-2 w-2 flex-none rounded-full" style={{ background: SUCCESS, boxShadow: `0 0 10px ${SUCCESS}` }} />
                  {selected.length} of {MAX_SLOTS}
                </span>
              </span>
            </div>
            <p className="mb-2.5 flex-none px-1 text-[12.5px] leading-[16px] font-medium text-[var(--color-night-muted-foreground)]">
              Tap a card to see details. Tap + to save it.
            </p>

            {/* ---- the grid: all 6, always visible, no scroll -- rows
               sized to fill whatever space is left (grid-rows-3/2 with
               Tailwind's built-in minmax(0,1fr) tracks), cards stretch to
               fill their cell instead of holding a fixed aspect ratio. ---- */}
            <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2.5 sm:grid-cols-3 sm:grid-rows-2 sm:gap-4">
              {DECK.map((career) => (
                <GridCard
                  key={career.id}
                  career={career}
                  rank={selected.indexOf(career.id) + 1}
                  onOpen={() => setOpenId(career.id)}
                  onToggle={(origin) => toggle(career.id, origin)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---- sticky continue bar ---- */}
        {/* No blur (direct feedback, 14 Sept 2026: "stuttering... Match
           grid etc" -- fixed + full-width + backdrop-blur-xl recomposites
           every scroll frame, permanently on screen, for a bar that was
           already 88% opaque and barely needed the blur to read solid). */}
        <div
          className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t px-4 py-3"
          style={{ background: "color-mix(in srgb, var(--color-night-background) 94%, transparent)", borderColor: "var(--color-glass-border)" }}
        >
          <div className="flex w-full max-w-[880px] items-center justify-between gap-3">
            <div className="flex flex-col gap-[2px]">
              <p className="text-[13px] leading-[17px] font-semibold text-[var(--color-night-muted-foreground)]">
                {selected.length === 0
                  ? "Save up to 3 careers to build your profile around."
                  : selected.length < MAX_SLOTS
                    ? `${selected.length} saved, add up to ${MAX_SLOTS - selected.length} more, or continue now.`
                    : "Your Top 3 is set."}
              </p>
              {/* Reassurance that picking isn't a commitment (direct
                 feedback, 16 Sept 2026, Slack), styled visibly as a
                 disclaimer -- smaller and more muted than the status
                 line above it, not competing with it. */}
              <p className="text-[11px] leading-[13px] font-medium text-[var(--color-night-muted-foreground)] opacity-60">
                You can change them anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={finish}
              disabled={selected.length === 0}
              className="flex min-h-[44px] flex-none cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] px-5 text-[14px] font-bold whitespace-nowrap text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--color-brand-500)" }}
            >
              Continue with {selected.length || "…"}
              <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            </button>
          </div>
        </div>

        {/* ---- toast: trying to add a 4th ---- */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-[var(--radius-md)] border px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap text-[var(--color-night-foreground)] shadow-lg backdrop-blur-xl"
              style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-border)" }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- detail modal: morphs out of the tapped card via layoutId ---- */}
        <AnimatePresence>
          {openCareer && (
            <DetailModal
              career={openCareer}
              selected={selected.includes(openCareer.id)}
              full={selected.length >= MAX_SLOTS}
              onToggle={() => toggle(openCareer.id)}
              onClose={() => setOpenId(null)}
              onPrev={openIndex > 0 ? () => setOpenId(DECK[openIndex - 1].id) : undefined}
              onNext={openIndex < DECK.length - 1 ? () => setOpenId(DECK[openIndex + 1].id) : undefined}
            />
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------- pieces ----

function GridCard({ career, rank, onOpen, onToggle }: { career: Career; rank: number; onOpen: () => void; onToggle: (origin?: { clientX: number; clientY: number }) => void }) {
  const isSelected = rank > 0;
  // career.color for warm hues (amber/business-money-office, orange/
  // building-construction) is a --color-world-* token deliberately DARKENED
  // in light mode so it clears 4.5:1 as small TEXT elsewhere on this card
  // (globals.css html.light: "amber-500 h41 s100 l30, 4.8:1 vs white").
  // That same darkened value read as a dull, muddy brown/olive outline here
  // -- no text sits directly on this border, so it only needs 3:1 non-text
  // contrast, with plenty of room to brighten (direct feedback, 16 Sept
  // 2026: "the amber is still a bad color... needs to be more bright/gold").
  // Deliberately NOT applied to the "+"/rank badge or the modal's CTA
  // button below, even though both also use career.color as a fill --
  // both carry white text/icons directly on top, where the muted value is
  // load-bearing for contrast, not a bug.
  const { theme } = useTheme();
  const cardAccent = theme === "light" ? `color-mix(in srgb, ${career.color} 100%, white 30%)` : career.color;
  // Same hover LANGUAGE as Explore's browse cards (PosterCard.tsx /
  // .poster-card in globals.css): lift, scale, the photo eases in, a dark
  // dim washes over it -- everything except OpenCue's center chevron,
  // which doesn't belong here (direct feedback, 12 Sept 2026: "without the
  // icon that shows up"). The MAGNITUDE is toned down from poster-card's
  // own -10px/1.09 though: that card lives in a horizontally-scrolling
  // rail with 24-57px between cards, so it can grow past its own box and
  // rely on z-index to read cleanly. This one sits in a packed 2x3/3x2
  // grid with only a 10-16px gap on every side, so the same magnitude
  // would visibly lap onto the neighboring card -- these smaller values
  // keep the total growth under half that gap (direct feedback, 12 Sept
  // 2026: "make sure no overlapping or clipping happens on hover"),
  // confirmed with getBoundingClientRect against the sibling cards' edges.
  // Framer Motion owns this element's transform for the layoutId morph
  // into the detail modal, so the lift/scale/shadow go through
  // whileHover rather than a plain CSS :hover rule, which framer's own
  // inline transform would just override. The photo zoom and dim wash
  // are plain elements framer doesn't touch, so those use ordinary
  // group-hover CSS, same mechanism as poster-card's own .poster-photo.
  const ringShadow = isSelected ? `0 0 0 2px color-mix(in srgb, ${cardAccent} 55%, transparent), ` : "";
  return (
    <motion.div
      layoutId={`match-card-${career.id}`}
      className="group relative h-full w-full min-h-0 cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left"
      style={{
        borderColor: isSelected ? cardAccent : "var(--color-glass-border)",
        boxShadow: isSelected ? `${ringShadow}0 14px 30px -14px rgba(0,0,0,0.6)` : "0 8px 20px -14px rgba(0,0,0,0.5)",
      }}
      whileTap={{ scale: 0.97 }}
      // `boxShadow` dropped from here (direct feedback, 15 Sept 2026:
      // "hover on the card animates really slow") -- box-shadow is a paint
      // property, so Framer was repainting it every frame of every hover
      // in/out on a card in a packed 6-card grid. `y`/`scale`/`zIndex` stay,
      // since those are transform/compositor-only and cheap.
      whileHover={{ y: -3, scale: 1.02, zIndex: 5 }}
      transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`Open ${career.title} details`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <Image
        src={career.photo}
        alt=""
        fill
        sizes="(max-width: 640px) 46vw, 280px"
        className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        draggable={false}
      />
      {/* Dim wash, same as poster-card's .poster-dim -- fades in on hover,
         no icon on top of it here. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100"
        style={{ background: "rgba(5,8,20,0.32)" }}
      />
      {/* Scrim + Learn more + title: one bottom-anchored flow now, not a
         separate fixed-offset floating badge (direct feedback, 14 Sept
         2026: hug the title, not the upper half of the card). The old
         version needed a different top offset per breakpoint to dodge a
         two-line title growing the scrim upward from underneath it; putting
         "Learn more" INSIDE this same flex column, right above the title,
         means it just moves with the title automatically, on whatever line
         count, with no per-breakpoint math and no collision risk -- and it
         always sits on the guaranteed-dark scrim rather than an
         unpredictable patch of photo. Also lighter on real vertical space
         (a phone's actual viewport is shorter than this preview once
         Safari/Chrome's own chrome is accounted for): nothing here needs
         its own reserved clearance anymore, it just adds one row to a
         block that was already there. */}
      <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end">
        <div
          className="flex flex-none flex-col items-center gap-1.5 px-2 pt-14 pb-3 text-center uppercase"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-night-background) 55%, transparent) 34%, color-mix(in srgb, var(--color-night-background) 82%, transparent) 60%, var(--color-night-background) 100%)",
          }}
        >
          {/* BorderBeam restored (direct feedback, 16 Sept 2026: "I never
             asked for [the static ring]... we had a subtle beam border
             thing on there") after briefly removing it for a real perf
             reason (15 Sept 2026: "loads slowly... even simple hover
             animates sluggishly" -- `active` runs its `filter:
             blur()+hue-rotate()` continuously on all 6 cards at once).
             Restored at the exact size/props it had before removal
             (`size="sm"` was already the smallest preset) -- an accepted,
             explicit tradeoff back toward that cost. normal-case overrides
             the parent's `uppercase` for this span only, undoing an
             all-caps regression a later redesign introduced on top of an
             earlier explicit "sentence case, not all-caps" decision
             (12 Sept 2026); the title/world-label below still want their
             own uppercase, so the parent class stays. */}
          <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4} strength={0.7} active>
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-[5px] text-[10.5px] font-semibold whitespace-nowrap normal-case backdrop-blur-md sm:gap-1.5 sm:px-3 sm:py-[6px] sm:text-[12px]"
              style={{
                background: "color-mix(in srgb, var(--color-night-background) 55%, transparent)",
                // was hardcoded white -- fine in dark mode (this scrim darkens
                // toward --color-night-background), illegible in light mode
                // (the same scrim LIGHTENS toward night-background there, so
                // white text landed on a near-white chip). night-foreground
                // flips the same direction the scrim does, in both themes.
                color: "var(--color-night-foreground)",
              }}
            >
              <Info className="h-3 w-3 flex-none sm:h-3.5 sm:w-3.5" strokeWidth={2.5} aria-hidden />
              Learn more
            </span>
          </BorderBeam>
          <p style={{ fontFamily: career.font, fontWeight: career.fontWeight, fontSize: 17, lineHeight: 1.15, letterSpacing: career.letterSpacing ?? "0.02em", color: "var(--color-night-foreground)" }}>
            {career.title}
          </p>
          <p className="text-[9px] font-semibold tracking-[0.06em]" style={{ color: career.color }}>
            {career.world}
          </p>
        </div>
      </div>
      {/* salary chip */}
      <span
        className="absolute top-2 left-2 z-[1] rounded-[var(--radius-sm)] border px-2 py-[3px] text-[10px] font-bold backdrop-blur-md"
        style={{ color: SUCCESS, borderColor: "var(--color-glass-border)", background: "color-mix(in srgb, var(--color-night-background) 78%, transparent)" }}
      >
        {career.salary}
      </span>
      {/* select control */}
      <button
        type="button"
        aria-pressed={isSelected}
        aria-label={isSelected ? `Remove ${career.title} from your Top 3` : `Add ${career.title} to your Top 3`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle({ clientX: e.clientX, clientY: e.clientY });
        }}
        className="absolute top-2 right-2 z-[2] flex size-8 cursor-pointer items-center justify-center rounded-full border-2 backdrop-blur-md transition-transform active:scale-90"
        style={{
          background: isSelected ? career.color : "color-mix(in srgb, var(--color-night-background) 55%, transparent)",
          borderColor: isSelected ? career.color : "rgba(255,255,255,0.5)",
        }}
      >
        {isSelected ? <span className="text-[13px] font-extrabold text-white">{rank}</span> : <Plus className="h-4 w-4 text-white" strokeWidth={2.75} aria-hidden />}
      </button>
    </motion.div>
  );
}

function DetailModal({
  career,
  selected,
  full,
  onToggle,
  onClose,
  onPrev,
  onNext,
}: {
  career: Career;
  selected: boolean;
  full: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{ background: "color-mix(in srgb, var(--color-night-background) 80%, transparent)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerUp={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${career.title} details`}
    >
      <motion.div
        layoutId={`match-card-${career.id}`}
        className="relative flex max-h-[92dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-[var(--radius-lg)] border"
        style={{ background: "var(--color-night-card)", borderColor: "var(--color-glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}
      >
        {/* close */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 z-[3] flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md"
          style={{ background: "color-mix(in srgb, var(--color-night-background) 55%, transparent)", borderColor: "rgba(255,255,255,0.4)" }}
        >
          <X className="h-4.5 w-4.5 text-white" aria-hidden />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none]">
          {/* hero: 4/3 -> 3/2 (direct feedback, 14 Sept 2026: shorten this
             without cropping the photo too much) -- a modest step, not
             16/9, since these are waist-up portraits and a much shorter
             crop starts losing heads. The rest of the height this modal
             needed to lose without scrolling comes from tightening spacing
             below, not from cropping further. object-top (direct feedback,
             14 Sept 2026: Private Equity/Software Engineer's heads were
             getting cropped): default object-cover crops evenly from both
             edges, so shortening the box also ate into the top of a
             portrait. Anchoring to the top means any crop this ratio still
             needs comes only from the bottom, below the subject. */}
          <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
            <Image src={career.photo} alt="" fill sizes="440px" className="object-cover object-top" draggable={false} priority />
            {/* prev/next through the deck without closing -- scoped to the
               hero image so top-1/2 centers on the photo, not the whole
               scrollable card (it used to drift onto "Career Breakdown"
               once the panel's total height exceeded the hero alone). */}
            {onPrev && (
              <button type="button" aria-label="Previous career" onClick={onPrev} className="absolute top-1/2 left-3 z-[2] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--color-night-background) 55%, transparent)", borderColor: "rgba(255,255,255,0.4)" }}>
                <ChevronLeft className="h-5 w-5 text-white" aria-hidden />
              </button>
            )}
            {onNext && (
              <button type="button" aria-label="Next career" onClick={onNext} className="absolute top-1/2 right-3 z-[2] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--color-night-background) 55%, transparent)", borderColor: "rgba(255,255,255,0.4)" }}>
                <ChevronRight className="h-5 w-5 text-white" aria-hidden />
              </button>
            )}
            {/* pr-14 keeps the salary chip clear of the close button, which
               floats above this row at the same corner. */}
            <div className="absolute inset-x-0 top-0 z-[1] flex items-start justify-between gap-2 p-4 pr-14">
              <span className="max-w-[55%] truncate rounded-[var(--radius-sm)] border px-2.5 py-1 text-[10.5px] font-semibold text-[var(--color-night-foreground)] backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--color-night-background) 80%, transparent)", borderColor: "var(--color-glass-border)" }}>
                {career.employers}
              </span>
              <span className="flex-none rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md" style={{ color: SUCCESS, borderColor: "var(--color-glass-border)", background: "color-mix(in srgb, var(--color-night-background) 80%, transparent)" }}>
                {career.salary}
              </span>
            </div>
            <div
              className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center gap-1.5 px-2 pt-12 pb-3 text-center uppercase"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-night-background) 50%, transparent) 30%, color-mix(in srgb, var(--color-night-background) 75%, transparent) 51%, var(--color-night-background) 100%)",
              }}
            >
              <p style={{ fontFamily: career.font, fontWeight: career.fontWeight, fontSize: 26, lineHeight: 1.15, letterSpacing: career.letterSpacing ?? "0.03em", color: "var(--color-night-foreground)" }}>
                {career.title}
              </p>
              <p className="text-[10.5px] font-semibold tracking-[0.06em]" style={{ color: career.color }}>
                {career.world}
              </p>
            </div>
          </div>

          {/* Three sections, always in this order, every career (direct
             instruction, 13 Sept 2026): this is a quick "is it worth a Top
             3 slot?" read, not the full Career Report -- that lives
             elsewhere for later. 8th-grade reading level, short bullets,
             nothing here that needs a second read. */}
          <div className="flex flex-col px-5 pt-4 pb-4" style={{ background: "var(--color-night-card)" }}>
            <BreakdownSection icon={<BookOpen className="h-4 w-4" />} label="What You'd Do">
              <BulletList items={career.whatYouDo} />
            </BreakdownSection>

            <BreakdownDivider />

            <BreakdownSection icon={<Sparkles className="h-4 w-4" />} label="Good Fit If You Like">
              <BulletList items={career.goodFitIf} />
            </BreakdownSection>

            <BreakdownDivider />

            <BreakdownSection icon={<GraduationCap className="h-4 w-4" />} label="School & Path">
              <BulletList items={career.schoolPath} />
            </BreakdownSection>
          </div>
        </div>

        {/* footer CTA */}
        <div className="flex-none border-t px-4 py-3" style={{ borderColor: "var(--color-glass-border)", background: "var(--color-night-card)" }}>
          <button
            type="button"
            onClick={onToggle}
            disabled={!selected && full}
            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] text-[15px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: selected ? "var(--color-feedback-danger, #dc2626)" : career.color }}
          >
            {selected ? (
              <>Remove from My Top 3</>
            ) : full ? (
              <>Your Top 3 is full</>
            ) : (
              <>
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Add to My Top 3
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BreakdownSection({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span aria-hidden className="flex-none text-white">{icon}</span>
        <h3 className="text-[15px] font-extrabold tracking-[-0.01em] text-[var(--color-night-foreground)]">{label}</h3>
      </div>
      <div className="mt-1.5 text-left">{children}</div>
    </section>
  );
}

function BreakdownDivider() {
  return <hr aria-hidden className="my-3 border-0" style={{ height: 1, background: "var(--color-glass-border)" }} />;
}

/** Every section is 2-3 short bullets, never a paragraph -- that's the whole
 * point of the simplified detail (direct instruction, 13 Sept 2026: "very
 * short bullet points that scan well on vertical screens"). One shared list
 * style so all three sections read as one system rather than three
 * differently-formatted blocks. Sized below the section heading (direct
 * feedback, 14 Sept 2026: headings should read first, bullets second). */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[13px] leading-[1.5] font-medium text-[var(--color-night-muted-foreground)]">
          <span aria-hidden className="mt-[8px] size-1 flex-none rounded-full" style={{ background: "var(--color-night-muted-foreground)" }} />
          {item}
        </li>
      ))}
    </ul>
  );
}
