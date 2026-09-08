"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronLeft, ChevronRight, EyeOff, Eye, Gem, MessageCircleQuestion, MessagesSquare, Medal, ShieldCheck, Sparkles, Trophy, UserPlus, type LucideIcon, Landmark, Code2, Stethoscope, Palette, FlaskConical, GraduationCap, HardHat, Scale, UtensilsCrossed, Leaf, HeartHandshake, Plane, Factory, Wrench, Scissors } from "lucide-react";
import { WORLD_COLORS } from "@/components/app/worlds";
import { DECK } from "@/components/match-lab/data";
import { PROS, type Pro } from "./data";
import { Avatar, CompanyChip, ConnectNav, PrimaryCta, ProAvatar, SectionHead, SectionSurface, VerifiedBadge, volunteerTier } from "./primitives";
import { FollowButton, NewFromFollowing, rankPros, shortCount, useStudentWorlds, withNewProsFirst, type Follows } from "./ProProfile";

/** "Active daily/weekly/bi-weekly/monthly" -- the same activeDaysAgo the
 *  ranking already scores on, read out loud (the Replit reference's own
 *  copy: a status pill on every follow card, not a number). */
function activityLabel(daysAgo: number): string {
  if (daysAgo <= 1) return "Active daily";
  if (daysAgo <= 7) return "Active weekly";
  if (daysAgo <= 21) return "Active bi-weekly";
  return "Active monthly";
}

/** One card in the People-to-follow carousel: portrait, name + verified
 *  mark, role, company, a combined tier + activity badge, a reach count,
 *  then View profile and Follow. Tier and reach are both worth keeping
 *  (direct feedback: "all of that info I think is valuable") but sized to
 *  this component's own rhythm rather than the reference's own buttons. */
function FollowCard({ pro, following, onFollow }: { pro: Pro; following: boolean; onFollow: () => void }) {
  const nav = useContext(ConnectNav);
  const tier = volunteerTier(pro);
  const TierIcon = tier?.name === "Diamond" ? Gem : tier?.name === "Gold" ? Trophy : Medal;
  // The whole card opens the profile now, not just the avatar/name/"View
  // profile" text (direct feedback, 9 Sept 2026) -- role="button" + a key
  // handler since a clickable <li> isn't natively keyboard-operable the
  // way a real <button> is. Follow stays its own action: stopPropagation
  // on its wrapper keeps a follow tap from also opening the profile.
  return (
    <li
      onClick={() => nav?.openPro(pro.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nav?.openPro(pro.id); } }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${pro.name}'s profile`}
      className="dm-tap flex cursor-pointer flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] p-[var(--space-4)]"
      style={{ background: "var(--glass-surface-1)", border: "1px solid var(--glass-border)" }}
    >
      <div className="flex items-center gap-[var(--space-3)]">
        <ProAvatar proId={pro.id} name={pro.name} size={52} />
        <div className="min-w-0 flex-1">
          {/* `flex-1` on the name button used to stretch it to the row's
             full width, so the badge (its next sibling) landed wherever
             that invisible box ended -- near the card's far edge, not
             snug against the visible name (direct feedback, 9 Sept
             2026). `min-w-0` alone lets it shrink-to-truncate without
             claiming space it doesn't need. */}
          <span className="flex min-w-0 items-center gap-x-[4px] text-[14.5px] leading-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            <span className="min-w-0 truncate">{pro.name}</span>
            <VerifiedBadge size={13} />
          </span>
          <p className="truncate text-[13px] leading-[17px]" style={{ color: "color-mix(in srgb, var(--foreground) 86%, transparent)" }}>{pro.role}</p>
          <div className="mt-[2px]"><CompanyChip name={pro.org} tone="surface" size="sm" /></div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
        {tier && (
          <span className="flex w-fit items-center gap-[5px] rounded-full px-[10px] py-[4px] text-[11px] leading-[15px] font-bold tracking-[0.02em]" style={{ background: "var(--glass-surface-2)", color: tier.color }}>
            <TierIcon className="h-3 w-3" aria-hidden /> {tier.name}: {activityLabel(pro.activeDaysAgo)}
          </span>
        )}
        <span className="flex items-center gap-[4px] text-[11.5px] leading-[15px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          <Eye className="h-3 w-3" aria-hidden /> {shortCount(pro.studentsReached)} views
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-[var(--space-3)]">
        <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>View profile</span>
        <span onClick={(e) => e.stopPropagation()}><FollowButton compact following={following} onToggle={onFollow} /></span>
      </div>
    </li>
  );
}

// 6, not 3 (direct feedback, 9 Sept 2026: "why are active people to
// follow 3 per screen... it leaves empty space") -- the grid below is
// sm:grid-cols-2 lg:grid-cols-3, and 3 cards fills the 3-column layout
// exactly but leaves a lone card + a blank slot on the 2-column one. 6 is
// the smallest count that fills a complete set of rows at both.
const FOLLOW_PAGE_SIZE = 6;

/** Three cards a page (the reference's own layout), Prev/Next plus a dot
 *  per page -- so the rest of the ranked list stays reachable without
 *  turning the section into an endless scroll. */
function FollowCarousel({ pros, follows, onFollow }: { pros: Pro[]; follows: Follows; onFollow: (id: string) => void }) {
  const [page, setPage] = useState(0);
  const shown = pros.slice(0, FOLLOW_PAGE_SIZE * 4); // four pages is plenty of choice without ranking the whole roster
  const pageCount = Math.max(1, Math.ceil(shown.length / FOLLOW_PAGE_SIZE));
  const clamped = Math.min(page, pageCount - 1);
  const visible = shown.slice(clamped * FOLLOW_PAGE_SIZE, clamped * FOLLOW_PAGE_SIZE + FOLLOW_PAGE_SIZE);
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((pro) => <FollowCard key={pro.id} pro={pro} following={!!follows[pro.id]} onFollow={() => onFollow(pro.id)} />)}
      </ul>
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-[12px]">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={clamped === 0} aria-label="Previous professionals" className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30" style={{ background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="flex items-center gap-[6px]" role="tablist" aria-label="Page">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button key={i} type="button" role="tab" aria-selected={i === clamped} aria-label={`Page ${i + 1}`} onClick={() => setPage(i)} className="dm-quiet size-[6px] cursor-pointer rounded-full" style={{ background: i === clamped ? "var(--primary)" : "var(--glass-border)" }} />
            ))}
          </span>
          <button type="button" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={clamped === pageCount - 1} aria-label="More professionals" className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30" style={{ background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

// The People tab, matched to Joshua's reference (Slack, 6-8 Sept 2026): one
// continuous page, no segmented "For you / Browse industries" tab switch --
// Find a professional, People to follow, Browse by industry (every world
// with its professional count; tap one to browse its profiles, "Explore all
// industries" expands the same grid to every world instead of switching to
// a separate screen), then New from people you follow. Everything is drawn
// from Connect's own verified professionals; nothing here ranks students.

const WORLD_ICON: Record<string, LucideIcon> = {
  "Business & Money": Landmark,
  "Tech & Engineering": Code2,
  "Health & Medicine": Stethoscope,
  "Arts, Media & Sport": Palette,
  "Science & Research": FlaskConical,
  "Teaching & Education": GraduationCap,
  "Building & Construction": HardHat,
  "Law, Safety & Justice": Scale,
  "Food & Cooking": UtensilsCrossed,
  "Farming, Animals & Nature": Leaf,
  "Counseling & Social Work": HeartHandshake,
  "Driving, Flying & Shipping": Plane,
  "Factories & Making Things": Factory,
  "Fixing Machines & Engines": Wrench,
  "Personal Care & Community Services": Scissors,
};
const WORLDS = Object.keys(WORLD_COLORS);

// Connect-only tile accent, deliberately NOT the shared WORLD_COLORS a world
// wears everywhere else (Explore's poster cards, etc.) -- direct feedback,
// 8 Sept 2026 (Slack): each Browse-by-industry card read as visually
// separate/arbitrary, when the grid should read as one controlled cool
// spectrum (violet -> blue -> green) that stays consistent down a column and
// progresses smoothly across it. A student browsing Connect in isolation
// was never going to notice these differ from Explore's own world colors,
// per the same feedback, so this is scoped to this one grid rather than
// touched at the token level. Same 15-world order as WORLD_COLORS (grid
// position order), so a tile's column/row neighbours are always adjacent
// steps in the spectrum.
// Second pass (direct feedback, 8 Sept 2026): the first attempt spanned
// violet all the way to green and read as "too many colours" -- pulled back
// to one analogous family (indigo through blue), shifting gently in both
// hue and tone rather than jumping hue every tile. Subtle but still
// orderable at a glance, following the same 15-world grid-position order as
// WORLD_COLORS.
const BROWSE_TILE_ACCENT: Record<string, string> = {
  "Business & Money": "#7349d4",
  "Tech & Engineering": "#6d4ed5",
  "Health & Medicine": "#6752d5",
  "Arts, Media & Sport": "#6256d5",
  "Science & Research": "#5e5bd5",
  "Teaching & Education": "#5f64d6",
  "Building & Construction": "#6370d6",
  "Law, Safety & Justice": "#677cd6",
  "Food & Cooking": "#6b87d7",
  "Farming, Animals & Nature": "#7091d7",
  "Counseling & Social Work": "#749bd8",
  "Driving, Flying & Shipping": "#78a4d8",
  "Factories & Making Things": "#7cadd9",
  "Fixing Machines & Engines": "#80b5d9",
  "Personal Care & Community Services": "#84bdda",
};

function WorldTile({ world, count, unit, onOpen }: { world: string; count: number; unit: string; onOpen: () => void }) {
  const Icon = WORLD_ICON[world] ?? Sparkles;
  const accent = BROWSE_TILE_ACCENT[world] ?? WORLD_COLORS[world] ?? "var(--primary)";
  return (
    <li>
      <button type="button" onClick={onOpen} className="dm-quiet flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] p-[var(--space-4)] text-left" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 14%, var(--glass-surface-1)), var(--glass-surface-1))` }}>
        <span aria-hidden className="flex size-[40px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="truncate text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{world}</span>
          <span className="text-[12.5px] leading-[17px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{count === 0 ? "Coming soon" : `${count} ${count === 1 ? unit : `${unit}s`}`}</span>
        </span>
        <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      </button>
    </li>
  );
}

/** One professional: portrait, name with the verified mark, role, company,
 *  View profile and Follow, the two public numbers. */
function PersonCard({ pro, following, onFollow, badge, quote }: { pro: Pro; following: boolean; onFollow: () => void; badge?: string; quote?: string }) {
  const nav = useContext(ConnectNav);
  // Whole card opens the profile now, not just the avatar/name/"View
  // profile" text (direct feedback, 9 Sept 2026) -- see FollowCard above
  // for the same treatment and why Follow gets its own stopPropagation.
  return (
    <li
      onClick={() => nav?.openPro(pro.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nav?.openPro(pro.id); } }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${pro.name}'s profile`}
      className="dm-tap flex cursor-pointer flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] p-[var(--space-4)]"
      style={{ background: "var(--glass-surface-1)" }}
    >
      {badge && (
        <span className="flex w-fit items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[11px] leading-[15px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent-subtle)" }}>
          <Sparkles className="h-3 w-3" aria-hidden /> {badge}
        </span>
      )}
      <div className="flex items-start gap-[var(--space-3)]">
        <span className="flex-none rounded-full leading-none"><Avatar name={pro.name} size={52} /></span>
        <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
          <span className="flex items-center gap-[5px] text-[15px] leading-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            <span className="truncate">{pro.name}</span>
            <VerifiedBadge size={15} />
          </span>
          <span className="truncate text-[13px] leading-[17px]" title={pro.role} style={{ color: "color-mix(in srgb, var(--foreground) 80%, transparent)" }}>{pro.role}</span>
          <span className="truncate text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.org}</span>
        </div>
      </div>
      {/* This is the QUESTION they answered, not something they said --
         direct feedback: quotation marks alone read as a thing the person
         said, which confused Joshua. "Answered" makes the reference
         unambiguous while still using their own words for the title. */}
      {quote && (
        <p className="flex items-start gap-[6px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-[13px] leading-[18px]" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
          <MessagesSquare className="mt-[2px] h-3.5 w-3.5 flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} />
          <span>Answered <span className="font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{quote}&rdquo;</span></span>
        </p>
      )}
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>View profile</span>
        <span onClick={(e) => e.stopPropagation()}><FollowButton compact following={following} onToggle={onFollow} /></span>
      </div>
      {!quote && (
        <span className="text-[12px] leading-[16px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          {shortCount(pro.studentsReached)} students reached · {shortCount(pro.followers)} followers
        </span>
      )}
    </li>
  );
}

function Grid({ pros, follows, onFollow }: { pros: Pro[]; follows: Follows; onFollow: (id: string) => void }) {
  return (
    <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
      {pros.map((pro) => <PersonCard key={pro.id} pro={pro} following={!!follows[pro.id]} onFollow={() => onFollow(pro.id)} />)}
    </ul>
  );
}

/** Two-step welcome, immediate and automatic (direct feedback,
 *  corporate-partner review) the first time someone opens Connect >
 *  People from OUTSIDE Connect -- but only once per Connect visit, not
 *  every time PeopleTab remounts from in-app back navigation (direct
 *  feedback, 9 Sept 2026: "doesn't need to come up again when I click
 *  back from a people profile to the people tab"). The "seen it already"
 *  flag has to live in the parent (ConnectExperience), one level above
 *  where PeopleTab itself mounts and unmounts as the student moves
 *  between views -- tracked there, it survives exactly as long as Connect
 *  itself stays mounted, and resets naturally the next time they arrive
 *  fresh from somewhere else. */
/** The two rules on step one, each its own row with an icon so the
 *  "students can / volunteers can't" contrast reads at a glance instead
 *  of as one dense paragraph (direct feedback: "don't make the popups so
 *  boring and text only"). */
function WelcomeRule({ icon: Icon, tone, children }: { icon: LucideIcon; tone: "yes" | "no"; children: React.ReactNode }) {
  const color = tone === "yes" ? "var(--accent-subtle)" : "var(--muted-foreground)";
  return (
    <li className="flex items-start gap-[10px] rounded-[var(--radius-md)] p-[var(--space-3)]" style={{ background: "var(--glass-surface-1)" }}>
      <span className="mt-[1px] flex size-[26px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, " + color + " 18%, transparent)", color }}>
        <Icon className="h-[14px] w-[14px]" aria-hidden />
      </span>
      <span className="text-[13.5px] leading-[19px]" style={{ color: "var(--foreground)" }}>{children}</span>
    </li>
  );
}

export function PeopleWelcome({ hasShown, onShown }: { hasShown: boolean; onShown: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2>(1);
  if (hasShown || step === 0) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-[var(--space-5)]" style={{ background: "color-mix(in srgb, #000000 72%, transparent)" }}>
      {/* A near-black surface on a near-black page background used to read
         as the same slab (direct feedback, 8 Sept 2026: "blends into the
         background") -- the glass-surface-3 token plus a blurred backdrop
         and a primary-tinted border gives it real edges and depth, and the
         darker backdrop scrim (55% -> 72%) pushes the page further back. */}
      <div role="dialog" aria-modal="true" aria-labelledby="people-welcome-title" className="relative z-[1] flex w-full max-w-[440px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border backdrop-blur-xl sm:rounded-[var(--radius-lg)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.9)" }}>
        {/* The cloud mascot leads every welcome moment app-wide -- a soft
           glow behind it instead of a flat icon-on-white so the header
           reads as a moment, not a form field. */}
        <div className="relative flex flex-col items-center gap-[var(--space-3)] px-[var(--space-6)] pt-[var(--space-6)] pb-[var(--space-4)] text-center">
          <span aria-hidden className="pointer-events-none absolute top-[-40px] size-[180px] rounded-full blur-[40px]" style={{ background: "color-mix(in srgb, var(--primary) 35%, transparent)" }} />
          <span className="relative flex size-[136px] flex-none items-center justify-center">
            <Image src="/images/dreamy/v2/dreamy-puzzle.png" alt="" width={272} height={272} className="h-full w-full object-contain" priority />
          </span>
          <h2 id="people-welcome-title" className="relative text-[21px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            {step === 1 ? "Welcome to Connect!" : "A moderated space"}
          </h2>
        </div>

        <div className="flex flex-col gap-[var(--space-4)] px-[var(--space-6)] pb-[var(--space-6)]">
          {step === 1 ? (
            <ul className="flex flex-col gap-[8px]">
              <WelcomeRule icon={UserPlus} tone="yes">Students can <strong>follow</strong> Dream Volunteers.</WelcomeRule>
              <WelcomeRule icon={MessageCircleQuestion} tone="yes">Students can <strong>ask questions publicly</strong>.</WelcomeRule>
              <WelcomeRule icon={EyeOff} tone="no">Volunteers <strong>can&rsquo;t follow or privately message</strong> students.</WelcomeRule>
            </ul>
          ) : (
            <div className="flex items-start gap-[10px] rounded-[var(--radius-md)] p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)" }}>
              <ShieldCheck className="mt-[1px] h-5 w-5 flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} />
              <p className="text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>All interactions are moderated by Dreamari staff and school faculty.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-[6px]" aria-hidden>
            <span className="h-[6px] rounded-full transition-[width]" style={{ width: step === 1 ? 18 : 6, background: step === 1 ? "var(--primary)" : "var(--glass-border)" }} />
            <span className="h-[6px] rounded-full transition-[width]" style={{ width: step === 2 ? 18 : 6, background: step === 2 ? "var(--primary)" : "var(--glass-border)" }} />
          </div>

          <PrimaryCta
            className="w-full"
            size="md"
            onClick={() => {
              // Mark "seen" only when the student actually finishes it
              // (step 2 -> 0), not on mount -- calling onShown() eagerly
              // flipped the parent's flag before the modal ever painted,
              // so it hid itself instantly (direct feedback, 9 Sept 2026:
              // "now the popup doesn't pop up at all").
              if (step === 2) onShown();
              setStep(step === 1 ? 2 : 0);
            }}
          >
            {step === 1 ? "Continue" : "Start Connecting!"}
          </PrimaryCta>
        </div>
      </div>
    </div>
  );
}

export function PeopleTab({ follows, onFollow, query, onFocusChange }: { follows: Follows; onFollow: (id: string) => void; query: string; onFocusChange?: (focused: boolean) => void }) {
  const worlds = useStudentWorlds();
  const [industry, setIndustry] = useState<string | null>(null);
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => PROS.filter((p) => !q || [p.name, p.role, p.org, p.field, p.world, ...(p.topics ?? [])].some((v) => v.toLowerCase().includes(q))), [q]);
  const countIn = (world: string) => PROS.filter((p) => p.world === world).length;
  const pathsIn = (world: string) => new Set(DECK.filter((c) => c.world === world).map((c) => c.title)).size || new Set(PROS.filter((p) => p.world === world).map((p) => p.field)).size;

  // One task on screen at a time (direct feedback): drilling into a single
  // industry or opening the full industry list narrows the page down to
  // just that, so the shared search heading above doesn't sit over a page
  // that no longer has "find a professional" as its job.
  const focused = industry !== null || showAllIndustries;
  useEffect(() => onFocusChange?.(focused), [focused, onFocusChange]);

  // The welcome modal itself lives one level up in ConnectExperience's
  // HomeView now (direct feedback, 9 Sept 2026: it needs to show for any
  // Connect tab, not just People), so it's not rendered here anymore.

  // a search from the shared box wins over every view
  if (q) {
    return (
      <>
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Search results">
          <SectionHead>{matches.length} {matches.length === 1 ? "professional" : "professionals"}</SectionHead>
          {matches.length > 0 ? <Grid pros={matches} follows={follows} onFollow={onFollow} /> : <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>No professional matches that yet. Try a career, a company or a name.</p>}
        </section>
      </>
    );
  }

  // one industry, its people
  if (industry) {
    const people = rankPros(PROS.filter((p) => p.world === industry), worlds);
    return (
      <>
        <SectionSurface className="flex flex-col gap-[var(--space-4)]">
          <button type="button" onClick={() => setIndustry(null)} className="dm-link flex min-h-[40px] w-fit cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> All industries
          </button>
          <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
            <SectionHead>{industry}</SectionHead>
            <span className="text-[13px] leading-[18px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{people.length} {people.length === 1 ? "professional" : "professionals"}</span>
          </div>
          {people.length > 0 ? <Grid pros={people} follows={follows} onFollow={onFollow} /> : <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>No verified professionals in this world yet. Follow a community to hear when one joins.</p>}
        </SectionSurface>
      </>
    );
  }

  // the full industry list, its own dedicated screen (direct feedback: it
  // used to expand this same grid in place, still surrounded by People to
  // follow and New from people you follow -- one task at a time reads
  // clearer than carrying the whole People page along).
  if (showAllIndustries) {
    return (
      <>
        <SectionSurface className="flex flex-col gap-[var(--space-4)]">
          <button type="button" onClick={() => setShowAllIndustries(false)} className="dm-link flex min-h-[40px] w-fit cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </button>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[12px] leading-[16px] font-extrabold tracking-[0.08em]" style={{ color: "var(--accent-subtle)" }}>BROWSE BY INDUSTRY</span>
            <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Every world Dreamari covers, whether it has professionals yet or not.</span>
          </div>
          <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
            {WORLDS.map((world) => <WorldTile key={world} world={world} count={pathsIn(world)} unit="career path" onOpen={() => setIndustry(world)} />)}
          </ul>
        </SectionSurface>
      </>
    );
  }

  const shownWorlds = WORLDS.filter((w) => countIn(w) > 0);

  return (
    <>
      {/* "Find a professional" itself heads the shared search box one
         level up (ConnectExperience's HomeView), not here -- no second
         row of career chips repeating it either (direct feedback, Joshua
         Pierce, 8 Sept 2026: "does not match yet -- still has ... your
         careers - investment banker etc"). One page, in the reference's
         own order: Find a professional, People to follow, Browse by
         industry, New from people you follow -- no segmented "For you /
         Browse industries" tab switching between them (direct feedback:
         "still has browse industries toggle"). Each section now sits in
         its own grounded surface (direct feedback: too much of Connect
         read as components floating on the page background) so the eye
         can tell where "People to follow" ends and "Browse by industry"
         begins without leaning on a heavier boxed style everywhere. */}
      <SectionSurface className="flex flex-col gap-[var(--space-3)]" >
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Active people to follow">
          <div className="flex flex-col gap-[2px]">
            <SectionHead>Active people to follow</SectionHead>
            <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Professionals based on your career interests.</span>
          </div>
          <FollowCarousel pros={withNewProsFirst(PROS, worlds)} follows={follows} onFollow={onFollow} />
        </section>
      </SectionSurface>

      <SectionSurface>
        <section className="flex flex-col gap-[var(--space-3)]" aria-label="Browse by industry">
          <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
            <div className="flex flex-col gap-[2px]">
              <SectionHead>Browse by industry</SectionHead>
              <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Explore professionals in fields that interest you.</span>
            </div>
            <button type="button" onClick={() => setShowAllIndustries(true)} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>Explore all industries <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>
          </div>
          <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
            {shownWorlds.map((world) => <WorldTile key={world} world={world} count={countIn(world)} unit="professional" onOpen={() => setIndustry(world)} />)}
          </ul>
        </section>
      </SectionSurface>

      <NewFromFollowing follows={follows} />
    </>
  );
}
