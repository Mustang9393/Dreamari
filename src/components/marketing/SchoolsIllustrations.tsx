"use client";

import Image from "next/image";
import { ArrowRight, Briefcase, Check, GraduationCap, MessageSquare, Sparkles, Target, ThumbsUp, Users, Waypoints, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { CompanyChip } from "@/components/connect/primitives";
import { PROS, THREADS } from "@/components/connect/data";
import { IB_LEVEL_1 } from "@/components/play/ib-level-1";
import { PROFILE_CAREERS } from "@/components/profile/data";

// ---------------------------------------------------------------------------
// Illustrations for the Schools page, drawn from scratch for the light page
// (11 Sept 2026: "start entirely from scratch, generate new graphics"). Each
// is a purpose-built composition in HTML/CSS with one fixed, bright palette:
// no app components, no dark token scope, no screenshots. The content inside
// is the product's real content (career titles, pay, the simulation's first
// question, a real Connect thread, the student's plan) so nothing is
// invented where the app has the fact; where a screen does not exist yet
// (the educator dashboard) the composition is labelled Illustrative preview,
// the reference site's own label.
// ---------------------------------------------------------------------------

export const INK = "#05070f";
export const INK2 = "#4a4f6d";
export const LINE = "rgba(5,7,15,0.08)";
export const SOFT = "#f4f6fd";
export const BLUE = "#2f6bf2";
export const VIOLET = "#7d5cff";
export const AMBER = "#f0b429";
export const GREEN = "#22c55e";
export const TEAL = "#14b8a6";
export const ROSE = "#f43f5e";
export const CYAN = "#06b6d4";
export const RED = "#ef4444";

export const PANEL_SHADOW = "0 40px 80px -36px rgba(5,7,15,0.28), 0 2px 6px -2px rgba(5,7,15,0.1)";
const TILE_SHADOW = "0 18px 40px -22px rgba(5,7,15,0.25), 0 1px 3px -1px rgba(5,7,15,0.08)";

const POSTERS = {
  ib: "/images/app/poster-investment-banking-v3.webp",
  pe: "/images/app/poster-private-equity.webp",
  swe: "/images/app/poster-software-engineer.webp",
  nurse: "/images/app/poster-nurse-anesthetist.webp",
};

const EASE = [0.22, 1, 0.36, 1] as const;
/** Rise-and-fade for a group's children, staggered; plays once when in view. */
const rise = { hidden: { opacity: 0, y: 28 }, show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: i * 0.12 } }) };
const VIEW = { once: true, amount: 0.3 } as const;

/** Blue-to-violet gradient type, the page's one display flourish. */
export function Grad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={className} style={{ backgroundImage: `linear-gradient(92deg, ${BLUE} 0%, ${VIOLET} 55%, #a855f7 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Designs are laid out at a fixed width and zoomed to fit their column. */
function Fit({ base, children, className = "" }: { base: number; children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-full ${className}`} style={{ containerType: "inline-size" }}>
      <div className="mx-auto" style={{ width: base, zoom: `clamp(0.5, calc(100cqw / ${base}px), 1)` }}>
        {children}
      </div>
    </div>
  );
}

/** The stage a composition sits on: white, 28px corners, one soft shadow. */
export function Panel({ children, className = "", style, label = true }: { children: ReactNode; className?: string; style?: CSSProperties; label?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] border ${className}`} style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(246,247,253,0.92) 100%)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.7)", boxShadow: `${PANEL_SHADOW}, inset 0 1px 0 rgba(255,255,255,0.9)`, ...style }}>
      {label && (
        <span className="pointer-events-none absolute top-5 right-6 z-10 flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.14em] uppercase" style={{ color: "rgba(74,79,109,0.7)" }}>
          <Sparkles className="h-3 w-3" strokeWidth={2.5} aria-hidden /> Illustrative preview
        </span>
      )}
      {children}
    </div>
  );
}

function Tile({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`rounded-[20px] border bg-white ${className}`} style={{ borderColor: LINE, boxShadow: TILE_SHADOW, ...style }}>
      {children}
    </div>
  );
}

function Caps({ children, color = INK2 }: { children: ReactNode; color?: string }) {
  return <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color }}>{children}</p>;
}

function Pill({ children, tone = "soft", style }: { children: ReactNode; tone?: "soft" | "blue" | "green" | "ink"; style?: CSSProperties }) {
  const tones: Record<string, CSSProperties> = {
    soft: { background: SOFT, color: INK, border: `1px solid ${LINE}` },
    blue: { background: BLUE, color: "#fff" },
    green: { background: "#dcfce7", color: "#166534" },
    ink: { background: INK, color: "#fff" },
  };
  return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold whitespace-nowrap" style={{ ...tones[tone], ...style }}>{children}</span>;
}

function Initials({ name, size = 36, from = BLUE, to = VIOLET }: { name: string; size?: number; from?: string; to?: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <span className="inline-flex flex-none items-center justify-center rounded-full font-extrabold text-white" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {initials}
    </span>
  );
}

function Verified({ size = 14 }: { size?: number }) {
  return (
    <span className="inline-flex flex-none items-center justify-center rounded-full" style={{ width: size, height: size, background: BLUE }}>
      <Check style={{ width: size * 0.62, height: size * 0.62 }} strokeWidth={3.5} color="#fff" aria-hidden />
    </span>
  );
}

function Poster({ src, title, world, className = "", style }: { src: string; title: string; world: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative overflow-hidden rounded-[18px] ${className}`} style={{ boxShadow: TILE_SHADOW, ...style }}>
      <Image src={src} alt="" fill sizes="400px" className="object-cover" />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,7,15,0.82) 0%, rgba(5,7,15,0.25) 45%, transparent 70%)" }} />
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
        <span className="text-[17px] leading-[20px] font-extrabold tracking-[-0.01em] text-white" style={{ textWrap: "balance" }}>{title}</span>
        <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: AMBER }}>{world}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Hero: three things a student gets, side by side. Career, Match, Connect.
// ---------------------------------------------------------------------------

export function HeroIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const yB = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yC = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const thread = THREADS.find((t) => t.id === "t-ib-hours") ?? THREADS[0];
  const answer = thread.responses.find((r) => r.kind === "answer" && r.primary);
  const pro = PROS.find((p) => answer?.kind === "answer" && p.id === answer.proId) ?? PROS[0];
  const top3 = PROFILE_CAREERS.slice(0, 3).map((c) => c.title);
  return (
    <Fit base={1040}>
        <div ref={ref} role="img" aria-label={`Three cards: the Investment Banker career with typical pay $361,000 a year; the student's Top 3 with ${top3[0]} as the strongest match; ${pro.name}, ${pro.role} at ${pro.org}, answering a student's question.`} className="grid grid-cols-3 items-end gap-7 px-2 pt-6 pb-4">
          {/* career */}
          <motion.div style={{ y: yA }} variants={rise} custom={0} initial="hidden" whileInView="show" viewport={VIEW}>
          <Tile className="overflow-hidden">
            <Poster src={POSTERS.ib} title="Investment Banker" world="Business & Money" className="aspect-[4/3] rounded-b-none" style={{ boxShadow: "none" }} />
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="flex flex-col gap-0.5"><Caps>Typical pay</Caps><span className="text-[17px] font-extrabold tabular-nums" style={{ color: INK }}>$361,000<span className="text-[12px] font-bold" style={{ color: INK2 }}>/year</span></span></div>
              <div className="flex flex-col gap-0.5"><Caps>Typical degree</Caps><span className="text-[17px] font-extrabold" style={{ color: INK }}>Bachelor&apos;s</span></div>
            </div>
          </Tile>
          </motion.div>
          {/* Top 3 */}
          <motion.div style={{ y: yB }} variants={rise} custom={1} initial="hidden" whileInView="show" viewport={VIEW} className="-translate-y-[18px]">
          <Tile className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-extrabold" style={{ color: INK }}>My Top 3</span>
              <span className="flex gap-1.5">{[true, true, true].map((f, i) => <span key={i} className="size-3 rounded-full" style={{ background: f ? AMBER : "transparent", boxShadow: `inset 0 0 0 2px ${f ? AMBER : "rgba(5,7,15,0.18)"}` }} />)}</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {top3.map((t, i) => (
                <li key={t} className="flex items-center gap-3 rounded-[14px] px-3.5 py-3" style={{ background: i === 0 ? "#eaf0ff" : SOFT }}>
                  <span className="flex size-6 flex-none items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: i === 0 ? BLUE : "#dfe3f0", color: i === 0 ? "#fff" : INK2 }}>{i + 1}</span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-bold" style={{ color: INK }}>{t}</span>
                    {i === 0 && <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: BLUE }}>Your Strongest Match</span>}
                  </span>
                </li>
              ))}
            </ul>
            <span className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[13px] font-bold" style={{ background: INK, color: "#fff" }}>Compare My Top 3</span>
          </Tile>
          </motion.div>
          {/* connect */}
          <motion.div style={{ y: yC }} variants={rise} custom={2} initial="hidden" whileInView="show" viewport={VIEW}>
          <Tile className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <Initials name={pro.name} size={44} from={VIOLET} to={ROSE} />
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1.5 text-[15px] font-extrabold" style={{ color: INK }}><span className="truncate">{pro.name}</span><Verified /></span>
                <span className="truncate text-[12.5px] font-semibold" style={{ color: INK2 }}>{pro.role}</span>
              </span>
            </div>
            <span className="marketing-v2 theme-light self-start"><CompanyChip name={pro.org} tone="surface" size="sm" /></span>
            <p className="text-[13.5px] leading-[20px] font-medium" style={{ color: INK }}>&ldquo;{thread.title}&rdquo;</p>
            <p className="line-clamp-3 text-[13px] leading-[19px]" style={{ color: INK2 }}>{answer?.kind === "answer" ? answer.body : ""}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-[10px] px-4 py-2 text-[12.5px] font-bold text-white" style={{ background: BLUE }}>Ask a question <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /></span>
          </Tile>
          </motion.div>
        </div>
    </Fit>
  );
}

// ---------------------------------------------------------------------------
// 2. Audiences and 4. Educators: drawn on the counselor dashboard prototype
// (web-app-prototype-maishak.replit.app, 11 Sept 2026). Its vocabulary, kept
// exactly: Student Status (On Track / Needs Attention / At Risk),
// Postsecondary Plans (With Plan / Undecided), Career Pathways, Roadmap %,
// milestone review states (Approved / Pending Review / Changes Requested /
// In Progress / Not Started), the Review Queue, Student Progress reports by
// grade, and Career + College Insights. Figures are the prototype's sample
// data; the panel label says Illustrative preview.
// ---------------------------------------------------------------------------

const ON_TRACK = GREEN;
const ATTENTION = AMBER;
const AT_RISK = ROSE;

function StatusChip({ status }: { status: "On Track" | "Needs Attention" | "At Risk" }) {
  const tone = status === "On Track" ? ON_TRACK : status === "Needs Attention" ? ATTENTION : AT_RISK;
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${tone} 14%, white)`, color: `color-mix(in srgb, ${tone} 65%, ${INK})` }}><span className="size-1.5 rounded-full" style={{ background: tone }} />{status}</span>;
}

type ReviewState = "Approved" | "Pending Review" | "Changes Requested" | "In Progress" | "Not Started";
function ReviewChip({ state }: { state: ReviewState }) {
  const tone = state === "Approved" ? GREEN : state === "Pending Review" ? VIOLET : state === "Changes Requested" ? ROSE : state === "In Progress" ? BLUE : INK2;
  return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${tone} 12%, white)`, color: `color-mix(in srgb, ${tone} 70%, ${INK})` }}>{state}</span>;
}

/** Multi-segment ring, drawn in when in view. */
function Donut({ segments, size = 120, stroke = 14, children }: { segments: { value: number; color: string }[]; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((n, seg) => n + seg.value, 0);
  // precomputed start offsets, so nothing is reassigned during render
  const starts = segments.reduce<number[]>((acc, seg, i) => [...acc, (acc[i - 1] ?? 0) + (i === 0 ? 0 : (segments[i - 1].value / total) * c)], []);
  return (
    <span className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(5,7,15,0.06)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * c;
          return <motion.circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seg.color} strokeWidth={stroke} strokeLinecap="round" initial={{ strokeDasharray: `0 ${c}` }} whileInView={{ strokeDasharray: `${Math.max(0, len - 3)} ${c}` }} viewport={VIEW} transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.1 }} strokeDashoffset={-starts[i]} />;
        })}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </span>
  );
}

function OrgHead({ title, note, right }: { title: string; note: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex flex-col"><span className="text-[18px] font-extrabold tracking-[-0.01em]" style={{ color: INK }}>{title}</span><span className="text-[12.5px] font-semibold" style={{ color: INK2 }}>{note}</span></span>
      {right}
    </div>
  );
}

// Schools: the counselor's caseload, the Students page.
const TABLE_COLS = "184px 44px 112px 132px minmax(140px,1fr)";
const CASELOAD = [
  { name: "Emma Rodriguez", grade: 12, track: "Technology", roadmap: 92, status: "On Track", report: "Approved" },
  { name: "Marcus Thompson", grade: 11, track: "Healthcare", roadmap: 78, status: "On Track", report: "Approved" },
  { name: "Olivia Chen", grade: 11, track: "Arts & Media", roadmap: 55, status: "Needs Attention", report: "Changes Requested" },
  { name: "Jamal Washington", grade: 9, track: "Technology", roadmap: 42, status: "On Track", report: "Pending Review" },
  { name: "Charlotte Davis", grade: 12, track: "Law & Government", roadmap: 32, status: "At Risk", report: "Not Started" },
] as const;

export function SchoolIllustration() {
  return (
    <Panel>
      <Fit base={700}>
        <div role="img" aria-label="Students: the counselor's caseload at Lincoln High School, 120 students, each with grade, roadmap percent, status and Career Report review state." className="flex flex-col gap-5 px-7 pt-14 pb-7">
          <OrgHead title="Students" note="Lincoln High School · 120 students" right={<Pill>All grades</Pill>} />
          <div className="grid gap-x-3 px-3 text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ gridTemplateColumns: TABLE_COLS, color: INK2 }}>
            <span>Student</span><span>Grade</span><span>Roadmap</span><span>Status</span><span>Career Report</span>
          </div>
          <ul className="flex flex-col divide-y rounded-[16px] border" style={{ borderColor: LINE }}>
            {CASELOAD.map((st, i) => (
              <motion.li key={st.name} className="grid items-center gap-x-3 px-3 py-3" style={{ gridTemplateColumns: TABLE_COLS, borderColor: LINE }} variants={rise} custom={i * 0.6} initial="hidden" whileInView="show" viewport={VIEW}>
                <span className="flex min-w-0 items-center gap-2.5"><Initials name={st.name} size={28} from={i % 2 ? TEAL : BLUE} to={i % 2 ? BLUE : VIOLET} /><span className="flex min-w-0 flex-col"><span className="truncate text-[13px] font-bold" style={{ color: INK }}>{st.name}</span><span className="truncate text-[11px] font-semibold" style={{ color: INK2 }}>{st.track}</span></span></span>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: INK }}>{st.grade}</span>
                <span className="flex items-center gap-2"><span className="h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(5,7,15,0.06)" }}><motion.span className="block h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${st.roadmap}%` }} viewport={VIEW} transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.08 }} style={{ background: BLUE }} /></span><span className="w-[34px] text-right text-[12px] font-bold tabular-nums" style={{ color: INK }}>{st.roadmap}%</span></span>
                <span><StatusChip status={st.status} /></span>
                <span><ReviewChip state={st.report} /></span>
              </motion.li>
            ))}
          </ul>
        </div>
      </Fit>
    </Panel>
  );
}

// School Districts: Student Progress, the summary by grade with export.
const BY_GRADE = [
  { grade: "Grade 9", total: 30, onTrack: 27, attention: 2, risk: 1 },
  { grade: "Grade 10", total: 30, onTrack: 27, attention: 2, risk: 1 },
  { grade: "Grade 11", total: 30, onTrack: 23, attention: 6, risk: 1 },
  { grade: "Grade 12", total: 30, onTrack: 26, attention: 1, risk: 3 },
];

export function DistrictIllustration() {
  return (
    <Panel>
      <Fit base={600}>
        <div role="img" aria-label="Student Progress: summary by grade for Lincoln High School, 120 students, 103 on track, 11 needing attention, 6 at risk, exportable as CSV or PDF." className="flex flex-col gap-5 px-7 pt-14 pb-7">
          <OrgHead title="Student Progress" note="Lincoln High School · 2023-2024" right={<span className="flex gap-1.5"><Pill>CSV</Pill><Pill>PDF</Pill></span>} />
          <span className="text-[13px] font-bold" style={{ color: INK }}>Summary by grade</span>
          <ul className="flex flex-col gap-3">
            {BY_GRADE.map((g, i) => (
              <li key={g.grade} className="grid items-center gap-4" style={{ gridTemplateColumns: "80px 1fr 110px" }}>
                <span className="text-[13px] font-bold" style={{ color: INK }}>{g.grade}</span>
                <span className="flex h-[14px] overflow-hidden rounded-full" style={{ background: "rgba(5,7,15,0.06)" }}>
                  {[[g.onTrack, ON_TRACK], [g.attention, ATTENTION], [g.risk, AT_RISK]].map(([n, color], j) => (
                    <motion.span key={j} className="block h-full" initial={{ width: 0 }} whileInView={{ width: `${(Number(n) / g.total) * 100}%` }} viewport={VIEW} transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.08 + j * 0.05 }} style={{ background: color as string }} />
                  ))}
                </span>
                <span className="text-right text-[12px] font-semibold tabular-nums" style={{ color: INK2 }}>{g.onTrack} · {g.attention} · {g.risk}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4 border-t pt-4 text-[12px] font-semibold" style={{ borderColor: LINE, color: INK2 }}>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: ON_TRACK }} />On Track 103</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: ATTENTION }} />Needs Attention 11</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: AT_RISK }} />At Risk 6</span>
            <span className="ml-auto font-bold" style={{ color: INK }}>120 students</span>
          </div>
        </div>
      </Fit>
    </Panel>
  );
}

// Nonprofits: Career + College Insights, the recommendation that turns what
// students save into a real-world connection.
export function NonprofitIllustration() {
  const actions = [
    "Invite an investment banking professional or Wall Street firm representative to your school for a career talk",
    "Schedule a visit to a financial district campus, trading floor, or investment firm",
    "Explore a CTE Finance & Business pathway or dual-enrollment finance course",
  ];
  return (
    <Panel>
      <Fit base={600}>
        <div role="img" aria-label="Career + College Insights: 43% of students have saved Investment Banker as a top career, with three recommended actions, and the top saved careers." className="flex flex-col gap-5 px-7 pt-14 pb-7">
          <OrgHead title="Career + College Insights" note="What students are exploring, saving, and aspiring toward" />
          <div className="rounded-[18px] p-5" style={{ background: "linear-gradient(135deg, #eef1ff, #f6f0ff)" }}>
            <Caps color={VIOLET}>Dreamari recommendation</Caps>
            <p className="mt-2 text-[17px] leading-[23px] font-extrabold tracking-[-0.01em]" style={{ color: INK }}>43% of students have saved Investment Banker as a top career</p>
            <ul className="mt-3 flex flex-col gap-2">
              {actions.map((t, i) => (
                <motion.li key={t} className="flex gap-2.5 text-[13px] leading-[19px] font-medium" style={{ color: INK }} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={VIEW}>
                  <span className="mt-[7px] size-1.5 flex-none rounded-full" style={{ background: VIOLET }} />{t}
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-[13px] font-bold" style={{ color: INK }}>Top saved careers</span>
            <ul className="mt-2 flex flex-col gap-2">
              {[["Investment Banker", 52, AMBER], ["Software Engineer", 47, "#6366f1"], ["Entrepreneur / Business Owner", 38, VIOLET], ["Registered Nurse", 35, TEAL]].map(([label, n, color], i) => (
                <li key={String(label)} className="grid items-center gap-3" style={{ gridTemplateColumns: "190px 1fr 28px" }}>
                  <span className="truncate text-[12.5px] font-semibold" style={{ color: INK }}>{label}</span>
                  <span className="h-[8px] overflow-hidden rounded-full" style={{ background: "rgba(5,7,15,0.06)" }}><motion.span className="block h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${(Number(n) / 52) * 100}%` }} viewport={VIEW} transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.08 }} style={{ background: color as string }} /></span>
                  <span className="text-right text-[12px] font-bold tabular-nums" style={{ color: INK2 }}>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Fit>
    </Panel>
  );
}

// Educational institutions: what students save next, majors and colleges.
const TOP_MAJORS = [["Computer Science", 41], ["Business Administration", 36], ["Nursing / Health Sciences", 33], ["Psychology", 29], ["Criminal Justice", 24]] as const;
const TOP_COLLEGES = [["UCLA", 28], ["Howard University", 24], ["New York University", 22], ["UT Austin", 19], ["Spelman College", 17]] as const;

function RankList({ title, rows }: { title: string; rows: readonly (readonly [string, number])[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-bold" style={{ color: INK }}>{title}</span>
      <ol className="flex flex-col divide-y rounded-[16px] border" style={{ borderColor: LINE }}>
        {rows.map(([label, n], i) => (
          <motion.li key={label} className="flex items-center gap-3 px-3.5 py-2.5" style={{ borderColor: LINE }} variants={rise} custom={i * 0.5} initial="hidden" whileInView="show" viewport={VIEW}>
            <span className="flex size-6 flex-none items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: i === 0 ? BLUE : SOFT, color: i === 0 ? "#fff" : INK2 }}>{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: INK }}>{label}</span>
            <span className="text-[12.5px] font-bold tabular-nums" style={{ color: INK2 }}>{n}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function InstitutionIllustration() {
  return (
    <Panel>
      <Fit base={600}>
        <div role="img" aria-label="Career + College Insights: top saved majors led by Computer Science and Business Administration, and top saved colleges led by UCLA and Howard University." className="flex flex-col gap-5 px-7 pt-14 pb-7">
          <OrgHead title="Career + College Insights" note="Most popular majors and colleges saved by students" />
          <div className="grid grid-cols-2 gap-4">
            <RankList title="Top saved majors" rows={TOP_MAJORS} />
            <RankList title="Top saved colleges" rows={TOP_COLLEGES} />
          </div>
        </div>
      </Fit>
    </Panel>
  );
}

/** One composition per audience tab. */
export function AudienceIllustration({ audience }: { audience: string }) {
  if (audience === "School Districts") return <DistrictIllustration />;
  if (audience === "Nonprofits") return <NonprofitIllustration />;
  if (audience === "Educational Institutions") return <InstitutionIllustration />;
  return <SchoolIllustration />;
}

// ---------------------------------------------------------------------------
// 3. The five stages, one composition each.
// ---------------------------------------------------------------------------

const BUILD_WORLDS: { label: string; color: string; on?: boolean }[] = [
  { label: "Business & Money", color: AMBER, on: true },
  { label: "Tech & Engineering", color: "#6366f1", on: true },
  { label: "Health & Medicine", color: TEAL },
  { label: "Arts, Media & Sport", color: ROSE },
  { label: "Science & Research", color: CYAN },
  { label: "Law, Safety & Justice", color: RED },
];

export function BuildIllustration() {
  return (
    <Panel label={false}>
      <Fit base={520}>
        <div role="img" aria-label="Build: What sounds interesting? Choose up to 2. Business & Money and Tech & Engineering are chosen from six career worlds shown. 13% complete." className="flex flex-col gap-5 p-7">
          <div className="flex items-center justify-between gap-4">
            <Caps color={BLUE}>Build</Caps>
            <span className="flex items-center gap-2 text-[12px] font-bold tabular-nums" style={{ color: INK2 }}><span className="h-[6px] w-[120px] overflow-hidden rounded-full" style={{ background: "rgba(5,7,15,0.08)" }}><span className="block h-full w-[13%] rounded-full" style={{ background: BLUE }} /></span>13% complete</span>
          </div>
          <div className="flex items-center gap-4">
            <Image src="/images/dreamy/v2/dreamy-curious.png" alt="" width={144} height={144} className="size-[72px] flex-none object-contain" />
            <div><p className="text-[24px] leading-[28px] font-extrabold tracking-[-0.015em]" style={{ color: INK }}>What sounds interesting?</p><p className="mt-1 text-[13.5px] font-semibold" style={{ color: INK2 }}>Choose up to 2</p></div>
          </div>
          <ul className="grid grid-cols-2 gap-2.5">
            {BUILD_WORLDS.map((w) => (
              <li key={w.label} className="flex items-center gap-2.5 rounded-[14px] border px-3.5 py-3 text-[13.5px] font-bold" style={w.on ? { background: `color-mix(in srgb, ${w.color} 14%, white)`, borderColor: `color-mix(in srgb, ${w.color} 55%, white)`, color: INK } : { background: "#fff", borderColor: LINE, color: INK }}>
                <span className="size-2.5 flex-none rounded-full" style={{ background: w.color }} />
                <span className="truncate">{w.label}</span>
                {w.on && <Check className="ml-auto h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: w.color }} />}
              </li>
            ))}
          </ul>
          <p className="text-[11.5px] font-semibold" style={{ color: INK2 }}>Harvard FAS Mignone + O*NET Interest Profiler</p>
        </div>
      </Fit>
    </Panel>
  );
}

export function MatchIllustration() {
  return (
    <Fit base={300}>
        <div role="img" aria-label="Match: Find your Top 3, one of three slots filled. The card shows Investment Banker, hired by JPMorgan Chase and Goldman Sachs, $361K median salary, with Pass and Like buttons." className="flex flex-col items-center gap-5 p-2">
          <div className="flex w-full items-center justify-between">
            <span className="text-[15px] font-extrabold" style={{ color: INK }}>Find your Top 3</span>
            <span className="flex gap-1.5">{[true, false, false].map((f, i) => <span key={i} className="size-3.5 rounded-full" style={{ background: f ? AMBER : "transparent", boxShadow: `inset 0 0 0 2px ${f ? AMBER : "rgba(5,7,15,0.18)"}` }} />)}</span>
          </div>
          <motion.div className="relative h-[330px] w-[250px]" animate={{ y: [0, -6, 0], rotate: [0, -0.6, 0] }} transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}>
            <span aria-hidden className="absolute inset-0 rounded-[22px]" style={{ transform: "translateY(-14px) scale(0.94)", background: "#dfe3f0" }} />
            <div className="absolute inset-0 overflow-hidden rounded-[22px]" style={{ boxShadow: TILE_SHADOW }}>
              <Image src={POSTERS.ib} alt="" fill sizes="500px" className="object-cover" />
              <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,7,15,0.85) 0%, rgba(5,7,15,0.2) 45%, transparent 65%), linear-gradient(to bottom, rgba(5,7,15,0.45), transparent 30%)" }} />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
                <span className="truncate rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white" style={{ background: "rgba(5,7,15,0.55)" }}>JPMorgan Chase · Goldman Sachs</span>
                <span className="flex-none rounded-full px-2.5 py-1 text-[10.5px] font-bold" style={{ background: "#dcfce7", color: "#166534" }}>$361K median</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                <span className="text-[22px] leading-[24px] font-extrabold tracking-[-0.01em] text-white">Investment Banker</span>
                <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: AMBER }}>Business &amp; Money</span>
              </div>
            </div>
          </motion.div>
          <div className="flex items-center gap-5">
            <span className="flex size-12 items-center justify-center rounded-full border bg-white" style={{ borderColor: LINE, color: INK, boxShadow: TILE_SHADOW }}><X className="h-5 w-5" strokeWidth={2.5} aria-hidden /></span>
            <span className="flex size-12 items-center justify-center rounded-full text-white" style={{ background: BLUE, boxShadow: "0 12px 26px -10px rgba(47,107,242,0.7)" }}><ThumbsUp className="h-5 w-5" strokeWidth={2.5} aria-hidden /></span>
          </div>
        </div>
    </Fit>
  );
}

export function ExploreIllustration() {
  const pills = ["All", "Business & Money", "Tech & Engineering", "Health & Medicine"];
  const cards = [
    { src: POSTERS.pe, title: "Private Equity", world: "Business & Money" },
    { src: POSTERS.swe, title: "Software Engineer", world: "Tech & Engineering" },
    { src: POSTERS.nurse, title: "Nurse Anesthetist", world: "Health & Medicine" },
  ];
  return (
    <Fit base={560}>
        <div role="img" aria-label={`Explore: poster cards for ${cards.map((c) => c.title).join(", ")}, filtered by career world.`} className="flex flex-col gap-4 p-2">
          <div className="flex flex-wrap gap-2">{pills.map((p, i) => <Pill key={p} tone={i === 1 ? "blue" : "soft"}>{p}</Pill>)}</div>
          <p className="text-[19px] leading-[24px] font-extrabold tracking-[-0.01em]" style={{ color: INK }}>Careers you might not know</p>
          <div className="grid grid-cols-3 gap-3">
            {cards.map((c) => <Poster key={c.title} src={c.src} title={c.title} world={c.world} className="aspect-[3/4]" />)}
          </div>
        </div>
    </Fit>
  );
}

export function ImmerseIllustration() {
  const level = IB_LEVEL_1;
  const beat = level.beats.find((b) => b.id === "L1-08");
  const choice = beat?.kind === "choice" ? beat : null;
  return (
    <Panel label={false} className="aspect-[5/4]" style={{ background: INK }}>
      <Image src="/images/play/ib/locations/reception.webp" alt="" fill sizes="700px" className="object-cover" style={{ objectPosition: "50% 30%" }} />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,7,15,0.9) 0%, rgba(5,7,15,0.5) 45%, rgba(5,7,15,0.1) 75%)" }} />
      <div role="img" aria-label={`Investment Banker simulation, Level ${level.n} ${level.role}. ${choice?.question ?? "Day 1: What should you do first?"} ${choice?.choices.map((c) => c.label).join(", ") ?? ""}. The best answer is marked.`} className="absolute inset-0 flex flex-col justify-between p-6">
          <span className="self-start rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.08em] text-white uppercase" style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>Investment Banker · Level {level.n} · {level.role}</span>
          <Tile className="flex flex-col gap-3 p-5" style={{ borderColor: "transparent" }}>
            <Caps color={BLUE}>Intern · Week 1</Caps>
            <p className="text-[18px] leading-[23px] font-extrabold tracking-[-0.01em]" style={{ color: INK }}>{choice?.question ?? "Day 1: What should you do first?"}</p>
            <ul className="flex flex-col gap-2">
              {(choice?.choices ?? []).map((c, i) => {
                const best = c.tier === "best";
                return (
                  <li key={c.id} className="flex items-center gap-3 rounded-[12px] border px-3.5 py-2.5 text-[13.5px] font-semibold" style={best ? { background: "#dcfce7", borderColor: "#86efac", color: "#14532d" } : { background: "#fff", borderColor: LINE, color: INK }}>
                    <span className="flex size-6 flex-none items-center justify-center rounded-full text-[11px] font-extrabold" style={best ? { background: GREEN, color: "#fff" } : { background: SOFT, color: INK2 }}>{best ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden /> : i + 1}</span>
                    <span>{c.label}</span>
                  </li>
                );
              })}
            </ul>
          </Tile>
      </div>
    </Panel>
  );
}

export function ConnectIllustration() {
  const thread = THREADS.find((t) => t.id === "t-ib-hours") ?? THREADS[0];
  const answer = thread.responses.find((r) => r.kind === "answer" && r.primary);
  const pro = PROS.find((p) => answer?.kind === "answer" && p.id === answer.proId) ?? PROS[0];
  return (
    <Fit base={520}>
        <div role="img" aria-label={`Connect: in Finance Careers, ${thread.handle}, ${thread.grade}, asks '${thread.title}'. ${pro.name}, ${pro.role} at ${pro.org}, answers.`} className="flex flex-col gap-4 p-2">
          <div className="flex items-center justify-between gap-3">
            <span className="flex flex-col"><span className="text-[15px] font-extrabold" style={{ color: INK }}>Finance Careers</span><span className="text-[12px] font-semibold" style={{ color: INK2 }}>312 students · 61 professionals</span></span>
            <span className="marketing-v2 theme-light flex items-center gap-1.5"><CompanyChip name="JPMorgan Chase" tone="surface" size="sm" /><CompanyChip name="Goldman Sachs" tone="surface" size="sm" /><CompanyChip name="EY" tone="surface" size="sm" /></span>
          </div>
          <Tile className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2.5">
              <Initials name={thread.handle} size={30} from={TEAL} to={BLUE} />
              <span className="text-[13px] font-bold" style={{ color: INK }}>{thread.handle}</span>
              <span className="text-[12px] font-semibold" style={{ color: INK2 }}>· {thread.grade} · {thread.postedAgo}</span>
            </div>
            <p className="text-[16px] leading-[22px] font-extrabold tracking-[-0.01em]" style={{ color: INK }}>&ldquo;{thread.title}&rdquo;</p>
            <div className="flex items-center gap-4 text-[12px] font-semibold" style={{ color: INK2 }}>
              <span className="flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {thread.helpful}</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" aria-hidden /> {thread.comments ?? thread.responses.length} comments</span>
            </div>
            <div className="flex flex-col gap-2 rounded-[14px] p-4" style={{ background: SOFT }}>
              <div className="flex items-center gap-2.5">
                <Initials name={pro.name} size={32} from={VIOLET} to={ROSE} />
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-extrabold" style={{ color: INK }}><span className="truncate">{pro.name}</span><Verified /></span>
                  <span className="truncate text-[12px] font-semibold" style={{ color: INK2 }}>{pro.role} · {pro.org}</span>
                </span>
              </div>
              <p className="line-clamp-3 text-[13px] leading-[19px]" style={{ color: INK }}>{answer?.kind === "answer" ? answer.body : ""}</p>
            </div>
          </Tile>
        </div>
    </Fit>
  );
}

// ---------------------------------------------------------------------------
// 4. Educators: the dashboard Overview and the Review Queue.
// ---------------------------------------------------------------------------

const QUEUE = [
  { name: "Marcus Thompson", grade: 11, item: "Resume Draft", priority: "Normal", state: "Pending Review", due: "Due Jan 20" },
  { name: "Jamal Washington", grade: 9, item: "Career Report", priority: "High", state: "Pending Review", due: "Due Jan 18" },
  { name: "Sophia Kim", grade: 12, item: "Financial Aid Documents", priority: "Urgent", state: "Pending Review", due: "Due Jan 15" },
  { name: "Olivia Chen", grade: 11, item: "Career Report, revised", priority: "Urgent", state: "In Progress", due: "Due Jan 12" },
] as const;

export function DashboardIllustration() {
  return (
    <Panel>
      <Fit base={640}>
        <div role="img" aria-label="Counselor dashboard Overview for Lincoln High School: Student Status 86% on track (103 on track, 11 need attention, 6 at risk); Postsecondary Plans, 79 with a plan and 41 undecided; and a Review Queue of student submissions awaiting approval." className="flex flex-col gap-5 px-7 pt-14 pb-7">
          <OrgHead title="Overview" note="Lincoln High School · 120 students" right={<Pill>All grades</Pill>} />
          <div className="grid grid-cols-2 gap-4">
            <Tile className="flex flex-col gap-4 p-5" style={{ boxShadow: "none" }}>
              <span className="text-[13.5px] font-extrabold" style={{ color: INK }}>Student Status</span>
              <div className="flex items-center gap-4">
                <Donut segments={[{ value: 103, color: ON_TRACK }, { value: 11, color: ATTENTION }, { value: 6, color: AT_RISK }]} size={104} stroke={12}>
                  <span className="flex flex-col items-center leading-none"><span className="text-[22px] font-extrabold tabular-nums tracking-[-0.02em]" style={{ color: INK }}>86%</span><span className="mt-1 text-[10px] font-semibold" style={{ color: INK2 }}>on track</span></span>
                </Donut>
                <ul className="flex min-w-0 flex-1 flex-col gap-1.5 text-[12px] font-semibold" style={{ color: INK }}>
                  <li className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: ON_TRACK }} />On Track <span className="ml-auto tabular-nums" style={{ color: INK2 }}>103</span></li>
                  <li className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: ATTENTION }} />Needs Attention <span className="ml-auto tabular-nums" style={{ color: INK2 }}>11</span></li>
                  <li className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: AT_RISK }} />At Risk <span className="ml-auto tabular-nums" style={{ color: INK2 }}>6</span></li>
                </ul>
              </div>
            </Tile>
            <Tile className="flex flex-col gap-4 p-5" style={{ boxShadow: "none" }}>
              <span className="text-[13.5px] font-extrabold" style={{ color: INK }}>Postsecondary Plans</span>
              <div className="flex items-center gap-4">
                <Donut segments={[{ value: 79, color: BLUE }, { value: 41, color: "#d9ddec" }]} size={104} stroke={12}>
                  <span className="flex flex-col items-center leading-none"><span className="text-[22px] font-extrabold tabular-nums tracking-[-0.02em]" style={{ color: INK }}>79</span><span className="mt-1 text-[10px] font-semibold" style={{ color: INK2 }}>have a plan</span></span>
                </Donut>
                <ul className="flex min-w-0 flex-1 flex-col gap-1.5 text-[12px] font-semibold" style={{ color: INK }}>
                  <li className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: BLUE }} />With Plan <span className="ml-auto tabular-nums" style={{ color: INK2 }}>79</span></li>
                  <li className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: "#d9ddec" }} />Undecided <span className="ml-auto tabular-nums" style={{ color: INK2 }}>41</span></li>
                </ul>
              </div>
            </Tile>
          </div>
          <Tile className="flex flex-col gap-3 p-5" style={{ boxShadow: "none" }}>
            <div className="flex items-center justify-between"><span className="text-[13.5px] font-extrabold" style={{ color: INK }}>Review Queue</span><span className="text-[12px] font-semibold" style={{ color: INK2 }}>Pending Reviews (15)</span></div>
            <ul className="flex flex-col divide-y" style={{ borderColor: LINE }}>
              {QUEUE.slice(0, 3).map((q, i) => (
                <motion.li key={q.name + q.item} className="grid items-center gap-3 py-2.5" style={{ gridTemplateColumns: "minmax(170px,1.4fr) minmax(0,1fr) auto auto" }} variants={rise} custom={i * 0.6} initial="hidden" whileInView="show" viewport={VIEW}>
                  <span className="flex min-w-0 items-center gap-2.5"><Initials name={q.name} size={28} from={i % 2 ? VIOLET : BLUE} to={i % 2 ? ROSE : VIOLET} /><span className="flex min-w-0 flex-col"><span className="truncate text-[13px] font-bold" style={{ color: INK }}>{q.name}</span><span className="text-[11px] font-semibold" style={{ color: INK2 }}>Grade {q.grade}</span></span></span>
                  <span className="flex min-w-0 flex-col"><span className="truncate text-[12.5px] font-semibold" style={{ color: INK }}>{q.item}</span><span className="text-[11px] font-bold" style={{ color: q.priority === "Urgent" ? AT_RISK : q.priority === "High" ? ATTENTION : INK2 }}>{q.priority}</span></span>
                  <span><ReviewChip state={q.state} /></span>
                  <span className="flex gap-1.5"><span className="rounded-[8px] px-2.5 py-1.5 text-[11px] font-bold text-white" style={{ background: GREEN }}>Approve</span><span className="rounded-[8px] border px-2.5 py-1.5 text-[11px] font-bold" style={{ borderColor: LINE, color: INK }}>Request Changes</span></span>
                </motion.li>
              ))}
            </ul>
          </Tile>
        </div>
      </Fit>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Skills ticker under the hero: the reference site's seven chips, looping.
// ---------------------------------------------------------------------------

const SKILLS: { label: string; Icon: typeof Sparkles }[] = [
  { label: "Personalized discovery", Icon: Sparkles },
  { label: "College & career pathways", Icon: GraduationCap },
  { label: "Day-in-the-life simulations", Icon: Briefcase },
  { label: "Critical thinking", Icon: Target },
  { label: "Decision-making", Icon: Waypoints },
  { label: "Communication & teamwork", Icon: MessageSquare },
  { label: "Professional connections", Icon: Users },
];

export function SkillsTicker() {
  const row = [...SKILLS, ...SKILLS];
  return (
    <div className="relative overflow-hidden border-y py-4" style={{ borderColor: "var(--border)", maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }} aria-label="What students build">
      <ul className="mkt-marquee flex w-max items-center gap-10 pr-10">
        {row.map(({ label, Icon }, i) => (
          <li key={`${label}-${i}`} aria-hidden={i >= SKILLS.length} className="flex flex-none items-center gap-2.5 text-[15px] font-semibold whitespace-nowrap" style={{ color: "var(--foreground)" }}>
            <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden style={{ color: "var(--primary)" }} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
