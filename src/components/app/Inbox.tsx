"use client";

// The inbox in the top nav: a bell for every student, and a Messages icon
// that exists only while a mentorship program is on screen (mentorship is
// a college thing; high schoolers get notifications, never chat). The
// panel is Instagram-shaped: who, what, when, one tap to the thing, and
// inline actions where a decision is waiting (accept a meeting, reply).

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, Briefcase, Calendar, FileText, Sparkles, X, Zap } from "lucide-react";
import { DreamScoreChip } from "./DreamScoreChip";
import { Portal } from "@/components/profile/CareerReport";
import { decideMeeting, markNotificationRead, openDock, resolveNotification, useInbox } from "@/lib/inbox";
import { NOTIFICATIONS, UNREAD_BY_DEFAULT, type Notification } from "./notificationsData";
import { useStage } from "@/lib/stage";
import { MENTOR, THREAD } from "@/components/connect/mentorship/mentorshipData";

const ICONS = { xp: Zap, resume: FileText, opportunity: Briefcase, plan: Calendar, insight: Sparkles } as const;

/** Below md the panel is a sheet from the bottom; from md a dropdown. One
 *  of the two renders, never both. */
function useIsPhone(): boolean {
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

type Filter = "all" | "connect" | "mentorship" | "messages";
/** Mentorship items and the Mentorship filter exist only on the Mentorship
 *  tab in Connect (direct instruction, 18 Sept 2026); the stage decides the
 *  high-school or college set of everything else. Messages folded in here
 *  too (direct feedback, 19 Sept 2026: "combine notifications and messages,
 *  just have messages as a tab inside notifications") -- one icon, one
 *  panel, so the bell's badge covers both instead of two separate counts. */
function useVisibleNotifications(filter: Filter = "all"): { list: Notification[]; unread: number; isUnread: (n: Notification) => boolean } {
  const inbox = useInbox();
  const stage = useStage();
  const list = NOTIFICATIONS
    .filter((n) => n.scope !== "mentorship" || inbox.mentorship)
    .filter((n) => !n.stage || n.stage === stage)
    .filter((n) => filter === "all" || n.scope === filter);
  const isUnread = (n: Notification) => UNREAD_BY_DEFAULT.includes(n.id) && !inbox.read.includes(n.id);
  const messageUnread = inbox.mentorship ? inbox.unread : 0;
  return { list, unread: list.filter(isUnread).length + (filter === "all" ? messageUnread : 0), isUnread };
}

/** The nav's round icon button, the same 40px as the hamburger. */
function NavIconButton({ label, open, onClick, badge, dot, children }: { label: string; open?: boolean; onClick: () => void; badge?: number; dot?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={badge ? `${label}, ${badge} new` : label}
      aria-expanded={open}
      title={label}
      onClick={onClick}
      // plain icon, no bordered surface (direct feedback, 19 Sept 2026:
      // "remove the surfaces... make them have breathing room")
      className="dm-quiet relative flex size-10 cursor-pointer items-center justify-center rounded-full"
      style={{ color: open ? "var(--primary)" : "var(--foreground)" }}
    >
      {children}
      {!!badge && (
        <span aria-hidden className="absolute top-[5px] right-[5px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[4px] text-[9.5px] leading-none font-extrabold tabular-nums" style={{ background: "#FF3040", color: "#FFFFFF", boxShadow: "0 0 0 1.5px var(--background)" }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      {dot && !badge && <span aria-hidden className="absolute top-[7px] right-[7px] size-[8px] rounded-full" style={{ background: "var(--world-food-farming-nature)", boxShadow: "0 0 0 2px var(--background)" }} />}
    </button>
  );
}

export function NotificationsButton({ align = "right" }: { align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const { unread } = useVisibleNotifications();
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  return (
    <div className="relative">
      <NavIconButton label="Notifications" badge={unread} open={open} onClick={() => setOpen((v) => !v)}>
        <Bell className="h-5 w-5" aria-hidden />
      </NavIconButton>
      {open && <NotificationsPanel align={align} onClose={() => setOpen(false)} />}
    </div>
  );
}

/** The last message worth previewing, in one line: a normal text message
 *  as-is, a shared item or a meeting proposal described in words. */
function threadPreview(): string {
  for (let i = THREAD.length - 1; i >= 0; i--) {
    const m = THREAD[i];
    if (m.text) return m.text;
    if (m.meeting) return `Proposed a meeting: ${m.meeting.when}`;
    if (m.share) return `Shared ${m.share.title}`;
  }
  return "Say hello to start the conversation.";
}

function NotificationsPanel({ align, onClose }: { align: "left" | "right"; onClose: () => void }) {
  const router = useRouter();
  const inbox = useInbox();
  const phone = useIsPhone();
  const [filter, setFilter] = useState<Filter>("all");
  const { list, isUnread } = useVisibleNotifications(filter);
  const filters: { key: Filter; label: string }[] = [{ key: "all", label: "All" }, { key: "connect", label: "Connect" }, ...(inbox.mentorship ? [{ key: "mentorship" as Filter, label: "Mentorship" }, { key: "messages" as Filter, label: "Messages" }] : [])];
  const openMessages = () => { onClose(); openDock(); };
  // message-related notifications (a meeting proposed in chat, etc.) --
  // anything the chat dock itself would surface, shown here the same way
  // every other notification is, not just implied by the preview row above.
  const messageNotifications = inbox.mentorship ? NOTIFICATIONS.filter((n) => n.chat) : [];
  const fresh = list.filter(isUnread);
  const earlier = list.filter((n) => !isUnread(n));
  const go = (n: Notification) => {
    markNotificationRead(n.id);
    onClose();
    if (n.chat) openDock();
    router.push(n.href);
  };
  const act = (n: Notification, key: string) => {
    if (key === "reply") { go(n); return; }
    resolveNotification(n.id, key);
    if (n.id === "n-meeting") decideMeeting(key as "accepted" | "declined");
  };
  const Row = ({ n }: { n: Notification }) => {
    const Icon = n.icon ? ICONS[n.icon] : null;
    const resolved = inbox.resolved[n.id];
    const unread = isUnread(n);
    return (
      <li className="relative">
        <button type="button" onClick={() => go(n)} className="dm-quiet flex w-full cursor-pointer items-start gap-[12px] rounded-[var(--radius-md)] px-[10px] py-[10px] text-left">
          {n.avatar ? (
            <Image src={n.avatar} alt="" width={80} height={80} className="size-[40px] flex-none rounded-full object-cover" />
          ) : (
            <span className="flex size-[40px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--accent-subtle)" }}>{Icon && <Icon className="h-[18px] w-[18px]" aria-hidden />}</span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span className="text-[13.5px] leading-[18px]" style={{ color: "var(--foreground)" }}>
              {n.who && <strong className="font-bold">{n.who} </strong>}{n.text}
              <span className="ml-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{n.when}</span>
            </span>
            {n.detail && <span className="truncate text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{n.detail}</span>}
          </span>
          {unread && <span aria-hidden className="mt-[6px] size-[8px] flex-none rounded-full" style={{ background: "var(--primary)" }} />}
        </button>
        {n.actions && (
          <div className="flex items-center gap-[8px] pb-[10px] pl-[62px]">
            {resolved ? (
              <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--world-food-farming-nature)" }}>{n.resolvedText?.[resolved] ?? "Done"}</span>
            ) : n.actions.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => act(n, a.key)}
                className={`${a.kind === "primary" ? "dm-solid" : "dm-quiet border"} cursor-pointer rounded-[var(--radius-sm)] px-[12px] py-[6px] text-[12.5px] leading-[16px] font-bold`}
                style={a.kind === "primary" ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </li>
    );
  };
  const body = (
    <>
      <div className="flex items-center justify-between px-[10px] pt-[4px] pb-[8px]">
        <span className="text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Notifications</span>
        <button type="button" aria-label="Close" onClick={onClose} className={`dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full ${phone ? "" : "hidden"}`} style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
      </div>
      <div role="tablist" aria-label="Filter notifications" className="flex gap-[6px] px-[10px] pb-[10px]">
        {filters.map((f) => {
          const on = f.key === filter;
          return (
            <button key={f.key} type="button" role="tab" aria-selected={on} onClick={() => setFilter(f.key)} className="dm-quiet relative cursor-pointer rounded-full border px-[11px] py-[4px] text-[12px] leading-[16px] font-bold" style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
              {f.label}
              {f.key === "messages" && inbox.unread > 0 && <span aria-hidden className="absolute -top-[3px] -right-[3px] size-[8px] rounded-full" style={{ background: "#FF3040", boxShadow: "0 0 0 1.5px var(--background)" }} />}
            </button>
          );
        })}
      </div>
      {/* Messages: an explicit, always-there "open the conversation" row
         first -- direct feedback, 19 Sept 2026: "otherwise how do I launch
         messages?" -- then any message-related notifications (accept a
         meeting proposed in chat, etc.) below it, using the same Row every
         other tab uses so Accept/Decline and read state all work the same
         way (direct feedback: "I should see message notifications and the
         conversation which I can click to open"). */}
      {filter === "messages" ? (
        <>
          <button type="button" onClick={openMessages} className="dm-quiet flex w-full cursor-pointer items-start gap-[12px] rounded-[var(--radius-md)] px-[10px] py-[10px] text-left">
            <Image src={MENTOR.photo} alt="" width={80} height={80} className="size-[40px] flex-none rounded-full object-cover" />
            <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span className="text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{MENTOR.name}</span>
              <span className="truncate text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{threadPreview()}</span>
            </span>
            <span className="mt-[2px] flex flex-none items-center gap-[6px]">
              {inbox.unread > 0 && (
                <span aria-hidden className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-[10.5px] leading-none font-extrabold tabular-nums" style={{ background: "#FF3040", color: "#FFFFFF" }}>
                  {inbox.unread > 9 ? "9+" : inbox.unread}
                </span>
              )}
              <span className="text-[12.5px] leading-[16px] font-bold" style={{ color: "var(--accent-subtle)" }}>Open</span>
            </span>
          </button>
          {messageNotifications.length > 0 && (
            <>
              <span className="block px-[10px] pt-[8px] pb-[4px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Waiting on you</span>
              <ul className="flex flex-col">{messageNotifications.map((n) => <Row key={n.id} n={n} />)}</ul>
            </>
          )}
        </>
      ) : (
      <>
      {list.length === 0 && <p className="px-[10px] py-[14px] text-[13px]" style={{ color: "var(--muted-foreground)" }}>Nothing here yet.</p>}
      {fresh.length > 0 && (
        <>
          <span className="block px-[10px] pb-[4px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>New</span>
          <ul className="flex flex-col">{fresh.map((n) => <Row key={n.id} n={n} />)}</ul>
        </>
      )}
      {earlier.length > 0 && (
        <>
          <span className="block px-[10px] pt-[8px] pb-[4px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Earlier</span>
          <ul className="flex flex-col">{earlier.map((n) => <Row key={n.id} n={n} />)}</ul>
        </>
      )}
      </>
      )}
    </>
  );
  const surface = { background: "color-mix(in srgb, var(--background) 95%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 20px 48px -20px rgba(0,0,0,0.7)" } as const;
  if (phone) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[90] flex items-end" role="dialog" aria-modal="true" aria-label="Notifications">
          <button type="button" aria-label="Close notifications" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.55)" }} />
          <div className="relative z-[1] max-h-[80dvh] w-full overflow-y-auto rounded-t-[var(--radius-xl)] border p-[var(--space-3)] pb-[calc(var(--space-4)+env(safe-area-inset-bottom))]" style={surface}>{body}</div>
        </div>
      </Portal>
    );
  }
  return (
    <>
      <button type="button" aria-label="Close notifications" onClick={onClose} className="fixed inset-0 z-40 cursor-default" />
      <div role="dialog" aria-label="Notifications" className={`filters-reveal absolute z-50 mt-2 w-[380px] max-w-[calc(100vw-24px)] rounded-[var(--radius-lg)] border p-[var(--space-2)] backdrop-blur-[18px] ${align === "left" ? "left-0" : "right-0"}`} style={surface}>
        <div className="max-h-[min(70vh,560px)] overflow-y-auto">{body}</div>
      </div>
    </>
  );
}

/** The phone and tablet header's right-hand cluster: XP, Messages
 *  (mentorship only), Notifications, then the hamburger the page renders. */
export function HeaderActions({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-[6px] sm:gap-[10px]">
      <DreamScoreChip />
      <NotificationsButton />
      {children}
    </div>
  );
}
