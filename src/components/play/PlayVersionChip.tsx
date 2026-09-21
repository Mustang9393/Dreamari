"use client";

// A small demo-only toggle for trying alternate Glossary Game background
// treatments side by side, same idea as Connect's AT&T v1/v2.0 chip
// (att/VersionChip.tsx): never part of the product UI, just a quiet switch
// so each direction can be shown live without a separate deploy. v1 is the
// shipped default (Stars + berry backdrop); v2/v3/v4 are experiments.
export type PlayBgVersion = "v1" | "v2" | "v3" | "v4";

const OPTIONS: { key: PlayBgVersion; label: string }[] = [
  { key: "v1", label: "v1" },
  { key: "v2", label: "v2 CRT" },
  { key: "v3", label: "v3 Dots" },
  { key: "v4", label: "v4 Synth" },
];

export function PlayVersionChip({ version, onChange }: { version: PlayBgVersion; onChange: (v: PlayBgVersion) => void }) {
  return (
    <div role="tablist" aria-label="Background version" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 55%, transparent)" }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={opt.key === version}
          onClick={() => onChange(opt.key)}
          className="dm-quiet cursor-pointer rounded-[4px] px-[7px] py-[3px] text-[10px] leading-[14px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase"
          style={{
            background: opt.key === version ? "var(--glossary-accent)" : "transparent",
            color: opt.key === version ? "#05070f" : "var(--muted-foreground)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
