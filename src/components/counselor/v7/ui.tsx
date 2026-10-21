"use client";

// v7's few shared pieces. Everything else is the student app's own
// components (PosterCard, the opportunity Poster, TextTabs, Listbox) or v5's
// counselor pieces (sheets, faces, the review desk), so v7 adds no new
// visual language: same tokens, same type, Black & Blue by default.
//
// The budget every v7 screen follows (Chandu, 20 Oct 2026, on v4: "too
// cluttered, messy, and A LOT in the user's face"; the standing counselor
// rules in docs/AI_HANDOFF.md): one lit action per screen, blue plus the
// three status colors only, one line per row, a status said once as a dot
// and a word, lists open with what needs attention first.

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { FactSheet } from "@/components/career/PaySheet";
import { skyMoment } from "@/components/app/NightSky";
import { PAGE_TITLE_CLASS as PAGE_TITLE_CLASS_LOCAL } from "@/components/app/chrome";
export { SheetHero } from "@/components/career/PaySheet";
import { IconTip } from "@/components/app/IconTip";
import type { CaseloadStatus } from "@/lib/counselorRoster";
import { cv } from "@/lib/counselorBase";

export const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
export const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
export const MUTED = { color: "var(--muted-foreground)" } as const;
export const DISPLAY = { fontFamily: "var(--font-display)" } as const;

// One type scale for every v7 screen (Chandu, 20 Oct 2026: "All pages need a
// hierarchy, spacing, typography, visual pass"; standing rule: heading >
// subheading > body by size, top-down, never by perceived importance).
//   page title 32/44 · section 22/24 · card title 18 · body 15 / 14 / 13 ·
//   label 12 caps. Figures: hero 48, stat 24.
/** a page-level title that is a name or a greeting, not a place: same size, no caps */
export const TITLE = "text-[32px] leading-[1.05] font-extrabold text-balance sm:text-[44px]";
export const H2 = "min-w-0 text-[22px] leading-[28px] font-extrabold text-balance sm:text-[24px] sm:leading-[30px]";
export const H3 = "text-[18px] leading-[24px] font-extrabold";
export const FIGURE = "text-[48px] leading-[0.95] font-extrabold tabular-nums";
/** the gap between a page's sections, the same on every page */
export const SECTIONS = "flex flex-col gap-[48px] pt-[var(--space-2)] lg:gap-[56px] lg:pt-[var(--space-4)]";

/** v7 links stay inside v7. */
// through the shared base (V7App sets v=7), so v7 screens v4 borrows for
// Prepare (20 Oct 2026, Chandu: "match the prepare stuff to the v7") link
// inside v4; in v7 it is the same address as before
export const v7 = (view: string, extra = "") => cv(view, extra);
export const studentHref = (id: string, tab?: string) => v7("students", `&studentId=${encodeURIComponent(id)}${tab ? `&tab=${tab}` : ""}`);
export const briefHref = (id: string) => v7("prepare", `&studentId=${encodeURIComponent(id)}`);

/** The status colors mean state, never identity. On Track is quiet. */
export const STATUS_DOT: Record<CaseloadStatus, string> = {
  "On Track": "color-mix(in srgb, var(--foreground) 35%, transparent)",
  "Needs Attention": "var(--color-feedback-warning-solid)",
  "At Risk": "var(--color-feedback-danger-solid)",
};

export function Status({ status, label }: { status: CaseloadStatus; label?: string }) {
  return (
    <span className="inline-flex items-center gap-[7px] text-[13px] leading-[18px] font-semibold whitespace-nowrap">
      <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: STATUS_DOT[status] }} />
      {label ?? status}
    </span>
  );
}

/** A page's title block: the heading, one short line, and at most one action. */
export function PageHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-[var(--space-5)] sm:flex-row sm:items-end sm:justify-between">
      <h1 className={PAGE_TITLE_CLASS_LOCAL} style={DISPLAY}>{title}</h1>
      {action && <div className="flex flex-none items-center gap-[var(--space-3)]">{action}</div>}
    </header>
  );
}

/** A section title, one step under the page title, with an optional quiet link. */
export function SectionHead({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-[var(--space-4)]">
      <h2 className={H2} style={DISPLAY}>{title}</h2>
      {href && cta && <TextLink href={href}>{cta}</TextLink>}
    </div>
  );
}

export function TextLink({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
  const cls = "dm-quiet group inline-flex flex-none items-center gap-[6px] rounded-[var(--radius-sm)] text-[14px] leading-[20px] font-semibold";
  const inner = <>{children}<ArrowRight className="h-[15px] w-[15px] transition-transform group-hover:translate-x-[2px]" aria-hidden /></>;
  if (href) return <Link href={href} className={cls} style={{ color: "var(--pc-link, var(--color-text-brand))" }}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={`${cls} cursor-pointer`} style={{ color: "var(--pc-link, var(--color-text-brand))" }}>{inner}</button>;
}

/** The screen's one lit action. */
export function PrimaryButton({ href, onClick, children, icon }: { href?: string; onClick?: () => void; children: React.ReactNode; icon?: React.ReactNode }) {
  const cls = "dm-solid inline-flex min-h-[44px] items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold whitespace-nowrap";
  const style = { background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-body)" };
  if (href) return <Link href={href} className={cls} style={style}>{icon}{children}</Link>;
  return <button type="button" onClick={onClick} className={`${cls} cursor-pointer`} style={style}>{icon}{children}</button>;
}

/** Everything that is not the lit action: outlined, quiet. */
export function QuietButton({ href, onClick, children, icon, label }: { href?: string; onClick?: () => void; children?: React.ReactNode; icon?: React.ReactNode; /** icon-only buttons get a tooltip with this label */ label?: string }) {
  const iconOnly = !children;
  const cls = `dm-quiet inline-flex min-h-[40px] items-center justify-center gap-[8px] rounded-[var(--radius-md)] border text-[14px] font-semibold whitespace-nowrap ${iconOnly ? "w-[40px]" : "px-[var(--space-4)]"}`;
  const style = { borderColor: "var(--glass-border)", fontFamily: "var(--font-body)", color: "var(--foreground)" };
  const el = href
    ? <Link href={href} aria-label={label} className={cls} style={style}>{icon}{children}</Link>
    : <button type="button" aria-label={label} onClick={onClick} className={`${cls} cursor-pointer`} style={style}>{icon}{children}</button>;
  return iconOnly && label ? <IconTip label={label}>{el}</IconTip> : el;
}

/** One quiet surface. No tints, no glow: the rim light comes from look-v2. */
export const CARD = "v7-glass rounded-[var(--radius-lg)] border";
export const CARD_STYLE = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)" } as const;

export function ChevronGo() {
  return <ChevronRight className="h-4 w-4 flex-none opacity-60" aria-hidden />;
}

/** Every v7 pop-up wears the Career Detail fact-sheet frame ("What it
 *  pays", PaySheet.tsx's FactSheet): the dark scrim, the accent-lit card,
 *  an eyebrow over the title, the round close, a spring in, a bottom sheet
 *  on phones and a centred card above 640px (Chandu, 20 Oct 2026: "design
 *  all the pop ups with dreamari's design standards like we did for what
 *  it pays"). The counselor accent is the brand blue. */
export const SHEET_ACCENT = "var(--color-brand-400, var(--primary))";
export function Modal({ title, overline, onClose, children, footer, wide = false, maxWidth, accent = SHEET_ACCENT }: { title: string; overline?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean; maxWidth?: number; accent?: string }) {
  return (
    <FactSheet career={overline ?? ""} accent={accent} title={title} onClose={onClose} footer={footer} wide={wide} maxWidth={maxWidth}>
      {children}
    </FactSheet>
  );
}

export const FIELD = "h-11 w-full rounded-[var(--radius-md)] border bg-transparent px-[12px] text-[15px] outline-none focus-visible:ring-2";
export const FIELD_STYLE = { borderColor: "var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)" } as const;

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[13px] font-semibold" style={MUTED}>{label}</span>
      {children}
    </label>
  );
}

/** A two-option switch (Agenda | Calendar), the app's segmented look. */
export function Toggle<K extends string>({ options, value, onChange, label }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-none rounded-full border p-[3px]" style={{ borderColor: "var(--glass-border)" }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.key)}
            className={`dm-seg h-[34px] rounded-full px-[14px] text-[13px] font-semibold ${on ? "" : "cursor-pointer"}`}
            style={on ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** A valuable action landed: the sky lights up from where it happened
 *  (NightSky skyMoment). `big` (something reached students, a meeting was
 *  confirmed) adds a shooting star. Call it before closing a sheet, so the
 *  pressed button still gives the origin. */
export function moment(big = false): void {
  skyMoment({ from: typeof document !== "undefined" ? document.activeElement : null, big });
}
