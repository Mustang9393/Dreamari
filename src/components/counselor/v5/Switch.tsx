"use client";

// v5's switches, one design per level (9 Oct 2026, Chandu: "make the tabs
// and subtabs follow some sort of hierarchy and consistent designs... not
// just v4, v5 too"). Level 1 is the top pill bar (V5App), level 2 the soft
// underline TextTabs under a page title. Below those:
//
//  3. PillSwitch: changes what the whole page body shows (Explore's All
//     pathways / Skilled trades, Documents' three views, Engagement's year).
//     The student app's segmented switch (seg-track / seg-item, with their
//     light-mode treatment in globals.css), one size everywhere.
//  4. CardTabs: changes one card's content (Logins by Day / Month / Student).
//     A compact text underline, smaller than the page nav so it reads as
//     part of the card and never as a second page nav.
//
// A filter stays a dropdown. Counts print as "Label (4)" at both levels.

import type { KeyboardEvent } from "react";

export type SwitchItem<K extends string> = { key: K; label: string; count?: number };

const text = <K extends string>(it: SwitchItem<K>) => (it.count === undefined ? it.label : `${it.label} (${it.count})`);

export function PillSwitch<K extends string>({ items, value, onChange, label, className = "" }: { items: SwitchItem<K>[]; value: K; onChange: (k: K) => void; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={`seg-track inline-flex h-[40px] max-w-full flex-none items-center gap-[2px] self-start overflow-x-auto rounded-[12px] p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`} style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button key={it.key} type="button" aria-pressed={on} onClick={() => onChange(it.key)}
            className={`seg-item ${on ? "" : "dm-quiet "}flex h-full flex-none cursor-pointer items-center rounded-[9px] px-[14px] text-[13px] leading-[16px] whitespace-nowrap tabular-nums ${on ? "font-semibold text-[color:var(--foreground)] shadow-[0_1px_3px_rgba(0,0,0,0.35)]" : "font-medium text-[color:var(--muted-foreground)]"}`}
            style={{ background: on ? "color-mix(in srgb, var(--foreground) 16%, transparent)" : "transparent" }}>
            {text(it)}
          </button>
        );
      })}
    </div>
  );
}

export function CardTabs<K extends string>({ items, value, onChange, label, className = "" }: { items: SwitchItem<K>[]; value: K; onChange: (k: K) => void; label: string; className?: string }) {
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    onChange(items[next].key);
    (e.currentTarget.parentElement?.children[next] as HTMLButtonElement | undefined)?.focus();
  };
  return (
    // data-text-tabs: inside v4 this keeps its underline instead of v4's pill
    <div role="tablist" data-text-tabs aria-label={label} className={`flex max-w-full items-center gap-[16px] overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`} style={{ borderColor: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
      {items.map((it, i) => {
        const on = it.key === value;
        return (
          <button key={it.key} type="button" role="tab" aria-selected={on} tabIndex={on ? 0 : -1} onClick={() => onChange(it.key)} onKeyDown={(e) => onKey(e, i)}
            className={`relative flex h-[32px] flex-none cursor-pointer items-center text-[12.5px] leading-[16px] whitespace-nowrap tabular-nums ${on ? "font-semibold" : "dm-quiet font-medium"}`}
            style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {text(it)}
            {on && <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] rounded-full" style={{ background: "var(--accent)" }} />}
          </button>
        );
      })}
    </div>
  );
}
