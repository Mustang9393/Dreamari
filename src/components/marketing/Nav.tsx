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

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-3 top-3 z-50 flex justify-center sm:inset-x-6 sm:top-4">
      <div
        className="flex w-full max-w-[1040px] items-center justify-between rounded-full py-2 pr-2 pl-5 transition-all duration-300 sm:py-2.5 sm:pr-2.5 sm:pl-6"
        style={{
          background: scrolled ? "color-mix(in srgb, var(--background) 58%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.6)" : "none",
          border: `1px solid ${scrolled ? "var(--glass-border)" : "transparent"}`,
          boxShadow: scrolled ? "0 12px 32px -16px rgba(0,0,0,0.55)" : "none",
        }}
      >
        <Link href="#" className="flex items-center gap-2 text-[17px] font-extrabold sm:text-[19px]" style={{ color: "var(--foreground)" }}>
          <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 12px 2px var(--primary)" }} />
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
      </div>
    </header>
  );
}
