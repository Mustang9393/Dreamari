"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, CirclePlay, Compass, House, Menu, Moon, Sun, Users, X } from "lucide-react";
import { NotificationsButton } from "./Inbox";
import { useGlobalTheme } from "./theme";
import { DreamScoreChip } from "@/components/app/DreamScoreChip";
import { useStudentAvatarSrc } from "@/lib/avatar";
import { STUDENT } from "@/components/profile/data";
import { IconTip } from "@/components/app/IconTip";
import { Coachmark } from "@/components/flow/GestureSpotlight";

// The student's generated avatar doubles as the Profile entry point in both
// navs (direct feedback, 8 Sept 2026: "the avatar in the top navbar is still
// wrong" -- this file had its own hardcoded photo constant, a third place
// carrying the old real-photo path that the Connect/Profile pass missed).
// Same seed (first name only) as everywhere else the student appears, so
// the nav avatar is never a different face than the one on their own
// profile or their own posts.
const AVATAR_SEED = STUDENT.name.split(" ")[0] || STUDENT.name;

// Brand wordmark (Figma "Logo Identity": 21x12 mark + DREAMARI in
// UI/Dreamari Logo). The mark renders via CSS mask so it follows
// currentColor instead of the asset's baked-in near-white fill.
/** The one page title for every top-level tab (Home, Explore, Play, Connect,
 *  Profile, Colleges): all caps, the display face, one size. Direct feedback,
 *  4 Sept 2026: uniform across screens. */
export const PAGE_TITLE_CLASS = "text-[32px] leading-[1.05] font-extrabold uppercase sm:text-[44px]";
export const PAGE_TITLE_STYLE = { fontFamily: "var(--font-display)", color: "var(--foreground)" } as const;

// Careers and Schools (colleges + trade schools) both live conceptually
// inside Explore but are separate routes/pages (each with its own search and
// filters), so switching sections is a real navigation, not a client-side
// tab -- this sits in both ExploreExperience's and CollegesExperience's
// headers, under the page title. Direct feedback, 8 Sept 2026: the earlier
// "Careers / Colleges" breadcrumb read as awkward slash-separated text, so
// it became a single chip labeled with the destination -- but that chip sat
// RIGHT NEXT TO the page's own H1 ("Explore" + a chip reading "Schools"),
// which read as one phrase describing the current page ("Explore Schools")
// instead of a link elsewhere. Fixed 9 Sept 2026 by making it a real
// two-option tab strip (both names always visible, the active one
// underlined) placed on its OWN line under the H1, never beside it -- a
// pill-shaped control here would also compete for the same visual language
// as Explore's own For You/Browse All toggle, so these render as plain text
// tabs instead, reserving the pill shape for that local, same-page control.
// Labeled "Schools", not "Colleges" (direct feedback, 8 Sept 2026: the page
// covers trade schools too, and "Colleges" as the visible label makes
// clients ask whether trade schools are supported) -- the route/internal
// key stays "colleges", only the copy changed.
const EXPLORE_SECTIONS = [
  { key: "careers" as const, label: "Careers", href: "/explore" },
  { key: "colleges" as const, label: "Schools", href: "/colleges" },
];
export function ExploreSectionTabs({
  active,
  showTutorial = false,
  onDismissTutorial,
}: {
  active: "careers" | "colleges";
  /** Step 2 of the Explore tour (For You, then Schools -- direct feedback,
      24 Sept 2026: "they should happen in succession"), driven from
      ExploreExperience so both steps share one sequence instead of each
      firing off its own independent timer. Always false on /colleges
      itself, where this tab strip has nothing to introduce. */
  showTutorial?: boolean;
  onDismissTutorial?: () => void;
}) {
  const router = useRouter();
  const [pulsePlayed, setPulsePlayed] = useState(false);
  return (
    <div role="tablist" aria-label="Explore section" className="flex items-center gap-[var(--space-4)]">
      {EXPLORE_SECTIONS.map((section, i) => {
        const isActive = section.key === active;
        const pulsing = showTutorial && !pulsePlayed && section.key === "colleges" && !isActive;
        const button = (
          <button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => { onDismissTutorial?.(); if (!isActive) router.push(section.href); }}
            onAnimationEnd={() => { if (pulsing) setPulsePlayed(true); }}
            className={`relative -mx-[8px] -my-[3px] px-[8px] py-[3px] text-[14px] font-bold uppercase tracking-[0.01em] ${isActive ? "" : "dm-quiet cursor-pointer"} ${pulsing ? "dm-tab-nudge" : ""}`}
            style={{
              fontFamily: "var(--font-body)",
              color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {section.label}
            {/* Underline slides between Careers/Colleges via a shared
               layoutId instead of just snapping into place (direct
               feedback: "have whatever highlight we end up keeping for
               tabs... animate and slide over when we switch"). */}
            {isActive && (
              <motion.span
                layoutId="explore-section-tab-underline"
                aria-hidden
                className="absolute inset-x-0 -bottom-[5px] h-[2px]"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
        return (
          <span key={section.key} className="flex items-center gap-[var(--space-4)]">
            {i > 0 && <span aria-hidden style={{ color: "var(--glass-border)" }}>|</span>}
            {section.key === "colleges" && active === "careers" ? (
              <Coachmark
                active={showTutorial}
                label="Schools have a tab too! Look up any school, or see the ones picked for you."
                onDismiss={() => onDismissTutorial?.()}
                side="bottom"
                align="end"
                spotlight
              >
                {button}
              </Coachmark>
            ) : (
              button
            )}
          </span>
        );
      })}
    </div>
  );
}

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="Dreamari" className="dm-link flex items-center gap-[var(--space-1)]" style={{ color: "var(--foreground)" }}>
      <span
        aria-hidden
        className="h-[12px] w-[21px] flex-none"
        style={{
          background: "currentColor",
          maskImage: "url(/images/app/logo-mark.svg)",
          WebkitMaskImage: "url(/images/app/logo-mark.svg)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
      <span className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>DREAMARI</span>
    </Link>
  );
}

// App chrome, ported from the Figma "Desktop Navigation" component
// (2570:4916: logo, center pill nav tabs, streak counter, XP, user avatar —
// "Use Selected to reflect the current screen") and the "Mobile Nav"
// component's five destinations. Icons are Lucide, the design system's icon
// set. Streak/XP figures are the design's own placeholder stats.

const NAV_ITEMS = [
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "Play", href: "/play" },
  { label: "Connect", href: "/connect" },
] as const;

// Every page the prototype can demo, reachable from anywhere.
const QUICK_LINKS = [
  { label: "Landing", href: "/" },
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "Build", href: "/flow" },
  { label: "Match", href: "/match-grid" },
  { label: "Play", href: "/play" },
  { label: "My Profile", href: "/profile" },
  { label: "Find a school", href: "/colleges" },
  { label: "Connect", href: "/connect" },
  { label: "Sign Up", href: "/signup" },
] as const;

// DEMO-ONLY: perspectives (Connect 2.0) -- each role's own Connect, one tap
// from any screen. Demo scaffolding; remove before production. See
// docs/HANDOFF_INDEX.md's Demo vs Production section.
const DEMO_LINKS = [
  { label: "Student", href: "/connect" },
  { label: "Event attendee", href: "/connect?tab=events&as=attendee" },
  { label: "Volunteer", href: "/connect?dashboard=pro-okafor&as=pro" },
  { label: "Partner", href: "/connect?partner=JPMorgan%20Chase&as=partner" },
  { label: "Staff", href: "/connect?admin=1&as=admin" },
] as const;

// DEMO-ONLY: entry point into the separate Counselor Dashboard product --
// its own isolated app (own sign-up/sign-in, own shell, no shared chrome
// with the student app) by direct product decision, reachable for now only
// from here since there's no real counselor-account/org onboarding yet.
// Remove/replace once that exists. See docs/HANDOFF_INDEX.md.
const COUNSELOR_LINKS = [{ label: "Counselor Dashboard", href: "/counselor" }] as const;

export function BackButton({ fallback = "/home", className = "" }: { fallback?: string; className?: string }) {
  const router = useRouter();
  return (
    <IconTip label="Go back">
      <button
        type="button"
        aria-label="Go back"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push(fallback);
        }}
        className={`dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px] ${className}`}
        style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </IconTip>
  );
}

/** The one menu every screen shares: the app's pages, the Connect demo
 *  roles, and the theme choice. The landing pages' hamburger renders this
 *  same panel (direct instruction, 11 Sept 2026: identical menus everywhere,
 *  theme toggle inside the menu). `extra` lets a page add its own rows on
 *  top. `hideDemoLinks` (marketing nav only) skips only the Connect role
 *  switcher -- that one is internal QA/demo scaffolding (the "Demo-only
 *  scaffolding" section of docs/handoff/specs/connect.md), not navigation a
 *  real visitor should see. `QUICK_LINKS` is the real site map (a link to
 *  every tab/flow, not sunsetted) and stays in both menus -- it was wrongly
 *  swept into the same `hideDemoLinks` guard on 15 Sept 2026 and got cut
 *  from the marketing hamburger along with the role switcher; corrected the
 *  same day. */
export function QuickLinksPanel({ onNavigate, extra, className = "", hideDemoLinks = false }: { onNavigate?: () => void; extra?: React.ReactNode; className?: string; hideDemoLinks?: boolean }) {
  const { theme, toggle } = useGlobalTheme();
  return (
    <div className={`flex flex-col gap-[2px] ${className}`}>
      {extra}
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          onClick={onNavigate}
          className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2h,10px)] text-[13px] leading-[18px] font-semibold tracking-[0.08em] uppercase transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
          style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
        >
          {link.label}
        </Link>
      ))}
      <span className="mt-[var(--space-2)] border-t px-[var(--space-4)] pt-[var(--space-3)] text-[10.5px] leading-[14px] font-semibold tracking-[0.1em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Counselor demo</span>
      {COUNSELOR_LINKS.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          onClick={onNavigate}
          className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[8px] text-[13px] leading-[18px] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
          style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
        >
          {link.label}
        </Link>
      ))}
      {!hideDemoLinks && (
        <>
          <span className="mt-[var(--space-2)] border-t px-[var(--space-4)] pt-[var(--space-3)] text-[10.5px] leading-[14px] font-semibold tracking-[0.1em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Connect demo · view as</span>
          {DEMO_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onNavigate}
              className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[8px] text-[13px] leading-[18px] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
              style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
            >
              {link.label}
            </Link>
          ))}
        </>
      )}
      {/* Theme choice rides in the same menu on every screen */}
      <button
        type="button"
        onClick={toggle}
        className="dm-quiet mt-[2px] flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border-t px-[var(--space-4)] py-[var(--space-2h,10px)] pt-[12px] text-left text-[13px] leading-[18px] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
        style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", borderColor: "var(--glass-border)" }}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
    </div>
  );
}

export function QuickLinksMenu({ className, align = "right" }: { className?: string; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  // the backdrop handles taps outside; scrolling away or Escape closes it too
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("scroll", close, { passive: true, once: true });
    document.addEventListener("keydown", key);
    return () => { window.removeEventListener("scroll", close); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div className={className ?? "relative"}>
      <IconTip label={open ? "Close quick links" : "Quick links"}>
        <button
          type="button"
          aria-label={open ? "Close quick links" : "Quick links"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full"
          style={{ color: open ? "var(--primary)" : "var(--foreground)" }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </IconTip>
      {open && (
        <>
          <button type="button" aria-label="Close quick links" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          {/* max-h + overflow-y-auto: this panel has grown row by row as
             more demo sections were added to it (Connect's view-as list,
             then the Counselor Dashboard entry) and had no ceiling at all --
             on a shorter window it now runs taller than the viewport, with
             no way to scroll to the rows past the bottom edge (direct
             report, 22 Sept 2026). Capped relative to the viewport (not a
             flat px number) since this menu opens from different trigger
             heights across the app (the main site header vs. the counselor
             dashboard's own topbar). dm-scroll matches every other
             internally-scrolling panel's own scrollbar styling. */}
          <nav
            className={`filters-reveal dm-scroll absolute z-50 mt-2 max-h-[min(70dvh,520px)] min-w-[180px] overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border p-[var(--space-2)] backdrop-blur-[18px] ${align === "left" ? "left-0" : "right-0"}`}
            /* near-solid: the old glass-surface let page content bleed through
               and made rows illegible in both themes */
            style={{ background: "color-mix(in srgb, var(--background) 95%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 20px 48px -20px rgba(0,0,0,0.7)" }}
          >
            <QuickLinksPanel onNavigate={() => setOpen(false)} />
          </nav>
        </>
      )}
    </div>
  );
}

// Scroll-conditional frost, exact technique as the marketing site's floating
// nav island (`marketing/Nav.tsx`): fully transparent at rest, frosts in via
// `color-mix` + `backdropFilter` only once the page has actually scrolled.
// Reused here (rather than reinvented) because it's the one blur treatment
// in this codebase already proven not to cause the "large-area filter:
// blur() recomposites every scroll frame" stutter that got backdrop-filter
// pulled from this exact header once already (14 Sept 2026) -- the
// difference is scale: that bar was full-width edge-to-edge; a small,
// inset, floating pill blurs a much smaller backing region.
export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function DesktopNavigation({
  active, extraClassName, forceBlur = false,
}: {
  active: "Home" | "Explore" | "Play" | "Connect" | "Profile";
  extraClassName?: string;
  /** For a screen whose main content never lets the page itself scroll
   *  (Explore's For You reel, which owns its own internal scroll so
   *  `window.scrollY` never moves -- direct feedback, 22 Sept 2026: "the
   *  navbar in the explore/school/browse all doesn't have any blur"):
   *  the scroll-triggered frost this bar otherwise waits for would never
   *  fire. Forces the frosted state on regardless of real scroll
   *  position. */
  forceBlur?: boolean;
}) {
  const avatarSrc = useStudentAvatarSrc(AVATAR_SEED);
  const autoScrolled = useScrolled();
  const scrolled = forceBlur || autoScrolled;
  return (
    // Outer host stays `sticky` and keeps reserving its own layout height
    // exactly as before (direct feedback, 15 Sept 2026: floating nav like
    // the landing page, but nothing else on any page should have to change
    // its own top padding to compensate) -- only the VISIBLE bar inside it
    // becomes the inset, rounded, conditionally-blurred floating pill.
    // `extraClassName` (e.g. "no-print") goes HERE, on the sticky element
    // itself, never on a wrapping div: a wrapper wrapping ONLY this sticky
    // child is exactly as tall as the child, which gives position:sticky
    // zero room to actually stick -- it scrolls away the instant the
    // wrapper's own box (86px) clears the viewport top (16 Sept 2026 bug,
    // found on Profile and Career Detail, both of which used to wrap this
    // in their own `<div className="no-print">`).
    // Desktop only from lg: tablets use the phone chrome (logo, XP, inbox,
    // hamburger up top; the bottom nav for destinations), which is what the
    // student learns on their phone anyway (direct feedback, 18 Sept 2026).
    <div className={`sticky top-0 z-40 hidden h-[86px] w-full lg:block ${extraClassName ?? ""}`}>
      {/* max-w-[1440px] + px-[space-14]: matches every page's own content
         column exactly (Home/Explore/Profile/Play/Colleges/Connect all use
         this same max-width + inset), not the narrower 1320/px-3 this used
         to carry -- the bar's outer edge lined up ~16px inside the page's
         own edge instead of flush with it (direct feedback, 22 Sept 2026:
         "top navbar should be as wide as the content is... stick to margin
         standards"). */}
      <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between px-[var(--space-14)] pt-3">
        <header
          className="relative flex h-[62px] w-full items-center justify-between rounded-[28px] px-[var(--space-6)] transition-[background-color,border-color,box-shadow] duration-300"
          style={{
            background: scrolled ? "color-mix(in srgb, var(--background) 62%, transparent)" : "transparent",
            backdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
            border: `1px solid ${scrolled ? "var(--glass-border)" : "transparent"}`,
            boxShadow: scrolled ? "0 12px 32px -16px rgba(0,0,0,0.55)" : "none",
          }}
        >
          <Wordmark />

          {/* Absolutely centered on the viewport — the wordmark and the wider
             streak/XP cluster are unequal, so flex centering would sit left of
             true center. */}
          {/* In flow on tablets so it can never sit under the right cluster;
             dead-centred only from lg, where there is room (direct feedback,
             18 Sept 2026: "cluttered and overlapping on tablet"). */}
          <nav
            className="flex items-start gap-[var(--space-1)] rounded-[var(--radius-lg)] border px-[var(--space-2)] py-[6px] lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
            style={{ background: "var(--muted)", borderColor: "var(--secondary)" }}
          >
            {/* prefetch={false}: these 5 links render on every page, so Next's
               default eager prefetch was fetching all 5 routes' RSC payloads
               on every single page load whether or not the student ever
               clicked them -- part of the "stuttering everywhere" report, 14
               Sept 2026. A click still fetches instantly; it just isn't
               speculative anymore. */}
            {NAV_ITEMS.map((item) => {
              const isActive = item.label === active;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className="dm-quiet rounded-[var(--radius-md)] px-[var(--space-3)] py-[6px] text-[12px] leading-[18px] tracking-[0.08em] uppercase lg:px-[var(--space-4)]"
                  style={{
                    background: isActive ? "var(--primary)" : "transparent",
                    color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
                    fontFamily: "var(--font-body)",
                    fontWeight: isActive ? 700 : 600,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-[var(--space-3)] lg:gap-[var(--space-4)]">
            {/* One chip for streak and Dream Score on every page, Profile
               included: the score stays at the top of the app the way it
               lands there after Build (Joshua Pierce, Slack, 6 Sept 2026). */}
            <DreamScoreChip />
            <NotificationsButton />
            <IconTip label="My Profile">
              <Link href="/profile" aria-label="My Profile" className="dm-quiet flex items-center rounded-[var(--radius-lg)]">
                <Image src={avatarSrc} alt="" width={64} height={64} className="block h-8 w-8 rounded-[var(--radius-lg)] border-[1.5px] object-cover" style={{ borderColor: "var(--accent)" }} />
              </Link>
            </IconTip>
            <QuickLinksMenu />
          </div>
        </header>
      </div>
    </div>
  );
}

// Shared sticky mobile header shell (direct feedback, 15 Sept 2026: the top
// bar should stay pinned and get the same floating-glass look as the
// desktop nav and the landing page, instead of scrolling away). Six pages
// used to hand-roll a byte-for-byte identical plain `<header>` here
// (`relative z-50 flex items-center justify-between px-5 pt-5 pb-2
// md:hidden`) that just scrolled off with the page; this is that same slot,
// now sticky and wrapped in the same scroll-conditional pill treatment
// `DesktopNavigation` uses, so every page's own header content (which
// still differs -- some carry a back chevron, some don't) drops straight
// in unchanged as `children`. `extraClassName` exists only so
// `no-print`-carrying pages (Profile, Career Detail) can keep that.
export function MobileHeaderShell({
  children, extraClassName, forceBlur = false,
}: {
  children: React.ReactNode;
  extraClassName?: string;
  /** Same reasoning as DesktopNavigation's own `forceBlur` -- a screen
   *  whose reel owns its own internal scroll never moves `window.scrollY`,
   *  so the scroll-triggered frost never fires on its own. */
  forceBlur?: boolean;
}) {
  const autoScrolled = useScrolled();
  const scrolled = forceBlur || autoScrolled;
  return (
    <div className={`sticky top-0 z-50 lg:hidden ${extraClassName ?? ""}`}>
      <div className="px-3 pt-3">
        <div
          className="flex items-center justify-between rounded-[22px] px-[14px] py-[10px] transition-[background-color,border-color,box-shadow] duration-300"
          style={{
            background: scrolled ? "color-mix(in srgb, var(--background) 62%, transparent)" : "transparent",
            backdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
            border: `1px solid ${scrolled ? "var(--glass-border)" : "transparent"}`,
            boxShadow: scrolled ? "0 12px 32px -16px rgba(0,0,0,0.55)" : "none",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const MOBILE_ITEMS = [
  { label: "Home", href: "/home", Icon: House },
  { label: "Explore", href: "/explore", Icon: Compass },
  { label: "Play", href: "/play", Icon: CirclePlay },
  { label: "Connect", href: "/connect", Icon: Users },
] as const;

export function MobileNav({ active }: { active: string }) {
  const avatarSrc = useStudentAvatarSrc(AVATAR_SEED);
  return (
    <nav
      // Near-solid, no blur -- same reasoning as DesktopNavigation above:
      // a fixed, full-width backdrop-blur bar costs a recomposite on every
      // scroll frame, on every page, which is a lot to pay for a bar that's
      // always on screen.
      className="fixed inset-x-0 bottom-0 z-40 flex h-[56px] items-center justify-around border-t lg:hidden"
      style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--glass-border)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {MOBILE_ITEMS.map(({ label, href, Icon }) => {
        const isActive = label === active;
        return (
          <IconTip key={label} label={label}>
            <Link
              href={href}
              prefetch={false}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="dm-quiet flex h-11 w-11 items-center justify-center rounded-full"
              style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 2} />
            </Link>
          </IconTip>
        );
      })}
      <IconTip label="My Profile">
        <Link
          href="/profile"
          prefetch={false}
          aria-label="My Profile"
          aria-current={active === "Profile" ? "page" : undefined}
          className="dm-quiet flex h-11 w-11 items-center justify-center rounded-full"
        >
          <Image
            src={avatarSrc}
            alt=""
            width={56}
            height={56}
            className="block size-7 rounded-full border-[1.5px] object-cover"
            style={{ borderColor: active === "Profile" ? "var(--accent)" : "transparent", opacity: active === "Profile" ? 1 : 0.75 }}
          />
        </Link>
      </IconTip>
    </nav>
  );
}
