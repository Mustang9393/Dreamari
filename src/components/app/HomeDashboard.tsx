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
import { Bookmark, ChevronRight, GraduationCap, Plus, Users } from "lucide-react";
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
import { timing, today, worldToField } from "@/components/opportunities/match";
import { worldBand } from "@/components/opportunities/Preview";
import { PROS } from "@/components/connect/data";
import { WORLD_COLORS } from "./worlds";

const MUTED = { color: "var(--muted-foreground)" } as const;
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

function Tile({ href, label, children, className = "" }: { href: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <HoverBeam strength={0.7} className="min-w-0">
      <Link href={href} className={`dm-tap group relative flex h-[168px] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border ${className}`} style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <span className="pointer-events-none absolute top-[14px] left-[16px] z-[2] text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={MUTED}>{label}</span>
        <ChevronRight aria-hidden className="pointer-events-none absolute top-[12px] right-[12px] z-[2] h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-[2px] group-hover:opacity-100" style={MUTED} />
        {children}
      </Link>
    </HoverBeam>
  );
}

/** A small 3:4 cover, the poster shape at thumbnail size. */
function Cover({ career, className = "", style }: { career: ProfileCareer; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`relative block overflow-hidden rounded-[8px] border ${className}`} style={{ borderColor: "rgba(255,255,255,0.14)", boxShadow: "0 8px 20px -10px rgba(0,0,0,0.7)", background: "#0e0c20", ...style }}>
      <Image src={career.photo} alt="" fill sizes="96px" className="object-cover" style={{ objectPosition: career.photoFocus ?? "50% 25%" }} />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: WORLD_COLORS[career.world] ?? "var(--primary)" }} />
    </span>
  );
}

function Top3Tile({ v }: { v: string }) {
  const picks = useTop3Careers();
  const slots = [0, 1, 2];
  return (
    <Tile href={`/profile?tab=top3${v}`} label="Top 3">
      <span className="absolute top-[40px] right-[16px] left-[16px] flex gap-[8px]">
        {slots.map((i) => {
          const c = picks[i];
          return c ? (
            <Cover key={c.id} career={c} className="aspect-[3/4] w-[52px]" />
          ) : (
            <span key={i} className="flex aspect-[3/4] w-[52px] items-center justify-center rounded-[8px] border border-dashed" style={{ borderColor: "color-mix(in srgb, var(--foreground) 22%, transparent)" }}>
              <Plus className="h-4 w-4" aria-hidden style={{ color: "color-mix(in srgb, var(--foreground) 40%, transparent)" }} />
            </span>
          );
        })}
      </span>
      <span className="absolute right-[16px] bottom-[14px] left-[16px] flex items-baseline gap-[6px]">
        <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={DISPLAY}>{picks.length}</span>
        <span className="text-[13px] font-bold" style={MUTED}>of 3 picked</span>
      </span>
    </Tile>
  );
}

function PlanTile({ v }: { v: string }) {
  const stage = useStage();
  const grade = (Number(STUDENT.grade.replace("Grade ", "")) || 9) as 9 | 10 | 11 | 12;
  const picks = useTop3Careers();
  const plan = stage === "hs" ? gradePlan(grade) : collegePlan(1, picks[0] ? { id: picks[0].id, title: picks[0].title } : null);
  const id = currentPlanWindowId();
  const win = plan.windows.find((w) => w.id === id) ?? plan.windows[0];
  const first = win.steps[0];
  return (
    <Tile href={`/profile?tab=plan${v}`} label="My Plan">
      <SeasonScene seasonId={win.id} className="absolute inset-0 opacity-90" />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--background) 92%, transparent) 0%, color-mix(in srgb, var(--background) 55%, transparent) 45%, transparent 100%)" }} />
      <span className="absolute right-[16px] bottom-[14px] left-[16px] flex flex-col gap-[6px]">
        <span className="text-[17px] leading-[21px] font-extrabold" style={DISPLAY}>{win.title}</span>
        {first && <span className="truncate text-[13px] leading-[17px] font-semibold" style={MUTED}>Next: {first.title}</span>}
        <SparkBar percent={Math.max(8, Math.round((1 / Math.max(1, win.steps.length)) * 100))} min={8} height={5} track="color-mix(in srgb, var(--foreground) 10%, transparent)" fill="var(--accent-subtle)" glow="var(--accent-subtle)" idle />
      </span>
    </Tile>
  );
}

function SavedTile({ v }: { v: string }) {
  const [careerIds] = useSavedCareers();
  const [schools] = useSavedSchools();
  const [videos] = useSavedVideos();
  const opportunities = Object.keys(opportunityStore.useValue().status).length;
  const covers = [...careerIds].reverse().map(careerById).filter((c): c is ProfileCareer => !!c).slice(0, 3);
  const total = careerIds.size + schools.size + videos.size + opportunities;
  const tilt = [-10, 0, 10];
  return (
    <Tile href={`/profile?tab=locker${v}`} label="Saved">
      {/* The fan sits top-right, clear of the numeral at bottom-left (the
         first cut overlapped them on phones). */}
      <span className="absolute top-[34px] right-[18px] h-[72px] w-[104px]">
        {covers.length ? covers.map((c, i) => (
          <Cover key={c.id} career={c} className="absolute bottom-0 aspect-[3/4] w-[46px]" style={{ left: 4 + i * 22, transform: `rotate(${tilt[i] ?? 0}deg)`, transformOrigin: "50% 100%", zIndex: i }} />
        )) : (
          <span className="absolute bottom-0 left-[4px] flex aspect-[3/4] w-[46px] items-center justify-center rounded-[8px] border border-dashed" style={{ borderColor: "color-mix(in srgb, var(--foreground) 22%, transparent)" }}>
            <Bookmark className="h-4 w-4" aria-hidden style={{ color: "color-mix(in srgb, var(--foreground) 40%, transparent)" }} />
          </span>
        )}
      </span>
      <span className="absolute right-[16px] bottom-[14px] left-[16px] flex items-baseline gap-[6px]">
        <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={DISPLAY}>{total}</span>
        <span className="text-[13px] font-bold" style={MUTED}>{total === 1 ? "thing saved" : "things saved"}</span>
      </span>
    </Tile>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DeadlineTile() {
  const record = opportunityStore.useValue();
  const [todayIso] = useState(() => today());
  const all = useMemo(() => [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS, ...INTERNSHIP_ITEMS], []);
  // The nearest deadline among what the student saved; otherwise the nearest
  // one anyone can still apply to, so the tile is never empty.
  const next = useMemo(() => {
    const dated = (ids: string[]) => ids.map((id) => all.find((i) => i.id === id)).filter((i): i is (typeof all)[number] => !!i)
      .map((item) => ({ item, t: timing(item, todayIso) })).filter((x) => x.t.status === "open" && x.t.iso && x.t.days !== null && x.t.days >= 0)
      .sort((a, b) => (a.t.days ?? 0) - (b.t.days ?? 0));
    return dated(Object.keys(record.status))[0] ?? dated(all.map((i) => i.id))[0] ?? null;
  }, [record, all, todayIso]);
  if (!next) return null;
  const d = new Date(next.t.iso! + "T12:00:00");
  const saved = !!record.status[next.item.id];
  return (
    <Tile href={`/opportunities?open=${next.item.id}`} label={saved ? "Closes next" : "Closing soon"}>
      <span className="absolute top-[40px] left-[16px] flex w-[62px] flex-col overflow-hidden rounded-[10px] border text-center" style={{ borderColor: "rgba(255,255,255,0.14)", boxShadow: "0 8px 20px -10px rgba(0,0,0,0.7)" }}>
        <span className="py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={{ background: next.t.tone === "soon" ? "var(--color-feedback-warning, #f5b041)" : "var(--primary)", color: "#0e0c20" }}>{MONTHS[d.getMonth()]}</span>
        <span className="py-[6px] text-[26px] leading-[28px] font-extrabold tabular-nums" style={{ ...DISPLAY, background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>{d.getDate()}</span>
      </span>
      <span className="absolute right-[16px] bottom-[14px] left-[16px] flex flex-col gap-[2px]">
        <span className="truncate text-[15px] leading-[19px] font-extrabold" style={DISPLAY}>{next.item.name}</span>
        <span className="text-[13px] leading-[17px] font-semibold" style={MUTED}>{next.t.days === 0 ? "Closes today" : `Closes in ${next.t.days} ${next.t.days === 1 ? "day" : "days"}`}</span>
      </span>
    </Tile>
  );
}

export function HomeDashboard() {
  const v = "&v=2";
  return (
    <section aria-label="Your week" className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4 lg:gap-[var(--space-4)]">
      <Top3Tile v={v} />
      <PlanTile v={v} />
      <SavedTile v={v} />
      <DeadlineTile />
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
  const money = useMemo(() => {
    if (!field) return 0;
    const t = today();
    return [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS, ...INTERNSHIP_ITEMS].filter((i) => i.fields.includes(field) && timing(i, t).status !== "closed").length;
  }, [field]);
  if (!lead) return null;
  const color = WORLD_COLORS[lead.world] ?? "var(--primary)";
  const pros = PROS.filter((p) => p.world === lead.world);
  const band = worldBand(color);
  const tiles = [
    { href: "/colleges?view=foryou", label: "Schools", title: `Schools for ${lead.title}`, line: "Target, likely and reach picks", Icon: GraduationCap, big: null as string | null },
    { href: field ? `/opportunities?field=${encodeURIComponent(field)}` : "/opportunities", label: "Money", title: `${lead.world} scholarships`, line: money ? `${money} open now` : "Scholarships and programs", Icon: null, big: money ? String(money) : null },
    { href: "/connect", label: "People", title: `Pros who do this`, line: pros.length ? `${pros.length} answering on Connect` : "Ask on Connect", Icon: Users, big: null as string | null },
  ];
  return (
    <section aria-label={`Next for ${lead.title}`} className="flex w-full flex-col gap-[var(--space-3)]">
      <div className="flex flex-col gap-[2px]">
        <span className="text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)" }}>Your number one</span>
        <h2 className="text-[19px] leading-[24px] font-bold" style={{ ...DISPLAY, color: "var(--foreground)" }}>Next for {lead.title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3 lg:gap-[var(--space-4)]">
        {tiles.map((t) => (
          <HoverBeam key={t.label} strength={0.7} className="min-w-0">
            <Link href={t.href} className="dm-tap group relative flex h-[128px] w-full flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border p-[16px]" style={{ borderColor: "var(--glass-border)", ...band }}>
              <span className="pointer-events-none absolute top-[14px] left-[16px] text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={MUTED}>{t.label}</span>
              <ChevronRight aria-hidden className="pointer-events-none absolute top-[12px] right-[12px] h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-[2px] group-hover:opacity-100" style={MUTED} />
              {t.big ? (
                <span aria-hidden className="pointer-events-none absolute top-[8px] right-[14px] text-[64px] leading-none font-extrabold tabular-nums" style={{ ...DISPLAY, color: `color-mix(in srgb, ${color} 55%, transparent)` }}>{t.big}</span>
              ) : t.Icon ? (
                <span aria-hidden className="pointer-events-none absolute top-[14px] right-[16px] flex size-[40px] items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${color} 28%, transparent)`, color: "var(--foreground)" }}><t.Icon className="h-5 w-5" /></span>
              ) : null}
              <span className="relative pr-[64px] text-[16px] leading-[20px] font-extrabold text-balance" style={DISPLAY}>{t.title}</span>
              <span className="relative mt-[2px] text-[13px] leading-[17px] font-semibold" style={MUTED}>{t.line}</span>
            </Link>
          </HoverBeam>
        ))}
      </div>
    </section>
  );
}
