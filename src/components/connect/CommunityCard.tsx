"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Star, X } from "lucide-react";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { WORLD_COLORS } from "@/components/app/worlds";
import { CompanyChip } from "./primitives";
import type { Community } from "./data";

// THE community card. One component, used on the Connect home and on every
// professional's profile (direct feedback, 5 Sept 2026: the cards must be
// the same wherever a community is shown).

// Each community wears its world's accent, the one it carries everywhere
// else in the app, mixed toward the dark base so white type stays legible.
export function communityAccent(community: Pick<Community, "world">): string {
  return WORLD_COLORS[community.world] ?? "var(--primary)";
}

// Figma's grain on the design-system posters is a procedural "Noise"
// layer; reproduced as a fine tiled monochrome grain blended in "overlay"
// mode at low opacity.
export const POSTER_GRAIN = "/images/connect/covers/grain.png";

// The CEO's own reference photography, cropped for the cards. 9 Sept 2026:
// swapped for a newer set with people visible in the scene (direct
// feedback: "there are people in the images ... lets try and use those").
export const PHOTO_COVER: Record<string, string> = {
  "teaching-education": "/images/connect/covers/photo6-teaching-education.png",
  "business-money": "/images/connect/covers/photo6-business-money.png",
  "tech-engineering": "/images/connect/covers/photo6-tech-engineering.png",
  "health-medicine": "/images/connect/covers/photo6-health-medicine.png",
  "arts-media": "/images/connect/covers/photo6-arts-media.png",
};

// Focal point per scene so the card strip frames the SUBJECT (the laptop,
// the towers, the monitors, the stethoscope, the studio desk), never an
// empty stretch of room.
export const PHOTO_FOCUS: Record<string, string> = {
  "teaching-education": "50% 60%",
  "business-money": "58% 55%",
  "tech-engineering": "50% 45%",
  "health-medicine": "55% 55%",
  "arts-media": "50% 55%",
};

function StatTile({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-[1px] rounded-[var(--radius-sm)] px-[2px] py-[9px]" style={{ background: "rgba(255,255,255,0.09)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>
      <span className="text-[17px] leading-[21px] font-extrabold tabular-nums" style={{ color: "#FFFFFF" }}>{value}</span>
      <span className="max-w-full truncate text-[10.5px] leading-[14px] font-semibold tracking-[-0.01em]" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
    </div>
  );
}

/** The "+N" chip on a community card. Hover previews the remaining
 *  companies; a tap opens the same list as a small sheet with a close, and it
 *  also closes on a tap outside, on Escape, or when the page scrolls away. */
function MoreMarks({ className, missing, names, open, onToggle, onClose }: { className: string; missing: number; names: string[]; open: boolean; onToggle: () => void; onClose: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", onClose, { passive: true, once: true });
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); window.removeEventListener("scroll", onClose); };
  }, [open, onClose]);
  return (
    <span ref={ref} className={`${className} group/more relative flex-none`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label={`${missing} more: ${names.join(", ")}`}
        aria-expanded={open}
        onClick={onToggle}
        className="dm-quiet flex h-[28px] cursor-pointer items-center rounded-[var(--radius-sm)] px-[9px] text-[12px] leading-[16px] font-bold"
        style={{ background: open ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", color: "#FFFFFF" }}
      >
        +{missing}{missing === 1 || className.includes("460px]:flex") ? " more" : ""}
      </button>
      <span
        role={open ? "dialog" : "tooltip"}
        aria-label="More companies"
        className={`absolute bottom-[calc(100%+8px)] left-0 z-30 flex-wrap items-center gap-[6px] rounded-[var(--radius-md)] border p-[8px] ${open ? "flex pr-[34px]" : "pointer-events-none hidden group-hover/more:flex group-focus-within/more:flex"}`}
        style={{ background: "rgba(12,16,35,0.96)", borderColor: "rgba(255,255,255,0.16)", boxShadow: "0 12px 30px -12px rgba(0,0,0,0.7)", minWidth: 120 }}
      >
        {names.map((name) => <CompanyChip key={name} name={name} tone="frost" />)}
        {open && (
          <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet absolute top-[6px] right-[6px] flex size-6 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </span>
    </span>
  );
}

/** `compact`: the flat reference row a professional profile shows (direct
 *  feedback, 8 Sept 2026: shrinking the same hero card's min-height still
 *  read as loud -- the full-bleed photo, 24px title and three stat tiles
 *  demanded the same attention regardless of the box it sat in). No photo
 *  hero, no stat tiles, no company row: a thumbnail, the name, the topic
 *  line, Open -- the board reads as a fact about the person, not a second
 *  headline competing with them. Same component everywhere a community is
 *  shown (direct feedback, 5 Sept 2026), just a genuinely quieter mode. */
function CompactCommunityRow({ community, onOpen }: { community: Community; onOpen: () => void }) {
  const accent = communityAccent(community);
  return (
    <button type="button" onClick={onOpen} className="dm-quiet group flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] p-[var(--space-3)] text-left" style={{ background: "var(--glass-surface-1)" }}>
      <span className="relative size-[52px] flex-none overflow-hidden rounded-[var(--radius-md)]" style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 45%, transparent)` }}>
        <Image src={PHOTO_COVER[community.id] ?? community.photo} alt="" fill sizes="52px" className="object-cover" style={{ objectPosition: PHOTO_FOCUS[community.id] ?? "60% 42%" }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] leading-[19px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{community.name.replace(/ Careers$/, "")}</span>
        <span className="block truncate text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{community.topics.join(" · ")}</span>
      </span>
      <span className="flex flex-none items-center gap-[3px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>
        Open <ArrowUpRight className="h-[14px] w-[14px] transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" aria-hidden strokeWidth={2.75} />
      </span>
    </button>
  );
}

export function CommunityCard({ community, joined, onOpen, onJoin, featured, compact = false }: { community: Community; joined: boolean; onOpen: () => void; onJoin: () => void; featured?: boolean; compact?: boolean }) {
  // which "+N" chip is open (2 or 3, by how many marks precede it); 0 = none
  const [moreOpen, setMoreOpen] = useState(0);
  const accent = communityAccent(community);
  if (compact) return <CompactCommunityRow community={community} onOpen={joined ? onOpen : onJoin} />;
  return (
    <div
      className="dm-tap group @container relative flex h-full min-h-[312px] flex-col overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${accent} 45%, transparent)`, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
    >
      {/* Our full-bleed photo, but dimmed and frosted so type wins: the photo
         runs at reduced brightness, the poster card's progressive blur
         ramps up from the folio over most of the card, a heavy bottom
         vignette sits under the tiles and rows, a light top scrim under the
         title, then the accent tint and grain. */}
      <span aria-hidden className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <Image src={PHOTO_COVER[community.id] ?? community.photo} alt="" fill sizes="640px" className="object-cover" style={{ objectPosition: PHOTO_FOCUS[community.id] ?? "60% 42%" }} />
        <CardProgressiveBlur size="40%" />
        <span
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, rgba(12,16,35,0.96) 0%, rgba(12,16,35,0.84) 26%, rgba(12,16,35,0.4) 52%, rgba(12,16,35,0.08) 72%, transparent 100%), ${cardTopScrim()}` }}
        />
      </span>
      {/* the whole card is the tap target (direct feedback) */}
      <button type="button" onClick={joined ? onOpen : onJoin} className="absolute inset-0 z-10 cursor-pointer">
        <span className="sr-only">Open {community.name}</span>
      </button>

      {featured && (
        <span className="absolute top-[14px] right-[16px] z-20 inline-flex items-center gap-[5px] rounded-[var(--radius-sm)] px-[11px] py-[4px] text-[11px] leading-[15px] font-medium" style={{ background: "rgba(9,10,20,0.72)", color: "#FFFFFF" }}>
          <Star className="h-[11px] w-[11px]" fill="currentColor" aria-hidden style={{ color: "#f5c04e" }} /> Most Popular
        </span>
      )}

      {/* Information in the Replit's order: name and category up top; four
         stat tiles; the companies row; one action at the right. */}
      <div className="pointer-events-none relative z-20 flex h-full w-full flex-col px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-4)]" style={{ fontFamily: "var(--font-display)" }}>
        {/* the title carries the card: bigger than anything under it */}
        <h3 className={`text-[24px] leading-[28px] font-extrabold text-balance ${featured ? "pr-[104px]" : ""}`} style={{ color: "#FFFFFF" }}>{community.name.replace(/ Careers$/, "")}</h3>

        {/* three tiles fill the card's width, the same on every card; the
           marks sit centred under them */}
        {/* three tiles: who is here, who answers, and from how many
           companies. Post counts came off (CEO, 4 Sept); companies stayed
           because a partner nonprofit reads them as reach. */}
        <div className="mt-auto grid grid-cols-3 gap-[8px] pt-[var(--space-5)]" style={{ textShadow: "none" }}>
          <StatTile value={community.students.toLocaleString("en-US")} label="Students" />
          <StatTile value={community.activePros} label="Pros" />
          <StatTile value={community.professionalsFrom.length} label="Companies" />
        </div>
        {/* one row closes the card: the marks left, the action right. No rule. */}
        {/* wraps when the column is narrow (two columns on a 768px tablet), so
           the company chips never run under the Open button */}
        <div className="pointer-events-auto mt-[10px] flex min-w-0 flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[8px]" style={{ textShadow: "none" }}>
          {/* two marks always (phones included), a third once the card is
             460px wide. The count chip says how many are missing; on hover it
             previews them, on tap it opens a small sheet with the rest that
             stays until closed (direct feedback, 5 Sept 2026). */}
          <div className="flex min-w-0 items-center gap-[6px]">
            {community.professionalsFrom.slice(0, 3).map((name, index) => (
              <span key={name} className={index < 2 ? "flex" : "hidden @[460px]:flex"}>
                {/* the two marks stay on phones, a step smaller below 400px so
                   the "+N" chip never runs into the Open button */}
                <span className="flex @[400px]:hidden"><CompanyChip name={name} tone="frost" size="sm" /></span>
                <span className="hidden @[400px]:flex"><CompanyChip name={name} tone="frost" /></span>
              </span>
            ))}
            {[2, 3].map((shown) => {
              const missing = community.professionalsFrom.length - shown;
              if (missing <= 0) return null;
              const vis = shown === 2 ? "flex @[460px]:hidden" : "hidden @[460px]:flex";
              return <MoreMarks key={shown} className={vis} missing={missing} names={community.professionalsFrom.slice(shown)} open={moreOpen === shown} onToggle={() => setMoreOpen((v) => (v === shown ? 0 : shown))} onClose={() => setMoreOpen(0)} />;
            })}
          </div>
          {/* a button that reads as one (direct feedback), without the blue:
             the solid dark fill the stat boxes used to have, so it is the one
             solid object on the card now that everything else is blur */}
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${community.name}`}
            className="dm-quiet group/cta flex min-h-[36px] flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[11px] text-[13px] leading-[18px] font-bold whitespace-nowrap @[400px]:gap-[7px] @[400px]:px-[14px]"
            style={{ background: `color-mix(in srgb, ${accent} 26%, rgba(12,16,35,0.78))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 45%, rgba(255,255,255,0.18))`, color: "#FFFFFF" }}
          >
            Open <ArrowUpRight className="h-[14px] w-[14px] transition-transform duration-200 group-hover/cta:translate-x-[2px] group-hover/cta:-translate-y-[2px]" aria-hidden strokeWidth={2.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
