"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { BorderBeam } from "border-beam";
import { BackButton, DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { CardProgressiveBlur } from "@/components/app/cardChrome";
import { BIG, DISPLAY, DotList, Folded, LABEL, MEDIUM, PANEL } from "@/components/career/CareerDetailExperience";
import { collegeBySlug, money } from "./data";
import { ACCENT, CollegePicture, MarkBadge, RULE, Row, SOFT, SaveButton, pct, tags, useSaved } from "./shared";
import { Donut, SplitBar } from "./viz";
import { EXTRA } from "./extra";
import { Segmented } from "@/components/connect/viz";

// One college. The career page's anatomy: a header that dissolves into the
// campus photo, four facts, then folded sections in the order a student needs
// them. One shape per idea: label and value rows; a picture only where its
// shape answers something a row cannot. Nothing is said twice on the page. Design notes:
// docs/COLLEGE_LOOKUP_AUDIT.md.

const SIZE_WORD = { Small: "Small", Medium: "Mid-size", Large: "Big" } as const;
// Horizontal tabs (direct feedback, 8 Sept 2026): one section of information
// on screen at a time instead of one long page of accordions, easier to
// follow on a phone and less "everything at once" overload. "Where these
// numbers come from" is cross-cutting, not specific to one tab, so it stays
// outside the tab system, always visible under whichever tab is open
// (unchanged foldable behavior). "See it, then ask someone" (YouTube +
// Connect) was removed entirely (direct feedback, 15 Sept 2026): it sent
// students outside the app, and implied Connect always has a pro from that
// exact school, which isn't guaranteed.
type Tab = "overview" | "admissions" | "cost" | "academics" | "student" | "life";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "admissions", label: "Admissions" },
  { key: "cost", label: "Cost" },
  { key: "academics", label: "Academics" },
  { key: "student", label: "Student body" },
  { key: "life", label: "Campus life" },
];
type SectionKey = "sources";

// Same information the per-college `require`/`consider` data already
// carries, just trimmed to match the admissions tab's own tighter copy
// (direct feedback, 15 Sept 2026: "less copy... clearer hierarchy") --
// "Your school record" reads fine in a sentence but is redundant as a list
// item; "A personal essay" doesn't need the article. Applied uniformly
// rather than hand-editing 30 colleges' worth of data.ts arrays.
const FACTOR_LABEL: Record<string, string> = {
  "Your school record": "School record",
  "Recommendations": "Recommendation letter",
  "An English test": "English test",
  "A personal essay": "Personal essay",
  "A demonstration of skills": "Demonstration of skills",
  "Whether a relative went there": "Family connection or legacy",
};
const factorLabel = (s: string) => FACTOR_LABEL[s] ?? s;

// Same trim, applied to the government's own demographic category names
// (direct feedback, 15 Sept 2026: shorter labels on the Student Body donut).
const DEMO_LABEL: Record<string, string> = {
  "Hispanic or Latino": "Hispanic / Latino",
  "Black or African American": "Black",
  "American Indian or Alaska Native": "American Indian / Alaska Native",
};
const demoLabel = (s: string) => DEMO_LABEL[s] ?? s;

/** One tab's content: the same grounded panel "Key Facts" already uses,
 *  so a tab never reads as a lesser version of the page's own header
 *  section. */
function TabPanel({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
      <h2 id={id} className={`${BIG} -mx-[var(--space-5)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]`} style={{ ...DISPLAY, borderColor: RULE }}>{title}</h2>
      <div className="flex flex-col gap-[var(--space-6)] pt-[var(--space-4)]">{children}</div>
    </section>
  );
}

/** A headline number, not a row -- Cost's "Full Price"/"Average Cost After
 *  Aid" (direct feedback, 15 Sept 2026: two figures a student should read
 *  in seconds, not find inside a bar chart). */
function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <span className={LABEL} style={{ color: SOFT }}>{label}</span>
      <span className="text-[26px] leading-[30px] font-extrabold" style={DISPLAY}>{value}</span>
      {note && <span className="text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
    </div>
  );
}

/** "Under $30,000" -> "Under $30K", "$30,000 to $48,000" -> "$30K–$48K",
 *  "Over $110,000" -> "$110K+" -- the same five fixed bands every college
 *  uses (data.ts), trimmed so a family-income table doesn't repeat "Family
 *  earns" on every row (direct feedback, 15 Sept 2026). */
function bandLabel(label: string): string {
  const short = (s: string) => s.replace(/,000/g, "K");
  if (label.startsWith("Under ")) return `Under ${short(label.slice(6))}`;
  if (label.startsWith("Over ")) return `${short(label.slice(5))}+`;
  return short(label).replace(" to ", "–");
}

/** Per-school focal point for the wide desktop header crop, where the
 *  default (a little above centre) would lose the subject. */
const HEADER_FOCUS: Record<string, string> = {
  // the three students in regalia stand at the foot of the Multipurpose Center
  "sinte-gleska-university": "50% 82%",
};

export function CollegeDetailExperience({ slug }: { slug: string }) {
  const c = collegeBySlug(slug);
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState<Set<SectionKey>>(() => new Set<SectionKey>());
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
  // Financial Aid falls back to the net price calculator when a school has
  // no dedicated aid page but does have one of those (Princeton, for
  // instance) -- still genuinely aid-relevant, not a mislabeled dead end.
  const applyHref = x?.links.apply ?? null;
  const aidHref = x?.links.aid ?? x?.links.calc ?? null;

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation active="Explore" />
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <span className="flex items-center gap-[var(--space-3)]"><BackButton fallback="/colleges" /><Wordmark /></span>
        <QuickLinksMenu />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col gap-[var(--space-5)] px-5 pt-2 pb-[140px] md:px-8 md:pt-[var(--space-10)]">

        {/* header: the photo runs behind the whole card on phones; from md it
           sits on the right half and fades into the panel toward the text */}
        <section className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ ...PANEL, background: "#0e0c20" }}>
          {/* desktop back sits inside the header over the photo, like the
             phone's back + wordmark row, instead of on its own row above
             the card (direct feedback, 11 Sept 2026) */}
          <span className="absolute top-[16px] left-[16px] z-20 hidden md:block"><BackButton fallback="/colleges" /></span>
          <div className="absolute inset-0" aria-hidden>
            <CollegePicture c={c} sizes="100vw" priority className="absolute inset-0 h-full w-full md:hidden" />
            {/* Full bleed from md (direct feedback, 11 Sept 2026: "make the
               image more dominant"): the photo covers the whole header, the
               progressive blur frosts its left half under the title and a
               soft left-to-right fade keeps the type legible. No seam, since
               nothing is clipped. */}
            <span className="absolute inset-0 hidden md:block">
              {/* campus photos carry their subject in the upper middle (buildings,
                 spires) with lawn or parking below, so the wide crop anchors a
                 little above centre instead of taking a taller header */}
              <CollegePicture c={c} sizes="1100px" priority position={HEADER_FOCUS[c.slug] ?? "50% 38%"} className="absolute inset-0 h-full w-full" />
              <CardProgressiveBlur direction="left" size="62%" />
              <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(14,12,32,0.82) 0%, rgba(14,12,32,0.62) 30%, rgba(14,12,32,0.2) 56%, transparent 76%)" }} />
            </span>
            {/* Legibility without dimming the campus (direct feedback, 11 Sept
               2026: header photos "too dim"). No flat wash any more. Phones,
               where the title sits on the photo, keep a firm bottom fade and
               the progressive blur; from md the photo is on the right and
               the title on the panel, so only a light foot gradient stays. */}
            <span className="md:hidden"><CardProgressiveBlur size="58%" /></span>
            <span className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.92) 0%, rgba(12,16,35,0.7) 28%, rgba(12,16,35,0.3) 52%, transparent 74%)" }} />
            <span className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.7) 0%, rgba(12,16,35,0.3) 30%, transparent 58%)" }} />
          </div>
          <div className="relative flex min-h-[300px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-6)] pt-[120px] sm:p-[var(--space-8)] sm:pt-[120px] md:min-h-[320px]">
            <div className="flex flex-col gap-[var(--space-3)] md:max-w-[62%]">
              {/* the mark sits on the title line, same weight as the type
                 (direct feedback, 11 Sept 2026: marks more visible, header
                 no busier); a light ring reads on sky and brick alike */}
              <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:gap-[var(--space-4)]">
                {/* phones stack the badge above the name so a long name keeps
                   the full column width; inline from sm */}
                <span className="sm:hidden"><MarkBadge c={c} size={52} ring="light" /></span>
                <span className="hidden sm:block"><MarkBadge c={c} size={64} ring="light" /></span>
                <h1 className="text-[34px] leading-[38px] font-extrabold text-balance sm:text-[44px] sm:leading-[48px]" style={{ ...DISPLAY, color: "#fff" }}>{c.name}</h1>
              </div>
              <p className={LABEL} style={{ color: "rgba(255,255,255,0.85)" }}>{c.city}, {c.stateName}</p>
              <ul className="flex flex-wrap gap-[6px]" aria-label="About this college" style={{ textShadow: "none" }}>
                {[SIZE_WORD[c.size], ...tags(c)].map((t) => <li key={t} className="rounded-[var(--radius-sm)] px-[9px] py-[3px] text-[12px] leading-[16px] font-bold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>{t}</li>)}
              </ul>
              {d?.address && !d.sample && (
                <p className="text-[13px] leading-[17px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {x?.links.map ? <a href={x.links.map} target="_blank" rel="noreferrer" className="dm-link underline decoration-[rgba(255,255,255,0.35)] underline-offset-2">{d.address}</a> : d.address}
                </p>
              )}
              {/* Three primary actions plus Save (direct feedback, 15 Sept
                 2026) -- Website is the one every school always has, so it
                 keeps the animated beam; Apply/Financial Aid are real but
                 secondary, a plain solid fill. */}
              <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)]" style={{ textShadow: "none" }}>
                {c.website && (
                  // Solid ACCENT fill used to sit flush against the beam ring
                  // and swallow it -- same fix as GetHired/Connect/Career
                  // Detail's solid CTAs elsewhere this session.
                  <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}>
                  <a href={c.website} target="_blank" rel="noreferrer" className="dm-solid flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ background: `color-mix(in srgb, ${ACCENT} 22%, var(--glass-surface-2))`, borderColor: `color-mix(in srgb, ${ACCENT} 45%, transparent)`, color: "#fff" }}>
                    Website <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                  </BorderBeam>
                )}
                {applyHref && (
                  <a href={applyHref} target="_blank" rel="noreferrer" className="dm-tap flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.28)", color: "#fff" }}>
                    Apply <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                )}
                {aidHref && (
                  <a href={aidHref} target="_blank" rel="noreferrer" className="dm-tap flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.28)", color: "#fff" }}>
                    Financial Aid <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                )}
                {/* "Make my #1" (the Replit's) is out until Profile has a
                   place to show a #1 school; a control that led nowhere read
                   as broken (direct feedback, 11 Sept 2026). Save stays. */}
                <SaveButton on={saved.has(c.slug)} onToggle={() => toggleSaved(c.slug)} size={44} />
              </div>
            </div>
          </div>
        </section>

        <Segmented ariaLabel="College section" value={tab} onChange={(k) => setTab(k)} options={TABS} grow />

        {/* Key Facts (was "At a glance", direct feedback, 15 Sept 2026: less
           copy, faster to scan) -- the four numbers a student came for, no
           explanatory sub-copy under any of them. Setting is already a chip
           in the header and the sticker price lives in What it costs, so
           neither repeats here. */}
        {tab === "overview" && (
          <section aria-labelledby="keyfacts-title" className="flex flex-col rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:p-[var(--space-6)]" style={PANEL}>
            <h2 id="keyfacts-title" className={`${BIG} -mx-[var(--space-5)] border-b px-[var(--space-5)] pb-[var(--space-4)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]`} style={{ ...DISPLAY, borderColor: RULE }}>Key Facts</h2>
            <div className="pt-[var(--space-2)]">
              <Row label="Yearly Cost" value={c.netPrice === null ? "Not published" : money(c.netPrice)} />
              <Row label="Acceptance Rate" value={c.admitRate === null ? "All of them" : `${c.admitRate}%`} />
              <Row label="Graduation Rate" value={pct(c.finish)} />
              <Row label="Undergraduate Population" value={c.undergrads.toLocaleString("en-US")} last />
            </div>
          </section>
        )}

        {d && (
          <>
            {tab === "admissions" && (
            <TabPanel id="in-title" title="Getting in">
              {c.admitRate === null ? (
                <DotList items={["Everyone who applies gets in", "No test scores needed", "You still need to meet the requirements for your course"]} accent={ACCENT} />
              ) : (
                <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                  <div>
                    {/* Two plain grouped lists instead of a "Required"/
                       "Looked at" value repeated on every row (direct
                       feedback, 15 Sept 2026) -- the heading says it once
                       for the whole group. "How to apply" is gone too, now
                       that Apply is one of the header's own actions --
                       nothing said twice on the page. */}
                    {d.require.length > 0 && (
                      <div>
                        <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Requirements</h3>
                        <div className="mt-[var(--space-2)]"><DotList items={d.require.map(factorLabel)} accent={ACCENT} /></div>
                      </div>
                    )}
                    {d.consider.length > 0 && (
                      <div className={d.require.length > 0 ? "mt-[var(--space-5)]" : undefined}>
                        <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Other Factors Considered</h3>
                        <div className="mt-[var(--space-2)]"><DotList items={d.consider.map(factorLabel)} accent={ACCENT} /></div>
                      </div>
                    )}
                  </div>
                  {d.scores && (
                    <div>
                      {/* Plain ranges, no progress bars (direct feedback, 15
                         Sept 2026): "the ranges are the information students
                         actually need." */}
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Typical Scores</h3>
                      <div className="mt-[var(--space-2)]">
                        {x?.satR && x.satM ? (
                          <>
                            <Row label="SAT Reading" value={`${x.satR.lo}–${x.satR.hi}`} />
                            <Row label="SAT Math" value={`${x.satM.lo}–${x.satM.hi}`} last={!x.act} />
                          </>
                        ) : (
                          <Row label="SAT" value={d.scores.sat} last={!d.scores.act} />
                        )}
                        {x?.act ? <Row label="ACT" value={`${x.act.lo}–${x.act.hi}`} last /> : d.scores.act && !x?.satR ? <Row label="ACT" value={d.scores.act} last /> : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabPanel>
            )}

            {tab === "cost" && (
            <TabPanel id="cost-title" title="What It Costs">
              {(() => {
                const sticker = d.tuitionInState !== null && d.fees !== null ? d.tuitionInState + d.fees + (d.housingCost ?? 0) + (d.foodCost ?? 0) : null;
                const breakdown: { label: string; value: string }[] = [];
                if (d.tuitionInState !== null) breakdown.push({ label: d.tuitionInState === d.tuitionOutState ? "Tuition" : "Tuition, in state", value: money(d.tuitionInState) });
                if (d.tuitionOutState !== null && d.tuitionOutState !== d.tuitionInState) breakdown.push({ label: "Tuition, out of state", value: money(d.tuitionOutState) });
                if (d.fees !== null && d.fees > 0) breakdown.push({ label: "Fees", value: money(d.fees) });
                if (d.housingCost !== undefined) breakdown.push({ label: "Housing", value: money(d.housingCost) });
                if (d.foodCost !== undefined) breakdown.push({ label: "Food", value: money(d.foodCost) });
                return (
                  <div className="flex flex-col gap-[var(--space-6)]">
                    {/* Two headline numbers, not a bar chart (direct feedback,
                       15 Sept 2026: "a clean two-column table... make the
                       information feel much easier to absorb") -- full
                       price and what it actually becomes after aid are the
                       two numbers a student reads first. */}
                    <div className="grid gap-[var(--space-5)] sm:grid-cols-2">
                      {sticker !== null && <Stat label="Full Price" value={money(sticker)} note="Before financial aid" />}
                      {c.netPrice !== null && <Stat label="Average Cost After Aid" value={`${money(c.netPrice)} / year`} />}
                    </div>
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Cost by Family Income</h3>
                      <div className="mt-[var(--space-2)]">
                        {d.bands.map((b, i, arr) => <Row key={b.label} label={bandLabel(b.label)} value={money(b.pay)} last={i === arr.length - 1} />)}
                      </div>
                    </div>
                    <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                      {breakdown.length > 0 && (
                        <div>
                          <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Full Price Breakdown</h3>
                          <div className="mt-[var(--space-2)]">
                            {breakdown.map((r, i, arr) => <Row key={r.label} label={r.label} value={r.value} last={i === arr.length - 1} />)}
                          </div>
                        </div>
                      )}
                      {(d.scholarshipShare !== undefined || d.pell !== undefined) && (
                        <div>
                          <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Grants &amp; Scholarships</h3>
                          <div className="mt-[var(--space-2)]">
                            {d.scholarshipShare !== undefined && <Row label="College grant recipients" value={`${d.scholarshipShare}%`} last={d.pell === undefined} />}
                            {d.pell !== undefined && <Row label="Pell Grant recipients" value={`${d.pell}%`} last />}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </TabPanel>
            )}

            {tab === "academics" && (
            <div className="flex flex-col gap-[var(--space-5)]">
            <TabPanel id="academics-title" title="Academic Facts">
              {/* One flat list, no sub-headers, no notes (direct feedback,
                 15 Sept 2026: "no paragraphs underneath each metric unless
                 something genuinely needs clarification") -- exactly the
                 four numbers a student needs to judge academic success,
                 same shape as Overview's own Key Facts. The five/six/eight-
                 year finish-rate breakdown and the part-time retention
                 split are gone too, not just hidden -- "that's enough". */}
              <div>
                <Row label="Graduation Rate" value={pct(c.finish)} />
                {typeof d.finish4 === "number" && <Row label="4-Year Graduation Rate" value={`${d.finish4}%`} />}
                <Row label="First-Year Retention" value={pct(c.retention)} />
                <Row label="Student-Faculty Ratio" value={d.ratio} last />
              </div>
            </TabPanel>

            <TabPanel id="study-title" title="Popular Majors">
              {/* Name and share of graduates only -- no grads/year, no pay
                 (direct feedback, 15 Sept 2026: "idk why that is here in
                 the academics section... career salary and outcomes belong
                 elsewhere"), no "biggest first" subtitle. A value that
                 isn't available is just omitted, never a "not published"
                 row. */}
              {x && Object.keys(x.programmes).length > 0 ? (() => {
                const levels = Object.keys(x.programmes);
                const active = level && levels.includes(level) ? level : levels.includes("Bachelor's degrees") ? "Bachelor's degrees" : levels[0];
                const rows = x.programmes[active] ?? [];
                const total = x.counts[active] ?? rows.length;
                const shown = allRows ? rows : rows.slice(0, 5);
                return (
                  <div className="flex flex-col gap-[var(--space-4)]">
                    {levels.length > 1 && (
                      <Segmented ariaLabel="Programme level" value={active} onChange={(k) => { setLevel(k); setAllRows(false); }} options={levels.map((l) => ({ key: l, label: l.replace(/ degrees$/, "").replace("Graduate certificates", "Grad certificates") }))} />
                    )}
                    <div>
                      <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>{total} {active.toLowerCase()}</h3>
                      <div className="mt-[var(--space-2)]">
                        {shown.map((p, i, arr) => <Row key={p.name} label={p.name} value={p.share} last={i === arr.length - 1} />)}
                      </div>
                      {rows.length > 5 && !allRows && (
                        <button type="button" onClick={() => setAllRows(true)} className="dm-link mt-[var(--space-2)] flex min-h-[36px] cursor-pointer items-center gap-[4px] text-[15px] leading-[22px] font-bold" style={{ color: SOFT }}>View All Majors <ChevronDown className="h-4 w-4" aria-hidden /></button>
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
                    <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Popular Majors</h3>
                    <div className="mt-[var(--space-2)]">
                      {d.programmes.map((p, i, arr) => <Row key={p.name} label={p.name} value={`${p.share}%`} last={i === arr.length - 1} />)}
                    </div>
                  </div>
                </div>
              )}
            </TabPanel>
            </div>
            )}

            {tab === "student" && (
            <TabPanel id="who-title" title="Who Goes Here?">
              <div className="grid gap-[var(--space-6)] md:grid-cols-2">
                <div>
                  {/* Plain rows, no bars (direct feedback, 15 Sept 2026) --
                     full/part time are stored as headcounts, not a percent,
                     so they're converted here rather than in the data. */}
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Enrollment</h3>
                  <div className="mt-[var(--space-2)]">
                    <Row label="Total students" value={(c.undergrads + (d.gradStudents ?? 0)).toLocaleString("en-US")} />
                    <Row label="Undergraduate students" value={c.undergrads.toLocaleString("en-US")} />
                    {d.gradStudents !== undefined && <Row label="Graduate students" value={d.gradStudents.toLocaleString("en-US")} />}
                    <Row label="Full-time students" value={`${Math.round((d.fullTime / (d.fullTime + d.partTime)) * 100)}%`} />
                    <Row label="Part-time students" value={`${Math.round((d.partTime / (d.fullTime + d.partTime)) * 100)}%`} />
                    <Row label="Women" value={`${d.women}%`} />
                    <Row label="Men" value={`${d.men}%`} last />
                  </div>
                </div>
                <div>
                  {/* The one visualization on this tab worth keeping (direct
                     feedback, 15 Sept 2026) -- no explanatory paragraph, no
                     raw headcount next to the percent, trimmed labels
                     ("Hispanic / Latino", not "...or Latino"). Any real
                     methodology note belongs under Where these numbers come
                     from, not here. */}
                  <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Student Demographics</h3>
                  <div className="mt-[var(--space-4)]">
                    <Donut parts={d.makeup.map((m) => ({ label: demoLabel(m.label), pct: m.pct }))} />
                  </div>
                </div>
              </div>
            </TabPanel>
            )}

            {tab === "life" && (
            <div className="flex flex-col gap-[var(--space-5)]">
            <TabPanel id="life-title" title="Life there">
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
            </TabPanel>

            <TabPanel id="after-title" title="After college">
              <h3 className={MEDIUM} style={{ ...DISPLAY, color: SOFT }}>Pay and debt</h3>
              <p className="mt-[2px] text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Everyone who went here, in every subject.</p>
              <div className="mt-[var(--space-2)]">
                <Row label="Typical pay six years after starting" note="finished or not" value={d.pay6 ? `${money(d.pay6)} a year` : "Not published"} />
                <Row label="Owed when they finish" note={d.monthly ? `federal loans, about ${money(d.monthly)} a month` : "federal loans"} value={d.debt ? money(d.debt) : "Not published"} />
                <Row label="Borrowers paying their loans back" value={c.repay !== null ? `${c.repay}%` : "Not published"} last={x?.fallBehind === null || x?.fallBehind === undefined} />
                {x?.fallBehind !== null && x?.fallBehind !== undefined && <Row label="Borrowers who fall behind" value={`${x.fallBehind}%`} last />}
              </div>
            </TabPanel>
            </div>
            )}
          </>
        )}

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
