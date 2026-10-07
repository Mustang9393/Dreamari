"use client";

// A focus carousel for a ranking (Maisha's references, 7 Oct 2026: a Spotify
// album coverflow, cards on a turning cylinder, a centered card with the
// rest faded: "a rotation of the 10 careers with the top ones highlighted").
// The focused card is large and centered; the rest angle away and shrink
// behind it. Turn with the arrows, a swipe, the arrow keys, or by clicking a
// side card; clicking the focused card opens it. It replaces a flat row of
// equal cards (it adds nothing to the page). It turns on its own, holding
// while hovered or focused, and never with reduced motion on.
// The focused card's rank is the student app's Top 10 numeral, peeking out
// from behind it at the same size (Chandu, 7 Oct 2026: "the same scale of
// the number poking through from behind the card... exactly like the top
// trending row in Explore"); the count is a number over one word.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { RankedPosterCard } from "@/components/app/PosterCard";

export type CoverItem = { key: string; rank: number; title: string; world: string; photo: string; focus?: string; stat: { value: string; label: string }; onOpen: () => void };

const W = 236;
const H = 330;

/** Carousel or row (Chandu, 7 Oct 2026: "a toggle to have them in a proper
 *  row too for easier scanning; the other mode can keep auto-rotating"). */
export function Coverflow({ items, label, mode = "cover" }: { items: CoverItem[]; label: string; mode?: "cover" | "row" }) {
  if (mode === "row") return <RowView items={items} label={label} />;
  return <CarouselView items={items} label={label} />;
}

function CarouselView({ items, label }: { items: CoverItem[]; label: string }) {
  const [active, setActive] = useState(0);
  const start = useRef<number | null>(null);
  const region = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  // how far the stage may bleed past the content column toward the screen
  // edge, so turned outer cards are never cut at the page margin (Chandu,
  // 7 Oct 2026: "the margins are clipping cards in the carousel"); measured,
  // since v5 and v6 pad their pages differently
  const [bleed, setBleed] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  // a loop, like the turning cylinder: #10 sits to the left of #1
  const go = (i: number) => setActive(((i % n) + n) % n);

  // spread across the content width: the side cards share whatever room is
  // left, and the stage itself reaches past it by the measured bleed
  useEffect(() => {
    const el = region.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setWidth(el.clientWidth);
      setBleed(Math.max(0, Math.min(r.left, window.innerWidth - r.right, 96)));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  // turns on its own; holds while hovered or focused, and never with reduced motion
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), 3800);
    return () => window.clearInterval(t);
  }, [paused, n]);
  const half = width / 2;
  // the same small gap each side of the focused card; its rank numeral
  // reaches out over the left neighbours ("don't leave so much space but be
  // symmetric", "don't worry if the cards behind are overlapped")
  // (phones have no room for the numeral: "1 of 10" carries the rank there)
  const roomy = width >= 640;
  // tighter (Chandu, 7 Oct 2026: "tighten the gaps a little bit but still
  // use the full width"): larger, less-turned side cards and a 16px gap; the
  // outer cards still reach both edges
  const first = W * 0.5 + (roomy ? 16 : 0) + W * 0.42;
  // four cards each side, the outermost reaching the edge: even on both sides
  const step = Math.max(40, (half - first - W * 0.38) / 3);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(active + 1); if (e.key === "ArrowLeft") go(active - 1); }}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest("[data-cf-nav]")) return; start.current = e.clientX; }}
      onPointerUp={(e) => { if (start.current === null) return; const dx = e.clientX - start.current; if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1)); start.current = null; }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative w-full touch-pan-y select-none outline-none"
    >
      <div ref={region} className="w-full" />
      <div className="relative h-[360px] overflow-hidden sm:h-[380px]" style={{ perspective: 1600, marginInline: -bleed }}>
        {items.map((it, i) => {
          let d = i - active;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const ad = Math.abs(d);
          // symmetric: with an even count, the card directly behind is hidden
          if (ad > 4 || (n % 2 === 0 && d === n / 2)) return null;
          const x = d === 0 ? 0 : Math.sign(d) * (first + (ad - 1) * step);
          const rot = d === 0 ? 0 : -Math.sign(d) * 28;
          const scale = d === 0 ? 1 : 0.9 - (ad - 1) * 0.05;
          return (
            <div
              key={it.key}
              className="absolute top-[14px] left-1/2 transition-[transform,opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                width: W, height: H, marginLeft: -W / 2,
                transform: `translateX(${x}px) rotateY(${rot}deg) scale(${scale})`,
                zIndex: 20 - ad,
                // solid cards; distance reads as a progressive blur (Chandu,
                // 7 Oct 2026: "make all the cards solid and full opacity and
                // use a subtle or progressive blur to show distance"), kept light
                // ("maybe the blur got a little too much")
                filter: d === 0 ? "none" : `blur(${(0.4 + (ad - 1) * 0.6).toFixed(1)}px) brightness(${1 - ad * 0.04})`,
              }}
            >
              {roomy && <RankNumeral rank={it.rank} show={d === 0} />}
              <button
                type="button"
                aria-label={`#${it.rank}: ${it.title}, ${it.stat.value} ${it.stat.label}`}
                aria-current={d === 0 ? "true" : undefined}
                tabIndex={d === 0 ? 0 : -1}
                onClick={() => (d === 0 ? it.onOpen() : go(i))}
                className="absolute inset-0 z-[1] cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left"
                style={{
                  borderColor: d === 0 ? "rgba(255,255,255,0.7)" : "var(--glass-border)",
                  boxShadow: d === 0 ? "none" : "0 16px 40px -28px rgba(20,30,70,0.5)",
                }}
              >
                <Image src={it.photo} alt="" fill sizes={`${W}px`} className="object-cover" style={{ objectPosition: it.focus ?? "50% 25%" }} draggable={false} />
                {/* only the focused card carries text; side cards are pictures */}
                <span aria-hidden className="absolute top-[12px] left-[12px] z-[2] flex flex-col items-center rounded-[var(--radius-md)] px-[12px] py-[6px] transition-opacity duration-300" style={{ opacity: d === 0 ? 1 : 0, background: "rgba(8,10,22,0.62)", color: "#fff", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                  <span className="text-[22px] leading-[26px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{it.stat.value}</span>
                  <span className="text-[11.5px] leading-[14px] font-semibold">{it.stat.label}</span>
                </span>
                <span className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center gap-[6px] px-[12px] pt-[70px] pb-[18px] text-center uppercase transition-opacity duration-300" style={{ backgroundImage: "var(--poster-scrim)", opacity: d === 0 ? 1 : 0 }}>
                  <span className="w-full [overflow-wrap:normal]" style={{ ...posterTitleFont(it.world), fontSize: 23, lineHeight: "27px", color: "var(--poster-title)" }}>{it.title}</span>
                  <span className="text-[10.5px] leading-[14px] font-semibold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[it.world] }}>{it.world}</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-[10px] flex items-center justify-center gap-[var(--space-4)]">
        <button type="button" aria-label="Previous" data-cf-nav onClick={() => go(active - 1)} className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-35" style={{ borderColor: "var(--glass-border)" }}><ChevronLeft className="h-5 w-5" aria-hidden /></button>
        <span className="min-w-[56px] text-center text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{active + 1} of {n}</span>
        <button type="button" aria-label="Next" data-cf-nav onClick={() => go(active + 1)} className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-35" style={{ borderColor: "var(--glass-border)" }}><ChevronRight className="h-5 w-5" aria-hidden /></button>
      </div>
    </div>
  );
}

/** The same careers as a row for scanning, on the Explore Top 10 row's own
 *  ranked cards, numerals and all (Chandu, 7 Oct 2026: "when I toggle to
 *  row view it should show the row with the numbers like in explore
 *  careers"). The student count rides on the card, the carousel's chip. */
function RowView({ items, label }: { items: CoverItem[]; label: string }) {
  return (
    <ol aria-label={label} className="poster-row -mx-5 flex gap-[var(--space-5)] overflow-x-auto px-5 py-4 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]">
      {items.map((it) => (
        <li key={it.key} className="relative flex-none">
          <RankedPosterCard career={{ title: it.title, world: it.world, photo: it.photo }} rank={it.rank} onClick={it.onOpen} />
          <span aria-hidden className={`pointer-events-none absolute top-[10px] z-[7] flex flex-col items-center rounded-[var(--radius-md)] px-[10px] py-[4px] ${it.rank >= 10 ? "left-[128px]" : "left-[55px]"}`} style={{ background: "rgba(8,10,22,0.62)", color: "#fff", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
            <span className="text-[17px] leading-[20px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{it.stat.value}</span>
            <span className="text-[10.5px] leading-[13px] font-semibold">{it.stat.label}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// The rank numeral, Netflix Top 10 style: nearly as tall as the card,
// heavy, the card overlapping about a fifth of it (Chandu, 7 Oct 2026: "the
// number should match the card's scale... a little drop shadow on it by the
// card... cinematic... bolder. Refer Netflix"; then "take the number out a
// bit more", "the border stroke doesn't need to be this thick... keep it
// classy... the glass sleek, shiny thin border effect"). Bricolage 800
// digits are 0.66em tall, so 440px makes 290px against the 330px card; "10"
// is narrowed so it is not twice as wide. Ink widths measured from the font
// (em, after narrowing).
const FS = 440;
const INK: Record<number, number> = { 1: 0.26, 2: 0.53, 3: 0.556, 4: 0.596, 5: 0.53, 6: 0.575, 7: 0.48, 8: 0.574, 9: 0.57, 10: 0.76 };
const COVER = 0.2;
const ink = (rank: number) => (INK[rank] ?? 0.56) * FS;
function numeralVisible(rank: number) {
  return ink(rank) * (1 - COVER);
}

// Two stacked copies, because Bricolage's glyphs are built from overlapping
// contours and a text outline traces every one of them (the lines Chandu saw
// "making up the shapes of the letters intersecting"). The rim copy carries
// a thin outline; the fill copy sits exactly on top with an opaque material
// (globals.css --rank-fill) and no outline, so it covers every inner line and
// only a fine outer edge of the rim shows. Digits never overlap each other.
function RankNumeral({ rank, show }: { rank: number; show: boolean }) {
  const two = rank >= 10;
  const sx = two ? 0.78 : 1;
  // where the card's edge crosses the numeral, in the numeral's own
  // (unscaled) coordinates: the card's shadow falls only on the digit,
  // softly, fading out 60px from the edge, and nowhere else
  const edge = (numeralVisible(rank) + 0.03 * FS * sx) / sx;
  const base: React.CSSProperties = {
    // ink starts about 0.03em in from the text origin
    left: -numeralVisible(rank) - 0.03 * FS * sx,
    // with a 1em line box the digits' ink bottom sits 0.83em down: rest it
    // just above the card's bottom edge
    top: H - 0.83 * FS - 8,
    fontFamily: "var(--font-display)",
    fontSize: FS,
    lineHeight: 1,
    letterSpacing: two ? "0.02em" : 0,
    transform: two ? `scaleX(${sx})` : undefined,
    transformOrigin: "left center",
    opacity: show ? 1 : 0,
    transition: "opacity 500ms",
  };
  const cls = "rank-numeral pointer-events-none absolute z-0 font-extrabold whitespace-nowrap select-none";
  return (
    <>
      <span aria-hidden className={cls} style={{ ...base, color: "transparent", WebkitTextStroke: "2px var(--rank-rim)" }}>{rank}</span>
      <span aria-hidden className={cls} style={{
        ...base,
        color: "transparent",
        backgroundImage: `linear-gradient(to right, transparent ${edge - 60 / sx}px, var(--rank-shade) ${edge}px), var(--rank-fill)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}>{rank}</span>
    </>
  );
}
