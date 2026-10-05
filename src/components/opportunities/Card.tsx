"use client";

// One opportunity card, shared by the Opportunities tab and the related
// rails on School and Career detail (1 Oct 2026). Anatomy, redesigned 6 Oct
// 2026 (Chandu: "make opportunities page a lot cleaner. The card thing is
// too basic and a lot at once"): two glanceable anchors instead of a row of
// chips and text.
//   [MAR]  the name (title) . . . . . . . . . . . . . . . . .  Save
//   [ 1 ]  who gives it
//          8 days left (only when it closes within two weeks)
//   ─────────────────────────────────────────────────────────────
//   Up to                                              ✓ Fits your Top 3
//   $25,000
// The date is a calendar leaf (the detail page's own), the award one big
// figure, the reason one quiet line. The career world shows as a faint
// light in the top corner.
// No mark (3 Oct 2026, Joshua: the letter squares are "visual clutter with
// no additional value"). Not "logos where we have them": half the cards with
// a logo and half without reads as broken, and the name says who it is. A
// real logo, when one exists, shows on the detail page only.
// The award is a chip, not the headline (Chandu: "things like Full ride
// are not the names of the scholarships... should they be chips? How is it
// usually done?"). Bold.org and Going Merry both show the amount as a pill
// beside the deadline and keep the name as the title; the card keeps the
// name as the title and puts the award under a rule, labelled, so it never
// reads as the name. The
// whole card is the click target (an overlay button), with Save floating
// above it.

import { Bookmark, BookmarkCheck, Check, ClipboardCheck, Trophy } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import type { OpportunityStatus } from "@/lib/opportunities";
import { PAID, PROGRAM_KIND, type Item, type Paid } from "./types";
import { fieldWorld, type Fit, type Timing } from "./match";

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The deadline as a small calendar leaf, the same leaf the detail page and
 *  Home's deadline card use, so a date reads at a glance instead of as a
 *  line of text. Amber when it closes within two weeks; a dashed edge when
 *  it is last cycle's date rolled forward ("usually"). */
function DateLeaf({ time }: { time: Timing }) {
  if (time.status === "unknown" || !time.iso) {
    return (
      <span aria-label="No date yet" className="flex w-[48px] flex-none flex-col overflow-hidden rounded-[10px] border text-center" style={{ borderColor: "var(--glass-border)" }}>
        <span className="py-[2px] text-[9.5px] leading-[13px] font-bold tracking-[0.08em] uppercase" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)", color: "var(--muted-foreground)" }}>Date</span>
        <span className="py-[4px] text-[18px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>?</span>
      </span>
    );
  }
  const d = new Date(`${time.iso}T12:00:00`);
  const closed = time.status === "closed";
  const tone = closed ? "var(--muted-foreground)" : time.tone === "soon" ? AMBER : "var(--primary)";
  return (
    <span
      aria-label={closesShort(time)}
      title={closesShort(time)}
      className="flex w-[48px] flex-none flex-col overflow-hidden rounded-[10px] text-center"
      style={{ boxShadow: "0 8px 18px -10px rgba(0,0,0,0.6)", outline: time.approx ? "1.5px dashed color-mix(in srgb, var(--foreground) 22%, transparent)" : undefined, outlineOffset: time.approx ? 2 : undefined }}
    >
      <span aria-hidden className="py-[2px] text-[9.5px] leading-[13px] font-bold tracking-[0.08em] uppercase" style={{ background: tone, color: "#fff" }}>{MONTHS[d.getMonth()]}</span>
      <span aria-hidden className="py-[4px] text-[19px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", background: "color-mix(in srgb, var(--foreground) 9%, transparent)", color: "var(--foreground)" }}>{d.getDate()}</span>
    </span>
  );
}

/** The award (or what a program costs) as the card's one big figure. */
function Award({ item }: { item: Item }) {
  const display = { fontFamily: "var(--font-display)" } as const;
  if (item.type === "scholarship") {
    const a = amountShort(item);
    const up = a.startsWith("Up to ");
    return (
      <span className="flex min-w-0 flex-col">
        <span className="text-[11px] leading-[14px] font-semibold" style={MUTED}>{up ? "Up to" : "Award"}</span>
        <span className="truncate text-[21px] leading-[26px] font-extrabold tabular-nums" style={{ ...display, color: a === "Varies" ? "var(--foreground)" : GREEN }}>{up ? a.slice(6) : a}</span>
      </span>
    );
  }
  const tone = costTone(item.paid);
  return (
    <span className="flex min-w-0 flex-col">
      <span className="text-[11px] leading-[14px] font-semibold" style={MUTED}>{PROGRAM_KIND[item.kind].label}</span>
      <span className="truncate text-[18px] leading-[26px] font-extrabold" style={{ ...display, color: tone === "good" ? GREEN : tone === "plain" ? "var(--foreground)" : "var(--muted-foreground)" }}>{PAID[item.paid]}</span>
    </span>
  );
}

/** One signal, never more: why this one is here (Chandu, 1 Oct 2026: "the
 *  cards should say why it's being recommended, some sort of signal, not a
 *  whole copy sentence"). In order: your Top 3, your GPA, your state, a
 *  partner post, else the plain fact that your grade can apply. A later one
 *  says when it opens to you. */
export function signalFor({ item, fit }: Enriched): { signal: string | null; strong: boolean } {
  const partner = item.type === "program" && item.postedBy;
  const top3 = fit.reasons.some((r) => r.startsWith("Fits your Top 3"));
  const gpa = fit.reasons.some((r) => /GPA/.test(r));
  const state = fit.reasons.find((r) => r.startsWith("Open in "));
  const gradeOk = fit.reasons.find((r) => /can apply$/.test(r));
  const signal = fit.when === "later" ? (item.grades.length ? `Grade ${Math.min(...item.grades)}` : "College")
    : top3 ? "Fits your Top 3" : gpa ? "Your GPA fits" : state ? state.replace("Open in ", "In ") : partner ? "Partner post" : gradeOk ?? null;
  return { signal, strong: fit.when === "now" && (top3 || gpa || !!state) };
}

export function Card({ e, on = false, status, onOpen, onSave }: { e: Enriched; on?: boolean; status: OpportunityStatus | null; onOpen: () => void; onSave: () => void }) {
  const { item, fit, time } = e;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const { signal, strong } = signalFor(e);
  const soon = time.status === "open" && time.tone === "soon" && time.days !== null;
  const world = fieldWorld(item.fields);
  return (
    <HoverBeam strength={0.7}>
      <article
        aria-current={on ? "true" : undefined}
        className="dm-tap dm-glass-2 relative flex h-full flex-col gap-[18px] overflow-hidden rounded-[var(--radius-lg)] border p-[18px] backdrop-blur-[24px] backdrop-saturate-[1.65]"
        style={{
          borderColor: on ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--glass-border)",
          // The career world's colour as a faint light in the corner: each
          // card gets an identity without a chip or a tint over the text.
          background: `${world ? `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${world.color} 13%, transparent), transparent 55%), ` : ""}${on ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-2))" : "var(--glass-surface-2)"}`,
          opacity: fit.when === "later" ? 0.82 : 1,
        }}
      >
        {/* The whole card opens the detail; everything else lets the click through. */}
        <button type="button" onClick={onOpen} aria-label={`Open ${item.name}`} className="dm-quiet absolute inset-0 z-[1] cursor-pointer rounded-[var(--radius-lg)]" />
        <header className="pointer-events-none relative z-[2] flex items-start gap-[14px]">
          <DateLeaf time={time} />
          <div className="flex min-w-0 flex-1 flex-col gap-[3px] pt-[1px]">
            <span className="line-clamp-2 text-[16px] leading-[21px] font-bold" style={{ textWrap: "balance" }}>{item.name}</span>
            <span className="line-clamp-1 text-[12.5px] leading-[17px]" style={MUTED}>{who}</span>
            {soon && <span className="text-[12px] leading-[16px] font-bold" style={{ color: AMBER }}>{time.days === 0 ? "Closes today" : `${time.days} day${time.days === 1 ? "" : "s"} left`}</span>}
          </div>
          <span className="pointer-events-auto -mt-[4px] -mr-[4px] flex-none"><SaveDot on={!!status} name={item.name} onToggle={onSave} size={34} /></span>
        </header>
        <footer className="pointer-events-none relative mt-auto flex items-end justify-between gap-[12px] border-t pt-[14px]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
          <Award item={item} />
          <span className="flex flex-none flex-col items-end gap-[5px]">
            {status && status !== "saved" && <span className="flex h-[22px] items-center gap-[4px] rounded-full px-[8px] text-[11.5px] font-bold" style={{ background: status === "won" ? "rgba(52,199,140,0.16)" : "color-mix(in srgb, var(--primary) 18%, transparent)", color: status === "won" ? GREEN : SOFT }}>{status === "won" ? <Trophy className="h-3 w-3" aria-hidden /> : <ClipboardCheck className="h-3 w-3" aria-hidden />}{STATUS_WORD[status]}</span>}
            {signal && <span className="flex items-center gap-[4px] text-[12px] leading-[16px] font-semibold" style={{ color: strong ? SOFT : "var(--muted-foreground)" }}>{strong && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}{signal}</span>}
          </span>
        </footer>
      </article>
    </HoverBeam>
  );
}

/** The list row (6 Oct 2026): everything after the best fits is a calm list,
 *  not more boxes (Chandu: the grid was "too basic and a lot at once").
 *  Same facts as the card in one line: the date leaf, the name and who
 *  gives it with the one reason when it is a real one (Top 3, GPA,
 *  state; not "Grade 11 can apply", which every row would say), the
 *  award, Save. No box around each row;
 *  a hairline between them and a soft hover fill. */
export function Row({ e, status, onOpen, onSave }: { e: Enriched; status: OpportunityStatus | null; onOpen: () => void; onSave: () => void }) {
  const { item, time, fit } = e;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const { signal, strong } = signalFor(e);
  const soon = time.status === "open" && time.tone === "soon" && time.days !== null;
  const tone = item.type === "program" ? costTone(item.paid) : null;
  const figure = item.type === "scholarship" ? amountShort(item) : tone ? PAID[item.paid] : "";
  return (
    <div className="group relative flex items-center gap-[14px] rounded-[14px] px-[10px] py-[12px] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]" style={{ opacity: fit.when === "later" ? 0.82 : 1 }}>
      <button type="button" onClick={onOpen} aria-label={`Open ${item.name}`} className="dm-quiet absolute inset-0 z-[1] cursor-pointer rounded-[14px]" />
      <span className="pointer-events-none relative"><DateLeaf time={time} /></span>
      <span className="pointer-events-none relative flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="line-clamp-2 text-[15px] leading-[20px] font-bold">{item.name}</span>
        <span className="flex min-w-0 items-center gap-[6px] text-[12.5px] leading-[17px]" style={MUTED}>
          <span className="truncate">{who}</span>
          {soon ? (
            <span className="flex-none font-bold" style={{ color: AMBER }}>· {time.days === 0 ? "Closes today" : `${time.days} day${time.days === 1 ? "" : "s"} left`}</span>
          ) : status && status !== "saved" ? (
            <span className="flex-none font-bold" style={{ color: status === "won" ? GREEN : SOFT }}>· {STATUS_WORD[status]}</span>
          ) : signal && (strong || fit.when === "later") ? (
            <span className="hidden flex-none items-center gap-[3px] font-semibold sm:flex" style={{ color: strong ? SOFT : undefined }}>· {strong && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}{signal}</span>
          ) : null}
        </span>
      </span>
      {figure && (
        <span className="pointer-events-none relative flex-none text-right text-[16px] leading-[20px] font-extrabold tabular-nums sm:text-[17px]" style={{ fontFamily: "var(--font-display)", color: figure === "Varies" || tone === "plain" ? "var(--foreground)" : GREEN }}>
          {figure.startsWith("Up to ") ? <><span className="block text-[10.5px] leading-[13px] font-semibold" style={{ ...MUTED, fontFamily: "var(--font-body)" }}>Up to</span>{figure.slice(6)}</> : figure}
        </span>
      )}
      <span className="relative z-[2] flex-none"><SaveDot on={!!status} name={item.name} onToggle={onSave} size={32} /></span>
    </div>
  );
}
