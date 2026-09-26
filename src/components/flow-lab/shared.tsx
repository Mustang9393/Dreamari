"use client";

// DEMO-ONLY: pieces the Flow Lab's screens share. Every screen follows the
// live Match screen's visual language: a one-line header row with a status
// chip, a card grid, a sticky bottom bar, an in-place detail modal. No
// instructional pop-ups anywhere (direct feedback, 25 Sept 2026: "as a
// general design/architecture rule across Dreamari, I want to avoid
// instructional pop-ups unless absolutely necessary... the interface itself
// should make the next action obvious through copy, hierarchy, and
// placement"). 26 Sept 2026: no hint lines either. Each screen teaches
// itself through its own controls: the title states the task, the Save
// control says "Save", the bottom tray's empty slots show the limit, the
// CTA says what it is waiting for ("Save 2 more"), and the rank screen's
// three empty slots show how ranking works.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Bookmark, BookOpen, Check, ChevronLeft, ChevronRight, GraduationCap, ImageOff, Info, Plus, Sparkles, X } from "lucide-react";
import { BorderBeam } from "border-beam";
import { IconTip } from "@/components/app/IconTip";
import { Working } from "@/components/app/Working";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { matchDetail, REVEAL_STEP, type LabCareer, WORLDS } from "./lab";

export const CARD = { background: "var(--card)", borderColor: "var(--glass-border)" } as const;
const SUCCESS = "var(--color-feedback-success)";
export const PAGE = 6;

/** What the (i) says about the screen that is open right now: the screen
 *  registers it, FlowLab shows it above the version note (direct
 *  instruction, 25 Sept 2026: "make sure the info notes are updated to be
 *  relevant to each screen and their actions too"). */
export type ScreenNote = { heading: string; bullets: string[] };
export const LabInfoContext = createContext<(note: ScreenNote | null) => void>(() => {});
/** The fixed app header's height (py-3 around a 36px row). */
export const HEADER_H = 60;
const FROST = { background: "color-mix(in srgb, var(--glass-surface-2) 70%, color-mix(in srgb, var(--background) 45%, transparent))", backdropFilter: "blur(20px) saturate(1.6)", WebkitBackdropFilter: "blur(20px) saturate(1.6)" } as const;

// ---------------------------------------------------------------- layout ----

/** Match's header language: a one-line title row with a status chip, a
 *  persistent hint line (this replaces any coachmark or pop-up -- the copy
 *  itself has to teach the screen), an optional control row, then whatever
 *  fills the rest.
 *
 *  Two layouts: the default is viewport-locked (no scroll) for screens that
 *  must never crop -- the Build questions, Saved, Rank, Top 3. `scrollable`
 *  is for Mini Explore, which now grows with the page instead of paging
 *  through a carousel (direct feedback, 25 Sept 2026: "make this work more
 *  like Netflix/YouTube... browsing should feel continuous"): the header
 *  and world tabs stay sticky under the app's own fixed top bar while the
 *  card grid below scrolls the ordinary way. */
export function LabScreen({ title, status, hint, controls, note, scrollable = false, children }: { title: string; status?: string; hint?: string; controls?: ReactNode; note?: ScreenNote; scrollable?: boolean; children: ReactNode }) {
  const setNote = useContext(LabInfoContext);

  const noteKey = JSON.stringify(note ?? null);
  useEffect(() => {
    setNote(note ?? null);
    return () => setNote(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compared by content; the object is rebuilt every render
  }, [noteKey, setNote]);
  const header = (
    <>
      <div className="mb-1 flex flex-none items-center justify-between gap-3 px-1">
        <h1 className="text-[17px] font-extrabold whitespace-nowrap uppercase sm:text-[19px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h1>
        {status && (
          <span className="flex flex-none items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold whitespace-nowrap backdrop-blur" style={{ color: "var(--foreground)", background: "var(--glass-surface-2)", borderColor: `color-mix(in srgb, ${SUCCESS} 40%, var(--glass-border))` }}>
            <span aria-hidden className="h-2 w-2 flex-none rounded-full" style={{ background: SUCCESS, boxShadow: `0 0 10px ${SUCCESS}` }} />
            {status}
          </span>
        )}
      </div>
      {hint && <p className="mb-2.5 flex-none px-1 text-[12.5px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{hint}</p>}
      {controls && <div className="mb-2.5 flex flex-none flex-col gap-2 px-1">{controls}</div>}
    </>
  );
  if (scrollable) {
    // A genuinely full-bleed sticky bar (`w-full`, no side padding of its
    // own) with its content re-centered to the same 880px column inside it
    // -- the same shape DesktopNavigation uses for the site's own top nav.
    // Card content sits right up against this bar from the very first
    // scroll pixel here (no hero, no breathing room above the grid), so it
    // is always frosted rather than fading in on scroll: a bar that is
    // sometimes transparent right over dense photos is the exact
    // "scrolling things visible through the header" complaint, and a
    // narrower bar constrained to the content column (a negative-margin
    // trick tried first) reads as a floating slab with hard side edges
    // instead of a real header (direct feedback, 25 Sept 2026: "ugly...
    // breaking the header treatment"). Same background/blur formula as
    // FlowLab's own fixed app header immediately above it, and no box
    // shadow of its own, so together they read as one continuous frosted
    // band with a single soft edge at the very bottom, not two stacked
    // bars with a seam.
    return (
      // No bands (26 Sept 2026: "I really don't like these black borders on
      // header and footer... is there no other way?"). The title scrolls
      // away with the page; only the world tabs stay, pinned as a floating
      // glass pill under the header's buttons. FlowLab draws a soft
      // gradient fade behind those buttons instead of a bar.
      <section className="relative z-10 flex w-full flex-col items-center pt-16 pb-28 sm:pt-[72px]" style={{ WebkitTapHighlightColor: "transparent" }}>
        <div className="flex w-full max-w-[880px] flex-col px-4 sm:px-6">
          <div className="mb-1 flex items-center justify-between gap-3 px-1">
            <h1 className="text-[17px] font-extrabold whitespace-nowrap uppercase sm:text-[19px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h1>
          </div>
          {hint && <p className="mb-2.5 px-1 text-[12.5px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{hint}</p>}
        </div>
        {controls && (
          <div className="sticky z-10 mb-3 flex w-full max-w-[880px] px-4 sm:px-6" style={{ top: HEADER_H + 4 }}>
            <div className="flex w-fit max-w-full flex-col gap-2 rounded-[calc(var(--radius-lg)+4px)] border p-1.5" style={{ ...FROST, borderColor: "var(--glass-border)", boxShadow: "0 10px 30px -12px rgba(0,0,0,0.55)" }}>{controls}</div>
          </div>
        )}
        <div className="flex w-full max-w-[880px] flex-col px-4 sm:px-6">{children}</div>
      </section>
    );
  }
  return (
    <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden px-4 pt-16 pb-24 sm:pt-[72px]" style={{ WebkitTapHighlightColor: "transparent" }}>
      <div className="flex min-h-0 w-full max-w-[880px] flex-1 flex-col">
        {header}
        {children}
      </div>
    </section>
  );
}

/** Match's sticky bar: one status line left, one CTA right. */
export function BottomBar({ status, cta, onCta, ctaDisabled, left }: { status?: ReactNode; cta: string; onCta: () => void; ctaDisabled?: boolean; left?: ReactNode }) {
  return (
    // A floating glass capsule, not a full-width bar (direct feedback, 26
    // Sept 2026: "I really don't like these black borders on header and
    // footer"): content scrolls under and around it, like a dock.
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 sm:bottom-5">
      <div className="pointer-events-auto flex w-full max-w-[880px] items-center justify-between gap-3 rounded-full border py-2 pr-2 pl-3 sm:pl-4" style={{ ...FROST, borderColor: "var(--glass-border)", boxShadow: "0 18px 40px -14px rgba(0,0,0,0.6)" }}>
        <div className="flex min-w-0 items-center gap-2">
          {left}
          {typeof status === "string" ? <p className="truncate text-[13px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{status}</p> : status}
        </div>
        <button type="button" onClick={onCta} disabled={ctaDisabled} className="flex min-h-[44px] flex-none cursor-pointer items-center gap-1.5 rounded-full px-5 text-[14px] font-bold whitespace-nowrap text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40" style={{ background: "var(--color-brand-500)" }}>
          {cta} <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function Toast({ text, low = false }: { text: string | null; /** a screen with no bottom bar: sit at the bottom edge */ low?: boolean }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`fixed ${low ? "bottom-6" : "bottom-24"} left-1/2 z-40 -translate-x-1/2 rounded-[var(--radius-md)] border px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-xl`} style={{ color: "var(--foreground)", background: "var(--glass-surface-3)", borderColor: "var(--glass-border)" }}>
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-5 text-[14px] font-bold whitespace-nowrap text-white disabled:cursor-not-allowed disabled:opacity-40" style={{ background: "var(--color-brand-500)" }}>
      {children}
    </button>
  );
}
export function QuietButton({ children, onClick, disabled, ariaLabel }: { children: ReactNode; onClick: () => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} disabled={disabled} className="dm-quiet flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-md)] border px-4 text-[13px] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      {children}
    </button>
  );
}

export function ChipRow<T extends string>({ options, value, max, onChange, ariaLabel, small = false }: { options: { key: T; label: string }[]; value: T[]; max: number; onChange: (next: T[]) => void; ariaLabel: string; small?: boolean }) {
  const toggle = (key: T) => {
    if (value.includes(key)) onChange(value.filter((v) => v !== key));
    else if (max === 1) onChange([key]);
    else if (value.length < max) onChange([...value, key]);
  };
  return (
    <div className="flex flex-wrap gap-[6px]" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const on = value.includes(o.key);
        const full = !on && max > 1 && value.length >= max;
        return (
          <button key={o.key} type="button" aria-pressed={on} disabled={full} onClick={() => toggle(o.key)} className={`dm-quiet cursor-pointer rounded-full border font-bold disabled:cursor-not-allowed disabled:opacity-40 ${small ? "px-[10px] py-[5px] text-[12px]" : "px-[13px] py-[7px] text-[13px]"}`} style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: "var(--foreground)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
export function InterestPicker({ value, max, onChange }: { value: string[]; max: number; onChange: (next: string[]) => void }) {
  return <ChipRow ariaLabel="Worlds" options={WORLDS.map((w) => ({ key: w.label, label: w.label }))} value={value} max={max} onChange={onChange} />;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[8px]">
      <h2 className="text-[13px] font-extrabold tracking-[0.04em] uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>{label}</h2>
      {children}
    </section>
  );
}

// ------------------------------------------------------------------ card ----

function LabPhoto({ career, sizes, className }: { career: LabCareer; sizes: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    const worldColor = WORLD_COLORS[career.world] ?? "var(--muted-foreground)";
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(155deg, color-mix(in srgb, ${worldColor} 30%, var(--card)) 0%, var(--card) 100%)` }}>
        <ImageOff className="h-6 w-6" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </div>
    );
  }
  return <Image src={career.photo} alt="" fill sizes={sizes} draggable={false} onError={() => setFailed(true)} className={className} />;
}

export type LabControl = "save" | "pick" | "rank";

/** The live Match card's language on catalog data: world title face,
 *  world-coloured label, a chip row (the one reason it is here, and the
 *  salary when we have one), the BorderBeam "Learn more", and the control
 *  INSIDE the card. Card click opens the detail modal; the control toggles.
 *  `fill` stretches to a grid cell (Match's six-up); otherwise the poster
 *  ratio. */
export function LabCard({ career, control, selected, rank, onToggle, onOpen, reason, fill = false, nudge = false, className = "" }: {
  career: LabCareer;
  control: LabControl;
  selected: boolean;
  rank?: number;
  onToggle?: () => void;
  onOpen?: () => void;
  reason?: string | null;
  fill?: boolean;
  /** a soft pulse on the Save control, used on the first card until the
   *  student's first save: motion, not a pop-up */
  nudge?: boolean;
  className?: string;
}) {
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  // Median pay on the card itself (26 Sept 2026: "we can show median salary
  // on these match cards too"), from the same sources the detail modal
  // uses, shortened to "$98K".
  const pay = shortPay(career.salary ?? matchDetail(career).salary);
  const label = control === "save" ? (selected ? `Unsave ${career.title}` : `Save ${career.title}`) : control === "pick" ? (selected ? `Remove ${career.title} from your Top 3` : `Add ${career.title} to your Top 3`) : `#${rank} ${career.title}`;
  const tip = control === "save" ? (selected ? "Unsave" : "Save") : control === "pick" ? (selected ? "Remove from Top 3" : "Add to Top 3") : `#${rank}`;
  // Save is a labeled pill, not a bare bookmark (26 Sept 2026): with no
  // coachmarks, the control has to say what it does.
  // The nudge is a soft ripple of light from the pill's edge (a spreading
  // box-shadow), ~7px, inside the pill's 8px inset so the card's edge never
  // clips it (direct feedback, 26 Sept 2026: "the pulse on the save
  // button... I liked that. It was just getting clipped"; a scaling ring
  // tried next "animated really weirdly").
  const pulse = nudge && !selected;
  const controlEl = control === "save" ? (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
      animate={pulse ? { boxShadow: ["0 0 0 0px rgba(255,255,255,0.55)", "0 0 0 7px rgba(255,255,255,0)", "0 0 0 7px rgba(255,255,255,0)"] } : { boxShadow: "0 0 0 0px rgba(255,255,255,0)" }}
      transition={pulse ? { duration: 2, times: [0, 0.6, 1], repeat: Infinity, ease: "easeOut" } : { duration: 0.2 }}
      className="relative flex h-8 cursor-pointer items-center gap-1 rounded-full border-2 px-2.5 text-[12px] font-bold text-white backdrop-blur-md transition-transform active:scale-90"
      style={{ background: selected ? accent : "color-mix(in srgb, var(--background) 60%, transparent)", borderColor: selected ? accent : "rgba(255,255,255,0.55)" }}
    >
      {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <Bookmark className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
      {selected ? "Saved" : "Save"}
    </motion.button>
  ) : control === "rank" ? (
    <span aria-label={label} className="flex size-8 items-center justify-center rounded-full border-2 text-[13px] font-extrabold text-white" style={{ background: accent, borderColor: accent }}>{rank}</span>
  ) : (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
      className="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 backdrop-blur-md transition-transform active:scale-90"
      style={{ background: selected ? accent : "color-mix(in srgb, var(--background) 55%, transparent)", borderColor: selected ? accent : "rgba(255,255,255,0.5)" }}
    >
      {control === "pick" && selected ? <span className="text-[13px] font-extrabold text-white">{rank}</span> : control === "pick" ? <Plus className="h-4 w-4 text-white" strokeWidth={2.75} aria-hidden /> : <Bookmark className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden fill={selected ? "currentColor" : "none"} />}
    </button>
  );
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${career.title} details`}
      onClick={onOpen}
      onKeyDown={(e) => { if (onOpen && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(); } }}
      className={`group relative ${fill ? "h-full min-h-0 w-full" : "aspect-[210/297] w-full"} cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left transition-[transform,box-shadow] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:z-[5] hover:-translate-y-[3px] hover:scale-[1.02] ${className}`}
      style={{
        borderColor: selected ? accent : "var(--glass-border)",
        boxShadow: selected ? `0 0 0 2px color-mix(in srgb, ${accent} 55%, transparent), 0 14px 30px -14px rgba(0,0,0,0.6)` : "0 8px 20px -14px rgba(0,0,0,0.5)",
      }}
    >
      <LabPhoto career={career} sizes="(max-width: 640px) 46vw, 300px" className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]" />
      <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100" style={{ background: "rgba(5,8,20,0.32)" }} />
      <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end">
        <div className="flex flex-none flex-col items-center gap-1.5 px-2 pt-14 pb-3 text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)" }}>
          <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4} strength={0.7} active>
            <span className="flex items-center gap-1 rounded-full px-2.5 py-[5px] text-[10.5px] font-semibold whitespace-nowrap normal-case backdrop-blur-md sm:gap-1.5 sm:px-3 sm:py-[6px] sm:text-[12px]" style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)", color: "var(--poster-title)" }}>
              <Info className="h-3 w-3 flex-none sm:h-3.5 sm:w-3.5" strokeWidth={2.5} aria-hidden />
              Learn more
            </span>
          </BorderBeam>
          <p className="line-clamp-3 [overflow-wrap:normal] [word-break:keep-all]" style={{ ...posterTitleFont(career.world), fontSize: 17, lineHeight: 1.15, color: "var(--poster-title)" }}>{career.title.replace(/-/g, "-​")}</p>
          <p className="text-[9px] font-semibold tracking-[0.06em]" style={{ fontFamily: "var(--font-body)", color: accent }}>{career.world}</p>
          {pay && <p className="text-[11.5px] font-bold normal-case tabular-nums" style={{ fontFamily: "var(--font-body)", color: SUCCESS }}>{pay} median</p>}
        </div>
      </div>
      <div className={`pointer-events-none absolute top-2 left-2 z-[1] flex flex-wrap gap-1 ${control === "save" ? "max-w-[calc(100%-96px)]" : "max-w-[calc(100%-56px)]"}`}>
        {reason && (
          <span className="truncate rounded-[var(--radius-sm)] border px-2 py-[3px] text-[10px] font-bold backdrop-blur-md" style={{ color: "var(--poster-title)", borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`, background: "color-mix(in srgb, var(--background) 78%, transparent)" }}>{reason}</span>
        )}

      </div>
      {control === "save" ? <span className="absolute top-2 right-2 z-[2]">{controlEl}</span> : <IconTip label={tip} className="absolute top-2 right-2 z-[2]">{controlEl}</IconTip>}
    </div>
  );
}

/** The bottom bar's saved tray: one slot per save allowed, filled with the
 *  saved career's photo. The empty slots ARE the "up to 7" rule, so no
 *  counter or hint line has to say it. */
export function PicksTray({ saved, max, onOpen }: { saved: LabCareer[]; max: number; onOpen?: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5" role="img" aria-label={`${saved.length} of ${max} saved`}>
      {Array.from({ length: max }, (_, i) => {
        const c = saved[i];
        return c ? (
          <motion.button
            key={c.id}
            type="button"
            aria-label={`Open ${c.title}`}
            onClick={() => onOpen?.(c.id)}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="relative size-7 flex-none cursor-pointer overflow-hidden rounded-full border-2 sm:size-8"
            style={{ borderColor: WORLD_COLORS[c.world] ?? "var(--primary)" }}
          >
            <LabPhoto career={c} sizes="32px" className="object-cover" />
          </motion.button>
        ) : (
          <span key={`empty-${i}`} aria-hidden className="size-7 flex-none rounded-full border-2 border-dashed sm:size-8" style={{ borderColor: "color-mix(in srgb, var(--foreground) 22%, transparent)" }} />
        );
      })}
    </div>
  );
}

/** The rank screen's three slots: #1, #2, #3 fill in the order cards are
 *  tapped, and tapping a filled slot clears it. The empty slots show how
 *  ranking works without a sentence explaining it. */
export function RankSlots({ picks, onClear, incoming, onSwap }: { picks: LabCareer[]; onClear: (id: string) => void; /** a fourth career tapped while all three slots are full */ incoming?: LabCareer | null; onSwap?: (outId: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {[0, 1, 2].map((i) => {
        const c = picks[i];
        const next = i === picks.length;
        return (
          <div key={i} className="relative">
            <AnimatePresence mode="popLayout">
              {c ? (
                <motion.button
                  key={c.id}
                  type="button"
                  aria-label={`#${i + 1} ${c.title}. Tap to clear`}
                  onClick={() => onClear(c.id)}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="group relative flex h-[68px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-[var(--radius-md)] border-2 p-1.5 pr-2 text-left sm:h-[76px]"
                  style={{ borderColor: WORLD_COLORS[c.world] ?? "var(--primary)", background: "var(--card)" }}
                >
                  <span className="relative aspect-[3/4] h-full flex-none overflow-hidden rounded-[var(--radius-sm)]"><LabPhoto career={c} sizes="56px" className="object-cover" /></span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[18px] leading-none font-extrabold" style={{ fontFamily: "var(--font-display)", color: WORLD_COLORS[c.world] ?? "var(--primary)" }}>#{i + 1}</span>
                    <span className="line-clamp-2 text-[11.5px] leading-[14px] font-bold" style={{ color: "var(--foreground)" }}>{c.title}</span>
                  </span>
                  <X className="absolute top-1.5 right-1.5 h-3.5 w-3.5 opacity-60 group-hover:opacity-100" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                </motion.button>
              ) : null}
            </AnimatePresence>
            {/* A fourth pick never hits a wall ("Remove one first" read as
               locked in): every slot becomes a swap target instead. */}
            {c && incoming && (
              <button type="button" aria-label={`Swap ${incoming.title} in as #${i + 1}`} onClick={() => onSwap?.(c.id)} className="absolute inset-0 z-[2] flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed" style={{ borderColor: "var(--primary)", background: "rgba(5,8,20,0.45)" }}>
                <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold text-white" style={{ background: "var(--color-brand-500)" }}><ArrowLeftRight className="h-3.5 w-3.5" aria-hidden /> Swap in</span>
              </button>
            )}
            <AnimatePresence mode="popLayout">
              {c ? null : (
                <motion.div key={`empty-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[68px] w-full items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed sm:h-[76px]" style={{ borderColor: next ? "color-mix(in srgb, var(--primary) 70%, transparent)" : "color-mix(in srgb, var(--foreground) 20%, transparent)", background: next ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent" }}>
                  <span className="text-[22px] leading-none font-extrabold" style={{ fontFamily: "var(--font-display)", color: next ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 30%, transparent)" }}>#{i + 1}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** "$98,340" or "$98,340 per year" -> "$98K"; null when there is no figure. */
function shortPay(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Already short ("$136K median" in Match's deck): keep the "$136K".
  const k = raw.match(/\$\s*(\d+(?:\.\d+)?)\s*K/i);
  if (k) return `$${Math.round(Number(k[1]))}K`;
  const m = raw.replace(/,/g, "").match(/\$?\s*(\d{4,7})/);
  if (!m) return raw.length <= 10 ? raw : null;
  const n = Number(m[1]);
  return n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;
}

// ------------------------------------------------------------ continuous ----

/** Reveals `total` items REVEAL_STEP at a time as the caller's sentinel
 *  scrolls into view -- no "load more" button, the grid just keeps growing
 *  the way a Netflix or YouTube grid does (direct feedback, 25 Sept 2026:
 *  "I don't think students should have to press a button to receive
 *  another set of careers... browsing should feel continuous"). Resets to
 *  one page whenever `resetKey` changes (a world switch). */
export function useRevealCount(total: number, resetKey: string): { count: number; sentinelRef: (node: HTMLDivElement | null) => void } {
  const [count, setCount] = useState(REVEAL_STEP);
  // React's own "adjust state when a prop changes" pattern: plain state, not
  // a ref (a ref read/write during render is itself a lint error), compared
  // and corrected inline during render rather than in an effect.
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setCount(REVEAL_STEP);
  }
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = (node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setCount((c) => Math.min(c + REVEAL_STEP, total));
    }, { rootMargin: "600px 0px" });
    observerRef.current.observe(node);
  };
  return { count: Math.min(count, total), sentinelRef };
}

// The card-scale version of the app's own scroll-reveal (SchoolsIllustrations.tsx's
// `rise`/`VIEW`): same ease curve, a lighter lift since a poster card is not
// a hero section. `whileInView` with `once: true` is what makes a card
// animate in ONLY the first time it scrolls into view -- already-seen cards
// re-rendered by a later reveal never replay it (direct feedback, 25 Sept
// 2026: "when I scroll down things should load in with an animated
// transition, not just like it was always there").
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const revealVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const REVEAL_VIEWPORT = { once: true, amount: 0.3, margin: "0px 0px -40px 0px" } as const;

function RevealItem({ index, children }: { index: number; children: ReactNode }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.45, ease: REVEAL_EASE, delay: (index % REVEAL_STEP) * 0.05 }}
    >
      {children}
    </motion.div>
  );
}

/** The grid itself: a plain wrapping grid (Match's own card language, not a
 *  fixed 2x3 viewport). Each card animates in the first time it scrolls
 *  into view; a sentinel row pulls in the next REVEAL_STEP as IT scrolls
 *  into view, with the app's own `Working` chip while the next batch
 *  settles (per docs/COMPONENT_STATES_PLAYBOOK.md's loading-state default). */
export function RevealGrid<T>({ items, resetKey, renderItem }: { items: T[]; resetKey: string; renderItem: (item: T, index: number) => ReactNode }) {
  const { count, sentinelRef } = useRevealCount(items.length, resetKey);
  const shown = items.slice(0, count);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
        {shown.map((item, i) => <RevealItem key={i} index={i}>{renderItem(item, i)}</RevealItem>)}
      </div>
      {count < items.length && (
        <div ref={sentinelRef} className="flex h-10 flex-none items-center justify-center">
          <Working label="Loading more" />
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ modal ----

/** Match's detail modal, section for section: hero with employers and
 *  salary, "What You'd Do", "Good Fit If You Like", "School & Path" as
 *  short bullets, one CTA, prev/next through the six. Content comes from
 *  matchDetail(), which is the deck's own copy for the six deck careers and
 *  the app's report/profile data for everything else. */
export function DetailModal({ career, control, selected, full, onToggle, onClose, onPrev, onNext }: {
  career: LabCareer;
  control: Exclude<LabControl, "rank">;
  selected: boolean;
  full: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const detail = matchDetail(career);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose, onPrev, onNext]);
  const round = "flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md";
  const roundStyle = { background: "color-mix(in srgb, var(--background) 55%, transparent)", borderColor: "rgba(255,255,255,0.4)" };
  const chip = "rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md";
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label={`${career.title} details`}>
      <motion.div initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }} className="relative flex max-h-[92dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
        <IconTip label="Close" className="absolute top-3 right-3 z-[3]">
          <button type="button" aria-label="Close" onClick={onClose} className={round} style={roundStyle}><X className="h-4.5 w-4.5 text-white" aria-hidden /></button>
        </IconTip>
        <div className="flow-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
            <LabPhoto career={career} sizes="440px" className="object-cover object-top" />
            {onPrev && (
              <IconTip label="Previous career" className="absolute top-1/2 left-3 z-[2] -translate-y-1/2">
                <button type="button" aria-label="Previous career" onClick={onPrev} className={round} style={roundStyle}><ChevronLeft className="h-5 w-5 text-white" aria-hidden /></button>
              </IconTip>
            )}
            {onNext && (
              <IconTip label="Next career" className="absolute top-1/2 right-3 z-[2] -translate-y-1/2">
                <button type="button" aria-label="Next career" onClick={onNext} className={round} style={roundStyle}><ChevronRight className="h-5 w-5 text-white" aria-hidden /></button>
              </IconTip>
            )}
            {/* pr-14 keeps the chips clear of the close button, as in Match. */}
            <div className="absolute inset-x-0 top-0 z-[1] flex items-start justify-between gap-2 p-4 pr-14">
              {detail.employers ? (
                <span className={`max-w-[55%] truncate ${chip}`} style={{ color: "var(--poster-title)", background: "color-mix(in srgb, var(--background) 80%, transparent)", borderColor: "var(--glass-border)" }}>{detail.employers}</span>
              ) : <span />}
              {detail.salary && (
                <span className={`flex-none ${chip}`} style={{ color: SUCCESS, borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 80%, transparent)" }}>{detail.salary}</span>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center gap-1.5 px-2 pt-12 pb-3 text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)" }}>
              <p className="line-clamp-3" style={{ ...posterTitleFont(career.world), fontSize: 26, lineHeight: 1.15, color: "var(--poster-title)" }}>{career.title}</p>
              <p className="text-[10.5px] font-semibold tracking-[0.06em]" style={{ color: accent }}>{career.world}</p>
            </div>
          </div>
          <div className="flex flex-col px-5 pt-4 pb-4">
            <Section icon={<BookOpen className="h-4 w-4" />} label="What You'd Do"><Bullets items={detail.whatYouDo} /></Section>
            <Divider />
            <Section icon={<Sparkles className="h-4 w-4" />} label="Good Fit If You Like"><Bullets items={detail.goodFitIf} /></Section>
            <Divider />
            <Section icon={<GraduationCap className="h-4 w-4" />} label="School & Path"><Bullets items={detail.schoolPath} /></Section>
          </div>
        </div>
        <div className="flex-none border-t px-4 py-3" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
          <button type="button" onClick={onToggle} disabled={!selected && full} className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] text-[15px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40" style={{ background: selected ? "var(--color-feedback-danger, #dc2626)" : accent }}>
            {control === "save"
              ? (selected ? "Remove from Saved" : full ? "Saved is full" : <><Bookmark className="h-4 w-4" strokeWidth={3} aria-hidden /> Save</>)
              : (selected ? "Remove from My Top 3" : full ? "Your Top 3 is full" : <><Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Add to My Top 3</>)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Divider() {
  return <hr aria-hidden className="my-3 border-0" style={{ height: 1, background: "var(--glass-border)" }} />;
}

/** Match's BulletList: 2-3 short bullets, never a paragraph; "Details
 *  coming soon." when nothing is authored yet (the app's thin-content
 *  convention). */
function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-[13px] font-medium italic" style={{ color: "var(--muted-foreground)" }}>Details coming soon.</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[13px] leading-[1.5] font-medium" style={{ color: "var(--muted-foreground)" }}>
          <span aria-hidden className="mt-[8px] size-1 flex-none rounded-full" style={{ background: "var(--muted-foreground)" }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span aria-hidden className="flex-none" style={{ color: "var(--foreground)" }}>{icon}</span>
        <h3 className="text-[15px] font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>{label}</h3>
      </div>
      <div className="mt-1.5 text-left">{children}</div>
    </section>
  );
}

// ------------------------------------------------------------------ top 3 ----

/** The real My Profile tab row, drawn inert, with Top Three active: after
 *  ranking, the student lands in their profile (Joshua's note: "only after
 *  they rank those three do we move them into My Profile (Top Three)").
 *  Seeing the picks sit in a permanent tab of the profile is what says
 *  "this lives here, change it any time". The lab never writes to the real
 *  profile, so the other tabs are shown, not wired. */
export function ProfileTabs() {
  const tabs = ["Overview", "Top Three", "My Plan", "Report", "Resume", "Preferences"];
  return (
    <div className="flex w-full items-center gap-1 overflow-x-auto rounded-[var(--radius-lg)] p-1 [scrollbar-width:none]" style={{ background: "var(--glass-surface-2)" }} aria-label="My Profile sections">
      {tabs.map((t) => {
        const on = t === "Top Three";
        return (
          <span key={t} aria-current={on ? "page" : undefined} className="flex-1 rounded-[var(--radius-md)] px-3 py-2 text-center text-[13px] font-bold whitespace-nowrap" style={{ background: on ? "var(--color-brand-500)" : "transparent", color: on ? "#fff" : "var(--muted-foreground)" }}>{t}</span>
        );
      })}
    </div>
  );
}

/** The lab's My Profile > Top Three, cut to what Joshua's note asks for
 *  (26 Sept 2026, direct feedback on the fuller version: "This is so much
 *  copy and so confusing"): the three picks side by side, ONE Change
 *  control per card (swap in a saved career, or remove), and one row under
 *  them with Saved and Explore more. No next-step card, no icon row, no
 *  second button per card. A removed pick leaves its numbered slot. Fits
 *  the viewport, never scrolls; phones get three compact rows. */
export function TopThreeScreen({ top3, pool, poolLabel, onExploreMore, onOpenPool, onRemove, onReplace, onNext }: {
  /** the one next step after landing (the Career Report) */
  onNext: () => void;
  top3: LabCareer[];
  pool: LabCareer[];
  poolLabel: string;
  onExploreMore: () => void;
  onOpenPool: () => void;
  onRemove: (id: string) => void;
  onReplace: (outId: string, inId: string) => void;
}) {
  const [changing, setChanging] = useState<string | null>(null);
  const swappable = pool.filter((p) => !top3.some((t) => t.id === p.id));
  // The Change menu opens over its own card, so it never adds height.
  const menu = (c: LabCareer) => changing === c.id && (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-[6] flex flex-col gap-1 overflow-y-auto rounded-[var(--radius-lg)] border p-2 backdrop-blur-md" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 92%, transparent)" }}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Swap for</span>
        <button type="button" aria-label="Close" onClick={() => setChanging(null)} className="dm-quiet flex size-7 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-3.5 w-3.5" aria-hidden /></button>
      </div>
      {swappable.map((p) => (
        <button key={p.id} type="button" onClick={() => { onReplace(c.id, p.id); setChanging(null); }} className="dm-quiet flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          <span className="relative size-7 flex-none overflow-hidden rounded-full"><LabPhoto career={p} sizes="28px" className="object-cover" /></span>
          <span className="min-w-0 flex-1 truncate">{p.title}</span>
        </button>
      ))}
      {swappable.length === 0 && <span className="px-2 py-1.5 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Save more careers to swap one in.</span>}
      <button type="button" onClick={() => { onRemove(c.id); setChanging(null); }} className="dm-quiet mt-auto flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[13px] font-semibold" style={{ color: "#E0453C" }}>
        <X className="h-4 w-4" aria-hidden /> Remove from Top 3
      </button>
    </motion.div>
  );
  const changeBtn = (c: LabCareer) => (
    <button type="button" aria-label={`Change ${c.title}`} aria-expanded={changing === c.id} onClick={() => setChanging(changing === c.id ? null : c.id)} className="dm-quiet flex h-9 w-full flex-none cursor-pointer items-center justify-center gap-1.5 rounded-full border text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden /> Change
    </button>
  );
  const empty = (n: number, row: boolean) => (
    <button key={`empty-${n}`} type="button" onClick={onOpenPool} className={`dm-quiet flex min-h-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed p-3 ${row ? "flex-1" : "flex-col"}`} style={{ borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)" }}>
      <span className="text-[26px] leading-none font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>#{n}</span>
      <span className="flex items-center gap-1 text-[13px] font-bold" style={{ color: "var(--foreground)" }}><Plus className="h-4 w-4" aria-hidden /> Add from {poolLabel}</span>
    </button>
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-1">
      {/* Desktop: three columns, the posters take the leftover height. */}
      <div className="hidden min-h-0 flex-1 grid-cols-3 gap-3 sm:grid">
        {top3.map((c, i) => (
          <div key={c.id} className="relative flex min-h-0 flex-col gap-2">
            <div className="relative min-h-0 flex-1"><LabCard career={c} control="rank" selected rank={i + 1} fill className="absolute inset-0" /></div>
            {changeBtn(c)}
            {menu(c)}
          </div>
        ))}
        {Array.from({ length: 3 - top3.length }, (_, k) => empty(top3.length + k + 1, false))}
      </div>
      {/* Phone: three compact rows that share the leftover height. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 sm:hidden">
        {top3.map((c, i) => {
          const accent = WORLD_COLORS[c.world] ?? "var(--primary)";
          return (
            <div key={c.id} className="relative flex min-h-0 flex-1 items-center gap-3 rounded-[var(--radius-lg)] border p-2" style={CARD}>
              <div className="relative aspect-[3/4] h-full max-h-[120px] flex-none overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: accent }}>
                <LabPhoto career={c} sizes="96px" className="object-cover" />
                <span className="absolute top-1 left-1 flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: accent }}>{i + 1}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[15px] leading-tight font-extrabold uppercase" style={{ ...posterTitleFont(c.world), color: "var(--poster-title)" }}>{c.title}</p>
                  <p className="text-[9.5px] font-semibold tracking-[0.06em] uppercase" style={{ color: accent }}>{c.world}</p>
                </div>
                {changeBtn(c)}
              </div>
              {menu(c)}
            </div>
          );
        })}
        {Array.from({ length: 3 - top3.length }, (_, k) => empty(top3.length + k + 1, true))}
      </div>
      {/* One next step, not a menu (26 Sept 2026: students "did not know
         what to do after reaching my top 3"; games exist for one career
         only, so Play can't be the default). The Career Report is the
         first milestone of My Plan and works for every career, so it is
         the primary action; Explore more sits beside it as the quieter
         "keep exploring" nudge; Saved is the small third. The primary
         glints until used. */}
      <div className="flex flex-none flex-wrap items-center justify-end gap-2">
        <QuietButton onClick={onOpenPool}><Bookmark className="h-4 w-4" aria-hidden /> {poolLabel} ({pool.length})</QuietButton>
        <QuietButton onClick={onExploreMore}>Explore more</QuietButton>
        {top3.length > 0 && <PrimaryButton onClick={onNext}><span className="dm-text-nudge">Create my Career Report</span> <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden /></PrimaryButton>}
      </div>
    </div>
  );
}
