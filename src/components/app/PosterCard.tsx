import Image from "next/image";
import type { CatalogCareer } from "./catalog";
import { posterTitleFont, TEXT_SCRIM, WORLD_COLORS } from "./worlds";

// Career Poster Card, ported 1:1 from the Figma component (210×297, radius-xl,
// glass border, gradient/text-scrim, per-world title face at 24/28, world
// label in UI/Label Small tracked +0.6). The salary variant adds the
// gradient-shimmer Bricolage figure in the top-right, exactly as the
// "Typical Pay" rail's cards carry it.

// Exactly TWO title sizes, chosen by rule (not per career/world): the
// standard 24, or one fixed compact 19 when the longest word is 10+ chars
// (CONTROLLER, PSYCHOLOGIST) so nothing clips. Short titles never shrink.
function posterTitleSize(title: string): { fontSize: number; lineHeight: string } {
  const longest = Math.max(...title.split(/[\s-]+/).map((word) => word.length));
  if (longest >= 10) return { fontSize: 19, lineHeight: "23px" };
  return { fontSize: 24, lineHeight: "28px" };
}

export function PosterCard({ career, className = "" }: { career: CatalogCareer; className?: string }) {
  const titleSize = posterTitleSize(career.title);
  return (
    <button
      type="button"
      className={`relative flex h-[297px] w-[210px] flex-none cursor-pointer flex-col items-center justify-end overflow-hidden rounded-[var(--radius-xl)] border text-center uppercase ${className}`}
      style={{ borderColor: "var(--glass-border)" }}
    >
      <Image src={career.photo} alt="" fill sizes="210px" className="rounded-[var(--radius-xl)] object-cover" draggable={false} />
      {career.salary && (
        /* gradient shimmer text; a layered dark drop-shadow halo (filter —
           text-shadow can't paint under bg-clipped text) keeps it legible
           on any photo without a pill */
        <span
          className="absolute top-2 right-2 z-[1] text-[16px] leading-[22px] font-extrabold"
          style={{
            fontFamily: "var(--font-display)",
            backgroundImage: "linear-gradient(157deg, rgba(255,255,255,1) 12.857%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.88) 84.286%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.9)) drop-shadow(0 2px 5px rgba(0,0,0,0.6)) drop-shadow(0 4px 14px rgba(0,0,0,0.45))",
          }}
        >
          {career.salary}
        </span>
      )}
      <span
        className="relative z-[1] flex h-[119px] w-full flex-col items-center justify-end gap-[6px] px-[var(--space-1)] pb-[var(--space-4)]"
        style={{ backgroundImage: TEXT_SCRIM }}
      >
        <span
          className="w-full [overflow-wrap:normal] [word-break:keep-all]"
          style={{ ...posterTitleFont(career.world), fontSize: titleSize.fontSize, lineHeight: titleSize.lineHeight, color: "var(--foreground)" }}
        >
          {career.title}
        </span>
        <span
          className="w-full text-[10px] leading-[14px] font-semibold tracking-[0.6px]"
          style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}
        >
          {career.world}
        </span>
      </span>
    </button>
  );
}

// Trending rail slot: giant background-colored numeral silhouetted against the
// starfield behind a 175×250 CareerCard (Figma "Ranked N" frames, 220×250).

// The 175px card is narrower than the standard poster: long single words
// (ENTREPRENEUR) step the title size down so nothing breaks mid-word.
function rankedTitleSize(title: string): { fontSize: number; lineHeight: string } {
  const longest = Math.max(...title.split(/\s+/).map((word) => word.length));
  if (longest >= 12) return { fontSize: 17, lineHeight: "21px" };
  if (longest >= 10) return { fontSize: 20, lineHeight: "24px" };
  return { fontSize: 24, lineHeight: "28px" };
}

export function RankedPosterCard({ career, rank }: { career: CatalogCareer; rank: number }) {
  const titleSize = rankedTitleSize(career.title);
  return (
    <div className="relative h-[250px] w-[220px] flex-none">
      <p
        aria-hidden
        className="absolute top-[40px] left-[34px] -translate-x-1/2 text-center text-[180px] leading-[155px] font-extrabold tracking-[-5px] whitespace-nowrap select-none"
        style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: '"opsz" 14, "wdth" 100',
          color: "var(--background)",
          // The mobile Browse frame draws the rank as a hollow outlined digit;
          // the light stroke also keeps it legible over the darker stretches
          // of Background Space (fill stays the frame's background color).
          WebkitTextStroke: "1.5px color-mix(in srgb, var(--foreground) 18%, transparent)",
        }}
      >
        {rank}
      </p>
      <button
        type="button"
        className="absolute top-0 left-[45px] flex h-[250px] w-[175px] cursor-pointer flex-col items-center justify-end overflow-hidden rounded-[var(--radius-xl)] text-center uppercase"
      >
        <Image src={career.photo} alt="" fill sizes="175px" className="rounded-[var(--radius-xl)] object-cover" draggable={false} />
        <span
          className="relative z-[1] flex h-[119px] w-full flex-col items-center justify-end gap-[6px] px-[var(--space-1)] pb-[var(--space-4)]"
          style={{ backgroundImage: TEXT_SCRIM }}
        >
          <span
            className="w-full [overflow-wrap:normal] [word-break:keep-all]"
            style={{ ...posterTitleFont(career.world), fontSize: titleSize.fontSize, lineHeight: titleSize.lineHeight, color: "var(--foreground)" }}
          >
            {career.title}
          </span>
          <span
            className="w-full text-[10px] leading-[14px] font-semibold tracking-[0.6px]"
            style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[career.world] }}
          >
            {career.world}
          </span>
        </span>
      </button>
    </div>
  );
}
