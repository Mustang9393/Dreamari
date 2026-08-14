import Link from "next/link";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Build", href: "#build" },
      { label: "Match", href: "#match" },
      { label: "Explore", href: "#explore" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "For schools", href: "#" },
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t px-6 py-10 sm:mt-16 sm:py-14" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 font-extrabold" style={{ color: "var(--foreground)", fontSize: 19 }}>
          <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 12px 2px var(--primary)" }} />
          DREAMARI
        </div>
        <div className="flex gap-16">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <div className="text-[12px] font-bold tracking-wide uppercase" style={{ color: "var(--muted-foreground)" }}>
                {col.heading}
              </div>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href} className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div
        className="mx-auto mt-12 max-w-[1200px] border-t pt-6 font-mono text-[12.5px]"
        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
      >
        © 2026 Dreamari · Discover, don&apos;t guess.
      </div>
    </footer>
  );
}
