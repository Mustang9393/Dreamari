"use client";

// One opportunity card, shared by the Opportunities tab and the related
// rails on School and Career detail (1 Oct 2026). Anatomy, top down:
//   the name (title) . . . . . . . . . . . . . . . . . . . . . Save
//   who gives it (subtitle)
//   [award chip]  Closes Mar 1                         Fits your Top 3
// No mark (3 Oct 2026, Joshua: the letter squares are "visual clutter with
// no additional value"). Not "logos where we have them": half the cards with
// a logo and half without reads as broken, and the name says who it is. A
// real logo, when one exists, shows on the detail page only.
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

export type Enriched = { item: Item; fit: Fit; time: Timing };

export const MUTED = { color: "var(--muted-foreground)" } as const;
export const AMBER = "rgb(255,176,32)";
export const GREEN = "rgb(52,199,140)";
const STATUS_WORD: Record<OpportunityStatus, string> = { saved: "Saved", applied: "Applied", won: "Got it", passed: "Passed" };

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
/** A real full ride, not "full tuition": tuition, fees, room and board. */
export const isFullRide = (amount: string) => /full ride|full cost|full four-year|full scholarship|full tuition, fees/i.test(amount);
/** The award in a few characters. Never less than the provider's top
 *  figure ("$500 or $1,500 a year" is "Up to $1,500", 3 Oct 2026) and never
 *  more ("full SUNY tuition" is "Full tuition", not "Full ride"). */
export function amountShort(item: Item): string {
  if (item.type !== "scholarship") return "";
  const a = item.amount;
  if (isFullRide(a)) return "Full ride";
  if (/capped or full tuition/i.test(a)) return "Up to full tuition";
  if (/full (\w+ )*tuition/i.test(a)) return "Full tuition";
  // The amounts that are the award itself: not a "(105 scholarships)" aside
  // or a "plus a $5,000 grant" to someone else.
  const core = a.replace(/\([^)]*\)/g, "").split(/\bplus\b/i)[0];
  const nums = [...core.matchAll(/\$(\d{1,3}(?:,\d{3})+|\d+)/g)].map((m) => Number(m[1].replace(/,/g, ""))).filter((n) => n > 0);
  if (item.amountMax && nums.length && (item.amountMax > nums[0] || (nums.length > 1 && Math.max(...nums) === item.amountMax))) return `Up to ${money(item.amountMax)}`;
  if (a.length <= 14 && nums.length) return a;
  if (nums.length && /^\$/.test(a)) return money(nums[0]);
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
  // One signal on the right, never more: why this one is here (Chandu, 1 Oct
  // 2026: "the cards should say why it's being recommended, some sort of
  // signal, not a whole copy sentence"). In order: your Top 3, your GPA,
  // your state, a partner post, else the plain fact that your grade can
  // apply. A later one says when it opens to you.
  const top3 = fit.reasons.some((r) => r.startsWith("Fits your Top 3"));
  const gpa = fit.reasons.some((r) => /GPA/.test(r));
  const state = fit.reasons.find((r) => r.startsWith("Open in "));
  const gradeOk = fit.reasons.find((r) => /can apply$/.test(r));
  const signal = fit.when === "later" ? (item.grades.length ? `Grade ${Math.min(...item.grades)}` : "College")
    : top3 ? "Fits your Top 3" : gpa ? "Your GPA is high enough" : state ? state.replace("Open in ", "In ") : partner ? "Partner post" : gradeOk ?? null;
  const strong = fit.when === "now" && (top3 || gpa || !!state);
  const cls = "dm-glass-2 relative flex h-full flex-col gap-[16px] rounded-[var(--radius-lg)] border p-[20px] backdrop-blur-[24px] backdrop-saturate-[1.65]";
  const inner = (
    <>
        {/* The whole card opens the detail; everything else lets the click through. */}
        <button type="button" onClick={onOpen} aria-label={`Open ${item.name}`} className="dm-quiet absolute inset-0 z-[1] cursor-pointer rounded-[var(--radius-lg)]" />
        <header className="pointer-events-none relative z-[2] flex min-h-[66px] items-start justify-between gap-[12px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
            <span className="line-clamp-2 text-[17px] leading-[22px] font-bold" style={{ textWrap: "balance" }}>{item.name}</span>
            <span className="line-clamp-1 text-[13px] leading-[18px]" style={MUTED}>{who}</span>
          </div>
          <span className="pointer-events-auto -mt-[4px] -mr-[4px] flex-none"><SaveDot on={!!status} name={item.name} onToggle={onSave} /></span>
        </header>
        <footer className="pointer-events-none relative mt-auto flex flex-wrap items-center gap-x-[10px] gap-y-[6px] text-[12.5px] leading-[16px]">
          {status && status !== "saved" && <span className="flex h-[26px] items-center gap-[4px] rounded-full px-[9px] text-[12px] font-bold" style={{ background: status === "won" ? "rgba(52,199,140,0.16)" : "color-mix(in srgb, var(--primary) 18%, transparent)", color: status === "won" ? GREEN : SOFT }}>{status === "won" ? <Trophy className="h-3 w-3" aria-hidden /> : <ClipboardCheck className="h-3 w-3" aria-hidden />}{STATUS_WORD[status]}</span>}
          <AwardChip item={item} />
          <span className="font-semibold whitespace-nowrap" style={{ color: time.tone === "soon" ? AMBER : "var(--muted-foreground)" }}>{closesShort(time)}</span>
          {signal && <span className="ml-auto flex flex-none items-center gap-[4px] font-semibold" style={{ color: fit.when === "later" ? "var(--muted-foreground)" : strong ? SOFT : "var(--muted-foreground)" }}>{strong && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}{signal}</span>}
        </footer>
    </>
  );
  return (
    <HoverBeam strength={0.7}>
      <article aria-current={on ? "true" : undefined} className={`dm-tap ${cls}`} style={{ borderColor: on ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-2))" : "var(--glass-surface-2)", opacity: fit.when === "later" ? 0.82 : 1 }}>
        {inner}
      </article>
    </HoverBeam>
  );
}
