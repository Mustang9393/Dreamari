"use client";

// DEMO-ONLY: A/B switches for the counselor builds (Chandu, 7 Oct 2026:
// "have toggles to A/B things we're not sure of and explain why"). Each
// switch sits next to the thing it changes, never in a master panel (the
// 7 Oct lesson from the Multicolor toggle), and its info tip says what is
// being compared and why it is open. Remembered per browser so a demo stays
// on the chosen side. Remove a switch once the team decides.

import { useSyncExternalStore } from "react";
import { Info } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";

const KEY = "dreamari:counselor-ab";
const EVENT = "dreamari:counselor-ab";

function readAll(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}

export function useAB<K extends string>(test: string, fallback: K): [K, (v: K) => void] {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(KEY) ?? "{}", () => "{}");
  let value = fallback;
  try { value = ((JSON.parse(raw) as Record<string, string>)[test] as K) ?? fallback; } catch { /* keep the fallback */ }
  const set = (v: K) => {
    try { localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [test]: v })); } catch { /* storage blocked */ }
    window.dispatchEvent(new Event(EVENT));
  };
  return [value, set];
}

/** A small two-way switch with an info tip explaining the test. */
export function ABSwitch<K extends string>({ test, options, fallback, why }: { test: string; options: { key: K; label: string }[]; fallback: K; why: string }) {
  const [value, set] = useAB<K>(test, fallback);
  return (
    <span className="inline-flex flex-none items-center gap-[6px]">
      <span role="group" aria-label={`Compare: ${options.map((o) => o.label).join(" or ")}`} className="seg-track inline-flex h-[30px] items-center gap-[2px] rounded-[10px] p-[2px]" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
        {options.map((o) => {
          const on = o.key === value;
          return (
            <button key={o.key} type="button" aria-pressed={on} onClick={() => set(o.key)}
              className={`seg-item dm-quiet flex h-full cursor-pointer items-center rounded-[8px] px-[10px] text-[12px] whitespace-nowrap ${on ? "font-semibold text-[color:var(--foreground)]" : "font-medium text-[color:var(--muted-foreground)]"}`}
              style={{ background: on ? "color-mix(in srgb, var(--foreground) 16%, transparent)" : "transparent" }}>
              {o.label}
            </button>
          );
        })}
      </span>
      <IconTip label={why}>
        <span tabIndex={0} aria-label={`Why this is a test: ${why}`} className="flex size-[26px] cursor-help items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <Info className="h-[15px] w-[15px]" aria-hidden />
        </span>
      </IconTip>
    </span>
  );
}
