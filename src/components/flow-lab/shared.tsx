"use client";

// DEMO-ONLY: pieces both Flow Lab versions share, so v2 and v3 are compared
// on identical chrome and the only visible difference is the flow itself.

import { Heart, Check, ChevronRight, X, ArrowLeftRight, Compass, Bookmark } from "lucide-react";
import { PosterCard } from "@/components/app/PosterCard";
import { IconTip } from "@/components/app/IconTip";
import { WORLDS, type LabCareer } from "./lab";

export const CARD = {
  background: "var(--card)",
  borderColor: "var(--glass-border)",
} as const;

export function StepHeader({ steps, current, title, helper }: { steps: string[]; current: number; title: string; helper?: string }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <ol className="flex flex-wrap items-center gap-[6px]" aria-label="Flow steps">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-[6px]">
            <span
              className="rounded-full border px-[10px] py-[3px] text-[11px] font-bold tracking-[0.06em] uppercase"
              style={{
                borderColor: i === current ? "var(--primary)" : "var(--glass-border)",
                background: i === current ? "color-mix(in srgb, var(--primary) 18%, transparent)" : i < current ? "color-mix(in srgb, #33C78C 14%, transparent)" : "transparent",
                color: i === current ? "var(--foreground)" : i < current ? "#33C78C" : "var(--muted-foreground)",
              }}
            >
              {i < current ? <Check className="mr-[4px] inline h-[10px] w-[10px]" aria-hidden /> : null}
              {s}
            </span>
            {i < steps.length - 1 && <ChevronRight className="h-[12px] w-[12px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />}
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-[4px]">
        <h1 className="text-[24px] leading-[1.15] font-extrabold sm:text-[30px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h1>
        {helper && <p className="max-w-[640px] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{helper}</p>}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-11 cursor-pointer items-center justify-center gap-[6px] rounded-full px-[22px] text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  );
}
export function QuietButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="dm-quiet flex h-11 cursor-pointer items-center justify-center gap-[6px] rounded-full border px-[18px] text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      {children}
    </button>
  );
}

/** A poster with a save/select control layered beside it (not inside it:
 *  the poster is itself a button, and a button inside a button is invalid). */
export function LabCard({ career, selected, selectLabel, unselectLabel, onToggle, onOpen, badge, chips }: { career: LabCareer; selected: boolean; selectLabel: string; unselectLabel: string; onToggle: () => void; onOpen?: () => void; badge?: string; chips?: string[] }) {
  return (
    <div className="relative flex flex-col gap-[8px]">
      <div className="relative">
        <PosterCard career={career} fill onClick={onOpen ?? onToggle} className={selected ? "ring-2 ring-[var(--primary)]" : ""} />
        {/* Positioning lives on IconTip itself: its wrapper is `relative`, so an
            `absolute` child would sit against the wrapper, not the poster. */}
        <IconTip label={selected ? unselectLabel : selectLabel} className="absolute top-2 right-2 z-[3]">
          <button
            type="button"
            aria-label={selected ? unselectLabel : selectLabel}
            aria-pressed={selected}
            onClick={onToggle}
            className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px]"
            style={{ background: selected ? "var(--primary)" : "rgba(5,8,20,0.78)", borderColor: selected ? "var(--primary)" : "rgba(255,255,255,0.16)", color: "#FFFFFF" }}
          >
            <Heart className="h-[16px] w-[16px]" aria-hidden fill={selected ? "currentColor" : "none"} />
          </button>
        </IconTip>
        {badge && (
          <span className="absolute bottom-2 left-2 z-[3] flex size-8 items-center justify-center rounded-full text-[13px] font-extrabold" style={{ background: "var(--primary)", color: "#FFFFFF", fontFamily: "var(--font-display)" }}>
            {badge}
          </span>
        )}
      </div>
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-[4px]">
          {chips.map((c) => (
            <span key={c} className="rounded-full border px-[8px] py-[2px] text-[10.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function InterestPicker({ value, max, onChange }: { value: string[]; max: number; onChange: (next: string[]) => void }) {
  const toggle = (label: string) => {
    if (value.includes(label)) onChange(value.filter((v) => v !== label));
    else if (value.length < max) onChange([...value, label]);
  };
  return (
    <div className="flex flex-wrap gap-[8px]">
      {WORLDS.map((w) => {
        const on = value.includes(w.label);
        const full = !on && value.length >= max;
        return (
          <button
            key={w.slug}
            type="button"
            aria-pressed={on}
            disabled={full}
            onClick={() => toggle(w.label)}
            className="dm-quiet cursor-pointer rounded-full border px-[14px] py-[8px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: "var(--foreground)" }}
          >
            {w.label}
          </button>
        );
      })}
    </div>
  );
}

/** The lab's Profile > Top 3 screen, shared by v2 and v3: Joshua's asks as
 *  written (prominent Explore more and Saved careers, obvious remove and
 *  replace). `saved` is whatever the version treats as the saved pool. */
export function TopThreeScreen({ top3, saved, poolLabel = "Saved careers", onExploreMore, onOpenSaved, onRemove, onReplace, replacing, setReplacing }: {
  top3: LabCareer[];
  saved: LabCareer[];
  poolLabel?: string;
  onExploreMore: () => void;
  onOpenSaved: () => void;
  onRemove: (id: string) => void;
  onReplace: (outId: string, inId: string) => void;
  replacing: string | null;
  setReplacing: (id: string | null) => void;
}) {
  const pool = saved.filter((s) => !top3.some((t) => t.id === s.id));
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center gap-[10px]">
        <PrimaryButton onClick={onExploreMore}><Compass className="h-[16px] w-[16px]" aria-hidden /> Explore more</PrimaryButton>
        <QuietButton onClick={onOpenSaved}><Bookmark className="h-[16px] w-[16px]" aria-hidden /> {poolLabel} ({saved.length})</QuietButton>
      </div>
      {top3.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-6)] text-center" style={CARD}>
          <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing in your Top 3 yet. Explore more or pull one in from {poolLabel.toLowerCase()}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
          {top3.map((c, i) => (
            <div key={c.id} className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-3)]" style={CARD}>
              <div className="relative">
                <PosterCard career={c} fill />
                <span className="absolute top-2 left-2 z-[3] flex size-8 items-center justify-center rounded-full text-[13px] font-extrabold" style={{ background: "var(--primary)", color: "#FFFFFF", fontFamily: "var(--font-display)" }}>#{i + 1}</span>
              </div>
              <div className="flex gap-[8px]">
                <button type="button" onClick={() => setReplacing(replacing === c.id ? null : c.id)} disabled={pool.length === 0} className="dm-quiet flex h-9 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-full border text-[12.5px] font-bold disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  <ArrowLeftRight className="h-[14px] w-[14px]" aria-hidden /> Replace
                </button>
                <button type="button" onClick={() => onRemove(c.id)} className="dm-quiet flex h-9 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-full border text-[12.5px] font-bold" style={{ borderColor: "color-mix(in srgb, #E0453C 45%, transparent)", color: "#E0453C" }}>
                  <X className="h-[14px] w-[14px]" aria-hidden /> Remove
                </button>
              </div>
              {replacing === c.id && (
                <div className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="text-[11.5px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Swap in from {poolLabel.toLowerCase()}</span>
                  {pool.map((p) => (
                    <button key={p.id} type="button" onClick={() => { onReplace(c.id, p.id); setReplacing(null); }} className="dm-quiet flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] px-[8px] py-[6px] text-left text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                      {p.title} <ChevronRight className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
