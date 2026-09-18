"use client";

// The AT&T x Connected Learning Centers board: Joshua's Connect update
// (Student / Volunteer / Enterprise views) rendered in this app's own
// language -- Connect's board banner, Segmented tabs, Panel surfaces, the
// shared CTA/Follow/Avatar/CompanyChip primitives and the dashboards' metric
// tiles and area chart. Every string comes from attData.ts: the source's
// copy, plus the demo additions noted there (Learn, requests, My Impact,
// reach). Reach first: the board works from anywhere, and a Connected
// Learning Center is one optional way in (direct feedback, 18 Sept 2026).
// Self-contained on purpose: the rest of Connect is untouched, and
// ConnectExperience routes `?board=` here by id.

import Image from "next/image";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark, BookmarkCheck, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye, GraduationCap, Lightbulb, MapPin, Megaphone,
  ExternalLink, Laptop, LifeBuoy, MessageCircleQuestion, MessagesSquare, Sparkles, ThumbsUp, Timer, UserRound, Users, X, FileText, ListChecks,
} from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { flyXp } from "@/components/app/xpFlight";
import { studentAvatarSrc } from "@/lib/avatar";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { MAX_SKILLS_PER_CATEGORY, resumeSnapshot, serverResumeSnapshot, subscribeResume, writeResume } from "@/lib/resume";
import { ALL_PROFILE_CAREERS, DEMO_TOP3, type ProfileCareer } from "@/components/profile/data";
import { careerSlug } from "@/components/career/slug";
import { BarChart, GoalTrack, Histogram, ShareBar } from "../mentorship/charts";
import { motion } from "framer-motion";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { Avatar, Composer, InlineAsk, InsightMark, PrimaryCta, QuietCta, SectionHead, SectionSurface, VerifiedBadge } from "../primitives";
import { AreaChart, MetricTile, Segmented, ruledCell } from "../viz";
import { FollowButton, Panel, ProProfileView, RULE } from "../ProProfile";
import * as D from "./attData";
import { VersionChip, type AttVersion } from "./VersionChip";

const accent = D.ATT.brand.color;
const FIELD_CLASS = "w-full rounded-[var(--radius-md)] border px-[14px] py-[11px] text-[14.5px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:border-[color:var(--primary)]";
const FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
// Nested cards sit a step above the panel they live in (direct feedback,
// 17 Sept 2026: "give some elevation to nested cards, refer how the Replit's
// content is delivered"): a lighter surface plus the same soft shadow the
// panels themselves wear, so title > subtitle > body reads inside each card.
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;

function Eyebrow({ children, tone = accent }: { children: ReactNode; tone?: string }) {
  return <span className="block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone }}>{children}</span>;
}
function Muted({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13.5px] leading-[19px] ${className}`} style={{ color: "var(--muted-foreground)" }}>{children}</p>;
}
function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="dm-link flex w-fit cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>
      {children}
    </button>
  );
}
function Submitted({ text = D.SUBMITTED }: { text?: string }) {
  return (
    <span role="status" className="flex items-center gap-[6px] text-[13.5px] leading-[19px] font-bold" style={{ color: "var(--world-food-farming-nature)" }}>
      <CheckCircle2 className="h-4 w-4" aria-hidden /> {text}
    </span>
  );
}
function PullQuote({ children }: { children: ReactNode }) {
  return <blockquote className="text-[14.5px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>{children}</blockquote>;
}
/** The other boards' engagement pill: a count that is also the toggle. */
function CountPill({ icon: Icon, count, on, onClick, label }: { icon: typeof ThumbsUp; count: number; on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={label} className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-full px-[10px] text-[12px] leading-[16px] font-bold tabular-nums" style={on ? { background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" } : { background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {count}
    </button>
  );
}
/** Opens a professional's profile from anywhere on the board. */
const OpenPro = createContext<(id: string) => void>(() => {});
/** The student's saved picks (or the demo default), so the board speaks to
 *  what they already chose instead of asking again. */
const PicksCtx = createContext<ProfileCareer[]>([]);
function useStudentPicks(): ProfileCareer[] {
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return useMemo(() => {
    const ids = stored.ids.filter((id) => ALL_PROFILE_CAREERS.some((c) => c.id === id));
    return (ids.length ? ids : DEMO_TOP3).map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)!).filter(Boolean);
  }, [stored]);
}

function ProLine({ id, size = 36 }: { id: string; size?: number }) {
  const pro = D.ATT_PROS[id];
  const openPro = useContext(OpenPro);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-[10px]">
      <button type="button" onClick={() => openPro(id)} aria-label={pro.name} className="dm-quiet flex-none cursor-pointer rounded-full"><Avatar name={pro.name} size={size} photo={pro.photo} /></button>
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-[5px] text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>
          <button type="button" onClick={() => openPro(id)} className="dm-link min-w-0 cursor-pointer truncate text-left">{pro.name}</button> <VerifiedBadge size={14} />
        </span>
        {/* one line, always: the designation truncates rather than wrapping,
           so every card's header is the same height and the question below
           starts at the same place (direct feedback, 17 Sept 2026) */}
        {/* no company chip here: everyone on this board is AT&T, the banner
           already says so (direct feedback, 17 Sept 2026) */}
        <span className="block min-w-0 truncate text-[12.5px] leading-[17px]" title={pro.role} style={{ color: "var(--muted-foreground)" }}>{pro.role}</span>
      </div>
    </div>
  );
}

/** XP is the reason to finish: one solid pill, the same wherever XP is
 *  earned on the board. */
function XpPill({ xp, size = "sm" }: { xp: number; size?: "sm" | "md" }) {
  const md = size === "md";
  return (
    <span className={`inline-flex flex-none items-center gap-[4px] rounded-full font-extrabold tabular-nums ${md ? "px-[10px] py-[4px] text-[13px] leading-[17px]" : "px-[8px] py-[2px] text-[11.5px] leading-[15px]"}`} style={{ background: accent, color: "#FFFFFF", boxShadow: `0 6px 16px -8px ${accent}` }}>
      <Sparkles className={md ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden /> +{xp} XP
    </span>
  );
}

// ——— Student ———

function InsightCard({ item, onAsk }: { item: typeof D.STUDENT_INSIGHTS[number]; onAsk: () => void }) {
  const [liked, setLiked] = useState(false);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [comment, setComment] = useState<string>();
  const helpful = item.helpful + (liked ? 1 : 0);
  const comments = item.comments + (comment ? 1 : 0);
  return (
    <article className="relative flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] pt-[var(--space-5)]" style={ITEM}>
      <InsightMark color={accent} />
      <ProLine id={item.pro} />
      <h3 className="text-[16px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.question}</h3>
      <PullQuote>{item.quote}</PullQuote>
      {/* Same row the other boards' insight cards carry: the helpful pill
         with its count, the comment count, then the secondary action pushed
         to the far edge. Ask is the one action that keeps its word (direct
         feedback, 17 Sept 2026). */}
      <div className="mt-auto flex items-center gap-[var(--space-4)] pt-[4px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={D.INSIGHT_ACTIONS.like}
          className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-full px-[10px] text-[12px] leading-[16px] font-bold tabular-nums"
          style={liked ? { background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" } : { background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {D.REPLIT_ONLY ? D.INSIGHT_ACTIONS.like : helpful}
        </button>
        {/* the same pill as Like: both act in place on this card (there is no
           thread to open here), so they share one grammar; Ask, which leaves
           for the Questions tab, is the one worded action */}
        <button
          type="button"
          onClick={() => setComposing((v) => !v)}
          aria-pressed={composing}
          aria-label={D.INSIGHT_ACTIONS.comment}
          className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-full px-[10px] text-[12px] leading-[16px] font-bold tabular-nums"
          style={composing || comment ? { background: "color-mix(in srgb, var(--accent-subtle) 18%, transparent)", color: "var(--accent-subtle)" } : { background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}
        >
          <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {D.REPLIT_ONLY ? D.INSIGHT_ACTIONS.comment : comments}
        </button>
        <button type="button" onClick={onAsk} className="dm-quiet ml-auto flex min-h-[36px] cursor-pointer items-center gap-[5px] rounded-[var(--radius-sm)] px-[8px] text-[12.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>
          <MessageCircleQuestion className="h-4 w-4" aria-hidden /> {D.INSIGHT_ACTIONS.ask}
        </button>
      </div>
      {comment ? (
        <div className="flex items-start gap-[10px] rounded-[var(--radius-md)] p-[12px] text-[13.5px] leading-[19px]" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          <Avatar name="Jordan" size={26} />
          <p className="min-w-0 break-words">{comment}</p>
        </div>
      ) : composing ? (
        <Composer id={`${item.id}-comment`} rows={2} autoFocus accent={accent} value={draft} onChange={setDraft} placeholder={D.INSIGHT_ACTIONS.commentPlaceholder} submitLabel={D.INSIGHT_ACTIONS.post} onSubmit={() => { setComment(draft.trim()); setComposing(false); setDraft(""); }} />
      ) : null}
    </article>
  );
}

/** Three cards side by side from sm up, where the row is already scannable.
 *  On phones a one-card-at-a-time rail (scroll-snap, the next card peeking)
 *  with arrows and dots instead of three tall cards stacked, which read as
 *  clutter (direct feedback, 17 Sept 2026: "manual buttons also so it's
 *  obvious"). No auto-rotation. */
function InsightRail({ onAsk }: { onAsk: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = D.STUDENT_INSIGHTS.length;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      setIndex(Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / (card.offsetWidth + 12)))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);
  const go = (i: number) => {
    const el = ref.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div ref={ref} className="-mx-5 -mt-[24px] flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-5 pt-[24px] pb-[2px] [scrollbar-width:none] sm:mx-0 lg:mt-0 lg:grid lg:grid-cols-3 lg:gap-[var(--space-4)] lg:overflow-visible sm:px-0 lg:pt-0">
        {D.STUDENT_INSIGHTS.map((item) => (
          <div key={item.id} className="w-[86%] flex-none snap-center sm:w-[60%] lg:w-auto">
            <InsightCard item={item} onAsk={onAsk} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-[var(--space-4)] lg:hidden">
        <button type="button" aria-label="Previous insight" onClick={() => go(Math.max(0, index - 1))} disabled={index === 0} className="dm-quiet flex size-[34px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-35" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <div className="flex items-center gap-[6px]" role="tablist" aria-label="Insights">
          {D.STUDENT_INSIGHTS.map((item, i) => (
            <button key={item.id} type="button" role="tab" aria-selected={i === index} aria-label={`Insight ${i + 1} of ${count}`} onClick={() => go(i)} className="dm-quiet cursor-pointer rounded-full transition-all duration-200" style={{ width: i === index ? 18 : 7, height: 7, background: i === index ? accent : "var(--glass-border)" }} />
          ))}
        </div>
        <button type="button" aria-label="Next insight" onClick={() => go(Math.min(count - 1, index + 1))} disabled={index === count - 1} className="dm-quiet flex size-[34px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-35" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

type Opportunity = { id: string; kind: string; title: string; line: string };

/** A chevron that fades in on a clickable card's hover, absolutely placed so
 *  the layout never moves (direct feedback, 17 Sept 2026). Parent: group + relative. */
function HoverChevron({ className = "top-1/2 right-[12px] -translate-y-1/2" }: { className?: string }) {
  return <ChevronRight aria-hidden className={`pointer-events-none absolute h-[18px] w-[18px] opacity-0 transition-all duration-150 group-hover:translate-x-[2px] group-hover:opacity-100 ${className}`} style={{ color: "var(--muted-foreground)" }} />;
}

/** Open / Registration open / Opening soon / Upcoming, colored by whether a
 *  student can act now (direct feedback, 17 Sept 2026). */
function StatusChip({ id, short = false }: { id: string; short?: boolean }) {
  const d = D.OPPORTUNITY_DETAILS[id];
  if (!d) return null;
  const U = D.OPPORTUNITY_UI;
  const key = d.status === "scheduled" ? "upcoming" : d.status;
  const label = short ? U.short[key] : key === "open" ? U.open : key === "soon" ? U.soon : key === "registration" ? U.registration : U.upcoming;
  const live = d.status === "open" || d.status === "registration";
  const tone = live ? "var(--world-food-farming-nature)" : d.status === "soon" ? "var(--world-business-money-office)" : "var(--muted-foreground)";
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full px-[8px] py-[1px] text-[11px] leading-[15px] font-bold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}>
      {live && <span aria-hidden className="size-[6px] rounded-full" style={{ background: tone }} />}{label}
    </span>
  );
}

/** A calendar tile: month over day. */
function DateTile({ month, day, size = "md" }: { month: string; day: number; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <span aria-label={`${month} ${day}`} className={`flex flex-none flex-col items-center justify-center rounded-[var(--radius-sm)] border ${sm ? "h-[40px] w-[40px]" : "h-[48px] w-[48px]"}`} style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 10%, var(--glass-surface-1))` }}>
      <span className={`${sm ? "text-[9px]" : "text-[10px]"} leading-none font-extrabold tracking-[0.08em] uppercase`} style={{ color: accent }}>{month}</span>
      <span className={`${sm ? "text-[15px] mt-[2px]" : "text-[18px] mt-[3px]"} leading-none font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{day}</span>
    </span>
  );
}
/** "Closes Jan 31" as a short chip. */
function DeadlineChip({ month, day, soon = false }: { month: string; day: number; soon?: boolean }) {
  const tone = soon ? "var(--world-business-money-office)" : "var(--foreground)";
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border px-[8px] py-[2px] text-[11.5px] leading-[15px] font-bold whitespace-nowrap" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: tone }}>
      <Clock className="h-3 w-3" aria-hidden /> {soon ? D.OPPORTUNITY_UI.opens : D.OPPORTUNITY_UI.closes} {month} {day}
    </span>
  );
}
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";
const STATUS_WORDS = /^(Applications open|Opening soon|Registration open)$/;
/** The card's line without what the card already shows elsewhere: the date
 *  (a tile) and the status (the chip), so nothing is said twice:
 *  "College sophomores · Applications open" -> "College sophomores". */
function lineForCard(line: string, d?: D.OpportunityDetail): string {
  const hasDate = !!(d?.date || d?.deadline);
  return line
    .split(" · ")
    .filter((part) => !STATUS_WORDS.test(part) && !(hasDate && new RegExp(`^(Apply by )?(${MONTHS}) \\d`).test(part)))
    .join(" · ");
}
/** When, compact: the tile or the span, the time, and the deadline. */
function WhenLine({ d }: { d: D.OpportunityDetail }) {
  return (
    <span className="flex flex-wrap items-center gap-[10px]">
      {d.date && <DateTile month={d.date.month} day={d.date.day} size="sm" />}
      {d.span && <span className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{d.span}</span>}
      {d.date?.time && <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{d.date.time}</span>}
      {d.deadline && <DeadlineChip month={d.deadline.month} day={d.deadline.day} />}
      {!d.deadline && d.date && d.status === "soon" && <DeadlineChip month={d.date.month} day={d.date.day} soon />}
    </span>
  );
}

/** Interest signals as numbers, not sentences: "312 interested · 47 applied". */
function Signals({ id, className = "" }: { id: string; className?: string }) {
  const d = D.OPPORTUNITY_DETAILS[id];
  if (!d) return null;
  const U = D.OPPORTUNITY_UI;
  const items: [typeof Users, number, string][] = [[Users, d.interested, U.interested]];
  if (d.applied) items.push([CheckCircle2, d.applied, U.applied]);
  if (d.registered) items.push([CheckCircle2, d.registered, U.registered]);
  return (
    <span className={`flex flex-wrap items-center gap-x-[12px] gap-y-[4px] text-[12px] leading-[16px] font-semibold ${className}`} style={{ color: "var(--muted-foreground)" }}>
      {items.map(([Icon, n, label]) => <span key={label} className="flex items-center gap-[5px] tabular-nums"><Icon className="h-3.5 w-3.5" aria-hidden /> {n} {label}</span>)}
    </span>
  );
}

function OpportunityCard({ item, saved, onSave, onOpen, showKind = true }: { item: Opportunity; saved: boolean; onSave: () => void; onOpen: () => void; /** false inside a section whose heading already names the kind */ showKind?: boolean }) {
  const d = D.REPLIT_ONLY ? undefined : D.OPPORTUNITY_DETAILS[item.id];
  // Four things, not eight (direct feedback, 18 Sept 2026: "so super
  // cluttered, minimize the components"): the kind, the title, one line
  // for when and who, and a footer with the status and Save. The date
  // tile, the time and the interest counts all moved into the sheet; the
  // date itself is folded into the line as plain text.
  // A date on a not-yet-open item is when it opens, so say so.
  const when = d?.date ? `${d.status === "soon" ? `${D.OPPORTUNITY_UI.opens} ` : ""}${d.date.month} ${d.date.day}` : null;
  const line = [when, d ? lineForCard(item.line, d) : item.line].filter(Boolean).join(" · ");
  return (
    <div className="dm-tap group relative flex h-full flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
      {/* the whole card opens the detail sheet; Save stays its own control */}
      {d && <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">Open {item.title}</span></button>}
      {d && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "rgba(255,255,255,0.03)" }} />}
      {d && <HoverChevron />}
      {showKind && <Eyebrow>{item.kind}</Eyebrow>}
      <h3 className="line-clamp-2 min-w-0 text-[16px] leading-[22px] font-bold" title={item.title} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.title}</h3>
      <Muted>{line}</Muted>
      <div className="relative z-20 mt-auto flex items-center justify-between gap-[10px] pt-[8px]">
        {d ? <StatusChip id={item.id} short /> : <span />}
        <QuietCta size="sm" done={saved} onClick={onSave} className="flex-none">
          {saved ? <><BookmarkCheck className="h-4 w-4" aria-hidden /> {D.SAVE.saved}</> : <><Bookmark className="h-4 w-4" aria-hidden /> {D.SAVE.save}</>}
        </QuietCta>
      </div>
    </div>
  );
}

/** The opportunity's sheet, in the Panel language: one column, eyebrow over
 *  title over subtitle, a ruled facts list (no boxes, no icons), the About
 *  paragraph as the body, one accordion for the how, and a single action
 *  row. Same chrome as Connect's Ask sheet (direct feedback, 17 Sept 2026:
 *  title > subtitle > body, breathing room, nothing competing). */
function OpportunitySheet({ item, saved, onSave, inPlan, onPlan, onClose }: { item: Opportunity; saved: boolean; onSave: () => void; inPlan: boolean; onPlan: () => void; onClose: () => void }) {
  const d = D.OPPORTUNITY_DETAILS[item.id];
  const U = D.OPPORTUNITY_UI;
  const router = useRouter();
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  const resumeLabel = /internship|scholarship|job shadow/i.test(item.kind) ? "Tailor your résumé" : "Build your résumé";
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-labelledby="att-opp-title">
      <button type="button" aria-label={U.close} onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[14px]" style={{ background: "rgba(5,7,15,0.6)" }} />
      <div className="relative z-[1] flex max-h-[calc(100dvh-96px)] w-full max-w-[520px] flex-col overflow-y-auto rounded-[var(--radius-xl)] border sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
        <button type="button" onClick={onClose} aria-label={U.close} className="dm-quiet absolute top-[14px] right-[14px] z-10 flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>

        {/* header: status, title, the numbers. No eyebrow (the title names
           the kind) and no subtitle (the facts below say who and when). */}
        <div className="flex flex-col gap-[10px] px-[var(--space-6)] pt-[var(--space-6)] pr-[56px]">
          <div><StatusChip id={item.id} /></div>
          <h2 id="att-opp-title" className="text-[24px] leading-[30px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h2>
          <Signals id={item.id} />
        </div>

        {d && (
          <>
            {/* body */}
            <p className="px-[var(--space-6)] pt-[var(--space-5)] text-[15px] leading-[23px]" style={{ color: "var(--foreground)" }}>{d.about}</p>

            {/* facts: ruled rows, label then value */}
            <dl className="mx-[var(--space-6)] mt-[var(--space-5)] border-t" style={{ borderColor: RULE }}>
              {([[U.who, d.who], [U.when, <WhenLine key="when" d={d} />], [U.where, d.where], [U.how, d.how]] as [string, ReactNode][]).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[88px_1fr] gap-[var(--space-4)] border-b py-[12px]" style={{ borderColor: RULE }}>
                  <dt className="pt-[2px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{k}</dt>
                  <dd className="text-[14px] leading-[20px]">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {/* one action row: the primary, the résumé step, and Save as an icon */}
        <div className="flex items-center gap-[10px] px-[var(--space-6)] pt-[var(--space-5)] pb-[var(--space-6)]">
          {inPlan ? <QuietCta size="sm" done onClick={onPlan}><ListChecks className="h-4 w-4" aria-hidden /> {U.inPlan}</QuietCta> : <PrimaryCta size="sm" onClick={onPlan}><ListChecks className="h-4 w-4" aria-hidden /> {U.addPlan}</PrimaryCta>}
          <QuietCta size="sm" onClick={() => router.push("/profile?tab=resume")}><FileText className="h-4 w-4" aria-hidden /> {resumeLabel}</QuietCta>
          <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? D.SAVE.saved : D.SAVE.save} className="dm-quiet ml-auto flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-[var(--radius-sm)]" style={{ color: saved ? "var(--accent-subtle)" : "color-mix(in srgb, var(--muted-foreground) 75%, transparent)" }}>
            <Bookmark className="h-4 w-4" aria-hidden fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ——— shared chrome (sheet, toast) ———

/** The Mentorship tab's sheet, in this board's colours: a centred card on
 *  desktop, a bottom sheet on the phone, Escape closes. */
function Sheet({ title, label, onClose, children, titleId }: { title: string; label?: string; onClose: () => void; children: ReactNode; titleId: string }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[14px]" style={{ background: "rgba(5,7,15,0.6)" }} />
        <div className="relative z-[1] flex max-h-[calc(100dvh-96px)] w-full max-w-[520px] flex-col gap-[var(--space-4)] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet absolute top-[14px] right-[14px] z-10 flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
          <div className="flex flex-col gap-[6px] pr-[40px]">
            {label && <Eyebrow>{label}</Eyebrow>}
            <h2 id={titleId} className="text-[22px] leading-[27px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h2>
          </div>
          {children}
        </div>
      </div>
    </Portal>
  );
}

function useToast(): [ReactNode, (text: string) => void] {
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);
  const node = toast ? (
    <Portal>
      <div role="status" className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] -translate-x-1/2 rounded-full border px-[16px] py-[10px] text-[13.5px] font-semibold whitespace-nowrap" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 18px 44px -20px rgba(0,0,0,0.7)" }}>
        {toast}
      </div>
    </Portal>
  ) : null;
  return [node, setToast];
}

/** A thin progress bar in the brand blue; complete turns green. */
function Progress({ pct, label }: { pct: number; label: string }) {
  const done = pct >= 100;
  return (
    <div className="h-[6px] w-full overflow-hidden rounded-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} style={{ background: "rgba(255,255,255,0.1)" }}>
      <span className="block h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${Math.max(pct, 2)}%`, background: done ? "var(--world-food-farming-nature)" : accent }} />
    </div>
  );
}

// ——— Student ———

/** The one program theme, as something to do: the planner's student
 *  prompt is a button into Explore, Ask is one tap away, and the line
 *  underneath says what volunteers are adding this month. */
function ThemeCard() {
  const router = useRouter();
  const picks = useContext(PicksCtx);
  return (
    <div className="relative flex flex-col gap-[var(--space-3)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 18%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))` }}>
      <Eyebrow>{D.THEME.eyebrow} · {D.THEME.month}</Eyebrow>
      <h3 className="text-[20px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.THEME.theme}</h3>
      {picks.length ? (
        // the picks they already made, each a way into its career page
        <div className="flex flex-col gap-[8px]">
          <Eyebrow tone="var(--muted-foreground)">{D.THEME.withPicks}</Eyebrow>
          <div className="flex flex-wrap items-center gap-[8px]">
          {picks.map((c) => (
            <button key={c.id} type="button" onClick={() => router.push(`/career/${careerSlug(c.title)}`)} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[13px] leading-[17px] font-bold" style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
              {c.title} <ChevronRight className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            </button>
          ))}
          </div>
        </div>
      ) : (
        <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{D.THEME.student}</p>
      )}
      <div className="pt-[2px]">
        {picks.length
          ? <PrimaryCta size="sm" onClick={() => router.push(D.THEME.planHref)}><ListChecks className="h-4 w-4" aria-hidden /> {D.THEME.plan}</PrimaryCta>
          : <PrimaryCta size="sm" onClick={() => router.push(D.THEME.exploreHref)}>{D.THEME.explore} <ChevronRight className="h-4 w-4" aria-hidden /></PrimaryCta>}
      </div>
    </div>
  );
}

/** The pulse: set in the planner, paid in XP, and it picks the student's
 *  next module (direct feedback, 18 Sept 2026: "why should a student see
 *  it, answer it?"). */
function PollCard({ openModule }: { openModule: (m: D.LearnModule) => void }) {
  const [pick, setPick] = useState<string>();
  const ref = useRef<HTMLDivElement>(null);
  const next = pick ? D.LEARN_MODULES.find((m) => m.id === D.POLL.next[pick]) : undefined;
  const vote = (option: string) => {
    setPick(option);
    flyXp({ from: ref.current, amount: D.POLL.xp, milestone: `AT&T pulse · ${D.POLL.eyebrow}`, tone: accent });
  };
  return (
    // its own row: the question on the left, the answer on the right, so
    // the results opening never stretches a neighbour
    <div ref={ref} className="grid grid-cols-1 gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center sm:p-[var(--space-5)]" style={ITEM}>
      <div className="flex flex-col gap-[6px]">
        <Eyebrow tone="var(--muted-foreground)">{D.POLL.eyebrow}</Eyebrow>
        <span className="text-[17px] leading-[23px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.POLL.question}</span>
        <Muted>{pick ? `${D.POLL.responses + 1} ${D.POLL.answered}` : D.POLL.cadence}</Muted>
      </div>
      {pick ? (
        <div className="flex flex-col gap-[8px]">
          <ul className="grid grid-cols-1 gap-[6px] sm:grid-cols-2">
            {D.POLL.options.map((option) => {
              const pct = D.POLL.results[option] ?? 0;
              const mine = option === pick;
              return (
                <li key={option} className="relative overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: mine ? `color-mix(in srgb, ${accent} 55%, var(--glass-border))` : "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span aria-hidden className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: mine ? `color-mix(in srgb, ${accent} 30%, transparent)` : "rgba(255,255,255,0.06)" }} />
                  <span className="relative flex items-center justify-between gap-[10px] px-[12px] py-[7px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--foreground)" }}>
                    <span className="flex items-center gap-[6px]">{option} {mine && <CheckCircle2 className="h-4 w-4" aria-hidden style={{ color: accent }} />}</span>
                    <span className="tabular-nums" style={{ color: mine ? accent : "var(--muted-foreground)" }}>{pct}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
          {next && (
            <button type="button" onClick={() => openModule(next)} className="dm-quiet group flex cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[8px] text-left" style={{ background: `color-mix(in srgb, ${accent} 10%, var(--glass-surface-1))`, borderColor: `color-mix(in srgb, ${accent} 35%, var(--glass-border))` }}>
              <BookOpen className="h-4 w-4 flex-none" aria-hidden style={{ color: accent }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: accent }}>{D.POLL.nextLabel}</span>
                <span className="block truncate text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{next.title}</span>
              </span>
              <XpPill xp={next.xp} />
              <ChevronRight className="h-4 w-4 flex-none transition-transform duration-150 group-hover:translate-x-[2px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[8px]">
          {D.POLL.options.map((option) => <QuietCta key={option} size="sm" onClick={() => vote(option)}>{option}</QuietCta>)}
        </div>
      )}
    </div>
  );
}

type LearnState = { progress: Record<string, number>; openModule: (m: D.LearnModule) => void };

/** One module in progress, as one row: the next fifteen minutes, from
 *  anywhere. The Learn tab holds the rest. */
function ContinueLearning({ progress, openModule }: LearnState) {
  const next = D.LEARN_MODULES.find((m) => progress[m.id] > 0 && progress[m.id] < 100) ?? D.LEARN_MODULES.find((m) => progress[m.id] < 100) ?? D.LEARN_MODULES[0];
  const pct = progress[next.id];
  const left = Math.max(1, Math.round((next.minutes * (100 - pct)) / 100));
  return (
    <button type="button" onClick={() => openModule(next)} className="dm-quiet group flex w-full cursor-pointer flex-wrap items-center gap-[14px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left sm:flex-nowrap" style={ITEM}>
      <span className="flex size-[40px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}><BookOpen className="h-5 w-5" aria-hidden /></span>
      <span className="min-w-0 flex-1 basis-[60%]">
        <Eyebrow tone="var(--muted-foreground)">{D.LEARN.continueEyebrow}</Eyebrow>
        <span className="block text-[15.5px] leading-[21px] font-bold text-balance sm:truncate" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{next.title}</span>
        <span className="mt-[6px] flex items-center gap-[10px]">
          <span className="hidden w-[140px] sm:block"><Progress pct={pct} label={`${next.title} progress`} /></span>
          <Muted>{left} {D.LEARN.sheet.minutes} left</Muted>
        </span>
      </span>
      <span className="flex w-full items-center justify-end gap-[10px] sm:w-auto">
        <XpPill xp={next.xp} />
        <ChevronRight className="h-4 w-4 flex-none transition-transform duration-150 group-hover:translate-x-[2px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      </span>
    </button>
  );
}

/** Device and tutoring requests: the two things AT&T already provides at
 *  scale, from anywhere, one tap each. */
/** One question, chips for answers. */
function ChoiceQuestion({ label, options, value, onPick }: { label: string; options: readonly string[]; value?: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <Eyebrow tone="var(--muted-foreground)">{label}</Eyebrow>
      <div className="flex flex-wrap gap-[6px]">
        {options.map((o) => <QuietCta key={o} size="sm" done={value === o} onClick={() => onPick(o)}>{o}</QuietCta>)}
      </div>
    </div>
  );
}

function HelpRow({ onToast }: { onToast: (t: string) => void }) {
  const [open, setOpen] = useState<"device" | "tutor">();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [requested, setRequested] = useState(false);
  const close = () => { setOpen(undefined); setAnswers({}); };
  const H = D.HELP;
  const pick = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));
  const deviceReady = ["what", "have", "use", "get"].every((k) => answers[k]);
  const tiles = [
    { key: "device" as const, Icon: Laptop, title: H.device.title, line: requested ? H.device.status : H.device.line, done: requested },
    { key: "tutor" as const, Icon: LifeBuoy, title: H.tutor.title, line: H.tutor.line, done: false },
  ];
  return (
    <>
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        {tiles.map((t) => (
          <button key={t.key} type="button" onClick={() => setOpen(t.key)} className="dm-quiet group flex cursor-pointer items-center gap-[14px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={ITEM}>
            <span className="flex size-[40px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${t.done ? "var(--world-food-farming-nature)" : accent} 16%, transparent)`, color: t.done ? "var(--world-food-farming-nature)" : accent }}>{t.done ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <t.Icon className="h-5 w-5" aria-hidden />}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15.5px] leading-[21px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{t.title}</span>
              <Muted>{t.line}</Muted>
            </span>
            <ChevronRight className="h-4 w-4 flex-none transition-transform duration-150 group-hover:translate-x-[2px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          </button>
        ))}
      </div>
      {open === "device" && (
        <Sheet title={H.device.title} label={H.device.kind} onClose={close} titleId="att-help-title">
          {requested ? (
            <>
              <Submitted text={H.device.status} />
              <Muted>{H.device.done}</Muted>
            </>
          ) : (
            <>
              <Muted>{H.device.via}</Muted>
              <ChoiceQuestion label={H.device.what} options={H.device.options} value={answers.what} onPick={(v) => pick("what", v)} />
              <ChoiceQuestion label={H.device.have} options={H.device.haveOptions} value={answers.have} onPick={(v) => pick("have", v)} />
              <ChoiceQuestion label={H.device.use} options={H.device.useOptions} value={answers.use} onPick={(v) => pick("use", v)} />
              <ChoiceQuestion label={H.device.get} options={H.device.getOptions} value={answers.get} onPick={(v) => pick("get", v)} />
              <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}><CheckCircle2 className="h-4 w-4" aria-hidden style={{ color: "var(--world-food-farming-nature)" }} /> {H.device.onFile}</span>
              <div className="pt-[4px]">
                <PrimaryCta size="sm" className={deviceReady ? "" : "pointer-events-none opacity-50"} onClick={() => { if (!deviceReady) return; setRequested(true); onToast(H.device.done); close(); }}>{H.device.submit}</PrimaryCta>
              </div>
            </>
          )}
        </Sheet>
      )}
      {open === "tutor" && (
        <Sheet title={H.tutor.title} label={H.tutor.kind} onClose={close} titleId="att-help-title">
          <Muted>{H.tutor.via}</Muted>
          <span className="flex items-center gap-[6px] text-[13.5px] leading-[19px] font-bold" style={{ color: "var(--world-food-farming-nature)" }}><CheckCircle2 className="h-4 w-4" aria-hidden /> {H.tutor.qualifies}</span>
          <ChoiceQuestion label={H.tutor.what} options={H.tutor.options} value={answers.subject} onPick={(v) => pick("subject", v)} />
          <div className="pt-[4px]">
            <PrimaryCta size="sm" className={answers.subject ? "" : "pointer-events-none opacity-50"} onClick={() => { if (!answers.subject) return; onToast(H.tutor.done); close(); }}>{H.tutor.submit}</PrimaryCta>
          </div>
        </Sheet>
      )}
    </>
  );
}

/** In person is optional: one quiet line at the bottom of Home. */
function NearYou({ onToast }: { onToast: (t: string) => void }) {
  const N = D.NEAR_YOU;
  return (
    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
      <MapPin className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      <span className="min-w-0 flex-1 text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        <strong className="font-bold" style={{ color: "var(--foreground)" }}>{N.name}</strong> · {N.line}
      </span>
      <LinkButton onClick={() => onToast("Centers near you open in Maps")}>{N.cta} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
    </div>
  );
}

function StudentHome({ onAsk, onSeeAll, saves, toggleSave, openOpportunity, progress, openModule, onToast }: { onAsk: () => void; onSeeAll: () => void; saves: Record<string, boolean>; toggleSave: (id: string) => void; openOpportunity: (item: Opportunity) => void; onToast: (t: string) => void } & LearnState) {
  return (
    <>
      <ThemeCard />

      <ContinueLearning progress={progress} openModule={openModule} />
      <HelpRow onToast={onToast} />
      <PollCard openModule={openModule} />

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{D.HOME_OPPORTUNITIES.title}</SectionHead>
          <LinkButton onClick={onSeeAll}>{D.HOME_OPPORTUNITIES.seeAll} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
          {D.HOME_OPPORTUNITIES.items.map((item) => <OpportunityCard key={item.id} item={item} saved={!!saves[item.id]} onSave={() => toggleSave(item.id)} onOpen={() => openOpportunity(item)} />)}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-4)]">
        <SectionHead>{D.INSIGHTS_SECTION.title}</SectionHead>
        <InsightRail onAsk={onAsk} />
      </section>

      <NearYou onToast={onToast} />
    </>
  );
}

function ModuleCard({ m, pct, onOpen }: { m: D.LearnModule; pct: number; onOpen: () => void }) {
  const done = pct >= 100;
  const picks = useContext(PicksCtx);
  const fits = !!m.world && picks.some((c) => c.world === m.world);
  return (
    <div className="dm-tap group relative flex flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">Open {m.title}</span></button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "rgba(255,255,255,0.03)" }} />
      <HoverChevron className="top-[14px] right-[14px]" />
      <div className="flex items-center justify-between gap-[8px] pr-[20px]"><Eyebrow tone="var(--muted-foreground)">{m.career}</Eyebrow>{!done && <XpPill xp={m.xp} />}</div>
      <span className="pr-[20px] text-[15.5px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.title}</span>
      <span className="flex items-center gap-[8px]"><Muted>{m.minutes} {D.LEARN.sheet.minutes}</Muted>{fits && <span className="rounded-full border px-[7px] py-[1px] text-[10.5px] leading-[15px] font-bold tracking-[0.04em] uppercase" style={{ borderColor: `color-mix(in srgb, ${accent} 45%, var(--glass-border))`, color: accent }}>{D.LEARN.fits}</span>}</span>
      <div className="mt-auto flex items-center gap-[10px] pt-[4px]">
        <Progress pct={pct} label={`${m.title} progress`} />
        <span className="flex-none text-[12px] leading-[16px] font-bold tabular-nums" style={{ color: done ? "var(--world-food-farming-nature)" : "var(--muted-foreground)" }}>{done ? <CheckCircle2 className="h-4 w-4" aria-label={D.LEARN.done} /> : `${pct}%`}</span>
      </div>
    </div>
  );
}

function StudentLearn({ progress, openModule }: LearnState) {
  return (
    <section className="flex flex-col gap-[var(--space-6)]">
      {D.LEARN.groups.map((g) => (
        <section key={g.provider} className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-wrap items-baseline gap-x-[10px] gap-y-[2px]">
            <span className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{g.provider}</span>
            <Muted>{g.line} · {D.LEARN.opens} {g.provider}</Muted>
          </div>
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
            {g.modules.map((m) => <ModuleCard key={m.id} m={m} pct={progress[m.id]} onOpen={() => openModule(m)} />)}
          </div>
        </section>
      ))}
    </section>
  );
}

function ModuleSheet({ m, pct, inPlan, onPlan, onAdvance, onAsk, onToast, onClose }: { m: D.LearnModule; pct: number; inPlan: boolean; onPlan: () => void; onAdvance: (from: Element | null) => void; onAsk: () => void; onToast: (t: string) => void; onClose: () => void }) {
  // the résumé is the student's real one: a banked skill lands in Resume Builder
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const onResume = resume.skills.tech.includes(m.skill);
  const bankSkill = () => {
    if (onResume) return;
    if (resume.skills.tech.length >= MAX_SKILLS_PER_CATEGORY) { onToast(D.LEARN.bank.resumeFull); return; }
    writeResume({ skills: { ...resume.skills, tech: [...resume.skills.tech, m.skill] } });
    onToast(D.LEARN.bank.resumeToast);
  };
  const S = D.LEARN.sheet;
  const group = D.LEARN.groups.find((g) => g.modules.some((x) => x.id === m.id));
  const provider = group?.provider ?? "";
  const openUnit = (from: Element | null) => {
    window.open(group?.href ?? "https://www.theachievery.com/en", "_blank", "noopener,noreferrer");
    onAdvance(from);
  };
  const done = pct >= 100;
  const router = useRouter();
  // the XP capsule lifts off from the button itself
  const ctaRef = useRef<HTMLSpanElement>(null);
  return (
    <Sheet title={m.title} label={provider} onClose={onClose} titleId="att-module-title">
      <p className="text-[15px] leading-[23px]" style={{ color: "var(--foreground)" }}>{m.about}</p>
      <div className="flex flex-col gap-[6px]">
        <Eyebrow tone="var(--muted-foreground)">{S.steps}</Eyebrow>
        <ol className="flex flex-col divide-y" style={{ borderColor: RULE }}>
          {m.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-[10px] py-[9px] text-[14px] leading-[20px]" style={{ borderColor: RULE, color: "var(--foreground)" }}>
              <span className="flex size-[20px] flex-none items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>{i + 1}</span> {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-wrap items-center gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
        <XpPill xp={m.xp} size="md" />
        <span className="rounded-full border px-[10px] py-[4px] text-[13px] leading-[17px] font-semibold tabular-nums" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{m.minutes} {S.minutes}</span>
        <span className="rounded-full border px-[10px] py-[4px] text-[13px] leading-[17px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{S.counts} <strong style={{ color: "var(--foreground)" }}>{m.career}</strong></span>
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center justify-between"><Eyebrow tone="var(--muted-foreground)">{S.progress}</Eyebrow><span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{pct}%</span></div>
        <Progress pct={pct} label={`${m.title} progress`} />
        <Muted>{D.LEARN.opens} {provider}. {D.LEARN.sync}.</Muted>
      </div>
      <div className="flex flex-wrap items-center gap-[10px]">
        {done ? <QuietCta size="sm" done>{D.LEARN.done}</QuietCta> : <span ref={ctaRef} className="contents"><PrimaryCta size="sm" onClick={() => openUnit(ctaRef.current?.firstElementChild ?? null)}>{pct > 0 ? D.LEARN.resume : D.LEARN.start} <ExternalLink className="h-4 w-4" aria-hidden /></PrimaryCta></span>}
        {inPlan ? <QuietCta size="sm" done onClick={onPlan}><ListChecks className="h-4 w-4" aria-hidden /> {S.inPlan}</QuietCta> : <QuietCta size="sm" onClick={onPlan}><ListChecks className="h-4 w-4" aria-hidden /> {S.plan}</QuietCta>}
        {m.link && <QuietCta size="sm" onClick={() => router.push(m.link!.href)}><FileText className="h-4 w-4" aria-hidden /> {m.link.label}</QuietCta>}
      </div>
      {/* once a unit has been started, what it turns into here */}
      {pct > 0 && (
        <div className="flex flex-col gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
          <Eyebrow tone="var(--muted-foreground)">{D.LEARN.bank.eyebrow}</Eyebrow>
          <div className="flex flex-wrap items-center gap-[8px]">
            {onResume
              ? <QuietCta size="sm" done>{D.LEARN.bank.onResume} · {m.skill}</QuietCta>
              : <QuietCta size="sm" onClick={bankSkill}><FileText className="h-4 w-4" aria-hidden /> {D.LEARN.bank.resume} · {m.skill}</QuietCta>}
            <QuietCta size="sm" onClick={() => { onClose(); onAsk(); }}><MessageCircleQuestion className="h-4 w-4" aria-hidden /> {D.LEARN.bank.ask}</QuietCta>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function StudentQuestions() {
  const [asked, setAsked] = useState(false);
  const [open, setOpen] = useState<string>();
  const [more, setMore] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const shown = more ? D.RECENT_ANSWERS.items : D.RECENT_ANSWERS.items.slice(0, 2);
  return (
    <>
      <Panel id="att-ask-title" title={D.ASK.eyebrow}>
        {asked ? (
          <div className="flex flex-col gap-[8px]">
            <Submitted text={D.ASK.submitted} />
            <LinkButton onClick={() => setAsked(false)}>{D.ASK.again}</LinkButton>
          </div>
        ) : (
          <InlineAsk joined defaultOpen accent={accent} placeholder={D.ASK.placeholder} onPost={() => setAsked(true)} />
        )}
      </Panel>

      <Panel id="att-answers-title" title={D.RECENT_ANSWERS.eyebrow}>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {shown.map((item) => {
            const isOpen = open === item.id;
            return (
              <li key={item.id} className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
                <h3 className="text-[16px] leading-[22px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.question}</h3>
                <ProLine id={item.pro} size={32} />
                {isOpen && <PullQuote>{item.answer}</PullQuote>}
                <div className="mt-auto flex items-center gap-[var(--space-3)] pt-[2px]">
                  {!D.REPLIT_ONLY && <CountPill icon={ThumbsUp} count={item.helpful + (liked[item.id] ? 1 : 0)} on={!!liked[item.id]} onClick={() => setLiked((m) => ({ ...m, [item.id]: !m[item.id] }))} label={D.INSIGHT_ACTIONS.like} />}
                  {!D.REPLIT_ONLY && <CountPill icon={MessagesSquare} count={item.comments} on={false} onClick={() => setOpen(item.id)} label={D.INSIGHT_ACTIONS.comment} />}
                  <span className="ml-auto"><LinkButton onClick={() => setOpen(isOpen ? undefined : item.id)}>{isOpen ? D.RECENT_ANSWERS.hide : D.RECENT_ANSWERS.read} <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden /></LinkButton></span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <LinkButton onClick={() => setMore((v) => !v)}>{more ? D.RECENT_ANSWERS.less : <>{D.RECENT_ANSWERS.more} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
        </div>
      </Panel>
    </>
  );
}

function StudentOpportunities({ saves, toggleSave, openOpportunity }: { saves: Record<string, boolean>; toggleSave: (id: string) => void; openOpportunity: (item: Opportunity) => void }) {
  // Virtual first is a filter, not a default: the whole list is one tap
  // away, and "In person" is there for students who want it.
  const [filter, setFilter] = useState<D.OpportunityFilter>("all");
  const keep = (id: string) => {
    if (filter === "all") return true;
    const virtual = D.VIRTUAL_WHERE.test(D.OPPORTUNITY_DETAILS[id]?.where ?? "");
    return filter === "virtual" ? virtual : !virtual;
  };
  return (
    <>
      {/* a filter, drawn as light chips so it never reads as a second tab
         bar under the board's tabs (direct feedback, 18 Sept 2026) */}
      <div className="flex flex-wrap items-center gap-[10px]">
        <Eyebrow tone="var(--muted-foreground)">Where</Eyebrow>
        <PeriodChips options={[...D.OPPORTUNITY_FILTERS]} value={filter} onChange={setFilter} />
      </div>
      {D.OPPORTUNITY_GROUPS.map((group) => {
        const items = group.items.filter((i) => keep(i.id));
        if (items.length === 0) return null;
        const mixed = new Set(items.map((i) => i.kind)).size > 1;
        return (
          <section key={group.title} className="flex flex-col gap-[var(--space-4)]">
            <SectionHead>{group.title}</SectionHead>
            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => <OpportunityCard key={item.id} item={item} saved={!!saves[item.id]} onSave={() => toggleSave(item.id)} onOpen={() => openOpportunity(item)} showKind={mixed} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

function StudentPeople({ follows, toggleFollow }: { follows: Record<string, boolean>; toggleFollow: (id: string) => void }) {
  const openPro = useContext(OpenPro);
  return (
    // One AT&T mark for the whole section, faint in the corner, instead of a
    // chip on every card (direct feedback, 17 Sept 2026). Answer counts give
    // a student something to choose on (observation 5, 17 Sept 2026).
    <div className="relative flex flex-col gap-[var(--space-6)]">
      <Image src={D.ATT.brand.markWhite} alt="" width={96} height={40} unoptimized aria-hidden className="pointer-events-none absolute top-[-6px] right-0 h-[64px] w-auto select-none" style={{ opacity: 0.07 }} />
      {D.PEOPLE_ROWS.map((row) => (
        <section key={row.title} className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>{row.title}</SectionHead>
          <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4">
            {row.pros.map((id) => {
              const pro = D.ATT_PROS[id];
              return (
                <div key={id} className="dm-tap group relative flex flex-col items-center gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-center" style={ITEM}>
                  <button type="button" onClick={() => openPro(id)} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">Open {pro.name}</span></button>
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "rgba(255,255,255,0.03)" }} />
                  {!D.REPLIT_ONLY && <HoverChevron className="top-[12px] right-[12px]" />}
                  <Avatar name={pro.name} size={56} photo={pro.photo} />
                  <span className="mt-[4px] flex items-center gap-[5px] text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={14} /></span>
                  <span className="max-w-full truncate text-[12.5px] leading-[17px]" title={pro.role} style={{ color: "var(--muted-foreground)" }}>{pro.role}</span>
                  {!D.REPLIT_ONLY && <span className="text-[12px] leading-[16px] font-bold tabular-nums" style={{ color: accent }}>{D.ANSWER_COUNTS[id]} {D.PEOPLE_ANSWER.answers}</span>}
                  <FollowButton compact following={!!follows[id]} onToggle={() => toggleFollow(id)} className="relative z-20 mt-[8px] w-full" tone={{ background: accent, color: "#FFFFFF" }} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ——— Volunteer ———

function AnswerForm({ id, placeholder, submit, cancel, onCancel, onDone, rows = 3 }: { id: string; placeholder: string; submit: string; cancel?: string; onCancel?: () => void; onDone: () => void; rows?: number }) {
  const [draft, setDraft] = useState("");
  return <Composer id={id} rows={rows} maxLength={400} autoFocus accent={accent} value={draft} onChange={setDraft} placeholder={placeholder} submitLabel={submit} cancelLabel={cancel} onCancel={onCancel} onSubmit={onDone} />;
}

function VolunteerHome() {
  const [state, setState] = useState<"idle" | "composing" | "done">("idle");
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const H = D.VOLUNTEER_HOME;
  const R = D.REQUESTS;
  // the résumé review names the student's latest saved résumé when one exists
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const latest = [...resume.versions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const title = (t: string) => t.replace("{resume}", latest ? `“${latest.name}”` : R.defaultResume);
  return (
    <>
      <Panel id="att-now-title" title={H.title}>
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 18%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))` }}>
          <Eyebrow>{D.THEME.eyebrow} · {D.THEME.month}</Eyebrow>
          <h3 className="text-[20px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.THEME.theme}</h3>
          <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{D.THEME.volunteer}</p>
          <Muted>{D.PULSE.volunteer}</Muted>
          {state === "idle" && <PrimaryCta size="sm" className="w-fit" onClick={() => setState("composing")}>{H.cta}</PrimaryCta>}
          {state === "composing" && <AnswerForm id="att-now-answer" placeholder={H.placeholder} submit={H.submit} cancel={H.cancel} onCancel={() => setState("idle")} onDone={() => setState("done")} />}
          {state === "done" && <Submitted text={D.YOUR_ANSWERS.live} />}
        </div>
      </Panel>

      <Panel id="att-requests-title" title={R.title} aside={<Muted>{R.sub}</Muted>}>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {R.items.map((r) => {
            const on = !!accepted[r.id];
            return (
              <li key={r.id} className="flex flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
                <div className="flex items-center justify-between gap-[8px]">
                  <Eyebrow tone="var(--muted-foreground)">{r.kind}</Eyebrow>
                  <span className="flex items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[11.5px] leading-[15px] font-bold tabular-nums" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}><Timer className="h-3 w-3" aria-hidden /> {r.minutes} {R.minutes}</span>
                </div>
                <span className="text-[15.5px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title(r.title)}</span>
                <Muted>{r.why}</Muted>
                <div className="mt-auto pt-[4px]">
                  {on ? <Submitted text={`${R.accepted} · ${R.acceptedLine}`} /> : <PrimaryCta size="sm" className="w-fit" onClick={() => setAccepted((m) => ({ ...m, [r.id]: true }))}>{R.accept}</PrimaryCta>}
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

function VolunteerQuestions() {
  const Q = D.QUESTIONS_WAITING;
  const Y = D.YOUR_ANSWERS;
  const [more, setMore] = useState(false);
  const [openIdx, setOpenIdx] = useState<number>();
  const [sent, setSent] = useState<Record<number, boolean>>({});
  const shown = more ? Q.items : Q.items.slice(0, 2);
  return (
    <>
      <Panel id="att-waiting-title" title={Q.title} aside={<Muted>{Q.sub}</Muted>}>
        <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {shown.map((question, i) => (
            <li key={question} className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
              <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                <span className="min-w-0 flex-1 text-[15.5px] leading-[21px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{question}</span>
                {sent[i] ? <Submitted text={Y.live} /> : <PrimaryCta size="sm" onClick={() => setOpenIdx(openIdx === i ? undefined : i)}>{Q.answer}</PrimaryCta>}
              </div>
              {openIdx === i && !sent[i] && <AnswerForm id={`att-waiting-${i}`} placeholder={Q.placeholder} submit={Q.send} onDone={() => { setSent((s) => ({ ...s, [i]: true })); setOpenIdx(undefined); }} />}
            </li>
          ))}
        </ul>
        <div className="border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <LinkButton onClick={() => setMore((v) => !v)}>{more ? Q.fewer : <>{Q.more} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
        </div>
      </Panel>

      {/* the loop closed: what happened to the answers already given */}
      <Panel id="att-your-answers-title" title={Y.title} aside={<Muted>{Y.summary}</Muted>}>
        <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
          {Y.items.map((a) => (
            <li key={a.question} className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[4px] py-[10px]" style={{ borderColor: RULE }}>
              <span className="min-w-0 flex-1 text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{a.question}</span>
              <span className="flex items-center gap-[12px] text-[12.5px] leading-[17px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-[4px]"><Eye className="h-3.5 w-3.5" aria-hidden /> {a.reads}</span>
                <span className="flex items-center gap-[4px]"><ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {a.helpful}</span>
                <span>{a.when}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

const IMPACT_ICONS = [Clock, MessagesSquare, Eye, Users];

/** The volunteer's own year: hours climbing, the students behind them, the
 *  ERG sync, and the program calendar folded underneath. */
function VolunteerImpact() {
  const M = D.MY_IMPACT;
  const [calendar, setCalendar] = useState(false);
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div>
        <SectionHead>{M.title}</SectionHead>
        <Muted className="mt-[2px]">{M.sub}</Muted>
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {M.tiles.map((tile, i) => (
            <div key={tile.key} className={`p-[var(--space-4)] ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}>
              <MetricTile icon={IMPACT_ICONS[i]} value={tile.value} label={tile.label} accent={accent} />
            </div>
          ))}
        </div>
      </SectionSurface>
      <Panel id="att-rewards-title" title={M.rewards.eyebrow}>
        <GoalTrack logged={M.rewards.logged} target={M.rewards.target} pace={M.rewards.pace} accent={accent} unit={M.rewards.unit} />
        <Muted>{M.rewards.line}</Muted>
      </Panel>
      <Panel id="att-my-hours-title" title={M.hoursEyebrow} aside={<span className="flex items-center gap-[6px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}><CheckCircle2 className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--world-food-farming-nature)" }} /> {M.believes}</span>}>
        <BarChart values={M.hours} labels={M.months} accent={accent} highlight={M.hours.length - 1} height={150} unit="hours" ariaLabel="Volunteer hours by month" />
      </Panel>
      <Panel id="att-students-helped-title" title={M.studentsEyebrow}>
        <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
          {M.students.map((s) => (
            <li key={s.name} className="flex items-center gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={ITEM}>
              <Avatar name={s.name} size={36} photo={studentAvatarSrc(s.name)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                <Muted>{s.what}</Muted>
              </span>
              <span className="flex-none text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.when}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="flex flex-col gap-[var(--space-4)]">
        <LinkButton onClick={() => setCalendar((v) => !v)}>{calendar ? M.hideCalendar : <>{M.calendar} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
        {calendar && (
          <ol className="grid grid-cols-1 gap-[8px] sm:grid-cols-2 lg:grid-cols-4">
            {D.YEAR_ROUND.year.map(([month, theme]) => {
              const current = month === D.THEME.month;
              return (
                <li key={month} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ background: current ? `color-mix(in srgb, ${accent} 14%, var(--glass-surface-1))` : "var(--glass-surface-1)", borderColor: current ? `color-mix(in srgb, ${accent} 45%, var(--glass-border))` : "var(--glass-border)" }}>
                  <Eyebrow>{month}</Eyebrow>
                  <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{theme}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

// ——— Enterprise ———

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle} className="dm-quiet relative h-[26px] w-[46px] flex-none cursor-pointer rounded-full border transition-colors" style={{ background: on ? accent : "var(--glass-surface-1)", borderColor: on ? accent : "var(--glass-border)" }}>
      <span className="absolute top-[3px] size-[18px] rounded-full bg-white transition-[left] duration-200" style={{ left: on ? 23 : 3, boxShadow: "0 1px 3px rgba(0,0,0,0.35)" }} />
    </button>
  );
}

function Field({ id, value, placeholder, onChange }: { id: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>{placeholder}</label>
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} style={FIELD_STYLE} />
    </>
  );
}

type PeriodState = { source: D.TopicSource; selected: boolean; saved: boolean; editing: boolean; approved: boolean; att: { student: string; volunteer: string } };

/** One card per period: the theme, what students see, what volunteers see.
 *  The source is a chip row underneath, not three panels with three
 *  vocabularies; the header and the chosen topic can no longer disagree. */
function EnterpriseProgram() {
  const P = D.PROGRAM;
  const [autopilot, setAutopilot] = useState(true);
  const [cadence, setCadence] = useState<"monthly" | "biweekly">("monthly");
  const list = cadence === "monthly" ? P.monthly : P.biweekly;
  const [period, setPeriod] = useState<string>(list[0].key);
  const card = list.find((p) => p.key === period) ?? list[0];
  const [states, setStates] = useState<Record<string, PeriodState>>({});
  const st: PeriodState = states[card.key] ?? { source: card.defaultSource, selected: card.dreamari.selected, saved: card.att.saved, editing: false, approved: false, att: { student: card.att.student, volunteer: card.att.volunteer } };
  const set = (patch: Partial<PeriodState>) => setStates((m) => ({ ...m, [card.key]: { ...st, ...patch } }));
  const prompts = st.source === "dreamari" ? { students: card.dreamari.students, volunteers: card.dreamari.employees } : st.source === "att" ? { students: st.att.student, volunteers: st.att.volunteer } : { students: card.school.student, volunteers: card.school.employee };
  const inUse = st.source === "dreamari" ? st.selected : st.source === "att" ? st.saved : st.approved;
  const live = card.period === D.THEME.month;
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <div>
          <SectionHead>{P.title}</SectionHead>
          <Muted className="mt-[2px]">{P.sub}</Muted>
        </div>
        <div className="flex items-center gap-[12px] rounded-[var(--radius-lg)] border px-[14px] py-[10px]" style={ITEM}>
          <div>
            <Eyebrow>{P.autopilot.label}</Eyebrow>
            <Muted>{P.autopilot.sub}</Muted>
          </div>
          <Switch on={autopilot} onToggle={() => setAutopilot((v) => !v)} label={P.autopilot.label} />
        </div>
      </div>

      <Panel id="att-program-title" title={card.period} aside={<Segmented ariaLabel="Cadence" value={cadence} onChange={(k) => { setCadence(k); setPeriod((k === "monthly" ? P.monthly : P.biweekly)[0].key); }} options={[...D.YEAR_ROUND.cadence]} />}>
        <PeriodChips options={list.map((p) => ({ key: p.key, label: p.period }))} value={card.key} onChange={setPeriod} />
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 14%, transparent), transparent 70%), var(--glass-surface-2)`, borderColor: `color-mix(in srgb, ${accent} 28%, var(--glass-border))` }}>
          <div className="flex flex-wrap items-center justify-between gap-[8px]">
            <Eyebrow>{card.period}</Eyebrow>
            {live && <span className="flex items-center gap-[5px] rounded-full px-[8px] py-[2px] text-[11px] leading-[15px] font-bold" style={{ background: "color-mix(in srgb, var(--world-food-farming-nature) 16%, transparent)", color: "var(--world-food-farming-nature)" }}><span aria-hidden className="size-[6px] rounded-full" style={{ background: "currentColor" }} /> {P.current}</span>}
          </div>
          <h3 className="text-[22px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{card.theme}</h3>
          {st.source === "att" && st.editing ? (
            <form className="flex flex-col gap-[8px]" onSubmit={(e) => { e.preventDefault(); set({ saved: true, editing: false }); }}>
              <Field id={`att-stu-${card.key}`} value={st.att.student} placeholder={P.fields.student} onChange={(v) => set({ att: { ...st.att, student: v } })} />
              <Field id={`att-vol-${card.key}`} value={st.att.volunteer} placeholder={P.fields.volunteer} onChange={(v) => set({ att: { ...st.att, volunteer: v } })} />
            </form>
          ) : (
            <dl className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
              {([[P.studentsSee, prompts.students, GraduationCap], [P.volunteersSee, prompts.volunteers, UserRound]] as [string, string, typeof Users][]).map(([k, v, Icon]) => (
                <div key={k} className="flex items-start gap-[10px] rounded-[var(--radius-md)] border p-[12px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
                  <span className="flex size-[30px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}><Icon className="h-4 w-4" aria-hidden /></span>
                  <span className="min-w-0">
                    <dt className="text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{k}</dt>
                    <dd className="text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{v}</dd>
                  </span>
                </div>
              ))}
            </dl>
          )}
          <div className="flex flex-wrap items-center justify-between gap-[10px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
            <div className="flex flex-wrap items-center gap-[8px]">
              <Eyebrow tone="var(--muted-foreground)">{P.topicSource}</Eyebrow>
              <PeriodChips options={D.TOPIC_SOURCES.map((s) => ({ key: s.key, label: s.name }))} value={st.source} onChange={(source) => set({ source })} />
            </div>
            <div className="flex flex-wrap items-center gap-[8px]">
              {st.source === "att" && (st.editing
                ? <PrimaryCta size="sm" onClick={() => set({ saved: true, editing: false })}>{P.actions.save}</PrimaryCta>
                : <QuietCta size="sm" onClick={() => set({ editing: true })}>{P.actions.editShort}</QuietCta>)}
              {st.source === "dreamari" && !inUse && <QuietCta size="sm" onClick={() => set({ selected: false })}>{P.actions.another}</QuietCta>}
              {!st.editing && (inUse
                ? <QuietCta size="sm" done>{P.inUse}</QuietCta>
                : <PrimaryCta size="sm" onClick={() => set(st.source === "dreamari" ? { selected: true } : st.source === "att" ? { saved: true } : { approved: true })}>{st.source === "school" ? P.actions.approve : P.actions.use}</PrimaryCta>)}
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}

const TILE_ICONS = [Users, Laptop, UserRound, Clock, BookOpen, ListChecks];

function EnterpriseImpact() {
  const I = D.IMPACT;
  const [range, setRange] = useState<"month" | "year">("year");
  const [metric, setMetric] = useState<string>(I.trend.metrics[0].key);
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <div>
          <SectionHead>{I.title}</SectionHead>
          <Muted className="mt-[2px]">{I.sub}</Muted>
        </div>
        <Segmented ariaLabel="Range" value={range} onChange={setRange} options={[...I.range]} />
      </div>
      {/* the number a CSR lead takes upstairs, before any activity count */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-center" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 16%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${accent} 30%, var(--glass-border))` }}>
        <div className="flex flex-col gap-[6px]">
          <Eyebrow>{I.outcome.eyebrow} · {range === "month" ? I.range[0].label : I.range[1].label}</Eyebrow>
          <span className="text-[44px] leading-[48px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{I.outcome.value}</span>
          <p className="max-w-[34ch] text-[14.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>{I.outcome.line}</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <Eyebrow tone="var(--muted-foreground)">{I.outcome.funnelLabel}</Eyebrow>
          <Histogram values={I.outcome.funnel.map((f) => f.value)} labels={I.outcome.funnel.map((f) => f.label)} accent={accent} height={110} ariaLabel={I.outcome.funnelLabel} />
        </div>
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-3">
          {I.tiles.map((tile, i) => (
            <div key={tile.key} className={`p-[var(--space-4)] ${ruledCell(i, 3)}`} style={{ borderColor: RULE }}>
              <MetricTile icon={TILE_ICONS[i]} value={range === "month" ? tile.month : tile.year} label={tile.label} accent={accent} />
            </div>
          ))}
        </div>
      </SectionSurface>
      {/* reach beyond the centers, and the hours goal: the two numbers a
         CSR lead is asked for first */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2 xl:grid-cols-4">
        <Panel id="att-devices-title" title={I.devices.eyebrow}>
          <ShareBar parts={I.devices.parts} accent={accent} />
          <span className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}><strong className="font-extrabold tabular-nums">{I.devices.fulfilled}</strong> {I.devices.line.replace("{requests}", String(I.devices.requests)).replace("{waiting}", String(I.devices.waiting))}</span>
          <Muted>{I.devices.next}</Muted>
        </Panel>
        <Panel id="att-reach-title" title={I.reach.eyebrow}>
          <ShareBar parts={I.reach.parts} accent={accent} />
          <Muted>{I.reach.note}</Muted>
        </Panel>
        <Panel id="att-goal-title" title={I.goal.eyebrow}>
          <GoalTrack logged={I.goal.logged} target={I.goal.target} pace={I.goal.pace} accent={accent} unit={I.goal.unit} />
        </Panel>
        <Panel id="att-pulse-title" title={D.PULSE.enterprise}>
          <ShareBar parts={D.POLL.options.map((o) => ({ label: o, value: D.POLL.results[o] ?? 0 }))} accent={accent} />
          <Muted>{D.POLL.question} · {D.POLL.responses} {D.POLL.answered}</Muted>
        </Panel>
      </div>
      <Panel id="att-trend-title" title={I.trend.metrics.find((m) => m.key === metric)?.label ?? ""} aside={<Segmented ariaLabel={I.trend.eyebrow} value={metric} onChange={setMetric} options={I.trend.metrics.map((m) => ({ key: m.key, label: m.label }))} />}>
        <AreaChart points={I.trend.series[metric]} accent={accent} height={170} labels={[I.trend.months[0], I.trend.months[3], I.trend.months[5]]} />
      </Panel>
    </section>
  );
}

function VolunteerShare() {
  const S = D.SHARE;
  const [mode, setMode] = useState<"pick" | "insight" | "opportunity">("pick");
  const [draft, setDraft] = useState("");
  const [type, setType] = useState(S.opportunity.types[0]);
  const [done, setDone] = useState(false);
  const back = () => { setMode("pick"); setDraft(""); setDone(false); };
  if (mode === "pick") {
    return (
      <section className="flex flex-col gap-[var(--space-4)]">
        <SectionHead>{S.title}</SectionHead>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
          {[{ ...S.insight, Icon: Lightbulb, mode: "insight" as const }, { ...S.opportunity, Icon: Megaphone, mode: "opportunity" as const }].map((tile) => (
            <div key={tile.kind} className="flex flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
              <span className="flex size-[40px] items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}><tile.Icon className="h-5 w-5" aria-hidden /></span>
              <Eyebrow>{tile.kind}</Eyebrow>
              <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{tile.line}</p>
              <PrimaryCta size="sm" className="mt-[6px] w-fit" onClick={() => setMode(tile.mode)}>{tile.cta}</PrimaryCta>
            </div>
          ))}
        </div>
      </section>
    );
  }
  const form = mode === "insight" ? S.insight : S.opportunity;
  return (
    <Panel id="att-share-title" title={form.heading} aside={<LinkButton onClick={back}><ChevronLeft className="h-3.5 w-3.5" aria-hidden /> {S.back}</LinkButton>}>
      {done ? (
        <Submitted />
      ) : (
        <Composer
          id="att-share-body"
          rows={4}
          maxLength={400}
          accent={accent}
          value={draft}
          onChange={setDraft}
          placeholder={form.placeholder}
          submitLabel={form.post}
          onSubmit={() => setDone(true)}
          above={mode === "insight" ? (
            <div className="flex flex-col gap-[8px]">
              <span className="text-[14px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>{S.insight.question}</span>
              <div className="flex flex-wrap gap-[6px]">
                {S.insight.chips.map((chip) => <QuietCta key={chip} size="xs" done={draft === chip} onClick={() => setDraft(chip)}>{chip}</QuietCta>)}
              </div>
            </div>
          ) : (
            <label className="flex flex-col gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {S.opportunity.chooseType}
              <select value={type} onChange={(e) => setType(e.target.value)} className={FIELD_CLASS} style={FIELD_STYLE}>
                {S.opportunity.types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          )}
        />
      )}
    </Panel>
  );
}

function PeriodChips<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button key={o.key} type="button" aria-pressed={on} onClick={() => onChange(o.key)} className="dm-quiet min-h-[32px] cursor-pointer rounded-[999px] border px-[12px] text-[12.5px] font-semibold" style={{ borderColor: on ? `color-mix(in srgb, ${accent} 55%, var(--glass-border))` : "var(--glass-border)", background: on ? `color-mix(in srgb, ${accent} 16%, transparent)` : "var(--glass-surface-1)", color: on ? accent : "var(--muted-foreground)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function EnterpriseTeam() {
  const T = D.TEAM;
  const [filter, setFilter] = useState<"all" | "active" | "needs">("all");
  const rows = T.roster.filter((r) => filter === "all" ? true : filter === "needs" ? r.activity === "Needs engagement" : r.activity !== "Needs engagement");
  const activityStyle = (a: string) => a === "Needs engagement"
    ? { color: "var(--world-business-money-office)", background: "color-mix(in srgb, var(--world-business-money-office) 14%, transparent)" }
    : { color: "var(--world-food-farming-nature)", background: "color-mix(in srgb, var(--world-food-farming-nature) 14%, transparent)" };
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div>
        <SectionHead>{T.title}</SectionHead>
        <Muted className="mt-[2px]">{T.sub}</Muted>
      </div>
      <Panel id="att-top-title" title={T.topEyebrow}>
        <ol className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-3">
          {T.top.map((row, i) => (
            <li key={row.pro} className="flex flex-wrap items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
              <span className="flex size-[28px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold tabular-nums" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>{i + 1}</span>
              <div className="min-w-[200px] flex-1"><ProLine id={row.pro} /></div>
              <dl className="grid flex-none grid-cols-3 gap-[var(--space-4)] text-center">
                {[[row.reached, T.topLabels.reached], [String(row.answers), T.topLabels.answers], [String(row.hours), T.topLabels.hours]].map(([v, l]) => (
                  <div key={l} className="min-w-[56px]">
                    <dt className="text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</dt>
                    <dd className="text-[16px] leading-[21px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel id="att-roster-title" title={T.rosterTitle} aside={<Segmented ariaLabel="Roster filter" value={filter} onChange={setFilter} options={[...T.filters]} />}>
        <div className="-mx-[var(--space-5)] overflow-x-auto px-[var(--space-5)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px] leading-[19px]">
            <thead>
              <tr>
                {T.columns.map((c) => <th key={c} scope="col" className="pb-[10px] text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pro = D.ATT_PROS[r.pro];
                return (
                  <tr key={r.pro} className="border-t" style={{ borderColor: RULE }}>
                    <td className="py-[12px] pr-[12px]"><span className="flex items-center gap-[8px] font-bold" style={{ color: "var(--foreground)" }}><Avatar name={pro.name} size={28} photo={pro.photo} /> {pro.name}</span></td>
                    <td className="py-[12px] pr-[12px]" style={{ color: "var(--muted-foreground)" }}>{pro.role}</td>
                    <td className="py-[12px] pr-[12px]"><span className="rounded-[999px] px-[10px] py-[3px] text-[12px] font-bold" style={activityStyle(r.activity)}>{r.activity}</span></td>
                    <td className="py-[12px] pr-[12px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.reached} {T.topLabels.reached}</td>
                    <td className="py-[12px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.hours} hrs</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:flex-row sm:items-center sm:justify-between" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 26%, #0e0c20), #0e0c20)`, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}>
        <div className="flex flex-col gap-[8px]">
          <Eyebrow tone="#FFFFFFB3">{T.footer.eyebrow}</Eyebrow>
          <div className="flex gap-[var(--space-6)]">
            {T.footer.stats.map((s) => (
              <div key={s.label}>
                <span className="block text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{s.value}</span>
                <span className="block text-[12px] leading-[16px] font-semibold" style={{ color: "#FFFFFFB3" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <QuietCta size="sm" className="w-fit" onClick={() => {}}><Download className="h-4 w-4" aria-hidden /> {T.footer.cta}</QuietCta>
      </div>
    </section>
  );
}

// ——— the board ———

/** Student / Volunteer / Enterprise are three audiences of the same board,
 *  not three tabs a student would ever see; the switch exists so a demo can
 *  flip between them. Same language as Connect's RoleTabs at the top of the
 *  page: a small Demo chip, muted, that reveals the switcher, which then
 *  stays open while a non-student view is showing so the way back is
 *  visible (direct feedback, 17 Sept 2026: "these are only for demo
 *  purposes and shouldn't feel part of the UI"). */
function DemoViewSwitch({ view, onPick }: { view: D.AttView; onPick: (view: D.AttView) => void }) {
  // Open by default while a non-student view is showing, but the chip
  // always toggles: pressing Demo again closes it (direct feedback, 18
  // Sept 2026). Re-keyed on the view by the parent so picking another
  // view re-opens it without an effect.
  const [open, setOpen] = useState(view !== "student");
  const show = open;
  return (
    <div className="flex min-w-0 items-center justify-end gap-[10px]">
      <button
        type="button"
        aria-expanded={show}
        aria-controls="att-demo-views"
        onClick={() => setOpen((v) => !v)}
        className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
        style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
      >
        Demo
      </button>
      {show && (
        <div id="att-demo-views" role="tablist" aria-label="Show this board as" className="flex min-w-0 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          {D.VIEWS.map((option) => {
            const on = option.key === view;
            return (
              <button key={option.key} type="button" role="tab" aria-selected={on} onClick={() => onPick(option.key)} className="dm-quiet flex min-h-[28px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[12px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: on ? "var(--glass-surface-2)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: on ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>
                {option.label.replace(/ View$/, "")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AttCommunityView({ onBack, backLabel = D.BACK, version, onVersion }: { onBack: () => void; backLabel?: string; version: AttVersion; onVersion: (v: AttVersion) => void }) {
  const [view, setView] = useState<D.AttView>("student");
  const [studentTab, setStudentTab] = useState<typeof D.STUDENT_TABS[number]["key"]>("home");
  const [volunteerTab, setVolunteerTab] = useState<typeof D.VOLUNTEER_TABS[number]["key"]>("home");
  const [enterpriseTab, setEnterpriseTab] = useState<typeof D.ENTERPRISE_TABS[number]["key"]>("impact");
  // Switching a section swaps the whole panel, and the browser reset the
  // page to the top while the new one mounted (direct feedback, 18 Sept
  // 2026: "keep me in my context"). Remember where the reader was and put
  // them back before the paint.
  const keepY = useRef<number | null>(null);
  const keep = <T,>(set: (v: T) => void) => (v: T) => { keepY.current = window.scrollY; set(v); };
  useLayoutEffect(() => {
    if (keepY.current == null) return;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo(0, Math.min(keepY.current, max));
    keepY.current = null;
  }, [studentTab, volunteerTab, enterpriseTab]);
  // Learn: progress per module, the module open in its sheet, and the toast
  // that confirms XP and plan changes. Local to the prototype.
  const [progress, setProgress] = useState<Record<string, number>>(() => Object.fromEntries(D.LEARN_MODULES.map((m) => [m.id, m.progress])));
  const [module, setModule] = useState<D.LearnModule>();
  const [toast, onToast] = useToast();
  const picks = useStudentPicks();
  const advance = (m: D.LearnModule, from: Element | null) => {
    const next = Math.min(100, (progress[m.id] ?? 0) + 40);
    setProgress((p) => ({ ...p, [m.id]: next }));
    const flew = flyXp({ from, amount: m.xp, milestone: `${D.LEARN.xpMilestone} · ${m.id} · ${next}`, tone: accent });
    onToast(next >= 100 ? `${D.LEARN.done} · +${m.xp} ${D.LEARN.sheet.xp}` : flew ? `+${m.xp} ${D.LEARN.sheet.xp} · ${next}%` : `${next}% · progress saved`);
  };
  const [saves, setSaves] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<string>();
  const [opportunity, setOpportunity] = useState<Opportunity>();
  const toggleSave = (id: string) => setSaves((m) => ({ ...m, [id]: !m[id] }));
  const togglePlan = (id: string) => setPlan((m) => ({ ...m, [id]: !m[id] }));
  const toggleFollow = (id: string) => setFollows((m) => ({ ...m, [id]: !m[id] }));
  const ink = "#f6f5fb";

  // A person's profile is the same page every other professional has, with
  // Back returning to the board exactly as it was (direct feedback, 17 Sept
  // 2026: "make sure profiles are openable and match the other professional
  // profiles").
  if (profile) {
    const pro = D.ATT_PRO_RECORDS[profile];
    // Back names the tab the person was opened from ("Back to People",
    // "Back to Questions"); from a Home tab it names the community itself.
    const tabs = view === "student" ? D.STUDENT_TABS : view === "volunteer" ? D.VOLUNTEER_TABS : D.ENTERPRISE_TABS;
    const key = view === "student" ? studentTab : view === "volunteer" ? volunteerTab : enterpriseTab;
    const tab = (tabs as readonly { key: string; label: string }[]).find((t) => t.key === key);
    const profileBack = `Back to ${!tab || tab.key === "home" ? "the AT&T community" : tab.label}`;
    return <ProProfileView key={pro.id} pro={pro} follows={Object.fromEntries(Object.entries(follows).map(([k, v]) => [`att-${k}`, v]))} onFollow={() => toggleFollow(profile)} onBack={() => setProfile(undefined)} backLabel={profileBack} />;
  }

  return (
    <OpenPro.Provider value={D.REPLIT_ONLY ? () => {} : setProfile}>
    <PicksCtx.Provider value={picks}>
      {opportunity && <OpportunitySheet item={opportunity} saved={!!saves[opportunity.id]} onSave={() => toggleSave(opportunity.id)} inPlan={!!plan[opportunity.id]} onPlan={() => togglePlan(opportunity.id)} onClose={() => setOpportunity(undefined)} />}
      {module && <ModuleSheet m={module} pct={progress[module.id]} inPlan={!!plan[module.id]} onPlan={() => { togglePlan(module.id); onToast(plan[module.id] ? "Removed from My Plan" : "Added to My Plan"); }} onAdvance={(from) => advance(module, from)} onAsk={() => { setView("student"); setStudentTab("questions"); }} onToast={onToast} onClose={() => setModule(undefined)} />}
      {toast}
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}
        </button>
        <div className="flex min-w-0 items-center gap-[10px]">
          <VersionChip version={version} onChange={onVersion} />
          <DemoViewSwitch key={view} view={view} onPick={setView} />
        </div>
      </div>

      {/* Same identity banner as every other board (BoardView), wearing
         AT&T's own mark and cover. */}
      <section
        aria-label="Community overview"
        className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-5)] sm:min-h-[300px] sm:px-[var(--space-8)] sm:py-[var(--space-6)]"
        style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`, fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
      >
        <Image src={D.ATT.brand.cover} alt="" fill sizes="1280px" className="object-cover" style={{ objectPosition: "50% 40%" }} />
        <CardProgressiveBlur size="64%" />
        <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.9) 0%, rgba(12,16,35,0.6) 40%, rgba(12,16,35,0.18) 70%, transparent 100%), ${cardTopScrim()}` }} />
        <Image src={D.ATT.brand.markWhite} alt="AT&T" width={96} height={40} unoptimized className="absolute top-[var(--space-5)] right-[var(--space-6)] z-10 h-[30px] w-auto sm:top-[var(--space-6)] sm:right-[var(--space-8)] sm:h-[36px]" />
        <div className="relative z-10 min-w-0 pr-[84px] sm:pr-[110px]">
          <span className="text-[11.5px] leading-[15px] font-extrabold tracking-[0.1em] uppercase" style={{ color: `color-mix(in srgb, ${accent} 60%, ${ink})` }}>{D.ATT.eyebrow}</span>
          <h1 className="mt-[6px] text-[24px] leading-[28px] font-extrabold text-balance sm:text-[34px] sm:leading-[38px]" style={{ color: ink }}>{D.ATT.name}</h1>
          <p className="mt-[8px] max-w-[62ch] text-[14px] leading-[20px] font-semibold" style={{ color: `color-mix(in srgb, ${ink} 82%, transparent)`, fontFamily: "var(--font-body)" }}>{D.ATT.about}</p>
        </div>
        <div className="relative z-10 mt-[var(--space-4)] flex w-full flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] border-t pt-[10px] text-[13px] leading-[18px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${ink} 18%, transparent)`, color: `color-mix(in srgb, ${ink} 62%, transparent)` }}>
          {D.ATT.stats.map((s, i) => (
            <span key={s.label}>{i > 0 && <span className="mr-[var(--space-3)]">·</span>}<strong className="font-extrabold" style={{ color: `color-mix(in srgb, ${ink} 90%, transparent)` }}>{s.value}</strong> {s.label}</span>
          ))}
        </div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        {/* the board's own tabs, the one row a student actually uses; full
           width on phones so four labels never truncate */}
        <div className="w-full sm:w-fit">
          {view === "student" && <Segmented ariaLabel="Student section" value={studentTab} onChange={keep(setStudentTab)} options={[...D.STUDENT_TABS]} grow />}
          {view === "volunteer" && <Segmented ariaLabel="Volunteer section" value={volunteerTab} onChange={keep(setVolunteerTab)} options={[...D.VOLUNTEER_TABS]} grow />}
          {view === "enterprise" && <Segmented ariaLabel="Enterprise section" value={enterpriseTab} onChange={keep(setEnterpriseTab)} options={[...D.ENTERPRISE_TABS]} grow />}
        </div>

        <motion.div key={`${view}-${view === "student" ? studentTab : view === "volunteer" ? volunteerTab : enterpriseTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col gap-[var(--space-6)]">
          {view === "student" && studentTab === "home" && <StudentHome onAsk={() => setStudentTab("questions")} onSeeAll={() => setStudentTab("opportunities")} saves={saves} toggleSave={toggleSave} openOpportunity={setOpportunity} progress={progress} openModule={setModule} onToast={onToast} />}
          {view === "student" && studentTab === "learn" && <StudentLearn progress={progress} openModule={setModule} />}
          {view === "student" && studentTab === "questions" && <StudentQuestions />}
          {view === "student" && studentTab === "opportunities" && <StudentOpportunities saves={saves} toggleSave={toggleSave} openOpportunity={setOpportunity} />}
          {view === "student" && studentTab === "people" && <StudentPeople follows={follows} toggleFollow={toggleFollow} />}

          {view === "volunteer" && volunteerTab === "home" && <VolunteerHome />}
          {view === "volunteer" && volunteerTab === "questions" && <VolunteerQuestions />}
          {view === "volunteer" && volunteerTab === "share" && <VolunteerShare />}
          {view === "volunteer" && volunteerTab === "yearRound" && <VolunteerImpact />}

          {view === "enterprise" && enterpriseTab === "program" && <EnterpriseProgram />}
          {view === "enterprise" && enterpriseTab === "impact" && <EnterpriseImpact />}
          {view === "enterprise" && enterpriseTab === "team" && <EnterpriseTeam />}
        </motion.div>
      </SectionSurface>
    </PicksCtx.Provider>
    </OpenPro.Provider>
  );
}
