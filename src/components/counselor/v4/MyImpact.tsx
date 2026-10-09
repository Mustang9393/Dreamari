"use client";

// My Impact (v4). One page in Maisha's order with the Replit's numbers
// (CounselorImpact.tsx, 27 Sept 2026, content reset 9 Oct 2026 to her My
// Impact image). `scope="school"` is the Lead Counselor's School Impact:
// the same six sections for the whole school, headed by the school
// (9 Oct 2026: "School Impact follows the same structure"). The tabbed
// school version this file used to hold is gone with it.

import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { CounselorImpact } from "./CounselorImpact";
import { NEUTRAL_SLICE, PRIMARY, TARGET_LINE } from "./palette";

const BODY = { fontFamily: "var(--font-body)" } as const;
const FILL = { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const };

/** A rate or a comparison: short label, value, one thin bar. `muted`
 *  draws the bar in the neutral (a benchmark, not a result). Kept for the
 *  component lab's chart catalog. */
export function BarRow({ label, value, pct, muted, tick }: { label: string; value: string; pct: number; muted?: boolean; /** a benchmark tick, as % of the bar */ tick?: number }) {
  const reduce = useReducedMotion();
  const color = muted ? NEUTRAL_SLICE : PRIMARY;
  return (
    <li className="flex flex-col gap-[5px]">
      <span className="flex items-baseline justify-between gap-[12px] text-[12.5px]" style={BODY}>
        <span className="truncate font-medium" style={{ color: muted ? "var(--muted-foreground)" : "var(--foreground)" }}>{label}</span>
        <span className="flex-none font-bold tabular-nums" style={{ color: muted ? "var(--muted-foreground)" : "var(--foreground)" }}>{value}</span>
      </span>
      <span className="relative block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }} aria-hidden>
        <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }} transition={FILL} style={{ background: muted ? color : `linear-gradient(90deg, color-mix(in srgb, ${color} 35%, transparent), ${color})` }} />
        {typeof tick === "number" && <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${tick}% - 1px)`, background: TARGET_LINE }} />}
      </span>
    </li>
  );
}

// A real photo, not the illustrated black/white portrait the roster wears
// everywhere else (direct instruction: "Add a photo avatr and cover image
// to the my impact screen like we did for student profiles. Use one of
// the ehadshots not the black and white style avatarrs we have"): the
// counselor is an adult professional, so this borrows Connect's real
// headshot photos. No account field for this exists yet, so it is a
// deterministic pick off the counselor's own name, the same "no backend,
// seeded pick" convention avatarIndexForName already uses for students.
export const COUNSELOR_HEADSHOTS = ["/images/connect/avatars/pro-rossi.jpg", "/images/connect/avatars/pro-martinez.jpg", "/images/connect/avatars/pro-tanaka.jpg", "/images/connect/avatars/pro-brooks.jpg", "/images/connect/avatars/pro-desai.png", "/images/connect/avatars/pro-cole.jpg"];
// One pinned, vibrant cover rather than a seeded pick (direct instruction:
// "use a better cover image for sarah chen too. Something vibrant").
export const COUNSELOR_COVER = "/images/profile/covers/fluid-paint.webp";
export function seededPick<T>(seed: string, pool: T[]): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return pool[Math.abs(hash) % pool.length];
}

export function CounselorHeadshot({ src, size = 64 }: { src: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex flex-none items-center justify-center rounded-full border-2" style={{ width: size, height: size, borderColor: "rgba(255,255,255,0.9)", background: "color-mix(in srgb, var(--primary) 22%, var(--card))" }}>
        <UserRound className="h-1/2 w-1/2" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </span>
    );
  }
  return (
    <Image
      key={src}
      src={src}
      alt=""
      width={128}
      height={128}
      className="flex-none rounded-full border-2 object-cover"
      style={{ width: size, height: size, borderColor: "rgba(255,255,255,0.9)" }}
      onError={() => setFailed(true)}
    />
  );
}

export function MyImpact({ scope = "mine" }: { scope?: "mine" | "school" }) {
  return <CounselorImpact scope={scope} />;
}
