"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, ChevronLeft, ChevronRight, GraduationCap, Laptop, Plus, Sparkles, Wrench, X } from "lucide-react";
import { BackButton } from "@/components/app/chrome";
import { FlowChrome } from "@/components/app/FlowChrome";
import { announce } from "@/components/app/LiveRegion";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { bricolage } from "@/components/build/fonts";
import { playMilestoneChime } from "@/components/build/sound";
import { picksParam, writePicks } from "@/lib/picks";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { DECK, MAX_SLOTS, type Career } from "./data";
import { MatchVersionToggle } from "./VersionToggle";

// ---------------------------------------------------------------------------
// EXPERIMENT (11 Sept 2026, not wired into the real flow, no push): a grid
// instead of a swipe deck. Everyone is visible at once and every career's
// full breakdown is a tap away, so a student who commits to a Top 3 early
// never loses sight of the other five the way a finished swipe deck can bury
// them. Selecting is a corner control; tapping the card itself opens the
// same "Career Breakdown" the swipe deck reveals on scroll (Daily Work,
// Skills & Subjects, Work Style, Pathway Fit, Future Tradeoff), morphing
// straight out of the card via a shared layoutId so opening a detail feels
// like the card itself expanding, not a new screen replacing it. Reuses the
// same DECK data and the same picks handoff into Profile as the real
// MatchLab, so this is a genuine drop-in alternative, not a mockup.
// ---------------------------------------------------------------------------

const SUCCESS = "var(--color-feedback-success)";

export function MatchGrid() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
              {/* The A/B toggle sits beside the counter chip, not on its own
                 row -- this page has zero spare vertical room (it's tuned to
                 fit the viewport with no scroll), so any new row would bring
                 the scrollbar straight back. */}
              <span className="flex flex-none items-center gap-2">
                <MatchVersionToggle current="B" />
                <span
                  className="flex flex-none items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-[var(--color-night-muted-foreground)] backdrop-blur"
                  style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" }}
                >
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: SUCCESS, boxShadow: `0 0 8px ${SUCCESS}` }} />
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
        <div
          className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t px-4 py-3 backdrop-blur-xl"
          style={{ background: "color-mix(in srgb, var(--color-night-background) 88%, transparent)", borderColor: "var(--color-glass-border)" }}
        >
          <div className="flex w-full max-w-[880px] items-center justify-between gap-3">
            <p className="text-[13px] leading-[17px] font-semibold text-[var(--color-night-muted-foreground)]">
              {selected.length === 0
                ? "Save up to 3 careers to build your profile around."
                : selected.length < MAX_SLOTS
                  ? `${selected.length} saved — add up to ${MAX_SLOTS - selected.length} more, or continue now.`
                  : "Your Top 3 is set."}
            </p>
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
  // Same hover as Explore's own cards (app.css .dm-tap): a 1px lift and a
  // tight shadow, no scale -- done via whileHover rather than the CSS class
  // itself, since Framer Motion already owns this element's transform for
  // whileTap and would fight a plain CSS :hover transform. The selection
  // ring (the ring around a picked card) has to survive into the hover
  // shadow too, or hovering a selected card would flash it away.
  const ringShadow = isSelected ? `0 0 0 2px color-mix(in srgb, ${career.color} 55%, transparent), ` : "";
  return (
    <motion.div
      layoutId={`match-card-${career.id}`}
      className="relative h-full w-full min-h-0 cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left"
      style={{
        borderColor: isSelected ? career.color : "var(--color-glass-border)",
        boxShadow: isSelected ? `${ringShadow}0 14px 30px -14px rgba(0,0,0,0.6)` : "0 8px 20px -14px rgba(0,0,0,0.5)",
      }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1, boxShadow: `${ringShadow}0 6px 16px -12px rgba(0,0,0,0.85)` }}
      transition={{ duration: 0.16, ease: "easeOut" }}
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
      <Image src={career.photo} alt="" fill sizes="(max-width: 640px) 46vw, 280px" className="object-cover" draggable={false} />
      {/* Scrim + title: a normal flex child sized by its own content (not
         a fixed reserve), so it's exactly as tall as the actual title
         needs -- it grows upward from the bottom when the title wraps to
         two lines, and sits flush above the world label otherwise, with
         no leftover gap on a one-line title (direct feedback, 12 Sept
         2026). This column holds ONLY the scrim now; "Learn more" below
         is deliberately a separate, independently-centered layer -- see
         its own comment for why. */}
      <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end">
        <div
          className="flex flex-none flex-col items-center gap-1 px-2 pt-14 pb-3 text-center uppercase"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-night-background) 55%, transparent) 34%, color-mix(in srgb, var(--color-night-background) 82%, transparent) 60%, var(--color-night-background) 100%)",
          }}
        >
          <p style={{ fontFamily: career.font, fontWeight: career.fontWeight, fontSize: 17, lineHeight: 1.15, letterSpacing: career.letterSpacing ?? "0.02em", color: "var(--color-night-foreground)" }}>
            {career.title}
          </p>
          <p className="text-[9px] font-semibold tracking-[0.06em]" style={{ color: career.color }}>
            {career.world}
          </p>
        </div>
      </div>
      {/* "Learn more" needs a DIFFERENT anchor per breakpoint -- the grid
         itself changes shape (2 cols x 3 rows on mobile, 3 cols x 2 rows
         from sm up), so a mobile card is much shorter, relative to its
         width, than a desktop one. One fixed value can't read right on
         both: a top offset small enough to clear a two-line title on a
         short real-phone card (screenshotted, direct feedback, 12 Sept
         2026) sits awkwardly close to the top row on a desktop card
         that's twice as tall. Below sm: a fixed distance from the top
         edge, decoupled entirely from the scrim (which is bottom-anchored
         and grows upward when a title wraps), so it can't collide with a
         two-line title regardless of how tall that makes the scrim. At sm
         and up, where the card has real height to spare, dead center
         reads fine (confirmed on desktop before this mobile-specific
         issue came up) and stays a single fixed point either way -- unlike
         centering in the gap between the top chips and the scrim, tried
         first, which shifted per-card since that gap shrinks on a
         two-line title. z-[2] keeps it above the scrim regardless. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-11 left-1/2 z-[2] -translate-x-1/2 rounded-[var(--radius-sm)] px-1.5 py-[2px] text-[8px] font-semibold whitespace-nowrap backdrop-blur-md sm:top-1/2 sm:-translate-y-1/2 sm:px-2 sm:py-[3px] sm:text-[9px]"
        style={{ background: "color-mix(in srgb, var(--color-night-background) 45%, transparent)", color: "rgba(255,255,255,0.92)" }}
      >
        Learn more
      </span>
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
          {/* hero */}
          <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
            <Image src={career.photo} alt="" fill sizes="440px" className="object-cover" draggable={false} priority />
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
              className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center gap-1.5 px-2 pt-16 pb-4 text-center uppercase"
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

          {/* breakdown */}
          <div className="flex flex-col px-5 pt-5 pb-6" style={{ background: "var(--color-night-card)" }}>
            <p className={`${bricolage.className} mb-4 text-[11px] font-bold tracking-[0.12em] text-[var(--color-night-muted-foreground)] uppercase`}>Career Breakdown</p>

            <BreakdownSection icon={<BookOpen className="h-4 w-4" />} color={career.color} label="Daily Work">
              <p className="text-[15px] leading-[1.55] font-semibold text-[var(--color-night-foreground)]">{career.hook}</p>
            </BreakdownSection>

            <BreakdownDivider />

            <BreakdownSection icon={<Wrench className="h-4 w-4" />} color={career.color} label="Skills & Subjects">
              <p className="text-[14px] leading-[1.6] font-medium text-[var(--color-night-foreground)]">{career.skills}</p>
              <p className="mt-2.5 text-[9.5px] font-bold tracking-[0.1em] text-[var(--color-night-muted-foreground)] uppercase">Classes that help</p>
              <p className="mt-1 text-[12.5px] leading-[1.55] font-medium text-[var(--color-night-muted-foreground)]">{career.classes}</p>
            </BreakdownSection>

            <BreakdownDivider />

            <BreakdownSection icon={<Laptop className="h-4 w-4" />} color={career.color} label="Work Style">
              <p className="text-[14px] leading-[1.6] font-medium text-[var(--color-night-foreground)]">{career.workStyle}</p>
            </BreakdownSection>

            <BreakdownDivider />

            <BreakdownSection icon={<GraduationCap className="h-4 w-4" />} color={career.color} label="Pathway Fit">
              <p className="text-[14px] leading-[1.6] font-medium text-[var(--color-night-foreground)]">{career.pathway}</p>
            </BreakdownSection>

            <BreakdownDivider />

            <BreakdownSection icon={<Sparkles className="h-4 w-4" />} color={career.color} label="Future Tradeoff">
              <p className="text-[13.5px] leading-[1.6] font-medium text-[var(--color-night-foreground)] italic" style={{ borderLeft: `3px solid color-mix(in srgb, ${career.color} 65%, transparent)`, paddingLeft: 12 }}>
                {career.tradeoff}
              </p>
            </BreakdownSection>
          </div>
        </div>

        {/* footer CTA */}
        <div className="flex-none border-t p-4" style={{ borderColor: "var(--color-glass-border)", background: "var(--color-night-card)" }}>
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

function BreakdownSection({ icon, color, label, children }: { icon: React.ReactNode; color: string; label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span aria-hidden className="flex-none" style={{ color }}>
          {icon}
        </span>
        <h3 className="text-[10.5px] font-bold tracking-[0.12em] text-[var(--color-night-muted-foreground)] uppercase">{label}</h3>
      </div>
      <div className="mt-2 text-left">{children}</div>
    </section>
  );
}

function BreakdownDivider() {
  return <hr aria-hidden className="my-4 border-0" style={{ height: 1, background: "var(--color-glass-border)" }} />;
}
