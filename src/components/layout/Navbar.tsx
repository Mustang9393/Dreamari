import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <nav className="relative z-10 flex w-full items-center justify-between gap-6 py-2">
      <Link href="/" aria-label="Dreamari home">
        <Image
          src="/images/dreamari-logo.svg"
          alt="Dreamari"
          width={145}
          height={19}
          priority
          className="h-5 w-auto"
        />
      </Link>

      <div className="flex items-center gap-8">
        <ul className="hidden items-center gap-8 text-base font-semibold text-ink-200 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Button variant="nav" href="#get-started">
          Get started free
        </Button>
      </div>
    </nav>
  );
}
