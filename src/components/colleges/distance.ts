"use client";

// Real "miles from home", computed live from two real signals: the
// student's own zip code (StudentProfile.zipCode, captured in Build and
// editable in Profile > Settings) geocoded via Zippopotam.us (free, no key,
// built for exactly this), and each college's real campus coordinates
// (COLLEGE_COORDS in data.ts, geocoded once via Nominatim/OpenStreetMap).
// When there's no zip on file yet -- the common case for a first-time demo
// visitor who hasn't done Build -- there's no real reference point to
// measure from, so the card falls back to a seeded (deterministic, not
// random-per-render) placeholder distance rather than omitting the stat or
// falling back to a different figure (direct instruction, 15 Sept 2026:
// "never fallback to finish rate... if you have to fake a distance that's
// okay for the demo").

import { useEffect, useState, useSyncExternalStore } from "react";
import { readStudentProfile, studentProfileSnapshot, subscribeStudentProfile, serverStudentProfileSnapshot } from "@/lib/studentProfile";
import type { Coords } from "./data";

const ZIP_COORDS_CACHE_KEY = "dreamari-zip-coords-cache";

function readZipCache(): Record<string, Coords | null> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ZIP_COORDS_CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function writeZipCache(cache: Record<string, Coords | null>) {
  try {
    window.localStorage.setItem(ZIP_COORDS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // no storage: the lookup just runs again next time
  }
}

let memCache: Record<string, Coords | null> | null = null;
const inFlight = new Map<string, Promise<Coords | null>>();

async function geocodeZip(zip: string): Promise<Coords | null> {
  if (memCache === null) memCache = readZipCache();
  if (zip in memCache) return memCache[zip];
  const existing = inFlight.get(zip);
  if (existing) return existing;
  const request = (async () => {
    let coords: Coords | null = null;
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (res.ok) {
        const data = await res.json();
        const place = data?.places?.[0];
        if (place) coords = { lat: Number(place.latitude), lng: Number(place.longitude) };
      }
    } catch {
      // offline or the service is down: cache nothing, try again next time
      inFlight.delete(zip);
      return null;
    }
    memCache![zip] = coords;
    writeZipCache(memCache!);
    inFlight.delete(zip);
    return coords;
  })();
  inFlight.set(zip, request);
  return request;
}

/** The student's real home coordinates, resolved from their real zip code.
 *  `null` while unresolved or when there's no valid zip on file -- callers
 *  fall back to `seededMiles` in that case. */
export function useHomeCoords(): Coords | null {
  const profile = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  const zip = /^\d{5}$/.test(profile.zipCode) ? profile.zipCode : "";
  // Tagged with the zip it was resolved for, so a still-in-flight lookup
  // from a previous zip never gets attributed to the current one. The
  // initializer reads localStorage directly (not the `memCache` module
  // variable, which is only ever populated inside `geocodeZip` -- itself
  // only called from the effect below) -- without this, every card on
  // every page load showed the seeded placeholder first and then jumped to
  // the real distance a moment later, even for a zip resolved many times
  // before, which is what read as a stray line/glitch through the stat
  // (two different numbers briefly overlapping mid-repaint).
  const [resolved, setResolved] = useState<{ zip: string; coords: Coords | null } | null>(() => {
    if (!zip) return null;
    if (memCache === null) memCache = readZipCache();
    return zip in memCache ? { zip, coords: memCache[zip] } : null;
  });
  useEffect(() => {
    if (!zip) return;
    let cancelled = false;
    geocodeZip(zip).then((c) => {
      if (!cancelled) setResolved({ zip, coords: c });
    });
    return () => {
      cancelled = true;
    };
  }, [zip]);
  if (!zip) return null;
  return resolved && resolved.zip === zip ? resolved.coords : null;
}

/** Same as `useHomeCoords`, for the rare non-component caller (there are
 *  none today, but a synchronous read is occasionally simpler than the
 *  hook). Reads whatever's cached; does not kick off a fetch. */
export function cachedHomeCoords(): Coords | null {
  const profile = readStudentProfile();
  const zip = /^\d{5}$/.test(profile.zipCode) ? profile.zipCode : "";
  if (!zip) return null;
  if (memCache === null) memCache = readZipCache();
  return memCache[zip] ?? null;
}

export function haversineMiles(a: Coords, b: Coords): number {
  const R = 3958.8; // Earth's radius, miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Deterministic per-college placeholder (same seeded-hash technique as
 *  `synthDetail` in data.ts) for when there's no real home zip to measure
 *  from -- a fixed, plausible-looking number, not a fresh random one on
 *  every render. */
export function seededMiles(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
  const t = (h % 1000) / 1000;
  return Math.round(12 + t * 420);
}

export function milesLabel(miles: number): string {
  return `${miles.toLocaleString("en-US")} mi`;
}
