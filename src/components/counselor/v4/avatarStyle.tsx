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
  const [picked, set] = useAB<ConversationAvatarStyle>("v4-home-conversation-avatar", "portrait");
  return [isAvatarStyle(picked) ? picked : "portrait", set];
}

export function AvatarStyleProvider({ children }: { children: ReactNode }) {
  const [style] = useCounselorAvatarStyle();
  return <AvatarStyleContext.Provider value={style}>{children}</AvatarStyleContext.Provider>;
}

/** `quiet`: Home's small inline version beside the conversation cards; in a
 *  page heading it is a normal select, matching the filters beside it. */
export function AvatarStylePicker({ className = "", quiet = false }: { className?: string; quiet?: boolean }) {
  const [style, set] = useCounselorAvatarStyle();
  return <Listbox ariaLabel="Avatar style" value={style} onChange={(v) => { if (isAvatarStyle(v)) set(v); }} options={AVATAR_STYLE_OPTIONS} className={`${quiet ? "v4-avatar-picker" : "v4-grade-picker"} ${className}`} panelStyle={{ background: "var(--card)", color: "var(--foreground)" }} />;
}

/** A round face in the picked style, for lists and chips. */
export function StyledFace({ name, index, size, style }: { name: string; index: number; size: number; style: ConversationAvatarStyle }) {
  return (
    <span className="v4-face-round" style={{ width: size, height: size }}>
      <ConversationAvatar student={{ name, avatarIndex: index }} style={style} size={Math.max(32, size)} />
    </span>
  );
}
