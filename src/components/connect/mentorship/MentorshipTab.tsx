"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { forwardRef, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { BookOpen, Calendar, CalendarPlus, Check, ChevronDown, ClipboardList, Compass, ChevronLeft, ChevronRight, Clock, Download, FileText, Flag, Handshake, Link2, Lock, MapPin, Maximize2, Minimize2, Minus, Play, Plus, School, Send, ShieldCheck, Smile, Sparkles, TrendingDown, TrendingUp, Video, X } from "lucide-react";
import { clearMeetingDecision, openDock, setDock, setMentorshipContext, setProgramContext, setUnreadMessages, useInbox } from "@/lib/inbox";
import { playMessageTone } from "./sound";
import { Portal } from "@/components/profile/CareerReport";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardBottomScrim, cardTopScrim } from "@/components/app/cardChrome";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import { studentAvatarSrc } from "@/lib/avatar";
import { DEFAULT_RESUME_TEMPLATE } from "@/components/resume/data";
import { resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume } from "@/lib/resume";
import { Avatar, CompanyMark, PrimaryCta, QuietCta, SectionHead, SectionSurface, VerifiedBadge } from "../primitives";
import { ProProfileView, SubTabs, type Follows } from "../ProProfile";
import type { Pro } from "../data";
import type { ResumeData } from "@/lib/resume";
import { Meter, Ring, Segmented, ruledCell } from "../viz";
import { BarChart, ShareBar, compact } from "./charts";
import * as D from "./mentorshipData";

// The Mentorship tab in Connect: a tiled list of partner mentorship programs
// (Coach's is the one this student is in), each opening into the program as
// a student, a mentor and the enterprise sees it. Structure follows Joshua's
// Replit (18 Sept 2026); the visuals, charts and every secondary action are
// ours. Coach's language and assets come from the Coach Foundation's own
// pages and press releases (see mentorshipData.ts).

const accent = D.PROGRAM.brand;
const GOOD = "var(--world-food-farming-nature)";
const RULE = "var(--inset-border)";
const INK = "#f6f5fb";
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;
const PANEL = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" } as const;

function Eyebrow({ children, tone = accent, className = "" }: { children: ReactNode; tone?: string; className?: string }) {
  return <span className={`block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase ${className}`} style={{ color: tone }}>{children}</span>;
}
function Muted({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13.5px] leading-[19px] ${className}`} style={{ color: "var(--muted-foreground)" }}>{children}</p>;
}
function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-[17px] leading-[22px] font-extrabold ${className}`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{children}</h3>;
}
function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`} style={PANEL}>{children}</section>;
}
function Item({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[var(--radius-md)] border p-[var(--space-4)] ${className}`} style={ITEM}>{children}</div>;
}
/** The one hover cue every clickable card in this tab shares: a chevron
 *  that fades in and nudges right, the same as the AT&T board's cards. */
function HoverChevron({ className = "top-1/2 right-[14px] -translate-y-1/2" }: { className?: string }) {
  return <ChevronRight aria-hidden className={`pointer-events-none absolute z-20 h-[18px] w-[18px] opacity-0 transition-all duration-150 group-hover:translate-x-[2px] group-hover:opacity-100 ${className}`} style={{ color: "var(--muted-foreground)" }} />;
}
/** A stat's change, as a pill: an arrow that flips with the sign, never
 *  spelled-out words like "vs last year" -- the arrow and color carry it. */
function DeltaBadge({ value }: { value: number }) {
  const up = value >= 0;
  const tone = up ? GOOD : "var(--world-business-money-office)";
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="flex flex-none items-center gap-[3px] rounded-full py-[3px] pr-[8px] pl-[6px] text-[12px] leading-[15px] font-bold tabular-nums" style={{ color: tone, background: `color-mix(in srgb, ${tone} 15%, transparent)` }}>
      <Icon className="h-3 w-3" aria-hidden /> {up ? "+" : ""}{value}%
    </span>
  );
}
/** A panel that opens something: the whole surface is the button, any
 *  control inside keeps working because it sits above the hit layer. */
function ClickPanel({ children, onClick, label, className = "" }: { children: ReactNode; onClick: () => void; label: string; className?: string }) {
  return (
    <section className={`dm-tap group relative rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`} style={PANEL}>
      <button type="button" onClick={onClick} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"><span className="sr-only">{label}</span></button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "rgba(255,255,255,0.03)" }} />
      <HoverChevron />
      {children}
    </section>
  );
}
/** Controls inside a ClickPanel sit above its hit layer. */
const ABOVE = "relative z-20";

function Chip({ children, tone = accent }: { children: ReactNode; tone?: string }) {
  return <span className="inline-flex items-center gap-[5px] rounded-full px-[8px] py-[1px] text-[11px] leading-[15px] font-bold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}>{children}</span>;
}
function DateTile({ month, day }: { month: string; day: number }) {
  return (
    <span aria-label={`${month} ${day}`} className="flex h-[52px] w-[52px] flex-none flex-col items-center justify-center rounded-[var(--radius-sm)] border" style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 10%, var(--glass-surface-1))` }}>
      <span className="text-[10px] leading-none font-extrabold tracking-[0.08em] uppercase" style={{ color: accent }}>{month}</span>
      <span className="mt-[3px] text-[20px] leading-none font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{day}</span>
    </span>
  );
}

/** Same sheet chrome as the AT&T board's opportunity sheet. */
function Sheet({ title, onClose, children, label }: { title: string; onClose: () => void; children: ReactNode; label?: string }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[14px]" style={{ background: "rgba(5,7,15,0.6)" }} />
        <div className="relative z-[1] flex max-h-[calc(100dvh-96px)] w-full max-w-[480px] flex-col gap-[var(--space-4)] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)" }}>
          <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet absolute top-[14px] right-[14px] z-10 flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
          <div className="flex flex-col gap-[6px] pr-[40px]">
            {label && <Eyebrow>{label}</Eyebrow>}
            <h2 className="text-[22px] leading-[27px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
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
      <div role="status" className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] -translate-x-1/2 rounded-full border px-[16px] py-[10px] text-[13.5px] font-semibold whitespace-nowrap motion-safe:animate-[fade-slide-up_0.2s_ease-out_both]" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 18px 40px -20px rgba(0,0,0,0.8)" }}>
        {toast}
      </div>
    </Portal>
  ) : null;
  return [node, setToast];
}

/** Demo-only switch between the three views, behind a Demo chip. */
function DemoViewSwitch({ view, onPick }: { view: D.MentorshipView; onPick: (view: D.MentorshipView) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-w-0 items-center justify-end gap-[10px]">
      <button type="button" aria-expanded={open} aria-controls="mentorship-demo-views" onClick={() => setOpen((v) => !v)} className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
        Demo
      </button>
      {open && (
        <div id="mentorship-demo-views" role="tablist" aria-label="Show this program as" className="flex min-w-0 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none]" style={PANEL}>
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

// ---------------------------------------------------------------------------
// Tab root: the tiled list, then the program

export function MentorshipTab({ role }: { role: "student" | "attendee" | "pro" | "partner" | "admin" }) {
  // the Mentorship tab is on screen: mentorship notifications may show.
  // The cleanup waits a tick so StrictMode's mount, unmount, mount in dev
  // does not flicker the flag (and close the dock) on a real mount.
  const alive = useRef(false);
  useEffect(() => {
    alive.current = true;
    setMentorshipContext(true);
    return () => { alive.current = false; window.setTimeout(() => { if (!alive.current) setMentorshipContext(false); }, 0); };
  }, []);
  // The open program and its sub-tab ride the URL (?program=coach&sub=messages),
  // so a refresh lands where you were and the browser's Back walks the same
  // steps as ours (direct feedback, 18 Sept 2026).
  const router = useRouter();
  const params = useSearchParams();
  const open = params.get("program");
  const setOpen = (next: string | null) => {
    const q = new URLSearchParams(params.toString());
    if (next) q.set("program", next); else { q.delete("program"); q.delete("sub"); }
    router.push(`/connect?${q.toString()}`, { scroll: false });
  };
  const [toast, onToast] = useToast();
  // the nav's Messages icon works from the tiles too: it opens the one
  // program the student is in, with the chat up
  const inbox = useInbox();
  useEffect(() => {
    if (open !== D.PROGRAM.id && inbox.dock !== "closed") setOpen(D.PROGRAM.id);
  }, [inbox.dock, open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (open === D.PROGRAM.id) return <ProgramView role={role} onBack={() => setOpen(null)} />;
  return (
    <section className="flex flex-col gap-[var(--space-4)]" aria-label="Mentorship programs">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <SectionHead>Mentorship programs</SectionHead>
        <span className="flex items-center gap-[6px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}><ShieldCheck className="h-3.5 w-3.5" aria-hidden style={{ color: GOOD }} /> Private, matched, and safeguarded</span>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2">
        {D.PROGRAM_TILES.map((tile, i) => (
          <motion.div key={tile.id} className={tile.state === "yours" ? "sm:col-span-2" : ""} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <ProgramTile tile={tile} onOpen={() => (tile.state === "yours" ? setOpen(tile.id) : onToast(tile.state === "enrolling" ? "Enrollment opens in January. We will let you know." : "This program is not open yet."))} />
          </motion.div>
        ))}
      </div>
      {toast}
    </section>
  );
}

/** The partner's mark at a shared cap height so every tile scales the same:
 *  a real lockup image when the partner has one, otherwise the white
 *  company wordmark. Wordmark heights are tuned so the three read as one
 *  size (EY is a square symbol, JPMorganChase a long word). */
function PartnerLockup({ tile, height }: { tile: D.ProgramTile; height: number }) {
  if (tile.lockup) return <Image src={tile.lockup} alt={`${tile.company} Foundation`} width={1200} height={298} unoptimized className="w-auto" style={{ height }} />;
  const h = tile.company === "EY" ? height : Math.round(height * 0.62);
  return <CompanyMark name={tile.company} ink="#FFFFFF" height={h} />;
}

/** One program on the community card's full-bleed anatomy (photo, top
 *  scrim, progressive blur, the partner's mark), kept visibly distinct: a
 *  mentorship-kind eyebrow, the partner's own lockup where they have one,
 *  and a single frosted status line instead of three stat tiles. */
function ProgramTile({ tile, onOpen }: { tile: D.ProgramTile; onOpen: () => void }) {
  const yours = tile.state === "yours";
  const stateTone = yours ? GOOD : tile.state === "enrolling" ? accent : "rgba(255,255,255,0.7)";
  const stateLabel = yours ? "Your program" : tile.state === "enrolling" ? "Enrolling" : "Coming soon";
  return (
    <button type="button" onClick={onOpen} className={`dm-tap group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] text-left ${yours ? "min-h-[320px] sm:min-h-[340px]" : "min-h-[300px]"}`} style={{ background: "#0e0c20", boxShadow: `inset 0 0 0 1px ${yours ? `color-mix(in srgb, ${accent} 45%, rgba(255,255,255,0.14))` : "rgba(255,255,255,0.14)"}, 0 18px 44px -22px rgba(0,0,0,0.65)`, textShadow: CARD_TEXT_SHADOW }}>
      <span aria-hidden className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <Image src={tile.cover} alt="" fill sizes="(min-width: 640px) 700px, 100vw" className="object-cover" style={{ objectPosition: tile.focus ?? "50% 40%" }} />
      </span>
      <CardProgressiveBlur size="40%" />
      <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.92) 0%, rgba(12,16,35,0.55) 38%, rgba(12,16,35,0.12) 68%, transparent 100%), ${cardTopScrim()}` }} />
      {/* every partner wears its own mark in the same slot at the same cap
         height: the Foundation's lockup for Coach, the company wordmark
         from COMPANY_MARKS for the rest */}
      <span className="absolute top-[18px] right-[20px] z-20 flex h-[36px] items-center" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
        <PartnerLockup tile={tile} height={36} />
      </span>
      <span className="relative z-20 mt-auto flex flex-col gap-[6px] px-[var(--space-5)] pb-[var(--space-4)]" style={{ fontFamily: "var(--font-display)" }}>
        <span className="text-[11px] leading-[15px] font-extrabold tracking-[0.1em] uppercase" style={{ color: `color-mix(in srgb, ${accent} 75%, ${INK})`, fontFamily: "var(--font-body)" }}>{tile.kind} · {tile.company === "Coach" ? "Coach Foundation" : tile.company}</span>
        <span className={`font-extrabold text-balance ${yours ? "text-[28px] leading-[32px]" : "text-[24px] leading-[28px]"}`} style={{ color: INK }}>{tile.title}</span>
        <span className="max-w-[56ch] text-[13.5px] leading-[19px] font-semibold" style={{ color: `color-mix(in srgb, ${INK} 80%, transparent)`, fontFamily: "var(--font-body)" }}>{tile.line}</span>
        <span className="mt-[8px] flex items-center justify-between gap-[10px] rounded-[var(--radius-sm)] px-[12px] py-[8px] text-[12.5px] leading-[17px] font-semibold" style={{ background: "rgba(255,255,255,0.09)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-body)", textShadow: "none" }}>
          {/* one status, nothing else: the counts and cadence live in the banner */}
          <span className="flex items-center gap-[6px] font-bold whitespace-nowrap" style={{ color: stateTone }}>{yours && <span aria-hidden className="size-[6px] rounded-full" style={{ background: GOOD }} />}{!yours && tile.state === "soon" && <Lock className="h-3 w-3" aria-hidden />}{stateLabel}{tile.meta && <span className="font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>· {tile.meta}</span>}</span>
          <span className="flex flex-none items-center gap-[3px] font-bold" style={{ color: "#FFFFFF" }}>{yours ? "Open" : "Details"} <ChevronRight className="h-[14px] w-[14px] transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// The program

function ProgramView({ role, onBack }: { role: "student" | "attendee" | "pro" | "partner" | "admin"; onBack: () => void }) {
  const defaultView: D.MentorshipView = role === "pro" ? "mentor" : role === "partner" || role === "admin" ? "enterprise" : "student";
  const [view, setView] = useState<D.MentorshipView>(defaultView);
  // Tapping an avatar in the thread opens that person's profile; Back
  // returns to the same chat, so the program stays mounted underneath.
  const [profile, setProfile] = useState<"mentor" | "mentee" | null>(null);
  // One thread shared by the student and mentor views, and by the schedule
  // card: accepting a request in the chat is what sets the next meeting.
  const [messages, setMessages] = useState<D.Message[]>(D.THREAD);
  // Unread: the other side's messages since this side last opened Messages.
  const [readCount, setReadCount] = useState<Record<D.MentorshipView, number>>({ student: D.THREAD.length - 1, mentor: D.THREAD.length - 1, enterprise: 0 });
  const unreadFor = (v: D.MentorshipView) => (v === "enterprise" ? 0 : messages.filter((m, i) => i >= readCount[v] && m.from !== (v === "student" ? "mentee" : "mentor")).length);
  const markRead = (v: D.MentorshipView) => setReadCount((r) => (r[v] === messages.length ? r : { ...r, [v]: messages.length }));
  // The chat is a dock, not a tab (direct feedback, 18 Sept 2026: a window
  // that rises from the bottom, minimise, full screen, sounds, nudges). Its
  // state lives in the inbox store so the nav's Messages icon can open it
  // and carry the unread count.
  const inbox = useInbox();
  const dock = view === "enterprise" ? "closed" : inbox.dock;
  const me: "mentee" | "mentor" = view === "mentor" ? "mentor" : "mentee";
  const unread = unreadFor(view);
  const [toast, onToast] = useToast();
  const [nudge, setNudge] = useState<string | null>(null);
  const aliveProgram = useRef(false);
  useEffect(() => {
    aliveProgram.current = true;
    setProgramContext(true);
    return () => { aliveProgram.current = false; window.setTimeout(() => { if (!aliveProgram.current) { setProgramContext(false); setDock("closed"); } }, 0); };
  }, []);
  useEffect(() => { setUnreadMessages(unread); }, [unread]);
  // syncing with the inbox store (an external system), which is what these rules allow
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (dock === "open" || dock === "full") { markRead(view); setNudge(null); } }, [dock, view, messages.length]);
  // a decision taken from a notification lands on the pending request here
  useEffect(() => {
    const decision = inbox.meetingDecision;
    if (!decision) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages((list) => {
      const idx = [...list].reverse().findIndex((m) => m.meeting?.status === "pending");
      if (idx < 0) return list;
      const at = list.length - 1 - idx;
      return list.map((m, i) => (i === at && m.meeting ? { ...m, meeting: { ...m.meeting, status: decision } } : m));
    });
    clearMeetingDecision();
  }, [inbox.meetingDecision]);
  // one incoming message while the demo runs: badge, tone, nudge
  const arrived = useRef(false);
  useEffect(() => {
    if (view === "enterprise" || arrived.current) return;
    const t = window.setTimeout(() => {
      arrived.current = true;
      const from = me === "mentee" ? "mentor" : "mentee";
      setMessages((list) => [...list, { from, text: D.INCOMING[me], when: "Just now" }]);
      playMessageTone();
      if (inbox.dock !== "open" && inbox.dock !== "full") setNudge(D.INCOMING[me]);
    }, 12000);
    return () => window.clearTimeout(t);
  }, [view, me]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!nudge) return;
    const t = window.setTimeout(() => setNudge(null), 8000);
    return () => window.clearTimeout(t);
  }, [nudge]);
  const router = useRouter();
  const params = useSearchParams();
  const sub = params.get("sub") ?? "";
  const setSub = (next: string) => {
    const q = new URLSearchParams(params.toString());
    q.set("sub", next);
    router.replace(`/connect?${q.toString()}`, { scroll: false });
  };
  // `?sub=messages` from an old link or a notification opens the dock
  useEffect(() => { if (sub === "messages") openDock(); }, [sub]);
  const openChat = () => openDock();
  const openProfile = (who: "mentor" | "mentee") => { setProfile(who); if (inbox.dock === "open" || inbox.dock === "full") setDock("min"); };
  const shared = { messages, setMessages, sub, setSub, openChat };
  const [follows, setFollows] = useState<Follows>({});
  // Back from a profile names the section it was opened from: the chat says
  // "Back to Messages", the Year Plan says "Back to Year Plan", the enterprise
  // activity table says "Back to Overview"; a Home tab names the program.
  const backTo =
    view === "enterprise" ? (sub === "countries" ? "Regions" : sub === "settings" ? "Settings" : sub === "details" ? "Details" : "Overview")
    : view === "student" && sub === "plan" ? "Year Plan"
    : view === "mentor" && sub === "journey" ? "Journey"
    : D.PROGRAM.initiative;
  const backLabel = `Back to ${backTo}`;
  return (
    <section className="flex flex-col gap-[var(--space-5)]" aria-label={D.PROGRAM.title}>
      {/* the profile is a layer over the program, which stays mounted (hidden)
         so Back lands on the same tab and the same thread */}
      {profile === "mentor" && <ProProfileView pro={D.MENTOR_PRO as unknown as Pro} follows={follows} onFollow={(id) => setFollows((f) => ({ ...f, [id]: !f[id] }))} onBack={() => setProfile(null)} backLabel={backLabel} />}
      {profile === "mentee" && <MenteeProfile onBack={() => setProfile(null)} backLabel={backLabel} />}
      <div className={profile === "mentor" ? "hidden" : "flex flex-col gap-[var(--space-5)]"}>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Back to programs
        </button>
        <DemoViewSwitch key={view} view={view} onPick={setView} />
      </div>

      {/* Same identity banner as every other board, wearing the Coach
         Foundation's own lockup and press photo. */}
      <section aria-label="Program overview" className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-5)] sm:min-h-[320px] sm:px-[var(--space-8)] sm:py-[var(--space-6)]" style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`, fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}>
        <Image src={D.PROGRAM.cover} alt="" fill sizes="1280px" className="object-cover" style={{ objectPosition: "50% 30%" }} />
        <CardProgressiveBlur size="64%" />
        <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.92) 0%, rgba(12,16,35,0.6) 40%, rgba(12,16,35,0.18) 70%, transparent 100%), ${cardTopScrim()}` }} />
        <Image src={D.PROGRAM.logoWhite} alt="Coach Foundation" width={1200} height={298} unoptimized className="absolute top-[var(--space-5)] right-[var(--space-6)] z-10 h-[34px] w-auto sm:top-[var(--space-6)] sm:right-[var(--space-8)] sm:h-[44px]" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
        <div className="relative z-10 min-w-0 pr-[110px] sm:pr-[150px]">
          <span className="text-[11.5px] leading-[15px] font-extrabold tracking-[0.1em] uppercase" style={{ color: `color-mix(in srgb, ${accent} 70%, ${INK})` }}>{D.PROGRAM.partner} · {D.PROGRAM.initiative}</span>
          <h2 className="mt-[6px] text-[26px] leading-[30px] font-extrabold text-balance sm:text-[34px] sm:leading-[38px]" style={{ color: INK }}>{D.PROGRAM.title}</h2>
          <p className="mt-[8px] max-w-[62ch] text-[14px] leading-[20px] font-semibold" style={{ color: `color-mix(in srgb, ${INK} 82%, transparent)`, fontFamily: "var(--font-body)" }}>{D.PROGRAM.mission}</p>
        </div>
        <div className="relative z-10 mt-[var(--space-4)] flex w-full flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] border-t pt-[10px] text-[13px] leading-[18px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${INK} 18%, transparent)`, color: `color-mix(in srgb, ${INK} 62%, transparent)`, fontFamily: "var(--font-body)" }}>
          <span>{D.PROGRAM.cohort}</span><span>·</span><span>{D.PROGRAM.counts}</span><span>·</span>
          <span className="flex items-center gap-[5px]"><ShieldCheck className="h-3.5 w-3.5" aria-hidden style={{ color: GOOD }} /> {D.PROGRAM.safeguard}</span>
        </div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        {view === "student" && <StudentView {...shared} onOpenProfile={() => openProfile("mentor")} />}
        {view === "mentor" && <MentorView {...shared} onOpenProfile={() => openProfile("mentee")} />}
        {view === "enterprise" && <EnterpriseView sub={sub} setSub={setSub} />}
      </SectionSurface>
      </div>
      {dock !== "closed" && <ChatDock me={me} state={dock} unread={unread} messages={messages} setMessages={setMessages} onToast={onToast} onOpenProfile={() => openProfile(me === "mentee" ? "mentor" : "mentee")} />}
      {nudge && dock !== "open" && dock !== "full" && <IncomingNudge me={me} text={nudge} raised={dock === "min"} onOpen={() => { setNudge(null); openDock(); }} onClose={() => setNudge(null)} />}
      {toast}
    </section>
  );
}

// ---------------------------------------------------------------------------
// The chat dock: rises from the bottom right, minimises to a bar, goes full
// screen, and is the whole screen on a phone.

function ChatDock({ me, state, unread, messages, setMessages, onToast, onOpenProfile }: { me: "mentee" | "mentor"; state: "open" | "min" | "full"; unread: number; messages: D.Message[]; setMessages: React.Dispatch<React.SetStateAction<D.Message[]>>; onToast: (t: string) => void; onOpenProfile: () => void }) {
  const other = me === "mentee" ? { name: D.MENTOR.name, line: `${D.MENTOR.title} · ${D.MENTOR.org}`, photo: D.MENTOR.photo } : { name: D.MENTEE.name, line: D.MENTEE.line, photo: studentAvatarSrc(D.MENTEE.name) };
  useEffect(() => {
    if (state === "min") return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setDock(state === "full" ? "open" : "min"); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [state]);
  const surface = { background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)" } as const;
  const iconBtn = "dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-full";
  if (state === "min") {
    return (
      <Portal>
        <motion.button
          type="button"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setDock("open")}
          aria-label={`Open chat with ${other.name}${unread ? `, ${unread} unread` : ""}`}
          className="fixed right-[16px] bottom-[calc(76px+env(safe-area-inset-bottom))] z-[85] flex w-[280px] cursor-pointer items-center gap-[10px] rounded-t-[16px] border px-[12px] py-[10px] text-left sm:right-[24px] sm:bottom-0"
          style={surface}
        >
          <span className="flex flex-none items-center"><Avatar name={other.name} size={32} photo={other.photo} /></span>
          <span className="flex min-w-0 flex-1 flex-col justify-center gap-[1px]">
            <span className="block truncate text-[14px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{other.name}</span>
            <span className="flex items-center gap-[5px] text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[7px] rounded-full" style={{ background: GOOD }} /> {D.PRESENCE.online}</span>
          </span>
          {unread > 0 && <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-[6px] text-[11px] font-extrabold tabular-nums" style={{ background: accent, color: "#0e0c20" }}>{unread}</span>}
          <Maximize2 className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
        </motion.button>
      </Portal>
    );
  }
  const full = state === "full";
  return (
    <Portal>
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className={full ? "fixed inset-0 z-[85] flex items-center justify-center sm:p-[24px]" : "fixed inset-0 z-[85] sm:inset-auto sm:right-[24px] sm:bottom-0"}
        role="dialog"
        aria-label={`Chat with ${other.name}`}
      >
        <div className={`flex flex-col overflow-hidden border ${full ? "h-full w-full max-w-[960px] sm:h-[min(880px,100%)] sm:rounded-[var(--radius-xl)]" : "h-full w-full sm:h-[min(660px,calc(100dvh-96px))] sm:w-[420px] sm:rounded-t-[var(--radius-xl)] sm:border-b-0"}`} style={surface}>
          <div className="flex items-center justify-between gap-[10px] border-b px-[14px] py-[10px]" style={{ borderColor: RULE }}>
            <button type="button" onClick={onOpenProfile} className="dm-quiet -mx-[6px] -my-[4px] flex min-w-0 cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[6px] py-[4px] text-left" aria-label={`Open ${other.name}'s profile`}>
              <span className="flex flex-none items-center"><Avatar name={other.name} size={36} photo={other.photo} /></span>
              <span className="flex min-w-0 flex-col justify-center gap-[1px]">
                <span className="flex items-center gap-[5px] text-[14.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}><span className="truncate">{other.name}</span> <VerifiedBadge size={13} /></span>
                <span className="flex min-w-0 items-center gap-[5px] text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: GOOD }} /><span className="truncate">{D.PRESENCE.online} · {other.line}</span></span>
              </span>
            </button>
            <span className="flex flex-none items-center gap-[2px]" style={{ color: "var(--muted-foreground)" }}>
              <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer" aria-label="Start a video call" title="Video call" className={iconBtn}><Video className="h-4 w-4" aria-hidden /></a>
              <button type="button" aria-label="Minimise" title="Minimise" onClick={() => setDock("min")} className={`${iconBtn} hidden sm:flex`}><Minus className="h-4 w-4" aria-hidden /></button>
              <button type="button" aria-label={full ? "Exit full screen" : "Full screen"} title={full ? "Exit full screen" : "Full screen"} onClick={() => setDock(full ? "open" : "full")} className={`${iconBtn} hidden sm:flex`}>{full ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}</button>
              <button type="button" aria-label="Close" title="Close" onClick={() => setDock("closed")} className={iconBtn}><X className="h-4 w-4" aria-hidden /></button>
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <Thread embedded me={me} messages={messages} setMessages={setMessages} onToast={onToast} onOpenProfile={onOpenProfile} />
          </div>
        </div>
      </motion.div>
    </Portal>
  );
}

/** A new message while the chat is closed: one small card, the sender and
 *  the first line, tap to open. Goes away on its own. */
function IncomingNudge({ me, text, raised, onOpen, onClose }: { me: "mentee" | "mentor"; text: string; raised: boolean; onOpen: () => void; onClose: () => void }) {
  const other = me === "mentee" ? { name: D.MENTOR.name, photo: D.MENTOR.photo } : { name: D.MENTEE.name, photo: studentAvatarSrc(D.MENTEE.name) };
  return (
    <Portal>
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} role="status" className={`fixed right-[16px] z-[86] w-[min(340px,calc(100vw-32px))] sm:right-[24px] ${raised ? "bottom-[calc(140px+env(safe-area-inset-bottom))] sm:bottom-[72px]" : "bottom-[calc(88px+env(safe-area-inset-bottom))] sm:bottom-[24px]"}`}>
        <div className="flex items-start gap-[10px] rounded-[var(--radius-lg)] border p-[12px]" style={{ background: "color-mix(in srgb, var(--background) 96%, var(--foreground))", borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, boxShadow: "0 24px 60px -24px rgba(0,0,0,0.85)" }}>
          <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 cursor-pointer items-start gap-[10px] text-left">
            <Avatar name={other.name} size={36} photo={other.photo} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{other.name}</span>
              <span className="line-clamp-2 text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{text}</span>
            </span>
          </button>
          <button type="button" aria-label="Dismiss" onClick={onClose} className="dm-quiet flex size-[26px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-3.5 w-3.5" aria-hidden /></button>
        </div>
      </motion.div>
    </Portal>
  );
}

/** Jordan's profile as their mentor sees it: the scholar, what they are
 *  exploring, what she has done in Dreamari. A sheet, so the chat stays. */
function MenteeProfile({ onBack, backLabel }: { onBack: () => void; backLabel: string }) {
  return (
    <Sheet title={D.MENTEE.fullName} label="Dream It Real Scholar" onClose={onBack}>
      <div className="flex items-center gap-[14px]">
        <Avatar name={D.MENTEE.name} size={64} photo={studentAvatarSrc(D.MENTEE.name)} />
        <div className="flex flex-col gap-[2px]">
          <span className="flex items-center gap-[6px] text-[16px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{D.MENTEE.fullName} <VerifiedBadge size={14} /></span>
          <Muted>{D.MENTEE.line} · Baruch College, CUNY</Muted>
        </div>
      </div>
      <div className="flex flex-col gap-[6px]">
        <Eyebrow tone="var(--muted-foreground)">Exploring</Eyebrow>
        <div className="flex flex-wrap gap-[6px]">{D.MENTEE.exploring.map((c) => <Chip key={c}>{c}</Chip>)}</div>
      </div>
      <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
        {D.NEXT_CONVERSATION.prep.map((line) => (
          <li key={line} className="flex items-start gap-[10px] py-[10px] text-[14px] leading-[20px]" style={{ borderColor: RULE, color: "var(--foreground)" }}>
            <Check className="mt-[3px] h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} /> {line}
          </li>
        ))}
      </ul>
      <QuietCta size="sm" className="w-fit" onClick={onBack}><ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}</QuietCta>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces: schedule, thread, plan

/** "Thu, Oct 30 · 5:00 PM" -> the pieces the card shows. */
function parseWhen(when: string): { weekday: string; month: string; day: number; time: string } {
  const m = when.match(/^(\w+), (\w+) (\d+) · (.+)$/);
  return m ? { weekday: m[1], month: m[2], day: Number(m[3]), time: m[4] } : { weekday: D.MEETING.date.weekday, month: D.MEETING.date.month, day: D.MEETING.date.day, time: D.MEETING.time };
}
const WEEKDAYS: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
/** A real Date for "Oct" 28 "4:00 PM", defaulting to the current year --
 *  demo data carries no year. Null when the pieces don't parse. */
function meetingDateTime(month: string, day: number, time: string): Date | null {
  const mi = MONTHS[month.slice(0, 3)];
  const t = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (mi === undefined || !t) return null;
  let hour = Number(t[1]) % 12;
  if (/pm/i.test(t[3])) hour += 12;
  return new Date(new Date().getFullYear(), mi, day, hour, Number(t[2]));
}
/** Join only makes sense once the meeting has actually started -- shown
 *  from 10 minutes before through 60 minutes after (direct feedback, 19
 *  Sept 2026: "it can only appear when the meeting is active"), never as a
 *  standing button for something weeks away. */
function meetingIsLive(month: string, day: number, time: string): boolean {
  const start = meetingDateTime(month, day, time);
  if (!start) return false;
  const diff = Date.now() - start.getTime();
  return diff >= -10 * 60_000 && diff <= 60 * 60_000;
}

/** The next meeting is whatever the thread says it is: the latest accepted
 *  request wins, a pending one shows as waiting, and Reschedule here posts a
 *  request into the chat instead of changing the card on its own. */
function ScheduleCard({ me, messages, onRequest, onToast, showMeter }: { me: "mentee" | "mentor"; messages: D.Message[]; onRequest: (m: D.MeetingRequest) => void; onToast: (t: string) => void; showMeter?: boolean }) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const requests = messages.filter((m) => m.meeting);
  const accepted = [...requests].reverse().find((m) => m.meeting?.status === "accepted")?.meeting;
  const pending = [...requests].reverse().find((m) => m.meeting?.status === "pending");
  const request = accepted ?? requests[0]?.meeting;
  const at = parseWhen(accepted?.when ?? `${D.MEETING.date.weekday.slice(0, 3)}, ${D.MEETING.date.month} ${D.MEETING.date.day} · ${D.MEETING.time}`);
  const when = `${WEEKDAYS[at.weekday] ?? at.weekday} · ${at.time}`;
  return (
    <ClickPanel onClick={() => setDetails(true)} label="Meeting details">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)] pr-[28px]">
        <div className="flex items-center gap-[14px]">
          <DateTile month={at.month} day={at.day} />
          <div className="flex min-w-0 flex-col gap-[2px]">
            <Eyebrow>{accepted ? "Next meeting · accepted" : "Next meeting"}</Eyebrow>
            <span className="text-[16px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{when}</span>
            <Muted className="flex items-center gap-[5px]"><Video className="h-3.5 w-3.5" aria-hidden /> {D.MEETING.where}{pending && pending.from === me ? " · new time requested, waiting" : pending ? " · new time proposed in Messages" : ""}</Muted>
          </div>
        </div>
        <div className={`${ABOVE} flex flex-wrap items-center gap-[8px]`}>
          {/* Always present -- disabled and muted until the meeting is
             actually live, rather than a standing active button for
             something weeks out or the row's shape shifting by state
             (direct feedback, 19 Sept 2026). The beam only runs once it's
             the one real thing to do next. */}
          {(() => {
            const live = meetingIsLive(at.month, at.day, at.time);
            const join = (
              <a
                href={live ? "https://teams.microsoft.com" : undefined}
                target={live ? "_blank" : undefined}
                rel={live ? "noreferrer" : undefined}
                aria-disabled={!live}
                title={live ? undefined : "Join opens once the meeting starts"}
                className="dm-solid relative flex min-h-[32px] items-center justify-center gap-[6px] whitespace-nowrap rounded-[var(--radius-sm)] px-[14px] text-[13px] leading-[18px] font-semibold"
                style={live ? { background: "var(--primary)", color: "#FFFFFF", cursor: "pointer" } : { background: "var(--glass-surface-2)", color: "var(--muted-foreground)", cursor: "default", pointerEvents: "none" }}
              >
                <Video className="h-4 w-4" aria-hidden /> Join
              </a>
            );
            return live ? (
              <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={3.2} strength={0.7} active>{join}</BorderBeam>
            ) : join;
          })()}
          <QuietCta size="sm" onClick={() => setOpen(true)}>Reschedule</QuietCta>
        </div>
      </div>
      {showMeter && (
        <div className="mt-[var(--space-4)] flex items-center justify-between gap-[10px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
          <Muted>Required meetings this year</Muted>
          <Meter value={D.MEETING.completed} max={D.MEETING.required} accent={GOOD} label="completed" />
        </div>
      )}
      {details && (
        <Sheet title={request?.title ?? "Next meeting"} label="Next meeting" onClose={() => setDetails(false)}>
          {request && <Muted>{request.agenda}</Muted>}
          <div className="flex flex-col gap-[2px] border-t pt-[var(--space-3)] text-[14px] leading-[20px] font-semibold" style={{ borderColor: RULE, color: "var(--foreground)" }}>
            <span className="flex items-center gap-[6px]"><Clock className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {WEEKDAYS[at.weekday] ?? at.weekday}, {at.month} {at.day} · {at.time}</span>
            <span className="flex items-center gap-[6px]"><Video className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {D.MEETING.where}</span>
            <span className="flex items-center gap-[6px]"><Handshake className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /> Meeting {D.MEETING.completed + 1} of {D.MEETING.required} required this year</span>
          </div>
          <Item className="flex flex-col gap-[4px]">
            <Eyebrow tone="var(--muted-foreground)">Bring</Eyebrow>
            <span className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>Your Fashion Buyer resume draft and one question from the Day in the Life simulation.</span>
          </Item>
          <div className="flex flex-wrap gap-[8px]">
            <a
              href={meetingIsLive(at.month, at.day, at.time) ? "https://teams.microsoft.com" : undefined}
              target={meetingIsLive(at.month, at.day, at.time) ? "_blank" : undefined}
              rel={meetingIsLive(at.month, at.day, at.time) ? "noreferrer" : undefined}
              aria-disabled={!meetingIsLive(at.month, at.day, at.time)}
              title={meetingIsLive(at.month, at.day, at.time) ? undefined : "Join opens once the meeting starts"}
              className="dm-solid flex min-h-[32px] items-center justify-center gap-[6px] whitespace-nowrap rounded-[var(--radius-sm)] px-[14px] text-[13px] leading-[18px] font-semibold"
              style={meetingIsLive(at.month, at.day, at.time) ? { background: "var(--primary)", color: "#FFFFFF", cursor: "pointer" } : { background: "var(--glass-surface-2)", color: "var(--muted-foreground)", cursor: "default", pointerEvents: "none" }}
            ><Video className="h-4 w-4" aria-hidden /> Join</a>
            {request && <QuietCta size="sm" onClick={() => { downloadIcs(request); onToast("Added to your calendar."); }}><CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar</QuietCta>}
            <QuietCta size="sm" onClick={() => { setDetails(false); setOpen(true); }}>Reschedule</QuietCta>
          </div>
        </Sheet>
      )}
      {open && (
        <Sheet title="Pick a new time" label="Reschedule" onClose={() => setOpen(false)}>
          <Muted>Both calendars are free at these times.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.MEETING.reschedule.map((s) => (
              <button key={s} type="button" onClick={() => { setOpen(false); onRequest({ title: request?.title ?? "Next meeting", agenda: request?.agenda ?? "Open conversation.", when: s, where: D.MEETING.where, status: "pending" }); onToast("New time requested in Messages."); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] py-[12px] text-left text-[14.5px] font-semibold" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                <span className="flex items-center gap-[8px]"><Clock className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {s}</span>
                <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </ClickPanel>
  );
}

/** Add-to-calendar as a real .ics download, no service needed. */
function downloadIcs(m: D.MeetingRequest) {
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dreamari//Mentorship//EN", "BEGIN:VEVENT", `SUMMARY:${m.title}`, `DESCRIPTION:${m.agenda.replace(/,/g, "\\,")}`, `LOCATION:${m.where}`, "DTSTART:20261028T200000Z", "DTEND:20261028T204500Z", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${m.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A meeting request inside the thread: named, with an agenda, a time and
 *  a place. The receiver accepts or declines here; either side can add it
 *  to their calendar once it is accepted. */
function MeetingCard({ m, mine, onDecide, onToast }: { m: D.MeetingRequest; mine: boolean; onDecide: (status: "accepted" | "declined") => void; onToast: (t: string) => void }) {
  const tone = m.status === "accepted" ? GOOD : m.status === "declined" ? "var(--muted-foreground)" : accent;
  return (
    <div className="flex w-[300px] max-w-full flex-col gap-[10px] rounded-[18px] border p-[14px]" style={{ background: "var(--glass-surface-2)", borderColor: `color-mix(in srgb, ${tone} 45%, var(--glass-border))`, boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" }}>
      <div className="flex items-start justify-between gap-[8px]">
        <span className="flex items-center gap-[6px] text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone }}><Calendar className="h-3.5 w-3.5" aria-hidden /> Meeting request</span>
        <Chip tone={tone}>{m.status === "pending" ? (mine ? "Waiting" : "New") : m.status === "accepted" ? "Accepted" : "Declined"}</Chip>
      </div>
      <div className="flex flex-col gap-[2px]">
        <span className="text-[15.5px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.title}</span>
        <span className="text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{m.agenda}</span>
      </div>
      <div className="flex flex-col gap-[2px] border-t pt-[8px] text-[13px] leading-[18px] font-semibold" style={{ borderColor: RULE, color: "var(--foreground)" }}>
        <span className="flex items-center gap-[6px]"><Clock className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {m.when}</span>
        <span className="flex items-center gap-[6px]"><Video className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {m.where}</span>
      </div>
      {m.status === "pending" && !mine && (
        <div className="flex gap-[8px]">
          <PrimaryCta size="sm" className="flex-1" onClick={() => onDecide("accepted")}><Check className="h-4 w-4" aria-hidden /> Accept</PrimaryCta>
          <QuietCta size="sm" className="flex-1" onClick={() => onDecide("declined")}>Decline</QuietCta>
        </div>
      )}
      {m.status === "accepted" && (
        <QuietCta size="sm" className="w-full" onClick={() => { downloadIcs(m); onToast("Added to your calendar."); }}><CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar</QuietCta>
      )}
    </div>
  );
}

const SHARE_ICON: Record<D.ShareKind, typeof FileText> = { plan: ClipboardList, resume: FileText, careers: Compass, sim: Play, report: BookOpen, schools: School, opportunity: Handshake };

/** An app feature shared into the chat: what it is, one line, a few facts,
 *  and Open into the real page. Same card either side sends it. */
function ShareCard({ share, mine }: { share: D.Share; mine: boolean }) {
  const Icon = SHARE_ICON[share.kind];
  return (
    <Link href={share.href} className="dm-tap group flex w-[300px] max-w-full flex-col gap-[10px] rounded-[18px] border p-[14px] text-left" style={{ background: mine ? `color-mix(in srgb, var(--primary) 18%, var(--glass-surface-2))` : "var(--glass-surface-2)", borderColor: mine ? "color-mix(in srgb, var(--primary) 45%, var(--glass-border))" : "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" }}>
      <span className="flex items-start gap-[10px]">
        <span className="flex size-[36px] flex-none items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Shared from Dreamari</span>
          <span className="text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{share.title}</span>
          <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{share.line}</span>
        </span>
      </span>
      <span className="flex flex-wrap gap-[6px]">
        {share.meta.map((m) => <span key={m} className="rounded-full px-[8px] py-[2px] text-[11.5px] leading-[15px] font-semibold" style={{ background: "rgba(255,255,255,0.08)", color: "var(--foreground)" }}>{m}</span>)}
      </span>
      <span className="flex items-center gap-[4px] text-[13px] font-bold" style={{ color: accent }}>Open <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
    </Link>
  );
}

function ShareSheet({ onClose, onPick }: { onClose: () => void; onPick: (share: D.Share) => void }) {
  return (
    <Sheet title="Share from Dreamari" label="Into this chat" onClose={onClose}>
      <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
        {D.SHAREABLES.map((sh) => {
          const Icon = SHARE_ICON[sh.kind];
          return (
            <button key={sh.title} type="button" onClick={() => { onPick(sh); onClose(); }} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] py-[11px] text-left" style={{ borderColor: RULE }}>
              <span className="flex size-[34px] flex-none items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}><Icon className="h-4 w-4" aria-hidden /></span>
              <span className="flex min-w-0 flex-1 flex-col"><span className="text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{sh.title}</span><Muted className="truncate text-[12px] leading-[16px]">{sh.line}</Muted></span>
              <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/** The private thread. Consecutive messages from one person group under one
 *  avatar and one timestamp, the way Instagram and TikTok DMs read; mine sit
 *  right with no avatar. One rotating nudge above the composer, never a
 *  permanent row of them. Attachments, GIFs and the mentorship actions live
 *  in the plus menu; emoji behind the smile; suggested questions behind the
 *  sparkle. Meeting requests are cards in the thread itself. */
function Thread({ me, messages, setMessages, onToast, onOpenProfile, embedded = false }: { me: "mentee" | "mentor"; messages: D.Message[]; setMessages: React.Dispatch<React.SetStateAction<D.Message[]>>; onToast: (t: string) => void; onOpenProfile: () => void; /** inside the chat dock: no header of its own, the list scrolls, the composer stays put */ embedded?: boolean }) {
  const [draft, setDraft] = useState("");
  const [menu, setMenu] = useState<"none" | "plus" | "emoji">("none");
  const [sent, setSent] = useState(0);
  const [nudgeGone, setNudgeGone] = useState(false);
  const [sheet, setSheet] = useState<"none" | "escalate" | "resource" | "meeting" | "share">("none");
  const endRef = useRef<HTMLDivElement>(null);
  const other = me === "mentee" ? { name: D.MENTOR.name, line: `${D.MENTOR.title} · ${D.MENTOR.org}`, photo: D.MENTOR.photo } : { name: D.MENTEE.name, line: D.MENTEE.line, photo: studentAvatarSrc(D.MENTEE.name) };
  // in the dock, open on the latest message and follow new ones
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!embedded) return;
    const toEnd = () => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; };
    toEnd();
    const raf = requestAnimationFrame(toEnd);
    const t = window.setTimeout(toEnd, 320); // after the dock's rise
    return () => { cancelAnimationFrame(raf); window.clearTimeout(t); };
  }, [embedded, messages.length]);
  const actions = D.COMPOSER_ACTIONS.filter((a) => a.who === "both" || a.who === me);
  const nudge = D.NUDGES[me][Math.min(sent, D.NUDGES[me].length - 1)];
  const push = (m: D.Message) => {
    setMessages((list) => [...list, m]);
    setDraft("");
    setMenu("none");
    setSent((n) => n + 1);
    setNudgeGone(false);
    window.setTimeout(() => endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
  };
  const send = (text: string) => { if (text.trim()) push({ from: me, text: text.trim(), when: "Just now" }); };
  const decide = (index: number, status: "accepted" | "declined") => {
    setMessages((list) => list.map((m, i) => (i === index && m.meeting ? { ...m, meeting: { ...m.meeting, status } } : m)));
    onToast(status === "accepted" ? "Meeting accepted. Your Next meeting card is updated." : "Declined. Suggest another time when you are ready.");
  };
  const groups: { from: D.Message["from"]; items: { m: D.Message; index: number }[] }[] = [];
  messages.forEach((m, index) => {
    const last = groups[groups.length - 1];
    if (last && last.from === m.from) last.items.push({ m, index });
    else groups.push({ from: m.from, items: [{ m, index }] });
  });
  const act = (key: string) => {
    setMenu("none");
    if (key === "link") { send("Here is our meeting link for Tuesday: teams.microsoft.com/l/meetup-join/coach-dreamer"); onToast("Meeting link sent."); }
    else if (key === "time") setSheet("meeting");
    else if (key === "resource") setSheet("resource");
    else if (key === "share") setSheet("share");
    else if (key === "gif") onToast("GIFs are on the way. Emoji work today.");
  };
  const ActionIcon = ({ k }: { k: string }) => k === "share" ? <Sparkles className="h-4 w-4" aria-hidden /> : k === "gif" ? <span className="text-[10px] font-extrabold tracking-[0.04em]">GIF</span> : k === "link" ? <Link2 className="h-4 w-4" aria-hidden /> : k === "time" ? <Calendar className="h-4 w-4" aria-hidden /> : <FileText className="h-4 w-4" aria-hidden />;
  const menuClass = "absolute bottom-[calc(100%+8px)] left-0 z-20 overflow-hidden rounded-[var(--radius-md)] border motion-safe:animate-[fade-slide-up_0.16s_ease-out_both]";
  const menuStyle = { background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.8)" } as const;
  return (
    <section className={embedded ? "flex h-full min-h-0 flex-col" : "flex flex-col rounded-[var(--radius-lg)] border"} style={embedded ? undefined : { background: "color-mix(in srgb, var(--background) 72%, var(--glass-surface-2))", borderColor: "var(--glass-border)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px -32px rgba(0,0,0,0.8)" }}>
      {!embedded && <div className="flex items-center justify-between gap-[10px] border-b px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: RULE }}>
        <button type="button" onClick={onOpenProfile} className="dm-quiet -mx-[8px] -my-[4px] flex cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] px-[8px] py-[4px] text-left" aria-label={`Open ${other.name}'s profile`}>
          <Avatar name={other.name} size={40} photo={other.photo} />
          <span className="flex flex-col">
            <span className="flex items-center gap-[5px] text-[15.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{other.name} <VerifiedBadge size={14} /></span>
            <Muted className="text-[12.5px] leading-[16px]">{other.line}</Muted>
          </span>
        </button>
        <div className="flex items-center gap-[10px]">
          <Chip tone={GOOD}><span aria-hidden className="size-[6px] rounded-full" style={{ background: GOOD }} />Matched</Chip>
          <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer" aria-label="Start a video call" className="dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Video className="h-4 w-4" aria-hidden /></a>
        </div>
      </div>}

      <div ref={listRef} className={embedded ? "flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-[var(--space-4)] py-[var(--space-4)]" : "flex min-h-[320px] flex-col justify-end gap-[22px] px-[var(--space-5)] py-[var(--space-5)] sm:min-h-[380px]"}>
        {/* the safety line sits at the start of the conversation and scrolls
           away with it, the way messaging apps note encryption (direct
           feedback, 18 Sept 2026) */}
        {embedded && (
          <p className="flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[2px] px-[12px] text-center text-[11.5px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>
            <ShieldCheck className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: GOOD }} /> {D.THREAD_FOOT} ·
            <button type="button" onClick={() => setSheet("escalate")} className="dm-link cursor-pointer font-bold" style={{ color: "var(--muted-foreground)" }}>Report</button>
          </p>
        )}
        {groups.map((g, gi) => {
          const mine = g.from === me;
          return (
            <div key={gi} className={`flex items-end gap-[10px] ${mine ? "justify-end" : "justify-start"}`}>
              {!mine && <button type="button" onClick={onOpenProfile} aria-label={`Open ${other.name}'s profile`} className="dm-quiet mb-[22px] flex-none cursor-pointer rounded-full"><Avatar name={other.name} size={30} photo={other.photo} /></button>}
              <div className={`flex max-w-[78%] flex-col gap-[6px] ${mine ? "items-end" : "items-start"}`}>
                {g.items.map(({ m, index }, i) => {
                  const first = i === 0;
                  const last = i === g.items.length - 1;
                  const radius = mine ? `${first ? 18 : 6}px 18px ${last ? 6 : 6}px 18px` : `18px ${first ? 18 : 6}px 18px ${last ? 6 : 6}px`;
                  if (m.meeting) return <MeetingCard key={index} m={m.meeting} mine={mine} onDecide={(status) => decide(index, status)} onToast={onToast} />;
                  if (m.share) return <ShareCard key={index} share={m.share} mine={mine} />;
                  return (
                    <motion.div key={index} initial={m.when === "Just now" ? { opacity: 0, y: 6, scale: 0.98 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="px-[16px] py-[10px] text-[15.5px] leading-[22px]" style={mine ? { background: "var(--primary)", color: "#FFFFFF", borderRadius: radius } : { background: "var(--glass-surface-2)", color: "var(--foreground)", border: "1px solid var(--glass-border)", borderRadius: radius }}>
                      {m.text}
                    </motion.div>
                  );
                })}
                <span className="px-[4px] pt-[2px] text-[11px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{g.items[g.items.length - 1].m.when}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className={`flex flex-none flex-col gap-[10px] border-t py-[var(--space-4)] ${embedded ? "px-[var(--space-4)]" : "px-[var(--space-5)]"}`} style={{ borderColor: RULE }}>
        {/* one nudge, dismissable, rotates as the conversation moves */}
        {!nudgeGone && nudge && (
          <div className="flex items-center gap-[6px] motion-safe:animate-[fade-slide-up_0.18s_ease-out_both]">
            <button type="button" onClick={() => setDraft(nudge)} className="dm-quiet flex min-w-0 cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[6px] text-left text-[12.5px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "transparent", color: "var(--muted-foreground)" }}>
              <Sparkles className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} /> <span className="truncate">{nudge}</span>
            </button>
            <button type="button" aria-label="Dismiss suggestion" onClick={() => setNudgeGone(true)} className="dm-quiet flex size-[26px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-3.5 w-3.5" aria-hidden /></button>
          </div>
        )}
        <form className="relative flex items-center gap-[8px]" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
          <div className="relative flex-none">
            <button type="button" aria-label="Add" aria-expanded={menu === "plus"} onClick={() => setMenu(menu === "plus" ? "none" : "plus")} className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: menu === "plus" ? "var(--glass-surface-2)" : "transparent" }}>
              <Plus className="h-[18px] w-[18px] transition-transform" style={{ transform: menu === "plus" ? "rotate(45deg)" : "none" }} aria-hidden />
            </button>
            {menu === "plus" && (
              <div role="menu" className={`${menuClass} flex min-w-[240px] flex-col`} style={menuStyle}>
                {[...actions, { key: "gif", label: "GIF", who: "both" as const }].map((a) => (
                  <button key={a.key} type="button" role="menuitem" onClick={() => act(a.key)} className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] px-[14px] py-[10px] text-left text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                    <span className="flex w-[18px] justify-center" style={{ color: "var(--muted-foreground)" }}><ActionIcon k={a.key} /></span> {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex min-w-0 flex-1 items-center">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={me === "mentee" ? "Message Avery" : `Message ${D.MENTEE.name}`} aria-label="Message" className="min-w-0 flex-1 rounded-full border py-[10px] pr-[44px] pl-[16px] text-[15px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:border-[color:var(--primary)]" style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
            <button type="button" aria-label="Emoji" aria-expanded={menu === "emoji"} onClick={() => setMenu(menu === "emoji" ? "none" : "emoji")} className="dm-quiet absolute right-[6px] flex size-[30px] cursor-pointer items-center justify-center rounded-full" style={{ color: menu === "emoji" ? accent : "var(--muted-foreground)" }}>
              <Smile className="h-[18px] w-[18px]" aria-hidden />
            </button>
            {menu === "emoji" && (
              <div role="menu" className={`${menuClass} right-0 left-auto grid grid-cols-8 gap-[2px] p-[8px]`} style={menuStyle}>
                {D.EMOJI.map((e) => (
                  <button key={e} type="button" role="menuitem" onClick={() => { setDraft((d) => `${d}${d && !d.endsWith(" ") ? " " : ""}${e}`); setMenu("none"); }} className="dm-quiet flex size-[34px] cursor-pointer items-center justify-center rounded-[8px] text-[20px]">{e}</button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" aria-label="Send" disabled={!draft.trim()} className="dm-solid flex size-[40px] flex-none cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-40" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
            <Send className="h-[16px] w-[16px]" aria-hidden />
          </button>
        </form>
        {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-[8px]">
          <Muted className="flex items-center gap-[5px] text-[12px] leading-[16px]"><ShieldCheck className="h-3.5 w-3.5" aria-hidden style={{ color: GOOD }} /> {D.THREAD_FOOT}</Muted>
          <button type="button" onClick={() => setSheet("escalate")} className="dm-link flex cursor-pointer items-center gap-[4px] text-[12px] leading-[16px] font-bold" style={{ color: "var(--muted-foreground)" }}><Flag className="h-3.5 w-3.5" aria-hidden /> Report</button>
        </div>
        )}
      </div>

      {sheet === "escalate" && (
        <Sheet title="What happened?" label="Report" onClose={() => setSheet("none")}>
          <Muted>Dreamari moderators and the Coach Foundation program lead see this. The other person is not told who reported.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.ESCALATE_REASONS.map((r) => (
              <button key={r} type="button" onClick={() => { setSheet("none"); onToast("Sent to moderators."); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between py-[12px] text-left text-[14.5px] font-semibold" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                {r} <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet === "resource" && (
        <Sheet title="Share an approved resource" label="Approved by Coach Foundation" onClose={() => setSheet("none")}>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.APPROVED_RESOURCES.map((r) => (
              <button key={r.title} type="button" onClick={() => { setSheet("none"); send(`Have a look at this before we meet: ${r.title} (${r.kind})`); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] py-[12px] text-left" style={{ borderColor: RULE }}>
                <span className="flex flex-col gap-[2px]"><span className="text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{r.title}</span><Muted className="text-[12px] leading-[16px]">{r.kind} · {r.min}</Muted></span>
                <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet === "share" && <ShareSheet onClose={() => setSheet("none")} onPick={(sh) => push({ from: me, text: "", when: "Just now", share: sh })} />}
      {sheet === "meeting" && <MeetingRequestSheet onClose={() => setSheet("none")} onSend={(m) => { push({ from: me, text: "", when: "Just now", meeting: m }); onToast("Meeting request sent."); }} />}
    </section>
  );
}

/** Name it, note the agenda, pick a slot: the request lands in the thread
 *  as a card the other person can accept. */
function MeetingRequestSheet({ onClose, onSend }: { onClose: () => void; onSend: (m: D.MeetingRequest) => void }) {
  const [title, setTitle] = useState("Career check-in");
  const [agenda, setAgenda] = useState("");
  const [slot, setSlot] = useState<string>(D.MEETING.reschedule[0]);
  const field = "w-full rounded-[var(--radius-md)] border px-[14px] py-[10px] text-[14.5px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:border-[color:var(--primary)]";
  const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return (
    <Sheet title="Request a meeting" label="In this chat" onClose={onClose}>
      <label className="flex flex-col gap-[6px]">
        <Eyebrow tone="var(--muted-foreground)">Name</Eyebrow>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} style={fieldStyle} />
      </label>
      <label className="flex flex-col gap-[6px]">
        <Eyebrow tone="var(--muted-foreground)">Agenda</Eyebrow>
        <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} rows={2} placeholder="What you want to cover" className={`${field} resize-none`} style={fieldStyle} />
      </label>
      <div className="flex flex-col gap-[6px]">
        <Eyebrow tone="var(--muted-foreground)">Time · Microsoft Teams</Eyebrow>
        <div role="radiogroup" className="flex flex-wrap gap-[6px]">
          {D.MEETING.reschedule.map((s) => {
            const on = s === slot;
            return <button key={s} type="button" role="radio" aria-checked={on} onClick={() => setSlot(s)} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[6px] text-[12.5px] leading-[16px] font-semibold" style={on ? { borderColor: `color-mix(in srgb, ${accent} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: "var(--foreground)" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>{s}</button>;
          })}
        </div>
      </div>
      <PrimaryCta onClick={() => { onSend({ title: title.trim() || "Meeting", agenda: agenda.trim() || "Open conversation.", when: slot, where: D.MEETING.where, status: "pending" }); onClose(); }}><Send className="h-4 w-4" aria-hidden /> Send request</PrimaryCta>
    </Sheet>
  );
}

function YearPlan({ eyebrow, title }: { eyebrow: string; title: string }) {
  // A calendar (Joshua Pierce, Slack, 18 Sept 2026): one page per program
  // month, the month large, the topic small. Tapping a month expands that
  // page to fill the panel; Back returns to the calendar (direct feedback:
  // the detail card under the grid "isn't really intuitive").
  const [open, setOpen] = useState<string | null>(null);
  const months = D.YEAR_PLAN;
  const done = months.filter((m) => m.state === "complete").length;
  const idx = months.findIndex((m) => m.key === open);
  const sel = idx >= 0 ? months[idx] : null;
  const toneOf = (state: D.Month["state"]) => (state === "complete" ? GOOD : state === "current" ? accent : "var(--muted-foreground)");
  const yearOf = (i: number) => (i < 3 ? "2026" : "2027");
  const stateLabel = (state: D.Month["state"]) => (state === "complete" ? "Complete" : state === "current" ? "This month" : "Upcoming");
  return (
    <Panel className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
        <div className="flex flex-col gap-[2px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Title className="text-[20px] leading-[25px]">{title}</Title>
        </div>
        <Meter value={done} max={months.length} accent={GOOD} label="months" />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {sel ? (
          <motion.div key={`page-${sel.key}`} layoutId={`ym-${sel.key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: sel.state === "current" ? `color-mix(in srgb, ${accent} 12%, var(--glass-surface-2))` : "var(--glass-surface-2)", borderColor: `color-mix(in srgb, ${toneOf(sel.state)} 45%, var(--glass-border))` }}>
            <span aria-hidden className="absolute inset-x-0 top-0 h-[4px]" style={{ background: toneOf(sel.state) }} />
            <div className="flex flex-col gap-[var(--space-4)] p-[var(--space-5)] pt-[calc(var(--space-5)+4px)]">
              <div className="flex flex-wrap items-center justify-between gap-[8px]">
                <button type="button" onClick={() => setOpen(null)} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[4px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> Calendar</button>
                <Chip tone={toneOf(sel.state)}>{stateLabel(sel.state)}</Chip>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[12px] leading-[16px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>{yearOf(idx)}</span>
                <span className="text-[34px] leading-[38px] font-extrabold tracking-[0.01em] uppercase" style={{ fontFamily: "var(--font-display)", color: toneOf(sel.state) === "var(--muted-foreground)" ? "var(--foreground)" : toneOf(sel.state) }}>{sel.month}</span>
                <span className="text-[18px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{sel.title}</span>
              </div>
              <div className="flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
                <Eyebrow tone="var(--muted-foreground)">Focus</Eyebrow>
                <span className="text-[15.5px] leading-[22px]" style={{ color: "var(--foreground)" }}>{sel.focus}</span>
                {sel.note && <Muted>{sel.note}</Muted>}
                {sel.state === "current" && (
                  <Link href="/explore?tab=browse" className="dm-link mt-[4px] flex w-fit items-center gap-[4px] text-[13px] font-bold" style={{ color: accent }}>View Careers <ChevronRight className="h-3.5 w-3.5" aria-hidden /></Link>
                )}
              </div>
              <div className="flex items-center justify-between gap-[8px] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
                <button type="button" disabled={idx === 0} onClick={() => setOpen(months[idx - 1].key)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center gap-[4px] rounded-[var(--radius-sm)] px-[6px] text-[12.5px] font-bold disabled:cursor-default disabled:opacity-40" style={{ color: "var(--muted-foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> {idx > 0 ? months[idx - 1].month : ""}</button>
                <button type="button" disabled={idx === months.length - 1} onClick={() => setOpen(months[idx + 1].key)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center gap-[4px] rounded-[var(--radius-sm)] px-[6px] text-[12.5px] font-bold disabled:cursor-default disabled:opacity-40" style={{ color: "var(--muted-foreground)" }}>{idx < months.length - 1 ? months[idx + 1].month : ""} <ChevronRight className="h-4 w-4" aria-hidden /></button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="grid" role="list" aria-label="Program months" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-2 gap-[10px] sm:grid-cols-4">
            {months.map((m, i) => {
              const tone = toneOf(m.state);
              const current = m.state === "current";
              return (
                <motion.button
                  key={m.key}
                  layoutId={`ym-${m.key}`}
                  type="button"
                  role="listitem"
                  aria-label={`${m.month}: ${m.title}, ${stateLabel(m.state)}`}
                  onClick={() => setOpen(m.key)}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className="dm-quiet relative flex min-h-[112px] cursor-pointer flex-col overflow-hidden rounded-[var(--radius-md)] border text-left"
                  style={{
                    background: current ? `color-mix(in srgb, ${accent} 14%, var(--glass-surface-2))` : "var(--glass-surface-2)",
                    borderColor: current ? `color-mix(in srgb, ${accent} 45%, var(--glass-border))` : "var(--glass-border)",
                    opacity: m.state === "upcoming" ? 0.85 : 1,
                  }}
                >
                  {/* the calendar page's top band, in the month's state colour */}
                  <span aria-hidden className="block h-[4px] w-full" style={{ background: m.state === "upcoming" ? "color-mix(in srgb, var(--muted-foreground) 35%, transparent)" : tone }} />
                  <span className="flex flex-1 flex-col justify-between gap-[8px] p-[12px]">
                    <span className="flex items-start justify-between gap-[6px]">
                      <span className="flex flex-col">
                        <span className="text-[24px] leading-[26px] font-extrabold tracking-[0.02em] uppercase" style={{ fontFamily: "var(--font-display)", color: m.state === "upcoming" ? "var(--foreground)" : tone }}>{m.month.slice(0, 3)}</span>
                        <span className="text-[10.5px] leading-[14px] font-bold tracking-[0.08em]" style={{ color: "var(--muted-foreground)" }}>{yearOf(i)}</span>
                      </span>
                      {m.state === "complete" && <Check className="h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} />}
                      {current && <span className="rounded-full px-[6px] py-[1px] text-[10px] leading-[14px] font-extrabold tracking-[0.06em] uppercase" style={{ background: accent, color: "#0e0c20" }}>Now</span>}
                    </span>
                    <span className="text-[12.5px] leading-[16px] font-semibold text-balance" style={{ color: "var(--muted-foreground)" }}>{m.title}</span>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Prep row: the real cards

/** The three prep cards: one shape, a why line and a CTA on every one, so
 *  it is clear what the student is meant to do (the Replit's own copy). */
// isolate + [transform:translateZ(0)]: backdrop-filter blur (CardProgressiveBlur)
// can bleed a bright sliver past an ancestor's rounded corners in Chrome/Safari
// despite overflow-hidden + border-radius:inherit -- both force the browser to
// composite this card as its own layer, which clips the blur at the true
// rounded edge instead of the corner square it renders to before clipping
// (direct feedback, 19 Sept 2026: "bright borders on the rounded corners").
const PREP_CARD = "dm-tap group relative isolate flex h-[240px] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left [transform:translateZ(0)] [clip-path:inset(0_round_var(--radius-lg))]";

/** Measures a caption's actual rendered height (re-measuring whenever it
 *  reflows -- a wrapped title on a narrow phone, a font swap, a resize) so
 *  the frosted zone behind it can be sized to fit exactly, not guessed as a
 *  fixed percentage of the card (direct feedback, 19 Sept 2026: "have the
 *  blur adapt dynamically to wherever the eyebrow sits on different
 *  devices"). `pad` adds headroom above the caption's own top edge so the
 *  frost feathers in before the text starts, not right at its first line. */
function useCaptionHeight(pad = 24) {
  const ref = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setHeight(Math.ceil(el.getBoundingClientRect().height) + pad);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pad]);
  return { ref, height };
}

const PrepFoot = forwardRef<HTMLSpanElement, { label: string; title: string; why: string; cta: string; tone?: string }>(function PrepFoot({ label, title, why, cta, tone }, ref) {
  return (
    <span ref={ref} className="relative z-[2] flex flex-col gap-[4px] px-[16px] pt-[56px] pb-[14px]">
      <span className="text-[10.5px] leading-[14px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone ?? accent }}>{label}</span>
      <span className="text-[18px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{title}</span>
      <span className="text-[12.5px] leading-[17px]" style={{ color: "rgba(255,255,255,0.78)" }}>{why}</span>
      <span className="mt-[6px] flex items-center gap-[4px] text-[13px] font-bold" style={{ color: "#FFFFFF" }}>{cta} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
    </span>
  );
});

function CareerPrepCard({ onClick }: { onClick: () => void }) {
  const c = D.PREP_CAREER;
  const { ref, height } = useCaptionHeight();
  return (
    <button type="button" onClick={onClick} className={PREP_CARD} style={{ borderColor: "var(--glass-border)", textShadow: CARD_TEXT_SHADOW }}>
      <Image src={c.photo} alt="" fill sizes="(min-width: 640px) 33vw, 260px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ objectPosition: "50% 30%" }} />
      {/* Frosted-caption recipe, sized to the caption's own measured
         height, not a guessed percentage (direct feedback, 19 Sept 2026:
         "have the blur adapt dynamically to wherever the eyebrow sits on
         different devices"). */}
      <CardProgressiveBlur size={height ? `${height}px` : "58%"} maxBlur={34} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden style={{ height: height ? `${height}px` : "58%", background: cardBottomScrim("heavy") }} />
      <PrepFoot ref={ref} label={c.label} title={c.title} why={c.why} cta={c.cta} tone={WORLD_COLORS[c.world]} />
    </button>
  );
}

function PlayPrepCard({ onClick }: { onClick: () => void }) {
  const p = D.PREP_PLAY;
  const { ref, height } = useCaptionHeight();
  return (
    <button type="button" onClick={onClick} className={PREP_CARD} style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", textShadow: CARD_TEXT_SHADOW }}>
      {/* A wide atelier scene cropped into this taller card; favor the
         mannequins and the buyer's desk (center-left) over the display bag
         on the far right. */}
      <Image src={p.cover} alt="" fill sizes="(min-width: 640px) 33vw, 260px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ objectPosition: "40% 45%" }} />
      <CardProgressiveBlur size={height ? `${height}px` : "58%"} maxBlur={34} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden style={{ height: height ? `${height}px` : "58%", background: cardBottomScrim("heavy") }} />
      <span className="absolute top-[14px] right-[14px] z-[2] flex size-[38px] items-center justify-center rounded-full" style={{ background: "var(--primary)", color: "#FFFFFF", boxShadow: "0 8px 20px -8px rgba(0,0,0,0.6)" }}>
        <Play className="ml-[2px] h-[16px] w-[16px]" fill="currentColor" aria-hidden />
      </span>
      <PrepFoot ref={ref} label={p.label} title={p.title} why={p.why} cta={p.cta} tone={WORLD_COLORS[p.world]} />
    </button>
  );
}

/** The student's own resume as a file: the page fills the card, live from
 *  the store, Jordan's sample when nothing is saved yet. */
function ResumePrepCard({ onClick }: { onClick: () => void }) {
  const stored = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const latest = stored.versions[0];
  const own = !!latest && !!stored.profile.firstName;
  const data: ResumeData = own ? resumeForVersion(stored, latest) : (D.SAMPLE_RESUME as ResumeData);
  const name = own ? latest.name : D.PREP_RESUME_NAME;
  const { ref, height } = useCaptionHeight();
  return (
    <button type="button" onClick={onClick} className={PREP_CARD} style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", textShadow: CARD_TEXT_SHADOW }}>
      {/* Full brightness, no dimming (direct feedback, 19 Sept 2026: "the
         resume can be brighter"). Same dark scrim and white PrepFoot as
         the other two cards now, not a paper-toned light exception (direct
         feedback, 19 Sept 2026: "same blur as the other cards on resume so
         it doesn't have to be light mode") -- the heavy scrim is dark
         enough to hold up even over white paper. */}
      <span className="pointer-events-none absolute inset-x-0 top-0 block" aria-hidden>
        <ResumeDocument resume={data} templateId={DEFAULT_RESUME_TEMPLATE} sectionOrder={latest?.sectionOrder} hiddenSections={latest?.hiddenSections} sectionOverrides={latest?.sectionOverrides} />
      </span>
      <CardProgressiveBlur size={height ? `${height}px` : "58%"} maxBlur={34} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden style={{ height: height ? `${height}px` : "58%", background: cardBottomScrim("heavy") }} />
      {/* Same label color as its siblings -- it was defaulting to accent
         (Coach's tan) while Explore/Play use WORLD_COLORS, two different
         colors for what should read as one consistent eyebrow treatment
         (direct feedback, 19 Sept 2026: "Resume label vs explore and play
         labels is the color inconsistency"). */}
      <PrepFoot ref={ref} label={D.PREP_RESUME.label} title={name} why={D.PREP_RESUME.why} cta={D.PREP_RESUME.cta} tone={WORLD_COLORS[D.PREP_CAREER.world]} />
    </button>
  );
}

/** Year two, decided in the app instead of by hand (Tapestry). */
function RematchPanel({ who, onToast }: { who: string; onToast: (t: string) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  return (
    <Panel className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
      <div className="flex min-w-0 flex-col gap-[2px]">
        <Eyebrow>Year 1 of 4</Eyebrow>
        <span className="text-[15.5px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{D.REMATCH.question.replace("Avery", who)}</span>
        <Muted className="text-[12.5px] leading-[17px]">{D.REMATCH.note}</Muted>
      </div>
      <div role="radiogroup" aria-label="Next year" className="flex flex-wrap gap-[6px]">
        {D.REMATCH.options.map((o) => {
          const on = pick === o;
          return <button key={o} type="button" role="radio" aria-checked={on} onClick={() => { setPick(o); onToast("Saved. You can change this until April 30."); }} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[6px] text-[12.5px] leading-[16px] font-semibold whitespace-nowrap" style={on ? { borderColor: `color-mix(in srgb, ${GOOD} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${GOOD} 14%, transparent)`, color: "var(--foreground)" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>{on && <Check className="mr-[4px] inline h-3.5 w-3.5" aria-hidden style={{ color: GOOD }} />}{o}</button>;
        })}
      </div>
    </Panel>
  );
}

/** The orientation every mentor completes, with the do's and don'ts one tap away. */
function OrientationRow({ onToast }: { onToast: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="dm-tap group relative flex w-full cursor-pointer items-center justify-between gap-[10px] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[14px] text-left" style={PANEL}>
        <span className="flex items-center gap-[12px]">
          <span className="flex size-[34px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${GOOD} 16%, transparent)`, color: GOOD }}><Check className="h-4 w-4" aria-hidden /></span>
          <span className="flex flex-col"><span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{D.ORIENTATION.title}</span><Muted className="text-[12.5px] leading-[17px]">{D.ORIENTATION.status}</Muted></span>
        </span>
        <span className="flex items-center gap-[4px] text-[13px] font-bold" style={{ color: accent }}>Do&apos;s and don&apos;ts <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
      </button>
      {open && (
        <Sheet title="Working with a young person" label={D.ORIENTATION.title} onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-[6px]">
            <Eyebrow tone={GOOD}>Do</Eyebrow>
            <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>{D.ORIENTATION.dos.map((d) => <li key={d} className="flex items-start gap-[10px] py-[9px] text-[14px] leading-[20px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><Check className="mt-[3px] h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} /> {d}</li>)}</ul>
          </div>
          <div className="flex flex-col gap-[6px]">
            <Eyebrow tone="var(--world-business-money-office)">Never</Eyebrow>
            <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>{D.ORIENTATION.donts.map((d) => <li key={d} className="flex items-start gap-[10px] py-[9px] text-[14px] leading-[20px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><X className="mt-[3px] h-4 w-4 flex-none" aria-hidden style={{ color: "var(--world-business-money-office)" }} /> {d}</li>)}</ul>
          </div>
          <QuietCta size="sm" className="w-fit" onClick={() => { setOpen(false); onToast("Sent to your email."); }}><Download className="h-4 w-4" aria-hidden /> Save a copy</QuietCta>
        </Sheet>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Student

type ViewShared = { messages: D.Message[]; setMessages: React.Dispatch<React.SetStateAction<D.Message[]>>; sub: string; setSub: (s: string) => void; openChat: () => void; onOpenProfile: () => void };

function StudentView({ messages, setMessages, sub, setSub, openChat, onOpenProfile }: ViewShared) {
  const router = useRouter();
  // Messages is the dock, not a tab: one conversation, one home
  const tab = (["home", "plan"].includes(sub) ? sub : "home") as "home" | "plan";
  const setTab = (t: "home" | "plan") => setSub(t);
  const [toast, onToast] = useToast();
  const postRequest = (m: D.MeetingRequest) => setMessages((list) => [...list, { from: "mentee", text: "", when: "Just now", meeting: m }]);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="w-full sm:w-fit"><Segmented grow ariaLabel="Mentorship sections" value={tab} onChange={setTab} options={[{ key: "home", label: "Home" }, { key: "plan", label: "Year Plan" }]} /></div>
      {tab === "home" && (
        <div className="flex flex-col gap-[var(--space-5)]">
          {/* My mentor and Next meeting share one row on desktop only.
             Started at md (768px, direct feedback: side by side, not
             stacked full width), but tablet widths right at md were
             squeezing Next Meeting's CTAs and info into an ugly wrap
             (direct feedback, 19 Sept 2026) -- every tablet width now gets
             a full-width row each, side by side only from lg up where each
             card has real room. */}
          <div className="grid gap-[var(--space-5)] lg:grid-cols-2">
          {/* Corporate ID badge, take four (direct feedback, 19 Sept
             2026): Next Meeting's identity block sits ABOVE its CTA row,
             not beside it -- Message Mentor now stacks under the name/title
             the same way Join/Reschedule stack under "Tuesday 4:00 PM".
             The divider bleeds edge to edge (a negative margin against
             ClickPanel's own padding, same trick a card's printed rule
             would use) so it no longer crowds the avatar right above it.
             The badge content underneath -- Coach's mark and where Avery is
             based -- gets the tinted band treatment as its own full-bleed
             footer strip, rounded to match the card's own corners. */}
          {/* min-h-[197px]: Next Meeting's own measured height, so the two
             cards match even stacked full-width on tablet, not just side by
             side where grid stretch already equalizes them (direct
             feedback, 19 Sept 2026: "the cards should be the same height on
             tablet etc too"). */}
          <ClickPanel onClick={onOpenProfile} label={`Open ${D.MENTOR.name}'s profile`} className="relative flex h-full min-h-[197px] flex-col overflow-hidden">
            <div className="flex items-center gap-[14px]">
              <Avatar name={D.MENTOR.name} size={52} photo={D.MENTOR.photo} ring={accent} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <Eyebrow>My mentor</Eyebrow>
                <span className="flex items-center gap-[6px] text-[16px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{D.MENTOR.name} <VerifiedBadge size={15} /></span>
                <Muted>{D.MENTOR.title}</Muted>
              </div>
            </div>
            {/* No View profile button -- the whole card already opens
               it (direct feedback, 19 Sept 2026). Same left edge as the
               date tile above it, exactly where Join sits under "Tuesday
               4:00 PM" -- not indented to the text. */}
            <div className={`${ABOVE} mt-[var(--space-3)]`}>
              <QuietCta size="sm" onClick={openChat}><Send className="h-4 w-4" aria-hidden /> Message</QuietCta>
            </div>
            {/* Pinned to the card's true bottom edge with mt-auto, the same
               place Next Meeting's own meter row lands once the grid
               stretches this shorter card to match it (direct feedback, 19
               Sept 2026: "the bottom banner should be aligned to the
               bottom"). The divider bleeds edge to edge; the footer band
               bleeds to all three remaining edges and picks up the card's
               own bottom corners. */}
            <div className="mt-auto pt-[var(--space-4)]">
              {/* A colored accent, not the plain grey rule Next Meeting
                 uses (direct feedback, 19 Sept 2026), touching the tinted
                 band directly below it -- no gap between them. */}
              <div className="-mx-[var(--space-5)] border-t" style={{ borderColor: `color-mix(in srgb, ${accent} 65%, transparent)` }} />
              {/* min-h-[53px]: Next Meeting's own measured divider-to-bottom
                 distance, so the two bottom sections align exactly, not
                 just approximately (direct feedback, 19 Sept 2026). */}
              <div
                className="relative z-[1] -mx-[var(--space-5)] -mb-[var(--space-5)] flex min-h-[53px] flex-wrap items-center justify-between gap-[10px] rounded-b-[var(--radius-lg)] px-[var(--space-5)]"
                style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${accent} 24%, var(--glass-surface-1)) 0%, color-mix(in srgb, ${accent} 8%, var(--glass-surface-1)) 100%)` }}
              >
                <Muted className="flex items-center gap-[5px]"><MapPin className="h-3.5 w-3.5" aria-hidden /> {D.MENTOR.location}</Muted>
                <Image src={D.PROGRAM.logoWhite} alt="Coach Foundation" width={600} height={150} className="h-[19px] w-auto opacity-90" />
              </div>
            </div>
          </ClickPanel>

          <ScheduleCard me="mentee" messages={messages} onRequest={postRequest} onToast={onToast} showMeter />
          </div>

          <div className="flex flex-col gap-[var(--space-3)]">
            <SectionHead>Prep for your mentor</SectionHead>
            {/* The real cards, not tiles about them: the career poster, the
               Play card, the student's own resume. */}
            {/* Three cards, one row, the full width; a scroll rail only on
               phones, with room so the hover lift is never clipped. */}
            <div className="-mx-[6px] -my-[8px] flex gap-[var(--space-4)] overflow-x-auto px-[6px] py-[8px] [scrollbar-width:none] sm:mx-0 sm:my-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:py-0">
              {[
                <CareerPrepCard key="career" onClick={() => router.push(D.PREP_CAREER.href)} />,
                <PlayPrepCard key="play" onClick={() => router.push(D.PREP_PLAY.href)} />,
                <ResumePrepCard key="resume" onClick={() => router.push(D.PREP_RESUME_HREF)} />,
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="w-[260px] flex-none sm:w-auto">
                  {card}
                </motion.div>
              ))}
            </div>
          </div>

          <RematchPanel who="Avery" onToast={onToast} />
        </div>
      )}
      {tab === "plan" && <YearPlan eyebrow="Year plan" title="Topics to discuss each month." />}
      {toast}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mentor

function MentorView({ messages, setMessages, sub, setSub, openChat, onOpenProfile }: ViewShared) {
  const tab = (["home", "journey"].includes(sub) ? sub : "home") as "home" | "journey";
  const setTab = (t: "home" | "journey") => setSub(t);
  const [prep, setPrep] = useState(false);
  const [toast, onToast] = useToast();
  const postRequest = (m: D.MeetingRequest) => setMessages((list) => [...list, { from: "mentor", text: "", when: "Just now", meeting: m }]);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="w-full sm:w-fit"><Segmented grow ariaLabel="Mentorship sections" value={tab} onChange={setTab} options={[{ key: "home", label: "Home" }, { key: "journey", label: "Journey" }]} /></div>
      {tab === "home" && (
        <div className="flex flex-col gap-[var(--space-5)]">
          <ClickPanel onClick={onOpenProfile} label={`Open ${D.MENTEE.name}'s profile`} className="flex flex-wrap items-center justify-between gap-[var(--space-4)] pr-[28px]">
            <div className="flex items-center gap-[14px]">
              <Avatar name={D.MENTEE.name} size={56} photo={studentAvatarSrc(D.MENTEE.name)} ring={`color-mix(in srgb, ${accent} 55%, transparent)`} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <Eyebrow>My mentee</Eyebrow>
                <span className="flex items-center gap-[6px] text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.MENTEE.name} <VerifiedBadge size={16} /></span>
                <Muted>{D.MENTEE.line}</Muted>
              </div>
            </div>
            <QuietCta size="sm" className={`${ABOVE} flex-none`} onClick={openChat}><Send className="h-4 w-4" aria-hidden /> Message</QuietCta>
          </ClickPanel>

          {/* Same lg-only side-by-side as the student view, for the same
             tablet-squeeze reason. */}
          <div className="grid gap-[var(--space-5)] lg:grid-cols-2">
          <ClickPanel onClick={() => setPrep(true)} label="Prepare for meeting" className="flex flex-col gap-[var(--space-3)]">
            <Eyebrow>Your next conversation</Eyebrow>
            <div className="flex flex-wrap items-center gap-[8px]">
              <Title>{D.NEXT_CONVERSATION.head}</Title>
              {D.MENTEE.exploring.map((c) => <Chip key={c}>{c}</Chip>)}
            </div>
            <Item className="flex items-start gap-[10px]">
              <Sparkles className="mt-[2px] h-4 w-4 flex-none" aria-hidden style={{ color: accent }} />
              <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{D.NEXT_CONVERSATION.prompt}</span>
            </Item>
            <QuietCta size="sm" className={`${ABOVE} w-fit`} onClick={() => setPrep(true)}>{D.NEXT_CONVERSATION.cta} <ChevronRight className="h-4 w-4" aria-hidden /></QuietCta>
          </ClickPanel>

          <ScheduleCard me="mentor" messages={messages} onRequest={postRequest} onToast={onToast} showMeter />
          </div>
          <OrientationRow onToast={onToast} />
          <RematchPanel who={D.MENTEE.name} onToast={onToast} />
        </div>
      )}
      {tab === "journey" && <YearPlan eyebrow="Mentorship journey" title="A clear next step, every month." />}
      {prep && (
        <Sheet title={`Before you meet ${D.MENTEE.name}`} label="Prepare for meeting" onClose={() => setPrep(false)}>
          <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.NEXT_CONVERSATION.prep.map((line) => (
              <li key={line} className="flex items-start gap-[10px] py-[10px] text-[14.5px] leading-[20px]" style={{ borderColor: RULE, color: "var(--foreground)" }}>
                <Check className="mt-[3px] h-4 w-4 flex-none" aria-hidden style={{ color: GOOD }} /> {line}
              </li>
            ))}
          </ul>
          <Item className="flex flex-col gap-[4px]">
            <Eyebrow tone="var(--muted-foreground)">Opening question</Eyebrow>
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{D.NEXT_CONVERSATION.prompt}</span>
          </Item>
          <Link href="/explore?tab=browse" className="dm-link flex w-fit items-center gap-[4px] text-[13px] font-bold" style={{ color: accent }}>Open {D.MENTEE.name}&apos;s saved careers <ChevronRight className="h-3.5 w-3.5" aria-hidden /></Link>
        </Sheet>
      )}
      {toast}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enterprise

/** Each KPI's spark series is 9 months, Jan through Sep -- the same
 *  calendar-year cadence the Enterprise Overview reports on (see
 *  mentorshipData.ts's Kpi.spark comment history). Local to this file since
 *  nothing else needs month labels once the Details tab was cut. */
const SPARK_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

/** The Overview's region filter, a real dropdown (Josh's Replit pass, 20
 *  Sept 2026) rather than the Regions tab's own segmented pills -- five
 *  options read better as a list than a row that wraps on mobile. */
function GeographyDropdown({ program, setProgram }: { program: D.ProgramId; setProgram: (p: D.ProgramId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const options = [{ id: "all" as D.ProgramId, name: "Global" }, ...D.PROGRAMS];
  const label = options.find((o) => o.id === program)?.name ?? "Global";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} className="dm-quiet flex h-[42px] min-w-[180px] cursor-pointer items-center justify-between gap-[10px] rounded-[var(--radius-md)] border px-[14px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
        {label} <ChevronDown className={`h-4 w-4 flex-none transition-transform ${open ? "rotate-180" : ""}`} aria-hidden style={{ color: "var(--muted-foreground)" }} />
      </button>
      {open && (
        <div role="listbox" aria-label="Geography" className="absolute top-[calc(100%+6px)] left-0 z-20 min-w-[220px] overflow-hidden rounded-[var(--radius-md)] border motion-safe:animate-[fade-slide-up_0.16s_ease-out_both]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.8)" }}>
          {options.map((o) => (
            <button key={o.id} type="button" role="option" aria-selected={program === o.id} onClick={() => { setProgram(o.id); setOpen(false); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] px-[14px] py-[10px] text-left text-[14px] font-semibold" style={{ color: program === o.id ? accent : "var(--foreground)" }}>
              {o.name} {program === o.id && <Check className="h-4 w-4 flex-none" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EnterpriseView({ sub, setSub }: { sub: string; setSub: (s: string) => void }) {
  const tab = (["overview", "settings"].includes(sub) ? sub : "overview") as "overview" | "settings";
  const setTab = (t: "overview" | "settings") => setSub(t);
  const [program, setProgram] = useState<D.ProgramId>("all");
  const [ePeriod, setEPeriod] = useState<D.EngagementPeriod>("annual");
  const [exporting, setExporting] = useState(false);
  const [sheet, setSheet] = useState<{ kind: "kpi"; key: D.Kpi["key"]; def: D.EngagementPeriod } | null>(null);
  const [toast, onToast] = useToast();
  const selected = D.PROGRAMS.find((p) => p.id === program) ?? null;
  // a region's (or, per-program, a program's) share of the global figure
  // for a given KPI -- reused by Program-at-a-glance/Engagement and by the
  // drill-down sheet's by-program breakdown
  const shareOf = (k: D.Kpi, of: { hours: number; students: number; mentors: number } | null) => (of ? (k.key === "hours" ? of.hours : k.key === "students" ? of.students : k.key === "mentors" ? of.mentors : Math.round(of.hours * (k.key === "messages" ? 1.24 : 0.18))) : null);
  const kpiValue = (k: D.Kpi, field: "year" | "quarter" | "month", of = selected) => {
    const share = shareOf(k, of);
    const ratio = share !== null ? share / k.year : 1;
    return share !== null ? (field === "year" ? share : Math.round(k[field] * ratio)) : k[field];
  };
  const eDef = D.ENGAGEMENT_PERIODS.find((p) => p.key === ePeriod)!;
  const kpiOf = (key: D.Kpi["key"]) => D.KPIS.find((k) => k.key === key)!;
  // the drill-down sheet's own trend chart, region-scaled the same way the
  // number is -- real axis and gridlines belong here, not on the compact
  // card (dataviz research, 20 Sept 2026: a bare mini-line at card size
  // reads as noise; a grounded chart needs the room a sheet has)
  const sparkOf = (k: D.Kpi) => {
    const share = shareOf(k, selected);
    const ratio = share !== null ? share / k.year : 1;
    return k.spark.map((v) => Math.round(v * ratio));
  };
  const mentorsNow = kpiValue(kpiOf("mentors"), "year");
  const scholarsNow = kpiValue(kpiOf("students"), "year");
  const hoursNow = kpiValue(kpiOf("hours"), eDef.field);
  const meetingsNow = kpiValue(kpiOf("meetings"), eDef.field);
  const messagesNow = kpiValue(kpiOf("messages"), eDef.field);
  const goalPct = Math.min(100, Math.round((D.YEAR_HOURS_GOAL.logged / D.YEAR_HOURS_GOAL.target) * 100));

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* Rebuilt to Josh's second Replit pass (20 Sept 2026): just this and
         Settings, matching his structure exactly rather than tucking the
         old Overview's deeper reporting (2030 goals, student impact, a
         Regions tab, mentor activity, mentor mix) a tap away -- cut per
         direct follow-up once that in-between version was live. */}
      <div className="w-full sm:w-fit"><Segmented grow ariaLabel="Enterprise sections" value={tab} onChange={setTab} options={[{ key: "overview", label: "Overview" }, { key: "settings", label: "Settings" }]} /></div>

      {tab === "overview" && (
        <div className="flex flex-col gap-[var(--space-5)]">
          <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
            <label className="flex flex-col gap-[6px]">
              <span className="text-[11px] leading-[14px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Geography</span>
              <GeographyDropdown program={program} setProgram={setProgram} />
            </label>
            <QuietCta size="sm" onClick={() => setExporting(true)}><Download className="h-4 w-4" aria-hidden /> Export</QuietCta>
          </div>

          {/* A different interaction than the Segmented tab bar above, on
             purpose (direct feedback, 20 Sept 2026: stacked pill rows
             clash) -- underlined sub-tabs, the same fix already used for
             Answers | Posts on a volunteer's own profile. */}
          <SubTabs ariaLabel="Time period" value={ePeriod} onChange={setEPeriod} options={D.ENGAGEMENT_PERIODS.map((p) => ({ key: p.key, label: p.label }))} />

          <div className="flex flex-col gap-[var(--space-3)]">
            <Title>Program at a glance</Title>
            <Panel className="relative grid grid-cols-2 !p-0">
              <span aria-hidden className="absolute top-1/2 left-1/2 z-10 flex size-[26px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", background: "var(--background)", color: "var(--muted-foreground)" }}><Link2 className="h-3 w-3" aria-hidden /></span>
              {[
                { key: "mentors" as const, value: mentorsNow },
                { key: "students" as const, value: scholarsNow },
              ].map(({ key, value }, i) => {
                const k = kpiOf(key);
                return (
                  <button key={key} type="button" onClick={() => setSheet({ kind: "kpi", key, def: "annual" })} className={`dm-quiet group flex cursor-pointer flex-col gap-[10px] p-[var(--space-5)] text-left ${i === 1 ? "border-l" : ""}`} style={{ borderColor: RULE }}>
                    <span className="flex items-center justify-between gap-[8px]">
                      <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{k.label}</span>
                      <DeltaBadge value={k.deltaYear} />
                    </span>
                    <span className="text-[30px] leading-[34px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{compact(value)}</span>
                  </button>
                );
              })}
            </Panel>
          </div>

          <div className="flex flex-col gap-[var(--space-3)]">
            <Title>Engagement {eDef.sectionWord}</Title>
            <Panel className="grid grid-cols-1 !p-0 sm:grid-cols-3">
              {[
                { key: "hours" as const, value: hoursNow, sub: null },
                { key: "meetings" as const, value: meetingsNow, sub: `${(meetingsNow / mentorsNow).toFixed(1)} / pair` },
                { key: "messages" as const, value: messagesNow, sub: `${(messagesNow / mentorsNow).toFixed(1)} / pair` },
              ].map((row, i) => {
                const k = kpiOf(row.key);
                return (
                  <button key={row.key} type="button" onClick={() => setSheet({ kind: "kpi", key: row.key, def: ePeriod })} className={`dm-quiet group flex cursor-pointer flex-col gap-[10px] text-left ${ruledCell(i, 3)}`} style={{ borderColor: RULE }}>
                    <span className="flex items-center justify-between gap-[8px]">
                      <span className="text-[12px] leading-[16px] font-bold tracking-[0.02em] uppercase" style={{ color: "var(--muted-foreground)" }}>{k.label}</span>
                      <DeltaBadge value={k[eDef.deltaField]} />
                    </span>
                    <span className="text-[26px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{compact(row.value)}</span>
                    {row.sub && <Muted className="text-[12px] leading-[16px]">{row.sub}</Muted>}
                  </button>
                );
              })}
            </Panel>
          </div>

          {ePeriod === "annual" && (
            <Panel className="flex flex-col items-center gap-[var(--space-5)] sm:flex-row">
              <Ring pct={goalPct} size={140} stroke={12} accent={accent}>
                <span className="flex flex-col items-center gap-[2px]">
                  <span className="text-[26px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{goalPct}%</span>
                  <span className="text-[11px] leading-[14px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Complete</span>
                </span>
              </Ring>
              <div className="flex flex-col gap-[6px] text-center sm:text-left">
                <Title>{new Date().getFullYear()} volunteer hours goal</Title>
                <span className="text-[15px] leading-[20px] font-bold" style={{ color: accent }}>{compact(D.YEAR_HOURS_GOAL.logged)} <span style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>of {compact(D.YEAR_HOURS_GOAL.target)} hours</span></span>
                <Muted className="text-[13px] leading-[18px]">{compact(D.YEAR_HOURS_GOAL.target - D.YEAR_HOURS_GOAL.logged)} hours to go</Muted>
              </div>
            </Panel>
          )}
        </div>
      )}

      {tab === "settings" && <SettingsView onToast={onToast} />}

      {sheet?.kind === "kpi" && (() => {
        const k = kpiOf(sheet.key);
        const def = D.ENGAGEMENT_PERIODS.find((p) => p.key === sheet.def)!;
        const per = D.PROGRAMS.map((p) => ({ label: p.name, value: kpiValue(k, def.field, p) }));
        return (
          <Sheet title={k.label} label={`By program, ${def.sectionWord.toLowerCase()}`} onClose={() => setSheet(null)}>
            <span className="flex items-center gap-[10px]">
              <span className="text-[30px] leading-[34px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{compact(kpiValue(k, def.field, null))}</span>
              <DeltaBadge value={k[def.deltaField]} />
            </span>
            <BarChart values={sparkOf(k)} labels={SPARK_MONTHS} accent={accent} highlight={SPARK_MONTHS.length - 1} height={150} ariaLabel={`${k.label} by month`} />
            <ShareBar parts={per} accent={accent} />
            <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
              {per.map((r) => <div key={r.label} className="flex items-center justify-between py-[9px] text-[14px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><span>{r.label}</span><span className="font-bold tabular-nums">{r.value.toLocaleString("en-US")}</span></div>)}
            </div>
          </Sheet>
        );
      })()}

      {exporting && (
        <Sheet title="Export report" label={selected ? selected.name : "All programs"} onClose={() => setExporting(false)}>
          <Muted>Figures for {eDef.sectionWord.toLowerCase()}. Message content is never included.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.EXPORT_ITEMS.map((e) => (
              <button key={e.title} type="button" onClick={() => { setExporting(false); onToast(`${e.title} is on its way to your email.`); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] py-[12px] text-left" style={{ borderColor: RULE }}>
                <span className="flex flex-col gap-[2px]"><span className="text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{e.title}</span><Muted className="text-[12px] leading-[16px]">{e.line}</Muted></span>
                <Download className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {toast}
    </div>
  );
}

function SettingsView({ onToast }: { onToast: (t: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(D.SETTINGS.map((s) => [s.key, s.value])));
  const [rules, setRules] = useState<Record<string, boolean>>(Object.fromEntries(D.HOUR_RULES.map((r) => [r.key, r.on])));
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <SectionHead>Settings</SectionHead>
      <Panel className="flex flex-col divide-y !p-0">
        {D.SETTINGS.map((s) => (
          <div key={s.key} className="flex flex-wrap items-center justify-between gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: RULE }}>
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{s.title}</span>
              {/* where matching stands, on the row that sets how it works */}
              {s.key === "matching" && <Muted className="text-[12.5px] leading-[17px]">{D.MATCHING_STATUS.recruitment} · {D.MATCHING_STATUS.signedUp} signed up · {D.MATCHING_STATUS.matched} matched · {D.MATCHING_STATUS.waitlist} waitlisted · {D.MATCHING_STATUS.rematchPending} year-two rematch answers pending</Muted>}
            </span>
            <div role="radiogroup" aria-label={s.title} className="flex flex-wrap gap-[6px]">
              {s.options.map((o) => {
                const on = values[s.key] === o;
                return (
                  <button key={o} type="button" role="radio" aria-checked={on} onClick={() => { setValues((v) => ({ ...v, [s.key]: o })); onToast(`${s.title}: ${o}`); }} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12.5px] leading-[16px] font-semibold whitespace-nowrap" style={on ? { borderColor: `color-mix(in srgb, ${accent} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: "var(--foreground)" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: RULE }}>
          <span className="flex min-w-0 flex-col gap-[2px]">
            <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{D.VERIFICATION.title}</span>
            <Muted className="text-[12.5px] leading-[17px]">{D.VERIFICATION.line}</Muted>
          </span>
          <div role="radiogroup" aria-label={D.VERIFICATION.title} className="flex flex-wrap gap-[6px]">
            {D.VERIFICATION.options.map((o) => {
              const on = (values.verification ?? D.VERIFICATION.value) === o;
              return (
                <button key={o} type="button" role="radio" aria-checked={on} onClick={() => { setValues((v) => ({ ...v, verification: o })); onToast(`${D.VERIFICATION.title}: ${o}`); }} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[12.5px] leading-[16px] font-semibold whitespace-nowrap" style={on ? { borderColor: `color-mix(in srgb, ${accent} 55%, var(--glass-border))`, background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: "var(--foreground)" } : { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      </Panel>
      <Panel className="flex flex-col gap-[var(--space-3)]">
        <Title className="text-[16px] leading-[21px]">What counts toward volunteer hours</Title>
        <ul className="flex flex-col divide-y" style={{ borderColor: RULE }}>
          {D.HOUR_RULES.map((r) => {
            const on = rules[r.key];
            return (
              <li key={r.key} className="flex items-center justify-between gap-[var(--space-4)] py-[11px]" style={{ borderColor: RULE }}>
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                  <Muted className="text-[12.5px] leading-[17px]">{r.line}</Muted>
                </span>
                <button type="button" role="switch" aria-checked={on} aria-label={r.title} onClick={() => setRules((v) => ({ ...v, [r.key]: !on }))} className="relative h-[24px] w-[42px] flex-none cursor-pointer rounded-full transition-colors" style={{ background: on ? accent : "rgba(255,255,255,0.14)" }}>
                  <motion.span layout aria-hidden className="absolute top-[3px] size-[18px] rounded-full" style={{ left: on ? 21 : 3, background: "#FFFFFF" }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                </button>
              </li>
            );
          })}
        </ul>
        <Muted className="text-[12px] leading-[16px]">Message counts only, never message content.</Muted>
      </Panel>
    </div>
  );
}
