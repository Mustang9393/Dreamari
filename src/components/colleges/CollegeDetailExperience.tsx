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
import { DotGrid, HBars, MeterRow, RangeBar, SplitBar } from "./viz";

// One college. The career page's anatomy: a header that dissolves into the
// campus photo, a strip of four facts, then folded sections in the order a
// student needs them. Every number keeps its plain label. Design notes:
// docs/COLLEGE_LOOKUP_AUDIT.md.

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
  const worth = d?.worth ?? (c.flags?.includes("fewFinish") ? "Few students finish. Fewer than a quarter finish within six years." : c.control === "For profit" ? "Run for profit. This college is a business with owners to pay, not a public or non-profit school." : null);
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
            <CardProgressiveBlur size="52%" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.88) 0%, rgba(12,16,35,0.55) 34%, rgba(12,16,35,0.12) 62%, transparent 100%)" }} />
          </div>
          <div className="relative flex min-h-[300px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-6)] pt-[120px] sm:p-[var(--space-8)] sm:pt-[120px] md:min-h-[320px]">
            <div className="flex flex-col gap-[var(--space-3)] md:max-w-[60%]">
              <MarkBadge c={c} size={52} />
              <h1 className="text-[34px] leading-[38px] font-extrabold text-balance sm:text-[44px] sm:leading-[48px]" style={DISPLAY}>{c.name}</h1>
              <p className={LABEL} style={{ color: "rgba(255,255,255,0.85)" }}>{c.city}, {c.stateName} · {tags(c).join(" · ")}</p>
              <p className="text-[13px] leading-[17px]" style={{ color: "rgba(255,255,255,0.6)" }}>Accredited by {c.accreditor}{d?.partOf ? ` · Part of ${d.partOf}` : ""}</p>
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

        {/* at a glance: five rows, body-sized figures. Headings stay
           headings; no number is ever set larger than the text above it. */}
        <section aria-labelledby="glance-title" className="flex flex-col rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
          <h2 id="glance-title" className={`${BIG} -mx-[var(--space-5)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]`} style={{ ...DISPLAY, borderColor: RULE }}>At a glance</h2>
          <div className="pt-[var(--space-2)]">
            <Row label="Cost for a year" note="what families pay after grants and scholarships" value={c.netPrice === null ? "Not published" : money(c.netPrice)} />
            <Row label="Getting in" note={c.admitRate === null ? "open admission, no test scores" : c.applied ? `${c.applied.toLocaleString("en-US")} applied` : undefined} value={c.admitRate === null ? "Everyone who applies" : `${c.admitRate}% are admitted`} />
            <Row label="Finish their degree" note="within 6 years, everyone who started" value={pct(c.finish)} />
            <Row label="Come back for year 2" value={pct(c.retention)} />
            <Row label="Undergraduates" value={c.undergrads.toLocaleString("en-US")} last />
          </div>
        </section>

        {d && (
          <>
            {/* Every section: heading (the fold), subheading, then body. Numbers
               that already sit in At a glance are not repeated below. */}
            <Folded id="cost" title="What it costs" open={open.has("cost")} onToggle={() => toggle("cost")}>
              <div className="flex flex-col gap-[var(--space-6)]">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What families pay, by what they earn</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>For a year, after grants and scholarships. The line is what the college charges before any aid.</p>
                  <div className="mt-[var(--space-4)]">
                    <HBars
                      rows={d.bands.map((b) => ({ label: b.label, value: b.pay, display: money(b.pay) }))}
                      marker={d.tuitionInState !== null && d.fees !== null ? { value: d.tuitionInState + d.fees, label: "Sticker price, tuition and fees:" } : undefined}
                      unit="$"
                    />
                  </div>
                </div>
                {(d.tuitionInState !== null || d.housing) && (
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What the college charges</h3>
                    <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Before any aid. Hardly anyone pays this.</p>
                    <div className="mt-[var(--space-3)]">
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
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Help with the bill</h3>
                    <div className="mt-[var(--space-2)]">
                      {d.scholarshipShare !== undefined && <MeterRow label="Got a scholarship from the college" note={d.scholarshipAvg ? `first-years · about ${money(d.scholarshipAvg)} each` : "first-years"} pct={d.scholarshipShare} last={d.pell === undefined} />}
                      {d.pell !== undefined && <MeterRow label="Got a federal Pell grant" note="for lower-income families" pct={d.pell} last />}
                    </div>
                  </div>
                )}
              </div>
            </Folded>

            <Folded id="in" title="Getting in" open={open.has("in")} onToggle={() => toggle("in")}>
              {c.admitRate === null ? (
                <p className={SMALL}>Everyone who applies is admitted. There is no competition to get in and no test scores to worry about. You still need to meet the requirements for the course you pick.</p>
              ) : (
                <div className="flex flex-col gap-[var(--space-6)]">
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Of every 100 who apply</h3>
                    <div className="mt-[var(--space-3)]">
                      <DotGrid pct={c.admitRate} caption={`${c.admitRate} are admitted${c.applied ? ` · ${c.applied.toLocaleString("en-US")} applied last year` : ""}`} />
                    </div>
                  </div>
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
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Scores of students who sent them</h3>
                      <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>The middle half. Only {d.scores.sentSat}% sent an SAT score{d.scores.sentAct !== undefined ? ` and ${d.scores.sentAct}% an ACT` : ""}, so being below this is not a reason to rule yourself out.</p>
                      <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
                        {(() => { const [lo, hi] = d.scores.sat.split(" to ").map(Number); return Number.isFinite(lo) && Number.isFinite(hi) ? <RangeBar label="SAT" min={400} max={1600} lo={lo} hi={hi} /> : null; })()}
                        {d.scores.act && (() => { const [lo, hi] = d.scores.act!.split(" to ").map(Number); return Number.isFinite(lo) && Number.isFinite(hi) ? <RangeBar label="ACT" min={1} max={36} lo={lo} hi={hi} /> : null; })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Folded>

            <Folded id="study" title="What you can study" open={open.has("study")} onToggle={() => toggle("study")}>
              <div className="grid gap-[var(--space-6)] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Degrees offered</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{d.programmeCount} programmes in total.</p>
                  <div className="mt-[var(--space-4)]">
                    <HBars rows={d.levels.map((l) => ({ label: l.label, value: l.n, display: String(l.n) }))} />
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Biggest programmes</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Share of everyone who graduates here, and what they earned one year out.</p>
                  <div className="mt-[var(--space-4)]">
                    <HBars rows={d.programmes.slice(0, 6).map((p) => ({ label: p.name, value: p.share, display: `${p.share}%`, note: `${p.grads} a year · ${p.pay === "not published" ? "pay not published" : `${p.pay} a year out`}` }))} max={Math.max(20, ...d.programmes.slice(0, 6).map((p) => p.share))} />
                  </div>
                </div>
              </div>
            </Folded>

            <Folded id="life" title="Life there" open={open.has("life")} onToggle={() => toggle("life")}>
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
                {d.sport && (
                  <div className="md:col-span-2">
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Sport</h3>
                    <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{d.sport.league} · {d.sport.students.toLocaleString("en-US")} students on a team. Clubs are not counted by any government survey; the college&apos;s own site lists them.</p>
                    <ul className="mt-[var(--space-3)] flex flex-wrap gap-[8px]">{d.sport.teams.map((t) => <li key={t} className="rounded-full px-[11px] py-[4px] text-[13px] leading-[17px] font-semibold" style={{ background: "rgba(255,255,255,0.08)" }}>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            </Folded>

            <Folded id="who" title="Who is there" open={open.has("who")} onToggle={() => toggle("who")}>
              <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>How students study</h3>
                  <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-5)]">
                    {d.gradStudents !== undefined && <SplitBar title="Undergraduates and graduate students" a={{ label: "undergraduates", value: c.undergrads }} b={{ label: "graduate students", value: d.gradStudents }} />}
                    <SplitBar title="Full time and part time" a={{ label: "full time", value: d.fullTime }} b={{ label: "part time", value: d.partTime }} />
                    <SplitBar title="Women and men" a={{ label: "women", value: Math.round((c.undergrads * d.women) / 100) }} b={{ label: "men", value: Math.round((c.undergrads * d.men) / 100) }} />
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Where undergraduates come from</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>The categories the federal government collects. &ldquo;International&rdquo; means students on visas.</p>
                  <div className="mt-[var(--space-4)]">
                    <HBars rows={d.makeup.map((m) => ({ label: m.label, value: m.pct, display: `${m.pct}%` }))} max={100} />
                  </div>
                </div>
              </div>
            </Folded>

            <Folded id="after" title="After college" open={open.has("after")} onToggle={() => toggle("after")}>
              <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Pay and debt</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Everyone who went here, in every subject. Debt is federal loans owed at graduation.</p>
                  <div className="mt-[var(--space-4)]">
                    <HBars rows={[
                      { label: "Typical pay", note: "6 years after starting", value: d.pay6 ?? 0, display: d.pay6 ? money(d.pay6) : "Not published" },
                      { label: "Owe when they finish", note: d.monthly ? `about ${money(d.monthly)} a month to repay` : undefined, value: d.debt ?? 0, display: d.debt ? money(d.debt) : "Not published" },
                    ]} />
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Paying it back</h3>
                  <div className="mt-[var(--space-2)]">
                    <MeterRow label="Reduced what they owe" note="of those who borrowed" pct={c.repay} last />
                  </div>
                </div>
              </div>
            </Folded>
          </>
        )}

        <Folded id="see" title="See it, then ask someone" open={open.has("see")} onToggle={() => toggle("see")}>
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <a href={tourUrl} target="_blank" rel="noreferrer" className="dm-tap flex items-start gap-[12px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <PlayCircle className="mt-[2px] h-6 w-6 flex-none" aria-hidden style={{ color: SOFT }} />
              <span className="flex flex-col gap-[2px]">
                <span className="text-[15px] leading-[20px] font-bold">Campus tours on YouTube</span>
                <span className="text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Real students walking around. Opens outside Dreamari.</span>
              </span>
            </a>
            <Link href="/connect" className="dm-tap flex items-start gap-[12px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <MessagesSquare className="mt-[2px] h-6 w-6 flex-none" aria-hidden style={{ color: SOFT }} />
              <span className="flex flex-col gap-[2px]">
                <span className="text-[15px] leading-[20px] font-bold">Ask a pro on Connect</span>
                <span className="text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Verified professionals answer questions about where they studied.</span>
              </span>
            </Link>
          </div>
        </Folded>

        <Folded id="sources" title="Where these numbers come from" open={open.has("sources")} onToggle={() => toggle("sources")}>
          <div className="flex flex-col gap-[var(--space-3)]">
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}><strong className="font-bold" style={{ color: "var(--foreground)" }}>Cost for a year.</strong> The average a family paid for a year after grants, from the federal IPEDS survey. Published for full-time, first-time students who got federal aid. Use the college&apos;s own calculator for your number.</p>
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}><strong className="font-bold" style={{ color: "var(--foreground)" }}>Finish.</strong> Counts every student who started, part-time and transfers included, so it is the harder, honest test.</p>
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}><strong className="font-bold" style={{ color: "var(--foreground)" }}>Pay and debt.</strong> From the federal College Scorecard. They describe everyone who went here, in every subject, not one programme.</p>
            {d?.sample && <p className={SMALL} style={{ color: "var(--muted-foreground)" }}><strong className="font-bold" style={{ color: "var(--foreground)" }}>Prototype note.</strong> The headline figures for this college are from the government data. The detail sections are sample figures in the same shape, until the live data is wired in.</p>}
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>Collected for 2024-25. Government data arrives about 18 months late, so check anything time-sensitive with the college.</p>
          </div>
        </Folded>
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
