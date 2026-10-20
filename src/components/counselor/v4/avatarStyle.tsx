"use client";

// One avatar style for every student face in the v4 counselor app (10 Oct
// 2026, Chandu: "make sure the dropdown is there for every screen that has
// them"). The Home conversation cards' A/B setting is the one setting; the
// Workspace provides it to everything under it, the shared Avatar
// (../chips.tsx) and StudentFace (../v5/StudentFace.tsx) read it, and the
// picker sits in the page heading of every screen that shows faces. Outside
// v4 there is no provider, so the other builds keep their own avatars.
// DEMO-ONLY, like the styles themselves (ConversationAvatar.tsx).

import { createContext, useContext, type ReactNode } from "react";
import { useAB } from "../abTests";
import { AVATAR_STYLE_OPTIONS, ConversationAvatar, isAvatarStyle, type ConversationAvatarStyle } from "./ConversationAvatar";
import { Listbox } from "./Listbox";

export const AvatarStyleContext = createContext<ConversationAvatarStyle | null>(null);
export const useAvatarStyleContext = () => useContext(AvatarStyleContext);

export function useCounselorAvatarStyle(): [ConversationAvatarStyle, (v: ConversationAvatarStyle) => void] {
  // Voxel Art is the default (20 Oct 2026, Chandu: "lets default to the
  // voxel art for student pictures"). A new key, so a pick saved while
  // Portraits was the default does not hide the new default.
  const [picked, set] = useAB<ConversationAvatarStyle>("v4-avatar-style-2", "voxel-art");
  return [isAvatarStyle(picked) ? picked : "voxel-art", set];
}

export function AvatarStyleProvider({ children }: { children: ReactNode }) {
  const [style] = useCounselorAvatarStyle();
  return <AvatarStyleContext.Provider value={style}>{children}</AvatarStyleContext.Provider>;
}

/** `quiet`: Home's small inline version beside the conversation cards; in a
 *  page heading it is a normal select, matching the filters beside it. */
export function AvatarStylePicker({ className = "", quiet = false, subtle = false }: { className?: string; quiet?: boolean; /** the footer's small text-only version */ subtle?: boolean }) {
  const [style, set] = useCounselorAvatarStyle();
  return <Listbox ariaLabel="Avatar style" value={style} onChange={(v) => { if (isAvatarStyle(v)) set(v); }} options={AVATAR_STYLE_OPTIONS} className={`${subtle ? "v4-avatar-subtle" : quiet ? "v4-avatar-picker" : "v4-grade-picker"} ${className}`} panelStyle={{ background: "var(--card)", color: "var(--foreground)" }} />;
}

/** A round face in the picked style, for lists and chips. */
export function StyledFace({ name, index, size, style }: { name: string; index: number; size: number; style: ConversationAvatarStyle }) {
  return (
    <span className="v4-face-round" style={{ width: size, height: size }}>
      <ConversationAvatar student={{ name, avatarIndex: index }} style={style} size={Math.max(32, size)} />
    </span>
  );
}
