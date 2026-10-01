"use client";

// The same-page preview (1 Oct 2026). Chandu ruled out a fixed side sheet
// ("too narrow and sits very far on large screens"), a modal, a new page
// for every click, and a panel beneath the row: "let's do the side by
// side itself... open only on clicking something, and visually distinct
// from the normal cards." So nothing is open until a card is clicked;
// then the grid narrows and this pane sits beside it, in the page flow
// (never fixed to the window edge): a band in the provider's own hue with
// its mark and the name, the facts, the actions, why it fits, and a way
// to the full page. Phones show the same pane as a sheet.
//
// Then: "the preview should still have a more distinct UI, it still reads
// as a new card, and it should have a close button." So it is not a glass
// card: a header strip that says PREVIEW with a labelled Close and the
// Full page link, a taller hero with the name set in the display face
// (the cards use sentence case, the full page uses this).
//
// Then: "it's still just a card. It should look like a sidebar... like
// LinkedIn does, a second pane in the page itself, adjustable left edge,
// scrollable within the panel, but not separate like a sheet." So on
// desktop `mode="pane"`: flat, no radius, a hairline on its left edge, it
// runs to the page's right edge, fills the height under the filter bar and
// scrolls on its own with the header strip pinned; the details are open
// (the pane opening is the disclosure). Phones keep `mode="sheet"`.

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, BookmarkCheck, Check, ChevronDown, ClipboardCheck, ChevronRight, Undo2, X } from "lucide-react";
import { DISPLAY } from "@/components/career/CareerDetailExperience";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { seedHash, shortDate } from "@/lib/localRecord";
import type { OpportunityStatus } from "@/lib/opportunities";
import { PAID, PROGRAM_KIND, SCHOLARSHIP_KIND } from "./types";
import { gradeWord, stateName } from "./match";
import { OrgMark, hostOf } from "./OrgMark";
import { AMBER, AwardChip, GREEN, MUTED, amountShort, costTone, type Enriched } from "./Card";

const LABEL = "text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase";
function checkedOn(v: string): string { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }

function Fact({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[4px]">
      <span className={LABEL} style={MUTED}>{label}</span>
      <span className="text-[16px] leading-[21px] font-bold" style={tone ? { color: tone } : undefined}>{value}</span>
    </div>
  );
}

export function Preview({ e, status, setStatus, undo, onClose, mode = "sheet" }: { e: Enriched; status: OpportunityStatus | null; setStatus: (s: OpportunityStatus | null) => void; undo?: () => void; onClose: () => void; mode?: "pane" | "sheet" }) {
  const { item, fit, time } = e;
  const pane = mode === "pane";
  const [moreOpen, setMore] = useState(false);
  const more = pane || moreOpen;
  const host = hostOf(item.url);
  const hue = seedHash(host) % 360;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const kind = item.type === "scholarship" ? SCHOLARSHIP_KIND[item.kind].label : PROGRAM_KIND[item.kind].label;
  const applied = status === "applied" || status === "won";
  const closes = time.status === "unknown" ? "Not posted yet" : time.status === "closed" ? `Closed ${shortDate(time.iso!)}` : shortDate(time.iso!);
  const reasons = [...fit.reasons.map((r) => ({ r, ok: true })), ...fit.checks.map((r) => ({ r, ok: false }))].slice(0, 3);
  const btn = "dm-quiet flex h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[11px] border px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap";
  const outline = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;
  const onTone = { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--foreground)" } as const;

  return (
    <motion.article initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }} aria-label={`${item.name}, preview`}
      className={pane ? "relative flex min-h-full flex-col" : "relative flex flex-col overflow-hidden rounded-[24px]"} style={pane ? undefined : { background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", boxShadow: `0 0 0 1px hsl(${hue} 45% 55% / 0.55), 0 30px 80px -40px rgba(0,0,0,0.85)` }}>
      {/* The header strip: what this is, and the two ways out. Pinned while the pane scrolls. */}
      <div className={`flex h-[46px] flex-none items-center justify-between gap-[10px] border-b pr-[10px] pl-[18px] ${pane ? "sticky top-0 z-[2]" : ""}`} style={{ borderColor: "var(--glass-border)", background: pane ? "color-mix(in srgb, var(--background) 96%, var(--foreground))" : "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>
        <span className="text-[11.5px] leading-[14px] font-bold tracking-[0.1em] uppercase" style={MUTED}>Preview</span>
        <span className="flex items-center gap-[4px]">
          <Link href={`/opportunities/${item.id}`} className="dm-quiet flex h-[32px] items-center gap-[3px] rounded-full px-[10px] text-[13px] font-bold" style={{ color: SOFT }}>Full page <ChevronRight className="h-4 w-4" aria-hidden /></Link>
          <button type="button" onClick={onClose} className="dm-quiet flex h-[32px] cursor-pointer items-center gap-[5px] rounded-full border px-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}><X className="h-3.5 w-3.5" aria-hidden />Close</button>
        </span>
      </div>
      {/* The band: the provider's hue, its mark, the kind, the name in the display face. */}
      <div className="relative flex min-h-[220px] flex-col justify-end gap-[14px] p-[22px] pt-[28px]" style={{ background: `linear-gradient(160deg, hsl(${hue} 46% 32%) 0%, hsl(${(hue + 36) % 360} 44% 16%) 100%)` }}>
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.45) 0%, transparent 60%)" }} />
        <OrgMark url={item.url} name={who} size={64} className="relative shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]" />
        <div className="relative flex flex-col gap-[8px]">
          <span className={LABEL} style={{ color: "rgba(255,255,255,0.72)" }}>{item.type === "program" && item.postedBy ? `Posted by ${item.postedBy.org}` : kind}</span>
          <h2 className="text-[24px] leading-[1.08] font-extrabold uppercase" style={{ ...DISPLAY, color: "#fff", textWrap: "balance" }}>{item.name}</h2>
          <p className="text-[13.5px] leading-[19px]" style={{ color: "rgba(255,255,255,0.78)" }}>{who}{item.type === "program" ? ` · ${item.location.split("(")[0].trim()}` : ""}</p>
        </div>
        <div className="relative flex"><AwardChip item={item} /></div>
      </div>

      {/* The facts, the actions, why it fits; the rest behind Details. */}
      <div className="flex flex-col gap-[18px] p-[22px]">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="grid flex-1 grid-cols-2 gap-x-[16px] gap-y-[14px] sm:grid-cols-3 lg:grid-cols-2">
            <Fact label={time.approx ? "Usually closes" : "Closes"} value={closes} tone={time.tone === "soon" ? AMBER : undefined} />
            <Fact label="Who can apply" value={gradeWord(item.grades)} />
            {item.type === "program" ? <Fact label="When" value={item.when ? item.when.split(/[,;(]/)[0].trim() : "See their page"} /> : item.renewable !== null ? <Fact label="Renews" value={item.renewable ? "Each year" : "One time"} /> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid text-white`} style={{ background: ACCENT, borderColor: ACCENT }}>
            {host.length <= 22 ? `Apply on ${host}` : "Apply"} <ArrowUpRight className="h-4 w-4 flex-none" aria-hidden />
          </a>
          <button type="button" aria-pressed={!!status} onClick={() => setStatus(status ? null : "saved")} className={btn} style={status ? onTone : outline}>
            {status ? <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-4 w-4" aria-hidden />}{status ? "Saved" : "Save"}
          </button>
          <button type="button" aria-pressed={applied} onClick={() => setStatus(applied ? "saved" : "applied")} className={btn} style={applied ? onTone : outline}>
            <ClipboardCheck className="h-4 w-4" aria-hidden style={applied ? { color: SOFT } : undefined} />{status === "won" ? "Got it" : applied ? "Applied" : "I applied"}
          </button>
          {(status === "applied" || undo) && (
            <span className="flex flex-wrap items-center gap-x-[10px] text-[13px] leading-[18px]" style={MUTED}>
              {status === "applied" && <>Heard back? <button type="button" onClick={() => setStatus("won")} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>I got it</button></>}
              {undo && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
            </span>
          )}
        </div>

        {reasons.length > 0 && (
          <section className="flex flex-col gap-[8px] border-t pt-[16px]" style={{ borderColor: "var(--glass-border)" }}>
            <h3 className={LABEL} style={MUTED}>Fits you</h3>
            <ul className="flex flex-col gap-[5px]">
              {reasons.map(({ r, ok }) => <li key={r} className="flex items-start gap-[8px] text-[14px] leading-[20px]">{ok ? <Check className="mt-[3px] h-3.5 w-3.5 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} /> : <span aria-hidden className="mt-[7px] size-[6px] flex-none rounded-full" style={{ background: AMBER }} />}{r}</li>)}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-[12px] border-t pt-[12px]" style={{ borderColor: "var(--glass-border)" }}>
          {pane ? (
            <h3 className={LABEL} style={MUTED}>Details</h3>
          ) : (
            <button type="button" aria-expanded={more} onClick={() => setMore((m) => !m)} className="dm-quiet -mx-[6px] flex w-fit cursor-pointer items-center gap-[6px] rounded-[8px] px-[6px] py-[4px] text-left text-[14px] leading-[20px] font-bold">
              Details <ChevronDown className="h-4 w-4 transition-transform" aria-hidden style={{ color: "var(--muted-foreground)", transform: more ? "rotate(180deg)" : "none" }} />
            </button>
          )}
          {more && (
            <div className="flex flex-col gap-[14px]">
              <div className="flex flex-col gap-[6px]">
                <h3 className={LABEL} style={MUTED}>Who it is for</h3>
                <p className="text-[14px] leading-[20px]">{item.eligibility}</p>
                {item.type === "scholarship" && item.amount !== amountShort(item) && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.amount}</p>}
                {item.type === "program" && item.costNote && <p className="text-[13px] leading-[18px]" style={costTone(item.paid) === "good" ? { color: GREEN } : MUTED}>{item.costNote}</p>}
                {item.type === "program" && item.paid !== "unknown" && !item.costNote && <p className="text-[13px] leading-[18px]" style={MUTED}>{PAID[item.paid]}</p>}
                {!item.states.includes("Any") && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.states.includes("Remote") ? "Online, from anywhere." : `${item.states.map(stateName).join(", ")} only.`}</p>}
              </div>
              {item.requires.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <h3 className={LABEL} style={MUTED}>Bring</h3>
                  <ul className="flex flex-wrap gap-[6px]">
                    {item.requires.map((r) => <li key={r} className="flex min-h-[28px] items-center rounded-full border px-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>{r}</li>)}
                  </ul>
                </div>
              )}
              {(time.approx || time.status === "unknown") && item.deadlineNote && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.deadlineNote}</p>}
              <p className="text-[12.5px] leading-[17px]" style={MUTED}>Checked on {host}, {checkedOn(item.verifiedOn)}. Applying happens on their site.{item.type === "scholarship" ? " A real scholarship never asks for a credit card." : ""}</p>
            </div>
          )}
        </section>
      </div>
    </motion.article>
  );
}
