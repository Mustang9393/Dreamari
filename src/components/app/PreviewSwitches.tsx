"use client";

// DEMO-ONLY: the preview switches (Classic look, Storm sky) in one landmark,
// fixed to the bottom-left corner on desktop (23 Oct 2026, WCAG audit: each
// switch was a fixed button outside every landmark, flagged on all 33 routes
// by axe's region rule; one aside with a name fixes that). The switches keep
// their own routes rules (none on the Counselor Dashboard; Storm only in
// light mode).
import { ColorThemeSwitch } from "./ColorThemeSwitch";
import { WeatherSwitch } from "./WeatherSwitch";

export function PreviewSwitches() {
  return (
    <aside
      aria-label="Preview switches"
      className="marketing-v2 themeable no-print fixed bottom-[12px] left-[12px] z-[45] hidden items-center gap-[10px] lg:flex"
      style={{ minHeight: "auto" }}
    >
      <ColorThemeSwitch inline />
      <WeatherSwitch inline />
    </aside>
  );
}
