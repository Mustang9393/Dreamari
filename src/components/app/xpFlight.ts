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
  // the chip that is actually on screen: the desktop nav and the phone
  // header both carry one, only one is visible at a time
  const chips = [...document.querySelectorAll(`[${DREAM_SCORE_TARGET_ATTR}]`)] as Element[];
  const visible = chips.find((el) => el.getClientRects().length > 0) ?? chips[0] ?? null;
  return centerOf(visible, { x: window.innerWidth - 72, y: 32 });
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

  // A solid capsule, not bare text: it has to read over any page behind it
  // (direct feedback, 17 Sept 2026: "no prominence... floating behind
  // things or blending in"). Above every layer the app uses.
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  // The capsule is appended to <body>, outside the themed scope where the
  // app's CSS variables live, so resolve the brand color (and display font)
  // from the nearest themed element instead of relying on var() there
  // (seen live, 17 Sept 2026: the pill painted black).
  const themed = (from && "getBoundingClientRect" in from ? (from as Element).closest(".themeable") : null) ?? document.querySelector(".themeable") ?? document.body;
  const themedStyle = getComputedStyle(themed);
  const color = tone ?? (themedStyle.getPropertyValue("--primary").trim() || "#4c6fff");
  const displayFont = themedStyle.getPropertyValue("--font-display").trim() || "inherit";
  el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;background:${color};color:#fff;border:1.5px solid rgba(255,255,255,0.35);box-shadow:0 0 0 6px color-mix(in srgb, ${color} 28%, transparent),0 18px 40px -10px color-mix(in srgb, ${color} 80%, transparent),0 0 32px color-mix(in srgb, ${color} 60%, transparent)"><span style="font-size:18px;line-height:1">✦</span><span>+${amount} XP</span></span>`;
  Object.assign(el.style, {
    position: "fixed", left: "0", top: "0", zIndex: "9999", pointerEvents: "none", whiteSpace: "nowrap",
    font: `800 24px/1.1 ${displayFont}`, letterSpacing: "-0.01em",
    transform: `translate(${start.x}px, ${start.y}px) translate(-50%, -50%) scale(0.5)`, opacity: "0", willChange: "transform, opacity",
    // zoom: 1 cancels the ambient "proportional wide-screen scaling"
    // (globals.css, body { zoom: 1.1/1.25 } above 1441px/1800px). start/end
    // above are already TRUE post-zoom screen coordinates from
    // getBoundingClientRect(), so without this reset they'd be re-zoomed a
    // second time on render and the pill would land nowhere near the real
    // chip on a wide screen -- same bug and same fix as the shared Portal
    // in CareerReport.tsx, which this element can't use since it isn't a
    // React portal.
    zoom: "1",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  // Banks the score and bumps the chip the instant the pill visually lands
  // (still on-screen, mid-fade), not after its full flight -- including the
  // final fade-out tail -- has finished. Waiting for the whole animation
  // left a beat where the pill had already reached the chip and the number
  // hadn't moved yet, so the two felt disconnected instead of like one
  // impact.
  const arrive = () => {
    awardDreamScore(milestone, amount);
    const chip = ([...document.querySelectorAll<HTMLElement>(`[${DREAM_SCORE_TARGET_ATTR}]`)].find((el) => el.getClientRects().length > 0) ?? document.querySelector<HTMLElement>(`[${DREAM_SCORE_TARGET_ATTR}]`));
    if (chip && !reduce) {
      chip.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.35 }, { transform: "scale(1)" }], { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    }
  };
  const cleanup = () => el.remove();

  if (reduce) {
    el.style.transform = `translate(${start.x}px, ${start.y}px) translate(-50%, -50%) scale(1)`;
    el.style.opacity = "1";
    window.setTimeout(arrive, 1600);
    window.setTimeout(cleanup, 1600);
    return true;
  }
  playXpRise(420);
  const at = (p: Point, scale: number) => `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${scale})`;
  // Rise, then hold in view with a slow bob for most of the flight (long
  // enough to read), then dart into the chip.
  const lift = { x: start.x, y: start.y - 72 };
  const bob = { x: start.x, y: start.y - 80 };
  const anim = el.animate(
    [
      { transform: at(start, 0.5), opacity: 0, offset: 0 },
      { transform: at(lift, 1.18), opacity: 1, offset: 0.1 },
      { transform: at(lift, 1), opacity: 1, offset: 0.16 },
      { transform: at(bob, 1), opacity: 1, offset: 0.4 },
      { transform: at(lift, 1), opacity: 1, offset: 0.64 },
      { transform: at(bob, 1.04), opacity: 1, offset: 0.8 },
      { transform: at(end, 0.28), opacity: 0.9, offset: 0.98 },
      { transform: at(end, 0.2), opacity: 0, offset: 1 },
    ],
    { duration: 3600, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
  );
  // The pill is already at the chip, still visible, by offset 0.98 -- bank
  // the score and bump the chip right there instead of waiting out the
  // last 2% (just the fade-to-nothing), so the number moves the instant
  // the eye reads the pill as "arrived."
  window.setTimeout(arrive, 3600 * 0.98);
  anim.onfinish = cleanup;
  anim.oncancel = cleanup;
  return true;
}
