import Link from "next/link";
import { HomeIcon } from "./icons";

export function HomeButton() {
  return (
    <Link
      href="/"
      aria-label="Back to home"
      className="fixed top-5 left-5 z-20 flex size-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition-colors dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
    >
      <span className="size-5">
        <HomeIcon />
      </span>
    </Link>
  );
}
