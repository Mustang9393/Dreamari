"use client";

// DEMO-ONLY: Career actions lab copy of the real career page
// (src/components/career/CareerDetailExperience.tsx, forked 26 Sept 2026).
// Identical except for the action controls, their feedback, and links that
// stay inside the lab. Reads and writes the lab's own store (labStore.ts),
// never the real saved careers or Top 3. The proposal, in the user's words
// (26 Sept 2026): Save, Top 3, Like and Not for me "need to be somehow taught
// to the student without coachmarks", in exact context, not a mockup.
//
// What changed from the real page:
// - One primary action on every career: Play Game when a game exists,
//   otherwise Add to Top 3 (the step every career has).
// - Top 3 and Save are labeled pills that say their state ("#2 in Top 3",
//   "Saved"); Top 3's glyph is a "3", not a bare +/-.
// - Like and Not for me moved below the overview as "Is this career for
//   you?", after the student has read about it. Like trains recommendations;
//   Save builds the list Top 3 is picked from.
// - No coachmarks and no first-time tip toasts: the feedback bar says what
//   happened, where it went, and how to undo it.

import Image from "next/image";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { BorderBeam } from "border-beam";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Bookmark, BookmarkCheck, BookOpen, ChevronDown, ChevronRight, Gamepad2, Heart, Info, Sparkles, ThumbsDown, Users, X } from "lucide-react";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { IconTip } from "@/components/app/IconTip";
import { ConnectWithProfessionalsModal } from "@/components/career/ConnectWithProfessionalsModal";
import { PROS } from "@/components/connect/data";
import { react, toggleSave, toggleTop3, useLab } from "./labStore";
import { LAB_CAREER, LabLayer, LabPill, Top3Glyph } from "./labUi";
import { PosterCard } from "@/components/app/PosterCard";
import { Segmented } from "@/components/connect/viz";
import { PayMap } from "@/components/career/PayMap";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { hasGlossary } from "@/components/glossary/data";
import { simulationFor } from "@/components/play/games";
import { resolveCareer, similarCareers, type ResolvedCareer } from "@/components/career/data";
import type { FactDetails, ProfileRung } from "@/components/career/profiles";
import { careerSlug } from "@/components/career/slug";

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
export const DISPLAY = { fontFamily: "var(--font-display)" } as const;
export const BIG = "text-[22px] leading-[26px] font-bold tracking-[-0.01em] sm:text-[26px] sm:leading-[30px]";
export const MEDIUM = "text-[18px] leading-[24px] font-semibold";
const FIGURE = "text-[18px] leading-[24px] font-bold tabular-nums";
export const LABEL = "text-[16px] leading-[22px] font-semibold";
export const SMALL = "text-[15px] leading-[22px]";
const TINY = "text-[14px] leading-[20px]";
// The frosted panel every info box on this page sits in (direct feedback:
// more contrast, frostier): a stronger glass fill, a real backdrop blur and a
// brighter hairline than the page's default glass-surface-1.
export const PANEL = { background: "color-mix(in srgb, var(--glass-surface-2) 100%, transparent)", backdropFilter: "blur(16px) saturate(1.65)", WebkitBackdropFilter: "blur(16px) saturate(1.65)", borderColor: "var(--glass-border)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)" } as const;

// Per-career photo focal point for the header panel (most posters carry the
// subject in the upper half; the exceptions are listed here).
// Checked poster by poster against the phone header box (335x300, 2026-09-03):
// the default keeps heads in frame for portraits shot at chest height; these
// are the exceptions (heads at the very top edge, or a top-down shot with the
// face low in the frame).
const HERO_FOCUS: Record<string, string> = {
  "asset-management": "center 68%",
  "sports-medicine-doctor": "50% 0%",
  animator: "50% 0%",
  "game-designer": "50% 0%",
  "video-game-designer": "50% 0%",
  "pediatric-surgeon": "50% 0%",
  electrician: "50% 0%",
  quant: "50% 48%",
};

// Custom-designed edge case, 22 Sept 2026: the header photo had no
// `onError` handling -- unlike Match's grid, this hero already sits on a
// solid dark base (`#0e0c20`) with its own gradient/blur scrims layered as
// separate elements, so a failed photo doesn't need a new placeholder
// graphic; it just needs to stop trying to paint a broken image on top of
// an already-complete backdrop. On failure this renders nothing, and the
// existing base + scrims (plus the title, which never depended on the
// photo) carry the header exactly as designed.
function HeroPhoto({ photo, sizes, className, objectPosition }: { photo: string; sizes: string; className: string; objectPosition: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <Image src={photo} alt="" fill sizes={sizes} className={className} style={{ objectPosition }} onError={() => setFailed(true)} />;
}

// ---- Key figure: production's gradient numeral, in the world accent -------
// Used sparingly (direct feedback): typical pay, pay by state, ladder pay.
// Same size tier as the body value it replaces, so it never outsizes the
// label above it; the gradient carries the emphasis, not the size.
export function Figure({ children, accent }: { children: React.ReactNode; accent: string }) {
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
export function Section({ id, title, action, children }: { id?: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="flex w-full scroll-mt-[124px] flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
      {/* the title row is ruled off edge to edge (direct feedback): the line
         runs through the panel's padding to touch both borders */}
      <div className="-mx-[var(--space-5)] flex flex-wrap items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]" style={{ borderColor: "var(--glass-border)" }}>
        <h2 className={BIG} style={DISPLAY}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Custom-designed edge case, 22 Sept 2026: ~150 of ~200 catalog careers
// have no authored profile or report yet (a real, common gap, not rare --
// see COMPONENT_STATES_DESIGN_LOG.md), and every tab below used to render
// nothing at all when its data was missing -- straight from the tab bar to
// "Careers like this one" with a dead gap in between, reading as a broken
// page rather than a career whose detail just isn't written yet. Verified
// live with a synthetic catalog-only test career (no profile, no report).
// Not wrapped in the same bordered `Section` panel real content uses --
// deliberately lighter, so it reads as "nothing here yet," not "here's
// real content in a panel that happens to be short."
function TabComingSoon({ title, career }: { title: string; career: string }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-10)] text-center">
      <Sparkles className="h-6 w-6" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      <p className={`${MEDIUM}`} style={{ color: "var(--foreground)" }}>{title} coming soon</p>
      <p className={`${SMALL} max-w-[42ch]`} style={{ color: "var(--muted-foreground)" }}>
        We don&apos;t have this written up for {career} yet. Check back soon, or explore a similar career below.
      </p>
    </div>
  );
}

// One marker, one line per item. The marker is the world accent so the list
// reads as this career's without a second color system. Shared by College
// Detail too (CollegeDetailExperience.tsx imports this directly).
export function DotList({ items, accent, leading }: { items: string[]; accent: string; leading?: (item: string) => React.ReactNode }) {
  // Custom-designed edge case, 22 Sept 2026: field-level gaps, not just a
  // whole section missing -- direct report: "sometimes a few points inside
  // a section or 1 point inside a section will be missing." An authored
  // array with one blank/whitespace-only string in it (a partial content
  // edit, a generation gap) used to render a bullet marker with nothing
  // after it. Filtered here once, so every caller (Career Detail's Know
  // About/Good At, College Detail's admissions factor lists) gets it for
  // free rather than each needing its own filter.
  const clean = items.filter((item) => item.trim().length > 0);
  // The rarer case: every item in the array was blank (not just one), so
  // filtering leaves nothing -- callers gate on the RAW array's length
  // before rendering the section heading above this list, so without this
  // the heading would show with an empty <ul> under it. One line, matching
  // the same "not authored yet" convention as everywhere else.
  if (clean.length === 0) {
    return <p className={`${SMALL} italic`} style={{ color: "var(--muted-foreground)" }}>Not written up yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-[var(--space-3)]">
      {clean.map((item) => (
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
    <li className="border-t first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
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
        <span className={`${MEDIUM} min-w-0 text-balance sm:truncate`}>{rung.jobTitle}</span>
        <span className="flex items-center gap-[var(--space-3)]">
          {rung.pay && <Figure accent={accent}>{rung.pay}</Figure>}
          {hasDetail && <ChevronDown className="h-5 w-5 flex-none transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden />}
        </span>
      </button>
      {hasDetail && open && (
        <div className="flex flex-col gap-[var(--space-3)] pb-[var(--space-5)] pl-[48px]">
          {rung.description && <p className="max-w-[62ch] text-[16px] leading-[24px]">{rung.description}</p>}
          {/* two short lists, one under the other, so what each level asks
             for reads at a glance and the climb between levels is visible */}
          {(rung.whatYouDo.length > 0 || rung.toGetHere.length > 0) && (
            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
              {[["What you do", rung.whatYouDo], ["What you need", rung.toGetHere]].map(([label, items]) => (items as string[]).length > 0 && (
                <div key={label as string} className="flex flex-col gap-[6px]">
                  <h4 className={`${SMALL} font-semibold`} style={{ color: accent }}>{label as string}</h4>
                  <ul className="m-0 flex list-none flex-col gap-[4px] p-0">
                    {(items as string[]).map((item) => (
                      <li key={item} className={`${SMALL} flex gap-[8px]`} style={{ color: "var(--foreground)" }}>
                        <span aria-hidden className="mt-[9px] size-[5px] flex-none rounded-full" style={{ background: accent }} />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
  // Custom-designed edge case, 22 Sept 2026: a `payByState` object can
  // exist (so the tab doesn't fall back to TabComingSoon) while its own
  // `best` array is empty -- a partial-content gap one level down, same
  // class as DotList's blank-item fallback. Without this, "Best states"
  // rendered as either a bare heading over nothing, or (with no
  // `yourStates` either) a section with a tab toggle and no content
  // beneath it at all.
  if (rows.length === 0) {
    return <p className={`${SMALL} italic`} style={{ color: "var(--muted-foreground)" }}>Pay data coming soon.</p>;
  }
  return (
    <ul className="flex flex-col">
      {rows.map((row) => {
        const isFigure = /\d/.test(row.pay);
        return (
          <li key={row.state} className="flex min-w-0 items-center justify-between gap-[var(--space-3)] border-t py-[10px] first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
            <span className={`${SMALL} min-w-0 truncate`} style={{ color: "var(--foreground)" }}>{row.state}</span>
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
        // minHeight: 0 -- same fix as FlowChrome.tsx: `.theme-light` (tokens.css)
        // sets `min-height: 100%` for full-page themeable surfaces, but this
        // small floating popover only wants the class for its CSS variables.
        // Cancels the ambient "proportional wide-screen scaling"
        // (globals.css, body { zoom: 1.1/1.25 } above 1441px/1800px):
        // pos.top/pos.left above are already TRUE post-zoom screen
        // coordinates from anchor.getBoundingClientRect(), so left unreset
        // they get zoomed a second time on render. `zoom: 1` alone is NOT
        // enough -- zoom compounds down the tree, it doesn't reset to 1; the
        // reciprocal of the ambient factor does. --vz is the same custom
        // property globals.css sets alongside body's zoom for exactly this
        // purpose. Same fix as xpFlight.ts and the shared
        // profile/CareerReport.tsx Portal.
        style={{ top: pos.top, left: pos.left, width: pos.width, minHeight: 0, zoom: "calc(1 / var(--vz, 1))", background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 24px 48px -24px rgba(0,0,0,0.8)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

// The degree sheet: the three door questions, the note, the "not the only
// route" line, and how people in the job actually finished, as bars.
function DegreeSheet({ career, detail, onClose }: { career: string; detail: NonNullable<FactDetails["degree"]>; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="degree-sheet-title" style={{ fontFamily: "var(--font-body)", background: "transparent" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.62)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
      <div
        className="dm-scroll relative z-[1] flex max-h-[92dvh] w-full max-w-[600px] flex-col gap-[var(--space-5)] overflow-y-auto rounded-t-[var(--radius-xl)] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)] sm:p-[var(--space-6)]"
        style={{ background: "color-mix(in srgb, var(--background) 95%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)", color: "var(--foreground)" }}
      >
        <div className="flex items-start justify-between gap-[var(--space-4)]">
          <div className="flex flex-col gap-[2px]">
            <h2 id="degree-sheet-title" className={BIG} style={DISPLAY}>What you need to get in</h2>
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>{career}</p>
          </div>
          <IconTip label="Close">
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </IconTip>
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
    facts: facts.filter((f) => f.value && f.value !== PLACEHOLDER && !/people doing|jobs open/i.test(f.label)),
    payByState: p?.payByState,
    knowAbout: p?.knowAbout ?? [],
    goodAt: p?.goodAt ?? [],
    software: career.software ?? [],
    ladder,
    education: p?.education,
    sources: p?.sources,
    details: p?.factDetails,
    typicalPay: p?.facts.find((f) => f.label === "Typical pay")?.value ?? career.medianSalary,
  };
}

// Horizontal tabs (15 Sept 2026 direct feedback: match the Explore School
// detail page's own tab structure -- "once a student understands how to
// navigate one detail page, they should immediately understand the other").
// The header's summary/scenario line and the Typical Degree/Typical Pay
// facts stay outside the tab system, always visible above it, the same way
// College Detail keeps its photo header and action row above its own tabs.
type CareerTab = "overview" | "education" | "ladder" | "pay" | "software";
const CAREER_TABS: { key: CareerTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "education", label: "Education" },
  { key: "ladder", label: "Career Ladder" },
  { key: "pay", label: "Pay" },
  { key: "software", label: "Software" },
];

export function CareerDetailLab({ slug }: { slug: string }) {
  const router = useRouter();
  const career = resolveCareer(slug);
  // Open at the top. Arriving from a rail deep in Explore or Home kept the
  // previous page's scroll position, so the page opened mid-way (direct
  // feedback, 4 Sept 2026). A hash link to a section is left alone.
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);
  const [openRung, setOpenRung] = useState<string | null>(null);
  const [openFact, setOpenFact] = useState<keyof FactDetails | null>(null);
  // Pay by state: the list of your states and the best states, or the whole
  // country as a shaded map. A view switch over the same data.
  const [payView, setPayView] = useState<"states" | "country">("states");
  // the (i) that opened the popover, kept in state (not a ref) so render can read it
  const [factAnchor, setFactAnchor] = useState<HTMLElement | null>(null);
  const [tab, setTab] = useState<CareerTab>("overview");
  const lab = useLab();
  const [connectOpen, setConnectOpen] = useState(false);
  // A page loading from a backend has no saved/Top 3 state yet: the pills
  // wait as skeletons rather than flash the wrong state (the lab's Slow
  // network shows it for a moment on arrival).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), lab.network === "normal" ? 0 : 900);
    return () => window.clearTimeout(t);
  }, [lab.network]);

  if (!career) {
    return (
      <div className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col items-center justify-center gap-[var(--space-4)] overflow-hidden px-5 text-center" style={{ background: "transparent", color: "var(--foreground)" }}>
        <p className="relative z-10 text-[20px] font-bold">We don&apos;t have that career yet.</p>
        <Link href="/actions-lab/explore?tab=browse" className="dm-solid relative z-10 flex min-h-[44px] items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          Back to Explore
        </Link>
      </div>
    );
  }

  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const similar = similarCareers(career);
  const hasSimulation = !!simulationFor(career.slug);
  const hasGlossaryGame = hasGlossary(career.slug);
  const hasWorldProfessionals = PROS.some((pro) => pro.world === career.world);
  const saved = lab.saved.includes(career.slug);
  const rank = lab.top3.indexOf(career.slug);
  const reaction = lab.reaction[career.slug] ?? null;

  const vm = viewModel(career);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      {/* Same ground as Home, Explore, Profile and Connect: one AppBackdrop,
         which already carries the space sheet. This page used to stack two
         backdrops plus a third copy of the sheet, so it read lighter than
         every other screen. */}
      <AppBackdrop />
      <DesktopNavigation active="Explore" extraClassName="no-print" />
      <MobileHeaderShell extraClassName="no-print">
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="seq-reveal relative z-10 mx-auto flex w-full max-w-[1040px] flex-col gap-[var(--space-6)] px-5 pb-[120px] md:px-8 md:pt-[var(--space-4)]">
        <button
          type="button"
          onClick={() => {
            // No fallback before (direct feedback, 9 Sept 2026: a back
            // control needs a real destination, not a bare history call
            // that's a no-op with nothing to go back to) -- this page is
            // reachable via a direct/shared link, so history can be empty.
            if (window.history.length > 1) router.back();
            else router.push("/actions-lab/explore");
          }}
          className={`dm-link ${SMALL} flex w-fit cursor-pointer items-center gap-[6px] font-semibold`}
          style={{ color: "var(--muted-foreground)" }}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Explore
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
            <HeroPhoto photo={career.photo} sizes="100vw" className="object-cover md:hidden" objectPosition={HERO_FOCUS[career.slug] ?? "50% 12%"} />
            <span className="absolute inset-y-0 right-0 hidden w-[50%] md:block">
              <HeroPhoto photo={career.photo} sizes="520px" className="object-cover" objectPosition={HERO_FOCUS[career.slug] ?? "50% 12%"} />
              <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0e0c20 0%, rgba(14,12,32,0.45) 26%, transparent 58%)" }} />
            </span>
            <CardProgressiveBlur size="52%" />
            {/* lighter than before (direct feedback: the blur and the side fade
               already carry the type, so the photo can show) */}
            <span className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.86) 0%, rgba(12,16,35,0.5) 32%, rgba(12,16,35,0.1) 60%, transparent 100%), linear-gradient(to bottom, rgba(10,9,20,0.35) 0%, rgba(10,9,20,0.1) 40%, transparent 65%)` }} />
          </div>
          <div className="relative flex min-h-[300px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-6)] pt-[120px] sm:p-[var(--space-8)] sm:pt-[120px] md:min-h-[320px]">
            <div className="flex flex-col gap-[var(--space-3)] md:max-w-[62%]">
              {/* The career's own poster face (the browse card's approved per-world
                 font), not the display face: the title should look like the card
                 the student tapped to get here. */}
              <h1 className="w-full text-[36px] leading-[40px] uppercase sm:text-[clamp(48px,3.6vw,60px)] sm:leading-[1]" style={{ ...posterTitleFont(career.world), textWrap: "balance" }}>
                {career.title}
              </h1>
              {/* The world, in its accent, right under the title: the same
                 title-then-world pairing the browse cards use everywhere else
                 (direct feedback). */}
              <span className="text-[12px] leading-[16px] font-semibold tracking-[0.6px] uppercase" style={{ color: `color-mix(in srgb, ${accent} 70%, #ffffff)`, fontFamily: "var(--font-body)" }}>{career.world}</span>
              {vm.summary && <p className={`${LABEL} max-w-[40ch] pt-[2px]`}>{vm.summary}</p>}
              {/* Actions sit under the summary, left-aligned with the text
                 (direct feedback), not floated to the far corner. */}
              <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)]" style={{ textShadow: "none" }}>
              {/* One primary on every career: Play when a game exists,
                 otherwise Add to Top 3. Then Save. Then the extras. */}
              {!ready ? (
                <>{[150, 108, 110].map((w) => <span key={w} aria-hidden className="h-[44px] animate-pulse rounded-[var(--radius-md)]" style={{ width: w, background: "rgba(255,255,255,0.12)" }} />)}</>
              ) : (
              <>
              {hasSimulation && (
                // Solid var(--primary) fill used to sit flush against the beam
                // ring and swallow it -- same fix as GetHired/Connect's solid
                // CTAs earlier this session: a translucent tint instead.
                <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}>
                <button
                  type="button"
                  onClick={() => router.push(`/play/${career.slug}`)}
                  className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold"
                  style={{ background: "color-mix(in srgb, var(--primary) 32%, rgba(12,16,35,0.6))", borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)", color: "#fff" }}
                >
                  <Gamepad2 className="h-4 w-4" aria-hidden /> Play Game
                </button>
                </BorderBeam>
              )}
              <LabPill
                primary={!hasSimulation}
                on={rank >= 0}
                busy={lab.pending === `top3:${career.slug}`}
                onClick={() => toggleTop3(career.slug, career.title)}
                icon={<Top3Glyph on={rank >= 0} size={17} />}
                ariaLabel={rank >= 0 ? `#${rank + 1} in your Top 3. Tap to remove from your Top 3` : "Add to Top 3"}
              >
                {rank >= 0 ? `#${rank + 1} in Top 3` : "Add to Top 3"}
              </LabPill>
              <LabPill
                on={saved}
                busy={lab.pending === `save:${career.slug}`}
                onClick={() => toggleSave(career.slug, career.title)}
                icon={saved ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
                ariaLabel={saved ? "Saved. Tap to remove from Saved" : "Save"}
              >
                {saved ? "Saved" : "Save"}
              </LabPill>
              {hasGlossaryGame && (
                <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}>
                <button
                  type="button"
                  onClick={() => router.push(`/play/glossary/${career.slug}`)}
                  className="dm-quiet flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.55)", color: "#fff" }}
                >
                  <BookOpen className="h-4 w-4" aria-hidden /> Glossary Game
                </button>
                </BorderBeam>
              )}
              {/* Ported from the Replit reference (dceeai.replit.app/explore-careers):
                 view a career -> tap Connect -> "Connect with [World]
                 Professionals" -- Ask / Answers / People. Hidden when the
                 world has no real professionals (PROS has no entry for it):
                 direct feedback, 21 Sept 2026, confirmed the button should
                 not appear rather than open to an empty modal. */}
              {hasWorldProfessionals && (
                <button
                  type="button"
                  onClick={() => setConnectOpen(true)}
                  className="dm-quiet flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.55)", color: "#fff" }}
                >
                  <Users className="h-4 w-4" aria-hidden /> Connect
                </button>
              )}
              </>
              )}
              </div>
            </div>
          </div>
        </section>

        {/* The "imagine" line lives on the page, not in the header (direct
           feedback): one plain paragraph before the facts. */}
        {vm.scenario && <p className={`${SMALL} -mt-[var(--space-2)] max-w-[62ch]`} style={{ color: "var(--muted-foreground)" }}>{vm.scenario}</p>}

        {/* Quick facts: one strip, internal dividers, label over figure.
           Stays above the tabs (direct feedback, 15 Sept 2026: "keep Typical
           Degree and Typical Pay visible near the top before the tabs").
           Briefly reversed and reverted same day, 22 Sept 2026, after
           confirming this was a deliberate earlier decision, not a mistake
           -- kept as originally decided. */}
        {vm.facts.length > 0 && (
          // Custom-designed edge case, 22 Sept 2026: a thin catalog-only
          // career (no profile/report) can end up with exactly ONE fact
          // (median salary survives from the catalog; degree/majors fall
          // back to the literal "Coming soon" placeholder and viewModel()
          // filters those out entirely). The grid was always grid-cols-2 at
          // base regardless of count, so one fact left a dead, empty second
          // column inside the same full-bleed bordered panel -- reproduced
          // live with a synthetic thin-career test entry. grid-cols-1 for
          // the single-fact case only; 2/3/4-fact layouts are unchanged.
          <section id="facts" aria-label="Quick facts" className={`grid scroll-mt-[124px] ${vm.facts.length === 1 ? "grid-cols-1" : "grid-cols-2"} rounded-[var(--radius-lg)] border ${vm.facts.length === 1 ? "" : vm.facts.length === 3 ? "sm:grid-cols-3" : vm.facts.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-4"}`} style={PANEL}>
            {vm.facts.map((fact, i) => (
              <div
                key={fact.label}
                data-fact-cell
                className={`relative flex flex-col gap-[6px] p-[var(--space-4)] sm:px-[var(--space-5)] sm:py-[var(--space-5)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t" : ""} ${vm.facts.length === 3 ? "sm:border-t-0 sm:[&:nth-child(n+2)]:border-l" : "sm:border-t-0 sm:[&:nth-child(n+2)]:border-l"}`}
                style={{ borderColor: "var(--glass-border)" }}
              >
                {/* the (i) always sits top-right of the cell, on the label's
                   first line, whether the label wraps or not; the figure
                   always sits at the bottom, so figures line up across cells */}
                <span className="flex items-start justify-between gap-[6px]">
                  <span className={`${LABEL} min-w-0`}>{fact.label}</span>
                  {factKey(fact.label) && vm.details?.[factKey(fact.label)!] && (
                    <IconTip label={`About ${fact.label.toLowerCase()}`}>
                      <button
                        type="button"
                        aria-label={`About ${fact.label.toLowerCase()}`}
                        aria-expanded={openFact === factKey(fact.label)}
                        onClick={(e) => {
                          setFactAnchor(e.currentTarget);
                          setOpenFact((v) => (v === factKey(fact.label) ? null : factKey(fact.label)));
                        }}
                        className="dm-quiet -mr-[4px] -mt-[1px] flex size-6 flex-none cursor-pointer items-center justify-center rounded-full"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <Info className="h-[15px] w-[15px]" aria-hidden />
                      </button>
                    </IconTip>
                  )}
                </span>
                <span className="mt-auto"><Figure accent={accent}>{fact.value}</Figure></span>
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

        <Segmented ariaLabel="Career section" value={tab} onChange={setTab} options={CAREER_TABS} grow />

        {tab === "pay" && !vm.payByState && <TabComingSoon title="Pay" career={career.title} />}

        {tab === "pay" && vm.payByState && (
          <Section
            id="pay"
            title={vm.payByState.title ?? "Pay by state"}
            action={
              <div role="tablist" aria-label="Pay by state view" className="dm-glass flex items-center gap-[2px] rounded-full border p-[3px] backdrop-blur-[20px] backdrop-saturate-[1.5]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                {([["states", "Your states"], ["country", "Whole country"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={payView === id}
                    onClick={() => setPayView(id)}
                    className="dm-quiet relative min-h-[32px] cursor-pointer rounded-full px-[14px] text-[13px] leading-[16px] font-semibold"
                    style={{ color: payView === id ? "var(--background)" : "var(--foreground)" }}
                  >
                    {/* Fill slides between the two views via a shared
                       layoutId instead of snapping (direct feedback: "have
                       whatever highlight we end up keeping for tabs...
                       animate and slide over when we switch"). */}
                    {payView === id && (
                      <motion.span
                        layoutId="career-pay-view-pill"
                        aria-hidden
                        className="absolute inset-0 rounded-full"
                        style={{ background: "var(--foreground)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
            }
          >
            {payView === "states" ? (
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
            ) : (
              <PayMap
                typical={vm.typicalPay}
                rows={[...(vm.payByState.yourStates ?? []), ...vm.payByState.best]}
                yourState={vm.payByState.yourStates?.[0]?.state}
                accent={accent}
                seed={career.slug}
              />
            )}
          </Section>
        )}

        {tab === "ladder" && vm.ladder.length === 0 && <TabComingSoon title="Career ladder" career={career.title} />}

        {tab === "ladder" && vm.ladder.length > 0 && (
          <Section id="ladder" title="Career ladder">
            <ol className="flex flex-col">
              {vm.ladder.map((rung) => (
                <Rung key={rung.number} rung={rung} accent={accent} open={openRung === rung.number} onToggle={() => setOpenRung((v) => (v === rung.number ? null : rung.number))} />
              ))}
            </ol>
          </Section>
        )}

        {/* Overview: the general explanation of the career, then what it
           takes and what it asks for -- the same three ideas College
           Detail's own Overview tab groups (Key Facts, one panel per idea),
           just carried over as this page's existing three sections rather
           than reinvented. */}
        {tab === "overview" && !vm.whatTheyDo && vm.knowAbout.length === 0 && vm.goodAt.length === 0 && <TabComingSoon title="Overview" career={career.title} />}

        {tab === "overview" && (vm.whatTheyDo || vm.knowAbout.length > 0 || vm.goodAt.length > 0) && (
          <div className="flex flex-col gap-[var(--space-6)]">
            {vm.whatTheyDo && (
              <Section id="what-they-do" title="What they actually do">
                <p className={`${SMALL} max-w-[68ch]`}>{vm.whatTheyDo}</p>
              </Section>
            )}
            {vm.knowAbout.length > 0 && (
              <Section id="know-about" title="What you need to know about">
                <DotList items={vm.knowAbout} accent={accent} />
              </Section>
            )}
            {vm.goodAt.length > 0 && (
              <Section id="good-at" title="What you would need to be good at">
                <DotList items={vm.goodAt} accent={accent} />
              </Section>
            )}
          </div>
        )}

        {tab === "software" && vm.software.length === 0 && <TabComingSoon title="Software" career={career.title} />}

        {tab === "software" && vm.software.length > 0 && (
          <Section id="software" title="Software you would use">
            <DotList items={vm.software} accent={accent} />
          </Section>
        )}

        {tab === "education" && !vm.education && <TabComingSoon title="Education" career={career.title} />}

        {tab === "education" && vm.education && (
          <Section id="education" title="Education">
            <div className="grid gap-[var(--space-6)] sm:grid-cols-2">
              <div className="flex flex-col gap-[var(--space-3)]">
                <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>What people study for it</h3>
                <ul className="flex flex-col gap-[var(--space-2)]">
                  {vm.education.studies.map((s) => (
                    <li key={s.name} className={`${SMALL} flex items-center gap-[var(--space-3)]`}>
                      <span aria-hidden className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: accent }} />
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-[var(--space-3)]">
                <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>Where you would study it</h3>
                {/* the credential in words (no school counts, Josh's notes);
                   each one links to its college page. Those pages are not
                   designed yet, so the links land on the College Lookup shell
                   with the credential carried across as a placeholder. */}
                <ul className="flex flex-col gap-[var(--space-2)]">
                  {vm.education.where.map((w) => (
                    <li key={w.credential} className={`${SMALL} flex items-center gap-[var(--space-3)]`}>
                      <span aria-hidden className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: accent }} />
                      <Link href={w.href ?? `/colleges?type=${/certif/i.test(w.credential) ? "trade" : /associate/i.test(w.credential) ? "2-year" : "4-year"}`} className="dm-link flex min-h-[28px] items-center gap-[4px]" style={{ color: "var(--foreground)" }}>
                        {w.credential}
                        <ChevronRight className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: accent }} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        )}

        {/* Like and Not for me, after the student has read about the
           career, not before: they train recommendations (the feedback says
           so), they are not a list. */}
        <section aria-label="Is this career for you?" className="flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)]" style={PANEL}>
          <span className={`${LABEL}`}>Is this career for you?</span>
          <span className="flex flex-wrap gap-[var(--space-2)]">
            <LabPill small on={reaction === "like"} busy={lab.pending === `react:${career.slug}`} onClick={() => react(career.slug, "like")} icon={<Heart className="h-4 w-4" aria-hidden fill={reaction === "like" ? "currentColor" : "none"} />} ariaLabel={reaction === "like" ? "Liked. Tap to undo" : "Like: more like this"}>More like this</LabPill>
            <LabPill small on={reaction === "nope"} onClick={() => react(career.slug, "nope")} icon={<ThumbsDown className="h-4 w-4" aria-hidden fill={reaction === "nope" ? "currentColor" : "none"} />} ariaLabel="Not for me: fewer like this">Not for me</LabPill>
          </span>
        </section>

        {/* Careers like this one stays outside the tab system, at the
           bottom of the page regardless of which tab is open -- same
           placement College Detail gives Similar Schools (15 Sept 2026
           direct feedback: "Keep careers like this one on the bottom"). */}
        {similar.length > 0 && (
          <Section title="Careers like this one">
            {/* md:-mx-8 md:px-8 (not md:mx-0 md:px-0) -- mirrors `main`'s own
               md:px-8 so the rail bleeds to the true edge and re-pads back to
               the same content line, the same convention every other card
               rail in the app uses (Home, College Detail's Similar Schools).
               Zeroing the margin/padding on desktop, as this rail used to,
               left no trailing space for the last card to fade into --
               it just hard-clipped at the container edge (16 Sept 2026). */}
            <div className="poster-row -mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 py-5 [scrollbar-width:none] md:-mx-8 md:px-8" style={{ touchAction: "pan-x pan-y" }}>
              {similar.map((c) => (
                <PosterCard key={c.title} career={c} onClick={() => router.push(LAB_CAREER(careerSlug(c.title)))} />
              ))}
            </div>
          </Section>
        )}

        {openFact === "degree" && vm.details?.degree && (
          <DegreeSheet career={career.title} detail={vm.details.degree} onClose={() => setOpenFact(null)} />
        )}

        {vm.sources && (
          <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{vm.sources}</p>
        )}
      </main>

      {connectOpen && <ConnectWithProfessionalsModal world={career.world} onClose={() => setConnectOpen(false)} />}
      <LabLayer />

      <MobileNav active="Explore" />
    </div>
  );
}
