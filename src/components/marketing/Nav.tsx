"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { QuickLinksPanel } from "@/components/app/chrome";
import { ENTERPRISE_ENABLED } from "./AudienceToggle";

type NavProps = {
  view: "student" | "schools";
  onSchoolsClick: () => void;
  onStudentClick?: () => void;
};

// Inline link rows (student "How it works/Simulations/Career worlds" and
// schools "Why Dreamari/Student Experience/For Your Organization") were
// dropped from both the desktop bar and the hamburger 15 Sept 2026 (direct
// feedback: minimize what's on the landing page) -- this is a single
// long-scroll page, so the links only ever saved a scroll, and the
// audience toggle plus CTA already say everything the bar needs to.

// Re-imagined per direct feedback ("it doesn't need to be this complicated...
// something modern and out of the box"): a floating frosted-glass island instead of
// the old full-width sticky bar. "Sign in" is gone entirely and the CTA slimmed to
// one compact "Get started" — the hero's big Start Journey button 100px below is the
// real conversion point; the nav one is just a persistent escape hatch once you've
// scrolled away from it.
//
// Scroll behavior, which is most of what makes a floating island work or not: at
// page top the island is fully transparent (no fill, no border, no shadow — the
// links simply float over the hero, so the hero owns the whole first screen), and
// once anything would actually scroll UNDER it (past a small threshold) it frosts
// in: translucent background derived from var(--background) via color-mix (so the
// Schools light theme frosts correctly too), backdrop blur + saturate for the
// glassy pop, hairline border, soft shadow. `fixed` rather than sticky because the
// island isn't a bar owning a slice of layout — it hovers; the hero's own top
// padding clears it.
export function Nav({ view, onSchoolsClick, onStudentClick }: NavProps) {
  const schools = view === "schools";
  const cta = schools ? { label: "Request a demo", href: "#demo" } : { label: "Start Journey", href: "/flow" };
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  // The nav's own CTA is a persistent "escape hatch" once you've scrolled
  // away from the hero -- but the hero's OWN big Start Journey button is
  // sitting right there at the top of the page too, so showing this one
  // immediately doubled up on the exact same button, in the exact same
  // spot on screen (direct feedback, 16 Sept 2026: "so theres no clash").
  // Gated on the fold itself (viewport height), not the small 24px frost
  // threshold above -- the island can frost in over the hero without its
  // CTA appearing until the hero's own CTA has scrolled out of view.
  const [pastFold, setPastFold] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // The open menu closes on a tap outside the island, on Escape, or as soon as
  // the page scrolls (it used to ride along, open, until closed by hand).
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    const down = (e: PointerEvent) => { if (headerRef.current && !headerRef.current.contains(e.target as Node)) close(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); window.removeEventListener("scroll", close); };
  }, [menuOpen]);

  // Hide-on-scroll-down / reveal-on-scroll-up — added after the floating island
  // was reported covering chapter titles (PLAY especially) on mobile: the chapters
  // fill the viewport and their titles sit near its top, exactly where an
  // always-visible island lives. Scrolling down = reading = the island gets out of
  // the way entirely; any upward scroll (= reaching for navigation) brings it
  // back. A small delta threshold keeps micro-jitters (iOS momentum wobble, dvh
  // toolbar settling) from toggling it. ChapterShell also sets scroll-mt on
  // sections so JS-driven chapter advances land titles below the island's zone
  // for the cases where it IS showing.
  // The island stays put for the first 11 seconds (direct feedback: it was
  // gone before a reader had taken it in), then hides on scroll-down and
  // returns on any scroll-up as before.
  useEffect(() => {
    let lastY = window.scrollY;
    let graceOver = false;
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 24);
      setPastFold(y > window.innerHeight * 0.9);
      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        if (graceOver) setHidden(delta > 0 && y > 160);
        lastY = y;
      }
    }
    const grace = window.setTimeout(() => {
      graceOver = true;
      if (window.scrollY > 160) setHidden(true);
    }, 11000);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.clearTimeout(grace); };
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-3 top-3 z-50 flex justify-center transition-transform duration-300 sm:inset-x-6 sm:top-4"
      style={{ transform: hidden ? "translateY(calc(-100% - 16px))" : "translateY(0)" }}
    >
      <div
        className="relative flex w-full max-w-[1040px] items-center justify-between rounded-full py-2 pr-2 pl-5 transition-all duration-300 sm:py-2.5 sm:pr-2.5 sm:pl-6"
        style={{
          background: scrolled ? "color-mix(in srgb, var(--background) 58%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
          border: `1px solid ${scrolled ? "var(--glass-border)" : "transparent"}`,
          boxShadow: scrolled ? "0 12px 32px -16px rgba(0,0,0,0.55)" : "none",
        }}
      >
        <Link href="#" className="flex items-center gap-2 text-[17px] font-extrabold sm:text-[19px]" style={{ color: "var(--foreground)" }}>
          {/* Real Logo Identity mark (masked so it follows currentColor) */}
          <span
            aria-hidden
            className="h-[13px] w-[22px] sm:h-[14px] sm:w-[24px]"
            style={{
              background: "currentColor",
              maskImage: "url(/images/app/logo-mark.svg)",
              WebkitMaskImage: "url(/images/app/logo-mark.svg)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
          DREAMARI
        </Link>

        <div className="flex items-center gap-2">
          {/* Fades/scales in only past the fold, doesn't unmount -- an
             unmount would jump the hamburger sideways the instant this
             appears; a reserved-but-invisible slot keeps that fixed while
             this button fades in on top of it. */}
          <Link
            href={cta.href}
            aria-hidden={!pastFold}
            tabIndex={pastFold ? 0 : -1}
            className="rounded-xl px-4 py-2 text-[13px] font-bold whitespace-nowrap transition-all duration-300 hover:-translate-y-px active:scale-[0.97] sm:px-5 sm:py-2.5 sm:text-sm"
            style={{
              background: "linear-gradient(180deg, #4a82ff, var(--primary))",
              color: "var(--primary-foreground)",
              boxShadow: "0 6px 18px -6px rgba(47,107,242,.65)",
              opacity: pastFold ? 1 : 0,
              transform: pastFold ? "scale(1)" : "scale(0.85)",
              pointerEvents: pastFold ? "auto" : "none",
            }}
          >
            {cta.label}
          </Link>
          {/* Hamburger: now the only way to switch audience or theme at any
             width, since the inline link rows are gone. */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border"
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              {menuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div
            className="absolute top-[calc(100%+8px)] right-0 flex max-h-[min(78vh,720px)] w-64 flex-col gap-1 overflow-y-auto rounded-2xl border p-2"
            style={{
              background: "color-mix(in srgb, var(--background) 97%, var(--foreground))",
              backdropFilter: "blur(18px) saturate(1.6)",
              WebkitBackdropFilter: "blur(18px) saturate(1.6)",
              borderColor: "var(--glass-border)",
              boxShadow: "0 16px 40px -16px rgba(0,0,0,0.6)",
            }}
          >
            <QuickLinksPanel
              onNavigate={() => setMenuOpen(false)}
              hideDemoLinks
              extra={
                <>
                  {schools ? (
                    onStudentClick && (
                      <button type="button" onClick={() => { setMenuOpen(false); onStudentClick(); }} className="rounded-xl px-4 py-2 text-left text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                        For students
                      </button>
                    )
                  ) : (
                    // Disabled alongside the Hero pill (15 Sept 2026: the
                    // schools/enterprise page is mid-redesign, not ready for
                    // the live site) -- same ENTERPRISE_ENABLED flag, so
                    // flipping it back on re-enables both entry points at once.
                    <button
                      type="button"
                      disabled={!ENTERPRISE_ENABLED}
                      aria-disabled={!ENTERPRISE_ENABLED}
                      title={!ENTERPRISE_ENABLED ? "Coming soon" : undefined}
                      onClick={ENTERPRISE_ENABLED ? () => { setMenuOpen(false); onSchoolsClick(); } : undefined}
                      className="rounded-xl px-4 py-2 text-left text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ color: "var(--foreground)" }}
                    >
                      For schools
                    </button>
                  )}
                  <div className="mx-4 my-1 border-t" style={{ borderColor: "var(--glass-border)" }} />
                </>
              }
            />
          </div>
        )}
      </div>
    </header>
  );
}
