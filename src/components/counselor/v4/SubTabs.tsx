"use client";
// Level 3 of v4's tab hierarchy: the page view switch. One pill track with a
// blue selected pill, the same size on every page (9 Oct 2026, Chandu: "we
// have reviews, meetings, messages, assist tabs in prepare, then sub tabs
// inside reviews like awaiting me etc in a different size, then in meetings
// the tabs are a different design altogether... make the tabs and subtabs
// follow some sort of hierarchy"). Above it: the shell's area pills (1) and
// its underline page nav (2). Below it: `Segmented` (viz.tsx), the compact
// underline for a switch inside one card (4). Styled by the
// `.v4-content [role="tablist"]` pill rules in v4.css.
import { tabKeyDown } from "./viz";

export function SubTabs<K extends string>({ options, value, onChange, ariaLabel, className = "" }: {
  options: { key: K; label: string; count?: number }[];
  value: K;
  onChange: (key: K) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`v4-subtabs ${className}`}>
      {options.map((o, i) => (
        <button key={o.key} type="button" role="tab" aria-selected={o.key === value} tabIndex={o.key === value ? 0 : -1} onClick={() => onChange(o.key)} onKeyDown={(e) => tabKeyDown(e, i, options, onChange)}>
          <span>{o.label}</span>
          {o.count !== undefined && <small>({o.count})</small>}
        </button>
      ))}
    </div>
  );
}
