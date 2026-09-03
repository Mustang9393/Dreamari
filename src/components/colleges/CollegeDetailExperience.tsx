"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, MessagesSquare, PlayCircle } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { BackButton, DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { CardProgressiveBlur } from "@/components/app/cardChrome";
import { BIG, DISPLAY, DotList, Folded, LABEL, MEDIUM, PANEL, SMALL } from "@/components/career/CareerDetailExperience";
import { collegeBySlug, money } from "./data";
import { ACCENT, CollegePicture, MarkBadge, RULE, Row, SOFT, SaveButton, pct, tags, useSaved } from "./shared";
import { Donut } from "./viz";

// One college. The career page's anatomy: a header that dissolves into the
// campus photo, a strip of four facts, then folded sections in the order a
// student needs them. Every number keeps its plain label. Design notes:
// docs/COLLEGE_LOOKUP_AUDIT.md.

const SIZE_WORD = { Small: "Small", Medium: "Mid-size", Large: "Big" } as const;
type SectionKey = "cost" | "in" | "study" | "life" | "who" | "after" | "see" | "sources";

export function CollegeDetailExperience({ slug }: { slug: string }) {
  const c = collegeBySlug(slug);
  const [open, setOpen] = useState<Set<SectionKey>>(() => new Set<SectionKey>(["cost"]));
  const [saved, toggleSaved] = useSaved();
  const toggle = (k: SectionKey) => setOpen((cur) => { const n = new Set(cur); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  if (!c) {
    return (
      <div className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col items-center justify-center gap-[var(--space-4)] px-5 text-center" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
        <AppBackdrop />
        <p className="relative z-10 text-[20px] font-bold">We don&apos;t have that college yet.</p>
        <Link href="/colleges" className="dm-solid relative z-10 flex min-h-[44px] items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>Back to Find a college</Link>
      </div>
    );
  }

  const d = c.detail;
  const worth = d?.worth ?? (c.flags?.includes("fewFinish") ? "Few finish, under a quarter within six years." : c.control === "For profit" ? "Run for profit." : null);
  const tourUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${c.name} campus tour`)}`;

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
      </div>
      <DesktopNavigation active="Explore" />
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <span className="flex items-center gap-[var(--space-3)]"><BackButton fallback="/colleges" /><Wordmark /></span>
        <QuickLinksMenu />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[960px] flex-col gap-[var(--space-5)] px-5 pt-[var(--space-4)] pb-[140px] md:pt-[96px]">
        <div className="hidden md:block"><BackButton fallback="/colleges" /></div>

        {/* header: the photo runs behind the whole card on phones; from md it
           sits on the right half and fades into the panel toward the text */}
        <section className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ ...PANEL, background: "#0e0c20" }}>
          <div className="absolute inset-0" aria-hidden>
            <CollegePicture c={c} sizes="100vw" priority className="absolute inset-0 h-full w-full md:hidden" />
            <span className="absolute inset-y-0 right-0 hidden w-[52%] md:block">
              <CollegePicture c={c} sizes="560px" priority className="absolute inset-0 h-full w-full" />
              <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0e0c20 0%, rgba(14,12,32,0.5) 28%, transparent 60%)" }} />
            </span>
            <CardProgressiveBlur size="58%" />
            {/* a flat dim over the whole photo, then a heavy bottom gradient:
               bright campuses (Princeton) were washing out the title */}
            <span className="absolute inset-0" style={{ background: "rgba(12,16,35,0.34)" }} />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.94) 0%, rgba(12,16,35,0.78) 30%, rgba(12,16,35,0.4) 56%, rgba(12,16,35,0.1) 78%, transparent 100%)" }} />
          </div>
          <div className="relative flex min-h-[300px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-6)] pt-[120px] sm:p-[var(--space-8)] sm:pt-[120px] md:min-h-[320px]">
            <div className="flex flex-col gap-[var(--space-3)] md:max-w-[60%]">
              <MarkBadge c={c} size={52} />
              <h1 className="text-[34px] leading-[38px] font-extrabold text-balance sm:text-[44px] sm:leading-[48px]" style={DISPLAY}>{c.name}</h1>
              <p className={LABEL} style={{ color: "rgba(255,255,255,0.85)" }}>{c.city}, {c.stateName}</p>
              <ul className="flex flex-wrap gap-[6px]" aria-label="About this college" style={{ textShadow: "none" }}>
                {[SIZE_WORD[c.size], ...tags(c)].map((t) => <li key={t} className="rounded-[var(--radius-sm)] px-[9px] py-[3px] text-[12px] leading-[16px] font-bold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>{t}</li>)}
              </ul>
              <p className="text-[13px] leading-[17px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {d?.address && !d.sample && <span className="block">{d.address}</span>}
                <span className="block">Accredited by {c.accreditor}</span>
                {d?.partOf && <span className="block">Part of {d.partOf}</span>}
              </p>
              <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)]" style={{ textShadow: "none" }}>
                {c.website && (
                  <a href={c.website} target="_blank" rel="noreferrer" className="dm-solid flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>
                    Their website <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                )}
                <Link href={`/colleges?q=${encodeURIComponent(c.city)}`} className="dm-quiet flex min-h-[44px] items-center rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.4)", color: "#fff" }}>
                  Others in {c.city}
                </Link>
                <SaveButton on={saved.has(c.slug)} onToggle={() => toggleSaved(c.slug)} size={44} />
              </div>
            </div>
          </div>
        </section>

        {worth && (
          <p className={`${SMALL} -mt-[var(--space-2)] max-w-[62ch]`} style={{ color: "var(--muted-foreground)" }}>
            <strong className="font-bold" style={{ color: "var(--foreground)" }}>Worth knowing.</strong> {worth}
          </p>
        )}

        {/* At a glance: label and value rows, the calmest way to give the
           four answers a student came for. */}
        <section aria-labelledby="glance-title" className="flex flex-col rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
          <h2 id="glance-title" className={`${BIG} -mx-[var(--space-5)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]`} style={{ ...DISPLAY, borderColor: RULE }}>At a glance</h2>
          <div className="pt-[var(--space-2)]">
            <Row label="Cost for a year" note="after grants and scholarships" value={c.netPrice === null ? "Not published" : money(c.netPrice)} />
            <Row label="Applicants admitted" note={c.applied ? `${c.applied.toLocaleString("en-US")} applied last year` : undefined} value={c.admitRate === null ? "Everyone" : `${c.admitRate} of 100`} />
            <Row label="Students who finish" note="within six years" value={pct(c.finish)} />
            <Row label="Students who come back for year two" value={pct(c.retention)} />
            <Row label="Undergraduates" value={c.undergrads.toLocaleString("en-US")} last />
          </div>
        </section>

        {d && (
          <>
            {/* Three pictures on the whole page, one per question a student
               brings (cost, getting in, who is there). Everything else is a
               sentence or a short list. Heading, subheading, body, always. */}
            <Folded id="cost" title="What it costs" open={open.has("cost")} onToggle={() => toggle("cost")}>
              <div className="flex flex-col gap-[var(--space-6)]">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Cost for a year, by family income</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>After grants and scholarships.</p>
                  <div className="mt-[var(--space-2)]">
                    {d.bands.map((b, i) => <Row key={b.label} label={`Family earns ${b.label.toLowerCase()}`} value={money(b.pay)} last={i === d.bands.length - 1} />)}
                  </div>
                </div>
                {(d.tuitionInState !== null || d.housing) && (
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Full price before aid</h3>
                    <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Almost nobody pays this.</p>
                    <div className="mt-[var(--space-2)]">
                      {d.tuitionInState !== null && <Row label={d.tuitionInState === d.tuitionOutState ? "Tuition" : "Tuition, in state"} value={money(d.tuitionInState)} />}
                      {d.tuitionOutState !== null && d.tuitionOutState !== d.tuitionInState && <Row label="Tuition, out of state" value={money(d.tuitionOutState)} />}
                      {d.fees !== null && <Row label="Required fees" value={d.fees === 0 ? "None" : money(d.fees)} />}
                      <Row label="Housing on campus" value={d.housing ? "Yes" : "No, commute only"} last={d.housingCost === undefined} />
                      {d.housingCost !== undefined && <Row label={d.foodCost ? "Housing for a year" : "Housing and food for a year"} value={money(d.housingCost)} last={d.foodCost === undefined} />}
                      {d.foodCost !== undefined && <Row label="Food for a year" value={money(d.foodCost)} last />}
                    </div>
                  </div>
                )}
                {(d.scholarshipShare !== undefined || d.pell !== undefined) && (
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Grants and scholarships</h3>
                    <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Money students do not pay back.</p>
                    <div className="mt-[var(--space-2)]">
                      {d.scholarshipShare !== undefined && <Row label="New students with a scholarship from the college" note={d.scholarshipAvg && d.scholarshipShare ? `about ${money(Math.round(d.scholarshipAvg / 100) * 100)} each` : undefined} value={d.scholarshipShare ? `${d.scholarshipShare}%` : "None"} last={d.pell === undefined} />}
                      {d.pell !== undefined && <Row label="Students with a federal Pell grant" note="for lower-income families" value={`${d.pell}%`} last />}
                    </div>
                  </div>
                )}
              </div>
            </Folded>

            <Folded id="in" title="Getting in" open={open.has("in")} onToggle={() => toggle("in")}>
              {c.admitRate === null ? (
                <DotList items={["Everyone who applies gets in", "No test scores needed", "Course requirements still apply"]} accent={ACCENT} />
              ) : (
                <div className="flex flex-col gap-[var(--space-6)]">
                  <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What they require</h3>
                      <div className="mt-[var(--space-3)]"><DotList items={d.require} accent={ACCENT} /></div>
                    </div>
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What they look at, but do not require</h3>
                      <div className="mt-[var(--space-3)]"><DotList items={d.consider} accent="rgba(255,255,255,0.35)" /></div>
                    </div>
                  </div>
                  {d.scores && (
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Test scores</h3>
                      <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Middle half of students who sent scores. A lower score is not a no.</p>
                      <div className="mt-[var(--space-2)]">
                        <Row label="SAT" note={`${d.scores.sentSat}% sent one`} value={`${d.scores.sat} of 1600`} last={!d.scores.act} />
                        {d.scores.act && <Row label="ACT" note={d.scores.sentAct !== undefined ? `${d.scores.sentAct}% sent one` : undefined} value={`${d.scores.act} of 36`} last />}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Folded>

            <Folded id="study" title="What you can study" open={open.has("study")} onToggle={() => toggle("study")}>
              <div className="flex flex-col gap-[var(--space-6)]">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Degrees offered</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{d.programmeCount} programmes in total.</p>
                  <div className="mt-[var(--space-2)]">
                    {d.levels.filter((l) => l.n > 0).map((l, i, arr) => <Row key={l.label} label={/degree|certificate/i.test(l.label) ? l.label : `${l.label} degrees`} value={String(l.n)} last={i === arr.length - 1} />)}
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Classes</h3>
                  <div className="mt-[var(--space-2)]">
                    <Row label="Students per teacher" value={d.ratio.replace(" to 1", "")} last={!d.finish4} />
                    {d.finish4 ? <Row label="Bachelor's students who finish in four years" value={`${d.finish4}%`} last /> : null}
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Biggest programmes</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>What graduates earned one year out.</p>
                  <div className="mt-[var(--space-2)]">
                    {d.programmes.slice(0, 6).map((p, i, arr) => <Row key={p.name} label={p.name} note={`${p.grads} graduates a year`} value={p.pay === "not published" ? "Not published" : `${p.pay} a year`} last={i === arr.length - 1} />)}
                  </div>
                </div>
              </div>
            </Folded>

            <Folded id="life" title="Life there" open={open.has("life")} onToggle={() => toggle("life")}>
              <div className="flex flex-col gap-[var(--space-6)]">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Who is there</h3>
                  <div className="mt-[var(--space-2)]">
                    <Row label="Undergraduates" value={c.undergrads.toLocaleString("en-US")} />
                    {d.gradStudents ? <Row label="Graduate students" value={d.gradStudents.toLocaleString("en-US")} /> : null}
                    <Row label="Women" value={`${d.women}%`} />
                    <Row label="Men" value={`${d.men}%`} />
                    <Row label="Full-time students" value={`${Math.round((d.fullTime / (d.fullTime + d.partTime)) * 100)}%`} last />
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Where undergraduates come from</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Federal categories. International means students on visas.</p>
                  <div className="mt-[var(--space-4)]">
                    <Donut parts={d.makeup.map((m) => ({ label: m.label, pct: m.pct }))} />
                  </div>
                </div>
                <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Ways to study here</h3>
                    <div className="mt-[var(--space-3)]">{d.ways.length ? <DotList items={d.ways} accent={ACCENT} /> : <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>No extras reported: no study abroad, no ROTC, no evening classes.</p>}</div>
                  </div>
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What the college helps with</h3>
                    <div className="mt-[var(--space-3)]"><DotList items={d.helps} accent={ACCENT} /></div>
                    {d.notOffered?.length ? <p className={`${SMALL} mt-[var(--space-3)]`} style={{ color: "var(--muted-foreground)" }}>Not offered: {d.notOffered.join(", ").toLowerCase()}.</p> : null}
                  </div>
                </div>
                {d.sport && (
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Sport</h3>
                    <div className="mt-[var(--space-2)]"><Row label="League" value={d.sport.league} /><Row label="Students on a team" value={d.sport.students.toLocaleString("en-US")} last /></div>
                    <ul className="mt-[var(--space-3)] flex flex-wrap gap-[8px]">{d.sport.teams.map((t) => <li key={t} className="rounded-full px-[11px] py-[4px] text-[13px] leading-[17px] font-semibold" style={{ background: "rgba(255,255,255,0.08)" }}>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            </Folded>

            <Folded id="after" title="After college" open={open.has("after")} onToggle={() => toggle("after")}>
              <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Pay and debt</h3>
              <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Everyone who went here, in every subject.</p>
              <div className="mt-[var(--space-2)]">
                <Row label="Typical pay" note="six years after starting" value={d.pay6 ? `${money(Math.round(d.pay6 / 100) * 100)} a year` : "Not published"} />
                <Row label="Debt at graduation" note="federal loans" value={d.debt ? money(Math.round(d.debt / 100) * 100) : "Not published"} />
                {d.monthly ? <Row label="Monthly repayment" value={money(d.monthly)} /> : null}
                <Row label="Borrowers paying it back" value={c.repay !== null ? `${c.repay}%` : "Not published"} last />
              </div>
              <p className="mt-[var(--space-3)] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Source: College Scorecard.</p>
            </Folded>
          </>
        )}

        <Folded id="see" title="See it, then ask someone" open={open.has("see")} onToggle={() => toggle("see")}>
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <a href={tourUrl} target="_blank" rel="noreferrer" className="dm-tap flex items-start gap-[12px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <PlayCircle className="mt-[2px] h-6 w-6 flex-none" aria-hidden style={{ color: SOFT }} />
              <span className="flex flex-col gap-[2px]">
                <span className="text-[15px] leading-[20px] font-bold">Campus tours on YouTube</span>
                <span className="text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Real students, real campus. Opens outside Dreamari.</span>
              </span>
            </a>
            <Link href="/connect" className="dm-tap flex items-start gap-[12px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <MessagesSquare className="mt-[2px] h-6 w-6 flex-none" aria-hidden style={{ color: SOFT }} />
              <span className="flex flex-col gap-[2px]">
                <span className="text-[15px] leading-[20px] font-bold">Ask a pro on Connect</span>
                <span className="text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Verified pros answer questions about where they studied.</span>
              </span>
            </Link>
          </div>
        </Folded>

        <Folded id="sources" title="Where these numbers come from" open={open.has("sources")} onToggle={() => toggle("sources")}>
          <div>
            <Row label="Cost" note="what families paid after grants" value="IPEDS" />
            <Row label="Finish" note="everyone who started, part-time and transfers included" value="IPEDS" />
            <Row label="Pay and debt" note="everyone who went here, not one programme" value="College Scorecard" />
            <Row label="Year" note="government data runs about 18 months behind" value="2024-25" last={!d?.sample} />
            {d?.sample && <Row label="Prototype note" note="headline figures are real; detail is sample data until the live feed is wired in" value="Sample" last />}
          </div>
        </Folded>
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
