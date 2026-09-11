"use client";

import Image from "next/image";
import { Briefcase, FileText, GraduationCap, MessageSquare, Sparkles, Target, Users, Waypoints } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { MatchRing } from "@/components/app/MatchRing";
import { COLLEGES } from "@/components/colleges/data";
import { SchoolCard } from "@/components/colleges/shared";
import { PROS } from "@/components/connect/data";
import { Avatar, CompanyChip, VerifiedBadge } from "@/components/connect/primitives";
import { DECK } from "@/components/match-lab/data";
import { CardBody as MatchCardBody } from "@/components/match-lab/MatchLab";
import { PROFILE_CAREERS, STUDENT } from "@/components/profile/data";
import { studentAvatarSrc } from "@/lib/avatar";
import { CareerHeader, Frame, SHADOW } from "./SchoolsVisuals";

// ---------------------------------------------------------------------------
// Schools page, product-page pass (11 Sept 2026). Reference: Apple's product
// pages (Watch SE 3, iPhone 18 Pro): a centred hero with the product floating
// among feature bubbles, a "highlights" carousel of tall cards with arrows and
// dots, and big-number stat tiles. Same two rules as SchoolsVisuals: every
// piece is the product's own component with the product's own data, and
// nothing is a cropped screenshot.
// ---------------------------------------------------------------------------

const mu = (px: number) => `calc(var(--mu) * ${px}px)`;

/** Blue-to-violet gradient type, the page's one display flourish. */
export function Grad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={className} style={{ backgroundImage: "linear-gradient(92deg, var(--primary) 0%, #7d5cff 55%, #a855f7 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Device: a phone bezel around a dark product screen. Children render inert
// in the app's dark token scope at a --mu scale off the screen's width.
// ---------------------------------------------------------------------------

export function Phone({ label, className = "", style, children }: { label: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div role="img" aria-label={label} className={`relative aspect-[9/19] ${className}`} style={{ containerType: "inline-size", ...style }}>
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "clamp(26px, 13cqw, 54px)", background: "#0b0d18", boxShadow: `${SHADOW}, inset 0 0 0 1px rgba(255,255,255,0.16)`, padding: "3.4%" }}>
        <div className="marketing-v2 relative h-full w-full overflow-hidden" style={{ borderRadius: "clamp(20px, 10cqw, 42px)", background: "var(--background)", color: "var(--foreground)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the app's own backdrop */}
          <img alt="" src="/images/app/background-space.svg" className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover" style={{ opacity: 0.7 }} />
          <div aria-hidden inert className="absolute inset-0" style={{ ["--mu" as string]: "clamp(0.42, calc(100cqw / 340px), 1.1)" }}>
            {children}
          </div>
        </div>
        <span aria-hidden className="absolute top-[2.4%] left-1/2 h-[2.4%] w-[27%] -translate-x-1/2 rounded-full" style={{ background: "#0b0d18" }} />
      </div>
    </div>
  );
}

/** The Match deck on a phone: Find your Top 3, the live card, Pass / Like. */
function MatchOnPhone() {
  const career = DECK[0];
  const next = DECK[1];
  const gold = "var(--world-business-money-office)";
  return (
    <div className="absolute inset-0 flex flex-col items-center" style={{ padding: `${mu(52)} ${mu(20)} ${mu(24)}`, gap: mu(14) }}>
      <div className="flex w-full items-center justify-between">
        <p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: mu(15), color: "var(--foreground)" }}>Find your Top 3</p>
        <span className="flex" style={{ gap: mu(5) }}>
          {[true, false, false].map((filled, i) => (
            <span key={i} className="rounded-full border" style={{ width: mu(14), height: mu(14), borderColor: filled ? gold : "var(--border)", background: filled ? gold : "transparent" }} />
          ))}
        </span>
      </div>
      <div className="relative" style={{ zoom: "var(--mu)", width: 300, height: 424 }}>
        <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)] border" style={{ opacity: 0.55, transform: "translateY(-14px) scale(0.94)", borderColor: "var(--glass-border)", background: "var(--card)" }}>
          <Image src={next.photo} alt="" fill sizes="400px" className="object-cover" />
        </span>
        <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--glass-surface-2)", boxShadow: "0 24px 48px -20px rgba(0,0,0,0.75)", clipPath: "inset(0 round var(--radius-xl))" }}>
          <MatchCardBody career={career} isTop dragX={0} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature bubbles: small floating chips made of real product pieces.
// ---------------------------------------------------------------------------

function Bubble({ className = "", d = 0, amp = 10, children, style }: { className?: string; d?: number; amp?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`mkt-bob pointer-events-none absolute ${className}`} style={{ ["--d" as string]: `${d}s`, ["--amp" as string]: `${amp}px`, ["--dur" as string]: `${5.5 + (d % 2)}s`, ...style }}>
      <div className="flex items-center gap-2.5 rounded-full border bg-white py-2 pr-4 pl-2.5 text-[13.5px] font-bold whitespace-nowrap" style={{ borderColor: "rgba(5,7,15,0.08)", color: "var(--foreground)", boxShadow: "0 22px 44px -18px rgba(5,7,15,0.35), 0 2px 6px -2px rgba(5,7,15,0.12)" }}>
        {children}
      </div>
    </div>
  );
}

/** A dark glass card (the app's chrome) for the bigger floating pieces. */
function Glass({ className = "", d = 0, amp = 8, label, fill = false, children, style }: { className?: string; d?: number; amp?: number; label: string; /** children fill the card's own aspect box instead of setting its height */ fill?: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <div role="img" aria-label={label} className={`mkt-bob marketing-v2 absolute overflow-hidden rounded-[22px] border ${className}`} style={{ ["--d" as string]: `${d}s`, ["--amp" as string]: `${amp}px`, ["--dur" as string]: `${6 + (d % 2)}s`, borderColor: "rgba(255,255,255,0.12)", background: "var(--background)", color: "var(--foreground)", boxShadow: SHADOW, containerType: "inline-size", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the app's own backdrop */}
      <img alt="" src="/images/app/background-space.svg" className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover" style={{ opacity: 0.6 }} />
      <div aria-hidden inert className={fill ? "absolute inset-0" : "relative"}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The hero showcase: Career Detail on a tablet-sized screen, the Match deck on
// a phone in front of it, the student's profile card to the right, and five
// bubbles drifting around them.
// ---------------------------------------------------------------------------

export function HeroShowcase() {
  const focus = PROFILE_CAREERS[0];
  const pro = PROS.find((p) => p.org === "JPMorgan Chase") ?? PROS[0];
  const gold = "var(--world-business-money-office)";
  return (
    <div className="relative mx-auto w-full max-w-[1240px]" aria-label="Dreamari on a tablet and a phone, with the signals the app gives students" role="group">
      {/* the soft ground the objects float over */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[6%] top-[10%] bottom-[4%] rounded-[48px] blur-[40px]" style={{ background: "radial-gradient(60% 60% at 50% 45%, color-mix(in srgb, var(--primary) 18%, transparent), color-mix(in srgb, #a855f7 12%, transparent) 55%, transparent 80%)" }} />

      <div className="relative h-[clamp(560px,150vw,620px)] lg:h-[680px]">
        {/* tablet: Career Detail header, the page a student lands on */}
        <Glass label="Career Detail for Investment Banking: title, world, one-line summary, Play Game and Glossary Game, the scenario line, and the Typical degree and Typical pay facts" className="left-0 top-[9%] hidden w-[56%] lg:block" d={1.2} amp={6} fill style={{ aspectRatio: "16 / 10.4" }}>
          <div className="absolute inset-0" style={{ ["--mu" as string]: "clamp(0.5, calc(100cqw / 640px), 1.05)" }}>
            <CareerHeader />
          </div>
        </Glass>

        {/* phone: the Match deck */}
        <Phone label={`Match on a phone: Find your Top 3 with one slot filled, the card showing ${DECK[0].title}`} className="mkt-bob absolute left-1/2 top-0 w-[min(58vw,300px)] -translate-x-1/2 lg:left-[46%] lg:top-[2%] lg:w-[300px] lg:translate-x-0" style={{ ["--d" as string]: "0s", ["--amp" as string]: "12px", ["--dur" as string]: "6.5s" }}>
          <MatchOnPhone />
        </Phone>

        {/* profile card: the student, the match ring and Top 3 progress */}
        <Glass label={`${STUDENT.name}'s profile: ${focus.match}% match with ${focus.title}, 2 of 3 Top 3 chosen`} className="right-0 top-[30%] hidden w-[27%] lg:block" d={2.4} amp={9}>
          <div className="flex flex-col gap-[14px] p-[18px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-[10px]">
                <Image src={studentAvatarSrc(STUDENT.name.split(" ")[0])} alt="" width={88} height={88} className="size-[44px] flex-none rounded-full border-2 object-cover" style={{ borderColor: "rgba(255,255,255,0.9)" }} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[16px] leading-[20px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>{STUDENT.name}</span>
                  <span className="truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{STUDENT.grade} · #1 {focus.title}</span>
                </span>
              </div>
              <MatchRing score={focus.match} size={44} />
            </div>
            <div className="grid grid-cols-3 gap-[8px]">
              {[["My Top 3", "2 of 3"], ["My Plan", "3 of 9"], ["Report", "Ready"]].map(([k, v]) => (
                <span key={k} className="flex flex-col rounded-[12px] border px-[10px] py-[9px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="text-[10.5px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{k}</span>
                  <span className="text-[13px] leading-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: k === "Report" ? gold : "var(--foreground)" }}>{v}</span>
                </span>
              ))}
            </div>
          </div>
        </Glass>

        {/* bubbles */}
        <Bubble className="left-[2%] top-[3%] lg:left-[30%] lg:top-[-2%]" d={0.6} amp={9}>
          <span className="flex size-7 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, white)", color: "var(--primary)" }}><Sparkles className="h-4 w-4" strokeWidth={2.5} aria-hidden /></span>
          +100 XP
        </Bubble>
        <Bubble className="right-[0] top-[17%] lg:right-[-1%] lg:top-[12%]" d={1.8} amp={11}>
          <MatchRing score={focus.match} size={30} />
          {focus.match}% match
        </Bubble>
        <Bubble className="left-[0] bottom-[33%] lg:left-[38%] lg:bottom-[8%]" d={2.6} amp={8}>
          <span className="flex items-center gap-[4px] pl-1">
            {[true, true, false].map((f, i) => <span key={i} className="size-[10px] rounded-full border-2" style={{ borderColor: gold, background: f ? gold : "transparent" }} />)}
          </span>
          Top 3 saved
        </Bubble>
        <Bubble className="left-1/2 bottom-0 -translate-x-1/2 lg:left-auto lg:right-[4%] lg:bottom-[10%] lg:translate-x-0" d={3.4} amp={10}>
          <span className="marketing-v2 flex items-center gap-2 rounded-full bg-transparent"><Avatar name={pro.name} size={28} /></span>
          <span className="flex flex-col leading-none">
            <span className="flex items-center gap-1 text-[13px]">{pro.name.split(" ")[0]} <VerifiedBadge size={13} /></span>
            <span className="mt-[3px] text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{pro.role}</span>
          </span>
          <span className="marketing-v2 ml-1"><CompanyChip name={pro.org} tone="surface" size="sm" /></span>
        </Bubble>
        <Bubble className="right-[0] bottom-[20%] lg:right-auto lg:left-[12%] lg:bottom-[-3%]" d={4.2} amp={9}>
          <span className="flex size-7 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, #a855f7 14%, white)", color: "#7d5cff" }}><FileText className="h-4 w-4" strokeWidth={2.5} aria-hidden /></span>
          Career Report ready
        </Bubble>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skills ticker under the hero: the reference site's seven chips, looping.
// ---------------------------------------------------------------------------

const SKILLS: { label: string; Icon: typeof Sparkles }[] = [
  { label: "Personalized discovery", Icon: Sparkles },
  { label: "College & career pathways", Icon: GraduationCap },
  { label: "Day-in-the-life simulations", Icon: Briefcase },
  { label: "Critical thinking", Icon: Target },
  { label: "Decision-making", Icon: Waypoints },
  { label: "Communication & teamwork", Icon: MessageSquare },
  { label: "Professional connections", Icon: Users },
];

export function SkillsTicker() {
  const row = [...SKILLS, ...SKILLS];
  return (
    <div className="relative overflow-hidden border-y py-4" style={{ borderColor: "var(--border)", maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }} aria-label="What students build">
      <ul className="mkt-marquee flex w-max items-center gap-10 pr-10">
        {row.map(({ label, Icon }, i) => (
          <li key={`${label}-${i}`} aria-hidden={i >= SKILLS.length} className="flex flex-none items-center gap-2.5 text-[15px] font-semibold whitespace-nowrap" style={{ color: "var(--foreground)" }}>
            <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden style={{ color: "var(--primary)" }} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audiences preview: the Explore Schools rail with three real school cards
// (photo, mark, program chip, acceptance / price / distance), running off the
// frame's right edge the way the rail does in the app.
// ---------------------------------------------------------------------------

const PREVIEW_SCHOOLS = ["the-college-of-new-jersey", "rutgers-university-new-brunswick", "new-jersey-institute-of-technology"];
const PREVIEW_PROGRAM: Record<string, string> = { "the-college-of-new-jersey": "Business Administration", "rutgers-university-new-brunswick": "Finance", "new-jersey-institute-of-technology": "Business Administration" };

export function SchoolsPreview() {
  const schools = PREVIEW_SCHOOLS.map((slug) => COLLEGES.find((c) => c.slug === slug)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  return (
    <Frame className="aspect-[4/5] w-full sm:aspect-[5/4]">
      <div aria-hidden inert className="absolute inset-y-0 left-[7%] right-[-34%] flex flex-col justify-center gap-[18px]" style={{ containerType: "inline-size" }}>
        <div className="flex items-baseline gap-2">
          <p className="text-[22px] leading-[26px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            <span style={{ color: "var(--muted-foreground)" }}>Schools for </span>Investment Banking
          </p>
        </div>
        <p className="-mt-[10px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Target <span style={{ color: "var(--muted-foreground)" }}>(4)</span></p>
        <ul className="flex gap-[16px]">
          {schools.map((c) => (
            <li key={c.slug} className="w-[300px] flex-none">
              <SchoolCard c={c} saved={false} onSave={() => {}} compared={false} program={PREVIEW_PROGRAM[c.slug]} />
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}
