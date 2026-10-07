"use client";

// Explore > Trends (7 Oct 2026). The Replit's Career Intelligence ("In-Demand
// Careers by Industry": ten industries, each a top 10 ranked by demand with
// pay and growth, a career opening to a plain-words line, salary, education,
// major and growth), with the signals Chandu asked for on top: "counselors
// need to have information on trends and what's popular etc in which state
// and which industries". So: pick a state; the industries rank by openings
// there; the chosen industry lists its top 10; then what's rising fastest
// and what your own students are saving. The page's pathway switch applies.
// Pay is real (BLS OEWS by state); openings and growth come from payRows
// (DEMO-ONLY until state projections load); the plain-words line, degree and
// majors come from the career profiles.

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, TrendingUp } from "lucide-react";
import { WORLD_COLORS } from "@/components/app/worlds";
import { careerSlug } from "@/components/career/slug";
import { careerProfile } from "@/components/career/profiles";
import { Dropdown, Option } from "@/components/colleges/filterKit";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { schoolSnapshot, toV5 } from "@/lib/counselorV5";
import { US_STATES } from "@/lib/studentProfile";
import { payRows, type Pathway } from "./Explore";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const k = (n: number) => `$${Math.round(n / 1000)}K`;

function Title({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
      <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>
      {aside}
    </div>
  );
}

export function TrendsView({ path }: { path: Pathway }) {
  const [state, setState] = useState("New Jersey");
  const rows = useMemo(() => payRows(state, path === "trades"), [state, path]);
  // industries ranked by openings in the state
  const industries = useMemo(() => {
    const m = new Map<string, { openings: number; growth: number; n: number }>();
    for (const r of rows) {
      const x = m.get(r.career.world) ?? { openings: 0, growth: 0, n: 0 };
      m.set(r.career.world, { openings: x.openings + r.openings, growth: x.growth + r.growth, n: x.n + 1 });
    }
    return [...m.entries()].map(([world, x]) => ({ world, openings: x.openings, growth: x.growth / x.n, n: x.n })).sort((a, b) => b.openings - a.openings);
  }, [rows]);
  const [picked, setPicked] = useState<string | null>(null);
  const world = picked && industries.some((i) => i.world === picked) ? picked : industries[0]?.world;
  const top10 = rows.filter((r) => r.career.world === world).sort((a, b) => b.openings - a.openings).slice(0, 10);
  const rising = [...rows].sort((a, b) => b.growth - a.growth).slice(0, 5);
  const maxOpen = Math.max(1, ...industries.map((i) => i.openings));

  return (
    <div className="flex flex-col gap-[48px]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Dropdown label="State" value={state} active panel={(close) => ({
          title: "State", description: "Demand, pay and growth for this state.", count: rows.length, noun: "career", width: 340,
          children: <div className="flex flex-col p-[8px]">{US_STATES.map((st) => <Option key={st} radio on={st === state} onToggle={() => { setState(st); close(); }} label={st} />)}</div>,
        })} />
        <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Pay: BLS, by state. Openings a year and growth over five years.</p>
      </div>

      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-[var(--space-12)]">
        {/* industries, ranked; picking one fills the list beside it */}
        <section aria-label={`Hot industries in ${state}`} className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <Title>Hot Industries in {state}</Title>
          <ul aria-label="Industries" className="flex flex-col gap-[4px]">
            {industries.map((i) => {
              const on = i.world === world;
              return (
                <li key={i.world}>
                  <button type="button" aria-pressed={on} onClick={() => setPicked(i.world)} className="dm-quiet -mx-[var(--space-2)] flex w-[calc(100%+var(--space-4))] cursor-pointer flex-col gap-[6px] rounded-[var(--radius-md)] px-[var(--space-2)] py-[8px] text-left" style={on ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                    <span className="flex items-baseline justify-between gap-[var(--space-3)] text-[14.5px] font-semibold">
                      <span className="truncate" style={{ color: on ? "var(--foreground)" : undefined }}>{i.world}</span>
                      <span className="flex-none tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i.openings.toLocaleString()} openings · <span className="v5-ok">+{i.growth.toFixed(1)}%</span></span>
                    </span>
                    <span className="block h-[8px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
                      <span className="block h-full rounded-full" style={{ width: `${(i.openings / maxOpen) * 100}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${WORLD_COLORS[i.world] ?? "var(--primary)"} 55%, var(--background)), ${WORLD_COLORS[i.world] ?? "var(--primary)"})` }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-label={`Top careers in ${world}`} className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <Title aside={<span className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Ranked by demand in {state}</span>}>Top 10 in {world}</Title>
          <ol className="flex flex-col">
            {top10.map((r, i) => <CareerRow key={r.career.title} rank={i + 1} r={r} />)}
          </ol>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-2 lg:gap-[var(--space-12)]">
        <section aria-label="Rising fastest" className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <Title>Rising Fastest in {state}</Title>
          <ul className="flex flex-col">
            {rising.map((r) => (
              <li key={r.career.title} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
                <Link href={`/career/${careerSlug(r.career.title)}`} className="dm-quiet -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[10px]">
                  <span className="relative block h-[44px] w-[34px] flex-none overflow-hidden rounded-[6px]"><Image src={r.career.photo} alt="" fill sizes="34px" className="object-cover" /></span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] font-semibold">{r.career.title}</span>
                    <span className="truncate text-[12.5px] font-semibold" style={{ color: WORLD_COLORS[r.career.world] }}>{r.career.world}</span>
                  </span>
                  <span className="flex items-center gap-[4px] text-[15px] font-semibold tabular-nums v5-ok"><TrendingUp className="h-4 w-4" aria-hidden />+{r.growth.toFixed(1)}%</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <PopularWithStudents />
      </div>
    </div>
  );
}

/** A ranked career; opens to the Replit's detail: a plain-words line,
 *  salary, typical degree, majors, growth. */
function CareerRow({ rank, r }: { rank: number; r: ReturnType<typeof payRows>[number] }) {
  const [open, setOpen] = useState(false);
  const p = careerProfile(careerSlug(r.career.title));
  const degree = p?.facts.find((f) => /degree|education/i.test(f.label))?.value;
  const majors = p?.education.studies.slice(0, 3).map((s) => s.name).join(", ");
  return (
    <li className="border-b" style={{ borderColor: RULE }}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="dm-quiet -mx-[var(--space-2)] grid w-[calc(100%+var(--space-4))] cursor-pointer grid-cols-[28px_minmax(0,1fr)_auto_auto_16px] items-center gap-x-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[10px] text-left sm:grid-cols-[28px_minmax(0,1fr)_70px_70px_110px_16px]">
        <span className="text-[17px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)", color: rank <= 3 ? "var(--accent)" : "var(--muted-foreground)" }}>{rank}</span>
        <span className="truncate text-[15px] font-semibold">{r.career.title}</span>
        <span className="text-right text-[14.5px] font-semibold tabular-nums">{k(r.pay)}</span>
        <span className="text-right text-[14px] font-semibold tabular-nums v5-ok">+{r.growth.toFixed(1)}%</span>
        <span className="hidden text-right text-[13px] font-medium tabular-nums sm:block" style={{ color: "var(--muted-foreground)" }}>{r.openings.toLocaleString()} a year</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </button>
      {open && (
        <div className="mb-[var(--space-4)] flex flex-col gap-[var(--space-3)] pl-[40px]">
          {p?.summary && <p className="text-[15px] leading-[22px]">{p.summary}</p>}
          <dl className="grid grid-cols-2 gap-x-[var(--space-6)] gap-y-[var(--space-3)] sm:grid-cols-4">
            <Fact label="Pay" value={k(r.pay)} />
            <Fact label="Education" value={degree ?? "Varies"} />
            <Fact label="Study" value={majors || "Varies"} />
            <Fact label="Growth" value={`+${r.growth.toFixed(1)}%`} cls="v5-ok" />
          </dl>
          <Link href={`/career/${careerSlug(r.career.title)}`} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>Open {r.career.title}</Link>
        </div>
      )}
    </li>
  );
}

function Fact({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[2px]">
      <dt className="text-[12px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</dt>
      <dd className={`m-0 text-[14.5px] leading-[20px] font-semibold ${cls ?? ""}`}>{value}</dd>
    </div>
  );
}

/** What this school's students save most, with this month's change
 *  (DEMO-ONLY: the change is seeded until monthly snapshots are stored). */
function PopularWithStudents() {
  const roster = useReviewedRoster();
  const top = useMemo(() => schoolSnapshot(roster.map(toV5)).topSaved.slice(0, 5), [roster]);
  return (
    <section aria-label="Popular with your students" className="flex min-w-0 flex-col gap-[var(--space-4)]">
      <Title>Popular with Your Students</Title>
      <ul className="flex flex-col">
        {top.map(({ career, students }, i) => (
          <li key={career.id} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
            <Link href={`/career/${careerSlug(career.title)}`} className="dm-quiet -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[10px]">
              <span className="w-[20px] text-right text-[15px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
              <span className="relative block h-[44px] w-[34px] flex-none overflow-hidden rounded-[6px]"><Image src={career.photo} alt="" fill sizes="34px" className="object-cover" /></span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-semibold">{career.title}</span>
                <span className="truncate text-[12.5px] font-semibold" style={{ color: WORLD_COLORS[career.world] }}>{career.world}</span>
              </span>
              <span className="flex flex-col items-end">
                <span className="text-[15px] font-semibold tabular-nums">{students} saved</span>
                <span className="text-[12px] font-semibold tabular-nums v5-ok">+{1 + ((students * 7) % 5)} this month</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
