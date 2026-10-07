"use client";

// The counselor's career and school sheets (8 Oct 2026). Chandu: "the career
// details open into the student app from counselor, that's bad... open in
// MODALS like we did for the top 3 cards and show a more counselor oriented
// set of details". So a card opens the Top 3 Career Peek's sheet (same
// .cpk-* frame, photo on the left, prev/next through the row it came from),
// with what a counselor asks first: is it in demand here, which of my
// students care, how do you get in, and what to say about it. The footer
// acts for the counselor (share, shortlist), never for a student.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import type { CatalogCareer } from "@/components/app/catalog";
import { IconTip } from "@/components/app/IconTip";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { Segmented } from "@/components/connect/viz";
import { careerProfile } from "@/components/career/profiles";
import { careerSlug } from "@/components/career/slug";
import { STATE_WAGES } from "@/components/career/stateWages";
import type { College } from "@/components/colleges/data";
import { CollegePicture } from "@/components/colleges/shared";
import { cv } from "@/lib/counselorBase";
import { createLocalRecord } from "@/lib/localRecord";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { HOME_STATE, careerSignal, growthText, money, price, schoolStudents, useSavers } from "./exploreData";
import { notify } from "./LogSheet";

const EASE = [0.22, 1, 0.36, 1] as const;
const shortlist = createLocalRecord<string[]>("dreamari:counselor-explore-shortlist", []);
const DOT: Record<CounselorStudent["status"], string> = {
  "On Track": "var(--color-feedback-success-solid)",
  "Needs Attention": "var(--color-feedback-warning-solid)",
  "At Risk": "var(--color-feedback-danger-solid)",
};

type Fact = { label: string; value: string };
type Tab<K extends string> = { key: K; label: string };

/** The Career Peek frame, shared by both sheets. */
function Sheet<K extends string>({ id, accent, art, chip, title, titleStyle, lede, facts, tabs, tab, onTab, body, footer, count, index, onIndex, onClose }: {
  id: string; accent: string; art: React.ReactNode; chip: string; title: string; titleStyle?: React.CSSProperties; lede?: string;
  facts: Fact[]; tabs: Tab<K>[]; tab: K; onTab: (k: K) => void; body: React.ReactNode; footer: React.ReactNode;
  count: number; index: number; onIndex: (i: number) => void; onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState<1 | -1>(1);
  const go = useCallback((d: 1 | -1) => {
    const next = index + d;
    if (next < 0 || next >= count) return;
    setDir(d);
    onIndex(next);
  }, [index, count, onIndex]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [go, onClose]);

  return createPortal(
    <motion.div
      initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="marketing-v2 themeable fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      style={{ background: "color-mix(in srgb, var(--background) 72%, transparent)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
      onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="explore-sheet-title"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="cpk-sheet" style={{ ["--cpk-world" as string]: accent, fontFamily: "var(--font-body)" }}
      >
        <div className="cpk-art">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={id} initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0">{art}</motion.div>
          </AnimatePresence>
        </div>

        <div className="cpk-controls">
          {count > 1 && (
            <>
              <IconTip label="Previous"><button type="button" aria-label="Previous" disabled={index === 0} onClick={() => go(-1)} className="cpk-ctl"><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
              <IconTip label="Next"><button type="button" aria-label="Next" disabled={index === count - 1} onClick={() => go(1)} className="cpk-ctl"><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
            </>
          )}
          <IconTip label="Close"><button type="button" aria-label="Close" onClick={onClose} className="cpk-ctl"><X className="h-4 w-4" aria-hidden /></button></IconTip>
        </div>

        <div className="cpk-content">
          <AnimatePresence initial={false} mode="wait" custom={dir}>
            <motion.div key={id} custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -16, transition: { duration: 0.14 } }}
              transition={{ duration: 0.3, ease: EASE }} className="flex min-h-0 flex-1 flex-col">
              <span className="cpk-world max-w-[calc(100%-132px)]"><span aria-hidden className="cpk-world-dot" /><span className="truncate">{chip}</span></span>
              <h2 id="explore-sheet-title" className="cpk-title" style={{ color: "var(--foreground)", ...titleStyle }}>{title}</h2>
              <span aria-hidden className="mt-[12px] block h-[4px] w-[48px] rounded-full" style={{ background: accent }} />
              {lede && <p className="cpk-lede">{lede}</p>}
              {facts.length > 0 && (
                <div className="cpk-facts" style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))`, gap: 0, border: `1px solid color-mix(in srgb, ${accent} 30%, var(--glass-border))`, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${accent} 9%, var(--glass-surface-1))`, overflow: "hidden" }}>
                  {facts.map((f, i) => (
                    <div key={f.label} className="cpk-fact" style={{ border: 0, borderRadius: 0, background: "transparent", borderLeft: i > 0 ? "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)" : undefined }}>
                      <span className="cpk-fact-label">{f.label}</span>
                      <span className="cpk-fact-value" title={f.value}>{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="cpk-tabs"><Segmented<K> ariaLabel="Details" value={tab} onChange={onTab} options={tabs} grow /></div>
              <div className="relative min-h-0 flex-1">
                <div className="cpk-scroll" style={{ position: "absolute", inset: 0 }}>
                  <div key={tab} className="cpk-stack dm-rise">{body}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="cpk-footer">{footer}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="cpk-list">
      {items.filter((it) => it.trim()).map((it) => <li key={it} className="cpk-item"><span aria-hidden className="cpk-item-dot" />{it}</li>)}
    </ul>
  );
}

/** A label, a figure, one hairline under: the sheet's only table shape. */
function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <li className="flex items-baseline justify-between gap-[var(--space-3)] border-b py-[9px] text-[14.5px] last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
      <span className={strong ? "font-bold" : "font-medium"}>{label}</span>
      <span className="font-bold tabular-nums" style={{ color: strong ? "var(--cpk-world)" : undefined }}>{value}</span>
    </li>
  );
}

function StudentList({ list, empty }: { list: CounselorStudent[]; empty: string }) {
  if (!list.length) return empty ? <p className="cpk-body" style={{ color: "var(--muted-foreground)" }}>{empty}</p> : null;
  return (
    <ul className="flex flex-col">
      {list.map((s) => (
        <li key={s.id} className="border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
          <Link href={`${cv("students")}&studentId=${encodeURIComponent(s.id)}`} className="dm-quiet -mx-[8px] flex items-center gap-[10px] rounded-[var(--radius-md)] px-[8px] py-[9px] text-[14.5px]">
            <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: DOT[s.status] }} />
            <span className="min-w-0 flex-1 truncate font-semibold">{s.name}</span>
            <span className="flex-none font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.status}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Footer({ id, onShare }: { id: string; onShare: () => void }) {
  const list = shortlist.useValue();
  const on = list.includes(id);
  return (
    <>
      <button type="button" onClick={onShare} className="cpk-cta dm-solid"><Send className="h-4 w-4" aria-hidden /> Share with Students</button>
      <button type="button" aria-pressed={on} onClick={() => shortlist.update((l) => (on ? l.filter((x) => x !== id) : [...l, id]))} className="cpk-quiet dm-tap">
        {on ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}{on ? "Shortlisted" : "Shortlist"}
      </button>
    </>
  );
}

// ---- careers ----------------------------------------------------------------

type CareerTab = "students" | "path" | "pay" | "talk";

function CareerSheet({ list, index, onIndex, onClose, state, saves }: { list: CatalogCareer[]; index: number; onIndex: (i: number) => void; onClose: () => void; state: string; saves?: Record<string, number> }) {
  const career = list[index];
  const savers = useSavers();
  const [tab, setTab] = useState<CareerTab>("students");
  const slug = careerSlug(career.title);
  const p = careerProfile(slug);
  const sig = careerSignal(career.title, state);
  const saved = savers.get(career.title.toLowerCase()) ?? [];
  const savedCount = saves?.[career.title] ?? saved.length;
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const degree = p?.facts.find((f) => /degree|education/i.test(f.label))?.value;
  const typicalPay = p?.facts.find((f) => /pay/i.test(f.label))?.value;
  const wages = STATE_WAGES[slug] ?? {};
  const best = Object.entries(wages).filter(([st]) => st !== state).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const facts: Fact[] = sig
    ? [{ label: `Pay in ${state}`, value: money(sig.pay) }, { label: "Growth", value: growthText(sig.growth) }, { label: "Jobs a year", value: sig.openings.toLocaleString() }]
    : [...(typicalPay ? [{ label: "Typical pay", value: typicalPay }] : []), ...(degree ? [{ label: "Education", value: degree }] : [])];
  const tabs: Tab<CareerTab>[] = [
    { key: "students", label: "Students" },
    { key: "path", label: "Path In" },
    ...(Object.keys(wages).length ? [{ key: "pay" as const, label: "Pay" }] : []),
    { key: "talk", label: "Talk" },
  ];
  const active = tabs.some((t) => t.key === tab) ? tab : "students";
  return (
    <Sheet<CareerTab>
      id={career.title} accent={accent} chip={career.world} title={career.title} titleStyle={posterTitleFont(career.world)}
      art={<Image src={career.photo} alt="" fill sizes="420px" className="object-cover" priority />}
      lede={p?.summary} facts={facts} tabs={tabs} tab={active} onTab={setTab}
      count={list.length} index={index} onIndex={(i) => { setTab("students"); onIndex(i); }} onClose={onClose}
      footer={<Footer id={`career:${slug}`} onShare={() => notify(savedCount ? `${career.title} sent to the ${savedCount} students who saved it` : `${career.title} shared with your students`)} />}
      body={
        <>
          {active === "students" && (
            <section className="cpk-section">
              <h3 className="cpk-section-title">{savedCount ? `${savedCount} of your students saved it` : "Your students"}</h3>
              <StudentList list={saved} empty={savedCount ? "" : "None of your students have saved it yet. Share it with the ones exploring this world."} />
            </section>
          )}
          {active === "path" && (
            <>
              {degree && <section className="cpk-section"><h3 className="cpk-section-title">Usual education</h3><p className="cpk-body">{degree}</p></section>}
              {p && p.education.studies.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">What people study</h3><List items={p.education.studies.map((s) => s.name)} /></section>}
              {p && p.education.where.length > 0 && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Where to study it</h3>
                  <ul className="flex flex-col">{p.education.where.map((w) => <Line key={w.credential} label={w.credential} value={/^[\d,]+$/.test(w.count) ? `${w.count} colleges` : w.count} />)}</ul>
                </section>
              )}
              {!degree && !p?.education.studies.length && <p className="cpk-body" style={{ color: "var(--muted-foreground)" }}>The education path for {career.title} is not written yet.</p>}
            </>
          )}
          {active === "pay" && (
            <section className="cpk-section">
              <h3 className="cpk-section-title">Pay by state</h3>
              <ul className="flex flex-col">
                {wages[state] && <Line label={`${state} (yours)`} value={money(wages[state])} strong />}
                {best.map(([st, pay]) => <Line key={st} label={st} value={money(pay)} />)}
              </ul>
              <p className="cpk-note">Average yearly pay, BLS. The five best paying states after yours.</p>
            </section>
          )}
          {active === "talk" && (
            <>
              {p?.scenario && <section className="cpk-section"><h3 className="cpk-section-title">Say it simply</h3><p className="cpk-body">{p.scenario}</p></section>}
              {p && p.knowAbout.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">A fit if they like</h3><List items={p.knowAbout.slice(0, 5)} /></section>}
              {p && p.goodAt.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">What it takes</h3><List items={p.goodAt.slice(0, 5)} /></section>}
              {!p && <p className="cpk-body" style={{ color: "var(--muted-foreground)" }}>Talking points for {career.title} are not written yet.</p>}
            </>
          )}
        </>
      }
    />
  );
}

// ---- schools ----------------------------------------------------------------

type SchoolTab = "students" | "cost" | "in" | "results";
const pct = (n: number | null | undefined) => (n === null || n === undefined ? "Not published" : `${n}%`);
// a negative band (grants beyond the cost) reads as paying nothing
const usd = (n: number | null | undefined) => (n === null || n === undefined ? "Not published" : `$${Math.max(0, n).toLocaleString()}`);
const KIND: Record<College["level"], string> = { "Certificates": "Trade school", "Associate degrees": "2-year college", "Bachelor's degrees": "4-year college" };

function SchoolSheet({ list, index, onIndex, onClose }: { list: College[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const c = list[index];
  const roster = useReviewedRoster();
  const students = useMemo(() => schoolStudents(c, roster), [c, roster]);
  const [tab, setTab] = useState<SchoolTab>("students");
  const d = c.detail;
  const facts: Fact[] = [
    { label: "Net price", value: c.netPrice === null ? "None listed" : `${price(c.netPrice)}/yr` },
    { label: "Finish", value: pct(c.finish) },
    { label: "Get in", value: c.admitRate === null ? "Open" : `${c.admitRate}%` },
  ];
  const tabs: Tab<SchoolTab>[] = [
    { key: "students", label: "Students" },
    { key: "cost", label: "Cost" },
    { key: "in", label: "Getting In" },
    { key: "results", label: "Results" },
  ];
  return (
    <Sheet<SchoolTab>
      id={c.slug} accent="var(--primary)" chip={`${KIND[c.level]} · ${c.city}, ${c.state}`} title={c.name} titleStyle={{ fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "none" }}
      art={<CollegePicture c={c} sizes="420px" className="h-full w-full" />}
      lede={`${c.control}, ${c.undergrads.toLocaleString()} students, ${c.setting.toLowerCase()} campus.`}
      facts={facts} tabs={tabs} tab={tab} onTab={setTab}
      count={list.length} index={index} onIndex={(i) => { setTab("students"); onIndex(i); }} onClose={onClose}
      footer={<Footer id={`school:${c.slug}`} onShare={() => notify(students.length ? `${c.name} sent to the ${students.length} students looking at it` : `${c.name} shared with your students`)} />}
      body={
        <>
          {tab === "students" && (
            <section className="cpk-section">
              <h3 className="cpk-section-title">{students.length ? `${students.length} of your students are looking at it` : "Your students"}</h3>
              <StudentList list={students} empty="None of your students have saved it yet." />
            </section>
          )}
          {tab === "cost" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">What families pay</h3>
                <ul className="flex flex-col">
                  <Line label="Average, after grants" value={c.netPrice === null ? "Not published" : `${usd(c.netPrice)} a year`} strong />
                  {d?.bands.map((b) => <Line key={b.label} label={b.label} value={`${usd(b.pay)} a year`} />)}
                </ul>
              </section>
              {d && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Sticker price</h3>
                  <ul className="flex flex-col">
                    <Line label="Tuition, in state" value={usd(d.tuitionInState)} />
                    {d.tuitionOutState !== d.tuitionInState && <Line label="Tuition, out of state" value={usd(d.tuitionOutState)} />}
                    {d.housingCost ? <Line label="Housing" value={usd(d.housingCost)} /> : null}
                    {d.pell ? <Line label="Students with a Pell Grant" value={`${d.pell}%`} /> : null}
                  </ul>
                </section>
              )}
            </>
          )}
          {tab === "in" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">{c.admitRate === null ? "Open admission" : `${c.admitRate} of 100 get in`}</h3>
                <p className="cpk-body">{c.admission === "open" ? "Anyone with a diploma or GED can enroll." : c.admission === "grades" ? "Grades do most of the work." : c.admission === "portfolio" ? "A portfolio or audition counts." : "They read grades, essays and more."}</p>
              </section>
              {d && d.require.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">They require</h3><List items={d.require} /></section>}
              {d && d.consider.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">They also look at</h3><List items={d.consider} /></section>}
              {d?.scores && <section className="cpk-section"><h3 className="cpk-section-title">Test scores</h3><ul className="flex flex-col"><Line label="SAT, middle half" value={d.scores.sat} />{d.scores.act && <Line label="ACT, middle half" value={d.scores.act} />}</ul></section>}
            </>
          )}
          {tab === "results" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">How students do</h3>
                <ul className="flex flex-col">
                  <Line label="Finish in six years" value={pct(c.finish)} strong />
                  <Line label="Come back for year two" value={pct(c.retention)} />
                  <Line label="Paying back their loans" value={pct(c.repay)} />
                  <Line label="Graduates a year" value={c.gradsPerYear.toLocaleString()} />
                </ul>
              </section>
              {d && d.programmes.length > 0 && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Biggest programs</h3>
                  <ul className="flex flex-col">{[...d.programmes].sort((a, b) => b.grads - a.grads).slice(0, 5).map((p) => <Line key={p.name} label={p.name} value={p.pay} />)}</ul>
                  <p className="cpk-note">Typical pay a few years after graduating.</p>
                </section>
              )}
            </>
          )}
        </>
      }
    />
  );
}

// ---- the open/close store: any screen opens a sheet, one host renders it -----

type Open = { kind: "career"; list: CatalogCareer[]; index: number; saves?: Record<string, number> } | { kind: "school"; list: College[]; index: number };
let current: Open | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const setOpen = (next: Open | null) => { current = next; emit(); };

/** Opens the career sheet; prev/next walks the row it came from. */
export function openCareer(c: CatalogCareer, row?: CatalogCareer[], opts?: { /** a screen's own saved counts, by title, so the sheet matches its chips */ saves?: Record<string, number> }): void {
  const list = row && row.some((x) => x.title === c.title) ? row : [c];
  setOpen({ kind: "career", list, index: list.findIndex((x) => x.title === c.title), saves: opts?.saves });
}

export function openSchool(c: College, row?: College[]): void {
  const list = row && row.some((x) => x.slug === c.slug) ? row : [c];
  setOpen({ kind: "school", list, index: list.findIndex((x) => x.slug === c.slug) });
}

/** One per app shell (v4, v5, v6), beside LogSheetHost. */
export function ExploreSheetHost({ state = HOME_STATE }: { state?: string }) {
  const s = useSyncExternalStore(subscribe, () => current, () => null);
  const onIndex = (index: number) => current && setOpen({ ...current, index } as Open);
  const onClose = () => setOpen(null);
  return (
    <AnimatePresence>
      {s?.kind === "career" && <CareerSheet key="career-sheet" list={s.list} index={s.index} saves={s.saves} state={state} onIndex={onIndex} onClose={onClose} />}
      {s?.kind === "school" && <SchoolSheet key="school-sheet" list={s.list} index={s.index} onIndex={onIndex} onClose={onClose} />}
    </AnimatePresence>
  );
}
