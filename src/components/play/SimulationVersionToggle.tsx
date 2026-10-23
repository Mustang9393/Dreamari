"use client";

import { useRouter } from "next/navigation";

export type SimulationVersionSwitch = { basePath: string; version: 1 | 2 };

/** Switch whole authored games, restarting at their own beginning. */
export function SimulationVersionToggle({ basePath, version, accent, size = "hud" }: SimulationVersionSwitch & { accent: string; size?: "start" | "hud" }) {
  const router = useRouter();
  const start = size === "start";
  return (
    <div role="group" aria-label="Simulation version" className="flex flex-none items-center gap-[2px] rounded-[11px] border p-[3px]" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 76%, transparent)" }}>
      {([1, 2] as const).map((option) => (
        <button key={option} type="button" aria-pressed={version === option}
          onClick={() => { if (version !== option) router.push(`${basePath}${option === 2 ? "?v=2" : ""}`, { scroll: false }); }}
          className={`dm-quiet cursor-pointer rounded-[8px] font-extrabold tabular-nums ${start ? "min-h-[36px] px-[14px] text-[12.5px]" : "min-h-[28px] px-[10px] text-[11px]"}`}
          style={{ background: version === option ? `color-mix(in srgb, ${accent} 24%, var(--background))` : "transparent", color: "var(--foreground)", boxShadow: version === option ? `inset 0 0 0 1px ${accent}` : undefined }}>
          v{option}
        </button>
      ))}
    </div>
  );
}
