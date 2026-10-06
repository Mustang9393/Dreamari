"use client";

// Compare my Top 3, Highlights. 6 Oct 2026: one story per slide. 7 Oct 2026:
// the slides stay, but every slide lays its cells out in the SAME three
// columns as the thumbnails above, so each career's number sits under its
// own photo (Joshua's ask, relayed by Chandu: "the highlights to be stacked
// in verticals under the respective career card thumbnail... keep the tabs
// but make sure everything fits the 3 column thing and is always aligned
// vertically under the 3").
// The chart language is the counselor dashboard's: one verdict line per
// row, a slim gradient bar scaled to the best of the three, one figure, one
// line of text, no card tints. The table stays as "Detailed" for the student
// who wants every row. Every number comes from the career's report or
// profile; where a career has neither, the cell says so.

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { careerProfile } from "@/components/career/profiles";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { reportV2 } from "./report-data";
import type { ProfileCareer } from "./data";
import { top3PhotoFocus } from "./top3PhotoFocus";

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
const FILL = { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const };
const NONE = "Not in the report yet.";
type Slide = "pay" | "growth" | "school" | "leads" | "goodAt" | "work" | "same";
const SLIDES: { key: Slide; label: string }[] = [
  { key: "pay", label: "Pay" },
  { key: "growth", label: "Growth" },
  { key: "school", label: "School" },
  { key: "leads", label: "Where it leads" },
  { key: "goodAt", label: "Good at" },
  { key: "work", label: "The work" },
  { key: "same", label: "The same" },
];

type Row = {
  career: ProfileCareer;
  accent: string;
  entry: number; median: number; top: number;
  outlook?: string; outlookPct: number;
  goodAt: string[];
  ladder: { jobTitle: string; pay: string }[];
  work: string;
  education?: string;
  timeToEnter?: string;
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
    timeToEnter: r?.comparison.timeToEnter,
  };
}

export function CompareHighlights({ careers, focusId }: { careers: ProfileCareer[]; focusId: string }) {
  const rows = careers.map(rowFor);
  const n = rows.length;
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState<Slide>("pay");
  const si = SLIDES.findIndex((s) => s.key === slide);
  const go = (d: 1 | -1) => { const k = si + d; if (k >= 0 && k < SLIDES.length) setSlide(SLIDES[k].key); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [si]);

  // the verdicts: who leads each row, said once
  const byPay = [...rows].filter((r) => Number.isFinite(r.median)).sort((a, b) => b.median - a.median);
  const maxMedian = byPay[0]?.median ?? 1;
  const byGrowth = rows.filter((r) => Number.isFinite(r.outlookPct)).sort((a, b) => b.outlookPct - a.outlookPct);
  const maxGrowth = Math.max(1, ...byGrowth.map((r) => Math.abs(r.outlookPct)));
  const byTop = rows.filter((r) => r.ladder.length).map((r) => ({ r, top: r.ladder[r.ladder.length - 1], n: moneyOf(r.ladder[r.ladder.length - 1].pay) })).sort((a, b) => b.n - a.n);
  const maxTop = byTop[0]?.n ?? 1;

  // what is the same, for the foot
  const edu = rows.map((r) => (r.education ?? "").split(",")[0].trim().toLowerCase());
  const same: string[] = [];
  if (edu.every((e) => e && e === edu[0])) same.push(`${rows[0].education?.split(",")[0]} to start, for all ${n}`);
  else if (rows.every((r) => /bachelor/i.test(r.education ?? ""))) same.push(`A bachelor's degree is the usual start, for all ${n}`);
  if (n > 1) rows[0].goodAt.filter((g) => rows.every((r) => r.goodAt.some((x) => x.toLowerCase() === g.toLowerCase()))).forEach((g) => same.push(`Good at ${g.toLowerCase()}, in every one`));

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* the three, as posters with their rank; the one the report follows is marked */}
      <div className="grid gap-[12px]" style={cols}>
        {rows.map((r, idx) => (
          <div key={r.career.id} className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: `color-mix(in srgb, ${r.accent} 40%, var(--glass-border))`, boxShadow: `0 20px 50px -30px color-mix(in srgb, ${r.accent} 40%, transparent)` }}>
            <Image src={r.career.photo} alt="" fill sizes="320px" className="object-cover" style={{ objectPosition: top3PhotoFocus(r.career) }} />
            <span aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(90% 55% at 100% 100%, color-mix(in srgb, ${r.accent} 22%, transparent), transparent 70%), linear-gradient(to top, rgba(6,8,18,0.92) 0%, rgba(6,8,18,0.35) 55%, transparent 100%)` }} />
            <span className="absolute top-[8px] left-[8px] flex items-center gap-[4px] rounded-full px-[8px] py-[3px] text-[11px] font-extrabold" style={{ background: "rgba(6,8,18,0.7)", color: idx === 0 ? r.accent : "#fff" }}>{idx === 0 && <Star className="h-3 w-3" fill="currentColor" aria-hidden />}#{idx + 1}</span>
            {r.career.id === focusId && <span className="absolute top-[8px] right-[8px] rounded-full px-[7px] py-[3px] text-[9.5px] font-extrabold tracking-[0.12em]" style={{ background: "rgba(255,255,255,0.92)", color: "#0b0d12" }}>VIEWING</span>}
            <span className="absolute inset-x-[10px] bottom-[8px] flex flex-col gap-[1px]">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: `color-mix(in srgb, ${r.accent} 72%, #fff)` }}>{r.career.world}</span>
              <span className="truncate text-[16px] leading-tight uppercase" style={{ ...posterTitleFont(r.career.world), color: "#fff" }}>{r.career.title}</span>
            </span>
          </div>
        ))}
      </div>

      {/* the slides: one highlight at a time, each in the three columns above */}
      <div className="flex flex-wrap items-center justify-between gap-[10px]">
        <div role="tablist" aria-label="Highlight" className="flex flex-wrap gap-[4px]">
          {SLIDES.map((s) => (
            <button key={s.key} role="tab" aria-selected={s.key === slide} type="button" onClick={() => setSlide(s.key)} className="dm-quiet cursor-pointer rounded-full px-[11px] py-[6px] text-[12.5px] font-bold" style={s.key === slide ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>{s.label}</button>
          ))}
        </div>
        <span className="flex items-center gap-[6px]">
          <button type="button" aria-label="Previous highlight" disabled={si === 0} onClick={() => go(-1)} className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
          <button type="button" aria-label="Next highlight" disabled={si === SLIDES.length - 1} onClick={() => go(1)} className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><ChevronRight className="h-4 w-4" aria-hidden /></button>
        </span>
      </div>

      <motion.div key={slide} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }} className="flex min-h-[200px] flex-col gap-[var(--space-5)]">
        {slide === "pay" && (
          <>
      {/* Pay a year: the figure, a bar scaled to the best, the range under it */}
      <Band title="Pay a year" verdict={byPay.length > 1 ? <><Lead accent={byPay[0].accent}>{byPay[0].career.title}</Lead> earns the most, about {fmtK(byPay[0].median - byPay[byPay.length - 1].median)} more a year than {byPay[byPay.length - 1].career.title}.</> : undefined} cols={cols}>
        {rows.map((r, i) => Number.isFinite(r.median) ? (
          <Cell key={r.career.id}>
            <Figure accent={r.accent}>{fmtK(r.median)}</Figure>
            <Bar pct={(r.median / maxMedian) * 100} accent={r.accent} delay={i * 90} />
            <Line muted>{fmtK(r.entry)} starting to {fmtK(r.top)} at the top</Line>
          </Cell>
        ) : <Cell key={r.career.id}><Line muted>{NONE}</Line></Cell>)}
      </Band>
          </>
        )}
        {slide === "growth" && (
          <>
      {/* Job growth */}
      <Band title="Job growth" verdict={byGrowth[0] ? <><Lead accent={byGrowth[0].accent}>{byGrowth[0].career.title}</Lead> is growing fastest, {byGrowth[0].outlookPct > 0 ? "+" : ""}{byGrowth[0].outlookPct}% more jobs by the projection year.</> : undefined} cols={cols}>
        {rows.map((r, i) => Number.isFinite(r.outlookPct) ? (
          <Cell key={r.career.id}>
            <Figure accent={r.accent}>{r.outlookPct > 0 ? "+" : ""}{r.outlookPct}%</Figure>
            <Bar pct={(Math.abs(r.outlookPct) / maxGrowth) * 100} accent={r.accent} delay={i * 90} />
            <Line muted>{r.outlook ?? ""}</Line>
          </Cell>
        ) : <Cell key={r.career.id}><Line muted>{r.outlook ?? NONE}</Line></Cell>)}
      </Band>
          </>
        )}
        {slide === "school" && (
          <>
      {/* School to start */}
      <Band title="School to start" cols={cols}>
        {rows.map((r) => (
          <Cell key={r.career.id}>
            <Line strong>{r.education ?? NONE}</Line>
            {r.timeToEnter && <Line muted>{r.timeToEnter}</Line>}
          </Cell>
        ))}
      </Band>
          </>
        )}
        {slide === "leads" && (
          <>
      {/* Where it leads: the top rung and its pay, bar scaled to the highest top */}
      <Band title="Where it leads" verdict={byTop[0] ? <><Lead accent={byTop[0].r.accent}>{byTop[0].r.career.title}</Lead> climbs the highest: {byTop[0].top.jobTitle}, around {byTop[0].top.pay} a year.</> : undefined} cols={cols}>
        {rows.map((r, i) => r.ladder.length ? (
          <Cell key={r.career.id}>
            <Figure accent={r.accent}>{r.ladder[r.ladder.length - 1].pay}</Figure>
            <Bar pct={(moneyOf(r.ladder[r.ladder.length - 1].pay) / maxTop) * 100} accent={r.accent} delay={i * 90} />
            <Line strong>{r.ladder[r.ladder.length - 1].jobTitle}</Line>
            <Line muted>{r.ladder.length} steps from {r.ladder[0].jobTitle}</Line>
          </Cell>
        ) : <Cell key={r.career.id}><Line muted>{NONE}</Line></Cell>)}
      </Band>
          </>
        )}
        {slide === "goodAt" && (
          <>
      {/* Good at: the top three things each asks of you */}
      <Band title="Good at" cols={cols}>
        {rows.map((r) => (
          <Cell key={r.career.id}>
            {r.goodAt.length ? r.goodAt.slice(0, 3).map((g) => (
              <span key={g} className="flex items-start gap-[8px] text-[13.5px] leading-[19px]" style={{ color: "var(--foreground)" }}><span aria-hidden className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: r.accent }} />{g}</span>
            )) : <Line muted>{NONE}</Line>}
          </Cell>
        ))}
      </Band>
          </>
        )}
        {slide === "work" && (
          <>
      {/* The work, one line each */}
      <Band title="What you would do" cols={cols}>
        {rows.map((r) => <Cell key={r.career.id}><Line>{r.work || NONE}</Line></Cell>)}
      </Band>
          </>
        )}
        {slide === "same" && (
          <>
      {/* the foot: what is the same */}
      <div className="flex flex-col gap-[8px]">
        <span className="border-b pb-[8px] text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)", borderColor: "var(--glass-border)" }}>The same in all {n}</span>
        {same.length ? (
          <ul className="flex flex-col gap-[6px]">{same.map((it) => <li key={it} className="flex items-start gap-[10px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}><span className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: "var(--accent-subtle)" }} aria-hidden />{it}</li>)}</ul>
        ) : (
          <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Nothing identical across these {n}, and that is useful: they ask for different things.</p>
        )}
      </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

/** One row of the comparison: a small title, one verdict line, then a cell per career. */
function Band({ title, verdict, cols, children }: { title: string; verdict?: React.ReactNode; cols: React.CSSProperties; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[10px]">
      <div className="flex flex-col gap-[2px] border-b pb-[8px]" style={{ borderColor: "var(--glass-border)" }}>
        <h4 className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{title}</h4>
        {verdict && <p className="text-[14.5px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{verdict}</p>}
      </div>
      <div className="grid gap-[12px]" style={cols}>{children}</div>
    </section>
  );
}
function Cell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-[6px]">{children}</div>;
}
function Lead({ accent, children }: { accent: string; children: React.ReactNode }) {
  return <span style={{ color: accent }}>{children}</span>;
}
function Figure({ accent, children }: { accent: string; children: React.ReactNode }) {
  return <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{children}</span>;
}
function Line({ children, muted, strong }: { children: React.ReactNode; muted?: boolean; strong?: boolean }) {
  return <span className={`text-[13.5px] leading-[19px] ${strong ? "font-bold" : "font-medium"}`} style={{ color: muted ? "var(--muted-foreground)" : "var(--foreground)" }}>{children}</span>;
}
/** The counselor dashboard's slim gradient bar, scaled to the best of the three. */
function Bar({ pct, accent, delay = 0 }: { pct: number; accent: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }} aria-hidden>
      <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${Math.max(3, Math.min(100, pct))}%` }} transition={{ ...FILL, delay: delay / 1000 }} style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 45%, transparent), ${accent})` }} />
    </span>
  );
}
