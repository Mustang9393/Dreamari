"use client";

// Compare my Top 3, Highlights (6 Oct 2026): one story per slide instead
// of a thirteen-row table. Pay as ranges with the typical mark, growth,
// what each asks of you, where each leads, the one-line work, and what
// is the same across all of them. The table stays as "Original" for the
// student who wants every row. Every number comes from the career's
// report or profile; where a career has neither, the slide says so.

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { careerProfile } from "@/components/career/profiles";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { reportV2 } from "./report-data";
import type { ProfileCareer } from "./data";
import { top3PhotoFocus } from "./top3PhotoFocus";

type Slide = "pay" | "growth" | "goodAt" | "leads" | "work" | "same";
const SLIDES: { key: Slide; label: string }[] = [
  { key: "pay", label: "Pay" },
  { key: "growth", label: "Growth" },
  { key: "goodAt", label: "Good at" },
  { key: "leads", label: "Where it leads" },
  { key: "work", label: "The work" },
  { key: "same", label: "The same" },
];
const EASE = [0.22, 1, 0.36, 1] as const;

/** "$361,000", "$81K", "$75,700 (lowest tenth)" to a number; NaN when none. */
export const moneyOf = (s: string | undefined | null): number => {
  if (!s) return NaN;
  const m = s.match(/\$\s?([\d,.]+)\s*(K|k)?/);
  if (!m) return NaN;
  const n = Number(m[1].replace(/,/g, ""));
  return m[2] ? n * 1000 : n;
};
const fmtK = (n: number) => (Number.isFinite(n) ? (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`) : "—");
const pctOf = (s: string | undefined): number => { const m = s?.match(/([+-]?\d+(?:\.\d+)?)\s*%/); return m ? Number(m[1]) : NaN; };

type Row = {
  career: ProfileCareer;
  accent: string;
  entry: number; median: number; top: number;
  outlook?: string; outlookPct: number;
  goodAt: string[];
  ladder: { jobTitle: string; pay: string }[];
  work: string;
  education?: string;
};

function rowFor(career: ProfileCareer): Row {
  const r = reportV2(career.id);
  const p = careerProfile(career.id);
  const pay = p?.factDetails?.pay;
  const median = moneyOf(r?.salary.median ?? pay?.typical ?? p?.facts.find((f) => f.label === "Typical pay")?.value ?? career.routes[0]?.salary);
  const entry = moneyOf(r?.salary.entry ?? pay?.starting);
  const top = moneyOf(r?.salary.experienced ?? pay?.top);
  return {
    career,
    accent: WORLD_COLORS[career.world] ?? "var(--primary)",
    entry: Number.isFinite(entry) ? entry : median * 0.55,
    median,
    top: Number.isFinite(top) ? top : median * 1.8,
    outlook: r?.salary.outlook ?? r?.comparison.outlook,
    outlookPct: pctOf(r?.comparison.outlook ?? r?.salary.outlookDetail),
    goodAt: p?.goodAt ?? r?.glance.skills ?? [],
    ladder: p?.ladder.map((l) => ({ jobTitle: l.jobTitle, pay: l.pay })) ?? [],
    work: r?.glance.simple ?? p?.summary ?? "",
    education: r?.comparison.education ?? r?.education.find((e) => e.common)?.name ?? p?.facts.find((f) => f.label === "Typical degree")?.value,
  };
}

export function CompareHighlights({ careers, focusId }: { careers: ProfileCareer[]; focusId: string }) {
  const reduce = useReducedMotion();
  const rows = careers.map(rowFor);
  const [slide, setSlide] = useState<Slide>("pay");
  const i = SLIDES.findIndex((s) => s.key === slide);
  const go = (d: 1 | -1) => { const n = i + d; if (n >= 0 && n < SLIDES.length) setSlide(SLIDES[n].key); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* the three, as posters with their rank; the one the report follows is marked */}
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: `repeat(${careers.length}, minmax(0, 1fr))` }}>
        {rows.map((r, idx) => (
          <div key={r.career.id} className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: `color-mix(in srgb, ${r.accent} 45%, var(--glass-border))` }}>
            <Image src={r.career.photo} alt="" fill sizes="320px" className="object-cover" style={{ objectPosition: top3PhotoFocus(r.career) }} />
            <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,8,18,0.92) 0%, rgba(6,8,18,0.35) 55%, transparent 100%)" }} />
            <span className="absolute top-[8px] left-[8px] flex items-center gap-[4px] rounded-full px-[8px] py-[3px] text-[11px] font-extrabold" style={{ background: "rgba(6,8,18,0.7)", color: idx === 0 ? r.accent : "#fff" }}>{idx === 0 && <Star className="h-3 w-3" fill="currentColor" aria-hidden />}#{idx + 1}</span>
            {r.career.id === focusId && <span className="absolute top-[8px] right-[8px] rounded-full px-[7px] py-[3px] text-[9.5px] font-extrabold tracking-[0.12em]" style={{ background: "rgba(255,255,255,0.92)", color: "#0b0d12" }}>VIEWING</span>}
            <span className="absolute inset-x-[10px] bottom-[8px] truncate text-[15px] leading-tight uppercase" style={{ ...posterTitleFont(r.career.world), color: "#fff" }}>{r.career.title}</span>
          </div>
        ))}
      </div>

      {/* the slides */}
      <div className="flex flex-wrap items-center justify-between gap-[10px]">
        <div role="tablist" aria-label="Highlight" className="flex flex-wrap gap-[4px]">
          {SLIDES.map((s) => (
            <button key={s.key} role="tab" aria-selected={s.key === slide} type="button" onClick={() => setSlide(s.key)} className="dm-quiet cursor-pointer rounded-full px-[11px] py-[6px] text-[12.5px] font-bold" style={s.key === slide ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>{s.label}</button>
          ))}
        </div>
        <span className="flex items-center gap-[6px]">
          <button type="button" aria-label="Previous highlight" disabled={i === 0} onClick={() => go(-1)} className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
          <span className="min-w-[36px] text-center text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1} / {SLIDES.length}</span>
          <button type="button" aria-label="Next highlight" disabled={i === SLIDES.length - 1} onClick={() => go(1)} className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><ChevronRight className="h-4 w-4" aria-hidden /></button>
        </span>
      </div>

      <motion.div key={slide} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }} className="flex min-h-[260px] flex-col gap-[var(--space-4)]">
        {slide === "pay" && <PaySlide rows={rows} />}
        {slide === "growth" && <GrowthSlide rows={rows} />}
        {slide === "goodAt" && <GoodAtSlide rows={rows} />}
        {slide === "leads" && <LeadsSlide rows={rows} />}
        {slide === "work" && <WorkSlide rows={rows} />}
        {slide === "same" && <SameSlide rows={rows} />}
      </motion.div>
    </div>
  );
}

function Headline({ lead, accent, rest, sub }: { lead: string; accent: string; rest: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <h4 className="text-[22px] leading-[1.15] font-extrabold sm:text-[24px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        <span style={{ color: accent }}>{lead}</span> {rest}
      </h4>
      {sub && <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

function PaySlide({ rows }: { rows: Row[] }) {
  const sorted = [...rows].filter((r) => Number.isFinite(r.median)).sort((a, b) => b.median - a.median);
  if (!sorted.length) return <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>Pay is not in these reports yet.</p>;
  const max = Math.max(...sorted.map((r) => r.top));
  const best = sorted[0];
  const last = sorted[sorted.length - 1];
  return (
    <>
      <Headline lead={best.career.title} accent={best.accent} rest="earns the most" sub={sorted.length > 1 ? `About ${fmtK(best.median - last.median)} more a year than ${last.career.title}.` : undefined} />
      <ul className="flex flex-col gap-[16px]">
        {sorted.map((r, idx) => {
          const l = (r.entry / max) * 100, w = ((r.top - r.entry) / max) * 100, m = (r.median / max) * 100;
          return (
            <li key={r.career.id} className="grid grid-cols-[minmax(0,1fr)_84px] items-center gap-[14px] sm:grid-cols-[160px_minmax(0,1fr)_96px]">
              <span className="flex items-center gap-[8px] text-[14px] font-bold sm:col-start-1" style={{ color: "var(--foreground)" }}><span className="size-[8px] flex-none rounded-full" style={{ background: r.accent }} aria-hidden />{r.career.title}</span>
              <span className="relative col-span-2 h-[26px] sm:col-span-1 sm:col-start-2">
                <span className="absolute inset-x-0 top-[9px] h-[8px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} />
                <span className="dm-grow-x absolute top-[9px] h-[8px] rounded-full" style={{ left: `${l}%`, width: `${Math.max(2, w)}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${r.accent} 45%, transparent), ${r.accent})`, animationDelay: `${idx * 90}ms` }} />
                <span className="absolute top-[4px] h-[18px] w-[3px] rounded-full" style={{ left: `calc(${m}% - 1px)`, background: "#fff", boxShadow: "0 0 0 2px rgba(6,8,18,0.6)" }} aria-hidden />
                <span className="absolute top-[18px] text-[10.5px] font-semibold tabular-nums" style={{ left: `${l}%`, color: "var(--muted-foreground)" }}>{fmtK(r.entry)}</span>
                <span className="absolute top-[18px] -translate-x-full text-[10.5px] font-semibold tabular-nums" style={{ left: `${l + Math.max(2, w)}%`, color: "var(--muted-foreground)" }}>{fmtK(r.top)}</span>
              </span>
              <span className="text-right text-[18px] font-extrabold tabular-nums sm:col-start-3" style={{ color: "var(--foreground)" }}>{fmtK(r.median)}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>Each bar runs from starting pay to top earners. The mark is typical pay for a year in the U.S.</p>
    </>
  );
}

function GrowthSlide({ rows }: { rows: Row[] }) {
  const known = rows.filter((r) => Number.isFinite(r.outlookPct)).sort((a, b) => b.outlookPct - a.outlookPct);
  const best = known[0];
  return (
    <>
      {best
        ? <Headline lead={best.career.title} accent={best.accent} rest="is growing fastest" sub={`${best.outlookPct > 0 ? "+" : ""}${best.outlookPct}% more jobs by the projection year.`} />
        : <Headline lead="Job growth" accent="var(--foreground)" rest="" sub="How many more of these jobs there will be, in the government's words." />}
      <ul className="grid gap-[10px] sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.career.id} className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[14px]" style={{ borderColor: "var(--glass-border)", background: `color-mix(in srgb, ${r.accent} 6%, var(--glass-surface-1))` }}>
            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{r.career.title}</span>
            <span className="text-[22px] leading-none font-extrabold tabular-nums" style={{ color: r.accent }}>{Number.isFinite(r.outlookPct) ? `${r.outlookPct > 0 ? "+" : ""}${r.outlookPct}%` : "—"}</span>
            <span className="text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{r.outlook ?? "Not in the report yet."}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function GoodAtSlide({ rows }: { rows: Row[] }) {
  return (
    <>
      <Headline lead="What each one" accent="var(--foreground)" rest="asks of you" sub="The things people in each job say you need to be good at." />
      <ul className="grid gap-[10px] sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.career.id} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[14px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <span className="flex items-center gap-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}><span className="size-[8px] rounded-full" style={{ background: r.accent }} aria-hidden />{r.career.title}</span>
            {r.goodAt.length ? (
              <ul className="flex flex-col gap-[5px]">{r.goodAt.slice(0, 5).map((g) => <li key={g} className="text-[13px] leading-[18px]" style={{ color: "var(--foreground)" }}>{g}</li>)}</ul>
            ) : <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Not in the report yet.</span>}
          </li>
        ))}
      </ul>
    </>
  );
}

function LeadsSlide({ rows }: { rows: Row[] }) {
  const withTop = rows.filter((r) => r.ladder.length).map((r) => ({ r, top: r.ladder[r.ladder.length - 1], n: moneyOf(r.ladder[r.ladder.length - 1].pay) })).sort((a, b) => b.n - a.n);
  const best = withTop[0];
  return (
    <>
      {best
        ? <Headline lead={best.r.career.title} accent={best.r.accent} rest="climbs the highest" sub={`${best.top.jobTitle} at the top of the ladder, around ${best.top.pay} a year.`} />
        : <Headline lead="Where each one" accent="var(--foreground)" rest="leads" />}
      <ul className="grid gap-[10px] sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.career.id} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[14px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{r.career.title}</span>
            {r.ladder.length ? (
              <ol className="flex flex-col gap-[6px]">
                {r.ladder.map((l, idx) => (
                  <li key={l.jobTitle} className="flex items-center justify-between gap-[8px] text-[13px]" style={{ color: idx === r.ladder.length - 1 ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: idx === r.ladder.length - 1 ? 700 : 500 }}>
                    <span className="truncate">{idx + 1}. {l.jobTitle}</span><span className="flex-none tabular-nums" style={{ color: idx === r.ladder.length - 1 ? r.accent : undefined }}>{l.pay}</span>
                  </li>
                ))}
              </ol>
            ) : <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Not in the report yet.</span>}
          </li>
        ))}
      </ul>
    </>
  );
}

function WorkSlide({ rows }: { rows: Row[] }) {
  return (
    <>
      <Headline lead="What you" accent="var(--foreground)" rest="would do" sub="The one-line version of each job." />
      <ul className="flex flex-col divide-y rounded-[var(--radius-md)] border" style={{ borderColor: "var(--glass-border)" }}>
        {rows.map((r) => (
          <li key={r.career.id} className="grid gap-[4px] px-[14px] py-[12px] sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-[14px]" style={{ borderColor: "var(--glass-border)" }}>
            <span className="flex items-center gap-[8px] text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}><span className="size-[8px] rounded-full" style={{ background: r.accent }} aria-hidden />{r.career.title}</span>
            <span className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>{r.work || "Not in the report yet."}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function SameSlide({ rows }: { rows: Row[] }) {
  const edu = rows.map((r) => (r.education ?? "").split(",")[0].trim().toLowerCase());
  const sameEdu = edu.every((e) => e && e === edu[0]);
  const bachelor = rows.filter((r) => /bachelor/i.test(r.education ?? "")).length;
  const items: string[] = [];
  if (sameEdu) items.push(`School to start: ${rows[0].education?.split(",")[0]}, for all ${rows.length}`);
  else if (bachelor === rows.length) items.push(`A bachelor's degree is the usual start, for all ${rows.length}`);
  const sharedGood = rows.length > 1 ? rows[0].goodAt.filter((g) => rows.every((r) => r.goodAt.some((x) => x.toLowerCase() === g.toLowerCase()))) : [];
  sharedGood.forEach((g) => items.push(`Good at: ${g}, in every one`));
  return (
    <>
      <Headline lead="What is" accent="var(--foreground)" rest="the same" sub={`True for every career on this sheet.`} />
      {items.length ? (
        <ul className="flex flex-col gap-[8px]">{items.map((it) => <li key={it} className="flex items-start gap-[10px] text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}><span className="mt-[7px] size-[6px] flex-none rounded-full" style={{ background: "var(--accent-subtle)" }} aria-hidden />{it}</li>)}</ul>
      ) : (
        <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Nothing identical across these {rows.length}, and that is useful: they ask for different things.</p>
      )}
    </>
  );
}
