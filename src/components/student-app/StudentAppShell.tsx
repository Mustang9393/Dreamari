"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  BriefcaseIcon,
  CompassIcon,
  HomeIcon,
  MoonIcon,
  StarIcon,
  SunIcon,
  TargetIcon,
} from "@/components/flow/icons";
import { useTheme } from "@/components/flow/theme/ThemeProvider";

export type StudentAppTab = "home" | "explore" | "play" | "community" | "profile";

const tabs: Array<{ id: StudentAppTab; label: string; href: string; icon: ReactNode }> = [
  { id: "home", label: "Home", href: "/home", icon: <HomeIcon /> },
  { id: "explore", label: "Explore", href: "/home?tab=explore", icon: <CompassIcon /> },
  { id: "play", label: "Play", href: "/home?tab=play", icon: <TargetIcon /> },
  { id: "community", label: "Community", href: "/home?tab=community", icon: <StarIcon /> },
  { id: "profile", label: "Profile", href: "/career-report", icon: <BriefcaseIcon /> },
];

type AppNavigationProps = {
  activeTab: StudentAppTab;
  onSelect?: (tab: StudentAppTab) => void;
};

function NavigationItem({ item, active, onSelect, mobile = false }: { item: (typeof tabs)[number]; active: boolean; onSelect?: (tab: StudentAppTab) => void; mobile?: boolean }) {
  const className = mobile
    ? `flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[9px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-secondary)] sm:px-2 sm:text-[10px] ${active ? "text-[var(--color-action-primary)]" : "text-[var(--component-home-navigation-text)]"}`
    : `inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)] ${active ? "bg-[var(--component-home-navigation-active-background)] text-[var(--component-home-navigation-active-text)]" : "text-[var(--component-home-navigation-text)] hover:bg-[var(--component-home-navigation-hover-background)] hover:text-[var(--component-home-shell-text)]"}`;
  const content = (
    <>
      {mobile ? <span className="size-5">{item.icon}</span> : item.id === "home" ? <span className="size-4">{item.icon}</span> : null}
      <span>{item.label}</span>
    </>
  );

  if (onSelect) {
    return <button type="button" onClick={() => onSelect(item.id)} aria-current={active ? "page" : undefined} className={className}>{content}</button>;
  }

  return <Link href={item.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>;
}

export function DreamariBrand({ context }: { context?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link href="/" aria-label="Dreamari landing page" className="rounded-lg font-display text-lg font-extrabold tracking-[-0.04em] text-[var(--component-home-shell-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-action-secondary)] sm:text-xl">
        DREAMARI
      </Link>
      {context ? <><span className="hidden h-5 w-px bg-[var(--component-home-navigation-border)] sm:block" aria-hidden="true" /><span className="hidden truncate text-xs font-bold text-[var(--component-home-navigation-text)] sm:block">{context}</span></> : null}
    </div>
  );
}

export function StudentAppHeader({ activeTab, onSelect, context }: AppNavigationProps & { context?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-background)]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-10">
        <DreamariBrand context={context} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Dreamari student app">
          {tabs.filter((item) => item.id !== "profile").map((item) => <NavigationItem key={item.id} item={item} active={activeTab === item.id} onSelect={onSelect} />)}
        </nav>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="hidden rounded-full border border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-hover-background)] px-3 py-2 text-xs font-extrabold text-[var(--component-home-shell-text)] sm:inline-flex"><StarIcon className="mr-1.5 size-4 text-[var(--component-home-navigation-reward)]" />15,980 XP</span>
          <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"} className="flex size-10 items-center justify-center rounded-full border border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-hover-background)] text-[var(--component-home-navigation-text)] transition-colors hover:text-[var(--component-home-shell-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]"><span className="size-4">{theme === "dark" ? <SunIcon /> : <MoonIcon />}</span></button>
          <Link href="/career-report" aria-label="Open career profile" aria-current={activeTab === "profile" ? "page" : undefined} className={`flex size-10 items-center justify-center rounded-full text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)] ${activeTab === "profile" ? "ring-2 ring-[var(--color-action-secondary)] ring-offset-2 ring-offset-[var(--component-home-navigation-background)]" : ""} text-[var(--component-home-navigation-active-text)]`} style={{ background: "color-mix(in srgb, var(--component-home-navigation-active-background) 82%, black)" }}>AK</Link>
        </div>
      </div>
    </header>
  );
}

export function StudentAppBottomNav({ activeTab, onSelect }: AppNavigationProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-background)]/95 px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden" aria-label="Dreamari student app tabs">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map((item) => <NavigationItem key={item.id} item={item} active={activeTab === item.id} onSelect={onSelect} mobile />)}
      </div>
    </nav>
  );
}

export function DreamHorizon() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-52 left-1/2 h-80 w-[80rem] -translate-x-1/2 rounded-[50%] border border-[var(--color-action-secondary)]/25 bg-[var(--color-action-primary)]/8 blur-[1px]" />
      <div className="absolute top-8 left-1/2 h-40 w-[56rem] -translate-x-1/2 rounded-[50%] bg-[var(--color-action-primary)]/8 blur-[72px]" />
    </div>
  );
}
