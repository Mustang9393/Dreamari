"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeftRight, Bookmark, Check, ChevronDown, ChevronRight, GraduationCap, Landmark, MapPin } from "lucide-react";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { OpenCue } from "@/components/app/PosterCard";
import { announce } from "@/components/app/LiveRegion";
import { SMALL } from "@/components/career/CareerDetailExperience";
import { ADMISSION_WORD, CONTROL_WORD, LEVEL_WORD, collegeImage, collegeMark, compact, milesFromHome, milesLabel, type College } from "./data";

// One accent for the whole feature: colleges have no world, so they borrow
// the app's primary blue. Cards for tribal colleges, trade schools etc. do
// not get their own colours; difference is said in words.
export const ACCENT = "var(--primary)";
export const SOFT = "var(--accent-subtle)";
export const RULE = "rgba(255,255,255,0.12)";

/** The three words under a college's name, everywhere. */
export function tags(c: College): string[] {
  return [LEVEL_WORD[c.level], CONTROL_WORD[c.control], c.setting];
}

export function pct(n: number | null): string {
  return n === null ? "Not published" : `${n}%`;
}

/** Saved colleges live in the browser only (prototype). Read through a
 *  store subscription so the server renders "nothing saved" and the client
 *  catches up without setting state inside an effect. */
const KEY = "dm-colleges-saved";
const EVENT = "dm-colleges-saved-change";
function readRaw(): string { try { return window.localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; } }
function subscribe(cb: () => void) { window.addEventListener(EVENT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); }; }
export function useSaved(): [Set<string>, (slug: string) => void] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const saved = useMemo(() => { try { return new Set(JSON.parse(raw) as string[]); } catch { return new Set<string>(); } }, [raw]);
  const toggle = (slug: string) => {
    const next = new Set(saved);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    try { window.localStorage.setItem(KEY, JSON.stringify([...next])); } catch { /* private mode */ }
    window.dispatchEvent(new Event(EVENT));
  };
  return [saved, toggle];
}

// The one school the student is leaning toward (the Replit's "Make my #1").
// Same storage idiom as saved; setting it also saves the school.
const TOP_KEY = "dm-colleges-top";
const TOP_EVENT = "dm-colleges-top-change";
function readTop(): string { try { return window.localStorage.getItem(TOP_KEY) ?? ""; } catch { return ""; } }
function subscribeTop(cb: () => void) { window.addEventListener(TOP_EVENT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(TOP_EVENT, cb); window.removeEventListener("storage", cb); }; }
export function useTopSchool(): [string | null, (slug: string | null) => void] {
  const raw = useSyncExternalStore(subscribeTop, readTop, () => "");
  const set = (slug: string | null) => {
    try {
      if (slug) {
        window.localStorage.setItem(TOP_KEY, slug);
        const saved = new Set<string>(JSON.parse(readRaw()) as string[]);
        if (!saved.has(slug)) { saved.add(slug); window.localStorage.setItem(KEY, JSON.stringify([...saved])); window.dispatchEvent(new Event(EVENT)); }
      } else window.localStorage.removeItem(TOP_KEY);
    } catch { /* private mode */ }
    window.dispatchEvent(new Event(TOP_EVENT));
  };
  return [raw || null, set];
}

/** The picture at the top of a card or a page: the campus photo when we have
 *  one, otherwise a quiet colour field with the college's mark. */
export function CollegePicture({ c, sizes, priority = false, className = "", position }: { c: College; sizes: string; priority?: boolean; className?: string; /** CSS object-position for the cover crop; default centre */ position?: string }) {
  const img = collegeImage(c);
  const mark = collegeMark(c);
  return (
    <span className={`relative block overflow-hidden ${className}`} style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, #0e0c20) 0%, #0e0c20 60%, color-mix(in srgb, var(--hero-accent-teal) 22%, #0e0c20) 100%)" }} aria-hidden>
      {img ? (
        <Image src={img} alt="" fill sizes={sizes} priority={priority} className="object-cover" style={position ? { objectPosition: position } : undefined} />
      ) : mark ? (
        <Image src={mark} alt="" fill sizes="120px" className="object-contain p-[18%] opacity-90" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center"><GraduationCap className="h-10 w-10" style={{ color: "rgba(255,255,255,0.45)" }} /></span>
      )}
    </span>
  );
}

/** Bookmark toggle, same everywhere. */
export function SaveButton({ on, onToggle, size = 40 }: { on: boolean; onToggle: () => void; size?: number }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Saved. Tap to remove" : "Save this college"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      className="dm-quiet flex flex-none cursor-pointer items-center justify-center rounded-full border"
      style={{ width: size, height: size, borderColor: on ? ACCENT : "rgba(255,255,255,0.22)", background: on ? "color-mix(in srgb, var(--primary) 22%, rgba(12,16,35,0.6))" : "rgba(12,16,35,0.55)", color: on ? SOFT : "#fff", backdropFilter: "blur(8px)" }}
    >
      <Bookmark className="h-[18px] w-[18px]" fill={on ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}

/** The college's mark on a white disc: seals and logos were drawn for
 *  white paper, so they read there; a letter stands in when we have none. */
/** Deterministic hue per school, so the monogram fallbacks (five of thirty
 *  have no mark) read as five different schools, not one placeholder. */
function slugHue(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360;
  return h;
}

export function MarkBadge({ c, size = 44, ring = "dark" }: { c: College; size?: number; /** "light": translucent white ring for sitting on a photo */ ring?: "dark" | "light" }) {
  const mark = collegeMark(c);
  const ringColor = ring === "light" ? "rgba(255,255,255,0.55)" : "#0e0c20";
  return (
    <span
      className="relative flex flex-none items-center justify-center overflow-hidden rounded-full border-2"
      style={{ width: size, height: size, background: mark ? "#fff" : `hsl(${slugHue(c.slug)} 42% 30%)`, borderColor: ringColor, boxShadow: "0 6px 18px -6px rgba(0,0,0,0.6)" }}
      aria-hidden
    >
      {mark ? (
        <Image src={mark} alt="" fill sizes={`${size * 2}px`} className="object-contain p-[12%]" />
      ) : (
        <span className="leading-none font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: Math.round(size * 0.42), color: "#fff" }}>{c.name[0]}</span>
      )}
    </span>
  );
}

/** The result card: the community card's full-bleed frosted cover, the
 *  college's mark as a profile picture beside its name at the top (never
 *  under the words), two sentences low on the frost, three words, Compare.
 *  The whole card opens the college. Photo stays at full brightness and
 *  colour (direct feedback, 8 Sept 2026: next to Explore's vivid poster
 *  cards, a constant brightness/saturation cut plus a heavy blur and a
 *  double gradient wash made Explore Schools read as the diluted,
 *  placeholder version of the same idea) -- only a bottom scrim earns its
 *  keep, the same restraint PosterCard's own photo treatment uses. */
export type CardBadge = { label: string; tone: "program" | "path" | "reach" | "target" | "safety" | "open" | "muted" };
const BADGE_STYLE: Record<CardBadge["tone"], React.CSSProperties> = {
  program: { background: "rgba(255,255,255,0.92)", color: "#0e0c20" },
  path: { background: "rgba(47,107,242,0.85)", color: "#fff" },
  reach: { background: "rgba(255,160,30,0.9)", color: "#1a1200" },
  target: { background: "rgba(40,140,255,0.9)", color: "#fff" },
  safety: { background: "rgba(51,199,140,0.9)", color: "#03211a" },
  open: { background: "rgba(30,185,170,0.9)", color: "#032220" },
  muted: { background: "rgba(255,255,255,0.14)", color: "#fff" },
};

export function CollegeCard({ c, saved, onSave, compared, onCompare, href, badges, subline, hideTags = false, stats = false }: { /** Explore Schools: a three-number stat row (acceptance, price after aid, finish rate) instead of the two sentences */ stats?: boolean; c: College; saved: boolean; onSave: () => void; compared: boolean; onCompare?: () => void; /** carry the career route into the detail page */ href?: string; /** Explore Schools "For you": one fit chip, at most two */ badges?: CardBadge[]; /** one plain line under the place, e.g. the programme that matches the path */ subline?: string; /** For you: the 4-year / Public / City tags are noise next to the fit chip */ hideTags?: boolean }) {
  const img = collegeImage(c);
  return (
    // `poster-card`/`poster-photo` are the exact same hover classes Explore's
    // PosterCard uses (globals.css) -- direct feedback, 9 Sept 2026: college
    // results should lift and pop the same way career posters do, not the
    // much quieter image-only zoom this had before. Reusing the shared
    // classes (rather than a second hand-tuned hover) keeps the two card
    // families feeling like one interaction language.
    <article
      className="dm-tap poster-card relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${ACCENT} ${compared ? 70 : 40}%, transparent)`, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
    >
      <span aria-hidden className="poster-photo absolute inset-0">
        {img ? (
          <Image src={img} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : collegeMark(c) ? (
          // No campus photo: the school's own mark, big, soft and dimmed,
          // becomes the cover so every card gets the same photo-and-blur
          // treatment (direct feedback, 10 Sept 2026).
          <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, #0e0c20) 0%, #0e0c20 65%)" }}>
            <Image src={collegeMark(c)!} alt="" fill sizes="480px" className="object-contain opacity-[0.55] blur-[10px]" style={{ transform: "scale(1.9) translateY(-8%)" }} />
          </span>
        ) : (
          <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 34%, #0e0c20) 0%, #0e0c20 60%, color-mix(in srgb, var(--hero-accent-teal) 24%, #0e0c20) 100%)" }} />
        )}
        <CardProgressiveBlur size="40%" />
        {/* one bottom scrim for the name and stats, not a top-and-bottom
           double wash -- the photo above it stays as vivid as Explore's */}
        <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.96) 0%, rgba(12,16,35,0.84) 26%, rgba(12,16,35,0.4) 52%, rgba(12,16,35,0.08) 72%, transparent 100%)" }} />
        <span className="absolute inset-x-0 top-0 h-[80px]" style={{ background: cardTopScrim() }} />
      </span>
      {/* Same centered "this opens" cue PosterCard uses, at OpenCue's own
         (low) z-index -- below the text content's z-20, not above it,
         so the dim and the icon only ever show over the photo, never
         additionally darkening the always-visible name/stats text (direct
         feedback, 9 Sept 2026). The icon still reads fine: it lands in the
         card's own vertical gap between the profile row and the stats
         paragraph, where that content layer has nothing opaque painted. */}
      <OpenCue />
      <Link href={href ?? `/colleges/${c.slug}`} className="absolute inset-0 z-10 rounded-[inherit]" aria-label={`Open ${c.name}`} />
      <span className="absolute top-[14px] right-[14px] z-20"><SaveButton on={saved} onToggle={onSave} size={36} /></span>


      <div className="pointer-events-none relative z-20 flex h-full w-full flex-col px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-4)]" style={{ fontFamily: "var(--font-display)" }}>
        {/* profile row: the mark, then the name and place beside it */}
        {badges && badges.length > 0 && (
          // in the flow, above the name, so a long programme name wraps and
          // pushes the row down instead of printing over it
          <ul className="mb-[12px] flex max-w-[calc(100%-44px)] flex-wrap gap-[5px]" aria-label="How this school fits your path" style={{ textShadow: "none" }}>
            {badges.filter((b) => b.label).map((b) => (
              <li key={b.label} className="rounded-[var(--radius-sm)] px-[8px] py-[3px] text-[11px] leading-[14px] font-extrabold tracking-[0.04em] uppercase" style={BADGE_STYLE[b.tone]}>{b.label}</li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-[12px] pr-[44px]">
          <MarkBadge c={c} size={44} />
          <div className="flex min-w-0 flex-col gap-[2px]">
            <h3 className="text-[18px] leading-[22px] font-extrabold text-balance" style={{ color: "#FFFFFF" }}>{c.name}</h3>
            <p className="text-[13px] leading-[17px] font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)" }}>{c.city}, {c.stateName}</p>
            {subline && <p className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.72)", fontFamily: "var(--font-body)" }}>{subline}</p>}
          </div>
        </div>

        {stats ? (
          <dl className="mt-auto grid grid-cols-3 gap-[var(--space-2)] pt-[var(--space-6)]" style={{ fontFamily: "var(--font-body)", textShadow: "none" }}>
            {[
              { v: c.admitRate === null ? "Open" : `${c.admitRate}%`, k: "acceptance" },
              { v: c.netPrice === null ? "—" : `$${Math.round(c.netPrice / 1000)}K`, k: "after aid" },
              { v: c.finish === null ? "—" : `${c.finish}%`, k: "finish" },
            ].map((x) => (
              <div key={x.k} className="flex min-w-0 flex-col">
                <dd className="m-0 text-[17px] leading-[20px] font-extrabold" style={{ color: "#FFFFFF", fontFamily: "var(--font-display)" }}>{x.v}</dd>
                <dt className="text-[11px] leading-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{x.k}</dt>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-auto pt-[var(--space-6)] text-[15px] leading-[21px] font-semibold" style={{ color: "#FFFFFF", fontFamily: "var(--font-body)" }}>
            Acceptance rate: {c.admitRate === null ? "Everyone gets in" : `${c.admitRate}%`}
            <span className="block" style={{ color: "rgba(255,255,255,0.78)" }}>Undergraduate enrollment: {compact(c.undergrads)}</span>
          </p>
        )}
        <div className="pointer-events-auto mt-[10px] flex items-center justify-between gap-[var(--space-3)] border-t pt-[10px]" style={{ borderColor: "rgba(255,255,255,0.22)", textShadow: "none", fontFamily: "var(--font-body)" }}>
          <ul className="flex min-w-0 flex-wrap items-center gap-[6px]" aria-label="About this college">
            {(hideTags ? [] : tags(c)).map((t) => <li key={t} className="rounded-[var(--radius-sm)] px-[8px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>{t}</li>)}
          </ul>
          {onCompare && (
            <button type="button" aria-pressed={compared} onClick={(e) => { e.preventDefault(); onCompare(); }} className="dm-quiet relative z-20 flex min-h-[32px] flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[10px] text-[12.5px] leading-[16px] font-bold" style={{ color: "#fff", background: compared ? `color-mix(in srgb, ${ACCENT} 45%, transparent)` : "rgba(255,255,255,0.08)" }}>
              <Landmark className="h-[13px] w-[13px]" aria-hidden /> {compared ? "Comparing" : "Compare"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** Outlined chips, the Replit's signal language: DIRECT PATH / 2-YEAR START /
 *  TRADE & TECHNICAL for the route, REACH / TARGET / SAFETY / OPEN ADMISSION
 *  for fit. Tinted text on a faint fill so they read without shouting. */
const CHIP_TONE: Record<CardBadge["tone"], string> = {
  program: "#ffffff",
  path: "var(--accent-subtle)",
  reach: "#ffb35c",
  target: "#7db2ff",
  safety: "#5fd6a8",
  open: "#e6cf6a",
  muted: "rgba(255,255,255,0.7)",
};
function Chip({ label, tone }: CardBadge) {
  const c = CHIP_TONE[tone];
  return (
    <span className="rounded-full border px-[8px] py-[2px] text-[10.5px] leading-[14px] font-extrabold tracking-[0.06em] uppercase whitespace-nowrap" style={{ color: c, borderColor: `color-mix(in srgb, ${c} 45%, transparent)`, background: `color-mix(in srgb, ${c} 10%, transparent)` }}>{label}</span>
  );
}
const PATH_WORD: Record<College["level"], string> = { "Bachelor's degrees": "Direct path", "Associate degrees": "2-year start", "Certificates": "Trade & technical" };

/** The school card, laid out like the Replit reference (direct feedback, 11
 *  Sept 2026: its cards "deliver information a lot better, uncluttered"):
 *  a short photo band with the mark overlapping its edge, then everything
 *  else on the solid card surface, top to bottom in the order a student
 *  skims: name and place, the programme with its route and fit chips, three
 *  plain figures, Why this school?, actions. No text over photos, no glass
 *  tiles. The whole card opens the school. */
export function SchoolCard({
  c,
  saved,
  onSave,
  compared,
  onCompare,
  href,
  program,
  fit,
  why,
  onDismiss,
  extraChip,
}: {
  c: College;
  saved: boolean;
  onSave: () => void;
  compared: boolean;
  onCompare?: () => void;
  href?: string;
  /** the programme that lines up with the student's path; its route chip
   *  (Direct path / 2-year start / Trade & technical) always shows with it,
   *  even when a whole row says the same (direct feedback, 11 Sept 2026:
   *  "if it's logically there let it stay") */
  program?: string;
  /** Target / Safety / Reach / Open admission, only where the rail title doesn't already say it */
  fit?: CardBadge;
  /** one sentence behind "Why this school?" (the Replit's link) */
  why?: string;
  /** "Not for me": hides the school from For you */
  onDismiss?: () => void;
  /** one more chip after the route and fit chips, e.g. "Target at 3.9" */
  extraChip?: CardBadge;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const img = collegeImage(c);
  const mark = collegeMark(c);
  // The Replit's three figures: acceptance, price after aid, miles from home.
  const miles = milesFromHome(c);
  const stats = [
    { v: c.admitRate === null ? "Open" : `${c.admitRate}%`, k: "acceptance" },
    { v: c.netPrice === null ? "—" : `$${Math.round(c.netPrice / 1000)}K`, k: "avg. after aid" },
    miles !== null ? { v: milesLabel(miles), k: "from home" } : { v: c.finish === null ? "—" : `${c.finish}%`, k: "finish" },
  ];
  const ghost: React.CSSProperties = { borderColor: "rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)" };
  return (
    <article
      className="dm-tap poster-card school-card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border"
      style={{ background: "var(--card)", borderColor: compared ? ACCENT : "var(--glass-border)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", fontFamily: "var(--font-body)" }}
    >
      {/* the photo runs down behind the name and place, blurring and fading
         into the card surface (direct feedback, 11 Sept 2026); everything
         from the programme down sits on the solid card */}
      <span aria-hidden className="poster-photo absolute inset-x-0 top-0 h-[300px] overflow-hidden">
        {img ? (
          <Image src={img} alt="" fill sizes="(min-width: 1024px) 340px, 86vw" className="object-cover" />
        ) : (
          /* No campus photo yet: a quiet brand field with the mark crisp and
             small at its centre. The blown-up blurred mark it replaces read
             as a broken image (direct feedback, 11 Sept 2026). */
          <span className="absolute inset-0 flex items-center justify-center" style={{ background: "radial-gradient(120% 90% at 30% 20%, color-mix(in srgb, var(--primary) 34%, var(--card)) 0%, var(--card) 60%), linear-gradient(160deg, var(--card), color-mix(in srgb, var(--hero-accent-teal) 26%, var(--card)))" }}>
            <span className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.028) 0 2px, transparent 2px 14px)" }} />
            {mark && <span className="relative mb-[36px] flex size-[72px] items-center justify-center rounded-full bg-white/95" style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.6)" }}><Image src={mark} alt="" width={48} height={48} className="object-contain" /></span>}
          </span>
        )}
        <CardProgressiveBlur size="62%" />
        {/* the name and place sit in the lower third of this run: blurred
           photo still showing through, fading to the solid card just below */}
        <span className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--card) 0%, color-mix(in srgb, var(--card) 72%, transparent) 16%, color-mix(in srgb, var(--card) 40%, transparent) 38%, transparent 62%)" }} />
        <span className="absolute inset-x-0 top-0 h-[64px]" style={{ background: cardTopScrim() }} />
        {/* Hover cue, school cards only (direct feedback, 11 Sept 2026): a
           labelled pill, not a bare chevron, centred on the photo band. Uses
           the poster-card hover rules (dim + cue) from globals.css. */}
        {/* the dim covers the whole photo run, not just the cue band: a
           band-sized dim drew a hard line across the picture on hover */}
        <span className="poster-dim pointer-events-none absolute inset-0 z-[1]" style={{ background: "rgba(5,8,20,0.28)" }} />
        <span className="absolute inset-x-0 top-0 h-[150px]">
          <span
            className="poster-cue pointer-events-none absolute top-1/2 left-1/2 z-[2] flex h-[40px] items-center gap-[4px] rounded-full border pl-[16px] pr-[12px] text-[13.5px] font-bold whitespace-nowrap backdrop-blur-[8px]"
            style={{ background: "rgba(5,8,20,0.62)", borderColor: "rgba(255,255,255,0.5)", color: "#fff", boxShadow: "0 10px 28px -8px rgba(0,0,0,0.7)", textShadow: "none" }}
          >
            View school <ChevronRight className="h-[16px] w-[16px]" strokeWidth={2.75} aria-hidden />
          </span>
        </span>
      </span>
      <Link href={href ?? `/colleges/${c.slug}`} className="absolute inset-0 z-10 rounded-[inherit]" aria-label={`Open ${c.name}`} />
      <span className="absolute top-[12px] right-[12px] z-20"><SaveButton on={saved} onToggle={() => { onSave(); announce(saved ? `Removed ${c.name} from saved` : `Saved ${c.name}`); }} size={36} /></span>

      <div className="pointer-events-none relative z-20 flex flex-1 flex-col gap-[12px] px-[16px] pt-[118px] pb-[14px]">
        {/* mark, name and place, over the blurred tail of the photo */}
        {/* Mark beside the name like a profile picture, centred on the
           name + place block, so the mark-to-name relationship is identical
           whether the name runs one line or two (direct feedback, 11 Sept
           2026: stacking it above made the gap or the mark's height vary).
           The block reserves two name lines and sits at its foot, so rows
           still align across cards. */}
        <div className="flex min-h-[77px] flex-col justify-end" style={{ textShadow: CARD_TEXT_SHADOW }}>
          <div className="flex items-center gap-[10px]">
            <MarkBadge c={c} size={44} />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <h3 className="line-clamp-2 text-[17px] leading-[21px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{c.name}</h3>
              {/* wraps rather than truncates; the block above reserves the
                 second line (two name lines + two place lines = 77) */}
              <p className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>
                <MapPin className="mr-[4px] inline-block h-[12px] w-[12px] align-[-1px]" aria-hidden />{c.city}, {c.state} · {c.control} · {LEVEL_SHORT[c.level]}
              </p>
            </div>
          </div>
        </div>

        {(program || fit || extraChip) && (
          <div className="flex min-h-[24px] flex-wrap items-center gap-x-[8px] gap-y-[6px]">
            {program && (
              <span className="flex min-w-0 items-center gap-[4px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
                <span className="truncate">{program}</span> <Check className="h-[13px] w-[13px]" strokeWidth={3} aria-hidden style={{ color: SOFT }} />
              </span>
            )}
            {program && <Chip label={PATH_WORD[c.level]} tone="path" />}
            {fit && <Chip label={fit.label} tone={fit.tone} />}
            {extraChip && <Chip label={extraChip.label} tone={extraChip.tone} />}
          </div>
        )}

        <dl className="grid grid-cols-3 gap-[8px] border-t pt-[10px]" style={{ borderColor: RULE }}>
          {stats.map((x) => (
            <div key={x.k} className="flex min-w-0 flex-col">
              <dd className="m-0 text-[15px] leading-[19px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{x.v}</dd>
              <dt className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{x.k}</dt>
            </div>
          ))}
        </dl>

        {why && (
          <div className="pointer-events-auto relative z-20">
            <button type="button" aria-expanded={showWhy} onClick={(e) => { e.preventDefault(); setShowWhy((v) => !v); }} className="dm-link -my-[10px] flex cursor-pointer items-center gap-[3px] py-[10px] text-[13px] font-bold" style={{ color: SOFT }}>
              Why this school? <ChevronDown className={`h-[14px] w-[14px] transition-transform ${showWhy ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {showWhy && <p className="mt-[4px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{why}</p>}
          </div>
        )}

        {/* Two quiet actions at most (direct feedback, 11 Sept 2026): opening
           the school is the whole card (hover cue), so there is no View
           button and neither of these reads as the primary. "Not for me" is
           plain text on the left; Compare is a ghost button on the right. */}
        {(onCompare || onDismiss) && (
          <div className="pointer-events-auto relative z-20 mt-auto flex items-center justify-between gap-[8px] pt-[2px]">
            {onDismiss ? (
              <button type="button" onClick={(e) => { e.preventDefault(); onDismiss(); announce(`Hidden ${c.name}`); }} className="dm-link -my-[12px] cursor-pointer py-[12px] text-[12.5px] font-bold" style={{ color: "rgba(255,255,255,0.62)" }}>Not for me</button>
            ) : <span />}
            {onCompare && (
              <button type="button" aria-pressed={compared} onClick={(e) => { e.preventDefault(); onCompare(); announce(compared ? `Removed ${c.name} from compare` : `Comparing ${c.name}`); }} className="dm-quiet flex min-h-[34px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[12px] text-[12.5px] font-bold" style={compared ? { borderColor: ACCENT, background: `color-mix(in srgb, ${ACCENT} 28%, transparent)`, color: "#fff" } : ghost}>
                <ArrowLeftRight className="h-[13px] w-[13px]" aria-hidden /> {compared ? "Comparing" : "Compare"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
const LEVEL_SHORT: Record<College["level"], string> = { "Certificates": "Trade school", "Associate degrees": "2-year", "Bachelor's degrees": "4-year" };

/** A label on the left, a figure on the right, one hairline under. */
export function Row({ label, value, note, last = false, tone = "ink" }: { label: string; value: React.ReactNode; note?: string; last?: boolean; tone?: "ink" | "muted" }) {
  return (
    <div className={`flex items-baseline justify-between gap-[var(--space-4)] py-[10px] ${last ? "" : "border-b"}`} style={{ borderColor: RULE }}>
      <span className="flex min-w-0 flex-col">
        <span className={SMALL} style={{ color: "var(--foreground)" }}>{label}</span>
        {note && <span className="text-[12.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
      </span>
      <span className={`${SMALL} max-w-[48%] shrink-0 tabular-nums text-right ${tone === "ink" ? "font-bold" : "font-semibold"}`} style={{ color: tone === "ink" ? "var(--foreground)" : "var(--muted-foreground)" }}>{value}</span>
    </div>
  );
}

export const admissionWord = (c: College) => (c.admitRate === null ? ADMISSION_WORD.open : `${c.admitRate}% get in`);
