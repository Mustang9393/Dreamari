"use client";

// DEMO-ONLY: the Storm switch for the day sky, beside the Classic switch
// (ColorThemeSwitch.tsx), light mode only (23 Oct 2026, Chandu: "experiment
// a rainy clouds with lightning in them when a streak is missed. Put that as
// a toggle somewhere like we have for the classic/black and blue theme
// looks"). Same quiet face as Classic. On = storm.
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { setWeather, useWeather } from "./weather";

function subscribeLight(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const isLight = () => document.documentElement.classList.contains("look-v2") && document.documentElement.classList.contains("light");

export function WeatherSwitch() {
  const weather = useWeather();
  const light = useSyncExternalStore(subscribeLight, isLight, () => false);
  const path = usePathname() ?? "";
  if (!light || path === "/counselor" || path.startsWith("/counselor/")) return null;
  const on = weather === "storm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Storm sky"
      onClick={() => setWeather(on ? "clear" : "storm")}
      className="marketing-v2 themeable no-print fixed bottom-[12px] left-[104px] z-[45] hidden cursor-pointer items-center gap-[7px] rounded-[var(--radius-sm,6px)] px-[6px] py-[3px] text-[10.5px] leading-[14px] font-semibold tracking-[0.06em] uppercase opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100 lg:flex"
      style={{ background: "transparent", color: "var(--muted-foreground, rgba(255,255,255,0.62))", fontFamily: "var(--font-body)", minHeight: "auto" }}
    >
      Storm
      <span aria-hidden className="relative h-[14px] w-[24px] flex-none rounded-full transition-colors" style={{ background: on ? "var(--primary, #2f6bf2)" : "color-mix(in srgb, var(--foreground, #f4f7ff) 22%, transparent)" }}>
        <span className="absolute top-[2px] size-[10px] rounded-full bg-white transition-[left] duration-200" style={{ left: on ? 12 : 2 }} />
      </span>
    </button>
  );
}
