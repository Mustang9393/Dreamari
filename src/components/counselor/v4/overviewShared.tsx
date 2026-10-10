"use client";

// Shared pieces for the role Overviews (Lead Counselor, School Leader,
// District Leader). Rebuilt 24 Sept 2026 under a hard budget after
// direct feedback ("so much copy and red ... everything looks super
// overwhelming. v2 ... needs to be super intuitive, skimmable, glanceable"):
//
// - One verdict per card, a phrase, not a sentence. Text stays in the
//   foreground color; only its leading dot carries the status color.
// - One line per row: name, value, bar. No chips, no distance sentences, no
//   footnotes. The bar's target tick says where 80% is.
// - Color means "below target." A row that meets its target is quiet
//   (primary-blue bar, foreground value). Amber within 10 points, red
//   further (`targetBand` in src/lib/counselorOrg.ts). Green is not painted
//   on rows at all: the absence of alarm is the signal.
// - One hero per screen carries a tint; every other card is plain glass.

import { useEffect, useLayoutEffect, useState } from "react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { CardLink, Go } from "./chips";
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";
import { targetBand, type TargetBand } from "@/lib/counselorOrg";
import { HERO_FOCUS_BY_PHOTO } from "@/components/career/heroFocus";
import { LightStrip } from "./charts/lit";

// Status FILLS (dots, bars, tints) and status INKS (text) are separate
// tokens since Maisha's v4 review, 7 Oct 2026 ("Maybe On Track is green,
// and Needs Attention can be blue or yellow, essentially colors that people
// already associate with a certain action/status"): the fills keep 3:1 as
// graphics, the inks keep 4.5:1 as text. Both live in v4.css.
export const BAND_COLORS: Record<TargetBand, string> = {
  met: "var(--v4-ok)",
  near: "var(--v4-warn)",
  missed: "var(--v4-risk)",
};
export const BAND_INKS: Record<TargetBand, string> = {
  met: "var(--v4-positive)",
  near: "var(--v4-caution)",
  missed: "var(--destructive)",
};

/** The color a value's TEXT wears: nothing when it meets its target. */
export function alertColor(value: number, target: number): string | undefined {
  const band = targetBand(value, target);
  return band === "met" ? undefined : BAND_INKS[band];
}
/** The color a value's FILL (bar, dot) wears: nothing when it meets its target. */
export function alertFill(value: number, target: number): string | undefined {
  const band = targetBand(value, target);
  return band === "met" ? undefined : BAND_COLORS[band];
}

// ---- The "more exciting" layer (Maisha's v4 review, 7 Oct 2026) ----------
// "The student experience has the polish and intuitiveness, but it also has
// this extra kick of excitement, whether that's the Explore cards, the
// games, or other visual moments ... Mimic some of that within the
// counselor dashboard without losing the clean, professional,
// easy-to-process experience." These are the student app's own pieces
// (Dreamy, the career posters, a rolling count), used once per region.

export type DreamyMood = "celebrate" | "explore" | "idea" | "nervous" | "problem-solving";
/** Dreamy, the student app's mascot, at a moment that earns it: a cleared
 *  queue, everyone on track, an empty screen. Decorative (the copy beside
 *  it carries the meaning), so it is hidden from assistive tech. */
export function DreamyMoment({ mood, size = 64, className = "" }: { mood: DreamyMood; size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/images/dreamy-expressions/dreamy-${mood}.webp`} alt="" aria-hidden="true" width={size} height={size} loading="lazy" className={`v4-dreamy-moment ${className}`} style={{ width: size, height: size }} />;
}

/** A rolling count from 0 to the value on first paint, then between values
 *  as filters change (the student app's XP count, ConnectInterstitial.tsx).
 *  Server and first client render both print the final value, so there is
 *  no hydration mismatch; reduced motion skips the roll. */
// Layout effect on the client so the first roll starts before paint (no
// one-frame flash of the final number); plain effect on the server.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
export function useCountUp(target: number, duration = 900): number {
  const [display, setDisplay] = useState(target);
  const [from, setFrom] = useState<number | null>(null);
  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplay(target); setFrom(target); return; }
    const start = from ?? 0;
    if (start === target) { setDisplay(target); return; }
    setDisplay(start);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - t0) / Math.max(1, duration)));
      setDisplay(Math.round(start + (target - start) * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setFrom(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `from` is the snapshot this roll starts at, not a trigger.
  }, [target, duration]);
  return display;
}

/** A number that rolls up; the real value is what screen readers hear. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const shown = useCountUp(value);
  // `v4-count` keeps a parent's own child-span rules (e.g. a smaller "%"
  // span) from resizing the rolling digits.
  return <><span className="v4-count" aria-hidden="true">{shown}{suffix}</span><span className="sr-only">{value}{suffix}</span></>;
}

// The student app's career posters, by career title, for wherever a
// student's career is named (Maisha loved "the Explore cards art" on
// Career & College). Titles from the roster's Top 5 lists
// (counselorProfileData.ts); anything else falls back to the browse photo
// whose slug matches the title, when one exists.
const CAREER_POSTERS: Record<string, string> = {
  "Software Engineer": "/images/app/poster-software-engineer.webp",
  "Data Scientist": "/images/app/poster-data-scientist.webp",
  "Cybersecurity Analyst": "/images/app/poster-cyber-security.webp",
  "UX / UI Designer": "/images/app/poster-uiux-designer.webp",
  "IT Project Manager": "/images/app/browse/it-project-manager.webp",
  "Registered Nurse": "/images/app/poster-registered-nurse.webp",
  "Physician / Doctor": "/images/app/browse/family-doctor.webp",
  "Physical Therapist": "/images/app/browse/physical-therapist.webp",
  "Healthcare Administrator": "/images/app/browse/healthcare-manager.webp",
  "Medical Lab Scientist": "/images/app/browse/medical-scientist.webp",
  "Financial Analyst": "/images/app/browse/financial-advisor.webp",
  "Entrepreneur / Business Owner": "/images/app/poster-entrepreneur.webp",
  "Investment Banker": "/images/app/poster-investment-banking-v3.webp",
  "Marketing Manager": "/images/app/browse/marketing-manager.webp",
  "Accountant / CPA": "/images/app/poster-accountant.webp",
  Electrician: "/images/app/poster-electrician.webp",
  "HVAC Technician": "/images/app/browse/hvac-technician.webp",
  "Plumber / Pipefitter": "/images/app/browse/plumber.webp",
  "Construction Manager": "/images/app/browse/construction-manager.webp",
  Welder: "/images/app/browse/welder.webp",
  "Graphic Designer": "/images/app/browse/graphic-designer.webp",
  "Film & Video Director": "/images/app/poster-film-director.webp",
  "Art Director": "/images/app/poster-art-director.webp",
  Photographer: "/images/app/browse/photographer.webp",
  "Teacher / Educator": "/images/app/browse/subject-teacher-or-professor.webp",
  "School Counselor": "/images/app/poster-school-counselor.webp",
  "School Principal": "/images/app/browse/principal.webp",
  "Curriculum Developer": "/images/app/browse/instructional-designer.webp",
  "Social Worker": "/images/app/browse/social-worker.webp",
  "Attorney / Lawyer": "/images/app/poster-lawyer.webp",
  Paralegal: "/images/app/browse/paralegal.webp",
  "Law Enforcement Officer": "/images/app/browse/police-officer.webp",
};
export function careerArtFor(title: string | undefined): { src: string; position: string } | null {
  if (!title) return null;
  const slug = title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const browse = `/images/app/browse/${slug}.webp`;
  const src = CAREER_POSTERS[title] ?? (HERO_FOCUS_BY_PHOTO[browse] ? browse : null);
  if (!src) return null;
  return { src, position: HERO_FOCUS_BY_PHOTO[src]?.desktop ?? "50% 25%" };
}

export function OverviewCard({ title, unit, hero, tint, aside, children }: { title: string; /** one short muted qualifier, only when the title needs a unit */ unit?: string; hero?: boolean; tint?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  const base = hero ? GLASS_CARD_HERO : GLASS_CARD;
  const surface = hero && tint ? { ...base, borderColor: `color-mix(in srgb, ${tint} 38%, var(--glass-border))` } : base;
  return (
    <HoverBeam strength={hero ? 0.7 : 0.6} className="h-full">
      <div className="v4-surface group relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        {hero && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(tint ?? "var(--primary)", 0.26) }} />}
        <div className="relative flex flex-wrap items-baseline justify-between gap-x-[8px] gap-y-[4px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>
            {title}
            {unit && <span className="ml-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{unit}</span>}
          </h2>
          {aside}
        </div>
        <div className="relative flex flex-1 flex-col gap-[var(--space-4)]">{children}</div>
      </div>
    </HoverBeam>
  );
}

/** The one line a card exists to say. Neutral text, a colored dot. */
export function Verdict({ band, children }: { band: TargetBand; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
      <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: BAND_COLORS[band], boxShadow: `0 0 8px ${BAND_COLORS[band]}` }} />
      <span>{children}</span>
    </p>
  );
}

export { CardLink as SeeLink };

/** A light strip: one point of light at the value on a hairline scale,
 *  with a target mark. Quiet blue unless the value is below its target.
 *  Was a thin bar until 10 Oct 2026 (Chandu: "I dont like bar graphs", "i
 *  want them to be made of LIGHT"); same data, same colour rule. `height`
 *  is kept for callers and no longer used. */
export function RankBar({ value, target }: { value: number; target?: number; height?: number }) {
  const color = (typeof target === "number" && alertFill(value, target)) || "var(--primary)";
  return <LightStrip pct={value} target={target} color={color} />;
}

/** One row: label (and an optional muted note) left, value right, bar under.
 *  The value wears the alert color only when below target. Click-through is
 *  optional; the row looks the same either way. */
export function MetricRow({ label, note, value, target, leading, onClick, display }: { label: string; note?: string; value: number | null; target: number; leading?: React.ReactNode; onClick?: () => void; /** what to print instead of "NN%" (the bar still uses value) */ display?: string }) {
  const color = value === null ? "var(--muted-foreground)" : alertColor(value, target) ?? "var(--foreground)";
  const body = (
    <>
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <span className="flex items-baseline justify-between gap-[10px]">
          {/* Wraps so a long school name keeps its note under it on a phone
             instead of truncating to "Washington High S...". */}
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-[6px]">
            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
            {note && <span className="flex-none text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
          </span>
          <span className="flex-none text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color }}>{display ?? (value === null ? "n/a" : `${value}%`)}</span>
        </span>
        <RankBar value={value ?? 0} target={target} />
      </span>
    </>
  );
  if (!onClick) return <div className="flex items-center gap-[12px]">{body}</div>;
  return (
    <button type="button" onClick={onClick} className="dm-quiet group -mx-[6px] flex w-[calc(100%+12px)] cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[6px] py-[4px] text-left">
      {body}
      <Go />
    </button>
  );
}

/** A headline stat inside a card: number first, label under. */
export function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <span className="flex flex-col gap-[2px]">
      <span className="text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: color ?? "var(--foreground)" }}>{value}</span>
      <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </span>
  );
}

/** Initials in a primary-tinted circle, for a counselor or a school. */
export function InitialsBadge({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex flex-none items-center justify-center rounded-full text-[11.5px] font-extrabold" style={{ width: size, height: size, background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}>{initials}</span>
  );
}
