import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, MapPin, Search } from "lucide-react";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { BackButton, DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "College Lookup — Dreamari",
  description: "Find schools and programs that fit your route. In the works.",
};

// College Lookup shell (feature in the works). Reachable from route cards on
// /profile and from the quick-links menu; deliberately NOT a primary navbar
// tab until the full feature ships.
const PREVIEW = [
  { name: "State Flagship University", meta: "In-state · 4 yr", tag: "$9K/yr in-state" },
  { name: "City Community College", meta: "Local · 2 yr", tag: "$3K/yr" },
  { name: "Technical Institute", meta: "Regional · 18 mo", tag: "Certificate" },
];

export default async function CollegesPage({ searchParams }: { searchParams: Promise<{ school?: string | string[] }> }) {
  // Career Report college cards deep-link here with ?school=, so the lookup
  // carries the school across instead of dumping the student on a blank page.
  const params = await searchParams;
  const requested = Array.isArray(params.school) ? params.school[0] : params.school;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
        </div>

        <DesktopNavigation active="Profile" />
        <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
          <span className="flex items-center gap-[var(--space-3)]">
            <BackButton fallback="/profile" />
            <Wordmark />
          </span>
          <QuickLinksMenu />
        </header>

        <div className="relative z-10 mx-auto mt-4 hidden w-full max-w-[860px] px-5 md:block">
          <BackButton fallback="/profile" />
        </div>

        <main className="relative z-10 mx-auto flex w-full max-w-[860px] flex-col items-center gap-[var(--space-6)] px-5 pt-[48px] pb-[140px] text-center md:pt-[96px]">
          <span className="rounded-full border px-[14px] py-[5px] text-[10px] font-bold tracking-[0.6px] uppercase" style={{ borderColor: "var(--accent-subtle)", color: "var(--accent-subtle)" }}>In the works</span>
          <h1 className="text-[34px] leading-[38px] font-extrabold uppercase sm:text-[44px] sm:leading-[48px]" style={{ fontFamily: "var(--font-display)" }}>College Lookup</h1>
          <p className="max-w-[420px] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Real schools and programs, matched to your route and budget.</p>

          <div className="flex h-12 w-full max-w-[480px] items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: requested ? "var(--accent-subtle)" : "var(--glass-border)", opacity: requested ? 1 : 0.7 }}>
            <Search className="h-4 w-4 flex-none" style={{ color: requested ? "var(--accent-subtle)" : "var(--muted-foreground)" }} />
            <span className="min-w-0 truncate text-[13px]" style={{ color: requested ? "var(--foreground)" : "var(--muted-foreground)" }}>
              {requested ?? "Search schools, programs, cities"}
            </span>
          </div>
          {requested && (
            <p className="-mt-[var(--space-3)] text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
              Brought over from your Career Report. Full lookup is still in the works, so nothing searches yet.
            </p>
          )}

          <div className="grid w-full grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
            {PREVIEW.map((school) => (
              <div key={school.name} className="flex flex-col items-start gap-[var(--space-2)] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left opacity-80" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
                <GraduationCap className="h-5 w-5" style={{ color: "var(--accent-subtle)" }} />
                <span className="text-[14px] leading-[18px] font-bold">{school.name}</span>
                <span className="flex items-center gap-[4px] text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <MapPin className="h-3 w-3" /> {school.meta}
                </span>
                <span className="rounded-full px-[10px] py-[3px] text-[10px] font-bold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>{school.tag}</span>
              </div>
            ))}
          </div>

          <Link href="/profile" className="rounded-[var(--radius-md)] border px-[var(--space-5)] py-[var(--space-3)] text-[13px] font-semibold" style={{ borderColor: "var(--border)" }}>
            Back to My Profile
          </Link>
        </main>

        <MobileNav active="Profile" />
      </div>
    </>
  );
}
