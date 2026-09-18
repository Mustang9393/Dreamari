"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { AlertTriangle, BookOpen, Calendar, CalendarPlus, Check, ClipboardList, Compass, ChevronLeft, ChevronRight, Clock, Download, FileText, Flag, GraduationCap, Handshake, Link2, Lock, Maximize2, MessageCircle, Minimize2, Minus, Play, Plus, School, Send, ShieldCheck, Smile, Sparkles, Target, Timer, Users, Video, X } from "lucide-react";
import { clearMeetingDecision, openDock, setDock, setMentorshipContext, setProgramContext, setUnreadMessages, useInbox } from "@/lib/inbox";
import { playMessageTone } from "./sound";
import { Portal } from "@/components/profile/CareerReport";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import { studentAvatarSrc } from "@/lib/avatar";
import { DEFAULT_RESUME_TEMPLATE } from "@/components/resume/data";
import { resumeForVersion, resumeSnapshot, serverResumeSnapshot, subscribeResume } from "@/lib/resume";
import { Avatar, CompanyMark, InsightMark, PrimaryCta, QuietCta, SectionHead, SectionSurface, VerifiedBadge } from "../primitives";
import { ProProfileView, type Follows } from "../ProProfile";
import type { Pro } from "../data";
import type { ResumeData } from "@/lib/resume";
import { Meter, Ring, Segmented, ruledCell } from "../viz";
import { BarChart, GoalTrack, Histogram, ShareBar, Sparkline, compact } from "./charts";
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
  const [mentorSheet, setMentorSheet] = useState<D.PairActivity | null>(null);
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
    view === "enterprise" ? (sub === "countries" ? "Regions" : sub === "settings" ? "Settings" : "Overview")
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
      {mentorSheet && <MentorSheet row={mentorSheet} onClose={() => setMentorSheet(null)} />}
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
        {view === "enterprise" && <EnterpriseView sub={sub} setSub={setSub} onOpenMentor={(row) => (row.mentor === D.MENTOR.name ? setProfile("mentor") : setMentorSheet(row))} />}
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
        <div className={`${ABOVE} flex items-center gap-[8px]`}>
          {/* The beam marks the one thing to do next, the way NextStepBanner does. */}
          <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={3.2} strength={0.7} active>
            <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer" className="dm-solid relative flex min-h-[36px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] leading-[18px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
              <Video className="h-4 w-4" aria-hidden /> Join Meeting
            </a>
          </BorderBeam>
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
            <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer" className="dm-solid flex min-h-[36px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] leading-[18px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}><Video className="h-4 w-4" aria-hidden /> Join Meeting</a>
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

/** A mentor without a full Connect profile yet: the pair's activity and the
 *  ways to reach them, in a sheet so the dashboard stays put behind it. */
function MentorSheet({ row, onClose }: { row: D.PairActivity; onClose: () => void }) {
  return (
    <Sheet title={row.mentor} label="Coach employee mentor" onClose={onClose}>
      <Muted>Matched with {row.mentee} · Last contact {row.lastContact}</Muted>
      <div className="grid grid-cols-3 gap-[var(--space-3)]">
        {([[row.messages, "Messages"], [row.meetings, "Meetings"], [`${row.hours}h`, "Hours"]] as [number | string, string][]).map(([v, l]) => (
          <div key={l} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border p-[12px]" style={ITEM}>
            <span className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: l === "Hours" ? accent : "var(--foreground)" }}>{v}</span>
            <Muted className="text-[12px] leading-[16px]">{l}</Muted>
          </div>
        ))}
      </div>
      {row.quiet && <Item className="flex items-start gap-[10px]"><AlertTriangle className="mt-[2px] h-4 w-4 flex-none" aria-hidden style={{ color: "var(--world-business-money-office)" }} /><span className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>No contact in 30 days. The program lead is nudged automatically; you can also message the mentor.</span></Item>}
      <div className="flex gap-[8px]">
        <PrimaryCta size="sm" onClick={onClose}><MessageCircle className="h-4 w-4" aria-hidden /> Message mentor</PrimaryCta>
        <QuietCta size="sm" onClick={onClose}>View full profile</QuietCta>
      </div>
    </Sheet>
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
const PREP_CARD = "dm-tap group relative flex h-[240px] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left";

function PrepFoot({ label, title, why, cta, tone }: { label: string; title: string; why: string; cta: string; tone?: string }) {
  return (
    <span className="relative z-[1] flex flex-col gap-[4px] px-[16px] pt-[56px] pb-[14px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
      <span className="text-[10.5px] leading-[14px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone ?? accent }}>{label}</span>
      <span className="text-[18px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{title}</span>
      <span className="text-[12.5px] leading-[17px]" style={{ color: "rgba(255,255,255,0.78)" }}>{why}</span>
      <span className="mt-[6px] flex items-center gap-[4px] text-[13px] font-bold" style={{ color: "#FFFFFF" }}>{cta} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
    </span>
  );
}

function CareerPrepCard({ onClick }: { onClick: () => void }) {
  const c = D.PREP_CAREER;
  return (
    <button type="button" onClick={onClick} className={PREP_CARD} style={{ borderColor: "var(--glass-border)" }}>
      <Image src={c.photo} alt="" fill sizes="(min-width: 640px) 33vw, 260px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ objectPosition: "50% 30%" }} />
      <PrepFoot label={c.label} title={c.title} why={c.why} cta={c.cta} tone={WORLD_COLORS[c.world]} />
    </button>
  );
}

function PlayPrepCard({ onClick }: { onClick: () => void }) {
  const p = D.PREP_PLAY;
  return (
    <button type="button" onClick={onClick} className={PREP_CARD} style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      <Image src={p.cover} alt="" fill sizes="(min-width: 640px) 33vw, 260px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <span className="absolute top-[14px] right-[14px] z-[2] flex size-[38px] items-center justify-center rounded-full" style={{ background: "var(--primary)", color: "#FFFFFF", boxShadow: "0 8px 20px -8px rgba(0,0,0,0.6)" }}>
        <Play className="ml-[2px] h-[16px] w-[16px]" fill="currentColor" aria-hidden />
      </span>
      <PrepFoot label={p.label} title={p.title} why={p.why} cta={p.cta} tone={WORLD_COLORS[p.world]} />
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
  return (
    <button type="button" onClick={onClick} className={PREP_CARD} style={{ borderColor: "var(--glass-border)", background: "#FFFFFF" }}>
      <span className="pointer-events-none absolute inset-x-0 top-0 block" aria-hidden>
        <ResumeDocument resume={data} templateId={DEFAULT_RESUME_TEMPLATE} sectionOrder={latest?.sectionOrder} hiddenSections={latest?.hiddenSections} sectionOverrides={latest?.sectionOverrides} />
      </span>
      <span className="relative z-[1] flex items-center gap-[10px] px-[14px] pt-[56px] pb-[14px]" style={{ background: "linear-gradient(to top, rgba(8,10,22,0.97) 0%, rgba(8,10,22,0.9) 60%, rgba(8,10,22,0) 100%)" }}>
        <span className="flex size-[34px] flex-none items-center justify-center rounded-[8px]" style={{ background: "rgba(255,255,255,0.12)", color: "#FFFFFF" }}><FileText className="h-4 w-4" aria-hidden /></span>
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[10.5px] leading-[14px] font-extrabold tracking-[0.08em] uppercase" style={{ color: accent }}>{D.PREP_RESUME.label}</span>
          <span className="truncate text-[15px] leading-[19px] font-extrabold" style={{ color: "#FFFFFF", fontFamily: "var(--font-display)" }}>{name}</span>
          <span className="text-[12.5px] leading-[17px]" style={{ color: "rgba(255,255,255,0.78)" }}>{D.PREP_RESUME.why}</span>
          <span className="mt-[4px] flex items-center gap-[4px] text-[13px] font-bold" style={{ color: "#FFFFFF" }}>{D.PREP_RESUME.cta} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
        </span>
      </span>
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
          {/* My mentor and Next meeting share one row from md up (direct
             feedback, 19 Sept 2026: side by side, not stacked full width) */}
          <div className="grid gap-[var(--space-5)] md:grid-cols-2">
          <ClickPanel onClick={onOpenProfile} label={`Open ${D.MENTOR.name}'s profile`} className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
            <div className="flex items-center gap-[14px]">
              <Avatar name={D.MENTOR.name} size={56} photo={D.MENTOR.photo} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <Eyebrow>My mentor</Eyebrow>
                <span className="flex items-center gap-[6px] text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.MENTOR.name} <VerifiedBadge size={16} /></span>
                <Muted>{D.MENTOR.title} · {D.MENTOR.org}</Muted>
              </div>
            </div>
            <PrimaryCta size="sm" className={`${ABOVE} mr-[28px]`} onClick={openChat}><MessageCircle className="h-4 w-4" aria-hidden /> Message Mentor</PrimaryCta>
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
          <ClickPanel onClick={onOpenProfile} label={`Open ${D.MENTEE.name}'s profile`} className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
            <div className="flex items-center gap-[14px]">
              <Avatar name={D.MENTEE.name} size={56} photo={studentAvatarSrc(D.MENTEE.name)} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <Eyebrow>My mentee</Eyebrow>
                <span className="flex items-center gap-[6px] text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.MENTEE.name} <VerifiedBadge size={16} /></span>
                <Muted>{D.MENTEE.line}</Muted>
              </div>
            </div>
            <PrimaryCta size="sm" className={`${ABOVE} mr-[28px]`} onClick={openChat}><MessageCircle className="h-4 w-4" aria-hidden /> Message</PrimaryCta>
          </ClickPanel>

          <div className="grid gap-[var(--space-5)] md:grid-cols-2">
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

const KPI_ICON = { hours: Timer, students: GraduationCap, mentors: Users, meetings: Handshake } as const;

function EnterpriseView({ sub, setSub, onOpenMentor }: { sub: string; setSub: (s: string) => void; onOpenMentor: (row: D.PairActivity) => void }) {
  const tab = (["overview", "countries", "settings"].includes(sub) ? sub : "overview") as "overview" | "countries" | "settings";
  const setTab = (t: "overview" | "countries" | "settings") => setSub(t);
  const [sheet, setSheet] = useState<{ kind: "kpi"; key: D.Kpi["key"] } | { kind: "goals" } | { kind: "impact"; key: string } | { kind: "pairs" } | { kind: "cohort"; start: number } | null>(null);
  const [period, setPeriod] = useState<"month" | "year">("year");
  const [grain, setGrain] = useState<"monthly" | "weekly">("monthly");
  const [program, setProgram] = useState<D.ProgramId>("all");
  const [exporting, setExporting] = useState(false);
  const [toast, onToast] = useToast();
  const selected = D.PROGRAMS.find((p) => p.id === program) ?? null;

  const monthly = selected ? selected.monthly : D.MONTHS.map((_, i) => D.PROGRAMS.reduce((a, p) => a + p.monthly[i], 0));
  const values = period === "month" ? D.THIS_MONTH_WEEKS : grain === "monthly" ? monthly : D.THIS_YEAR_WEEKS;
  const labels = period === "month" ? ["Wk 1", "Wk 2", "Wk 3", "Wk 4"] : grain === "monthly" ? [...D.MONTHS] : D.THIS_YEAR_WEEKS.map((_, i) => `W${i + 1}`);
  const lastYear = grain === "monthly" && period === "year" ? monthly.map((v) => Math.round(v * 0.86)) : undefined;
  const hoursTotal = values.reduce((a, b) => a + b, 0);
  const onTrackPairs = D.MEETINGS_PER_PAIR.slice(2).reduce((a, r) => a + r.pairs, 0);
  const allPairs = D.MEETINGS_PER_PAIR.reduce((a, r) => a + r.pairs, 0);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="w-full sm:w-fit"><Segmented grow ariaLabel="Enterprise sections" value={tab} onChange={setTab} options={[{ key: "overview", label: "Overview" }, { key: "countries", label: "Regions" }, { key: "settings", label: "Settings" }]} /></div>

      {tab === "overview" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <SectionHead>{selected ? selected.name : "Global impact"}</SectionHead>
            <div className="flex flex-wrap items-center gap-[8px]">
              <Segmented ariaLabel="Period" value={period} onChange={setPeriod} options={[{ key: "month", label: "This Month" }, { key: "year", label: "This Year" }]} />
              <QuietCta size="sm" onClick={() => setExporting(true)}><Download className="h-4 w-4" aria-hidden /> Export</QuietCta>
            </div>
          </div>
          {/* the region, one tap: every number below follows it */}
          <div className="w-full sm:w-fit">
            <Segmented grow ariaLabel="Region" value={program} onChange={setProgram} options={[{ key: "all" as D.ProgramId, label: "All regions" }, ...D.PROGRAMS.map((p) => ({ key: p.id as D.ProgramId, label: p.name }))]} />
          </div>

          <Panel className="grid grid-cols-2 !p-0 sm:grid-cols-4">
            {D.KPIS.map((k, i) => {
              const Icon = KPI_ICON[k.key];
              // a region's share of the global figure, with its own hours curve
              const regionValue = selected ? (k.key === "hours" ? selected.hours : k.key === "students" ? selected.students : k.key === "mentors" ? selected.mentors : Math.round(selected.hours * 0.18)) : null;
              const ratio = regionValue !== null ? regionValue / k.year : 1;
              const value = regionValue !== null ? (period === "year" ? regionValue : Math.round(k.month * ratio)) : period === "year" ? k.year : k.month;
              const delta = period === "year" ? k.deltaYear : k.deltaMonth;
              const spark = selected && k.key === "hours" ? selected.monthly : k.spark.map((v) => Math.round(v * ratio));
              return (
                <button key={k.key} type="button" onClick={() => setSheet({ kind: "kpi", key: k.key })} className={`dm-quiet group relative flex cursor-pointer flex-col gap-[10px] text-left ${ruledCell(i, 4)}`} style={{ borderColor: RULE }}>
                  <HoverChevron className="top-[14px] right-[12px]" />
                  <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><Icon className="h-3.5 w-3.5" aria-hidden style={{ color: accent }} /> {k.label}</span>
                  <span className="flex items-baseline gap-[8px]">
                    <span className="text-[26px] leading-[30px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{compact(value)}</span>
                    <span className="text-[12px] leading-[16px] font-bold tabular-nums" style={{ color: GOOD }}>+{delta}%</span>
                  </span>
                  <Sparkline values={spark} accent={accent} />
                </button>
              );
            })}
          </Panel>

          <Panel className="flex flex-col gap-[var(--space-3)]">
            <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
              <Title>Volunteer hours <span className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{compact(hoursTotal)} {period === "month" ? "this month" : "this year"}</span></Title>
              {period === "year" && <Segmented ariaLabel="Chart grain" value={grain} onChange={setGrain} options={[{ key: "monthly", label: "Monthly" }, { key: "weekly", label: "Weekly" }]} />}
            </div>
            <BarChart values={values} labels={labels} accent={accent} highlight={values.length - 1} compare={lastYear} height={240} ariaLabel={`Volunteer hours by ${period === "month" ? "week" : grain === "monthly" ? "month" : "week"}`} />
            <Muted className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px] text-[12px] leading-[16px]">
              {lastYear && <span className="flex items-center gap-[5px]"><span aria-hidden className="inline-block h-[10px] w-[14px] rounded-[3px] border border-dashed" style={{ borderColor: "rgba(255,255,255,0.4)" }} /> Last year</span>}
              <span>{D.REPORTING_NOTE}</span>
              <button type="button" onClick={() => setTab("settings")} className="dm-link cursor-pointer font-bold" style={{ color: accent }}>Hour rules</button>
            </Muted>
          </Panel>

          <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
            <ClickPanel onClick={() => setSheet({ kind: "goals" })} label="2030 goals, details" className="flex flex-col gap-[var(--space-4)]">
              <Title className="flex items-center gap-[8px]"><Target className="h-4 w-4" aria-hidden style={{ color: accent }} /> 2030 goals</Title>
              {D.GOALS.map((g) => (
                <div key={g.key} className="flex flex-col gap-[8px] border-t pt-[var(--space-3)] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
                  <span className="flex flex-wrap items-baseline justify-between gap-[6px]">
                    <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{g.title}</span>
                    <Muted className="text-[12px] leading-[16px]">{g.scope}</Muted>
                  </span>
                  <GoalTrack logged={g.logged} target={g.target} pace={g.pace} accent={accent} unit={g.unit} />
                </div>
              ))}
            </ClickPanel>

            <Panel className="flex flex-col gap-[var(--space-4)]">
              <Title>Student impact <span className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{selected && selected.id !== "us" ? "· United States scholars" : ""}</span></Title>
              <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
                {D.IMPACT.map((m) => (
                  <button key={m.key} type="button" onClick={() => setSheet({ kind: "impact", key: m.key })} className="dm-quiet group relative flex cursor-pointer flex-col items-center gap-[8px] rounded-[var(--radius-md)] p-[6px] text-center">
                    <Ring pct={m.pct} size={84} stroke={7} accent={accent}>
                      <span className="text-[18px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.pct}%</span>
                    </Ring>
                    <span className="text-[12.5px] leading-[16px] font-semibold text-balance" style={{ color: "var(--foreground)" }}>{m.label}</span>
                    <span className="text-[11.5px] leading-[14px] font-bold tabular-nums" style={{ color: GOOD }}>+{m.delta} pts</span>
                  </button>
                ))}
              </div>
              {/* the outcome the partner actually reports on */}
              <div className="grid grid-cols-2 gap-[var(--space-3)] border-t pt-[var(--space-3)]" style={{ borderColor: RULE }}>
                {D.OUTCOMES.map((o) => (
                  <div key={o.value} className="flex flex-col gap-[2px]">
                    <span className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{o.value}</span>
                    <Muted className="text-[12.5px] leading-[17px]">{o.label}</Muted>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setSheet({ kind: "pairs" })} className="dm-quiet group relative flex cursor-pointer flex-col gap-[6px] border-t pt-[var(--space-3)] text-left" style={{ borderColor: RULE }}>
                <HoverChevron className="top-[14px] right-0" />
                <span className="flex items-baseline justify-between gap-[10px] pr-[24px]">
                  <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>Meetings completed per pair</span>
                  <span className="text-[12.5px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}><strong style={{ color: "var(--foreground)" }}>{Math.round((onTrackPairs / allPairs) * 100)}%</strong> met twice or more</span>
                </span>
                <Histogram values={D.MEETINGS_PER_PAIR.map((r) => r.pairs)} labels={D.MEETINGS_PER_PAIR.map((r) => r.label)} accent={accent} emphasisFrom={2} height={110} ariaLabel="Pairs by number of required meetings completed" />
              </button>
            </Panel>
          </div>

          {/* activity without reading a word: what counts, who has gone quiet */}
          <Panel className="flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
              <Title>Mentor activity <span className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{selected && selected.id !== "us" ? "· United States pairs" : ""}</span></Title>
              <Muted className="text-[12px] leading-[16px]">Messages and meetings become hours under the hour rules. Content is never read.</Muted>
            </div>
            <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
                <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(3,72px)_110px] gap-x-[var(--space-3)] pb-[6px] text-[11px] leading-[15px] font-extrabold tracking-[0.06em] uppercase sm:grid" style={{ color: "var(--muted-foreground)" }}>
                  <span>Pair</span><span className="text-right">Messages</span><span className="text-right">Meetings</span><span className="text-right">Hours</span><span className="text-right">Last contact</span>
                </div>
                {D.PAIR_ACTIVITY.map((row) => (
                  <button key={row.mentor} type="button" onClick={() => onOpenMentor(row)} className="dm-quiet group relative -mx-[8px] grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[var(--space-3)] gap-y-[4px] rounded-[var(--radius-sm)] px-[8px] py-[10px] text-left sm:grid-cols-[minmax(0,1.6fr)_repeat(3,72px)_110px]" style={{ borderColor: RULE }}>
                    <span className="flex min-w-0 items-center gap-[10px]">
                      <span className="flex min-w-0 flex-col"><span className="flex items-center gap-[4px] truncate text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{row.mentor} <ChevronRight className="h-3.5 w-3.5 flex-none opacity-0 transition-all duration-150 group-hover:translate-x-[2px] group-hover:opacity-100" aria-hidden style={{ color: "var(--muted-foreground)" }} /></span><span className="truncate text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>with {row.mentee}</span></span>
                    </span>
                    <span className="text-right text-[12.5px] leading-[17px] font-semibold tabular-nums sm:order-last" style={{ color: row.quiet ? "var(--world-business-money-office)" : "var(--muted-foreground)" }}>{row.quiet && <AlertTriangle className="mr-[4px] inline h-3.5 w-3.5" aria-hidden />}{row.lastContact}</span>
                    <span className="hidden text-right text-[14px] font-semibold tabular-nums sm:block" style={{ color: "var(--foreground)" }}>{row.messages}</span>
                    <span className="hidden text-right text-[14px] font-semibold tabular-nums sm:block" style={{ color: "var(--foreground)" }}>{row.meetings}</span>
                    <span className="hidden text-right text-[14px] font-extrabold tabular-nums sm:block" style={{ color: accent }}>{row.hours}h</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-[var(--space-4)] border-t pt-[var(--space-4)] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-[var(--space-4)]" style={{ borderColor: RULE }}>
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>Where mentors come from</span>
                  <ShareBar parts={D.MENTOR_MIX} accent={accent} />
                </div>
                {/* the mentors' own words, set like an insight card: the big
                   mark, the quote as the headline, the number as the line under it */}
                <div className="relative flex flex-1 flex-col justify-end gap-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)] pt-[var(--space-6)]" style={ITEM}>
                  <InsightMark color={accent} size={64} />
                  <blockquote className="text-[20px] leading-[26px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.MENTOR_PULSE.quote}</blockquote>
                  <span className="flex items-baseline gap-[6px] border-t pt-[10px]" style={{ borderColor: RULE }}>
                    <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: accent }}>{D.MENTOR_PULSE.pct}%</span>
                    <Muted className="text-[12.5px] leading-[17px]">{D.MENTOR_PULSE.line}</Muted>
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {tab === "countries" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>Regions</SectionHead>
          <Panel className="flex flex-col gap-[var(--space-4)]">
            <ShareBar parts={D.PROGRAMS.map((p) => ({ label: p.name, value: p.hours }))} accent={accent} />
            <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
              {D.PROGRAMS.map((p) => (
                <div key={p.id} role="button" tabIndex={0} onClick={() => { setProgram(p.id); setTab("overview"); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setProgram(p.id); setTab("overview"); } }} className="dm-quiet group -mx-[8px] grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-[var(--space-4)] gap-y-[8px] rounded-[var(--radius-sm)] px-[8px] py-[12px] sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(72px,0.6fr))_120px_auto]" style={{ borderColor: RULE }}>
                  <div className="flex min-w-0 flex-col gap-[2px]">
                    <span className="text-[15.5px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>{p.name}</span>
                    <Muted className="text-[12px] leading-[16px]">{p.window} · {p.cadence}</Muted>
                    <Muted className="text-[12px] leading-[16px]">Scholars via {p.via}</Muted>
                  </div>
                  <span className="flex items-center gap-[4px] text-[13px] font-bold sm:order-last" style={{ color: accent }}>View report <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
                  {([[p.students, "Students"], [p.mentors, p.mentorLabel], [p.hours, "Hours"]] as [number, string][]).map(([n, l]) => (
                    <span key={l} className="flex flex-col">
                      <span className="text-[17px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: l === "Hours" ? accent : "var(--foreground)" }}>{l === "Hours" ? compact(n) : n.toLocaleString("en-US")}</span>
                      <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</span>
                    </span>
                  ))}
                  <span className="col-span-2 flex items-center sm:col-span-1">
                    <Sparkline values={p.monthly} accent={accent} width={110} height={28} />
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* four years at once: the scholarship runs four years, so the
             read has to hold across cohorts, not one year at a time */}
          <Panel className="flex flex-col gap-[var(--space-3)]">
            <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
              <Title>US cohorts</Title>
              <Muted className="text-[12px] leading-[16px]">Four cohorts in the program at once. Still enrolled is the number the scholarship is for.</Muted>
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
              <div className="hidden grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(80px,0.7fr))] gap-x-[var(--space-3)] pb-[6px] text-[11px] leading-[15px] font-extrabold tracking-[0.06em] uppercase sm:grid" style={{ color: "var(--muted-foreground)" }}>
                <span>Cohort</span><span className="text-right">Scholars</span><span className="text-right">Still enrolled</span><span className="text-right">Meetings / yr</span><span className="text-right">Explored 3+</span><span className="text-right">Resume</span>
              </div>
              {D.COHORTS.map((c) => (
                <button key={c.start} type="button" onClick={() => setSheet({ kind: "cohort", start: c.start })} className="dm-quiet group -mx-[8px] grid cursor-pointer grid-cols-2 items-center gap-x-[var(--space-3)] gap-y-[4px] rounded-[var(--radius-sm)] px-[8px] py-[10px] text-left sm:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(80px,0.7fr))]" style={{ borderColor: RULE }}>
                  <span className="flex flex-col"><span className="flex items-center gap-[4px] text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>Class of {c.start + 4} <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-all duration-150 group-hover:translate-x-[2px] group-hover:opacity-100" aria-hidden style={{ color: "var(--muted-foreground)" }} /></span><span className="text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{c.year} · started {c.start}</span></span>
                  <span className="text-right text-[14px] font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{c.scholars}</span>
                  <span className="text-right text-[14px] font-extrabold tabular-nums" style={{ color: c.enrolled / c.scholars >= 0.95 ? GOOD : "var(--foreground)" }}>{Math.round((c.enrolled / c.scholars) * 100)}%</span>
                  <span className="hidden text-right text-[14px] font-semibold tabular-nums sm:block" style={{ color: "var(--foreground)" }}>{c.meetingsAvg}</span>
                  <span className="hidden text-right text-[14px] font-semibold tabular-nums sm:block" style={{ color: "var(--foreground)" }}>{c.explored}%</span>
                  <span className="hidden text-right text-[14px] font-semibold tabular-nums sm:block" style={{ color: "var(--foreground)" }}>{c.resume}%</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === "settings" && <SettingsView onToast={onToast} />}

      {sheet?.kind === "kpi" && (() => {
        const k = D.KPIS.find((x) => x.key === sheet.key)!;
        const per = D.PROGRAMS.map((p) => ({ label: p.name, value: sheet.key === "hours" ? p.hours : sheet.key === "students" ? p.students : sheet.key === "mentors" ? p.mentors : Math.round(p.hours * 0.18) }));
        return (
          <Sheet title={k.label} label="By program, this year" onClose={() => setSheet(null)}>
            <span className="flex items-baseline gap-[8px]"><span className="text-[30px] leading-[34px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{compact(k.year)}</span><span className="text-[13px] font-bold" style={{ color: GOOD }}>+{k.deltaYear}% vs last year</span><span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>· all regions</span></span>
            <ShareBar parts={per} accent={accent} />
            <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
              {per.map((r) => <div key={r.label} className="flex items-center justify-between py-[9px] text-[14px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><span>{r.label}</span><span className="font-bold tabular-nums">{r.value.toLocaleString("en-US")}</span></div>)}
            </div>
          </Sheet>
        );
      })()}
      {sheet?.kind === "goals" && (
        <Sheet title="2030 goals" label="How they are counted" onClose={() => setSheet(null)}>
          {D.GOALS.map((g) => (
            <div key={g.key} className="flex flex-col gap-[8px] border-t pt-[var(--space-3)] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
              <span className="text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{g.title} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {g.scope}</span></span>
              <GoalTrack logged={g.logged} target={g.target} pace={g.pace} accent={accent} unit={g.unit} />
              <Muted className="text-[12.5px] leading-[17px]">{g.key === "hours" ? "Hours counted through Dreamari under the program's hour rules. Pace is a straight line from program start to December 2030." : "Scholarships funded across all seven Dream It Real programs. Pace is a straight line from 2018 to 2030."}</Muted>
            </div>
          ))}
          <QuietCta size="sm" className="w-fit" onClick={() => { setSheet(null); setTab("settings"); }}>Hour rules <ChevronRight className="h-4 w-4" aria-hidden /></QuietCta>
        </Sheet>
      )}
      {sheet?.kind === "impact" && (() => {
        const m = D.IMPACT.find((x) => x.key === sheet.key)!;
        const col = sheet.key === "resume" ? "resume" : "explored";
        return (
          <Sheet title={m.label} label="Student impact" onClose={() => setSheet(null)}>
            <span className="flex items-baseline gap-[8px]"><span className="text-[30px] leading-[34px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.pct}%</span><span className="text-[13px] font-bold" style={{ color: GOOD }}>+{m.delta} pts vs last year</span></span>
            <Muted>{sheet.key === "graduate" ? "Coach Foundation's published Dream It Real outcome, all US cohorts." : "Share of US scholars, by cohort."}</Muted>
            {sheet.key !== "graduate" && sheet.key !== "simulation" && (
              <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
                {D.COHORTS.map((c) => <div key={c.start} className="flex items-center justify-between py-[9px] text-[14px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><span>Class of {c.start + 4} · {c.year}</span><span className="font-bold tabular-nums">{c[col]}%</span></div>)}
              </div>
            )}
          </Sheet>
        );
      })()}
      {sheet?.kind === "pairs" && (
        <Sheet title="Meetings completed per pair" label="450 US pairs" onClose={() => setSheet(null)}>
          <Muted>Three to four meetings are required each year. Two by now counts as on track.</Muted>
          <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
            {D.MEETINGS_PER_PAIR.map((r, i) => <div key={r.label} className="flex items-center justify-between py-[9px] text-[14px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><span>{r.label} {r.label === "1" ? "meeting" : "meetings"}{i < 2 ? " · needs a nudge" : ""}</span><span className="font-bold tabular-nums">{r.pairs} pairs</span></div>)}
          </div>
        </Sheet>
      )}
      {sheet?.kind === "cohort" && (() => {
        const c = D.COHORTS.find((x) => x.start === sheet.start)!;
        return (
          <Sheet title={`Class of ${c.start + 4}`} label={`${c.year} · started ${c.start}`} onClose={() => setSheet(null)}>
            <div className="grid grid-cols-3 gap-[var(--space-3)]">
              {([[c.scholars, "Scholars"], [`${Math.round((c.enrolled / c.scholars) * 100)}%`, "Still enrolled"], [c.meetingsAvg, "Meetings a year"]] as [number | string, string][]).map(([v, l]) => (
                <div key={l} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border p-[12px]" style={ITEM}><span className="text-[20px] leading-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v}</span><Muted className="text-[12px] leading-[16px]">{l}</Muted></div>
              ))}
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: RULE }}>
              <div className="flex items-center justify-between py-[9px] text-[14px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><span>Explored 3+ careers</span><span className="font-bold tabular-nums">{c.explored}%</span></div>
              <div className="flex items-center justify-between py-[9px] text-[14px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><span>Built or updated a resume</span><span className="font-bold tabular-nums">{c.resume}%</span></div>
              <div className="flex items-center justify-between py-[9px] text-[14px]" style={{ borderColor: RULE, color: "var(--foreground)" }}><span>Left the program</span><span className="font-bold tabular-nums">{c.scholars - c.enrolled}</span></div>
            </div>
          </Sheet>
        );
      })()}
      {exporting && (
        <Sheet title="Export report" label={selected ? selected.name : "All programs"} onClose={() => setExporting(false)}>
          <Muted>Figures for {period === "month" ? "this month" : "this year"}. Message content is never included.</Muted>
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
