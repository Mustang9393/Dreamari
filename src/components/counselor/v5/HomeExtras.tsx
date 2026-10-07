"use client";

// Two Home rows from Joshua's brief that were gaps (7 Oct 2026; Chandu:
// "go ahead and build the gaps list"):
// - Turn Interest into Opportunity: the worlds students save most, each with
//   real programs from the Opportunities catalog that fit (grades 9 to 12),
//   and a Share that sends it to the students saving that world.
// - Most Played Simulations: the three built simulations, how many students
//   started and finished each.
// DEMO-ONLY: shares are logged, not delivered, and play counts are seeded
// until simulation plays are logged per student.

import { useReviewedRoster } from "@/lib/counselorReviews";
import { addShare } from "@/lib/counselorShares";
import { openDeadline } from "./DeadlineSheet";
import { useMemo } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS } from "@/components/opportunities/data";
import type { Field } from "@/components/opportunities/types";
import { SIMULATIONS } from "@/components/play/games";
import { logTime } from "@/lib/counselorTimeLog";
import { countActivity, useActivity } from "@/lib/activityEvents";
import { notify } from "./LogSheet";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";

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

export function InterestToOpportunity({ worlds }: { worlds: { world: string; students: number }[] }) {
  const roster = useReviewedRoster();
  const rows = useMemo(() => {
    const pool = [...INTERNSHIP_ITEMS, ...PROGRAM_ITEMS];
    // a program fitting two worlds is shown once, under the first
    const used = new Set<string>();
    return worlds.filter((w) => FIELD_FOR[w.world]).slice(0, 3).map((w) => {
      const field = FIELD_FOR[w.world];
      const fits = pool.flatMap((p) => (p.type === "program" && p.fields.includes(field) && p.grades.some((g) => g >= 9) && !used.has(p.id) ? [p] : []));
      const items = fits.slice(0, 2);
      items.forEach((p) => used.add(p.id));
      return { ...w, items };
    }).filter((r) => r.items.length);
  }, [worlds]);
  if (!rows.length) return null;
  // shares are recorded with their recipients (8 Oct 2026 audit: only the
  // time was logged), and a program opens in place with the students it
  // fits instead of the student app's page
  const inWorld = (world: string) => roster.filter((s) => s.careerTrack === world);
  const share = (world: string, id: string, name: string) => {
    const to = inWorld(world);
    addShare({ kind: "opportunity", title: name, ref: id, studentIds: to.map((s) => s.id), studentNames: to.map((s) => s.name) });
    logTime({ activity: `Shared ${name}`, minutes: 5, kind: "indirect" });
    notify(`${name} sent to ${to.length} students exploring ${world}`);
  };
  return (
    <section aria-label="Turn interest into opportunity" className="flex flex-col gap-[var(--space-5)]">
      <Title>Turn Interest into Opportunity</Title>
      <div className="grid grid-cols-1 gap-[var(--space-8)] lg:grid-cols-3 lg:gap-0">
        {rows.map((r, i) => (
          <div key={r.world} className={`flex flex-col gap-[var(--space-3)] ${i ? "lg:border-l lg:pl-[var(--space-8)]" : ""} ${i < rows.length - 1 ? "lg:pr-[var(--space-8)]" : ""}`} style={{ borderColor: RULE }}>
            <span className="flex items-baseline justify-between gap-[var(--space-3)]">
              <span className="text-[16px] font-semibold">{r.world}</span>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{r.students} students</span>
            </span>
            <ul className="flex flex-col">
              {r.items.map((p) => (
                <li key={p.id} className="flex items-center gap-[var(--space-3)] border-b py-[10px] last:border-b-0" style={{ borderColor: RULE }}>
                  <button type="button" onClick={() => openDeadline({ id: `opp:${p.id}`, title: p.name, when: p.deadline ? `Due ${new Date(`${p.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : p.org, days: null, students: inWorld(r.world), href: "", lede: `${p.org}. For students exploring ${r.world}.` })} className="dm-quiet -mx-[var(--space-2)] flex min-w-0 flex-1 cursor-pointer flex-col rounded-[var(--radius-md)] px-[var(--space-2)] py-[4px] text-left">
                    <span className="truncate text-[15px] leading-[20px] font-semibold">{p.name}</span>
                    <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{p.org}{p.deadline ? ` · due ${new Date(`${p.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}</span>
                  </button>
                  <ShareButton label={`Share ${p.name} with ${r.students} students`} onShare={() => share(r.world, p.id, p.name)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShareButton({ label, onShare }: { label: string; onShare: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onShare}
      className="dm-quiet inline-flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[12px] text-[13px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}>
      <Send className="h-[13px] w-[13px]" aria-hidden /> Share
    </button>
  );
}

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
      <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-3">
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
