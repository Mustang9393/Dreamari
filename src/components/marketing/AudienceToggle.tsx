"use client";

type AudienceToggleProps = {
  view: "student" | "schools";
  onChange: (view: "student" | "schools") => void;
};

// Enterprise is disabled, not removed (15 Sept 2026): the schools/enterprise
// page is mid-redesign and shouldn't be reachable on the live site while
// that's in progress, but the toggle itself -- and the work behind it --
// stays intact locally so it can just be flipped back on when it's ready.
export const ENTERPRISE_ENABLED = false;

export function AudienceToggle({ view, onChange }: AudienceToggleProps) {
  return (
    <div className="inline-flex gap-1 rounded-xl border p-1" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}>
      {(["student", "schools"] as const).map((v) => {
        const disabled = v === "schools" && !ENTERPRISE_ENABLED;
        return (
          <button
            key={v}
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
            title={disabled ? "Coming soon" : undefined}
            onClick={disabled ? undefined : () => onChange(v)}
            className="rounded-lg px-[18px] py-[9px] text-[13px] font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
            style={
              view === v
                ? { background: "var(--primary)", color: "#fff", boxShadow: "0 4px 14px -4px rgba(47,107,242,.8)" }
                : { background: "transparent", color: "var(--muted-foreground)" }
            }
          >
            {v === "student" ? "Student" : "Enterprise"}
          </button>
        );
      })}
    </div>
  );
}
