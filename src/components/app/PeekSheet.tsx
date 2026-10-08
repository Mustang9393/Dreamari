"use client";

// The Top 3 Career Peek's frame, shared (8 Oct 2026, Chandu: "Everything
// like a detail page in student app including career detail, school detail
// etc should also open like the cards in top 3"). Photo on the left, the
// world colour as the one accent, prev/next through the row it came from,
// Escape and arrow keys. The student school sheet and the counselor's
// career and school sheets fill it; the student career sheet is CareerPeek.

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type DragControls, type PanInfo } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { Segmented } from "@/components/connect/viz";
import { ScrollEdges } from "./cardChrome";
import { rememberReturn } from "./peekStore";

const EASE = [0.22, 1, 0.36, 1] as const;

// ---- Phones and tablets: a drawer (8 Oct 2026). Chandu, on an iPad: the
// full page opened scrolled down and lost Explore's place, so "if we can't
// reliably do this using a full page, please use a sheet that slides over
// from the bottom (from behind the navbar though) to slide up to about 90%
// of the screen height, and when I close it goes away like a drawer so my
// scroll position in Explore isn't affected." Below 1024px every detail
// sheet is that drawer: its bottom edge sits on the tab bar (which stays on
// top), it rises to 90% of the screen, keeps the header photo, and closes
// by X, a tap above it, Escape, or dragging its grabber down. Nothing
// navigates, so the page under it never moves.
const NARROW = "(max-width: 1023.98px)";
const subscribeNarrow = (cb: () => void) => { const m = window.matchMedia(NARROW); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
export function useNarrowSheet(): boolean {
  return useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);
}
/** The overlay: centred on desktop; on phones and tablets it ends at the
 *  tab bar's top edge, under the bar (z 35, the bar is 40). */
export const sheetOverlayClass = (narrow: boolean, base = "marketing-v2 themeable no-print") =>
  narrow
    ? `${base} fixed inset-x-0 top-0 z-[35] flex items-end justify-center bottom-[calc(50px+env(safe-area-inset-bottom))] md:bottom-[calc(58px+env(safe-area-inset-bottom))]`
    : `${base} fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6`;
/** The sheet's own motion: up from the bottom as a drawer (draggable down
 *  from its grabber), or the desktop rise-and-settle. */
export function sheetMotion(narrow: boolean, reduce: boolean | null, controls: DragControls, onClose: () => void) {
  if (!narrow) return { initial: reduce ? false as const : { opacity: 0, y: 24, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.98 }, transition: { type: "spring" as const, stiffness: 360, damping: 32 } };
  return {
    initial: reduce ? false as const : { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "tween" as const, duration: 0.34, ease: EASE },
    drag: "y" as const, dragControls: controls, dragListener: false, dragConstraints: { top: 0, bottom: 0 }, dragElastic: { top: 0, bottom: 0.7 },
    onDragEnd: (_: unknown, info: PanInfo) => { if (info.offset.y > 120 || info.velocity.y > 700) onClose(); },
  };
}
/** The drawer's grabber: the handle a thumb drags down to close. */
export function SheetGrabber({ controls }: { controls: DragControls }) {
  return <div className="cpk-grabber" aria-hidden onPointerDown={(e) => controls.start(e)}><span /></div>;
}
export { useDragControls };

/** The way to the full page, a full-screen icon beside Close (8 Oct 2026,
 *  Chandu: "the full screen button can be the full screen icon instead,
 *  and when I close that it should return me to where I was"). It
 *  remembers the spot under the sheet first, so Back on the full page lands
 *  there with the sheet open again. data-peek-skip lets it navigate past
 *  the host. Up with the sheet's controls, so the footer holds exactly the
 *  page's own actions. */
export function FullPageLink({ href }: { href: string }) {
  return (
    <IconTip label="Full page">
      <Link href={href} data-peek-skip aria-label="Open the full page" onClick={rememberReturn} className="cpk-ctl">
        {/* the corner brackets every video player uses for full screen (Usman,
           8 Oct 2026: the diagonal arrows didn't read as full screen) */}
        <Maximize className="h-4 w-4" aria-hidden />
      </Link>
    </IconTip>
  );
}

export type PeekFact = { label: string; value: string };
export type PeekTab<K extends string> = { key: K; label: string };

/** The Career Peek frame (.cpk-*), for any detail that opens as a sheet. */
export function PeekSheet<K extends string>({ id, accent, art, chip, title, titleStyle, lede, facts, tabs, tab, onTab, body, footer, count, index, onIndex, onClose, fullHref, refined = false }: {
  id: string; accent: string; art: React.ReactNode; chip: string; title: string; titleStyle?: React.CSSProperties; lede?: string;
  facts: PeekFact[]; tabs: PeekTab<K>[]; tab: K; onTab: (k: K) => void; body: React.ReactNode; footer: React.ReactNode;
  count: number; index: number; onIndex: (i: number) => void; onClose: () => void;
  /** the full page, opened from an icon beside Close */
  fullHref?: string;
  /** Student career/school refinement; counselor sheets keep their own layout. */
  refined?: boolean;
}) {
  const reduce = useReducedMotion();
  const narrow = useNarrowSheet();
  const drag = useDragControls();
  const [dir, setDir] = useState<1 | -1>(1);
  const go = useCallback((d: 1 | -1) => {
    const next = index + d;
    if (next < 0 || next >= count) return;
    setDir(d);
    onIndex(next);
  }, [index, count, onIndex]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [go, onClose]);

  return createPortal(
    <motion.div
      initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className={sheetOverlayClass(narrow, "marketing-v2 themeable")}
      style={{ background: `color-mix(in srgb, var(--background) ${refined ? 48 : 72}%, transparent)`, backdropFilter: refined ? "blur(16px) saturate(1.15)" : "blur(22px)", WebkitBackdropFilter: refined ? "blur(16px) saturate(1.15)" : "blur(22px)" }}
      onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="explore-sheet-title"
    >
      <motion.div
        {...sheetMotion(narrow, reduce, drag, onClose)}
        className={`cpk-sheet xsheet ${refined ? "cpk-refined" : ""} ${narrow ? "cpk-drawer" : ""}`} data-ink={accent.includes("--primary") ? "light" : undefined} style={{ ["--cpk-world" as string]: accent, fontFamily: "var(--font-body)" }}
      >
        {narrow && <SheetGrabber controls={drag} />}
        <div className="cpk-art">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={id} initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0">{art}</motion.div>
          </AnimatePresence>
        </div>

        <div className="cpk-controls">
          {count > 1 && (
            <>
              <IconTip label="Previous"><button type="button" aria-label="Previous" disabled={index === 0} onClick={() => go(-1)} className="cpk-ctl"><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
              <IconTip label="Next"><button type="button" aria-label="Next" disabled={index === count - 1} onClick={() => go(1)} className="cpk-ctl"><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
            </>
          )}
          {fullHref && <FullPageLink href={fullHref} />}
          <IconTip label="Close"><button type="button" aria-label="Close" onClick={onClose} className="cpk-ctl"><X className="h-4 w-4" aria-hidden /></button></IconTip>
        </div>

        <div className="cpk-content">
          <AnimatePresence initial={false} mode="wait" custom={dir}>
            <motion.div key={id} custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -16, transition: { duration: 0.14 } }}
              transition={{ duration: 0.3, ease: EASE }} className="flex min-h-0 flex-1 flex-col">
              <h2 id="explore-sheet-title" className="cpk-title cpk-title-first" style={{ color: "var(--foreground)", ...titleStyle }}>{title}</h2>
              <span className="cpk-world">{chip}</span>
              <span aria-hidden className="mt-[12px] block h-[4px] w-[48px] rounded-full" style={{ background: accent }} />
              {lede && <p className="cpk-lede">{lede}</p>}
              {facts.length > 0 && (
                <div className="cpk-facts" style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))`, gap: 0, border: `1px solid color-mix(in srgb, ${accent} 30%, var(--glass-border))`, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${accent} 9%, var(--glass-surface-1))`, overflow: "hidden" }}>
                  {facts.map((f, i) => (
                    <div key={f.label} className="cpk-fact" style={{ border: 0, borderRadius: 0, background: "transparent", borderLeft: i > 0 ? "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)" : undefined }}>
                      <span className="cpk-fact-label">{f.label}</span>
                      <span className="cpk-fact-value" >{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="cpk-tabs"><Segmented<K> ariaLabel="Details" value={tab} onChange={onTab} options={tabs} grow /></div>
              <div className="cpk-details relative min-h-0 flex-1">
                <div key={refined ? tab : undefined} tabIndex={refined ? 0 : undefined} className="cpk-scroll" style={{ position: "absolute", inset: 0 }}>
                  <div key={tab} className="cpk-stack dm-rise">{body}</div>
                </div>
                {refined && <span aria-hidden className="pointer-events-none absolute cpk-scroll-edges"><ScrollEdges key={tab} top={28} bottom={44} /></span>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="cpk-footer">{footer}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function PeekList({ items }: { items: string[] }) {
  return (
    <ul className="cpk-list">
      {items.filter((it) => it.trim()).map((it) => <li key={it} className="cpk-item"><span aria-hidden className="cpk-item-dot" />{it}</li>)}
    </ul>
  );
}

/** A label, a figure, one hairline under: the sheet's only table shape. */
export function PeekLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <li className="flex items-baseline justify-between gap-[var(--space-3)] border-b py-[9px] text-[14.5px] last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
      <span className={strong ? "font-bold" : "font-medium"}>{label}</span>
      <span className="font-bold tabular-nums" style={{ color: strong ? "var(--cpk-world)" : undefined }}>{value}</span>
    </li>
  );
}
