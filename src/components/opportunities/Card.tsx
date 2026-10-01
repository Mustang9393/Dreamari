"use client";

// One opportunity card, shared by the Opportunities tab and the related
// rails on School and Career detail (1 Oct 2026). Anatomy, top down:
//   the provider's mark . . . . . . . . . . . . . . . . . . . Save
//   the name (title)
//   who gives it (subtitle)
//   [award chip]  Closes Mar 1                         Fits your Top 3
// The award is a chip, not the headline (Chandu: "things like Full ride
// are not the names of the scholarships... should they be chips? How is it
// usually done?"). Bold.org and Going Merry both show the amount as a pill
// beside the deadline and keep the name as the title; so does this. The
// whole card is the click target (an overlay button), with Save floating
// above it.

import { Bookmark, BookmarkCheck, Check, ClipboardCheck, Trophy } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import type { OpportunityStatus } from "@/lib/opportunities";
import { PAID, type Item, type Paid } from "./types";
import type { Fit, Timing } from "./match";
import { OrgMark } from "./OrgMark";

export type Enriched = { item: Item; fit: Fit; time: Timing };

export const MUTED = { color: "var(--muted-foreground)" } as const;
export const AMBER = "rgb(255,176,32)";
export const GREEN = "rgb(52,199,140)";
const STATUS_WORD: Record<OpportunityStatus, string> = { saved: "Saved", applied: "Applied", won: "Got it", passed: "Passed" };

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
/** The award in a few characters, or the max when the wording is long. */
export function amountShort(item: Item): string {
  if (item.type !== "scholarship") return "";
  if (/full/i.test(item.amount)) return "Full ride";
  if (item.amount.length <= 14) return item.amount;
  // "$25,000 (105 scholarships)" is $25,000; "$10,000 a year..." is a range.
  const single = item.amount.match(/^(\$\d[\d,]*\d)(?![\d,])(?!\s*(to|-|a |per|\+|each|and up))/);
  if (single) return single[1];
  return item.amountMax ? `Up to ${money(item.amountMax)}` : "Varies";
}
/** "Closes Mar 1" on a card; the detail splits it into a label and a value. */
export function closesShort(t: Timing): string { return t.label.replace(/, in \d+ days?$/, ""); }

export function costTone(p: Paid): "good" | "plain" | null { return p === "unknown" ? null : p === "tuition" ? "plain" : "good"; }

/** The award (money) or the cost (program) as one chip. */
export function AwardChip({ item }: { item: Item }) {
  if (item.type === "scholarship") {
    return <span className="flex h-[26px] items-center rounded-full px-[10px] text-[13px] font-bold whitespace-nowrap tabular-nums" style={{ background: "rgba(52,199,140,0.16)", color: GREEN }}>{amountShort(item)}</span>;
  }
  const tone = costTone(item.paid);
  if (!tone) return null;
  return <span className="flex h-[26px] items-center rounded-full px-[10px] text-[13px] font-bold whitespace-nowrap" style={tone === "good" ? { background: "rgba(52,199,140,0.16)", color: GREEN } : { background: "rgba(255,255,255,0.08)", color: "var(--foreground)" }}>{PAID[item.paid]}</span>;
}

export function SaveDot({ on, name, onToggle, size = 36 }: { on: boolean; name: string; onToggle: () => void; size?: number }) {
  return (
    <IconTip label={on ? "Remove from saved" : "Save"}>
      <button type="button" aria-pressed={on} aria-label={on ? `Remove ${name} from saved` : `Save ${name}`} onClick={(e) => { e.stopPropagation(); onToggle(); }} className="dm-quiet flex cursor-pointer items-center justify-center rounded-full border" style={{ width: size, height: size, borderColor: on ? ACCENT : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 22%, transparent)" : "color-mix(in srgb, var(--background) 40%, transparent)", color: on ? SOFT : "var(--muted-foreground)" }}>
        {on ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
      </button>
    </IconTip>
  );
}

export function Card({ e, on = false, status, onOpen, onSave }: { e: Enriched; on?: boolean; status: OpportunityStatus | null; onOpen: () => void; onSave: () => void }) {
  const { item, fit, time } = e;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const partner = item.type === "program" && item.postedBy;
  const top3 = fit.reasons.some((r) => r.startsWith("Fits your Top 3"));
  // One signal on the right, never more: Top 3, a partner post, or when it
  // opens to you.
  const signal = fit.when === "later" ? (item.grades.length ? `Grade ${Math.min(...item.grades)}` : "College") : top3 ? "Fits your Top 3" : partner ? "Partner" : null;
  return (
    <HoverBeam strength={0.7}>
      <article aria-current={on ? "true" : undefined} className="dm-tap dm-glass-2 relative flex h-full flex-col gap-[16px] rounded-[var(--radius-lg)] border p-[20px] backdrop-blur-[24px] backdrop-saturate-[1.65]" style={{ borderColor: on ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-2))" : "var(--glass-surface-2)", opacity: fit.when === "later" ? 0.82 : 1 }}>
        {/* The whole card opens the detail; everything else lets the click through. */}
        <button type="button" onClick={onOpen} aria-label={`Open ${item.name}`} className="dm-quiet absolute inset-0 z-[1] cursor-pointer rounded-[var(--radius-lg)]" />
        <header className="pointer-events-none relative z-[2] flex items-start justify-between gap-[12px]">
          <OrgMark url={item.url} name={who} size={44} />
          <span className="pointer-events-auto flex items-center gap-[6px]">
            {status && status !== "saved" && <span className="flex h-[24px] items-center gap-[4px] rounded-full px-[9px] text-[12px] font-bold" style={{ background: status === "won" ? "rgba(52,199,140,0.16)" : "color-mix(in srgb, var(--primary) 18%, transparent)", color: status === "won" ? GREEN : SOFT }}>{status === "won" ? <Trophy className="h-3 w-3" aria-hidden /> : <ClipboardCheck className="h-3 w-3" aria-hidden />}{STATUS_WORD[status]}</span>}
            <SaveDot on={!!status} name={item.name} onToggle={onSave} />
          </span>
        </header>
        <div className="pointer-events-none relative flex min-h-[66px] min-w-0 flex-1 flex-col gap-[4px]">
          <span className="line-clamp-2 text-[17px] leading-[22px] font-bold" style={{ textWrap: "balance" }}>{item.name}</span>
          <span className="line-clamp-1 text-[13px] leading-[18px]" style={MUTED}>{who}</span>
        </div>
        <footer className="pointer-events-none relative flex flex-wrap items-center gap-x-[10px] gap-y-[6px] text-[12.5px] leading-[16px]">
          <AwardChip item={item} />
          <span className="font-semibold whitespace-nowrap" style={{ color: time.tone === "soon" ? AMBER : "var(--muted-foreground)" }}>{closesShort(time)}</span>
          {signal && <span className="ml-auto flex flex-none items-center gap-[4px] font-semibold" style={{ color: fit.when === "later" ? "var(--muted-foreground)" : SOFT }}>{fit.when === "now" && top3 && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}{signal}</span>}
        </footer>
      </article>
    </HoverBeam>
  );
}
