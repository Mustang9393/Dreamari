"use client";

// The filter-dropdown kit Explore Schools' Browse all introduced (30 Sept
// 2026), pulled out on 1 Oct 2026 so Opportunities (scholarships and
// programs) filters with the very same anatomy instead of a second one:
//   header   title, one line on what it does, Clear when something is on
//   sections a small label per group; options as rows (a label, a note, a
//            count, a check on the right) or as chips for a scale
//   footer   Show N <noun>
// Desktop: a popover under its button. Phones and tablets: the same panel
// as a bottom sheet, portalled to body (main is its own stacking context).

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import { ACCENT, SOFT } from "./shared";

// ---- Panel anatomy -----------------------------------------------------------

export function Section({ title, hint, children, first = false }: { title: string; hint?: string; children: React.ReactNode; first?: boolean }) {
  return (
    <section className={`flex flex-col gap-[8px] px-[16px] py-[14px] ${first ? "" : "border-t"}`} style={{ borderColor: "var(--glass-border)" }}>
      <span className="flex items-baseline justify-between gap-[8px]">
        <h3 className="text-[12px] leading-[16px] font-bold tracking-[0.07em] uppercase" style={{ color: "var(--muted-foreground)" }}>{title}</h3>
        {hint && <span className="text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{hint}</span>}
      </span>
      <div className="flex flex-col gap-[2px]">{children}</div>
    </section>
  );
}

export const Count = ({ n }: { n: number }) => <span className="flex h-[22px] min-w-[28px] flex-none items-center justify-center rounded-full px-[7px] text-[12px] font-semibold tabular-nums" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)", color: "var(--muted-foreground)" }}>{n}</span>;

/** One choice: label and note on the left, the count, a check on the right.
 *  Selected rows tint, so the choice reads without looking at the box. */
export function Option({ on, onToggle, label, note, count, lead, radio = false, disabled = false }: { on: boolean; onToggle: () => void; label: React.ReactNode; note?: string; count?: number; lead?: React.ReactNode; radio?: boolean; disabled?: boolean }) {
  return (
    <button type="button" role={radio ? "radio" : "checkbox"} aria-checked={on} disabled={disabled} onClick={onToggle}
      className="dm-quiet flex min-h-[48px] w-full cursor-pointer items-center gap-[12px] rounded-[10px] border px-[12px] py-[8px] text-left disabled:cursor-not-allowed disabled:opacity-40"
      style={{ borderColor: on ? "color-mix(in srgb, var(--primary) 55%, transparent)" : "transparent", background: on ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "transparent" }}>
      {lead}
      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="text-[14.5px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
        {note && <span className="text-[12.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
      </span>
      {typeof count === "number" && <Count n={count} />}
      <span aria-hidden className={`flex size-[20px] flex-none items-center justify-center ${radio ? "rounded-full" : "rounded-[6px]"} border`} style={{ borderColor: on ? ACCENT : "color-mix(in srgb, var(--foreground) 30%, transparent)", background: on ? ACCENT : "transparent" }}>
        {on && <Check className="h-[13px] w-[13px] text-white" strokeWidth={3} />}
      </span>
    </button>
  );
}

/** A scale of choices (distance, cost) as one row of chips. */
export function Chips<T extends string | number>({ options, value, onChange, label, count }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void; label: string; count?: (v: T) => number | undefined }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-[6px] px-[2px] pt-[2px]">
      {options.map((o) => {
        const on = o.key === value;
        const n = count?.(o.key);
        return (
          <button key={String(o.key)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.key)} className="dm-quiet flex h-[36px] cursor-pointer items-center gap-[6px] rounded-full border px-[13px] text-[13.5px] font-semibold whitespace-nowrap" style={on ? { background: ACCENT, borderColor: ACCENT, color: "#fff" } : { borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>
            {o.label}{typeof n === "number" && <span className="text-[12px] font-medium tabular-nums" style={{ color: on ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)" }}>{n}</span>}
          </button>
        );
      })}
    </div>
  );
}


// ---- The dropdown ------------------------------------------------------------

export type PanelProps = { title: string; description: string; onClear?: () => void; count: number; /** what the footer counts: "school" (default), "scholarship", "program" */ noun?: string; width?: number; children: React.ReactNode };

export function Dropdown({ label, value, icon, active, panel }: { label: string; value?: string; icon?: React.ReactNode; active: boolean; panel: (close: () => void) => PanelProps }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [isLg, setIsLg] = useState(true);
  const [alignRight, setAlignRight] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsLg(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const close = () => setOpen(false);
  const p = panel(close);
  const width = p.width ?? 380;
  useEffect(() => {
    if (!open) return;
    const r = btn.current?.getBoundingClientRect();
    if (r) setAlignRight(r.left + width > window.innerWidth - 24);
    const down = (e: MouseEvent) => { const t = e.target as Node; if (wrap.current && !wrap.current.contains(t) && !sheetRef.current?.contains(t)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open, width]);

  const body = (
    <div role="dialog" aria-label={p.title}
      className={`fixed inset-x-0 bottom-0 z-[116] flex max-h-[82dvh] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border pb-[env(safe-area-inset-bottom)] lg:absolute lg:inset-x-auto lg:top-[48px] lg:bottom-auto lg:z-[71] lg:max-h-[min(72dvh,600px)] lg:rounded-[16px] lg:pb-0 ${alignRight ? "lg:right-0" : "lg:left-0"}`}
      style={{ width: isLg ? `min(${width}px, calc(100vw - 32px))` : undefined, background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 28px 70px -28px rgba(0,0,0,0.8)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <header className="flex items-start justify-between gap-[12px] border-b px-[20px] pt-[16px] pb-[14px]" style={{ borderColor: "var(--glass-border)" }}>
        <span className="flex min-w-0 flex-col gap-[4px]">
          <span className="text-[17px] leading-[22px] font-bold">{p.title}</span>
          <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{p.description}</span>
        </span>
        <span className="flex flex-none items-center gap-[4px]">
          {p.onClear && <button type="button" onClick={p.onClear} className="dm-link cursor-pointer px-[6px] py-[2px] text-[13px] font-bold" style={{ color: SOFT }}>Clear</button>}
          {!isLg && <button type="button" aria-label="Close" onClick={close} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>}
        </span>
      </header>
      <div className="dm-scroll min-h-0 flex-1 overflow-y-auto">{p.children}</div>
      <footer className="flex items-center justify-end gap-[8px] border-t px-[16px] py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
        <button type="button" onClick={close} className="dm-solid flex min-h-[42px] w-full cursor-pointer items-center justify-center rounded-[10px] px-[18px] text-[14.5px] font-semibold text-white lg:w-auto" style={{ background: ACCENT }}>
          Show {p.count} {p.count === 1 ? (p.noun ?? "school") : `${p.noun ?? "school"}s`}
        </button>
      </footer>
    </div>
  );

  return (
    <div ref={wrap} className="relative flex-none">
      <button ref={btn} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className="dm-quiet flex h-[40px] cursor-pointer items-center gap-[7px] rounded-full border pr-[12px] pl-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap"
        style={active ? { background: "color-mix(in srgb, var(--primary) 20%, var(--glass-surface-1))", borderColor: ACCENT, color: "var(--foreground)" } : { background: "var(--glass-surface-1)", borderColor: open ? "color-mix(in srgb, var(--foreground) 35%, transparent)" : "var(--glass-border)", color: "var(--foreground)" }}>
        {icon}
        <span>{label}</span>
        {value && <span className="max-w-[150px] truncate font-bold" style={{ color: SOFT }}>{value}</span>}
        <ChevronDown aria-hidden className="h-4 w-4 transition-transform" style={{ color: "var(--muted-foreground)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (isLg ? body : createPortal(
        <div ref={(el) => { sheetRef.current = el; }} className="marketing-v2 themeable" style={{ background: "transparent" }}>
          <button type="button" aria-label="Close" onClick={close} className="fixed inset-0 z-[115] cursor-default bg-[rgba(8,7,16,0.5)] backdrop-blur-[12px]" />
          {body}
        </div>,
        document.body,
      ))}
    </div>
  );
}
