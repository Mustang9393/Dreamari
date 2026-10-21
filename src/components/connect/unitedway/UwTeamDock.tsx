"use client";

// The Team messages dock (15 Oct 2026).
//
// Chandu: in the United Way role the team's messages must be reachable from
// anywhere in the app, through a notifications and DMs place and the
// separate message window "like Facebook does it". So: a Messages icon in
// the top nav (only while the United Way Team role is on), and a Messenger
// shaped window that opens from it. From sm it is a docked window at the
// bottom right; on a phone it is the whole screen. One list of every
// channel and direct message, newest and unread first, and a conversation
// view with a composer. It reads and writes the same store as the Team tab,
// so a message sent here is the message the Team tab shows.
// Staff to staff only; nothing in here ever names a student.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronLeft, Globe2, Hash, Maximize2, MessagesSquare, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { NavIconButton } from "@/components/app/Inbox";
import { SOUTH_CENTRAL, UW_SC_ID } from "./uwSouthCentral";
import { addTeamMessage, closeTeamDock, markTeamSeen, openTeamDock, useTeamDock } from "./uwStore";
import { agoMinutes } from "./uwCommunity";
import { BLUE, BLUE_TEXT, MUTED } from "./uwUi";
import { BLUE_WASH, Bubbles, Composer, Face, FROST, RAISED, channelOf, dmBubbles, isOnline, useTeamModel, type Conversation } from "./uwTeamShared";

type Filter = "all" | "dm" | "channel";

function Row({ c, onPick }: { c: Conversation; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="dm-quiet flex min-h-[60px] w-full cursor-pointer items-center gap-[12px] rounded-[14px] px-[10px] text-left">
      {c.who ? <Face who={c.who} size={40} presence /> : (
        <span className="flex size-[40px] flex-none items-center justify-center rounded-[12px]" style={{ background: c.group === "network" ? `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 40%, transparent), color-mix(in srgb, ${BLUE} 14%, transparent))` : "var(--glass-surface-2)" }}>
          {c.group === "network" ? <Globe2 className="h-[18px] w-[18px]" aria-hidden style={{ color: BLUE_TEXT }} /> : <Hash className="h-[18px] w-[18px]" aria-hidden style={{ color: MUTED }} />}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline justify-between gap-[8px]">
          <span className={`truncate text-[15px] leading-[20px] ${c.unread ? "font-extrabold" : "font-semibold"}`} style={{ color: "var(--foreground)" }}>{c.label}</span>
          <span className="flex-none text-[12px]" style={{ color: MUTED }}>{c.ago}</span>
        </span>
        <span className="truncate text-[13px] leading-[18px]" style={{ color: c.unread ? "var(--foreground)" : MUTED, fontWeight: c.unread ? 600 : 400 }}>{c.preview}</span>
      </span>
      {c.unread && <span role="img" aria-label="Unread" className="size-[9px] flex-none rounded-full" style={{ background: BLUE, boxShadow: `0 0 0 3px color-mix(in srgb, ${BLUE} 25%, transparent)` }} />}
    </button>
  );
}

function Dock() {
  const router = useRouter();
  const board = SOUTH_CENTRAL;
  const m = useTeamModel(board);
  const dock = useTeamDock();
  const [filter, setFilter] = useState<Filter>("all");
  const [openKey, setOpenKey] = useState<string | null>(dock.key);
  // a notification lands the dock on one conversation (the parent keys this component on it)
  useEffect(() => { if (openKey) markTeamSeen(openKey); }, [openKey]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") closeTeamDock(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);

  const current = openKey ? m.conversations.find((c) => c.key === openKey) : undefined;
  const sorted = [...m.conversations]
    .filter((c) => filter === "all" || (filter === "dm" ? c.group === "dm" : c.group !== "dm"))
    .sort((a, b) => Number(b.unread) - Number(a.unread) || agoMinutes(a.ago || "9w ago") - agoMinutes(b.ago || "9w ago"));
  const added = current ? m.store.team[current.key] ?? [] : [];
  const channel = current?.open.kind === "channel" ? channelOf(current.open.key) : undefined;
  const mate = current?.who;
  const posts = channel ? m.posts.filter((p) => (p.channel ?? "general") === channel.key).sort((a, b) => agoMinutes(b.postedAgo) - agoMinutes(a.postedAgo)).slice(-6) : [];
  const chips: { key: Filter; label: string }[] = [{ key: "all", label: "All" }, { key: "dm", label: "Direct" }, { key: "channel", label: "Channels" }];

  return createPortal(
      <div role="dialog" aria-label="Team messages" className="fixed inset-0 z-[85] flex sm:inset-auto sm:right-[24px] sm:bottom-[20px]">
        <div className="flex h-full w-full flex-col overflow-hidden border sm:h-[min(640px,calc(calc(100dvh/var(--vz,1))-96px))] sm:w-[392px] sm:rounded-[22px]" style={{ ...RAISED, background: "color-mix(in srgb, var(--background) 90%, transparent)", ...FROST, boxShadow: "0 30px 80px -28px rgba(0,0,0,0.85)" }}>
          <header className="flex items-center gap-[10px] border-b px-[12px] py-[12px]" style={{ borderColor: "var(--color-glass-border-raised)" }}>
            {current ? (
              <>
                <button type="button" aria-label="Back to messages" onClick={() => setOpenKey(null)} className="dm-quiet -ml-[2px] flex size-[38px] flex-none cursor-pointer items-center justify-center rounded-full"><ChevronLeft className="h-[22px] w-[22px]" aria-hidden /></button>
                {mate ? <Face who={mate} size={36} presence /> : (
                  <span className="flex size-[36px] flex-none items-center justify-center rounded-[12px]" style={{ background: "var(--glass-surface-2)" }}>{current.group === "network" ? <Globe2 className="h-[18px] w-[18px]" aria-hidden style={{ color: BLUE_TEXT }} /> : <Hash className="h-[18px] w-[18px]" aria-hidden style={{ color: MUTED }} />}</span>
                )}
                <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[15.5px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{current.label}</span><span className="truncate text-[12px] leading-[16px]" style={{ color: MUTED }}>{mate ? `${mate.office}${isOnline(mate.name) ? " · Online" : ""}` : current.sub}</span></span>
              </>
            ) : (
              <>
                <span className="flex size-[36px] flex-none items-center justify-center rounded-[12px]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 55%, transparent), color-mix(in srgb, ${BLUE} 18%, transparent))` }}><MessagesSquare className="h-[18px] w-[18px]" aria-hidden style={{ color: "#fff" }} /></span>
                <span className="flex min-w-0 flex-1 flex-col"><span className="text-[16px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Team messages</span><span className="text-[12px] leading-[16px]" style={{ color: MUTED }}>Staff only</span></span>
              </>
            )}
            <IconTip label="Open in Team">
              <button type="button" aria-label="Open in Team" onClick={() => { closeTeamDock(); router.push(`/connect?board=${UW_SC_ID}`); }} className="dm-quiet flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: MUTED }}><Maximize2 className="h-4 w-4" aria-hidden /></button>
            </IconTip>
            <IconTip label="Close">
              <button type="button" aria-label="Close" onClick={closeTeamDock} className="dm-quiet flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: MUTED }}><X className="h-[18px] w-[18px]" aria-hidden /></button>
            </IconTip>
          </header>

          {!current ? (
            <>
              <div className="flex gap-[6px] px-[12px] pt-[10px] pb-[4px]" role="tablist" aria-label="Filter messages">
                {chips.map((c) => (
                  <button key={c.key} type="button" role="tab" aria-selected={filter === c.key} onClick={() => setFilter(c.key)} className="dm-quiet min-h-[34px] cursor-pointer rounded-full border px-[14px] text-[13px] font-bold" style={filter === c.key ? { background: BLUE_WASH, borderColor: `color-mix(in srgb, ${BLUE} 55%, transparent)`, color: "var(--foreground)" } : { borderColor: "var(--color-glass-border-raised)", color: MUTED }}>{c.label}</button>
                ))}
              </div>
              <div className="dm-scroll min-h-0 flex-1 overflow-y-auto px-[6px] pb-[10px]">
                {sorted.map((c) => <Row key={c.key} c={c} onPick={() => setOpenKey(c.key)} />)}
              </div>
            </>
          ) : (
            <>
              <div className="dm-scroll flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-[12px] py-[12px]">
                {channel && (
                  <ul className="flex flex-col gap-[14px]">
                    {posts.map((p) => (
                      <li key={p.id} className="flex flex-col gap-[4px]">
                        <span className="flex items-center gap-[8px]"><Face who={p.author} size={26} /><span className="text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{p.author.name}</span><span className="text-[12px]" style={{ color: MUTED }}>{p.author.office} · {p.postedAgo}</span></span>
                        <p className="text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}><strong className="font-bold">{p.title}</strong>{p.body ? <><br /><span style={{ color: "color-mix(in srgb, var(--foreground) 85%, transparent)" }}>{p.body}</span></> : null}</p>
                        {p.replies.length > 0 && <span className="text-[12.5px] font-bold" style={{ color: BLUE_TEXT }}>{p.replies.length} {p.replies.length === 1 ? "reply" : "replies"}</span>}
                      </li>
                    ))}
                    {added.map((a) => (
                      <li key={a.id} className="flex flex-col gap-[4px]"><span className="flex items-center gap-[8px]"><Face who={m.me} size={26} /><span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{m.me.name}</span><span className="text-[12px]" style={{ color: MUTED }}>{a.postedAgo}</span></span><p className="text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>{a.body}</p></li>
                    ))}
                  </ul>
                )}
                {mate && <Bubbles items={dmBubbles(m.dms, current.key, mate.name, added)} me={m.me} mate={mate} />}
              </div>
              <div className="border-t px-[12px] py-[10px] pb-[calc(10px+env(safe-area-inset-bottom))]" style={{ borderColor: "var(--color-glass-border-raised)" }}>
                <Composer compact placeholder={channel ? `Message #${channel.label}` : `Message ${mate?.name ?? ""}`} onSend={(text) => addTeamMessage(current.key, text)} />
              </div>
            </>
          )}
        </div>
      </div>,
    document.body,
  );
}

/** The nav's Messages icon for the United Way Team role, and the dock it opens.
 *  The top bar mounts this twice (desktop and phone bar, one hidden by CSS),
 *  so only the instance that is actually on screen owns the dock. */
export default function TeamMessagesNav() {
  const m = useTeamModel(SOUTH_CENTRAL);
  const dock = useTeamDock();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setShown(el.getClientRects().length > 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span ref={ref} className="flex">
      <NavIconButton label="Team messages" badge={m.unreadCount} open={dock.open} onClick={() => (dock.open ? closeTeamDock() : openTeamDock())}>
        <MessagesSquare className="h-5 w-5" aria-hidden />
      </NavIconButton>
      {dock.open && shown && <Dock key={dock.key ?? "list"} />}
    </span>
  );
}
