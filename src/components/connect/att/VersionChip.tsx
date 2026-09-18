"use client";

// Demo only: which build of the AT&T board is showing. The live board is
// v1 (Joshua's Replit, faithfully); v2.0 is the reach-first rebuild. A
// small muted chip beside the Demo chip, never part of the product UI
// (direct instruction, 18 Sept 2026: "a small toggle for demo's sake...
// not huge and distracting").
export type AttVersion = "v1" | "v2";

export function VersionChip({ version, onChange }: { version: AttVersion; onChange: (v: AttVersion) => void }) {
  return (
    <div role="tablist" aria-label="Board version" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)" }}>
      {([["v1", "v1"], ["v2", "v2.0"]] as const).map(([key, label]) => {
        const on = key === version;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(key)}
            className="dm-quiet cursor-pointer rounded-[4px] px-[7px] py-[1px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
            style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
