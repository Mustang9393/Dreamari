"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavProps = {
  onSchoolsClick: () => void;
};

const LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Simulations", href: "#play" },
  { label: "Career worlds", href: "#explore" },
];

// Demo quick-links (v3): jump straight into the interactive prototypes without
// scrolling for a CTA — Build = the profile flow, Match = the match-flow lab.
const QUICK_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "Build", href: "/flow" },
  { label: "Match", href: "/match-lab" },
  { label: "Play", href: "/play" },
  { label: "Connect", href: "/connect" },
  { label: "My Profile", href: "/profile" },
];

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
export function Nav({ onSchoolsClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide-on-scroll-down / reveal-on-scroll-up — added after the floating island
  // was reported covering chapter titles (PLAY especially) on mobile: the chapters
  // fill the viewport and their titles sit near its top, exactly where an
  // always-visible island lives. Scrolling down = reading = the island gets out of
  // the way entirely; any upward scroll (= reaching for navigation) brings it
  // back. A small delta threshold keeps micro-jitters (iOS momentum wobble, dvh
  // toolbar settling) from toggling it. ChapterShell also sets scroll-mt on
  // sections so JS-driven chapter advances land titles below the island's zone
  // for the cases where it IS showing.
  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 24);
      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 160);
        lastY = y;
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
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

        {/* Links stay desktop-only (same 900px tier as before — below that there's no
           room without wrapping, and the page is a single scroll anyway). */}
        <nav className="hidden gap-[28px] text-[14px] font-semibold min-[900px]:flex" style={{ color: "var(--muted-foreground)" }}>
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="transition-colors hover:[color:var(--foreground)]">
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={onSchoolsClick} className="transition-colors hover:[color:var(--foreground)]">
            For schools
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/flow"
            className="rounded-full px-4 py-2 text-[13px] font-bold whitespace-nowrap transition-transform duration-150 hover:-translate-y-px active:scale-[0.97] sm:px-5 sm:py-2.5 sm:text-sm"
            style={{
              background: "linear-gradient(180deg, #4a82ff, var(--primary))",
              color: "var(--primary-foreground)",
              boxShadow: "0 6px 18px -6px rgba(47,107,242,.65)",
            }}
          >
            Get started
          </Link>
          {/* Hamburger: phones/tablets only — quick route into the demos
             without hunting for CTAs mid-pitch. */}
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
            className="absolute top-[calc(100%+8px)] right-0 flex w-60 flex-col gap-1 rounded-2xl border p-2"
            style={{
              background: "color-mix(in srgb, var(--background) 97%, var(--foreground))",
              backdropFilter: "blur(18px) saturate(1.6)",
              WebkitBackdropFilter: "blur(18px) saturate(1.6)",
              borderColor: "var(--glass-border)",
              boxShadow: "0 16px 40px -16px rgba(0,0,0,0.6)",
            }}
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-[14px] font-bold"
                style={{ color: "var(--primary-tint)", background: "var(--glass-surface-1)" }}
              >
                {link.label}
              </Link>
            ))}
            {LINKS.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-2.5 text-[14px] font-semibold min-[900px]:hidden" style={{ color: "var(--foreground)" }}>
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onSchoolsClick();
              }}
              className="rounded-xl px-4 py-2.5 text-left text-[14px] font-semibold min-[900px]:hidden"
              style={{ color: "var(--foreground)" }}
            >
              For schools
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
