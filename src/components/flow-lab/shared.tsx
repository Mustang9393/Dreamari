"use client";

// DEMO-ONLY: pieces both Flow Lab versions share, so v2 and v3 are compared
// on identical chrome and the only visible difference is the flow itself.
// Every screen follows the live Match screen's composition (direct feedback,
// 25 Sept 2026: "stick to earlier layouts, kill all redundant copy"): a
// fixed viewport-high section, a one-line header row with a status chip,
// six cards that fill the space, a sticky bottom bar, an in-place detail
// modal. Instructions are coachmarks, not paragraphs.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Bookmark, BookOpen, Check, ChevronLeft, ChevronRight, FileText, GraduationCap, ImageOff, Info, Play, Plus, Route, Sparkles, X } from "lucide-react";
import { BorderBeam } from "border-beam";
import { IconTip } from "@/components/app/IconTip";
import { Coachmark } from "@/components/flow/GestureSpotlight";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { careerSlug } from "@/components/career/slug";
import { matchDetail, type LabCareer, WORLDS } from "./lab";

export const CARD = { background: "var(--card)", borderColor: "var(--glass-border)" } as const;
const SUCCESS = "var(--color-feedback-success)";
export const PAGE = 6;

/** The version chip + Restart, rendered by FlowLab and slotted into every
 *  screen's bottom bar so it stays bottom-center without covering cards. */
export const LabDockContext = createContext<ReactNode>(null);

export type Hint = { active: boolean; label: string; onDismiss: () => void; cta?: string };

// ---------------------------------------------------------------- layout ----

/** Match's viewport-high section: header row, optional control row, then
 *  whatever fills the rest (`children`), above a fixed bottom bar. */
export function LabScreen({ title, status, hint, controls, children }: { title: string; status?: string; hint?: string; controls?: ReactNode; children: ReactNode }) {
  return (
    // Phones carry the version dock above the bottom bar, so they need the
    // extra bottom room; desktop docks it inside the bar.
    <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden px-4 pt-16 pb-[136px] sm:pt-[72px] sm:pb-24" style={{ WebkitTapHighlightColor: "transparent" }}>
      <div className="flex min-h-0 w-full max-w-[880px] flex-1 flex-col">
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
        {children}
      </div>
    </section>
  );
}

/** Match's sticky bar: one status line left, the dock in the middle, one
 *  CTA right. */
export function BottomBar({ status, cta, onCta, ctaDisabled, left }: { status: string; cta: string; onCta: () => void; ctaDisabled?: boolean; left?: ReactNode }) {
  const dock = useContext(LabDockContext);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t px-4 py-3" style={{ background: "color-mix(in srgb, var(--background) 94%, transparent)", borderColor: "var(--glass-border)" }}>
      <div className="flex w-full max-w-[880px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {left}
          <p className="truncate text-[13px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{status}</p>
        </div>
        <div className="hidden flex-none sm:block">{dock}</div>
        <button type="button" onClick={onCta} disabled={ctaDisabled} className="flex min-h-[44px] flex-none cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] px-5 text-[14px] font-bold whitespace-nowrap text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40" style={{ background: "var(--color-brand-500)" }}>
          {cta} <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        </button>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-[72px] flex justify-center sm:hidden">
        <div className="pointer-events-auto">{dock}</div>
      </div>
    </div>
  );
}

export function Toast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-[var(--radius-md)] border px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-xl" style={{ color: "var(--foreground)", background: "var(--glass-surface-3)", borderColor: "var(--glass-border)" }}>
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
export function LabCard({ career, control, selected, rank, onToggle, onOpen, reason, fill = false, hint, className = "" }: {
  career: LabCareer;
  control: LabControl;
  selected: boolean;
  rank?: number;
  onToggle?: () => void;
  onOpen?: () => void;
  reason?: string | null;
  fill?: boolean;
  hint?: Hint;
  className?: string;
}) {
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const label = control === "save" ? (selected ? `Unsave ${career.title}` : `Save ${career.title}`) : control === "pick" ? (selected ? `Remove ${career.title} from your Top 3` : `Add ${career.title} to your Top 3`) : `#${rank} ${career.title}`;
  const tip = control === "save" ? (selected ? "Unsave" : "Save") : control === "pick" ? (selected ? "Remove from Top 3" : "Add to Top 3") : `#${rank}`;
  const controlEl = control === "rank" ? (
    <span aria-label={label} className="flex size-8 items-center justify-center rounded-full border-2 text-[13px] font-extrabold text-white" style={{ background: accent, borderColor: accent }}>{rank}</span>
  ) : (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); hint?.onDismiss(); onToggle?.(); }}
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
        </div>
      </div>
      <div className="pointer-events-none absolute top-2 left-2 z-[1] flex max-w-[calc(100%-56px)] flex-wrap gap-1">
        {reason && (
          <span className="truncate rounded-[var(--radius-sm)] border px-2 py-[3px] text-[10px] font-bold backdrop-blur-md" style={{ color: "var(--poster-title)", borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`, background: "color-mix(in srgb, var(--background) 78%, transparent)" }}>{reason}</span>
        )}
        {career.salary && (
          <span className="rounded-[var(--radius-sm)] border px-2 py-[3px] text-[10px] font-bold backdrop-blur-md" style={{ color: SUCCESS, borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 78%, transparent)" }}>{career.salary}</span>
        )}
      </div>
      {hint ? (
        /* The coachmark sits OUTSIDE the IconTip on purpose. Its bubble is a
           portal that still belongs to this subtree in React's tree, so if
           it lived inside the tooltip wrapper, the bubble's "Next" would
           focus a button inside the tooltip's focus scope (tooltip shows),
           then unmount without a blur (tooltip never hides). The same
           subtree bubbling would also hand the click to the card's open
           handler, so propagation stops here too. */
        <span className="absolute top-2 right-2 z-[2]" onClick={(e) => e.stopPropagation()}>
          <Coachmark demoForce active={hint.active} label={hint.label} cta={hint.cta} onDismiss={hint.onDismiss} spotlight side="bottom" align="end">
            <IconTip label={tip}>{controlEl}</IconTip>
          </Coachmark>
        </span>
      ) : (
        <IconTip label={tip} className="absolute top-2 right-2 z-[2]">{controlEl}</IconTip>
      )}
    </div>
  );
}

// -------------------------------------------------------------- carousel ----

/** Match's six-up grid, paged: the six slide out and the next six slide in,
 *  and the pager moves both ways (direct feedback, 25 Sept 2026: "show six
 *  more, all 6 scroll out of the screen, new 6 loads, I can keep moving
 *  between these like a carousel"). */
export function SixGrid({ page, direction, children }: { page: string | number; direction: 1 | -1; children: ReactNode }) {
  return (
    <div className="relative min-h-0 flex-1">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 grid min-h-0 grid-cols-2 grid-rows-3 gap-2.5 sm:grid-cols-3 sm:grid-rows-2 sm:gap-4"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** `total` omitted = open-ended (v3 keeps generating sixes): the count reads
 *  "Set 3" instead of "3/N". */
export function Pager({ index, total, onPrev, onNext, nextLabel = "Six more", hint }: { index: number; total?: number; onPrev: () => void; onNext: () => void; nextLabel?: string; hint?: Hint }) {
  const nextBtn = (
    <button type="button" aria-label={nextLabel} onClick={() => { hint?.onDismiss(); onNext(); }} disabled={total !== undefined && total <= 1} className="dm-quiet flex h-9 cursor-pointer items-center gap-1 rounded-full border px-3 text-[12.5px] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      {nextLabel} <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </button>
  );
  return (
    <div className="flex flex-none items-center gap-1.5">
      <IconTip label="Previous six">
        <button type="button" aria-label="Previous six" onClick={onPrev} disabled={index === 0} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </button>
      </IconTip>
      <span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{total !== undefined ? `${index + 1}/${total}` : `Set ${index + 1}`}</span>
      {hint ? (
        <Coachmark demoForce active={hint.active} label={hint.label} onDismiss={hint.onDismiss} spotlight side="top" align="end">
          {nextBtn}
        </Coachmark>
      ) : nextBtn}
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

// The student-facing ladder after a Top 3, in the counselor dashboard's own
// milestone order (MILESTONE_KEYS in counselorRoster.ts: Career Report ->
// Career Pathway -> Resume -> College Exploration -> Applications), so
// "what's next" for the student is the same thing that moves their roadmap
// on the counselor's screen. Each step opens the real app page for it.
const LADDER: { key: string; label: string; icon: ReactNode; href: (slug: string) => string }[] = [
  { key: "report", label: "Career Report", icon: <FileText className="h-3.5 w-3.5" aria-hidden />, href: (slug) => `/career-report?picks=${slug}` },
  { key: "path", label: "Pathway", icon: <Route className="h-3.5 w-3.5" aria-hidden />, href: (slug) => `/career/${slug}` },
  { key: "play", label: "Play a day", icon: <Play className="h-3.5 w-3.5" aria-hidden />, href: () => "/play" },
  { key: "colleges", label: "Colleges", icon: <GraduationCap className="h-3.5 w-3.5" aria-hidden />, href: () => "/colleges" },
];

/** One recommended next step for #1, then the ladder. Nothing in the lab
 *  records progress, so the recommendation is always the first rung; in
 *  the product it would be the first rung not yet done. */
function NextStep({ first }: { first: LabCareer }) {
  const router = useRouter();
  const slug = careerSlug(first.title);
  const accent = WORLD_COLORS[first.world] ?? "var(--primary)";
  return (
    <div className="flex flex-none flex-col gap-2 rounded-[var(--radius-lg)] border p-3" style={{ ...CARD, borderColor: `color-mix(in srgb, ${accent} 45%, var(--glass-border))` }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${accent} 22%, transparent)`, color: accent }}><Sparkles className="h-4 w-4" aria-hidden /></span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>Next step</p>
            <p className="truncate text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}>Career Report for {first.title}</p>
          </div>
        </div>
        <PrimaryButton onClick={() => router.push(LADDER[0].href(slug))}>Start <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden /></PrimaryButton>
      </div>
      <ol className="flex flex-wrap items-center gap-1.5" aria-label="Your roadmap">
        {LADDER.map((step, i) => (
          <li key={step.key} className="flex items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap" style={{ borderColor: i === 0 ? accent : "var(--glass-border)", background: i === 0 ? `color-mix(in srgb, ${accent} 18%, transparent)` : "transparent", color: i === 0 ? "var(--foreground)" : "var(--muted-foreground)" }}>
              {step.icon}{step.label}
            </span>
            {i < LADDER.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden style={{ color: "var(--muted-foreground)" }} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Icon-only actions under each Top 3 card, one per rung, each with its
 *  tooltip (icon-only rule). Opens the real page; Back returns to the lab. */
function CareerActions({ career }: { career: LabCareer }) {
  const router = useRouter();
  const slug = careerSlug(career.title);
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {LADDER.map((step) => (
        <IconTip key={step.key} label={step.label} className="w-full">
          <button type="button" aria-label={`${step.label}: ${career.title}`} onClick={() => router.push(step.href(slug))} className="dm-quiet flex h-9 w-full cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            {step.icon}
          </button>
        </IconTip>
      ))}
    </div>
  );
}

/** The lab's My Profile > Top 3, shared by v2 and v3: Joshua's asks as
 *  written (prominent Explore more and Saved, obvious Remove and Replace),
 *  plus the answer to "what's next" (direct feedback, 25 Sept 2026): a
 *  recommended next step for #1, the ladder, and actions on every card.
 *  Everything fits the viewport, never scrolls (direct feedback, 25 Sept
 *  2026: "these cards get cropped by the bottom, this should never
 *  happen"): on desktop the three posters take whatever height is left;
 *  on phones the three become compact rows. The swap list opens as an
 *  overlay on the card so it never adds height. */
export function TopThreeScreen({ top3, pool, poolLabel, onExploreMore, onOpenPool, onRemove, onReplace, replacing, setReplacing, hint }: {
  top3: LabCareer[];
  pool: LabCareer[];
  poolLabel: string;
  onExploreMore: () => void;
  onOpenPool: () => void;
  onRemove: (id: string) => void;
  onReplace: (outId: string, inId: string) => void;
  replacing: string | null;
  setReplacing: (id: string | null) => void;
  hint?: Hint;
}) {
  const swappable = pool.filter((s) => !top3.some((t) => t.id === s.id));
  const swapList = (c: LabCareer) => (
    <div className="absolute inset-0 z-[6] flex flex-col gap-1 overflow-y-auto rounded-[var(--radius-lg)] border p-2 backdrop-blur-md" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 92%, transparent)" }}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Swap in</span>
        <button type="button" aria-label="Cancel" onClick={() => setReplacing(null)} className="dm-quiet flex size-7 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-3.5 w-3.5" aria-hidden /></button>
      </div>
      {swappable.map((p) => (
        <button key={p.id} type="button" onClick={() => { onReplace(c.id, p.id); setReplacing(null); }} className="dm-quiet flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          {p.title} <ChevronRight className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--muted-foreground)" }} />
        </button>
      ))}
    </div>
  );
  const replaceBtn = (c: LabCareer, i: number, iconOnly: boolean) => {
    const btn = (
      <button type="button" aria-label={`Replace ${c.title}`} onClick={() => { hint?.onDismiss(); setReplacing(replacing === c.id ? null : c.id); }} disabled={swappable.length === 0} className={`dm-quiet flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-[12.5px] font-bold disabled:cursor-not-allowed disabled:opacity-40 ${iconOnly ? "w-full" : "flex-1"}`} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
        <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />{!iconOnly && " Replace"}
      </button>
    );
    const wrapped = iconOnly ? <IconTip label="Replace" className="w-full">{btn}</IconTip> : btn;
    return i === 0 && hint ? (
      <Coachmark demoForce active={hint.active} label={hint.label} onDismiss={hint.onDismiss} spotlight side="top" align="start" wrapperClassName={iconOnly ? "flex w-full" : "flex flex-1"}>
        {wrapped}
      </Coachmark>
    ) : wrapped;
  };
  const removeBtn = (c: LabCareer, iconOnly: boolean) => {
    const btn = (
      <button type="button" aria-label={`Remove ${c.title}`} onClick={() => onRemove(c.id)} className={`dm-quiet flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-[12.5px] font-bold ${iconOnly ? "w-full" : "flex-1"}`} style={{ borderColor: "color-mix(in srgb, #E0453C 45%, transparent)", color: "#E0453C" }}>
        <X className="h-3.5 w-3.5" aria-hidden />{!iconOnly && " Remove"}
      </button>
    );
    return iconOnly ? <IconTip label="Remove" className="w-full">{btn}</IconTip> : btn;
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-1">
      <div className="flex flex-none flex-wrap items-center gap-2">
        <PrimaryButton onClick={onExploreMore}>Explore more</PrimaryButton>
        <QuietButton onClick={onOpenPool}><Bookmark className="h-4 w-4" aria-hidden /> {poolLabel} ({pool.length})</QuietButton>
      </div>
      {top3.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed p-6 text-center" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No picks yet</p>
        </div>
      ) : (
        <>
          <NextStep first={top3[0]} />
          {/* Desktop: three columns, the poster takes the leftover height. */}
          <div className="hidden min-h-0 flex-1 grid-cols-3 gap-3 sm:grid">
            {top3.map((c, i) => (
              <div key={c.id} className="flex min-h-0 flex-col gap-2 rounded-[var(--radius-lg)] border p-2.5" style={CARD}>
                <div className="relative min-h-0 flex-1">
                  <LabCard career={c} control="rank" selected rank={i + 1} fill className="absolute inset-0" />
                  {replacing === c.id && swapList(c)}
                </div>
                <CareerActions career={c} />
                <div className="flex flex-none gap-2">
                  {replaceBtn(c, i, false)}
                  {removeBtn(c, false)}
                </div>
              </div>
            ))}
          </div>
          {/* Phone: three compact rows that share the leftover height. */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 sm:hidden">
            {top3.map((c, i) => {
              const accent = WORLD_COLORS[c.world] ?? "var(--primary)";
              return (
                <div key={c.id} className="relative flex min-h-0 flex-1 items-stretch gap-2.5 rounded-[var(--radius-lg)] border p-2" style={CARD}>
                  <div className="relative aspect-[3/4] h-full flex-none overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: accent }}>
                    <LabPhoto career={c} sizes="96px" className="object-cover" />
                    <span className="absolute top-1 left-1 flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: accent }}>{i + 1}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] leading-tight font-extrabold uppercase" style={{ ...posterTitleFont(c.world), color: "var(--poster-title)" }}>{c.title}</p>
                      <p className="text-[9.5px] font-semibold tracking-[0.06em] uppercase" style={{ color: accent }}>{c.world}</p>
                    </div>
                    <CareerActions career={c} />
                    <div className="grid grid-cols-2 gap-1.5">
                      {replaceBtn(c, i, true)}
                      {removeBtn(c, true)}
                    </div>
                  </div>
                  {replacing === c.id && swapList(c)}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
