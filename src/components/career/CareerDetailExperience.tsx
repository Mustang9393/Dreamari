"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Bookmark, BookOpen, ChevronDown, ExternalLink, Gamepad2, Heart, Info, Plus, ThumbsDown, X } from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { PosterCard } from "@/components/app/PosterCard";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { hasGlossary } from "@/components/glossary/data";
import { simulationFor } from "@/components/play/games";
import { resolveCareer, similarCareers, type ResolvedCareer } from "./data";
import type { FactDetails, ProfileRung } from "./profiles";
import { careerSlug } from "./slug";

// Career Detail, rebuilt 2026-09-02 around the production page's information
// (dreamonna.com/explore/<slug>; copy and data transcribed in profiles.ts and
// never rewritten here) for readers who skim: US high schoolers.
//
// What the reader sees first, and only that:
//   the header card (title, one line on what it is, one line to imagine it),
//   four quick facts, pay by state as bars, and the career ladder as three
//   compact rows (title + pay). Everything below the ladder is folded behind
//   its heading and opens on tap. Nothing is hidden, but nothing is thrown at
//   the reader at once either.
//
// Type scale, five steps, strictly descending down the page and inside every
// block (a value never outsizes the heading above it; labels never masquerade
// as headings; sections open with their heading, not an eyebrow):
//   Large    career title       Bricolage 800, 40/44 -> clamp(56..72) from sm
//   Big      section heading    Bricolage 700, 22/26 -> 26/30 from sm
//   Medium   sub-heading, rung title/pay  18/24 semibold (figures in Bricolage)
//   Label    the name over a value        16/22 semibold  (facts, states, dt)
//   Small    body, values                 15/22
//   Tiny     dd under a Small dt          14/20
//   (Chrome such as tab labels stays at 13px and is not part of the scale.)
//
// Spacing uses the marketing token scale (tokens.css defines 1-6, 8, 10, 12,
// 13, 14 -- there is no --space-7, which is what silently zeroed the first
// pass of this layout) or explicit px where a step in between is needed.
const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const BIG = "text-[22px] leading-[26px] font-bold tracking-[-0.01em] sm:text-[26px] sm:leading-[30px]";
const MEDIUM = "text-[18px] leading-[24px] font-semibold";
const FIGURE = "text-[18px] leading-[24px] font-bold tabular-nums";
const LABEL = "text-[16px] leading-[22px] font-semibold";
const SMALL = "text-[15px] leading-[22px]";
const TINY = "text-[14px] leading-[20px]";
// The frosted panel every info box on this page sits in (direct feedback:
// more contrast, frostier): a stronger glass fill, a real backdrop blur and a
// brighter hairline than the page's default glass-surface-1.
const PANEL = { background: "color-mix(in srgb, var(--glass-surface-2) 100%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)" } as const;

// Per-career photo focal point for the header panel (most posters carry the
// subject in the upper half; the exceptions are listed here).
const HERO_FOCUS: Record<string, string> = {
  "asset-management": "center 68%",
};

function IconButton({ label, active = false, onClick, children }: { label: string; active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="dm-quiet flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border"
      style={{ background: "rgba(12,16,35,0.45)", borderColor: active ? "var(--accent-subtle)" : "rgba(255,255,255,0.3)", color: active ? "var(--accent-subtle)" : "#fff" }}
    >
      {children}
    </button>
  );
}

// ---- Key figure: production's gradient numeral, in the world accent -------
// Used sparingly (direct feedback): typical pay, pay by state, ladder pay.
// Same size tier as the body value it replaces, so it never outsizes the
// label above it; the gradient carries the emphasis, not the size.
function Figure({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <span
      className={`${SMALL} font-bold tabular-nums`}
      // Two colored stops, no white start: a white-to-accent ramp stretched
      // across the element made short figures read white and long ones read
      // colored (direct feedback). Now every figure carries the same amount
      // of color whatever its length.
      style={{ ...DISPLAY, backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
    >
      {children}
    </span>
  );
}

// ---- Section shells -------------------------------------------------------

// Always-open section: heading row (with an optional control) over content.
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
      {/* the title row is ruled off edge to edge (direct feedback): the line
         runs through the panel's padding to touch both borders */}
      <div className="-mx-[var(--space-5)] flex flex-wrap items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
        <h2 className={BIG} style={DISPLAY}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Folded section: the heading is the control. Collapsed, it is the heading
// alone (direct feedback: no caption under it); open, the content.
function Folded({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col rounded-[var(--radius-lg)] border" style={PANEL}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className={`dm-quiet flex w-full cursor-pointer items-center justify-between gap-[var(--space-4)] p-[var(--space-5)] text-left sm:px-[var(--space-6)] ${open ? "rounded-t-[inherit] border-b" : "rounded-[inherit]"}`}
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <h2 className={`${BIG} min-w-0`} style={DISPLAY}>{title}</h2>
        <ChevronDown className="mt-[4px] h-5 w-5 flex-none transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden />
      </button>
      <div id={`${id}-panel`} hidden={!open} className="px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-6)] sm:px-[var(--space-6)]">
        {children}
      </div>
    </section>
  );
}

// One marker, one line per item. The marker is the world accent so the list
// reads as this career's without a second color system.
function DotList({ items, accent, leading }: { items: string[]; accent: string; leading?: (item: string) => React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-[var(--space-3)]">
      {items.map((item) => (
        <li key={item} className={`${SMALL} flex items-center gap-[var(--space-3)]`}>
          {leading ? leading(item) : <span aria-hidden className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: accent }} />}
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ---- Career ladder --------------------------------------------------------

// Three compact rows first: number, title, pay, and a bar under the title
// showing how far up the pay climb this rung sits. The paragraph and the
// "What you do" / "To get here" lines open per rung on tap.
function Rung({ rung, accent, open, onToggle }: { rung: ProfileRung; accent: string; open: boolean; onToggle: () => void }) {
  const hasDetail = !!rung.description || rung.whatYouDo.length > 0 || rung.toGetHere.length > 0;
  return (
    <li className="border-t first:border-t-0" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
      <button
        type="button"
        onClick={hasDetail ? onToggle : undefined}
        aria-expanded={hasDetail ? open : undefined}
        className={`${hasDetail ? "dm-quiet cursor-pointer" : ""} -mx-[8px] grid w-[calc(100%+16px)] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-x-[var(--space-4)] rounded-[var(--radius-sm)] px-[8px] py-[var(--space-4)] text-left`}
      >
        <span
          className={`${FIGURE} text-center`}
          style={{ ...DISPLAY, backgroundImage: `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          {rung.number}
        </span>
        <span className={`${MEDIUM} min-w-0 truncate`}>{rung.jobTitle}</span>
        <span className="flex items-center gap-[var(--space-3)]">
          {rung.pay && <Figure accent={accent}>{rung.pay}</Figure>}
          {hasDetail && <ChevronDown className="h-5 w-5 flex-none transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden />}
        </span>
      </button>
      {hasDetail && open && (
        <div className="flex flex-col gap-[var(--space-3)] pb-[var(--space-5)] pl-[48px]">
          {rung.description && <p className="max-w-[62ch] text-[16px] leading-[24px]">{rung.description}</p>}
          {(rung.whatYouDo.length > 0 || rung.toGetHere.length > 0) && (
            <dl className="flex flex-col gap-[var(--space-2)]">
              {rung.whatYouDo.length > 0 && (
                <div className="flex flex-col gap-[2px] sm:flex-row sm:gap-[var(--space-4)]">
                  <dt className={`${SMALL} font-semibold sm:w-[112px] sm:flex-none`}>What you do</dt>
                  <dd className={`${TINY} min-w-0 sm:pt-[1px]`} style={{ color: "var(--muted-foreground)" }}>{rung.whatYouDo.join(" · ")}</dd>
                </div>
              )}
              {rung.toGetHere.length > 0 && (
                <div className="flex flex-col gap-[2px] sm:flex-row sm:gap-[var(--space-4)]">
                  <dt className={`${SMALL} font-semibold sm:w-[112px] sm:flex-none`}>To get here</dt>
                  <dd className={`${TINY} min-w-0 sm:pt-[1px]`} style={{ color: "var(--muted-foreground)" }}>{rung.toGetHere.join(" · ")}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </li>
  );
}

// ---- Pay by state: production's tiles, no chart (direct feedback: fewer
// graphs). State on the left, the figure on the right; a label like "more
// than usual" stays plain text, a pay figure gets the accent gradient. ----

function PayRows({ rows, accent }: { rows: { state: string; pay: string }[]; accent: string }) {
  return (
    <ul className="flex flex-col">
      {rows.map((row) => {
        const isFigure = /\d/.test(row.pay);
        return (
          <li key={row.state} className="flex min-w-0 items-center justify-between gap-[var(--space-3)] border-t py-[10px] first:border-t-0" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <span className={`${SMALL} min-w-0 truncate`} style={{ color: "rgba(255,255,255,0.86)" }}>{row.state}</span>
            {isFigure ? <Figure accent={accent}>{row.pay}</Figure> : <span className={`${SMALL} flex-none`} style={{ color: "var(--muted-foreground)" }}>{row.pay}</span>}
          </li>
        );
      })}
    </ul>
  );
}

// Which quick fact carries which detail behind its (i).
function factKey(label: string): keyof FactDetails | null {
  if (/degree/i.test(label)) return "degree";
  if (/pay/i.test(label)) return "pay";
  if (/open/i.test(label)) return "openings";
  return null;
}

// Small popover next to a fact's (i): pay bands, or what "openings" counts.
// Rendered through a portal at the body and positioned from the icon's own
// rect, so no panel, blur layer or overflow can clip it; clamped to the
// viewport with a 16px margin. Closes on a tap anywhere else or Escape.
function FactPopover({ anchor, children, onClose }: { anchor: HTMLElement | null; children: React.ReactNode; onClose: () => void }) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  useEffect(() => {
    const place = () => {
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 32);
      const left = Math.min(Math.max(16, r.left - 12), window.innerWidth - width - 16);
      setPos({ top: r.bottom + 8, left, width });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);
  if (!pos || typeof document === "undefined") return null;
  return createPortal(
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 z-[80] cursor-default" />
      <div
        role="dialog"
        className="marketing-v2 themeable fixed z-[81] rounded-[var(--radius-md)] border p-[var(--space-4)]"
        style={{ top: pos.top, left: pos.left, width: pos.width, background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "rgba(255,255,255,0.16)", boxShadow: "0 24px 48px -24px rgba(0,0,0,0.8)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

// The degree sheet: the three door questions, the note, the "not the only
// route" line, and how people in the job actually finished, as bars.
function DegreeSheet({ career, detail, accent, onClose }: { career: string; detail: NonNullable<FactDetails["degree"]>; accent: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const top = Math.max(...detail.distribution.map((d) => d.pct));
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="degree-sheet-title" style={{ fontFamily: "var(--font-body)" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.62)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
      <div
        className="relative z-[1] flex max-h-[92dvh] w-full max-w-[600px] flex-col gap-[var(--space-5)] overflow-y-auto rounded-t-[var(--radius-xl)] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)] sm:p-[var(--space-6)]"
        style={{ background: "color-mix(in srgb, var(--background) 95%, var(--foreground))", borderColor: "rgba(255,255,255,0.16)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)", color: "var(--foreground)" }}
      >
        <div className="flex items-start justify-between gap-[var(--space-4)]">
          <div className="flex flex-col gap-[2px]">
            <h2 id="degree-sheet-title" className={BIG} style={DISPLAY}>What you need to get in</h2>
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>{career}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "rgba(255,255,255,0.16)" }}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <dl className="flex flex-col gap-[8px]">
          {[["The door asks for", detail.doorAsksFor], ["Experience first?", detail.experienceFirst], ["Training after hiring", detail.trainingAfterHiring]].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-[var(--space-4)]">
              <dt className={SMALL} style={{ color: "var(--muted-foreground)" }}>{k}</dt>
              <dd className={`${SMALL} font-semibold`}>{v}</dd>
            </div>
          ))}
        </dl>

        <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>{detail.note}</p>
        <p className={SMALL}>
          <strong className="font-semibold">Even so, {detail.noBachelorPct} of people doing this job do not have a bachelor&apos;s degree.</strong>{" "}
          <span style={{ color: "var(--muted-foreground)" }}>The usual route is not the only one.</span>
        </p>
        {detail.extra && <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>{detail.extra}</p>}

        <div className="flex flex-col gap-[var(--space-3)]">
          <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>What people in this job finished</h3>
          <p className={TINY} style={{ color: "var(--muted-foreground)" }}>According to the U.S. Bureau of Labor Statistics.</p>
          <ul className="flex flex-col gap-[8px]">
            {detail.distribution.map((row) => {
              const lead = row.pct === top;
              return (
                <li key={row.label} className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_56px] items-center gap-[var(--space-3)]">
                  <span className={`${TINY} truncate ${lead ? "font-semibold" : ""}`} style={{ color: lead ? "var(--foreground)" : "var(--muted-foreground)" }}>{row.label}</span>
                  <span className="h-[8px] w-full overflow-hidden rounded-full" style={{ background: "var(--glass-surface-1)" }}>
                    <span className="block h-full rounded-full" style={{ width: `${Math.max(2, row.pct)}%`, background: lead ? accent : "color-mix(in srgb, var(--foreground) 35%, transparent)" }} />
                  </span>
                  <span className={`${TINY} text-right tabular-nums ${lead ? "font-semibold" : ""}`} style={{ color: lead ? "var(--foreground)" : "var(--muted-foreground)" }}>{row.pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Every career gets the same page shape. Careers without a full profile map
// what the app already knows into it; sections with nothing to say are
// skipped, never rendered empty or as a placeholder.
const PLACEHOLDER = "Coming soon";
function viewModel(career: ResolvedCareer) {
  const p = career.profile;
  const facts = p?.facts ?? [
    { label: "Median salary", value: career.medianSalary },
    { label: "Degree required", value: career.degreeRequired },
    { label: "Common majors", value: career.commonMajors },
  ];
  const ladder: ProfileRung[] =
    p?.ladder ??
    (career.ladder ?? []).map((r) => ({ number: r.number, jobTitle: r.jobTitle, pay: r.salary, description: r.oneLiner, whatYouDo: r.skills, toGetHere: [] }));
  const whatTheyDo = !p && career.whatTheyActuallyDo && career.whatTheyActuallyDo !== PLACEHOLDER ? career.whatTheyActuallyDo : null;
  return {
    summary: p?.summary ?? career.description,
    scenario: p?.scenario ?? career.realLifeExample,
    whatTheyDo,
    facts: facts.filter((f) => f.value && f.value !== PLACEHOLDER),
    payByState: p?.payByState,
    knowAbout: p?.knowAbout ?? [],
    goodAt: p?.goodAt ?? [],
    software: career.software ?? [],
    ladder,
    education: p?.education,
    sources: p?.sources,
    details: p?.factDetails,
  };
}

export function CareerDetailExperience({ slug }: { slug: string }) {
  const router = useRouter();
  const career = resolveCareer(slug);
  const [openRung, setOpenRung] = useState<string | null>(null);
  const [openFact, setOpenFact] = useState<keyof FactDetails | null>(null);
  // the (i) that opened the popover, kept in state (not a ref) so render can read it
  const [factAnchor, setFactAnchor] = useState<HTMLElement | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!career) {
    return (
      <div className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col items-center justify-center gap-[var(--space-4)] overflow-hidden px-5 text-center" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)" }}>
        <p className="relative z-10 text-[20px] font-bold">We don&apos;t have that career yet.</p>
        <Link href="/explore?tab=browse" className="dm-solid relative z-10 flex min-h-[44px] items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          Back to Explore
        </Link>
      </div>
    );
  }

  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const similar = similarCareers(career);
  const hasSimulation = !!simulationFor(career.slug);
  const hasGlossaryGame = hasGlossary(career.slug);
  const vm = viewModel(career);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      {/* Same ground as Home, Explore, Profile and Connect: the color stack
         plus the space backdrop, never a flat black page. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative backdrop, same element the other app screens use */}
        <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
      </div>
      <div className="no-print">
        <DesktopNavigation active="Explore" />
      </div>
      <header className="no-print relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      <main className="seq-reveal relative z-10 mx-auto flex w-full max-w-[1040px] flex-col gap-[var(--space-6)] px-5 pb-[120px] md:px-8 md:pt-[var(--space-4)]">
        <button
          type="button"
          onClick={() => router.back()}
          className={`dm-link ${SMALL} flex w-fit cursor-pointer items-center gap-[6px] font-semibold`}
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Explore
        </button>

        {/* Header card: the poster photo, full bleed, with the same legibility
           stack as the For You reel and the Connect cards (progressive blur up
           from the bottom, a soft vignette, a light top scrim) and nothing
           else: no color wash. Title, one line on what it is, one line to
           imagine it, and the actions all sit inside the card, on the frosted
           lower half. */}
        <section className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "var(--card)", color: "#fff", textShadow: CARD_TEXT_SHADOW }}>
          {/* Faces stay in frame (direct feedback): the poster photos carry the
             subject in their upper part, so the crop anchors near the top. On
             phones the photo runs behind the whole card; from md up it sits on
             the right half at its natural framing and fades into the card's
             dark base toward the text, so nothing is cropped to fit a wide
             band. */}
          <div className="absolute inset-0" aria-hidden style={{ background: "#0e0c20" }}>
            <Image src={career.photo} alt="" fill sizes="100vw" className="object-cover md:hidden" style={{ objectPosition: HERO_FOCUS[career.slug] ?? "50% 12%" }} />
            <span className="absolute inset-y-0 right-0 hidden w-[50%] md:block">
              <Image src={career.photo} alt="" fill sizes="520px" className="object-cover" style={{ objectPosition: HERO_FOCUS[career.slug] ?? "50% 12%" }} />
              <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0e0c20 0%, rgba(14,12,32,0.6) 30%, transparent 70%)" }} />
            </span>
            <CardProgressiveBlur size="60%" />
            <span className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.94) 0%, rgba(12,16,35,0.7) 34%, rgba(12,16,35,0.22) 62%, transparent 100%), ${cardTopScrim()}` }} />
          </div>
          <div className="relative flex min-h-[300px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-6)] pt-[120px] sm:p-[var(--space-8)] sm:pt-[120px] md:min-h-[320px]">
            <div className="flex flex-col gap-[var(--space-3)] md:max-w-[62%]">
              {/* The career's own poster face (the browse card's approved per-world
                 font), not the display face: the title should look like the card
                 the student tapped to get here. */}
              <h1 className="w-full text-[36px] leading-[40px] uppercase sm:text-[clamp(48px,3.6vw,60px)] sm:leading-[1]" style={{ ...posterTitleFont(career.world), textWrap: "balance" }}>
                {career.title}
              </h1>
              {vm.summary && <p className={`${MEDIUM} max-w-[34ch]`}>{vm.summary}</p>}
              {/* Actions sit under the summary, left-aligned with the text
                 (direct feedback), not floated to the far corner. */}
              <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)]" style={{ textShadow: "none" }}>
              {hasSimulation && (
                <button
                  type="button"
                  onClick={() => router.push(`/play/${career.slug}`)}
                  className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  <Gamepad2 className="h-4 w-4" aria-hidden /> Play Game
                </button>
              )}
              {hasGlossaryGame && (
                <button
                  type="button"
                  onClick={() => router.push(`/play/glossary/${career.slug}`)}
                  className="dm-quiet flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.4)", color: "#fff" }}
                >
                  <BookOpen className="h-4 w-4" aria-hidden /> Glossary Game
                </button>
              )}
              <div className="flex items-center gap-[var(--space-2)]">
                <IconButton label="Add to my list"><Plus className="h-5 w-5" aria-hidden /></IconButton>
                <IconButton label="Like this career" active={liked} onClick={() => { setLiked((v) => !v); if (!liked) setDisliked(false); }}>
                  <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} aria-hidden />
                </IconButton>
                <IconButton label="Not for me" active={disliked} onClick={() => { setDisliked((v) => !v); if (!disliked) setLiked(false); }}>
                  <ThumbsDown className="h-5 w-5" fill={disliked ? "currentColor" : "none"} aria-hidden />
                </IconButton>
                <IconButton label={saved ? "Saved" : "Save for later"} active={saved} onClick={() => setSaved((v) => !v)}>
                  <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} aria-hidden />
                </IconButton>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* The "imagine" line lives on the page, not in the header (direct
           feedback): one plain paragraph before the facts. */}
        {vm.scenario && <p className={`${SMALL} -mt-[var(--space-2)] max-w-[62ch]`} style={{ color: "var(--muted-foreground)" }}>{vm.scenario}</p>}

        {/* Quick facts: one strip, internal dividers, label over figure. */}
        {vm.facts.length > 0 && (
          <section aria-label="Quick facts" className={`grid grid-cols-2 rounded-[var(--radius-lg)] border ${vm.facts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`} style={PANEL}>
            {vm.facts.map((fact, i) => (
              <div
                key={fact.label}
                data-fact-cell
                className={`relative flex flex-col gap-[6px] p-[var(--space-4)] sm:px-[var(--space-5)] sm:py-[var(--space-5)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t" : ""} ${vm.facts.length === 3 ? "sm:border-t-0 sm:[&:nth-child(n+2)]:border-l" : "sm:border-t-0 sm:[&:nth-child(n+2)]:border-l"}`}
                style={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                <span className="flex items-center gap-[6px]">
                  <span className={LABEL}>{fact.label}</span>
                  {factKey(fact.label) && vm.details?.[factKey(fact.label)!] && (
                    <button
                      type="button"
                      aria-label={`About ${fact.label.toLowerCase()}`}
                      aria-expanded={openFact === factKey(fact.label)}
                      onClick={(e) => {
                        setFactAnchor(e.currentTarget);
                        setOpenFact((v) => (v === factKey(fact.label) ? null : factKey(fact.label)));
                      }}
                      className="dm-quiet flex size-6 cursor-pointer items-center justify-center rounded-full"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <Info className="h-[15px] w-[15px]" aria-hidden />
                    </button>
                  )}
                </span>
                <Figure accent={accent}>{fact.value}</Figure>
                {openFact === "pay" && factKey(fact.label) === "pay" && vm.details?.pay && (
                  <FactPopover anchor={factAnchor} onClose={() => setOpenFact(null)}>
                    <dl className="flex flex-col gap-[6px]">
                      {[["Starting out", vm.details.pay.starting], ["Typical", vm.details.pay.typical], ["Top earners", vm.details.pay.top]].map(([k, v]) => (
                        <div key={k} className="flex items-baseline justify-between gap-[var(--space-4)]">
                          <dt className={SMALL} style={{ color: "var(--muted-foreground)" }}>{k}</dt>
                          <dd><Figure accent={accent}>{v}</Figure></dd>
                        </div>
                      ))}
                    </dl>
                    {vm.details.pay.note && <p className={`${TINY} mt-[10px]`} style={{ color: "var(--muted-foreground)" }}>{vm.details.pay.note}</p>}
                  </FactPopover>
                )}
                {openFact === "openings" && factKey(fact.label) === "openings" && vm.details?.openings && (
                  <FactPopover anchor={factAnchor} onClose={() => setOpenFact(null)}>
                    <p className={TINY}>{vm.details.openings.note}</p>
                  </FactPopover>
                )}
              </div>
            ))}
          </section>
        )}

        {vm.payByState && (
          <Section title={vm.payByState.title ?? "Pay by state"}>
            {/* No "Whole country" tab: it only repeated the Typical pay figure
               already in the facts strip (direct feedback). */}
            <div className="flex flex-col gap-[var(--space-6)]">
              {vm.payByState.yourStates && vm.payByState.yourStates.length > 0 && (
                <div className="flex flex-col gap-[var(--space-2)]">
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>Your states</h3>
                  <PayRows rows={vm.payByState.yourStates} accent={accent} />
                </div>
              )}
              <div className="flex flex-col gap-[var(--space-2)]">
                {vm.payByState.yourStates && vm.payByState.yourStates.length > 0 && <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>Best states</h3>}
                <PayRows rows={vm.payByState.best} accent={accent} />
              </div>
            </div>
          </Section>
        )}

        {vm.ladder.length > 0 && (
          <Section title="Career ladder">
            <ol className="flex flex-col">
              {vm.ladder.map((rung) => (
                <Rung key={rung.number} rung={rung} accent={accent} open={openRung === rung.number} onToggle={() => setOpenRung((v) => (v === rung.number ? null : rung.number))} />
              ))}
            </ol>
          </Section>
        )}

        {/* Folded from here down. */}
        {vm.whatTheyDo && (
          <Folded id="what-they-do" title="What they actually do" open={openSections.has("what-they-do")} onToggle={() => toggleSection("what-they-do")}>
            <p className={`${SMALL} max-w-[68ch]`}>{vm.whatTheyDo}</p>
          </Folded>
        )}

        {vm.knowAbout.length > 0 && (
          <Folded id="know-about" title="What you need to know about" open={openSections.has("know-about")} onToggle={() => toggleSection("know-about")}>
            <DotList items={vm.knowAbout} accent={accent} />
          </Folded>
        )}

        {vm.goodAt.length > 0 && (
          <Folded id="good-at" title="What you would need to be good at" open={openSections.has("good-at")} onToggle={() => toggleSection("good-at")}>
            <DotList items={vm.goodAt} accent={accent} />
          </Folded>
        )}

        {vm.software.length > 0 && (
          <Folded id="software" title="Software you would use" open={openSections.has("software")} onToggle={() => toggleSection("software")}>
            <DotList items={vm.software} accent={accent} />
          </Folded>
        )}

        {vm.education && (
          <Folded
            id="education"
            title="Education"
            open={openSections.has("education")}
            onToggle={() => toggleSection("education")}
          >
            <div className="grid gap-[var(--space-6)] sm:grid-cols-2">
              <div className="flex flex-col gap-[var(--space-3)]">
                <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>What people study for it</h3>
                <ul className="flex flex-col gap-[var(--space-2)]">
                  {vm.education.studies.map((s) => (
                    <li key={s.name}>
                      {s.href ? (
                        <a href={s.href} target="_blank" rel="noreferrer" className={`dm-link ${SMALL} inline-flex items-center gap-[6px]`} style={{ color: "var(--accent-subtle)" }}>
                          {s.name} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        <span className={`${SMALL} inline-flex items-center gap-[var(--space-3)]`}>
                          <span aria-hidden className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: accent }} />
                          {s.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-[var(--space-3)]">
                <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>Where you would study it</h3>
                <ul className="flex flex-col">
                  {vm.education.where.map((w, i) => (
                    <li key={w.credential} className={`flex items-baseline gap-[var(--space-4)] py-[var(--space-2)] ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
                      <span className={`${SMALL} w-[48px] flex-none font-bold tabular-nums`} style={DISPLAY}>{w.count}</span>
                      {w.href ? (
                        <a href={w.href} target="_blank" rel="noreferrer" className={`dm-link ${SMALL} inline-flex items-center gap-[6px]`} style={{ color: "var(--accent-subtle)" }}>
                          {w.credential} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        <span className={SMALL}>{w.credential}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Folded>
        )}

        {similar.length > 0 && (
          <Section title="Careers like this one">
            <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] md:mx-0 md:px-0" style={{ touchAction: "pan-x pan-y" }}>
              {similar.map((c) => (
                <PosterCard key={c.title} career={c} onClick={() => router.push(`/career/${careerSlug(c.title)}`)} />
              ))}
            </div>
          </Section>
        )}

        {openFact === "degree" && vm.details?.degree && (
          <DegreeSheet career={career.title} detail={vm.details.degree} accent={accent} onClose={() => setOpenFact(null)} />
        )}

        {vm.sources && (
          <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{vm.sources}</p>
        )}
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
