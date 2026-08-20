"use client";

import Link from "next/link";
import { useState } from "react";
import { CirclePlay, Compass, Flame, House, Menu, Sparkle, User, Users, X } from "lucide-react";

// App chrome, ported from the Figma "Desktop Navigation" component
// (2570:4916: logo, center pill nav tabs, streak counter, XP, user avatar —
// "Use Selected to reflect the current screen") and the "Mobile Nav"
// component's five destinations. Icons are Lucide, the design system's icon
// set. Streak/XP figures are the design's own placeholder stats.

const NAV_ITEMS = [
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "Play", href: "#" },
  { label: "Connect", href: "#" },
] as const;

// Every page the prototype can demo, reachable from anywhere.
const QUICK_LINKS = [
  { label: "Landing", href: "/" },
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "Build", href: "/flow" },
  { label: "Match", href: "/match-lab" },
  { label: "Profile", href: "/profile" },
] as const;

export function QuickLinksMenu({ className, align = "right" }: { className?: string; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className ?? "relative"}>
      <button
        type="button"
        aria-label={open ? "Close quick links" : "Quick links"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-[var(--radius-xl)] border backdrop-blur-[10px]"
        style={{ background: "var(--glass-surface-2)", borderColor: open ? "var(--primary)" : "var(--glass-border)", color: "var(--foreground)" }}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close quick links" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <nav
            className={`filters-reveal absolute z-50 mt-2 flex min-w-[180px] flex-col gap-[2px] rounded-[var(--radius-lg)] border p-[var(--space-2)] backdrop-blur-[18px] ${align === "left" ? "left-0" : "right-0"}`}
            style={{ background: "var(--glass-surface-3)", borderColor: "var(--glass-border)", boxShadow: "0 20px 48px -20px rgba(0,0,0,0.7)" }}
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2h,10px)] text-[13px] leading-[18px] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
                style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

export function DesktopNavigation({ active }: { active: "Home" | "Explore" | "Play" | "Connect" | "Profile" }) {
  return (
    <header
      className="sticky top-0 z-40 hidden h-[62px] w-full items-center justify-between border-b px-[var(--space-8)] backdrop-blur-[2px] md:flex"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
    >
      <Link href="/" aria-label="Dreamari landing page" className="flex items-center gap-[var(--space-1)]">
        <span aria-hidden className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 12px 2px var(--primary)" }} />
        <span className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          DREAMARI
        </span>
      </Link>

      <nav
        className="flex items-start gap-[var(--space-1)] rounded-[var(--radius-xl)] border px-[var(--space-2)] py-[6px]"
        style={{ background: "var(--muted)", borderColor: "var(--secondary)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === active;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="rounded-[var(--radius-md-alt)] px-[var(--space-4)] py-[6px] text-[13px] leading-[18px] transition-colors"
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

      <div className="flex items-center gap-[var(--space-5)]">
        <span className="flex items-center gap-[6px]">
          <Flame aria-hidden className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
            12
          </span>
        </span>
        <span className="flex items-center gap-[6px]">
          <Sparkle aria-hidden className="h-4 w-4" style={{ color: "var(--foreground)" }} />
          <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
            15,980 XP
          </span>
        </span>
        <span
          aria-label="Your profile"
          className="h-8 w-8 rounded-[var(--radius-lg)] border-[1.5px]"
          style={{ borderColor: "var(--accent)", background: "linear-gradient(90deg, #3861ff, #8b7bff)" }}
        />
        <QuickLinksMenu />
      </div>
    </header>
  );
}

const MOBILE_ITEMS = [
  { label: "Home", href: "/home", Icon: House },
  { label: "Explore", href: "/explore", Icon: Compass },
  { label: "Play", href: "#", Icon: CirclePlay },
  { label: "Connect", href: "#", Icon: Users },
  { label: "Profile", href: "/profile", Icon: User },
] as const;

export function MobileNav({ active }: { active: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[56px] items-center justify-around border-t backdrop-blur-[10px] md:hidden"
      style={{ background: "var(--glass-surface-3)", borderColor: "var(--glass-border)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {MOBILE_ITEMS.map(({ label, href, Icon }) => {
        const isActive = label === active;
        return (
          <Link
            key={label}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className="flex h-11 w-11 items-center justify-center"
            style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}
