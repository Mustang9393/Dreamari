"use client";

// Second-level tabs: plain text with an underline, no container. Used for
// a filter that sits INSIDE a Segmented tab (direct instruction: "dont
// repeat tab components together. For example if questions etc are one
// tab system dont have the same design for the tabs inside it"), so the
// two levels never read as the same control stacked twice.

export function SubTabs<K extends string>({ options, value, onChange, ariaLabel }: { options: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void; ariaLabel: string }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex shrink-0 flex-wrap gap-x-[var(--space-5)] gap-y-[4px] border-b" style={{ borderColor: "var(--glass-border)" }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.key)}
            className="-mb-px flex cursor-pointer items-center gap-[6px] border-b-2 pt-[2px] pb-[8px] text-[13px] font-semibold transition-colors"
            style={{ borderColor: on ? "var(--primary)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}
          >
            {o.label}
            {typeof o.count === "number" && <span className="text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
