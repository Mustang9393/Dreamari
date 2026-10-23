"use client";

// DEMO-ONLY: the day sky's weather, for the Storm switch (23 Oct 2026, Chandu:
// "I also want to experiment a rainy clouds with lightning in them when a
// streak is missed. Put that as a toggle somewhere like we have for the
// classic/black and blue theme looks"). Clear is the default; `storm` thickens
// the cirrus into a grey deck with rain and sheet lightning (SkySun.tsx).
import { useSyncExternalStore } from "react";

export type Weather = "clear" | "storm";
const KEY = "dreamari-weather";
export const WEATHER_EVENT = "dreamari:weather";

export function readWeather(): Weather {
  try { return localStorage.getItem(KEY) === "storm" ? "storm" : "clear"; } catch { return "clear"; }
}
export function setWeather(w: Weather) {
  try { localStorage.setItem(KEY, w); } catch { /* storage blocked */ }
  window.dispatchEvent(new CustomEvent(WEATHER_EVENT));
}
function subscribe(cb: () => void) {
  window.addEventListener(WEATHER_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(WEATHER_EVENT, cb); window.removeEventListener("storage", cb); };
}
export function useWeather(): Weather {
  return useSyncExternalStore(subscribe, readWeather, () => "clear" as Weather);
}
