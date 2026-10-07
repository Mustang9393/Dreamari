"use client";

// The counselor's career and school sheets (8 Oct 2026). Chandu: "the career
// details open into the student app from counselor, that's bad... open in
// MODALS like we did for the top 3 cards and show a more counselor oriented
// set of details". So a card opens the Top 3 Career Peek's sheet (same
// .cpk-* frame, photo on the left, prev/next through the row it came from),
// with what a counselor asks first: is it in demand here, which of my
// students care, how do you get in, and what to say about it. The footer
// acts for the counselor (share, shortlist), never for a student.

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCheck, ChevronRight, Send } from "lucide-react";
import type { CatalogCareer } from "@/components/app/catalog";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { careerProfile } from "@/components/career/profiles";
import { careerSlug } from "@/components/career/slug";
import { STATE_WAGES } from "@/components/career/stateWages";
import type { College } from "@/components/colleges/data";
import { CollegePicture } from "@/components/colleges/shared";
import { cv } from "@/lib/counselorBase";
import { createLocalRecord } from "@/lib/localRecord";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { HOME_STATE, careerSignal, growthText, money, price, schoolStudents, schoolsTeaching, stepsByGrade, useSavers } from "./exploreData";
import { COLLEGES } from "@/components/colleges/data";
import { notify } from "./LogSheet";
import { PeekLine as Line, PeekList as List, PeekSheet as Sheet, type PeekFact as Fact, type PeekTab as Tab } from "@/components/app/PeekSheet";

const shortlist = createLocalRecord<string[]>("dreamari:counselor-explore-shortlist", []);
const DOT: Record<CounselorStudent["status"], string> = {
  "On Track": "var(--color-feedback-success-solid)",
  "Needs Attention": "var(--color-feedback-warning-solid)",
  "At Risk": "var(--color-feedback-danger-solid)",
};

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

type CareerTab = "students" | "path" | "guide" | "pay";

function CareerSheet({ list, index, onIndex, onClose, state, saves }: { list: CatalogCareer[]; index: number; onIndex: (i: number) => void; onClose: () => void; state: string; saves?: Record<string, number> }) {
  const career = list[index];
  const savers = useSavers();
  const roster = useReviewedRoster();
  const [tab, setTab] = useState<CareerTab>("students");
  const slug = careerSlug(career.title);
  const p = careerProfile(slug);
  const sig = careerSignal(career.title, state);
  const saved = useMemo(() => savers.get(career.title.toLowerCase()) ?? [], [savers, career.title]);
  const savedCount = saves?.[career.title] ?? saved.length;
  // students exploring this career's world who have not saved it yet
  const mightFit = useMemo(() => {
    const ids = new Set(saved.map((s) => s.id));
    return roster.filter((s) => s.careerTrack === career.world && !ids.has(s.id)).slice(0, 5);
  }, [roster, career.world, saved]);
  const schools = useMemo(() => schoolsTeaching(p?.education.studies.map((x) => x.name) ?? [], COLLEGES).slice(0, 6), [p]);
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const degree = p?.facts.find((f) => /degree|education/i.test(f.label))?.value;
  const typicalPay = p?.facts.find((f) => /pay/i.test(f.label))?.value;
  const major = p?.education.studies[0]?.name;
  const wages = STATE_WAGES[slug] ?? {};
  const best = Object.entries(wages).filter(([st]) => st !== state).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const facts: Fact[] = sig
    ? [{ label: `Pay in ${state}`, value: money(sig.pay) }, { label: "Growth", value: growthText(sig.growth) }, { label: "Jobs a year", value: sig.openings.toLocaleString() }]
    : [...(typicalPay ? [{ label: "Typical pay", value: typicalPay }] : []), ...(degree ? [{ label: "Education", value: degree }] : [])];
  const tabs: Tab<CareerTab>[] = [
    { key: "students", label: "Students" },
    { key: "path", label: "Path In" },
    { key: "guide", label: "Guide" },
    ...(Object.keys(wages).length ? [{ key: "pay" as const, label: "Pay" }] : []),
  ];
  const active = tabs.some((t) => t.key === tab) ? tab : "students";
  const ask = (p?.knowAbout ?? []).slice(0, 3).map((k) => `Do you like ${k.charAt(0).toLowerCase()}${k.slice(1)}?`);
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
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">{savedCount ? `${savedCount} of your students saved it` : "Your students"}</h3>
                <StudentList list={saved} empty={savedCount ? "" : "None of your students have saved it yet."} />
              </section>
              {mightFit.length > 0 && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Might also fit</h3>
                  <p className="cpk-note">Exploring {career.world}, not saved yet.</p>
                  <StudentList list={mightFit} empty="" />
                </section>
              )}
            </>
          )}
          {active === "path" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">The usual route</h3>
                <ul className="flex flex-col">
                  {degree && <Line label="Education" value={degree} />}
                  {major && <Line label="Most study" value={p!.education.studies.slice(0, 2).map((x) => x.name).join(", ")} />}
                </ul>
              </section>
              {schools.length > 0 && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Schools that teach it</h3>
                  <ul className="flex flex-col">
                    {schools.map(({ c, program }) => (
                      <li key={c.slug} className="border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                        <button type="button" onClick={() => openSchool(c, schools.map((x) => x.c))} className="dm-quiet -mx-[8px] flex w-[calc(100%+16px)] cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[8px] py-[9px] text-left">
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[14.5px] font-semibold">{c.name}</span>
                            <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{program} · {c.city}, {c.state}</span>
                          </span>
                          <span className="flex-none text-[13.5px] font-bold tabular-nums">{c.netPrice === null ? "" : `${price(c.netPrice)}/yr`}</span>
                          <ChevronRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="cpk-note">Net price after grants. {HOME_STATE} schools first.</p>
                </section>
              )}
              {p && p.ladder.length > 0 && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">How people move up</h3>
                  <ol className="flex flex-col">
                    {p.ladder.map((r) => (
                      <li key={r.number} className="flex items-start gap-[12px] border-b py-[10px] last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                        <span className="flex size-[24px] flex-none items-center justify-center rounded-full text-[12px] font-bold" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: "var(--cpk-world)" }}>{r.number}</span>
                        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                          <span className="flex items-baseline justify-between gap-[10px] text-[14.5px] font-semibold"><span>{r.jobTitle}</span><span className="tabular-nums">{r.pay}</span></span>
                          {r.toGetHere.length > 0 && <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>{r.toGetHere.join(" · ")}</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
          {active === "guide" && (
            <>
              {p?.scenario && <section className="cpk-section"><h3 className="cpk-section-title">Say it simply</h3><p className="cpk-body">{p.scenario}</p></section>}
              {ask.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">Ask them</h3><List items={ask} /></section>}
              {p && p.goodAt.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">What it takes</h3><List items={p.goodAt.slice(0, 5)} /></section>}
              <section className="cpk-section">
                <h3 className="cpk-section-title">What to do each year</h3>
                {stepsByGrade(career.title, career.world, degree, major).map((g) => (
                  <div key={g.when} className="flex flex-col gap-[8px]">
                    <h4 className="cpk-sub">{g.when}</h4>
                    <List items={g.steps} />
                  </div>
                ))}
              </section>
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
              <section className="cpk-section">
                <h3 className="cpk-section-title">How to help them apply</h3>
                <List items={c.admission === "open"
                  ? ["Apply any time before the term starts.", "Prep for the math and English placement tests.", "File the FAFSA. Most students here pay little after grants."]
                  : [`Check the deadline and any early date${c.admission === "portfolio" ? ", and start the portfolio in grade 11" : ""}.`, "Ask two teachers for letters by October.", "File the FAFSA, then compare this offer with their others."]} />
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
