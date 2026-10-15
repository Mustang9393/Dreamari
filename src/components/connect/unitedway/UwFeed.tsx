"use client";

// The board's Students and Volunteers communities (15 Oct 2026).
//
// Maisha's review: "Rather than mixing everyone's content into one feed"
// there are three communities. This file holds the two that students and
// volunteers share, in LinkedIn's shape ("the goal is to make this feel like
// a combination of LinkedIn for professional engagement and Slack for
// internal United Way collaboration"):
// - Students: students ask (choosing To: Volunteers or To: United Way Team)
//   and share posts. Volunteers only see the questions sent to them.
// - Volunteers: corporate volunteers post with a required label (Insight,
//   Opportunity, Event Update). Students and United Way read, react and
//   reply; only volunteers post there.
// Every item opens its own page: the post, a reaction summary, and replies
// one level deep, each with Like and Reply (Maisha: "Keep replies and
// discussions simple and familiar, similar to LinkedIn"). Reactions are
// Like, Celebrate, Support and Love, one per person (Maisha: "Replace the
// fire and 100 emojis with professional LinkedIn-style reactions").
// Questions show no quotation marks and always say who they are for.
// There is no private messaging between adults and students anywhere here:
// every reply is public on the board.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Calendar, ChevronLeft, ChevronRight, Lightbulb, Megaphone, MessageCircle, PenLine, Send, ThumbsUp, Ticket, Users } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { EmptyView } from "@/components/app/states";
import { CONTACT_INFO, CONTACT_WARNING, PrimaryCta } from "../primitives";
import { addItem, addReply, react, toggleLike, useUwStore } from "./uwStore";
import { LABEL_TEXT, TO_TEXT, agoMinutes, countReplies, seededItems, visibleTo, canReply, type ReactionKind, type UwItem, type UwLabel, type UwPerson, type UwQuestion, type UwReply, type UwTo } from "./uwCommunity";
import { ReactButton as SharedReactButton, ReactionSummary as SharedReactionSummary, type ReactionPalette } from "../reactions";
import * as D from "./uwData";
import { BLUE, BLUE_TEXT, ChoiceChips, Field, INPUT, INPUT_STYLE, MUTED, PERSON_CHIP, PersonAvatar, PersonChip, PillSelect, QUIET, SOLID, Sheet, TEXTAREA, personLine, personName } from "./uwUi";

// ——— the board's navigation, for every row and page ———

export type UwNav = {
  board: D.UwBoard;
  pov: D.UwPov;
  /** who posts and replies in this POV */
  me: UwPerson;
  openItem: (item: UwItem) => void;
  openPerson: (who: UwPerson) => void;
  openEvent: (id: string) => void;
  go: (section: D.UwSection, filter?: string) => void;
  toast: (text: string) => void;
  /** on an event's own board: items from this event don't link to it */
  hereEventId?: string;
};
export const UwNavCtx = createContext<UwNav | null>(null);
const useNav = () => useContext(UwNavCtx)!;

/** The board's items: seeded, plus what was posted here, with replies
 *  added here merged in. */
export function useBoardItems(board: D.UwBoard): UwItem[] {
  const store = useUwStore();
  const seeded = useMemo(() => seededItems(board), [board]);
  return useMemo(() => {
    const merge = (list: UwReply[]): UwReply[] => list.map((r) => ({ ...r, replies: [...r.replies, ...(store.nested[r.id] ?? [])] }));
    return [...store.items.filter((i) => i.boardId === board.id), ...seeded].map((i) => ({ ...i, replies: merge([...i.replies, ...(store.replies[i.id] ?? [])]) }) as UwItem);
  }, [seeded, store, board.id]);
}
/** One item with what was added in this session (an event board's own
 *  questions use it too). */
export function useWithAdded<T extends UwItem>(items: T[]): T[] {
  const store = useUwStore();
  return useMemo(() => {
    const merge = (list: UwReply[]): UwReply[] => list.map((r) => ({ ...r, replies: [...r.replies, ...(store.nested[r.id] ?? [])] }));
    return items.map((i) => ({ ...i, replies: merge([...i.replies, ...(store.replies[i.id] ?? [])]) }));
  }, [items, store]);
}

// ——— reactions ———
// The control itself is shared with the rest of Connect (../reactions.tsx,
// 15 Oct 2026); United Way's boards keep their brand colours on the discs.

const UW_REACTIONS: ReactionPalette = {
  bg: { like: D.BRAND.blue, celebrate: D.BRAND.green, support: "#8A4FD8", love: D.BRAND.red },
  ink: { like: BLUE_TEXT, celebrate: "var(--world-food-farming-nature)", support: "#9B6BE0", love: "#F0544A" },
};

/** The count with its top two reactions, LinkedIn's summary. */
export function ReactionSummary({ counts, mine }: { counts: Record<ReactionKind, number>; mine?: ReactionKind }) {
  return <SharedReactionSummary counts={counts} mine={mine} palette={UW_REACTIONS} color={QUIET} />;
}

/** Like, with the other three a hover (or long-press, or arrow key) away. */
export function ReactButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const store = useUwStore();
  return <SharedReactButton mine={store.reactions[id]} onReact={(k) => react(id, k)} compact={compact} palette={UW_REACTIONS} color={MUTED} />;
}

// ——— tags ———

/** Who a question is for, on every question (Maisha: "Make it obvious
 *  whether a question is directed to United Way or a Professional
 *  Volunteer"). United Way's in its yellow, volunteers' in its blue. */
export function ToTag({ to }: { to: UwTo }) {
  const team = to === "team";
  return (
    <span className="inline-flex flex-none items-center gap-[5px] rounded-full border px-[9px] py-[2px] text-[11.5px] leading-[16px] font-bold whitespace-nowrap"
      style={team ? { borderColor: `color-mix(in srgb, ${D.BRAND.yellow} 70%, transparent)`, background: `color-mix(in srgb, ${D.BRAND.yellow} 16%, transparent)`, color: "var(--foreground)" } : { borderColor: `color-mix(in srgb, ${BLUE} 55%, transparent)`, background: `color-mix(in srgb, ${BLUE} 14%, transparent)`, color: "var(--foreground)" }}>
      {team ? <Megaphone className="h-3 w-3" aria-hidden style={{ color: "#C98F00" }} /> : <Users className="h-3 w-3" aria-hidden style={{ color: BLUE_TEXT }} />}
      {TO_TEXT[to]}
    </span>
  );
}
const LABEL_ICON: Record<UwLabel, typeof Lightbulb> = { insight: Lightbulb, opportunity: Ticket, event: Calendar };
export function LabelTag({ label }: { label: UwLabel }) {
  const Icon = LABEL_ICON[label];
  return (
    <span className="inline-flex flex-none items-center gap-[5px] rounded-full px-[9px] py-[2px] text-[11.5px] leading-[16px] font-bold whitespace-nowrap" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)", boxShadow: "inset 0 0 0 1px var(--glass-border)" }}>
      <Icon className="h-3 w-3" aria-hidden style={{ color: BLUE_TEXT }} />{LABEL_TEXT[label]}
    </span>
  );
}

// ——— a person's name and face, each opening their profile ———

export function PersonButton({ who, size = 44 }: { who: UwPerson; size?: number }) {
  const nav = useNav();
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); nav.openPerson(who); }} aria-label={`Open ${personName(who)}'s profile`} className="dm-quiet relative z-20 flex-none cursor-pointer self-start rounded-full">
      <PersonAvatar who={who} size={size} />
    </button>
  );
}
function NameButton({ who, size = 15 }: { who: UwPerson; size?: number }) {
  const nav = useNav();
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); nav.openPerson(who); }} className="dm-link relative z-20 flex min-w-0 cursor-pointer items-center gap-[6px] text-left font-bold" style={{ color: "var(--foreground)", fontSize: size, lineHeight: `${size + 5}px` }}>
      <span className="truncate">{personName(who)}</span><PersonChip who={who} />
    </button>
  );
}

const itemReplies = (item: UwItem) => countReplies(item.replies);
function eventName(board: D.UwBoard, id?: string) {
  return id ? board.events.find((e) => e.id === id)?.title : undefined;
}

// ——— one row ———

/** A question or a post as a feed row: who, when, who it's for, the words,
 *  the first reply under a question, then React and Reply. The whole row
 *  opens the item; the face, name and buttons sit above that. */
export function ItemRow({ item }: { item: UwItem }) {
  const nav = useNav();
  const store = useUwStore();
  const first = item.kind === "question" ? item.replies.find((r) => r.who.kind !== "student") ?? item.replies[0] : undefined;
  const n = itemReplies(item);
  const ev = item.eventId === nav.hereEventId ? undefined : eventName(nav.board, item.eventId);
  const title = item.kind === "question" ? item.title : item.kind === "volunteer-post" ? item.title : undefined;
  return (
    <article className="group relative flex gap-[12px] px-[var(--space-4)] pt-[var(--space-5)] pb-[var(--space-3)] sm:gap-[14px] sm:px-[var(--space-6)]">
      <button type="button" onClick={() => nav.openItem(item)} className="absolute inset-0 z-10 cursor-pointer"><span className="sr-only">Open: {title ?? (item.kind === "student-post" ? item.body : "")}</span></button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-1)" }} />
      <PersonButton who={item.who} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-x-[10px] gap-y-[6px]">
          <div className="flex min-w-0 flex-col">
            <NameButton who={item.who} />
            <span className="truncate text-[13px] leading-[18px]" style={{ color: MUTED }}>{personLine(item.who)} · {item.postedAgo}</span>
          </div>
          {item.kind === "question" ? <ToTag to={item.to} /> : item.kind === "volunteer-post" ? <LabelTag label={item.label} /> : null}
        </div>
        {item.kind === "question" && (
          <>
            <h3 className="mt-[10px] max-w-[62ch] text-[17px] leading-[24px] font-semibold text-balance" style={{ color: "var(--foreground)" }}>{item.title}</h3>
            {item.context && <p className="mt-[4px] line-clamp-2 max-w-[62ch] text-[14.5px] leading-[21px]" style={{ color: MUTED }}>{item.context}</p>}
          </>
        )}
        {item.kind === "volunteer-post" && (
          <>
            <h3 className="mt-[10px] max-w-[62ch] text-[17px] leading-[24px] font-semibold text-balance" style={{ color: "var(--foreground)" }}>{item.title}</h3>
            <p className="mt-[4px] line-clamp-3 max-w-[62ch] text-[14.5px] leading-[21px]" style={{ color: MUTED }}>{item.body}</p>
          </>
        )}
        {item.kind === "student-post" && <p className="mt-[10px] line-clamp-4 max-w-[62ch] text-[16px] leading-[24px]" style={{ color: "var(--foreground)" }}>{item.body}</p>}
        {ev && item.eventId && (
          <button type="button" onClick={(e) => { e.stopPropagation(); nav.openEvent(item.eventId!); }} className="dm-link relative z-20 mt-[8px] flex w-fit cursor-pointer items-center gap-[5px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>
            <Calendar className="h-3.5 w-3.5" aria-hidden /> {ev} <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
        {first && (
          <div className="mt-[12px] flex gap-[10px] rounded-[var(--radius-md)] px-[12px] py-[10px]" style={{ background: "var(--glass-surface-1)", boxShadow: "inset 0 0 0 1px var(--glass-border)" }}>
            <PersonButton who={first.who} size={26} />
            <div className="flex min-w-0 flex-col">
              <span className="flex min-w-0 items-center gap-[6px] text-[13px] leading-[18px]"><NameButton who={first.who} size={13} /><span className="hidden truncate sm:inline" style={{ color: MUTED }}>{first.who.kind === "student" ? "" : personLine(first.who).split(" · ")[0]}</span></span>
              <p className="line-clamp-2 text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{first.body}</p>
            </div>
          </div>
        )}
        <div className="mt-[10px] flex flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[2px]">
          <div className="-ml-[12px] flex items-center gap-[2px]">
            <ReactButton id={item.id} />
            <button type="button" onClick={(e) => { e.stopPropagation(); nav.openItem(item); }} className="dm-quiet relative z-20 flex min-h-[36px] cursor-pointer items-center gap-[6px] rounded-full px-[12px] text-[13.5px] font-bold" style={{ color: MUTED }}>
              <MessageCircle className="h-[17px] w-[17px]" aria-hidden /> {n > 0 ? `${n} ${n === 1 ? "reply" : "replies"}` : "Reply"}
            </button>
          </div>
          <ReactionSummary counts={item.reactions} mine={store.reactions[item.id]} />
        </div>
      </div>
    </article>
  );
}

/** Rows in one hairline panel, the way the other boards list them. No
 *  overflow clip, so a reaction picker can open above the first row. */
export function ItemList({ items, empty, page }: { items: UwItem[]; empty: string; /** show this many, then "Show more" */ page?: number }) {
  const [shown, setShown] = useState(page ?? items.length);
  if (!items.length) return <div className="rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)" }}><EmptyView tier={3} line={empty} /></div>;
  const list = page ? items.slice(0, shown) : items;
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex flex-col rounded-[var(--radius-lg)] border [&>*+*]:border-t [&>*+*]:border-[var(--glass-border)] [&>*:first-child]:rounded-t-[var(--radius-lg)] [&>*:last-child]:rounded-b-[var(--radius-lg)]" style={{ borderColor: "var(--glass-border)", background: "var(--background)" }}>
        {list.map((it) => <ItemRow key={it.id} item={it} />)}
      </div>
      {page && items.length > shown && <button type="button" onClick={() => setShown((n) => n + page)} className="dm-quiet mx-auto flex min-h-[40px] cursor-pointer items-center rounded-full border px-[18px] text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Show more · {items.length - shown}</button>}
    </div>
  );
}

// ——— one item, opened ———

function ReplyBox({ onPost, placeholder, autoFocus = false, onCancel }: { onPost: (text: string) => void; placeholder: string; autoFocus?: boolean; onCancel?: () => void }) {
  const nav = useNav();
  const [text, setText] = useState("");
  const leaks = CONTACT_INFO.test(text);
  const send = () => { if (!text.trim() || leaks) return; onPost(text.trim()); setText(""); };
  return (
    <div className="flex gap-[10px]">
      <PersonAvatar who={nav.me} size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <div className="flex items-end gap-[6px] rounded-[20px] border py-[4px] pr-[4px] pl-[14px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
          <label className="min-w-0 flex-1">
            <span className="sr-only">{placeholder}</span>
            <textarea autoFocus={autoFocus} value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={500} placeholder={placeholder}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } if (e.key === "Escape") onCancel?.(); }}
              className="block max-h-[140px] min-h-[36px] w-full resize-none bg-transparent py-[7px] text-[14.5px] leading-[21px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ color: "var(--foreground)", fieldSizing: "content" } as React.CSSProperties} />
          </label>
          <IconTip label="Post reply">
            <button type="button" aria-label="Post reply" onClick={send} disabled={!text.trim() || leaks} className="dm-solid flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-40" style={SOLID}><Send className="h-4 w-4" aria-hidden /></button>
          </IconTip>
        </div>
        {leaks && <span role="alert" className="text-[12.5px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</span>}
      </div>
    </div>
  );
}

function ReplyRow({ r, itemId, parentId, canAnswer, nested = false }: { r: UwReply; itemId: string; parentId: string; canAnswer: boolean; nested?: boolean }) {
  const nav = useNav();
  const store = useUwStore();
  const [replying, setReplying] = useState(false);
  const liked = !!store.liked[r.id];
  const likes = r.likes + (liked ? 1 : 0);
  return (
    <li className="flex flex-col gap-[8px]">
      <div className="flex gap-[10px]">
        <PersonButton who={r.who} size={nested ? 28 : 34} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="rounded-[4px_16px_16px_16px] px-[14px] py-[10px]" style={{ background: "var(--glass-surface-1)", boxShadow: "inset 0 0 0 1px var(--glass-border)" }}>
            <NameButton who={r.who} size={14} />
            <span className="block truncate text-[12.5px] leading-[17px]" style={{ color: MUTED }}>{personLine(r.who)}</span>
            <p className="mt-[6px] text-[14.5px] leading-[21px] whitespace-pre-line" style={{ color: "var(--foreground)" }}>{r.body}</p>
          </div>
          <div className="mt-[2px] flex items-center gap-[2px] pl-[4px] text-[12.5px] font-bold" style={{ color: MUTED }}>
            <span className="pr-[6px] font-semibold">{r.postedAgo}</span>
            <button type="button" aria-pressed={liked} onClick={() => toggleLike(r.id)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center gap-[5px] rounded-full px-[8px]" style={{ color: liked ? BLUE_TEXT : MUTED }}>
              <ThumbsUp className="h-[14px] w-[14px]" aria-hidden fill={liked ? "currentColor" : "none"} fillOpacity={0.2} /> Like{likes > 0 ? ` · ${likes}` : ""}
            </button>
            {canAnswer && <button type="button" onClick={() => setReplying(true)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center rounded-full px-[8px]">Reply</button>}
          </div>
        </div>
      </div>
      {(r.replies.length > 0 || replying) && (
        <ul className="flex flex-col gap-[10px] pl-[44px]">
          {r.replies.map((x) => <ReplyRow key={x.id} r={x} itemId={itemId} parentId={parentId} canAnswer={canAnswer} nested />)}
          {replying && (
            <li>
              <ReplyBox autoFocus placeholder={`Reply to ${personName(r.who).split(" ")[0]}`} onCancel={() => setReplying(false)}
                onPost={(text) => { addReply(itemId, { id: `${parentId}-n${Date.now()}`, who: nav.me, body: text, postedAgo: "Just now", likes: 0, replies: [] }, parentId); setReplying(false); }} />
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

/** An item's own page: the post, its reactions, and the replies. */
export function ItemPage({ item, onBack, backLabel }: { item: UwItem; onBack: () => void; backLabel: string }) {
  const nav = useNav();
  const store = useUwStore();
  const n = itemReplies(item);
  const can = canReply(item, nav.pov);
  const ev = item.eventId === nav.hereEventId ? undefined : eventName(nav.board, item.eventId);
  const title = item.kind === "student-post" ? undefined : item.title;
  const body = item.kind === "question" ? item.context : item.body;
  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: MUTED }}><ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}</button>
      <article className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <div className="flex flex-wrap items-start justify-between gap-[10px]">
          <div className="flex min-w-0 gap-[12px]">
            <PersonButton who={item.who} size={48} />
            <div className="flex min-w-0 flex-col">
              <NameButton who={item.who} size={16} />
              <span className="text-[13px] leading-[18px]" style={{ color: MUTED }}>{personLine(item.who)} · {item.postedAgo}</span>
            </div>
          </div>
          {item.kind === "question" ? <ToTag to={item.to} /> : item.kind === "volunteer-post" ? <LabelTag label={item.label} /> : null}
        </div>
        {title && <h1 className="text-[24px] leading-[30px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h1>}
        {body && <p className="max-w-[68ch] text-[16px] leading-[25px] whitespace-pre-line" style={{ color: "var(--foreground)" }}>{body}</p>}
        {(ev || (item.kind === "volunteer-post" && item.label === "opportunity")) && (
          <div className="flex flex-wrap gap-[var(--space-4)]">
            {ev && item.eventId && <button type="button" onClick={() => nav.openEvent(item.eventId!)} className="dm-link flex cursor-pointer items-center gap-[5px] text-[14px] font-bold" style={{ color: BLUE_TEXT }}><Calendar className="h-4 w-4" aria-hidden /> {ev} <ChevronRight className="h-4 w-4" aria-hidden /></button>}
            {item.kind === "volunteer-post" && item.label === "opportunity" && <button type="button" onClick={() => nav.go("opportunities")} className="dm-link flex cursor-pointer items-center gap-[5px] text-[14px] font-bold" style={{ color: BLUE_TEXT }}><Ticket className="h-4 w-4" aria-hidden /> All opportunities <ChevronRight className="h-4 w-4" aria-hidden /></button>}
          </div>
        )}
        <div className="flex items-center justify-between gap-[var(--space-3)] border-b pb-[10px]" style={{ borderColor: "var(--glass-border)" }}>
          <ReactionSummary counts={item.reactions} mine={store.reactions[item.id]} />
          <span className="text-[13px] font-semibold" style={{ color: QUIET }}>{n} {n === 1 ? "reply" : "replies"}</span>
        </div>
        <div className="-mt-[6px] -ml-[12px] flex items-center gap-[2px]"><ReactButton id={item.id} /></div>
      </article>
      <section aria-label="Replies" className="flex flex-col gap-[var(--space-4)]">
        {can && <ReplyBox placeholder={item.kind === "question" && nav.pov !== "student" ? "Write an answer" : "Add a reply"} onPost={(text) => { addReply(item.id, { id: `${item.id}-me${Date.now()}`, who: nav.me, body: text, postedAgo: "Just now", likes: 0, replies: [] }); nav.toast("Reply posted. Everyone on the board can see it."); }} />}
        {item.replies.length > 0
          ? <ul className="flex flex-col gap-[var(--space-4)]">{item.replies.map((r) => <ReplyRow key={r.id} r={r} itemId={item.id} parentId={r.id} canAnswer={can} />)}</ul>
          : <p className="text-[14px]" style={{ color: MUTED }}>{item.kind === "question" ? (item.to === "team" ? "United Way will answer here." : "Volunteers will answer here.") : "No replies yet."}</p>}
      </section>
    </>
  );
}

// ——— composers ———

/** Students ask or share (Maisha: "When asking a question, they should
 *  choose whether it's directed to a Professional Volunteer or the United
 *  Way Team"). Who it's for has no default: the student picks. */
export function StudentComposer({ onClose, start = "ask", programId, eventId, initialText = "" }: { onClose: () => void; start?: "ask" | "share"; programId?: string; /** asked on an event's board: it stays there, never in the main feed */ eventId?: string; initialText?: string }) {
  const nav = useNav();
  const [mode, setMode] = useState<"ask" | "share">(start);
  const [to, setTo] = useState<UwTo | undefined>(programId ? "team" : undefined);
  const [text, setText] = useState(initialText);
  const leaks = CONTACT_INFO.test(text);
  const ready = text.trim() && !leaks && (mode === "share" || to);
  const post = () => {
    if (!ready) return;
    const base = { id: `uw-mine-${Date.now()}`, boardId: eventId ?? nav.board.id, eventId, who: nav.me, place: nav.me.kind === "student" ? nav.me.place : undefined, postedAgo: "Just now", at: 0, reactions: { like: 0, celebrate: 0, support: 0, love: 0 }, replies: [] };
    if (mode === "ask") addItem({ ...base, kind: "question", title: text.trim(), to: to!, programId } as UwQuestion);
    else addItem({ ...base, kind: "student-post", body: text.trim() });
    nav.toast(mode === "ask" ? (to === "team" ? "Sent to the United Way Team." : "Sent to volunteers.") : "Posted to Students.");
    onClose();
  };
  return (
    <Sheet title={programId || eventId ? "Ask a question" : "Ask or share"} onClose={onClose} titleId="uw-student-compose">
      {!programId && !eventId && <ChoiceChips ariaLabel="Ask or share" value={mode} onChange={setMode} options={[{ key: "ask", label: "Ask a question" }, { key: "share", label: "Share a post" }]} />}
      {mode === "ask" && (
        <Field label="Who should answer?">
          <ChoiceChips ariaLabel="Who should answer" value={to} onChange={setTo} options={[{ key: "volunteers", label: "Volunteers", icon: <Users className="h-4 w-4" aria-hidden style={{ color: BLUE_TEXT }} /> }, { key: "team", label: "United Way Team", icon: <Megaphone className="h-4 w-4" aria-hidden style={{ color: "#C98F00" }} /> }]} />
        </Field>
      )}
      <Field label={mode === "ask" ? "Your question" : "Your post"}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={mode === "ask" ? 200 : 400} placeholder={mode === "ask" ? "What do you want to know?" : "Share a win, a plan or a tip"} className={TEXTAREA} style={INPUT_STYLE} />
      </Field>
      {leaks && <span role="alert" className="text-[12.5px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</span>}
      <span className="text-[12.5px]" style={{ color: MUTED }}>First name and town only. Everyone on the board can read it.</span>
      <PrimaryCta className="w-fit" style={SOLID} disabled={!ready} onClick={post}>{mode === "ask" ? "Ask" : "Post"}</PrimaryCta>
    </Sheet>
  );
}

/** Volunteers post with a label, required (Maisha: "Posts should have
 *  clear labels like Insight, Opportunity, or Event Update"). An Event
 *  Update can name the event it is about. */
export function VolunteerComposer({ onClose }: { onClose: () => void }) {
  const nav = useNav();
  const [label, setLabel] = useState<UwLabel>();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventId, setEventId] = useState("none");
  const leaks = CONTACT_INFO.test(title + body);
  const ready = label && title.trim() && !leaks;
  const post = () => {
    if (!ready || nav.me.kind !== "volunteer") return;
    addItem({ kind: "volunteer-post", id: `uw-mine-${Date.now()}`, boardId: nav.board.id, who: nav.me, place: undefined, postedAgo: "Just now", at: 0, reactions: { like: 0, celebrate: 0, support: 0, love: 0 }, replies: [], label, title: title.trim(), body: body.trim(), eventId: label === "event" && eventId !== "none" ? eventId : undefined });
    nav.toast(label === "opportunity" ? "Posted. It also shows in Opportunities." : label === "event" ? "Posted. It also shows in Events." : "Posted to Volunteers.");
    onClose();
  };
  return (
    <Sheet title="Share a post" onClose={onClose} titleId="uw-volunteer-compose">
      <Field label="What kind of post?">
        <ChoiceChips ariaLabel="Label" value={label} onChange={setLabel} options={(["insight", "opportunity", "event"] as const).map((k) => { const I = LABEL_ICON[k]; return { key: k, label: LABEL_TEXT[k], icon: <I className="h-4 w-4" aria-hidden style={{ color: BLUE_TEXT }} /> }; })} />
      </Field>
      <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder={label === "opportunity" ? "City Jobs Open in February" : label === "event" ? "What We Learned at the Convening" : "Learn to Code for Free in Three Steps"} className={INPUT} style={INPUT_STYLE} /></Field>
      <Field label="Details"><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={600} placeholder="Two or three short sentences" className={TEXTAREA} style={INPUT_STYLE} /></Field>
      {label === "event" && (
        <Field label="Which event?">
          <PillSelect ariaLabel="Which event" value={eventId} onChange={setEventId} options={[{ value: "none", label: "No event" }, ...nav.board.events.map((e) => ({ value: e.id, label: e.title }))]} />
        </Field>
      )}
      {leaks && <span role="alert" className="text-[12.5px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</span>}
      <PrimaryCta className="w-fit" style={SOLID} disabled={!ready} onClick={post}>Post</PrimaryCta>
    </Sheet>
  );
}

/** The bar that opens a composer: the poster's face and one line. */
function ComposerBar({ line, action, onOpen }: { line: string; action: string; onOpen: () => void }) {
  const nav = useNav();
  return (
    <button type="button" onClick={onOpen} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-lg)] border py-[8px] pr-[8px] pl-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      <PersonAvatar who={nav.me} size={36} />
      <span className="hidden min-w-0 flex-1 truncate text-[15px] sm:block" style={{ color: MUTED }}>{line}</span>
      <span aria-hidden className="flex-1 sm:hidden" />
      <span className="flex flex-none items-center gap-[6px] rounded-full px-[14px] py-[8px] text-[13px] font-bold" style={SOLID}><PenLine className="h-3.5 w-3.5" aria-hidden /> {action}</span>
    </button>
  );
}

// ——— the two community sections ———

type Show = "all" | "questions" | "posts" | "to-team" | "to-volunteers";
const placeOptions = (board: D.UwBoard) => [{ value: "all", label: board.places?.all ?? D.COMMUNITY_UI.across }, ...board.chapters.map((c) => ({ value: c.short, label: c.short }))];
const newestFirst = (a: UwItem, b: UwItem) => a.at - b.at || agoMinutes(a.postedAgo) - agoMinutes(b.postedAgo);

/** Students: every student question and post (volunteers: the questions
 *  sent to them, and posts). */
export function StudentsSection({ items, show, setShow, place, setPlace }: { items: UwItem[]; show: string; setShow: (v: string) => void; place: string; setPlace: (v: string) => void }) {
  const nav = useNav();
  const [composing, setComposing] = useState<"ask" | "share" | null>(null);
  const showOptions: { value: Show; label: string }[] = nav.pov === "team"
    ? [{ value: "all", label: "Everything" }, { value: "to-team", label: "To: United Way Team" }, { value: "to-volunteers", label: "To: Volunteers" }, { value: "posts", label: "Student posts" }]
    : [{ value: "all", label: "Everything" }, { value: "questions", label: nav.pov === "volunteer" ? "Questions for you" : "Questions" }, { value: "posts", label: "Posts" }];
  const s = (showOptions.some((o) => o.value === show) ? show : "all") as Show;
  const list = items
    .filter((i) => (i.kind === "question" || i.kind === "student-post") && visibleTo(i, nav.pov))
    .filter((i) => place === "all" || i.place === place)
    .filter((i) => s === "all" || (s === "posts" ? i.kind === "student-post" : i.kind === "question" && (s === "questions" || (s === "to-team" ? i.to === "team" : i.to === "volunteers"))))
    .sort(newestFirst);
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {nav.pov === "student" && <ComposerBar line="Ask a question or share a post" action="Ask or share" onOpen={() => setComposing("ask")} />}
      {composing && <StudentComposer start={composing} onClose={() => setComposing(null)} />}
      <FilterRow count={list.length} noun={nav.pov === "volunteer" ? "for you" : "from students"}>
        <PillSelect ariaLabel="Show" value={s} onChange={(v) => setShow(v)} options={showOptions} />
        <PillSelect ariaLabel="Community" value={place} onChange={setPlace} options={placeOptions(nav.board)} />
      </FilterRow>
      <ItemList key={`${s}-${place}`} page={10} items={list} empty={nav.pov === "volunteer" ? "No questions for volunteers here yet." : "Nothing here yet. Ask the first question."} />
    </div>
  );
}

/** Volunteers: corporate volunteers' posts, labelled. */
export function VolunteersSection({ items, label, setLabel, place, setPlace }: { items: UwItem[]; label: string; setLabel: (v: string) => void; place: string; setPlace: (v: string) => void }) {
  const nav = useNav();
  const [composing, setComposing] = useState(false);
  const list = items
    .filter((i): i is Extract<UwItem, { kind: "volunteer-post" }> => i.kind === "volunteer-post")
    .filter((i) => label === "all" || i.label === label)
    .filter((i) => place === "all" || !i.place || i.place === place)
    .sort(newestFirst);
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {nav.pov === "volunteer" && <ComposerBar line="Share an insight, an opportunity or an event update" action="Share a post" onOpen={() => setComposing(true)} />}
      {composing && <VolunteerComposer onClose={() => setComposing(false)} />}
      <FilterRow count={list.length} noun="from volunteers">
        <PillSelect ariaLabel="Label" value={label} onChange={setLabel} options={[{ value: "all", label: "All posts" }, { value: "insight", label: "Insights" }, { value: "opportunity", label: "Opportunities" }, { value: "event", label: "Event Updates" }]} />
        <PillSelect ariaLabel="Community" value={place} onChange={setPlace} options={placeOptions(nav.board)} />
      </FilterRow>
      <ItemList key={`${label}-${place}`} page={10} items={list} empty="No posts like this yet." />
    </div>
  );
}

function FilterRow({ count, noun, children }: { count: number; noun: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
      <span className="text-[13.5px] font-semibold tabular-nums" style={{ color: MUTED }}><strong style={{ color: "var(--foreground)" }}>{count}</strong> {noun}</span>
      <span className="flex flex-wrap items-center gap-[8px]">{children}</span>
    </div>
  );
}

/** A short list of a board's labelled posts for Opportunities and Events,
 *  with the way to see them all on Volunteers (one source of truth: the
 *  same posts, linked both ways). */
export function LabelledPosts({ items, label, title, max = 3 }: { items: UwItem[]; label: UwLabel; title: string; max?: number }) {
  const nav = useNav();
  const list = items.filter((i) => i.kind === "volunteer-post" && i.label === label).sort(newestFirst);
  if (!list.length) return null;
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <h3 className="text-[18px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
        {list.length > max && <button type="button" onClick={() => nav.go("volunteers", label)} className="dm-link flex cursor-pointer items-center gap-[4px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>All {list.length} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>}
      </div>
      <ItemList items={list.slice(0, max)} empty="" />
    </section>
  );
}

/** A student's or a staff member's own small profile: who they are, never
 *  a way to message them. Volunteers open their full Connect profile. */
export function PersonSheet({ who, onClose }: { who: UwPerson; onClose: () => void }) {
  const nav = useContext(UwNavCtx);
  return (
    <Sheet title={personName(who)} onClose={onClose} titleId="uw-person-title">
      <div className="flex items-center gap-[14px]">
        <PersonAvatar who={who} size={64} />
        <div className="flex flex-col gap-[4px]">
          <span className="inline-flex w-fit items-center rounded-full px-[9px] py-[2px] text-[12px] font-bold" style={who.kind === "staff" ? SOLID : { background: "var(--glass-surface-2)", color: "var(--foreground)" }}>{PERSON_CHIP[who.kind]}</span>
          <span className="text-[14.5px] font-semibold" style={{ color: "var(--foreground)" }}>{personLine(who)}</span>
        </div>
      </div>
      <p className="text-[14px] leading-[20px]" style={{ color: MUTED }}>
        {who.kind === "student" ? "Students show their first name and town only." : `Works at ${nav?.board.org ?? "United Way"}.`}
      </p>
    </Sheet>
  );
}
