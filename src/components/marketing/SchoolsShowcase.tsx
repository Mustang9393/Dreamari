"use client";

import Image from "next/image";
import { Briefcase, GraduationCap, MessageSquare, Sparkles, Target, Users, Waypoints } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { MatchRing } from "@/components/app/MatchRing";
import { PROS } from "@/components/connect/data";
import { Avatar, CompanyChip, VerifiedBadge } from "@/components/connect/primitives";
import { DECK } from "@/components/match-lab/data";
import { CardBody as MatchCardBody } from "@/components/match-lab/MatchLab";
import { PROFILE_CAREERS, STUDENT } from "@/components/profile/data";
import { OverviewTab } from "@/components/profile/ProfileExperience";
import { studentAvatarSrc } from "@/lib/avatar";
import { Frame, SHADOW } from "./SchoolsVisuals";

// ---------------------------------------------------------------------------
// Schools page showcase pieces (11 Sept 2026). Light mode on the light page,
// rounded and contained, few elements: one phone and three bubbles in the
// hero, one light frame per section. Every piece is the product's own
// component with the product's own data; nothing is a cropped screenshot.
// ---------------------------------------------------------------------------

const mu = (px: number) => `calc(var(--mu) * ${px}px)`;
const noop = () => {};

/** Blue-to-violet gradient type, the page's one display flourish. */
export function Grad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={className} style={{ backgroundImage: "linear-gradient(92deg, var(--primary) 0%, #7d5cff 55%, #a855f7 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Device: a light phone bezel around a light product screen. Children render
// inert in the app's light token scope at a --mu scale off the screen width.
// ---------------------------------------------------------------------------

export function Phone({ label, className = "", style, children }: { label: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div role="img" aria-label={label} className={`relative aspect-[9/19] ${className}`} style={{ containerType: "inline-size", ...style }}>
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "clamp(26px, 13cqw, 54px)", background: "linear-gradient(160deg, #f7f8fc, #dfe3ee)", boxShadow: `${SHADOW}, inset 0 0 0 1px rgba(5,7,15,0.14)`, padding: "3.4%" }}>
        <div className="marketing-v2 theme-light relative h-full w-full overflow-hidden" style={{ borderRadius: "clamp(20px, 10cqw, 42px)", background: "var(--background)", color: "var(--foreground)" }}>
          <div aria-hidden inert className="absolute inset-0" style={{ ["--mu" as string]: "clamp(0.42, calc(100cqw / 340px), 1.1)" }}>
            {children}
          </div>
        </div>
        <span aria-hidden className="absolute top-[2.4%] left-1/2 h-[2.4%] w-[27%] -translate-x-1/2 rounded-full" style={{ background: "#0b0d18" }} />
      </div>
    </div>
  );
}

/** The Match deck on the phone: Find your Top 3, the live card, the next card behind. */
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
        <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--glass-border)", boxShadow: "0 24px 48px -20px rgba(5,7,15,0.35)", clipPath: "inset(0 round var(--radius-xl))" }}>
          <MatchCardBody career={career} isTop dragX={0} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature bubbles: small floating pills made of real product pieces.
// ---------------------------------------------------------------------------

function Bubble({ className = "", d = 0, amp = 10, children }: { className?: string; d?: number; amp?: number; children: ReactNode }) {
  return (
    <div className={`mkt-bob pointer-events-none absolute ${className}`} style={{ ["--d" as string]: `${d}s`, ["--amp" as string]: `${amp}px`, ["--dur" as string]: `${5.5 + (d % 2)}s` }}>
      <div className="flex items-center gap-2.5 rounded-full border bg-white py-2 pr-4 pl-2.5 text-[13.5px] font-bold whitespace-nowrap" style={{ borderColor: "rgba(5,7,15,0.08)", color: "var(--foreground)", boxShadow: "0 22px 44px -18px rgba(5,7,15,0.3), 0 2px 6px -2px rgba(5,7,15,0.1)" }}>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The hero showcase: the Match deck on a phone, three signals around it.
// ---------------------------------------------------------------------------

export function HeroShowcase() {
  const focus = PROFILE_CAREERS[0];
  const pro = PROS.find((p) => p.org === "JPMorgan Chase") ?? PROS[0];
  const gold = "var(--world-business-money-office)";
  return (
    <div className="relative mx-auto w-full max-w-[880px]" role="group" aria-label="Dreamari on a phone, with the signals the app gives students">
      <div aria-hidden className="pointer-events-none absolute inset-x-[10%] top-[8%] bottom-[6%] rounded-[48px] blur-[40px]" style={{ background: "radial-gradient(60% 60% at 50% 45%, color-mix(in srgb, var(--primary) 14%, transparent), color-mix(in srgb, #a855f7 10%, transparent) 55%, transparent 80%)" }} />
      <div className="relative h-[clamp(560px,150vw,640px)] sm:h-[660px]">
        <Phone
          label={`Match on a phone: Find your Top 3 with one slot filled, the card showing ${DECK[0].title}`}
          className="mkt-bob absolute left-1/2 top-0 w-[min(58vw,300px)] -translate-x-1/2"
          style={{ ["--d" as string]: "0s", ["--amp" as string]: "12px", ["--dur" as string]: "6.5s" }}
        >
          <MatchOnPhone />
        </Phone>
        <Bubble className="right-[0] top-[16%] sm:right-[8%] sm:top-[18%]" d={1.8} amp={11}>
          <MatchRing score={focus.match} size={30} />
          {focus.match}% match
        </Bubble>
        <Bubble className="left-[0] bottom-[34%] sm:left-[8%] sm:bottom-[40%]" d={2.6} amp={8}>
          <span className="flex items-center gap-[4px] pl-1">
            {[true, true, false].map((f, i) => <span key={i} className="size-[10px] rounded-full border-2" style={{ borderColor: gold, background: f ? gold : "transparent" }} />)}
          </span>
          Top 3 saved
        </Bubble>
        <Bubble className="left-1/2 bottom-0 -translate-x-1/2 sm:left-auto sm:right-[4%] sm:bottom-[14%] sm:translate-x-0" d={3.4} amp={10}>
          <span className="marketing-v2 flex items-center rounded-full"><Avatar name={pro.name} size={28} /></span>
          <span className="flex flex-col leading-none">
            <span className="flex items-center gap-1 text-[13px]">{pro.name.split(" ")[0]} <VerifiedBadge size={13} /></span>
            <span className="mt-[3px] text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{pro.role}</span>
          </span>
          <span className="marketing-v2 ml-1"><CompanyChip name={pro.org} tone="surface" size="sm" /></span>
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
// Audiences preview: the student's Profile overview in light mode (Top 3,
// Plan, Career Report, Do this next), the path forward in one frame.
// ---------------------------------------------------------------------------

export function PathPreview() {
  const focus = PROFILE_CAREERS[0];
  const tasks = focus.plan.flatMap((horizon) => horizon.tasks);
  const complete = tasks.filter((task) => task.doneByDefault).length;
  const planProgress = () => ({ complete, total: tasks.length, pct: Math.round((complete / Math.max(tasks.length, 1)) * 100) });
  return (
    <Frame className="w-full" style={{ background: "var(--background)" }}>
      <div
        role="img"
        aria-label={`${STUDENT.name}'s Profile overview: ${focus.match}% match with ${focus.title}, My Top Three 2 of 3 chosen, My Plan ${complete} of ${tasks.length} steps, Career Report, and Do this next`}
        className="relative"
        style={{ containerType: "inline-size" }}
      >
        <div aria-hidden inert className="relative p-5 sm:p-7" style={{ ["--mu" as string]: "clamp(0.6, calc(100cqw / 560px), 1)" }}>
          <div className="flex flex-col gap-[var(--space-4)]" style={{ zoom: "var(--mu)" }}>
            <div className="flex items-center justify-between gap-[var(--space-3)]">
              <div className="flex items-center gap-[12px]">
                <Image src={studentAvatarSrc(STUDENT.name.split(" ")[0])} alt="" width={96} height={96} className="size-[48px] rounded-full object-cover" />
                <span className="flex flex-col">
                  <span className="text-[20px] leading-[24px] font-extrabold tracking-[-0.02em]" style={{ fontFamily: "var(--font-display)" }}>{STUDENT.name}</span>
                  <span className="text-[13px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{STUDENT.school} · {STUDENT.grade} · #1 {focus.title}</span>
                </span>
              </div>
              <MatchRing score={focus.match} size={44} />
            </div>
            <OverviewTab focus={focus} planProgress={planProgress} top3Count={2} onGoTop3={noop} onGoPlan={noop} onGoReport={noop} onGoLocker={noop} />
          </div>
        </div>
      </div>
    </Frame>
  );
}
