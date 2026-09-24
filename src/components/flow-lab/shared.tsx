"use client";

// DEMO-ONLY: pieces both Flow Lab versions share, so v2 and v3 are compared
// on identical chrome and the only visible difference is the flow itself.

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, Check, ChevronRight, X, ArrowLeftRight, Compass, ImageOff, Info, Plus } from "lucide-react";
import { BorderBeam } from "border-beam";
import { IconTip } from "@/components/app/IconTip";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { careerSlug } from "@/components/career/slug";
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

/** A small pill toggle row (worlds, subjects, path answers). */
export function ChipRow<T extends string>({ options, value, max, onChange, ariaLabel }: { options: { key: T; label: string }[]; value: T[]; max: number; onChange: (next: T[]) => void; ariaLabel: string }) {
  const toggle = (key: T) => {
    if (value.includes(key)) onChange(value.filter((v) => v !== key));
    else if (max === 1) onChange([key]);
    else if (value.length < max) onChange([...value, key]);
  };
  return (
    <div className="flex flex-wrap gap-[8px]" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const on = value.includes(o.key);
        const full = !on && max > 1 && value.length >= max;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            disabled={full}
            onClick={() => toggle(o.key)}
            className="dm-quiet cursor-pointer rounded-full border px-[14px] py-[8px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: "var(--foreground)" }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function InterestPicker({ value, max, onChange }: { value: string[]; max: number; onChange: (next: string[]) => void }) {
  return <ChipRow ariaLabel="Worlds" options={WORLDS.map((w) => ({ key: w.label, label: w.label }))} value={value} max={max} onChange={onChange} />;
}

function LabPhoto({ career, sizes }: { career: LabCareer; sizes: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    const worldColor = WORLD_COLORS[career.world] ?? "var(--muted-foreground)";
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(155deg, color-mix(in srgb, ${worldColor} 30%, var(--card)) 0%, var(--card) 100%)` }}>
        <ImageOff className="h-6 w-6" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </div>
    );
  }
  return <Image src={career.photo} alt="" fill sizes={sizes} draggable={false} onError={() => setFailed(true)} className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]" />;
}

export type LabControl = "save" | "pick" | "rank";

/** The lab's card is the live Match card's visual language, rebuilt on
 *  catalog data (direct feedback, 25 Sept 2026: "look fully designed just
 *  like we have match right now"): world title face, world-coloured label,
 *  salary chip when we have one, the BorderBeam "Learn more" chip, and the
 *  select control INSIDE the card. The old build layered a heart beside a
 *  PosterCard, whose own :hover jumps to z-index 5 and scale 1.09, so the
 *  heart vanished on hover. Card click opens the real Career Detail page
 *  (its Back returns here); the control toggles. */
export function LabCard({ career, control, selected, rank, onToggle, reasons, note }: {
  career: LabCareer;
  control: LabControl;
  selected: boolean;
  rank?: number;
  onToggle?: () => void;
  reasons?: string[];
  /** small line under the card, e.g. the one Build answer this matched */
  note?: string | null;
}) {
  const router = useRouter();
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const open = () => router.push(`/career/${careerSlug(career.title)}`);
  const label = control === "save" ? (selected ? `Unsave ${career.title}` : `Save ${career.title}`) : control === "pick" ? (selected ? `Remove ${career.title} from your Top 3` : `Add ${career.title} to your Top 3`) : `#${rank} ${career.title}`;
  const tip = control === "save" ? (selected ? "Unsave" : "Save") : control === "pick" ? (selected ? "Remove from Top 3" : "Add to Top 3") : `#${rank}`;
  return (
    <div className="flex flex-col gap-[8px]">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open ${career.title} details`}
        onClick={open}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
        className="group relative aspect-[210/297] w-full cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left transition-[transform,box-shadow] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:z-[5] hover:-translate-y-[3px] hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          borderColor: selected ? accent : "var(--glass-border)",
          boxShadow: selected ? `0 0 0 2px color-mix(in srgb, ${accent} 55%, transparent), 0 14px 30px -14px rgba(0,0,0,0.6)` : "0 8px 20px -14px rgba(0,0,0,0.5)",
        }}
      >
        <LabPhoto career={career} sizes="(max-width: 640px) 46vw, 300px" />
        <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100" style={{ background: "rgba(5,8,20,0.32)" }} />
        <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end">
          <div className="flex flex-none flex-col items-center gap-1.5 px-2 pt-14 pb-3 text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)" }}>
            <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4} strength={0.7} active>
              <span className="flex items-center gap-1 rounded-full px-2.5 py-[5px] text-[10.5px] font-semibold whitespace-nowrap normal-case backdrop-blur-md sm:gap-1.5 sm:px-3 sm:py-[6px] sm:text-[12px]" style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)", color: "var(--poster-title)" }}>
                <Info className="h-3 w-3 flex-none sm:h-3.5 sm:w-3.5" strokeWidth={2.5} aria-hidden />
                Learn more
              </span>
            </BorderBeam>
            <p className="line-clamp-3 [overflow-wrap:normal] [word-break:keep-all]" style={{ ...posterTitleFont(career.world), fontSize: 17, lineHeight: 1.15, color: "var(--poster-title)" }}>
              {career.title.replace(/-/g, "-​")}
            </p>
            <p className="text-[9px] font-semibold tracking-[0.06em]" style={{ fontFamily: "var(--font-body)", color: accent }}>{career.world}</p>
          </div>
        </div>
        {career.salary && (
          <span className="absolute top-2 left-2 z-[1] rounded-[var(--radius-sm)] border px-2 py-[3px] text-[10px] font-bold backdrop-blur-md" style={{ color: "var(--color-feedback-success)", borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 78%, transparent)" }}>
            {career.salary}
          </span>
        )}
        <IconTip label={tip} className="absolute top-2 right-2 z-[2]">
          {control === "rank" ? (
            <span aria-label={label} className="flex size-8 items-center justify-center rounded-full border-2 text-[13px] font-extrabold text-white" style={{ background: accent, borderColor: accent }}>{rank}</span>
          ) : (
            <button
              type="button"
              aria-pressed={selected}
              aria-label={label}
              onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 backdrop-blur-md transition-transform active:scale-90"
              style={{ background: selected ? accent : "color-mix(in srgb, var(--background) 55%, transparent)", borderColor: selected ? accent : "rgba(255,255,255,0.5)" }}
            >
              {control === "pick" && selected ? (
                <span className="text-[13px] font-extrabold text-white">{rank}</span>
              ) : control === "pick" ? (
                <Plus className="h-4 w-4 text-white" strokeWidth={2.75} aria-hidden />
              ) : (
                <Bookmark className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden fill={selected ? "currentColor" : "none"} />
              )}
            </button>
          )}
        </IconTip>
      </div>
      {(reasons?.length || note) ? (
        <div className="flex flex-wrap gap-[4px]">
          {reasons?.map((c) => (
            <span key={c} className="rounded-full border px-[8px] py-[2px] text-[10.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{c}</span>
          ))}
          {note && !reasons?.length && (
            <span className="rounded-full border px-[8px] py-[2px] text-[10.5px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`, color: "var(--foreground)" }}>Fits {note}</span>
          )}
        </div>
      ) : null}
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
              <LabCard career={c} control="rank" selected rank={i + 1} />
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
