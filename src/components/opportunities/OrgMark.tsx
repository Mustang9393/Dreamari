"use client";

// The provider's mark on every card and detail (1 Oct 2026; Chandu: "use
// logos wherever we can", then "the pictures/logos used are really low
// quality and pixelating for some"). Measured on 1 Oct: Google's favicon
// service hands back a 16px or 32px icon for many providers (Coolidge 16,
// NJIT 16, Horatio Alger 32, MSK 32) and upscales it, which is the
// pixelation; others are fine (the Met 256, Rutgers 256, MIT 128). So:
// 1. A partner mark the repo already ships (EY, JPMorgan Chase, AT&T).
// 2. DEMO-ONLY: the provider's own icon, keyed on the domain of the official
//    page we link to, from Google's favicon service and then DuckDuckGo's;
//    the first that is at least 64px wins. Only the hostname leaves the app.
//    Production stores a licensed logo per provider instead.
// 3. Otherwise the initial on a tinted tile, crisp at any size, like
//    MarkBadge does for a school with no mark.
// 3 Oct 2026 (Joshua: the letter squares are "visual clutter with no
// additional value"): cards show no mark at all now, and the detail page
// passes `bare`, which renders nothing unless a real logo resolves. The
// tile stays only for Connect's feed, which still asks for it.

import { useEffect, useState } from "react";
import { seedHash } from "@/lib/localRecord";

const LOCAL: Record<string, string> = {
  "ey.com": "/images/connect/partners/ey-white.png",
  "jpmorganchase.com": "/images/connect/partners/jpmc-white.png",
  "att.com": "/images/connect/partners/att-white.png",
};
// DEMO-ONLY: official logos saved from the provider's own site, for the
// providers the demo leads with whose favicon is too small to use (Home's
// scholarship card, 4 Oct 2026: "can we not get the official logo"), each
// with the background it is drawn for on that site (Horatio Alger's is
// white lettering made for its navy header). Production stores a licensed
// logo per provider.
const OFFICIAL: Record<string, { src: string; bg: string }> = {
  "horatioalger.org": { src: "/images/opportunities/logos/horatio-alger.webp", bg: "#1d283f" },
};
/** The background a provider's logo is meant to sit on: its brand colour
 *  for an official logo, else white (remote icons are dark on light). */
export function orgLogoBackground(url: string): string {
  return OFFICIAL[hostOf(url)]?.bg ?? "#fff";
}
const MIN_PX = 64;
const SOURCES = [
  (h: string) => `https://www.google.com/s2/favicons?sz=128&domain=${h}`,
  (h: string) => `https://icons.duckduckgo.com/ip3/${h}.ico`,
];
// Resolved once per host for the session, so a grid of cards does not probe twice.
const resolved = new Map<string, Promise<string | null>>();
function resolve(host: string): Promise<string | null> {
  let p = resolved.get(host);
  if (!p && OFFICIAL[host]) { p = Promise.resolve(OFFICIAL[host].src); resolved.set(host, p); }
  if (!p) {
    p = (async () => {
      for (const src of SOURCES) {
        const url = src(host);
        const w = await new Promise<number>((r) => { const i = new Image(); i.onload = () => r(i.naturalWidth); i.onerror = () => r(0); i.src = url; });
        if (w >= MIN_PX) return url;
      }
      return null;
    })();
    resolved.set(host, p);
  }
  return p;
}

/** The provider's logo for `url`: a URL once a sharp one resolves, null
 *  when there is none, undefined while it is still being looked up. For
 *  places that want the logo or nothing, never the letter tile (Home's
 *  opportunity card, 4 Oct 2026). */
export function useOrgLogo(url: string): string | null | undefined {
  const host = hostOf(url);
  const local = LOCAL[host];
  const [src, setSrc] = useState<string | null | undefined>(local ?? undefined);
  useEffect(() => {
    if (local) return;
    let live = true;
    resolve(host).then((u) => { if (live) setSrc(u); });
    return () => { live = false; };
  }, [host, local]);
  return local ?? src;
}

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

export function OrgMark({ url, name, size = 44, className = "", bare = false }: { url: string; name: string; size?: number; className?: string; bare?: boolean }) {
  const host = hostOf(url);
  const local = LOCAL[host];
  const [src, setSrc] = useState<string | null | undefined>(local ? local : undefined);
  useEffect(() => {
    if (local) return;
    let live = true;
    resolve(host).then((u) => { if (live) setSrc(u); });
    return () => { live = false; };
  }, [host, local]);
  const hue = seedHash(host) % 360;
  const letter = name.replace(/^the\s+/i, "")[0]?.toUpperCase() ?? "?";
  const box = { width: size, height: size } as const;
  if (local) {
    return (
      <span aria-hidden className={`relative flex flex-none items-center justify-center overflow-hidden rounded-[12px] border ${className}`} style={{ ...box, background: "rgba(255,255,255,0.08)", borderColor: "var(--glass-border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a local static mark; next/image needs sizes it does not have */}
        <img src={local} alt="" className="h-[62%] w-[62%] object-contain" />
      </span>
    );
  }
  if (src) {
    return (
      <span aria-hidden className={`relative flex flex-none items-center justify-center overflow-hidden rounded-[12px] ${className}`} style={{ ...box, background: orgLogoBackground(url), boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- DEMO-ONLY remote icon; see the file comment */}
        <img src={src} alt="" width={size} height={size} className="h-[64%] w-[64%] object-contain" />
      </span>
    );
  }
  // The tile: shown while probing, and kept when no icon is sharp enough.
  if (bare) return null;
  return (
    <span aria-hidden className={`flex flex-none items-center justify-center rounded-[12px] ${className}`} style={{ ...box, background: `linear-gradient(145deg, hsl(${hue} 42% 36%), hsl(${hue} 44% 24%))`, color: "#fff", fontFamily: "var(--font-display)", fontSize: Math.round(size * 0.42), fontWeight: 800 }}>
      {letter}
    </span>
  );
}
