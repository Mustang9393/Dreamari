"use client";

// DEMO-ONLY: the Career actions lab's shared UI (26 Sept 2026): the one
// feedback bar, the Saved / Top 3 drawers the bar's links open, the swap
// sheet (the app's own Top3SwapModal), the lab dock (network mode, reset),
// and the new controls both lab pages use. See labStore.ts for the rules.

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { TOAST_GLASS } from "@/components/app/Toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { savedHref, top3Href } from "@/components/profile/layoutVersion";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, ChevronRight, Loader2, RotateCcw, Sparkles, Undo2, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { Top3SwapModal } from "@/components/career/Top3SwapModal";
import { resolveCareer } from "@/components/career/data";
import { cancelSwap, openDrawer, resetLab, setBar, setNetwork, swapInto, toggleSave, toggleTop3, useLab, type Network } from "./labStore";
import { showTheWay } from "@/lib/showTheWay";

export const LAB_CAREER = (slug: string) => `/actions-lab/career/${slug}`;
/** The career page for the surface in play: the live one, or the lab's copy. */
export const careerHref = (slug: string, live: boolean) => (live ? `/career/${slug}` : LAB_CAREER(slug));
/** Whether these components are rendering the live routes (no dock, live
 *  links) or the lab's copies. The live pages wrap in LiveProvider. */
const LiveContext = createContext(false);
export const useLive = () => useContext(LiveContext);
export function LiveProvider({ children }: { children: ReactNode }) { return <LiveContext.Provider value={true}>{children}</LiveContext.Provider>; }
const titleOf = (id: string) => resolveCareer(id)?.title ?? id;
const photoOf = (id: string) => resolveCareer(id)?.photo ?? null;

/** Everything the lab pages share, mounted once per page. */
export const BAR_MS = 6000;

// A sheet owns feedback while it is mounted, including Profile's local peek.
let inlineFeedbackCount = 0;
const inlineFeedbackListeners = new Set<() => void>();
const inlineFeedbackSubscribe = (listener: () => void) => { inlineFeedbackListeners.add(listener); return () => { inlineFeedbackListeners.delete(listener); }; };
const inlineFeedbackSnapshot = () => inlineFeedbackCount > 0;
export function ModalActionFeedback() {
  useEffect(() => {
    inlineFeedbackCount++;
    inlineFeedbackListeners.forEach((listener) => listener());
    return () => { inlineFeedbackCount--; inlineFeedbackListeners.forEach((listener) => listener()); };
  }, []);
  return <ActionFeedback inline />;
}

/** `dock`: the lab's network-mode and reset dock. Off on the live routes,
 *  which render these same components (1 Oct 2026; Chandu: "push the
 *  updated Explore and Career Detail to the main flow, without the lab
 *  floating thing; keep the lab under Quick Links so we can keep iterating"). */
// One layer draws the bar, the swap sheet and the drawer, however many
// mount: the live pages mount their own and the sheet host mounts one for
// every other screen (8 Oct 2026, career sheets use the page's actions).
// The page's own layer wins, so its barAtTop placement holds.
const layers: { id: object; page: boolean }[] = [];
const layerListeners = new Set<() => void>();
const layerSubscribe = (l: () => void) => { layerListeners.add(l); return () => { layerListeners.delete(l); }; };
const layerOwner = () => (layers.find((x) => x.page) ?? layers[0])?.id ?? null;

export function LabLayer({ barAtTop = false, dock = true, host = false }: { /** the For You reel keeps its own CTAs at the bottom, so the bar shows at the top there */ barAtTop?: boolean; dock?: boolean; /** the sheet host's fallback layer, which yields to a page's own */ host?: boolean } = {}) {
  const lab = useLab();
  const [me] = useState(() => ({}));
  useEffect(() => {
    layers.push({ id: me, page: !host });
    layerListeners.forEach((l) => l());
    return () => { const i = layers.findIndex((x) => x.id === me); if (i >= 0) layers.splice(i, 1); layerListeners.forEach((l) => l()); };
  }, [me, host]);
  const owner = useSyncExternalStore(layerSubscribe, layerOwner, () => null);
  const inlineFeedback = useSyncExternalStore(inlineFeedbackSubscribe, inlineFeedbackSnapshot, () => false);
  return (
    <>
      {/* The counts pill (ListTray) is gone (Chandu, 1 Oct 2026: "it requires me to
         focus on two things happening at once in two locations... the one is
         better"): the bar alone says what happened, and its link is the way. */}
      {owner === me && !inlineFeedback && <ActionFeedback top={barAtTop} />}
      {owner === me && lab.swapFor && (
        <Top3SwapModal
          incomingId={lab.swapFor.id}
          currentIds={lab.top3}
          onConfirm={(outgoingId) => swapInto(outgoingId, titleOf(outgoingId))}
          onCancel={cancelSwap}
        />
      )}
      <AnimatePresence>{owner === me && lab.drawer && <Drawer kind={lab.drawer} />}</AnimatePresence>
      {dock && <LabDock />}
    </>
  );
}

/** What happened, where it went, how to undo it. One bar; a new action
 *  replaces it, never stacks. The Undo is a real button with its own icon,
 *  and a thin line drains under the bar for the time it stays, so the
 *  student can see how long they have (Gmail's "Undo send" and Google
 *  Photos' delete bar work the same way). */
function ActionFeedback({ top = false, inline = false }: { top?: boolean; inline?: boolean }) {
  const { bar } = useLab();
  const router = useRouter();
  const [hold, onHold] = useState(false);
  // Keep Undo reachable while the pointer or keyboard focus is here.
  useEffect(() => {
    if (!bar || bar.error || hold) return;
    const t = window.setTimeout(() => setBar(null), BAR_MS);
    return () => window.clearTimeout(t);
  }, [bar, hold]);
  return (
    <div className={inline ? "cpk-action-feedback" : `pointer-events-none fixed inset-x-0 z-[128] flex justify-center px-4 ${top ? "top-[112px] lg:top-[132px]" : "bottom-[92px] lg:bottom-6"}`}>
      <AnimatePresence mode="wait">
        {bar && (
          <motion.div key={bar.id} role="status" onPointerEnter={() => onHold(true)} onPointerLeave={() => onHold(false)} onFocus={() => onHold(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onHold(false); }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className={`pointer-events-auto relative flex max-w-full items-center gap-3 overflow-hidden border py-2 pr-2 pl-4 ${inline ? "cpk-action-feedback-bar rounded-xl" : "rounded-full"}`} style={{ ...TOAST_GLASS, borderColor: bar.error ? "color-mix(in srgb, #E0453C 60%, rgba(255,255,255,0.16))" : TOAST_GLASS.borderColor }}>
            {bar.error ? <X className="h-4 w-4 flex-none" aria-hidden style={{ color: "#E0453C" }} /> : <Check className="h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: "var(--color-feedback-success)" }} />}
            <span className={`min-w-0 text-[13.5px] font-semibold ${inline ? "cpk-action-feedback-text flex-1" : "truncate"}`}>{bar.text}</span>
            {bar.undo && <button type="button" onClick={() => { onHold(false); bar.undo!(); }} className="flex flex-none cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[12.5px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--foreground) 45%, transparent)", color: "var(--foreground)" }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
            {/* Goes to the real page, in the Profile layout being shown
               (v1 Saved view, v2 Saved tab, v3 under Top 3). */}
            {bar.link && <button type="button" onClick={() => { onHold(false); const to = bar.link!.open === "saved" ? savedHref() : top3Href(); setBar(null); showTheWay(router, to); }} className="flex flex-none cursor-pointer items-center gap-0.5 rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{bar.link.label} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>}
            {bar.retry && <button type="button" onClick={() => { onHold(false); setBar(null); bar.retry!(); }} className="flex-none cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Try again</button>}
            <IconTip label="Dismiss"><button type="button" aria-label="Dismiss" onClick={() => { onHold(false); setBar(null); }} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button></IconTip>
            {!bar.error && (
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
                <span key={hold ? "hold" : "run"} className="block h-full origin-left" style={{ background: "var(--primary)", animation: hold ? "none" : `dm-bar-drain ${BAR_MS}ms linear forwards`, transform: hold ? "scaleX(1)" : undefined }} />
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes dm-bar-drain { from { transform: scaleX(1); } to { transform: scaleX(0); } } @keyframes dm-tray-bump { 0% { transform: scale(1); } 35% { transform: scale(1.18); } 100% { transform: scale(1); } } @keyframes dm-tray-ring { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 70%, transparent); } 100% { box-shadow: 0 0 0 14px transparent; } } @media (prefers-reduced-motion: reduce) { [data-tray-bump] { animation: none !important; } }`}</style>
    </div>
  );
}

/** Where saved things GO: Saved and Top 3 as two counts in one pill,
 *  like a cart icon. It shows only when something happens (Chandu, 30 Sept
 *  2026: "only display when an action happens and then make it go away"):
 *  a save slides it in, the career's photo flies from the tap into its
 *  count, the count bumps, and it leaves with the feedback bar. A tap on
 *  either count while it is up opens that list. (Amazon's cart, Pinterest's
 *  "Saved to board" fly-in.) */
export function ListTray({ top = false }: { top?: boolean }) {
  const lab = useLab();
  const savedRef = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLButtonElement>(null);
  const [bump, setBump] = useState<{ kind: "saved" | "top3"; id: number } | null>(null);
  const [flight, setFlight] = useState<{ id: number; kind: "saved" | "top3"; photo: string | null; from: { x: number; y: number }; to: { x: number; y: number } } | null>(null);
  const [linger, setLinger] = useState(false);
  // In a landing: show the tray first, then measure its count on the next
  // frame and launch the flight at it.
  useEffect(() => {
    const l = lab.landed;
    if (!l) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the tray follows the store's landing events
    setLinger(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raf = window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = (l.kind === "saved" ? savedRef : topRef).current;
      if (!target || !l.from || reduce) { setBump({ kind: l.kind, id: l.id }); return; }
      const r = target.getBoundingClientRect();
      setFlight({ id: l.id, kind: l.kind, photo: photoOf(l.career), from: l.from, to: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
    }));
    return () => window.cancelAnimationFrame(raf);
  }, [lab.landed]);
  // Any bar (a remove, an undo) brings it up too; it leaves a beat after
  // the bar does.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the tray follows the store's bar
    if (lab.bar && !lab.bar.error) { setLinger(true); return; }
    if (flight) return;
    const t = window.setTimeout(() => setLinger(false), 700);
    return () => window.clearTimeout(t);
  }, [lab.bar, flight]);
  const visible = linger || !!flight;
  const pill = "flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold";
  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div key="tray" initial={{ opacity: 0, y: top ? -8 : 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: top ? -6 : 6, scale: 0.97 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className={`fixed z-[89] flex items-center gap-1 rounded-full border p-1 shadow-lg backdrop-blur-xl ${top ? "top-[160px] right-3 lg:top-[132px] lg:right-6" : "top-[64px] right-3 lg:top-auto lg:right-6 lg:bottom-6"}`} style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 92%, transparent)", color: "var(--foreground)" }}>
            <button ref={savedRef} type="button" onClick={() => openDrawer("saved")} aria-label={`Saved, ${lab.saved.length} careers. Open`} className={`dm-quiet ${pill}`}>
              <Bookmark className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--accent-subtle)" }} />
              Saved
              <span key={bump?.kind === "saved" ? bump.id : "s"} data-tray-bump className="flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11.5px] tabular-nums" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", animation: bump?.kind === "saved" ? "dm-tray-bump .45s ease-out, dm-tray-ring .8s ease-out" : undefined }}>{lab.saved.length}</span>
            </button>
            <span aria-hidden className="h-5 w-px" style={{ background: "var(--glass-border)" }} />
            <button ref={topRef} type="button" onClick={() => openDrawer("top3")} aria-label={`Top 3, ${lab.top3.length} of 3. Open`} className={`dm-quiet ${pill}`}>
              <Top3Glyph on={lab.top3.length === 3} size={15} />
              Top 3
              <span key={bump?.kind === "top3" ? bump.id : "t"} data-tray-bump className="flex items-center justify-center rounded-full px-1.5 text-[11.5px] tabular-nums" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", animation: bump?.kind === "top3" ? "dm-tray-bump .45s ease-out, dm-tray-ring .8s ease-out" : undefined }}>{lab.top3.length}/3</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flight && (
          <motion.span
            key={flight.id}
            aria-hidden
            className="pointer-events-none fixed z-[96] overflow-hidden rounded-[8px] border-2 shadow-xl"
            style={{ left: 0, top: 0, width: 44, height: 58, borderColor: "#fff", background: "var(--primary)" }}
            initial={{ x: flight.from.x - 22, y: flight.from.y - 29, scale: 1, opacity: 1 }}
            animate={{ x: [flight.from.x - 22, (flight.from.x + flight.to.x) / 2 - 22, flight.to.x - 22], y: [flight.from.y - 29, Math.min(flight.from.y, flight.to.y) - 90, flight.to.y - 29], scale: [1, 0.9, 0.35], opacity: [1, 1, 0.2] }}
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => { setBump({ kind: flight.kind, id: flight.id }); setFlight(null); }}
          >
            {flight.photo && <Image src={flight.photo} alt="" fill sizes="44px" className="object-cover" />}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}

/** Where things went: Saved and the Top 3, with their empty states. In the
 *  app these are My Profile's Saved and Top Three; the lab shows its own
 *  because it never writes the real ones. */
function Drawer({ kind }: { kind: "saved" | "top3" }) {
  const lab = useLab();
  const close = () => openDrawer(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="marketing-v2 themeable fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6" style={{ background: "rgba(5,7,15,0.6)" }} onClick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog" aria-modal="true" aria-label={kind === "saved" ? "Saved careers" : "Your Top 3"}>
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="relative flex max-h-[80dvh] w-full max-w-[460px] flex-col gap-3 overflow-y-auto rounded-t-[var(--radius-xl)] border p-5 sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
        <button type="button" aria-label="Close" onClick={close} className="dm-quiet absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>
        <h3 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{kind === "saved" ? `Saved (${lab.saved.length})` : "Your Top 3"}</h3>
        <p className="-mt-2 text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{kind === "saved" ? "Everything you saved. Your Top 3 is picked from here." : "Your three to compare, picked from Saved."}</p>
        {kind === "top3" ? (
          <ul className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => {
              const id = lab.top3[i];
              return (
                <li key={i} className="flex items-center gap-3 rounded-[var(--radius-md)] border p-2" style={{ borderColor: "var(--glass-border)", borderStyle: id ? "solid" : "dashed" }}>
                  {id ? <>
                    <Thumb id={id} />
                    <Link href={LAB_CAREER(id)} onClick={close} className="dm-link min-w-0 flex-1 truncate text-[14px] font-bold">#{i + 1} {titleOf(id)}</Link>
                    {/* Remove is a labeled button, not a hidden gesture; it
                       says where the career goes. */}
                    <button type="button" onClick={() => toggleTop3(id, titleOf(id))} className="dm-quiet flex h-8 flex-none cursor-pointer items-center gap-1 rounded-full border px-2.5 text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}><X className="h-3.5 w-3.5" aria-hidden />Take out</button>
                  </> : <span className="px-2 py-3 text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>#{i + 1} is open. Add from Saved or any career page.</span>}
                </li>
              );
            })}
          </ul>
        ) : null}
        {kind === "top3" && <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Taking one out keeps it in Saved.</p>}
        {kind === "top3" ? null : lab.saved.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed px-4 py-6 text-center text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Nothing saved yet. Tap Save on any career.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {lab.saved.map((id) => {
              const rank = lab.top3.indexOf(id);
              return (
                <li key={id} className="relative">
                  <Link href={LAB_CAREER(id)} onClick={close} className="relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: rank >= 0 ? "var(--primary)" : "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                    {photoOf(id) && <Image src={photoOf(id)!} alt="" fill sizes="120px" className="object-cover" />}
                    <span className="absolute inset-x-0 bottom-0 p-1.5 text-[10.5px] leading-[12px] font-bold text-white" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>{titleOf(id)}</span>
                    {rank >= 0 && <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: "var(--primary)" }}>{rank + 1}</span>}
                  </Link>
                  {/* Always visible (touch has no hover), top right. */}
                  <IconTip label="Remove from Saved">
                    <button type="button" aria-label={`Remove ${titleOf(id)} from Saved`} onClick={() => toggleSave(id, titleOf(id))} className="absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(5,7,15,0.72)", color: "#fff" }}><X className="h-3.5 w-3.5" aria-hidden /></button>
                  </IconTip>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}

function Thumb({ id }: { id: string }) {
  const p = photoOf(id);
  return <span className="relative h-12 w-9 flex-none overflow-hidden rounded-[6px]" style={{ background: "var(--glass-surface-2)" }}>{p && <Image src={p} alt="" fill sizes="36px" className="object-cover" />}</span>;
}

/** The lab's only chrome: it says it is the lab, and lets a reviewer set the
 *  network to see loading and failed states, or reset to the real data. On
 *  phones it is one small "Lab" chip that opens a compact menu (the full
 *  row across the top of the reel covered the screen, 26 Sept 2026). */
function LabDock() {
  const { network } = useLab();
  const [open, setOpen] = useState(false);
  const opts: { key: Network; label: string }[] = [{ key: "normal", label: "Normal" }, { key: "slow", label: "Slow" }, { key: "fail", label: "Fails" }];
  const choices = (after?: () => void) => (
    <>
      {opts.map((o) => (
        <button key={o.key} type="button" aria-pressed={network === o.key} onClick={() => { setNetwork(o.key); after?.(); }} className="cursor-pointer rounded-full px-2.5 py-1" style={{ background: network === o.key ? "var(--primary)" : "transparent", color: network === o.key ? "var(--primary-foreground)" : "var(--foreground)" }}>{o.label}</button>
      ))}
      <button type="button" aria-label="Reset the lab to your real saves" title="Reset to your real saves" onClick={() => { resetLab(); after?.(); }} className="dm-quiet flex size-7 cursor-pointer items-center justify-center rounded-full"><RotateCcw className="h-3.5 w-3.5" aria-hidden /></button>
    </>
  );
  const shell = { borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 90%, transparent)", color: "var(--foreground)" } as const;
  return (
    <>
      {/* Desktop: the full row. */}
      <div className="fixed top-[84px] right-6 z-[91] hidden h-9 items-center gap-1 rounded-full border p-1 pl-3 text-[11.5px] font-bold shadow-lg backdrop-blur-xl lg:flex" style={shell}>
        <span className="mr-1 tracking-[0.08em] uppercase" style={{ color: "var(--primary)" }}>Actions lab</span>
        <span style={{ color: "var(--muted-foreground)" }}>Network</span>
        {choices()}
      </div>
      {/* Phones and tablets: one chip, a menu on tap. Solid, no backdrop
         blur and a fixed height: iPhone Safari stretched the blurred dock
         into a screen-tall pill over the reel (direct report, 26 Sept 2026). */}
      {/* Top left, under the For You / Browse all header: at the bottom it
         sat on top of the reel's Play Game button. */}
      <div className="fixed top-[64px] left-3 z-[91] flex h-auto flex-col items-start gap-2 lg:hidden">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold tracking-[0.06em] uppercase shadow-lg" style={{ ...shell, background: "var(--card)", color: "var(--primary)" }}>
          Lab{network !== "normal" && <span className="normal-case tracking-normal" style={{ color: "var(--foreground)" }}>· {network === "slow" ? "Slow" : "Fails"}</span>}
        </button>
        {open && (
          <div className="flex h-9 items-center gap-1 rounded-full border p-1 text-[11.5px] font-bold shadow-lg" style={{ ...shell, background: "var(--card)" }}>
            {choices(() => setOpen(false))}
          </div>
        )}
      </div>
    </>
  );
}

/** Top 3's glyph: a "3" in a rounded square, a check once in. A bare + / -
 *  read as "expand" or "zoom", not "my Top 3". */
/** `soft`: a see-through fill with a light check when on, for the career
 *  header's quiet strip (3 Oct 2026: "the fill should be a little
 *  transparent when they are tapped or activated"). */
export function Top3Glyph({ on, size = 18, soft = false }: { on: boolean; size?: number; soft?: boolean }) {
  return (
    <span aria-hidden className="flex flex-none items-center justify-center rounded-[5px] border-2 font-extrabold" style={{ width: size, height: size, fontSize: size * 0.52, lineHeight: 1, borderColor: "currentColor", background: on ? (soft ? "color-mix(in srgb, currentColor 35%, transparent)" : "currentColor") : "transparent" }}>
      {on ? <Check style={{ width: size * 0.62, height: size * 0.62, color: soft ? "currentColor" : "#0b0d18" }} strokeWidth={3.5} /> : <span style={{ fontFamily: "var(--font-display)" }}>3</span>}
    </span>
  );
}

/** A labeled action pill for the career page: says what it does, and what
 *  state it is in. */
export function LabPill({ children, onClick, icon, primary = false, on = false, busy = false, small = false, ariaLabel, offLabel, pulse = false, joined }: { children: ReactNode; onClick: () => void; icon?: ReactNode; primary?: boolean; on?: boolean; busy?: boolean; small?: boolean; ariaLabel?: string; /** what the pill does when on, shown on hover and focus ("Remove"), the GitHub Star / Unstar pattern */ offLabel?: string; /** a soft ring when this is the suggested next step */ pulse?: boolean; /** inside a JoinedPills: which end */ joined?: "start" | "end" }) {
  const [peek, setPeek] = useState(false);
  // The reverse action shows only on a fresh hover: right after tapping
  // Save, the pointer is still on it, and "Remove" there would read as if
  // the tap failed (GitHub's Star/Unstar waits for the pointer to leave).
  const armed = useRef(true);
  const showOff = on && !!offLabel && peek && !busy;
  const radius = joined === "start" ? "var(--radius-md) 0 0 var(--radius-md)" : joined === "end" ? "0 var(--radius-md) var(--radius-md) 0" : undefined;
  return (
    <motion.button
      onPointerEnter={(e) => { if (e.pointerType === "mouse" && armed.current) setPeek(true); }}
      onPointerLeave={() => { setPeek(false); armed.current = true; }}
      onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setPeek(true); }}
      onBlur={() => setPeek(false)}
      type="button"
      aria-label={ariaLabel}
      aria-pressed={on}
      aria-busy={busy}
      onClick={() => { armed.current = false; setPeek(false); onClick(); }}
      disabled={busy}
      whileTap={{ scale: 0.96 }}
      className={`relative flex cursor-pointer items-center gap-[8px] border font-semibold whitespace-nowrap disabled:cursor-wait ${joined ? "" : "rounded-[var(--radius-md)]"} ${joined === "end" ? "-ml-px" : ""} ${small ? "min-h-[40px] px-[14px] text-[14px]" : "min-h-[44px] px-[var(--space-5)] text-[15px]"}`}
      style={{
        borderRadius: radius,
        animation: pulse && !on ? "dm-tray-ring 1.6s ease-out 3" : undefined,
        ...(showOff ? { background: "color-mix(in srgb, #E0453C 22%, rgba(12,16,35,0.6))", borderColor: "color-mix(in srgb, #E0453C 60%, transparent)", color: "#fff" } : {}),
        background: primary && !on ? "color-mix(in srgb, var(--primary) 32%, rgba(12,16,35,0.6))" : on ? "color-mix(in srgb, var(--primary) 26%, rgba(12,16,35,0.6))" : "rgba(12,16,35,0.55)",
        borderColor: primary && !on ? "color-mix(in srgb, var(--primary) 45%, transparent)" : on ? "color-mix(in srgb, var(--accent-subtle) 70%, transparent)" : "rgba(255,255,255,0.3)",
        color: "#fff",
      }}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : showOff ? <X className="h-4 w-4" aria-hidden /> : icon}
      {showOff ? offLabel : children}
    </motion.button>
  );
}

/** A reel action: the icon with a one-word label under it, the way every
 *  reel app does it. */
export function ReelAction({ label, on, busy, ariaLabel, onClick, children }: { label: string; on: boolean; busy: boolean; ariaLabel: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={ariaLabel} aria-pressed={on} aria-busy={busy} onClick={(e) => { e.stopPropagation(); onClick(); }} disabled={busy} className="flex w-[56px] cursor-pointer flex-col items-center gap-[3px] disabled:cursor-wait" style={{ color: on ? "var(--accent-subtle)" : "#fff" }}>
      <span className="flex size-10 items-center justify-center" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6)) drop-shadow(0 1px 6px rgba(0,0,0,0.35))" }}>
        {busy ? <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden /> : children}
      </span>
      {/* The label stays white over any photo (the "on" color is the
         icon's job); an accent label disappeared against the image. */}
      <span className="text-[11px] leading-none font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">{label}</span>
    </button>
  );
}


/** A cluster of actions that belong together. No visible label (a label
 *  row per group made the header taller, 30 Sept 2026): the grouping is
 *  the spacing and a hairline between groups; the label is for screen
 *  readers. */
export function ActionGroup({ label, children, divider = false }: { label: string; children: ReactNode; /** a hairline before this group */ divider?: boolean }) {
  return (
    <div role="group" aria-label={label} className="flex min-w-0 items-center gap-[var(--space-2)]">
      {divider && <span aria-hidden className="mx-[var(--space-1)] hidden h-[24px] w-px sm:block" style={{ background: "rgba(255,255,255,0.28)" }} />}
      {children}
    </div>
  );
}

/** Two pills that belong together, drawn as one control (Save | Top 3). */
export function JoinedPills({ children }: { children: ReactNode }) {
  return <div className="flex items-stretch">{children}</div>;
}

/** The one line under the actions that says what to do next. It shows
 *  when the state changes (and once on arrival), stays about as long as it
 *  takes to read, then goes (30 Sept 2026: "only enough time to read, then
 *  go"). A glint runs across it on the way in, the app's own text nudge,
 *  so the eye catches it without a popup. */
/** `persist`: stays until it unmounts (a teaching line before any action),
 *  instead of fading after a reading beat (a reaction to one). */
export function NextStep({ text, persist = false, ink, center = false }: { text: string; persist?: boolean; /** text colour off the dark photo header (a themed sheet) */ ink?: string; /** centred under a spread strip (the sheets) */ center?: boolean }) {
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new state brings the line back
    setShown(text);
    if (persist) return;
    // ~250ms a word, never under 2.8s.
    const t = window.setTimeout(() => setShown(null), Math.max(2800, text.split(/\s+/).length * 250));
    return () => window.clearTimeout(t);
  }, [text, persist]);
  return (
    <AnimatePresence initial={false}>
      {shown && (
        <motion.p key={shown} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }} className={`flex items-start gap-[6px] overflow-hidden text-[13px] leading-[18px] font-semibold ${center ? "justify-center text-center" : ""}`} style={{ color: ink ?? "rgba(255,255,255,0.9)" }} aria-live="polite">
          <Sparkles className="mt-[2px] h-[13px] w-[13px] flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} />
          <span className="dm-text-nudge" style={{ animationIterationCount: 1 }}>{shown}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}
