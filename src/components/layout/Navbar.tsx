import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="relative z-10 flex w-full items-center py-2">
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
    </nav>
  );
}
