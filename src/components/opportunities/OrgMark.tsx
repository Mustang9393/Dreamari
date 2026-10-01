"use client";

// The provider's mark on every card and detail (1 Oct 2026; Chandu: "use
// logos wherever we can"). Three sources, in order:
// 1. A partner mark the repo already ships (EY, JPMorgan Chase, AT&T).
// 2. DEMO-ONLY: the provider's own favicon via Google's favicon service,
//    keyed on the domain of the official page we link to. No student data
//    leaves the app (only the provider's hostname). Production stores a
//    licensed logo per provider instead.
// 3. The initial on a tinted tile, like MarkBadge does for a school with
//    no mark, so a failed load never shows a broken image.

import { useState } from "react";
import { seedHash } from "@/lib/localRecord";

const LOCAL: Record<string, string> = {
  "ey.com": "/images/connect/partners/ey-white.png",
  "jpmorganchase.com": "/images/connect/partners/jpmc-white.png",
  "att.com": "/images/connect/partners/att-white.png",
};

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

export function OrgMark({ url, name, size = 44, className = "" }: { url: string; name: string; size?: number; className?: string }) {
  const host = hostOf(url);
  const local = LOCAL[host];
  const [failed, setFailed] = useState(false);
  const hue = seedHash(host) % 360;
  const letter = name.replace(/^the\s+/i, "")[0]?.toUpperCase() ?? "?";
  const style = { width: size, height: size } as const;
  if (local) {
    return (
      <span aria-hidden className={`relative flex flex-none items-center justify-center overflow-hidden rounded-[12px] border ${className}`} style={{ ...style, background: "rgba(255,255,255,0.08)", borderColor: "var(--glass-border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a local static mark; next/image needs sizes it does not have */}
        <img src={local} alt="" className="h-[62%] w-[62%] object-contain" />
      </span>
    );
  }
  if (failed) {
    return (
      <span aria-hidden className={`flex flex-none items-center justify-center rounded-[12px] ${className}`} style={{ ...style, background: `hsl(${hue} 40% 32%)`, color: "#fff", fontFamily: "var(--font-display)", fontSize: Math.round(size * 0.42), fontWeight: 800 }}>
        {letter}
      </span>
    );
  }
  return (
    <span aria-hidden className={`relative flex flex-none items-center justify-center overflow-hidden rounded-[12px] ${className}`} style={{ ...style, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- DEMO-ONLY remote favicon; see the file comment */}
      <img src={`https://www.google.com/s2/favicons?sz=128&domain=${host}`} alt="" width={size} height={size} className="h-[64%] w-[64%] object-contain" onError={() => setFailed(true)} />
    </span>
  );
}
