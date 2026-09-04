"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, MessagesSquare, PlayCircle } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { BackButton, DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { CardProgressiveBlur } from "@/components/app/cardChrome";
import { BIG, DISPLAY, DotList, Folded, LABEL, MEDIUM, PANEL, SMALL } from "@/components/career/CareerDetailExperience";
import { collegeBySlug, money } from "./data";
import { ACCENT, CollegePicture, MarkBadge, RULE, Row, SOFT, SaveButton, pct, tags, useSaved } from "./shared";
import { Donut, Ladder, RangeBar, SplitBar } from "./viz";
import { EXTRA } from "./extra";
import { Segmented } from "@/components/connect/viz";

// One college. The career page's anatomy: a header that dissolves into the
// campus photo, four facts, then folded sections in the order a student needs
// them. One shape per idea: label and value rows; a picture only where its
// shape answers something a row cannot. Nothing is said twice on the page. Design notes:
// docs/COLLEGE_LOOKUP_AUDIT.md.

const SIZE_WORD = { Small: "Small", Medium: "Mid-size", Large: "Big" } as const;
type SectionKey = "in" | "cost" | "academics" | "study" | "who" | "life" | "after" | "see" | "sources";

/** A quiet in-section disclosure: the headline rows stay, the rest wait
 *  behind one link so a section never opens as a wall of numbers. */
function Reveal({ label, children }: { label: string; children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  if (on) return <>{children}</>;
  return (
    <button type="button" onClick={() => setOn(true)} className="dm-link mt-[var(--space-2)] flex min-h-[36px] cursor-pointer items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: SOFT }}>
      {label} <ChevronDown className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function CollegeDetailExperience({ slug }: { slug: string }) {
  const c = collegeBySlug(slug);
  const [open, setOpen] = useState<Set<SectionKey>>(() => new Set<SectionKey>(["in"]));
  const [saved, toggleSaved] = useSaved();
  const [level, setLevel] = useState<string | null>(null);
  const [allRows, setAllRows] = useState(false);
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
  const x = EXTRA[c.slug];
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
              <h1 className="text-[34px] leading-[38px] font-extrabold text-balance sm:text-[44px] sm:leading-[48px]" style={{ ...DISPLAY, color: "#fff" }}>{c.name}</h1>
              <p className={LABEL} style={{ color: "rgba(255,255,255,0.85)" }}>{c.city}, {c.stateName}</p>
              <ul className="flex flex-wrap gap-[6px]" aria-label="About this college" style={{ textShadow: "none" }}>
                {[SIZE_WORD[c.size], ...tags(c)].map((t) => <li key={t} className="rounded-[var(--radius-sm)] px-[9px] py-[3px] text-[12px] leading-[16px] font-bold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>{t}</li>)}
              </ul>
              {d?.address && !d.sample && (
                <p className="text-[13px] leading-[17px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {x?.links.map ? <a href={x.links.map} target="_blank" rel="noreferrer" className="dm-link underline decoration-[rgba(255,255,255,0.35)] underline-offset-2">{d.address}</a> : d.address}
                </p>
              )}
              <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)]" style={{ textShadow: "none" }}>
                {c.website && (
                  <a href={c.website} target="_blank" rel="noreferrer" className="dm-solid flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>
                    Their website <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                )}
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

        {/* At a glance: the four answers a student came for, as rows. Setting
           is already a chip in the header and the sticker price lives in What
           it costs, so neither repeats here. */}
        <section aria-labelledby="glance-title" className="flex flex-col rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
          <h2 id="glance-title" className={`${BIG} -mx-[var(--space-5)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]`} style={{ ...DISPLAY, borderColor: RULE }}>At a glance</h2>
          <div className="pt-[var(--space-2)]">
            <Row label="Cost for a year" note="what families pay after grants and scholarships" value={c.netPrice === null ? "Not published" : money(c.netPrice)} />
            <Row label="Applicants who get in" note={c.applied ? `${c.applied.toLocaleString("en-US")} applied last year` : "open admission"} value={c.admitRate === null ? "All of them" : `${c.admitRate}%`} />
            <Row label="Students who finish their degree" note="within six years, counting everyone who started" value={pct(c.finish)} />
            <Row label="Undergraduates" note={d?.gradStudents ? `plus ${d.gradStudents.toLocaleString("en-US")} graduate students` : undefined} value={c.undergrads.toLocaleString("en-US")} last />
          </div>
        </section>

        {d && (
          <>
            <Folded id="in" title="Getting in" open={open.has("in")} onToggle={() => toggle("in")}>
              {c.admitRate === null ? (
                <DotList items={["Everyone who applies gets in", "No test scores needed", "You still need to meet the requirements for your course"]} accent={ACCENT} />
              ) : (
                <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What they ask for</h3>
                    <div className="mt-[var(--space-2)]">
                      {d.require.map((r) => <Row key={r} label={r} value="Required" />)}
                      {d.consider.map((r, i, arr) => <Row key={r} label={r} value="Looked at" tone="muted" last={i === arr.length - 1} />)}
                    </div>
                    {x?.links.apply && (
                      <a href={x.links.apply} target="_blank" rel="noreferrer" className="dm-link mt-[var(--space-3)] flex w-fit items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: SOFT }}>
                        How to apply <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </a>
                    )}
                  </div>
                  {d.scores && (
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Scores of students who got in</h3>
                      <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>The middle half of those who sent one. A lower score is not a no.</p>
                      <div className="mt-[var(--space-2)]">
                        {x?.satR && x.satM ? (
                          <>
                            <RangeBar label="SAT reading" note={`${x.satR.sent}% of students sent SAT scores`} lo={x.satR.lo} hi={x.satR.hi} max={800} />
                            <RangeBar label="SAT maths" lo={x.satM.lo} hi={x.satM.hi} max={800} last={!x.act} />
                          </>
                        ) : (
                          <Row label="SAT" note={`out of 1600. ${d.scores.sentSat}% of students sent one`} value={d.scores.sat} last={!d.scores.act} />
                        )}
                        {x?.act ? <RangeBar label="ACT" note={`${x.act.sent}% of students sent ACT scores`} lo={x.act.lo} hi={x.act.hi} max={36} last /> : d.scores.act && !x?.satR ? <Row label="ACT" note={d.scores.sentAct !== undefined ? `out of 36. ${d.scores.sentAct}% of students sent one` : "out of 36"} value={d.scores.act} last /> : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Folded>

            <Folded id="cost" title="What it costs" open={open.has("cost")} onToggle={() => toggle("cost")}>
              {(() => {
                const sticker = d.tuitionInState !== null && d.fees !== null ? d.tuitionInState + d.fees + (d.housingCost ?? 0) + (d.foodCost ?? 0) : null;
                const lowerPaysMore = d.bands.some((b, i) => i > 0 && b.pay < d.bands[i - 1].pay);
                return (
                  <div className="flex flex-col gap-[var(--space-6)]">
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What families actually pay</h3>
                      <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>For a year, after grants. Lower income, bigger grant.{lowerPaysMore ? " Savings and living at home change it too." : ""}</p>
                      <div className="mt-[var(--space-2)]">
                        {sticker ? (
                          <Ladder
                            ceiling={sticker}
                            format={(n) => money(n)}
                            rows={[
                              { label: "Full price", note: d.housingCost ? "tuition, fees, housing and food, before any aid" : "tuition and fees, before any aid", value: sticker, top: true },
                              ...d.bands.map((b) => ({ label: `Family earns ${b.label.toLowerCase()}`, value: b.pay })),
                              { label: "Average", note: "across all families who got aid", value: c.netPrice ?? 0 },
                            ]}
                          />
                        ) : (
                          <>
                            {d.bands.map((b) => <Row key={b.label} label={`Family earns ${b.label.toLowerCase()}`} value={money(b.pay)} />)}
                            <Row label="Average" note="across all families who got aid" value={c.netPrice === null ? "Not published" : money(c.netPrice)} last />
                          </>
                        )}
                      </div>
                      <div className="mt-[var(--space-3)] flex flex-wrap gap-x-[var(--space-5)] gap-y-[var(--space-2)]">
                        {(x?.links.calc || c.website) && (
                          <a href={x?.links.calc ?? c.website} target="_blank" rel="noreferrer" className="dm-link flex w-fit items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: SOFT }}>
                            Your family&apos;s price <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </a>
                        )}
                        {x?.links.aid && (
                          <a href={x.links.aid} target="_blank" rel="noreferrer" className="dm-link flex w-fit items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: SOFT }}>
                            Financial aid <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                      {d.tuitionInState !== null && (
                        <div>
                          <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>The full price, broken down</h3>
                          <div className="mt-[var(--space-2)]">
                            <Row label={d.tuitionInState === d.tuitionOutState ? "Tuition" : "Tuition, in state"} value={money(d.tuitionInState)} />
                            {d.tuitionOutState !== null && d.tuitionOutState !== d.tuitionInState && <Row label="Tuition, out of state" value={money(d.tuitionOutState)} />}
                            {d.fees !== null && <Row label="Required fees" value={d.fees === 0 ? "None" : money(d.fees)} last={!d.housing && d.housingCost === undefined} />}
                            {d.housingCost !== undefined ? <Row label={d.foodCost ? "Housing on campus" : "Housing and food on campus"} value={money(d.housingCost)} last={d.foodCost === undefined} /> : <Row label="Housing on campus" value={d.housing ? "Yes" : "None, commute only"} tone="muted" last />}
                            {d.foodCost !== undefined && <Row label="Food" note={x?.meal === "Yes" ? "meal plans offered" : x?.meal === "No" ? "no meal plans" : undefined} value={money(d.foodCost)} last />}
                          </div>
                        </div>
                      )}
                      {(d.scholarshipShare !== undefined || d.pell !== undefined) && (
                        <div>
                          <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Money you do not pay back</h3>
                          <div className="mt-[var(--space-2)]">
                            {d.scholarshipShare !== undefined && <Row label="New students with a scholarship from the college" note={d.scholarshipAvg && d.scholarshipShare ? `about ${money(d.scholarshipAvg)} each` : undefined} value={d.scholarshipShare ? `${d.scholarshipShare}%` : "None"} last={d.pell === undefined} />}
                            {d.pell !== undefined && <Row label="Students with a federal Pell grant" note="for lower-income families" value={`${d.pell}%`} last />}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Folded>

            <Folded id="academics" title="Academics" open={open.has("academics")} onToggle={() => toggle("academics")}>
              <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Finishing</h3>
                  <div className="mt-[var(--space-2)]">
                    <Row label="Finish within six years" note="everyone who started, part time and transfers included" value={pct(c.finish)} />
                    {typeof d.finish4 === "number" && <Row label="Finish in four years" note="bachelor's students who started here" value={`${d.finish4}%`} last={!x} />}
                    {x && (
                      <Reveal label="More finish rates">
                        {x.finish5 !== null && <Row label="Finish in five years" note="bachelor's students who started here" value={`${x.finish5}%`} />}
                        {x.finish6b !== null && <Row label="Finish in six years" note="bachelor's students who started here" value={`${x.finish6b}%`} />}
                        {x.finish6ft !== null && <Row label="Finish in six years" note="full-time students only" value={`${x.finish6ft}%`} />}
                        <Row label="Finish within eight years" note="everyone who started" value={x.finish8 !== null ? `${x.finish8}%` : "Not published"} last />
                      </Reveal>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Staying, and class size</h3>
                  <div className="mt-[var(--space-2)]">
                    <Row label="First-years who come back" value={pct(c.retention)} />
                    {x?.retPart !== null && x?.retPart !== undefined && <Row label="Part-time students who come back" value={`${x.retPart}%`} />}
                    <Row label="Students per teacher" value={d.ratio} last />
                  </div>
                </div>
              </div>
            </Folded>

            <Folded id="study" title="What you can study" open={open.has("study")} onToggle={() => toggle("study")}>
              {x && Object.keys(x.programmes).length > 0 ? (() => {
                const levels = Object.keys(x.programmes);
                const active = level && levels.includes(level) ? level : levels.includes("Bachelor's degrees") ? "Bachelor's degrees" : levels[0];
                const rows = x.programmes[active] ?? [];
                const total = x.counts[active] ?? rows.length;
                const shown = allRows ? rows : rows.slice(0, 5);
                return (
                  <div className="flex flex-col gap-[var(--space-4)]">
                    <Segmented ariaLabel="Programme level" value={active} onChange={(k) => { setLevel(k); setAllRows(false); }} options={levels.map((l) => ({ key: l, label: l.replace(/ degrees$/, "").replace("Graduate certificates", "Grad certificates") }))} />
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>{total} {active.toLowerCase()}</h3>
                      <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Biggest first. Pay is one year after graduating.</p>
                      <div className="mt-[var(--space-2)]">
                        {shown.map((p, i, arr) => <Row key={p.name} label={p.name} note={`${p.grads.toLocaleString("en-US")} graduates a year, ${p.share} of all graduates`} value={p.pay.startsWith("$") ? `${p.pay} a year` : p.pay === "not reported" ? "Pay not reported" : "Too few to publish pay"} tone={p.pay.startsWith("$") ? "ink" : "muted"} last={i === arr.length - 1} />)}
                      </div>
                      {rows.length > 5 && !allRows && (
                        <button type="button" onClick={() => setAllRows(true)} className="dm-link mt-[var(--space-2)] flex min-h-[36px] cursor-pointer items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: SOFT }}>{rows.length} biggest <ChevronDown className="h-4 w-4" aria-hidden /></button>
                      )}
                      {allRows && total > rows.length && c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer" className="dm-link mt-[var(--space-2)] flex w-fit items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: SOFT }}>All {total} on the college&apos;s site <ArrowUpRight className="h-4 w-4" aria-hidden /></a>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="flex flex-col gap-[var(--space-6)]">
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>{d.programmeCount} programmes</h3>
                    <div className="mt-[var(--space-2)]">
                      {d.levels.filter((l) => l.n > 0).map((l, i, arr) => <Row key={l.label} label={/degree|certificate/i.test(l.label) ? l.label : `${l.label} degrees`} value={String(l.n)} last={i === arr.length - 1} />)}
                    </div>
                  </div>
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Biggest programmes</h3>
                    <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Pay is one year after graduating.</p>
                    <div className="mt-[var(--space-2)]">
                      {d.programmes.map((p, i, arr) => <Row key={p.name} label={p.name} note={`${p.grads} graduates a year, ${p.share}% of all graduates`} value={p.pay === "not published" ? "Pay not published" : `${p.pay} a year`} tone={p.pay === "not published" ? "muted" : "ink"} last={i === arr.length - 1} />)}
                    </div>
                  </div>
                </div>
              )}
            </Folded>

            <Folded id="who" title="Who is there" open={open.has("who")} onToggle={() => toggle("who")}>
              <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>{(c.undergrads + (d.gradStudents ?? 0)).toLocaleString("en-US")} students</h3>
                  <div className="mt-[var(--space-1)]">
                    {d.gradStudents ? <SplitBar title="Undergraduates and graduate students" a={{ label: "undergraduates", value: c.undergrads }} b={{ label: "graduate students", value: d.gradStudents }} /> : null}
                    <SplitBar title="Full time and part time" a={{ label: "full time", value: d.fullTime }} b={{ label: "part time", value: d.partTime }} />
                    <SplitBar title="Women and men, undergraduates" a={{ label: "women", value: Math.round((c.undergrads * d.women) / 100) }} b={{ label: "men", value: Math.round((c.undergrads * d.men) / 100) }} />
                  </div>
                </div>
                <div>
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Where undergraduates come from</h3>
                  <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>The government&apos;s categories. International means students on visas.</p>
                  <div className="mt-[var(--space-4)]">
                    <Donut parts={d.makeup.map((m) => ({ label: m.label, pct: m.pct, n: m.n }))} />
                  </div>
                </div>
              </div>
            </Folded>

            <Folded id="life" title="Life there" open={open.has("life")} onToggle={() => toggle("life")}>
              <div className="flex flex-col gap-[var(--space-6)]">
                <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Ways to study here</h3>
                    <div className="mt-[var(--space-2)]">
                      {x && x.ways.length ? x.ways.map((w, i, arr) => <Row key={w.name} label={w.name} note={w.note} value="" last={i === arr.length - 1} />) : d.ways.length ? d.ways.map((w, i, arr) => <Row key={w} label={w} value="" last={i === arr.length - 1} />) : <Row label="No extras" note="no study abroad, no ROTC, no evening classes" value="" last />}
                    </div>
                  </div>
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>What the college helps with</h3>
                    <div className="mt-[var(--space-2)]">
                      {d.helps.map((h, i, arr) => <Row key={h} label={h} value="" last={i === arr.length - 1 && !d.notOffered?.length} />)}
                      {d.notOffered?.map((n, i, arr) => <Row key={n} label={n} value="Not offered" tone="muted" last={i === arr.length - 1} />)}
                    </div>
                  </div>
                </div>
                {d.sport && (
                  <div>
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Sport</h3>
                    <div className="mt-[var(--space-2)]">
                      <Row label="League" value={d.sport.league} last={!(x?.teamMen && x?.teamWomen)} />
                      {x?.teamMen && x?.teamWomen ? (
                        <SplitBar title={`${d.sport.students.toLocaleString("en-US")} students on a team`} a={{ label: "men", value: x.teamMen }} b={{ label: "women", value: x.teamWomen }} />
                      ) : (
                        <Row label="Students on a team" value={d.sport.students.toLocaleString("en-US")} last />
                      )}
                    </div>
                    <ul className="mt-[var(--space-3)] flex flex-wrap gap-[8px]" aria-label="Teams">{d.sport.teams.map((t) => <li key={t} className="rounded-full px-[11px] py-[4px] text-[13px] leading-[17px] font-semibold" style={{ background: "rgba(255,255,255,0.08)" }}>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            </Folded>

            <Folded id="after" title="After college" open={open.has("after")} onToggle={() => toggle("after")}>
              <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Pay and debt</h3>
              <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Everyone who went here, in every subject.</p>
              <div className="mt-[var(--space-2)]">
                <Row label="Typical pay six years after starting" note="finished or not" value={d.pay6 ? `${money(d.pay6)} a year` : "Not published"} />
                <Row label="Owed when they finish" note={d.monthly ? `federal loans, about ${money(d.monthly)} a month` : "federal loans"} value={d.debt ? money(d.debt) : "Not published"} />
                <Row label="Borrowers paying their loans back" value={c.repay !== null ? `${c.repay}%` : "Not published"} last={x?.fallBehind === null || x?.fallBehind === undefined} />
                {x?.fallBehind !== null && x?.fallBehind !== undefined && <Row label="Borrowers who fall behind" value={`${x.fallBehind}%`} last />}
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
            <Row label="Year" note="government data runs about 18 months behind" value="2024-25" />
            <Row label="Accredited by" value={c.accreditor} tone="muted" last={!d?.partOf && !d?.sample} />
            {d?.partOf && <Row label="Part of" value={d.partOf} tone="muted" last={!d.sample} />}
            {d?.sample && <Row label="Prototype note" note="headline figures are real; detail is sample data until the live feed is wired in" value="Sample" last />}
          </div>
        </Folded>
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
