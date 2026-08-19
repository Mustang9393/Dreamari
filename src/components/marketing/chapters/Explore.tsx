"use client";

import Image from "next/image";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";
import { bricolage } from "@/components/build/fonts";

// The Explore chapter graphic is a miniature of the app's actual Browse page
// (Figma node 3185-17011): page header, the world-filter chip band, and the
// ranked "Top 5 Trending" poster rail. Per review feedback the FYP-style swipe
// deck is gone from this chapter — horizontal browse rails are the one catalog
// mental model every generation shares (TV guide -> Netflix -> streaming rows),
// which is what makes the section land for parents and school clients without
// reading as dated to students (the ranked row + poster art is straight off
// every streaming home screen they use daily). One rail only, per feedback —
// the previous two-row version read as clutter.
//
// Composition: three horizontal bands (header chrome / filter chips / rail),
// vertically centered as a group. The rail's tiles derive their size from the
// band's own height (h-full inside a capped flex-1 area), so a taller frame
// grows the poster art instead of accumulating dead space above and below it.

const WORLD_COLORS: Record<string, string> = {
  "Business & Money": "var(--world-business-money-office)",
  "Science & Research": "var(--world-science-research)",
  "Tech & Engineering": "var(--world-tech-engineering-design)",
  "Health & Medicine": "var(--world-health-medicine)",
  "Arts, Media & Sport": "var(--world-arts-media-sport)",
  "Teaching & Education": "var(--world-teaching-learning)",
  "Building & Construction": "var(--world-building-construction)",
  "Law, Safety & Justice": "var(--world-law-safety-government)",
  "Food & Cooking": "var(--world-food-farming-nature)",
  "Driving, Flying & Shipping": "var(--world-driving-flying-shipping)",
};

type BrowseItem = { photo: string; title: string; world: string; rank: number };

const BROWSE_TOP5: BrowseItem[] = [
  { photo: "/images/trending/trending-doctor.png", title: "Doctor", world: "Health & Medicine", rank: 1 },
  { photo: "/images/trending/trending-software-engineer.png", title: "Software Engineer", world: "Tech & Engineering", rank: 2 },
  { photo: "/images/trending/trending-nurse.png", title: "Nurse", world: "Health & Medicine", rank: 3 },
  { photo: "/images/trending/trending-lawyer.png", title: "Lawyer", world: "Law, Safety & Justice", rank: 4 },
  { photo: "/images/trending/trending-airline-pilot.png", title: "Airline Pilot", world: "Driving, Flying & Shipping", rank: 5 },
];

// The filter band's world names, straight off the Browse page's own chip row.
const FILTER_CHIPS = [
  "All",
  "Tech & Engineering",
  "Health & Medicine",
  "Business & Money",
  "Arts, Media & Sport",
  "Science & Research",
  "Teaching & Education",
  "Building & Construction",
  "Law, Safety & Justice",
  "Food & Cooking",
];

// Poster-title typeface per world, mirroring the Browse Cards component:
// Business & Money keeps Viaoda, Science & Research keeps Source Code Pro;
// the rest use the site's own bold sans so tech/health don't wear a serif.
function browseTitleFont(world: string): React.CSSProperties {
  if (world === "Business & Money" || world === "Law, Safety & Justice" || world === "Driving, Flying & Shipping")
    return { fontFamily: "var(--font-poster)", fontWeight: 400 };
  if (world === "Science & Research") return { fontFamily: "var(--font-poster-mono)", fontWeight: 600 };
  return { fontFamily: "var(--font-body)", fontWeight: 800 };
}

function BrowseTile({ item }: { item: BrowseItem }) {
  return (
    <div className="flex h-full flex-none items-end">
      {/* Oversized outlined rank numeral tucked behind the card's left edge —
         straight off the reference frame's "Top 5" row. */}
      <span
        aria-hidden
        className={`${bricolage.className} relative select-none`}
        style={{
          // cqh against the rail band: the digit stays the component spec's
          // fixed fraction of the CARD height (Figma: 155px digit on a 250px
          // card, Bricolage ExtraBold, tight tracking) at every rail size.
          fontSize: "clamp(64px, 62cqh, 320px)",
          fontWeight: 800,
          lineHeight: 0.86,
          letterSpacing: "-0.028em",
          marginRight: "clamp(-40px, -5cqh, -12px)",
          color: "var(--background)",
          WebkitTextStroke: "1.5px color-mix(in srgb, var(--foreground) 32%, transparent)",
        }}
      >
        {item.rank}
      </span>
      <div
        className="relative z-10 h-full flex-none overflow-hidden"
        style={{ aspectRatio: "2 / 3", borderRadius: "max(12px, calc(var(--mu) * 9px))", border: "1px solid var(--glass-border)" }}
      >
        <Image src={item.photo} alt="" fill sizes="260px" className="object-cover" draggable={false} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, var(--scrim-heavy) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 text-center uppercase" style={{ padding: "max(8px, calc(var(--mu) * 7px)) max(5px, calc(var(--mu) * 4px))" }}>
          <p style={{ ...browseTitleFont(item.world), fontSize: "max(12.5px, calc(var(--mu) * 10px))", lineHeight: 1.12, letterSpacing: "0.3px", color: "var(--foreground)" }}>
            {item.title}
          </p>
          <p
            className="mt-0.5"
            style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "max(8px, calc(var(--mu) * 6px))", letterSpacing: "0.06em", color: WORLD_COLORS[item.world] }}
          >
            {item.world}
          </p>
        </div>
      </div>
    </div>
  );
}

// Auto-drifting marquee — the sequence renders twice and the track translates
// -50%, so the loop is seamless. Pauses on hover; disabled under
// prefers-reduced-motion (see globals.css).
function Marquee({ children, duration, reverse, className = "" }: { children: React.ReactNode; duration: number; reverse?: boolean; className?: string }) {
  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div
        className="mkt-rail-track flex h-full w-max items-center"
        style={{ gap: "max(10px, calc(var(--mu) * 8px))", animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal", paddingRight: "max(10px, calc(var(--mu) * 8px))" }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  const active = label === "All";
  return (
    <span
      className="flex flex-none items-center rounded-full border font-mono font-bold uppercase whitespace-nowrap"
      style={{
        gap: "max(5px, calc(var(--mu) * 4px))",
        padding: "max(5px, calc(var(--mu) * 4px)) max(11px, calc(var(--mu) * 9px))",
        fontSize: "max(8.5px, calc(var(--mu) * 6.5px))",
        letterSpacing: "0.06em",
        background: active ? "var(--foreground)" : "var(--glass-surface-1)",
        borderColor: active ? "var(--foreground)" : "var(--glass-border)",
        color: active ? "var(--background)" : "var(--muted-foreground)",
      }}
    >
      {label !== "All" && (
        <span
          aria-hidden
          className="rounded-full"
          style={{ width: "max(6px, calc(var(--mu) * 4.5px))", height: "max(6px, calc(var(--mu) * 4.5px))", background: WORLD_COLORS[label] }}
        />
      )}
      {label}
    </span>
  );
}

export function ExploreChapter() {
  const [graphicRef, , graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="explore"
      title="Explore"
      color="#1fc76e"
      oneliner="careers, companies, and pathways with depth."
      graphicRef={graphicRef}
      playing={false}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId: the marquees restart from their seams on every
         return visit, so the section always re-enters mid-motion. */}
      <BrowsePage key={visitId} />
    </ChapterShell>
  );
}

function BrowsePage() {
  return (
    <div className="flex h-full w-full flex-col justify-center" style={{ gap: "max(14px, calc(var(--mu) * 12px))" }}>
      {/* World filter chips — drifting slowly the opposite way so the two bands
         read as independent, alive surfaces rather than one conveyor belt. */}
      <Marquee duration={70} reverse className="flex-none">
        {FILTER_CHIPS.map((chip) => (
          <FilterChip key={chip} label={chip} />
        ))}
      </Marquee>

      {/* flex-none + an explicit width-proportional band height: with flex-1
         here, tall phone frames dumped all their spare height into this block
         and the group read as two islands with a dead gap between them. Now
         chips, label, rail, and caption center together as one cluster. */}
      <div className="flex w-full flex-none flex-col" style={{ gap: "max(10px, calc(var(--mu) * 8px))" }}>
        <p
          className="w-full flex-none text-left"
          style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "max(12.5px, calc(var(--mu) * 9.5px))", color: "var(--foreground)" }}
        >
          The Top 5 Trending Careers Among Gen Z
        </p>
        {/* The rail band: tiles take their height FROM this band (h-full inside
           a definite flex-1 area, capped), so taller viewports grow the poster
           art instead of leaving dead space. */}
        <div className="w-full" style={{ height: "min(380px, 92cqw)", minHeight: 170, containerType: "size" }}>
          <Marquee duration={46} className="h-full">
            {BROWSE_TOP5.map((item) => (
              <BrowseTile key={item.title} item={item} />
            ))}
          </Marquee>
        </div>
        {/* Requested in review: the cards should say they go deeper. */}
        <p
          className="w-full flex-none text-center font-mono uppercase"
          style={{ fontSize: "max(9px, calc(var(--mu) * 7px))", letterSpacing: "0.08em", color: "var(--muted-foreground)", opacity: 0.9 }}
        >
          Tap to learn more →
        </p>
      </div>
    </div>
  );
}
