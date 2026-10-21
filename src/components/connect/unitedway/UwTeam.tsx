"use client";

// Team: United Way's private workspace (15 Oct 2026).
//
// Maisha's review: "A private internal workspace, invisible to students and
// corporate volunteers. Include a General channel for organization-wide
// updates and dedicated communities for departments or teams, similar to
// Slack. Allow private colleague-to-colleague messaging where appropriate,
// but not private messaging between adults and students." So: channels for
// the office, a small group of topic channels for All United Ways (Chandu:
// only the United Way team talks globally), the channel's messages with
// their threads, a composer, and direct messages between staff. The board
// only renders this for the United Way Team POV; a direct message can only
// name a colleague from the board's own staff.
//
// Layout follows Slack and Discord. Desktop and tablet: a list on the left
// and the conversation beside it. Phone: the list IS the screen (Slack's
// Home), a conversation opens full width with a back button, and the
// composer stays docked above the bottom bar. DM threads read as bubbles,
// channel messages as cards.

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Globe2, Hash, Lock, ShieldCheck } from "lucide-react";
import { addTeamMessage, markTeamSeen } from "./uwStore";
import { agoMinutes } from "./uwCommunity";
import * as D from "./uwData";
import { BLUE, BLUE_TEXT, MUTED } from "./uwUi";
import { BLUE_WASH, Bubbles, Composer, DayDivider, Face, FaceStack, FROST, PinnedStrip, PostCard, RAISED, channelOf, dayLabel, dmBubbles, isOnline, keyOf, useIsPhone, useTeamModel, type Conversation, type Open } from "./uwTeamShared";

const GROUPS: { id: Conversation["group"]; title: string; icon?: "globe" }[] = [
  { id: "office", title: "Your office" },
  { id: "network", title: "All United Ways", icon: "globe" },
  { id: "dm", title: "Direct messages" },
];

function Row({ c, on, onPick }: { c: Conversation; on: boolean; onPick: () => void }) {
  return (
    <button type="button" aria-current={on ? "page" : undefined} onClick={onPick}
      className="dm-quiet flex min-h-[62px] w-full cursor-pointer items-center gap-[12px] rounded-[14px] px-[12px] text-left md:min-h-[40px] md:gap-[10px] md:rounded-[12px] md:px-[10px]"
      style={on ? { background: BLUE_WASH, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${BLUE} 45%, transparent)` } : undefined}>
      {c.who ? <Face who={c.who} size={40} presence /> : (
        <span className="flex size-[40px] flex-none items-center justify-center rounded-[12px] md:size-[26px] md:rounded-[8px]" style={{ background: c.group === "network" ? `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 40%, transparent), color-mix(in srgb, ${BLUE} 14%, transparent))` : "var(--glass-surface-2)" }}>
          <Hash className="h-[18px] w-[18px] md:h-[14px] md:w-[14px]" aria-hidden style={{ color: c.group === "network" ? BLUE_TEXT : MUTED }} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline justify-between gap-[8px]">
          <span className={`truncate text-[15px] leading-[20px] md:text-[14px] ${c.unread || on ? "font-extrabold" : "font-semibold"}`} style={{ color: "var(--foreground)" }}>{c.label}</span>
          <span className="flex-none text-[12px] md:hidden" style={{ color: MUTED }}>{c.ago}</span>
        </span>
        <span className="truncate text-[13px] leading-[18px] md:hidden" style={{ color: c.unread ? "var(--foreground)" : MUTED, fontWeight: c.unread ? 600 : 400 }}>{c.preview}</span>
      </span>
      {c.unread && <span role="img" aria-label="Unread" className="size-[9px] flex-none rounded-full" style={{ background: BLUE, boxShadow: `0 0 0 3px color-mix(in srgb, ${BLUE} 25%, transparent)` }} />}
    </button>
  );
}

export function TeamWorkspace({ board, openEvent, toast }: { board: D.UwBoard; openEvent: (id: string) => void; toast: (t: string) => void }) {
  const m = useTeamModel(board);
  const { store, me, posts, dms, conversations } = m;
  const [open, setOpen] = useState<Open>({ kind: "channel", key: "general" });
  // phone only: the list is the screen until a conversation is picked
  const [chat, setChat] = useState(false);
  const [shut, setShut] = useState<Record<string, boolean>>({});
  const phone = useIsPhone();
  const key = keyOf(open);
  useEffect(() => { markTeamSeen(key); }, [key]);

  const channel = open.kind === "channel" ? channelOf(open.key) : undefined;
  const mate = open.kind === "dm" ? m.staff.find((s) => s.name === open.with) : undefined;
  const added = store.team[key] ?? [];
  const network = channel?.group === "network";

  const timeline = useMemo(() => {
    if (!channel) return [];
    const list = posts.filter((p) => (p.channel ?? "general") === channel.key && !p.pinned).sort((a, b) => agoMinutes(b.postedAgo) - agoMinutes(a.postedAgo));
    const out: ({ day: string } | { post: D.StaffPost })[] = [];
    let last = "";
    for (const p of list) { const d = dayLabel(p.postedAgo); if (d !== last) { out.push({ day: d }); last = d; } out.push({ post: p }); }
    return out;
  }, [channel, posts]);
  const pinned = channel ? posts.filter((p) => (p.channel ?? "general") === channel.key && p.pinned) : [];
  const bubbles = mate ? dmBubbles(dms, key, mate.name, added) : [];
  const members = channel ? [...posts.filter((p) => (p.channel ?? "general") === channel.key).map((p) => p.author), ...posts.filter((p) => (p.channel ?? "general") === channel.key).flatMap((p) => p.replies.map((r) => r.author))] : [];
  const pick = (c: Conversation) => { setOpen(c.open); setChat(true); };

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="grid grid-cols-1 rounded-[22px] md:grid-cols-[232px_minmax(0,1fr)] lg:grid-cols-[288px_minmax(0,1fr)]" style={{ boxShadow: "0 24px 60px -34px rgba(0,0,0,0.6)" }}>
        {/* the list: the whole screen on a phone, the left column from tablet */}
        <nav aria-label="Team conversations" className={`${chat ? "hidden" : "flex"} min-w-0 flex-col gap-[var(--space-4)] rounded-[22px] border p-[12px] md:flex md:rounded-r-none md:border-r-0 md:p-[14px]`} style={{ ...RAISED, background: `linear-gradient(180deg, color-mix(in srgb, ${BLUE} 10%, var(--color-glass-surface-raised)), var(--color-glass-surface-raised) 38%)`, ...FROST }}>
          <div className="flex items-center gap-[10px] px-[6px] pt-[2px]">
            <span className="flex size-[36px] flex-none items-center justify-center rounded-[12px]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 55%, transparent), color-mix(in srgb, ${BLUE} 18%, transparent))` }}><Lock className="h-[16px] w-[16px]" aria-hidden style={{ color: "#fff" }} /></span>
            <span className="flex min-w-0 flex-col"><span className="truncate text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>United Way Team</span><span className="text-[12px] leading-[16px]" style={{ color: MUTED }}>Staff only</span></span>
          </div>
          {GROUPS.map((g) => {
            const rows = conversations.filter((c) => c.group === g.id);
            const closed = !!shut[g.id];
            return (
              <div key={g.id} className="flex flex-col gap-[2px]">
                <button type="button" aria-expanded={!closed} onClick={() => setShut((s) => ({ ...s, [g.id]: !s[g.id] }))} className="dm-quiet flex min-h-[32px] w-full cursor-pointer items-center gap-[6px] rounded-[10px] px-[8px] text-left text-[11.5px] font-extrabold tracking-[0.06em] uppercase" style={{ color: MUTED }}>
                  <ChevronDown className="h-3.5 w-3.5 flex-none transition-transform" aria-hidden style={{ transform: closed ? "rotate(-90deg)" : "none" }} />
                  {g.icon === "globe" && <Globe2 className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />}
                  <span className="flex-1">{g.title}</span>
                </button>
                {!closed && rows.map((c) => <Row key={c.key} c={c} on={c.key === key && (!phone || chat)} onPick={() => pick(c)} />)}
              </div>
            );
          })}
        </nav>

        {/* the conversation */}
        <section aria-label={channel ? channel.label : `Messages with ${mate?.name ?? ""}`} className={`${chat ? "flex" : "hidden"} min-w-0 flex-col rounded-[22px] border md:flex md:rounded-l-none`} style={{ ...RAISED, background: "color-mix(in srgb, var(--background) 55%, var(--color-glass-surface-raised))" }}>
          <header className="sticky top-[76px] z-[5] flex items-center gap-[10px] rounded-t-[22px] border-b px-[12px] py-[12px] md:static md:px-[var(--space-5)] md:py-[var(--space-4)]" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 72%, transparent)", ...FROST }}>
            <button type="button" aria-label="Back to conversations" onClick={() => setChat(false)} className="dm-quiet -ml-[4px] flex size-[40px] flex-none cursor-pointer items-center justify-center rounded-full md:hidden"><ChevronLeft className="h-[22px] w-[22px]" aria-hidden /></button>
            {channel ? (
              <span className="flex size-[40px] flex-none items-center justify-center rounded-[13px]" style={{ background: network ? `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 45%, transparent), color-mix(in srgb, ${BLUE} 14%, transparent))` : "var(--glass-surface-2)" }}>{network ? <Globe2 className="h-5 w-5" aria-hidden style={{ color: BLUE_TEXT }} /> : <Hash className="h-5 w-5" aria-hidden style={{ color: MUTED }} />}</span>
            ) : mate ? <Face who={mate} size={40} presence /> : null}
            <span className="flex min-w-0 flex-1 flex-col">
              <h2 className="truncate text-[17px] leading-[22px] font-extrabold md:text-[18px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{channel ? channel.label : mate?.name}</h2>
              <span className="truncate text-[12.5px] leading-[17px]" style={{ color: MUTED }}>{channel ? (network ? `All United Ways · ${channel.line}` : channel.line) : mate ? `${mate.role} · ${mate.office}${isOnline(mate.name) ? " · Online" : ""}` : ""}</span>
            </span>
            {channel && members.length > 0 && <span className="hidden sm:flex"><FaceStack people={members} size={26} /></span>}
          </header>

          <div className="flex min-h-[420px] flex-1 flex-col gap-[var(--space-4)] px-[12px] py-[var(--space-4)] md:px-[var(--space-5)]">
            {network && (
              <p className="flex items-start gap-[10px] rounded-[14px] border px-[12px] py-[10px] text-[13px] leading-[19px]" style={{ borderColor: `color-mix(in srgb, ${BLUE} 35%, transparent)`, background: `color-mix(in srgb, ${BLUE} 9%, transparent)`, color: "var(--foreground)" }}>
                <ShieldCheck className="mt-[1px] h-4 w-4 flex-none" aria-hidden style={{ color: BLUE_TEXT }} />
                <span>Staff at every United Way can read this channel. Keep student names and details out.{"owner" in channel && channel.owner ? <> Run by {channel.owner}.</> : null}</span>
              </p>
            )}
            {channel && <PinnedStrip posts={pinned} />}
            {channel && (
              <ul className="flex flex-col gap-[var(--space-3)]">
                {timeline.map((t, i) => "day" in t ? <DayDivider key={`d${i}`} label={t.day} /> : <PostCard key={t.post.id} p={t.post} me={me} openEvent={openEvent} toast={toast} />)}
                {added.map((a) => (
                  <li key={a.id} className="flex gap-[12px] rounded-[18px] border p-[14px]" style={RAISED}><Face who={me} size={40} /><div className="flex min-w-0 flex-col gap-[2px]"><span className="text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{me.name} <span className="text-[12px] font-normal" style={{ color: MUTED }}>{a.postedAgo}</span></span><p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{a.body}</p></div></li>
                ))}
                {timeline.length + added.length === 0 && <li className="py-[var(--space-5)] text-[14px]" style={{ color: MUTED }}>No messages yet. Start the channel.</li>}
              </ul>
            )}
            {mate && (bubbles.length ? <Bubbles items={bubbles} me={me} mate={mate} /> : <p className="py-[var(--space-5)] text-[14px]" style={{ color: MUTED }}>Say hello to {mate.name}.</p>)}
          </div>

          <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-[4] rounded-b-[22px] border-t px-[12px] py-[12px] md:static md:px-[var(--space-5)] md:py-[var(--space-4)]" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 70%, transparent)", ...FROST }}>
            <Composer placeholder={channel ? `Message #${channel.label}` : `Message ${mate?.name ?? ""}`} hint="Enter to send. Shift and Enter for a new line." onSend={(text) => addTeamMessage(key, text)} />
          </div>
        </section>
      </div>
    </div>
  );
}
