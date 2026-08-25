"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Bookmark, ChevronDown, Gamepad2, Heart, Plus, ThumbsDown } from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { PosterCard } from "@/components/app/PosterCard";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { resolveCareer, similarCareers, type LadderRung } from "./data";
import { careerSlug } from "./slug";

// Career Detail — built from the Figma "Career Detail" screens (node
// 2591:3993), with the hierarchy/density refinements from direct feedback
// on top: Median Salary (not Starting Salary) + Degree Required + Common
// Majors as the three stat cards (Getting In dropped entirely), "Play Game"
// not "Try Game", the You-really-need/Also-helps skill chips removed, and no
// separate Education & Path section since degree + majors already sit in
// the stat row. Similar Careers uses the app's own PosterCard (Mika's browse
// card), not a one-off image.
//
// Type scale, held to exactly these five steps everywhere on this page
// (weight carries emphasis before a new size does, per direct feedback):
//   Career title   -> 36px Viaoda Libre (serif), the one place the poster
//                     display face is used for body chrome, not just cards.
//   Section heading -> 22px Montserrat Bold  ("Career Ladder", "Similar Careers", ...)
//   Key value       -> 16px Bricolage SemiBold (stat values, ladder job titles)
//   Body            -> 13px Montserrat (description, tab copy, one-liners)
//   Label/metadata  -> 10-11px Montserrat SemiBold, uppercase, muted

const HEADING = "text-[22px] leading-[28px] font-bold";
const KEY_VALUE = "text-[16px] leading-[22px] font-semibold";
const BODY = "text-[13px] leading-[18px]";
const LABEL = "text-[10px] leading-[14px] font-semibold tracking-[0.4px] uppercase";

function IconButton({ label, active = false, onClick, children }: { label: string; active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="dm-quiet flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border transition-transform duration-150 hover:-translate-y-px active:scale-95"
      style={{ background: "var(--glass-surface-1)", borderColor: active ? "var(--accent-subtle)" : "var(--glass-border)", color: active ? "var(--accent-subtle)" : "var(--foreground)" }}
    >
      {children}
    </button>
  );
}

function LadderRow({ rung }: { rung: LadderRung }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="dm-tap flex w-full cursor-pointer flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-5)] text-left"
      style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}
    >
      {/* Title and salary/chevron stack on a narrow phone (the salary's own
         24px display figure plus the chevron were flex-none siblings eating
         enough width to crush a two/three-word title into a ragged 3-line
         column) and share one row from sm: up, where there's room. */}
      <div className="flex w-full flex-col gap-[var(--space-3)] sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-[var(--space-4)]">
          <span className="flex size-9 flex-none items-center justify-center rounded-full border-[1.5px] text-[14px] font-bold" style={{ borderColor: "var(--muted-foreground)", color: "var(--foreground)" }}>
            {rung.number}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[2px] text-left">
            <span className={KEY_VALUE}>{rung.jobTitle}</span>
            {open && <span className={BODY} style={{ color: "var(--muted-foreground)" }}>{rung.oneLiner}</span>}
          </span>
        </div>
        <div className="flex flex-none items-center justify-end gap-[var(--space-3)]">
          <span className="flex-none text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{rung.salary}</span>
          <ChevronDown className="h-5 w-5 flex-none transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden />
        </div>
      </div>
    </button>
  );
}

export function CareerDetailExperience({ slug }: { slug: string }) {
  const router = useRouter();
  const career = resolveCareer(slug);
  const [tab, setTab] = useState<"do" | "example">("do");
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  if (!career) {
    return (
      <div className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col items-center justify-center gap-[var(--space-4)] px-5 text-center" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <p className="text-[20px] font-bold">We don&apos;t have that career yet.</p>
        <Link href="/explore?tab=browse" className="dm-solid flex min-h-[44px] items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          Back to Explore
        </Link>
      </div>
    );
  }

  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const similar = similarCareers(career);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 45%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 15%, transparent), transparent 60%), var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <div className="no-print">
        <DesktopNavigation active="Explore" />
      </div>
      <header className="no-print relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--space-6)] pb-[120px] md:pt-[var(--space-4)]">
        {/* Hero */}
        <section className="relative flex w-full flex-col overflow-hidden md:flex-row md:items-center md:gap-[var(--space-18)] md:rounded-[var(--radius-lg)]" style={{ minHeight: "300px" }}>
          <div className="absolute inset-0" aria-hidden>
            <Image src={career.photo} alt="" fill sizes="100vw" className="object-cover opacity-40 md:opacity-30" style={{ objectPosition: "top" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--background) 65%, transparent) 40%, var(--background) 100%)" }} />
          </div>
          <div className="relative z-[1] flex w-full flex-col items-start gap-[var(--space-3)] px-5 py-[var(--space-8)] md:max-w-[650px] md:px-8">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border"
              style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className={LABEL} style={{ color: accent }}>{career.world}</span>
            <h1 className="w-full text-[30px] leading-[36px] uppercase sm:text-[36px] sm:leading-[42px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>
              {career.title}
            </h1>
            {career.description && <p className={BODY} style={{ color: "var(--muted-foreground)" }}>{career.description}</p>}
            <div className="flex w-full flex-wrap items-center gap-[var(--space-3)]">
              <button
                type="button"
                className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
                style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-display)" }}
              >
                Play Game <Gamepad2 className="h-4 w-4" aria-hidden />
              </button>
              <div className="flex items-center gap-[var(--space-2)]">
                <IconButton label="Add to my list"><Plus className="h-5 w-5" aria-hidden /></IconButton>
                <IconButton label="Like this career" active={liked} onClick={() => { setLiked((v) => !v); if (!liked) setDisliked(false); }}>
                  <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} aria-hidden />
                </IconButton>
                <IconButton label="Not for me" active={disliked} onClick={() => { setDisliked((v) => !v); if (!disliked) setLiked(false); }}>
                  <ThumbsDown className="h-5 w-5" fill={disliked ? "currentColor" : "none"} aria-hidden />
                </IconButton>
                <IconButton label={saved ? "Saved" : "Save for later"} active={saved} onClick={() => setSaved((v) => !v)}>
                  <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} aria-hidden />
                </IconButton>
              </div>
            </div>
          </div>
        </section>

        <div className="flex w-full flex-col gap-[var(--space-6)] px-5 md:px-8">
          {/* Three quick facts only */}
          <div className="grid w-full grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
            {[
              { label: "Median Salary", value: career.medianSalary },
              { label: "Degree Required", value: career.degreeRequired },
              { label: "Common Majors", value: career.commonMajors },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-[var(--space-1)] rounded-[var(--radius-lg)] border p-[var(--space-4)] backdrop-blur-[8px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
                <span className={LABEL} style={{ color: "var(--muted-foreground)" }}>{stat.label}</span>
                <span className={KEY_VALUE}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* What They Actually Do | Real-life Example */}
          <div className="flex w-full flex-col gap-[var(--space-5)]">
            <div className="flex items-start gap-[var(--space-4)]">
              <button type="button" onClick={() => setTab("do")} className="flex cursor-pointer flex-col items-start gap-[var(--space-1)]">
                <span className={`${BODY} font-semibold`} style={{ color: tab === "do" ? "var(--foreground)" : "var(--muted-foreground)" }}>What They Actually Do</span>
                <span className="h-[2px] w-full" style={{ background: tab === "do" ? "var(--accent)" : "transparent" }} />
              </button>
              {career.realLifeExample && (
                <button type="button" onClick={() => setTab("example")} className="flex cursor-pointer flex-col items-start gap-[var(--space-1)]">
                  <span className={`${BODY} font-semibold`} style={{ color: tab === "example" ? "var(--foreground)" : "var(--muted-foreground)" }}>Real-life Example</span>
                  <span className="h-[2px] w-full" style={{ background: tab === "example" ? "var(--accent)" : "transparent" }} />
                </button>
              )}
            </div>
            <p className={`${KEY_VALUE} w-full`} style={{ fontFamily: "var(--font-display)" }}>
              {tab === "do" ? career.whatTheyActuallyDo : career.realLifeExample}
            </p>
          </div>

          {/* Career Ladder */}
          {career.ladder && career.ladder.length > 0 && (
            <section className="flex w-full flex-col gap-[var(--space-4)]">
              <h2 className={HEADING} style={{ fontFamily: "var(--font-body)" }}>Career Ladder</h2>
              <div className="flex w-full flex-col gap-[var(--space-4)]">
                {career.ladder.map((rung) => <LadderRow key={rung.number} rung={rung} />)}
              </div>
            </section>
          )}

          {/* 5 Common Softwares Needed — placeholder pending the real per-career
             list; flagged to the user, not final content. */}
          {career.software && career.software.length > 0 && (
            <section className="flex w-full flex-col gap-[var(--space-4)]">
              <h2 className={HEADING} style={{ fontFamily: "var(--font-body)" }}>{career.software.length} Common Softwares Needed</h2>
              <div className="flex flex-wrap gap-[var(--space-3)]">
                {career.software.map((name) => (
                  <span key={name} className={`${KEY_VALUE} rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)]`} style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
                    {name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Similar Careers — the real PosterCard grid */}
          {similar.length > 0 && (
            <section className="flex w-full flex-col gap-[var(--space-4)]">
              <h2 className={HEADING} style={{ fontFamily: "var(--font-body)", color: accent }}>Similar Careers</h2>
              <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0" style={{ touchAction: "pan-x pan-y" }}>
                {similar.map((c) => (
                  <PosterCard key={c.title} career={c} onClick={() => router.push(`/career/${careerSlug(c.title)}`)} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
