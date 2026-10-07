"use client";

// One student face for every v5 screen, following the avatar A/B switch
// (Chandu, 7 Oct 2026: "have a toggle in v5 to switch the avatars... so I
// can discuss it"): the illustrated portraits the demo already uses, or the
// generated line art on a gray disc (v6's LineAvatar, toned from the
// portrait the roster matched to the name). The anime faces were dropped
// everywhere, toggle included (Chandu, 7 Oct 2026: "let's not have the
// anime art style anywhere, even as a toggle"); a saved "anime" choice
// falls back to the portraits.

import Image from "next/image";
import { studentPortraitSrc, useStudentAvatarSrc } from "@/lib/avatar";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { ABSwitch, useAB } from "../abTests";
import { LineAvatar } from "../v6/LineAvatar";
import { LIVE_TRAITS, PORTRAIT_TRAITS } from "../v6/avatarTraits";

type Style = "portrait" | "line";

export function StudentFace({ s, size = 40, fill = false, className = "" }: { s: Pick<CounselorStudent, "id" | "avatarIndex">; size?: number; /** fill a card's picture area instead of a round chip */ fill?: boolean; className?: string }) {
  const [picked] = useAB<Style>("v5-avatar", "portrait");
  const style: Style = picked === "line" ? "line" : "portrait";
  const live = useStudentAvatarSrc("Jordan");
  const traits = s.avatarIndex >= 0 ? PORTRAIT_TRAITS[s.avatarIndex] ?? LIVE_TRAITS : LIVE_TRAITS;
  const box = { width: size, height: size };
  if (fill) {
    if (style === "line") return <LineAvatar seed={s.id} tone={traits.t} className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
    return <Image src={s.avatarIndex >= 0 ? studentPortraitSrc(s.avatarIndex) : live} alt="" fill sizes="240px" className={`object-cover object-top ${className}`} />;
  }
  if (style === "line") return <span className={`block flex-none overflow-hidden rounded-full ${className}`} style={box}><LineAvatar seed={s.id} tone={traits.t} className="h-full w-full" /></span>;
  const src = s.avatarIndex >= 0 ? studentPortraitSrc(s.avatarIndex) : live;
  return <Image src={src} alt="" width={Math.max(64, size * 2)} height={Math.max(64, size * 2)} className={`flex-none rounded-full object-cover ${className}`} style={{ ...box, background: "var(--secondary)" }} />;
}

/** DEMO-ONLY: the avatar switch, placed next to the student lists. */
export function AvatarSwitch() {
  return <ABSwitch<Style> test="v5-avatar" fallback="portrait" options={[{ key: "portrait", label: "Portraits" }, { key: "line", label: "Line art" }]} why="Student faces: the illustrated portraits (they repeat across students) or generated line art on a gray disc (never repeats, needs no photos). Open because the portraits are richer, the line art scales to any caseload." />;
}
