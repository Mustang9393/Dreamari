"use client";

// DEMO-ONLY: with the Storm switch (weather.ts) the page itself darkens, not
// only the clouds (23 Oct 2026, Chandu: "on the rainy toggle the sky can get
// darker along with the backgrounds"). A fixed veil behind the sky layers
// whose opacity fades in over 1.6s: by day a cool grey-blue dusk over the
// paper, at night a deeper blue-black over the ground. Nothing to click.
import { useWeather } from "./weather";

export function StormVeil() {
  const storm = useWeather() === "storm";
  return (
    <div
      aria-hidden
      data-storm-veil
      className="pointer-events-none absolute inset-0 transition-opacity duration-[1600ms] ease-out motion-reduce:transition-none"
      style={{ opacity: storm ? 1 : 0, background: "var(--storm-veil)" }}
    />
  );
}
