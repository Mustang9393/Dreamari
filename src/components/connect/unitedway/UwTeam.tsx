"use client";

// Team: United Way's private workspace (15 Oct 2026).
//
// Maisha's review: "A private internal workspace, invisible to students and
// corporate volunteers. Include a General channel for organization-wide
// updates and dedicated communities for departments or teams, similar to
// Slack. Allow private colleague-to-colleague messaging where appropriate,
// but not private messaging between adults and students." So: a channel
// list (General, Youth Programs, Volunteer Engagement, Events,
// Partnerships), the channel's messages oldest to newest with their
// threads, a composer, and direct messages between staff. The board only
// renders this for the United Way Team POV; nobody else can reach it, and
// a direct message can only name a colleague from the board's own staff.

import { useState } from "react";
import { Calendar, CheckCircle2, ChevronRight, FileText, Hash, Lock, MessageCircle, Pin, Send } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { CONTACT_INFO, CONTACT_WARNING, QuietCta } from "../primitives";
import { addTeamMessage, useUwStore } from "./uwStore";
import { agoMinutes, boardStaff } from "./uwCommunity";
import * as D from "./uwData";
import { TEAM_DMS, TEAM_EXTRA } from "./uwTeamSeeds";
import { BLUE, BLUE_TEXT, GOOD, MUTED, PillSelect, SOLID } from "./uwUi";
import { Avatar } from "../primitives";

type Open = { kind: "channel"; key: D.TeamChannel } | { kind: "dm"; with: string };
const keyOf = (o: Open) => (o.kind === "channel" ? `ch:${o.key}` : `dm:${o.with}`);

function Face({ who, size = 36 }: { who: D.StaffMember; size?: number }) {
  return <Avatar name={who.name} photo={D.staffPhoto(who)} size={size} />;
}

function Byline({ who, ago }: { who: D.StaffMember; ago: string }) {
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
      <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{who.name}</span>
      <span className="truncate text-[12.5px] leading-[18px]" style={{ color: MUTED }}>{who.role} · {who.office}</span>
      <span className="text-[12px] leading-[18px]" style={{ color: MUTED }}>{ago}</span>
    </span>
  );
}

function Composer({ placeholder, onSend, compact = false }: { placeholder: string; onSend: (text: string) => void; compact?: boolean }) {
  const [text, setText] = useState("");
  const leaks = CONTACT_INFO.test(text);
  const send = () => { if (!text.trim() || leaks) return; onSend(text.trim()); setText(""); };
  return (
    <div className="flex flex-col gap-[6px]">
      <div className={`flex items-end gap-[6px] border py-[4px] pr-[4px] pl-[14px] ${compact ? "rounded-[18px]" : "rounded-[var(--radius-md)]"}`} style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <label className="min-w-0 flex-1">
          <span className="sr-only">{placeholder}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={800} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="block max-h-[160px] min-h-[36px] w-full resize-none bg-transparent py-[7px] text-[14.5px] leading-[21px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ color: "var(--foreground)", fieldSizing: "content" } as React.CSSProperties} />
        </label>
        <IconTip label="Send">
          <button type="button" aria-label="Send" onClick={send} disabled={!text.trim() || leaks} className="dm-solid flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-40" style={SOLID}><Send className="h-4 w-4" aria-hidden /></button>
        </IconTip>
      </div>
      {leaks && <span role="alert" className="text-[12.5px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</span>}
    </div>
  );
}

/** One message, Slack's shape: face, name, role and office, time, the
 *  words, anything attached, then its thread. */
function Message({ p, me, openEvent, toast }: { p: D.StaffPost; me: D.StaffMember; openEvent: (id: string) => void; toast: (t: string) => void }) {
  const store = useUwStore();
  const added = store.team[`reply:${p.id}`] ?? [];
  const replies = [...p.replies, ...added.map((m) => ({ author: me, body: m.body, postedAgo: m.postedAgo }))];
  const [open, setOpen] = useState(false);
  const done = p.tasks?.filter((t) => t.done).length ?? 0;
  return (
    <li className="flex gap-[12px] py-[12px]">
      <Face who={p.author} />
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <Byline who={p.author} ago={p.postedAgo} />
        {p.pinned && <span className="flex items-center gap-[4px] text-[11.5px] font-bold" style={{ color: MUTED }}><Pin className="h-3 w-3" aria-hidden /> Pinned</span>}
        <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}><strong className="font-bold">{p.title}</strong>{p.body ? <><br />{p.body}</> : null}</p>
        {p.resource && (
          <button type="button" onClick={() => toast(`${p.resource!.label} opened.`)} className="dm-quiet mt-[4px] flex w-full max-w-[420px] cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border p-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <span className="flex size-[40px] flex-none items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${BLUE} 22%, var(--glass-surface-1))` }}><FileText className="h-5 w-5" aria-hidden style={{ color: BLUE_TEXT }} /></span>
            <span className="flex min-w-0 flex-col"><span className="truncate text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{p.resource.label}</span><span className="text-[12.5px]" style={{ color: MUTED }}>{p.resource.meta}</span></span>
          </button>
        )}
        {p.tasks && (
          <ul className="mt-[4px] flex max-w-[520px] flex-col rounded-[var(--radius-md)] border px-[12px] py-[4px]" style={{ borderColor: "var(--glass-border)" }}>
            <li className="py-[6px] text-[12.5px] font-bold" style={{ color: MUTED }}>{done} of {p.tasks.length} done</li>
            {p.tasks.map((t) => (
              <li key={t.office + t.task} className="flex items-center gap-[10px] border-t py-[7px] text-[14px]" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                {t.done ? <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} /> : <span aria-hidden className="size-[16px] flex-none rounded-full border-2" style={{ borderColor: "var(--glass-border)" }} />}
                <span className="min-w-0 flex-1">{t.task}</span>
                <span className="flex-none text-[12.5px] font-semibold" style={{ color: MUTED }}>{t.owner}, {t.office}</span>
              </li>
            ))}
          </ul>
        )}
        {p.eventId && <QuietCta size="sm" className="mt-[4px] w-fit" onClick={() => openEvent(p.eventId!)}><Calendar className="h-3.5 w-3.5" aria-hidden /> Open the event board</QuietCta>}
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="dm-quiet -ml-[8px] flex min-h-[32px] w-fit cursor-pointer items-center gap-[6px] rounded-full px-[8px] text-[13px] font-bold" style={{ color: BLUE_TEXT }}>
          <MessageCircle className="h-4 w-4" aria-hidden /> {replies.length ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "Reply"} <ChevronRight className="h-3.5 w-3.5 transition-transform" aria-hidden style={{ transform: open ? "rotate(90deg)" : "none" }} />
        </button>
        {open && (
          <div className="flex flex-col gap-[10px] border-l-2 pl-[14px]" style={{ borderColor: "var(--glass-border)" }}>
            <ul className="flex flex-col gap-[10px]">
              {replies.map((r, i) => (
                <li key={i} className="flex gap-[10px]">
                  <Face who={r.author} size={28} />
                  <div className="flex min-w-0 flex-col"><Byline who={r.author} ago={r.postedAgo} /><p className="text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>{r.body}</p></div>
                </li>
              ))}
            </ul>
            <Composer compact placeholder="Reply in thread" onSend={(text) => addTeamMessage(`reply:${p.id}`, text)} />
          </div>
        )}
      </div>
    </li>
  );
}

export function TeamWorkspace({ board, openEvent, toast }: { board: D.UwBoard; openEvent: (id: string) => void; toast: (t: string) => void }) {
  const store = useUwStore();
  const [open, setOpen] = useState<Open>({ kind: "channel", key: "general" });
  const me = board.staff.me;
  const staff = boardStaff(board).filter((m) => m.name !== me.name);
  const posts = [...board.staff.posts.filter((p) => !p.public), ...(TEAM_EXTRA[board.id] ?? [])];
  const inChannel = (k: D.TeamChannel) => posts.filter((p) => (p.channel ?? "general") === k);
  const dms = TEAM_DMS[board.id] ?? [];
  // every colleague can be messaged; ones with a conversation come first
  const people = [...staff].sort((a, b) => Number(dms.some((d) => d.with === b.name)) - Number(dms.some((d) => d.with === a.name)));
  const added = store.team[keyOf(open)] ?? [];
  const channel = open.kind === "channel" ? D.TEAM_CHANNELS.find((c) => c.key === open.key)! : undefined;
  const mate = open.kind === "dm" ? staff.find((m) => m.name === open.with) : undefined;
  const list = channel ? [...inChannel(channel.key)].sort((a, b) => agoMinutes(b.postedAgo) - agoMinutes(a.postedAgo)) : [];
  const dm = open.kind === "dm" ? dms.find((d) => d.with === open.with)?.messages ?? [] : [];
  const pick = (o: Open) => setOpen(o);
  const options = [...D.TEAM_CHANNELS.map((c) => ({ value: `ch:${c.key}`, label: `# ${c.label}` })), ...people.map((m) => ({ value: `dm:${m.name}`, label: `${m.name}, ${m.office}` }))];
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <span className="flex items-center gap-[8px] text-[13.5px] font-semibold" style={{ color: MUTED }}><Lock className="h-4 w-4 flex-none" aria-hidden style={{ color: "#C98F00" }} /> Only United Way staff can see Team.</span>
      {/* phones: one picker instead of the side list */}
      <div className="lg:hidden">
        <PillSelect ariaLabel="Channel or person" value={keyOf(open)} onChange={(v) => pick(v.startsWith("ch:") ? { kind: "channel", key: v.slice(3) as D.TeamChannel } : { kind: "dm", with: v.slice(3) })} options={options} />
      </div>
      <div className="grid grid-cols-1 overflow-visible rounded-[var(--radius-lg)] border lg:grid-cols-[260px_minmax(0,1fr)]" style={{ borderColor: "var(--glass-border)" }}>
        <nav aria-label="Team channels" className="hidden flex-col gap-[var(--space-4)] border-r p-[var(--space-4)] lg:flex" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)" }}>
          <div className="flex flex-col gap-[2px]">
            <span className="px-[10px] pb-[4px] text-[11.5px] font-extrabold tracking-[0.06em] uppercase" style={{ color: MUTED }}>Channels</span>
            {D.TEAM_CHANNELS.map((c) => {
              const on = open.kind === "channel" && open.key === c.key;
              const n = inChannel(c.key).length + (store.team[`ch:${c.key}`]?.length ?? 0);
              return (
                <button key={c.key} type="button" aria-current={on ? "page" : undefined} onClick={() => pick({ kind: "channel", key: c.key })} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] px-[10px] text-left text-[14px]"
                  style={on ? { background: `color-mix(in srgb, ${BLUE} 22%, transparent)`, color: "var(--foreground)", fontWeight: 700 } : { color: "var(--foreground)", fontWeight: 500 }}>
                  <Hash className="h-4 w-4 flex-none" aria-hidden style={{ color: MUTED }} /><span className="min-w-0 flex-1 truncate">{c.label}</span><span className="text-[12px] tabular-nums" style={{ color: MUTED }}>{n}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="px-[10px] pb-[4px] text-[11.5px] font-extrabold tracking-[0.06em] uppercase" style={{ color: MUTED }}>Direct messages</span>
            {people.map((m) => {
              const on = open.kind === "dm" && open.with === m.name;
              return (
                <button key={m.name} type="button" aria-current={on ? "page" : undefined} onClick={() => pick({ kind: "dm", with: m.name })} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] px-[10px] text-left text-[14px]"
                  style={on ? { background: `color-mix(in srgb, ${BLUE} 22%, transparent)`, color: "var(--foreground)", fontWeight: 700 } : { color: "var(--foreground)", fontWeight: 500 }}>
                  <Face who={m} size={22} /><span className="min-w-0 flex-1 truncate">{m.name}</span><span className="truncate text-[12px]" style={{ color: MUTED }}>{m.office}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <section aria-label={channel ? channel.label : `Messages with ${open.kind === "dm" ? open.with : ""}`} className="flex min-w-0 flex-col">
          <header className="flex flex-col gap-[2px] border-b px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
            <h2 className="flex items-center gap-[6px] text-[18px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              {channel ? <><Hash className="h-[18px] w-[18px]" aria-hidden style={{ color: MUTED }} />{channel.label}</> : mate ? <><Face who={mate} size={24} />{mate.name}</> : null}
            </h2>
            <span className="text-[13px]" style={{ color: MUTED }}>{channel ? channel.line : mate ? `${mate.role} · ${mate.office}. Only you two can see this.` : ""}</span>
          </header>
          <ul className="flex flex-col divide-y px-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
            {channel && list.map((p) => <Message key={p.id} p={p} me={me} openEvent={openEvent} toast={toast} />)}
            {mate && dm.map((m, i) => {
              const who = m.from === "me" ? me : mate;
              return <li key={i} className="flex gap-[12px] py-[12px]"><Face who={who} /><div className="flex min-w-0 flex-col gap-[2px]"><Byline who={who} ago={m.postedAgo} /><p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{m.body}</p></div></li>;
            })}
            {added.map((m) => <li key={m.id} className="flex gap-[12px] py-[12px]"><Face who={me} /><div className="flex min-w-0 flex-col gap-[2px]"><Byline who={me} ago={m.postedAgo} /><p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{m.body}</p></div></li>)}
            {channel && list.length + added.length === 0 && <li className="py-[var(--space-5)] text-[14px]" style={{ color: MUTED }}>No messages yet. Start the channel.</li>}
            {mate && dm.length + added.length === 0 && <li className="py-[var(--space-5)] text-[14px]" style={{ color: MUTED }}>Say hello to {mate.name}.</li>}
          </ul>
          <div className="mt-auto border-t px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
            <Composer placeholder={channel ? `Message #${channel.label}` : `Message ${open.kind === "dm" ? open.with : ""}`} onSend={(text) => addTeamMessage(keyOf(open), text)} />
          </div>
        </section>
      </div>
    </div>
  );
}
