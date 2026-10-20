"use client";

// v7's career and school sheets: v5's counselor sheets (ExploreSheets.tsx)
// rebuilt in the Career Detail fact-sheet frame and decluttered (Chandu,
// 20 Oct 2026: "design all the pop ups with dreamari's design standards like
// we did for what it pays", then "declutter the pop ups. Eliminate all
// redundant and repeating information and all copy that is not valuable and
// intentional").
//
// Against v5's sheet:
// - One headline figure (pay here, net price for a school) in the sheet's
//   gradient numeral, with the other two facts on one line under it,
//   instead of a three-tile strip.
// - Students listed by name and grade. A dot and word only when a student is
//   behind; "On Track" no longer repeats on every row.
// - Career: three tabs, not four. Pay by state left (pay is the headline,
//   and Explore's Labor Market ranks it). Guide keeps the questions to ask
//   and what to do each year; "Say it simply" repeated the summary and
//   "What it takes" was the student app's own copy.
// - School: generic "how to help them apply" advice, the same for every
//   school, left; every footnote left.
// - No prev/next arrows and no second close; Share is the one lit action,
//   Shortlist a quiet icon.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, ChevronRight, Send } from "lucide-react";
import { TextTabs } from "@/components/app/TextTabs";
import { WORLD_COLORS } from "@/components/app/worlds";
import { careerProfile } from "@/components/career/profiles";
import { careerSlug } from "@/components/career/slug";
import type { College } from "@/components/colleges/data";
import { COLLEGES } from "@/components/colleges/data";
import { addShare } from "@/lib/counselorShares";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { careerSignal, growthText, money, price, schoolStudents, schoolsTeaching, stepsByGrade, useSavers } from "../v5/exploreData";
import { openSchool, toggleExploreShortlist, useShortlist, type CareerSheetProps, type SchoolSheetProps } from "../v5/ExploreSheets";
import { notify } from "../v5/LogSheet";
import { Modal, MUTED, OVERLINE, PrimaryButton, QuietButton, RULE, SHEET_ACCENT, SheetHero, STATUS_DOT, studentHref } from "./ui";

const PREVIEW = 6;

function Students({ list, title }: { list: CounselorStudent[]; title: string }) {
  const [all, setAll] = useState(false);
  if (!list.length) return null;
  const shown = all ? list : list.slice(0, PREVIEW);
  return (
    <section className="flex flex-col gap-[6px]">
      <h3 className={OVERLINE} style={MUTED}>{title}</h3>
      <ul className="flex flex-col">
        {shown.map((s) => (
          <li key={s.id} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
            <Link href={studentHref(s.id)} className="dm-quiet -mx-[8px] flex items-center gap-[10px] rounded-[var(--radius-md)] px-[8px] py-[9px] text-[14.5px]">
              <span className="min-w-0 flex-1 truncate font-semibold">{s.name}</span>
              {s.status !== "On Track" && <span className="flex flex-none items-center gap-[6px] text-[13px] font-semibold"><span aria-hidden className="size-[7px] rounded-full" style={{ background: STATUS_DOT[s.status] }} />{s.status}</span>}
              <span className="w-[64px] flex-none text-right text-[13.5px]" style={MUTED}>Grade {s.grade}</span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length > PREVIEW && !all && (
        <button type="button" onClick={() => setAll(true)} className="dm-link w-fit cursor-pointer pt-[4px] text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-brand-300))" }}>Show all {list.length}</button>
      )}
    </section>
  );
}

function Rows({ items }: { items: { label: string; value: string }[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((it) => (
        <li key={it.label} className="flex items-baseline justify-between gap-[var(--space-4)] border-b py-[9px] last:border-b-0" style={{ borderColor: RULE }}>
          <span className="text-[14.5px]" style={MUTED}>{it.label}</span>
          <span className="text-right text-[14.5px] font-semibold tabular-nums">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[6px]">
      <h3 className={OVERLINE} style={MUTED}>{title}</h3>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-[6px]">
      {items.map((t) => <li key={t} className="flex gap-[10px] text-[14.5px] leading-[21px]"><span aria-hidden className="mt-[8px] size-[5px] flex-none rounded-full" style={{ background: "var(--muted-foreground)" }} />{t}</li>)}
    </ul>
  );
}

function ShortlistButton({ id, name }: { id: string; name: string }) {
  const on = useShortlist().includes(id);
  return <QuietButton label={on ? `Remove ${name} from your shortlist` : `Shortlist ${name}`} onClick={() => toggleExploreShortlist(id)} icon={on ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />} />;
}

// ---- careers ----------------------------------------------------------------

type CareerTab = "students" | "path" | "guide";

export function V7CareerSheet({ list, index, saves, state, onClose }: CareerSheetProps) {
  const career = list[index];
  const savers = useSavers();
  const roster = useReviewedRoster();
  const [tab, setTab] = useState<CareerTab>("students");
  const slug = careerSlug(career.title);
  const p = careerProfile(slug);
  const sig = careerSignal(career.title, state);
  const saved = useMemo(() => savers.get(career.title.toLowerCase()) ?? [], [savers, career.title]);
  const mightFit = useMemo(() => {
    const ids = new Set(saved.map((s) => s.id));
    return roster.filter((s) => s.careerTrack === career.world && !ids.has(s.id)).slice(0, 5);
  }, [roster, career.world, saved]);
  const schools = useMemo(() => schoolsTeaching(p?.education.studies.map((x) => x.name) ?? [], COLLEGES).slice(0, 4), [p]);
  const accent = WORLD_COLORS[career.world] ?? SHEET_ACCENT;
  const degree = p?.facts.find((f) => /degree|education/i.test(f.label))?.value;
  const typicalPay = p?.facts.find((f) => /pay/i.test(f.label))?.value;
  const major = p?.education.studies[0]?.name;
  const savedCount = saves?.[career.title] ?? saved.length;
  const ask = (p?.knowAbout ?? []).slice(0, 3).map((k) => `Do you like ${k.charAt(0).toLowerCase()}${k.slice(1)}?`);
  const share = () => {
    const to = saved.length ? saved : mightFit;
    if (!to.length) { notify("No students to send it to yet"); return; }
    addShare({ kind: "career", title: career.title, ref: slug, studentIds: to.map((x) => x.id), studentNames: to.map((x) => x.name) });
    notify(`${career.title} sent to ${to.length} ${to.length === 1 ? "student" : "students"}`);
    onClose();
  };
  const shareCount = saved.length || mightFit.length;
  return (
    <Modal overline={career.world} title={career.title} accent={accent} onClose={onClose}
      footer={<><ShortlistButton id={`career:${slug}`} name={career.title} /><PrimaryButton onClick={share} icon={<Send className="h-4 w-4" aria-hidden />}>{shareCount ? `Share with ${shareCount}` : "Share"}</PrimaryButton></>}>
      {sig
        ? <SheetHero label={`Pay in ${state}`} value={money(sig.pay)} line={`${growthText(sig.growth)} growth · ${sig.openings.toLocaleString()} jobs a year`} accent={accent} />
        : typicalPay && <SheetHero label="Typical pay" value={typicalPay} line={degree} accent={accent} />}
      <TextTabs items={[{ key: "students", label: "Students" }, { key: "path", label: "Path in" }, { key: "guide", label: "Guide" }]} value={tab} onChange={setTab} ariaLabel="Career sections" layoutId="v7-career-sheet-tabs" soft caps={false} />
      {tab === "students" && (
        <>
          {savedCount ? <Students list={saved} title={`${savedCount} saved it`} /> : <p className="text-[14.5px]" style={MUTED}>None of your students saved it yet.</p>}
          <Students list={mightFit} title={`Exploring ${career.world}`} />
        </>
      )}
      {tab === "path" && (
        <>
          {(degree || major) && <Rows items={[...(degree ? [{ label: "Education", value: degree }] : []), ...(major ? [{ label: "Most study", value: p!.education.studies.slice(0, 2).map((x) => x.name).join(", ") }] : [])]} />}
          {schools.length > 0 && (
            <Section title="Schools that teach it">
              <ul className="flex flex-col">
                {schools.map(({ c, program }) => (
                  <li key={c.slug} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
                    <button type="button" onClick={() => openSchool(c, schools.map((x) => x.c))} className="dm-quiet -mx-[8px] flex w-[calc(100%+16px)] cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[8px] py-[9px] text-left">
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14.5px] font-semibold">{c.name}</span>
                        <span className="truncate text-[12.5px]" style={MUTED}>{program}</span>
                      </span>
                      {c.netPrice !== null && <span className="flex-none text-[13.5px] font-semibold tabular-nums">{price(c.netPrice)}/yr</span>}
                      <ChevronRight className="h-4 w-4 flex-none" style={MUTED} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {p && p.ladder.length > 0 && (
            <Section title="How people move up">
              <Rows items={p.ladder.map((r) => ({ label: r.jobTitle, value: r.pay }))} />
            </Section>
          )}
        </>
      )}
      {tab === "guide" && (
        <>
          {ask.length > 0 && <Section title="Ask them"><Bullets items={ask} /></Section>}
          {stepsByGrade(career.title, career.world, degree, major).map((g) => (
            <Section key={g.when} title={g.when}><Bullets items={g.steps} /></Section>
          ))}
        </>
      )}
    </Modal>
  );
}

// ---- schools ----------------------------------------------------------------

type SchoolTab = "students" | "cost" | "in" | "results";
const pct = (n: number | null | undefined) => (n === null || n === undefined ? "Not published" : `${n}%`);
const usd = (n: number | null | undefined) => (n === null || n === undefined ? "Not published" : `$${Math.max(0, n).toLocaleString()}`);
const KIND: Record<College["level"], string> = { "Certificates": "Trade school", "Associate degrees": "2-year college", "Bachelor's degrees": "4-year college" };

export function V7SchoolSheet({ list, index, onClose }: SchoolSheetProps) {
  const c = list[index];
  const roster = useReviewedRoster();
  const students = useMemo(() => schoolStudents(c, roster), [c, roster]);
  const [tab, setTab] = useState<SchoolTab>("students");
  const d = c.detail;
  const share = () => {
    const to = students.length ? students : roster.filter((x) => x.grade >= 11);
    addShare({ kind: "school", title: c.name, ref: c.slug, studentIds: to.map((x) => x.id), studentNames: to.map((x) => x.name) });
    notify(`${c.name} sent to ${to.length} ${to.length === 1 ? "student" : "students"}`);
    onClose();
  };
  const facts = [c.admitRate === null ? "Open admission" : `${c.admitRate} of 100 get in`, c.finish === null ? null : `${c.finish}% finish`].filter(Boolean).join(" · ");
  return (
    <Modal overline={`${KIND[c.level]} · ${c.city}, ${c.state}`} title={c.name} onClose={onClose}
      footer={<><ShortlistButton id={`school:${c.slug}`} name={c.name} /><PrimaryButton onClick={share} icon={<Send className="h-4 w-4" aria-hidden />}>{students.length ? `Share with ${students.length}` : "Share"}</PrimaryButton></>}>
      <SheetHero label="Net price" value={c.netPrice === null ? "Not listed" : price(c.netPrice)} suffix={c.netPrice === null ? undefined : "a year"} line={facts} accent={SHEET_ACCENT} />
      <TextTabs items={[{ key: "students", label: "Students" }, { key: "cost", label: "Cost" }, { key: "in", label: "Getting in" }, { key: "results", label: "Results" }]} value={tab} onChange={setTab} ariaLabel="School sections" layoutId="v7-school-sheet-tabs" soft caps={false} />
      {tab === "students" && (students.length ? <Students list={students} title={`${students.length} looking at it`} /> : <p className="text-[14.5px]" style={MUTED}>None of your students saved it yet.</p>)}
      {tab === "cost" && (
        <>
          {d && d.bands.length > 0 && <Section title="After grants, by family income"><Rows items={d.bands.map((b) => ({ label: b.label, value: usd(b.pay) }))} /></Section>}
          {d && (
            <Section title="Sticker price">
              <Rows items={[
                { label: "Tuition, in state", value: usd(d.tuitionInState) },
                ...(d.tuitionOutState !== d.tuitionInState ? [{ label: "Tuition, out of state", value: usd(d.tuitionOutState) }] : []),
                ...(d.housingCost ? [{ label: "Housing", value: usd(d.housingCost) }] : []),
                ...(d.pell ? [{ label: "On a Pell Grant", value: `${d.pell}%` }] : []),
              ]} />
            </Section>
          )}
        </>
      )}
      {tab === "in" && (
        <>
          {d && d.require.length > 0 && <Section title="They require"><Bullets items={d.require} /></Section>}
          {d && d.consider.length > 0 && <Section title="They also look at"><Bullets items={d.consider} /></Section>}
          {d?.scores && <Section title="Test scores, middle half"><Rows items={[{ label: "SAT", value: d.scores.sat }, ...(d.scores.act ? [{ label: "ACT", value: d.scores.act }] : [])]} /></Section>}
          {!d && <p className="text-[14.5px]" style={MUTED}>{c.admission === "open" ? "Anyone with a diploma or GED can enroll." : "No admission details published."}</p>}
        </>
      )}
      {tab === "results" && (
        <>
          <Rows items={[
            { label: "Come back for year two", value: pct(c.retention) },
            { label: "Paying back loans", value: pct(c.repay) },
            { label: "Graduates a year", value: c.gradsPerYear.toLocaleString() },
          ]} />
          {d && d.programmes.length > 0 && <Section title="Biggest programs, pay after"><Rows items={[...d.programmes].sort((a, b) => b.grads - a.grads).slice(0, 5).map((p) => ({ label: p.name, value: p.pay }))} /></Section>}
        </>
      )}
    </Modal>
  );
}
