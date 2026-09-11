import Link from "next/link";
import { Wordmark } from "@/components/app/chrome";

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

// `relative` on the <footer> below isn't decorative — MarketingApp's ambient
// background div is `position: absolute`, and per CSS stacking rules ANY positioned
// element paints on top of ALL static siblings regardless of DOM order. Hero's and
// every ChapterShell's own `<section>` are already `position: relative` so they
// escape this, but Footer (plain, no positioning) was getting painted OVER by the
// ambient div's own fade-to-black layer near the bottom of the page — fully hidden,
// not just dimmed. Making Footer positioned too puts it in the same paint tier as
// the ambient div, where DOM order (Footer comes after it) governs and Footer
// correctly ends up on top.
// The Schools view combines the reference site's footer (the tagline under
// the mark, an Explore column) with ours (a Company column).
const SCHOOLS_COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Student Experience", href: "#student-experience" },
      { label: "For Your Organization", href: "#organization" },
      { label: "Request a demo", href: "#demo" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Why Dreamari", href: "#why-dreamari" },
      { label: "About", href: "#" },
      { label: "Contact", href: "mailto:product@dreamopportunity.org" },
    ],
  },
];

export function Footer({ view = "student" }: { view?: "student" | "schools" }) {
  const columns = view === "schools" ? SCHOOLS_COLUMNS : COLUMNS;
  return (
    <footer className="mkt-snap relative mt-10 border-t px-6 py-10 sm:mt-16 sm:py-14" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 sm:flex-row sm:justify-between">
        {/* the brand mark, the same Wordmark as every header (direct
           feedback, 5 Sept 2026: the logo, not a dot and a word) */}
        <div className="flex flex-col items-start gap-3">
          <Wordmark />
          {view === "schools" && (
            <p className="text-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Discover, don&apos;t guess.</p>
          )}
        </div>
        <div className="flex gap-16">
          {columns.map((col) => (
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
        className="mx-auto mt-12 max-w-[1200px] border-t pt-6 text-[12.5px]"
        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
      >
        © 2026 Dreamari{view === "schools" ? ". All rights reserved." : " · Discover, don't guess."}
      </div>
    </footer>
  );
}
