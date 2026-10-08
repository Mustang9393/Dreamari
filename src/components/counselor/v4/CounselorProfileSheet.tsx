"use client";

// The counselor's own profile in v4 (9 Oct 2026, Maisha: "Add the clickable
// counselor profile to v4"). v5 already has it (v5/Profile.tsx: your card
// as students see it, your team for handoffs, safety contacts, roster sync,
// what was sent for you); v4 opens that same view in a wide sheet from the
// account chip in the top bar instead of building a second copy, so an
// edit made in either build is the same stored card. The role switcher the
// chip used to open sits in the sheet's header, so the demo can still
// change roles in two clicks.
// The sheet wears a v4 page heading ("My Profile", the counselor's name and
// role under it) and hides v5's own all-caps "PROFILE" h1 inside it, because
// every v4 title is Title Case (Maisha's rule); the rule is scoped in
// profileSheet.css, v5.css is untouched.
// Portalled like v5's LogSheet, inside its own marketing-v2 wrapper so the
// app's tokens resolve outside the v4 workspace tree. On a phone the
// office-hours rows wrap their times under the day instead of running off
// the sheet's edge. role=dialog with aria-modal, so Back and Escape close
// it (backStep.ts).

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { V5Profile } from "../v5/Profile";
import { useDialogFocus } from "./useDialogFocus";
import "../v5/v5.css";
import "./profileSheet.css";

const noop = () => () => {};

export function CounselorProfileSheet({ open, onClose, name, role, header }: { open: boolean; onClose: () => void; name: string; role: string; /** shown left of the close button (the role switcher) */ header?: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  useDialogFocus(open, panel, onClose);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!open || !mounted) return null;
  return createPortal(
    <div className="marketing-v2 themeable counselor-calm" style={{ color: "var(--foreground)" }}>
      <div className="fixed inset-0 z-[90] flex justify-end">
        <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.55)", backdropFilter: "blur(2px)" }} />
        <aside ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="My Profile" className="v4-profile-sheet dm-scroll relative flex h-full w-full max-w-[1120px] flex-col overflow-x-hidden overflow-y-auto border-l outline-none" style={{ background: "var(--background)", borderColor: "var(--glass-border)", boxShadow: "-24px 0 60px -30px rgba(0,0,0,0.6)" }}>
          <div className="v4-profile-sheet-head v4-page-heading">
            <div>
              <span className="v4-overline">Account</span>
              <h1>My Profile</h1>
              <p className="v4-page-purpose">{name} · {role}</p>
            </div>
            <div className="v4-profile-sheet-tools">
              {header}
              <IconTip label="Close">
                <button type="button" onClick={onClose} aria-label="Close profile" className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ color: "var(--foreground)", borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <X className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </IconTip>
            </div>
          </div>
          <div className="v4-profile-sheet-body px-[var(--space-5)] pb-[var(--space-12)] sm:px-[var(--space-8)]">
            <V5Profile />
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
