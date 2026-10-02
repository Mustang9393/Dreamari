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
// week's demos see the feed exactly as before.

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { ALL_CATALOG_CAREERS, type CatalogCareer } from "@/components/app/catalog";
import { WORLD_COLORS } from "@/components/app/worlds";
import { careerSlug } from "@/components/career/slug";
import { COMMUNITIES, EVENTS, INSIGHTS, PROS, type Community, type Insight, type InsightGraphic, type Pro } from "./data";
import { ProAvatar } from "./primitives";
import { ALL_PROFILE_CAREERS, DEMO_TOP3 } from "@/components/profile/data";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "@/components/opportunities/data";
import { timing, today, worldToField } from "@/components/opportunities/match";
import { amountShort, closesShort } from "@/components/opportunities/Card";
import { OrgMark } from "@/components/opportunities/OrgMark";
import { INVESTMENT_BANKING, REGISTERED_NURSE } from "@/components/play/games";

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
  const inner = flat ? <>{whyLine}{children}</> : <>{children}{whyLine}</>;
  // In the Feed, content starts on the posts' text line, not their avatars
  // (Chandu, 2 Oct 2026: "the content should always align with the text in
  // the normal posts, not the profile pictures"): the post row's padding
  // plus its 44px avatar and 14px gap. Taller too ("they can be taller").
  const cls = flat ? `dm-tap group relative block w-full py-[24px] pr-[var(--space-5)] text-left sm:pr-[var(--space-6)] ${FEED_TEXT_INSET}` : "dm-tap group relative block w-full rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left";
  const style = flat ? { background: "color-mix(in srgb, var(--foreground) 2.5%, transparent)" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" };
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

// ---- 2. Your #1 on Connect --------------------------------------------------------------

/** The community for the student's #1 career's world, if there is one. */
export function useLeadCommunity(): Community | null {
  const top3 = useTop3();
  const lead = top3[0];
  return useMemo(() => (lead ? COMMUNITIES.find((c) => c.world === lead.world) ?? null : null), [lead]);
}

/** Only ever the first breather on a board, so at most once per list. */
export function useTopPickAvailable(community: Community): boolean {
  const top3 = useTop3();
  const lead = top3[0];
  return !!lead && lead.world === community.world;
}
export function TopPickOnConnect({ community, onSeeAnswers }: { community: Community; onSeeAnswers: () => void }) {
  const flat = useContext(FlatCtx);
  const top3 = useTop3();
  const lead = top3[0];
  if (!lead) return null;
  const pros = PROS.filter((p) => p.world === lead.world);
  const answers = INSIGHTS.filter((i) => pros.some((p) => p.id === i.proId));
  const faces = pros.slice(0, 3);
  const color = WORLD_COLORS[lead.world] ?? "var(--primary)";
  return (
    <Shell why={`Your #1 career · ${community.name}`}>
      <div className="flex items-stretch gap-[14px]">
        <span className={`relative block flex-none overflow-hidden rounded-[10px] ${flat ? "w-[120px]" : "w-[88px]"}`} style={{ background: INK }}>
          <span className="block aspect-[3/4]" />
          <Image src={lead.photo} alt="" fill sizes="88px" className="object-cover" style={{ objectPosition: lead.photoFocus ?? "50% 25%" }} />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: color }} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-[17px] leading-[22px] font-extrabold" style={{ ...DISPLAY, color: "var(--foreground)" }}>{answers.length} answers about {lead.title}</h3>
          <p className="mt-[4px] text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>From {pros.length} pros who work in {lead.world}.</p>
          <div className="mt-auto flex flex-wrap items-center gap-[10px] pt-[10px]">
            <span className="flex items-center">{faces.map((p, i) => <span key={p.id} className="rounded-full border-2" style={{ marginLeft: i ? -8 : 0, borderColor: "var(--card, #111)", zIndex: 3 - i }}><ProAvatar proId={p.id} name={p.name} size={26} /></span>)}</span>
            <button type="button" onClick={onSeeAnswers} className="dm-solid flex min-h-[32px] cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] px-[12px] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>See their answers</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ---- 3. An opportunity in this field -----------------------------------------------------

export function OpportunityBreather({ community }: { community: Community }) {
  const flat = useContext(FlatCtx);
  const top3 = useTop3();
  // The field to match. Boards whose world has no field in the
  // Opportunities data (Teaching & Education mapped to Public Service & Law,
  // which read as random on General Professional Development) use the
  // student's own #1 career instead, else anything open to every field
  // (Chandu, 2 Oct 2026: "what does 'real money' in Public Service & Law mean?").
  const field = useMemo(() => {
    if (community.world !== "Teaching & Education") return worldToField(community.world);
    return top3[0] ? worldToField(top3[0].world) : null;
  }, [community.world, top3]);
  const item = useMemo(() => {
    const t = today();
    const pool = [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS].filter((i) => (field ? i.fields.includes(field) : i.fields.includes("Any")))
      .map((i) => ({ i, time: timing(i, t) })).filter((x) => x.time.status !== "closed")
      .sort((a, b) => (a.time.days ?? 9999) - (b.time.days ?? 9999));
    return pool[0] ?? null;
  }, [field]);
  if (!item) return null;
  const { i, time } = item;
  const who = i.type === "scholarship" ? i.provider : i.org;
  // Says what the card is, plainly: "Scholarship for Business & Finance",
  // "Program open to every field".
  const kind = i.type === "scholarship" ? "Scholarship" : "Program";
  const why = field && i.fields.includes(field) ? `${kind} for ${field}` : `${kind} open to every field`;
  return (
    <Shell href={`/opportunities?open=${i.id}`} why={why}>
      <div className="flex items-center gap-[14px]">
        <OrgMark url={i.url} name={who} size={flat ? 64 : 52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] leading-[21px] font-extrabold" style={{ ...DISPLAY, color: "var(--foreground)" }}>{i.name}</h3>
          <p className="truncate text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{who}</p>
          <div className="mt-[8px] flex flex-wrap items-center gap-[6px] text-[12px] leading-[16px] font-bold">
            <span className="rounded-full px-[9px] py-[2px]" style={{ background: "color-mix(in srgb, var(--color-feedback-success, #3ddc97) 18%, transparent)", color: "var(--color-feedback-success, #3ddc97)" }}>{amountShort(i)}</span>
            <span style={{ color: "var(--muted-foreground)" }}>{closesShort(time)}</span>
          </div>
        </div>
        <ChevronRight aria-hidden className="h-4 w-4 flex-none transition-transform duration-150 group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} />
      </div>
    </Shell>
  );
}

// ---- 4. A Dreamari moment: the Play game for this world, or a real event ---------------

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
  const flat = useContext(FlatCtx);
  const card = (
    <Link href={href} className="dm-tap group relative block w-full overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: INK, color: "#fff" }}>
      <span className={`relative block ${flat ? "h-[230px]" : "h-[168px]"}`}>
        <Image src={photo} alt="" fill sizes="(max-width: 640px) 100vw, 720px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,10,24,0.92) 0%, rgba(8,10,24,0.4) 55%, rgba(8,10,24,0.05) 100%)" }} />
        {game && <span className="absolute top-1/2 left-1/2 flex size-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px]" style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.5)" }}><Play className="ml-[3px] h-[20px] w-[20px]" fill="currentColor" aria-hidden /></span>}
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
      <span className="mb-[10px] block text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{game ? "Try the job for ten minutes" : "Meet pros in person"}</span>
      {card}
    </div>
  );
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
// solid card: Instagram's text-background toggle), an alignment and an
// optional sticker. Every template carries its own ink colour so any
// combination stays legible; photos default to the soft surface.

type Ink = "light" | "dark";
type Template = { id: string; label: string; group: "Gradients" | "Patterns" | "Paper" | "Scenes"; ink: Ink; css?: (c: string) => string; photo?: string; rule?: boolean };
const GRAIN = "url(/images/connect/covers/grain.png)";
export const TEMPLATES: Template[] = [
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
const templateById = (id: string): Template => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

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
function GraphicGround({ t, color, sizes }: { t: Template; color: string; sizes: string }) {
  if (t.photo) return (
    <>
      <Image src={t.photo} alt="" fill sizes={sizes} className="object-cover" />
      <span className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,10,24,0.55) 0%, rgba(8,10,24,0.1) 38%, rgba(8,10,24,0.35) 100%)" }} />
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

/** The lyric-share layout (Spotify, Apple Music): who it is from on top,
 *  the words large below. Context first (Chandu, 2 Oct 2026: "what are they
 *  talking about?"): the post title sits right above the graphic in the row,
 *  and the pro's face, name and role head the graphic itself. */
export function InsightGraphicView({ insight, compact = false, graphic }: { insight: Insight; compact?: boolean; graphic?: Insight["graphic"] }) {
  const g = graphic ?? insight.graphic;
  const pro = proById(insight.proId);
  if (!g || !pro) return null;
  const color = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const t = templateById(g.bg);
  const font = fontById(g.font);
  const light = t.ink === "light";
  const ink = light ? "#ffffff" : "#1b1824";
  const sub = light ? "rgba(255,255,255,0.78)" : "rgba(27,24,36,0.66)";
  const surface = g.surface ?? (t.photo ? "soft" : "none");
  const center = g.align === "center";
  // the text surface: Instagram's per-line highlight, or a card behind the block
  const hl = light ? "rgba(10,10,18,0.62)" : "rgba(255,255,255,0.78)";
  const lineStyle: React.CSSProperties = surface === "soft" ? { background: hl, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0.06em 0.32em", borderRadius: "0.22em" } : {};
  const block: React.CSSProperties = surface === "solid" ? { background: light ? "rgba(10,10,18,0.72)" : "rgba(255,255,255,0.9)", padding: "14px 16px", borderRadius: 12, backdropFilter: "blur(6px)" } : {};
  const sizeBase = compact ? 22 : 26;
  return (
    <span aria-hidden className={`relative mt-[10px] block w-full overflow-hidden rounded-[12px] border ${compact ? "max-w-[520px]" : ""}`} style={{ aspectRatio: "16 / 9", borderColor: "rgba(255,255,255,0.1)", background: INK, containerType: "inline-size" }}>
      <GraphicGround t={t} color={color} sizes={compact ? "(max-width: 640px) 100vw, 520px" : "(max-width: 640px) 100vw, 720px"} />
      <GraphicEffects effects={g.effects} light={light} color={color} />
      <span className="absolute inset-0 flex flex-col p-[18px] sm:p-[22px]" style={{ color: ink }}>
        <span className="flex items-center gap-[8px]">
          <span className={`flex min-w-0 items-center gap-[8px] ${t.photo ? "rounded-full py-[3px] pr-[12px] pl-[3px]" : ""}`} style={t.photo ? { background: "rgba(10,10,18,0.6)", backdropFilter: "blur(6px)" } : undefined}>
          <span className="flex-none overflow-hidden rounded-full" style={{ boxShadow: `0 0 0 2px ${light ? "rgba(255,255,255,0.25)" : "#fff"}` }}><ProAvatar proId={pro.id} name={pro.name} size={26} /></span>
          <span className="flex min-w-0 flex-col" style={{ fontFamily: "var(--font-body)", textShadow: t.photo ? "0 1px 2px rgba(0,0,0,0.4)" : undefined }}>
            <span className="truncate text-[12.5px] leading-[15px] font-bold">{pro.name}</span>
            <span className="truncate text-[11px] leading-[14px] font-semibold" style={{ color: sub }}>{pro.role} · {pro.org}</span>
          </span>
          </span>
          {g.sticker && <span className="ml-auto flex-none text-[24px] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">{g.sticker}</span>}
        </span>
        {t.rule && <span className="mt-[14px] block h-[3px] w-[32px] rounded-full" style={{ background: color }} />}
        <span className={`flex flex-1 flex-col ${center ? "items-center text-center" : ""} ${g.valign === "top" ? "justify-start pt-[14px]" : g.valign === "bottom" ? "justify-end" : "justify-center"}`}>
          <span className="text-balance" style={{ ...font.style, ...block, fontSize: `clamp(15px, ${(sizeBase * font.scale) / 5.2}cqi, ${Math.round(sizeBase * font.scale * 1.15)}px)`, lineHeight: surface === "soft" ? 1.42 : 1.22, maxWidth: center ? "24ch" : "30ch", textTransform: g.caps ? "uppercase" : undefined, textShadow: t.photo && surface === "none" ? "0 1px 3px rgba(0,0,0,0.45)" : undefined }}>
            <span style={lineStyle}>{font.id === "serif" ? `“${g.text}”` : g.text}</span>
          </span>
        </span>
      </span>
    </span>
  );
}

// ---- the weave ------------------------------------------------------------------------

/** After posts 4, 9, 14… (never in the first three, never two in a row),
 *  rotating career → opportunity → moment, with "Your #1 on Connect" taking
 *  the first slot when the board is the student's #1 world. */
export function weaveBreathers(nodes: React.ReactNode[], make: (kind: "top" | "career" | "opportunity" | "moment", slot: number) => React.ReactNode, topAvailable: boolean, boardId = ""): React.ReactNode[] {
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
      const kind = slot === 0 && topAvailable ? "top" : kinds[(slot - (topAvailable ? 1 : 0) + kinds.length) % kinds.length];
      out.push(make(kind, slot));
      slot += 1;
    }
  });
  return out;
}

// ---- the composer: a pro designs their graphic ------------------------------------
//
// Inside the dashboard's Create post, after the body: the words, a
// background from the library (grouped, scrollable), a font, Instagram's
// text-background toggle, alignment and a sticker. A live preview shows
// exactly what students will see. Pros never upload images.

const STICKERS = ["✨", "💡", "📈", "🎯", "🛠️", "🎓", "💼", "🔥", "🚀", "🧠", "❤️", "🏆"];
const GROUPS: Template["group"][] = ["Gradients", "Patterns", "Paper", "Scenes"];

export function GraphicDesigner({ pro, body, value, onChange }: { pro: Pro; body: string; value: InsightGraphic | null; onChange: (g: InsightGraphic | null) => void }) {
  // Stories-style (Chandu, 2 Oct 2026: "the composer is too complex, a LONG
  // list; simplify the UI without losing the customization"): the preview on
  // one side, four compact tabs on the other, one panel at a time, and a
  // Shuffle for an instant good combination. Every option is still here.
  const on = !!value;
  const g: InsightGraphic = value ?? { text: firstSentence(body, 140), bg: "world", font: "display", align: "center" };
  const set = (patch: Partial<InsightGraphic>) => onChange({ ...g, ...patch });
  const color = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const [panel, setPanel] = useState<"bg" | "text" | "fx" | "sticker">("bg");
  const [group, setGroup] = useState<Template["group"]>(templateById(g.bg).group);
  const chip = (active: boolean) => ({
    borderColor: active ? "var(--primary)" : "var(--glass-border)",
    background: active ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "transparent",
    color: active ? "var(--foreground)" : "var(--muted-foreground)",
  });
  const preview: Insight = { id: "preview", boardId: "", type: "insight", proId: pro.id, title: "", body, postedAgo: "", helpful: 0, replies: [] };
  const surface = g.surface ?? (templateById(g.bg).photo ? "soft" : "none");
  const shuffle = () => {
    const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
    const t = pick(TEMPLATES);
    const fxPool: Effect[] = ["orbs", "sparkles", "rings", "grain", "burst", "quote"];
    setGroup(t.group);
    set({ bg: t.id, font: pick(FONTS).id, align: pick(["left", "center"] as const), valign: pick(["top", "middle", "middle", "bottom"] as const), surface: t.photo ? "soft" : pick(["none", "none", "solid"] as const), effects: [pick(fxPool), ...(Math.random() > 0.5 ? ["grain" as Effect] : [])].filter((x, i, a) => a.indexOf(x) === i) });
  };
  const seg = "dm-quiet cursor-pointer rounded-[6px] border px-[9px] py-[4px] text-[12px] leading-[16px] font-bold";
  const TABS = [
    { key: "bg" as const, label: "Background" },
    { key: "text" as const, label: "Text" },
    { key: "fx" as const, label: "Effects" },
    { key: "sticker" as const, label: "Sticker" },
  ];
  return (
    <div className="flex flex-col gap-[12px] rounded-[var(--radius-md)] border p-[12px]" style={{ borderColor: "var(--glass-border)" }}>
      <div className="flex items-center justify-between gap-[10px]">
        <button type="button" role="switch" aria-checked={on} onClick={() => onChange(on ? null : { ...g, text: g.text || firstSentence(body, 140) })} className="dm-quiet flex cursor-pointer items-center gap-[10px] text-left">
          <span className="relative h-[22px] w-[38px] flex-none rounded-full transition-colors" style={{ background: on ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 18%, transparent)" }}>
            <span className="absolute top-[3px] size-[16px] rounded-full bg-white transition-[left]" style={{ left: on ? 19 : 3 }} />
          </span>
          <span className="flex flex-col">
            <span className="text-[14px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>Add a graphic</span>
            <span className="text-[12.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>Your best line, as a picture in the feed.</span>
          </span>
        </button>
        {on && <button type="button" onClick={shuffle} className={seg} style={chip(false)}>Shuffle</button>}
      </div>
      {on && (
        <div className="grid gap-[14px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-[8px] lg:sticky lg:top-[96px] lg:self-start">
            <InsightGraphicView insight={preview} graphic={g} />
            <textarea aria-label="Words on the graphic" value={g.text} onChange={(e) => set({ text: e.target.value })} rows={2} maxLength={140} className="w-full resize-none rounded-[var(--radius-md)] border px-[10px] py-[8px] text-[14px] leading-[19px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
          </div>
          <div className="flex min-w-0 flex-col gap-[10px]">
            <span role="tablist" aria-label="Customize" className="grid grid-cols-4 gap-[4px] rounded-[8px] border p-[3px]" style={{ borderColor: "var(--glass-border)" }}>
              {TABS.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={panel === t.key} onClick={() => setPanel(t.key)} className="dm-quiet cursor-pointer rounded-[6px] px-[4px] py-[6px] text-[12px] leading-[16px] font-bold" style={{ background: panel === t.key ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: panel === t.key ? "var(--foreground)" : "var(--muted-foreground)" }}>{t.label}</button>
              ))}
            </span>
            {/* one panel at a time, a fixed height so the composer never grows into a long list */}
            <div className="min-h-[196px]">
              {panel === "bg" && (
                <div className="flex flex-col gap-[8px]">
                  <span className="flex flex-wrap gap-[4px]">
                    {GROUPS.map((gr) => <button key={gr} type="button" aria-pressed={group === gr} onClick={() => setGroup(gr)} className={seg} style={chip(group === gr)}>{gr}</button>)}
                  </span>
                  <div className="dm-scroll grid max-h-[150px] grid-cols-4 gap-[6px] overflow-y-auto pr-[2px]">
                    {TEMPLATES.filter((t) => t.group === group).map((t) => {
                      const active = g.bg === t.id;
                      return (
                        <button key={t.id} type="button" aria-pressed={active} aria-label={t.label} title={t.label} onClick={() => set({ bg: t.id, surface: t.photo ? g.surface ?? "soft" : g.surface })} className="dm-tap relative aspect-[16/10] cursor-pointer overflow-hidden rounded-[6px] border-2" style={{ borderColor: active ? "var(--primary)" : "transparent", background: INK }}>
                          <GraphicGround t={t} color={color} sizes="96px" />
                          <span className="absolute inset-0 flex items-center justify-center text-[13px] leading-none font-extrabold" style={{ color: t.ink === "light" ? "#fff" : "#1b1824", fontFamily: "var(--font-display)" }}>Aa</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {panel === "text" && (
                <div className="flex flex-col gap-[10px]">
                  <span className="grid grid-cols-3 gap-[6px]">
                    {FONTS.map((ft) => (
                      <button key={ft.id} type="button" aria-pressed={g.font === ft.id} onClick={() => set({ font: ft.id })} className="dm-quiet flex cursor-pointer flex-col items-center gap-[1px] rounded-[6px] border px-[6px] py-[5px]" style={chip(g.font === ft.id)}>
                        <span className="text-[17px] leading-[20px]" style={ft.style}>Aa</span>
                        <span className="text-[10.5px] leading-[13px] font-bold">{ft.label}</span>
                      </button>
                    ))}
                  </span>
                  <span className="flex flex-wrap items-center gap-[6px]">
                    {(["top", "middle", "bottom"] as const).map((v) => <button key={v} type="button" aria-pressed={(g.valign ?? "middle") === v} onClick={() => set({ valign: v })} className={`${seg} capitalize`} style={chip((g.valign ?? "middle") === v)}>{v}</button>)}
                    <span aria-hidden className="mx-[2px] h-[16px] w-px" style={{ background: "var(--glass-border)" }} />
                    {(["left", "center"] as const).map((a) => <button key={a} type="button" aria-pressed={(g.align ?? "left") === a} onClick={() => set({ align: a })} className={`${seg} capitalize`} style={chip((g.align ?? "left") === a)}>{a}</button>)}
                    <button type="button" aria-pressed={!!g.caps} onClick={() => set({ caps: !g.caps })} className={seg} style={chip(!!g.caps)}>AA</button>
                  </span>
                  <span className="flex flex-wrap items-center gap-[6px]" role="group" aria-label="Text background">
                    {(["none", "soft", "solid"] as const).map((sv) => <button key={sv} type="button" aria-pressed={surface === sv} onClick={() => set({ surface: sv })} className={seg} style={chip(surface === sv)}>{sv === "none" ? "No box" : sv === "soft" ? "Highlight" : "Card"}</button>)}
                  </span>
                </div>
              )}
              {panel === "fx" && (
                <span className="grid grid-cols-3 gap-[6px]" role="group" aria-label="Effects">
                  {EFFECTS.map((ef) => {
                    const active = !!g.effects?.includes(ef.id);
                    return <button key={ef.id} type="button" aria-pressed={active} onClick={() => set({ effects: active ? (g.effects ?? []).filter((x) => x !== ef.id) : [...(g.effects ?? []), ef.id] })} className="dm-quiet cursor-pointer rounded-[6px] border px-[8px] py-[10px] text-[12.5px] leading-[16px] font-bold" style={chip(active)}>{ef.label}</button>;
                  })}
                </span>
              )}
              {panel === "sticker" && (
                <span className="grid grid-cols-7 gap-[6px]" role="group" aria-label="Sticker">
                  <button type="button" aria-pressed={!g.sticker} onClick={() => set({ sticker: undefined })} className="dm-quiet col-span-2 cursor-pointer rounded-[6px] border px-[6px] py-[8px] text-[12px] leading-[16px] font-bold" style={chip(!g.sticker)}>None</button>
                  {STICKERS.map((st) => <button key={st} type="button" aria-pressed={g.sticker === st} aria-label={`Sticker ${st}`} onClick={() => set({ sticker: st })} className="dm-quiet flex aspect-square cursor-pointer items-center justify-center rounded-[6px] border text-[17px]" style={chip(g.sticker === st)}>{st}</button>)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
