"use client";

import Link from "next/link";
import { MarketingButton } from "./Button";

type NavProps = {
  onSchoolsClick: () => void;
};

const LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Simulations", href: "#play" },
  { label: "Career worlds", href: "#explore" },
];

export function Nav({ onSchoolsClick }: NavProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b transition-[background] duration-300"
      style={{ background: "var(--nav-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 min-[480px]:h-[76px]">
        <div className="flex items-center gap-2 text-[19px] font-extrabold" style={{ color: "var(--foreground)" }}>
          <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 12px 2px var(--primary)" }} />
          DREAMARI
        </div>
        {/* Reference hides nav-links below 900px (not Tailwind's 768px md: tier) — at
            768-899px there isn't room for four links + Sign in + the CTA on one line
            without wrapping, which is exactly what showing them at md: caused. */}
        <nav className="hidden gap-[30px] text-[14px] font-semibold min-[900px]:flex" style={{ color: "var(--muted-foreground)" }}>
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="transition-colors hover:[color:var(--foreground)]">
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={onSchoolsClick} className="transition-colors hover:[color:var(--foreground)]">
            For schools
          </button>
        </nav>
        <div className="flex items-center gap-2.5 min-[480px]:gap-4">
          <Link href="#" className="hidden text-[14px] font-semibold opacity-75 hover:opacity-100 min-[480px]:inline" style={{ color: "var(--foreground)" }}>
            Sign in
          </Link>
          <MarketingButton variant="primary" href="/flow" className="!px-4 !py-[11px] !text-[13px] min-[480px]:!px-6 min-[480px]:!py-3 min-[480px]:!text-sm">
            Get started free
          </MarketingButton>
        </div>
      </div>
    </header>
  );
}
