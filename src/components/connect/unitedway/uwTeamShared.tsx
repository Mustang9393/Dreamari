"use client";

// The pieces the Team workspace (UwTeam.tsx) and the Team messages dock
// (UwTeamDock.tsx) share: the conversation list model, the post card, the
// chat bubbles and the composer, so a message written in one place is the
// message the other one shows.
//
// Surfaces follow the approved glass treatment: the raised rung
// (`glass-surface-raised` / `glass-border-raised`, the rung a reader has to
// be able to FIND) for cards and tiles, and a frosted blur only on the few
// floating bars (header, composer) that sit over content. Light mode gets
// the frosted white from the same tokens.
// DEMO-ONLY: everything is in memory, staff to staff, never a student.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Calendar, CheckCircle2, ChevronRight, FileText, MessageCircle, Pin, Send } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { Avatar, CONTACT_INFO, CONTACT_WARNING, QuietCta } from "../primitives";
import { addTeamMessage, useUwStore } from "./uwStore";
import { agoMinutes, boardStaff } from "./uwCommunity";
import * as D from "./uwData";
import { TEAM_DMS, TEAM_EXTRA, type TeamDm } from "./uwTeamSeeds";
import { BLUE, BLUE_TEXT, GOOD, MUTED } from "./uwUi";

export const RAISED: CSSProperties = { background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" };
export const FROST: CSSProperties = { backdropFilter: "blur(18px) saturate(1.5)", WebkitBackdropFilter: "blur(18px) saturate(1.5)" };
/** the board's blue as a soft wash, for a selected row or a tile */
export const BLUE_WASH = `linear-gradient(90deg, color-mix(in srgb, ${BLUE} 34%, transparent), color-mix(in srgb, ${BLUE} 12%, transparent))`;

export type Open = { kind: "channel"; key: D.TeamChannel } | { kind: "dm"; with: string };
export const keyOf = (o: Open) => (o.kind === "channel" ? `ch:${o.key}` : `dm:${o.with}`);
export const channelOf = (key: D.TeamChannel) => D.TEAM_CHANNELS.find((c) => c.key === key)!;

// ——— faces ———

/** Online or not: a fixed answer per name, so a demo is the same every time. */
const online = (name: string) => [...name].reduce((n, c) => n + c.charCodeAt(0), 0) % 3 !== 0;

export function Face({ who, size = 36, presence = false }: { who: D.StaffMember; size?: number; presence?: boolean }) {
  return (
    <span className="relative inline-flex flex-none">
      <Avatar name={who.name} photo={D.staffPhoto(who)} size={size} />
      {presence && (
        <span aria-hidden className="absolute right-[-1px] bottom-[-1px] rounded-full border-2" style={{ width: Math.max(10, size * 0.3), height: Math.max(10, size * 0.3), background: online(who.name) ? GOOD : "var(--muted-foreground)", borderColor: "var(--background)" }} />
      )}
    </span>
  );
}
export const isOnline = online;

export function FaceStack({ people, size = 22, max = 3 }: { people: D.StaffMember[]; size?: number; max?: number }) {
  const seen = new Map<string, D.StaffMember>();
  people.forEach((p) => { if (!seen.has(p.name)) seen.set(p.name, p); });
  const list = [...seen.values()];
  return (
    <span className="flex flex-none items-center">
      {list.slice(0, max).map((p, i) => (
        <span key={p.name} className="rounded-full" style={{ marginLeft: i ? -size * 0.32 : 0, boxShadow: "0 0 0 2px var(--background)" }}><Avatar name={p.name} photo={D.staffPhoto(p)} size={size} /></span>
      ))}
      {list.length > max && <span className="ml-[6px] text-[12px] font-bold tabular-nums" style={{ color: MUTED }}>+{list.length - max}</span>}
    </span>
  );
}

export function Byline({ who, ago, dense = false }: { who: D.StaffMember; ago: string; dense?: boolean }) {
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
      <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{who.name}</span>
      {!dense && <span className="truncate text-[12.5px] leading-[18px]" style={{ color: MUTED }}>{who.role} · {who.office}</span>}
      <span className="text-[12px] leading-[18px]" style={{ color: MUTED }}>{ago}</span>
    </span>
  );
}

// ——— the conversation list ———

export type Conversation = {
  key: string;
  open: Open;
  group: "office" | "network" | "dm";
  label: string;
  /** channel topic, or the colleague's role and office */
  sub: string;
  who?: D.StaffMember;
  preview: string;
  ago: string;
  unread: boolean;
};

const KIND_STYLE: Record<D.StaffPostKind, { color: string; wash: string }> = {
  update: { color: BLUE_TEXT, wash: `color-mix(in srgb, ${BLUE} 20%, transparent)` },
  ask: { color: "#C98F00", wash: "color-mix(in srgb, #C98F00 18%, transparent)" },
  idea: { color: GOOD, wash: `color-mix(in srgb, ${GOOD} 18%, transparent)` },
  resource: { color: MUTED, wash: "var(--glass-surface-2)" },
};

/** Everything the Team workspace and the dock need from one board. */
export function useTeamModel(board: D.UwBoard) {
  const store = useUwStore();
  const me = board.staff.me;
  const staff = boardStaff(board).filter((m) => m.name !== me.name);
  const posts = [...board.staff.posts.filter((p) => !p.public), ...(TEAM_EXTRA[board.id] ?? [])];
  const dms: TeamDm[] = TEAM_DMS[board.id] ?? [];
  const people = [...staff].sort((a, b) => Number(dms.some((d) => d.with === b.name)) - Number(dms.some((d) => d.with === a.name)));
  const inChannel = (k: D.TeamChannel) => posts.filter((p) => (p.channel ?? "general") === k);

  const conversations: Conversation[] = [
    ...D.TEAM_CHANNELS.map((c): Conversation => {
      const key = `ch:${c.key}`;
      const mine = store.team[key] ?? [];
      const latest = [...inChannel(c.key)].sort((a, b) => agoMinutes(a.postedAgo) - agoMinutes(b.postedAgo))[0];
      const fresh = !!latest && agoMinutes(latest.postedAgo) <= 360;
      return {
        key, open: { kind: "channel", key: c.key }, group: c.group, label: c.label, sub: c.line,
        preview: mine.length ? `You: ${mine[mine.length - 1].body}` : latest ? `${latest.author.name}: ${latest.title}` : "No messages yet",
        ago: mine.length ? "Just now" : latest?.postedAgo ?? "",
        unread: fresh && !store.seen[key],
      };
    }),
    ...people.map((m): Conversation => {
      const key = `dm:${m.name}`;
      const mine = store.team[key] ?? [];
      const thread = dms.find((d) => d.with === m.name)?.messages ?? [];
      const last = thread[thread.length - 1];
      return {
        key, open: { kind: "dm", with: m.name }, group: "dm", label: m.name, sub: `${m.role} · ${m.office}`, who: m,
        preview: mine.length ? `You: ${mine[mine.length - 1].body}` : last ? `${last.from === "me" ? "You: " : ""}${last.body}` : "Say hello",
        ago: mine.length ? "Just now" : last?.postedAgo ?? "",
        unread: !!last && last.from !== "me" && agoMinutes(last.postedAgo) <= 360 && !store.seen[key],
      };
    }),
  ];
  return { store, me, staff, people, posts, dms, inChannel, conversations, unreadCount: conversations.filter((c) => c.unread).length };
}

// ——— the composer ———

export function Composer({ placeholder, onSend, compact = false, hint }: { placeholder: string; onSend: (text: string) => void; compact?: boolean; hint?: ReactNode }) {
  const [text, setText] = useState("");
  const leaks = CONTACT_INFO.test(text);
  const ready = !!text.trim() && !leaks;
  const send = () => { if (!ready) return; onSend(text.trim()); setText(""); };
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-end gap-[6px] border py-[5px] pr-[5px] pl-[16px]" style={{ ...RAISED, borderRadius: compact ? 20 : 24, ...FROST }}>
        <label className="min-w-0 flex-1">
          <span className="sr-only">{placeholder}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={800} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="block max-h-[160px] min-h-[38px] w-full resize-none bg-transparent py-[8px] text-[15px] leading-[21px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ color: "var(--foreground)", fieldSizing: "content" } as CSSProperties} />
        </label>
        <IconTip label="Send">
          <button type="button" aria-label="Send" onClick={send} disabled={!ready} className="flex size-[38px] flex-none cursor-pointer items-center justify-center rounded-full text-white transition-[opacity,transform] active:scale-95 disabled:cursor-default disabled:opacity-35" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 82%, #fff), ${BLUE})`, boxShadow: ready ? `0 8px 20px -8px ${BLUE}` : "none" }}>
            <Send className="h-[17px] w-[17px]" aria-hidden />
          </button>
        </IconTip>
      </div>
      {leaks ? <span role="alert" className="px-[8px] text-[12.5px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</span> : hint ? <span className="hidden px-[10px] text-[12px] md:block" style={{ color: MUTED }}>{hint}</span> : null}
    </div>
  );
}

// ——— a post in a channel ———

export function DayDivider({ label }: { label: string }) {
  return (
    <li role="separator" aria-label={label} className="flex items-center gap-[12px] py-[6px]">
      <span aria-hidden className="h-px flex-1" style={{ background: "var(--color-glass-border-raised)" }} />
      <span className="rounded-full border px-[12px] py-[3px] text-[11.5px] font-extrabold tracking-[0.06em] uppercase" style={{ ...RAISED, color: MUTED }}>{label}</span>
      <span aria-hidden className="h-px flex-1" style={{ background: "var(--color-glass-border-raised)" }} />
    </li>
  );
}
export const dayLabel = (ago: string) => { const m = agoMinutes(ago); return m < 1440 ? "Today" : m < 2880 ? "Yesterday" : m < 10080 ? "Earlier this week" : "Earlier"; };

export function PostCard({ p, me, openEvent, toast }: { p: D.StaffPost; me: D.StaffMember; openEvent: (id: string) => void; toast: (t: string) => void }) {
  const store = useUwStore();
  const added = store.team[`reply:${p.id}`] ?? [];
  const replies = [...p.replies, ...added.map((m) => ({ author: me, body: m.body, postedAgo: m.postedAgo }))];
  const [open, setOpen] = useState(false);
  const done = p.tasks?.filter((t) => t.done).length ?? 0;
  const kind = KIND_STYLE[p.kind];
  // Header (who, when, what kind) above, the message below at the card's
  // full width: the words no longer share a margin with the photo (Chandu,
  // 15 Oct 2026: "make the name etc sit in a header and the message in a
  // different section").
  return (
    <li className="group relative flex flex-col gap-[10px] rounded-[18px] border p-[12px] sm:p-[16px]" style={RAISED}>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "var(--glass-surface-1)" }} />
      <header className="relative flex items-center gap-[10px]">
        <Face who={p.author} size={36} presence />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{p.author.name}</span>
          <span className="truncate text-[12.5px] leading-[17px]" style={{ color: MUTED }}>{p.author.office} · {p.postedAgo}</span>
        </span>
        <span className="flex-none rounded-full px-[9px] py-[2px] text-[11px] leading-[16px] font-extrabold" style={{ background: kind.wash, color: kind.color }}>{D.STAFF_KIND_LABEL[p.kind]}</span>
      </header>
      <div className="relative flex flex-col gap-[8px]">
        <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}><strong className="font-bold">{p.title}</strong>{p.body ? <><br /><span style={{ color: "color-mix(in srgb, var(--foreground) 88%, transparent)" }}>{p.body}</span></> : null}</p>
        {p.resource && (
          <button type="button" onClick={() => toast(`${p.resource!.label} opened.`)} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[14px] border p-[10px] text-left sm:max-w-[440px]" style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}>
            <span className="flex size-[42px] flex-none items-center justify-center rounded-[12px]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 34%, transparent), color-mix(in srgb, ${BLUE} 12%, transparent))` }}><FileText className="h-5 w-5" aria-hidden style={{ color: BLUE_TEXT }} /></span>
            <span className="flex min-w-0 flex-col"><span className="truncate text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{p.resource.label}</span><span className="text-[12.5px]" style={{ color: MUTED }}>{p.resource.meta}</span></span>
          </button>
        )}
        {p.tasks && (
          <ul className="flex flex-col rounded-[14px] border px-[12px] py-[2px] sm:max-w-[540px]" style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}>
            <li className="flex items-center gap-[10px] py-[8px] text-[12.5px] font-bold" style={{ color: MUTED }}>
              <span aria-hidden className="h-[6px] w-[64px] overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}><span className="block h-full rounded-full" style={{ width: `${(done / p.tasks.length) * 100}%`, background: GOOD }} /></span>
              {done} of {p.tasks.length} done
            </li>
            {p.tasks.map((t) => (
              <li key={t.office + t.task} className="flex items-center gap-[10px] border-t py-[8px] text-[14px]" style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}>
                {t.done ? <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} /> : <span aria-hidden className="size-[16px] flex-none rounded-full border-2" style={{ borderColor: "var(--color-glass-border-raised)" }} />}
                <span className="min-w-0 flex-1">{t.task}</span>
                <span className="hidden flex-none text-[12.5px] font-semibold sm:inline" style={{ color: MUTED }}>{t.owner}, {t.office}</span>
              </li>
            ))}
          </ul>
        )}
        {p.eventId && <QuietCta size="sm" className="w-fit" onClick={() => openEvent(p.eventId!)}><Calendar className="h-3.5 w-3.5" aria-hidden /> Open the event board</QuietCta>}
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="dm-quiet -ml-[8px] flex min-h-[40px] w-fit cursor-pointer items-center gap-[8px] rounded-full px-[8px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>
          {replies.length > 0 ? <FaceStack people={replies.map((r) => r.author)} size={22} /> : <MessageCircle className="h-4 w-4" aria-hidden />}
          <span>{replies.length ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "Reply"}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform" aria-hidden style={{ transform: open ? "rotate(90deg)" : "none" }} />
        </button>
        {open && (
          <div className="flex flex-col gap-[12px] border-t pt-[12px]" style={{ borderColor: "var(--color-glass-border-raised)" }}>
            <ul className="flex flex-col gap-[14px]">
              {replies.map((r, i) => (
                <li key={i} className="flex flex-col gap-[4px]">
                  <span className="flex items-center gap-[8px]"><Face who={r.author} size={24} /><span className="text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{r.author.name}</span><span className="text-[12px]" style={{ color: MUTED }}>{r.author.office} · {r.postedAgo}</span></span>
                  <p className="text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>{r.body}</p>
                </li>
              ))}
            </ul>
            <Composer compact placeholder="Reply" onSend={(text) => addTeamMessage(`reply:${p.id}`, text)} />
          </div>
        )}
      </div>
    </li>
  );
}

// ——— a direct message, as bubbles ———

export type Bubble = { from: "me" | "them"; body: string; ago: string };

export function Bubbles({ items, me, mate }: { items: Bubble[]; me: D.StaffMember; mate: D.StaffMember }) {
  return (
    <ul className="flex flex-col gap-[6px]">
      {items.map((m, i) => {
        const mine = m.from === "me";
        const lastOfRun = items[i + 1]?.from !== m.from;
        return (
          <li key={i} className={`flex items-end gap-[8px] ${mine ? "flex-row-reverse" : ""}`}>
            <span className="w-[28px] flex-none">{!mine && lastOfRun ? <Face who={mate} size={28} /> : null}</span>
            <div className={`flex max-w-[82%] flex-col gap-[2px] sm:max-w-[70%] ${mine ? "items-end" : "items-start"}`}>
              <p className="px-[14px] py-[9px] text-[15px] leading-[21px]" style={mine
                ? { background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 82%, #fff), ${BLUE})`, color: "#fff", borderRadius: "20px 20px 6px 20px", boxShadow: `0 10px 24px -14px ${BLUE}` }
                : { ...RAISED, borderWidth: 1, color: "var(--foreground)", borderRadius: "20px 20px 20px 6px" }}>{m.body}</p>
              {lastOfRun && <span className="px-[6px] text-[11.5px]" style={{ color: MUTED }}>{m.ago}</span>}
            </div>
          </li>
        );
      })}
      <li className="sr-only">Messages between {me.name} and {mate.name}</li>
    </ul>
  );
}

/** The DM thread: the seeded messages, then what this session added. */
export function dmBubbles(dms: TeamDm[], key: string, withName: string, added: { body: string; postedAgo: string }[]): Bubble[] {
  const seeded = (dms.find((d) => d.with === withName)?.messages ?? []).map((m): Bubble => ({ from: m.from === "me" ? "me" : "them", body: m.body, ago: m.postedAgo }));
  void key;
  return [...seeded, ...added.map((m): Bubble => ({ from: "me", body: m.body, ago: m.postedAgo }))];
}

export function PinnedStrip({ posts }: { posts: D.StaffPost[] }) {
  if (!posts.length) return null;
  return (
    <section aria-label="Pinned" className="flex flex-col gap-[6px] rounded-[16px] border p-[12px]" style={{ ...RAISED }}>
      <span className="flex items-center gap-[6px] text-[11.5px] font-extrabold tracking-[0.06em] uppercase" style={{ color: MUTED }}><Pin className="h-3 w-3" aria-hidden /> Pinned</span>
      {posts.map((p) => (
        <p key={p.id} className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}><strong className="font-bold">{p.title}</strong><span style={{ color: MUTED }}> · {p.author.name}, {p.author.office}</span></p>
      ))}
    </section>
  );
}

/** True below md, where the list and the conversation are separate screens. */
export function useIsPhone(): boolean {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
}
