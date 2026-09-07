"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { BadgeCheck, BookOpen, Bookmark, Gamepad2, Heart, MessagesSquare, Plus, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { BROWSE_BECAUSE_LIKED, BROWSE_TRENDING } from "@/components/app/catalog";
import { MatchRing } from "@/components/app/MatchRing";
import { PosterCard, RankedPosterCard } from "@/components/app/PosterCard";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { INTEREST_WORLDS } from "@/components/build/types";
import { CardHud, ChipGrid, Citation, QuestionHeading } from "@/components/build/ui";
import { Figure, Section } from "@/components/career/CareerDetailExperience";
import { CAREER_EXTRAS } from "@/components/career/data";
import { PayMap } from "@/components/career/PayMap";
import { careerProfile } from "@/components/career/profiles";
import { CommunityCard } from "@/components/connect/CommunityCard";
import { COMMUNITIES, PROS, THREADS } from "@/components/connect/data";
import { Avatar, Card, CompanyChip } from "@/components/connect/primitives";
import { DECK } from "@/components/match-lab/data";
import { CardBody as MatchCardBody } from "@/components/match-lab/MatchLab";
import { IB_LEVEL_1 } from "@/components/play/ib-level-1";
import { OptionButton, Question } from "@/components/play/interactions";
import { PROFILE_CAREERS, STUDENT } from "@/components/profile/data";
import { OverviewTab } from "@/components/profile/ProfileExperience";
import { DOMark } from "./DreamOpportunity";

// ---------------------------------------------------------------------------
// Composed product visuals for the Schools view.
//
// The pieces are the product's own components with the product's own data
// (PosterCard, the Match card body, the Build ChipGrid, the Play OptionButton,
// the Connect CommunityCard, the Profile OverviewTab, the career page's
// Figure / Section / PayMap), rendered inert at their own real size -- not
// scaled to fill an invented "device screen." The only recreations left are
// the Career Detail header (its real component is a routed page) and the
// small chrome around real pieces (Match slots, Explore filter pills, the
// Play HUD).
//
// Direct feedback, 7 Sept 2026: drop the dark device-frame bezel entirely,
// and no photo backdrop either (that's `HeroVisual` / `ProgressArt`'s job,
// where a real Dream Opportunity photo is the point) -- a plain real card
// floats on the light page with its own shadow, nothing pretending to be a
// phone or tablet screen around it. `Frame` used to paint that bezel
// (a dark rounded box with a cosmic backdrop image, `SHADOW`, a border) and
// `Product` painted a second one nested just inside it; both are now plain
// positioning shells, and each composition below supplies its own single,
// real card surface where the content needs a dark background to read (the
// real components are dark-theme, `marketing-v2` re-enters that token scope
// per component the same way a dark-mode screen sits on a white product
// page) -- sized to its own content, not stretched to fill a tall column.
// The one carried-over exception is Explore's rail: it is meant to bleed off
// the card's edge the way a real horizontal rail does, so that one card
// still clips.
// ---------------------------------------------------------------------------

// Still used by CareerHeader and ProgressArt, the two photo-backed
// compositions that keep the `Product` scaling pattern on purpose.
const mu = (px: number) => `calc(var(--mu) * ${px}px)`;

// One shadow system for the page: a long soft drop and a tight contact edge.
export const SHADOW = "0 44px 90px -40px rgba(5,7,15,0.5), 0 2px 6px -2px rgba(5,7,15,0.2)";
const noop = () => {};

// The single real-card surface every de-framed composition below uses: dark
// token scope, the page's shadow, sized to its own content.
const CARD_SURFACE: CSSProperties = { background: "var(--background)", color: "var(--foreground)", boxShadow: SHADOW };

// Photography (public/images/marketing/ATTRIBUTION.md): Unsplash License,
// colour-graded only by the scrims below.
export const PHOTOS = {
  hero: "/images/marketing/students-laptop.webp",
  educators: "/images/marketing/counselor-guidance.webp",
  organization: "/images/marketing/students-audience.webp",
} as const;

// ---------------------------------------------------------------------------
// Frame, Product
// ---------------------------------------------------------------------------

/** A plain positioning shell -- no background, no shadow, no bezel. Used only
 *  to give the StageStory sticky column and its mobile counterpart a sized
 *  box to center a real card in; it paints nothing of its own. (Used to be
 *  a dark rounded "device screen" -- SpaceGround backdrop, `SHADOW`, a
 *  border -- direct feedback, 7 Sept 2026: drop the frame entirely, no
 *  photo backdrop standing in for it either.) */
export function Frame({ className = "", style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={`relative isolate ${className}`} style={style}>
      {children}
    </div>
  );
}

/** A dark product surface. Absolutely positioned by the caller (so it can run
 *  off the frame), a container for `--mu`, inert unless `live`. `flow` lets
 *  the content set the height instead of filling a given box.
 *
 *  `bare` drops the surface's own border/shadow/rounded corner and background
 *  -- use it whenever this Product already sits inside a `Frame`, which draws
 *  that exact chrome one level out. Without `bare`, a Product inside a Frame
 *  painted a second bordered, shadowed, rounded dark box just inside the
 *  first (direct feedback, 7 Sept 2026: "frame inside frame inside frame").
 *  `ProgressArt` and `HeroVisual` are the one legitimate case for the default
 *  (non-bare) chrome: there the Product floats over a plain photo with no
 *  enclosing Frame, so it needs to draw its own device-screen edge. */
function Product({ label, base = 420, floor = 0.55, ceiling = 1.15, live = false, flow = false, bare = false, className = "", style, children }: { label: string; base?: number; floor?: number; ceiling?: number; live?: boolean; flow?: boolean; bare?: boolean; className?: string; style?: CSSProperties; children: ReactNode }) {
  const scale = { ["--mu" as string]: `clamp(${floor}, calc(100cqw / ${base}px), ${ceiling})` };
  return (
    <div
      role={live ? "group" : "img"}
      aria-label={label}
      className={`marketing-v2 absolute overflow-hidden ${bare ? "" : "rounded-[22px] border"} ${className}`}
      style={{ containerType: "inline-size", color: "var(--foreground)", ...(bare ? {} : { borderColor: "rgba(255,255,255,0.1)", background: "var(--background)", boxShadow: SHADOW }), ...style }}
    >
      {live ? (
        <div className={flow ? "relative" : "absolute inset-0 flex flex-col"} style={scale}>{children}</div>
      ) : (
        <div aria-hidden inert className={flow ? "relative" : "absolute inset-0 flex flex-col"} style={scale}>{children}</div>
      )}
    </div>
  );
}

// The app's space backdrop, the ground every real screen sits on.
function SpaceGround({ opacity = 0.7 }: { opacity?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- decorative backdrop, the same element the app screens use
  return <img alt="" src="/images/app/background-space.svg" className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover" style={{ opacity }} />;
}

const EYEBROW: CSSProperties = { fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" };

// ---------------------------------------------------------------------------
// Hero: students at a laptop, with the Career Detail header hanging off the
// photo's lower-left corner.
// ---------------------------------------------------------------------------

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[680px] pb-[56px] lg:pb-[124px]">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[28px] lg:aspect-[4/3]" style={{ boxShadow: SHADOW }}>
        <Image src={PHOTOS.hero} alt="" fill priority sizes="(max-width: 1024px) 100vw, 680px" className="object-cover" style={{ objectPosition: "56% 38%" }} />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,7,15,0.5) 0%, rgba(5,7,15,0.1) 42%, transparent 66%), linear-gradient(to bottom, rgba(5,7,15,0.18) 0%, transparent 30%)" }} />
        {/* the corporate network, the thing no quiz has: three real marks */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full py-1.5 pr-2 pl-3.5 sm:top-5 sm:left-5" style={{ background: "rgba(12,16,35,0.58)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" }}>
          <span className="text-[11px] leading-none font-bold tracking-[0.08em] whitespace-nowrap text-white uppercase">Professionals from</span>
          <span className="flex items-center gap-1.5">
            <CompanyChip name="JPMorgan Chase" tone="frost" size="sm" />
            <CompanyChip name="Goldman Sachs" tone="frost" size="sm" />
            <CompanyChip name="EY" tone="frost" size="sm" />
          </span>
        </div>
      </div>
      <Product
        label="Career Detail for Investment Banking: title, world, one-line summary, Play Game and Glossary Game buttons, the scenario line, and the Typical degree and Typical pay facts"
        base={640}
        floor={0.5}
        ceiling={1.05}
        className="bottom-0 left-[-3%] w-[92%] lg:left-[-9%] lg:w-[94%]"
        style={{ aspectRatio: "16 / 10" }}
      >
        <CareerHeader />
      </Product>
    </div>
  );
}

// The Career Detail header for Investment Banking with the page's own data
// (profiles.ts). The real header lives inside a routed page, so this is the
// one faithful recreation on the page: the poster photo on the right fading
// into the card, CardProgressiveBlur and the header's own scrims, the title in
// the world's poster face, the actions, the scenario line and two quick facts.
function CareerHeader() {
  const profile = careerProfile("investment-banking");
  const accent = WORLD_COLORS["Business & Money"];
  const facts = (profile?.facts ?? []).slice(0, 2);
  return (
    <div className="flex h-full flex-col" style={{ padding: mu(18), gap: mu(10) }}>
      <SpaceGround opacity={0.55} />
      <div className="relative flex-1 overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "#0e0c20", textShadow: CARD_TEXT_SHADOW, clipPath: "inset(0 round var(--radius-lg))" }}>
        <span className="absolute inset-y-0 right-0 w-[52%] overflow-hidden rounded-[inherit]">
          <Image src={profile?.photo ?? "/images/app/poster-investment-banking-v3.png"} alt="" fill sizes="520px" className="object-cover" style={{ objectPosition: "50% 12%" }} priority />
          <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0e0c20 0%, rgba(14,12,32,0.45) 26%, transparent 58%)" }} />
        </span>
        <span className="absolute inset-0 overflow-hidden rounded-[inherit]"><CardProgressiveBlur size="52%" /></span>
        <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.86) 0%, rgba(12,16,35,0.5) 32%, rgba(12,16,35,0.1) 60%, transparent 100%), linear-gradient(to bottom, rgba(10,9,20,0.35) 0%, rgba(10,9,20,0.1) 40%, transparent 65%)" }} />
        <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{ padding: mu(22), gap: mu(7), color: "#fff" }}>
          <p className="uppercase whitespace-nowrap" style={{ ...posterTitleFont("Business & Money"), fontSize: mu(34), lineHeight: 1 }}>{profile?.title ?? "Investment Banking"}</p>
          <p style={{ ...EYEBROW, fontSize: mu(8.5), letterSpacing: "0.6px", color: `color-mix(in srgb, ${accent} 70%, #ffffff)` }}>Business &amp; Money</p>
          <p className="font-semibold" style={{ fontSize: mu(11.5), lineHeight: 1.35, maxWidth: "min(64%, 40ch)" }}>{profile?.summary}</p>
          <div className="flex flex-nowrap items-center" style={{ gap: mu(8), marginTop: mu(4), textShadow: "none" }}>
            <span className="flex items-center rounded-[var(--radius-md)] font-semibold" style={{ gap: mu(6), height: mu(30), padding: `0 ${mu(14)}`, fontSize: mu(10.5), background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Gamepad2 style={{ width: mu(11), height: mu(11) }} aria-hidden /> Play Game
            </span>
            <span className="flex items-center rounded-[var(--radius-md)] border font-semibold" style={{ gap: mu(6), height: mu(30), padding: `0 ${mu(14)}`, fontSize: mu(10.5), borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.55)", color: "#fff" }}>
              <BookOpen style={{ width: mu(11), height: mu(11) }} aria-hidden /> Glossary Game
            </span>
            {[Plus, Heart, ThumbsDown, Bookmark].map((Icon, i) => (
              <span key={i} className="flex items-center justify-center rounded-full border" style={{ width: mu(30), height: mu(30), borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.55)", color: "#fff" }}>
                <Icon style={{ width: mu(13), height: mu(13) }} aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="relative" style={{ fontSize: mu(10), lineHeight: 1.45, color: "var(--muted-foreground)", maxWidth: "70ch" }}>{profile?.scenario}</p>
      <div className="relative grid flex-none grid-cols-2 rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
        {facts.map((fact, i) => (
          <div key={fact.label} className={`flex flex-col ${i === 1 ? "border-l" : ""}`} style={{ gap: mu(3), padding: `${mu(11)} ${mu(14)}`, borderColor: "var(--glass-border)" }}>
            <span className="font-semibold" style={{ fontSize: mu(10.5), color: "var(--foreground)" }}>{fact.label}</span>
            <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: mu(12), backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{fact.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The five stages. Each renders one plain, naturally-sized real card,
// centered by its caller (StageStory's crossfade slot, or the mobile column).
// No frame, no photo, no scaling -- the real component at its own real size.
// ---------------------------------------------------------------------------

const WORLD_ACCENTS: Record<string, string> = Object.fromEntries(INTEREST_WORLDS.map((world) => [world.label, `var(--color-world-${world.slug})`]));

// Build: the real first question. CardHud, QuestionHeading with Dreamy
// asking, the ChipGrid, the citation -- a minimized six-option preview, not
// the full fifteen-world grid: the same "6 visible, more below" convention
// the app's own ChipGrid already uses for phones (build/ui.tsx, PREVIEW=6),
// applied here so the card reads as a glimpse, not a list rendered in full
// (direct feedback, 7 Sept 2026: "such a tall graphic", "everything visible
// at once"). Both of the two "selected" worlds stay in the six shown.
const BUILD_PREVIEW_WORLDS = ["Business & Money", "Tech & Engineering", "Health & Medicine", "Arts, Media & Sport", "Science & Research", "Law, Safety & Justice"];

export function BuildArt() {
  return (
    <div className="marketing-v2 w-full max-w-[360px] rounded-[var(--radius-xl)] p-[22px]" style={CARD_SURFACE} role="img" aria-label="Build, the first question: What sounds interesting? Choose up to 2. Business and Money and Tech and Engineering are chosen, from the fifteen career worlds. Harvard FAS Mignone and O*NET Interest Profiler.">
      <div aria-hidden inert>
        <CardHud percent={13} />
        <QuestionHeading title="What sounds interesting?" subtitle="Choose up to 2" sprite="/images/dreamy/v2/dreamy-curious.png" />
        <ChipGrid options={BUILD_PREVIEW_WORLDS} selected={["Business & Money", "Tech & Engineering"]} max={2} onChange={noop} accents={WORLD_ACCENTS} columns="grid-cols-2" />
        <Citation>Harvard FAS Mignone + O*NET Interest Profiler</Citation>
      </div>
    </div>
  );
}

// Match: the real swipe card (MatchLab's CardBody, poster face up) with the
// Top 3 slots above and Pass / Like below; the next card peeks behind it, at
// the app's own real pixel sizes (no scaling -- this card renders at roughly
// the width it does in the app itself).
export function MatchArt() {
  const career = DECK[0];
  const next = DECK[1];
  const gold = WORLD_COLORS["Business & Money"];
  return (
    <div
      className="marketing-v2 flex w-full max-w-[300px] flex-col items-center rounded-[var(--radius-xl)]"
      style={{ ...CARD_SURFACE, padding: "16px 18px 18px", gap: 14 }}
      role="img"
      aria-label={`Match: Find your Top 3, one slot filled. The card shows ${career.title}, ${career.salary}, employers ${career.employers}, with Pass and Like buttons.`}
    >
      <div aria-hidden inert className="flex w-full flex-col items-center" style={{ gap: 14 }}>
        <div className="flex w-full items-center justify-between">
          <p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--foreground)" }}>Find your Top 3</p>
          <span className="flex" style={{ gap: 5 }}>
            {[true, false, false].map((filled, i) => (
              <span key={i} className="rounded-full border" style={{ width: 14, height: 14, borderColor: filled ? gold : "var(--border)", background: filled ? gold : "transparent" }} />
            ))}
          </span>
        </div>
        <div className="relative" style={{ width: 264, height: 374 }}>
          <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)] border" style={{ opacity: 0.55, transform: "translateY(-12px) scale(0.94)", borderColor: "var(--glass-border)", background: "var(--card)" }}>
            <Image src={next.photo} alt="" fill sizes="300px" className="object-cover" />
          </span>
          <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--glass-surface-2)", boxShadow: "0 24px 48px -20px rgba(0,0,0,0.75)", clipPath: "inset(0 round var(--radius-xl))" }}>
            <MatchCardBody career={career} isTop dragX={0} />
          </div>
        </div>
        <div className="flex flex-none items-center justify-center" style={{ gap: 18 }}>
          <span className="flex items-center justify-center rounded-full border" style={{ width: 44, height: 44, background: "var(--glass-surface-2)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            <X style={{ width: 18, height: 18 }} aria-hidden />
          </span>
          <span className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: gold, color: "#05070f", boxShadow: `0 10px 26px -10px ${gold}` }}>
            <ThumbsUp style={{ width: 18, height: 18 }} aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}

// Explore: the Browse page's first rail with the real PosterCards, running
// off the card's own right edge the way a rail does -- the one composition
// that keeps a crop, because bleeding off the edge is the rail's real
// behaviour, not decoration standing in for a missing frame.
export function ExploreArt() {
  const pills = ["All", "Business & Money", "Tech & Engineering", "Health & Medicine"];
  return (
    <div
      className="marketing-v2 w-full max-w-[460px] overflow-hidden rounded-[var(--radius-xl)] py-[22px] pl-[22px]"
      style={CARD_SURFACE}
      role="img"
      aria-label={`Explore: the rail 'Recommended Because You Liked Business and Money' with poster cards for ${BROWSE_BECAUSE_LIKED.slice(0, 4).map((c) => c.title).join(", ")} and more.`}
    >
      <div aria-hidden inert className="flex flex-col gap-[var(--space-5)]">
        <div className="flex gap-[8px] pr-[22px]">
          {pills.map((label, i) => (
            <span key={label} className="flex-none rounded-[100px] border px-[14px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-body)", background: i === 1 ? "var(--primary)" : "var(--glass-surface-1)", borderColor: i === 1 ? "var(--primary)" : "var(--glass-border)", color: i === 1 ? "var(--primary-foreground)" : "var(--foreground)" }}>
              {label}
            </span>
          ))}
        </div>
        <h2 className="text-[22px] leading-[28px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Recommended Because You Liked Business &amp; Money
        </h2>
        <div className="flex gap-[var(--space-6)] pt-1">
          {BROWSE_BECAUSE_LIKED.slice(0, 5).map((career) => (
            <PosterCard key={career.title} career={career} />
          ))}
        </div>
        {/* the Browse page's second rail, as it ships: ranked, with the numeral behind each card */}
        <h2 className="pt-[var(--space-3)] text-[20px] leading-[26px] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
          Top 5 Trending Careers Among Gen Z
        </h2>
        <div className="flex gap-[24px]">
          {BROWSE_TRENDING.slice(0, 4).map((career, i) => (
            <RankedPosterCard key={career.title} career={career} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Immerse: the Investment Banking simulation's first scored beat, full bleed.
// Cobalt Capital's reception (the beat's own location), the HUD, and the
// question sheet with the real OptionButtons, the best answer confirmed.
export function ImmerseArt() {
  const level = IB_LEVEL_1;
  const beat = level.beats.find((b) => b.id === "L1-08");
  const choice = beat?.kind === "choice" ? beat : null;
  const gold = "var(--world-business-money-office)";
  return (
    <div role="img" aria-label={`Investment Banker simulation, Level 1 Intern. ${choice?.question ?? "Day 1: What should you do first?"} ${choice?.choices.map((c) => c.label).join(", ") ?? ""}. Complete systems training is confirmed as the right answer.`} className="marketing-v2 absolute inset-0" style={{ background: "var(--background)", color: "var(--foreground)", containerType: "inline-size" }}>
      <Image src="/images/play/ib/locations/reception.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 1000px" className="object-cover" style={{ objectPosition: "50% 30%" }} />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,7,15,0.92) 0%, rgba(5,7,15,0.62) 34%, rgba(5,7,15,0.1) 62%, transparent 100%), linear-gradient(to bottom, rgba(5,7,15,0.45) 0%, transparent 32%)" }} />
      <div aria-hidden inert className="absolute inset-0 flex flex-col justify-between" style={{ ["--mu" as string]: "clamp(0.62, calc(100cqw / 480px), 1.1)" }}>
        <div className="flex items-start justify-between" style={{ padding: mu(18) }}>
          <span className="flex flex-col rounded-[var(--radius-md)] border" style={{ padding: `${mu(8)} ${mu(12)}`, gap: mu(2), background: "rgba(5,7,15,0.55)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <span className="font-extrabold uppercase" style={{ fontFamily: "var(--font-display)", fontSize: mu(12), color: "#fff" }}>Investment Banker</span>
            <span className="font-bold tracking-[0.1em] uppercase" style={{ fontSize: mu(10), color: gold }}>Level {level.n} · {level.role}</span>
          </span>
          <span className="flex items-center rounded-full border" style={{ gap: mu(8), padding: `${mu(6)} ${mu(10)} ${mu(6)} ${mu(6)}`, background: "rgba(5,7,15,0.55)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <span className="relative flex-none overflow-hidden rounded-full" style={{ width: mu(26), height: mu(26) }}>
              <Image src={level.cast?.Christina ?? "/images/play/ib/face-christina.webp"} alt="" fill sizes="52px" className="object-cover" />
            </span>
            <span className="font-bold uppercase" style={{ fontSize: mu(9.5), letterSpacing: "0.08em", color: "rgba(255,255,255,0.85)" }}>Christina · Associate</span>
          </span>
        </div>
        <div style={{ padding: `0 ${mu(14)} ${mu(14)}` }}>
          <div className="rounded-[var(--radius-xl)] border" style={{ padding: mu(16), background: "rgba(8,10,22,0.8)", borderColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <div className="flex flex-col gap-[12px]" style={{ zoom: "var(--mu)" }}>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: gold }}>Intern · Week 1</p>
              <Question>{choice?.question ?? "Day 1: What should you do first?"}</Question>
              <div className="flex flex-col gap-[8px]">
                {(choice?.choices ?? []).map((c, index) => (
                  <OptionButton key={c.id} label={c.label} index={index} compact picked={c.tier === "best"} tier={c.tier} onClick={noop} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Connect: the real Finance Careers community card, and a question from its
// board answered by a verified JPMorgan Chase analyst. Two cards, layered.
export function ConnectArt() {
  const community = COMMUNITIES.find((c) => c.id === "business-money") ?? COMMUNITIES[1];
  const thread = THREADS.find((t) => t.id === "t-ib-hours") ?? THREADS[0];
  const answer = thread.responses.find((r) => r.kind === "answer" && r.primary);
  const pro = PROS.find((p) => answer?.kind === "answer" && p.id === answer.proId) ?? PROS[2];
  const accent = WORLD_COLORS[community.world];
  return (
    <div
      className="relative flex w-full max-w-[300px] flex-col items-center"
      role="img"
      aria-label={`Connect: the ${community.name} community with ${community.students} students, ${community.activePros} professionals and companies including ${community.professionalsFrom.slice(0, 3).join(", ")}. ${thread.handle}, ${thread.grade}, asks '${thread.title}'. ${pro.name}, ${pro.role} at ${pro.org}, answers.`}
    >
      {/* Two cards, deliberately overlapped (direct feedback, 7 Sept 2026:
         liked the overlap, wanted it done cleanly) -- the thread card sits
         a fixed amount over the community card's lower edge via a negative
         margin, not independent `absolute` boxes eyeballed to "just miss"
         (the old version overlapped by ~34% of the frame's width and put
         the Open button on top of the question text). Card is the app's own
         frosted-glass surface (backdrop-blur, ~90% opacity) -- true where it
         sits over a plain background, but stacked over ANOTHER card that
         blur reveals and blends the card underneath's text into it. The
         backing plate below is a fully opaque rect the exact shape of Card,
         sitting behind it and in front of the community card, so the blur
         terminates on solid colour and nothing shows through or mixes. */}
      <div aria-hidden inert className="marketing-v2 relative w-full" style={{ height: 300, zIndex: 0 }}>
        <CommunityCard community={community} joined onOpen={noop} onJoin={noop} />
      </div>
      <div aria-hidden inert className="marketing-v2 relative w-full" style={{ marginTop: -50, zIndex: 1, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.45))" }}>
        <span aria-hidden className="absolute inset-0 rounded-[var(--radius-lg)]" style={{ background: "var(--background)" }} />
        <Card accent={accent} className="relative">
          <div className="flex items-center justify-between gap-[var(--space-3)]">
              <span className="flex min-w-0 items-center gap-[8px]">
                <Avatar name={thread.handle} size={26} />
                <span className="flex-none text-[12px] leading-[16px] font-bold whitespace-nowrap" style={{ color: "var(--foreground)" }}>{thread.handle}</span>
                <span className="min-w-0 truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>· {thread.grade}{thread.location ? ` · ${thread.location}` : ""}</span>
              </span>
              <span className="flex-none text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{thread.postedAgo}</span>
            </div>
            <h3 className="mt-[12px] text-[16px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>&ldquo;{thread.title}&rdquo;</h3>
            <div className="mt-[12px] flex items-center gap-[var(--space-5)] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-[5px]"><ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {thread.helpful}</span>
              <span className="flex items-center gap-[5px]"><MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {thread.comments ?? thread.responses.length} comments</span>
            </div>
            <div className="mt-[14px] border-t pt-[14px]" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <div className="flex items-center gap-[8px]">
                <Avatar name={pro.name} size={30} verified />
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-[5px] text-[13px] leading-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                    <span className="truncate">{pro.name}</span>
                    <BadgeCheck className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} />
                  </span>
                  <span className="flex items-center gap-[6px] text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>
                    <span className="truncate">{pro.role}</span>
                    <CompanyChip name={pro.org} tone="surface" size="sm" />
                  </span>
                </span>
              </div>
              <p className="mt-[8px] line-clamp-3 text-[13.5px] leading-[20px]" style={{ color: "color-mix(in srgb, var(--foreground) 92%, transparent)" }}>{answer?.kind === "answer" ? answer.body : ""}</p>
            </div>
          </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Educators: a counselor and a student over the real Profile overview
// (OverviewTab: the Top Three / Plan / Report bento and Do this next).
// ---------------------------------------------------------------------------

export function ProgressArt() {
  const focus = PROFILE_CAREERS[0];
  const tasks = focus.plan.flatMap((horizon) => horizon.tasks);
  const complete = tasks.filter((task) => task.doneByDefault).length;
  const planProgress = () => ({ complete, total: tasks.length, pct: Math.round((complete / Math.max(tasks.length, 1)) * 100) });
  return (
    <div className="relative mx-auto w-full pb-[38%] sm:pb-[30%]">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[28px] sm:aspect-[16/9]" style={{ boxShadow: SHADOW }}>
        <Image src={PHOTOS.educators} alt="" fill sizes="(max-width: 1024px) 100vw, 720px" className="object-cover" style={{ objectPosition: "50% 88%" }} />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,7,15,0.42) 0%, rgba(5,7,15,0.06) 45%, transparent 70%)" }} />
      </div>
      <Product
        label={`${STUDENT.name}'s Profile overview: ${focus.match}% match with ${focus.title}, My Top Three 2 of 3 chosen, My Plan ${complete} of ${tasks.length} steps, Career Report, and Do this next with Explore and Play actions`}
        base={560}
        floor={0.6}
        ceiling={1}
        flow
        className="right-[-3%] bottom-0 w-[92%] sm:right-[-3%] sm:w-[80%] lg:right-[-4%] lg:w-[78%]"
      >
        <SpaceGround />
        <div className="relative" style={{ padding: mu(18) }}>
          <div className="flex flex-col gap-[var(--space-4)]" style={{ zoom: "var(--mu)" }}>
            <div className="flex items-center justify-between gap-[var(--space-3)]">
              <div className="flex items-center gap-[12px]">
                <Image src={STUDENT.avatar} alt="" width={96} height={96} className="size-[48px] rounded-full border-2 object-cover" style={{ borderColor: "rgba(255,255,255,0.9)" }} />
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
      </Product>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data credibility: the career page's own Pay by state map and career ladder,
// with the page's Figure for every number. Live: the map answers hover.
// ---------------------------------------------------------------------------

export function DataArt() {
  const slug = "investment-banking";
  const profile = careerProfile(slug);
  const accent = WORLD_COLORS["Business & Money"];
  const rungs = (CAREER_EXTRAS[slug]?.ladder ?? []).filter((r) => r.salary !== "-");
  const typical = profile?.facts.find((f) => f.label === "Typical pay")?.value ?? "$361,000/year";
  const rows = [...(profile?.payByState.yourStates ?? []), ...(profile?.payByState.best ?? [])];
  return (
    <div role="group" aria-label="Investment Banking data from the career page: pay by state across the United States, and the career ladder" className="marketing-v2 mx-auto flex w-full max-w-[420px] flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] p-[22px]" style={CARD_SURFACE}>
      <Section title={profile?.payByState.title ?? "Pay by state"} action={<span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Typical pay <Figure accent={accent}>{typical}</Figure></span>}>
        <PayMap typical={typical} rows={rows} yourState={profile?.payByState.yourStates?.[0]?.state} accent={accent} seed={slug} />
      </Section>
      <Section title="Career ladder">
        <ul className="-mt-[var(--space-2)] flex flex-col">
          {rungs.map((rung, i) => (
            <li key={rung.number} className={`grid items-center gap-[var(--space-4)] py-[11px] ${i > 0 ? "border-t" : ""}`} style={{ gridTemplateColumns: "28px minmax(0,1fr) auto", borderColor: "var(--glass-border)" }}>
              <span className="text-center text-[16px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", backgroundImage: `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{rung.number}</span>
              <span className="min-w-0 truncate text-[15px] leading-[22px] font-semibold">{rung.jobTitle}</span>
              <Figure accent={accent}>{rung.salary}</Figure>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dream Opportunity: a hall of students, the DO mark set on its lower edge.
// ---------------------------------------------------------------------------

export function OrganizationBand() {
  return (
    <div className="relative mx-auto w-full max-w-[1040px] pb-8 sm:pb-10">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] sm:aspect-[21/9] lg:aspect-[3/1]" style={{ boxShadow: SHADOW }}>
        <Image src={PHOTOS.organization} alt="" fill sizes="(max-width: 1100px) 100vw, 1040px" className="object-cover" style={{ objectPosition: "50% 42%" }} />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,7,15,0.5) 0%, rgba(5,7,15,0.08) 50%, transparent 75%)" }} />
      </div>
      <DOMark className="absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 sm:h-20 sm:w-20" />
    </div>
  );
}
