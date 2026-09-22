"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Check, ChevronLeft, Download, Expand, FileText, ListOrdered, Maximize2, MoreHorizontal, Pencil, Wand2, X, type LucideIcon } from "lucide-react";
import { atsIsStale, runAtsCheck } from "@/lib/resumeAts";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { useScrolled } from "@/components/app/chrome";
import { DreamyGuide } from "@/components/build/DreamyGuide";
import { WelcomeSplash } from "@/components/app/WelcomeSplash";
import { flyXp } from "@/components/app/xpFlight";
import { DreamScoreChip } from "@/components/app/DreamScoreChip";
import { NotificationsButton } from "@/components/app/Inbox";
import { AtsIcon } from "./AtsIcon";
import { Working } from "@/components/app/Working";
import { makeId, readResume, resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume, upsertVersion, type ResumeData, type ResumeExperience as ResumeExperienceEntry, type ResumeVersion } from "@/lib/resume";
import { ATSCheckPanel } from "./ATSCheckPanel";
import { DEFAULT_RESUME_TEMPLATE, RESUME_WIZARD_DREAMY, type ResumeTemplateId } from "./data";
import { EditSectionsPanel } from "./EditSectionsPanel";
import { ExperienceModal } from "./ExperienceModal";
import { ExportChecklistModal } from "./ExportChecklistModal";
import { JobMatchPanel } from "./JobMatchPanel";
import { ResumeExperience, useResumeWelcome } from "./ResumeExperience";
import { ResumeDocument, ZoomResumeButton, ZoomResumeModal } from "./ResumeDocument";
import { Portal } from "@/components/profile/CareerReport";
import { TailorScreen } from "./TailorScreen";
import { TemplateGallery } from "./TemplateGallery";
import { TextPreviewModal } from "./TextPreviewModal";
import { IconTip, ToolbarButton, useResumeToast, WizardProgress } from "./ui";
import { CertificationsStep, EducationStep, ExperienceStep, PersonalInfoStep, ReviewStep, SkillsStep } from "./wizardSteps";

/** XP per finished wizard step (the reference's point values), banked into
 *  the Dream Score once per milestone. */
const STEP_XP: Record<number, { xp: number; milestone: string }> = {
  0: { xp: 20, milestone: "resume:personal" },
  1: { xp: 10, milestone: "resume:education" },
  2: { xp: 15, milestone: "resume:experience" },
  3: { xp: 10, milestone: "resume:skills" },
  4: { xp: 10, milestone: "resume:certifications" },
};
/** The toast text alongside each STEP_XP award -- "+{n} pts {label}", the
 *  reference's own confirmed pattern (direct instruction, 20 Sept 2026),
 *  reusing whatever XP number this codebase already awards rather than
 *  the reference's own numbers. Personal Information/Education/Experience
 *  were checked live against the reference; Skills/Certifications'
 *  wording is inferred (not independently confirmed live) -- the same
 *  "added"/"selected" pattern the other required-entry steps use. The
 *  reference's own Personal Information toast read "Resume halfway
 *  done!" on the one run this was checked, on a profile that already had
 *  every other step filled in from earlier testing -- it may be a fixed
 *  per-step message, or a completeness-based milestone that happened to
 *  land there; there was no way to re-test from a genuinely empty account
 *  to tell which. Placed here exactly where it was observed either way.
 */
const STEP_XP_TOAST: Record<number, string> = {
  0: "Resume halfway done!",
  1: "Education added!",
  2: "Experience added!",
  3: "Skills selected!",
  4: "Certification added!", // inferred, see comment above
};
const CREATED_XP = 25;

// Which resume section the live preview auto-scrolls to as the student
// moves through the wizard -- matches the `data-section` markers each
// ResumeDocument layout carries (ResumeDocument.tsx).
// Personal Info (step 0) stays null on purpose (direct feedback, 14 Sept
// 2026: "the first zoom is just a scroll down and i dont think its needed
// for the first part... keep it so the preview shows the full header
// including the margin on top") -- nothing to scroll to yet, so the
// preview just rests at its natural top position instead of zooming into
// the header for no reason.
const WIZARD_STEP_SECTIONS = [null, "education", "experience", "skills", "certifications", null] as const;

// The 6-step wizard, full screen: a dedicated route rather than living under
// Profile's own tab chrome (direct feedback, 14 Sept 2026 -- squeezed under
// the profile header + tab row, it lost too much room, mobile worst of all).
// Data still writes straight to the shared resume store, so leaving mid-way
// (the close button, a browser back) loses nothing already entered.
//
// useSearchParams needs a Suspense boundary around it in Next's app router.
export function ResumeBuilderExperience() {
  return (
    <Suspense fallback={null}>
      <ResumeBuilderInner />
    </Suspense>
  );
}

// Outer gutter always matches Home/Explore/Profile (direct feedback, 14
// Sept 2026: "match the margins to the other screens... every screen
// should have the same margins"): max-w-[1440px] + px-5/sm:px-[space-14],
// the exact classes those pages use. A view that wants a narrower reading
// column (a form, a document) centers one inside that same outer gutter
// via contentMaxWidth rather than shrinking the gutter itself.
function Shell({ children, contentMaxWidth, tabs }: { children: ReactNode; contentMaxWidth?: number; tabs?: ReactNode }) {
  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      {/* Rendered full-bleed, BEFORE the padded content column below, so a
         sticky tabs bar docks flush at the true top of the page -- inside
         the padded column it sat under the column's own top padding,
         reading as a floating panel with a gap above it (direct feedback,
         16 Sept 2026: "why are they in a floating black box with gaps on
         top and below"). */}
      {tabs}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] sm:px-[var(--space-14)] sm:pt-8">
        {contentMaxWidth ? <div className="mx-auto flex w-full flex-1 flex-col" style={{ maxWidth: contentMaxWidth }}>{children}</div> : children}
      </div>
    </div>
  );
}

// The replit reference keeps three peer sections always reachable in one
// persistent nav (Resume Builder / Saved Resumes / Choose & Tailor), not
// a directed one-way flow -- direct instruction, 16 Sept 2026: "match it
// exactly". Scoped to the screens that actually correspond to those three
// (template pick + wizard, the saved list, and name/education/template
// selection); the finished document keeps its own header, which already
// covers the reference's equivalent actions (ATS Check, Export, etc.).
function ResumeBuilderTabs({ active, router, onClose }: { active: "builder" | "saved" | "tailor" | null; router: ReturnType<typeof useRouter>; onClose: () => void }) {
  const scrolled = useScrolled();
  const items: { key: "builder" | "saved" | "tailor"; label: string; short: string; href: string }[] = [
    // Short labels below sm: the full three plus the Dream Score chip and
    // the close button cannot share a 375px row, and letting the list
    // scroll left "Sav|" clipped mid-word under the chip (17 Sept 2026).
    { key: "builder", label: "Resume Builder", short: "Builder", href: "/resume-builder" },
    { key: "saved", label: "Saved Resumes", short: "Saved", href: "/resume-builder?view=list" },
    { key: "tailor", label: "Choose & Tailor", short: "Tailor", href: "/resume-builder?view=tailor" },
  ];
  return (
    // Sticky, not just top-of-page -- it was scrolling out of view on
    // any tall step (direct feedback, 16 Sept 2026: "make sure they are
    // more prominent and always visible/sticky"), same pattern
    // WizardFooter already uses for staying put at the bottom. Full-bleed
    // (Shell renders this outside its own padded column) so it docks
    // flush at the page's true top edge instead of floating under the
    // column's own top padding -- the outer host below stays transparent
    // and only reserves height; the inset pill inside it carries the
    // actual scroll-conditional glass, same treatment as the app's main
    // nav (direct feedback, 16 Sept 2026: "same thing for the resume
    // builders top tabs" -- an explicit reversal of the full-bleed-bar
    // look chosen earlier this same session).
    <div className="sticky top-0 z-30 w-full">
      {/* Outer inset margin is sm:px-3 only, not unconditional -- unlike the
         app nav's pill (logo + one icon, always fits), this row carries
         three text tab labels plus a close button, and adding the same
         12px-per-side inset on top of the pill's own px-5 pushed "Choose &
         Tailor" and the close button off a narrow phone screen entirely
         (16 Sept 2026). Mobile keeps the pill flush edge-to-edge instead
         (still rounded, still scroll-conditional) so nothing overflows. */}
      <div className="mx-auto w-full max-w-[1440px] pt-3 sm:px-3">
        <div
          data-print-hide
          className="rounded-[28px] transition-[background-color,border-color,box-shadow] duration-300"
          style={{
            background: scrolled ? "color-mix(in srgb, var(--background) 78%, transparent)" : "transparent",
            backdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
            border: `1px solid ${scrolled ? "var(--glass-border)" : "transparent"}`,
            boxShadow: scrolled ? "0 12px 32px -16px rgba(0,0,0,0.55)" : "none",
          }}
        >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-[var(--space-3)] px-4 pt-[max(14px,env(safe-area-inset-top))] pb-[14px] sm:gap-[var(--space-4)] sm:px-[var(--space-14)]">
        {/* Active tab already says what this page is -- a separate
           "Resume Builder" title repeated the same word right below it
           (direct feedback, 16 Sept 2026: "it already says what it is in
           the tabs label, make those bigger"), so the tabs carry both the
           page identity and the navigation now. */}
        {/* min-w-0 + overflow-x-auto, not flex-none: three full-text labels
           don't fit a narrow phone alongside the close button, and with no
           way to scroll, the overflow used to clip straight through the
           close button, making the wizard unclosable on small screens
           (pre-existing, found 16 Sept 2026 while adding the glass pill
           above -- unrelated to that change, confirmed by reproducing it
           against the untouched original markup too). Scrolling the tab
           list alone keeps the close button always reachable. */}
        <div role="tablist" aria-label="Resume Builder sections" className="flex min-w-0 gap-[var(--space-4)] overflow-x-auto [scrollbar-width:none] sm:gap-[var(--space-6)]">
          {items.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => router.push(item.href)}
                className="relative cursor-pointer pb-[14px] text-[16px] font-extrabold whitespace-nowrap sm:text-[17px]"
                style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-display)" }}
              >
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {/* A muted underline, not the brand color -- it was
                   clashing with the page's own blue CTAs right below it
                   (direct feedback, 16 Sept 2026: "the higlhight color
                   on the resume tab clashes with the cta"). Slides
                   between tabs via a shared layoutId instead of just
                   appearing under whichever one is active (direct
                   feedback: "have whatever highlight we end up keeping
                   for tabs... animate and slide over when we switch"). */}
                {isActive && (
                  <motion.span
                    layoutId="resume-builder-tab-underline"
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-[2px]"
                    style={{ background: "var(--foreground)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* mb-[14px] mirrors the tabs' pb-[14px] (the underline's room), so
           the labels, the chip and the close button share one centre line
           instead of the chip sitting a step lower (direct feedback, 17
           Sept 2026: "should be in line"). */}
        <div className="mb-[14px] flex flex-none items-center gap-[var(--space-3)]">
        {/* The Dream Score lives here too: this route has no main nav, and
           the XP earned in the wizard needs the chip to fly into. */}
        <DreamScoreChip />
        <NotificationsButton />
        <IconTip label="Close">
        <button
          type="button"
          aria-label="Close and return to Profile"
          onClick={onClose}
          className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border"
          style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        </IconTip>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ label, badges, onClose, extra, toolsFromSm = false }: { label: string; /** status chips (Tailored, Checking…) that sit with the title, not in the button row */ badges?: ReactNode; onClose?: () => void; extra?: ReactNode; /** the button row only from sm up: the phone carries its actions in a bottom bar instead */ toolsFromSm?: boolean }) {
  return (
    <div data-print-hide className="mb-[var(--space-4)] flex flex-none flex-wrap items-center justify-between gap-[var(--space-3)] sm:mb-[var(--space-5)]">
      {/* One row on the phone: the title truncates and the chips stay put,
         instead of the title, then the chips, then the icon row stacking
         three deep (direct feedback, 18 Sept 2026). */}
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-[10px] sm:flex-none sm:flex-wrap">
        <span className="min-w-0 truncate text-[13px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        {badges}
      </div>
      {/* A tighter gap while the toolbar is icon-only (below `lg`) buys back
         just enough width that the full icon row -- Tailor/ATS/Text
         Preview/Full Screen/Edit Sections/Export/Edit Selection/Close --
         fits even on the narrowest phones without a horizontal scrollbar;
         `overflow-x-auto` is still there as a hard floor if a future button
         gets added. */}
      {/* Wraps from lg up instead of scrolling: with the label column on
         the left the full labelled row did not fit a 900px document column
         and the last buttons were simply off-screen (headless capture, 17
         Sept 2026). Phones keep the icon-only single row. */}
      {/* Vertical breathing room inside the scroll container: overflow-x
         also clips on the y axis, so the buttons' 1px hover lift and their
         shadow were sliced off at the row's edge (direct feedback, 17 Sept
         2026: "the hover on the icons is cropping the top part"). The
         negative margin gives the padding back so the row's footprint is
         unchanged. */}
      <div className={`-my-[6px] max-w-full items-center gap-[6px] overflow-x-auto px-[2px] py-[6px] [scrollbar-width:none] lg:gap-[8px] ${toolsFromSm ? "hidden sm:flex" : "flex"}`}>
        {extra}
        {onClose && (
          <IconTip label="Close">
          <button
            type="button"
            aria-label="Close and return to Profile"
            onClick={onClose}
            className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border"
            style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
          </IconTip>
        )}
      </div>
    </div>
  );
}

/** The phone's actions, as a bottom bar of labelled icons (so no tooltip
 *  is needed) instead of seven unlabelled icons under the title: the four
 *  a student reaches for on a phone, and More for the rest (direct
 *  feedback, 18 Sept 2026: "the mobile version is very badly optimised").
 *  Hidden while a panel is open, since every panel has its own close. */
type BarAction = { key: string; label: string; Icon: LucideIcon | typeof AtsIcon; onClick: () => void };
function MobileActionBar({ primary, more }: { primary: BarAction[]; more: BarAction[] }) {
  const [open, setOpen] = useState(false);
  const item = (a: BarAction, big = false) => (
    <button key={a.key} type="button" onClick={a.onClick} className="dm-quiet flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-[3px] rounded-[var(--radius-md)] px-[4px] py-[6px]" style={{ color: "var(--foreground)" }}>
      <a.Icon className={big ? "h-[22px] w-[22px]" : "h-[20px] w-[20px]"} aria-hidden />
      <span className="max-w-full truncate text-[10.5px] leading-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{a.label}</span>
    </button>
  );
  return (
    <>
      <nav data-print-hide aria-label="Resume actions" className="fixed inset-x-0 bottom-0 z-40 sm:hidden">
        <div className="mx-3 mb-[max(10px,env(safe-area-inset-bottom))] flex items-stretch gap-[2px] rounded-[22px] border p-[4px]" style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter: "blur(18px) saturate(1.6)", WebkitBackdropFilter: "blur(18px) saturate(1.6)", borderColor: "var(--glass-border)", boxShadow: "0 -12px 32px -20px rgba(0,0,0,0.6), 0 12px 32px -16px rgba(0,0,0,0.55)" }}>
          {primary.map((a) => item(a))}
          {more.length > 0 && item({ key: "more", label: "More", Icon: MoreHorizontal, onClick: () => setOpen(true) })}
        </div>
      </nav>
      {open && (
        <Portal>
          <div className="fixed inset-0 z-[120] flex items-end sm:hidden" onClick={() => setOpen(false)}>
            <div aria-hidden className="absolute inset-0 backdrop-blur-[28px]" style={{ background: "rgba(0,0,0,0.45)" }} />
            <div role="dialog" aria-label="More actions" onClick={(e) => e.stopPropagation()} className="relative z-10 mx-3 mb-[max(10px,env(safe-area-inset-bottom))] w-full overflow-hidden rounded-[22px] border motion-safe:animate-[resume-drawer-in_0.22s_ease-out_both]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)" }}>
              {more.map((a) => (
                <button key={a.key} type="button" onClick={() => { setOpen(false); a.onClick(); }} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] border-b px-[18px] py-[14px] text-left text-[14.5px] font-semibold last:border-b-0" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <a.Icon className="h-[18px] w-[18px]" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {a.label}
                </button>
              ))}
              <button type="button" onClick={() => setOpen(false)} className="dm-quiet flex w-full cursor-pointer items-center justify-center px-[18px] py-[13px] text-[14px] font-bold" style={{ color: "var(--muted-foreground)", background: "var(--glass-surface-1)" }}>
                Cancel
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

function DocumentScreen({ resume, title, onBack, backLabel, editHref, router, templateId, version, celebrate = false }: { resume: ResumeData; title: string; onBack: () => void; backLabel: string; editHref?: string; router: ReturnType<typeof useRouter>; templateId: string; version?: ResumeVersion; /** just created: show Dreamy's score card once the check lands */ celebrate?: boolean }) {
  // Confirmed live against the reference (20 Sept 2026): its Export button
  // opens the same six-item "Review Before Exporting" checklist ours does
  // -- this was matched correctly from the start and should never have
  // been removed. "export" stays in this union.
  const [panel, setPanel] = useState<"none" | "tailor" | "ats" | "text" | "export" | "sections">("none");
  // The full-screen reader, shared by the toolbar button (sm+), the phone
  // bar and a tap on the phone's thumbnail sheet.
  const [zoomOpen, setZoomOpen] = useState(false);
  const { toast, showToast } = useResumeToast();
  // The Approve workflow -- see the ResumeVersion.approved comment in
  // lib/resume.ts for what's confirmed vs. inferred about it.
  const [approveOpen, setApproveOpen] = useState(false);
  // Every saved resume is scored without being asked: the check runs the
  // moment the document opens with no result, or with a result computed
  // from older content, and stores it on the version (direct feedback, 17
  // Sept 2026: "every resume that is generated should automatically be ATS
  // checked and scored, right now it's manual"). The ATS Check button then
  // opens a result, never an empty "Run" state.
  const stale = version ? atsIsStale(resume, version) : false;
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [resultSeen, setResultSeen] = useState(false);
  const mounted = useRef(true);
  // Set on every mount, not just cleared on unmount: strict mode replays
  // mount/unmount/mount in development, which left the flag false forever
  // and the chip on "Checking" (seen live, 17 Sept 2026).
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const inFlight = useRef(false);
  const check = () => {
    if (!version || inFlight.current) return;
    inFlight.current = true;
    setFailed(false);
    setChecking(true);
    runAtsCheck(resume, version).then((next) => {
      inFlight.current = false;
      // Saving the result changes `stale`, which re-runs the effect below;
      // the outcome must still land here regardless (an earlier version
      // cancelled itself on that very change and left "Checking…" up for
      // good, direct feedback 17 Sept 2026).
      if (!mounted.current) return;
      setChecking(false);
      if (!next) setFailed(true);
    });
  };
  useEffect(() => {
    if (!version || !stale || failed) return;
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the fingerprint changes
  }, [version?.id, stale]);
  const ats = version?.atsCheck ?? null;
  // Same-route navigation (only the search params change) keeps the
  // previous scroll offset, so a resume created from the bottom of the
  // Tailor form opened already scrolled past its own header (17 Sept 2026).
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [version?.id]);
  // A just-created resume opens straight into the score card, the instant
  // the check lands -- confirmed live against the reference (20 Sept
  // 2026): its own score appears already computed, with no paced/animated
  // "checking" sequence first, on both a fresh resume and a revisit. This
  // used to run an AtsCheckStage (readability items revealing one at a
  // time) before this card per direct feedback ("it has to read like an
  // ATS check, not suddenly a score appearing", 17 Sept 2026) -- removed
  // for literal parity; flagged as a real loss, not an oversight.
  const showResult = celebrate && !resultSeen && !!ats && !stale;
  return (
    <Shell contentMaxWidth={900} tabs={<ResumeBuilderTabs active="saved" router={router} onClose={() => router.push("/profile?tab=resume")} />}>
      <TopBar
        label={title}
        badges={
          <>
            {version?.jobDescription && (
              <span className="inline-flex flex-none items-center gap-[5px] rounded-full border px-[10px] py-[3px] text-[11.5px] font-bold max-sm:size-[24px] max-sm:justify-center max-sm:px-0" style={{ borderColor: "color-mix(in srgb, var(--accent-subtle) 45%, var(--glass-border))", color: "var(--accent-subtle)" }} aria-label="Tailored to a job description">
                <Wand2 className="h-3 w-3" aria-hidden /> <span className="max-sm:hidden">Tailored</span>
              </span>
            )}
            {checking ? (
              <Working label="Checking" />
            ) : failed ? (
              <button type="button" onClick={check} className="dm-quiet inline-flex cursor-pointer items-center gap-[5px] rounded-full border px-[10px] py-[3px] text-[11.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                <AtsIcon className="h-3.5 w-3.5" /> Check didn&apos;t finish · Retry
              </button>
            ) : ats && !stale ? (
              // the score, always in view once it exists; opens the full report
              <button type="button" onClick={() => setPanel("ats")} className="dm-quiet inline-flex flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[10px] py-[3px] text-[11.5px] font-bold tabular-nums" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }} aria-label="Open ATS Check">
                <AtsIcon className="h-3.5 w-3.5" style={{ color: "var(--accent-subtle)" }} /> {ats.qualityScore}/100{ats.jobMatchScore !== null ? ` · Match ${ats.jobMatchScore}` : ""}
              </button>
            ) : null}
          </>
        }
        extra={
          <>
            {version && (
              <ToolbarButton iconOnly label="Tailor Resume" onClick={() => setPanel("tailor")}>
                <Wand2 className="h-4 w-4" aria-hidden />
              </ToolbarButton>
            )}
            {version && (
              <ToolbarButton iconOnly label="ATS Check" onClick={() => setPanel("ats")}>
                <AtsIcon className="h-[18px] w-[18px]" />
              </ToolbarButton>
            )}
            <ToolbarButton iconOnly label="Text Preview" onClick={() => setPanel("text")}>
              <FileText className="h-4 w-4" aria-hidden />
            </ToolbarButton>
            <ToolbarButton iconOnly label="Full Screen" onClick={() => setZoomOpen(true)}>
              <Maximize2 className="h-4 w-4" aria-hidden />
            </ToolbarButton>
            {version && (
              <ToolbarButton iconOnly label="Edit Sections" onClick={() => setPanel("sections")}>
                <ListOrdered className="h-4 w-4" aria-hidden />
              </ToolbarButton>
            )}
            <ToolbarButton iconOnly label="Export" onClick={() => setPanel("export")}>
              <Download className="h-4 w-4" aria-hidden />
            </ToolbarButton>
            {version && (
              <ToolbarButton
                iconOnly
                tone="success"
                label={version.approved ? "Approved" : "Approve"}
                onClick={() => { if (!version.approved) setApproveOpen(true); }}
              >
                {version.approved ? <BadgeCheck className="h-4 w-4" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
              </ToolbarButton>
            )}
            {editHref && (
              <ToolbarButton iconOnly label="Edit Selection" onClick={() => router.push(editHref)}>
                <Pencil className="h-4 w-4" aria-hidden />
              </ToolbarButton>
            )}
          </>
        }
        toolsFromSm
      />
      {panel === "tailor" && version ? (
        <JobMatchPanel resume={resume} version={version} onClose={() => setPanel("none")} />
      ) : panel === "ats" && version ? (
        <ATSCheckPanel resume={resume} version={version} onClose={() => setPanel("none")} />
      ) : panel === "text" ? (
        <TextPreviewModal resume={resume} onClose={() => setPanel("none")} />
      ) : panel === "export" ? (
        <ExportChecklistModal resume={resume} onClose={() => setPanel("none")} />
      ) : panel === "sections" && version ? (
        <EditSectionsPanel resume={resume} version={version} onClose={() => setPanel("none")} />
      ) : (
        <div className="relative">
          <ResumeDocument resume={resume} templateId={templateId} sectionOrder={version?.sectionOrder} hiddenSections={version?.hiddenSections} sectionOverrides={version?.sectionOverrides} />
          {/* On a phone the fitted page is a thumbnail, not a reading size,
             so the whole sheet is one tap into the full-screen reader, with
             the hint saying so. */}
          <button type="button" onClick={() => setZoomOpen(true)} className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-lg)] sm:hidden" aria-label="Read full screen">
            <span className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[12px] font-bold whitespace-nowrap" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", backdropFilter: "blur(12px)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <Expand className="h-3.5 w-3.5" aria-hidden /> Tap to read
            </span>
          </button>
        </div>
      )}
      <ZoomResumeModal open={zoomOpen} onClose={() => setZoomOpen(false)} resume={resume} templateId={templateId} title={title} sectionOrder={version?.sectionOrder} hiddenSections={version?.hiddenSections} sectionOverrides={version?.sectionOverrides} />
      {panel === "none" && (
        <MobileActionBar
          primary={[
            ...(version ? [{ key: "tailor", label: "Tailor", Icon: Wand2, onClick: () => setPanel("tailor") }, { key: "ats", label: "ATS Check", Icon: AtsIcon, onClick: () => setPanel("ats") }] : []),
            { key: "zoom", label: "Read", Icon: Maximize2, onClick: () => setZoomOpen(true) },
            { key: "export", label: "Export", Icon: Download, onClick: () => setPanel("export") },
          ]}
          more={[
            { key: "text", label: "Text Preview", Icon: FileText, onClick: () => setPanel("text") },
            ...(version ? [{ key: "sections", label: "Edit Sections", Icon: ListOrdered, onClick: () => setPanel("sections") }] : []),
            ...(version ? [{ key: "approve", label: version.approved ? "Approved" : "Approve", Icon: version.approved ? BadgeCheck : Check, onClick: () => { if (!version.approved) setApproveOpen(true); } }] : []),
            ...(editHref ? [{ key: "edit", label: "Edit Selection", Icon: Pencil, onClick: () => router.push(editHref) }] : []),
          ]}
        />
      )}
      {/* Dreamy's score card, once, right after a resume is generated: the
         two numbers and the single most useful tip, with the full report
         one tap away (the reference's own moment, minus the three tips it
         listed under "one small tip"). */}
      {/* The score card, once, as the same cinematic splash the rest of
         the app opens with: the headline by match strength, the two
         numbers, the single most useful tip; Continue banks the "first
         resume" XP into the nav, See Final Tips opens the full panel. */}
      <WelcomeSplash
        surface="resume"
        open={showResult && !!ats}
        onDone={() => { setResultSeen(true); flyXp({ from: null, amount: CREATED_XP, milestone: `resume:created:${version?.id ?? ""}` }); }}
        onSecondary={() => { setResultSeen(true); setPanel("ats"); }}
        scene={ats ? {
          sprite: ats.jobMatchScore !== null && ats.jobMatchScore >= 75 ? "/images/dreamy/v2/splash/dreamy-party.webp" : "/images/dreamy/v2/splash/dreamy-happy.webp",
          tint: ats.jobMatchScore !== null && ats.jobMatchScore >= 75 ? ["255, 160, 30", "255, 50, 100"] : ["40, 140, 255", "100, 70, 255"],
          title: ats.jobMatchScore !== null ? (ats.jobMatchScore >= 75 ? "STRONG MATCH" : "RESUME READY") : "RESUME READY",
          line: ats.jobMatchScore !== null && ats.jobMatchScore < 75 ? "Let's make it a closer match." : undefined,
          rows: [
            { text: <><strong>Resume:</strong> {ats.qualityScore}/100{ats.jobMatchScore !== null ? <> · <strong>Job Match:</strong> {ats.jobMatchScore}/100</> : null}</> },
            ...(ats.qualityImprovements[0] ? [{ text: <><strong>One small tip:</strong> {ats.qualityImprovements[0]}</>, note: true as const }] : []),
          ],
          cta: "Continue",
          secondary: "See Final Tips",
        } : undefined}
      />
      <button
        type="button"
        data-print-hide
        onClick={onBack}
        className="dm-link mt-[var(--space-4)] mb-[84px] cursor-pointer self-center text-[13.5px] font-bold sm:mb-0"
        style={{ color: "var(--accent-subtle)" }}
      >
        {backLabel}
      </button>
      {/* Same inline dialog pattern as ResumeExperience.tsx's own delete
         confirm -- this app has no shared Modal component, every local
         dialog rolls its own role="dialog" markup this way. */}
      {approveOpen && version && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center p-4 backdrop-blur-[28px] sm:items-center" style={{ background: "rgba(5,7,15,0.55)" }} onPointerDown={(e) => { if (e.target === e.currentTarget) setApproveOpen(false); }}>
          <div className="flex w-full max-w-[400px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
            <p className="text-[18px] leading-[24px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Approve this resume?</p>
            <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>This marks it as final. You can still make changes after.</p>
            <div className="flex items-center justify-end gap-[var(--space-3)]">
              <button type="button" onClick={() => setApproveOpen(false)} className="dm-link cursor-pointer text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button
                type="button"
                onClick={() => {
                  upsertVersion({ ...version, approved: true, updatedAt: Date.now() });
                  setApproveOpen(false);
                  showToast("Marked as approved");
                }}
                className="dm-solid flex min-h-[40px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold text-white"
                style={{ background: "var(--world-food-farming-nature, #3aa66b)" }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
      {toast}
    </Shell>
  );
}

function ResumeBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const [stepIndex, setStepIndex] = useState(0);
  const [reactionNonce, setReactionNonce] = useState(0);
  const react = () => setReactionNonce((n) => n + 1);
  const [experienceModal, setExperienceModal] = useState<ResumeExperienceEntry | null | "new">(null);
  // Set by a step that's swapped its own body for a sub-flow with its own
  // DreamyGuide (SkillsStep's category picker) -- suppresses the wizard's
  // own top-level Dreamy so only one ever shows at once, not stacked
  // (direct feedback, 16 Sept 2026: "two dreamys on screen"). Experience's
  // sub-flow doesn't need this passed in -- the parent already knows
  // `experienceModal !== null` directly.
  const [subDreamy, setSubDreamy] = useState<{ sprite: string; line: string } | null>(null);
  // Which `data-field` the live preview's camera should pan to right now --
  // set by whichever drawer field is focused (`${entryId}:${fieldKind}`),
  // cleared back to section-level framing when the drawer closes or the
  // step changes (direct feedback, 15 Sept 2026: "the camera tracking all
  // updates one by one, per field... after one section is done it can fit
  // the whole section... before we move on" -- that whole-section fit is
  // just what ResumeDocument already does once activeField goes back to
  // null, no separate state needed for it).
  const [activeField, setActiveField] = useState<string | null>(null);
  // Scrolls back to the top on every step change so Dreamy's new line
  // (he sits right at the top of the page) is actually visible without
  // the student having to scroll back up themselves -- otherwise the
  // change happens off-screen if they'd scrolled down to reach a field
  // (direct feedback, 16 Sept 2026: "i should see the dreamy speech
  // change at every screen... right now it changes but i need to scroll
  // up and i dont notice it").
  const goToStep = (i: number) => {
    setActiveField(null);
    setSubDreamy(null);
    setStepIndex(i);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const { toast, showToast } = useResumeToast();
  // Dreamy's welcome, shared with the Profile tab (see useResumeWelcome).
  // Every Create a new resume lands on the templates view, and every one of
  // them opens with Dreamy, seen before or not.
  const [welcome, dismissWelcome] = useResumeWelcome(searchParams.get("view") === "templates");
  // XP for finishing a step with something in it: a "+N XP" lifts off the
  // form card and slots into the nav's Dream Score (the reference's
  // "+10 pts" toasts, as the app's own XP moment). Once per milestone,
  // enforced by the score store itself.
  const card = useRef<HTMLDivElement>(null);
  const award = (step: number, has: boolean) => {
    const prize = STEP_XP[step];
    if (!prize || !has) return;
    flyXp({ from: card.current, amount: prize.xp, milestone: prize.milestone });
    // The toast itself, alongside the flying XP -- was silent before
    // (direct instruction, 20 Sept 2026): STEP_XP_TOAST above.
    showToast(`+${prize.xp} pts ${STEP_XP_TOAST[step]}`);
  };

  const backToProfile = () => router.push("/profile?tab=resume");
  const view = searchParams.get("view");
  const versionId = searchParams.get("version");
  const activeVersion = versionId ? (resume.versions.find((v) => v.id === versionId) ?? null) : null;
  // Carried from the template gallery into wizard/tailor so the FIRST save
  // uses what was actually picked, not always the default.
  const pickedTemplate = (searchParams.get("template") as ResumeTemplateId | null) ?? undefined;

  if (view === "list") {
    return (
      <Shell contentMaxWidth={900} tabs={<ResumeBuilderTabs active="saved" router={router} onClose={backToProfile} />}>
        <ResumeExperience />
      </Shell>
    );
  }

  if (view === "templates") {
    return (
      <Shell contentMaxWidth={1200} tabs={<ResumeBuilderTabs active="builder" router={router} onClose={backToProfile} />}>
        <TopBar label="New Resume" />
        <TemplateGallery
          onSelect={(templateId) => {
            const isFirstResume = readResume().versions.length === 0;
            router.push(isFirstResume ? `/resume-builder?view=wizard&template=${templateId}` : `/resume-builder?view=tailor&template=${templateId}`);
          }}
        />
        {/* Dreamy opens every new resume, here on the template gallery,
           the first screen after Create (direct feedback, 18 Sept 2026). */}
        <WelcomeSplash surface="resume" open={welcome} onDone={dismissWelcome} />
      </Shell>
    );
  }

  if (view === "tailor") {
    // Name it, pick what's in it, pick a template -- matching to a job is
    // its own separate thing now (JobMatchPanel, opened from the finished
    // document), so this screen isn't called "Tailor" anymore either
    // (direct feedback, 15 Sept 2026: "the tailoring happens as a
    // seperate thing from the last naming/template changer"). Present
    // (not resume-home's "Edit" button, not "Edit Selection" on a
    // finished document -- both append &edit=1) whenever this is still
    // part of creating the resume: straight from finishing the wizard, or
    // from picking a template for another one.
    const isEditingExisting = searchParams.get("edit") === "1";
    return (
      <Shell contentMaxWidth={760} tabs={<ResumeBuilderTabs active="tailor" router={router} onClose={backToProfile} />}>
        <TopBar label={activeVersion ? "Edit Selection" : "New Resume"} />
        <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
          <TailorScreen
            resume={resume}
            initial={activeVersion}
            initialTemplateId={pickedTemplate}
            skippable={!isEditingExisting}
            onCancel={backToProfile}
            onSaved={(saved) => router.push(`/resume-builder?view=version&version=${saved.id}${isEditingExisting ? "" : "&from=create"}`)}
          />
        </div>
      </Shell>
    );
  }

  if (view === "version" && activeVersion) {
    return (
      <DocumentScreen
        resume={resumeForVersion(resume, activeVersion)}
        title={activeVersion.name}
        onBack={backToProfile}
        backLabel="Back to Resumes"
        editHref={`/resume-builder?view=tailor&version=${activeVersion.id}&edit=1`}
        router={router}
        templateId={activeVersion.template}
        version={activeVersion}
        celebrate={searchParams.get("from") === "create"}
      />
    );
  }

  // Custom-designed edge case, 22 Sept 2026: `versionId` is read straight
  // from the URL (`?version=`) with no validation -- a stale bookmark, a
  // deleted resume, or a hand-edited link that matches no saved version
  // used to fall through every `view === ...` branch below (none of them
  // match `"version"`) and land on the full multi-step wizard at step 0,
  // silently, with no message that the requested resume wasn't found.
  // Same bug class already fixed this session in Profile (?picks=) and
  // Connect (?pro=/?board=/etc.) -- doesn't crash (activeVersion is
  // already null-safe), but a confusing dead end. Routes back to the
  // resume list -- this feature's own natural "nothing to show here"
  // destination, which already has its own empty/populated states --
  // rather than inventing a new not-found screen.
  if (view === "version") {
    return (
      <Shell contentMaxWidth={900} tabs={<ResumeBuilderTabs active="saved" router={router} onClose={backToProfile} />}>
        <ResumeExperience />
      </Shell>
    );
  }

  if (view === "document") {
    // "Your Resume" used to be a version-less document, which silently lost
    // every version tool (ATS Check, Tailor, Edit Sections -- direct
    // feedback, 17 Sept 2026: "where did the ATS check go?"). Open the most
    // recently updated saved resume instead; only with nothing saved yet
    // does the bare preview remain.
    const latest = [...resume.versions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (latest) {
      return (
        <DocumentScreen
          resume={resumeForVersion(resume, latest)}
          title={latest.name}
          onBack={backToProfile}
          backLabel="Back to Resumes"
          editHref={`/resume-builder?view=tailor&version=${latest.id}&edit=1`}
          router={router}
          templateId={latest.template}
          version={latest}
          celebrate={searchParams.get("from") === "create"}
        />
      );
    }
    return <DocumentScreen resume={resume} title="Your Resume" onBack={backToProfile} backLabel="Back to Resumes" router={router} templateId={DEFAULT_RESUME_TEMPLATE} />;
  }

  // One Dreamy, always visible, outside the card -- his line/sprite just
  // updates to whatever's actually active: the wizard step by default, or
  // whichever nested sub-flow (Experience's screens, a Skills category)
  // reports its own line up via onSubDreamy while it's open (direct
  // feedback, 16 Sept 2026: "revert the dreamy position to before when it
  // was outside, and just have it update to say what each modal was
  // saying" -- one Dreamy that follows you, not one per modal).
  const activeDreamy = subDreamy ?? RESUME_WIZARD_DREAMY[stepIndex];
  const showBackButton = stepIndex > 0 && !subDreamy;

  return (
    <Shell tabs={<ResumeBuilderTabs active="builder" router={router} onClose={backToProfile} />}>
      {/* The preview gets the larger share of the row now (direct feedback,
         14 Sept 2026: "give the preview more prominence... more width so we
         can see it better") -- the preview column runs 20% wider than the
         form column (direct feedback, 15 Sept 2026), both flexible so the
         ratio holds as the viewport grows. */}
      <div className="grid grid-cols-1 items-start gap-[var(--space-6)] lg:grid-cols-[minmax(420px,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-[var(--space-3)]">
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <div className="max-w-[440px]">
              <DreamyGuide sprite={activeDreamy.sprite} line={activeDreamy.line} reactionNonce={reactionNonce} />
            </div>
            {/* Below lg the live preview column is hidden, so the resume is
               one tap away here instead (the reference's own Preview
               button on phones), opening the same full-screen view. */}
            <div className="flex-none lg:hidden">
              <ZoomResumeButton resume={resume} templateId={pickedTemplate ?? DEFAULT_RESUME_TEMPLATE} title="Preview" label="Preview" />
            </div>
          </div>
          <div ref={card} className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            {/* Back sits beside the step label + progress bar as one
               column, not down in the footer (direct feedback, 16 Sept
               2026: "the back button [and] the resume label + progress
               bar can be aligned so its one column"). Each step's own
               WizardFooter keeps only Next/Save; Back lives here once. */}
            <WizardProgress
              stepIndex={stepIndex}
              leading={
                showBackButton ? (
                  <IconTip label="Back">
                  <button
                    type="button"
                    aria-label="Back"
                    onClick={() => goToStep(stepIndex - 1)}
                    className="dm-quiet flex size-7 flex-none cursor-pointer items-center justify-center rounded-full border"
                    style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  </IconTip>
                ) : undefined
              }
            />
            {stepIndex === 0 && <PersonalInfoStep resume={resume} onNext={() => { react(); award(0, true); goToStep(1); }} onFieldFocus={setActiveField} />}
            {stepIndex === 1 && <EducationStep resume={resume} onNext={() => { react(); award(1, resume.education.length > 0); goToStep(2); }} showToast={showToast} onFieldFocus={setActiveField} />}
            {stepIndex === 2 && (
              // In-place, like Education/Certifications: the drawer swaps
              // this same card's body rather than floating over it, so
              // there's never a second layer sitting on top of the list.
              experienceModal !== null ? (
                <ExperienceModal
                  initial={experienceModal === "new" ? null : experienceModal}
                  onClose={() => { setActiveField(null); setExperienceModal(null); }}
                  onSaved={(title) => {
                    setActiveField(null);
                    setExperienceModal(null);
                    showToast(`${title} added`);
                  }}
                  onFieldFocus={setActiveField}
                  onSubDreamy={setSubDreamy}
                />
              ) : (
                <ExperienceStep
                  resume={resume}
                  onNext={() => { react(); award(2, resume.experience.length > 0); goToStep(3); }}
                  onAdd={() => setExperienceModal("new")}
                  onEdit={(entry) => setExperienceModal(entry)}
                />
              )
            )}
            {stepIndex === 3 && <SkillsStep resume={resume} onNext={() => { react(); award(3, resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0); goToStep(4); }} onSubDreamy={setSubDreamy} />}
            {stepIndex === 4 && <CertificationsStep resume={resume} onNext={() => { react(); award(4, resume.certifications.length > 0); goToStep(5); }} showToast={showToast} onFieldFocus={setActiveField} />}
            {stepIndex === 5 && (
              <ReviewStep
                resume={resume}
                onEditStep={(step) => goToStep(step)}
                // Two buttons now, not one auto-routing button (direct
                // instruction, 20 Sept 2026, matching the reference
                // exactly): "Save & Export" always creates a version with
                // sensible defaults and skips straight to the finished
                // document; "Customize First" always creates a version too,
                // then opens Choose & Tailor (naming, which
                // education/experience to include, template, matching to a
                // job) before landing on the document. Both build the same
                // shape of default version -- only the name and the
                // destination differ -- so that part is shared here.
                onSaveExport={() => {
                  react();
                  const current = readResume();
                  // A real name, not the student's own name repeated --
                  // every saved resume already belongs to this one student,
                  // so their name on the card said nothing about which
                  // resume it was (direct feedback, 16 Sept 2026). Skipping
                  // tailoring entirely means there's no Tailor screen left
                  // to name it in, so this path needs its own sensible
                  // default: the student's name + "Resume".
                  const fullName = `${current.profile.firstName} ${current.profile.lastName}`.trim();
                  const version: ResumeVersion = {
                    id: makeId(),
                    name: fullName ? `${fullName} Resume` : "My Resume",
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    educationIds: current.education.map((e) => e.id),
                    experienceIds: current.experience.map((e) => e.id),
                    jobDescription: "",
                    targetPosition: "",
                    targetCompany: "",
                    template: pickedTemplate ?? DEFAULT_RESUME_TEMPLATE,
                    atsCheck: null,
                  };
                  upsertVersion(version);
                  // Same routing the single button's old "subsequent
                  // resume" branch used: the document view opens the most
                  // recently updated saved version, which is the one just
                  // created above. The check runs on arrival and shows the
                  // score card, so it's still the wizard's real last step.
                  router.push("/resume-builder?view=document&from=create");
                }}
                onCustomizeFirst={() => {
                  react();
                  const current = readResume();
                  // Same defaults as the old single button's "first resume"
                  // branch: a placeholder name, real naming happens on the
                  // Tailor screen this routes into next.
                  const version: ResumeVersion = {
                    id: makeId(),
                    name: "My Resume",
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    educationIds: current.education.map((e) => e.id),
                    experienceIds: current.experience.map((e) => e.id),
                    jobDescription: "",
                    targetPosition: "",
                    targetCompany: "",
                    template: pickedTemplate ?? DEFAULT_RESUME_TEMPLATE,
                    atsCheck: null,
                  };
                  upsertVersion(version);
                  router.push(`/resume-builder?view=tailor&version=${version.id}`);
                }}
              />
            )}
          </div>
        </div>

        {/* Live preview, desktop only (direct feedback, 14 Sept 2026): the
           same ResumeDocument the finished document view uses, fed by the
           same reactive resume state, so it updates as the student types. */}
        {/* A firm height (not max-height + its own scroll) so the preview
           below can actually fill it via height:100% instead of hugging
           its content vertically (direct feedback, 14 Sept 2026). The
           camera/crop inside ResumeDocument handles framing now, so this
           column itself never needs to scroll. */}
        <div className="hidden lg:sticky lg:top-8 lg:flex lg:h-[calc(100dvh-64px)] lg:min-w-0 lg:flex-col lg:gap-[var(--space-5)]">
          <div className="flex flex-none flex-wrap items-center justify-between gap-[var(--space-2)] lg:min-h-[56px]">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Live Preview</span>
            <ZoomResumeButton resume={resume} templateId={pickedTemplate ?? DEFAULT_RESUME_TEMPLATE} title="Live Preview" />
          </div>
          <div className="min-h-0 min-w-0 flex-1">
            <ResumeDocument resume={resume} templateId={pickedTemplate ?? DEFAULT_RESUME_TEMPLATE} cropped focusSection={WIZARD_STEP_SECTIONS[stepIndex]} activeField={activeField} />
          </div>
        </div>
      </div>

      {toast}
      {/* The same cinematic welcome every other surface opens with
         (direct feedback, 17 Sept 2026: pop-ups must match Explore,
         Connect, Match and Play). */}
      <WelcomeSplash surface="resume" open={welcome} onDone={dismissWelcome} />
    </Shell>
  );
}
