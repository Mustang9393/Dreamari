"use client";

// The expanded card (1 Oct 2026). After a drawer, a side-by-side card, a
// page, a panel beneath the row and a resizable pane, Chandu asked "what
// is objectively the best UX here?" and picked the container transform
// (App Store Today, Pinterest's closeup, Material): the card you clicked
// grows into this, centred over the dimmed grid, and shrinks back when
// closed. So this is the card's own content continued, not another
// surface: the mark, the kind, the name, who gives it, the award chip,
// then the facts, the actions, why it fits and the details, with previous
// and next to move through the list without going back to the grid.
//
// The cover carries one piece of information (Chandu: "if we can make it
// make sense and have some logic we can keep the covers"): which of the
// student's career worlds this belongs to. Every opportunity has a field;
// fields map onto Dreamari's worlds, and the worlds already own a colour
// everywhere else (Explore's posters, Connect's boards). So a Tech &
// Engineering scholarship wears the Tech world's colour, the same recipe
// PosterCard uses, and the eyebrow names the world so the colour is read,
// not guessed. Open to any field: the neutral surface.

import Link from "next/link";
import { ArrowUpRight, Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, ClipboardCheck, Undo2, X } from "lucide-react";
import { DISPLAY } from "@/components/career/CareerDetailExperience";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { shortDate } from "@/lib/localRecord";
import type { OpportunityStatus } from "@/lib/opportunities";
import { PAID, PROGRAM_KIND, SCHOLARSHIP_KIND } from "./types";
import { fieldWorld, gradeWord, stateName } from "./match";
import { OrgMark, hostOf } from "./OrgMark";
import { AMBER, AwardChip, GREEN, MUTED, amountShort, costTone, type Enriched } from "./Card";

const LABEL = "text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase";
const H3 = "text-[15.5px] leading-[20px] font-bold";
function checkedOn(v: string): string { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }

function Fact({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[4px]">
      <span className={LABEL} style={MUTED}>{label}</span>
      <span className="text-[16px] leading-[21px] font-bold" style={tone ? { color: tone } : undefined}>{value}</span>
    </div>
  );
}

/** The world band: PosterCard's own gradient recipe, in the field's world colour. */
export function worldBand(color: string | null): React.CSSProperties {
  return color
    ? { background: `linear-gradient(155deg, color-mix(in srgb, ${color} 34%, var(--card)) 0%, color-mix(in srgb, ${color} 10%, var(--card)) 100%)` }
    : { background: "linear-gradient(155deg, color-mix(in srgb, var(--foreground) 9%, var(--card)) 0%, var(--card) 100%)" };
}

export function Expanded({ e, status, setStatus, undo, onClose, onPrev, onNext, position }: {
  e: Enriched; status: OpportunityStatus | null; setStatus: (s: OpportunityStatus | null) => void; undo?: () => void; onClose: () => void;
  onPrev?: () => void; onNext?: () => void; position?: string;
}) {
  const { item, fit, time } = e;
  const host = hostOf(item.url);
  const who = item.type === "scholarship" ? item.provider : item.org;
  const kind = item.type === "scholarship" ? SCHOLARSHIP_KIND[item.kind].label : PROGRAM_KIND[item.kind].label;
  const world = fieldWorld(item.fields);
  const applied = status === "applied" || status === "won";
  const closes = time.status === "unknown" ? "Not posted yet" : time.status === "closed" ? `Closed ${shortDate(time.iso!)}` : shortDate(time.iso!);
  const reasons = [...fit.reasons.map((r) => ({ r, ok: true })), ...fit.checks.map((r) => ({ r, ok: false }))];
  const btn = "dm-quiet flex h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[11px] border px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap";
  const outline = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;
  const onTone = { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--foreground)" } as const;
  const nav = "dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-35";

  return (
    <div className="flex min-h-full flex-col">
      {/* The strip: where you are in the list, the two ways out. Pinned while the card scrolls. */}
      <div className="sticky top-0 z-[2] flex h-[48px] flex-none items-center justify-between gap-[10px] border-b px-[12px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 96%, var(--foreground))" }}>
        <span className="flex items-center gap-[6px]">
          <button type="button" aria-label="Previous" onClick={onPrev} disabled={!onPrev} className={nav} style={outline}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
          <button type="button" aria-label="Next" onClick={onNext} disabled={!onNext} className={nav} style={outline}><ChevronRight className="h-4 w-4" aria-hidden /></button>
          {position && <span className="pl-[4px] text-[12.5px] font-semibold tabular-nums" style={MUTED}>{position}</span>}
        </span>
        <span className="flex items-center gap-[4px]">
          <Link href={`/opportunities/${item.id}`} className="dm-quiet flex h-[32px] items-center gap-[3px] rounded-full px-[10px] text-[13px] font-bold" style={{ color: SOFT }}>Full page <ChevronRight className="h-4 w-4" aria-hidden /></Link>
          <button type="button" onClick={onClose} className="dm-quiet flex h-[32px] cursor-pointer items-center gap-[5px] rounded-full border px-[10px] text-[13px] font-semibold" style={outline}><X className="h-3.5 w-3.5" aria-hidden />Close</button>
        </span>
      </div>

      {/* 1. Who and what: the world band, the mark, the kind, the name, who gives it. */}
      <header className="flex flex-col gap-[16px] px-[24px] pt-[24px] pb-[22px] sm:px-[28px]" style={worldBand(world?.color ?? null)}>
        <div className="flex items-start gap-[16px]">
          <OrgMark url={item.url} name={who} size={60} />
          <div className="flex min-w-0 flex-1 flex-col gap-[6px] pt-[2px]">
            <span className={LABEL} style={{ color: world ? `color-mix(in srgb, ${world.color} 70%, #fff)` : "var(--muted-foreground)" }}>
              {world ? world.name : "Any field"}<span style={MUTED}> · {item.type === "program" && item.postedBy ? `Posted by ${item.postedBy.org}` : kind}</span>
            </span>
            <h2 className="text-[26px] leading-[1.08] font-extrabold uppercase sm:text-[30px]" style={{ ...DISPLAY, textWrap: "balance" }}>{item.name}</h2>
            <p className="text-[14.5px] leading-[20px]" style={MUTED}>{who}{item.type === "program" ? ` · ${item.location.split("(")[0].trim()}` : ""}</p>
          </div>
        </div>
      </header>

      {/* 2. Do: the award, then the three actions, on their own row. */}
      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[10px] border-y px-[24px] py-[14px] sm:px-[28px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
        <AwardChip item={item} />
        <span className="ml-auto flex flex-wrap items-center gap-[8px]">
          <button type="button" aria-pressed={!!status} onClick={() => setStatus(status ? null : "saved")} className={btn} style={status ? onTone : outline}>
            {status ? <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-4 w-4" aria-hidden />}{status ? "Saved" : "Save"}
          </button>
          <button type="button" aria-pressed={applied} onClick={() => setStatus(applied ? "saved" : "applied")} className={btn} style={applied ? onTone : outline}>
            <ClipboardCheck className="h-4 w-4" aria-hidden style={applied ? { color: SOFT } : undefined} />{status === "won" ? "Got it" : applied ? "Applied" : "I applied"}
          </button>
          <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid text-white`} style={{ background: ACCENT, borderColor: ACCENT }}>
            {host.length <= 22 ? `Apply on ${host}` : "Apply"} <ArrowUpRight className="h-4 w-4 flex-none" aria-hidden />
          </a>
        </span>
        {(status === "applied" || undo) && (
          <span className="flex w-full flex-wrap items-center gap-x-[10px] text-[13px] leading-[18px]" style={MUTED}>
            {status === "applied" && <>Heard back? <button type="button" onClick={() => setStatus("won")} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>I got it</button></>}
            {undo && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-[28px] px-[24px] py-[24px] sm:px-[28px]">
        {/* 3. At a glance: the four numbers a student decides on. */}
        <section className="grid grid-cols-2 gap-x-[16px] gap-y-[16px] sm:grid-cols-4">
          <Fact label={time.approx ? "Usually closes" : "Closes"} value={closes} tone={time.tone === "soon" ? AMBER : undefined} />
          <Fact label="Who can apply" value={gradeWord(item.grades)} />
          {item.type === "program"
            ? <Fact label="When" value={item.when ? item.when.split(/[,;(]/)[0].trim() : "See their page"} />
            : <Fact label="Renews" value={item.renewable === null ? "Not stated" : item.renewable ? "Each year" : "One time"} />}
          {item.type === "program"
            ? <Fact label="Pay" value={item.paid === "unknown" ? "Not listed" : PAID[item.paid]} tone={costTone(item.paid) === "good" ? GREEN : undefined} />
            : <Fact label="Based on" value={kind.replace(/^Based on /, "").replace(/^For /, "")} />}
        </section>

        {/* 4. Fit and eligibility, side by side. */}
        <div className="grid gap-[24px] border-t pt-[24px] sm:grid-cols-2" style={{ borderColor: "var(--glass-border)" }}>
          <section className="flex flex-col gap-[10px]">
            <h3 className={H3}>Why it fits you</h3>
            {reasons.length ? (
              <ul className="flex flex-col gap-[7px]">
                {reasons.map(({ r, ok }) => <li key={r} className="flex items-start gap-[9px] text-[14.5px] leading-[21px]">{ok ? <Check className="mt-[4px] h-3.5 w-3.5 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} /> : <span aria-hidden className="mt-[8px] size-[6px] flex-none rounded-full" style={{ background: AMBER }} />}{r}</li>)}
              </ul>
            ) : <p className="text-[14.5px] leading-[21px]" style={MUTED}>Open to everyone in your grade.</p>}
          </section>
          <section className="flex flex-col gap-[10px]">
            <h3 className={H3}>Who it is for</h3>
            <p className="text-[14.5px] leading-[21px]">{item.eligibility}</p>
            {!item.states.includes("Any") && <p className="text-[13.5px] leading-[19px]" style={MUTED}>{item.states.includes("Remote") ? "Online, from anywhere." : `${item.states.map(stateName).join(", ")} only.`}</p>}
          </section>
        </div>

        {/* 5. The money or the cost, in the provider's own words, when the chip cannot carry it. */}
        {((item.type === "scholarship" && item.amount !== amountShort(item)) || (item.type === "program" && item.costNote)) && (
          <section className="flex flex-col gap-[10px] border-t pt-[24px]" style={{ borderColor: "var(--glass-border)" }}>
            <h3 className={H3}>{item.type === "scholarship" ? "The award" : "The cost"}</h3>
            <p className="text-[14.5px] leading-[21px]">{item.type === "scholarship" ? item.amount : item.costNote}</p>
          </section>
        )}

        {/* 6. What to bring. */}
        {item.requires.length > 0 && (
          <section className="flex flex-col gap-[10px] border-t pt-[24px]" style={{ borderColor: "var(--glass-border)" }}>
            <h3 className={H3}>What to bring</h3>
            <ul className="flex flex-wrap gap-[6px]">
              {item.requires.map((r) => <li key={r} className="flex min-h-[30px] items-center rounded-full border px-[11px] text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>{r}</li>)}
            </ul>
          </section>
        )}

        {/* 7. Dates, when there is more to say than the one date above. */}
        {(item.opens || item.deadlineNote) && (
          <section className="flex flex-col gap-[10px] border-t pt-[24px]" style={{ borderColor: "var(--glass-border)" }}>
            <h3 className={H3}>Dates</h3>
            <p className="text-[14.5px] leading-[21px]">
              {item.opens ? `Opens ${/^\d{4}-\d{2}-\d{2}$/.test(item.opens) ? shortDate(item.opens) : item.opens.replace(/^(\d{4})-(\d{2})$/, (_m, y, mo) => `${["January","February","March","April","May","June","July","August","September","October","November","December"][Number(mo) - 1]} ${y}`)}. ` : ""}
              {item.deadlineNote ?? ""}
            </p>
          </section>
        )}

        <p className="text-[12.5px] leading-[17px]" style={MUTED}>
          Checked on {host}, {checkedOn(item.verifiedOn)}. Applying happens on their site, not here.{item.type === "scholarship" ? " A real scholarship never asks for a credit card." : ""}{item.type === "program" && item.postedBy ? " Posted by a Dreamari partner; details not checked by Dreamari." : ""}
        </p>
      </div>
    </div>
  );
}
