"use client";

// Home v2's "Your week": the four Overview cards, rebuilt as composed tiles
// on Home (1 Oct 2026; Chandu: "everything in Home should be expertly
// designed, not normal flat cards with text on them. I especially hate the
// card in Home with Next Steps"). Each tile shows the thing itself, not a
// sentence about it: the Top 3 as three small covers with empty slots
// drawn, the plan as its season scene, Saved as a fanned stack of covers,
// the next deadline as a calendar leaf. Duolingo, Khan Academy and
// SchooLinks all open on "where you are and what is next"; this is that
// row for students, above the discovery content.

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronRight, Plus, Rocket } from "lucide-react";
import { HoverBeam } from "./HoverBeam";
import { SparkBar } from "@/components/flow/SparkBar";
import { SeasonScene } from "@/components/profile/SeasonScene";
import { ALL_PROFILE_CAREERS, DEMO_TOP3, type ProfileCareer } from "@/components/profile/data";
import { collegePlan, currentPlanWindowId, gradePlan } from "@/components/profile/gradePlanData";
import { STUDENT } from "@/components/profile/data";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { useSavedCareers } from "@/lib/savedCareers";
import { useSaved as useSavedSchools } from "@/components/colleges/shared";
import { useSavedVideos } from "@/lib/savedVideos";
import { useStage } from "@/lib/stage";
import { opportunityStore } from "@/lib/opportunities";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "@/components/opportunities/data";
import { fitFor, timing, today, useStudent, worldToField } from "@/components/opportunities/match";
import { isFullRide } from "@/components/opportunities/Card";
import { orgLogoBackground, useOrgLogo } from "@/components/opportunities/OrgMark";
import { resumeSnapshot, serverResumeSnapshot, subscribeResume } from "@/lib/resume";
import { PROS } from "@/components/connect/data";
import { ProAvatar } from "@/components/connect/primitives";
import { COLLEGES, collegeImage, collegeMark } from "@/components/colleges/data";
import { CARD_TEXT_SHADOW } from "./cardChrome";
import { WORLD_COLORS } from "./worlds";

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
const AMBER = "#f5b041";

/** One recipe for every Home card (Chandu, 1 Oct 2026: "the cards across
 *  all sections can have some sort of consistency... more editorial
 *  composition"): a photo or a saturated world-colour field, an eyebrow top
 *  left, art top right, the headline and one line bottom left in white, a
 *  chevron on hover. The Play rail's cards already follow this shape
 *  (photo, chip top left, title bottom left), so the three rows read as one
 *  family. */
function EditorialTile({ href, title, line, accent, photo, focus = "50% 30%", art, className = "", children }: {
  href: string; title: React.ReactNode; line?: React.ReactNode; accent: string;
  photo?: string | null; focus?: string; art?: React.ReactNode; className?: string; children?: React.ReactNode;
}) {
  return (
    <HoverBeam strength={0.75} className="min-w-0">
      <Link href={href} className={`dm-tap group relative flex w-full flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border p-[16px] ${className}`}
        style={{ borderColor: "rgba(255,255,255,0.12)", color: "#fff", textShadow: CARD_TEXT_SHADOW, background: photo ? INK : `linear-gradient(150deg, color-mix(in srgb, ${accent} 82%, ${INK}) 0%, color-mix(in srgb, ${accent} 42%, ${INK}) 58%, ${INK} 100%)` }}>
        {photo && (
          <>
            <Image src={photo} alt="" fill sizes="(max-width: 640px) 100vw, 420px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" style={{ objectPosition: focus }} />
            <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(8,10,24,0.94) 0%, rgba(8,10,24,0.55) 48%, rgba(8,10,24,0.12) 100%), radial-gradient(70% 90% at 0% 100%, color-mix(in srgb, ${accent} 55%, transparent) 0%, transparent 70%)` }} />
          </>
        )}
        {!photo && <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,10,24,0.55) 0%, transparent 55%)" }} />}
        <ChevronRight aria-hidden className="pointer-events-none absolute top-[12px] right-[12px] z-[2] h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-[2px] group-hover:opacity-100" style={{ color: "rgba(255,255,255,0.85)" }} />
        {art}
        <span className="relative z-[2] flex flex-col gap-[3px]">
          <span className="text-[17px] leading-[21px] font-extrabold text-balance" style={DISPLAY}>{title}</span>
          {line && <span className="text-[13px] leading-[17px] font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>{line}</span>}
          {children}
        </span>
      </Link>
    </HoverBeam>
  );
}

/** The Your week cards: the app's own card fill (glass surface and hairline,
 *  as Opportunities and Explore Schools use), with the contrast carried by
 *  what is inside, not by the card (Chandu, 1 Oct 2026: "not brighter
 *  colours, the contents more contrasty so they are more prominent; the
 *  cards borrow the fill logic from the other pages"). One composition for
 *  all four: eyebrow, art that fills the card edge to edge, then the
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

/** A square crop of a career photo, the unit the collages are built from. */
function Square({ career, className = "" }: { career: ProfileCareer; className?: string }) {
  return (
    <span className={`relative block h-full w-full overflow-hidden rounded-[8px] ${className}`} style={{ background: INK }}>
      <Image src={career.photo} alt="" fill sizes="120px" className="object-cover" style={{ objectPosition: career.photoFocus ?? "50% 25%" }} />
    </span>
  );
}
function EmptySquare({ icon, className = "" }: { icon: React.ReactNode; className?: string }) {
  return <span className={`flex items-center justify-center rounded-[8px] border-2 border-dashed ${className}`} style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)", color: "color-mix(in srgb, var(--foreground) 45%, transparent)" }}>{icon}</span>;
}

function Top3Tile({ v }: { v: string }) {
  const picks = useTop3Careers();
  const lead = picks[0];
  return (
    <WeekTile href={`/profile?tab=top3${v}`}
      art={
        <span className="grid h-full grid-cols-3 gap-[8px]">
          {[0, 1, 2].map((i) => picks[i]
            ? <span key={picks[i].id} className="relative h-full overflow-hidden rounded-[8px]"><Square career={picks[i]} /><span aria-hidden className="absolute bottom-[6px] left-[6px] rounded-[5px] px-[5px] text-[10px] leading-[14px] font-bold" style={{ background: "rgba(5,8,20,0.7)", color: "#fff" }}>#{i + 1}</span></span>
            : <EmptySquare key={i} className="h-full" icon={<Plus className="h-4 w-4" aria-hidden />} />)}
        </span>
      }
      title={picks.length >= 3 ? "Your Top 3" : picks.length ? "Fill your Top 3" : "Start your Top 3"}
      line={lead ? `${lead.title} is #1${picks.length < 3 ? ` · ${3 - picks.length} ${3 - picks.length === 1 ? "slot" : "slots"} open` : ""}` : "Pick from what you saved"} />
  );
}

/** `bar={false}` (Home v1's Your Next Moves, 4 Oct 2026): the scene, the
 *  title and the step only (Chandu: "not too many things in each card, not
 *  too many competing elements"). */
export function PlanTile({ v, bar = true }: { v: string; bar?: boolean }) {
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
      <Link href={`/profile?tab=plan${v}`} className="dm-tap dm-season-host group relative flex h-[204px] w-full flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border p-[16px]" style={CARD}>
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

function SavedTile({ v }: { v: string }) {
  const [careerIds] = useSavedCareers();
  const [schools] = useSavedSchools();
  const [videos] = useSavedVideos();
  const opportunities = Object.keys(opportunityStore.useValue().status).length;
  const recent = [...careerIds].reverse().map(careerById).filter((c): c is ProfileCareer => !!c);
  const total = careerIds.size + schools.size + videos.size + opportunities;
  const shown = recent.slice(0, 4);
  const more = Math.max(0, total - shown.length);
  return (
    <WeekTile href={`/profile?tab=locker${v}`}
      art={
        // Instagram's saved-collection cover: a strip of the latest saves,
        // the last cell carrying how many more there are.
        <span className="grid h-full grid-cols-4 gap-[8px]">
          {[0, 1, 2, 3].map((i) => {
            const c = shown[i];
            if (!c) return <EmptySquare key={i} className="h-full" icon={<Bookmark className="h-4 w-4" aria-hidden />} />;
            const last = i === 3 && more > 0;
            return (
              <span key={c.id} className="relative h-full overflow-hidden rounded-[8px]">
                <Square career={c} />
                {last && <span className="absolute inset-0 flex items-center justify-center text-[15px] font-extrabold" style={{ ...DISPLAY, background: "rgba(5,8,20,0.62)", color: "#fff" }}>+{more}</span>}
              </span>
            );
          })}
        </span>
      }
      title={total ? `See your ${total} saves` : "Save what you like"}
      line={recent[0] ? `${recent[0].title}${total > 1 ? ` and ${total - 1} more` : ""}` : "Careers, schools and scholarships land here"} />
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The scholarship to apply for next (Home v2's Your week, and Home v1's
 *  Your Next Moves since 4 Oct 2026). Scholarships only, matched to the
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
export function ResumeTile({ v }: { v: string }) {
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
    <WeekTile href={`/profile?tab=resume${v}`}
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

export function HomeDashboard() {
  const v = "&v=2";
  return (
    // A title for the four tiles (2 Oct 2026, Chandu: "assign a title to the
    // row under the carousel that makes sense... not robotic and formal and
    // something cool but still communicates the value of those 4 tiles").
    // Your Top 3, your plan, your saves and your next deadline are where a
    // student stands right now, said the way they would say it.
    <section aria-labelledby="home-where-you-are" className="flex w-full flex-col gap-[var(--space-3)]">
      <h2 id="home-where-you-are" className="text-[19px] leading-[24px] font-bold" style={{ ...DISPLAY, color: "var(--foreground)" }}>Where you&apos;re at</h2>
      <div className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4 lg:gap-[var(--space-4)]">
        <Top3Tile v={v} />
        <PlanTile v={v} />
        <SavedTile v={v} />
        <DeadlineTile />
      </div>
    </section>
  );
}

/** Home v2's second row: what to do next about the number one career, the
 *  thing the whole app is built around. Three composed tiles, each a real
 *  count from the app's own data: schools for it, money in its field, pros
 *  who do it. Replaces v1's "Recommended Careers" rail, which repeated
 *  Explore's first row one tap away (Chandu, 1 Oct 2026: "full authority to
 *  fully rethink this"). */
export function TopPickRow() {
  const picks = useTop3Careers();
  const lead = picks[0];
  const field = lead ? worldToField(lead.world) : null;
  // Open scholarships and programs in the field, soonest deadline first, so
  // the card can name one and count the rest.
  const money = useMemo(() => {
    if (!field) return [] as { name: string; days: number | null }[];
    const t = today();
    return [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS, ...INTERNSHIP_ITEMS]
      .filter((i) => i.fields.includes(field)).map((i) => ({ name: i.name, time: timing(i, t) })).filter((x) => x.time.status !== "closed")
      .sort((a, b) => (a.time.days ?? 9999) - (b.time.days ?? 9999)).map((x) => ({ name: x.name, days: x.time.days }));
  }, [field]);
  if (!lead) return null;
  const color = WORLD_COLORS[lead.world] ?? "var(--primary)";
  const allPros = PROS.filter((p) => p.world === lead.world);
  const pros = allPros.slice(0, 3);
  const inState = COLLEGES.filter((c) => c.state === "NJ");
  // DEMO-ONLY: the campus photo is the demo student's in-state flagship;
  // production picks the first Target school from Explore Schools' For you.
  const school = COLLEGES.find((c) => c.slug === "rutgers-university-new-brunswick") ?? COLLEGES[0];
  const schoolPhoto = collegeImage(school);
  const schoolMark = collegeMark(school);
  const peoplePhoto = lead.world === "Business & Finance" ? "/images/connect/covers/finance.webp" : lead.world === "Health & Medicine" ? "/images/connect/covers/healthcare.webp" : lead.world === "Arts & Media" ? "/images/connect/covers/creative.webp" : "/images/connect/events/panel-1.jpg";
  const H = "h-[168px]";
  return (
    <section aria-label={`Next for ${lead.title}`} className="flex w-full flex-col gap-[var(--space-3)]">
      <h2 className="text-[19px] leading-[24px] font-bold" style={{ ...DISPLAY, color: "var(--foreground)" }}>Next for {lead.title}</h2>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3 lg:gap-[var(--space-4)]">
        <EditorialTile href="/colleges?view=foryou" accent={color} className={H} photo={schoolPhoto} focus="50% 40%"
          title="Pick your schools" line={`${school.name.replace(/-New Brunswick$/, "")} and ${Math.max(0, inState.length - 1)} more in New Jersey`}
          art={schoolMark ? <span className="absolute top-[12px] right-[40px] z-[1] flex size-[36px] items-center justify-center overflow-hidden rounded-full" style={{ background: "#fff" }}><Image src={schoolMark} alt="" width={28} height={28} className="h-[28px] w-[28px] object-contain" /></span> : undefined} />
        <EditorialTile href={field ? `/opportunities?field=${encodeURIComponent(field)}` : "/opportunities"} accent={AMBER} className={H} photo={lead.photo} focus={lead.photoFocus ?? "50% 25%"}
          title="Apply for scholarships" line={money[0] ? `${money[0].name}${money.length > 1 ? ` and ${money.length - 1} more` : ""}` : `For ${lead.world}`}
          art={money.length ? <span aria-hidden className="absolute top-[6px] right-[14px] z-[1] text-[72px] leading-none font-extrabold tabular-nums" style={{ ...DISPLAY, color: "rgba(255,255,255,0.92)" }}>{money.length}</span> : undefined} />
        <EditorialTile href="/connect" accent={color} className={H} photo={peoplePhoto} focus="50% 35%"
          title="Ask a pro who does this" line={pros[0] ? `${pros[0].name}${allPros.length > 1 ? ` and ${allPros.length - 1} more` : ""} answer here` : "On Connect"}
          art={<span className="absolute top-[34px] right-[16px] z-[1] flex" style={{ textShadow: "none" }}>{pros.map((p, i) => <span key={p.id} className="rounded-full border-2" style={{ marginLeft: i ? -10 : 0, borderColor: INK, zIndex: 3 - i }}><ProAvatar proId={p.id} name={p.name} size={36} /></span>)}</span>} />
      </div>
    </section>
  );
}
