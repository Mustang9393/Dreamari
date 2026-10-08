"use client";

// A stand-in for the student Home so the companion has a real-looking
// screen to sit over while we tune his timing. Built here, loosely in
// Home's shape (one photo hero, the three Next Moves cards, a poster rail,
// a short list), with placeholder content. Nothing here is imported from
// the real Home and nothing here is interactive: the lab is about Dreamy,
// not the page under him.

import Image from "next/image";
import { Compass, Flame, Gamepad2, Home, Play, UserRound, Users } from "lucide-react";

const CARD = { background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

const POSTERS = [
  { title: "Data Analyst", world: "Tech & Engineering", photo: "/images/app/poster-data-analyst.webp", accent: "var(--world-tech-engineering-design)" },
  { title: "Animator", world: "Arts, Media & Sport", photo: "/images/app/poster-animator.webp", accent: "var(--world-arts-media-sport)" },
  { title: "Cardiologist", world: "Health & Medicine", photo: "/images/app/poster-cardiologist.webp", accent: "var(--world-health-medicine)" },
  { title: "Entrepreneur", world: "Business & Finance", photo: "/images/app/poster-entrepreneur.webp", accent: "var(--world-business-money-office)" },
  { title: "Drone Pilot", world: "Driving, Flying & Shipping", photo: "/images/app/poster-drone-pilot.webp", accent: "var(--world-driving-flying-shipping)" },
];

const MOVES = [
  { title: "Resume", line: "1 review waiting", meta: "Ms. Diaz left a note" },
  { title: "My Plan", line: "FAFSA in 3 days", meta: "2 of 5 steps done" },
  { title: "Streak", line: "4 days", meta: "Play today to keep it" },
];

const KEEP_GOING = [
  { title: "Registered Nurse sim", meta: "Level 2 of 4", pct: 48 },
  { title: "Glossary: Business Basics", meta: "6 of 10 terms", pct: 60 },
  { title: "Investment Banking sim", meta: "Level 1 of 4", pct: 20 },
];

function SectionHead({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-end justify-between gap-[16px]">
      <h2 className="text-[20px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      {action && <span className="rounded-full border px-[12px] py-[5px] text-[12px] font-semibold" style={{ ...CARD, background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>{action}</span>}
    </div>
  );
}

export function FakeHome() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-[22px] px-[16px] pt-[16px] pb-[140px] sm:px-[24px] lg:pb-[160px]" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }} aria-label="A stand-in Home screen">
      {/* the top strip: wordmark and the five tabs, as words only */}
      <div className="flex items-center justify-between gap-[16px]">
        <span className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>dreamari</span>
        <nav aria-hidden className="hidden items-center gap-[18px] text-[13px] font-semibold md:flex" style={{ color: "var(--muted-foreground)" }}>
          <span style={{ color: "var(--foreground)" }}>Home</span><span>Explore</span><span>Play</span><span>Connect</span><span>Profile</span>
        </nav>
        <span className="flex size-[32px] items-center justify-center rounded-full border" style={CARD}><UserRound className="h-[16px] w-[16px]" aria-hidden /></span>
      </div>

      {/* hero: one photo card */}
      <div className="relative h-[240px] w-full overflow-hidden rounded-[var(--radius-xl)] border sm:h-[300px]" style={{ ...CARD, background: "#0e0c20" }}>
        <Image src="/images/home/hero/drone-pilot-sky.webp" alt="" fill sizes="(max-width: 1100px) 100vw, 1100px" className="object-cover" style={{ objectPosition: "50% 30%" }} priority />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(14,12,32,0.9) 0%, rgba(14,12,32,0.6) 36%, transparent 68%), linear-gradient(to top, rgba(12,16,35,0.6) 0%, transparent 50%)" }} />
        <div className="relative z-[1] flex h-full max-w-[560px] flex-col justify-end gap-[8px] p-[20px] sm:p-[28px]" style={{ color: "#fff" }}>
          <p className="text-[10.5px] leading-[14px] font-bold tracking-[0.1em] uppercase" style={{ color: "color-mix(in srgb, var(--world-driving-flying-shipping) 55%, #fff)" }}>Daily Drop</p>
          <p className="text-[30px] leading-[1.04] font-extrabold text-balance sm:text-[40px]" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>Fly a drone for a day</p>
          <p className="text-[14px] leading-[19px] font-medium" style={{ color: "rgba(255,255,255,0.86)" }}>A 12 minute sim. Earn 40 XP.</p>
          <span className="mt-[8px] inline-flex h-[42px] w-fit items-center gap-[8px] rounded-[var(--radius-md)] px-[18px] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Play className="h-[15px] w-[15px]" aria-hidden />Play now</span>
        </div>
      </div>

      {/* three cards, one height */}
      <section className="flex flex-col gap-[14px]">
        <SectionHead title="Your Next Moves" />
        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-3">
          {MOVES.map((m) => (
            <div key={m.title} className="flex min-h-[120px] flex-col rounded-[var(--radius-lg)] border p-[16px]" style={CARD}>
              <p className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{m.title}</p>
              <p className="mt-[6px] text-[20px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{m.line}</p>
              <p className="mt-auto flex items-center gap-[6px] pt-[10px] text-[12.5px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{m.title === "Streak" && <Flame className="h-[13px] w-[13px]" style={{ color: "var(--world-arts-media-sport)" }} aria-hidden />}{m.meta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* the poster rail */}
      <section className="flex flex-col gap-[14px]">
        <SectionHead title="Careers for Your Interests" action="Explore all" />
        <div className="flow-scroll -mx-[16px] flex gap-[12px] overflow-x-auto px-[16px] pb-[12px] sm:-mx-[24px] sm:px-[24px]">
          {POSTERS.map((p) => (
            <div key={p.title} className="relative h-[213px] w-[150px] flex-none overflow-hidden rounded-[var(--radius-lg)] border" style={CARD}>
              <Image src={p.photo} alt="" fill sizes="150px" className="object-cover" draggable={false} />
              <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,10,22,0.92) 0%, rgba(8,10,22,0.45) 45%, transparent 70%)" }} />
              <div className="absolute inset-x-0 bottom-0 p-[12px]" style={{ color: "#fff" }}>
                <p className="text-[17px] leading-[20px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)" }}>{p.title}</p>
                <p className="mt-[4px] truncate text-[10px] leading-[14px] font-semibold tracking-[0.06em] uppercase" style={{ color: `color-mix(in srgb, ${p.accent} 60%, #fff)` }}>{p.world}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* a short list */}
      <section className="flex flex-col gap-[14px]">
        <SectionHead title="Continue Where You Left Off" action="View all" />
        <ul className="flex flex-col gap-[8px]">
          {KEEP_GOING.map((k) => (
            <li key={k.title} className="flex items-center gap-[14px] rounded-[var(--radius-lg)] border px-[14px] py-[12px]" style={CARD}>
              <span className="flex size-[40px] flex-none items-center justify-center rounded-[12px]" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}><Gamepad2 className="h-[18px] w-[18px]" aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] leading-[18px] font-semibold">{k.title}</span>
                <span className="block text-[12px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{k.meta}</span>
              </span>
              <span className="hidden h-[6px] w-[120px] overflow-hidden rounded-full sm:block" style={{ background: "var(--glass-surface-2)" }}><span className="block h-full rounded-full" style={{ width: `${k.pct}%`, background: "var(--primary)" }} /></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** The phone tab bar, the same height as the real one (chrome.tsx
 *  MobileNav: 50px plus the safe area), so the dock's offset above it is
 *  the real offset. Below lg only. */
export function FakeTabBar() {
  const items = [
    { label: "Home", Icon: Home, on: true },
    { label: "Explore", Icon: Compass },
    { label: "Play", Icon: Play },
    { label: "Connect", Icon: Users },
    { label: "Profile", Icon: UserRound },
  ];
  return (
    <div aria-hidden className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(50px+env(safe-area-inset-bottom))] items-start justify-around border-t pt-[3px] md:h-[calc(58px+env(safe-area-inset-bottom))] md:pt-[7px] lg:hidden" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", borderColor: "var(--glass-border)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
      {items.map(({ label, Icon, on }) => (
        <span key={label} className="flex w-[64px] flex-col items-center gap-[3px] pt-[5px] text-[10px] font-semibold" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
          <Icon className="h-[20px] w-[20px]" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
