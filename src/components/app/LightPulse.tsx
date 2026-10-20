"use client";

// DEMO-ONLY, the v2 look (src/app/look-v2.css), part 4 of "light that
// behaves like light" (Chandu, 19 Oct 2026: "lets try 1,2,3,4"): at a
// moment, light blooms where it happened and fades back to calm.
//   - pressing a lit action (data-lit: Let's Go, Next Step, the hero CTA)
//   - switching something on (a control whose aria-pressed is about to go true)
//   - a progress bar advancing (SparkBar dispatches "dreamari:light")
// One fixed layer, a radial bloom per moment, opacity and scale only, so it
// costs nothing at rest and never repaints the page. Off for reduced motion
// and outside v2.
import { useEffect, useRef } from "react";
import { skyMoment } from "@/lib/sky";

export const LIGHT_EVENT = "dreamari:light";

/** Bloom light at a point (client coordinates), e.g. a progress bar's head. */
export function dispatchLight(x: number, y: number, strength = 1) {
  window.dispatchEvent(new CustomEvent(LIGHT_EVENT, { detail: { x, y, strength } }));
}

export function LightPulse() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => document.documentElement.classList.contains("look-v2") && !reduce.matches;
    const light = document.documentElement.classList.contains("light");

    const bloom = (x: number, y: number, strength: number) => {
      if (!on() || !layer.current) return;
      const size = 220 * strength;
      const el = document.createElement("span");
      const isLight = document.documentElement.classList.contains("light") || light;
      el.style.cssText = `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;pointer-events:none;background:radial-gradient(circle, ${isLight ? "rgba(39,128,236,0.32)" : "rgba(158,198,250,0.5)"} 0%, ${isLight ? "rgba(39,128,236,0.12)" : "rgba(39,128,236,0.32)"} 35%, transparent 70%);`;
      layer.current.appendChild(el);
      const anim = el.animate(
        [
          { opacity: 0, transform: "scale(0.55)" },
          { opacity: 1, transform: "scale(1)", offset: 0.25 },
          { opacity: 0, transform: "scale(1.35)" },
        ],
        { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      anim.onfinish = () => el.remove();
    };

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-lit], [aria-pressed='false']");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const lit = target.hasAttribute("data-lit");
      bloom(r.left + r.width / 2, r.top + r.height / 2, lit ? 1.2 : 0.7);
      // a main call to action also lights the sky (not every switch: filter
      // chips are aria-pressed too, and the sky should mean something)
      if (lit) skyMoment({ from: target });
    };
    const onLight = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number; strength?: number }>).detail;
      if (d) bloom(d.x, d.y, d.strength ?? 1);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener(LIGHT_EVENT, onLight);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(LIGHT_EVENT, onLight);
    };
  }, []);

  return <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" />;
}
