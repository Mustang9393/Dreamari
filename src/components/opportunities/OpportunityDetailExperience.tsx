"use client";

// One opportunity's own page. Every card opens here (1 Oct 2026); since
// 3 Oct it is the only way to read one: Joshua asked for "a focused
// full-page view" in place of the list-and-reader split, laid out after
// Scholarship America's own scholarship page (name and provider, then the
// sections in the order a student asks them, a sticky summary on the
// right), with Dreamari's short copy and its personal answer on top.
// Programs and internships use the same page, filled the way Handshake's
// job page is (at a glance: pay, where, schedule; what you'll do), so a
// student learns one page, not three.
//
// Top to bottom:
// 1. A strip: Back, and previous / next through the list it was opened
//    from ("3 of 24", see listReturn.ts), so scanning many stays one tap.
// 2. The header: the field's world and the kind, the name, who gives it,
//    and their logo only when a real one exists (no letter tiles).
// 3. Main column (about 70%): Can you apply? (the answer for this student,
//    with the reasons), then the sections. Scholarships: Who can apply,
//    The award, How they pick, What to bring, After you apply. Programs:
//    What you'll do, Who can apply, What to bring. A section the provider
//    says nothing about is left out, never filled with a guess.
// 4. Sticky summary (about 30%): the one home for the facts (award or pay,
//    the deadline leaf, status, grades, where, school type, who), then
//    Apply, Save, I applied. Facts are not repeated in the header: Joshua's
//    sketch had the amount and date in both, and twice is noise.
// 5. Phones: the summary sits under Can you apply?, and Save, I applied and
//    Apply ride in a bar above the tab bar (Handshake's bottom bar), so the
//    action is never a scroll away.
// Nothing is applied for here; Apply always goes to the provider.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bookmark, BookmarkCheck, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardCheck, Clock, MapPin, Undo2, Wallet } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { BackButton, DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { IconTip } from "@/components/app/IconTip";
import { EmptyView } from "@/components/app/states";
import { DISPLAY, PANEL } from "@/components/career/CareerDetailExperience";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { shortDate } from "@/lib/localRecord";
import { opportunityStore, setOpportunityStatus, type OpportunityStatus } from "@/lib/opportunities";
import { LEVEL, PAID, PROGRAM_KIND, SCHOLARSHIP_KIND, type Item } from "./types";
import { fieldWorld, fitFor, gradeWord, stateName, timing, today, useStudent, type Fit, type Timing } from "./match";
import { DeadlineBar, HowToApply, checkedOn, monthWord, worldBand } from "./DetailParts";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS, findOpportunity } from "./data";
import { OrgMark, hostOf } from "./OrgMark";
import { AMBER, Card, GREEN, MUTED, amountShort, costTone, type Enriched } from "./Card";
import { markReturning, readListReturn } from "./listReturn";

const H2 = "text-[20px] leading-[26px] font-extrabold";
const LABEL = "text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase";
const BODY = "text-[15px] leading-[22px]";
const DL = "flex flex-col divide-y divide-[var(--glass-border)] border-t";

function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)] ${className}`} style={PANEL}>
      {title && <h2 className={H2} style={DISPLAY}>{title}</h2>}
      {children}
    </section>
  );
}

/** A short list, one rule or task per line. */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-[9px]">
      {items.map((t) => <li key={t} className={`flex items-start gap-[11px] ${BODY}`}><span aria-hidden className="mt-[9px] size-[6px] flex-none rounded-full" style={{ background: SOFT }} />{t}</li>)}
    </ul>
  );
}

/** Label on the left, value on the right: the summary's rows and the award's. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-[16px] py-[10px]">
      <dt className="flex-none text-[13.5px] leading-[20px]" style={MUTED}>{label}</dt>
      <dd className="min-w-0 text-right text-[14px] leading-[20px] font-semibold break-words">{children}</dd>
    </div>
  );
}

/** Where it is open to, in a few words. */
function placeWord(item: Item): string {
  if (item.states.includes("Any")) return "Anywhere in the US";
  if (item.states.includes("Remote")) return "Online";
  return `${item.states.map(stateName).join(", ")} only`;
}

/** Where the cycle stands, for the summary's Status row. */
function statusOf(item: Item, time: Timing, todayIso: string): { word: string; tone: string } {
  if (time.status === "closed") return { word: "Closed", tone: "var(--muted-foreground)" };
  if (time.status === "unknown") return { word: "Date not posted", tone: "var(--muted-foreground)" };
  if (time.approx) return { word: "Not posted yet", tone: AMBER };
  if (opensLater(item, todayIso)) return { word: `Opens ${monthWord(item.opens!)}`, tone: AMBER };
  return { word: "Open", tone: GREEN };
}

/** The answer for this student, in one line, then one line under it. */
function opensLater(item: Item, todayIso: string): boolean {
  return !!item.opens && /^\d{4}-\d{2}/.test(item.opens) && item.opens.slice(0, 10) > todayIso;
}

function verdictOf(item: Item, fit: Fit, time: Timing, grade: number, todayIso: string): { head: string; sub: string | null; tone: string } {
  if (fit.when === "no") return { head: "Not this one.", sub: fit.checks[0] ?? null, tone: "var(--muted-foreground)" };
  if (fit.when === "later") {
    const next = item.grades.filter((g) => g > grade);
    return { head: next.length ? `Not yet. You can apply in grade ${Math.min(...next)}.` : "Not yet. This one is for college students.", sub: "Save it so it is here when you are ready.", tone: AMBER };
  }
  if (time.status === "closed") return { head: "Yes, but it closed for this year.", sub: "Save it for next year.", tone: AMBER };
  if (time.status === "unknown") return { head: "Yes. They have not posted the date yet.", sub: null, tone: GREEN };
  if (opensLater(item, todayIso)) return { head: `Yes, once it opens ${/^\d{4}-\d{2}$/.test(item.opens!) ? "in" : "on"} ${monthWord(item.opens!).replace(/,? \d{4}$/, "")}.`, sub: "Save it so you do not lose it.", tone: GREEN };
  if (time.approx) return { head: "Yes, when it opens.", sub: `This year's date is not out. Last year it closed ${shortDate(time.iso!).replace(/, \d{4}$/, "")}.`, tone: GREEN };
  // No "5 months left" here: the deadline leaf beside it says that.
  return { head: "Yes. You can apply now.", sub: null, tone: GREEN };
}

export function OpportunityDetailExperience({ id }: { id: string }) {
  const router = useRouter();
  const item = findOpportunity(id);
  const student = useStudent();
  const record = opportunityStore.useValue();
  const [todayIso] = useState(() => today());
  const [last, setLast] = useState<OpportunityStatus | null | undefined>(undefined);
  // The list this was opened from, for previous and next. Read after mount:
  // sessionStorage is not there on the server.
  const [list, setList] = useState<{ ids: string[]; label: string; tab: string } | null>(null);
  useEffect(() => {
    const ret = readListReturn();
    if (!ret || !ret.ids.includes(id)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage only exists after mount
    setList({ ids: ret.ids, label: ret.label, tab: ret.tab });
  }, [id]);
  const at = list ? list.ids.indexOf(id) : -1;
  const prevId = list && at > 0 ? list.ids[at - 1] : null;
  const nextId = list && at >= 0 && at < list.ids.length - 1 ? list.ids[at + 1] : null;
  // replace, not push: Back always returns to the list, however many were stepped through.
  const go = (to: string | null) => { if (to) router.replace(`/opportunities/${to}`, { scroll: true }); };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowLeft" && prevId) router.replace(`/opportunities/${prevId}`);
      if (e.key === "ArrowRight" && nextId) router.replace(`/opportunities/${nextId}`);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [prevId, nextId, router]);

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
      const shared = (e: Enriched) => (e.item.fields.some((f) => f !== "Any" && item.fields.includes(f)) ? 1 : 0);
      return shared(b) - shared(a) || (a.fit.when === b.fit.when ? b.fit.score - a.fit.score : a.fit.when === "now" ? -1 : 1);
    })
    .slice(0, 3);

  const setStatus = (next: OpportunityStatus | null) => { setLast(status); setOpportunityStatus(item.id, next); };
  const undo = () => { if (last !== undefined) { setOpportunityStatus(item.id, last); setLast(undefined); } };
  const verdict = verdictOf(item, fit, time, student.grade, todayIso);
  // The evidence carries only what the verdict line does not.
  const evidence = [
    ...fit.reasons.filter((r) => r !== "Any career field").map((r) => ({ r, ok: true })),
    ...fit.checks.filter((r) => !(fit.when === "later" && /^You can apply in grade|college students/.test(r)) && !(fit.when === "no" && r === verdict.sub)).map((r) => ({ r, ok: false })),
  ];
  const state = statusOf(item, time, todayIso);
  const sch = item.type === "scholarship" ? item : null;
  const prog = item.type === "program" ? item : null;
  const levels = sch?.levels?.length ? sch.levels.map((l) => LEVEL[l].label).join(", ") : null;
  const bullets = sch?.eligibilityBullets?.length ? sch.eligibilityBullets : null;
  // The pay in a few characters for the summary ("$16.50 an hour"), the
  // provider's full words in At a glance.
  const payFull = prog ? prog.costNote ?? prog.pay ?? (prog.paid !== "unknown" ? PAID[prog.paid] : null) : null;
  const payShort = prog ? prog.pay ?? prog.costNote?.match(/\$[\d,.]+(?:\s*(?:an|per|a)\s*(?:hour|week|month)|\/hr)?/)?.[0] ?? (prog.paid !== "unknown" ? PAID[prog.paid] : null) : null;
  const where = prog ? [prog.setting, prog.location].filter(Boolean).join(" · ") : null;
  const glance = prog ? ([
    payFull && { Icon: Wallet, label: "Pay", text: payFull },
    prog.when && { Icon: CalendarDays, label: "When", text: prog.when },
    prog.schedule && { Icon: Clock, label: "Schedule", text: prog.schedule },
    where && { Icon: MapPin, label: "Where", text: where },
  ].filter(Boolean) as { Icon: typeof Wallet; label: string; text: string }[]) : [];
  const applyLabel = host.length <= 22 ? `Apply on ${host}` : "Apply";

  const btn = "dm-quiet flex h-[44px] cursor-pointer items-center justify-center gap-[7px] rounded-[11px] border px-[14px] text-[14.5px] leading-[18px] font-semibold whitespace-nowrap";
  const outline = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;
  const onTone = { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--foreground)" } as const;
  const pagerBtn = "dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-35";
  const saveLabel = status ? "Saved" : "Save";
  const appliedLabel = status === "won" ? "Got it" : applied ? "Applied" : "I applied";

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation active="Opportunities" />
      <MobileHeaderShell>
        <span className="flex items-center gap-[var(--space-3)]"><BackButton fallback={`/opportunities?tab=${tab}`} /><Wordmark /></span>
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col gap-[var(--space-5)] px-5 pt-2 pb-[220px] md:px-8 md:pt-[var(--space-8)] lg:pb-[140px]">
        {/* 1. The strip: Back, and where you are in the list. */}
        <div className="flex min-h-[40px] items-center justify-between gap-[12px]">
          <span className="hidden items-center gap-[10px] md:flex">
            <BackButton fallback={`/opportunities?tab=${tab}`} />
            <Link href={`/opportunities?tab=${list?.tab ?? tab}`} onClick={() => { if (list) markReturning(); }} className="dm-link text-[14px] font-semibold" style={MUTED}>{list?.label ?? (tab === "scholarships" ? "Scholarships" : tab === "internships" ? "Internships" : "Programs")}</Link>
          </span>
          {list && at >= 0 && (
            <span className="ml-auto flex items-center gap-[8px]">
              <span className="text-[13px] font-semibold tabular-nums" style={MUTED}>{at + 1} of {list.ids.length}</span>
              <IconTip label="Previous"><button type="button" aria-label="Previous" disabled={!prevId} onClick={() => go(prevId)} className={pagerBtn} style={outline}><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
              <IconTip label="Next"><button type="button" aria-label="Next" disabled={!nextId} onClick={() => go(nextId)} className={pagerBtn} style={outline}><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
            </span>
          )}
        </div>

        {/* 2. The header: name and provider, nothing else. */}
        <header className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-6)] sm:p-[var(--space-8)]" style={{ ...PANEL, ...worldBand(world?.color ?? null) }}>
          <span className={LABEL} style={{ color: world ? `color-mix(in srgb, ${world.color} 70%, #fff)` : "var(--muted-foreground)" }}>{world ? world.name : "Any field"}<span style={MUTED}> · {prog?.postedBy ? `Posted by ${prog.postedBy.org}` : kind}</span></span>
          <h1 className="text-[28px] leading-[1.06] font-extrabold uppercase sm:text-[38px]" style={{ ...DISPLAY, textWrap: "balance" }}>{item.name}</h1>
          <p className="flex items-center gap-[10px] text-[15px] leading-[21px]" style={MUTED}>
            <OrgMark url={item.url} name={who} size={26} bare className="rounded-[7px]" />
            {who}
          </p>
        </header>

        <div className="flex flex-col gap-[var(--space-5)] lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)] lg:grid-rows-[auto_1fr] lg:items-start">
          {/* 3a. Can you apply? The personal answer, first. */}
          <Panel title="Can you apply?" className="lg:col-start-1 lg:row-start-1">
            <div className="flex flex-col gap-[4px]">
              <p className="text-[19px] leading-[25px] font-extrabold" style={{ color: verdict.tone }}>{verdict.head}</p>
              {verdict.sub && <p className="text-[14.5px] leading-[20px]" style={MUTED}>{verdict.sub}</p>}
            </div>
            {evidence.length > 0 && (
              <ul className="flex flex-col gap-[8px]">
                {evidence.map(({ r, ok }) => <li key={r} className={`flex items-start gap-[10px] ${BODY}`}>{ok ? <Check className="mt-[4px] h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} /> : <span aria-hidden className="mt-[8px] size-[7px] flex-none rounded-full" style={{ background: AMBER }} />}{r}</li>)}
              </ul>
            )}
          </Panel>

          {/* 4. The summary: the one home for the facts, and the actions. */}
          <aside className="flex flex-col gap-[var(--space-4)] lg:sticky lg:top-[88px] lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-label="Summary">
            <Panel>
              <div className="flex flex-col gap-[14px]">
                <div className="flex flex-col gap-[4px]">
                  <span className={LABEL} style={MUTED}>{sch ? "Award" : "Pay"}</span>
                  {sch ? <span className="text-[26px] leading-[30px] font-extrabold tabular-nums" style={{ ...DISPLAY, color: GREEN }}>{amountShort(sch)}</span>
                    : <span className="text-[22px] leading-[28px] font-extrabold" style={{ ...DISPLAY, color: prog && costTone(prog.paid) === "good" ? GREEN : "var(--foreground)" }}>{payShort ?? "Not listed"}</span>}
                </div>
                <DeadlineBar time={time} opens={item.opens} />
              </div>
              <dl className={DL} style={{ borderColor: "var(--glass-border)" }}>
                <Row label="Status"><span className="inline-flex items-center gap-[7px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: state.tone }} />{state.word}</span></Row>
                <Row label="Grades">{gradeWord(item.grades).replace(/^Grades? /, "")}</Row>
                {sch && <Row label="Location">{placeWord(item)}</Row>}
                {levels && <Row label="School type">{levels}</Row>}
                <Row label={sch ? "Given by" : "Run by"}>{who}</Row>
              </dl>
              {/* Desktop actions; phones get the bar at the bottom. */}
              <div className="hidden flex-col gap-[8px] lg:flex">
                <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid w-full text-white`} style={{ background: ACCENT, borderColor: ACCENT }}>
                  {applyLabel} <ArrowUpRight className="h-4 w-4 flex-none" aria-hidden />
                </a>
                <div className="grid grid-cols-2 gap-[8px]">
                  <button type="button" aria-pressed={!!status} onClick={() => setStatus(status ? null : "saved")} className={btn} style={status ? onTone : outline}>
                    {status ? <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-4 w-4" aria-hidden />}{saveLabel}
                  </button>
                  <button type="button" aria-pressed={applied} onClick={() => setStatus(applied ? "saved" : "applied")} className={btn} style={applied ? onTone : outline}>
                    <ClipboardCheck className="h-4 w-4" aria-hidden style={applied ? { color: SOFT } : undefined} />{appliedLabel}
                  </button>
                </div>
              </div>
              {(status === "applied" || last !== undefined) && (
                <p className="flex flex-wrap items-center gap-x-[10px] text-[13px] leading-[18px]" style={MUTED}>
                  {status === "applied" && <>Heard back? <button type="button" onClick={() => setStatus("won")} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>I got it</button></>}
                  {last !== undefined && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
                </p>
              )}
              <p className="text-[12.5px] leading-[17px] break-words" style={MUTED}>You apply on {host}, not here.{sch ? " A real scholarship never asks for a credit card." : ""}</p>
            </Panel>
          </aside>

          {/* 3b. The sections, in the order a student asks them. */}
          <div className="flex flex-col gap-[var(--space-5)] lg:col-start-1 lg:row-start-2">
            {/* Programs: Handshake's "At a glance", the provider's full words
               for pay, dates, hours and place (the summary keeps them short). */}
            {glance.length > 0 && (
              <Panel title="At a glance">
                <ul className="flex flex-col gap-[14px]">
                  {glance.map(({ Icon, label, text }) => (
                    <li key={label} className="flex items-start gap-[12px]">
                      <span aria-hidden className="mt-[1px] flex size-[32px] flex-none items-center justify-center rounded-[9px]" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}><Icon className="h-4 w-4" style={{ color: SOFT }} /></span>
                      <span className="flex min-w-0 flex-col gap-[1px]"><span className="text-[12.5px] leading-[16px] font-semibold" style={MUTED}>{label}</span><span className={BODY}>{text}</span></span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {prog?.whatYouDo?.length ? <Panel title="What you'll do"><Bullets items={prog.whatYouDo} /></Panel> : null}

            <Panel title="Who can apply">
              {bullets ? <Bullets items={bullets} /> : <p className={BODY}>{item.eligibility}</p>}
              {!bullets && !item.states.includes("Any") && <p className="text-[14px] leading-[20px]" style={MUTED}>{item.states.includes("Remote") ? "Online, from anywhere." : `${item.states.map(stateName).join(", ")} only.`}</p>}
            </Panel>

            {sch && (
              <Panel title="The award">
                {/* The provider's words, minus a "(105 scholarships)" the How many row says. */}
                <p className="text-[16px] leading-[23px] font-semibold">{sch.awardCount ? sch.amount.replace(/\s*\([^)]*\)\s*$/, "") : sch.amount}</p>
                {(sch.awardCount || sch.renewable !== null) && (
                  <dl className={DL} style={{ borderColor: "var(--glass-border)" }}>
                    {sch.awardCount && <Row label="How many">{sch.awardCount}</Row>}
                    {sch.renewable !== null && <Row label="Renews">{sch.renewable ? "Each year" : "One time"}</Row>}
                  </dl>
                )}
                {sch.payout && <p className="text-[14px] leading-[20px]" style={MUTED}>{sch.payout}</p>}
              </Panel>
            )}

            {sch?.selectedOn?.length ? (
              <Panel title="How they pick">
                <ul className="flex flex-wrap gap-[8px]">
                  {sch.selectedOn.map((r) => <li key={r} className="flex min-h-[32px] items-center rounded-full border px-[12px] text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>{r}</li>)}
                </ul>
              </Panel>
            ) : null}

            <Panel><HowToApply e={{ item, fit, time }} host={host} titleClass={H2} titleStyle={DISPLAY} /></Panel>

            {/* Notification and obligations are one sentence each, so one
               panel holds both; it is left out when the page says neither. */}
            {sch && (sch.notification || sch.obligations) && (
              <Panel title="After you apply">
                <dl className="flex flex-col gap-[12px]">
                  {sch.notification && <div className="flex flex-col gap-[3px]"><dt className={LABEL} style={MUTED}>When you hear</dt><dd className={BODY}>{sch.notification}</dd></div>}
                  {sch.obligations && <div className="flex flex-col gap-[3px]"><dt className={LABEL} style={MUTED}>If you win</dt><dd className={BODY}>{sch.obligations}</dd></div>}
                </dl>
              </Panel>
            )}

            <p className="px-[4px] text-[12.5px] leading-[17px]" style={MUTED}>
              {item.deadlineNote && (time.status === "unknown" || time.approx) ? `${item.deadlineNote} ` : ""}We checked this on {host} on {checkedOn(item.verifiedOn)}.{prog?.postedBy ? " A Dreamari partner posted this. We have not checked the details." : ""}
            </p>
          </div>
        </div>

        {more.length > 0 && (
          <section className="flex flex-col gap-[var(--space-4)] pt-[var(--space-4)]" aria-labelledby="more-like-this">
            <div className="flex items-baseline justify-between gap-[12px]">
              <h2 id="more-like-this" className={H2} style={DISPLAY}>More like this</h2>
              <Link href={`/opportunities?tab=${tab}`} className="dm-link text-[14px] font-bold" style={{ color: SOFT }}>All {tab}</Link>
            </div>
            <ul className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
              {more.map((e) => <li key={e.item.id} className="min-w-0"><Card e={e} status={record.status[e.item.id]?.status ?? null} onOpen={() => router.push(`/opportunities/${e.item.id}`)} onSave={() => setOpportunityStatus(e.item.id, record.status[e.item.id] ? null : "saved")} /></li>)}
            </ul>
          </section>
        )}
      </main>

      {/* 5. Phones: the actions in a bar above the tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 flex items-center gap-[8px] border-t px-4 py-[10px] lg:hidden" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)" }}>
        <IconTip label={status ? "Remove from saved" : "Save"}>
          <button type="button" aria-pressed={!!status} aria-label={status ? "Remove from saved" : "Save"} onClick={() => setStatus(status ? null : "saved")} className={`${btn} w-[48px] px-0`} style={status ? onTone : outline}>
            {status ? <BookmarkCheck className="h-[18px] w-[18px]" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-[18px] w-[18px]" aria-hidden />}
          </button>
        </IconTip>
        <IconTip label={appliedLabel}>
          <button type="button" aria-pressed={applied} aria-label={appliedLabel} onClick={() => setStatus(applied ? "saved" : "applied")} className={`${btn} w-[48px] px-0`} style={applied ? onTone : outline}>
            <ClipboardCheck className="h-[18px] w-[18px]" aria-hidden style={applied ? { color: SOFT } : undefined} />
          </button>
        </IconTip>
        <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid min-w-0 flex-1 text-white`} style={{ background: ACCENT, borderColor: ACCENT }}>
          Apply <ArrowUpRight className="h-4 w-4 flex-none" aria-hidden />
        </a>
      </div>

      <MobileNav active="Opportunities" />
    </div>
  );
}
