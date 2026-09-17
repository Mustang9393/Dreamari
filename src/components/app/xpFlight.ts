// One XP moment for the whole app: a "+N XP" number lifts off wherever the
// student just did something, holds a beat, then flies into the nav's Dream
// Score chip and banks the points the instant it lands (direct feedback, 17
// Sept 2026: XP gains "need to all float and slot into the XP bar on the top
// nav... consistent across the website"). Same choreography the Connect
// interstitial and the Career Detail Connect modal use for their own
// header counter, lifted out so any surface can call it with one line.

import { playXpRise } from "@/components/build/sound";
import { awardDreamScore, peekDreamScoreAfter, readDreamScore } from "@/lib/dreamScore";

export const DREAM_SCORE_TARGET_ATTR = "data-dream-score-target";

type Point = { x: number; y: number };

function centerOf(el: Element | null | undefined, fallback: Point): Point {
  if (!el) return fallback;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return fallback;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Where the number lands: the nav's Dream Score chip, or the top-right
 *  corner on screens where the chip is hidden. */
function target(): Point {
  return centerOf(document.querySelector(`[${DREAM_SCORE_TARGET_ATTR}]`), { x: window.innerWidth - 72, y: 32 });
}

/**
 * Fly `amount` XP from `from` (an element or a point) to the Dream Score chip
 * and award it under `milestone` once it lands. Awards are once per
 * milestone id (see dreamScore.ts), so calling this twice for the same
 * milestone shows nothing the second time. Returns whether a flight started.
 */
export function flyXp({ from, amount, milestone, tone }: { from: Element | Point | null | undefined; amount: number; milestone: string; /** CSS color for the number; defaults to the app accent */ tone?: string }): boolean {
  if (typeof window === "undefined") return false;
  if (peekDreamScoreAfter(milestone, amount) === readDreamScore()) return false; // already banked
  const start = from && "getBoundingClientRect" in from ? centerOf(from, { x: window.innerWidth / 2, y: window.innerHeight / 2 }) : (from as Point | null) ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const end = target();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.textContent = `+${amount} XP`;
  const color = tone ?? "var(--accent)";
  Object.assign(el.style, {
    position: "fixed", left: "0", top: "0", zIndex: "200", pointerEvents: "none", whiteSpace: "nowrap",
    font: "800 26px/1.2 var(--font-display)", color, textShadow: `0 0 18px ${color}, 0 2px 12px rgba(0,0,0,0.35)`,
    transform: `translate(${start.x}px, ${start.y}px) translate(-50%, -50%) scale(0.4)`, opacity: "0", willChange: "transform, opacity",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  const land = () => {
    awardDreamScore(milestone, amount);
    const chip = document.querySelector<HTMLElement>(`[${DREAM_SCORE_TARGET_ATTR}]`);
    if (chip && !reduce) {
      chip.animate([{ transform: "scale(1)" }, { transform: "scale(1.28)", offset: 0.35 }, { transform: "scale(1)" }], { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    }
    el.remove();
  };

  if (reduce) {
    el.style.transform = `translate(${start.x}px, ${start.y}px) translate(-50%, -50%) scale(1)`;
    el.style.opacity = "1";
    window.setTimeout(land, 900);
    return true;
  }
  playXpRise(420);
  const at = (p: Point, scale: number) => `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${scale})`;
  const lift = { x: start.x, y: start.y - 44 };
  const anim = el.animate(
    [
      { transform: at(start, 0.4), opacity: 0, offset: 0 },
      { transform: at(lift, 1.4), opacity: 1, offset: 0.15 },
      { transform: at(lift, 1.15), opacity: 1, offset: 0.62 },
      { transform: at(end, 0.25), opacity: 0, offset: 1 },
    ],
    { duration: 2000, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
  );
  anim.onfinish = land;
  anim.oncancel = land;
  return true;
}
