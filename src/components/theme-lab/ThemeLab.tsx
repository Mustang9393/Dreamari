"use client";

import { useState } from "react";
import { Check, ChevronDown, Info, Moon, Sun } from "lucide-react";
import { BackButton, DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";

// shadcn/ui recipes on Dreamari tokens. Every rule below mirrors shadcn's own
// component classes (new-york style), with color utilities written as
// var() arbitraries because this prototype doesn't map Tailwind color names.
// In the dev repo the identical look comes from bg-primary etc. via the
// @theme mapping — same variables, same computed styles.

const V = {
  bg: "var(--background)",
  fg: "var(--foreground)",
  card: "var(--card)",
  cardFg: "var(--card-foreground, var(--foreground))",
  popover: "var(--popover, var(--card))",
  primary: "var(--primary)",
  primaryFg: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  secondaryFg: "var(--secondary-foreground)",
  muted: "var(--muted)",
  mutedFg: "var(--muted-foreground)",
  accent: "var(--accent)",
  accentFg: "var(--accent-foreground, var(--foreground))",
  destructive: "var(--destructive)",
  border: "var(--border)",
  input: "var(--input, var(--glass-surface-2))",
  ring: "var(--ring, color-mix(in srgb, var(--primary) 50%, transparent))",
};

const TOKEN_BOARD: { name: string; bg: string; fg?: string }[] = [
  { name: "background", bg: V.bg, fg: V.fg },
  { name: "card", bg: V.card, fg: V.cardFg },
  { name: "popover", bg: V.popover, fg: V.cardFg },
  { name: "primary", bg: V.primary, fg: V.primaryFg },
  { name: "secondary", bg: V.secondary, fg: V.secondaryFg },
  { name: "muted", bg: V.muted, fg: V.mutedFg },
  { name: "accent", bg: V.accent, fg: V.accentFg },
  { name: "destructive", bg: V.destructive, fg: "#fff" },
  { name: "border", bg: V.border },
  { name: "input", bg: V.input },
  { name: "ring", bg: V.ring },
  { name: "chart-1", bg: "var(--chart-1, #2f6bf2)" },
  { name: "chart-2", bg: "var(--chart-2)" },
  { name: "chart-3", bg: "var(--chart-3)" },
  { name: "chart-4", bg: "var(--chart-4, #8b5cf6)" },
  { name: "chart-5", bg: "var(--chart-5, #00c8dc)" },
];

// Where each shadcn primitive shows up in the product. This is the dev's
// shopping list: install these, theme with tokens.css + shadcn-adapter.css,
// and every surface listed here is covered.
const INVENTORY: { name: string; usedIn: string }[] = [
  { name: "Button", usedIn: "every CTA: Export report, Find schools, Play Game / More Info, Start Study" },
  { name: "Badge", usedIn: "world labels, SIMULATION / GLOSSARY / GAME chips, readiness status, YOURS chip" },
  { name: "Tabs", usedIn: "Profile tab bar, Explore For You | Browse All, Routes Cards | Compare" },
  { name: "ToggleGroup", usedIn: "Explore filter + sort pills, build-flow chip picks" },
  { name: "Card", usedIn: "Career Report, route cards, activity cards, Glossary banner, college previews" },
  { name: "Accordion", usedIn: "Plan horizons, route card disclosure" },
  { name: "Input", usedIn: "Explore search, Add your own step, resume forms" },
  { name: "Checkbox", usedIn: "plan tasks" },
  { name: "Switch", usedIn: "Talent Pipeline opt-in, settings" },
  { name: "RadioGroup", usedIn: "build-flow single-choice steps" },
  { name: "Select", usedIn: "college lookup filters, location picks" },
  { name: "Slider", usedIn: "build flow cost step" },
  { name: "Dialog", usedIn: "swap sheet + career preview on desktop" },
  { name: "Sheet", usedIn: "same flows on mobile, match-lab guide + rank sheets" },
  { name: "DropdownMenu", usedIn: "quick-links hamburger, avatar menu" },
  { name: "Tooltip", usedIn: "icon-only controls (focus target, grip handle)" },
  { name: "Avatar", usedIn: "nav avatars, profile header, Connect posts" },
  { name: "Alert", usedIn: "readiness updates, system notices" },
  { name: "Progress", usedIn: "plan + glossary progress, readiness track" },
  { name: "Skeleton", usedIn: "loading rails and reports" },
  { name: "Separator", usedIn: "report stat dividers, menu separators" },
];

function Section({ title, note, usedIn, children }: { title: string; note?: string; usedIn?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
        {usedIn && <span className="text-[11px] font-semibold" style={{ color: "var(--accent-subtle)" }}>Used in: <span style={{ color: V.mutedFg }}>{usedIn}</span></span>}
        {note && <span className="text-[11px] font-semibold" style={{ color: V.mutedFg }}>{note}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-xl)] border p-5" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        {children}
      </div>
    </section>
  );
}

// ---- shadcn Button recipe (h-9 px-4 rounded-md text-sm font-medium) ----
function SButton({ variant = "default", size = "default", children }: { variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"; size?: "default" | "sm" | "lg"; children: React.ReactNode }) {
  const base = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] text-[14px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]";
  const sizes = { default: "h-9 px-4 py-2", sm: "h-8 px-3", lg: "h-10 px-6" } as const;
  const styles: Record<string, React.CSSProperties> = {
    default: { background: V.primary, color: V.primaryFg },
    secondary: { background: V.secondary, color: V.secondaryFg },
    outline: { background: "transparent", color: V.fg, border: `1px solid ${V.border}` },
    ghost: { background: "transparent", color: V.fg },
    destructive: { background: V.destructive, color: "#fff" },
    link: { background: "transparent", color: V.primary, textDecoration: "underline", textUnderlineOffset: 4 },
  };
  return (
    <button type="button" className={`${base} ${sizes[size]}`} style={styles[variant]}>
      {children}
    </button>
  );
}

function SBadge({ variant = "default", children }: { variant?: "default" | "secondary" | "outline" | "destructive"; children: React.ReactNode }) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: V.primary, color: V.primaryFg },
    secondary: { background: V.secondary, color: V.secondaryFg },
    outline: { color: V.fg, border: `1px solid ${V.border}` },
    destructive: { background: V.destructive, color: "#fff" },
  };
  return (
    <span className="inline-flex items-center rounded-[var(--radius-md)] px-2 py-0.5 text-[12px] font-semibold" style={styles[variant]}>
      {children}
    </span>
  );
}

export function ThemeLab() {
  const [light, setLight] = useState(false);
  const [tab, setTab] = useState("account");
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [world, setWorld] = useState("all");
  const [radio, setRadio] = useState("uni");
  const [accOpen, setAccOpen] = useState("h1");

  return (
    <div className="marketing-v2">
      <div className={light ? "theme-light" : ""} style={{ background: V.bg, color: V.fg, fontFamily: "var(--font-body)", minHeight: "100dvh" }}>
        <DesktopNavigation active="Profile" />
        <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
          <span className="flex items-center gap-3">
            <BackButton fallback="/home" />
            <Wordmark />
          </span>
          <QuickLinksMenu />
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-5 pt-6 pb-[140px] md:px-[var(--space-14)] md:pt-[var(--space-10)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[30px] leading-[34px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Theme Lab</h1>
              <p className="text-[13px]" style={{ color: V.mutedFg }}>shadcn/ui recipes on the Dreamari contract. Edit tokens.css or shadcn-adapter.css and this page follows.</p>
            </div>
            <button
              type="button"
              onClick={() => setLight((value) => !value)}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border px-4 text-[13px] font-semibold"
              style={{ borderColor: V.border, color: V.fg }}
            >
              {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {light ? "Dark" : "Light"}
            </button>
          </div>

          {/* Inventory: what the dev needs and where each piece appears */}
          <Section title="What the dev build needs" note="21 shadcn primitives cover the whole app; the shadcn branch lab renders them all for real">
            <div className="grid w-full grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {INVENTORY.map((item) => (
                <div key={item.name} className="flex items-baseline gap-2 text-[12px]">
                  <span className="w-[108px] flex-none font-bold">{item.name}</span>
                  <span style={{ color: V.mutedFg }}>{item.usedIn}</span>
                </div>
              ))}
            </div>
            <p className="w-full text-[11.5px]" style={{ color: V.mutedFg }}>
              Stays bespoke (not shadcn): Career Poster Card, Env Card, MatchRing, ReadinessMeter, compare bars, hero art. See docs/handoff/COMPONENT-MAP.md.
            </p>
          </Section>

          {/* Token board */}
          <Section title="Contract tokens" note="the variables every shadcn component reads">
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {TOKEN_BOARD.map((token) => (
                <div key={token.name} className="flex items-center gap-2 rounded-[var(--radius-md)] border p-2" style={{ borderColor: "var(--glass-border)" }}>
                  <span className="size-8 flex-none rounded-[6px] border" style={{ background: token.bg, borderColor: "var(--glass-border)" }} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[11.5px] font-bold">--{token.name}</span>
                    {token.fg && <span className="truncate text-[10px]" style={{ color: V.mutedFg }}>+ foreground</span>}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Button" usedIn="Export report, Find schools, Play Game, Start Study" note="default / secondary / outline / ghost / destructive / link · sm / default / lg">
            <SButton>Continue</SButton>
            <SButton variant="secondary">Secondary</SButton>
            <SButton variant="outline">Outline</SButton>
            <SButton variant="ghost">Ghost</SButton>
            <SButton variant="destructive">Delete</SButton>
            <SButton variant="link">Link</SButton>
            <SButton size="sm">Small</SButton>
            <SButton size="lg">Large</SButton>
          </Section>

          <Section title="Badge" usedIn="world labels, activity chips, readiness status, YOURS chip">
            <SBadge>Default</SBadge>
            <SBadge variant="secondary">Secondary</SBadge>
            <SBadge variant="outline">Outline</SBadge>
            <SBadge variant="destructive">Destructive</SBadge>
          </Section>

          <Section title="Tabs" usedIn="Profile tab bar, For You | Browse All, Cards | Compare" note="TabsList bg-muted, active trigger bg-background">
            <div className="inline-flex h-9 items-center justify-center rounded-[var(--radius-lg)] p-1" style={{ background: V.muted }}>
              {["account", "password", "team"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-3 py-1 text-[13px] font-medium capitalize transition-colors"
                  style={tab === id ? { background: V.bg, color: V.fg, boxShadow: "0 1px 2px rgba(0,0,0,0.2)" } : { color: V.mutedFg }}
                >
                  {id}
                </button>
              ))}
            </div>
          </Section>

          <Section title="ToggleGroup" usedIn="Explore filter + sort pills, build-flow chip picks" note="single-select, outline variant">
            <div className="inline-flex flex-wrap gap-0 rounded-[var(--radius-md)] border" style={{ borderColor: V.border }}>
              {[
                { id: "all", label: "All" },
                { id: "tech", label: "Tech & Engineering" },
                { id: "health", label: "Health & Medicine" },
                { id: "biz", label: "Business & Money" },
              ].map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={world === item.id}
                  onClick={() => setWorld(item.id)}
                  className={`cursor-pointer px-3 py-1.5 text-[13px] font-medium ${index > 0 ? "border-l" : ""}`}
                  style={{ borderColor: V.border, background: world === item.id ? V.accent : "transparent", color: world === item.id ? V.accentFg : V.fg }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Card" usedIn="Career Report, route cards, activity cards, college previews">
            <div className="w-full max-w-[360px] rounded-[var(--radius-xl)] border" style={{ background: V.card, borderColor: V.border, color: V.cardFg }}>
              <div className="flex flex-col gap-1 p-6 pb-3">
                <p className="text-[15px] font-semibold">Create project</p>
                <p className="text-[13px]" style={{ color: V.mutedFg }}>Deploy your new project in one click.</p>
              </div>
              <div className="flex flex-col gap-2 px-6 pb-3">
                <label className="text-[13px] font-medium">Name</label>
                <input
                  placeholder="Career Quest"
                  className="h-9 w-full rounded-[var(--radius-md)] border px-3 text-[14px] outline-none focus-visible:ring-[3px]"
                  style={{ background: "transparent", borderColor: V.input, color: V.fg, ["--tw-ring-color" as string]: V.ring } as React.CSSProperties}
                />
              </div>
              <div className="flex justify-end gap-2 p-6 pt-3">
                <SButton variant="outline">Cancel</SButton>
                <SButton>Deploy</SButton>
              </div>
            </div>
          </Section>

          <Section title="Accordion" usedIn="Plan levels, route card disclosure" note="border-b rows, chevron rotates">
            <div className="w-full max-w-[420px]">
              {[
                { id: "h1", title: "Next 3 Months · Foundation", body: "Finance glossary game · Explore 5 careers · IB mini game · Resume draft" },
                { id: "h2", title: "Next 6 Months · Skills + people", body: "Glossary Level 7 · Freshman Finance sim · Compare programs" },
              ].map((row) => (
                <div key={row.id} className="border-b" style={{ borderColor: V.border }}>
                  <button type="button" aria-expanded={accOpen === row.id} onClick={() => setAccOpen(accOpen === row.id ? "" : row.id)} className="flex w-full cursor-pointer items-center justify-between py-3 text-left text-[13.5px] font-semibold">
                    {row.title}
                    <ChevronDown className="h-4 w-4 transition-transform" style={{ color: V.mutedFg, transform: accOpen === row.id ? "rotate(180deg)" : "none" }} />
                  </button>
                  {accOpen === row.id && <p className="pb-3 text-[13px]" style={{ color: V.mutedFg }}>{row.body}</p>}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Input + Label + Separator" usedIn="Explore search, Add your own step, resume forms; report stat dividers">
            <div className="flex w-full max-w-[420px] flex-col gap-3">
              <label className="text-[13px] font-medium">Search</label>
              <input
                placeholder="Search careers, skills, worlds..."
                className="h-9 w-full rounded-[var(--radius-md)] border px-3 text-[14px] outline-none focus-visible:ring-[3px]"
                style={{ background: "transparent", borderColor: V.input, color: V.fg, ["--tw-ring-color" as string]: V.ring } as React.CSSProperties}
              />
              <div className="h-px w-full" style={{ background: V.border }} />
            </div>
          </Section>

          <Section title="Form controls" usedIn="plan tasks (Checkbox), Talent Pipeline opt-in (Switch), college lookup (Select), build-flow picks (RadioGroup) + cost step (Slider)" note="checkbox / switch / select / radio / slider">
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => setChecked((value) => !value)}
                className="flex size-4 cursor-pointer items-center justify-center rounded-[4px] border"
                style={{ background: checked ? V.primary : "transparent", borderColor: checked ? V.primary : V.input }}
              >
                {checked && <Check className="h-3 w-3" style={{ color: V.primaryFg }} />}
              </button>
              Accept terms
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={switched}
              onClick={() => setSwitched((value) => !value)}
              className="relative h-5 w-9 cursor-pointer rounded-full transition-colors"
              style={{ background: switched ? V.primary : V.input }}
            >
              <span className="absolute top-0.5 size-4 rounded-full transition-transform" style={{ background: V.bg, transform: switched ? "translateX(18px)" : "translateX(2px)" }} />
            </button>
            <button type="button" className="flex h-9 w-[200px] cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-3 text-[14px]" style={{ borderColor: V.input, color: V.mutedFg }}>
              Pick a career world <ChevronDown className="h-4 w-4 opacity-60" />
            </button>
                      <span className="flex items-center gap-4" role="radiogroup" aria-label="Pathway type">
              {[
                { id: "uni", label: "University" },
                { id: "cc", label: "Community college" },
                { id: "trade", label: "Trade school" },
              ].map((item) => (
                <label key={item.id} className="flex cursor-pointer items-center gap-2 text-[13.5px]">
                  <button type="button" role="radio" aria-checked={radio === item.id} onClick={() => setRadio(item.id)} className="flex size-4 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: radio === item.id ? V.primary : V.input }}>
                    {radio === item.id && <span className="size-2 rounded-full" style={{ background: V.primary }} />}
                  </button>
                  {item.label}
                </label>
              ))}
            </span>
            <span className="flex w-full max-w-[300px] flex-col gap-2">
              <span className="relative h-1.5 w-full rounded-full" style={{ background: V.secondary }}>
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: "40%", background: V.primary }} />
                <span className="absolute top-1/2 left-[40%] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ background: V.bg, borderColor: V.primary }} />
              </span>
              <span className="text-[12px]" style={{ color: V.mutedFg }}>Slider · build flow cost step · up to $40K</span>
            </span>
          </Section>

          <Section title="Overlays" usedIn="swap sheet + preview (Dialog desktop, Sheet mobile), quick-links menu (DropdownMenu), icon-control hints (Tooltip)" note="panels rendered inline for review">
            <div className="w-full max-w-[380px] rounded-[var(--radius-xl)] border p-6 shadow-2xl" style={{ background: V.popover, borderColor: V.border, color: V.cardFg }}>
              <p className="text-[15px] font-semibold">Swap out a career?</p>
              <p className="mt-1 text-[13px]" style={{ color: V.mutedFg }}>Private Equity goes back to your locker. Nothing is lost.</p>
              <div className="mt-4 flex justify-end gap-2">
                <SButton variant="outline">Cancel</SButton>
                <SButton>Swap</SButton>
              </div>
            </div>
            <div className="w-[190px] rounded-[var(--radius-md)] border p-1 shadow-xl" style={{ background: V.popover, borderColor: V.border }}>
              {["My Profile", "Career Report", "Settings"].map((item, index) => (
                <div key={item} className="cursor-pointer rounded-[6px] px-2 py-1.5 text-[13.5px]" style={index === 0 ? { background: V.accent, color: V.accentFg } : { color: V.fg }}>
                  {item}
                </div>
              ))}
              <div className="my-1 h-px" style={{ background: V.border }} />
              <div className="cursor-pointer rounded-[6px] px-2 py-1.5 text-[13.5px]" style={{ color: V.destructive }}>Log out</div>
            </div>
                      <div className="w-full max-w-[380px] rounded-t-[var(--radius-xl)] border border-b-0 p-5 pb-8 shadow-2xl" style={{ background: V.popover, borderColor: V.border, color: V.cardFg }}>
              <p className="text-[15px] font-semibold">Rank your Top 3</p>
              <p className="mt-1 text-[13px]" style={{ color: V.mutedFg }}>Sheet (bottom) · the same flows on mobile. Drag to reorder; your first pick leads the report.</p>
            </div>
            <span className="flex items-center gap-3">
              <SButton variant="ghost">Hover me</SButton>
              <span className="rounded-[var(--radius-md)] px-3 py-1.5 text-[12px] font-medium" style={{ background: V.primary, color: V.primaryFg }}>Tooltip · match score comes from what you do</span>
            </span>
          </Section>

          <Section title="Avatar" usedIn="nav avatars (desktop + mobile tab), profile header, Connect posts">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/avatar-jordan.jpg" alt="Jordan Rivera" className="size-10 rounded-full border object-cover" style={{ borderColor: V.border }} />
            <span className="flex size-10 items-center justify-center rounded-full text-[13px] font-bold" style={{ background: V.muted, color: V.fg }}>MW</span>
          </Section>

          <Section title="Feedback" usedIn="readiness updates, plan progress, loading rails" note="alert / progress / skeleton">
            <div className="flex w-full max-w-[420px] items-start gap-3 rounded-[var(--radius-lg)] border p-4" style={{ background: V.card, borderColor: V.border }}>
              <Info className="mt-0.5 h-4 w-4 flex-none" style={{ color: V.primary }} />
              <span className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold">Readiness updated</span>
                <span className="text-[12.5px]" style={{ color: V.mutedFg }}>Passing the triage scenario moved you up 4 points.</span>
              </span>
            </div>
            <div className="h-2 w-[240px] overflow-hidden rounded-full" style={{ background: V.secondary }}>
              <div className="h-full w-[62%] rounded-full" style={{ background: V.primary }} />
            </div>
            <div className="flex w-[240px] flex-col gap-2">
              <div className="h-4 w-3/4 animate-pulse rounded-[4px]" style={{ background: V.muted }} />
              <div className="h-4 w-1/2 animate-pulse rounded-[4px]" style={{ background: V.muted }} />
            </div>
          </Section>

          <p className="text-[12px]" style={{ color: V.mutedFg }}>
            Class recipes mirror shadcn/ui; colors resolve via tokens.css + docs/handoff/shadcn-adapter.css. The dev repo gets identical rendering through the Tailwind @theme mapping (see COMPONENT-MAP.md).
          </p>
        </main>

        <MobileNav active="Profile" />
      </div>
    </div>
  );
}
