"use client";

// v7's career sheet (22 Oct 2026). Chandu: "The career detail popups in
// explore in counselor dashboard needs work. Refer how its done for careers
// in the student app (match/profile top 3 cards have the pop up style).
// Arrange information like that but keep the content from the existing
// counselor dashboard side. Try to include some of the useful stuff from
// v4's career details though."
//
// So: the Top 3 Career Peek's frame (PeekSheet refined: the poster photo
// down the left, the world colour as the one accent, the title in the
// world's poster face, the lede, the fact strip, the segmented tabs, the
// frosted scroll edges, prev / next through the row it came from), filled
// with v7's content (students who saved it and who might fit, the path in,
// the guide, Share with N and Shortlist) plus what v4's sheet had that v7
// had cut: Pay by state, "Say it simply" and "What it takes" in the guide,
// the ladder with how to get to each rung, schools with their city. Still
// decluttered the v7 way: "On Track" never repeats on a row, no footnotes
// that explain the obvious, one lit action.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, ChevronRight, Send } from "lucide-react";
import { FacePhoto } from "@/components/app/FacePhoto";
import { PeekLine, PeekList, PeekSheet } from "@/components/app/PeekSheet";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { careerProfile } from "@/components/career/profiles";
import { careerSlug } from "@/components/career/slug";
import { STATE_WAGES } from "@/components/career/stateWages";
import { COLLEGES } from "@/components/colleges/data";
import { addShare } from "@/lib/counselorShares";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { careerSignal, growthText, money, price, schoolsTeaching, stepsByGrade, useSavers } from "../v5/exploreData";
import { openSchool, toggleExploreShortlist, useShortlist, type CareerSheetProps } from "../v5/ExploreSheets";
import { notify } from "../v5/LogSheet";
import { moment, STATUS_DOT, studentHref } from "./ui";

type Tab = "students" | "path" | "guide" | "pay";
const PREVIEW = 6;

function Students({ list, empty }: { list: CounselorStudent[]; empty?: string }) {
  const [all, setAll] = useState(false);
  if (!list.length) return empty ? <p className="cpk-body" style={{ color: "var(--muted-foreground)" }}>{empty}</p> : null;
  const shown = all ? list : list.slice(0, PREVIEW);
  return (
    <>
      <ul className="flex flex-col">
        {shown.map((s) => (
          <li key={s.id} className="border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
            <Link href={studentHref(s.id)} className="dm-quiet -mx-[8px] flex items-center gap-[10px] rounded-[var(--radius-md)] px-[8px] py-[9px] text-[14px]">
              <span className="min-w-0 flex-1 truncate font-semibold">{s.name}</span>
              {s.status !== "On Track" && <span className="flex flex-none items-center gap-[6px] text-[13px] font-semibold"><span aria-hidden className="size-[7px] rounded-full" style={{ background: STATUS_DOT[s.status] }} />{s.status}</span>}
              <span className="w-[60px] flex-none text-right text-[13px]" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length > PREVIEW && !all && (
        <button type="button" onClick={() => setAll(true)} className="dm-link w-fit cursor-pointer text-[14px] font-semibold" style={{ color: "var(--cpk-world)" }}>Show all {list.length}</button>
      )}
    </>
  );
}

export function V7CareerSheet({ list, index, saves, state, onIndex, onClose }: CareerSheetProps) {
  const career = list[index];
  const savers = useSavers();
  const roster = useReviewedRoster();
  const shortlist = useShortlist();
  const [tab, setTab] = useState<Tab>("students");
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
  const schools = useMemo(() => schoolsTeaching(p?.education.studies.map((x) => x.name) ?? [], COLLEGES).slice(0, 5), [p]);
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const degree = p?.facts.find((f) => /degree|education/i.test(f.label))?.value;
  const typicalPay = p?.facts.find((f) => /pay/i.test(f.label))?.value;
  const major = p?.education.studies[0]?.name;
  const wages = STATE_WAGES[slug] ?? {};
  const best = Object.entries(wages).filter(([st]) => st !== state).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const facts = sig
    ? [{ label: `Pay in ${state}`, value: money(sig.pay) }, { label: "Growth", value: growthText(sig.growth) }, { label: "Jobs a year", value: sig.openings.toLocaleString() }]
    : [...(typicalPay ? [{ label: "Typical pay", value: typicalPay }] : []), ...(degree ? [{ label: "Education", value: degree }] : [])];
  const tabs: { key: Tab; label: string }[] = [
    { key: "students", label: "Students" },
    { key: "path", label: "Path in" },
    { key: "guide", label: "Guide" },
    ...(Object.keys(wages).length ? [{ key: "pay" as const, label: "Pay" }] : []),
  ];
  const active = tabs.some((t) => t.key === tab) ? tab : "students";
  const ask = (p?.knowAbout ?? []).slice(0, 3).map((k) => `Do you like ${k.charAt(0).toLowerCase()}${k.slice(1)}?`);
  const shortlisted = shortlist.includes(`career:${slug}`);
  const shareTo = saved.length ? saved : mightFit;
  const share = () => {
    if (!shareTo.length) { notify("No students to send it to yet"); return; }
    addShare({ kind: "career", title: career.title, ref: slug, studentIds: shareTo.map((x) => x.id), studentNames: shareTo.map((x) => x.name) });
    notify(`${career.title} sent to ${shareTo.length} ${shareTo.length === 1 ? "student" : "students"}`);
    moment(true);
    onClose();
  };

  return (
    <PeekSheet<Tab>
      id={career.title} accent={accent} chip={career.world} title={career.title} titleStyle={posterTitleFont(career.world)} refined
      art={<FacePhoto src={career.photo} sizes="(max-width: 1023px) 100vw, 420px" className="object-cover" priority />}
      lede={p?.summary} facts={facts} tabs={tabs} tab={active} onTab={setTab}
      count={list.length} index={index} onIndex={(i) => { setTab("students"); onIndex(i); }} onClose={onClose}
      footer={
        <>
          <button type="button" onClick={share} className="cpk-cta dm-solid"><Send className="h-4 w-4" aria-hidden />{shareTo.length ? `Share with ${shareTo.length}` : "Share"}</button>
          <button type="button" aria-pressed={shortlisted} onClick={() => toggleExploreShortlist(`career:${slug}`)} className="cpk-quiet dm-tap">
            {shortlisted ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}{shortlisted ? "Shortlisted" : "Shortlist"}
          </button>
        </>
      }
      body={
        <>
          {active === "students" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">{savedCount ? `Saved it · ${savedCount}` : "Saved it"}</h3>
                <Students list={saved} empty="None of your students saved it yet." />
              </section>
              {mightFit.length > 0 && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Exploring {career.world}</h3>
                  <Students list={mightFit} />
                </section>
              )}
            </>
          )}
          {active === "path" && (
            <>
              {(degree || major) && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">The usual route</h3>
                  <ul className="flex flex-col">
                    {degree && <PeekLine label="Education" value={degree} />}
                    {major && <PeekLine label="Most study" value={p!.education.studies.slice(0, 2).map((x) => x.name).join(", ")} />}
                  </ul>
                </section>
              )}
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
                          {c.netPrice !== null && <span className="flex-none text-[13.5px] font-bold tabular-nums">{price(c.netPrice)}/yr</span>}
                          <ChevronRight className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="cpk-note">Net price after grants.</p>
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
              {ask.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">Ask them</h3><PeekList items={ask} /></section>}
              {p && p.goodAt.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">What it takes</h3><PeekList items={p.goodAt.slice(0, 5)} /></section>}
              <section className="cpk-section">
                <h3 className="cpk-section-title">What to do each year</h3>
                {stepsByGrade(career.title, career.world, degree, major).map((g) => (
                  <div key={g.when} className="flex flex-col gap-[8px]">
                    <h4 className="cpk-sub">{g.when}</h4>
                    <PeekList items={g.steps} />
                  </div>
                ))}
              </section>
            </>
          )}
          {active === "pay" && (
            <section className="cpk-section">
              <h3 className="cpk-section-title">Pay by state</h3>
              <ul className="flex flex-col">
                {wages[state] && <PeekLine label={`${state} (yours)`} value={money(wages[state])} strong />}
                {best.map(([st, pay]) => <PeekLine key={st} label={st} value={money(pay)} />)}
              </ul>
              <p className="cpk-note">Average yearly pay, BLS. The five best paying states after yours.</p>
            </section>
          )}
        </>
      }
    />
  );
}
