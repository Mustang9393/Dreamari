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
    // More transparent track (direct feedback, 16 Sept 2026): was already a
    // subtle 3%-white fill + 9%-white border, but against the hero's own
    // busy gradient it still read as a fairly solid pill. Dropped the fill
    // entirely and halved the border's opacity -- just a faint outline
    // holding the pill's shape, with the active segment's own contrast
    // (see below) doing all the actual "this is a control" signaling.
    <div className="inline-flex gap-1 rounded-xl border p-1" style={{ background: "transparent", borderColor: "color-mix(in srgb, var(--border) 55%, transparent)" }}>
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
            // Active state used to be the same brand blue + glow as the hero's
            // main CTA (var(--primary), matching rgba(47,107,242,...) shadow),
            // which put two "look at me" blue glows on the same screen and
            // fought the CTA for attention (direct feedback, 16 Sept 2026:
            // "so it doesnt compete with the main CTA"). A solid
            // var(--foreground) fill fixed that but swapped one loud thing
            // for another -- a full-white chip was its own attention-grab
            // (direct follow-up: "more subtle and not full white"). Settled
            // on a faint translucent wash instead of a solid color: enough
            // lift/contrast against the transparent track to read as
            // "selected" at a glance, without competing for the eye the way
            // either full-color or full-white did.
            style={
              view === v
                ? { background: "color-mix(in srgb, var(--foreground) 14%, transparent)", color: "var(--foreground)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--foreground) 18%, transparent)" }
                : { background: "transparent", color: "var(--muted-foreground)" }
            }
          >
            {v === "student" ? "Student" : "Schools"}
          </button>
        );
      })}
    </div>
  );
}
