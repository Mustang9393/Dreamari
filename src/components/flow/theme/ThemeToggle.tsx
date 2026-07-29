"use client";

import { MoonIcon, SunIcon } from "../icons";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="fixed top-5 right-5 z-20 flex size-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition-colors dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
    >
      <span className="size-5">{theme === "light" ? <MoonIcon /> : <SunIcon />}</span>
    </button>
  );
}
