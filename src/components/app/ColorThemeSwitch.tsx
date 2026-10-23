"use client";

// DEMO-ONLY: the color theme switch. Black & Blue (src/app/look-v2.css) is
// the default; this switch is for Classic (19 Oct 2026, Chandu: "lets have
// black and blue be the default and the switch to be done for classic").
// A small control fixed to the bottom-left, so the team can flip themes on
// any screen while reviewing (19 Oct 2026, Chandu: "a small control on the
// bottom of the page on the left to toggle the color theme. Remove from the
// hamburger menu."). Same state as ?look=v2 / ?look=v1. Not on the Counselor
// Dashboard (its own app and look) and never printed.
import { usePathname } from "next/navigation";
import { setLookV2, useLookV2 } from "./look";

// One quiet switch, like My Profile's "V2 PROFILE" toggle (19 Oct 2026,
// Chandu: "the black and blue/classic is too big and sitting over the
// design... shouldnt be in my face and so prominent"): a muted label and a
// mini track, no panel, dimmed until hovered or focused. On = Classic.
/** `inline`: rendered inside PreviewSwitches' landmark, which does the fixed positioning */
export function ColorThemeSwitch({ inline = false }: { inline?: boolean } = {}) {
  const lookV2 = useLookV2();
  const path = usePathname() ?? "";
  if (path === "/counselor" || path.startsWith("/counselor/")) return null;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!lookV2}
      aria-label="Classic color theme"
      onClick={() => setLookV2(!lookV2)}
      // marketing-v2 themeable: the app's colour variables live in that scope;
      // the fallbacks cover routes that never load tokens.css. Desktop only,
      // in the empty bottom-left corner: phones and tablets have no free
      // corner (it sat over the cards), and ?look=v2 / ?look=v1 still switch
      // the theme there.
      // 23 Oct 2026 (WCAG audit): the label reads at AA at rest (it was 55%
      // opacity, 1.5:1 to 2.7:1), the control is 24px tall (2.5.8), and both
      // preview switches live in one landmark (PreviewSwitches.tsx)
      className={`${inline ? "" : "marketing-v2 themeable no-print fixed bottom-[12px] left-[12px] z-[45] hidden lg:flex"} min-h-[24px] cursor-pointer items-center gap-[7px] rounded-[var(--radius-sm,6px)] px-[6px] py-[3px] text-[10.5px] leading-[14px] font-semibold tracking-[0.06em] uppercase opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 ${inline ? "flex" : ""}`}
      style={{
        background: "transparent",
        color: "var(--muted-foreground, rgba(255,255,255,0.62))",
        fontFamily: "var(--font-body)",
        minHeight: 24,
      }}
    >
      Classic
      <span aria-hidden className="relative h-[14px] w-[24px] flex-none rounded-full transition-colors" style={{ background: !lookV2 ? "var(--primary, #2f6bf2)" : "color-mix(in srgb, var(--foreground, #f4f7ff) 22%, transparent)" }}>
        <span className="absolute top-[2px] size-[10px] rounded-full bg-white transition-[left] duration-200" style={{ left: !lookV2 ? 12 : 2 }} />
      </span>
    </button>
  );
}
