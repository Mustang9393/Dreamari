"use client";

// LinkedIn-style reactions for every Connect conversation: Like,
// Celebrate, Support and Love, one per person, the top two icons and a
// count as the summary, the picker a hover, long-press or arrow key away.
// Built for the United Way boards first (Maisha, 9 Oct 2026: "Replace the
// fire and 100 emojis with professional LinkedIn-style reactions such as
// Like, Celebrate, Support, and Love") and shared from here with Connect's
// threads, insights, board posts and event posts (15 Oct 2026). The
// United Way boards pass their own brand palette; everything else takes
// the app's tokens.

import { useEffect, useRef, useState } from "react";
import { HandHeart, Heart, PartyPopper, ThumbsUp } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";

export type ReactionKind = "like" | "celebrate" | "support" | "love";
export const REACTION_KINDS: ReactionKind[] = ["like", "celebrate", "support", "love"];
export const REACTION_LABEL: Record<ReactionKind, string> = { like: "Like", celebrate: "Celebrate", support: "Support", love: "Love" };
export const reactionTotal = (r: Record<ReactionKind, number>) => REACTION_KINDS.reduce((n, k) => n + r[k], 0);

const hash = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
/** DEMO-ONLY: a seeded count of likes split across the four reactions,
 *  mostly Like, the rest varying by post so the summary icons differ. */
export function seedReactions(id: string, total: number): Record<ReactionKind, number> {
  const h = hash(id);
  const like = Math.round(total * (0.45 + (h % 20) / 100));
  const rest = total - like;
  const order: ReactionKind[] = [["celebrate", "support", "love"], ["love", "celebrate", "support"], ["support", "love", "celebrate"]][h % 3] as ReactionKind[];
  const a = Math.round(rest * 0.55), b = Math.round(rest * 0.3);
  return { like, [order[0]]: a, [order[1]]: b, [order[2]]: Math.max(0, rest - a - b) } as Record<ReactionKind, number>;
}

/** The disc behind each icon, and the label colour once it is picked. */
export type ReactionPalette = { bg: Record<ReactionKind, string>; ink: Record<ReactionKind, string> };
const APP_PALETTE: ReactionPalette = {
  bg: { like: "var(--primary)", celebrate: "var(--world-food-farming-nature)", support: "#8A4FD8", love: "#F0544A" },
  ink: { like: "var(--accent-subtle)", celebrate: "var(--world-food-farming-nature)", support: "#9B6BE0", love: "#F0544A" },
};
const REACTION_ICON: Record<ReactionKind, typeof ThumbsUp> = { like: ThumbsUp, celebrate: PartyPopper, support: HandHeart, love: Heart };

export function ReactionDot({ kind, size = 18, palette = APP_PALETTE }: { kind: ReactionKind; size?: number; palette?: ReactionPalette }) {
  const Icon = REACTION_ICON[kind];
  return (
    <span aria-hidden className="flex flex-none items-center justify-center rounded-full" style={{ width: size, height: size, background: palette.bg[kind], boxShadow: "0 0 0 2px var(--background)" }}>
      <Icon className="text-white" style={{ width: size * 0.58, height: size * 0.58 }} strokeWidth={2.4} />
    </span>
  );
}

/** The count with its top two reactions, LinkedIn's summary. */
export function ReactionSummary({ counts, mine, palette = APP_PALETTE, color = "color-mix(in srgb, var(--muted-foreground) 80%, transparent)", size = 18 }: { counts: Record<ReactionKind, number>; mine?: ReactionKind; palette?: ReactionPalette; color?: string; size?: number }) {
  const all = { ...counts, ...(mine ? { [mine]: counts[mine] + 1 } : {}) } as Record<ReactionKind, number>;
  const total = reactionTotal(all);
  if (!total) return null;
  const top = [...REACTION_KINDS].sort((a, b) => all[b] - all[a]).filter((k) => all[k] > 0).slice(0, 2);
  return (
    <span role="img" className="flex items-center gap-[6px] text-[13px] font-semibold tabular-nums" style={{ color }} aria-label={`${total} reactions`}>
      <span className="flex -space-x-[4px]">{top.map((k) => <ReactionDot key={k} kind={k} size={size} palette={palette} />)}</span>
      <span aria-hidden>{total.toLocaleString("en-US")}</span>
    </span>
  );
}

/** Like, with the other three a hover (or long-press, or arrow key) away.
 *  `mine` is the viewer's one reaction; `onReact(undefined)` removes it. */
export function ReactButton({ mine, onReact, compact = false, palette = APP_PALETTE, color = "var(--muted-foreground)" }: { mine: ReactionKind | undefined; onReact: (kind: ReactionKind | undefined) => void; compact?: boolean; palette?: ReactionPalette; color?: string }) {
  const [open, setOpen] = useState(false);
  const [below, setBelow] = useState(false);
  const timer = useRef(0);
  const pressed = useRef(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const later = (fn: () => void, ms: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(fn, ms); };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // opens above the button, or under it when there's no room above
  const show = () => { const r = wrapRef.current?.getBoundingClientRect(); setBelow(!!r && r.top < 140); setOpen(true); };
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  const pick = (k: ReactionKind | undefined) => { onReact(k); setOpen(false); };
  const Icon = mine ? REACTION_ICON[mine] : ThumbsUp;
  return (
    <span ref={wrapRef} className="relative z-20 flex" onMouseEnter={() => later(show, 450)} onMouseLeave={() => later(() => setOpen(false), 300)}>
      <button type="button" aria-pressed={!!mine} aria-haspopup="true" aria-expanded={open} aria-label={mine ? `${REACTION_LABEL[mine]}. Remove reaction` : "Like. Press up for more reactions"}
        onPointerDown={(e) => { if (e.pointerType === "touch") { pressed.current = false; later(() => { pressed.current = true; show(); }, 450); } }}
        onPointerUp={() => { if (!pressed.current) window.clearTimeout(timer.current); }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => { if (pressed.current) { pressed.current = false; return; } pick(mine ? undefined : "like"); }}
        onKeyDown={(e) => { if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); show(); window.setTimeout(() => (pickerRef.current?.querySelector("button") as HTMLButtonElement | null)?.focus(), 0); } if (e.key === "Escape") setOpen(false); }}
        className={`dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[6px] rounded-full ${compact ? "px-[8px] text-[12.5px]" : "px-[12px] text-[13.5px]"} font-bold select-none`}
        style={{ color: mine ? palette.ink[mine] : color, WebkitTouchCallout: "none" }}>
        <Icon className="h-[17px] w-[17px]" aria-hidden fill={mine ? "currentColor" : "none"} fillOpacity={mine ? 0.18 : 0} /> {mine ? REACTION_LABEL[mine] : "Like"}
      </button>
      {open && (
        <div ref={pickerRef} role="menu" aria-label="Reactions" onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); (wrapRef.current?.querySelector("button") as HTMLButtonElement | null)?.focus(); } }}
          className={`absolute left-0 z-40 flex gap-[4px] rounded-full border p-[5px] ${below ? "top-full mt-[6px]" : "bottom-full mb-[6px]"}`}
          style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 16px 40px -14px rgba(0,0,0,0.55)" }}>
          {REACTION_KINDS.map((k) => {
            const I = REACTION_ICON[k];
            return (
              <IconTip key={k} label={REACTION_LABEL[k]}>
                <button type="button" role="menuitemradio" aria-checked={mine === k} aria-label={REACTION_LABEL[k]} onClick={() => pick(mine === k ? undefined : k)}
                  className="flex size-[38px] cursor-pointer items-center justify-center rounded-full transition-transform duration-150 hover:-translate-y-[3px] hover:scale-110 focus-visible:-translate-y-[3px]"
                  style={{ background: palette.bg[k], boxShadow: mine === k ? `0 0 0 2px var(--card), 0 0 0 4px ${palette.bg[k]}` : undefined }}>
                  <I className="h-[18px] w-[18px] text-white" aria-hidden strokeWidth={2.4} />
                </button>
              </IconTip>
            );
          })}
        </div>
      )}
    </span>
  );
}
