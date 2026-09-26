"use client";

// DEMO-ONLY: the Career actions lab's shared UI (26 Sept 2026): the one
// feedback bar, the Saved / Top 3 drawers the bar's links open, the swap
// sheet (the app's own Top3SwapModal), the lab dock (network mode, reset),
// and the new controls both lab pages use. See labStore.ts for the rules.

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Loader2, RotateCcw, X } from "lucide-react";
import { Top3SwapModal } from "@/components/career/Top3SwapModal";
import { resolveCareer } from "@/components/career/data";
import { cancelSwap, openDrawer, resetLab, setBar, setNetwork, swapInto, useLab, type Network } from "./labStore";

export const LAB_CAREER = (slug: string) => `/actions-lab/career/${slug}`;
const titleOf = (id: string) => resolveCareer(id)?.title ?? id;
const photoOf = (id: string) => resolveCareer(id)?.photo ?? null;

/** Everything the lab pages share, mounted once per page. */
export function LabLayer({ barAtTop = false }: { /** the For You reel keeps its own CTAs at the bottom, so the bar shows at the top there */ barAtTop?: boolean } = {}) {
  const lab = useLab();
  useEffect(() => {
    if (!lab.bar || lab.bar.error) return;
    const t = window.setTimeout(() => setBar(null), 4500);
    return () => window.clearTimeout(t);
  }, [lab.bar]);
  return (
    <>
      <ActionBar top={barAtTop} />
      {lab.swapFor && (
        <Top3SwapModal
          incomingId={lab.swapFor.id}
          currentIds={lab.top3}
          onConfirm={(outgoingId) => swapInto(outgoingId, titleOf(outgoingId))}
          onCancel={cancelSwap}
        />
      )}
      <AnimatePresence>{lab.drawer && <Drawer kind={lab.drawer} />}</AnimatePresence>
      <LabDock />
    </>
  );
}

/** What happened, where it went, how to undo it. One bar; a new action
 *  replaces it, never stacks. */
function ActionBar({ top = false }: { top?: boolean }) {
  const { bar } = useLab();
  return (
    <div className={`pointer-events-none fixed inset-x-0 z-[90] flex justify-center px-4 ${top ? "top-[112px] lg:top-[132px]" : "bottom-[92px] lg:bottom-6"}`}>
      <AnimatePresence mode="wait">
        {bar && (
          <motion.div key={bar.id} role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border py-2 pr-2 pl-4 shadow-xl backdrop-blur-xl" style={{ borderColor: bar.error ? "color-mix(in srgb, #E0453C 55%, var(--glass-border))" : "var(--glass-border)", background: "color-mix(in srgb, var(--card) 92%, transparent)", color: "var(--foreground)" }}>
            {bar.error ? <X className="h-4 w-4 flex-none" aria-hidden style={{ color: "#E0453C" }} /> : <Check className="h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: "var(--color-feedback-success)" }} />}
            <span className="min-w-0 truncate text-[13.5px] font-semibold">{bar.text}</span>
            {bar.link && <button type="button" onClick={() => { openDrawer(bar.link!.open); setBar(null); }} className="flex flex-none cursor-pointer items-center gap-0.5 rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{bar.link.label} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>}
            {bar.undo && <button type="button" onClick={bar.undo} className="dm-quiet flex-none cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)" }}>Undo</button>}
            {bar.retry && <button type="button" onClick={() => { setBar(null); bar.retry!(); }} className="flex-none cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Try again</button>}
            {bar.error && <button type="button" aria-label="Dismiss" onClick={() => setBar(null)} className="dm-quiet flex size-7 flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-3.5 w-3.5" aria-hidden /></button>}
            {!bar.link && !bar.undo && !bar.retry && !bar.error && <span className="w-1" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
        {kind === "top3" ? (
          <ul className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => {
              const id = lab.top3[i];
              return (
                <li key={i} className="flex items-center gap-3 rounded-[var(--radius-md)] border p-2" style={{ borderColor: "var(--glass-border)", borderStyle: id ? "solid" : "dashed" }}>
                  {id ? <><Thumb id={id} /><span className="text-[14px] font-bold">#{i + 1} {titleOf(id)}</span></> : <span className="px-2 py-3 text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>#{i + 1} is open. Add from Saved or any career page.</span>}
                </li>
              );
            })}
          </ul>
        ) : lab.saved.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed px-4 py-6 text-center text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Nothing saved yet. Tap Save on any career.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {lab.saved.map((id) => {
              const rank = lab.top3.indexOf(id);
              return (
                <li key={id}>
                  <Link href={LAB_CAREER(id)} onClick={close} className="relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: rank >= 0 ? "var(--primary)" : "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                    {photoOf(id) && <Image src={photoOf(id)!} alt="" fill sizes="120px" className="object-cover" />}
                    <span className="absolute inset-x-0 bottom-0 p-1.5 text-[10.5px] leading-[12px] font-bold text-white" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>{titleOf(id)}</span>
                    {rank >= 0 && <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: "var(--primary)" }}>{rank + 1}</span>}
                  </Link>
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
      <div className="fixed bottom-[92px] left-3 z-[91] flex h-auto flex-col items-start gap-2 lg:hidden">
        {open && (
          <div className="flex h-9 items-center gap-1 rounded-full border p-1 text-[11.5px] font-bold shadow-lg" style={{ ...shell, background: "var(--card)" }}>
            {choices(() => setOpen(false))}
          </div>
        )}
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold tracking-[0.06em] uppercase shadow-lg" style={{ ...shell, background: "var(--card)", color: "var(--primary)" }}>
          Lab{network !== "normal" && <span className="normal-case tracking-normal" style={{ color: "var(--foreground)" }}>· {network === "slow" ? "Slow" : "Fails"}</span>}
        </button>
      </div>
    </>
  );
}

/** Top 3's glyph: a "3" in a rounded square, a check once in. A bare + / -
 *  read as "expand" or "zoom", not "my Top 3". */
export function Top3Glyph({ on, size = 18 }: { on: boolean; size?: number }) {
  return (
    <span aria-hidden className="flex flex-none items-center justify-center rounded-[5px] border-2 font-extrabold" style={{ width: size, height: size, fontSize: size * 0.52, lineHeight: 1, borderColor: "currentColor", background: on ? "currentColor" : "transparent" }}>
      {on ? <Check style={{ width: size * 0.62, height: size * 0.62, color: "#0b0d18" }} strokeWidth={3.5} /> : <span style={{ fontFamily: "var(--font-display)" }}>3</span>}
    </span>
  );
}

/** A labeled action pill for the career page: says what it does, and what
 *  state it is in. */
export function LabPill({ children, onClick, icon, primary = false, on = false, busy = false, small = false, ariaLabel }: { children: ReactNode; onClick: () => void; icon?: ReactNode; primary?: boolean; on?: boolean; busy?: boolean; small?: boolean; ariaLabel?: string }) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={on}
      aria-busy={busy}
      onClick={onClick}
      disabled={busy}
      whileTap={{ scale: 0.96 }}
      className={`flex cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border font-semibold whitespace-nowrap disabled:cursor-wait ${small ? "min-h-[40px] px-[14px] text-[14px]" : "min-h-[44px] px-[var(--space-5)] text-[15px]"}`}
      style={{
        background: primary && !on ? "color-mix(in srgb, var(--primary) 32%, rgba(12,16,35,0.6))" : on ? "color-mix(in srgb, var(--primary) 26%, rgba(12,16,35,0.6))" : "rgba(12,16,35,0.55)",
        borderColor: primary && !on ? "color-mix(in srgb, var(--primary) 45%, transparent)" : on ? "color-mix(in srgb, var(--accent-subtle) 70%, transparent)" : "rgba(255,255,255,0.3)",
        color: "#fff",
      }}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
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
