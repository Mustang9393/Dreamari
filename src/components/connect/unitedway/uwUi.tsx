"use client";

// Small pieces every United Way surface shares: the brand colours as the
// board uses them, the sheet, form fields, the toast, avatars for the three
// kinds of people, and the "Viewing as" switch (15 Oct 2026). Kept in one
// file so the board, its communities, Team and the event boards look the
// same without importing each other.

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { Listbox } from "@/components/app/Listbox";
import { Avatar, VerifiedBadge } from "../primitives";
import * as D from "./uwData";
import type { UwPerson } from "./uwCommunity";

export const BLUE = D.BRAND.blue;
export const BLUE_TEXT = D.BRAND.blueText;
export const GOOD = "var(--world-food-farming-nature)";
export const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;
export const SOLID = { background: BLUE, color: "#fff" } as const;
export const HERO_BOX = { background: `linear-gradient(135deg, color-mix(in srgb, ${BLUE} 30%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${BLUE} 45%, var(--glass-border))` } as const;
export const MUTED = "var(--muted-foreground)";
export const QUIET = "color-mix(in srgb, var(--muted-foreground) 80%, transparent)";
export const RULE_SOFT = "var(--glass-border)";

export function Eyebrow({ children, tone = BLUE_TEXT }: { children: ReactNode; tone?: string }) {
  return <span className="block text-[11px] leading-[15px] font-extrabold capitalize" style={{ color: tone }}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex flex-col gap-[6px] text-[13px] font-bold" style={{ color: MUTED }}>{label}{children}</label>;
}
export const INPUT = "h-[44px] w-full rounded-[var(--radius-md)] border px-[12px] text-[15px] font-medium outline-none focus-visible:ring-2";
export const INPUT_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
export const TEXTAREA = "w-full resize-none rounded-[var(--radius-md)] border p-[12px] text-[15px] leading-[21px] outline-none focus-visible:ring-2";

/** Choice chips: one pick. */
export function ChoiceChips<K extends string>({ options, value, onChange, ariaLabel }: { options: { key: K; label: string; icon?: ReactNode }[]; value: K | undefined; onChange: (v: K) => void; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-[8px]">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.key)} className="dm-quiet flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[14px] font-semibold"
            style={{ borderColor: on ? BLUE : "var(--glass-border)", background: on ? `color-mix(in srgb, ${BLUE} 22%, transparent)` : "transparent", color: "var(--foreground)" }}>
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/** A small dropdown that reads as a setting, never a second tab row. */
export function PillSelect<K extends string>({ value, onChange, options, ariaLabel }: { value: K; onChange: (v: K) => void; options: { value: K; label: string }[]; ariaLabel: string }) {
  return (
    <Listbox ariaLabel={ariaLabel} value={value} onChange={(v) => onChange(v as K)} options={options}
      className="flex min-h-[38px] cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
  );
}

export function Sheet({ title, onClose, children, titleId, photo, focus }: { title: string; onClose: () => void; children: ReactNode; titleId: string; photo?: string; focus?: string }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[28px]" style={{ background: "rgba(5,7,15,0.6)" }} />
        <div className="dm-scroll relative z-[1] flex max-h-[calc(calc(100dvh/var(--vz,1))-96px)] w-full max-w-[480px] flex-col overflow-y-auto rounded-[var(--radius-xl)] border sm:max-h-[calc(88dvh/var(--vz,1))] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: `color-mix(in srgb, ${BLUE} 40%, var(--glass-border))`, boxShadow: `0 30px 90px -34px color-mix(in srgb, ${BLUE} 45%, transparent), 0 16px 48px -4px rgba(0,0,0,0.55)` }}>
          {photo && (
            <div className="relative aspect-[16/9] w-full flex-none overflow-hidden">
              <Image src={photo} alt="" fill sizes="480px" className="object-cover" style={{ objectPosition: focus ?? "50% 35%" }} />
              <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--card) 0%, transparent 45%)" }} />
            </div>
          )}
          <IconTip label="Close" className="absolute top-[12px] right-[12px] z-10">
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border" style={photo ? { color: "#fff", background: "rgba(6,8,18,0.55)", borderColor: "rgba(255,255,255,0.25)" } : { color: "var(--foreground)", background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}><X className="h-4 w-4" aria-hidden /></button>
          </IconTip>
          <div className={`flex flex-col gap-[var(--space-4)] px-[var(--space-6)] pb-[var(--space-6)] ${photo ? "pt-[var(--space-2)]" : "pt-[var(--space-6)] pr-[56px]"}`}>
            <h2 id={titleId} className="text-[24px] leading-[28px] font-extrabold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
}

export function useToast(): [ReactNode, (text: string) => void] {
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);
  const node = toast ? (
    <Portal>
      <div role="status" className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] max-w-[calc(calc(100vw/var(--vz,1))-32px)] -translate-x-1/2 rounded-full border px-[16px] py-[10px] text-center text-[13.5px] font-semibold" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7)" }}>{toast}</div>
    </Portal>
  ) : null;
  return [node, setToast];
}

/** A person's name, role line and face, whoever they are. Students wear
 *  the app's illustrated avatar (never a photo: they are minors);
 *  volunteers their Connect portrait; United Way staff their headshot. */
export function personName(p: UwPerson): string {
  if (p.kind === "volunteer") return D.VOLUNTEERS[p.proId]?.name ?? "Volunteer";
  return p.name;
}
export function personLine(p: UwPerson): string {
  if (p.kind === "student") return [p.grade, p.place].filter(Boolean).join(" · ");
  if (p.kind === "volunteer") { const pro = D.VOLUNTEERS[p.proId]; return pro ? `${pro.role} · ${pro.org}` : "Volunteer"; }
  return `${p.role} · ${p.office}`;
}
export const PERSON_CHIP: Record<UwPerson["kind"], string> = { student: "Student", volunteer: "Volunteer", staff: "United Way" };
export function PersonAvatar({ who, size = 40 }: { who: UwPerson; size?: number }) {
  if (who.kind === "staff") return <Avatar name={who.name} photo={D.staffPhoto(who)} size={size} />;
  return <Avatar name={personName(who)} size={size} />;
}
/** Who someone is, in one small chip after their name. */
export function PersonChip({ who }: { who: UwPerson }) {
  if (who.kind === "volunteer") return <VerifiedBadge size={13} />;
  if (who.kind === "staff") return <span className="inline-flex flex-none items-center rounded-full px-[7px] py-[1px] text-[11px] leading-[15px] font-bold" style={SOLID}>United Way</span>;
  return null;
}

/** "Viewing as": the demo POV switch in the board's header (15 Oct 2026,
 *  Maisha: "For demo purposes, we should be able to switch between these
 *  POVs"). Small and quiet like the app's other demo switches (the AT&T
 *  board's version chip), so it reads as a setting, not a tab row. */
export function PovSwitch({ pov, onChange }: { pov: D.UwPov; onChange: (p: D.UwPov) => void }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-[6px] sm:w-auto sm:flex-row sm:items-center sm:gap-[8px]">
      <span className="flex-none text-[11px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ color: MUTED }}>Viewing as</span>
      <div role="radiogroup" aria-label="Viewing as" className="flex min-w-0 gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        {D.POVS.map((o) => {
          const on = o.key === pov;
          return (
            <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.key)} className="dm-quiet flex min-h-[32px] flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-[10px] text-[12.5px] leading-[16px] font-bold whitespace-nowrap sm:flex-none"
              style={on ? { background: o.key === "team" ? D.BRAND.yellow : BLUE, color: o.key === "team" ? "#1a1300" : "#fff" } : { color: MUTED }}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
