"use client";

// Two Home rows from Joshua's brief that were gaps (7 Oct 2026; Chandu:
// "go ahead and build the gaps list"):
// - Turn Interest into Opportunity: the student app's opportunity posters
//   for the worlds students save most, each with a Send to those students.
// - Most Played Simulations: the three built simulations, how many students
//   started and finished each.
// DEMO-ONLY: shares are logged, not delivered, and play counts are seeded
// until simulation plays are logged per student.

import { useReviewedRoster } from "@/lib/counselorReviews";
import { addShare } from "@/lib/counselorShares";
import { openDeadline } from "./DeadlineSheet";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "@/components/opportunities/data";
import { Poster } from "@/components/opportunities/Poster";
import type { Enriched } from "@/components/opportunities/Card";
import { timing, today } from "@/components/opportunities/match";
import { IconTip } from "@/components/app/IconTip";
import type { Field } from "@/components/opportunities/types";
import { SIMULATIONS } from "@/components/play/games";
import { logTime } from "@/lib/counselorTimeLog";
import { countActivity, useActivity } from "@/lib/activityEvents";
import { notify } from "./LogSheet";


// student-app career worlds to the Opportunities catalog's fields
const FIELD_FOR: Record<string, Field> = {
  "Tech & Engineering": "Tech & Engineering",
  "Business & Finance": "Business & Finance",
  "Health & Medicine": "Health & Medicine",
  "Science & Research": "Science & Research",
  "Arts, Media & Sport": "Arts & Media",
  "Law, Safety & Justice": "Public Service & Law",
  "Building & Construction": "Skilled Trades",
  "Fixing Machines & Engines": "Skilled Trades",
  "Factories & Making Things": "Skilled Trades",
};

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[26px] sm:leading-[32px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>;
}

/** The student app's opportunity posters (official artwork, the date stamp,
 *  the award) for what this school's students are exploring (8 Oct 2026,
 *  Chandu: "the turn interest into opportunity can take components from the
 *  opportunities tab we have in the student app... see what you can do that
 *  makes it look exciting"). The worlds students save most are the filter;
 *  each poster says how many students it reaches, Send goes to them in one
 *  tap, and the poster opens exactly who it fits. */
export function InterestToOpportunity({ worlds }: { worlds: { world: string; students: number }[] }) {
  const roster = useReviewedRoster();
  const [todayIso] = useState(() => today());
  const top = useMemo(() => worlds.filter((w) => FIELD_FOR[w.world]).slice(0, 5), [worlds]);
  const [world, setWorld] = useState("All");
  const posters = useMemo(() => {
    const pool = [...SCHOLARSHIP_ITEMS, ...INTERNSHIP_ITEMS, ...PROGRAM_ITEMS]
      .filter((p) => p.grades.some((g) => g >= 9))
      .map((item) => ({ item, fit: NO_FIT, time: timing(item, todayIso) }))
      .filter((e) => e.time.status !== "closed");
    const soonest = (a: Enriched, b: Enriched) => (a.time.days ?? 999) - (b.time.days ?? 999);
    const pick = (w: { world: string; students: number }, n: number) => pool.filter((e) => e.item.fields.includes(FIELD_FOR[w.world])).sort(soonest).slice(0, n).map((e) => ({ e, w }));
    if (world !== "All") {
      const w = top.find((x) => x.world === world);
      return w ? pick(w, 12) : [];
    }
    // All: the soonest few for each top world, interleaved, each shown once
    const lanes = top.map((w) => pick(w, 4));
    const out: { e: Enriched; w: { world: string; students: number } }[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 4; i++) for (const lane of lanes) { const x = lane[i]; if (x && !seen.has(x.e.item.id)) { seen.add(x.e.item.id); out.push(x); } }
    return out.slice(0, 14);
  }, [top, world, todayIso]);
  if (!top.length) return null;
  const inWorld = (w: string) => roster.filter((s) => s.careerTrack === w);
  const short = (w: string) => w.split(/[ ,&]/)[0];
  const send = (e: Enriched, w: string) => {
    const to = inWorld(w);
    addShare({ kind: "opportunity", title: e.item.name, ref: e.item.id, studentIds: to.map((s) => s.id), studentNames: to.map((s) => s.name) });
    logTime({ activity: `Shared ${e.item.name}`, minutes: 5, kind: "indirect" });
    notify(`${e.item.name} sent to ${to.length} students exploring ${w}`);
  };
  return (
    <section aria-label="Turn interest into opportunity" className="flex flex-col gap-[var(--space-4)]">
      <Title>Turn Interest into Opportunity</Title>
      <div role="group" aria-label="Career world" className="-mx-5 flex gap-[8px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ world: "All", students: 0 }, ...top].map((w) => {
          const on = world === w.world;
          return (
            <button key={w.world} type="button" aria-pressed={on} onClick={() => setWorld(w.world)}
              className={`${on ? "" : "dm-quiet "}inline-flex h-9 flex-none cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13.5px] font-semibold whitespace-nowrap`}
              style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              {w.world}{w.world !== "All" && <span className="tabular-nums" style={{ opacity: 0.7 }}>{w.students}</span>}
            </button>
          );
        })}
      </div>
      <div className="poster-row -mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
        {posters.map(({ e, w }) => (
          <div key={e.item.id} className="w-[232px] flex-none sm:w-[248px]">
            <Poster e={e} status={null} cue={`${w.students} exploring ${short(w.world)}`}
              onOpen={() => openDeadline({ id: `opp:${e.item.id}`, title: e.item.name, when: e.time.label, days: null, students: inWorld(w.world), href: "", lede: `${e.item.type === "scholarship" ? e.item.provider : e.item.org}. For students exploring ${w.world}.` })}
              action={<IconTip label={`Send to the ${w.students} exploring ${w.world}`}><button type="button" aria-label={`Send ${e.item.name} to the students exploring ${w.world}`} onClick={() => send(e, w.world)} className="flex size-[36px] cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px]" style={{ background: "rgba(5,8,20,0.55)", borderColor: "rgba(255,255,255,0.22)", color: "#fff" }}><Send className="h-[15px] w-[15px]" aria-hidden /></button></IconTip>} />
          </div>
        ))}
      </div>
    </section>
  );
}

// a counselor's poster carries its own cue, not a student's fit
const NO_FIT: Enriched["fit"] = { when: "now", score: 0, reasons: [], checks: [] };


/** Play counts: a seeded baseline (DEMO-ONLY) plus every start and finish
 *  the student app logs (src/lib/activityEvents.ts), ranked by plays. */
export function MostPlayedSimulations({ students, titled = true }: { students: number; titled?: boolean }) {
  const events = useActivity();
  // a card opens who played it, not the game itself (8 Oct 2026 audit)
  const roster = useReviewedRoster();
  const rows = SIMULATIONS.map((sim, i) => {
    const base = Math.round(students * (0.42 - i * 0.09));
    const started = base + countActivity(events, "play", sim.id);
    const finished = Math.round(base * (0.68 - i * 0.07)) + countActivity(events, "finish", sim.id);
    return { sim, started, finished };
  }).sort((a, b) => b.started - a.started);
  return (
    <section aria-label="Most played simulations" className="flex flex-col gap-[var(--space-5)]">
      {titled && <Title>Most Played Simulations</Title>}
      <div className="cv-rail-sm grid grid-cols-3 gap-[var(--space-5)]" style={{ ["--rail-w" as string]: "78%" }}>
        {rows.map(({ sim, started, finished }, i) => (
          <button type="button" key={sim.id} onClick={() => openDeadline({ id: `sim:${sim.id}`, title: sim.title, when: `${started} played · ${finished} finished`, days: null, students: roster.filter((s) => s.careerTrack === sim.world).slice(0, Math.max(1, Math.min(12, started))), href: "", lede: `Students exploring ${sim.world} who played it.` })} className="dm-tap group relative flex aspect-[16/10] cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left" style={{ borderColor: "var(--glass-border)" }}>
            <Image src={sim.cover} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,10,22,0) 35%, rgba(8,10,22,0.86) 100%)" }} />
            <span className="absolute top-[12px] left-[12px] rounded-full px-[10px] py-[3px] text-[12px] font-semibold text-white" style={{ background: "rgba(8,10,22,0.62)", backdropFilter: "blur(8px)" }}>#{i + 1}</span>
            <span className="relative flex items-end justify-between gap-[var(--space-3)] p-[var(--space-4)] text-white">
              <span className="flex min-w-0 flex-col">
                <span className="text-[18px] leading-[22px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{sim.title}</span>
                <span className="text-[13px] font-medium" style={{ opacity: 0.85 }}>{sim.world}</span>
              </span>
              <span className="flex flex-none flex-col items-end">
                <span className="text-[20px] leading-[24px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{started}</span>
                <span className="text-[12px] font-medium whitespace-nowrap" style={{ opacity: 0.85 }}>played · {finished} finished</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
