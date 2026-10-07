"use client";

// School posters for the counselor's Explore rows (8 Oct 2026: "SAME for
// schools"): the career poster's shape and ranking numerals, one signal in
// the poster chip, and a tap opens the counselor's school sheet instead of
// the student app's school page.

import { OpenCue, PosterChip } from "@/components/app/PosterCard";
import type { College } from "@/components/colleges/data";
import { CollegePicture } from "@/components/colleges/shared";

const LEVEL: Record<College["level"], string> = { "Certificates": "Trade school", "Associate degrees": "2-year", "Bachelor's degrees": "4-year" };

function Face({ c, chip, size }: { c: College; chip?: string; size: "rail" | "ranked" }) {
  return (
    <>
      <span aria-hidden className="poster-photo absolute inset-0"><CollegePicture c={c} sizes={size === "rail" ? "210px" : "175px"} className="h-full w-full" /></span>
      <OpenCue />
      {chip && <PosterChip text={chip} />}
      <span className="relative z-[1] flex w-full flex-col items-start gap-[8px] px-[14px] pt-[72px] pb-[14px] text-left" style={{ backgroundImage: "var(--poster-scrim)" }}>
        <span className={`line-clamp-3 font-extrabold text-balance ${size === "rail" ? "text-[17px] leading-[20px]" : "text-[15px] leading-[18px]"}`} style={{ fontFamily: "var(--font-display)", color: "var(--poster-title)" }}>{c.name}</span>
        <span className="text-[11.5px] leading-[14px] font-semibold" style={{ color: "color-mix(in srgb, var(--poster-title) 72%, transparent)" }}>{c.city}, {c.state} · {LEVEL[c.level]}</span>
      </span>
    </>
  );
}

export function SchoolPoster({ c, chip, onClick, fill = false }: { c: College; chip?: string; onClick: () => void; fill?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Open ${c.name}`}
      className={`dm-tap poster-card relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border ${fill ? "aspect-[210/297] w-full" : "h-[297px] w-[210px] flex-none"}`}
      style={{ borderColor: "var(--glass-border)" }}>
      <Face c={c} chip={chip} size="rail" />
    </button>
  );
}

/** The Top 10 numeral behind a school poster, the career row's material. */
export function RankedSchoolPoster({ c, rank, chip, onClick }: { c: College; rank: number; chip?: string; onClick: () => void }) {
  const two = rank >= 10;
  return (
    <div className={`poster-wrap relative h-[250px] flex-none ${two ? "w-[293px]" : "w-[220px]"}`}>
      {(["rim", "fill"] as const).map((layer) => (
        <p key={layer} aria-hidden
          className={`rank-numeral absolute top-[40px] whitespace-nowrap select-none ${two ? "left-[-6px] text-left text-[160px] leading-[155px] tracking-[-2px]" : "left-[34px] -translate-x-1/2 text-center text-[180px] leading-[155px] tracking-[-5px]"}`}
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: '"opsz" 14, "wdth" 100',
            color: "transparent",
            ...(layer === "rim" ? { WebkitTextStroke: "2px var(--rank-rim)" } : { backgroundImage: "var(--rank-fill)", WebkitBackgroundClip: "text", backgroundClip: "text" }),
          }}>
          {rank}
        </p>
      ))}
      <button type="button" onClick={onClick} aria-label={`Open ${c.name}, number ${rank}`}
        className={`dm-tap poster-card absolute top-0 ${two ? "left-[118px]" : "left-[45px]"} flex h-[250px] w-[175px] cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)]`}>
        <Face c={c} chip={chip} size="ranked" />
      </button>
    </div>
  );
}
