"use client";

type AudienceToggleProps = {
  view: "student" | "schools";
  onChange: (view: "student" | "schools") => void;
};

export function AudienceToggle({ view, onChange }: AudienceToggleProps) {
  return (
    <div className="inline-flex gap-1 rounded-full border p-1" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}>
      {(["student", "schools"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className="rounded-full px-[18px] py-[9px] text-[13px] font-bold transition-all duration-200"
          style={
            view === v
              ? { background: "var(--primary)", color: "#fff", boxShadow: "0 4px 14px -4px rgba(47,107,242,.8)" }
              : { background: "transparent", color: "var(--muted-foreground)" }
          }
        >
          {v === "student" ? "Student" : "Enterprise"}
        </button>
      ))}
    </div>
  );
}
