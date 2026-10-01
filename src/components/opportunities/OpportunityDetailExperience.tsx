"use client";

// One opportunity's own page (1 Oct 2026). Chandu: the slide-over "is too
// narrow and sits very far on large screens", and the detail "should read
// like it's the detailed page". So every card opens a page, the way a
// career and a school each have one, and Back returns to the grid.
//
// Top to bottom, the same story as the card, told fully:
// 1. A hero in the provider's own hue with its mark, the kind, the name
//    in the display face, who gives it and where.
// 2. Left: the facts (award, closes, who can apply, how long), why it fits
//    you, who it is for, what to bring, where it was checked.
//    Right (sticky): Apply, Save, I applied, then three more like it.
// Nothing is applied for here; Apply always goes to the provider.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bookmark, BookmarkCheck, Check, ClipboardCheck, Undo2 } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { BackButton, DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { EmptyView } from "@/components/app/states";
import { DISPLAY, PANEL } from "@/components/career/CareerDetailExperience";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { shortDate } from "@/lib/localRecord";
import { opportunityStore, setOpportunityStatus, type OpportunityStatus } from "@/lib/opportunities";
import { PAID, PROGRAM_KIND, SCHOLARSHIP_KIND } from "./types";
import { fieldWorld, fitFor, gradeWord, stateName, timing, today, useStudent } from "./match";
import { worldBand } from "./Preview";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS, findOpportunity } from "./data";
import { OrgMark, hostOf } from "./OrgMark";
import { AMBER, AwardChip, Card, GREEN, MUTED, amountShort, costTone, type Enriched } from "./Card";

const H2 = "text-[20px] leading-[26px] font-extrabold";
const LABEL = "text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase";
function checkedOn(v: string): string { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
      {title && <h2 className={H2} style={DISPLAY}>{title}</h2>}
      {children}
    </section>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[5px]">
      <span className={LABEL} style={MUTED}>{label}</span>
      <span className="text-[17px] leading-[22px] font-bold" style={tone ? { color: tone } : undefined}>{value}</span>
    </div>
  );
}

export function OpportunityDetailExperience({ id }: { id: string }) {
  const router = useRouter();
  const item = findOpportunity(id);
  const student = useStudent();
  const record = opportunityStore.useValue();
  const [todayIso] = useState(() => today());
  const [last, setLast] = useState<OpportunityStatus | null | undefined>(undefined);

  if (!item) {
    return (
      <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
        <AppBackdrop />
        <DesktopNavigation active="Opportunities" />
        <main className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col px-5 pt-[var(--space-10)] pb-[140px]">
          <EmptyView tier={4} heading="We could not find that one" line="It may have closed or moved." cta="Back to Opportunities" onAction={() => router.push("/opportunities")} />
        </main>
        <MobileNav active="Opportunities" />
      </div>
    );
  }

  const fit = fitFor(item, student);
  const time = timing(item, todayIso);
  const status = record.status[item.id]?.status ?? null;
  const host = hostOf(item.url);
  const world = fieldWorld(item.fields);
  const who = item.type === "scholarship" ? item.provider : item.org;
  const kind = item.type === "scholarship" ? SCHOLARSHIP_KIND[item.kind].label : PROGRAM_KIND[item.kind].label;
  const applied = status === "applied" || status === "won";
  const tab = item.type === "scholarship" ? "scholarships" : item.kind === "internship" || item.kind === "apprenticeship" ? "internships" : "programs";
  const pool = tab === "scholarships" ? SCHOLARSHIP_ITEMS : tab === "internships" ? INTERNSHIP_ITEMS : PROGRAM_ITEMS;
  const more: Enriched[] = pool
    .filter((i) => i.id !== item.id)
    .map((i) => ({ item: i, fit: fitFor(i, student), time: timing(i, todayIso) }))
    .filter((e) => e.fit.when !== "no")
    .sort((a, b) => {
      const shared = (e: Enriched) => (e.item.fields.some((f) => item.fields.includes(f)) ? 1 : 0);
      return shared(b) - shared(a) || (a.fit.when === b.fit.when ? b.fit.score - a.fit.score : a.fit.when === "now" ? -1 : 1);
    })
    .slice(0, 3);

  const setStatus = (next: OpportunityStatus | null) => { setLast(status); setOpportunityStatus(item.id, next); };
  const undo = () => { if (last !== undefined) { setOpportunityStatus(item.id, last); setLast(undefined); } };
  const closes = time.status === "unknown" ? "Not posted yet" : time.status === "closed" ? `Closed ${shortDate(time.iso!)}` : shortDate(time.iso!);
  const reasons = [...fit.reasons.map((r) => ({ r, ok: true })), ...fit.checks.map((r) => ({ r, ok: false }))];
  const btn = "dm-quiet flex h-[44px] cursor-pointer items-center justify-center gap-[7px] rounded-[11px] border px-[14px] text-[14.5px] leading-[18px] font-semibold whitespace-nowrap";
  const outline = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;
  const onTone = { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--foreground)" } as const;

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation active="Opportunities" />
      <MobileHeaderShell>
        <span className="flex items-center gap-[var(--space-3)]"><BackButton fallback="/opportunities" /><Wordmark /></span>
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col gap-[var(--space-5)] px-5 pt-2 pb-[140px] md:px-8 md:pt-[var(--space-10)]">
        {/* 1. The hero: the world band (the field's world colour, as Explore's
           posters use it), the mark, the name. */}
        <section className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ ...PANEL, ...worldBand(world?.color ?? null) }}>
          <span className="absolute top-[16px] left-[16px] z-20 hidden md:block"><BackButton fallback="/opportunities" /></span>
          <div className="relative flex min-h-[240px] flex-col justify-end gap-[var(--space-4)] p-[var(--space-6)] pt-[72px] sm:p-[var(--space-8)] sm:pt-[88px]">
            <OrgMark url={item.url} name={who} size={72} className="shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]" />
            <div className="flex flex-col gap-[8px]">
              <span className={LABEL} style={{ color: world ? `color-mix(in srgb, ${world.color} 70%, #fff)` : "var(--muted-foreground)" }}>{world ? world.name : "Any field"}<span style={MUTED}> · {item.type === "program" && item.postedBy ? `Posted by ${item.postedBy.org}` : kind}</span></span>
              <h1 className="text-[30px] leading-[1.05] font-extrabold uppercase sm:text-[42px]" style={{ ...DISPLAY, textWrap: "balance" }}>{item.name}</h1>
              <p className="text-[15px] leading-[21px]" style={MUTED}>{who}{item.type === "program" ? ` · ${item.location}` : ""}</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-[var(--space-5)] lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* Right rail first in the DOM so phones get the actions right under the hero. */}
          <div className="flex flex-col gap-[var(--space-5)] lg:sticky lg:top-[88px] lg:col-start-2 lg:row-start-1">
            <Panel>
              <div className="flex"><AwardChip item={item} /></div>
              <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid w-full text-white`} style={{ background: ACCENT, borderColor: ACCENT }}>
                {host.length <= 22 ? `Apply on ${host}` : "Apply"} <ArrowUpRight className="h-4 w-4 flex-none" aria-hidden />
              </a>
              <div className="grid grid-cols-2 gap-[8px]">
                <button type="button" aria-pressed={!!status} onClick={() => setStatus(status ? null : "saved")} className={btn} style={status ? onTone : outline}>
                  {status ? <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-4 w-4" aria-hidden />}{status ? "Saved" : "Save"}
                </button>
                <button type="button" aria-pressed={applied} onClick={() => setStatus(applied ? "saved" : "applied")} className={btn} style={applied ? onTone : outline}>
                  <ClipboardCheck className="h-4 w-4" aria-hidden style={applied ? { color: SOFT } : undefined} />{status === "won" ? "Got it" : applied ? "Applied" : "I applied"}
                </button>
              </div>
              {(status === "applied" || last !== undefined) && (
                <p className="flex flex-wrap items-center gap-x-[10px] text-[13px] leading-[18px]" style={MUTED}>
                  {status === "applied" && <>Heard back? <button type="button" onClick={() => setStatus("won")} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>I got it</button></>}
                  {last !== undefined && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
                </p>
              )}
              <p className="text-[12.5px] leading-[17px] break-words" style={MUTED}>Opens {host} in a new tab.{item.type === "scholarship" ? " A real scholarship never asks for a credit card." : ""}</p>
            </Panel>
          </div>

          <div className="flex flex-col gap-[var(--space-5)] lg:col-start-1 lg:row-start-1">
            {/* 2. The facts. */}
            <Panel>
              <div className="grid grid-cols-2 gap-x-[16px] gap-y-[18px] sm:grid-cols-4">
                <Fact label={item.type === "scholarship" ? "Award" : "Cost"} value={item.type === "scholarship" ? amountShort(item) : PAID[item.paid]} tone={item.type === "scholarship" || costTone(item.paid) === "good" ? GREEN : undefined} />
                <Fact label={time.approx ? "Usually closes" : "Closes"} value={closes} tone={time.tone === "soon" ? AMBER : undefined} />
                <Fact label="Who can apply" value={gradeWord(item.grades)} />
                {item.type === "program" ? <Fact label="When" value={item.when ? item.when.split(/[,;(]/)[0].trim() : "See their page"} /> : <Fact label="Renews" value={item.renewable === null ? "Not stated" : item.renewable ? "Each year" : "One time"} />}
              </div>
              {(item.type === "scholarship" ? item.amount !== amountShort(item) : !!item.costNote) && <p className="text-[14px] leading-[20px]" style={MUTED}>{item.type === "scholarship" ? item.amount : item.costNote}</p>}
              {time.approx && item.deadlineNote && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.deadlineNote}</p>}
              {time.status === "unknown" && item.deadlineNote && <p className="text-[13px] leading-[18px]" style={MUTED}>{item.deadlineNote}</p>}
            </Panel>

            {reasons.length > 0 && (
              <Panel title="Fits you">
                <ul className="flex flex-col gap-[8px]">
                  {reasons.map(({ r, ok }) => <li key={r} className="flex items-start gap-[10px] text-[15px] leading-[22px]">{ok ? <Check className="mt-[4px] h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} /> : <span aria-hidden className="mt-[8px] size-[7px] flex-none rounded-full" style={{ background: AMBER }} />}{r}</li>)}
                </ul>
              </Panel>
            )}

            <Panel title="Who it is for">
              <p className="text-[15px] leading-[22px]">{item.eligibility}</p>
              {!item.states.includes("Any") && <p className="text-[14px] leading-[20px]" style={MUTED}>{item.states.includes("Remote") ? "Online, from anywhere." : `${item.states.map(stateName).join(", ")} only.`}</p>}
            </Panel>

            {item.requires.length > 0 && (
              <Panel title="What to bring">
                <ul className="flex flex-wrap gap-[8px]">
                  {item.requires.map((r) => <li key={r} className="flex min-h-[32px] items-center rounded-full border px-[12px] text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>{r}</li>)}
                </ul>
              </Panel>
            )}

            <p className="px-[4px] text-[12.5px] leading-[17px]" style={MUTED}>
              Checked on {host}, {checkedOn(item.verifiedOn)}.{item.type === "program" && item.postedBy ? " Posted by a Dreamari partner; details not checked by Dreamari." : ""}
            </p>
          </div>

          {more.length > 0 && (
            <section className="flex flex-col gap-[var(--space-4)] lg:col-start-2 lg:row-start-2" aria-labelledby="more-like-this">
              <h2 id="more-like-this" className={H2} style={DISPLAY}>More like this</h2>
              <ul className="grid grid-cols-1 gap-[14px] sm:grid-cols-3 lg:grid-cols-1">
                {more.map((e) => <li key={e.item.id} className="min-w-0"><Card e={e} status={record.status[e.item.id]?.status ?? null} onOpen={() => router.push(`/opportunities/${e.item.id}`)} onSave={() => setOpportunityStatus(e.item.id, record.status[e.item.id] ? null : "saved")} /></li>)}
              </ul>
              <Link href={`/opportunities?tab=${tab}`} className="dm-link flex w-fit items-center gap-[4px] text-[14px] font-bold" style={{ color: SOFT }}>All {tab}</Link>
            </section>
          )}
        </div>
      </main>

      <MobileNav active="Opportunities" />
    </div>
  );
}
