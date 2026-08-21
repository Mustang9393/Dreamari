"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CirclePlay, Compass, Flame, House, Menu, Sparkle, Users, X } from "lucide-react";

// The student's avatar photo doubles as the Profile entry point in both navs.
const AVATAR_SRC = "/images/avatar-jordan.jpg";

// Brand wordmark (Figma "Logo Identity": 21x12 mark + DREAMARI in
// UI/Dreamari Logo). The mark renders via CSS mask so it follows
// currentColor instead of the asset's baked-in near-white fill.
export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="Dreamari" className="flex items-center gap-[var(--space-1)]" style={{ color: "var(--foreground)" }}>
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
  { label: "My Profile", href: "/profile" },
  { label: "Colleges", href: "/colleges" },
] as const;

export function BackButton({ fallback = "/home", className = "" }: { fallback?: string; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className={`flex size-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px] ${className}`}
      style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}

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
            /* near-solid: the old glass-surface let page content bleed through
               and made rows illegible in both themes */
            style={{ background: "color-mix(in srgb, var(--background) 95%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 20px 48px -20px rgba(0,0,0,0.7)" }}
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
      <Wordmark />

      {/* Absolutely centered on the viewport — the wordmark and the wider
         streak/XP cluster are unequal, so flex centering would sit left of
         true center. */}
      <nav
        className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-start gap-[var(--space-1)] rounded-[var(--radius-xl)] border px-[var(--space-2)] py-[6px]"
        style={{ background: "var(--muted)", borderColor: "var(--secondary)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === active;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="rounded-[var(--radius-md-alt)] px-[var(--space-4)] py-[6px] text-[12px] leading-[18px] tracking-[0.08em] uppercase transition-colors"
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
        {/* Streak/XP yield below lg so the dead-centered nav pill never
           collides with them on narrow desktop widths. */}
        <span className="hidden items-center gap-[6px] lg:flex">
          <Flame aria-hidden className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
            12
          </span>
        </span>
        <span className="hidden items-center gap-[6px] lg:flex">
          <Sparkle aria-hidden className="h-4 w-4" style={{ color: "var(--foreground)" }} />
          <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
            15,980 XP
          </span>
        </span>
        <Link href="/profile" aria-label="My Profile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={AVATAR_SRC} alt="" className="h-8 w-8 rounded-[var(--radius-lg)] border-[1.5px] object-cover" style={{ borderColor: "var(--accent)" }} />
        </Link>
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
      <Link
        href="/profile"
        aria-label="My Profile"
        aria-current={active === "Profile" ? "page" : undefined}
        className="flex h-11 w-11 items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AVATAR_SRC}
          alt=""
          className="size-7 rounded-full border-[1.5px] object-cover"
          style={{ borderColor: active === "Profile" ? "var(--accent)" : "transparent", opacity: active === "Profile" ? 1 : 0.75 }}
        />
      </Link>
    </nav>
  );
}
