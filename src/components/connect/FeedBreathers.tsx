"use client";

// Connect feed v2: breathers and quote cards (2 Oct 2026). Joshua: "most
// professional answers are text-based and visually similar, scrolling feels
// repetitive and dense... every 3-5 regular posts introduce a more visual
// card... relevant to the student, not like ads... use existing Dreamari
// imagery we have already QA'd... sparingly, let it breathe." Chandu: the
// career card must be "intentional and valuable rather than just repeating
// content", and generated insight cards must be "tasteful, like when you
// share lyrics from Spotify or Apple Music to your stories".
//
// Rhythm: one breather after every fifth post, never in the first three,
// never two in a row. Same width and chrome as the posts. Each carries a
// small muted line at the bottom saying why it is here (X and LinkedIn's
// "suggested" convention; the line separates relevance from advertising).
//
// DEMO-ONLY: behind `?feed=2` and the Feed chip, default off, so this
// week's demos see the feed exactly as before. Since 4 Oct 2026 the chip
// only switches a board's Questions and Posts lists. The main Feed has one
// layout, the rhythm in feed/rankFeed.ts (composeFeed), which replaced both
// its v1 (a people strip every fifth post) and its v2 breather rotation
// (Joshua: one visual after about every three posts, never two in a row,
// and fewer kinds of card). Its visual moments are PlayBreather and
// OpportunityBreather below, plus a pro's own graphic post.

import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { ALL_CATALOG_CAREERS, type CatalogCareer } from "@/components/app/catalog";
import { WORLD_COLORS } from "@/components/app/worlds";
import { careerSlug } from "@/components/career/slug";
import { COMMUNITIES, EVENTS, PROS, type Community, type Insight, type InsightGraphic, type Pro } from "./data";
import { Avatar, CompanyMark, ProAvatar } from "./primitives";
import { ALL_PROFILE_CAREERS, DEMO_TOP3 } from "@/components/profile/data";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { findOpportunity, INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "@/components/opportunities/data";
import { fitFor, timing, today, useStudent, worldToField } from "@/components/opportunities/match";
import { AwardChip, closesShort } from "@/components/opportunities/Card";
import { OrgMark } from "@/components/opportunities/OrgMark";
import type { Item } from "@/components/opportunities/types";
import { GLOSSARY_GAMES, INVESTMENT_BANKING, REGISTERED_NURSE, SIMULATIONS } from "@/components/play/games";
import { hasGlossary } from "@/components/glossary/data";

// ---- the switch ---------------------------------------------------------------

const readInitial = (): "v1" | "v2" => {
  if (typeof window === "undefined") return "v1";
  try {
    // the link turns it on for the session: board and tab changes rewrite
    // the URL and would otherwise drop it
    if (new URLSearchParams(window.location.search).get("feed") === "2") { window.sessionStorage.setItem("dreamari:connect-feed", "v2"); return "v2"; }
    return window.sessionStorage.getItem("dreamari:connect-feed") === "v2" ? "v2" : "v1";
  } catch { return "v1"; }
};
let mode: "v1" | "v2" = readInitial();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export function setFeedVersion(v: "v1" | "v2") {
  mode = v;
  if (typeof window !== "undefined") {
    try { window.sessionStorage.setItem("dreamari:connect-feed", v); } catch { /* fine */ }
    const url = new URL(window.location.href);
    if (v === "v2") url.searchParams.set("feed", "2"); else url.searchParams.delete("feed");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  emit();
}
export function useFeedV2(): boolean {
  useEffect(() => {
    // the module may have loaded on the server; re-read once on the client
    const want = readInitial();
    if (want !== mode) { mode = want; emit(); }
  }, []);
  return useSyncExternalStore(subscribe, () => mode === "v2", () => false);
}
export function FeedVersionChip() {
  const v2 = useFeedV2();
  const opts: { key: "v1" | "v2"; label: string }[] = [{ key: "v1", label: "v1" }, { key: "v2", label: "v2 Breathers" }];
  return (
    <div role="tablist" aria-label="Feed layout" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
      {opts.map((o) => {
        const on = (o.key === "v2") === v2;
        return (
          <button key={o.key} type="button" role="tab" aria-selected={on} onClick={() => setFeedVersion(o.key)} className="dm-quiet cursor-pointer rounded-[4px] px-[7px] py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.04em] uppercase" style={{ background: on ? "color-mix(in srgb, var(--foreground) 12%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- shared bits ---------------------------------------------------------------

const INK = "#0e0c20";
const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const proById = (id: string): Pro | undefined => PROS.find((p) => p.id === id);
const firstSentence = (s: string, max = 150): string => {
  const m = s.match(/^[^.!?]+[.!?]/);
  const first = (m ? m[0] : s).trim();
  return first.length > max ? first.slice(0, max - 1).trimEnd() + "…" : first;
};

/** The same Top 3 the Profile shows (stored picks, else the demo default). */
function useTop3() {
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return useMemo(() => {
    const ids = stored.ids.filter((id) => ALL_PROFILE_CAREERS.some((c) => c.id === id));
    return (ids.length ? ids : DEMO_TOP3).map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)!).filter(Boolean);
  }, [stored]);
}

/** Inside the main Feed, which is a ruled column with no boxes (Twitter's
 *  shape), breathers drop their card chrome and sit as a row like the posts
 *  around them; the "why" line moves above, where X puts "Suggested". */
const FlatCtx = createContext(false);
/** The main Feed's post text line: row padding + 44px avatar + 14px gap. */
export const FEED_TEXT_INSET = "pl-[calc(var(--space-5)+58px)] sm:pl-[calc(var(--space-6)+58px)]";
export function FlatBreathers({ children }: { children: React.ReactNode }) {
  return <FlatCtx.Provider value>{children}</FlatCtx.Provider>;
}

function Shell({ children, why, onClick, href }: { children: React.ReactNode; why: string; onClick?: () => void; href?: string }) {
  const flat = useContext(FlatCtx);
  const whyLine = <span className={`block text-[11.5px] leading-[15px] font-semibold ${flat ? "mb-[10px]" : "mt-[12px]"}`} style={{ color: "var(--muted-foreground)" }}>{why}</span>;
  // In the Feed the hover is the posts' own: a soft fill inside the row.
  const inner = flat
    ? <><span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-1)" }} /><span className="relative block">{whyLine}{children}</span></>
    : <>{children}{whyLine}</>;
  // In the Feed, content starts on the posts' text line, not their avatars
  // (Chandu, 2 Oct 2026: "the content should always align with the text in
  // the normal posts, not the profile pictures"): the post row's padding
  // plus its 44px avatar and 14px gap. Taller too ("they can be taller").
  // No tinted ground in the Feed (4 Oct 2026): every visual moment there
  // shares one treatment, the "why" line above and the content on the
  // posts' text line on the Feed's own ground, so an opportunity reads as
  // part of the Feed and not as an ad block (Joshua: "the Feed must not
  // feel like several products combined").
  const cls = flat ? `dm-tap group relative block w-full py-[24px] pr-[var(--space-5)] text-left sm:pr-[var(--space-6)] ${FEED_TEXT_INSET}` : "dm-tap group relative block w-full rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left";
  const style = flat ? undefined : { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" };
  if (href) return <Link href={href} className={cls} style={style}>{inner}</Link>;
  return <div className={cls} style={style} onClick={onClick}>{inner}</div>;
}

// ---- 1. The career behind this conversation -----------------------------------------

const seenCareers = new Set<string>();

export function CareerBehindCard({ community, onAskThem }: { community: Community; onAskThem: () => void }) {
  const flat = useContext(FlatCtx);
  const top3 = useTop3();
  const career = useMemo<CatalogCareer | null>(() => {
    const topTitles = new Set(top3.map((c) => c.title));
    const pool = ALL_CATALOG_CAREERS.filter((c) => c.world === community.world && !topTitles.has(c.title) && !seenCareers.has(c.title));
    const pick = pool[0] ?? ALL_CATALOG_CAREERS.find((c) => c.world === community.world) ?? null;
    if (pick) seenCareers.add(pick.title);
    return pick;
  // once per mount, on purpose: the pick must not change as the student scrolls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community.id]);
  const pros = useMemo(() => PROS.filter((p) => p.world === community.world).sort((a, b) => a.activeDaysAgo - b.activeDaysAgo).slice(0, 3), [community.world]);
  if (!career) return null;
  const voice = pros[0];
  const color = WORLD_COLORS[career.world] ?? "var(--primary)";
  return (
    <Shell why={`The career behind these answers · ${community.name}`}>
      <div className="flex items-stretch gap-[14px]">
        <Link href={`/career/${careerSlug(career.title)}`} className={`relative block flex-none overflow-hidden rounded-[10px] ${flat ? "w-[120px]" : "w-[88px]"}`} style={{ background: INK }}>
          <span className="block aspect-[3/4]" />
          <Image src={career.photo} alt="" fill sizes="88px" className="object-cover" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: color }} />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-[17px] leading-[22px] font-extrabold" style={{ ...DISPLAY, color: "var(--foreground)" }}>{career.title}</h3>
          {voice && <p className="mt-[4px] line-clamp-2 text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>“{firstSentence(voice.story, 120)}” <span className="font-semibold" style={{ color: "var(--foreground)" }}>{voice.name.split(" ")[0]}</span></p>}
          <div className="mt-auto flex flex-wrap items-center gap-[10px] pt-[10px]">
            {pros.length > 0 && (
              <span className="flex items-center">
                {pros.map((p, i) => <span key={p.id} className="rounded-full border-2" style={{ marginLeft: i ? -8 : 0, borderColor: "var(--card, #111)", zIndex: 3 - i }}><ProAvatar proId={p.id} name={p.name} size={26} /></span>)}
              </span>
            )}
            <button type="button" onClick={onAskThem} className="dm-solid flex min-h-[32px] cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] px-[12px] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Ask them</button>
            <Link href={`/career/${careerSlug(career.title)}`} className="dm-link flex min-h-[32px] items-center gap-[2px] text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>Explore the career <ChevronRight className="h-3.5 w-3.5" aria-hidden /></Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ---- 2. Your #1 on Connect: removed ------------------------------------------------------
//
// "Your #1 career · 13 answers about UI/UX Designer" (TopPickOnConnect) was
// removed from the Feed and the boards on 4 Oct 2026 (Joshua asked for it to
// go entirely): it was one more kind of card in a Feed that already had too
// many, and it pointed back at answers the Feed itself shows.

// ---- 3. An opportunity in this field -----------------------------------------------------

/** What the card is, in one word: "Internship", "Scholarship"... */
function opportunityKind(i: Item): string {
  if (i.type === "scholarship") return "Scholarship";
  if (i.kind === "internship") return "Internship";
  if (i.kind === "apprenticeship") return "Apprenticeship";
  return "Program";
}

/** The Feed's opportunities, best fit for this student first: open now (or
 *  date not posted), their grade, their state, their Top 3 fields, scored
 *  by the Opportunities tab's own fitFor so both places agree. The first
 *  is always an internship (Joshua's demo order: "10. Internship
 *  opportunity"); for the NJ grade 11 demo student with Investment Banking
 *  first, that is EY Discover (New York and New Jersey offices). */
export function useFeedOpportunityIds(): string[] {
  const base = useStudent();
  const top3 = useTop3();
  // The fields come from the same Top 3 the Feed uses everywhere (stored
  // picks, else the demo default), so a fresh demo session still matches
  // on Investment Banking instead of on no field at all.
  const student = useMemo(() => ({ ...base, fields: [...new Set(top3.map((c) => worldToField(c.world)).filter((f): f is NonNullable<typeof f> => !!f))] }), [base, top3]);
  return useMemo(() => {
    const t = today();
    const scored = [...INTERNSHIP_ITEMS, ...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS]
      .map((i) => ({ i, time: timing(i, t), fit: fitFor(i, student) }))
      .filter((x) => x.time.status !== "closed" && x.fit.when === "now")
      .sort((a, b) => b.fit.score - a.fit.score || (a.time.days ?? 9999) - (b.time.days ?? 9999));
    const firstInternship = scored.find((x) => x.i.type === "program" && (x.i.kind === "internship" || x.i.kind === "apprenticeship"));
    const ordered = firstInternship ? [firstInternship, ...scored.filter((x) => x !== firstInternship)] : scored;
    return ordered.map((x) => x.i.id);
  }, [student]);
}

export function OpportunityBreather({ community, itemId }: { community?: Community; /** a specific opportunity (the Feed); otherwise the soonest in the board's field */ itemId?: string }) {
  const flat = useContext(FlatCtx);
  const top3 = useTop3();
  // The field to match. Boards whose world has no field in the
  // Opportunities data (Teaching & Education mapped to Public Service & Law,
  // which read as random on General Professional Development) use the
  // student's own #1 career instead, else anything open to every field
  // (Chandu, 2 Oct 2026: "what does 'real money' in Public Service & Law mean?").
  const field = useMemo(() => {
    if (itemId) {
      const own = findOpportunity(itemId);
      const mine = top3.map((c) => worldToField(c.world));
      return own?.fields.find((f) => f !== "Any" && mine.includes(f)) ?? own?.fields.find((f) => f !== "Any") ?? null;
    }
    if (!community) return null;
    if (community.world !== "Teaching & Education") return worldToField(community.world);
    return top3[0] ? worldToField(top3[0].world) : null;
  }, [itemId, community, top3]);
  const item = useMemo(() => {
    const t = today();
    if (itemId) {
      const own = findOpportunity(itemId);
      return own ? { i: own, time: timing(own, t) } : null;
    }
    const pool = [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS].filter((i) => (field ? i.fields.includes(field) : i.fields.includes("Any")))
      .map((i) => ({ i, time: timing(i, t) })).filter((x) => x.time.status !== "closed")
      .sort((a, b) => (a.time.days ?? 9999) - (b.time.days ?? 9999));
    return pool[0] ?? null;
  }, [field, itemId]);
  if (!item) return null;
  const { i, time } = item;
  const who = i.type === "scholarship" ? i.provider : i.org;
  // Says what the card is, plainly: "Internship for Business & Finance",
  // "Program open to every field".
  const kind = opportunityKind(i);
  const why = field && i.fields.includes(field) ? `${kind} for ${field}` : `${kind} open to every field`;
  // A program's place tells a student whether they can get there; a
  // scholarship's award is its headline.
  const where = i.type === "program" ? i.location : null;
  return (
    <Shell href={`/opportunities/${i.id}`} why={why}>
      <div className="flex items-center gap-[14px]">
        {/* a smaller mark on phones, where the Feed's text column is narrow */}
        {flat ? (
          <>
            <span className="flex-none sm:hidden"><OrgMark url={i.url} name={who} size={48} /></span>
            <span className="hidden flex-none sm:block"><OrgMark url={i.url} name={who} size={64} /></span>
          </>
        ) : <OrgMark url={i.url} name={who} size={52} />}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-[16px] leading-[21px] font-extrabold" style={{ ...DISPLAY, color: "var(--foreground)" }}>{i.name}</h3>
          <p className="truncate text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{who}</p>
          <div className="mt-[8px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <AwardChip item={i} />
            <span>{closesShort(time)}</span>
          </div>
          {where && <p className="mt-[2px] line-clamp-2 text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{where}</p>}
        </div>
        <ChevronRight aria-hidden className="h-4 w-4 flex-none transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />
      </div>
    </Shell>
  );
}

// ---- 4. A Dreamari moment: a Play experience, or a real event ---------------------------

/** One image card with a title and a line on it, shared by every Play or
 *  event moment so they all look the same. */
function MomentCard({ href, photo, focus, title, line, why, play }: { href: string; photo: string; focus?: string; title: string; line: string; why: string; play: boolean }) {
  const flat = useContext(FlatCtx);
  const card = (
    <Link href={href} className="dm-tap group relative block w-full overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: INK, color: "#fff" }}>
      <span className={`relative block ${flat ? "h-[230px]" : "h-[168px]"}`}>
        <Image src={photo} alt="" fill sizes="(max-width: 640px) 100vw, 720px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" style={focus ? { objectPosition: focus } : undefined} />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,10,24,0.92) 0%, rgba(8,10,24,0.4) 55%, rgba(8,10,24,0.05) 100%)" }} />
        {play && <span className="absolute top-1/2 left-1/2 flex size-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px]" style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.5)" }}><Play className="ml-[3px] h-[20px] w-[20px]" fill="currentColor" aria-hidden /></span>}
        <span className="absolute right-[16px] bottom-[14px] left-[16px] flex flex-col gap-[2px]">
          <span className="text-[17px] leading-[22px] font-extrabold" style={DISPLAY}>{title}</span>
          <span className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>{line}</span>
        </span>
      </span>
    </Link>
  );
  if (!flat) return card;
  return (
    <div className={`py-[24px] pr-[var(--space-5)] sm:pr-[var(--space-6)] ${FEED_TEXT_INSET}`}>
      <span className="mb-[10px] block text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{why}</span>
      {card}
    </div>
  );
}

export function MomentBreather({ community }: { community: Community }) {
  // A Play game only where one exists for this world; elsewhere the next
  // Dream Opportunity event, with a real photo from a past one. Never a game
  // from another world (a nursing sim on the tech board read as random).
  const game = community.world === "Business & Finance" ? INVESTMENT_BANKING : community.world === "Health & Medicine" ? REGISTERED_NURSE : null;
  const event = !game ? EVENTS.find((ev) => ev.lifecycle === "Upcoming" && /\d/.test(ev.date)) ?? null : null;
  const photo = game ? game.cover : "/images/connect/events/panel-2.jpg";
  const href = game ? `/play/${game.id}` : event ? `/connect?event=${event.id}` : "/connect";
  const title = game ? `Day in the Life: ${game.title}` : event ? event.name : "Dream Opportunity events";
  const line = game ? `Play · Level ${game.levels[0].n} · ${game.levels[0].role}` : event ? `${event.date} · ${event.location}` : "Meet pros in person";
  return <MomentCard href={href} photo={photo} title={title} line={line} why={game ? "Try the job for ten minutes" : "Meet pros in person"} play={!!game} />;
}

/** The Feed's Play moments, in the order to show them: the Day in the Life
 *  for the student's highest Top 3 career first (Investment Banker for the
 *  demo student), then each glossary game that is really playable, then the
 *  other Day in the Life games. Ids: "sim:<id>" or "glossary:<career>". */
export function useFeedPlayIds(): string[] {
  const top3 = useTop3();
  return useMemo(() => {
    const rank = (careerId: string) => { const i = top3.findIndex((c) => c.id === careerId); return i < 0 ? 99 : i; };
    const sims = [...SIMULATIONS].sort((a, b) => rank(a.careerId) - rank(b.careerId));
    const glossary = GLOSSARY_GAMES.filter((g) => hasGlossary(g.careerSlug)).sort((a, b) => rank(a.careerSlug) - rank(b.careerSlug));
    return [...sims.slice(0, 1).map((s) => `sim:${s.id}`), ...glossary.map((g) => `glossary:${g.careerSlug}`), ...sims.slice(1).map((s) => `sim:${s.id}`)];
  }, [top3]);
}

/** One Play moment in the Feed: a Day in the Life game or a glossary game,
 *  with the same image card as every other moment. */
export function PlayBreather({ id }: { id: string }) {
  const [type, ref] = id.split(":");
  if (type === "sim") {
    const game = SIMULATIONS.find((s) => s.id === ref);
    if (!game) return null;
    return <MomentCard href={`/play/${game.id}`} photo={game.cover} title={`Day in the Life: ${game.title}`} line={`Play · Level ${game.levels[0].n} · ${game.levels[0].role}`} why="Try the job for ten minutes" play />;
  }
  const glossary = GLOSSARY_GAMES.find((g) => g.careerSlug === ref);
  if (!glossary || !glossary.cover) return null;
  return <MomentCard href={`/play/glossary/${glossary.careerSlug}`} photo={glossary.cover} focus="50% 62%" title={glossary.title} line={`Play · ${glossary.sub}`} why="Learn the words pros use" play />;
}

// ---- 4b. Events in the feed ----------------------------------------------------------
//
// Chandu, 2 Oct 2026: "bring the event cards to the feed, like an ad for an
// upcoming event", then "I mean the real event cards we have in our Events
// tab". The Feed renders the Events tab's own ticket (EventTicket in
// ConnectExperience); this only orders them: dated upcoming events soonest
// first, then the rest, and the line above saying when.

export function feedEvents(now: number): { e: (typeof EVENTS)[number]; days: number | null }[] {
  const dated = (e: (typeof EVENTS)[number]) => { const t = new Date(e.nextDate ?? e.date).getTime(); return Number.isNaN(t) || t < now ? null : t; };
  return [...EVENTS]
    .map((e) => ({ e, t: dated(e) }))
    .sort((a, b) => (a.t ?? Infinity) - (b.t ?? Infinity))
    .map(({ e, t }) => ({ e, days: t === null ? null : Math.max(0, Math.ceil((t - now) / 86400000)) }));
}

// ---- 5. The post graphic: a pro's words as a picture, inside the post ----------------
//
// Chandu, 2 Oct 2026: "professionals need to customize how their post
// appears with different fonts, layouts, alignments, backgrounds and
// stickers... in the feed they should show up like a picture would on
// Twitter, Reddit or Instagram", then "why are the backgrounds just colours?
// We need gradients, patterns, image backgrounds, a surface behind the text
// like Instagram does so legibility holds on image backgrounds. A lot of
// templates." So a graphic is: a background template (gradients, patterns,
// papers, our QA'd photos), a font, a text surface (none, soft highlight,
// solid card: Instagram's text-background toggle) and an alignment. Every
// template carries its own ink colour so any combination stays legible;
// photos default to the soft surface. Emoji stickers were removed on 4 Oct
// 2026 (Chandu: "keep the vector stuff, remove the emoji sticker"); the
// vector effects below stay.

type Ink = "light" | "dark";
export type Template = {
  id: string; label: string; group: "Photos" | "Gradients" | "Patterns" | "Paper" | "Scenes"; ink: Ink; css?: (c: string) => string; photo?: string; rule?: boolean;
  /** Auto placement for a photo, measured from the photo itself
   *  (scripts/career-photos/graphic-photos.mjs): the calmest band for the
   *  words and the calmest corner away from them for the Dreamari mark. */
  auto?: { valign: "top" | "middle" | "bottom"; mark: "tl" | "tr" | "bl" | "br"; corners: Record<"tl" | "tr" | "bl" | "br", Ink> };
};
// The picker shows Photos, Gradients and Patterns (Chandu, 4 Oct 2026: "get
// rid of scenes and paper from the background menu"). Paper and Scenes stay
// below only so posts already made with them still draw.
export const GROUPS: Template["group"][] = ["Photos", "Gradients", "Patterns"];
const GRAIN = "url(/images/connect/covers/grain.png)";
export const TEMPLATES: Template[] = [
  // photos: Dreamari-approved Unsplash photography with open sky for the
  // words, the Bible app's verse-card look (Joshua, 4 Oct 2026: "beautiful
  // photography + strong typography + a short professional insight"). Ink
  // and placement measured per photo; free to use under the Unsplash
  // License (photographers: Boris Baldinger, Gregoire Jeanneau, Mads Schmidt
  // Rasmussen, Paul Berthelon Bravo, Resul Mentes, Taylor Van Riper, Theodor
  // Vasile, Timo Wagner).
  { id: "p-peak-dawn", label: "Peak at dawn", group: "Photos", ink: "dark", photo: "/images/connect/graphics/p-peak-dawn.webp", auto: { valign: "top", mark: "br", corners: { tl: "dark", tr: "dark", bl: "light", br: "light" } } },
  { id: "p-night-sky", label: "Night sky", group: "Photos", ink: "light", photo: "/images/connect/graphics/p-night-sky.webp", auto: { valign: "middle", mark: "tr", corners: { tl: "light", tr: "light", bl: "light", br: "light" } } },
  { id: "p-snow-peak", label: "Snow peak", group: "Photos", ink: "dark", photo: "/images/connect/graphics/p-snow-peak.webp", auto: { valign: "top", mark: "br", corners: { tl: "dark", tr: "dark", bl: "light", br: "light" } } },
  { id: "p-pastel", label: "Pastel horizon", group: "Photos", ink: "dark", photo: "/images/connect/graphics/p-pastel.webp", auto: { valign: "bottom", mark: "tl", corners: { tl: "light", tr: "light", bl: "dark", br: "dark" } } },
  { id: "p-teal-cloud", label: "Teal cloud", group: "Photos", ink: "light", photo: "/images/connect/graphics/p-teal-cloud.webp", auto: { valign: "bottom", mark: "tr", corners: { tl: "dark", tr: "dark", bl: "light", br: "light" } } },
  { id: "p-above-clouds", label: "Above the clouds", group: "Photos", ink: "light", photo: "/images/connect/graphics/p-above-clouds.webp", auto: { valign: "top", mark: "br", corners: { tl: "dark", tr: "light", bl: "dark", br: "dark" } } },
  { id: "p-sunset-sea", label: "Sunset sea", group: "Photos", ink: "light", photo: "/images/connect/graphics/p-sunset-sea.webp", auto: { valign: "top", mark: "br", corners: { tl: "light", tr: "light", bl: "light", br: "light" } } },
  { id: "p-city-dusk", label: "City at dusk", group: "Photos", ink: "light", photo: "/images/connect/graphics/p-city-dusk.webp", auto: { valign: "top", mark: "br", corners: { tl: "light", tr: "light", bl: "light", br: "light" } } },
  // gradients
  { id: "world", label: "Your world", group: "Gradients", ink: "light", css: (c) => `linear-gradient(150deg, color-mix(in srgb, ${c} 78%, #0e0c20) 0%, color-mix(in srgb, ${c} 40%, #0e0c20) 100%)` },
  { id: "dusk", label: "Dusk", group: "Gradients", ink: "light", css: (c) => `linear-gradient(135deg, #15121f 0%, color-mix(in srgb, ${c} 26%, #15121f) 100%)` },
  { id: "aurora", label: "Aurora", group: "Gradients", ink: "light", css: () => "linear-gradient(135deg, #3b2a8f 0%, #2563eb 48%, #0ea5a4 100%)" },
  { id: "sunset", label: "Sunset", group: "Gradients", ink: "light", css: () => "linear-gradient(140deg, #f97316 0%, #ec4899 55%, #7c3aed 100%)" },
  { id: "ocean", label: "Ocean", group: "Gradients", ink: "light", css: () => "linear-gradient(160deg, #0b1d3a 0%, #0e4d6e 55%, #13a3a0 100%)" },
  { id: "ember", label: "Ember", group: "Gradients", ink: "light", css: () => "radial-gradient(120% 90% at 0% 100%, #f59e0b 0%, #b91c1c 45%, #1c0a0a 100%)" },
  { id: "mesh", label: "Mesh", group: "Gradients", ink: "light", css: () => "radial-gradient(55% 60% at 12% 18%, #7c3aed 0%, transparent 62%), radial-gradient(50% 55% at 88% 28%, #06b6d4 0%, transparent 60%), radial-gradient(60% 60% at 50% 105%, #f43f5e 0%, transparent 62%), #0e0c20" },
  { id: "noir", label: "Noir", group: "Gradients", ink: "light", css: () => "linear-gradient(180deg, #0b0b0f 0%, #1c1c24 100%)" },
  { id: "peach", label: "Peach", group: "Gradients", ink: "dark", css: () => "linear-gradient(140deg, #fde1c8 0%, #f9b4a6 60%, #f28fb0 100%)" },
  { id: "mint", label: "Mint", group: "Gradients", ink: "dark", css: () => "linear-gradient(150deg, #e3f9f0 0%, #a7e8d0 100%)" },
  { id: "lilac", label: "Lilac", group: "Gradients", ink: "dark", css: () => "linear-gradient(150deg, #f1edff 0%, #c4b5fd 100%)" },
  { id: "sky", label: "Sky", group: "Gradients", ink: "dark", css: () => "linear-gradient(170deg, #e0f2fe 0%, #93c5fd 100%)" },
  // patterns
  { id: "grid", label: "Grid", group: "Patterns", ink: "light", css: (c) => `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(150deg, color-mix(in srgb, ${c} 45%, #0e0c20), #0e0c20)` },
  { id: "dots", label: "Dots", group: "Patterns", ink: "light", css: (c) => `radial-gradient(rgba(255,255,255,0.18) 1.4px, transparent 1.7px) 0 0 / 16px 16px, color-mix(in srgb, ${c} 55%, #0e0c20)` },
  { id: "stripes", label: "Stripes", group: "Patterns", ink: "light", css: () => "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 10px, transparent 10px 20px), linear-gradient(150deg, #1e293b, #0f172a)" },
  { id: "rings", label: "Rings", group: "Patterns", ink: "light", css: () => "repeating-radial-gradient(circle at 100% 0%, rgba(255,255,255,0.09) 0 2px, transparent 2px 18px), linear-gradient(150deg, #4c1d95, #1e1b4b)" },
  { id: "blueprint", label: "Blueprint", group: "Patterns", ink: "light", css: () => "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px) 0 0 / 20px 20px, #1d4ed8" },
  { id: "sunburst", label: "Sunburst", group: "Patterns", ink: "light", css: () => "repeating-conic-gradient(from 0deg at 50% 120%, rgba(255,255,255,0.08) 0deg 6deg, transparent 6deg 12deg), linear-gradient(160deg, #ea580c, #9a3412)" },
  { id: "polka", label: "Polka", group: "Patterns", ink: "dark", css: () => "radial-gradient(#fb7185 20%, transparent 22%) 0 0 / 28px 28px, #fff1f2" },
  { id: "checker", label: "Checker", group: "Patterns", ink: "dark", css: () => "conic-gradient(rgba(76,29,149,0.07) 25%, transparent 0 50%, rgba(76,29,149,0.07) 0 75%, transparent 0) 0 0 / 28px 28px, #f5f3ff" },
  { id: "notebook", label: "Notebook", group: "Patterns", ink: "dark", css: () => "linear-gradient(90deg, transparent 38px, rgba(244,63,94,0.4) 38px, rgba(244,63,94,0.4) 40px, transparent 40px), linear-gradient(transparent 27px, rgba(59,130,246,0.22) 28px) 0 0 / 100% 28px, #fdfcf7" },
  { id: "zigzag", label: "Zigzag", group: "Patterns", ink: "dark", css: () => "linear-gradient(135deg, #fde68a 25%, transparent 25%) -14px 0 / 28px 28px, linear-gradient(225deg, #fde68a 25%, transparent 25%) -14px 0 / 28px 28px, linear-gradient(315deg, #fde68a 25%, transparent 25%) 0 0 / 28px 28px, linear-gradient(45deg, #fde68a 25%, transparent 25%) 0 0 / 28px 28px, #fffbeb" },
  // paper
  { id: "paper", label: "Paper", group: "Paper", ink: "dark", rule: true, css: () => "linear-gradient(160deg, #f7f3ea 0%, #ece6d8 100%)" },
  { id: "newsprint", label: "Newsprint", group: "Paper", ink: "dark", css: () => `${GRAIN}, #efebe3` },
  { id: "kraft", label: "Kraft", group: "Paper", ink: "dark", css: () => `${GRAIN}, linear-gradient(160deg, #d6b88f, #b48f62)` },
  { id: "chalk", label: "Chalkboard", group: "Paper", ink: "light", css: () => `${GRAIN}, linear-gradient(160deg, #23362e, #172520)` },
  { id: "ink", label: "Ink", group: "Paper", ink: "light", css: () => `${GRAIN}, #101014` },
  // scenes: QA'd Dreamari art with no people in it (Chandu, 2 Oct 2026: "no
  // photos with people in them; a set of templates gets old fast and people
  // and real photography don't repeat well"). Pros never upload.
  { id: "s-skyline", label: "Skyline", group: "Scenes", ink: "light", photo: "/images/connect/covers/finance.webp" },
  { id: "s-screens", label: "Screens", group: "Scenes", ink: "light", photo: "/images/connect/covers/technology.webp" },
  { id: "s-pulse", label: "Pulse", group: "Scenes", ink: "light", photo: "/images/connect/covers/healthcare.webp" },
  { id: "s-studio", label: "Studio", group: "Scenes", ink: "light", photo: "/images/connect/covers/creative.webp" },
  { id: "s-bulb", label: "Idea", group: "Scenes", ink: "light", photo: "/images/connect/covers/gpd-bulb-violet.webp" },
];
export const templateById = (id: string): Template => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export const FONTS: { id: InsightGraphic["font"]; label: string; style: React.CSSProperties; scale: number }[] = [
  { id: "display", label: "Modern", style: { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em" }, scale: 1.1 },
  { id: "serif", label: "Editorial", style: { fontFamily: '"Merriweather", Georgia, serif', fontWeight: 700, fontStyle: "italic" }, scale: 0.95 },
  { id: "classic", label: "Classic", style: { fontFamily: '"Lora", Georgia, serif', fontWeight: 600 }, scale: 1 },
  { id: "poster", label: "Poster", style: { fontFamily: '"Viaoda Libre", serif', fontWeight: 400, letterSpacing: "0.01em" }, scale: 1.15 },
  { id: "rounded", label: "Friendly", style: { fontFamily: '"Nunito", sans-serif', fontWeight: 800 }, scale: 1.05 },
  { id: "mono", label: "Typewriter", style: { fontFamily: '"Source Code Pro", monospace', fontWeight: 600, letterSpacing: "-0.01em" }, scale: 0.9 },
];
const fontById = (id: InsightGraphic["font"]) => FONTS.find((f) => f.id === id) ?? FONTS[0];

/** One background layer: a photo through next/image, or the template's CSS. */
export function GraphicGround({ t, color, sizes }: { t: Template; color: string; sizes: string }) {
  if (t.photo) return (
    <>
      <Image src={t.photo} alt="" fill sizes={sizes} className="object-cover" />
      {/* Photos keep their own light (the words were placed in clear sky);
          the older scenes get the scrim they were made with. */}
      {t.group !== "Photos" && <span className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,10,24,0.55) 0%, rgba(8,10,24,0.1) 38%, rgba(8,10,24,0.35) 100%)" }} />}
    </>
  );
  const css = t.css?.(color) ?? "";
  return <span className="absolute inset-0" style={{ background: css, backgroundBlendMode: css.includes("grain") ? "multiply" : undefined }} />;
}

/** Say each thing once (Chandu, 2 Oct 2026: "don't repeat text that's in
 *  the graphic as text in the post structure"). True when the graphic's
 *  words and the post title are the same line, or one starts with the other;
 *  the row then drops its title, since the graphic carries it. */
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim();
/** The caption under a graphic post: the body with the graphic's own words
 *  taken off the front, so the picture's line is never read twice and what
 *  follows it still shows (6 Oct 2026). Empty when the body only repeats
 *  the picture. */
export function captionFor(body: string, graphicText?: string): string {
  const text = body.replace(/\s+/g, " ").trim();
  if (!graphicText) return text;
  const a = norm(text);
  const b = norm(graphicText);
  if (!a || a === b) return "";
  if (a.startsWith(b)) return text.slice(graphicText.trim().length).replace(/^[\s.,;:!?"'”’)\-]+/, "").replace(/^[a-z]/, (c) => c.toUpperCase());
  return text;
}
export function graphicRepeatsTitle(title: string, graphicText?: string): boolean {
  if (!graphicText) return false;
  const a = norm(title);
  const b = norm(graphicText);
  if (!a || !b) return false;
  return a === b || b.startsWith(a) || a.startsWith(b);
}

/** Effects layered over a background (Chandu, 2 Oct 2026: "more interesting,
 *  not empty space on top and text bottom left. Use vectors, patterns,
 *  effects and filters"). All vector or CSS, all tinted to the template's
 *  ink and the pro's world colour, so any stack stays on-brand. */
type Effect = NonNullable<InsightGraphic["effects"]>[number];
export const EFFECTS: { id: Effect; label: string }[] = [
  { id: "orbs", label: "Glow" },
  { id: "rings", label: "Rings" },
  { id: "sparkles", label: "Sparkles" },
  { id: "quote", label: "Quote" },
  { id: "burst", label: "Burst" },
  { id: "grain", label: "Grain" },
];
function GraphicEffects({ effects, light, color }: { effects?: Effect[]; light: boolean; color: string }) {
  if (!effects?.length) return null;
  const ink = light ? "255,255,255" : "27,24,36";
  const has = (e: Effect) => effects.includes(e);
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {has("burst") && <span className="absolute inset-[-40%]" style={{ background: `repeating-conic-gradient(from 0deg at 50% 50%, rgba(${ink},0.07) 0deg 5deg, transparent 5deg 15deg)`, maskImage: "radial-gradient(closest-side, #000 20%, transparent 100%)", WebkitMaskImage: "radial-gradient(closest-side, #000 20%, transparent 100%)" }} />}
      {has("orbs") && (
        <>
          <span className="absolute top-[-30%] left-[-12%] h-[90%] w-[60%] rounded-full blur-[38px]" style={{ background: `color-mix(in srgb, ${color} 70%, #ffffff)`, opacity: 0.45, mixBlendMode: light ? "screen" : "multiply" }} />
          <span className="absolute right-[-10%] bottom-[-35%] h-[95%] w-[55%] rounded-full blur-[42px]" style={{ background: "#f472b6", opacity: 0.35, mixBlendMode: light ? "screen" : "multiply" }} />
          <span className="absolute top-[30%] right-[22%] h-[30%] w-[18%] rounded-full blur-[26px]" style={{ background: "#facc15", opacity: 0.25, mixBlendMode: light ? "screen" : "multiply" }} />
        </>
      )}
      {has("rings") && (
        <svg className="absolute right-[-8%] bottom-[-30%] h-[120%] w-auto" viewBox="0 0 200 200" fill="none">
          {[90, 72, 54, 36].map((r, i) => <circle key={r} cx="100" cy="100" r={r} stroke={`rgba(${ink},${0.16 - i * 0.025})`} strokeWidth="1.5" />)}
        </svg>
      )}
      {has("quote") && (
        <svg className="absolute top-[6%] left-[4%] h-[46%] w-auto" viewBox="0 0 64 48" style={{ opacity: 0.14 }}>
          <path fill={`rgb(${ink})`} d="M0 48V28C0 12 8 3 24 0l3 7C18 10 14 15 13 22h12v26H0Zm37 0V28c0-16 8-25 24-28l3 7c-9 3-13 8-14 15h12v26H37Z" />
        </svg>
      )}
      {has("sparkles") && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 90" preserveAspectRatio="none">
          {[[18, 16, 3.2], [140, 20, 2.4], [128, 70, 3.6], [30, 72, 2], [86, 10, 1.6], [150, 48, 1.4], [8, 44, 1.6]].map(([x, y, s], i) => (
            <path key={i} transform={`translate(${x} ${y}) scale(${s / 6})`} fill={`rgba(${ink},${0.55 - i * 0.05})`} d="M0 -6C0.5 -1.5 1.5 -0.5 6 0C1.5 0.5 0.5 1.5 0 6C-0.5 1.5 -1.5 0.5 -6 0C-1.5 -0.5 -0.5 -1.5 0 -6Z" />
          ))}
        </svg>
      )}
      {has("grain") && <span className="absolute inset-0" style={{ backgroundImage: "url(/images/connect/covers/grain.png)", backgroundSize: "256px 256px", mixBlendMode: "overlay", opacity: 0.35 }} />}
    </span>
  );
}

/** Auto placement: a photo's measured band, else the middle; the mark goes
 *  to the measured corner, else the corner opposite the words. */
export function resolvePlacement(g: InsightGraphic): { valign: "top" | "middle" | "bottom"; align: "left" | "center" | "right"; mark: "tl" | "tr" | "bl" | "br" } {
  const t = templateById(g.bg);
  const valign = g.valign ?? t.auto?.valign ?? "middle";
  const align = g.align ?? "left";
  const mark = g.mark ?? t.auto?.mark ?? (valign === "bottom" ? "tr" : "br");
  return { valign, align, mark };
}

/** The Dreamari mark, small, in a corner: the brand on every graphic, so a
 *  repost carries it back to us (Joshua, 4 Oct 2026, "our watermark at the
 *  bottom left, like Gemini does"). */
function BrandMark({ corner, color }: { corner: "tl" | "tr" | "bl" | "br"; color: string }) {
  const pos: React.CSSProperties = { [corner[0] === "t" ? "top" : "bottom"]: "4.2cqi", [corner[1] === "l" ? "left" : "right"]: "4.6cqi" };
  return (
    <span aria-hidden className="absolute z-[2] flex items-center gap-[0.9cqi] opacity-[0.85]" style={{ ...pos, color }}>
      <span className="block" style={{ width: "4.6cqi", height: "2.6cqi", background: "currentColor", maskImage: "url(/images/app/logo-mark.svg)", WebkitMaskImage: "url(/images/app/logo-mark.svg)", maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }} />
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.6cqi", letterSpacing: "0.04em", lineHeight: 1 }}>DREAMARI</span>
    </span>
  );
}

/** A pro's words as a picture: the Bible app's verse card (Joshua, 4 Oct
 *  2026: "the text can sit naturally on top of photography"). 4:5 portrait,
 *  Instagram's post shape, so it reposts cleanly. Who it is from sits right
 *  above the words, small, the way "Verse of the Day / 1 Peter 4:8" does,
 *  and the block sits where the photo is calmest unless the pro moves it. */
/** The words, typed straight onto the graphic (Instagram's in-place text,
 *  4 Oct 2026, Chandu: "can text editing be inline like on the post
 *  itself?"). Uncontrolled while focused so the caret never jumps; an undo
 *  from outside rewrites it. */
function EditableWords({ value, onChange, style, autoFocus }: { value: string; onChange: (text: string) => void; style: React.CSSProperties; autoFocus?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerText !== value) el.innerText = value;
  }, [value]);
  useEffect(() => {
    const el = ref.current;
    if (!autoFocus || !el) return;
    el.focus();
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
    const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
  }, [autoFocus]);
  return (
    <span ref={ref} role="textbox" aria-label="Words on the picture" aria-multiline="true" contentEditable suppressContentEditableWarning
      onInput={(e) => onChange((e.currentTarget.innerText || "").slice(0, 140))}
      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
      className="block min-w-[1ch] cursor-text outline-none" style={{ ...style, caretColor: "currentColor" }} />
  );
}

export function InsightGraphicView({ insight, compact = false, graphic, editable }: {
  insight: Insight; compact?: boolean; graphic?: Insight["graphic"];
  /** the composer's in-place editing: the words become a text box and the picture dims behind them */
  editable?: { onText: (text: string) => void; dim?: boolean; autoFocus?: boolean };
}) {
  const g = graphic ?? insight.graphic;
  const pro = proById(insight.proId);
  if (!g || !pro) return null;
  const color = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const t = templateById(g.bg);
  const font = fontById(g.font);
  const light = t.ink === "light";
  const ink = g.color ?? (light ? "#ffffff" : "#1b1824");
  const sub = g.color ? `color-mix(in srgb, ${g.color} 82%, transparent)` : light ? "rgba(255,255,255,0.82)" : "rgba(27,24,36,0.7)";
  const surface = g.surface ?? (t.photo && t.group !== "Photos" ? "soft" : "none");
  const { valign, align, mark } = resolvePlacement(g);
  // the text surface: Instagram's per-line highlight, or a card behind the block
  const hl = light ? "rgba(10,10,18,0.62)" : "rgba(255,255,255,0.78)";
  const lineStyle: React.CSSProperties = surface === "soft" ? { background: hl, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0.06em 0.32em", borderRadius: "0.22em" } : {};
  const block: React.CSSProperties = surface === "solid" ? { background: light ? "rgba(10,10,18,0.72)" : "rgba(255,255,255,0.9)", padding: "5cqi 5.5cqi", borderRadius: "3cqi", backdropFilter: "blur(6px)" } : {};
  const shadow = t.photo && surface === "none" ? (light ? "0 1px 12px rgba(0,0,0,0.35)" : "0 1px 10px rgba(255,255,255,0.25)") : undefined;
  // Size by length, the way Apple Music and Spotify set a shared lyric: a
  // short line large, a long one smaller, so nothing crowds the card or
  // runs off it (4 Oct 2026; Apple caps a lyric share at 150 characters,
  // we cap at 140).
  const n = g.text.length;
  const size = (n <= 40 ? 9.6 : n <= 70 ? 8.4 : n <= 100 ? 7.3 : 6.4) * font.scale;
  const items = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";
  return (
    <span aria-hidden data-graphic className={`relative block aspect-[4/5] w-full overflow-hidden rounded-[12px] border ${compact ? "mt-[10px] max-w-[440px]" : ""}`} style={{ borderColor: "rgba(255,255,255,0.1)", background: INK, containerType: "inline-size" }}>
      <GraphicGround t={t} color={color} sizes={compact ? "(max-width: 640px) 100vw, 440px" : "(max-width: 640px) 100vw, 560px"} />
      <GraphicEffects effects={g.effects} light={light} color={color} />
      {editable?.dim && <span aria-hidden className="absolute inset-0 z-[1]" style={{ background: "rgba(5,6,16,0.45)" }} />}
      {/* the mark's own ink: a photo's corner can be darker or lighter than where the words sit */}
      <BrandMark corner={mark} color={(t.auto?.corners[mark] ?? t.ink) === "light" ? "#ffffff" : "#1b1824"} />
      <span className={`absolute inset-0 z-[2] flex flex-col px-[8cqi] ${valign === "top" ? "justify-start pt-[16cqi]" : valign === "bottom" ? "justify-end pb-[16cqi]" : "justify-center"}`} style={{ color: ink }}>
        <span className={`flex flex-col ${items}`} style={block}>
          {t.rule && <span className="mb-[3cqi] block h-[0.9cqi] w-[9cqi] rounded-full" style={{ background: color }} />}
          {/* The credit rides with the words, never its own slot (4 Oct 2026):
              it follows their alignment and position, so it can't collide
              with them or the mark, and there is nothing extra to place.
              Face, name, then role with the company's logo instead of its
              typed name (Chandu: "use logos instead of typing out company
              names"; "let's see if the profile picture can be brought back"),
              so a reposted graphic still says who it is from. */}
          {/* Every part of the credit is measured against the picture's width
              (cqi), the avatar and the company mark included, so the lockup
              holds its shape at 200px and at 560px (Chandu, 6 Oct 2026: "this
              scale messes up the designation and company lockup; have that
              properly adaptable at different scales"). */}
          <span className={`mb-[3.6cqi] flex items-center gap-[2.4cqi] ${align === "right" ? "flex-row-reverse" : ""}`}>
            <span className="relative flex-none overflow-hidden rounded-full" style={{ width: "9cqi", height: "9cqi", boxShadow: `0 0 0 0.5cqi ${light ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.95)"}` }}>
              <span className="absolute inset-0 [&>*]:!h-full [&>*]:!w-full"><Avatar name={pro.name} size={64} /></span>
            </span>
            <span className={`flex min-w-0 flex-col ${align === "right" ? "items-end" : "items-start"}`}>
              <span className="whitespace-nowrap" style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "4.2cqi", lineHeight: 1.25, textShadow: shadow }}>{pro.name}</span>
              <span className="flex items-center gap-[1.4cqi] whitespace-nowrap" style={{ fontFamily: "var(--font-body)", fontSize: "3.3cqi", lineHeight: 1.25, color: sub, textShadow: shadow }}>
                <span>{pro.role} ·</span><CompanyMark name={pro.org} ink={sub} height={16} unit="em" className="flex-none" />
              </span>
            </span>
          </span>
          {editable
            ? <EditableWords value={g.text} onChange={editable.onText} autoFocus={editable.autoFocus} style={{ ...font.style, fontSize: `${size}cqi`, lineHeight: surface === "soft" ? 1.42 : 1.2, textTransform: g.caps ? "uppercase" : undefined, textShadow: shadow, width: "100%", textAlign: align, ...(surface === "soft" ? { background: lineStyle.background, borderRadius: "0.22em", padding: "0.06em 0.32em" } : {}) }} />
            : (
              <span className="text-pretty" style={{ ...font.style, fontSize: `${size}cqi`, lineHeight: surface === "soft" ? 1.42 : 1.2, textTransform: g.caps ? "uppercase" : undefined, textShadow: shadow }}>
                <span style={lineStyle}>{font.id === "serif" ? `“${g.text}”` : g.text}</span>
              </span>
            )}
        </span>
      </span>
    </span>
  );
}

/** The graphic inside a wide column, the way Reddit's desktop feed frames a
 *  portrait image: the picture centred at a capped height, the room either
 *  side filled with a blurred, dimmed copy of its own background, so the
 *  block spans the column and reads as one post rather than a small card
 *  left on its own (6 Oct 2026, after X's alignment and Instagram's stacked
 *  caption were taken for the rest of the row). Under 640px there is no
 *  frame; the picture takes the width. */
export function FramedGraphic({ insight, height = 520 }: { insight: Insight; height?: number }) {
  const g = insight.graphic;
  const pro = proById(insight.proId);
  if (!g || !pro) return null;
  const t = templateById(g.bg);
  const color = WORLD_COLORS[pro.world] ?? "var(--primary)";
  return (
    <>
      <span className="block w-full sm:hidden"><InsightGraphicView insight={insight} /></span>
      <span aria-hidden className="relative hidden w-full overflow-hidden rounded-[16px] sm:block" style={{ height, background: INK, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}>
        <span className="absolute inset-[-12%] block" style={{ filter: "blur(28px) saturate(1.1)", opacity: 0.8 }}><GraphicGround t={t} color={color} sizes="800px" /></span>
        <span className="absolute inset-0 block" style={{ background: "rgba(6,8,18,0.42)" }} />
        <span className="absolute top-1/2 left-1/2 block -translate-x-1/2 -translate-y-1/2" style={{ width: Math.round(height * 0.8), filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.45))" }}>
          <InsightGraphicView insight={insight} />
        </span>
      </span>
    </>
  );
}

// ---- the weave (a board's Questions list, v2 only) ------------------------------------

/** After posts 4, 9, 14… (never in the first three, never two in a row),
 *  rotating career → opportunity → moment. The main Feed does not use this:
 *  its rhythm is composeFeed in feed/rankFeed.ts. */
export function weaveBreathers(nodes: React.ReactNode[], make: (kind: "career" | "opportunity" | "moment", slot: number) => React.ReactNode, boardId = ""): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // Boards hold about eight questions, so most show one breather; each board
  // starts the rotation somewhere different so all three kinds get seen.
  const base: ("career" | "opportunity" | "moment")[] = ["career", "opportunity", "moment"];
  const start = Math.max(0, COMMUNITIES.findIndex((c) => c.id === boardId)) % base.length;
  const kinds = [...base.slice(start), ...base.slice(0, start)];
  let slot = 0;
  nodes.forEach((n, i) => {
    out.push(n);
    const isLast = i === nodes.length - 1;
    if (i >= 3 && (i - 3) % 5 === 0 && !isLast) {
      out.push(make(kinds[slot % kinds.length], slot));
      slot += 1;
    }
  });
  return out;
}

// ---- the composer --------------------------------------------------------------------
//
// A pro designs their graphic in PostComposer.tsx (Instagram's create flow,
// 4 Oct 2026), from the templates, fonts and effects above.

// ---- posts a pro published this session, shown at the top of their board -----------

/** The board a pro's post lands on: the community for their world. */
export const boardForPro = (pro: Pro): string => COMMUNITIES.find((c) => c.world === pro.world)?.id ?? "teaching-education";

let published: Insight[] = [];
const pubListeners = new Set<() => void>();
export function publishInsight(post: Insight) {
  published = [post, ...published];
  pubListeners.forEach((l) => l());
}
export function usePublishedInsights(): Insight[] {
  return useSyncExternalStore((l) => { pubListeners.add(l); return () => { pubListeners.delete(l); }; }, () => published, () => [] as Insight[]);
}
