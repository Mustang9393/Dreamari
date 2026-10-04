"use client";

// Home's "Your Next Moves" tiles: the plan, the next scholarship and the
// resume, each showing the thing itself, not a sentence about it. They
// began as Home v2's "Your week" row (1 Oct 2026; Chandu: "everything in
// Home should be expertly designed, not normal flat cards with text on
// them"). v2 was retired on 4 Oct 2026 (Chandu: "get rid of v2 dashboard,
// but bring the carousel into v1"), so its Top 3, Saved and "Next for your
// number one" tiles are gone and these three are what is left.

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronRight, Rocket } from "lucide-react";
import { HoverBeam } from "./HoverBeam";
import { SparkBar } from "@/components/flow/SparkBar";
import { SeasonScene } from "@/components/profile/SeasonScene";
import { ALL_PROFILE_CAREERS, DEMO_TOP3, type ProfileCareer } from "@/components/profile/data";
import { collegePlan, currentPlanWindowId, gradePlan } from "@/components/profile/gradePlanData";
import { STUDENT } from "@/components/profile/data";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { useStage } from "@/lib/stage";
import { opportunityStore } from "@/lib/opportunities";
import { SCHOLARSHIP_ITEMS } from "@/components/opportunities/data";
import { fitFor, timing, today, useStudent, worldToField } from "@/components/opportunities/match";
import { isFullRide } from "@/components/opportunities/Card";
import { orgLogoBackground, useOrgLogo } from "@/components/opportunities/OrgMark";
import { resumeSnapshot, serverResumeSnapshot, subscribeResume } from "@/lib/resume";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;

function careerById(id: string): ProfileCareer | null {
  return ALL_PROFILE_CAREERS.find((c) => c.id === id) ?? null;
}

/** The same Top 3 the Profile shows: the stored picks when they are valid,
 *  else the demo default, so Home and Profile never disagree. */
function useTop3Careers(): ProfileCareer[] {
  const stored = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  return useMemo(() => {
    const valid = stored.ids.filter((id) => careerById(id));
    return (valid.length ? valid : DEMO_TOP3).map(careerById).filter((c): c is ProfileCareer => !!c).slice(0, 3);
  }, [stored]);
}

const INK = "#0e0c20";
/** The card surface every other page uses for a card (Opportunities' Card,
 *  the Profile's GLASS, Home v1's Next Moves): glass-surface-2 with the
 *  24px blur, not the thinner surface-1 (Chandu, 1 Oct 2026: "too
 *  transparent, sacrifices legibility; refer to the cards in My Profile"). */
const CARD = { background: "var(--glass-surface-2)", backdropFilter: "blur(24px) saturate(1.65)", WebkitBackdropFilter: "blur(24px) saturate(1.65)", borderColor: "var(--glass-border)" } as const;
/** The Next Moves cards: the app's own card fill (glass surface and hairline,
 *  as Opportunities and Explore Schools use), with the contrast carried by
 *  what is inside, not by the card (Chandu, 1 Oct 2026: "not brighter
 *  colours, the contents more contrasty so they are more prominent; the
 *  cards borrow the fill logic from the other pages"). One composition for
 *  each: eyebrow, art that fills the card edge to edge, then the
 *  headline and one line. */
/** Copy rule for every card (Chandu, 1 Oct 2026: "titles should be
 *  actionable, not vague terms... mention a school and more... title >
 *  subtitle > body is the default hierarchy"): the title is the action or
 *  the concrete fact, the subtitle names the thing and how many more, and
 *  nothing smaller sits above the title. */
function WeekTile({ href, art, title, line, children }: { href: string; art: React.ReactNode; title: React.ReactNode; line?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <HoverBeam strength={0.7} className="min-w-0">
      <Link href={href} className="dm-tap group relative flex h-[204px] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={CARD}>
        <ChevronRight aria-hidden className="absolute top-[12px] right-[12px] z-[2] h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-[2px] group-hover:opacity-100" style={{ color: "var(--muted-foreground)" }} />
        <span className="relative mt-[12px] min-h-0 flex-1 px-[12px]">{art}</span>
        <span className="flex flex-col gap-[2px] px-[16px] pt-[10px] pb-[14px]">
          <span className="text-[16px] leading-[20px] font-extrabold" style={{ ...DISPLAY, color: "var(--foreground)" }}>{title}</span>
          {line && <span className="truncate text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{line}</span>}
          {children}
        </span>
      </Link>
    </HoverBeam>
  );
}

/** `bar={false}` (Home v1's Your Next Moves, 4 Oct 2026): the scene, the
 *  title and the step only (Chandu: "not too many things in each card, not
 *  too many competing elements"). */
export function PlanTile({ bar = true }: { bar?: boolean }) {
  const stage = useStage();
  const grade = (Number(STUDENT.grade.replace("Grade ", "")) || 9) as 9 | 10 | 11 | 12;
  const picks = useTop3Careers();
  const plan = stage === "hs" ? gradePlan(grade) : collegePlan(1, picks[0] ? { id: picks[0].id, title: picks[0].title } : null);
  const id = currentPlanWindowId();
  const win = plan.windows.find((w) => w.id === id) ?? plan.windows[0];
  const first = win.steps[0];
  // The scene fills the card and comes alive on hover (season-scene.css:
  // dm-season-host > .dm-season-scene), as the Profile's plan header does
  // (Chandu, 1 Oct 2026: "like it was before, filling the card and
  // animating when hovered").
  return (
    <HoverBeam strength={0.7} className="min-w-0">
      <Link href="/profile?tab=plan" className="dm-tap dm-season-host group relative flex h-[204px] w-full flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border p-[16px]" style={CARD}>
        <SeasonScene seasonId={win.id} className="absolute inset-0" />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--background) 86%, transparent) 0%, color-mix(in srgb, var(--background) 40%, transparent) 45%, transparent 100%)" }} />
        <ChevronRight aria-hidden className="absolute top-[12px] right-[12px] z-[2] h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-[2px] group-hover:opacity-100" style={{ color: "var(--muted-foreground)" }} />
        <span className="relative z-[2] flex flex-col gap-[4px]">
          {/* Title says what this is, the caption is the step itself (Chandu,
             1 Oct 2026: "the title should be 'Next in your plan' and the
             caption 'Complete 3 Glossary Games'. Remove the 3 steps thing"). */}
          <span className="text-[16px] leading-[20px] font-extrabold" style={{ ...DISPLAY, color: "var(--foreground)" }}>Next in your plan</span>
          <span className="line-clamp-2 text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{first ? first.title : win.title}</span>
          {bar && <SparkBar percent={Math.max(8, Math.round((1 / Math.max(1, win.steps.length)) * 100))} min={8} height={4} track="color-mix(in srgb, var(--foreground) 12%, transparent)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" idle />}
        </span>
      </Link>
    </HoverBeam>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The scholarship to apply for next (Home's Your Next Moves, 4 Oct 2026). Scholarships only, matched to the
 *  student (Chandu, 4 Oct 2026: "show something relevant to the careers
 *  that will be picked, usually business and money; we want to show a
 *  scholarship, not an arts competition"): one they saved first, then one
 *  in a Top 3 field, then one open to any field; among those, the best fit
 *  by the Opportunities tab's own check (grade, state, GPA), then the
 *  biggest award, then the soonest date. The picture is the provider's
 *  official logo ("can we not get the official logo for what's being
 *  shown"), else the Opportunities tab's icon; the date lives in the title.
 *  Tried and cut the same day: a calendar leaf in a panel, a bare date, a
 *  field photo ("don't use images for the cards in home"). */
export function DeadlineTile() {
  const record = opportunityStore.useValue();
  const student = useStudent();
  const top3 = useTop3Careers();
  const [todayIso] = useState(() => today());
  const fields = useMemo(() => new Set(top3.map((c) => worldToField(c.world)).filter(Boolean)), [top3]);
  const next = useMemo(() => {
    const rows = SCHOLARSHIP_ITEMS.map((item) => ({ item, t: timing(item, todayIso), fit: fitFor(item, student) }))
      // Open now: not one whose application opens later ("Apply by May 1"
      // on a form that opens Feb 1 would send a student to a closed page).
      .filter((x) => x.fit.when === "now" && x.t.status === "open" && x.t.iso && x.t.days !== null && x.t.days >= 0 && !x.t.approx && !(x.item.opens && /^\d{4}-\d{2}/.test(x.item.opens) && x.item.opens.slice(0, 10) > todayIso));
    const rank = (x: (typeof rows)[number]) => (record.status[x.item.id] ? 3 : x.item.fields.some((f) => fields.has(f)) ? 2 : x.item.fields.includes("Any") ? 1 : 0);
    const amount = (x: (typeof rows)[number]) => (x.item.type === "scholarship" && isFullRide(x.item.amount) ? 1e9 : x.item.type === "scholarship" ? x.item.amountMax ?? 0 : 0);
    return rows.sort((a, b) => rank(b) - rank(a) || b.fit.score - a.fit.score || amount(b) - amount(a) || (a.t.days ?? 0) - (b.t.days ?? 0))[0] ?? null;
  }, [record, student, fields, todayIso]);
  const logo = useOrgLogo(next?.item.url ?? "");
  const d = next ? new Date(next.t.iso! + "T12:00:00") : null;
  return (
    <WeekTile href={next ? `/opportunities/${next.item.id}` : "/opportunities?tab=scholarships"}
      art={
        <span className="flex h-full items-center justify-center">
          {next && logo
            // eslint-disable-next-line @next/next/no-img-element -- DEMO-ONLY remote logo, see OrgMark.tsx
            ? <span className="flex h-[76px] max-w-[160px] min-w-[76px] items-center justify-center overflow-hidden rounded-[16px] px-[14px]" style={{ background: orgLogoBackground(next.item.url), boxShadow: "0 10px 24px -12px rgba(0,0,0,0.7)" }}><img src={logo} alt="" className="max-h-[52px] max-w-full object-contain" /></span>
            : <Rocket className="h-[64px] w-[64px] transition-transform duration-300 ease-out group-hover:-translate-y-[4px] group-hover:translate-x-[3px]" strokeWidth={1.4} aria-hidden style={{ color: "var(--accent-subtle)", opacity: logo === undefined && next ? 0 : 1 }} />}
        </span>
      }
      title={!next || !d ? "Find scholarships" : next.t.days === 0 ? "Apply today" : `Apply by ${MONTHS[d.getMonth()]} ${d.getDate()}`}
      line={<span className="line-clamp-1">{next ? next.item.name : "Money for college that fits you"}</span>} />
  );
}

/** The resume as a page (4 Oct 2026, Chandu: "better designs for... the
 *  resume builder", then "not too many things in each card"). A plain sheet
 *  with the student's name, whose lines darken as the four sections fill;
 *  the title says how many are done and the line says what is next. Read
 *  from the real Resume Builder store. */
export function ResumeTile() {
  const resume = useSyncExternalStore(subscribeResume, resumeSnapshot, serverResumeSnapshot);
  const filled = [
    resume.education.length > 0,
    resume.experience.length > 0,
    resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0,
    resume.certifications.length > 0,
  ];
  const labels = ["education", "experience", "skills", "awards"];
  const done = filled.filter(Boolean).length;
  const nextUp = labels[filled.indexOf(false)];
  const name = [resume.profile.firstName, resume.profile.lastName].filter(Boolean).join(" ") || STUDENT.name;
  return (
    <WeekTile href="/profile?tab=resume"
      art={
        // No panel behind the sheet: a frame inside the card's frame was one
        // layer too many (Chandu, 4 Oct 2026, on the deadline card's).
        <span className="flex h-full items-end justify-center overflow-hidden">
          {/* The sheet rises a little on hover, like pulling it out to read. */}
          <span className="flex h-[88%] w-[min(180px,70%)] translate-y-[8px] flex-col gap-[8px] rounded-t-[8px] px-[14px] pt-[12px] transition-transform duration-300 ease-out group-hover:translate-y-[2px]" style={{ background: "#f4f3fa", boxShadow: "0 -6px 24px -8px rgba(0,0,0,0.6)" }}>
            <span className="truncate text-[11.5px] leading-[14px] font-extrabold" style={{ ...DISPLAY, color: INK }}>{name}</span>
            {filled.map((on, i) => <span key={i} aria-hidden className="block h-[5px] rounded-full" style={{ width: ["88%", "72%", "80%", "56%"][i], background: on ? "rgba(14,12,32,0.34)" : "rgba(14,12,32,0.1)" }} />)}
          </span>
        </span>
      }
      title={done === 0 ? "Start your resume" : done === filled.length ? "Your resume is ready" : `${done} of ${filled.length} parts done`}
      line={nextUp ? `Next: add your ${nextUp}` : "Tailor it for an internship"} />
  );
}
